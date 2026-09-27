/*
    ADTU BODO UNION
    EVENT MANAGEMENT SYSTEM

    MANUAL EVENT ENTRY
    LOCAL STORAGE
*/


// =====================================
// STORAGE
// =====================================

const STORAGE_KEY = "adtu_bodo_union_events";


// =====================================
// ELEMENTS
// =====================================

const menuButton =
    document.getElementById("menuButton");

const navigation =
    document.getElementById("navigation");

const calendarTitle =
    document.getElementById("calendarTitle");

const calendarDays =
    document.getElementById("calendarDays");

const prevMonthButton =
    document.getElementById("prevMonth");

const nextMonthButton =
    document.getElementById("nextMonth");

const selectedDateElement =
    document.getElementById("selectedDate");

const eventsContainer =
    document.getElementById("events-container");

const yearElement =
    document.getElementById("year");


// =====================================
// EVENT FORM
// =====================================

const eventForm =
    document.getElementById("eventForm");

const eventNameInput =
    document.getElementById("eventNameInput");

const eventDateInput =
    document.getElementById("eventDateInput");

const eventDescriptionInput =
    document.getElementById("eventDescriptionInput");

const eventPhotosInput =
    document.getElementById("eventPhotosInput");

const eventVideosInput =
    document.getElementById("eventVideosInput");

const eventFormMessage =
    document.getElementById("eventFormMessage");

const clearEventsButton =
    document.getElementById("clearEventsButton");


// =====================================
// VARIABLES
// =====================================

let calendarDate = new Date();

let selectedDate = null;

let currentFilter = "all";

let events = [];


// =====================================
// LOAD EVENTS
// =====================================

function loadEvents() {

    try {

        const savedEvents =
            localStorage.getItem(STORAGE_KEY);

        if (!savedEvents) {
            return [];
        }

        const parsedEvents =
            JSON.parse(savedEvents);

        if (!Array.isArray(parsedEvents)) {
            return [];
        }

        return parsedEvents;

    } catch (error) {

        console.error(
            "Error loading events:",
            error
        );

        return [];
    }
}


// =====================================
// SAVE EVENTS
// =====================================

function saveEvents() {

    try {

        localStorage.setItem(
            STORAGE_KEY,
            JSON.stringify(events)
        );

    } catch (error) {

        console.error(
            "Error saving events:",
            error
        );

    }
}


// Load saved events

events = loadEvents();


// =====================================
// YEAR
// =====================================

if (yearElement) {

    yearElement.textContent =
        new Date().getFullYear();

}


// =====================================
// MOBILE MENU
// =====================================

if (menuButton && navigation) {

    menuButton.addEventListener(
        "click",
        function () {

            navigation.classList.toggle(
                "active"
            );

            const isOpen =
                navigation.classList.contains(
                    "active"
                );

            menuButton.setAttribute(
                "aria-expanded",
                String(isOpen)
            );

        }
    );

}


// =====================================
// DATE KEY
// =====================================

function getDateKey(date) {

    const year =
        date.getFullYear();

    const month =
        String(
            date.getMonth() + 1
        ).padStart(2, "0");

    const day =
        String(
            date.getDate()
        ).padStart(2, "0");

    return `${year}-${month}-${day}`;

}


// =====================================
// FORMAT DATE
// =====================================

function formatDate(dateValue) {

    if (!dateValue) {
        return "";
    }

    const date =
        new Date(
            `${dateValue}T00:00:00`
        );

    if (
        Number.isNaN(
            date.getTime()
        )
    ) {
        return "";
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


// =====================================
// ESCAPE HTML
// =====================================

function escapeHTML(value) {

    const div =
        document.createElement("div");

    div.textContent =
        value ?? "";

    return div.innerHTML;

}


// =====================================
// ESCAPE ATTRIBUTE
// =====================================

function escapeAttribute(value) {

    return String(
        value ?? ""
    )
        .replace(/&/g, "&amp;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;");

}


// =====================================
// EVENT URL
// =====================================

function getEventURL(event) {

    return (
        `events/event.html?id=${encodeURIComponent(
            event.id
        )}`
    );

}


// =====================================
// FILTER EVENTS
// =====================================

function getFilteredEvents() {

    const today =
        getDateKey(new Date());


    if (currentFilter === "upcoming") {

        return events.filter(
            event =>
                event.date >= today
        );

    }


    if (currentFilter === "past") {

        return events.filter(
            event =>
                event.date < today
        );

    }


    if (currentFilter === "today") {

        return events.filter(
            event =>
                event.date === today
        );

    }


    return events;

}


// =====================================
// RENDER EVENTS
// =====================================

function renderEvents(eventList = null) {

    if (!eventsContainer) {
        return;
    }


    const list =
        eventList !== null
            ? eventList
            : getFilteredEvents();


    // NO EVENTS

    if (!list.length) {

        eventsContainer.innerHTML = `

            <div class="loading-state">

                <p>
                    No events found.
                </p>

            </div>

        `;

        return;

    }


    // EVENT CARDS

    eventsContainer.innerHTML =
        list.map(
            event => {

                const eventURL =
                    getEventURL(event);


                const photosButton =
                    event.photos
                        ? `

                            <a
                                href="${escapeAttribute(event.photos)}"
                                target="_blank"
                                rel="noopener noreferrer"
                                class="view-button"
                            >
                                📷 Photos
                            </a>

                        `
                        : "";


                const videosButton =
                    event.videos
                        ? `

                            <a
                                href="${escapeAttribute(event.videos)}"
                                target="_blank"
                                rel="noopener noreferrer"
                                class="view-button"
                            >
                                🎥 Videos
                            </a>

                        `
                        : "";


                return `

                    <article class="event-card">

                        <div class="event-icon">
                            📅
                        </div>


                        <span class="section-label">
                            EVENT
                        </span>


                        <h3>
                            ${escapeHTML(
                                event.name
                            )}
                        </h3>


                        <p>
                            ${escapeHTML(
                                event.description
                            )}
                        </p>


                        <div class="event-date">

                            📅

                            ${escapeHTML(
                                formatDate(event.date)
                            )}

                        </div>


                        <div class="event-card-actions">

                            <a
                                href="${escapeAttribute(eventURL)}"
                                class="view-button"
                            >
                                View Event →
                            </a>


                            ${photosButton}


                            ${videosButton}


                            <button
                                type="button"
                                class="delete-event-button"
                                data-event-id="${escapeAttribute(event.id)}"
                            >
                                🗑 Delete
                            </button>

                        </div>

                    </article>

                `;

            }
        ).join("");

}


// =====================================
// CALENDAR
// =====================================

function renderCalendar() {

    if (
        !calendarTitle ||
        !calendarDays
    ) {
        return;
    }


    const year =
        calendarDate.getFullYear();

    const month =
        calendarDate.getMonth();


    // MONTH TITLE

    calendarTitle.textContent =
        calendarDate.toLocaleDateString(
            "en-IN",
            {
                month: "long",
                year: "numeric"
            }
        );


    calendarDays.innerHTML = "";


    // FIRST DAY

    const firstDay =
        new Date(
            year,
            month,
            1
        ).getDay();


    // DAYS IN MONTH

    const daysInMonth =
        new Date(
            year,
            month + 1,
            0
        ).getDate();


    // PREVIOUS MONTH

    const previousMonthDays =
        new Date(
            year,
            month,
            0
        ).getDate();


    for (
        let i = firstDay;
        i > 0;
        i--
    ) {

        const button =
            document.createElement("button");

        button.type =
            "button";

        button.className =
            "calendar-day other-month";

        button.textContent =
            previousMonthDays - i + 1;

        button.disabled =
            true;

        calendarDays.appendChild(
            button
        );

    }


    // CURRENT MONTH

    for (
        let day = 1;
        day <= daysInMonth;
        day++
    ) {

        const date =
            new Date(
                year,
                month,
                day
            );


        const dateKey =
            getDateKey(date);


        const button =
            document.createElement("button");


        button.type =
            "button";

        button.className =
            "calendar-day";

        button.textContent =
            day;


        // TODAY

        if (
            dateKey ===
            getDateKey(new Date())
        ) {

            button.classList.add(
                "today"
            );

        }


        // SELECTED

        if (
            selectedDate ===
            dateKey
        ) {

            button.classList.add(
                "selected"
            );

        }


        // EVENT EXISTS

        const hasEvent =
            events.some(
                event =>
                    event.date ===
                    dateKey
            );


        if (hasEvent) {

            button.classList.add(
                "has-event"
            );

        }


        // CLICK DATE

        button.addEventListener(
            "click",
            function () {

                selectDate(dateKey);

            }
        );


        calendarDays.appendChild(
            button
        );

    }

}


// =====================================
// SELECT DATE
// =====================================

function selectDate(dateKey) {

    selectedDate =
        dateKey;


    const date =
        new Date(
            `${dateKey}T00:00:00`
        );


    if (selectedDateElement) {

        selectedDateElement.textContent =
            `Events on ${date.toLocaleDateString(
                "en-IN",
                {
                    day: "numeric",
                    month: "long",
                    year: "numeric"
                }
            )}`;

    }


    const selectedEvents =
        events.filter(
            event =>
                event.date ===
                dateKey
        );


    renderCalendar();

    renderEvents(
        selectedEvents
    );

}


// =====================================
// SHOW MESSAGE
// =====================================

function showMessage(
    message,
    type
) {

    if (!eventFormMessage) {
        return;
    }


    eventFormMessage.textContent =
        message;


    eventFormMessage.className =
        `form-message ${type}`;


    setTimeout(
        function () {

            eventFormMessage.textContent =
                "";

            eventFormMessage.className =
                "form-message";

        },
        4000
    );

}


// =====================================
// ADD EVENT
// =====================================

if (eventForm) {

    eventForm.addEventListener(
        "submit",
        function (e) {

            e.preventDefault();


            // GET FORM VALUES

            const name =
                eventNameInput
                    ? eventNameInput.value.trim()
                    : "";


            const date =
                eventDateInput
                    ? eventDateInput.value
                    : "";


            const description =
                eventDescriptionInput
                    ? eventDescriptionInput.value.trim()
                    : "";


            const photos =
                eventPhotosInput
                    ? eventPhotosInput.value.trim()
                    : "";


            const videos =
                eventVideosInput
                    ? eventVideosInput.value.trim()
                    : "";


            // VALIDATION

            if (
                !name ||
                !date ||
                !description
            ) {

                showMessage(
                    "Please enter the event name, date and description.",
                    "error"
                );

                return;

            }


            // CREATE EVENT

            const newEvent = {

                id:
                    Date.now().toString(),

                name:
                    name,

                date:
                    date,

                description:
                    description,

                photos:
                    photos,

                videos:
                    videos

            };


            // ADD EVENT

            events.push(
                newEvent
            );


            // SAVE

            saveEvents();


            // CLEAR FORM

            eventForm.reset();


            // SUCCESS MESSAGE

            showMessage(
                "Event added successfully!",
                "success"
            );


            // MOVE CALENDAR

            calendarDate =
                new Date(
                    `${date}T00:00:00`
                );


            // SELECT DATE

            selectedDate =
                date;


            // UPDATE CALENDAR

            renderCalendar();

            selectDate(date);

        }
    );

}


// =====================================
// DELETE INDIVIDUAL EVENT
// =====================================

if (eventsContainer) {

    eventsContainer.addEventListener(
        "click",
        function (e) {

            const deleteButton =
                e.target.closest(
                    ".delete-event-button"
                );


            if (!deleteButton) {
                return;
            }


            const eventId =
                deleteButton.dataset.eventId;


            const eventToDelete =
                events.find(
                    event =>
                        event.id ===
                        eventId
                );


            if (!eventToDelete) {
                return;
            }


            const confirmed =
                confirm(
                    `Are you sure you want to delete "${eventToDelete.name}"?`
                );


            if (!confirmed) {
                return;
            }


            // REMOVE EVENT

            events =
                events.filter(
                    event =>
                        event.id !==
                        eventId
                );


            // SAVE

            saveEvents();


            // REFRESH

            renderCalendar();


            if (selectedDate) {

                const selectedEvents =
                    events.filter(
                        event =>
                            event.date ===
                            selectedDate
                    );


                renderEvents(
                    selectedEvents
                );

            } else {

                renderEvents();

            }


            showMessage(
                "Event deleted successfully.",
                "success"
            );

        }
    );

}


// =====================================
// CLEAR ALL EVENTS
// =====================================

if (clearEventsButton) {

    clearEventsButton.addEventListener(
        "click",
        function () {

            if (!events.length) {

                showMessage(
                    "There are no saved events.",
                    "error"
                );

                return;

            }


            const confirmed =
                confirm(
                    "Are you sure you want to delete ALL saved events?"
                );


            if (!confirmed) {
                return;
            }


            // DELETE ALL

            events = [];


            // REMOVE STORAGE

            localStorage.removeItem(
                STORAGE_KEY
            );


            // RESET

            selectedDate = null;


            // UPDATE

            renderCalendar();

            renderEvents();


            if (selectedDateElement) {

                selectedDateElement.textContent =
                    "Select a date to view events.";

            }


            showMessage(
                "All events have been deleted.",
                "success"
            );

        }
    );

}


// =====================================
// PREVIOUS MONTH
// =====================================

if (prevMonthButton) {

    prevMonthButton.addEventListener(
        "click",
        function () {

            calendarDate.setMonth(
                calendarDate.getMonth() - 1
            );

            renderCalendar();

        }
    );

}


// =====================================
// NEXT MONTH
// =====================================

if (nextMonthButton) {

    nextMonthButton.addEventListener(
        "click",
        function () {

            calendarDate.setMonth(
                calendarDate.getMonth() + 1
            );

            renderCalendar();

        }
    );

}


// =====================================
// FILTER BUTTONS
// =====================================

const filterButtons =
    document.querySelectorAll(
        ".filter-button"
    );


filterButtons.forEach(
    function (button) {

        button.addEventListener(
            "click",
            function () {

                // REMOVE ACTIVE

                filterButtons.forEach(
                    function (item) {

                        item.classList.remove(
                            "active"
                        );

                    }
                );


                // ADD ACTIVE

                button.classList.add(
                    "active"
                );


                // FILTER

                currentFilter =
                    button.dataset.filter;


                // RESET SELECTED DATE

                selectedDate =
                    null;


                if (selectedDateElement) {

                    selectedDateElement.textContent =
                        "Select a date to view events.";

                }


                renderCalendar();

                renderEvents();

            }
        );

    }
);


// =====================================
// START APPLICATION
// =====================================

renderCalendar();

renderEvents();
