"""
utils/logger.py — Structured per-job logger producing JSON-friendly log entries.
"""
import logging
import json
from datetime import datetime


def get_logger(name: str) -> logging.Logger:
    logger = logging.getLogger(name)
    if not logger.handlers:
        handler = logging.StreamHandler()
        handler.setFormatter(logging.Formatter(
            "[%(asctime)s] %(levelname)s [%(name)s] %(message)s",
            datefmt="%Y-%m-%d %H:%M:%S"
        ))
        logger.addHandler(handler)
    logger.setLevel(logging.INFO)
    return logger


def make_log_entry(event: str, **kwargs) -> dict:
    """Build a structured log entry dict to be stored in job.logs (JSON)."""
    return {
        "timestamp": datetime.utcnow().isoformat(),
        "event": event,
        **kwargs,
    }
