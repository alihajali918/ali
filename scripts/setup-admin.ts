// سكريبت إنشاء الأدمن — شغّله مرة واحدة على السيرفر
// npx tsx scripts/setup-admin.ts

import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient({ log: ["error"] });

async function main() {
  const existing = await prisma.user.count();
  if (existing > 0) {
    console.log("✓ المستخدمون موجودون بالفعل");
    return;
  }

  const password = "Admin@2026!";  // ← غيّرها بعد أول تسجيل دخول
  const hashed   = await bcrypt.hash(password, 12);

  const user = await prisma.user.create({
    data: {
      name:     "Ali Hajali",
      email:    "admin@alihajali.com",
      password: hashed,
      role:     "admin",
    },
  });

  console.log("✓ تم إنشاء المستخدم:", user.email);
  console.log("  كلمة المرور:", password);
  console.log("  غيّر كلمة المرور فوراً!");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
