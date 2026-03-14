import { NextFunction, Request, Response } from "express";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.VITE_SUPABASE_URL!;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY!;

export interface ScopedRequest extends Request {
  businessId: string;
}

export async function withAuthOrBusinessScope(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  const explicitId = req.header("x-business-id") ?? (req.query.business_id as string | undefined);

  if (explicitId) {
    (req as ScopedRequest).businessId = explicitId;
    return next();
  }

  const authHeader = req.header("Authorization");
  if (authHeader?.startsWith("Bearer ")) {
    const token = authHeader.slice(7);
    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: `Bearer ${token}` } },
    });

    const { data: rows, error } = await supabase
      .from("business_users")
      .select("business_id")
      .limit(1);

    if (!error && rows && rows.length > 0) {
      (req as ScopedRequest).businessId = rows[0].business_id as string;
      return next();
    }
  }

  const acceptsHtml = req.header("Accept")?.includes("text/html");
  if (acceptsHtml) {
    res.redirect("/login");
    return;
  }

  res.status(401).json({ error: "Unauthorized. Provide a valid Authorization bearer token or x-business-id header." });
}
