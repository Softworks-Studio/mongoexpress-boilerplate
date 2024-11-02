import express, { Application, NextFunction, Request, Response } from "express";
import dotenv from "dotenv";
dotenv.config();
import apiRoute from "./routes/index";
import { handleResponse } from "./helpers/response/HandleResponseHelper";
import { securityMiddleware } from "./middlewares/core/CoreMiddleware";

const app: Application = express();
const PORT: number = parseInt(process.env.PORT || "3000", 10);
import { CONSTANTS } from "../../config/constants";
import { logger } from "./utils/logging/LoggerUtil";

securityMiddleware(app);

interface ApiError extends Error {
  status?: number;
  body?: unknown;
}

app.get("/", (_req: Request, res: Response) => {
  return handleResponse(res, 200, "Main API Route", {
    name: CONSTANTS.PROJECT_NAME,
    version: CONSTANTS.API_VERSION,
    timestamp: new Date().toISOString()
  });
});

app.use("/api/v1", apiRoute);

const errorLogger = (err: ApiError, _req: Request, _res: Response, next: NextFunction): void => {
  logger.error(`[${new Date().toISOString()}] Error:`, {
    message: err.message,
    stack: err.stack,
    status: err.status
  });
  next(err);
};

const errorHandler = (err: ApiError, _req: Request, res: Response, _next: NextFunction): void => {
  const status = err.status || 500;
  const message = status === 500 ? 'Internal server error' : err.message;
  res.status(status).json({
    success: false,
    message: message,
    data: null
  });
}; 

const syntaxErrorHandler = (err: ApiError, _req: Request, res: Response, next: NextFunction): Response | void => {
  if (err instanceof SyntaxError && "body" in err) {
    return handleResponse(res, 400, "Invalid JSON in request body", null);
  }
  next(err);
};

app.use(errorLogger as express.ErrorRequestHandler);
app.use(syntaxErrorHandler as express.ErrorRequestHandler);
app.use(errorHandler as express.ErrorRequestHandler);

export const startServer = (): void => {
  const server = app.listen(PORT, () => {
    console.log(`[${new Date().toISOString()}] Server is running on port ${PORT}`);
  });

  const shutdown = (signal: string): void => {
    console.log(`[${new Date().toISOString()}] ${signal} received. Starting graceful shutdown...`);
    server.close(() => {
      console.log('[${new Date().toISOString()}] Server shutdown complete');
      process.exit(0);
    });
  };

  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));
};

export default app;
