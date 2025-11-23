from typing import Any, List
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form, status
from sqlalchemy.orm import Session
import uuid
import shutil
import os

from app.api import deps
from app.models.job import Job
from app.models.artifact import Artifact
from app.schemas.job import JobCreate, JobResponse, JobDownloadResponse
from app.utils import storage
from app.core.config import settings
from app.workers.tasks import process_job

router = APIRouter()

@router.post("/", response_model=JobResponse, status_code=status.HTTP_201_CREATED)
async def create_job(
    *,
    db: Session = Depends(deps.get_db),
    current_user = Depends(deps.get_current_user),
    file: UploadFile = File(...),
    mode: str = Form("high_quality"),
    target_format: str = Form("glb"),
    max_polygons: int = Form(None),
) -> Any:
    # Validate file
    if file.content_type not in ["image/jpeg", "image/png", "image/webp"]:
        raise HTTPException(status_code=400, detail="Invalid file type. Only JPG, PNG, WEBP allowed.")
    
    # Upload to S3
    file_ext = file.filename.split(".")[-1]
    s3_key = f"{uuid.uuid4()}.{file_ext}"
    
    # Ensure buckets exist (lazy init)
    storage.ensure_buckets()
    
    # We need to read the file to upload it. 
    # In a real high-perf scenario we might stream it, but for now read into memory or temp file
    # Boto3 upload_fileobj expects a file-like object.
    
    success = storage.upload_file(file.file, settings.S3_BUCKET_UPLOADS, s3_key)
    if not success:
        raise HTTPException(status_code=500, detail="Failed to upload image to storage")

    # Create Job
    job = Job(
        user_id=current_user.id,
        input_filename=file.filename,
        s3_input_key=s3_key,
        mode=mode,
        target_format=target_format,
        max_polygons=max_polygons,
        status="queued"
    )
    db.add(job)
    db.commit()
    db.refresh(job)

    # Trigger Worker
    process_job.delay(str(job.id))

    return job

@router.get("/{job_id}", response_model=JobResponse)
def get_job(
    job_id: uuid.UUID,
    db: Session = Depends(deps.get_db),
    current_user = Depends(deps.get_current_user),
) -> Any:
    job = db.query(Job).filter(Job.id == job_id, Job.user_id == current_user.id).first()
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    return job

@router.get("/{job_id}/download", response_model=JobDownloadResponse)
def download_artifacts(
    job_id: uuid.UUID,
    db: Session = Depends(deps.get_db),
    current_user = Depends(deps.get_current_user),
) -> Any:
    job = db.query(Job).filter(Job.id == job_id, Job.user_id == current_user.id).first()
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    
    if job.status != "completed":
        raise HTTPException(status_code=400, detail="Job not completed yet")

    downloads = {}
    for artifact in job.artifacts:
        url = storage.get_presigned_url(settings.S3_BUCKET_ARTIFACTS, artifact.key)
        downloads[artifact.type] = url
    
    return {"job_id": job.id, "downloads": downloads}
