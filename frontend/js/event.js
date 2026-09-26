/*
    ADTU BODO UNION
    MANUAL EVENT PAGE - FRONTEND ONLY
*/

// =====================================
// EVENT INFORMATION
// CHANGE ONLY THESE VALUES FOR A NEW EVENT
// =====================================
const EVENT = {
    name: "ADTU Bodo Union Event",
    description: "ADTU Bodo Union event and activities.",
    photos: "https://drive.google.com/drive/u/0/folders/1sUWOsp7ex37ZWALa-06RYmQYFj0z4udw",
    videos: "https://drive.google.com/drive/u/0/folders/1hNPvv_pFfPU7bXUdp-57YF5n_EBkGu1X"
};

// =====================================
// DOM ELEMENTS
// =====================================
const nameElement = document.getElementById("eventName");
const descriptionElement = document.getElementById("eventDescription");
const photosButton = document.querySelector(".event-media-buttons a:nth-child(1)");
const videosButton = document.querySelector(".event-media-buttons a:nth-child(2)");
const qrCode = document.getElementById("eventQRCode");
const qrButton = document.getElementById("qrButton");
const yearElement = document.getElementById("year");

// =====================================
// UPDATE YEAR IN FOOTER
// =====================================
if (yearElement) {
    yearElement.textContent = new Date().getFullYear();
}

// =====================================
// POPULATE EVENT CONTENT
// =====================================
if (nameElement) {
    nameElement.textContent = EVENT.name;
}

if (descriptionElement) {
    descriptionElement.textContent = EVENT.description;
}

// =====================================
// POPULATE MEDIA LINKS
// =====================================
if (photosButton) {
    photosButton.href = EVENT.photos;
}

if (videosButton) {
    videosButton.href = EVENT.videos;
}

// =====================================
// QR CODE GENERATION
// =====================================
// Generates a QR code pointing to this event page
const eventURL = window.location.href;
const qrURL = "https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=" + encodeURIComponent(eventURL);

if (qrCode) {
    qrCode.src = qrURL;
}

if (qrButton) {
    qrButton.href = qrURL;
}