let shifts = [];
let users = [];
let schedules = [];
let editingId = null;
let sortAscending = true;

// елементи сторінки
const form = document.getElementById("shiftForm");
const tableBody = document.getElementById("tableBody");
const filterStatus = document.getElementById("filterStatus");
const successMessage = document.getElementById("successMessage");

const dateInput = document.getElementById("dateInput");
const timeSlotSelect = document.getElementById("timeSlotSelect");
const userInput = document.getElementById("userInput");
const commentInput = document.getElementById("commentInput");
const statusSelect = document.getElementById("statusSelect");
const resetBtn = document.getElementById("resetBtn");
const sortDateBtn = document.getElementById("sortDate");

// фільтр
filterStatus.addEventListener("change", render);

// сортування
sortDateBtn.addEventListener("click", () => {
    shifts.sort((a, b) => {
        const dateA = new Date(a.date);
        const dateB = new Date(b.date);
        return sortAscending ? dateA - dateB : dateB - dateA;
    });

    sortAscending = !sortAscending;
    render();
});

// submit
form.addEventListener("submit", async (event) => {
    event.preventDefault();

    const dto = {
        date: dateInput.value,
        timeSlot: timeSlotSelect.value,
        userName: userInput.value.trim(),
        comment: commentInput.value.trim(),
        status: statusSelect.value
    };

    try {
        const userId = await ensureUser(dto.userName);
        const scheduleId = await ensureSchedule();

        const shiftPayload = {
            scheduleId,
            userId,
            date: dto.date,
            type: mapTimeSlotToType(dto.timeSlot),
            status: dto.status,
            comment: dto.comment
        };

        if (editingId === null) {
            await fetch("/api/shifts", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(shiftPayload)
            });
        } else {
            await fetch(`/api/shifts/${editingId}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(shiftPayload)
            });

            editingId = null;
        }

        form.reset();
        await loadData();
        showSuccess("Збережено!");
    } catch (error) {
        alert("Помилка збереження");
    }
});

// reset
resetBtn.addEventListener("click", () => {
    form.reset();
    editingId = null;
});

// delete / edit
tableBody.addEventListener("click", async (event) => {
    const btn = event.target;
    const id = Number(btn.dataset.id);

    if (btn.classList.contains("delete-btn")) {
        await fetch(`/api/shifts/${id}`, {
            method: "DELETE"
        });

        await loadData();
    }

    if (btn.classList.contains("edit-btn")) {
        const shift = shifts.find(x => x.id === id);

        dateInput.value = shift.date;
        timeSlotSelect.value = mapTypeToTimeSlot(shift.type);
        userInput.value = getUserNameById(shift.userId);
        commentInput.value = shift.comment;
        statusSelect.value = shift.status;

        editingId = id;
        window.scrollTo(0, 0);
    }
});

// USERS
async function ensureUser(name) {
    const found = users.find(x =>
        x.name.toLowerCase() === name.toLowerCase()
    );

    if (found) return found.id;

    const response = await fetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            name,
            email: `${name}@mail.com`
        })
    });

    const user = await response.json();
    users.push(user);

    return user.id;
}

// SCHEDULE
async function ensureSchedule() {
    if (schedules.length > 0) return schedules[0].id;

    const response = await fetch("/api/schedules", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            title: "Основний графік",
            description: "Автостворення"
        })
    });

    const schedule = await response.json();
    schedules.push(schedule);

    return schedule.id;
}

// LOAD
async function loadData() {
    const usersRes = await fetch("/api/users");
    const shiftsRes = await fetch("/api/shifts");
    const schedulesRes = await fetch("/api/schedules");

    const usersData = await usersRes.json();
    const shiftsData = await shiftsRes.json();
    const schedulesData = await schedulesRes.json();

    users = usersData.items || usersData;
    shifts = shiftsData.items || shiftsData;
    schedules = schedulesData.items || schedulesData;

    render();
}

// render
function render() {
    let arr = [...shifts];

    if (filterStatus.value) {
        arr = arr.filter(x => x.status === filterStatus.value);
    }

    tableBody.innerHTML = arr.map((s, i) => `
        <tr>
            <td>${i + 1}</td>
            <td>${s.date}</td>
            <td>${mapTypeToTimeSlot(s.type)}</td>
            <td>${getUserNameById(s.userId)}</td>
            <td>${s.status}</td>
            <td>${s.comment}</td>
            <td>
                <button class="edit-btn" data-id="${s.id}">Редагувати</button>
                <button class="delete-btn" data-id="${s.id}">Видалити</button>
            </td>
        </tr>
    `).join("");
}

// FIXED FUNCTIONS
function mapTimeSlotToType(value) {
    if (value === "Morning") return "day";
    if (value === "Day") return "day";
    if (value === "Evening") return "night";
    return "day";
}

function mapTypeToTimeSlot(value) {
    if (value === "day") return "Day";
    if (value === "night") return "Evening";
    return "";
}

function getUserNameById(id) {
    const user = users.find(x => x.id === id);
    return user ? user.name : "";
}

function showSuccess(text) {
    successMessage.textContent = text;

    setTimeout(() => {
        successMessage.textContent = "";
    }, 2000);
}

loadData();