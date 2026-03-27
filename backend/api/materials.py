"""
api/materials.py — Material listing and PDF file serving.

GET /materials        → list all accepted/downloaded materials
GET /download/{id}    → serve PDF file as download
"""
import os
from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from fastapi.responses import FileResponse
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from models.database import get_db, get_sync_db
from models.schemas import Material
from models.pydantic_models import MaterialResponse, BulkDownloadRequest, BulkDownloadResponse
from services.bulk_downloader import bulk_downloader

router = APIRouter()


@router.post("/bulk-download", response_model=BulkDownloadResponse, tags=["Materials"])
async def trigger_bulk_download(request: BulkDownloadRequest, background_tasks: BackgroundTasks):
    """
    Trigger a background task to download multiple materials into organized folders.
    """
    def _run_sync():
        db_sync = get_sync_db()
        try:
            bulk_downloader.run_bulk_download(db_sync, request.material_ids)
        finally:
            db_sync.close()

    background_tasks.add_task(_run_sync)
    
    return BulkDownloadResponse(
        total_requested=len(request.material_ids)
    )


@router.get("/", response_model=list[MaterialResponse], tags=["Materials"])
async def list_materials(db: AsyncSession = Depends(get_db)):
    """Return all downloaded material TDS PDFs."""
    result = await db.execute(select(Material).order_by(Material.created_at.desc()))
    return result.scalars().all()


@router.get("/download/{material_id}", tags=["Materials"])
async def download_material(material_id: int, db: AsyncSession = Depends(get_db)):
    """
    Serve a stored PDF file for download.
    Returns 404 if not found or file missing from disk.
    """
    result = await db.execute(select(Material).where(Material.id == material_id))
    material: Material = result.scalar_one_or_none()
    if not material:
        raise HTTPException(status_code=404, detail="Material not found")

    pdf_path = material.pdf_path
    if not os.path.exists(pdf_path):
        raise HTTPException(status_code=404, detail=f"PDF file not found on disk: {pdf_path}")

    filename = os.path.basename(pdf_path)
    return FileResponse(
        path=pdf_path,
        media_type="application/pdf",
        filename=filename,
        headers={"Content-Disposition": f'attachment; filename="{filename}"'},
    )
