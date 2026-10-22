const formFilter = document.getElementById("formFilter");
const tanggalAwal = document.getElementById("tanggalAwal");
const tanggalAkhir = document.getElementById("tanggalAkhir");
const jenisKendaraan = document.getElementById("jenisKendaraan");
const totalPengeluaran = document.getElementById("totalPengeluaran");
const pieChart = document.getElementById("pieChart");
const pieLegend = document.getElementById("pieLegend");
const yAxis = document.getElementById("yAxis");
const barPlot = document.getElementById("barPlot");
const pesanLaporan = document.getElementById("pesanLaporan");

const KEY_SERVIS = "servisku_riwayat_servis";
const KEY_KENDARAAN = "servisku_kendaraan";

const warnaGrafik = [
    "#fffbc0",
    "#c9e3fa",
    "#f7c6df",
    "#bce8d5",
    "#d9cafa",
    "#ffd6b0"
];

// Data contoh jika belum ada data servis tersimpan
const dataContoh = [
    {
        id: 1,
        tanggal: "2026-05-12",
        kendaraan: "Toyota Avanza",
        jenis: "Ganti Oli Mesin",
        biaya: 250000
    },
    {
        id: 2,
        tanggal: "2026-05-24",
        kendaraan: "Honda Beat",
        jenis: "Cek Rem",
        biaya: 100000
    },
    {
        id: 3,
        tanggal: "2026-05-26",
        kendaraan: "Honda Scoopy",
        jenis: "Ganti Ban",
        biaya: 200000
    },
    {
        id: 4,
        tanggal: "2026-05-27",
        kendaraan: "Honda Beat",
        jenis: "Ganti Filter Udara",
        biaya: 80000
    }
];

// Membaca data tersimpan
function bacaData(key) {
    try {
        const tersimpan = localStorage.getItem(key);

        if (tersimpan === null) return null;

        const data = JSON.parse(tersimpan);

        return Array.isArray(data) ? data : [];
    } catch (error) {
        console.error("Gagal membaca data:", error);
        return [];
    }
}

// Data laporan mengikuti riwayat servis
function ambilRiwayat() {
    const data = bacaData(KEY_SERVIS);

    return data === null ? dataContoh : data;
}

// Format rupiah
function formatRupiah(nilai) {
    return "Rp. " + Number(nilai || 0).toLocaleString("id-ID");
}

// Format tanggal lokal
function formatTanggal(tanggal) {
    if (!tanggal) return "-";

    const bagian = tanggal.split("-");

    if (bagian.length !== 3) return tanggal;

    return new Date(
        Number(bagian[0]),
        Number(bagian[1]) - 1,
        Number(bagian[2])
    ).toLocaleDateString("id-ID", {
        day: "numeric",
        month: "long",
        year: "numeric"
    });
}

// Mengisi pilihan kendaraan
function muatPilihanKendaraan() {
    const kendaraanTersimpan = bacaData(KEY_KENDARAAN) || [];
    const riwayat = ambilRiwayat();

    const daftarNama = new Set();

    kendaraanTersimpan.forEach(item => {
        const nama = item.nama || item.namaKendaraan;

        if (nama) daftarNama.add(nama);
    });

    riwayat.forEach(item => {
        if (item.kendaraan) daftarNama.add(item.kendaraan);
    });

    // Pertahankan pilihan awal
    jenisKendaraan.replaceChildren();

    const semua = document.createElement("option");
    semua.value = "";
    semua.textContent = "Semua Kendaraan";
    jenisKendaraan.appendChild(semua);

    [...daftarNama].sort().forEach(nama => {
        const option = document.createElement("option");
        option.value = nama;
        option.textContent = nama;
        jenisKendaraan.appendChild(option);
    });
}

// Filter data laporan
function filterLaporan() {
    const awal = tanggalAwal.value;
    const akhir = tanggalAkhir.value;
    const kendaraanDipilih = jenisKendaraan.value;

    if (awal && akhir && awal > akhir) {
        pesanLaporan.textContent =
            "Tanggal awal tidak boleh melewati tanggal akhir.";
        return;
    }

    pesanLaporan.textContent = "";

    const riwayat = ambilRiwayat();

    const hasil = riwayat.filter(item => {
        if (awal && (!item.tanggal || item.tanggal < awal)) {
            return false;
        }

        if (akhir && (!item.tanggal || item.tanggal > akhir)) {
            return false;
        }

        if (
            kendaraanDipilih &&
            item.kendaraan !== kendaraanDipilih
        ) {
            return false;
        }

        return true;
    });

    tampilkanTotal(hasil);
    tampilkanRekapServis(hasil);
    tampilkanGrafikPengeluaran(hasil);
}

// Menghitung total pengeluaran
function tampilkanTotal(data) {
    const total = data.reduce((jumlah, item) => {
        return jumlah + Math.max(0, Number(item.biaya) || 0);
    }, 0);

    totalPengeluaran.textContent = formatRupiah(total);
}

// Membuat grafik lingkaran berdasarkan jenis servis
function tampilkanRekapServis(data) {
    const jumlahJenis = {};

    data.forEach(item => {
        const jenis = item.jenis || "Lainnya";
        jumlahJenis[jenis] = (jumlahJenis[jenis] || 0) + 1;
    });

    const jenisTeratas = Object.entries(jumlahJenis)
        .sort((a, b) => b[1] - a[1]);

    const total = jenisTeratas.reduce(
        (jumlah, item) => jumlah + item[1],
        0
    );

    pieLegend.replaceChildren();

    if (total === 0) {
        pieChart.style.background = "#eeeeee";
        pieLegend.textContent = "Belum ada data servis.";
        return;
    }

    let posisi = 0;
    const bagianGrafik = jenisTeratas.map(([nama, jumlah], index) => {
        const awal = posisi;
        posisi += (jumlah / total) * 100;

        return {
            nama,
            jumlah,
            warna: warnaGrafik[index % warnaGrafik.length],
            awal,
            akhir: posisi
        };
    });

    const gradien = bagianGrafik.map(item => {
        return `${item.warna} ${item.awal}% ${item.akhir}%`;
    });

    pieChart.style.background =
        `conic-gradient(${gradien.join(", ")})`;

    bagianGrafik.forEach(item => {
        const baris = document.createElement("div");
        baris.className = "legend-item";

        const warna = document.createElement("span");
        warna.className = "legend-color";
        warna.style.backgroundColor = item.warna;

        const teks = document.createElement("span");
        teks.textContent = item.nama;

        baris.append(warna, teks);
        pieLegend.appendChild(baris);
    });
}

// Membuat grafik pengeluaran per bulan
function tampilkanGrafikPengeluaran(data) {
    yAxis.replaceChildren();
    barPlot.replaceChildren();

    const pengeluaranBulanan = {};

    data.forEach(item => {
        if (!item.tanggal) return;

        const bulan = item.tanggal.slice(0, 7);

        pengeluaranBulanan[bulan] =
            (pengeluaranBulanan[bulan] || 0) +
            Math.max(0, Number(item.biaya) || 0);
    });

    const dataBulan = Object.entries(pengeluaranBulanan)
        .sort((a, b) => a[0].localeCompare(b[0]))
        .slice(-6);

    const maksimum = Math.max(
        100000,
        ...dataBulan.map(item => item[1])
    );

    const batasAtas = Math.ceil(maksimum / 100000) * 100000;

    // Label sumbu vertikal
    for (let i = 5; i >= 0; i--) {
        const label = document.createElement("span");

        label.textContent =
            i === 0 ? "0" : `${Math.round(batasAtas * i / 5 / 1000)}k`;

        yAxis.appendChild(label);
    }

    if (dataBulan.length === 0) {
        const kosong = document.createElement("p");
        kosong.textContent = "Belum ada data";
        kosong.style.alignSelf = "center";
        barPlot.appendChild(kosong);
        return;
    }

    dataBulan.forEach(([bulan, nilai]) => {
        const kolom = document.createElement("div");
        kolom.className = "bar-item";
        kolom.title = `${bulan}: ${formatRupiah(nilai)}`;

        const batang = document.createElement("div");
        batang.className = "bar-fill";
        batang.style.height =
            `${Math.min(100, (nilai / batasAtas) * 100)}%`;

        const label = document.createElement("span");
        label.className = "bar-label";

        const [tahun, nomorBulan] = bulan.split("-");

        label.textContent = new Date(
            Number(tahun),
            Number(nomorBulan) - 1,
            1
        ).toLocaleDateString("id-ID", {
            month: "short"
        });

        kolom.append(batang, label);
        barPlot.appendChild(kolom);
    });
}

// Tombol Tampilkan
formFilter.addEventListener("submit", function (event) {
    event.preventDefault();
    filterLaporan();
});

// Inisialisasi halaman
muatPilihanKendaraan();

// Rentang tanggal awal secara default: semua tanggal
filterLaporan();
