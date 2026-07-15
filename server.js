// Standalone server entry — delegates to .next/standalone/server.js
// Used by PM2 (ecosystem.config.js)

process.env.NODE_ENV = process.env.NODE_ENV || "production";

// Graceful shutdown handling
process.on("SIGTERM", () => {
  console.log("[server] SIGTERM received, shutting down gracefully...");
  process.exit(0);
});

process.on("SIGINT", () => {
  console.log("[server] SIGINT received, shutting down gracefully...");
  process.exit(0);
});

import("./.next/standalone/server.js").catch((err) => {
  console.error("[server] Failed to start:", err);
  process.exit(1);
});
