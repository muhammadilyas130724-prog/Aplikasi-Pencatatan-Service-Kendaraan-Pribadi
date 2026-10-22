const barisServis = document.querySelectorAll(
    "#serviceTableBody tr"
);

// Data kendaraan contoh
const kendaraan = [
    "Toyota Avanza",
    "Honda Beat",
    "Honda Scoopy"
];

// Hitung jumlah kendaraan unik
const totalKendaraan = new Set(kendaraan).size;

// Hitung total catatan servis
const totalServis = barisServis.length;

// Tampilkan jumlah pada kartu dashboard
document.getElementById("totalKendaraan").textContent =
    totalKendaraan;

document.getElementById("totalServis").textContent =
    totalServis;

// Ambil tanggal servis terbaru dari tabel
const tanggalTerakhir = barisServis.length
    ? barisServis[barisServis.length - 1]
        .querySelectorAll("td")[2].textContent.trim()
    : "-";

document.getElementById("serviceTerakhir").textContent =
    tanggalTerakhir;
