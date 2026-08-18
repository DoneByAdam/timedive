---
name: Mobile auth bridge
description: How the Expo app authenticates against the cookie-session API server
---

The API server uses express-session cookies, which don't survive Expo's cross-origin setup (web preview especially). Instead of migrating to token auth, login/register additionally return a signed HMAC bearer token (`lib/mobileToken.ts`, signed with SESSION_SECRET), and an app-level middleware hydrates `req.session.userId` from a valid `Authorization: Bearer` header.

**Why:** cookies work natively in Expo Go but fail in the cross-origin web preview with SameSite=lax in dev; the bearer bridge works everywhere without touching any route handler.

**How to apply:** mobile clients store the token via AsyncStorage (`lib/session.ts`) and `setAuthTokenGetter` from `@workspace/api-client-react`. New API routes need no changes — they keep reading `req.session.userId`.
