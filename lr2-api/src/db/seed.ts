import { initDb } from "./initDb";
import { run } from "./dbClient";
import { logger } from "../utils/logger";

// Наповнення бази тестовими даними
async function seed() {

  // Ініціалізація БД
  await initDb();

  const now = new Date().toISOString();

  // Очищення таблиць
  await run("DELETE FROM Swaps");
  await run("DELETE FROM Shifts");
  await run("DELETE FROM Schedules");
  await run("DELETE FROM Users");

  // =========================
  // USERS
  // =========================

  await run(
    `INSERT INTO Users (name, email, createdAt)
     VALUES (?, ?, ?)`,
    ["Анна", "anna@test.com", now]
  );

  await run(
    `INSERT INTO Users (name, email, createdAt)
     VALUES (?, ?, ?)`,
    ["Олег", "oleg@test.com", now]
  );

  await run(
    `INSERT INTO Users (name, email, createdAt)
     VALUES (?, ?, ?)`,
    ["Іра", "ira@test.com", now]
  );

  // =========================
  // SCHEDULES
  // =========================

  await run(
    `INSERT INTO Schedules
     (title, description, createdAt)
     VALUES (?, ?, ?)`,
    [
      "Основний графік",
      "Основний лабораторний графік",
      now
    ]
  );

  await run(
    `INSERT INTO Schedules
     (title, description, createdAt)
     VALUES (?, ?, ?)`,
    [
      "Резервний графік",
      "Резервний лабораторний графік",
      now
    ]
  );

  // =========================
  // SHIFTS
  // =========================

  await run(
    `INSERT INTO Shifts
     (
       scheduleId,
       userId,
       date,
       type,
       status,
       comment,
       createdAt
     )
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [
      1,
      1,
      "2026-04-10",
      "day",
      "planned",
      "Ранкове чергування",
      now
    ]
  );

  await run(
    `INSERT INTO Shifts
     (
       scheduleId,
       userId,
       date,
       type,
       status,
       comment,
       createdAt
     )
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [
      1,
      2,
      "2026-04-11",
      "night",
      "done",
      "Нічне чергування",
      now
    ]
  );

  await run(
    `INSERT INTO Shifts
     (
       scheduleId,
       userId,
       date,
       type,
       status,
       comment,
       createdAt
     )
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [
      2,
      3,
      "2026-04-12",
      "day",
      "cancelled",
      "Резервне чергування",
      now
    ]
  );

  // =========================
  // SWAPS
  // =========================

  await run(
    `INSERT INTO Swaps
     (
       shiftId,
       fromUserId,
       toUserId,
       status,
       createdAt
     )
     VALUES (?, ?, ?, ?, ?)`,
    [
      1,
      1,
      2,
      "pending",
      now
    ]
  );

  await run(
    `INSERT INTO Swaps
     (
       shiftId,
       fromUserId,
       toUserId,
       status,
       createdAt
     )
     VALUES (?, ?, ?, ?, ?)`,
    [
      2,
      2,
      3,
      "approved",
      now
    ]
  );

  // Лог успішного seed
  logger.info(
    "Seed completed"
  );

  process.exit(0);
}

// Обробка помилок
seed().catch((err) => {

  logger.error(
    `Seed failed: ${String(err)}`
  );

  process.exit(1);
});