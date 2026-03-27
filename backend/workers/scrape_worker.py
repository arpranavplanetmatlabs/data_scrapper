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
from models.schemas import ScrapeJob, Candidate, Material, JobStatus, CandidateStatus
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
        # ── Phase 1: Search (Multi-Engine Discovery) ────────────────────────
        job.add_log(make_log_entry("search_start", company=company, material=material_category))
        db.commit()

        def _log_search(event: str, **kwargs):
            job.add_log(make_log_entry(event, **kwargs))
            db.commit()

        urls = run_search(company, material_category, log_callback=_log_search)
        job.add_log(make_log_entry("search_done", total_urls=len(urls)))
        db.commit()

        total_found = 0
        visited = 0

        # ── Phase 2: Fetch + Deep Extract (Crawl4AI) ──────────────────────────
        import asyncio
        from scraper.crawl_service import crawl_service

        for url in urls:
            if visited >= settings.MAX_PAGES_PER_JOB:
                break
            visited += 1

            try:
                job.add_log(make_log_entry("page_deep_crawl", url=url))
                db.commit()

                # Deep Discovery via Crawl4AI (Async call in sync thread)
                candidates_list = asyncio.run(crawl_service.crawl_and_extract_pdfs(url))

                if not candidates_list:
                    job.add_log(make_log_entry("no_discovery", url=url))
                    db.commit()
                    continue

                # ── Insert candidates into DB (Global Duplicate Check) ────────
                for cdata in candidates_list:
                    pdf_url = cdata["url"]
                    
                    # Check if this PDF URL was ever seen before (as a candidate or material)
                    exists_in_candidates = db.query(Candidate).filter_by(pdf_url=pdf_url).first()
                    exists_in_materials = db.query(Material).filter_by(source_url=pdf_url).first()
                    
                    if exists_in_candidates or exists_in_materials:
                        continue

                    candidate = Candidate(
                        job_id=job_id,
                        product_name=cdata["text"],
                        company=company,
                        material_category=material_category,
                        pdf_url=pdf_url,
                        source_url=url, # Original candidate page
                        confidence_score=cdata["confidence_score"],
                        status=CandidateStatus.discovered,
                    )
                    db.add(candidate)
                    total_found += 1
                    job.add_log(make_log_entry(
                        "candidate_added",
                        pdf_url=pdf_url,
                        score=cdata["confidence_score"],
                        product=cdata["text"],
                    ))
                
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
