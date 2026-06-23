// Simple in-memory rate limiter per API Key
// Will be replaced with express-rate-limit when the package is available
const WINDOW_MS = 60 * 1000; // 1 minute
const MAX_REQUESTS = 100;
const rateLimitStore = new Map();
export function rateLimit(req, res, next) {
    // Skip rate limiting in development
    if (process.env.NODE_ENV === "development") {
        return next();
    }
    const apiKeyId = req.apiKey?.id;
    if (!apiKeyId) {
        return next();
    }
    const now = Date.now();
    let entry = rateLimitStore.get(apiKeyId);
    if (!entry || now >= entry.resetAt) {
        entry = { count: 0, resetAt: now + WINDOW_MS };
        rateLimitStore.set(apiKeyId, entry);
    }
    entry.count++;
    // Set rate limit headers
    res.setHeader("X-RateLimit-Limit", MAX_REQUESTS);
    res.setHeader("X-RateLimit-Remaining", Math.max(0, MAX_REQUESTS - entry.count));
    res.setHeader("X-RateLimit-Reset", Math.ceil(entry.resetAt / 1000));
    if (entry.count > MAX_REQUESTS) {
        return res.status(429).json({
            error: {
                code: "RATE_LIMITED",
                message: `Limite de ${MAX_REQUESTS} requisições por minuto excedido. Tente novamente em breve.`
            }
        });
    }
    next();
}
