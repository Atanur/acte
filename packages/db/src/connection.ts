import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

const connectionString = process.env.DATABASE_URL ?? "postgres://acte:acte_dev@localhost:5432/acte";

const client = postgres(connectionString);
export const db = drizzle(client, { schema });
