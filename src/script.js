const hobbyForm = document.getElementById("hobby-form");
const hobbyTitleInput = document.getElementById("hobby-title");
const hobbyDescriptionInput = document.getElementById("hobby-description");
const hobbyList = document.getElementById("hobby-list");

const hobbiesStorageKey = "hobbyHubCurrentHobbies";
const sampleHobbies = [
    {
        title: "Hiking",
        description: "Exploring local trails and enjoying the outdoors."
    },
    {
        title: "Watercolor painting",
        description: "Practicing landscape paintings and color mixing."
    },
    {
        title: "Dungeons & Dragons",
        description: "Playing in a weekly tabletop campaign with friends."
    }
];
function loadHobbies() {
    const savedHobbies = localStorage.getItem(hobbiesStorageKey);

    if (!savedHobbies) {
        return sampleHobbies;
    }

    try {
        const parsedHobbies = JSON.parse(savedHobbies);
        const hobbiesAreValid = Array.isArray(parsedHobbies)
            && parsedHobbies.every(function(hobby) {
                return hobby
                    && typeof hobby.title === "string"
                    && typeof hobby.description === "string";
            });

        return hobbiesAreValid ? parsedHobbies : sampleHobbies;
    } catch (error) {
        console.error("Unable to read saved hobbies.", error);
        return sampleHobbies;
    }
}

let hobbies = loadHobbies();

function saveHobbies() {
    localStorage.setItem(hobbiesStorageKey, JSON.stringify(hobbies));
}

function renderHobbies() {
    hobbyList.replaceChildren();

    hobbies.forEach(function(hobby, index) {
        const item = document.createElement("li");
        const details = document.createElement("div");
        const title = document.createElement("h3");
        const description = document.createElement("p");
        const removeButton = document.createElement("button");

        item.className = "hobby-card";
        details.className = "hobby-details";
        title.textContent = hobby.title;
        description.textContent = hobby.description;
        removeButton.className = "remove-button";
        removeButton.type = "button";
        removeButton.textContent = "Remove";
        removeButton.setAttribute("aria-label", "Remove " + hobby.title);
        removeButton.addEventListener("click", function() {
            hobbies.splice(index, 1);
            saveHobbies();
            renderHobbies();
        });

        details.append(title, description);
        item.append(details, removeButton);
        hobbyList.append(item);
    });
}

function addHobby(event) {
    event.preventDefault();

    const title = hobbyTitleInput.value.trim();
    const description = hobbyDescriptionInput.value.trim();

    if (!title || !description) {
        return;
    }

    hobbies.push({ title: title, description: description });
    saveHobbies();
    renderHobbies();
    hobbyForm.reset();
    hobbyTitleInput.focus();
}

renderHobbies();
hobbyForm.addEventListener("submit", addHobby);
