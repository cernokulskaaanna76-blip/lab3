CREATE TABLE IF NOT EXISTS Users (
    id INTEGER PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    createdAt TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS Schedules (
    id INTEGER PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    createdAt TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS Shifts (
    id INTEGER PRIMARY KEY,
    scheduleId INTEGER NOT NULL,
    userId INTEGER NOT NULL,
    date TEXT NOT NULL,
    type TEXT NOT NULL CHECK(type IN ('day', 'night')),
    status TEXT NOT NULL CHECK(status IN ('planned', 'done', 'cancelled')),
    comment TEXT,
    createdAt TEXT NOT NULL,
    FOREIGN KEY (scheduleId) REFERENCES Schedules(id) ON DELETE CASCADE,
    FOREIGN KEY (userId) REFERENCES Users(id) ON DELETE RESTRICT
);

CREATE TABLE IF NOT EXISTS Swaps (
    id INTEGER PRIMARY KEY,
    shiftId INTEGER NOT NULL,
    fromUserId INTEGER NOT NULL,
    toUserId INTEGER NOT NULL,
    status TEXT NOT NULL CHECK(status IN ('pending', 'approved', 'rejected')),
    createdAt TEXT NOT NULL,
    FOREIGN KEY (shiftId) REFERENCES Shifts(id) ON DELETE CASCADE,
    FOREIGN KEY (fromUserId) REFERENCES Users(id) ON DELETE RESTRICT,
    FOREIGN KEY (toUserId) REFERENCES Users(id) ON DELETE RESTRICT
);
