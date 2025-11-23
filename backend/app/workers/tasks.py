from app.core.celery_app import celery_app
from uuid import UUID
import time

@celery_app.task(acks_late=True)
def process_job(job_id: str):
    from app.db.session import SessionLocal
    from app.services.orchestrator import process_job_pipeline
    
    db = SessionLocal()
    try:
        process_job_pipeline(job_id, db)
    finally:
        db.close()
    return True
