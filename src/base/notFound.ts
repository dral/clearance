import express from 'express';

export const notFound = (_: express.Request, res: express.Response) => {
  return res.status(404).json({message: 'not found'});
};
