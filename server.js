const express = require('express');
const path = require('path');
const crypto = require('crypto');
const fs = require('fs');
const Anthropic = require('@anthropic-ai/sdk');
const app = express();
require('dotenv').config();

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const DAILY_PROMPT_LIMIT = 10;
const DAY_MS = 24 * 60 * 60 * 1000;
const usage = new Map(); // visitorId -> { count, resetAt }

function getVisitorId(req, res) {
    const cookies = Object.fromEntries(
        (req.headers.cookie || '').split(';').map(c => c.trim().split('=')).filter(p => p[0])
    );
    let id = cookies.visitorId;
    if (!id) {
        id = crypto.randomUUID();
        res.setHeader('Set-Cookie', `visitorId=${id}; Max-Age=${60 * 60 * 24 * 365}; Path=/; HttpOnly; SameSite=Lax`);
    }
    return id;
}

function rateLimit(req, res, next) {
    if (process.env.NODE_ENV !== 'production') {
        next();
        return;
    }
    const id = getVisitorId(req, res);
    const now = Date.now();
    let entry = usage.get(id);
    if (!entry || entry.resetAt <= now) {
        entry = { count: 0, resetAt: now + DAY_MS };
        usage.set(id, entry);
    }
    if (entry.count >= DAILY_PROMPT_LIMIT) {
        const minutesLeft = Math.ceil((entry.resetAt - now) / 60000);
        res.status(429).json({ error: `Daily limit of ${DAILY_PROMPT_LIMIT} searches reached. Try again in ${minutesLeft} minutes.` });
        return;
    }
    entry.count += 1;
    next();
}

app.use(express.json());
app.use('/html', express.static(path.join(__dirname, 'html')));
app.use('/css', express.static(path.join(__dirname, 'css')));
app.use('/js', express.static(path.join(__dirname, 'js')));
app.use('/img', express.static(path.join(__dirname, 'img')));
app.use('/tools', express.static(path.join(__dirname, 'tools')));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'html', 'index.html'));
});

app.post('/ask', rateLimit, async (req, res) => {
    try {
        const question = req.body.question;
        const detailLevel = Math.min(5, Math.max(1, parseInt(req.body.detailLevel) || 4));

        const detailConfigs = {
            1: { words: '50–80',   facts: '2–3', maxTokens: 1400 },
            2: { words: '90–130',  facts: '3',   maxTokens: 1600 },
            3: { words: '150–190', facts: '4–5', maxTokens: 1900 },
            4: { words: '200–280', facts: '4–6', maxTokens: 2400 },
            5: { words: '300–400', facts: '6–8', maxTokens: 3000 },
        };
        const cfg = detailConfigs[detailLevel];
        // The data/periods/related/wikipedia blocks scale with location count,
        // not detail level — enumeration prompts ("every Greek colony") can
        // produce 30-40+ locations, which was blowing past the summary-sized
        // budget above and truncating the JSON mid-array.
        const maxTokens = cfg.maxTokens + 2200;

        const today = new Date().toISOString().split('T')[0];
        const system = `You are Earthlopedia, an interactive educational map of Earth. Today's date is ${today}. Your knowledge has a cutoff of approximately August 2025, so for topics involving recent records, current champions, or fast-changing statistics, note that figures may be outdated and more recent developments have likely occurred.

Your job is to take any topic — a war, an invention, a species, a person, a sport, a concept — and tell its story through LOCATIONS and TIME.

For every query, write a summary then output location data.

## Factual accuracy:
If the question contains a false premise or misconception (e.g. "how are humans dinosaurs" — humans are NOT dinosaurs, but birds are), open by clearly but briefly correcting it, then pivot to the fascinating true story. Never validate a false claim to seem agreeable.

## Summary format (use markdown):
- Start with a one-sentence hook that states the most striking educational fact about the topic — direct, specific, and grounded. Write it as a plain declarative sentence: what happened, where, when, and why it matters. NEVER use the "X didn't just A — it B" contrast construction (e.g. "Sugar plantations didn't just reshape economies — they physically relocated millions of people") or its variants ("not just blank, its blank", "changed everything", "front-row seat", "from scratch", "would never be the same", "entirely new"). If you notice the sentence you're about to write contains an em-dash setting up a contrast/escalation, rewrite it as a single flat factual statement instead. The hook should read like a knowledgeable person cutting straight to the most interesting point, e.g. "Sugar plantations relied on forced labor shipped from Africa, and that migration reshaped the demographics of the Americas for centuries."
- If the query is a generic/category term rather than a specific named subject (e.g. "archipelago", "volcano", "glacier" — as opposed to "Indonesian Archipelago" or "Mount Vesuvius"), the hook must first give a brief general definition of the term before pivoting to a striking specific example
- Use **bold** for key names, places, dates
- For historical topics (wars, empires, migrations, discoveries, political events), include a "## Context" section (2-3 sentences) explaining WHY it happened — the preceding causes, tensions, or developments — and how it connects to other events happening concurrently elsewhere in the world at that time. Name at least one specific contemporaneous event, trend, or power struggle happening elsewhere, not just background on the topic itself. Omit this section for topics where "why" doesn't apply (species, geographic features, sports records, inventions without political causes).
- Include a "## Key Facts" section with ${cfg.facts} bullet points. For competitive/historical topics always include: first occurrence, most recent, record holders or dominant nations/people, a lesser-known fact (label this bullet "**Little-known:**", not "Surprising fact")
- Include a "## Geographic Story" section (2-3 sentences) explaining how the topic spread or shifted across the world over time
- Keep total summary to ${cfg.words} words (the Context section, when included, adds roughly 40-60 words on top of this budget)

## Data block:
After the summary, output all locations in chronological order. Each entry name should be: "City/Place — brief event (Winner/detail if relevant)".

ALWAYS produce the data block. For "world cup winners" → each tournament's host city final venue. For "dinosaurs" → major fossil sites. For "internet" → cities of key milestones. Always find the geographic angle.

If the question is about a specific place, landmark, or singular subject (e.g. "the island that legally belongs to no country", "the lost city of Petra", "Taj Mahal"), add "main": true to that subject's entry. Only one entry should have "main": true. Do NOT add "main": true for survey/list questions (e.g. "World Cup winners", "major volcanoes"). The one exception is a two-subject COMPARISON query (see below), where exactly two entries have "main": true, one per subject.

## Direct vs. journey queries — this changes how many locations you output:
First judge the query itself. A DIRECT query names one specific place, landmark, building, or singular subject and is really asking "tell me about this place" (e.g. "Taj Mahal", "Eiffel Tower", "the Great Barrier Reef", "Area 51"). A JOURNEY/STORY query asks about something that inherently moves or spans many places over time (a war, a migration, an invention's spread, a species' range, a sport's history, an empire).

- For a DIRECT query: the map view must read, at a glance, as being about that ONE place. Output the main location plus only 2–6 tightly-relevant supporting locations — places directly and specifically tied to that subject's own story (e.g. where its architect trained, where its materials were quarried, its UNESCO listing year, a twin/sister site). Do NOT invent a sprawling multi-stop world tour, and do NOT make the main subject a mid-journey stop (e.g. the 4th location chronologically) — it should anchor the set both narratively and geographically. If you genuinely can't find several tightly-relevant supporting locations, it's fine to output just the main location plus 1–2, or the main location alone.
- For a JOURNEY/STORY query: keep the full narrative sweep — this is where the 8–22 location range below applies.
- When in doubt whether a query is direct or a journey, prefer treating it as direct — a focused answer beats a padded one.

If the subject with "main": true is a country, sovereign state, overseas territory, or named political region (e.g. "France", "Japan", "Greenland", "Patagonia"), also add "country": "<English name suitable for geocoding>" to that same entry. Do not add "country" for cities, landmarks, or non-political geographic features.

If the subject with "main": true is a historical empire, kingdom, or multi-country political entity (e.g. "the Roman Empire", "the British Empire", "the Mongol Empire"), instead add "region_countries": ["Country1", "Country2", ...] listing up to 8 modern countries whose territory significantly overlapped with that entity at its peak. Use standard English country names suitable for geocoding. Do not add both "country" and "region_countries" to the same entry.

## Comparison queries:
When the query explicitly asks to compare two named subjects (e.g. "Compare the empires of Rome and Han China", "Aztecs vs Incas", "the Ottoman and Byzantine empires"), treat it as a comparison rather than a single journey:
- Pick one representative anchor location for EACH subject and tag both "main": true (an exception to the "only one main" rule above).
- Add "compare_group": "A" to the first subject's main entry and every other location that belongs to the first subject, and "compare_group": "B" to the second subject's main entry and its locations. Every location in the data block should carry a compare_group.
- Independently give each subject's main entry its own "country" or "region_countries" exactly as described above — one subject might get "country" while the other gets "region_countries", or both might get the same kind.
- Aim for roughly balanced coverage — a similar number of locations for each subject — so neither side dominates the map.
- Do NOT add "compare_group" for non-comparison queries, even ones that happen to mention two places in passing.

## Multiple routes:
Most topics describe a single path and need nothing extra. But when a topic genuinely contains two or more distinct, separately-traceable journeys — e.g. "Columbus's four voyages", "Cook's three Pacific voyages", separate invasion routes of the same campaign, parallel migration branches — add "route": <integer> (1, 2, 3, ...) to each location marking which journey it belongs to. Use the same route number for every stop on the same journey, in chronological order within that route. Only do this when the routes are genuinely distinct and each has 2+ of its own stops; do not fragment a single continuous journey into artificial routes, and omit "route" entirely for single-path topics (the default case).

For a single-path journey (no "route" field), the map draws one line connecting every location strictly in the order you list them — so that order must trace the physical path traveled, not just increasing year. Do not append a later "epilogue" or "consequence" location (e.g. where the journey's outcome played out, a site tied to the story's aftermath) to the end of an otherwise-geographic list if it sits far off that physical path — doing so draws a stray line backtracking across the map. Either weave such a location into its correct position along the path, give it its own "route" number so it isn't connected to the main line, or omit it.

Format exactly — "data:" on its own line:

data:
[
  {"name": "Bir Tawil — unclaimed territory", "latitude": 21.9, "longitude": 33.7, "year": 1899, "main": true},
  {"name": "Cairo — Egypt's claim origin", "latitude": 30.0, "longitude": 31.2, "year": 1906}
]

Example with multiple routes (only use "route" like this when the topic truly has separate journeys):

data:
[
  {"name": "Palos de la Frontera — departure, 1st voyage", "latitude": 37.2, "longitude": -6.9, "year": 1492, "route": 1},
  {"name": "San Salvador — first landfall, 1st voyage", "latitude": 24.0, "longitude": -74.5, "year": 1492, "route": 1},
  {"name": "Cádiz — departure, 2nd voyage", "latitude": 36.5, "longitude": -6.3, "year": 1493, "route": 2},
  {"name": "Hispaniola — colonization, 2nd voyage", "latitude": 19.0, "longitude": -70.7, "year": 1493, "route": 2}
]

Example with a two-subject comparison (only use "compare_group" like this for an explicit "compare X and Y" query):

data:
[
  {"name": "Rome — founding of the Republic", "latitude": 41.9, "longitude": 12.5, "year": -509, "main": true, "region_countries": ["Italy", "Spain", "France", "Greece", "Egypt", "Turkey", "Tunisia", "United Kingdom"], "compare_group": "A"},
  {"name": "Carthage — destroyed after the Third Punic War", "latitude": 36.85, "longitude": 10.32, "year": -146, "compare_group": "A"},
  {"name": "Chang'an — Han capital", "latitude": 34.27, "longitude": 108.9, "year": -202, "main": true, "country": "China", "compare_group": "B"},
  {"name": "Ferghana Valley — source of the 'heavenly horses'", "latitude": 40.4, "longitude": 71.8, "year": -104, "compare_group": "B"}
]

Rules:
- latitude/longitude are numbers not strings
- year is a number (negative = BCE)
- Do NOT include locations dated after today (${today}) unless the query itself explicitly asks about future predictions, forecasts, or projections (e.g. "when will the Amazon disappear", "future sea level rise") — in that rare case, future-dated entries are fine and expected.
- Include every significant location for this topic. For specific routes, voyages, or journeys include every known stop. For broad survey topics include all major sites. For JOURNEY/STORY queries (see above), aim for 8–22 locations; never omit known stops to save space. For DIRECT queries (see above), use the smaller, tightly-relevant count described above instead — do not pad to reach 8
- Valid JSON, no trailing commas, nothing after the closing ]

If the topic spans recognizable named time periods or eras (e.g. geological periods for dinosaurs/evolution, dynasties for ancient Egypt, eras for the Roman Empire, centuries for the Silk Road), output an optional periods block BEFORE the related block:

periods:
[
  {"name": "Triassic", "start": -252000000, "end": -201000000},
  {"name": "Jurassic", "start": -201000000, "end": -145000000},
  {"name": "Cretaceous", "start": -145000000, "end": -66000000}
]

Rules for periods:
- start and end are numbers (negative = BCE, same convention as year)
- 2–8 periods max
- Only include when the topic genuinely has named, widely-recognized time divisions
- Do NOT include for general modern geography, sports records, or topics that don't span distinct named eras
- Periods should together span roughly the same range as the locations' years

After the data block (and optional periods block), add a related searches section exactly like this:

related:
["suggestion 1", "suggestion 2", "suggestion 3", "suggestion 4"]

These should be 4 short, specific, interesting follow-up searches a curious person would want to explore next — related but distinct angles on the topic.

After the related block, output the single best Wikipedia article title for the main image of this topic:

wikipedia: "Exact Wikipedia Article Title"

Use the precise Wikipedia article title (with disambiguation if needed), e.g. "Ratatouille (film)", "Mongol Empire", "FIFA World Cup". This must match the actual topic being discussed — not a similarly-named person, place, or thing. If the query is about a fictional character, use the work they appear in (e.g. "Ratatouille (film)" not "Remy Ma"). Output null if no single Wikipedia article fits well.`;

        res.setHeader('Content-Type', 'text/event-stream');
        res.setHeader('Cache-Control', 'no-cache');
        res.setHeader('Connection', 'keep-alive');

        let fullText = '';
        const stream = anthropic.messages.stream({
            model: 'claude-sonnet-4-6',
            max_tokens: maxTokens,
            temperature: 0,
            system: system,
            messages: [{ role: 'user', content: question }],
        });

        stream.on('text', (text) => {
            fullText += text;
            res.write(`data: ${JSON.stringify({ chunk: text })}\n\n`);
        });

        await stream.finalMessage();
        const answer = fullText.trim();
        console.log("=== RAW ANSWER ===\n", answer, "\n==================");
        res.write(`data: ${JSON.stringify({ done: true, answer })}\n\n`);
        res.end();
    } catch (error) {
        console.error("Error in /ask route:", error.message);
        res.write(`data: ${JSON.stringify({ error: 'Error querying Anthropic' })}\n\n`);
        res.end();
    }
});

app.post('/location-summary', async (req, res) => {
    try {
        const { question, locationName, event, year } = req.body;
        const yearStr = year != null ? (year < 0 ? `${Math.abs(year)} BCE` : String(year)) : null;
        const context = [locationName, yearStr, event].filter(Boolean).join(' — ');

        const response = await anthropic.messages.create({
            model: 'claude-haiku-4-5-20251001',
            max_tokens: 400,
            messages: [{
                role: 'user',
                content: `Topic: "${question}"\nLocation: ${context}\n\nWrite 2–3 sentences explaining this location's specific role or significance in the context of "${question}". Be vivid and specific. No bullet points, just flowing prose. Use **bold** for key names, places, and dates so they stick out.\n\nThen on a new line output exactly:\nfollow_ups:\n["question 1", "question 2", "question 3"]\n\nThese should be 3 short, specific follow-up questions a curious person would ask about this specific location.`
            }],
        });

        const raw = response.content[0].text.trim();
        let summary = raw;
        let followUps = [];
        const fuIdx = raw.indexOf('follow_ups:');
        if (fuIdx !== -1) {
            summary = raw.slice(0, fuIdx).trim();
            const fuText = raw.slice(fuIdx + 11).trim();
            const arrStart = fuText.indexOf('[');
            const arrEnd = fuText.lastIndexOf(']');
            if (arrStart !== -1 && arrEnd !== -1) {
                try { followUps = JSON.parse(fuText.slice(arrStart, arrEnd + 1)); } catch (e) {}
            }
        }

        res.json({ summary, followUps });
    } catch (error) {
        console.error("Error in /location-summary:", error.message);
        res.status(500).json({ summary: null });
    }
});

// Lightweight cross-check: compares just the summary's opening claim against
// the Wikipedia extract already fetched client-side for the topic image.
// Deliberately narrow — only flags a clear, specific contradiction (a
// conflicting date/name/place/number for the same fact), never omissions or
// differing detail, so it stays a rare, trustworthy signal rather than noise.
app.post('/fact-check', async (req, res) => {
    try {
        const { summary, extract } = req.body || {};
        if (typeof summary !== 'string' || typeof extract !== 'string' || !summary.trim() || !extract.trim()) {
            return res.json({ flag: false });
        }

        const response = await anthropic.messages.create({
            model: 'claude-haiku-4-5-20251001',
            max_tokens: 150,
            temperature: 0,
            messages: [{
                role: 'user',
                content: `You are a careful, conservative fact-checker. Compare CLAIM against REFERENCE (a Wikipedia summary of the same topic).

CLAIM:
"""${summary.slice(0, 1200)}"""

REFERENCE (Wikipedia):
"""${extract.slice(0, 1200)}"""

Only flag a clear, specific factual contradiction between the two — e.g. a conflicting date, name, location, or number given for the same fact. Do NOT flag omissions, differing emphasis, differing level of detail, broader/narrower framing, or anything the reference simply doesn't mention. When in doubt, do not flag.

Reply with ONLY JSON, nothing else:
{"flag": false}
or
{"flag": true, "note": "<under 14 words, plainly naming the contradiction>"}`
            }],
        });

        const raw = response.content[0].text.trim();
        const start = raw.indexOf('{');
        const end = raw.lastIndexOf('}');
        if (start === -1 || end === -1) return res.json({ flag: false });
        const parsed = JSON.parse(raw.slice(start, end + 1));
        res.json({
            flag: !!parsed.flag,
            note: typeof parsed.note === 'string' ? parsed.note.trim() : null,
        });
    } catch (error) {
        console.error('Error in /fact-check:', error.message);
        res.json({ flag: false });
    }
});

app.post('/followup-quick-answer', async (req, res) => {
    try {
        const { question, locationName, event, year, followUp } = req.body;
        const yearStr = year != null ? (year < 0 ? `${Math.abs(year)} BCE` : String(year)) : null;
        const context = [locationName, yearStr, event].filter(Boolean).join(' — ');

        const response = await anthropic.messages.create({
            model: 'claude-haiku-4-5-20251001',
            max_tokens: 150,
            messages: [{
                role: 'user',
                content: `Topic: "${question}"\nLocation: ${context}\n\nAnswer this follow-up question in 1-2 short, direct sentences: "${followUp}"\n\nPlain prose only — no markdown headers, no bullet points, no bold, no preamble. Just the answer sentences.`
            }],
        });

        const answer = response.content[0].text.trim();
        res.json({ answer });
    } catch (error) {
        console.error("Error in /followup-quick-answer:", error.message);
        res.status(500).json({ answer: null });
    }
});

const EXPLORE_CATEGORIES = ['history', 'nature', 'culture', 'oddity'];

// Turns the Explore "Curate" panel's free-text focus + category subset into
// prompt fragments shared by /explore-nearby and /explore-related, plus the
// validated category allow-list to filter the model's output against.
// `allowedCats` is null when the user hasn't constrained categories.
function buildExploreCuration(focus, categories) {
    const cleanFocus = typeof focus === 'string' ? focus.trim().slice(0, 120) : '';
    // A focus is a hard filter, not a nudge — the model otherwise pads the
    // list back up to five with famous-but-unrelated nearby places (ask for
    // "volcanoes" in Croatia and get Dubrovnik's old town). Spell out that a
    // short list, or none at all, is the correct answer.
    const focusBlock = cleanFocus
        ? `\n\nHARD REQUIREMENT — the wanderer only wants places about: ${cleanFocus}
- Every place you return must genuinely, specifically be about "${cleanFocus}". Not loosely adjacent — actually about it.
- Do NOT include a place just to reach five. Returning three, one, or an empty array [] is correct and expected when the visible area has little to do with "${cleanFocus}".
- Never substitute a famous nearby landmark that isn't about "${cleanFocus}".
- Never relocate a matching place from elsewhere in the world into this area, and never invent one. If a place's real location is outside the given bounds, leave it out.
- Set "match" to true only if you are confident the place is really about "${cleanFocus}"; the server drops any place with "match": false.`
        : '';
    const focusMatchField = cleanFocus ? ', "match": true' : '';

    let allowedCats = Array.isArray(categories)
        ? categories.filter(c => EXPLORE_CATEGORIES.includes(c))
        : null;
    if (allowedCats && (allowedCats.length === 0 || allowedCats.length === EXPLORE_CATEGORIES.length)) {
        allowedCats = null; // no real constraint
    }
    const categoryLine = allowedCats
        ? `Only include places whose category is one of: ${allowedCats.join(', ')}. Each place's "category" field must be exactly one of those.`
        : `Also give each place a category: exactly one of "history", "nature", "culture", "oddity".`;

    return { cleanFocus, focusBlock, focusMatchField, categoryLine, allowedCats };
}

app.post('/explore-nearby', async (req, res) => {
    try {
        const { lat, lng, north, south, east, west, exclude, focus, categories } = req.body || {};
        if ([lat, lng, north, south, east, west].some(n => typeof n !== 'number' || Number.isNaN(n))) {
            return res.status(400).json({ error: 'Missing or invalid bounds', discoveries: [] });
        }
        const excludeList = Array.isArray(exclude) ? exclude.filter(s => typeof s === 'string').slice(-40) : [];
        const excludeBlock = excludeList.length
            ? `\n\nSkip these — already shown to this person:\n${excludeList.map(n => `- ${n}`).join('\n')}`
            : '';
        // User-set curation from the Explore "Curate" panel (see js/main.js).
        const { cleanFocus, focusBlock, focusMatchField, categoryLine, allowedCats } = buildExploreCuration(focus, categories);
        const varietyClause = cleanFocus
            ? `that are genuinely about "${cleanFocus}"`
            : 'that would delight a curious wanderer — mix historical sites, natural features, cultural landmarks, and interesting oddities';

        // Factor the zoom level into the search: a viewport showing most of a
        // country is a "find the best across this whole region" request, not a
        // "what's near this point" one. Size the ask (and how the model is told
        // to spread its picks) to the span actually on screen rather than
        // always anchoring on the centre coordinate.
        const midLatRad = ((north + south) / 2) * Math.PI / 180;
        const latSpanKm = Math.abs(north - south) * 111;
        const lngSpanKm = Math.abs(east - west) * 111 * Math.max(Math.cos(midLatRad), 0.02);
        const longSideKm = Math.max(latSpanKm, lngSpanKm);
        const maxPlaces = longSideKm > 1500 ? 8 : longSideKm > 500 ? 7 : longSideKm > 150 ? 6 : 5;
        const wideView = longSideKm > 150;
        const areaLine = wideView
            ? `That visible area is large — roughly ${Math.round(latSpanKm)} km north–south by ${Math.round(lngSpanKm)} km east–west, so it covers a whole region rather than a single locality.`
            : `That visible area spans roughly ${Math.round(latSpanKm)} km north–south by ${Math.round(lngSpanKm)} km east–west, centred near ${lat}, ${lng}.`;
        const spreadLine = wideView
            ? `\n\nBecause this is a wide, zoomed-out view, do NOT cluster your picks near the centre point (${lat}, ${lng}). Choose the most remarkable places from ACROSS the entire visible area — different cities, provinces, and edges of the box — so the results represent the whole region on screen, not just its middle. If the single best example of what's wanted sits near an edge of the box, that's the one to return.`
            : '';

        const response = await anthropic.messages.create({
            model: 'claude-haiku-4-5-20251001',
            max_tokens: 900,
            temperature: 1,
            messages: [{
                role: 'user',
                content: `You are picking real points of interest for someone casually wandering an interactive map with no destination in mind. They're currently looking at the map area bounded by latitude ${south} to ${north} and longitude ${west} to ${east}. ${areaLine}${spreadLine}

Name up to ${maxPlaces} real, specific, verifiable places inside (or very close to) that visible area ${varietyClause}. Only include places you're confident are real and can place accurately; skip a place entirely rather than guess at its coordinates. If you can't confidently find ${maxPlaces}, give fewer.${excludeBlock}${focusBlock}

For each place give: its exact name, precise latitude/longitude (must fall within the given bounds), and a one-sentence hook (12–22 words, plain declarative statement of the single most interesting fact — never use the "X isn't just Y — it Z" contrast construction or variants like "not just blank, its blank"). ${categoryLine}

Reply with ONLY a JSON array, nothing else — no preamble, no markdown fences:
[{"name": "...", "lat": 0.0, "lng": 0.0, "teaser": "...", "category": "history"${focusMatchField}}]`
            }],
        });

        const raw = response.content[0].text.trim();
        const start = raw.indexOf('[');
        const end = raw.lastIndexOf(']');
        if (start === -1 || end === -1) throw new Error('No JSON array in response');
        const parsed = JSON.parse(raw.slice(start, end + 1));

        const CATEGORIES = new Set(['history', 'nature', 'culture', 'oddity']);
        // Small, fixed-range tolerance for "very close to" the requested
        // bounds — NOT proportional to the viewport itself. The old margin
        // (a full extra viewport, floored at 0.5°) meant a zoomed-in view of
        // e.g. Washington DC would still accept a pick ~35+ miles away (like
        // Richmond, VA): the model would return something plausible-but-wrong
        // for the neighborhood, it'd sail through validation, and fitBounds
        // would then stretch the map to include it — reading as pins landing
        // "between" the old and new area, or not at the new area at all.
        // Clamping to a fixed 0.02°–0.15° (~1.5–10mi) range keeps the slack
        // sane at every zoom level.
        const latMargin = Math.min(Math.max((north - south) * 0.15, 0.02), 0.15);
        const lngMargin = Math.min(Math.max((east - west) * 0.15, 0.02), 0.15);
        const discoveries = parsed.filter(d =>
            d && typeof d.name === 'string' && d.name.trim() &&
            typeof d.lat === 'number' && typeof d.lng === 'number' &&
            d.lat >= south - latMargin && d.lat <= north + latMargin &&
            d.lng >= west - lngMargin && d.lng <= east + lngMargin &&
            // Focus mode asks for a self-assessed "match" flag — drop anything
            // the model itself wasn't willing to vouch for.
            (!cleanFocus || d.match === true)
        ).map(d => ({
            name: d.name.trim(),
            lat: d.lat,
            lng: d.lng,
            teaser: typeof d.teaser === 'string' ? d.teaser.trim() : '',
            category: CATEGORIES.has(d.category) ? d.category : 'oddity',
        })).filter(d => !allowedCats || allowedCats.includes(d.category));

        res.json({ discoveries });
    } catch (error) {
        console.error('Error in /explore-nearby:', error.message);
        res.status(500).json({ error: 'Failed to find nearby places', discoveries: [] });
    }
});

// Follow-up places for the Explore detail panel — related to the given place
// by history, theme, or story rather than by proximity, so (unlike
// /explore-nearby) these are free to be anywhere on the map. Each one quick-
// loads into the same lightweight detail view client-side; see
// renderExploreFollowUps/quickLoadExploreFollowUp in js/main.js.
app.post('/explore-related', async (req, res) => {
    try {
        const { name, teaser, exclude, focus, categories } = req.body || {};
        if (typeof name !== 'string' || !name.trim()) {
            return res.status(400).json({ error: 'Missing name', related: [] });
        }
        const excludeList = Array.isArray(exclude) ? exclude.filter(s => typeof s === 'string').slice(-40) : [];
        const excludeBlock = excludeList.length
            ? `\n\nSkip these — already shown to this person:\n${excludeList.map(n => `- ${n}`).join('\n')}`
            : '';
        // Same Explore "Curate" lens as /explore-nearby, but applied softly
        // here — a themed "where to next" jump shouldn't be dropped just for
        // sitting outside the chosen categories.
        const { focusBlock, allowedCats } = buildExploreCuration(focus, categories);
        const relatedPrefBlock = [
            focusBlock,
            allowedCats ? `\n\nWhere there's a genuine choice, lean toward places in these categories: ${allowedCats.join(', ')}.` : '',
        ].join('');

        const response = await anthropic.messages.create({
            model: 'claude-haiku-4-5-20251001',
            max_tokens: 700,
            temperature: 1,
            messages: [{
                role: 'user',
                content: `A curious wanderer just looked at this place on an interactive map:\n\nPlace: ${name}\n${teaser ? `Context: ${teaser}\n` : ''}\nSuggest up to 4 real, specific, verifiable places worth going to next — connected to this one by history, theme, story, or comparison (a related event, a shared figure, a counterpart elsewhere, the next chapter of the same story). They do NOT need to be nearby — anywhere in the world is fine, and scattering them geographically is good. Only include places you're confident are real and can place accurately; skip a place entirely rather than guess at its coordinates. If you can't confidently find 4, give fewer.${excludeBlock}${relatedPrefBlock}

For each place give: its exact name, precise latitude/longitude, a one-sentence hook (12–22 words, plain declarative statement of the single most interesting fact and, where natural, how it connects back to "${name}" — never use the "X isn't just Y — it Z" contrast construction or variants like "not just blank, its blank"), and a category: exactly one of "history", "nature", "culture", "oddity".

Reply with ONLY a JSON array, nothing else — no preamble, no markdown fences:
[{"name": "...", "lat": 0.0, "lng": 0.0, "teaser": "...", "category": "history"}]`
            }],
        });

        const raw = response.content[0].text.trim();
        const start = raw.indexOf('[');
        const end = raw.lastIndexOf(']');
        if (start === -1 || end === -1) throw new Error('No JSON array in response');
        const parsed = JSON.parse(raw.slice(start, end + 1));

        const CATEGORIES = new Set(['history', 'nature', 'culture', 'oddity']);
        const related = parsed.filter(d =>
            d && typeof d.name === 'string' && d.name.trim() &&
            typeof d.lat === 'number' && typeof d.lng === 'number' &&
            d.lat >= -90 && d.lat <= 90 && d.lng >= -180 && d.lng <= 180 &&
            d.name.trim().toLowerCase() !== name.trim().toLowerCase()
        ).map(d => ({
            name: d.name.trim(),
            lat: d.lat,
            lng: d.lng,
            teaser: typeof d.teaser === 'string' ? d.teaser.trim() : '',
            category: CATEGORIES.has(d.category) ? d.category : 'oddity',
        }));

        res.json({ related });
    } catch (error) {
        console.error('Error in /explore-related:', error.message);
        res.status(500).json({ error: 'Failed to find related places', related: [] });
    }
});

app.get('/random-topic', async (req, res) => {
    const type = req.query.type || 'route';
    const prompts = {
        route:     'Name one specific historical journey, migration, trade route, or expedition that can be traced on a map (e.g. "Marco Polo from Venice to Beijing", "the Polynesian migration across the Pacific"). Reply with only the topic phrase, no punctuation at the end, nothing else.',
        timeline:  'Name one specific historical empire, dynasty, war, civilization, or event that has a clear start and end (e.g. "the fall of the Roman Empire", "the Mongol conquests across Eurasia"). Reply with only the topic phrase, nothing else.',
        battle:    'Name one specific historical military commander, war, or conflict whose battles can be mapped (e.g. "Alexander the Great", "the Punic Wars"). Reply with only the name or phrase, nothing else.',
        spread:    'Name one specific historical phenomenon, religion, disease, idea, or people that spread geographically (e.g. "the Black Death", "Islam after Muhammad\'s death"). Reply with only the subject name, nothing else. It will be used in "Where did ___ spread?"',
        geography: 'Name one specific river, mountain range, desert, sea, strait, or trade route that has historical significance (e.g. "the Nile River and ancient Egypt", "the Silk Road terrain"). Reply with only the topic phrase, nothing else.',
        compare:   'Name two historical empires, civilizations, or powers that can be interestingly compared (e.g. "Rome and Han China at their peak", "the Aztecs and Incas"). Reply in the format "X and Y", nothing else.',
    };
    try {
        const response = await anthropic.messages.create({
            model: 'claude-haiku-4-5-20251001',
            max_tokens: 60,
            temperature: 1,
            messages: [{ role: 'user', content: prompts[type] || prompts.route }],
        });
        res.json({ topic: response.content[0].text.trim() });
    } catch {
        res.status(500).json({ topic: null });
    }
});

app.get('/getGoogleMapsApiKey', (req, res) => {
    res.json({ key: process.env.GOOGLE_MAPS_API_KEY });
});

// Dev-only: lets tools/globe-editor.html write its generated globe CSS
// straight into css/styles.css, between the GLOBE:START/GLOBE:END markers.
if (process.env.NODE_ENV !== 'production') {
    app.post('/tools/save-globe-css', (req, res) => {
        try {
            const block = req.body && req.body.css;
            if (!block || typeof block !== 'string') {
                return res.status(400).json({ error: 'Missing css string in body' });
            }
            const cssPath = path.join(__dirname, 'css', 'styles.css');
            const original = fs.readFileSync(cssPath, 'utf8');
            const start = '/* GLOBE:START — generated by tools/globe-editor.html, do not hand-edit between markers */';
            const end = '/* GLOBE:END */';
            const startIdx = original.indexOf(start);
            const endIdx = original.indexOf(end);
            if (startIdx === -1 || endIdx === -1 || endIdx < startIdx) {
                return res.status(500).json({ error: 'GLOBE markers not found in styles.css' });
            }
            const updated =
                original.slice(0, startIdx) +
                start + '\n' +
                block.trim() + '\n' +
                end +
                original.slice(endIdx + end.length);
            fs.writeFileSync(cssPath, updated, 'utf8');
            res.json({ ok: true });
        } catch (error) {
            console.error('Error in /tools/save-globe-css:', error.message);
            res.status(500).json({ error: 'Failed to write styles.css' });
        }
    });
}

// Dev-only: lets tools/prompts-editor.html read and rewrite the example-prompt
// data (RANDOM_QUESTIONS, the template topic pools, and the compare pairs)
// straight into js/main.js, between the PROMPTS:START/PROMPTS:END markers.
if (process.env.NODE_ENV !== 'production') {
    const mainJsPath = path.join(__dirname, 'js', 'main.js');
    const START = '// PROMPTS:START — managed by tools/prompts-editor.html, do not hand-edit structure between markers';
    const END = '// PROMPTS:END';

    function readPromptsBlock() {
        const original = fs.readFileSync(mainJsPath, 'utf8');
        const startIdx = original.indexOf(START);
        const endIdx = original.indexOf(END);
        if (startIdx === -1 || endIdx === -1 || endIdx < startIdx) {
            throw new Error('PROMPTS markers not found in js/main.js');
        }
        return {
            original,
            startIdx,
            endIdx,
            block: original.slice(startIdx + START.length, endIdx),
        };
    }

    function quoteList(arr, indent) {
        return arr.map(s => `${indent}${JSON.stringify(s)},`).join('\n');
    }

    app.get('/tools/load-prompts-js', (req, res) => {
        try {
            const { block } = readPromptsBlock();
            // The block only ever contains plain data literals (arrays/objects of
            // strings) between the markers, so evaluating it locally to recover
            // the structured data is safe — it's our own source file, not
            // user-supplied input.
            const data = new Function(`${block}\nreturn { RANDOM_QUESTIONS, FAVORITE_QUESTIONS, POOL: _POOL, COMPARE_A: _COMPARE_A, COMPARE_B: _COMPARE_B };`)();
            res.json(data);
        } catch (error) {
            console.error('Error in /tools/load-prompts-js:', error.message);
            res.status(500).json({ error: 'Failed to read js/main.js' });
        }
    });

    app.post('/tools/save-prompts-js', (req, res) => {
        try {
            const { RANDOM_QUESTIONS, FAVORITE_QUESTIONS, POOL, COMPARE_A, COMPARE_B } = req.body || {};
            const lists = { RANDOM_QUESTIONS, FAVORITE_QUESTIONS, route: POOL && POOL.route, timeline: POOL && POOL.timeline,
                battle: POOL && POOL.battle, spread: POOL && POOL.spread, geography: POOL && POOL.geography,
                COMPARE_A, COMPARE_B };
            for (const [name, list] of Object.entries(lists)) {
                if (!Array.isArray(list) || !list.every(s => typeof s === 'string')) {
                    return res.status(400).json({ error: `Missing or invalid list: ${name}` });
                }
            }
            const randomSet = new Set(RANDOM_QUESTIONS);
            if (!FAVORITE_QUESTIONS.every(q => randomSet.has(q))) {
                return res.status(400).json({ error: 'FAVORITE_QUESTIONS must be a subset of RANDOM_QUESTIONS' });
            }

            const generated = `
const RANDOM_QUESTIONS = [
${quoteList(RANDOM_QUESTIONS, '    ')}
];

// Pinned/preferred prompts — curated in tools/prompts-editor.html. These are
// favored as landing-page suggestion chips over the general random pool.
const FAVORITE_QUESTIONS = [
${quoteList(FAVORITE_QUESTIONS, '    ')}
];

// Per-template topic pools
const _POOL = {
    route: [
${quoteList(POOL.route, '        ')}
    ],
    timeline: [
${quoteList(POOL.timeline, '        ')}
    ],
    battle: [
${quoteList(POOL.battle, '        ')}
    ],
    spread: [
${quoteList(POOL.spread, '        ')}
    ],
    geography: [
${quoteList(POOL.geography, '        ')}
    ],
};

// Compare template uses pairs drawn from two separate pools
const _COMPARE_A = [
${quoteList(COMPARE_A, '    ')}
];
const _COMPARE_B = [
${quoteList(COMPARE_B, '    ')}
];
`;

            const { original, startIdx, endIdx } = readPromptsBlock();
            const updated = original.slice(0, startIdx) + START + generated + END + original.slice(endIdx + END.length);
            fs.writeFileSync(mainJsPath, updated, 'utf8');
            res.json({ ok: true });
        } catch (error) {
            console.error('Error in /tools/save-prompts-js:', error.message);
            res.status(500).json({ error: 'Failed to write js/main.js' });
        }
    });
}

// Dev-only: lets tools/prompts-editor.html manage draft "custom lists" of
// candidate prompts — separate from the live js/main.js data — plus an AI
// generator for filling a list with candidates for a given description.
if (process.env.NODE_ENV !== 'production') {
    const customListsPath = path.join(__dirname, 'tools', 'custom-prompt-lists.json');

    function readCustomLists() {
        try {
            const raw = fs.readFileSync(customListsPath, 'utf8');
            const parsed = JSON.parse(raw);
            return Array.isArray(parsed.lists) ? parsed : { lists: [] };
        } catch {
            return { lists: [] };
        }
    }

    app.get('/tools/load-custom-lists', (req, res) => {
        res.json(readCustomLists());
    });

    app.post('/tools/save-custom-lists', (req, res) => {
        try {
            const { lists } = req.body || {};
            if (!Array.isArray(lists)) {
                return res.status(400).json({ error: 'Missing or invalid lists array' });
            }
            for (const l of lists) {
                if (typeof l.id !== 'string' || typeof l.name !== 'string' ||
                    !Array.isArray(l.prompts) || !l.prompts.every(p => typeof p === 'string')) {
                    return res.status(400).json({ error: 'Malformed list entry' });
                }
            }
            fs.writeFileSync(customListsPath, JSON.stringify({ lists }, null, 2), 'utf8');
            res.json({ ok: true });
        } catch (error) {
            console.error('Error in /tools/save-custom-lists:', error.message);
            res.status(500).json({ error: 'Failed to write custom-prompt-lists.json' });
        }
    });

    app.post('/tools/generate-prompts', async (req, res) => {
        try {
            const { description, count, existing } = req.body || {};
            if (!description || typeof description !== 'string') {
                return res.status(400).json({ error: 'Missing description' });
            }
            const n = Math.min(Math.max(parseInt(count, 10) || 5, 1), 15);
            const avoidList = Array.isArray(existing) ? existing.slice(0, 200) : [];
            const avoidBlock = avoidList.length
                ? `\n\nDo not repeat or closely rephrase any of these already-used prompts:\n${avoidList.map(q => `- ${q}`).join('\n')}`
                : '';

            const response = await anthropic.messages.create({
                model: 'claude-haiku-4-5-20251001',
                max_tokens: 1000,
                temperature: 1,
                messages: [{
                    role: 'user',
                    content: `You are writing example prompts for a history/geography exploration app called Earthlopedia. Each prompt is a short, punchy, specific question or command about a real historical journey, empire, battle, migration, place, or geographic phenomenon — written to make someone curious enough to click it. Examples of the house style:\n- "Trace every stop on Marco Polo's 24-year journey from Venice to Beijing"\n- "Map exactly where the Black Death spread year by year from 1347 to 1353"\n- "Why does Africa have so many suspiciously straight borders?"\n- "How Polynesian sailors navigated by stars and waves to find every Pacific island"\n\nWrite ${n} new prompts matching that style, all specifically about: "${description}"${avoidBlock}\n\nReply with ONLY a JSON array of ${n} strings, nothing else — no preamble, no markdown fences.`
                }],
            });

            const raw = response.content[0].text.trim();
            const start = raw.indexOf('[');
            const end = raw.lastIndexOf(']');
            if (start === -1 || end === -1) throw new Error('No JSON array in response');
            const prompts = JSON.parse(raw.slice(start, end + 1)).filter(p => typeof p === 'string' && p.trim());
            res.json({ prompts });
        } catch (error) {
            console.error('Error in /tools/generate-prompts:', error.message);
            res.status(500).json({ error: 'Failed to generate prompts' });
        }
    });
}

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`App is running on http://localhost:${PORT}`);
});
