/*
    ADTU BODO UNION
    EVENT DETAILS PAGE
    --------------------------------
    Reads the event ID from:

    events/event.html?id=EVENT_ID
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
// FIND EVENT
// =====================================

const events =
    loadEvents();

const event =
    events.find(
        item =>
            item.id === eventId
    );


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
            "The selected event could not be found. Please return to the Events page and select an event.";
    }


    if (mediaButton) {
        mediaButton.style.display =
            "none";
    }

} else {

    // =================================
    // EVENT NAME
    // =================================

    if (nameElement) {

        nameElement.textContent =
            event.name;
    }


    // =================================
    // EVENT DATE
    // =================================

    const eventDate =
        new Date(
            event.date + "T00:00:00"
        );


    const formattedDate =
        eventDate.toLocaleDateString(
            "en-IN",
            {
                day: "numeric",
                month: "long",
                year: "numeric"
            }
        );


    // =================================
    // DESCRIPTION + DATE
    // =================================

    if (descriptionElement) {

        descriptionElement.textContent =
            `${event.description} Date: ${formattedDate}`;
    }


    // =================================
    // MEDIA LINK
    // =================================

    if (mediaButton) {

        if (event.photos) {

            mediaButton.href =
                event.photos;

            mediaButton.target =
                "_blank";

            mediaButton.rel =
                "noopener noreferrer";

        } else if (event.videos) {

            mediaButton.href =
                event.videos;

            mediaButton.target =
                "_blank";

            mediaButton.rel =
                "noopener noreferrer";

        } else {

            mediaButton.style.display =
                "none";
        }
    }


    // =================================
    // QR CODE
    // =================================

    const eventURL =
        window.location.href;


    const qrURL =
        "https://api.qrserver.com/v1/create-qr-code/" +
        "?size=300x300&data=" +
        encodeURIComponent(eventURL);


    const qrImage =
        document.querySelector(
            ".event-qr"
        );


    if (qrImage) {

        qrImage.src =
            qrURL;
    }


    if (qrButton) {

        qrButton.href =
            eventURL;

        qrButton.target =
            "_self";
    }

}