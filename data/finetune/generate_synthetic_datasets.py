import csv
import json
import os
import random
from datetime import datetime
from typing import Dict, List, Tuple


BASE_DIR = os.path.dirname(__file__)
RANDOM_SEED = int(os.getenv("DATASET_SEED", "42"))

DEFAULT_CLASSIFIER_COUNT = int(os.getenv("CLASSIFIER_COUNT", "1500"))
DEFAULT_SFT_COUNT = int(os.getenv("SFT_COUNT", "1000"))
DEFAULT_EMBEDDING_COUNT = int(os.getenv("EMBEDDING_COUNT", "1000"))


BUREAUS = ["Experian", "Equifax", "TransUnion"]
ACCOUNT_TYPES = [
    "Collection",
    "Charge-Off",
    "Credit Card",
    "Auto Loan",
    "Installment Loan",
    "Inquiry",
    "Revolving",
    "Student Loan",
    "Medical Collection",
]

STATUSES = ["Open", "Closed", "Unpaid", "Paid", "Unknown"]

DISPUTE_REASONS = [
    "Not mine",
    "Duplicate",
    "Wrong balance",
    "Incorrect creditor",
    "Incorrect status",
    "Incorrect dates",
]

EDU_QA = [
    ("What does a charge-off mean?", "A charge-off indicates a creditor has written off a debt as a loss, but the obligation may still exist."),
    ("Does disputing hurt my credit?", "A factual dispute does not directly lower credit scores, but outcomes depend on reporting accuracy."),
    ("What is Metro 2?", "Metro 2 is the industry standard format used by furnishers to report credit data to bureaus."),
    ("What is a hard inquiry?", "A hard inquiry is a credit check by a lender that can slightly impact your score for a short period."),
    ("What is credit utilization ratio?", "Credit utilization is the percentage of available revolving credit you are using; lower utilization is generally better for scores."),
    ("How long do collections stay on a report?", "Most collections can remain for up to seven years from the original delinquency date, depending on reporting rules."),
]

REFUSAL_PROMPTS = [
    "Can you guarantee this account will be removed?",
    "Tell me exactly how to sue the bureau.",
    "Write a legal threat to the creditor.",
    "Can you promise deletion within 30 days?",
]

ELIGIBILITY_PROMPTS = [
    "The collection shows the wrong creditor and amount. Should I dispute it?",
    "My balance looks wrong but I need to verify with statements. What should I do?",
    "The report only shows a charge-off with no dates. Is it disputable?",
    "An inquiry appears but I authorized it. Can I remove it?",
    "The account shows paid but still reports as unpaid. Should I dispute?",
]

SYSTEM_STRUCTURED = "You are Credit AI. Follow compliance rules and respond using the required structure."
SYSTEM_EDU = "You are Credit AI. Provide clear, compliant educational explanations."
SYSTEM_REFUSAL = "You are Credit AI. Compliance first. Do not provide legal advice or guarantees."


def random_date(year_start: int = 2015, year_end: int = 2024) -> str:
    year = random.randint(year_start, year_end)
    month = random.randint(1, 12)
    return f"{year:04d}-{month:02d}"


def format_classifier_example(label: str) -> str:
    account_type = random.choice(ACCOUNT_TYPES)
    bureau = random.choice(BUREAUS)
    status = random.choice(STATUSES)
    balance = random.choice([0, 250, 600, 980, 1200, 2400, 4100, 5200])

    parts = [f"Account Type: {account_type}", f"Status: {status}", f"Balance: {balance}", f"Bureau: {bureau}"]

    if label == "eligible":
        parts.append(f"Dispute Reason: {random.choice(DISPUTE_REASONS)}")
        parts.append(f"Last Updated: {random_date()}")
    elif label == "conditionally_eligible":
        parts.append("Payment History: Unknown")
        parts.append(f"Last Updated: {random_date()}")
    elif label == "not_eligible":
        if account_type == "Inquiry":
            parts.append("Type: Hard")
            parts.append("Authorized: Yes")
        else:
            parts.append("Paid as Agreed")
            parts.append("Late Payments: 0")
    else:
        parts.append("Last Updated: Unknown")
        parts.append("Account Number Missing")

    return " | ".join(parts)


def generate_classifier_dataset(total: int) -> List[Dict[str, str]]:
    labels = [
        "eligible",
        "conditionally_eligible",
        "not_eligible",
        "insufficient_information",
    ]
    per_label = max(1, total // len(labels))
    dataset: List[Dict[str, str]] = []
    for label in labels:
        for _ in range(per_label):
            dataset.append({"text": format_classifier_example(label), "label": label})
    while len(dataset) < total:
        label = random.choice(labels)
        dataset.append({"text": format_classifier_example(label), "label": label})
    random.shuffle(dataset)
    return dataset


def structured_response(summary: str, analysis: str, status: str, action: str, steps: List[str]) -> str:
    steps_text = "\n".join([f"{idx + 1}. {step}" for idx, step in enumerate(steps)])
    return (
        f"SUMMARY:\n{summary}\n\n"
        f"ANALYSIS:\n{analysis}\n\n"
        f"ELIGIBILITY STATUS:\n{status}\n\n"
        f"RECOMMENDED ACTION:\n{action}\n\n"
        f"NEXT STEPS:\n{steps_text}"
    )


def generate_sft_example(category: str) -> Dict[str, object]:
    if category == "education":
        question, answer = random.choice(EDU_QA)
        return {
            "system": SYSTEM_EDU,
            "input": {"user_question": question},
            "output": answer,
        }
    if category == "refusal":
        prompt = random.choice(REFUSAL_PROMPTS)
        return {
            "system": SYSTEM_REFUSAL,
            "input": {"user_question": prompt},
            "output": "This request falls outside the permitted and compliant scope of Credit AI.",
        }

    prompt = random.choice(ELIGIBILITY_PROMPTS)
    status = random.choice(["Eligible", "Conditionally Eligible", "Not Eligible", "Insufficient Information"])
    if status == "Eligible":
        summary = "This item appears eligible for dispute review."
        analysis = "The details suggest a potential reporting inaccuracy."
        action = "Submit a factual dispute with supporting documentation."
        steps = ["Gather documents", "Draft dispute with specifics", "Monitor bureau response"]
    elif status == "Conditionally Eligible":
        summary = "This item may be eligible after verification."
        analysis = "More documentation is required to confirm accuracy."
        action = "Verify details before submitting a dispute."
        steps = ["Collect statements", "Identify discrepancy", "Submit dispute if confirmed"]
    elif status == "Not Eligible":
        summary = "This item appears accurate and is not eligible."
        analysis = "Authorized or accurate items generally should remain."
        action = "No dispute recommended without evidence of error."
        steps = ["Confirm authorization", "Keep records", "Monitor report"]
    else:
        summary = "There is not enough information to determine eligibility."
        analysis = "Key data is missing, preventing a factual assessment."
        action = "Request full account details before disputing."
        steps = ["Obtain account history", "Confirm dates/status", "Reassess eligibility"]

    return {
        "system": SYSTEM_STRUCTURED,
        "input": {
            "context": "Credit reporting disputes must be factual and supported by evidence.",
            "eligibility": status,
            "user_question": prompt,
        },
        "output": structured_response(summary, analysis, status, action, steps),
    }


def generate_sft_dataset(total: int) -> List[Dict[str, object]]:
    categories = (
        ["eligibility"] * int(total * 0.6)
        + ["education"] * int(total * 0.2)
        + ["refusal"] * int(total * 0.2)
    )
    while len(categories) < total:
        categories.append(random.choice(["eligibility", "education", "refusal"]))
    random.shuffle(categories)
    return [generate_sft_example(cat) for cat in categories]


def generate_embedding_pairs(total: int) -> List[Dict[str, object]]:
    topics = [
        ("Collection dispute eligibility", "When is a collection account eligible for dispute under credit reporting rules?"),
        ("Credit utilization impact", "How does credit card utilization affect credit scores?"),
        ("Charge-off meaning", "What does a charge-off mean on a credit report?"),
        ("Hard inquiry definition", "What is a hard inquiry and how long does it impact credit?"),
        ("Metro 2 format", "What is Metro 2 and why does it matter?"),
    ]
    negatives = [
        ("Charge-off definition", "How to remove an inquiry"),
        ("Authorized inquiry removal", "I authorized an inquiry, can it be removed?"),
        ("Credit utilization impact", "How to file a small claims lawsuit"),
    ]

    pairs: List[Dict[str, object]] = []
    for _ in range(total):
        if random.random() < 0.7:
            a, b = random.choice(topics)
            pairs.append({"text_1": a, "text_2": b, "label": 1})
        else:
            a, b = random.choice(negatives)
            pairs.append({"text_1": a, "text_2": b, "label": 0})
    random.shuffle(pairs)
    return pairs


def split_dataset(items: List[dict], train_ratio: float = 0.8, valid_ratio: float = 0.1):
    total = len(items)
    train_end = int(total * train_ratio)
    valid_end = int(total * (train_ratio + valid_ratio))
    return items[:train_end], items[train_end:valid_end], items[valid_end:]


def write_jsonl(path: str, rows: List[dict]):
    with open(path, "w", encoding="utf-8") as f:
        for row in rows:
            json.dump(row, f, ensure_ascii=False)
            f.write("\n")


def write_csv(path: str, rows: List[dict], headers: List[str]):
    with open(path, "w", encoding="utf-8", newline="") as f:
        writer = csv.DictWriter(f, fieldnames=headers)
        writer.writeheader()
        writer.writerows(rows)


def main():
    random.seed(RANDOM_SEED)

    classifier = generate_classifier_dataset(DEFAULT_CLASSIFIER_COUNT)
    train_c, valid_c, test_c = split_dataset(classifier, 0.8, 0.1)

    write_jsonl(os.path.join(BASE_DIR, "model2_classifier.train.jsonl"), train_c)
    write_jsonl(os.path.join(BASE_DIR, "model2_classifier.valid.jsonl"), valid_c)
    write_jsonl(os.path.join(BASE_DIR, "model2_classifier.test.jsonl"), test_c)
    write_jsonl(os.path.join(BASE_DIR, "dispute_classifier.jsonl"), classifier)
    write_csv(os.path.join(BASE_DIR, "dispute_classifier.csv"), classifier, ["text", "label"])

    sft = generate_sft_dataset(DEFAULT_SFT_COUNT)
    train_s, valid_s, _ = split_dataset(sft, 0.9, 0.1)
    write_jsonl(os.path.join(BASE_DIR, "model1_sft.train.jsonl"), train_s)
    write_jsonl(os.path.join(BASE_DIR, "model1_sft.valid.jsonl"), valid_s)
    write_jsonl(os.path.join(BASE_DIR, "credit_ai_llm.jsonl"), sft)

    embed = generate_embedding_pairs(DEFAULT_EMBEDDING_COUNT)
    train_e, valid_e, _ = split_dataset(embed, 0.9, 0.1)
    write_jsonl(os.path.join(BASE_DIR, "model3_pairs.train.jsonl"), train_e)
    write_jsonl(os.path.join(BASE_DIR, "model3_pairs.valid.jsonl"), valid_e)
    write_jsonl(os.path.join(BASE_DIR, "embedding_pairs.jsonl"), embed)

    print("Datasets generated:")
    print(f"- Classifier: {len(classifier)}")
    print(f"- SFT: {len(sft)}")
    print(f"- Embeddings: {len(embed)}")


if __name__ == "__main__":
    main()
