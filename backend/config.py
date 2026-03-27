"""
config.py — Central configuration for the TDS retrieval platform.
Switch search providers, tweak limits, change storage paths here.
"""
import os
from dotenv import load_dotenv

load_dotenv()


class Settings:
    # ── Search ──────────────────────────────────────────────────────────────
    # "google"  → uses googlesearch-python (no key needed, has rate limits)
    # "serpapi" → uses SerpAPI (needs SERPAPI_KEY, more robust)
    SEARCH_PROVIDER: str = os.getenv("SEARCH_PROVIDER", "serpapi")
    SERPAPI_KEY: str = os.getenv("SERPAPI_KEY", "9416162c9b72a927cdcb30142676ca3d2fce329f5096158323a4c6966bd57942")
    SEARCH_RESULTS_LIMIT: int = int(os.getenv("SEARCH_RESULTS_LIMIT", "100"))

    # ── Scraper ──────────────────────────────────────────────────────────────
    MAX_PAGES_PER_JOB: int = int(os.getenv("MAX_PAGES_PER_JOB", "100"))
    PLAYWRIGHT_ENABLED: bool = os.getenv("PLAYWRIGHT_ENABLED", "true").lower() == "true"
    REQUEST_TIMEOUT: int = 25          # increased for bulk
    RETRY_ATTEMPTS: int = 5
    RETRY_WAIT_SECONDS: int = 5

    # ── Storage ──────────────────────────────────────────────────────────────
    DATA_DIR: str = os.getenv("DATA_DIR", "./data")
    DOWNLOAD_ROOT_DIR: str = os.getenv("DOWNLOAD_ROOT_DIR", "./downloads")
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite+aiosqlite:///./tds.db")

    # ── PDF Scoring weights ──────────────────────────────────────────────────
    SCORE_KEYWORD_TDS: float = 0.40      # "tds", "technical data sheet" in text/url
    SCORE_DOMAIN_MATCH: float = 0.25     # URL domain contains company name
    SCORE_CONTEXT: float = 0.20          # "download", "resources", "datasheets" context
    SCORE_SDS_PENALTY: float = -0.35     # penalty if "sds" or "safety data" found

    # ── Workers ──────────────────────────────────────────────────────────────
    WORKER_THREAD_POOL_SIZE: int = 4


settings = Settings()
