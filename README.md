# OmniSync - Python-Powered Personal Dashboard

A full-stack personal dashboard with real-time syncing, Python analytics engine, and intelligent insights.

## Features

- **Real-time Sync**: WebSocket-based cross-device synchronization
- **Python Analytics Engine**: Advanced productivity metrics, trend analysis, anomaly detection
- **Widgets**: Habits, To-Dos, Calendar, Weather, News, Fun Facts, Relaxation tracking
- **Email Briefings**: AI-generated executive digests via Python backend
- **Python Studio**: Run custom Python scripts on your dashboard data
- **Multi-city Weather**, **Email Hub**, **Habit Tracker**

## Tech Stack

- **Frontend**: React 19, TypeScript, Vite, Tailwind CSS
- **Backend**: Node.js/Express, WebSocket, FastAPI (Python API)
- **Analytics**: Python (custom analytics engine)
- **Storage**: JSON-based state persistence

## Setup

### Prerequisites
- Node.js
- Python 3

### Installation

1. Install dependencies:
```bash
npm install
```

2. Set environment variables (create `.env`):
```env
GEMINI_API_KEY=your_gemini_api_key
```

3. Run the development server:
```bash
npm run dev
```

The app will be available at `http://localhost:3000`

## API Endpoints

- `GET /api/state` - Get dashboard state
- `POST /api/python/analyze` - Run Python analytics
- `POST /api/python/digest` - Generate email digest
- `POST /api/python/run` - Execute custom Python script

## FastAPI Backend

The `app/` package contains a modular FastAPI backend for authentication, documents, weather presets, and email summaries.

### Run

```bash
python -m venv venv
source venv/bin/activate
pip install -r requirements-dev.txt
uvicorn app.main:app --reload --port 8000
```

### Test

```bash
pytest
```

### API

- `GET /api/health` - Service health
- `POST /api/auth/register` - Create an account
- `POST /api/auth/token` - Obtain a JWT
- `GET /api/auth/me` - Current user
- `GET|POST /api/documents` - List or create documents
- `GET|PATCH|DELETE /api/documents/{id}` - Manage a document
- `GET /api/weather?city=...` - Current weather and 5-day forecast
- `GET /api/weather/status` - OpenWeather configuration status
- `GET|POST /api/weather/locations` - List or add saved locations
- `PATCH|DELETE /api/weather/locations/{id}` - Manage a saved location
- `GET /api/weather/locations/{id}/forecast` - Weather for a saved location
- `GET /api/emails/status` - Gmail configuration status
- `GET /api/emails/logs` - Sent email history
- `POST /api/emails/send-summary` - Compile and email a progress summary

### Integration Keys

Copy `.env.example` to `.env` and set:

- `OPENWEATHER_API_KEY` for live weather data
- `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `REDIRECT_URI` for Google login
- `GOOGLE_CREDENTIALS_PATH`, `GOOGLE_TOKEN_PATH`, `GMAIL_SENDER` for Gmail summaries

The weather and Gmail integrations return a clear `503` until their credentials are configured.
