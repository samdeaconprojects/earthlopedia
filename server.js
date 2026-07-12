const express = require('express');
const path = require('path');
const Anthropic = require('@anthropic-ai/sdk');
const app = express();
require('dotenv').config();

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

app.use(express.json());
app.use('/html', express.static(path.join(__dirname, 'html')));
app.use('/css', express.static(path.join(__dirname, 'css')));
app.use('/js', express.static(path.join(__dirname, 'js')));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'html', 'index.html'));
});

app.post('/ask', async (req, res) => {
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
- Include a "## Key Facts" section with ${cfg.facts} bullet points. For competitive/historical topics always include: first occurrence, most recent, record holders or dominant nations/people, a surprising or lesser-known fact
- Include a "## Geographic Story" section (2-3 sentences) explaining how the topic spread or shifted across the world over time
- Keep total summary to ${cfg.words} words

## Data block:
After the summary, output all locations in chronological order. Each entry name should be: "City/Place — brief event (Winner/detail if relevant)".

ALWAYS produce the data block. For "world cup winners" → each tournament's host city final venue. For "dinosaurs" → major fossil sites. For "internet" → cities of key milestones. Always find the geographic angle.

If the question is about a specific place, landmark, or singular subject (e.g. "the island that legally belongs to no country", "the lost city of Petra"), add "main": true to that subject's entry. Only one entry should have "main": true. Do NOT add "main": true for survey/list questions (e.g. "World Cup winners", "major volcanoes").

If the subject with "main": true is a country, sovereign state, overseas territory, or named political region (e.g. "France", "Japan", "Greenland", "Patagonia"), also add "country": "<English name suitable for geocoding>" to that same entry. Do not add "country" for cities, landmarks, or non-political geographic features.

If the subject with "main": true is a historical empire, kingdom, or multi-country political entity (e.g. "the Roman Empire", "the British Empire", "the Mongol Empire"), instead add "region_countries": ["Country1", "Country2", ...] listing up to 8 modern countries whose territory significantly overlapped with that entity at its peak. Use standard English country names suitable for geocoding. Do not add both "country" and "region_countries" to the same entry.

## Multiple routes:
Most topics describe a single path and need nothing extra. But when a topic genuinely contains two or more distinct, separately-traceable journeys — e.g. "Columbus's four voyages", "Cook's three Pacific voyages", separate invasion routes of the same campaign, parallel migration branches — add "route": <integer> (1, 2, 3, ...) to each location marking which journey it belongs to. Use the same route number for every stop on the same journey, in chronological order within that route. Only do this when the routes are genuinely distinct and each has 2+ of its own stops; do not fragment a single continuous journey into artificial routes, and omit "route" entirely for single-path topics (the default case).

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

Rules:
- latitude/longitude are numbers not strings
- year is a number (negative = BCE)
- Include every significant location for this topic. For specific routes, voyages, or journeys include every known stop. For broad survey topics include all major sites. Aim for 8–22 locations; never omit known stops to save space
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
            max_tokens: cfg.maxTokens,
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
                content: `Topic: "${question}"\nLocation: ${context}\n\nWrite 2–3 sentences explaining this location's specific role or significance in the context of "${question}". Be vivid and specific. No bullet points, just flowing prose.\n\nThen on a new line output exactly:\nfollow_ups:\n["question 1", "question 2", "question 3"]\n\nThese should be 3 short, specific follow-up questions a curious person would ask about this specific location.`
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

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`App is running on http://localhost:${PORT}`);
});
