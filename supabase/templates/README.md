# Supabase Auth Email Templates

This folder stores email templates for the Creative Wings project. Magic link and
reset password templates are copy-pasteable Supabase Auth templates; the verify
email template is also loaded directly by the Next.js app-level Resend sender.

## Verify Email

Email verification is app-level and non-blocking. Signup creates a Supabase Auth user
with `email_confirm: true`, then the Next.js app stores a hashed one-time token in
`public.email_verification_tokens` and sends the verification email through Resend.
The user can sign in and complete onboarding while `profiles.email_verified_at` is
empty.

Required app configuration:

```text
RESEND_API_KEY=...
RESEND_FROM_EMAIL="Creative Wings <hello@creativewings.my>"
NEXT_PUBLIC_SITE_URL=https://creativewings.my
```

The app sends links shaped like:

```text
NEXT_PUBLIC_SITE_URL/auth/callback?type=email_verification&token=...
```

Successful token verification updates `profiles.email_verified_at`, deletes the
stored token row, and redirects to `/verify-email/success`. Expired or invalid links
route to `/verify-email/expired`.

Supabase Dashboard Auth setting:

- Disable blocking **Confirm email** for the email/password provider. The app handles
  the user-facing verification reminder and status itself.
- The checked-in `verify-email.html` is the live Resend body for the app-level
  verification sender in `src/lib/email-verification.ts`. The Supabase **Confirm
  Signup** template is no longer part of the signup flow.

The app-level sender replaces these placeholders before passing HTML to Resend:

```text
{{ .ConfirmationURL }} = NEXT_PUBLIC_SITE_URL/auth/callback?type=email_verification&token=...
{{ .Email }}           = recipient email address
{{ .SiteName }}        = NEXT_PUBLIC_SITE_NAME, or "Creative Wings"
{{ .SiteURL }}         = NEXT_PUBLIC_SITE_URL, or http://localhost:3000
{{ .LinkExpiryHours }} = app token TTL in hours
```

`next.config.mjs` explicitly includes `supabase/templates/verify-email.html` in
Next.js output file tracing so production server runtimes can read it from disk.
If the file is still unavailable at runtime, the app falls back to a compact
verification email instead of failing the send.

## Magic Link

Use `magic-link.html` for the Supabase Auth **Magic Link** / OTP sign-in template.

Dashboard steps:

1. Open Supabase Dashboard.
2. Go to **Authentication > Emails > Templates**.
3. Select **Magic Link**. In some Supabase UI versions this appears as **Magic Link / OTP**.
4. Set the subject to:

   ```text
   Your Creative Wings magic link - sign in in one tap.
   ```

5. Paste the full contents of `supabase/templates/magic-link.html` into the template body.
6. Save the template.

The app calls `supabase.auth.signInWithOtp({ email, options: { emailRedirectTo } })` with:

```text
{{ .RedirectTo }} = NEXT_PUBLIC_SITE_URL/auth/callback?next=/dashboard
```

Keep using `{{ .ConfirmationURL }}` for the button and fallback link. Supabase builds the one-time magic link and preserves the configured redirect back through `/auth/callback`.

Also confirm these Supabase Auth URL settings:

- **Site URL** should be the deployed app URL, for example `https://creativewings.my`.
- **Redirect URLs** should include the deployed callback route, for example `https://creativewings.my/auth/callback`.
- For local testing, include `http://localhost:3000/auth/callback`.
- If the email says the link expires in 15 minutes, set the Supabase Auth OTP expiry to match, or update the copy in `magic-link.html`.

## Reset Password

Use `reset-password.html` for the Supabase Auth **Reset Password** / recovery template.

Dashboard steps:

1. Open Supabase Dashboard.
2. Go to **Authentication > Emails > Templates**.
3. Select **Reset Password**.
4. Set the subject to:

   ```text
   Reset your Creative Wings password - expires in 1 hour.
   ```

5. Paste the full contents of `supabase/templates/reset-password.html` into the template body.
6. Save the template.

The app calls `supabase.auth.resetPasswordForEmail(email, { redirectTo })` with:

```text
{{ .RedirectTo }} = NEXT_PUBLIC_SITE_URL/reset-password
```

Keep using `{{ .ConfirmationURL }}` for the button and fallback link. Supabase builds that recovery URL and preserves the configured redirect back to `/reset-password`.

Also confirm these Supabase Auth URL settings:

- **Site URL** should be the deployed app URL, for example `https://creativewings.my`.
- **Redirect URLs** should include the deployed reset route, for example `https://creativewings.my/reset-password`.
- For local testing, include `http://localhost:3000/reset-password`.

## Welcome Email

Use `welcome.html` as the Creative Wings transactional welcome email after a user successfully verifies their email.

This is not a built-in Supabase Auth template in the current repo. There is currently no checked-in Resend/server email helper or Edge Function, so `welcome.html` is a ready-to-wire template and is not automatically sent by the Next.js app.

Recommended trigger paths:

1. Add a trusted server-side job that detects the first transition to `profiles.email_verified_at is not null` and sends `welcome.html` through the approved transactional mail provider.
2. Or send it from the app-level verification callback after the profile update succeeds.
3. Store delivery state in a database column/table before wiring retries, so the welcome email is not sent repeatedly.

Suggested subject:

```text
Welcome to Creative Wings - pick your first campaign.
```

Template placeholders to replace in the sender:

```text
{{firstName}}   = user's preferred or profile name
{{verifiedAt}}  = localized verification date
{{campaignsUrl}} = deployed app URL + /campaigns
```

Notes:

- Supabase Auth templates are separate from any app-level Resend API emails. Resend may deliver the message through SMTP, but Supabase still renders this template.
- Supabase Auth templates expose `{{ .ConfirmationURL }}`, `{{ .Email }}`, `{{ .SiteURL }}`, `{{ .RedirectTo }}`, `{{ .Token }}`, `{{ .TokenHash }}`, and `{{ .Data }}`. These templates use `{{ .ConfirmationURL }}` because the current app flows rely on Supabase's standard one-time links.
- Supabase does not expose request IP, browser, or location variables to the template, so the frame's metadata block is mapped to account email, reset destination, and sender.
- Disable click/open tracking in the SMTP provider for Auth emails if it rewrites links. Supabase warns that rewritten or prefetched Auth links can consume or break one-time Auth URLs.
