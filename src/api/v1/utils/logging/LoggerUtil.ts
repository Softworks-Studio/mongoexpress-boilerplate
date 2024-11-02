import winston from "winston";
import DailyRotateFile from "winston-daily-rotate-file";
import morgan from "morgan";
import { CONSTANTS } from "../../../../config/constants";

const commonJsonFormat = winston.format.combine(
  winston.format.timestamp(),
  winston.format.errors({ stack: true }),
  winston.format.json()
);

const commonSimpleFormat = winston.format.combine(
  winston.format.colorize(),
  winston.format.simple()
);

const transportConfig = {
  datePattern: "YYYY-MM-DD",
  zippedArchive: true,
  maxSize: "20m",
  maxFiles: "14d",
};

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || "info",
  format: commonJsonFormat,
  defaultMeta: { 
    service: CONSTANTS.PROJECT_NAME,
    environment: process.env.NODE_ENV
  },
  transports: [
    new DailyRotateFile({
      ...transportConfig,
      filename: "logs/%DATE%-app.json",
      format: winston.format.json(),
      handleExceptions: true,
      handleRejections: true,
    }),
    new DailyRotateFile({
      ...transportConfig,
      filename: "logs/%DATE%-app.log",
      format: winston.format.simple(),
    }),
    new winston.transports.Console({
      format: winston.format.simple(),
    }),
  ],
  exitOnError: false,
});

const exceptionHandlers = [
  new winston.transports.File({ 
    filename: "logs/exceptions.log",
    handleExceptions: true,
    maxsize: 5242880, // 5MB
    maxFiles: 5,
  }),
  new winston.transports.Console({
    format: commonSimpleFormat,
  })
];

logger.exceptions.handle(...exceptionHandlers);
logger.rejections.handle(...exceptionHandlers);

const morganMiddleware = morgan("combined", {
  stream: {
    write: (() => {
      const logBuffer: string[] = [];
      const flushInterval = 1000; 

      setInterval(() => {
        if (logBuffer.length > 0) {
          logger.http(logBuffer.join('\n'));
          logBuffer.length = 0;
        }
      }, flushInterval);

      return (message: string) => {
        logBuffer.push(message.trim());
      };
    })(),
  },
});

export { logger, morganMiddleware };
