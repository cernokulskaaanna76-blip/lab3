CREATE INDEX IF NOT EXISTS idx_shifts_date ON Shifts(date);
CREATE INDEX IF NOT EXISTS idx_shifts_status ON Shifts(status);
CREATE INDEX IF NOT EXISTS idx_swaps_status ON Swaps(status);
CREATE INDEX IF NOT EXISTS idx_shifts_userId ON Shifts(userId);
CREATE INDEX IF NOT EXISTS idx_shifts_scheduleId ON Shifts(scheduleId);
