import { pgTable, text, serial, timestamp, varchar, integer, boolean } from "drizzle-orm/pg-core";
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
  isdraft: boolean("isdraft").notNull().default(true),
  createdat: timestamp("createdat").defaultNow().notNull(),
  updatedat: timestamp("updatedat").defaultNow().notNull(),
});

// Create stored images table
export const storedImages = pgTable("storedimages", {
  id: serial("id").primaryKey(),
  filename: text("filename").notNull().unique(),
  originalurl: text("originalurl").notNull(),
  localpath: text("localpath").notNull(),
  createdat: timestamp("createdat").defaultNow().notNull(),
});

// Create stored audio table
export const storedAudio = pgTable("storedaudio", {
  id: serial("id").primaryKey(),
  filename: text("filename").notNull().unique(),
  duration: integer("duration").notNull(),
  localpath: text("localpath").notNull(),
  articleid: integer("articleid").notNull(),
  createdat: timestamp("createdat").defaultNow().notNull(),
});

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