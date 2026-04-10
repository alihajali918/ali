import { cookies } from "next/headers";
import { jwtVerify } from "jose";
import { prisma } from "./prisma";

const SECRET = new TextEncoder().encode(
  process.env.NEXTAUTH_SECRET || "ali-secret-2026"
);

export interface SessionUser {
  id: number;
  name: string;
  email: string;
  role: string;
  emailVerified: boolean;
}

export async function getSessionUser(): Promise<SessionUser | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("user_token")?.value;
    if (!token) return null;
    const { payload } = await jwtVerify(token, SECRET);
    const user = await prisma.user.findUnique({
      where: { id: payload.id as number },
      select: { id: true, name: true, email: true, role: true, emailVerified: true },
    });
    return user;
  } catch {
    return null;
  }
}
