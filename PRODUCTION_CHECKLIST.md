# Production Readiness Checklist

## Security

- Replace demo admin credentials with environment-based secrets.
- Hash passwords with `bcrypt` or `argon2` instead of storing plain comparisons.
- Add CSRF protection for authenticated admin actions.
- Add rate limiting on login and inquiry endpoints.
- Add secure cookie settings:
  - `secure: true` in production
  - `sameSite: "lax"` or stricter as needed
  - explicit session expiry
- Validate and sanitize all request payloads with a schema library such as `zod` or `joi`.
- Add server-side authorization for every admin-only route.
- Hide stack traces and internal errors from users.

## Authentication

- Create real user accounts if customer login is required.
- Add logout confirmation and session expiration handling.
- Add password reset flow for admin users.
- Move admin auth data to a database-backed users table.

## Database

- Add migrations instead of relying only on runtime table creation.
- Add indexes for common property search fields:
  - `location`
  - `category`
  - `listing_type`
  - `price`
  - `bedrooms`
- Add a backup strategy for SQLite or move to PostgreSQL for multi-user production usage.
- Add seed scripts separate from app startup.

## Media

- Move remote demo image URLs to managed storage.
- Add image upload support for admin-managed listings.
- Add fallback placeholder images for broken or missing assets.
- Optimize images for faster loading.

## Frontend UX

- Add loading states for property fetches and form submits.
- Add success and error toasts instead of only inline messages.
- Add empty states for filtered results and admin tables.
- Add pagination or lazy loading for large property catalogs.
- Improve accessibility:
  - keyboard navigation
  - visible focus states
  - aria labels for interactive controls
  - semantic landmark review

## Forms

- Add stronger validation for:
  - email
  - phone
  - price
  - bedrooms/bathrooms
- Persist public user inquiries in a CRM or email workflow.
- Add spam protection such as CAPTCHA or honeypot fields.

## Admin

- Add audit logging for property edits and deletes.
- Add draft/published/archive workflow.
- Add image upload and preview in the property editor.
- Add filters and search inside admin property management.

## Deployment

- Add environment variable handling for:
  - admin credentials
  - session secret
  - database path
- Add a process manager or service runner.
- Add HTTPS in production.
- Add reverse proxy configuration if deployed behind Nginx or Caddy.
- Add health-check endpoint.

## Monitoring

- Add request logging.
- Add error tracking such as Sentry.
- Add uptime monitoring.
- Add analytics for property views and inquiry conversions.

## Testing

- Add API tests for property CRUD and inquiry flows.
- Add end-to-end tests for:
  - homepage search
  - property modal
  - user login dialog
  - admin login
  - admin create/edit/delete
- Add visual regression tests for the homepage layout.

## Recommended Next Build Steps

1. Add real admin authentication with hashed passwords.
2. Add image upload with stored media.
3. Move from SQLite to PostgreSQL if multiple admins will use the app.
4. Add schema validation and rate limiting.
5. Add automated tests before deployment.
