import csv
import json
import os
from pathlib import Path
from typing import Any, Dict, List, Optional

import yaml

BASE_DIR = Path(__file__).resolve().parents[1]
DATASETS_DIR = BASE_DIR / "datasets"
OUTPUT_DIR = BASE_DIR / "data" / "finetune"

COMPLIANCE_SYSTEM = (
    "You are a credit compliance assistant. Do not guarantee outcomes, avoid legal advice, "
    "and provide factual, educational guidance only."
)


def safe_float(value: Optional[str]) -> Optional[float]:
    if value is None:
        return None
    try:
        return float(value)
    except ValueError:
        try:
            return float(value.strip().replace("%", "")) / 100.0
        except Exception:
            return None


def ensure_output_dir() -> None:
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)


def write_jsonl(path: Path, rows: List[Dict[str, Any]]) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    with path.open("w", encoding="utf-8") as f:
        for row in rows:
            f.write(json.dumps(row, ensure_ascii=False) + "\n")


def load_json(path: Path) -> Any:
    with path.open("r", encoding="utf-8") as f:
        return json.load(f)


def load_yaml(path: Path) -> Any:
    with path.open("r", encoding="utf-8") as f:
        return yaml.safe_load(f)


def build_classifier_examples() -> List[Dict[str, Any]]:
    rows: List[Dict[str, Any]] = []
    csv_path = DATASETS_DIR / "credit_disputes" / "dispute_reasons.csv"
    if not csv_path.exists():
        return rows

    with csv_path.open("r", encoding="utf-8") as f:
        reader = csv.DictReader(f)
        for item in reader:
            account_type = item.get("account_type", "unknown")
            dispute_reason = item.get("dispute_reason", "unknown")
            legal_basis = item.get("legal_basis", "unknown")
            success_rate = safe_float(item.get("success_rate"))

            if success_rate is None:
                label = "insufficient_information"
            elif success_rate >= 0.6:
                label = "eligible"
            elif success_rate >= 0.35:
                label = "conditionally_eligible"
            else:
                label = "not_eligible"

            text = (
                f"Account type: {account_type}. "
                f"Dispute reason: {dispute_reason}. "
                f"Legal basis: {legal_basis}."
            )

            rows.append({"text": text, "label": label})

    return rows


def build_template_examples() -> List[Dict[str, Any]]:
    rows: List[Dict[str, Any]] = []
    templates_dir = DATASETS_DIR / "templates"
    if not templates_dir.exists():
        return rows

    for path in templates_dir.glob("*.json"):
        try:
            data = load_json(path)
        except Exception:
            continue

        entries = data if isinstance(data, list) else data.get("templates", [])
        for entry in entries:
            letter_type = entry.get("letter_type", "general")
            scenario = entry.get("scenario", "general")
            tone = entry.get("tone", "formal")
            compliance_level = entry.get("compliance_level", "high")
            content = (
                entry.get("template")
                or entry.get("content")
                or entry.get("letter")
                or entry.get("body")
            )
            if not content:
                continue

            user = (
                f"Write a {tone} {letter_type} dispute letter for scenario: {scenario}. "
                f"Compliance level: {compliance_level}."
            )
            rows.append({
                "system": COMPLIANCE_SYSTEM,
                "user": user,
                "assistant": content,
            })

    return rows


def iter_text_records(obj: Any) -> List[Dict[str, str]]:
    records: List[Dict[str, str]] = []
    if isinstance(obj, list):
        for item in obj:
            records.extend(iter_text_records(item))
        return records
    if isinstance(obj, dict):
        title = obj.get("title") or obj.get("section") or obj.get("name")
        body = obj.get("text") or obj.get("content") or obj.get("body")
        if title and body:
            records.append({"title": str(title), "text": str(body)})
        else:
            for value in obj.values():
                records.extend(iter_text_records(value))
    return records


def build_embedding_pairs() -> List[Dict[str, Any]]:
    rows: List[Dict[str, Any]] = []
    sources = [
        DATASETS_DIR / "compliance" / "fcra_sections.json",
        DATASETS_DIR / "compliance" / "cfpb_guidelines.yaml",
        DATASETS_DIR / "strategies" / "utilization_strategies.json",
        DATASETS_DIR / "strategies" / "timeline_expectations.csv",
        DATASETS_DIR / "tradelines" / "tradeline_types.json",
    ]

    for path in sources:
        if not path.exists():
            continue

        records: List[Dict[str, str]] = []
        if path.suffix == ".json":
            try:
                records = iter_text_records(load_json(path))
            except Exception:
                records = []
        elif path.suffix in {".yaml", ".yml"}:
            try:
                records = iter_text_records(load_yaml(path))
            except Exception:
                records = []
        elif path.suffix == ".csv":
            with path.open("r", encoding="utf-8") as f:
                reader = csv.DictReader(f)
                for row in reader:
                    title = row.get("action") or row.get("profile") or row.get("topic")
                    body = row.get("expected_impact") or row.get("timeframe_days")
                    if title and body:
                        records.append({"title": str(title), "text": str(body)})

        for record in records:
            query = f"What does {record['title']} mean?"
            rows.append({"query": query, "document": record["text"], "score": 1.0})

    return rows


def main() -> None:
    ensure_output_dir()

    classifier_rows = build_classifier_examples()
    sft_rows = build_template_examples()
    embedding_rows = build_embedding_pairs()

    write_jsonl(OUTPUT_DIR / "custom_classifier.jsonl", classifier_rows)
    write_jsonl(OUTPUT_DIR / "custom_sft.jsonl", sft_rows)
    write_jsonl(OUTPUT_DIR / "custom_pairs.jsonl", embedding_rows)

    print("Custom datasets prepared:")
    print(f"- classifier rows: {len(classifier_rows)}")
    print(f"- sft rows: {len(sft_rows)}")
    print(f"- embedding pairs: {len(embedding_rows)}")


if __name__ == "__main__":
    main()
