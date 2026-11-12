# Tide

A phone-first daily rhythm app. Plain HTML, CSS and JavaScript, no build step, works offline once installed.

## What it does

- **Today**: your day from wake to lights-out. Mark blocks done, swap them for alternatives, edit, shift by 15 minutes, add or remove. Mood check and a task list. Step to tomorrow to plan ahead.
- **Plan**: wake and lights-out times (wind-down starts two hours before), day types (Weekday, Weekend, Gentle, Placement sprint, Exam week), focus block count, toggles for movement, nap, friends, journaling, meditation and feed detox. Save any day as your default.
- **Journal**: eight prompts, mood, dictation where the browser supports it, two-week mood chart.
- **Calm**: breathing pacer with four patterns, ten-minute urge timer, RAIN, grounding, wave log.
- **Wave hit**: a button on every screen that walks through breathe, name, ground, log.
- **More**: no-contact tracker, what to take in and skip, library notes, quote notebook, sync, backup, theme.

## Calendar, reminders, sync

- Any block or the whole day exports to your calendar, once or repeating: a Google Calendar link per block, or an `.ics` file that Google, Apple and Outlook calendars open. Each event has an alert at its start time. This is the reliable way to get reminders.
- In-app notifications fire only while the app is open or recently used. That is a browser limit.
- Data lives in the browser. Optional sync keeps a copy in a secret gist on your own GitHub account (token with only the Gists permission). Backup and restore as a JSON file also work.

## Google Calendar and Tasks

Optional two-way link, set up in **More → Google Calendar and Tasks**. Tide keeps a calendar named Tide (today and tomorrow, an alert at each block) and a task list named Tide. Tasks sync both ways. Google requires your own OAuth client ID for this:

1. In [Google Cloud Console](https://console.cloud.google.com) create a project.
2. Enable **Google Calendar API** and **Google Tasks API**.
3. OAuth consent screen: External, and add your own Gmail address under Test users.
4. Credentials → OAuth client ID → Web application, with your site origin (for example `https://<your-username>.github.io`) under Authorised JavaScript origins.
5. Paste the client ID into the app and tap Connect Google.

Access is limited to calendars the app creates and to your task lists. The sign-in lasts about an hour, after which Sync now asks Google again.

## Put it on your phone

1. On GitHub: **Settings → Pages → Build and deployment → Deploy from a branch**, pick the branch and `/ (root)`, save. Pages on a private repository needs a paid GitHub plan; on the free plan the repository has to be public. The app code holds no personal data either way.
2. Open `https://<your-username>.github.io/self-guide/` on the phone.
3. Android Chrome: menu → **Add to Home screen**. iPhone Safari: Share → **Add to Home Screen**.

## Run locally

```bash
python3 -m http.server 8000
```

Then open `http://localhost:8000`.

## Photographs

From Wikimedia Commons, cropped and compressed, under the licences shown:

- A Misty Dawn, Dandenong Ranges, Uzman Naleer, CC BY-SA 4.0
- Caribbean Sea - Long Exposure, Martin Falbisoner, CC BY-SA 4.0
- Chimney Rock Trail Point Reyes December 2016 panorama 2, King of Hearts, CC BY-SA 4.0
- Linnutee - Milky Way (9), Kristian Pikner, CC BY-SA 4.0
- Hommikune udu Kakerdaja rabas, Abrget47j, CC BY-SA 3.0
- Lake Seliger. Ostashkov. View of Voroniy Island, Александр Байдуков, CC BY-SA 4.0
- The Pinnacle, Grampians National Park Sunrise, Joshua Tagicakibau, CC BY-SA 4.0
- Dülmen, Kirchspiel, Börnste, Feld -- 2017 -- 3171, Dietmar Rabich, CC BY-SA 4.0
- Santorin (GR), Exomytis, Vlychada Beach -- 2017 -- 2999 (bw), Dietmar Rabich, CC BY-SA 4.0

Links to each original are in the app under More.
