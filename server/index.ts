import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import fs from "fs/promises";
import path from "path";
import compression from "compression";
import rateLimit from "express-rate-limit";
import cors from "cors";

const app = express();

// Trust proxy - required for rate limiting behind reverse proxies
app.set('trust proxy', 1);

// Enable compression for all responses
app.use(compression());

// Configure rate limiting with proxy support
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  trustProxy: true,
  skip: (req) => {
    // Skip rate limiting for static assets
    return req.path.match(/\.(css|js|jpg|png|gif|ico|woff|woff2|ttf|eot|svg)$/i) !== null;
  }
});

// Apply rate limiting to API routes only
app.use('/api', limiter);

// Enable CORS with proper configuration
app.use(cors({
  origin: process.env.NODE_ENV === 'production' ? 'https://yourdomain.com' : true,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Parse JSON payloads with size limits
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: false, limit: '10mb' }));

// Cache static assets
const cacheControl = (req: Request, res: Response, next: NextFunction) => {
  // Cache images and audio for 1 day
  if (req.path.match(/\.(jpg|jpeg|png|gif|mp3|wav)$/i)) {
    res.set('Cache-Control', 'public, max-age=86400');
  }
  // Cache other static assets for 1 hour
  else if (req.path.match(/\.(css|js)$/i)) {
    res.set('Cache-Control', 'public, max-age=3600');
  }
  next();
};

// Ensure public/images and public/audio directories exist
async function ensureDirectories() {
  const imagesDir = path.join(process.cwd(), "public", "images");
  const audioDir = path.join(process.cwd(), "public", "audio");

  await fs.mkdir(imagesDir, { recursive: true });
  await fs.mkdir(audioDir, { recursive: true });

  log(`Ensured directories exist: ${imagesDir}, ${audioDir}`);
}

// Request logging middleware
app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      log(logLine);
    }
  });

  next();
});

(async () => {
  try {
    // Ensure directories exist before starting server
    await ensureDirectories();

    const server = registerRoutes(app);

    // Apply cache control to static files
    app.use(cacheControl);

    app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
      console.error('Server error:', err);
      const status = err.status || err.statusCode || 500;
      const message = err.message || "Internal Server Error";
      res.status(status).json({ message });
    });

    if (app.get("env") === "development") {
      await setupVite(app, server);
    } else {
      serveStatic(app);
    }

    const PORT = 5000;
    server.listen(PORT, "0.0.0.0", () => {
      log(`serving on port ${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
})();