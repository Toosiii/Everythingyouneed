import allData from './data.yaml'

let currentTopicId = null;
let selectedTag = null;
let selectedGame = null;
let currentLanguage = 'en';

// ============================================================
// HILFSFUNKTIONEN FÜR TAILWIND-SICHTBARKEIT (.hidden)
// ============================================================
function show(id) {
    const el = document.getElementById(id);
    if (el) el.classList.remove('hidden');
}

function hide(id) {
    const el = document.getElementById(id);
    if (el) el.classList.add('hidden');
}

function trans(key) {
    return allData.translations[currentLanguage]?.[key] || key;
}

function toggleSettings() {
    const modal = document.getElementById('settingsModal');
    if (modal) {
        // Nutzt jetzt classList.toggle statt unsauberes inline-style.display
        modal.classList.toggle('hidden');
    }
}

function toggleDarkMode() {
    const isDarkMode = document.documentElement.classList.toggle('dark');
    const toggleBtn = document.getElementById('darkModeToggle');
    if (toggleBtn) toggleBtn.checked = isDarkMode;
    
    // UPGRADE 1: localStorage.setItem HIER KOMPLETT ENTFERNT FÜR 100% DATENSCHUTZ
}

function changeLanguage(lang) {
    currentLanguage = lang;
    document.documentElement.lang = lang;
    
    const langSelect = document.getElementById('settingsLanguageSelect');
    if (langSelect) langSelect.value = lang;

    // Automatisierte Übersetzungsschleife für saubereren Code
    const elementsToTranslate = {
        'sidebarTitle': 'topics',
        'gamesCategoryTitle': 'games',
        'landingTitle': 'everythingYouNeed',
        'landingSubtitle': 'startBrowsing',
        'searchInput': 'search', 
        'settingsBtnText': 'settings',
        'settingsTitle': 'settings',
        'darkModeLabel': 'darkMode',
        'languageLabel': 'languageLabel',
        'versionText': 'versionText',
        'creditsTitle': 'creditsTitle',
        'featureTitle1': 'featureTitle1',
        'featureDesc1': 'featureDesc1',
        'featureTitle2': 'featureTitle2',
        'featureDesc2': 'featureDesc2',
        'featureTitle3': 'featureTitle3',
        'featureDesc3': 'featureDesc3',
        'statTopics': 'statTopics',
        'statLinks': 'statLinks',
        'statLanguages': 'statLanguages'
    };

    Object.entries(elementsToTranslate).forEach(([id, key]) => {
        const el = document.getElementById(id);
        if (!el) return;
        if (id === 'searchInput') {
            el.placeholder = trans(key);
        } else {
            el.textContent = trans(key);
        }
    });

    // Update der Themen-Anzahl in den Statistiken
    const statNum = document.querySelector('.stat-number');
    if (statNum) statNum.textContent = allData.topics?.length || 0;

    // Dropdown dynamisch neu aufbauen
    const select = document.getElementById('topicsDropdown');
    if (select) {
        select.innerHTML = `<option value="">${trans('selectTopic')}</option>`;
        allData.topics?.forEach(topic => {
            const option = document.createElement('option');
            option.value = topic.id;
            option.textContent = topic.name;
            select.appendChild(option);
        });
    }

    // UPGRADE 1: localStorage.setItem FÜR SPRACHE EBENFALLS ENTFERNT
}

function loadData() {
    // Standardmäßig direkt Dark Mode aktivieren (ohne etwas zu tracken/speichern)
    document.documentElement.classList.add('dark');
    const toggleBtn = document.getElementById('darkModeToggle');
    if (toggleBtn) toggleBtn.checked = true;

    // Gesamte Links für die Landingpage-Statistik zählen
    const totalLinks = allData.topics?.reduce((sum, t) => sum + (t.links?.length || 0), 0) || 0;
    const totalLinksEl = document.getElementById('totalLinks');
    if (totalLinksEl) totalLinksEl.textContent = totalLinks + '+';

    // Sprache initialisieren (Startet immer frisch auf Englisch/Standard)
    changeLanguage(currentLanguage);

    const settingsModal = document.getElementById('settingsModal');
    if (settingsModal) {
        settingsModal.addEventListener('click', function (e) {
            if (e.target === this) toggleSettings();
        });
    }

    // URL-Parameter für direktes Teilen von Links parsen (Clever & ohne Speicherbedarf!)
    const params = new URLSearchParams(window.location.search);
    const topicParam = params.get('topic');
    const tagParam = params.get('tag');
    const searchParam = params.get('search');

    if (topicParam) {
        selectTopic(topicParam);
        if (tagParam) selectedTag = tagParam;
        if (searchParam) {
            const searchInput = document.getElementById('searchInput');
            if (searchInput) searchInput.value = searchParam;
        }
        filterLinks();
    }
}

function selectTopic(topicId) {
    if (!topicId) {
        show('landingPage');
        hide('topicContent');
        hide('gamesCategory');
        return;
    }

    currentTopicId = topicId;
    selectedTag = null;
    selectedGame = null;
    
    const searchInput = document.getElementById('searchInput');
    if (searchInput) searchInput.value = '';
    
    const dropdown = document.getElementById('topicsDropdown');
    if (dropdown) dropdown.value = topicId;

    const current = allData.topics?.find(t => t.id === topicId);
    if (!current) return;

    hide('landingPage');
    show('topicContent');
    
    const titleEl = document.getElementById('topicTitle');
    if (titleEl) titleEl.textContent = current.name;

    if (topicId === 'Games') {
        show('gamesCategory');
        renderGameCategories(current);
    } else {
        hide('gamesCategory');
    }

    renderTags(current);
    filterLinks();

    window.history.pushState(null, '', `?topic=${encodeURIComponent(topicId)}`);
}

function renderTags(topic) {
    const tagsList = document.getElementById('tagsList');
    if (!tagsList) return;
    tagsList.innerHTML = '';

    const allTags = {};
    topic.links?.forEach(link => {
        link.tags?.forEach(tag => { allTags[tag] = true; });
    });

    Object.keys(allTags).forEach(tag => {
        const a = document.createElement('a');
        a.href = '#';
        a.textContent = tag;
        a.className = 'px-2 py-1 bg-gray-300 dark:bg-gray-700 rounded text-sm cursor-pointer hover:bg-gray-400 dark:hover:bg-gray-600';
        a.onclick = (e) => {
            e.preventDefault();
            selectedTag = selectedTag === tag ? null : tag;
            window.history.pushState(null, '', `?topic=${currentTopicId}&tag=${selectedTag || ''}`);
            filterLinks();
        };
        tagsList.appendChild(a);
    });
}

function renderGameCategories(topic) {
    const gamesList = document.getElementById('gamesList');
    if (!gamesList) return;
    gamesList.innerHTML = '';

    const games = new Set();
    topic.links?.forEach(link => { if (link.game) games.add(link.game); });

    games.forEach(game => {
        const a = document.createElement('a');
        a.href = '#';
        a.textContent = game;
        a.className = 'px-3 py-2 rounded hover:bg-gray-200 dark:hover:bg-gray-700 cursor-pointer text-sm';
        a.onclick = (e) => {
            e.preventDefault();
            selectedGame = selectedGame === game ? null : game;
            filterLinks();
        };
        gamesList.appendChild(a);
    });
}

function filterLinks() {
    const current = allData.topics?.find(t => t.id === currentTopicId);
    if (!current) return;

    let links = current.links || [];
    const searchInput = document.getElementById('searchInput');
    const rawSearch = searchInput ? searchInput.value.trim() : '';
    const search = rawSearch.toLowerCase();

    if (search) {
        const terms = search.split(/\s+/).filter(Boolean);
        links = links.filter(l => {
            const haystack = [l.title || '', l.description || '', l.url || '', (l.tags || []).join(' '), l.game || ''].join(' ').toLowerCase();
            return terms.every(t => haystack.includes(t));
        });
    }

    if (selectedTag) links = links.filter(l => l.tags?.includes(selectedTag));
    if (selectedGame && currentTopicId === 'Games') links = links.filter(l => l.game === selectedGame);

    const resultsCount = document.getElementById('resultsCount');
    if (resultsCount) {
        resultsCount.textContent = links.length ? `${links.length} result${links.length > 1 ? 's' : ''}` : trans('noResults');
    }

    renderLinks(links, rawSearch);
}

function escapeRegExp(string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function highlightText(text, rawSearch) {
    if (!rawSearch) return text;
    const terms = rawSearch.split(/\s+/).filter(Boolean);
    let result = text;
    terms.forEach(term => {
        try {
            const re = new RegExp('(' + escapeRegExp(term) + ')', 'ig');
            result = result.replace(re, '<span class="match-highlight">$1</span>');
        } catch (e) {}
    });
    return result;
}

function renderLinks(links, rawSearch) {
    const linksList = document.getElementById('linksList');
    if (!linksList) return;
    linksList.innerHTML = '';

    links.forEach(link => {
        const div = document.createElement('div');
        div.className = 'bg-white dark:bg-gray-800 p-4 rounded-2xl shadow hover:shadow-lg hover:-translate-y-1 transition';

        const title = document.createElement('h3');
        title.className = 'font-semibold text-lg';
        title.innerHTML = highlightText(link.title || '', rawSearch);

        const url = document.createElement('a');
        url.href = link.url;
        url.target = '_blank';
        url.className = 'text-blue-500 text-sm break-all';
        url.innerHTML = highlightText(link.url || '', rawSearch);

        const desc = document.createElement('p');
        desc.className = 'text-gray-600 dark:text-gray-300 text-sm mt-1';
        desc.innerHTML = highlightText(link.description || '', rawSearch);

        div.appendChild(title);
        div.appendChild(url);
        div.appendChild(desc);
        linksList.appendChild(div);
    });
}

// ============================================================
// UPGRADE 3: GLOBALE TASTATUR-SHORTCUTS (0 Bytes Datenspeicherung)
// ============================================================
window.addEventListener('keydown', (e) => {
    const searchInput = document.getElementById('searchInput');
    
    // 1. Wenn "/" gedrückt wird: Sofort ins Suchfeld springen (außer man tippt schon irgendwo)
    if (e.key === '/' && document.activeElement !== searchInput) {
        e.preventDefault(); 
        if (searchInput) {
            searchInput.focus();
            searchInput.select();
        }
    }
    
    // 2. Wenn "Escape" gedrückt wird: Modals schießen oder Suche abbrechen
    if (e.key === 'Escape') {
        const settingsModal = document.getElementById('settingsModal');
        if (settingsModal && !settingsModal.classList.contains('hidden')) {
            toggleSettings();
            return;
        }
        if (searchInput && document.activeElement === searchInput) {
            searchInput.value = '';
            filterLinks();
            searchInput.blur();
        }
    }
});

// Expose functions to global scope (wichtig für HTML inline onclick-Handler)
window.toggleSettings = toggleSettings;
window.toggleDarkMode = toggleDarkMode;
window.changeLanguage = changeLanguage;
window.selectTopic = selectTopic;
window.filterLinks = filterLinks;
window.clearSearch = () => {
    const searchInput = document.getElementById('searchInput');
    if (searchInput) searchInput.value = '';
    filterLinks();
};

document.documentElement.classList.add('dark');
window.addEventListener('DOMContentLoaded', loadData);