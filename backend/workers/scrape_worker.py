"""
workers/scrape_worker.py — Background worker that orchestrates the full scrape pipeline:
  search → fetch → extract → insert candidates → job status updates.

Runs in a ThreadPoolExecutor (called from FastAPI's BackgroundTasks).
"""
import traceback
from datetime import datetime
from sqlalchemy.orm import Session
from sqlalchemy import create_engine

from config import settings
from models.schemas import ScrapeJob, Candidate, JobStatus, CandidateStatus
from scraper.search import run_search
from scraper.fetcher import fetch_page
from scraper.extractor import extract_pdf_candidates
from utils.logger import get_logger, make_log_entry

logger = get_logger("workers.scrape_worker")

# Sync engine for background thread (cannot use async in thread pool)
_sync_engine = create_engine(
    settings.DATABASE_URL.replace("+aiosqlite", ""),
    connect_args={"check_same_thread": False},
)


def _get_sync_session() -> Session:
    from sqlalchemy.orm import sessionmaker
    SessionLocal = sessionmaker(bind=_sync_engine)
    return SessionLocal()


def run_scrape_job(job_id: int, company: str, material_category: str):
    """
    Main entry point for the background scrape worker.
    Called in a thread pool — do NOT use async here.
    """
    db = _get_sync_session()
    job: ScrapeJob = db.get(ScrapeJob, job_id)

    if not job:
        logger.error(f"Job {job_id} not found in DB")
        db.close()
        return

    logger.info(f"[Job {job_id}] Starting scrape: company={company}, category={material_category}")

    try:
        # ── Phase 1: Search ──────────────────────────────────────────────────
        job.add_log(make_log_entry("search_start", company=company, material=material_category))
        db.commit()

        urls = run_search(company, material_category)
        job.add_log(make_log_entry("search_done", total_urls=len(urls), urls=urls[:10]))
        db.commit()

        total_found = 0
        visited = 0

        # ── Phase 2: Fetch + Extract ─────────────────────────────────────────
        for url in urls:
            if visited >= settings.MAX_PAGES_PER_JOB:
                break
            visited += 1

            try:
                html, method = fetch_page(url)
                job.add_log(make_log_entry("page_fetched", url=url, method=method))

                candidates_data = extract_pdf_candidates(html, url, company, material_category)

                if not candidates_data:
                    job.add_log(make_log_entry("no_pdfs", url=url))
                    db.commit()
                    continue

                # ── Insert candidates into DB ────────────────────────────────
                for cdata in candidates_data:
                    # Skip if this pdf_url is already a candidate for this job
                    existing = (
                        db.query(Candidate)
                        .filter_by(job_id=job_id, pdf_url=cdata["pdf_url"])
                        .first()
                    )
                    if existing:
                        continue

                    candidate = Candidate(
                        job_id=job_id,
                        product_name=cdata["product_name"],
                        company=company,
                        material_category=material_category,
                        pdf_url=cdata["pdf_url"],
                        source_url=cdata["source_url"],
                        confidence_score=cdata["confidence_score"],
                        status=CandidateStatus.discovered,
                    )
                    db.add(candidate)
                    total_found += 1
                    job.add_log(make_log_entry(
                        "candidate_added",
                        pdf_url=cdata["pdf_url"],
                        score=cdata["confidence_score"],
                        product=cdata["product_name"],
                    ))

                job.total_found = total_found
                db.commit()

            except Exception as page_err:
                logger.warning(f"[Job {job_id}] Error on {url}: {page_err}")
                job.add_log(make_log_entry("page_error", url=url, error=str(page_err)))
                db.commit()

        # ── Phase 3: Finish ───────────────────────────────────────────────────
        job.status = JobStatus.completed
        job.total_found = total_found
        job.add_log(make_log_entry("job_completed", total_candidates=total_found))
        db.commit()
        logger.info(f"[Job {job_id}] Completed. Found {total_found} candidates.")

    except Exception as e:
        logger.error(f"[Job {job_id}] Fatal error: {e}\n{traceback.format_exc()}")
        job.status = JobStatus.failed
        job.add_log(make_log_entry("job_failed", error=str(e), trace=traceback.format_exc()))
        db.commit()

    finally:
        db.close()
