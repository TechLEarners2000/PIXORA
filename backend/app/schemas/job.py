from pydantic import BaseModel, ConfigDict
from typing import Optional, List, Dict
from uuid import UUID
from datetime import datetime

class JobBase(BaseModel):
    mode: str = "high_quality"
    target_format: str = "glb"
    max_polygons: Optional[int] = None

class JobCreate(JobBase):
    pass

class JobResponse(JobBase):
    id: UUID
    status: str
    stage: Optional[str] = None
    progress: float
    error: Optional[str] = None
    created_at: datetime
    input_filename: Optional[str] = None
    
    model_config = ConfigDict(from_attributes=True)

class ArtifactResponse(BaseModel):
    key: str
    type: str
    url: str

class JobDownloadResponse(BaseModel):
    job_id: UUID
    downloads: Dict[str, str]
