import os
from pathlib import Path
from dotenv import load_dotenv

# Load .env file from backend directory or project root
backend_dir = Path(__file__).resolve().parent
root_dir = backend_dir.parent

env_loaded = False
for env_path in [backend_dir / ".env", root_dir / ".env"]:
    if env_path.exists():
        load_dotenv(dotenv_path=env_path)
        env_loaded = True
        break

SARVAM_API_KEY = os.getenv("SARVAM_API_KEY", "").strip()
SARVAM_BASE_URL = os.getenv("SARVAM_BASE_URL", "https://api.sarvam.ai").strip()
PORT = int(os.getenv("PORT", "8000"))
HOST = os.getenv("HOST", "0.0.0.0")

# Render-optimized fastembed cache location
FASTEMBED_CACHE_PATH = os.getenv("FASTEMBED_CACHE_PATH", str(backend_dir / "model_cache"))

# Parse allowed origins for CORS
raw_origins = os.getenv(
    "ALLOWED_ORIGINS",
    "http://localhost:5173,http://localhost:3000,http://127.0.0.1:5173,https://*.vercel.app"
)
ALLOWED_ORIGINS = [orig.strip() for orig in raw_origins.split(",") if orig.strip()]

