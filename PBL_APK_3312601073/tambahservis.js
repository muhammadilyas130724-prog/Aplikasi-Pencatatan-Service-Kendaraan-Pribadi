
const form = document.getElementById("formTambahServis");
const selectKendaraan = document.getElementById("namaKendaraan");
const selectJenis = document.getElementById("jenisServis");
const inputTanggal = document.getElementById("tanggalServis");
const inputJarak = document.getElementById("jarakTempuh");
const inputBiaya = document.getElementById("biaya");
const inputSelanjutnya = document.getElementById("servisSelanjutnya");
const inputCatatan = document.getElementById("catatan");
const pesanForm = document.getElementById("pesanForm");
const btnBatal = document.getElementById("btnBatal");

const KEY_KENDARAAN = "servisku_kendaraan";
const KEY_SERVIS = "servisku_riwayat_servis";

// Format tanggal untuk penyimpanan aman sebagai YYYY-MM-DD
function tanggalHariIni() {
    const sekarang = new Date();
    const tahun = sekarang.getFullYear();
    const bulan = String(sekarang.getMonth() + 1).padStart(2, "0");
    const hari = String(sekarang.getDate()).padStart(2, "0");

    return `${tahun}-${bulan}-${hari}`;
}

// Memuat daftar kendaraan
function muatPilihanKendaraan() {
    let kendaraan = [];

    try {
        const tersimpan = localStorage.getItem(KEY_KENDARAAN);

        if (tersimpan) {
            const data = JSON.parse(tersimpan);

            if (Array.isArray(data)) {
                kendaraan = data;
            }
        }
    } catch (error) {
        console.error("Gagal membaca daftar kendaraan.", error);
    }

    // Data contoh apabila daftar kendaraan belum tersimpan
    if (kendaraan.length === 0) {
        kendaraan = [
            { id: 1, nama: "Toyota Avanza" },
            { id: 2, nama: "Honda Beat" },
            { id: 3, nama: "Honda Scoopy" }
        ];
    }

    selectKendaraan.replaceChildren();

    const pilihanAwal = document.createElement("option");
    pilihanAwal.value = "";
    pilihanAwal.textContent = "Masukkan Nama Kendaraan Anda";
    pilihanAwal.disabled = true;
    pilihanAwal.selected = true;

    selectKendaraan.appendChild(pilihanAwal);

    kendaraan.forEach(item => {
        const option = document.createElement("option");

        option.value = item.id;
        option.textContent = item.nama;
        option.dataset.nama = item.nama;

        selectKendaraan.appendChild(option);
    });
}
function isiFormEdit() {
    if (!modeEdit) return;

    const riwayat = bacaData(KEY_SERVIS);

    dataEdit = riwayat.find(
        item => String(item.id) === String(editId)
    );

    if (!dataEdit) {
        alert("Data servis tidak ditemukan.");
        window.location.href = "servis1.html";
        return;
    }

    judulForm.textContent = "Edit Data Servis";

    selectKendaraan.value = String(dataEdit.kendaraanId || "");

    inputTanggal.value = dataEdit.tanggal || "";
    selectJenis.value = dataEdit.jenis || "";
    inputJarak.value = dataEdit.jarakTempuh ?? "";
    inputBiaya.value = dataEdit.biaya ?? "";
    inputSelanjutnya.value = dataEdit.servisSelanjutnya || "";
    inputCatatan.value = dataEdit.catatan || "";
}

// Tombol Batal kembali ke halaman riwayat servis
btnBatal.addEventListener("click", function () {
    window.location.href = "servis1.html";
});

// Simpan data servis
form.addEventListener("submit", function (event) {
    event.preventDefault();
    pesanForm.textContent = "";

    const pilihan = selectKendaraan.selectedOptions[0];
    const namaKendaraan = pilihan?.dataset.nama || "";
    const kendaraanId = selectKendaraan.value;

    const tanggal = inputTanggal.value;
    const jenis = selectJenis.value;
    const jarak = Number(inputJarak.value);
    const biaya = Number(inputBiaya.value);
    const selanjutnya = inputSelanjutnya.value;
    const catatan = inputCatatan.value.trim();

    if (!kendaraanId || !namaKendaraan || !tanggal || !jenis) {
        pesanForm.textContent =
            "Silakan lengkapi data kendaraan, tanggal, dan jenis servis.";
        return;
    }

    if (
        !Number.isFinite(jarak) ||
        jarak < 0 ||
        !Number.isFinite(biaya) ||
        biaya < 0
    ) {
        pesanForm.textContent =
            "Jarak tempuh dan biaya harus berupa angka yang valid.";
        return;
    }

    if (selanjutnya && selanjutnya < tanggal) {
        pesanForm.textContent =
            "Tanggal servis selanjutnya tidak boleh sebelum tanggal servis.";
        return;
    }

    const dataBaru = {
        id: Date.now(),
        kendaraanId: kendaraanId,
        kendaraan: namaKendaraan,
        tanggal: tanggal,
        jenis: jenis,
        jarakTempuh: jarak,
        biaya: biaya,
        servisSelanjutnya: selanjutnya,
        catatan: catatan
    };

    let riwayat = [];

    try {
        const tersimpan = localStorage.getItem(KEY_SERVIS);

        if (tersimpan) {
            const data = JSON.parse(tersimpan);

            if (!Array.isArray(data)) {
                throw new Error("Format riwayat servis tidak valid.");
            }

            riwayat = data;
        }

        riwayat.push(dataBaru);

        localStorage.setItem(
            KEY_SERVIS,
            JSON.stringify(riwayat)
        );

        alert("Data servis berhasil disimpan!");

        window.location.href ="servis1.html";
    } catch (error) {
        console.error("Gagal menyimpan servis.", error);

        pesanForm.textContent =
            "Data gagal disimpan. Periksa penyimpanan browser kamu.";
    }
});

// Isi pilihan kendaraan saat halaman dibuka
muatPilihanKendaraan();
isiFormEdit();