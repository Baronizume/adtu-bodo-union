/*
    ADTU BODO UNION
    EVENT DETAILS PAGE
*/

const STORAGE_KEY = "adtuBodoUnionEvents";


// =====================================
// DOM ELEMENTS
// =====================================

const nameElement =
    document.getElementById("eventName");

const descriptionElement =
    document.getElementById("eventDescription");

const mediaButton =
    document.querySelector(".event-media-buttons a");

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
// LOAD LOCAL EVENTS
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
// FIND LOCAL EVENT
// =====================================

const events =
    loadEvents();

let event =
    events.find(
        item =>
            String(item.id) ===
            String(eventId)
    );


// =====================================
// PUBLIC EVENT FALLBACK
// =====================================
// This allows the GitHub Pages QR
// to work on another phone.
//
// IMPORTANT:
// This ID matches your existing QR.
// =====================================

if (
    !event &&
    eventId === "event-1790696014532-b5wk30"
) {

    event = {

        id: "event-1790696014532-b5wk30",

        name: "Rwnswndri Dance",

        description:
            "Tomorrow there will be a events",

        date:
            "2026-09-30",

        photos:
            "https://drive.google.com/drive/u/0/folders/1pdkZizfelsQe7A_S64hw9RUMYkremo8n",

        videos: ""

    };
}


// =====================================
// OLD DEFAULT EVENT
// =====================================

if (
    !event &&
    eventId === "rwnswndri-dance"
) {

    event = {

        id: "rwnswndri-dance",

        name: "Rwnswndri Dance",

        description:
            "Tomorrow there will be a events",

        date:
            "2026-09-30",

        photos:
            "https://drive.google.com/drive/u/0/folders/1pdkZizfelsQe7A_S64hw9RUMYkremo8n",

        videos: ""

    };
}


// =====================================
// EVENT NOT FOUND
// =====================================

if (!event) {

    if (nameElement) {
        nameElement.textContent =
            "Event Not Found";
    }

    if (descriptionElement) {
        descriptionElement.textContent =
            "This event could not be found.";
    }

    if (mediaButton) {
        mediaButton.style.display = "none";
    }

    if (qrButton) {
        qrButton.style.display = "none";
    }

    if (qrImage) {
        qrImage.style.display = "none";
    }

}


// =====================================
// DISPLAY EVENT
// =====================================

if (event) {

    // EVENT NAME

    if (nameElement) {

        nameElement.textContent =
            event.name || "Untitled Event";
    }


    // DATE

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


    // DESCRIPTION

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


    // GOOGLE DRIVE

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


    // QR FOR THIS EVENT

    const eventURL =
        window.location.href;

    const qrURL =
        "https://api.qrserver.com/v1/create-qr-code/" +
        "?size=300x300&data=" +
        encodeURIComponent(eventURL);

    if (qrImage) {
        qrImage.src = qrURL;
    }


    // OPEN MEDIA

    if (qrButton) {

        if (event.photos) {

            qrButton.href =
                event.photos;

            qrButton.target =
                "_blank";

            qrButton.rel =
                "noopener noreferrer";

            qrButton.style.display =
                "";
        } else {

            qrButton.style.display =
                "none";
        }
    }
}
