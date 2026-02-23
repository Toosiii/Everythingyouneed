let allData = {
    translations: {
        de: {
            selectTopic: 'Thema auswählen',
            everythingYouNeed: 'Alles was du brauchst',
            startBrowsing: 'Wählen Sie ein Thema aus der Liste auf der linken Seite, um zu beginnen',
            topics: 'Themen',
            search: 'Suchen...',
            games: 'Spiele',
            language: 'Sprache',
            featureTitle1: 'Live TV & Streaming',
            featureDesc1: 'Durchsuchen Sie kuratierte Links für Filme, Serien und Live-TV-Streams',
            featureTitle2: 'Spiele',
            featureDesc2: 'Finden Sie Ressourcen für Ihre Lieblingsspiele wie Minecraft, Valorant und mehr',
            featureTitle3: 'Lernen & Tools',
            featureDesc3: 'Greifen Sie auf Bildungsressourcen und Programmiertools an einem Ort zu',
            statTopics: 'Themen',
            statLinks: 'Links',
            statLanguages: 'Sprachen',
            settings: 'Einstellungen',
            darkMode: 'Dunkler Modus',
            languageLabel: 'Sprache',
            versionText: 'Version 1.0',
            creditsTitle: 'Danksagungen',
            creditsText: 'Gebaut mit: HTML5, Tailwind CSS, JavaScript. Icons: Emoji. Jahr: 2026'
        ,
            favorites: 'Favoriten',
            openAll: 'Alle öffnen',
            copyLinks: 'Links kopieren',
            clear: 'Löschen',
            noResults: 'Keine Ergebnisse',
            favoritesEmpty: 'Keine Favoriten gespeichert',
            addFavorite: 'Zu Favoriten hinzufügen',
            removeFavorite: 'Aus Favoriten entfernen'
        },
        en: {
            selectTopic: 'Select a topic',
            everythingYouNeed: 'Everything you need',
            startBrowsing: 'Select a topic from the list on the left to get started',
            topics: 'Topics',
            search: 'Search...',
            games: 'Games',
            language: 'Language',
            featureTitle1: 'Live TV & Streaming',
            featureDesc1: 'Browse through curated links for movies, series, and live TV streams',
            featureTitle2: 'Games',
            featureDesc2: 'Find resources for your favorite games like Minecraft, Valorant, and more',
            featureTitle3: 'Learning & Tools',
            featureDesc3: 'Access educational resources and programming tools all in one place',
            statTopics: 'Topics',
            statLinks: 'Links',
            statLanguages: 'Languages',
            settings: 'Settings',
            darkMode: 'Dark Mode',
            languageLabel: 'Language',
            versionText: 'Version 1.0',
            creditsTitle: 'Credits',
            creditsText: 'Built with: HTML5, Tailwind CSS, JavaScript. Icons: Emoji. Year: 2026'
        ,
            favorites: 'Favorites',
            openAll: 'Open All',
            copyLinks: 'Copy Links',
            clear: 'Clear',
            noResults: 'No results',
            favoritesEmpty: 'No favorites saved',
            addFavorite: 'Add to favorites',
            removeFavorite: 'Remove from favorites'
        }
    },
    topics: [
        {
            id: 'tv',
            name: 'Live TV',
            description: 'Sports Streams, Movie/Series Streams, TV Streams',
            image: 'images/programming.jpg',
            links: [
                {
                    title: 'Rivestream.org',
                    url: 'https://rivestream.org/',
                    description: 'All in one streaming platform for live TV, movies, series and sports streams',
                    tags: ['Sports', 'Movies', 'Series', 'TV'],
                    image: ''
                },
                {
                    title: 'watch-v2',
                    url: 'https://watch-v2.autoembed.cc',
                    description: 'Watch movies and series online for free',
                    tags: ['movies', 'series', 'free'],
                    image: ''
                },
                {
                    title: 'DeepWebNest',
                    url: 'https://deepwebnest.com',
                    description: 'Games, Movies, Series, TV Streams for free, Books, Music and more',
                    tags: ['Sports', 'Movies', 'Series', 'TV', 'free', 'books', 'music', 'vpn', 'Adblocker'],
                    image: ''
                }
            ]
        },
        {
            id: 'school',
            name: 'Schule',
            description: 'Lernen',
            image: 'images/school.jpg',
            links: [
                {
                    title: 'Turbo.ai',
                    url: 'https://turbo.ai',
                    description: 'AI-powered tools for productivity, including note-taking, task management, and content generation.',
                    tags: ['ai', 'productivity', 'school'],
                    image: ''
                }
            ]
        },
        {
            id: 'Games',
            name: 'Spiele',
            description: 'Games and more',
            image: 'images/games.jpg',
            links: [
                {
                    title: 'howlongtobeat.com',
                    url: 'https://howlongtobeat.com',
                    description: 'Find out how long it takes to beat a game.',
                    tags: ['games', 'info'],
                    game: 'General',
                    image: ''
                },
                {
                    title: 'Adescargar.net',
                    url: 'https://adescargar.net',
                    description: 'Every game for free and Pro version for free',
                    tags: ['games', 'free'],
                    game: 'Minecraft',
                    image: ''
                }
            ]
        },
        {
            id: 'prog',
            name: 'Programmierung',
            description: 'Programming and more',
            image: 'images/programming.jpg',
            links: [
                {
                    title: 'Blackbox.ai',
                    url: 'https://www.blackbox.ai',
                    description: 'AI-powered tools for productivity, including note-taking, task management, and content generation.',
                    tags: ['ai', 'productivity', 'school', 'coding', 'programming'],
                    image: ''
                },
                {
                    title: 'Enetr.pro',
                    url: 'https://enetr.pro',
                    description: 'Coding',
                    tags: ['coding', 'programming'],
                    image: ''
                }
            ]
        }
        
    ]
};
