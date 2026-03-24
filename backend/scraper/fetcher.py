"""
scraper/fetcher.py — HTTP page fetcher with httpx (fast) + Playwright fallback.
Tenacity retry logic on transient failures.
"""
import httpx
from tenacity import retry, stop_after_attempt, wait_fixed, retry_if_exception_type
from config import settings
from utils.logger import get_logger

logger = get_logger("scraper.fetcher")

HEADERS = {
    "User-Agent": (
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
        "AppleWebKit/537.36 (KHTML, like Gecko) "
        "Chrome/124.0.0.0 Safari/537.36"
    ),
    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
    "Accept-Language": "en-US,en;q=0.5",
}


@retry(
    stop=stop_after_attempt(settings.RETRY_ATTEMPTS),
    wait=wait_fixed(settings.RETRY_WAIT_SECONDS),
    retry=retry_if_exception_type((httpx.TransportError, httpx.TimeoutException)),
    reraise=True,
)
def _fetch_with_httpx(url: str) -> str:
    """Fetch a URL using httpx and return HTML text."""
    with httpx.Client(headers=HEADERS, timeout=settings.REQUEST_TIMEOUT, follow_redirects=True) as client:
        resp = client.get(url)
        resp.raise_for_status()
        return resp.text


def _fetch_with_playwright(url: str) -> str:
    """Fallback: render page with Playwright (handles JS-heavy pages)."""
    import asyncio
    import sys
    if sys.platform == 'win32':
        asyncio.set_event_loop_policy(asyncio.WindowsProactorEventLoopPolicy())
        
    from playwright.sync_api import sync_playwright
    logger.info(f"Playwright fallback for: {url}")
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        page.set_extra_http_headers(HEADERS)
        try:
            page.goto(url, timeout=settings.REQUEST_TIMEOUT * 1000, wait_until="domcontentloaded")
            page.wait_for_timeout(2000)   # let JS settle
            content = page.content()
        finally:
            browser.close()
    return content


def fetch_page(url: str) -> tuple[str, str]:
    """
    Fetch a page and return (html_content, method_used).
    Tries httpx first; falls back to Playwright if enabled and httpx fails.
    """
    try:
        html = _fetch_with_httpx(url)
        return html, "httpx"
    except Exception as e:
        logger.warning(f"httpx failed for {url}: {e}")
        if settings.PLAYWRIGHT_ENABLED:
            try:
                html = _fetch_with_playwright(url)
                return html, "playwright"
            except Exception as pe:
                logger.error(f"Playwright also failed for {url}: {pe}")
        raise RuntimeError(f"Could not fetch {url}")
