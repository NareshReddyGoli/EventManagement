# Event Management Backend (Express + MongoDB)

This is the backend API for the Event Management System. It uses Express.js, Mongoose (MongoDB), JWT for auth, and follows the frontend data models in `frontend/src/types/`.

## Features

- Admin login only via environment variables (no admin signup)
- JWT-based auth
- Users (student/coordinator) CRUD (admin only)
- Events CRUD
- Venues CRUD
- Registrations CRUD with auto-updated `registeredCount`
- Schedules CRUD
- Certificates and Certificate Templates
- CORS configured for Vite dev server

## Environment Variables

Create a `.env` file in `backend/`:

```
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/event_management

JWT_SECRET=replace_with_strong_secret
JWT_EXPIRES_IN=30d

# Admin credentials (used ONLY for login; no admin record in DB)
ADMIN_USERNAME=admin
ADMIN_EMAIL=admin@university.edu
ADMIN_PASSWORD=admin123
ADMIN_FIRST_NAME=John
ADMIN_LAST_NAME=Admin

# CORS
CORS_ORIGIN=http://localhost:5173
```

## Install & Run

1. Install dependencies:
   ```bash
   npm install
   ```
2. Start the server (development with auto-reload):
   ```bash
   npm run dev
   ```
   Or production:
   ```bash
   npm start
   ```

The server starts on `http://localhost:5000` by default.

## API Summary

- `POST /api/auth/login` — Login for admin (env credentials) or non-admin users in DB
- `GET /api/auth/me` — Return current user from JWT

- `POST /api/users` — Create student/coordinator (public signup)
- `GET /api/users` — List users (admin)
- `GET /api/users/:id` — Get user (admin)
- `PUT /api/users/:id` — Update user (admin)
- `DELETE /api/users/:id` — Remove user (admin)

- `GET /api/events` — List events (public)
- `GET /api/events/:id` — Get event (public)
- `POST /api/events` — Create event (admin/coordinator)
- `PUT /api/events/:id` — Update event (admin/coordinator)
- `DELETE /api/events/:id` — Delete event (admin/coordinator)

- `GET /api/venues` — List venues (public)
- `GET /api/venues/:id` — Get venue (public)
- `POST /api/venues` — Create venue (admin/coordinator)
- `PUT /api/venues/:id` — Update venue (admin/coordinator)
- `DELETE /api/venues/:id` — Delete venue (admin/coordinator)

- `POST /api/registrations` — Create registration (public)
- `GET /api/registrations` — List registrations (admin/coordinator)
- `GET /api/registrations/:id` — Get registration (admin/coordinator)
- `PUT /api/registrations/:id` — Update registration (admin/coordinator)
- `DELETE /api/registrations/:id` — Delete registration (admin/coordinator)

- `GET /api/schedules` — List schedules (public)
- `GET /api/schedules/:id` — Get schedule (public)
- `POST /api/schedules` — Create schedule (admin/coordinator)
- `PUT /api/schedules/:id` — Update schedule (admin/coordinator)
- `DELETE /api/schedules/:id` — Delete schedule (admin/coordinator)

- `GET /api/certificates/templates` — List templates (admin/coordinator)
- `POST /api/certificates/templates` — Create template (admin/coordinator)
- `PUT /api/certificates/templates/:id` — Update template (admin/coordinator)
- `DELETE /api/certificates/templates/:id` — Remove template (admin/coordinator)
- `GET /api/certificates` — List certificates (admin/coordinator)
- `POST /api/certificates` — Issue certificate (admin/coordinator)
- `DELETE /api/certificates/:id` — Delete certificate (admin/coordinator)

## Notes

- Admin signup is disabled by design. Admin can only login using credentials in `.env`.
- Non-admin users (students, coordinators) are stored in MongoDB and can be created via `POST /api/users`.
- Adjust CORS with `CORS_ORIGIN` if your frontend runs on a different origin.
