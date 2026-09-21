# Optional Dockerfile for Render (if you prefer Docker over Python runtime)
FROM python:3.11-slim
WORKDIR /app
RUN apt-get update && apt-get install -y ffmpeg && rm -rf /var/lib/apt/lists/*
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY . .
# Render provides $PORT; also works locally with default 12001
CMD ["sh","-c","python -m libria.server $PORT"]
