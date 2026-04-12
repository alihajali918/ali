import type { ReactNode } from "react";
import Navbar from "../components/Navbar";
import { getSessionUser } from "../lib/auth";

export default async function ToolsLayout({ children }: { children: ReactNode }) {
  const session = await getSessionUser();
  const initialUser = session ? { name: session.name, role: session.role } : null;

  return (
    <>
      <Navbar initialUser={initialUser} />
      {children}
    </>
  );
}
