/*
ADTU BODO UNION
EVENT DETAILS PAGE

URL:
events/event.html?id=EVENT_ID

Events are stored in localStorage.
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

const deleteEventButton =
    document.getElementById(
        "deleteEventButton"
    );

const eventContainer =
    document.getElementById(
        "event-details-container"
    );


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
            localStorage.getItem(
                STORAGE_KEY
            );

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

let event =
    events.find(
        item =>
            String(item.id) ===
            String(eventId)
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
            "This event may have been deleted or does not exist.";

    }

    if (mediaButton) {

        mediaButton.style.display =
            "none";

    }

    if (qrButton) {

        qrButton.style.display =
            "none";

    }

    if (qrImage) {

        qrImage.style.display =
            "none";

    }

    if (deleteEventButton) {

        deleteEventButton.style.display =
            "none";

    }

}


// =====================================
// DISPLAY EVENT
// =====================================

if (event) {


    // =================================
    // EVENT NAME
    // =================================

    if (nameElement) {

        nameElement.textContent =
            event.name || "Untitled Event";

    }


    // =================================
    // EVENT DATE
    // =================================

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


    // =================================
    // DESCRIPTION
    // =================================

    if (descriptionElement) {

        let description =
            event.description || "";

        if (formattedDate) {

            if (description) {

                description +=
                    ` Date: ${formattedDate}`;

            } else {

                description =
                    `Date: ${formattedDate}`;

            }

        }

        descriptionElement.textContent =
            description;

    }


    // =================================
    // GOOGLE DRIVE MEDIA
    // =================================

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


    // =================================
    // QR CODE
    // =================================

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


    // =================================
    // QR BUTTON
    // =================================

    if (qrButton) {

        if (event.photos) {

            qrButton.href =
                event.photos;

            qrButton.target =
                "_blank";

            qrButton.rel =
                "noopener noreferrer";

        } else {

            qrButton.style.display =
                "none";

        }

    }


    // =================================
    // DELETE EVENT
    // =================================

    if (deleteEventButton) {

        deleteEventButton.addEventListener(
            "click",
            function () {


                const eventName =
                    event.name ||
                    "this event";


                // CONFIRM DELETE

                const confirmed =
                    confirm(
                        `Are you sure you want to delete "${eventName}"?`
                    );


                if (!confirmed) {

                    return;

                }


                try {


                    // GET CURRENT EVENTS

                    const savedEvents =
                        localStorage.getItem(
                            STORAGE_KEY
                        );


                    const currentEvents =
                        savedEvents
                            ? JSON.parse(
                                savedEvents
                            )
                            : [];


                    // REMOVE EVENT

                    const updatedEvents =
                        currentEvents.filter(
                            item =>
                                String(item.id) !==
                                String(event.id)
                        );


                    // SAVE UPDATED EVENTS

                    localStorage.setItem(
                        STORAGE_KEY,
                        JSON.stringify(
                            updatedEvents
                        )
                    );


                    // SUCCESS MESSAGE

                    alert(
                        "Event deleted successfully."
                    );


                    // RETURN TO EVENTS

                    window.location.href =
                        "../index.html#events";


                } catch (error) {


                    console.error(
                        "Could not delete event:",
                        error
                    );


                    alert(
                        "Unable to delete the event. Please try again."
                    );

                }

            }
        );

    }

}
