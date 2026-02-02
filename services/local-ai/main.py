import os
from typing import List, Optional

import numpy as np
import torch
from fastapi import FastAPI
from pydantic import BaseModel
from sentence_transformers import SentenceTransformer
from transformers import AutoModel, AutoModelForCausalLM, AutoTokenizer

app = FastAPI()

QWEN_MODEL_ID = os.getenv("QWEN_MODEL_ID", "Qwen/Qwen2.5-1.5B-Instruct")
DISTILBERT_MODEL_ID = os.getenv("DISTILBERT_MODEL_ID", "distilbert-base-uncased")
MINILM_MODEL_ID = os.getenv("MINILM_MODEL_ID", "sentence-transformers/all-MiniLM-L6-v2")
KNOWLEDGE_BASE_DIR = os.getenv("KNOWLEDGE_BASE_DIR", "../../data/knowledge-base")

DEVICE = "cuda" if torch.cuda.is_available() else "cpu"

qwen_tokenizer = AutoTokenizer.from_pretrained(QWEN_MODEL_ID)
qwen_model = AutoModelForCausalLM.from_pretrained(QWEN_MODEL_ID).to(DEVICE)

bert_tokenizer = AutoTokenizer.from_pretrained(DISTILBERT_MODEL_ID)
bert_model = AutoModel.from_pretrained(DISTILBERT_MODEL_ID).to(DEVICE)

minilm_model = SentenceTransformer(MINILM_MODEL_ID, device=DEVICE)

LABELS = {
    "eligible": "Clear factual inaccuracy with evidence or strong basis for dispute",
    "conditionally_eligible": "Possible inaccuracy but requires verification or additional evidence",
    "not_eligible": "Information appears accurate or does not meet dispute criteria",
    "insufficient_information": "Not enough information to determine dispute eligibility",
}

label_embeddings = None


def mean_pooling(model_output, attention_mask):
    token_embeddings = model_output[0]
    input_mask_expanded = attention_mask.unsqueeze(-1).expand(token_embeddings.size()).float()
    return torch.sum(token_embeddings * input_mask_expanded, 1) / torch.clamp(input_mask_expanded.sum(1), min=1e-9)


def embed_with_distilbert(texts: List[str]) -> np.ndarray:
    encoded = bert_tokenizer(texts, padding=True, truncation=True, return_tensors="pt").to(DEVICE)
    with torch.no_grad():
        model_output = bert_model(**encoded)
    embeddings = mean_pooling(model_output, encoded["attention_mask"])
    embeddings = torch.nn.functional.normalize(embeddings, p=2, dim=1)
    return embeddings.cpu().numpy()


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
    global label_embeddings
    label_embeddings = embed_with_distilbert(list(LABELS.values()))
    load_knowledge_base()


@app.get("/health")
def health():
    return {"status": "ok", "device": DEVICE}


@app.post("/chat", response_model=ChatResponse)
def chat(req: ChatRequest):
    content = generate_text(req.system, req.user, req.max_new_tokens, req.temperature)
    return ChatResponse(content=content)


@app.post("/classify", response_model=ClassifyResponse)
def classify(req: ClassifyRequest):
    embeddings = embed_with_distilbert([req.text])
    sims = np.dot(embeddings, label_embeddings.T)[0]
    best_idx = int(np.argmax(sims))
    label = list(LABELS.keys())[best_idx]
    scores = np.exp(sims) / np.sum(np.exp(sims))
    confidence = float(scores[best_idx])

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
