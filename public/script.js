let currentTab = 'schedule';
let autoUpdateInterval;
let currentPage = 1;
let totalPages = 1;
let isLoading = false;
let hasMoreData = true;
let allAnimeData = [];
let currentType = '';

const API_BASE = '/api';

function showPageTransition() {
    const transition = document.getElementById('pageTransition');
    if (transition) {
        transition.classList.add('active');
    }
}

function hidePageTransition() {
    const transition = document.getElementById('pageTransition');
    if (transition) {
        transition.classList.remove('active');
    }
}

function navigateWithTransition(url) {
    showPageTransition();
    setTimeout(() => {
        window.location.href = url;
    }, 400);
}

function getJakartaHour() {
    const now = new Date();
    const jakartaTime = new Date(now.toLocaleString('en-US', { timeZone: 'Asia/Jakarta' }));
    return jakartaTime.getHours();
}

function shouldBeDarkMode() {
    const hour = getJakartaHour();
    return hour >= 15 || hour < 5;
}

function applyAutoTheme() {
    const shouldDark = shouldBeDarkMode();
    const isDark = document.body.classList.contains('dark-mode');
    
    if (shouldDark && !isDark) {
        document.body.classList.add('dark-mode');
    } else if (!shouldDark && isDark) {
        document.body.classList.remove('dark-mode');
    }
}

function initThemeToggle() {
    const themeToggle = document.getElementById('themeToggle');
    
    applyAutoTheme();
    
    if (themeToggle) {
        themeToggle.addEventListener('click', () => {
            document.body.classList.toggle('dark-mode');
            
            themeToggle.style.transform = 'scale(0.8) rotate(180deg)';
            setTimeout(() => {
                themeToggle.style.transform = '';
            }, 200);
        });
    }
    
    setInterval(() => {
        applyAutoTheme();
    }, 60000);
}

function initScrollToTop() {
    const scrollBtn = document.getElementById('scrollToTop');
    
    window.addEventListener('scroll', () => {
        if (window.pageYOffset > 300) {
            scrollBtn.classList.add('show');
        } else {
            scrollBtn.classList.remove('show');
        }
    });
}

function scrollToTop() {
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
}

function initDrawerMenu() {
    const menuToggle = document.getElementById('menuToggle');
    const drawerMenu = document.getElementById('drawerMenu');
    const menuOverlay = document.getElementById('menuOverlay');
    const closeDrawer = document.getElementById('closeDrawer');
    
    function openDrawer() {
        drawerMenu.classList.add('active');
        menuOverlay.classList.add('active');
        menuToggle.classList.add('active');
        document.body.style.overflow = 'hidden';
    }
    
    function closeDrawerFunc() {
        drawerMenu.classList.remove('active');
        menuOverlay.classList.remove('active');
        menuToggle.classList.remove('active');
        document.body.style.overflow = '';
    }
    
    if (menuToggle) {
        menuToggle.addEventListener('click', () => {
            if (drawerMenu.classList.contains('active')) {
                closeDrawerFunc();
            } else {
                openDrawer();
            }
        });
    }
    
    if (closeDrawer) {
        closeDrawer.addEventListener('click', closeDrawerFunc);
    }
    
    if (menuOverlay) {
        menuOverlay.addEventListener('click', closeDrawerFunc);
    }
    
    const drawerTabButtons = drawerMenu.querySelectorAll('.tab-btn');
    drawerTabButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const tab = btn.dataset.tab;
            loadTab(tab);
            closeDrawerFunc();
        });
    });
}

document.addEventListener('DOMContentLoaded', () => {
    initThemeToggle();
    initScrollToTop();
    initDrawerMenu();
    
    setTimeout(() => {
        hidePageTransition();
        document.body.classList.add('page-loaded');
    }, 300);
});

function formatMembers(members) {
    if (members >= 1000000) {
        return (members / 1000000).toFixed(1) + 'M';
    } else if (members >= 1000) {
        return (members / 1000).toFixed(0) + 'K';
    }
    return members.toString();
}

function createAnimeCard(anime, showLiveBadge = false) {
    const animeId = anime.mal_id || anime.id || '';
    const imageUrl = anime.image || anime.imageSrc || anime.poster || 'https://via.placeholder.com/220x300?text=No+Image';
    const title = anime.title || anime.name || 'Judul Tidak Tersedia';
    const type = anime.type || '';
    const score = anime.score || 'N/A';
    const synopsis = anime.synopsis || 'Sinopsis tidak tersedia.';
    const episodes = anime.episodes || '?';
    const duration = anime.duration || '0 min';
    const aired = anime.aired?.string || '';
    const members = anime.members ? formatMembers(anime.members) : '';
    const genres = anime.genres || [];
    const studios = anime.studios || [];
    const source = anime.source || '';
    const themes = anime.themes || [];
    const demographics = anime.demographics || [];
    
    const typeBadgeClass = type.toLowerCase();
    const genreHtml = genres.length > 0 ? genres.map(g => `<span class="genre-chip">${g.name || g}</span>`).join('') : '';
    
    return `
        <div class="image-card" onclick="navigateToDetail(${animeId})" data-id="${animeId}" data-type="${typeBadgeClass}">
            <div class="image-wrapper">
                <div class="image-loader"></div>
                ${showLiveBadge ? '<div class="live-badge"><span class="live-dot"></span>LIVE</div>' : ''}
                ${type ? `<div class="type-badge type-badge-${typeBadgeClass}">${type}</div>` : ''}
                <img src="${imageUrl}" 
                     alt="${title}"
                     loading="lazy"
                     onload="this.parentElement.querySelector('.image-loader').style.display='none'; this.style.opacity='1';"
                     onerror="this.src='https://via.placeholder.com/220x300?text=No+Image'; this.parentElement.querySelector('.image-loader').style.display='none'; this.style.opacity='1';"
                     style="opacity: 0; transition: opacity 0.3s ease;">
            </div>
            <div class="card-content">
                <div class="card-title">${title}</div>
                <div class="card-date">${aired} · ${episodes} eps, ${duration}</div>
                ${genreHtml ? `<div class="card-genres">${genreHtml}</div>` : ''}
                <div class="card-synopsis">${synopsis}</div>
                <div class="card-details">
                    ${studios.length > 0 ? `<div class="detail-item"><strong>Studio:</strong> ${studios.map(s => s.name || s).join(', ')}</div>` : ''}
                    ${source ? `<div class="detail-item"><strong>Source:</strong> ${source}</div>` : ''}
                    ${themes.length > 0 ? `<div class="detail-item"><strong>Themes:</strong> ${themes.map(t => t.name || t).join(', ')}</div>` : ''}
                    ${demographics.length > 0 ? `<div class="detail-item"><strong>Demographic:</strong> ${demographics.map(d => d.name || d).join(', ')}</div>` : ''}
                </div>
                <div class="card-footer">
                    <div class="card-rating">${score}</div>
                    ${members ? `<div class="card-members">${members}</div>` : ''}
                </div>
            </div>
        </div>
    `;
}

function updateLastUpdateTime() {
    const now = new Date();
    const timeStr = now.toLocaleString('id-ID', { 
        hour: '2-digit',
        minute: '2-digit'
    });
    document.getElementById('lastUpdate').textContent = timeStr;
}

function showNotification(message, type = 'info') {
    const notification = document.getElementById('notification');
    notification.textContent = message;
    notification.className = `notification ${type}`;
    notification.style.display = 'block';
    
    setTimeout(() => {
        notification.style.display = 'none';
    }, 4000);
}

async function fetchSchedule(page = 1) {
    try {
        if (isLoading) return;
        isLoading = true;
        
        let url = `${API_BASE}/schedule?page=${page}`;
        if (currentType && currentType !== '') {
            url += `&type=${currentType}`;
        }
        const response = await fetch(url);
        const result = await response.json();
        
        if (result.data && result.data.length > 0) {
            allAnimeData = result.data;
            const today = new Date().toLocaleDateString('id-ID', { weekday: 'long' });
            const todaySchedule = result.data.filter(item => item.day === today);
            
            if (todaySchedule.length > 0) {
                showNotification(`✅ Ada ${todaySchedule.length} anime tayang hari ini (${today})!`, 'success');
            } else {
                showNotification(`📅 Total ${result.pagination.totalItems} anime terjadwal`, 'info');
            }
            hasMoreData = result.pagination.hasNextPage;
        } else {
            showNotification('⚠️ Belum ada jadwal anime tersedia', 'warning');
            hasMoreData = false;
        }
        
        displayScheduleList(allAnimeData, result.pagination);
        updatePagination(result.pagination);
    } catch (error) {
        displayError('Gagal memuat jadwal anime. Silakan coba lagi.');
        showNotification('❌ Gagal memuat jadwal', 'error');
    } finally {
        isLoading = false;
    }
}

async function fetchNew(page = 1) {
    try {
        if (isLoading) return;
        isLoading = true;
        
        let url = `${API_BASE}/new?page=${page}`;
        if (currentType && currentType !== '') {
            url += `&type=${currentType}`;
        }
        const response = await fetch(url);
        const result = await response.json();
        
        if (result.data && result.data.length > 0) {
            allAnimeData = result.data;
            showNotification(`✅ Ditemukan ${result.pagination.totalItems} anime terbaru`, 'success');
            hasMoreData = result.pagination.hasNextPage;
        } else {
            hasMoreData = false;
        }
        
        displayImageGrid(allAnimeData);
        updatePagination(result.pagination);
    } catch (error) {
        displayError('Gagal memuat anime terbaru. Silakan coba lagi.');
    } finally {
        isLoading = false;
    }
}

async function fetchPopular(page = 1) {
    try {
        if (isLoading) return;
        isLoading = true;
        
        let url = `${API_BASE}/popular?page=${page}`;
        if (currentType && currentType !== '') {
            url += `&type=${currentType}`;
        }
        const response = await fetch(url);
        const result = await response.json();
        
        if (result.data && result.data.length > 0) {
            allAnimeData = result.data;
            showNotification(`✅ Ditemukan ${result.pagination.totalItems} anime populer`, 'success');
            hasMoreData = result.pagination.hasNextPage;
        } else {
            hasMoreData = false;
        }
        
        displayImageGrid(allAnimeData);
        updatePagination(result.pagination);
    } catch (error) {
        displayError('Gagal memuat anime populer. Silakan coba lagi.');
    } finally {
        isLoading = false;
    }
}

function isCurrentlyLive(anime) {
    if (!anime.broadcast || !anime.broadcast.day || !anime.broadcast.time) {
        return false;
    }
    
    const now = new Date();
    const currentDay = now.toLocaleDateString('en-US', { weekday: 'long', timeZone: 'Asia/Tokyo' }).toLowerCase();
    const currentHour = parseInt(now.toLocaleString('en-US', { hour: 'numeric', hour12: false, timeZone: 'Asia/Tokyo' }));
    const currentMinute = parseInt(now.toLocaleString('en-US', { minute: 'numeric', timeZone: 'Asia/Tokyo' }));
    const currentTime = currentHour * 60 + currentMinute;
    
    const broadcastDay = anime.broadcast.day.toLowerCase().replace(/s$/, '');
    const broadcastTime = anime.broadcast.time;
    
    if (currentDay !== broadcastDay) {
        return false;
    }
    
    const timeMatch = broadcastTime.match(/(\d+):(\d+)/);
    if (!timeMatch) {
        return false;
    }
    
    const broadcastMinutes = parseInt(timeMatch[1]) * 60 + parseInt(timeMatch[2]);
    const timeDiff = currentTime - broadcastMinutes;
    
    return timeDiff >= -5 && timeDiff <= 30;
}

async function fetchRecommendations(page = 1) {
    try {
        if (isLoading) return;
        isLoading = true;
        
        const response = await fetch(`${API_BASE}/mal-recommendations?page=${page}`);
        const result = await response.json();
        
        if (result.success && result.data && result.data.length > 0) {
            showNotification(`✅ Ditemukan ${result.count} rekomendasi anime dari User MyAnimeList!`, 'success');
            displayRecommendations(result.data, result.pagination);
            updatePagination(result.pagination);
            hasMoreData = result.pagination.hasNextPage;
        } else {
            showNotification('⚠️ Belum ada rekomendasi tersedia', 'warning');
            document.getElementById('content').innerHTML = '<div class="error-message">📝 Tidak ada rekomendasi tersedia saat ini</div>';
            document.getElementById('paginationContainer').style.display = 'none';
        }
    } catch (error) {
        displayError('Gagal memuat rekomendasi anime. Silakan coba lagi.');
        showNotification('❌ Gagal memuat data', 'error');
    } finally {
        isLoading = false;
    }
}

function displayRecommendations(recommendations, pagination = null) {
    const content = document.getElementById('content');
    
    let statsSection = '';
    if (pagination && pagination.currentPage) {
        const currentPageNum = pagination.currentPage || 1;
        const itemsPerPage = pagination.show || 100;
        const totalItemsShown = currentPageNum * itemsPerPage;
        const statusText = pagination.hasNextPage 
            ? `📄 Tersedia halaman selanjutnya (100+ rekomendasi per halaman)` 
            : `🏁 Ini halaman terakhir`;
        
        statsSection = `
            <div class="recommendations-stats">
                <div class="recommendations-stats-card">
                    <div class="recommendations-stats-icon">📊</div>
                    <div class="recommendations-stats-content">
                        <div class="recommendations-stats-label">Halaman ${currentPageNum} · ${itemsPerPage} item per halaman</div>
                        <div class="recommendations-stats-count">${recommendations.length}</div>
                        <div class="recommendations-stats-subtitle">Rekomendasi dalam halaman ini · Real-Time dari MyAnimeList</div>
                        <div class="recommendations-stats-extra">${statusText}</div>
                    </div>
                </div>
            </div>
        `;
    }
    
    const headerButton = `
        <div class="mal-recommendations-header">
            <a href="/userrecs.html" class="mal-btn">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" style="margin-right: 6px;">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                </svg>
                Lihat User Recommendations Terbaik
            </a>
        </div>
    `;
    
    const html = recommendations.map(rec => {
        const leftAnime = rec.leftAnime;
        const rightAnime = rec.rightAnime;
        const recommendationText = rec.recommendation;
        const username = rec.user?.username || 'Anonymous';
        const date = rec.date || '';
        
        return `
            <div class="recommendation-card">
                <div class="recommendation-header">
                    <div class="recommendation-user">
                        <strong onclick="navigateWithTransition('/profile.html?username=${encodeURIComponent(username)}')" style="cursor: pointer;">${username}</strong> merekomendasikan:
                    </div>
                    <div class="recommendation-date">${date}</div>
                </div>
                <div class="recommendation-content">
                    <div class="recommendation-anime-pair">
                        <div class="recommendation-anime" onclick="navigateToDetail(${leftAnime.mal_id || 0})">
                            <div class="recommendation-anime-image">
                                <img src="${leftAnime.image || 'https://via.placeholder.com/100x140?text=No+Image'}" 
                                     alt="${leftAnime.title}"
                                     loading="lazy"
                                     onerror="this.src='https://via.placeholder.com/100x140?text=No+Image';">
                            </div>
                            <div class="recommendation-anime-title">${leftAnime.title}</div>
                        </div>
                        <div class="recommendation-arrow">→</div>
                        <div class="recommendation-anime" onclick="navigateToDetail(${rightAnime.mal_id || 0})">
                            <div class="recommendation-anime-image">
                                <img src="${rightAnime.image || 'https://via.placeholder.com/100x140?text=No+Image'}" 
                                     alt="${rightAnime.title}"
                                     loading="lazy"
                                     onerror="this.src='https://via.placeholder.com/100x140?text=No+Image';">
                            </div>
                            <div class="recommendation-anime-title">${rightAnime.title}</div>
                        </div>
                    </div>
                    <div class="recommendation-text">${recommendationText}</div>
                </div>
            </div>
        `;
    }).join('');
    
    content.innerHTML = statsSection + headerButton + html;
}

async function fetchAiring(page = 1) {
    try {
        if (isLoading) return;
        isLoading = true;
        
        let url = `${API_BASE}/airing?page=${page}`;
        if (currentType && currentType !== '') {
            url += `&type=${currentType}`;
        }
        const response = await fetch(url);
        const result = await response.json();
        
        if (result.data && result.data.length > 0) {
            const liveAnime = result.data.filter(anime => isCurrentlyLive(anime));
            const upcomingAnime = result.data.filter(anime => !isCurrentlyLive(anime));
            
            allAnimeData = [...liveAnime, ...upcomingAnime];
            
            if (liveAnime.length > 0) {
                showNotification(`🔴 LIVE: ${liveAnime.length} anime sedang tayang sekarang!`, 'success');
            } else {
                showNotification(`📺 ${result.pagination.totalItems} anime sedang tayang musim ini`, 'info');
            }
            hasMoreData = result.pagination.hasNextPage;
        } else {
            showNotification('⚠️ Belum ada anime yang sedang tayang', 'warning');
            hasMoreData = false;
        }
        
        displayAiringGrid(allAnimeData);
        updatePagination(result.pagination);
    } catch (error) {
        displayError('Gagal memuat anime yang sedang tayang. Silakan coba lagi.');
        showNotification('❌ Gagal memuat data', 'error');
    } finally {
        isLoading = false;
    }
}

let currentSeasonData = { year: null, season: null, type: '', page: 1 };

function generateSeasonList() {
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth() + 1;
    
    let currentSeason;
    if (currentMonth >= 1 && currentMonth <= 3) currentSeason = 'winter';
    else if (currentMonth >= 4 && currentMonth <= 6) currentSeason = 'spring';
    else if (currentMonth >= 7 && currentMonth <= 9) currentSeason = 'summer';
    else currentSeason = 'fall';
    
    const seasons = ['winter', 'spring', 'summer', 'fall'];
    const seasonLabels = {
        'winter': 'Winter',
        'spring': 'Spring', 
        'summer': 'Summer',
        'fall': 'Fall'
    };
    
    const seasonList = [];
    
    for (let i = 2; i >= -3; i--) {
        let year = currentYear;
        let seasonIndex = seasons.indexOf(currentSeason) - i;
        
        while (seasonIndex < 0) {
            seasonIndex += 4;
            year--;
        }
        while (seasonIndex >= 4) {
            seasonIndex -= 4;
            year++;
        }
        
        const season = seasons[seasonIndex];
        seasonList.push({
            year: year,
            season: season,
            label: `${seasonLabels[season]} ${year}`
        });
    }
    
    return seasonList;
}

function displaySeasonList() {
    const seasonSelect = document.getElementById('seasonSelect');
    const seasons = generateSeasonList();
    
    seasonSelect.innerHTML = '<option value="">Pilih Musim...</option>';
    
    const newSelect = seasonSelect.cloneNode(false);
    newSelect.innerHTML = '<option value="">Pilih Musim...</option>';
    
    seasons.forEach((s, index) => {
        const option = document.createElement('option');
        option.value = `${s.year}-${s.season}`;
        option.textContent = s.label;
        if (index === 2) {
            option.selected = true;
        }
        newSelect.appendChild(option);
    });
    
    seasonSelect.parentNode.replaceChild(newSelect, seasonSelect);
    
    newSelect.addEventListener('change', (e) => {
        const value = e.target.value;
        if (value) {
            const [year, season] = value.split('-');
            currentPage = 1;
            allAnimeData = [];
            hasMoreData = true;
            currentType = '';
            document.querySelectorAll('.type-mini-btn').forEach(b => b.classList.remove('active'));
            document.querySelector('.type-mini-btn[data-type=""]').classList.add('active');
            showLoading();
            setTimeout(() => {
                fetchSeasonAnime(year, season, 1);
                hideLoading();
            }, 300);
        }
    });
}

async function fetchSeasonAnime(year, season, page = 1) {
    try {
        if (isLoading) return;
        isLoading = true;
        
        currentSeasonData = { year, season, page };
        
        let url = `${API_BASE}/season?year=${year}&season=${season}&page=${page}`;
        if (currentType && currentType !== '') {
            url += `&type=${currentType}`;
        }
        const response = await fetch(url);
        const result = await response.json();
        
        const seasonLabels = {
            'winter': 'Winter',
            'spring': 'Spring',
            'summer': 'Summer',
            'fall': 'Fall'
        };
        
        if (result.data && result.data.length > 0) {
            allAnimeData = result.data;
            const title = `${seasonLabels[season]} ${year}`;
            showNotification(`✅ ${title} - ${result.pagination.totalItems} anime`, 'success');
            hasMoreData = result.pagination.hasNextPage;
        } else {
            hasMoreData = false;
        }
        
        displayImageGrid(allAnimeData);
        updatePagination(result.pagination);
    } catch (error) {
        displayError('Gagal memuat anime musiman. Silakan coba lagi.');
    } finally {
        isLoading = false;
    }
}

async function searchAnime(keyword) {
    try {
        const response = await fetch(`${API_BASE}/search/${encodeURIComponent(keyword)}`);
        const data = await response.json();
        allAnimeData = data;
        displayImageGrid(data);
        document.getElementById('paginationContainer').style.display = 'none';
        showNotification(`✅ Ditemukan ${data.length} hasil untuk "${keyword}"`, 'success');
    } catch (error) {
        displayError('Gagal mencari anime. Silakan coba lagi.');
    }
}

let allGenres = [];
let filteredGenres = [];

async function fetchGenres() {
    try {
        const response = await fetch(`${API_BASE}/mal-genres`);
        const data = await response.json();
        allGenres = data.data || [];
        filteredGenres = [...allGenres];
        displayGenreList(filteredGenres);
        document.getElementById('content').innerHTML = '';
        document.getElementById('paginationContainer').style.display = 'none';
        const cacheMsg = data.cached ? ' (dari cache)' : '';
        showNotification(`✅ ${allGenres.length} genre tersedia${cacheMsg}`, 'success');
        setupGenreSearch();
    } catch (error) {
        console.error('Error fetching genres:', error);
        displayError('Gagal memuat daftar genre. Silakan coba lagi.');
    }
}

function getGenreEmoji(genreName) {
    const emojiMap = {
        'Action': '⚔️',
        'Adventure': '🗺️',
        'Avant Garde': '🎨',
        'Award Winning': '🏆',
        'Boys Love': '💙',
        'Comedy': '😂',
        'Drama': '🎭',
        'Fantasy': '🔮',
        'Girls Love': '💖',
        'Gourmet': '🍜',
        'Horror': '👻',
        'Mystery': '🔍',
        'Romance': '💕',
        'Sci-Fi': '🚀',
        'Slice of Life': '☕',
        'Sports': '⚽',
        'Supernatural': '👹',
        'Suspense': '😱',
        'Ecchi': '🔞',
        'Erotica': '🔥',
        'Hentai': '🔞',
        'Adult Cast': '👔',
        'Anthropomorphic': '🐾',
        'CGDCT': '🌸',
        'Childcare': '👶',
        'Combat Sports': '🥊',
        'Crossdressing': '👗',
        'Delinquents': '😎',
        'Detective': '🕵️',
        'Educational': '📚',
        'Gag Humor': '🤪',
        'Gore': '🩸',
        'Harem': '👯',
        'High Stakes Game': '🎲',
        'Historical': '🏛️',
        'Idols (Female)': '🎤',
        'Idols (Male)': '🎸',
        'Isekai': '🌍',
        'Iyashikei': '🌿',
        'Love Polygon': '💔',
        'Magical Sex Shift': '✨',
        'Mahou Shoujo': '🪄',
        'Martial Arts': '🥋',
        'Mecha': '🤖',
        'Medical': '⚕️',
        'Military': '🎖️',
        'Music': '🎵',
        'Mythology': '⚡',
        'Organized Crime': '🔫',
        'Otaku Culture': '🎮',
        'Parody': '🎪',
        'Performing Arts': '🎬',
        'Pets': '🐶',
        'Psychological': '🧠',
        'Racing': '🏎️',
        'Reincarnation': '♻️',
        'Reverse Harem': '👨',
        'Love Status Quo': '💗',
        'Samurai': '⚔️',
        'School': '🏫',
        'Showbiz': '⭐',
        'Space': '🌌',
        'Strategy Game': '♟️',
        'Super Power': '💪',
        'Survival': '🏕️',
        'Team Sports': '🏀',
        'Time Travel': '⏰',
        'Vampire': '🧛',
        'Video Game': '🎮',
        'Visual Arts': '🖼️',
        'Workplace': '💼',
        'Urban Fantasy': '🏙️',
        'Villainess': '👑',
        'Josei': '💐',
        'Kids': '🧒',
        'Seinen': '👨',
        'Shoujo': '🌺',
        'Shounen': '⚡'
    };
    
    return emojiMap[genreName] || '🎭';
}

function displayGenreList(genres) {
    const genreList = document.getElementById('genreList');
    
    if (!genres || genres.length === 0) {
        genreList.innerHTML = '<div class="error-message">Genre tidak ditemukan</div>';
        return;
    }
    
    const html = genres.map(genre => `
        <div class="genre-card" onclick="navigateToGenre('${genre.mal_id}', '${genre.name}')">
            <span class="genre-icon">${getGenreEmoji(genre.name)}</span>
            <span class="genre-title">${genre.name}</span>
            <span class="genre-count">${formatMembers(genre.count)} anime</span>
            <span class="genre-arrow">›</span>
        </div>
    `).join('');
    
    genreList.innerHTML = html;
}

function setupGenreSearch() {
    const searchInput = document.getElementById('genreSearchInput');
    const suggestionsDiv = document.getElementById('genreSearchSuggestions');
    
    searchInput.addEventListener('input', (e) => {
        const keyword = e.target.value.trim().toLowerCase();
        
        if (!keyword) {
            filteredGenres = [...allGenres];
            suggestionsDiv.innerHTML = '';
            suggestionsDiv.style.display = 'none';
            displayGenreList(filteredGenres);
            return;
        }
        
        const results = allGenres.map(genre => {
            const genreTitle = genre.name.toLowerCase();
            let similarity = 0;
            
            if (genreTitle === keyword) {
                similarity = 1.0;
            } else if (genreTitle.includes(keyword)) {
                similarity = 0.8;
            } else {
                similarity = calculateSimilarity(keyword, genreTitle);
            }
            
            return { ...genre, similarity };
        })
        .filter(genre => genre.similarity > 0.3)
        .sort((a, b) => b.similarity - a.similarity);
        
        filteredGenres = results;
        displayGenreList(filteredGenres);
        
        if (results.length > 0 && keyword.length > 1) {
            const topSuggestions = results.slice(0, 5);
            const suggestionsHtml = topSuggestions.map(genre => `
                <div class="genre-suggestion-item" onclick="selectGenreSuggestion('${genre.name}')">
                    ${highlightMatch(genre.name, keyword)} <span class="suggestion-count">(${formatMembers(genre.count)})</span>
                </div>
            `).join('');
            suggestionsDiv.innerHTML = suggestionsHtml;
            suggestionsDiv.style.display = 'block';
        } else {
            suggestionsDiv.style.display = 'none';
        }
    });
    
    searchInput.addEventListener('blur', () => {
        setTimeout(() => {
            suggestionsDiv.style.display = 'none';
        }, 200);
    });
}

function calculateSimilarity(str1, str2) {
    const longer = str1.length > str2.length ? str1 : str2;
    const shorter = str1.length > str2.length ? str2 : str1;
    
    if (longer.length === 0) return 1.0;
    
    const editDistance = getEditDistance(longer, shorter);
    return (longer.length - editDistance) / longer.length;
}

function getEditDistance(str1, str2) {
    const matrix = [];
    
    for (let i = 0; i <= str2.length; i++) {
        matrix[i] = [i];
    }
    
    for (let j = 0; j <= str1.length; j++) {
        matrix[0][j] = j;
    }
    
    for (let i = 1; i <= str2.length; i++) {
        for (let j = 1; j <= str1.length; j++) {
            if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
                matrix[i][j] = matrix[i - 1][j - 1];
            } else {
                matrix[i][j] = Math.min(
                    matrix[i - 1][j - 1] + 1,
                    matrix[i][j - 1] + 1,
                    matrix[i - 1][j] + 1
                );
            }
        }
    }
    
    return matrix[str2.length][str1.length];
}

function highlightMatch(text, keyword) {
    const index = text.toLowerCase().indexOf(keyword.toLowerCase());
    if (index === -1) return text;
    
    const before = text.substring(0, index);
    const match = text.substring(index, index + keyword.length);
    const after = text.substring(index + keyword.length);
    
    return `${before}<strong>${match}</strong>${after}`;
}

function selectGenreSuggestion(genreTitle) {
    document.getElementById('genreSearchInput').value = genreTitle;
    const genre = allGenres.find(g => g.name === genreTitle);
    if (genre) {
        filteredGenres = [genre];
        displayGenreList(filteredGenres);
    }
}

function navigateToGenre(genreId, genreTitle) {
    showPageTransition();
    setTimeout(() => {
        window.location.href = `genre.html?id=${genreId}&title=${encodeURIComponent(genreTitle)}`;
    }, 400);
}

function formatSchedule(anime) {
    if (anime.broadcast && anime.broadcast.string && anime.broadcast.string !== 'Unknown') {
        return `📅 ${anime.broadcast.string}`;
    }
    if (anime.day && anime.time) {
        return `📅 ${anime.day} ${anime.time}`;
    }
    if (anime.aired && anime.aired.string) {
        return `📅 ${anime.aired.string}`;
    }
    if (anime.status) {
        return `📺 ${anime.status}`;
    }
    return '';
}

function displayScheduleList(data, pagination = null) {
    const content = document.getElementById('content');
    
    if (!data || data.length === 0) {
        content.innerHTML = `<div class="error-message">Tidak ada jadwal anime tersedia</div>`;
        document.getElementById('paginationContainer').style.display = 'none';
        return;
    }

    const dayMapping = {
        'senin': 'Senin',
        'selasa': 'Selasa',
        'rabu': 'Rabu',
        'kamis': 'Kamis',
        'jumat': 'Jumat',
        'sabtu': 'Sabtu',
        'minggu': 'Minggu'
    };
    
    const dayOrder = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu', 'Minggu'];
    const groupedByDay = {};
    
    dayOrder.forEach(day => {
        groupedByDay[day] = [];
    });
    groupedByDay['Lainnya'] = [];
    
    data.forEach(anime => {
        const apiDay = (anime.day || '').toLowerCase();
        const day = dayMapping[apiDay] || 'Lainnya';
        
        if (groupedByDay[day]) {
            groupedByDay[day].push(anime);
        } else {
            groupedByDay['Lainnya'].push(anime);
        }
    });
    
    let html = '';
    
    if (pagination && pagination.totalItems && currentType === '') {
        html += `
            <div class="type-stats-container" id="type-stats-loading">
                <div style="text-align: center; padding: 20px; color: #666;">
                    <div class="loading-spinner"></div>
                    <p>Memuat statistik real-time...</p>
                </div>
            </div>
        `;
    }
    
    dayOrder.forEach((day, index) => {
        const animes = groupedByDay[day] || [];
        const dayClass = day.toLowerCase();
        
        html += `
            <div class="schedule-day-section">
                <div class="schedule-day-header schedule-day-${dayClass}">
                    <h3>${day}</h3>
                    <span class="schedule-day-count">${animes.length}</span>
                </div>
                <div class="schedule-list">
        `;
        
        if (animes.length === 0) {
            html += `
                <div class="schedule-empty">
                    <span>📭 Tidak ada jadwal tayang</span>
                </div>
            `;
        } else {
            animes.sort((a, b) => {
                const timeA = a.time || '99:99';
                const timeB = b.time || '99:99';
                return timeA.localeCompare(timeB);
            });
            
            animes.forEach(anime => {
                const animeId = anime.mal_id || anime.id || '';
                const title = anime.title || anime.name || 'Judul Tidak Tersedia';
                const time = anime.time || 'TBA';
                const type = anime.type || '';
                const score = anime.score || '';
                const imageUrl = anime.image || 'https://via.placeholder.com/50x70?text=No+Image';
                const isLive = isCurrentlyLive(anime);
                const typeBadgeClass = type.toLowerCase();
                
                html += `
                    <div class="schedule-item ${isLive ? 'schedule-item-live' : ''}" onclick="navigateToDetail(${animeId})">
                        <div class="schedule-item-thumbnail">
                            <div class="schedule-thumb-loader"></div>
                            ${isLive ? '<div class="schedule-live-badge"><span class="live-dot"></span>LIVE</div>' : ''}
                            ${type ? `<div class="schedule-type-badge schedule-type-badge-${typeBadgeClass}">${type}</div>` : ''}
                            <img src="${imageUrl}" 
                                 alt="${title}" 
                                 loading="lazy" 
                                 onload="this.style.opacity='1'; this.parentElement.querySelector('.schedule-thumb-loader').style.display='none';" 
                                 onerror="this.src='https://via.placeholder.com/50x70?text=No+Image'; this.style.opacity='1'; this.parentElement.querySelector('.schedule-thumb-loader').style.display='none';"
                                 style="opacity: 0; transition: opacity 0.3s ease;">
                        </div>
                        <div class="schedule-item-content">
                            <div class="schedule-item-title">${title}</div>
                            <div class="schedule-item-meta">
                                <span class="schedule-time">🕐 ${time}</span>
                                ${score ? `<span class="schedule-score">⭐ ${score}</span>` : ''}
                            </div>
                        </div>
                    </div>
                `;
            });
        }
        
        html += `
                </div>
            </div>
        `;
    });
    
    if (groupedByDay['Lainnya'].length > 0) {
        html += `
            <div class="schedule-day-section">
                <div class="schedule-day-header">
                    <h3>Lainnya</h3>
                    <span class="schedule-day-count">${groupedByDay['Lainnya'].length}</span>
                </div>
                <div class="schedule-list">
        `;
        
        groupedByDay['Lainnya'].forEach(anime => {
            const animeId = anime.mal_id || anime.id || '';
            const title = anime.title || anime.name || 'Judul Tidak Tersedia';
            const time = anime.time || 'TBA';
            const type = anime.type || '';
            const score = anime.score || '';
            const imageUrl = anime.image || 'https://via.placeholder.com/50x70?text=No+Image';
            const isLive = isCurrentlyLive(anime);
            const typeBadgeClass = type.toLowerCase();
            
            html += `
                <div class="schedule-item ${isLive ? 'schedule-item-live' : ''}" onclick="navigateToDetail(${animeId})">
                    <div class="schedule-item-thumbnail">
                        <div class="schedule-thumb-loader"></div>
                        ${isLive ? '<div class="schedule-live-badge"><span class="live-dot"></span>LIVE</div>' : ''}
                        ${type ? `<div class="schedule-type-badge schedule-type-badge-${typeBadgeClass}">${type}</div>` : ''}
                        <img src="${imageUrl}" 
                             alt="${title}" 
                             loading="lazy" 
                             onload="this.style.opacity='1'; this.parentElement.querySelector('.schedule-thumb-loader').style.display='none';" 
                             onerror="this.src='https://via.placeholder.com/50x70?text=No+Image'; this.style.opacity='1'; this.parentElement.querySelector('.schedule-thumb-loader').style.display='none';"
                             style="opacity: 0; transition: opacity 0.3s ease;">
                    </div>
                    <div class="schedule-item-content">
                        <div class="schedule-item-title">${title}</div>
                        <div class="schedule-item-meta">
                            <span class="schedule-time">🕐 ${time}</span>
                            ${score ? `<span class="schedule-score">⭐ ${score}</span>` : ''}
                        </div>
                    </div>
                </div>
            `;
        });
        
        html += `
                </div>
            </div>
        `;
    }
    
    content.innerHTML = html;
    
    if (pagination && pagination.totalItems && currentType === '') {
        fetchAndDisplayTypeStatistics();
    }
}

async function fetchAndDisplayTypeStatistics() {
    try {
        const response = await fetch('/api/type-statistics');
        const stats = await response.json();
        
        const typeIcons = {
            'TV': '📺',
            'ONA': '🌐',
            'OVA': '💿',
            'MOVIE': '🎬',
            'SPECIAL': '⭐'
        };
        
        const typeOrder = ['TV', 'ONA', 'OVA', 'MOVIE', 'SPECIAL'];
        const totalAnime = stats.TOTAL || 0;
        
        let html = '';
        
        typeOrder.forEach(type => {
            const count = stats[type] || 0;
            html += `
                <div class="type-stat-card ${count === 0 ? 'type-stat-empty' : ''}">
                    <div class="type-stat-icon">${typeIcons[type] || '📺'}</div>
                    <div class="type-stat-content">
                        <div class="type-stat-label">${type}</div>
                        <div class="type-stat-count">${count}</div>
                    </div>
                </div>
            `;
        });
        
        const statsContainer = document.getElementById('type-stats-loading');
        if (statsContainer) {
            statsContainer.innerHTML = html;
            statsContainer.id = 'type-stats-container';
            
            const noteDiv = document.createElement('div');
            noteDiv.className = 'schedule-stats-note';
            noteDiv.innerHTML = `<small>📊 Total: <strong>${totalAnime} anime</strong> musim ini<br>Update Real-Time dari MyAnimeList</small>`;
            statsContainer.parentNode.insertBefore(noteDiv, statsContainer.nextSibling);
        }
    } catch (error) {
        console.error('Error fetching type statistics:', error);
        const statsContainer = document.getElementById('type-stats-loading');
        if (statsContainer) {
            statsContainer.innerHTML = `
                <div style="text-align: center; padding: 20px; color: #e74c3c;">
                    <p>⚠️ Gagal memuat statistik. Silakan coba lagi nanti.</p>
                </div>
            `;
        }
    }
}

function displayImageGrid(data) {
    const content = document.getElementById('content');
    
    if (!data || data.length === 0) {
        content.innerHTML = `<div class="error-message">Tidak ada anime tersedia</div>`;
        document.getElementById('paginationContainer').style.display = 'none';
        return;
    }

    if (currentType === '') {
        displayGroupedByType(data);
        return;
    }

    let html = '';
    
    data.forEach(anime => {
        html += createAnimeCard(anime);
    });
    
    content.innerHTML = `<div class="image-grid">${html}</div>`;
}

function displayGroupedByType(data) {
    const content = document.getElementById('content');
    
    const typeOrder = ['TV', 'ONA', 'OVA', 'Movie', 'Special'];
    const typeLabels = {
        'TV': 'TV Series',
        'ONA': 'ONA (Original Net Animation)',
        'OVA': 'OVA (Original Video Animation)',
        'Movie': 'Movie',
        'Special': 'Special'
    };
    
    const groupedData = {};
    typeOrder.forEach(type => {
        groupedData[type] = [];
    });
    groupedData['Other'] = [];
    
    data.forEach(anime => {
        const type = anime.type || 'Other';
        const typeUpper = type.toUpperCase();
        
        if (groupedData[typeUpper]) {
            groupedData[typeUpper].push(anime);
        } else if (groupedData[type]) {
            groupedData[type].push(anime);
        } else {
            groupedData['Other'].push(anime);
        }
    });
    
    let html = '';
    
    typeOrder.forEach(type => {
        const animes = groupedData[type];
        if (animes && animes.length > 0) {
            const typeClass = type.toLowerCase();
            html += `
                <div class="type-section">
                    <div class="type-section-header ${typeClass}-header">
                        <h3 class="type-section-title">${typeLabels[type] || type}</h3>
                        <span class="type-section-count">${animes.length} anime</span>
                    </div>
                    <div class="image-grid">
            `;
            
            animes.forEach(anime => {
                html += createAnimeCard(anime);
            });
            
            html += `
                    </div>
                </div>
            `;
        }
    });
    
    if (groupedData['Other'].length > 0) {
        html += `
            <div class="type-section">
                <div class="type-section-header">
                    <h3 class="type-section-title">Lainnya</h3>
                    <span class="type-section-count">${groupedData['Other'].length} anime</span>
                </div>
                <div class="image-grid">
        `;
        
        groupedData['Other'].forEach(anime => {
            html += createAnimeCard(anime);
        });
        
        html += `
                </div>
            </div>
        `;
    }
    
    content.innerHTML = html;
}

function displayAiringGrid(data) {
    const content = document.getElementById('content');
    
    if (!data || data.length === 0) {
        content.innerHTML = `<div class="error-message">Tidak ada anime yang sedang tayang</div>`;
        document.getElementById('paginationContainer').style.display = 'none';
        return;
    }

    const liveAnime = data.filter(anime => isCurrentlyLive(anime));
    const upcomingAnime = data.filter(anime => !isCurrentlyLive(anime));
    
    let html = '';
    
    if (liveAnime.length > 0) {
        html += `
            <div class="type-section">
                <div class="type-section-header" style="border-left: 4px solid #ff0000;">
                    <h3 class="type-section-title">🔴 LIVE SEKARANG</h3>
                    <span class="type-section-count">${liveAnime.length} anime</span>
                </div>
                <div class="image-grid">
        `;
        
        liveAnime.forEach(anime => {
            html += createAnimeCard(anime, true);
        });
        
        html += `
                </div>
            </div>
        `;
    }
    
    if (upcomingAnime.length > 0) {
        html += `
            <div class="type-section">
                <div class="type-section-header">
                    <h3 class="type-section-title">📺 Sedang Tayang Musim Ini</h3>
                    <span class="type-section-count">${upcomingAnime.length} anime</span>
                </div>
                <div class="image-grid">
        `;
        
        upcomingAnime.forEach(anime => {
            html += createAnimeCard(anime);
        });
        
        html += `
                </div>
            </div>
        `;
    }
    
    content.innerHTML = html;
}

function updatePagination(pagination) {
    const paginationContainer = document.getElementById('paginationContainer');
    const prevBtn = document.getElementById('prevPageBtn');
    const nextBtn = document.getElementById('nextPageBtn');
    const pageInfo = document.getElementById('pageInfo');
    
    if (!pagination || currentTab === 'schedule') {
        paginationContainer.style.display = 'none';
        return;
    }
    
    totalPages = pagination.totalPages || 999;
    const currentPageNum = pagination.currentPage || currentPage;
    
    paginationContainer.style.display = 'block';
    
    if (currentTab === 'recommendations') {
        pageInfo.textContent = `Halaman ${currentPageNum}`;
    } else {
        pageInfo.textContent = `Halaman ${currentPageNum} dari ${totalPages}`;
    }
    
    prevBtn.disabled = currentPageNum <= 1;
    nextBtn.disabled = !pagination.hasNextPage;
}

function goToPage(direction) {
    if (isLoading) return;
    
    if (direction === 'prev' && currentPage > 1) {
        currentPage--;
    } else if (direction === 'next' && hasMoreData) {
        currentPage++;
    } else {
        return;
    }
    
    window.scrollTo({ top: 0, behavior: 'smooth' });
    showLoading();
    allAnimeData = [];
    
    setTimeout(() => {
        switch(currentTab) {
            case 'schedule':
                fetchSchedule(currentPage);
                break;
            case 'airing':
                fetchAiring(currentPage);
                break;
            case 'new':
                fetchNew(currentPage);
                break;
            case 'popular':
                fetchPopular(currentPage);
                break;
            case 'season':
                if (currentSeasonData.year && currentSeasonData.season) {
                    fetchSeasonAnime(currentSeasonData.year, currentSeasonData.season, currentPage);
                }
                break;
            case 'recommendations':
                fetchRecommendations(currentPage);
                break;
        }
        hideLoading();
    }, 300);
}

function escapeHtml(text) {
    const map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
    };
    return text.replace(/[&<>"']/g, m => map[m]);
}

function formatAiredDate(dateString) {
    if (!dateString || dateString === 'TBA') return null;
    
    try {
        const date = new Date(dateString);
        if (isNaN(date.getTime())) return dateString;
        
        const options = { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
        };
        return date.toLocaleDateString('id-ID', options);
    } catch (e) {
        return dateString;
    }
}

function displayError(message) {
    const content = document.getElementById('content');
    content.innerHTML = `<div class="error-message">⚠️ ${message}</div>`;
}

function showLoading(withPercentage = false) {
    const loadingEl = document.getElementById('loading');
    const percentageEl = document.getElementById('loadingPercentage');
    const loadingText = document.getElementById('loadingText');
    
    loadingEl.style.display = 'flex';
    document.getElementById('content').style.display = 'none';
    
    if (withPercentage) {
        percentageEl.style.display = 'block';
        loadingText.textContent = 'Memuat halaman...';
        animateLoading();
    } else {
        percentageEl.style.display = 'none';
        loadingText.textContent = 'Memuat data...';
    }
}

function hideLoading() {
    document.getElementById('loading').style.display = 'none';
    document.getElementById('content').style.display = 'block';
}

function animateLoading() {
    const percentageEl = document.getElementById('loadingPercentage');
    let percentage = 0;
    
    const interval = setInterval(() => {
        percentage += Math.random() * 15 + 5;
        if (percentage >= 100) {
            percentage = 100;
            clearInterval(interval);
        }
        percentageEl.textContent = Math.floor(percentage) + '%';
    }, 80);
}

function navigateToDetail(animeId) {
    navigateWithTransition(`/detail.html?id=${animeId}`);
}


function loadCurrentTab() {
    showLoading();
    updateLastUpdateTime();
    currentPage = 1;
    allAnimeData = [];
    hasMoreData = true;
    
    setTimeout(() => {
        switch(currentTab) {
            case 'schedule':
                fetchSchedule(1);
                break;
            case 'airing':
                fetchAiring(1);
                break;
            case 'new':
                fetchNew(1);
                break;
            case 'popular':
                fetchPopular(1);
                break;
            case 'season':
                if (currentSeasonData.year && currentSeasonData.season) {
                    fetchSeasonAnime(currentSeasonData.year, currentSeasonData.season, 1);
                }
                break;
        }
        hideLoading();
    }, 300);
}

function setupTypeFilters() {
    document.querySelectorAll('.type-mini-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.type-mini-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            
            currentType = btn.dataset.type;
            currentPage = 1;
            allAnimeData = [];
            hasMoreData = true;
            
            loadCurrentTab();
        });
    });
}

function loadTab(tab) {
    currentTab = tab;
    currentPage = 1;
    allAnimeData = [];
    hasMoreData = true;
    currentType = '';
    
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    
    const activeTabBtn = document.querySelector(`[data-tab="${tab}"]`);
    if (activeTabBtn) {
        activeTabBtn.classList.add('active');
    }
    
    const searchSection = document.getElementById('searchSection');
    const seasonSection = document.getElementById('seasonSection');
    const genreSection = document.getElementById('genreSection');
    const typeFiltersMini = document.getElementById('typeFiltersMini');
    
    if (searchSection) searchSection.style.display = tab === 'search' ? 'flex' : 'none';
    if (seasonSection) seasonSection.style.display = tab === 'season' ? 'block' : 'none';
    if (genreSection) genreSection.style.display = tab === 'genres' ? 'block' : 'none';
    
    if (tab === 'schedule' || tab === 'airing' || tab === 'new' || tab === 'popular' || tab === 'season') {
        if (typeFiltersMini) typeFiltersMini.style.display = 'flex';
        document.querySelectorAll('.type-mini-btn').forEach(b => b.classList.remove('active'));
        const defaultTypeBtn = document.querySelector('.type-mini-btn[data-type=""]');
        if (defaultTypeBtn) defaultTypeBtn.classList.add('active');
        setupTypeFilters();
    } else {
        if (typeFiltersMini) typeFiltersMini.style.display = 'none';
    }
    
    showLoading();
    updateLastUpdateTime();
    
    setTimeout(() => {
        switch(tab) {
            case 'schedule':
                fetchSchedule(1);
                break;
            case 'airing':
                fetchAiring(1);
                break;
            case 'new':
                fetchNew(1);
                break;
            case 'popular':
                fetchPopular(1);
                break;
            case 'season':
                displaySeasonList();
                const seasons = generateSeasonList();
                const current = seasons[2];
                currentSeasonData = { year: current.year, season: current.season, page: 1 };
                fetchSeasonAnime(current.year, current.season, 1);
                break;
            case 'recommendations':
                fetchRecommendations(1);
                break;
            case 'genres':
                fetchGenres();
                break;
            case 'search':
                document.getElementById('content').innerHTML = '<div class="error-message">📝 Masukkan kata kunci pencarian di atas</div>';
                document.getElementById('paginationContainer').style.display = 'none';
                break;
        }
        hideLoading();
    }, 500);
}

document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        loadTab(btn.dataset.tab);
    });
});

const searchBtn = document.getElementById('searchBtn');
if (searchBtn) {
    searchBtn.addEventListener('click', () => {
        const keyword = document.getElementById('searchInput').value.trim();
        if (keyword) {
            showLoading();
            searchAnime(keyword).then(() => hideLoading());
        }
    });
}

const searchInput = document.getElementById('searchInput');
if (searchInput) {
    searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            document.getElementById('searchBtn').click();
        }
    });
}

const prevPageBtn = document.getElementById('prevPageBtn');
if (prevPageBtn) {
    prevPageBtn.addEventListener('click', () => goToPage('prev'));
}

const nextPageBtn = document.getElementById('nextPageBtn');
if (nextPageBtn) {
    nextPageBtn.addEventListener('click', () => goToPage('next'));
}

function startAutoUpdate() {
    if (autoUpdateInterval) {
        clearInterval(autoUpdateInterval);
    }
    
}

async function getUserTimezone() {
    try {
        const response = await fetch('https://ipapi.co/json/');
        const data = await response.json();
        return data.timezone || 'Asia/Jakarta';
    } catch (error) {
        return 'Asia/Jakarta';
    }
}

function getGreeting(hour) {
    if (hour >= 5 && hour < 11) {
        return 'Selamat Pagi';
    } else if (hour >= 11 && hour < 15) {
        return 'Selamat Siang';
    } else if (hour >= 15 && hour < 19) {
        return 'Selamat Sore';
    } else {
        return 'Selamat Malam';
    }
}

function updateDateTime(timezone) {
    const now = new Date();
    
    const options = {
        timeZone: timezone,
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false
    };
    
    const dateTimeStr = now.toLocaleString('id-ID', options);
    
    const hourOptions = { timeZone: timezone, hour: 'numeric', hour12: false };
    const hour = parseInt(now.toLocaleString('id-ID', hourOptions));
    
    const greetingElement = document.getElementById('greeting');
    const datetimeElement = document.getElementById('datetime');
    
    if (greetingElement) {
        greetingElement.textContent = getGreeting(hour);
    }
    
    if (datetimeElement) {
        datetimeElement.textContent = dateTimeStr;
    }
}

async function initializePoweredBy() {
    const timezone = await getUserTimezone();
    updateDateTime(timezone);
    
    setInterval(() => {
        updateDateTime(timezone);
    }, 1000);
}

// Mobile Features
function switchToTab(tabName) {
    const tabBtns = document.querySelectorAll('.drawer-content .tab-btn');
    tabBtns.forEach(btn => {
        if (btn.getAttribute('data-tab') === tabName) {
            btn.click();
        }
    });
    
    const mobileNavItems = document.querySelectorAll('.mobile-nav-item');
    mobileNavItems.forEach(item => {
        if (item.getAttribute('data-tab') === tabName) {
            item.classList.add('active');
        } else {
            item.classList.remove('active');
        }
    });
    
    scrollToTop();
}


// Pull to Refresh
let pullStartY = 0;
let pullMoveY = 0;
let isPulling = false;

function initPullToRefresh() {
    const pullIndicator = document.getElementById('pullToRefresh');
    
    document.addEventListener('touchstart', (e) => {
        if (window.pageYOffset === 0) {
            pullStartY = e.touches[0].clientY;
            isPulling = true;
        }
    });
    
    document.addEventListener('touchmove', (e) => {
        if (!isPulling) return;
        
        pullMoveY = e.touches[0].clientY;
        const pullDistance = pullMoveY - pullStartY;
        
        if (pullDistance > 80 && window.pageYOffset === 0) {
            pullIndicator.classList.add('show');
        }
    });
    
    document.addEventListener('touchend', async () => {
        if (!isPulling) return;
        
        const pullDistance = pullMoveY - pullStartY;
        
        if (pullDistance > 80 && window.pageYOffset === 0) {
            await loadCurrentTab();
            setTimeout(() => {
                pullIndicator.classList.remove('show');
            }, 1000);
        } else {
            pullIndicator.classList.remove('show');
        }
        
        isPulling = false;
        pullStartY = 0;
        pullMoveY = 0;
    });
}

// Swipe Gesture
let touchStartX = 0;
let touchEndX = 0;

function initSwipeGesture() {
    const swipeLeft = document.getElementById('swipeLeft');
    const swipeRight = document.getElementById('swipeRight');
    
    const tabs = ['schedule', 'airing', 'new', 'popular', 'season', 'recommendations', 'genres', 'search'];
    
    document.addEventListener('touchstart', (e) => {
        touchStartX = e.touches[0].clientX;
    });
    
    document.addEventListener('touchmove', (e) => {
        const touchMoveX = e.touches[0].clientX;
        const diff = touchMoveX - touchStartX;
        
        if (diff > 50) {
            swipeRight.classList.add('show');
            swipeLeft.classList.remove('show');
        } else if (diff < -50) {
            swipeLeft.classList.add('show');
            swipeRight.classList.remove('show');
        } else {
            swipeLeft.classList.remove('show');
            swipeRight.classList.remove('show');
        }
    });
    
    document.addEventListener('touchend', (e) => {
        touchEndX = e.changedTouches[0].clientX;
        handleSwipe();
        
        setTimeout(() => {
            swipeLeft.classList.remove('show');
            swipeRight.classList.remove('show');
        }, 300);
    });
    
    function handleSwipe() {
        const swipeDistance = touchEndX - touchStartX;
        const currentIndex = tabs.indexOf(currentTab);
        
        if (swipeDistance > 100 && currentIndex > 0) {
            switchToTab(tabs[currentIndex - 1]);
        } else if (swipeDistance < -100 && currentIndex < tabs.length - 1) {
            switchToTab(tabs[currentIndex + 1]);
        }
        
        touchStartX = 0;
        touchEndX = 0;
    }
}

// Initialize mobile features
if (window.innerWidth <= 768) {
    initSwipeGesture();
}

if (document.getElementById('content')) {
    loadTab('schedule');
    startAutoUpdate();
}
initializePoweredBy();
