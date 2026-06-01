# One-Time Secret — Send a Password Securely

> Reference implementation. Live: **https://induwara.lk/tools/one-time-secret**

A free **Privnote alternative**. Paste a password, API key, or private note,
set a timer, and get a self-destructing one-time link. The secret is
end-to-end encrypted in your browser; our server never sees it; and it dies
the moment it's read.

## How it works

1. Your browser generates a random AES-256 key with the Web Crypto API.
2. The key goes in the URL **fragment** (after `#`) — never transmitted to
   any server.
3. Your text is encrypted locally with that key before upload.
4. The recipient opens the link, their browser uses the key from the URL to
   decrypt locally, and a **destroy signal** is sent to permanently wipe the
   encrypted blob server-side.

Even if Google/police/whoever subpoenaed us, we couldn't read the secret —
we only ever stored ciphertext we have no key for.

## Versus Privnote / OneTimeSecret.com / PasswordPusher

Same core idea, three differences:

1. **No signup, no ads, no email collection.**
2. **All cryptography in YOUR browser** via the native Web Crypto API. Most
   alternatives encrypt server-side, which means their server theoretically
   has the key.
3. **Code is open** — this repo. Inspect the crypto, run it yourself, fork it.

## Architecture

This tool reuses the same backend as [secret-chat](https://github.com/IAshinsana/secret-chat)
— a session is created, one encrypted message is sent, the recipient reads
and destroys. No new infrastructure needed.

## Key files

- `src/composer.tsx` — Creator UI: paste text → encrypt → get link
- `src/viewer.tsx` — Recipient UI: open link → decrypt → display → destroy

## Use it

Live: [induwara.lk/tools/one-time-secret](https://induwara.lk/tools/one-time-secret)

## Use cases

- Share a Wi-Fi password with a guest
- Hand off an API key, SSH key, or DB password to a teammate
- Send a one-time login to a colleague when you can't use a password manager
- Replace pasting secrets in Slack/email/tickets where they live forever

## Reuse

MIT licensed.
