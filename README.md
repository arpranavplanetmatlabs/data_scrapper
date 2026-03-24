# Material Intelligence | Elite TDS Retrieval Platform

A production-grade, MNC-elite Technical Data Sheet (TDS) discovery engine. Built for high-contrast, manual visual inspection and global discovery of material science documentation.

## 💎 Elite Features

- **Swiss-Inspired Monochrome UI**: A high-contrast Black & White design system (Zinc palette) optimized for professional concentration.
- **Weighted Momentum Scrolling**: Integrated hardware-accelerated Lenis scrolling for a "creamy," premium navigational feel.
- **Multi-Engine Aggregation**: Orchestrates discovery across **SerpAPI**, **Google Index**, and **DuckDuckGo** crawl signals to maximize market coverage.
- **Global Discovery Guard**: Sophisticated duplicate detection that ensures a PDF URL is only ever presented for review once, globally across all sessions.
- **Manual Elite Workflow**: Optimised for visual inspection. The system stores verified archives but delegates file management to manual user download for visual integrity.
- **Intelligent Playwright Automation**: Automatic failover to headless browser automation when search engines employ bot-detection.

## 🛠 Technology Stack

- **Backend**: FastAPI (Asynchronous Python 3.10+)
- **Frontend**: React + Vite + TailwindCSS 3.4
- **Database**: SQLModel (SQLite with AsyncIO)
- **Scraping**: SerpAPI, playwright, httpx, BeautifulSoup4
- **Animations**: Lenis (Smooth scroll), Framer Motion-inspired CSS architecture.

## 🚀 Rapid Deployment

### 1. Prerequisites
- Python 3.10+
- Node.js 18+
- [SerpAPI Key](https://serpapi.com/) (Optional but recommended)

### 2. Backend Setup
```bash
cd backend
python -m venv venv
source venv/bin/activate  # Or `venv\Scripts\activate` on Windows
pip install -r requirements.txt
# Create a .env file with your SERPAPI_KEY
python -m uvicorn main:app --reload --port 8000
```

### 3. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

## 🛡️ Manual Verification Workflow
1. **Discovery**: Enter a manufacturer and material category. The system aggregates unique signals from 3 search engines.
2. **Nomenclature Registry**: Visually inspect the discovered candidates. The engine calculates "Discovery Clarity" scores (80-95%) for each file.
3. **Archive Pulse**: Click the checkmark to archive the item. No files are downloaded to the server—only the verified coordinates and direct links are stored.
4. **Manual Extraction**: Access the "Archive Vault" to download the verified TDS documents directly from the source.

---
*Developed for elite material researchers and enterprise procurement teams.*
