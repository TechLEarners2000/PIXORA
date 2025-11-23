# Start Backend Services

# 1. Start Docker containers (Postgres, Redis, MinIO)
Write-Host "Starting Infrastructure..."
docker-compose up -d

# 2. Install dependencies
Write-Host "Installing Dependencies..."
poetry install

# 3. Start Celery Worker (in background)
Write-Host "Starting Celery Worker..."
Start-Process -FilePath "poetry" -ArgumentList "run celery -A app.workers.celery_worker worker --loglevel=info -P solo" -NoNewWindow

# 4. Start FastAPI Server
Write-Host "Starting FastAPI Server..."
poetry run uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
