import { cookies } from "next/headers";
import { jwtVerify } from "jose";

const SECRET = new TextEncoder().encode(
  process.env.NEXTAUTH_SECRET || "ali-secret-2026"
);

export interface SessionUser {
  id: number;
  name: string;
  email: string;
  role: string;
}

// Reads user from JWT only — zero DB queries
export async function getSessionUser(): Promise<SessionUser | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("user_token")?.value;
    if (!token) return null;
    const { payload } = await jwtVerify(token, SECRET);
    if (!payload.id || !payload.name || !payload.role) return null;
    return {
      id:    payload.id   as number,
      name:  payload.name as string,
      email: payload.email as string,
      role:  payload.role  as string,
    };
  } catch {
    return null;
  }
}
