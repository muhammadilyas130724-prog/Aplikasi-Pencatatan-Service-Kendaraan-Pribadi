
"use strict";

const KEY_SERVIS = "servisku_riwayat_servis";
const KEY_KENDARAAN = "servisku_kendaraan";

const formFilter = document.getElementById("formFilter");
const tanggalAwal = document.getElementById("tanggalAwal");
const tanggalAkhir = document.getElementById("tanggalAkhir");
const filterKendaraan = document.getElementById("filterKendaraan");
const jenisGrafik = document.getElementById("jenisGrafik");
const filterMessage = document.getElementById("filterMessage");

let semuaServis = [];
let hasilFilter = [];

const warnaGrafik = [
  "#36a2f5",
  "#26d89b",
  "#ff8eaf",
  "#a78bfa",
  "#ffbd59",
  "#24c4d9",
  "#f47d46",
  "#7187ff"
];

const namaBulan = [
  "Januari", "Februari", "Maret", "April",
  "Mei", "Juni", "Juli", "Agustus",
  "September", "Oktober", "November", "Desember"
];

const singkatanBulan = [
  "Jan", "Feb", "Mar", "Apr", "Mei", "Jun",
  "Jul", "Agu", "Sep", "Okt", "Nov", "Des"
];

// Membaca data dari localStorage.
function bacaData(key) {
  try {
    const data = JSON.parse(localStorage.getItem(key) || "[]");

    if (Array.isArray(data)) return data;
    if (Array.isArray(data?.servis)) return data.servis;
    if (Array.isArray(data?.riwayat)) return data.riwayat;
    if (Array.isArray(data?.kendaraan)) return data.kendaraan;
    if (Array.isArray(data?.data)) return data.data;

    return [];
  } catch (error) {
    console.error("Gagal membaca data:", error);
    return [];
  }
}

// Mendapatkan nilai dari beberapa kemungkinan nama properti.
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

function jenisServis(item) {
  return ambilNilai(item, [
    "jenis",
    "jenisServis",
    "jenis_servis",
    "type",
    "serviceType"
  ], "Lainnya");
}

function namaBengkel(item) {
  return ambilNilai(item, [
    "namaBengkel",
    "nama_bengkel",
    "bengkel",
    "namaWorkshop",
    "workshop"
  ], "-");
}

function nilaiBiaya(item) {
  const mentah = item?.biaya ?? item?.harga ?? item?.cost ?? 0;

  const angka = typeof mentah === "number"
    ? mentah
    : Number(String(mentah).replace(/[^\d-]/g, ""));

  return Number.isFinite(angka) && angka >= 0 ? angka : 0;
}

function formatRupiah(angka) {
  return "Rp. " + Math.round(angka).toLocaleString("id-ID");
}

// Mendukung YYYY-MM-DD, DD/MM/YYYY, dan DD NamaBulan YYYY.
function parseTanggal(value) {
  if (!value) return null;

  const teks = String(value).trim();

  let hasil = teks.match(/^(\d{4})-(\d{2})-(\d{2})$/);

  if (hasil) {
    const tanggal = new Date(
      Number(hasil[1]),
      Number(hasil[2]) - 1,
      Number(hasil[3])
    );

    if (
      tanggal.getFullYear() === Number(hasil[1]) &&
      tanggal.getMonth() === Number(hasil[2]) - 1 &&
      tanggal.getDate() === Number(hasil[3])
    ) {
      return tanggal;
    }

    return null;
  }

  hasil = teks.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);

  if (hasil) {
    return new Date(
      Number(hasil[3]),
      Number(hasil[2]) - 1,
      Number(hasil[1])
    );
  }

  const bulanIndonesia = {
    januari: 0,
    februari: 1,
    maret: 2,
    april: 3,
    mei: 4,
    juni: 5,
    juli: 6,
    agustus: 7,
    september: 8,
    oktober: 9,
    november: 10,
    desember: 11
  };

  hasil = teks.match(/^(\d{1,2})\s+([a-zA-Z]+)\s+(\d{4})$/);

  if (hasil) {
    const bulan = bulanIndonesia[hasil[2].toLowerCase()];

    if (bulan !== undefined) {
      return new Date(
        Number(hasil[3]),
        bulan,
        Number(hasil[1])
      );
    }
  }

  return null;
}

function tanggalISO(tanggal) {
  const tahun = tanggal.getFullYear();
  const bulan = String(tanggal.getMonth() + 1).padStart(2, "0");
  const hari = String(tanggal.getDate()).padStart(2, "0");

  return `${tahun}-${bulan}-${hari}`;
}

function formatTanggal(value) {
  const tanggal = parseTanggal(value);

  if (!tanggal || Number.isNaN(tanggal.getTime())) {
    return value || "-";
  }

  return `${tanggal.getDate()} ${namaBulan[tanggal.getMonth()]} ${tanggal.getFullYear()}`;
}

// Mengisi pilihan kendaraan berdasarkan data yang tersedia.
function isiFilterKendaraan() {
  const kendaraanTersimpan = bacaData(KEY_KENDARAAN);
  const namaDariServis = semuaServis.map(namaKendaraan);
  const namaDariKendaraan = kendaraanTersimpan.map(namaKendaraan);

  const daftar = [...new Set(
    [...namaDariKendaraan, ...namaDariServis]
      .filter(nama => nama && nama !== "Kendaraan")
  )];

  filterKendaraan.replaceChildren();

  const semua = document.createElement("option");
  semua.value = "semua";
  semua.textContent = "Semua Kendaraan";
  filterKendaraan.appendChild(semua);

  daftar.forEach(nama => {
    const option = document.createElement("option");
    option.value = nama;
    option.textContent = nama;
    filterKendaraan.appendChild(option);
  });
}

// Mengatur rentang tanggal awal dan akhir.
function aturTanggalAwal() {
  const tanggalTersedia = semuaServis
    .map(item => parseTanggal(ambilNilai(item, [
      "tanggal", "tanggalServis", "tanggal_servis", "date"
    ])))
    .filter(Boolean)
    .sort((a, b) => a - b);

  if (tanggalTersedia.length) {
    tanggalAwal.value = tanggalISO(tanggalTersedia[0]);
    tanggalAkhir.value = tanggalISO(
      tanggalTersedia[tanggalTersedia.length - 1]
    );
  } else {
    const hariIni = tanggalISO(new Date());
    tanggalAwal.value = hariIni;
    tanggalAkhir.value = hariIni;
  }
}

// Menyaring data berdasarkan tanggal dan kendaraan.
function ambilHasilFilter() {
  const awal = parseTanggal(tanggalAwal.value);
  const akhir = parseTanggal(tanggalAkhir.value);
  const kendaraanDipilih = filterKendaraan.value;

  if (!awal || !akhir) {
    filterMessage.textContent = "Silakan isi tanggal awal dan akhir.";
    return null;
  }

  if (awal > akhir) {
    filterMessage.textContent =
      "Tanggal awal tidak boleh melebihi tanggal akhir.";
    return null;
  }

  filterMessage.textContent = "";

  return semuaServis
    .map((item, index) => ({ item, index }))
    .filter(({ item }) => {
      const tanggal = parseTanggal(ambilNilai(item, [
        "tanggal", "tanggalServis", "tanggal_servis", "date"
      ]));

      if (!tanggal) return false;

      const dalamRentang = tanggal >= awal && tanggal <= akhir;
      const cocokKendaraan =
        kendaraanDipilih === "semua" ||
        namaKendaraan(item) === kendaraanDipilih;

      return dalamRentang && cocokKendaraan;
    })
    .sort((a, b) => {
      const tglA = parseTanggal(ambilNilai(a.item, [
        "tanggal", "tanggalServis", "date"
      ]));

      const tglB = parseTanggal(ambilNilai(b.item, [
        "tanggal", "tanggalServis", "date"
      ]));

      return tglA - tglB || a.index - b.index;
    })
    .map(({ item }) => item);
}

// Ringkasan pengeluaran.
function tampilkanRingkasan(data) {
  const total = data.reduce(
    (jumlah, item) => jumlah + nilaiBiaya(item), 0
  );

  const jumlah = data.length;
  const rata = jumlah ? total / jumlah : 0;

  document.getElementById("totalPengeluaran").textContent =
    formatRupiah(total);

  document.getElementById("jumlahServis").textContent =
    `${jumlah} kali`;

  document.getElementById("rataBiaya").textContent =
    formatRupiah(rata);

  document.getElementById("rentangWaktu").textContent =
    `${formatTanggal(tanggalAwal.value)} – ${formatTanggal(tanggalAkhir.value)}`;
}

// Membuat grafik donat berdasarkan jenis servis.
function tampilkanDonat(data) {
  const donut = document.getElementById("donutChart");
  const legend = document.getElementById("donutLegend");

  document.getElementById("donutTotal").textContent = data.length;

  if (!data.length) {
    donut.style.background =
      "conic-gradient(#dbeafa 0deg 360deg)";

    legend.replaceChildren();

    const pesan = document.createElement("p");
    pesan.className = "empty-chart";
    pesan.textContent = "Belum ada data servis.";
    legend.appendChild(pesan);
    return;
  }

  const rekap = {};

  data.forEach(item => {
    const jenis = jenisServis(item);
    rekap[jenis] = (rekap[jenis] || 0) + 1;
  });

  const daftar = Object.entries(rekap)
    .sort((a, b) => b[1] - a[1]);

  let sudutAwal = 0;

  const bagian = daftar.map(([nama, jumlah], index) => {
    const sudutAkhir = sudutAwal + jumlah / data.length * 360;
    const warna = warnaGrafik[index % warnaGrafik.length];

    const bagianCSS = `${warna} ${sudutAwal}deg ${sudutAkhir}deg`;
    sudutAwal = sudutAkhir;

    return { nama, jumlah, warna, bagianCSS };
  });

  donut.style.background =
    `conic-gradient(${bagian.map(item => item.bagianCSS).join(", ")})`;

  legend.replaceChildren();

  bagian.forEach(item => {
    const persentase = Math.round(item.jumlah / data.length * 100);

    const baris = document.createElement("div");
    baris.className = "legend-item";

    const titik = document.createElement("span");
    titik.className = "legend-dot";
    titik.style.background = item.warna;

    const teks = document.createElement("div");
    teks.className = "legend-text";

    const nama = document.createElement("span");
    nama.className = "legend-name";
    nama.textContent = `${item.nama} (${item.jumlah} kali)`;

    const persen = document.createElement("span");
    persen.className = "legend-percent";
    persen.textContent = `${persentase}%`;

    teks.append(nama, persen);
    baris.append(titik, teks);
    legend.appendChild(baris);
  });
}

// Grafik batang pengeluaran.
function tampilkanGrafik(data) {
  const wadah = document.getElementById("barChart");
  wadah.replaceChildren();

  if (!data.length) {
    const pesan = document.createElement("p");
    pesan.className = "empty-chart";
    pesan.textContent = "Belum ada data pengeluaran.";
    wadah.appendChild(pesan);
    return;
  }

  const mode = jenisGrafik.value;
  const rekap = {};

  data.forEach(item => {
    const tanggal = parseTanggal(ambilNilai(item, [
      "tanggal", "tanggalServis", "tanggal_servis", "date"
    ]));

    if (!tanggal) return;

    const kunci = mode === "tahun"
      ? String(tanggal.getFullYear())
      : `${tanggal.getFullYear()}-${String(tanggal.getMonth() + 1).padStart(2, "0")}`;

    rekap[kunci] = (rekap[kunci] || 0) + nilaiBiaya(item);
  });

  let entri = Object.entries(rekap).sort(
    (a, b) => a[0].localeCompare(b[0])
  );

  // Batasi jumlah batang agar grafik tetap terbaca.
  entri = entri.slice(-6);

  const nilaiMaksimum = Math.max(
    1,
    ...entri.map(([, nilai]) => nilai)
  );

  const sumbu = document.createElement("div");
  sumbu.className = "y-axis";

  const nilaiSumbu = [
    nilaiMaksimum,
    nilaiMaksimum * 0.75,
    nilaiMaksimum * 0.5,
    nilaiMaksimum * 0.25,
    0
  ];

  nilaiSumbu.forEach(nilai => {
    const label = document.createElement("span");
    label.textContent = nilai >= 1000000
      ? `${(nilai / 1000000).toLocaleString("id-ID", {
          maximumFractionDigits: 1
        })}jt`
      : nilai >= 1000
        ? `${Math.round(nilai / 1000)}k`
        : Math.round(nilai).toString();

    sumbu.appendChild(label);
  });

  const area = document.createElement("div");
  area.className = "plot-area";

  const batang = document.createElement("div");
  batang.className = "plot-bars";

  entri.forEach(([kunci, nilai]) => {
    const kolom = document.createElement("div");
    kolom.className = "bar-column";

    const labelNilai = document.createElement("span");
    labelNilai.className = "bar-value";
    labelNilai.textContent = formatRupiah(nilai);

    const isi = document.createElement("div");
    isi.className = "bar-fill";
    isi.style.height =
      `${Math.max(1, nilai / nilaiMaksimum * 82)}%`;
    isi.title = `${kunci}: ${formatRupiah(nilai)}`;

    const labelBawah = document.createElement("span");
    labelBawah.className = "bar-label";

    if (mode === "tahun") {
      labelBawah.textContent = kunci;
    } else {
      const [tahun, bulan] = kunci.split("-");
      labelBawah.textContent =
        `${singkatanBulan[Number(bulan) - 1]} ${tahun}`;
    }

    kolom.append(labelNilai, isi, labelBawah);
    batang.appendChild(kolom);
  });

  area.appendChild(batang);
  wadah.append(sumbu, area);
}

// Membuat isi tabel dengan textContent agar data aman ditampilkan.
function tampilkanTabel(data) {
  const tbody = document.getElementById("tabelRincian");
  tbody.replaceChildren();

  if (!data.length) {
    const tr = document.createElement("tr");
    const td = document.createElement("td");

    td.colSpan = 6;
    td.className = "empty-table";
    td.textContent = "Tidak ada data servis pada filter ini.";

    tr.appendChild(td);
    tbody.appendChild(tr);
  } else {
    data.forEach((item, index) => {
      const tr = document.createElement("tr");

      const kolom = [
        index + 1,
        formatTanggal(ambilNilai(item, [
          "tanggal", "tanggalServis", "tanggal_servis", "date"
        ])),
        namaKendaraan(item),
        jenisServis(item),
        formatRupiah(nilaiBiaya(item)),
        namaBengkel(item)
      ];

      kolom.forEach((nilai, nomor) => {
        const td = document.createElement("td");
        td.textContent = nilai;

        if (nomor === 4) {
          td.className = "biaya-cell";
        }

        tr.appendChild(td);
      });

      tbody.appendChild(tr);
    });
  }

  const total = data.reduce(
    (jumlah, item) => jumlah + nilaiBiaya(item), 0
  );

  document.getElementById("jumlahBaris").textContent =
    `${data.length} data servis`;

  document.getElementById("totalTabel").textContent =
    `Total: ${formatRupiah(total)}`;
}

// Memperbarui semua bagian laporan.
function tampilkanLaporan() {
  const data = ambilHasilFilter();

  if (data === null) return;

  hasilFilter = data;

  tampilkanRingkasan(data);
  tampilkanDonat(data);
  tampilkanGrafik(data);
  tampilkanTabel(data);
}

// Filter tanggal dan kendaraan.
formFilter.addEventListener("submit", event => {
  event.preventDefault();
  tampilkanLaporan();
});

// Mengganti grafik bulanan/tahunan.
jenisGrafik.addEventListener("change", () => {
  tampilkanGrafik(hasilFilter);
});

// Mengunduh laporan dalam format CSV.
document.getElementById("btnUnduh").addEventListener("click", () => {
  if (!hasilFilter.length) {
    alert("Tidak ada data laporan untuk diunduh.");
    return;
  }

  const kolom = [
    "No.",
    "Tanggal Servis",
    "Nama Kendaraan",
    "Jenis Servis",
    "Biaya",
    "Nama Bengkel"
  ];

  const baris = hasilFilter.map((item, index) => [
    index + 1,
    formatTanggal(ambilNilai(item, [
      "tanggal", "tanggalServis", "tanggal_servis", "date"
    ])),
    namaKendaraan(item),
    jenisServis(item),
    nilaiBiaya(item),
    namaBengkel(item)
  ]);

  function csvCell(nilai) {
    let teks = String(nilai ?? "");

    // Mencegah formula spreadsheet dieksekusi dari data teks.
    if (/^[\s]*[=+@]/.test(teks)) {
      teks = "'" + teks;
    }

    return '"' + teks.replace(/"/g, '""') + '"';
  }

  const csv = "\uFEFF" + [
    kolom,
    ...baris,
    [],
    ["Total Pengeluaran", hasilFilter.reduce(
      (total, item) => total + nilaiBiaya(item), 0
    )],
    ["Tanggal Awal", formatTanggal(tanggalAwal.value)],
    ["Tanggal Akhir", formatTanggal(tanggalAkhir.value)]
  ].map(barisCSV => barisCSV.map(csvCell).join(";")).join("\r\n");

  const file = new Blob([csv], {
    type: "text/csv;charset=utf-8;"
  });

  const url = URL.createObjectURL(file);
  const link = document.createElement("a");

  link.href = url;
  link.download = `laporan-servis-${tanggalAwal.value}-${tanggalAkhir.value}.csv`;

  document.body.appendChild(link);
  link.click();
  link.remove();

  setTimeout(() => URL.revokeObjectURL(url), 1000);
});

// Inisialisasi.
function mulaiLaporan() {
  semuaServis = bacaData(KEY_SERVIS);

  isiFilterKendaraan();
  aturTanggalAwal();
  tampilkanLaporan();
}

mulaiLaporan();
