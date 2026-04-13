# Nestora

Nestora is a full-stack real estate platform inspired by the reference screenshots you provided. It supports live property browsing, buy or rent inquiries, and an admin studio that stores and retrieves data through a Render-friendly database setup.

## What works

- Buyers and renters can search listings by keyword, category, listing type, bedrooms, price, and featured status.
- Users can open property details, browse galleries, and send inquiries for buying, renting, or tours.
- Admins can create, update, and delete property records.
- Admins can retrieve stored listings and inquiries from the dashboard.
- Seed data is inserted automatically on first run so the site feels populated immediately.
- The interface is responsive and visually rebuilt around the warm brown, beige, and card-based style shown in your references.

## Stack

- Front end: HTML, CSS, vanilla JavaScript
- Back end: Node.js + Express
- Database: PostgreSQL on Render, with local SQLite fallback via `better-sqlite3`

## Project structure

- `server/server.js`: Express server, database initialization, seed data, and API routes
- `public/index.html`: UI structure
- `public/styles.css`: visual system and responsive layout
- `public/app.js`: storefront logic, search, inquiry flow, and admin dashboard behavior
- `data/real-estate.db`: local SQLite database used automatically when `DATABASE_URL` is not set

## API overview

- `GET /api/properties`
- `GET /api/properties/:id`
- `POST /api/properties`
- `PUT /api/properties/:id`
- `DELETE /api/properties/:id`
- `POST /api/inquiries`
- `GET /api/admin/summary`
- `GET /api/admin/properties`
- `GET /api/admin/inquiries`

## Database schema

The app stores:

- `properties`
- `inquiries`

The schema is created automatically in [`server/server.js`](./server/server.js) on startup. A matching SQL reference is available in [`schema.sql`](./schema.sql).

## Run locally

1. Install dependencies:
   `npm install`
2. Start the app:
   `npm start`
3. Open:
   `http://localhost:3000`

## Deploy on Render

This app is ready for Render deployment with PostgreSQL via [`render.yaml`](./render.yaml).

Recommended steps:

1. Push this project to GitHub.
2. In Render, create a new `Blueprint` from the repository.
3. Confirm these environment variables:
   - `ADMIN_USERNAME`
   - `ADMIN_PASSWORD`
   - `SESSION_SECRET`
   - `DATABASE_URL` is provisioned automatically from the Render Postgres service in `render.yaml`
4. Deploy and open the generated Render URL.

Why Render:

- Render can provision a managed PostgreSQL database and inject `DATABASE_URL` into the web service.
- This avoids the paid persistent-disk requirement that the old SQLite deployment depended on.

## Notes

- The public user login is still a lead-capture form, not full user-account auth.
- Admin access uses session-based authentication.
- A deployment hardening checklist is available in [`PRODUCTION_CHECKLIST.md`](./PRODUCTION_CHECKLIST.md).
- If you want next, I can add image upload, favorites, or a proper React/Next.js version.
