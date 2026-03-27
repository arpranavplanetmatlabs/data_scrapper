from typing import List, Dict, Any
from crawl4ai import AsyncWebCrawler
from utils.logger import get_logger

logger = get_logger("scraper.crawl_service")

class CrawlService:
    """
    Advanced deep-crawling service using Crawl4AI.
    Focuses on high-fidelity extraction from complex manufacturer sites.
    """

    async def crawl_and_extract_pdfs(self, url: str) -> List[Dict[str, Any]]:
        """
        Crawl a page and extract potential TDS/PDF links using semantic signals.
        """
        logger.info(f"Deep crawling candidate: {url}")
        
        async with AsyncWebCrawler(verbose=True) as crawler:
            result = await crawler.arun(
                url=url,
                bypass_cache=True,
                # Using crawl4ai's modern rendering capabilities
                wait_for_images=False,
                magic=True, # Handles standard anti-bot / rendering hurdles
            )

            if not result.success:
                logger.error(f"Crawl4AI failed for {url}: {result.error_message}")
                return []

            # Crawl4AI provides Markdown and structured links
            # We filter for PDF links in the discovered links
            candidates = []
            
            # 1. Process discovered links from the crawl report
            for link in result.links.get("internal", []) + result.links.get("external", []):
                href = link.get("href", "")
                text = link.get("text", "").lower()
                
                # Check for PDF signals
                is_pdf = href.lower().endswith(".pdf") or "pdf" in text or "datasheet" in text or "tds" in text
                
                if is_pdf:
                    # Basic confidence scoring based on link context
                    confidence = 0.5
                    if ".pdf" in href.lower(): confidence += 0.3
                    if "tds" in text or "datasheet" in text: confidence += 0.2
                    
                    candidates.append({
                        "url": href,
                        "text": link.get("text", "Unknown Document"),
                        "confidence_score": min(confidence, 1.0)
                    })

            # 2. Heuristic check: Crawl4AI cleans the content into Markdown. 
            # We can use that to find links that might have been missed by standard parsers.
            # (In a more advanced version, we'd use LLM extraction here).
            
            logger.info(f"Deep crawl found {len(candidates)} PDF candidates on {url}")
            return candidates

crawl_service = CrawlService()
