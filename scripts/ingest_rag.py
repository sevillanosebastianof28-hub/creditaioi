import argparse
import hashlib
import os
import re
import time
from datetime import datetime, timezone
from typing import Dict, Iterable, List, Optional, Set
from urllib.parse import urljoin, urlparse
from io import BytesIO

import requests
import trafilatura
import yaml
from lxml import html
from pypdf import PdfReader


def load_config(path: str) -> dict:
    with open(path, "r", encoding="utf-8") as f:
        return yaml.safe_load(f)


def normalize_url(url: str) -> str:
    parsed = urlparse(url)
    if not parsed.scheme:
        return f"https://{url}"
    return url


def slugify(value: str) -> str:
    value = value.lower()
    value = re.sub(r"[^a-z0-9]+", "-", value).strip("-")
    return value or "doc"


def is_allowed(url: str, exclude_patterns: List[str]) -> bool:
    lower = url.lower()
    return not any(pattern in lower for pattern in exclude_patterns)


def same_domain(a: str, b: str) -> bool:
    return urlparse(a).netloc == urlparse(b).netloc


def iter_links(base_url: str, html_text: str) -> Iterable[str]:
    try:
        doc = html.fromstring(html_text)
    except Exception:
        return []
    links = set()
    for element, attribute, link, _ in doc.iterlinks():
        if attribute != "href":
            continue
        if not link:
            continue
        absolute = urljoin(base_url, link)
        links.add(absolute)
    return links


def extract_pdf_text(content: bytes) -> str:
    reader = PdfReader(BytesIO(content))
    texts = []
    for page in reader.pages:
        page_text = page.extract_text() or ""
        if page_text.strip():
            texts.append(page_text)
    return "\n".join(texts)


def extract_text(url: str, response: requests.Response) -> str:
    if url.lower().endswith(".pdf"):
        return extract_pdf_text(response.content)

    downloaded = response.text
    text = trafilatura.extract(downloaded)
    if text:
        return text

    try:
        doc = html.fromstring(downloaded)
        return doc.text_content()
    except Exception:
        return ""


def chunk_text(text: str, chunk_size: int, overlap: int) -> List[str]:
    words = text.split()
    if not words:
        return []
    chunks = []
    step = max(chunk_size - overlap, 1)
    for start in range(0, len(words), step):
        end = min(start + chunk_size, len(words))
        chunk = " ".join(words[start:end]).strip()
        if chunk:
            chunks.append(chunk)
        if end == len(words):
            break
    return chunks


def write_chunks(
    output_dir: str,
    source_name: str,
    url: str,
    authority_level: str,
    jurisdiction: str,
    retrieved_at: str,
    last_updated: str,
    chunks: List[str],
) -> None:
    domain = urlparse(url).netloc.replace(":", "-")
    url_hash = hashlib.sha256(url.encode("utf-8")).hexdigest()[:10]
    base_slug = slugify(f"{domain}-{source_name}-{url_hash}")

    os.makedirs(output_dir, exist_ok=True)
    for idx, chunk in enumerate(chunks, start=1):
        filename = f"{base_slug}-chunk-{idx:03d}.md"
        path = os.path.join(output_dir, filename)
        front_matter = "\n".join(
            [
                "---",
                f"source_url: {url}",
                f"authority_level: {authority_level}",
                f"jurisdiction: {jurisdiction}",
                f"retrieved_at: {retrieved_at}",
                f"last_updated: {last_updated}",
                "---",
                "",
            ]
        )
        with open(path, "w", encoding="utf-8") as f:
            f.write(front_matter)
            f.write(chunk)
            f.write("\n")


def fetch_url(url: str, headers: Dict[str, str], timeout: int) -> Optional[requests.Response]:
    try:
        response = requests.get(url, headers=headers, timeout=timeout)
    except Exception:
        return None
    if response.status_code >= 400:
        return None
    return response


def crawl_source(
    source: dict,
    config: dict,
    visited: Set[str],
    domain_counts: Dict[str, int],
) -> None:
    output_dir = config["output_dir"]
    chunk_size = int(config["chunk_size_tokens"])
    overlap = int(config["chunk_overlap_tokens"])
    crawl_depth = int(config["crawl_depth"])
    max_pages = int(config["max_pages_per_domain"])
    delay = float(config["request_delay_seconds"])
    exclude = config.get("exclude_url_patterns", [])

    authority_level = source.get("authority_level", "secondary")
    jurisdiction = source.get("jurisdiction", config.get("jurisdiction_default", "US"))
    user_agent = config.get("user_agent", "CreditAI-RAG-Ingest/1.0")

    headers = {"User-Agent": user_agent}
    queue = [(normalize_url(url), 0) for url in source.get("urls", [])]

    while queue:
        url, depth = queue.pop(0)
        if url in visited:
            continue
        if not is_allowed(url, exclude):
            continue

        domain = urlparse(url).netloc
        if domain_counts.get(domain, 0) >= max_pages:
            continue

        response = fetch_url(url, headers=headers, timeout=20)
        if not response:
            continue

        visited.add(url)
        domain_counts[domain] = domain_counts.get(domain, 0) + 1

        retrieved_at = datetime.now(timezone.utc).isoformat()
        last_updated = response.headers.get("Last-Modified", "unknown")

        text = extract_text(url, response)
        if text:
            chunks = chunk_text(text, chunk_size=chunk_size, overlap=overlap)
            if chunks:
                write_chunks(
                    output_dir=output_dir,
                    source_name=source["name"],
                    url=url,
                    authority_level=authority_level,
                    jurisdiction=jurisdiction,
                    retrieved_at=retrieved_at,
                    last_updated=last_updated,
                    chunks=chunks,
                )

        if depth >= crawl_depth or url.lower().endswith(".pdf"):
            time.sleep(delay)
            continue

        try:
            links = list(iter_links(url, response.text))
        except Exception:
            links = []

        for link in links:
            if link in visited:
                continue
            if not same_domain(url, link):
                continue
            if not is_allowed(link, exclude):
                continue
            queue.append((link, depth + 1))

        time.sleep(delay)


def main() -> None:
    parser = argparse.ArgumentParser(description="Ingest approved RAG sources into markdown chunks")
    parser.add_argument("--config", default="ai/config/rag_sources.yaml")
    args = parser.parse_args()

    config = load_config(args.config)
    output_dir = config.get("output_dir", "data/knowledge-base/ingested")
    os.makedirs(output_dir, exist_ok=True)

    visited: Set[str] = set()
    domain_counts: Dict[str, int] = {}

    for source in config.get("sources", []):
        crawl_source(source, config, visited, domain_counts)


if __name__ == "__main__":
    main()
