let map;
let statesStack = [];

// PROMPTS:START — managed by tools/prompts-editor.html, do not hand-edit structure between markers
const RANDOM_QUESTIONS = [
    "Trace every stop on Marco Polo's 24-year journey from Venice to Beijing",
    "Map all the ports Columbus visited across his four voyages to the Americas",
    "Show the route Magellan's crew took to circumnavigate the globe",
    "Where did the first humans travel as they spread out of Africa over 70,000 years?",
    "Trace Vasco da Gama's sea route from Portugal around Africa to India",
    "Map every Greek colony founded around the Mediterranean Sea",
    "Show every territory the Roman Empire controlled at its absolute peak",
    "Where did Viking settlements stretch from Scandinavia to North America?",
    "Trace the Silk Road's branching routes from Rome all the way to Chang'an",
    "Map where the Black Death spread year by year from 1347 to 1353",
    "Show every battle Alexander the Great fought across three continents",
    "Where did Buddhism spread from its origin in Nepal across Asia?",
    "Map where the Mongol Empire expanded under each successive Khan",
    "Show every Crusader state and how their borders shifted over 200 years",
    "Where did Polynesian explorers reach across the entire Pacific Ocean?",
    "Trace the Lewis and Clark expedition from St. Louis to the Pacific",
    "Map all the Portuguese trading posts from West Africa to Japan",
    "Where did the Bantu people migrate across sub-Saharan Africa over 3,000 years?",
    "The underground cities carved five stories deep beneath Cappadocia, Turkey",
    "The ghost cities abandoned along the Silk Road when trade routes shifted",
    "Nan Madol — a city of 100 artificial islands built in the middle of the Pacific",
    "The city of Petra carved directly into rose-red rock in the Jordanian desert",
    "The Viking settlement in Newfoundland discovered 500 years before Columbus",
    "The Indus Valley civilization that stretched across three modern countries then vanished",
    "Cahokia — the Native American city larger than London that disappeared by 1350",
    "How tiny Portugal controlled trade routes across half the world simultaneously",
    "How the Byzantine Empire held off every invader for 1,000 years after Rome fell",
    "The Mali Empire — the African kingdom so wealthy its emperor crashed gold markets",
    "How the Mongols created the largest land empire in history in 25 years",
    "The Inca Empire built 25,000 miles of roads through the Andes without wheels or horses",
    "How Islam spread from a single city in Arabia to Spain and Indonesia in 100 years",
    "The Phoenicians — the sailors who mapped the Mediterranean 500 years before Rome",
    "How did the Sahara transform from green savanna to desert in just 4,000 years?",
    "Why does Africa have so many suspiciously straight borders?",
    "How Polynesian sailors navigated by stars and waves to find every Pacific island",
    "Why Antarctica was once a tropical rainforest teeming with life",
    "How the Black Sea was created when the Mediterranean burst through in a massive flood",
    "The volcano that created an entirely new island in the Atlantic in 1963",
    "The place where three tectonic plates meet beneath Iceland",
    "Why the Dead Sea is shrinking by a meter every year",
    "The ocean current that made European colonialism geographically inevitable",
    "How salt once determined which cities became empires and which ones starved",
    "The spice trade routes that sparked the entire Age of Exploration",
    "How chocolate traveled from Aztec currency to a global obsession",
    "The tea trade that simultaneously started a revolution and destroyed an empire",
    "How coffee houses spread across Europe and accidentally invented the newspaper",
    "How sugar plantations fundamentally reshaped the map of the Americas",
    "The trans-Saharan trade network that made medieval Timbuktu a global city",
    "The border drawn so carelessly that it caused three wars over the next century",
    "The Treaty of Tordesillas — when Spain and Portugal literally divided the entire world",
    "The tiny landlocked country that has never been conquered in 700 years",
    "How the Suez Canal changed every single shipping route on Earth overnight",
    "The Cold War by proxy — how Africa's borders were redrawn by powers 5,000 miles away",
    "How the Panama Canal bankrupted France before America stepped in to finish it",
    "The island that legally belongs to no country and sits between two that claim it",
    "Map every battle that Napoleon lost",
    "Journey along the ring of fire",
    "Trace all seven of Zheng He's treasure voyages across the Indian Ocean",
    "Map St. Paul's four separate missionary journeys across the Roman world",
    "Trace Ibn Battuta's five separate journeys across the Islamic world, from Mecca to China",
    "Map Shackleton's three separate Antarctic expeditions — Nimrod, Endurance, and Quest",
    "Trace Amundsen's three polar expeditions — the Northwest Passage, the South Pole, and the Northeast Passage",
    "Map all five D-Day beach landings — Utah, Omaha, Gold, Juno, and Sword",
    "Trace the three-pronged Mongol invasion routes into Europe in 1241",
    "Map the two-pronged US island-hopping campaign across the Pacific in WWII",
    "Tour de France route",
    "Show Hawaii's trail of former islands",
    "the Amazon River basin",
    "the Yellow River and ancient China",
    "the Ganges River and Indian civilization",
    "the Niger River and West African trade",
    "the Mississippi River system",
    "the Danube River through European history",
    "the Himalayan mountain range",
    "the Andes Mountains and Inca roads",
    "the Appalachian Mountains",
    "FC Barcelona's 2009 season",
];

// Pinned/preferred prompts — curated in tools/prompts-editor.html. These are
// favored as landing-page suggestion chips over the general random pool.
const FAVORITE_QUESTIONS = [
    "Trace every stop on Marco Polo's 24-year journey from Venice to Beijing",
    "Show the route Magellan's crew took to circumnavigate the globe",
    "Map where the Black Death spread year by year from 1347 to 1353",
    "Show every battle Alexander the Great fought across three continents",
    "Trace the Lewis and Clark expedition from St. Louis to the Pacific",
    "The underground cities carved five stories deep beneath Cappadocia, Turkey",
    "Map every battle that Napoleon lost",
    "Journey along the ring of fire",
    "Trace all seven of Zheng He's treasure voyages across the Indian Ocean",
    "Map all five D-Day beach landings — Utah, Omaha, Gold, Juno, and Sword",
    "Show Hawaii's trail of former islands",
];

// Per-template topic pools
const _POOL = {
    route: [
        "Marco Polo from Venice to Beijing",
        "Ibn Battuta across 44 countries",
        "Magellan's crew around the entire globe",
        "Vasco da Gama around Africa to India",
        "Columbus across his four voyages",
        "Francis Drake's circumnavigation",
        "Lewis and Clark from St. Louis to the Pacific",
        "the Silk Road from Rome to Chang'an",
        "Zheng He's treasure fleet across the Indian Ocean",
        "the Polynesian migration across the Pacific",
        "the Viking routes from Scandinavia to North America",
        "the Bantu migrations across Africa",
        "the first humans migrating out of Africa",
        "the Trans-Saharan caravan routes",
        "the Indian Ocean spice trade routes",
        "the Amber Road from the Baltic to Rome",
        "the Incense Route across Arabia",
        "the Grand Trunk Road from Kabul to Bengal",
        "the Tea Horse Road through Tibet",
        "the Volga trade route",
        "Hannibal's army crossing the Alps",
        "Alexander the Great from Greece to India",
        "Napoleon's march to Moscow and retreat",
        "the Crusader armies marching to Jerusalem",
        "Cortés's conquest route through Mexico",
        "Pizarro's conquest route through Peru",
        "Roald Amundsen's race to the South Pole",
        "Ernest Shackleton's Antarctic expedition",
        "James Cook's three Pacific voyages",
        "the first fleet from Britain to Botany Bay",
        "the Oregon Trail pioneers",
        "the California Gold Rush settlers",
        "the Underground Railroad routes",
        "Burke and Wills crossing Australia",
        "the Hajj pilgrimage routes",
        "the Camino de Santiago",
        "the Cape Horn sea route",
        "Leif Eriksson from Greenland to North America",
        "the Mayflower from Plymouth to Massachusetts",
        "the Portuguese spice route to Malacca",
        "the Mongol invasion routes from Mongolia to Europe",
        "de Soto through the American Southeast",
        "Balboa crossing Panama to the Pacific",
        "the Long March through China",
        "the Exodus route across the Sinai",
        "the Viking route to Constantinople",
        "Zheng He's route to East Africa",
        "the Inca royal road through the Andes",
        "the Trans-Siberian Railway route",
        "the Mansa Musa pilgrimage to Mecca",
        "the Arab conquest routes across the Middle East",
        "the Roman roads across Europe",
        "Zheng He's seven treasure voyages across the Indian Ocean",
        "St. Paul's four missionary journeys across the Roman world",
        "Ibn Battuta's five separate journeys across the Islamic world",
        "Shackleton's three separate Antarctic expeditions",
        "Amundsen's Northwest Passage, South Pole, and Northeast Passage expeditions",
        "the five D-Day beach landings in Normandy",
        "the three-pronged Mongol invasion of Europe in 1241",
        "the two-pronged US island-hopping campaign across the Pacific",
        "Vasco da Gama's three voyages to India",
        "Marco Polo's outbound and return routes to China",
    ],
    timeline: [
        "the Roman Empire",
        "the Byzantine Empire",
        "the Ottoman Empire",
        "the Mongol Empire",
        "the British Empire",
        "the Spanish Empire",
        "the Portuguese Empire",
        "the French Empire",
        "the Aztec Empire",
        "the Inca Empire",
        "the Maya civilization",
        "the Han Dynasty",
        "the Tang Dynasty",
        "the Ming Dynasty",
        "the Qing Dynasty",
        "the Mughal Empire",
        "the Safavid Empire",
        "the Mali Empire",
        "the Songhai Empire",
        "the Ghana Empire",
        "the Kingdom of Kush",
        "the Aksumite Empire",
        "the Zulu Kingdom",
        "the Ashanti Empire",
        "the Viking Age",
        "the Crusades",
        "the Hundred Years' War",
        "the Thirty Years' War",
        "the Napoleonic Wars",
        "the Seven Years' War",
        "the Peloponnesian War",
        "the Punic Wars",
        "the Greco-Persian Wars",
        "the Arab Conquests",
        "the Umayyad Caliphate",
        "the Abbasid Caliphate",
        "the Rashidun Caliphate",
        "the Achaemenid Persian Empire",
        "the Sassanid Empire",
        "the Parthian Empire",
        "the Maurya Empire",
        "the Gupta Empire",
        "the Maratha Empire",
        "the Delhi Sultanate",
        "the Khmer Empire",
        "the Majapahit Empire",
        "the Ayutthaya Kingdom",
        "the Frankish Empire",
        "the Holy Roman Empire",
        "the Seljuk Empire",
        "the Timurid Empire",
        "the Reconquista",
        "the Hanseatic League",
        "the Venetian Republic",
        "the Three Kingdoms of Korea",
        "the Joseon Dynasty",
        "the Japanese Sengoku period",
        "the Meiji Restoration",
        "the Tokugawa shogunate",
        "ancient Egypt from the First Dynasty to Cleopatra",
        "the Phoenician trading empire",
        "the Carthaginian Empire",
        "the Macedonian Empire",
        "the Olmec civilization",
        "the Tiwanaku Empire",
        "the Mississippian culture",
        "the Cold War",
        "the British Raj",
        "World War I",
        "World War II",
        "the Scramble for Africa",
        "the Protestant Reformation",
        "the Renaissance",
        "the Age of Exploration",
    ],
    battle: [
        "Alexander the Great",
        "Julius Caesar",
        "Genghis Khan",
        "Napoleon Bonaparte",
        "Hannibal Barca",
        "Saladin",
        "Tamerlane",
        "Attila the Hun",
        "Khalid ibn al-Walid",
        "Scipio Africanus",
        "Shaka Zulu",
        "Pachacuti",
        "Sundiata Keita",
        "Charles Martel",
        "Richard the Lionheart",
        "Frederick the Great",
        "the Duke of Wellington",
        "Tokugawa Ieyasu",
        "Oda Nobunaga",
        "Toyotomi Hideyoshi",
        "Ramesses II",
        "Thutmose III",
        "Cyrus the Great",
        "Darius the Great",
        "Themistocles",
        "Leonidas at Thermopylae",
        "Pyrrhus of Epirus",
        "the Punic Wars",
        "the Hundred Years' War",
        "the Thirty Years' War",
        "the Crusades",
        "the Greco-Persian Wars",
        "the Peloponnesian War",
        "the Mongol invasion of Europe",
        "the Arab Conquest of Persia",
        "the Reconquista",
        "the Wars of the Roses",
        "the English Civil War",
        "the American Revolutionary War",
        "the American Civil War",
        "the Napoleonic Wars",
        "the Zulu Wars",
        "the Boer War",
        "the Russo-Japanese War",
        "the Seven Years' War",
        "the Hundred Years' War",
        "the Macedonian Wars against Rome",
        "the Sengoku period in Japan",
        "the Maratha Wars",
        "the Anglo-Zulu War",
        "the Fall of Constantinople",
        "the Siege of Vienna 1683",
        "the Battle of Gaugamela",
        "the Battle of Thermopylae",
        "the Mongol conquest of China",
        "Tamerlane's campaigns across Central Asia",
    ],
    spread: [
        "Islam",
        "Christianity",
        "Buddhism",
        "Hinduism",
        "Zoroastrianism",
        "the Black Death",
        "the Justinian Plague",
        "the Antonine Plague",
        "the Spanish flu of 1918",
        "smallpox after European contact with the Americas",
        "cholera in the 19th century",
        "the Bantu people across Africa",
        "the Polynesian people across the Pacific",
        "the Indo-European languages",
        "the Phoenician alphabet",
        "the Latin alphabet",
        "Arabic numerals",
        "the printing press",
        "gunpowder",
        "the wheel",
        "iron smelting",
        "bronze casting",
        "the horse",
        "the camel",
        "the potato from the Andes",
        "coffee from Ethiopia",
        "sugar cane from New Guinea",
        "the tulip from Central Asia to Europe",
        "maize from Mesoamerica",
        "tobacco from the Americas",
        "cotton cultivation",
        "rice cultivation",
        "the olive tree across the Mediterranean",
        "the grape vine",
        "Silk Road goods from China",
        "the Roman road network",
        "the Mongol Empire",
        "the Roman Empire",
        "the Arab Conquests",
        "Hellenistic culture after Alexander",
        "the Ottoman Empire",
        "European colonialism",
        "the Atlantic slave trade",
        "the Norse settlements",
        "the Viking trade networks",
    ],
    geography: [
        "the Nile River and ancient Egypt",
        "the Amazon River basin",
        "the Tigris and Euphrates and Mesopotamia",
        "the Indus River valley",
        "the Yellow River and ancient China",
        "the Ganges River and Indian civilization",
        "the Congo River basin",
        "the Niger River and West African trade",
        "the Mississippi River system",
        "the Mekong River in Southeast Asia",
        "the Danube River through European history",
        "the Rhine as Rome's border",
        "the Volga River and Viking trade",
        "the Zambezi River",
        "the Himalayan mountain range",
        "the Andes Mountains and Inca roads",
        "the Alps and their role in European history",
        "the Caucasus Mountains",
        "the Hindu Kush and the Khyber Pass",
        "the Atlas Mountains in North Africa",
        "the Rocky Mountains and westward expansion",
        "the Appalachian Mountains",
        "the Sahara Desert",
        "the Gobi Desert",
        "the Atacama Desert",
        "the Arabian Desert",
        "the Kalahari Desert",
        "the Sonoran Desert",
        "the Fertile Crescent and the first cities",
        "the Great Rift Valley",
        "the Mediterranean Sea as a cradle of civilizations",
        "the Strait of Malacca and Asian trade",
        "the Bosphorus and Dardanelles",
        "the English Channel",
        "the Cape of Good Hope",
        "the Red Sea trade routes",
        "the Persian Gulf",
        "the Baltic Sea and Viking routes",
        "the Black Sea colonies",
        "the Silk Road terrain from Rome to Chang'an",
        "the Bering Land Bridge",
        "the Polynesian island chains",
        "the Caribbean Sea and trade winds",
        "the Great Barrier Reef",
        "the Hawaiian volcanic island chain",
    ],
};

// Compare template uses pairs drawn from two separate pools
const _COMPARE_A = [
    "the Roman Empire",
    "the Byzantine Empire",
    "the Mongol Empire",
    "the Ottoman Empire",
    "the British Empire",
    "the Spanish Empire",
    "the Portuguese Empire",
    "the French Empire",
    "the Aztec Empire",
    "the Inca Empire",
    "the Achaemenid Persian Empire",
    "the Han Dynasty",
    "the Tang Dynasty",
    "the Mughal Empire",
    "the Safavid Empire",
    "the Mali Empire",
    "the Zulu Kingdom",
    "the Carthaginian Empire",
    "ancient Athens",
    "ancient Sparta",
    "the Viking Age",
    "the Crusader states",
    "the Umayyad Caliphate",
    "the Abbasid Caliphate",
    "the Khmer Empire",
    "the Majapahit Empire",
    "the Maurya Empire",
    "the Gupta Empire",
    "the Ashanti Empire",
    "the Ethiopian Empire",
    "the Aztec Triple Alliance",
];
const _COMPARE_B = [
    "Han China",
    "the Ming Dynasty",
    "the Mongol Empire",
    "the British Empire",
    "the Inca Empire",
    "the Maya civilization",
    "the Sassanid Empire",
    "the Roman Republic",
    "the Holy Roman Empire",
    "the Dutch East India Company",
    "the Venetian Republic",
    "ancient Egypt",
    "the Parthian Empire",
    "the Timurid Empire",
    "the Songhai Empire",
    "the Swahili Coast city-states",
    "the Japanese shogunate",
    "the Maratha Empire",
    "the Seljuk Empire",
    "the Toltec Empire",
    "the Mississippian culture",
    "the Polynesian empire of Tonga",
    "the Kingdom of Kush",
    "the Aksumite Empire",
    "the Frankish Empire",
    "the Macedonian Empire",
    "the Norse settlers",
    "the Delhi Sultanate",
    "the Vijayanagara Empire",
    "the Oyo Empire",
];
// PROMPTS:END

// Short, punchy example searches typed out one at a time in the explore bar's
// fake "search field" placeholder — see initExploreBarTypewriter. Kept
// separate from RANDOM_QUESTIONS (whose entries run long) so the bar's width
// stays sensible while each one types in.
const EXPLORE_BAR_PROMPTS = [
    "Trace the Silk Road from Rome to Chang'an",
    "Map every battle Napoleon lost",
    "Where did the Black Death spread, year by year?",
    "Follow Magellan's crew around the globe",
    "Show every Viking settlement in the North Atlantic",
    "Journey along the Pacific Ring of Fire",
    "Map Zheng He's seven treasure voyages",
    "Where did humans first spread out of Africa?",
    "Trace Marco Polo's route from Venice to Beijing",
    "Show the Roman Empire at its greatest extent",
    "Map all five D-Day beach landings",
    "How did the Sahara turn from savanna to desert?",
];

// Types the EXPLORE_BAR_PROMPTS through #exploreBarTypewriter forever: type a
// line in, hold, delete it, move to the next. Pauses itself whenever the bar
// is showing a live discovery status instead (.bar-status-visible) or explore
// mode isn't active, so a half-typed line never freezes on screen.
// How long the bar sits as just the globe + wordmark on load before it
// widens out to the full search bar (see the .brand-only CSS).
const EXPLORE_BAR_REVEAL_DELAY = 2500;

// The typed-out example questions are a load-in flourish only — once the user
// has actually engaged Explore (panned/zoomed to pull a discovery batch,
// opened Curate, ran a curated search), retire the animation for good and let
// the bar settle to its wordmark / live-status resting state. See
// stopExploreBarTypewriter callers.
let exploreBarTypewriterStopped = false;
// The example question the bar is currently typing out / holding on screen.
// Clicking the bar to open search carries this into the search field so the
// click acts on whatever the user was just reading (see exploreSearchInstead).
let exploreBarCurrentPhrase = '';
function stopExploreBarTypewriter() {
    if (exploreBarTypewriterStopped) return;
    exploreBarTypewriterStopped = true;
    const bar = document.getElementById('exploreBar');
    bar?.classList.remove('brand-only');
    bar?.classList.add('typewriter-off');
    const textEl = document.querySelector('#exploreBarTypewriter .ebt-text');
    if (textEl) textEl.textContent = '';
}

function initExploreBarTypewriter() {
    const bar = document.getElementById('exploreBar');
    const wrap = document.getElementById('exploreBarTypewriter');
    const textEl = wrap && wrap.querySelector('.ebt-text');
    if (!bar || !textEl) return;

    const order = [...EXPLORE_BAR_PROMPTS].sort(() => Math.random() - 0.5);
    const reduceMotion = window.matchMedia
        && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let idx = 0;

    // Drop .brand-only after the intro beat so the bar animates open. The
    // typewriter itself only starts once that widen transition has finished.
    const reveal = (then) => {
        if (!bar.classList.contains('brand-only')) { then(); return; }
        setTimeout(() => {
            bar.classList.remove('brand-only');
            setTimeout(then, 650);
        }, EXPLORE_BAR_REVEAL_DELAY);
    };

    if (reduceMotion) {
        // No per-character animation — just rotate the full line every few
        // seconds so the caret still has something to sit after.
        reveal(() => {
            if (exploreBarTypewriterStopped) return;
            textEl.textContent = order[0];
            exploreBarCurrentPhrase = order[0];
            const rotator = setInterval(() => {
                if (exploreBarTypewriterStopped) { clearInterval(rotator); return; }
                idx = (idx + 1) % order.length;
                textEl.textContent = order[idx];
                exploreBarCurrentPhrase = order[idx];
            }, 4500);
        });
        return;
    }

    const barHidden = () => {
        const bar = document.getElementById('exploreBar');
        return !bar
            || !document.body.classList.contains('explore-mode')
            || bar.classList.contains('bar-status-visible');
    };

    let phrase = order[0];
    let pos = 0;
    let deleting = false;
    exploreBarCurrentPhrase = phrase;

    const tick = () => {
        if (exploreBarTypewriterStopped) return;
        exploreBarCurrentPhrase = phrase;
        // Bar's busy showing a real status — wait, don't advance the text.
        if (barHidden()) { setTimeout(tick, 500); return; }

        if (!deleting) {
            pos++;
            textEl.textContent = phrase.slice(0, pos);
            if (pos >= phrase.length) {
                deleting = true;
                setTimeout(tick, 1900);
                return;
            }
            setTimeout(tick, 28 + Math.random() * 32);
        } else {
            pos--;
            textEl.textContent = phrase.slice(0, pos);
            if (pos <= 0) {
                deleting = false;
                idx = (idx + 1) % order.length;
                phrase = order[idx];
                setTimeout(tick, 320);
                return;
            }
            setTimeout(tick, 24);
        }
    };

    reveal(() => setTimeout(tick, 250));
}

function _pickComparePair() {
    const a = _COMPARE_A[Math.floor(Math.random() * _COMPARE_A.length)];
    let b;
    do { b = _COMPARE_B[Math.floor(Math.random() * _COMPARE_B.length)]; } while (b === a);
    return `${a} and ${b}`;
}

const PROMPT_TEMPLATES = [
    {
        type: "route",
        prefix: "Map the route of ",
        topics: [
            "Marco Polo from Venice to Beijing",
            "Magellan's crew around the entire globe",
            "Columbus across his four voyages to the Americas",
            "the first humans migrating out of Africa over 70,000 years",
            "Vasco da Gama around Africa to India",
            "Lewis and Clark from St. Louis to the Pacific",
            "the Silk Road from Rome all the way to Chang'an",
            "the Polynesian migration across the Pacific",
            "the Viking routes from Norway to North America",
            "Ibn Battuta's 75,000-mile journey across the known world",
            "Zheng He's treasure fleet across Asia and East Africa",
            "Hannibal's army crossing the Alps into Italy",
            "Alexander the Great's full campaign from Greece to India",
            "the Mongol invasion routes across Asia and into Europe",
            "the Crusader armies marching from France to Jerusalem",
            "the first fleet voyaging from Britain to Botany Bay",
            "Roald Amundsen's race to the South Pole",
            "Shackleton's ill-fated Antarctic expedition",
            "Napoleon's march to Moscow and catastrophic retreat",
            "Cortés's conquest route through Mexico to Tenochtitlán",
            "Pizarro's conquest route through Peru to Cusco",
            "the Oregon Trail pioneers across the American West",
            "de Soto's brutal expedition through the American Southeast",
            "the Trans-Siberian Railway from Moscow to Vladivostok",
            "the Underground Railroad routes across North America",
            "the Grand Trunk Road from Kabul to Bengal",
            "James Cook's three Pacific exploration voyages",
            "the triangular slave trade across the Atlantic",
            "Leif Eriksson's voyage from Greenland to North America",
            "the Mayflower from Plymouth to Massachusetts",
            "the Persian Royal Road from Susa to Sardis",
            "the Hajj pilgrimage routes from across the Islamic world",
            "the Ho Chi Minh Trail through Vietnam and Laos",
            "Burke and Wills' crossing of the Australian outback",
            "the overland journey of the California Gold Rush settlers",
            "the Camino de Santiago pilgrimage routes across Europe",
            "Balboa's trek across Panama to the Pacific",
            "Drake's circumnavigation of the globe",
            "the spice routes from the Moluccas to Lisbon",
            "the Hanseatic League trade routes across Northern Europe",
            "Zheng He's seven treasure voyages across the Indian Ocean",
            "St. Paul's four missionary journeys across the Roman world",
            "Ibn Battuta's five separate journeys across the Islamic world",
            "Shackleton's three separate Antarctic expeditions",
            "Amundsen's Northwest Passage, South Pole, and Northeast Passage expeditions",
            "the five D-Day beach landings in Normandy",
            "the three-pronged Mongol invasion of Europe in 1241",
            "the two-pronged US island-hopping campaign across the Pacific in WWII",
            "Vasco da Gama's three voyages to India",
            "Marco Polo's outbound and return routes to China",
        ],
    },
    {
        type: "timeline",
        prefix: "Timeline of ",
        topics: [
            "the fall of the Roman Empire",
            "the Mongol conquests across Eurasia",
            "the spread of Islam from Arabia to Spain to Indonesia",
            "the Black Death across Europe 1347–1353",
            "the Ottoman Empire's expansion over 600 years",
            "the Age of Exploration voyages",
            "Alexander the Great's conquests from Greece to India",
            "the Byzantine Empire from Constantine to 1453",
            "the Crusades and their shifting borders",
            "the Han Dynasty from 206 BCE to 220 CE",
            "the Mughal Empire in India",
            "ancient Egypt from the First Dynasty to Cleopatra",
            "the Aztec Empire from founding to conquest",
            "the Inca Empire's rise and Spanish destruction",
            "the Viking Age from the first raids to colonization",
            "the Hundred Years' War between England and France",
            "the Thirty Years' War across Europe",
            "the Napoleonic Wars across Europe and beyond",
            "the American Civil War",
            "World War I on the Western Front",
            "World War II in the Pacific",
            "the Cold War from Berlin to Cuba to Afghanistan",
            "the spread of Christianity across the Roman Empire",
            "the spread of Buddhism from Nepal across Asia",
            "the Bronze Age across the Mediterranean",
            "the Persian Empire from Cyrus to Darius III",
            "the Mali Empire and the golden age of Timbuktu",
            "the Khmer Empire and the building of Angkor Wat",
            "the Japanese feudal era from samurai to Edo",
            "the Qing Dynasty from conquest to collapse",
            "the British Empire from Cromwell to independence movements",
            "the Spanish colonial empire in the Americas",
            "the Portuguese colonial empire from Africa to Japan",
            "ancient Mesopotamia from Sumer through Babylon",
            "the Hellenistic kingdoms after Alexander's death",
            "the decline of the Maya civilization",
            "the Swahili Coast city-states and Indian Ocean trade",
            "the Maurya Empire under Ashoka",
            "the Tang Dynasty and the golden age of China",
            "the Songhai Empire in West Africa",
        ],
    },
    {
        type: "battle",
        prefix: "Show every battle of ",
        topics: [
            "Alexander the Great",
            "Julius Caesar",
            "Genghis Khan",
            "Napoleon Bonaparte",
            "the Hundred Years' War",
            "World War II in the Pacific",
            "the Punic Wars between Rome and Carthage",
            "the Crusades",
            "Hannibal Barca",
            "Saladin",
            "Tamerlane",
            "Attila the Hun",
            "the Mongol invasion of Europe",
            "the Ottoman conquest of the Byzantine Empire",
            "the Thirty Years' War",
            "the American Revolutionary War",
            "the Napoleonic Wars",
            "the American Civil War",
            "the Seven Years' War",
            "the Zulu Wars in southern Africa",
            "the Spanish Reconquista",
            "the Arab Conquest of Persia",
            "the Greco-Persian Wars",
            "the Peloponnesian War",
            "Scipio Africanus",
            "Khalid ibn al-Walid",
            "Shaka Zulu",
            "the Boer War",
            "the Russo-Japanese War",
            "the Macedonian Wars against Rome",
            "the Anglo-Zulu War",
            "the Wars of the Roses in England",
            "the Mongol conquest of China",
            "Timur's campaigns across Central Asia",
            "the Fall of Constantinople",
        ],
    },
    {
        type: "spread",
        prefix: "Where did ",
        suffix: " spread?",
        topics: [
            "the Black Death",
            "Islam after Muhammad's death",
            "the Mongol Empire under Genghis Khan",
            "Christianity in its first 500 years",
            "Buddhism from Nepal across Asia",
            "the Bantu migrations across Africa",
            "the Polynesian people across the Pacific",
            "the Roman Empire at its peak",
            "the Ottoman Empire",
            "the printing press after Gutenberg",
            "the Spanish flu of 1918",
            "smallpox after European contact with the Americas",
            "gunpowder from China westward",
            "the potato from the Andes to the world",
            "coffee from Ethiopia to the world",
            "sugar cane from New Guinea across the globe",
            "the horse from Central Asia outward",
            "Hellenistic culture after Alexander",
            "the Latin alphabet from Rome to the world",
            "Arabic numerals from India to Europe",
            "the Indo-European languages across Eurasia",
            "the bubonic plague in the 6th century Justinian outbreak",
            "maize from Mesoamerica to the world",
            "tobacco from the Americas to Europe",
            "the wheel from Mesopotamia outward",
            "the steam engine from Britain to the world",
            "the Silk Road goods from China to Rome",
            "the Phoenician alphabet across the Mediterranean",
            "measles and smallpox through the Americas",
            "the tulip from Central Asia to Europe",
            "rice cultivation from China across Asia",
            "iron smelting from sub-Saharan Africa outward",
            "the olive tree from the Levant across the Mediterranean",
            "the Black Plague along trade routes from Central Asia",
            "Zoroastrianism across Persia and beyond",
        ],
    },
    {
        type: "geography",
        prefix: "Trace the geography of ",
        topics: [
            "the Silk Road terrain from Rome to Chang'an",
            "the Nile River and ancient Egypt",
            "the Amazon River basin",
            "the Polynesian island chains",
            "the Fertile Crescent and first cities",
            "the Himalayan mountain range",
            "the Mediterranean Sea trade routes",
            "the Sahara Desert",
            "the Great Rift Valley in Africa",
            "the Mississippi River system",
            "the Rhine and Danube border of the Roman Empire",
            "the Tigris and Euphrates river system",
            "the Indus River and its ancient civilization",
            "the Yellow River and ancient China",
            "the Andes Mountains and Inca roads",
            "the Great Wall of China",
            "the Bering Land Bridge between Asia and America",
            "the Strait of Malacca and Asian trade",
            "the Cape of Good Hope and sea routes",
            "the English Channel and its military history",
            "the Dardanelles and Bosphorus straits",
            "the Red Sea trade routes",
            "the Arabian Sea monsoon trade winds",
            "the Pacific Ring of Fire",
            "the Atacama Desert",
            "the Gobi Desert",
            "the Hindu Kush mountains",
            "the Caucasus Mountains",
            "the Congo River basin",
            "the Great Plains of North America",
            "the Persian Gulf oil fields and ancient trade",
            "the Danube River through European history",
            "the Mekong River through Southeast Asia",
            "the Ganges River and Indian civilization",
            "the Caribbean Sea and the colonial trade winds",
            "the Barents Sea and Arctic exploration routes",
        ],
    },
    {
        type: "compare",
        prefix: "Compare the empires of ",
        topics: [
            "Rome and Han China at their peak",
            "the Aztecs and Incas",
            "the Ottoman and Byzantine empires",
            "the Portuguese and Spanish colonial empires",
            "the Mongols and the British Empire",
            "the Umayyad and Abbasid caliphates",
            "the Persian and Greek empires",
            "the Macedonian and Roman empires",
            "the Carthaginian and Roman empires",
            "the Mali and Songhai empires in West Africa",
            "the Mughal and Safavid empires",
            "the British and French colonial empires",
            "the Aztec and Maya civilizations",
            "the Egyptian and Mesopotamian civilizations",
            "the Dutch and Portuguese trading empires",
            "the Spartan and Athenian city-states",
            "the Viking and Arab traders of the 9th century",
            "the Tang Dynasty and the Byzantine Empire",
            "the Assyrian and Babylonian empires",
            "the Timurid and Mughal empires",
            "the Khmer and Majapahit empires",
            "the Roman Republic and the Roman Empire",
            "the Seleucid and Ptolemaic kingdoms",
            "the Zulu and Boer empires in southern Africa",
            "the Ming and Qing dynasties in China",
            "the Safavid and Ottoman empires",
            "the Aksumite and Roman empires",
            "the Norse and Arab traders of the Volga route",
            "the Inuit and Norse settlements in the Arctic",
            "the Hawaiian chiefdoms before European contact",
        ],
    },
];

let _shownQuestions = new Set();
let _shownFavorites = new Set();

function pickRandom(arr, n) {
    const shuffled = [...arr].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, n);
}

// Picks n questions from RANDOM_QUESTIONS, cycling through the pool before
// repeating. `exclude` keeps it from re-picking questions already chosen
// elsewhere (e.g. favorites already shown as chips).
function pickFreshQuestions(n, exclude = []) {
    const candidates = exclude.length ? RANDOM_QUESTIONS.filter(q => !exclude.includes(q)) : RANDOM_QUESTIONS;
    const unseen = candidates.filter(q => !_shownQuestions.has(q));
    const pool = unseen.length >= n ? unseen : candidates;
    if (pool === candidates) _shownQuestions.clear();
    const shuffled = [...pool].sort(() => Math.random() - 0.5);
    const picked = shuffled.slice(0, n);
    picked.forEach(q => _shownQuestions.add(q));
    return picked;
}

// Picks up to n questions from the curated FAVORITE_QUESTIONS list, cycling
// through them before repeating (same pattern as pickFreshQuestions).
function pickFavoriteChips(n) {
    if (FAVORITE_QUESTIONS.length === 0) return [];
    const unseen = FAVORITE_QUESTIONS.filter(q => !_shownFavorites.has(q));
    const pool = unseen.length >= n ? unseen : FAVORITE_QUESTIONS;
    if (pool === FAVORITE_QUESTIONS) _shownFavorites.clear();
    const shuffled = [...pool].sort(() => Math.random() - 0.5);
    const picked = shuffled.slice(0, Math.min(n, FAVORITE_QUESTIONS.length));
    picked.forEach(q => _shownFavorites.add(q));
    return picked;
}

function initDetailSlider() {
    const slider = document.getElementById('detailSlider');
    if (!slider) return;
    const update = () => slider.style.setProperty('--val', slider.value);
    slider.addEventListener('input', update);
    update();
}

function initLandingSuggestions() {
    const favChips = pickFavoriteChips(1);
    const chips = [...favChips, ...pickFreshQuestions(3 - favChips.length, favChips)];
    const container = document.getElementById("randomQuestionChips");
    container.innerHTML = chips.map(q =>
        `<button class="suggestion-chip" onclick="useSuggestion('${q.replace(/'/g, "\\'")}')">${q}</button>`
    ).join('');

    const refreshBtn = document.getElementById("refreshChipsBtn");
    if (refreshBtn) {
        refreshBtn.classList.add("spinning");
        setTimeout(() => refreshBtn.classList.remove("spinning"), 400);
    }

    const grid = document.getElementById("starterGrid");
    grid.innerHTML = PROMPT_TEMPLATES.map((t, i) => {
        const suffixHtml = t.suffix ? `<span class="template-suffix">${t.suffix}</span>` : '';
        return `<div class="starter-template-row" onclick="submitBuiltQuestion(${i})">
            <span class="template-static">${t.prefix}</span><span class="template-blank" id="tb-${i}" onclick="event.stopPropagation(); fillTemplateBlank(${i})">___</span>${suffixHtml}
        </div>`;
    }).join('');
}

function useSuggestion(q) {
    document.getElementById("questionInput").value = q;
    askQuestion();
}

function fillTemplateBlank(i) {
    const t = PROMPT_TEMPLATES[i];
    const blank = document.getElementById(`tb-${i}`);

    const pool = _POOL[t.type];
    const topic = t.type === 'compare'
        ? _pickComparePair()
        : pool[Math.floor(Math.random() * pool.length)];

    blank.textContent = topic + ' ↺';
    blank.classList.remove('template-blank-loading');
    blank.classList.add('template-blank-filled');

    blank.closest('.starter-template-row').classList.add('template-row-ready');

    document.getElementById("questionInput").value = t.prefix + topic + (t.suffix || '');
    document.getElementById("questionInput").focus();
}

function submitBuiltQuestion(i) {
    const blank = document.getElementById(`tb-${i}`);
    if (!blank || !blank.classList.contains('template-blank-filled')) {
        fillTemplateBlank(i);
        return;
    }
    askQuestion();
}

let promptBuilderOpen = false;
function togglePromptBuilder() {
    promptBuilderOpen = !promptBuilderOpen;
    const panel = document.getElementById("promptBuilderPanel");
    const icon = document.getElementById("pbToggleIcon");
    panel.classList.toggle("open", promptBuilderOpen);
    icon.textContent = promptBuilderOpen ? "▾" : "▸";
}

let retryCount = 0;
const maxRetries = 2;
const retryStrings = ["What are locations related to ", "Can you show locations for ", "I need locations about "];

function clearStreamGhost() {
    const ghost = document.getElementById('stream-ghost');
    if (!ghost) return;
    ghost.classList.remove('active');
    setTimeout(() => { ghost.innerHTML = ''; }, 500);
}

let infowindow;
let streetViewService;
let locStreetViewPano;
let modalStreetViewPano;


let questionBox = document.getElementById("questionBox"); // Initialized outside functions

const darkTheme = [
    // Base terrain — darken instead of flattening, so relief/desert/forest texture survives
    { elementType: "geometry", stylers: [{ lightness: -55 }, { saturation: -15 }] },
    { elementType: "labels.text.stroke", stylers: [{ color: "#12141f" }] },
    { elementType: "labels.text.fill", stylers: [{ color: "#7b84a0" }] },
    // Natural landscape (desert, scrub, forest) — lighter and warmer than the base so terrain type reads clearly
    {
      featureType: "landscape.natural",
      elementType: "geometry",
      stylers: [{ lightness: -28 }, { saturation: 18 }],
    },
    {
      featureType: "landscape.natural.landcover",
      elementType: "geometry",
      stylers: [{ lightness: -22 }, { saturation: 24 }],
    },
    {
      featureType: "landscape.natural.terrain",
      elementType: "geometry",
      stylers: [{ lightness: -18 }, { saturation: 10 }],
    },
    {
      featureType: "landscape.man_made",
      elementType: "geometry",
      stylers: [{ color: "#181b2c" }],
    },
    {
      featureType: "administrative",
      elementType: "geometry.stroke",
      stylers: [{ color: "#2a2f47" }],
    },
    {
      featureType: "administrative.locality",
      elementType: "labels.text.fill",
      stylers: [{ color: "#8ed8ff" }],
    },
    {
      featureType: "poi",
      elementType: "labels.text.fill",
      stylers: [{ color: "#6b7290" }],
    },
    {
      featureType: "poi.park",
      elementType: "geometry",
      stylers: [{ color: "#0f2420" }],
    },
    {
      featureType: "poi.park",
      elementType: "labels.text.fill",
      stylers: [{ color: "#4b9c85" }],
    },
    {
      featureType: "road",
      elementType: "geometry",
      stylers: [{ color: "#1d2136" }],
    },
    {
      featureType: "road",
      elementType: "geometry.stroke",
      stylers: [{ color: "#0a0c16" }],
    },
    {
      featureType: "road",
      elementType: "labels.text.fill",
      stylers: [{ color: "#8790ac" }],
    },
    {
      featureType: "road.highway",
      elementType: "geometry",
      stylers: [{ color: "#272c48" }],
    },
    {
      featureType: "road.highway",
      elementType: "geometry.stroke",
      stylers: [{ color: "#100f1c" }],
    },
    {
      featureType: "road.highway",
      elementType: "labels.text.fill",
      stylers: [{ color: "#ff9340" }],
    },
    {
      featureType: "transit",
      elementType: "geometry",
      stylers: [{ color: "#1a1d30" }],
    },
    {
      featureType: "transit.station",
      elementType: "labels.text.fill",
      stylers: [{ color: "#8ed8ff" }],
    },
    {
      featureType: "water",
      elementType: "geometry",
      stylers: [{ color: "#080a17" }],
    },
    {
      featureType: "water",
      elementType: "labels.text.fill",
      stylers: [{ color: "#4a5578" }],
    },
    {
      featureType: "water",
      elementType: "labels.text.stroke",
      stylers: [{ color: "#080a17" }],
    },
  ];

 

const lightTheme = [
    // Landscape — slightly saturated, stays natural
    {
        featureType: "landscape.natural",
        elementType: "geometry",
        stylers: [{ saturation: 20 }, { lightness: -5 }],
    },
    {
        featureType: "landscape.natural.landcover",
        elementType: "geometry",
        stylers: [{ saturation: 25 }, { lightness: -8 }],
    },
    // Labels — clean and readable
    { elementType: "labels.text.stroke", stylers: [{ color: "#ffffff" }, { weight: 3 }] },
    { elementType: "labels.text.fill", stylers: [{ color: "#222222" }] },
    {
        featureType: "administrative.country",
        elementType: "geometry.stroke",
        stylers: [{ color: "#888888" }, { weight: 0.8 }],
    },
    {
        featureType: "administrative.province",
        elementType: "geometry.stroke",
        stylers: [{ color: "#aaaaaa" }, { weight: 0.5 }],
    },
    // Water — electric blue
    {
        featureType: "water",
        elementType: "geometry",
        stylers: [{ color: "#7ec8e3" }],
    },
    {
        featureType: "water",
        elementType: "labels.text.fill",
        stylers: [{ color: "#2a6e8a" }],
    },
    // Roads — subtle, don't compete with terrain
    {
        featureType: "road",
        elementType: "geometry",
        stylers: [{ color: "#ffffff" }, { opacity: 0.6 }],
    },
    {
        featureType: "road",
        elementType: "geometry.stroke",
        stylers: [{ color: "#cccccc" }, { opacity: 0.4 }],
    },
    {
        featureType: "road.highway",
        elementType: "geometry",
        stylers: [{ color: "#f5e6a0" }, { opacity: 0.7 }],
    },
    // POI — hide clutter
    {
        featureType: "poi",
        elementType: "labels",
        stylers: [{ visibility: "off" }],
    },
    {
        featureType: "transit",
        elementType: "labels",
        stylers: [{ visibility: "off" }],
    },
];

// Dusk / twilight — the middle setting between the light (noon) and dark
// (deep night) maps. Dimmed but not dark, tinted with the teal / blue-green
// family that the medium app theme uses (see body.theme-medium in styles.css).
const mediumTheme = [
    { elementType: "geometry", stylers: [{ lightness: -12 }, { saturation: 8 }] },
    { elementType: "labels.text.stroke", stylers: [{ color: "#0b262b" }, { weight: 2.5 }] },
    { elementType: "labels.text.fill", stylers: [{ color: "#dcefec" }] },
    {
        featureType: "landscape.natural",
        elementType: "geometry",
        stylers: [{ lightness: -6 }, { saturation: 14 }],
    },
    {
        featureType: "landscape.natural.landcover",
        elementType: "geometry",
        stylers: [{ lightness: -4 }, { saturation: 18 }],
    },
    {
        featureType: "landscape.man_made",
        elementType: "geometry",
        stylers: [{ color: "#20323a" }],
    },
    {
        featureType: "administrative",
        elementType: "geometry.stroke",
        stylers: [{ color: "#33555d" }],
    },
    {
        featureType: "administrative.locality",
        elementType: "labels.text.fill",
        stylers: [{ color: "#ccf0ec" }],
    },
    {
        featureType: "poi",
        elementType: "labels.text.fill",
        stylers: [{ color: "#aecdc6" }],
    },
    {
        featureType: "poi.park",
        elementType: "geometry",
        stylers: [{ color: "#173a33" }],
    },
    {
        featureType: "poi.park",
        elementType: "labels.text.fill",
        stylers: [{ color: "#8fd3bb" }],
    },
    {
        featureType: "road",
        elementType: "geometry",
        stylers: [{ color: "#2b3f47" }],
    },
    {
        featureType: "road",
        elementType: "geometry.stroke",
        stylers: [{ color: "#1b2a30" }],
    },
    {
        featureType: "road",
        elementType: "labels.text.fill",
        stylers: [{ color: "#cadde0" }],
    },
    {
        featureType: "road.highway",
        elementType: "geometry",
        stylers: [{ color: "#3a565f" }],
    },
    {
        featureType: "road.highway",
        elementType: "geometry.stroke",
        stylers: [{ color: "#1b2a30" }],
    },
    {
        featureType: "road.highway",
        elementType: "labels.text.fill",
        stylers: [{ color: "#b4ecdd" }],
    },
    {
        featureType: "transit",
        elementType: "geometry",
        stylers: [{ color: "#283c44" }],
    },
    {
        featureType: "water",
        elementType: "geometry",
        stylers: [{ color: "#0e3d49" }],
    },
    {
        featureType: "water",
        elementType: "labels.text.fill",
        stylers: [{ color: "#9fc4c8" }],
    },
    {
        featureType: "water",
        elementType: "labels.text.stroke",
        stylers: [{ color: "#0e3d49" }],
    },
];

let googleMapsApiKey;

// Map style: 'light' (noon), 'medium' (dusk), or 'dark' (deep night). The
// map-style control cycles through all three and drags the app theme along
// to match; auto-dark-mode picks one from the time of day.
const MAP_STYLES = ['light', 'medium', 'dark'];
const MAP_STYLE_ICON = { light: '🗺️', medium: '🌆', dark: '🌙' };
let mapStyle = MAP_STYLES.includes(localStorage.getItem('earthlopedia-map-style'))
    ? localStorage.getItem('earthlopedia-map-style')
    : 'light';

function mapThemeArray() {
    if (mapStyle === 'dark') return darkTheme;
    if (mapStyle === 'medium') return mediumTheme;
    return lightTheme;
}

// Applies a map style unconditionally: repaints the map (unless Street View
// is up), stores the choice, updates the toggle icon, and — unless
// syncApp is false — brings the app theme along to match.
function applyMapStyle(style, { syncApp = true } = {}) {
    if (!MAP_STYLES.includes(style)) style = 'light';
    mapStyle = style;
    localStorage.setItem('earthlopedia-map-style', style);
    const btn = document.getElementById('map-style-toggle');
    if (btn) btn.textContent = MAP_STYLE_ICON[style];
    if (typeof map !== 'undefined' && map && !map.getStreetView().getVisible()) {
        map.setOptions({ styles: mapThemeArray() });
    }
    if (syncApp && currentAppTheme() !== style) {
        applyAppTheme(style);
    }
}

// ============== SETTINGS (popup on the main search container) ==============
const ACCENT_PRESETS = {
    orange: { accent: '#ff6b00', light: '#ff8a3d', dark: '#c04a00', rgb: '255,107,0', lightRgb: '255,140,40' },
    blue:   { accent: '#2563eb', light: '#60a5fa', dark: '#1d4ed8', rgb: '37,99,235',  lightRgb: '96,165,250' },
    green:  { accent: '#16a34a', light: '#4ade80', dark: '#15803d', rgb: '22,163,74', lightRgb: '74,222,128' },
    purple: { accent: '#9333ea', light: '#c084fc', dark: '#7e22ce', rgb: '147,51,234', lightRgb: '192,132,252' },
};
const SETTINGS_KEY = 'earthlopedia-settings';
const DEFAULT_LOCATION_ZOOM = 7;
let appSettings = Object.assign(
    { autoDarkMode: true, locationZoom: DEFAULT_LOCATION_ZOOM, accentColor: 'purple' },
    (() => { try { return JSON.parse(localStorage.getItem(SETTINGS_KEY)) || {}; } catch { return {}; } })()
);

function saveSettings() {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(appSettings));
}

function applyAccentColor(name) {
    const preset = ACCENT_PRESETS[name] || ACCENT_PRESETS.orange;
    const root = document.documentElement.style;
    root.setProperty('--accent', preset.accent);
    root.setProperty('--accent-light', preset.light);
    root.setProperty('--accent-dark', preset.dark);
    root.setProperty('--accent-rgb', preset.rgb);
    root.setProperty('--accent-light-rgb', preset.lightRgb);
    document.querySelectorAll('.settings-color-swatch').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.color === name);
    });
}

// Applies whatever the auto-dark-mode schedule currently calls for, moving
// the map style and the app theme together: light around midday, dark deep
// at night, and the dusk / medium style in the hours between. Only called
// when the setting is on, and only changes anything that isn't already right.
// Runs before the Maps script has loaded too — applyMapStyle() just stores
// the choice in that case, and initMap() reads mapThemeArray() when it builds.
function applyAutoDarkMode() {
    if (!appSettings.autoDarkMode) return;
    const hour = new Date().getHours();
    const want = (hour >= 20 || hour < 6) ? 'dark'
        : (hour >= 9 && hour < 17) ? 'light'
        : 'medium';
    if (mapStyle !== want) applyMapStyle(want, { syncApp: false });
    if (currentAppTheme() !== want) applyAppTheme(want);
}

function initSettingsUI() {
    const darkToggle = document.getElementById('settingAutoDark');
    const zoomSlider = document.getElementById('settingZoom');
    const zoomValue = document.getElementById('settingZoomValue');
    if (darkToggle) darkToggle.checked = !!appSettings.autoDarkMode;
    if (zoomSlider) zoomSlider.value = appSettings.locationZoom;
    if (zoomValue) zoomValue.textContent = appSettings.locationZoom;
    applyAccentColor(appSettings.accentColor);
    applyAutoDarkMode();
}

function updateSetting(key, value) {
    appSettings[key] = value;
    saveSettings();
    if (key === 'accentColor') applyAccentColor(value);
    if (key === 'locationZoom') {
        const zoomValue = document.getElementById('settingZoomValue');
        if (zoomValue) zoomValue.textContent = value;
    }
    if (key === 'autoDarkMode' && value) applyAutoDarkMode();
}

function getLocationZoom() {
    return appSettings.locationZoom || DEFAULT_LOCATION_ZOOM;
}

// google.maps.Map#fitBounds has a quirk with very tight bounds (locations
// clustered close together, e.g. several spots within the same city): the
// resulting zoom can end up barely different from a whole-continent view,
// leaving markers indistinguishable. fitBounds() itself doesn't expose the
// zoom it's about to pick ahead of time, so we let it run and then, once the
// map settles, nudge the zoom in if the bounds are geographically tight but
// the zoom stayed low.
function fitBoundsSmart(bounds, minZoomForTightBounds = 11) {
    map.fitBounds(bounds);
    google.maps.event.addListenerOnce(map, 'idle', () => {
        if (map.getZoom() >= minZoomForTightBounds) return;
        const ne = bounds.getNorthEast();
        const sw = bounds.getSouthWest();
        const spanLat = Math.abs(ne.lat() - sw.lat());
        const spanLng = Math.abs(ne.lng() - sw.lng());
        // Only boost when the bounds really are tight — wide bounds
        // legitimately deserve a low zoom.
        if (spanLat < 1 && spanLng < 1) {
            map.setZoom(minZoomForTightBounds);
        }
    });
}

function toggleSettingsPopup(e) {
    if (e) e.stopPropagation();
    const popup = document.getElementById('settingsPopup');
    const btn = document.getElementById('settings-toggle');
    if (!popup || !btn) return;
    const opening = popup.style.display === 'none';
    if (opening) {
        // Popup is a fixed, top-level element (kept outside #questionBox so
        // its overflow-y:auto scroll container doesn't clip it). Render it
        // hidden first so its real size is known, then place it near the gear
        // — below by default, flipped above when there's no room (the gear now
        // sits low, in the search box's bottom-right corner).
        popup.style.visibility = 'hidden';
        popup.style.display = 'flex';
        const rect = btn.getBoundingClientRect();
        const pw = popup.offsetWidth || 260;
        const ph = popup.offsetHeight || 300;
        const margin = 8;
        let left = Math.min(
            Math.max(margin, rect.right - pw),
            window.innerWidth - pw - margin
        );
        let top = rect.bottom + 10;
        if (top + ph > window.innerHeight - margin) {
            top = Math.max(margin, rect.top - ph - 10);
        }
        popup.style.left = left + 'px';
        popup.style.top = top + 'px';
        popup.style.visibility = '';
    } else {
        popup.style.display = 'none';
    }
    btn.classList.toggle('active', opening);
}
document.addEventListener('click', (e) => {
    const popup = document.getElementById('settingsPopup');
    const btn = document.getElementById('settings-toggle');
    if (!popup || popup.style.display === 'none') return;
    if (popup.contains(e.target) || e.target === btn) return;
    popup.style.display = 'none';
    if (btn) btn.classList.remove('active');
});
// Clicking off the open search landing panel acts like its back arrow: if
// there's a saved result or a paused explore map behind it (see
// cancelSearch/resumeExploreMode), clicking the map outside the box returns
// to it instead of leaving the box stranded open with nothing to do.
document.addEventListener('click', (e) => {
    const qb = document.getElementById('questionBox');
    if (!qb || !qb.classList.contains('centered') || qb.classList.contains('searching')) return;
    if (!_savedResultState && !exploreWasActiveBeforeSearch) return;
    if (qb.contains(e.target)) return;
    // Also ignore the controls that open/reopen the box in the first place
    // (the top search pill, the explore bar's search button) — a click on
    // those is what got us into this state, not a click "outside" it, and
    // without this it would immediately undo the openSearch()/
    // exploreSearchInstead() call the same click just triggered.
    if (e.target.closest('#topSearchOuter, #exploreBar, #settingsPopup')) return;
    cancelSearch();
});
document.addEventListener('DOMContentLoaded', initSettingsUI);
// Runs off DOMContentLoaded (not initMap) so the "just the logo, then widen"
// intro is timed from page load rather than from whenever the Maps script
// finishes loading.
document.addEventListener('DOMContentLoaded', initExploreBarTypewriter);

// ---- First-run explore hint (#exploreHint in index.html) -------------------
// Big, quiet overlay across the map on a cold load: nudges a first-time
// visitor to either wander (zoom/drag) or search from the bar up top. Shows
// itself a few seconds after load, but only if nothing's been touched yet, and
// retires permanently the moment the user does anything. Deliberately
// low-stakes / easy to pull: this block + #exploreHint + the .explore-hint
// rules in styles.css, nothing else hooks it.
const EXPLORE_HINT_DELAY = 4000;
let exploreHintTimer = null;
let exploreHintDone = false;

function showExploreHint() {
    exploreHintTimer = null;
    if (exploreHintDone) return;
    // Only over a clean explore map — not on top of a restored search result,
    // and not once discovery pins have already started landing.
    if (!document.body.classList.contains('explore-mode')) return;
    if (exploreMarkers.length > 0) return;
    document.getElementById('exploreHint')?.classList.add('visible');
}

function dismissExploreHint() {
    if (exploreHintDone) return;
    exploreHintDone = true;
    if (exploreHintTimer) { clearTimeout(exploreHintTimer); exploreHintTimer = null; }
    const el = document.getElementById('exploreHint');
    if (el) {
        el.classList.remove('visible');
        setTimeout(() => el.remove(), 950);   // drop it once the fade-out ends
    }
    window.removeEventListener('keydown', dismissExploreHint, true);
}

function initExploreHint() {
    if (!document.getElementById('exploreHint')) return;
    exploreHintTimer = setTimeout(showExploreHint, EXPLORE_HINT_DELAY);
    // Any genuine intent to explore or search kills it for good: a keypress,
    // or a pointer/scroll gesture anywhere (map drag, bar click, curate…).
    window.addEventListener('keydown', dismissExploreHint, true);
    ['pointerdown', 'wheel', 'touchstart'].forEach(evt =>
        window.addEventListener(evt, dismissExploreHint, { once: true, passive: true, capture: true }));
}
document.addEventListener('DOMContentLoaded', initExploreHint);
// Re-check the day/night schedule periodically so the theme keeps up while
// the app is left open across the evening threshold.
setInterval(applyAutoDarkMode, 5 * 60 * 1000);

// Fetch the Google Maps API key from the server
fetch('/getGoogleMapsApiKey')
    .then(response => response.json())
    .then(data => {
        googleMapsApiKey = data.key;
        loadGoogleMapsScript();
    })
    .catch(err => console.error("Error fetching Google Maps API key:", err));

function loadGoogleMapsScript() {
    const script = document.createElement("script");
    script.src = `https://maps.googleapis.com/maps/api/js?v=weekly&key=${googleMapsApiKey}&callback=initMap`;
    script.async = true;
    script.defer = true;
    document.body.appendChild(script);
}

function initMap() {
    console.log("Initializing Map...");
    map = new google.maps.Map(document.getElementById("map"), {
        center: { lat: 30, lng: -25 },
        zoom: 3,
        mapTypeId: "terrain",
        styles: mapThemeArray(),
        minZoom: 2,
    });

    infowindow = new google.maps.InfoWindow();

    document.getElementById("questionInput").addEventListener("keydown", function (event) {
        if (event.key === "Enter") {
            askQuestion();
            event.preventDefault();
        }
    });

    document.addEventListener("keydown", function (event) {
        if (event.key === "Escape") {
            const modal = document.getElementById('streetViewModal');
            if (modal && modal.style.display !== 'none') {
                closeStreetViewModal();
                return;
            }
            if (exploreDetailDiscovery) {
                closeExploreDetail();
                return;
            }
            const qb = document.getElementById('questionBox');
            if (qb.classList.contains('centered') && (_savedResultState || exploreWasActiveBeforeSearch)) {
                cancelSearch();
                return;
            }
        }
        if (event.key !== "ArrowRight" && event.key !== "ArrowLeft") return;
        const tag = document.activeElement?.tagName;
        if (tag === "INPUT" || tag === "TEXTAREA") return;
        event.preventDefault();
        if (event.key === "ArrowRight") {
            nextLocation();
        } else {
            prevLocation();
        }
    }, { capture: true });

    map.addListener('zoom_changed', () => { if (map.getZoom() < 5) hideMarkerPopout(); });

    streetViewService = new google.maps.StreetViewService();

    const sv = map.getStreetView();
    sv.addListener('visible_changed', function () {
        if (sv.getVisible()) {
            map.setOptions({ styles: [] });
        } else {
            map.setOptions({ styles: mapThemeArray() });
        }
    });

    // Keeps the shared #marker-popout open while the cursor is travelling
    // from a pin up onto the card itself (the whole card is clickable to open
    // the location) — see scheduleHideMarkerPopout/hideMarkerPopout.
    const markerPopoutEl = document.getElementById('marker-popout');
    if (markerPopoutEl) {
        markerPopoutEl.addEventListener('mouseenter', () => {
            if (popoutHideTimer) { clearTimeout(popoutHideTimer); popoutHideTimer = null; }
        });
        markerPopoutEl.addEventListener('mouseleave', scheduleHideMarkerPopout);
    }

    initLandingSuggestions();
    initDetailSlider();

    // Default landing experience: open straight into Explore mode (free
    // pan/zoom discovery) instead of the search landing box — see
    // body.explore-mode in index.html, which already starts applied so
    // there's no flash of the old landing box while the Maps script loads.
    // This just wires up the JS-side listener/state now that `map` exists.
    enterExploreMode();
}

// Remaining functions remain the same...


// Restores the topic overview from a focused location — shared by goBack()
// (when a location is focused, "back" means "back to overview" first) and
// #overviewBtn, which jumps straight here from anywhere in the location
// timeline/tour without touching statesStack.
function returnToOverview() {
    if (overviewHTML === null) return false;
    document.getElementById("answer").innerHTML = overviewHTML;
    overviewHTML = null;
    currentFocusedIndex = null;
    applyMarkerEmphasis(null);
    updateTimelineNav();
    renderHeaderState();
    timelineRecenter();
    setCurrentImage(topicImageUrl, topicExtraImages, topicImageDesc);
    if (activeLocations.length === 1) {
        map.setZoom(getLocationZoom());
        map.setCenter({ lat: activeLocations[0].lat, lng: activeLocations[0].lng });
    } else if (activeLocations.length > 1) {
        const bounds = new google.maps.LatLngBounds();
        activeLocations.forEach(loc => bounds.extend({ lat: loc.lat, lng: loc.lng }));
        fitBoundsSmart(bounds);
    }
    if (statesStack.length === 0) {
        document.getElementById("backButton").style.display = "none";
    }
    return true;
}

function goBack() {
    // If zoomed into a location, restore the overview first
    if (returnToOverview()) return;

    if (statesStack.length === 0) return;

    // This pop *might* empty the stack, which would force the box back to
    // the blank centered/landing state below — with nothing left in
    // statesStack to come back via. Stash the result still on screen the
    // same way openSearch() does, so cancelSearchBtn can undo this
    // back-navigation and return to it, instead of losing it for good. (Only
    // actually used below if the popped state turns out to be the blank
    // landing state — see isLandingState.)
    const redoSnapshot = statesStack.length === 1 ? {
        answerHTML: document.getElementById('answer').innerHTML,
        displayedQuestion: document.getElementById('displayedQuestion').innerText,
        inputValue: document.getElementById('questionInput').value,
        locationsHTML: document.querySelector('.collapsible-content').innerHTML,
        voiceControlsDisplay: document.getElementById('voiceControls').style.display,
        focusedIndex: currentFocusedIndex,
        savedLocations: [...activeLocations],
        timelineWasVisible: document.getElementById('timeline-container').style.display !== 'none',
        topicImageUrl: topicImageUrl,
        topicExtraImages: topicExtraImages,
        topicImageDesc: topicImageDesc,
        topSearchQuery: document.getElementById('topSearchQuery').textContent,
    } : null;

    const previousState = statesStack.pop();
    map.setCenter(previousState.center);
    map.setZoom(previousState.zoom);
    document.getElementById("displayedQuestion").innerText = previousState.displayedQuestion;
    document.getElementById("questionInput").value = previousState.inputValue;
    document.getElementById("answer").innerHTML = previousState.answerHTML || '';
    document.querySelector(".collapsible-content").innerHTML = previousState.locationsHTML;
    document.getElementById('topSearchQuery').textContent = previousState.topSearchQuery || '';
    currentQuestion = previousState.inputValue;
    topicImageUrl = previousState.topicImageUrl || null;
    topicExtraImages = previousState.topicExtraImages || [];
    topicImageDesc = previousState.topicImageDesc || null;
    if (topicImageUrl) {
        setCurrentImage(topicImageUrl, topicExtraImages, topicImageDesc);
    } else {
        hideCurrentImage();
    }
    clearMap();
    activeLocations = previousState.savedLocations || [];
    if (previousState.savedLocations?.length) renderMarkers(previousState.savedLocations);
    currentFocusedIndex = null;
    updateTimelineNav();
    renderHeaderState();

    document.getElementById("backButton").style.display = statesStack.length > 0 ? "flex" : "none";

    // The popped state is the true blank landing snapshot only when it never
    // held a real answer — i.e. it's the very first state askQuestion() ever
    // pushed. Once a cancelSearchBtn undo has already consumed that original
    // entry, a *later* pop can empty the stack while restoring a real prior
    // result instead — that belongs back in result-mode, not the empty
    // search box (relying on statesStack.length alone here previously threw
    // that real result away).
    const isLandingState = !previousState.answerHTML && !previousState.displayedQuestion;

    if (isLandingState) {
        document.getElementById('questionBox').classList.remove('result-mode');
        document.getElementById('questionBox').classList.add('centered');
        document.getElementById('topSearchWrapper').classList.remove('visible');
        document.body.classList.remove('containers-hidden');
        document.getElementById('topSearchClearBtn').classList.remove('active');
        hideCurrentImage();
        if (redoSnapshot) {
            _savedResultState = redoSnapshot;
            document.getElementById('cancelSearchBtn').style.display = 'flex';
        }
    } else {
        document.getElementById('questionBox').classList.add('result-mode');
        document.getElementById('questionBox').classList.remove('centered');
        document.getElementById('topSearchWrapper').classList.add('visible');
    }
}



function smoothZoom(targetZoom) {
    if (map.getZoom() < targetZoom) {
        const zoomListener = google.maps.event.addListener(
            map,
            "zoom_changed",
            function () {
                if (map.getZoom() < targetZoom) {
                    setTimeout(() => {
                        map.setZoom(map.getZoom() + 1);
                    }, 100);
                } else {
                    google.maps.event.removeListener(zoomListener);
                }
            }
        );

        setTimeout(() => {
            map.setZoom(map.getZoom() + 1);
        }, 100);
    }
}

function resetMapView() {
    const targetZoom = 3;
    const targetCenter = { lat: 30, lng: -25 };
    map.panTo(targetCenter);
    const stepDown = () => {
        const current = map.getZoom();
        if (current <= targetZoom) return;
        map.setZoom(current - 1);
        setTimeout(stepDown, 80);
    };
    stepDown();
}

function toggleCollapse() {
    const content = document.querySelector(".collapsible-content");
    if (content.style.maxHeight) {
        content.style.maxHeight = null;
    } else {
        content.style.maxHeight = content.scrollHeight + "px";
    }
}

let timelineDots = [];
let timelineData = null;
let timelineCenterYear = null;   // animated: year currently at horizontal center
let timelineRAF = null;
let timelineLastPeriodName = null;
let timelinePxPerYear = 1;       // updated each render; used to convert drag px <-> years
let timelineUserScrolling = false; // true while the user is dragging/flinging the arc
let timelineInertiaRAF = null;

// Interpolate purple → pink → orange based on t in [0,1]
function timelineNodeColor(t) {
    const stops = [
        [99, 102, 241],   // #6366f1 purple
        [236, 72, 153],   // #ec4899 pink
        [249, 115, 22],   // #f97316 orange
    ];
    const seg = t * (stops.length - 1);
    const i = Math.min(Math.floor(seg), stops.length - 2);
    const f = seg - i;
    const a = stops[i], b = stops[i + 1];
    const r = Math.round(a[0] + (b[0] - a[0]) * f);
    const g = Math.round(a[1] + (b[1] - a[1]) * f);
    const bl = Math.round(a[2] + (b[2] - a[2]) * f);
    return { fill: `rgb(${r},${g},${bl})`, stroke: `rgba(${r},${g},${bl},0.55)` };
}

function easeInOutCubic(p) {
    return p < 0.5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2;
}

function drawTimeline(startYear, endYear, highlights = [], periods = []) {
    timelineData = { startYear, endYear, highlights, periods };
    if (timelineRAF) { clearTimeout(timelineRAF); timelineRAF = null; }
    if (timelineInertiaRAF) { cancelAnimationFrame(timelineInertiaRAF); timelineInertiaRAF = null; }
    timelineUserScrolling = false;
    timelineCenterYear = highlights[0] ? highlights[0].year : startYear;
    timelineLastPeriodName = null;
    renderTimeline();
    updateTimelineNav();
    setupTimelineInteraction();
}

// Which highlight index should sit at the horizontal center of the arc.
function timelineCenterIndex() {
    if (!timelineData || !timelineData.highlights.length) return null;
    if (timelineUserScrolling) {
        // While the user is dragging/flinging, "centered" means nearest to
        // whatever year is currently under the crown, not the last focused event.
        let best = timelineData.highlights[0];
        let bestDist = Infinity;
        for (const h of timelineData.highlights) {
            const d = Math.abs(h.year - timelineCenterYear);
            if (d < bestDist) { bestDist = d; best = h; }
        }
        return best.index;
    }
    if (playbackHighlightIndex !== null) return playbackHighlightIndex;
    if (currentFocusedIndex !== null) return currentFocusedIndex;
    return timelineOrderedIndices()[0];
}

// Location indices (matching activeLocations / citation badge numbers),
// sorted chronologically rather than by their order in the backend's list —
// that list order is narrative/geographic, not time order, so prev/next/
// first/last need this to actually move older<->newer along the arc.
function timelineOrderedIndices() {
    if (!timelineData || !timelineData.highlights.length) return [];
    return [...timelineData.highlights]
        .sort((a, b) => a.year - b.year || a.index - b.index)
        .map(h => h.index);
}

// Smoothly animate the arc so the current event's year lands at center.
function timelineRecenter(instant = false) {
    if (!timelineData) return;
    if (timelineInertiaRAF) { cancelAnimationFrame(timelineInertiaRAF); timelineInertiaRAF = null; }
    timelineUserScrolling = false;
    const idx = timelineCenterIndex();
    const ev = timelineData.highlights.find(h => h.index === idx) || timelineData.highlights[0];
    if (!ev) return;
    const targetYear = ev.year;

    if (instant || timelineCenterYear === null) {
        if (timelineRAF) { clearTimeout(timelineRAF); timelineRAF = null; }
        timelineCenterYear = targetYear;
        renderTimeline();
        return;
    }
    // The arc itself doesn't need to move, but the newly-focused event still
    // needs its emphasis ring repainted onto it — without this, two locations
    // sharing (near-enough) the same year leave the ring stuck on whichever
    // node was centered last, even though currentFocusedIndex has moved on.
    if (Math.abs(timelineCenterYear - targetYear) < 0.001) { renderTimeline(); return; }

    // setTimeout rather than requestAnimationFrame so the arc still settles
    // into place if the tab is backgrounded mid-transition.
    if (timelineRAF) clearTimeout(timelineRAF);
    const fromYear = timelineCenterYear;
    const start = performance.now();
    const duration = 550;
    const step = (now) => {
        const p = Math.min(1, (now - start) / duration);
        const e = easeInOutCubic(p);
        timelineCenterYear = fromYear + (targetYear - fromYear) * e;
        renderTimeline();
        if (p < 1) {
            timelineRAF = setTimeout(() => step(performance.now()), 16);
        } else {
            timelineRAF = null;
        }
    };
    timelineRAF = setTimeout(() => step(performance.now()), 16);
}

function fmtYear(y) {
    return y < 0 ? Math.abs(y).toLocaleString() + ' BCE' : String(y);
}

// Rounds `rough` up to the nearest "nice" number (1/2/5 × a power of ten) —
// used to pick a tidy year-step for the between-events tick marks so gaps
// like "every 25 years" or "every 10,000,000 years" fall on round numbers
// instead of whatever the pixel math happens to produce.
function niceTickStep(rough) {
    if (!isFinite(rough) || rough <= 0) return 1;
    const exponent = Math.floor(Math.log10(rough));
    const magnitude = Math.pow(10, exponent);
    const residual = rough / magnitude;
    let nice;
    if (residual > 5) nice = 10;
    else if (residual > 2) nice = 5;
    else if (residual > 1) nice = 2;
    else nice = 1;
    return nice * magnitude;
}

// Paints the full-viewport dome behind the timeline bar: same crown/arch
// shape as the arc's own dot canvas, but unclamped so it keeps deepening
// past the arc's edges instead of flattening out — it reaches the bottom of
// the screen well short of the true viewport edges, filling the corners.
// A stroked line traces that exact curve so the glass has a visible edge
// (border) that also runs the full width instead of stopping at the arc.
// Drawn as per-column strips (each with its own local gradient) rather than
// one canvas-wide gradient, so the fade starts at true zero alpha right at
// the curve instead of jumping in with a visible hard edge.
function renderTimelineFade() {
    const fadeCanvas = document.getElementById('timeline-fade');
    const timelineCanvas = document.getElementById('timeline');
    if (!fadeCanvas || !timelineCanvas) return;
    const rect = timelineCanvas.getBoundingClientRect();
    if (!rect.width || !rect.height) return;

    const dpr = window.devicePixelRatio || 1;
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    fadeCanvas.width = vw * dpr;
    fadeCanvas.height = vh * dpr;
    const ctx = fadeCanvas.getContext('2d');
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, vw, vh);

    // Mirrors renderTimeline()'s own curveY exactly (same crownY fraction,
    // same archDepth, same normalizer of half the canvas width) so the dome
    // backdrop traces precisely under the dot/line arc instead of a
    // differently-curved approximation of it.
    const crownYAbs = rect.top + rect.height * 0.32;
    const archDepth = rect.height - rect.height * 0.32;
    const centerXAbs = rect.left + rect.width / 2;
    const curveYAbs = x => {
        const xNorm = (x - centerXAbs) / (rect.width / 2);
        return crownYAbs + archDepth * xNorm * xNorm;
    };

    const isLight = document.body.classList.contains('theme-light');
    // Matches --top-search-bg's hue/alpha so the blurred dome reads as the
    // same frosted glass as the top search pill, not a flat dark scrim.
    const fadeRGB = isLight ? '255,255,255' : '50,57,82';
    const fadeAlpha = isLight ? 0.42 : 0.78;
    const step = 2;
    for (let x = 0; x <= vw; x += step) {
        const topY = curveYAbs(x) - 14;
        if (topY >= vh) continue;
        const grad = ctx.createLinearGradient(0, topY, 0, vh);
        grad.addColorStop(0, `rgba(${fadeRGB},0)`);
        grad.addColorStop(1, `rgba(${fadeRGB},${fadeAlpha})`);
        ctx.fillStyle = grad;
        ctx.fillRect(x, Math.max(topY, 0), step + 1, vh - Math.max(topY, 0));
    }

    // Trace the same curve as a thin rim line — the glass's visible edge,
    // running the full width instead of stopping where the arc's own dots do.
    const lineRGB = isLight ? '0,0,0' : '255,255,255';
    ctx.beginPath();
    for (let x = 0; x <= vw; x += step) {
        const y = Math.max(curveYAbs(x) - 14, 0);
        if (x === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
    }
    ctx.strokeStyle = `rgba(${lineRGB},${isLight ? 0.18 : 0.16})`;
    ctx.lineWidth = 1;
    ctx.stroke();

    // Clip the element itself to the same curve so backdrop-filter's blur is
    // confined to the dome rather than the full viewport rect — sampled at a
    // coarser interval than the fill loop above since it's just a boundary.
    const clipStep = 16;
    const points = [`0px ${vh}px`, `0px ${Math.max(curveYAbs(0) - 14, 0)}px`];
    for (let x = clipStep; x < vw; x += clipStep) {
        points.push(`${x}px ${Math.max(curveYAbs(x) - 14, 0)}px`);
    }
    points.push(`${vw}px ${Math.max(curveYAbs(vw) - 14, 0)}px`, `${vw}px ${vh}px`);
    const clipPath = `polygon(${points.join(', ')})`;
    fadeCanvas.style.clipPath = clipPath;
    fadeCanvas.style.webkitClipPath = clipPath;
}

function renderTimeline() {
    if (!timelineData) return;
    const { startYear, endYear, highlights, periods } = timelineData;
    if (timelineCenterYear === null) timelineCenterYear = highlights[0] ? highlights[0].year : startYear;

    const container = document.getElementById('timeline-container');
    container.style.display = 'flex';
    document.getElementById('timeline-fade').classList.add('visible');
    document.getElementById('questionBox').style.maxHeight = 'calc(100vh - 280px)';

    const canvas = document.getElementById('timeline');
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    const ctx = canvas.getContext('2d');
    ctx.scale(dpr, dpr);

    const W = rect.width;
    const H = rect.height;
    const pad = 44;
    const half = Math.max(W / 2 - pad, 10);

    // Constant px/year so relative distances stay accurate — zoomed in around
    // the current event (rather than the whole range) to spread out clumping
    // when events span a long period. The 8-year floor only kicks in for
    // very tight clusters; it's capped at fullSpan so short-range results
    // (e.g. events a few years apart) still stretch across the full arc
    // instead of being squeezed into a fixed-size window with empty space
    // on either side.
    const fullSpan = Math.max(endYear - startYear, 1);
    const windowSpan = Math.min(fullSpan, Math.max(fullSpan * 0.5, 8));
    const pxPerYear = half / (windowSpan / 2);
    timelinePxPerYear = pxPerYear;

    const crownY = H * 0.32;
    const xFor = year => W / 2 + (year - timelineCenterYear) * pxPerYear;
    // Dots, date labels, and the visible border line all trace the same
    // unclamped parabola across the *entire* canvas width, reaching the
    // canvas's own bottom edge at x=0/W — so everything hugs the container's
    // curve continuously as it scrolls instead of flattening out near the edges.
    const archDepth = H - crownY;
    const curveY = x => {
        const xNorm = (x - W / 2) / (W / 2);
        return crownY + archDepth * xNorm * xNorm;
    };
    const borderCurveY = curveY;
    // #timeline-container sits at `bottom: -20px`, so the canvas's own bottom
    // ~20px hang off the real viewport edge. The border line can still trace
    // the unclamped parabola all the way to it (it's just decorative), but
    // dots and date labels need to stay above that line or they get clipped.
    // The margin below the clamp line has to fit the biggest dot actually
    // drawn there: base radius scales up to 1.35x for the centered node, plus
    // its extra 5px emphasis ring and ~2px stroke.
    const CONTAINER_BOTTOM_OFFSET = 20; // must match #timeline-container's `bottom` in css/styles.css
    const maxDotFootprint = 13 * 1.35 + 5 + 2; // ~24.5px — largest r * center scale + ring + stroke
    const safeBottom = H - CONTAINER_BOTTOM_OFFSET - maxDotFootprint;
    const dotCurveY = x => Math.min(curveY(x), safeBottom);
    // Date labels sit just under the arc at their own x. Their vertical swing
    // is damped to half of the dot curve's so the row of dates reads as
    // roughly centered instead of tracking the full rise and fall of the arc.
    const dateLabelY = x => Math.min(crownY + (dotCurveY(x) - crownY) * 0.5 + 26, safeBottom + 6);

    ctx.clearRect(0, 0, W, H);

    const isLight = document.body.classList.contains('theme-light');
    const yearLblColor = isLight ? 'rgba(0,0,0,0.55)' : 'rgba(255,255,255,0.85)';

    // The backdrop fade is painted separately on #timeline-fade (a full-viewport
    // canvas behind this one) so it can widen into a dome reaching the screen
    // edges instead of being boxed in by this canvas's own bounds.
    renderTimelineFade();

    // Arc baseline, colored by era where periods are known
    ctx.lineWidth = 3;
    ctx.lineCap = 'round';
    if (periods && periods.length) {
        const totalStart = Math.min(...periods.map(p => p.start));
        const totalEnd = Math.max(...periods.map(p => p.end));
        const totalSpan = Math.max(totalEnd - totalStart, 1);
        periods.forEach(p => {
            const t = ((p.start + p.end) / 2 - totalStart) / totalSpan;
            const { fill } = timelineNodeColor(Math.max(0, Math.min(1, t)));
            const x1 = Math.max(0, Math.min(W, xFor(p.start)));
            const x2 = Math.max(0, Math.min(W, xFor(p.end)));
            if (x2 <= x1) return;
            ctx.strokeStyle = fill.replace('rgb(', 'rgba(').replace(')', ',0.45)');
            ctx.beginPath();
            for (let x = x1; x <= x2; x += 4) ctx.lineTo(x, borderCurveY(x));
            ctx.stroke();
            ctx.beginPath();
        });
    } else {
        ctx.strokeStyle = isLight ? 'rgba(0,0,0,0.12)' : 'rgba(255,255,255,0.16)';
        ctx.beginPath();
        for (let x = 0; x <= W; x += 4) ctx.lineTo(x, borderCurveY(x));
        ctx.stroke();
    }

    // Period label for whichever era currently sits at the crown
    const labelEl = document.getElementById('timeline-period-label');
    if (labelEl) {
        const activePeriod = periods && periods.find(p => timelineCenterYear >= p.start && timelineCenterYear <= p.end);
        const name = activePeriod ? activePeriod.name : null;
        if (name !== timelineLastPeriodName) {
            labelEl.textContent = name || '';
            labelEl.classList.toggle('visible', !!name);
            timelineLastPeriodName = name;
        }
    }

    timelineDots = [];

    // Only lay out events within (a little beyond) the visible width
    const visibleCenterIdx = timelineCenterIndex();
    const currentYearEl = document.getElementById('timeline-current-year');
    if (currentYearEl) {
        const centerEv = visibleCenterIdx !== null ? highlights.find(h => h.index === visibleCenterIdx) : null;
        currentYearEl.textContent = centerEv ? fmtYear(centerEv.year) : '';
        currentYearEl.classList.toggle('visible', !!centerEv);
    }

    const visible = highlights.filter(ev => {
        const x = xFor(ev.year);
        return x >= -60 && x <= W + 60;
    });
    const centerIdx = timelineCenterIndex();
    const r = visible.length > 14 ? 10 : visible.length > 10 ? 11 : 13;
    const rowH = r * 2 + 7;

    // Screen-space spans of every date label already drawn (events first,
    // then ruler ticks fill the gaps around them) so the two never overlap.
    const placedLabelSpans = [];

    function staggerAndDraw(dots) {
        const placed = [];
        // Rows only stack upward (increasing row = higher up the arc, since
        // ev._dotY subtracts row * rowH below). Downward rows used to dip
        // clustered dots into the container's clipped bottom overflow area.
        function getFreeRow(x) {
            const near = placed.filter(p => Math.abs(p.x - x) < r * 2 + 2).map(p => p.row);
            for (let s = 0; s <= 8; s++) {
                if (!near.includes(s)) return s;
            }
            return 0;
        }
        dots.forEach(ev => { ev._x = xFor(ev.year); });

        // Spread same-year dots horizontally instead of stacking vertically
        const xGroups = {};
        dots.forEach(ev => {
            const key = String(Math.round(ev._x));
            if (!xGroups[key]) xGroups[key] = [];
            xGroups[key].push(ev);
        });
        Object.values(xGroups).forEach(group => {
            if (group.length > 1) {
                const spread = r * 2 + 4;
                const total = (group.length - 1) * spread;
                const centerX = group[0]._x;
                group.forEach((ev, i) => {
                    ev._x = ev._x - total / 2 + i * spread;
                    ev._showYearLabel = i === Math.floor((group.length - 1) / 2);
                    ev._labelX = centerX;
                });
            } else {
                group[0]._showYearLabel = true;
                group[0]._labelX = group[0]._x;
            }
        });

        dots.forEach(ev => {
            ev._row = getFreeRow(ev._x);
            ev._curveY = dotCurveY(ev._x);
            placed.push({ x: ev._x, row: ev._row });
        });

        // The parabola is tightest (smallest curveY) at the crown, so that's
        // where headroom is scarcest — shrink the row spacing so the highest
        // row actually used still lands below safeTop, instead of letting
        // rows stack upward off the top of the canvas and get clipped.
        const safeTop = 16;
        const maxRow = placed.reduce((m, p) => Math.max(m, p.row), 0);
        const effectiveRowH = maxRow > 0 ? Math.min(rowH, (crownY - safeTop) / maxRow) : rowH;
        dots.forEach(ev => {
            ev._dotY = ev._curveY - ev._row * effectiveRowH;
        });

        // Fade + shrink events as they approach the edges (perspective)
        dots.forEach(ev => {
            const edgeT = Math.max(0, Math.min(1, Math.abs(ev._x - W / 2) / half));
            ev._alpha = ev.index === centerIdx ? 1 : 1 - edgeT * 0.65;
            ev._scale = ev.index === centerIdx ? 1.35 : 1 - edgeT * 0.3;
        });

        // stems — faint dashes dropping from each dot down to its date label
        dots.forEach(ev => {
            const t = fullSpan > 0 ? (ev.year - startYear) / fullSpan : 0;
            const { fill } = timelineNodeColor(Math.max(0, Math.min(1, t)));
            ctx.globalAlpha = ev._alpha;
            ctx.strokeStyle = fill.replace('rgb(', 'rgba(').replace(')', ',0.25)');
            ctx.lineWidth = 1;
            ctx.setLineDash([2, 3]);
            ctx.beginPath();
            ctx.moveTo(ev._x, ev._dotY + r * ev._scale);
            ctx.lineTo(ev._x, dateLabelY(ev._x) - 10);
            ctx.stroke();
            ctx.setLineDash([]);
            ctx.globalAlpha = 1;
        });

        // dots — colored fill, white number. Drawn with the centered/focused
        // node last so its emphasis ring always lands on top instead of being
        // painted over by a neighboring dot that happens to overlap it (easy
        // to hit when several events land close together on the arc).
        const drawOrder = centerIdx === null
            ? dots
            : [...dots.filter(ev => ev.index !== centerIdx), ...dots.filter(ev => ev.index === centerIdx)];
        drawOrder.forEach(ev => {
            const x = ev._x, dotY = ev._dotY;
            const rr = r * ev._scale;
            const t = fullSpan > 0 ? (ev.year - startYear) / fullSpan : 0;
            const { fill, stroke } = timelineNodeColor(Math.max(0, Math.min(1, t)));
            ctx.globalAlpha = ev._alpha;
            ctx.beginPath();
            ctx.arc(x, dotY, rr, 0, Math.PI * 2);
            ctx.fillStyle = fill;
            ctx.fill();
            ctx.strokeStyle = stroke;
            ctx.lineWidth = 1.5;
            ctx.stroke();

            if (ev.index === centerIdx) {
                ctx.beginPath();
                ctx.arc(x, dotY, rr + 5, 0, Math.PI * 2);
                ctx.strokeStyle = isLight ? 'rgba(0,0,0,0.55)' : 'rgba(255,255,255,0.8)';
                ctx.lineWidth = 2;
                ctx.stroke();
            }

            // index number
            ctx.fillStyle = '#fff';
            ctx.font = `bold ${ev.index > 9 ? rr - 2 : rr}px -apple-system, sans-serif`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(String(ev.index), x, dotY);
            ctx.textBaseline = 'alphabetic';
            ctx.globalAlpha = 1;

            timelineDots.push({ x, y: dotY, r: rr, lat: ev.lat, lng: ev.lng, label: ev.label, year: ev.year, index: ev.index, fullLocation: ev.fullLocation });
        });

        // date labels — one shared row under the arc, below the nav button row.
        // Thin them out by measured text width (working outward from the current
        // node) so close-together years never overlap on the single shared line.
        const labelPad = 14;
        const candidates = dots
            .filter(ev => ev._showYearLabel)
            .map(ev => {
                const lx = ev._labelX !== undefined ? ev._labelX : ev._x;
                ctx.font = ev.index === centerIdx ? 'bold 17px -apple-system, sans-serif' : 'bold 14px -apple-system, sans-serif';
                const width = ctx.measureText(fmtYear(ev.year)).width;
                return { ev, lx, width };
            })
            .sort((a, b) => a.lx - b.lx);
        const centerPos = candidates.findIndex(c => c.ev.index === centerIdx);
        const toDraw = new Set();
        if (centerPos !== -1) {
            toDraw.add(candidates[centerPos].ev);
            let lastX = candidates[centerPos].lx;
            let lastWidth = candidates[centerPos].width;
            for (let i = centerPos + 1; i < candidates.length; i++) {
                if (candidates[i].lx - lastX >= lastWidth / 2 + candidates[i].width / 2 + labelPad) {
                    toDraw.add(candidates[i].ev); lastX = candidates[i].lx; lastWidth = candidates[i].width;
                }
            }
            lastX = candidates[centerPos].lx;
            lastWidth = candidates[centerPos].width;
            for (let i = centerPos - 1; i >= 0; i--) {
                if (lastX - candidates[i].lx >= lastWidth / 2 + candidates[i].width / 2 + labelPad) {
                    toDraw.add(candidates[i].ev); lastX = candidates[i].lx; lastWidth = candidates[i].width;
                }
            }
        } else {
            let lastX = -Infinity;
            let lastWidth = 0;
            candidates.forEach(c => {
                if (c.lx - lastX >= lastWidth / 2 + c.width / 2 + labelPad) {
                    toDraw.add(c.ev); lastX = c.lx; lastWidth = c.width;
                }
            });
        }

        dots.forEach(ev => {
            if (!toDraw.has(ev)) return;
            const labelX = ev._labelX !== undefined ? ev._labelX : ev._x;
            const cand = candidates.find(c => c.ev === ev);
            // The current (centered) event's year now lives in the emphasized
            // #timeline-current-year badge between the prev/next buttons
            // instead — skip it here so it isn't drawn twice, but still keep
            // its measured span reserved so neighboring labels don't crowd in.
            if (ev.index !== centerIdx) {
                ctx.globalAlpha = ev._alpha;
                ctx.fillStyle = yearLblColor;
                ctx.font = 'bold 14px -apple-system, sans-serif';
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillText(fmtYear(ev.year), labelX, dateLabelY(labelX));
                ctx.textBaseline = 'alphabetic';
                ctx.globalAlpha = 1;
            }
            placedLabelSpans.push({ x: labelX, width: cand ? cand.width : 60 });
        });
    }

    staggerAndDraw(visible);

    // Ruler ticks — fill the space between (and beyond) event labels with
    // faint year markers at round intervals, so a long empty stretch of the
    // arc still visibly counts off dates as it scrolls past, instead of
    // going dark between one event and the next.
    (function drawTimelineTicks() {
        const targetTickPx = 130; // desired on-screen spacing between ticks
        const tickStep = niceTickStep(targetTickPx / pxPerYear);
        const margin = 50;
        // Clamped to the data's own [startYear, endYear] range — otherwise,
        // once the arc is scrolled/centered near either edge, ticks (and
        // their year labels) keep marching on past "present day" into years
        // nothing actually happened, which reads as the timeline not
        // actually ending where the data does.
        const minYearVis = Math.max(startYear, timelineCenterYear - (W / 2 + margin) / pxPerYear);
        const maxYearVis = Math.min(endYear, timelineCenterYear + (W / 2 + margin) / pxPerYear);
        const tickPad = 12;
        const tickColor = isLight ? 'rgba(0,0,0,0.28)' : 'rgba(255,255,255,0.4)';
        const tickLineColor = isLight ? 'rgba(0,0,0,0.18)' : 'rgba(255,255,255,0.25)';

        ctx.font = '11px -apple-system, sans-serif';
        const first = Math.ceil(minYearVis / tickStep) * tickStep;
        for (let year = first; year <= maxYearVis; year += tickStep) {
            const x = xFor(year);
            if (x < -margin || x > W + margin) continue;
            const label = fmtYear(Math.round(year));
            const width = ctx.measureText(label).width;
            const overlaps = placedLabelSpans.some(s => Math.abs(s.x - x) < s.width / 2 + width / 2 + tickPad);
            if (overlaps) continue;

            const ty = dotCurveY(x);
            ctx.strokeStyle = tickLineColor;
            ctx.lineWidth = 1.5;
            ctx.beginPath();
            ctx.moveTo(x, ty - 5);
            ctx.lineTo(x, ty + 5);
            ctx.stroke();

            ctx.fillStyle = tickColor;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(label, x, dateLabelY(x));
            ctx.textBaseline = 'alphabetic';

            placedLabelSpans.push({ x, width });
        }
    })();
}

// Finds the dot under a canvas-local point (mx, my), if any.
function timelineDotAt(mx, my) {
    for (const dot of timelineDots) {
        const dist = Math.sqrt((mx - dot.x) ** 2 + (my - dot.y) ** 2);
        if (dist < dot.r + 4) return dot;
    }
    return null;
}

// Drag-to-pan + flick momentum + wheel scroll, all driving timelineCenterYear
// directly (independent of the highlight-snap animation in timelineRecenter).
// Set up once — the canvas element is static in the DOM, only its contents
// are redrawn on every renderTimeline() call.
let timelineInteractionReady = false;
function setupTimelineInteraction() {
    if (timelineInteractionReady) return;
    const canvas = document.getElementById('timeline');
    if (!canvas) return;
    timelineInteractionReady = true;
    canvas.style.touchAction = 'none';

    const CLICK_SLOP = 6; // px of movement below which a pointerup counts as a click
    let dragging = false;
    let moved = false;
    let downX = 0, lastX = 0, lastT = 0;
    let velocity = 0; // years per ms

    function stopInertia() {
        if (timelineInertiaRAF) { cancelAnimationFrame(timelineInertiaRAF); timelineInertiaRAF = null; }
    }

    function clampCenterYear(y) {
        if (!timelineData) return y;
        const { startYear, endYear } = timelineData;
        return Math.max(startYear, Math.min(endYear, y));
    }

    function runInertia() {
        const DECAY = 0.0035; // per ms, exponential
        let last = performance.now();
        function step(now) {
            const dt = now - last;
            last = now;
            const next = clampCenterYear(timelineCenterYear + velocity * dt);
            // Hit the start/end — stop dead instead of sticking while still "pushing".
            if (next !== timelineCenterYear + velocity * dt) velocity = 0;
            timelineCenterYear = next;
            velocity *= Math.exp(-DECAY * dt);
            renderTimeline();
            if (Math.abs(velocity) > 0.0005) {
                timelineInertiaRAF = requestAnimationFrame(step);
            } else {
                timelineInertiaRAF = null;
            }
        }
        stopInertia();
        timelineInertiaRAF = requestAnimationFrame(step);
    }

    canvas.addEventListener('pointerdown', (e) => {
        if (!timelineData) return;
        if (timelineRAF) { clearTimeout(timelineRAF); timelineRAF = null; }
        stopInertia();
        dragging = true;
        moved = false;
        timelineUserScrolling = true;
        downX = e.clientX;
        lastX = e.clientX;
        lastT = performance.now();
        velocity = 0;
        canvas.setPointerCapture(e.pointerId);
        canvas.style.cursor = 'grabbing';
    });

    canvas.addEventListener('pointermove', (e) => {
        if (!dragging || !timelineData) return;
        const now = performance.now();
        const dx = e.clientX - lastX;
        const dt = Math.max(1, now - lastT);
        // Total displacement from the pointerdown origin, not the per-event
        // delta — otherwise ordinary mouse jitter across a couple of move
        // events (each under the slop threshold individually) accumulates
        // into a real click getting misread as a drag.
        if (Math.abs(e.clientX - downX) > CLICK_SLOP) moved = true;
        const dYears = -dx / timelinePxPerYear;
        timelineCenterYear = clampCenterYear(timelineCenterYear + dYears);
        // Smoothed instantaneous velocity for the release fling
        velocity = velocity * 0.7 + (dYears / dt) * 0.3;
        lastX = e.clientX;
        lastT = now;
        renderTimeline();
    });

    function endDrag(e) {
        if (!dragging) return;
        dragging = false;
        canvas.style.cursor = 'grab';
        try { canvas.releasePointerCapture(e.pointerId); } catch (err) {}

        if (!moved) {
            // Treat as a click/tap: focus the dot under the pointer, if any.
            const cr = canvas.getBoundingClientRect();
            const dot = timelineDotAt(e.clientX - cr.left, e.clientY - cr.top);
            timelineUserScrolling = false;
            if (dot) {
                focusLocation(dot.fullLocation || { name: dot.label, lat: dot.lat, lng: dot.lng, year: dot.year }, dot.index);
            }
            return;
        }

        // Fling: keep coasting on the last measured velocity.
        if (Math.abs(velocity) > 0.00005) {
            runInertia();
        } else {
            timelineUserScrolling = false;
        }
    }

    canvas.addEventListener('pointerup', endDrag);
    canvas.addEventListener('pointercancel', endDrag);
    canvas.style.cursor = 'grab';

    // The canvas's CSS size tracks the container fluidly (width: 100%), but
    // its backing pixel buffer only gets resized inside renderTimeline() —
    // without this, resizing the window stretches the last-drawn arc/dots
    // to fit the new CSS box instead of redrawing them at the new size,
    // while the CSS-positioned nav buttons (calc(50% ± Npx)) track the
    // resize instantly. That mismatch is what reads as "one part moves but
    // not the other". rAF-throttled so a drag-resize doesn't redraw every
    // intermediate pixel.
    let timelineResizeRAF = null;
    window.addEventListener('resize', () => {
        if (!timelineData) return;
        if (timelineResizeRAF) cancelAnimationFrame(timelineResizeRAF);
        timelineResizeRAF = requestAnimationFrame(() => {
            timelineResizeRAF = null;
            renderTimeline();
        });
    });

    canvas.addEventListener('wheel', (e) => {
        if (!timelineData) return;
        e.preventDefault();
        if (timelineRAF) { clearTimeout(timelineRAF); timelineRAF = null; }
        stopInertia();
        timelineUserScrolling = true;
        const delta = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY;
        timelineCenterYear = clampCenterYear(timelineCenterYear + delta / timelinePxPerYear);
        renderTimeline();
        // A little extra glide so a quick wheel flick still feels alive.
        velocity = velocity * 0.5 + (delta / timelinePxPerYear) * 0.02;
        clearTimeout(canvas._wheelEndTimer);
        canvas._wheelEndTimer = setTimeout(() => {
            if (Math.abs(velocity) > 0.00005) runInertia();
            else timelineUserScrolling = false;
        }, 80);
    }, { passive: false });
}

let _savedResultState = null;

function hideTimeline() {
    const tc = document.getElementById('timeline-container');
    const tf = document.getElementById('timeline-fade');
    if (tc.style.display === 'none') return;
    tc.classList.add('timeline-exit');
    tf.classList.add('timeline-exit');
    setTimeout(() => {
        tc.style.display = 'none';
        tc.classList.remove('timeline-exit');
        tf.classList.remove('visible', 'timeline-exit');
    }, 370);
}

function showTimeline() {
    const tc = document.getElementById('timeline-container');
    const tf = document.getElementById('timeline-fade');
    tc.classList.add('timeline-exit');
    tf.classList.add('visible', 'timeline-exit');
    tc.style.display = 'flex';
    requestAnimationFrame(() => requestAnimationFrame(() => {
        tc.classList.remove('timeline-exit');
        tf.classList.remove('timeline-exit');
    }));
}

// Casual token-usage line at the bottom of the landing search box (links to
// /usage). Silently hides itself if the endpoint isn't reachable — e.g. a
// logged-out visitor in metered mode — so it never gets in the way.
async function refreshUsageCounter() {
    const el = document.getElementById('usageCounter');
    if (!el) return;
    try {
        const res = await fetch('/usage-summary');
        if (!res.ok) { el.hidden = true; return; }
        const d = await res.json();
        const fmt = n => Number(n || 0).toLocaleString('en-US');
        let text = '';
        if (d.mode === 'metered' && !d.authed && d.anon) {
            const left = Math.max(0, d.anon.limit - d.anon.used);
            text = `Free pool today · ${fmt(d.anon.used)} / ${fmt(d.anon.limit)} tokens · ${fmt(left)} left`;
        } else if (d.today) {
            const r = d.today.requests;
            text = `Today · ${fmt(d.today.tokens)} tokens over ${fmt(r)} ${r === 1 ? 'call' : 'calls'}`;
        }
        if (text) { el.textContent = text; el.hidden = false; }
        else el.hidden = true;
    } catch {
        el.hidden = true;
    }
}

function openSearch() {
    const qb = document.getElementById('questionBox');
    // A search is currently in flight: its eventual result will land in the
    // DOM regardless of what's on screen, so capturing/hiding state now would
    // save a half-loaded snapshot and leave the finished answer rendered
    // underneath the wrong (centered) layout. Ignore the click until it settles.
    if (qb.classList.contains('searching')) return;

    document.body.classList.remove('containers-hidden');
    document.getElementById('topSearchClearBtn').classList.remove('active');
    const inResultMode = qb.classList.contains('result-mode');

    if (inResultMode) {
        _savedResultState = {
            answerHTML: document.getElementById('answer').innerHTML,
            displayedQuestion: document.getElementById('displayedQuestion').innerText,
            inputValue: document.getElementById('questionInput').value,
            locationsHTML: document.querySelector('.collapsible-content').innerHTML,
            voiceControlsDisplay: document.getElementById('voiceControls').style.display,
            timelineWasVisible: document.getElementById('timeline-container').style.display !== 'none',
            topicImageUrl: topicImageUrl,
            topicExtraImages: topicExtraImages,
            topicImageDesc: topicImageDesc,
            topSearchQuery: document.getElementById('topSearchQuery').textContent,
        };
        document.getElementById('cancelSearchBtn').style.display = 'flex';
    }
    // Arrived here via exploreSearchInstead(): there's no prior result to
    // restore, but there is a paused explore map — show the same back arrow
    // so it isn't a dead end (see cancelSearch/resumeExploreMode).
    if (exploreWasActiveBeforeSearch) {
        document.getElementById('cancelSearchBtn').style.display = 'flex';
    }

    hideTimeline();
    qb.classList.remove('result-mode');
    qb.classList.add('centered');
    document.getElementById('topSearchWrapper').classList.remove('visible');
    hideCurrentImage();
    setTimeout(() => document.getElementById('questionInput').focus(), 300);
    updateExploreNav();
    refreshUsageCounter();
}

function cancelSearch() {
    if (_savedResultState) {
        const qb = document.getElementById('questionBox');
        qb.classList.remove('centered');
        qb.classList.add('result-mode');
        document.getElementById('topSearchWrapper').classList.add('visible');
        document.getElementById('answer').innerHTML = _savedResultState.answerHTML;
        document.getElementById('displayedQuestion').innerText = _savedResultState.displayedQuestion;
        document.getElementById('questionInput').value = _savedResultState.inputValue;
        document.querySelector('.collapsible-content').innerHTML = _savedResultState.locationsHTML;
        document.getElementById('voiceControls').style.display = _savedResultState.voiceControlsDisplay;
        document.getElementById('topSearchQuery').textContent = _savedResultState.topSearchQuery || '';
        if (_savedResultState.savedLocations) activeLocations = _savedResultState.savedLocations;
        if ('focusedIndex' in _savedResultState) currentFocusedIndex = _savedResultState.focusedIndex;
        updateTimelineNav();
        renderHeaderState();
        topicImageUrl = _savedResultState.topicImageUrl || null;
        topicExtraImages = _savedResultState.topicExtraImages || [];
        topicImageDesc = _savedResultState.topicImageDesc || null;
        if (topicImageUrl) {
            setCurrentImage(topicImageUrl, topicExtraImages, topicImageDesc);
        } else {
            hideCurrentImage();
        }
        if (_savedResultState.timelineWasVisible) showTimeline();
        _savedResultState = null;
    } else if (exploreWasActiveBeforeSearch) {
        // Fade + scale the container out over the Explore map before actually
        // switching back (resumeExploreMode hard-hides it via body.explore-mode).
        const qb = document.getElementById('questionBox');
        document.getElementById('cancelSearchBtn').style.display = 'none';
        if (qb) {
            qb.classList.add('qb-fade');
            setTimeout(() => { qb.classList.remove('qb-fade'); resumeExploreMode(); updateExploreNav(); }, 240);
        } else {
            resumeExploreMode();
            updateExploreNav();
        }
        return;
    } else {
        return;
    }
    document.getElementById('cancelSearchBtn').style.display = 'none';
    updateExploreNav();
}

function toggleClearDisplay() {
    const hidden = document.body.classList.toggle('containers-hidden');
    document.getElementById('topSearchClearBtn').classList.toggle('active', hidden);
    updateExploreNav();
}

async function askQuestion() {
    _savedResultState = null;
    document.getElementById('questionBox')?.classList.remove('qb-fade');
    // A real search means there's no going back to the paused explore map —
    // drop its now-orphaned (hidden) pins rather than leaving them in memory
    // forever unshown.
    if (exploreWasActiveBeforeSearch) {
        exploreWasActiveBeforeSearch = false;
        clearExploreMarkers();
    }
    document.getElementById('cancelSearchBtn').style.display = 'none';
    updateExploreNav();
    document.body.classList.remove('containers-hidden');
    document.getElementById('topSearchClearBtn').classList.remove('active');
    // On mobile, a fresh search should land with the map visible rather
    // than reopening whatever expand state a previous topic was left in
    // (see the MOBILE STACKED SHEET block and #mobileSheetToggle).
    document.body.classList.remove('mobile-sheet-expanded');
    retryCount = 0;
    const qb = document.getElementById('questionBox');

    // Save current state BEFORE clearing/overwriting anything
    statesStack.push({
        center: map.getCenter(),
        zoom: map.getZoom(),
        displayedQuestion: document.getElementById("displayedQuestion").innerText,
        inputValue: document.getElementById("questionInput").value,
        answerHTML: document.getElementById("answer").innerHTML,
        locationsHTML: document.querySelector(".collapsible-content").innerHTML,
        savedLocations: [...activeLocations],
        topicImageUrl: topicImageUrl,
        topicExtraImages: topicExtraImages,
        topicImageDesc: topicImageDesc,
        topSearchQuery: document.getElementById('topSearchQuery').textContent,
    });

    qb.classList.remove('centered');
    qb.classList.add('result-mode');
    const pill = document.getElementById('topSearchWrapper');
    pill.classList.add('visible');
    document.getElementById('topSearchQuery').textContent = document.getElementById('questionInput').value;
    currentFocusedIndex = null;
    if (timelineRAF) { clearTimeout(timelineRAF); timelineRAF = null; }
    timelineCenterYear = null;
    let question = document.getElementById("questionInput").value;
    currentQuestion = question;
    document.getElementById("displayedQuestion").innerText = question;
    const answerBox = document.getElementById("answer");
    const loader = document.getElementById("topLoadingIndicator");
    const loadingLabel = loader.querySelector('.loading-label');

    answerBox.innerHTML = "";
    answerBox.style.display = "none";
    overviewHTML = null;
    hideCurrentImage();
    topicImageUrl = null;
    topicExtraImages = [];
    topicImageDesc = null;
    qb.classList.add('searching');
    loader.classList.add('showing');
    document.getElementById('timeline-container').style.display = 'none';
    document.getElementById('timeline-fade').classList.remove('visible', 'timeline-exit');
    const periodLabelEl = document.getElementById('timeline-period-label');
    if (periodLabelEl) { periodLabelEl.textContent = ''; periodLabelEl.classList.remove('visible'); }
    const currentYearEl = document.getElementById('timeline-current-year');
    if (currentYearEl) { currentYearEl.textContent = ''; currentYearEl.classList.remove('visible'); }
    document.getElementById('questionBox').style.maxHeight = 'calc(100vh - 116px)';
    document.getElementById('voiceControls').style.display = 'none';
    speechSynthesis.cancel();
    isAutoplaying = false;
    const resetAutoplayBtn = document.getElementById('autoplayBtn');
    if (resetAutoplayBtn) { resetAutoplayBtn.textContent = '▶'; resetAutoplayBtn.classList.remove('autoplay-active'); }
    clearMap();
    renderHeaderState();
    resetMapView();

    loadingLabel.textContent = "Searching… Est. 20–40 seconds";

    let streamBuffer = '';
    const ghost = document.getElementById('stream-ghost');
    ghost.innerHTML = '';
    ghost.classList.remove('active');

    function onChunk(chunk) {
        streamBuffer += chunk;
        let visibleEnd = streamBuffer.indexOf('\ndata:');
        if (visibleEnd === -1) visibleEnd = streamBuffer.length;
        const visibleText = streamBuffer.slice(0, visibleEnd);
        if (visibleText.length > 5) {
            ghost.innerHTML = marked.parse(visibleText);
            ghost.classList.add('active');
        }
    }

    try {
        const response = await fetchQuestion(question, onChunk);
        clearStreamGhost();
        loader.classList.remove('showing');
        qb.classList.remove('searching');
        answerBox.style.display = '';
        const { wikipediaHint } = parseLocations(response.answer);
        document.getElementById("displayedQuestion").innerText = wikipediaHint || question;
        const { imageUrl, articleUrl, extract } = await fetchWikipediaImage(wikipediaHint || question);
        processResponse(response, imageUrl, articleUrl, extract);
        refreshUsageCounter();
    } catch (error) {
        clearStreamGhost();
        loader.classList.remove('showing');
        qb.classList.remove('searching');
        answerBox.style.display = '';
        answerBox.innerHTML = /daily limit|limit has been reached/i.test(error.message)
            ? error.message
            : "An error occurred: " + error.toString();
        refreshUsageCounter();
    }

    if (statesStack.length > 0) {
        document.getElementById("backButton").style.display = "flex";
    }
    updateExploreNav();
}




let isAutoplaying = false;
let autoplayStep = 0;
let isVoiceMuted = false;

function toggleVoiceMute() {
    isVoiceMuted = !isVoiceMuted;
    const btn = document.getElementById('voiceMuteBtn');
    if (btn) {
        btn.textContent = isVoiceMuted ? '🔇' : '🔊';
        btn.classList.toggle('voice-muted', isVoiceMuted);
        btn.title = isVoiceMuted ? 'Unmute narration voice' : 'Mute narration voice';
    }
    if (isVoiceMuted) speechSynthesis.cancel();
}

let _cachedVoice = null;

function pickBestVoice() {
    if (_cachedVoice) return _cachedVoice;
    const voices = speechSynthesis.getVoices();
    if (!voices.length) return null;
    const preferred = [
        v => /\bdaniel\b/i.test(v.name) && v.lang.startsWith('en'),
        v => /google uk english male/i.test(v.name),
        v => /google us english/i.test(v.name),
        v => v.lang.startsWith('en') && !v.name.toLowerCase().includes('compact'),
        v => v.lang.startsWith('en'),
    ];
    for (const match of preferred) {
        const found = voices.find(match);
        if (found) { _cachedVoice = found; return found; }
    }
    _cachedVoice = voices[0];
    return _cachedVoice;
}

function cleanTextForSpeech(rawText) {
    return rawText
        .replace(/Explore further[\s\S]*/i, '')
        .replace(/#{1,6}\s*/g, '')
        .replace(/\*\*/g, '')
        .replace(/\*/g, '')
        .replace(/`/g, '')
        .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
        .replace(/^\s*[-•]\s*/gm, '')
        .replace(/\n{2,}/g, '. ')
        .replace(/\n/g, ' ')
        .trim();
}

function toggleAutoplay() {
    if (isAutoplaying) { stopAutoplay(); return; }
    startAutoplay();
}

function startAutoplay() {
    if (activeLocations.length === 0) return;
    isAutoplaying = true;
    autoplayStep = 0;
    const btn = document.getElementById('autoplayBtn');
    if (btn) { btn.textContent = '⏹'; btn.classList.add('autoplay-active'); }

    speechSynthesis.cancel();

    // Read the main summary first
    const title = document.getElementById('displayedQuestion')?.innerText?.trim() || '';
    const paragraphs = [...document.getElementById('answer').querySelectorAll('p')]
        .map(p => p.innerText.trim()).filter(Boolean).join(' ');
    const text = [title, paragraphs].filter(Boolean).join('. ');

    if (!text) { stopAutoplay(); return; }

    if (isVoiceMuted) { autoplayStep = 1; autoplayGoToStep(); return; }

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1.1;
    utterance.pitch = 0.95;
    const doSpeak = () => {
        const voice = pickBestVoice();
        if (voice) utterance.voice = voice;
        utterance.onend = () => {
            if (!isAutoplaying) return;
            autoplayStep = 1;
            autoplayGoToStep();
        };
        utterance.onerror = () => stopAutoplay();
        speechSynthesis.speak(utterance);
    };
    if (speechSynthesis.getVoices().length) doSpeak();
    else speechSynthesis.onvoiceschanged = () => { speechSynthesis.onvoiceschanged = null; doSpeak(); };
}

function autoplayGoToStep() {
    if (!isAutoplaying) return;
    if (autoplayStep > activeLocations.length) { stopAutoplay(); return; }
    focusLocation(activeLocations[autoplayStep - 1], autoplayStep);
}

function stopAutoplay() {
    isAutoplaying = false;
    speechSynthesis.cancel();
    const btn = document.getElementById('autoplayBtn');
    if (btn) { btn.textContent = '▶'; btn.classList.remove('autoplay-active'); }
}

function searchRelated(query) {
    document.getElementById("questionInput").value = query;
    askQuestion();
}

function setCurrentImage(imageUrl, extraImages = [], description = '') {
    const panel = document.getElementById('currentImagePanel');
    const img = document.getElementById('currentImageEl');
    const placeholder = document.getElementById('currentImagePlaceholder');
    const descEl = document.getElementById('currentImageDesc');
    if (!imageUrl) {
        // No image found (or none yet) — hide the whole panel rather than
        // showing an empty frame with just the placeholder emoji.
        img.src = '';
        img.style.display = 'none';
        placeholder.style.display = 'none';
        if (descEl) descEl.textContent = '';
        setExtraImages([]);
        hideCurrentImage();
        return;
    }
    img.src = imageUrl;
    img.style.display = '';
    img.dataset.caption = description || '';
    placeholder.style.display = 'none';
    if (descEl) descEl.textContent = description || '';
    setExtraImages(extraImages);
    panel.classList.add('visible');
}

function setExtraImages(extraImages = []) {
    const container = document.getElementById('currentImageExtra');
    container.innerHTML = '';
    extraImages.forEach(it => {
        const el = document.createElement('img');
        el.src = extraImageUrl(it);
        el.alt = '';
        el.dataset.caption = extraImageCaption(it);
        el.addEventListener('click', () => selectMainImage(el));
        container.appendChild(el);
    });
    // Thumbnails often finish loading after the street view slot below has
    // already been positioned — nudge it back into place now that the image
    // panel's height may have changed.
    const svSlot = document.getElementById('loc-streetview-slot');
    if (svSlot && svSlot.style.display !== 'none') positionStreetViewSlot();
}

// Clicking a thumbnail swaps it with the main image, so the image that was
// just displaced takes the clicked thumbnail's place instead of disappearing
// — every image stays visible somewhere, just cycled between the two spots.
function selectMainImage(thumb) {
    const img = document.getElementById('currentImageEl');
    const placeholder = document.getElementById('currentImagePlaceholder');
    const descEl = document.getElementById('currentImageDesc');
    const url = thumb && thumb.src;
    if (!url || url === img.src) return;

    // Swap src + caption between the clicked thumbnail and the main image so
    // the displaced image (and its description) stays visible in the grid.
    const prevMainSrc = img.src;
    const prevMainCaption = img.dataset.caption || '';
    const newCaption = thumb.dataset.caption || '';
    if (prevMainSrc) { thumb.src = prevMainSrc; thumb.dataset.caption = prevMainCaption; }

    img.src = url;
    img.dataset.caption = newCaption;
    img.style.display = '';
    placeholder.style.display = 'none';
    if (descEl) descEl.textContent = newCaption;
}

function hideCurrentImage() {
    document.getElementById('currentImagePanel').classList.remove('visible');
}

// Wikipedia thumbnail URLs encode the same underlying file at different
// resolutions (".../thumb/5/50/Name.jpg/330px-Name.jpg" vs "/1280px-Name.jpg"),
// so comparing full URLs misses same-image duplicates. Strip the "<width>px-"
// prefix and query string to compare the real filename instead.
function wikiFilename(url) {
    if (!url) return null;
    const base = url.split('?')[0].split('/').pop() || '';
    return decodeURIComponent(base.replace(/^\d+px-/, '')).toLowerCase();
}

// Turn a Wikipedia file name ("Rouen_Cathedral_facade_1890.jpg") into a
// readable fallback caption ("Rouen Cathedral facade 1890") for thumbnails
// the media-list API gives us no real caption for.
function prettyImageName(url) {
    let base = (url || '').split('?')[0].split('/').pop() || '';
    try { base = decodeURIComponent(base); } catch (e) {}
    return base
        .replace(/^\d+px-/, '')
        .replace(/\.(jpe?g|png|gif|webp|tiff?)$/i, '')
        .replace(/[_-]+/g, ' ')
        .trim();
}

// Each entry is { url, caption } — caption is the media-list caption when
// Wikipedia provides one, otherwise a prettified file name, so selecting a
// thumbnail can show a description that actually matches that image.
async function fetchExtraImages(articleUrl, excludeUrl, limit = 3) {
    if (!articleUrl) return [];
    try {
        const title = decodeURIComponent(articleUrl.split('/wiki/')[1] || '');
        if (!title) return [];
        const res = await fetch(`https://en.wikipedia.org/api/rest_v1/page/media-list/${encodeURIComponent(title)}`);
        if (!res.ok) return [];
        const data = await res.json();
        const items = (data.items || []).filter(it => it.type === 'image' && it.srcset?.length);
        const excludeName = wikiFilename(excludeUrl);
        const seen = new Set();
        const out = [];
        for (const it of items) {
            const src = it.srcset[it.srcset.length - 1]?.src || it.srcset[0]?.src;
            if (!src) continue;
            const full = src.startsWith('//') ? 'https:' + src : src;
            if (/\.svg($|\?)/i.test(full)) continue;
            const name = wikiFilename(full);
            if (name === excludeName || seen.has(name)) continue;
            seen.add(name);
            const caption = (it.caption?.text || '').trim() || prettyImageName(full);
            out.push({ url: full, caption });
            if (out.length >= limit) break;
        }
        return out;
    } catch (e) {
        return [];
    }
}

// Extra-image lists are sometimes plain URL strings (restored state, older
// call sites) and sometimes { url, caption } objects — normalize both.
function extraImageUrl(it) { return typeof it === 'string' ? it : (it && it.url) || ''; }
function extraImageCaption(it) { return (it && typeof it === 'object' && it.caption) || ''; }

async function fetchWikipediaImage(query) {
    const result = await fetchWikipediaSummary(query);
    return { imageUrl: result.imageUrl, articleUrl: result.articleUrl, extract: result.extract };
}

// Wikipedia lookup for an Explore discovery. Unlike a plain name lookup this
// (a) hands over the discovery's coordinates so an ambiguous or transliterated
// name resolves to the article about *this* place rather than a same-named one
// elsewhere, and (b) retries with looser forms of the name — parentheticals
// stripped, then the part before the first comma — since the model often
// returns "Qasr al-Hayr al-Sharqi (Eastern Palace), Homs" style names that no
// article is titled with. First variant that yields a photo wins; if none do,
// the best article we saw is still returned so the write-up/extract survives.
async function fetchDiscoveryWikipedia(discovery) {
    const name = (discovery.name || '').trim();
    const near = (typeof discovery.lat === 'number' && typeof discovery.lng === 'number')
        ? { lat: discovery.lat, lng: discovery.lng }
        : null;
    const variants = [...new Set([
        name,
        name.replace(/\([^)]*\)/g, ' ').replace(/\s+/g, ' ').trim(),
        name.split(',')[0].trim(),
    ])].filter(v => v.length > 2);

    let fallback = null;
    for (const v of variants) {
        const r = await fetchWikipediaSummary(v, { near, search: true });
        if (r && r.imageUrl) return r;
        if (r && !fallback && (r.articleUrl || r.extract)) fallback = r;
    }
    return fallback || { imageUrl: null, articleUrl: null, extract: null };
}

// Memoizes the discovery's Wikipedia lookup per discovery object (caching the
// in-flight promise, not just the result, so calls that race each other share
// one fetch) — the marker pin thumbnail, the hover popout, and the detail
// panel all want the same discovery's image, and without this each would
// issue its own redundant Wikipedia lookup.
function getDiscoveryImageInfo(discovery) {
    if (!discovery._imageInfoPromise) discovery._imageInfoPromise = fetchDiscoveryWikipedia(discovery);
    return discovery._imageInfoPromise;
}

// The photo to show for a discovery: the article's own lead thumbnail when it
// has one, otherwise the first usable picture from inside the article. Plenty
// of smaller sites — exactly the ones Explore surfaces — have an article with
// no thumbnail but images further down it, and those used to render as "this
// place has no photo at all". Cached per discovery like the lookup above.
function getDiscoveryLeadImage(discovery) {
    if (!discovery._leadImagePromise) {
        discovery._leadImagePromise = getDiscoveryImageInfo(discovery)
            .then(async info => {
                if (info.imageUrl) return info.imageUrl;
                if (!info.articleUrl) return null;
                const extras = await fetchExtraImages(info.articleUrl, null, 1);
                return extras.length ? extras[0].url : null;
            })
            .catch(() => null);
    }
    return discovery._leadImagePromise;
}

async function fetchLocationImage(location) {
    const [title, ...descParts] = (location.name || '').split('—');
    const place = title.split(',')[0].trim();
    const desc = descParts.join('—').trim();

    // The location carries the map coordinates the model placed it at. Pass
    // them as a disambiguation hint so a bare place name like "Acre" resolves
    // to the city near those coords rather than to a same-named article (the
    // unit of land area, a Brazilian state, ...) that opensearch ranks first.
    const near = (typeof location.lat === 'number' && typeof location.lng === 'number')
        ? { lat: location.lat, lng: location.lng }
        : null;

    const queries = [];
    if (desc) {
        // Prefer specific names inside parentheses, e.g. "(Eoraptor, Herrerasaurus)"
        const parenMatch = desc.match(/\(([^)]+)\)/);
        if (parenMatch) {
            parenMatch[1].split(',').forEach(s => { const t = s.trim(); if (t) queries.push({ q: t }); });
        }
        // Also try the event text without parens
        const cleanDesc = desc.replace(/\([^)]*\)/g, '').trim();
        if (cleanDesc) queries.push({ q: cleanDesc });
    }
    queries.push({ q: place, near, search: true });

    for (const { q, near: qNear, search } of queries) {
        const result = await fetchWikipediaSummary(q, { near: qNear, search });
        if (result.imageUrl) return result;
    }
    return { imageUrl: null, articleUrl: null, extract: null };
}

// Loose "are these the same thing?" test between a query and an article
// title, ignoring case, accents and punctuation: "Bab al-Yemen, Sanaa" vs
// "Bab al Yemen" yes, "Castillo de Loarre" vs "Castillo de la Real Fuerza" no.
function wikiTitlePlausible(query, title) {
    const norm = t => (t || '').toLowerCase()
        .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]+/g, ' ').trim();
    const q = norm(query), t = norm(title);
    if (!q || !t) return false;
    return q.includes(t) || t.includes(q);
}

async function fetchWikipediaSummary(query, opts = {}) {
    const STOP_WORDS = new Set(['the', 'a', 'an', 'of', 'in', 'on', 'at', 'to', 'for', 'and', 'or', 'why', 'did', 'how', 'where', 'what', 'is', 'was', 'were', 'i', 'want', 'me', 'show', 'tell', 'find', 'get', 'give']);
    const near = opts.near && typeof opts.near.lat === 'number' && typeof opts.near.lng === 'number' ? opts.near : null;
    // Whether to fall back to Wikipedia's full-text search (see below). Only
    // for queries that are the *name* of something; a descriptive phrase would
    // match articles that merely contain those words ("underground cities
    // carved five stories deep" → Weather Underground).
    const allowFullText = opts.search === true;
    // Max degrees between a candidate article's own coordinates and the hinted
    // location before we stop trusting it as the same place (~220 km).
    const NEAR_LIMIT_DEG = 2;

    async function summaryForTitle(title) {
        const res = await fetch(`https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(title)}`);
        if (!res.ok) return null;
        const data = await res.json();
        if (!data.title || data.type === 'disambiguation') return null;
        const src = data.thumbnail?.source || data.originalimage?.source;
        const articleUrl = data.content_urls?.desktop?.page || null;
        const extract = data.extract || null;
        const coords = data.coordinates && typeof data.coordinates.lat === 'number'
            ? { lat: data.coordinates.lat, lng: data.coordinates.lon }
            : null;
        if (src || articleUrl || extract) return { imageUrl: src || null, articleUrl, extract, coords, title: data.title };
        return null;
    }

    // With a coordinate hint, resolve the whole candidate list and prefer the
    // one whose article sits near the hinted spot. Falls back to first-match
    // when no candidate has usable nearby coordinates (species, events, etc.).
    async function pickFromTitles(titles) {
        const results = (await Promise.all(titles.map(summaryForTitle))).filter(Boolean);
        if (!results.length) return null;
        if (near) {
            // Candidates whose own article coordinates sit near the hinted
            // spot are the same place; among those prefer one with a photo
            // (an illustrated article about the right place beats a bare
            // stub about it), falling back to simply the closest.
            const dist = r => Math.hypot(r.coords.lat - near.lat, r.coords.lng - near.lng);
            const nearby = results
                .filter(r => r.coords && dist(r) <= NEAR_LIMIT_DEG)
                .sort((a, b) => dist(a) - dist(b));
            if (nearby.length) return nearby.find(r => r.imageUrl) || nearby[0];
            // Nothing sits near the hint. An article that carries coordinates
            // far from it is demonstrably a different place (searching
            // "Castillo de Loarre" surfaces Havana's Castillo de la Real
            // Fuerza, illustrated and confidently wrong) — showing its photo
            // is worse than showing none. What's left are articles with no
            // coordinates to judge by, and those are only trusted when the
            // title itself still reads as the place that was asked for.
            const placeless = results.filter(r => !r.coords && wikiTitlePlausible(query, r.title));
            return placeless.find(r => r.imageUrl) || placeless[0] || null;
        }
        // No coordinate hint (species, events, abstract topics): take the
        // best-ranked candidate that has an image, else the top hit.
        return results.find(r => r.imageUrl) || results[0];
    }

    try {
        const q = query.trim();

        // Use opensearch to find the best matching Wikipedia article for any query phrasing
        const searchRes = await fetch(`https://en.wikipedia.org/w/api.php?action=opensearch&search=${encodeURIComponent(q)}&limit=3&format=json&origin=*`);
        if (searchRes.ok) {
            const [, titles] = await searchRes.json();
            const result = await pickFromTitles(titles);
            if (result) return result;
        }

        // opensearch is a title-prefix matcher, so it misses outright whenever
        // the name in hand isn't how the article is titled: "Wadi Rum
        // Protected Area" returns nothing at all, and "Castillo de Loarre"
        // returns three unrelated Cuban castles. Full-text search finds what
        // those queries actually mean ("Wadi Rum", "Castle of Loarre"), so try
        // it before falling back to chopping words off the query.
        const fullTextRes = allowFullText
            ? await fetch(`https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(q)}&srlimit=3&format=json&origin=*`)
            : null;
        if (fullTextRes && fullTextRes.ok) {
            const data = await fullTextRes.json();
            const titles = (data.query && data.query.search || []).map(hit => hit.title);
            if (titles.length) {
                const result = await pickFromTitles(titles);
                if (result) return result;
            }
        }

        // Fallback: strip leading stop/filler words and try direct page lookup
        const words = q.split(/\s+/);
        let start = 0;
        while (start < words.length && STOP_WORDS.has(words[start].toLowerCase())) start++;
        const coreWords = words.slice(start);
        const stripped = coreWords.join(' ');

        const candidates = [...new Set([stripped, coreWords.slice(0, 4).join(' '), coreWords.slice(0, 3).join(' ')])
        ].filter(c => c.length > 2 && !STOP_WORDS.has(c.toLowerCase()));

        const fallback = await pickFromTitles(candidates);
        if (fallback) return fallback;

        return { imageUrl: null, articleUrl: null, extract: null };
    } catch {
        return { imageUrl: null, articleUrl: null, extract: null };
    }
}

async function fetchQuestion(question, onChunk) {
    const detailLevel = parseInt(document.getElementById('detailSlider')?.value ?? '4');
    const response = await fetch("/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question, detailLevel }),
    });

    if (response.status === 429) {
        const { error } = await response.json().catch(() => ({ error: 'Daily search limit reached.' }));
        throw new Error(error);
    }

    return new Promise((resolve, reject) => {
        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let lineBuffer = '';

        function pump() {
            reader.read().then(({ done, value }) => {
                if (done) { reject(new Error('Unexpected stream end')); return; }
                lineBuffer += decoder.decode(value, { stream: true });
                const lines = lineBuffer.split('\n');
                lineBuffer = lines.pop();
                for (const line of lines) {
                    if (!line.startsWith('data: ')) continue;
                    let parsed;
                    try { parsed = JSON.parse(line.slice(6)); } catch { continue; }
                    if (parsed.error) { reject(new Error(parsed.error)); return; }
                    if (parsed.done) { resolve({ answer: parsed.answer }); return; }
                    if (parsed.chunk && onChunk) onChunk(parsed.chunk);
                }
                pump();
            }).catch(reject);
        }
        pump();
    });
}

// Fire-and-forget cross-check of the summary's opening claim against the
// Wikipedia extract already on hand. Returns null on any failure so callers
// can just no-op — this is a soft enhancement, never something to block or
// error the main answer over.
async function factCheckOverview(summary, extract) {
    try {
        const res = await fetch('/fact-check', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ summary, extract }),
        });
        if (!res.ok) return null;
        return await res.json();
    } catch {
        return null;
    }
}

function parseLocations(answer) {
    const dataIndex = answer.indexOf("data:");
    if (dataIndex === -1) return { summary: answer, locations: [], related: [] };

    let summary = answer.slice(0, dataIndex).trim();
    // Strip any periods: block the model may have placed before data:
    const periodsInSummary = summary.indexOf("periods:");
    if (periodsInSummary !== -1) summary = summary.slice(0, periodsInSummary).trim();
    const afterData = answer.slice(dataIndex + 5).trim();

    // Extract locations JSON array — use bracket depth to handle nested arrays (e.g. region_countries)
    const start = afterData.indexOf("[");
    if (start === -1) return { summary, locations: [], related: [] };
    let end = -1;
    let depth = 0;
    for (let i = start; i < afterData.length; i++) {
        if (afterData[i] === '[') depth++;
        else if (afterData[i] === ']') { depth--; if (depth === 0) { end = i; break; } }
    }
    // No closing bracket found means the response got cut off mid-array
    // (hit the model's token limit, most often on very long enumeration
    // topics) — fall back to whatever text came through so we can still
    // salvage the location objects that did complete.
    const rawSlice = end !== -1 ? afterData.slice(start, end + 1) : afterData.slice(start);

    const toLocations = raw => raw.map(loc => ({
        name: loc.name,
        lat: Number(loc.latitude ?? loc.lat),
        lng: Number(loc.longitude ?? loc.lng),
        year: loc.year ?? null,
        main: loc.main === true,
        country: loc.country ?? null,
        region_countries: Array.isArray(loc.region_countries) ? loc.region_countries : null,
        route: (loc.route !== null && loc.route !== undefined && !isNaN(Number(loc.route))) ? Number(loc.route) : null,
        compare_group: (loc.compare_group === 'A' || loc.compare_group === 'B') ? loc.compare_group : null,
    })).filter(loc => !isNaN(loc.lat) && !isNaN(loc.lng)).map((loc, i) => ({ ...loc, pathIndex: i }));

    let locations = [];
    try {
        locations = toLocations(JSON.parse(rawSlice));
    } catch (e) {
        const lastComplete = rawSlice.lastIndexOf('},');
        if (lastComplete !== -1) {
            try {
                locations = toLocations(JSON.parse(rawSlice.slice(0, lastComplete + 1) + ']'));
            } catch (e2) {}
        }
    }

    // The model is asked for chronological order but doesn't always comply.
    // For single-path topics (no "route" field on any location) enforce it
    // here so markers, Play/Autoplay, and location numbering all walk the
    // timeline in year order. Multi-route topics keep the model's ordering
    // since routes can run in parallel and array position groups their stops.
    if (locations.length > 1 && locations.every(l => l.route === null)) {
        locations = locations
            .map((loc, i) => ({ loc, i }))
            .sort((a, b) => {
                if (a.loc.year === null && b.loc.year === null) return a.i - b.i;
                if (a.loc.year === null) return 1;
                if (b.loc.year === null) return -1;
                return a.loc.year - b.loc.year || a.i - b.i;
            })
            .map(({ loc }) => loc);
    }

    // Extract periods
    let periods = [];
    const periodsIndex = answer.indexOf("periods:");
    if (periodsIndex !== -1) {
        const afterPeriods = answer.slice(periodsIndex + 8).trim();
        const pStart = afterPeriods.indexOf("[");
        const pEnd = afterPeriods.indexOf("]");
        if (pStart !== -1 && pEnd !== -1) {
            try { periods = JSON.parse(afterPeriods.slice(pStart, pEnd + 1)); } catch (e) {}
        }
    }

    // Extract related searches
    let related = [];
    const relatedIndex = answer.indexOf("related:");
    if (relatedIndex !== -1) {
        const afterRelated = answer.slice(relatedIndex + 8).trim();
        const rStart = afterRelated.indexOf("[");
        const rEnd = afterRelated.lastIndexOf("]");
        if (rStart !== -1 && rEnd !== -1) {
            try { related = JSON.parse(afterRelated.slice(rStart, rEnd + 1)); } catch (e) {}
        }
    }

    // Extract wikipedia search hint
    let wikipediaHint = null;
    const wikipediaIndex = answer.indexOf('wikipedia:');
    if (wikipediaIndex !== -1) {
        const afterWikipedia = answer.slice(wikipediaIndex + 10).trim();
        const match = afterWikipedia.match(/^"([^"]+)"/);
        if (match && match[1] !== 'null') wikipediaHint = match[1];
    }

    return { summary, locations, related, periods, wikipediaHint };
}

let activeMarkers = [];
let activePolylines = [];
let activeLocations = [];
let overviewHTML = null;
let topicImageUrl = null;
let topicExtraImages = [];
let topicImageDesc = null;
let currentFocusedIndex = null;
let currentQuestion = '';
let locationImageCache = {};
let locationSummaryCache = {}; // index -> Promise<{summary, followUps}|null>, prefetched ahead of need
let activePopoutIndex = null;
let playbackActive = false;
let playbackTimeouts = [];
let playbackHighlightIndex = null;
let activeShading = null;

// ============== EXPLORE MODE ==============
// A lightweight overlay on top of the map, independent of the search/
// activeLocations system above — see enterExploreMode()/exitExploreMode() and
// friends further down. It's the app's permanent ground state: the app opens
// here and the search container (#questionBox) sits over it, returning here on
// close. Clicking a discovery pin opens the explore detail panels (#edpTitleBar/
// #edpSummaryPanel/#edpImagePanel — title/info/images, like the normal
// per-location view) via openExploreDetail(); only its explicit "Full search
// deep dive" button hands off to the normal search pipeline (askQuestion),
// via diveIntoDiscovery().
let exploreModeActive = false;
let exploreMarkers = [];
let exploreDiscoveries = [];       // current batch, index-aligned with exploreMarkers
let exploreShownNames = [];        // capped history, sent to the server as `exclude`
let exploreIdleListener = null;
let exploreFetchInFlight = false;
let explorePendingRecheck = false; // set when the map moved during an in-flight fetch; the fetch's
                                   // finally reschedules a check so the new viewport gets its own batch
let explorePendingRetry = false;   // set when an uncurated batch came back empty; the fetch's finally
                                   // runs one more attempt for the same viewport (Haiku is streaky —
                                   // a bare "nothing here" is usually the model, not the map)
let exploreLastBounds = null;      // {n,s,e,w} of the bounds last fetched for
let activeExploreDiscovery = null; // set while #marker-popout is showing a discovery, not a search location
let exploreDetailDiscovery = null; // the discovery the explore detail panels currently show, if open
let exploreDetailRequestId = 0;    // bumped on every openExploreDetail call to void stale async writes
let exploreWasActiveBeforeSearch = false; // set by exploreSearchInstead(); tells the search box's
                                           // back arrow (and an outside click) to resume Explore
                                           // instead of just closing, see resumeExploreMode()
let exploreSuppressAutoFetchUntil = 0;    // Date.now() ms threshold; set by quickLoadExploreFollowUp so
                                           // its own programmatic pan/zoom doesn't trigger the normal
                                           // "wander nearby" auto-fetch, which would close the panel it
                                           // just opened — see exploreOnIdle
let exploreEntryZoom = null;              // map zoom captured when explore mode was entered
let exploreFirstFetchDone = false;        // false until the session's first discovery batch fires — see
                                           // exploreOnIdle, where it relaxes the zoom floor so the very
                                           // first zoom-in (any step past exploreEntryZoom) spawns pins
const EXPLORE_MIN_ZOOM = 6;
// Relaxed floor for that first batch only: once the user has zoomed in at all
// from the landing view, don't make them keep zooming to hit EXPLORE_MIN_ZOOM.
const EXPLORE_FIRST_FETCH_MIN_ZOOM = 4;
const EXPLORE_CATEGORY_EMOJI = { history: '🏛️', nature: '🌿', culture: '🎨', oddity: '✨' };
const EXPLORE_CATEGORY_LABEL = { history: 'History', nature: 'Nature', culture: 'Culture', oddity: 'Oddity' };
// One color per category so pins stand out from each other at a glance.
// Reuses the same four accent presets Settings offers (see ACCENT_PRESETS)
// rather than inventing a second palette — four categories, four presets.
const EXPLORE_CATEGORY_COLOR = {
    history: ACCENT_PRESETS.orange.accent,
    nature: ACCENT_PRESETS.green.accent,
    culture: ACCENT_PRESETS.purple.accent,
    oddity: ACCENT_PRESETS.blue.accent,
};
const EXPLORE_ALL_CATEGORIES = ['history', 'nature', 'culture', 'oddity'];

// ---- Explore curation ----
// User-set lens on what the discovery batches surface: a free-text interest
// (biases the model prompt in /explore-nearby + /explore-related) and/or a
// subset of the four categories (sent to the server AND enforced client-side
// in exploreDiscoveryMatchesCuration, since the model doesn't always obey).
// Both are edited in #exploreCuratePanel and take effect on Apply, which
// wipes the current pins and re-fetches through the new lens.
let exploreFocus = '';
let exploreCurateCats = new Set(EXPLORE_ALL_CATEGORIES);

// A category set of "all four" (or somehow none) is no constraint at all.
function exploreCatsConstrained() {
    return exploreCurateCats.size > 0 && exploreCurateCats.size < EXPLORE_ALL_CATEGORIES.length;
}
function exploreCurationActive() {
    return !!exploreFocus || exploreCatsConstrained();
}
// null when unconstrained — callers send nothing to the server in that case.
function exploreCurationCategoriesParam() {
    return exploreCatsConstrained() ? [...exploreCurateCats] : null;
}
function exploreDiscoveryMatchesCuration(discovery) {
    if (!exploreCatsConstrained()) return true;
    return exploreCurateCats.has(discovery.category);
}

// Short summary shown on the collapsed curate button ("Curate Explore" when
// nothing is set, otherwise the focus text and/or category count).
function exploreCurateSummary() {
    const parts = [];
    if (exploreFocus) parts.push(`“${exploreFocus}”`);
    if (exploreCatsConstrained()) {
        parts.push(exploreCurateCats.size === 1
            ? EXPLORE_CATEGORY_LABEL[[...exploreCurateCats][0]]
            : `${exploreCurateCats.size} categories`);
    }
    return parts.length ? parts.join(' · ') : 'Curate Explore';
}

// Push current state into the panel controls + the collapsed button.
function syncExploreCurateUI() {
    const input = document.getElementById('exploreFocusInput');
    if (input && document.activeElement !== input) input.value = exploreFocus;
    document.querySelectorAll('#exploreCuratePanel .ecp-cat').forEach(btn => {
        btn.classList.toggle('selected', exploreCurateCats.has(btn.dataset.cat));
    });
    const btn = document.getElementById('exploreCurateBtn');
    const label = document.getElementById('exploreCurateLabel');
    if (label) label.textContent = exploreCurateSummary();
    if (btn) {
        btn.classList.toggle('active', exploreCurationActive());
        btn.title = exploreCurationActive()
            ? `Explore is focused — ${exploreCurateSummary()}`
            : 'Curate what Explore surfaces';
    }
}

function toggleExploreCuratePanel(event) {
    if (event) event.stopPropagation();
    const panel = document.getElementById('exploreCuratePanel');
    const btn = document.getElementById('exploreCurateBtn');
    if (!panel) return;
    const open = panel.style.display === 'none';
    panel.style.display = open ? 'block' : 'none';
    btn?.setAttribute('aria-expanded', open ? 'true' : 'false');
    if (open) {
        stopExploreBarTypewriter();   // real engagement — retire the load-in animation
        syncExploreCurateUI();
        document.getElementById('exploreFocusInput')?.focus();
    }
}

function closeExploreCuratePanel() {
    const panel = document.getElementById('exploreCuratePanel');
    if (panel) panel.style.display = 'none';
    document.getElementById('exploreCurateBtn')?.setAttribute('aria-expanded', 'false');
}

function toggleExploreCurateCat(btn) {
    const cat = btn.dataset.cat;
    if (exploreCurateCats.has(cat)) exploreCurateCats.delete(cat);
    else exploreCurateCats.add(cat);
    btn.classList.toggle('selected', exploreCurateCats.has(cat));
}

// Re-run discovery through the current lens: read the panel, stash state,
// then wipe the accumulated pins and re-fetch for whatever's on screen.
function applyExploreCuration() {
    const input = document.getElementById('exploreFocusInput');
    exploreFocus = input ? input.value.trim().slice(0, 120) : exploreFocus;
    // Deselecting every category means "no preference", same as all four.
    if (exploreCurateCats.size === 0) exploreCurateCats = new Set(EXPLORE_ALL_CATEGORIES);
    stopExploreBarTypewriter();
    syncExploreCurateUI();
    closeExploreCuratePanel();
    if (exploreModeActive) resetExploreDiscoveries();
}

function clearExploreCuration() {
    exploreFocus = '';
    exploreCurateCats = new Set(EXPLORE_ALL_CATEGORIES);
    syncExploreCurateUI();
    closeExploreCuratePanel();
    if (exploreModeActive) resetExploreDiscoveries();
}

// Close the curate panel on any outside click (it sits over the live map).
document.addEventListener('click', (e) => {
    const wrap = document.getElementById('exploreCurate');
    const panel = document.getElementById('exploreCuratePanel');
    if (!wrap || !panel || panel.style.display === 'none') return;
    if (!wrap.contains(e.target)) closeExploreCuratePanel();
});

// Splits a location's "Name — event description" string, and formats its
// year/coords for display. Shared by the header and the marker popout.
function formatLocationMeta(location) {
    const [title, ...descParts] = (location.name || '').split('—');
    const desc = descParts.join('—').trim();
    const place = title.trim();
    const yearDisplay = location.year !== null && location.year !== undefined
        ? (location.year < 0 ? `${Math.abs(location.year)} BCE` : String(location.year))
        : null;
    const coords = `${Math.abs(location.lat).toFixed(2)}°${location.lat >= 0 ? 'N' : 'S'}, ${Math.abs(location.lng).toFixed(2)}°${location.lng >= 0 ? 'E' : 'W'}`;
    return { place, desc, yearDisplay, coords };
}

// Drives the panel header (location name/date/event in place of the topic
// title while one is focused) and the timeline's own nav row: overview shows
// one big "Start →" button in place of the step/jump buttons, touring swaps
// to those step/jump buttons (prev/next already cover "advance") and hides
// Start entirely.
function renderHeaderState() {
    const qb = document.getElementById('questionBox');
    const btn = document.getElementById('beginJourneyBtn');
    const timelineNavBtns = ['timeline-first', 'timeline-prev', 'timeline-next', 'timeline-last']
        .map(id => document.getElementById(id));
    const prevBtn = document.getElementById('headerPrevBtn');
    const overviewBtn = document.getElementById('overviewBtn');
    const locFocusMeta = document.getElementById('locFocusMeta');
    const loc = currentFocusedIndex !== null ? activeLocations[currentFocusedIndex - 1] : null;

    if (qb) qb.classList.toggle('loc-focused', !!loc);
    // One-click way back to the topic overview from anywhere in the
    // location timeline/tour — only meaningful (and shown) once a location
    // is focused; the overview itself has nowhere further "back" to go.
    if (overviewBtn) overviewBtn.style.display = loc ? 'flex' : 'none';

    // The street view thumbnail (now docked in #currentImagePanel) only
    // applies to a focused location — clear it whenever we're back at the
    // topic overview so a stale panorama doesn't linger under the images.
    if (!loc) {
        const svSlot = document.getElementById('loc-streetview-slot');
        if (svSlot) { svSlot.style.display = 'none'; svSlot.innerHTML = ''; }
        locStreetViewPano = null;
    }

    if (loc) {
        const { place, desc, yearDisplay, coords } = formatLocationMeta(loc);
        const locHeaderTitle = document.getElementById('locHeaderTitle');
        const locHeaderYear = document.getElementById('locHeaderYear');
        const locHeaderCoords = document.getElementById('locHeaderCoords');
        const locHeaderEvent = document.getElementById('locHeaderEvent');
        if (locHeaderTitle) locHeaderTitle.textContent = place;
        if (locHeaderYear) locHeaderYear.textContent = yearDisplay || '';
        if (locHeaderCoords) locHeaderCoords.textContent = coords;
        if (locHeaderEvent) locHeaderEvent.textContent = desc;
        if (locFocusMeta) locFocusMeta.textContent = `Location ${currentFocusedIndex} of ${activeLocations.length}`;
    } else if (locFocusMeta) {
        locFocusMeta.textContent = '';
    }

    const order = timelineOrderedIndices();
    if (btn) {
        // Only shown pre-tour, in place of the step/jump buttons below —
        // once a location is focused those handle forward/back instead.
        btn.style.display = !loc && activeLocations.length > 0 ? 'inline-flex' : 'none';
        btn.disabled = false;
        btn.title = activeLocations.length
            ? `Start the guided tour of ${activeLocations.length} location${activeLocations.length !== 1 ? 's' : ''}`
            : "Start the guided tour of this topic's locations";
    }
    timelineNavBtns.forEach(el => { if (el) el.style.display = loc ? 'flex' : 'none'; });
    // Shares the nav buttons' spot, so it has to stay hidden pre-tour too —
    // otherwise it sits on top of the Start button instead of beside it.
    const currentYearEl = document.getElementById('timeline-current-year');
    if (currentYearEl) currentYearEl.style.display = loc ? 'block' : 'none';
    if (prevBtn) {
        if (!loc) {
            prevBtn.style.display = 'none';
        } else {
            prevBtn.style.display = 'inline-flex';
            const pos = order.indexOf(currentFocusedIndex);
            prevBtn.disabled = order.length === 0 || pos <= 0;
        }
    }
}

// Begins the tour from the overview. Only wired to the Start button, which
// is itself only shown pre-tour (see renderHeaderState) — once a location
// is focused, prev/next already cover moving through the rest.
function handleHeaderCta() {
    if (currentFocusedIndex === null && activeLocations.length) {
        focusLocation(activeLocations[0], 1);
    }
}

// Fetches (and caches) the LLM-generated summary for a location so it can be
// kicked off ahead of time — the request takes a few seconds, so calling
// this before the user actually navigates there lets focusLocation render
// instantly from the resolved cache entry instead of showing a spinner.
function getLocationSummaryPromise(location, index) {
    if (locationSummaryCache[index]) return locationSummaryCache[index];
    const { place, desc } = formatLocationMeta(location);
    const promise = fetch('/location-summary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: currentQuestion, locationName: place, event: desc, year: location.year }),
    }).then(r => r.json()).catch(() => {
        delete locationSummaryCache[index]; // let a later attempt retry instead of caching the failure
        return null;
    });
    locationSummaryCache[index] = promise;
    return promise;
}

// Warms the cache for a location that isn't focused yet.
function prefetchLocationSummary(index) {
    if (index === null || index === undefined || locationSummaryCache[index]) return;
    const location = activeLocations[index - 1];
    if (location) getLocationSummaryPromise(location, index);
}

function focusLocation(location, index) {
    hideMarkerPopout();
    const answerBox = document.getElementById("answer");
    if (overviewHTML === null) {
        overviewHTML = answerBox.innerHTML;
    }

    currentFocusedIndex = index;
    applyMarkerEmphasis(index);
    updateTimelineNav();
    renderHeaderState();
    timelineRecenter();

    const { place, desc } = formatLocationMeta(location);

    // The street view thumbnail lives permanently in #currentImagePanel now
    // (right-side, under the images) rather than being recreated here each
    // time — checkStreetView() below resets/repopulates it in place.
    answerBox.innerHTML = `
        <div id="loc-summary-slot"></div>
    `;

    // Render image (top-right panel) and summary slot async — UI is already visible above
    setCurrentImage(null);
    fetchLocationImage(location).then(({ imageUrl, articleUrl, extract }) => {
        if (currentFocusedIndex !== index) return;
        setCurrentImage(imageUrl, [], extract);
        const summarySlot = document.getElementById('loc-summary-slot');
        if (summarySlot) summarySlot.dataset.articleUrl = articleUrl || '';
        if (articleUrl) {
            fetchExtraImages(articleUrl, imageUrl).then(urls => {
                if (currentFocusedIndex === index) setExtraImages(urls);
            });
        }
    });

    getLocationSummaryPromise(location, index).then((result) => {
        if (!result) return;
        const { followUps } = result;
        // The model occasionally opens with a title heading here too, even
        // though it's asked for flowing prose only — strip it so the left
        // card starts straight into the paragraph. The location's name and
        // event already anchor #summaryTitleBar, so nothing is lost.
        const summary = (result.summary || '').replace(/^\s*#{1,6}\s+.+?\s*\n+/, '');
        const summarySlot = document.getElementById('loc-summary-slot');
        if (currentFocusedIndex !== index) return; // moved on before this resolved
        if (!summarySlot || !summary) return;
        const articleUrl = summarySlot.dataset.articleUrl || '';
        const linkHTML = articleUrl ? `<a href="${articleUrl}" target="_blank" rel="noopener noreferrer" class="loc-focus-wiki">Wikipedia ↗</a>` : '';
        const fuHTML = followUps && followUps.length
            ? `<div class="loc-followups">
                <div class="loc-followups-label">Ask next</div>
                <div class="loc-followups-chips">${followUps.map((q, i) => `
                    <div class="loc-followup-item">
                        <button class="related-chip loc-followup-q" data-fu-index="${i}">${q}</button>
                        <div class="loc-followup-answer" id="loc-fu-answer-${i}" hidden></div>
                    </div>
                `).join('')}</div>
               </div>`
            : '';
        summarySlot.innerHTML = `<div class="loc-focus-summary">${marked.parse(summary)}${linkHTML}</div>${fuHTML}`;
        // Color this location's bold names/dates to match its own marker
        // color on the map (route/compare/time color) rather than the flat
        // accent, so the summary reads as "belonging" to that pin/dot.
        const locColor = activeLocationColors[index];
        if (locColor) summarySlot.style.setProperty('--loc-accent', readableTextColor(locColor));

        if (followUps && followUps.length) {
            summarySlot.querySelectorAll('.loc-followup-q').forEach(btn => {
                btn.addEventListener('click', () => {
                    const i = Number(btn.dataset.fuIndex);
                    const q = followUps[i];
                    const answerBox = document.getElementById(`loc-fu-answer-${i}`);
                    if (!answerBox) return;

                    // Toggle closed if already open
                    if (!answerBox.hidden) {
                        answerBox.hidden = true;
                        btn.classList.remove('loc-followup-q-active');
                        return;
                    }

                    btn.classList.add('loc-followup-q-active');
                    answerBox.hidden = false;

                    if (answerBox.dataset.loaded === 'true') return; // already fetched

                    answerBox.innerHTML = `<span class="loc-followup-loading">Thinking…</span>`;
                    fetch('/followup-quick-answer', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ question: currentQuestion, locationName: place, event: desc, year: location.year, followUp: q }),
                    }).then(r => r.json()).then(({ answer }) => {
                        answerBox.dataset.loaded = 'true';
                        if (!answer) { answerBox.hidden = true; return; }
                        const cleanAnswer = answer.replace(/^#+\s*/gm, '').trim();
                        answerBox.innerHTML = `
                            <p class="loc-followup-answer-text">${cleanAnswer}</p>
                            <button class="loc-followup-full-btn" type="button">Explore full search →</button>
                        `;
                        answerBox.querySelector('.loc-followup-full-btn').addEventListener('click', () => searchRelated(q));
                    }).catch(() => { answerBox.hidden = true; });
                });
            });
        }

        if (isAutoplaying) {
            const clone = summarySlot.querySelector('.loc-focus-summary')?.cloneNode(true);
            if (clone) {
                clone.querySelectorAll('a').forEach(a => a.remove());
                const speakText = clone.innerText.trim();
                if (speakText && isVoiceMuted) {
                    setTimeout(() => {
                        if (!isAutoplaying) return;
                        autoplayStep++;
                        autoplayGoToStep();
                    }, 3000);
                } else if (speakText) {
                    const utt = new SpeechSynthesisUtterance(speakText);
                    utt.rate = 1.1;
                    utt.pitch = 0.95;
                    const voice = pickBestVoice();
                    if (voice) utt.voice = voice;
                    utt.onend = () => {
                        if (!isAutoplaying) return;
                        autoplayStep++;
                        autoplayGoToStep();
                    };
                    utt.onerror = () => stopAutoplay();
                    speechSynthesis.cancel();
                    speechSynthesis.speak(utt);
                }
            }
        }
    }).catch(() => {});

    // Warm the cache a few stops out in both directions so the summary is
    // already resolved by the time the user arrows through several in a
    // row — a single stop of lookahead only covers one click; if someone
    // arrows faster than the ~2-5s the LLM call takes, every subsequent
    // stop still had to start its fetch from scratch. These run in
    // parallel and are cheap to over-fetch (getLocationSummaryPromise
    // dedupes against locationSummaryCache), so widen the window instead.
    const PREFETCH_LOOKAHEAD = 3;
    const tourOrder = timelineOrderedIndices();
    const tourPos = tourOrder.indexOf(index);
    if (tourPos !== -1) {
        for (let i = 1; i <= PREFETCH_LOOKAHEAD; i++) {
            if (tourPos + i < tourOrder.length) prefetchLocationSummary(tourOrder[tourPos + i]);
            if (tourPos - i >= 0) prefetchLocationSummary(tourOrder[tourPos - i]);
        }
    }

    document.getElementById("backButton").style.display = "flex";
    map.panTo({ lat: location.lat, lng: location.lng });
    smoothZoom(getLocationZoom());
    checkStreetView(location.lat, location.lng, () => currentFocusedIndex !== index);
}

// #loc-streetview-slot is a standalone fixed panel, not a child of
// #currentImagePanel/#edpImagePanel, so it doesn't read as one more photo in
// that grid — this keeps it docked directly under whichever of those two
// image panels is currently active (the explore detail one while a discovery
// is open, the normal one otherwise), regardless of where that panel
// currently sits (including if the user has dragged #currentImagePanel
// elsewhere).
function positionStreetViewSlot() {
    const slot = document.getElementById('loc-streetview-slot');
    const imgPanel = document.getElementById(exploreDetailDiscovery ? 'edpImagePanel' : 'currentImagePanel');
    if (!slot || !imgPanel) return;
    const rect = imgPanel.getBoundingClientRect();
    slot.style.left = rect.left + 'px';
    slot.style.top = (rect.bottom + 24) + 'px';
    slot.style.width = rect.width + 'px';
    slot.style.right = 'auto';
}

// Looks up whether real Street View coverage exists near the given
// coordinates and, if so, drops a small non-interactive thumbnail into its
// own panel below the images — most historical/remote locations have no
// coverage, so this stays silent rather than showing a "no imagery"
// placeholder. `isStale()` is checked after the (async) lookup resolves so a
// slower response can't overwrite the panel once the user has moved on to
// another location or discovery — see the callers (focusLocation,
// openExploreDetail) for what each one checks.
function checkStreetView(lat, lng, isStale) {
    const slot = document.getElementById('loc-streetview-slot');
    if (!slot) return;
    slot.style.display = 'none';
    slot.innerHTML = '';
    locStreetViewPano = null;
    if (!streetViewService) return;

    streetViewService.getPanorama({
        location: { lat, lng },
        radius: 50,
        source: google.maps.StreetViewSource.OUTDOOR,
    }, (data, status) => {
        if (isStale()) return;
        if (status !== google.maps.StreetViewStatus.OK || !data || !data.location) return;

        const pano = data.location.pano;
        positionStreetViewSlot();
        slot.style.display = '';
        // The StreetViewPanorama constructor takes over its container's own
        // inline styles (forces position:relative, etc.), which would fight
        // the fixed positioning above — give it an inner div to own instead
        // of handing it #loc-streetview-slot itself.
        slot.innerHTML = '<div class="loc-streetview-badge">📍 Street View — click to explore</div><div class="loc-streetview-pano"></div>';
        const panoEl = slot.querySelector('.loc-streetview-pano');
        locStreetViewPano = new google.maps.StreetViewPanorama(panoEl, {
            pano,
            pov: { heading: 0, pitch: 0 },
            disableDefaultUI: true,
            clickToGo: false,
            scrollwheel: false,
            draggable: false,
            linksControl: false,
            panControl: false,
            zoomControl: false,
            addressControl: false,
            fullscreenControl: false,
            motionTracking: false,
            motionTrackingControl: false,
        });
        // Plain onclick (not addEventListener) so re-running checkStreetView
        // for a new location/discovery replaces the handler instead of
        // stacking another one on top of it.
        slot.onclick = () => openStreetViewModal(pano);
    });
}

function openStreetViewModal(pano) {
    const modal = document.getElementById('streetViewModal');
    const paneEl = document.getElementById('streetViewModalPano');
    if (!modal || !paneEl) return;
    modal.style.display = 'flex';
    if (!modalStreetViewPano) {
        modalStreetViewPano = new google.maps.StreetViewPanorama(paneEl, {
            pano,
            pov: { heading: 0, pitch: 0 },
        });
    } else {
        modalStreetViewPano.setPano(pano);
    }
}

function closeStreetViewModal() {
    const modal = document.getElementById('streetViewModal');
    if (modal) modal.style.display = 'none';
}

// prev/next/first/last all move through timelineOrderedIndices() — the
// locations sorted by year — not the raw activeLocations array order,
// since that order is narrative/geographic and jumps around in time.
function updateTimelineNav() {
    const firstBtn = document.getElementById('timeline-first');
    const prevBtn = document.getElementById('timeline-prev');
    const nextBtn = document.getElementById('timeline-next');
    const lastBtn = document.getElementById('timeline-last');
    if (!prevBtn || !nextBtn) return;
    const order = timelineOrderedIndices();
    const cur = currentFocusedIndex ?? order[0];
    const pos = order.indexOf(cur);
    const atStart = order.length === 0 || pos <= 0;
    const atEnd = order.length === 0 || pos === -1 || pos >= order.length - 1;
    if (firstBtn) firstBtn.disabled = atStart;
    prevBtn.disabled = atStart;
    nextBtn.disabled = atEnd;
    if (lastBtn) lastBtn.disabled = atEnd;
}

// Nothing focused yet is treated as "on the earliest event" (the arc's
// default center), so next/prev work immediately without an explicit first click.
function prevLocation() {
    const order = timelineOrderedIndices();
    if (!order.length) return;
    if (currentFocusedIndex === null) {
        // At the topic overview (home) — arrowing left wraps around to the
        // last location, mirroring how the last location wraps forward to home.
        const idx = order[order.length - 1];
        focusLocation(activeLocations[idx - 1], idx);
        return;
    }
    const pos = order.indexOf(currentFocusedIndex);
    if (pos <= 0) return;
    const idx = order[pos - 1];
    focusLocation(activeLocations[idx - 1], idx);
}

function nextLocation() {
    const order = timelineOrderedIndices();
    if (!order.length) return;
    const cur = currentFocusedIndex ?? order[0];
    const pos = order.indexOf(cur);
    if (pos === -1 || pos >= order.length - 1) {
        // Arrowing past the last location loops back to the topic overview
        // (home) instead of getting stuck at the end.
        returnToOverview();
        return;
    }
    const idx = order[pos + 1];
    focusLocation(activeLocations[idx - 1], idx);
}

function firstLocation() {
    const order = timelineOrderedIndices();
    if (!order.length) return;
    const cur = currentFocusedIndex ?? order[0];
    if (cur === order[0]) return;
    focusLocation(activeLocations[order[0] - 1], order[0]);
}

function lastLocation() {
    const order = timelineOrderedIndices();
    if (!order.length) return;
    const cur = currentFocusedIndex ?? order[0];
    const idx = order[order.length - 1];
    if (cur === idx) return;
    focusLocation(activeLocations[idx - 1], idx);
}

function clearMap() {
    // Cancel any active playback without triggering the full restore path
    playbackActive = false;
    playbackHighlightIndex = null;
    playbackTimeouts.forEach(clearTimeout);
    playbackTimeouts = [];

    activeMarkers.forEach(m => m.setMap(null));
    activePolylines.forEach(p => p.setMap(null));
    map.data.forEach(f => map.data.remove(f));
    activeMarkers = [];
    activePolylines = [];
    activeLocations = [];
    locationImageCache = {};
    locationSummaryCache = {};
    activeShading = null;
    hideMarkerPopout();
    hideCompareLegend();
}

// Keeps the two "get (back) into Explore" affordances in sync with the
// current state, called from every search/explore transition:
//
//   • #cancelSearchBtn (the search container's back arrow) — when it would
//     land the user back in Explore (they opened the search box straight
//     from Explore and nothing else is stacked behind it), it wears the
//     compass glyph instead of a plain "←" so the destination is obvious.
//   • #exploreReturnBtn — the "Explore" pill in the search container's
//     top-right corner. Only shown while that container is the centered
//     search box (not a result view, not mid-search) and the back arrow
//     isn't already the compass itself.
function updateExploreNav() {
    const inExplore = document.body.classList.contains('explore-mode');
    const cancelBtn = document.getElementById('cancelSearchBtn');
    const cancelVisible = !!cancelBtn && cancelBtn.style.display !== 'none';
    const backLeadsToExplore = cancelVisible && exploreWasActiveBeforeSearch && !_savedResultState;

    if (cancelBtn) {
        cancelBtn.classList.toggle('to-explore', backLeadsToExplore);
        cancelBtn.textContent = backLeadsToExplore ? '\u{1F9ED}' : '←';
        cancelBtn.title = backLeadsToExplore ? 'Back to Explore' : 'Back';
    }

    const returnBtn = document.getElementById('exploreReturnBtn');
    if (returnBtn) {
        const qb = document.getElementById('questionBox');
        const show = !inExplore && !backLeadsToExplore
            && !!qb && qb.classList.contains('centered')
            && !qb.classList.contains('searching')
            && !document.body.classList.contains('containers-hidden');
        returnBtn.style.display = show ? 'flex' : 'none';
    }
}

// ============== EXPLORE MODE ==============
// Ambient wandering layer: pan/zoom the map with no topic in mind and a
// handful of nearby real places quietly appear (see spawnDiscoveries). It's
// deliberately independent of the search/activeLocations system above — the
// only hand-off point is diveIntoDiscovery(), which exits explore mode and
// runs a normal search via askQuestion(), reusing that entire pipeline
// (summary, timeline, images, and the existing "Explore further" related
// chips) instead of building a second content system.

function enterExploreMode() {
    if (exploreModeActive) return;
    exploreModeActive = true;
    hideMarkerPopout();

    // Hide (don't clear) any current search result's pins/routes so they're
    // not fighting the discovery pins for attention while wandering — exiting
    // explore mode without diving into anything brings them straight back.
    activeMarkers.forEach(m => m.setMap(null));
    activePolylines.forEach(p => p.setMap(null));

    document.body.classList.add('explore-mode');
    syncExploreCurateUI();

    // #loc-streetview-slot is a standalone fixed element, not a child of any
    // of the panels the CSS above hides — hide it explicitly so a real
    // focused location's thumbnail doesn't keep floating over the map while
    // exploring. exitExploreMode() rebuilds it fresh for whatever's still
    // focused once explore mode ends.
    const enterSvSlot = document.getElementById('loc-streetview-slot');
    if (enterSvSlot) { enterSvSlot.style.display = 'none'; enterSvSlot.innerHTML = ''; }
    locStreetViewPano = null;

    // "Let them pan first": stay right where the map already is — no forced
    // zoom, no recenter. exploreOnIdle() below will just report that they
    // need to zoom/pan in until they actually do, so entering explore mode
    // never itself triggers a spawn at whatever the map's resting spot is.
    // But once they *do* zoom in — even a single step — the first batch
    // fires without waiting for EXPLORE_MIN_ZOOM (see exploreOnIdle).
    exploreLastBounds = null;
    exploreEntryZoom = map.getZoom();
    exploreFirstFetchDone = false;
    // bounds_changed + a manual debounce, rather than the Maps API's own
    // 'idle' event — bounds_changed is a low-level event that fires
    // reliably and immediately on every pan/zoom step (including
    // programmatic ones like the setZoom above), whereas 'idle' waits on
    // Maps' own tile-load heuristics and was observed to sometimes not fire
    // at all after a purely programmatic zoom. Debouncing ourselves also
    // naturally coalesces a whole drag/zoom gesture into one check.
    attachExploreBoundsListener();
    scheduleExploreCheck(true);
    updateExploreNav();
}

function exitExploreMode({ skipMarkerRestore = false, preserveDiscoveries = false } = {}) {
    if (!exploreModeActive) return;
    exploreModeActive = false;

    if (exploreIdleListener) {
        google.maps.event.removeListener(exploreIdleListener);
        exploreIdleListener = null;
    }
    if (exploreDebounceTimer) { clearTimeout(exploreDebounceTimer); exploreDebounceTimer = null; }
    exploreFetchInFlight = false;
    document.getElementById('exploreBar')?.classList.remove('loading', 'bar-status-visible');
    // exploreSearchInstead() passes preserveDiscoveries so the discovered
    // batch is just hidden, not thrown away — resumeExploreMode() re-shows
    // the same markers instead of the map coming back empty.
    if (preserveDiscoveries) {
        exploreMarkers.forEach(m => m.setMap(null));
    } else {
        clearExploreMarkers();
    }
    if (activeExploreDiscovery) hideMarkerPopout();
    closeExploreDetail();
    closeExploreCuratePanel();

    // Rebuild the real focused location's street view thumbnail, since
    // enterExploreMode() hid it above and a discovery's own street view may
    // have overwritten it entirely along the way (see closeExploreDetail).
    if (currentFocusedIndex !== null) {
        const exitFocusedIndex = currentFocusedIndex;
        const exitFocusedLoc = activeLocations[exitFocusedIndex - 1];
        if (exitFocusedLoc) {
            checkStreetView(exitFocusedLoc.lat, exitFocusedLoc.lng, () => currentFocusedIndex !== exitFocusedIndex);
        }
    }

    document.body.classList.remove('explore-mode');

    // #questionBox starts with no "centered"/"result-mode" class now that
    // Explore is the default landing state (see body.explore-mode in
    // index.html) — every other path onto/off of it always pairs an add
    // with a remove, but exiting Explore this way (the ✕ button, or the
    // header toggle) is the one place that can reveal it for the first time
    // with neither class set. Fall back to the blank landing view rather
    // than showing it in an unstyled, half-configured state.
    const qbAfterExplore = document.getElementById('questionBox');
    if (qbAfterExplore && !qbAfterExplore.classList.contains('centered') && !qbAfterExplore.classList.contains('result-mode')) {
        qbAfterExplore.classList.add('centered');
    }

    // Skipped when diving into a discovery — askQuestion() is about to call
    // clearMap() anyway, so restoring these first would just be thrown away.
    if (!skipMarkerRestore) {
        activeMarkers.forEach(m => m.setMap(map));
        activePolylines.forEach(p => p.setMap(map));
    }
    updateExploreNav();
}

function exploreSearchInstead() {
    exploreWasActiveBeforeSearch = true;
    exitExploreMode({ preserveDiscoveries: true });
    // exitExploreMode un-hides #questionBox (display:none under
    // body.explore-mode) already at its .centered spot. There's no docked
    // position to slide up from in Explore mode, so fade + scale it in on the
    // spot instead: paint one frame invisible/small (.qb-fade), then drop the
    // class so it eases to full size. See the .qb-fade CSS.
    const qb = document.getElementById('questionBox');
    if (qb) {
        qb.classList.add('qb-fade');
        void qb.offsetWidth;
    }
    openSearch();
    if (qb) requestAnimationFrame(() => requestAnimationFrame(() => qb.classList.remove('qb-fade')));
    updateExploreNav();
    // Pre-fill the search field with the example the bar was typing out, so
    // clicking the bar acts on what the user was reading. Selected (not just
    // placed) so a keystroke replaces it and Enter runs it as-is. Only when
    // the typed-example animation is actually running (see
    // stopExploreBarTypewriter) and there's a phrase to carry.
    if (!exploreBarTypewriterStopped && exploreBarCurrentPhrase) {
        const input = document.getElementById('questionInput');
        if (input) {
            input.value = exploreBarCurrentPhrase;
            const phrase = exploreBarCurrentPhrase;
            // openSearch() focuses the input on a 300ms delay; re-assert the
            // selection just after so the fill lands highlighted, not
            // caret-at-end or cleared by the focus.
            setTimeout(() => {
                if (input.value === phrase) input.select();
            }, 340);
        }
    }
}

// Undoes exploreSearchInstead(): brings the paused discovery pins (hidden,
// not cleared, by exitExploreMode's preserveDiscoveries above) back onto the
// map and resumes listening for pan/zoom — without going through
// enterExploreMode(), which would reset exploreLastBounds/exploreShownNames
// and force an immediate re-fetch as if exploring had just started.
function resumeExploreMode() {
    exploreWasActiveBeforeSearch = false;
    if (exploreModeActive) return;
    exploreModeActive = true;

    const qb = document.getElementById('questionBox');
    qb.classList.remove('centered', 'result-mode');
    document.getElementById('topSearchWrapper')?.classList.remove('visible');

    // Drop an unrun example that exploreSearchInstead() pre-filled — the user
    // backed out without searching it, so it shouldn't sit in the box next time.
    const resumeInput = document.getElementById('questionInput');
    if (resumeInput && resumeInput.value === exploreBarCurrentPhrase) resumeInput.value = '';

    exploreMarkers.forEach(m => m.setMap(map));
    document.body.classList.add('explore-mode');
    syncExploreCurateUI();
    // Resuming after a search — if anything was already discovered, the
    // relaxed first-fetch zoom floor no longer applies.
    exploreEntryZoom = map.getZoom();
    exploreFirstFetchDone = exploreMarkers.length > 0 || exploreShownNames.length > 0;
    attachExploreBoundsListener();
    updateExploreNav();
}

function clearExploreMarkers() {
    exploreMarkers.forEach(m => m.setMap(null));
    exploreMarkers = [];
    exploreDiscoveries = [];
    exploreRelatedCache = {};
}

// The explicit "start over" action — discovery pins otherwise persist across
// pans/zooms (see spawnDiscoveries), so this is the only way to wipe the
// accumulated set. Also resets the exclude history so previously-seen places
// can resurface, then immediately re-fetches for whatever's on screen right
// now. No dedicated button currently calls this (#exploreBar dropped its
// reset button to stay compact) — kept as a callable primitive in case a
// future control needs it.
function resetExploreDiscoveries() {
    if (!exploreModeActive) return;
    closeExploreDetail();
    clearExploreMarkers();
    exploreShownNames = [];
    exploreLastBounds = null;
    setExploreBarStatus('Pan or zoom to discover places', { idle: true });
    scheduleExploreCheck(true);
}

// Updates the explore bar's status line. `idle` states (the "pan/zoom in to
// discover" prompts, shown when there's nothing to report) keep the line
// screen-reader-only and leave the "Earthlopedia" wordmark showing; anything
// else (a fetch in flight, a result count, an error) adds .bar-status-visible
// so the text takes the wordmark's place for sighted users too.
function setExploreBarStatus(text, { idle = false } = {}) {
    const el = document.getElementById('exploreBarStatus');
    if (el) el.textContent = text;
    document.getElementById('exploreBar')?.classList.toggle('bar-status-visible', !idle);
}

// Human label for whatever's near the map center right now ("Ellicott,
// Colorado", "Kyoto, Japan", "Patagonia, Argentina") — folded into the
// explore bar's status line so a discovery fetch reads as "Discovering near
// Ellicott, Colorado…" rather than a bare "Discovering nearby…". Reverse-
// geocoded on demand and cached; refreshed each time a new batch is fetched
// (see spawnDiscoveries). Empty string whenever geocoding is unavailable or
// hasn't resolved yet, and every caller falls back to the place-less
// wording in that case.
let exploreCenterPlace = '';
let exploreGeocoder = null;
let exploreGeocodeToken = 0;

// Turns a reverse-geocode result set into a "Place, Context" label: the most
// specific name available (town → county → region → country) plus one level
// of context so an obscure "Ellicott" isn't left dangling — its state, or
// the country if there's no distinct state or the state name just echoes the
// place ("Kyoto" / "Kyoto Prefecture" → "Kyoto, Japan").
// A "wide" viewport (long side past this many km) is showing a whole region,
// not a locality — the status line then reads "across Sichuan, China" rather
// than "near Chongqing", and the center reverse-geocode is asked for a
// coarser (region/country) label. Kept in step with server.js's own
// wideView threshold in /explore-nearby.
const EXPLORE_WIDE_VIEW_KM = 150;

// {n,s,e,w} → length of the longer viewport edge in km.
function exploreViewportLongSideKm(b) {
    const midLat = (b.n + b.s) / 2;
    const latKm = Math.abs(b.n - b.s) * 111;
    const lngKm = Math.abs(b.e - b.w) * 111 * Math.max(Math.cos(midLat * Math.PI / 180), 0.02);
    return Math.max(latKm, lngKm);
}

function pickExplorePlaceLabel(results, { coarse = false } = {}) {
    const comps = results.flatMap(r => r.address_components || []);
    const byType = t => comps.find(c => c.types.includes(t))?.long_name || '';
    const locality = coarse ? '' : (byType('locality') || byType('postal_town')
        || byType('administrative_area_level_3') || byType('administrative_area_level_2'));
    const region = byType('administrative_area_level_1');
    const country = byType('country');

    const primary = locality || region || country;
    if (!primary) return '';

    let context = '';
    if (primary === locality) {
        if (region && !region.includes(primary) && !primary.includes(region)) context = region;
        else if (country) context = country;
    } else if (primary === region && country) {
        context = country;
    }
    return context ? `${primary}, ${context}` : primary;
}

// Resolves to the label ('' when geocoding is unavailable or finds nothing).
// spawnDiscoveries awaits it so the label can go to the server with the batch
// request, not just into the status line.
function refreshExploreCenterPlace(onResolved, { coarse = false } = {}) {
    return new Promise(resolve => {
        if (!window.google || !google.maps || !google.maps.Geocoder || !map) { resolve(''); return; }
        if (!exploreGeocoder) exploreGeocoder = new google.maps.Geocoder();
        const center = map.getCenter();
        if (!center) { resolve(''); return; }
        const token = ++exploreGeocodeToken;
        exploreGeocoder.geocode({ location: center }, (results, status) => {
            if (token !== exploreGeocodeToken) { resolve(''); return; }   // a newer refresh superseded this one
            if (status !== 'OK' || !results || !results.length) { exploreCenterPlace = ''; resolve(''); return; }
            const label = pickExplorePlaceLabel(results, { coarse });
            exploreCenterPlace = label;
            if (label && typeof onResolved === 'function') onResolved(label);
            resolve(label);
        });
    });
}

// Great-circle distance between two {lat,lng} points, in kilometres.
function haversineKm(a, b) {
    const R = 6371;
    const toRad = d => d * Math.PI / 180;
    const dLat = toRad(b.lat - a.lat);
    const dLng = toRad(b.lng - a.lng);
    const s = Math.sin(dLat / 2) ** 2 +
        Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * Math.sin(dLng / 2) ** 2;
    return 2 * R * Math.asin(Math.sqrt(s));
}

// Ceiling on one geocoder round trip in the verification pass below.
const EXPLORE_VERIFY_TIMEOUT_MS = 6000;

// The model that picks explore discoveries occasionally returns a real place
// name with coordinates that land somewhere else entirely — e.g. "Slave Lake"
// pinned in the Nunavut Arctic instead of northern Alberta. Forward-geocode
// each name (biased to the current viewport so ambiguous names resolve
// locally) and, when Google gives a confident, specific match that sits well
// away from the model's coordinates, either snap the pin onto the geocoded
// location (still inside the viewport) or drop the discovery (the place it
// actually names isn't in this area). Names Google can't resolve — many
// natural features and historical sites — are left exactly as the model gave
// them. Resolves to a discovery (possibly with corrected lat/lng) or null.
function verifyDiscoveryLocation(discovery, b) {
    return new Promise(rawResolve => {
        // The whole batch waits on these (Promise.all in spawnDiscoveries), so
        // a geocoder callback that never arrives would hang the fetch — and
        // with it every future one, since exploreFetchInFlight would stay set.
        // Verification is only a correction pass: timing out means trusting
        // the model's own coordinates, which is the same as an unresolvable
        // name.
        let settled = false;
        const resolve = value => { if (!settled) { settled = true; rawResolve(value); } };
        setTimeout(() => resolve(discovery), EXPLORE_VERIFY_TIMEOUT_MS);
        if (!window.google || !google.maps || !google.maps.Geocoder) { resolve(discovery); return; }
        if (typeof discovery.lat !== 'number' || typeof discovery.lng !== 'number') { resolve(discovery); return; }
        if (!exploreGeocoder) exploreGeocoder = new google.maps.Geocoder();
        const bounds = new google.maps.LatLngBounds({ lat: b.s, lng: b.w }, { lat: b.n, lng: b.e });
        exploreGeocoder.geocode({ address: discovery.name, bounds }, (results, status) => {
            if (settled) return;
            if (status !== 'OK' || !results || !results.length) { resolve(discovery); return; }
            const top = results[0];
            // A partial or coarse (country/region/county) match says little
            // about where a specific site sits — don't second-guess the model
            // on it. ('political' is excluded: every town carries it alongside
            // its precise 'locality' type.)
            const coarse = (top.types || []).some(t => [
                'country', 'administrative_area_level_1', 'administrative_area_level_2',
                'continent',
            ].includes(t));
            if (top.partial_match || coarse) { resolve(discovery); return; }

            const loc = top.geometry && top.geometry.location;
            if (!loc) { resolve(discovery); return; }
            const geo = { lat: loc.lat(), lng: loc.lng() };
            const off = haversineKm(discovery, geo);
            // Only act on an unambiguous error — big features geocode to a
            // centroid that can sit tens of km from a real point on them.
            if (off <= 100) { resolve(discovery); return; }

            const latM = Math.min(Math.max((b.n - b.s) * 0.15, 0.02), 0.15);
            const lngM = Math.min(Math.max((b.e - b.w) * 0.15, 0.02), 0.15);
            const inView = geo.lat >= b.s - latM && geo.lat <= b.n + latM &&
                geo.lng >= b.w - lngM && geo.lng <= b.e + lngM;
            if (inView) {
                console.warn(`Explore: "${discovery.name}" was ${Math.round(off)} km off — snapped to geocoded location`);
                resolve({ ...discovery, lat: geo.lat, lng: geo.lng });
            } else {
                console.warn(`Explore: dropped "${discovery.name}" — geocodes ${Math.round(off)} km away, outside the viewport`);
                resolve(null);
            }
        });
    });
}

// Backstop for the fit-to-batch camera move below: how long to wait for the
// map's 'idle' before re-arming the pan/zoom listener regardless.
const EXPLORE_FIT_REARM_MS = 2500;

// Zooms/pans so every pin in the batch that just spawned is visible at once.
// Skipped for a single discovery — fitBounds on a near-zero-size bounds tends
// to over-zoom, and "show all of them" is trivially already true for one pin.
// fitBounds itself pans/zooms the map, which would otherwise fire
// bounds_changed and queue up yet another discovery fetch for the resulting
// viewport — pause the idle listener across the animation and resync
// exploreLastBounds once the map actually settles instead.
function fitExploreDiscoveries(batch) {
    if (!batch || batch.length < 2) return;
    const bounds = new google.maps.LatLngBounds();
    batch.forEach(d => bounds.extend({ lat: d.lat, lng: d.lng }));

    if (exploreIdleListener) {
        google.maps.event.removeListener(exploreIdleListener);
        exploreIdleListener = null;
    }

    // Re-arming is on a timeout as well as on 'idle', because 'idle' is not
    // guaranteed: a fitBounds that barely moves the camera (or doesn't move it
    // at all, when the batch already fits the current view) can settle without
    // firing one. When that happened, Explore lost its only pan/zoom listener
    // for the rest of the session — the map kept moving and nothing ever
    // spawned again. Whichever fires first wins; the other is a no-op.
    let rearmed = false;
    const rearm = () => {
        if (rearmed) return;
        rearmed = true;
        if (!exploreModeActive) return;   // exit/enter own the listener in that case
        const b = map.getBounds();
        if (b) {
            const ne = b.getNorthEast(), sw = b.getSouthWest();
            exploreLastBounds = { n: ne.lat(), s: sw.lat(), e: ne.lng(), w: sw.lng() };
        }
        attachExploreBoundsListener();
    };
    map.fitBounds(bounds, 60);
    google.maps.event.addListenerOnce(map, 'idle', rearm);
    setTimeout(rearm, EXPLORE_FIT_REARM_MS);
}

// Explore listens on 'bounds_changed' for every pan/zoom (see
// enterExploreMode for why, not 'idle'). Everything that (re)starts listening
// goes through here so the listener can never be attached twice, and — more
// importantly — so there's a single definition of "Explore is live again"
// for fitExploreDiscoveries to restore after it detaches.
function attachExploreBoundsListener() {
    if (!map) return;
    if (exploreIdleListener) google.maps.event.removeListener(exploreIdleListener);
    exploreIdleListener = map.addListener('bounds_changed', scheduleExploreCheck);
}

let exploreDebounceTimer = null;
function scheduleExploreCheck(immediate = false) {
    if (exploreDebounceTimer) { clearTimeout(exploreDebounceTimer); exploreDebounceTimer = null; }
    if (immediate) { exploreOnIdle(); return; }
    exploreDebounceTimer = setTimeout(() => { exploreDebounceTimer = null; exploreOnIdle(); }, 700);
}

// Whether the map has moved/zoomed enough since the last fetch to justify a
// new one — keeps idle events from tiny nudges (e.g. after smoothZoom, or a
// popout repositioning the map slightly) from refiring a spawn.
function exploreBoundsChangedEnough(b, prev = exploreLastBounds) {
    if (!prev) return true;
    const latSpan = b.n - b.s, lngSpan = b.e - b.w;
    const prevLatSpan = prev.n - prev.s, prevLngSpan = prev.e - prev.w;
    const movedLat = Math.abs(((b.n + b.s) / 2) - ((prev.n + prev.s) / 2));
    const movedLng = Math.abs(((b.e + b.w) / 2) - ((prev.e + prev.w) / 2));
    const spanChanged = Math.abs(latSpan - prevLatSpan) / (prevLatSpan || 1);
    return movedLat > latSpan * 0.4 || movedLng > lngSpan * 0.4 || spanChanged > 0.35;
}

function exploreOnIdle() {
    if (!exploreModeActive) return;
    // A fetch is already running for an earlier viewport. Don't queue a second
    // one now — but remember that the map has moved so spawnDiscoveries' finally
    // can kick off a fresh check for wherever the user has ended up.
    if (exploreFetchInFlight) { explorePendingRecheck = true; return; }
    if (Date.now() < exploreSuppressAutoFetchUntil) return;

    const zoom = map.getZoom();
    const bounds = map.getBounds();
    // Normally discoveries only spawn at EXPLORE_MIN_ZOOM+. For the session's
    // very first batch, though, honour the first zoom-in gesture: once the
    // user has zoomed in past where explore mode started, fetch at whatever
    // zoom they've reached (down to a sane floor) instead of making them keep
    // zooming. Every batch after the first uses the normal floor again.
    const firstZoomIn = !exploreFirstFetchDone
        && exploreEntryZoom !== null
        && zoom >= exploreEntryZoom + 0.5;
    const minZoom = firstZoomIn ? EXPLORE_FIRST_FETCH_MIN_ZOOM : EXPLORE_MIN_ZOOM;
    if (!bounds || zoom < minZoom) {
        // Too zoomed out to fetch a new batch, but any pins already found
        // stay put (see resetExploreDiscoveries for the way to clear them) —
        // wandering back out shouldn't erase what's already been discovered.
        if (exploreMarkers.length > 0) {
            setExploreBarStatus(`${exploreMarkers.length} place${exploreMarkers.length === 1 ? '' : 's'} discovered so far — zoom or pan in to find more`);
        } else {
            setExploreBarStatus('Zoom or pan in to discover places', { idle: true });
        }
        return;
    }

    const ne = bounds.getNorthEast(), sw = bounds.getSouthWest();
    const b = { n: ne.lat(), s: sw.lat(), e: ne.lng(), w: sw.lng() };
    if (!exploreBoundsChangedEnough(b)) return;

    spawnDiscoveries(b);
}

// Builds and drops a discovery pin onto the map, wiring up its hover/click
// behavior and photo-icon upgrade — shared by spawnDiscoveries (the "wander
// nearby" batch) and quickLoadExploreFollowUp (a related place surfaced from
// inside the detail panel, possibly far outside the current viewport).
function addExploreMarker(discovery) {
    exploreShownNames.push(discovery.name);
    const color = EXPLORE_CATEGORY_COLOR[discovery.category] || ACCENT_PRESETS.blue.accent;
    const marker = new google.maps.Marker({
        position: { lat: discovery.lat, lng: discovery.lng },
        map,
        title: discovery.name,
        icon: {
            url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(buildExplorePinSvg(EXPLORE_CATEGORY_EMOJI[discovery.category] || '✨', color)),
            scaledSize: new google.maps.Size(50, 64),
            anchor: new google.maps.Point(25, 60),
            // Hangs the label chip a bit below the pin's tip
            // rather than centered on the icon (the default),
            // so the title reads as a caption under the pin
            // instead of overlapping it.
            labelOrigin: new google.maps.Point(25, 74),
        },
        // Always-on title, in place of relying on the hover-only
        // #marker-popout teaser to say what a pin even is — see
        // .explore-pin-label in styles.css for the chip look.
        label: {
            text: discovery.name,
            className: 'explore-pin-label',
            color: '#fff',
            fontSize: '11px',
            fontWeight: '600',
        },
    });
    // Hover: quick teaser popout (unchanged). Click: pulls up the
    // full title/info/images view directly rather than doing a
    // search — see openExploreDetail. A full search only happens
    // if the user explicitly asks for one from inside that view.
    marker.addListener('mouseover', () => {
        const pos = getMarkerScreenPos(marker.position);
        if (pos) showExplorePopout(discovery, pos);
    });
    marker.addListener('mouseout', scheduleHideMarkerPopout);
    marker.addListener('click', () => openExploreDetail(discovery));

    // Upgrade the pin from a plain emoji badge to a photo
    // thumbnail once the discovery's Wikipedia image resolves —
    // same treatment search-result pins get (buildImageMarkerSvg/
    // setMarkerPinIcon), just with the category emoji kept as a
    // small corner badge instead of a number.
    marker._pinColor = color;
    marker._pinEmoji = EXPLORE_CATEGORY_EMOJI[discovery.category] || '✨';
    marker._pinImageDataUri = null;
    getDiscoveryLeadImage(discovery).then(imageUrl => {
        if (!imageUrl) return;
        fetchImageAsDataUri(imageUrl).then(dataUri => {
            if (!dataUri) return;
            marker._pinImageDataUri = dataUri;
            setExplorePinIcon(marker);
        });
    });

    exploreMarkers.push(marker);
    exploreDiscoveries.push(discovery);
    return marker;
}

// Ceiling on a single /explore-nearby round trip before it's abandoned.
const EXPLORE_FETCH_TIMEOUT_MS = 30000;
// How long a batch will wait on the reverse-geocoded place label before
// giving up on it and asking with coordinates alone.
const EXPLORE_PLACE_LABEL_WAIT_MS = 2000;
// Viewport signature of the last batch that arrived and then verified away to
// nothing, so that viewport gets exactly one automatic second attempt (see
// spawnDiscoveries) rather than either giving up immediately or looping.
let exploreEmptyRetryKey = null;
const exploreBoundsKey = b => [b.n, b.s, b.e, b.w].map(v => v.toFixed(2)).join(',');

async function spawnDiscoveries(b, { isRetry = false } = {}) {
    exploreFetchInFlight = true;
    explorePendingRecheck = false;  // this fetch covers the current viewport; only a move *after* now counts
    explorePendingRetry = false;
    exploreFirstFetchDone = true;   // relaxed first-fetch zoom floor is spent
    // The user has panned/zoomed enough to trigger a real discovery batch —
    // that's genuine engagement, so retire the load-in typewriter for good
    // (same as opening Curate or running a curated search).
    stopExploreBarTypewriter();
    // Fold any curation focus into the wording — "Discovering volcanoes near
    // Naples…" rather than a bare "Discovering nearby…".
    const subj = exploreFocus ? `${exploreFocus} ` : '';
    // Zoomed-out views search a whole region, so the status reads "across
    // Sichuan, China" / "…in view" rather than "near <city>".
    const wide = exploreViewportLongSideKm(b) > EXPLORE_WIDE_VIEW_KM;
    const prep = wide ? 'across' : 'near';
    const areaWord = wide ? 'in view' : 'nearby';
    setExploreBarStatus(exploreCenterPlace
        ? `Discovering ${subj}${prep} ${exploreCenterPlace}…`
        : `Discovering ${subj || areaWord}…`);
    document.getElementById('exploreBar')?.classList.add('loading');
    // Re-geocode the map center for this batch; if it resolves while the
    // fetch is still running, upgrade the bare "Discovering nearby…" to name
    // the place. Cached in exploreCenterPlace for the result-count line too.
    const centerPlacePromise = refreshExploreCenterPlace(label => {
        if (exploreFetchInFlight) setExploreBarStatus(`Discovering ${subj}${prep} ${label}…`);
    }, { coarse: wide });

    try {
        const center = map.getCenter();
        // The label goes to the server with the request. Coordinates alone
        // don't reliably tell the model where it's being asked about — a box
        // over central Vietnam came back full of Cambodian temples, which the
        // bounds check then binned as "nothing here" — so naming the region
        // ("Da Nang, Vietnam") is what keeps the batch on target. Capped short
        // so a slow or dead geocode delays the batch by no more than a moment;
        // the server just goes without the label in that case.
        const centerPlace = await Promise.race([
            centerPlacePromise.catch(() => ''),
            new Promise(r => setTimeout(() => r(''), EXPLORE_PLACE_LABEL_WAIT_MS)),
        ]);
        // Hard ceiling on the whole request. Without one, a request that never
        // comes back leaves exploreFetchInFlight stuck true and every later
        // pan/zoom silently no-ops for the rest of the session (exploreOnIdle
        // just marks a recheck that nothing will ever run).
        const abort = new AbortController();
        const abortTimer = setTimeout(() => abort.abort(), EXPLORE_FETCH_TIMEOUT_MS);
        let res;
        try {
            res = await fetch('/explore-nearby', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                signal: abort.signal,
                body: JSON.stringify({
                    lat: center.lat(), lng: center.lng(),
                    north: b.n, south: b.s, east: b.e, west: b.w,
                    exclude: exploreShownNames.slice(-40),
                    place: centerPlace || exploreCenterPlace || undefined,
                    focus: exploreFocus || undefined,
                    categories: exploreCurationCategoriesParam() || undefined,
                }),
            });
        } finally {
            clearTimeout(abortTimer);
        }
        // A failed request used to fall straight through here: res.json() gave
        // {error: ...} with no `discoveries`, which read as an empty batch and
        // reported "Nothing new found here — try panning further". A rate
        // limit, a spent token allowance or an upstream model error all looked
        // to the user like a region with nothing in it, and (because the empty
        // batch still recorded exploreLastBounds) panning back didn't retry.
        if (!res.ok) {
            const body = await res.json().catch(() => ({}));
            const err = new Error(`explore-nearby ${res.status}`);
            err.exploreUserMessage = res.status === 429
                ? (body.error || 'Daily free limit reached — log in for unlimited exploring.')
                : 'Couldn’t load places here — nudge the map to try again.';
            throw err;
        }
        const data = await res.json();
        const rawDiscoveries = Array.isArray(data.discoveries) ? data.discoveries : [];

        // Sanity-check each place against Google's geocoder before it hits the
        // map — corrects pins the model misplaced, drops ones that name a
        // place outside this area. Names it can't resolve pass through as-is.
        const verified = await Promise.all(rawDiscoveries.map(d => verifyDiscoveryLocation(d, b)));
        const discoveries = [];
        verified.forEach((d, i) => {
            // Drop anything outside the curated category set — the server is
            // asked to honour it, but the model doesn't always comply.
            if (d && exploreDiscoveryMatchesCuration(d)) discoveries.push(d);
            // Suppress a dropped name so the next batch doesn't re-suggest it.
            else if (rawDiscoveries[i]?.name) exploreShownNames.push(rawDiscoveries[i].name);
        });

        // The user may have left explore mode (or panned again) while this
        // was in flight — don't drop pins onto a map they're no longer on.
        if (!exploreModeActive) return;

        // The user may have panned/zoomed to a different area while the LLM
        // call was running. Dropping this (now-stale) batch there — and worse,
        // fitExploreDiscoveries yanking the map back to fit it — is exactly the
        // "results keep appearing in the old spot" glitch. Discard the batch and
        // let the finally-block schedule a fresh fetch for where they are now.
        const curBounds = map.getBounds();
        if (curBounds) {
            const cne = curBounds.getNorthEast(), csw = curBounds.getSouthWest();
            const cb = { n: cne.lat(), s: csw.lat(), e: cne.lng(), w: csw.lng() };
            if (exploreBoundsChangedEnough(cb, b)) {
                explorePendingRecheck = true;
                return;
            }
        }

        // The model named places and the geocoder put every one of them
        // somewhere else — a bad batch, not an empty patch of the world.
        // Take one more swing at this viewport (with those names now in the
        // exclude list, so it can't just repeat them) before reporting that
        // there's nothing here. Once per viewport: a second failure falls
        // through to the honest "nothing found" below.
        const boundsKey = exploreBoundsKey(b);
        if (!discoveries.length && rawDiscoveries.length && exploreEmptyRetryKey !== boundsKey) {
            exploreEmptyRetryKey = boundsKey;
            explorePendingRecheck = true;   // the finally block re-checks; exploreLastBounds stays unset
            return;
        }

        // A new batch normally means the user has wandered on from whatever
        // the detail panel was showing — close it. But if they still have a
        // location selected, leave its panel open and just drop the new pins
        // onto the map behind it (and skip the fit-to-bounds camera move
        // below, so the back map doesn't lurch while they're reading).
        const keepDetailOpen = !!exploreDetailDiscovery;
        if (!keepDetailOpen) closeExploreDetail();
        // Pins from earlier batches stay on the map — wandering off to a new
        // area shouldn't erase what was already discovered elsewhere. See
        // resetExploreDiscoveries() for the explicit "clear everything" action.
        const newBatch = [];
        if (discoveries.length === 0) {
            // An uncurated area coming back empty is almost always Haiku being
            // streaky, not a genuinely barren map — give it one more shot for
            // the same viewport before telling the user there's nothing here.
            // Curated/focused batches legitimately return nothing, so those
            // report straight away.
            if (!isRetry && !exploreFocus && !exploreCurationActive()) {
                explorePendingRetry = true;
            } else {
                setExploreBarStatus(
                    exploreFocus ? `No “${exploreFocus}” places here — try panning, or change your focus`
                    : exploreCurationActive() ? 'Nothing in those categories here — try panning, or add categories'
                    : 'Nothing new found here — try panning further');
                // Only remember this viewport as "covered" once we've settled
                // on nothing — otherwise a small nudge back should retry rather
                // than being brushed off by exploreBoundsChangedEnough.
                exploreLastBounds = b;
            }
        } else {
            discoveries.forEach(discovery => {
                addExploreMarker(discovery);
                newBatch.push(discovery);
            });
            if (exploreShownNames.length > 200) exploreShownNames = exploreShownNames.slice(-120);
            const noun = exploreFocus
                ? `“${exploreFocus}” place${discoveries.length === 1 ? '' : 's'}`
                : `place${discoveries.length === 1 ? '' : 's'}`;
            setExploreBarStatus(`${discoveries.length} ${noun} ${exploreCenterPlace ? `${prep} ${exploreCenterPlace}` : areaWord}`);
            if (!keepDetailOpen) fitExploreDiscoveries(newBatch);
        }
        exploreLastBounds = b;
    } catch (error) {
        console.error('Error fetching /explore-nearby:', error);
        // exploreLastBounds is deliberately left alone on this path, so the
        // same viewport counts as "changed enough" to fetch again on the next
        // nudge instead of being remembered as already covered.
        if (exploreModeActive) {
            setExploreBarStatus(error && error.name === 'AbortError'
                ? 'That took too long — nudge the map to try again'
                : (error && error.exploreUserMessage) || 'Couldn’t reach the server — try panning again');
        }
    } finally {
        exploreFetchInFlight = false;
        document.getElementById('exploreBar')?.classList.remove('loading');
        // The map moved while this fetch ran (or its results were stale on
        // arrival) — check the current viewport now that we're free to fetch
        // again. Debounced, so an actively-panning user settles first.
        if (explorePendingRecheck && exploreModeActive) {
            explorePendingRecheck = false;
            scheduleExploreCheck();
        }
    }
}

function diveIntoDiscovery(discovery) {
    hideMarkerPopout();
    exitExploreMode({ skipMarkerRestore: true });
    document.getElementById('questionInput').value = discovery.name;
    askQuestion();
}

// ============== EXPLORE DETAIL PANELS ==============
// The "pull up the view" panels opened by clicking a discovery pin —
// #edpTitleBar (title, top-center), #edpSummaryPanel (write-up, left) and
// #edpImagePanel (image(s) + street view, right) — laid out exactly like the
// normal per-location view (#summaryTitleBar/#questionBox/#currentImagePanel),
// but for a single standalone place. A full search (diveIntoDiscovery) only
// happens if the user explicitly asks for it via #edpDeepDiveBtn; otherwise
// "Where to next" (renderExploreFollowUps) lets them quick-load a related
// place — possibly far away, tied by history/theme rather than proximity —
// without ever leaving this lightweight view.

const EXPLORE_DETAIL_PANEL_IDS = ['edpTitleBar', 'edpSummaryPanel', 'edpImagePanel'];

function openExploreDetail(discovery) {
    hideMarkerPopout();
    closeExploreCuratePanel();
    document.body.classList.add('explore-detail-open');
    exploreDetailDiscovery = discovery;
    const requestId = ++exploreDetailRequestId;

    // Title/summary always show, but the image panel stays hidden until an
    // image actually turns up — same as #currentImagePanel in the normal
    // per-location view (see setCurrentImage), rather than showing an empty
    // frame with just the placeholder emoji.
    document.getElementById('edpTitleBar')?.classList.add('visible');
    document.getElementById('edpSummaryPanel')?.classList.add('visible');
    document.getElementById('edpImagePanel')?.classList.remove('visible');
    document.getElementById('edpSummaryPanel').scrollTop = 0;

    document.getElementById('edpCategory').textContent = EXPLORE_CATEGORY_LABEL[discovery.category] || '';
    document.getElementById('edpTitle').textContent = discovery.name;
    document.getElementById('edpCoords').textContent = formatLocationMeta(discovery).coords;
    // Show the teaser straight away, with a loading row beneath it so it's
    // clear a fuller write-up is still on its way (the /location-summary fetch
    // below replaces this whole block once it lands).
    const edpSummaryLoadingRow =
        '<div class="edp-summary-loading">' +
        '<span class="loading-dots"><span></span><span></span><span></span></span>' +
        '<span class="edp-summary-loading-label">Loading full summary…</span>' +
        '</div>';
    document.getElementById('edpSummary').innerHTML = discovery.teaser
        ? marked.parse(discovery.teaser) + edpSummaryLoadingRow
        : edpSummaryLoadingRow;

    const img = document.getElementById('edpImg');
    const placeholder = document.getElementById('edpImgPlaceholder');
    const imgDesc = document.getElementById('edpImgDesc');
    img.src = '';
    img.style.display = 'none';
    placeholder.style.display = 'none';
    imgDesc.textContent = '';
    document.getElementById('edpExtraImages').innerHTML = '';

    renderExploreFollowUps(discovery);
    checkStreetView(discovery.lat, discovery.lng, () => exploreDetailRequestId !== requestId);

    getDiscoveryImageInfo(discovery).then(({ imageUrl, articleUrl, extract }) => {
        if (requestId !== exploreDetailRequestId) return; // panel moved on to something else
        if (imageUrl) {
            img.src = imageUrl;
            img.style.display = '';
            img.dataset.caption = extract || '';
            placeholder.style.display = 'none';
            document.getElementById('edpImagePanel')?.classList.add('visible');
        }
        if (extract) imgDesc.textContent = extract;
        if (articleUrl) {
            fetchExtraImages(articleUrl, imageUrl).then(items => {
                if (requestId !== exploreDetailRequestId) return;
                // No lead thumbnail on the article, but it has pictures in its
                // body — promote the first into the main slot rather than
                // leaving the whole image panel hidden (which read as "this
                // place has no photos"). The rest still fill the strip below.
                if (!imageUrl && items.length) {
                    const lead = items.shift();
                    img.src = extraImageUrl(lead);
                    img.style.display = '';
                    img.dataset.caption = extraImageCaption(lead) || '';
                    placeholder.style.display = 'none';
                    if (!imgDesc.textContent) imgDesc.textContent = extraImageCaption(lead);
                    document.getElementById('edpImagePanel')?.classList.add('visible');
                }
                const grid = document.getElementById('edpExtraImages');
                grid.innerHTML = '';
                items.forEach(it => {
                    const el = document.createElement('img');
                    el.src = extraImageUrl(it);
                    el.dataset.caption = extraImageCaption(it);
                    el.addEventListener('click', () => selectExploreDetailImage(el));
                    grid.appendChild(el);
                });
                // The extra-images grid can grow the image panel after the
                // street view thumbnail below it was already positioned —
                // nudge it back into place, same as setExtraImages() does
                // for the real per-location view.
                const svSlot = document.getElementById('loc-streetview-slot');
                if (svSlot && svSlot.style.display !== 'none') positionStreetViewSlot();
            });
        }
    });

    fetch('/location-summary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: discovery.name, locationName: discovery.name, event: discovery.teaser, year: null }),
    }).then(r => r.json()).then(({ summary }) => {
        if (requestId !== exploreDetailRequestId) return;
        const cleanSummary = (summary || '').replace(/^\s*#{1,6}\s+.+?\s*\n+/, '');
        document.getElementById('edpSummary').innerHTML = cleanSummary
            ? marked.parse(cleanSummary)
            : (discovery.teaser ? marked.parse(discovery.teaser) : '');
    }).catch(() => {
        if (requestId !== exploreDetailRequestId) return;
        document.getElementById('edpSummary').innerHTML = discovery.teaser ? marked.parse(discovery.teaser) : '';
    });
}

function closeExploreDetail() {
    document.body.classList.remove('explore-detail-open');
    if (!exploreDetailDiscovery) return;
    exploreDetailDiscovery = null;
    exploreDetailRequestId++; // void any in-flight fetches for the closed panel
    EXPLORE_DETAIL_PANEL_IDS.forEach(id => document.getElementById(id)?.classList.remove('visible'));
    const svSlot = document.getElementById('loc-streetview-slot');
    if (svSlot) { svSlot.style.display = 'none'; svSlot.innerHTML = ''; }
    locStreetViewPano = null;
}

function selectExploreDetailImage(thumb) {
    const img = document.getElementById('edpImg');
    const descEl = document.getElementById('edpImgDesc');
    const url = thumb && thumb.src;
    if (!url || url === img.src) return;

    const prevSrc = img.src;
    const prevCaption = img.dataset.caption || '';
    const newCaption = thumb.dataset.caption || '';
    if (prevSrc) { thumb.src = prevSrc; thumb.dataset.caption = prevCaption; }

    img.src = url;
    img.dataset.caption = newCaption;
    img.style.display = '';
    document.getElementById('edpImgPlaceholder').style.display = 'none';
    if (descEl) descEl.textContent = newCaption;
}

// Keyed by discovery name -> Promise<discovery[]>, so hopping back to a place
// already looked at (via a follow-up card) doesn't refire the network call.
let exploreRelatedCache = {};

// "Where to next" — follow-up places tied to this one by history/theme/story
// rather than by what happens to already be pinned nearby, so they can be
// anywhere in the world (see /explore-related). Each card quick-loads its
// place straight into this same lightweight detail view; only the explicit
// "Full search deep dive" button hands off to the full search pipeline.
function renderExploreFollowUps(discovery) {
    const list = document.getElementById('edpSimilarList');
    const requestId = exploreDetailRequestId;
    list.innerHTML = '<div class="explore-followups-loading">Finding what\'s next…</div>';

    getExploreRelated(discovery).then(related => {
        if (exploreDetailRequestId !== requestId) return; // panel moved on
        if (!related.length) {
            list.innerHTML = '';
            return;
        }
        list.innerHTML = related.map((d, i) => `
            <button type="button" class="explore-similar-card" data-followup-index="${i}">
                <span class="explore-similar-card-emoji">${EXPLORE_CATEGORY_EMOJI[d.category] || '✨'}</span>
                <span class="explore-similar-card-text">
                    <span class="explore-similar-card-name">${d.name}</span>
                    <span class="explore-similar-card-teaser">${d.teaser || ''}</span>
                </span>
            </button>
        `).join('');
        list.querySelectorAll('.explore-similar-card').forEach((btn, i) => {
            btn.addEventListener('click', () => quickLoadExploreFollowUp(related[i]));
        });
    }).catch(() => {
        if (exploreDetailRequestId !== requestId) return;
        list.innerHTML = '';
    });
}

function getExploreRelated(discovery) {
    if (exploreRelatedCache[discovery.name]) return exploreRelatedCache[discovery.name];
    const promise = fetch('/explore-related', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            name: discovery.name,
            teaser: discovery.teaser,
            category: discovery.category,
            exclude: exploreShownNames.slice(-40),
            focus: exploreFocus || undefined,
            categories: exploreCurationCategoriesParam() || undefined,
        }),
    }).then(r => (r.ok ? r.json() : Promise.reject(new Error(`explore-related ${r.status}`))))
      .then(data => (Array.isArray(data.related) ? data.related : []))
      .catch(err => {
          console.error('Error fetching /explore-related:', err);
          return [];
      })
      .then(related => {
          // Only a real, non-empty answer is worth remembering — caching a
          // failure would leave "Where to next" permanently blank for this
          // place, with no way to retry short of a reload.
          if (!related.length) delete exploreRelatedCache[discovery.name];
          return related;
      });
    exploreRelatedCache[discovery.name] = promise;
    return promise;
}

// A follow-up card is a quick look, not a full dive: drop its pin (or reuse
// one already on the map), pan the map to it — which may be well outside the
// current viewport — and swap the detail panel straight to it. Panning during
// explore mode normally queues up a fresh "wander nearby" fetch once the map
// settles (see scheduleExploreCheck/exploreOnIdle); that fetch would close
// this very panel a moment after it opens, so the auto-fetch is suppressed
// for a few seconds rather than left to fire on this programmatic move.
function quickLoadExploreFollowUp(discovery) {
    hideMarkerPopout();
    const existing = exploreDiscoveries.find(d => d.name === discovery.name);
    const target = existing || discovery;
    if (!existing) addExploreMarker(discovery);

    exploreSuppressAutoFetchUntil = Date.now() + 4000;
    map.panTo({ lat: target.lat, lng: target.lng });
    smoothZoom(getLocationZoom());

    openExploreDetail(target);
}

function deepDiveExploreDetail() {
    if (!exploreDetailDiscovery) return;
    diveIntoDiscovery(exploreDetailDiscovery);
}

function startIntroPlayback() {
    if (activeLocations.length === 0) return;

    // Hide all markers and polyline so we can animate them in from scratch
    activeMarkers.forEach(m => m.setMap(null));
    activePolylines.forEach(p => p.setMap(null));
    activePolylines = [];

    playbackActive = true;
    playbackHighlightIndex = null;

    const getAnimPolyline = makeAnimPolylineFactory(activeLocations);

    const STEP_MS = 215; // 7× faster than the manual play button (1500ms)

    activeLocations.forEach((loc, i) => {
        playbackTimeouts.push(setTimeout(() => {
            if (!playbackActive) return;
            activeMarkers[i].setAnimation(google.maps.Animation.DROP);
            activeMarkers[i].setMap(map);
            getAnimPolyline(loc).getPath().push(new google.maps.LatLng(loc.lat, loc.lng));
            playbackHighlightIndex = i + 1;
            timelineRecenter();
            if (i === activeLocations.length - 1) {
                playbackTimeouts.push(setTimeout(() => stopPlayback(true), 800));
            }
        }, i * STEP_MS));
    });
}

function stopPlayback(finished = false) {
    playbackActive = false;
    playbackHighlightIndex = null;
    playbackTimeouts.forEach(clearTimeout);
    playbackTimeouts = [];

    if (activeLocations.length > 0) {
        // Always replace the incrementally-built animation polyline (which grows in
        // chronological reveal order and can backtrack across the map — see
        // drawRoutePolylines) with the final static route once playback stops, whether
        // it finished naturally or was interrupted.
        if (!finished) activeMarkers.forEach(m => m.setMap(map));
        activePolylines.forEach(p => p.setMap(null));
        activePolylines = [];
        drawRoutePolylines(activeLocations);
    }

    updateTimelineNav();
    timelineRecenter();
}

// Colors for the two-subject "compare" shading mode — kept visually distinct from
// each other and from the single-subject country (indigo) / region (orange) colors.
const COMPARE_COLORS = {
    A: { light: '#f97316', dark: '#fb923c' }, // orange — same family as single-region shading
    B: { light: '#0ea5e9', dark: '#38bdf8' }, // sky blue
};

function countryShadeStyle(isLight) {
    return {
        fillColor: isLight ? '#6366f1' : '#818cf8',
        fillOpacity: 0.12,
        strokeColor: isLight ? '#6366f1' : '#818cf8',
        strokeWeight: 2,
        strokeOpacity: 0.75,
    };
}

function regionShadeStyle(isLight) {
    return {
        fillColor: isLight ? '#f97316' : '#fb923c',
        fillOpacity: 0.1,
        strokeColor: isLight ? '#f97316' : '#fb923c',
        strokeWeight: 1.5,
        strokeOpacity: 0.65,
    };
}

// Style function for compare mode — colors each GeoJson feature by the
// 'group' property tagged on it when it was added (see fetchCompareShading).
function compareShadeStyleFn(isLight) {
    return (feature) => {
        const group = feature.getProperty('group') === 'B' ? 'B' : 'A';
        const c = COMPARE_COLORS[group];
        const color = isLight ? c.light : c.dark;
        return {
            fillColor: color,
            fillOpacity: 0.13,
            strokeColor: color,
            strokeWeight: 1.5,
            strokeOpacity: 0.7,
        };
    };
}

// Re-applies the correct map.data style for whatever shading mode is currently
// active. Called both right after shading is fetched and whenever the app
// theme toggles (light/dark colors differ).
function applyShadingStyle() {
    const isLight = document.body.classList.contains('theme-light');
    if (activeShading === 'country') {
        map.data.setStyle(countryShadeStyle(isLight));
    } else if (activeShading === 'region') {
        map.data.setStyle(regionShadeStyle(isLight));
    } else if (activeShading === 'compare') {
        map.data.setStyle(compareShadeStyleFn(isLight));
    }
}

async function fetchGeoJsonFor(name) {
    try {
        const res = await fetch(
            `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(name)}&polygon_geojson=1&format=json&limit=1`,
            { headers: { 'Accept-Language': 'en' } }
        );
        if (!res.ok) return null;
        const data = await res.json();
        if (!data.length || !data[0].geojson) return null;
        return data[0].geojson;
    } catch { return null; }
}

async function fetchCountryOutline(country) {
    const geojson = await fetchGeoJsonFor(country);
    if (!geojson) return;
    map.data.addGeoJson({ type: 'Feature', geometry: geojson, properties: {} });
    applyShadingStyle();
}

async function fetchRegionShading(countries) {
    const results = await Promise.allSettled(countries.map(fetchGeoJsonFor));
    results.forEach(r => {
        if (r.status !== 'fulfilled' || !r.value) return;
        map.data.addGeoJson({ type: 'Feature', geometry: r.value, properties: {} });
    });
    applyShadingStyle();
}

// Two-subject compare shading: fetches each subject's country/region_countries
// independently and tags every feature it adds with which subject ('A'/'B') it
// belongs to, so compareShadeStyleFn can color them differently.
async function fetchCompareShading(mainLocs) {
    for (const loc of mainLocs) {
        const group = loc.compare_group === 'B' ? 'B' : 'A';
        const names = loc.region_countries?.length ? loc.region_countries : (loc.country ? [loc.country] : []);
        if (!names.length) continue;
        const results = await Promise.allSettled(names.map(fetchGeoJsonFor));
        results.forEach(r => {
            if (r.status !== 'fulfilled' || !r.value) return;
            map.data.addGeoJson({ type: 'Feature', geometry: r.value, properties: { group } });
        });
    }
    applyShadingStyle();
}

function getMarkerScreenPos(latlng) {
    const proj = map.getProjection();
    const bounds = map.getBounds();
    if (!proj || !bounds) return null;
    const mapDiv = document.getElementById('map');
    const mapRect = mapDiv.getBoundingClientRect();
    const scale = Math.pow(2, map.getZoom());
    const nw = new google.maps.LatLng(bounds.getNorthEast().lat(), bounds.getSouthWest().lng());
    const wNW = proj.fromLatLngToPoint(nw);
    const wPt = proj.fromLatLngToPoint(latlng);
    return {
        x: mapRect.left + (wPt.x - wNW.x) * scale,
        y: mapRect.top + (wPt.y - wNW.y) * scale,
    };
}

// Anchors #marker-popout to a screen point and picks which way it opens.
// It defaults to opening upward (see the CSS transform on #marker-popout),
// which clips off-screen when the anchor — a pin, or an icon like the
// explore bar buttons — sits near the top of the viewport; in that case we
// flip it to open downward instead via the .flip-down class. Uses the
// popout's real rendered height when it's already visible (repositioning
// while hovering between markers), falling back to a conservative estimate
// for the first show, when it's still display:none and reports 0 height.
function positionMarkerPopout(popout, screenPos) {
    popout.style.left = screenPos.x + 'px';
    popout.style.top = screenPos.y + 'px';
    const gap = 28;
    const estimatedHeight = popout.offsetHeight || 300;
    const opensOffscreen = (screenPos.y - estimatedHeight - gap) < 8;
    popout.classList.toggle('flip-down', opensOffscreen);
}

function showMarkerPopoutForLocation(location, index, screenPos) {
    if (activePopoutIndex === index) {
        // Just reposition if already showing
        const popout = document.getElementById('marker-popout');
        positionMarkerPopout(popout, screenPos);
        return;
    }
    activePopoutIndex = index;

    const popout = document.getElementById('marker-popout');
    const [title, ...descParts] = (location.name || '').split('—');
    const place = title.trim();
    const event = descParts.join('—').trim();
    const yearStr = location.year != null
        ? (location.year < 0 ? `${Math.abs(location.year)} BCE` : String(location.year))
        : null;

    popout.querySelector('.mp-name').textContent = place;
    const yearEl = popout.querySelector('.mp-year');
    yearEl.textContent = yearStr || '';
    yearEl.style.display = yearStr ? '' : 'none';
    const eventEl = popout.querySelector('.mp-event');
    eventEl.textContent = event || '';
    eventEl.style.display = event ? '' : 'none';

    const img = document.getElementById('mp-img');
    const placeholder = popout.querySelector('.mp-img-placeholder');
    const extractEl = popout.querySelector('.mp-extract');
    const imgDescEl = document.getElementById('mp-img-desc');

    const cached = locationImageCache[index];
    if (cached) {
        if (cached.imageUrl) {
            img.src = cached.imageUrl;
            img.style.display = '';
            placeholder.style.display = 'none';
        } else {
            img.style.display = 'none';
            placeholder.style.display = '';
        }
        popout.classList.toggle('no-img', !cached.imageUrl);
        if (cached.extract) {
            extractEl.textContent = cached.extract;
            extractEl.style.display = '';
            imgDescEl.textContent = cached.extract;
        } else {
            extractEl.style.display = 'none';
            imgDescEl.textContent = '';
        }
    } else {
        img.style.display = 'none';
        placeholder.style.display = '';
        popout.classList.add('no-img');
        extractEl.style.display = 'none';
        imgDescEl.textContent = '';
        fetchLocationImage(location).then(({ imageUrl, extract }) => {
            locationImageCache[index] = { imageUrl, extract };
            if (activePopoutIndex !== index) return;
            popout.classList.toggle('no-img', !imageUrl);
            if (imageUrl) { img.src = imageUrl; img.style.display = ''; placeholder.style.display = 'none'; }
            if (extract) { extractEl.textContent = extract; extractEl.style.display = ''; imgDescEl.textContent = extract; }
        });
    }

    positionMarkerPopout(popout, screenPos);
    popout.classList.remove('visible');
    // Force reflow so animation replays
    void popout.offsetWidth;
    popout.classList.add('visible');
}

function hideMarkerPopout() {
    if (popoutHideTimer) { clearTimeout(popoutHideTimer); popoutHideTimer = null; }
    if (activePopoutIndex === null && activeExploreDiscovery === null) return;
    activePopoutIndex = null;
    activeExploreDiscovery = null;
    document.getElementById('marker-popout').classList.remove('visible');
}

// Marker mouseout hides the popout after a short grace period rather than
// instantly, so moving the cursor from a small pin up to the popout card
// itself (which is clickable to open the location) doesn't close it out from
// under the mouse mid-move. Cancelled by hideMarkerPopout (a fresh
// show*Popout call, or the popout being clicked/re-entered) or resumed by
// re-hovering out of the popout itself — see the mouseenter/mouseleave
// wiring on #marker-popout in initMap.
let popoutHideTimer = null;
function scheduleHideMarkerPopout() {
    if (popoutHideTimer) clearTimeout(popoutHideTimer);
    popoutHideTimer = setTimeout(() => { popoutHideTimer = null; hideMarkerPopout(); }, 250);
}

function dismissMarkerPopout() {
    hideMarkerPopout();
}

function handlePopoutClick() {
    if (activeExploreDiscovery) {
        openExploreDetail(activeExploreDiscovery);
        return;
    }
    if (activePopoutIndex === null) return;
    const idx = activePopoutIndex;
    const loc = activeLocations[idx - 1];
    hideMarkerPopout();
    focusLocation(loc, idx);
}

// Explore-mode counterpart to showMarkerPopoutForLocation above — same
// #marker-popout DOM/CSS, populated from a lightweight discovery object
// instead of an indexed activeLocations entry. Year/event rows are hidden
// since discoveries don't carry them; the image comes from a live Wikipedia
// lookup by name (same helper used for the topic hero image) rather than
// anything the model supplied. handlePopoutClick() branches on
// activeExploreDiscovery to dive in instead of calling focusLocation().
function showExplorePopout(discovery, screenPos) {
    if (activeExploreDiscovery === discovery) {
        const popout = document.getElementById('marker-popout');
        positionMarkerPopout(popout, screenPos);
        return;
    }
    activePopoutIndex = null;
    activeExploreDiscovery = discovery;

    const popout = document.getElementById('marker-popout');
    popout.querySelector('.mp-name').textContent = discovery.name;
    popout.querySelector('.mp-year').style.display = 'none';
    popout.querySelector('.mp-event').style.display = 'none';

    const img = document.getElementById('mp-img');
    const placeholder = popout.querySelector('.mp-img-placeholder');
    const extractEl = popout.querySelector('.mp-extract');
    const imgDescEl = document.getElementById('mp-img-desc');

    img.style.display = 'none';
    placeholder.style.display = '';
    popout.classList.add('no-img');
    if (discovery.teaser) {
        extractEl.textContent = discovery.teaser;
        extractEl.style.display = '';
        imgDescEl.textContent = discovery.teaser;
    } else {
        extractEl.style.display = 'none';
        imgDescEl.textContent = '';
    }

    getDiscoveryLeadImage(discovery).then(imageUrl => {
        if (activeExploreDiscovery !== discovery) return;
        if (!imageUrl) return;
        img.src = imageUrl;
        img.style.display = '';
        placeholder.style.display = 'none';
        popout.classList.remove('no-img');
    });

    positionMarkerPopout(popout, screenPos);
    popout.classList.remove('visible');
    void popout.offsetWidth;
    popout.classList.add('visible');
}

function processResponse(data, imageUrl = null, articleUrl = null, extract = null) {
    if (!data.answer) {
        document.getElementById("answer").innerHTML = "No response received.";
        return;
    }

    const { summary: rawSummary, locations, related, periods } = parseLocations(data.answer);

    // The model occasionally opens with a title heading despite the system
    // prompt not asking for one. Strip it out and use it as the title-bar
    // text instead of showing it a second time atop the summary card — the
    // card should start straight into the hook sentence, no header of its
    // own, since the full title now lives entirely in #summaryTitleBar.
    const titleMatch = rawSummary.match(/^\s*#{1,6}\s+(.+?)\s*\n+/);
    const summary = titleMatch ? rawSummary.slice(titleMatch[0].length) : rawSummary;
    if (titleMatch) {
        const displayedQuestionEl = document.getElementById('displayedQuestion');
        if (displayedQuestionEl) displayedQuestionEl.innerText = titleMatch[1].trim();
    }

    // Split the hook/intro from the rest (## headings)
    const firstHeadingIdx = summary.indexOf('\n##');
    const intro = firstHeadingIdx !== -1 ? summary.slice(0, firstHeadingIdx).trim() : '';
    const bodyMarkdown = firstHeadingIdx !== -1 ? summary.slice(firstHeadingIdx).trim() : summary;

    const introHTML = intro
        ? `<div class="answer-hero">${marked.parse(intro)}</div>`
        : '';

    topicImageUrl = imageUrl || null;
    topicExtraImages = [];
    topicImageDesc = extract || null;
    setCurrentImage(topicImageUrl, topicExtraImages, topicImageDesc);
    if (articleUrl) {
        fetchExtraImages(articleUrl, topicImageUrl).then(urls => {
            topicExtraImages = urls;
            setExtraImages(urls);
        });
    }

    const sourceHTML = articleUrl
        ? `<div class="source-line">Source: <a href="${articleUrl}" target="_blank" rel="noopener noreferrer">Wikipedia</a></div>`
        : '';

    const relatedHTML = related.length > 0
        ? `<div class="related-section">
            <div class="related-label">Explore further</div>
            <div class="related-chips">${related.map(r => `<button class="related-chip" onclick="searchRelated('${r.replace(/'/g, "\\'")}')">${r}</button>`).join('')}</div>
           </div>`
        : '';

    document.getElementById("answer").innerHTML = introHTML + marked.parse(bodyMarkdown) + sourceHTML
        + `<div class="fact-check-note" id="factCheckNote" hidden></div>` + relatedHTML;

    // Quietly cross-check the opening claim against the Wikipedia extract in
    // the background. Only ever adds a badge — never blocks or alters the
    // rendered answer — and is skipped entirely if there's nothing to check.
    if (intro && extract) {
        const factCheckEl = document.getElementById('factCheckNote');
        factCheckOverview(intro, extract).then(result => {
            if (!result || !result.flag || !document.body.contains(factCheckEl)) return;
            factCheckEl.textContent = `⚠ ${result.note || 'This may conflict with Wikipedia — worth double-checking.'}`;
            factCheckEl.hidden = false;
        });
    }
    document.getElementById("voiceControls").style.display = "flex";
    const autoplayBtn = document.getElementById('autoplayBtn');
    if (autoplayBtn) {
        autoplayBtn.textContent = '▶';
        autoplayBtn.classList.remove('autoplay-active');
        autoplayBtn.disabled = locations.length === 0;
    }
    activeLocations = locations;
    renderHeaderState();

    if (locations.length === 0) return;

    annotateLocationsInSummary(locations);
    renderMarkers(locations, periods);
    startIntroPlayback();

    // Warm the first several stops now so clicking "Start →" and then
    // arrowing through Next a few times in a row is instant, without
    // waiting for each one to trigger the next (see PREFETCH_LOOKAHEAD
    // in focusLocation for why a wider window matters here).
    const order = timelineOrderedIndices();
    for (let i = 0; i < Math.min(4, order.length); i++) prefetchLocationSummary(order[i]);
}

function yearToColor(year, minYear, maxYear) {
    if (year === null || year === undefined || minYear === maxYear) return '#9333ea';
    const t = Math.max(0, Math.min(1, (year - minYear) / (maxYear - minYear)));
    // Oldest: purple #9333ea → middle: pink #ec4899 → newest: orange #f97316
    let r, g, b;
    if (t < 0.5) {
        const u = t * 2;
        r = Math.round(0x93 + u * (0xec - 0x93));
        g = Math.round(0x33 + u * (0x48 - 0x33));
        b = Math.round(0xea + u * (0x99 - 0xea));
    } else {
        const u = (t - 0.5) * 2;
        r = Math.round(0xec + u * (0xf9 - 0xec));
        g = Math.round(0x48 + u * (0x73 - 0x48));
        b = Math.round(0x99 + u * (0x16 - 0x99));
    }
    return `rgb(${r},${g},${b})`;
}

// Distinct hue per route, each interpolating dark (early stop) → light (late stop)
const ROUTE_PALETTES = [
    { dark: [30, 58, 138], light: [147, 197, 253] },   // blue
    { dark: [136, 19, 55], light: [253, 164, 175] },   // rose
    { dark: [6, 78, 59], light: [110, 231, 183] },     // emerald
    { dark: [120, 53, 15], light: [252, 211, 77] },    // amber
    { dark: [76, 29, 149], light: [196, 181, 253] },   // violet
    { dark: [22, 78, 99], light: [103, 232, 249] },    // cyan
];

function routeColor(paletteIndex, t) {
    const p = ROUTE_PALETTES[paletteIndex % ROUTE_PALETTES.length];
    const c = Math.max(0, Math.min(1, t));
    const r = Math.round(p.dark[0] + (p.light[0] - p.dark[0]) * c);
    const g = Math.round(p.dark[1] + (p.light[1] - p.dark[1]) * c);
    const b = Math.round(p.dark[2] + (p.light[2] - p.dark[2]) * c);
    return `rgb(${r},${g},${b})`;
}

// Marker/route colors range down into quite dark, saturated tones — fine for
// a pin (white number + drop shadow keep it legible) but too low-contrast
// for body text on the dark summary panel. Floors the HSL lightness before
// using one of these colors for text, without touching the hue/saturation
// that ties it back to the marker.
function readableTextColor(colorString, minLightness = 60) {
    const rgbMatch = colorString.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
    const hexMatch = !rgbMatch && colorString.match(/^#([0-9a-f]{6})$/i);
    let rVal, gVal, bVal;
    if (rgbMatch) {
        [rVal, gVal, bVal] = [rgbMatch[1], rgbMatch[2], rgbMatch[3]].map(Number);
    } else if (hexMatch) {
        const hex = hexMatch[1];
        rVal = parseInt(hex.slice(0, 2), 16);
        gVal = parseInt(hex.slice(2, 4), 16);
        bVal = parseInt(hex.slice(4, 6), 16);
    } else {
        return colorString;
    }
    let [r, g, b] = [rVal, gVal, bVal].map(v => v / 255);
    const max = Math.max(r, g, b), min = Math.min(r, g, b);
    let h, s, l = (max + min) / 2;
    if (max === min) {
        h = s = 0;
    } else {
        const d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
        switch (max) {
            case r: h = (g - b) / d + (g < b ? 6 : 0); break;
            case g: h = (b - r) / d + 2; break;
            default: h = (r - g) / d + 4;
        }
        h /= 6;
    }
    l = Math.max(l, minLightness / 100);
    const hue2rgb = (p, q, t) => {
        if (t < 0) t += 1;
        if (t > 1) t -= 1;
        if (t < 1 / 6) return p + (q - p) * 6 * t;
        if (t < 1 / 2) return q;
        if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
        return p;
    };
    let r2, g2, b2;
    if (s === 0) {
        r2 = g2 = b2 = l;
    } else {
        const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
        const p = 2 * l - q;
        r2 = hue2rgb(p, q, h + 1 / 3);
        g2 = hue2rgb(p, q, h);
        b2 = hue2rgb(p, q, h - 1 / 3);
    }
    return `rgb(${Math.round(r2 * 255)},${Math.round(g2 * 255)},${Math.round(b2 * 255)})`;
}

// Returns Map(routeId -> paletteIndex) only when 2+ distinct routes are present, else null
function getRouteGroups(locations) {
    const ids = [...new Set(locations.map(l => l.route).filter(r => r !== null && r !== undefined))];
    if (ids.length < 2) return null;
    ids.sort((a, b) => a - b);
    const groups = new Map();
    ids.forEach((id, i) => groups.set(id, i));
    return groups;
}

// Draws either one solid polyline (single-route/legacy case) or one gradient polyline per
// route, colored dark→light along each route's own sequence, when multiple routes exist.
function drawRoutePolylines(locations) {
    const routeGroups = getRouteGroups(locations);
    if (!routeGroups) {
        // A "compare" answer's locations aren't a single traceable path — they're
        // two unrelated subjects' locations interleaved in the array. Drawing one
        // line through all of them would draw a stray connector between the two
        // subjects, so skip the default connecting line entirely here.
        if (locations.some(l => l.compare_group)) return;
        if (locations.length < 2) return;
        // activeLocations is sorted chronologically (for timeline/numbering), which can
        // put same-journey stops out of physical order when only some have precise years
        // (e.g. most Oregon Trail stops tagged 1841, but a fort tagged by its founding
        // year lands far later) — that would draw the line backtracking across the map.
        // pathIndex preserves the model's original geographic ordering for the line itself.
        const pathOrdered = [...locations].sort((a, b) => (a.pathIndex ?? 0) - (b.pathIndex ?? 0));
        const polyline = new google.maps.Polyline({
            path: pathOrdered.map(l => ({ lat: l.lat, lng: l.lng })),
            geodesic: true,
            strokeColor: "#6366f1",
            strokeOpacity: 0.4,
            strokeWeight: 1.5,
        });
        polyline.setMap(map);
        activePolylines.push(polyline);
        return;
    }

    routeGroups.forEach((paletteIndex, routeId) => {
        const groupLocs = locations.filter(l => l.route === routeId);
        if (groupLocs.length < 2) return;
        for (let i = 0; i < groupLocs.length - 1; i++) {
            const t = (i + 0.5) / (groupLocs.length - 1);
            const seg = new google.maps.Polyline({
                path: [
                    { lat: groupLocs[i].lat, lng: groupLocs[i].lng },
                    { lat: groupLocs[i + 1].lat, lng: groupLocs[i + 1].lng },
                ],
                geodesic: true,
                strokeColor: routeColor(paletteIndex, t),
                strokeOpacity: 0.5,
                strokeWeight: 2,
            });
            seg.setMap(map);
            activePolylines.push(seg);
        }
    });

    const unrouted = locations.filter(l => l.route === null || l.route === undefined || !routeGroups.has(l.route));
    if (unrouted.length > 1) {
        const p = new google.maps.Polyline({
            path: unrouted.map(l => ({ lat: l.lat, lng: l.lng })),
            geodesic: true,
            strokeColor: "#6366f1",
            strokeOpacity: 0.3,
            strokeWeight: 1.2,
        });
        p.setMap(map);
        activePolylines.push(p);
    }
}

// Used during playback animation, where each route's path grows incrementally over time.
// Returns a function that, given a location, returns the (lazily-created) polyline for its
// route, colored by that route's hue at mid-tone; locations without a route share one default.
function makeAnimPolylineFactory(locations) {
    const routeGroups = getRouteGroups(locations);
    // Compare answers aren't a traceable path (see drawRoutePolylines) — hand back a
    // no-op polyline so the intro playback animates markers dropping in without also
    // drawing a stray connecting line between the two subjects.
    const isCompare = locations.some(l => l.compare_group);
    const noopPolyline = { getPath: () => ({ push: () => {} }) };
    const polylines = {};
    return function getAnimPolyline(loc) {
        if (isCompare) return noopPolyline;
        const key = (routeGroups && loc.route !== null && routeGroups.has(loc.route)) ? loc.route : '_default';
        if (!polylines[key]) {
            const color = key === '_default' ? '#6366f1' : routeColor(routeGroups.get(key), 0.5);
            const pl = new google.maps.Polyline({
                path: [],
                geodesic: true,
                strokeColor: color,
                strokeOpacity: 0.55,
                strokeWeight: 2,
            });
            pl.setMap(map);
            activePolylines.push(pl);
            polylines[key] = pl;
        }
        return polylines[key];
    };
}

async function fetchImageAsDataUri(url) {
    try {
        const res = await fetch(url);
        if (!res.ok) return null;
        const blob = await res.blob();
        return new Promise(resolve => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result);
            reader.onerror = () => resolve(null);
            reader.readAsDataURL(blob);
        });
    } catch { return null; }
}

function buildImageMarkerSvg(n, color, dataUri, focused = false) {
    // The fixed internal viewBox is unchanged by `focused` — the actual on-map
    // size comes entirely from the scaledSize/anchor the caller passes to
    // google.maps (see setMarkerPinIcon), so stroke/text stay proportional
    // whether this renders at normal size or emphasized. Focused just adds a
    // white halo ring so it also reads as "current" at a glance, not just bigger.
    return `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="46" height="58" viewBox="0 0 46 58">
        <defs>
            <filter id="shi${n}"><feDropShadow dx="0" dy="2" stdDeviation="2" flood-color="rgba(0,0,0,0.35)"/></filter>
            <clipPath id="cp${n}"><circle cx="23" cy="21" r="16"/></clipPath>
        </defs>
        <path d="M23 2 C11 2 2 11 2 23 C2 36 23 56 23 56 C23 56 44 36 44 23 C44 11 35 2 23 2Z" fill="${color}" filter="url(#shi${n})" stroke="${focused ? '#fff' : 'none'}" stroke-width="${focused ? 2.5 : 0}"/>
        <circle cx="23" cy="21" r="17.5" fill="#fff"/>
        <image href="${dataUri}" x="6" y="4" width="34" height="34" clip-path="url(#cp${n})" preserveAspectRatio="xMidYMid slice"/>
        <circle cx="34" cy="33" r="7.5" fill="${color}" stroke="#fff" stroke-width="1.5"/>
        <text x="34" y="33" text-anchor="middle" dominant-baseline="middle" font-family="-apple-system,sans-serif" font-size="${n > 9 ? 7 : 8}" font-weight="800" fill="#fff">${n}</text>
    </svg>`;
}

// Plain numbered pin (used before a location's Wikipedia thumbnail has loaded,
// or if it never resolves). Same fixed-viewBox approach as buildImageMarkerSvg
// above — `focused` only adds the white halo stroke; actual size comes from
// the scaledSize/anchor setMarkerPinIcon passes to google.maps.
function buildNumberedPinSvg(n, color, focused) {
    return `<svg xmlns="http://www.w3.org/2000/svg" width="30" height="38" viewBox="0 0 30 38">
        <filter id="shadow${n}"><feDropShadow dx="0" dy="1.5" stdDeviation="1.5" flood-color="rgba(0,0,0,0.3)"/></filter>
        <path d="M15 2 C8 2 2 8 2 15 C2 24 15 36 15 36 C15 36 28 24 28 15 C28 8 22 2 15 2 Z" fill="${color}" filter="url(#shadow${n})" stroke="${focused ? '#fff' : 'none'}" stroke-width="${focused ? 2.5 : 0}"/>
        <text x="15" y="19" text-anchor="middle" font-family="-apple-system,sans-serif" font-size="${n > 9 ? 8 : 10}" font-weight="800" fill="#fff">${n}</text>
    </svg>`;
}

// Explore-mode discovery pin — same teardrop silhouette as the numbered
// search-result pins (buildNumberedPinSvg above), not the old flat translucent
// circle: a solid color fill with a white outline and a real drop shadow so
// it reads as a pin sitting on the map instead of a soft badge blending into
// it, colored per-category (see EXPLORE_CATEGORY_COLOR) so the different
// kinds of places stand out from each other independent of the user's single
// chosen accent color. Sized larger than the numbered pins (50x64 vs 30x38)
// since these are the primary thing on screen in explore mode rather than
// one of several. The tip (25,60) is the anchor; see spawnDiscoveries for how
// the accompanying always-on title label is hung just below it.
function buildExplorePinSvg(emoji, color) {
    return `<svg xmlns="http://www.w3.org/2000/svg" width="50" height="64" viewBox="0 0 50 64">
        <filter id="expShadow" x="-50%" y="-50%" width="200%" height="200%"><feDropShadow dx="0" dy="2.5" stdDeviation="2.5" flood-color="rgba(0,0,0,0.5)"/></filter>
        <path d="M25 3 C13 3 4 12 4 24 C4 38 25 60 25 60 C25 60 46 38 46 24 C46 12 37 3 25 3 Z" fill="${color}" stroke="#fff" stroke-width="3" filter="url(#expShadow)"/>
        <text x="25" y="23" text-anchor="middle" dominant-baseline="central" font-size="21">${emoji}</text>
    </svg>`;
}

// Explore-pin counterpart to buildImageMarkerSvg — same teardrop silhouette
// and size as buildExplorePinSvg, but once the discovery's Wikipedia
// thumbnail has loaded it fills the pin's head with that photo (clipped to a
// circle) and tucks the category emoji into a small corner badge, in place
// of the number badge search-result pins use. See setExplorePinIcon.
function buildExploreImagePinSvg(emoji, color, dataUri) {
    return `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="50" height="64" viewBox="0 0 50 64">
        <defs>
            <filter id="expShadowImg" x="-50%" y="-50%" width="200%" height="200%"><feDropShadow dx="0" dy="2.5" stdDeviation="2.5" flood-color="rgba(0,0,0,0.5)"/></filter>
            <clipPath id="expCpImg"><circle cx="25" cy="23" r="18"/></clipPath>
        </defs>
        <path d="M25 3 C13 3 4 12 4 24 C4 38 25 60 25 60 C25 60 46 38 46 24 C46 12 37 3 25 3 Z" fill="${color}" stroke="#fff" stroke-width="3" filter="url(#expShadowImg)"/>
        <circle cx="25" cy="23" r="19.5" fill="#fff"/>
        <image href="${dataUri}" x="6" y="4" width="38" height="38" clip-path="url(#expCpImg)" preserveAspectRatio="xMidYMid slice"/>
        <circle cx="38" cy="37" r="9" fill="${color}" stroke="#fff" stroke-width="1.5"/>
        <text x="38" y="37" text-anchor="middle" dominant-baseline="central" font-size="12">${emoji}</text>
    </svg>`;
}

// Rebuilds one explore-mode discovery marker's icon — plain emoji pin if its
// image hasn't loaded yet (or never resolves), photo-thumbnail pin once it
// has. Mirrors setMarkerPinIcon's role for search-result pins; explore pins
// don't have a focused/emphasized state so this only toggles the one thing.
function setExplorePinIcon(marker) {
    const svg = marker._pinImageDataUri
        ? buildExploreImagePinSvg(marker._pinEmoji, marker._pinColor, marker._pinImageDataUri)
        : buildExplorePinSvg(marker._pinEmoji, marker._pinColor);
    marker.setIcon({
        url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(svg),
        scaledSize: new google.maps.Size(50, 64),
        anchor: new google.maps.Point(25, 60),
        // Same label offset as the initial icon set in spawnDiscoveries —
        // keeps the title chip hanging below the pin's tip either way.
        labelOrigin: new google.maps.Point(25, 74),
    });
}

// Rebuilds one non-main marker's icon (image thumbnail pin if its image has
// loaded, otherwise the plain numbered pin) at normal or emphasized size, and
// sets its opacity/z-index to match. Called both right after a marker's image
// finishes loading and from applyMarkerEmphasis whenever focus changes, so
// the two states (image-loaded vs not, focused vs not) never fight each other.
function setMarkerPinIcon(marker, focused) {
    const n = marker._pinN;
    const color = marker._pinColor;
    if (marker._pinImageDataUri) {
        const s = focused ? 1.3 : 1;
        marker.setIcon({
            url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(buildImageMarkerSvg(n, color, marker._pinImageDataUri, focused)),
            scaledSize: new google.maps.Size(46 * s, 58 * s),
            anchor: new google.maps.Point(23 * s, 56 * s),
        });
    } else {
        const s = focused ? 1.35 : 1;
        marker.setIcon({
            url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(buildNumberedPinSvg(n, color, focused)),
            scaledSize: new google.maps.Size(30 * s, 38 * s),
            anchor: new google.maps.Point(15 * s, 36 * s),
        });
    }
    marker.setOpacity(focused ? 1 : 0.5);
    marker.setZIndex(focused ? 999 : (n - 1));
}

// Makes the currently-focused location's marker pop (bigger, full opacity,
// on top) and dims every other non-main marker, so it's unambiguous which of
// several nearby pins the timeline/summary is currently talking about. A
// focusedIndex of null (overview, nothing focused yet) restores every marker
// to its normal look.
function applyMarkerEmphasis(focusedIndex) {
    activeMarkers.forEach(marker => {
        if (marker._pinN === undefined) return; // main/star marker — left alone
        setMarkerPinIcon(marker, focusedIndex !== null && marker._pinN === focusedIndex);
    });
}

// Small color-key shown above the summary when a "compare" answer is on screen,
// so the two shaded regions/marker sets are legible as "which subject is which"
// rather than just two unexplained colors.
function renderCompareLegend(mainLocs) {
    const legend = document.getElementById('compareLegend');
    if (!legend) return;
    const labelFor = loc => loc.name.split('—')[0].trim();
    legend.innerHTML = mainLocs
        .map(loc => {
            const group = loc.compare_group === 'B' ? 'B' : 'A';
            const color = COMPARE_COLORS[group].light;
            return `<span class="compare-legend-item"><span class="compare-legend-dot" style="background:${color}"></span>${labelFor(loc)}</span>`;
        })
        .join('<span class="compare-legend-vs">vs</span>');
    legend.style.display = 'flex';
}

function hideCompareLegend() {
    const legend = document.getElementById('compareLegend');
    if (legend) legend.style.display = 'none';
}

// Computes the same per-location marker color used on the map/list (route
// color, compare A/B color, or time-based color) for every location, keyed
// by its 1-based marker index. Shared by renderMarkers (for the dots/pins)
// and focusLocation (to color that location's own bold summary text to
// match), so the two never drift apart.
function computeLocationColors(locations) {
    const withYearsList = locations.filter(l => l.year !== null && l.year !== undefined);
    const minYear = withYearsList.length ? Math.min(...withYearsList.map(l => l.year)) : null;
    const maxYear = withYearsList.length ? Math.max(...withYearsList.map(l => l.year)) : null;
    const useTimeColor = withYearsList.length > 1;

    const routeGroups = getRouteGroups(locations);
    const routeCounts = {};
    const routeSeenIndex = {};
    if (routeGroups) {
        locations.forEach(l => {
            if (l.route !== null && routeGroups.has(l.route)) routeCounts[l.route] = (routeCounts[l.route] || 0) + 1;
        });
    }

    const colors = {};
    locations.forEach((location, index) => {
        const n = index + 1;
        let color;
        if (routeGroups && location.route !== null && routeGroups.has(location.route)) {
            const paletteIndex = routeGroups.get(location.route);
            const count = routeCounts[location.route];
            const seen = routeSeenIndex[location.route] || 0;
            const t = count > 1 ? seen / (count - 1) : 0.5;
            routeSeenIndex[location.route] = seen + 1;
            color = routeColor(paletteIndex, t);
        } else if (location.compare_group) {
            // Match the region-shading/legend colors so a compare answer's markers
            // read as "belongs to subject A/B" rather than by time, which would mix
            // both subjects' years into one meaningless gradient.
            color = COMPARE_COLORS[location.compare_group === 'B' ? 'B' : 'A'].light;
        } else {
            color = useTimeColor ? yearToColor(location.year, minYear, maxYear) : '#6366f1';
        }
        colors[n] = color;
    });
    return colors;
}

// Populated by renderMarkers, read by focusLocation — see computeLocationColors.
let activeLocationColors = {};

function renderMarkers(locations, periods = []) {
    const bounds = new google.maps.LatLngBounds();
    const infowindow = new google.maps.InfoWindow();
    const locationsContainer = document.querySelector(".collapsible-content");
    locationsContainer.innerHTML = "";

    activeLocationColors = computeLocationColors(locations);
    const routeGroups = getRouteGroups(locations);

    locations.forEach((location, index) => {
        const locationDiv = document.createElement("div");
        locationDiv.classList.add("location-item");
        const yearLabel = location.year !== null ? `<span class="location-year">${location.year < 0 ? Math.abs(location.year) + ' BCE' : location.year}</span>` : '';

        const n = index + 1;
        const isMain = location.main === true;
        const color = activeLocationColors[n];
        const routeDot = (routeGroups && location.route !== null && routeGroups.has(location.route))
            ? `<span class="location-route-dot" style="background:${color}"></span>` : '';

        locationDiv.innerHTML = `${routeDot}<span class="location-index">${index + 1}</span><span class="location-name">${location.name}</span>${yearLabel}`;
        locationDiv.addEventListener("click", () => focusLocation(location, index + 1));
        // Warm the summary as soon as the user shows intent (hover), not just
        // on click — by the time they actually click, it's often already resolved.
        locationDiv.addEventListener("mouseenter", () => prefetchLocationSummary(index + 1));
        locationsContainer.appendChild(locationDiv);

        let svg, markerSize, markerAnchor;
        if (isMain) {
            // Both subjects' anchors default to orange — differentiate them for
            // compare answers so the two stars aren't identical on the map.
            const mainColor = location.compare_group ? COMPARE_COLORS[location.compare_group === 'B' ? 'B' : 'A'].light : '#f97316';
            svg = `<svg xmlns="http://www.w3.org/2000/svg" width="48" height="60" viewBox="0 0 48 60">
                <filter id="shadowM"><feDropShadow dx="0" dy="3" stdDeviation="3" flood-color="rgba(0,0,0,0.45)"/></filter>
                <path d="M24 2 C12 2 2 12 2 24 C2 38 24 58 24 58 C24 58 46 38 46 24 C46 12 36 2 24 2 Z" fill="${mainColor}" filter="url(#shadowM)"/>
                <text x="24" y="30" text-anchor="middle" font-family="-apple-system,sans-serif" font-size="18" fill="#fff">★</text>
            </svg>`;
            markerSize = new google.maps.Size(48, 60);
            markerAnchor = new google.maps.Point(24, 58);
        } else {
            svg = buildNumberedPinSvg(n, color, false);
            markerSize = new google.maps.Size(30, 38);
            markerAnchor = new google.maps.Point(15, 36);
        }

        const marker = new google.maps.Marker({
            position: { lat: location.lat, lng: location.lng },
            map,
            title: location.name,
            zIndex: isMain ? 1000 : index,
            icon: {
                url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(svg),
                scaledSize: markerSize,
                anchor: markerAnchor,
            },
        });
        marker.addListener('click', () => focusLocation(location, index + 1));
        // Same intent-based warm-up as the list item hover, above, for
        // whichever of list/map the user browses first.
        marker.addListener('mouseover', () => prefetchLocationSummary(index + 1));

        if (!isMain) {
            // n/color/isMain are captured here so applyMarkerEmphasis (called
            // whenever the focused location changes) can rebuild this same
            // marker's icon at its normal or emphasized size without needing
            // to re-derive anything from `location`.
            marker._pinN = n;
            marker._pinColor = color;
            marker._pinImageDataUri = null;
            fetchLocationImage(location).then(({ imageUrl, extract }) => {
                locationImageCache[n] = { imageUrl, extract };
                if (!imageUrl) return;
                fetchImageAsDataUri(imageUrl).then(dataUri => {
                    if (!dataUri) return;
                    marker._pinImageDataUri = dataUri;
                    setMarkerPinIcon(marker, n === currentFocusedIndex);
                });
            });
        }

        // Hovering a marker shows the image-style popout card (same one used
        // to preview a location before focusing it) anchored above the pin.
        marker.addListener('mouseover', () => {
            const pos = getMarkerScreenPos(marker.position);
            if (pos) showMarkerPopoutForLocation(location, index + 1, pos);
        });
        marker.addListener('mouseout', scheduleHideMarkerPopout);

        activeMarkers.push(marker);
        bounds.extend(marker.position);
    });

    drawRoutePolylines(locations);

    const mainLocs = locations.filter(l => l.main);
    // A genuine two-subject comparison: exactly two "main" entries, each tagged
    // with its own distinct compare_group. Anything else (0 or 1 main, or a
    // malformed pair) falls back to the existing single-subject handling.
    const compareMains = mainLocs.length === 2 && mainLocs[0].compare_group && mainLocs[1].compare_group
        && mainLocs[0].compare_group !== mainLocs[1].compare_group
        ? mainLocs
        : null;
    const mainLoc = compareMains ? null : mainLocs[0];

    if (locations.length === 1) {
        map.setZoom(getLocationZoom());
        map.setCenter({ lat: locations[0].lat, lng: locations[0].lng });
    } else if (compareMains) {
        // Both subjects matter equally here — anchoring the view on just one
        // (like the single-main branch below does) would bury the other, so
        // fit bounds around every location from both subjects instead.
        fitBoundsSmart(bounds);
    } else if (mainLoc) {
        // A "main" subject should visually anchor the initial view even if a
        // supporting location is geographically far away — fit bounds around
        // the main location and only the locations reasonably near it, so a
        // single distant outlier doesn't force the map to zoom out and bury
        // the main marker in the middle of an empty ocean.
        const NEARBY_DEGREES = 12; // roughly ~1300km at the equator
        const focusBounds = new google.maps.LatLngBounds();
        focusBounds.extend({ lat: mainLoc.lat, lng: mainLoc.lng });
        locations.forEach(l => {
            if (l === mainLoc) return;
            const near = Math.abs(l.lat - mainLoc.lat) <= NEARBY_DEGREES &&
                Math.abs(l.lng - mainLoc.lng) <= NEARBY_DEGREES;
            if (near) focusBounds.extend({ lat: l.lat, lng: l.lng });
        });
        map.fitBounds(focusBounds);
        google.maps.event.addListenerOnce(map, 'idle', () => {
            const ne = focusBounds.getNorthEast();
            const sw = focusBounds.getSouthWest();
            const spanLat = Math.abs(ne.lat() - sw.lat());
            const spanLng = Math.abs(ne.lng() - sw.lng());
            const tight = spanLat < 1 && spanLng < 1;
            if (map.getZoom() > 8) {
                // fitBounds on a near-point bounds can over-zoom; keep a sane cap.
                map.setZoom(8);
            } else if (tight && map.getZoom() < 11) {
                // ...but when the locations are genuinely close together (e.g.
                // several within the same city), fitBounds can under-zoom too,
                // leaving markers indistinguishable — nudge in.
                map.setZoom(11);
            }
            map.panTo({ lat: mainLoc.lat, lng: mainLoc.lng });
        });
    } else {
        fitBoundsSmart(bounds);
    }

    document.querySelector(".collapsible-btn").style.display = "block";
    if (compareMains) {
        activeShading = 'compare';
        fetchCompareShading(compareMains);
        renderCompareLegend(compareMains);
    } else {
        hideCompareLegend();
        if (mainLoc?.region_countries?.length) {
            activeShading = 'region';
            fetchRegionShading(mainLoc.region_countries);
        } else if (mainLoc?.country) {
            activeShading = 'country';
            fetchCountryOutline(mainLoc.country);
        }
    }

    const timelineContainer = document.getElementById('timeline-container');

    const withYears = locations.filter(l => l.year !== null);
    if (withYears.length > 1) {
        const years = withYears.map(l => l.year);
        const highlights = withYears.map(l => ({
            year: l.year,
            label: l.name.split("—")[0].trim().split(",")[0].trim(),
            fullLocation: l,
            index: locations.indexOf(l) + 1,
            lat: l.lat,
            lng: l.lng,
        }));
        // The arc's right edge defaults to the present day — even a wholly
        // ancient topic (e.g. the Roman Empire) shows how far that history
        // sits from "now" — but stretches further out when a search actually
        // surfaces a later-dated (even future) highlight.
        const currentYear = new Date().getFullYear();
        drawTimeline(Math.min(...years), Math.max(currentYear, ...years), highlights, periods);
    }
}

function annotateLocationsInSummary(locations) {
    const answerEl = document.getElementById("answer");
    // Walk text nodes and replace location place names with clickable spans
    const walker = document.createTreeWalker(answerEl, NodeFilter.SHOW_TEXT);
    const textNodes = [];
    while (walker.nextNode()) textNodes.push(walker.currentNode);

    // Build a list of name variants to try: full place, city-only (before comma), first word
    const candidates = [];
    locations.forEach((loc, i) => {
        const full = loc.name.split('—')[0].trim();
        const cityOnly = full.split(',')[0].trim();
        const firstWord = full.split(' ')[0].trim();
        const variants = [...new Set([full, cityOnly, firstWord])].filter(v => v.length >= 3);
        variants.forEach(v => candidates.push({ loc, index: i + 1, place: v }));
    });
    // Longest match first to avoid partial replacements
    candidates.sort((a, b) => b.place.length - a.place.length);

    // Deduplicate: only match each text position once
    const alreadyMatched = new Set();

    textNodes.forEach(node => {
        if (node.parentElement.closest('button, .loc-link, img, a')) return;

        let html = node.textContent;
        let replaced = false;
        candidates.forEach(({ loc, index, place }) => {
            if (alreadyMatched.has(place.toLowerCase())) return;
            const escaped = place.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
            const regex = new RegExp(`\\b(${escaped})\\b`, 'gi');
            if (regex.test(html)) {
                html = html.replace(regex, `<span class="loc-link" onclick="focusLocation(activeLocations[${index - 1}], ${index})">$1</span>`);
                replaced = true;
            }
        });
        if (replaced) {
            const span = document.createElement('span');
            span.innerHTML = html;
            node.parentNode.replaceChild(span, node);
        }
    });
}



// The three app (container) theme modes, in cycle order. "medium" sits
// between light and dark: dark-family panels tinted with the teal/blue/green
// login palette (see body.theme-medium in css/styles.css).
const APP_THEMES = ['light', 'medium', 'dark'];
const THEME_ICON = { light: '🌙', medium: '🌊', dark: '☀️' };

function currentAppTheme() {
    if (document.body.classList.contains('theme-light')) return 'light';
    if (document.body.classList.contains('theme-medium')) return 'medium';
    return 'dark';
}

// Applies the app (container) theme unconditionally — used both by the
// theme toggle itself and by the map toggle when it drives the app theme.
// Accepts a mode string ('light' | 'medium' | 'dark'); legacy boolean
// callers (true = light, false = dark) are still honoured.
function applyAppTheme(mode) {
    if (mode === true) mode = 'light';
    else if (mode === false) mode = 'dark';
    if (!APP_THEMES.includes(mode)) mode = 'dark';
    document.body.classList.toggle('theme-light', mode === 'light');
    document.body.classList.toggle('theme-medium', mode === 'medium');
    const btn = document.getElementById('theme-toggle');
    if (btn) btn.textContent = THEME_ICON[mode];
    localStorage.setItem('earthlopedia-theme', mode);
    renderTimeline();
    applyShadingStyle();
}

// The app theme toggle is independent — it only affects the app's own
// containers/panels, not the map. Cycles light → medium → dark → light.
function toggleTheme() {
    const next = APP_THEMES[(APP_THEMES.indexOf(currentAppTheme()) + 1) % APP_THEMES.length];
    applyAppTheme(next);
}

// The map style toggle drives both: it cycles the map's own style
// (light → medium → dark → light) and brings the app theme along to match.
function toggleMapStyle() {
    applyMapStyle(MAP_STYLES[(MAP_STYLES.indexOf(mapStyle) + 1) % MAP_STYLES.length]);
}

(function() {
    // Light is the default app theme; an explicit "dark" or "medium" in storage wins.
    const stored = localStorage.getItem('earthlopedia-theme');
    const mode = APP_THEMES.includes(stored) ? stored : 'light';
    document.body.classList.toggle('theme-light', mode === 'light');
    document.body.classList.toggle('theme-medium', mode === 'medium');
    const btn = document.getElementById('theme-toggle');
    if (btn) btn.textContent = THEME_ICON[mode];
    const mapBtn = document.getElementById('map-style-toggle');
    if (mapBtn) mapBtn.textContent = MAP_STYLE_ICON[mapStyle];
})();

// ============== DRAGGABLE / RESIZABLE PANELS ==============
// Lets #questionBox, #currentImagePanel, and #summaryTitleBar be repositioned
// by dragging their grip handle (.drag-handle, added in html/index.html), and
// resized by dragging the corner grip (.resize-handle). Position, size, and
// stacking order persist per panel in localStorage so a custom layout
// survives reloads; resetPanelLayout() (wired to #resetLayoutBtn) clears it.
//
// #questionBox is really two different layouts sharing one element: the
// centered landing search box and the docked result/summary panel
// (.centered vs .result-mode, toggled by openSearch/cancelSearch/askQuestion/
// goBack). Positions are keyed per-mode so dragging one doesn't relocate the
// other — a MutationObserver on the class attribute reapplies (or clears)
// the saved position whenever the mode actually flips.
//
// #timeline-container and #marker-popout are intentionally left out:
// the timeline bar's arc geometry is derived from its fixed bottom-anchored
// position (see CONTAINER_BOTTOM_OFFSET above), and the marker popout's
// left/top are continuously re-set in showMarkerPopoutForLocation to track
// a map marker — free dragging would fight both.
(function() {
    // Bumped to -v2 because the result-mode default geometry for #questionBox
    // and #summaryTitleBar changed significantly (left-pinned + a separate
    // title bar) — old saved drag positions from before that redesign would
    // otherwise keep reapplying and land the panel somewhere that no longer
    // matches either the new default or an intentional drag.
    const LAYOUT_KEY = 'earthlopedia-panel-layout-v2';
    // Explore mode hides #questionBox/#currentImagePanel/#summaryTitleBar and
    // shows its own trio instead (see body.explore-mode in styles.css), so
    // those get the same drag/resize grips. They're display:none until a
    // discovery is opened — modeKey() below keys their saved geometry under
    // 'open' so nothing is measured or reapplied while they're hidden.
    const EXPLORE_DETAIL_DRAG_IDS = new Set(['edpTitleBar', 'edpSummaryPanel', 'edpImagePanel']);
    const DRAGGABLE_IDS = ['questionBox', 'currentImagePanel', 'summaryTitleBar',
        'edpTitleBar', 'edpSummaryPanel', 'edpImagePanel'];
    const BASE_Z = 1000; // comfortably above every panel's own stacking-context z-index
    let zCounter = BASE_Z;
    const lastMode = new WeakMap();

    // Once a panel is dragged, pinPosition() below freezes it at an explicit
    // `left: Npx`, which — unlike the CSS defaults (`right: 24px` on
    // #currentImagePanel, `left: 50%; transform: translateX(-50%)` on
    // #summaryTitleBar) — does not itself track the viewport edge/center on
    // resize. ANCHOR_FRACTION says how much of any viewport-width change to
    // add back into a dragged panel's `left` in reclampAll() so it keeps
    // hugging the edge it started against: 1 keeps it pinned to the right
    // edge, 0.5 keeps it centered, 0 leaves it pinned to the left edge (the
    // default for any panel not listed here, matching #questionBox's own
    // "pinned to the left" CSS default).
    const ANCHOR_FRACTION = {
        currentImagePanel: 1, summaryTitleBar: 0.5,
        edpImagePanel: 1, edpTitleBar: 0.5,
    };
    let lastViewportWidth = window.innerWidth;

    // #questionBox alternates between the centered search layout and the
    // docked result layout; every other draggable panel has just one layout.
    function modeKey(panel) {
        if (panel.id === 'questionBox') return panel.classList.contains('centered') ? 'centered' : 'result';
        // Explore-detail panels are display:none until a discovery is opened.
        // Keying on `.visible` means the class flip openExploreDetail/
        // closeExploreDetail does is what triggers watchModeChanges to apply
        // (on open, when the panel finally has real dimensions) or clear (on
        // close) the saved geometry — never while it's measuring as 0×0.
        if (EXPLORE_DETAIL_DRAG_IDS.has(panel.id)) return panel.classList.contains('visible') ? 'open' : 'hidden';
        return 'default';
    }

    function loadLayout() {
        try { return JSON.parse(localStorage.getItem(LAYOUT_KEY)) || {}; }
        catch { return {}; }
    }
    function hasAnyEntries(layout) {
        return Object.values(layout).some((modes) => modes && Object.keys(modes).length > 0);
    }
    function saveLayout(layout) {
        localStorage.setItem(LAYOUT_KEY, JSON.stringify(layout));
        document.body.classList.toggle('has-custom-layout', hasAnyEntries(layout));
    }

    function clampToViewport(panel, left, top) {
        const vw = window.innerWidth, vh = window.innerHeight;
        // Viewport metrics can read as 0 for an instant before the very first
        // layout settles; clamping a saved position against that would collapse
        // it to (0,0) instead of leaving it where the user actually put it.
        if (!vw || !vh) return { left, top };
        const maxLeft = Math.max(0, vw - panel.offsetWidth);
        const maxTop = Math.max(0, vh - panel.offsetHeight);
        return {
            left: Math.min(Math.max(left, 0), maxLeft),
            top: Math.min(Math.max(top, 0), maxTop),
        };
    }

    // Below ~700px both panels switch to a `left: 10px; right: 10px; width:
    // auto;` layout (see the max-width:700px block in styles.css) so they
    // span the viewport instead of sitting at a fixed width. pinPosition()
    // below drops the `right` anchor to plant the panel at an explicit left,
    // which — with nothing left to size it — collapses the panel to its
    // shrink-to-fit content width instead of the width it had a moment ago.
    // That resize is what was dragging the handle (anchored to the panel's
    // own right edge) off past the edge of the screen. Measuring the width
    // the panel would have under its own CSS right now, with any earlier
    // drag override stripped out, and freezing that as an explicit inline
    // width keeps its size stable through a drag no matter the breakpoint.
    function naturalWidth(panel) {
        const prev = {
            width: panel.style.width, left: panel.style.left, right: panel.style.right,
            top: panel.style.top, bottom: panel.style.bottom,
            transform: panel.style.transform, margin: panel.style.margin,
        };
        Object.assign(panel.style, { width: '', left: '', right: '', top: '', bottom: '', transform: '', margin: '' });
        void panel.offsetWidth;
        const width = panel.getBoundingClientRect().width;
        Object.assign(panel.style, prev);
        return width;
    }

    // Same idea as naturalWidth, but for height: the panel's own CSS-driven
    // height (content height, or a stylesheet max-height cap) with any
    // earlier resize override stripped out. Used as the resize floor below —
    // without it, a panel shorter than MIN_PANEL_HEIGHT (e.g. #summaryTitleBar,
    // which is just a line or two of title text) would snap up to that floor
    // on the very first pixel of drag and then never be able to shrink back
    // down to its actual natural size again.
    function naturalHeight(panel) {
        const prev = { height: panel.style.height, maxHeight: panel.style.maxHeight };
        Object.assign(panel.style, { height: '', maxHeight: '' });
        void panel.offsetHeight;
        const height = panel.getBoundingClientRect().height;
        Object.assign(panel.style, prev);
        return height;
    }

    // Pins the panel to an absolute viewport position, overriding whatever
    // top/left/right/bottom/transform/width its current CSS class (e.g.
    // #questionBox.centered) would otherwise apply. `width` is optional —
    // omit it on moves within an already-pinned drag so it isn't
    // re-measured (and isn't needed) on every mousemove.
    function pinPosition(panel, left, top, width) {
        panel.style.left = left + 'px';
        panel.style.top = top + 'px';
        panel.style.right = 'auto';
        panel.style.bottom = 'auto';
        panel.style.transform = 'none';
        panel.style.margin = '0';
        if (width != null) panel.style.width = width + 'px';
        panel.classList.add('panel-repositioned');
    }

    // Drops any manual override so the panel's current CSS class (i.e. its
    // current mode) drives its position and size again.
    function clearOverride(panel) {
        // maxHeight on #questionBox isn't only touched by the resize handle —
        // renderTimeline()/askQuestion() also set it inline, independently of
        // this drag system, to shrink the panel out of the timeline's way.
        // Wiping it unconditionally here would undo that legitimate override
        // (snapping the panel back to its full CSS max-height and covering
        // the timeline) even when the panel was never actually drag-resized,
        // so only clear it when a manual resize is what set it.
        const wasResized = !!panel.dataset.resized;
        panel.classList.remove('panel-repositioned', 'panel-resized');
        delete panel.dataset.resized;
        const props = ['left', 'top', 'right', 'bottom', 'transform', 'margin', 'width', 'height', 'zIndex'];
        if (wasResized) props.push('maxHeight');
        props.forEach((prop) => {
            panel.style[prop] = '';
        });
    }

    // Pins an explicit width/height (dropping the CSS-driven max-height cap
    // so the panel doesn't clip itself), used by initResize below.
    function applySize(panel, width, height) {
        panel.style.width = width + 'px';
        panel.style.height = height + 'px';
        panel.style.maxHeight = 'none';
        panel.classList.add('panel-resized');
        panel.dataset.resized = '1';
    }

    function bringToFront(panel) {
        zCounter += 1;
        panel.style.zIndex = zCounter;
        return zCounter;
    }

    function persist(panel) {
        const rect = panel.getBoundingClientRect();
        const layout = loadLayout();
        layout[panel.id] = layout[panel.id] || {};
        const entry = {
            left: rect.left,
            top: rect.top,
            z: parseInt(panel.style.zIndex, 10) || BASE_Z,
        };
        // Only panels the user has actually dragged the resize handle on get an
        // explicit size saved — plain drags leave width/height alone so content
        // keeps auto-sizing the panel (up to its normal max-height cap).
        if (panel.dataset.resized) {
            entry.width = rect.width;
            entry.height = rect.height;
        }
        layout[panel.id][modeKey(panel)] = entry;
        saveLayout(layout);
    }

    // Applies whatever this panel's *current* mode has saved, or clears back
    // to CSS default if that particular mode has never been dragged.
    function applyModeLayout(panel) {
        if (panel.classList.contains('panel-dragging') || panel.classList.contains('panel-resizing')) return;
        const layout = loadLayout();
        const saved = layout[panel.id] && layout[panel.id][modeKey(panel)];
        if (saved && saved.left != null) {
            if (saved.z) zCounter = Math.max(zCounter, saved.z);
            // #questionBox transitions top/left/width between its centered and
            // result-mode CSS — reading offsetWidth/Height right after the mode
            // class swap can otherwise catch the box mid-transition (still sized
            // for the *previous* mode), which throws the clamp math off. Force a
            // transition-free reflow first so the measurement is the new mode's
            // settled size, then restore the transition before actually moving it.
            const prevTransition = panel.style.transition;
            panel.style.transition = 'none';
            void panel.offsetHeight;
            const { left, top } = clampToViewport(panel, saved.left, saved.top);
            // Same idea as the transition dodge above: measure the width this
            // mode's CSS actually wants right now (see naturalWidth) rather
            // than reusing whatever width a different mode/breakpoint froze.
            const width = naturalWidth(panel);
            panel.style.transition = prevTransition;
            pinPosition(panel, left, top, width);
            panel.style.zIndex = saved.z || bringToFront(panel);
        } else {
            clearOverride(panel);
        }
        // Size override is independent of the position override above (a panel
        // can be resized without ever having been dragged, or vice versa).
        if (saved && saved.width != null) {
            applySize(panel, saved.width, saved.height);
            panel.dataset.resized = '1';
        } else {
            panel.classList.remove('panel-resized');
            delete panel.dataset.resized;
        }
    }

    function restoreLayout() {
        const layout = loadLayout();
        document.body.classList.toggle('has-custom-layout', hasAnyEntries(layout));
        DRAGGABLE_IDS.forEach((id) => {
            const panel = document.getElementById(id);
            if (!panel) return;
            lastMode.set(panel, modeKey(panel));
            applyModeLayout(panel);
        });
    }

    function initDrag(panel, handle) {
        let dragging = false;
        let startX = 0, startY = 0, startLeft = 0, startTop = 0;

        function move(e) {
            if (!dragging) return;
            const p = e.touches ? e.touches[0] : e;
            const { left, top } = clampToViewport(panel, startLeft + (p.clientX - startX), startTop + (p.clientY - startY));
            pinPosition(panel, left, top);
            e.preventDefault();
        }
        function end() {
            if (!dragging) return;
            dragging = false;
            panel.classList.remove('panel-dragging');
            document.removeEventListener('mousemove', move);
            document.removeEventListener('touchmove', move);
            document.removeEventListener('mouseup', end);
            document.removeEventListener('touchend', end);
            persist(panel);
        }
        function start(e) {
            const p = e.touches ? e.touches[0] : e;
            dragging = true;
            const rect = panel.getBoundingClientRect();
            startX = p.clientX;
            startY = p.clientY;
            startLeft = rect.left;
            startTop = rect.top;
            panel.classList.add('panel-dragging');
            panel.style.zIndex = bringToFront(panel);
            // Freeze the panel at its current width before we touch left/right
            // below — otherwise pinning `left` while dropping `right` leaves
            // nothing sizing the panel on layouts that size it by a left+right
            // span (e.g. mobile's full-width panels), and it collapses to its
            // content width mid-drag. A panel the user has manually resized
            // (dataset.resized) already has an explicit width holding its size;
            // measuring naturalWidth() here would discard that and snap back to
            // the CSS-default width, so just keep the width it already has.
            pinPosition(panel, startLeft, startTop, panel.dataset.resized ? rect.width : naturalWidth(panel));
            e.preventDefault();
            document.addEventListener('mousemove', move);
            document.addEventListener('touchmove', move, { passive: false });
            document.addEventListener('mouseup', end);
            document.addEventListener('touchend', end);
        }

        handle.addEventListener('mousedown', start);
        handle.addEventListener('touchstart', start, { passive: false });
    }

    const MIN_PANEL_WIDTH = 240;
    const MIN_PANEL_HEIGHT = 160;

    function initResize(panel, handle) {
        let resizing = false;
        let startX = 0, startY = 0, startWidth = 0, startHeight = 0, startLeft = 0, startTop = 0;
        // Floors for *this* resize gesture. Panels like #summaryTitleBar sit
        // naturally shorter/narrower than the global MIN_PANEL_* constants
        // (they're sized to a short title, not a scrollable content area) —
        // clamping every panel to the same floor made the very first pixel of
        // drag snap the panel up to 160px tall with nowhere shorter to go back
        // to. Capping the floor at whatever size the panel actually started
        // from means shrinking can always return it to its natural size.
        let minWidth = MIN_PANEL_WIDTH, minHeight = MIN_PANEL_HEIGHT;

        function move(e) {
            if (!resizing) return;
            const p = e.touches ? e.touches[0] : e;
            // Left/top are pinned for the duration of the resize (grip is in the
            // bottom-right corner), so the max size is just what fits between
            // that fixed corner and the viewport edge.
            const maxWidth = Math.max(minWidth, window.innerWidth - startLeft - 8);
            const maxHeight = Math.max(minHeight, window.innerHeight - startTop - 8);
            const width = Math.min(Math.max(startWidth + (p.clientX - startX), minWidth), maxWidth);
            const height = Math.min(Math.max(startHeight + (p.clientY - startY), minHeight), maxHeight);
            applySize(panel, width, height);
            e.preventDefault();
        }
        function end() {
            if (!resizing) return;
            resizing = false;
            panel.classList.remove('panel-resizing', 'panel-dragging');
            document.removeEventListener('mousemove', move);
            document.removeEventListener('touchmove', move);
            document.removeEventListener('mouseup', end);
            document.removeEventListener('touchend', end);
            persist(panel);
        }
        function start(e) {
            const p = e.touches ? e.touches[0] : e;
            resizing = true;
            const rect = panel.getBoundingClientRect();
            startX = p.clientX;
            startY = p.clientY;
            startWidth = rect.width;
            startHeight = rect.height;
            startLeft = rect.left;
            startTop = rect.top;
            // Floor against the panel's natural size, not just whatever size
            // this particular gesture happens to start from — otherwise a
            // panel already resized larger than its content needs would have
            // its floor pinned to that larger size, forever unable to shrink
            // back toward its actual natural minimum.
            minWidth = Math.min(MIN_PANEL_WIDTH, naturalWidth(panel));
            minHeight = Math.min(MIN_PANEL_HEIGHT, naturalHeight(panel));
            // panel-dragging kills transitions (shared with drag); panel-resizing
            // stops applyModeLayout (e.g. from a mode-class flip mid-resize) from
            // fighting the live resize.
            panel.classList.add('panel-dragging', 'panel-resizing');
            panel.style.zIndex = bringToFront(panel);
            // Pin left/top at the current spot first so growing the panel doesn't
            // also drag it back into (or out of) a centered/transform-based
            // position — same reasoning as initDrag's start().
            pinPosition(panel, startLeft, startTop, startWidth);
            applySize(panel, startWidth, startHeight);
            e.preventDefault();
            e.stopPropagation();
            document.addEventListener('mousemove', move);
            document.addEventListener('touchmove', move, { passive: false });
            document.addEventListener('mouseup', end);
            document.addEventListener('touchend', end);
        }

        handle.addEventListener('mousedown', start);
        handle.addEventListener('touchstart', start, { passive: false });
    }

    // Watches for the search/result mode flip (or any other class churn) and
    // reapplies that mode's saved position — only acts when the mode itself
    // actually changed, so our own panel-repositioned/panel-dragging class
    // toggles don't re-trigger this.
    function watchModeChanges(panel) {
        const observer = new MutationObserver(() => {
            const mode = modeKey(panel);
            if (lastMode.get(panel) === mode) return;
            lastMode.set(panel, mode);
            applyModeLayout(panel);
        });
        observer.observe(panel, { attributes: true, attributeFilter: ['class'] });
    }

    // Re-clamps any dragged panel that's now (partly) off-screen after a
    // viewport resize, without touching panels still at their CSS default.
    // Also refreshes the frozen width (see naturalWidth) since resizing can
    // cross the mobile breakpoint where panels are sized differently.
    function reclampAll() {
        const layout = loadLayout();
        let changed = false;
        // How far the viewport just grew/shrank horizontally — added back into
        // each dragged panel's left (scaled by its ANCHOR_FRACTION) so panels
        // anchored to the right edge or the horizontal center keep tracking
        // that edge/center across the resize instead of just staying put at
        // their old absolute left and getting reclamped in place.
        const vw = window.innerWidth;
        const deltaX = vw - lastViewportWidth;
        DRAGGABLE_IDS.forEach((id) => {
            const panel = document.getElementById(id);
            if (!panel || !panel.classList.contains('panel-repositioned')) return;
            const entry = { z: parseInt(panel.style.zIndex, 10) || BASE_Z };
            const shift = deltaX * (ANCHOR_FRACTION[id] || 0);
            if (panel.dataset.resized) {
                // A manually-resized panel keeps its explicit size; just shrink it
                // back down if the viewport got smaller than that size demands.
                const rect = panel.getBoundingClientRect();
                const { left, top } = clampToViewport(panel, rect.left + shift, rect.top);
                const width = Math.max(MIN_PANEL_WIDTH, Math.min(rect.width, window.innerWidth - left - 8));
                const height = Math.max(MIN_PANEL_HEIGHT, Math.min(rect.height, window.innerHeight - top - 8));
                pinPosition(panel, left, top);
                applySize(panel, width, height);
                Object.assign(entry, { left, top, width, height });
            } else {
                const width = naturalWidth(panel);
                panel.style.width = width + 'px';
                const rect = panel.getBoundingClientRect();
                const { left, top } = clampToViewport(panel, rect.left + shift, rect.top);
                pinPosition(panel, left, top, width);
                Object.assign(entry, { left, top });
            }
            changed = true;
            layout[id] = layout[id] || {};
            layout[id][modeKey(panel)] = entry;
        });
        lastViewportWidth = vw;
        if (changed) saveLayout(layout);
    }

    window.resetPanelLayout = function resetPanelLayout() {
        localStorage.removeItem(LAYOUT_KEY);
        document.body.classList.remove('has-custom-layout');
        DRAGGABLE_IDS.forEach((id) => {
            const panel = document.getElementById(id);
            if (panel) clearOverride(panel);
        });
    };

    restoreLayout();
    DRAGGABLE_IDS.forEach((id) => {
        const panel = document.getElementById(id);
        const handle = panel && panel.querySelector('.drag-handle');
        const resizeHandle = panel && panel.querySelector('.resize-handle');
        if (!panel) return;
        if (handle) initDrag(panel, handle);
        if (resizeHandle) initResize(panel, resizeHandle);
        watchModeChanges(panel);
    });
    window.addEventListener('resize', reclampAll);
})();

// ============== MOBILE STACKED SHEET ==============
// Below the ~700px breakpoint (see the max-width:700px block in styles.css)
// #summaryTitleBar, #currentImagePanel and #questionBox go full-width and
// stack vertically instead of sitting side by side. Their heights vary too
// much with content (title wrapping, photo count, answer length) for a
// fixed CSS offset to stack them without gaps or overlap, so this measures
// each panel's actual rendered bottom edge and pins the next one directly
// below it — same idea as positionStreetViewSlot() above, just chained
// across three panels instead of one.
//
// #currentImagePanel and #questionBox also default to collapsed (see the
// `mobile-sheet-expanded` body class below) so the map stays reachable
// without the user having to fight a full-screen panel — toggleMobileSheet
// is wired to #mobileSheetToggle in #summaryTitleBar.
(function() {
    const MOBILE_BREAKPOINT = 700;
    const titleBar = document.getElementById('summaryTitleBar');
    const imgPanel = document.getElementById('currentImagePanel');
    const qb = document.getElementById('questionBox');
    // Explore detail's own title/image/summary trio stacks the same way on
    // mobile — kept as separate elements (see the HTML comment above
    // #edpTitleBar) but sharing this same stacking logic rather than
    // duplicating it.
    const edpTitleBar = document.getElementById('edpTitleBar');
    const edpImgPanel = document.getElementById('edpImagePanel');
    const edpSummaryPanel = document.getElementById('edpSummaryPanel');
    if (!titleBar || !imgPanel || !qb) return;
    const GAP = 10;

    function isMobile() { return window.innerWidth <= MOBILE_BREAKPOINT; }

    function layout() {
        // The centered landing layout isn't part of this stack, and on
        // desktop the panels use their own fixed top/right CSS — clear any
        // leftover inline top from a narrower viewport so that CSS applies.
        // But skip that clear for a panel the user has just dragged
        // (`panel-repositioned`, set by the drag system in pinPosition):
        // adding that class is itself a class-attribute mutation this
        // function is subscribed to, so without this guard every vertical
        // drag on desktop got its inline top wiped back to the CSS default
        // a moment after being set — the panel would appear to only move
        // left/right, never down.
        if (!isMobile() || qb.classList.contains('centered')) {
            if (!imgPanel.classList.contains('panel-repositioned')) imgPanel.style.top = '';
            if (!qb.classList.contains('panel-repositioned')) qb.style.top = '';
            // Skip the clear for an explore-detail panel the user has dragged —
            // same guard as the main trio above, or the drag only ever moves
            // it sideways before layout() snaps its top back to the CSS default.
            if (edpImgPanel && !edpImgPanel.classList.contains('panel-repositioned')) edpImgPanel.style.top = '';
            if (edpSummaryPanel && !edpSummaryPanel.classList.contains('panel-repositioned')) edpSummaryPanel.style.top = '';
            return;
        }
        // A manually dragged panel already has an explicit position the
        // user chose — don't fight it by re-stacking underneath it.
        if (titleBar.classList.contains('panel-repositioned') ||
            imgPanel.classList.contains('panel-repositioned') ||
            qb.classList.contains('panel-repositioned')) {
            return;
        }

        const titleShown = getComputedStyle(titleBar).display !== 'none';
        let nextTop = titleShown ? titleBar.getBoundingClientRect().bottom + GAP : 66;

        imgPanel.style.top = nextTop + 'px';
        const imgExpanded = document.body.classList.contains('mobile-sheet-expanded') &&
            imgPanel.classList.contains('visible');
        if (imgExpanded) {
            nextTop = imgPanel.getBoundingClientRect().bottom + GAP;
        }
        qb.style.top = nextTop + 'px';

        // Explore detail panels have no collapse toggle — when open, they're
        // always all three at full height, so this is just a straight
        // top-to-bottom chain. A panel the user has dragged has an explicit
        // position of its own, so leave the whole chain alone in that case
        // (mirrors the main trio's guard above).
        const edpRepositioned = [edpTitleBar, edpImgPanel, edpSummaryPanel]
            .some((el) => el && el.classList.contains('panel-repositioned'));
        if (!edpRepositioned && edpTitleBar && edpImgPanel && edpSummaryPanel && edpTitleBar.classList.contains('visible')) {
            let edpNextTop = edpTitleBar.getBoundingClientRect().bottom + GAP;
            edpImgPanel.style.top = edpNextTop + 'px';
            edpNextTop = edpImgPanel.getBoundingClientRect().bottom + GAP;
            edpSummaryPanel.style.top = edpNextTop + 'px';
        }
    }

    // A class flip (result-mode, `.visible`, the expand toggle) changes
    // #currentImagePanel's max-height, which is itself transitioning —
    // querying its rendered bottom edge in the same tick as the flip can
    // still catch the pre-transition size. Re-running layout() a couple of
    // frames later, once the transition has actually started, catches the
    // size it settles toward instead.
    function layoutSoon() {
        layout();
        requestAnimationFrame(() => requestAnimationFrame(layout));
    }

    window.toggleMobileSheet = function toggleMobileSheet() {
        const expanded = document.body.classList.toggle('mobile-sheet-expanded');
        const btn = document.getElementById('mobileSheetToggle');
        if (btn) {
            const label = expanded ? 'Hide details' : 'Show details';
            btn.title = label;
            btn.setAttribute('aria-label', label);
        }
        layoutSoon();
    };

    const ro = new ResizeObserver(layout);
    ro.observe(titleBar);
    ro.observe(imgPanel);
    if (edpTitleBar) ro.observe(edpTitleBar);
    if (edpImgPanel) ro.observe(edpImgPanel);
    window.addEventListener('resize', layout);
    // Class changes drive the stack too: entering/leaving result-mode,
    // the image panel gaining/losing `.visible`, and the expand/collapse
    // toggle on <body> all shift where the next panel down should land.
    new MutationObserver(layoutSoon).observe(document.body, { attributes: true, attributeFilter: ['class'] });
    [titleBar, imgPanel, qb, edpTitleBar, edpImgPanel, edpSummaryPanel].forEach((el) => {
        if (el) new MutationObserver(layoutSoon).observe(el, { attributes: true, attributeFilter: ['class'] });
    });
    layout();
})();
