"""
utils/file_utils.py — Path helpers, URL deduplication, directory creation.
"""
import hashlib
import os
import re
from config import settings


def slugify(text: str) -> str:
    """Convert text to a safe folder/filename component."""
    text = text.lower().strip()
    text = re.sub(r"[^\w\s-]", "", text)
    text = re.sub(r"[\s_-]+", "_", text)
    return text


def get_pdf_store_dir(company: str, material_category: str) -> str:
    """Return the directory where PDFs for this company/category should be saved."""
    path = os.path.join(
        settings.DATA_DIR,
        slugify(company),
        slugify(material_category),
    )
    os.makedirs(path, exist_ok=True)
    return path


def url_hash(url: str) -> str:
    """Return a short SHA-256 hex digest of a URL for deduplication."""
    return hashlib.sha256(url.encode()).hexdigest()[:16]


def is_duplicate(url: str, company: str, material_category: str) -> bool:
    """Check if a PDF from this URL has already been downloaded (by hash filename)."""
    store_dir = get_pdf_store_dir(company, material_category)
    uid = url_hash(url)
    for fname in os.listdir(store_dir):
        if uid in fname:
            return True
    return False


def make_pdf_filename(url: str, product_name: str = "") -> str:
    """Generate a deterministic filename for a PDF."""
    uid = url_hash(url)
    slug = slugify(product_name or "document")[:60]
    return f"{slug}_{uid}.pdf"
