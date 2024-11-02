import { startServer } from "./server";
import initializeDatabaseConnection from "./database/connect";
import dotenv from "dotenv";
import { logger } from "./utils/logging/LoggerUtil";
dotenv.config();

interface AppConfig {
  mongoUrl: string;
  maxRetries: number;
  retryDelay: number;
}

async function getConfig(): Promise<AppConfig> {
  const config = {
    mongoUrl: process.env.MONGO_URL,
    maxRetries: Number(process.env.DB_MAX_RETRIES) || 3,
    retryDelay: Number(process.env.DB_RETRY_DELAY_MS) || 1000,
  };
  
  return config as AppConfig;
}

async function initializeServices(config: AppConfig): Promise<void> {
  let retries = 0;
  
  while (retries < config.maxRetries) {
    try {
      await initializeDatabaseConnection(config.mongoUrl);
      await startServer();
      logger.info('Application successfully initialized');
      return;
    } catch (error) {
      retries++;
      logger.error({
        message: 'Service initialization failed',
        error: error instanceof Error ? error.message : String(error),
        attempt: retries,
      });

      if (retries === config.maxRetries) {
        throw new Error('Maximum retry attempts exceeded');
      }

      await new Promise(resolve => setTimeout(resolve, config.retryDelay));
    }
  }
}

async function main(): Promise<void> {
  try {
    const config = await getConfig();
    await initializeServices(config);
  } catch (error) {
    logger.error({
      message: 'Fatal error during application startup',
      error: error instanceof Error ? error.message : String(error),
    });
    process.exit(1);
  }
}

process.on('uncaughtException', (error) => {
  logger.error({
    message: 'Uncaught exception',
    error: error.message,
    stack: error.stack,
  });
  process.exit(1);
});

process.on('unhandledRejection', (reason) => {
  logger.error({
    message: 'Unhandled rejection',
    error: reason instanceof Error ? reason.message : String(reason),
  });
  process.exit(1);
});

main().catch((error) => {
  logger.error({
    message: 'Unhandled error in main function',
    error: error instanceof Error ? error.message : String(error),
  });
  process.exit(1);
});
