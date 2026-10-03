/*
====================================================
ADTU BODO UNION
EVENT DETAILS PAGE
====================================================

FEATURES:
- Load event from Firestore
- Admin Edit
- Admin Delete
- Admin photo upload
- Admin video upload
- Photo count
- Video count
- Display uploaded photos
- Display uploaded videos
- Photo lightbox
- QR code

FIRESTORE STRUCTURE:

events
  └── EVENT_ID
       ├── photos
       │    └── PHOTO_DOCUMENT
       └── videos
            └── VIDEO_DOCUMENT

FIREBASE STORAGE:

events/EVENT_ID/photos/filename
events/EVENT_ID/videos/filename
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

const eventPhotoInput =
    document.getElementById("eventPhotoInput");

const eventVideoInput =
    document.getElementById("eventVideoInput");

const uploadPhotosButton =
    document.getElementById("uploadPhotosButton");

const uploadVideosButton =
    document.getElementById("uploadVideosButton");

const photoUploadCount =
    document.getElementById("photoUploadCount");

const videoUploadCount =
    document.getElementById("videoUploadCount");

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


    // UPLOAD

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


    await loadPhotos();

    await loadVideos();

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
                .collection("events")
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


                image.addEventListener(
                    "error",
                    function () {

                        console.error(
                            "Photo failed:",
                            data.url
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
                .collection("events")
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


                video.setAttribute(
                    "controlsList",
                    "nodownload"
                );


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
// UPLOAD PHOTOS
// ==================================================

if (uploadPhotosButton) {

    uploadPhotosButton.addEventListener(
        "click",
        async function () {

            if (!isAdmin()) {

                showUploadStatus(
                    "You are not authorized.",
                    "error"
                );

                return;

            }


            const files =
                Array.from(
                    eventPhotoInput.files
                );


            if (files.length === 0) {

                showUploadStatus(
                    "Please select one or more photos.",
                    "error"
                );

                return;

            }


            uploadPhotosButton.disabled =
                true;


            uploadPhotosButton.textContent =
                "Uploading...";


            try {

                let uploaded =
                    0;


                for (
                    const file of files
                ) {

                    const safeName =
                        createSafeFileName(
                            file.name
                        );


                    const path =
                        "events/" +
                        eventId +
                        "/photos/" +
                        safeName;


                    const storageRef =
                        storage
                            .ref()
                            .child(path);


                    await storageRef.put(
                        file
                    );


                    const downloadURL =
                        await storageRef
                            .getDownloadURL();


                    await db
                        .collection("events")
                        .doc(eventId)
                        .collection("photos")
                        .add({

                            name:
                                file.name,

                            url:
                                downloadURL,

                            path:
                                path,

                            contentType:
                                file.type,

                            uploadedAt:
                                firebase.firestore
                                    .FieldValue
                                    .serverTimestamp()

                        });


                    uploaded++;


                    showUploadStatus(
                        `Uploaded ${uploaded} of ${files.length} photo(s)...`,
                        "loading"
                    );

                }


                showUploadStatus(
                    `✅ ${uploaded} photo(s) uploaded successfully.`,
                    "success"
                );


                eventPhotoInput.value =
                    "";


                await loadPhotos();


            } catch (error) {

                console.error(
                    "Photo upload error:",
                    error
                );


                showUploadStatus(
                    "❌ Photo upload failed: " +
                    (
                        error.message ||
                        "Unknown error"
                    ),
                    "error"
                );

            }


            uploadPhotosButton.disabled =
                false;


            uploadPhotosButton.textContent =
                "📷 Upload Photos";

        }
    );

}


// ==================================================
// UPLOAD VIDEOS
// ==================================================

if (uploadVideosButton) {

    uploadVideosButton.addEventListener(
        "click",
        async function () {

            if (!isAdmin()) {

                showUploadStatus(
                    "You are not authorized.",
                    "error"
                );

                return;

            }


            const files =
                Array.from(
                    eventVideoInput.files
                );


            if (files.length === 0) {

                showUploadStatus(
                    "Please select one or more videos.",
                    "error"
                );

                return;

            }


            uploadVideosButton.disabled =
                true;


            uploadVideosButton.textContent =
                "Uploading...";


            try {

                let uploaded =
                    0;


                for (
                    const file of files
                ) {

                    const safeName =
                        createSafeFileName(
                            file.name
                        );


                    const path =
                        "events/" +
                        eventId +
                        "/videos/" +
                        safeName;


                    const storageRef =
                        storage
                            .ref()
                            .child(path);


                    await storageRef.put(
                        file
                    );


                    const downloadURL =
                        await storageRef
                            .getDownloadURL();


                    await db
                        .collection("events")
                        .doc(eventId)
                        .collection("videos")
                        .add({

                            name:
                                file.name,

                            url:
                                downloadURL,

                            path:
                                path,

                            contentType:
                                file.type,

                            uploadedAt:
                                firebase.firestore
                                    .FieldValue
                                    .serverTimestamp()

                        });


                    uploaded++;


                    showUploadStatus(
                        `Uploaded ${uploaded} of ${files.length} video(s)...`,
                        "loading"
                    );

                }


                showUploadStatus(
                    `✅ ${uploaded} video(s) uploaded successfully.`,
                    "success"
                );


                eventVideoInput.value =
                    "";


                await loadVideos();


            } catch (error) {

                console.error(
                    "Video upload error:",
                    error
                );


                showUploadStatus(
                    "❌ Video upload failed: " +
                    (
                        error.message ||
                        "Unknown error"
                    ),
                    "error"
                );

            }


            uploadVideosButton.disabled =
                false;


            uploadVideosButton.textContent =
                "🎥 Upload Videos";

        }
    );

}


// ==================================================
// SAFE FILE NAME
// ==================================================

function createSafeFileName(
    originalName
) {

    const cleanName =
        originalName
            .replace(
                /[^a-zA-Z0-9._-]/g,
                "_"
            );


    return (
        Date.now() +
        "_" +
        Math.random()
            .toString(36)
            .substring(2, 8) +
        "_" +
        cleanName
    );

}


// ==================================================
// UPLOAD STATUS
// ==================================================

function showUploadStatus(
    message,
    type
) {

    if (!uploadStatus) {
        return;
    }


    uploadStatus.textContent =
        message;


    uploadStatus.className =
        "status-message " +
        type;

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
                // DELETE PHOTOS FROM STORAGE
                // --------------------------------

                await deleteStorageFolder(
                    eventId,
                    "photos"
                );


                // --------------------------------
                // DELETE VIDEOS FROM STORAGE
                // --------------------------------

                await deleteStorageFolder(
                    eventId,
                    "videos"
                );


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
// DELETE STORAGE FOLDER
// ==================================================

async function deleteStorageFolder(
    eventId,
    type
) {

    try {

        const folderRef =
            storage
                .ref()
                .child(
                    "events/" +
                    eventId +
                    "/" +
                    type
                );


        const result =
            await folderRef.listAll();


        for (
            const item of result.items
        ) {

            await item.delete();

        }

    } catch (error) {

        console.warn(
            "Storage cleanup warning:",
            error
        );

    }

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
            .collection("events")
            .doc(eventId)
            .collection(collectionName)
            .get();


    for (
        const doc of snapshot.docs
    ) {

        await doc.ref.delete();

    }

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
    "ADTU Bodo Union Event page starting..."
);

console.log(
    "Event ID:",
    eventId
);

loadEvent();
