
"use strict";

const KEY_KENDARAAN = "servisku_kendaraan";
const KEY_SERVIS = "servisku_riwayat_servis";

const form = document.getElementById("formTambahServis");
const selectKendaraan = document.getElementById("namaKendaraan");
const inputTanggal = document.getElementById("tanggalServis");
const inputServisBerikutnya = document.getElementById("servisSelanjutnya");
const inputCatatan = document.getElementById("catatan");
const jumlahKarakter = document.getElementById("jumlahKarakter");
const tombolBatal = document.getElementById("btnBatal");

// Membaca data array dari localStorage.
function bacaData(key) {
  try {
    const raw = localStorage.getItem(key);

    if (raw === null) return [];

    const data = JSON.parse(raw);

    if (Array.isArray(data)) return data;

    if (data && Array.isArray(data.kendaraan)) {
      return data.kendaraan;
    }

    if (data && Array.isArray(data.servis)) {
      return data.servis;
    }

    if (data && Array.isArray(data.riwayat)) {
      return data.riwayat;
    }

    if (data && Array.isArray(data.data)) {
      return data.data;
    }

    return [];
  } catch (error) {
    console.error("Gagal membaca penyimpanan:", error);
    return [];
  }
}

function ambilNilai(item, properti, nilaiDefault = "") {
  for (const key of properti) {
    const value = item?.[key];

    if (
      value !== undefined &&
      value !== null &&
      String(value).trim() !== ""
    ) {
      return String(value).trim();
    }
  }

  return nilaiDefault;
}

function namaKendaraan(item) {
  return ambilNilai(item, [
    "nama",
    "namaKendaraan",
    "nama_kendaraan",
    "kendaraan",
    "vehicle",
    "merekModel",
    "merek_model"
  ], "Kendaraan");
}

function platKendaraan(item) {
  return ambilNilai(item, [
    "plat",
    "nomorPlat",
    "nomor_plat",
    "noPlat",
    "no_plat",
    "nomorPolisi",
    "nomor_polisi"
  ], "-");
}

function jenisKendaraan(item) {
  const jenis = ambilNilai(item, [
    "jenis",
    "tipe",
    "jenisKendaraan",
    "jenis_kendaraan",
    "kategori"
  ], "");

  if (jenis) return jenis;

  const nama = namaKendaraan(item).toLowerCase();

  return /\b(beat|scoopy|vario|supra|mio|nmax|pcx)\b/.test(nama)
    ? "Motor"
    : "Mobil";
}

// Menampilkan kendaraan yang telah tersimpan.
function tampilkanPilihanKendaraan() {
  const kendaraan = bacaData(KEY_KENDARAAN);

  selectKendaraan.replaceChildren();

  const pilihanAwal = document.createElement("option");
  pilihanAwal.value = "";
  pilihanAwal.textContent = kendaraan.length
    ? "Pilih kendaraan Anda"
    : "Belum ada kendaraan tersimpan";

  selectKendaraan.appendChild(pilihanAwal);

  kendaraan.forEach((item, index) => {
    const option = document.createElement("option");

    // Index dipakai agar kendaraan tanpa ID tetap bisa dipilih.
    option.value = String(index);
    option.textContent = `${namaKendaraan(item)} — ${platKendaraan(item)}`;

    selectKendaraan.appendChild(option);
  });
}

// Penghitung karakter catatan.
inputCatatan.addEventListener("input", () => {
  jumlahKarakter.textContent = inputCatatan.value.length;
});

// Tombol Batal kembali ke halaman Riwayat Servis.
tombolBatal.addEventListener("click", () => {
  window.location.href = "servis1.html";
});

// Format tanggal hari ini menggunakan waktu lokal.
function tanggalHariIni() {
  const sekarang = new Date();
  const tahun = sekarang.getFullYear();
  const bulan = String(sekarang.getMonth() + 1).padStart(2, "0");
  const hari = String(sekarang.getDate()).padStart(2, "0");

  return `${tahun}-${bulan}-${hari}`;
}

// Tanggal servis tidak boleh melebihi hari ini.
inputTanggal.max = tanggalHariIni();

// Simpan riwayat servis.
form.addEventListener("submit", (event) => {
  event.preventDefault();

  const kendaraan = bacaData(KEY_KENDARAAN);
  const indexKendaraan = selectKendaraan.value;

  if (indexKendaraan === "" || !kendaraan[Number(indexKendaraan)]) {
    alert("Silakan pilih kendaraan yang akan diservis.");
    selectKendaraan.focus();
    return;
  }

  const kendaraanDipilih = kendaraan[Number(indexKendaraan)];

  const jarak = Number(
    document.getElementById("jarakTempuh").value
  );

  const biaya = Number(
    document.getElementById("biaya").value
  );

  const tanggal = inputTanggal.value;
  const tanggalBerikutnya = inputServisBerikutnya.value;

  if (!Number.isFinite(jarak) || jarak < 0) {
    alert("Jarak tempuh harus berupa angka nol atau lebih.");
    return;
  }

  if (!Number.isFinite(biaya) || biaya < 0) {
    alert("Biaya servis harus berupa angka nol atau lebih.");
    return;
  }

  if (!tanggal) {
    alert("Silakan isi tanggal servis.");
    inputTanggal.focus();
    return;
  }

  if (tanggal > tanggalHariIni()) {
    alert("Tanggal servis tidak boleh melebihi hari ini.");
    inputTanggal.focus();
    return;
  }

  if (tanggalBerikutnya && tanggalBerikutnya < tanggal) {
    alert("Tanggal servis selanjutnya tidak boleh sebelum tanggal servis ini.");
    inputServisBerikutnya.focus();
    return;
  }

  const semuaServis = bacaData(KEY_SERVIS);

  const dataBaru = {
    id: "servis-" + Date.now() + "-" +
      Math.random().toString(36).slice(2, 7),

    kendaraan: namaKendaraan(kendaraanDipilih),
    namaKendaraan: namaKendaraan(kendaraanDipilih),

    plat: platKendaraan(kendaraanDipilih),
    tahun: ambilNilai(kendaraanDipilih, ["tahun"], "-"),
    jenisKendaraan: jenisKendaraan(kendaraanDipilih),

    tanggal: tanggal,
    jenis: document.getElementById("jenisServis").value,
    jarakTempuh: jarak,
    biaya: biaya,
    namaBengkel: document.getElementById("namaBengkel").value.trim(),
    servisSelanjutnya: tanggalBerikutnya,
    catatan: inputCatatan.value.trim()
  };

  try {
    semuaServis.push(dataBaru);

    localStorage.setItem(
      KEY_SERVIS,
      JSON.stringify(semuaServis)
    );

    alert("Data servis berhasil disimpan!");

    window.location.href = "servis1.html";
  } catch (error) {
    console.error("Gagal menyimpan servis:", error);
    alert("Data gagal disimpan. Periksa penyimpanan browser.");
  }
});

// Jalankan ketika halaman dimuat.
tampilkanPilihanKendaraan();
