import os
import httpx
from typing import List
from sqlalchemy.orm import Session
from models.schemas import Material
from config import settings
from utils.logger import get_logger
from utils.file_utils import slugify

logger = get_logger("services.bulk_downloader")


class BulkDownloader:
    """
    Orchestrates high-volume downloads with hierarchical organization.
    Saves to: {DOWNLOAD_ROOT_DIR}/{Company}/{Category}/{Product}.pdf
    """

    def __init__(self):
        self.root = settings.DOWNLOAD_ROOT_DIR
        if not os.path.exists(self.root):
            os.makedirs(self.root, exist_ok=True)

    def run_bulk_download(self, db: Session, material_ids: List[int]):
        """
        Execute sequential downloads for a list of material IDs.
        """
        logger.info(f"Starting bulk download for {len(material_ids)} items.")
        
        success_count = 0
        error_count = 0

        for mid in material_ids:
            material = db.get(Material, mid)
            if not material or not material.source_url:
                logger.warning(f"Material {mid} not found or missing source URL.")
                continue

            try:
                # 1. Prepare hierarchical path
                company_dir = os.path.join(self.root, slugify(material.company))
                category_dir = os.path.join(company_dir, slugify(material.material_category))
                os.makedirs(category_dir, exist_ok=True)

                # 2. Prepare filename
                filename = slugify(material.product_name)
                if not filename.lower().endswith(".pdf"):
                    filename += ".pdf"
                
                dest_path = os.path.join(category_dir, filename)

                # 3. Execution (Sequential with retry/timeout)
                logger.info(f"Downloading {material.product_name} to {dest_path}")
                
                with httpx.Client(timeout=settings.REQUEST_TIMEOUT) as client:
                    response = client.get(material.source_url, follow_redirects=True)
                    response.raise_for_status()
                    
                    with open(dest_path, "wb") as f:
                        f.write(response.content)
                
                success_count += 1
                logger.info(f"Successfully downloaded {mid}: {filename}")

            except Exception as e:
                error_count += 1
                logger.error(f"Failed to download material {mid}: {str(e)}")

        logger.info(f"Bulk download finished. Success: {success_count}, Errors: {error_count}")
        return {"success": success_count, "errors": error_count}

bulk_downloader = BulkDownloader()
