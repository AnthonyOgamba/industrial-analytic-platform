import { createHash, randomUUID } from "node:crypto";
import { jwtVerify, SignJWT } from "jose";
import { AUTH_MAX_AGE_SECONDS } from "./constants";

const encoder = new TextEncoder();

function secret() {
  const value = process.env.JWT_SIGNING_KEY;
  if (!value && process.env.NODE_ENV === "production") {
    throw new Error("JWT_SIGNING_KEY is required in production.");
  }
  return encoder.encode(value || "development-only-divu-signing-key-change-me");
}

export type SessionClaims = {
  uid: number;
  username: string;
  email: string;
  role: string;
  isAdmin: boolean;
  jti: string;
};

export async function issueToken(user: Omit<SessionClaims, "jti">) {
  const jti = randomUUID();
  const token = await new SignJWT(user)
    .setProtectedHeader({ alg: "HS256" })
    .setJti(jti)
    .setSubject(String(user.uid))
    .setIssuer(process.env.JWT_ISSUER || "divu-analytics")
    .setAudience(process.env.JWT_AUDIENCE || "divu-web")
    .setIssuedAt()
    .setExpirationTime(`${AUTH_MAX_AGE_SECONDS}s`)
    .sign(secret());
  return { token, jti };
}

export async function verifyToken(token: string) {
  const result = await jwtVerify(token, secret(), {
    issuer: process.env.JWT_ISSUER || "divu-analytics",
    audience: process.env.JWT_AUDIENCE || "divu-web",
  });
  return result.payload as unknown as SessionClaims;
}

export const hashSecret = (value: string) => createHash("sha256").update(value).digest("hex");
