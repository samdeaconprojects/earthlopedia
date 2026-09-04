// Real-world place retrieval for Explore mode.
//
// Why this exists: /explore-nearby used to ask the model to *recall* which
// places sit inside an arbitrary lat/lng box and to emit their coordinates
// from memory. That is the one thing a language model is worst at, and the
// endpoint had grown a small industry of defences against it — a bounds
// filter, a margin clamp, a self-reported "match" flag, an instruction not to
// relocate places from other countries, and a whole retry round for when the
// entire batch came back about the wrong region.
//
// Retrieval removes the failure at its source. Wikidata knows exactly which
// notable things sit in a bounding box and where they are, to the metre. The
// model's job shrinks to what it is actually good at: choosing the
// interesting ones and writing the hook. Coordinates are never generated —
// they are copied from the candidate record.
//
// A pleasant side effect: results got *more* distinctive, not just more
// accurate. Asked to recall, a model reaches for the tourist canon; handed
// the real local inventory it can pick out the Hai Van Pass and the Chàm
// Islands instead of the same three famous names.

// Classes that are never a place you can go and look at. Kept deliberately
// short and global — country, language, ethnic group, dynasty, outbreak, and
// the "Geography of X" style abstractions, all of which Wikidata pins at a
// country centroid and which would otherwise dominate a zoomed-out box by
// sitelink count. Per-country administrative classes (Vietnam's "rural
// district", France's "commune") are deliberately NOT listed: their Q-ids
// differ in every country, so chasing them here buys a worse list everywhere
// else. The model filters those out at the curation step, which is exactly
// the kind of judgement it is cheap and reliable at.
const EXCLUDED_CLASSES = [
    'Q6256',      // country
    'Q3624078',   // sovereign state
    'Q7275',      // state
    'Q34770',     // language
    'Q33742',     // natural language
    'Q41710',     // ethnic group
    'Q164950',    // dynasty
    'Q3024240',   // historical country
    'Q3241045',   // disease outbreak
    'Q17334923',  // location (bare abstraction)
    'Q11514315',  // historical period
    'Q571',       // book
    'Q5',         // human
    'Q4830453',   // business
];

// Wikidata's query service is a shared public endpoint: it is rate-limited,
// occasionally slow, and requires a User-Agent that identifies the caller.
const WDQS = 'https://query.wikidata.org/sparql';
const USER_AGENT = 'earthlopedia/1.0 (map explorer; contact via site)';
// A miss costs the user this wait *plus* the model-recall call it falls back
// to, so keep it tight. Regions that answer inside the budget get cached and
// are instant from then on; regions that never make it stay on recall, which
// is the behaviour Explore had before any of this existed.
const SPARQL_TIMEOUT_MS = 3000;
const GEOSEARCH_TIMEOUT_MS = 3000;

// Candidate lists are stable for a given patch of the world, and a user
// panning around re-enters the same boxes constantly. Cache on a rounded box
// so near-identical viewports share an entry.
const CACHE_TTL_MS = 30 * 60 * 1000;
const CACHE_MAX = 300;
const cache = new Map();

function cacheGet(key) {
    const hit = cache.get(key);
    if (!hit) return null;
    if (Date.now() - hit.at > CACHE_TTL_MS) {
        cache.delete(key);
        return null;
    }
    // Refresh LRU position.
    cache.delete(key);
    cache.set(key, hit);
    return hit.value;
}

function cacheSet(key, value) {
    if (cache.size >= CACHE_MAX) cache.delete(cache.keys().next().value);
    cache.set(key, { at: Date.now(), value });
}

async function fetchWithTimeout(url, opts, ms) {
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), ms);
    try {
        return await fetch(url, { ...opts, signal: ctrl.signal });
    } finally {
        clearTimeout(timer);
    }
}

// Wikidata stores coordinates as WKT: "Point(<lng> <lat>)" — longitude first,
// which is the reverse of every other convention in this codebase. Getting
// this backwards silently puts every pin in the wrong hemisphere.
function parsePoint(wkt) {
    const m = /^Point\(\s*(-?[\d.]+)\s+(-?[\d.]+)\s*\)$/.exec(wkt || '');
    if (!m) return null;
    const lng = parseFloat(m[1]);
    const lat = parseFloat(m[2]);
    if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;
    return { lat, lng };
}

// `includeType` fetches each place's English class name ("mountain pass",
// "archaeological site") to show the model alongside the name. It is worth its
// cost on a city-sized box, where it is what lets the model tell a ward from a
// temple — but on a country-sized one the extra join is what tips the query
// over the query service's limit: measured on a 460 km box, the same query
// returns in ~46s without it and 502s after ~53s with it. Wide boxes already
// sit behind a sitelink floor of 12, so their candidates are famous enough to
// be recognisable from the name alone.
function buildSparql({ south, west, north, east, minSitelinks, limit, includeType }) {
    const values = EXCLUDED_CLASSES.map(q => `wd:${q}`).join(' ');
    // NOT EXISTS rather than a NOT IN filter on the type variable: an item
    // carries several P31 statements, and NOT IN passes as soon as any one of
    // them is clean — which is how "Vietnamese" (a language *and* something
    // else) kept surviving the filter.
    return `SELECT ?item ?itemLabel (SAMPLE(?coord) AS ?pt) (SAMPLE(?sl) AS ?sitelinks)${includeType ? ' (SAMPLE(?tl) AS ?type)' : ''} WHERE {
  SERVICE wikibase:box {
    ?item wdt:P625 ?coord .
    bd:serviceParam wikibase:cornerSouthWest "Point(${west} ${south})"^^geo:wktLiteral .
    bd:serviceParam wikibase:cornerNorthEast "Point(${east} ${north})"^^geo:wktLiteral .
  }
  ?item wikibase:sitelinks ?sl .
  FILTER(?sl > ${minSitelinks})
  FILTER NOT EXISTS { VALUES ?bad { ${values} } ?item wdt:P31 ?bad . }
${includeType ? '  ?item wdt:P31 ?t . ?t rdfs:label ?tl . FILTER(LANG(?tl)="en")\n' : ''}  SERVICE wikibase:label { bd:serviceParam wikibase:language "en". }
}
GROUP BY ?item ?itemLabel
ORDER BY DESC(?sitelinks)
LIMIT ${limit}`;
}

// Some things carry coordinates without being anywhere you can go: an annual
// ceremony is filed at the temple that hosts it, an institution at its
// headquarters. A Kyoto run offered "Kanji of the year" — the ceremony, at
// Kiyomizu-dera's exact coordinates — as a destination. Matched on the class
// name rather than by Q-id because these classes are numerous and shallow,
// and a substring check over them generalises where a Q-id list would not.
// Deliberately does NOT include battles, disasters, wrecks or accidents:
// those sit at a real location a person can stand in, and a battlefield or a
// reactor is exactly the kind of pin Explore exists for.
const NON_PLACE_TYPES = [
    'award', 'competition', 'tournament', 'sports season', 'election',
    'organization', 'organisation', 'agency', 'company', 'enterprise',
    'annual event', 'ceremony', 'treaty', 'concept', 'profession',
    'manga', 'anime', 'film', 'novel', 'video game', 'album', 'song',
    'television series', 'sport',
];
function isNotAPlace(type) {
    const t = type.toLowerCase();
    return NON_PLACE_TYPES.some(bad => t.includes(bad));
}

async function wikidataCandidates(box, timeoutMs = SPARQL_TIMEOUT_MS) {
    const query = buildSparql(box);
    const res = await fetchWithTimeout(
        `${WDQS}?query=${encodeURIComponent(query)}`,
        { headers: { Accept: 'application/sparql-results+json', 'User-Agent': USER_AGENT } },
        timeoutMs,
    );
    if (!res.ok) throw new Error(`WDQS ${res.status}`);
    const data = await res.json();

    const out = [];
    for (const b of data.results.bindings) {
        const name = b.itemLabel?.value?.trim();
        const pt = parsePoint(b.pt?.value);
        // An unlabelled item comes back as its raw Q-id — useless as a place
        // name and a giveaway that there is no English article behind it.
        if (!name || !pt || /^Q\d+$/.test(name)) continue;
        const type = b.type?.value || '';
        if (isNotAPlace(type)) continue;
        out.push({
            name,
            lat: pt.lat,
            lng: pt.lng,
            type,
            sitelinks: parseInt(b.sitelinks?.value, 10) || 0,
        });
    }
    return out;
}

// Wikipedia's geosearch is radius-based and capped at 10 km, so it cannot
// serve a zoomed-out view — but for a tight one it is faster than WDQS and
// reaches things Wikidata has no sitelink count for. Used as a supplement and
// as the fallback when the query service is slow or down.
async function geosearchCandidates({ lat, lng, radius, limit }) {
    const url = `https://en.wikipedia.org/w/api.php?action=query&list=geosearch`
        + `&gscoord=${lat}%7C${lng}&gsradius=${Math.min(Math.round(radius), 10000)}`
        + `&gslimit=${limit}&format=json&origin=*`;
    const res = await fetchWithTimeout(url, { headers: { 'User-Agent': USER_AGENT } }, GEOSEARCH_TIMEOUT_MS);
    if (!res.ok) throw new Error(`geosearch ${res.status}`);
    const data = await res.json();
    return (data.query?.geosearch || []).map(g => ({
        name: g.title,
        lat: g.lat,
        lng: g.lon,
        type: '',
        sitelinks: 0,
    }));
}

// How long a box scan takes is governed by how many cataloguted things are
// inside it, not by how wide it is: a 100 km box over Switzerland takes ~2.7s,
// an 85 km box over central Vietnam ~0.8s, and a country-scale box ~47s no
// matter how the query is written. So there is no span threshold worth
// hard-coding — the time budget below is the control, and it adapts to
// density on its own. Whatever it can't fetch in time falls back to the
// model-recall path, which is also the half of the zoom range (country scale)
// where recall was already adequate.
function boxKey({ south, west, north, east }) {
    // Round to ~0.05° so panning by a few pixels reuses the entry.
    const r = n => Math.round(n * 20) / 20;
    return `${r(south)},${r(west)},${r(north)},${r(east)}`;
}

/**
 * Real, coordinate-accurate candidate places inside a viewport.
 *
 * Returns [] rather than throwing when the sources are unavailable or would
 * be too slow, so the caller can fall back to the model-only path instead of
 * making the user wait or showing them an empty patch of the world.
 */
// Grounding is only worth doing where we can also afford to ask what each
// place *is* (see `includeType`). Without that, a country-scale box ranked by
// sitelinks is mostly countries, big cities and institutions — a run over the
// Alps offered "World Health Organization" as somewhere to go — which is worse
// than what the model produces unaided at that zoom. Above this span, don't
// retrieve at all and let recall answer, which is what it was always good at.
const GROUND_MAX_KM = 150;

async function findCandidates(box) {
    if (box.longSideKm > GROUND_MAX_KM) return [];
    const key = boxKey(box);
    const cached = cacheGet(key);
    if (cached) return cached;
    return gather(box, key);
}

async function gather({ south, west, north, east, lat, lng, longSideKm }, key, timeoutMs) {
    // A wide view should only surface genuinely notable things — at country
    // scale a sitelink floor of 3 returns hundreds of villages. A tight view
    // needs the opposite: drop the bar or a quiet neighbourhood looks empty.
    const minSitelinks = longSideKm > 800 ? 12 : longSideKm > 200 ? 6 : longSideKm > 50 ? 3 : 1;
    const limit = 60;

    let candidates = [];
    let queried = false;
    try {
        candidates = await wikidataCandidates(
            { south, west, north, east, minSitelinks, limit, includeType: true },
            timeoutMs || SPARQL_TIMEOUT_MS,
        );
        queried = true;
    } catch (err) {
        console.log(`[geo] wikidata lookup failed (${err.message}) — falling back`);
    }

    // Thin result on a close-in view: top it up from geosearch, which indexes
    // plenty of things that carry no sitelink weight.
    if (candidates.length < 12 && longSideKm < 40) {
        try {
            const extra = await geosearchCandidates({
                lat, lng,
                radius: Math.max(longSideKm * 500, 1000),
                limit: 40,
            });
            const seen = new Set(candidates.map(c => c.name.toLowerCase()));
            for (const e of extra) {
                if (seen.has(e.name.toLowerCase())) continue;
                // geosearch has no notability signal and happily returns
                // hospitals and office blocks, so only use it to fill gaps.
                if (e.lat < south || e.lat > north || e.lng < west || e.lng > east) continue;
                seen.add(e.name.toLowerCase());
                candidates.push(e);
            }
        } catch (err) {
            console.log(`[geo] geosearch fallback failed (${err.message})`);
        }
    }

    // Only cache a result the sources actually answered. An empty list from a
    // successful query is a real fact about the box (open ocean, empty desert)
    // and worth remembering; an empty list from a timeout or a 502 is not, and
    // caching it would lock the region onto the fallback path for half an hour
    // even though the next attempt might well succeed.
    if (queried) cacheSet(key, candidates);
    return candidates;
}

module.exports = { findCandidates };
