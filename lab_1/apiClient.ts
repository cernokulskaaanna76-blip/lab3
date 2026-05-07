import { API_BASE_URL } from "./config.js";

// DTO типи для TypeScript
import type {
    ApiError,
    ShiftDto,
    CreateShiftDto,
    UpdateShiftDto,
    UserDto,
    ScheduleDto
} from "./dtos";

// =========================
// Універсальний fetch

// Через нього проходять всі API-запити
// Тут:
// - timeout
// - CORS/network errors
// - HTTP errors
// - JSON parsing
async function request<T>(
    path: string,
    options: RequestInit = {}
): Promise<T> {

    // AbortController для timeout
    const controller = new AbortController();

    // Автоматичне скасування через 10 секунд
    const timeoutId = setTimeout(() => {
        controller.abort();
    }, 10000);

    try {

        // fetch до backend API
        const response = await fetch(
            `${API_BASE_URL}${path}`,
            {
                ...options,
                signal: controller.signal
            }
        );

        // 204 No Content
        if (response.status === 204) {
            return null as T;
        }

        // Читаємо як text
        // Це безпечніше ніж одразу json()
        const rawText = await response.text();

        // HTTP error handling
        if (!response.ok) {

            let payload: any = null;

            try {
                payload = rawText ? JSON.parse(rawText) : null;
            } catch { }

            const err: ApiError = {
                status: response.status,
                message:
                    payload?.message ||
                    payload?.title ||
                    "HTTP error",
                details:
                    payload?.detail ||
                    rawText
            };

            throw err;
        }

        // Порожня відповідь
        if (!rawText) {
            return null as T;
        }

        // Парсимо JSON
        return JSON.parse(rawText) as T;

    } catch (e: any) {

        // Timeout
        if (e.name === "AbortError") {

            throw {
                status: 0,
                message: "Timeout",
                details: "Request timeout"
            } as ApiError;
        }

        // Backend off / CORS / network error
        throw {
            status: 0,
            message: "Помилка мережі або CORS",
            details: e?.message || String(e)
        } as ApiError;

    } finally {

        // Очищення timeout
        clearTimeout(timeoutId);
    }
}

// =========================
// API methods

// app.ts працює через цей object
export const api = {

    // =========================
    // SHIFTS


    // GET список
    async getShifts() {
        return await request<ShiftDto[]>("/shifts");
    },

    // GET один запис
    async getShiftById(id: number) {
        return await request<ShiftDto>(`/shifts/${id}`);
    },

    // POST створення
    async createShift(dto: CreateShiftDto) {

        return await request<ShiftDto>("/shifts", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(dto)
        });
    },

    // PUT оновлення
    async updateShift(
        id: number,
        dto: UpdateShiftDto
    ) {

        return await request<ShiftDto>(`/shifts/${id}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(dto)
        });
    },

    // DELETE видалення
    async deleteShift(id: number) {

        return await request<void>(`/shifts/${id}`, {
            method: "DELETE"
        });
    },


    // USERS

    // GET users
    async getUsers() {
        return await request<UserDto[]>("/users");
    },

    // POST user
    async createUser(dto: {
        name: string;
        email: string;
    }) {

        return await request<UserDto>("/users", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(dto)
        });
    },


    // SCHEDULES
    // GET schedules
    async getSchedules() {
        return await request<ScheduleDto[]>("/schedules");
    }
};