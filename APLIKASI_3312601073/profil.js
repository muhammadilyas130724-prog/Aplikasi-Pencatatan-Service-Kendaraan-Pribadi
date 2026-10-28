
"use strict";

const KEY_PENGGUNA = "servisku_pengguna";
const KEY_KENDARAAN = "servisku_kendaraan";

const $ = (id) => document.getElementById(id);

const form = $("formPengguna");
const panelForm = $("panelForm");
const tabel = $("tabelPengguna");
const dialogHapus = $("dialogHapus");

let daftarPengguna = [];
let daftarKendaraan = [];
let idAkanDihapus = null;
let pencarian = "";

// Membaca data secara aman.
function bacaData(key) {
  try {
    const data = JSON.parse(localStorage.getItem(key) || "[]");

    if (Array.isArray(data)) return data;
    if (Array.isArray(data?.data)) return data.data;
    if (Array.isArray(data?.kendaraan)) return data.kendaraan;
    if (Array.isArray(data?.pengguna)) return data.pengguna;

    return [];
  } catch (error) {
    console.error("Gagal membaca data:", error);
    return [];
  }
}

function simpanPengguna() {
  localStorage.setItem(KEY_PENGGUNA, JSON.stringify(daftarPengguna));
}

function buatId() {
  if (window.crypto?.randomUUID) {
    return window.crypto.randomUUID();
  }

  return "user-" + Date.now() + "-" +
    Math.random().toString(36).slice(2, 9);
}

function teks(item, properti, fallback = "") {
  for (const key of properti) {
    const nilai = item?.[key];

    if (
      nilai !== undefined &&
      nilai !== null &&
      String(nilai).trim() !== ""
    ) {
      return String(nilai).trim();
    }
  }

  return fallback;
}

function nama(item) {
  return teks(item, ["nama", "namaLengkap", "nama_lengkap"], "Tanpa Nama");
}

function username(item) {
  return teks(item, ["username", "userName"], "-");
}

function telepon(item) {
  return teks(item, ["telepon", "nomorTelepon", "nomor_telepon", "noTelepon", "no_telp"]);
}

function email(item) {
  return teks(item, ["email", "emailPengguna"]);
}

// Hitung kendaraan milik pengguna.
// Untuk aplikasi satu pengguna, kendaraan tanpa informasi pemilik
// juga dihitung agar tetap kompatibel dengan data lama.
function hitungKendaraan(pengguna) {
  const id = String(pengguna.id ?? "");
  const user = username(pengguna).toLowerCase();
  const emailUser = email(pengguna).toLowerCase();

  const memilikiInformasiPemilik = daftarKendaraan.some(item =>
    item.userId != null ||
    item.user_id != null ||
    item.penggunaId != null ||
    item.pengguna_id != null ||
    item.username != null ||
    item.emailPemilik != null ||
    item.email_pemilik != null
  );

  if (!memilikiInformasiPemilik) {
    return daftarKendaraan.length;
  }

  return daftarKendaraan.filter(item => {
    const idPemilik = item.userId ?? item.user_id ??
      item.penggunaId ?? item.pengguna_id;

    const usernamePemilik = String(item.username ?? "").toLowerCase();
    const emailPemilik = String(
      item.emailPemilik ?? item.email_pemilik ?? ""
    ).toLowerCase();

    return (
      (idPemilik != null && String(idPemilik) === id) ||
      (usernamePemilik && usernamePemilik === user) ||
      (emailPemilik && emailPemilik === emailUser)
    );
  }).length;
}

// Menyiapkan contoh data pertama kali.
// Hanya dijalankan apabila belum ada data pengguna.
function siapkanDataAwal() {
  const sudahAda = localStorage.getItem(KEY_PENGGUNA);

  if (sudahAda !== null) return;

  daftarPengguna = [{
    id: buatId(),
    nama: "Sasuke",
    username: "Saske27",
    telepon: "",
    email: ""
  }];

  simpanPengguna();
}

function tampilkanRingkasan() {
  $("totalPengguna").textContent = daftarPengguna.length;

  const totalKendaraan = daftarPengguna.reduce(
    (total, item) => total + hitungKendaraan(item),
    0
  );

  $("totalKendaraan").textContent = totalKendaraan;
}

function buatTombol(label, className, aksi, id, ikon) {
  const button = document.createElement("button");
  button.type = "button";
  button.className = className;
  button.dataset.aksi = aksi;
  button.dataset.id = id;
  button.textContent = `${ikon} ${label}`;

  return button;
}

// Menampilkan tabel pengguna.
function tampilkanPengguna() {
  const kata = pencarian.toLowerCase();

  const hasil = daftarPengguna.filter(item => {
    const gabungan = [
      nama(item),
      username(item),
      telepon(item),
      email(item)
    ].join(" ").toLowerCase();

    return gabungan.includes(kata);
  });

  tabel.replaceChildren();

  $("jumlahHasil").textContent = `${hasil.length} pengguna`;
  $("infoTabel").textContent =
    `Menampilkan ${hasil.length} dari ${daftarPengguna.length} pengguna`;

  if (!hasil.length) {
    const tr = document.createElement("tr");
    const td = document.createElement("td");

    td.colSpan = 5;
    td.className = "empty-row";
    td.textContent = daftarPengguna.length
      ? "Pengguna tidak ditemukan."
      : "Belum ada pengguna. Klik Tambah Pengguna untuk memulai.";

    tr.appendChild(td);
    tabel.appendChild(tr);

    tampilkanRingkasan();
    return;
  }

  hasil.forEach((item, index) => {
    const tr = document.createElement("tr");

    // Nomor urut.
    const tdNomor = document.createElement("td");
    tdNomor.textContent = index + 1;
    tr.appendChild(tdNomor);

    // Nama dan avatar.
    const tdNama = document.createElement("td");
    const pembungkusNama = document.createElement("div");
    pembungkusNama.className = "user-name";

    const avatar = document.createElement("span");
    avatar.className = "avatar";
    avatar.textContent = nama(item).charAt(0).toUpperCase();

    const teksNama = document.createElement("span");
    teksNama.textContent = nama(item);

    pembungkusNama.append(avatar, teksNama);
    tdNama.appendChild(pembungkusNama);
    tr.appendChild(tdNama);

    // Username.
    const tdUsername = document.createElement("td");
    tdUsername.className = "username-text";
    tdUsername.textContent = username(item);
    tr.appendChild(tdUsername);

    // Jumlah kendaraan.
    const tdKendaraan = document.createElement("td");
    const badge = document.createElement("span");
    badge.className = "vehicle-count";
    badge.textContent = hitungKendaraan(item);
    tdKendaraan.appendChild(badge);
    tr.appendChild(tdKendaraan);

    // Tombol aksi.
    const tdAksi = document.createElement("td");
    const aksi = document.createElement("div");
    aksi.className = "action-buttons";

    aksi.append(
      buatTombol("Edit", "edit-button", "edit", String(item.id), "✎"),
      buatTombol("Hapus", "row-delete-button", "hapus", String(item.id), "▤")
    );

    tdAksi.appendChild(aksi);
    tr.appendChild(tdAksi);

    tabel.appendChild(tr);
  });

  tampilkanRingkasan();
}

// Membuka formulir tambah atau edit.
function bukaForm(mode, id = "") {
  form.reset();
  $("pesanForm").textContent = "";
  $("idPengguna").value = "";

  if (mode === "edit") {
    const item = daftarPengguna.find(
      pengguna => String(pengguna.id) === String(id)
    );

    if (!item) {
      alert("Data pengguna tidak ditemukan.");
      return;
    }

    $("judulForm").textContent = "Edit Data Pengguna";
    $("btnSimpan").textContent = "Simpan Perubahan";
    $("idPengguna").value = String(item.id);
    $("namaPengguna").value = nama(item);
    $("username").value = username(item) === "-" ? "" : username(item);
    $("telepon").value = telepon(item);
    $("emailPengguna").value = email(item);
  } else {
    $("judulForm").textContent = "Tambah Pengguna";
    $("btnSimpan").textContent = "Simpan Pengguna";
  }

  panelForm.hidden = false;

  panelForm.scrollIntoView({
    behavior: "smooth",
    block: "nearest"
  });

  $("namaPengguna").focus();
}

function tutupForm() {
  form.reset();
  panelForm.hidden = true;
  $("pesanForm").textContent = "";
}

// Tombol tambah.
$("btnTambah").addEventListener("click", () => {
  bukaForm("tambah");
});

// Tombol tutup dan batal.
$("btnTutupForm").addEventListener("click", tutupForm);
$("btnBatal").addEventListener("click", tutupForm);

// Pencarian langsung.
$("cariPengguna").addEventListener("input", event => {
  pencarian = event.target.value.trim();
  tampilkanPengguna();
});

// Event delegation untuk tombol Edit dan Hapus.
tabel.addEventListener("click", event => {
  const button = event.target.closest("button[data-aksi]");

  if (!button) return;

  const { aksi, id } = button.dataset;

  if (aksi === "edit") {
    bukaForm("edit", id);
  }

  if (aksi === "hapus") {
    const item = daftarPengguna.find(
      pengguna => String(pengguna.id) === String(id)
    );

    if (!item) {
      alert("Data pengguna tidak ditemukan.");
      return;
    }

    idAkanDihapus = String(item.id);

    $("teksKonfirmasi").textContent =
      `Kamu akan menghapus akun ${nama(item)} (@${username(item)}). Data kendaraan tidak ikut dihapus.`;

    dialogHapus.showModal();
  }
});

// Simpan pengguna baru atau perubahan pengguna lama.
form.addEventListener("submit", event => {
  event.preventDefault();

  const id = $("idPengguna").value;
  const namaBaru = $("namaPengguna").value.trim();
  const usernameBaru = $("username").value.trim();
  const teleponBaru = $("telepon").value.trim();
  const emailBaru = $("emailPengguna").value.trim();

  if (!namaBaru || !usernameBaru) {
    $("pesanForm").textContent =
      "Nama lengkap dan username wajib diisi.";
    return;
  }

  // Username harus unik.
  const usernameBentrok = daftarPengguna.some(item =>
    username(item).toLowerCase() === usernameBaru.toLowerCase() &&
    String(item.id) !== String(id)
  );

  if (usernameBentrok) {
    $("pesanForm").textContent =
      "Username sudah digunakan. Silakan pilih username lain.";
    $("username").focus();
    return;
  }

  const emailBentrok = emailBaru && daftarPengguna.some(item =>
    email(item).toLowerCase() === emailBaru.toLowerCase() &&
    String(item.id) !== String(id)
  );

  if (emailBentrok) {
    $("pesanForm").textContent =
      "Email sudah digunakan oleh pengguna lain.";
    $("emailPengguna").focus();
    return;
  }

  try {
    if (id) {
      const index = daftarPengguna.findIndex(
        item => String(item.id) === String(id)
      );

      if (index === -1) {
        $("pesanForm").textContent =
          "Data pengguna sudah tidak tersedia. Muat ulang halaman.";
        return;
      }

      daftarPengguna[index] = {
        ...daftarPengguna[index],
        nama: namaBaru,
        username: usernameBaru,
        telepon: teleponBaru,
        email: emailBaru
      };
    } else {
      daftarPengguna.push({
        id: buatId(),
        nama: namaBaru,
        username: usernameBaru,
        telepon: teleponBaru,
        email: emailBaru
      });
    }

    simpanPengguna();
    tutupForm();
    tampilkanPengguna();

  } catch (error) {
    console.error("Gagal menyimpan pengguna:", error);

    $("pesanForm").textContent =
      "Data gagal disimpan. Periksa penyimpanan browser.";
  }
});

// Membatalkan penghapusan.
$("btnBatalHapus").addEventListener("click", () => {
  idAkanDihapus = null;
  dialogHapus.close();
});

// Konfirmasi hapus.
$("btnKonfirmasiHapus").addEventListener("click", () => {
  if (idAkanDihapus === null) return;

  const masihAda = daftarPengguna.some(
    item => String(item.id) === idAkanDihapus
  );

  if (!masihAda) {
    dialogHapus.close();
    idAkanDihapus = null;
    alert("Data pengguna sudah tidak ditemukan.");
    return;
  }

  try {
    daftarPengguna = daftarPengguna.filter(
      item => String(item.id) !== idAkanDihapus
    );

    simpanPengguna();

    idAkanDihapus = null;
    dialogHapus.close();
    tampilkanPengguna();

    // Data kendaraan tidak ikut dihapus.
  } catch (error) {
    console.error("Gagal menghapus pengguna:", error);
    alert("Pengguna gagal dihapus. Silakan coba lagi.");
  }
});

// Tombol ikon akun di navbar.
$("btnProfil").addEventListener("click", () => {
  document.querySelector(".page-heading").scrollIntoView({
    behavior: "smooth",
    block: "start"
  });
});

// Memuat halaman.
function mulai() {
  siapkanDataAwal();

  daftarPengguna = bacaData(KEY_PENGGUNA);
  daftarKendaraan = bacaData(KEY_KENDARAAN);

  // Pastikan data lama tanpa ID tetap dapat diedit.
  let adaPerubahan = false;

  daftarPengguna = daftarPengguna.map(item => {
    if (item.id !== undefined && item.id !== null) {
      return item;
    }

    adaPerubahan = true;
    return { ...item, id: buatId() };
  });

  if (adaPerubahan) {
    simpanPengguna();
  }

  tampilkanPengguna();
}

mulai();
