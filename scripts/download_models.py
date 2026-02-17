#!/usr/bin/env python3
"""
Download HuggingFace models using direct file downloads.
This script downloads model files from HuggingFace's CDN and saves them locally.
"""
import os
import json
import argparse
from pathlib import Path
import subprocess
import sys


def download_file_with_curl(url, output_path):
    """Download a file using curl."""
    print(f"Downloading {url} to {output_path}...")
    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    
    cmd = ["curl", "-L", "-o", output_path, url, "--max-time", "60", "--retry", "3"]
    result = subprocess.run(cmd, capture_output=True, text=True)
    
    if result.returncode != 0:
        print(f"Error downloading {url}: {result.stderr}")
        return False
    
    if os.path.exists(output_path) and os.path.getsize(output_path) > 0:
        print(f"Successfully downloaded: {output_path} ({os.path.getsize(output_path)} bytes)")
        return True
    else:
        print(f"Failed to download or empty file: {output_path}")
        return False


def download_distilbert_model(output_dir):
    """Download DistilBERT base uncased model files."""
    print("\n" + "="*80)
    print("Downloading DistilBERT-base-uncased model...")
    print("="*80 + "\n")
    
    base_url = "https://huggingface.co/distilbert-base-uncased/resolve/main"
    
    files = [
        "config.json",
        "tokenizer_config.json",
        "vocab.txt",
        "tokenizer.json",
        "model.safetensors",
    ]
    
    os.makedirs(output_dir, exist_ok=True)
    
    success_count = 0
    for filename in files:
        url = f"{base_url}/{filename}"
        output_path = os.path.join(output_dir, filename)
        
        if download_file_with_curl(url, output_path):
            success_count += 1
    
    print(f"\nDownloaded {success_count}/{len(files)} files for DistilBERT")
    return success_count == len(files)


def download_minilm_model(output_dir):
    """Download sentence-transformers/all-MiniLM-L6-v2 model files."""
    print("\n" + "="*80)
    print("Downloading sentence-transformers/all-MiniLM-L6-v2 model...")
    print("="*80 + "\n")
    
    base_url = "https://huggingface.co/sentence-transformers/all-MiniLM-L6-v2/resolve/main"
    
    files = [
        "config.json",
        "tokenizer_config.json",
        "vocab.txt",
        "tokenizer.json",
        "model.safetensors",
        "config_sentence_transformers.json",
        "modules.json",
        "sentence_bert_config.json",
        "special_tokens_map.json",
    ]
    
    os.makedirs(output_dir, exist_ok=True)
    
    success_count = 0
    for filename in files:
        url = f"{base_url}/{filename}"
        output_path = os.path.join(output_dir, filename)
        
        if download_file_with_curl(url, output_path):
            success_count += 1
    
    # Also download the pytorch_model.bin as a fallback
    url = f"{base_url}/pytorch_model.bin"
    output_path = os.path.join(output_dir, "pytorch_model.bin")
    download_file_with_curl(url, output_path)
    
    print(f"\nDownloaded {success_count}/{len(files)} required files for MiniLM")
    return success_count >= len(files) - 3  # Allow some optional files to fail


def main():
    parser = argparse.ArgumentParser(description="Download HuggingFace models")
    parser.add_argument("--model", choices=["distilbert", "minilm", "both"], default="both",
                        help="Which model to download")
    parser.add_argument("--cache-dir", default=None,
                        help="Cache directory for models (default: ~/.cache/huggingface/hub)")
    
    args = parser.parse_args()
    
    if args.cache_dir:
        cache_dir = Path(args.cache_dir)
    else:
        cache_dir = Path.home() / ".cache" / "huggingface" / "hub"
    
    cache_dir.mkdir(parents=True, exist_ok=True)
    
    success = True
    
    if args.model in ["distilbert", "both"]:
        distilbert_dir = cache_dir / "models--distilbert-base-uncased" / "snapshots" / "main"
        if not download_distilbert_model(str(distilbert_dir)):
            success = False
    
    if args.model in ["minilm", "both"]:
        minilm_dir = cache_dir / "models--sentence-transformers--all-MiniLM-L6-v2" / "snapshots" / "main"
        if not download_minilm_model(str(minilm_dir)):
            success = False
    
    if success:
        print("\n" + "="*80)
        print("SUCCESS: All models downloaded successfully!")
        print("="*80)
        return 0
    else:
        print("\n" + "="*80)
        print("WARNING: Some models failed to download")
        print("="*80)
        return 1


if __name__ == "__main__":
    sys.exit(main())
