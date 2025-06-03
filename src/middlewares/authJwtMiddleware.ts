import { Request, Response, NextFunction } from 'express';
import jwt, {JwtPayload} from 'jsonwebtoken';
import config from "../utility/config";



export const authJwtMiddleware = (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        res.sendStatus(401);
        return;
    }

    const token = authHeader.split(' ')[1];

    try {
        const decoded = jwt.verify(token, config.JWT_SECRET) as JwtPayload;
            req.userId = decoded.userId
            req.userLogin = decoded.login
            req.userEmail = decoded.email


        next();
    } catch (e) {
        res.sendStatus(401);
    }
};

export const optionalAuthJwtMiddleware = (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        next();
        return;
    }

    const token = authHeader.split(' ')[1];

    try {
        const decoded = jwt.verify(token, config.JWT_SECRET) as JwtPayload;
        req.userId = decoded.userId;
        req.userLogin = decoded.login;
        req.userEmail = decoded.email;
        next();
    } catch (e) {
        next();
    }
};