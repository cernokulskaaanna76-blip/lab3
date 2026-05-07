import { api } from "./apiClient";

import type {
    ShiftDto,
    UserDto,
    ScheduleDto
} from "./dtos";

let shifts: ShiftDto[] = [];
let users: UserDto[] = [];
let schedules: ScheduleDto[] = [];

let editingId: number | null = null;
let sortAscending = true;


// ELEMENTS
const form = document.getElementById("shiftForm") as HTMLFormElement;
const tableBody = document.getElementById("tableBody") as HTMLElement;
const filterStatus = document.getElementById("filterStatus") as HTMLSelectElement;
const successMessage = document.getElementById("successMessage") as HTMLElement;

const dateInput = document.getElementById("dateInput") as HTMLInputElement;
const timeSlotSelect = document.getElementById("timeSlotSelect") as HTMLSelectElement;
const userInput = document.getElementById("userInput") as HTMLSelectElement;
const scheduleSelect = document.getElementById("scheduleSelect") as HTMLSelectElement;
const commentInput = document.getElementById("commentInput") as HTMLTextAreaElement;
const statusSelect = document.getElementById("statusSelect") as HTMLSelectElement;

const resetBtn = document.getElementById("resetBtn") as HTMLButtonElement;
const sortDateBtn = document.getElementById("sortDate") as HTMLButtonElement;

// EVENTS
filterStatus.onchange = render;

sortDateBtn.onclick = () => {
    shifts.sort((a, b) => {
        const d1 = new Date(a.date).getTime();
        const d2 = new Date(b.date).getTime();

        return sortAscending ? d1 - d2 : d2 - d1;
    });

    sortAscending = !sortAscending;
    render();
};

resetBtn.onclick = () => {
    form.reset();
    editingId = null;
    showMessage("");
};

// SUBMIT
form.onsubmit = async (e) => {
    e.preventDefault();

    try {
        if (!dateInput.value) {
            showMessage("Оберіть дату");
            return;
        }

        if (!userInput.value) {
            showMessage("Оберіть користувача");
            return;
        }

        if (commentInput.value.trim().length > 100) {
            showMessage("Забагато тексту");
            return;
        }

        if (
            commentInput.value.trim().length > 0 &&
            commentInput.value.trim().length < 3
        ) {
            showMessage("Замало тексту");
            return;
        }

        showMessage("Завантаження...");

        const dto = {
            scheduleId: Number(scheduleSelect.value),
            userId: Number(userInput.value),
            date: dateInput.value,
            type: timeSlotSelect.value as "day" | "night",
            status: statusSelect.value as
                "planned" | "done" | "cancelled",
            comment: commentInput.value.trim()
        };

        if (editingId === null) {
            await api.createShift(dto);
            showMessage("Успішно додано");
        } else {
            await api.updateShift(editingId, dto);
            editingId = null;
            showMessage("Оновлено");
        }

        form.reset();
        await loadData();

    } catch (err: any) {

        showMessage(
            err?.message ||
            "Помилка збереження"
        );
    }
};


// LOAD DATA
async function loadData() {

    try {
        showMessage("Завантаження...");

        const u: any = await api.getUsers();
        const s: any = await api.getShifts();
        const sc: any = await api.getSchedules();

        users = u.items || u;
        shifts = s.items || s;
        schedules = sc.items || sc;

        fillUsers();
        fillSchedules();
        render();

        if (!shifts.length) {
            showMessage("Немає даних");
        } else {
            showMessage("");
        }

    } catch (err: any) {
        tableBody.innerHTML =
            `<tr><td colspan="6">Помилка завантаження</td></tr>`;

        showMessage(
            err?.message ||
            "Помилка завантаження"
        );
    }
}


// USERS DROPDOWN
function fillUsers() {

    userInput.innerHTML =
        `<option value="">Оберіть користувача</option>` +

        users.map(x => `
            <option value="${x.id}">
                ${x.name}
            </option>
        `).join("") +

        `<option value="new">
            + Додати нового користувача
        </option>`;
}

// USER CHANGE
userInput.onchange = async () => {

    if (userInput.value === "new") {

        const name = prompt(
            "Введіть ім'я нового користувача"
        );

        if (!name || !name.trim()) {
            fillUsers();
            return;
        }

        try {
            const created = await api.createUser({
                name: name.trim(),
                email:
                    name.trim().toLowerCase() +
                    "@mail.com"
            });

            users.push(created);

            fillUsers();

            userInput.value =
                String(created.id);

            showMessage(
                "Успішно додано"
            );

        } catch (err: any) {

            showMessage(
                err?.message ||
                "Помилка збереження"
            );
        }
    }
};

// SCHEDULES

function fillSchedules() {

    scheduleSelect.innerHTML =
        schedules.map(x => `
            <option value="${x.id}">
                ${x.title}
            </option>
        `).join("");
}

// TABLE

function render() {

    let arr = [...shifts];

    if (filterStatus.value) {
        arr = arr.filter(
            x => x.status ===
                filterStatus.value
        );
    }

    if (!arr.length) {
        tableBody.innerHTML =
            `<tr><td colspan="6">
                Немає даних
            </td></tr>`;
        return;
    }

    tableBody.innerHTML = arr.map((x, i) => `
<tr>
<td>${i + 1}</td>
<td>${formatDate(x.date)}</td>
<td>${x.type === "day" ? "День" : "Ніч"}</td>
<td>${getUserName(x.userId)}</td>
<td>${translateStatus(x.status)}</td>

<td>
<button onclick="details(${x.id})">
Деталі
</button>

<button onclick="editItem(${x.id})">
Редагувати
</button>

<button onclick="removeItem(${x.id})">
Видалити
</button>
</td>
</tr>
`).join("");
}


// DETAILS MODAL
(window as any).details =
    async (id: number) => {

        const item =
            await api.getShiftById(id);

        const old =
            document.getElementById(
                "modal"
            );

        if (old) old.remove();

        const modal =
            document.createElement(
                "div"
            );

        modal.id = "modal";

        modal.innerHTML = `
<div style="
position:fixed;
inset:0;
background:rgba(0,0,0,.55);
display:flex;
justify-content:center;
align-items:center;
z-index:999;
">

<div style="
background:white;
width:560px;
max-width:95%;
border-radius:22px;
padding:28px;
box-shadow:0 20px 45px rgba(0,0,0,.25);
">

<h2 style="
margin-top:0;
color:#e25c8a;
text-align:center;
font-size:28px;
">
Деталі зміни
</h2>

<table style="
width:100%;
border-collapse:collapse;
margin-top:18px;
font-size:18px;
">

<tr><td><b>ID</b></td><td>${item.id}</td></tr>
<tr><td><b>Користувач</b></td><td>${getUserName(item.userId)}</td></tr>
<tr>
<td><b>Графік</b></td>
<td>${getScheduleName(item.scheduleId)}</td>
</tr>
<tr><td><b>Дата</b></td><td>${formatDate(item.date)}</td></tr>
<tr><td><b>Тип</b></td><td>${item.type === "day" ? "День" : "Ніч"}</td></tr>
<tr><td><b>Статус</b></td><td>${translateStatus(item.status)}</td></tr>
<tr><td><b>Коментар</b></td><td>${item.comment || "-"}</td></tr>

</table>

<div style="
text-align:center;
margin-top:24px;
">

<button id="closeModal"
style="
padding:14px 28px;
border:none;
border-radius:14px;
background:#e45a84;
color:white;
font-weight:800;
cursor:pointer;
font-size:16px;
">
Закрити
</button>

</div>
</div>
</div>
`;

        document.body
            .appendChild(modal);

        const closeBtn =
            document.getElementById(
                "closeModal"
            ) as HTMLButtonElement;

        closeBtn.onclick = () =>
            modal.remove();
    };


// EDIT
(window as any).editItem =
    (id: number) => {

        const x = shifts.find(
            a => a.id === id
        );

        if (!x) return;

        editingId = id;

        dateInput.value = x.date;
        timeSlotSelect.value = x.type;
        userInput.value =
            String(x.userId);

        scheduleSelect.value =
            String(x.scheduleId);

        commentInput.value =
            x.comment || "";

        statusSelect.value =
            x.status;
    };


// DELETE
(window as any).removeItem =
    async (id: number) => {

        await api.deleteShift(id);
        loadData();
    };


// HELPERS
// HELPERS

function getUserName(
    id: number
) {

    const u =
        users.find(
            x => x.id === id
        );

    return u
        ? u.name
        : "";
}

function getScheduleName(
    id: number
) {

    const s =
        schedules.find(
            x => x.id === id
        );

    return s
        ? s.title
        : "";
}

function translateStatus(
    v: string
) {

    if (v === "planned")
        return "Заплановано";

    if (v === "done")
        return "Підтверджено";

    return "Скасовано";
}

function formatDate(
    v: string
) {

    return new Date(v)
        .toLocaleDateString(
            "uk-UA"
        );
}

// MESSAGE
function showMessage(
    text: string
) {

    successMessage.innerHTML =
        text;

    if (text === "") {
        successMessage.style.display =
            "none";
        return;
    }

    successMessage.style.display =
        "block";

    successMessage.style.padding =
        "18px";

    successMessage.style.marginTop =
        "20px";

    successMessage.style.fontWeight =
        "800";

    successMessage.style.fontSize =
        "24px";

    successMessage.style.textAlign =
        "center";

    successMessage.style.borderRadius =
        "18px";

    if (
        text.includes(
            "Завантаження"
        )
    ) {
        successMessage.style.background =
            "#fff0a5";

        successMessage.style.color =
            "#d41d8c";

        successMessage.style.border =
            "3px solid #d41d8c";
        return;
    }

    if (
        text.includes(
            "Успішно"
        ) ||
        text.includes(
            "Оновлено"
        )
    ) {
        successMessage.style.background =
            "#d7ffd7";

        successMessage.style.color =
            "green";

        successMessage.style.border =
            "3px solid green";
        return;
    }

    if (
        text.includes(
            "Немає"
        )
    ) {
        successMessage.style.background =
            "#bfd0ff";

        successMessage.style.color =
            "#0f46bf";

        successMessage.style.border =
            "3px solid #4477ff";
        return;
    }

    successMessage.style.background =
        "#f5aaaa";

    successMessage.style.color =
        "#700000";

    successMessage.style.border =
        "3px solid red";
}


loadData();