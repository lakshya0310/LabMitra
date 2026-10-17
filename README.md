# LabMitra (लैबमित्र) 🩺🇮🇳
> **Mobile-first Indian Diagnostic Blood Test Report Explainer with Local Semantic RAG & Sarvam AI**

LabMitra empowers Indian patients and elderly parents to understand complex diagnostic lab reports (Dr. Lal PathLabs, Thyrocare, Apollo Diagnostics, SRL, etc.) in a calm, comforting regional Indian voice without panic. It replaces intimidating clinical jargon with 100% Indian kitchen dietary swaps (methi dana water, roasted bhuna chana, moong dal chilla, lauki, ragi, chaas) and empowers families with practical questions to ask their consulting physician.

---

## Architecture: Split Cloud Deployment (Vercel + Render)

```
┌─────────────────────────────────────────────────────────────┐
│                 Vercel Frontend (SPA)                       │
│  - Vite + React + Tailwind CSS                              │
│  - Mobile Sticky Audio Player + Push-to-Talk Mic            │
│  - Reads VITE_API_BASE_URL (Render backend in prod)         │
│  - vercel.json: SPA rewrites + Camera/Mic Permissions Policy│
└──────────────────────────────┬──────────────────────────────┘
                               │ HTTPS / JSON & Multipart
                               ▼
┌─────────────────────────────────────────────────────────────┐
│             Render Web Service Backend (Free 512MB RAM)     │
│  - FastAPI + Uvicorn ($PORT dynamic binding)                │
│  - GET /health keep-alive endpoint (wakes sleeping dyno)    │
│  - OpenCV Headless (CLAHE contrast & deskewing in-memory)   │
│  - pdfplumber digital PDF parser                            │
│  - FastEmbed BAAI/bge-small-en-v1.5 (ONNX CPU, <160MB RAM)  │
│  - 15 Core Indian Biomarker Knowledge Base                  │
└──────────────────────────────┬──────────────────────────────┘
                               │ Sarvam AI APIs
                               ▼
┌─────────────────────────────────────────────────────────────┐
│                        Sarvam AI                            │
│  - Sarvam-105B: Empathetic Indic clinical reasoning         │
│  - Bulbul v4 / v3: Regional Text-to-Speech audio            │
│  - Saaras v4 / v3: Code-mixed Hinglish/Tanglish STT         │
│  - Sarvam Vision / Doc AI: Diagnostic table extraction      │
└─────────────────────────────────────────────────────────────┘
```

---

## Key Engineering Highlights

### 1. 512MB RAM Safety on Render (No PyTorch / OOM Safe)
- **Zero `torch`:** PyTorch causes Out-of-Memory (OOM) failures on Render's 512MB free tier.
- **FastEmbed ONNX Runtime:** Uses `fastembed` with `BAAI/bge-small-en-v1.5` and pure `numpy` cosine similarity. Total RAM remains under **~160MB**.
- **Build Pre-warming:** In `render.yaml`, the build command runs `python backend/prewarm_cache.py`, caching the ONNX model files in `./model_cache`. Render workers boot in **< 2 seconds** with zero port binding timeouts.
- **Headless OpenCV:** Strictly uses `opencv-python-headless` (never standard OpenCV which crashes on Linux due to missing X11/GUI libraries).

### 2. Sarvam AI Indic Stack Integration
- **`sarvam-105b`:** Generates warm, non-alarmist explanations in the patient's language (`hi-IN`, `te-IN`, `ta-IN`, `mr-IN`, `kn-IN`, `bn-IN`, `en-IN`).
- **`bulbul:v3` / `bulbul:v4`:** Renders base64 audio for the mobile sticky audio player.
- **`saaras:v3` / `saaras:v4` (`mode="codemix"`):** Transcribes voice follow-up questions spoken in natural Hinglish or regional Indian accents.
- **Document AI / `pdfplumber`:** Dual pipeline with zero disk I/O leaks on Render ephemeral storage.

### 3. Local Indian Dietary Knowledge Base (`backend/knowledge_base.json`)
Indexes 15 core Indian diagnostic biomarkers with normal ranges, plain meaning, and 100% Indian kitchen swaps (strictly avoiding Western suggestions like avocado, quinoa, or salmon):
1. `HbA1c`
2. `Fasting Blood Sugar`
3. `Total Cholesterol`
4. `Triglycerides`
5. `HDL`
6. `LDL`
7. `TSH`
8. `Hemoglobin`
9. `Vitamin D (25-OH)`
10. `Vitamin B12`
11. `Uric Acid`
12. `Serum Creatinine`
13. `SGPT/ALT`
14. `SGOT/AST`
15. `Platelet Count`

---

## Monorepo Directory Structure

```text
build-a-thon/
├── backend/
│   ├── config.py                 # Environment configuration, dynamic CORS, Port
│   ├── document_processor.py     # In-memory OpenCV (CLAHE, deskewing) & pdfplumber
│   ├── knowledge_base.json       # 15 core Indian biomarkers & kitchen swaps
│   ├── main.py                   # FastAPI application & REST endpoints
│   ├── prewarm_cache.py          # Render build-time ONNX cache prewarming
│   ├── rag_service.py            # FastEmbed ONNX + numpy vector similarity
│   ├── requirements.txt          # 512MB RAM safe dependencies
│   ├── sarvam_service.py         # Sarvam-105B, Bulbul TTS, Saaras STT
│   └── Dockerfile                # Optional Docker container definition
├── frontend/
│   ├── index.html                # Responsive viewport & Google Indic fonts
│   ├── package.json              # React 18, Vite, Tailwind CSS, Lucide
│   ├── vercel.json               # SPA rewrites & camera/mic permissions policy
│   ├── vite.config.js
│   ├── tailwind.config.js
│   ├── postcss.config.js
│   └── src/
│       ├── App.jsx               # Main state orchestrator
│       ├── main.jsx              # React DOM root
│       ├── index.css             # Tailwind base & mobile styling
│       ├── components/
│       │   ├── Header.jsx                # Branding & Render sleep/wake pill
│       │   ├── UploadSection.jsx         # Camera/PDF upload + 1-click presets
│       │   ├── PatientSummaryCard.jsx    # Doctor greeting & reassurance
│       │   ├── BiomarkerCard.jsx         # Status badges & Indian food swaps
│       │   ├── DoctorQuestionsCard.jsx   # Non-intimidating clinic questions
│       │   ├── AudioPlayerSticky.jsx     # Bottom mobile player with speed & script
│       │   └── VoiceFollowUp.jsx         # Push-to-talk Saaras mic Q&A
│       ├── data/
│       │   └── sampleReports.js          # Dr. Lal, Thyrocare, Apollo presets
│       └── services/
│           └── api.js                    # REST API client with auto-fallback
├── render.yaml                   # Infrastructure-as-code for Render Web Service
├── tests/
│   └── test_backend.py           # Automated test suite
└── README.md
```

---

## Local Development Setup

### 1. Backend Setup
```bash
# In project root
python -m venv .venv
# On Windows:
.\.venv\Scripts\activate
# On Linux/macOS:
# source .venv/bin/activate

pip install -r backend/requirements.txt
python backend/prewarm_cache.py

# Run FastAPI server
uvicorn backend.main:app --host 0.0.0.0 --port 8000 --reload
```

Verify backend health:
```bash
curl http://localhost:8000/health
```

### 2. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```
Open `http://localhost:5173` in your browser.

---

## Cloud Deployment Guide

### Deploying Backend to Render
1. Push this repository to GitHub.
2. In [Render Dashboard](https://dashboard.render.com), click **New +** -> **Blueprint** and select this repo (it will automatically detect [`render.yaml`](file:///c:/Users/Hi/build-a-thon/render.yaml)).
3. In the Render environment settings, add your secret environment variable:
   - `SARVAM_API_KEY`: `your_sarvam_api_key`
4. Deploy! The service will pre-warm the FastEmbed ONNX weights during build and bind to `$PORT`.

### Deploying Frontend to Vercel
1. In [Vercel Dashboard](https://vercel.com), click **Add New Project** and import the repository.
2. Set **Root Directory** to `frontend`.
3. Set the Environment Variable:
   - `VITE_API_BASE_URL`: `https://your-render-app-name.onrender.com`
4. Click **Deploy**. Vercel will build the SPA and apply [`frontend/vercel.json`](file:///c:/Users/Hi/build-a-thon/frontend/vercel.json).
