import { Request, Response, NextFunction } from "express";
import jwt from 'jsonwebtoken';

declare global {
    namespace Express {
        interface Request {
            user?: {
                userId: string;
            }
        }
    }
}

export function authMiddleware(
    req: Request,
    res: Response,
    next: NextFunction
) {
   
    const authHeader = req.headers.authorization;

    if(!authHeader) {
        return res.status(401).json({ error: 'Token não fornecido.'});
    }

    const [scheme, token] = authHeader.split(' ');

    if(scheme !== 'Bearer' || !token) {
        return res.status(401).json({ error: 'Formato de token inválido.'})
    }

    try{
        const secret = process.env.JWT_SECRET!;

        const payload = jwt.verify(token, secret) as {userId: string};

        req.user = { userId: payload.userId };

        return next();
    } catch (error) {
        return res.status(401).json({ error: 'Token inválido ou expirado.'});
    }
}