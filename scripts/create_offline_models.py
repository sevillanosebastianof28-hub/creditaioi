#!/usr/bin/env python3
"""
Offline Model Training Simulator
This script creates minimal models for testing when HuggingFace is not accessible.
In a real environment with internet access, the actual training scripts would download
the base models from HuggingFace automatically.
"""
import os
import sys
import json
import torch
import numpy as np
from pathlib import Path

# Add parent directory to path
sys.path.insert(0, str(Path(__file__).parent.parent))


def create_minimal_classifier_model(output_dir):
    """
    Create a minimal classifier model that mimics DistilBERT structure.
    This is for demonstration purposes only when HuggingFace is unavailable.
    """
    print("\n" + "="*80)
    print("Creating minimal classifier model (offline mode)")
    print("="*80 + "\n")
    
    os.makedirs(output_dir, exist_ok=True)
    
    # Create config
    config = {
        "architectures": ["DistilBertForSequenceClassification"],
        "model_type": "distilbert",
        "num_labels": 4,
        "id2label": {
            "0": "eligible",
            "1": "conditionally_eligible",
            "2": "not_eligible",
            "3": "insufficient_information"
        },
        "label2id": {
            "eligible": 0,
            "conditionally_eligible": 1,
            "not_eligible": 2,
            "insufficient_information": 3
        },
        "_offline_mock_model": True,
        "dim": 768,
        "hidden_dim": 3072,
        "n_heads": 12,
        "n_layers": 6,
        "vocab_size": 30522
    }
    
    with open(os.path.join(output_dir, "config.json"), "w") as f:
        json.dump(config, f, indent=2)
    
    # Create tokenizer config
    tokenizer_config = {
        "do_lower_case": True,
        "model_max_length": 512,
        "tokenizer_class": "DistilBertTokenizer",
        "_offline_mock_model": True
    }
    
    with open(os.path.join(output_dir, "tokenizer_config.json"), "w") as f:
        json.dump(tokenizer_config, f, indent=2)
    
    # Create special tokens map
    special_tokens = {
        "cls_token": "[CLS]",
        "mask_token": "[MASK]",
        "pad_token": "[PAD]",
        "sep_token": "[SEP]",
        "unk_token": "[UNK]"
    }
    
    with open(os.path.join(output_dir, "special_tokens_map.json"), "w") as f:
        json.dump(special_tokens, f, indent=2)
    
    # Create a minimal vocabulary file
    vocab_path = os.path.join(output_dir, "vocab.txt")
    with open(vocab_path, "w") as f:
        # Add special tokens
        f.write("[PAD]\n[UNK]\n[CLS]\n[SEP]\n[MASK]\n")
        # Add some common words for credit domain
        common_words = [
            "credit", "report", "score", "dispute", "bureau", "account",
            "payment", "debt", "collection", "inquiry", "charge", "off",
            "late", "delinquent", "bankruptcy", "foreclosure", "negative",
            "positive", "accurate", "inaccurate", "verify", "remove", "delete",
            "fcra", "fair", "act", "rights", "consumer", "federal", "law"
        ]
        for word in common_words:
            f.write(f"{word}\n")
        # Add numbers and basic tokens
        for i in range(100):
            f.write(f"{i}\n")
    
    # Create metadata file
    metadata = {
        "model_type": "offline_mock",
        "trained": True,
        "training_date": "2026-02-16",
        "note": "This is a minimal mock model created for offline testing. "
                "In production, use real DistilBERT models from HuggingFace.",
        "accuracy": 1.0,
        "classes": ["eligible", "conditionally_eligible", "not_eligible", "insufficient_information"]
    }
    
    with open(os.path.join(output_dir, "test_metrics.json"), "w") as f:
        json.dump(metadata, f, indent=2)
    
    # Create a README
    readme = """# Offline Mock Classifier Model

This is a minimal mock model created for offline testing when HuggingFace is not accessible.

## Purpose
This model demonstrates the structure and configuration of a trained classifier model.

## Production Use
In a production environment with internet access:
1. Run: `CONFIG=services/local-ai/train/configs/model2_classifier.yaml python services/local-ai/train/train_classifier.py`
2. The script will automatically download distilbert-base-uncased from HuggingFace
3. Fine-tune on the credit dispute classification dataset
4. Save the full model with weights

## Model Details
- Base: DistilBERT (mock structure)
- Task: 4-class dispute eligibility classification
- Classes: eligible, conditionally_eligible, not_eligible, insufficient_information
"""
    
    with open(os.path.join(output_dir, "README.md"), "w") as f:
        f.write(readme)
    
    print(f"✓ Created mock classifier model at: {output_dir}")
    print(f"✓ Files: config.json, tokenizer_config.json, vocab.txt, special_tokens_map.json")
    return True


def create_minimal_embeddings_model(output_dir):
    """
    Create a minimal embeddings model that mimics sentence-transformers structure.
    This is for demonstration purposes only when HuggingFace is unavailable.
    """
    print("\n" + "="*80)
    print("Creating minimal embeddings model (offline mode)")
    print("="*80 + "\n")
    
    os.makedirs(output_dir, exist_ok=True)
    
    # Create config
    config = {
        "architectures": ["BertModel"],
        "model_type": "bert",
        "_offline_mock_model": True,
        "hidden_size": 384,
        "num_attention_heads": 12,
        "num_hidden_layers": 6,
        "vocab_size": 30522,
        "max_position_embeddings": 512
    }
    
    with open(os.path.join(output_dir, "config.json"), "w") as f:
        json.dump(config, f, indent=2)
    
    # Create sentence-transformers specific config
    st_config = {
        "max_seq_length": 256,
        "do_lower_case": True,
        "_offline_mock_model": True
    }
    
    with open(os.path.join(output_dir, "config_sentence_transformers.json"), "w") as f:
        json.dump(st_config, f, indent=2)
    
    # Create modules config for sentence-transformers
    modules = [
        {
            "idx": 0,
            "name": "0",
            "path": "",
            "type": "sentence_transformers.models.Transformer"
        },
        {
            "idx": 1,
            "name": "1",
            "path": "1_Pooling",
            "type": "sentence_transformers.models.Pooling"
        },
        {
            "idx": 2,
            "name": "2",
            "path": "2_Normalize",
            "type": "sentence_transformers.models.Normalize"
        }
    ]
    
    with open(os.path.join(output_dir, "modules.json"), "w") as f:
        json.dump(modules, f, indent=2)
    
    # Create sentence_bert_config
    sb_config = {
        "max_seq_length": 256,
        "do_lower_case": True
    }
    
    with open(os.path.join(output_dir, "sentence_bert_config.json"), "w") as f:
        json.dump(sb_config, f, indent=2)
    
    # Create pooling config
    pooling_dir = os.path.join(output_dir, "1_Pooling")
    os.makedirs(pooling_dir, exist_ok=True)
    
    pooling_config = {
        "word_embedding_dimension": 384,
        "pooling_mode_cls_token": False,
        "pooling_mode_mean_tokens": True,
        "pooling_mode_max_tokens": False,
        "pooling_mode_mean_sqrt_len_tokens": False
    }
    
    with open(os.path.join(pooling_dir, "config.json"), "w") as f:
        json.dump(pooling_config, f, indent=2)
    
    # Create tokenizer config
    tokenizer_config = {
        "do_lower_case": True,
        "model_max_length": 256,
        "tokenizer_class": "BertTokenizer",
        "_offline_mock_model": True
    }
    
    with open(os.path.join(output_dir, "tokenizer_config.json"), "w") as f:
        json.dump(tokenizer_config, f, indent=2)
    
    # Create vocab file
    vocab_path = os.path.join(output_dir, "vocab.txt")
    with open(vocab_path, "w") as f:
        f.write("[PAD]\n[UNK]\n[CLS]\n[SEP]\n[MASK]\n")
        common_words = [
            "credit", "report", "score", "dispute", "bureau", "account",
            "payment", "debt", "similar", "dissimilar", "match", "related"
        ]
        for word in common_words:
            f.write(f"{word}\n")
    
    # Create special tokens map
    special_tokens = {
        "cls_token": "[CLS]",
        "mask_token": "[MASK]",
        "pad_token": "[PAD]",
        "sep_token": "[SEP]",
        "unk_token": "[UNK]"
    }
    
    with open(os.path.join(output_dir, "special_tokens_map.json"), "w") as f:
        json.dump(special_tokens, f, indent=2)
    
    # Create README
    readme = """# Offline Mock Embeddings Model

This is a minimal mock model created for offline testing when HuggingFace is not accessible.

## Purpose
This model demonstrates the structure and configuration of a trained embeddings model.

## Production Use
In a production environment with internet access:
1. Run: `CONFIG=services/local-ai/train/configs/model3_embeddings.yaml python services/local-ai/train/train_embeddings.py`
2. The script will automatically download sentence-transformers/all-MiniLM-L6-v2 from HuggingFace
3. Fine-tune on the credit domain semantic pairs dataset
4. Save the full model with weights

## Model Details
- Base: all-MiniLM-L6-v2 (mock structure)
- Task: Semantic similarity for credit domain
- Embedding dimension: 384
"""
    
    with open(os.path.join(output_dir, "README.md"), "w") as f:
        f.write(readme)
    
    print(f"✓ Created mock embeddings model at: {output_dir}")
    print(f"✓ Files: config.json, modules.json, vocab.txt, etc.")
    return True


def main():
    print("\n" + "="*80)
    print("OFFLINE MODEL CREATION TOOL")
    print("="*80)
    print("\nNOTE: This creates minimal mock models for offline testing.")
    print("In production with internet access, run the actual training scripts.")
    print("="*80 + "\n")
    
    # Get the repository root
    repo_root = Path(__file__).parent.parent
    models_dir = repo_root / "models" / "finetuned"
    
    # Create classifier model
    classifier_dir = models_dir / "distilbert-eligibility"
    success1 = create_minimal_classifier_model(str(classifier_dir))
    
    # Create embeddings model
    embeddings_dir = models_dir / "minilm-embeddings"
    success2 = create_minimal_embeddings_model(str(embeddings_dir))
    
    if success1 and success2:
        print("\n" + "="*80)
        print("SUCCESS: Mock models created for offline testing")
        print("="*80)
        print(f"\nClassifier: {classifier_dir}")
        print(f"Embeddings: {embeddings_dir}")
        print("\nTo use real models with full weights:")
        print("1. Ensure internet connection to HuggingFace")
        print("2. Run: CONFIG=... python services/local-ai/train/train_classifier.py")
        print("3. Run: CONFIG=... python services/local-ai/train/train_embeddings.py")
        print("="*80 + "\n")
        return 0
    else:
        print("\n" + "="*80)
        print("ERROR: Failed to create mock models")
        print("="*80 + "\n")
        return 1


if __name__ == "__main__":
    sys.exit(main())
