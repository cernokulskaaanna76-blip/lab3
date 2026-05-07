import sqlite3 from "sqlite3";
import path from "path";
import fs from "fs";

sqlite3.verbose();

const dataDir = path.join(process.cwd(), "data");
const dbPath = path.join(dataDir, "app.db");

if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
}

//  ОБОВ’ЯЗКОВО export
export const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error("DB error:", err.message);
        process.exit(1);
    }
    console.log("SQLite DB opened:", dbPath);
});

// helper functions
export const run = (sql: string, params: any[] = []) =>
    new Promise<any>((resolve, reject) => {
        db.run(sql, params, function (err) {
            if (err) reject(err);
            else resolve(this);
        });
    });

export const get = <T>(sql: string, params: unknown[] = []) =>
    new Promise<T>((resolve, reject) => {
        db.get(sql, params, (err, row) => {
            if (err) reject(err);
            else resolve(row as T);
        });
    });

export function all<T>(sql: string, params: unknown[] = []) : Promise<T[]> {
    return new Promise<T[]>((resolve, reject) => {
        db.all(sql, params, (err, rows) => {
            if (err) reject(err);
            else resolve(rows as T[]);
        });
    });
}
