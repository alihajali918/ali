import { NextResponse } from "next/server";

export async function POST() {
  const res = NextResponse.json({ ok: true });
  res.cookies.set("att_admin_token", "", { maxAge: 0, path: "/" });
  res.cookies.set("att_emp_token",   "", { maxAge: 0, path: "/" });
  return res;
}
