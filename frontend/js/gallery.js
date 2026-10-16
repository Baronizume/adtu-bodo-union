
document.addEventListener("DOMContentLoaded", () => {
    const photosContainer = document.getElementById("photos-container");
    const videosContainer = document.getElementById("videos-container");

    if (!photosContainer && !videosContainer) return;

    async function loadGallery() {
        try {
            const response = await fetch("/api/events");
            if (!response.ok) throw new Error("Could not load events");

            const result = await response.json();
            const events = Array.isArray(result)
                ? result
                : Array.isArray(result.data)
                    ? result.data
                    : [];

            if (!events.length) {
                showMessage(photosContainer, "No event photos available yet.");
                showMessage(videosContainer, "No event videos available yet.");
                return;
            }

            const mediaResults = await Promise.all(
                events.map(async event => {
                    try {
                        const id = event._id || event.id;
                        if (!id) return { photos: [], videos: [] };

                        const response = await fetch(
                            `/api/upload/event/${encodeURIComponent(id)}`
                        );

                        if (!response.ok) return { photos: [], videos: [] };

                        const data = await response.json();
                        return {
                            photos: (data.photos || []).map(file => ({
                                ...file,
                                eventTitle: event.title
                            })),
                            videos: (data.videos || []).map(file => ({
                                ...file,
                                eventTitle: event.title
                            }))
                        };
                    } catch (error) {
                        console.error("Could not load event media:", error);
                        return { photos: [], videos: [] };
                    }
                })
            );

            const photos = mediaResults.flatMap(item => item.photos);
            const videos = mediaResults.flatMap(item => item.videos);

            renderPhotos(photos);
            renderVideos(videos);
        } catch (error) {
            console.error("Gallery loading error:", error);
            showMessage(photosContainer, "Unable to load photos.");
            showMessage(videosContainer, "Unable to load videos.");
        }
    }

    function showMessage(container, message) {
        if (container) {
            container.textContent = message;
        }
    }

    function renderPhotos(photos) {
        if (!photosContainer) return;

        photosContainer.replaceChildren();

        if (!photos.length) {
            showMessage(photosContainer, "No event photos available yet.");
            return;
        }

        photos.forEach(photo => {
            const card = document.createElement("article");
            card.className = "gallery-card";

            const image = document.createElement("img");
            image.src = photo.url;
            image.alt = photo.eventTitle || "ADTU Bodo Union event photo";
            image.loading = "lazy";

            const caption = document.createElement("p");
            caption.textContent = photo.eventTitle || "Event photo";

            card.append(image, caption);
            photosContainer.appendChild(card);
        });
    }

    function renderVideos(videos) {
        if (!videosContainer) return;

        videosContainer.replaceChildren();

        if (!videos.length) {
            showMessage(videosContainer, "No event videos available yet.");
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

            const caption = document.createElement("p");
            caption.textContent = video.eventTitle || "Event video";

            card.append(player, caption);
            videosContainer.appendChild(card);
        });
    }

    loadGallery();
});
