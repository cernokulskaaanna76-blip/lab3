# README

## Як запустити проєкт

1. Відкрити папку `lr2-api` у VS Code
2. Встановити залежності:

npm install

3. Запустити сервер:

npm run dev

4. Відкрити у браузері:

http://localhost:3000

---

## Де створюється база даних

SQLite база створюється автоматично у файлі:

data/app.db

---

## Приклади запитів

### Отримати всі зміни

curl http://localhost:3000/api/shifts

---

### Отримати зміну по id

curl http://localhost:3000/api/shifts/1

---

### Створити нову зміну

curl -X POST http://localhost:3000/api/shifts ^
-H "Content-Type: application/json" ^
-d "{\"scheduleId\":1,\"userId\":1,\"date\":\"2026-04-25\",\"type\":\"day\",\"status\":\"planned\",\"comment\":\"Нове чергування\"}"

---

### Запит з WHERE + ORDER + LIMIT

curl "http://localhost:3000/api/shifts?status=planned&sort=date&order=desc&pageSize=3"

---

### JOIN запит

curl http://localhost:3000/api/shifts/with-users

---

### Агрегація

curl http://localhost:3000/api/shifts/stats/summary

---

# Схема БД

## Таблиці

### Users
- id (PK)
- name
- email UNIQUE
- createdAt

### Schedules
- id (PK)
- title
- description
- createdAt

### Shifts
- id (PK)
- scheduleId (FK)
- userId (FK)
- date
- type
- status
- comment
- createdAt

### Swaps
- id (PK)
- shiftId (FK)
- fromUserId (FK)
- toUserId (FK)
- status
- createdAt

---

## Зв’язки

- Users (1) → (M) Shifts
- Schedules (1) → (M) Shifts
- Shifts (1) → (M) Swaps

---

## Обмеження

### NOT NULL
Обов’язкові поля в таблицях.

### UNIQUE
Поле email у таблиці Users.

### CHECK

Для Shifts:

type IN ('day', 'night')

status IN ('planned', 'done', 'cancelled')

Для Swaps:

status IN ('pending', 'approved', 'rejected')

---

## Додатково реалізовано

- CRUD для основної сутності Shifts
- JOIN endpoint
- Агрегація COUNT / SUM
- Фільтрація
- Сортування
- SQL Injection demo
- DTO
- Обробка помилок 400 / 404 / 409