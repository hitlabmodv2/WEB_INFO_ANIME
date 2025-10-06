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

document.addEventListener('DOMContentLoaded', () => {
    initScrollToTop();
    initThemeToggle();
    
    setTimeout(() => {
        hidePageTransition();
        document.body.classList.add('page-loaded');
    }, 300);
});

function getQueryParam(param) {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(param);
}

async function fetchUserProfile(username) {
    try {
        const loading = document.getElementById('loading');
        const content = document.getElementById('content');
        
        loading.style.display = 'block';
        content.style.display = 'none';
        
        const response = await fetch(`${API_BASE}/user-profile/${encodeURIComponent(username)}`);
        const result = await response.json();
        
        if (result.success && result.data) {
            displayProfile(result.data);
            content.style.display = 'block';
        } else {
            content.innerHTML = '<div class="error-message">❌ Gagal memuat profil user. User tidak ditemukan.</div>';
            content.style.display = 'block';
        }
        
        loading.style.display = 'none';
    } catch (error) {
        console.error('Error fetching user profile:', error);
        document.getElementById('loading').style.display = 'none';
        document.getElementById('content').innerHTML = '<div class="error-message">❌ Gagal memuat profil user. Silakan coba lagi.</div>';
        document.getElementById('content').style.display = 'block';
    }
}

async function fetchUserRecommendations(username) {
    try {
        const response = await fetch(`${API_BASE}/user-profile/${encodeURIComponent(username)}/recommendations?page=1`);
        const result = await response.json();
        
        if (result.success && result.data && result.data.length > 0) {
            return result.data.slice(0, 10);
        }
        return [];
    } catch (error) {
        console.error('Error fetching user recommendations:', error);
        return [];
    }
}

async function displayProfile(profile) {
    const content = document.getElementById('content');
    
    const stats = profile.animeStats || {};
    const favorites = profile.favorites || { anime: [], characters: [], people: [] };
    
    let html = `
        <div class="profile-header">
            <a href="javascript:history.back()" class="back-btn">← Kembali</a>
            <div class="profile-main">
                <div class="profile-avatar">
                    <img src="${profile.avatar || 'https://via.placeholder.com/150?text=No+Avatar'}" 
                         alt="${profile.username}"
                         onerror="this.src='https://via.placeholder.com/150?text=No+Avatar';">
                </div>
                <div class="profile-info">
                    <h1 class="profile-username">${profile.username}</h1>
                    ${profile.lastOnline ? `<div class="profile-detail"><strong>Last Online:</strong> ${profile.lastOnline}</div>` : ''}
                    ${profile.gender ? `<div class="profile-detail"><strong>Gender:</strong> ${profile.gender}</div>` : ''}
                    ${profile.birthday ? `<div class="profile-detail"><strong>Birthday:</strong> ${profile.birthday}</div>` : ''}
                    ${profile.location ? `<div class="profile-detail"><strong>Location:</strong> ${profile.location}</div>` : ''}
                    ${profile.joined ? `<div class="profile-detail"><strong>Joined:</strong> ${profile.joined}</div>` : ''}
                </div>
            </div>
        </div>
        
        ${(profile.forumPosts || profile.reviews || profile.recommendations || profile.interestStacks || profile.blogPosts || profile.clubs) ? `
        <div class="profile-stats">
            <h2>📝 User Statistics</h2>
            <div class="stats-grid">
                ${profile.forumPosts ? `<div class="stat-item"><div class="stat-label">Forum Posts</div><div class="stat-value">${profile.forumPosts}</div></div>` : ''}
                ${profile.reviews ? `<div class="stat-item"><div class="stat-label">Reviews</div><div class="stat-value">${profile.reviews}</div></div>` : ''}
                ${profile.recommendations ? `<div class="stat-item"><div class="stat-label">Recommendations</div><div class="stat-value">${profile.recommendations}</div></div>` : ''}
                ${profile.interestStacks ? `<div class="stat-item"><div class="stat-label">Interest Stacks</div><div class="stat-value">${profile.interestStacks}</div></div>` : ''}
                ${profile.blogPosts ? `<div class="stat-item"><div class="stat-label">Blog Posts</div><div class="stat-value">${profile.blogPosts}</div></div>` : ''}
                ${profile.clubs ? `<div class="stat-item"><div class="stat-label">Clubs</div><div class="stat-value">${profile.clubs}</div></div>` : ''}
            </div>
        </div>
        ` : ''}
    `;
    
    if (stats && Object.keys(stats).length > 0) {
        html += `
            <div class="profile-stats">
                <h2>📊 Anime Statistics</h2>
                <div class="stats-grid">
                    ${stats.days ? `<div class="stat-item"><div class="stat-label">Days Watched</div><div class="stat-value">${stats.days}</div></div>` : ''}
                    ${stats.meanScore ? `<div class="stat-item"><div class="stat-label">Mean Score</div><div class="stat-value">${stats.meanScore}</div></div>` : ''}
                    ${stats.watching ? `<div class="stat-item"><div class="stat-label">Watching</div><div class="stat-value">${stats.watching}</div></div>` : ''}
                    ${stats.completed ? `<div class="stat-item"><div class="stat-label">Completed</div><div class="stat-value">${stats.completed}</div></div>` : ''}
                    ${stats.onHold ? `<div class="stat-item"><div class="stat-label">On-Hold</div><div class="stat-value">${stats.onHold}</div></div>` : ''}
                    ${stats.dropped ? `<div class="stat-item"><div class="stat-label">Dropped</div><div class="stat-value">${stats.dropped}</div></div>` : ''}
                    ${stats.planToWatch ? `<div class="stat-item"><div class="stat-label">Plan to Watch</div><div class="stat-value">${stats.planToWatch}</div></div>` : ''}
                    ${stats.totalEntries ? `<div class="stat-item"><div class="stat-label">Total Entries</div><div class="stat-value">${stats.totalEntries}</div></div>` : ''}
                    ${stats.rewatched ? `<div class="stat-item"><div class="stat-label">Rewatched</div><div class="stat-value">${stats.rewatched}</div></div>` : ''}
                    ${stats.episodes ? `<div class="stat-item"><div class="stat-label">Episodes</div><div class="stat-value">${stats.episodes}</div></div>` : ''}
                </div>
            </div>
        `;
    }
    
    const recommendations = await fetchUserRecommendations(profile.username);
    
    if (recommendations.length > 0) {
        html += `
            <div class="profile-recommendations">
                <h2>💡 Rekomendasi</h2>
                <div class="recommendations-list">
                    ${recommendations.map(rec => `
                        <div class="recommendation-item">
                            <div class="recommendation-images">
                                <div class="rec-image-wrapper">
                                    <img src="${rec.left.image || 'https://via.placeholder.com/120x170?text=No+Image'}" 
                                         alt="${rec.left.title}"
                                         loading="lazy"
                                         onerror="this.src='https://via.placeholder.com/120x170?text=No+Image';">
                                    <div class="rec-title">${rec.left.title}</div>
                                </div>
                                <div class="rec-arrow">→</div>
                                <div class="rec-image-wrapper">
                                    <img src="${rec.right.image || 'https://via.placeholder.com/120x170?text=No+Image'}" 
                                         alt="${rec.right.title}"
                                         loading="lazy"
                                         onerror="this.src='https://via.placeholder.com/120x170?text=No+Image';">
                                    <div class="rec-title">${rec.right.title}</div>
                                </div>
                            </div>
                            <div class="recommendation-description">
                                <p>${rec.description}</p>
                                ${rec.date ? `<div class="recommendation-date">${rec.date}</div>` : ''}
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    }
    
    if (favorites.anime && favorites.anime.length > 0) {
        html += `
            <div class="profile-favorites">
                <h2>❤️ Favorite Anime</h2>
                <div class="favorites-grid">
                    ${favorites.anime.map(anime => `
                        <div class="favorite-item">
                            <div class="favorite-image">
                                <img src="${anime.image || 'https://via.placeholder.com/100x140?text=No+Image'}" 
                                     alt="${anime.name}"
                                     loading="lazy"
                                     onerror="this.src='https://via.placeholder.com/100x140?text=No+Image';">
                            </div>
                            <div class="favorite-name">${anime.name}</div>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    }
    
    if (favorites.characters && favorites.characters.length > 0) {
        html += `
            <div class="profile-favorites">
                <h2>🌟 Favorite Characters</h2>
                <div class="favorites-grid">
                    ${favorites.characters.map(char => `
                        <div class="favorite-item">
                            <div class="favorite-image">
                                <img src="${char.image || 'https://via.placeholder.com/100x140?text=No+Image'}" 
                                     alt="${char.name}"
                                     loading="lazy"
                                     onerror="this.src='https://via.placeholder.com/100x140?text=No+Image';">
                            </div>
                            <div class="favorite-name">${char.name}</div>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    }
    
    if (favorites.people && favorites.people.length > 0) {
        html += `
            <div class="profile-favorites">
                <h2>👤 Favorite People</h2>
                <div class="favorites-grid">
                    ${favorites.people.map(person => `
                        <div class="favorite-item">
                            <div class="favorite-image">
                                <img src="${person.image || 'https://via.placeholder.com/100x140?text=No+Image'}" 
                                     alt="${person.name}"
                                     loading="lazy"
                                     onerror="this.src='https://via.placeholder.com/100x140?text=No+Image';">
                            </div>
                            <div class="favorite-name">${person.name}</div>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    }
    
    content.innerHTML = html;
}

const username = getQueryParam('username');
if (username) {
    fetchUserProfile(username);
} else {
    document.getElementById('loading').style.display = 'none';
    document.getElementById('content').innerHTML = '<div class="error-message">❌ Username tidak ditemukan di URL</div>';
    document.getElementById('content').style.display = 'block';
}
