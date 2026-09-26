const events = [
    {
        id: "1",

        name: "ADTU Bodo Union Event",

        description:
            "ADTU Bodo Union event and activities.",

        photos:
            "https://drive.google.com/drive/u/0/folders/1sUWOsp7ex37ZWALa-06RYmQYFj0z4udw",

        videos:
            "https://drive.google.com/drive/u/0/folders/1hNPvv_pFfPU7bXUdp-57YF5n_EBkGu1X"
    }
];



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
// VARIABLES
// =====================================

let calendarDate = new Date();

let selectedDate = null;

let currentFilter = "all";


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
        () => {

            navigation.classList.toggle("active");

            const isOpen =
                navigation.classList.contains("active");

            menuButton.setAttribute(
                "aria-expanded",
                isOpen
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
// EVENT DATE
// =====================================

function getEventDateKey(dateValue) {

    return String(dateValue).slice(0, 10);

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
            `${getEventDateKey(dateValue)}T00:00:00`
        );

    if (Number.isNaN(date.getTime())) {
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
// FILTER EVENTS
// =====================================

function getFilteredEvents() {

    const today =
        getDateKey(new Date());


    if (currentFilter === "upcoming") {

        return events.filter(
            event =>
                getEventDateKey(event.date) >= today
        );

    }


    if (currentFilter === "past") {

        return events.filter(
            event =>
                getEventDateKey(event.date) < today
        );

    }


    if (currentFilter === "today") {

        return events.filter(
            event =>
                getEventDateKey(event.date) === today
        );

    }


    // ALL
    return events;

}


// =====================================
// SECURITY
// =====================================

function escapeHTML(value) {

    const div =
        document.createElement("div");

    div.textContent =
        value ?? "";

    return div.innerHTML;

}


function escapeAttribute(value) {

    return String(value ?? "")
        .replace(/&/g, "&amp;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;");

}


// =====================================
// EVENT PAGE URL
// =====================================

function getEventURL(event) {

    return (
        `events/event.html?id=${encodeURIComponent(
            event.id
        )}`
    );

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


    // -------------------------------------
    // NO EVENTS
    // -------------------------------------

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


    // -------------------------------------
    // EVENT CARDS
    // -------------------------------------

    eventsContainer.innerHTML =
        list.map(event => {

            const eventURL =
                getEventURL(event);


            return `

                <article class="event-card">

                    <div class="event-icon">
                        📅
                    </div>


                    <span class="section-label">
                        EVENT
                    </span>


                    <h3>
                        ${escapeHTML(event.name)}
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


                    <a
                        href="${escapeAttribute(
                            eventURL
                        )}"
                        class="view-button"
                    >
                        View Event →
                    </a>

                </article>

            `;

        }).join("");

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


    calendarTitle.textContent =
        calendarDate.toLocaleDateString(
            "en-IN",
            {
                month: "long",
                year: "numeric"
            }
        );


    calendarDays.innerHTML = "";


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


    const previousMonthDays =
        new Date(
            year,
            month,
            0
        ).getDate();


    // =====================================
    // PREVIOUS MONTH
    // =====================================

    for (
        let i = firstDay;
        i > 0;
        i--
    ) {

        const button =
            document.createElement("button");

        button.type = "button";

        button.className =
            "calendar-day other-month";

        button.textContent =
            previousMonthDays - i + 1;

        button.disabled = true;

        calendarDays.appendChild(button);

    }


    // =====================================
    // CURRENT MONTH
    // =====================================

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


        button.type = "button";

        button.className =
            "calendar-day";

        button.textContent =
            day;


        // -------------------------------------
        // TODAY
        // -------------------------------------

        if (
            dateKey ===
            getDateKey(new Date())
        ) {

            button.classList.add("today");

        }


        // -------------------------------------
        // SELECTED
        // -------------------------------------

        if (
            selectedDate === dateKey
        ) {

            button.classList.add("selected");

        }


        // -------------------------------------
        // MANUALLY ENTERED EVENT
        // -------------------------------------

        const hasEvent =
            events.some(
                event =>
                    getEventDateKey(
                        event.date
                    ) === dateKey
            );


        if (hasEvent) {

            button.classList.add("has-event");

        }


        // -------------------------------------
        // CLICK DATE
        // -------------------------------------

        button.addEventListener(
            "click",
            () => {

                selectDate(dateKey);

            }
        );


        calendarDays.appendChild(button);

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


    renderCalendar();


    // -------------------------------------
    // ONLY MANUALLY ENTERED EVENTS
    // FOR THIS DATE
    // -------------------------------------

    const selectedEvents =
        events.filter(
            event =>
                getEventDateKey(
                    event.date
                ) === dateKey
        );


    renderEvents(selectedEvents);

}


// =====================================
// PREVIOUS MONTH
// =====================================

if (prevMonthButton) {

    prevMonthButton.addEventListener(
        "click",
        () => {

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
        () => {

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
    button => {

        button.addEventListener(
            "click",
            () => {

                filterButtons.forEach(
                    item => {

                        item.classList.remove(
                            "active"
                        );

                    }
                );


                button.classList.add(
                    "active"
                );


                currentFilter =
                    button.dataset.filter;


                selectedDate = null;


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
// START
// =====================================

renderCalendar();

renderEvents();
