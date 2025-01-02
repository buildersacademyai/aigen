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
  // Ensure public directories exist
  const setupDirectories = async () => {
    const dirs = [
      path.join(process.cwd(), 'public', 'images'),
      path.join(process.cwd(), 'public', 'audio')
    ];

    for (const dir of dirs) {
      await fs.mkdir(dir, { recursive: true });
    }
    console.log('Ensured directories exist:', dirs.join(', '));
  };

  setupDirectories().catch(console.error);

  // Serve static files from public directories with proper caching and headers
  app.use('/images', express.static(path.join(process.cwd(), 'public', 'images'), {
    maxAge: '1d', // Cache images for 1 day
    etag: true,
    setHeaders: (res, filePath) => {
      // Set proper content type based on file extension
      const ext = path.extname(filePath).toLowerCase();
      switch (ext) {
        case '.jpg':
        case '.jpeg':
          res.setHeader('Content-Type', 'image/jpeg');
          break;
        case '.png':
          res.setHeader('Content-Type', 'image/png');
          break;
        case '.gif':
          res.setHeader('Content-Type', 'image/gif');
          break;
        case '.webp':
          res.setHeader('Content-Type', 'image/webp');
          break;
      }
      // Add cache control headers
      res.setHeader('Cache-Control', 'public, max-age=86400'); // 1 day
      res.setHeader('Vary', 'Accept-Encoding');
    }
  }));

  app.use('/audio', express.static(path.join(process.cwd(), 'public', 'audio'), {
    maxAge: '1d',
    etag: true,
  }));

  // Add health check endpoint for stored images
  app.get("/api/images/health", async (req, res) => {
    try {
      const imagesDir = path.join(process.cwd(), "public", "images");
      await fs.access(imagesDir);

      // Check if at least one image exists and is accessible
      const images = await db.select().from(storedImages).limit(1);
      if (images.length > 0) {
        const testImage = images[0];
        await fs.access(path.join(imagesDir, testImage.filename));
      }

      res.json({ status: "healthy" });
    } catch (error) {
      console.error("Image storage health check failed:", error);
      res.status(500).json({
        status: "unhealthy",
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // Add route to verify specific image
  app.get("/api/images/verify/:filename", async (req, res) => {
    try {
      const filename = req.params.filename;
      const imagesDir = path.join(process.cwd(), "public", "images");
      const filePath = path.join(imagesDir, filename);

      try {
        await fs.access(filePath);
        const stats = await fs.stat(filePath);
        res.json({
          exists: true,
          size: stats.size,
          path: `/images/${filename}`
        });
      } catch {
        // If file doesn't exist, try to recover it from original URL
        const [image] = await db
          .select()
          .from(storedImages)
          .where(eq(storedImages.filename, filename))
          .limit(1);

        if (!image) {
          return res.status(404).json({ message: "Image not found in database" });
        }

        // Try to re-download the image
        const imageResponse = await fetch(image.originalurl);
        if (!imageResponse.ok) {
          throw new Error(`Failed to download image: ${imageResponse.statusText}`);
        }

        // Save the image
        const buffer = await imageResponse.arrayBuffer();
        await fs.writeFile(filePath, Buffer.from(buffer));

        // Verify the file exists and has content
        const stats = await fs.stat(filePath);
        if (stats.size === 0) {
          await fs.unlink(filePath);
          throw new Error("Downloaded image is empty");
        }

        res.json({
          exists: true,
          recovered: true,
          path: `/images/${filename}`
        });
      }
    } catch (error) {
      console.error("Image verification failed:", error);
      res.status(500).json({
        message: "Failed to verify image",
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // Add route to verify audio file
  app.get("/api/audio/verify/:filename", async (req, res) => {
    try {
      const filename = req.params.filename;
      const audioDir = path.join(process.cwd(), "public", "audio");
      const filePath = path.join(audioDir, filename);

      try {
        await fs.access(filePath);
        const stats = await fs.stat(filePath);
        res.json({
          exists: true,
          size: stats.size,
          url: `/audio/${filename}`
        });
      } catch {
        // If file doesn't exist, try to recover it
        const [audio] = await db
          .select()
          .from(storedAudio)
          .where(eq(storedAudio.filename, filename))
          .limit(1);

        if (!audio) {
          return res.status(404).json({ message: "Audio file not found in database" });
        }

        // Since we can't re-download the audio file (it's stored locally),
        // we should ensure proper backup procedures are in place
        res.status(404).json({ message: "Audio file is missing and cannot be recovered automatically" });
      }
    } catch (error) {
      console.error("Audio verification failed:", error);
      res.status(500).json({
        message: "Failed to verify audio file",
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // Add new route for saving images
  app.post("/api/images/save", async (req, res) => {
    try {
      console.log('Saving image with URL:', req.body.imageUrl);
      const { imageUrl, articleId } = req.body;
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
      const buffer = await imageResponse.arrayBuffer();
      await fs.writeFile(filePath, Buffer.from(buffer));

      // Verify the file exists and has content
      const stats = await fs.stat(filePath);
      if (stats.size === 0) {
        await fs.unlink(filePath);
        throw new Error("Downloaded image is empty");
      }

      // Store image information in database
      const [storedImage] = await db.insert(storedImages).values({
        filename,
        originalurl: imageUrl,
        localpath: `/images/${filename}`,
        articleid: articleId,
      }).returning();

      console.log('Image saved successfully:', storedImage.localpath);
      res.json({ url: storedImage.localpath });
    } catch (error) {
      console.error("Error saving image:", error);
      res.status(500).json({
        message: "Failed to save image",
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

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
      console.error('Error fetching articles:', error);
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
      console.log('Creating article with data:', JSON.stringify(req.body, null, 2));

      // Validate required fields
      if (!req.body.authoraddress) {
        return res.status(400).json({ message: "Author address is required" });
      }

      const result = await db.insert(articles).values({
        title: req.body.title,
        content: req.body.content,
        description: req.body.description,
        summary: req.body.summary || req.body.description,
        imageurl: req.body.imageurl,
        thumbnailurl: req.body.thumbnailurl,
        videourl: req.body.videourl || '',
        audiourl: req.body.audiourl || '',
        audioduration: req.body.audioduration || null,
        authoraddress: req.body.authoraddress.toLowerCase(),
        signature: req.body.signature || "",
        isdraft: req.body.isdraft ?? true,
        videoduration: req.body.videoduration ?? 15,
        hasbackgroundmusic: req.body.hasbackgroundmusic ?? true,
      }).returning();

      console.log('Article created successfully:', JSON.stringify(result[0], null, 2));
      res.status(201).json(result[0]);
    } catch (error) {
      console.error('Article creation error:', error);
      res.status(500).json({
        message: "Failed to create article",
        error: error instanceof Error ? error.message : 'Unknown error'
      });
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

      // First get the current article
      const [currentArticle] = await db
        .select()
        .from(articles)
        .where(eq(articles.id, parseInt(req.params.id)))
        .limit(1);

      if (!currentArticle) {
        return res.status(404).json({ message: "Article not found" });
      }

      console.log('Publishing article:', currentArticle.id, 'with source links:', req.body.sourceLinks);

      // Clean the content by removing '#' and '*' signs
      const cleanContent = currentArticle.content
        .replace(/[#*]/g, '')
        .trim();

      // Add source links if they exist, placing them before the video section
      let finalContent = cleanContent;
      if (req.body.sourceLinks && Array.isArray(req.body.sourceLinks) && req.body.sourceLinks.length > 0) {
        // Find the position for video section (if it exists)
        const videoSectionIndex = finalContent.indexOf("Featured Video");
        if (videoSectionIndex !== -1) {
          // Find the start of the paragraph containing "Featured Video"
          const paragraphStart = finalContent.lastIndexOf('\n\n', videoSectionIndex);
          if (paragraphStart !== -1) {
            // Insert source links before the video section
            const sourceLinksSection = `\n\n## Resources Used\n${req.body.sourceLinks.map((link: string) => `- ${link}`).join('\n')}\n`;
            finalContent = finalContent.slice(0, paragraphStart) + sourceLinksSection + finalContent.slice(paragraphStart);
          } else {
            // If we can't find paragraph start, just append at the end
            finalContent = `${cleanContent}\n\n## Resources Used\n${req.body.sourceLinks.map((link: string) => `- ${link}`).join('\n')}`;
          }
        } else {
          // If no video section, append at the end
          finalContent = `${cleanContent}\n\n## Resources Used\n${req.body.sourceLinks.map((link: string) => `- ${link}`).join('\n')}`;
        }
      }

      console.log('Final content preview:', finalContent.substring(0, 200) + '...');

      const result = await db
        .update(articles)
        .set({
          isdraft: false,
          signature: req.body.signature,
          content: finalContent,
          sourcelinks: req.body.sourceLinks ? JSON.stringify(req.body.sourceLinks) : null,
          updatedat: new Date(),
        })
        .where(eq(articles.id, parseInt(req.params.id)))
        .returning();

      if (result.length === 0) {
        return res.status(404).json({ message: "Article not found" });
      }

      console.log('Article published successfully:', result[0].id);
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

      console.log('Processing audio file:', req.file.filename);

      // Get audio duration
      const duration = Math.ceil(await getAudioDurationInSeconds(req.file.path));

      // Store audio information in database
      const [storedAudioFile] = await db.insert(storedAudio).values({
        filename: req.file.filename,
        duration,
        localpath: `/audio/${req.file.filename}`,
        articleid: articleId,
      }).returning();

      console.log('Audio file processed and stored:', storedAudioFile);

      res.json({
        url: storedAudioFile.localpath,
        duration: duration,
      });
    } catch (error) {
      console.error("Error saving audio:", error);
      res.status(500).json({
        message: "Failed to save audio file",
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}