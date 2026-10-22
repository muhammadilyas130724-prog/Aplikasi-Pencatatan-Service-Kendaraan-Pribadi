
const registerForm = document.getElementById("registerForm");
const passwordInput = document.getElementById("password");
const konfirmasiInput = document.getElementById("konfirmasiPassword");
const pesan = document.getElementById("pesan");

registerForm.addEventListener("submit", function (event) {
    event.preventDefault();

    const nama = document.getElementById("nama").value.trim();
    const email = document.getElementById("email").value.trim();
    const password = passwordInput.value;
    const konfirmasiPassword = konfirmasiInput.value;

    if (!nama || !email || !password || !konfirmasiPassword) {
        pesan.textContent = "Semua kolom wajib diisi.";
        pesan.style.color = "#d93025";
        return;
    }

    if (password.length < 8) {
        pesan.textContent = "Password minimal 8 karakter.";
        pesan.style.color = "#d93025";
        return;
    }

    if (password !== konfirmasiPassword) {
        pesan.textContent =
            "Konfirmasi password tidak sama dengan password.";
        pesan.style.color = "#d93025";
        konfirmasiInput.focus();
        return;
    }

    pesan.textContent =
        "Validasi berhasil! Form siap dihubungkan ke sistem pendaftaran akun.";
    pesan.style.color = "#218838";
});
