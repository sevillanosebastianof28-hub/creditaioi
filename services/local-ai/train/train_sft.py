import json
import os
from dataclasses import dataclass
from typing import Any, Dict, List, Optional

import torch
import yaml
from datasets import load_dataset
from peft import LoraConfig
from transformers import AutoModelForCausalLM, AutoTokenizer, TrainingArguments
from trl import SFTTrainer


@dataclass
class Config:
    model_id: str
    output_dir: str
    max_length: int
    batch_size: int
    eval_batch_size: int
    learning_rate: float
    epochs: int
    gradient_accumulation_steps: int
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
    if "learning_rate" in data:
        data["learning_rate"] = float(data["learning_rate"])
    if "epochs" in data:
        data["epochs"] = int(data["epochs"])
    if "batch_size" in data:
        data["batch_size"] = int(data["batch_size"])
    if "eval_batch_size" in data:
        data["eval_batch_size"] = int(data["eval_batch_size"])
    if "gradient_accumulation_steps" in data:
        data["gradient_accumulation_steps"] = int(data["gradient_accumulation_steps"])
    if "max_length" in data:
        data["max_length"] = int(data["max_length"])
    return Config(**data)


def stringify_value(value: Any) -> str:
    if isinstance(value, str):
        return value
    if isinstance(value, (dict, list)):
        return json.dumps(value, ensure_ascii=False, indent=2)
    return str(value)


def build_messages(example: Dict[str, Any]) -> List[Dict[str, str]]:
    if isinstance(example.get("messages"), list):
        return example["messages"]

    system = example.get("system") or example.get("system_prompt")
    user = (
        example.get("prompt")
        or example.get("input")
        or example.get("question")
        or example.get("instruction")
        or ""
    )
    assistant = (
        example.get("response")
        or example.get("output")
        or example.get("completion")
        or example.get("answer")
        or ""
    )

    system = stringify_value(system) if system else ""
    user = stringify_value(user) if user else ""
    assistant = stringify_value(assistant) if assistant else ""

    messages: List[Dict[str, str]] = []
    if system:
        messages.append({"role": "system", "content": system})
    if user:
        messages.append({"role": "user", "content": user})
    if assistant:
        messages.append({"role": "assistant", "content": assistant})
    return messages


def main():
    config_path = os.getenv("CONFIG", "configs/model1_sft.yaml")
    cfg = load_config(config_path)

    if not cfg.train_files or not cfg.valid_files:
        raise ValueError("Config must specify train_files and valid_files")

    dataset = load_dataset("json", data_files={
        "train": cfg.train_files,
        "validation": cfg.valid_files,
    })

    tokenizer = AutoTokenizer.from_pretrained(cfg.model_id)
    torch_dtype = torch.float16 if torch.cuda.is_available() else None
    model = AutoModelForCausalLM.from_pretrained(
        cfg.model_id,
        torch_dtype=torch_dtype,
        low_cpu_mem_usage=True,
        device_map="auto" if torch.cuda.is_available() else None,
    )
    if hasattr(model, "gradient_checkpointing_enable"):
        model.gradient_checkpointing_enable()
    if hasattr(model, "config"):
        model.config.use_cache = False

    def format_example(example: Dict[str, Any]) -> Dict[str, str]:
        messages = build_messages(example)
        if not messages:
            raise ValueError("Example has no messages or prompt/response fields")
        text = tokenizer.apply_chat_template(messages, tokenize=False, add_generation_prompt=False)
        return