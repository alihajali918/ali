// Usage: node scripts/create-club-admin.js <email> <password> [name]
const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

async function main() {
  const [, , email, password, name] = process.argv;
  if (!email || !password) {
    console.error("Usage: node scripts/create-club-admin.js <email> <password> [name]");
    process.exit(1);
  }

  const db = new PrismaClient();
  const hash = await bcrypt.hash(password, 10);

  const user = await db.user.upsert({
    where: { email },
    update: { password: hash, role: "club_admin" },
    create: { email, password: hash, role: "club_admin", name: name || "Club Admin" },
  });

  console.log(`✓ club_admin جاهز: ${user.email} (id ${user.id})`);
  await db.$disconnect();
}

main().catch(async (e) => {
  console.error(e);
  process.exit(1);
});
