import os
from dataclasses import dataclass
from typing import Any, Dict, List, Optional, Tuple

import numpy as np
import torch
import yaml
from datasets import load_dataset
from sentence_transformers import InputExample, SentenceTransformer, losses
from sentence_transformers.evaluation import EmbeddingSimilarityEvaluator
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
    return Config(**data)


def resolve_pair(example: Dict[str, Any]) -> Tuple[str, str, float]:
    pairs = [
        ("text_a", "text_b"),
        ("text1", "text2"),
        ("text_1", "text_2"),
        ("sentence1", "sentence2"),
        ("query", "document"),
        ("anchor", "positive"),
    ]
    for a_key, b_key in pairs:
        if a_key in example and b_key in example:
            score = example.get("score") or example.get("label") or example.get("similarity") or 1.0
            return example[a_key], example[b_key], float(score)
    raise ValueError("Example missing text pair fields")


def main():
    config_path = os.getenv("CONFIG", "configs/model3_embeddings.yaml")
    cfg = load_config(config_path)

    np.random.seed(cfg.seed)
    torch.manual_seed(cfg.seed)

    if not cfg.train_files or not cfg.valid_files:
        raise ValueError("Config must specify train_files and valid_files")

    dataset = load_dataset("json", data_files={
        "train": cfg.train_files,
        "validation": cfg.valid_files,
    })

    train_examples = []
    for example in dataset["train"]:
        text_a, text_b, score = resolve_pair(example)
        train_examples.append(InputExample(texts=[text_a, text_b], label=score))

    valid_examples = []
    for example in dataset["validation"]:
        text_a, text_b, score = resolve_pair(example)
        valid_examples.append(InputExample(texts=[text_a, text_b], label=score))

    model = SentenceTransformer(cfg.model_id)
    train_dataloader = DataLoader(train_examples, shuffle=True, batch_size=cfg.batch_size)
    train_loss = losses.CosineSimilarityLoss(model)

    evaluator = EmbeddingSimilarityEvaluator.from_input_examples(valid_examples, name="valid")

    model.fit(
        train_objectives=[(train_dataloader, train_loss)],
        epochs=cfg.epochs,
        evaluator=evaluator,
        output_path=cfg.output_dir,
        show_progress_bar=True,
    )


if __name__ == "__main__":
    main()
