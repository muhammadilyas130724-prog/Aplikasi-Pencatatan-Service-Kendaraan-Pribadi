const namaProfil = document.getElementById("namaProfil");
const emailProfil = document.getElementById("emailProfil");
const namaAkun = document.getElementById("namaAkun");
const emailAkun = document.getElementById("emailAkun");
const teleponAkun = document.getElementById("teleponAkun");
const btnLogout = document.getElementById("btnLogout");

// Data profil default
const profilDefault = {
    nama: "Uchiha Sasuke",
    email: "sasukeganteng1@gmail.com",
    telepon: "0812 3456 7890"
};

// Membaca data profil yang tersimpan
function tampilkanProfil() {
    let profil = profilDefault;

    try {
        const dataTersimpan = localStorage.getItem("servisku_profil");

        if (dataTersimpan) {
            const data = JSON.parse(dataTersimpan);

            profil = {
                nama: data.nama || profilDefault.nama,
                email: data.email || profilDefault.email,
                telepon: data.telepon || profilDefault.telepon
            };
        }
    } catch (error) {
        console.error("Gagal membaca data profil:", error);
    }

    namaProfil.textContent = profil.nama;
    emailProfil.textContent = profil.email;

    namaAkun.textContent = profil.nama;
    emailAkun.textContent = profil.email;
    teleponAkun.textContent = profil.telepon;
}

// Tombol Logout
btnLogout.addEventListener("click", function () {
    localStorage.removeItem("servisku_login");

    // Langsung kembali ke halaman login awal
    window.location.href = "login.html";
});

// Tampilkan profil saat halaman dibuka
tampilkanProfil();
