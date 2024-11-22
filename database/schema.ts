import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const user = sqliteTable("user", {
  id: integer().primaryKey({ autoIncrement: true }),
  email: text().notNull().unique(),
  hashedPassword: text().notNull(),
});
