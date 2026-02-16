# 🚀 Quick Start: Train AI Models on Google Colab

**Time Required**: 10-15 minutes  
**Cost**: FREE (uses free Google Colab GPU)

---

## 📋 Prerequisites

- Google account
- Web browser
- Internet connection

**That's it!** No local setup required.

---

## 🎯 Step-by-Step Guide

### Option 1: Use the Colab Notebook (Recommended)

1. **Open the Notebook**
   - Click this link: [Open in Colab](https://colab.research.google.com/github/sevillanosebastianof28-hub/creditaioi/blob/main/COLAB_TRAINING.ipynb)
   - Or go to https://colab.research.google.com/ and upload `COLAB_TRAINING.ipynb`

2. **Enable GPU** (Recommended for faster training)
   - Click **Runtime** → **Change runtime type**
   - Select **T4 GPU** from Hardware accelerator
   - Click **Save**

3. **Run All Cells**
   - Click **Runtime** → **Run all**
   - Or press `Ctrl+F9` (Windows/Linux) or `Cmd+F9` (Mac)

4. **Wait for Training**
   - Classifier: ~3 minutes on GPU
   - Embeddings: ~10 seconds on GPU
   - Total: ~5-10 minutes including setup

5. **Download Models**
   - The last cell will automatically download `trained_models.zip`
   - Check your browser's download folder

### Option 2: Copy-Paste Commands

Open a new [Google Colab notebook](https://colab.research.google.com/) and run these commands:

```python
# 1. Clone repository
!git clone https://github.com/sevillanosebastianof28-hub/creditaioi.git
%cd creditaioi

# 2. Install dependencies
!pip install -q -r services/local-ai/requirements.txt

# 3. Train classifier (~3 min on GPU)
!CONFIG=services/local-ai/train/configs/model2_classifier.yaml \
 python services/local-ai/train/train_classifier.py

# 4. Train embeddings (~10 sec on GPU)
!CONFIG=services/local-ai/train/configs/model3_embeddings.yaml \
 python services/local-ai/train/train_embeddings.py

# 5. Package and download
!zip -r trained_models.zip models/finetuned/
from google.colab import files
files.download('trained_models.zip')
```

---

## 📦 What You'll Get

After training, you'll download `trained_models.zip` containing:

```
models/
└── finetuned/
    ├── distilbert-eligibility/        (~256 MB)
    │   ├── config.json
    │   ├── model.safetensors          (model weights)
    │   ├── tokenizer.json
    │   ├── vocab.txt
    │   └── test_metrics.json          (accuracy: ~100%, F1: 1.0)
    │
    └── minilm-embeddings/             (~88 MB)
        ├── config.json
        ├── model.safetensors          (model weights)
        ├── modules.json
        └── 1_Pooling/config.json
```

**Total size**: ~350 MB compressed

---

## 🎯 Expected Results

### Classifier Model
```
Accuracy: 100%
Macro F1: 1.0
Per-class accuracy: 100% for all 4 classes
```

**Classes**:
- `eligible` - Clear factual inaccuracy
- `conditionally_eligible` - Possible inaccuracy
- `not_eligible` - Accurate information
- `insufficient_information` - Not enough data

### Embeddings Model
```
Training loss: ~0.264
Embedding dimension: 384
Use case: Semantic search for credit domain
```

---

## 🚀 Deploy the Models

After downloading, deploy to your production environment:

### Option 1: Cloud Storage

```bash
# Extract models
unzip trained_models.zip

# Upload to S3 (example)
aws s3 cp models/finetuned/ s3://your-bucket/models/ --recursive

# Or Google Cloud Storage
gsutil -m cp -r models/finetuned/ gs://your-bucket/models/

# Or Azure Blob Storage
az storage blob upload-batch -d models -s models/finetuned/
```

### Option 2: Direct Server Deploy

```bash
# Extract on your server
unzip trained_models.zip

# Copy to production location
cp -r models/finetuned/* /path/to/production/models/

# Set permissions
chmod -R 755 /path/to/production/models/
```

### Option 3: Include in Docker Image

```dockerfile
# Dockerfile
FROM python:3.12-slim
COPY models/finetuned/ /app/models/finetuned/
# ... rest of Dockerfile
```

---

## ✅ Verify Models Work

After deploying, test the models:

```bash
# Start the AI service
cd services/local-ai
ENABLE_LLM=false uvicorn main:app --host 0.0.0.0 --port 8000
```

Test endpoints:

```bash
# Health check
curl http://localhost:8000/health

# Test classifier
curl -X POST http://localhost:8000/classify \
  -H "Content-Type: application/json" \
  -d '{"text": "This charge-off is inaccurate and should be removed"}'

# Test embeddings
curl -X POST http://localhost:8000/embed \
  -H "Content-Type: application/json" \
  -d '{"text": "Credit report dispute letter"}'
```

Expected responses:
- Classifier: `{"class": "eligible", "confidence": 0.95}`
- Embeddings: `{"embedding": [0.123, -0.456, ...], "dimension": 384}`

---

## 🐛 Troubleshooting

### Issue: GPU Not Available

**Solution**: Enable GPU runtime
1. Runtime → Change runtime type
2. Select T4 GPU
3. Save and re-run cells

### Issue: Out of Memory

**Solutions**:
- Use minimal configs: `model2_classifier_minimal.yaml`
- Reduce batch size in config
- Restart runtime: Runtime → Restart runtime

### Issue: Dependency Installation Fails

**Solutions**:
- Restart runtime
- Re-run installation cell
- Check Colab isn't blocking pip

### Issue: Training Takes Forever

**Expected times**:
- **With GPU**: Classifier ~3 min, Embeddings ~10 sec
- **Without GPU**: Classifier ~17 min, Embeddings ~26 sec

**Solution**: Make sure GPU is enabled (check with `!nvidia-smi`)

### Issue: Download Doesn't Start

**Solutions**:
- Check browser pop-up blocker
- Try downloading manually: Click folder icon → Right-click file → Download
- Use alternative download:
  ```python
  from google.colab import drive
  drive.mount('/content/drive')
  !cp trained_models.zip /content/drive/MyDrive/
  ```

### Issue: Models Not Found After Training

**Solutions**:
- Check for errors in training output
- Verify files exist: `!ls -la models/finetuned/*/`
- Check disk space: Runtime → Manage sessions

---

## 📊 Training Details

### Classifier Training

**Model**: DistilBERT base uncased  
**Task**: 4-class sequence classification  
**Dataset**:
- Training: 1,200 examples
- Validation: 600 examples
- Test: 600 examples

**Hyperparameters**:
- Epochs: 6
- Batch size: 16
- Learning rate: 2e-5
- Weight decay: 0.01

### Embeddings Training

**Model**: sentence-transformers/all-MiniLM-L6-v2  
**Task**: Semantic similarity learning  
**Dataset**:
- Training pairs: 450
- Validation pairs: 100

**Hyperparameters**:
- Epochs: 1
- Batch size: 32
- Loss: CosineSimilarityLoss

---

## 🔄 Update Models Later

To retrain with new data:

1. Update training data in `data/finetune/`
2. Re-run the Colab notebook
3. Download new models
4. Deploy updated models

---

## 📚 Additional Resources

- **Full Training Guide**: [AI_TRAINING_GUIDE.md](AI_TRAINING_GUIDE.md)
- **Technical Status**: [AI_TRAINING_STATUS.md](AI_TRAINING_STATUS.md)
- **Implementation Details**: [ML_IMPLEMENTATION_STATUS.md](ML_IMPLEMENTATION_STATUS.md)
- **Model Documentation**: [models/README.md](models/README.md)

---

## 🆘 Need Help?

1. Check the troubleshooting section above
2. Review training output for errors
3. See documentation in the repository
4. Check Google Colab logs: View → Execution history

---

## ⏱️ Time Breakdown

| Step | Time (GPU) | Time (CPU) |
|------|-----------|-----------|
| Setup & clone | 1 min | 1 min |
| Install dependencies | 2-3 min | 2-3 min |
| Train classifier | 3 min | 17 min |
| Train embeddings | 10 sec | 26 sec |
| Package & download | 1 min | 1 min |
| **Total** | **~7-10 min** | **~20-25 min** |

**Recommendation**: Use GPU for 3x faster training (still free!)

---

## ✅ Success Checklist

After completing training, you should have:

- [x] `trained_models.zip` downloaded (~350 MB)
- [x] Classifier model with 100% accuracy
- [x] Embeddings model with 384-dim vectors
- [x] Evaluation report with metrics
- [x] Models ready for production deployment

---

**Ready to train? Click here**: [Open in Colab](https://colab.research.google.com/github/sevillanosebastianof28-hub/creditaioi/blob/main/COLAB_TRAINING.ipynb)

🎉 **Your AI models will be ready in 10 minutes!**
