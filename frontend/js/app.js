```javascript
/*
    ADTU BODO UNION
    EVENT & PHOTO HUB
    --------------------------------
    MongoDB events + calendar + filters
*/

// =====================================
// API CONFIGURATION
// =====================================

const API_BASE_URL = "/api/events";

// =====================================
// DOM ELEMENTS
// =====================================

const eventForm = document.getElementById("eventForm");
const eventNameInput = document.getElementById("eventNameInput");
const eventDateInput = document.getElementById("eventDateInput");
const eventDescriptionInput = document.getElementById("eventDescriptionInput");
const eventPhotosInput = document.getElementById("eventPhotosInput");
const eventVideosInput = document.getElementById("eventVideosInput");

const eventsContainer = document.getElementById("events-container");
const selectedDateElement = document.getElementById("selectedDate");
const calendarDays = document.getElementById("calendarDays");
const calendarTitle = document.getElementById("calendarTitle");

const prevMonthButton = document.getElementById("prevMonth");
const nextMonthButton = document.getElementById("nextMonth");
const formMessage = document.getElementById("eventFormMessage");
const clearEventsButton = document.getElementById("clearEventsButton");

const filterButtons = document.querySelectorAll(".filter-button");
const yearElement = document.getElementById("year");
const menuButton = document.getElementById("menuButton");
const navigation = document.getElementById("navigation");

// =====================================
// STATE
// =====================================

let events = [];
let currentCalendarDate = new Date();
let selectedDate = null;
let currentFilter = "all";
let isLoadingEvents = false;

// =====================================
// HTML ESCAPING
// =====================================

function escapeHTML(value) {
    return String(value ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

// =====================================
// API HELPER
// =====================================

async function apiRequest(url, options = {}) {
    const response = await fetch(url, {
        ...options,
        headers: {
            ...(options.body
                ? { "Content-Type": "application/json" }
                : {}),
            ...(options.headers || {})
        }
    });

    const result = await response.json().catch(() => ({}));

    if (!response.ok || result.success === false) {
        throw new Error(
            result.message || `Request failed (${response.status})`
        );
    }

    return result;
}

// =====================================
// DATE HELPERS
// =====================================

function getTodayString() {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, "0");
    const day = String(today.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
}

function normalizeDate(dateString) {
    return String(dateString || "").slice(0, 10);
}

function formatDate(dateString) {
    const normalized = normalizeDate(dateString);

    if (!normalized) return "";

    const date = new Date(`${normalized}T00:00:00`);

    if (Number.isNaN(date.getTime())) return "";

    return date.toLocaleDateString("en-IN", {
        day: "numeric",
        month: "long",
        year: "numeric"
    });
}

function getDateStatus(eventDate) {
    const date = normalizeDate(eventDate);
    const today = getTodayString();

    if (!date) return "past";
    if (date > today) return "upcoming";
    if (date === today) return "today";

    return "past";
}

// =====================================
// NORMALIZE MONGODB EVENT
// =====================================

function normalizeEvent(event) {
    return {
        id: String(event._id || event.id || ""),
        name: event.title || event.name || "Untitled Event",
        title: event.title || event.name || "Untitled Event",
        description: event.description || "",
        date: normalizeDate(event.date),
        location: event.location || "",
        image: event.image || "",
        createdAt: event.createdAt || null
    };
}

// =====================================
// LOAD EVENTS FROM MONGODB
// =====================================

async function loadEvents() {
    if (isLoadingEvents) return;

    isLoadingEvents = true;

    if (eventsContainer) {
        eventsContainer.setAttribute("aria-busy", "true");
    }

    try {
        const result = await apiRequest(API_BASE_URL);

        if (!Array.isArray(result.data)) {
            throw new Error("The events API did not return an event list.");
        }

        events = result.data
            .map(normalizeEvent)
            .filter(event => event.id && event.date);

        renderCalendar();
        renderEvents();

    } catch (error) {
        console.error("Could not load MongoDB events:", error);

        if (eventsContainer) {
            eventsContainer.innerHTML = `
                <div class="event-empty">
                    <p>Could not load events. Please try again later.</p>
                    <button type="button" class="button button-primary"
                        id="retryLoadEvents">
                        Retry
                    </button>
                </div>
            `;

            document
                .getElementById("retryLoadEvents")
                ?.addEventListener("click", loadEvents);
        }

        showMessage("Could not load events from the server.", "error");

    } finally {
        isLoadingEvents = false;

        if (eventsContainer) {
            eventsContainer.removeAttribute("aria-busy");
        }
    }
}

// =====================================
// RENDER EVENT CARDS
// =====================================

function renderEvents() {
    if (!eventsContainer) return;

    eventsContainer.innerHTML = "";

    let filteredEvents = [...events];

    if (selectedDate) {
        filteredEvents = filteredEvents.filter(
            event => event.date === selectedDate
        );
    }

    if (currentFilter !== "all") {
        filteredEvents = filteredEvents.filter(
            event => getDateStatus(event.date) === currentFilter
        );
    }

    // Upcoming events first; older events follow.
    filteredEvents.sort((a, b) => a.date.localeCompare(b.date));

    if (filteredEvents.length === 0) {
        const empty = document.createElement("div");
        empty.className = "event-empty";
        empty.innerHTML = "<p>No events found.</p>";
        eventsContainer.appendChild(empty);
        return;
    }

    filteredEvents.forEach(event => {
        const card = document.createElement("article");
        card.className = "event-card";

        const status = getDateStatus(event.date);
        const imageMarkup = event.image
            ? `<img class="event-card-image"
                    src="${escapeHTML(event.image)}"
                    alt="${escapeHTML(event.name)}"
                    loading="lazy">`
            : `<div class="event-card-icon" aria-hidden="true">📅</div>`;

        card.innerHTML = `
            ${imageMarkup}
            <span class="section-label">${escapeHTML(status.toUpperCase())}</span>
            <h3>${escapeHTML(event.name)}</h3>
            <p class="event-date">${escapeHTML(formatDate(event.date))}</p>
            ${event.location
                ? `<p class="event-location">${escapeHTML(event.location)}</p>`
                : ""}
            <p>${escapeHTML(event.description)}</p>
            <div class="event-card-actions">
                <a href="./events/event.html?id=${encodeURIComponent(event.id)}"
                   class="button button-primary">
                    👁️ View Event
                </a>
            </div>
        `;

        eventsContainer.appendChild(card);
    });
}

// =====================================
// RENDER CALENDAR
// =====================================

function renderCalendar() {
    if (!calendarDays || !calendarTitle) return;

    calendarDays.innerHTML = "";

    const year = currentCalendarDate.getFullYear();
    const month = currentCalendarDate.getMonth();

    calendarTitle.textContent = currentCalendarDate.toLocaleDateString(
        "en-IN",
        { month: "long", year: "numeric" }
    );

    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    for (let i = 0; i < firstDay; i++) {
        const emptyDay = document.createElement("div");
        emptyDay.className = "calendar-day empty";
        calendarDays.appendChild(emptyDay);
    }

    for (let day = 1; day <= daysInMonth; day++) {
        const dateString =
            `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;

        const dayButton = document.createElement("button");
        dayButton.type = "button";
        dayButton.className = "calendar-day";
        dayButton.textContent = day;

        const dayEvents = events.filter(event => event.date === dateString);

        if (dayEvents.length) {
            dayButton.classList.add("has-event");
            dayButton.title =
                `${dayEvents.length} event${dayEvents.length > 1 ? "s" : ""}`;
            dayButton.setAttribute("aria-label",
                `${formatDate(dateString)}, ${dayEvents.length} events`);
        }

        if (dateString === getTodayString()) {
            dayButton.classList.add("today");
        }

        if (dateString === selectedDate) {
            dayButton.classList.add("selected");
            dayButton.setAttribute("aria-pressed", "true");
        } else {
            dayButton.setAttribute("aria-pressed", "false");
        }

        dayButton.addEventListener("click", () => {
            selectedDate = dateString;
            currentFilter = "all";

            updateFilterButtons();
            updateSelectedDate();
            renderCalendar();
            renderEvents();
        });

        calendarDays.appendChild(dayButton);
    }
}

// =====================================
// SELECTED DATE
// =====================================

function updateSelectedDate() {
    if (!selectedDateElement) return;

    selectedDateElement.textContent = selectedDate
        ? `Events on ${formatDate(selectedDate)}`
        : "Select a date to view events.";
}

// =====================================
// FILTER BUTTONS
// =====================================

function updateFilterButtons() {
    filterButtons.forEach(button => {
        const active = button.dataset.filter === currentFilter;

        button.classList.toggle("active", active);
        button.setAttribute("aria-pressed", String(active));
    });
}

filterButtons.forEach(button => {
    button.addEventListener("click", () => {
        currentFilter = button.dataset.filter || "all";
        selectedDate = null;

        updateFilterButtons();
        updateSelectedDate();
        renderCalendar();
        renderEvents();
    });
});

// =====================================
// MONTH NAVIGATION
// =====================================

if (prevMonthButton) {
    prevMonthButton.addEventListener("click", () => {
        currentCalendarDate = new Date(
            currentCalendarDate.getFullYear(),
            currentCalendarDate.getMonth() - 1,
            1
        );

        selectedDate = null;
        updateSelectedDate();
        renderCalendar();
        renderEvents();
    });
}

if (nextMonthButton) {
    nextMonthButton.addEventListener("click", () => {
        currentCalendarDate = new Date(
            currentCalendarDate.getFullYear(),
            currentCalendarDate.getMonth() + 1,
            1
        );

        selectedDate = null;
        updateSelectedDate();
        renderCalendar();
        renderEvents();
    });
}

// =====================================
// ADD EVENT THROUGH MONGODB API
// =====================================

if (eventForm) {
    eventForm.addEventListener("submit", async event => {
        event.preventDefault();

        const title = eventNameInput?.value.trim() || "";
        const date = eventDateInput?.value || "";
        const description = eventDescriptionInput?.value.trim() || "";

        if (!title || !date || !description) {
            showMessage(
                "Please enter the event name, date and description.",
                "error"
            );
            return;
        }

        const submitButton = eventForm.querySelector(
            'button[type="submit"], input[type="submit"]'
        );

        if (submitButton) submitButton.disabled = true;

        try {
            await apiRequest(API_BASE_URL, {
                method: "POST",
                body: JSON.stringify({
                    title,
                    date,
                    description,
                    location: "ADTU Bodo Union"
                })
            });

            showMessage("Event added successfully.", "success");
            eventForm.reset();

            selectedDate = date;
            currentFilter = "all";

            const newDate = new Date(`${date}T00:00:00`);
            currentCalendarDate = new Date(
                newDate.getFullYear(),
                newDate.getMonth(),
                1
            );

            updateFilterButtons();
            updateSelectedDate();

            await loadEvents();

        } catch (error) {
            console.error("Could not add event:", error);
            showMessage(error.message || "Could not save the event.", "error");

        } finally {
            if (submitButton) submitButton.disabled = false;
        }
    });
}

// =====================================
// CLEAR ALL EVENTS
// =====================================
// WARNING:
// This requires a DELETE /api/events backend route.
// The server must authorize this action for admins.
// Do not expose a public delete-all API.

if (clearEventsButton) {
    clearEventsButton.addEventListener("click", async () => {
        const confirmed = window.confirm(
            "Are you sure you want to delete all events? This cannot be undone."
        );

        if (!confirmed) return;

        try {
            await apiRequest(API_BASE_URL, {
                method: "DELETE"
            });

            selectedDate = null;
            currentFilter = "all";

            updateFilterButtons();
            updateSelectedDate();

            await loadEvents();
            showMessage("All events deleted.", "success");

        } catch (error) {
            console.error("Could not delete events:", error);
            showMessage(
                error.message ||
                "Delete all is not available. Check the protected backend endpoint.",
                "error"
            );
        }
    });
}

// =====================================
// FORM MESSAGE
// =====================================

function showMessage(message, type) {
    if (!formMessage) return;

    formMessage.textContent = message;
    formMessage.className = `form-message ${type}`;
}

// =====================================
// MOBILE MENU
// =====================================

if (menuButton && navigation) {
    menuButton.addEventListener("click", () => {
        const isOpen = navigation.classList.toggle("open");

        menuButton.setAttribute("aria-expanded", String(isOpen));
    });

    navigation.querySelectorAll("a").forEach(link => {
        link.addEventListener("click", () => {
            navigation.classList.remove("open");
            menuButton.setAttribute("aria-expanded", "false");
        });
    });
}

// =====================================
// FOOTER YEAR
// =====================================

if (yearElement) {
    yearElement.textContent = new Date().getFullYear();
}

// =====================================
// INITIALIZE
// =====================================

updateFilterButtons();
updateSelectedDate();
renderCalendar();
loadEvents();
```
