export interface ApiError {
    status: number;
    message: string;
    details?: string;
    errors?: Record<string, string[]>;
}

export interface ShiftDto {
    id: number;
    scheduleId: number;
    userId: number;
    date: string;
    type: "day" | "night";
    status: "planned" | "done" | "cancelled";
    comment?: string;
}

export interface CreateShiftDto {
    scheduleId: number;
    userId: number;
    date: string;
    type: "day" | "night";
    comment?: string;
}

export interface UpdateShiftDto {
    scheduleId?: number;
    userId?: number;
    date?: string;
    type?: "day" | "night";
    status?: "planned" | "done" | "cancelled";
    comment?: string;
}

export interface UserDto {
    id: number;
    name: string;
}

export interface ScheduleDto {
    id: number;
    title: string;
}