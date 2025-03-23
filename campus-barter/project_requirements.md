# Campus Barter System - Project Requirements

## Overview
The Campus Barter System is a platform designed for college students to trade goods and services without using cash. The system uses AI to match users with potential trade opportunities and aims to create a sustainable, campus-exclusive marketplace.

## Core Features

### User Management
- User registration and authentication
- User profiles with reputation scores
- Campus email verification

### Item/Service Management
- Listing items for trade
- Listing services for trade (tutoring, skills, etc.)
- Item/service categories and tags
- Image upload for items
- Description and condition details

### Trade System
- Trade request creation
- Trade offer management (accept/reject/counter)
- Trade history tracking
- In-app messaging between traders

### AI-Powered Matching
- NLP-based matching of items/services
- Recommendation system for potential trades
- "Instant needs" matching for urgent requests

### Search and Discovery
- Advanced search functionality
- Filtering by category, condition, etc.
- Sorting options (newest, most relevant, etc.)

## Data Models

### User Model
- ID (primary key)
- Name
- Email (campus email)
- Password (hashed)
- Profile picture
- Bio/description
- Reputation score
- Join date
- Items listed (relationship)
- Trade history (relationship)

### Item/Service Model
- ID (primary key)
- Title
- Description
- Category
- Condition (for items)
- Images
- Tags
- Date listed
- Status (available, pending, traded)
- Owner (relationship to User)

### Trade Model
- ID (primary key)
- Initiator (relationship to User)
- Recipient (relationship to User)
- Offered items/services (relationship to Item/Service)
- Requested items/services (relationship to Item/Service)
- Status (pending, accepted, rejected, completed)
- Creation date
- Completion date
- Messages (relationship)

### Message Model
- ID (primary key)
- Trade (relationship to Trade)
- Sender (relationship to User)
- Content
- Timestamp

## API Endpoints

### Authentication
- POST /api/auth/register - Register new user
- POST /api/auth/login - User login
- GET /api/auth/verify - Verify user email
- GET /api/auth/me - Get current user

### Users
- GET /api/users/:id - Get user profile
- PUT /api/users/:id - Update user profile
- GET /api/users/:id/items - Get user's listed items
- GET /api/users/:id/trades - Get user's trade history

### Items/Services
- GET /api/items - Get all items (with filters)
- POST /api/items - Create new item listing
- GET /api/items/:id - Get specific item
- PUT /api/items/:id - Update item
- DELETE /api/items/:id - Delete item
- GET /api/items/categories - Get all categories

### Trades
- GET /api/trades - Get user's trades
- POST /api/trades - Create trade request
- GET /api/trades/:id - Get specific trade
- PUT /api/trades/:id - Update trade status
- POST /api/trades/:id/messages - Send message in trade

### AI Matching
- GET /api/match/recommendations - Get trade recommendations
- POST /api/match/instant - Find instant need matches

## UI Components and Pages

### Pages
- Landing/Home Page
- Login/Register Page
- User Dashboard
- Item Listing Page
- Item Detail Page
- Create/Edit Item Page
- Trade Management Page
- Trade Detail/Chat Page
- User Profile Page
- Search Results Page

### Components
- Navigation Bar
- Footer
- Item Card
- User Card
- Trade Card
- Search Bar
- Filter Panel
- Message Thread
- Image Carousel
- Form Components (inputs, buttons, etc.)
- Notification Component

## Technology Stack

### Frontend
- React.js for UI components
- React Router for navigation
- Context API or Redux for state management
- Axios for API requests
- CSS frameworks (e.g., Tailwind CSS, Bootstrap)

### Backend
- Flask (Python) for API development
- SQLAlchemy for ORM
- JWT for authentication
- Flask-RESTful for API endpoints

### AI/ML
- OpenAI API for NLP and matching
- Custom recommendation algorithms

### Database
- PostgreSQL or SQLite for development

### Deployment
- Vercel for hosting frontend and backend

## Non-Functional Requirements
- Mobile-responsive design
- Fast loading times
- Secure authentication
- Data privacy compliance
- Scalable architecture
