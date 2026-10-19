// =================== SIMPLE CART SYSTEM ===================
let cart = [];
if (localStorage.getItem('pizzaCart')) {
    cart = JSON.parse(localStorage.getItem('pizzaCart'));
}
function updateCartDisplay() {
    const el = document.getElementById('cartCount');
    if (el) el.textContent = cart.length;
}

// =================== SIDEBAR MENU TOGGLE ===================
const menuBtn = document.getElementById('menuBtn');
const closeBtn = document.getElementById('closeBtn');
const sidebar = document.getElementById('sidebar');
const overlay = document.getElementById('overlay');

menuBtn.addEventListener('click', function () {
    sidebar.classList.add('active');
    overlay.classList.add('active');
    document.body.style.overflow = 'hidden';
});
closeBtn.addEventListener('click', closeSidebar);
overlay.addEventListener('click', closeSidebar);
function closeSidebar() {
    sidebar.classList.remove('active');
    overlay.classList.remove('active');
    document.body.style.overflow = '';
}

document.querySelectorAll('.sidebar-nav a').forEach(link => {
    link.addEventListener('click', function () {
        if (window.innerWidth <= 900) closeSidebar();
    });
});

document.addEventListener('keydown', function (event) {
    if (event.key === 'Escape') closeSidebar();
});

window.addEventListener('resize', function () {
    if (window.innerWidth > 900) closeSidebar();
});

window.addEventListener('DOMContentLoaded', () => {
    const header = document.getElementById('header');
    if (header) header.classList.remove('hidden');
    updateCartDisplay();

    if (Api.isLoggedIn()) {
        window.location.href = getPostLoginRedirect();
    }
});

// =================== LOGIN + OTP FLOW ===================
const stepLogin = document.getElementById('stepLogin');
const stepOtp = document.getElementById('stepOtp');
const loginForm = document.getElementById('loginForm');
const otpForm = document.getElementById('otpForm');

let pendingLoginUserId = null;
let pendingLoginRole = null;
let resendTimerInterval = null;

document.querySelectorAll('.toggle-password').forEach(btn => {
    btn.addEventListener('click', () => {
        const target = document.getElementById(btn.dataset.target);
        const icon = btn.querySelector('i');
        if (target.type === 'password') {
            target.type = 'text';
            icon.classList.replace('fa-eye', 'fa-eye-slash');
        } else {
            target.type = 'password';
            icon.classList.replace('fa-eye-slash', 'fa-eye');
        }
    });
});

function getPostLoginRedirect() {
    const saved = sessionStorage.getItem('pizza_redirect_after_login');
    sessionStorage.removeItem('pizza_redirect_after_login');
    return saved || 'dashboard.html';
}

function clearFieldErrors() {
    document.querySelectorAll('.field-error').forEach(el => el.textContent = '');
}

loginForm.addEventListener('submit', async function (e) {
    e.preventDefault();
    clearFieldErrors();

    const email = document.getElementById('loginEmail').value.trim();
    const password = document.getElementById('loginPassword').value;

    let hasError = false;
    if (!email) {
        document.getElementById('loginEmailError').textContent = 'Email is required.';
        hasError = true;
    }
    if (!password) {
        document.getElementById('loginPasswordError').textContent = 'Password is required.';
        hasError = true;
    }
    if (hasError) return;

    const submitBtn = document.getElementById('loginSubmitBtn');
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Checking...';

    const result = await Api.loginUser(email, password);

    submitBtn.disabled = false;
    submitBtn.innerHTML = '<i class="fas fa-right-to-bracket"></i> Log In';

    if (!result.success) {
        document.getElementById('loginFormError').textContent = result.message;
        return;
    }

    pendingLoginUserId = result.data.userId;
    pendingLoginRole = result.data.role;

    await goToOtpStep(email, 'email');
});

async function goToOtpStep(destination, channel) {
    stepLogin.style.display = 'none';
    stepOtp.style.display = 'block';
    window.scrollTo({ top: 0, behavior: 'auto' });

    const subtitleMap = {
        email: `We sent a 6-digit code to ${destination}.`,
        whatsapp: `We sent a 6-digit code to ${destination} on WhatsApp.`,
        sms: `We sent a 6-digit code to ${destination} via SMS.`
    };
    document.getElementById('otpSubtitle').textContent = subtitleMap[channel] || subtitleMap.email;

    await requestOtp(destination, channel);
    startResendTimer();
    document.querySelector('.otp-digit[data-index="0"]').focus();
}

async function requestOtp(destination, channel) {
    const result = await Api.sendOtp(destination, channel);
    const banner = document.getElementById('otpDemoText');
    if (result.success && result.data && result.data.simulatedCode) {
        banner.textContent = `Demo mode (no backend connected yet): your code is ${result.data.simulatedCode}`;
    } else {
        banner.textContent = 'Demo mode: OTP delivery is simulated until the backend is connected.';
    }
}

function startResendTimer() {
    let seconds = 30;
    const resendLink = document.getElementById('resendOtpLink');
    const timerEl = document.getElementById('resendTimer');
    resendLink.style.pointerEvents = 'none';
    resendLink.style.opacity = '0.5';

    clearInterval(resendTimerInterval);
    resendTimerInterval = setInterval(() => {
        seconds--;
        timerEl.textContent = seconds > 0 ? ` (${seconds}s)` : '';
        if (seconds <= 0) {
            clearInterval(resendTimerInterval);
            resendLink.style.pointerEvents = 'auto';
            resendLink.style.opacity = '1';
        }
    }, 1000);
}

document.getElementById('resendOtpLink').addEventListener('click', async function (e) {
    e.preventDefault();
    if (this.style.pointerEvents === 'none') return;
    const email = document.getElementById('loginEmail').value.trim();
    await requestOtp(email, 'email');
    startResendTimer();
});

document.getElementById('backToLoginLink').addEventListener('click', function (e) {
    e.preventDefault();
    clearInterval(resendTimerInterval);
    stepOtp.style.display = 'none';
    stepLogin.style.display = 'block';
    window.scrollTo({ top: 0, behavior: 'auto' });
});

document.querySelectorAll('.otp-digit').forEach((input, idx, all) => {
    input.addEventListener('input', () => {
        input.value = input.value.replace(/[^0-9]/g, '');
        if (input.value && idx < all.length - 1) {
            all[idx + 1].focus();
        }
    });
    input.addEventListener('keydown', (e) => {
        if (e.key === 'Backspace' && !input.value && idx > 0) {
            all[idx - 1].focus();
        }
    });
});

otpForm.addEventListener('submit', function (e) {
    e.preventDefault();
    const digits = Array.from(document.querySelectorAll('.otp-digit')).map(i => i.value).join('');
    const errorEl = document.getElementById('otpFormError');
    errorEl.textContent = '';

    if (digits.length < 6) {
        errorEl.textContent = 'Please enter all 6 digits.';
        return;
    }

    const result = Api.verifyOtp(digits);
    if (!result.success) {
        errorEl.textContent = result.message;
        return;
    }

    Api.createSession(pendingLoginUserId);
    Api.setUserProfile(pendingLoginUserId);
    window.location.href = getPostLoginRedirect();
});

// Social login
document.querySelectorAll('.social-btn').forEach(btn => {
    btn.addEventListener('click', async function () {
        const provider = this.dataset.provider;
        this.disabled = true;
        const originalHtml = this.innerHTML;
        this.innerHTML = `<i class="fas fa-spinner fa-spin"></i> Connecting to ${provider}...`;

        const result = await Api.loginWithProvider(provider);

        this.disabled = false;
        this.innerHTML = originalHtml;

        if (result.success) {
            Api.createSession(result.data.userId);
            Api.setUserProfile(result.data.userId);
            window.location.href = getPostLoginRedirect();
        }
    });
});

document.getElementById('forgotPasswordLink').addEventListener('click', function (e) {
    e.preventDefault();
    alert('Password reset will be available once the backend is connected. For now, this is a placeholder.');
});