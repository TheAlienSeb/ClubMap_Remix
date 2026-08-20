import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

const localMode =
  process.env.CLUBMAP_LOCAL_MODE === "true" ||
  (process.env.NODE_ENV === "development" &&
    process.env.CLUBMAP_LOCAL_MODE !== "false");
if (!process.env.DATABASE_URL && !localMode)
  throw new Error("DATABASE_URL is required");
const client = postgres(
  process.env.DATABASE_URL || "postgres://localhost/clubmap",
  { max: 5, prepare: false },
);
const db = drizzle(client, { schema });
export default db;
