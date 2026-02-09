import json
import os
from dataclasses import dataclass
from typing import List, Optional

import numpy as np
import yaml
from datasets import load_dataset
from transformers import (AutoModelForSequenceClassification, AutoTokenizer,
                          DataCollatorWithPadding, Trainer, TrainingArguments)


@dataclass
class Config:
    model_id: str
    output_dir: str
    text_field: str
    label_field: str
    labels: List[str]
    max_length: int
    batch_size: int
    eval_batch_size: int
    learning_rate: float
    epochs: int
    weight_decay: float
    seed: int
    train_file: Optional[str] = None
    valid_file: Optional[str] = None
    test_file: Optional[str] = None
    train_files: Optional[List[str]] = None
    valid_files: Optional[List[str]] = None
    test_files: Optional[List[str]] = None


def load_config(path: str) -> Config:
    with open(path, "r", encoding="utf-8") as f:
        data = yaml.safe_load(f)
    if "train_files" not in data:
        data["train_files"] = [data["train_file"]] if data.get("train_file") else None
    if "valid_files" not in data:
        data["valid_files"] = [data["valid_file"]] if data.get("valid_file") else None
    if "test_files" not in data:
        data["test_files"] = [data["test_file"]] if data.get("test_file") else None
    return Config(**data)


def main():
    config_path = os.getenv("CONFIG", "configs/model2_classifier.yaml")
    cfg = load_config(config_path)

    label2id = {label: idx for idx, label in enumerate(cfg.labels)}
    id2label = {idx: label for label, idx in label2id.items()}

    if not cfg.train_files or not cfg.valid_files or not cfg.test_files:
        raise ValueError("Config must specify train_files, valid_files, and test_files")

    dataset = load_dataset("json", data_files={
        "train": cfg.train_files,
        "validation": cfg.valid_files,
        "test": cfg.test_files,
    })

    tokenizer = AutoTokenizer.from_pretrained(cfg.model_id)

    def preprocess(examples):
        texts = examples[cfg.text_field]
        labels = [label2id[label] for label in examples[cfg.label_field]]
        tokenized = tokenizer(
            texts,
            truncation=True,
            max_length=cfg.max_length,
        )
        tokenized["labels"] = labels
        return tokenized

    dataset = dataset.map(preprocess, batched=True, remove_columns=dataset["train"].column_names)

    model = AutoModelForSequenceClassification.from_pretrained(
        cfg.model_id,
        num_labels=len(cfg.labels),
        id2label=id2label,
        label2id=label2id,
    )

    def compute_metrics(eval_pred):
        logits, labels = eval_pred
        preds = np.argmax(logits, axis=-1)
        accuracy = (preds == labels).mean().item()

        f1_scores = []
        per_class = {}
        for idx, label in enumerate(cfg.labels):
            tp = ((preds == idx) & (labels == idx)).sum()
            fp = ((preds == idx) & (labels != idx)).sum()
            fn = ((preds != idx) & (labels == idx)).sum()
            precision = tp / (tp + fp) if (tp + fp) > 0 else 0.0
            recall = tp / (tp + fn) if (tp + fn) > 0 else 0.0
            f1 = (2 * precision * recall / (precision + recall)) if (precision + recall) > 0 else 0.0
            f1_scores.append(f1)
            per_class[f"f1_{label}"] = f1

        macro_f1 = float(np.mean(f1_scores)) if f1_scores else 0.0
        metrics = {"accuracy": accuracy, "macro_f1": macro_f1}
        metrics.update(per_class)
        return metrics

    args = TrainingArguments(
        output_dir=cfg.output_dir,
        per_device_train_batch_size=cfg.batch_size,
        per_device_eval_batch_size=cfg.eval_batch_size,
        learning_rate=cfg.learning_rate,
        num_train_epochs=cfg.epochs,
        weight_decay=cfg.weight_decay,
        evaluation_strategy="epoch",
        save_strategy="epoch",
        logging_strategy="steps",
        logging_steps=50,
        seed=cfg.seed,
        load_best_model_at_end=True,
        metric_for_best_model="macro_f1",
        report_to=[],
    )

    trainer = Trainer(
        model=model,
        args=args,
        train_dataset=dataset["train"],
        eval_dataset=dataset["validation"],
        tokenizer=tokenizer,
        data_collator=DataCollatorWithPadding(tokenizer),
        compute_metrics=compute_metrics,
    )

    trainer.train()
    metrics = trainer.evaluate(dataset["test"])
    os.makedirs(cfg.output_dir, exist_ok=True)
    with open(os.path.join(cfg.output_dir, "test_metrics.json"), "w", encoding="utf-8") as f:
        json.dump(metrics, f, indent=2)

    trainer.save_model(cfg.output_dir)
    tokenizer.save_pretrained(cfg.output_dir)


if __name__ == "__main__":
    main()
