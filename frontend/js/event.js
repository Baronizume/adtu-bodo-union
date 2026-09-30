/*
    ADTU BODO UNION
    EVENT DETAILS PAGE
    --------------------------------
    Events are loaded from Cloud Firestore.
*/

const STORAGE_COLLECTION = "events";


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

const deleteEventButton =
    document.getElementById("deleteEventButton");


// =====================================
// FOOTER YEAR
// =====================================

if (yearElement) {

    yearElement.textContent =
        new Date().getFullYear();

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
// DISPLAY EVENT
// =====================================

function displayEvent(event) {

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

        return;
    }


    // =================================
    // EVENT NAME
    // =================================

    if (nameElement) {

        nameElement.textContent =
            event.name ||
            "Untitled Event";
    }


    // =================================
    // DATE
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

            description +=
                ` Date: ${formattedDate}`;
        }

        descriptionElement.textContent =
            description;
    }


    // =================================
    // GOOGLE DRIVE
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

        qrImage.style.display =
            "";
    }


    // =================================
    // OPEN MEDIA
    // =================================

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


// =====================================
// LOAD EVENT FROM FIRESTORE
// =====================================

async function loadEvent() {

    if (!eventId) {

        displayEvent(null);

        return;
    }


    try {

        const documentSnapshot =
            await db
                .collection(STORAGE_COLLECTION)
                .doc(eventId)
                .get();


        if (!documentSnapshot.exists) {

            displayEvent(null);

            return;
        }


        const event = {

            id:
                documentSnapshot.id,

            ...documentSnapshot.data()

        };


        displayEvent(event);


    } catch (error) {

        console.error(
            "Could not load event:",
            error
        );


        if (nameElement) {

            nameElement.textContent =
                "Error Loading Event";
        }


        if (descriptionElement) {

            descriptionElement.textContent =
                "Could not connect to the event database.";
        }

    }
}


// =====================================
// DELETE EVENT
// =====================================

if (deleteEventButton) {

    deleteEventButton.addEventListener(
        "click",
        async function () {

            if (!eventId) {

                alert(
                    "Event ID not found."
                );

                return;
            }


            const eventName =
                nameElement
                    ? nameElement.textContent
                    : "this event";


            const confirmed =
                window.confirm(
                    `Are you sure you want to delete "${eventName}"?`
                );


            if (!confirmed) {
                return;
            }


            // Disable button while deleting

            deleteEventButton.disabled =
                true;

            deleteEventButton.textContent =
                "Deleting...";


            try {

                await db
                    .collection(STORAGE_COLLECTION)
                    .doc(eventId)
                    .delete();


                alert(
                    "Event deleted successfully."
                );


                window.location.href =
                    "../index.html#events";


            } catch (error) {

                console.error(
                    "Could not delete event:",
                    error
                );


                alert(
                    "Could not delete the event. Please try again."
                );


                deleteEventButton.disabled =
                    false;

                deleteEventButton.textContent =
                    "🗑️ Delete Event";

            }

        }
    );
}


// =====================================
// START
// =====================================

loadEvent();