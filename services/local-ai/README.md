# Local AI Service

This service runs the requested models locally and exposes a small HTTP API for the Supabase edge functions.

## Models
- Model 1 (reasoning + responses): Qwen/Qwen2.5-1.5B-Instruct
- Model 2 (classification): distilbert-base-uncased (semantic similarity classifier)
- Model 3 (embeddings + retrieval): sentence-transformers/all-MiniLM-L6-v2

## Setup
1. Clone the models (or rely on automatic download):
   - git clone https://huggingface.co/Qwen/Qwen2.5-1.5B-Instruct /models/qwen
   - git clone https://huggingface.co/distilbert-base-uncased /models/distilbert
   - git clone https://huggingface.co/sentence-transformers/all-MiniLM-L6-v2 /models/minilm

2. Install dependencies:
   - python -m venv .venv
   - source .venv/bin/activate
   - pip install -r requirements.txt

3. Run the service:
   - export QWEN_MODEL_ID=/models/qwen
   - export DISTILBERT_MODEL_ID=/models/distilbert
   - export MINILM_MODEL_ID=/models/minilm
   - export KNOWLEDGE_BASE_DIR=../../data/knowledge-base
   - uvicorn main:app --host 0.0.0.0 --port 8000

4. Point edge functions to the local service:
   - export LOCAL_AI_BASE_URL=http://localhost:8000

## Notes
- DistilBERT is used as a semantic similarity classifier for dispute eligibility. For production-grade accuracy, replace with a fine-tuned classifier checkpoint.
- Retrieval uses the knowledge-base markdown files under data/knowledge-base.
