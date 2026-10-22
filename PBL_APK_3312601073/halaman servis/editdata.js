
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
const judulForm = document.getElementById("judulForm");

const KEY_KENDARAAN = "servisku_kendaraan";
const KEY_SERVIS = "servisku_riwayat_servis";

const params = new URLSearchParams(window.location.search);
const editId = params.get("editId");
const modeEdit = editId !== null && editId !== "";

let dataEdit = null;

// Membaca data dari localStorage
function bacaData(key) {
    try {
        const isi = localStorage.getItem(key);

        if (isi === null) return [];

        const data = JSON.parse(isi);
        return Array.isArray(data) ? data : [];
    } catch (error) {
        console.error("Gagal membaca data:", error);
        return [];
    }
}

// Memuat daftar kendaraan
function muatPilihanKendaraan() {
    let kendaraan = bacaData(KEY_KENDARAAN);

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
    pilihanAwal.textContent = "Pilih Kendaraan";
    pilihanAwal.disabled = true;
    pilihanAwal.selected = true;

    selectKendaraan.appendChild(pilihanAwal);

    kendaraan.forEach(item => {
        const option = document.createElement("option");

        option.value = String(item.id);
        option.textContent = item.nama || item.namaKendaraan || "Kendaraan";
        option.dataset.nama =
            item.nama || item.namaKendaraan || "Kendaraan";

        selectKendaraan.appendChild(option);
    });
}

// Menyiapkan formulir untuk edit
function isiFormEdit() {
    if (!modeEdit) return;

    const riwayat = bacaData(KEY_SERVIS);

    dataEdit = riwayat.find(
        item => String(item.id) === String(editId)
    );

    if (!dataEdit) {
        alert(
            "Data servis tidak ditemukan di penyimpanan. " +
            "Pastikan data tersebut sudah tersimpan."
        );

        window.location.href =
            "detailservis.html?id=" + encodeURIComponent(editId);

        return;
    }

    judulForm.textContent = "Edit Data Servis";

    // Memilih kendaraan berdasarkan ID atau nama
    const pilihanKendaraan = Array.from(
        selectKendaraan.options
    ).find(option => {
        return (
            option.value === String(dataEdit.kendaraanId) ||
            option.dataset.nama === dataEdit.kendaraan
        );
    });

    if (pilihanKendaraan) {
        selectKendaraan.value = pilihanKendaraan.value;
    } else {
        // Jika kendaraan lama tidak ada di daftar, tambahkan
        const option = document.createElement("option");

        option.value = String(
            dataEdit.kendaraanId || dataEdit.kendaraan
        );
        option.textContent = dataEdit.kendaraan || "Kendaraan";
        option.dataset.nama = dataEdit.kendaraan || "Kendaraan";

        selectKendaraan.appendChild(option);
        selectKendaraan.value = option.value;
    }

    inputTanggal.value = dataEdit.tanggal || "";
    selectJenis.value = dataEdit.jenis || "";
    inputJarak.value = dataEdit.jarakTempuh ?? "";
    inputBiaya.value = dataEdit.biaya ?? "";
    inputSelanjutnya.value = dataEdit.servisSelanjutnya || "";
    inputCatatan.value = dataEdit.catatan || "";
}

// Tombol Batal
btnBatal.addEventListener("click", function () {
    if (modeEdit) {
        window.location.href =
            "detailservis.html?id=" + encodeURIComponent(editId);
    } else {
        window.location.href = "servis.html";
    }
});

// Simpan data baru atau perbarui data lama
form.addEventListener("submit", function (event) {
    event.preventDefault();
    pesanForm.textContent = "";

    const pilihan = selectKendaraan.selectedOptions[0];

    const kendaraanId = selectKendaraan.value;
    const namaKendaraan = pilihan?.dataset.nama || "";
    const tanggal = inputTanggal.value;
    const jenis = selectJenis.value;
    const jarak = Number(inputJarak.value);
    const biaya = Number(inputBiaya.value);
    const selanjutnya = inputSelanjutnya.value;
    const catatan = inputCatatan.value.trim();

    if (!kendaraanId || !namaKendaraan || !tanggal || !jenis) {
        pesanForm.textContent =
            "Lengkapi nama kendaraan, tanggal, dan jenis servis.";
        return;
    }

    if (
        inputJarak.value.trim() === "" ||
        inputBiaya.value.trim() === "" ||
        !Number.isFinite(jarak) ||
        jarak < 0 ||
        !Number.isFinite(biaya) ||
        biaya < 0
    ) {
        pesanForm.textContent =
            "Jarak tempuh dan biaya harus diisi dengan angka yang valid.";
        return;
    }

    if (selanjutnya && selanjutnya < tanggal) {
        pesanForm.textContent =
            "Tanggal servis selanjutnya tidak boleh sebelum tanggal servis.";
        return;
    }

    try {
        const riwayat = bacaData(KEY_SERVIS);

        const dataBaru = {
            id: modeEdit ? dataEdit.id : Date.now(),
            kendaraanId: kendaraanId,
            kendaraan: namaKendaraan,
            tanggal: tanggal,
            jenis: jenis,
            jarakTempuh: jarak,
            biaya: biaya,
            servisSelanjutnya: selanjutnya,
            catatan: catatan
        };

        if (modeEdit) {
            const index = riwayat.findIndex(
                item => String(item.id) === String(editId)
            );

            if (index === -1) {
                throw new Error("Data servis yang akan diedit tidak ditemukan.");
            }

            // Pertahankan ID dan perbarui data lama
            riwayat[index] = {
                ...riwayat[index],
                ...dataBaru
            };
        } else {
            // Mode tambah: masukkan data baru
            riwayat.push(dataBaru);
        }

        localStorage.setItem(
            KEY_SERVIS,
            JSON.stringify(riwayat)
        );

        alert(
            modeEdit
                ? "Data servis berhasil diperbarui!"
                : "Data servis berhasil ditambahkan!"
        );

        // Kembali ke halaman sesuai mode
        if (modeEdit) {
            window.location.href =
                "detailservis.html?id=" + encodeURIComponent(editId);
        } else {
            window.location.href = "servis.html";
        }

    } catch (error) {
        console.error("Gagal menyimpan data servis:", error);

        pesanForm.textContent =
            "Data gagal disimpan. Silakan coba kembali.";
    }
});

// Jalankan ketika halaman dibuka
muatPilihanKendaraan();
isiFormEdit();