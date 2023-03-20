import express from 'express';
import doc from './base/apiDoc';
import license from './base/licence';

const app = express.Router();

// TODO: set application router here

// Licences API
app.use(license);
// API documentation
app.use(doc);

export default app;
