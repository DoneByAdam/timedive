import path from "node:path";
import { fileURLToPath } from "node:url";
import { existsSync } from "node:fs";
import express, { type Express } from "express";
import cors from "cors";
import pinoHttp from "pino-http";
import session from "express-session";
import router from "./routes";
import { logger } from "./lib/logger";
import { verifyMobileToken } from "./lib/mobileToken";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const app: Express = express();
// Trust the platform's reverse proxy (Railway) so secure cookies and X-Forwarded-* headers work correctly
app.set("trust proxy", 1);

app.use(
  pinoHttp({
    logger,
    serializers: {
      req(req) {
        return {
          id: req.id,
          method: req.method,
          url: req.url?.split("?")[0],
        };
      },
      res(res) {
        return {
          statusCode: res.statusCode,
        };
      },
    },
  }),
);
app.use(cors({ origin: true, credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const sessionSecret = process.env.SESSION_SECRET;
if (!sessionSecret) {
  throw new Error("SESSION_SECRET environment variable is required");
}
app.use(
  session({
    secret: sessionSecret,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      maxAge: 1000 * 60 * 60 * 24 * 30, // 30 days
    },
  })
);

// Mobile clients authenticate with a signed bearer token instead of cookies.
// When a valid token is present and no session exists yet, hydrate the session.
app.use((req, _res, next) => {
  if (!req.session?.userId) {
    const auth = req.headers.authorization;
    if (auth?.startsWith("Bearer ")) {
      const userId = verifyMobileToken(auth.slice(7));
      if (userId) req.session!.userId = userId;
    }
  }
  next();
});

app.use("/api", router);

// Serve the built frontend (artifacts/timedive/dist/public) when it's present
// alongside this bundle, so a single service can host both API and web app.
const clientDist = path.resolve(__dirname, "../../timedive/dist/public");
if (existsSync(clientDist)) {
  app.use(express.static(clientDist));
  app.get(/^(?!\/api).*/, (_req, res) => {
    res.sendFile(path.join(clientDist, "index.html"));
  });
}

export default app;
