import { logAudit } from "../store.js";
export function auditLog(action, entity) {
    return (req, res, next) => {
        // Log the action after the response is sent
        const originalJson = res.json.bind(res);
        res.json = function (body) {
            // Extract entity ID from the response if available
            const entityId = body?.session?.id ||
                body?.id ||
                req.params?.sessionId ||
                "unknown";
            if (req.tenant && req.apiKey) {
                logAudit(req.tenant.id, action, entity, String(entityId), req.apiKey.id, req.ip || req.socket.remoteAddress || "unknown").catch(err => console.error("Error logging audit:", err));
            }
            return originalJson(body);
        };
        next();
    };
}
