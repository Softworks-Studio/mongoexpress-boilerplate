import { Request, Response, NextFunction } from "express";
import NodeCache from "node-cache";
import crypto from 'crypto';

interface CacheOptions {
  ttl?: number;
  ignoredQueryParams?: string[];
  ignoreCache?: boolean;
}

interface CacheStats {
  hits: number;
  misses: number;
  keys: number;
}

export class CacheMiddleware {
  private nodeCache: NodeCache;
  private stats: CacheStats = { hits: 0, misses: 0, keys: 0 };

  constructor(defaultTTL: number = 3600) {
    this.nodeCache = new NodeCache({ 
      stdTTL: defaultTTL,
      checkperiod: defaultTTL * 0.2, 
      useClones: false 
    });

    this.nodeCache.on('expired', (key: string) => {
      console.debug(`Cache key expired: ${key}`);
    });
  }

  public cacheMiddleware(options: CacheOptions = {}) {
    return async (req: Request, res: Response, next: NextFunction) => {
      if (options.ignoreCache || req.headers['x-skip-cache']) {
        return next();
      }

      try {
        const key = await this.generateCacheKey(req, options);
        const cachedData = this.nodeCache.get<unknown>(key);

        if (cachedData !== undefined) {
          this.stats.hits++;
          res.setHeader('X-Cache', 'HIT');
          res.setHeader('X-Cache-Key', key);
          return res.json(cachedData);
        }

        this.stats.misses++;
        res.setHeader('X-Cache', 'MISS');
        res.setHeader('X-Cache-Key', key);

        const originalJson = res.json;
        res.json = (body: unknown) => {
          const ttl = options.ttl || this.nodeCache.options.stdTTL || 180;
          this.nodeCache.set(key, body, ttl);
          this.stats.keys = this.nodeCache.keys().length;
          return originalJson.call(res, body);
        };

        next();
      } catch (error) {
        console.error('Cache middleware error:', error);
        next();
      }
    };
  }

  private async generateCacheKey(req: Request, options: CacheOptions): Promise<string> {
    const parts = [req.method, req.originalUrl];
    
    if (['POST', 'PUT'].includes(req.method) && req.body) {
      const bodyHash = crypto
        .createHash('md5')
        .update(JSON.stringify(req.body))
        .digest('hex');
      parts.push(bodyHash);
    }

    if (options.ignoredQueryParams?.length && req.query) {
      const filteredQuery = { ...req.query };
      options.ignoredQueryParams.forEach(param => delete filteredQuery[param]);
      parts.push(JSON.stringify(filteredQuery));
    }

    return parts.join(':');
  }

  public clearCache(pattern: string): number {
    const keys = this.nodeCache.keys();
    let deletedCount = 0;

    for (const key of keys) {
      if (key.includes(pattern)) {
        this.nodeCache.del(key);
        deletedCount++;
      }
    }

    return deletedCount;
  }

  public flushRoute(method: string, route: string): number {
    return this.clearCache(`${method}:${route}`);
  }

  public getCacheStats(): CacheStats {
    return { ...this.stats };
  }

  public resetStats(): void {
    this.stats = { hits: 0, misses: 0, keys: 0 };
  }
}

