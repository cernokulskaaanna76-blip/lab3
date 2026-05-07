import { NextFunction, Request, Response } from "express";
import { ApiError } from "./ApiError";

export function errorHandler(
    err: any,
    _req: Request,
    res: Response,
    _next: NextFunction
) {
    if (err instanceof ApiError) {
        return res.status(err.status).json({
            status: err.status,
            title: err.code,
            detail: err.message,
            errors: err.details || null
        });
    }

    const msg = String(err?.message || "");

    // 409 якщо порушено UNIQUE
    if (msg.includes("UNIQUE constraint failed")) {
        return res.status(409).json({
            status: 409,
            title: "UNIQUE_CONSTRAINT",
            detail: "Unique constraint violation"
        });
    }

    // 400 якщо обмеження БД
    if (
        msg.includes("NOT NULL constraint failed") ||
        msg.includes("CHECK constraint failed") ||
        msg.includes("FOREIGN KEY constraint failed")
    ) {
        return res.status(400).json({
            status: 400,
            title: "DB_CONSTRAINT_ERROR",
            detail: msg
        });
    }

    console.error(err);

    return res.status(500).json({
        status: 500,
        title: "INTERNAL_SERVER_ERROR",
        detail: msg || "Internal server error"
    });
}