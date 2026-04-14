import { Request, Response, NextFunction } from 'express';
import { AnyZodObject, ZodError } from 'zod';

export const validate = (schema: AnyZodObject) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const validatedData = await schema.parseAsync({
        body: req.body,
        query: req.query,
        params: req.params,
      });
      
      // Assign back to request to preserve transformations
      req.body = validatedData.body || req.body;
      req.query = validatedData.query || req.query;
      req.params = validatedData.params || req.params;

      return next();
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({ error: 'Validation Error', details: error.errors });
      }
      return res.status(400).json({ error: 'Validation Error' });
    }
  };
};
