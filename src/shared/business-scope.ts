import { NextFunction, Request, Response } from "express";

export interface ScopedRequest extends Request {
  businessId: string;
}

export function withBusinessScope(req: Request, res: Response, next: NextFunction): void {
  const businessId = req.header("x-business-id") ?? req.query.business_id;

  if (!businessId || typeof businessId !== "string") {
    res.status(400).json({ error: "Missing business scope. Provide x-business-id or business_id." });
    return;
  }

  (req as ScopedRequest).businessId = businessId;
  next();
}
