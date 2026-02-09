#!/usr/bin/env python3
"""
AI Model Evaluation Harness
Evaluates fine-tuned models for hallucination detection, accuracy, and compliance.
"""

import json
import os
import sys
from pathlib import Path
from typing import Dict, List, Tuple

import numpy as np
import torch
from datasets import load_dataset
from sentence_transformers import SentenceTransformer
from transformers import (
    AutoModelForCausalLM,
    AutoModelForSequenceClassification,
    AutoTokenizer,
)


# Model paths
BASE_DIR = Path(__file__).parent.parent
CLASSIFIER_PATH = BASE_DIR / "models" / "finetuned" / "distilbert-eligibility"
EMBEDDINGS_PATH = BASE_DIR / "models" / "finetuned" / "minilm-embeddings"
SFT_PATH = BASE_DIR / "models" / "finetuned" / "qwen-credit-sft"

# Test data paths
DATA_DIR = BASE_DIR / "data" / "finetune"
CLASSIFIER_TEST = DATA_DIR / "model2_classifier.test.jsonl"
SFT_VALID = DATA_DIR / "model1_sft.valid.jsonl"
EMBEDDINGS_VALID = DATA_DIR / "model3_pairs.valid.jsonl"

# Forbidden phrases for hallucination detection
FORBIDDEN_PHRASES = [
    "I am not a lawyer",
    "consult a lawyer",
    "100% guarantee",
    "delete all negative items",
    "remove all debts",
    "erase your credit history",
    "quick fix",
    "overnight results",
    "guaranteed approval",
    "credit repair loophole",
    "secret method",
]

# Compliance requirements
REQUIRED_DISCLAIMERS = [
    "results may vary",
    "educational purposes",
    "not financial advice",
    "consult with a professional",
]


def load_jsonl(path: Path) -> List[Dict]:
    """Load JSONL file."""
    if not path.exists():
        return []
    data = []
    with open(path, "r", encoding="utf-8") as f:
        for line in f:
            line = line.strip()
            if line:
                data.append(json.loads(line))
    return data


def check_hallucination(text: str) -> Tuple[bool, List[str]]:
    """
    Check if text contains forbidden phrases indicating hallucination or non-compliance.
    
    Returns:
        (is_compliant, violations)
    """
    violations = []
    text_lower = text.lower()
    
    for phrase in FORBIDDEN_PHRASES:
        if phrase.lower() in text_lower:
            violations.append(f"Forbidden phrase: '{phrase}'")
    
    # Check for specific problematic patterns
    if "100%" in text and any(word in text_lower for word in ["guarantee", "remove", "delete", "approved"]):
        violations.append("Unrealistic guarantee detected")
    
    # Check for medical/legal advice without disclaimer
    if any(word in text_lower for word in ["sue", "lawsuit", "legal action"]) and \
       not any(disc in text_lower for disc in ["lawyer", "attorney", "legal professional"]):
        violations.append("Legal advice without proper disclaimer")
    
    return len(violations) == 0, violations


def evaluate_classifier(model, tokenizer, test_data: List[Dict], device: str) -> Dict:
    """Evaluate classifier on test data."""
    if not test_data:
        return {"error": "No test data available"}
    
    correct = 0
    total = 0
    label_map = {0: "eligible", 1: "conditionally_eligible", 2: "not_eligible", 3: "insufficient_information"}
    label_to_id = {v: k for k, v in label_map.items()}
    
    per_class_correct = {label: 0 for label in label_map.values()}
    per_class_total = {label: 0 for label in label_map.values()}
    
    for example in test_data:
        text = example.get("text", "")
        true_label_str = example.get("label", "")
        
        if not text or not true_label_str:
            continue
        
        true_label_id = label_to_id.get(true_label_str)
        if true_label_id is None:
            continue
        
        inputs = tokenizer(text, return_tensors="pt", truncation=True, max_length=512).to(device)
        
        with torch.no_grad():
            outputs = model(**inputs)
            pred_label_id = torch.argmax(outputs.logits, dim=1).item()
        
        pred_label_str = label_map[pred_label_id]
        total += 1
        per_class_total[true_label_str] += 1
        
        if pred_label_id == true_label_id:
            correct += 1
            per_class_correct[true_label_str] += 1
    
    accuracy = correct / total if total > 0 else 0
    
    # Calculate per-class accuracy
    per_class_acc = {}
    for label in label_map.values():
        if per_class_total[label] > 0:
            per_class_acc[label] = per_class_correct[label] / per_class_total[label]
        else:
            per_class_acc[label] = 0.0
    
    return {
        "total_examples": total,
        "correct_predictions": correct,
        "accuracy": accuracy,
        "per_class_accuracy": per_class_acc,
    }


def evaluate_embeddings(model, valid_data: List[Dict]) -> Dict:
    """Evaluate embeddings model on semantic similarity tasks."""
    if not valid_data:
        return {"error": "No validation data available"}
    
    correct_similar = 0
    total_pairs = 0
    
    for example in valid_data:
        # Handle different field name patterns
        text_a = example.get("query") or example.get("text_a") or example.get("anchor", "")
        text_b = example.get("document") or example.get("text_b") or example.get("positive", "")
        
        if not text_a or not text_b:
            continue
        
        embedding_a = model.encode(text_a, normalize_embeddings=True)
        embedding_b = model.encode(text_b, normalize_embeddings=True)
        
        similarity = np.dot(embedding_a, embedding_b)
        
        # Pairs in training data should have high similarity (> 0.5)
        if similarity > 0.5:
            correct_similar += 1
        
        total_pairs += 1
    
    accuracy = correct_similar / total_pairs if total_pairs > 0 else 0
    
    return {
        "total_pairs": total_pairs,
        "correctly_similar": correct_similar,
        "similarity_accuracy": accuracy,
    }


def evaluate_sft_hallucination(model, tokenizer, valid_data: List[Dict], device: str) -> Dict:
    """Evaluate SFT model for hallucination and compliance."""
    if not valid_data:
        return {"error": "No validation data available"}
    
    total_responses = 0
    compliant_responses = 0
    all_violations = []
    
    for example in valid_data[:20]:  # Limit to 20 examples for speed
        user_msg = example.get("user")
        if not user_msg:
            continue
        
        messages = [{"role": "user", "content": user_msg}]
        prompt = tokenizer.apply_chat_template(messages, tokenize=False, add_generation_prompt=True)
        inputs = tokenizer(prompt, return_tensors="pt").to(device)
        
        with torch.no_grad():
            outputs = model.generate(
                **inputs,
                max_new_tokens=256,
                temperature=0.3,
                do_sample=True,
            )
        
        response = tokenizer.decode(outputs[0], skip_special_tokens=True)
        response = response.replace(prompt, "").strip()
        
        is_compliant, violations = check_hallucination(response)
        total_responses += 1
        
        if is_compliant:
            compliant_responses += 1
        else:
            all_violations.extend(violations)
    
    compliance_rate = compliant_responses / total_responses if total_responses > 0 else 0
    
    return {
        "total_responses": total_responses,
        "compliant_responses": compliant_responses,
        "compliance_rate": compliance_rate,
        "violation_count": len(all_violations),
        "sample_violations": all_violations[:10],
    }


def main():
    print("=" * 80)
    print("AI Model Evaluation Harness")
    print("=" * 80)
    
    device = "cuda" if torch.cuda.is_available() else "cpu"
    print(f"\nDevice: {device}")
    
    results = {}
    
    # Evaluate Classifier
    print("\n" + "=" * 80)
    print("1. Evaluating Fine-Tuned Classifier")
    print("=" * 80)
    
    if CLASSIFIER_PATH.exists():
        print(f"Loading classifier from {CLASSIFIER_PATH}")
        tokenizer = AutoTokenizer.from_pretrained(str(CLASSIFIER_PATH))
        model = AutoModelForSequenceClassification.from_pretrained(str(CLASSIFIER_PATH)).to(device)
        model.eval()
        
        test_data = load_jsonl(CLASSIFIER_TEST)
        print(f"Loaded {len(test_data)} test examples")
        
        classifier_results = evaluate_classifier(model, tokenizer, test_data, device)
        results["classifier"] = classifier_results
        
        print("\nClassifier Results:")
        print(f"  Total examples: {classifier_results.get('total_examples', 0)}")
        print(f"  Accuracy: {classifier_results.get('accuracy', 0):.2%}")
        if "per_class_accuracy" in classifier_results:
            print("  Per-class accuracy:")
            for label, acc in classifier_results["per_class_accuracy"].items():
                print(f"    {label}: {acc:.2%}")
    else:
        print(f"Classifier not found at {CLASSIFIER_PATH}")
        results["classifier"] = {"error": "Model not found"}
    
    # Evaluate Embeddings
    print("\n" + "=" * 80)
    print("2. Evaluating Fine-Tuned Embeddings")
    print("=" * 80)
    
    if EMBEDDINGS_PATH.exists():
        print(f"Loading embeddings from {EMBEDDINGS_PATH}")
        embeddings_model = SentenceTransformer(str(EMBEDDINGS_PATH), device=device)
        
        valid_data = load_jsonl(EMBEDDINGS_VALID)
        print(f"Loaded {len(valid_data)} validation pairs")
        
        embeddings_results = evaluate_embeddings(embeddings_model, valid_data)
        results["embeddings"] = embeddings_results
        
        print("\nEmbeddings Results:")
        print(f"  Total pairs: {embeddings_results.get('total_pairs', 0)}")
        print(f"  Similarity accuracy: {embeddings_results.get('similarity_accuracy', 0):.2%}")
    else:
        print(f"Embeddings model not found at {EMBEDDINGS_PATH}")
        results["embeddings"] = {"error": "Model not found"}
    
    # Evaluate SFT Model
    print("\n" + "=" * 80)
    print("3. Evaluating Fine-Tuned SFT Model (Hallucination Check)")
    print("=" * 80)
    
    if SFT_PATH.exists():
        print(f"Loading SFT model from {SFT_PATH}")
        tokenizer = AutoTokenizer.from_pretrained(str(SFT_PATH))
        model = AutoModelForCausalLM.from_pretrained(str(SFT_PATH)).to(device)
        model.eval()
        
        valid_data = load_jsonl(SFT_VALID)
        print(f"Loaded {len(valid_data)} validation examples")
        
        sft_results = evaluate_sft_hallucination(model, tokenizer, valid_data, device)
        results["sft"] = sft_results
        
        print("\nSFT Model Results (Hallucination & Compliance):")
        print(f"  Total responses: {sft_results.get('total_responses', 0)}")
        print(f"  Compliant responses: {sft_results.get('compliant_responses', 0)}")
        print(f"  Compliance rate: {sft_results.get('compliance_rate', 0):.2%}")
        print(f"  Violation count: {sft_results.get('violation_count', 0)}")
        if sft_results.get("sample_violations"):
            print("  Sample violations:")
            for v in sft_results["sample_violations"]:
                print(f"    - {v}")
    else:
        print(f"SFT model not found at {SFT_PATH}")
        results["sft"] = {"error": "Model not found"}
    
    # Save results
    output_path = BASE_DIR / "AI_EVALUATION_REPORT.json"
    with open(output_path, "w", encoding="utf-8") as f:
        json.dump(results, f, indent=2)
    
    print("\n" + "=" * 80)
    print(f"Evaluation complete! Results saved to {output_path}")
    print("=" * 80)
    
    return results


if __name__ == "__main__":
    main()
