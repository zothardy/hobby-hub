const hobbyForm = document.getElementById("hobby-form");
const hobbyTitleInput = document.getElementById("hobby-title");
const hobbyDescriptionInput = document.getElementById("hobby-description");
const hobbyImageInput = document.getElementById("hobby-image");
const hobbyList = document.getElementById("hobby-list");
const hobbiesStorageKey = "hobbyHubCurrentHobbies";
const appearanceStorageKey = "hobbyHubAppearance";
const themeToggle = document.getElementById("theme-toggle");
const colorSchemeSelect = document.getElementById("color-scheme");

const appearance = loadAppearance();
applyAppearance();

function loadAppearance() {
    try {
        const saved = JSON.parse(localStorage.getItem(appearanceStorageKey));
        return {
            theme: saved && saved.theme === "dark" ? "dark" : "light",
            scheme: saved && ["forest", "ocean", "berry", "sunset"].includes(saved.scheme) ? saved.scheme : "forest"
        };
    } catch (error) {
        return { theme: "light", scheme: "forest" };
    }
}

function saveAppearance() {
    localStorage.setItem(appearanceStorageKey, JSON.stringify(appearance));
}

function applyAppearance() {
    document.documentElement.dataset.theme = appearance.theme;
    document.documentElement.dataset.scheme = appearance.scheme;
    const isDark = appearance.theme === "dark";
    themeToggle.textContent = isDark ? "☀" : "☾";
    themeToggle.setAttribute("aria-label", isDark ? "Switch to light mode" : "Switch to dark mode");
    themeToggle.title = isDark ? "Switch to light mode" : "Switch to dark mode";
    themeToggle.setAttribute("aria-pressed", String(isDark));
    colorSchemeSelect.value = appearance.scheme;
}

themeToggle.addEventListener("click", function() {
    appearance.theme = appearance.theme === "dark" ? "light" : "dark";
    saveAppearance();
    applyAppearance();
});

colorSchemeSelect.addEventListener("change", function() {
    appearance.scheme = colorSchemeSelect.value;
    saveAppearance();
    applyAppearance();
});

const sampleHobbies = [
    {
        title: "Hiking",
        description: "Exploring local trails and enjoying the outdoors.",
        events: []
    },
    {
        title: "Watercolor painting",
        description: "Practicing landscape paintings and color mixing.",
        events: []
    },
    {
        title: "Dungeons & Dragons",
        description: "Playing in a weekly tabletop campaign with friends.",
        events: [
            {
                id: "garden-grove-dd",
                title: "Dungeons & Dragons at Garden Grove SteelCraft",
                location: "Garden Grove SteelCraft",
                mapUrl: "https://www.google.com/maps/search/?api=1&query=Garden+Grove+SteelCraft,+Garden+Grove,+CA",
                dateTime: "2026-11-07T18:00"
            }
        ]
    }
];

function loadHobbies() {
    const savedHobbies = localStorage.getItem(hobbiesStorageKey);

    if (!savedHobbies) {
        return sampleHobbies;
    }

    try {
        const parsedHobbies = JSON.parse(savedHobbies);
        const isValid = Array.isArray(parsedHobbies) && parsedHobbies.every(function(hobby) {
            return hobby
                && typeof hobby.title === "string"
                && typeof hobby.description === "string"
                && Array.isArray(hobby.events);
        });
        return isValid ? parsedHobbies : sampleHobbies;
    } catch (error) {
        console.error("Unable to read saved hobbies.", error);
        return sampleHobbies;
    }
}

let hobbies = loadHobbies();

function saveHobbies() {
    localStorage.setItem(hobbiesStorageKey, JSON.stringify(hobbies));
}

function formatDateTime(dateTime) {
    if (!dateTime) {
        return "Date and time not set";
    }

    return new Date(dateTime).toLocaleString([], {
        dateStyle: "medium",
        timeStyle: "short"
    });
}

function getEventPageUrl(hobby, event) {
    const url = new URL(window.location.href);
    url.search = "";
    url.hash = "";
    url.searchParams.set("event", event.id || "shared-event");
    url.searchParams.set("hobby", hobby.title);
    url.searchParams.set("title", event.title);
    url.searchParams.set("location", event.location);
    url.searchParams.set("dateTime", event.dateTime);
    url.searchParams.set("mapUrl", event.mapUrl);
    return url.toString();
}

async function shareEvent(hobby, event, button) {
    const shareData = {
        title: event.title,
        text: event.title + " at " + event.location + " - " + formatDateTime(event.dateTime),
        url: getEventPageUrl(hobby, event)
    };
    try {
        if (navigator.share) {
            await navigator.share(shareData);
        } else {
            await navigator.clipboard.writeText(shareData.url);
            button.textContent = "Link copied";
            window.setTimeout(function() {
                button.textContent = "Share event";
            }, 1500);
        }
    } catch (error) {
        if (error.name !== "AbortError") {
            console.error("Unable to share event.", error);
        }
    }
}

function createEventForm(hobby, hobbyIndex) {
    const form = document.createElement("form");
    form.className = "event-form";
    form.noValidate = true;

    const fields = [
        { className: "event-title-field", label: "Event name", name: "title", type: "text", required: true },
        { className: "event-location-field", label: "Location", name: "location", type: "text", required: true },
        { className: "event-date-field", label: "Date and time", name: "dateTime", type: "datetime-local", required: true }
    ];

    fields.forEach(function(field) {
        const wrapper = document.createElement("div");
        const label = document.createElement("label");
        const input = document.createElement("input");
        wrapper.className = "form-field " + field.className;
        label.htmlFor = "event-" + hobbyIndex + "-" + field.name;
        label.textContent = field.label;
        input.id = label.htmlFor;
        input.name = field.name;
        input.type = field.type;
        input.required = field.required;
        if (field.placeholder) {
            input.placeholder = field.placeholder;
        }
        wrapper.append(label, input);
        form.append(wrapper);
    });

    const mapField = document.createElement("div");
    const mapLabel = document.createElement("label");
    const mapRow = document.createElement("div");
    const mapInput = document.createElement("input");
    const mapSearchButton = document.createElement("button");
    const mapPreview = document.createElement("iframe");
    mapField.className = "form-field event-map-field";
    mapLabel.htmlFor = "event-" + hobbyIndex + "-mapQuery";
    mapLabel.textContent = "Map link";
    mapRow.className = "map-search-row";
    mapInput.id = mapLabel.htmlFor;
    mapInput.name = "mapQuery";
    mapInput.type = "text";
    mapInput.placeholder = "Venue or address in Google Maps";
    mapInput.required = true;
    mapSearchButton.className = "map-search-button";
    mapSearchButton.type = "button";
    mapSearchButton.textContent = "Search map";
    mapPreview.className = "map-preview";
    mapPreview.title = "Google Maps preview";
    mapPreview.loading = "lazy";
    mapPreview.referrerPolicy = "no-referrer-when-downgrade";
    mapPreview.hidden = true;
    mapRow.append(mapInput, mapSearchButton);
    mapField.append(mapLabel, mapRow, mapPreview);
    form.append(mapField);

    function updateMapPreview() {
        const query = mapInput.value.trim();
        if (!query) {
            mapPreview.hidden = true;
            return;
        }
        mapPreview.hidden = false;
        mapPreview.src = "https://www.google.com/maps?q=" + encodeURIComponent(query) + "&output=embed";
    }

    mapSearchButton.addEventListener("click", updateMapPreview);
    mapInput.addEventListener("keydown", function(event) {
        if (event.key === "Enter") {
            event.preventDefault();
            updateMapPreview();
        }
    });

    const submitButton = document.createElement("button");
    submitButton.className = "add-button";
    submitButton.type = "submit";
    submitButton.textContent = "Add event";
    form.append(submitButton);

    form.addEventListener("submit", function(event) {
        event.preventDefault();
        const requiredInputs = [...form.querySelectorAll("[required]")];
        const missingInput = requiredInputs.find(function(input) {
            return !input.value.trim();
        });

        if (missingInput) {
            missingInput.reportValidity();
            missingInput.focus();
            return;
        }

        const formData = new FormData(form);
        const mapQuery = formData.get("mapQuery").trim();
        hobby.events.push({
            id: "event-" + Date.now(),
            title: formData.get("title").trim(),
            location: formData.get("location").trim(),
            mapUrl: "https://www.google.com/maps/search/?api=1&query=" + encodeURIComponent(mapQuery),
            dateTime: formData.get("dateTime")
        });
        saveHobbies();
        renderHobbies();
    });

    return form;
}

function renderEvent(event, hobby, hobbyIndex, eventIndex) {
    const item = document.createElement("li");
    const title = document.createElement("h4");
    const dateTime = document.createElement("p");
    const location = document.createElement("p");
    const actions = document.createElement("div");
    const mapLink = document.createElement("a");
    const shareButton = document.createElement("button");
    const removeButton = document.createElement("button");

    item.className = "event-card";
    title.textContent = event.title;
    dateTime.textContent = formatDateTime(event.dateTime);
    location.textContent = event.location;
    actions.className = "event-actions";

    mapLink.className = "map-link";
    mapLink.href = event.mapUrl;
    mapLink.target = "_blank";
    mapLink.rel = "noopener noreferrer";
    mapLink.textContent = "View location";

    shareButton.className = "share-button";
    shareButton.type = "button";
    shareButton.textContent = "Share event";
    shareButton.addEventListener("click", function() {
        shareEvent(hobby, event, shareButton);
    });

    removeButton.className = "remove-button";
    removeButton.type = "button";
    removeButton.textContent = "Remove";
    removeButton.addEventListener("click", function() {
        hobby.events.splice(eventIndex, 1);
        saveHobbies();
        renderHobbies();
    });

    actions.append(mapLink, shareButton);
    item.append(title, dateTime, location, actions, removeButton);
    return item;
}

function renderEventLanding() {
    const params = new URLSearchParams(window.location.search);
    if (!params.has("event") || !params.has("title")) {
        return false;
    }

    const hobbiesView = document.getElementById("hobbies-view");
    const landing = document.getElementById("event-landing");
    const content = document.getElementById("event-landing-content");
    const eventTitle = document.createElement("h2");
    const hobbyName = document.createElement("p");
    const dateTime = document.createElement("p");
    const location = document.createElement("p");
    const mapLink = document.createElement("a");

    eventTitle.id = "event-landing-title";
    eventTitle.textContent = params.get("title");
    hobbyName.className = "event-landing-hobby";
    hobbyName.textContent = params.get("hobby") || "HobbyHub event";
    dateTime.textContent = formatDateTime(params.get("dateTime"));
    location.textContent = params.get("location") || "Location not provided";
    mapLink.className = "map-link";
    mapLink.href = params.get("mapUrl") || "https://maps.google.com/";
    mapLink.target = "_blank";
    mapLink.rel = "noopener noreferrer";
    mapLink.textContent = "View location";

    content.replaceChildren(eventTitle, hobbyName, dateTime, location, mapLink);
    document.title = params.get("title") + " | HobbyHub";
    hobbiesView.hidden = true;
    landing.hidden = false;
    return true;
}

function renderHobbies() {
    hobbyList.replaceChildren();

    hobbies.forEach(function(hobby, hobbyIndex) {
        const item = document.createElement("li");
        const details = document.createElement("div");
        const title = document.createElement("h3");
        const description = document.createElement("p");
        const removeButton = document.createElement("button");
        const coverImage = document.createElement("img");
        const eventsDropdown = document.createElement("details");
        const eventsHeading = document.createElement("summary");
        const eventList = document.createElement("ul");

        item.className = "hobby-card" + (hobby.imageUrl ? " hobby-card-with-image" : "");
        details.className = "hobby-details";
        title.textContent = hobby.title;
        description.textContent = hobby.description;
        eventsDropdown.className = "events-dropdown";
        eventsHeading.textContent = "Events (" + hobby.events.length + ")";
        eventList.className = "event-list";

        if (hobby.imageUrl) {
            coverImage.className = "hobby-cover-image";
            coverImage.src = hobby.imageUrl;
            coverImage.alt = "";
            coverImage.loading = "lazy";
        }

        hobby.events.forEach(function(event, eventIndex) {
            eventList.append(renderEvent(event, hobby, hobbyIndex, eventIndex));
        });

        removeButton.className = "remove-button hobby-remove-button";
        removeButton.type = "button";
        removeButton.textContent = "Remove hobby";
        removeButton.addEventListener("click", function() {
            hobbies.splice(hobbyIndex, 1);
            saveHobbies();
            renderHobbies();
        });

        eventsDropdown.append(eventsHeading, eventList, createEventForm(hobby, hobbyIndex));
        details.append(title, description, removeButton, eventsDropdown);
        if (hobby.imageUrl) {
            item.append(coverImage, details);
        } else {
            item.append(details);
        }
        hobbyList.append(item);
    });
}

function addHobby(event) {
    event.preventDefault();
    const title = hobbyTitleInput.value.trim();
    const description = hobbyDescriptionInput.value.trim();
    const imageUrl = hobbyImageInput.value.trim();
    if (!title || !description) {
        return;
    }

    hobbies.push({ title: title, description: description, imageUrl: imageUrl, events: [] });
    saveHobbies();
    renderHobbies();
    hobbyForm.reset();
    hobbyTitleInput.focus();
}

if (!renderEventLanding()) {
    renderHobbies();
    hobbyForm.addEventListener("submit", addHobby);
}
