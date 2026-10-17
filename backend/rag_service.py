import json
import logging
from pathlib import Path
from typing import List, Dict, Any, Optional
import numpy as np
from fastembed import TextEmbedding

from backend.config import FASTEMBED_CACHE_PATH

logger = logging.getLogger(__name__)

class IndianDietaryRAG:
    """
    Ultra-lightweight Semantic RAG using ONNX Runtime (fastembed) + numpy.
    Zero PyTorch dependency: consumes ~120-150MB RAM total on Render 512MB dynos.
    Matches extracted lab biomarkers to 100% Indian kitchen dietary swaps.
    """

    def __init__(self, kb_path: Optional[str] = None, cache_dir: Optional[str] = None):
        self.kb_path = Path(kb_path) if kb_path else Path(__file__).resolve().parent / "knowledge_base.json"
        self.cache_dir = cache_dir or FASTEMBED_CACHE_PATH

        logger.info(f"Initializing FastEmbed model BAAI/bge-small-en-v1.5 with cache_dir={self.cache_dir}")
        self.embedding_model = TextEmbedding(
            model_name="BAAI/bge-small-en-v1.5",
            cache_dir=str(self.cache_dir),
        )

        self.knowledge_base: List[Dict[str, Any]] = []
        self.corpus_texts: List[str] = []
        self.corpus_embeddings: Optional[np.ndarray] = None
        self._load_and_index_kb()

    def _load_and_index_kb(self):
        """Loads knowledge_base.json and pre-indexes embeddings into memory."""
        if not self.kb_path.exists():
            raise FileNotFoundError(f"Knowledge base file not found at {self.kb_path}")

        with open(self.kb_path, "r", encoding="utf-8") as f:
            self.knowledge_base = json.load(f)

        self.corpus_texts = []
        for entry in self.knowledge_base:
            # Enrich representation with biomarker, aliases, category, and meaning
            alias_str = ", ".join(entry.get("aliases", []))
            doc_text = (
                f"Biomarker: {entry['biomarker']}. "
                f"Aliases: {alias_str}. "
                f"Category: {entry['category']}. "
                f"Normal Range: {entry['normal_range']}. "
                f"Clinical Meaning: {entry['plain_meaning']}. "
                f"Indian Home Remedies & Swaps: {'; '.join(entry['indian_food_swaps'])}. "
                f"Lifestyle Routine: {entry['lifestyle_action']}."
            )
            self.corpus_texts.append(doc_text)

        # Compute embeddings in batch
        embeddings_generator = self.embedding_model.embed(self.corpus_texts)
        embeddings_list = list(embeddings_generator)
        self.corpus_embeddings = np.array(embeddings_list)  # Shape: (N, 384)

        # Normalize corpus vectors for fast dot-product cosine similarity
        norms = np.linalg.norm(self.corpus_embeddings, axis=1, keepdims=True)
        self.corpus_embeddings = self.corpus_embeddings / np.maximum(norms, 1e-12)
        logger.info(f"Successfully indexed {len(self.knowledge_base)} Indian clinical biomarkers.")

    def search_biomarker(self, query: str, top_k: int = 1, similarity_threshold: float = 0.55) -> List[Dict[str, Any]]:
        """
        Searches for the closest matching Indian dietary guideline.
        Uses exact/alias matching first, then falls back to ONNX cosine similarity.
        """
        query_clean = query.strip().lower()

        # 1. Fast Path: Exact or Alias substring match
        for idx, entry in enumerate(self.knowledge_base):
            biomarker_name = entry["biomarker"].lower()
            aliases = [a.lower() for a in entry.get("aliases", [])]

            if query_clean == biomarker_name or query_clean in aliases:
                return [{"item": entry, "score": 1.0, "match_type": "exact"}]

            for alias in aliases:
                if alias in query_clean or query_clean in alias:
                    return [{"item": entry, "score": 0.95, "match_type": "alias_partial"}]

        # 2. Semantic Search via FastEmbed
        query_embeddings = list(self.embedding_model.embed([query]))
        query_vec = np.array(query_embeddings[0])
        query_norm = np.linalg.norm(query_vec)
        if query_norm > 0:
            query_vec = query_vec / query_norm

        scores = np.dot(self.corpus_embeddings, query_vec)
        top_indices = np.argsort(scores)[::-1][:top_k]

        results = []
        for rank_idx in top_indices:
            score = float(scores[rank_idx])
            if score >= similarity_threshold:
                results.append({
                    "item": self.knowledge_base[rank_idx],
                    "score": score,
                    "match_type": "semantic",
                })

        return results

    def retrieve_context_for_tests(self, abnormal_tests: List[Dict[str, Any]]) -> str:
        """
        Takes structured tests extracted from the report, finds matching Indian diet swaps,
        and compiles a consolidated context string to feed to sarvam-105b.
        """
        matched_items: Dict[str, Dict[str, Any]] = {}

        for test in abnormal_tests:
            test_name = test.get("test_name", "")
            matches = self.search_biomarker(test_name, top_k=1)
            if matches:
                item = matches[0]["item"]
                b_name = item["biomarker"]
                if b_name not in matched_items:
                    matched_items[b_name] = item

        if not matched_items:
            # Fallback general Indian digestive and vitality guidelines
            return (
                "GENERAL INDIAN CLINICAL LIFESTYLE CONTEXT:\n"
                "- Hydration: 2.5 - 3 Liters of clean warm water or buttermilk (chaas) infused with jeera & hing.\n"
                "- Dietary Base: Whole grain phulkas (jowar, bajra, whole wheat), moong dal, seasonal gourd sabzis.\n"
                "- Physical Movement: 30-40 minutes of morning or post-dinner brisk walking daily."
            )

        context_lines = ["VERIFIED INDIAN CLINICAL & DIETARY KNOWLEDGE BASE MATCHES:"]
        for b_name, item in matched_items.items():
            context_lines.append(f"\n[BIOMARKER: {item['biomarker']}]")
            context_lines.append(f"Normal Range: {item['normal_range']}")
            context_lines.append(f"Meaning: {item['plain_meaning']}")
            context_lines.append(f"Lifestyle: {item['lifestyle_action']}")
            context_lines.append("Indian Kitchen Swaps:")
            for swap in item["indian_food_swaps"]:
                context_lines.append(f"  • {swap}")

        return "\n".join(context_lines)

# Global singleton instance for warm reuse across FastAPI requests
_rag_instance: Optional[IndianDietaryRAG] = None

def get_rag_service() -> IndianDietaryRAG:
    global _rag_instance
    if _rag_instance is None:
        _rag_instance = IndianDietaryRAG()
    return _rag_instance

