# Ontario Service & Facility Finder

A full stack web app for finding community services and facilities across Ontario.

The app lets users search, filter, and view details for services such as health clinics, food banks, housing support, libraries, and community centres. Admins can log in to manage the directory.

## Tech stack

- **Frontend**: React (TypeScript environment), Fetch API

- **Backend**: Node.js, Express

- **Database**: PostgreSQL

- **ORM**: Prisma

- **Auth**: JSON Web Tokens (JWT)

- **Validation**: Zod

## Project structure

```text
ontario-service-finder/
  backend/
    controllers/
      authController.js
      serviceController.js
    lib/
      prisma.js
    middleware/
      authMiddleware.js
    prisma/
      schema.prisma
    routes/
      authRoutes.js
      serviceRoutes.js
    scripts/
      seedServices.js
    validation/
      serviceSchemas.js
    index.js
    package.json
  frontend/
    src/
      api/
        auth.js
        services.js
      components/
        ServiceDetails.jsx
        ServiceForm.jsx
        ServiceList.jsx
      App.jsx
      main.tsx (or index.tsx)
    package.json
  README.md
```

backend/ – Express API, Prisma models, auth, validation, seed scripts.

frontend/ – React UI (search, filters, admin CRUD).

# Backend

## Prerequisites

Node.js (LTS)

PostgreSQL running locally

DATABASE_URL configured in backend/.env

Example backend/.env:

```
DATABASE_URL="postgresql://postgres:YOUR_PASSWORD@localhost:5432/ontario_service_finder?schema=public"

JWT_SECRET="supersecret_change_me_to_something_long"
ADMIN_EMAIL="admin@example.com"
ADMIN_PASSWORD="password123"
```

Replace YOUR_PASSWORD with your actual Postgres password.
Change JWT_SECRET, ADMIN_EMAIL and ADMIN_PASSWORD to your own values.

## Install dependencies and run migrations

```bash
cd backend
npm install
```

## Run initial migration

npx prisma migrate dev --name init

If you later change the Prisma schema in prisma/schema.prisma, run another migration:

```bash
npx prisma migrate dev --name your_migration_name
```

## Seed sample data

There is a seed script that clears the Service table and inserts Ontario-style sample services.

```bash
cd backend
npm run seed
```

This will:

Delete all existing rows in the Service table.

Insert a set of sample services in different Ontario cities and categories.

## Run the backend API

```bash
cd backend
npm run dev
```

The API will run on:

```
http://localhost:4000
```

## Key endpoints:

`GET /api/health`
Health check.

`GET /api/services`
List services with search, filters, and pagination.

`GET /api/services/:id`
Get a single service by id.

`POST /api/auth/login`
Admin login. Returns a JWT if email and password match ADMIN_EMAIL and ADMIN_PASSWORD from .env.

`POST /api/services`
Create a new service. Requires admin JWT.

`PUT /api/services/:id`
Update a service. Requires admin JWT.

`DELETE /api/services/:id`
Delete a service. Requires admin JWT.

## Filters and pagination

GET /api/services accepts these query parameters:

q – free text search across name, address, city, category, postal code

city – exact city match, case insensitive

category – exact category match, case insensitive

page – page number (1-based)

pageSize – items per page (min 1, max 100)

Example:

`GET /api/services?q=health&city=Toronto&category=Health&page=2&pageSize=10`

Response shape:

```
{
  "data": [ /* array of services */ ],
  "total": 42,
  "page": 1,
  "pageSize": 10,
  "totalPages": 5
}
```

## Validation and error handling

All write operations go through Zod schemas:

```
POST /api/services

PUT /api/services/:id
```

If validation fails, the API returns:

```
{
  "error": "Validation failed",
  "details": [
    { "path": "name", "message": "Name must be at least 2 characters" },
    { "path": "city", "message": "City must be at least 2 characters" }
  ]
}
```

There is also a global error handler that returns a standard JSON shape for unhandled errors:

```
{
  "error": "Internal server error"
}
```

## Backend architecture

index.js
Express app setup, middleware, logging, health route, route registration, global error handler.

routes/

authRoutes.js – login route.

serviceRoutes.js – CRUD routes for services.

controllers/

authController.js – login logic, JWT creation.

serviceController.js – list, get, create, update, delete services.

lib/prisma.js
Shared Prisma client instance.

validation/serviceSchemas.js
Zod schemas for service create and update, plus helper to format validation errors.

middleware/authMiddleware.js
JWT authentication and requireAdmin checks for protected routes.

scripts/seedServices.js
Seed script for local development data.

# Frontend

```bash
Install and run
cd frontend
npm install
npm run dev
```

The frontend will run on something like:

`http://localhost:3000`

or a dev port such as `http://localhost:5173`, depending on your setup.

Make sure the backend is running on `http://localhost:4000`.
If you change the backend URL, update `API_BASE_URL` in:

`frontend/src/api/services.js`

`frontend/src/api/auth.js`

## Frontend features

Service list

Table of services.

Pagination with Previous and Next buttons.

Display of total count and current range (e.g. “showing 1–10 of 42”).

Search and filters

Text search across multiple fields (name, address, city, category, postal code).

City filter input.

Category dropdown based on a predefined list of categories (Health, Housing, Food Bank, Library, etc.).

Service details panel

Name, category, address, city, postal code.

Phone number and website link.

Created and updated timestamps.

Admin functionality

Admin login form on the main page.

Email and password come from backend .env (ADMIN_EMAIL / ADMIN_PASSWORD).

## Successful login:

Stores a JWT in localStorage.

Sends Authorization: Bearer <token> for create / update / delete.

Shows the Service form and Edit/Delete buttons.

Logout clears the token and hides admin actions.

Running everything together

Start PostgreSQL and ensure DATABASE_URL is correct in backend/.env.

From backend/:

```bash
npm install
npx prisma migrate dev
npm run seed
npm run dev
```

From frontend/:

```bash
npm install
npm run dev
```

Open the frontend URL in your browser. You should see the seeded Ontario services immediately on first load.
