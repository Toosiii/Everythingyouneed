import allData from './data.yaml'

let currentTopicId = null;
let selectedTag = null;
let selectedGame = null;
let currentLanguage = 'en';

function trans(key) {
    return allData.translations[currentLanguage]?.[key] || key;
}

function toggleSettings() {
    const modal = document.getElementById('settingsModal');
    modal.style.display = modal.style.display === 'none' ? 'flex' : 'none';
}

function toggleDarkMode() {
    const isDarkMode = document.documentElement.classList.toggle('dark');
    document.getElementById('darkModeToggle').checked = isDarkMode;
    localStorage.setItem('darkMode', isDarkMode);
}

function changeLanguage(lang) {
    currentLanguage = lang;
    document.documentElement.lang = lang;
    document.getElementById('settingsLanguageSelect').value = lang;
    document.getElementById('sidebarTitle').textContent = trans('topics');
    document.getElementById('gamesCategoryTitle').textContent = trans('games');
    document.getElementById('landingTitle').textContent = trans('everythingYouNeed');
    document.getElementById('landingSubtitle').textContent = trans('startBrowsing');
    document.getElementById('searchInput').placeholder = trans('search');
    document.getElementById('settingsBtnText').textContent = trans('settings');
    document.getElementById('settingsTitle').textContent = trans('settings');
    document.getElementById('darkModeLabel').textContent = trans('darkMode');
    document.getElementById('languageLabel').textContent = trans('languageLabel');
    document.getElementById('versionText').textContent = trans('versionText');
    document.getElementById('creditsTitle').textContent = trans('creditsTitle');
    document.getElementById('featureTitle1').textContent = trans('featureTitle1');
    document.getElementById('featureDesc1').textContent = trans('featureDesc1');
    document.getElementById('featureTitle2').textContent = trans('featureTitle2');
    document.getElementById('featureDesc2').textContent = trans('featureDesc2');
    document.getElementById('featureTitle3').textContent = trans('featureTitle3');
    document.getElementById('featureDesc3').textContent = trans('featureDesc3');
    document.getElementById('statTopics').textContent = trans('statTopics');
    document.getElementById('statLinks').textContent = trans('statLinks');
    document.getElementById('statLanguages').textContent = trans('statLanguages');

    // Update topics count in stats
    document.querySelector('.stat-number').textContent = allData.topics?.length || 0;

    // Rebuild topics dropdown with correct language
    const select = document.getElementById('topicsDropdown');
    select.innerHTML = `<option value="">${trans('selectTopic')}</option>`;
    allData.topics?.forEach(topic => {
        const option = document.createElement('option');
        option.value = topic.id;
        option.textContent = topic.name;
        select.appendChild(option);
    });

    localStorage.setItem('language', lang);
}

function loadData() {
    const savedLanguage = localStorage.getItem('language') || currentLanguage;
    const savedDarkMode = localStorage.getItem('darkMode') === 'true';

    if (savedDarkMode) {
        document.documentElement.classList.add('dark');
    }
    document.getElementById('darkModeToggle').checked = savedDarkMode;

    // Count total links for stats
    const totalLinks = allData.topics?.reduce((sum, t) => sum + (t.links?.length || 0), 0) || 0;
    document.getElementById('totalLinks').textContent = totalLinks + '+';

    changeLanguage(savedLanguage);

    document.getElementById('settingsModal').addEventListener('click', function (e) {
        if (e.target === this) toggleSettings();
    });

    const params = new URLSearchParams(window.location.search);
    const topicParam = params.get('topic');
    const tagParam = params.get('tag');
    const searchParam = params.get('search');

    if (topicParam) {
        selectTopic(topicParam);
        if (tagParam) selectedTag = tagParam;
        if (searchParam) document.getElementById('searchInput').value = searchParam;
        filterLinks();
    }
}

function selectTopic(topicId) {
    if (!topicId) {
        document.getElementById('landingPage').style.display = 'block';
        document.getElementById('topicContent').style.display = 'none';
        document.getElementById('gamesCategory').style.display = 'none';
        return;
    }

    currentTopicId = topicId;
    selectedTag = null;
    selectedGame = null;
    document.getElementById('searchInput').value = '';
    document.getElementById('topicsDropdown').value = topicId;

    const current = allData.topics?.find(t => t.id === topicId);
    if (!current) return;

    document.getElementById('landingPage').style.display = 'none';
    document.getElementById('topicContent').style.display = 'block';
    document.getElementById('topicTitle').textContent = current.name;

    const gamesCategorySection = document.getElementById('gamesCategory');
    if (topicId === 'Games') {
        gamesCategorySection.style.display = 'block';
        renderGameCategories(current);
    } else {
        gamesCategorySection.style.display = 'none';
    }

    renderTags(current);
    filterLinks();

    window.history.pushState(null, '', `?topic=${encodeURIComponent(topicId)}`);
}

function renderTags(topic) {
    const tagsList = document.getElementById('tagsList');
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
    const rawSearch = document.getElementById('searchInput').value.trim();
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
    resultsCount.textContent = links.length ? `${links.length} result${links.length > 1 ? 's' : ''}` : trans('noResults');

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

// Expose functions to global scope (needed for inline HTML onclick handlers)
window.toggleSettings = toggleSettings;
window.toggleDarkMode = toggleDarkMode;
window.changeLanguage = changeLanguage;
window.selectTopic = selectTopic;
window.filterLinks = filterLinks;
window.clearSearch = () => {
    document.getElementById('searchInput').value = '';
    filterLinks();
};

document.documentElement.classList.add('dark');
window.addEventListener('DOMContentLoaded', loadData);
