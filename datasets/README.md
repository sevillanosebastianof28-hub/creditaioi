# Custom Datasets

Place additional labeled datasets here to enhance model fine-tuning. These files are expected by the data preparation pipeline.

## Credit Dispute Dataset (Core)
Path: datasets/credit_disputes/
- dispute_reasons.csv
- dispute_outcomes.csv
- bureau_response_times.csv

## Credit Report Tradeline Taxonomy
Path: datasets/tradelines/
- tradeline_types.json
- negative_item_codes.csv

## Credit Letter Templates (RAG-Ready)
Path: datasets/templates/
- 609_letters.json
- 611_letters.json
- goodwill_letters.json
- identity_theft_letters.json

## Compliance and Legal Mapping Dataset
Path: datasets/compliance/
- fcra_sections.json
- cfpb_guidelines.yaml
- prohibited_claims.json

## Credit Improvement Strategy Dataset
Path: datasets/strategies/
- score_optimization.csv
- utilization_strategies.json
- timeline_expectations.csv

## Model Evaluation and Guardrails
Path: datasets/ai_eval/
- hallucination_traps.json
- forbidden_advice.json
- safe_completion_examples.json
