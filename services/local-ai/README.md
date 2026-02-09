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
- `MONGODB_URI` (required to enable MongoDB)
- `MONGODB_DB` (default: credit_ai)
   - source .venv/bin/activate
   - pip install -r requirements.txt

3. Run the service:
   - export QWEN_MODEL_ID=/models/qwen
   - export DISTILBERT_MODEL_ID=/models/distilbert
   - uvicorn main:app --host 0.0.0.0 --port 8000

4. Point edge functions to the local service:
   - export LOCAL_AI_BASE_URL=http://localhost:8000

## Notes
- DistilBERT is used as a semantic similarity classifier for dispute eligibility. For production-grade accuracy, replace with a fine-tuned classifier checkpoint.
- Retrieval uses markdown files under data/knowledge-base and src/data/knowledge-base. You can override with KNOWLEDGE_BASE_DIRS.

## RAG Ingestion (Approved Sources)
1. Configure sources and chunking in ai/config/rag_sources.yaml.
2. Run: python scripts/ingest_rag.py --config ai/config/rag_sources.yaml
3. The ingested chunks are saved to data/knowledge-base/ingested.

Environment overrides:
- KNOWLEDGE_BASE_DIRS: colon-separated list of knowledge base directories.
