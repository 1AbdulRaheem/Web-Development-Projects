// =================== SIMPLE CART SYSTEM ===================
let cart = [];

// Load cart from storage
if (localStorage.getItem('pizzaCart')) {
    cart = JSON.parse(localStorage.getItem('pizzaCart'));
}

// Update cart display
function updateCartDisplay() {
    document.getElementById('cartCount').textContent = cart.length;
}

// Show notification
function showNotification(message) {
    const notification = document.getElementById('cartNotification');
    notification.textContent = message;
    notification.style.display = 'block';
    notification.style.animation = 'slideIn 0.3s';
    
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s';
        setTimeout(() => {
            notification.style.display = 'none';
        }, 300);
    }, 2000);
}

// Go to checkout
function goToCheckout() {
    if (cart.length === 0) {
        alert('Your cart is empty! Add some pizzas first.');
        return;
    }
    window.location.href = 'checkout.html';
}

// =================== SIDEBAR MENU TOGGLE ===================
const menuBtn = document.getElementById('menuBtn');
const closeBtn = document.getElementById('closeBtn');
const sidebar = document.getElementById('sidebar');
const overlay = document.getElementById('overlay');

// Open sidebar
menuBtn.addEventListener('click', function() {
    sidebar.classList.add('active');
    overlay.classList.add('active');
    document.body.style.overflow = 'hidden';
});

// Close sidebar
closeBtn.addEventListener('click', function() {
    sidebar.classList.remove('active');
    overlay.classList.remove('active');
    document.body.style.overflow = '';
});

// Close sidebar when clicking overlay
overlay.addEventListener('click', function() {
    sidebar.classList.remove('active');
    overlay.classList.remove('active');
    document.body.style.overflow = '';
});

// Close sidebar when clicking a link (on mobile)
const sidebarLinks = document.querySelectorAll('.sidebar-nav a');
sidebarLinks.forEach(link => {
    link.addEventListener('click', function() {
        if (window.innerWidth <= 900) {
            sidebar.classList.remove('active');
            overlay.classList.remove('active');
            document.body.style.overflow = '';
        }
    });
});

// Update active link in sidebar
const currentPage = window.location.pathname.split('/').pop();
sidebarLinks.forEach(link => {
    if (link.getAttribute('href') === currentPage) {
        link.classList.add('active');
    } else {
        link.classList.remove('active');
    }
});

// Close sidebar on escape key
document.addEventListener('keydown', function(event) {
    if (event.key === 'Escape') {
        sidebar.classList.remove('active');
        overlay.classList.remove('active');
        document.body.style.overflow = '';
    }
});

// Handle window resize
window.addEventListener('resize', function() {
    // Auto-close sidebar on desktop if window gets larger
    if (window.innerWidth > 900) {
        sidebar.classList.remove('active');
        overlay.classList.remove('active');
        document.body.style.overflow = '';
    }
});

// Initialize on page load
window.addEventListener('DOMContentLoaded', () => {
    // Always show navbar
    const header = document.getElementById('header');
    if (header) header.classList.remove('hidden');
    
    // Update cart display
    updateCartDisplay();
});

// Make functions available globally
window.goToCheckout = goToCheckout;