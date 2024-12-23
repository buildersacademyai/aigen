import { pgTable, text, serial, timestamp, varchar, integer, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";

export const articles = pgTable("articles", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  content: text("content").notNull(),
  description: text("description").notNull(),
  imageurl: text("imageurl").notNull(),
  videourl: text("videourl").notNull().default(''),
  videoduration: integer("videoduration").notNull().default(15),
  hasbackgroundmusic: boolean("hasbackgroundmusic").notNull().default(true),
  authoraddress: varchar("authoraddress", { length: 42 }).notNull(),
  signature: text("signature").notNull(),
  isdraft: boolean("isdraft").notNull().default(true),
  createdat: timestamp("createdat").defaultNow().notNull(),
});

export const insertArticleSchema = createInsertSchema(articles);
export const selectArticleSchema = createSelectSchema(articles);
export type InsertArticle = typeof articles.$inferInsert;
export type SelectArticle = typeof articles.$inferSelect;
