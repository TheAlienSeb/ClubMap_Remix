import { randomBytes, scrypt as scryptCallback } from "node:crypto";
import { promisify } from "node:util";
import postgres from "postgres";
import "dotenv/config";

if (process.env.NODE_ENV === "production") {
  throw new Error("Test accounts cannot be seeded in production.");
}

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is required.");
}

const scrypt = promisify(scryptCallback);
const sql = postgres(process.env.DATABASE_URL, { max: 1, prepare: false });

async function hashPassword(password) {
  const salt = randomBytes(16).toString("hex");
  const derived = await scrypt(password, salt, 64);
  return `scrypt:${salt}:${derived.toString("hex")}`;
}

const accounts = [
  {
    firstName: "ClubMap",
    lastName: "Admin",
    email: "admin@clubmap.test",
    password: "Admin123!",
    role: "admin",
  },
  {
    firstName: "Test",
    lastName: "Student",
    email: "student@clubmap.test",
    password: "Student123!",
    role: "user",
  },
];

try {
  for (const account of accounts) {
    const passwordHash = await hashPassword(account.password);
    const [user] = await sql`
      INSERT INTO users
        (first_name, last_name, email, password_hash, role, university_verified, latitude, longitude)
      VALUES
        (${account.firstName}, ${account.lastName}, ${account.email}, ${passwordHash}, ${account.role}, true, 0, 0)
      ON CONFLICT (email) DO UPDATE SET
        first_name = EXCLUDED.first_name,
        last_name = EXCLUDED.last_name,
        password_hash = EXCLUDED.password_hash,
        role = EXCLUDED.role,
        university_verified = true
      RETURNING id
    `;

    if (account.role === "admin") {
      await sql`
        INSERT INTO organizers (user_id, description, images, website)
        VALUES (${user.id}, 'ClubMap test administrator', '', '')
        ON CONFLICT (user_id) DO NOTHING
      `;
    }
  }

  console.log("Test accounts seeded:");
  console.log("  Admin:   admin@clubmap.test / Admin123!");
  console.log("  Student: student@clubmap.test / Student123!");
} finally {
  await sql.end();
}
