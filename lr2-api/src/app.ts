import express from "express";
import path from "path";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";

import userRoutes from "./routes/user.routes";
import scheduleRoutes from "./routes/schedule.routes";
import shiftRoutes from "./routes/shift.routes";
import swapRoutes from "./routes/swap.routes";

import { ApiError } from "./utils/ApiError";
import { errorHandler } from "./utils/errorHandler";
import { all } from "./db/dbClient";

const app = express();

app.use(helmet());
app.use(cors());
app.use(morgan("dev")); //5добре. логування всіх HTTP-запитів 
app.use(express.json());

const frontendPath = path.join(__dirname, "../../lab_1");
app.use(express.static(frontendPath));

app.get("/health", (_req, res) => {
    res.status(200).json({ ok: true });
});

// тимчасовий debug endpoint для перевірки міграцій
app.get("/api/debug/migrations", async (_req, res) => {
    try {
        const rows = await all(`
            SELECT id, name, appliedAt
            FROM schema_migrations
            ORDER BY id ASC
        `);

        res.status(200).json({
            items: rows,
            meta: { total: rows.length },
        });
    } catch (error: any) {
        res.status(500).json({
            error: {
                message: error?.message || "Debug query failed",
            },
        });
    }
});

app.use("/api/users", userRoutes);
app.use("/api/schedules", scheduleRoutes);
app.use("/api/shifts", shiftRoutes);
app.use("/api/swaps", swapRoutes);

app.get("/", (_req, res) => {
    res.sendFile(path.join(frontendPath, "index.html"));
});

app.use((_req, _res, next) => {
    next(ApiError.notFound("Route not found"));
});

app.use(errorHandler); //4.добре. підключення глобального обробника помилок

export default app;