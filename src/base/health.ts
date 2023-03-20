import express from 'express';
import { isAlive as serverOK } from '../server';
import { isAlive as dbOk } from '../db';
/**
 * @openapi
 * /health:
 *   get:
 *     description: Verify server is up
 *     responses:
 *       200:
 *         description: Returns `ok` status
 *       500:
 *         description: Either the db or the server is not working as expected
 */
export const health = (_: express.Request, res: express.Response) => {
  let server = serverOK();
  let db = dbOk();
  if (server && db) {
    res.status(200);
  } else {
    res.status(500);
  }
  return res.json({ server, db });
};
