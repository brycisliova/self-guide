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

## Put it on your phone

1. On GitHub: **Settings → Pages → Build and deployment → Deploy from a branch**, pick the branch and `/ (root)`, save. Pages on a private repository needs a paid GitHub plan; on the free plan the repository has to be public. The app code holds no personal data either way.
2. Open `https://<your-username>.github.io/self-guide/` on the phone.
3. Android Chrome: menu → **Add to Home screen**. iPhone Safari: Share → **Add to Home Screen**.

## Run locally

```bash
python3 -m http.server 8000
```

Then open `http://localhost:8000`.
