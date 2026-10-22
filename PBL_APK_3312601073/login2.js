
const loginForm = document.getElementById("loginForm");
const pesan = document.getElementById("pesan");

loginForm.addEventListener("submit", function (event) {
    event.preventDefault();

    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value;

    if (!email || !password) {
        pesan.textContent = "Email dan password wajib diisi.";
        pesan.style.color = "#d93025";
        return;
    }

    pesan.textContent =
        "Form berhasil divalidasi. Hubungkan ke sistem autentikasi untuk masuk.";
    pesan.style.color = "#218838";
});
