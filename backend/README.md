# Pixora Backend

Backend service for Pixora (formerly MeshLike), a 2D to 3D conversion platform.

## Architecture

- **Framework**: FastAPI (Python 3.11)
- **Database**: PostgreSQL
- **Task Queue**: Celery + Redis
- **Storage**: MinIO (S3 compatible)
- **AI Pipeline**: PyTorch (Mocked for now)

## Prerequisites

- Docker & Docker Compose
- Python 3.11+
- Poetry (Python dependency manager)

## Setup

1. **Install Dependencies**:
   ```bash
   cd backend
   poetry install
   ```

2. **Start Infrastructure**:
   ```bash
   docker-compose up -d
   ```
   This starts Postgres, Redis, and MinIO.

3. **Configuration**:
   Copy `.env.example` to `.env` (already done).
   Ensure `S3_ENDPOINT_URL` matches your MinIO address.

## Running the App

### Windows (PowerShell)
Run the helper script:
```powershell
.\scripts\start_backend.ps1
```

### Manual Start

1. **Start Celery Worker**:
   ```bash
   poetry run celery -A app.workers.celery_worker worker --loglevel=info -P solo
   ```

2. **Start API Server**:
   ```bash
   poetry run uvicorn app.main:app --reload
   ```

## API Documentation

Once running, visit:
- Swagger UI: [http://localhost:8000/docs](http://localhost:8000/docs)
- ReDoc: [http://localhost:8000/redoc](http://localhost:8000/redoc)

## Testing

Run unit tests:
```bash
poetry run pytest
```
