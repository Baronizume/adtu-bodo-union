/*
====================================================
ADTU BODO UNION
EVENT DETAILS PAGE

DATABASE:
- MongoDB Atlas
- Express API
- Mongoose

MEDIA:
- Local project files
- No Firebase Storage
- No Google Drive API
- No Google OAuth
- No Google Drive Picker
====================================================
*/


// ==================================================
// CONFIGURATION
// ==================================================

const EVENTS_API = "/api/events";

const ADMIN_UID =
    "s7XAHabgLfc92ktoM0kBmdLXfAD3";

const DEFAULT_MEDIA_FOLDER =
    "rwnswndri";


// ==================================================
// LOCAL MEDIA
// ==================================================

const LOCAL_PHOTOS = [
    "photo1.jpg",
    "photo2.jpg",
    "photo3.jpg"
];

const LOCAL_VIDEOS = [
    // "video1.mp4",
    // "video2.mp4"
];


// ==================================================
// DOM ELEMENTS
// ==================================================

const nameElement =
    document.getElementById(
        "eventName"
    );

const descriptionElement =
    document.getElementById(
        "eventDescription"
    );

const yearElement =
    document.getElementById(
        "year"
    );

const deleteEventButton =
    document.getElementById(
        "deleteEventButton"
    );

const editEventButton =
    document.getElementById(
        "editEventButton"
    );

const adminUploadSection =
    document.getElementById(
        "adminUploadSection"
    );

const viewMediaButton =
    document.getElementById(
        "viewMediaButton"
    );

const eventGallery =
    document.getElementById(
        "eventGallery"
    );

const photoGallery =
    document.getElementById(
        "photoGallery"
    );

const videoGallery =
    document.getElementById(
        "videoGallery"
    );

const qrImage =
    document.getElementById(
        "eventQrImage"
    );

const qrButton =
    document.getElementById(
        "qrButton"
    );

const photoLightbox =
    document.getElementById(
        "photoLightbox"
    );

const lightboxImage =
    document.getElementById(
        "lightboxImage"
    );

const lightboxClose =
    document.getElementById(
        "lightboxClose"
    );


// ==================================================
// URL / EVENT ID
// ==================================================

const urlParams =
    new URLSearchParams(
        window.location.search
    );

const eventId =
    urlParams.get("id");


// ==================================================
// CURRENT EVENT
// ==================================================

let currentEvent = null;


// ==================================================
// FOOTER YEAR
// ==================================================

if (yearElement) {

    yearElement.textContent =
        new Date().getFullYear();

}


// ==================================================
// ADMIN CHECK
// ==================================================

function isAdmin() {

    if (
        typeof auth === "undefined"
    ) {

        return false;

    }

    const user =
        auth.currentUser;

    return (
        user &&
        user.uid === ADMIN_UID
    );

}


// ==================================================
// ADMIN CONTROLS
// ==================================================

function updateAdminControls() {

    const admin =
        isAdmin();

    if (deleteEventButton) {

        deleteEventButton.style.display =
            admin
                ? "inline-block"
                : "none";

    }

    if (editEventButton) {

        editEventButton.style.display =
            admin
                ? "inline-block"
                : "none";

    }

    /*
    Old upload section is disabled.
    */

    if (adminUploadSection) {

        adminUploadSection.remove();

    }

}


// ==================================================
// FIREBASE AUTH
// ==================================================

if (
    typeof auth !== "undefined" &&
    auth.onAuthStateChanged
) {

    auth.onAuthStateChanged(
        function (user) {

            console.log(
                "Authentication:",
                user
                    ? user.email
                    : "Not logged in"
            );

            updateAdminControls();

        }
    );

}


// ==================================================
// FORMAT DATE
// ==================================================

function formatDate(
    dateString
) {

    if (!dateString) {

        return "";

    }

    const date =
        new Date(
            dateString +
            "T00:00:00"
        );

    if (
        Number.isNaN(
            date.getTime()
        )
    ) {

        return dateString;

    }

    return date.toLocaleDateString(
        "en-IN",
        {
            day: "numeric",
            month: "long",
            year: "numeric"
        }
    );

}


// ==================================================
// MEDIA FOLDER
// ==================================================

function getMediaFolder(
    event
) {

    if (
        event &&
        typeof event.mediaFolder ===
        "string" &&
        event.mediaFolder.trim()
    ) {

        return event.mediaFolder
            .trim()
            .replace(
                /^\/+|\/+$/g,
                ""
            );

    }

    return DEFAULT_MEDIA_FOLDER;

}


// ==================================================
// CREATE LOCAL MEDIA URL
// ==================================================

function createMediaURL(
    mediaFolder,
    filename
) {

    const encodedFolder =
        mediaFolder
            .split("/")
            .map(
                function (part) {

                    return encodeURIComponent(
                        part
                    );

                }
            )
            .join("/");

    const encodedFilename =
        filename
            .split("/")
            .map(
                function (part) {

                    return encodeURIComponent(
                        part
                    );

                }
            )
            .join("/");

    return (
        "../media/" +
        encodedFolder +
        "/" +
        encodedFilename
    );

}


// ==================================================
// LOAD EVENT FROM MONGODB
// ==================================================

async function loadEvent() {

    if (!eventId) {

        showEventError(
            "Event ID is missing."
        );

        return;

    }

    try {

        console.log(
            "Loading event:",
            eventId
        );

        const response =
            await fetch(
                `${EVENTS_API}/${encodeURIComponent(
                    eventId
                )}`
            );

        const result =
            await response.json();

        console.log(
            "Event API response:",
            result
        );

        if (
            !response.ok ||
            !result.success
        ) {

            showEventError(
                result.message ||
                "This event could not be found."
            );

            return;

        }

        currentEvent =
            result.data;

        displayEvent(
            currentEvent
        );

        loadEventMedia();

    } catch (error) {

        console.error(
            "Event loading error:",
            error
        );

        showEventError(
            "Could not load this event."
        );

    }

}


// ==================================================
// DISPLAY EVENT
// ==================================================

function displayEvent(
    event
) {

    if (nameElement) {

        nameElement.textContent =
            event.title ||
            event.name ||
            "Untitled Event";

    }

    if (descriptionElement) {

        let text =
            event.description ||
            "";

        const date =
            formatDate(
                event.date
            );

        const location =
            event.location ||
            "";

        if (date) {

            if (text) {

                text += " ";

            }

            text +=
                "Date: " +
                date;

        }

        if (location) {

            if (text) {

                text += " ";

            }

            text +=
                "Location: " +
                location;

        }

        descriptionElement.textContent =
            text;

    }

    updateAdminControls();


    // ==================================================
    // QR CODE
    // ==================================================

    const eventURL =
        window.location.href;

    const qrURL =
        "https://api.qrserver.com/v1/create-qr-code/" +
        "?size=300x300&data=" +
        encodeURIComponent(
            eventURL
        );

    if (qrImage) {

        qrImage.src =
            qrURL;

    }

    if (qrButton) {

        qrButton.href =
            eventURL;

    }

}

// ==================================================
// LOAD EVENT MEDIA
// ==================================================

async function loadEventMedia() {

    if (!eventId) {

        showEmptyMedia();

        return;

    }

    try {

        console.log(
            "Loading media for event:",
            eventId
        );


        const response =
            await fetch(
                `/api/media/event/${encodeURIComponent(eventId)}`
            );


        const result =
            await response.json();


        console.log(
            "Event media response:",
            result
        );


        if (
            !response.ok ||
            !result.success
        ) {

            throw new Error(
                result.message ||
                "Could not load event media."
            );

        }


        const photos =
            Array.isArray(result.photos)
                ? result.photos
                : [];


        const videos =
            Array.isArray(result.videos)
                ? result.videos
                : [];


        displayEventPhotos(photos);

        displayEventVideos(videos);


        updatePhotoCount(
            photos.length
        );


        updateVideoCount(
            videos.length
        );


    }
    catch (error) {

        console.error(
            "Event media loading error:",
            error
        );

        showEmptyMedia();

    }

}

// ==================================================
// CHECK PHOTO
// ==================================================

function isPhoto(
    filename
) {

    const lower =
        filename.toLowerCase();

    return (
        lower.endsWith(".jpg") ||
        lower.endsWith(".jpeg") ||
        lower.endsWith(".png") ||
        lower.endsWith(".webp") ||
        lower.endsWith(".gif")
    );

}


// ==================================================
// CHECK VIDEO
// ==================================================

function isVideo(
    filename
) {

    const lower =
        filename.toLowerCase();

    return (
        lower.endsWith(".mp4") ||
        lower.endsWith(".webm") ||
        lower.endsWith(".mov") ||
        lower.endsWith(".m4v")
    );

}

// ==================================================
// DISPLAY EVENT PHOTOS
// ==================================================

function displayEventPhotos(photos) {

    const gallery =
        document.getElementById(
            "photoGallery"
        );

    if (!gallery) {
        return;
    }


    gallery.innerHTML = "";


    if (
        !Array.isArray(photos) ||
        photos.length === 0
    ) {

        gallery.innerHTML = `
            <p class="empty-media">
                No photos available.
            </p>
        `;

        return;
    }


    photos.forEach(
        (photo, index) => {

            const image =
                document.createElement("img");


            image.src =
                photo.url;


            image.alt =
                photo.originalName ||
                `Event Photo ${index + 1}`;


            image.loading =
                "lazy";


            image.className =
                "event-photo";


            image.addEventListener(
                "click",
                () => {

                    openLightbox(
                        photo.url,
                        photo.originalName ||
                        `Event Photo ${index + 1}`
                    );

                }
            );


            gallery.appendChild(
                image
            );

        }
    );

}

// ==================================================
// DISPLAY EVENT VIDEOS
// ==================================================

function displayEventVideos(videos) {

    const gallery =
        document.getElementById(
            "videoGallery"
        );

    if (!gallery) {
        return;
    }


    gallery.innerHTML = "";


    if (
        !Array.isArray(videos) ||
        videos.length === 0
    ) {

        gallery.innerHTML = `
            <p class="empty-media">
                No videos available.
            </p>
        `;

        return;
    }


    videos.forEach(
        (video, index) => {

            const videoElement =
                document.createElement("video");


            videoElement.src =
                video.url;


            videoElement.controls =
                true;


            videoElement.preload =
                "metadata";


            videoElement.className =
                "event-video";


            videoElement.setAttribute(
                "playsinline",
                ""
            );


            videoElement.setAttribute(
                "title",
                video.originalName ||
                `Event Video ${index + 1}`
            );


            gallery.appendChild(
                videoElement
            );

        }
    );

}
// ==================================================
// EMPTY MEDIA
// ==================================================

function showEmptyMedia() {

    updatePhotoCount(0);

    updateVideoCount(0);

    if (photoGallery) {

        photoGallery.innerHTML = `
            <div class="media-empty">
                No photos available.
            </div>
        `;

    }

    if (videoGallery) {

        videoGallery.innerHTML = `
            <div class="media-empty">
                No videos available.
            </div>
        `;

    }

}


// ==================================================
// EVENT ERROR
// ==================================================

function showEventError(
    message
) {

    if (nameElement) {

        nameElement.textContent =
            "Event Not Found";

    }

    if (descriptionElement) {

        descriptionElement.textContent =
            message;

    }

    showEmptyMedia();

}


// ==================================================
// VIEW MEDIA
// ==================================================

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


// ==================================================
// EDIT EVENT
// ==================================================

if (editEventButton) {

    editEventButton.addEventListener(
        "click",
        function () {

            if (!isAdmin()) {

                alert(
                    "You are not authorized."
                );

                return;

            }

            if (!eventId) {

                return;

            }

            window.location.href =
                "admin.html?edit=" +
                encodeURIComponent(
                    eventId
                );

        }
    );

}


// ==================================================
// DELETE EVENT
// ==================================================

if (deleteEventButton) {

    deleteEventButton.addEventListener(
        "click",
        async function () {

            if (!isAdmin()) {

                alert(
                    "You are not authorized."
                );

                return;

            }

            if (!eventId) {

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

                const response =
                    await fetch(
                        `${EVENTS_API}/${encodeURIComponent(
                            eventId
                        )}`,
                        {
                            method: "DELETE"
                        }
                    );

                const result =
                    await response.json();

                if (
                    !response.ok ||
                    !result.success
                ) {

                    throw new Error(
                        result.message ||
                        "Could not delete the event."
                    );

                }

                alert(
                    "Event deleted successfully."
                );

                window.location.href =
                    "../index.html#events";

            } catch (error) {

                console.error(
                    "Delete error:",
                    error
                );

                alert(
                    "Could not delete the event: " +
                    (
                        error.message ||
                        "Unknown error"
                    )
                );

                deleteEventButton.disabled =
                    false;

                deleteEventButton.textContent =
                    "🗑️ Delete Event";

            }

        }
    );

}


// ==================================================
// LIGHTBOX
// ==================================================

function openLightbox(
    imageURL,
    imageAlt
) {

    if (
        !photoLightbox ||
        !lightboxImage
    ) {

        return;

    }

    lightboxImage.src =
        imageURL;

    lightboxImage.alt =
        imageAlt ||
        "Event photo";

    photoLightbox.classList.add(
        "active"
    );

    document.body.style.overflow =
        "hidden";

}


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


// ==================================================
// START
// ==================================================

console.log(
    "======================================"
);

console.log(
    "ADTU Bodo Union Event Page"
);

console.log(
    "MongoDB API MODE"
);

console.log(
    "Firebase Storage: DISABLED"
);

console.log(
    "Google Drive: DISABLED"
);

console.log(
    "Google OAuth: DISABLED"
);

console.log(
    "Event ID:",
    eventId
);

console.log(
    "======================================"
);


// ==================================================
// LOAD EVENT
// ==================================================

loadEvent();