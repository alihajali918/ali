import { db as prisma } from "./db";
import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import bcrypt from "bcryptjs";

const ATT_SECRET = new TextEncoder().encode(
  process.env.ATT_JWT_SECRET ?? process.env.NEXTAUTH_SECRET ?? "att-fallback-secret"
);

// ── JWT helpers ──────────────────────────────────────────
export async function signAttToken(payload: Record<string, unknown>, expiresIn = "12h") {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(expiresIn)
    .sign(ATT_SECRET);
}

export async function verifyAttToken(token: string) {
  try {
    const { payload } = await jwtVerify(token, ATT_SECRET);
    return payload as Record<string, unknown>;
  } catch {
    return null;
  }
}

// ── Session helpers ──────────────────────────────────────
export async function getAttSession(cookieName = "att_token") {
  const store = await cookies();
  const token = store.get(cookieName)?.value;
  if (!token) return null;
  return verifyAttToken(token);
}

// ── Org helpers ──────────────────────────────────────────
export async function getOrg(slug: string) {
  return prisma.attOrganization.findUnique({ where: { slug } });
}

export async function requireOrg(slug: string) {
  const org = await getOrg(slug);
  if (!org) throw new Error("Organization not found");
  return org;
}

// ── Password helpers ─────────────────────────────────────
export const hashPassword   = (p: string) => bcrypt.hash(p, 12);
export const verifyPassword = (p: string, h: string) => bcrypt.compare(p, h);

// ── Overtime / Late calculation ──────────────────────────
export function calcMinutes(checkIn: Date, checkOut: Date, shift: { startTime: string; endTime: string }) {
  const [sh, sm] = shift.startTime.split(":").map(Number);
  const [eh, em] = shift.endTime.split(":").map(Number);

  const shiftStart = new Date(checkIn);
  shiftStart.setHours(sh, sm, 0, 0);

  const shiftEnd = new Date(checkIn);
  shiftEnd.setHours(eh, em, 0, 0);

  const lateMinutes     = Math.max(0, Math.floor((checkIn.getTime()  - shiftStart.getTime()) / 60000));
  const overtimeMinutes = Math.max(0, Math.floor((checkOut.getTime() - shiftEnd.getTime())   / 60000));

  return { lateMinutes, overtimeMinutes };
}

// ── TOTP verification with window (manual implementation) ─
import { createHmac } from "crypto";

function decodeBase32(s: string): Buffer {
  const alpha = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";
  s = s.toUpperCase().replace(/=+$/, "");
  let bits = 0, val = 0;
  const out: number[] = [];
  for (const c of s) {
    const idx = alpha.indexOf(c);
    if (idx === -1) continue;
    val = (val << 5) | idx;
    bits += 5;
    if (bits >= 8) { out.push((val >>> (bits - 8)) & 0xff); bits -= 8; }
  }
  return Buffer.from(out);
}

function hotpToken(secret: string, counter: number): string {
  const key = decodeBase32(secret);
  const buf = Buffer.alloc(8);
  buf.writeUInt32BE(Math.floor(counter / 0x100000000), 0);
  buf.writeUInt32BE(counter >>> 0, 4);
  const mac    = createHmac("sha1", key).update(buf).digest();
  const offset = mac[mac.length - 1] & 0xf;
  const code   = ((mac[offset] & 0x7f) << 24) | (mac[offset+1] << 16) | (mac[offset+2] << 8) | mac[offset+3];
  return (code % 1_000_000).toString().padStart(6, "0");
}

export function verifyTOTP(secret: string, token: string, windowSteps = 2): boolean {
  const step    = 30;
  const counter = Math.floor(Date.now() / 1000 / step);
  for (let i = -windowSteps; i <= 0; i++) {
    if (hotpToken(secret, counter + i) === String(token)) return true;
  }
  return false;
}

// ── RP ID for WebAuthn (subdomain-aware) ─────────────────
export function getRpId(host: string) {
  // company.alihajali.com → alihajali.com
  // localhost:3000        → localhost
  const h = host.split(":")[0];
  const parts = h.split(".");
  return parts.length > 2 ? parts.slice(-2).join(".") : h;
}
