const inputCari = document.getElementById("cariServis");
const daftarServis = document.getElementById("daftarServis");
const pesanKosong = document.getElementById("pesanKosong");

const semuaBaris = Array.from(
    daftarServis.querySelectorAll("tr")
);

inputCari.addEventListener("input", function () {
    const kataKunci = inputCari.value
        .trim()
        .toLowerCase();

    let jumlahHasil = 0;

    semuaBaris.forEach(function (baris) {
        const isiBaris = baris.textContent.toLowerCase();

        const cocok = isiBaris.includes(kataKunci);

        baris.hidden = !cocok;

        if (cocok) {
            jumlahHasil++;
        }
    });
    tombolDetail.href =
        "detailservis.html?id=" +
        encodeURIComponent(String(servis.id));
    pesanKosong.hidden = jumlahHasil > 0;
});
