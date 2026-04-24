import { initDb } from "./initDb";
import { run } from "./dbClient";
import { logger } from "../utils/logger";
//Він очищає таблиці та додає тестові записи.
async function seed() {
  await initDb();

  const now = new Date().toISOString();

  await run("DELETE FROM Swaps");
  await run("DELETE FROM Shifts");
  await run("DELETE FROM Schedules");
  await run("DELETE FROM Users");

  await run(
    `INSERT INTO Users (name, email, createdAt) VALUES (?, ?, ?)`,
    ["Anna", "anna@test.com", now]
  );
  await run(
    `INSERT INTO Users (name, email, createdAt) VALUES (?, ?, ?)`,
    ["Oleg", "oleg@test.com", now]
  );
  await run(
    `INSERT INTO Users (name, email, createdAt) VALUES (?, ?, ?)`,
    ["Ira", "ira@test.com", now]
  );

  await run(
    `INSERT INTO Schedules (title, description, createdAt) VALUES (?, ?, ?)`,
    ["Main schedule", "Main laboratory schedule", now]
  );
  await run(
    `INSERT INTO Schedules (title, description, createdAt) VALUES (?, ?, ?)`,
    ["Reserve schedule", "Reserve laboratory schedule", now]
  );

  await run(
    `INSERT INTO Shifts (scheduleId, userId, date, type, status, comment, createdAt)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [1, 1, "2026-04-10", "day", "planned", "Morning duty", now]
  );
  await run(
    `INSERT INTO Shifts (scheduleId, userId, date, type, status, comment, createdAt)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [1, 2, "2026-04-11", "night", "done", "Night duty", now]
  );
  await run(
    `INSERT INTO Shifts (scheduleId, userId, date, type, status, comment, createdAt)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [2, 3, "2026-04-12", "day", "cancelled", "Reserve duty", now]
  );

  await run(
    `INSERT INTO Swaps (shiftId, fromUserId, toUserId, status, createdAt)
         VALUES (?, ?, ?, ?, ?)`,
    [1, 1, 2, "pending", now]
  );
  await run(
    `INSERT INTO Swaps (shiftId, fromUserId, toUserId, status, createdAt)
         VALUES (?, ?, ?, ?, ?)`,
    [2, 2, 3, "approved", now]
  );

  logger.info("Seed completed"); // лог завершення наповнення бази тестовими даними
  process.exit(0);
}

seed().catch((err) => {
  logger.error(`Seed failed: ${String(err)}`); //5добре.
  process.exit(1);
});