import { Application, NextFunction, Request, Response } from "express";
import mongoSanitize from "express-mongo-sanitize";
import express from "express";
import compression from "compression";
import helmet from "helmet";
import hpp from "hpp";
import rateLimit from "express-rate-limit";
import { doubleCsrf } from 'csrf-csrf';
import session from "express-session";
import cors from "cors";
import { CONSTANTS } from "../../../../config/constants";
import { handleResponse } from "../../helpers/response/HandleResponseHelper";

export const securityMiddleware = (app: Application): void => {
  app.use(express.json({ 
    limit: '10kb',
    strict: true,
    verify: (req, _res, buf) => { (req as any).rawBody = buf }
  }));
  app.use(express.urlencoded({ extended: true, limit: "10kb" }));

  const corsOptions = {
    origin: CONSTANTS.CORS.origin,
    methods: CONSTANTS.CORS.methods,
    credentials: true,
    maxAge: 86400,
  };
  app.use(cors(corsOptions));

  const compressionOptions = {
    level: 6,
    threshold: 1024,
    filter: (req: Request, res: Response) => {
      if (req.headers['x-no-compression']) return false;
      return compression.filter(req, res);
    },
    cache: true,
    bytesSaved: 1024
  };
  app.use(compression(compressionOptions));

  const limiter = rateLimit({
    windowMs: CONSTANTS.RATE_LIMIT.windowMs,
    max: CONSTANTS.RATE_LIMIT.max,
    message: { error: 'Too many requests, please try again later.' },
    standardHeaders: true,
    legacyHeaders: false,
    keyGenerator: (req) => req.ip || '',
    skip: (req) => req.path === '/health'
  });

  const sessionConfig = {
    secret: process.env.SECRET as string,
    resave: false,
    saveUninitialized: false,
    name: CONSTANTS.PROJECT_NAME,
    cookie: {
      secure: process.env.NODE_ENV === 'production',
      httpOnly: true,
      sameSite: 'strict' as const,
      maxAge: 3600000,
      path: '/',
    },
    rolling: true,
  };
  app.use(session(sessionConfig));

  app.use(
    helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          scriptSrc: ["'self'", "'unsafe-inline'"],
          styleSrc: ["'self'", "'unsafe-inline'"],
          imgSrc: ["'self'", "data:", "https:"],
        },
      },
      referrerPolicy: { policy: "strict-origin-when-cross-origin" },
      hsts: { maxAge: 31536000, includeSubDomains: true, preload: true },
    })
  );

  app.use(hpp());

  app.use(mongoSanitize());

  app.use(
    session({
      secret: process.env.SECRET as string,
      resave: false,
      saveUninitialized: false,
      name: CONSTANTS.PROJECT_NAME, 
      cookie: {
        secure: process.env.NODE_ENV === 'production',
        httpOnly: true,
        sameSite: 'strict' as const,
        maxAge: 3600000,
        path: '/',
        domain: process.env.NODE_ENV === 'production' ? process.env.DOMAIN : undefined
      },
      rolling: true 
    })
  );

  const { generateToken, doubleCsrfProtection } = doubleCsrf({
    getSecret: () => process.env.SECRET as string,
    cookieName: 'x-csrf-token',
    cookieOptions: {
      sameSite: 'strict',
      secure: process.env.NODE_ENV === 'production',
      path: '/',
      domain: process.env.NODE_ENV === 'production' ? process.env.DOMAIN : undefined
    },
    size: 64,
    ignoredMethods: ['GET', 'HEAD', 'OPTIONS'],
  });

  app.use((req: Request, res: Response, next: NextFunction) => {
    if (!req.csrfToken) {
      req.csrfToken = () => generateToken(req, res);
    }
    next();
  });

  app.use(doubleCsrfProtection);

  app.use((err: Error | any, _req: Request, res: Response, next: NextFunction) => {
    if (err.code === 'CSRF_TOKEN_INVALID') {
      return handleResponse(
        res,
        403,
        'CSRF token is invalid!',
        null,
      );
    }
    next(err);
  });
};
