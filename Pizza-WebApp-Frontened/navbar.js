/* ==========================================================
   navbar.js – Universal Navbar Authentication Toggle
   ========================================================== */
(function() {
    function updateNavbar() {
        const isLoggedIn = typeof Api !== 'undefined' && Api.isLoggedIn();
        const isMobile = window.innerWidth <= 900;

        // ─── Navbar groups ──────────────────────────────
        const loggedOutGroup = document.getElementById('authGroupLoggedOut');
        const loggedInGroup = document.getElementById('authGroupLoggedIn');

        if (loggedOutGroup) {
            loggedOutGroup.style.display = (isLoggedIn || isMobile) ? 'none' : 'flex';
        }
        if (loggedInGroup) {
            loggedInGroup.style.display = (isLoggedIn && !isMobile) ? 'flex' : 'none';
        }

        // ─── Sidebar auth links – ONLY ON MOBILE ──────────
        const sidebarNav = document.querySelector('.sidebar-nav');
        if (!sidebarNav) return;

        // Remove old auth links if they exist (regardless of screen size)
        const oldLoggedOut = document.getElementById('sidebarAuthLoggedOut');
        const oldLoggedIn = document.getElementById('sidebarAuthLoggedIn');
        if (oldLoggedOut) oldLoggedOut.remove();
        if (oldLoggedIn) oldLoggedIn.remove();

        // ─── Only add auth links on mobile ──────────────
        if (isMobile) {
            const cartBtn = document.querySelector('.sidebar-cart-btn');

            if (isLoggedIn) {
                // ─── LOGGED IN: Show Dashboard & Logout ───
                const li1 = document.createElement('li');
                li1.id = 'sidebarAuthLoggedIn';
                li1.style.cssText = 'border-top: 1px solid rgba(255,255,255,0.1); margin-top: 10px; padding-top: 10px;';
                li1.innerHTML = '<a href="dashboard.html"><i class="fas fa-tachometer-alt"></i> Dashboard</a>';
                
                const li2 = document.createElement('li');
                li2.id = 'sidebarAuthLoggedIn';
                li2.innerHTML = '<a href="#" id="logoutSideBtn"><i class="fas fa-sign-out-alt"></i> Logout</a>';
                
                if (cartBtn) {
                    sidebarNav.insertBefore(li2, cartBtn);
                    sidebarNav.insertBefore(li1, li2);
                } else {
                    sidebarNav.appendChild(li1);
                    sidebarNav.appendChild(li2);
                }
                
                // Attach logout event
                const logoutBtn = document.getElementById('logoutSideBtn');
                if (logoutBtn) logoutBtn.addEventListener('click', handleLogout);
                
            } else {
                // ─── LOGGED OUT: Show Login & Sign Up ───
                const li1 = document.createElement('li');
                li1.id = 'sidebarAuthLoggedOut';
                li1.style.cssText = 'border-top: 1px solid rgba(255,255,255,0.1); margin-top: 10px; padding-top: 10px;';
                li1.innerHTML = '<a href="login.html"><i class="fas fa-right-to-bracket"></i> Login</a>';
                
                const li2 = document.createElement('li');
                li2.id = 'sidebarAuthLoggedOut';
                li2.innerHTML = '<a href="sign-up.html"><i class="fas fa-user-plus"></i> Sign Up</a>';
                
                if (cartBtn) {
                    sidebarNav.insertBefore(li2, cartBtn);
                    sidebarNav.insertBefore(li1, li2);
                } else {
                    sidebarNav.appendChild(li1);
                    sidebarNav.appendChild(li2);
                }
            }
        }
    }

    function handleLogout(e) {
        e.preventDefault();
        if (typeof Api !== 'undefined') {
            Api.logout();
            localStorage.removeItem('pizzaUser');
            window.location.href = 'Home.html';
        }
    }

    function init() {
        updateNavbar();

        // Navbar logout
        const navLogoutBtn = document.getElementById('logoutNavBtn');
        if (navLogoutBtn) navLogoutBtn.addEventListener('click', handleLogout);

        // Dashboard logout (if on dashboard page)
        const dashLogoutBtn = document.getElementById('dashboardLogoutBtn');
        if (dashLogoutBtn) dashLogoutBtn.addEventListener('click', handleLogout);

        // Re-run on resize
        window.addEventListener('resize', updateNavbar);
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    window.addEventListener('pageshow', function(event) {
        if (event.persisted) updateNavbar();
    });

    window.updateNavbar = updateNavbar;
})();