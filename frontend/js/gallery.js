
document.addEventListener("DOMContentLoaded", () => {
    const photosContainer = document.getElementById("photos-container");
    const videosContainer = document.getElementById("videos-container");

    if (!photosContainer && !videosContainer) return;

    const API_BASE = window.location.origin;

    function showMessage(container, message) {
        if (!container) return;

        container.replaceChildren();

        const paragraph = document.createElement("p");
        paragraph.className = "gallery-message";
        paragraph.textContent = message;

        container.appendChild(paragraph);
    }

    async function fetchJSON(url) {
        const response = await fetch(url);

        if (!response.ok) {
            throw new Error(`Request failed: ${response.status} ${url}`);
        }

        return response.json();
    }

    async function loadEventMedia(event) {
        const eventId = event._id || event.id;

        if (!eventId) {
            return { photos: [], videos: [] };
        }

        try {
            const data = await fetchJSON(
                `${API_BASE}/api/upload/event/${encodeURIComponent(eventId)}`
            );

            return {
                photos: (data.photos || [])
                    .filter(file => file.url)
                    .map(file => ({
                        ...file,
                        eventTitle: event.title || "ADTU Bodo Union Event"
                    })),

                videos: (data.videos || [])
                    .filter(file => file.url)
                    .map(file => ({
                        ...file,
                        eventTitle: event.title || "ADTU Bodo Union Event"
                    }))
            };
        } catch (error) {
            console.error(
                `Could not load media for ${event.title || eventId}:`,
                error
            );

            return { photos: [], videos: [] };
        }
    }

    function renderPhotos(photos) {
        if (!photosContainer) return;

        photosContainer.replaceChildren();

        if (photos.length === 0) {
            showMessage(
                photosContainer,
                "No event photos available yet."
            );
            return;
        }

        photos.forEach(photo => {
            const card = document.createElement("article");
            card.className = "gallery-card";

            const image = document.createElement("img");
            image.src = photo.url;
            image.alt = photo.eventTitle || "ADTU Bodo Union event photo";
            image.loading = "lazy";
            image.decoding = "async";

            image.addEventListener("error", () => {
                image.alt = "This photo could not be loaded.";
            });

            const caption = document.createElement("p");
            caption.textContent = photo.eventTitle || "Event photo";

            card.append(image, caption);
            photosContainer.appendChild(card);
        });
    }

    function renderVideos(videos) {
        if (!videosContainer) return;

        videosContainer.replaceChildren();

        if (videos.length === 0) {
            showMessage(
                videosContainer,
                "No event videos available yet."
            );
            return;
        }

        videos.forEach(video => {
            const card = document.createElement("article");
            card.className = "gallery-card";

            const player = document.createElement("video");
            player.src = video.url;
            player.controls = true;
            player.preload = "metadata";
            player.playsInline = true;

            player.addEventListener("error", () => {
                console.error("Could not load video:", video.url);
            });

            const caption = document.createElement("p");
            caption.textContent = video.eventTitle || "Event video";

            card.append(player, caption);
            videosContainer.appendChild(card);
        });
    }

    async function loadGallery() {
        showMessage(photosContainer, "Loading event photos...");
        showMessage(videosContainer, "Loading event videos...");

        try {
            const result = await fetchJSON(`${API_BASE}/api/events`);

            const events = Array.isArray(result)
                ? result
                : Array.isArray(result.data)
                    ? result.data
                    : [];

            if (events.length === 0) {
                renderPhotos([]);
                renderVideos([]);
                return;
            }

            const results = await Promise.all(
                events.map(event => loadEventMedia(event))
            );

            const photos = results.flatMap(result => result.photos);
            const videos = results.flatMap(result => result.videos);

            renderPhotos(photos);
            renderVideos(videos);

            console.log("Gallery loaded:", {
                events: events.length,
                photos: photos.length,
                videos: videos.length
            });

        } catch (error) {
            console.error("Gallery loading error:", error);

            showMessage(
                photosContainer,
                "Unable to load photos. Please try again later."
            );

            showMessage(
                videosContainer,
                "Unable to load videos. Please try again later."
            );
        }
    }

    loadGallery();
});
