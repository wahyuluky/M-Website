const produkToggle = document.getElementById("produkToggle");
    const produkSubmenu = document.getElementById("produkSubmenu");
    const produkGroup = produkToggle.closest(".nav-group");
    const submenuLinks = document.querySelectorAll(".submenu-link");

    // Buka atau tutup submenu Produk
    produkToggle.addEventListener("click", () => {
        produkGroup.classList.toggle("open");
    });

const STORAGE_KEY = "dashboardBisnisDataBankExcelV1";

const months = [
    "Januari", "Februari", "Maret", "April",
    "Mei", "Juni", "Juli", "Agustus",
    "September", "Oktober", "November", "Desember"
];

const currentYear = new Date().getFullYear();

const $ = (id) => document.getElementById(id);

const moneyFormatter = new Intl.NumberFormat("id-ID", {
    maximumFractionDigits: 2
});

const compactCurrency = new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    notation: "compact",
    maximumFractionDigits: 2
});

function createEmptyMonths() {
    return Object.fromEntries(
        Array.from({ length: 12 }, (_, i) => [
            i + 1,
            { vol: 0, ijp: 0 }
        ])
    );
}

function createBank(product, name, year, monthsData = createEmptyMonths()) {
    return {
        id: crypto.randomUUID
            ? crypto.randomUUID()
            : `${Date.now()}-${Math.random().toString(36).slice(2)}`,
        product: product.trim(),
        name: name.trim(),
        year: Number(year),
        months: monthsData
    };
}

// Data simulasi awal, bukan data bank sebenarnya.
function createDemoData() {
    const data = [
        ["Kredit FLPP", "BANK TABUNGAN NEGARA"],
        ["Kredit Konstruksi dan Pengadaan Barang/Jasa", "BPD JATIM"],
        ["Kredit Kontra Bank Garansi", "BANK MANDIRI"],
        ["Kredit Kontra Bank Garansi", "BANK NEGARA INDONESIA"],
        ["Kredit Kontra Bank Garansi", "BANK RAKYAT INDONESIA"],
        ["Kredit Mikro", "BANK NEGARA INDONESIA"],
        ["Kredit Mikro", "BPD JATIM"],
        ["Kredit Program Perumahan", "BANK NEGARA INDONESIA"],
        ["Kredit Program Perumahan", "BANK RAKYAT INDONESIA"],
        ["Kredit Program Perumahan", "BANK TABUNGAN NEGARA"],
        ["Kredit Program Perumahan", "BPD JATIM"],
        ["Kredit Resi Gudang", "BPD JATIM"],
        ["Kredit Subsidi Resi Gudang", "BPD JATIM"],
        ["Kredit Usaha Alsintan", "BPD JATIM"],
        ["Kredit Usaha Rakyat 2015", "BANK MANDIRI"],
        ["Kredit Usaha Rakyat 2015", "BANK NEGARA INDONESIA"],
        ["Kredit Usaha Rakyat 2015", "BANK RAKYAT INDONESIA"],
        ["Kredit Usaha Rakyat 2015", "BANK TABUNGAN NEGARA"],
        ["Kredit Usaha Rakyat 2015", "BPD JATIM"],
        ["Kredit Usaha Rakyat 2015", "BPD SULUT"],
        ["Pembiayaan Invoice", "BANK RAKYAT INDONESIA"],
        ["Surety Bond", "OBLIGEE SURETY"]
    ];

    return data.map(([product, name]) =>
        createBank(product, name, currentYear)
    );
}

function normalizeBank(item) {
    const normalizedMonths = createEmptyMonths();

    for (let m = 1; m <= 12; m++) {
        const source = item.months?.[m] || {};

        normalizedMonths[m] = {
            vol: validAmount(source.vol),
            ijp: validAmount(source.ijp)
        };
    }

    return {
        id: String(item.id || (
            Date.now() + Math.random().toString(36).slice(2)
        )),
        product: String(item.product || "").trim(),
        name: String(item.name || "").trim(),
        year: Number(item.year),
        months: normalizedMonths
    };
}

function validAmount(value) {
    const number = Number(value);
    return Number.isFinite(number) && number >= 0
        ? number
        : 0;
}

function loadData() {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);

        if (raw !== null) {
            const parsed = JSON.parse(raw);

            if (Array.isArray(parsed)) {
                return parsed.map(normalizeBank).filter(
                    bank => bank.name &&
                        Number.isInteger(bank.year) &&
                        bank.year >= 2000 &&
                        bank.year <= 2100
                );
            }
        }
    } catch (error) {
        console.error("Gagal membaca data bank:", error);
        alert("Data tersimpan tidak dapat dibaca. Periksa penyimpanan browser.");
    }

    return createDemoData();
}

let banks = loadData();

function saveData() {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(banks));
        $("saveStatus").textContent =
            "Tersimpan · " +
            new Date().toLocaleTimeString("id-ID", {
                hour: "2-digit",
                minute: "2-digit"
            });
        return true;
    } catch (error) {
        console.error("Gagal menyimpan:", error);
        $("saveStatus").textContent = "Gagal menyimpan data";
        showToast("Penyimpanan gagal. Ekspor data sebagai cadangan.");
        return false;
    }
}

function formatNumber(value) {
    return moneyFormatter.format(value);
}

function formatCompact(value) {
    return compactCurrency.format(value);
}

function getFilteredBanks() {
    const query = $("searchInput").value.trim().toLowerCase();
    const selectedYear = $("yearFilter").value;

    return banks
        .filter(item =>
            item.product.toLowerCase().includes(query) ||
            item.name.toLowerCase().includes(query)
        )
        .filter(item =>
            !selectedYear || item.year === Number(selectedYear)
        )
        .sort((a, b) =>
            a.product.localeCompare(b.product, "id") ||
            a.name.localeCompare(b.name, "id") ||
            a.year - b.year
        );
}

function updateYearFilter() {
    const select = $("yearFilter");
    const previousValue = select.value;

    const years = [...new Set(banks.map(bank => bank.year))]
        .sort((a, b) => b - a);

    select.replaceChildren(new Option("Semua tahun", ""));

    years.forEach(year => {
        select.add(new Option(String(year), String(year)));
    });

    if (years.includes(Number(previousValue))) {
        select.value = previousValue;
    }
}

function renderHeader() {
    const head = $("bankTableHead");
    head.replaceChildren();

    const firstRow = document.createElement("tr");

    [
        {label: "NO", cls: "no-col"},
        { label: "PRODUK", cls: "product-col" },
        { label: "NAMA BANK", cls: "bank-col" },
        { label: "TAHUN", cls: "year-col" }
    ].forEach(column => {
        const th = document.createElement("th");
        th.textContent = column.label;
        th.className = `fixed-col ${column.cls}`;
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

    const actionHeader = document.createElement("th");
    actionHeader.textContent = "AKSI";
    actionHeader.rowSpan = 2;
    actionHeader.className = "action-col";
    firstRow.appendChild(actionHeader);

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


function makeProductInput(bank) {
    const input = document.createElement("input");

    input.type = "text";
    input.value = bank.product;
    input.className = "product-name-input";
    input.setAttribute("aria-label", "Nama produk");

    input.addEventListener("change", () => {
        const newName = input.value.trim();

        if (!newName) {
            input.value = bank.product;
            showToast("Nama produk tidak boleh kosong.");
            return;
        }

        const oldName = bank.product;

        // Ganti nama produk pada semua bank dalam kelompok tersebut.
        banks.forEach(item => {
            if (
                item.product === oldName &&
                item.year === bank.year
            ) {
                item.product = newName;
            }
        });

        if (!saveData()) return;

        renderAll();
        showToast("Nama produk berhasil diperbarui.");
    });

    return input;
}


function makeMoneyInput(bank, month, field, value) {
    const input = document.createElement("input");

    input.type = "number";
    input.min = "0";
    input.step = "any";
    input.value = String(value);
    input.className = "cell-input";
    input.setAttribute(
        "aria-label",
        `${bank.name}, ${months[month - 1]}, ${field === "vol" ? "Volume" : "IJP"}`
    );
    input.title = "Klik untuk mengedit nominal";

    input.addEventListener("change", () => {
        const rawValue = input.value.trim();
        const amount = Number(rawValue);

        if (
            rawValue === "" ||
            !Number.isFinite(amount) ||
            amount < 0
        ) {
            input.classList.add("invalid");
            input.value = String(bank.months[month][field]);
            showToast("Masukkan nominal angka nol atau lebih.");
            return;
        }

        input.classList.remove("invalid");
        bank.months[month][field] = amount;

        saveData();
        renderSummary();
        renderFooter();
        showToast("Nilai berhasil diperbarui.");
    });

    return input;
}

function makeBankNameInput(bank) {
    const input = document.createElement("input");

    input.type = "text";
    input.value = bank.name;
    input.className = "bank-name-input";
    input.placeholder = "Nama bank";
    input.setAttribute("aria-label", "Nama bank");

    input.addEventListener("change", () => {
        const newName = input.value.trim();

        if (!newName) {
            input.value = bank.name;
            showToast("Nama bank tidak boleh kosong.");
            return;
        }

        bank.name = newName;
        saveData();
        renderAll();

        showToast("Nama bank berhasil diperbarui.");
    });

    return input;
}

// function renderTable() {
//     renderHeader();

//     const tbody = $("bankTableBody");
//     tbody.replaceChildren();

//     const filtered = getFilteredBanks();

//     // Kelompokkan berdasarkan produk dan tahun.
//     const groups = [];

//     filtered.forEach((bank, index) => {
//         const tr = document.createElement("tr");

//         const numberCell = document.createElement("td");
//         numberCell.className = "no-col sticky-no";
//         numberCell.textContent = String(index + 1);
//         tr.appendChild(numberCell);

//         const nameCell = document.createElement("td");
//         nameCell.className = "bank-col sticky-bank";

//         const name = document.createElement("div");
//         name.className = "bank-name";
//         name.textContent = bank.name;
//         name.title = bank.name;
//         nameCell.appendChild(makeBankNameInput(bank));
//         tr.appendChild(nameCell);

//         const yearCell = document.createElement("td");
//         yearCell.className = "year-col sticky-year year-text";
//         yearCell.textContent = String(bank.year);
//         tr.appendChild(yearCell);

//         months.forEach((_, indexMonth) => {
//             const month = indexMonth + 1;

//             ["vol", "ijp"].forEach(field => {
//                 const td = document.createElement("td");
//                 td.className = "money-col";

//                 td.appendChild(
//                     makeMoneyInput(
//                         bank,
//                         month,
//                         field,
//                         bank.months[month][field]
//                     )
//                 );

//                 tr.appendChild(td);
//             });
//         });

//         const actionCell = document.createElement("td");
//         actionCell.className = "action-col";

//         const deleteButton = document.createElement("button");
//         deleteButton.type = "button";
//         deleteButton.className = "delete-btn";
//         deleteButton.title = "Hapus bank";
//         deleteButton.setAttribute("aria-label", `Hapus ${bank.name}`);

//         const deleteIcon = document.createElement("i");
//         deleteIcon.className = "bx bx-trash";
//         deleteButton.appendChild(deleteIcon);

//         deleteButton.addEventListener("click", () => {
//             const confirmed = confirm(
//                 `Hapus data ${bank.name} tahun ${bank.year}?`
//             );

//             if (!confirmed) return;

//             banks = banks.filter(item => item.id !== bank.id);
//             saveData();
//             updateYearFilter();
//             renderAll();
//             showToast("Data bank dihapus.");
//         });

//         actionCell.appendChild(deleteButton);
//         tr.appendChild(actionCell);

//         tbody.appendChild(tr);
//     });

//     $("emptyState").hidden = filtered.length > 0;
//     $("bankTable").hidden = filtered.length === 0;
//     $("tableCount").textContent = `Menampilkan ${filtered.length} data bank`;

//     renderFooter();
// }


function renderTable() {
    renderHeader();

    const tbody = $("bankTableBody");
    tbody.replaceChildren();

    const filtered = getFilteredBanks();

    // Kelompokkan berdasarkan produk dan tahun.
    const groups = [];

    filtered.forEach(bank => {
        let group = groups.find(item =>
            item.product === bank.product &&
            item.year === bank.year
        );

        if (!group) {
            group = {
                product: bank.product,
                year: bank.year,
                banks: []
            };
            groups.push(group);
        }

        group.banks.push(bank);
    });

    let rowNumber = 0;

    groups.forEach(group => {
        group.banks.forEach((bank, index) => {
            const tr = document.createElement("tr");

            const numberCell = document.createElement("td");
            numberCell.textContent = String(++rowNumber);
            numberCell.className = "no-col";
            tr.appendChild(numberCell);

            if (index === 0) {
                const productCell = document.createElement("td");
                productCell.className = "product-col";
                productCell.rowSpan = group.banks.length;
                productCell.appendChild(makeProductInput(bank));
                tr.appendChild(productCell);
            }

            const nameCell = document.createElement("td");
            nameCell.className = "bank-col";
            nameCell.appendChild(makeBankNameInput(bank));
            tr.appendChild(nameCell);

            const yearCell = document.createElement("td");
            yearCell.className = "year-col year-text";
            yearCell.textContent = String(bank.year);
            tr.appendChild(yearCell);

            months.forEach((_, indexMonth) => {
                const month = indexMonth + 1;

                ["vol", "ijp"].forEach(field => {
                    const td = document.createElement("td");
                    td.className = "money-col";
                    td.appendChild(
                        makeMoneyInput(
                            bank,
                            month,
                            field,
                            bank.months[month][field]
                        )
                    );
                    tr.appendChild(td);
                });
            });

            const actionCell = document.createElement("td");
            actionCell.className = "action-col";

            const deleteButton = document.createElement("button");
            deleteButton.type = "button";
            deleteButton.className = "delete-btn";
            deleteButton.title = "Hapus bank";
            deleteButton.setAttribute(
                "aria-label",
                `Hapus ${bank.name}`
            );

            const icon = document.createElement("i");
            icon.className = "bx bx-trash";
            deleteButton.appendChild(icon);

            deleteButton.addEventListener("click", () => {
                if (!confirm(
                    `Hapus ${bank.name} dari produk ${bank.product} tahun ${bank.year}?`
                )) return;

                const previousBanks = banks;
                banks = banks.filter(item => item.id !== bank.id);

                if (!saveData()) {
                    banks = previousBanks;
                    return;
                }

                updateYearFilter();
                renderAll();
                showToast("Data bank berhasil dihapus.");
            });

            actionCell.appendChild(deleteButton);
            tr.appendChild(actionCell);
            tbody.appendChild(tr);
        });
    });

    $("emptyState").hidden = filtered.length > 0;
    $("bankTable").hidden = filtered.length === 0;
    $("tableCount").textContent =
        `Menampilkan ${filtered.length} data bank`;

    renderFooter();
}


function renderSummary() {
    const filtered = getFilteredBanks();

    let totalVol = 0;
    let totalIjp = 0;

    filtered.forEach(bank => {
        for (let m = 1; m <= 12; m++) {
            totalVol += bank.months[m].vol;
            totalIjp += bank.months[m].ijp;
        }
    });

    $("totalBanks").textContent = String(filtered.length);
    $("totalVol").textContent = formatCompact(totalVol);
    $("totalIjp").textContent = formatCompact(totalIjp);

    $("totalVol").title = `Rp${formatNumber(totalVol)}`;
    $("totalIjp").title = `Rp${formatNumber(totalIjp)}`;
}

function renderFooter() {
    const foot = $("bankTableFoot");
    foot.replaceChildren();

    const filtered = getFilteredBanks();
    const row = document.createElement("tr");

    const no = document.createElement("td");
    no.className = "sticky-no no-col";
    row.appendChild(no);

    const label = document.createElement("td");
    label.textContent = "TOTAL";
    label.className = "sticky-bank bank-col total-label";
    row.appendChild(label);

    const bank = document.createElement("td");
    bank.textContent = "—";
    bank.className = "bank-col";
    row.appendChild(bank);

    const year = document.createElement("td");
    year.className = "year-col";
    year.textContent = "—";
    row.appendChild(year);

    months.forEach((_, index) => {
        const month = index + 1;

        ["vol", "ijp"].forEach(field => {
            const total = filtered.reduce(
                (sum, bank) => sum + bank.months[month][field],
                0
            );

            const td = document.createElement("td");
            td.className = "money-col total-number";
            td.textContent = formatNumber(total);
            td.title = `Rp${formatNumber(total)}`;
            row.appendChild(td);
        });
    });

    const action = document.createElement("td");
    action.className = "action-col";
    row.appendChild(action);

    foot.appendChild(row);
}

function renderAll() {
    renderTable();
    renderSummary();
}

function showToast(message) {
    const toast = $("toast");
    toast.textContent = message;
    toast.classList.add("show");

    clearTimeout(showToast.timer);
    showToast.timer = setTimeout(() => {
        toast.classList.remove("show");
    }, 2500);
}

// Modal tambah bank
function openModal() {
    $("bankForm").reset();
    $("bankYear").value = $("yearFilter").value || currentYear;
    $("modalBackdrop").hidden = false;
    $("bankName").focus();
}

function closeModal() {
    $("modalBackdrop").hidden = true;
}

$("addBtn").addEventListener("click", openModal);
$("closeModalBtn").addEventListener("click", closeModal);
$("cancelBtn").addEventListener("click", closeModal);

$("modalBackdrop").addEventListener("click", event => {
    if (event.target === $("modalBackdrop")) closeModal();
});

document.addEventListener("keydown", event => {
    if (event.key === "Escape") closeModal();
});

// $("bankForm").addEventListener("submit", event => {
//     event.preventDefault();

//     const name = $("bankName").value.trim();
//     const year = Number($("bankYear").value);

//     if (!name || !Number.isInteger(year) || year < 2000 || year > 2100) {
//         showToast("Periksa nama bank dan tahun.");
//         return;
//     }

//     const duplicate = banks.some(bank =>
//         bank.name.toLowerCase() === name.toLowerCase() &&
//         bank.year === year
//     );

//     if (duplicate) {
//         showToast("Bank tersebut sudah terdaftar untuk tahun itu.");
//         return;
//     }

//     banks.push(createBank(name, year));

//     if (!saveData()) {
//         banks.pop();
//         return;
//     }

//     closeModal();
//     $("searchInput").value = "";
//     $("yearFilter").value = String(year);

//     updateYearFilter();
//     $("yearFilter").value = String(year);

//     renderAll();
//     showToast("Bank berhasil ditambahkan.");
// });


$("bankForm").addEventListener("submit", event => {
    event.preventDefault();

    const product = $("productName").value.trim();
    const name = $("bankName").value.trim();
    const year = Number($("bankYear").value);

    if (
        !product ||
        !name ||
        !Number.isInteger(year) ||
        year < 2000 ||
        year > 2100
    ) {
        showToast("Periksa nama produk, nama bank, dan tahun.");
        return;
    }

    const duplicate = banks.some(item =>
        item.product.toLowerCase() === product.toLowerCase() &&
        item.name.toLowerCase() === name.toLowerCase() &&
        item.year === year
    );

    if (duplicate) {
        showToast("Bank tersebut sudah terdaftar pada produk dan tahun itu.");
        return;
    }

    const newBank = createBank(product, name, year);
    banks.push(newBank);

    if (!saveData()) {
        banks = banks.filter(item => item.id !== newBank.id);
        return;
    }

    closeModal();
    $("searchInput").value = "";
    updateYearFilter();
    $("yearFilter").value = String(year);

    renderAll();
    showToast("Produk dan bank berhasil ditambahkan.");
});


// Pencarian dan filter
$("searchInput").addEventListener("input", renderAll);
$("yearFilter").addEventListener("change", renderAll);

$("resetBtn").addEventListener("click", () => {
    $("searchInput").value = "";
    $("yearFilter").value = "";
    renderAll();
});

// Navigasi submenu
$("produkToggle").addEventListener("click", () => {
    const isOpen = $("produkSubmenu").classList.toggle("show");
    $("produkToggle").classList.toggle("open", isOpen);
});

// Ekspor Excel: satu baris untuk setiap kombinasi bank dan tahun
$("exportBtn").addEventListener("click", () => {
    if (typeof XLSX === "undefined") {
        showToast("Library Excel tidak tersedia. Periksa koneksi internet.");
        return;
    }

    const headers = ["Produk", "Nama Bank", "Tahun"];

    months.forEach(month => {
        headers.push(`${month} - Volume`, `${month} - IJP`);
    });

    const rows = getFilteredBanks().map(bank => {
        const row = [bank.product, bank.name, bank.year];

        for (let m = 1; m <= 12; m++) {
            row.push(bank.months[m].vol, bank.months[m].ijp);
        }

        return row;
    });

    const worksheet = XLSX.utils.aoa_to_sheet([headers, ...rows]);
    worksheet["!cols"] = [
        { wch: 38 },
        { wch: 30 },
        { wch: 10 },
        ...Array.from({ length: 24 }, () => ({ wch: 18 }))
    ];

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Data Bank");

    XLSX.writeFile(
        workbook,
        `Data-Bank-${new Date().toISOString().slice(0, 10)}.xlsx`
    );

    showToast("File Excel berhasil dibuat.");
});

// Impor Excel
$("importBtn").addEventListener("click", () => {
    $("importFile").click();
});

$("importFile").addEventListener("change", async event => {
    const file = event.target.files[0];
    if (!file) return;

    if (typeof XLSX === "undefined") {
        showToast("Library Excel tidak tersedia.");
        event.target.value = "";
        return;
    }

    try {
        const buffer = await file.arrayBuffer();
        const workbook = XLSX.read(buffer, { type: "array" });
        const worksheet = workbook.Sheets[workbook.SheetNames[0]];

        const rows = XLSX.utils.sheet_to_json(worksheet, {
            header: 1,
            defval: ""
        });

        if (rows.length < 2) {
            showToast("File tidak memiliki baris data.");
            return;
        }

        const headers = rows[0].map(value =>
            String(value).trim().toLowerCase()
        );

        const nameIndex = headers.findIndex(header =>
            ["nama bank", "bank"].includes(header)
        );
        const yearIndex = headers.findIndex(header =>
            ["tahun", "year"].includes(header)
        );

        if (nameIndex < 0 || yearIndex < 0) {
            showToast("Kolom Nama Bank dan Tahun wajib tersedia.");
            return;
        }

        const imported = [];
        const seen = new Set();

        for (const row of rows.slice(1)) {
            const name = String(row[nameIndex] ?? "").trim();
            if (!name) continue;

            const year = Number(row[yearIndex]);

            if (!Number.isInteger(year) || year < 2000 || year > 2100) {
                throw new Error(`Tahun tidak valid pada bank ${name}.`);
            }

            const monthsData = createEmptyMonths();

            for (let m = 1; m <= 12; m++) {
                const volHeader = `${months[m - 1]} - volume`;
                const ijpHeader = `${months[m - 1]} - ijp`;

                const volIndex = headers.indexOf(volHeader);
                const ijpIndex = headers.indexOf(ijpHeader);

                const vol = volIndex < 0 ? 0 : row[volIndex];
                const ijp = ijpIndex < 0 ? 0 : row[ijpIndex];

                if (
                    (vol !== "" && (!Number.isFinite(Number(vol)) || Number(vol) < 0)) ||
                    (ijp !== "" && (!Number.isFinite(Number(ijp)) || Number(ijp) < 0))
                ) {
                    throw new Error(
                        `Nominal tidak valid: ${name}, ${months[m - 1]}.`
                    );
                }

                monthsData[m] = {
                    vol: validAmount(vol),
                    ijp: validAmount(ijp)
                };
            }

            const key = `${name.toLowerCase()}|${year}`;

            if (seen.has(key)) {
                throw new Error(`Data duplikat dalam file: ${name}, ${year}.`);
            }

            seen.add(key);
            imported.push(createBank(name, year, monthsData));
        }

        if (!imported.length) {
            showToast("Tidak ada data bank yang bisa diimpor.");
            return;
        }

        const replace = confirm(
            `Ditemukan ${imported.length} data bank.\n\n` +
            "OK = Ganti seluruh data yang tersimpan.\n" +
            "Batal = Gabungkan dengan data saat ini."
        );

        let nextBanks;

        if (replace) {
            nextBanks = imported;
        } else {
            nextBanks = [...banks];

            for (const incoming of imported) {
                const index = nextBanks.findIndex(bank =>
                    bank.name.toLowerCase() === incoming.name.toLowerCase() &&
                    bank.year === incoming.year
                );

                if (index >= 0) {
                    nextBanks[index] = {
                        ...incoming,
                        id: nextBanks[index].id
                    };
                } else {
                    nextBanks.push(incoming);
                }
            }
        }

        const previousBanks = banks;
        banks = nextBanks;

        if (!saveData()) {
            banks = previousBanks;
            return;
        }

        $("searchInput").value = "";
        $("yearFilter").value = "";
        updateYearFilter();
        renderAll();

        showToast(`${imported.length} data bank berhasil diimpor.`);
    } catch (error) {
        console.error("Impor Excel gagal:", error);
        showToast(error.message || "File Excel gagal dibaca.");
    } finally {
        event.target.value = "";
    }
});

// Inisialisasi halaman
updateYearFilter();
renderAll();
