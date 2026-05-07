import express from "express";
import cors from "cors";

import userRoutes from "./routes/user.routes";
import scheduleRoutes from "./routes/schedule.routes";
import shiftRoutes from "./routes/shift.routes";
import swapRoutes from "./routes/swap.routes";

import { errorHandler } from "./utils/errorHandler";

const app = express();

// дозволяє читати JSON body
app.use(express.json());

// CORS для frontend
app.use(cors({
    origin: [
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:5174",
        "http://127.0.0.1:5174",
        "http://localhost:5500",
        "http://127.0.0.1:5500"
    ],
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type"]
}));

// preflight OPTIONS
app.options("*", cors());

// routes API v1
app.use("/api/v1/users", userRoutes);
app.use("/api/v1/schedules", scheduleRoutes);
app.use("/api/v1/shifts", shiftRoutes);
app.use("/api/v1/swaps", swapRoutes);

// тестовий маршрут
app.get("/", (_req, res) => {
    res.json({
        message: "API працює"
    });
});

// централізована обробка помилок
app.use(errorHandler);

export default app;