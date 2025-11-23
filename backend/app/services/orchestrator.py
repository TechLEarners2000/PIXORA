from sqlalchemy.orm import Session
from app.models.job import Job
from app.models.artifact import Artifact
from app.services import preprocess, multiview, reconstruction, mesh_utils, textures
from app.utils import storage
from app.core.config import settings
import uuid
import os

def process_job_pipeline(job_id: str, db: Session):
    job = db.query(Job).filter(Job.id == job_id).first()
    if not job:
        print(f"Job {job_id} not found")
        return

    try:
        # 1. Preprocess
        update_job_status(job, db, "preprocess", 0.05)
        # In real app, download from S3 to local temp
        # local_input = download_from_s3(job.s3_input_key)
        local_input = "temp_input.png" # Mock
        
        preprocessed = preprocess.preprocess_image(local_input)
        
        # 2. Multiview
        update_job_status(job, db, "multiview", 0.20)
        views = multiview.generate_multiviews(local_input, preprocessed['mask'], {})
        
        # 3. Reconstruction
        update_job_status(job, db, "reconstruction", 0.45)
        raw_mesh = reconstruction.reconstruct_3d(views, job.mode)
        
        # 4. Mesh Extraction
        update_job_status(job, db, "mesh_extract", 0.70)
        clean_mesh = mesh_utils.extract_and_repair_mesh(raw_mesh)
        
        # 5. Retopology
        update_job_status(job, db, "retopology", 0.80)
        final_mesh = mesh_utils.retopologize(clean_mesh, job.max_polygons or 20000)
        
        # 6. Texturing
        update_job_status(job, db, "texturing", 0.90)
        texture_maps = textures.generate_textures(final_mesh, views)
        
        # 7. Export & Upload
        update_job_status(job, db, "export", 0.95)
        
        # Mock upload artifacts
        artifacts = []
        
        # Upload mesh
        mesh_key = f"{job.id}/model.{job.target_format}"
        # storage.upload_file(final_mesh, settings.S3_BUCKET_ARTIFACTS, mesh_key)
        artifacts.append(Artifact(job_id=job.id, key=mesh_key, type=job.target_format))
        
        # Upload textures
        for type, path in texture_maps.items():
            tex_key = f"{job.id}/{type}.jpg"
            # storage.upload_file(path, settings.S3_BUCKET_ARTIFACTS, tex_key)
            artifacts.append(Artifact(job_id=job.id, key=tex_key, type=type))
            
        for artifact in artifacts:
            db.add(artifact)
            
        update_job_status(job, db, "completed", 1.0, status="completed")
        db.commit()
        
    except Exception as e:
        print(f"Job failed: {e}")
        update_job_status(job, db, job.stage, job.progress, status="failed", error=str(e))
        db.commit()

def update_job_status(job, db, stage, progress, status="running", error=None):
    job.stage = stage
    job.progress = progress
    job.status = status
    if error:
        job.error = error
    db.commit()
    db.refresh(job)
