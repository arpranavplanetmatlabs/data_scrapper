"""
models/pydantic_models.py — Request/response Pydantic models for the API.
"""
from __future__ import annotations
from datetime import datetime
from typing import Any, List, Optional
from pydantic import BaseModel, Field


# ── Fetch / Jobs ─────────────────────────────────────────────────────────────

class FetchRequest(BaseModel):
    company: str = Field(..., example="DuPont")
    material_category: str = Field(..., example="Nylon")


class FetchResponse(BaseModel):
    job_id: int
    message: str = "Job created and scraping started"


class JobResponse(BaseModel):
    id: int
    company: str
    material_category: str
    status: str
    total_found: int
    total_accepted: int
    logs: List[Any] = []
    created_at: datetime

    class Config:
        from_attributes = True


# ── Candidates ───────────────────────────────────────────────────────────────

class CandidateResponse(BaseModel):
    id: int
    job_id: int
    product_name: Optional[str]
    company: str
    material_category: str
    pdf_url: str
    source_url: str
    confidence_score: float
    status: str
    created_at: datetime

    class Config:
        from_attributes = True


class CandidateActionResponse(BaseModel):
    id: int
    status: str
    message: str


# ── Materials ─────────────────────────────────────────────────────────────────

class MaterialResponse(BaseModel):
    id: int
    product_name: Optional[str]
    company: str
    material_category: str
    pdf_path: str
    source_url: str
    created_at: datetime

    class Config:
        from_attributes = True
class BulkDownloadRequest(BaseModel):
    material_ids: List[int]

class BulkDownloadResponse(BaseModel):
    message: str = "Bulk download started in background"
    total_requested: int
