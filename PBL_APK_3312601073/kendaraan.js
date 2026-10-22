const daftarKendaraan = document.getElementById("daftarKendaraan");
const cariKendaraan = document.getElementById("cariKendaraan");
const btnTambah = document.getElementById("btnTambah");
const modal = document.getElementById("modalKendaraan");
const form = document.getElementById("formKendaraan");
const judulForm = document.getElementById("judulForm");
const pesanForm = document.getElementById("pesanForm");
const pesanKosong = document.getElementById("pesanKosong");

const namaInput = document.getElementById("namaKendaraan");
const platInput = document.getElementById("nomorPlat");
const tahunInput = document.getElementById("tahunKendaraan");
const jenisInput = document.getElementById("jenisKendaraan");

const btnTutup = document.getElementById("btnTutup");
const btnBatal = document.getElementById("btnBatal");

const STORAGE_KEY = "servisku_kendaraan";

const dataAwal = [
    {
        id: 1,
        nama: "Toyota Avanza",
        plat: "BP 1234 KZ",
        tahun: 2018,
        jenis: "mobil"
    },
    {
        id: 2,
        nama: "Honda Beat",
        plat: "BP 4567 MN",
        tahun: 2019,
        jenis: "motor"
    }
];

let kendaraan = muatData();
let idEdit = null;

// Ikon SVG mobil
const ikonMobil = `
<svg viewBox="0 0 64 64" aria-label="Ikon mobil">
    <path fill="currentColor"
        d="M13 27 18 13Q20 8 26 8H38Q44 8 46 13L51 27Q58 29 58 37V49Q58 52 55 52H51V57H44V52H20V57H13V52H9Q6 52 6 49V37Q6 29 13 27Z"/>
    <path fill="white"
        d="M20 16Q21 13 25 13H39Q43 13 44 16L47 26H17Z"/>
    <circle cx="15" cy="39" r="4" fill="white"/>
    <circle cx="49" cy="39" r="4" fill="white"/>
</svg>`;

// Ikon SVG motor

const ikonMotor = `
<svg viewBox="0 0 100 80"
     role="img"
     aria-label="Ikon sepeda motor"
     xmlns="http://www.w3.org/2000/svg">

    <!-- Roda depan dan belakang -->
    <circle cx="19" cy="59" r="13"
            fill="none" stroke="currentColor" stroke-width="5"/>
    <circle cx="81" cy="59" r="13"
            fill="none" stroke="currentColor" stroke-width="5"/>

    <!-- Rangka motor -->
    <path d="M19 59 L37 37 L56 59 L36 59 L48 43 L68 43 L81 59"
          fill="none" stroke="currentColor"
          stroke-width="5" stroke-linecap="round"
          stroke-linejoin="round"/>

    <!-- Bagian depan dan setang -->
    <path d="M68 43 L75 32 L85 32"
          fill="none" stroke="currentColor"
          stroke-width="5" stroke-linecap="round"
          stroke-linejoin="round"/>

    <!-- Jok -->
    <path d="M34 35 L51 35 L58 40 L42 40"
          fill="currentColor" stroke="currentColor"
          stroke-width="3" stroke-linejoin="round"/>

    <!-- Pengendara -->
    <circle cx="44" cy="12" r="7" fill="currentColor"/>

    <path d="M42 21 L34 34 L49 39
             M40 25 L54 29 L67 29
             M35 33 L29 43"
          fill="none" stroke="currentColor"
          stroke-width="6" stroke-linecap="round"
          stroke-linejoin="round"/>

    <!-- Kaki pengendara -->
    <path d="M48 39 L59 48 L68 48"
          fill="none" stroke="currentColor"
          stroke-width="5" stroke-linecap="round"
          stroke-linejoin="round"/>
</svg>`;

function muatData() {
    try {
        const tersimpan = localStorage.getItem(STORAGE_KEY);

        if (tersimpan !== null) {
            const data = JSON.parse(tersimpan);

            if (Array.isArray(data)) {
                return data;
            }
        }
    } catch (error) {
        console.warn("Data kendaraan tidak dapat dibaca.", error);
    }

    return dataAwal.map(item => ({ ...item }));
}

function simpanData() {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(kendaraan));
        return true;
    } catch (error) {
        console.error("Data kendaraan gagal disimpan.", error);
        alert("Data gagal disimpan di browser.");
        return false;
    }
}

function buatIkon(jenis) {
    const pembungkus = document.createElement("div");
    pembungkus.className = "vehicle-icon";
    pembungkus.dataset.type = jenis;
    pembungkus.innerHTML = jenis === "motor" ? ikonMotor : ikonMobil;
    return pembungkus;
}

function buatTombol(aksi, id) {
    const tombol = document.createElement("button");
    tombol.type = "button";
    tombol.dataset.action = aksi;
    tombol.dataset.id = id;

    const svgEdit = `
        <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M12 4H4v16h16v-8"/>
            <path d="m10 14 9-9 3 3-9 9-4 1z"/>
        </svg>`;

    const svgHapus = `
        <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M3 6h18M8 6V3h8v3M6 6l1 15h10l1-15M10 10v7M14 10v7"/>
        </svg>`;

    if (aksi === "edit") {
        tombol.className = "btn-edit";
        tombol.innerHTML = svgEdit + " Edit";
    } else {
        tombol.className = "btn-delete";
        tombol.innerHTML = svgHapus + " Hapus";
    }

    return tombol;
}

function buatKartu(item) {
    const kartu = document.createElement("article");
    kartu.className = "vehicle-card";
    kartu.dataset.id = item.id;

    const ikon = buatIkon(item.jenis);

    const info = document.createElement("div");
    info.className = "vehicle-info";

    const nama = document.createElement("h2");
    nama.textContent = item.nama;

    const plat = document.createElement("p");
    plat.textContent = item.plat;

    const tahun = document.createElement("p");
    tahun.textContent = `Tahun ${item.tahun}`;

    info.append(nama, plat, tahun);

    const aksi = document.createElement("div");
    aksi.className = "vehicle-actions";
    aksi.append(
        buatTombol("edit", item.id),
        buatTombol("delete", item.id)
    );

    kartu.append(ikon, info, aksi);

    return kartu;
}

function tampilkanKendaraan(kataKunci = "") {
    const kata = kataKunci.trim().toLowerCase();

    const hasil = kendaraan.filter(item =>
        item.nama.toLowerCase().includes(kata) ||
        item.plat.toLowerCase().includes(kata)
    );

    daftarKendaraan.replaceChildren();

    hasil.forEach(item => {
        daftarKendaraan.appendChild(buatKartu(item));
    });

    pesanKosong.hidden = hasil.length > 0;
}

function bukaForm(item = null) {
    form.reset();
    pesanForm.textContent = "";
    idEdit = item ? item.id : null;

    if (item) {
        judulForm.textContent = "Edit Kendaraan";
        namaInput.value = item.nama;
        platInput.value = item.plat;
        tahunInput.value = item.tahun;
        jenisInput.value = item.jenis;
    } else {
        judulForm.textContent = "Tambah Kendaraan";
        jenisInput.value = "mobil";
    }

    modal.hidden = false;
    namaInput.focus();
}

function tutupForm() {
    modal.hidden = true;
    form.reset();
    pesanForm.textContent = "";
    idEdit = null;
}

btnTambah.addEventListener("click", () => bukaForm());
btnTutup.addEventListener("click", tutupForm);
btnBatal.addEventListener("click", tutupForm);

modal.addEventListener("click", event => {
    if (event.target === modal) {
        tutupForm();
    }
});

document.addEventListener("keydown", event => {
    if (event.key === "Escape" && !modal.hidden) {
        tutupForm();
    }
});

// Pencarian langsung saat pengguna mengetik
cariKendaraan.addEventListener("input", () => {
    tampilkanKendaraan(cariKendaraan.value);
});

// Tombol Edit dan Hapus
daftarKendaraan.addEventListener("click", event => {
    const tombol = event.target.closest("button[data-action]");

    if (!tombol) return;

    const id = Number(tombol.dataset.id);
    const item = kendaraan.find(data => data.id === id);

    if (!item) return;

    if (tombol.dataset.action === "edit") {
        bukaForm(item);
        return;
    }

    const yakin = confirm(
        `Apakah kamu yakin ingin menghapus ${item.nama}?`
    );

    if (!yakin) return;

    const dataSebelum = kendaraan;
    kendaraan = kendaraan.filter(data => data.id !== id);

    if (!simpanData()) {
        kendaraan = dataSebelum;
        return;
    }

    tampilkanKendaraan(cariKendaraan.value);
});

// Simpan kendaraan baru atau perubahan data
form.addEventListener("submit", event => {
    event.preventDefault();
    pesanForm.textContent = "";

    const nama = namaInput.value.trim();
    const plat = platInput.value.trim().toUpperCase();
    const tahun = Number(tahunInput.value);
    const jenis = jenisInput.value;

    if (!nama || !plat) {
        pesanForm.textContent = "Nama dan nomor plat wajib diisi.";
        return;
    }

    const tahunSekarang = new Date().getFullYear();

    if (!Number.isInteger(tahun) || tahun < 1900 || tahun > tahunSekarang) {
        pesanForm.textContent = "Masukkan tahun kendaraan yang valid.";
        return;
    }

    const platDipakai = kendaraan.some(item =>
        item.plat.toLowerCase() === plat.toLowerCase() &&
        item.id !== idEdit
    );

    if (platDipakai) {
        pesanForm.textContent = "Nomor plat tersebut sudah terdaftar.";
        return;
    }

    const dataSebelum = kendaraan.map(item => ({ ...item }));

    if (idEdit !== null) {
        kendaraan = kendaraan.map(item =>
            item.id === idEdit
                ? { ...item, nama, plat, tahun, jenis }
                : item
        );
    } else {
        const idBaru = kendaraan.length
            ? Math.max(...kendaraan.map(item => item.id)) + 1
            : 1;

        kendaraan.push({
            id: idBaru,
            nama,
            plat,
            tahun,
            jenis
        });
    }

    if (!simpanData()) {
        kendaraan = dataSebelum;
        return;
    }

    tutupForm();
    tampilkanKendaraan(cariKendaraan.value);
});

// Tampilkan data saat halaman pertama kali dibuka
tampilkanKendaraan();
