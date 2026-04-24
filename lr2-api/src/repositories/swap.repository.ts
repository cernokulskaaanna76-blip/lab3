export type SwapStatus = "pending" | "approved" | "rejected";

export interface SwapDto {
    id: number;
    shiftId: number;
    fromUserId: number;
    toUserId: number;
    status: SwapStatus;
    createdAt: string;
}

export interface CreateSwapDto {
    shiftId: number;
    fromUserId: number;
    toUserId: number;
    status: SwapStatus;
}

export interface UpdateSwapDto {
    shiftId: number;
    fromUserId: number;
    toUserId: number;
    status: SwapStatus;
}

export interface PatchSwapDto {
    shiftId?: number;
    fromUserId?: number;
    toUserId?: number;
    status?: SwapStatus;
}