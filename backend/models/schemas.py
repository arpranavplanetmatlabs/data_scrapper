"""
models/schemas.py — SQLAlchemy ORM models for scrape_jobs, candidates, materials.
"""
import json
from datetime import datetime
from sqlalchemy import (
    Column, Integer, String, Float, Text, DateTime, ForeignKey, Enum
)
from sqlalchemy.orm import relationship
from models.database import Base
import enum


class JobStatus(str, enum.Enum):
    running = "running"
    completed = "completed"
    failed = "failed"


class CandidateStatus(str, enum.Enum):
    discovered = "discovered"
    accepted = "accepted"
    rejected = "rejected"
    downloaded = "downloaded"


class ScrapeJob(Base):
    __tablename__ = "scrape_jobs"

    id = Column(Integer, primary_key=True, index=True)
    company = Column(String(255), nullable=False)
    material_category = Column(String(255), nullable=False)
    status = Column(String(50), default=JobStatus.running, nullable=False)
    total_found = Column(Integer, default=0)
    total_accepted = Column(Integer, default=0)
    logs = Column(Text, default="[]")    # JSON array of log entries
    created_at = Column(DateTime, default=datetime.utcnow)

    candidates = relationship("Candidate", back_populates="job", cascade="all, delete-orphan")

    def get_logs(self):
        try:
            return json.loads(self.logs or "[]")
        except Exception:
            return []

    def add_log(self, entry: dict):
        logs = self.get_logs()
        logs.append(entry)
        self.logs = json.dumps(logs)


class Candidate(Base):
    __tablename__ = "candidates"

    id = Column(Integer, primary_key=True, index=True)
    job_id = Column(Integer, ForeignKey("scrape_jobs.id"), nullable=False)
    product_name = Column(String(500), nullable=True)
    company = Column(String(255), nullable=False)
    material_category = Column(String(255), nullable=False)
    pdf_url = Column(Text, nullable=False)
    source_url = Column(Text, nullable=False)
    confidence_score = Column(Float, default=0.0)
    status = Column(String(50), default=CandidateStatus.discovered)
    created_at = Column(DateTime, default=datetime.utcnow)

    job = relationship("ScrapeJob", back_populates="candidates")


class Material(Base):
    __tablename__ = "materials"

    id = Column(Integer, primary_key=True, index=True)
    product_name = Column(String(500), nullable=True)
    company = Column(String(255), nullable=False)
    material_category = Column(String(255), nullable=False)
    pdf_path = Column(Text, nullable=False)
    source_url = Column(Text, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
