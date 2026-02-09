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
    model = AutoModelForCausalLM.from_pretrained(cfg.model_id)

    def format_example(example: Dict[str, Any]) -> Dict[str, str]:
        messages = build_messages(example)
        if not messages:
            raise ValueError("Example has no messages or prompt/response fields")
        text = tokenizer.apply_chat_template(messages, tokenize=False, add_generation_prompt=False)
        return {"text": text}

    dataset = dataset.map(format_example, remove_columns=dataset["train"].column_names)

    lora_config = LoraConfig(
        r=8,
        lora_alpha=16,
        lora_dropout=0.05,
        bias="none",
        task_type="CAUSAL_LM",
        target_modules=["q_proj", "k_proj", "v_proj", "o_proj", "gate_proj", "up_proj", "down_proj"],
    )

    args = TrainingArguments(
        output_dir=cfg.output_dir,
        per_device_train_batch_size=cfg.batch_size,
        per_device_eval_batch_size=cfg.eval_batch_size,
        gradient_accumulation_steps=cfg.gradient_accumulation_steps,
        learning_rate=cfg.learning_rate,
        num_train_epochs=cfg.epochs,
        evaluation_strategy="epoch",
        save_strategy="epoch",
        logging_strategy="steps",
        logging_steps=50,
        seed=cfg.seed,
        fp16=torch.cuda.is_available(),
        report_to=[],
    )

    trainer = SFTTrainer(
        model=model,
        args=args,
        train_dataset=dataset["train"],
        eval_dataset=dataset["validation"],
        peft_config=lora_config,
        dataset_text_field="text",
        max_seq_length=cfg.max_length,
        tokenizer=tokenizer,
        packing=False,
    )

    trainer.train()

    os.makedirs(cfg.output_dir, exist_ok=True)
    trainer.save_model(cfg.output_dir)
    tokenizer.save_pretrained(cfg.output_dir)

    with open(os.path.join(cfg.output_dir, "train_state.json"), "w", encoding="utf-8") as f:
        json.dump(trainer.state.log_history, f, indent=2)


if __name__ == "__main__":
    main()
