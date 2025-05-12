import './config.js'; // MUST be the first import to load .env

import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { serveStatic, log } from "./vite"; // Only importing serveStatic and log, setupVite is not used directly here
import http from 'http';
import findFreePort from 'find-free-port';

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
    await registerRoutes(app);

    if (process.env.NODE_ENV === 'production') {
      serveStatic(app); // Only serve static files in production
    } else {
      // In development, the client is served by its own Vite dev server.
      // The Express server only handles API routes.
      log('[Server Mode] Development: API server only. Client served by Vite dev process.');
    }

    const initialPort = Number(process.env.PORT) || 3001;
    findFreePort(initialPort, (err: any, freePort: number) => {
      if (err) throw err;
      const server = http.createServer(app);
      server.listen(freePort, () => {
      log(`Server running on http://localhost:${freePort}`);
      log(`Environment: ${process.env.NODE_ENV}`);
    });

  } catch (error) {
    log(`Failed to start server: ${error}`);
    process.exit(1);
  }
})();
