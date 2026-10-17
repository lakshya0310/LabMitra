import io
import re
import cv2
import numpy as np
import pdfplumber
from typing import Tuple, Optional, List, Dict, Any

def preprocess_image_bytes(image_bytes: bytes) -> bytes:
    """
    Enhance smartphone photo of lab reports purely in-memory using OpenCV:
    1. Grayscale conversion
    2. CLAHE (Contrast Limited Adaptive Histogram Equalization) to balance shadows/highlights
    3. Deskewing to straighten crooked phone camera angles
    Returns optimized JPEG bytes with zero disk I/O leaks on Render.
    """
    try:
        # Decode image from in-memory byte buffer
        nparr = np.frombuffer(image_bytes, np.uint8)
        img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
        if img is None:
            return image_bytes

        # 1. Grayscale
        gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)

        # 2. CLAHE Contrast Enhancement
        clahe = cv2.createCLAHE(clipLimit=2.0, tileGridSize=(8, 8))
        enhanced = clahe.apply(gray)

        # 3. Deskewing
        deskewed = _deskew_image(enhanced)

        # Re-encode to clean JPEG bytes
        success, encoded_img = cv2.imencode(".jpg", deskewed, [int(cv2.IMWRITE_JPEG_QUALITY), 95])
        if success:
            return encoded_img.tobytes()
        return image_bytes
    except Exception as e:
        # Graceful fallback: return original bytes if OpenCV processing fails
        return image_bytes


def _deskew_image(gray_img: np.ndarray) -> np.ndarray:
    """
    Detects skew angle of text lines and rotates the image back to horizontal.
    """
    try:
        # Invert colors and threshold to highlight text blocks
        thresh = cv2.threshold(gray_img, 0, 255, cv2.THRESH_BINARY_INV | cv2.THRESH_OTSU)[1]
        
        # Find coordinates of all foreground pixels
        coords = np.column_stack(np.where(thresh > 0))
        if len(coords) < 50:
            return gray_img

        # Compute minimum bounding rectangle
        rect = cv2.minAreaRect(coords)
        angle = rect[-1]

        # OpenCV minAreaRect returns angle in range [-90, 0)
        if angle < -45:
            angle = -(90 + angle)
        else:
            angle = -angle

        # If skew is negligible (<0.5 deg) or extreme (>45 deg), do not rotate
        if abs(angle) < 0.5 or abs(angle) > 45:
            return gray_img

        (h, w) = gray_img.shape[:2]
        center = (w // 2, h // 2)
        M = cv2.getRotationMatrix2D(center, angle, 1.0)
        rotated = cv2.warpAffine(
            gray_img, M, (w, h), flags=cv2.INTER_CUBIC, borderMode=cv2.BORDER_REPLICATE
        )
        return rotated
    except Exception:
        return gray_img


def extract_from_pdf(pdf_bytes: bytes) -> Dict[str, Any]:
    """
    Fast in-memory digital PDF parser using pdfplumber.
    Returns:
    - is_scanned: False if text layer exists, True if scanned/image-only
    - raw_text: concatenated text from all pages
    - tables: structured tables extracted from tables grid
    """
    extracted_text_chunks: List[str] = []
    extracted_tables: List[List[List[Optional[str]]]] = []

    try:
        with pdfplumber.open(io.BytesIO(pdf_bytes)) as pdf:
            for page_idx, page in enumerate(pdf.pages):
                text = page.extract_text()
                if text:
                    extracted_text_chunks.append(text)

                tables = page.extract_tables()
                if tables:
                    extracted_tables.extend(tables)

        full_text = "\n\n".join(extracted_text_chunks).strip()

        # If text is too short (<80 characters), it's likely a scanned image PDF
        is_scanned = len(full_text) < 80

        return {
            "is_scanned": is_scanned,
            "raw_text": full_text,
            "tables": extracted_tables,
            "page_count": len(extracted_text_chunks) if not is_scanned else 0,
        }
    except Exception as e:
        return {
            "is_scanned": True,
            "raw_text": "",
            "tables": [],
            "error": str(e),
        }

