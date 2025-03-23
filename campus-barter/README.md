# README.md - Campus Barter

## Overview
Campus Barter is an AI-powered platform that enables students to trade goods and services on campus. The platform uses AI to match trades, recommend opportunities, and facilitate instant needs exchanges.

## Features
- User authentication and profile management
- Item listing and management
- AI-powered trade recommendations
- Instant needs matching
- Trade proposal and management
- Messaging between users
- Item analysis and improvement suggestions

## Tech Stack
- **Frontend**: React.js with TypeScript
- **Backend**: Flask (Python)
- **Database**: SQLite (development), can be migrated to PostgreSQL for production
- **AI Integration**: OpenAI API for matching and recommendations
- **Deployment**: Vercel for both frontend and backend

## Project Structure
```
campus-barter/
├── backend/               # Flask backend
│   ├── api/               # Vercel serverless functions
│   ├── app/               # Main application code
│   │   ├── models/        # Database models
│   │   ├── routes/        # API routes
│   │   ├── utils/         # Utility functions
│   │   └── __init__.py    # App initialization
│   ├── tests/             # Backend tests
│   ├── .env               # Environment variables
│   ├── requirements.txt   # Python dependencies
│   └── vercel.json        # Vercel configuration
│
├── frontend/              # React frontend
│   ├── public/            # Static files
│   ├── src/               # Source code
│   │   ├── components/    # Reusable components
│   │   ├── context/       # React context providers
│   │   ├── hooks/         # Custom React hooks
│   │   ├── pages/         # Page components
│   │   ├── services/      # API service functions
│   │   ├── styles/        # CSS styles
│   │   ├── tests/         # Frontend tests
│   │   ├── types/         # TypeScript type definitions
│   │   └── utils/         # Utility functions
│   ├── .env               # Environment variables
│   ├── package.json       # NPM dependencies
│   └── vercel.json        # Vercel configuration
```

## Setup Instructions

### Backend Setup
1. Navigate to the backend directory:
   ```
   cd campus-barter/backend
   ```

2. Create a virtual environment:
   ```
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. Install dependencies:
   ```
   pip install -r requirements.txt
   ```

4. Set up environment variables:
   - Create a `.env` file based on `.env.example`
   - Add your OpenAI API key

5. Initialize the database:
   ```
   python -c "from app import create_app, db; app = create_app(); app.app_context().push(); db.create_all()"
   ```

6. Run the development server:
   ```
   python run.py
   ```

### Frontend Setup
1. Navigate to the frontend directory:
   ```
   cd campus-barter/frontend
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Set up environment variables:
   - Create a `.env` file based on `.env.example`
   - Set the API URL to your backend server

4. Run the development server:
   ```
   npm start
   ```

## Deployment

### Backend Deployment (Vercel)
1. Make sure you have the Vercel CLI installed:
   ```
   npm install -g vercel
   ```

2. Navigate to the backend directory:
   ```
   cd campus-barter/backend
   ```

3. Deploy to Vercel:
   ```
   vercel
   ```

### Frontend Deployment (Vercel)
1. Navigate to the frontend directory:
   ```
   cd campus-barter/frontend
   ```

2. Build the production version:
   ```
   npm run build
   ```

3. Deploy to Vercel:
   ```
   vercel
   ```

## Testing
- Backend tests: `cd backend && python -m unittest discover tests`
- Frontend tests: `cd frontend && npm test`

## AI Matching System
The AI matching system uses OpenAI's API to:
1. Generate embeddings for items and user needs
2. Calculate similarity between items
3. Provide intelligent trade recommendations
4. Find instant matches for urgent needs
5. Generate human-readable reasons for recommendations

A mock matching system is also available for testing without an OpenAI API key.

## Contributors
- Your Name

## License
MIT
