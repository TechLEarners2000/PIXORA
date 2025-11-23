from sqlalchemy import Column, String, DateTime, ForeignKey, BigInteger
from sqlalchemy.sql import func
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship

from app.db.base_class import Base

class JobLog(Base):
    id = Column(BigInteger, primary_key=True, index=True) # BigSerial equivalent
    job_id = Column(UUID(as_uuid=True), ForeignKey("job.id"), nullable=False)
    level = Column(String, default="INFO")
    message = Column(String, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    job = relationship("Job", back_populates="logs")
