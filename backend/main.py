"""
main.py — FastAPI application entry point.
"""
import os
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from models.database import create_tables
from api.fetch import router as fetch_router
from api.jobs import router as jobs_router
from api.candidates import router as candidates_router
from api.materials import router as materials_router
from config import settings


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: create DB tables and data directory
    await create_tables()
    os.makedirs(settings.DATA_DIR, exist_ok=True)
    yield
    # Shutdown: nothing special required


app = FastAPI(
    title="Material TDS Retrieval API",
    description=(
        "Production-grade backend for discovering, scoring, and storing "
        "Technical Data Sheets (TDS) for polymer/material compounds."
    ),
    version="1.0.0",
    lifespan=lifespan,
)

# ── CORS ─────────────────────────────────────────────────────────────────────
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000", "*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Routers ──────────────────────────────────────────────────────────────────
app.include_router(fetch_router)
app.include_router(jobs_router)
app.include_router(candidates_router)
app.include_router(materials_router)


@app.get("/health", tags=["Health"])
async def health():
    return {"status": "ok", "version": "1.0.0"}
