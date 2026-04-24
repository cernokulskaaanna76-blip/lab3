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
            error: {
                code: err.code,
                message: err.message,
                details: err.details,
            },
        });
    }

    const msg = String(err?.message || "");
    // 409 якщо порушено UNIQUE
    if (msg.includes("UNIQUE constraint failed")) {//11
        return res.status(409).json({
            error: {
                code: "UNIQUE_CONSTRAINT",
                message: "Unique constraint violation",
                details: msg,
            },
        });
    }
//11
    if (
        msg.includes("NOT NULL constraint failed") || // 400 якщо обов'язкове поле пусте
        msg.includes("CHECK constraint failed") || // 400 якщо не пройшов CHECK
        msg.includes("FOREIGN KEY constraint failed")
    ) {
        return res.status(400).json({
            error: {
                code: "DB_CONSTRAINT_ERROR",
                message: "Database constraint error",
                details: msg,
            },
        });
    }

    console.error(err);

    return res.status(500).json({
        error: {
            code: "INTERNAL_SERVER_ERROR",
            message: "Internal server error",
            details: msg || null,
        },
    });
}