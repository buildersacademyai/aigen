import type { Express } from "express";
import { createServer, type Server } from "http";
import { db } from "@db";
import { articles } from "@db/schema";
import { eq, and } from "drizzle-orm";

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

  // Get user's published articles
  app.get("/api/articles/published/:address", async (req, res) => {
    try {
      const results = await db
        .select()
        .from(articles)
        .where(and(
          eq(articles.isDraft, false),
          eq(articles.authorAddress, req.params.address)
        ))
        .orderBy(articles.createdAt);
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
      const result = await db.insert(articles).values({
        title: req.body.title,
        content: req.body.content,
        description: req.body.description,
        imageUrl: req.body.imageUrl,
        authorAddress: req.body.authorAddress,
        signature: req.body.signature,
        videoUrl: req.body.videoUrl || '',
        isDraft: req.body.isDraft ?? true
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
          isDraft: false,
          signature: req.body.signature 
        })
        .where(eq(articles.id, parseInt(req.params.id)))
        .returning();

      if (result.length === 0) {
        return res.status(404).json({ message: "Article not found" });
      }

      res.json(result[0]);
    } catch (error) {
      res.status(500).json({ message: "Failed to publish article" });
    }
  });

  // Get analytics data
  app.get("/api/articles/analytics", async (req, res) => {
    try {
      console.log('Starting analytics query...');
      
      // Simplified query to test database connection
      const results = await db.query.articles.findMany({
        columns: {
          id: true,
          title: true,
          description: true,
          authorAddress: true,
          createdAt: true,
          isDraft: true,
        },
        orderBy: (articles, { desc }) => [desc(articles.createdAt)],
      });

      console.log('Query executed successfully');
      console.log('Results:', JSON.stringify(results, null, 2));

      return res.json(results || []);
    } catch (error) {
      // Detailed error logging
      console.error('Analytics query error details:', {
        name: error?.name,
        message: error?.message,
        stack: error?.stack,
      });
      
      return res.status(500).json({ 
        message: "Failed to fetch analytics data",
        error: error instanceof Error ? error.message : "Unknown error occurred"
      });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
