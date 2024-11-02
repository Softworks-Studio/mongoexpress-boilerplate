import { Request, Response, NextFunction } from "express";
import {  ErrorResponse, handleResponse } from "../response/HandleResponseHelper";
import { ApiResponse } from "../response/HandleResponseHelper";
import { logger } from "../../utils/logging/LoggerUtil";

type AsyncRequestHandler<Req extends Request = Request> = (
  req: Req,
  res: Response,
  next: NextFunction
) => Promise<void>;


export const catchError = <Req extends Request = Request>(
  fn: AsyncRequestHandler<Req>
): AsyncRequestHandler<Req> => {
  return async (req: Req, res: Response, next: NextFunction): Promise<void> => {
    try {
      await fn(req, res, next);
    } catch (err: unknown) {
      const error = err as Error | ErrorResponse | ApiResponse;
      
      logger.error('Unhandled error occurred', {
        error: error.message,
        stack: error instanceof Error ? error.stack : undefined,
        path: req.path,
        method: req.method,
        requestId: req.headers['x-request-id'] || 'unknown'
      });

      if (!res.headersSent) {
        const status = 'status' in error ? error.status : 500;
        const message = error.message || 'Internal server error';
        
        handleResponse(res, status as number, message, null);
      }
    }
  };
};
