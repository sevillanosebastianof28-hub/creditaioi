import os
from dataclasses import dataclass
from typing import List, Optional

import yaml
from datasets import load_dataset
from sentence_transformers import (InputExample, SentenceTransformer,
                                    losses, evaluation)
from torch.utils.data import DataLoader


@dataclass
class Config:
    model_id: str
    output_dir: str
    batch_size: int
    epochs: int
    seed: int
    train_file: Optional[str] = None
    valid_file: Optional[str] = None
    train_files: Optional[List[str]] = None
    valid_files: Optional[List[str]] = None


def load_config(path: str) -> Config:
    with open(path, "r", encoding="utf-8") as f:
        data = yaml.safe_load(f)
    if "train_files" not in data:
        data["train_files"] = [data["train_file"]] if data.get("train_file") else None
    if "valid_files" not in data:
        data["valid_files"] = [data["valid_file"]] if data.get("valid_file") else None
    if "epochs" in data:
        data["epochs"] = int(data["epochs"])
    if "batch_size" in data:
        data["batch_size"] = int(data["batch_size"])
    if "seed" in data:
        data["seed"] = int(data["seed"])
    return Config(**data)


def main():
    config_path = os.getenv("CONFIG", "configs/model3_embeddings.yaml")
    cfg = load_config(config_path)

    if not cfg.train_files:
        raise ValueError("Config must specify train_files")

    # Load datasets
    dataset = load_dataset("json", data_files={
        "train": cfg.train_files,
    })

    if cfg.valid_files:
        valid_dataset = load_dataset("json", data_files={
            "validation": cfg.valid_files,
        })
    else:
        valid_dataset = None

    # Load model
    model = SentenceTransformer(cfg.model_id)

    # Prepare training examples
    train_examples = []
    for item in dataset["train"]:
        train_examples.append(InputExample(
            texts=[item["text_1"], item["text_2"]],
            label=float(item["label"])
        ))

    # Create data loader
    train_dataloader = DataLoader(
        train_examples,
        shuffle=True,
        batch_size=cfg.batch_size
    )

    # Define loss function
    train_loss = losses.CosineSimilarityLoss(model)

    # Prepare evaluator if validation data exists
    evaluator = None
    if valid_dataset:
        sentences1 = []
        sentences2 = []
        scores = []
        for item in valid_dataset["validation"]:
            sentences1.append(item["text_1"])
            sentences2.append(item["text_2"])
            scores.append(float(item["label"]))

        evaluator = evaluation.EmbeddingSimilarityEvaluator(
            sentences1, sentences2, scores,
            name="validation",
            show_progress_bar=True
        )

    # Train the model (automatically saves to output_path)
    os.makedirs(cfg.output_dir, exist_ok=True)
    model.fit(
        train_objectives=[(train_dataloader, train_loss)],
        epochs=cfg.epochs,
        warmup_steps=100,
        evaluator=evaluator,
        evaluation_steps=500,
        output_path=cfg.output_dir,
        show_progress_bar=True,
    )
    print(f"\nModel saved to {cfg.output_dir}")


if __name__ == "__main__":
    main()
