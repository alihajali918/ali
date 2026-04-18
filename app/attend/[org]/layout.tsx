import { db as prisma } from "@/app/lib/db";
import { notFound } from "next/navigation";

export default async function AttendLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ org: string }>;
}) {
  const { org } = await params;
  const organization = await prisma.attOrganization.findUnique({ where: { slug: org } });
  if (!organization) notFound();

  return (
    <div className="min-h-screen bg-[#0A0A0A]" dir="rtl">
      {children}
    </div>
  );
}
