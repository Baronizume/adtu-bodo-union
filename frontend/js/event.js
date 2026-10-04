/*
====================================================
ADTU BODO UNION
EVENT DETAILS PAGE
====================================================

GOOGLE DRIVE MEDIA VERSION

FEATURES:
- Load event from Firestore
- Admin Edit
- Admin Delete
- Google Drive folder
- Google Drive photo upload
- Google Drive video upload
- Photo count
- Video count
- Drive media refresh
- QR code
- Upload progress

IMPORTANT:
NO FIREBASE STORAGE IS USED.

FIREBASE IS ONLY USED FOR:
- Authentication
- Firestore event information
- Firestore Google Drive folder information
*/


// ==================================================
// CONFIGURATION
// ==================================================

const EVENTS_COLLECTION = "events";

const ADMIN_UID =
    "s7XAHabgLfc92ktoM0kBmdLXfAD3";


// Google OAuth Client ID

const GOOGLE_CLIENT_ID =
    "673474044129-9oba76ni9d0pekku5lc85vn2p89144j5.apps.googleusercontent.com";


// Google Cloud project number

const GOOGLE_APP_ID =
    "673474044129";


// IMPORTANT:
// Use drive.file so the website can create/manage
// files that the user gives the app access to.

const GOOGLE_DRIVE_SCOPE =
    "https://www.googleapis.com/auth/drive.file";


// Maximum file sizes

const MAX_PHOTO_SIZE =
    20 * 1024 * 1024; // 20 MB

const MAX_VIDEO_SIZE =
    500 * 1024 * 1024; // 500 MB


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
// CREATE DRIVE UI IF NOT PRESENT
// ==================================================

function createDriveUI() {

    if (!adminUploadSection) {
        return;
    }


    if (
        document.getElementById(
            "googleDriveMediaControls"
        )
    ) {
        return;
    }


    const container =
        document.createElement("div");


    container.id =
        "googleDriveMediaControls";


    container.style.marginTop =
        "20px";


    container.innerHTML = `

        <div class="upload-controls">

            <button
                id="selectDriveFolderButton"
                type="button"
                class="button button-primary"
            >
                📁 Select Google Drive Folder
            </button>

        </div>


        <div
            id="selectedDriveFolder"
            style="margin-top:10px;"
        ></div>


        <div class="upload-controls">

            <button
                id="openDriveFolderButton"
                type="button"
                class="button button-primary"
                style="display:none;"
            >
                📂 Open Google Drive Folder
            </button>

        </div>

    `;


    adminUploadSection.appendChild(
        container
    );


    const selectButton =
        document.getElementById(
            "selectDriveFolderButton"
        );


    const openButton =
        document.getElementById(
            "openDriveFolderButton"
        );


    if (selectButton) {

        selectButton.addEventListener(
            "click",
            function () {

                selectGoogleDriveFolder();

            }
        );

    }


    if (openButton) {

        openButton.addEventListener(
            "click",
            function () {

                const url =
                    openButton.dataset.url;


                if (url) {

                    window.open(
                        url,
                        "_blank",
                        "noopener,noreferrer"
                    );

                }

            }
        );

    }

}


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
// GOOGLE DRIVE VARIABLES
// ==================================================

let googleAccessToken =
    null;

let googleTokenClient =
    null;

let pickerLoaded =
    false;

let gisLoaded =
    false;


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


    if (adminUploadSection) {

        adminUploadSection.style.display =
            admin
                ? "block"
                : "none";

    }


    if (admin) {

        createDriveUI();

    }

}


// ==================================================
// FIREBASE AUTH
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
// GOOGLE API LOADING
// ==================================================

function loadGoogleApis() {

    if (
        typeof gapi !== "undefined"
    ) {

        gapi.load(
            "picker",
            function () {

                pickerLoaded =
                    true;

                console.log(
                    "Google Picker loaded."
                );

            }
        );

    }


    if (
        typeof google !== "undefined" &&
        google.accounts &&
        google.accounts.oauth2
    ) {

        initializeGoogleOAuth();

    }

}


// ==================================================
// INITIALIZE GOOGLE OAUTH
// ==================================================

function initializeGoogleOAuth() {

    if (gisLoaded) {
        return;
    }


    if (
        typeof google === "undefined" ||
        !google.accounts ||
        !google.accounts.oauth2
    ) {

        console.warn(
            "Google Identity Services not loaded yet."
        );

        return;

    }


    googleTokenClient =
        google.accounts.oauth2.initTokenClient({

            client_id:
                GOOGLE_CLIENT_ID,

            scope:
                GOOGLE_DRIVE_SCOPE,

            callback:
                function (response) {

                    if (
                        response.error
                    ) {

                        console.error(
                            "Google OAuth error:",
                            response
                        );


                        showUploadStatus(
                            "Google Drive authorization failed.",
                            "error"
                        );


                        return;

                    }


                    googleAccessToken =
                        response.access_token;


                    console.log(
                        "Google Drive access granted."
                    );


                    if (
                        window.pendingDriveAction
                    ) {

                        const action =
                            window.pendingDriveAction;


                        window.pendingDriveAction =
                            null;


                        action();

                    }

                }

        });


    gisLoaded =
        true;

}


// ==================================================
// GET GOOGLE DRIVE ACCESS
// ==================================================

function requestGoogleDriveAccess(
    callback
) {

    if (!isAdmin()) {

        showUploadStatus(
            "You are not authorized.",
            "error"
        );

        return;

    }


    if (
        !googleTokenClient
    ) {

        initializeGoogleOAuth();

    }


    if (
        !googleTokenClient
    ) {

        showUploadStatus(
            "Google services are still loading. Please try again.",
            "error"
        );

        return;

    }


    window.pendingDriveAction =
        callback;


    if (googleAccessToken) {

        callback();

        return;

    }


    googleTokenClient.requestAccessToken({
        prompt: "consent"
    });

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


        await loadDriveMedia(
            event
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


    // QR CODE

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
// LOAD DRIVE MEDIA
// ==================================================

async function loadDriveMedia(
    event
) {

    createDriveUI();


    const driveFolderId =
        event.driveFolderId ||
        "";


    const driveFolderUrl =
        event.driveFolderUrl ||
        "";


    updateDriveFolderUI(
        driveFolderId,
        driveFolderUrl
    );


    if (!driveFolderId) {

        if (photoUploadCount) {

            photoUploadCount.textContent =
                "📷 Photos: 0";

        }


        if (videoUploadCount) {

            videoUploadCount.textContent =
                "🎥 Videos: 0";

        }


        showEmptyMedia();

        return;

    }


    await refreshDriveMedia(
        driveFolderId
    );

}


// ==================================================
// UPDATE DRIVE FOLDER UI
// ==================================================

function updateDriveFolderUI(
    folderId,
    folderUrl
) {

    const selected =
        document.getElementById(
            "selectedDriveFolder"
        );


    const openButton =
        document.getElementById(
            "openDriveFolderButton"
        );


    if (selected) {

        if (folderId) {

            selected.innerHTML = `
                <strong>📁 Drive Folder:</strong>
                ${folderId}
            `;

        } else {

            selected.innerHTML =
                "No Google Drive folder selected.";

        }

    }


    if (openButton) {

        if (folderUrl) {

            openButton.style.display =
                "inline-block";


            openButton.dataset.url =
                folderUrl;

        } else {

            openButton.style.display =
                "none";

        }

    }

}


// ==================================================
// SELECT DRIVE FOLDER
// ==================================================

function selectGoogleDriveFolder() {

    requestGoogleDriveAccess(
        function () {

            if (!pickerLoaded) {

                showUploadStatus(
                    "Google Picker is still loading. Please try again.",
                    "error"
                );

                return;

            }


            const view =
                new google.picker.DocsView(
                    google.picker.ViewId.FOLDERS
                );


            view.setIncludeFolders(
                true
            );


            view.setSelectFolderEnabled(
                true
            );


            const picker =
                new google.picker.PickerBuilder()

                    .setAppId(
                        GOOGLE_APP_ID
                    )

                    .setOAuthToken(
                        googleAccessToken
                    )

                    .addView(
                        view
                    )

                    .setCallback(
                        driveFolderPickerCallback
                    )

                    .build();


            picker.setVisible(
                true
            );

        }
    );

}


// ==================================================
// DRIVE FOLDER PICKER CALLBACK
// ==================================================

async function driveFolderPickerCallback(
    data
) {

    if (
        data.action !==
        google.picker.Action.PICKED
    ) {

        return;

    }


    const documents =
        data[
            google.picker.Response.DOCUMENTS
        ];


    if (
        !documents ||
        documents.length === 0
    ) {

        return;

    }


    const selected =
        documents[0];


    const folderId =
        selected[
            google.picker.Document.ID
        ];


    const folderName =
        selected[
            google.picker.Document.NAME
        ] ||
        "Google Drive Folder";


    if (!folderId) {

        return;

    }


    const folderUrl =
        "https://drive.google.com/drive/folders/" +
        folderId;


    try {

        await db
            .collection(
                EVENTS_COLLECTION
            )
            .doc(eventId)
            .update({

                driveFolderId:
                    folderId,

                driveFolderUrl:
                    folderUrl,

                driveFolderName:
                    folderName,

                mediaUpdatedAt:
                    firebase.firestore
                        .FieldValue
                        .serverTimestamp()

            });


        updateDriveFolderUI(
            folderId,
            folderUrl
        );


        showUploadStatus(
            "✅ Google Drive folder saved successfully.",
            "success"
        );


        await refreshDriveMedia(
            folderId
        );


    } catch (error) {

        console.error(
            "Saving Drive folder failed:",
            error
        );


        showUploadStatus(
            "Could not save the Drive folder: " +
            (
                error.message ||
                "Unknown error"
            ),
            "error"
        );

    }

}


// ==================================================
// LIST DRIVE FILES
// ==================================================

async function getDriveFiles(
    folderId
) {

    const query =
        `'${folderId}' in parents and trashed = false`;


    const url =
        "https://www.googleapis.com/drive/v3/files" +
        "?q=" +
        encodeURIComponent(
            query
        ) +
        "&pageSize=1000" +
        "&fields=" +
        encodeURIComponent(
            "files(id,name,mimeType,size,webViewLink,thumbnailLink)"
        );


    const response =
        await fetch(
            url,
            {
                method:
                    "GET",

                headers: {

                    Authorization:
                        "Bearer " +
                        googleAccessToken

                }

            }
        );


    if (!response.ok) {

        const text =
            await response.text();


        throw new Error(
            "Drive API error: " +
            response.status +
            " " +
            text
        );

    }


    const result =
        await response.json();


    return result.files ||
        [];

}


// ==================================================
// REFRESH DRIVE MEDIA
// ==================================================

async function refreshDriveMedia(
    folderId
) {

    if (!folderId) {

        showEmptyMedia();

        return;

    }


    if (photoGallery) {

        photoGallery.innerHTML = `
            <p class="loading">
                Loading Drive photos...
            </p>
        `;

    }


    if (videoGallery) {

        videoGallery.innerHTML = `
            <p class="loading">
                Loading Drive videos...
            </p>
        `;

    }


    requestGoogleDriveAccess(
        async function () {

            try {

                const files =
                    await getDriveFiles(
                        folderId
                    );


                const photos =
                    files.filter(
                        function (file) {

                            return (
                                file.mimeType &&
                                file.mimeType.startsWith(
                                    "image/"
                                )
                            );

                        }
                    );


                const videos =
                    files.filter(
                        function (file) {

                            return (
                                file.mimeType &&
                                file.mimeType.startsWith(
                                    "video/"
                                )
                            );

                        }
                    );


                displayDrivePhotos(
                    photos
                );


                displayDriveVideos(
                    videos
                );


            } catch (error) {

                console.error(
                    "Drive media loading error:",
                    error
                );


                if (photoGallery) {

                    photoGallery.innerHTML = `
                        <div class="media-empty">
                            Could not load Google Drive photos.
                        </div>
                    `;

                }


                if (videoGallery) {

                    videoGallery.innerHTML = `
                        <div class="media-empty">
                            Could not load Google Drive videos.
                        </div>
                    `;

                }


                if (photoUploadCount) {

                    photoUploadCount.textContent =
                        "📷 Photos: Error";

                }


                if (videoUploadCount) {

                    videoUploadCount.textContent =
                        "🎥 Videos: Error";

                }

            }

        }
    );

}


// ==================================================
// DISPLAY DRIVE PHOTOS
// ==================================================

function displayDrivePhotos(
    photos
) {

    if (photoUploadCount) {

        photoUploadCount.textContent =
            "📷 Photos: " +
            photos.length;

    }


    if (!photoGallery) {
        return;
    }


    photoGallery.innerHTML =
        "";


    if (photos.length === 0) {

        photoGallery.innerHTML = `
            <div class="media-empty">
                No photos found in the Google Drive folder.
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


            image.decoding =
                "async";


            image.alt =
                file.name ||
                "Event photo";


            /*
            Google Drive thumbnail.

            thumbnailLink may require authentication,
            so webViewLink is used as fallback.
            */

            if (file.thumbnailLink) {

                image.src =
                    file.thumbnailLink;

            } else {

                image.src =
                    "https://drive.google.com/thumbnail?id=" +
                    file.id +
                    "&sz=w1000";

            }


            image.addEventListener(
                "click",
                function () {

                    const url =
                        file.webViewLink ||
                        "https://drive.google.com/file/d/" +
                        file.id +
                        "/view";


                    openLightbox(
                        url,
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
// DISPLAY DRIVE VIDEOS
// ==================================================

function displayDriveVideos(
    videos
) {

    if (videoUploadCount) {

        videoUploadCount.textContent =
            "🎥 Videos: " +
            videos.length;

    }


    if (!videoGallery) {
        return;
    }


    videoGallery.innerHTML =
        "";


    if (videos.length === 0) {

        videoGallery.innerHTML = `
            <div class="media-empty">
                No videos found in the Google Drive folder.
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


            const link =
                document.createElement(
                    "a"
                );


            link.href =
                file.webViewLink ||
                "https://drive.google.com/file/d/" +
                file.id +
                "/view";


            link.target =
                "_blank";


            link.rel =
                "noopener noreferrer";


            link.textContent =
                "🎥 " +
                (
                    file.name ||
                    "Open video"
                );


            wrapper.appendChild(
                link
            );


            videoGallery.appendChild(
                wrapper
            );

        }
    );

}


// ==================================================
// EMPTY MEDIA
// ==================================================

function showEmptyMedia() {

    if (photoGallery) {

        photoGallery.innerHTML = `
            <div class="media-empty">
                No Google Drive photos connected to this event.
            </div>
        `;

    }


    if (videoGallery) {

        videoGallery.innerHTML = `
            <div class="media-empty">
                No Google Drive videos connected to this event.
            </div>
        `;

    }


    if (photoUploadCount) {

        photoUploadCount.textContent =
            "📷 Photos: 0";

    }


    if (videoUploadCount) {

        videoUploadCount.textContent =
            "🎥 Videos: 0";

    }

}


// ==================================================
// FILE VALIDATION
// ==================================================

function validateFiles(
    files,
    type
) {

    const maxSize =
        type === "photos"
            ? MAX_PHOTO_SIZE
            : MAX_VIDEO_SIZE;


    const invalidFiles =
        [];


    files.forEach(
        function (file) {

            if (
                file.size >
                maxSize
            ) {

                invalidFiles.push(
                    file.name
                );

            }

        }
    );


    return {

        valid:
            invalidFiles.length === 0,

        invalidFiles:
            invalidFiles,

        maxSize:
            maxSize

    };

}


// ==================================================
// FORMAT FILE SIZE
// ==================================================

function formatFileSize(
    bytes
) {

    if (!bytes) {
        return "0 MB";
    }


    const mb =
        bytes /
        (1024 * 1024);


    if (mb < 1) {

        return (
            Math.round(
                bytes / 1024
            ) +
            " KB"
        );

    }


    return (
        mb.toFixed(1) +
        " MB"
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
// UPLOAD FILE TO GOOGLE DRIVE
// ==================================================

async function uploadFileToDrive(
    file,
    folderId,
    onProgress
) {

    const metadata = {

        name:
            file.name,

        parents:
            [
                folderId
            ]

    };


    /*
    For photos and normal-sized videos,
    multipart upload is sufficient.

    Google Drive API upload endpoint:
    upload/drive/v3/files
    */

    const boundary =
        "-------adtuDriveBoundary" +
        Date.now();


    const delimiter =
        "\r\n--" +
        boundary +
        "\r\n";


    const closeDelimiter =
        "\r\n--" +
        boundary +
        "--";


    const body =
        new Blob([

            "--" +
            boundary +
            "\r\n",

            "Content-Type: application/json; charset=UTF-8\r\n\r\n",

            JSON.stringify(
                metadata
            ),

            delimiter,

            "Content-Type: " +
            (
                file.type ||
                "application/octet-stream"
            ) +
            "\r\n\r\n",

            file,

            closeDelimiter

        ]);


    if (onProgress) {

        onProgress(
            0
        );

    }


    const response =
        await fetch(
            "https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,name,mimeType,webViewLink",
            {

                method:
                    "POST",

                headers: {

                    Authorization:
                        "Bearer " +
                        googleAccessToken,

                    "Content-Type":
                        "multipart/related; boundary=" +
                        boundary

                },

                body:
                    body

            }
        );


    if (!response.ok) {

        const text =
            await response.text();


        throw new Error(
            "Google Drive upload failed: " +
            response.status +
            " " +
            text
        );

    }


    const result =
        await response.json();


    if (onProgress) {

        onProgress(
            100
        );

    }


    return result;

}


// ==================================================
// UPLOAD MEDIA
// ==================================================

async function uploadMedia(
    type
) {

    if (!isAdmin()) {

        showUploadStatus(
            "You are not authorized.",
            "error"
        );

        return;

    }


    const input =
        type === "photos"
            ? eventPhotoInput
            : eventVideoInput;


    const button =
        type === "photos"
            ? uploadPhotosButton
            : uploadVideosButton;


    if (!input) {
        return;
    }


    const files =
        Array.from(
            input.files ||
            []
        );


    if (
        files.length === 0
    ) {

        showUploadStatus(
            type === "photos"
                ? "Please select one or more photos."
                : "Please select one or more videos.",
            "error"
        );

        return;

    }


    const validation =
        validateFiles(
            files,
            type
        );


    if (!validation.valid) {

        showUploadStatus(
            "❌ These files are too large: " +
            validation.invalidFiles.join(", ") +
            ". Maximum: " +
            formatFileSize(
                validation.maxSize
            ),
            "error"
        );

        return;

    }


    // Get event's Drive folder

    let eventDoc;


    try {

        eventDoc =
            await db
                .collection(
                    EVENTS_COLLECTION
                )
                .doc(eventId)
                .get();

    } catch (error) {

        showUploadStatus(
            "Could not load event information.",
            "error"
        );

        return;

    }


    const event =
        eventDoc.data();


    const folderId =
        event &&
        event.driveFolderId;


    if (!folderId) {

        showUploadStatus(
            "Please select a Google Drive folder first.",
            "error"
        );

        return;

    }


    if (button) {

        button.disabled =
            true;

        button.textContent =
            "Uploading...";

    }


    if (eventPhotoInput) {
        eventPhotoInput.disabled = true;
    }


    if (eventVideoInput) {
        eventVideoInput.disabled = true;
    }


    try {

        showUploadStatus(
            `Starting ${files.length} ${type}...`,
            "loading"
        );


        let completed =
            0;


        let failed =
            0;


        for (
            const file of files
        ) {

            try {

                await uploadFileToDrive(
                    file,
                    folderId,
                    function (
                        progress
                    ) {

                        showUploadStatus(
                            `Uploading ${file.name} — ${Math.round(progress)}% (${completed}/${files.length} complete)`,
                            "loading"
                        );

                    }
                );


                completed++;


                showUploadStatus(
                    `Uploading ${type}: ${completed}/${files.length} complete`,
                    "loading"
                );


            } catch (error) {

                failed++;


                console.error(
                    "Drive upload failed:",
                    file.name,
                    error
                );

            }

        }


        input.value =
            "";


        await refreshDriveMedia(
            folderId
        );


        if (
            failed === 0
        ) {

            showUploadStatus(
                `✅ ${completed} ${type === "photos" ? "photo(s)" : "video(s)"} uploaded to Google Drive successfully.`,
                "success"
            );

        } else {

            showUploadStatus(
                `⚠️ ${completed} uploaded successfully and ${failed} failed.`,
                "error"
            );

        }


    } catch (error) {

        console.error(
            "Drive upload error:",
            error
        );


        showUploadStatus(
            "❌ Upload failed: " +
            (
                error.message ||
                "Unknown error"
            ),
            "error"
        );

    }


    if (button) {

        button.disabled =
            false;

        button.textContent =
            type === "photos"
                ? "📷 Upload Photos"
                : "🎥 Upload Videos";

    }


    if (eventPhotoInput) {
        eventPhotoInput.disabled = false;
    }


    if (eventVideoInput) {
        eventVideoInput.disabled = false;
    }

}


// ==================================================
// PHOTO UPLOAD BUTTON
// ==================================================

if (uploadPhotosButton) {

    uploadPhotosButton.addEventListener(
        "click",
        function () {

            uploadMedia(
                "photos"
            );

        }
    );

}


// ==================================================
// VIDEO UPLOAD BUTTON
// ==================================================

if (uploadVideosButton) {

    uploadVideosButton.addEventListener(
        "click",
        function () {

            uploadMedia(
                "videos"
            );

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

                /*
                IMPORTANT:

                We DO NOT delete Google Drive files here.

                The event is deleted from Firestore,
                but the Drive media remains in Google Drive.
                */


                await deleteSubcollection(
                    eventId,
                    "photos"
                );


                await deleteSubcollection(
                    eventId,
                    "videos"
                );


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

                behavior:
                    "smooth",

                block:
                    "start"

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


    /*
    Drive webViewLink is not a direct image URL.

    Open Drive directly instead of trying to
    display it as a normal image.
    */

    if (
        imageURL.includes(
            "drive.google.com"
        )
    ) {

        window.open(
            imageURL,
            "_blank",
            "noopener,noreferrer"
        );

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
// START GOOGLE SERVICES
// ==================================================

window.addEventListener(
    "load",
    function () {

        setTimeout(
            function () {

                loadGoogleApis();

            },
            500
        );

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
    "Google Drive media enabled."
);

console.log(
    "Firebase Storage disabled."
);

console.log(
    "Google OAuth Client:",
    GOOGLE_CLIENT_ID
);

console.log(
    "Event ID:",
    eventId
);

console.log(
    "======================================"
);


loadEvent();
