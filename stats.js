// ====== AUTHENTICATION CHECK ======
if (!localStorage.getItem('admin_token')) {
    window.location.href = 'auth.html';
}

// Check for UI username update
document.addEventListener('DOMContentLoaded', () => {
    const userProfile = document.querySelector('.user-profile');
    if (userProfile && localStorage.getItem('admin_username')) {
        const username = localStorage.getItem('admin_username');
        const initial = username.charAt(0).toUpperCase();
        userProfile.innerHTML = `
            <div style="display: flex; align-items: center; gap: 10px;">
                <span style="font-weight: 500;">Xin chào, ${username}</span>
                <div style="width: 40px; height: 40px; background: var(--primary); border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: bold; font-family: Outfit;">
                    ${initial}
                </div>
            </div>
        `;
    }
});

// API Configuration
const BASE_URL = 'https://clark-role-bennett-award.trycloudflare.com';

// DOM Elements
const viewsEl = document.getElementById('stat-total-views');
const likesEl = document.getElementById('stat-total-likes');
const commentsEl = document.getElementById('stat-total-comments');
const loading = document.getElementById('global-loading');

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    fetchStats();
});

// Fetch Data
async function fetchStats() {
    showLoading(true);
    try {
        const res = await fetch(`${BASE_URL}/api/admin/stats/overall`);
        if (!res.ok) throw new Error('Network error or server down');
        const data = await res.json();
        
        // Update Totals
        viewsEl.textContent = data.totals.total_views.toLocaleString();
        likesEl.textContent = data.totals.total_likes.toLocaleString();
        commentsEl.textContent = data.totals.total_comments.toLocaleString();
        
        // Render Chart
        renderChart(data.daily);
        
    } catch (err) {
        console.error(err);
        showToast('Không thể kết nối đến SQL Server: ' + err.message, 'error');
    } finally {
        showLoading(false);
    }
}

// Function to render chart using Chart.js
function renderChart(dailyData) {
    const ctx = document.getElementById('statsChart').getContext('2d');
    
    // Sort and fill gaps if necessary (optional improvement)
    const labels = dailyData.map(d => d.date);
    const views = dailyData.map(d => d.views);
    const likes = dailyData.map(d => d.likes);
    const comments = dailyData.map(d => d.comments);

    new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [
                {
                    label: 'Lượt Xem',
                    data: views,
                    borderColor: '#6366f1',
                    backgroundColor: 'rgba(99, 102, 241, 0.1)',
                    fill: true,
                    tension: 0.4,
                    pointRadius: 4,
                    pointBackgroundColor: '#6366f1'
                },
                {
                    label: 'Lượt Thích',
                    data: likes,
                    borderColor: '#ec4899',
                    backgroundColor: 'transparent',
                    fill: false,
                    tension: 0.4,
                    pointRadius: 4,
                    pointBackgroundColor: '#ec4899'
                },
                {
                    label: 'Bình Luận',
                    data: comments,
                    borderColor: '#f59e0b',
                    backgroundColor: 'transparent',
                    fill: false,
                    tension: 0.4,
                    pointRadius: 4,
                    pointBackgroundColor: '#f59e0b'
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false // We use custom legends in HTML
                },
                tooltip: {
                    backgroundColor: '#1e2130',
                    titleFont: { family: 'Outfit', size: 14 },
                    bodyFont: { family: 'Inter', size: 13 },
                    padding: 12,
                    boxPadding: 8,
                    borderColor: 'rgba(255,255,255,0.1)',
                    borderWidth: 1
                }
            },
            scales: {
                x: {
                    grid: {
                        color: 'rgba(255, 255, 255, 0.05)'
                    },
                    ticks: {
                        color: '#94a3b8',
                        font: { size: 11 }
                    }
                },
                y: {
                    beginAtZero: true,
                    grid: {
                        color: 'rgba(255, 255, 255, 0.05)'
                    },
                    ticks: {
                        color: '#94a3b8',
                        font: { size: 11 }
                    }
                }
            }
        }
    });
}

// Utils
function showToast(message, type = 'success') {
    const container = document.getElementById('toast-container');
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerHTML = `<i class="fa-solid fa-${type === 'success' ? 'check-circle' : 'exclamation-circle'}"></i> ${message}`;
    container.appendChild(toast);
    
    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateX(100%)';
        toast.style.transition = 'all 0.3s';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

function showLoading(show) {
    if (show) loading.classList.add('active');
    else loading.classList.remove('active');
}
