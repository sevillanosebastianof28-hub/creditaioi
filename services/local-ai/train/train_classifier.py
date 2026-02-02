import json
import os
from dataclasses import dataclass
from typing import List

import numpy as np
import yaml
from datasets import load_dataset
from transformers import (AutoModelForSequenceClassification, AutoTokenizer,
                          DataCollatorWithPadding, Trainer, TrainingArguments)


@dataclass
class Config:
    model_id: str
    output_dir: str
    train_file: str
    valid_file: str
    test_file: str
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


def load_config(path: str) -> Config:
    with open(path, "r", encoding="utf-8") as f:
        data = yaml.safe_load(f)
    return Config(**data)


def main():
    config_path = os.getenv("CONFIG", "configs/model2_classifier.yaml")
    cfg = load_config(config_path)

    label2id = {label: idx for idx, label in enumerate(cfg.labels)}
    id2label = {idx: label for label, idx in label2id.items()}

    dataset = load_dataset("json", data_files={
        "train": cfg.train_file,
        "validation": cfg.valid_file,
        "test": cfg.test_file,
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
        return {"accuracy": accuracy}

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
        metric_for_best_model="accuracy",
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
