import type { Express } from "express";
import { createServer, type Server } from "http";
import { db } from "@db";
import { articles, storedImages, storedAudio } from "@db/schema";
import { eq, and, desc, sql } from "drizzle-orm";
import fetch from "node-fetch";
import fs from "fs/promises";
import path from "path";
import { randomUUID } from "crypto";
import express from 'express';
import multer from 'multer';
import { getAudioDurationInSeconds } from 'get-audio-duration';

// Configure multer for audio file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(process.cwd(), 'public', 'audio'));
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${randomUUID()}${ext}`);
  }
});

const upload = multer({ storage });

export function registerRoutes(app: Express): Server {
  // Serve static files from public directories
  app.use('/images', express.static(path.join(process.cwd(), 'public', 'images')));
  app.use('/audio', express.static(path.join(process.cwd(), 'public', 'audio')));

  // Get all published articles
  app.get("/api/articles", async (req, res) => {
    try {
      const results = await db
        .select()
        .from(articles)
        .where(eq(articles.isdraft, false))
        .orderBy(desc(articles.createdat));
      res.json(results);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch articles" });
    }
  });

  // Get user's draft articles
  app.get("/api/articles/drafts/:address", async (req, res) => {
    try {
      const results = await db
        .select()
        .from(articles)
        .where(and(
          eq(articles.isdraft, true),
          eq(articles.authoraddress, req.params.address)
        ))
        .orderBy(desc(articles.createdat));
      res.json(results);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch draft articles" });
    }
  });

  // Get user's published articles
  app.get("/api/articles/published/:address", async (req, res) => {
    try {
      const results = await db
        .select()
        .from(articles)
        .where(and(
          eq(articles.isdraft, false),
          eq(articles.authoraddress, req.params.address)
        ))
        .orderBy(desc(articles.createdat));
      res.json(results);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch published articles" });
    }
  });

  // Get single article
  app.get("/api/articles/:id", async (req, res) => {
    try {
      const result = await db
        .select()
        .from(articles)
        .where(eq(articles.id, parseInt(req.params.id)))
        .limit(1);

      if (result.length === 0) {
        return res.status(404).json({ message: "Article not found" });
      }

      res.json(result[0]);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch article" });
    }
  });

  // Create article
  app.post("/api/articles", async (req, res) => {
    try {
      // Validate required fields
      if (!req.body.authoraddress) {
        return res.status(400).json({ message: "Author address is required" });
      }

      const result = await db.insert(articles).values({
        title: req.body.title,
        content: req.body.content,
        description: req.body.description,
        summary: req.body.summary || req.body.description, // Use description as summary if not provided
        imageurl: req.body.imageurl,
        thumbnailurl: req.body.thumbnailurl,
        authoraddress: req.body.authoraddress.toLowerCase(),
        signature: req.body.signature,
        videourl: req.body.videourl || '',
        audiourl: req.body.audiourl || '',
        audioduration: req.body.audioduration || null,
        isdraft: req.body.isdraft ?? true,
        videoduration: req.body.videoduration ?? 15,
        hasbackgroundmusic: req.body.hasbackgroundmusic ?? true,
      }).returning();
      res.status(201).json(result[0]);
    } catch (error) {
      console.error('Article creation error:', error);
      res.status(500).json({ message: "Failed to create article" });
    }
  });

  // Update article
  app.put("/api/articles/:id", async (req, res) => {
    try {
      const result = await db
        .update(articles)
        .set({
          title: req.body.title,
          content: req.body.content,
          description: req.body.description,
        })
        .where(eq(articles.id, parseInt(req.params.id)))
        .returning();

      if (result.length === 0) {
        return res.status(404).json({ message: "Article not found" });
      }

      res.json(result[0]);
    } catch (error) {
      res.status(500).json({ message: "Failed to update article" });
    }
  });

  // Delete article
  app.delete("/api/articles/:id", async (req, res) => {
    try {
      const result = await db
        .delete(articles)
        .where(eq(articles.id, parseInt(req.params.id)))
        .returning();

      if (result.length === 0) {
        return res.status(404).json({ message: "Article not found" });
      }

      res.json({ message: "Article deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete article" });
    }
  });

  // Publish article
  app.post("/api/articles/:id/publish", async (req, res) => {
    try {
      // Require signature for publishing
      if (!req.body.signature) {
        return res.status(400).json({ message: "Signature is required for publishing" });
      }

      const result = await db
        .update(articles)
        .set({
          isdraft: false,
          signature: req.body.signature
        })
        .where(eq(articles.id, parseInt(req.params.id)))
        .returning();

      if (result.length === 0) {
        return res.status(404).json({ message: "Article not found" });
      }

      res.json(result[0]);
    } catch (error) {
      console.error('Publish error:', error);
      res.status(500).json({ message: "Failed to publish article" });
    }
  });
  // Get analytics data
  app.get("/api/analytics", async (req, res) => {
    try {
      // Get published articles
      const publishedArticles = await db
        .select()
        .from(articles)
        .where(eq(articles.isdraft, false))
        .orderBy(desc(articles.createdat))
        .limit(6);

      // Get total articles count
      const [{ count: totalArticles }] = await db
        .select({ count: sql<number>`count(*)` })
        .from(articles)
        .where(eq(articles.isdraft, false));

      // Get author statistics
      const authorStats = await db
        .select({
          address: articles.authoraddress,
          count: sql<number>`count(*)`
        })
        .from(articles)
        .where(eq(articles.isdraft, false))
        .groupBy(articles.authoraddress)
        .orderBy(desc(sql<number>`count(*)`))
        .limit(5);

      // Extract and count keywords from titles and descriptions
      const allArticles = await db
        .select({
          title: articles.title,
          description: articles.description
        })
        .from(articles)
        .where(eq(articles.isdraft, false));

      const keywordMap = new Map<string, number>();

      allArticles.forEach(article => {
        const words = `${article.title} ${article.description}`
          .toLowerCase()
          .split(/\W+/)
          .filter(word =>
            word.length > 3 &&
            !['the', 'and', 'for', 'that', 'with'].includes(word)
          );

        words.forEach(word => {
          keywordMap.set(word, (keywordMap.get(word) || 0) + 1);
        });
      });

      const topKeywords = Array.from(keywordMap.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10)
        .map(([keyword, count]) => ({ keyword, count }));

      res.json({
        articles: publishedArticles,
        totalArticles,
        authorStats,
        topKeywords,
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch analytics data" });
    }
  });

  // Add new route for saving images
  app.post("/api/images/save", async (req, res) => {
    try {
      const { imageUrl } = req.body;
      if (!imageUrl) {
        return res.status(400).json({ message: "Image URL is required" });
      }

      // Create images directory if it doesn't exist
      const imagesDir = path.join(process.cwd(), "public", "images");
      await fs.mkdir(imagesDir, { recursive: true });

      // Download the image
      const imageResponse = await fetch(imageUrl);
      if (!imageResponse.ok) {
        throw new Error("Failed to download image");
      }

      // Generate a unique filename
      const fileExt = "png";
      const filename = `${randomUUID()}.${fileExt}`;
      const filePath = path.join(imagesDir, filename);

      // Save the image
      const buffer = await imageResponse.buffer();
      await fs.writeFile(filePath, buffer);

      // Store image information in database
      const [storedImage] = await db.insert(storedImages).values({
        filename,
        originalurl: imageUrl,
        localpath: `/images/${filename}`,
      }).returning();

      res.json({ url: storedImage.localpath });
    } catch (error) {
      console.error("Error saving image:", error);
      res.status(500).json({ message: "Failed to save image" });
    }
  });

  // Get image by filename
  app.get("/api/images/:filename", async (req, res) => {
    try {
      const result = await db
        .select()
        .from(storedImages)
        .where(eq(storedImages.filename, req.params.filename))
        .limit(1);

      if (result.length === 0) {
        return res.status(404).json({ message: "Image not found" });
      }

      res.json(result[0]);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch image" });
    }
  });

  // Save audio file
  app.post("/api/audio/save", upload.single('audio'), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No audio file provided" });
      }

      const articleId = parseInt(req.body.articleId);
      if (isNaN(articleId)) {
        return res.status(400).json({ message: "Invalid article ID" });
      }

      // Get audio duration
      const duration = Math.ceil(await getAudioDurationInSeconds(req.file.path));

      // Store audio information in database
      const [storedAudioFile] = await db.insert(storedAudio).values({
        filename: req.file.filename,
        duration,
        localpath: `/audio/${req.file.filename}`,
        articleid: articleId,
      }).returning();

      // Update article with audio URL and duration
      await db.update(articles)
        .set({
          audiourl: storedAudioFile.localpath,
          audioduration: duration,
        })
        .where(eq(articles.id, articleId));

      res.json({
        url: storedAudioFile.localpath,
        duration: duration,
      });
    } catch (error) {
      console.error("Error saving audio:", error);
      res.status(500).json({ message: "Failed to save audio file" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}