/*
ADTU BODO UNION
EVENT DETAILS PAGE
--------------------------------
Events are loaded from Cloud Firestore.

Media is stored in the repository:

media/
    rwnswndri-dance/
        photos/
        videos/
*/

const STORAGE_COLLECTION = "events";

// =====================================
// DOM ELEMENTS
// =====================================

const nameElement =
    document.getElementById("eventName");

const descriptionElement =
    document.getElementById("eventDescription");

const viewMediaButton =
    document.getElementById("viewMediaButton");

const qrButton =
    document.getElementById("qrButton");

const qrImage =
    document.getElementById("eventQrImage");

const yearElement =
    document.getElementById("year");

const deleteEventButton =
    document.getElementById("deleteEventButton");

const eventGallery =
    document.getElementById("eventGallery");

const photoGallery =
    document.getElementById("photoGallery");

const videoGallery =
    document.getElementById("videoGallery");

const photoLightbox =
    document.getElementById("photoLightbox");

const lightboxImage =
    document.getElementById("lightboxImage");

const lightboxClose =
    document.getElementById("lightboxClose");


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
// EVENT MEDIA
// =====================================

const EVENT_MEDIA = {

    "rwnswndri-dance": {

        photos: [
            "DSC_0049.JPG",
            "DSC_0050.JPG",
            "DSC_0057.JPG",
            "DSC_0058.JPG",
            "DSC_0059.JPG",
            "DSC_0060.JPG"
        ],

        videos: [
            "WhatsApp Video 2026-09-30 at 10.14.53PM (1) (1).mp4"
        ]

    }

};


// =====================================
// FIND MEDIA FOLDER
// =====================================

function getMediaFolder(event) {

    const name =
        event.name || "";

    return name
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");
}


// =====================================
// CREATE GITHUB PAGES MEDIA URL
// =====================================

function getMediaUrl(
    mediaFolder,
    type,
    fileName
) {

    /*
        GitHub Pages site:

        https://baronizume.github.io/adtu-bodo-union/

        Media:

        https://baronizume.github.io/adtu-bodo-union/media/

        encodeURIComponent() is used because
        the video filename contains spaces and brackets.
    */

    return (
        "/adtu-bodo-union/media/" +
        encodeURIComponent(mediaFolder) +
        "/" +
        encodeURIComponent(type) +
        "/" +
        encodeURIComponent(fileName)
    );
}


// =====================================
// LOAD EVENT MEDIA
// =====================================

function loadEventMedia(event) {

    if (!eventGallery) {
        return;
    }

    const mediaFolder =
        getMediaFolder(event);

    const media =
        EVENT_MEDIA[mediaFolder];

    if (!media) {

        eventGallery.style.display =
            "none";

        return;
    }

    eventGallery.style.display =
        "";


    // =================================
    // PHOTOS
    // =================================

    if (photoGallery) {

        photoGallery.innerHTML = "";

        if (
            !media.photos ||
            media.photos.length === 0
        ) {

            photoGallery.innerHTML = `
                <div class="media-empty">
                    No photos available for this event.
                </div>
            `;

        } else {

            media.photos.forEach(
                function (fileName) {

                    const image =
                        document.createElement("img");

                    const imageUrl =
                        getMediaUrl(
                            mediaFolder,
                            "photos",
                            fileName
                        );

                    image.src =
                        imageUrl;

                    image.alt =
                        (event.name || "Event") +
                        " photo";

                    image.loading =
                        "lazy";

                    image.addEventListener(
                        "click",
                        function () {

                            openLightbox(
                                imageUrl,
                                image.alt
                            );

                        }
                    );

                    image.addEventListener(
                        "error",
                        function () {

                            console.error(
                                "IMAGE 404:",
                                imageUrl
                            );

                            image.style.display =
                                "none";

                        }
                    );

                    photoGallery.appendChild(
                        image
                    );

                }
            );

        }

    }


    // =================================
    // VIDEOS
    // =================================

    if (videoGallery) {

        videoGallery.innerHTML = "";

        if (
            !media.videos ||
            media.videos.length === 0
        ) {

            videoGallery.innerHTML = `
                <div class="media-empty">
                    No videos available for this event.
                </div>
            `;

        } else {

            media.videos.forEach(
                function (fileName) {

                    const video =
                        document.createElement("video");

                    video.controls =
                        true;

                    video.preload =
                        "metadata";

                    video.playsInline =
                        true;

                    video.setAttribute(
                        "controlsList",
                        "nodownload"
                    );

                    const source =
                        document.createElement("source");

                    const videoUrl =
                        getMediaUrl(
                            mediaFolder,
                            "videos",
                            fileName
                        );

                    source.src =
                        videoUrl;

                    source.type =
                        "video/mp4";

                    video.appendChild(
                        source
                    );

                    video.addEventListener(
                        "error",
                        function () {

                            console.error(
                                "VIDEO 404:",
                                videoUrl
                            );

                        }
                    );

                    videoGallery.appendChild(
                        video
                    );

                }
            );

        }

    }

}


// =====================================
// PHOTO LIGHTBOX
// =====================================

function openLightbox(
    imageSource,
    imageAlt
) {

    if (
        !photoLightbox ||
        !lightboxImage
    ) {
        return;
    }

    lightboxImage.src =
        imageSource;

    lightboxImage.alt =
        imageAlt ||
        "Event photo";

    photoLightbox.classList.add(
        "active"
    );

    document.body.style.overflow =
        "hidden";
}


// =====================================
// CLOSE LIGHTBOX
// =====================================

function closeLightbox() {

    if (!photoLightbox) {
        return;
    }

    photoLightbox.classList.remove(
        "active"
    );

    if (lightboxImage) {

        lightboxImage.src =
            "";

    }

    document.body.style.overflow =
        "";
}


// =====================================
// LIGHTBOX EVENTS
// =====================================

if (lightboxClose) {

    lightboxClose.addEventListener(
        "click",
        closeLightbox
    );

}

if (photoLightbox) {

    photoLightbox.addEventListener(
        "click",
        function (event) {

            if (
                event.target ===
                photoLightbox
            ) {

                closeLightbox();

            }

        }
    );

}

document.addEventListener(
    "keydown",
    function (event) {

        if (
            event.key === "Escape"
        ) {

            closeLightbox();

        }

    }
);


// =====================================
// VIEW MEDIA BUTTON
// =====================================

if (viewMediaButton) {

    viewMediaButton.addEventListener(
        "click",
        function () {

            if (!eventGallery) {
                return;
            }

            eventGallery.scrollIntoView({
                behavior: "smooth",
                block: "start"
            });

        }
    );

}


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

        if (viewMediaButton) {
            viewMediaButton.style.display =
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

        if (eventGallery) {
            eventGallery.style.display =
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
                event.date +
                "T00:00:00"
            );

        if (
            !isNaN(
                eventDate.getTime()
            )
        ) {

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
    // LOAD MEDIA
    // =================================

    loadEventMedia(event);


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
    // QR BUTTON
    // =================================

    if (qrButton) {

        qrButton.href =
            eventURL;

        qrButton.target =
            "_blank";

        qrButton.rel =
            "noopener noreferrer";

        qrButton.style.display =
            "";

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
                .collection(
                    STORAGE_COLLECTION
                )
                .doc(eventId)
                .get();

        if (
            !documentSnapshot.exists
        ) {

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

            deleteEventButton.disabled =
                true;

            deleteEventButton.textContent =
                "Deleting...";

            try {

                await db
                    .collection(
                        STORAGE_COLLECTION
                    )
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