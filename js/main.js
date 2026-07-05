let map;
let statesStack = [];

const RANDOM_QUESTIONS = [
    // Map-specific route & journey questions
    "Trace every stop on Marco Polo's 24-year journey from Venice to Beijing",
    "Map all the ports Columbus visited across his four voyages to the Americas",
    "Show the exact route Magellan's crew took to circumnavigate the globe",
    "Where did the first humans travel as they spread out of Africa over 70,000 years?",
    "Trace Vasco da Gama's sea route from Portugal around Africa to India",
    "Map every Greek colony founded around the Mediterranean Sea",
    "Show every territory the Roman Empire controlled at its absolute peak",
    "Where did Viking settlements stretch from Scandinavia to North America?",
    "Trace the Silk Road's branching routes from Rome all the way to Chang'an",
    "Map exactly where the Black Death spread year by year from 1347 to 1353",
    "Show every battle Alexander the Great fought across three continents",
    "Where did Buddhism spread from its origin in Nepal across Asia?",
    "Trace the triangular slave trade routes that crossed the Atlantic Ocean",
    "Map where the Mongol Empire expanded under each successive Khan",
    "Show every Crusader state and how their borders shifted over 200 years",
    "Where did Polynesian explorers reach across the entire Pacific Ocean?",
    "Trace the Lewis and Clark expedition from St. Louis to the Pacific",
    "Map all the Portuguese trading posts from West Africa to Japan",
    "Show how the Ottoman Empire's borders expanded and contracted over 600 years",
    "Where did the Bantu people migrate across sub-Saharan Africa over 3,000 years?",
    // Lost cities & hidden places
    "The underground cities carved five stories deep beneath Cappadocia, Turkey",
    "The sunken city off the coast of Japan that no one can fully explain",
    "Great Zimbabwe — the stone city that Europeans refused to believe Africans built",
    "The ghost cities abandoned along the Silk Road when trade routes shifted",
    "Nan Madol — a city of 100 artificial islands built in the middle of the Pacific",
    "The city of Petra carved directly into rose-red rock in the Jordanian desert",
    "The Viking settlement in Newfoundland discovered 500 years before Columbus",
    "The Indus Valley civilization that stretched across three modern countries then vanished",
    "Cahokia — the Native American city larger than London that disappeared by 1350",
    // Empires & their geography
    "How tiny Portugal controlled trade routes across half the world simultaneously",
    "How the Byzantine Empire held off every invader for 1,000 years after Rome fell",
    "The Mali Empire — the African kingdom so wealthy its emperor crashed gold markets",
    "How the Mongols created the largest land empire in history in 25 years",
    "The Inca Empire built 25,000 miles of roads through the Andes without wheels or horses",
    "How Islam spread from a single city in Arabia to Spain and Indonesia in 100 years",
    "The Phoenicians — the sailors who mapped the Mediterranean 500 years before Rome",
    // Geographic phenomena
    "How did the Sahara transform from green savanna to desert in just 4,000 years?",
    "Why does Africa have so many suspiciously straight borders?",
    "How Polynesian sailors navigated by stars and waves to find every Pacific island",
    "Why Antarctica was once a tropical rainforest teeming with life",
    "How the Black Sea was created when the Mediterranean burst through in a massive flood",
    "The volcano that created an entirely new island in the Atlantic in 1963",
    "The place where three tectonic plates meet beneath Iceland",
    "Why the Dead Sea is shrinking by a meter every year",
    "The ocean current that made European colonialism geographically inevitable",
    // Trade & culture spread
    "How salt once determined which cities became empires and which ones starved",
    "The spice trade routes that sparked the entire Age of Exploration",
    "How chocolate traveled from Aztec currency to a global obsession",
    "The tea trade that simultaneously started a revolution and destroyed an empire",
    "How coffee houses spread across Europe and accidentally invented the newspaper",
    "How sugar plantations fundamentally reshaped the map of the Americas",
    "The trans-Saharan trade network that made medieval Timbuktu a global city",
    // Borders & geopolitics
    "The border drawn so carelessly that it caused three wars over the next century",
    "The Treaty of Tordesillas — when Spain and Portugal literally divided the entire world",
    "The tiny landlocked country that has never been conquered in 700 years",
    "How the Suez Canal changed every single shipping route on Earth overnight",
    "The Cold War by proxy — how Africa's borders were redrawn by powers 5,000 miles away",
    "How the Panama Canal bankrupted France before America stepped in to finish it",
    "The island that legally belongs to no country and sits between two that claim it",
];

// Per-template topic pools
const _POOL = {
    route: [
        "Marco Polo from Venice to Beijing","Ibn Battuta across 44 countries",
        "Magellan's crew around the entire globe","Vasco da Gama around Africa to India",
        "Columbus across his four voyages","Francis Drake's circumnavigation",
        "Lewis and Clark from St. Louis to the Pacific","the Silk Road from Rome to Chang'an",
        "Zheng He's treasure fleet across the Indian Ocean","the Polynesian migration across the Pacific",
        "the Viking routes from Scandinavia to North America","the Bantu migrations across Africa",
        "the first humans migrating out of Africa","the Trans-Saharan caravan routes",
        "the Indian Ocean spice trade routes","the Amber Road from the Baltic to Rome",
        "the Incense Route across Arabia","the Grand Trunk Road from Kabul to Bengal",
        "the Tea Horse Road through Tibet","the Volga trade route",
        "Hannibal's army crossing the Alps","Alexander the Great from Greece to India",
        "Napoleon's march to Moscow and retreat","the Crusader armies marching to Jerusalem",
        "Cortés's conquest route through Mexico","Pizarro's conquest route through Peru",
        "Roald Amundsen's race to the South Pole","Ernest Shackleton's Antarctic expedition",
        "James Cook's three Pacific voyages","the first fleet from Britain to Botany Bay",
        "the Oregon Trail pioneers","the California Gold Rush settlers",
        "the Underground Railroad routes","Burke and Wills crossing Australia",
        "the Hajj pilgrimage routes","the Camino de Santiago",
        "the Cape Horn sea route","Leif Eriksson from Greenland to North America",
        "the Mayflower from Plymouth to Massachusetts","the Portuguese spice route to Malacca",
        "the Mongol invasion routes from Mongolia to Europe","de Soto through the American Southeast",
        "Balboa crossing Panama to the Pacific","the Long March through China",
        "the Exodus route across the Sinai","the Viking route to Constantinople",
        "Zheng He's route to East Africa","the Inca royal road through the Andes",
        "the Trans-Siberian Railway route","the Mansa Musa pilgrimage to Mecca",
        "the Arab conquest routes across the Middle East","the Roman roads across Europe",
    ],
    timeline: [
        "the Roman Empire","the Byzantine Empire","the Ottoman Empire","the Mongol Empire",
        "the British Empire","the Spanish Empire","the Portuguese Empire","the French Empire",
        "the Aztec Empire","the Inca Empire","the Maya civilization","the Han Dynasty",
        "the Tang Dynasty","the Ming Dynasty","the Qing Dynasty","the Mughal Empire",
        "the Safavid Empire","the Mali Empire","the Songhai Empire","the Ghana Empire",
        "the Kingdom of Kush","the Aksumite Empire","the Zulu Kingdom","the Ashanti Empire",
        "the Viking Age","the Crusades","the Hundred Years' War","the Thirty Years' War",
        "the Napoleonic Wars","the Seven Years' War","the Peloponnesian War",
        "the Punic Wars","the Greco-Persian Wars","the Arab Conquests",
        "the Umayyad Caliphate","the Abbasid Caliphate","the Rashidun Caliphate",
        "the Achaemenid Persian Empire","the Sassanid Empire","the Parthian Empire",
        "the Maurya Empire","the Gupta Empire","the Maratha Empire","the Delhi Sultanate",
        "the Khmer Empire","the Majapahit Empire","the Ayutthaya Kingdom",
        "the Frankish Empire","the Holy Roman Empire","the Seljuk Empire",
        "the Timurid Empire","the Reconquista","the Hanseatic League",
        "the Venetian Republic","the Three Kingdoms of Korea","the Joseon Dynasty",
        "the Japanese Sengoku period","the Meiji Restoration","the Tokugawa shogunate",
        "ancient Egypt from the First Dynasty to Cleopatra","the Phoenician trading empire",
        "the Carthaginian Empire","the Macedonian Empire","the Olmec civilization",
        "the Tiwanaku Empire","the Mississippian culture","the Cold War",
        "the British Raj","World War I","World War II","the Scramble for Africa",
        "the Protestant Reformation","the Renaissance","the Age of Exploration",
    ],
    battle: [
        "Alexander the Great","Julius Caesar","Genghis Khan","Napoleon Bonaparte",
        "Hannibal Barca","Saladin","Tamerlane","Attila the Hun","Khalid ibn al-Walid",
        "Scipio Africanus","Shaka Zulu","Pachacuti","Sundiata Keita",
        "Charles Martel","Richard the Lionheart","Frederick the Great",
        "the Duke of Wellington","Tokugawa Ieyasu","Oda Nobunaga","Toyotomi Hideyoshi",
        "Ramesses II","Thutmose III","Cyrus the Great","Darius the Great",
        "Themistocles","Leonidas at Thermopylae","Pyrrhus of Epirus",
        "the Punic Wars","the Hundred Years' War","the Thirty Years' War",
        "the Crusades","the Greco-Persian Wars","the Peloponnesian War",
        "the Mongol invasion of Europe","the Arab Conquest of Persia",
        "the Reconquista","the Wars of the Roses","the English Civil War",
        "the American Revolutionary War","the American Civil War","the Napoleonic Wars",
        "the Zulu Wars","the Boer War","the Russo-Japanese War","the Seven Years' War",
        "the Hundred Years' War","the Macedonian Wars against Rome",
        "the Sengoku period in Japan","the Maratha Wars","the Anglo-Zulu War",
        "the Fall of Constantinople","the Siege of Vienna 1683",
        "the Battle of Gaugamela","the Battle of Thermopylae",
        "the Mongol conquest of China","Tamerlane's campaigns across Central Asia",
    ],
    spread: [
        "Islam","Christianity","Buddhism","Hinduism","Zoroastrianism",
        "the Black Death","the Justinian Plague","the Antonine Plague","the Spanish flu of 1918",
        "smallpox after European contact with the Americas","cholera in the 19th century",
        "the Bantu people across Africa","the Polynesian people across the Pacific",
        "the Indo-European languages","the Phoenician alphabet","the Latin alphabet",
        "Arabic numerals","the printing press","gunpowder","the wheel",
        "iron smelting","bronze casting","the horse","the camel",
        "the potato from the Andes","coffee from Ethiopia","sugar cane from New Guinea",
        "the tulip from Central Asia to Europe","maize from Mesoamerica",
        "tobacco from the Americas","cotton cultivation","rice cultivation",
        "the olive tree across the Mediterranean","the grape vine",
        "Silk Road goods from China","the Roman road network",
        "the Mongol Empire","the Roman Empire","the Arab Conquests",
        "Hellenistic culture after Alexander","the Ottoman Empire",
        "European colonialism","the Atlantic slave trade",
        "the Norse settlements","the Viking trade networks",
    ],
    geography: [
        "the Nile River and ancient Egypt","the Amazon River basin",
        "the Tigris and Euphrates and Mesopotamia","the Indus River valley",
        "the Yellow River and ancient China","the Ganges River and Indian civilization",
        "the Congo River basin","the Niger River and West African trade",
        "the Mississippi River system","the Mekong River in Southeast Asia",
        "the Danube River through European history","the Rhine as Rome's border",
        "the Volga River and Viking trade","the Zambezi River",
        "the Himalayan mountain range","the Andes Mountains and Inca roads",
        "the Alps and their role in European history","the Caucasus Mountains",
        "the Hindu Kush and the Khyber Pass","the Atlas Mountains in North Africa",
        "the Rocky Mountains and westward expansion","the Appalachian Mountains",
        "the Sahara Desert","the Gobi Desert","the Atacama Desert",
        "the Arabian Desert","the Kalahari Desert","the Sonoran Desert",
        "the Fertile Crescent and the first cities","the Great Rift Valley",
        "the Mediterranean Sea as a cradle of civilizations",
        "the Strait of Malacca and Asian trade","the Bosphorus and Dardanelles",
        "the English Channel","the Cape of Good Hope","the Red Sea trade routes",
        "the Persian Gulf","the Baltic Sea and Viking routes","the Black Sea colonies",
        "the Silk Road terrain from Rome to Chang'an","the Bering Land Bridge",
        "the Polynesian island chains","the Caribbean Sea and trade winds",
        "the Great Barrier Reef","the Hawaiian volcanic island chain",
    ],
};

// Compare template uses pairs drawn from two separate pools
const _COMPARE_A = [
    "the Roman Empire","the Byzantine Empire","the Mongol Empire","the Ottoman Empire",
    "the British Empire","the Spanish Empire","the Portuguese Empire","the French Empire",
    "the Aztec Empire","the Inca Empire","the Achaemenid Persian Empire","the Han Dynasty",
    "the Tang Dynasty","the Mughal Empire","the Safavid Empire","the Mali Empire",
    "the Zulu Kingdom","the Carthaginian Empire","ancient Athens","ancient Sparta",
    "the Viking Age","the Crusader states","the Umayyad Caliphate","the Abbasid Caliphate",
    "the Khmer Empire","the Majapahit Empire","the Maurya Empire","the Gupta Empire",
    "the Ashanti Empire","the Ethiopian Empire","the Aztec Triple Alliance",
];
const _COMPARE_B = [
    "Han China","the Ming Dynasty","the Mongol Empire","the British Empire",
    "the Inca Empire","the Maya civilization","the Sassanid Empire","the Roman Republic",
    "the Holy Roman Empire","the Dutch East India Company","the Venetian Republic",
    "ancient Egypt","the Parthian Empire","the Timurid Empire","the Songhai Empire",
    "the Swahili Coast city-states","the Japanese shogunate","the Maratha Empire",
    "the Seljuk Empire","the Toltec Empire","the Mississippian culture",
    "the Polynesian empire of Tonga","the Kingdom of Kush","the Aksumite Empire",
    "the Frankish Empire","the Macedonian Empire","the Norse settlers",
    "the Delhi Sultanate","the Vijayanagara Empire","the Oyo Empire",
];

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

function pickRandom(arr, n) {
    const shuffled = [...arr].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, n);
}

function pickFreshQuestions(n) {
    const unseen = RANDOM_QUESTIONS.filter(q => !_shownQuestions.has(q));
    const pool = unseen.length >= n ? unseen : RANDOM_QUESTIONS;
    if (pool === RANDOM_QUESTIONS) _shownQuestions.clear();
    const shuffled = [...pool].sort(() => Math.random() - 0.5);
    const picked = shuffled.slice(0, n);
    picked.forEach(q => _shownQuestions.add(q));
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
    const chips = pickFreshQuestions(3);
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


let questionBox = document.getElementById("questionBox"); // Initialized outside functions

const darkTheme = [
    { elementType: "geometry", stylers: [{ color: "#242f3e" }] },
    { elementType: "labels.text.stroke", stylers: [{ color: "#242f3e" }] },
    { elementType: "labels.text.fill", stylers: [{ color: "#746855" }] },
    {
      featureType: "administrative.locality",
      elementType: "labels.text.fill",
      stylers: [{ color: "#d59563" }],
    },
    {
      featureType: "poi",
      elementType: "labels.text.fill",
      stylers: [{ color: "#d59563" }],
    },
    {
      featureType: "poi.park",
      elementType: "geometry",
      stylers: [{ color: "#263c3f" }],
    },
    {
      featureType: "poi.park",
      elementType: "labels.text.fill",
      stylers: [{ color: "#6b9a76" }],
    },
    {
      featureType: "road",
      elementType: "geometry",
      stylers: [{ color: "#38414e" }],
    },
    {
      featureType: "road",
      elementType: "geometry.stroke",
      stylers: [{ color: "#212a37" }],
    },
    {
      featureType: "road",
      elementType: "labels.text.fill",
      stylers: [{ color: "#9ca5b3" }],
    },
    {
      featureType: "road.highway",
      elementType: "geometry",
      stylers: [{ color: "#746855" }],
    },
    {
      featureType: "road.highway",
      elementType: "geometry.stroke",
      stylers: [{ color: "#1f2835" }],
    },
    {
      featureType: "road.highway",
      elementType: "labels.text.fill",
      stylers: [{ color: "#f3d19c" }],
    },
    {
      featureType: "transit",
      elementType: "geometry",
      stylers: [{ color: "#2f3948" }],
    },
    {
      featureType: "transit.station",
      elementType: "labels.text.fill",
      stylers: [{ color: "#d59563" }],
    },
    {
      featureType: "water",
      elementType: "geometry",
      stylers: [{ color: "#17263c" }],
    },
    {
      featureType: "water",
      elementType: "labels.text.fill",
      stylers: [{ color: "#515c6d" }],
    },
    {
      featureType: "water",
      elementType: "labels.text.stroke",
      stylers: [{ color: "#17263c" }],
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

let googleMapsApiKey;

// Fetch the Google Maps API key from the server
fetch('/getGoogleMapsApiKey')
    .then(response => response.json())
    .then(data => {
        console.log("Received Google Maps API key:", data.key);
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
        styles: lightTheme,
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
            const qb = document.getElementById('questionBox');
            if (qb.classList.contains('centered') && _savedResultState) {
                cancelSearch();
                return;
            }
        }
        if (event.key !== "ArrowRight" && event.key !== "ArrowLeft") return;
        const tag = document.activeElement?.tagName;
        if (tag === "INPUT" || tag === "TEXTAREA") return;
        event.preventDefault();
        if (event.key === "ArrowRight") {
            if (currentFocusedIndex === null && activeLocations.length > 0) {
                focusLocation(activeLocations[0], 1);
            } else {
                nextLocation();
            }
        } else {
            prevLocation();
        }
    }, { capture: true });

    map.addListener('idle', maybeShowPopout);
    map.addListener('zoom_changed', () => { if (map.getZoom() < 9) hideMarkerPopout(); });

    const sv = map.getStreetView();
    sv.addListener('visible_changed', function () {
        if (sv.getVisible()) {
            map.setOptions({ styles: [] });
        } else {
            const isLight = document.body.classList.contains('theme-light');
            map.setOptions({ styles: isLight ? lightTheme : darkTheme });
        }
    });

    initLandingSuggestions();
    initDetailSlider();
}

// Remaining functions remain the same...


function goBack() {
    // If zoomed into a location, restore the overview first
    if (overviewHTML !== null) {
        document.getElementById("answer").innerHTML = overviewHTML;
        overviewHTML = null;
        currentFocusedIndex = null;
        updateTimelineNav();
        if (statesStack.length === 0) {
            document.getElementById("backButton").style.display = "none";
        }
        return;
    }

    if (statesStack.length === 0) return;

    const previousState = statesStack.pop();
    map.setCenter(previousState.center);
    map.setZoom(previousState.zoom);
    document.getElementById("displayedQuestion").innerText = previousState.displayedQuestion;
    document.getElementById("questionInput").value = previousState.inputValue;
    document.getElementById("answer").innerHTML = previousState.answerHTML || '';
    document.querySelector(".collapsible-content").innerHTML = previousState.locationsHTML;
    clearMap();
    if (previousState.savedLocations?.length) renderMarkers(previousState.savedLocations);

    if (statesStack.length === 0) {
        document.getElementById("backButton").style.display = "none";
        document.getElementById('questionBox').classList.remove('result-mode');
        document.getElementById('questionBox').classList.add('centered');
        document.getElementById('topSearchWrapper').classList.remove('visible');
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
let timelineZoom = null;

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

function drawTimeline(startYear, endYear, highlights = [], periods = []) {
    timelineData = { startYear, endYear, highlights, periods };
    timelineZoom = null;
    renderTimeline();
}

function renderTimeline() {
    if (!timelineData) return;
    const { startYear, endYear, highlights } = timelineData;

    const container = document.getElementById('timeline-container');
    container.style.display = 'flex';
    document.getElementById('questionBox').style.maxHeight = 'calc(100vh - 240px)';

    const canvas = document.getElementById('timeline');
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    const ctx = canvas.getContext('2d');
    ctx.scale(dpr, dpr);

    const W = rect.width;
    const H = rect.height;
    const pad = 52;
    const lineY = H * 0.52;

    const viewStart = timelineZoom ? timelineZoom.start : startYear;
    const viewEnd   = timelineZoom ? timelineZoom.end   : endYear;
    const span = Math.max(viewEnd - viewStart, 1);
    const xFor = year => pad + ((year - viewStart) / span) * (W - pad * 2);
    const fmt  = y => y < 0 ? Math.abs(y) + ' BCE' : String(y);

    ctx.clearRect(0, 0, W, H);

    const isLight = document.body.classList.contains('theme-light');
    const lineColor    = isLight ? 'rgba(0,0,0,0.1)'   : 'rgba(255,255,255,0.18)';
    const labelColor   = isLight ? 'rgba(0,0,0,0.65)'  : 'rgba(255,255,255,0.92)';
    const yearLblColor = isLight ? 'rgba(0,0,0,0.55)'  : 'rgba(255,255,255,0.85)';

    // Base line
    ctx.strokeStyle = lineColor;
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(pad, lineY);
    ctx.lineTo(W - pad, lineY);
    ctx.stroke();

    // Year range labels at bottom corners
    ctx.font = 'bold 13px -apple-system, sans-serif';
    ctx.fillStyle = labelColor;
    ctx.textAlign = 'left';
    ctx.fillText(fmt(Math.round(viewStart)), pad, H - 4);
    ctx.textAlign = 'right';
    ctx.fillText(fmt(Math.round(viewEnd)), W - pad, H - 4);

    timelineDots = [];

    // Visible highlights
    const visible = highlights.filter(ev => ev.year >= viewStart - span * 0.02 && ev.year <= viewEnd + span * 0.02);
    const r = visible.length > 14 ? 7 : visible.length > 10 ? 8 : 10;
    const rowH = r * 2 + 3;
    function staggerAndDraw(dots) {
        const placed = [];
        function getFreeRow(x) {
            const near = placed.filter(p => Math.abs(p.x - x) < r * 2 + 2).map(p => p.row);
            for (let s = 0; s <= 4; s++) {
                for (const c of s === 0 ? [0] : [s, -s]) {
                    if (!near.includes(c)) return c;
                }
            }
            return 0;
        }
        // Assign base x positions
        dots.forEach(ev => { ev._x = xFor(ev.year); });

        // Spread same-year dots horizontally instead of stacking vertically
        const xGroups = {};
        dots.forEach(ev => {
            const key = String(ev._x);
            if (!xGroups[key]) xGroups[key] = [];
            xGroups[key].push(ev);
        });
        Object.values(xGroups).forEach(group => {
            if (group.length > 1) {
                const spread = r * 2 + 4;
                const total = (group.length - 1) * spread;
                group.forEach((ev, i) => {
                    ev._x = ev._x - total / 2 + i * spread;
                });
            }
        });

        dots.forEach(ev => {
            ev._row = getFreeRow(ev._x);
            ev._dotY = lineY - ev._row * rowH;
            placed.push({ x: ev._x, row: ev._row });
        });
        // stems — faint dashes matching node color
        dots.forEach(ev => {
            if (ev._row !== 0) {
                const t = span > 0 ? (ev.year - viewStart) / span : 0;
                const { fill } = timelineNodeColor(Math.max(0, Math.min(1, t)));
                ctx.strokeStyle = fill.replace('rgb(', 'rgba(').replace(')', ',0.25)');
                ctx.lineWidth = 1;
                ctx.setLineDash([2, 3]);
                ctx.beginPath();
                ctx.moveTo(ev._x, lineY);
                ctx.lineTo(ev._x, ev._dotY + (ev._row > 0 ? r : -r));
                ctx.stroke();
                ctx.setLineDash([]);
            }
        });
        // dots — colored fill, white number
        dots.forEach(ev => {
            const x = ev._x, dotY = ev._dotY;
            const t = span > 0 ? (ev.year - viewStart) / span : 0;
            const { fill, stroke } = timelineNodeColor(Math.max(0, Math.min(1, t)));
            ctx.beginPath();
            ctx.arc(x, dotY, r, 0, Math.PI * 2);
            ctx.fillStyle = fill;
            ctx.fill();
            ctx.strokeStyle = stroke;
            ctx.lineWidth = 1.5;
            ctx.stroke();
            // index number
            ctx.fillStyle = '#fff';
            ctx.font = `bold ${ev.index > 9 ? r - 3 : r - 2}px -apple-system, sans-serif`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(String(ev.index), x, dotY);
            ctx.textBaseline = 'alphabetic';
            // year label — very subtle
            ctx.fillStyle = yearLblColor;
            ctx.font = '11px -apple-system, sans-serif';
            ctx.textAlign = 'center';
            if (ev._row >= 0) {
                ctx.fillText(fmt(ev.year), x, dotY - r - 3);
            } else {
                ctx.textBaseline = 'top';
                ctx.fillText(fmt(ev.year), x, dotY + r + 2);
                ctx.textBaseline = 'alphabetic';
            }
            timelineDots.push({ x, y: dotY, lat: ev.lat, lng: ev.lng, label: ev.label, year: ev.year, index: ev.index, fullLocation: ev.fullLocation });
        });
    }

    staggerAndDraw(visible);

    // Playback highlight ring
    if (playbackHighlightIndex !== null) {
        const activeDot = timelineDots.find(d => d.index === playbackHighlightIndex);
        if (activeDot) {
            const hr = visible.length > 14 ? 7 : visible.length > 10 ? 8 : 10;
            ctx.beginPath();
            ctx.arc(activeDot.x, activeDot.y, hr + 5, 0, Math.PI * 2);
            ctx.strokeStyle = isLight ? 'rgba(0,0,0,0.7)' : 'rgba(255,255,255,0.9)';
            ctx.lineWidth = 2;
            ctx.stroke();
            ctx.beginPath();
            ctx.arc(activeDot.x, activeDot.y, hr + 10, 0, Math.PI * 2);
            ctx.strokeStyle = isLight ? 'rgba(0,0,0,0.2)' : 'rgba(255,255,255,0.25)';
            ctx.lineWidth = 1.5;
            ctx.stroke();
        }
    }

    // Wheel zoom
    canvas.onwheel = (e) => {
        e.preventDefault();
        const { startYear, endYear, highlights } = timelineData;
        const cr = canvas.getBoundingClientRect();
        const mx = e.clientX - cr.left;
        const vs = timelineZoom ? timelineZoom.start : startYear;
        const ve = timelineZoom ? timelineZoom.end : endYear;
        const span = ve - vs;
        const pct = (mx - 52) / Math.max(cr.width - 104, 1);
        const pivot = vs + pct * span;
        const factor = e.deltaY > 0 ? 1.25 : 0.8;
        const newSpan = Math.min(Math.max(span * factor, 5), (endYear - startYear) * 1.05 + 10);
        const newStart = pivot - pct * newSpan;
        const newEnd = newStart + newSpan;
        if (newSpan >= (endYear - startYear) * 1.0) {
            timelineZoom = null;
        } else {
            timelineZoom = { start: newStart, end: newEnd };
        }
        renderTimeline();
    };

    // Drag pan
    let dragStart = null;
    let dragBaseZoom = null;
    canvas.onmousedown = (e) => {
        if (e.button !== 0) return;
        dragStart = e.clientX;
        dragBaseZoom = timelineZoom ? { ...timelineZoom } : null;
    };
    canvas.onmousemove = (e) => {
        if (dragStart === null) return;
        const { startYear, endYear } = timelineData;
        const cr = canvas.getBoundingClientRect();
        const dx = e.clientX - dragStart;
        const base = dragBaseZoom || { start: startYear, end: endYear };
        const span = base.end - base.start;
        const pxSpan = cr.width - 104;
        const yearPerPx = span / pxSpan;
        const shift = -dx * yearPerPx;
        timelineZoom = { start: base.start + shift, end: base.end + shift };
        renderTimeline();
    };
    const endDrag = () => { dragStart = null; dragBaseZoom = null; };
    canvas.onmouseup = endDrag;
    canvas.onmouseleave = endDrag;

    canvas.onclick = (e) => {
        const cr = canvas.getBoundingClientRect();
        const mx = e.clientX - cr.left;
        const my = e.clientY - cr.top;

        for (const dot of timelineDots) {
            const dist = Math.sqrt((mx - dot.x) ** 2 + (my - dot.y) ** 2);
            if (dist < r + 4) {
                focusLocation(dot.fullLocation || { name: dot.label, lat: dot.lat, lng: dot.lng, year: dot.year }, dot.index);
                return;
            }
        }
    };
    canvas.style.cursor = 'pointer';
    renderPeriodBar();
}

function renderPeriodBar() {
    const bar = document.getElementById('period-bar');
    if (!timelineData || !timelineData.periods || !timelineData.periods.length) {
        bar.style.display = 'none';
        return;
    }

    const periods = timelineData.periods;
    const totalStart = Math.min(...periods.map(p => p.start));
    const totalEnd   = Math.max(...periods.map(p => p.end));
    const totalSpan  = Math.max(totalEnd - totalStart, 1);

    bar.innerHTML = periods.map((p) => {
        const w = ((p.end - p.start) / totalSpan) * 100;
        const t = ((p.start + p.end) / 2 - totalStart) / totalSpan;
        const { fill } = timelineNodeColor(Math.max(0, Math.min(1, t)));
        return `<div class="period-segment" style="width:${w.toFixed(3)}%;background:${fill}" title="${p.name}: ${fmtYear(p.start)} – ${fmtYear(p.end)}">
            <span class="period-segment-label">${p.name}</span>
        </div>`;
    }).join('');

    bar.style.display = 'flex';
}

function fmtYear(y) {
    return y < 0 ? Math.abs(y).toLocaleString() + ' BCE' : String(y);
}

let _savedResultState = null;

function hideTimeline() {
    const tc = document.getElementById('timeline-container');
    if (tc.style.display === 'none') return;
    tc.classList.add('timeline-exit');
    setTimeout(() => {
        tc.style.display = 'none';
        tc.classList.remove('timeline-exit');
    }, 370);
}

function showTimeline() {
    const tc = document.getElementById('timeline-container');
    tc.classList.add('timeline-exit');
    tc.style.display = 'flex';
    requestAnimationFrame(() => requestAnimationFrame(() => tc.classList.remove('timeline-exit')));
}

function openSearch() {
    const qb = document.getElementById('questionBox');
    const inResultMode = qb.classList.contains('result-mode');

    if (inResultMode) {
        _savedResultState = {
            answerHTML: document.getElementById('answer').innerHTML,
            displayedQuestion: document.getElementById('displayedQuestion').innerText,
            inputValue: document.getElementById('questionInput').value,
            locationsHTML: document.querySelector('.collapsible-content').innerHTML,
            voiceControlsDisplay: document.getElementById('voiceControls').style.display,
            timelineWasVisible: document.getElementById('timeline-container').style.display !== 'none',
        };
        document.getElementById('cancelSearchBtn').style.display = 'flex';
    }

    hideTimeline();
    qb.classList.remove('result-mode');
    qb.classList.add('centered');
    document.getElementById('topSearchWrapper').classList.remove('visible');
    setTimeout(() => document.getElementById('questionInput').focus(), 300);
}

function cancelSearch() {
    if (!_savedResultState) return;
    const qb = document.getElementById('questionBox');
    qb.classList.remove('centered');
    qb.classList.add('result-mode');
    document.getElementById('topSearchWrapper').classList.add('visible');
    document.getElementById('answer').innerHTML = _savedResultState.answerHTML;
    document.getElementById('displayedQuestion').innerText = _savedResultState.displayedQuestion;
    document.getElementById('questionInput').value = _savedResultState.inputValue;
    document.querySelector('.collapsible-content').innerHTML = _savedResultState.locationsHTML;
    document.getElementById('voiceControls').style.display = _savedResultState.voiceControlsDisplay;
    if (_savedResultState.timelineWasVisible) showTimeline();
    document.getElementById('cancelSearchBtn').style.display = 'none';
    _savedResultState = null;
}

async function askQuestion() {
    _savedResultState = null;
    document.getElementById('cancelSearchBtn').style.display = 'none';
    retryCount = 0;
    const qb = document.getElementById('questionBox');
    qb.classList.remove('centered');
    qb.classList.add('result-mode');
    const pill = document.getElementById('topSearchWrapper');
    pill.classList.add('visible');
    document.getElementById('topSearchQuery').textContent = document.getElementById('questionInput').value;
    currentFocusedIndex = null;
    timelineZoom = null;
    let question = document.getElementById("questionInput").value;
    currentQuestion = question;
    const answerBox = document.getElementById("answer");
    const loader = document.getElementById("topLoadingIndicator");
    const loadingLabel = loader.querySelector('.loading-label');

    // Save current state BEFORE clearing anything
    statesStack.push({
        center: map.getCenter(),
        zoom: map.getZoom(),
        displayedQuestion: document.getElementById("displayedQuestion").innerText,
        inputValue: document.getElementById("questionInput").value,
        answerHTML: document.getElementById("answer").innerHTML,
        locationsHTML: document.querySelector(".collapsible-content").innerHTML,
        savedLocations: [...activeLocations],
    });

    answerBox.innerHTML = "";
    answerBox.style.display = "none";
    overviewHTML = null;
    qb.classList.add('searching');
    loader.classList.add('showing');
    document.getElementById('timeline-container').style.display = 'none';
    document.getElementById('period-bar').style.display = 'none';
    document.getElementById('questionBox').style.maxHeight = 'calc(100vh - 90px)';
    document.getElementById('voiceControls').style.display = 'none';
    speechSynthesis.cancel();
    isSpeaking = false;
    isAutoplaying = false;
    const resetAutoplayBtn = document.getElementById('autoplayBtn');
    if (resetAutoplayBtn) { resetAutoplayBtn.textContent = '▶ Autoplay'; resetAutoplayBtn.classList.remove('autoplay-active'); }
    clearMap();
    resetMapView();

    loadingLabel.textContent = "Searching the archives…";

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
        const { imageUrl, articleUrl } = await fetchWikipediaImage(wikipediaHint || question);
        processResponse(response, imageUrl, articleUrl);
    } catch (error) {
        clearStreamGhost();
        loader.classList.remove('showing');
        qb.classList.remove('searching');
        answerBox.style.display = '';
        answerBox.innerHTML = "An error occurred: " + error.toString();
    }

    if (statesStack.length > 0) {
        document.getElementById("backButton").style.display = "block";
    }
}




let isSpeaking = false;
let isAutoplaying = false;
let autoplayStep = 0;

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

function speakText(text, btn) {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1.1;
    utterance.pitch = 0.95;
    const doSpeak = () => {
        const voice = pickBestVoice();
        if (voice) utterance.voice = voice;
        utterance.onend = () => { isSpeaking = false; btn.textContent = "🔊"; };
        utterance.onerror = () => { isSpeaking = false; btn.textContent = "🔊"; };
        speechSynthesis.speak(utterance);
        isSpeaking = true;
        btn.textContent = "⏹ Stop";
    };
    if (speechSynthesis.getVoices().length) {
        doSpeak();
    } else {
        speechSynthesis.onvoiceschanged = () => { speechSynthesis.onvoiceschanged = null; doSpeak(); };
    }
}

function toggleVoice() {
    const btn = document.getElementById("voiceBtn");
    if (isSpeaking) {
        speechSynthesis.cancel();
        isSpeaking = false;
        btn.textContent = "🔊";
        return;
    }

    const answerEl = document.getElementById("answer");

    // Location focus view: read only the summary prose
    const locSummary = answerEl.querySelector('.loc-focus-summary');
    if (locSummary) {
        const clone = locSummary.cloneNode(true);
        clone.querySelectorAll('a').forEach(a => a.remove());
        const text = clone.innerText.trim();
        if (!text) return;
        speakText(text, btn);
        return;
    }

    // Main view: read title + prose paragraphs only (skip bullets, headings, UI chrome)
    const title = document.getElementById('displayedQuestion')?.innerText?.trim() || '';
    const paragraphs = [...answerEl.querySelectorAll('p')]
        .map(p => p.innerText.trim())
        .filter(Boolean)
        .join(' ');
    const text = [title, paragraphs].filter(Boolean).join('. ');
    if (!text) return;

    speakText(text, btn);
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
    if (btn) { btn.textContent = '⏹ Stop'; btn.classList.add('autoplay-active'); }

    speechSynthesis.cancel();
    isSpeaking = false;
    document.getElementById('voiceBtn').textContent = '🔊';

    // Read the main summary first
    const title = document.getElementById('displayedQuestion')?.innerText?.trim() || '';
    const paragraphs = [...document.getElementById('answer').querySelectorAll('p')]
        .map(p => p.innerText.trim()).filter(Boolean).join(' ');
    const text = [title, paragraphs].filter(Boolean).join('. ');

    if (!text) { stopAutoplay(); return; }

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
    if (btn) { btn.textContent = '▶ Autoplay'; btn.classList.remove('autoplay-active'); }
}

function searchRelated(query) {
    document.getElementById("questionInput").value = query;
    askQuestion();
}

async function fetchWikipediaImage(query) {
    const result = await fetchWikipediaSummary(query);
    return { imageUrl: result.imageUrl, articleUrl: result.articleUrl };
}

async function fetchLocationImage(location) {
    const [title, ...descParts] = (location.name || '').split('—');
    const place = title.split(',')[0].trim();
    const desc = descParts.join('—').trim();

    const queries = [];
    if (desc) {
        // Prefer specific names inside parentheses, e.g. "(Eoraptor, Herrerasaurus)"
        const parenMatch = desc.match(/\(([^)]+)\)/);
        if (parenMatch) {
            parenMatch[1].split(',').forEach(s => { const t = s.trim(); if (t) queries.push(t); });
        }
        // Also try the event text without parens
        const cleanDesc = desc.replace(/\([^)]*\)/g, '').trim();
        if (cleanDesc) queries.push(cleanDesc);
    }
    queries.push(place);

    for (const q of queries) {
        const result = await fetchWikipediaSummary(q);
        if (result.imageUrl) return result;
    }
    return { imageUrl: null, articleUrl: null, extract: null };
}

async function fetchWikipediaSummary(query) {
    const STOP_WORDS = new Set(['the', 'a', 'an', 'of', 'in', 'on', 'at', 'to', 'for', 'and', 'or', 'why', 'did', 'how', 'where', 'what', 'is', 'was', 'were', 'i', 'want', 'me', 'show', 'tell', 'find', 'get', 'give']);

    async function summaryForTitle(title) {
        const res = await fetch(`https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(title)}`);
        if (!res.ok) return null;
        const data = await res.json();
        if (!data.title || data.type === 'disambiguation') return null;
        const src = data.thumbnail?.source || data.originalimage?.source;
        const articleUrl = data.content_urls?.desktop?.page || null;
        const extract = data.extract || null;
        if (src || articleUrl || extract) return { imageUrl: src || null, articleUrl, extract };
        return null;
    }

    try {
        const q = query.trim();

        // Use opensearch to find the best matching Wikipedia article for any query phrasing
        const searchRes = await fetch(`https://en.wikipedia.org/w/api.php?action=opensearch&search=${encodeURIComponent(q)}&limit=3&format=json&origin=*`);
        if (searchRes.ok) {
            const [, titles] = await searchRes.json();
            for (const title of titles) {
                const result = await summaryForTitle(title);
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

        for (const candidate of candidates) {
            const result = await summaryForTitle(candidate);
            if (result) return result;
        }

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
    if (end === -1) return { summary, locations: [], related: [] };

    let locations = [];
    try {
        const raw = JSON.parse(afterData.slice(start, end + 1));
        locations = raw.map(loc => ({
            name: loc.name,
            lat: Number(loc.latitude ?? loc.lat),
            lng: Number(loc.longitude ?? loc.lng),
            year: loc.year ?? null,
            main: loc.main === true,
            country: loc.country ?? null,
            region_countries: Array.isArray(loc.region_countries) ? loc.region_countries : null,
        })).filter(loc => !isNaN(loc.lat) && !isNaN(loc.lng));
    } catch (e) {}

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
let currentFocusedIndex = null;
let currentQuestion = '';
let locationImageCache = {};
let activePopoutIndex = null;
let playbackActive = false;
let playbackTimeouts = [];
let playbackHighlightIndex = null;
let activeShading = null;

function focusLocation(location, index) {
    hideMarkerPopout();
    const answerBox = document.getElementById("answer");
    if (overviewHTML === null) {
        overviewHTML = answerBox.innerHTML;
    }

    currentFocusedIndex = index;
    updateTimelineNav();

    const [title, ...descParts] = (location.name || '').split('—');
    const desc = descParts.join('—').trim();
    const place = title.trim();

    const yearDisplay = location.year !== null && location.year !== undefined
        ? (location.year < 0 ? `${Math.abs(location.year)} BCE` : String(location.year))
        : null;

    const coords = `${Math.abs(location.lat).toFixed(2)}°${location.lat >= 0 ? 'N' : 'S'}, ${Math.abs(location.lng).toFixed(2)}°${location.lng >= 0 ? 'E' : 'W'}`;

    const facts = [];
    if (yearDisplay) facts.push(['Year', yearDisplay]);
    if (desc) facts.push(['Event', desc]);
    facts.push(['Place', place]);
    facts.push(['Coords', coords]);
    const factsHTML = facts.map(([k, v]) =>
        `<span class="loc-fact-key">${k}</span><span class="loc-fact-val">${v}</span>`
    ).join('');

    answerBox.innerHTML = `
        <div class="loc-focus-header">Location ${index} of ${activeLocations.length}</div>
        <div class="loc-focus-title">${place}</div>
        <div id="loc-image-slot"></div>
        <div class="loc-focus-facts">${factsHTML}</div>
        <div id="loc-summary-slot"></div>
    `;

    // Render image and summary slots async — UI is already visible above
    fetchLocationImage(location).then(({ imageUrl, articleUrl }) => {
        const imgSlot = document.getElementById('loc-image-slot');
        if (imgSlot && imageUrl) {
            imgSlot.innerHTML = `<img src="${imageUrl}" alt="" class="loc-focus-img">`;
        }
        const summarySlot = document.getElementById('loc-summary-slot');
        if (summarySlot) summarySlot.dataset.articleUrl = articleUrl || '';
    });

    fetch('/location-summary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: currentQuestion, locationName: place, event: desc, year: location.year }),
    }).then(r => r.json()).then(({ summary, followUps }) => {
        const summarySlot = document.getElementById('loc-summary-slot');
        if (!summarySlot || !summary) return;
        const articleUrl = summarySlot.dataset.articleUrl || '';
        const linkHTML = articleUrl ? `<a href="${articleUrl}" target="_blank" rel="noopener noreferrer" class="loc-focus-wiki">Wikipedia ↗</a>` : '';
        const fuHTML = followUps && followUps.length
            ? `<div class="loc-followups">
                <div class="loc-followups-label">Ask next</div>
                <div class="loc-followups-chips">${followUps.map(q => `<button class="related-chip" onclick="searchRelated('${q.replace(/'/g, "\\'")}')">${q}</button>`).join('')}</div>
               </div>`
            : '';
        summarySlot.innerHTML = `<div class="loc-focus-summary">${marked.parse(summary)}${linkHTML}</div>${fuHTML}`;

        if (isAutoplaying) {
            const clone = summarySlot.querySelector('.loc-focus-summary')?.cloneNode(true);
            if (clone) {
                clone.querySelectorAll('a').forEach(a => a.remove());
                const speakText = clone.innerText.trim();
                if (speakText) {
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

    document.getElementById("backButton").style.display = "block";
    map.panTo({ lat: location.lat, lng: location.lng });
    smoothZoom(10);
}

function updateTimelineNav() {
    const prevBtn = document.getElementById('timeline-prev');
    const nextBtn = document.getElementById('timeline-next');
    if (!prevBtn || !nextBtn) return;
    prevBtn.disabled = currentFocusedIndex === null || currentFocusedIndex <= 1;
    nextBtn.disabled = currentFocusedIndex === null || currentFocusedIndex >= activeLocations.length;
}

function prevLocation() {
    if (currentFocusedIndex === null || currentFocusedIndex <= 1) return;
    const idx = currentFocusedIndex - 2;
    focusLocation(activeLocations[idx], idx + 1);
}

function nextLocation() {
    if (currentFocusedIndex === null || currentFocusedIndex >= activeLocations.length) return;
    const idx = currentFocusedIndex;
    focusLocation(activeLocations[idx], idx + 1);
}

function clearMap() {
    // Cancel any active playback without triggering the full restore path
    playbackActive = false;
    playbackHighlightIndex = null;
    playbackTimeouts.forEach(clearTimeout);
    playbackTimeouts = [];
    const playBtn = document.getElementById('playBtn');
    if (playBtn) { playBtn.textContent = '▶ Play'; playBtn.classList.remove('autoplay-active'); }

    activeMarkers.forEach(m => m.setMap(null));
    activePolylines.forEach(p => p.setMap(null));
    map.data.forEach(f => map.data.remove(f));
    activeMarkers = [];
    activePolylines = [];
    activeLocations = [];
    locationImageCache = {};
    activeShading = null;
    hideMarkerPopout();
}

function startIntroPlayback() {
    if (activeLocations.length === 0) return;

    // Hide all markers and polyline so we can animate them in from scratch
    activeMarkers.forEach(m => m.setMap(null));
    activePolylines.forEach(p => p.setMap(null));
    activePolylines = [];

    playbackActive = true;
    playbackHighlightIndex = null;

    const animPolyline = new google.maps.Polyline({
        path: [],
        geodesic: true,
        strokeColor: '#6366f1',
        strokeOpacity: 0.55,
        strokeWeight: 2,
    });
    animPolyline.setMap(map);
    activePolylines.push(animPolyline);

    const STEP_MS = 215; // 7× faster than the manual play button (1500ms)

    activeLocations.forEach((loc, i) => {
        playbackTimeouts.push(setTimeout(() => {
            if (!playbackActive) return;
            activeMarkers[i].setAnimation(google.maps.Animation.DROP);
            activeMarkers[i].setMap(map);
            animPolyline.getPath().push(new google.maps.LatLng(loc.lat, loc.lng));
            playbackHighlightIndex = i + 1;
            renderTimeline();
            if (i === activeLocations.length - 1) {
                playbackTimeouts.push(setTimeout(() => stopPlayback(true), 800));
            }
        }, i * STEP_MS));
    });
}

function startPlayback() {
    if (activeLocations.length === 0) return;
    stopPlayback();
    playbackActive = true;

    activeMarkers.forEach(m => m.setMap(null));
    activePolylines.forEach(p => p.setMap(null));
    activePolylines = [];

    const animPolyline = new google.maps.Polyline({
        path: [],
        geodesic: true,
        strokeColor: '#6366f1',
        strokeOpacity: 0.55,
        strokeWeight: 2,
    });
    animPolyline.setMap(map);
    activePolylines.push(animPolyline);

    const btn = document.getElementById('playBtn');
    if (btn) { btn.textContent = '⏹ Stop'; btn.classList.add('autoplay-active'); }

    if (activeLocations.length > 1) {
        const bounds = new google.maps.LatLngBounds();
        activeLocations.forEach(l => bounds.extend({ lat: l.lat, lng: l.lng }));
        map.fitBounds(bounds);
    }

    const STEP_MS = 1500;
    activeLocations.forEach((loc, i) => {
        playbackTimeouts.push(setTimeout(() => {
            if (!playbackActive) return;
            activeMarkers[i].setAnimation(google.maps.Animation.DROP);
            activeMarkers[i].setMap(map);
            animPolyline.getPath().push(new google.maps.LatLng(loc.lat, loc.lng));
            map.panTo({ lat: loc.lat, lng: loc.lng });
            map.setZoom(6);
            playbackHighlightIndex = i + 1;
            renderTimeline();
            if (i === activeLocations.length - 1) {
                playbackTimeouts.push(setTimeout(() => stopPlayback(true), 1200));
            }
        }, i * STEP_MS));
    });
}

function stopPlayback(finished = false) {
    playbackActive = false;
    playbackHighlightIndex = null;
    playbackTimeouts.forEach(clearTimeout);
    playbackTimeouts = [];

    const btn = document.getElementById('playBtn');
    if (btn) { btn.textContent = '▶ Play'; btn.classList.remove('autoplay-active'); }

    if (!finished && activeLocations.length > 0) {
        activeMarkers.forEach(m => m.setMap(map));
        activePolylines.forEach(p => p.setMap(null));
        activePolylines = [];
        if (activeLocations.length > 1) {
            const polyline = new google.maps.Polyline({
                path: activeLocations.map(l => ({ lat: l.lat, lng: l.lng })),
                geodesic: true,
                strokeColor: '#6366f1',
                strokeOpacity: 0.4,
                strokeWeight: 1.5,
            });
            polyline.setMap(map);
            activePolylines.push(polyline);
        }
    }

    renderTimeline();
}

async function fetchCountryOutline(country) {
    try {
        const res = await fetch(
            `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(country)}&polygon_geojson=1&format=json&limit=1`,
            { headers: { 'Accept-Language': 'en' } }
        );
        if (!res.ok) return;
        const data = await res.json();
        if (!data.length || !data[0].geojson) return;
        map.data.addGeoJson({ type: 'Feature', geometry: data[0].geojson, properties: {} });
        const isLight = document.body.classList.contains('theme-light');
        map.data.setStyle({
            fillColor: isLight ? '#6366f1' : '#818cf8',
            fillOpacity: 0.12,
            strokeColor: isLight ? '#6366f1' : '#818cf8',
            strokeWeight: 2,
            strokeOpacity: 0.75,
        });
    } catch { /* silently ignore */ }
}

async function fetchRegionShading(countries) {
    try {
        const results = await Promise.allSettled(
            countries.map(c =>
                fetch(
                    `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(c)}&polygon_geojson=1&format=json&limit=1`,
                    { headers: { 'Accept-Language': 'en' } }
                ).then(r => r.json())
            )
        );
        results.forEach(r => {
            if (r.status !== 'fulfilled' || !r.value?.length || !r.value[0].geojson) return;
            map.data.addGeoJson({ type: 'Feature', geometry: r.value[0].geojson, properties: {} });
        });
        const isLight = document.body.classList.contains('theme-light');
        map.data.setStyle({
            fillColor: isLight ? '#f97316' : '#fb923c',
            fillOpacity: 0.1,
            strokeColor: isLight ? '#f97316' : '#fb923c',
            strokeWeight: 1.5,
            strokeOpacity: 0.65,
        });
    } catch { /* silently ignore */ }
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

function maybeShowPopout() {
    // Don't show popout while viewing a focused location in the sidebar
    if (overviewHTML !== null || map.getZoom() < 9 || activeLocations.length === 0) {
        hideMarkerPopout();
        return;
    }
    const mapDiv = document.getElementById('map');
    const mapRect = mapDiv.getBoundingClientRect();
    const centerX = mapRect.left + mapRect.width / 2;
    const centerY = mapRect.top + mapRect.height / 2;

    let closest = null;
    let closestDist = Infinity;
    activeLocations.forEach((loc, i) => {
        const pos = getMarkerScreenPos(new google.maps.LatLng(loc.lat, loc.lng));
        if (!pos) return;
        const dist = Math.sqrt((pos.x - centerX) ** 2 + (pos.y - centerY) ** 2);
        if (dist < closestDist) { closestDist = dist; closest = { loc, index: i + 1, pos }; }
    });

    if (closest && closestDist < 250) {
        showMarkerPopoutForLocation(closest.loc, closest.index, closest.pos);
    } else {
        hideMarkerPopout();
    }
}

function showMarkerPopoutForLocation(location, index, screenPos) {
    if (activePopoutIndex === index) {
        // Just reposition if already showing
        const popout = document.getElementById('marker-popout');
        popout.style.left = screenPos.x + 'px';
        popout.style.top = screenPos.y + 'px';
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
        if (cached.extract) {
            extractEl.textContent = cached.extract;
            extractEl.style.display = '';
        } else {
            extractEl.style.display = 'none';
        }
    } else {
        img.style.display = 'none';
        placeholder.style.display = '';
        extractEl.style.display = 'none';
        fetchLocationImage(location).then(({ imageUrl, extract }) => {
            locationImageCache[index] = { imageUrl, extract };
            if (activePopoutIndex !== index) return;
            if (imageUrl) { img.src = imageUrl; img.style.display = ''; placeholder.style.display = 'none'; }
            if (extract) { extractEl.textContent = extract; extractEl.style.display = ''; }
        });
    }

    popout.style.left = screenPos.x + 'px';
    popout.style.top = screenPos.y + 'px';
    popout.classList.remove('visible');
    // Force reflow so animation replays
    void popout.offsetWidth;
    popout.classList.add('visible');
}

function hideMarkerPopout() {
    if (activePopoutIndex === null) return;
    activePopoutIndex = null;
    document.getElementById('marker-popout').classList.remove('visible');
}

function handlePopoutClick() {
    if (activePopoutIndex === null) return;
    const idx = activePopoutIndex;
    const loc = activeLocations[idx - 1];
    hideMarkerPopout();
    focusLocation(loc, idx);
}

function processResponse(data, imageUrl = null, articleUrl = null) {
    if (!data.answer) {
        document.getElementById("answer").innerHTML = "No response received.";
        return;
    }

    const { summary, locations, related, periods } = parseLocations(data.answer);

    // Split the hook/intro from the rest (## headings)
    const firstHeadingIdx = summary.indexOf('\n##');
    const intro = firstHeadingIdx !== -1 ? summary.slice(0, firstHeadingIdx).trim() : '';
    const bodyMarkdown = firstHeadingIdx !== -1 ? summary.slice(firstHeadingIdx).trim() : summary;

    const introHTML = intro
        ? `<div class="answer-hero">${marked.parse(intro)}</div>`
        : '';

    const imgHTML = imageUrl
        ? `<img src="${imageUrl}" alt="" style="width:100%;border-radius:10px;margin-bottom:12px;display:block;object-fit:cover;max-height:180px">`
        : '';

    const sourceHTML = articleUrl
        ? `<div class="source-line">Source: <a href="${articleUrl}" target="_blank" rel="noopener noreferrer">Wikipedia</a></div>`
        : '';

    const relatedHTML = related.length > 0
        ? `<div class="related-section">
            <div class="related-label">Explore further</div>
            <div class="related-chips">${related.map(r => `<button class="related-chip" onclick="searchRelated('${r.replace(/'/g, "\\'")}')">${r}</button>`).join('')}</div>
           </div>`
        : '';

    const journeyHTML = locations.length > 0
        ? `<div class="journey-cta" onclick="focusLocation(activeLocations[0], 1)">
            <span class="journey-cta-icon">🗺️</span>
            <div class="journey-cta-text">
                <div class="journey-cta-label">Begin Journey</div>
                <div class="journey-cta-sub">${locations.length} location${locations.length !== 1 ? 's' : ''} to explore</div>
            </div>
            <span class="journey-cta-arrow">→</span>
           </div>`
        : '';

    document.getElementById("answer").innerHTML = introHTML + imgHTML + journeyHTML + marked.parse(bodyMarkdown) + sourceHTML + relatedHTML;
    document.getElementById("voiceControls").style.display = "block";
    document.getElementById("voiceBtn").textContent = "🔊";
    const autoplayBtn = document.getElementById('autoplayBtn');
    if (autoplayBtn) {
        autoplayBtn.textContent = '▶ Autoplay';
        autoplayBtn.classList.remove('autoplay-active');
        autoplayBtn.disabled = locations.length === 0;
    }
    const playBtn = document.getElementById('playBtn');
    if (playBtn) playBtn.disabled = locations.length === 0;

    if (locations.length === 0) return;

    activeLocations = locations;
    annotateLocationsInSummary(locations);
    renderMarkers(locations, periods);
    startIntroPlayback();
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

function buildImageMarkerSvg(n, color, dataUri) {
    return `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="46" height="58" viewBox="0 0 46 58">
        <defs>
            <filter id="shi${n}"><feDropShadow dx="0" dy="2" stdDeviation="2" flood-color="rgba(0,0,0,0.35)"/></filter>
            <clipPath id="cp${n}"><circle cx="23" cy="21" r="16"/></clipPath>
        </defs>
        <path d="M23 2 C11 2 2 11 2 23 C2 36 23 56 23 56 C23 56 44 36 44 23 C44 11 35 2 23 2Z" fill="${color}" filter="url(#shi${n})"/>
        <circle cx="23" cy="21" r="17.5" fill="#fff"/>
        <image href="${dataUri}" x="6" y="4" width="34" height="34" clip-path="url(#cp${n})" preserveAspectRatio="xMidYMid slice"/>
        <circle cx="34" cy="33" r="7.5" fill="${color}" stroke="#fff" stroke-width="1.5"/>
        <text x="34" y="33" text-anchor="middle" dominant-baseline="middle" font-family="-apple-system,sans-serif" font-size="${n > 9 ? 7 : 8}" font-weight="800" fill="#fff">${n}</text>
    </svg>`;
}

function renderMarkers(locations, periods = []) {
    const bounds = new google.maps.LatLngBounds();
    const infowindow = new google.maps.InfoWindow();
    const locationsContainer = document.querySelector(".collapsible-content");
    locationsContainer.innerHTML = "";

    const withYearsList = locations.filter(l => l.year !== null && l.year !== undefined);
    const minYear = withYearsList.length ? Math.min(...withYearsList.map(l => l.year)) : null;
    const maxYear = withYearsList.length ? Math.max(...withYearsList.map(l => l.year)) : null;
    const useTimeColor = withYearsList.length > 1;

    locations.forEach((location, index) => {
        const locationDiv = document.createElement("div");
        locationDiv.classList.add("location-item");
        const yearLabel = location.year !== null ? `<span class="location-year">${location.year < 0 ? Math.abs(location.year) + ' BCE' : location.year}</span>` : '';
        locationDiv.innerHTML = `<span class="location-index">${index + 1}</span><span class="location-name">${location.name}</span>${yearLabel}`;
        locationDiv.addEventListener("click", () => focusLocation(location, index + 1));
        locationsContainer.appendChild(locationDiv);

        const n = index + 1;
        const isMain = location.main === true;
        const color = useTimeColor ? yearToColor(location.year, minYear, maxYear) : '#6366f1';

        let svg, markerSize, markerAnchor;
        if (isMain) {
            svg = `<svg xmlns="http://www.w3.org/2000/svg" width="48" height="60" viewBox="0 0 48 60">
                <filter id="shadowM"><feDropShadow dx="0" dy="3" stdDeviation="3" flood-color="rgba(0,0,0,0.45)"/></filter>
                <path d="M24 2 C12 2 2 12 2 24 C2 38 24 58 24 58 C24 58 46 38 46 24 C46 12 36 2 24 2 Z" fill="#f97316" filter="url(#shadowM)"/>
                <text x="24" y="30" text-anchor="middle" font-family="-apple-system,sans-serif" font-size="18" fill="#fff">★</text>
            </svg>`;
            markerSize = new google.maps.Size(48, 60);
            markerAnchor = new google.maps.Point(24, 58);
        } else {
            svg = `<svg xmlns="http://www.w3.org/2000/svg" width="30" height="38" viewBox="0 0 30 38">
                <filter id="shadow${n}"><feDropShadow dx="0" dy="1.5" stdDeviation="1.5" flood-color="rgba(0,0,0,0.3)"/></filter>
                <path d="M15 2 C8 2 2 8 2 15 C2 24 15 36 15 36 C15 36 28 24 28 15 C28 8 22 2 15 2 Z" fill="${color}" filter="url(#shadow${n})"/>
                <text x="15" y="19" text-anchor="middle" font-family="-apple-system,sans-serif" font-size="${n > 9 ? 8 : 10}" font-weight="800" fill="#fff">${n}</text>
            </svg>`;
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

        if (!isMain) {
            fetchLocationImage(location).then(({ imageUrl, extract }) => {
                locationImageCache[n] = { imageUrl, extract };
                if (!imageUrl) return;
                fetchImageAsDataUri(imageUrl).then(dataUri => {
                    if (!dataUri) return;
                    marker.setIcon({
                        url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(buildImageMarkerSvg(n, color, dataUri)),
                        scaledSize: new google.maps.Size(46, 58),
                        anchor: new google.maps.Point(23, 56),
                    });
                });
            });
        }

        const tooltip = document.getElementById('map-tooltip');
        marker.addListener('mouseover', (e) => {
            const [title, ...descParts] = (location.name || '').split('—');
            const place = title.trim();
            const event = descParts.join('—').trim();
            const yearStr = location.year !== null && location.year !== undefined
                ? (location.year < 0 ? `${Math.abs(location.year)} BCE` : String(location.year))
                : null;
            tooltip.innerHTML =
                `<div class="map-tooltip-name">${place}</div>` +
                (event ? `<div class="map-tooltip-event">${event}</div>` : '') +
                (yearStr ? `<div class="map-tooltip-year">${yearStr}</div>` : '');
            const de = e.domEvent;
            tooltip.style.left = de.clientX + 'px';
            tooltip.style.top = de.clientY + 'px';
            tooltip.classList.add('visible');
        });
        marker.addListener('mouseout', () => tooltip.classList.remove('visible'));

        activeMarkers.push(marker);
        bounds.extend(marker.position);
    });

    const polyline = new google.maps.Polyline({
        path: locations.map(l => ({ lat: l.lat, lng: l.lng })),
        geodesic: true,
        strokeColor: "#6366f1",
        strokeOpacity: 0.4,
        strokeWeight: 1.5,
    });
    polyline.setMap(map);
    activePolylines.push(polyline);

    if (locations.length === 1) {
        map.setZoom(10);
        map.setCenter({ lat: locations[0].lat, lng: locations[0].lng });
    } else {
        map.fitBounds(bounds);
    }

    document.querySelector(".collapsible-btn").style.display = "block";

    const mainLoc = locations.find(l => l.main);
    if (mainLoc?.region_countries?.length) {
        activeShading = 'region';
        fetchRegionShading(mainLoc.region_countries);
    } else if (mainLoc?.country) {
        activeShading = 'country';
        fetchCountryOutline(mainLoc.country);
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
        drawTimeline(Math.min(...years), Math.max(...years), highlights, periods);
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
                html = html.replace(regex, `<span class="loc-link" onclick="focusLocation(activeLocations[${index - 1}], ${index})"><span class="loc-badge">${index}</span>$1</span>`);
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



function toggleTheme() {
    const isLight = document.body.classList.toggle('theme-light');
    document.getElementById('theme-toggle').textContent = isLight ? '🌙' : '☀️';
    localStorage.setItem('earthlopedia-theme', isLight ? 'light' : 'dark');
    renderTimeline();
    if (activeShading === 'country') {
        map.data.setStyle({
            fillColor: isLight ? '#6366f1' : '#818cf8',
            fillOpacity: 0.12,
            strokeColor: isLight ? '#6366f1' : '#818cf8',
            strokeWeight: 2,
            strokeOpacity: 0.75,
        });
    } else if (activeShading === 'region') {
        map.data.setStyle({
            fillColor: isLight ? '#f97316' : '#fb923c',
            fillOpacity: 0.1,
            strokeColor: isLight ? '#f97316' : '#fb923c',
            strokeWeight: 1.5,
            strokeOpacity: 0.65,
        });
    }
}

(function() {
    if (localStorage.getItem('earthlopedia-theme') === 'light') {
        document.body.classList.add('theme-light');
        const btn = document.getElementById('theme-toggle');
        if (btn) btn.textContent = '🌙';
    }
})();
