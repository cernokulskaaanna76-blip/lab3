import { runMigrations } from "./runMigrations";
import { db } from "./dbClient"; // або як у тебе підключення
import { logger } from "../utils/logger";

export async function initDb(): Promise<void> {
  await db.exec("PRAGMA foreign_keys = ON;");
  //  УВІМКНЕННЯ FOREIGN KEY В SQLITE

  await runMigrations();
  // запуск міграцій (CREATE TABLE)

  logger.info("DB schema initialized");
}