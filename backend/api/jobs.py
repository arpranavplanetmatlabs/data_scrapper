"""
api/jobs.py — GET /jobs/{id}: return job status and stats.
"""
import json
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from models.database import get_db
from models.schemas import ScrapeJob
from models.pydantic_models import JobResponse

router = APIRouter()


@router.get("/jobs/{job_id}", response_model=JobResponse, tags=["Jobs"])
async def get_job(job_id: int, db: AsyncSession = Depends(get_db)):
    """Return current status, stats, and structured logs for a job."""
    result = await db.execute(select(ScrapeJob).where(ScrapeJob.id == job_id))
    job = result.scalar_one_or_none()
    if not job:
        raise HTTPException(status_code=404, detail=f"Job {job_id} not found")

    logs = []
    try:
        logs = json.loads(job.logs or "[]")
    except Exception:
        pass

    return JobResponse(
        id=job.id,
        company=job.company,
        material_category=job.material_category,
        status=job.status,
        total_found=job.total_found,
        total_accepted=job.total_accepted,
        logs=logs,
        created_at=job.created_at,
    )
