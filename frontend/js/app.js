/*
    ADTU BODO UNION
    EVENT & PHOTO HUB
    --------------------------------
    Multiple events + dates + calendar
    Events are saved in localStorage.
*/

const STORAGE_KEY = "adtuBodoUnionEvents";


// =====================================
// DOM ELEMENTS
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

const eventsContainer =
    document.getElementById("events-container");

const selectedDateElement =
    document.getElementById("selectedDate");

const calendarDays =
    document.getElementById("calendarDays");

const calendarTitle =
    document.getElementById("calendarTitle");

const prevMonthButton =
    document.getElementById("prevMonth");

const nextMonthButton =
    document.getElementById("nextMonth");

const formMessage =
    document.getElementById("eventFormMessage");

const clearEventsButton =
    document.getElementById("clearEventsButton");

const filterButtons =
    document.querySelectorAll(".filter-button");

const yearElement =
    document.getElementById("year");

const menuButton =
    document.getElementById("menuButton");

const navigation =
    document.getElementById("navigation");


// =====================================
// DEFAULT EVENTS
// =====================================

const DEFAULT_EVENTS = [];


// =====================================
// LOAD EVENTS
// =====================================

function loadEvents() {

    try {

        const savedEvents =
            localStorage.getItem(STORAGE_KEY);

        if (savedEvents) {

            const parsedEvents =
                JSON.parse(savedEvents);

            if (Array.isArray(parsedEvents)) {
                return parsedEvents;
            }
        }

    } catch (error) {

        console.error(
            "Could not load saved events:",
            error
        );
    }

    return [...DEFAULT_EVENTS];
}


// =====================================
// SAVE EVENTS
// =====================================

function saveEvents(events) {

    try {

        localStorage.setItem(
            STORAGE_KEY,
            JSON.stringify(events)
        );

        return true;

    } catch (error) {

        console.error(
            "Could not save events:",
            error
        );

        return false;
    }
}


// =====================================
// EVENTS
// =====================================

let events = loadEvents();


// =====================================
// CALENDAR STATE
// =====================================

let currentCalendarDate = new Date();

let selectedDate = null;

let currentFilter = "all";


// =====================================
// CREATE EVENT ID
// =====================================

function createEventId() {

    return (
        "event-" +
        Date.now() +
        "-" +
        Math.random()
            .toString(36)
            .substring(2, 8)
    );
}


// =====================================
// ESCAPE HTML
// =====================================

function escapeHTML(value) {

    if (!value) {
        return "";
    }

    return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}


// =====================================
// FORMAT DATE
// =====================================

function formatDate(dateString) {

    if (!dateString) {
        return "";
    }

    const date =
        new Date(
            dateString + "T00:00:00"
        );

    if (isNaN(date.getTime())) {
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
// TODAY
// =====================================

function getTodayString() {

    const today =
        new Date();

    const year =
        today.getFullYear();

    const month =
        String(
            today.getMonth() + 1
        ).padStart(2, "0");

    const day =
        String(
            today.getDate()
        ).padStart(2, "0");

    return `${year}-${month}-${day}`;
}


// =====================================
// EVENT STATUS
// =====================================

function getDateStatus(eventDate) {

    const today =
        getTodayString();

    if (eventDate > today) {
        return "upcoming";
    }

    if (eventDate === today) {
        return "today";
    }

    return "past";
}


// =====================================
// RENDER EVENTS
// =====================================

function renderEvents() {

    if (!eventsContainer) {
        return;
    }

    eventsContainer.innerHTML = "";

    let filteredEvents =
        [...events];


    // =================================
    // SELECTED DATE
    // =================================

    if (selectedDate) {

        filteredEvents =
            filteredEvents.filter(
                event =>
                    event.date === selectedDate
            );
    }


    // =================================
    // FILTER
    // =================================

    if (currentFilter !== "all") {

        filteredEvents =
            filteredEvents.filter(
                event =>
                    getDateStatus(event.date) ===
                    currentFilter
            );
    }


    // =================================
    // SORT
    // =================================

    filteredEvents.sort(
        (a, b) =>
            a.date.localeCompare(b.date)
    );


    // =================================
    // NO EVENTS
    // =================================

    if (filteredEvents.length === 0) {

        const empty =
            document.createElement("div");

        empty.className =
            "event-empty";

        empty.innerHTML = `
            <p>No events found.</p>
        `;

        eventsContainer.appendChild(empty);

        return;
    }


    // =================================
    // EVENT CARDS
    // =================================

    filteredEvents.forEach(event => {

        const card =
            document.createElement("article");

        card.className =
            "event-card";


        const status =
            getDateStatus(event.date);


        card.innerHTML = `

            <div class="event-card-icon">
                📅
            </div>

            <span class="section-label">
                ${status.toUpperCase()}
            </span>

            <h3>
                ${escapeHTML(event.name)}
            </h3>

            <p class="event-date">
                ${formatDate(event.date)}
            </p>

            <p>
                ${escapeHTML(event.description)}
            </p>

            <div class="event-card-actions">

                <a
                    href="events/event.html?id=${encodeURIComponent(event.id)}"
                    class="button button-primary"
                >
                    View Event
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

    if (
        !calendarDays ||
        !calendarTitle
    ) {
        return;
    }

    calendarDays.innerHTML = "";


    const year =
        currentCalendarDate.getFullYear();

    const month =
        currentCalendarDate.getMonth();


    // =================================
    // MONTH TITLE
    // =================================

    calendarTitle.textContent =
        currentCalendarDate.toLocaleDateString(
            "en-IN",
            {
                month: "long",
                year: "numeric"
            }
        );


    // =================================
    // FIRST DAY
    // =================================

    const firstDay =
        new Date(
            year,
            month,
            1
        ).getDay();


    // =================================
    // DAYS IN MONTH
    // =================================

    const daysInMonth =
        new Date(
            year,
            month + 1,
            0
        ).getDate();


    // =================================
    // EMPTY CELLS
    // =================================

    for (
        let i = 0;
        i < firstDay;
        i++
    ) {

        const emptyDay =
            document.createElement("div");

        emptyDay.className =
            "calendar-day empty";

        calendarDays.appendChild(
            emptyDay
        );
    }


    // =================================
    // DAYS
    // =================================

    for (
        let day = 1;
        day <= daysInMonth;
        day++
    ) {

        const dateString =
            `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;


        const dayButton =
            document.createElement("button");

        dayButton.type =
            "button";

        dayButton.className =
            "calendar-day";

        dayButton.textContent =
            day;


        // =================================
        // EVENT ON DATE
        // =================================

        const dayEvents =
            events.filter(
                event =>
                    event.date === dateString
            );


        if (dayEvents.length > 0) {

            dayButton.classList.add(
                "has-event"
            );

            dayButton.title =
                `${dayEvents.length} event${dayEvents.length > 1 ? "s" : ""}`;
        }


        // =================================
        // TODAY
        // =================================

        if (
            dateString ===
            getTodayString()
        ) {

            dayButton.classList.add(
                "today"
            );
        }


        // =================================
        // SELECTED
        // =================================

        if (
            selectedDate ===
            dateString
        ) {

            dayButton.classList.add(
                "selected"
            );
        }


        // =================================
        // CLICK DATE
        // =================================

        dayButton.addEventListener(
            "click",
            function () {

                selectedDate =
                    dateString;

                currentFilter =
                    "all";

                updateFilterButtons();

                updateSelectedDate();

                renderCalendar();

                renderEvents();

            }
        );


        calendarDays.appendChild(
            dayButton
        );
    }
}


// =====================================
// SELECTED DATE
// =====================================

function updateSelectedDate() {

    if (!selectedDateElement) {
        return;
    }

    if (!selectedDate) {

        selectedDateElement.textContent =
            "Select a date to view events.";

        return;
    }


    selectedDateElement.textContent =
        `Events on ${formatDate(selectedDate)}`;
}


// =====================================
// FILTER BUTTONS
// =====================================

function updateFilterButtons() {

    filterButtons.forEach(button => {

        button.classList.toggle(
            "active",
            button.dataset.filter ===
            currentFilter
        );

    });
}


filterButtons.forEach(button => {

    button.addEventListener(
        "click",
        function () {

            currentFilter =
                button.dataset.filter;

            selectedDate =
                null;

            updateFilterButtons();

            updateSelectedDate();

            renderCalendar();

            renderEvents();

        }
    );
});


// =====================================
// PREVIOUS MONTH
// =====================================

if (prevMonthButton) {

    prevMonthButton.addEventListener(
        "click",
        function () {

            currentCalendarDate =
                new Date(
                    currentCalendarDate.getFullYear(),
                    currentCalendarDate.getMonth() - 1,
                    1
                );

            selectedDate =
                null;

            updateSelectedDate();

            renderCalendar();

            renderEvents();

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

            currentCalendarDate =
                new Date(
                    currentCalendarDate.getFullYear(),
                    currentCalendarDate.getMonth() + 1,
                    1
                );

            selectedDate =
                null;

            updateSelectedDate();

            renderCalendar();

            renderEvents();

        }
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


            const name =
                eventNameInput.value.trim();

            const date =
                eventDateInput.value;

            const description =
                eventDescriptionInput.value.trim();

            const photos =
                eventPhotosInput.value.trim();

            const videos =
                eventVideosInput.value.trim();


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


            const newEvent = {

                id: createEventId(),

                name: name,

                date: date,

                description: description,

                photos: photos,

                videos: videos
            };


            events.push(
                newEvent
            );


            if (!saveEvents(events)) {

                showMessage(
                    "Could not save the event.",
                    "error"
                );

                return;
            }


            showMessage(
                "Event added successfully.",
                "success"
            );


            eventForm.reset();


            // Show new event
            selectedDate =
                date;

            currentFilter =
                "all";


            const newDate =
                new Date(
                    date + "T00:00:00"
                );


            currentCalendarDate =
                new Date(
                    newDate.getFullYear(),
                    newDate.getMonth(),
                    1
                );


            updateFilterButtons();

            updateSelectedDate();

            renderCalendar();

            renderEvents();

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

            const confirmed =
                window.confirm(
                    "Are you sure you want to delete all saved events?"
                );


            if (!confirmed) {
                return;
            }


            localStorage.removeItem(
                STORAGE_KEY
            );


            events = [
                ...DEFAULT_EVENTS
            ];


            selectedDate =
                null;

            currentFilter =
                "all";


            updateFilterButtons();

            updateSelectedDate();

            renderCalendar();

            renderEvents();


            showMessage(
                "Saved events cleared.",
                "success"
            );

        }
    );
}


// =====================================
// FORM MESSAGE
// =====================================

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
        `form-message ${type}`;


    setTimeout(
        function () {

            formMessage.textContent =
                "";

            formMessage.className =
                "form-message";

        },
        4000
    );
}


// =====================================
// MOBILE MENU
// =====================================

if (
    menuButton &&
    navigation
) {

    menuButton.addEventListener(
        "click",
        function () {

            const isOpen =
                navigation.classList.toggle(
                    "open"
                );


            menuButton.setAttribute(
                "aria-expanded",
                String(isOpen)
            );

        }
    );


    navigation
        .querySelectorAll("a")
        .forEach(link => {

            link.addEventListener(
                "click",
                function () {

                    navigation.classList.remove(
                        "open"
                    );

                    menuButton.setAttribute(
                        "aria-expanded",
                        "false"
                    );

                }
            );

        });
}


// =====================================
// FOOTER YEAR
// =====================================

if (yearElement) {

    yearElement.textContent =
        new Date().getFullYear();

}


// =====================================
// INITIALIZE
// =====================================

updateFilterButtons();

updateSelectedDate();

renderCalendar();

renderEvents();
