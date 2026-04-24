import { Router } from "express";
import { shiftController } from "../controllers/shift.controller";

const router = Router();

// отримати всі shifts
router.get("/", shiftController.getAll);

// 8доб. GET shift + user + schedule, endpoint із JOIN, який повертає зв’язані дані з кількох таблиць
router.get("/with-users", shiftController.getAllWithUsers);

// GET небезпечний пошук (SQL injection demo)
router.get("/search-unsafe", shiftController.searchUnsafe);

// GET статистика по shifts (COUNT, SUM)
router.get("/stats/summary", shiftController.getSummaryStats);

// отримати shift по id
router.get("/:id", shiftController.getById);

// створити shift
router.post("/", shiftController.create);

// повне оновлення
router.put("/:id", shiftController.update);

// часткове оновлення
router.patch("/:id", shiftController.patch);

// видалити
router.delete("/:id", shiftController.delete);

export default router;