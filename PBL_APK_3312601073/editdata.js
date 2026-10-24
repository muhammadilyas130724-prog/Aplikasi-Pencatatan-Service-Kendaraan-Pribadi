
"use strict";

document.addEventListener("DOMContentLoaded", function () {
    const form = document.getElementById("formTambahServis");
    const cancelButton = document.getElementById("btnBatal");
        const urlParams = new URLSearchParams(window.location.search);
    const editId = urlParams.get("id");
    const modeEdit = editId !== null && editId !== "";
    const pesanForm = document.getElementById("pesanForm");

    if (!form) {
        console.error("Form formTambahServis tidak ditemukan.");
        alert("Form tidak ditemukan. Periksa ID pada tambahservis.html.");
        return;
    }

    const getValue = id => {
        const element = document.getElementById(id);
        return element ? element.value.trim() : "";
    };

    function formatDate(dateString) {
        if (!dateString) return "";

        const [year, month, day] = dateString.split("-");
        return new Intl.DateTimeFormat("id-ID", {
            day: "numeric",
            month: "long",
            year: "numeric"
        }).format(new Date(+year, +month - 1, +day));
    }

    if (cancelButton) {
        cancelButton.addEventListener("click", function () {
            window.location.href = "detailservis.html";
        });
    }

    form.addEventListener("submit", function (event) {
        event.preventDefault();

        const vehicle = getValue("namaKendaraan");
        const mileageText = getValue("jarakTempuh");
        const date = getValue("tanggalServis");
        const costText = getValue("biaya");
        const type = getValue("jenisServis");
        const nextService = getValue("servisSelanjutnya");
        const workshop = getValue("namaBengkel");
        const notes = getValue("catatan");

        const mileage = Number(mileageText);
        const cost = Number(costText);

        if (
            !vehicle || !date || !type || !workshop ||
            mileageText === "" || costText === "" ||
            !Number.isSafeInteger(mileage) || mileage < 0 ||
            !Number.isSafeInteger(cost) || cost < 0
        ) {
            alert("Lengkapi semua kolom wajib dengan benar.");
            return;
        }

        if (nextService && nextService < date) {
            alert("Tanggal servis selanjutnya tidak boleh sebelum tanggal servis.");
            return;
        }

        const newService = {
            id: Date.now(),
            date: date,
            dateFormatted: formatDate(date),
            vehicle: vehicle,
            mileage: mileage,
            type: type,
            cost: cost,
            nextService: nextService,
            nextServiceFormatted: formatDate(nextService),
            workshop: workshop,
            notes: notes
        };

        try {
            const raw = localStorage.getItem("servisData");
            const savedServices = raw ? JSON.parse(raw) : [];

            if (!Array.isArray(savedServices)) {
                throw new Error("Data servis tidak berbentuk daftar.");
            }

            savedServices.push(newService);
            localStorage.setItem(
                "servisData",
                JSON.stringify(savedServices)
            );

            const verification = JSON.parse(
                localStorage.getItem("servisData")
            );

            if (!verification.some(item => item.id === newService.id)) {
                throw new Error("Data servis belum berhasil diverifikasi.");
            }

            alert("Data servis berhasil disimpan!");
            window.location.href = "servis1.html";

        } catch (error) {
            console.error("Gagal menyimpan data servis:", error);
            alert("Data gagal disimpan. Periksa Console browser.");
        }
    });

    console.log("detailservis.js berhasil dimuat.");
});
0.