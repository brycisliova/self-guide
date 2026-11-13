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

## Privacy and security

- Journal, mood, tasks and logs are stored in the browser only. Nothing personal is in this repository.
- A content security policy limits the page to its own scripts and to Google and GitHub endpoints used by the optional sync.
- Data restored from a backup or synced copy is cleaned before it is displayed.
- Optional PIN lock (a screen lock, not encryption).

## Limits of a web app

- No home-screen widget of its own. With Google connected, the Google Calendar and Google Tasks widgets show the Tide day and tasks.
- No access to the phone's step counter or Digital Wellbeing. Steps, screen time and sleep are typed in on the Progress tab.

## Photographs

From Wikimedia Commons, resized and compressed, under the licences shown. Each links to its original in the app under More.

- [A Misty Dawn, Dandenong Ranges](https://commons.wikimedia.org/wiki/File:A_Misty_Dawn,_Dandenong_Ranges.jpg), Uzman Naleer, CC BY-SA 4.0
- [Caribbean Sea - Long Exposure](https://commons.wikimedia.org/wiki/File:Caribbean_Sea_-_Long_Exposure.jpg), Martin Falbisoner, CC BY-SA 4.0
- [Chimney Rock Trail Point Reyes December 2016 panorama 2](https://commons.wikimedia.org/wiki/File:Chimney_Rock_Trail_Point_Reyes_December_2016_panorama_2.jpg), King of Hearts, CC BY-SA 4.0
- [Linnutee - Milky Way (9) copy](https://commons.wikimedia.org/wiki/File:Linnutee_-_Milky_Way_(9)_copy.jpg), Kristian Pikner, CC BY-SA 4.0
- [Hommikune udu Kakerdaja rabas](https://commons.wikimedia.org/wiki/File:Hommikune_udu_Kakerdaja_rabas.jpg), Abrget47j, CC BY-SA 3.0
- [Lake Seliger. Ostashkov. View of Voroniy Island](https://commons.wikimedia.org/wiki/File:Lake_Seliger._Ostashkov._View_of_Voroniy_Island.jpg), Александр Байдуков, CC BY-SA 4.0
- [The Pinnacle, Grampians National Park Sunrise](https://commons.wikimedia.org/wiki/File:The_Pinnacle,_Grampians_National_Park_Sunrise.jpg), Joshua Tagicakibau, CC BY-SA 4.0
- [Dülmen, Kirchspiel, Börnste, Feld -- 2017 -- 3171](https://commons.wikimedia.org/wiki/File:D%C3%BClmen,_Kirchspiel,_B%C3%B6rnste,_Feld_--_2017_--_3171.jpg), Dietmar Rabich, CC BY-SA 4.0
- [Santorin (GR), Exomytis, Vlychada Beach -- 2017 -- 2999 (bw)](https://commons.wikimedia.org/wiki/File:Santorin_(GR),_Exomytis,_Vlychada_Beach_--_2017_--_2999_(bw).jpg), Dietmar Rabich, CC BY-SA 4.0
- [2019 - Nationalpark Jasmund - 01](https://commons.wikimedia.org/wiki/File:2019_-_Nationalpark_Jasmund_-_01.jpg), Moahim, CC BY-SA 4.0
- [Aurora Australis Over the Tasman Sea from SouthWest National Park](https://commons.wikimedia.org/wiki/File:Aurora_Australis_Over_the_Tasman_Sea_from_SouthWest_National_Park.jpg), Jamen Percy, CC BY-SA 4.0
- [Bieszczady - sunrise from Chatka Puchatka (2)](https://commons.wikimedia.org/wiki/File:Bieszczady_-_sunrise_from_Chatka_Puchatka_(2).jpg), Pudelek, CC BY-SA 4.0
- [Bontecou Lake Milky Way panorama](https://commons.wikimedia.org/wiki/File:Bontecou_Lake_Milky_Way_panorama.jpg), Juliancolton, CC BY-SA 4.0
- [Dawn in Puerto Encantado](https://commons.wikimedia.org/wiki/File:Dawn_in_Puerto_Encantado.jpg), Paolo Costa Baldi, CC BY-SA 3.0
- [Desna river Vinn meadow 2019 G01](https://commons.wikimedia.org/wiki/File:Desna_river_Vinn_meadow_2019_G01.jpg), George Chernilevsky, Public domain
- [Dülmen, Kirchspiel, Börnste, Felder und Bäume -- 2017 -- 3160-6](https://commons.wikimedia.org/wiki/File:D%C3%BClmen,_Kirchspiel,_B%C3%B6rnste,_Felder_und_B%C3%A4ume_--_2017_--_3160-6.jpg), Dietmar Rabich, CC BY-SA 4.0
- [Gurudongmar Lake Sikkim, India (edit)](https://commons.wikimedia.org/wiki/File:Gurudongmar_Lake_Sikkim,_India_(edit).jpg), Original: Yoghya Derivative work: UnpetitproleX, CC BY-SA 4.0
- [Jokulsarlon lake, Iceland](https://commons.wikimedia.org/wiki/File:Jokulsarlon_lake,_Iceland.jpg), Kenny Muir, CC BY 2.0
- [Karst peaks with sea of clouds at sunrise, South view from the top of Mount Nam Xay, Vang Vieng, Laos](https://commons.wikimedia.org/wiki/File:Karst_peaks_with_sea_of_clouds_at_sunrise,_South_view_from_the_top_of_Mount_Nam_Xay,_Vang_Vieng,_Laos.jpg), Basile Morin, CC BY-SA 4.0
- [Lake Bondhus Norway 2862](https://commons.wikimedia.org/wiki/File:Lake_Bondhus_Norway_2862.jpg), Alchemist-hp (talk) (www.pse-mendelejew.de), FAL
- [Lake Clearwater, Canterbury, New Zealand 02](https://commons.wikimedia.org/wiki/File:Lake_Clearwater,_Canterbury,_New_Zealand_02.jpg), Michal Klajban, CC BY-SA 4.0
- [Lake Kinney mit Mount Whitehorn](https://commons.wikimedia.org/wiki/File:Lake_Kinney_mit_Mount_Whitehorn.jpg), Florian Fuchs, CC BY 3.0
- [Morning mist lifting from plowed field 3](https://commons.wikimedia.org/wiki/File:Morning_mist_lifting_from_plowed_field_3.jpg), W.carter, CC0
- [Olkhon Island, Capes, cliffs at sunset, Lake Baikal, Russia](https://commons.wikimedia.org/wiki/File:Olkhon_Island,_Capes,_cliffs_at_sunset,_Lake_Baikal,_Russia.jpg), Vyacheslav Argenberg, CC BY 4.0
- [Square plot of a green paddy field and water reflection of mountains with mist and blue sky, Vang Vieng, Laos](https://commons.wikimedia.org/wiki/File:Square_plot_of_a_green_paddy_field_and_water_reflection_of_mountains_with_mist_and_blue_sky,_Vang_Vieng,_Laos.jpg), Basile Morin, CC BY-SA 4.0
- [Sunny mist in the mountains at golden hour, South-West view from Mount Nam Xay, Vang Vieng, Laos](https://commons.wikimedia.org/wiki/File:Sunny_mist_in_the_mountains_at_golden_hour,_South-West_view_from_Mount_Nam_Xay,_Vang_Vieng,_Laos.jpg), Basile Morin, CC BY-SA 4.0
- [Sunset view of Everest](https://commons.wikimedia.org/wiki/File:Sunset_view_of_Everest.jpg), Nir B. Gurung, CC BY-SA 4.0
- [Waves at La Corniche](https://commons.wikimedia.org/wiki/File:Waves_at_La_Corniche.jpg), Christian Ferrer, CC BY 4.0
- [Zagedan Lakes, Mountain cirque, Caucasus Mountains](https://commons.wikimedia.org/wiki/File:Zagedan_Lakes,_Mountain_cirque,_Caucasus_Mountains.jpg), Vyacheslav Argenberg, CC BY 4.0
