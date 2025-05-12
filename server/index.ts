import './config.js'; // MUST be the first import to load .env
// import dotenv from 'dotenv'; 
// dotenv.config({ path: require('path').resolve(process.cwd(), '.env') }); // Explicitly load .env from CWD

// // Log critical environment variables immediately after dotenv attempts to load them 
// console.log(`[Server Initializing] NODE_ENV: ${process.env.NODE_ENV}`);
// console.log(`[Server Initializing] GEMINI_FLASH_API_KEY (first 10 chars): ${process.env.GEMINI_FLASH_API_KEY ? process.env.GEMINI_FLASH_API_KEY.substring(0, 10) + '...' : 'MISSING'}`);

import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { serveStatic, log } from "./vite"; // Only importing serveStatic and log, setupVite is not used directly here

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Error handling middleware
app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
  const status = err.status || err.statusCode || 500;
  const message = err.message || "Internal Server Error";
  log(`Error: ${message}`);
  res.status(status).json({ message });
});

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
    const server = await registerRoutes(app);

    if (process.env.NODE_ENV === 'production') {
      serveStatic(app); // Only serve static files in production
    } else {
      // In development, the client is served by its own Vite dev server.
      // The Express server only handles API routes.
      log("[Server Mode] Development: API server only. Client served by Vite dev process.");
    }

    const port = process.env.PORT || 3001;
    server.listen(Number(port), () => {
      log(`Server running on http://localhost:${port}`);
      log(`Environment: ${process.env.NODE_ENV}`);
    });

    server.on('error', (error: any) => {
      if (error.code === 'EADDRINUSE') {
        log(`Port ${port} is already in use. Please try a different port.`);
        process.exit(1);
      } else {
        log(`Server error: ${error.message}`);
        process.exit(1);
      }
    });

  } catch (error) {
    log(`Failed to start server: ${error}`);
    process.exit(1);
  }
})();
