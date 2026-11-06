const hobbyForm = document.getElementById("hobby-form");
const hobbyTitleInput = document.getElementById("hobby-title");
const hobbyDescriptionInput = document.getElementById("hobby-description");
const hobbyImageInput = document.getElementById("hobby-image");
const hobbyList = document.getElementById("hobby-list");
const hobbiesStorageKey = "hobbyHubCurrentHobbies";
const appearanceStorageKey = "hobbyHubAppearance";
const themeToggle = document.getElementById("theme-toggle");
const colorSchemeSelect = document.getElementById("color-scheme");
const loginForm = document.getElementById("login-form");
const signupForm = document.getElementById("signup-form");
const signOutButton = document.getElementById("sign-out-button");
const authNavigation = document.getElementById("auth-navigation");
const authStatus = document.getElementById("auth-status");
const signedInControls = document.getElementById("signed-in-controls");
const accountProfileLink = document.getElementById("account-profile-link");

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

const testHobbies = [
    {
        title: "Board Games",
        description: "A weekly group for testing new board games, sharing strategies, and meeting friends.",
        imageUrl: "https://images.unsplash.com/photo-1610890716171-6b1bb98ffd09?auto=format&fit=crop&w=1200&q=80"
    },
    {
        title: "Photography",
        description: "Explore local streets, parks, and changing light while practicing everyday photography.",
        imageUrl: "https://images.unsplash.com/photo-1452780212940-6f5c0d14d848?auto=format&fit=crop&w=1200&q=80"
    },
    {
        title: "Cooking",
        description: "Try new recipes, share favorite meals, and build a collection of dishes worth making again.",
        imageUrl: "https://images.unsplash.com/photo-1556911220-bff31c812dba?auto=format&fit=crop&w=1200&q=80"
    },
    {
        title: "Gardening",
        description: "Grow flowers, herbs, and vegetables while learning what thrives in each season.",
        imageUrl: "https://images.unsplash.com/photo-1416879595882-3373a0480b5b?auto=format&fit=crop&w=1200&q=80"
    }
];

const sampleHobbies = [
    {
        id: "sample-gaming",
        title: "Gaming",
        description: "A community for tabletop, console, PC, handheld, and retro gaming. Share recommendations, organize sessions, swap strategies, and find people for the next adventure.",
        imageUrl: "https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&w=1200&q=80",
        readOnly: true,
        events: []
    },
    {
        id: "sample-reading",
        title: "Reading",
        description: "Discuss books, share reading lists, trade recommendations, and join conversations across genres, authors, and formats.",
        imageUrl: "https://images.unsplash.com/photo-1495446815901-a7297e633e8d?auto=format&fit=crop&w=1200&q=80",
        readOnly: true,
        events: []
    },
    {
        id: "sample-dungeons-dragons-default",
        title: "Dungeons and Dragons",
        description: "Build adventures, find campaigns, share characters, discuss rules, and gather a welcoming table for stories worth remembering.",
        imageUrl: "https://images.unsplash.com/photo-1610890716171-6b1bb98ffd09?auto=format&fit=crop&w=1200&q=80",
        readOnly: true,
        events: []
    },
    {
        id: "sample-camping",
        title: "Camping",
        description: "Plan trips, compare campsites, discuss gear and outdoor skills, and share the places, meals, and moments that make time outside memorable.",
        imageUrl: "https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?auto=format&fit=crop&w=1200&q=80",
        readOnly: true,
        events: []
    },
    {
        id: "sample-hiking",
        title: "Hiking",
        description: "Weekend hikes are a chance to reset, explore nearby trails, and notice the changing seasons.\n\nFavorite outings include ridge walks, shaded canyon trails, waterfall loops, and easy sunrise routes. Gear stays simple: comfortable shoes, plenty of water, snacks, a map, sun protection, and a willingness to turn around when the weather changes.\n\nA good goal is to build consistency without making every hike competitive. Some days are for distance, while others are for birdwatching, photography, geology, or walking slowly with friends.",
        imageUrl: "https://images.unsplash.com/photo-1551632811-561732d1e306?auto=format&fit=crop&w=1200&q=80",
        readOnly: true,
        events: [
            {
                id: "sample-hiking-event",
                title: "Saturday Morning Trail Walk",
                location: "The Canyon Trail",
                mapQuery: "Crystal Cove State Park, Laguna Beach, CA",
                mapUrl: "https://www.google.com/maps/search/?api=1&query=Crystal+Cove+State+Park,+Laguna+Beach,+CA",
                dateTime: "2026-11-14T08:00"
            }
        ]
    },
    {
        id: "sample-watercolor",
        title: "Watercolor painting",
        description: "Watercolor is a relaxed way to study light, color, and composition without needing a large studio. Simple studies often begin with a small palette, a little reference photo, and one subject that feels interesting for the day.\n\nThis hobby space is for botanical sketches, neighborhood scenes, quick color tests, travel journal pages, and intentional experiments with blooms and washes. Mistakes can become texture, and unfinished studies are useful practice rather than failed projects.",
        imageUrl: "https://images.unsplash.com/photo-1547891654-e66ed7ebb968?auto=format&fit=crop&w=1200&q=80",
        readOnly: true,
        events: [
            {
                id: "sample-watercolor-event",
                title: "Paint-and-Sketch Morning",
                location: "The Garden Studio",
                mapQuery: "Fullerton Arboretum, Fullerton, CA",
                mapUrl: "https://www.google.com/maps/search/?api=1&query=Fullerton+Arboretum,+Fullerton,+CA",
                dateTime: "2026-11-15T10:00"
            }
        ]
    },
    {
        id: "sample-dungeons-dragons",
        title: "Dungeons & Dragons",
        description: "A cooperative tabletop campaign built around storytelling, improvisation, and shared laughs. Sessions mix exploration, character choices, puzzles, memorable non-player characters, and spontaneous moments that become part of the group's history.\n\nCharacter notes live alongside session summaries, house rules, favorite spells, maps, snacks, and plans for the next adventure. The goal is not simply to win; it is to build a welcoming world that everyone looks forward to visiting.",
        imageUrl: "https://images.unsplash.com/photo-1610890716171-6b1bb98ffd09?auto=format&fit=crop&w=1200&q=80",
        readOnly: true,
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
let publicHobbies = sampleHobbies.filter(function(hobby) { return !hobby.personal; });
let hobbiesViewMode = "mine";
let currentUser = null;
let currentUserProfile = null;

function saveHobbies() {
    if (currentUser) {
        syncHobbiesToSupabase().catch(function(error) {
            authStatus.textContent = "Unable to save hobbies: " + error.message;
        });
        return;
    }

    localStorage.setItem(hobbiesStorageKey, JSON.stringify(hobbies));
}

async function loadHobbiesFromSupabase() {
    const loadingUserId = currentUser.id;
    const { data: hobbyRows, error: hobbyError } = await hobbyHubSupabase
        .from("hobbies")
        .select("id,title,description,image_url,is_public,owner_role")
        .eq("user_id", loadingUserId)
        .order("created_at", { ascending: true });

    if (hobbyError) {
        throw hobbyError;
    }
    if (!currentUser || currentUser.id !== loadingUserId) {
        return;
    }

    const { data: browserRows, error: browserError } = await hobbyHubSupabase
        .from("hobbies")
        .select("id,user_id,title,description,image_url,is_public,owner_role")
        .eq("is_public", true);

    if (browserError) {
        throw browserError;
    }

    const databasePublicHobbies = (browserRows || []).map(function(hobby) {
        return {
            id: hobby.id,
            title: hobby.title,
            description: hobby.description,
            imageUrl: hobby.image_url || "",
            visibility: "public",
            ownerId: hobby.user_id,
            ownerRole: hobby.owner_role || "admin",
            events: []
        };
    });
    publicHobbies = [...sampleHobbies.filter(function(hobby) { return !hobby.personal; }), ...databasePublicHobbies.filter(function(hobby) {
        return !sampleHobbies.some(function(sample) { return sample.title.toLowerCase() === hobby.title.toLowerCase(); });
    })];

    const { data: eventRows, error: eventError } = await hobbyHubSupabase
        .from("events")
        .select("id,share_id,hobby_id,title,hobby_title,location,map_query,map_url,starts_at,image_url,is_public")
        .eq("user_id", loadingUserId)
        .order("created_at", { ascending: true });

    if (eventError) {
        throw eventError;
    }

    if (!currentUser || currentUser.id !== loadingUserId) {
        return;
    }

    hobbies = (hobbyRows || []).map(function(hobby) {
        return {
            id: hobby.id,
            title: hobby.title,
            description: hobby.description,
            imageUrl: hobby.image_url || "",
            visibility: hobby.is_public === false ? "personal" : "public",
            events: (eventRows || []).filter(function(event) {
                return event.hobby_id === hobby.id;
            }).map(function(event) {
                return {
                    id: event.share_id || event.id,
                    title: event.title,
                    location: event.location,
                    mapQuery: event.map_query || "",
                    mapUrl: event.map_url || "",
                    dateTime: event.starts_at ? event.starts_at.slice(0, 16) : "",
                    shareId: event.share_id || event.id,
                    isPrivate: event.is_public === false
                };
            })
        };
    });
    renderHobbies();
}

async function syncHobbiesToSupabase() {
    if (!currentUser) {
        return;
    }

    const { error: deleteError } = await hobbyHubSupabase
        .from("hobbies")
        .delete()
        .eq("user_id", currentUser.id);

    if (deleteError) {
        throw deleteError;
    }

    if (hobbies.length === 0) {
        return;
    }

    const { data: savedHobbies, error: hobbyError } = await hobbyHubSupabase
        .from("hobbies")
        .insert(hobbies.map(function(hobby) {
            return {
                user_id: currentUser.id,
                title: hobby.title,
                description: hobby.description,
                image_url: hobby.imageUrl || null,
                is_public: hobby.visibility !== "personal"
            };
        }))
        .select("id,title");

    if (hobbyError) {
        throw hobbyError;
    }

    const eventsToInsert = [];
    savedHobbies.forEach(function(savedHobby) {
        const localHobby = hobbies.find(function(hobby) {
            return hobby.title === savedHobby.title;
        });
        if (!localHobby) {
            return;
        }
        localHobby.events.forEach(function(event) {
            eventsToInsert.push({
                user_id: currentUser.id,
                hobby_id: savedHobby.id,
                title: event.title,
                hobby_title: localHobby.title,
                location: event.location,
                map_query: event.mapQuery || "",
                map_url: event.mapUrl || "",
                starts_at: event.dateTime || null,
                image_url: localHobby.imageUrl || null,
                is_public: !event.isPrivate
            });
        });
    });

    if (eventsToInsert.length > 0) {
        const { error: eventError } = await hobbyHubSupabase.from("events").insert(eventsToInsert);
        if (eventError) {
            throw eventError;
        }
    }
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
    const url = new URL(window.location.href);
    url.search = "";
    url.hash = "";
    url.searchParams.set("event", event.shareId || event.id || "shared-event");
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

    const privacyField = document.createElement("div");
    const privacyLabel = document.createElement("label");
    const privacyInput = document.createElement("input");
    privacyField.className = "form-field event-privacy-field";
    privacyLabel.className = "tooltip-label";
    privacyInput.type = "checkbox";
    privacyInput.name = "private";
    privacyInput.id = "event-" + hobbyIndex + "-private";
    privacyLabel.htmlFor = privacyInput.id;
    privacyLabel.textContent = "Private ";
    const tooltip = document.createElement("span");
    tooltip.className = "tooltip";
    tooltip.tabIndex = 0;
    tooltip.textContent = "?";
    tooltip.setAttribute("aria-label", "This event will be personal to you and those that you share the link to.");
    privacyLabel.append(tooltip);
    privacyField.append(privacyLabel, privacyInput);
    form.append(privacyField);

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
            dateTime: formData.get("dateTime"),
            isPrivate: formData.get("private") === "on"
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
    removeButton.hidden = Boolean(hobby.readOnly && !currentUser);
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
        if (queryParams.has("event") && !queryParams.has("title")) {
            const shareId = queryParams.get("event");
            const { data: sharedEvent, error } = await hobbyHubSupabase
                .from("events")
                .select("share_id,title,hobby_title,location,map_query,map_url,starts_at,image_url")
                .eq("share_id", shareId)
                .maybeSingle();
            if (error) {
                console.error("Unable to load shared event.", error);
            } else if (sharedEvent) {
                params = {
                    event: sharedEvent.share_id,
                    hobby: sharedEvent.hobby_title,
                    title: sharedEvent.title,
                    location: sharedEvent.location,
                    dateTime: sharedEvent.starts_at,
                    mapUrl: sharedEvent.map_url || "https://www.google.com/maps/search/?api=1&query=" + encodeURIComponent(sharedEvent.map_query || sharedEvent.location),
                    imageUrl: sharedEvent.image_url || ""
                };
            }
        } else if (queryParams.has("event") && queryParams.has("title")) {
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

async function createHobbyForum(hobby) {
    const forum = document.createElement("section");
    forum.className = "hobby-forum";
    const heading = document.createElement("h3");
    heading.textContent = "Community forum";
    const list = document.createElement("div");
    list.className = "forum-thread-list";
    forum.append(heading, list);

    let threads = [];
    const localForumKey = "hobbyHubForum:" + (hobby.id || hobby.title);
    if (!currentUser || String(hobby.id || "").startsWith("sample-")) {
        try { threads = JSON.parse(localStorage.getItem(localForumKey)) || []; }
        catch (error) { threads = []; }
    } else {
        try {
            const { data, error } = await hobbyHubSupabase
                .from("hobby_threads")
                .select("id,title,created_at")
                .eq("hobby_id", hobby.id)
                .order("created_at", { ascending: false });
            if (error) throw error;
            threads = data || [];
            for (const thread of threads) {
                const { data: replies } = await hobbyHubSupabase
                    .from("hobby_posts")
                    .select("id,body,author_id,created_at")
                    .eq("thread_id", thread.id)
                    .order("created_at", { ascending: true });
                thread.posts = replies || [];
            }
        } catch (error) {
            list.textContent = "The forum is available when the latest database migration is installed.";
        }
    }

    function saveLocalThreads() {
        localStorage.setItem(localForumKey, JSON.stringify(threads));
    }

    function renderThreads() {
        list.replaceChildren();
        if (threads.length === 0) {
            const empty = document.createElement("p");
            empty.className = "forum-empty";
            empty.textContent = "Start the first conversation in this hobby.";
            list.append(empty);
        }
        threads.forEach(function(thread) {
            const article = document.createElement("article");
            article.className = "forum-thread";
            const title = document.createElement("h4");
            title.textContent = thread.title;
            article.append(title);
            (thread.posts || []).forEach(function(post) {
                const reply = document.createElement("p");
                reply.className = "forum-post";
                reply.textContent = post.body;
                article.append(reply);
            });
            if (currentUser) {
                const replyForm = document.createElement("form");
                replyForm.className = "forum-reply-form";
                const replyInput = document.createElement("textarea");
                replyInput.rows = 2;
                replyInput.required = true;
                replyInput.placeholder = "Add to the conversation…";
                const replyButton = document.createElement("button");
                replyButton.className = "add-button";
                replyButton.type = "submit";
                replyButton.textContent = "Reply";
                replyForm.append(replyInput, replyButton);
                replyForm.addEventListener("submit", async function(event) {
                    event.preventDefault();
                    const body = replyInput.value.trim();
                    if (!body) return;
                    if (String(hobby.id || "").startsWith("sample-")) {
                        thread.posts = thread.posts || [];
                        thread.posts.push({ body: body });
                        saveLocalThreads();
                        renderThreads();
                    } else {
                        const { error } = await hobbyHubSupabase.from("hobby_posts").insert({
                            thread_id: thread.id,
                            author_id: currentUser.id,
                            body: body
                        });
                        if (error) { authStatus.textContent = "Unable to add reply: " + error.message; return; }
                        await renderForum();
                    }
                });
                article.append(replyForm);
            }
            list.append(article);
        });
    }

    async function renderForum() {
        if (!String(hobby.id || "").startsWith("sample-") && currentUser) {
            const { data } = await hobbyHubSupabase.from("hobby_threads").select("id,title,created_at").eq("hobby_id", hobby.id).order("created_at", { ascending: false });
            threads = data || [];
            for (const thread of threads) {
                const { data: replies } = await hobbyHubSupabase.from("hobby_posts").select("id,body,author_id,created_at").eq("thread_id", thread.id).order("created_at", { ascending: true });
                thread.posts = replies || [];
            }
        }
        renderThreads();
    }

    if (currentUser) {
        const newThreadForm = document.createElement("form");
        newThreadForm.className = "forum-thread-form";
        const titleInput = document.createElement("input");
        titleInput.type = "text";
        titleInput.required = true;
        titleInput.maxLength = 160;
        titleInput.placeholder = "Start a new discussion";
        const postInput = document.createElement("textarea");
        postInput.rows = 3;
        postInput.required = true;
        postInput.placeholder = "What would you like to discuss?";
        const submitButton = document.createElement("button");
        submitButton.className = "add-button";
        submitButton.type = "submit";
        submitButton.textContent = "Post discussion";
        newThreadForm.append(titleInput, postInput, submitButton);
        newThreadForm.addEventListener("submit", async function(event) {
            event.preventDefault();
            if (String(hobby.id || "").startsWith("sample-")) {
                threads.unshift({ title: titleInput.value.trim(), posts: [{ body: postInput.value.trim() }] });
                saveLocalThreads();
                renderThreads();
                newThreadForm.reset();
                return;
            }
            const { data: createdThread, error } = await hobbyHubSupabase.from("hobby_threads")
                .insert({ hobby_id: hobby.id, author_id: currentUser.id, title: titleInput.value.trim() })
                .select("id")
                .single();
            if (error) { authStatus.textContent = "Unable to create discussion: " + error.message; return; }
            const { error: postError } = await hobbyHubSupabase.from("hobby_posts")
                .insert({ thread_id: createdThread.id, author_id: currentUser.id, body: postInput.value.trim() });
            if (postError) { authStatus.textContent = "Discussion created, but the opening post failed: " + postError.message; return; }
            newThreadForm.reset();
            await renderForum();
        });
        forum.append(newThreadForm);
    } else {
        const signInPrompt = document.createElement("p");
        signInPrompt.className = "forum-empty";
        signInPrompt.textContent = "Log in to start discussions and reply.";
        forum.append(signInPrompt);
    }
    renderThreads();
    return forum;
}

function findHobbyByTitle(title) {
    return [...hobbies, ...publicHobbies].find(function(hobby) {
        return hobby.title.toLowerCase() === String(title || "").toLowerCase();
    });
}

async function renderHobbyDetail(hobbyIndex) {
    const hobby = hobbies[hobbyIndex] || findHobbyByTitle(new URLSearchParams(window.location.hash.slice(1)).get("hobby"));
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
    removeButton.hidden = Boolean(hobby.readOnly && !currentUser);
    removeButton.addEventListener("click", function() {
        hobbies.splice(hobbyIndex, 1);
        saveHobbies();
        window.location.hash = "";
        renderHobbies();
    });

    eventsDropdown.append(eventsHeading, eventList);
    if (!hobby.readOnly || currentUser) {
        eventsDropdown.append(createEventForm(hobby, hobbyIndex));
    }
    const detailItems = (!hobby.readOnly || currentUser)
        ? [coverImage, title, description, removeButton, eventsDropdown]
        : [coverImage, title, description, eventsDropdown];
    const visibleDetailItems = detailItems.filter(function(element) {
        return element !== coverImage || hobby.imageUrl;
    });
    visibleDetailItems.push(await createHobbyForum(hobby));
    content.replaceChildren(...visibleDetailItems.filter(function(element) {
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
    const browsing = hobbiesViewMode === "browse";
    const visibleHobbies = browsing ? publicHobbies : hobbies.filter(function(hobby) {
        return hobby.visibility !== "personal" || !hobby.joined || hobby.ownerId === currentUser?.id;
    });
    document.getElementById("current-hobbies-heading").textContent = browsing ? "Hobby browser" : "My hobbies";
    document.getElementById("hobbies-view-description").textContent = browsing
        ? "Discover public communities and join the ones you enjoy."
        : "Your collection of hobbies joined and created.";
    document.getElementById("my-hobbies-nav")?.classList.toggle("active", !browsing);
    document.getElementById("hobby-browser-nav")?.classList.toggle("active", browsing);

    visibleHobbies.forEach(function(hobby, hobbyIndex) {
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
        if (browsing && currentUser) {
            const joinButton = document.createElement("button");
            const alreadyJoined = hobbies.some(function(joined) { return joined.id === hobby.id; });
            joinButton.className = alreadyJoined ? "remove-button" : "add-button";
            joinButton.type = "button";
            joinButton.textContent = alreadyJoined ? "Leave hobby" : "Join hobby";
            joinButton.addEventListener("click", function() {
                if (alreadyJoined) {
                    hobbies = hobbies.filter(function(joined) { return joined.id !== hobby.id; });
                } else {
                    hobbies.push({ ...hobby, joined: true, events: hobby.events || [] });
                }
                saveHobbies();
                renderHobbies();
            });
            item.append(joinButton);
        }
        hobbyList.append(item);
    });
}

const testHobbyButton = document.getElementById("test-hobby-button");
const removeAllHobbiesButton = document.getElementById("remove-all-hobbies-button");
let testHobbyIndex = 0;
if (testHobbyButton) {
    testHobbyButton.addEventListener("click", function() {
        const testHobby = testHobbies[testHobbyIndex % testHobbies.length];
        hobbyTitleInput.value = testHobby.title;
        hobbyDescriptionInput.value = testHobby.description;
        hobbyImageInput.value = testHobby.imageUrl;
        testHobbyIndex += 1;
    });
}
document.getElementById("my-hobbies-nav")?.addEventListener("click", function() {
    hobbiesViewMode = "mine";
    renderHobbies();
});
document.getElementById("hobby-browser-nav")?.addEventListener("click", function() {
    hobbiesViewMode = "browse";
    renderHobbies();
});
if (removeAllHobbiesButton) {
    removeAllHobbiesButton.addEventListener("click", function() {
        hobbies = [];
        saveHobbies();
        renderHobbies();
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

    const visibility = new FormData(hobbyForm).get("visibility") === "personal" ? "personal" : "public";
    hobbies.push({ title: title, description: description, imageUrl: imageUrl, visibility: visibility, events: [] });
    saveHobbies();
    renderHobbies();
    hobbyForm.reset();
    hobbyTitleInput.focus();
}

function initializePage() {
    const hashParams = new URLSearchParams(window.location.hash.slice(1));
    const loginPage = document.getElementById("login-page");
    const signupPage = document.getElementById("signup-page");
    loginPage.hidden = !hashParams.has("login") || Boolean(currentUser);
    signupPage.hidden = !hashParams.has("signup") || Boolean(currentUser);

    if (hashParams.has("login") || hashParams.has("signup")) {
        document.getElementById("hobbies-view").hidden = true;
        document.getElementById("hobby-detail").hidden = true;
        document.getElementById("event-landing").hidden = true;
        document.getElementById("profile-page").hidden = true;
        document.getElementById("welcome-landing").hidden = true;
        return;
    }

    if (hashParams.has("profile") && currentUser) {
        document.getElementById("hobbies-view").hidden = true;
        document.getElementById("hobby-detail").hidden = true;
        document.getElementById("event-landing").hidden = true;
        document.getElementById("welcome-landing").hidden = true;
        const profilePage = document.getElementById("profile-page");
        profilePage.hidden = false;
        profilePage.innerHTML = '<h2 id="profile-title">Profile</h2>';
        const badge = currentUserProfile && currentUserProfile.is_dev ? '<span class="role-badge dev-badge">DEV</span>' : '';
        profilePage.insertAdjacentHTML("beforeend", '<p><strong>' + accountProfileLink.textContent + '</strong> ' + badge + '</p><h3>Your hobbies</h3><ul id="profile-hobbies" class="hobby-list"></ul>');
        const profileList = document.getElementById("profile-hobbies");
        hobbies.filter(function(hobby) { return hobby.visibility === "personal" || hobby.joined || !hobby.visibility || hobby.ownerId === currentUser.id; }).forEach(function(hobby) {
            const item = document.createElement("li");
            item.className = "hobby-card hobby-card-summary";
            item.innerHTML = '<a class="hobby-card-link" href="#hobby=' + encodeURIComponent(hobby.title) + '"><h3>' + hobby.title + '</h3></a>';
            profileList.append(item);
        });
        return;
    }

    document.getElementById("profile-page").hidden = true;
    document.getElementById("welcome-landing").hidden = Boolean(currentUser);
    loginPage.hidden = true;
    signupPage.hidden = true;

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
    const { error } = await hobbyHubSupabase.auth.signInWithPassword({ email, password });
    if (error) {
        authStatus.textContent = error.message;
    }
    return error;
}

function getAuthRedirectUrl() {
    if (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1") {
        return "http://localhost:4173/";
    }
    return "https://zothardy.github.io/hobby-hub/";
}

async function handleSignUp(event) {
    event.preventDefault();
    const formData = new FormData(signupForm);
    const username = formData.get("username").trim().toLowerCase();
    const email = formData.get("email").trim();
    const password = formData.get("password");
    const { data, error } = await hobbyHubSupabase.auth.signUp({
        email: email,
        password: password,
        options: {
            data: { username: username },
            emailRedirectTo: getAuthRedirectUrl()
        }
    });

    authStatus.textContent = error ? error.message : "Check your email to confirm the account.";
}

async function handleAuthState(session) {
    currentUser = session ? session.user : null;
    authNavigation.hidden = Boolean(currentUser);
    signedInControls.hidden = !currentUser;
    document.getElementById("hobby-form").hidden = !currentUser;
    document.getElementById("welcome-landing").hidden = Boolean(currentUser);

    const sampleProfileMessage = document.getElementById("sample-profile-message");
    if (sampleProfileMessage) {
        sampleProfileMessage.hidden = !currentUser ? false : true;
    }

    if (currentUser) {
        const fallbackUsername = currentUser.user_metadata && currentUser.user_metadata.username
            ? currentUser.user_metadata.username
            : currentUser.email;
        accountProfileLink.textContent = fallbackUsername;
        const { data: profile, error: profileError } = await hobbyHubSupabase
            .from("profiles")
            .select("username,is_dev")
            .eq("id", currentUser.id)
            .maybeSingle();
        if (!profileError && profile && profile.username) {
            accountProfileLink.textContent = profile.username;
            currentUserProfile = profile;
        }

        authStatus.textContent = "Signed in.";
        const route = new URLSearchParams(window.location.hash.slice(1));
        if (route.has("login") || route.has("signup")) {
            window.location.hash = "";
        }
        try {
            await loadHobbiesFromSupabase();
        } catch (error) {
            authStatus.textContent = "Unable to load saved hobbies: " + error.message;
        }
    } else {
        authStatus.textContent = "";
        const sampleProfileMessage = document.getElementById("sample-profile-message");
        if (sampleProfileMessage) {
            sampleProfileMessage.hidden = false;
        }
        hobbies = sampleHobbies.map(function(hobby) {
            return {
                ...hobby,
                events: hobby.events.map(function(event) {
                    return { ...event };
                })
            };
        });
        initializePage();
    }
}

loginForm.addEventListener("submit", function(event) {
    event.preventDefault();
    signIn(document.getElementById("login-email").value.trim(), document.getElementById("login-password").value);
});
signupForm.addEventListener("submit", handleSignUp);
document.getElementById("welcome-sign-in-button").addEventListener("click", function() {
    window.location.hash = "signup";
});
signOutButton.addEventListener("click", async function() {
    const { error } = await hobbyHubSupabase.auth.signOut();
    if (error) {
        authStatus.textContent = error.message;
        return;
    }

    currentUser = null;
    authNavigation.hidden = false;
    signedInControls.hidden = true;
    document.getElementById("hobby-form").hidden = true;
    authStatus.textContent = "Signed out.";
    hobbies = sampleHobbies.map(function(hobby) {
        return {
            ...hobby,
            events: hobby.events.map(function(event) {
                return { ...event };
            })
        };
    });
    window.history.replaceState(null, "", window.location.pathname + window.location.search);
    window.requestAnimationFrame(initializePage);
});

hobbyHubSupabase.auth.onAuthStateChange(function(_event, session) {
    handleAuthState(session);
});

hobbyHubSupabase.auth.getSession().then(function(result) {
    handleAuthState(result.data.session);
});

window.addEventListener("hashchange", initializePage);
initializePage();
