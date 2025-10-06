const API_BASE = '/api';
let currentAnimeId = null;
let currentAnimeData = null;
let loadedTabs = {
    details: false,
    characters: false,
    episodes: false,
    videos: false,
    stats: false,
    reviews: false,
    recommendations: false,
    pictures: false
};

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

function initThemeToggle() {
    const themeToggle = document.getElementById('themeToggle');
    const savedTheme = localStorage.getItem('theme') || 'light';
    
    if (savedTheme === 'dark') {
        document.body.classList.add('dark-mode');
    }
    
    if (themeToggle) {
        themeToggle.addEventListener('click', () => {
            document.body.classList.toggle('dark-mode');
            const isDark = document.body.classList.contains('dark-mode');
            localStorage.setItem('theme', isDark ? 'dark' : 'light');
            
            themeToggle.style.transform = 'scale(0.8) rotate(180deg)';
            setTimeout(() => {
                themeToggle.style.transform = '';
            }, 200);
        });
    }
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

document.addEventListener('DOMContentLoaded', () => {
    initThemeToggle();
    initScrollToTop();
    
    setTimeout(() => {
        hidePageTransition();
        document.body.classList.add('page-loaded');
    }, 300);
});

function getAnimeIdFromURL() {
    const params = new URLSearchParams(window.location.search);
    return params.get('id');
}

async function loadAnimeDetails() {
    const animeId = getAnimeIdFromURL();
    if (!animeId) {
        alert('ID anime tidak ditemukan');
        navigateWithTransition('/');
        return;
    }

    currentAnimeId = animeId;

    try {
        const response = await fetch(`${API_BASE}/detail/${animeId}`);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        currentAnimeData = data;

        document.getElementById('animeTitle').textContent = data.title;
        document.getElementById('animeImage').src = data.imageSrc;
        
        document.getElementById('scoreSection').innerHTML = `
            <strong>⭐ Score</strong><br>
            ${data.malScore || 'N/A'}
        `;
        
        document.getElementById('rankSection').innerHTML = `
            <strong>🏆 Rank</strong><br>
            #${data.rank || 'N/A'}
        `;
        
        document.getElementById('popularitySection').innerHTML = `
            <strong>📊 Popularity</strong><br>
            #${data.popularity || 'N/A'}
        `;
        
        document.getElementById('membersSection').innerHTML = `
            <strong>👥 Members</strong><br>
            ${data.members ? data.members.toLocaleString() : 'N/A'}
        `;

        displayDetailsTab(data);
        loadedTabs.details = true;
    } catch (error) {
        console.error('Error loading anime details:', error);
        alert('Gagal memuat detail anime');
    }
}

function displayDetailsTab(data) {
    const formatDate = (dateString) => {
        if (!dateString || dateString === 'TBA') return 'TBA';
        try {
            const date = new Date(dateString);
            if (isNaN(date.getTime())) return dateString;
            return date.toLocaleDateString('id-ID', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
            });
        } catch (e) {
            return dateString;
        }
    };

    const html = `
        <div class="info-section">
            <h3>Informasi</h3>
            <div class="info-item"><strong>Judul:</strong> ${data.title}</div>
            ${data.titleEnglish ? `<div class="info-item"><strong>English:</strong> ${data.titleEnglish}</div>` : ''}
            ${data.titleJapanese ? `<div class="info-item"><strong>Japanese:</strong> ${data.titleJapanese}</div>` : ''}
            <div class="info-item"><strong>Tipe:</strong> ${data.type || 'N/A'}</div>
            <div class="info-item"><strong>Episode:</strong> ${data.episodes || '?'}</div>
            <div class="info-item"><strong>Status:</strong> ${data.status || 'N/A'}</div>
            <div class="info-item"><strong>📅 Tanggal Rilis:</strong> ${formatDate(data.airedFrom)}</div>
            <div class="info-item"><strong>📺 Jadwal Tayang:</strong> ${data.broadcast || 'N/A'}</div>
            <div class="info-item"><strong>Musim:</strong> ${data.premiered || 'N/A'}</div>
            <div class="info-item"><strong>Durasi:</strong> ${data.duration || 'N/A'}</div>
            <div class="info-item"><strong>Sumber:</strong> ${data.source || 'N/A'}</div>
            ${data.rating ? `<div class="info-item"><strong>Rating:</strong> ${data.rating}</div>` : ''}
        </div>

        ${data.description ? `
            <div class="info-section">
                <h3>Synopsis</h3>
                <div class="synopsis-box">${data.description}</div>
            </div>
        ` : ''}

        ${data.genres && data.genres.length > 0 ? `
            <div class="info-section">
                <h3>Genre</h3>
                <div class="genres-list">
                    ${data.genres.map(g => `<span class="genre-badge">${g}</span>`).join('')}
                </div>
            </div>
        ` : ''}

        ${data.studios && data.studios.length > 0 ? `
            <div class="info-section">
                <h3>Studio</h3>
                <div class="info-item">${data.studios.join(', ')}</div>
            </div>
        ` : ''}

        ${data.producers && data.producers.length > 0 ? `
            <div class="info-section">
                <h3>Producer</h3>
                <div class="info-item">${data.producers.join(', ')}</div>
            </div>
        ` : ''}
    `;

    document.getElementById('detailsTab').innerHTML = html;
}

async function loadCharacters() {
    if (loadedTabs.characters) return;
    
    try {
        const response = await fetch(`${API_BASE}/characters/${currentAnimeId}`);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();

        if (!data || data.length === 0) {
            document.getElementById('charactersTab').innerHTML = '<p style="text-align:center; padding:40px;">Tidak ada data karakter</p>';
            return;
        }

        const html = `
            <div class="character-grid">
                ${data.slice(0, 20).map(char => `
                    <div class="character-card">
                        <img src="${char.character?.images?.jpg?.image_url || 'https://via.placeholder.com/60x80?text=No+Image'}" 
                             alt="${char.character?.name}" 
                             class="character-img"
                             onerror="this.src='https://via.placeholder.com/60x80?text=No+Image'">
                        <div class="character-info">
                            <div class="character-name">${char.character?.name || 'Unknown'}</div>
                            <div class="character-role">${char.role || 'Unknown'}</div>
                            ${char.voice_actors && char.voice_actors.length > 0 ? 
                                `<div class="character-role">CV: ${char.voice_actors[0]?.person?.name || 'Unknown'}</div>` : ''}
                        </div>
                    </div>
                `).join('')}
            </div>
        `;

        document.getElementById('charactersTab').innerHTML = html;
        loadedTabs.characters = true;
    } catch (error) {
        console.error('Error loading characters:', error);
        document.getElementById('charactersTab').innerHTML = '<p style="text-align:center; padding:40px; color:#e74c3c;">Gagal memuat karakter</p>';
    }
}

async function loadEpisodes() {
    if (loadedTabs.episodes) return;
    
    try {
        const response = await fetch(`${API_BASE}/episodes/${currentAnimeId}`);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();

        if (!data || data.length === 0) {
            document.getElementById('episodesTab').innerHTML = '<p style="text-align:center; padding:40px;">Tidak ada data episode</p>';
            return;
        }

        const html = `
            <div class="episode-list">
                ${data.map(ep => `
                    <div class="episode-item">
                        <div class="episode-title">Episode ${ep.mal_id}: ${ep.title || 'No Title'}</div>
                        ${ep.aired ? `<div class="episode-info">Aired: ${new Date(ep.aired).toLocaleDateString('id-ID')}</div>` : ''}
                        ${ep.filler ? '<div class="episode-info" style="color:#e74c3c;">Filler</div>' : ''}
                        ${ep.recap ? '<div class="episode-info" style="color:#f39c12;">Recap</div>' : ''}
                    </div>
                `).join('')}
            </div>
        `;

        document.getElementById('episodesTab').innerHTML = html;
        loadedTabs.episodes = true;
    } catch (error) {
        console.error('Error loading episodes:', error);
        document.getElementById('episodesTab').innerHTML = '<p style="text-align:center; padding:40px; color:#e74c3c;">Gagal memuat episode</p>';
    }
}

function getYouTubeVideoId(url) {
    if (!url) return null;
    const regExp = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[7].length === 11) ? match[7] : null;
}

function openVideoModal(videoUrl, title) {
    const videoId = getYouTubeVideoId(videoUrl);
    if (!videoId) return;
    
    const modal = document.getElementById('videoModal');
    const iframe = document.getElementById('videoPlayer');
    const modalTitle = document.getElementById('videoModalTitle');
    
    iframe.src = `https://www.youtube.com/embed/${videoId}?autoplay=1`;
    modalTitle.textContent = title;
    modal.classList.add('active');
    
    if (currentAnimeData) {
        displayAnimeInfoInModal(currentAnimeData);
    }
}

function displayAnimeInfoInModal(data) {
    const formatDate = (dateString) => {
        if (!dateString || dateString === 'TBA') return 'TBA';
        try {
            const date = new Date(dateString);
            if (isNaN(date.getTime())) return dateString;
            return date.toLocaleDateString('id-ID', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
            });
        } catch (e) {
            return dateString;
        }
    };
    
    document.getElementById('videoAnimePoster').src = data.imageSrc || '';
    document.getElementById('videoAnimeTitle').textContent = data.title || 'Loading...';
    
    const typeSpan = document.getElementById('videoAnimeType');
    typeSpan.textContent = data.type || 'N/A';
    typeSpan.className = 'video-meta-badge type-badge';
    
    const scoreSpan = document.getElementById('videoAnimeScore');
    scoreSpan.textContent = `⭐ ${data.malScore || 'N/A'}`;
    scoreSpan.className = 'video-meta-badge score-badge';
    
    const statusSpan = document.getElementById('videoAnimeStatus');
    statusSpan.textContent = data.status || 'N/A';
    statusSpan.className = 'video-meta-badge status-badge';
    
    const fullInfoDiv = document.getElementById('videoAnimeFullInfo');
    let fullInfoHTML = '<div class="video-info-list">';
    
    if (data.titleEnglish) {
        fullInfoHTML += `<div class="video-info-item"><strong>English:</strong> ${data.titleEnglish}</div>`;
    }
    if (data.titleJapanese) {
        fullInfoHTML += `<div class="video-info-item"><strong>Japanese:</strong> ${data.titleJapanese}</div>`;
    }
    fullInfoHTML += `<div class="video-info-item"><strong>Episode:</strong> ${data.episodes || '?'}</div>`;
    if (data.aired) {
        fullInfoHTML += `<div class="video-info-item"><strong>📅 Tanggal Rilis:</strong> ${formatDate(data.aired)}</div>`;
    }
    if (data.broadcast) {
        fullInfoHTML += `<div class="video-info-item"><strong>📺 Jadwal Tayang:</strong> ${data.broadcast}</div>`;
    }
    if (data.season) {
        fullInfoHTML += `<div class="video-info-item"><strong>Musim:</strong> ${data.season}</div>`;
    }
    if (data.duration) {
        fullInfoHTML += `<div class="video-info-item"><strong>Durasi:</strong> ${data.duration}</div>`;
    }
    if (data.source) {
        fullInfoHTML += `<div class="video-info-item"><strong>Sumber:</strong> ${data.source}</div>`;
    }
    if (data.rating) {
        fullInfoHTML += `<div class="video-info-item"><strong>Rating:</strong> ${data.rating}</div>`;
    }
    fullInfoHTML += '</div>';
    fullInfoDiv.innerHTML = fullInfoHTML;
    
    const synopsisDiv = document.getElementById('videoAnimeSynopsis');
    if (data.description) {
        synopsisDiv.innerHTML = `
            <h5 style="color: #a5b4fc; margin: 15px 0 10px 0; font-size: 1.1em;">Synopsis</h5>
            <div class="video-synopsis-text">${data.description}</div>
        `;
    } else {
        synopsisDiv.innerHTML = '';
    }
    
    const genresDiv = document.getElementById('videoAnimeGenres');
    let genresHTML = '';
    
    if (data.genres && data.genres.length > 0) {
        genresHTML += '<h5 style="color: #a5b4fc; margin: 15px 0 10px 0; font-size: 1.1em;">Genre</h5>';
        genresHTML += '<div class="video-genre-list">';
        genresHTML += data.genres.map(genre => 
            `<span class="video-genre-tag">${genre}</span>`
        ).join('');
        genresHTML += '</div>';
    }
    
    if (data.studios && data.studios.length > 0) {
        genresHTML += '<h5 style="color: #a5b4fc; margin: 15px 0 10px 0; font-size: 1.1em;">Studio</h5>';
        genresHTML += '<div class="video-genre-list">';
        genresHTML += data.studios.map(studio => 
            `<span class="video-genre-tag">${studio}</span>`
        ).join('');
        genresHTML += '</div>';
    }
    
    if (data.producers && data.producers.length > 0) {
        genresHTML += '<h5 style="color: #a5b4fc; margin: 15px 0 10px 0; font-size: 1.1em;">Producer</h5>';
        genresHTML += '<div class="video-genre-list">';
        genresHTML += data.producers.map(producer => 
            `<span class="video-genre-tag">${producer}</span>`
        ).join('');
        genresHTML += '</div>';
    }
    
    genresDiv.innerHTML = genresHTML;
}

function closeVideoModal() {
    const modal = document.getElementById('videoModal');
    const iframe = document.getElementById('videoPlayer');
    
    iframe.src = '';
    modal.classList.remove('active');
}

async function loadVideos() {
    if (loadedTabs.videos) return;
    
    try {
        const response = await fetch(`${API_BASE}/videos/${currentAnimeId}`);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();

        const allVideos = [
            ...(data.promo || []).map(v => ({...v, type: 'Promo'})),
            ...(data.episodes || []).map(v => ({...v, type: 'Episode'})),
            ...(data.music_videos || []).map(v => ({...v, type: 'Music Video'}))
        ];

        if (allVideos.length === 0) {
            document.getElementById('videosTab').innerHTML = '<p style="text-align:center; padding:40px;">Tidak ada data video</p>';
            return;
        }

        const html = `
            <div class="video-grid">
                ${allVideos.slice(0, 12).map(video => `
                    <div class="video-card" onclick='openVideoModal("${video.trailer?.url || ''}", "${(video.title || 'No Title').replace(/'/g, "\\'")}");' style="cursor:pointer;">
                        <div style="position:relative;">
                            <img src="${video.trailer?.images?.maximum_image_url || video.trailer?.images?.image_url || 'https://via.placeholder.com/320x180?text=Video'}" 
                                 alt="${video.title}" 
                                 class="video-thumbnail"
                                 onerror="this.src='https://via.placeholder.com/320x180?text=Video'">
                            <div style="position:absolute; top:50%; left:50%; transform:translate(-50%, -50%); background:rgba(0,0,0,0.7); border-radius:50%; width:50px; height:50px; display:flex; align-items:center; justify-content:center;">
                                <div style="width:0; height:0; border-left:15px solid white; border-top:10px solid transparent; border-bottom:10px solid transparent; margin-left:3px;"></div>
                            </div>
                        </div>
                        <div class="video-info">
                            <div class="video-title">${video.title || 'No Title'}</div>
                            <div style="font-size:0.8em; color:#666; margin-top:5px;">${video.type}</div>
                            ${video.trailer?.url ? 
                                `<div style="color:#667eea; font-size:0.85em; margin-top:5px; font-weight:600;">▶ Putar Video</div>` : ''}
                        </div>
                    </div>
                `).join('')}
            </div>
        `;

        document.getElementById('videosTab').innerHTML = html;
        loadedTabs.videos = true;
    } catch (error) {
        console.error('Error loading videos:', error);
        document.getElementById('videosTab').innerHTML = '<p style="text-align:center; padding:40px; color:#e74c3c;">Gagal memuat video</p>';
    }
}

async function loadStats() {
    if (loadedTabs.stats) return;
    
    try {
        const response = await fetch(`${API_BASE}/stats/${currentAnimeId}`);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();

        const html = `
            <div class="stats-grid">
                <div class="stat-card">
                    <div class="stat-value">${data.watching?.toLocaleString() || '0'}</div>
                    <div class="stat-label">Watching</div>
                </div>
                <div class="stat-card">
                    <div class="stat-value">${data.completed?.toLocaleString() || '0'}</div>
                    <div class="stat-label">Completed</div>
                </div>
                <div class="stat-card">
                    <div class="stat-value">${data.on_hold?.toLocaleString() || '0'}</div>
                    <div class="stat-label">On Hold</div>
                </div>
                <div class="stat-card">
                    <div class="stat-value">${data.dropped?.toLocaleString() || '0'}</div>
                    <div class="stat-label">Dropped</div>
                </div>
                <div class="stat-card">
                    <div class="stat-value">${data.plan_to_watch?.toLocaleString() || '0'}</div>
                    <div class="stat-label">Plan to Watch</div>
                </div>
                <div class="stat-card">
                    <div class="stat-value">${data.total?.toLocaleString() || '0'}</div>
                    <div class="stat-label">Total</div>
                </div>
            </div>
        `;

        document.getElementById('statsTab').innerHTML = html;
        loadedTabs.stats = true;
    } catch (error) {
        console.error('Error loading stats:', error);
        document.getElementById('statsTab').innerHTML = '<p style="text-align:center; padding:40px; color:#e74c3c;">Gagal memuat statistik</p>';
    }
}

async function loadReviews() {
    if (loadedTabs.reviews) return;
    
    try {
        const response = await fetch(`${API_BASE}/reviews/${currentAnimeId}`);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();

        if (!data || data.length === 0) {
            document.getElementById('reviewsTab').innerHTML = '<p style="text-align:center; padding:40px;">Belum ada review</p>';
            return;
        }

        const html = `
            <div class="review-list">
                ${data.slice(0, 10).map(review => `
                    <div class="review-card">
                        <div class="review-header">
                            <div class="review-author">${review.user?.username || 'Anonymous'}</div>
                            <div class="review-score">⭐ ${review.score || 'N/A'}</div>
                        </div>
                        <div class="review-text">${(review.review || '').substring(0, 300)}${review.review?.length > 300 ? '...' : ''}</div>
                        <div style="margin-top:10px; font-size:0.8em; color:#666;">
                            👍 ${review.reactions?.overall || 0} reactions
                        </div>
                    </div>
                `).join('')}
            </div>
        `;

        document.getElementById('reviewsTab').innerHTML = html;
        loadedTabs.reviews = true;
    } catch (error) {
        console.error('Error loading reviews:', error);
        document.getElementById('reviewsTab').innerHTML = '<p style="text-align:center; padding:40px; color:#e74c3c;">Gagal memuat review</p>';
    }
}

async function loadRecommendations() {
    if (loadedTabs.recommendations) return;
    
    try {
        const response = await fetch(`${API_BASE}/recommendations/${currentAnimeId}`);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();

        if (!data || data.length === 0) {
            document.getElementById('recommendationsTab').innerHTML = '<p style="text-align:center; padding:40px;">Tidak ada rekomendasi</p>';
            return;
        }

        const html = `
            <div class="recommendation-grid">
                ${data.slice(0, 20).map(rec => `
                    <div class="recommendation-card" onclick="navigateWithTransition('/detail.html?id=${rec.entry?.mal_id}')">
                        <img src="${rec.entry?.images?.jpg?.large_image_url || rec.entry?.images?.jpg?.image_url || 'https://via.placeholder.com/200x280?text=No+Image'}" 
                             alt="${rec.entry?.title}" 
                             class="recommendation-img"
                             onerror="this.src='https://via.placeholder.com/200x280?text=No+Image'">
                        <div class="recommendation-info">
                            <div class="recommendation-title">${rec.entry?.title || 'No Title'}</div>
                            <div style="font-size:0.75em; color:#666; margin-top:5px;">👍 ${rec.votes || 0} votes</div>
                        </div>
                    </div>
                `).join('')}
            </div>
        `;

        document.getElementById('recommendationsTab').innerHTML = html;
        loadedTabs.recommendations = true;
    } catch (error) {
        console.error('Error loading recommendations:', error);
        document.getElementById('recommendationsTab').innerHTML = '<p style="text-align:center; padding:40px; color:#e74c3c;">Gagal memuat rekomendasi</p>';
    }
}

async function loadPictures() {
    if (loadedTabs.pictures) return;
    
    const picturesTab = document.getElementById('picturesTab');
    picturesTab.innerHTML = `
        <div class="loading-section">
            <div class="spinner"></div>
            <p>Memuat gambar...</p>
        </div>
    `;
    
    try {
        const response = await fetch(`${API_BASE}/pictures/${currentAnimeId}`);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();

        if (!data || data.length === 0) {
            picturesTab.innerHTML = '<p style="text-align:center; padding:40px;">Tidak ada gambar</p>';
            return;
        }

        const html = `
            <div class="picture-grid">
                ${data.map(pic => `
                    <div class="picture-item" onclick="openImageModal('${pic.jpg?.large_image_url || pic.jpg?.image_url}')">
                        <div class="picture-wrapper">
                            <div class="picture-loader"></div>
                            <img src="${pic.jpg?.large_image_url || pic.jpg?.image_url || 'https://via.placeholder.com/200x280?text=No+Image'}" 
                                 alt="Anime Picture"
                                 loading="lazy"
                                 onload="this.parentElement.querySelector('.picture-loader').style.display='none'; this.style.opacity='1';"
                                 onerror="this.src='https://via.placeholder.com/200x280?text=No+Image'; this.parentElement.querySelector('.picture-loader').style.display='none'; this.style.opacity='1';"
                                 style="opacity: 0; transition: opacity 0.3s ease;">
                        </div>
                    </div>
                `).join('')}
            </div>
        `;

        picturesTab.innerHTML = html;
        loadedTabs.pictures = true;
    } catch (error) {
        console.error('Error loading pictures:', error);
        picturesTab.innerHTML = '<p style="text-align:center; padding:40px; color:#e74c3c;">Gagal memuat gambar</p>';
    }
}

document.querySelectorAll('.detail-tab-btn').forEach(btn => {
    btn.addEventListener('click', async () => {
        document.querySelectorAll('.detail-tab-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        document.querySelectorAll('.detail-tab-content').forEach(content => {
            content.classList.remove('active');
        });

        const tab = btn.dataset.tab;
        document.getElementById(`${tab}Tab`).classList.add('active');

        switch(tab) {
            case 'characters':
                await loadCharacters();
                break;
            case 'episodes':
                await loadEpisodes();
                break;
            case 'videos':
                await loadVideos();
                break;
            case 'stats':
                await loadStats();
                break;
            case 'reviews':
                await loadReviews();
                break;
            case 'recommendations':
                await loadRecommendations();
                break;
            case 'pictures':
                await loadPictures();
                break;
        }
    });
});

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

function navigateToHome(event) {
    event.preventDefault();
    navigateWithTransition('/');
}

function openImageModal(imageUrl) {
    const modal = document.getElementById('imageModal');
    const modalImage = document.getElementById('modalImage');
    const modalLoader = document.getElementById('modalLoader');
    
    modal.classList.add('active');
    modalImage.style.display = 'none';
    modalLoader.style.display = 'block';
    
    const img = new Image();
    img.onload = function() {
        modalImage.src = imageUrl;
        modalImage.style.display = 'block';
        modalLoader.style.display = 'none';
    };
    img.onerror = function() {
        modalImage.src = 'https://via.placeholder.com/400x600?text=Image+Not+Available';
        modalImage.style.display = 'block';
        modalLoader.style.display = 'none';
    };
    img.src = imageUrl;
}

function closeImageModal() {
    const modal = document.getElementById('imageModal');
    modal.classList.remove('active');
}

document.getElementById('imageModal').addEventListener('click', function(e) {
    if (e.target === this) {
        closeImageModal();
    }
});

document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
        closeImageModal();
    }
});

loadAnimeDetails();
initializePoweredBy();
