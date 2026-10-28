
"use strict";

const KEY_KENDARAAN = "servisku_kendaraan";
const KEY_EDIT = "servisku_kendaraan_diedit";
const KEY_DETAIL = "servisku_detail_kendaraan";

const daftarKendaraan = document.getElementById("daftarKendaraan");
const inputCari = document.getElementById("cariKendaraan");
const pesanKosong = document.getElementById("pesanKosong");
const selectUrut = document.getElementById("urutkanKendaraan");
const tombolFilter = document.querySelectorAll(".filter-button");

let filterAktif = "semua";

// Contoh awal hanya dibuat jika belum ada penyimpanan kendaraan.
const contohKendaraan = [
  {
    id: "kendaraan-001",
    nama: "Toyota Avanza",
    plat: "BP 1234 KZ",
    tahun: "2018",
    jenis: "Mobil",
    merek: "Toyota"
  },
  {
    id: "kendaraan-002",
    nama: "Honda Beat",
    plat: "BP 4567 MN",
    tahun: "2019",
    jenis: "Motor",
    merek: "Honda"
  },
  {
    id: "kendaraan-003",
    nama: "Honda Scoopy",
    plat: "BP 7890 PL",
    tahun: "2020",
    jenis: "Motor",
    merek: "Honda"
  }
];

// ---------- DATA ----------

function bacaKendaraan() {
  try {
    const tersimpan = localStorage.getItem(KEY_KENDARAAN);

    if (tersimpan === null) {
      localStorage.setItem(KEY_KENDARAAN, JSON.stringify(contohKendaraan));
      return [...contohKendaraan];
    }

    const data = JSON.parse(tersimpan);

    if (Array.isArray(data)) return data;
    if (Array.isArray(data?.kendaraan)) return data.kendaraan;
    if (Array.isArray(data?.data)) return data.data;

    return [];
  } catch (error) {
    console.error("Gagal membaca kendaraan:", error);
    return [];
  }
}

function simpanKendaraan(data) {
  try {
    localStorage.setItem(KEY_KENDARAAN, JSON.stringify(data));
    return true;
  } catch (error) {
    console.error("Gagal menyimpan kendaraan:", error);
    alert("Data kendaraan gagal disimpan.");
    return false;
  }
}

function ambilNilai(item, daftarProperti, nilaiDefault = "-") {
  for (const properti of daftarProperti) {
    const nilai = item?.[properti];

    if (nilai !== undefined && nilai !== null &&
        String(nilai).trim() !== "") {
      return String(nilai).trim();
    }
  }

  return nilaiDefault;
}

function namaKendaraan(item) {
  return ambilNilai(item, [
    "nama", "namaKendaraan", "nama_kendaraan",
    "kendaraan", "merekModel", "merek_model", "vehicle"
  ], "Kendaraan");
}

function platKendaraan(item) {
  return ambilNilai(item, [
    "plat", "nomorPlat", "nomor_plat",
    "noPlat", "no_plat", "nomorPolisi", "nomor_polisi"
  ]);
}

function tahunKendaraan(item) {
  return ambilNilai(item, [
    "tahun", "tahunProduksi", "tahun_produksi"
  ]);
}

function jenisKendaraan(item) {
  const jenis = ambilNilai(item, [
    "jenis", "tipe", "jenisKendaraan",
    "jenis_kendaraan", "kategori", "type"
  ], "").toLowerCase();

  const nama = namaKendaraan(item).toLowerCase();

  if (
    jenis.includes("motor") ||
    jenis.includes("roda dua") ||
    jenis.includes("scooter") ||
    jenis.includes("bike") ||
    /\b(beat|scoopy|vario|supra|mio|nmax|pcx)\b/.test(nama)
  ) {
    return "motor";
  }

  if (
    jenis.includes("mobil") ||
    jenis.includes("roda empat") ||
    jenis.includes("car")
  ) {
    return "mobil";
  }

  // Deteksi sederhana berdasarkan nama kendaraan.
  return "mobil";
}

function merekKendaraan(item) {
  const merek = ambilNilai(item, ["merek", "brand"], "");

  if (merek) return merek;

  const nama = namaKendaraan(item);
  const kata = nama.split(" ");

  return kata.length > 1 ? kata[0] : nama;
}

function idKendaraan(item, index) {
  return String(item?.id ?? item?._id ?? item?.uuid ?? `baris-${index}`);
}

// ---------- IKON SVG ----------

function ikonMobil() {
  return `
    <svg viewBox="0 0 160 110" fill="none" aria-hidden="true">
      <path d="M24 64L36 34Q40 24 52 24H108Q120 24 124 34L136 64"
        fill="#9DAEC1" stroke="#34445A" stroke-width="4"/>
      <path d="M43 35Q46 30 53 30H107Q114 30 117 35L126 58H34Z"
        fill="#D9EBFA" stroke="#34445A" stroke-width="3"/>
      <path d="M19 61Q19 55 27 55H133Q141 55 141 64V83H19Z"
        fill="#2380D9" stroke="#34445A" stroke-width="4"/>
      <path d="M25 66H135V78H25Z" fill="#4B9DEB"/>
      <circle cx="43" cy="83" r="14" fill="#28364A"/>
      <circle cx="43" cy="83" r="7" fill="#DDE8F3"/>
      <circle cx="117" cy="83" r="14" fill="#28364A"/>
      <circle cx="117" cy="83" r="7" fill="#DDE8F3"/>
      <rect x="19" y="63" width="10" height="9" rx="3" fill="#FFF1C2"/>
      <rect x="131" y="63" width="10" height="9" rx="3" fill="#FFD6D6"/>
    </svg>`;
}

function ikonMotor() {
  return `
    <svg viewBox="0 0 160 110" fill="none" aria-hidden="true">
      <circle cx="37" cy="79" r="20" stroke="#27364B" stroke-width="7"/>
      <circle cx="122" cy="79" r="20" stroke="#27364B" stroke-width="7"/>
      <circle cx="37" cy="79" r="5" fill="#6D8098"/>
      <circle cx="122" cy="79" r="5" fill="#6D8098"/>
      <path d="M37 78L59 49L83 78H54L70 55L101 57L122 78"
        stroke="#1976D2" stroke-width="9" stroke-linecap="round"
        stroke-linejoin="round"/>
      <path d="M57 48L48 39H34L28 46H47"
        stroke="#27364B" stroke-width="6" stroke-linejoin="round"/>
      <path d="M70 54L78 35L99 35L111 48L101 57"
        fill="#2380D9" stroke="#27364B" stroke-width="4"
        stroke-linejoin="round"/>
      <path d="M77 35L86 26H99L104 35"
        stroke="#27364B" stroke-width="5" stroke-linejoin="round"/>
      <path d="M92 26L99 16L109 20L105 31"
        fill="#27364B"/>
      <path d="M81 36L70 36L64 43"
        stroke="#27364B" stroke-width="5" stroke-linecap="round"/>
    </svg>`;
}

function ikonEdit() {
  return `
    <svg viewBox="0 0 24 24" fill="none"
      stroke="currentColor" stroke-width="1.8"
      stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
      <path d="M12 20H4V4H14"/>
      <path d="M15 5L19 9L10 18L6 19L7 15Z"/>
      <path d="M17 3L21 7"/>
    </svg>`;
}

function ikonHapus() {
  return `
    <svg viewBox="0 0 24 24" fill="none"
      stroke="currentColor" stroke-width="1.8"
      stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
      <path d="M3 6H21"/>
      <path d="M8 6V3H16V6"/>
      <path d="M5 6L6.5 21H17.5L19 6"/>
      <path d="M10 10V17M14 10V17"/>
    </svg>`;
}

// ---------- KARTU KENDARAAN ----------

function buatTombol(label, className, icon, aksi) {
  const tombol = document.createElement("button");
  tombol.type = "button";
  tombol.className = `action-button ${className}`;
  tombol.setAttribute("aria-label", label);
  tombol.innerHTML = `${icon}<span>${label}</span>`;
  tombol.addEventListener("click", aksi);
  return tombol;
}

function buatKartu(item, index) {
  const jenis = jenisKendaraan(item);
  const kartu = document.createElement("article");
  kartu.className = "vehicle-card";

  const gambar = document.createElement("div");
  gambar.className = "vehicle-picture";
  gambar.innerHTML = jenis === "motor" ? ikonMotor() : ikonMobil();

  const info = document.createElement("div");
  info.className = "vehicle-info";

  const nama = document.createElement("h2");
  nama.className = "vehicle-name";
  nama.textContent = namaKendaraan(item);

  const detail = document.createElement("div");
  detail.className = "vehicle-details";

  const plat = document.createElement("span");
  plat.className = "detail-item";
  plat.innerHTML = '<span class="detail-symbol">▣</span>';
  plat.appendChild(document.createTextNode(` ${platKendaraan(item)}`));

  const tahun = document.createElement("span");
  tahun.className = "detail-item";
  tahun.innerHTML = '<span class="detail-symbol">▦</span>';
  tahun.appendChild(document.createTextNode(` Tahun ${tahunKendaraan(item)}`));

  detail.append(plat, tahun);

  const tags = document.createElement("div");
  tags.className = "vehicle-tags";

  const tagJenis = document.createElement("span");
  tagJenis.className = `tag ${jenis === "motor" ? "tag-motor" : "tag-car"}`;
  tagJenis.textContent = jenis === "motor" ? "Motor" : "Mobil";

  const tagMerek = document.createElement("span");
  tagMerek.className = "tag";
  tagMerek.textContent = merekKendaraan(item);

  tags.append(tagJenis, tagMerek);
  info.append(nama, detail, tags);

  const aksi = document.createElement("div");
  aksi.className = "vehicle-actions";

  aksi.appendChild(buatTombol("Edit", "edit-button", ikonEdit(), () => {
    editKendaraan(item, index);
  }));

  aksi.appendChild(buatTombol("Hapus", "delete-button", ikonHapus(), () => {
    hapusKendaraan(item, index);
  }));

  const panah = document.createElement("button");
  panah.type = "button";
  panah.className = "detail-button";
  panah.textContent = "›";
  panah.title = "Lihat detail kendaraan";
  panah.setAttribute("aria-label", `Detail ${namaKendaraan(item)}`);
  panah.addEventListener("click", () => bukaDetail(item));

  kartu.append(gambar, info, aksi, panah);
  return kartu;
}

// ---------- FITUR EDIT, HAPUS, DETAIL ----------


function editKendaraan(item, index) {
  // Hapus popup edit sebelumnya jika masih ada.
  document.getElementById("modalEditKendaraan")?.remove();

  const modal = document.createElement("div");
  modal.id = "modalEditKendaraan";
  modal.className = "edit-modal-overlay";

  modal.innerHTML = `
    <div class="edit-modal" role="dialog"
         aria-modal="true" aria-labelledby="judulEdit">
      <div class="edit-modal-header">
        <div>
          <h2 id="judulEdit">Edit Kendaraan</h2>
          <p>Perbarui informasi kendaraan kamu.</p>
        </div>
        <button type="button" class="close-modal"
                aria-label="Tutup">&times;</button>
      </div>

      <form id="formEditKendaraan">
        <label for="editNama">Nama Kendaraan</label>
        <input id="editNama" name="nama" required>

        <label for="editPlat">Nomor Plat</label>
        <input id="editPlat" name="plat" required>

        <label for="editTahun">Tahun Kendaraan</label>
        <input id="editTahun" name="tahun" type="number"
               min="1900" max="2100" required>

        <label for="editJenis">Jenis Kendaraan</label>
        <select id="editJenis" name="jenis" required>
          <option value="Mobil">Mobil</option>
          <option value="Motor">Motor</option>
        </select>

        <div class="edit-modal-actions">
          <button type="button" class="cancel-edit">Batal</button>
          <button type="submit" class="save-edit">Simpan Perubahan</button>
        </div>
      </form>
    </div>
  `;

  document.body.appendChild(modal);

  const form = modal.querySelector("#formEditKendaraan");

  form.elements.nama.value = namaKendaraan(item);
  form.elements.plat.value = platKendaraan(item);
  form.elements.tahun.value = tahunKendaraan(item) === "-"
    ? ""
    : tahunKendaraan(item);

  form.elements.jenis.value =
    jenisKendaraan(item) === "motor" ? "Motor" : "Mobil";

  function tutupModal() {
    modal.remove();
  }

  modal.querySelector(".close-modal").addEventListener("click", tutupModal);
  modal.querySelector(".cancel-edit").addEventListener("click", tutupModal);

  modal.addEventListener("click", (event) => {
    if (event.target === modal) tutupModal();
  });

  form.addEventListener("submit", (event) => {
    event.preventDefault();

    const namaBaru = form.elements.nama.value.trim();
    const platBaru = form.elements.plat.value.trim();
    const tahunBaru = form.elements.tahun.value;
    const jenisBaru = form.elements.jenis.value;

    if (!namaBaru || !platBaru || !tahunBaru) {
      alert("Semua kolom wajib diisi.");
      return;
    }

    const tahunAngka = Number(tahunBaru);

    if (
      !Number.isInteger(tahunAngka) ||
      tahunAngka < 1900 ||
      tahunAngka > 2100
    ) {
      alert("Masukkan tahun kendaraan yang valid.");
      return;
    }

    const semua = bacaKendaraan();

    // Perbarui kendaraan yang dipilih tanpa membuat data baru.
    const kendaraanLama = semua[index];

    if (!kendaraanLama) {
      alert("Data kendaraan tidak ditemukan. Muat ulang halaman.");
      tutupModal();
      tampilkanKendaraan();
      return;
    }

    semua[index] = {
      ...kendaraanLama,
      nama: namaBaru,
      plat: platBaru.toUpperCase(),
      tahun: String(tahunAngka),
      jenis: jenisBaru
    };

    if (simpanKendaraan(semua)) {
      tutupModal();
      tampilkanKendaraan();
    }
  });

  modal.querySelector("#editNama").focus();


  // Hapus berdasarkan posisi data yang dipilih.
  semua.splice(index, 1);

  if (simpanKendaraan(semua)) {
    tampilkanKendaraan();
  }
}

function bukaDetail(item) {
  localStorage.setItem(KEY_DETAIL, JSON.stringify(item));

  const tujuan = new URL("detailkendaraan.html", window.location.href);
  tujuan.searchParams.set("id", idKendaraan(item, 0));

  window.location.href = tujuan.href;
}

// ---------- PENCARIAN, FILTER, SORTING ----------

function tampilkanKendaraan() {
  const semua = bacaKendaraan();
  const kata = inputCari.value.trim().toLowerCase();

  let hasil = semua
    .map((item, index) => ({ item, index }))
    .filter(({ item }) => {
      const teks = [
        namaKendaraan(item),
        platKendaraan(item),
        tahunKendaraan(item),
        jenisKendaraan(item),
        merekKendaraan(item)
      ].join(" ").toLowerCase();

      const cocokCari = teks.includes(kata);
      const cocokFilter =
        filterAktif === "semua" ||
        jenisKendaraan(item) === filterAktif;

      return cocokCari && cocokFilter;
    });

  if (selectUrut.value === "nama") {
    hasil.sort((a, b) =>
      namaKendaraan(a.item).localeCompare(namaKendaraan(b.item), "id")
    );
  } else if (selectUrut.value === "terlama") {
    hasil.reverse();
  }

  daftarKendaraan.replaceChildren();

  hasil.forEach(({ item, index }) => {
    daftarKendaraan.appendChild(buatKartu(item, index));
  });

  pesanKosong.hidden = hasil.length > 0;

  pesanKosong.textContent = semua.length === 0
    ? "Belum ada kendaraan. Silakan tambah kendaraan terlebih dahulu."
    : "Kendaraan tidak ditemukan. Coba kata kunci atau filter lain.";
}

inputCari.addEventListener("input", tampilkanKendaraan);
selectUrut.addEventListener("change", tampilkanKendaraan);

tombolFilter.forEach((tombol) => {
  tombol.addEventListener("click", () => {
    filterAktif = tombol.dataset.filter;

    tombolFilter.forEach((item) => {
      item.classList.toggle("active", item === tombol);
    });

    tampilkanKendaraan();
  });
});

window.addEventListener("storage", (event) => {
  if (event.key === KEY_KENDARAAN) {
    tampilkanKendaraan();
  }
});

document.addEventListener("DOMContentLoaded", tampilkanKendaraan);

/* FORM TAMBAH KENDARAAN DI HALAMAN YANG SAMA */

const btnTambahKendaraan = document.getElementById("btnTambahKendaraan");
const modalKendaraan = document.getElementById("modalKendaraan");
const formKendaraan = document.getElementById("formKendaraan");
const btnTutupModal = document.getElementById("btnTutupModal");
const btnBatalKendaraan = document.getElementById("btnBatalKendaraan");

function bukaFormKendaraan() {
  modalKendaraan.hidden = false;
  document.body.style.overflow = "hidden";
  document.getElementById("namaKendaraan").focus();
}

function tutupFormKendaraan() {
  modalKendaraan.hidden = true;
  document.body.style.overflow = "";
  formKendaraan.reset();
  btnTambahKendaraan.focus();
}

// Klik tombol Tambah Kendaraan.
btnTambahKendaraan.addEventListener("click", bukaFormKendaraan);

// Klik tombol Batal atau tanda silang.
btnBatalKendaraan.addEventListener("click", tutupFormKendaraan);
btnTutupModal.addEventListener("click", tutupFormKendaraan);

// Klik area gelap di luar formulir untuk menutupnya.
modalKendaraan.addEventListener("click", function (event) {
  if (event.target === modalKendaraan) {
    tutupFormKendaraan();
  }
});

// Tutup formulir menggunakan tombol Escape.
document.addEventListener("keydown", function (event) {
  if (event.key === "Escape" && !modalKendaraan.hidden) {
    tutupFormKendaraan();
  }
});

// Simpan kendaraan baru.
formKendaraan.addEventListener("submit", function (event) {
  event.preventDefault();

  const nama = document.getElementById("namaKendaraan").value.trim();
  const plat = document.getElementById("platKendaraan").value.trim();
  const tahun = document.getElementById("tahunKendaraan").value;
  const jenis = document.getElementById("jenisKendaraan").value;
  const merek = document.getElementById("merekKendaraan").value.trim();

  if (!nama || !plat || !tahun || !jenis || !merek) {
    alert("Mohon lengkapi semua data kendaraan.");
    return;
  }

  const tahunAngka = Number(tahun);

  if (
    !Number.isInteger(tahunAngka) ||
    tahunAngka < 1900 ||
    tahunAngka > 2100
  ) {
    alert("Tahun kendaraan tidak valid.");
    return;
  }

  const kendaraanBaru = {
    id: "kendaraan-" + Date.now() + "-" +
        Math.random().toString(36).slice(2, 7),
    nama: nama,
    plat: plat.toUpperCase(),
    tahun: String(tahunAngka),
    jenis: jenis,
    merek: merek
  };

  const semuaKendaraan = bacaKendaraan();

  // Simpan data baru tanpa menghapus kendaraan yang sudah ada.
  semuaKendaraan.push(kendaraanBaru);

  if (!simpanKendaraan(semuaKendaraan)) {
    return;
  }

  // Tampilkan kendaraan baru pada halaman yang sama.
  inputCari.value = "";
  filterAktif = "semua";
  selectUrut.value = "terbaru";

  tombolFilter.forEach(function (tombol) {
    tombol.classList.toggle(
      "active",
      tombol.dataset.filter === "semua"
    );
  });

  tampilkanKendaraan();
  tutupFormKendaraan();
});
