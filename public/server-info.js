const API_BASE = window.location.hostname === 'localhost' 
    ? 'http://localhost:5000/api'
    : '/api';

let updateInterval = null;

async function fetchServerStats() {
    try {
        const response = await fetch(`${API_BASE}/server-stats`);
        const result = await response.json();
        
        if (result.success && result.data) {
            const data = result.data;
            
            document.getElementById('totalRam').textContent = data.memory.total;
            document.getElementById('usedRam').textContent = data.memory.used;
            document.getElementById('freeRam').textContent = data.memory.free;
            document.getElementById('ramPercentage').textContent = data.memory.usagePercent.toFixed(2) + '%';
            
            const progressBar = document.getElementById('ramProgressBar');
            progressBar.style.width = data.memory.usagePercent + '%';
            
            progressBar.classList.remove('low', 'medium', 'high');
            
            if (data.memory.usagePercent > 80) {
                progressBar.classList.add('high');
            } else if (data.memory.usagePercent > 60) {
                progressBar.classList.add('medium');
            } else {
                progressBar.classList.add('low');
            }
            
            const cpuCoresText = data.cpu.cores > 1 ? `${data.cpu.cores} Cores` : `${data.cpu.cores} Core`;
            document.getElementById('cpuCores').textContent = cpuCoresText;
            document.getElementById('cpuModel').textContent = data.cpu.model;
            document.getElementById('uptime').textContent = data.uptime;
            document.getElementById('platform').textContent = data.platform;
            document.getElementById('hostname').textContent = data.hostname || 'Server';
        }
    } catch (error) {
        console.error('Error fetching server stats:', error);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    fetchServerStats();
    
    updateInterval = setInterval(fetchServerStats, 3000);
});

window.addEventListener('beforeunload', () => {
    if (updateInterval) {
        clearInterval(updateInterval);
    }
});
