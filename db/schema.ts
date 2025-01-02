import { pgTable, text, serial, timestamp, varchar, integer, boolean, index } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";

export const articles = pgTable("articles", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  content: text("content").notNull(),
  description: text("description").notNull(),
  summary: text("summary"),  // Made optional
  imageurl: text("imageurl").notNull(),
  thumbnailurl: text("thumbnailurl"),
  videourl: text("videourl").notNull().default(''),
  videoduration: integer("videoduration").notNull().default(15),
  hasbackgroundmusic: boolean("hasbackgroundmusic").notNull().default(true),
  audiourl: text("audiourl"),  // New field for storing audio URL
  audioduration: integer("audioduration"),  // New field for audio duration
  authoraddress: varchar("authoraddress", { length: 42 }).notNull(),
  signature: text("signature").notNull(),
  sourcelinks: text("sourcelinks"),  // New field for storing source links
  isdraft: boolean("isdraft").notNull().default(true),
  createdat: timestamp("createdat").defaultNow().notNull(),
  updatedat: timestamp("updatedat").defaultNow().notNull(),
}, (table) => ({
  authorIndex: index("author_idx").on(table.authoraddress),
  draftIndex: index("draft_idx").on(table.isdraft),
  createdAtIndex: index("created_at_idx").on(table.createdat),
  titleIndex: index("title_idx").on(table.title),
}));

// Create stored images table with relations
export const storedImages = pgTable("storedimages", {
  id: serial("id").primaryKey(),
  filename: text("filename").notNull().unique(),
  originalurl: text("originalurl").notNull(),
  localpath: text("localpath").notNull(),
  articleid: integer("articleid").references(() => articles.id, { onDelete: 'cascade' }),
  createdat: timestamp("createdat").defaultNow().notNull(),
}, (table) => ({
  filenameIndex: index("filename_idx").on(table.filename),
  articleIndex: index("article_idx").on(table.articleid),
}));

// Create stored audio table with relations
export const storedAudio = pgTable("storedaudio", {
  id: serial("id").primaryKey(),
  filename: text("filename").notNull().unique(),
  duration: integer("duration").notNull(),
  localpath: text("localpath").notNull(),
  articleid: integer("articleid").references(() => articles.id, { onDelete: 'cascade' }),
  createdat: timestamp("createdat").defaultNow().notNull(),
}, (table) => ({
  articleIdIndex: index("article_id_idx").on(table.articleid),
  filenameIndex: index("audio_filename_idx").on(table.filename),
}));

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