# Fine-Tuned Models

This directory contains fine-tuned AI models for the credit AI system. 

**Note**: Model weights are **not included in git** due to file size limitations (255MB classifier + 87MB embeddings exceeds GitHub's 100MB limit).

## Models

### 1. DistilBERT Eligibility Classifier
- **Path**: `finetuned/distilbert-eligibility/`
- **Size**: ~256MB
- **Purpose**: 4-class dispute eligibility classification
- **Classes**: `eligible`, `conditionally_eligible`, `not_eligible`, `insufficient_information`
- **Performance**: 100% test accuracy, F1=1.0

### 2. MiniLM Embeddings
- **Path**: `finetuned/minilm-embeddings/`
- **Size**: ~88MB
- **Purpose**: Semantic search and retrieval for RAG
- **Base**: sentence-transformers/all-MiniLM-L6-v2

### 3. Qwen SFT Model (Optional)
- **Path**: `finetuned/qwen-credit-sft/`
- **Size**: ~3GB
- **Purpose**: Generate credit advice and dispute letters
- **Status**: Not trained (requires ≥6GB RAM or GPU)

## How to Regenerate Models

### Prerequisites
```bash
# Install dependencies
pip install -r services/local-ai/requirements.txt
```

### Train All Models
```bash
# 1. Train Classifier (~18 minutes on CPU)
CONFIG=services/local-ai/train/configs/model2_classifier_plus.yaml \
python services/local-ai/train/train_classifier.py

# 2. Train Embeddings (~30 seconds on CPU)
CONFIG=services/local-ai/train/configs/model3_embeddings_plus.yaml \
python services/local-ai/train/train_embeddings.py

# 3. Train SFT Model (optional, requires GPU or ≥8GB RAM)
CONFIG=services/local-ai/train/configs/model1_sft_plus.yaml \
python services/local-ai/train/train_sft.py
```

### Download Pre-trained Models (Alternative)

If available, download pre-trained models from cloud storage:
```bash
# TODO: Add download links when models are hosted
# wget https://example.com/distilbert-eligibility.tar.gz
# tar -xzf distilbert-eligibility.tar.gz -C finetuned/
```

## Evaluation

After training, run the evaluation harness:
```bash
python scripts/evaluate_models.py
```

This will generate `AI_EVALUATION_REPORT.json` with:
- Classifier accuracy metrics
- Embeddings similarity scores
- SFT hallucination detection
- Compliance checking

## Model Storage

For production deployment:
1. Upload models to cloud storage (S3, GCS, Azure Blob)
2. Configure `DISTILBERT_MODEL_ID` and `MINILM_MODEL_ID` env vars in service
3. Models will be auto-downloaded on first startup

Example:
```bash
export DISTILBERT_MODEL_ID=s3://your-bucket/distilbert-eligibility
export MINILM_MODEL_ID=s3://your-bucket/minilm-embeddings
```

## Directory Structure

```
models/
├── README.md                          # This file
└── finetuned/                         # Fine-tuned models (git-ignored)
    ├── distilbert-eligibility/        # Classifier model
    │   ├── config.json
    │   ├── model.safetensors          # 256MB
    │   ├── tokenizer.json
    │   └── ...
    ├── minilm-embeddings/             # Embeddings model
    │   ├── config.json
    │   ├── model.safetensors          # 87MB
    │   └── ...
    └── qwen-credit-sft/               # SFT model (optional)
        └── ...
```

## Troubleshooting

**Out of Memory during training:**
- Use minimal configs: `model*_minimal.yaml`
- Reduce batch size in config files
- Enable gradient checkpointing (already enabled)
- Use cloud GPU instances (Google Colab, Lambda Labs, RunPod)

**Training too slow:**
- Classifier: ~18 min on CPU is normal
- Embeddings: ~30 sec on CPU is normal
- SFT: Requires GPU (impossible on CPU with 1.5B params)

**Models not loading in service:**
- Check paths: Models should be in `models/finetuned/*/`
- Verify file exists: `models/finetuned/distilbert-eligibility/model.safetensors`
- Check permissions: Files should be readable

For more details, see [AI_MODEL_IMPROVEMENT_SUMMARY.md](../AI_MODEL_IMPROVEMENT_SUMMARY.md)
