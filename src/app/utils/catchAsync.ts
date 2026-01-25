import { NextFunction, Request, Response } from "express";
import envVariables from "../config/env";

type asyncHandler = (req: Request, res: Response, next: NextFunction) => Promise<void>;

export const catchAsync = (fn: asyncHandler) => (req: Request, res: Response, next: NextFunction) => {
  Promise.resolve(fn(req, res, next)).catch((error: unknown) => {
    if (envVariables.NODE_ENV === "development") {
      // eslint-disable-next-line no-console
      console.error("Async Error Handler:", error);
    }

    next(error);
  });
};
