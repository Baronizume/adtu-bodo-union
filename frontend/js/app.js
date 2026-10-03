/*
    ADTU BODO UNION
    EVENT & PHOTO HUB
    --------------------------------
    Multiple events + dates + calendar
    Events are stored in Cloud Firestore.
*/

const STORAGE_COLLECTION = "events";


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
// CALENDAR STATE
// =====================================

let events = [];

let currentCalendarDate =
    new Date();

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
// LOAD EVENTS FROM FIRESTORE
// =====================================

function loadEvents() {

    if (typeof db === "undefined") {

        console.error(
            "Firebase Firestore database is not available."
        );

        showMessage(
            "Firebase database is not available.",
            "error"
        );

        return;
    }

    db.collection(STORAGE_COLLECTION)
        .onSnapshot(

            function (snapshot) {

                events =
                    snapshot.docs.map(
                        function (doc) {

                            return {
                                id: doc.id,
                                ...doc.data()
                            };

                        }
                    );

                renderCalendar();

                renderEvents();

            },

            function (error) {

                console.error(
                    "Could not load events from Firestore:",
                    error
                );

                showMessage(
                    "Could not load events from the server.",
                    "error"
                );

            }
        );

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
                function (event) {

                    return event.date === selectedDate;

                }
            );

    }


    // =================================
    // FILTER
    // =================================

    if (currentFilter !== "all") {

        filteredEvents =
            filteredEvents.filter(
                function (event) {

                    return (
                        getDateStatus(event.date) ===
                        currentFilter
                    );

                }
            );

    }


    // =================================
    // SORT
    // =================================

    filteredEvents.sort(
        function (a, b) {

            return String(a.date || "")
                .localeCompare(
                    String(b.date || "")
                );

        }
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

        eventsContainer.appendChild(
            empty
        );

        return;
    }


    // =================================
    // EVENT CARDS
    // =================================

    filteredEvents.forEach(
        function (event) {

            const card =
                document.createElement("article");

            card.className =
                "event-card";


            const status =
                getDateStatus(event.date);


            /*
                    IMPORTANT:
                    event.html is located at:

                    frontend/events/event.html

                    Therefore from:

                    frontend/index.html

                    the correct path is:

                    ./events/event.html
                */

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
                        href="./events/event.html?id=${encodeURIComponent(event.id)}"

                        class="button button-primary"
                    >
                        👁️ View Event
                    </a>

                </div>
            `;


            eventsContainer.appendChild(
                card
            );

        }
    );

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


    calendarTitle.textContent =
        currentCalendarDate.toLocaleDateString(
            "en-IN",
            {
                month: "long",
                year: "numeric"
            }
        );


    const firstDay =
        new Date(
            year,
            month,
            1
        ).getDay();


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


        const dayEvents =
            events.filter(
                function (event) {

                    return event.date === dateString;

                }
            );


        if (dayEvents.length > 0) {

            dayButton.classList.add(
                "has-event"
            );

            dayButton.title =
                `${dayEvents.length} event${dayEvents.length > 1 ? "s" : ""}`;

        }


        if (
            dateString ===
            getTodayString()
        ) {

            dayButton.classList.add(
                "today"
            );

        }


        if (
            selectedDate ===
            dateString
        ) {

            dayButton.classList.add(
                "selected"
            );

        }


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

    filterButtons.forEach(
        function (button) {

            button.classList.toggle(
                "active",
                button.dataset.filter ===
                currentFilter
            );

        }
    );

}


filterButtons.forEach(
    function (button) {

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

    }
);


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
        async function (e) {

            e.preventDefault();


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

                name:
                    name,

                date:
                    date,

                description:
                    description,

                createdAt:
                    firebase.firestore.FieldValue.serverTimestamp()

            };


            try {

                await db
                    .collection(
                        STORAGE_COLLECTION
                    )
                    .doc(
                        createEventId()
                    )
                    .set(
                        newEvent
                    );


                showMessage(
                    "Event added successfully.",
                    "success"
                );


                eventForm.reset();


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

            } catch (error) {

                console.error(
                    "Could not add event:",
                    error
                );

                showMessage(
                    "Could not save the event.",
                    "error"
                );

            }

        }
    );

}


// =====================================
// CLEAR ALL EVENTS
// =====================================

if (clearEventsButton) {

    clearEventsButton.addEventListener(
        "click",
        async function () {

            const confirmed =
                window.confirm(
                    "Are you sure you want to delete all events?"
                );


            if (!confirmed) {
                return;
            }


            try {

                const snapshot =
                    await db
                        .collection(
                            STORAGE_COLLECTION
                        )
                        .get();


                const batch =
                    db.batch();


                snapshot.forEach(
                    function (doc) {

                        batch.delete(
                            doc.ref
                        );

                    }
                );


                await batch.commit();


                selectedDate =
                    null;

                currentFilter =
                    "all";


                updateFilterButtons();

                updateSelectedDate();


                showMessage(
                    "All events deleted.",
                    "success"
                );

            } catch (error) {

                console.error(
                    "Could not delete events:",
                    error
                );

                showMessage(
                    "Could not delete the events.",
                    "error"
                );

            }

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
        .forEach(
            function (link) {

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

            }
        );

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

loadEvents();
