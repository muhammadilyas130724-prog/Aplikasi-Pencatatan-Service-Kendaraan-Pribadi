
"use strict";

const KEY_SERVIS = "servisku_riwayat_servis";
const KEY_KENDARAAN = "servisku_kendaraan";
const KEY_DETAIL_SERVIS = "servisku_detail_servis";

const daftarServis = document.getElementById("daftarServis");
const cariServis = document.getElementById("cariServis");
const pesanKosong = document.getElementById("pesanKosong");
const urutkanServis = document.getElementById("urutkanServis");
const tombolFilter = document.querySelectorAll(".filter-button");

let filterAktif = "semua";

// Data contoh sesuai desain.
// Hanya digunakan jika kunci riwayat servis belum tersedia.
const contohServis = [
  {
    id: "servis-001",
    kendaraan: "Toyota Avanza",
    plat: "BP 1234 KZ",
    tahun: "2018",
    tanggal: "12 Mei 2026",
    jenis: "Ganti Oli Mesin",
    biaya: 250000,
    catatan: "Servis rutin berkala"
  },
  {
    id: "servis-002",
    kendaraan: "Honda Beat",
    plat: "BP 4567 MN",
    tahun: "2019",
    tanggal: "24 Mei 2026",
    jenis: "Cek Rem",
    biaya: 100000,
    catatan: "Pengecekan dan perawatan rem"
  },
  {
    id: "servis-003",
    kendaraan: "Honda Scoopy",
    plat: "BP 7890 PL",
    tahun: "2020",
    tanggal: "26 Mei 2026",
    jenis: "Ganti Ban",
    biaya: 200000,
    catatan: "Penggantian ban depan dan belakang"
  },
  {
    id: "servis-004",
    kendaraan: "Honda Beat",
    plat: "BP 4567 MN",
    tahun: "2019",
    tanggal: "27 Mei 2026",
    jenis: "Ganti Filter Udara",
    biaya: 80000,
    catatan: "Penggantian filter udara mesin"
  }
];

// ---------- MEMBACA DAN MENYIMPAN DATA ----------

function bacaArrayLocalStorage(key) {
  try {
    const raw = localStorage.getItem(key);

    if (raw === null) return null;

    const data = JSON.parse(raw);

    if (Array.isArray(data)) return data;

    if (data && typeof data === "object") {
      for (const property of [
        "data", "servis", "riwayat", "kendaraan", "services"
      ]) {
        if (Array.isArray(data[property])) {
          return data[property];
        }
      }
    }

    return [];
  } catch (error) {
    console.error("Gagal membaca data:", key, error);
    return [];
  }
}

function bacaSemuaServis() {
  const data = bacaArrayLocalStorage(KEY_SERVIS);

  if (data !== null) return data;

  // Simpan contoh hanya jika belum ada data yang tersimpan.
  try {
    localStorage.setItem(KEY_SERVIS, JSON.stringify(contohServis));
  } catch (error) {
    console.error("Gagal menyimpan data contoh:", error);
  }

  return [...contohServis];
}

function bacaSemuaKendaraan() {
  return bacaArrayLocalStorage(KEY_KENDARAAN) || [];
}

function nilai(item, properti, defaultValue = "") {
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

  return defaultValue;
}

function namaServis(item) {
  return nilai(item, [
    "jenis", "jenisServis", "jenis_servis",
    "jenisService", "serviceType", "type", "layanan"
  ], "Servis");
}

function namaKendaraanServis(item) {
  return nilai(item, [
    "kendaraan", "namaKendaraan", "nama_kendaraan",
    "vehicle", "nama", "merekModel", "merek_model"
  ], "Kendaraan");
}

function tanggalServis(item) {
  return nilai(item, [
    "tanggal", "tanggalServis", "tanggal_servis",
    "date", "createdAt"
  ], "-");
}

function biayaServis(item) {
  const mentah = item?.biaya ?? item?.harga ?? item?.cost ?? item?.totalBiaya;

  if (typeof mentah === "number") {
    return Number.isFinite(mentah) ? mentah : 0;
  }

  const angka = Number(String(mentah ?? "0").replace(/[^\d-]/g, ""));
  return Number.isFinite(angka) ? angka : 0;
}

function idServis(item, index) {
  return String(item?.id ?? item?._id ?? item?.uuid ?? `servis-${index}`);
}

function jenisKendaraanDariNama(nama) {
  const n = nama.toLowerCase();

  if (
    /\b(beat|scoopy|vario|supra|mio|nmax|pcx|motor|scooter)\b/.test(n)
  ) {
    return "motor";
  }

  return "mobil";
}

function jenisKendaraanServis(item) {
  const jenis = nilai(item, [
    "jenisKendaraan", "jenis_kendaraan",
    "tipeKendaraan", "tipe_kendaraan", "kategoriKendaraan"
  ]).toLowerCase();

  if (jenis.includes("motor") || jenis.includes("roda dua")) {
    return "motor";
  }

  if (jenis.includes("mobil") || jenis.includes("roda empat")) {
    return "mobil";
  }

  // Coba cocokkan kendaraan dengan daftar kendaraan tersimpan.
  const semuaKendaraan = bacaSemuaKendaraan();
  const nama = namaKendaraanServis(item).toLowerCase();

  const kendaraanCocok = semuaKendaraan.find((k) => {
    const namaTersimpan = nilai(k, [
      "nama", "namaKendaraan", "nama_kendaraan", "kendaraan", "vehicle"
    ]).toLowerCase();

    return namaTersimpan === nama;
  });

  if (kendaraanCocok) {
    const tipe = nilai(kendaraanCocok, [
      "jenis", "tipe", "jenisKendaraan", "jenis_kendaraan"
    ]).toLowerCase();

    if (tipe.includes("motor")) return "motor";
    if (tipe.includes("mobil")) return "mobil";
  }

  return jenisKendaraanDariNama(nama);
}

// ---------- FORMAT TANGGAL DAN BIAYA ----------

function tanggalISO(teks) {
  if (!teks || teks === "-") return "";

  const bulan = {
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

  const t = String(teks).trim();

  const cocokIndonesia = t.match(
    /^(\d{1,2})\s+([a-zA-Z]+)\s+(\d{4})$/
  );

  if (cocokIndonesia) {
    const m = bulan[cocokIndonesia[2].toLowerCase()];

    if (m) {
      return `${cocokIndonesia[3]}-${m}-${cocokIndonesia[1].padStart(2, "0")}`;
    }
  }

  const cocokISO = t.match(/^(\d{4})-(\d{2})-(\d{2})/);

  if (cocokISO) {
    return `${cocokISO[1]}-${cocokISO[2]}-${cocokISO[3]}`;
  }

  return "";
}

function pecahTanggal(teks) {
  const iso = tanggalISO(teks);

  if (iso) {
    const [tahun, bulan, hari] = iso.split("-").map(Number);

    const namaBulan = [
      "Januari", "Februari", "Maret", "April",
      "Mei", "Juni", "Juli", "Agustus",
      "September", "Oktober", "November", "Desember"
    ];

    return {
      hari: String(hari),
      bulan: namaBulan[bulan - 1],
      tahun: String(tahun)
    };
  }

  return { hari: "—", bulan: teks || "-", tahun: "" };
}

function rupiah(angka) {
  return "Rp. " + angka.toLocaleString("id-ID");
}

// ---------- IKON ----------

function ikonMobil() {
  return `
    <svg viewBox="0 0 160 110" fill="none" aria-hidden="true">
      <path d="M24 64L36 34Q40 24 52 24H108Q120 24 124 34L136 64"
        fill="#9DAEC1" stroke="#34445A" stroke-width="4"/>
      <path d="M43 35Q46 30 53 30H107Q114 30 117 35L126 58H34Z"
        fill="#D9EBFA" stroke="#34445A" stroke-width="3"/>
      <path d="M19 61Q19 55 27 55H133Q141 55 141 64V83H19Z"
        fill="#2380D9" stroke="#34445A" stroke-width="4"/>
      <circle cx="43" cy="83" r="14" fill="#28364A"/>
      <circle cx="43" cy="83" r="7" fill="#DDE8F3"/>
      <circle cx="117" cy="83" r="14" fill="#28364A"/>
      <circle cx="117" cy="83" r="7" fill="#DDE8F3"/>
    </svg>`;
}

function ikonMotor() {
  return `
    <svg viewBox="0 0 160 110" fill="none" aria-hidden="true">
      <circle cx="37" cy="79" r="20" stroke="#27364B" stroke-width="7"/>
      <circle cx="122" cy="79" r="20" stroke="#27364B" stroke-width="7"/>
      <path d="M37 78L59 49L83 78H54L70 55L101 57L122 78"
        stroke="#1976D2" stroke-width="9" stroke-linecap="round"
        stroke-linejoin="round"/>
      <path d="M70 54L78 35L99 35L111 48L101 57"
        fill="#2380D9" stroke="#27364B" stroke-width="4"/>
      <path d="M77 35L86 26H99L104 35"
        stroke="#27364B" stroke-width="5"/>
    </svg>`;
}

function ikonServis(jenis) {
  const teks = jenis.toLowerCase();

  if (teks.includes("oli")) return "🛢";
  if (teks.includes("rem")) return "◉";
  if (teks.includes("ban")) return "◉";
  if (teks.includes("filter")) return "▤";
  if (teks.includes("mesin")) return "⚙";

  return "🔧";
}

// ---------- MEMBUAT KARTU ----------

function elemen(tag, className, text) {
  const node = document.createElement(tag);

  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;

  return node;
}

function buatKartuServis(item, index) {
  const nama = namaKendaraanServis(item);
  const jenis = namaServis(item);
  const tanggal = pecahTanggal(tanggalServis(item));
  const tipe = jenisKendaraanServis(item);

  const kartu = elemen("article", "service-card");

  const kotakTanggal = elemen("div", "service-date");
  kotakTanggal.append(
    elemen("span", "date-day", tanggal.hari),
    elemen(
      "span",
      "date-month",
      tanggal.tahun ? `${tanggal.bulan} ${tanggal.tahun}` : tanggal.bulan
    )
  );

  const gambar = elemen("div", "service-picture");
  gambar.innerHTML = tipe === "motor" ? ikonMotor() : ikonMobil();

  const infoKendaraan = elemen("div", "service-vehicle");
  infoKendaraan.appendChild(elemen("h2", "", nama));

  const plat = nilai(item, [
    "plat", "nomorPlat", "nomor_plat", "noPlat", "no_plat"
  ]);

  if (plat) {
    infoKendaraan.appendChild(elemen("span", "service-plate", plat));
  }

  const tag = elemen(
    "span",
    `vehicle-tag ${tipe === "motor" ? "motor" : ""}`,
    tipe === "motor" ? "Motor" : "Mobil"
  );

  infoKendaraan.appendChild(tag);

  const infoServis = elemen("div", "service-type");

  const ikon = elemen("div", "service-type-icon", ikonServis(jenis));
  ikon.setAttribute("aria-hidden", "true");

  const deskripsi = elemen("div", "service-type-info");
  deskripsi.appendChild(elemen("h3", "", jenis));

  const catatan = nilai(item, [
    "catatan", "keterangan", "deskripsi", "notes"
  ]);

  if (catatan) {
    deskripsi.appendChild(elemen("p", "", catatan));

  }

  infoServis.append(ikon, deskripsi);

  const biaya = elemen("div", "service-cost");
  biaya.append(
    elemen("span", "", rupiah(biayaServis(item)))
  );

  const tombolDetail = elemen("button", "detail-button", "›");
  tombolDetail.type = "button";
  tombolDetail.title = "Lihat detail servis";
  tombolDetail.setAttribute(
    "aria-label",
    `Lihat detail servis ${nama} - ${jenis}`
  );

  tombolDetail.addEventListener("click", () => {
    bukaDetailServis(item, index);
  });

  kartu.append(
    kotakTanggal,
    gambar,
    infoKendaraan,
    infoServis,
    biaya,
    tombolDetail
  );

  return kartu;
}

// ---------- DETAIL SERVIS ----------

function bukaDetailServis(item, index) {
  // Simpan seluruh data yang dipilih agar detail bisa membacanya.
  localStorage.setItem(KEY_DETAIL_SERVIS, JSON.stringify(item));

  const id = idServis(item, index);
  const tujuan = new URL("detailservis.html", window.location.href);

  tujuan.searchParams.set("id", id);

  window.location.href = tujuan.href;
}

// ---------- PENCARIAN, FILTER, SORTING ----------

function tampilkanServis() {
  const semua = bacaSemuaServis();
  const kata = cariServis.value.trim().toLowerCase();

  let hasil = semua
    .map((item, index) => ({ item, index }))
    .filter(({ item }) => {
      const teksCari = [
        namaKendaraanServis(item),
        namaServis(item),
        tanggalServis(item),
        nilai(item, ["plat", "nomorPlat", "nomor_plat"]),
        nilai(item, ["catatan", "keterangan", "deskripsi"])
      ].join(" ").toLowerCase();

      const cocokKata = teksCari.includes(kata);

      const cocokFilter =
        filterAktif === "semua" ||
        jenisKendaraanServis(item) === filterAktif;

      return cocokKata && cocokFilter;
    });

  if (urutkanServis.value === "terbaru") {
    hasil.sort((a, b) =>
      tanggalISO(tanggalServis(b.item)).localeCompare(
        tanggalISO(tanggalServis(a.item))
      )
    );
  } else if (urutkanServis.value === "terlama") {
    hasil.sort((a, b) =>
      tanggalISO(tanggalServis(a.item)).localeCompare(
        tanggalISO(tanggalServis(b.item))
      )
    );
  } else if (urutkanServis.value === "biaya-tertinggi") {
    hasil.sort((a, b) => biayaServis(b.item) - biayaServis(a.item));
  } else if (urutkanServis.value === "biaya-terendah") {
    hasil.sort((a, b) => biayaServis(a.item) - biayaServis(b.item));
  }

  daftarServis.replaceChildren();

  hasil.forEach(({ item, index }) => {
    daftarServis.appendChild(buatKartuServis(item, index));
  });

  pesanKosong.hidden = hasil.length > 0;

  pesanKosong.textContent = semua.length === 0
    ? "Belum ada riwayat servis. Silakan tambahkan servis terlebih dahulu."
    : "Riwayat servis tidak ditemukan. Coba kata kunci atau filter lain.";
}

cariServis.addEventListener("input", tampilkanServis);
urutkanServis.addEventListener("change", tampilkanServis);

tombolFilter.forEach((tombol) => {
  tombol.addEventListener("click", () => {
    filterAktif = tombol.dataset.filter;

    tombolFilter.forEach((item) => {
      item.classList.toggle("active", item === tombol);
    });

    tampilkanServis();
  });
});

window.addEventListener("storage", (event) => {
  if (event.key === KEY_SERVIS || event.key === KEY_KENDARAAN) {
    tampilkanServis();
  }
});

document.addEventListener("DOMContentLoaded", tampilkanServis);
