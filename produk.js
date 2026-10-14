const produkToggle = document.getElementById("produkToggle");
    const produkSubmenu = document.getElementById("produkSubmenu");
    const produkGroup = produkToggle.closest(".nav-group");
    const submenuLinks = document.querySelectorAll(".submenu-link");

    // Buka atau tutup submenu Produk
    produkToggle.addEventListener("click", () => {
        produkGroup.classList.toggle("open");
    });

"use strict";

const STORAGE_KEY = "dashboardBisnisDataProdukV1";
const $ = (id) => document.getElementById(id);

const months = [
    "Januari", "Februari", "Maret", "April",
    "Mei", "Juni", "Juli", "Agustus",
    "September", "Oktober", "November", "Desember"
];

const currentYear = new Date().getFullYear();

const demoProducts = [
    "Kredit FLPP",
    "Kredit Konstruksi dan Pengadaan Barang/Jasa",
    "Kredit Kontra Bank Garansi",
    "Kredit Mikro",
    "Kredit Program Perumahan",
    "Kredit Resi Gudang",
    "Kredit Subsidi Resi Gudang",
    "Kredit Usaha Alsintan",
    "Kredit Usaha Rakyat 2015",
    "Pembiayaan Invoice",
    "Surety Bond"
];

let products = [];
let toastTimeout;

function createId() {
    return globalThis.crypto?.randomUUID?.()
        || `produk-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function createProduct(name, year, monthsData) {
    return {
        id: createId(),
        name: String(name).trim(),
        year: Number(year),
        months: monthsData || months.map(() => ({
            volume: 0,
            ijp: 0
        }))
    };
}

function normalizeAmount(value) {
    if (typeof value === "number") {
        return Number.isFinite(value) ? value : 0;
    }

    if (value === null || value === undefined || value === "") {
        return 0;
    }

    let text = String(value).trim()
        .replace(/\s/g, "")
        .replace(/Rp/gi, "");

    if (!text) return 0;

    // Mendukung angka Excel dan format Indonesia:
    // 1500000, 1.500.000, dan 1.500.000,50
    if (/^-?\d{1,3}(\.\d{3})+(,\d+)?$/.test(text)) {
        text = text.replace(/\./g, "").replace(",", ".");
    } else if (/^-?\d+,\d+$/.test(text)) {
        text = text.replace(",", ".");
    } else if (/^-?\d{1,3}(,\d{3})+(\.\d+)?$/.test(text)) {
        text = text.replace(/,/g, "");
    }

    const number = Number(text);
    return Number.isFinite(number) ? number : 0;
}

function normalizeProduct(item) {
    const monthly = Array.isArray(item.months) ? item.months : [];

    return {
        id: item.id || createId(),
        name: String(item.name || item.product || "").trim(),
        year: Number(item.year) || currentYear,
        months: months.map((_, index) => {
            const entry = monthly[index] || {};

            return {
                volume: normalizeAmount(entry.volume),
                ijp: normalizeAmount(entry.ijp)
            };
        })
    };
}

function createDemoData() {
    return demoProducts.map(name =>
        createProduct(name, currentYear)
    );
}

function loadData() {
    try {
        const saved = localStorage.getItem(STORAGE_KEY);

        if (saved === null) {
            products = createDemoData();
            saveData(false);
            return;
        }

        const parsed = JSON.parse(saved);

        if (!Array.isArray(parsed)) {
            throw new Error("Format penyimpanan tidak valid.");
        }

        products = parsed
            .map(normalizeProduct)
            .filter(item => item.name && item.year >= 2000 && item.year <= 2100);

        // Simpan kembali dengan struktur yang sudah dinormalisasi.
        saveData(false);
    } catch (error) {
        console.error("Gagal membaca data produk:", error);
        products = createDemoData();
        saveData(false);
        showToast("Data tersimpan tidak dapat dibaca. Data demo dimuat.");
    }
}

function saveData(showMessage = true) {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(products));

        $("saveStatus").textContent = "Data tersimpan di browser";
        $("saveStatus").classList.remove("error");

        if (showMessage) {
            showToast("Perubahan berhasil disimpan.");
        }

        return true;
    } catch (error) {
        console.error("Gagal menyimpan data:", error);
        $("saveStatus").textContent = "Gagal menyimpan data";
        $("saveStatus").classList.add("error");
        showToast("Penyimpanan gagal. Periksa kapasitas browser.");
        return false;
    }
}

function showToast(message) {
    const toast = $("toast");
    toast.textContent = message;
    toast.classList.add("show");

    clearTimeout(toastTimeout);
    toastTimeout = setTimeout(() => {
        toast.classList.remove("show");
    }, 2800);
}

function formatRupiah(value) {
    return new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR",
        maximumFractionDigits: 0
    }).format(value || 0);
}

function formatNumber(value) {
    return new Intl.NumberFormat("id-ID", {
        maximumFractionDigits: 2
    }).format(value || 0);
}

function getSelectedYear() {
    const value = $("yearFilter").value;
    return value === "all" ? "all" : Number(value);
}

function getVisibleProducts() {
    const query = $("searchInput").value.trim().toLowerCase();
    const selectedYear = getSelectedYear();

    return products
        .filter(item => selectedYear === "all" || item.year === selectedYear)
        .filter(item => item.name.toLowerCase().includes(query))
        .sort((a, b) =>
            a.name.localeCompare(b.name, "id") || a.year - b.year
        );
}

function getYearOptions() {
    const years = new Set([currentYear]);

    products.forEach(item => years.add(item.year));

    return [...years].sort((a, b) => b - a);
}

function renderYearFilter() {
    const select = $("yearFilter");
    const previous = select.value || String(currentYear);
    const years = getYearOptions();

    select.replaceChildren();

    const allOption = document.createElement("option");
    allOption.value = "all";
    allOption.textContent = "Semua Tahun";
    select.appendChild(allOption);

    years.forEach(year => {
        const option = document.createElement("option");
        option.value = String(year);
        option.textContent = year;
        select.appendChild(option);
    });

    select.value = years.includes(Number(previous))
        ? previous
        : String(currentYear);

    if (select.value !== previous && previous !== "all") {
        select.value = String(currentYear);
    }

    $("activeYearLabel").textContent =
        select.value === "all" ? "Semua" : select.value;
}

function renderHeader() {
    const head = $("productTableHead");
    head.replaceChildren();

    const firstRow = document.createElement("tr");

    [
        { label: "NO", cls: "no-col sticky-no" },
        { label: "PRODUK", cls: "product-col sticky-product" }
    ].forEach(column => {
        const th = document.createElement("th");
        th.textContent = column.label;
        th.className = column.cls;
        th.rowSpan = 2;
        firstRow.appendChild(th);
    });

    months.forEach(month => {
        const th = document.createElement("th");
        th.textContent = month.toUpperCase();
        th.colSpan = 2;
        th.className = "month-group";
        firstRow.appendChild(th);
    });

    const yearHeader = document.createElement("th");
    yearHeader.textContent = "TAHUN";
    yearHeader.className = "year-col sticky-year";
    yearHeader.rowSpan = 2;
    firstRow.appendChild(yearHeader);

    const secondRow = document.createElement("tr");

    months.forEach(() => {
        ["VOLUME (RP)", "IJP (RP)"].forEach(label => {
            const th = document.createElement("th");
            th.textContent = label;
            th.className = "money-col";
            secondRow.appendChild(th);
        });
    });

    head.append(firstRow, secondRow);
}

function createNameInput(product) {
    const input = document.createElement("input");
    input.type = "text";
    input.className = "cell-input name-input";
    input.value = product.name;
    input.setAttribute("aria-label", "Nama produk");
    input.maxLength = 150;

    input.addEventListener("change", () => {
        const newName = input.value.trim();

        if (!newName) {
            input.value = product.name;
            showToast("Nama produk tidak boleh kosong.");
            return;
        }

        const duplicate = products.some(item =>
            item.id !== product.id &&
            item.year === product.year &&
            item.name.toLowerCase() === newName.toLowerCase()
        );

        if (duplicate) {
            input.value = product.name;
            showToast("Produk dengan nama dan tahun tersebut sudah ada.");
            return;
        }

        const oldName = product.name;
        product.name = newName;

        if (!saveData(false)) {
            product.name = oldName;
            input.value = oldName;
            return;
        }

        renderAll();
        showToast("Nama produk diperbarui.");
    });

    input.addEventListener("keydown", event => {
        if (event.key === "Enter") input.blur();
        if (event.key === "Escape") {
            input.value = product.name;
            input.blur();
        }
    });

    return input;
}

function createAmountInput(product, monthIndex, field) {
    const input = document.createElement("input");
    input.type = "number";
    input.min = "0";
    input.step = "any";
    input.inputMode = "decimal";
    input.className = "cell-input number-input";
    input.value = product.months[monthIndex][field];
    input.setAttribute(
        "aria-label",
        `${product.name}, ${months[monthIndex]}, ${field === "volume" ? "Volume" : "IJP"}`
    );

    input.addEventListener("change", () => {
        const newValue = Number(input.value);

        if (input.value.trim() === "" || !Number.isFinite(newValue) || newValue < 0) {
            input.value = product.months[monthIndex][field];
            showToast("Masukkan angka nol atau lebih.");
            return;
        }

        const oldValue = product.months[monthIndex][field];
        product.months[monthIndex][field] = newValue;

        if (!saveData(false)) {
            product.months[monthIndex][field] = oldValue;
            input.value = oldValue;
            return;
        }

        renderSummary();
        renderFooter();
        showToast("Nilai berhasil diperbarui.");
    });

    input.addEventListener("keydown", event => {
        if (event.key === "Enter") input.blur();
        if (event.key === "Escape") {
            input.value = product.months[monthIndex][field];
            input.blur();
        }
    });

    return input;
}

function renderTable() {
    const body = $("productTableBody");
    const visibleProducts = getVisibleProducts();

    body.replaceChildren();
    $("emptyState").hidden = visibleProducts.length > 0;

    visibleProducts.forEach((product, index) => {
        const tr = document.createElement("tr");

        const noCell = document.createElement("td");
        noCell.className = "no-col sticky-no row-number";
        noCell.textContent = index + 1;
        tr.appendChild(noCell);

        const nameCell = document.createElement("td");
        nameCell.className = "product-col sticky-product";
        nameCell.appendChild(createNameInput(product));
        tr.appendChild(nameCell);

        product.months.forEach((monthData, monthIndex) => {
            ["volume", "ijp"].forEach(field => {
                const td = document.createElement("td");
                td.className = "money-col";
                td.appendChild(createAmountInput(product, monthIndex, field));
                tr.appendChild(td);
            });
        });

        const yearCell = document.createElement("td");
        yearCell.className = "year-col sticky-year";
        yearCell.textContent = product.year;
        yearCell.style.textAlign = "center";
        tr.appendChild(yearCell);

        body.appendChild(tr);
    });

    $("tableCount").textContent =
        `${visibleProducts.length} dari ${products.length} data produk`;
}

function calculateTotals(list) {
    const result = {
        volume: 0,
        ijp: 0,
        months: months.map(() => ({ volume: 0, ijp: 0 }))
    };

    list.forEach(product => {
        product.months.forEach((monthData, index) => {
            result.months[index].volume += monthData.volume;
            result.months[index].ijp += monthData.ijp;
            result.volume += monthData.volume;
            result.ijp += monthData.ijp;
        });
    });

    return result;
}

function renderSummary() {
    const list = getVisibleProducts();
    const totals = calculateTotals(list);

    $("totalProducts").textContent = formatNumber(list.length);
    $("totalVolume").textContent = formatRupiah(totals.volume);
    $("totalIjp").textContent = formatRupiah(totals.ijp);
}

function renderFooter() {
    const foot = $("productTableFoot");
    foot.replaceChildren();

    const list = getVisibleProducts();
    if (!list.length) return;

    const totals = calculateTotals(list);
    const tr = document.createElement("tr");

    const noCell = document.createElement("td");
    noCell.className = "no-col sticky-no";
    noCell.textContent = "";
    tr.appendChild(noCell);

    const labelCell = document.createElement("td");
    labelCell.className = "product-col sticky-product";
    labelCell.textContent = "GRAND TOTAL";
    tr.appendChild(labelCell);

    totals.months.forEach(monthData => {
        [monthData.volume, monthData.ijp].forEach(value => {
            const td = document.createElement("td");
            td.className = "money-col";
            td.style.textAlign = "right";
            td.textContent = formatNumber(value);
            td.title = formatRupiah(value);
            tr.appendChild(td);
        });
    });

    const yearCell = document.createElement("td");
    yearCell.className = "year-col sticky-year";
    yearCell.textContent = "—";
    yearCell.style.textAlign = "center";
    tr.appendChild(yearCell);

    foot.appendChild(tr);
}

function renderAll() {
    renderYearFilter();
    renderHeader();
    renderTable();
    renderSummary();
    renderFooter();

    $("currentYear").textContent = currentYear;
}

function openModal() {
    $("productForm").reset();
    $("productYear").value =
        getSelectedYear() === "all" ? currentYear : getSelectedYear();

    $("modalBackdrop").hidden = false;
    $("productName").focus();
}

function closeModal() {
    $("modalBackdrop").hidden = true;
}

function handleAddProduct(event) {
    event.preventDefault();

    const name = $("productName").value.trim();
    const year = Number($("productYear").value);

    if (!name) {
        showToast("Nama produk wajib diisi.");
        return;
    }

    if (!Number.isInteger(year) || year < 2000 || year > 2100) {
        showToast("Tahun harus antara 2000 dan 2100.");
        return;
    }

    const duplicate = products.some(item =>
        item.year === year &&
        item.name.toLowerCase() === name.toLowerCase()
    );

    if (duplicate) {
        showToast("Produk tersebut sudah tercatat pada tahun itu.");
        return;
    }

    const product = createProduct(name, year);
    products.push(product);

    if (!saveData(false)) {
        products = products.filter(item => item.id !== product.id);
        return;
    }

    closeModal();
    $("searchInput").value = "";
    $("yearFilter").value = String(year);
    renderAll();
    showToast("Produk baru berhasil ditambahkan.");
}

function handleReset() {
    const confirmed = window.confirm(
        "Kembalikan data ke data demo? Seluruh perubahan pada data produk saat ini akan diganti."
    );

    if (!confirmed) return;

    products = createDemoData();

    if (!saveData(false)) return;

    $("searchInput").value = "";
    renderAll();
    showToast("Data demo berhasil dimuat ulang.");
}

function getExportRows(list) {
    const headers = ["Produk"];

    months.forEach(month => {
        headers.push(`${month} Volume`, `${month} IJP`);
    });

    headers.push("Tahun");

    const rows = [headers];

    list.forEach(product => {
        const row = [product.name];

        product.months.forEach(monthData => {
            row.push(monthData.volume, monthData.ijp);
        });

        row.push(product.year);
        rows.push(row);
    });

    return rows;
}

function exportExcel() {
    if (typeof XLSX === "undefined") {
        showToast("Library Excel tidak tersedia. Periksa koneksi internet.");
        return;
    }

    const list = getVisibleProducts();

    if (!list.length) {
        showToast("Tidak ada data untuk diekspor.");
        return;
    }

    const worksheet = XLSX.utils.aoa_to_sheet(getExportRows(list));

    worksheet["!cols"] = [
        { wch: 42 },
        ...Array.from({ length: 24 }, () => ({ wch: 17 })),
        { wch: 10 }
    ];

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Data Produk");

    const selectedYear = getSelectedYear() === "all"
        ? "SemuaTahun"
        : getSelectedYear();

    XLSX.writeFile(workbook, `Data_Produk_${selectedYear}.xlsx`);
    showToast("File Excel berhasil diekspor.");
}

function normalizeHeader(value) {
    return String(value ?? "")
        .toLowerCase()
        .trim()
        .replace(/[\s_-]+/g, "");
}

function importExcelFile(file) {
    if (!file) return;

    if (typeof XLSX === "undefined") {
        showToast("Library Excel tidak tersedia.");
        return;
    }

    const reader = new FileReader();

    reader.onload = event => {
        try {
            const workbook = XLSX.read(event.target.result, { type: "array" });
            const worksheet = workbook.Sheets[workbook.SheetNames[0]];

            const rows = XLSX.utils.sheet_to_json(worksheet, {
                header: 1,
                defval: ""
            });

            if (rows.length < 2) {
                showToast("File Excel tidak memiliki data.");
                return;
            }

            const headers = rows[0].map(normalizeHeader);
            const productIndex = headers.findIndex(header =>
                ["produk", "namaproduk"].includes(header)
            );
            const yearIndex = headers.findIndex(header =>
                ["tahun", "year"].includes(header)
            );

            const monthColumns = months.map(month => {
                const key = normalizeHeader(month);

                const volumeIndex = headers.findIndex(header =>
                    header === `${key}volume` ||
                    header === `${key}vol` ||
                    header === `${key}volumerp`
                );

                const ijpIndex = headers.findIndex(header =>
                    header === `${key}ijp` ||
                    header === `${key}ijprp`
                );

                return { volumeIndex, ijpIndex };
            });

            if (productIndex < 0 || yearIndex < 0) {
                showToast("Header wajib: Produk dan Tahun.");
                return;
            }

            const missingMonth = monthColumns.some(column =>
                column.volumeIndex < 0 || column.ijpIndex < 0
            );

            if (missingMonth) {
                showToast(
                    "Kolom bulanan belum lengkap. Gunakan template hasil Ekspor Excel."
                );
                return;
            }

            const imported = [];

            rows.slice(1).forEach(row => {
                const name = String(row[productIndex] ?? "").trim();
                const year = Number(row[yearIndex]);

                if (!name || !Number.isInteger(year) || year < 2000 || year > 2100) {
                    return;
                }

                const monthsData = monthColumns.map(column => ({
                    volume: normalizeAmount(row[column.volumeIndex]),
                    ijp: normalizeAmount(row[column.ijpIndex])
                }));

                imported.push(createProduct(name, year, monthsData));
            });

            if (!imported.length) {
                showToast("Tidak ditemukan baris data yang valid.");
                return;
            }

            const confirmed = window.confirm(
                `Impor ${imported.length} baris? Data dengan kombinasi produk dan tahun yang sama akan diperbarui.`
            );

            if (!confirmed) return;

            const previousProducts = products.map(item => ({
                ...item,
                months: item.months.map(month => ({ ...month }))
            }));

            imported.forEach(item => {
                const existing = products.find(product =>
                    product.year === item.year &&
                    product.name.toLowerCase() === item.name.toLowerCase()
                );

                if (existing) {
                    existing.months = item.months;
                } else {
                    products.push(item);
                }
            });

            if (!saveData(false)) {
                products = previousProducts;
                renderAll();
                return;
            }

            renderAll();
            showToast(`${imported.length} baris berhasil diimpor.`);
        } catch (error) {
            console.error("Impor Excel gagal:", error);
            showToast("Gagal membaca file. Pastikan format Excel benar.");
        } finally {
            $("importFile").value = "";
        }
    };

    reader.onerror = () => {
        showToast("File tidak dapat dibaca.");
        $("importFile").value = "";
    };

    reader.readAsArrayBuffer(file);
}

// Event listeners
$("addBtn").addEventListener("click", openModal);
$("closeModalBtn").addEventListener("click", closeModal);
$("cancelBtn").addEventListener("click", closeModal);
$("productForm").addEventListener("submit", handleAddProduct);

$("modalBackdrop").addEventListener("click", event => {
    if (event.target === $("modalBackdrop")) closeModal();
});

document.addEventListener("keydown", event => {
    if (event.key === "Escape" && !$("modalBackdrop").hidden) {
        closeModal();
    }
});

$("searchInput").addEventListener("input", () => {
    renderTable();
    renderSummary();
    renderFooter();
});

$("yearFilter").addEventListener("change", () => {
    renderAll();
});

$("importBtn").addEventListener("click", () => {
    $("importFile").click();
});

$("importFile").addEventListener("change", event => {
    importExcelFile(event.target.files[0]);
});

$("exportBtn").addEventListener("click", exportExcel);
$("resetBtn").addEventListener("click", handleReset);

// Jalankan aplikasi
loadData();
renderAll();
