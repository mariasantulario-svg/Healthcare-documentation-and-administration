import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const terms = sqliteTable("terms", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  term: text("term").notNull(),
  definition: text("definition").notNull(),
  context: text("context").notNull(),
  spanish: text("spanish").notNull(),
  unitNumber: integer("unit_number").notNull(),
  unitTitle: text("unit_title").notNull(),
  category: text("category").notNull(),
  course: text("course").notNull(),
  imageUrl: text("image_url"),
});

export const insertTermSchema = createInsertSchema(terms).omit({ id: true });

export type Term = typeof terms.$inferSelect;
export type InsertTerm = z.infer<typeof insertTermSchema>;
