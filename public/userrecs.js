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

function navigateToProfile(username) {
    navigateWithTransition(`/profile.html?username=${encodeURIComponent(username)}`);
}

async function fetchUserRecommendations() {
    try {
        const loading = document.getElementById('loading');
        const content = document.getElementById('content');
        
        loading.style.display = 'block';
        content.innerHTML = '';
        
        const response = await fetch(`${API_BASE}/user-recommendations`);
        const result = await response.json();
        
        if (result.success && result.data && result.data.length > 0) {
            displayUsers(result.data, result.count);
        } else {
            content.innerHTML = '<div style="color: white; text-align: center; padding: 50px; font-size: 18px;">📝 Tidak ada data user tersedia saat ini</div>';
        }
        
        loading.style.display = 'none';
    } catch (error) {
        console.error('Error fetching user recommendations:', error);
        document.getElementById('loading').style.display = 'none';
        document.getElementById('content').innerHTML = '<div style="color: white; text-align: center; padding: 50px; font-size: 18px;">❌ Gagal memuat data. Silakan coba lagi.</div>';
    }
}

function displayUsers(users, totalCount) {
    const content = document.getElementById('content');
    
    const html = `
        <div class="userrecs-stats">
            <div class="userrecs-stats-card">
                <div class="userrecs-stats-icon">👥</div>
                <div class="userrecs-stats-content">
                    <div class="userrecs-stats-label">Total Top Users</div>
                    <div class="userrecs-stats-count">${totalCount || users.length}</div>
                    <div class="userrecs-stats-subtitle">Data Real-Time dari MyAnimeList</div>
                </div>
            </div>
        </div>
        <div class="section-title">
            <h2>🌟 Top User Recommendations</h2>
        </div>
        <div class="users-grid">
            ${users.map(user => `
                <div class="user-card" onclick="navigateToProfile('${user.username}')">
                    <div class="user-info">
                        <div>
                            <h3 class="username">${user.username}</h3>
                        </div>
                        <div class="rec-count">
                            <span class="rec-count-number">${user.recommendationCount.toLocaleString()}</span>
                            recommendations
                        </div>
                    </div>
                </div>
            `).join('')}
        </div>
    `;
    
    content.innerHTML = html;
}

fetchUserRecommendations();
