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
        window.location.href = 'dashboard.html';
    }
});

// =================== SIGNUP + OTP FLOW ===================
const stepSignup = document.getElementById('stepSignup');
const stepOtp = document.getElementById('stepOtp');
const signupForm = document.getElementById('signupForm');
const otpForm = document.getElementById('otpForm');

let pendingUserId = null;
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

function clearFieldErrors() {
    document.querySelectorAll('.field-error').forEach(el => el.textContent = '');
}

function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

signupForm.addEventListener('submit', async function (e) {
    e.preventDefault();
    clearFieldErrors();

    const name = document.getElementById('signupName').value.trim();
    const email = document.getElementById('signupEmail').value.trim();
    const phone = document.getElementById('signupPhone').value.trim();
    const password = document.getElementById('signupPassword').value;
    const confirmPassword = document.getElementById('signupConfirmPassword').value;

    let hasError = false;
    if (!name) {
        document.getElementById('signupNameError').textContent = 'Name is required.';
        hasError = true;
    }
    if (!email || !isValidEmail(email)) {
        document.getElementById('signupEmailError').textContent = 'Enter a valid email address.';
        hasError = true;
    }
    if (!password || password.length < 6) {
        document.getElementById('signupPasswordError').textContent = 'Password must be at least 6 characters.';
        hasError = true;
    }
    if (confirmPassword !== password) {
        document.getElementById('signupConfirmPasswordError').textContent = 'Passwords do not match.';
        hasError = true;
    }
    if (hasError) return;

    const submitBtn = document.getElementById('signupSubmitBtn');
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Creating account...';

    const result = await Api.registerUser(name, email, password, phone || null);

    submitBtn.disabled = false;
    submitBtn.innerHTML = '<i class="fas fa-user-plus"></i> Create Account';

    if (!result.success) {
        document.getElementById('signupFormError').textContent = result.message;
        return;
    }

    pendingUserId = result.data.userId;

    if (phone) {
        await goToOtpStep(phone, 'whatsapp', true);
    } else {
        await goToOtpStep(email, 'email', false);
    }
});

async function goToOtpStep(destination, channel, hasPhoneFallback) {
    stepSignup.style.display = 'none';
    stepOtp.style.display = 'block';
    window.scrollTo({ top: 0, behavior: 'auto' });

    const subtitleMap = {
        email: `We sent a 6-digit code to ${destination}.`,
        whatsapp: `We sent a 6-digit code to ${destination} on WhatsApp.`,
        sms: `We sent a 6-digit code to ${destination} via SMS.`
    };
    document.getElementById('otpSubtitle').textContent = subtitleMap[channel];

    await requestOtp(destination, channel, hasPhoneFallback);
    startResendTimer(destination, channel, hasPhoneFallback);
    document.querySelector('.otp-digit[data-index="0"]').focus();
}

async function requestOtp(destination, channel, hasPhoneFallback) {
    const result = await Api.sendOtp(destination, channel);
    const banner = document.getElementById('otpDemoText');
    if (result.success && result.data && result.data.simulatedCode) {
        banner.textContent = `Demo mode (no backend connected yet): your code is ${result.data.simulatedCode}`;
    } else {
        banner.textContent = 'Demo mode: OTP delivery is simulated until the backend is connected.';
    }
}

function startResendTimer(destination, channel, hasPhoneFallback) {
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

    resendLink.onclick = async function (e) {
        e.preventDefault();
        if (this.style.pointerEvents === 'none') return;
        await requestOtp(destination, channel, hasPhoneFallback);
        startResendTimer(destination, channel, hasPhoneFallback);
    };
}

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

    Api.createSession(pendingUserId);
    Api.setUserProfile(pendingUserId);
    window.location.href = 'dashboard.html';
});

// Social signup
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
            window.location.href = 'dashboard.html';
        }
    });
});