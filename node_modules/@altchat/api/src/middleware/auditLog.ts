import { Response, NextFunction } from "express";
import { AuthenticatedRequest } from "./auth.js";
import { logAudit } from "../store.js";

export function auditLog(action: string, entity: string) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    // Log the action after the response is sent
    const originalJson = res.json.bind(res);

    res.json = function (body: any) {
      // Extract entity ID from the response if available
      const entityId =
        body?.session?.id ||
        body?.id ||
        req.params?.sessionId ||
        "unknown";

      if (req.tenant && req.apiKey) {
        logAudit(
          req.tenant.id,
          action,
          entity,
          String(entityId),
          req.apiKey.id,
          req.ip || req.socket.remoteAddress || "unknown"
        ).catch(err => console.error("Error logging audit:", err));
      }

      return originalJson(body);
    };

    next();
  };
}
