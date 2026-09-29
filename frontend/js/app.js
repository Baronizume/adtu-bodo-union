/*
    ADTU BODO UNION
    EVENT & PHOTO HUB
    --------------------------------
    Multiple events + dates + calendar
    Events are saved in localStorage.
*/

// =====================================
// STORAGE
// =====================================

const STORAGE_KEY = "adtuBodoUnionEvents";


// =====================================
// DOM ELEMENTS
// =====================================

const eventForm = document.getElementById("eventForm");

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
// Add your REAL previous events here.
//
// IMPORTANT:
// Do NOT delete old events when adding a new one.
// Every event must have a unique id.
//
// If your browser already has saved events,
// these defaults are only used when there
// are no saved events.
// =====================================

const DEFAULT_EVENTS = [

    /*
    {
        id: "event-2026-09-30",
        name: "Tomorrow's Event",
        date: "2026-09-30",
        description: "ADTU Bodo Union event and activities.",
        photos: "YOUR_PHOTOS_LINK",
        videos: "YOUR_VIDEOS_LINK"
    },

    {
        id: "event-2026-09-20",
        name: "Previous Event",
        date: "2026-09-20",
        description: "Previous ADTU Bodo Union event.",
        photos: "YOUR_PHOTOS_LINK",
        videos: "YOUR_VIDEOS_LINK"
    }
    */

];


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

    } catch (error) {

        console.error(
            "Could not save events:",
            error
        );
    }
}


// =====================================
// EVENTS DATA
// =====================================

let events = loadEvents();


// =====================================
// CURRENT CALENDAR DATE
// =====================================

let currentCalendarDate = new Date();


// =====================================
// SELECTED DATE
// =====================================

let selectedDate = null;


// =====================================
// CURRENT FILTER
// =====================================

let currentFilter = "all";


// =====================================
// CREATE UNIQUE EVENT ID
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
// FORMAT DATE
// =====================================

function formatDate(dateString) {

    if (!dateString) {
        return "";
    }

    const date =
        new Date(dateString + "T00:00:00");

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

    const today = new Date();

    const year =
        today.getFullYear();

    const month =
        String(today.getMonth() + 1)
            .padStart(2, "0");

    const day =
        String(today.getDate())
            .padStart(2, "0");

    return `${year}-${month}-${day}`;
}


// =====================================
// DATE COMPARISON
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

    let filteredEvents = [...events];


    // =================================
    // FILTER BY SELECTED DATE
    // =================================

    if (selectedDate) {

        filteredEvents =
            filteredEvents.filter(
                event =>
                    event.date === selectedDate
            );
    }


    // =================================
    // FILTER BY CATEGORY
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
    // SORT BY DATE
    // =================================

    filteredEvents.sort(
        (a, b) =>
            a.date.localeCompare(b.date)
    );


    // =================================
    // NO EVENTS
    // =================================

    if (filteredEvents.length === 0) {

        eventsContainer.innerHTML = `
            <div class="event-empty">
                <p>No events found for this date.</p>
            </div>
        `;

        return;
    }


    // =================================
    // CREATE EVENT CARDS
    // =================================

    filteredEvents.forEach(event => {

        const card =
            document.createElement("article");

        card.className = "event-card";


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
// RENDER CALENDAR
// =====================================

function renderCalendar() {

    if (!calendarDays || !calendarTitle) {
        return;
    }

    calendarDays.innerHTML = "";


    const year =
        currentCalendarDate.getFullYear();

    const month =
        currentCalendarDate.getMonth();


    const monthName =
        currentCalendarDate.toLocaleDateString(
            "en-IN",
            {
                month: "long",
                year: "numeric"
            }
        );


    calendarTitle.textContent =
        monthName;


    const firstDay =
        new Date(year, month, 1)
            .getDay();


    const daysInMonth =
        new Date(year, month + 1, 0)
            .getDate();


    // =================================
    // EMPTY DAYS BEFORE MONTH START
    // =================================

    for (
        let i = 0;
        i < firstDay;
        i++
    ) {

        const emptyDay =
            document.createElement("span");

        emptyDay.className =
            "calendar-day empty";

        calendarDays.appendChild(emptyDay);
    }


    // =================================
    // MONTH DAYS
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

        dayButton.type = "button";

        dayButton.className =
            "calendar-day";


        dayButton.textContent =
            day;


        // =================================
        // EVENTS ON THIS DATE
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
        // SELECTED DATE
        // =================================

        if (
            selectedDate === dateString
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
            () => {

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
// UPDATE SELECTED DATE
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


    const date =
        new Date(
            selectedDate + "T00:00:00"
        );


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


// =====================================
// FILTER BUTTONS
// =====================================

function updateFilterButtons() {

    filterButtons.forEach(button => {

        const filter =
            button.dataset.filter;

        button.classList.toggle(
            "active",
            filter === currentFilter
        );

    });

}


filterButtons.forEach(button => {

    button.addEventListener(
        "click",
        () => {

            currentFilter =
                button.dataset.filter;

            selectedDate = null;

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
        () => {

            currentCalendarDate =
                new Date(
                    currentCalendarDate.getFullYear(),
                    currentCalendarDate.getMonth() - 1,
                    1
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
        () => {

            currentCalendarDate =
                new Date(
                    currentCalendarDate.getFullYear(),
                    currentCalendarDate.getMonth() + 1,
                    1
                );

            renderCalendar();

        }
    );
}


// =====================================
// ADD EVENT
// =====================================

if (eventForm) {

    eventForm.addEventListener(
        "submit",
        function (event) {

            event.preventDefault();


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


            if (!name || !date || !description) {

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


            // =================================
            // ADD WITHOUT DELETING OLD EVENTS
            // =================================

            events.push(newEvent);

            saveEvents(events);


            showMessage(
                "Event added successfully.",
                "success"
            );


            eventForm.reset();


            // =================================
            // SHOW NEW EVENT DATE
            // =================================

            selectedDate = date;

            currentFilter = "all";


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
// CLEAR SAVED EVENTS
// =====================================

if (clearEventsButton) {

    clearEventsButton.addEventListener(
        "click",
        () => {

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


            selectedDate = null;

            currentFilter = "all";


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

function showMessage(message, type) {

    if (!formMessage) {
        return;
    }

    formMessage.textContent =
        message;

    formMessage.className =
        `form-message ${type}`;


    setTimeout(
        () => {

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

if (menuButton && navigation) {

    menuButton.addEventListener(
        "click",
        () => {

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
                () => {

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
