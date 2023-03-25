import swaggerJsdoc from 'swagger-jsdoc';
import project from 'src/../package.json';
import config from 'config';
import express from 'express';
import swaggerUi from 'swagger-ui-express';

const { name: title, version, description } = project;
const port = config.get<string>('restApi.port');
const baseUrl = config.get<string>('restApi.baseUrl');
const docOverrides = config.get<object>('openAPI');
let url = new URL(baseUrl);
url.port = port;

const options: swaggerJsdoc.Options = {
  failOnErrors: true,
  definition: {
    openapi: '3.0.0',
    info: {
      description,
      title,
      version,
      ...docOverrides,
    },
    servers: [
      {
        url,
        description: 'Development server',
      },
    ],
  },
  apis: ['./src/**/*.ts'],
};

export const uiOptions = {
  customCss: '.swagger-ui .topbar { display: none }',
};

export const openapiSpecification = swaggerJsdoc(options);

const router = express.Router();

/**
 * @openapi
 * /openAPI:
 *   get:
 *     description: Get the OpenAPI json description for this API
 *     responses:
 *       200:
 *         description: A json containing the OpenAPI specification
 */
router.get('/openAPI', (req, res) => {
  res.json(openapiSpecification);
});

router.use(
  '/doc',
  swaggerUi.serve,
  swaggerUi.setup(openapiSpecification, uiOptions)
);

export default router;
