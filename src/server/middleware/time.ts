import { NextFunction, Request, Response } from "express";

const timeMiddleware = (req: Request, res: Response, next: NextFunction) => {
  console.log(`Request made at ${new Date().toISOString()}`);

  next();
};

export { timeMiddleware };
