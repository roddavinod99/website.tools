// Standalone server entry — delegates to .next/standalone/server.js
// Used by PM2 (ecosystem.config.js) and Docker (CMD)
process.env.NODE_ENV ??= "production";
import("./.next/standalone/server.js");
