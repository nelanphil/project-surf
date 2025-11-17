# Server Setup

MERN backend for Project Surf. Provides Express API with MongoDB persistence, JWT authentication, and bcrypt-backed password management.

## Prerequisites

- Node.js 18+
- MongoDB instance (local or hosted)

## Environment

Copy `.env.example` to `.env` and update:

- `PORT`: API port (default 5000)
- `MONGO_URI_DEVELOPMENT` (or `MONGO_URL_DEVELOPMENT`): local/dev Mongo connection string
- `MONGO_URI_PRODUCTION` (or `MONGO_URL_PRODUCTION`): hosted/prod Mongo connection string
- `MONGO_URI` / `MONGO_URL` _(optional fallback)_: used only if the env-specific variables are absent
- `JWT_SECRET`: secure string for signing tokens
- `FRONTEND_URL`: Frontend application URL for OAuth redirects (default: `http://localhost:3000`)
- `GOOGLE_CLIENT_ID`: Google OAuth client ID (required for Google sign-in)
- `GOOGLE_CLIENT_SECRET`: Google OAuth client secret (required for Google sign-in)
- `GOOGLE_CALLBACK_URL`: Google OAuth callback URL (default: `/api/users/auth/google/callback`)

### Email (Contact form)
Add the following SMTP variables to enable the contact form email sender. You can copy from `env.example`:

- `CONTACT_TO_EMAIL` – recipient address for contact form (e.g., `pnelan@gmail.com`)
- `SMTP_HOST` – SMTP server (e.g., `smtp.gmail.com`)
- `SMTP_PORT` – SMTP port (e.g., `465` for secure)
- `SMTP_SECURE` – `true` if using TLS on port 465, else `false`
- `SMTP_USER` – SMTP username (for Gmail, your address)
- `SMTP_PASS` – SMTP password or App Password (recommended)

## Scripts

- `npm run dev` – start API with nodemon (auto-reload)
- `npm start` – run API with Node

## Endpoints

- `POST /api/users/register` – create user
- `POST /api/users/login` – login + get JWT
- `GET /api/users` – list users (auth)
- `GET /api/users/me` – current user profile (auth)
- `PUT /api/users/me` – update profile (auth)
- `DELETE /api/users/:id` – delete own account (auth + ownership)

Add additional collections/routes as the application grows.
