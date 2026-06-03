let allData = null;
let currentTopicId = null;
let selectedTag = null;
let selectedGame = null;
let currentLanguage = 'en';
let selectedPriceFilter = 'all';
let selectedLangFilter = null;

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

function hideAllPanels() {
    ['landingPage', 'topicContent', 'vaultContent', 'vaultCategory', 'vaultDetail', 'vaultTool'].forEach(hide);
}

function trans(key) {
    return allData?.translations?.[currentLanguage]?.[key] || key;
}

function toggleSettings() {
    const modal = document.getElementById('settingsModal');
    if (modal) {
        modal.classList.toggle('hidden');
    }
}

function initTheme() {
    const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)');
    
    function applyTheme(isDark) {
        if (isDark) {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.add('dark'); // Standardmäßig dunkel lassen
        }
        const toggleBtn = document.getElementById('darkModeToggle');
        if (toggleBtn) toggleBtn.checked = isDark;
    }

    applyTheme(systemPrefersDark.matches);

    systemPrefersDark.addEventListener('change', (e) => {
        applyTheme(e.matches);
    });
}

function toggleDarkMode() {
    const isDarkMode = document.documentElement.classList.toggle('dark');
    const toggleBtn = document.getElementById('darkModeToggle');
    if (toggleBtn) toggleBtn.checked = isDarkMode;
}

function changeLanguage(lang) {
    currentLanguage = lang;
    document.documentElement.lang = lang;
    
    const langSelect = document.getElementById('settingsLanguageSelect');
    if (langSelect) langSelect.value = lang;

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

    const statNum = document.querySelector('.stat-number');
    if (statNum) statNum.textContent = allData?.topics?.length || 0;

    const select = document.getElementById('topicsDropdown');
    if (select) {
        select.innerHTML = `<option value="">${trans('selectTopic')}</option>`;
        allData?.topics?.forEach(topic => {
            const option = document.createElement('option');
            option.value = topic.id;
            option.textContent = topic.name;
            select.appendChild(option);
        });
    }
}

async function loadData() {
    try {
        const res = await fetch('data.yaml');
        if (!res.ok) throw new Error('HTTP ' + res.status);
        allData = jsyaml.load(await res.text());
    } catch (err) {
        console.error("Error loading data.yaml:", err);
        document.body.innerHTML = '<div style="padding:2rem;color:red;font-family:sans-serif;text-align:center;">⚠️ <b>data.yaml konnte nicht geladen werden.</b><br>Bitte stelle sicher, dass du einen lokalen Server nutzt (z.B. Live Server in VS Code) und kein file:/// in der Adresszeile steht.</div>';
        return;
    }

    document.documentElement.classList.add('dark');
    const toggleBtn = document.getElementById('darkModeToggle');
    if (toggleBtn) toggleBtn.checked = true;

    const totalLinks = allData?.topics?.reduce((sum, t) => sum + (t.links?.length || 0), 0) || 0;
    
    // Befülle alle Statistik-Counter im UI falls vorhanden
    if (document.getElementById('heroLinksNum')) document.getElementById('heroLinksNum').textContent = totalLinks;
    if (document.getElementById('heroTopicsNum')) document.getElementById('heroTopicsNum').textContent = allData?.topics?.length || 0;
    if (document.getElementById('totalLinks')) document.getElementById('totalLinks').textContent = totalLinks + '+';
    if (document.getElementById('statTopicsNum')) document.getElementById('statTopicsNum').textContent = allData?.topics?.length || 0;

    changeLanguage(currentLanguage);

    const settingsModal = document.getElementById('settingsModal');
    if (settingsModal) {
        settingsModal.addEventListener('click', function (e) {
            if (e.target === this) toggleSettings();
        });
    }

    // Deep-Linking URL-Parameter auslesen
    const params = new URLSearchParams(window.location.search);
    const screenParam = params.get('screen');
    const topicParam = params.get('topic');
    const tagParam = params.get('tag');
    const searchParam = params.get('search');

    if (screenParam === 'app' || topicParam) {
        showApp();
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
}

function showApp() {
    hide('screen-home');
    show('screen-app');
}

function showHome() {
    hide('screen-app');
    show('screen-home');
}

function toggleSidebar() {
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('sidebarOverlay');
    if (sidebar) sidebar.classList.toggle('-translate-x-full');
    if (overlay) overlay.classList.toggle('hidden');
}

function closeSidebar() {
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('sidebarOverlay');
    if (sidebar) sidebar.classList.add('-translate-x-full');
    if (overlay) overlay.classList.add('hidden');
}

function showVault() {
    hideAllPanels();
    show('vaultContent');
}

function closeVaultCategory() {
    hideAllPanels();
    show('vaultContent');
}

function closeVaultDetail() {
    hideAllPanels();
    show('vaultContent');
}

function closeVaultTool() {
    hideAllPanels();
    show('vaultContent');
}

function setPriceFilter(filter) {
    selectedPriceFilter = filter;
    ['filter-all', 'filter-free', 'filter-paid', 'filter-freemium'].forEach(id => {
        const btn = document.getElementById(id);
        if (btn) {
            if (id === `filter-${filter}`) btn.classList.add('active');
            else btn.classList.remove('active');
        }
    });
    filterLinks();
}

function setLangFilter(lang) {
    selectedLangFilter = lang;
    ['lang-all', 'lang-EN', 'lang-DE', 'lang-Multi'].forEach(id => {
        const btn = document.getElementById(id);
        if (btn) {
            if ((lang === null && id === 'lang-all') || (id === `lang-${lang}`)) {
                btn.classList.add('active');
            } else {
                btn.classList.remove('active');
            }
        }
    });
    filterLinks();
}

function selectTopic(topicId) {
    if (!topicId) {
        hideAllPanels();
        show('landingPage');
        return;
    }

    currentTopicId = topicId;
    selectedTag = null;
    selectedGame = null;
    
    const searchInput = document.getElementById('searchInput');
    if (searchInput) searchInput.value = '';
    
    const dropdown = document.getElementById('topicsDropdown');
    if (dropdown) dropdown.value = topicId;

    const current = allData?.topics?.find(t => t.id === topicId);
    if (!current) return;

    hideAllPanels();
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

    window.history.pushState(null, '', `?screen=app&topic=${encodeURIComponent(topicId)}`);
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
            window.history.pushState(null, '', `?screen=app&topic=${currentTopicId}&tag=${selectedTag || ''}`);
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
    const current = allData?.topics?.find(t => t.id === currentTopicId);
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
    
    if (selectedPriceFilter !== 'all') {
        links = links.filter(l => l.price?.toLowerCase() === selectedPriceFilter);
    }
    if (selectedLangFilter) {
        links = links.filter(l => l.language === selectedLangFilter);
    }

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

window.addEventListener('keydown', (e) => {
    const searchInput = document.getElementById('searchInput');
    if (e.key === '/' && document.activeElement !== searchInput) {
        e.preventDefault(); 
        if (searchInput) {
            searchInput.focus();
            searchInput.select();
        }
    }
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

function generateShareLink() {
    const searchVal = document.getElementById('searchInput')?.value.trim() || '';
    const currentTopic = currentTopicId || '';
    
    let shareUrl = `${window.location.origin}${window.location.pathname}?screen=app`;
    if (currentTopic) shareUrl += `&topic=${encodeURIComponent(currentTopic)}`;
    if (searchVal) shareUrl += `&search=${encodeURIComponent(searchVal)}`;

    navigator.clipboard.writeText(shareUrl).then(() => {
        const shareBtn = document.getElementById('shareBtn');
        if (shareBtn) {
            const originalHTML = shareBtn.innerHTML;
            shareBtn.innerHTML = '<span class="text-xs font-bold">📋 Copied!</span>';
            shareBtn.classList.remove('bg-purple-600', 'hover:bg-purple-700');
            shareBtn.classList.add('bg-green-600', 'w-auto', 'px-3');

            setTimeout(() => {
                shareBtn.innerHTML = originalHTML;
                shareBtn.classList.remove('bg-green-600', 'w-auto', 'px-3');
                shareBtn.classList.add('bg-purple-600', 'hover:bg-purple-700');
            }, 2000);
        }
    });
}

// Global scope bindings für HTML inline onclick-Handler
window.toggleSettings = toggleSettings;
window.toggleDarkMode = toggleDarkMode;
window.changeLanguage = changeLanguage;
window.selectTopic = selectTopic;
window.filterLinks = filterLinks;
window.generateShareLink = generateShareLink;
window.showApp = showApp;
window.showHome = showHome;
window.toggleSidebar = toggleSidebar;
window.closeSidebar = closeSidebar;
window.showVault = showVault;
window.closeVaultCategory = closeVaultCategory;
window.closeVaultDetail = closeVaultDetail;
window.closeVaultTool = closeVaultTool;
window.setPriceFilter = setPriceFilter;
window.setLangFilter = setLangFilter;
window.clearSearch = () => {
    const searchInput = document.getElementById('searchInput');
    if (searchInput) searchInput.value = '';
    filterLinks();
};

document.documentElement.classList.add('dark');
window.addEventListener('DOMContentLoaded', loadData);