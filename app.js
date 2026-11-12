/* Tide: a daily rhythm you can reshape. All data stays in this browser unless you turn on sync. */
'use strict';

// ---------- helpers ----------
const $ = (s, r = document) => r.querySelector(s);
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
const pad = n => String(n).padStart(2, '0');
const toMin = hhmm => { const [h, m] = hhmm.split(':').map(Number); return h * 60 + m; };
const toHHMM = min => { const m = ((min % 1440) + 1440) % 1440; return pad(Math.floor(m / 60)) + ':' + pad(m % 60); };
const fmt = min => { const m = ((min % 1440) + 1440) % 1440, h = Math.floor(m / 60); return ((h + 11) % 12 + 1) + ':' + pad(m % 60) + (h < 12 ? ' am' : ' pm'); };
const dur = d => d >= 60 ? (d % 60 ? Math.floor(d / 60) + 'h ' + d % 60 + 'm' : d / 60 + 'h') : d + ' min';
const dateKey = d => d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate());
const keyDate = k => { const [y, m, d] = k.split('-').map(Number); return new Date(y, m - 1, d); };
const addDays = (k, n) => { const d = keyDate(k); d.setDate(d.getDate() + n); return dateKey(d); };
const pick = a => a[Math.floor(Math.random() * a.length)];

// ---------- content ----------
const CATS = { move: 'Move', calm: 'Calm', write: 'Write', people: 'People', work: 'Work', rest: 'Rest', fun: 'Fun', food: 'Food', sleep: 'Sleep' };

const ALT = {
  move: [['Brisk walk, no phone', 'Count your steps to 100, then start over.'], ['Run, easy pace', 'You should be able to talk while running.'], ['Gym: push, pull, legs', 'Three lifts, three sets each.'], ['Stretch + 20 squats + 10 push-ups', 'Room is enough.'], ['Cycle around campus', 'Pick a route you do not usually take.'], ['Badminton or football with anyone free', ''], ['Stairs: 10 floors up and down', ''], ['Yoga: 10 sun salutations', 'Slow, breathe with each move.']],
  calm: [['Breathing 4 in, 8 out', 'Open Calm tab for the pacer.'], ['RAIN, 10 minutes', 'Recognise, allow, investigate, nurture.'], ['Body scan lying down', 'Toes to head, one part at a time.'], ['Sit outside, eyes on trees', 'No phone. Just look.'], ['5-4-3-2-1 grounding', '5 see, 4 hear, 3 touch, 2 smell, 1 taste.'], ['Self-compassion break', 'This hurts. Others feel this too. May I be kind to myself.'], ['Tea, slowly, no screen', ''], ['Box breathing 4-4-4-4', 'Five rounds.']],
  write: [['Worry slot: write it all, then stop', '15 minutes on a timer. Thoughts outside the slot get "later".'], ['Evening three lines', 'One thing that went fine, one thing I did for me, one thing for tomorrow.'], ['Unsent letter', 'Say everything. Do not send.'], ['After a wave', 'What triggered it, how long it lasted, what helped.'], ['Brain dump', 'Everything in your head, as a list.'], ['Gratitude: three specific things', 'Specific beats general.'], ['Future me, six months on', 'Write to yourself from next May.'], ['Copy one good quote by hand', 'Add it to the notebook in More.']],
  people: [['Lunch with a friend', 'Ask one real question and listen.'], ['Call home', 'Ten minutes is enough.'], ['Chai with a wingmate', ''], ['Message someone you have not talked to in a while', 'Short and warm.'], ['Study alongside someone', 'Library or common room.'], ['Time with your partner', 'Phone away.'], ['Join one club or sport session', ''], ['Help a junior with something', '']],
  work: [['Deep work: one task only', 'Phone in another room. Write the one task before you start.'], ['Project or thesis block', 'Start with the smallest next step.'], ['Placement prep', 'One topic, timed questions.'], ['Applications', 'Two applications, done properly.'], ['Coursework', 'Hardest thing first.'], ['Small tasks + tomorrow top 3', 'Clear mail, then write tomorrow\'s three.'], ['Read one paper, write five lines', ''], ['Pomodoro x3 (25/5)', '']],
  rest: [['Nap, 25 minutes', 'Alarm on. Longer leaves you groggy.'], ['Lie down, eyes closed, music', ''], ['Shower and change', ''], ['Tidy desk and room, 10 minutes', 'Outer order helps.'], ['Do nothing on purpose', 'Sit. Let the mind wander.'], ['Sunlight for 10 minutes', '']],
  fun: [['Open time: your pick', 'Anything that is not a feed.'], ['A film or one episode', 'Chosen before you sit down, not scrolled into.'], ['Read a novel', 'Paper if possible.'], ['Music, full album', 'Headphones, lights low.'], ['Game for one hour', 'Timer on.'], ['Cook or try new food', ''], ['Learn something useless and fun', 'A card trick, a chord, a sketch.'], ['Walk somewhere new', '']],
  food: [['Breakfast, no phone', 'Water first.'], ['Lunch', 'Sit with someone if you can.'], ['Dinner', 'Not at your desk.'], ['Snack + water', ''], ['Eat out with friends', '']],
  sleep: [['Lights out', 'Phone across the room.']]
};

const DAY_TYPES = {
  weekday: { name: 'Weekday', hint: 'Balanced work and recovery.', workLen: 90 },
  weekend: { name: 'Weekend', hint: 'One work block at most, more people and open time.', workLen: 75, maxWork: 1 },
  gentle: { name: 'Gentle', hint: 'For heavy days. Short work, more rest.', workLen: 50, maxWork: 1 },
  sprint: { name: 'Placement sprint', hint: 'Three long focus blocks, recovery protected.', workLen: 100, minWork: 3 },
  exam: { name: 'Exam week', hint: 'Study blocks with real breaks.', workLen: 90, minWork: 3, workTitle: 'Study block' }
};

const PROMPTS = [
  ['Worry slot', 'Everything on my mind right now, no filter:'],
  ['Unsent letter', 'What I would say if there were no consequences:'],
  ['After a wave', 'What set it off, how strong it was, what helped:'],
  ['Evening three lines', '1. Something that went fine today:\n2. Something I did for myself:\n3. One thing for tomorrow:'],
  ['What I control', 'In my control today:\nNot in my control:'],
  ['Evidence check', 'The thought:\nEvidence for it:\nEvidence against it:\nA fairer version:'],
  ['Kind friend', 'If my closest friend were in my place, I would tell them:'],
  ['Free write', '']
];

const NC_ITEMS = [['msg', 'Did not message or call first'], ['profile', 'Did not check their profile, status or last seen'], ['chat', 'Did not reread old chats'], ['seat', 'Sat somewhere else, took my own route'], ['favour', 'Did no favours and sent no material'], ['explain', 'Did not explain or justify myself']];

const LIBRARY = [
  { id: 'winch', title: 'Guy Winch: emotional first aid (TED talk)', link: 'https://www.ted.com/talks/guy_winch_why_we_all_need_to_practice_emotional_first_aid', linkText: 'Watch, with full transcript on TED',
    points: ['We treat a cut straight away but leave loneliness, rejection and failure to fester. Psychological injuries need the same routine care.', 'Loneliness bends perception. It tells you people care less than they do, so you reach out less. Notice the distortion and reach out anyway.', 'After a rejection the mind lists your faults. That is kicking yourself when you are down. Talk to yourself the way you would to a close friend.', 'After failure the mind says "I can\'t". Do not accept that verdict. Find the part you can control and act on it.', 'Rumination, replaying the scene again and again, feels like problem solving but only deepens the hurt. A two-minute absorbing distraction is enough to break one urge. Break each urge and the habit weakens.', 'Protect your self-esteem when it is low. Build emotional resilience on purpose, like hygiene.'] },
  { id: 'rain', title: 'Tara Brach: RAIN', link: 'https://www.tarabrach.com/rain/', linkText: 'Guided RAIN meditations on tarabrach.com',
    points: ['Recognise: name what is here. "Sadness. Tight chest. The thought that I was not enough."', 'Allow: let it be here for now. You do not have to like it or fix it. Whisper "this belongs" or "yes".', 'Investigate: with kindness, not analysis. Where is it in the body? What does this part of me believe? What does it need most?', 'Nurture: give it that. A hand on the chest, a phrase such as "I am here. It is okay to feel this."', 'Afterwards, rest for a minute and notice that you are larger than the wave that passed through.'] },
  { id: 'neff', title: 'Kristin Neff: self-compassion break', link: 'https://self-compassion.org/', linkText: 'Exercises on self-compassion.org',
    points: ['Mindfulness: "This is a moment of suffering."', 'Common humanity: "Hurting like this is part of being human. I am not the only one."', 'Kindness: "May I be kind to myself right now."'] },
  { id: 'books', title: 'Books', link: '', linkText: '',
    points: ['Attached (Levine, Heller): why an unpredictable person sticks in the mind, and what secure looks like.', 'How to Fix a Broken Heart (Guy Winch): short and practical.', 'Set Boundaries, Find Peace (Nedra Tawwab): saying no without a long explanation.', 'Self-Compassion (Kristin Neff): for the harsh inner voice.'] }
];

const CONSUME = {
  yes: ['Long-form things you chose in advance: a film, an album, a book chapter', 'Comedy and sport, especially at night', 'Podcasts while walking', 'One learning video a day for your own goals', 'Guided meditations: RAIN, letting go, sleep', 'Messages from people who are kind to you'],
  no: ['Any feed after wind-down starts', 'Breakup, revenge and "signs they miss you" content', 'Sad playlists on loop', 'Their profile, status, stories and old photos', 'Old chats and screenshots', 'Anything that starts with "just checking"']
};

const CREDITS = [["Morning", "A Misty Dawn, Dandenong Ranges", "Uzman Naleer", "CC BY-SA 4.0", "https://commons.wikimedia.org/wiki/File:A_Misty_Dawn,_Dandenong_Ranges.jpg"], ["Midday", "Caribbean Sea - Long Exposure", "Martin Falbisoner", "CC BY-SA 4.0", "https://commons.wikimedia.org/wiki/File:Caribbean_Sea_-_Long_Exposure.jpg"], ["Evening", "Chimney Rock Trail Point Reyes December 2016 panorama 2", "King of Hearts", "CC BY-SA 4.0", "https://commons.wikimedia.org/wiki/File:Chimney_Rock_Trail_Point_Reyes_December_2016_panorama_2.jpg"], ["Night", "Linnutee - Milky Way (9) copy", "Kristian Pikner", "CC BY-SA 4.0", "https://commons.wikimedia.org/wiki/File:Linnutee_-_Milky_Way_(9)_copy.jpg"], ["Journal", "Hommikune udu Kakerdaja rabas", "Abrget47j", "CC BY-SA 3.0", "https://commons.wikimedia.org/wiki/File:Hommikune_udu_Kakerdaja_rabas.jpg"], ["Calm", "Lake Seliger. Ostashkov. View of Voroniy Island", "Александр Байдуков", "CC BY-SA 4.0", "https://commons.wikimedia.org/wiki/File:Lake_Seliger._Ostashkov._View_of_Voroniy_Island.jpg"], ["Plan", "The Pinnacle, Grampians National Park Sunrise", "Joshua Tagicakibau", "CC BY-SA 4.0", "https://commons.wikimedia.org/wiki/File:The_Pinnacle,_Grampians_National_Park_Sunrise.jpg"], ["More", "Dülmen, Kirchspiel, Börnste, Feld -- 2017 -- 3171", "Dietmar Rabich", "CC BY-SA 4.0", "https://commons.wikimedia.org/wiki/File:D%C3%BClmen,_Kirchspiel,_B%C3%B6rnste,_Feld_--_2017_--_3171.jpg"], ["Wave", "Santorin (GR), Exomytis, Vlychada Beach -- 2017 -- 2999 (bw)", "Dietmar Rabich", "CC BY-SA 4.0", "https://commons.wikimedia.org/wiki/File:Santorin_(GR),_Exomytis,_Vlychada_Beach_--_2017_--_2999_(bw).jpg"]];

// ---------- state ----------
const KEY = 'tide.v1', SYNC_KEY = 'tide.sync';
const blank = () => ({
  v: 1, updatedAt: 0,
  settings: { wake: '08:00', bed: '00:30', dayType: 'weekday', work: 3, inc: { move: true, nap: true, friends: true, journal: true, meditate: true, detox: true }, notify: false, theme: 'auto' },
  template: null, days: {}, tasks: [], journal: [], waves: [], quotes: [], notes: {},
  nc: { start: null, best: 0, resets: 0 },
  g: { clientId: '', connected: false, calId: '', listId: '', last: 0, delTasks: [] }
});
function migrate(s) { const b = blank(); const out = Object.assign(b, s); out.settings = Object.assign(blank().settings, s.settings || {}); out.settings.inc = Object.assign(blank().settings.inc, (s.settings || {}).inc || {}); out.nc = Object.assign(blank().nc, s.nc || {}); out.g = Object.assign(blank().g, s.g || {}); return out; }
let state = blank();
try { const raw = localStorage.getItem(KEY); if (raw) state = migrate(JSON.parse(raw)); } catch (e) { /* start fresh */ }
let sync = { token: '', gistId: '', last: 0, status: '' };
try { Object.assign(sync, JSON.parse(localStorage.getItem(SYNC_KEY) || '{}')); } catch (e) { /* none */ }
const ui = { tab: 'today', open: null, dayOffset: 0, prompt: 0, pattern: '4-8', jmood: 0, libOpen: null };

function persist() { try { localStorage.setItem(KEY, JSON.stringify(state)); } catch (e) { toast('Could not save on this device. Storage is full or blocked.'); } }
let pushTimer = null, gTimer = null;
function save(noG) {
  state.updatedAt = Date.now(); persist();
  if (sync.token) { clearTimeout(pushTimer); pushTimer = setTimeout(() => syncNow(true), 4000); }
  if (!noG && state.g.connected && gOK()) { clearTimeout(gTimer); gTimer = setTimeout(() => gSync(false), 5000); }
}
function saveSync() { try { localStorage.setItem(SYNC_KEY, JSON.stringify(sync)); } catch (e) { /* ignore */ } }

// ---------- time model ----------
// The day runs from wake to lights-out, so 12:20 am still belongs to "today".
function span() { const w = toMin(state.settings.wake); let b = toMin(state.settings.bed); if (b <= w) b += 1440; return { w, b }; }
function logicalNow() {
  const d = new Date(); let min = d.getHours() * 60 + d.getMinutes(); let key = dateKey(d);
  const { w, b } = span();
  if (b > 1440 && min < Math.min(b - 1440 + 120, w)) { key = addDays(key, -1); min += 1440; }
  return { key, min };
}
const viewKey = () => addDays(logicalNow().key, ui.dayOffset);

// ---------- schedule builder ----------
function buildDay(typeOverride) {
  const s = state.settings, T = DAY_TYPES[typeOverride || s.dayType] || DAY_TYPES.weekday, inc = s.inc;
  const { w, b } = span();
  let nWork = s.work; if (T.maxWork != null) nWork = Math.min(nWork, T.maxWork); if (T.minWork != null) nWork = Math.max(nWork, T.minWork);
  const out = []; const B = (start, d, cat, title, note) => out.push({ id: uid(), start, dur: d, cat, title, note: note || '', done: false });
  const workItem = (n, p) => ({ d: T.workLen, cat: 'work', title: (T.workTitle || 'Focus block') + ' ' + n, note: 'One task. Phone out of reach.', p });
  // fill a window with items; drop the least important if they do not fit, turn spare time into open time
  const fill = (from, to, items, openTitle) => {
    items = items.filter(Boolean);
    let total = items.reduce((a, i) => a + i.d, 0);
    while (items.length && total > to - from) { let worst = 0; items.forEach((it, i) => { if (it.p >= items[worst].p) worst = i; }); total -= items[worst].d; items.splice(worst, 1); }
    let spare = to - from - total, t = from;
    if (spare > 0 && spare < 15 && items.length) { items[items.length - 1].d += spare; spare = 0; }
    items.forEach((it, i) => {
      B(t, it.d, it.cat, it.title, it.note); t += it.d;
      if (spare >= 15 && i === (items.length >= 3 ? items.length - 2 : items.length - 1)) { if (spare > 75) B(t, spare, 'fun', openTitle, 'Your pick. Tap Swap for ideas. Not a feed.'); else B(t, spare, 'rest', 'Buffer: tea, tidy up, or a short walk', 'Slack on purpose, so a late block does not wreck the day.'); t += spare; spare = 0; }
    });
    if (spare >= 15) B(t, spare, 'fun', openTitle, 'Your pick. Tap Swap for ideas. Not a feed.');
  };
  // morning
  let t = w;
  B(t, 15, 'rest', 'Wake, water, daylight', 'No phone for the first 15 minutes.'); t += 15;
  if (inc.move) { B(t, 30, 'move', T === DAY_TYPES.gentle ? 'Slow walk outside' : 'Move: walk, run or gym', 'This does more against rumination than any technique.'); t += 30; }
  B(t, 30, 'food', 'Breakfast, no phone', ''); t += 30;
  // evening anchors
  const wind = b - 120;
  const lunch = Math.min(Math.max(13 * 60, t + 90), wind - 240);
  const dinner = Math.min(Math.max(20 * 60, lunch + 195), wind - 60);
  const am = nWork >= 3 ? [workItem(1, 1), { d: 15, cat: 'calm', title: 'Break: breathe and stretch', note: '4 in, 8 out, five rounds.', p: 3 }, workItem(2, 2)]
    : nWork >= 1 ? [workItem(1, 1), { d: 15, cat: 'calm', title: 'Break: breathe and stretch', note: '4 in, 8 out, five rounds.', p: 3 }] : [{ d: 45, cat: 'rest', title: 'Slow morning', note: 'Tidy, shower, sunlight.', p: 1 }];
  fill(t, lunch, am, 'Open time');
  B(lunch, 45, inc.friends ? 'people' : 'food', inc.friends ? 'Lunch with a friend' : 'Lunch', inc.friends ? 'Ask one real question and listen.' : '');
  const pm = [
    inc.nap && { d: 25, cat: 'rest', title: 'Nap, 25 minutes', note: 'Alarm on.', p: 4 },
    nWork >= 2 && workItem(nWork >= 3 ? 3 : 2, 2),
    { d: 20, cat: 'move', title: 'Walk and chai', note: 'Outside, no headphones.', p: 5 },
    inc.journal && { d: 15, cat: 'write', title: 'Worry slot: write it all, then stop', note: 'Timer on. Outside this slot, thoughts get "later".', p: 1 },
    inc.move && T !== DAY_TYPES.gentle && { d: 45, cat: 'move', title: 'Sport or gym with others', note: 'Badminton, football, a run. Anything with people in it.', p: 4 },
    inc.friends && { d: T === DAY_TYPES.weekend ? 90 : 45, cat: 'people', title: T === DAY_TYPES.weekend ? 'Out with friends' : 'Time with a friend', note: 'Sport, chai, or studying side by side.', p: 3 }
  ];
  fill(lunch + 45, dinner, pm, 'Open time');
  B(dinner, 45, 'food', 'Dinner', 'Not at your desk.');
  fill(dinner + 45, wind, [{ d: 45, cat: 'fun', title: 'Self time', note: 'Something you enjoy alone.', p: 2 }, { d: 30, cat: 'work', title: 'Small tasks + tomorrow top 3', note: '', p: 3 }], 'Open evening');
  // wind-down
  B(wind, 30, inc.detox ? 'rest' : 'fun', inc.detox ? 'Wind-down starts: feeds off' : 'Slow evening', inc.detox ? 'No feeds from here. Charger away from the bed.' : '');
  B(wind + 30, 30, 'fun', 'Offline: music, novel, or a call', 'Chosen, not scrolled into.');
  if (inc.meditate) B(wind + 60, 15, 'calm', 'Meditation: RAIN or breathing', 'Calm tab has both.'); else B(wind + 60, 15, 'rest', 'Shower and change', '');
  if (inc.journal) B(wind + 75, 15, 'write', 'Evening three lines', 'Went fine, did for me, for tomorrow.'); else B(wind + 75, 15, 'rest', 'Tidy desk', '');
  B(wind + 90, 30, 'rest', 'Set out tomorrow, read on paper', 'Phone across the room.');
  B(b, 0, 'sleep', 'Lights out', '');
  out.sort((x, y) => x.start - y.start);
  let n = 0; out.forEach(x => { if (/block \d$/.test(x.title)) x.title = x.title.replace(/\d$/, ++n); });
  return out;
}
function getDay(key) {
  if (!state.days[key]) {
    const blocks = state.template ? state.template.map(x => Object.assign({}, x, { id: uid(), done: false })) : buildDay();
    state.days[key] = { blocks, mood: 0, nc: {} };
  }
  const d = state.days[key]; if (!d.nc) d.nc = {}; return d;
}
const findBlock = id => getDay(viewKey()).blocks.find(x => x.id === id);
const sortDay = d => d.blocks.sort((x, y) => x.start - y.start);

// ---------- calendar ----------
const RECUR = { once: ['Just this day', ''], daily: ['Every day', 'RRULE:FREQ=DAILY'], weekdays: ['Weekdays', 'RRULE:FREQ=WEEKLY;BYDAY=MO,TU,WE,TH,FR'], weekends: ['Weekends', 'RRULE:FREQ=WEEKLY;BYDAY=SA,SU'] };
function stamp(key, min) { const d = keyDate(key); d.setMinutes(min); return d.getFullYear() + pad(d.getMonth() + 1) + pad(d.getDate()) + 'T' + pad(d.getHours()) + pad(d.getMinutes()) + '00'; }
function gcalLink(key, b, recur) {
  const p = new URLSearchParams({ action: 'TEMPLATE', text: b.title, details: b.note || '', dates: stamp(key, b.start) + '/' + stamp(key, b.start + Math.max(b.dur, 10)) });
  if (RECUR[recur][1]) p.set('recur', RECUR[recur][1]);
  return 'https://calendar.google.com/calendar/render?' + p.toString();
}
function ics(key, blocks, recur) {
  const e = s => String(s || '').replace(/([\\;,])/g, '\\$1').replace(/\n/g, '\\n');
  const now = new Date().toISOString().replace(/[-:]/g, '').slice(0, 15) + 'Z';
  const L = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Tide//Daily rhythm//EN', 'CALSCALE:GREGORIAN'];
  blocks.forEach(b => {
    L.push('BEGIN:VEVENT', 'UID:' + b.id + '-' + key + '@tide', 'DTSTAMP:' + now, 'DTSTART:' + stamp(key, b.start), 'DTEND:' + stamp(key, b.start + Math.max(b.dur, 10)), 'SUMMARY:' + e(b.title));
    if (b.note) L.push('DESCRIPTION:' + e(b.note));
    if (RECUR[recur][1]) L.push(RECUR[recur][1]);
    L.push('BEGIN:VALARM', 'ACTION:DISPLAY', 'DESCRIPTION:' + e(b.title), 'TRIGGER:PT0M', 'END:VALARM', 'END:VEVENT');
  });
  L.push('END:VCALENDAR'); return L.join('\r\n');
}
function download(name, text, type) {
  const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([text], { type })); a.download = name;
  document.body.appendChild(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(a.href), 2000);
}
function planText(key) {
  const d = getDay(key); const head = keyDate(key).toLocaleDateString(undefined, { weekday: 'long', day: 'numeric', month: 'short' });
  return 'Plan for ' + head + '\n' + d.blocks.map(b => fmt(b.start) + (b.dur ? '-' + fmt(b.start + b.dur) : '') + '  ' + b.title).join('\n');
}
async function copy(text, msg) { try { await navigator.clipboard.writeText(text); toast(msg || 'Copied'); } catch (e) { openSheet('<h2>Copy this</h2><textarea id="copyBox" readonly>' + esc(text) + '</textarea><button class="btn" data-act="close-sheet">Close</button>'); const t = $('#copyBox'); t.focus(); t.select(); } }

// ---------- rendering ----------
function toast(msg) { const t = $('#toast'); t.textContent = msg; t.hidden = false; clearTimeout(toast.t); toast.t = setTimeout(() => { t.hidden = true; }, 2600); }
function openSheet(html) { $('#sheetBody').innerHTML = html; $('#sheet').hidden = false; }
function closeSheet() { $('#sheet').hidden = true; $('#sheetBody').innerHTML = ''; stopPacer(); }

function tideSvg(key) {
  const { w, b } = span(), now = logicalNow(); const W = 320, H = 70; let d = '';
  for (let x = 0; x <= W; x += 4) { const y = H / 2 - Math.sin((x / W) * Math.PI * 2 - Math.PI / 2) * -18 * Math.cos((x / W) * Math.PI) - Math.sin((x / W) * Math.PI) * 14; d += (x ? 'L' : 'M') + x + ' ' + y.toFixed(1); }
  let dot = '';
  if (key === now.key) { const f = Math.min(1, Math.max(0, (now.min - w) / (b - w))); const x = f * W; const y = H / 2 - Math.sin(f * Math.PI * 2 - Math.PI / 2) * -18 * Math.cos(f * Math.PI) - Math.sin(f * Math.PI) * 14;
    dot = '<line x1="' + x.toFixed(1) + '" y1="4" x2="' + x.toFixed(1) + '" y2="' + (H - 4) + '" stroke="currentColor" stroke-opacity=".3" stroke-dasharray="2 3"/><circle cx="' + x.toFixed(1) + '" cy="' + y.toFixed(1) + '" r="6" fill="currentColor"/>'; }
  return '<svg viewBox="-8 0 ' + (W + 16) + ' ' + H + '" role="img" aria-label="Your day from wake to lights-out"><path d="' + d + '" fill="none" stroke="currentColor" stroke-opacity=".55" stroke-width="2.5" stroke-linecap="round"/>' + dot + '</svg>';
}

function heroImg(key) { const now = logicalNow(); if (key !== now.key) return 'dawn'; const { b } = span(); return now.min < 11 * 60 ? 'dawn' : now.min < 17 * 60 ? 'day' : now.min < b - 120 ? 'dusk' : 'night'; }
function hero(img, eyebrow, title, sub, extra, cls) {
  return '<header class="hero ' + (cls || 'sub') + '" style="--img:url(img/' + img + '.webp)"><div class="hero-img"></div><div class="hero-top"><span class="mark">Tide</span>' + (extra && extra.top || '') + '</div><div class="hero-main"><div class="eyebrow">' + eyebrow + '</div><h1>' + title + '</h1>' + (sub ? '<p>' + sub + '</p>' : '') + '</div>' + (extra && extra.bottom || '') + '</header>';
}
function blockHtml(b, now, isToday) {
  const isNow = isToday && b.dur && now.min >= b.start && now.min < b.start + b.dur, open = ui.open === b.id;
  const past = isToday ? b.start + b.dur <= now.min && b.dur > 0 : false;
  return '<li class="blk cat-' + b.cat + (b.done ? ' done' : '') + (isNow ? ' now' : '') + (past ? ' past' : '') + '">' +
    '<div class="when">' + fmt(b.start) + '<span>' + (b.dur ? dur(b.dur) : '') + '</span></div>' +
    '<button class="body" data-act="open" data-id="' + b.id + '" aria-expanded="' + open + '"><div class="cat">' + CATS[b.cat] + (isNow ? ' · now' : '') + '</div><div class="ttl">' + esc(b.title) + '</div>' + (b.note && (open || isNow) ? '<div class="note">' + esc(b.note) + '</div>' : '') + '</button>' +
    '<button class="chk" data-act="done" data-id="' + b.id + '" aria-label="' + (b.done ? 'Mark not done' : 'Mark done') + '"><i>' + (b.done ? '✓' : '') + '</i></button>' +
    (open ? '<div class="acts">' + [['swap', 'Swap'], ['edit', 'Edit'], ['earlier', '−15 min'], ['later', '+15 min'], ['cal', 'Add to calendar'], ['del', 'Remove']].map(a => '<button class="btn sm' + (a[0] === 'del' ? ' danger' : '') + '" data-act="' + a[0] + '" data-id="' + b.id + '">' + a[1] + '</button>').join('') + '</div>' : '') + '</li>';
}

function renderToday() {
  const key = viewKey(), now = logicalNow(), isToday = key === now.key, d = getDay(key);
  const date = keyDate(key).toLocaleDateString(undefined, { weekday: 'long', day: 'numeric', month: 'long' });
  const cur = isToday && d.blocks.find(b => b.dur && now.min >= b.start && now.min < b.start + b.dur);
  const nxt = isToday && d.blocks.find(b => b.start > now.min);
  const doneN = d.blocks.filter(b => b.done).length;
  const { w, b } = span();
  const tasks = state.tasks.filter(t => !t.done || t.doneDay === now.key);
  const short = keyDate(key).toLocaleDateString(undefined, { weekday: 'short', day: 'numeric', month: 'short' });
  const label = ui.dayOffset === 1 ? 'Tomorrow' : ui.dayOffset === -1 ? 'Yesterday' : 'Day view';
  const eyebrow = !isToday ? label + ' · ' + d.blocks.length + ' blocks' : cur ? 'Now · until ' + fmt(cur.start + cur.dur) : nxt ? 'Next · ' + fmt(nxt.start) : 'Day complete';
  const title = !isToday ? esc(date) : cur ? esc(cur.title) : nxt ? esc(nxt.title) : '<em>Rest.</em>';
  const sub = !isToday ? '' : cur && nxt ? 'Then ' + esc(nxt.title.charAt(0).toLowerCase() + nxt.title.slice(1)) + ' at ' + fmt(nxt.start) + '.' : !cur && !nxt ? 'Nothing left to do today. Phone across the room.' : '';
  const gl = state.g.connected ? '<div class="gline"><span>Google · ' + esc(G.status || (state.g.last ? 'synced ' + new Date(state.g.last).toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' }) : 'not synced yet')) + '</span><button class="btn sm" data-act="g-sync">Sync now</button></div>' : '';
  return hero(heroImg(key), eyebrow, title, sub, { top: '<div class="daynav"><button data-act="day" data-n="-1" aria-label="Previous day">‹</button><button data-act="day" data-n="0" aria-label="Back to today">' + esc(short) + '</button><button data-act="day" data-n="1" aria-label="Next day">›</button></div>',
    bottom: '<div class="hero-tide">' + tideSvg(key) + '<div class="ends"><span>Wake ' + fmt(w) + '</span><span>' + doneN + ' / ' + d.blocks.length + ' done</span><span>Lights out ' + fmt(b) + '</span></div></div>' }, 'full') + '<!--b-->' + gl +
    '<section class="stack"><div class="eyebrow">How is today, honestly?</div><div class="moods">' + ['Heavy', 'Low', 'Okay', 'Good', 'Light'].map((m, i) => '<button data-act="mood" data-n="' + (i + 1) + '" class="' + (d.mood === i + 1 ? 'on' : '') + '">' + m + '</button>').join('') + '</div></section>' +
    '<section class="stack"><div class="row between"><h2>The day</h2><div class="row"><button class="btn sm" data-act="add-block">Add block</button><button class="btn sm" data-act="day-menu">Calendar and share</button></div></div>' +
    '<ul class="blocks">' + d.blocks.map(x => blockHtml(x, now, isToday)).join('') + '</ul></section>' +
    '<section class="card"><h2>Tasks</h2><form class="addrow" data-form="task"><input type="text" id="taskIn" placeholder="Add a task" autocomplete="off"><button class="btn primary">Add</button></form>' +
    (tasks.length ? '<ul class="list">' + tasks.map(t => '<li><input type="checkbox" data-act="task" data-id="' + t.id + '"' + (t.done ? ' checked' : '') + ' aria-label="Done"><span class="txt' + (t.done ? ' done' : '') + '">' + esc(t.text) + '</span><button class="x" data-act="task-del" data-id="' + t.id + '" aria-label="Delete task">×</button></li>').join('') + '</ul>' : '<p class="muted small">Nothing open. Add what would make today enough, three at most.</p>') + '</section>';
}

function renderPlan() {
  const s = state.settings;
  const tog = (k, label) => '<label class="tog"><input type="checkbox" data-set="inc.' + k + '"' + (s.inc[k] ? ' checked' : '') + '> ' + label + '</label>';
  return hero('plan', 'Plan', 'Shape your <em>day</em>', 'Fix the two ends, wake and lights out. Everything between can move.') + '<!--b-->' +
    '<section class="card"><h2>Sleep anchors</h2><div class="grid2"><label class="f">Wake<input type="time" id="setWake" data-set="wake" value="' + s.wake + '"></label><label class="f">Lights out<input type="time" id="setBed" data-set="bed" value="' + s.bed + '"></label></div>' +
    '<div class="row">' + ['00:00', '00:30', '01:00'].map(t => '<button class="chip' + (s.bed === t ? ' on' : '') + '" data-act="bed" data-v="' + t + '">' + fmt(toMin(t)) + '</button>').join('') + '</div><p class="small muted">Wind-down starts two hours before lights out, at ' + fmt(span().b - 120) + '. Feeds go off then.</p></section>' +
    '<section class="card"><h2>Day type</h2><div class="row">' + Object.entries(DAY_TYPES).map(([k, t]) => '<button class="chip' + (s.dayType === k ? ' on' : '') + '" data-act="daytype" data-v="' + k + '">' + t.name + '</button>').join('') + '</div><p class="small muted">' + DAY_TYPES[s.dayType].hint + '</p>' +
    '<div class="row"><span class="small muted">Focus blocks</span>' + [0, 1, 2, 3].map(n => '<button class="chip' + (s.work === n ? ' on' : '') + '" data-act="work" data-v="' + n + '">' + n + '</button>').join('') + '</div></section>' +
    '<section class="card"><h2>What goes in</h2>' + tog('move', 'Morning movement') + tog('nap', 'Afternoon nap') + tog('friends', 'Time with friends') + tog('journal', 'Journaling and worry slot') + tog('meditate', 'Meditation before bed') + tog('detox', 'Feed detox in wind-down') + '</section>' +
    '<section class="card"><h2>Apply</h2><p class="small muted">Changing settings does not touch days you already edited. Rebuild when you want a fresh plan.</p><div class="row"><button class="btn primary" data-act="rebuild" data-n="0">Rebuild today</button><button class="btn" data-act="rebuild" data-n="1">Rebuild tomorrow</button></div>' +
    '<div class="row"><button class="btn" data-act="save-template">Save today as my default</button>' + (state.template ? '<button class="btn danger" data-act="clear-template">Clear my default</button>' : '') + '</div><p class="small muted">' + (state.template ? 'New days copy your saved default.' : 'New days are built from the settings above.') + '</p></section>' +
    '<section class="card"><h2>Reminders</h2><label class="tog"><input type="checkbox" data-act="notify"' + (s.notify ? ' checked' : '') + '> Notify me when a block starts</label><p class="small muted">Browser notifications only fire while Tide is open or recently used. For reminders that always fire, open Today, tap Calendar and share, and add the day to your phone calendar. Each event carries its own alert.</p></section>';
}

function renderJournal() {
  const p = PROMPTS[ui.prompt], now = logicalNow();
  const last14 = []; for (let i = 13; i >= 0; i--) { const d = state.days[addDays(now.key, -i)]; last14.push(d ? d.mood : 0); }
  const weekAgo = Date.now() - 7 * 864e5, moods = last14.slice(7).filter(Boolean);
  return hero('journal', 'Journal', 'Write it <em>out</em>', 'On the page it stops circling.') + '<!--b-->' +
    '<section class="card"><div class="row">' + PROMPTS.map((x, i) => '<button class="chip' + (ui.prompt === i ? ' on' : '') + '" data-act="prompt" data-n="' + i + '">' + x[0] + '</button>').join('') + '</div>' +
    '<textarea id="jText" placeholder="Start anywhere.">' + esc(draft() || p[1]) + '</textarea>' +
    '<div class="row between"><div class="row"><span class="small muted">Mood</span>' + [1, 2, 3, 4, 5].map(n => '<button class="chip' + (ui.jmood === n ? ' on' : '') + '" data-act="jmood" data-n="' + n + '">' + n + '</button>').join('') + '</div><div class="row">' + (window.SpeechRecognition || window.webkitSpeechRecognition ? '<button class="btn sm" data-act="dictate">Dictate</button>' : '') + '<button class="btn primary" data-act="jsave">Save entry</button></div></div></section>' +
    '<section class="card"><h2>Last two weeks</h2><div class="bars" role="img" aria-label="Daily mood, last 14 days">' + last14.map(m => '<i class="' + (m ? '' : 'none') + '" style="height:' + (m ? m * 20 : 4) + '%"></i>').join('') + '</div>' +
    '<div class="stat"><div><b>' + state.journal.filter(j => j.ts > weekAgo).length + '</b><span>entries this week</span></div><div><b>' + (moods.length ? (moods.reduce((a, c) => a + c, 0) / moods.length).toFixed(1) : '–') + '</b><span>average mood, 7 days</span></div><div><b>' + state.waves.filter(x => x.ts > weekAgo).length + '</b><span>waves this week</span></div></div></section>' +
    '<section class="card"><h2>Entries</h2>' + (state.journal.length ? '<ul class="list">' + state.journal.slice().reverse().map(j => '<li><div class="txt"><span class="eyebrow">' + esc(new Date(j.ts).toLocaleString(undefined, { day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit' })) + ' · ' + esc(j.prompt) + (j.mood ? ' · mood ' + j.mood : '') + '</span>\n' + esc(j.text) + '</div><button class="x" data-act="jdel" data-id="' + j.id + '" aria-label="Delete entry">×</button></li>').join('') + '</ul>' : '<p class="muted small">No entries yet. The worry slot is a good first one: 15 minutes, everything on the page, then stop.</p>') + '</section>';
}
const draft = () => { try { return sessionStorage.getItem('tide.draft') || ''; } catch (e) { return ''; } };
const setDraft = v => { try { sessionStorage.setItem('tide.draft', v); } catch (e) { /* ignore */ } };

const PATTERNS = { '4-8': { name: '4 in, 8 out', hint: 'The long exhale calms the body. Best first choice.', seq: [['Breathe in', 4, 1], ['Breathe out', 8, 0]] }, box: { name: 'Box 4-4-4-4', hint: 'Steadying before work or a hard conversation.', seq: [['Breathe in', 4, 1], ['Hold', 4, 1], ['Breathe out', 4, 0], ['Hold', 4, 0]] }, sigh: { name: 'Double inhale', hint: 'Two sniffs in, one long sigh out. Fast relief.', seq: [['In', 2, 0.8], ['In again', 1, 1], ['Long sigh out', 6, 0]] }, '478': { name: '4-7-8', hint: 'For falling asleep.', seq: [['Breathe in', 4, 1], ['Hold', 7, 1], ['Breathe out', 8, 0]] } };
function pacerHtml() { return '<div class="pacer"><div class="orb-wrap"><div class="orb" id="orb"></div></div><div class="phase" id="phase">Ready</div><div class="row"><button class="btn primary" data-act="pacer">Start</button><button class="btn" data-act="pacer-stop">Stop</button></div></div>'; }
let pacerOn = false, pacerT = null;
function startPacer() {
  stopPacer(); pacerOn = true; const seq = PATTERNS[ui.pattern].seq; let i = 0;
  const step = () => { if (!pacerOn) return; const orb = $('#orb'), ph = $('#phase'); if (!orb) return stopPacer(); const [label, secs, size] = seq[i % seq.length];
    orb.style.transitionDuration = secs + 's'; orb.style.transform = 'scale(' + (0.45 + 0.55 * size) + ')'; ph.textContent = label; i++; pacerT = setTimeout(step, secs * 1000); };
  step();
}
function stopPacer() { pacerOn = false; clearTimeout(pacerT); const ph = $('#phase'); if (ph) ph.textContent = 'Ready'; const orb = $('#orb'); if (orb) { orb.style.transitionDuration = '0.6s'; orb.style.transform = 'scale(0.45)'; } }
let urgeEnd = 0, urgeT = null;
function tickUrge() { const el = $('#urge'); if (!el) return clearInterval(urgeT); const left = Math.max(0, Math.round((urgeEnd - Date.now()) / 1000)); el.textContent = pad(Math.floor(left / 60)) + ':' + pad(left % 60); if (!left && urgeEnd) { urgeEnd = 0; clearInterval(urgeT); toast('Ten minutes passed. Is the urge smaller?'); } }

function renderCalm() {
  const weekAgo = Date.now() - 7 * 864e5;
  return hero('calm', 'Calm', 'Back to the <em>body</em>', 'A wave peaks and passes in a few minutes if you do not feed it.') + '<!--b-->' +
    '<section class="card"><h2>Breathing pacer</h2><div class="row">' + Object.entries(PATTERNS).map(([k, p]) => '<button class="chip' + (ui.pattern === k ? ' on' : '') + '" data-act="pattern" data-v="' + k + '">' + p.name + '</button>').join('') + '</div><p class="small muted">' + PATTERNS[ui.pattern].hint + '</p>' + pacerHtml() + '</section>' +
    '<section class="card"><h2>Urge timer</h2><p class="small muted">Want to text, unblock, or check a profile? Start ten minutes and do one small task. Urges peak and fall on their own.</p><div class="timer" id="urge">10:00</div><div class="row"><button class="btn primary" data-act="urge">Start 10 minutes</button><button class="btn" data-act="urge-stop">Reset</button></div></section>' +
    '<section class="card"><h2>RAIN</h2><ol class="steps">' + LIBRARY[1].points.slice(0, 4).map(x => '<li>' + esc(x) + '</li>').join('') + '</ol></section>' +
    '<section class="card"><h2>Grounding 5-4-3-2-1</h2><ol class="steps"><li>Five things you can see. Say them.</li><li>Four things you can hear.</li><li>Three things you can touch. Touch them.</li><li>Two things you can smell.</li><li>One thing you can taste. Then keep walking.</li></ol></section>' +
    '<section class="card"><div class="row between"><h2>Wave log</h2><span class="small muted">' + state.waves.filter(x => x.ts > weekAgo).length + ' this week</span></div>' +
    (state.waves.length ? '<ul class="list">' + state.waves.slice(-12).reverse().map(x => '<li><div class="txt"><span class="eyebrow">' + esc(new Date(x.ts).toLocaleString(undefined, { day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit' })) + ' · strength ' + x.level + ' of 5' + (x.trigger ? ' · ' + esc(x.trigger) : '') + '</span>' + (x.note ? '\n' + esc(x.note) : '') + '</div><button class="x" data-act="wave-del" data-id="' + x.id + '" aria-label="Delete">×</button></li>').join('') + '</ul><p class="small muted">Logging shows you the pattern: when they come, and that every one of them ended.</p>' : '<p class="muted small">When a wave of sadness hits, tap Wave hit. It walks you through it and logs it here, so you can see they pass and get rarer.</p>') + '</section>';
}

function ncDays() { return state.nc.start ? Math.floor((Date.now() - state.nc.start) / 864e5) : 0; }
function renderMore() {
  const today = getDay(logicalNow().key), n = ncDays();
  return hero('more', 'More', 'Tools and <em>notes</em>', '') + '<!--b-->' +
    '<section class="card"><h2>No-contact tracker</h2>' + (state.nc.start ? '<div class="row between"><div><div class="big">' + n + '</div><span class="small muted">day' + (n === 1 ? '' : 's') + ' · goal 30 · best ' + Math.max(state.nc.best, n) + '</span></div><button class="btn sm danger" data-act="nc-reset">I made contact</button></div>' : '<p class="small muted">Thirty days with no messages, calls or checking. You do not announce it or explain it. Slipping is not failing, you restart the count.</p><button class="btn primary" data-act="nc-start">Start today</button>') +
    '<h3>Today</h3><ul class="list">' + NC_ITEMS.map(([k, label]) => '<li><input type="checkbox" id="nc-' + k + '" data-act="nc-check" data-id="' + k + '"' + (today.nc[k] ? ' checked' : '') + '><label class="txt" for="nc-' + k + '">' + label + '</label></li>').join('') + '</ul></section>' +
    '<section class="card"><h2>What to take in, what to skip</h2><h3>Take in</h3><ul class="plain">' + CONSUME.yes.map(x => '<li>' + x + '</li>').join('') + '</ul><h3>Skip</h3><ul class="plain">' + CONSUME.no.map(x => '<li>' + x + '</li>').join('') + '</ul></section>' +
    '<section class="card"><h2>Library</h2><p class="small muted">Key ideas in plain words, with room for your own takeaways.</p>' + LIBRARY.map(l => '<details' + (ui.libOpen === l.id ? ' open' : '') + ' data-lib="' + l.id + '"><summary>' + esc(l.title) + '</summary><div><ul class="plain">' + l.points.map(x => '<li>' + esc(x) + '</li>').join('') + '</ul>' + (l.link ? '<a href="' + l.link + '" target="_blank" rel="noopener">' + esc(l.linkText) + '</a>' : '') + '<label class="f">My takeaways<textarea id="note-' + l.id + '" data-note="' + l.id + '" placeholder="What I want to remember and use">' + esc(state.notes[l.id] || '') + '</textarea></label></div></details>').join('') + '</section>' +
    '<section class="card"><h2>Quote notebook</h2><form class="stack" data-form="quote"><input type="text" id="quoteIn" placeholder="A line worth keeping" autocomplete="off"><div class="addrow"><input type="text" id="quoteSrc" placeholder="Who said it (optional)" autocomplete="off"><button class="btn primary">Keep</button></div></form>' +
    (state.quotes.length ? '<ul class="list">' + state.quotes.slice().reverse().map(q => '<li><div class="txt"><span class="quote">' + esc(q.text) + '</span>' + (q.src ? '\n<span class="eyebrow">' + esc(q.src) + '</span>' : '') + '</div><button class="x" data-act="quote-del" data-id="' + q.id + '" aria-label="Delete quote">×</button></li>').join('') + '</ul>' : '') + '</section>' +
    '<section class="card"><h2>Google Calendar and Tasks</h2><p class="small muted">Connect once and Tide keeps a calendar named Tide (today and tomorrow, with an alert at each block) and a task list named Tide in your Google account. Tasks sync both ways: tick one in Google Tasks and it is ticked here.</p>' +
    (state.g.connected ? '<div class="row"><button class="btn primary" data-act="g-sync">Sync now</button><button class="btn danger" data-act="g-off">Disconnect</button></div>' : '<details><summary>One-time setup, about five minutes</summary><div><ol class="steps"><li>Open console.cloud.google.com and create a project.</li><li>APIs and Services → Library: enable <b>Google Calendar API</b> and <b>Google Tasks API</b>.</li><li>OAuth consent screen: choose External, fill in the app name and your email, and add your own Gmail address under Test users.</li><li>Credentials → Create credentials → OAuth client ID → Web application. Under Authorised JavaScript origins add <b>' + esc(location.origin) + '</b>.</li><li>Copy the client ID and paste it below.</li></ol></div></details><label class="f">Google client ID<input type="text" id="gClient" value="' + esc(state.g.clientId) + '" placeholder="…apps.googleusercontent.com" autocomplete="off"></label><div class="row"><button class="btn primary" data-act="g-connect">Connect Google</button></div>') +
    '<p class="small muted" id="gStatus">' + esc(G.status || (state.g.connected ? (state.g.last ? 'Last synced ' + new Date(state.g.last).toLocaleString() : 'Connected.') + ' Google asks you to confirm again about once an hour; tap Sync now when it does.' : 'Not connected. Without it, use Calendar and share on the Today screen to add a day to any calendar.')) + '</p></section>' +
    '<section class="card"><h2>Sync across devices</h2><p class="small muted">Optional. Tide can keep a copy of your data in a secret GitHub gist on your own account and pull it on your other devices. Create a token at github.com → Settings → Developer settings → Fine-grained tokens with only the Gists permission (read and write), then paste it on each device. A secret gist is unlisted, but anyone who has its link can read it, so never share that link.</p>' +
    '<label class="f">GitHub token<input type="password" id="syncToken" value="' + esc(sync.token) + '" placeholder="github_pat_…" autocomplete="off"></label><div class="row"><button class="btn primary" data-act="sync-save">' + (sync.token ? 'Sync now' : 'Turn on sync') + '</button>' + (sync.token ? '<button class="btn danger" data-act="sync-off">Turn off on this device</button>' : '') + '</div><p class="small muted" id="syncStatus">' + esc(sync.status || (sync.last ? 'Last synced ' + new Date(sync.last).toLocaleString() : 'Not syncing. Data lives on this device only.')) + '</p></section>' +
    '<section class="card"><h2>Backup</h2><p class="small muted">Download everything as one file, or restore from a file.</p><div class="row"><button class="btn" data-act="export">Download backup</button><label class="btn">Restore from file<input type="file" id="importFile" accept="application/json,.json" hidden></label></div></section>' +
    '<section class="card"><h2>Appearance</h2><div class="row">' + [['auto', 'Match phone'], ['light', 'Light'], ['dark', 'Dark']].map(([k, l]) => '<button class="chip' + (state.settings.theme === k ? ' on' : '') + '" data-act="theme" data-v="' + k + '">' + l + '</button>').join('') + '</div></section>' +
    '<section class="card"><h2>When it is too heavy</h2><p>Tele-MANAS, India\'s free mental health line, answers day and night: <b>14416</b>.</p><p class="small muted">Your campus counselling or wellness centre is free and sees this often. If the sadness stays heavy for weeks, or you feel unsafe, talk to a person today. An app is not enough for that.</p></section>' +
    '<section class="card"><h3>Photographs</h3><div class="credits">' + CREDITS.map(c => '<span>' + c[0] + ': <a href="' + esc(c[4]) + '" target="_blank" rel="noopener">' + esc(c[1]) + '</a> by ' + esc(c[2]) + ', ' + c[3] + ', cropped. Wikimedia Commons.</span>').join('') + '</div></section>';
}

function render() {
  const v = $('#view'); stopPacer();
  v.classList.toggle('enter', render.last !== ui.tab + ui.dayOffset); render.last = ui.tab + ui.dayOffset;
  v.innerHTML = { today: renderToday, plan: renderPlan, journal: renderJournal, calm: renderCalm, more: renderMore }[ui.tab]().replace('<!--b-->', '<div class="wrap">') + '</div>';
  document.querySelectorAll('.tabs button').forEach(b => { b.classList.toggle('on', b.dataset.tab === ui.tab); b.setAttribute('aria-current', b.dataset.tab === ui.tab ? 'page' : 'false'); });
  const th = state.settings.theme; if (th === 'auto') document.documentElement.removeAttribute('data-theme'); else document.documentElement.setAttribute('data-theme', th);
  if (ui.tab === 'calm' && urgeEnd) { tickUrge(); }
}

// ---------- sheets ----------
function editSheet(b) {
  const isNew = !b; b = b || { id: '', start: Math.ceil(logicalNow().min / 15) * 15, dur: 30, cat: 'fun', title: '', note: '' };
  openSheet('<h2>' + (isNew ? 'Add a block' : 'Edit block') + '</h2><form class="stack" data-form="block" data-id="' + b.id + '"><label class="f">What<input type="text" id="bTitle" value="' + esc(b.title) + '" required></label><label class="f">Note<input type="text" id="bNote" value="' + esc(b.note) + '"></label>' +
    '<div class="grid2"><label class="f">Starts<input type="time" id="bStart" value="' + toHHMM(b.start) + '" required></label><label class="f">Minutes<input type="number" id="bDur" value="' + b.dur + '" min="0" max="600" step="5" inputmode="numeric" required></label></div>' +
    '<label class="f">Kind<select id="bCat">' + Object.entries(CATS).map(([k, n]) => '<option value="' + k + '"' + (b.cat === k ? ' selected' : '') + '>' + n + '</option>').join('') + '</select></label><div class="row"><button class="btn primary">Save</button><button type="button" class="btn" data-act="close-sheet">Cancel</button></div></form>');
}
function swapSheet(b) {
  openSheet('<h2>Swap "' + esc(b.title) + '"</h2><div class="row">' + Object.entries(CATS).filter(([k]) => k !== 'sleep').map(([k, n]) => '<button class="chip' + (k === (swapSheet.cat || b.cat) ? ' on' : '') + '" data-act="swap-cat" data-id="' + b.id + '" data-v="' + k + '">' + n + '</button>').join('') + '</div><button class="btn primary" data-act="swap-rand" data-id="' + b.id + '">Surprise me</button>' +
    (ALT[swapSheet.cat || b.cat] || []).map((a, i) => '<button class="opt" data-act="swap-pick" data-id="' + b.id + '" data-n="' + i + '"><b>' + esc(a[0]) + '</b><span>' + esc(a[1]) + '</span></button>').join('') + '<button class="btn" data-act="close-sheet">Keep as is</button>');
}
function calSheet(b) {
  const key = viewKey(), r = calSheet.recur || 'once';
  const title = b ? 'Add "' + esc(b.title) + '" to calendar' : 'Whole day to calendar';
  openSheet('<h2>' + title + '</h2><div class="row">' + Object.entries(RECUR).map(([k, v]) => '<button class="chip' + (r === k ? ' on' : '') + '" data-act="cal-recur" data-id="' + (b ? b.id : '') + '" data-v="' + k + '">' + v[0] + '</button>').join('') + '</div>' +
    (b ? '<a class="btn primary" href="' + esc(gcalLink(key, b, r)) + '" target="_blank" rel="noopener">Open in Google Calendar</a>' : '') +
    '<button class="btn' + (b ? '' : ' primary') + '" data-act="cal-ics" data-id="' + (b ? b.id : '') + '">Download calendar file (.ics)</button><p class="small muted">Opening the .ics file adds ' + (b ? 'this block' : 'every block') + ' to your phone calendar (Google, Apple, Outlook) with an alert at the start time.</p>' +
    (b ? '' : '<button class="btn" data-act="copy-plan">Copy plan as text</button>' + (navigator.share ? '<button class="btn" data-act="share-plan">Share plan</button>' : '')) + '<button class="btn quiet" data-act="close-sheet">Close</button>');
}
const WAVE = [
  () => '<div class="eyebrow">Step 1 of 4</div><h2>Breathe out slowly</h2><p class="muted">In for 4, out for 8. Four rounds. The long exhale tells your body the alarm is over.</p>' + pacerHtml(),
  () => '<div class="eyebrow">Step 2 of 4</div><h2>Name it</h2><p>Say it, out loud if you can:</p><p><b>"This is a wave of sadness. It will peak and pass."</b></p><p class="muted">The feeling is the wave. The replay of what was said, and what you should have said, is what keeps it going. You do not have to replay. Of course this hurts. You cared a lot.</p>',
  () => '<div class="eyebrow">Step 3 of 4</div><h2>Ground yourself</h2><ol class="steps"><li>Five things you can see</li><li>Four things you can hear</li><li>Three things you can touch</li></ol><p class="muted">Keep walking. Do not turn to look. If there is an urge to message or check, start the ten-minute timer in Calm and do one small task.</p>',
  () => '<div class="eyebrow">Step 4 of 4</div><h2>Log it</h2><div class="row"><span class="small muted">Strength</span>' + [1, 2, 3, 4, 5].map(n => '<button class="chip' + ((WAVE.level || 3) === n ? ' on' : '') + '" data-act="wave-level" data-n="' + n + '">' + n + '</button>').join('') + '</div><div class="row">' + ['Saw them', 'A call or message', 'A memory', 'Social media', 'Night', 'Out of nowhere'].map(t => '<button class="chip' + (WAVE.trigger === t ? ' on' : '') + '" data-act="wave-trigger" data-v="' + t + '">' + t + '</button>').join('') + '</div><label class="f">Note (optional)<input type="text" id="waveNote" value="' + esc(WAVE.note || '') + '" placeholder="What helped?"></label>'
];
function waveSheet(step) {
  WAVE.step = step; const last = step === WAVE.length - 1;
  openSheet('<div class="sheet-photo" style="--img:url(img/wave.webp)"></div>' + WAVE[step]() + '<div class="row">' + (last ? '<button class="btn primary" data-act="wave-save">Save and close</button>' : '<button class="btn primary" data-act="wave-next">Next</button>') + '<button class="btn quiet" data-act="close-sheet">Close</button></div>');
  if (step === 0) { ui.patternSaved = ui.pattern; ui.pattern = '4-8'; startPacer(); ui.pattern = ui.patternSaved; }
}

// ---------- actions ----------
const A = {
  'close-sheet': () => closeSheet(),
  open: (el) => { ui.open = ui.open === el.dataset.id ? null : el.dataset.id; render(); },
  done: (el) => { const b = findBlock(el.dataset.id); b.done = !b.done; save(); render(); },
  earlier: (el) => { const b = findBlock(el.dataset.id); b.start -= 15; sortDay(getDay(viewKey())); save(); render(); },
  later: (el) => { const b = findBlock(el.dataset.id); b.start += 15; sortDay(getDay(viewKey())); save(); render(); },
  del: (el) => { const d = getDay(viewKey()); const i = d.blocks.findIndex(x => x.id === el.dataset.id); const [gone] = d.blocks.splice(i, 1); save(); render(); A.undo = () => { d.blocks.push(gone); sortDay(d); save(); render(); }; const t = $('#toast'); t.innerHTML = 'Removed. <button class="btn sm" data-act="undo">Undo</button>'; t.hidden = false; clearTimeout(toast.t); toast.t = setTimeout(() => { t.hidden = true; }, 5000); },
  edit: (el) => editSheet(findBlock(el.dataset.id)),
  'add-block': () => editSheet(null),
  swap: (el) => { swapSheet.cat = null; swapSheet(findBlock(el.dataset.id)); },
  'swap-cat': (el) => { swapSheet.cat = el.dataset.v; swapSheet(findBlock(el.dataset.id)); },
  'swap-pick': (el) => { const b = findBlock(el.dataset.id), cat = swapSheet.cat || b.cat, a = ALT[cat][+el.dataset.n]; b.cat = cat; b.title = a[0]; b.note = a[1]; save(); closeSheet(); render(); },
  'swap-rand': (el) => { const b = findBlock(el.dataset.id), cat = swapSheet.cat || b.cat, a = pick(ALT[cat].filter(x => x[0] !== b.title)); b.cat = cat; b.title = a[0]; b.note = a[1]; save(); closeSheet(); render(); toast('Swapped to: ' + a[0]); },
  cal: (el) => { calSheet.recur = 'once'; calSheet(findBlock(el.dataset.id)); },
  'day-menu': () => { calSheet.recur = 'once'; calSheet(null); },
  'cal-recur': (el) => { calSheet.recur = el.dataset.v; calSheet(el.dataset.id ? findBlock(el.dataset.id) : null); },
  'cal-ics': (el) => { const key = viewKey(), b = el.dataset.id && findBlock(el.dataset.id); download(b ? 'tide-block.ics' : 'tide-' + key + '.ics', ics(key, b ? [b] : getDay(key).blocks, calSheet.recur || 'once'), 'text/calendar'); toast('Open the downloaded file to add it'); },
  'copy-plan': () => copy(planText(viewKey()), 'Plan copied'),
  'share-plan': () => navigator.share({ title: 'My plan', text: planText(viewKey()) }).catch(() => {}),
  day: (el) => { ui.dayOffset = +el.dataset.n === 0 ? 0 : ui.dayOffset + +el.dataset.n; ui.open = null; render(); },
  mood: (el) => { const d = getDay(viewKey()); d.mood = d.mood === +el.dataset.n ? 0 : +el.dataset.n; save(); render(); if (d.mood === 1) toast('Heavy days count too. Try the Gentle day type in Plan.'); },
  task: (el) => { const t = state.tasks.find(x => x.id === el.dataset.id); t.done = !t.done; t.doneDay = t.done ? logicalNow().key : null; t.u = Date.now(); save(); render(); },
  'task-del': (el) => { const t = state.tasks.find(x => x.id === el.dataset.id); if (t && t.gid) state.g.delTasks.push(t.gid); state.tasks = state.tasks.filter(x => x.id !== el.dataset.id); save(); render(); },
  bed: (el) => { state.settings.bed = el.dataset.v; save(); render(); },
  daytype: (el) => { state.settings.dayType = el.dataset.v; save(); render(); },
  work: (el) => { state.settings.work = +el.dataset.v; save(); render(); },
  rebuild: (el) => { const key = addDays(logicalNow().key, +el.dataset.n); const old = state.days[key] || {}; state.days[key] = { blocks: buildDay(), mood: old.mood || 0, nc: old.nc || {} }; save(); ui.dayOffset = +el.dataset.n; ui.tab = 'today'; render(); window.scrollTo(0, 0); toast('Fresh plan built'); },
  'save-template': () => { state.template = getDay(logicalNow().key).blocks.map(b => ({ start: b.start, dur: b.dur, cat: b.cat, title: b.title, note: b.note })); save(); render(); toast('Saved. New days will copy today.'); },
  'clear-template': () => { state.template = null; save(); render(); },
  notify: async (el) => { if (el.checked) { if (!('Notification' in window)) { toast('This browser does not support notifications'); el.checked = false; return; } const p = await Notification.requestPermission(); if (p !== 'granted') { toast('Notifications are blocked in browser settings'); el.checked = false; return; } } state.settings.notify = el.checked; save(); },
  prompt: (el) => { ui.prompt = +el.dataset.n; setDraft(''); render(); },
  jmood: (el) => { const t = $('#jText'); if (t) setDraft(t.value); ui.jmood = ui.jmood === +el.dataset.n ? 0 : +el.dataset.n; render(); },
  jsave: () => { const text = $('#jText').value.trim(); if (!text || text === PROMPTS[ui.prompt][1].trim()) { toast('Write something first'); return; } state.journal.push({ id: uid(), ts: Date.now(), prompt: PROMPTS[ui.prompt][0], text, mood: ui.jmood }); ui.jmood = 0; setDraft(''); save(); render(); toast('Saved'); },
  jdel: (el) => { state.journal = state.journal.filter(x => x.id !== el.dataset.id); save(); render(); },
  dictate: (el) => { const R = window.SpeechRecognition || window.webkitSpeechRecognition; const r = new R(); r.lang = navigator.language || 'en-IN'; r.onresult = e => { const t = $('#jText'); t.value = (t.value ? t.value + ' ' : '') + e.results[0][0].transcript; setDraft(t.value); }; r.onerror = () => toast('Could not hear that'); r.onend = () => { el.textContent = 'Dictate'; }; el.textContent = 'Listening…'; r.start(); },
  pattern: (el) => { ui.pattern = el.dataset.v; render(); },
  pacer: () => startPacer(), 'pacer-stop': () => stopPacer(),
  urge: () => { urgeEnd = Date.now() + 600000; clearInterval(urgeT); urgeT = setInterval(tickUrge, 1000); tickUrge(); },
  'urge-stop': () => { urgeEnd = 0; clearInterval(urgeT); const el = $('#urge'); if (el) el.textContent = '10:00'; },
  wave: () => { WAVE.level = 3; WAVE.trigger = ''; WAVE.note = ''; waveSheet(0); },
  'wave-next': () => { stopPacer(); waveSheet(WAVE.step + 1); },
  'wave-level': (el) => { WAVE.note = $('#waveNote').value; WAVE.level = +el.dataset.n; waveSheet(WAVE.step); },
  'wave-trigger': (el) => { WAVE.note = $('#waveNote').value; WAVE.trigger = WAVE.trigger === el.dataset.v ? '' : el.dataset.v; waveSheet(WAVE.step); },
  'wave-save': () => { state.waves.push({ id: uid(), ts: Date.now(), level: WAVE.level || 3, trigger: WAVE.trigger || '', note: $('#waveNote').value.trim() }); save(); closeSheet(); render(); toast('Logged. It passed, like the others.'); },
  'wave-del': (el) => { state.waves = state.waves.filter(x => x.id !== el.dataset.id); save(); render(); },
  'nc-start': () => { state.nc.start = Date.now(); save(); render(); },
  'nc-reset': () => openSheet('<h2>Restart the count?</h2><p class="muted">A slip is information, not failure. Note what led to it, then start again from today. Your best streak stays.</p><div class="row"><button class="btn primary" data-act="nc-reset-yes">Restart from today</button><button class="btn" data-act="close-sheet">Cancel</button></div>'),
  'nc-reset-yes': () => { state.nc.best = Math.max(state.nc.best, ncDays()); state.nc.resets++; state.nc.start = Date.now(); save(); closeSheet(); render(); },
  'nc-check': (el) => { getDay(logicalNow().key).nc[el.dataset.id] = el.checked; save(); },
  'quote-del': (el) => { state.quotes = state.quotes.filter(x => x.id !== el.dataset.id); save(); render(); },
  theme: (el) => { state.settings.theme = el.dataset.v; save(); render(); },
  export: () => download('tide-backup-' + dateKey(new Date()) + '.json', JSON.stringify(state, null, 1), 'application/json'),
  'sync-save': async () => { sync.token = $('#syncToken').value.trim(); if (!sync.token) { toast('Paste a token first'); return; } saveSync(); await syncNow(false); },
  'sync-off': () => { sync = { token: '', gistId: '', last: 0, status: '' }; saveSync(); render(); toast('Sync is off on this device'); },
  'g-connect': async () => { const v = $('#gClient').value.trim(); if (!/\.apps\.googleusercontent\.com$/.test(v)) { toast('That does not look like a client ID'); return; } state.g.clientId = v; save(true); await gSync(true); },
  'g-sync': () => gSync(true),
  'g-off': () => { G.token = ''; G.exp = 0; G.status = ''; try { sessionStorage.removeItem('tide.g'); } catch (e) { /* ignore */ } state.g.connected = false; save(true); render(); toast('Google disconnected'); },
  undo: () => {}
};

document.addEventListener('click', e => {
  const tab = e.target.closest('[data-tab]'); if (tab) { ui.tab = tab.dataset.tab; ui.open = null; render(); window.scrollTo(0, 0); return; }
  const el = e.target.closest('[data-act]'); if (!el || el.tagName === 'INPUT') return;
  if (A[el.dataset.act]) A[el.dataset.act](el);
});
document.addEventListener('change', e => {
  const el = e.target;
  if (el.dataset.act && el.tagName === 'INPUT' && A[el.dataset.act]) return A[el.dataset.act](el);
  if (el.dataset.set) { const k = el.dataset.set; if (k.startsWith('inc.')) state.settings.inc[k.slice(4)] = el.checked; else if (el.value) state.settings[k] = el.value; save(); render(); return; }
  if (el.dataset.note) { state.notes[el.dataset.note] = el.value; ui.libOpen = el.dataset.note; save(); return; }
  if (el.id === 'importFile' && el.files[0]) { const fr = new FileReader(); fr.onload = () => { try { const s = JSON.parse(fr.result); if (!s || !s.settings || !s.days) throw 0; state = migrate(s); save(); render(); toast('Restored'); } catch (err) { toast('That file is not a Tide backup'); } }; fr.readAsText(el.files[0]); }
});
document.addEventListener('input', e => { if (e.target.id === 'jText') setDraft(e.target.value); });
document.addEventListener('toggle', e => { const d = e.target; if (d.dataset && d.dataset.lib && d.open) ui.libOpen = d.dataset.lib; }, true);
document.addEventListener('submit', e => {
  e.preventDefault(); const f = e.target.dataset.form;
  if (f === 'task') { const v = $('#taskIn').value.trim(); if (!v) return; state.tasks.push({ id: uid(), text: v, done: false, doneDay: null, u: Date.now() }); save(); render(); $('#taskIn').focus(); }
  if (f === 'quote') { const v = $('#quoteIn').value.trim(); if (!v) return; state.quotes.push({ id: uid(), text: v, src: $('#quoteSrc').value.trim() }); save(); render(); }
  if (f === 'block') {
    const d = getDay(viewKey()), { w } = span(); let start = toMin($('#bStart').value); if (start < w - 60) start += 1440;
    const vals = { start, dur: Math.max(0, +$('#bDur').value || 0), cat: $('#bCat').value, title: $('#bTitle').value.trim() || 'Block', note: $('#bNote').value.trim() };
    const b = e.target.dataset.id && d.blocks.find(x => x.id === e.target.dataset.id);
    if (b) Object.assign(b, vals); else d.blocks.push(Object.assign({ id: uid(), done: false }, vals));
    sortDay(d); save(); closeSheet(); render();
  }
});
document.addEventListener('keydown', e => { if (e.key === 'Escape' && !$('#sheet').hidden) closeSheet(); });

// ---------- reminders ----------
const notified = new Set();
function checkReminders() {
  const now = logicalNow();
  if (state.settings.notify && 'Notification' in window && Notification.permission === 'granted') {
    getDay(now.key).blocks.forEach(b => {
      if (b.start === now.min && !b.done && !notified.has(now.key + b.id)) {
        notified.add(now.key + b.id); const body = b.note || (b.dur ? dur(b.dur) : '');
        if (navigator.serviceWorker && navigator.serviceWorker.controller) navigator.serviceWorker.ready.then(r => r.showNotification(b.title, { body, tag: b.id, icon: 'icons/icon-192.png' })).catch(() => {});
        else try { new Notification(b.title, { body, tag: b.id }); } catch (e) { /* unsupported */ }
      }
    });
  }
  if (ui.tab === 'today' && $('#sheet').hidden && !document.activeElement.matches('input,textarea')) render();
}
setInterval(checkReminders, 30000);

// ---------- sync (optional, secret GitHub gist) ----------
const GIST_FILE = 'tide-data.json';
async function gh(path, opt) {
  opt = opt || {}; const r = await fetch('https://api.github.com' + path, Object.assign({}, opt, { headers: { Authorization: 'Bearer ' + sync.token, Accept: 'application/vnd.github+json', 'Content-Type': 'application/json' } }));
  if (!r.ok) throw new Error(r.status === 401 ? 'GitHub rejected the token. Check it and its Gists permission.' : r.status === 403 || r.status === 404 ? 'The token cannot use gists. Give it the Gists read and write permission.' : 'GitHub error ' + r.status);
  return r.json();
}
let syncing = false;
async function syncNow(quiet) {
  if (!sync.token || syncing) return; syncing = true;
  const say = m => { sync.status = m; const el = $('#syncStatus'); if (el) el.textContent = m; };
  try {
    if (!quiet) say('Syncing…');
    if (!sync.gistId) { const list = await gh('/gists?per_page=100'); const g = list.find(x => x.files && x.files[GIST_FILE]); if (g) sync.gistId = g.id; }
    let remote = null;
    if (sync.gistId) { const g = await gh('/gists/' + sync.gistId); const f = g.files[GIST_FILE]; if (f) remote = JSON.parse(f.truncated ? await (await fetch(f.raw_url)).text() : f.content); }
    if (remote && (remote.updatedAt || 0) > state.updatedAt) { state = migrate(remote); persist(); if ($('#sheet').hidden && !document.activeElement.matches('input,textarea')) render(); }
    else if (state.updatedAt && (!remote || state.updatedAt > (remote.updatedAt || 0))) {
      const body = JSON.stringify({ description: 'Tide app data', public: false, files: { [GIST_FILE]: { content: JSON.stringify(state) } } });
      if (sync.gistId) await gh('/gists/' + sync.gistId, { method: 'PATCH', body }); else sync.gistId = (await gh('/gists', { method: 'POST', body })).id;
    }
    sync.last = Date.now(); sync.status = ''; saveSync(); say('Last synced ' + new Date(sync.last).toLocaleString()); sync.status = ''; if (!quiet) toast('Synced');
  } catch (err) { say(err.message.startsWith('Git') || err.message.startsWith('The') ? err.message : 'Could not reach GitHub. Will retry when you are online.'); if (!quiet) toast('Sync failed'); }
  syncing = false;
}

// ---------- Google Calendar and Tasks (optional, needs your own OAuth client ID) ----------
const G = { token: '', exp: 0, status: '', busy: false };
try { const t = JSON.parse(sessionStorage.getItem('tide.g') || '{}'); if (t.exp > Date.now()) { G.token = t.token; G.exp = t.exp; } } catch (e) { /* none */ }
const G_SCOPES = 'https://www.googleapis.com/auth/calendar.app.created https://www.googleapis.com/auth/tasks';
const CAL = 'https://www.googleapis.com/calendar/v3', TASKS = 'https://tasks.googleapis.com/tasks/v1';
function gOK() { return !!G.token && G.exp > Date.now() + 60000; }
function loadGIS() { return new Promise((res, rej) => { if (window.google && google.accounts && google.accounts.oauth2) return res(); const s = document.createElement('script'); s.src = 'https://accounts.google.com/gsi/client'; s.onload = res; s.onerror = () => rej(new Error('Could not load Google sign-in. Check your connection.')); document.head.appendChild(s); }); }
async function gAuth() {
  if (gOK()) return;
  if (!state.g.clientId) throw new Error('Add your Google client ID in More first.');
  await loadGIS();
  await new Promise((res, rej) => {
    const c = google.accounts.oauth2.initTokenClient({ client_id: state.g.clientId, scope: G_SCOPES,
      callback: r => { if (r.error || !r.access_token) return rej(new Error('Google sign-in was not completed.')); G.token = r.access_token; G.exp = Date.now() + (r.expires_in || 3600) * 1000; try { sessionStorage.setItem('tide.g', JSON.stringify({ token: G.token, exp: G.exp })); } catch (e) { /* ignore */ } res(); },
      error_callback: () => rej(new Error('Google sign-in was closed or blocked. Allow pop-ups and try again.')) });
    c.requestAccessToken({ prompt: state.g.connected ? '' : 'consent' });
  });
}
async function gapi(url, opt) {
  const r = await fetch(url, Object.assign({}, opt, { headers: { Authorization: 'Bearer ' + G.token, 'Content-Type': 'application/json' } }));
  if (r.status === 204) return null;
  const j = await r.json().catch(() => null);
  if (!r.ok) { const e = new Error((j && j.error && j.error.message) || 'Google error ' + r.status); e.status = r.status; throw e; }
  return j;
}
function iso(key, min) { const d = keyDate(key); d.setMinutes(min); return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate()) + 'T' + pad(d.getHours()) + ':' + pad(d.getMinutes()) + ':00'; }
async function gCalDay(key) {
  const tz = Intl.DateTimeFormat().resolvedOptions().timeZone, d = getDay(key), base = CAL + '/calendars/' + encodeURIComponent(state.g.calId) + '/events';
  const have = (await gapi(base + '?' + new URLSearchParams({ privateExtendedProperty: 'tideDay=' + key, maxResults: '250' }))).items || [];
  const byId = {}; have.forEach(e => { byId[e.extendedProperties.private.tideId] = e; });
  for (const b of d.blocks) {
    const body = { summary: (b.done ? '✓ ' : '') + b.title, description: b.note || '', start: { dateTime: iso(key, b.start), timeZone: tz }, end: { dateTime: iso(key, b.start + Math.max(b.dur, 10)), timeZone: tz }, reminders: { useDefault: false, overrides: [{ method: 'popup', minutes: 0 }] }, extendedProperties: { private: { tideDay: key, tideId: b.id } } };
    const ex = byId[b.id]; delete byId[b.id];
    if (!ex) await gapi(base, { method: 'POST', body: JSON.stringify(body) });
    else if (ex.summary !== body.summary || (ex.description || '') !== body.description || new Date(ex.start.dateTime).getTime() !== new Date(body.start.dateTime).getTime() || new Date(ex.end.dateTime).getTime() !== new Date(body.end.dateTime).getTime()) await gapi(base + '/' + ex.id, { method: 'PATCH', body: JSON.stringify(body) });
  }
  for (const e of Object.values(byId)) await gapi(base + '/' + e.id, { method: 'DELETE' });
}
async function gTasks() {
  if (!state.g.listId) { const ls = (await gapi(TASKS + '/users/@me/lists?maxResults=100')).items || []; const f = ls.find(l => l.title === 'Tide'); state.g.listId = f ? f.id : (await gapi(TASKS + '/users/@me/lists', { method: 'POST', body: JSON.stringify({ title: 'Tide' }) })).id; }
  const base = TASKS + '/lists/' + state.g.listId + '/tasks', today = logicalNow().key;
  for (const id of state.g.delTasks.splice(0)) await gapi(base + '/' + id, { method: 'DELETE' }).catch(() => {});
  let remote = [], page = '';
  do { const r = await gapi(base + '?maxResults=100&showCompleted=true&showHidden=true' + (page ? '&pageToken=' + page : '')); remote = remote.concat(r.items || []); page = r.nextPageToken; } while (page);
  const rmap = {}; remote.forEach(r => { rmap[r.id] = r; });
  for (const t of state.tasks.slice()) {
    const want = { title: t.text, status: t.done ? 'completed' : 'needsAction' };
    if (!t.gid) { t.gid = (await gapi(base, { method: 'POST', body: JSON.stringify(want) })).id; continue; }
    const r = rmap[t.gid]; delete rmap[t.gid];
    if (!r) { state.tasks = state.tasks.filter(x => x !== t); continue; }
    const rdone = r.status === 'completed', ru = new Date(r.updated).getTime();
    if (rdone !== t.done || r.title !== t.text) {
      if (ru > (t.u || 0)) { t.text = r.title; t.done = rdone; t.doneDay = rdone ? today : null; t.u = ru; }
      else await gapi(base + '/' + t.gid, { method: 'PATCH', body: JSON.stringify(want) });
    }
  }
  Object.values(rmap).forEach(r => { if (r.title && r.status !== 'completed') state.tasks.push({ id: uid(), text: r.title, done: false, doneDay: null, gid: r.id, u: new Date(r.updated).getTime() }); });
}
async function gSync(interactive) {
  if (G.busy || (!interactive && !gOK())) return; G.busy = true;
  const say = m => { G.status = m; const el = $('#gStatus'); if (el) el.textContent = m; };
  try {
    say('Syncing with Google…'); await gAuth();
    const run = async () => {
      if (!state.g.calId) state.g.calId = (await gapi(CAL + '/calendars', { method: 'POST', body: JSON.stringify({ summary: 'Tide', timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone }) })).id;
      const now = logicalNow().key; for (const k of Array.from(new Set([now, addDays(now, 1), viewKey()]))) await gCalDay(k);
      await gTasks();
    };
    try { await run(); } catch (e) { if (e.status !== 404) throw e; state.g.calId = ''; state.g.listId = ''; await run(); }
    state.g.connected = true; state.g.last = Date.now(); G.status = ''; save(true);
    if (interactive) toast('Calendar and tasks are in sync');
  } catch (err) {
    if (err.status === 401) { G.token = ''; G.exp = 0; }
    G.status = err.status === 401 ? 'Google needs you to confirm again. Tap Sync now.' : err.status === 403 ? 'Google refused: ' + err.message + ' Check that both APIs are enabled.' : err.message;
    if (interactive) toast('Google sync did not finish');
  }
  G.busy = false;
  if ($('#sheet').hidden && !document.activeElement.matches('input,textarea')) render();
}
document.addEventListener('visibilitychange', () => { if (!document.hidden) { syncNow(true); if (state.g.connected) gSync(false); checkReminders(); } });

// ---------- boot ----------
render();
syncNow(true);
if (state.g.connected) gSync(false);
if ('serviceWorker' in navigator && location.protocol === 'https:') navigator.serviceWorker.register('sw.js').catch(() => {});
