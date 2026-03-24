"""
scraper/downloader.py — Download a PDF, validate, deduplicate, and save to disk.
"""
import os
import httpx
from tenacity import retry, stop_after_attempt, wait_fixed, retry_if_exception_type
from config import settings
from utils.logger import get_logger
from utils.file_utils import (
    get_pdf_store_dir,
    is_duplicate,
    make_pdf_filename,
    url_hash,
)

logger = get_logger("scraper.downloader")

HEADERS = {
    "User-Agent": (
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
        "AppleWebKit/537.36 (KHTML, like Gecko) "
        "Chrome/124.0.0.0 Safari/537.36"
    ),
}


@retry(
    stop=stop_after_attempt(settings.RETRY_ATTEMPTS),
    wait=wait_fixed(settings.RETRY_WAIT_SECONDS),
    retry=retry_if_exception_type((httpx.TransportError, httpx.TimeoutException)),
    reraise=True,
)
def download_pdf(
    pdf_url: str,
    company: str,
    material_category: str,
    product_name: str = "",
) -> str | None:
    """
    Download a PDF from `pdf_url`.
    Returns the absolute path to the saved file, or None if invalid/duplicate.
    """
    # ── Deduplication ─────────────────────────────────────────────────────────
    if is_duplicate(pdf_url, company, material_category):
        logger.info(f"Duplicate PDF skipped: {pdf_url}")
        return None

    store_dir = get_pdf_store_dir(company, material_category)
    filename = make_pdf_filename(pdf_url, product_name)
    dest_path = os.path.join(store_dir, filename)

    # ── Fetch ─────────────────────────────────────────────────────────────────
    with httpx.Client(headers=HEADERS, timeout=30, follow_redirects=True) as client:
        resp = client.get(pdf_url)
        resp.raise_for_status()

        # ── Validate content-type ─────────────────────────────────────────────
        content_type = resp.headers.get("content-type", "").lower()
        if "pdf" not in content_type and not pdf_url.lower().endswith(".pdf"):
            logger.warning(f"Non-PDF content-type '{content_type}' for {pdf_url}")
            # Still save if the URL clearly says .pdf; log a warning but proceed
            if "pdf" not in pdf_url.lower():
                return None

        # ── Save ──────────────────────────────────────────────────────────────
        with open(dest_path, "wb") as f:
            f.write(resp.content)

    logger.info(f"PDF saved: {dest_path} ({len(resp.content) // 1024} KB)")
    return os.path.abspath(dest_path)


def validate_pdf_content(filepath: str) -> bool:
    """
    Optional: Use pdfplumber to confirm the PDF is readable and has text
    (filters out corrupted / image-only files without TDS content).
    """
    try:
        import pdfplumber
        with pdfplumber.open(filepath) as pdf:
            if len(pdf.pages) == 0:
                return False
            # Check first page has some text
            text = pdf.pages[0].extract_text() or ""
            return len(text.strip()) > 20
    except Exception as e:
        logger.warning(f"PDF validation failed for {filepath}: {e}")
        return False
