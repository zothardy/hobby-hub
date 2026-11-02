# HobbyHub (name is a work in progress)

## What is it for?
- HobbyHub is a social application to keep track of any and all kinds of hobbies in your life
    - Current Hobbies: list out current hobbies, attach a picture to each hobbynode, title, description, social status, time spent, date startd, location (if applicable), friends who also participate. 
    - Hobby Heaven: Sometimes people grow out of their hobbies, and that's okay! If the user wishes, they may display hobbies that they look back on fondly, but no longer participate in. 
    - Hobby Graveyard: We've all thought how fun it would be to start a hobby in woodworking (and if you did, then awesome for you!), but sometimes it doesn't pan out. This is a place to display hobbies you've given a shot and it just wasn't your vibe.
    - Hopeful Hobbies: Wanted to start that D&D campaign but haven't gotten around to it? Users may display what they hope to pick up in the future. Who knows? Maybe someone'll find that they had similar plans, and finally get that dice rollin'! 

## Current prototype
- The Current Hobbies list starts with sample hobbies for a test user: hiking, watercolor painting, and Dungeons & Dragons.
- Add a hobby with a name and description, or remove a hobby. Hobbies are saved in the browser using local storage.
- Each hobby has an expandable Events dropdown that shows its event count.
- Add events with a name, location, Google Maps search, date, and time.
- Search for a venue or address in Google Maps and preview the result before saving the event.
- Open an event's location directly in Google Maps.
- Share an event using a HobbyHub landing-page link. The landing page displays the event name, hobby, date, time, location, and map link.
- Remove events independently from their parent hobby.

## Running locally
From the project root, run:

```sh
python3 -m http.server 4173 --directory src
```

Then open `http://localhost:4173`.
