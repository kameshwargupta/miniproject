import app from "./app";
import { logger } from "./lib/logger";

const rawPort = process.env["PORT"] || "5000";
const port = Number(rawPort);

if (Number.isNaN(port) || port <= 0) {
  throw new Error(`Invalid PORT value: "${rawPort}"`);
}

// Only start the server when not running on Vercel (serverless)
if (!process.env.VERCEL) {
  app.listen(port, () => {
    logger.info({ port }, "Server listening");
  });
}

// Export the Express app for Vercel serverless deployment
export default app;
