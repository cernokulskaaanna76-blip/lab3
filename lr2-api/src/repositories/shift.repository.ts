import { all, get, run } from "../db/dbClient";
import {
    CreateShiftDto,
    PatchShiftDto,
    UpdateShiftDto,
} from "../dto/shift.dto";

class ShiftRepository {
    async getAll(query: any) {
        let sql = `SELECT * FROM Shifts WHERE 1=1`;
        const params: any[] = [];

        if (query.status) { //9
            sql += ` AND status = ?`;
            params.push(query.status);
        }

        const sort = query.sort || "id";
        const order = query.order === "asc" ? "ASC" : "DESC";

        sql += ` ORDER BY ${sort} ${order}`;

        const page = Number(query.page) || 1;
        const pageSize = Number(query.pageSize) || 10;
        const offset = (page - 1) * pageSize;

        sql += ` LIMIT ? OFFSET ?`;
        params.push(pageSize, offset);

        return all(sql, params);
    }

    // JOIN 8доб
    async getAllWithUsers() {
        const sql = `
            SELECT s.*, u.name as userName, sc.title as scheduleTitle
            FROM Shifts s
            JOIN Users u ON u.id = s.userId
            JOIN Schedules sc ON sc.id = s.scheduleId
        `;
        return all(sql);
    }

    // АГРЕГАЦІЯ
    async getSummaryStats() {
        return get(`
            SELECT
                COUNT(*) as total,
                SUM(CASE WHEN status = 'planned' THEN 1 ELSE 0 END) as plannedCount,
                SUM(CASE WHEN status = 'done' THEN 1 ELSE 0 END) as doneCount,
                SUM(CASE WHEN status = 'cancelled' THEN 1 ELSE 0 END) as cancelledCount
            FROM Shifts
        `);
    }

    // SQL INJECTION DEMO (НЕБЕЗПЕЧНО)
    async searchUnsafe(comment: string) {
        const sql = `
            SELECT * FROM Shifts
            WHERE comment LIKE '%${comment}%'
        `;
        return all(sql);
    }

    async getById(id: number) {
        return get(`SELECT * FROM Shifts WHERE id = ?`, [id]);
    }

    async create(dto: CreateShiftDto) {
        const result = await run(
            `INSERT INTO Shifts (scheduleId, userId, date, type, status, comment, createdAt)
             VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [
                dto.scheduleId,
                dto.userId,
                dto.date,
                dto.type,
                dto.status,
                dto.comment ?? null,
                new Date().toISOString() //  ДОДАНО createdAt
            ]
        );

        return this.getById(result.lastID);
    }

    async update(id: number, dto: UpdateShiftDto) {
        const result = await run(
            `UPDATE Shifts SET scheduleId=?, userId=?, date=?, type=?, status=?, comment=? WHERE id=?`,
            [
                dto.scheduleId,
                dto.userId,
                dto.date,
                dto.type,
                dto.status,
                dto.comment ?? null,
                id,
            ]
        );

        if (result.changes === 0) return null;

        return this.getById(id);
    }

    async patch(id: number, dto: PatchShiftDto) {
        const current = await this.getById(id);
        if (!current) return null;

        await run(
            `UPDATE Shifts SET scheduleId=?, userId=?, date=?, type=?, status=?, comment=? WHERE id=?`,
            [
                dto.scheduleId ?? current.scheduleId,
                dto.userId ?? current.userId,
                dto.date ?? current.date,
                dto.type ?? current.type,
                dto.status ?? current.status,
                dto.comment ?? current.comment,
                id,
            ]
        );

        return this.getById(id);
    }

    async assignUser(id: number, userId: number) {
        const result = await run(
            `UPDATE Shifts SET userId=? WHERE id=?`,
            [userId, id]
        );
        return result.changes > 0;
    }

    async delete(id: number) {
        const result = await run(`DELETE FROM Shifts WHERE id=?`, [id]);
        return result.changes > 0;
    }
}

// ВАЖЛИВО — правильний export
export const shiftRepository = new ShiftRepository();