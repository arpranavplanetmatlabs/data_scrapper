"""
api/candidates.py — Candidate management endpoints.

GET  /candidates?job_id=       → list candidates for a job
POST /candidates/{id}/accept   → validate + download PDF, create Material record
POST /candidates/{id}/reject   → mark rejected
"""
import os
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import Optional
import asyncio

from models.database import get_db
from models.schemas import Candidate, Material, CandidateStatus, ScrapeJob
from models.pydantic_models import CandidateResponse, CandidateActionResponse

router = APIRouter()


@router.get("/candidates", response_model=list[CandidateResponse], tags=["Candidates"])
async def list_candidates(
    job_id: Optional[int] = Query(None, description="Filter candidates by job ID"),
    db: AsyncSession = Depends(get_db),
):
    """Return all candidates discovered by a specific job, or all recent candidates."""
    if job_id is not None:
        result = await db.execute(
            select(Candidate).where(Candidate.job_id == job_id).order_by(Candidate.confidence_score.desc())
        )
    else:
        result = await db.execute(
            select(Candidate).order_by(Candidate.id.desc()).limit(100)
        )
    return result.scalars().all()


@router.post("/candidates/{candidate_id}/accept", response_model=CandidateActionResponse, tags=["Candidates"])
async def accept_candidate(candidate_id: int, db: AsyncSession = Depends(get_db)):
    """
    Accept a candidate: visual verification completed.
    Marks it as accepted and creates a Material record without server-side download.
    """
    result = await db.execute(select(Candidate).where(Candidate.id == candidate_id))
    candidate: Candidate = result.scalar_one_or_none()
    if not candidate:
        raise HTTPException(status_code=404, detail="Candidate not found")

    if candidate.status in (CandidateStatus.accepted, CandidateStatus.downloaded):
        return CandidateActionResponse(id=candidate_id, status=candidate.status, message="Already in archive")

    # Create Material record pointing to original PDF URL
    material = Material(
        product_name=candidate.product_name,
        company=candidate.company,
        material_category=candidate.material_category,
        pdf_path="",  # No local file stored
        source_url=candidate.pdf_url, # Direct URL for manual download
    )
    db.add(material)
    candidate.status = CandidateStatus.accepted

    # Update job accepted count
    job_result = await db.execute(select(ScrapeJob).where(ScrapeJob.id == candidate.job_id))
    job: ScrapeJob = job_result.scalar_one_or_none()
    if job:
        job.total_accepted = (job.total_accepted or 0) + 1

    await db.commit()
    return CandidateActionResponse(id=candidate_id, status="accepted", message="Archive verified")


@router.post("/candidates/{candidate_id}/reject", response_model=CandidateActionResponse, tags=["Candidates"])
async def reject_candidate(candidate_id: int, db: AsyncSession = Depends(get_db)):
    """Mark a candidate as rejected."""
    result = await db.execute(select(Candidate).where(Candidate.id == candidate_id))
    candidate: Candidate = result.scalar_one_or_none()
    if not candidate:
        raise HTTPException(status_code=404, detail="Candidate not found")

    candidate.status = CandidateStatus.rejected
    await db.commit()
    return CandidateActionResponse(id=candidate_id, status="rejected", message="Candidate rejected")
