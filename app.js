/* ================================================================== *
 *  Dave's 10K — Run Coach
 *  Vast schema + invullen/afvinken, Strava-achtige stats, badges.
 *  Alles lokaal in de browser. Geen server nodig (werkt ook via file://).
 * ================================================================== */

/* ========== INSTELLINGEN PER HARDLOPER — pas dit blok aan ==========
   Hergebruik deze app voor een andere loper: kopieer de map, wijzig dit
   blok, vervang coach.jpg, en pas zo nodig het PLAN/de ZONES aan.       */
const CONFIG = {
  unit:       "km",
  zonePaceSuffix: "/km",
  footEmoji:  "🏃‍♂️",
  mottos: ["Zet 'm op, strijder!", "Lekker bezig, strijder!", "Je bouwt 'm op, strijder.", "Halverwege — doorpakken! ⚡", "Bijna race-klaar, strijder!", "Finisher! Wat een strijder!"],
  appName:    "Op naar 10K",         // titel boven in de app
  runner:     "Dave Jellema",        // naam van de loper
  goal:       "10 km onder 55 min",  // doel (groot in de hero)
  startDate:  new Date(2026, 5, 22), // maandag van week 1 (maand 0-based: 5 = juni)
  storeKey:   "dave10k.log.v2",      // UNIEKE opslagsleutel — per loper anders!
  coachName:  "Coach Bart",          // naam van de coach
  coachHandle:"@bartlopen",          // TikTok/social van de coach
  coachPhoto: "coach.jpg",           // coachfoto (bestand in deze map)
  athleteWord:"strijder",            // hoe de coach de loper aanspreekt
  catchphrase:"Zet 'm op, strijder!", // jouw TikTok-leus
};
/* =================================================================== */

const RUNNER = CONFIG.runner;
const GOAL = CONFIG.goal;
const START_DATE = CONFIG.startDate;
const STORE_KEY = CONFIG.storeKey;
const TOTAL_WEEKS = 12;
const UNIT = CONFIG.unit === "min" ? "min" : "km";
const UNIT_LABEL = UNIT;
const ZONE_SUFFIX = CONFIG.zonePaceSuffix ?? "/km";
const COACH_INITIAL = (CONFIG.coachName.replace(/^coach\s+/i, "")[0] || "C").toUpperCase();

/* --- Tempozones (niveau: tussenin) --------------------------------- */
const ZONES = [
  { key: "herstel",  name: "Herstel",           pace: "langzamer dan 6:45", info: "RPE 2-3 · uitlopen" },
  { key: "duur",     name: "Rustige duur",      pace: "6:00–6:30",          info: "RPE 3-4 · praten kan makkelijk" },
  { key: "lang",     name: "Lange duurloop",    pace: "6:15–6:45",          info: "RPE 3-4 · duurvermogen" },
  { key: "doel",     name: "10 km-doeltempo",   pace: "≈ 5:30",             info: "RPE 6 · gecontroleerd" },
  { key: "tempo",    name: "Tempoblokken",      pace: "5:15–5:35",          info: "RPE 6-7 · stevig" },
  { key: "interval", name: "Interval",          pace: "4:50–5:10",          info: "RPE 7-8 · nooit sprinten" },
];
const zoneByKey = Object.fromEntries(ZONES.map((z) => [z.key, z]));

/* --- Coach Bart (@bartlopen): toffe, motiverende praat per type ----- */
const COACH = {
  duur: [
    "Rustig tempo vandaag, strijder. Hier bouw je je motor op.",
    "Geen haast — kalme kilometers maken je later razendsnel.",
    "Lekker ontspannen lopen. Hieruit haal je je basis, strijder.",
    "Rustig is geen luiheid: het is slim trainen.",
    "Praten moet makkelijk kunnen. Houd 'm kalm, strijder.",
    "Vandaag sparen, zodat je straks kunt knallen.",
    "Soepele benen, rustige adem. Precies goed.",
    "Deze rustige meters zijn je fundament, strijder. Geniet ervan.",
  ],
  lang: [
    "De lange duurloop, strijder. Rustig starten, sterk finishen.",
    "Tijd op de benen betaalt zich uit op racedag.",
    "Verdeel je krachten en blijf ontspannen, strijder.",
    "Elke kilometer maakt je taaier. Mooi bezig.",
    "Niet jagen vandaag — duur gaat vóór tempo.",
    "Kop erbij, benen los. Jij maalt deze afstand weg, strijder.",
    "Constant ritme, rustige adem. Zo bouw je uithoudingsvermogen.",
    "Dit is je geduldtraining, strijder. Het loont.",
  ],
  tempo: [
    "Tempoblok, strijder. Stevig, maar onder controle.",
    "Gelijkmatig en vlot — hier til je je snelheid op.",
    "Net buiten je comfortzone. Daar zit de winst, strijder.",
    "Beheerst doorbijten. Voel je drempel opschuiven.",
    "Vlot ritme vasthouden, niet versnellen tot je verzuurt.",
    "Dit doet pit krijgen, strijder. Blijf scherp.",
    "Korte zinnen moeten nog net lukken. Perfect tempo.",
    "Hier word je sneller. Houd 'm strak, strijder.",
  ],
  interval: [
    "Intervallen, strijder. Korte knallen, goed herstellen.",
    "Houd elke herhaling gelijk en explosief-soepel.",
    "Even diep gaan, dan rust. Jij hebt de regie, strijder.",
    "Scherp en gecontroleerd — nooit blind sprinten.",
    "Hier komt je topsnelheid vandaan. Geef 'm, strijder.",
    "Techniek voorop: lichte voeten, hoge cadans.",
    "Elke herhaling een kopie van de vorige. Strak, strijder.",
    "Pittig, maar baas over je eigen tempo. Knallen.",
  ],
  doel: [
    "Doeltempo, strijder. Prent dit ritme in je benen.",
    "Dit is je racegevoel. Vertrouw erop.",
    "Beheerst op tempo blijven — hier doe je het voor, strijder.",
    "Voel je 10K-tempo. Op de dag zelf voelt het als thuis.",
    "Niet sneller dan dit. Discipline, strijder.",
    "Gelijkmatig knallen op racetempo. Mooi gecontroleerd.",
    "Onthoud hoe dit voelt — dit ga je terugzien op de start.",
    "Race-ritme repeteren, strijder. Je bent er klaar voor.",
  ],
  herstel: [
    "Hersteldag, strijder. Rustig aan, daar word je beter van.",
    "Vandaag laad je op. Herstel hoort bij hard trainen.",
    "Houd het licht en kalm. Morgen sta je er sterker.",
    "Slim dat je rust pakt, strijder. Zo voorkom je blessures.",
    "Niets bewijzen vandaag. Gewoon losdraaien.",
    "Rust is waar de winst binnenkomt. Geniet, strijder.",
    "Kalme benen, hoofd leeg. Precies wat je nodig hebt.",
  ],
};

const DONE = [
  "💥 Knap gedaan, strijder!",
  "🔥 Lekker geknald, strijder!",
  "💪 Sterk werk, strijder!",
  "✅ Afgevinkt — top, strijder!",
  "⚡ Weer een stap sneller, strijder!",
  "🙌 Mooi bezig, strijder!",
];
const coachLine = (zone) => {
  const arr = COACH[zone] || COACH.duur;
  return arr[Math.floor(Math.random() * arr.length)];
};

/* --- Waarom deze training? (uitleg per type) ----------------------- */
const WHY = {
  duur:     "Rustige duurlopen bouwen je aerobe motor: sterker hart, meer haarvaten en betere vetverbranding. Het grootste deel van je trainingstijd hoort hier rustig te zijn — zo kun je vaker en blessurevrij lopen.",
  lang:     "De lange duurloop traint je uithoudingsvermogen en de gewenning aan tijd op de benen. Je leert energie sparen en mentaal doorzetten — de basis onder een sterke 10 km.",
  tempo:    "Tempoblokken liggen rond je omslagpunt. Je leert sneller lopen zónder te verzuren, precies wat je 10 km-tempo structureel omhoog tilt.",
  interval: "Korte, snelle herhalingen prikkelen je VO2max en loopeconomie. Je benen leren vlot schakelen, zonder lang in het rood te gaan.",
  doel:     "Lopen op exact je 10 km-doeltempo (≈ 5:30/km) maakt dat tempo vertrouwd. Op de racedag voelt het dan als thuiskomen in plaats van een gok.",
  herstel:  "Herstel is waar je sterker wordt. Lichte inspanning houdt het bloed stromen zonder nieuwe belasting, zodat de winst van de zware dagen echt binnenkomt.",
};

/* --- Helpers om het schema compact te schrijven -------------------- */
const ma = (o) => ({ day: "ma", dayLabel: "Maandag", kind: "Rustige duurloop", ...o });
const wo = (o) => ({ day: "wo", dayLabel: "Woensdag", kind: "Kwaliteit", ...o });
const za = (o) => ({ day: "za", dayLabel: "Zaterdag", kind: "Lange duurloop", ...o });

/* --- Het 12-weken schema ------------------------------------------- */
const PLAN = [
  { week: 1, dates: "22–28 jun", phase: "Fase 1 · Basis & ritme", sessions: [
    ma({ zone: "duur",     km: 6, title: "6 km rustig",      goal: "Basisritme terugvinden", blocks: ["6 km op 6:00–6:30/km", "Ademhaling onder controle"] }),
    wo({ zone: "interval", km: 5, title: "6×400 m interval", goal: "Beentjes wakker maken", blocks: ["1,5 km inlopen + 3 versnellingen", "6×400 m @ 4:50–5:10/km", "400 m dribbel ertussen", "1 km uitlopen"] }),
    za({ zone: "lang",     km: 8, title: "8 km lang",        goal: "Vertrouwde duur", blocks: ["8 km op 6:15–6:45/km", "Constant en ontspannen"] }),
  ]},
  { week: 2, dates: "29 jun–5 jul", phase: "Fase 1 · Basis & ritme", sessions: [
    ma({ zone: "duur",  km: 6, title: "6 km rustig",   goal: "Herstel & volume", blocks: ["6 km op 6:00–6:30/km"] }),
    wo({ zone: "tempo", km: 6, title: "3×1 km tempo",  goal: "Controle op tempo", blocks: ["1,5 km inlopen", "3×1 km @ 5:20–5:30/km", "2 min rust ertussen", "1 km uitlopen"] }),
    za({ zone: "lang",  km: 9, title: "9 km lang",     goal: "Duur opbouwen", blocks: ["9 km op 6:15–6:45/km"] }),
  ]},
  { week: 3, dates: "6–12 jul", phase: "Fase 1 · Basis & ritme", sessions: [
    ma({ zone: "duur",     km: 7,  title: "7 km rustig",      goal: "Meer volume", blocks: ["7 km op 6:00–6:30/km"] }),
    wo({ zone: "interval", km: 6,  title: "8×400 m interval", goal: "Snelheid prikkelen", blocks: ["1,5 km inlopen + 3 versnellingen", "8×400 m @ 4:50–5:05/km", "400 m dribbel ertussen", "1 km uitlopen"] }),
    za({ zone: "lang",     km: 10, title: "10 km lang",       goal: "Langer op de benen", blocks: ["10 km op 6:15–6:45/km"] }),
  ]},
  { week: 4, dates: "13–19 jul", phase: "Fase 1 · Basis & ritme", recovery: true, sessions: [
    ma({ zone: "herstel", km: 5, title: "5 km heel rustig",       goal: "Herstelweek", blocks: ["5 km, langzamer dan 6:45/km"] }),
    wo({ zone: "duur",    km: 5, title: "5 km + versnellingen",   goal: "Los blijven", kind: "Soepel", blocks: ["5 km rustig", "4×100 m soepel versnellen"] }),
    za({ zone: "lang",    km: 7, title: "7 km ontspannen",        goal: "Herstel", blocks: ["7 km laag in zone 2"] }),
  ]},

  { week: 5, dates: "20–26 jul", phase: "Fase 2 · Tempo opbouwen", sessions: [
    ma({ zone: "duur",  km: 7,  title: "7 km rustig",   goal: "Volume", blocks: ["7 km op 6:00–6:30/km"] }),
    wo({ zone: "tempo", km: 7,  title: "2×2 km tempo",  goal: "Drempelgevoel", blocks: ["1,5 km inlopen", "2×2 km @ 5:25–5:35/km", "3 min rust ertussen", "1 km uitlopen"] }),
    za({ zone: "lang",  km: 10, title: "10 km lang",    goal: "Duur vasthouden", blocks: ["10 km op 6:15–6:45/km"] }),
  ]},
  { week: 6, dates: "27 jul–2 aug", phase: "Fase 2 · Tempo opbouwen", sessions: [
    ma({ zone: "duur",     km: 7,  title: "7 km rustig",      goal: "Volume", blocks: ["7 km op 6:00–6:30/km"] }),
    wo({ zone: "interval", km: 7,  title: "5×600 m interval", goal: "Snelheidsuithouding", blocks: ["1,5 km inlopen", "5×600 m @ 4:55–5:05/km", "400 m dribbel ertussen", "1 km uitlopen"] }),
    za({ zone: "lang",     km: 11, title: "11 km lang",       goal: "Langste tot nu toe", blocks: ["11 km op 6:15–6:45/km", "Drinken oefenen"] }),
  ]},
  { week: 7, dates: "3–9 aug", phase: "Fase 2 · Tempo opbouwen", sessions: [
    ma({ zone: "duur", km: 8,  title: "8 km rustig",       goal: "Volume", blocks: ["8 km op 6:00–6:30/km"] }),
    wo({ zone: "doel", km: 6,  title: "4 km op doeltempo", goal: "10 km-tempo voelen", blocks: ["1,5 km inlopen", "4 km @ ≈ 5:30/km", "1 km uitlopen"] }),
    za({ zone: "lang", km: 11, title: "11 km lang",        goal: "Duur vasthouden", blocks: ["11 km op 6:15–6:45/km"] }),
  ]},
  { week: 8, dates: "10–16 aug", phase: "Fase 2 · Tempo opbouwen", recovery: true, sessions: [
    ma({ zone: "herstel", km: 6, title: "6 km heel rustig",     goal: "Herstelweek", blocks: ["6 km, langzamer dan 6:45/km"] }),
    wo({ zone: "duur",    km: 6, title: "6 km + versnellingen", goal: "Los blijven", kind: "Soepel", blocks: ["6 km rustig", "5×100 m soepel"] }),
    za({ zone: "lang",    km: 8, title: "8 km ontspannen",      goal: "Herstel", blocks: ["8 km laag in zone 2"] }),
  ]},

  { week: 9, dates: "17–23 aug", phase: "Fase 3 · Specifiek 10 km", sessions: [
    ma({ zone: "duur",  km: 7,  title: "7 km rustig",  goal: "Volume", blocks: ["7 km op 6:00–6:30/km"] }),
    wo({ zone: "tempo", km: 8,  title: "5×1 km tempo", goal: "Scherpte", blocks: ["1,5 km inlopen", "5×1 km @ 5:15–5:25/km", "90 sec rust ertussen", "1 km uitlopen"] }),
    za({ zone: "lang",  km: 12, title: "12 km lang",   goal: "Piek-duur", blocks: ["12 km op 6:15–6:45/km"] }),
  ]},
  { week: 10, dates: "24–30 aug", phase: "Fase 3 · Specifiek 10 km", sessions: [
    ma({ zone: "duur", km: 7,  title: "7 km rustig",         goal: "Volume", blocks: ["7 km op 6:00–6:30/km"] }),
    wo({ zone: "doel", km: 8,  title: "2×3 km op doeltempo", goal: "Race-ritme", blocks: ["1,5 km inlopen", "2×3 km @ ≈ 5:30/km", "3 min rust ertussen", "1 km uitlopen"] }),
    za({ zone: "lang", km: 12, title: "12 km lang",          goal: "Laatste lange duurloop", blocks: ["12 km op 6:15–6:45/km"] }),
  ]},
  { week: 11, dates: "31 aug–6 sep", phase: "Fase 4 · Taper & race", taper: true, sessions: [
    ma({ zone: "duur",  km: 6, title: "6 km rustig",  goal: "Taper start", blocks: ["6 km op 6:00–6:30/km"] }),
    wo({ zone: "tempo", km: 6, title: "3×1 km tempo", goal: "Scherp & fris", blocks: ["1,5 km inlopen", "3×1 km @ 5:20/km", "2 min rust ertussen", "1 km uitlopen"] }),
    za({ zone: "lang",  km: 9, title: "9 km soepel",  goal: "Kort houden", blocks: ["9 km op 6:15–6:45/km"] }),
  ]},
  { week: 12, dates: "7–13 sep", phase: "Fase 4 · Taper & race", taper: true, race: true, sessions: [
    ma({ zone: "duur", km: 5,  title: "5 km + versnellingen", goal: "Benen los", kind: "Soepel", blocks: ["5 km rustig", "4×100 m soepel"] }),
    wo({ zone: "duur", km: 5,  title: "4 km los + 3×200 m",   goal: "Aanscherpen op race", kind: "Soepel", blocks: ["4 km rustig", "3×200 m op 10 km-tempo", "Alles licht en kort"] }),
    za({ zone: "doel", km: 12, title: "🏁 10 km tijdrit",     goal: "Doelrace · onder 55 min", kind: "Doelrace", blocks: ["1,5 km inlopen", "10 km @ ≈ 5:30/km", "Eerste 2 km iets rustiger starten", "Laatste 2 km legen op gevoel"] }),
  ]},
];

/* --- Extra advies (info-kaarten) ----------------------------------- */
const INFO = [
  { icon: "🔥", title: "Warming-up & cooling-down", items: [
    "Maandag: start 1 km rustig in.",
    "Woensdag: 1,5 km inlopen + 3 korte versnellingen vóór de blokken.",
    "Elke training: 1 km uitlopen of 5–8 min wandelen.",
  ]},
  { icon: "💪", title: "Kracht, mobiliteit & rust", items: [
    "Kracht 2× per week (jouw PT): squats, lunges, calf raises, hip bridge, plank.",
    "Niet zwaar op de benen vlak vóór de woensdagtraining.",
    "5–8 min mobiliteit na het lopen: kuiten, heupbuigers, bilspieren, hamstrings.",
    "Minstens 1 echte rustdag; wandelen/fietsen mag op tussendagen.",
  ]},
  { icon: "🥤", title: "Voeding & drinken", items: [
    "Langer dan 75 min: 400–600 ml per uur, bij warmte met elektrolyten.",
    "Vanaf ~12 km: oefen met 30 g koolhydraten per uur (1 gel).",
    "2–3 uur voor een lange duurloop een koolhydraatrijke maaltijd.",
    "Na afloop binnen 1–2 uur eiwit + koolhydraten.",
  ]},
  { icon: "🎯", title: "Taper & raceweek", items: [
    "Week 11–12: omvang omlaag, intensiteit kort scherp houden.",
    "Je moet je bijna té fris voelen — dat is de bedoeling.",
    "10 km in ≈ 55 min = ongeveer 5:30/km.",
    "Start rustig, bouw op, laatste 2 km legen.",
  ]},
];

/* --- Badges -------------------------------------------------------- */
const BADGES = [
  { id: "first",  icon: "👟",  name: "Eerste run",        desc: "1 training afgevinkt",   test: (s) => s.done >= 1 },
  { id: "ten",    icon: "🔟",  name: "Tien op de teller", desc: "10 trainingen gedaan",   test: (s) => s.done >= 10 },
  { id: "half",   icon: "⚡",  name: "Halverwege",        desc: "50% van het schema",     test: (s) => s.done >= s.total / 2 },
  { id: "week",   icon: "✅",  name: "Week compleet",     desc: "Een hele week afgerond", test: (s) => s.fullWeeks >= 1 },
  { id: "long",   icon: "🏔️", name: "Lange loper",       desc: "≥ 12 km gelogd",         test: (s) => s.maxDist >= 12 },
  { id: "fast",   icon: "💨",  name: "Snelle benen",      desc: "Een run onder 5:30/km",  test: (s) => s.bestPace > 0 && s.bestPace < 330 },
  { id: "streak", icon: "🔥",  name: "On fire",           desc: "Reeks van 5 trainingen", test: (s) => s.streak >= 5 },
  { id: "finish", icon: "🏅",  name: "Finisher",          desc: "10 km tijdrit voltooid", test: (s) => s.raceDone },
];

/* ================================================================== *
 *  State
 * ================================================================== */
function loadLog() {
  try { return JSON.parse(localStorage.getItem(STORE_KEY)) || {}; }
  catch { return {}; }
}
function saveLog() { localStorage.setItem(STORE_KEY, JSON.stringify(log)); }
let log = loadLog();

const sid = (week, day) => `w${week}-${day}`;
const flatSessions = PLAN.flatMap((w) => w.sessions.map((s) => ({ ...s, week: w.week })));
const totalSessions = flatSessions.length;
const LAST_SESSION = flatSessions[flatSessions.length - 1];
const DAY_OFFSET = { ma: 0, di: 1, wo: 2, do: 3, vr: 4, za: 5, zo: 6, d1: 0, d2: 2, d3: 4, d4: 6 };

const escapeHtml = (value = "") => String(value)
  .replaceAll("&", "&amp;")
  .replaceAll("<", "&lt;")
  .replaceAll(">", "&gt;")
  .replaceAll('"', "&quot;")
  .replaceAll("'", "&#039;");

function dateAtDay(dayIndex) {
  const date = new Date(START_DATE);
  date.setDate(date.getDate() + dayIndex);
  date.setHours(12, 0, 0, 0);
  return date;
}

function sessionDate(week, day) {
  return dateAtDay((week - 1) * 7 + (DAY_OFFSET[day] ?? 0));
}

function isoDate(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function planningEntries() {
  return Array.isArray(log.__planning) ? log.__planning : [];
}

function planningForWeek(week) {
  const start = isoDate(dateAtDay((week - 1) * 7));
  const end = isoDate(dateAtDay((week - 1) * 7 + 6));
  return planningEntries().filter((entry) => entry.start <= end && (entry.end || entry.start) >= start);
}

function parseTime(str) {
  if (!str) return null;
  const parts = String(str).split(":").map((p) => parseInt(p, 10));
  if (parts.some((n) => Number.isNaN(n))) return null;
  if (parts.length === 3) return parts[0] * 3600 + parts[1] * 60 + parts[2];
  if (parts.length === 2) return parts[0] * 60 + parts[1];
  return parts[0] * 60;
}

function durationParts(str) {
  const total = parseTime(str) || 0;
  return { minutes: Math.floor(total / 60), seconds: total % 60 };
}

function durationValue(minutes, seconds) {
  const m = Math.max(0, parseInt(minutes, 10) || 0);
  const s = Math.min(59, Math.max(0, parseInt(seconds, 10) || 0));
  return `${m}:${String(s).padStart(2, "0")}`;
}
function paceSeconds(distance, timeStr) {
  const d = parseFloat(String(distance).replace(",", "."));
  const sec = parseTime(timeStr);
  if (!d || !sec) return null;
  return sec / d;
}
function fmtPace(perKm) {
  if (!perKm) return null;
  const m = Math.floor(perKm / 60);
  const s = Math.round(perKm % 60);
  return `${m}:${String(s).padStart(2, "0")} /km`;
}

/* Afgeleide statistieken uit de log */
function computeStats() {
  let done = 0, km = 0, maxDist = 0, maxTime = 0, bestPace = 0, raceDone = false;
  flatSessions.forEach((s) => {
    const e = log[sid(s.week, s.day)];
    if (!e || !e.done) return;
    done++;
    const d = parseFloat(String(e.distance || "").replace(",", ".")) || 0;
    km += d;
    if (d > maxDist) maxDist = d;
    const t = parseTime(e.time) || 0;
    if (t > maxTime) maxTime = t;
    const p = paceSeconds(e.distance, e.time);
    if (p && (bestPace === 0 || p < bestPace)) bestPace = p;
    if (s.week === LAST_SESSION.week && s.day === LAST_SESSION.day) raceDone = true;
  });
  let streak = 0, run = 0;
  flatSessions.forEach((s) => {
    const e = log[sid(s.week, s.day)];
    if (e && e.done) { run++; streak = Math.max(streak, run); } else run = 0;
  });
  let fullWeeks = 0;
  PLAN.forEach((w) => {
    if (w.sessions.every((s) => log[sid(w.week, s.day)]?.done)) fullWeeks++;
  });
  return { done, total: totalSessions, km, maxDist, maxTime, bestPace, raceDone, streak, fullWeeks };
}

function currentWeek() {
  const diff = Math.floor((Date.now() - START_DATE.getTime()) / (7 * 864e5));
  return Math.min(TOTAL_WEEKS, Math.max(1, diff + 1));
}

/* ================================================================== *
 *  Rendering
 * ================================================================== */
const $ = (id) => document.getElementById(id);

function animateCount(el, to, suffix = "") {
  const dur = 700, t0 = performance.now();
  const dec = to % 1 !== 0;
  function step(t) {
    const k = Math.min(1, (t - t0) / dur);
    const v = to * (1 - Math.pow(1 - k, 3));
    el.textContent = (dec ? v.toFixed(1) : Math.round(v)) + suffix;
    if (k < 1) requestAnimationFrame(step);
  }
  requestAnimationFrame(step);
}

function renderHero(stats) {
  $("runnerName").textContent = RUNNER;
  $("goalText").textContent = GOAL;
  const pct = Math.round((stats.done / stats.total) * 100);
  $("ringPct").textContent = `${pct}%`;
  const r = 52, c = 2 * Math.PI * r;
  const fg = $("ringFg");
  fg.style.strokeDasharray = c;
  fg.style.strokeDashoffset = c;
  requestAnimationFrame(() => { fg.style.strokeDashoffset = c * (1 - pct / 100); });
  const mottos = CONFIG.mottos || ["Zet 'm op, strijder!", "Lekker bezig, strijder!", "Je bouwt 'm rustig op, strijder.", "Halverwege — knap volgehouden! ⚡", "Bijna race-klaar, strijder!", "Finisher! Wat een prestatie, strijder. 🏅"];
  $("heroMotto").textContent =
    stats.raceDone ? mottos[5] : pct >= 80 ? mottos[4] : pct >= 50 ? mottos[3] : pct >= 20 ? mottos[2] : pct > 0 ? mottos[1] : mottos[0];
  renderCountdown();
}

function raceInfo() {
  const rw = PLAN.find((w) => w.race || w.tuneup || w.finish) || PLAN[PLAN.length - 1];
  const rs = rw.sessions[rw.sessions.length - 1];
  const off = DAY_OFFSET[rs.day] ?? 6;
  const date = new Date(START_DATE.getTime() + ((rw.week - 1) * 7 + off) * 864e5);
  const days = Math.round((date.setHours(0, 0, 0, 0) - new Date().setHours(0, 0, 0, 0)) / 864e5);
  return { days, name: rs.title.replace(/^[^\p{L}\d]+/u, "").trim() };
}
function renderCountdown() {
  const motto = $("heroMotto");
  if (!motto) return;
  let el = $("raceCountdown");
  if (!el) {
    el = document.createElement("p");
    el.id = "raceCountdown";
    el.className = "hero-countdown";
    motto.after(el);
  }
  const { days, name } = raceInfo();
  el.textContent =
    days > 1 ? `🗓️ nog ${days} dagen tot je ${name}` :
    days === 1 ? `🗓️ morgen is het zover: ${name}!` :
    days === 0 ? `🔥 vandaag is het zover: ${name}!` :
    `🎉 ${name} volbracht — chapeau!`;
}

function renderStats(stats) {
  animateCount($("statDone"), stats.done);
  animateCount($("statKm"), Math.round(stats.km * 10) / 10, " km");
  animateCount($("statStreak"), stats.streak);
  const cw = currentWeek();
  const wk = PLAN.find((w) => w.week === cw);
  const wkDone = wk.sessions.filter((s) => log[sid(cw, s.day)]?.done).length;
  $("statWeek").textContent = `${wkDone}/${wk.sessions.length}`;
}

function renderNextUp() {
  const cw = currentWeek();
  const next =
    flatSessions.find((s) => s.week >= cw && !log[sid(s.week, s.day)]?.done) ||
    flatSessions.find((s) => !log[sid(s.week, s.day)]?.done);
  const box = $("nextUp");
  if (!next) {
    box.innerHTML = `<div class="nextup-card done"><span class="nextup-eyebrow">🏅 Schema compleet</span><strong>Alles afgevinkt — chapeau, ${RUNNER}!</strong></div>`;
    return;
  }
  const z = zoneByKey[next.zone];
  box.innerHTML = `
    <button class="nextup-card zone-${next.zone}" data-week="${next.week}" data-day="${next.day}">
      <span class="nextup-eyebrow">Volgende training · week ${next.week} · ${next.dayLabel}</span>
      <strong>${next.title}</strong>
      <span class="nextup-meta">${next[UNIT]} ${UNIT_LABEL} · ${z.name}</span>
      <span class="nextup-go">Openen ›</span>
    </button>`;
  box.querySelector(".nextup-card").addEventListener("click", () => openDetail(next.week, next.day));
}

const PLANNING_META = {
  race: {
    icon: "🏁", label: "Tussentijdse race",
    advice: "Laat deze race je lange training vervangen. Houd de training ervoor rustig en plan daarna minimaal één hersteldag.",
  },
  vacation: {
    icon: "🌴", label: "Vakantie",
    advice: "Gemiste trainingen hoef je niet in te halen. Pak bij thuiskomst de eerstvolgende rustige training op.",
  },
  rest: {
    icon: "🩹", label: "Rust / blessure",
    advice: "Herstel gaat voor het schema. Hervat pas pijnvrij en bouw de eerste week extra rustig op.",
  },
};

function formatPlanDate(value) {
  if (!value) return "";
  const date = new Date(`${value}T12:00:00`);
  return date.toLocaleDateString("nl-NL", { day: "numeric", month: "short", year: "numeric" });
}

function renderPlanning() {
  const list = $("planningList");
  if (!list) return;
  const entries = [...planningEntries()].sort((a, b) => a.start.localeCompare(b.start));
  if (!entries.length) {
    list.innerHTML = `<div class="planning-empty"><span>🗓️</span><p>Nog niets gepland. Voeg een vakantie of oefenwedstrijd toe zodra je die weet.</p></div>`;
    return;
  }
  list.innerHTML = entries.map((entry) => {
    const meta = PLANNING_META[entry.type] || PLANNING_META.rest;
    const period = entry.end && entry.end !== entry.start
      ? `${formatPlanDate(entry.start)} – ${formatPlanDate(entry.end)}`
      : formatPlanDate(entry.start);
    return `<article class="planning-item plan-${entry.type}">
      <span class="planning-icon">${meta.icon}</span>
      <div class="planning-copy">
        <span class="planning-type">${meta.label} · ${period}</span>
        <strong>${escapeHtml(entry.title)}</strong>
        ${entry.note ? `<p>${escapeHtml(entry.note)}</p>` : ""}
        <p class="planning-advice"><b>Coachadvies:</b> ${meta.advice}</p>
      </div>
      <button class="planning-remove" type="button" data-plan-id="${escapeHtml(entry.id)}" aria-label="${escapeHtml(entry.title)} verwijderen">×</button>
    </article>`;
  }).join("");
  list.querySelectorAll(".planning-remove").forEach((button) => {
    button.addEventListener("click", () => {
      log.__planning = planningEntries().filter((entry) => entry.id !== button.dataset.planId);
      saveLog();
      renderAll();
      toast("Uit je planning verwijderd");
    });
  });
}

function renderZones() {
  $("zonesList").innerHTML = ZONES.map((z) => `
    <div class="zone-row zone-${z.key}">
      <span class="zone-dot"></span>
      <div class="zone-main"><strong>${z.name}</strong><span>${z.info}</span></div>
      <span class="zone-pace">${z.pace}${ZONE_SUFFIX ? `<small>${ZONE_SUFFIX}</small>` : ""}</span>
    </div>`).join("");
}

function renderChart() {
  const max = Math.max(...PLAN.map((w) => w.sessions.reduce((n, s) => n + s[UNIT], 0)));
  $("volumeChart").innerHTML = PLAN.map((w) => {
    const planned = w.sessions.reduce((n, s) => n + s[UNIT], 0);
    const doneMin = w.sessions.reduce((n, s) => n + (log[sid(w.week, s.day)]?.done ? s[UNIT] : 0), 0);
    const h = Math.round((planned / max) * 100);
    const fill = planned ? Math.round((doneMin / planned) * 100) : 0;
    const cls = (w.race || w.tuneup || w.finish) ? "is-race" : w.recovery ? "is-rest" : "";
    return `
      <div class="bar ${cls}" title="Week ${w.week}: ${planned} ${UNIT_LABEL} gepland">
        <div class="bar-track" style="height:${h}%">
          <div class="bar-fill" style="height:${fill}%"></div>
        </div>
        <span class="bar-x">${w.week}</span>
      </div>`;
  }).join("");
}

function tagOf(w) {
  if (w.finish) return `<span class="week-tag tag-race">Finale</span>`;
  if (w.race) return `<span class="week-tag tag-race">Raceweek</span>`;
  if (w.tuneup) return `<span class="week-tag tag-tuneup">10 km race</span>`;
  if (w.recovery) return `<span class="week-tag tag-rest">Herstel</span>`;
  if (w.taper) return `<span class="week-tag tag-taper">Taper</span>`;
  return "";
}

function renderWeeks() {
  const cw = currentWeek();
  const todayIso = isoDate(new Date());
  let html = "", lastPhase = "";
  PLAN.forEach((w, i) => {
    if (w.phase !== lastPhase) { html += `<h4 class="sub-phase reveal">${w.phase}</h4>`; lastPhase = w.phase; }
    const sess = w.sessions.map((s) => {
      const e = log[sid(w.week, s.day)] || {};
      const z = zoneByKey[s.zone];
      const pace = fmtPace(paceSeconds(e.distance, e.time));
      const bits = [];
      if (e.distance) bits.push(`${e.distance} km`);
      if (pace) bits.push(pace);
      if (e.hr) bits.push(`${e.hr} bpm`);
      const logged = bits.length ? `<span class="session-logged">📊 ${bits.join(" · ")}</span>` : "";
      const lastDay = w.sessions[w.sessions.length - 1].day;
      const isRaceSession = (w.race || w.tuneup || w.finish) && s.day === lastDay;
      const isToday = isoDate(sessionDate(w.week, s.day)) === todayIso;
      const raceKicker = isRaceSession
        ? `<span class="session-race-kicker">${w.raceLabel || (w.race ? "🏅 Doelrace" : w.tuneup ? "🏁 Wedstrijd" : "🏁 Finale")}</span>`
        : "";
      return `
        <button class="session zone-${s.zone} ${isRaceSession ? "is-race-session" : ""} ${e.done ? "is-done" : ""} ${isToday ? "is-today" : ""}" data-week="${w.week}" data-day="${s.day}">
          <span class="session-day">${isRaceSession ? "<small>🏁</small>" : ""}${s.dayLabel.slice(0, 2)}</span>
          <span class="session-body">
            ${raceKicker}
            <span class="session-title">${s.title}${isToday ? ' <span class="today-badge">Vandaag</span>' : ""}</span>
            <span class="session-meta">${s[UNIT]} ${UNIT_LABEL} · ${s.kind}</span>
            ${logged}
          </span>
          <span class="session-check">${e.done ? "✓" : ""}</span>
        </button>`;
    }).join("");
    const weekPlans = planningForWeek(w.week);
    const planStrip = weekPlans.length ? `<div class="week-planning">${weekPlans.map((entry) => {
      const meta = PLANNING_META[entry.type] || PLANNING_META.rest;
      return `<span>${meta.icon} ${escapeHtml(entry.title)}</span>`;
    }).join("")}</div>` : "";
    html += `
      <article class="week-card reveal ${w.tuneup ? "is-tuneup-week" : ""} ${w.race ? "is-goal-race-week" : ""} ${w.week === cw ? "is-current" : ""} ${w.week < cw ? (w.sessions.every((x) => log[sid(w.week, x.day)]?.done) ? "is-complete" : "is-missed") : ""}" style="--i:${i % 4}">
        <header class="week-head">
          <div><span class="week-no">Week ${w.week}</span><span class="week-dates">${w.dates}</span></div>
          ${w.week === cw ? `<span class="week-tag tag-now">Nu</span>` : w.week < cw ? (w.sessions.every((x) => log[sid(w.week, x.day)]?.done) ? `<span class="week-tag tag-done">✓ af</span>` : `<span class="week-tag tag-missed">gemist</span>`) : tagOf(w)}
        </header>
        ${planStrip}
        <div class="session-list">${sess}</div>
      </article>`;
  });
  $("weeksList").innerHTML = html;
  $("weeksList").querySelectorAll(".session").forEach((b) =>
    b.addEventListener("click", () => openDetail(+b.dataset.week, b.dataset.day)));
  observeReveals();
}

function renderBadges(stats) {
  $("badgeGrid").innerHTML = BADGES.map((b) => {
    const got = b.test(stats);
    return `
      <div class="badge ${got ? "got" : "locked"}" title="${b.desc}">
        <span class="badge-icon">${got ? b.icon : "🔒"}</span>
        <strong>${b.name}</strong>
        <span class="badge-desc">${b.desc}</span>
      </div>`;
  }).join("");
}

function renderInfo() {
  $("infoList").innerHTML = INFO.map((c, i) => `
    <article class="info-card reveal" style="--i:${i}">
      <span class="info-icon">${c.icon}</span>
      <h4>${c.title}</h4>
      <ul>${c.items.map((t) => `<li>${t}</li>`).join("")}</ul>
    </article>`).join("");
}

function addJumpButton() {
  const head = document.querySelector(".weeks .phase-head");
  if (!head || document.getElementById("jumpNow")) return;
  const btn = document.createElement("button");
  btn.id = "jumpNow";
  btn.type = "button";
  btn.className = "jump-now";
  btn.textContent = "Naar deze week ↓";
  btn.addEventListener("click", () =>
    document.querySelector(".week-card.is-current")?.scrollIntoView({ behavior: "smooth", block: "start" }));
  head.insertAdjacentElement("afterend", btn);
}

function renderAll() {
  const stats = computeStats();
  renderHero(stats);
  renderStats(stats);
  renderNextUp();
  renderPlanning();
  renderChart();
  renderZones();
  renderWeeks();
  addJumpButton();
  renderBadges(stats);
  renderInfo();
  observeReveals();
}

/* ----- Detailweergave ------------------------------------------------ */
function openDetail(week, day) {
  const w = PLAN.find((x) => x.week === week);
  const s = w.sessions.find((x) => x.day === day);
  const id = sid(week, day);
  const e = log[id] || {};
  const z = zoneByKey[s.zone];
  const enteredTime = durationParts(e.time);

  $("detailTitle").textContent = `Week ${week} · ${s.dayLabel}`;
  $("detailBody").innerHTML = `
    <div class="detail-hero zone-${s.zone}">
      <span class="detail-kind">${s.kind} · ${s[UNIT]} ${UNIT_LABEL}</span>
      <h2>${s.title}</h2>
      <p class="detail-goal">${s.goal}</p>
      <span class="detail-zone">${z.name} · ${z.info}</span>
    </div>

    <div class="coach-bubble">
      <div class="coach-ava">
        <img src="${CONFIG.coachPhoto}" alt="${CONFIG.coachName}" onerror="this.style.display='none'">
        <span>${COACH_INITIAL}</span>
      </div>
      <div class="coach-text">
        <strong>${CONFIG.coachName} <span class="coach-handle">${CONFIG.coachHandle}</span></strong>
        <p>${coachLine(s.zone)}</p>
      </div>
    </div>

    <section class="detail-block why">
      <h4>${w.race || w.tuneup ? "Waarom deze wedstrijd" : "Waarom deze training"}</h4>
      <p>${s.why || WHY[s.zone] || ""}</p>
    </section>

    <section class="detail-block">
      <h4>Opbouw</h4>
      <ol class="block-list">${s.blocks.map((b) => `<li>${b}</li>`).join("")}</ol>
    </section>

    <section class="detail-block">
      <h4>${w.race || w.tuneup ? "Invullen na de wedstrijd" : "Invullen na de training"}</h4>
      <div class="form-grid">
        <label>Afstand (km)
          <input id="fDistance" type="text" inputmode="decimal" placeholder="bv. 6,2" value="${escapeHtml(e.distance ?? "")}">
        </label>
        <label>Tijd
          <span class="duration-input">
            <input id="fTimeMinutes" type="number" inputmode="numeric" min="0" max="999" placeholder="36" value="${enteredTime.minutes || ""}" aria-label="Minuten">
            <span>min</span>
            <input id="fTimeSeconds" type="number" inputmode="numeric" min="0" max="59" placeholder="30" value="${enteredTime.seconds || ""}" aria-label="Seconden">
            <span>sec</span>
          </span>
        </label>
        <label class="full">Gemiddeld tempo
          <output id="fPace" class="pace-out">${fmtPace(paceSeconds(e.distance, e.time)) || "—"}</output>
        </label>
        <label>Hartslag (bpm)
          <input id="fHr" type="number" inputmode="numeric" placeholder="bv. 152" value="${escapeHtml(e.hr ?? "")}">
        </label>
        <label>Gevoel / zwaarte
          <select id="fFeel">
            ${["", "1 · heel licht", "2 · licht", "3 · prima", "4 · pittig", "5 · zwaar"]
              .map((o) => `<option value="${o}" ${String(e.feel ?? "") === o ? "selected" : ""}>${o || "Kies…"}</option>`).join("")}
          </select>
        </label>
        <label class="full">Notitie
          <textarea id="fNote" rows="2" placeholder="Hoe ging het?">${escapeHtml(e.note ?? "")}</textarea>
        </label>
      </div>
    </section>

    <div class="detail-actions">
      <button id="toggleDone" class="btn-primary ${e.done ? "is-done" : ""}">${e.done ? "✓ Gedaan" : "Markeer als gedaan"}</button>
      <button id="saveSession" class="btn-ghost">Opslaan</button>
    </div>`;

  const readTime = () => {
    if (!$("fTimeMinutes").value && !$("fTimeSeconds").value) return "";
    return durationValue($("fTimeMinutes").value, $("fTimeSeconds").value);
  };
  const recalc = () => ($("fPace").textContent = fmtPace(paceSeconds($("fDistance").value, readTime())) || "—");
  $("fDistance").addEventListener("input", recalc);
  $("fTimeMinutes").addEventListener("input", recalc);
  $("fTimeSeconds").addEventListener("input", () => {
    if (+$("fTimeSeconds").value > 59) $("fTimeSeconds").value = "59";
    recalc();
  });

  const collect = () => ({
    ...log[id],
    distance: $("fDistance").value.trim(),
    time: readTime(),
    hr: $("fHr").value.trim(),
    feel: $("fFeel").value,
    note: $("fNote").value.trim(),
  });

  $("saveSession").addEventListener("click", () => {
    log[id] = collect(); saveLog();
    toast("Opgeslagen 💾");
    closeDetail();
  });
  $("toggleDone").addEventListener("click", () => {
    const cur = collect();
    cur.done = !cur.done;
    log[id] = cur; saveLog();
    if (cur.done) {
      celebrate();
      toast(w.finish ? "🌞 Zomer rond! Wat een strijder!" : w.race ? "🏅 Finisher! Wat een prestatie, strijder!" : w.tuneup ? "🏁 Wedstrijd voltooid — sterk gepacet!" : DONE[Math.floor(Math.random() * DONE.length)]);
    }
    closeDetail();
  });

  showView("detail");
}

function closeDetail() { renderAll(); showView("list"); }

function showView(name) {
  const list = $("listView"), detail = $("detailView"), back = $("backButton");
  if (name === "detail") {
    list.classList.add("hidden");
    detail.classList.remove("hidden");
    requestAnimationFrame(() => detail.classList.add("is-in"));
    back.classList.remove("hidden");
    window.scrollTo(0, 0);
  } else {
    detail.classList.remove("is-in");
    back.classList.add("hidden");
    setTimeout(() => {
      detail.classList.add("hidden");
      list.classList.remove("hidden");
      window.scrollTo(0, 0);
    }, 280);
  }
}

/* ----- Invliegende beelden -------------------------------------------- */
let io;
function observeReveals() {
  io = io || new IntersectionObserver((entries) => {
    entries.forEach((en) => { if (en.isIntersecting) { en.target.classList.add("in"); io.unobserve(en.target); } });
  }, { threshold: 0.12, rootMargin: "0px 0px -40px 0px" });
  document.querySelectorAll(".reveal:not(.in)").forEach((el) => io.observe(el));
}

/* ----- Toast ----------------------------------------------------------- */
let toastT;
function toast(msg) {
  const t = $("toast");
  t.textContent = msg;
  t.classList.add("show");
  clearTimeout(toastT);
  toastT = setTimeout(() => t.classList.remove("show"), 2200);
}

/* ----- Confetti --------------------------------------------------------- */
function celebrate() {
  const cv = $("confetti");
  const ctx = cv.getContext("2d");
  cv.width = innerWidth; cv.height = innerHeight;
  const colors = ["#d7ff3e", "#ff5630", "#2fb8ff", "#9a7bff", "#ffab2e"];
  const parts = Array.from({ length: 140 }, () => ({
    x: innerWidth / 2, y: innerHeight / 3,
    vx: (Math.random() - 0.5) * 14, vy: Math.random() * -16 - 4,
    s: Math.random() * 7 + 4, c: colors[(Math.random() * colors.length) | 0],
    r: Math.random() * Math.PI, vr: (Math.random() - 0.5) * 0.4,
  }));
  let frame = 0;
  (function loop() {
    frame++;
    ctx.clearRect(0, 0, cv.width, cv.height);
    parts.forEach((p) => {
      p.vy += 0.45; p.x += p.vx; p.y += p.vy; p.r += p.vr;
      ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.r);
      ctx.fillStyle = p.c; ctx.fillRect(-p.s / 2, -p.s / 2, p.s, p.s * 0.6);
      ctx.restore();
    });
    if (frame < 120) requestAnimationFrame(loop);
    else ctx.clearRect(0, 0, cv.width, cv.height);
  })();
}

/* ================================================================== *
 *  Init
 * ================================================================== */
/* Branding uit CONFIG zetten (zodat templaten makkelijk is) */
document.title = `${CONFIG.appName} — ${CONFIG.coachHandle}`;
if ($("appName")) $("appName").textContent = CONFIG.appName;
if ($("brandHandle")) $("brandHandle").textContent = CONFIG.coachHandle;
if ($("footCredit")) {
  $("footCredit").innerHTML =
    `<span class="catch">${CONFIG.catchphrase}</span>` +
    `Coaching door ${CONFIG.coachName} · TikTok <strong>${CONFIG.coachHandle}</strong> ${CONFIG.footEmoji || "🏃\u200d♀️"}`;
}

function setPlanningForm(open) {
  const form = $("planningForm");
  const toggle = $("togglePlanningForm");
  form.classList.toggle("hidden", !open);
  toggle.setAttribute("aria-expanded", String(open));
  toggle.textContent = open ? "× Sluiten" : "＋ Toevoegen";
  if (open && !$("planStart").value) $("planStart").value = isoDate(new Date());
}

$("togglePlanningForm").addEventListener("click", () => {
  setPlanningForm($("planningForm").classList.contains("hidden"));
});
$("cancelPlanning").addEventListener("click", () => setPlanningForm(false));
$("planningForm").addEventListener("submit", (event) => {
  event.preventDefault();
  const start = $("planStart").value;
  const end = $("planEnd").value || start;
  if (end < start) {
    toast("De einddatum ligt vóór de startdatum");
    return;
  }
  const entry = {
    id: `plan-${Date.now()}`,
    type: $("planType").value,
    title: $("planTitle").value.trim(),
    start,
    end,
    note: $("planNote").value.trim(),
  };
  log.__planning = [...planningEntries(), entry];
  saveLog();
  $("planningForm").reset();
  setPlanningForm(false);
  renderAll();
  toast("Toegevoegd aan je schema 🗓️");
});

$("backButton").addEventListener("click", closeDetail);
$("resetButton").addEventListener("click", () => {
  if (confirm("Alle ingevulde voortgang wissen?")) { log = {}; saveLog(); renderAll(); toast("Voortgang gewist"); }
});

/* ----- Back-up: exporteren / importeren ------------------------------- */
function downloadJSON(filename, obj) {
  const a = document.createElement("a");
  a.href = URL.createObjectURL(new Blob([JSON.stringify(obj, null, 2)], { type: "application/json" }));
  a.download = filename;
  document.body.appendChild(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(a.href), 1000);
}

function downloadText(filename, text, type) {
  const a = document.createElement("a");
  a.href = URL.createObjectURL(new Blob([text], { type }));
  a.download = filename;
  document.body.appendChild(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(a.href), 1000);
}

function icsEscape(value) {
  return String(value || "")
    .replaceAll("\\", "\\\\")
    .replaceAll(/\r?\n/g, "\\n")
    .replaceAll(",", "\\,")
    .replaceAll(";", "\\;");
}

function icsDay(value) {
  const date = typeof value === "string" ? new Date(`${value}T12:00:00`) : value;
  return isoDate(date).replaceAll("-", "");
}

function addDays(value, amount) {
  const date = typeof value === "string" ? new Date(`${value}T12:00:00`) : new Date(value);
  date.setDate(date.getDate() + amount);
  return date;
}

function calendarFile() {
  const stamp = new Date().toISOString().replaceAll(/[-:]/g, "").replace(/\.\d{3}/, "");
  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "PRODID:-//bartlopen//Run Coach//NL",
    `X-WR-CALNAME:${icsEscape(CONFIG.appName)} · ${icsEscape(RUNNER)}`,
  ];
  flatSessions.forEach((session) => {
    const date = sessionDate(session.week, session.day);
    const z = zoneByKey[session.zone];
    lines.push(
      "BEGIN:VEVENT",
      `UID:${sid(session.week, session.day)}-${icsDay(date)}@bartlopen.nl`,
      `DTSTAMP:${stamp}`,
      `DTSTART;VALUE=DATE:${icsDay(date)}`,
      `DTEND;VALUE=DATE:${icsDay(addDays(date, 1))}`,
      `SUMMARY:${icsEscape(`${CONFIG.footEmoji || "🏃\u200d♀️"} ${session.title}`)}`,
      `DESCRIPTION:${icsEscape(`${session[UNIT]} ${UNIT_LABEL} · ${z.name}\n${session.goal}\n\n${session.blocks.join("\n")}`)}`,
      "TRANSP:TRANSPARENT",
      "END:VEVENT",
    );
  });
  planningEntries().forEach((entry) => {
    const meta = PLANNING_META[entry.type] || PLANNING_META.rest;
    lines.push(
      "BEGIN:VEVENT",
      `UID:${icsEscape(entry.id)}@bartlopen.nl`,
      `DTSTAMP:${stamp}`,
      `DTSTART;VALUE=DATE:${icsDay(entry.start)}`,
      `DTEND;VALUE=DATE:${icsDay(addDays(entry.end || entry.start, 1))}`,
      `SUMMARY:${icsEscape(`${meta.icon} ${entry.title}`)}`,
      `DESCRIPTION:${icsEscape(`${entry.note ? `${entry.note}\n\n` : ""}Coachadvies: ${meta.advice}`)}`,
      "TRANSP:TRANSPARENT",
      "END:VEVENT",
    );
  });
  lines.push("END:VCALENDAR");
  return `${lines.join("\r\n")}\r\n`;
}
$("exportBtn").addEventListener("click", () => {
  downloadJSON(`${CONFIG.appName.replace(/\s+/g, "-")}-voortgang.json`, {
    app: "bartlopen-runcoach", storeKey: STORE_KEY, runner: RUNNER,
    exportedAt: new Date().toISOString(), log,
  });
  toast("Back-up opgeslagen ⬇︎");
});
$("importBtn").addEventListener("click", () => $("importFile").click());
$("importFile").addEventListener("change", (e) => {
  const file = e.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = () => {
    try {
      const data = JSON.parse(reader.result);
      const incoming = data && data.log ? data.log : data;
      if (!incoming || typeof incoming !== "object") throw new Error("ongeldig");
      log = { ...log, ...incoming };
      saveLog(); renderAll();
      toast("Back-up geladen ⬆︎ — welkom terug!");
    } catch {
      toast("Kon dit bestand niet lezen");
    }
    e.target.value = "";
  };
  reader.readAsText(file);
});

$("calendarBtn").addEventListener("click", () => {
  downloadText(`${CONFIG.appName.replace(/\s+/g, "-")}-schema.ics`, calendarFile(), "text/calendar;charset=utf-8");
  toast("Agenda-bestand staat klaar 🗓️");
});

$("pdfBtn").addEventListener("click", () => {
  document.body.classList.add("print-schema");
  const cleanup = () => document.body.classList.remove("print-schema");
  window.addEventListener("afterprint", cleanup, { once: true });
  window.print();
  setTimeout(cleanup, 1500);
});

/* Alles tekenen */
renderAll();

/* Intro-splash netjes weg laten faden (tikken slaat 'm over) */
(function () {
  const splash = $("splash");
  if (!splash) return;
  const hide = () => splash.classList.add("gone");
  setTimeout(hide, 1100);
  splash.addEventListener("click", hide);
  setTimeout(() => splash.remove(), 1700);
})();

/* Service worker voor offline gebruik (alleen op http/https, niet via file://) */
if ("serviceWorker" in navigator && location.protocol.startsWith("http")) {
  navigator.serviceWorker.register("sw.js").catch(() => {});
}
