
"use strict";

const KEY_KENDARAAN = "servisku_kendaraan";
const KEY_SERVIS = "servisku_riwayat_servis";
const KEY_DETAIL = "servisku_detail_servis";

// Data contoh hanya digunakan jika riwayat servis masih kosong.
const dataContoh = [
  {
    id: "contoh-1",
    kendaraan: "Toyota Avanza",
    plat: "-",
    tahun: "-",
    tanggal: "12 Mei 2026",
    jenis: "Ganti Oli Mesin",
    jarakTempuh: "-",
    biaya: 0,
    servisSelanjutnya: "-",
    catatan: ""
  },
  {
    id: "contoh-2",
    kendaraan: "Honda Beat",
    plat: "-",
    tahun: "-",
    tanggal: "24 Mei 2026",
    jenis: "Cek Rem",
    jarakTempuh: "-",
    biaya: 0,
    servisSelanjutnya: "-",
    catatan: ""
  },
  {
    id: "contoh-3",
    kendaraan: "Honda Scoopy",
    plat: "-",
    tahun: "-",
    tanggal: "26 Mei 2026",
    jenis: "Ganti Ban",
    jarakTempuh: "-",
    biaya: 0,
    servisSelanjutnya: "-",
    catatan: ""
  }
];

function bacaArray(key) {
  try {
    const raw = localStorage.getItem(key);

    if (!raw) return [];

    const data = JSON.parse(raw);

    if (Array.isArray(data)) return data;

    // Mendukung data yang disimpan di dalam properti array.
    if (data && typeof data === "object") {
      for (const property of [
        "data", "kendaraan", "servis", "riwayat",
        "vehicles", "services"
      ]) {
        if (Array.isArray(data[property])) {
          return data[property];
        }
      }
    }

    return [];
  } catch (error) {
    console.error("Gagal membaca localStorage:", key, error);
    return [];
  }
}

function teks(...values) {
  for (const value of values) {
    if (value !== undefined && value !== null &&
        String(value).trim() !== "") {
      return String(value).trim();
    }
  }

  return "";
}

function ambilNamaKendaraan(item) {
  if (typeof item === "string") return item;

  return teks(
    item?.kendaraan,
    item?.namaKendaraan,
    item?.nama_kendaraan,
    item?.vehicle,
    item?.nama,
    item?.merekModel,
    item?.merek_model
  ) || "Kendaraan";
}

function ambilJenis(item) {
  return teks(
    item?.jenis,
    item?.jenisServis,
    item?.jenis_servis,
    item?.jenisService,
    item?.serviceType,
    item?.type,
    item?.layanan
  ) || "Servis";
}

function ambilTanggal(item) {
  return teks(
    item?.tanggal,
    item?.tanggalServis,
    item?.tanggal_servis,
    item?.date,
    item?.createdAt
  ) || "-";
}

function ambilId(item, index) {
  return teks(item?.id, item?._id, item?.uuid) || `baris-${index}`;
}

function formatTanggal(tanggal) {
  if (!tanggal || tanggal === "-") return "-";

  const bulanIndonesia = {
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

  const teksTanggal = String(tanggal).trim();

  // Mendukung format tanggal Indonesia, misalnya 26 Mei 2026.
  const cocok = teksTanggal.match(
    /^(\d{1,2})\s+([a-zA-Z]+)\s+(\d{4})$/
  );

  if (cocok) {
    const bulan = bulanIndonesia[cocok[2].toLowerCase()];

    if (bulan) {
      return `${cocok[3]}-${bulan}-${cocok[1].padStart(2, "0")}`;
    }
  }

  // Mendukung format ISO, misalnya 2026-05-26.
  const iso = teksTanggal.match(/^(\d{4})-(\d{2})-(\d{2})/);

  if (iso) {
    return `${iso[1]}-${iso[2]}-${iso[3]}`;
  }

  return "";
}

function tanggalUntukTampilan(tanggal) {
  if (!tanggal || tanggal === "-") return "-";

  const iso = formatTanggal(tanggal);

  if (!iso) return tanggal;

  const [tahun, bulan, hari] = iso.split("-").map(Number);

  const namaBulan = [
    "Januari", "Februari", "Maret", "April",
    "Mei", "Juni", "Juli", "Agustus",
    "September", "Oktober", "November", "Desember"
  ];

  return `${hari} ${namaBulan[bulan - 1]} ${tahun}`;
}

function buatElemen(tag, className, text) {
  const el = document.createElement(tag);

  if (className) el.className = className;
  if (text !== undefined) el.textContent = text;

  return el;
}

function tambahSel(td, value) {
  td.textContent = value;
  return td;
}

function buatDataDashboard() {
  const kendaraan = bacaArray(KEY_KENDARAAN);
  const servisAsli = bacaArray(KEY_SERVIS);

  // Jika penyimpanan servis kosong, gunakan contoh dari desain.
  const servis = servisAsli.length ? servisAsli : dataContoh;

  return { kendaraan, servis, memakaiContoh: servisAsli.length === 0 };
}

function tampilkanStatistik(kendaraan, servis, memakaiContoh) {
  const jumlahKendaraan = kendaraan.length || (memakaiContoh ? 3 : 0);

  document.getElementById("totalKendaraan").textContent =
    jumlahKendaraan;

  document.getElementById("totalServis").textContent =
    servis.length;

  if (servis.length === 0) {
    document.getElementById("tanggalTerakhir").textContent =
      "Belum ada servis";

    document.getElementById("kendaraanTerakhir").textContent =
      "Belum ada riwayat servis";

    return;
  }

  // Cari tanggal paling baru yang bisa dikenali.
  const terurut = [...servis].sort((a, b) => {
    const tanggalA = formatTanggal(ambilTanggal(a));
    const tanggalB = formatTanggal(ambilTanggal(b));

    return tanggalB.localeCompare(tanggalA);
  });

  const terakhir = terurut[0];

  document.getElementById("tanggalTerakhir").textContent =
    tanggalUntukTampilan(ambilTanggal(terakhir));

  document.getElementById("kendaraanTerakhir").textContent =
    `${ambilNamaKendaraan(terakhir)} - ${ambilJenis(terakhir)}`;
}

function tampilkanRiwayat(servis) {
  const tbody = document.getElementById("tabelRiwayat");
  tbody.replaceChildren();

  if (!servis.length) {
    const tr = buatElemen("tr");
    const td = buatElemen(
      "td",
      "empty-state",
      "Belum ada riwayat servis."
    );

    td.colSpan = 5;
    tr.appendChild(td);
    tbody.appendChild(tr);
    return;
  }

  const terbaru = [...servis].sort((a, b) => {
    const tanggalA = formatTanggal(ambilTanggal(a));
    const tanggalB = formatTanggal(ambilTanggal(b));

    return tanggalB.localeCompare(tanggalA);
  }).slice(0, 5);

  terbaru.forEach((item) => {
    const tr = buatElemen("tr");

    const tdNomor = buatElemen("td");
    const tdKendaraan = buatElemen("td");
    const tdJenis = buatElemen("td");
    const tdTanggal = buatElemen("td");
    const tdAksi = buatElemen("td");

    tambahSel(tdNomor, String(servis.indexOf(item) + 1));
    tambahSel(tdKendaraan, ambilNamaKendaraan(item));
    tambahSel(tdJenis, ambilJenis(item));
    tambahSel(tdTanggal, tanggalUntukTampilan(ambilTanggal(item)));

    const tombol = buatElemen("button", "action-button", "›");

    tombol.type = "button";
    tombol.setAttribute(
      "aria-label",
      `Lihat detail servis ${ambilNamaKendaraan(item)}`
    );
    tombol.title = "Lihat Detail Servis";

    tombol.addEventListener("click", () => {
      bukaDetailServis(item);
    });

    tdAksi.appendChild(tombol);

    tr.append(tdNomor, tdKendaraan, tdJenis, tdTanggal, tdAksi);
    tbody.appendChild(tr);
  });
}

function bukaDetailServis(item) {
  // Simpan seluruh objek agar halaman detail bisa membaca datanya.
  localStorage.setItem(KEY_DETAIL, JSON.stringify(item));

  // ID tetap dikirim sebagai parameter URL.
  const id = teks(item?.id, item?._id, item?.uuid);

  const tujuan = new URL("detailservis.html", window.location.href);

  if (id) {
    tujuan.searchParams.set("id", id);
  }

  window.location.href = tujuan.href;
}

function tampilkanGrafik(servis) {
  const donut = document.getElementById("donutChart");
  const legenda = document.getElementById("legendaServis");

  legenda.replaceChildren();

  document.getElementById("jumlahGrafik").textContent =
    servis.length;

  if (!servis.length) {
    donut.style.background = "#e8eef7";

    legenda.appendChild(
      buatElemen("p", "empty-chart", "Belum ada data servis.")
    );

    return;
  }

  const jumlah = {};

  servis.forEach((item) => {
    const jenis = ambilJenis(item);
    jumlah[jenis] = (jumlah[jenis] || 0) + 1;
  });

  const warna = [
    "#247cf0",
    "#20aa7a",
    "#ffb820",
    "#8b6cf6",
    "#f06485",
    "#18a9c1"
  ];

  const kategori = Object.entries(jumlah)
    .sort((a, b) => b[1] - a[1]);

  let sudut = 0;

  const bagian = kategori.map(([jenis, total], index) => {
    const awal = sudut;
    sudut += (total / servis.length) * 360;

    return {
      jenis,
      total,
      warna: warna[index % warna.length],
      awal,
      akhir: sudut
    };
  });

  const gradien = bagian.map((bagian) =>
    `${bagian.warna} ${bagian.awal}deg ${bagian.akhir}deg`
  );

  donut.style.background =
    `conic-gradient(${gradien.join(", ")})`;

  bagian.forEach((bagian) => {
    const itemLegenda = buatElemen("div", "legend-item");
    const titik = buatElemen("span", "legend-dot");

    titik.style.backgroundColor = bagian.warna;
    titik.setAttribute("aria-hidden", "true");

    const label = buatElemen(
      "span",
      "",
      `${bagian.jenis} (${bagian.total})`
    );

    itemLegenda.append(titik, label);
    legenda.appendChild(itemLegenda);
  });
}

function muatDashboard() {
  const data = buatDataDashboard();

  tampilkanStatistik(
    data.kendaraan,
    data.servis,
    data.memakaiContoh
  );

  tampilkanRiwayat(data.servis);
  tampilkanGrafik(data.servis);
}

document.addEventListener("DOMContentLoaded", muatDashboard);

// Perbarui tampilan jika data diubah dari tab browser lain.
window.addEventListener("storage", muatDashboard);
