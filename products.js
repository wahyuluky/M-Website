
/*
 * DATA SIMULASI UNTUK DEMONSTRASI.
 *
 * Vol ditulis dalam satuan miliar rupiah.
 * IJP ditulis dalam satuan juta rupiah.
 *
 * Angka ini bukan hasil ekstraksi lengkap dari PDF.
 */

const produkToggle = document.getElementById("produkToggle");
    const produkGroup = produkToggle.closest(".nav-group");
    const submenuLinks = document.querySelectorAll(".submenu-link");

    // Buka atau tutup submenu Produk
    produkToggle.addEventListener("click", () => {
        produkGroup.classList.toggle("open");
    });


const bankData = [
    { name: "Bank Rakyat Indonesia", vol: 2210.57, ijp: 70646.19 },
    { name: "Bank Mandiri", vol: 874.65, ijp: 34459.70 },
    { name: "BPD Jatim", vol: 361.94, ijp: 12655.16 },
    { name: "Bank Negara Indonesia", vol: 88.74, ijp: 3319.88 },
    { name: "Bank Tabungan Negara", vol: 5.53, ijp: 233.15 },
    { name: "BPD Sulut", vol: 3.65, ijp: 198.36 }
];

const productData = [
    { name: "Kredit Usaha Rakyat 2015", vol: 3545.08, ijp: 121512.46 },
    { name: "Kredit FLPP", vol: 371.37, ijp: 1005.90 },
    { name: "Kredit Program Perumahan", vol: 155.60, ijp: 6630.82 },
    { name: "Kredit Kontra Bank Garansi", vol: 26.95, ijp: 217.16 },
    { name: "Kredit Usaha Alsintan", vol: 11.03, ijp: 361.84 },
    { name: "Surety Bond", vol: 6.10, ijp: 26.09 },
    { name: "Kredit Mikro", vol: 5.50, ijp: 75.15 },
    { name: "Kredit Subsidi Resi Gudang", vol: 2.33, ijp: 290.82 }
];

// Format angka dalam format Indonesia.
const numberFormat = new Intl.NumberFormat("id-ID", {
    maximumFractionDigits: 2
});

function formatNumber(value) {
    return numberFormat.format(value);
}

function sumValues(data, metric) {
    return data.reduce((total, item) => total + item[metric], 0);
}

// Mengisi kartu ringkasan.
function renderSummary() {
    document.getElementById("totalBanks").textContent =
        bankData.length;

    document.getElementById("totalProducts").textContent =
        productData.length;

    const totalVolume = sumValues(bankData, "vol");
    const totalIjp = sumValues(bankData, "ijp");

    document.getElementById("totalVolume").textContent =
        `Rp ${formatNumber(totalVolume)} M`;

    document.getElementById("totalIjp").textContent =
        `Rp ${formatNumber(totalIjp)} Jt`;
}

// Konfigurasi grafik batang.
function createChartConfig(data, metric, chartTitle) {
    const isVolume = metric === "vol";

    // Urutkan nilai dari terbesar ke terkecil.
    const sortedData = [...data].sort(
        (a, b) => b[metric] - a[metric]
    );

    return {
        type: "bar",

        data: {
            labels: sortedData.map(item => item.name),

            datasets: [{
                label: isVolume
                    ? "Volume (miliar rupiah)"
                    : "IJP (juta rupiah)",

                data: sortedData.map(item => item[metric]),

                backgroundColor: [
                    "#4f46e5",
                    "#6366f1",
                    "#818cf8",
                    "#a5b4fc",
                    "#c7d2fe",
                    "#ddd6fe",
                    "#e9d5ff",
                    "#f3e8ff"
                ],

                borderRadius: 5,
                borderSkipped: false,
                barThickness: "flex",
                maxBarThickness: 30
            }]
        },

        options: {
            indexAxis: "y",
            responsive: true,
            maintainAspectRatio: false,

            interaction: {
                intersect: false,
                mode: "index"
            },

            plugins: {
                legend: {
                    display: false
                },

                title: {
                    display: false,
                    text: chartTitle
                },

                tooltip: {
                    callbacks: {
                        label: function(context) {
                            const unit = isVolume
                                ? " miliar rupiah"
                                : " juta rupiah";

                            return `${context.dataset.label}: ${
                                formatNumber(context.parsed.x)
                            }${unit}`;
                        }
                    }
                }
            },

            scales: {
                x: {
                    beginAtZero: true,

                    title: {
                        display: true,
                        text: isVolume
                            ? "Volume (miliar rupiah)"
                            : "IJP (juta rupiah)"
                    },

                    ticks: {
                        callback: value => formatNumber(value)
                    },

                    grid: {
                        color: "#eef2f7"
                    }
                },

                y: {
                    grid: {
                        display: false
                    },

                    ticks: {
                        autoSkip: false,
                        font: {
                            size: 11
                        }
                    }
                }
            }
        }
    };
}

// Buat kedua grafik.
const bankChartContext = document
    .getElementById("bankChart")
    .getContext("2d");

const productChartContext = document
    .getElementById("productChart")
    .getContext("2d");

let bankChart = new Chart(
    bankChartContext,
    createChartConfig(bankData, "vol", "Distribusi per Bank")
);

let productChart = new Chart(
    productChartContext,
    createChartConfig(productData, "vol", "Distribusi per Produk")
);

// Perbarui grafik berdasarkan pilihan metrik.
document.getElementById("bankMetric").addEventListener("change", event => {
    const metric = event.target.value;

    bankChart.destroy();

    bankChart = new Chart(
        bankChartContext,
        createChartConfig(bankData, metric, "Distribusi per Bank")
    );
});

document.getElementById("productMetric").addEventListener("change", event => {
    const metric = event.target.value;

    productChart.destroy();

    productChart = new Chart(
        productChartContext,
        createChartConfig(productData, metric, "Distribusi per Produk")
    );
});

// Jalankan ringkasan.
renderSummary();
