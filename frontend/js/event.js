/*
ADTU BODO UNION
EVENT DETAILS PAGE
--------------------------------
Reads the event ID from:

events/event.html?id=EVENT_ID

If the event is not available in localStorage,
the page can use the default event below.


*/

// =====================================
// STORAGE
// =====================================

const STORAGE_KEY = "adtuBodoUnionEvents";

// =====================================
// DOM ELEMENTS
// =====================================

const nameElement =
    document.getElementById("eventName");

const descriptionElement =
    document.getElementById("eventDescription");

const mediaButton =
    document.querySelector(
        ".event-media-buttons a"
    );

const qrButton =
    document.getElementById("qrButton");

const qrImage =
    document.querySelector(".event-qr");

const yearElement =
    document.getElementById("year");

// =====================================
// FOOTER YEAR
// =====================================

if (yearElement) {

    yearElement.textContent =
        new Date().getFullYear();


}

// =====================================
// LOAD EVENTS
// =====================================

function loadEvents() {

    try {

        const savedEvents =
            localStorage.getItem(STORAGE_KEY);

        if (!savedEvents) {
            return [];
        }

        const parsedEvents =
            JSON.parse(savedEvents);

        return Array.isArray(parsedEvents)
            ? parsedEvents
            : [];

    } catch (error) {

        console.error(
            "Could not load events:",
            error
        );

        return [];
    }


}

// =====================================
// GET EVENT ID
// =====================================

const params =
    new URLSearchParams(
        window.location.search
    );

const eventId =
    params.get("id");

// =====================================
// FIND EVENT FROM LOCAL STORAGE
// =====================================

const events =
    loadEvents();

let event =
    events.find(
        item =>
            String(item.id) === String(eventId)
    );

// =====================================
// DEFAULT EVENT
// =====================================
// This allows the page to work even if
// localStorage is empty on a phone.
//
// Change these values for this event.
// =====================================

if (!event) {

    event = {

        id: "rwnswndri-dance",

        name: "Rwnswndri Dance",

        description:
            "Tomorrow there will be a events",

        date:
            "2026-09-30",

        photos:
            "https://drive.google.com/drive/u/0/folders/1pdkZizfelsQe7A_S64hw9RUMYkremo8n"

    };


}

// =====================================
// DISPLAY EVENT
// =====================================

if (nameElement) {

    nameElement.textContent =
        event.name;


}

// =====================================
// EVENT DATE
// =====================================

let formattedDate = "";

if (event.date) {

    const eventDate =
        new Date(
            event.date + "T00:00:00"
        );

    if (!isNaN(eventDate.getTime())) {

        formattedDate =
            eventDate.toLocaleDateString(
                "en-IN",
                {
                    day: "numeric",
                    month: "long",
                    year: "numeric"
                }
            );

    }


}

// =====================================
// DESCRIPTION + DATE
// =====================================

if (descriptionElement) {

    let description =
        event.description || "";

    if (formattedDate) {

        description +=
            ` Date: ${formattedDate}`;

    }

    descriptionElement.textContent =
        description;


}

// =====================================
// GOOGLE DRIVE MEDIA LINK
// =====================================

if (mediaButton) {

    if (event.photos) {

        mediaButton.href =
            event.photos;

        mediaButton.target =
            "_blank";

        mediaButton.rel =
            "noopener noreferrer";

        mediaButton.style.display =
            "";

    } else {

        mediaButton.style.display =
            "none";

    }


}

// =====================================
// QR CODE
// =====================================
// QR points to THIS EVENT PAGE.
// Anyone scanning it will open the
// event page with its event ID.
// =====================================

const eventURL =
    window.location.href;

const qrURL =
    "https://api.qrserver.com/v1/create-qr-code/" +
    "?size=300x300&data=" +
    encodeURIComponent(eventURL);

if (qrImage) {

    qrImage.src =
        qrURL;


}

// =====================================
// QR BUTTON
// =====================================
// Open the Google Drive folder directly.
// =====================================

if (qrButton) {

    if (event.photos) {

        qrButton.href =
            event.photos;

        qrButton.target =
            "_blank";

        qrButton.rel =
            "noopener noreferrer";

    }


}