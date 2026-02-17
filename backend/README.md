# Backend (NestJS + Redis)

REST API with **user auth** (register/login) and **roster** storage in Redis.

## Setup

1. **Redis** – install locally or use [Redis Cloud](https://redis.com/try-free/).

2. **Install and run:**
   ```bash
   cd backend
   cp .env.example .env
   # Edit .env: set REDIS_URL and JWT_SECRET
   npm install
   npm run start:dev
   ```
   API runs at `http://localhost:3001`.

## Endpoints

### Auth (no token)

- `POST /auth/register` – body: `{ "email": "...", "password": "..." }` → returns `{ user, access_token }`
- `POST /auth/login` – body: `{ "email": "...", "password": "..." }` → returns `{ user, access_token }`

### Protected (header: `Authorization: Bearer <access_token>`)

- `GET /auth/me` – current user
- `GET /roster` – get roster for current user (from Redis)
- `POST /roster` – save roster; body: `{ employees: [...], shifts: [...] }`

## Data in Redis

- Users: `user:<email>` → JSON (id, email, passwordHash, createdAt)
- Email→id: `email_to_id:<id>` → email (for lookup by id)
- Roster: `roster:<userId>` → JSON `{ employees, shifts }`

No TTL by default; data persists until you delete it or flush Redis.
