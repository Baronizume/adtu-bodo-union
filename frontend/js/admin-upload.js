const API_URL = "https://adtu-bodo-union.onrender.com";


// =====================================================
// LOAD EVENTS INTO DROPDOWN
// =====================================================

async function loadEventDropdown() {

    const eventSelect =
        document.getElementById("eventId");

    if (!eventSelect) {
        return;
    }

    try {

        const snapshot =
            await db
                .collection("events")
                .orderBy("date", "desc")
                .get();


        eventSelect.innerHTML = `
            <option value="">
                Select an event
            </option>
        `;


        snapshot.forEach(function(doc) {

            const data = doc.data();

            const option =
                document.createElement("option");

            option.value = doc.id;

            option.textContent =
                data.name ||
                "Unnamed Event";

            eventSelect.appendChild(option);

        });


        console.log(
            "Events loaded:",
            snapshot.size
        );


    } catch (error) {

        console.error(
            "Could not load events:",
            error
        );


        eventSelect.innerHTML = `
            <option value="">
                Could not load events
            </option>
        `;

    }

}


// =====================================================
// UPLOAD ONE TYPE
// =====================================================

async function uploadFiles(
    files,
    type,
    statusElement,
    buttonElement,
    eventId
) {

    if (!files || files.length === 0) {

        return;

    }


    const user =
        auth.currentUser;


    if (!user) {

        throw new Error(
            "Please login first."
        );

    }


    const admin =
        await verifyAdmin(user);


    if (!admin) {

        throw new Error(
            "You are not authorized."
        );

    }


    const endpoint =
        type === "photo"
            ? "/api/upload/photos"
            : "/api/upload/videos";


    const fieldName =
        type === "photo"
            ? "photos"
            : "videos";


    const formData =
        new FormData();


    // Add every selected file

    for (
        let i = 0;
        i < files.length;
        i++
    ) {

        formData.append(
            fieldName,
            files[i]
        );

    }


    // Add Firebase event ID

    formData.append(
        "eventId",
        eventId
    );


    console.log(
        "Uploading:",
        type
    );

    console.log(
        "Event ID:",
        eventId
    );

    console.log(
        "Files:",
        files.length
    );


    const response =
        await fetch(
            API_URL + endpoint,
            {
                method: "POST",
                body: formData
            }
        );


    const text =
        await response.text();


    let result;


    try {

        result =
            JSON.parse(text);

    } catch (error) {

        console.error(
            "Server response:",
            text
        );

        throw new Error(
            "Server returned an invalid response."
        );

    }


    if (!response.ok) {

        throw new Error(
            result.message ||
            "Upload failed."
        );

    }


    console.log(
        "Upload successful:",
        result
    );


    return result;

}


// =====================================================
// MAIN UPLOAD BUTTON
// =====================================================

document
    .getElementById("uploadMediaButton")
    .addEventListener(
        "click",
        async function() {

            const eventSelect =
                document.getElementById(
                    "eventId"
                );


            const photoInput =
                document.getElementById(
                    "photoFiles"
                );


            const videoInput =
                document.getElementById(
                    "videoFiles"
                );


            const status =
                document.getElementById(
                    "uploadStatus"
                );


            const eventId =
                eventSelect.value;


            // -----------------------------------------
            // CHECK EVENT
            // -----------------------------------------

            if (!eventId) {

                status.textContent =
                    "❌ Please select an event.";

                status.className =
                    "error";

                return;

            }


            // -----------------------------------------
            // CHECK FILES
            // -----------------------------------------

            if (
                photoInput.files.length === 0 &&
                videoInput.files.length === 0
            ) {

                status.textContent =
                    "❌ Please select a photo or video.";

                status.className =
                    "error";

                return;

            }


            const button =
                this;


            button.disabled =
                true;


            status.textContent =
                "⏳ Uploading...";

            status.className =
                "loading";


            let photoUploaded =
                0;

            let videoUploaded =
                0;


            try {

                // =====================================
                // UPLOAD PHOTOS
                // =====================================

                if (
                    photoInput.files.length > 0
                ) {

                    const result =
                        await uploadFiles(
                            photoInput.files,
                            "photo",
                            status,
                            button,
                            eventId
                        );


                    photoUploaded =
                        result.files
                            ? result.files.length
                            : 0;

                }


                // =====================================
                // UPLOAD VIDEOS
                // =====================================

                if (
                    videoInput.files.length > 0
                ) {

                    const result =
                        await uploadFiles(
                            videoInput.files,
                            "video",
                            status,
                            button,
                            eventId
                        );


                    videoUploaded =
                        result.files
                            ? result.files.length
                            : 0;

                }


                // =====================================
                // SUCCESS
                // =====================================

                status.textContent =
                    `✅ Upload complete. Photos: ${photoUploaded}, Videos: ${videoUploaded}`;

                status.className =
                    "success";


                photoInput.value =
                    "";

                videoInput.value =
                    "";


            } catch (error) {

                console.error(
                    "MEDIA UPLOAD ERROR:",
                    error
                );


                status.textContent =
                    "❌ " +
                    error.message;

                status.className =
                    "error";

            }


            button.disabled =
                false;

        }
    );


// =====================================================
// LOAD EVENTS WHEN PAGE IS READY
// =====================================================

document.addEventListener(
    "DOMContentLoaded",
    function() {

        loadEventDropdown();

    }
);