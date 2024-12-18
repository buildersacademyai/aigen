import type { Express } from "express";
import { createServer, type Server } from "http";
import { db } from "@db";
import { articles } from "@db/schema";
import { eq } from "drizzle-orm";

export function registerRoutes(app: Express): Server {
  // Get all published articles
  app.get("/api/articles", async (req, res) => {
    try {
      const results = await db
        .select()
        .from(articles)
        .where(eq(articles.isDraft, false))
        .orderBy(articles.createdAt);
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
          eq(articles.isDraft, true),
          eq(articles.authorAddress, req.params.address)
        ))
        .orderBy(articles.createdAt);
      res.json(results);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch draft articles" });
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
      const result = await db.insert(articles).values({
        title: req.body.title,
        content: req.body.content,
        description: req.body.description,
        imageUrl: req.body.imageUrl,
        authorAddress: req.body.authorAddress,
        signature: req.body.signature,
        videoUrl: req.body.videoUrl || ''
      }).returning();
      res.status(201).json(result[0]);
    } catch (error) {
      console.error('Article creation error:', error);
      res.status(500).json({ message: "Failed to create article" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
