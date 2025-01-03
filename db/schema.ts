import { pgTable, text, serial, timestamp, varchar, integer, boolean, index } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";

export const articles = pgTable("articles", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  content: text("content").notNull(),
  description: text("description").notNull(),
  summary: text("summary"),
  imageurl: text("imageurl"),
  audiourl: text("audiourl"),
  audioduration: integer("audioduration"),
  authoraddress: text("authoraddress").notNull(),
  signature: text("signature").default(''),
  isdraft: boolean("isdraft").default(true),
  sourcelinks: text("sourcelinks"),
  createdat: timestamp("created_at").defaultNow().notNull(),
  updatedat: timestamp("updated_at").defaultNow().notNull(),
});

// Create stored images table with relations
export const storedImages = pgTable("storedimages", {
  id: serial("id").primaryKey(),
  filename: text("filename").notNull().unique(),
  originalurl: text("originalurl").notNull(),
  localpath: text("localpath").notNull(),
  articleid: integer("articleid").references(() => articles.id, { onDelete: 'cascade' }),
  createdat: timestamp("createdat").defaultNow().notNull(),
});

// Create stored audio table with relations
export const storedAudio = pgTable("storedaudio", {
  id: serial("id").primaryKey(),
  filename: text("filename").notNull().unique(),
  duration: integer("duration").notNull(),
  localpath: text("localpath").notNull(),
  articleid: integer("articleid").references(() => articles.id, { onDelete: 'cascade' }),
  createdat: timestamp("createdat").defaultNow().notNull(),
});

// Define relations
export const articlesRelations = relations(articles, ({ many }) => ({
  images: many(storedImages),
  audio: many(storedAudio),
}));

export const storedImagesRelations = relations(storedImages, ({ one }) => ({
  article: one(articles, {
    fields: [storedImages.articleid],
    references: [articles.id],
  }),
}));

export const storedAudioRelations = relations(storedAudio, ({ one }) => ({
  article: one(articles, {
    fields: [storedAudio.articleid],
    references: [articles.id],
  }),
}));

export const insertArticleSchema = createInsertSchema(articles);
export const selectArticleSchema = createSelectSchema(articles);
export type InsertArticle = typeof articles.$inferInsert;
export type SelectArticle = typeof articles.$inferSelect;

export const insertStoredImageSchema = createInsertSchema(storedImages);
export const selectStoredImageSchema = createSelectSchema(storedImages);
export type InsertStoredImage = typeof storedImages.$inferInsert;
export type SelectStoredImage = typeof storedImages.$inferSelect;

export const insertStoredAudioSchema = createInsertSchema(storedAudio);
export const selectStoredAudioSchema = createSelectSchema(storedAudio);
export type InsertStoredAudio = typeof storedAudio.$inferInsert;
export type SelectStoredAudio = typeof storedAudio.$inferSelect;