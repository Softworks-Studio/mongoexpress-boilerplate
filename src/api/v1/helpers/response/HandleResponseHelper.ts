import { Response } from "express";
import { config } from 'dotenv';

config();

export type ApiSuccessData = Record<string, unknown> | Array<unknown> | null;
export type HttpStatusCode = number;

export enum ApiErrorCode {
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  UNAUTHORIZED = 'UNAUTHORIZED',
  FORBIDDEN = 'FORBIDDEN',
  NOT_FOUND = 'NOT_FOUND',
  INTERNAL_ERROR = 'INTERNAL_ERROR',
}

interface BaseResponse {
  success: boolean;
  message: string;
  timestamp: string;
}

interface SuccessResponse extends BaseResponse {
  data: ApiSuccessData;

}

export interface ErrorResponse extends BaseResponse {
  errorCode: ApiErrorCode;
  stack?: string;
}

export type ApiResponse = SuccessResponse | ErrorResponse;

export function handleResponse(
  res: Response,
  status: HttpStatusCode,
  message?: string,
  data?: ApiSuccessData,
  errorCode?: ApiErrorCode
): void {
  const isSuccess = status >= 200 && status < 300;

  const baseResponse: BaseResponse = {
    success: isSuccess,
    message: message || (isSuccess ? "Operation successful" : "An error occurred"),
    timestamp: new Date().toISOString(),
  };

  const responseBody: ApiResponse = isSuccess
    ? {
        ...baseResponse,
        data: data ?? null,
      }
    : {
        ...baseResponse,
        errorCode: errorCode ?? ApiErrorCode.INTERNAL_ERROR,
        ...(process.env.NODE_ENV === "development" && status >= 400
          ? { stack: new Error().stack }
          : {}),
      };

  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');

  if (!res.getHeader('Cache-Control')) {
    const cacheControl = isSuccess 
      ? `public, max-age=${process.env.CACHE_MAX_AGE ?? 60}, stale-while-revalidate=30`
      : 'no-store, no-cache, must-revalidate, proxy-revalidate';
    res.setHeader('Cache-Control', cacheControl);
  }
  
  res.status(status).json(responseBody);
}
