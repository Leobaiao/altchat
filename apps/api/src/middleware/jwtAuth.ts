import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "super-secret-default-key-change-in-prod";

export function requireJwtAuth(req: Request, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    res.status(401).json({ error: "Token de autorização ausente ou inválido" });
    return;
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    // Injeta o payload decodificado na request para as próximas rotas
    (req as any).user = decoded;
    next();
  } catch (err) {
    console.error("JWT validation error:", err);
    res.status(401).json({ error: "Token expirado ou inválido" });
  }
}
