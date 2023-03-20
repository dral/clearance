import express from 'express';
import logger from '../logger';

export const error = (error: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  const { path, method, query } = req;
  const {message} = error;
  if (res.headersSent) {
    let status = res.statusCode;
    logger.error(`${status} Silent Internal Server Error ${method} ${path} ${JSON.stringify(query)}`, error);
    return next();
  }
  logger.error(`500 Internal Server Error ${method} ${path} ${JSON.stringify(query)}`, error);
  return res.status(500).json({message});
};

export const explode = (message = 'Intentional unhandled error') => () => {
  throw new Error(message);
};

export const explodeAfterResponse = (message = 'Intentional unhandled error') => (_: express.Request, res: express.Response) => {
  res.sendStatus(200);
  throw new Error(message);
};