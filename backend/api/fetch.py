"""
api/fetch.py — POST /fetch: create scrape job and trigger background worker.
"""
import concurrent.futures
from fastapi import APIRouter, Depends, BackgroundTasks
from sqlalchemy.ext.asyncio import AsyncSession

from models.database import get_db
from models.schemas import ScrapeJob, JobStatus
from models.pydantic_models import FetchRequest, FetchResponse
from workers.scrape_worker import run_scrape_job
from config import settings

router = APIRouter()

# Shared thread pool for background scraping
_executor = concurrent.futures.ThreadPoolExecutor(
    max_workers=settings.WORKER_THREAD_POOL_SIZE
)


@router.post("/fetch", response_model=FetchResponse, tags=["Jobs"])
async def create_fetch_job(
    request: FetchRequest,
    background_tasks: BackgroundTasks,
    db: AsyncSession = Depends(get_db),
):
    """
    Create a scrape job and immediately return the job_id.
    Scraping runs in a background thread — does NOT block the API.
    """
    job = ScrapeJob(
        company=request.company,
        material_category=request.material_category,
        status=JobStatus.running,
    )
    db.add(job)
    await db.commit()
    await db.refresh(job)

    job_id = job.id

    # Dispatch to thread pool (non-blocking)
    background_tasks.add_task(
        _run_in_executor, job_id, request.company, request.material_category
    )

    return FetchResponse(job_id=job_id)


def _run_in_executor(job_id: int, company: str, material_category: str):
    _executor.submit(run_scrape_job, job_id, company, material_category)
