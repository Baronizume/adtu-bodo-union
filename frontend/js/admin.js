// =====================================================
// ADTU BODO UNION
// ADMIN DASHBOARD
// FIREBASE + LOCAL BACKEND UPLOAD
// =====================================================


// =====================================================
// CONFIGURATION
// =====================================================

const EVENTS_COLLECTION = "events";

const API_URL = "http://localhost:5000";


// =====================================================
// DOM ELEMENTS
// =====================================================

const eventForm =
    document.getElementById("eventForm");

const eventName =
    document.getElementById("eventName");

const eventDate =
    document.getElementById("eventDate");

const eventDescription =
    document.getElementById("eventDescription");

const eventList =
    document.getElementById("eventList");

const adminUser =
    document.getElementById("adminUser");

const logoutButton =
    document.getElementById("logoutButton");

const formMessage =
    document.getElementById("formMessage");

const saveEventButton =
    document.getElementById("saveEventButton");

const clearFormButton =
    document.getElementById("clearFormButton");

const yearElement =
    document.getElementById("year");


// =====================================================
// FOOTER YEAR
// =====================================================

if (yearElement) {

    yearElement.textContent =
        new Date().getFullYear();

}


// =====================================================
// ADMIN VERIFICATION
// =====================================================

async function verifyAdmin(user) {

    if (!user) {
        return false;
    }

    try {

        const adminDoc =
            await db
                .collection("admins")
                .doc(user.uid)
                .get();


        if (!adminDoc.exists) {
            return false;
        }


        const data =
            adminDoc.data();


        return (
            !data.role ||
            data.role === "admin"
        );


    } catch (error) {

        console.error(
            "Admin verification error:",
            error
        );

        return false;

    }

}


// =====================================================
// AUTH STATE
// =====================================================

auth.onAuthStateChanged(
    async function (user) {

        if (!user) {

            window.location.replace(
                "login.html"
            );

            return;

        }


        const admin =
            await verifyAdmin(user);


        if (!admin) {

            await auth.signOut();

            window.location.replace(
                "login.html"
            );

            return;

        }


        if (adminUser) {

            adminUser.textContent =
                "Logged in as: " +
                (
                    user.email ||
                    "Administrator"
                );

        }


        loadEvents();

    }
);


// =====================================================
// LOGOUT
// =====================================================

if (logoutButton) {

    logoutButton.addEventListener(
        "click",
        async function () {

            try {

                await auth.signOut();

            } catch (error) {

                console.error(
                    "Logout error:",
                    error
                );

            }


            window.location.replace(
                "login.html"
            );

        }
    );

}


// =====================================================
// FORM MESSAGE
// =====================================================

function showMessage(
    message,
    type
) {

    if (!formMessage) {
        return;
    }


    formMessage.textContent =
        message;


    formMessage.className =
        "status-message " +
        type;

}


// =====================================================
// CLEAR FORM
// =====================================================

function clearForm() {

    if (!eventForm) {
        return;
    }


    eventForm.reset();


    eventForm.removeAttribute(
        "data-edit-id"
    );


    if (saveEventButton) {

        saveEventButton.textContent =
            "➕ Add Event";

    }


    showMessage(
        "",
        ""
    );

}


if (clearFormButton) {

    clearFormButton.addEventListener(
        "click",
        clearForm
    );

}


// =====================================================
// ADD / UPDATE EVENT
// =====================================================

if (eventForm) {

    eventForm.addEventListener(
        "submit",
        async function (e) {

            e.preventDefault();


            const user =
                auth.currentUser;


            if (
                !await verifyAdmin(user)
            ) {

                showMessage(
                    "❌ You are not authorized.",
                    "error"
                );

                return;

            }


            const name =
                eventName.value.trim();


            const date =
                eventDate.value;


            const description =
                eventDescription.value.trim();


            // -----------------------------------------
            // REQUIRED FIELDS
            // -----------------------------------------

            if (!name || !date) {

                showMessage(
                    "❌ Event name and date are required.",
                    "error"
                );

                return;

            }


            // -----------------------------------------
            // EDIT ID
            // -----------------------------------------

            const editId =
                eventForm.getAttribute(
                    "data-edit-id"
                );


            // -----------------------------------------
            // EVENT DATA
            // -----------------------------------------

            const data = {

                name:
                    name,

                date:
                    date,

                description:
                    description,

                updatedAt:
                    firebase.firestore
                        .FieldValue
                        .serverTimestamp()

            };


            saveEventButton.disabled =
                true;


            saveEventButton.textContent =
                editId
                    ? "Updating..."
                    : "Adding...";


            try {

                // =====================================
                // UPDATE EVENT
                // =====================================

                if (editId) {

                    await db
                        .collection(
                            EVENTS_COLLECTION
                        )
                        .doc(editId)
                        .update(
                            data
                        );


                    showMessage(
                        "✅ Event updated successfully.",
                        "success"
                    );

                }


                // =====================================
                // ADD EVENT
                // =====================================

                else {

                    data.createdAt =
                        firebase.firestore
                            .FieldValue
                            .serverTimestamp();


                    await db
                        .collection(
                            EVENTS_COLLECTION
                        )
                        .add(
                            data
                        );


                    showMessage(
                        "✅ Event added successfully.",
                        "success"
                    );

                }


                clearForm();

                await loadEvents();


            } catch (error) {

                console.error(
                    "Save event error:",
                    error
                );


                showMessage(
                    "❌ Could not save the event: " +
                    (
                        error.message ||
                        "Unknown error"
                    ),
                    "error"
                );

            }


            saveEventButton.disabled =
                false;


            saveEventButton.textContent =
                "➕ Add Event";

        }
    );

}


// =====================================================
// LOAD EVENTS
// =====================================================

async function loadEvents() {

    if (!eventList) {
        return;
    }


    eventList.innerHTML =
        '<p class="loading">Loading events...</p>';


    try {

        const snapshot =
            await db
                .collection(
                    EVENTS_COLLECTION
                )
                .orderBy(
                    "date",
                    "desc"
                )
                .get();


        eventList.innerHTML =
            "";


        if (snapshot.empty) {

            eventList.innerHTML =
                "<p>No events found.</p>";

            return;

        }


        snapshot.forEach(
            function (doc) {

                createEventItem(
                    doc.id,
                    doc.data()
                );

            }
        );


    } catch (error) {

        console.error(
            "Load events error:",
            error
        );


        eventList.innerHTML =
            '<p class="error">Could not load events.</p>';

    }

}


// =====================================================
// CREATE EVENT ITEM
// =====================================================

function createEventItem(
    id,
    data
) {

    const item =
        document.createElement(
            "div"
        );


    item.className =
        "event-item";


    // =================================================
    // TITLE
    // =================================================

    const title =
        document.createElement(
            "h3"
        );


    title.textContent =
        data.name ||
        "Untitled Event";


    // =================================================
    // DATE
    // =================================================

    const date =
        document.createElement(
            "p"
        );


    date.className =
        "event-date";


    date.textContent =
        "📅 " +
        formatDate(
            data.date
        );


    // =================================================
    // DESCRIPTION
    // =================================================

    const description =
        document.createElement(
            "p"
        );


    description.className =
        "event-description";


    description.textContent =
        data.description ||
        "No description.";


    // =================================================
    // ACTIONS
    // =================================================

    const actions =
        document.createElement(
            "div"
        );


    actions.className =
        "event-actions";


    // =================================================
    // VIEW EVENT
    // =================================================

    const viewButton =
        document.createElement(
            "a"
        );


    viewButton.className =
        "view-button";


    viewButton.textContent =
        "👁️ View Event";


    viewButton.href =
        "../events/event.html?id=" +
        encodeURIComponent(id);


    viewButton.target =
        "_blank";


    viewButton.rel =
        "noopener noreferrer";


    // =================================================
    // EDIT EVENT
    // =================================================

    const editButton =
        document.createElement(
            "button"
        );


    editButton.type =
        "button";


    editButton.className =
        "edit-button";


    editButton.textContent =
        "✏️ Edit";


    editButton.addEventListener(
        "click",
        function () {

            editEvent(
                id,
                data
            );

        }
    );


    // =================================================
    // DELETE EVENT
    // =================================================

    const deleteButton =
        document.createElement(
            "button"
        );


    deleteButton.type =
        "button";


    deleteButton.className =
        "delete-button";


    deleteButton.textContent =
        "🗑️ Delete";


    deleteButton.addEventListener(
        "click",
        function () {

            deleteEvent(
                id,
                data.name
            );

        }
    );


    actions.appendChild(
        viewButton
    );


    actions.appendChild(
        editButton
    );


    actions.appendChild(
        deleteButton
    );


    item.appendChild(
        title
    );


    item.appendChild(
        date
    );


    item.appendChild(
        description
    );


    item.appendChild(
        actions
    );


    // =================================================
    // MEDIA UPLOAD
    // =================================================

    createMediaUploadBox(
        id,
        data,
        item
    );


    eventList.appendChild(
        item
    );

}


// =====================================================
// MEDIA UPLOAD BOX
// =====================================================

function createMediaUploadBox(
    eventId,
    data,
    eventItem
) {

    const box =
        document.createElement(
            "div"
        );


    box.className =
        "drive-box";


    // =================================================
    // TITLE
    // =================================================

    const title =
        document.createElement(
            "h4"
        );


    title.textContent =
        "📁 Event Photos & Videos";


    // =================================================
    // HELP TEXT
    // =================================================

    const help =
        document.createElement(
            "p"
        );


    help.className =
        "drive-help";


    help.textContent =
        "Select photos or videos from your computer using File Explorer.";


    // =================================================
    // PHOTO SECTION
    // =================================================

    const photoSection =
        document.createElement(
            "div"
        );


    photoSection.style.marginTop =
        "20px";


    const photoTitle =
        document.createElement(
            "h4"
        );


    photoTitle.textContent =
        "📷 Event Photos";


    const photoHelp =
        document.createElement(
            "p"
        );


    photoHelp.className =
        "drive-help";


    photoHelp.textContent =
        "Select JPG, JPEG, PNG, WEBP or GIF photos.";


    const photoInput =
        document.createElement(
            "input"
        );


    photoInput.type =
        "file";


    photoInput.accept =
        ".jpg,.jpeg,.png,.webp,.gif,image/jpeg,image/png,image/webp,image/gif";


    photoInput.multiple =
        true;


    const photoButton =
        document.createElement(
            "button"
        );


    photoButton.type =
        "button";


    photoButton.className =
        "primary-button";


    photoButton.style.marginTop =
        "10px";


    photoButton.textContent =
        "📤 Upload Photos";


    const photoStatus =
        document.createElement(
            "div"
        );


    photoStatus.className =
        "drive-status";


    photoSection.appendChild(
        photoTitle
    );


    photoSection.appendChild(
        photoHelp
    );


    photoSection.appendChild(
        photoInput
    );


    photoSection.appendChild(
        photoButton
    );


    photoSection.appendChild(
        photoStatus
    );


    // =================================================
    // VIDEO SECTION
    // =================================================

    const videoSection =
        document.createElement(
            "div"
        );


    videoSection.style.marginTop =
        "30px";


    const videoTitle =
        document.createElement(
            "h4"
        );


    videoTitle.textContent =
        "🎥 Event Videos";


    const videoHelp =
        document.createElement(
            "p"
        );


    videoHelp.className =
        "drive-help";


    videoHelp.textContent =
        "Select MP4, WEBM, MOV or M4V videos.";


    const videoInput =
        document.createElement(
            "input"
        );


    videoInput.type =
        "file";


    videoInput.accept =
        ".mp4,.webm,.mov,.m4v,video/mp4,video/webm,video/quicktime,video/x-m4v";


    videoInput.multiple =
        true;


    const videoButton =
        document.createElement(
            "button"
        );


    videoButton.type =
        "button";


    videoButton.className =
        "primary-button";


    videoButton.style.marginTop =
        "10px";


    videoButton.textContent =
        "📤 Upload Videos";


    const videoStatus =
        document.createElement(
            "div"
        );


    videoStatus.className =
        "drive-status";


    videoSection.appendChild(
        videoTitle
    );


    videoSection.appendChild(
        videoHelp
    );


    videoSection.appendChild(
        videoInput
    );


    videoSection.appendChild(
        videoButton
    );


    videoSection.appendChild(
        videoStatus
    );


    // =================================================
    // MEDIA COUNTS
    // =================================================

    const counts =
        document.createElement(
            "div"
        );


    counts.className =
        "media-count";


    const photoCount =
        document.createElement(
            "span"
        );


    photoCount.className =
        "photo-count";


    photoCount.textContent =
        "📷 Photos: " +
        (
            Number(
                data.photoCount
            ) || 0
        );


    const videoCount =
        document.createElement(
            "span"
        );


    videoCount.className =
        "video-count";


    videoCount.textContent =
        "🎥 Videos: " +
        (
            Number(
                data.videoCount
            ) || 0
        );


    counts.appendChild(
        photoCount
    );


    counts.appendChild(
        videoCount
    );


    // =================================================
    // ADD EVERYTHING
    // =================================================

    box.appendChild(
        title
    );


    box.appendChild(
        help
    );


    box.appendChild(
        photoSection
    );


    box.appendChild(
        videoSection
    );


    box.appendChild(
        counts
    );


    eventItem.appendChild(
        box
    );


    // =================================================
    // PHOTO UPLOAD
    // =================================================

    photoButton.addEventListener(
        "click",
        async function () {

            const files =
                photoInput.files;


            if (
                !files ||
                files.length === 0
            ) {

                photoStatus.textContent =
                    "⚠️ Please select photos first.";

                photoStatus.className =
                    "drive-status error";

                return;

            }


            photoButton.disabled =
                true;


            photoButton.textContent =
                "Uploading Photos...";


            photoStatus.textContent =
                "Uploading photos...";


            photoStatus.className =
                "drive-status loading";


            const result =
                await uploadPhotos(
                    files
                );


            if (result) {

                photoStatus.textContent =
                    `✅ ${result.files.length} photo(s) uploaded successfully.`;

                photoStatus.className =
                    "drive-status success";


                photoInput.value =
                    "";


                photoCount.textContent =
                    "📷 Photos: " +
                    result.files.length;

            } else {

                photoStatus.textContent =
                    "❌ Photo upload failed.";

                photoStatus.className =
                    "drive-status error";

            }


            photoButton.disabled =
                false;


            photoButton.textContent =
                "📤 Upload Photos";

        }
    );


    // =================================================
    // VIDEO UPLOAD
    // =================================================

    videoButton.addEventListener(
        "click",
        async function () {

            const files =
                videoInput.files;


            if (
                !files ||
                files.length === 0
            ) {

                videoStatus.textContent =
                    "⚠️ Please select videos first.";

                videoStatus.className =
                    "drive-status error";

                return;

            }


            videoButton.disabled =
                true;


            videoButton.textContent =
                "Uploading Videos...";


            videoStatus.textContent =
                "Uploading videos...";


            videoStatus.className =
                "drive-status loading";


            const result =
                await uploadVideos(
                    files
                );


            if (result) {

                videoStatus.textContent =
                    `✅ ${result.files.length} video(s) uploaded successfully.`;

                videoStatus.className =
                    "drive-status success";


                videoInput.value =
                    "";


                videoCount.textContent =
                    "🎥 Videos: " +
                    result.files.length;

            } else {

                videoStatus.textContent =
                    "❌ Video upload failed.";

                videoStatus.className =
                    "drive-status error";

            }


            videoButton.disabled =
                false;


            videoButton.textContent =
                "📤 Upload Videos";

        }
    );

}


// =====================================================
// UPLOAD PHOTOS
// =====================================================

async function uploadPhotos(
    files
) {

    const formData =
        new FormData();


    for (
        const file of files
    ) {

        formData.append(
            "photos",
            file
        );

    }


    try {

        const response =
            await fetch(
                `${API_URL}/api/upload/photos`,
                {
                    method:
                        "POST",

                    body:
                        formData
                }
            );


        const data =
            await response.json();


        if (
            !response.ok
        ) {

            throw new Error(
                data.message ||
                "Photo upload failed."
            );

        }


        console.log(
            "Photos uploaded:",
            data
        );


        return data;


    } catch (error) {

        console.error(
            "Photo upload error:",
            error
        );


        return null;

    }

}


// =====================================================
// UPLOAD VIDEOS
// =====================================================

async function uploadVideos(
    files
) {

    const formData =
        new FormData();


    for (
        const file of files
    ) {

        formData.append(
            "videos",
            file
        );

    }


    try {

        const response =
            await fetch(
                `${API_URL}/api/upload/videos`,
                {
                    method:
                        "POST",

                    body:
                        formData
                }
            );


        const data =
            await response.json();


        if (
            !response.ok
        ) {

            throw new Error(
                data.message ||
                "Video upload failed."
            );

        }


        console.log(
            "Videos uploaded:",
            data
        );


        return data;


    } catch (error) {

        console.error(
            "Video upload error:",
            error
        );


        return null;

    }

}


// =====================================================
// EDIT EVENT
// =====================================================

function editEvent(
    id,
    data
) {

    eventName.value =
        data.name ||
        "";


    eventDate.value =
        data.date ||
        "";


    eventDescription.value =
        data.description ||
        "";


    eventForm.setAttribute(
        "data-edit-id",
        id
    );


    saveEventButton.textContent =
        "💾 Update Event";


    window.scrollTo({

        top:
            0,

        behavior:
            "smooth"

    });

}


// =====================================================
// DELETE EVENT
// =====================================================

async function deleteEvent(
    id,
    name
) {

    const user =
        auth.currentUser;


    if (
        !await verifyAdmin(
            user
        )
    ) {

        alert(
            "You are not authorized."
        );

        return;

    }


    const confirmed =
        window.confirm(
            'Are you sure you want to delete "' +
            (
                name ||
                "this event"
            ) +
            '"?'
        );


    if (!confirmed) {
        return;
    }


    try {

        await db
            .collection(
                EVENTS_COLLECTION
            )
            .doc(id)
            .delete();


        alert(
            "Event deleted successfully."
        );


        await loadEvents();


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

    }

}


// =====================================================
// FORMAT DATE
// =====================================================

function formatDate(
    dateString
) {

    if (!dateString) {

        return "Date not available";

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

            day:
                "numeric",

            month:
                "long",

            year:
                "numeric"

        }
    );

}


// =====================================================
// START
// =====================================================

console.log(
    "====================================="
);

console.log(
    "ADTU BODO UNION ADMIN DASHBOARD"
);

console.log(
    "Firebase events enabled"
);

console.log(
    "Local backend uploads enabled"
);

console.log(
    "Google Drive disabled"
);

console.log(
    "Upload API:",
    API_URL
);

console.log(
    "====================================="
);
