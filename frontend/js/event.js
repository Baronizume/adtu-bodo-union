/*
====================================================
ADTU BODO UNION
EVENT DETAILS PAGE
====================================================

FEATURES:
- Load event from Firestore
- Admin Edit
- Admin Delete
- Google Drive Photos folder
- Google Drive Videos folder
- Display event photos/videos from Firestore
- Photo count
- Video count
- Photo lightbox
- QR code

IMPORTANT:
- Firebase Storage is NOT used.
- Photos and videos are stored in Google Drive.
- Google Drive folder/file links are stored in Firestore.
*/


// ==================================================
// CONFIGURATION
// ==================================================

const EVENTS_COLLECTION = "events";

const ADMIN_UID =
    "s7XAHabgLfc92ktoM0kBmdLXfAD3";


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

const uploadStatus =
    document.getElementById("uploadStatus");

const viewMediaButton =
    document.getElementById("viewMediaButton");

const eventGallery =
    document.getElementById("eventGallery");

const photoGallery =
    document.getElementById("photoGallery");

const videoGallery =
    document.getElementById("videoGallery");

const photoUploadCount =
    document.getElementById("photoUploadCount");

const videoUploadCount =
    document.getElementById("videoUploadCount");

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
// GOOGLE DRIVE BUTTONS
// ==================================================

const adminPhotosDriveButton =
    document.getElementById(
        "adminPhotosDriveButton"
    );

const adminVideosDriveButton =
    document.getElementById(
        "adminVideosDriveButton"
    );


// ==================================================
// GET EVENT ID FROM URL
// ==================================================

const urlParams =
    new URLSearchParams(
        window.location.search
    );

const eventId =
    urlParams.get("id");


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

    const user =
        auth.currentUser;

    return (
        user &&
        user.uid === ADMIN_UID
    );

}


// ==================================================
// UPDATE ADMIN CONTROLS
// ==================================================

function updateAdminControls() {

    const admin =
        isAdmin();


    // DELETE

    if (deleteEventButton) {

        deleteEventButton.style.display =
            admin
                ? "inline-block"
                : "none";

    }


    // EDIT

    if (editEventButton) {

        editEventButton.style.display =
            admin
                ? "inline-block"
                : "none";

    }


    // GOOGLE DRIVE ADMIN AREA

    if (adminUploadSection) {

        adminUploadSection.style.display =
            admin
                ? "block"
                : "none";

    }

}


// ==================================================
// AUTH STATE
// ==================================================

auth.onAuthStateChanged(
    function (user) {

        console.log(
            "Authentication changed:",
            user
                ? user.email
                : "Not logged in"
        );

        updateAdminControls();

    }
);


// ==================================================
// FORMAT DATE
// ==================================================

function formatDate(dateString) {

    if (!dateString) {
        return "";
    }


    const date =
        new Date(
            dateString +
            "T00:00:00"
        );


    if (
        isNaN(
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

        console.log(
            "Loading event:",
            eventId
        );


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


        const event =
            eventDoc.data();


        console.log(
            "Event loaded:",
            event
        );


        displayEvent(
            event
        );


        await loadAllMedia();

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

function displayEvent(event) {

    if (nameElement) {

        nameElement.textContent =
            event.name ||
            "Untitled Event";

    }


    if (descriptionElement) {

        let text =
            event.description ||
            "";


        const formattedDate =
            formatDate(
                event.date
            );


        if (formattedDate) {

            if (text) {
                text += " ";
            }

            text +=
                "Date: " +
                formattedDate;

        }


        descriptionElement.textContent =
            text;

    }


    updateAdminControls();


    // ==================================================
    // GOOGLE DRIVE FOLDERS
    // ==================================================

    if (
        adminPhotosDriveButton &&
        event.photosDriveUrl
    ) {

        adminPhotosDriveButton.href =
            event.photosDriveUrl;

    }


    if (
        adminVideosDriveButton &&
        event.videosDriveUrl
    ) {

        adminVideosDriveButton.href =
            event.videosDriveUrl;

    }


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
// EVENT ERROR
// ==================================================

function showEventError(message) {

    if (nameElement) {

        nameElement.textContent =
            "Event Not Found";

    }


    if (descriptionElement) {

        descriptionElement.textContent =
            message;

    }


    if (eventGallery) {

        eventGallery.style.display =
            "none";

    }


    if (adminUploadSection) {

        adminUploadSection.style.display =
            "none";

    }


    if (editEventButton) {

        editEventButton.style.display =
            "none";

    }


    if (deleteEventButton) {

        deleteEventButton.style.display =
            "none";

    }

}


// ==================================================
// LOAD ALL MEDIA
// ==================================================

async function loadAllMedia() {

    if (!eventId) {
        return;
    }


    if (eventGallery) {

        eventGallery.style.display =
            "block";

    }


    await Promise.all([
        loadPhotos(),
        loadVideos()
    ]);

}


// ==================================================
// LOAD PHOTOS
// ==================================================

async function loadPhotos() {

    if (!photoGallery) {
        return;
    }


    photoGallery.innerHTML = `
        <p class="loading">
            Loading photos...
        </p>
    `;


    try {

        const snapshot =
            await db
                .collection(
                    EVENTS_COLLECTION
                )
                .doc(eventId)
                .collection("photos")
                .get();


        photoGallery.innerHTML =
            "";


        const count =
            snapshot.size;


        if (photoUploadCount) {

            photoUploadCount.textContent =
                "📷 Photos: " +
                count;

        }


        if (snapshot.empty) {

            photoGallery.innerHTML = `
                <div class="media-empty">
                    No photos uploaded for this event.
                </div>
            `;

            return;

        }


        snapshot.forEach(
            function (doc) {

                const data =
                    doc.data();


                if (!data.url) {
                    return;
                }


                const image =
                    document.createElement(
                        "img"
                    );


                image.src =
                    data.url;


                image.alt =
                    data.name ||
                    "Event photo";


                image.loading =
                    "lazy";


                image.decoding =
                    "async";


                image.className =
                    "event-gallery-image";


                image.addEventListener(
                    "click",
                    function () {

                        openLightbox(
                            data.url,
                            data.name
                        );

                    }
                );


                photoGallery.appendChild(
                    image
                );

            }
        );


    } catch (error) {

        console.error(
            "Photo loading error:",
            error
        );


        if (photoUploadCount) {

            photoUploadCount.textContent =
                "📷 Photos: Error";

        }


        photoGallery.innerHTML = `
            <div class="media-empty">
                Could not load photos.
            </div>
        `;

    }

}


// ==================================================
// LOAD VIDEOS
// ==================================================

async function loadVideos() {

    if (!videoGallery) {
        return;
    }


    videoGallery.innerHTML = `
        <p class="loading">
            Loading videos...
        </p>
    `;


    try {

        const snapshot =
            await db
                .collection(
                    EVENTS_COLLECTION
                )
                .doc(eventId)
                .collection("videos")
                .get();


        videoGallery.innerHTML =
            "";


        const count =
            snapshot.size;


        if (videoUploadCount) {

            videoUploadCount.textContent =
                "🎥 Videos: " +
                count;

        }


        if (snapshot.empty) {

            videoGallery.innerHTML = `
                <div class="media-empty">
                    No videos uploaded for this event.
                </div>
            `;

            return;

        }


        snapshot.forEach(
            function (doc) {

                const data =
                    doc.data();


                if (!data.url) {
                    return;
                }


                const video =
                    document.createElement(
                        "video"
                    );


                video.controls =
                    true;


                video.preload =
                    "metadata";


                video.playsInline =
                    true;


                video.className =
                    "event-gallery-video";


                const source =
                    document.createElement(
                        "source"
                    );


                source.src =
                    data.url;


                source.type =
                    data.contentType ||
                    "video/mp4";


                video.appendChild(
                    source
                );


                videoGallery.appendChild(
                    video
                );

            }
        );


    } catch (error) {

        console.error(
            "Video loading error:",
            error
        );


        if (videoUploadCount) {

            videoUploadCount.textContent =
                "🎥 Videos: Error";

        }


        videoGallery.innerHTML = `
            <div class="media-empty">
                Could not load videos.
            </div>
        `;

    }

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
                    "You are not authorized to edit events."
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
                    "You are not authorized to delete events."
                );

                return;

            }


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

                // --------------------------------
                // DELETE PHOTO DOCUMENTS
                // --------------------------------

                await deleteSubcollection(
                    eventId,
                    "photos"
                );


                // --------------------------------
                // DELETE VIDEO DOCUMENTS
                // --------------------------------

                await deleteSubcollection(
                    eventId,
                    "videos"
                );


                // --------------------------------
                // DELETE EVENT
                // --------------------------------

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
// DELETE FIRESTORE SUBCOLLECTION
// ==================================================

async function deleteSubcollection(
    eventId,
    collectionName
) {

    const snapshot =
        await db
            .collection(
                EVENTS_COLLECTION
            )
            .doc(eventId)
            .collection(
                collectionName
            )
            .get();


    await Promise.all(
        snapshot.docs.map(
            function (doc) {

                return doc.ref.delete();

            }
        )
    );

}


// ==================================================
// VIEW MEDIA BUTTON
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
// LIGHTBOX OPEN
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


// ==================================================
// LIGHTBOX CLOSE
// ==================================================

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


// ==================================================
// LIGHTBOX CLOSE BUTTON
// ==================================================

if (lightboxClose) {

    lightboxClose.addEventListener(
        "click",
        closeLightbox
    );

}


// ==================================================
// LIGHTBOX BACKGROUND
// ==================================================

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


// ==================================================
// ESC KEY
// ==================================================

document.addEventListener(
    "keydown",
    function (event) {

        if (
            event.key ===
            "Escape"
        ) {

            closeLightbox();

        }

    }
);


// ==================================================
// START APPLICATION
// ==================================================

console.log(
    "======================================"
);

console.log(
    "ADTU Bodo Union Event page starting..."
);

console.log(
    "Firebase Storage: DISABLED"
);

console.log(
    "Google Drive media system enabled."
);

console.log(
    "Event ID:",
    eventId
);

console.log(
    "======================================"
);


loadEvent();
