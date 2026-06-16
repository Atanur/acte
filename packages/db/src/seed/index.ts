import { db } from "../connection";
import { users } from "../schema/users";

async function seed() {
  console.log("🌱 Seeding database...");

  await db
    .insert(users)
    .values([
      { email: "admin@acte.app", name: "Admin" },
      { email: "user@acte.app", name: "Test User" },
    ])
    .onConflictDoNothing();

  console.log("✅ Seed complete");
  process.exit(0);
}

seed().catch((err) => {
  console.error("❌ Seed failed:", err);
  process.exit(1);
});
