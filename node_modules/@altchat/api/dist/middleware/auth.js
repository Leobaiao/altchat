import { findApiKey, findTenant } from "../store.js";
export async function validateApiKey(req, res, next) {
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
        req.tenant = tenant;
        req.apiKey = keyRecord;
        next();
    }
    catch (err) {
        console.error("Auth middleware error:", err);
        res.status(500).json({ error: "Internal server error during authentication" });
    }
}
