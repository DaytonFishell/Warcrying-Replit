import { Request, Response, NextFunction } from 'express';

// Simple gzip compression middleware for better performance
export function compressionMiddleware(req: Request, res: Response, next: NextFunction) {
  const acceptEncoding = req.headers['accept-encoding'] || '';
  
  if (acceptEncoding.includes('gzip')) {
    res.setHeader('Content-Encoding', 'gzip');
  }
  
  next();
}

// Cache control middleware for static assets
export function cacheControlMiddleware(req: Request, res: Response, next: NextFunction) {
  if (req.path.match(/\.(js|css|png|jpg|jpeg|gif|ico|svg)$/)) {
    // Cache static assets for 1 hour
    res.setHeader('Cache-Control', 'public, max-age=3600');
  } else if (req.path.startsWith('/api/')) {
    // Don't cache API responses
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
  }
  
  next();
}