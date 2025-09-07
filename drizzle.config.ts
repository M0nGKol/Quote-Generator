import { defineConfig } from "drizzle-kit";

export default defineConfig({
  schema: "./src/db/schema.ts", // where your tables live
  out: "./drizzle",             // migrations output folder
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL!, // use env variable
  },
});
