# Material TDS Retrieval Platform

A high-performance, asynchronous web scraper and presentation dashboard built to discover, validate, and download Technical Data Sheets (TDS) and material specifications from manufacturers.

This project is divided into two distinct services:
1. **Backend:** A robust Python/FastAPI async scraping engine.
2. **Frontend:** A modern, Vite/React presentation dashboard using Tailwind CSS.

---

## Architecture Overview

*   **Search Engine Integration:** Supports custom DuckDuckGo HTML parsing, `googlesearch-python` fallbacks, and resilient proxy-routing via `SerpAPI`.
*   **Intelligent Fetching:** Uses asynchronous `httpx` to download HTML. If a page is JavaScript-heavy or protected against basic bots, it falls back seamlessly to a headless `Playwright` browser running in a background thread to render the DOM.
*   **Confidence Scoring:** Extracts PDF links and evaluates them using textual, context, domain matching, and penalty (SDS) signals to rate the candidate document out of 100%.
*   **Deduplication:** Downloads are cryptographically hashed by URL to prevent saving duplicate PDFs over multiple runs.
*   **Asynchronous Workers:** Scraping logic is dispatched to background threads so the FastAPI server remains blazing fast and unblocked.

---

## 🚀 1. Backend Setup (FastAPI)

### Prerequisites
*   Python 3.10+
*   Virtual Environment (Optional but recommended)

### Installation
1. Navigate to the backend directory:
   ```bash
   cd e:/data_scraper/backend
   ```
2. Install the required Python dependencies:
   ```bash
   pip install -r requirements.txt
   ```
3. Install headless browsers for the Playwright fallback engine:
   ```bash
   playwright install
   ```

### Configuration
1. Create a `.env` file in the `backend/` directory by copying `.env.example`:
   ```bash
   cp .env.example .env
   ```
2. Update the `.env` configuration:
   ```ini
   # Required if you want to bypass standard search engine IP blocks completely
   SEARCH_PROVIDER=serpapi
   SERPAPI_KEY=your_active_serpapi_key_here
   ```

### Running the Server
Start the backend using uvicorn with live-reload enabled:
```bash
python -m uvicorn main:app --reload --port 8000
```
*The API will be available at `http://localhost:8000`.*
*Swagger UI docs available at `http://localhost:8000/docs`.*

---

## ⚡ 2. Frontend Setup (React/Vite)

### Prerequisites
*   Node.js (v18+)

### Installation
1. Navigate to the frontend directory:
   ```bash
   cd e:/data_scraper/frontend
   ```
2. Install Node modules:
   ```bash
   npm install
   ```

### Running the Application
Start the Vite developer server:
```bash
npm run dev
```
*The Dashboard will be accessible via browser at `http://localhost:5173/`.*

---

## Feature Roadmap
- [x] Initial full-stack implementation and candidate extraction pipeline.
- [x] Background ThreadPoolExecutor integration and API endpoints.
- [x] SerpAPI resilient routing integration fallback.
- [ ] Implement Search Engine Telemetry / Statistics polling functionality.
- [ ] Executive MNC-grade UX/UI aesthetic pipeline redesign.
