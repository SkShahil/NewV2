import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
// Assuming @replit/vite-plugin-runtime-error-modal is installed in the root node_modules
// If not, this might need adjustment or the plugin might be removed for local dev
import runtimeErrorOverlay from "@replit/vite-plugin-runtime-error-modal";

export default defineConfig({
  plugins: [

    react(),
    runtimeErrorOverlay(),
    // Cartographer plugin might be Replit-specific, conditionally excluding for local
    // or removing if it causes issues. For now, keeping the logic.
    ...(process.env.NODE_ENV !== "production" &&
    process.env.REPL_ID !== undefined // This will likely be undefined locally
      ? [
          // Dynamically import to avoid errors if @replit/vite-plugin-cartographer is not found
          // or not intended for local use.
          // await import("@replit/vite-plugin-cartographer").then((m) =>
          //   m.cartographer(),
          // ),
        ]
      : []),
  ],
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "src"), // Adjusted for vite.config.ts being in client/
      // Assuming 'shared' is a sibling of the 'client' directory
      "@shared": path.resolve(import.meta.dirname, "..", "shared"), 
      // Assuming 'attached_assets' is a sibling of the 'client' directory
      "@assets": path.resolve(import.meta.dirname, "..", "attached_assets"),
    },
  },
  // 'root' is no longer needed here if vite runs from the 'client' directory
  // or if index.html is in client/
  build: {
    // Output relative to the new config file location (client/)
    // This will build to client/dist/public
    outDir: path.resolve(import.meta.dirname, "dist", "public"), 
    emptyOutDir: true,
  },
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
      }
    }
  }
}); 