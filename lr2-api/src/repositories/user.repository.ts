import { all, get, run } from "../db/dbClient";
import { CreateUserDto, PatchUserDto, UpdateUserDto, UserDto } from "../dto/user.dto";

class UserRepository {
    async getAll(query: any = {}): Promise<UserDto[]> {
        let sql = `SELECT id, name, email, createdAt FROM Users WHERE 1=1`;
        const params: any[] = [];

        if (query.search) {
            sql += ` AND (name LIKE ? OR email LIKE ?)`;
            params.push(`%${query.search}%`, `%${query.search}%`);
        }

        const allowedSort = ["id", "name", "email", "createdAt"];
        const sort = allowedSort.includes(query.sort) ? query.sort : "id";
        const order = query.order === "asc" ? "ASC" : "DESC";

        sql += ` ORDER BY ${sort} ${order}`;

        return all(sql, params);
    }

    async getById(id: number): Promise<UserDto | undefined> {
        return get(
            `SELECT id, name, email, createdAt FROM Users WHERE id = ?`,
            [id]
        );
    }

    async create(dto: CreateUserDto): Promise<UserDto | undefined> {
        const now = new Date().toISOString();

        const result = await run(
            `INSERT INTO Users (name, email, createdAt) VALUES (?, ?, ?)`,
            [dto.name, dto.email, now]
        );

        return this.getById(result.lastID);
    }

    async update(id: number, dto: UpdateUserDto): Promise<UserDto | null> {
        const result = await run(
            `UPDATE Users SET name = ?, email = ? WHERE id = ?`,
            [dto.name, dto.email, id]
        );

        if (result.changes === 0) {
            return null;
        }

        return (await this.getById(id)) || null;
    }

    async patch(id: number, dto: PatchUserDto): Promise<UserDto | null> {
        const current = await this.getById(id);

        if (!current) {
            return null;
        }

        const updatedName = dto.name ?? current.name;
        const updatedEmail = dto.email ?? current.email;

        await run(
            `UPDATE Users SET name = ?, email = ? WHERE id = ?`,
            [updatedName, updatedEmail, id]
        );

        return (await this.getById(id)) || null;
    }

    async delete(id: number): Promise<boolean> {
        const result = await run(`DELETE FROM Users WHERE id = ?`, [id]);
        return result.changes > 0;
    }
}

export const userRepository = new UserRepository();