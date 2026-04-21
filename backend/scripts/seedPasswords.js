/**
 * scripts/seedPasswords.js
 * Creates default supplier + customer accounts.
 * Run: node scripts/seedPasswords.js
 */
require("dotenv").config({ path: require("path").join(__dirname, "../.env") });

const bcrypt = require("bcryptjs");
const pool   = require("../db/pool");

const USERS = [
  { name: "Supplier Admin", email: "supplier@metalinv.com", password: "supplier123", role: "supplier" },
  { name: "Customer User",  email: "customer@metalinv.com", password: "customer123", role: "customer" },
];

async function seed() {
  console.log("Seeding users…");
  for (const u of USERS) {
    const hash = await bcrypt.hash(u.password, 10);
    try {
      await pool.execute(
        "INSERT INTO users (name, email, password, role) VALUES (?,?,?,?)",
        [u.name, u.email, hash, u.role]
      );
      console.log(`  ✓ Created: ${u.email} (${u.role})`);
    } catch (e) {
      if (e.code === "ER_DUP_ENTRY") {
        console.log(`  ~ Already exists: ${u.email} — updating password`);
        await pool.execute(
          "UPDATE users SET password=? WHERE email=?",
          [hash, u.email]
        );
      } else {
        throw e;
      }
    }
  }
  console.log("Done.");
  process.exit(0);
}

seed().catch(e => { console.error(e); process.exit(1); });
