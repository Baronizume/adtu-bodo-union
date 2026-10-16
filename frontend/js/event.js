document.addEventListener("DOMContentLoaded", () => {
    const API_URL = "/api/events";

    const eventsContainer = document.getElementById("events-container");
    const currentEventContainer = document.getElementById("current-event-container");
    const calendarTitle = document.getElementById("calendarTitle");
    const calendarDays = document.getElementById("calendarDays");
    const selectedDateLabel = document.getElementById("selectedDate");
    const yearElement = document.getElementById("year");
    const prevMonthButton = document.getElementById("prevMonth");
    const nextMonthButton = document.getElementById("nextMonth");

    if (!eventsContainer || !calendarTitle || !calendarDays) {
        console.warn("Events page elements were not found. Check the HTML element IDs.");
        return;
    }

    let events = [];
    let activeFilter = "all";
    let selectedDate = null;

    const today = startOfDay(new Date());
    let displayedMonth = new Date(today.getFullYear(), today.getMonth(), 1);

    if (yearElement) {
        yearElement.textContent = new Date().getFullYear();
    }

    // Mobile navigation
    const menuButton = document.getElementById("menuButton");
    const navigation = document.getElementById("navigation");

    menuButton?.addEventListener("click", () => {
        const isOpen = menuButton.getAttribute("aria-expanded") === "true";

        menuButton.setAttribute("aria-expanded", String(!isOpen));
        navigation?.classList.toggle("open", !isOpen);
    });

    navigation?.querySelectorAll("a").forEach(link => {
        link.addEventListener("click", () => {
            navigation.classList.remove("open");
            menuButton?.setAttribute("aria-expanded", "false");
        });
    });

    function startOfDay(date) {
        return new Date(
            date.getFullYear(),
            date.getMonth(),
            date.getDate()
        );
    }

    function parseEventDate(event) {
        const raw = event.date || event.eventDate || event.startDate;

        if (!raw) return null;

        // Keep YYYY-MM-DD dates on the correct calendar day.
        if (
            typeof raw === "string" &&
            /^\d{4}-\d{2}-\d{2}$/.test(raw)
        ) {
            const [year, month, day] = raw.split("-").map(Number);
            const date = new Date(year, month - 1, day);

            return Number.isNaN(date.getTime())
                ? null
                : startOfDay(date);
        }

        const date = new Date(raw);

        return Number.isNaN(date.getTime())
            ? null
            : startOfDay(date);
    }

    function escapeHTML(value) {
        return String(value ?? "").replace(/[&<>"']/g, character => ({
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            '"': "&quot;",
            "'": "&#039;"
        })[character]);
    }

    function getEventImage(event) {
        const image =
            event.image ||
            event.imageUrl ||
            event.coverImage;

        if (!image) return "";

        try {
            const url = new URL(image, window.location.origin);

            if (!["http:", "https:"].includes(url.protocol)) {
                return "";
            }

            return url.href;
        } catch {
            return "";
        }
    }

    function getEventId(event) {
        return event._id || event.id || "";
    }

    // Load events from the MongoDB-backed API.
    async function loadEvents() {
        eventsContainer.innerHTML =
            '<p class="event-message">Loading events…</p>';

        try {
            const response = await fetch(API_URL, {
                headers: {
                    Accept: "application/json"
                },
                cache: "no-store"
            });

            if (!response.ok) {
                throw new Error(
                    `Server returned HTTP ${response.status}`
                );
            }

            const result = await response.json();

            const list = Array.isArray(result)
                ? result
                : Array.isArray(result.data)
                    ? result.data
                    : Array.isArray(result.events)
                        ? result.events
                        : Array.isArray(result.data?.events)
                            ? result.data.events
                            : null;

            if (!list) {
                throw new Error(
                    result.message ||
                    "The API did not return an events list."
                );
            }

            events = list;

            renderCalendar();
            renderEvents();

        } catch (error) {
            console.error("Unable to load events:", error);

            eventsContainer.innerHTML = `
                <p class="event-message">
                    Unable to load events. Please refresh the page
                    or try again later.
                </p>
            `;

            calendarTitle.textContent = "Calendar unavailable";
            calendarDays.innerHTML = "";
        }
    }

    // Render calendar.
    function renderCalendar() {
        const year = displayedMonth.getFullYear();
        const month = displayedMonth.getMonth();

        calendarTitle.textContent =
            displayedMonth.toLocaleDateString("en", {
                month: "long",
                year: "numeric"
            });

        calendarDays.innerHTML = "";

        const firstWeekday = new Date(year, month, 1).getDay();
        const numberOfDays =
            new Date(year, month + 1, 0).getDate();

        for (let i = 0; i < firstWeekday; i++) {
            const blank = document.createElement("span");

            blank.className = "calendar-empty";
            blank.setAttribute("aria-hidden", "true");

            calendarDays.appendChild(blank);
        }

        for (let day = 1; day <= numberOfDays; day++) {
            const date = new Date(year, month, day);
            const dateKey = date.toDateString();

            const hasEvents = events.some(event => {
                const eventDate = parseEventDate(event);

                return (
                    eventDate &&
                    eventDate.toDateString() === dateKey
                );
            });

            const button = document.createElement("button");

            button.type = "button";
            button.className = "calendar-day";
            button.textContent = day;
            button.setAttribute(
                "aria-label",
                date.toLocaleDateString()
            );

            if (dateKey === today.toDateString()) {
                button.classList.add("today");
            }

            if (hasEvents) {
                button.classList.add("has-events");
            }

            if (
                selectedDate &&
                dateKey === selectedDate.toDateString()
            ) {
                button.classList.add("selected");
            }

            button.addEventListener("click", () => {
                selectedDate = date;
                activeFilter = "all";

                document.querySelectorAll("[data-filter]").forEach(
                    filterButton => {
                        filterButton.classList.toggle(
                            "active",
                            filterButton.dataset.filter === "all"
                        );
                    }
                );

                if (selectedDateLabel) {
                    selectedDateLabel.textContent =
                        `Events on ${date.toLocaleDateString("en", {
                            day: "numeric",
                            month: "long",
                            year: "numeric"
                        })}`;
                }

                renderCalendar();
                renderEvents();
            });

            calendarDays.appendChild(button);
        }
    }

    // Filter events by date or selected filter.
    function getFilteredEvents() {
        return events
            .filter(event => {
                const date = parseEventDate(event);

                if (selectedDate) {
                    return (
                        date &&
                        date.toDateString() === selectedDate.toDateString()
                    );
                }

                if (!date) {
                    return activeFilter === "all";
                }

                if (activeFilter === "upcoming") {
                    return date > today;
                }

                if (activeFilter === "today") {
                    return date.getTime() === today.getTime();
                }

                if (activeFilter === "past") {
                    return date < today;
                }

                return true;
            })
            .sort((a, b) => {
                const dateA = parseEventDate(a);
                const dateB = parseEventDate(b);

                return (
                    (dateA?.getTime() ?? 0) -
                    (dateB?.getTime() ?? 0)
                );
            });
    }

    // Render event cards.
    function renderEvents() {
        const filteredEvents = getFilteredEvents();

        if (currentEventContainer) {
            currentEventContainer.innerHTML = "";
        }

        if (filteredEvents.length === 0) {
            eventsContainer.innerHTML = `
                <p class="event-message">
                    ${selectedDate
                    ? "No events found for this date."
                    : "No events found for this filter."
                }
                </p>
            `;

            return;
        }

        eventsContainer.innerHTML = filteredEvents
            .map(event => {
                const title = escapeHTML(
                    event.title || event.name || "Untitled event"
                );

                const description = escapeHTML(
                    event.description || "More details coming soon."
                );

                const location = escapeHTML(
                    event.location || "Location to be announced"
                );

                const date = parseEventDate(event);

                const formattedDate = date
                    ? date.toLocaleDateString("en", {
                        day: "numeric",
                        month: "long",
                        year: "numeric"
                    })
                    : "Date to be announced";

                const image = getEventImage(event);

                const imageHTML = image
                    ? `<img
                            src="${escapeHTML(image)}"
                            alt="${title}"
                            loading="lazy"
                       >`
                    : `<div
                            class="event-image-placeholder"
                            aria-hidden="true"
                       >🎉</div>`;

                const id = getEventId(event);

                // Assumes the details page is frontend/events/event.html.
                const detailLink = id
                    ? `./events/event.html?id=${encodeURIComponent(id)}`
                    : "";

                return `
                    <article class="event-card">
                        <div class="event-card-image">
                            ${imageHTML}
                        </div>

                        <div class="event-card-content">
                            <p class="event-date">
                                📅 ${formattedDate}
                            </p>

                            <h3>${title}</h3>

                            <p>${description}</p>

                            <p class="event-location">
                                📍 ${location}
                            </p>

                            ${detailLink
                        ? `<a
                                            class="button button-primary"
                                            href="${detailLink}"
                                       >View Details</a>`
                        : ""
                    }
                        </div>
                    </article>
                `;
            })
            .join("");
    }

    // Filter buttons.
    document.querySelectorAll("[data-filter]").forEach(button => {
        button.addEventListener("click", () => {
            activeFilter = button.dataset.filter;
            selectedDate = null;

            document.querySelectorAll("[data-filter]").forEach(item => {
                item.classList.toggle("active", item === button);
            });

            if (selectedDateLabel) {
                selectedDateLabel.textContent =
                    "Showing " +
                    (
                        activeFilter === "all"
                            ? "all events"
                            : `${activeFilter} events`
                    );
            }

            renderCalendar();
            renderEvents();
        });
    });

    // Previous calendar month.
    prevMonthButton?.addEventListener("click", () => {
        displayedMonth = new Date(
            displayedMonth.getFullYear(),
            displayedMonth.getMonth() - 1,
            1
        );

        renderCalendar();
    });

    // Next calendar month.
    nextMonthButton?.addEventListener("click", () => {
        displayedMonth = new Date(
            displayedMonth.getFullYear(),
            displayedMonth.getMonth() + 1,
            1
        );

        renderCalendar();
    });

    loadEvents();
});