
const namaKendaraan = document.getElementById("namaKendaraan");
const nomorPlat = document.getElementById("nomorPlat");
const tahunKendaraan = document.getElementById("tahunKendaraan");
const tanggalServis = document.getElementById("tanggalServis");
const jenisServis = document.getElementById("jenisServis");
const jarakTempuh = document.getElementById("jarakTempuh");
const biaya = document.getElementById("biaya");
const catatan = document.getElementById("catatan");
const ikonKendaraan = document.getElementById("ikonKendaraan");

const btnEdit = document.getElementById("btnEdit");
const btnHapus = document.getElementById("btnHapus");
const pesanDetail = document.getElementById("pesanDetail");

const KEY_SERVIS = "servisku_riwayat_servis";
const KEY_KENDARAAN = "servisku_kendaraan";

const parameter = new URLSearchParams(window.location.search);
const idServis = parameter.get("id");


// Membaca data tersimpan
function bacaData(key) {
    try {
        const data = localStorage.getItem(key);
        return data ? JSON.parse(data) : [];
    } catch (error) {
        console.error("Gagal membaca data:", error);
        return [];
    }
}

// Format tanggal
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

// Format rupiah
function formatRupiah(nilai) {
    return "Rp. " + Number(nilai || 0).toLocaleString("id-ID");
}

// Ikon kendaraan
const ikonMobil = `
<svg viewBox="0 0 64 64" aria-label="Ikon mobil">
    <path fill="currentColor"
        d="M13 27 18 13Q20 8 26 8H38Q44 8 46 13L51 27Q58 29 58 37V49Q58 52 55 52H51V57H44V52H20V57H13V52H9Q6 52 6 49V37Q6 29 13 27Z"/>
    <path fill="white" d="M20 16Q21 13 25 13H39Q43 13 44 16L47 26H17Z"/>
    <circle cx="15" cy="39" r="4" fill="white"/>
    <circle cx="49" cy="39" r="4" fill="white"/>
</svg>`;

const ikonMotor = `
<svg viewBox="0 0 100 80" aria-label="Ikon motor">
    <circle cx="19" cy="59" r="13" fill="none"
        stroke="currentColor" stroke-width="5"/>
    <circle cx="81" cy="59" r="13" fill="none"
        stroke="currentColor" stroke-width="5"/>
    <path d="M19 59 37 37 56 59 36 59 48 43 68 43 81 59"
        fill="none" stroke="currentColor" stroke-width="5"
        stroke-linecap="round" stroke-linejoin="round"/>
    <path d="M68 43 75 32H85"
        fill="none" stroke="currentColor" stroke-width="5"
        stroke-linecap="round"/>
    <path d="M34 35H51L58 40H42"
        fill="currentColor" stroke="currentColor" stroke-width="3"/>
    <circle cx="44" cy="12" r="7" fill="currentColor"/>
    <path d="M42 21 34 34 49 39M40 25 54 29H67"
        fill="none" stroke="currentColor" stroke-width="6"
        stroke-linecap="round" stroke-linejoin="round"/>
    <path d="M48 39 59 48H68"
        fill="none" stroke="currentColor" stroke-width="5"
        stroke-linecap="round"/>
</svg>`;

// Menampilkan informasi kendaraan
function tampilkanDetail() {
    const riwayat = bacaData(KEY_SERVIS);
    const daftarKendaraan = bacaData(KEY_KENDARAAN);

    const dataTersimpan = riwayat.find(
        item => String(item.id) === String(idServis)
    );

    const data = dataTersimpan ||
        dataContoh.find(
            item => String(item.id) === String(idServis)
        );

    if (!data) {
        document.querySelector(".detail-card").hidden = true;
        document.querySelector(".detail-actions").hidden = true;
        pesanDetail.hidden = false;
        pesanDetail.textContent = "Data servis tidak ditemukan.";
        return;
    }

    let savedServices = [];

    try {
        savedServices = JSON.parse(
            localStorage.getItem("serviskuServices") || "[]"
        );
    } catch (error) {
        savedServices = [];
    }

    let currentService = savedServices[selectedIndex] || {
        vehicle: "Toyota Avanza",
        plate: "BP 1234 KZ",
        year: "2018",
        date: "2026-05-12",
        type: "Ganti Oli Mesin",
        distance: "1980000",
        cost: "250000",
        notes: "Penggantian Oli Mesin dan Filter Oli"
    };

    function renderDetail() {
        document.getElementById("detailVehicleName").textContent =
            currentService.vehicle || "Toyota Avanza";
        document.getElementById("detailPlate").textContent =
            currentService.plate || "BP 1234 KZ";
        document.getElementById("detailYear").textContent =
            "Tahun " + (currentService.year || "2018");
        document.getElementById("detailDate").textContent =
            formatDate(currentService.date);
        document.getElementById("detailType").textContent =
            currentService.type || "-";
        document.getElementById("detailDistance").textContent =
            (currentService.distance || "1980000") + " km";
        document.getElementById("detailCost").textContent =
            formatCurrency(currentService.cost);
        document.getElementById("namaBengkel").textContent =
            currentService.Bengkel || "Surya Bengkel";
        document.getElementById("detailNotes").textContent =
            currentService.notes || "-";
    }

    renderDetail();

    document.getElementById("editDetail").addEventListener("click", () => {
        location.href = "editdata.html?edit=" + selectedIndex;
    });
}

 // Tombol Edit

btnEdit.addEventListener("click", function () {
    if (!idServis) {
        alert("ID servis tidak ditemukan. Buka detail melalui riwayat servis.");
        return;
    }

    window.location.href =
        "editdata.html?editId=" + encodeURIComponent(idServis);
});

 // Tombol Hapus
btnHapus.addEventListener("click", function () {
    if (!idServis) {
        alert("ID servis tidak ditemukan.");
        return;
    }

    const yakin = confirm(
        "Apakah kamu yakin ingin menghapus riwayat servis ini?"
    );

    if (!yakin) {
        return;
    }

    const riwayat = bacaData(KEY_SERVIS);

    const index = riwayat.findIndex(
        item => String(item.id) === String(idServis)
    );

    if (index === -1) {
        alert("Data servis tidak ditemukan.");
        return;
    }

    riwayat.splice(index, 1);

    try {
        localStorage.setItem(
            KEY_SERVIS,
            JSON.stringify(riwayat)
        );

        alert("Riwayat servis berhasil dihapus.");

        window.location.href = "servis1.html";
    } catch (error) {
        console.error("Gagal menghapus data servis:", error);
        alert("Data gagal dihapus. Silakan coba lagi.");
    }
});


tampilkanDetail();
