import type { ReactNode } from "react";
import Navbar from "../components/Navbar";
import { getSessionUser } from "../lib/auth";

export default async function PublicLayout({ children }: { children: ReactNode }) {
  const user = await getSessionUser();
  const navUser = user ? { name: user.name, role: user.role } : null;

  return (
    <>
      <Navbar initialUser={navUser} />
      {children}
    </>
  );
}
