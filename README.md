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
- **Backend**: Node.js/Express, WebSocket
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
