import { NextRequest, NextResponse } from "next/server";
import { prisma } from "../../../lib/prisma";

export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get("token");
  if (!token)
    return NextResponse.redirect(new URL("/login?error=invalid", req.url));

  const user = await prisma.user.findFirst({
    where: { verifyToken: token, verifyExpires: { gt: new Date() } },
  });

  if (!user)
    return NextResponse.redirect(new URL("/login?error=expired", req.url));

  await prisma.user.update({
    where: { id: user.id },
    data: { emailVerified: true, verifyToken: null, verifyExpires: null },
  });

  return NextResponse.redirect(new URL("/login?verified=1", req.url));
}
