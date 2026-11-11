# Security policy

## Reporting a vulnerability

Please do not open a public issue for a security problem. Use **Security → Report a vulnerability** on the GitHub repository (private vulnerability reporting). Include the steps to reproduce and the version or commit.

You can expect a first response within 5 working days. Once a fix is released, the report is credited in the changelog unless you prefer otherwise.

## Supported versions

Only the latest release receives security fixes.

## What AIControl does

- Passwords are hashed with bcrypt (cost 12); temporary passwords must be changed at the next login.
- Login is rate limited: 5 failed attempts per 15 minutes per email address.
- Sessions are HttpOnly, SameSite cookies; role checks happen on the server for every page and API call.
- Every API request body is validated; every change is written to an append-only audit log.
- A Content-Security-Policy restricts scripts, styles, fonts and connections to the app itself.
- The app makes no outgoing network requests and sends no telemetry.

## What you must do as an operator

- Replace `AUTH_SECRET` and `POSTGRES_PASSWORD` in `.env` before real use.
- Put a reverse proxy with HTTPS in front of the app when it is reachable outside your own network.
- Set `SEED_DEMO=false` for a real install, so the demo accounts are never created.
- Back up the `pgdata` volume.
