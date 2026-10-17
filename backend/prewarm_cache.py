import os
import sys
from pathlib import Path

# Add backend directory to sys.path
backend_dir = Path(__file__).resolve().parent
sys.path.insert(0, str(backend_dir.parent))

from fastembed import TextEmbedding
from backend.config import FASTEMBED_CACHE_PATH

def prewarm():
    """
    Downloads BAAI/bge-small-en-v1.5 ONNX weights into ./model_cache during build time.
    Ensures zero cold-start delay on Render (<2s boot time).
    """
    print(f"Pre-warming fastembed cache in: {FASTEMBED_CACHE_PATH}")
    os.makedirs(FASTEMBED_CACHE_PATH, exist_ok=True)
    
    # Initialize and download weights
    model = TextEmbedding(
        model_name="BAAI/bge-small-en-v1.5",
        cache_dir=str(FASTEMBED_CACHE_PATH),
    )
    
    # Run a test inference to verify weights are intact
    test_vecs = list(model.embed(["Prewarming LabMitra clinical biomarker embedding cache"]))
    print(f"Prewarm successful. Generated test embedding shape: {len(test_vecs[0])}")

if __name__ == "__main__":
    prewarm()

