---
name: Auth cookie fix — Vite proxy required
description: Session cookies fail silently in dev when frontend and API run on different ports without a Vite proxy.
---

# Auth cookie fix — Vite proxy required

## The rule
The Vite dev server MUST proxy `/api` to `http://localhost:8080` (the Express API port). Without this, the browser treats requests as cross-origin, and session cookies set by the API server are not sent on subsequent requests — causing every POST to login/register to succeed (200/201) but GET /api/auth/me to immediately return 401.

**Why:** In Replit dev, the Vite server runs on one port (e.g. 19321) and the API on another (8080). These are different origins. Cookies set by one origin are not sent to the other unless `credentials: 'include'` is used AND CORS allows it. The simpler fix is a Vite dev proxy so the browser sees a single origin.

**How to apply:** In `vite.config.ts`, add:
```typescript
server: {
  proxy: {
    '/api': {
      target: 'http://localhost:8080',
      changeOrigin: false,
    },
  },
}
```

Also add `credentials: "include"` to the `customFetch` call in `lib/api-client-react/src/custom-fetch.ts` as belt-and-suspenders.

In production, also set `app.set("trust proxy", 1)` and `sameSite: "none"` on the session cookie (Replit's proxy terminates SSL, so secure cookies need trust proxy enabled).
