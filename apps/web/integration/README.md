# Integration tests

These run against the real local Supabase, unlike the unit tests in `test/`, which use an
in-memory fake. They check what only the real stack can:

- `isolation.test.ts`: two signed-in users, through the app's API and by hand-made requests.
  Neither can read, change, delete or link to the other's labels and entries, and signed-out
  visitors can read nothing. This is the database's row level security at work.
- `sign-in.test.ts`: the magic-link sign-in in Chromium. The login page sends a link, the
  local Supabase's test inbox (Mailpit) catches the email, and the browser follows it through
  `/auth/callback`. Also: a link works once, a made-up code is refused, signing out ends the
  session, and signing in again reaches the same account.

## Running them

```sh
pnpm exec supabase start   # from the repo root, once
pnpm test:integration      # from apps/web
```

The run builds the app into `.next-integration` and serves it on a free port, so a running
`next dev` is left alone. Each test makes its own users, with `it-…@example.com` addresses,
and deletes them at the end, even when it fails. It refuses to run against anything but a
local Supabase.

Chromium comes from `/usr/bin/chromium`; set `CHROMIUM_PATH` to use another.

Google sign-in isn't covered: it needs Google's own servers.
