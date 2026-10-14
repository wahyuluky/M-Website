
const STORAGE_KEY = "dashboardBisnisDataProdukV1";

const monthNames = [
    "Januari", "Februari", "Maret", "April",
    "Mei", "Juni", "Juli", "Agustus",
    "September", "Oktober", "November", "Desember"
];

// Data simulasi awal
const demoData = [
    {
        id: "produk-1",
        name: "Kredit Usaha Rakyat 2015",
        month: 1,
        year: 2026,
        vol: 3545080000000,
        ijp: 121512460000
    },
    {
        id: "produk-2",
        name: "Kredit FLPP",
        month: 1,
        year: 2026,
        vol: 371370000000,
        ijp: 1005900000
    },
    {
        id: "produk-3",
        name: "Kredit Program Perumahan",
        month: 2,
        year: 2026,
        vol: 155600000000,
        ijp: 6630820000
    },
    {
        id: "produk-4",
        name: "Kredit Kontra Bank Garansi",
        month: 2,
        year: 2026,
        vol: 26950000000,
        ijp: 217160000
    },
    {
        id: "produk-5",
        name: "Kredit Usaha Alsintan",
        month: 3,
        year: 2026,
        vol: 11030000000,
        ijp: 361840000
    },
    {
        id: "produk-6",
        name: "Surety Bond",
        month: 3,
        year: 2026,
        vol: 6100000000,
        ijp: 26090000
    },
    {
        id: "produk-7",
        name: "Kredit Mikro",
        month: 4,
        year: 2026,
        vol: 5500000000,
        ijp: 75150000
    },
    {
        id: "produk-8",
        name: "Kredit Subsidi Resi Gudang",
        month: 4,
        year: 2026,
        vol: 2330000000,
        ijp: 290820000
    }
];

// Ambil data dari localStorage
function loadData() {
    try {
        const saved = localStorage.getItem(STORAGE_KEY);
        return saved ? JSON.parse(saved) : demoData;
    } catch (error) {
        return demoData;
    }
}

let productData = loadData();

const $ = (id) => document.getElementById(id);

const form = $("productForm");
const modalBackdrop = $("modalBackdrop");
const toast = $("toast");

// Simpan data ke browser
function saveData() {
    localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(productData)
    );
}

// Format nominal Rupiah
function formatRupiah(value) {
    return new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR",
        maximumFractionDigits: 0
    }).format(value || 0);
}

// Format ringkasan angka besar
function formatCompactRupiah(value) {
    const abs = Math.abs(value);

    if (abs >= 1e12) {
        return "Rp" +
            (value / 1e12).toLocaleString("id-ID", {
                maximumFractionDigits: 2
            }) + " T";
    }

    if (abs >= 1e9) {
        return "Rp" +
            (value / 1e9).toLocaleString("id-ID", {
                maximumFractionDigits: 2
            }) + " M";
    }

    if (abs >= 1e6) {
        return "Rp" +
            (value / 1e6).toLocaleString("id-ID", {
                maximumFractionDigits: 2
            }) + " jt";
    }

    return formatRupiah(value);
}

// Pencarian dan filter data
function getFilteredData() {
    const keyword = $("searchInput")
        .value.trim().toLocaleLowerCase("id-ID");

    const month = $("monthFilter").value;
    const year = $("yearFilter").value;

    return productData
        .filter((item) => {
            const matchesName = item.name
                .toLocaleLowerCase("id-ID")
                .includes(keyword);

            const matchesMonth =
                !month || String(item.month) === month;

            const matchesYear =
                !year || String(item.year) === year;

            return matchesName && matchesMonth && matchesYear;
        })
        .sort((a, b) =>
            b.year - a.year ||
            b.month - a.month ||
            a.name.localeCompare(b.name, "id")
        );
}

// Menampilkan data pada tabel
function renderTable() {
    const rows = getFilteredData();
    const tbody = $("productTableBody");

    tbody.innerHTML = "";
    $("emptyState").hidden = rows.length !== 0;

    rows.forEach((item, index) => {
        const tr = document.createElement("tr");

        tr.innerHTML = `
            <td>${index + 1}</td>

            <td>
                <div class="bank-cell">
                    <span class="bank-avatar">
                        <i class="bx bx-box"></i>
                    </span>
                    <span class="product-name"></span>
                </div>
            </td>

            <td>
                <span class="period-badge">
                    ${monthNames[item.month - 1]} ${item.year}
                </span>
            </td>

            <td class="number">
                ${formatRupiah(item.vol)}
            </td>

            <td class="number">
                ${formatRupiah(item.ijp)}
            </td>

            <td>
                <div class="action-buttons">
                    <button
                        class="icon-btn edit"
                        data-action="edit"
                        data-id="${item.id}"
                        title="Edit"
                        aria-label="Edit data">
                        <i class="bx bx-edit-alt"></i>
                    </button>

                    <button
                        class="icon-btn delete"
                        data-action="delete"
                        data-id="${item.id}"
                        title="Hapus"
                        aria-label="Hapus data">
                        <i class="bx bx-trash"></i>
                    </button>
                </div>
            </td>
        `;

        // Menampilkan nama sebagai teks
        tr.querySelector(".product-name").textContent = item.name;

        tbody.appendChild(tr);
    });

    $("tableCount").textContent =
        `Menampilkan ${rows.length} dari ${productData.length} data`;

    // Menghitung jenis produk unik
    const uniqueProducts = new Set(
        rows.map(item =>
            item.name.trim().toLocaleLowerCase("id-ID")
        )
    );

    $("totalProducts").textContent = uniqueProducts.size;

    // Menghitung total sesuai filter
    const totalVol = rows.reduce(
        (sum, item) => sum + Number(item.vol), 0
    );

    const totalIjp = rows.reduce(
        (sum, item) => sum + Number(item.ijp), 0
    );

    $("totalVol").textContent =
        formatCompactRupiah(totalVol);

    $("totalIjp").textContent =
        formatCompactRupiah(totalIjp);

    const selectedYear = document.getElementById("yearFilter").value;

    renderMonthlySummary(dataProduk, selectedYear);

    renderYearOptions();
}

// Mengisi filter tahun secara otomatis
function renderYearOptions() {
    const select = $("yearFilter");
    const previousValue = select.value;

    const years = [
        ...new Set(productData.map(item => item.year))
    ].sort((a, b) => b - a);

    select.innerHTML = '<option value="">Semua tahun</option>';

    years.forEach(year => {
        const option = document.createElement("option");
        option.value = year;
        option.textContent = year;
        select.appendChild(option);
    });

    if (years.includes(Number(previousValue))) {
        select.value = previousValue;
    }
}

// Membuka modal tambah atau edit
function showModal(item = null) {
    form.reset();

    $("recordId").value = item?.id || "";

    $("modalTitle").textContent =
        item ? "Edit Data Produk" : "Tambah Data Produk";

    $("productName").value = item?.name || "";
    $("month").value = item?.month || "";
    $("year").value = item?.year || new Date().getFullYear();
    $("vol").value = item?.vol ?? "";
    $("ijp").value = item?.ijp ?? "";

    modalBackdrop.hidden = false;
    document.body.style.overflow = "hidden";

    $("productName").focus();
}

// Menutup modal
function closeModal() {
    modalBackdrop.hidden = true;
    document.body.style.overflow = "";
}

// Notifikasi
function showToast(message) {
    toast.textContent = message;
    toast.classList.add("show");

    clearTimeout(showToast.timer);

    showToast.timer = setTimeout(() => {
        toast.classList.remove("show");
    }, 2600);
}

// Tombol tambah data
$("addBtn").addEventListener("click", () => {
    showModal();
});

// Tombol tutup modal
$("closeModalBtn").addEventListener("click", closeModal);
$("cancelBtn").addEventListener("click", closeModal);

modalBackdrop.addEventListener("click", event => {
    if (event.target === modalBackdrop) {
        closeModal();
    }
});

document.addEventListener("keydown", event => {
    if (event.key === "Escape" && !modalBackdrop.hidden) {
        closeModal();
    }
});

// CREATE dan UPDATE
form.addEventListener("submit", event => {
    event.preventDefault();

    const id = $("recordId").value;

    const item = {
        id: id || crypto.randomUUID(),
        name: $("productName").value.trim(),
        month: Number($("month").value),
        year: Number($("year").value),
        vol: Number($("vol").value),
        ijp: Number($("ijp").value)
    };

    if (
        !item.name ||
        !item.month ||
        !item.year ||
        !Number.isFinite(item.vol) ||
        !Number.isFinite(item.ijp) ||
        item.vol < 0 ||
        item.ijp < 0
    ) {
        showToast("Periksa kembali data yang dimasukkan.");
        return;
    }

    // Satu produk hanya boleh memiliki satu catatan
    // untuk periode yang sama.
    const duplicate = productData.some(existing =>
        existing.id !== id &&
        existing.name.trim().toLocaleLowerCase("id-ID") ===
            item.name.toLocaleLowerCase("id-ID") &&
        existing.month === item.month &&
        existing.year === item.year
    );

    if (duplicate) {
        showToast("Produk untuk periode tersebut sudah ada.");
        return;
    }

    if (id) {
        // UPDATE
        productData = productData.map(existing =>
            existing.id === id ? item : existing
        );

        showToast("Data produk berhasil diperbarui.");
    } else {
        // CREATE
        productData.push(item);

        showToast("Data produk berhasil ditambahkan.");
    }

    saveData();
    closeModal();
    renderTable();
});

// EDIT dan DELETE
$("productTableBody").addEventListener("click", event => {
    const button = event.target.closest("button[data-action]");

    if (!button) return;

    const item = productData.find(
        entry => entry.id === button.dataset.id
    );

    if (!item) return;

    if (button.dataset.action === "edit") {
        showModal(item);
    }

    if (button.dataset.action === "delete") {
        const confirmed = confirm(
            `Hapus data ${item.name} untuk ` +
            `${monthNames[item.month - 1]} ${item.year}?`
        );

        if (!confirmed) return;

        productData = productData.filter(
            entry => entry.id !== item.id
        );

        saveData();
        renderTable();

        showToast("Data produk berhasil dihapus.");
    }
});

// Pencarian
$("searchInput").addEventListener("input", renderTable);

// Filter bulan dan tahun
$("monthFilter").addEventListener("change", renderTable);
$("yearFilter").addEventListener("change", renderTable);

// Reset semua filter
$("resetFilterBtn").addEventListener("click", () => {
    $("searchInput").value = "";
    $("monthFilter").value = "";
    $("yearFilter").value = "";

    renderTable();
    showToast("Filter berhasil direset.");
});

// Buka/tutup submenu Produk
$("produkToggle").addEventListener("click", () => {
    const isOpen = $("produkToggle").classList.toggle("open");
    $("produkSubmenu").hidden = !isOpen;
});

// Tampilkan data saat halaman dibuka
renderTable();
