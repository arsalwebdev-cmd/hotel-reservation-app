import type { ErrorRequestHandler, RequestHandler } from 'express';
import { ZodError } from 'zod';

export const notFoundHandler: RequestHandler = (_req, res) => {
  res.status(404).json({ error: 'API endpoint not found.' });
};

export const errorHandler: ErrorRequestHandler = (error, _req, res, _next) => {
  if (error instanceof ZodError) {
    res.status(400).json({ error: 'Please check the submitted information.', details: error.issues });
    return;
  }

  console.error('API request failed:', error);
  res.status(500).json({ error: 'Something went wrong. Please try again.' });
};
