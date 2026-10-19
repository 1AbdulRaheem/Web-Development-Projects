// EXACT SAME JAVASCRIPT AS HOME.HTML FOR NAVBAR
let cart = [];

// Load cart from storage
if (localStorage.getItem('pizzaCart')) {
    cart = JSON.parse(localStorage.getItem('pizzaCart'));
}

// Update cart display
function updateCartDisplay() {
    // Update navbar cart count
    document.getElementById('cartCount').textContent = cart.length;
    
    // Update cart summary display
    document.getElementById('cartCountDisplay').textContent = cart.length;
    
    // Calculate total
    let total = 0;
    cart.forEach(item => {
        total += item.price;
    });
    document.getElementById('cartTotalDisplay').textContent = total.toFixed(2);
}

// Navbar behavior
const header = document.getElementById('header');
let lastScrollY = window.scrollY;
let hideTimeout;
let isScrolling;

function handleScroll() {
    window.clearTimeout(isScrolling);
    
    const currentScrollY = window.scrollY;
    
    isScrolling = setTimeout(function() {
        // At the top of page - show navbar
        if (currentScrollY <= 50) {
            header.classList.remove('hidden');
        } 
        // Scrolled down - hide navbar after 1 second
        else if (currentScrollY > lastScrollY && currentScrollY > 100) {
            hideTimeout = setTimeout(() => {
                header.classList.add('hidden');
            }, 1000);
        }
        // Scrolling up but not at top - keep navbar visible
        else if (currentScrollY < lastScrollY && currentScrollY > 100) {
            header.classList.remove('hidden');
            // Clear any pending hide timeout when scrolling up
            if (hideTimeout) {
                clearTimeout(hideTimeout);
            }
        }
        
        lastScrollY = currentScrollY;
    }, 66);
}

// Initialize navbar behavior
function initNavbar() {
    // Hide navbar after 1 second on page load
    hideTimeout = setTimeout(() => {
        if (window.scrollY > 100) {
            header.classList.add('hidden');
        }
    }, 1000);
    
    // Add scroll event listener
    window.addEventListener('scroll', handleScroll, { passive: true });
}

// EXACT SAME SIDEBAR FUNCTIONALITY AS HOME.HTML
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

// CART FUNCTIONALITY
// Show notification
function showNotification(message) {
    const notification = document.getElementById('cartNotification');
    notification.textContent = message;
    notification.style.display = 'block';
    
    setTimeout(() => {
        notification.style.display = 'none';
    }, 2000);
}

// Add to cart function (now shows Rs. in notification)
function addToCart(pizzaName, size, price) {
    const item = {
        id: Date.now(),
        pizza: pizzaName,
        size: size,
        price: parseFloat(price),
        date: new Date().toLocaleString()
    };
    
    cart.push(item);
    localStorage.setItem('pizzaCart', JSON.stringify(cart));
    
    showNotification('Added to cart: ' + pizzaName + ' (' + size + ') - Rs.' + price);
    updateCartDisplay();
}

// Initialize once on page load
window.addEventListener('DOMContentLoaded', () => {
    // Update cart display
    updateCartDisplay();
    
    // Initialize navbar behavior
    initNavbar();
    
    // Add click event to all order buttons
    document.querySelectorAll('.order-btn').forEach(button => {
        button.addEventListener('click', function() {
            const pizzaName = this.getAttribute('data-pizza');
            const size = this.getAttribute('data-size');
            const price = this.getAttribute('data-price');
            
            addToCart(pizzaName, size, price);
        });
    });
    
    // Add scroll animations for pizza cards
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);

    // Observe pizza cards
    document.querySelectorAll('.pizza-card').forEach(card => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(20px)';
        card.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
        observer.observe(card);
    });
});

// ========== CATEGORY & SEARCH FILTERS (integrated) ==========
(function initFilters() {
    function setupFilters() {
        const pizzaCards = document.querySelectorAll('.pizza-card');
        const searchInput = document.getElementById('searchInput');
        const categoryBtns = document.querySelectorAll('.filter-btn');
        const noResultsDiv = document.getElementById('noResultsMsg');
        if (!pizzaCards.length || !searchInput || !categoryBtns.length) return;

        let activeCategory = 'all';

        function getSearchTerm() {
            return searchInput.value.trim().toLowerCase();
        }

        function filterPizzas() {
            const term = getSearchTerm();
            let anyVisible = false;

            pizzaCards.forEach(card => {
                const cardCat = card.getAttribute('data-category') || '';
                const nameEl = card.querySelector('.pizza-title');
                const pizzaName = nameEl ? nameEl.textContent.trim().toLowerCase() : '';
                const descEl = card.querySelector('.flip-card-back p');
                const description = descEl ? descEl.textContent.trim().toLowerCase() : '';
                const textMatch = pizzaName + ' ' + description;
                
                const catMatch = (activeCategory === 'all') || (cardCat === activeCategory);
                const searchMatch = (term === '') || textMatch.includes(term);

                if (catMatch && searchMatch) {
                    card.classList.remove('filter-hidden');
                    anyVisible = true;
                } else {
                    card.classList.add('filter-hidden');
                }
            });

            if (noResultsDiv) {
                noResultsDiv.style.display = anyVisible ? 'none' : 'block';
            }
        }

        // Category button click
        categoryBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const cat = btn.getAttribute('data-category');
                if (cat) {
                    activeCategory = cat;
                    categoryBtns.forEach(b => b.classList.remove('active'));
                    btn.classList.add('active');
                    filterPizzas();
                }
            });
        });

        // Search input
        searchInput.addEventListener('input', () => filterPizzas());

        // Initial filter
        filterPizzas();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', setupFilters);
    } else {
        setupFilters();
    }
})();