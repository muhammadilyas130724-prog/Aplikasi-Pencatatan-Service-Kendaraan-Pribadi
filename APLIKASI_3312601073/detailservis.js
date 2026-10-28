
"use strict";

const KEY_SERVIS = "servisku_riwayat_servis";
const KEY_DETAIL_SERVIS = "servisku_detail_servis";

const detailCard = document.getElementById("detailCard");
const dataTidakDitemukan = document.getElementById("dataTidakDitemukan");

let servisTerpilih = null;

// Membaca data dari localStorage.
function bacaServis() {
  try {
    const data = JSON.parse(localStorage.getItem(KEY_SERVIS) || "[]");

    if (Array.isArray(data)) return data;

    if (data && Array.isArray(data.servis)) return data.servis;
    if (data && Array.isArray(data.riwayat)) return data.riwayat;
    if (data && Array.isArray(data.data)) return data.data;

    return [];
  } catch (error) {
    console.error("Gagal membaca riwayat servis:", error);
    return [];
  }
}

function bacaNilai(item, keys, defaultValue = "-") {
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
  return bacaNilai(item, [
    "kendaraan",
    "namaKendaraan",
    "nama_kendaraan",
    "vehicle",
    "nama",
    "merekModel"
  ]);
}

function tanggalIndonesia(value) {
  if (!value || value === "-") return "-";

  const bulan = {
    "01": "Januari",
    "02": "Februari",
    "03": "Maret",
    "04": "April",
    "05": "Mei",
    "06": "Juni",
    "07": "Juli",
    "08": "Agustus",
    "09": "September",
    "10": "Oktober",
    "11": "November",
    "12": "Desember"
  };

  const teks = String(value).trim();

  // Format tanggal YYYY-MM-DD.
  const iso = teks.match(/^(\d{4})-(\d{2})-(\d{2})$/);

  if (iso) {
    return `${Number(iso[3])} ${bulan[iso[2]]} ${iso[1]}`;
  }

  // Format tanggal DD/MM/YYYY.
  const dmy = teks.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);

  if (dmy && bulan[dmy[2]]) {
    return `${Number(dmy[1])} ${bulan[dmy[2]]} ${dmy[3]}`;
  }

  // Format tanggal DD NamaBulan YYYY.
  const indonesia = teks.match(
    /^(\d{1,2})\s+([a-zA-Z]+)\s+(\d{4})$/
  );

  if (indonesia) {
    return `${indonesia[1]} ${
      indonesia[2].charAt(0).toUpperCase() +
      indonesia[2].slice(1).toLowerCase()
    } ${indonesia[3]}`;
  }

  return teks;
}

function formatRupiah(value) {
  const angka = Number(
    String(value ?? "0").replace(/[^\d-]/g, "")
  );

  return "Rp. " + (
    Number.isFinite(angka) ? angka : 0
  ).toLocaleString("id-ID");
}

function formatJarak(value) {
  if (value === undefined || value === null || value === "") {
    return "-";
  }

  const angka = Number(String(value).replace(/[^\d.-]/g, ""));

  if (!Number.isFinite(angka)) {
    return `${value} km`;
  }

  return angka.toLocaleString("id-ID") + " km";
}

function tentukanJenisKendaraan(item) {
  const tipe = bacaNilai(item, [
    "jenisKendaraan",
    "jenis_kendaraan",
    "tipeKendaraan",
    "tipe_kendaraan"
  ], "").toLowerCase();

  if (tipe.includes("motor")) return "Motor";
  if (tipe.includes("mobil")) return "Mobil";

  const nama = namaKendaraan(item).toLowerCase();

  return /\b(beat|scoopy|vario|supra|mio|nmax|pcx)\b/.test(nama)
    ? "Motor"
    : "Mobil";
}

function isiTeks(id, value) {
  document.getElementById(id).textContent = value;
}

// Mencari servis berdasarkan ID URL, dengan fallback ke data
// yang dipilih melalui tombol panah di halaman riwayat.
function cariServisTerpilih() {
  const params = new URLSearchParams(window.location.search);
  const idURL = params.get("id");
  const semuaServis = bacaServis();

  if (idURL) {
    const cocok = semuaServis.find((item, index) => {
      const id = String(
        item.id ?? item._id ?? item.uuid ?? `servis-${index}`
      );

      return id === idURL;
    });

    if (cocok) return cocok;
  }

  try {
    const dataPilihan = JSON.parse(
      localStorage.getItem(KEY_DETAIL_SERVIS) || "null"
    );

    if (dataPilihan && typeof dataPilihan === "object") {
      const idPilihan = dataPilihan.id ??
        dataPilihan._id ??
        dataPilihan.uuid;

      if (idPilihan !== undefined && idPilihan !== null) {
        const cocok = semuaServis.find((item, index) => {
          const id = String(
            item.id ?? item._id ?? item.uuid ?? `servis-${index}`
          );

          return id === String(idPilihan);
        });

        if (cocok) return cocok;
      }

      // Fallback untuk data lama yang tidak memiliki ID.
      if (!idURL && semuaServis.length === 0) {
        return dataPilihan;
      }
    }
  } catch (error) {
    console.error("Gagal membaca servis yang dipilih:", error);
  }

  return null;
}

// Menampilkan data servis.
function tampilkanDetail(item) {
  const tipe = tentukanJenisKendaraan(item);

  const nama = namaKendaraan(item);
  const tanggal = bacaNilai(item, [
    "tanggal",
    "tanggalServis",
    "tanggal_servis",
    "date"
  ]);

  const jenis = bacaNilai(item, [
    "jenis",
    "jenisServis",
    "jenis_servis",
    "type",
    "serviceType"
  ]);

  const plat = bacaNilai(item, [
    "plat",
    "nomorPlat",
    "nomor_plat",
    "noPlat",
    "no_plat"
  ]);

  const tahun = bacaNilai(item, ["tahun", "year"]);

  const jarak = bacaNilai(item, [
    "jarakTempuh",
    "jarak_tempuh",
    "odometer",
    "kilometer",
    "km"
  ]);

  const biaya = item.biaya ?? item.harga ?? item.cost ?? 0;

  const tanggalBerikutnya = bacaNilai(item, [
    "servisSelanjutnya",
    "servis_selanjutnya",
    "tanggalSelanjutnya",
    "tanggal_selanjutnya",
    "tanggalAkhirServis",
    "tanggal_akhir_servis"
  ]);

  const bengkel = bacaNilai(item, [
    "namaBengkel",
    "nama_bengkel",
    "bengkel",
    "namaWorkshop",
    "workshop"
  ]);

  const catatan = bacaNilai(item, [
    "catatan",
    "keterangan",
    "deskripsi",
    "notes"
  ]);

  isiTeks("detailNamaKendaraan", nama);
  isiTeks("detailPlat", plat);
  isiTeks("detailTahun", tahun);
  isiTeks("detailTanggal", tanggalIndonesia(tanggal));
  isiTeks("detailTanggalBerikutnya", tanggalIndonesia(tanggalBerikutnya));
  isiTeks("detailJenisServis", jenis);
  isiTeks("detailBengkel", bengkel);
  isiTeks("detailJarak", formatJarak(jarak));
  isiTeks("detailBiaya", formatRupiah(biaya));
  isiTeks("detailCatatan", catatan);

  const gambar = document.getElementById("vehicleImage");
  gambar.textContent = tipe === "Motor" ? "🏍️" : "🚘";

  isiTeks("badgeText", tipe);
  isiTeks("badgeIcon", tipe === "Motor" ? "🏍️" : "🚘");

  detailCard.hidden = false;
  dataTidakDitemukan.hidden = true;
}

// TOMBOL EDIT
document.getElementById("btnEdit").addEventListener("click", () => {
  if (!servisTerpilih) return;

  try {
    localStorage.setItem(
      "servisku_edit_servis",
      JSON.stringify(servisTerpilih)
    );

    const id = servisTerpilih.id ??
      servisTerpilih._id ??
      servisTerpilih.uuid;

    const tujuan = new URL("editdata.html", window.location.href);

    if (id !== undefined && id !== null) {
      tujuan.searchParams.set("edit", String(id));
    }

    window.location.href = tujuan.href;
  } catch (error) {
    console.error("Gagal menyiapkan data edit:", error);
    alert("Data servis tidak dapat dibuka untuk diedit.");
  }
});

// TOMBOL HAPUS
document.getElementById("btnHapus").addEventListener("click", () => {
  if (!servisTerpilih) return;

  const nama = namaKendaraan(servisTerpilih);

  const yakin = confirm(
    `Apakah kamu yakin ingin menghapus riwayat servis ${nama}?`
  );

  if (!yakin) return;

  try {
    const semuaServis = bacaServis();

    const idTerpilih = servisTerpilih.id ??
      servisTerpilih._id ??
      servisTerpilih.uuid;

    const index = semuaServis.findIndex((item, i) => {
      const id = item.id ?? item._id ?? item.uuid;

      if (idTerpilih !== undefined && idTerpilih !== null) {
        return String(id) === String(idTerpilih);
      }

      return item === servisTerpilih ||
        (
          !id &&
          namaKendaraan(item) === namaKendaraan(servisTerpilih) &&
          bacaNilai(item, ["tanggal", "tanggalServis", "date"]) ===
            bacaNilai(servisTerpilih, ["tanggal", "tanggalServis", "date"]) &&
          bacaNilai(item, ["jenis", "jenisServis", "type"]) ===
            bacaNilai(servisTerpilih, ["jenis", "jenisServis", "type"])
        );
    });

    if (index === -1) {
      alert("Data servis tidak ditemukan di riwayat.");
      return;
    }

    semuaServis.splice(index, 1);

    localStorage.setItem(
      KEY_SERVIS,
      JSON.stringify(semuaServis)
    );

    localStorage.removeItem(KEY_DETAIL_SERVIS);
    localStorage.removeItem("servisku_edit_servis");

    alert("Riwayat servis berhasil dihapus.");

    window.location.href = "servis1.html";
  } catch (error) {
    console.error("Gagal menghapus servis:", error);
    alert("Data servis gagal dihapus. Silakan coba lagi.");
  }
});

// INISIALISASI
servisTerpilih = cariServisTerpilih();

if (servisTerpilih) {
  tampilkanDetail(servisTerpilih);
} else {
  detailCard.hidden = true;
  dataTidakDitemukan.hidden = false;
}
