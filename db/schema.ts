import { pgTable, text, serial, timestamp, varchar, integer, boolean, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";

export const articles = pgTable("articles", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  content: text("content").notNull(),
  description: text("description").notNull(),
  image: jsonb("image").notNull().default({
    data: '',
    type: 'image/jpeg'
  }),
  videoUrl: text("video_url").notNull().default(''),
  videoDuration: integer("video_duration").notNull().default(15),
  hasBackgroundMusic: boolean("has_background_music").notNull().default(true),
  authorAddress: varchar("author_address", { length: 42 }).notNull(),
  signature: text("signature").notNull(),
  isDraft: boolean("is_draft").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertArticleSchema = createInsertSchema(articles);
export const selectArticleSchema = createSelectSchema(articles);
export type InsertArticle = typeof articles.$inferInsert;
export type SelectArticle = typeof articles.$inferSelect;
