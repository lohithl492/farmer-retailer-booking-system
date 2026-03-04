const API_URL = 'http://localhost:5000/api';

// Navigation Functions
function showAuth(userType) {
    console.log('Showing auth for:', userType);
    const landing = document.getElementById('landing');
    const authSection = document.getElementById(`${userType}-auth`);
    
    if (landing) landing.style.display = 'none';
    if (authSection) authSection.style.display = 'flex';
}

function backToLanding() {
    console.log('Going back to landing');
    const landing = document.getElementById('landing');
    const farmerAuth = document.getElementById('farmer-auth');
    const retailerAuth = document.getElementById('retailer-auth');
    const adminAuth = document.getElementById('admin-auth');
    
    if (landing) landing.style.display = 'flex';
    if (farmerAuth) farmerAuth.style.display = 'none';
    if (retailerAuth) retailerAuth.style.display = 'none';
    if (adminAuth) adminAuth.style.display = 'none';
    
    clearAllInputs();
}

function clearAllInputs() {
    document.querySelectorAll('input, textarea').forEach(input => {
        if (input) input.value = '';
    });
    // Hide all OTP sections
    const otpSections = [
        'farmer-login-otp-section',
        'farmer-register-otp-section'
    ];
    otpSections.forEach(id => {
        const el = document.getElementById(id);
        if (el) el.style.display = 'none';
    });
}

// ==================== FARMER TABS ====================
function switchFarmerTab(tabName) {
    console.log('Switching to farmer tab:', tabName);
    
    try {
        // Hide all tab contents
        const contents = document.querySelectorAll('#farmer-auth .tab-content');
        contents.forEach(el => el.classList.remove('active'));
        
        // Remove active from all buttons
        const buttons = document.querySelectorAll('#farmer-auth .tab-btn');
        buttons.forEach(el => el.classList.remove('active'));
        
        // Show selected tab content
        const tabContent = document.getElementById(`farmer-${tabName}-tab`);
        if (tabContent) {
            console.log('Found tab content:', `farmer-${tabName}-tab`);
            tabContent.classList.add('active');
        } else {
            console.warn('Tab content not found:', `farmer-${tabName}-tab`);
        }
        
        // Mark button as active
        if (tabName === 'login') {
            buttons[0]?.classList.add('active');
        } else if (tabName === 'register') {
            buttons[1]?.classList.add('active');
        }
        
        // Hide OTP sections when switching
        const loginOtp = document.getElementById('farmer-login-otp-section');
        const registerOtp = document.getElementById('farmer-register-otp-section');
        if (loginOtp) loginOtp.style.display = 'none';
        if (registerOtp) registerOtp.style.display = 'none';
        
    } catch (error) {
        console.error('Error switching farmer tab:', error);
    }
}

// ==================== RETAILER TABS ====================
function switchRetailerTab(tabName) {
    console.log('Switching to retailer tab:', tabName);
    
    try {
        const contents = document.querySelectorAll('#retailer-auth .tab-content');
        contents.forEach(el => el.classList.remove('active'));
        
        const buttons = document.querySelectorAll('#retailer-auth .tab-btn');
        buttons.forEach(el => el.classList.remove('active'));
        
        const tabContent = document.getElementById(`retailer-${tabName}-tab`);
        if (tabContent) {
            tabContent.classList.add('active');
        }
        
        if (tabName === 'login') {
            buttons[0]?.classList.add('active');
        } else if (tabName === 'register') {
            buttons[1]?.classList.add('active');
        }
        
    } catch (error) {
        console.error('Error switching retailer tab:', error);
    }
}

// ==================== FARMER AUTHENTICATION ====================

// Send OTP for Farmer Login
async function sendFarmerOTP() {
    console.log('Sending Farmer Login OTP');
    
    const phoneEl = document.getElementById('farmer-login-phone');
    
    if (!phoneEl) {
        showAlert('Phone field not found', 'error');
        return;
    }

    const phoneValue = phoneEl.value ? phoneEl.value.trim() : '';
    
    if (!phoneValue) {
        showAlert('Please enter phone number', 'error');
        return;
    }
    
    if (phoneValue.length !== 10 || isNaN(phoneValue)) {
        showAlert('Phone number must be 10 digits', 'error');
        return;
    }

    try {
        showLoading(true);
        const response = await fetch(`${API_URL}/auth/send-otp`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ phone: phoneValue, userType: 'farmer' })
        });
        
        const data = await response.json();
        
        if (data.success) {
            showAlert(`✅ OTP sent! (Test OTP: ${data.otp})`, 'success');
            
            // Show OTP input section
            const otpSection = document.getElementById('farmer-login-otp-section');
            console.log('OTP Section element:', otpSection);
            
            if (otpSection) {
                otpSection.style.display = 'block';
                console.log('OTP section displayed');
                
                // Focus on OTP input
                setTimeout(() => {
                    const otpInput = document.getElementById('farmer-login-otp');
                    if (otpInput) {
                        otpInput.focus();
                        console.log('OTP input focused');
                    }
                }, 100);
            } else {
                console.error('OTP section not found!');
                showAlert('Error: OTP section not found in DOM', 'error');
            }
        } else {
            showAlert(data.message || 'Failed to send OTP', 'error');
        }
    } catch (error) {
        console.error('Error:', error);
        showAlert('Error: ' + error.message, 'error');
    } finally {
        showLoading(false);
    }
}

// Farmer Login
async function farmerLogin() {
    console.log('Farmer Login attempt');
    
    const phoneEl = document.getElementById('farmer-login-phone');
    const otpEl = document.getElementById('farmer-login-otp');

    if (!phoneEl || !otpEl) {
        showAlert('Form fields not found', 'error');
        return;
    }

    const phone = phoneEl.value ? phoneEl.value.trim() : '';
    const otp = otpEl.value ? otpEl.value.trim() : '';

    if (!phone || !otp) {
        showAlert('Please enter phone and OTP', 'error');
        return;
    }

    if (otp.length !== 6 || isNaN(otp)) {
        showAlert('Please enter valid 6-digit OTP', 'error');
        return;
    }

    try {
        showLoading(true);
        const response = await fetch(`${API_URL}/auth/login-farmer`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ phone, otp })
        });
        
        const data = await response.json();

        if (data.success) {
            showAlert('✅ Login successful!', 'success');
            localStorage.setItem('token', data.token);
            localStorage.setItem('userId', data.farmer.id);
            localStorage.setItem('userName', data.farmer.name);
            localStorage.setItem('userType', 'farmer');
            
            setTimeout(() => {
                window.location.href = '/farmer-dashboard.html';
            }, 1000);
        } else {
            showAlert(data.message || 'Login failed', 'error');
        }
    } catch (error) {
        console.error('Error:', error);
        showAlert('Error: ' + error.message, 'error');
    } finally {
        showLoading(false);
    }
}

// Send OTP for Farmer Registration
async function sendFarmerRegisterOTP() {
    console.log('Sending Farmer Register OTP');
    
    const nameEl = document.getElementById('farmer-name');
    const phoneEl = document.getElementById('farmer-phone');
    const locationEl = document.getElementById('farmer-location');

    if (!nameEl || !phoneEl || !locationEl) {
        showAlert('Form fields not found', 'error');
        return;
    }

    const name = nameEl.value ? nameEl.value.trim() : '';
    const phone = phoneEl.value ? phoneEl.value.trim() : '';
    const location = locationEl.value ? locationEl.value.trim() : '';

    if (!name || !phone || !location) {
        showAlert('Please fill all fields first', 'error');
        return;
    }

    if (phone.length !== 10 || isNaN(phone)) {
        showAlert('Phone number must be 10 digits', 'error');
        return;
    }

    try {
        showLoading(true);
        const response = await fetch(`${API_URL}/auth/send-otp`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ phone, userType: 'farmer' })
        });
        
        const data = await response.json();
        
        if (data.success) {
            showAlert(`✅ OTP sent! (Test OTP: ${data.otp})`, 'success');
            
            // Show OTP input section
            const otpSection = document.getElementById('farmer-register-otp-section');
            console.log('Register OTP Section element:', otpSection);
            
            if (otpSection) {
                otpSection.style.display = 'block';
                console.log('Register OTP section displayed');
                
                setTimeout(() => {
                    const otpInput = document.getElementById('farmer-register-otp');
                    if (otpInput) {
                        otpInput.focus();
                        console.log('Register OTP input focused');
                    }
                }, 100);
            } else {
                console.error('Register OTP section not found!');
                showAlert('Error: OTP section not found in DOM', 'error');
            }
        } else {
            showAlert(data.message || 'Failed to send OTP', 'error');
        }
    } catch (error) {
        console.error('Error:', error);
        showAlert('Error: ' + error.message, 'error');
    } finally {
        showLoading(false);
    }
}

// Farmer Register
async function farmerRegister() {
    console.log('Farmer Registration attempt');
    
    const nameEl = document.getElementById('farmer-name');
    const phoneEl = document.getElementById('farmer-phone');
    const otpEl = document.getElementById('farmer-register-otp');
    const locationEl = document.getElementById('farmer-location');

    if (!nameEl || !phoneEl || !otpEl || !locationEl) {
        showAlert('Form fields not found', 'error');
        return;
    }

    const name = nameEl.value ? nameEl.value.trim() : '';
    const phone = phoneEl.value ? phoneEl.value.trim() : '';
    const otp = otpEl.value ? otpEl.value.trim() : '';
    const location = locationEl.value ? locationEl.value.trim() : '';

    if (!name || !phone || !otp || !location) {
        showAlert('Please fill all fields', 'error');
        return;
    }

    if (otp.length !== 6 || isNaN(otp)) {
        showAlert('Please enter valid 6-digit OTP', 'error');
        return;
    }

    try {
        showLoading(true);
        const response = await fetch(`${API_URL}/auth/register-farmer`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, phone, otp, location })
        });
        
        const data = await response.json();

        if (data.success) {
            showAlert('✅ Registration successful! Awaiting admin approval.', 'success');
            localStorage.setItem('token', data.token);
            localStorage.setItem('userId', data.farmer.id);
            localStorage.setItem('userName', data.farmer.name);
            localStorage.setItem('userType', 'farmer');
            
            setTimeout(() => {
                backToLanding();
                clearAllInputs();
            }, 1500);
        } else {
            showAlert(data.message || 'Registration failed', 'error');
        }
    } catch (error) {
        console.error('Error:', error);
        showAlert('Error: ' + error.message, 'error');
    } finally {
        showLoading(false);
    }
}

// ==================== RETAILER AUTHENTICATION ====================

async function retailerLogin() {
    const emailEl = document.getElementById('retailer-login-email');
    const passwordEl = document.getElementById('retailer-login-password');

    if (!emailEl || !passwordEl) {
        showAlert('Form fields not found', 'error');
        return;
    }

    const email = emailEl.value ? emailEl.value.trim() : '';
    const password = passwordEl.value ? passwordEl.value.trim() : '';

    if (!email || !password) {
        showAlert('Please fill all fields', 'error');
        return;
    }

    try {
        showLoading(true);
        const response = await fetch(`${API_URL}/auth/login-retailer`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });
        
        const data = await response.json();

        if (data.success) {
            showAlert('✅ Login successful!', 'success');
            localStorage.setItem('token', data.token);
            localStorage.setItem('userId', data.retailer.id);
            localStorage.setItem('userName', data.retailer.name);
            localStorage.setItem('userType', 'retailer');
            
            setTimeout(() => {
                window.location.href = '/retailer-dashboard.html';
            }, 1000);
        } else {
            showAlert(data.message || 'Login failed', 'error');
        }
    } catch (error) {
        console.error('Error:', error);
        showAlert('Error: ' + error.message, 'error');
    } finally {
        showLoading(false);
    }
}

async function retailerRegister() {
    const nameEl = document.getElementById('retailer-name');
    const phoneEl = document.getElementById('retailer-phone');
    const emailEl = document.getElementById('retailer-email');
    const passwordEl = document.getElementById('retailer-password');

    if (!nameEl || !phoneEl || !emailEl || !passwordEl) {
        showAlert('Form fields not found', 'error');
        return;
    }

    const name = nameEl.value ? nameEl.value.trim() : '';
    const phone = phoneEl.value ? phoneEl.value.trim() : '';
    const email = emailEl.value ? emailEl.value.trim() : '';
    const password = passwordEl.value ? passwordEl.value.trim() : '';

    if (!name || !phone || !email || !password) {
        showAlert('Please fill all fields', 'error');
        return;
    }

    if (phone.length !== 10 || isNaN(phone)) {
        showAlert('Phone number must be 10 digits', 'error');
        return;
    }

    if (password.length < 6) {
        showAlert('Password must be at least 6 characters', 'error');
        return;
    }

    try {
        showLoading(true);
        const response = await fetch(`${API_URL}/auth/register-retailer`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, phone, email, password })
        });
        
        const data = await response.json();

        if (data.success) {
            showAlert('✅ Registration successful! Awaiting admin approval.', 'success');
            localStorage.setItem('token', data.token);
            localStorage.setItem('userId', data.retailer.id);
            localStorage.setItem('userName', data.retailer.name);
            localStorage.setItem('userType', 'retailer');
            
            setTimeout(() => {
                backToLanding();
                clearAllInputs();
            }, 1500);
        } else {
            showAlert(data.message || 'Registration failed', 'error');
        }
    } catch (error) {
        console.error('Error:', error);
        showAlert('Error: ' + error.message, 'error');
    } finally {
        showLoading(false);
    }
}

// ==================== ADMIN AUTHENTICATION ====================

async function adminLogin() {
    const emailEl = document.getElementById('admin-email');
    const passwordEl = document.getElementById('admin-password');

    if (!emailEl || !passwordEl) {
        showAlert('Form fields not found', 'error');
        return;
    }

    const email = emailEl.value ? emailEl.value.trim() : '';
    const password = passwordEl.value ? passwordEl.value.trim() : '';

    if (!email || !password) {
        showAlert('Please fill all fields', 'error');
        return;
    }

    try {
        showLoading(true);
        const response = await fetch(`${API_URL}/auth/login-admin`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });
        
        const data = await response.json();

        if (data.success) {
            showAlert('✅ Admin login successful!', 'success');
            localStorage.setItem('token', data.token);
            localStorage.setItem('userType', 'admin');
            
            setTimeout(() => {
                window.location.href = '/admin-dashboard.html';
            }, 1000);
        } else {
            showAlert(data.message || 'Invalid credentials', 'error');
        }
    } catch (error) {
        console.error('Error:', error);
        showAlert('Error: ' + error.message, 'error');
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
                border-top: 4px solid #667eea;
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