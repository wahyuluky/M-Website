const produkToggle = document.getElementById("produkToggle");
    const produkGroup = produkToggle.closest(".nav-group");
    const submenuLinks = document.querySelectorAll(".submenu-link");

    // Buka atau tutup submenu Produk
    produkToggle.addEventListener("click", () => {
        produkGroup.classList.toggle("open");
    });


const reportData = [
    {
        id: 1,
        name: "Andi Pratama",
        role: "Business Development",
        date: "2026-10-05",
        target: 90,
        commitment: 8,
        activities: 24,
        achievements: 5
    },
    {
        id: 2,
        name: "Siti Rahma",
        role: "Marketing",
        date: "2026-10-08",
        target: 75,
        commitment: 7,
        activities: 20,
        achievements: 4
    },
    {
        id: 3,
        name: "Budi Santoso",
        role: "Sales",
        date: "2026-10-10",
        target: 55,
        commitment: 5,
        activities: 15,
        achievements: 2
    },
    {
        id: 4,
        name: "Dina Permata",
        role: "Business Development",
        date: "2026-10-12",
        target: 100,
        commitment: 9,
        activities: 28,
        achievements: 6
    },
    {
        id: 5,
        name: "Rizky Firmansyah",
        role: "Marketing",
        date: "2026-09-25",
        target: 65,
        commitment: 6,
        activities: 18,
        achievements: 3
    }
];

const startDateInput = document.getElementById("startDate");
const endDateInput = document.getElementById("endDate");
const employeeFilter = document.getElementById("employeeFilter");
const searchInput = document.getElementById("searchInput");
const applyFilterBtn = document.getElementById("applyFilter");
const resetFilterBtn = document.getElementById("resetFilter");
const printBtn = document.getElementById("printBtn");
const filterMessage = document.getElementById("filterMessage");

const reportTableBody = document.getElementById("reportTableBody");
const emptyState = document.getElementById("emptyState");

// Menggunakan tanggal lokal agar tidak bergeser karena zona waktu.
function getLocalDateString(date = new Date()) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
}

function getMonthStart(date = new Date()) {
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-01`;
}

function formatDate(dateString) {
    if (!dateString) return "-";

    const [year, month, day] = dateString.split("-");
    const date = new Date(Number(year), Number(month) - 1, Number(day));

    return date.toLocaleDateString("id-ID", {
        day: "2-digit",
        month: "short",
        year: "numeric"
    });
}

function escapeHTML(value) {
    return String(value).replace(/[&<>"']/g, character => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;"
    })[character]);
}

// Isi pilihan karyawan dari data yang tersedia.
function populateEmployeeFilter() {
    const employees = [...new Set(reportData.map(employee => employee.name))];

    employees.forEach(name => {
        const option = document.createElement("option");
        option.value = name;
        option.textContent = name;
        employeeFilter.appendChild(option);
    });
}

function getPerformanceStatus(target) {
    if (target >= 80) {
        return {
            label: "Baik",
            className: "good"
        };
    }

    if (target >= 60) {
        return {
            label: "Perlu Evaluasi",
            className: "medium"
        };
    }

    return {
        label: "Perlu Perhatian",
        className: "low"
    };
}

function getFilteredData() {
    const startDate = startDateInput.value;
    const endDate = endDateInput.value;
    const selectedEmployee = employeeFilter.value;
    const keyword = searchInput.value.trim().toLowerCase();

    return reportData.filter(employee => {
        const matchesStart = !startDate || employee.date >= startDate;
        const matchesEnd = !endDate || employee.date <= endDate;

        const matchesEmployee =
            !selectedEmployee || employee.name === selectedEmployee;

        const matchesSearch =
            employee.name.toLowerCase().includes(keyword) ||
            employee.role.toLowerCase().includes(keyword);

        return (
            matchesStart &&
            matchesEnd &&
            matchesEmployee &&
            matchesSearch
        );
    });
}

function updatePeriodLabel() {
    const startDate = startDateInput.value;
    const endDate = endDateInput.value;

    let label = "Semua periode";

    if (startDate && endDate) {
        label = `${formatDate(startDate)} – ${formatDate(endDate)}`;
    } else if (startDate) {
        label = `Mulai ${formatDate(startDate)}`;
    } else if (endDate) {
        label = `Sampai ${formatDate(endDate)}`;
    }

    document.getElementById("periodLabel").textContent =
        `Periode: ${label}`;
}

function updateSummary(data) {
    const totalEmployees = data.length;

    const averageTarget = totalEmployees
        ? Math.round(
            data.reduce((sum, employee) => sum + employee.target, 0) /
            totalEmployees
        )
        : 0;

    const totalActivities = data.reduce(
        (sum, employee) => sum + employee.activities,
        0
    );

    const totalAchievements = data.reduce(
        (sum, employee) => sum + employee.achievements,
        0
    );

    document.getElementById("totalEmployees").textContent = totalEmployees;
    document.getElementById("averageTarget").textContent = `${averageTarget}%`;
    document.getElementById("totalActivities").textContent = totalActivities;
    document.getElementById("totalAchievements").textContent = totalAchievements;

    document.getElementById("resultCount").textContent =
        `${totalEmployees} karyawan`;

    document.getElementById("tableSummary").textContent =
        `Menampilkan ${totalEmployees} karyawan`;
}

function renderTable(data) {
    reportTableBody.innerHTML = data.map(employee => {
        const status = getPerformanceStatus(employee.target);
        const progressWidth = Math.min(
            100,
            Math.max(0, employee.target)
        );

        return `
            <tr>
                <td>
                    <span class="employee-name">
                        ${escapeHTML(employee.name)}
                    </span>
                    <span class="employee-role">
                        ${escapeHTML(employee.role)}
                    </span>
                </td>

                <td>
                    <div class="progress-info">
                        <strong>${employee.target}%</strong>
                    </div>
                    <div class="progress-track">
                        <div
                            class="progress-bar"
                            style="width: ${progressWidth}%"
                        ></div>
                    </div>
                </td>

                <td>${employee.commitment}</td>
                <td>${employee.activities}</td>
                <td>${employee.achievements}</td>

                <td>
                    <span class="status ${status.className}">
                        ${status.label}
                    </span>
                </td>
            </tr>
        `;
    }).join("");

    emptyState.hidden = data.length > 0;
}

function renderReport() {
    const data = getFilteredData();

    updateSummary(data);
    updatePeriodLabel();
    renderTable(data);
}

function validateDates() {
    const startDate = startDateInput.value;
    const endDate = endDateInput.value;

    if (startDate && endDate && startDate > endDate) {
        filterMessage.textContent =
            "Tanggal mulai tidak boleh melewati tanggal selesai.";
        return false;
    }

    filterMessage.textContent = "";
    return true;
}

applyFilterBtn.addEventListener("click", () => {
    if (!validateDates()) return;
    renderReport();
});

resetFilterBtn.addEventListener("click", () => {
    startDateInput.value = getMonthStart();
    endDateInput.value = getLocalDateString();
    employeeFilter.value = "";
    searchInput.value = "";
    filterMessage.textContent = "";

    renderReport();
});

searchInput.addEventListener("input", () => {
    if (validateDates()) renderReport();
});

employeeFilter.addEventListener("change", () => {
    if (validateDates()) renderReport();
});

printBtn.addEventListener("click", () => {
    if (!validateDates()) return;

    // Pastikan laporan yang dicetak mengikuti filter terakhir.
    renderReport();
    window.print();
});

// Inisialisasi halaman.
populateEmployeeFilter();

startDateInput.value = getMonthStart();
endDateInput.value = getLocalDateString();

renderReport();
