import { Router, Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { z } from "zod";
import { findUserByEmail, findUserById } from "../store.js";
import { requireJwtAuth } from "../middleware/jwtAuth.js";

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET || "super-secret-default-key-change-in-prod";

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

router.post("/login", async (req: Request, res: Response): Promise<void> => {
  try {
    const parseResult = loginSchema.safeParse(req.body);
    if (!parseResult.success) {
      res.status(400).json({ error: "Campos inválidos", details: parseResult.error });
      return;
    }

    const { email, password } = parseResult.data;
    const user = await findUserByEmail(email);

    if (!user) {
      res.status(401).json({ error: "Credenciais inválidas" });
      return;
    }

    const passwordMatch = await bcrypt.compare(password, user.passwordHash);
    if (!passwordMatch) {
      res.status(401).json({ error: "Credenciais inválidas" });
      return;
    }

    const token = jwt.sign(
      { userId: user.id, tenantId: user.tenantId, role: user.role },
      JWT_SECRET,
      { expiresIn: "8h" }
    );

    res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        tenantId: user.tenantId,
        tenant: user.tenant
      }
    });
  } catch (err) {
    console.error("Login error", err);
    res.status(500).json({ error: "Erro interno no servidor" });
  }
});

router.get("/me", requireJwtAuth, async (req: Request, res: Response): Promise<void> => {
  try {
    const userPayload = (req as any).user;
    if (!userPayload?.userId) {
      res.status(401).json({ error: "Não autorizado" });
      return;
    }

    const user = await findUserById(userPayload.userId);
    if (!user) {
      res.status(404).json({ error: "Usuário não encontrado" });
      return;
    }

    res.json({
      id: user.id,
      email: user.email,
      role: user.role,
      tenantId: user.tenantId,
      tenant: user.tenant
    });
  } catch (err) {
    console.error("Get /me error", err);
    res.status(500).json({ error: "Erro interno" });
  }
});

export default router;
