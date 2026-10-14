const produkToggle = document.getElementById("produkToggle");
    const produkGroup = produkToggle.closest(".nav-group");
    const submenuLinks = document.querySelectorAll(".submenu-link");

    // Buka atau tutup submenu Produk
    produkToggle.addEventListener("click", () => {
        produkGroup.classList.toggle("open");
    });

    // Pilih Data Bank atau Data Produk
    submenuLinks.forEach((link) => {
        link.addEventListener("click", (event) => {
            event.preventDefault();

            // Mengubah menu aktif
            submenuLinks.forEach((item) => {
                item.classList.remove("active");
            });

            link.classList.add("active");

            const selectedPage = link.dataset.page;

            if (selectedPage === "bank") {
                renderBankChart();
            } else if (selectedPage === "produk") {
                renderProductChart();
            }
        });
    });
    
const today = () => {
    const date = new Date();
    date.setMinutes(date.getMinutes() - date.getTimezoneOffset());
    return date.toISOString().slice(0, 10);
};

let achievements = [
    {
        id: 1,
        employee: "Andi Pratama",
        title: "Mendapatkan mitra bisnis baru",
        category: "Kerja Sama",
        date: today(),
        value: 3,
        unit: "mitra",
        status: "verified",
        description: "Berhasil menjalin komunikasi dengan tiga mitra potensial.",
        evidence: ""
    },
    {
        id: 2,
        employee: "Siti Rahma",
        title: "Mencapai penjualan mingguan",
        category: "Penjualan",
        date: today(),
        value: 12,
        unit: "transaksi",
        status: "pending",
        description: "Mencatat 12 transaksi penjualan pada periode mingguan.",
        evidence: ""
    },
    {
        id: 3,
        employee: "Budi Santoso",
        title: "Menyelesaikan laporan analisis",
        category: "Administrasi",
        date: today(),
        value: 4,
        unit: "laporan",
        status: "verified",
        description: "Menyelesaikan empat laporan analisis untuk evaluasi internal.",
        evidence: ""
    }
];

let editingId = null;

const labels = {
    verified: "Terverifikasi",
    pending: "Menunggu Verifikasi",
    revision: "Perlu Perbaikan"
};

function safe(value) {
    return String(value ?? "").replace(/[&<>"']/g, char => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;"
    })[char]);
}

function formatDate(value) {
    if (!value) return "-";

    return new Date(value + "T00:00:00").toLocaleDateString("id-ID", {
        day: "2-digit",
        month: "short",
        year: "numeric"
    });
}

function render() {
    const keyword = document.getElementById("search")
        .value.toLowerCase().trim();

    const status = document.getElementById("filterStatus").value;

    const data = achievements.filter(item => {
        const matchText =
            item.employee.toLowerCase().includes(keyword) ||
            item.title.toLowerCase().includes(keyword) ||
            item.category.toLowerCase().includes(keyword);

        const matchStatus =
            status === "all" || item.status === status;

        return matchText && matchStatus;
    });

    document.getElementById("count").textContent =
        data.length + " pencapaian";

    const body = document.getElementById("tableBody");

    if (data.length === 0) {
        body.innerHTML = `
            <tr>
                <td colspan="7" class="empty">
                    Tidak ada pencapaian yang ditemukan.
                </td>
            </tr>
        `;
    } else {
        body.innerHTML = data.map(item => `
            <tr>
                <td>${safe(item.employee)}</td>
                <td>
                    <strong>${safe(item.title)}</strong><br>
                    <small>${safe(item.description)}</small>
                </td>
                <td>${safe(item.category)}</td>
                <td>${formatDate(item.date)}</td>
                <td>${Number(item.value || 0).toLocaleString("id-ID")}
                    ${safe(item.unit)}</td>
                <td>
                    <span class="status ${item.status}">
                        ${labels[item.status]}
                    </span>
                </td>
                <td>
                    <button class="action-btn"
                        onclick="viewItem(${item.id})">Detail</button>
                    <button class="action-btn"
                        onclick="editItem(${item.id})">Edit</button>
                    <button class="action-btn"
                        onclick="deleteItem(${item.id})">Hapus</button>
                </td>
            </tr>
        `).join("");
    }

    document.getElementById("total").textContent = data.length;

    document.getElementById("verified").textContent =
        data.filter(item => item.status === "verified").length;

    document.getElementById("pending").textContent =
        data.filter(item => item.status === "pending").length;

    document.getElementById("totalValue").textContent =
        data.reduce((sum, item) => sum + Number(item.value || 0), 0)
            .toLocaleString("id-ID");
}

function openForm() {
    editingId = null;

    document.getElementById("achievementForm").reset();
    document.getElementById("formTitle").textContent =
        "Tambah Pencapaian";
    document.getElementById("date").value = today();

    document.getElementById("modal").classList.add("show");
}

function closeForm() {
    document.getElementById("modal").classList.remove("show");
}

function save(event) {
    event.preventDefault();

    const item = {
        employee: document.getElementById("employee").value.trim(),
        title: document.getElementById("title").value.trim(),
        category: document.getElementById("category").value,
        date: document.getElementById("date").value,
        value: Number(document.getElementById("value").value || 0),
        unit: document.getElementById("unit").value.trim(),
        status: document.getElementById("status").value,
        description: document.getElementById("description").value.trim(),
        evidence: document.getElementById("evidence").value.trim()
    };

    if (editingId !== null) {
        const index = achievements.findIndex(x => x.id === editingId);

        if (index !== -1) {
            achievements[index] = {
                ...achievements[index],
                ...item
            };
        }
    } else {
        achievements.push({
            id: Date.now(),
            ...item
        });
    }

    closeForm();
    render();
}

function editItem(id) {
    const item = achievements.find(x => x.id === id);
    if (!item) return;

    editingId = id;

    document.getElementById("formTitle").textContent =
        "Edit Pencapaian";
    document.getElementById("employee").value = item.employee;
    document.getElementById("title").value = item.title;
    document.getElementById("category").value = item.category;
    document.getElementById("date").value = item.date;
    document.getElementById("value").value = item.value;
    document.getElementById("unit").value = item.unit;
    document.getElementById("status").value = item.status;
    document.getElementById("description").value = item.description;
    document.getElementById("evidence").value = item.evidence || "";

    document.getElementById("modal").classList.add("show");
}

function viewItem(id) {
    const item = achievements.find(x => x.id === id);
    if (!item) return;

    let detail =
        "PENCAPAIAN KARYAWAN\n\n" +
        "Nama: " + item.employee + "\n" +
        "Pencapaian: " + item.title + "\n" +
        "Kategori: " + item.category + "\n" +
        "Tanggal: " + formatDate(item.date) + "\n" +
        "Nilai: " + item.value + " " + item.unit + "\n" +
        "Status: " + labels[item.status] + "\n" +
        "Deskripsi: " + item.description;

    if (item.evidence) {
        detail += "\nBukti: " + item.evidence;
    }

    alert(detail);
}

function deleteItem(id) {
    const item = achievements.find(x => x.id === id);
    if (!item) return;

    if (confirm("Hapus pencapaian " + item.title + "?")) {
        achievements = achievements.filter(x => x.id !== id);
        render();
    }
}

function resetFilter() {
    document.getElementById("search").value = "";
    document.getElementById("filterStatus").value = "all";
    render();
}

document.getElementById("modal").addEventListener("click", event => {
    if (event.target.id === "modal") closeForm();
});

document.addEventListener("keydown", event => {
    if (event.key === "Escape") closeForm();
});

render();
