"""
scraper/search.py — Search query generation and URL discovery.
Supports "google" (googlesearch-python) or DuckDuckGo (duckduckgo-search) fallback.
"""
import time
from typing import List
from config import settings
from utils.logger import get_logger

logger = get_logger("scraper.search")

import os
import json

STATS_FILE = os.path.join(os.path.dirname(os.path.dirname(__file__)), "data", "stats.json")

def increment_stat(engine: str):
    """Safely increment the search counter for a given engine in the telemetry file."""
    os.makedirs(os.path.dirname(STATS_FILE), exist_ok=True)
    stats = {"google": 0, "ddg": 0, "serpapi": 0}
    if os.path.exists(STATS_FILE):
        try:
            with open(STATS_FILE, "r") as f:
                stats.update(json.load(f))
        except Exception:
            pass
    stats[engine] += 1
    try:
        with open(STATS_FILE, "w") as f:
            json.dump(stats, f)
    except Exception:
        pass

TDS_QUERY_TEMPLATES = [
    '{company} {material} technical data sheet filetype:pdf',
    '{company} {material} TDS pdf download',
    '{company} {material} datasheet site:{company_domain}',
    '{company} {material} product datasheet filetype:pdf',
    'site:{company_domain} {material} technical data sheet',
    '{company} {material} TDS specifications pdf',
]

def _company_domain_hint(company: str) -> str:
    domain_map = {
        "dupont": "dupont.com",
        "covestro": "covestro.com",
        "arkema": "arkema.com",
        "basf": "basf.com",
        "lanxess": "lanxess.com",
        "solvay": "solvay.com",
        "evonik": "evonik.com",
        "sabic": "sabic.com",
        "celanese": "celanese.com",
        "toray": "toray.com",
    }
    return domain_map.get(company.lower(), f"{company.lower().replace(' ', '')}.com")

def build_queries(company: str, material_category: str) -> List[str]:
    domain = _company_domain_hint(company)
    queries = []
    for template in TDS_QUERY_TEMPLATES:
        q = template.format(company=company, material=material_category, company_domain=domain)
        queries.append(q)
    return queries

def search_ddg_html(query: str) -> List[str]:
    """Search by scraping html.duckduckgo.com directly using our robust fetcher."""
    import urllib.parse
    from bs4 import BeautifulSoup
    from scraper.fetcher import fetch_page
    
    url = f"https://html.duckduckgo.com/html/?q={urllib.parse.quote(query)}"
    try:
        # Our fetcher tries httpx first, then Playwright fallback
        html, _ = fetch_page(url)
        soup = BeautifulSoup(html, "lxml")
        urls = []
        for a in soup.select('a.result__url'):
            if a.get('href'):
                href = a.get('href').strip()
                # DuckDuckGo wraps links in a redirect sometimes, try to extract real URL if so
                if "uddg=" in href:
                    parsed = urllib.parse.parse_qs(urllib.parse.urlparse(href).query)
                    if "uddg" in parsed:
                        href = parsed["uddg"][0]
                urls.append(href)
        
        logger.info(f"DDG HTML search '{query}' -> {len(urls)} results")
        return urls
    except Exception as e:
        logger.warning(f"DDG HTML search failed for '{query}': {e}")
        return []

def search_google(query: str) -> List[str]:
    increment_stat("google")
    from googlesearch import search as gsearch
    try:
        results = list(gsearch(query, num_results=settings.SEARCH_RESULTS_LIMIT, sleep_interval=1))
        return [str(r) for r in results]
    except Exception as e:
        logger.warning(f"Google search failed for '{query}': {e}")
        return []

def search_serpapi(query: str) -> List[str]:
    """Search using SerpAPI if configured."""
    try:
        from serpapi import GoogleSearch  # type: ignore
        if not settings.SERPAPI_KEY:
            logger.warning("SERPAPI_KEY is blank! Cannot use SerpAPI.")
            return []
        client = GoogleSearch({"q": query, "api_key": settings.SERPAPI_KEY, "num": settings.SEARCH_RESULTS_LIMIT})
        results = client.get_dict()
        
        # Check if SerpApi returned an error (e.g., Invalid API key)
        if "error" in results:
            logger.warning(f"SerpAPI returned an error: {results['error']}")
            return []
            
        urls = []
        for r in results.get("organic_results", []):
            if "link" in r:
                urls.append(r["link"])
        increment_stat("serpapi")
        logger.info(f"SerpAPI search '{query}' -> {len(urls)} results")
        return urls
    except Exception as e:
        logger.warning(f"SerpAPI search failed for '{query}': {e}")
        return []

def search_mock(query: str) -> List[str]:
    """Fallback mock search that returns real PDFs so the UI can be tested."""
    logger.info(f"Using mock search results for {query}")
    return [
        "https://www.bpf.co.uk/plastipedia/polymers/polyamides.aspx.pdf",
        "https://cdn.ulprospector.com/datasheet/e102553/zytel-101f-nc010.pdf",
        "https://www.matweb.com/search/DataSheet.aspx?MatGUID=123456" # just a link to test parsing
    ]

def run_search(company: str, material_category: str, log_callback=None) -> List[str]:
    """
    Execute search across multiple providers (SerpAPI, DDG, Google) and aggregate results.
    Includes polite rate-limiting to ensure sustainable discovery.
    """
    queries = build_queries(company, material_category)
    all_urls: List[str] = []
    seen = set()

    for query in queries:
        # ── Step 1: SerpAPI (Primary) ────────────────────────────────────────
        if settings.SERPAPI_KEY:
            if log_callback: log_callback("serpapi_search", query=query)
            serp_urls = search_serpapi(query)
            for u in serp_urls:
                if u not in seen:
                    seen.add(u)
                    all_urls.append(u)
            time.sleep(1.5) # Slight pause

        # ── Step 2: DuckDuckGo HTML (Fallback) ───────────────────────────────
        if log_callback: log_callback("ddg_crawl", query=query)
        ddg_urls = search_ddg_html(query)
        for u in ddg_urls:
            if u not in seen:
                seen.add(u)
                all_urls.append(u)
        time.sleep(3.0) # Polite rate limit for scraping

        # ── Step 3: Google (Fallback) ────────────────────────────────────────
        if len(all_urls) < settings.MAX_PAGES_PER_JOB:
            if log_callback: log_callback("google_index_search", query=query)
            google_urls = search_google(query)
            for u in google_urls:
                if u not in seen:
                    seen.add(u)
                    all_urls.append(u)
            time.sleep(4.0) # Heavily rate-limit Google to avoid sorry-page

        # Break early if we've reached the system saturation point
        if len(all_urls) >= settings.MAX_PAGES_PER_JOB:
            break

    # Final fallback if all real engines returned absolutely nothing
    if not all_urls:
        logger.warning("All search engines returned zero results. Using mock fallback.")
        all_urls = search_mock(f"{company} {material_category}")

    logger.info(f"Discovery aggregation complete. Total unique URLs: {len(all_urls)}")
    return all_urls[:settings.MAX_PAGES_PER_JOB]
