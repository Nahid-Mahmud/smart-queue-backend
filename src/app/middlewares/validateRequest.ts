import { NextFunction, Request, Response } from "express";
import { ZodObject, ZodRawShape } from "zod";

export const validateRequest =
  (ZodSchema: ZodObject<ZodRawShape>) => async (req: Request, res: Response, next: NextFunction) => {
    try {
      // req.body = req.body.data ? JSON.parse(req.body.data) : req.body; // Handle cases where body is wrapped in 'data'

      if (req.body.data) {
        req.body = JSON.parse(req.body.data);
      }

      req.body = await ZodSchema.parseAsync(req.body);
      next();
    } catch (error) {
      next(error);
    }
  };
