"""
scraper/extractor.py — Extract PDF links from HTML and score their relevance as TDS.

Scoring breakdown (weights defined in config.py):
  +SCORE_KEYWORD_TDS    → URL/anchor text contains TDS keywords
  +SCORE_DOMAIN_MATCH   → URL domain matches company name
  +SCORE_CONTEXT        → Link sits in a downloads/resources page context
  +SCORE_SDS_PENALTY    → Penalize SDS/Safety data sheets (not TDS)
  Normalized to [0, 1].
"""
import re
from typing import List, Dict
from urllib.parse import urljoin, urlparse
from bs4 import BeautifulSoup
from config import settings
from utils.logger import get_logger

logger = get_logger("scraper.extractor")

TDS_KEYWORDS = [
    "tds", "technical data", "technical data sheet", "datasheet",
    "data sheet", "product data", "product specification", "spec sheet",
    "technical specification",
]

DOWNLOAD_CONTEXT_KEYWORDS = [
    "download", "downloads", "resources", "datasheets", "documents",
    "library", "product-info", "literature",
]

SDS_KEYWORDS = [
    "sds", "safety data", "msds", "material safety", "safety sheet",
]


def _clean_url(href: str, base_url: str) -> str | None:
    """Resolve relative URLs against the page base."""
    try:
        url = urljoin(base_url, href.strip())
        parsed = urlparse(url)
        if parsed.scheme not in ("http", "https"):
            return None
        return url
    except Exception:
        return None


def _score_url(url: str, anchor_text: str, context_text: str, company: str) -> float:
    """
    Compute a raw confidence score for a PDF link being a TDS.
    """
    url_lower = url.lower()
    anchor_lower = anchor_text.lower()
    context_lower = context_text.lower()
    company_lower = company.lower().split()[0]   # first word, e.g. "dupont"
    domain = urlparse(url).netloc.lower()

    score = 0.0

    # ── TDS keyword match ────────────────────────────────────────────────────
    tds_hit = any(
        kw in url_lower or kw in anchor_lower or kw in context_lower
        for kw in TDS_KEYWORDS
    )
    if tds_hit:
        score += settings.SCORE_KEYWORD_TDS

    # ── Domain match ─────────────────────────────────────────────────────────
    if company_lower in domain:
        score += settings.SCORE_DOMAIN_MATCH

    # ── Downloads / resources context ────────────────────────────────────────
    ctx_hit = any(kw in url_lower or kw in context_lower for kw in DOWNLOAD_CONTEXT_KEYWORDS)
    if ctx_hit:
        score += settings.SCORE_CONTEXT

    # ── SDS penalty ──────────────────────────────────────────────────────────
    sds_hit = any(
        kw in url_lower or kw in anchor_lower or kw in context_lower
        for kw in SDS_KEYWORDS
    )
    if sds_hit:
        score += settings.SCORE_SDS_PENALTY

    return score


def _normalize(score: float, min_score: float = -0.35, max_score: float = 0.85) -> float:
    """Normalize score to [0, 1] range."""
    normalized = (score - min_score) / (max_score - min_score)
    return max(0.0, min(1.0, round(normalized, 4)))


def extract_pdf_candidates(
    html: str,
    page_url: str,
    company: str,
    material_category: str,
) -> List[Dict]:
    """
    Parse the HTML from `page_url`, find all PDF links, score them.
    Returns a list of candidate dicts sorted by confidence_score descending.
    """
    candidates = []
    seen_urls = set()

    # If the page URL itself is a PDF (common with 'filetype:pdf' queries), add it immediately
    url_lower = page_url.lower()
    if url_lower.endswith(".pdf") or "/pdf" in url_lower or "filetype=pdf" in url_lower:
        candidates.append({
            "pdf_url": page_url,
            "source_url": page_url,
            "product_name": _guess_product_from_url(page_url),
            "company": company,
            "material_category": material_category,
            "confidence_score": 0.95,
        })
        seen_urls.add(page_url)
        logger.debug(f"Direct PDF candidate found from search: {page_url}")

    soup = BeautifulSoup(html, "lxml")

    # Broad context: all visible text on the page for context signals
    page_text = soup.get_text(separator=" ", strip=True).lower()

    for tag in soup.find_all("a", href=True):
        href = tag["href"]
        url = _clean_url(href, page_url)
        if not url or url in seen_urls:
            continue

        # Accept only .pdf URLs OR URLs containing "pdf" in path
        url_lower = url.lower()
        is_pdf_url = url_lower.endswith(".pdf") or "/pdf" in url_lower or "filetype=pdf" in url_lower
        if not is_pdf_url:
            continue

        seen_urls.add(url)
        anchor_text = tag.get_text(separator=" ", strip=True)

        # Context: nearby parent text (up to 200 chars)
        parent = tag.parent
        context_text = parent.get_text(separator=" ", strip=True)[:200] if parent else ""

        raw_score = _score_url(url, anchor_text, context_text + " " + page_text[:500], company)
        confidence = _normalize(raw_score)

        # Attempt to infer product name from anchor text or URL
        product_name = (anchor_text[:200].strip() or _guess_product_from_url(url) or "")

        candidates.append({
            "pdf_url": url,
            "source_url": page_url,
            "product_name": product_name,
            "company": company,
            "material_category": material_category,
            "confidence_score": confidence,
        })
        logger.debug(f"PDF candidate: {url} | score={confidence}")

    # Sort by confidence descending
    candidates.sort(key=lambda c: c["confidence_score"], reverse=True)
    return candidates


def _guess_product_from_url(url: str) -> str:
    """Try to extract a product name from the PDF filename in the URL."""
    path = urlparse(url).path
    filename = path.split("/")[-1]
    name = re.sub(r"[_\-]+", " ", filename)
    name = re.sub(r"\.pdf$", "", name, flags=re.IGNORECASE).strip()
    return name[:200]
