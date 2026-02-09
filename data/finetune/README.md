# Fine-tuning datasets

Place JSONL datasets here. Current expected files:

- model2_classifier.train.jsonl
- model2_classifier.valid.jsonl
- model2_classifier.test.jsonl

- model1_sft.train.jsonl
- model1_sft.valid.jsonl

- model3_pairs.train.jsonl (optional)
- model3_pairs.valid.jsonl (optional)

Reference originals (optional):
- dispute_classifier.csv / dispute_classifier.jsonl
- credit_ai_llm.jsonl
- credit_education.csv / credit_education.jsonl
- embedding_pairs.jsonl

Synthetic generator (defaults to “Good” sizes):
- Classifier: 1500
- SFT: 1000
- Embeddings: 1000

Run: python data/finetune/generate_synthetic_datasets.py
Override counts with env vars:
- CLASSIFIER_COUNT
- SFT_COUNT
- EMBEDDING_COUNT

Custom datasets:
- Place additional datasets under datasets/ (see datasets/README.md).
- Build derived JSONL files: python scripts/prepare_custom_datasets.py
- Use the *_plus.yaml configs in services/local-ai/train/configs to include them.
