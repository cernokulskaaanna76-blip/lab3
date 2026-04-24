import fs from "fs";
import path from "path";
import { get, run } from "./dbClient";
import { logger } from "../utils/logger";

// Тут реалізовано механізм міграцій.
// Перевіряються вже виконані міграції і запускаються тільки нові.

function splitSqlStatements(sql: string): string[] {
    return sql
        .split(";")
        .map((part) => part.trim())
        .filter((part) => part.length > 0);
}

export async function runMigrations(): Promise<void> {
    await run("PRAGMA foreign_keys = ON;");//5

    // таблиця для контролю виконаних міграцій 6доб
    await run(`
        CREATE TABLE IF NOT EXISTS schema_migrations ( 
            id INTEGER PRIMARY KEY,
            name TEXT NOT NULL UNIQUE,
            appliedAt TEXT NOT NULL
        );
    `);

    const migrationsDir = path.join(__dirname, "migrations");

    if (!fs.existsSync(migrationsDir)) {
        logger.info("Migrations folder not found");
        return;
    }

    const files = fs
        .readdirSync(migrationsDir)
        .filter((file) => file.endsWith(".sql"))
        .sort();

    for (const file of files) {
        // перевірка чи вже була застосована 6доб
        const existing = await get(
            `SELECT id FROM schema_migrations WHERE name = ?`,
            [file]
        );

        if (existing) continue;

        const filePath = path.join(migrationsDir, file);
        const sql = fs.readFileSync(filePath, "utf8");

        const statements = splitSqlStatements(sql);

        for (const statement of statements) {
            await run(statement);
        }

        // запис у schema_migrations 6доб
        await run(
            `INSERT INTO schema_migrations (name, appliedAt) VALUES (?, ?)`,
            [file, new Date().toISOString()]
        );

        logger.info(`Migration applied: ${file}`); //5добре.
    }
}