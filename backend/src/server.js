import 'dotenv/config';
import app from './app.js';
import { connectRedis } from './config/redis.js';

const PORT = process.env.PORT || 5000;

async function startServer() {
  // Attempt Redis connection (app works without it)
  await connectRedis();

  app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`📄 API Docs: http://localhost:${PORT}/api-docs`);
  });
}

startServer();
