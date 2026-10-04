/*
====================================================
ADTU BODO UNION
EVENT DETAILS PAGE

MEDIA SYSTEM:
- Local project files only
- No Firebase Storage
- No Google Drive API
- No Google OAuth
- No Google Drive Picker

Media location:
frontend/media/rwnswndri/

IMPORTANT:
Add your image filenames inside LOCAL_PHOTOS below.
====================================================
*/


// ==================================================
// CONFIGURATION
// ==================================================

const EVENTS_COLLECTION = "events";

const ADMIN_UID = "s7XAHabgLfc92ktoM0kBmdLXfAD3";


// ==================================================
// LOCAL MEDIA
// ==================================================

const DEFAULT_MEDIA_FOLDER = "rwnswndri";

/*
====================================================
ADD YOUR JPG FILES HERE

Example folder:

frontend/media/rwnswndri/
    photo1.jpg
    photo2.jpg
    photo3.jpg

Then write:

const LOCAL_PHOTOS = [
    "photo1.jpg",
    "photo2.jpg",
    "photo3.jpg"
];

====================================================
*/

const LOCAL_PHOTOS = [
    "photo1.jpg",
    "photo2.jpg",
    "photo3.jpg"
];


/*
====================================================
OPTIONAL VIDEOS

If you have videos, add them here.

Example:

const LOCAL_VIDEOS = [
    "video1.mp4",
    "video2.mp4"
];

If you don't have videos, leave it empty.
====================================================
*/

const LOCAL_VIDEOS = [
];


// ==================================================
// DOM ELEMENTS
// ==================================================

const nameElement =
    document.getElementById("eventName");

const descriptionElement =
    document.getElementById("eventDescription");

const yearElement =
    document.getElementById("year");

const deleteEventButton =
    document.getElementById("deleteEventButton");

const editEventButton =
    document.getElementById("editEventButton");

const adminUploadSection =
    document.getElementById("adminUploadSection");

const viewMediaButton =
    document.getElementById("viewMediaButton");

const eventGallery =
    document.getElementById("eventGallery");

const photoGallery =
    document.getElementById("photoGallery");

const videoGallery =
    document.getElementById("videoGallery");

const qrImage =
    document.getElementById("eventQrImage");

const qrButton =
    document.getElementById("qrButton");

const photoLightbox =
    document.getElementById("photoLightbox");

const lightboxImage =
    document.getElementById("lightboxImage");

const lightboxClose =
    document.getElementById("lightboxClose");


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
    Local project media is used.

    No upload through Google Drive
    or Firebase Storage.
    */

    if (adminUploadSection) {

        adminUploadSection.style.display =
            "none";

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

function formatDate(dateString) {

    if (!dateString) {
        return "";
    }

    const date =
        new Date(
            dateString + "T00:00:00"
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
// GET MEDIA FOLDER
// ==================================================

function getMediaFolder(event) {

    /*
    Optional Firestore field:

        mediaFolder: "rwnswndri"

    If it doesn't exist,
    rwnswndri is used.
    */

    const folder =
        event &&
        event.mediaFolder;

    if (
        typeof folder === "string" &&
        folder.trim()
    ) {

        return folder
            .trim()
            .replace(/^\/+|\/+$/g, "");

    }

    return DEFAULT_MEDIA_FOLDER;

}


// ==================================================
// CREATE MEDIA URL
// ==================================================

function createMediaURL(
    mediaFolder,
    filename
) {

    return (
        "../media/" +
        encodeURIComponent(
            mediaFolder
        ) +
        "/" +
        filename
            .split("/")
            .map(
                part =>
                    encodeURIComponent(part)
            )
            .join("/")
    );

}


// ==================================================
// LOAD EVENT
// ==================================================

async function loadEvent() {

    if (!eventId) {

        showEventError(
            "Event ID is missing."
        );

        return;

    }

    try {

        /*
        Firebase is used ONLY for event information.

        Media is loaded directly from the
        local project folder.
        */

        if (
            typeof db === "undefined"
        ) {

            throw new Error(
                "Firebase Firestore is not initialized."
            );

        }

        const eventDoc =
            await db
                .collection(
                    EVENTS_COLLECTION
                )
                .doc(eventId)
                .get();

        if (!eventDoc.exists) {

            showEventError(
                "This event could not be found."
            );

            return;

        }

        currentEvent =
            eventDoc.data();

        displayEvent(
            currentEvent
        );

        await loadLocalMedia(
            currentEvent
        );

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

        if (date) {

            if (text) {
                text += " ";
            }

            text +=
                "Date: " +
                date;

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
// LOAD LOCAL MEDIA
// ==================================================

async function loadLocalMedia(
    event
) {

    const mediaFolder =
        getMediaFolder(
            event
        );

    console.log(
        "Loading local media folder:",
        mediaFolder
    );


    // ================================================
    // PHOTOS
    // ================================================

    const photos =
        LOCAL_PHOTOS
            .map(
                function (filename) {

                    return {
                        name: filename,
                        type: "photo"
                    };

                }
            )
            .filter(
                function (file) {

                    return (
                        file.name &&
                        isPhoto(file.name)
                    );

                }
            );


    // ================================================
    // VIDEOS
    // ================================================

    const videos =
        LOCAL_VIDEOS
            .map(
                function (filename) {

                    return {
                        name: filename,
                        type: "video"
                    };

                }
            )
            .filter(
                function (file) {

                    return (
                        file.name &&
                        isVideo(file.name)
                    );

                }
            );


    displayLocalPhotos(
        photos,
        mediaFolder
    );

    displayLocalVideos(
        videos,
        mediaFolder
    );

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
// DISPLAY LOCAL PHOTOS
// ==================================================

function displayLocalPhotos(
    photos,
    mediaFolder
) {

    updatePhotoCount(
        photos.length
    );

    if (!photoGallery) {
        return;
    }

    photoGallery.innerHTML =
        "";

    if (
        photos.length === 0
    ) {

        photoGallery.innerHTML = `
            <div class="media-empty">
                No photos uploaded yet.
            </div>
        `;

        return;

    }


    photos.forEach(
        function (file) {

            const image =
                document.createElement(
                    "img"
                );

            image.className =
                "event-gallery-image";

            image.loading =
                "lazy";

            image.alt =
                file.name ||
                "Event photo";


            const imageURL =
                createMediaURL(
                    mediaFolder,
                    file.name
                );


            image.src =
                imageURL;


            image.addEventListener(
                "error",
                function () {

                    console.warn(
                        "Could not load image:",
                        imageURL
                    );

                    image.style.display =
                        "none";

                }
            );


            image.addEventListener(
                "click",
                function () {

                    openLightbox(
                        imageURL,
                        file.name
                    );

                }
            );


            photoGallery.appendChild(
                image
            );

        }
    );

}


// ==================================================
// DISPLAY LOCAL VIDEOS
// ==================================================

function displayLocalVideos(
    videos,
    mediaFolder
) {

    updateVideoCount(
        videos.length
    );

    if (!videoGallery) {
        return;
    }

    videoGallery.innerHTML =
        "";

    if (
        videos.length === 0
    ) {

        videoGallery.innerHTML = `
            <div class="media-empty">
                No videos uploaded yet.
            </div>
        `;

        return;

    }


    videos.forEach(
        function (file) {

            const wrapper =
                document.createElement(
                    "div"
                );

            wrapper.className =
                "drive-video-item";


            const video =
                document.createElement(
                    "video"
                );

            video.className =
                "event-gallery-video";

            video.controls =
                true;

            video.preload =
                "metadata";

            video.playsInline =
                true;

            video.src =
                createMediaURL(
                    mediaFolder,
                    file.name
                );


            const title =
                document.createElement(
                    "p"
                );

            title.className =
                "video-file-name";

            title.textContent =
                file.name;


            wrapper.appendChild(
                video
            );

            wrapper.appendChild(
                title
            );

            videoGallery.appendChild(
                wrapper
            );

        }
    );

}


// ==================================================
// COUNTS
// ==================================================

function updatePhotoCount(
    count
) {

    const elements =
        document.querySelectorAll(
            "#photoUploadCount, #photoCount"
        );

    elements.forEach(
        function (element) {

            element.textContent =
                "📷 Photos: " +
                count;

        }
    );

}


function updateVideoCount(
    count
) {

    const elements =
        document.querySelectorAll(
            "#videoUploadCount, #videoCount"
        );

    elements.forEach(
        function (element) {

            element.textContent =
                "🎥 Videos: " +
                count;

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
                No photos uploaded yet.
            </div>
        `;

    }

    if (videoGallery) {

        videoGallery.innerHTML = `
            <div class="media-empty">
                No videos uploaded yet.
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

                await db
                    .collection(
                        EVENTS_COLLECTION
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
    "Local JPG/media enabled"
);

console.log(
    "Firebase Storage disabled"
);

console.log(
    "Google Drive API disabled"
);

console.log(
    "Google OAuth disabled"
);

console.log(
    "Event ID:",
    eventId
);

console.log(
    "======================================"
);


loadEvent();
