"""
api/stats.py — Scraping telemetry metrics.

GET /stats  → Returns the total number of searches performed per engine.
"""
import os
import json
from fastapi import APIRouter
from pydantic import BaseModel

router = APIRouter()

STATS_FILE = os.path.join(os.path.dirname(os.path.dirname(__file__)), "data", "stats.json")

class StatsResponse(BaseModel):
    google: int
    ddg: int
    serpapi: int

def get_current_stats() -> dict:
    if os.path.exists(STATS_FILE):
        try:
            with open(STATS_FILE, "r") as f:
                return json.load(f)
        except Exception:
            pass
    return {"google": 0, "ddg": 0, "serpapi": 0}

@router.get("/stats", response_model=StatsResponse, tags=["Metrics"])
async def get_stats():
    """Returns the total number of search queries executed per engine."""
    stats = get_current_stats()
    return StatsResponse(
        google=stats.get("google", 0),
        ddg=stats.get("ddg", 0),
        serpapi=stats.get("serpapi", 0)
    )
