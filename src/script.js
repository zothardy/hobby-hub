const hobbyForm = document.getElementById("hobby-form");
const hobbyTitleInput = document.getElementById("hobby-title");
const hobbyDescriptionInput = document.getElementById("hobby-description");
const hobbyImageInput = document.getElementById("hobby-image");
const hobbyList = document.getElementById("hobby-list");
const hobbiesStorageKey = "hobbyHubCurrentHobbies";
const appearanceStorageKey = "hobbyHubAppearance";
const themeToggle = document.getElementById("theme-toggle");
const colorSchemeSelect = document.getElementById("color-scheme");

const supabaseUrl = "https://qceemfcukiqysbshipao.supabase.co";
const supabaseAnonKey = "sb_publishable_4m08UL06yaVSmfOosnJA5Q_37zwACJK";

const hobbyHubSupabase = window.supabase.createClient(
    supabaseUrl,
    supabaseAnonKey
);

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
                mapQuery: "Garden Grove SteelCraft, Garden Grove, CA",
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
        return "Date not set";
    }

    return new Date(dateTime).toLocaleString([], {
        dateStyle: "medium",
        timeStyle: "short"
    });
}

function encodeEventToken(payload) {
    const bytes = new TextEncoder().encode(JSON.stringify(payload));
    let binary = "";
    bytes.forEach(function(byte) {
        binary += String.fromCharCode(byte);
    });
    return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function decodeEventToken(token) {
    const base64 = token.replace(/-/g, "+").replace(/_/g, "/");
    const padded = base64.padEnd(Math.ceil(base64.length / 4) * 4, "=");
    const binary = atob(padded);
    const bytes = Uint8Array.from(binary, function(character) {
        return character.charCodeAt(0);
    });
    return JSON.parse(new TextDecoder().decode(bytes));
}

function getMapQuery(event) {
    if (event.mapQuery) {
        return event.mapQuery;
    }

    if (event.mapUrl) {
        try {
            return new URL(event.mapUrl).searchParams.get("query") || "";
        } catch (error) {
            return "";
        }
    }

    return "";
}

function getEventPageUrl(hobby, event) {
    const payload = {
        e: event.id || "shared-event",
        h: hobby.title,
        t: event.title,
        l: event.location,
        d: event.dateTime,
        q: getMapQuery(event),
        i: hobby.imageUrl || ""
    };
    const url = new URL(window.location.href);
    url.search = "";
    url.hash = "e=" + encodeEventToken(payload);
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
        { className: "event-date-field", label: "Date and time (optional)", name: "dateTime", type: "datetime-local", required: false }
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

    const formActions = document.createElement("div");
    const testButton = document.createElement("button");
    const submitButton = document.createElement("button");
    formActions.className = "form-actions";
    testButton.className = "test-button";
    testButton.type = "button";
    testButton.textContent = "Test";
    testButton.addEventListener("click", function() {
        form.elements.title.value = "Board Game Night";
        form.elements.location.value = "The Park";
        form.elements.dateTime.value = "2026-11-07T18:00";
        form.elements.mapQuery.value = "Garden Grove Regional Park, Garden Grove, CA";
        updateMapPreview();
    });
    submitButton.className = "add-button";
    submitButton.type = "submit";
    submitButton.textContent = "Add event";
    formActions.append(testButton, submitButton);
    form.append(formActions);

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
            mapQuery: mapQuery,
            mapUrl: "https://www.google.com/maps/search/?api=1&query=" + encodeURIComponent(mapQuery),
            dateTime: formData.get("dateTime")
        });
        saveHobbies();
        refreshCurrentHobbyPage();
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
    const viewEventLink = document.createElement("a");
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

    viewEventLink.className = "map-link";
    viewEventLink.href = getEventPageUrl(hobby, event);
    viewEventLink.textContent = "View event";

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
        refreshCurrentHobbyPage();
    });

    actions.append(mapLink, viewEventLink, shareButton);
    item.append(title, dateTime, location, actions, removeButton);
    return item;
}

async function renderEventLanding() {
    let params = null;
    const fragmentParams = new URLSearchParams(window.location.hash.slice(1));
    if (fragmentParams.has("e")) {
        try {
            const token = decodeEventToken(fragmentParams.get("e"));
            params = {
                event: token.e,
                hobby: token.h,
                title: token.t,
                location: token.l,
                dateTime: token.d,
                imageUrl: token.i || "",
                mapUrl: "https://www.google.com/maps/search/?api=1&query=" + encodeURIComponent(token.q || token.l || "")
            };
        } catch (error) {
            console.error("Unable to decode shared event.", error);
            return false;
        }
    } else {
        const queryParams = new URLSearchParams(window.location.search);
        if (queryParams.has("event") && queryParams.has("title")) {
            params = Object.fromEntries(queryParams.entries());
        }
    }

    if (!params) {
        return false;
    }

    const hobbiesView = document.getElementById("hobbies-view");
    const landing = document.getElementById("event-landing");
    const content = document.getElementById("event-landing-content");
    const coverImage = document.createElement("img");
    const eventTitle = document.createElement("h2");
    const hobbyName = document.createElement("p");
    const dateTime = document.createElement("p");
    const location = document.createElement("p");
    const actions = document.createElement("div");
    const mapLink = document.createElement("a");
    const backToHobbyLink = document.createElement("a");

    eventTitle.id = "event-landing-title";
    eventTitle.textContent = params.title;
    hobbyName.className = "event-landing-hobby";
    hobbyName.textContent = params.hobby || "HobbyHub event";
    dateTime.textContent = formatDateTime(params.dateTime);
    location.textContent = params.location || "Location not provided";
    if (params.imageUrl) {
        coverImage.className = "landing-cover-image";
        coverImage.src = params.imageUrl;
        coverImage.alt = params.hobby || "Hobby cover image";
    }
    mapLink.className = "map-link";
    mapLink.href = params.mapUrl || "https://maps.google.com/";
    mapLink.target = "_blank";
    mapLink.rel = "noopener noreferrer";
    mapLink.textContent = "View location";
    actions.className = "event-actions";

    backToHobbyLink.className = "back-link back-to-hobby";
    backToHobbyLink.href = "#hobby=" + encodeURIComponent(params.hobby || "");
    backToHobbyLink.textContent = "Back to " + (params.hobby || "hobby");
    actions.append(backToHobbyLink, mapLink);

    const landingItems = [coverImage, eventTitle, hobbyName, dateTime, location, actions];
    content.replaceChildren(...landingItems.filter(function(element) {
        return element !== coverImage || params.imageUrl;
    }));
    document.title = params.title + " | HobbyHub";
    hobbiesView.hidden = true;
    landing.hidden = false;
    return true;
}

function getHobbyHash(hobby) {
    return "#hobby=" + encodeURIComponent(hobby.title);
}

function refreshCurrentHobbyPage() {
    const hashParams = new URLSearchParams(window.location.hash.slice(1));
    if (!hashParams.has("hobby")) {
        renderHobbies();
        return;
    }

    const hobbyTitle = hashParams.get("hobby");
    const hobbyIndex = hobbies.findIndex(function(hobby) {
        return hobby.title === hobbyTitle;
    });
    window.requestAnimationFrame(function() {
        renderHobbyDetail(hobbyIndex);
    });
}

function renderHobbyDetail(hobbyIndex) {
    const hobby = hobbies[hobbyIndex];
    if (!hobby) {
        return false;
    }

    const content = document.getElementById("hobby-detail-content");
    const title = document.createElement("h2");
    const coverImage = document.createElement("img");
    const description = document.createElement("p");
    const removeButton = document.createElement("button");
    const eventsDropdown = document.createElement("details");
    const eventsHeading = document.createElement("summary");
    const eventList = document.createElement("ul");

    title.id = "hobby-detail-title";
    title.textContent = hobby.title;
    if (hobby.imageUrl) {
        coverImage.className = "detail-cover-image";
        coverImage.src = hobby.imageUrl;
        coverImage.alt = "";
        coverImage.loading = "lazy";
    }
    description.className = "hobby-description-full";
    description.textContent = hobby.description;
    eventsDropdown.className = "events-dropdown";
    eventsDropdown.open = true;
    eventsHeading.textContent = "Events (" + hobby.events.length + ")";
    eventList.className = "event-list";

    hobby.events.forEach(function(event, eventIndex) {
        eventList.append(renderEvent(event, hobby, hobbyIndex, eventIndex));
    });

    removeButton.className = "remove-button hobby-remove-button";
    removeButton.type = "button";
    removeButton.textContent = "Remove hobby";
    removeButton.addEventListener("click", function() {
        hobbies.splice(hobbyIndex, 1);
        saveHobbies();
        window.location.hash = "";
        renderHobbies();
    });

    eventsDropdown.append(eventsHeading, eventList, createEventForm(hobby, hobbyIndex));
    const detailItems = [coverImage, title, description, removeButton, eventsDropdown];
    content.replaceChildren(...detailItems.filter(function(element) {
        return element !== coverImage || hobby.imageUrl;
    }));
    document.title = hobby.title + " | HobbyHub";
    document.getElementById("hobbies-view").hidden = true;
    document.getElementById("event-landing").hidden = true;
    document.getElementById("hobby-detail").hidden = false;
    return true;
}

function renderHobbies() {
    hobbyList.replaceChildren();

    hobbies.forEach(function(hobby, hobbyIndex) {
        const item = document.createElement("li");
        const cardLink = document.createElement("a");
        const title = document.createElement("h3");
        const coverImage = document.createElement("img");

        item.className = "hobby-card hobby-card-summary" + (hobby.imageUrl ? " hobby-card-with-image" : "");
        cardLink.className = "hobby-card-link";
        cardLink.href = getHobbyHash(hobby);
        title.textContent = hobby.title;
        cardLink.addEventListener("click", function(clickEvent) {
            clickEvent.preventDefault();
            window.location.hash = "hobby=" + encodeURIComponent(hobby.title);
        });

        if (hobby.imageUrl) {
            coverImage.className = "hobby-cover-image";
            coverImage.src = hobby.imageUrl;
            coverImage.alt = "";
            coverImage.loading = "lazy";
            cardLink.append(coverImage);
        }
        cardLink.append(title);
        item.append(cardLink);
        hobbyList.append(item);
    });
}

const testHobbyButton = document.getElementById("test-hobby-button");
if (testHobbyButton) {
    testHobbyButton.addEventListener("click", function() {
        hobbyTitleInput.value = "Board Games";
        hobbyDescriptionInput.value = "A weekly group for testing new board games, sharing strategies, and meeting friends.";
        hobbyImageInput.value = "https://images.unsplash.com/photo-1610890716171-6b1bb98ffd09?auto=format&fit=crop&w=1200&q=80";
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

function initializePage() {
    const hashParams = new URLSearchParams(window.location.hash.slice(1));

    if (hashParams.has("hobby")) {
        const hobbyTitle = hashParams.get("hobby");
        const hobbyIndex = hobbies.findIndex(function(hobby) {
            return hobby.title === hobbyTitle;
        });
        document.getElementById("hobbies-view").hidden = true;
        document.getElementById("event-landing").hidden = true;
        renderHobbyDetail(hobbyIndex);
        return;
    }

    if (hashParams.has("e") || new URLSearchParams(window.location.search).has("event")) {
        document.getElementById("hobbies-view").hidden = true;
        document.getElementById("hobby-detail").hidden = true;
        renderEventLanding();
        return;
    }

    document.getElementById("event-landing").hidden = true;
    document.getElementById("hobby-detail").hidden = true;
    document.getElementById("hobbies-view").hidden = false;

    renderEventLanding().then(function(isEventLanding) {
        if (!isEventLanding) {
            renderHobbies();
            hobbyForm.removeEventListener("submit", addHobby);
            hobbyForm.addEventListener("submit", addHobby);
        }
    });
}

async function signIn(email, password) {
  const { data, error } = await hobbyHubSupabase.auth.signInWithPassword({
    email,
    password
  });

  console.log(data, error);
  return error;
}

window.addEventListener("hashchange", initializePage);
initializePage();
