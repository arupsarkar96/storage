import { NextFunction, Request, Response } from "express"
import configuration from "../config"

export const auth = (req: Request, res: Response, next: NextFunction): void => {
    const { access, secret } = req.headers;

    if (!access || !secret) {
        res.status(403).json({
            code: 403,
            message: "Access Key and Secret Key are required",
            resource: req.url,
            timestamp: Date.now(),
        });
        return; // Make sure to stop execution after sending the response
    }

    if (access !== configuration.ACCESS_KEY) {
        res.status(403).json({
            code: 403,
            message: "Access Key is invalid",
            resource: req.url,
            timestamp: Date.now(),
        });
        return;
    }

    if (secret !== configuration.SECRET_KEY) {
        res.status(403).json({
            code: 403,
            message: "Secret Key is invalid",
            resource: req.url,
            timestamp: Date.now(),
        });
        return;
    }

    next(); // Pass control to the next middleware or route handler
};