/* ==========================================================================
   api.js — CENTRAL "BACKEND" LAYER (SIMULATED)
   ========================================================================== */
const Api = (function () {

    // ─── Internal storage helpers ──────────────────────
    const USERS_KEY = 'pizza_users_db';
    const SESSION_KEY = 'pizza_session';
    const PENDING_OTP_KEY = 'pizza_pending_otp';

    function _getUsers() {
        return JSON.parse(localStorage.getItem(USERS_KEY) || '[]');
    }
    function _saveUsers(users) {
        localStorage.setItem(USERS_KEY, JSON.stringify(users));
    }
    function _findUserByEmail(email) {
        return _getUsers().find(u => u.email.toLowerCase() === String(email).toLowerCase());
    }
    function _generateOtp() {
        return String(Math.floor(100000 + Math.random() * 900000));
    }
    function _delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    // ─── Registration ──────────────────────────────────
    async function registerUser(name, email, password, phone) {
        await _delay(400);

        if (_findUserByEmail(email)) {
            return { success: false, message: 'This email is already registered.' };
        }

        const newUser = {
            id: 'u_' + Date.now(),
            name,
            email,
            phone: phone || null,
            password, // In production, hash with bcrypt
            role: 'nonvip',
            level: 1,
            xp: 0,
            emailVerified: false,
            phoneVerified: false
        };

        const users = _getUsers();
        users.push(newUser);
        _saveUsers(users);

        return { success: true, message: 'Account created.', data: { userId: newUser.id } };
    }

    // ─── Login ──────────────────────────────────────────
    async function loginUser(email, password) {
        await _delay(400);

        const user = _findUserByEmail(email);
        if (!user || user.password !== password) {
            return { success: false, message: 'Incorrect email or password.' };
        }

        return { success: true, message: 'Credentials valid.', data: { userId: user.id, role: user.role } };
    }

    // ─── Session management ────────────────────────────
    function createSession(userId) {
        const users = _getUsers();
        const user = users.find(u => u.id === userId);
        if (!user) return;

        localStorage.setItem(SESSION_KEY, JSON.stringify({
            userId: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            loggedInAt: Date.now()
        }));
    }

    function getSession() {
        const raw = localStorage.getItem(SESSION_KEY);
        return raw ? JSON.parse(raw) : null;
    }

    function isLoggedIn() {
        return !!getSession();
    }

    function logout() {
        localStorage.removeItem(SESSION_KEY);
    }

    // ─── Set user profile (preserves XP/missions) ──
    function setUserProfile(userId) {
        const users = _getUsers();
        const user = users.find(u => u.id === userId);
        if (!user) {
            console.warn('setUserProfile: user not found for ID', userId);
            return;
        }

        let existing = null;
        try {
            existing = JSON.parse(localStorage.getItem('pizzaUser'));
        } catch (_) {}

        const profile = {
            name: user.name,
            email: user.email,
            membership: user.role === 'vip' ? 'vip' : 'nonvip',
            xp: existing && typeof existing.xp === 'number' ? existing.xp : 0,
            level: existing && typeof existing.level === 'number' ? existing.level : 1,
            orderCount: existing && typeof existing.orderCount === 'number' ? existing.orderCount : 0,
            missions: existing && existing.missions ? existing.missions : {
                order3: { claimed: false, lastClaimed: null, progress: 0 },
                risingStar: { target: 3, claimed: false }
            }
        };
        localStorage.setItem('pizzaUser', JSON.stringify(profile));
        console.log('✅ setUserProfile: pizzaUser updated', profile);
    }

    // ─── OTP ─────────────────────────────────────────────
    async function sendOtp(destination, channel) {
        await _delay(500);
        const code = _generateOtp();
        localStorage.setItem(PENDING_OTP_KEY, JSON.stringify({
            destination,
            channel,
            code,
            expiresAt: Date.now() + 5 * 60 * 1000
        }));
        return { success: true, message: `Code sent via ${channel}`, data: { simulatedCode: code } };
    }

    function verifyOtp(code) {
        const raw = localStorage.getItem(PENDING_OTP_KEY);
        if (!raw) return { success: false, message: 'No verification code was requested.' };

        const pending = JSON.parse(raw);
        if (Date.now() > pending.expiresAt) {
            return { success: false, message: 'Code expired. Please request a new one.' };
        }
        if (String(code) !== String(pending.code)) {
            return { success: false, message: 'Incorrect code.' };
        }

        localStorage.removeItem(PENDING_OTP_KEY);
        return { success: true, message: 'Verified.' };
    }

    // ─── Social Login ───────────────────────────────────
    async function loginWithProvider(provider) {
        await _delay(500);
        const fakeEmail = `demo_${provider}_user@example.com`;
        let user = _findUserByEmail(fakeEmail);
        if (!user) {
            const users = _getUsers();
            user = {
                id: 'u_' + Date.now(),
                name: `${provider.charAt(0).toUpperCase() + provider.slice(1)} Demo User`,
                email: fakeEmail,
                phone: null,
                password: null,
                role: 'nonvip',
                level: 1,
                xp: 0,
                emailVerified: true,
                phoneVerified: false,
                provider
            };
            users.push(user);
            _saveUsers(users);
        }
        return { success: true, message: `Signed in with ${provider} (simulated).`, data: { userId: user.id, role: user.role } };
    }

    // ─── Public API ──────────────────────────────────────
    return {
        registerUser,
        loginUser,
        createSession,
        getSession,
        isLoggedIn,
        logout,
        sendOtp,
        verifyOtp,
        loginWithProvider,
        setUserProfile
    };
})();