import { NextResponse } from "next/server";

const cookieOpts = {
  httpOnly: true,
  secure:   process.env.NODE_ENV === "production",
  sameSite: "strict" as const,
  path:     "/",
  maxAge:   0,
};

export async function POST() {
  const res = NextResponse.json({ ok: true });
  res.cookies.set("att_admin_token", "", cookieOpts);
  res.cookies.set("att_emp_token",   "", cookieOpts);
  return res;
}
