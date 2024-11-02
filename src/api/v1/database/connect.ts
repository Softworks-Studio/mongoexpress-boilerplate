import mongoose from "mongoose";
import { logger } from "../utils/logging/LoggerUtil";

const DB_CONFIG = {
  RETRY_DELAY_MS: 2000,
  MAX_RETRIES: 3,
  CONNECTION_TIMEOUT_MS: 5000,
  CONNECTION_OPTIONS: {
    serverSelectionTimeoutMS: 5000,
    connectTimeoutMS: 10000,
    socketTimeoutMS: 45000,
    maxPoolSize: 50,
    minPoolSize: 10
  }
} as const;

async function connectToDatabase(mongoUrl: string): Promise<void> {
  for (let attempt = 1; attempt <= DB_CONFIG.MAX_RETRIES; attempt++) {
    try {
      await mongoose.connect(mongoUrl, DB_CONFIG.CONNECTION_OPTIONS);
      
      mongoose.connection.on('error', (error) => {
        logger.error('MongoDB connection error:', {
          error: error instanceof Error ? error.message : String(error),
          stack: error instanceof Error ? error.stack : undefined,
        });
      });

      mongoose.connection.on('disconnected', () => {
        logger.warn('MongoDB disconnected. Attempting to reconnect...');
      });

      logger.info("Connected to MongoDB successfully 🚀", {
        poolSize: DB_CONFIG.CONNECTION_OPTIONS.maxPoolSize,
        host: new URL(mongoUrl).host,
      });
      return;
      
    } catch (error) {
      if (attempt === DB_CONFIG.MAX_RETRIES) {
        logger.error("Failed to connect to MongoDB after multiple attempts.", {
          error: error instanceof Error ? error.message : String(error),
          stack: error instanceof Error ? error.stack : undefined,
          attempt,
          maxRetries: DB_CONFIG.MAX_RETRIES,
        });
        throw new Error("Failed to connect to MongoDB after multiple attempts.");
      }
      logger.warn(
        `Failed to connect to MongoDB. Retrying in ${
          DB_CONFIG.RETRY_DELAY_MS / 1000
        } seconds... (${DB_CONFIG.MAX_RETRIES - attempt} ${
          attempt === DB_CONFIG.MAX_RETRIES - 1 ? "retry" : "retries"
        } left)`,
        {
          error: error instanceof Error ? error.message : String(error),
          stack: error instanceof Error ? error.stack : undefined,
        }
      );
      await new Promise((resolve) => setTimeout(resolve, DB_CONFIG.RETRY_DELAY_MS));
    }
  }
}

async function initializeDatabaseConnection(mongoUrl: string): Promise<void> {
  try {
    await connectToDatabase(mongoUrl);
  } catch (error) {
    await mongoose.disconnect();
    throw error;
  }
}

export default initializeDatabaseConnection;
