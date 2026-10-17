FROM python:3.11-slim

# Avoid buffering for real-time logs
ENV PYTHONUNBUFFERED=1 \
    FASTEMBED_CACHE_PATH=/app/backend/model_cache \
    PORT=8000

WORKDIR /app

# Install system dependencies (minimal, headless OpenCV doesn't need libgl)
RUN apt-get update && apt-get install -y --no-install-recommends \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Install python dependencies
COPY backend/requirements.txt ./backend/requirements.txt
RUN pip install --no-cache-dir -r ./backend/requirements.txt

# Copy source code and pre-warm cache
COPY . .
RUN python backend/prewarm_cache.py

# Expose port and start uvicorn
EXPOSE 8000
CMD ["sh", "-c", "uvicorn backend.main:app --host 0.0.0.0 --port ${PORT:-8000}"]
