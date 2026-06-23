import { Response, NextFunction } from "express";
import { AuthenticatedRequest } from "./auth.js";

export function filterByTenant(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) {
  const tenant = req.tenant;

  if (!tenant) {
    return res.status(401).json({
      error: {
        code: "UNAUTHORIZED",
        message: "Tenant não autenticado."
      }
    });
  }

  // Check tenantId in body, params, or query
  const tenantId =
    req.body?.tenantId ||
    req.params?.tenantId ||
    (req.query?.tenantId as string);

  if (tenantId && tenantId !== tenant.id) {
    return res.status(403).json({
      error: {
        code: "FORBIDDEN",
        message: "Acesso negado. Você não tem permissão para acessar dados de outro tenant."
      }
    });
  }

  next();
}
