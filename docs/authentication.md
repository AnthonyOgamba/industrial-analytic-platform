# DIVU authentication configuration

The application runs its authentication API in Next.js route handlers and applies `migrations/001_auth.sql` automatically to the configured SQLite database.

Required production settings:

- `JWT_SIGNING_KEY`: a high-entropy secret of at least 32 bytes.
- `DIVU_BOOTSTRAP_ADMIN_USERNAME`, `DIVU_BOOTSTRAP_ADMIN_EMAIL`, and `DIVU_BOOTSTRAP_ADMIN_PASSWORD`: optional first-run administrator seed. Remove these after the account is created.
- `DIVU_DATABASE_PATH`: writable SQLite path (defaults to `data/divu.sqlite`).
- `NEXT_PUBLIC_APP_URL`: canonical HTTPS frontend origin used in recovery links.
- `PASSWORD_RESET_EMAIL_WEBHOOK_URL`: email provider webhook accepting `{ to, template, resetUrl }`.

Optional settings:

- `JWT_ISSUER` (default `divu-analytics`)
- `JWT_AUDIENCE` (default `divu-web`)
- `JWT_EXPIRY_SECONDS` (default eight hours)

Development logs may contain a password reset URL when no email webhook is configured. Production never logs or returns the raw reset token.
