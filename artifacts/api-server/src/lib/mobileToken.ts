import crypto from "crypto";

const TOKEN_TTL_MS = 1000 * 60 * 60 * 24 * 30; // 30 days

function secret(): string {
  const s = process.env.SESSION_SECRET;
  if (!s) throw new Error("SESSION_SECRET is required");
  return s;
}

function sign(payload: string): string {
  return crypto.createHmac("sha256", secret()).update(payload).digest("base64url");
}

/** Create a signed bearer token for mobile clients: `<userId>.<expiryMs>.<hmac>` */
export function createMobileToken(userId: number): string {
  const payload = `${userId}.${Date.now() + TOKEN_TTL_MS}`;
  return `${payload}.${sign(payload)}`;
}

/** Verify a mobile bearer token. Returns the userId or null if invalid/expired. */
export function verifyMobileToken(token: string): number | null {
  const parts = token.split(".");
  if (parts.length !== 3) return null;
  const [uidStr, expStr, sig] = parts;
  const payload = `${uidStr}.${expStr}`;
  const expected = sign(payload);
  const a = Buffer.from(sig);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) return null;
  const exp = Number(expStr);
  if (!Number.isFinite(exp) || exp < Date.now()) return null;
  const uid = Number(uidStr);
  if (!Number.isInteger(uid) || uid <= 0) return null;
  return uid;
}
