import type { Express } from "express";
import { createServer, type Server } from "http";
import { db } from "@db";
import { articles } from "@db/schema";
import { eq, and, desc, sql } from "drizzle-orm";

export function registerRoutes(app: Express): Server {
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
      const result = await db.insert(articles).values({
        title: req.body.title,
        content: req.body.content,
        description: req.body.description,
        imageurl: req.body.imageUrl,
        authoraddress: req.body.authorAddress.toLowerCase(),
        signature: req.body.signature,
        videourl: req.body.videoUrl || '',
        isdraft: req.body.isDraft ?? true,
        videoduration: req.body.videoDuration ?? 15,
        hasbackgroundmusic: req.body.hasBackgroundMusic ?? true,
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

  const httpServer = createServer(app);
  return httpServer;
}