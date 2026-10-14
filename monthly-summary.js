
const MONTHS = [
    "Januari", "Februari", "Maret", "April",
    "Mei", "Juni", "Juli", "Agustus",
    "September", "Oktober", "November", "Desember"
];

function toNumber(value) {
    const number = Number(value);
    return Number.isFinite(number) ? number : 0;
}

function formatRupiah(value) {
    return new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR",
        maximumFractionDigits: 0
    }).format(value);
}

function formatPercent(value) {
    return new Intl.NumberFormat("id-ID", {
        style: "percent",
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    }).format(value);
}

// Mendukung nama bulan Indonesia dan angka bulan.
function getMonthIndex(value) {
    const normalized = String(value ?? "").trim().toLowerCase();

    const aliases = {
        jan: 0, januari: 0, "01": 0, "1": 0,
        feb: 1, februari: 1, "02": 1, "2": 1,
        mar: 2, maret: 2, "03": 2, "3": 2,
        apr: 3, april: 3, "04": 3, "4": 3,
        mei: 4, may: 4, "05": 4, "5": 4,
        jun: 5, juni: 5, "06": 5, "6": 5,
        jul: 6, juli: 6, "07": 6, "7": 6,
        agu: 7, ags: 7, agustus: 7, aug: 7, "08": 7, "8": 7,
        sep: 8, september: 8, "09": 8, "9": 8,
        okt: 9, oktober: 9, oct: 9, "10": 9,
        nov: 10, november: 10, "11": 10,
        des: 11, desember: 11, dec: 11, "12": 11
    };

    return Object.prototype.hasOwnProperty.call(aliases, normalized)
        ? aliases[normalized]
        : -1;
}

// Mengikuti rumus Excel SUM, MAX, MIN, dan AVERAGE.
function calculateStatistics(records) {
    const volValues = records.map(item => toNumber(item.vol));
    const ijpValues = records.map(item => toNumber(item.ijp));

    const totalVol = volValues.reduce((sum, value) => sum + value, 0);
    const totalIJP = ijpValues.reduce((sum, value) => sum + value, 0);

    return {
        totalVol,
        totalIJP,
        maxVol: volValues.length ? Math.max(...volValues) : 0,
        minVol: volValues.length ? Math.min(...volValues) : 0,
        averageVol: volValues.length ? totalVol / volValues.length : 0
    };
}

// Mengikuti rumus Excel IFERROR((C2-B2)/B2,0).
function calculateGrowth(current, previous) {
    if (previous === 0) return 0;
    return (current - previous) / previous;
}

// Rekap satu tahun: total per bulan dan pertumbuhan dibanding
// bulan kalender sebelumnya.
function calculateMonthlySummary(records, year) {
    const yearlyRecords = records.filter(
        item => String(item.year) === String(year)
    );

    const months = MONTHS.map((name, index) => {
        const rows = yearlyRecords.filter(
            item => getMonthIndex(item.month) === index
        );

        return {
            month: name,
            vol: rows.reduce((sum, item) => sum + toNumber(item.vol), 0),
            ijp: rows.reduce((sum, item) => sum + toNumber(item.ijp), 0)
        };
    });

    return months.map((item, index) => {
        const previous = months[index - 1];

        return {
            ...item,
            volDifference: previous ? item.vol - previous.vol : null,
            volGrowth: previous
                ? calculateGrowth(item.vol, previous.vol)
                : null,
            ijpGrowth: previous
                ? calculateGrowth(item.ijp, previous.ijp)
                : null
        };
    });
}

// Mengikuti rumus Excel SUMIF untuk nama bank atau produk.
function calculateByName(records, name) {
    const matched = records.filter(
        item => String(item.name ?? item.bank ?? item.product ?? "")
            .trim().toLowerCase() === String(name).trim().toLowerCase()
    );

    return {
        totalVol: matched.reduce((sum, item) => sum + toNumber(item.vol), 0),
        totalIJP: matched.reduce((sum, item) => sum + toNumber(item.ijp), 0)
    };
}

// Mengikuti rumus kontribusi Excel IFERROR(B2/SUM(B),0).
function calculateContribution(value, total) {
    return total === 0 ? 0 : value / total;
}

// Rumus target Excel: D2-E2, D2/E2, IF(D2>=E2,...).
function calculateTarget(realization, target) {
    const actual = toNumber(realization);
    const goal = toNumber(target);

    return {
        difference: actual - goal,
        achievement: goal === 0 ? 0 : actual / goal,
        status: actual >= goal ? "Tercapai" : "Belum Tercapai"
    };
}

// Render tabel rekap bulanan.
// Memerlukan elemen monthlySummaryBody, yearlyTotalVol,
// dan yearlyTotalIJP di HTML.
function renderMonthlySummary(records, year) {
    const tbody = document.getElementById("monthlySummaryBody");
    const totalVolElement = document.getElementById("yearlyTotalVol");
    const totalIJPElement = document.getElementById("yearlyTotalIJP");

    if (!tbody || !totalVolElement || !totalIJPElement) return;

    const stats = calculateStatistics(
        records.filter(item => String(item.year) === String(year))
    );

    const months = calculateMonthlySummary(records, year);

    totalVolElement.textContent = formatRupiah(stats.totalVol);
    totalIJPElement.textContent = formatRupiah(stats.totalIJP);

    tbody.innerHTML = months.map(item => {
        const volGrowth = item.volGrowth === null
            ? "—"
            : formatPercent(item.volGrowth);

        const ijpGrowth = item.ijpGrowth === null
            ? "—"
            : formatPercent(item.ijpGrowth);

        return `
            <tr>
                <td>${item.month}</td>
                <td>${formatRupiah(item.vol)}</td>
                <td>${formatRupiah(item.ijp)}</td>
                <td>${volGrowth}</td>
                <td>${ijpGrowth}</td>
            </tr>
        `;
    }).join("");
}
