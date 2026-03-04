const API_URL = 'http://localhost:5000/api';
const token = localStorage.getItem('token');

console.log('Admin page loaded');
console.log('Token:', token);

// Check authentication
if (!token || localStorage.getItem('userType') !== 'admin') {
    console.warn('Not authenticated as admin, redirecting...');
    window.location.href = '/index.html';
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM Content Loaded');
    showSection('statistics');
    loadStatistics();
});

function showSection(section) {
    console.log('Showing section:', section);
    
    try {
        // Hide all sections
        const sections = document.querySelectorAll('.section');
        console.log('Found sections:', sections.length);
        
        sections.forEach(el => {
            if (el) el.classList.remove('active');
        });

        // Remove active class from sidebar links
        const links = document.querySelectorAll('.sidebar a');
        console.log('Found links:', links.length);
        
        links.forEach(el => {
            if (el) el.classList.remove('active');
        });

        // Show selected section
        const sectionEl = document.getElementById(section);
        console.log('Section element:', sectionEl);
        
        if (sectionEl) {
            sectionEl.classList.add('active');
        } else {
            console.warn('Section not found:', section);
        }

        // Add active class to clicked link (if event exists)
        if (event && event.target) {
            const activeLink = document.querySelector(`.sidebar a[onclick="showSection('${section}')"]`);
if (activeLink) activeLink.classList.add('active');
        }

        // Load data
        if (section === 'statistics') loadStatistics();
        if (section === 'pending-approvals') loadPendingApprovals();
        if (section === 'all-users') loadAllUsers();
    } catch (error) {
        console.error('Error in showSection:', error);
    }
}

// ==================== STATISTICS ====================
async function loadStatistics() {
    try {
        console.log('Loading statistics...');
        showLoading(true);
        
        const response = await fetch(`${API_URL}/admin/stats`, {
            method: 'GET',
            headers: { 
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        console.log('Stats response status:', response.status);
        const data = await response.json();
        console.log('Stats data:', data);

        if (data.success) {
            const stats = data.stats;
            const html = `
                <div class="stat-card stat-farmers">
                    <h3>👨‍🌾 Total Farmers</h3>
                    <p class="stat-number">${stats.totalFarmers}</p>
                </div>
                <div class="stat-card stat-retailers">
                    <h3>🛒 Total Retailers</h3>
                    <p class="stat-number">${stats.totalRetailers}</p>
                </div>
                <div class="stat-card stat-crops">
                    <h3>🌾 Active Crops</h3>
                    <p class="stat-number">${stats.totalCrops}</p>
                </div>
                <div class="stat-card stat-bookings">
                    <h3>📦 Total Bookings</h3>
                    <p class="stat-number">${stats.totalBookings}</p>
                </div>
                <div class="stat-card">
                    <h3>⏳ Pending Approvals</h3>
                    <p class="stat-number">${stats.pendingApprovals}</p>
                </div>
                <div class="stat-card">
                    <h3>✅ Completed Bookings</h3>
                    <p class="stat-number">${stats.completedBookings}</p>
                </div>
            `;

            const container = document.getElementById('stats-container');
            if (container) {
                container.innerHTML = html;
            }
        } else {
            showAlert(data.message || 'Failed to load statistics', 'error');
        }
    } catch (error) {
        console.error('Error loading statistics:', error);
        showAlert('Error: ' + error.message, 'error');
    } finally {
        showLoading(false);
    }
}

// ==================== PENDING APPROVALS ====================
async function loadPendingApprovals() {
    try {
        console.log('Loading pending approvals...');
        showLoading(true);
        
        const response = await fetch(`${API_URL}/admin/pending-approvals`, {
            method: 'GET',
            headers: { 
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        console.log('Pending approvals response status:', response.status);
        const data = await response.json();
        console.log('Pending approvals data:', data);

        if (data.success) {
            if (data.pendingUsers && data.pendingUsers.length > 0) {
                const html = data.pendingUsers.map(user => `
                    <div class="user-card pending">
                        <h3>${user.name}</h3>
                        <p><strong>Type:</strong> ${user.userType === 'farmer' ? '👨‍🌾 Farmer' : '🛒 Retailer'}</p>
                        <p><strong>Phone:</strong> <a href="tel:${user.phone}">${user.phone}</a></p>
                        <p><strong>Email:</strong> ${user.email || 'N/A'}</p>
                        <p><strong>Location:</strong> ${user.location || 'N/A'}</p>
                        <p><strong>Applied:</strong> ${new Date(user.createdAt).toLocaleDateString()}</p>
                        <div class="actions">
                            <button onclick="approveUser('${user._id}', '${user.name}')" class="btn-approve">✅ Approve</button>
                            <button onclick="rejectUser('${user._id}', '${user.name}')" class="btn-reject">❌ Reject</button>
                        </div>
                    </div>
                `).join('');

                const container = document.getElementById('pending-list');
                if (container) {
                    container.innerHTML = html;
                }
            } else {
                const container = document.getElementById('pending-list');
                if (container) {
                    container.innerHTML = '<p class="loading">✅ No pending approvals! All users are verified.</p>';
                }
            }
        } else {
            showAlert(data.message || 'Failed to load pending approvals', 'error');
        }
    } catch (error) {
        console.error('Error loading pending approvals:', error);
        const container = document.getElementById('pending-list');
        if (container) {
            container.innerHTML = `<p class="loading">❌ Error: ${error.message}</p>`;
        }
    } finally {
        showLoading(false);
    }
}

// ==================== APPROVE/REJECT USERS ====================
async function approveUser(userId, userName) {
    console.log('Approving user:', userId, userName);
    
    if (!confirm(`Approve ${userName}?`)) return;

    try {
        showLoading(true);
        const response = await fetch(`${API_URL}/admin/approve-user/${userId}`, {
            method: 'POST',
            headers: { 
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        console.log('Approve response status:', response.status);
        const data = await response.json();
        console.log('Approve data:', data);

        if (data.success) {
            showAlert(`✅ ${userName} approved successfully!`, 'success');
            loadPendingApprovals();
        } else {
            showAlert(data.message || 'Failed to approve user', 'error');
        }
    } catch (error) {
        console.error('Error approving user:', error);
        showAlert('Error: ' + error.message, 'error');
    } finally {
        showLoading(false);
    }
}

async function rejectUser(userId, userName) {
    console.log('Rejecting user:', userId, userName);
    
    if (!confirm(`Reject and remove ${userName}?`)) return;

    try {
        showLoading(true);
        const response = await fetch(`${API_URL}/admin/reject-user/${userId}`, {
            method: 'POST',
            headers: { 
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        console.log('Reject response status:', response.status);
        const data = await response.json();
        console.log('Reject data:', data);

        if (data.success) {
            showAlert(`❌ ${userName} has been rejected!`, 'success');
            loadPendingApprovals();
        } else {
            showAlert(data.message || 'Failed to reject user', 'error');
        }
    } catch (error) {
        console.error('Error rejecting user:', error);
        showAlert('Error: ' + error.message, 'error');
    } finally {
        showLoading(false);
    }
}

// ==================== ALL USERS ====================
async function loadAllUsers() {
    try {
        console.log('Loading all users...');
        showLoading(true);
        
        const response = await fetch(`${API_URL}/admin/users`, {
            method: 'GET',
            headers: { 
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        console.log('All users response status:', response.status);
        const data = await response.json();
        console.log('All users data:', data);

        if (data.success && data.users && data.users.length > 0) {
            const farmers = data.users.filter(u => u.userType === 'farmer');
            const retailers = data.users.filter(u => u.userType === 'retailer');

            let html = '';

            if (farmers.length > 0) {
                html += '<h3 style="margin-top: 2rem; margin-bottom: 1rem; color: #333; border-bottom: 2px solid #667eea; padding-bottom: 0.5rem;">👨‍🌾 Farmers (' + farmers.length + ')</h3>';
                html += farmers.map(user => `
                    <div class="user-card ${user.isApproved ? 'approved' : 'pending'}">
                        <h3>${user.name}</h3>
                        <p><strong>Phone:</strong> <a href="tel:${user.phone}">${user.phone}</a></p>
                        <p><strong>Location:</strong> ${user.location || 'N/A'}</p>
                        <p><strong>Status:</strong> <span style="color: ${user.isApproved ? '#4caf50' : '#ff9800'};">${user.isApproved ? '✅ Approved' : '⏳ Pending'}</span></p>
                        <p><strong>Joined:</strong> ${new Date(user.createdAt).toLocaleDateString()}</p>
                        ${!user.isApproved ? `
                            <div class="actions">
                                <button onclick="approveUser('${user._id}', '${user.name}')" class="btn-approve">✅ Approve</button>
                                <button onclick="rejectUser('${user._id}', '${user.name}')" class="btn-reject">❌ Reject</button>
                            </div>
                        ` : ''}
                    </div>
                `).join('');
            }

            if (retailers.length > 0) {
                html += '<h3 style="margin-top: 2rem; margin-bottom: 1rem; color: #333; border-bottom: 2px solid #f5576c; padding-bottom: 0.5rem;">🛒 Retailers (' + retailers.length + ')</h3>';
                html += retailers.map(user => `
                    <div class="user-card ${user.isApproved ? 'approved' : 'pending'}">
                        <h3>${user.name}</h3>
                        <p><strong>Phone:</strong> <a href="tel:${user.phone}">${user.phone}</a></p>
                        <p><strong>Email:</strong> ${user.email || 'N/A'}</p>
                        <p><strong>Status:</strong> <span style="color: ${user.isApproved ? '#4caf50' : '#ff9800'};">${user.isApproved ? '✅ Approved' : '⏳ Pending'}</span></p>
                        <p><strong>Joined:</strong> ${new Date(user.createdAt).toLocaleDateString()}</p>
                        ${!user.isApproved ? `
                            <div class="actions">
                                <button onclick="approveUser('${user._id}', '${user.name}')" class="btn-approve">✅ Approve</button>
                                <button onclick="rejectUser('${user._id}', '${user.name}')" class="btn-reject">❌ Reject</button>
                            </div>
                        ` : ''}
                    </div>
                `).join('');
            }

            const container = document.getElementById('users-list');
            if (container) {
                container.innerHTML = html;
            }
        } else {
            const container = document.getElementById('users-list');
            if (container) {
                container.innerHTML = '<p class="loading">No users found</p>';
            }
        }
    } catch (error) {
        console.error('Error loading users:', error);
        const container = document.getElementById('users-list');
        if (container) {
            container.innerHTML = `<p class="loading">❌ Error: ${error.message}</p>`;
        }
    } finally {
        showLoading(false);
    }
}

// ==================== UTILITY FUNCTIONS ====================

function showAlert(message, type = 'info') {
    try {
        const existingAlert = document.querySelector('.alert-box');
        if (existingAlert) {
            existingAlert.remove();
        }

        const alert = document.createElement('div');
        alert.className = `alert-box alert-${type}`;
        alert.textContent = message;
        alert.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 15px 20px;
            border-radius: 8px;
            font-weight: 600;
            z-index: 2000;
            max-width: 400px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        `;

        if (type === 'success') {
            alert.style.background = '#4caf50';
            alert.style.color = 'white';
        } else if (type === 'error') {
            alert.style.background = '#f44336';
            alert.style.color = 'white';
        } else {
            alert.style.background = '#2196F3';
            alert.style.color = 'white';
        }

        document.body.appendChild(alert);

        setTimeout(() => {
            if (alert && alert.parentNode) {
                alert.remove();
            }
        }, 4000);
    } catch (error) {
        console.error('Error showing alert:', error);
    }
}

function showLoading(show = true) {
    try {
        let loader = document.getElementById('loading-spinner');
        
        if (show && !loader) {
            loader = document.createElement('div');
            loader.id = 'loading-spinner';
            loader.style.cssText = `
                position: fixed;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                width: 50px;
                height: 50px;
                border: 4px solid #f3f3f3;
                border-top: 4px solid #fa709a;
                border-radius: 50%;
                animation: spin 1s linear infinite;
                z-index: 2000;
            `;
            
            if (!document.querySelector('style[data-spinner]')) {
                const style = document.createElement('style');
                style.setAttribute('data-spinner', 'true');
                style.textContent = `
                    @keyframes spin {
                        0% { transform: translate(-50%, -50%) rotate(0deg); }
                        100% { transform: translate(-50%, -50%) rotate(360deg); }
                    }
                `;
                document.head.appendChild(style);
            }
            
            document.body.appendChild(loader);
        } else if (!show && loader) {
            loader.remove();
        }
    } catch (error) {
        console.error('Error with loading spinner:', error);
    }
}

function logout() {
    if (confirm('Are you sure you want to logout?')) {
        localStorage.clear();
        window.location.href = '/index.html';
    }
}