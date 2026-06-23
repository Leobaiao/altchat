import { Request, Response, NextFunction } from "express";
import { findApiKey, findTenant } from "../store.js";
import { Tenant, ApiKey } from "@prisma/client";

// Extend Express Request to carry auth context
export interface AuthenticatedRequest extends Request {
  tenant?: Tenant;
  apiKey?: ApiKey;
}

export async function validateApiKey(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) {
  try {
    const apiKey = req.headers["x-altchat-api-key"];

    if (!apiKey || typeof apiKey !== "string") {
      return res.status(401).json({
        error: {
          code: "UNAUTHORIZED",
          message: "API Key ausente. Envie via header X-AltChat-Api-Key."
        }
      });
    }

    const keyRecord = await findApiKey(apiKey);

    if (!keyRecord) {
      return res.status(401).json({
        error: {
          code: "UNAUTHORIZED",
          message: "API Key inválida ou revogada."
        }
      });
    }

    const tenant = await findTenant(keyRecord.tenantId);

    if (!tenant || tenant.status !== "active") {
      return res.status(401).json({
        error: {
          code: "UNAUTHORIZED",
          message: "Tenant associado à API Key está inativo."
        }
      });
    }

    // Attach auth context to request
    req.tenant = tenant as Tenant;
    req.apiKey = keyRecord as ApiKey;

    next();
  } catch (err) {
    console.error("Auth middleware error:", err);
    res.status(500).json({ error: "Internal server error during authentication" });
  }
}
