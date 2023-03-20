import express from 'express';

/**
 * @openapi
 * /:
 *   get:
 *     description: Verify server is up
 *     responses:
 *       200:
 *         description: Returns `ok` status
 */
export const ok = (_: express.Request, res: express.Response) => {
  return res.sendStatus(200);
};
