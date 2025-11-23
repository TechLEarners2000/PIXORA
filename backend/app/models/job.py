from sqlalchemy import Column, String, Integer, Float, DateTime, ForeignKey
from sqlalchemy.sql import func
from sqlalchemy.dialects.postgresql import UUID
import uuid
from sqlalchemy.orm import relationship

from app.db.base_class import Base

class Job(Base):
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    user_id = Column(UUID(as_uuid=True), ForeignKey("user.id"), nullable=True)
    input_filename = Column(String, nullable=True)
    s3_input_key = Column(String, nullable=True)
    mode = Column(String, default="high_quality")
    target_format = Column(String, default="glb")
    max_polygons = Column(Integer, nullable=True)
    status = Column(String, default="queued", index=True) # queued, running, paused, failed, completed
    stage = Column(String, nullable=True)
    progress = Column(Float, default=0.0)
    error = Column(String, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    owner = relationship("User", back_populates="jobs")
    artifacts = relationship("Artifact", back_populates="job", cascade="all, delete-orphan")
    logs = relationship("JobLog", back_populates="job", cascade="all, delete-orphan")
