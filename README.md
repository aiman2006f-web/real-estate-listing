# Homeverse Lane

Homeverse Lane is now a full-stack real estate platform inspired by the reference screenshots you provided. It supports live property browsing, buy or rent inquiries, and an admin studio that stores and retrieves data from a persistent SQLite database.

## What works

- Buyers and renters can search listings by keyword, category, listing type, bedrooms, price, and featured status.
- Users can open property details, browse galleries, and send inquiries for buying, renting, or tours.
- Admins can create, update, and delete property records.
- Admins can retrieve stored listings and inquiries from the dashboard.
- Seed data is inserted automatically on first run so the site feels populated immediately.
- The interface is responsive and visually rebuilt around the warm coral, navy, and card-based style shown in your references.

## Stack

- Front end: HTML, CSS, vanilla JavaScript
- Back end: Node.js + Express
- Database: SQLite via `better-sqlite3`

## Project structure

- `server/server.js`: Express server, database initialization, seed data, and API routes
- `public/index.html`: UI structure
- `public/styles.css`: visual system and responsive layout
- `public/app.js`: storefront logic, search, inquiry flow, and admin dashboard behavior
- `data/real-estate.db`: persistent SQLite database created automatically at runtime

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

The app currently stores:

- `properties`
- `inquiries`

The schema is created automatically in `server/server.js` on startup. A matching SQL reference is available in [`schema.sql`](./schema.sql).

## Run locally

1. Install dependencies:
   `npm install`
2. Start the app:
   `npm start`
3. Open:
   `http://localhost:3000`

## Deploy on Railway

This app is ready to deploy on Railway with persistent storage for SQLite.

Recommended steps:

1. Create a new Railway project from this GitHub repo.
2. Add a `Volume` to the service.
3. Mount the volume to `/data`.
4. Set these environment variables:
   - `ADMIN_USERNAME`
   - `ADMIN_PASSWORD`
   - `SESSION_SECRET`
   - `DB_PATH=/data/real-estate.db`
5. Deploy and open the generated Railway URL.

Why Railway:

- Railway supports persistent volumes for apps that need local file storage.
- This app uses SQLite, so it needs the database file to survive redeploys.

## Deploy on Render

This app is ready for Render deployment with persistent SQLite storage via [`render.yaml`](./render.yaml).

Recommended steps:

1. Push this project to GitHub.
2. In Render, create a new Blueprint or Web Service from the repository.
3. Confirm these environment variables:
   - `ADMIN_USERNAME`
   - `ADMIN_PASSWORD`
   - `SESSION_SECRET`
   - `DB_PATH` should stay `/var/data/real-estate.db`
4. Keep the attached persistent disk mounted at `/var/data`.
5. Deploy and open the generated Render URL.

Why Render:

- Render supports persistent disks for web services: [Render Persistent Disks](https://render.com/docs/disks)
- This matters because SQLite needs a persistent local file.

Do not deploy this current SQLite setup to Vercel:

- Vercel says SQLite is not supported there because serverless local storage is ephemeral: [Vercel SQLite guidance](https://vercel.com/kb/guide/is-sqlite-supported-in-vercel)

## Notes

- This build is demo-admin friendly and does not yet include authentication.
- A deployment hardening checklist is available in [`PRODUCTION_CHECKLIST.md`](./PRODUCTION_CHECKLIST.md).
- If you want next, I can add image upload, favorites, or a proper React/Next.js version.
