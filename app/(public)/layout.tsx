import type { ReactNode } from "react";
import Navbar from "../components/Navbar";

export default function PublicLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <Navbar initialUser={null} />
      {children}
    </>
  );
}
