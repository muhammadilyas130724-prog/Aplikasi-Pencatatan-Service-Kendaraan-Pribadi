
"use strict";

const KEY_SERVIS = "servisku_riwayat_servis";
const KEY_KENDARAAN = "servisku_kendaraan";
const KEY_EDIT = "servisku_edit_servis";

const form = document.getElementById("formEditServis");
const selectKendaraan = document.getElementById("namaKendaraan");
const pesanTidakDitemukan = document.getElementById("pesanTidakDitemukan");

const inputJarak = document.getElementById("jarakTempuh");
const inputTanggal = document.getElementById("tanggalServis");
const inputBiaya = document.getElementById("biaya");
const inputJenis = document.getElementById("jenisServis");
const inputBerikutnya = document.getElementById("servisSelanjutnya");
const inputBengkel = document.getElementById("namaBengkel");
const inputCatatan = document.getElementById("catatan");

const parameter = new URLSearchParams(window.location.search);
const idURL = parameter.get("id");

let servisAsli = null;
let dataKendaraan = [];
let idAsli = null;

// Membaca data dari localStorage.
function bacaData(key) {
  try {
    const mentah = localStorage.getItem(key);

    if (mentah === null) return [];

    const data = JSON.parse(mentah);

    if (Array.isArray(data)) return data;

    if (data && Array.isArray(data.servis)) return data.servis;
    if (data && Array.isArray(data.riwayat)) return data.riwayat;
    if (data && Array.isArray(data.kendaraan)) return data.kendaraan;
    if (data && Array.isArray(data.data)) return data.data;

    return [];
  } catch (error) {
    console.error("Gagal membaca data:", error);
    return [];
  }
}

function simpanData(key, data) {
  localStorage.setItem(key, JSON.stringify(data));
}

function ambilNilai(item, keys, defaultValue = "") {
  for (const key of keys) {
    const value = item?.[key];

    if (
      value !== undefined &&
      value !== null &&
      String(value).trim() !== ""
    ) {
      return String(value).trim();
    }
  }

  return defaultValue;
}

function namaKendaraan(item) {
  return ambilNilai(item, [
    "kendaraan",
    "namaKendaraan",
    "nama_kendaraan",
    "vehicle",
    "nama",
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

function tahunKendaraan(item) {
  return ambilNilai(item, ["tahun", "year"], "-");
}

function jenisKendaraan(item) {
  const tipe = ambilNilai(item, [
    "jenisKendaraan",
    "jenis_kendaraan",
    "tipeKendaraan",
    "tipe_kendaraan",
    "jenis",
    "tipe"
  ]).toLowerCase();

  if (tipe.includes("motor")) return "Motor";
  if (tipe.includes("mobil")) return "Mobil";

  const nama = namaKendaraan(item).toLowerCase();

  return /\b(beat|scoopy|vario|supra|mio|nmax|pcx)\b/.test(nama)
    ? "Motor"
    : "Mobil";
}

// Mengubah berbagai format tanggal menjadi YYYY-MM-DD.
function keTanggalInput(value) {
  if (!value || value === "-") return "";

  const teks = String(value).trim();

  if (/^\d{4}-\d{2}-\d{2}$/.test(teks)) {
    return teks;
  }

  const namaBulan = {
    januari: "01",
    februari: "02",
    maret: "03",
    april: "04",
    mei: "05",
    juni: "06",
    juli: "07",
    agustus: "08",
    september: "09",
    oktober: "10",
    november: "11",
    desember: "12"
  };

  const indonesia = teks.match(
    /^(\d{1,2})\s+([a-zA-Z]+)\s+(\d{4})$/
  );

  if (indonesia) {
    const bulan = namaBulan[indonesia[2].toLowerCase()];

    if (bulan) {
      return `${indonesia[3]}-${bulan}-${indonesia[1].padStart(2, "0")}`;
    }
  }

  const dmy = teks.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);

  if (dmy) {
    return `${dmy[3]}-${dmy[2]}-${dmy[1]}`;
  }

  return "";
}

// Menemukan ID asli, termasuk data lama tanpa ID.
function cariDataEdit() {
  const semuaServis = bacaData(KEY_SERVIS);

  let dataPilihan = null;

  try {
    dataPilihan = JSON.parse(localStorage.getItem(KEY_EDIT) || "null");
  } catch (error) {
    console.error("Data edit tidak valid:", error);
  }

  // Utamakan ID yang dikirim lewat URL.
  if (idURL) {
    const ditemukan = semuaServis.find((item, index) => {
      const id = String(
        item.id ?? item._id ?? item.uuid ?? `servis-${index}`
      );

      return id === idURL;
    });

    if (ditemukan) return ditemukan;
  }

  // Gunakan data yang dikirim dari halaman Detail Servis.
  if (dataPilihan) {
    const idPilihan = dataPilihan.id ??
      dataPilihan._id ??
      dataPilihan.uuid;

    if (idPilihan !== undefined && idPilihan !== null) {
      const ditemukan = semuaServis.find((item, index) => {
        const id = String(
          item.id ?? item._id ?? item.uuid ?? `servis-${index}`
        );

        return id === String(idPilihan);
      });

      if (ditemukan) return ditemukan;
    }

    // Fallback untuk data lama yang tidak memiliki ID.
    const ditemukan = semuaServis.find(item =>
      namaKendaraan(item) === namaKendaraan(dataPilihan) &&
      ambilNilai(item, ["tanggal", "tanggalServis", "date"]) ===
        ambilNilai(dataPilihan, ["tanggal", "tanggalServis", "date"]) &&
      ambilNilai(item, ["jenis", "jenisServis", "type"]) ===
        ambilNilai(dataPilihan, ["jenis", "jenisServis", "type"])
    );

    if (ditemukan) return ditemukan;

    // Jangan mengedit objek yang tidak lagi ada di daftar.
    return null;
  }

  return null;
}

// Memasukkan pilihan kendaraan yang tersimpan.
function tampilkanPilihanKendaraan() {
  dataKendaraan = bacaData(KEY_KENDARAAN);

  selectKendaraan.replaceChildren();

  const awal = document.createElement("option");
  awal.value = "";
  awal.textContent = "Pilih kendaraan";
  selectKendaraan.appendChild(awal);

  dataKendaraan.forEach((item, index) => {
    const option = document.createElement("option");
    option.value = String(index);
    option.textContent =
      `${namaKendaraan(item)} — ${platKendaraan(item)}`;

    selectKendaraan.appendChild(option);
  });

  // Jika data kendaraan lama sudah tidak tersedia,
  // tampilkan nama kendaraan servis agar informasi tidak hilang.
  if (
    servisAsli &&
    !dataKendaraan.some(item =>
      namaKendaraan(item) === namaKendaraan(servisAsli)
    )
  ) {
    const option = document.createElement("option");
    option.value = "__kendaraan_lama__";
    option.textContent = namaKendaraan(servisAsli);
    selectKendaraan.appendChild(option);
  }
}

// Mengisi ringkasan kendaraan di bagian atas.
function tampilkanRingkasan(item) {
  const nama = namaKendaraan(item);
  const tipe = jenisKendaraan(item);

  document.getElementById("ringkasanNama").textContent = nama;
  document.getElementById("ringkasanPlat").textContent =
    platKendaraan(item);
  document.getElementById("ringkasanTahun").textContent =
    tahunKendaraan(item);

  document.getElementById("vehiclePhoto").textContent =
    tipe === "Motor" ? "🏍️" : "🚘";

  document.getElementById("ikonBadge").textContent =
    tipe === "Motor" ? "🏍️" : "🚘";

  document.getElementById("teksBadge").textContent = tipe;
}

// Mengisi semua kolom dengan data servis lama.
function isiForm(item) {
  const semuaKendaraan = bacaData(KEY_KENDARAAN);

  const pilihan = semuaKendaraan.findIndex(k =>
    namaKendaraan(k) === namaKendaraan(item) &&
    platKendaraan(k) === platKendaraan(item)
  );

  if (pilihan !== -1) {
    selectKendaraan.value = String(pilihan);
  } else {
    selectKendaraan.value = "__kendaraan_lama__";
  }

  inputJarak.value = String(
    ambilNilai(item, [
      "jarakTempuh",
      "jarak_tempuh",
      "odometer",
      "kilometer",
      "km"
    ], "")
  ).replace(/[^\d.-]/g, "");

  inputTanggal.value = keTanggalInput(
    ambilNilai(item, [
      "tanggal",
      "tanggalServis",
      "tanggal_servis",
      "date"
    ])
  );

  const biaya = item.biaya ?? item.harga ?? item.cost ?? 0;

  inputBiaya.value = String(biaya).replace(/[^\d.-]/g, "");

  const jenis = ambilNilai(item, [
    "jenis",
    "jenisServis",
    "jenis_servis",
    "type",
    "serviceType"
  ]);

  // Jika data lama memakai jenis servis yang belum ada di daftar.
  if (
    jenis &&
    ![...inputJenis.options].some(option => option.value === jenis)
  ) {
    const option = document.createElement("option");
    option.value = jenis;
    option.textContent = jenis;
    inputJenis.appendChild(option);
  }

  inputJenis.value = jenis;

  inputBerikutnya.value = keTanggalInput(
    ambilNilai(item, [
      "servisSelanjutnya",
      "servis_selanjutnya",
      "tanggalSelanjutnya",
      "tanggal_selanjutnya",
      "tanggalAkhirServis",
      "tanggal_akhir_servis"
    ])
  );

  inputBengkel.value = ambilNilai(item, [
    "namaBengkel",
    "nama_bengkel",
    "bengkel",
    "namaWorkshop",
    "workshop"
  ]);

  inputCatatan.value = ambilNilai(item, [
    "catatan",
    "keterangan",
    "deskripsi",
    "notes"
  ], "");

  document.getElementById("jumlahKarakter").textContent =
    inputCatatan.value.length;

  tampilkanRingkasan(item);
}

// Perbarui ringkasan jika kendaraan diganti.
selectKendaraan.addEventListener("change", () => {
  if (selectKendaraan.value === "__kendaraan_lama__") {
    tampilkanRingkasan(servisAsli);
    return;
  }

  const kendaraan = dataKendaraan[Number(selectKendaraan.value)];

  if (kendaraan) {
    tampilkanRingkasan(kendaraan);
  }
});

// Penghitung karakter.
inputCatatan.addEventListener("input", () => {
  document.getElementById("jumlahKarakter").textContent =
    inputCatatan.value.length;
});

// Menyimpan posisi kembali ke Detail Servis.
function kembaliKeDetail() {
  const tujuan = new URL("detailservis.html", window.location.href);

  if (idAsli !== null && idAsli !== undefined) {
    tujuan.searchParams.set("id", String(idAsli));
  }

  window.location.href = tujuan.href;
}

document.getElementById("btnBatal").addEventListener("click", () => {
  // Batal tidak menyimpan perubahan apa pun.
  kembaliKeDetail();
});

document.getElementById("linkKembali").addEventListener("click", event => {
  event.preventDefault();
  kembaliKeDetail();
});

// Simpan perubahan ke data yang sudah ada.
form.addEventListener("submit", event => {
  event.preventDefault();

  if (!servisAsli) {
    alert("Data servis tidak ditemukan. Perubahan tidak dapat disimpan.");
    return;
  }

  const semuaServis = bacaData(KEY_SERVIS);

  let indexLama = -1;

  if (idAsli !== null && idAsli !== undefined) {
    indexLama = semuaServis.findIndex((item, index) => {
      const id = String(
        item.id ?? item._id ?? item.uuid ?? `servis-${index}`
      );

      return id === String(idAsli);
    });
  }

  // Fallback untuk data yang tidak memiliki ID.
  if (indexLama === -1) {
    indexLama = semuaServis.findIndex(item =>
      namaKendaraan(item) === namaKendaraan(servisAsli) &&
      ambilNilai(item, ["tanggal", "tanggalServis", "date"]) ===
        ambilNilai(servisAsli, ["tanggal", "tanggalServis", "date"]) &&
      ambilNilai(item, ["jenis", "jenisServis", "type"]) ===
        ambilNilai(servisAsli, ["jenis", "jenisServis", "type"])
    );
  }

  if (indexLama === -1) {
    alert("Data servis lama tidak ditemukan. Perubahan dibatalkan.");
    return;
  }

  const jarak = Number(inputJarak.value);
  const biaya = Number(inputBiaya.value);
  const tanggal = inputTanggal.value;
  const tanggalBerikutnya = inputBerikutnya.value;

  if (
    !tanggal ||
    !Number.isFinite(jarak) ||
    jarak < 0 ||
    !Number.isFinite(biaya) ||
    biaya < 0
  ) {
    alert("Periksa kembali tanggal, jarak tempuh, dan biaya.");
    return;
  }

  if (tanggalBerikutnya && tanggalBerikutnya < tanggal) {
    alert("Tanggal servis selanjutnya tidak boleh sebelum tanggal servis.");
    inputBerikutnya.focus();
    return;
  }

  let kendaraanDipilih = null;

  if (selectKendaraan.value === "__kendaraan_lama__") {
    kendaraanDipilih = null;
  } else if (selectKendaraan.value !== "") {
    kendaraanDipilih = dataKendaraan[Number(selectKendaraan.value)];
  }

  if (!kendaraanDipilih && selectKendaraan.value !== "__kendaraan_lama__") {
    alert("Silakan pilih kendaraan.");
    selectKendaraan.focus();
    return;
  }

  const nama = kendaraanDipilih
    ? namaKendaraan(kendaraanDipilih)
    : namaKendaraan(servisAsli);

  const plat = kendaraanDipilih
    ? platKendaraan(kendaraanDipilih)
    : platKendaraan(servisAsli);

  const tahun = kendaraanDipilih
    ? tahunKendaraan(kendaraanDipilih)
    : tahunKendaraan(servisAsli);

  const tipe = kendaraanDipilih
    ? jenisKendaraan(kendaraanDipilih)
    : jenisKendaraan(servisAsli);

  // Pertahankan properti dan ID lama.
  const dataDiperbarui = {
    ...semuaServis[indexLama],
    kendaraan: nama,
    namaKendaraan: nama,
    plat,
    tahun,
    jenisKendaraan: tipe,
    tanggal,
    jenis: inputJenis.value,
    jarakTempuh: jarak,
    biaya,
    servisSelanjutnya: tanggalBerikutnya,
    namaBengkel: inputBengkel.value.trim(),
    catatan: inputCatatan.value.trim()
  };

  try {
    semuaServis[indexLama] = dataDiperbarui;
    simpanData(KEY_SERVIS, semuaServis);

    // Perbarui data detail yang sedang dipilih.
    localStorage.setItem(
      KEY_EDIT,
      JSON.stringify(dataDiperbarui)
    );

    localStorage.setItem(
      "servisku_detail_servis",
      JSON.stringify(dataDiperbarui)
    );

    alert("Data servis berhasil diperbarui!");

    const tujuan = new URL("detailservis.html", window.location.href);

    if (idAsli !== null && idAsli !== undefined) {
      tujuan.searchParams.set("id", String(idAsli));
    }

    window.location.href = tujuan.href;
  } catch (error) {
    console.error("Gagal menyimpan perubahan:", error);
    alert("Data gagal disimpan. Silakan coba lagi.");
  }
});

// INISIALISASI HALAMAN
function mulaiEdit() {
  servisAsli = cariDataEdit();

  if (!servisAsli) {
    form.hidden = true;
    document.querySelector(".vehicle-summary").hidden = true;
    pesanTidakDitemukan.hidden = false;
    return;
  }

  idAsli = servisAsli.id ?? servisAsli._id ?? servisAsli.uuid ?? null;

  tampilkanPilihanKendaraan();
  isiForm(servisAsli);
}

mulaiEdit();
