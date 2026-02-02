import os
from typing import List, Optional

import numpy as np
import torch
from fastapi import FastAPI
from pymongo import MongoClient
from pydantic import BaseModel
from sentence_transformers import SentenceTransformer
from transformers import AutoModelForCausalLM, AutoModelForSequenceClassification, AutoTokenizer

app = FastAPI()

BASE_DIR = os.path.dirname(__file__)


def resolve_model_id(env_var: str, default_id: str, finetuned_rel_path: str) -> str:
    explicit = os.getenv(env_var)
    if explicit:
        return explicit
    finetuned_path = os.path.abspath(os.path.join(BASE_DIR, finetuned_rel_path))
    if os.path.isdir(finetuned_path):
        return finetuned_path
    return default_id


QWEN_MODEL_ID = resolve_model_id(
    "QWEN_MODEL_ID",
    "Qwen/Qwen2.5-1.5B-Instruct",
    "../../models/finetuned/qwen-credit-sft",
)
DISTILBERT_MODEL_ID = resolve_model_id(
    "DISTILBERT_MODEL_ID",
    "distilbert-base-uncased",
    "../../models/finetuned/distilbert-eligibility",
)
MINILM_MODEL_ID = resolve_model_id(
    "MINILM_MODEL_ID",
    "sentence-transformers/all-MiniLM-L6-v2",
    "../../models/finetuned/minilm-embeddings",
)
KNOWLEDGE_BASE_DIR = os.getenv("KNOWLEDGE_BASE_DIR", "../../data/knowledge-base")
MONGODB_URI = os.getenv("MONGODB_URI")
MONGODB_DB = os.getenv("MONGODB_DB", "credit_ai")

DEVICE = "cuda" if torch.cuda.is_available() else "cpu"

qwen_tokenizer = AutoTokenizer.from_pretrained(QWEN_MODEL_ID)
qwen_model = AutoModelForCausalLM.from_pretrained(QWEN_MODEL_ID).to(DEVICE)

bert_tokenizer = AutoTokenizer.from_pretrained(DISTILBERT_MODEL_ID)
bert_model = AutoModelForSequenceClassification.from_pretrained(DISTILBERT_MODEL_ID).to(DEVICE)

minilm_model = SentenceTransformer(MINILM_MODEL_ID, device=DEVICE)

LABELS = {
    "eligible": "Clear factual inaccuracy with evidence or strong basis for dispute",
    "conditionally_eligible": "Possible inaccuracy but requires verification or additional evidence",
    "not_eligible": "Information appears accurate or does not meet dispute criteria",
    "insufficient_information": "Not enough information to determine dispute eligibility",
}



def build_prompt(system: Optional[str], user: str) -> str:
    messages = []
    if system:
        messages.append({"role": "system", "content": system})
    messages.append({"role": "user", "content": user})
    return qwen_tokenizer.apply_chat_template(messages, tokenize=False, add_generation_prompt=True)


def generate_text(system: Optional[str], user: str, max_new_tokens: int = 512, temperature: float = 0.3) -> str:
    prompt = build_prompt(system, user)
    inputs = qwen_tokenizer(prompt, return_tensors="pt").to(DEVICE)
    with torch.no_grad():
        outputs = qwen_model.generate(
            **inputs,
            max_new_tokens=max_new_tokens,
            temperature=temperature,
            do_sample=temperature > 0,
        )
    decoded = qwen_tokenizer.decode(outputs[0], skip_special_tokens=True)
    # Remove prompt echo if present
    return decoded.replace(prompt, "").strip()


class ChatRequest(BaseModel):
    system: Optional[str] = None
    user: str
    max_new_tokens: int = 512
    temperature: float = 0.3


class ClassifyRequest(BaseModel):
    text: str


class EmbedRequest(BaseModel):
    texts: List[str]


class RetrieveRequest(BaseModel):
    query: str
    top_k: int = 5


class ChatResponse(BaseModel):
    content: str


class ClassifyResponse(BaseModel):
    eligibility: str
    confidence: float
    reasoning: dict


class EmbedResponse(BaseModel):
    embeddings: List[List[float]]


class RetrieveResponse(BaseModel):
    contexts: List[str]


documents = []
doc_embeddings = None
mongo_client = None
mongo_db = None


def load_knowledge_base():
    global documents, doc_embeddings
    docs = []

    if not os.path.isdir(KNOWLEDGE_BASE_DIR):
        documents = []
        doc_embeddings = None
        return

    for root, _, files in os.walk(KNOWLEDGE_BASE_DIR):
        for name in files:
            if not name.endswith(".md"):
                continue
            path = os.path.join(root, name)
            with open(path, "r", encoding="utf-8") as f:
                content = f.read()
            for chunk in content.split("\n\n"):
                text = chunk.strip()
                if len(text) < 40:
                    continue
                docs.append(f"[{name}] {text}")

    documents = docs
    if documents:
        doc_embeddings = minilm_model.encode(documents, normalize_embeddings=True)
    else:
        doc_embeddings = None


@app.on_event("startup")
def startup_event():
    global mongo_client, mongo_db
    if MONGODB_URI:
        mongo_client = MongoClient(MONGODB_URI)
        mongo_db = mongo_client[MONGODB_DB]
    load_knowledge_base()


@app.get("/health")
def health():
    mongo_status = "disabled"
    if mongo_client is not None:
        try:
            mongo_client.admin.command("ping")
            mongo_status = "connected"
        except Exception:
            mongo_status = "error"
    return {"status": "ok", "device": DEVICE, "mongo": mongo_status}


@app.get("/mongo/health")
def mongo_health():
    if mongo_client is None:
        return {"status": "disabled"}
    try:
        mongo_client.admin.command("ping")
        return {"status": "connected", "database": MONGODB_DB}
    except Exception as exc:
        return {"status": "error", "message": str(exc)}


@app.post("/chat", response_model=ChatResponse)
def chat(req: ChatRequest):
    content = generate_text(req.system, req.user, req.max_new_tokens, req.temperature)
    return ChatResponse(content=content)


@app.post("/classify", response_model=ClassifyResponse)
def classify(req: ClassifyRequest):
    encoded = bert_tokenizer(req.text, padding=True, truncation=True, return_tensors="pt").to(DEVICE)
    with torch.no_grad():
        logits = bert_model(**encoded).logits
    probs = torch.nn.functional.softmax(logits, dim=-1).cpu().numpy()[0]
    best_idx = int(np.argmax(probs))

    id2label = bert_model.config.id2label or {idx: label for idx, label in enumerate(LABELS.keys())}
    label_key = id2label.get(best_idx, str(best_idx))
    label = label_key if label_key in LABELS else label_key.lower()
    confidence = float(probs[best_idx])

    reasoning = {
        "factors": ["Semantic similarity match to eligibility criteria"],
        "requiredEvidence": ["Additional documentation may be required"],
        "complianceFlags": [],
    }

    return ClassifyResponse(
        eligibility=label,
        confidence=confidence,
        reasoning=reasoning,
    )


@app.post("/embed", response_model=EmbedResponse)
def embed(req: EmbedRequest):
    embeddings = minilm_model.encode(req.texts, normalize_embeddings=True)
    return EmbedResponse(embeddings=embeddings.tolist())


@app.post("/retrieve", response_model=RetrieveResponse)
def retrieve(req: RetrieveRequest):
    if not documents or doc_embeddings is None:
        return RetrieveResponse(contexts=[])

    query_embedding = minilm_model.encode([req.query], normalize_embeddings=True)[0]
    scores = np.dot(doc_embeddings, query_embedding)
    top_indices = np.argsort(scores)[-req.top_k:][::-1]
    contexts = [documents[i] for i in top_indices]
    return RetrieveResponse(contexts=contexts)
