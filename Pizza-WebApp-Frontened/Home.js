let cart = [];
        
        // Load cart from storage
        if (localStorage.getItem('pizzaCart')) {
            cart = JSON.parse(localStorage.getItem('pizzaCart'));
        }
        
        // Update cart display for BOTH navbar and sidebar
        function updateCartDisplay() {
            const cartCount = cart.length;
            
            // Update navbar cart count
            document.getElementById('cartCount').textContent = cartCount;
            
            // Update sidebar cart count
            const sidebarCartCount = document.getElementById('sidebarCartCount');
            if (sidebarCartCount) {
                sidebarCartCount.textContent = cartCount;
            }
        }
        
        // EXACT SAME SIDEBAR FUNCTIONALITY AS CUSTOM.HTML
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
        
        // Handle window resize for responsive cart button
        function handleResponsiveCart() {
            const isMobileOrTablet = window.innerWidth <= 900;
            const cartBtn = document.querySelector('.navbar-right .cart-btn');
            const sidebarCart = document.querySelector('.sidebar-cart-btn');
            
            if (cartBtn && sidebarCart) {
                if (isMobileOrTablet) {
                    // On mobile/tablet, hide navbar cart, show sidebar cart
                    cartBtn.style.display = 'none';
                    sidebarCart.style.display = 'block';
                } else {
                    // On desktop, show navbar cart, hide sidebar cart
                    cartBtn.style.display = 'flex';
                    sidebarCart.style.display = 'none';
                }
            }
        }
        
        // Handle window resize
        window.addEventListener('resize', function() {
            // Auto-close sidebar on desktop if window gets larger
            if (window.innerWidth > 900) {
                sidebar.classList.remove('active');
                overlay.classList.remove('active');
                document.body.style.overflow = '';
            }
            
            // Handle responsive cart button
            handleResponsiveCart();
            
            // Prevent zoom on mobile/tablet
            if (window.innerWidth <= 900) {
                document.querySelector('meta[name="viewport"]').setAttribute('content', 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, shrink-to-fit=no');
            } else {
                document.querySelector('meta[name="viewport"]').setAttribute('content', 'width=device-width, initial-scale=1.0');
            }
        });

        // Initialize once on page load
        window.addEventListener('DOMContentLoaded', () => {
            // Update cart display for both navbar and sidebar
            updateCartDisplay();
            
            // Handle responsive cart button on load
            handleResponsiveCart();
            
            // Set proper viewport for device
            if (window.innerWidth <= 900) {
                document.querySelector('meta[name="viewport"]').setAttribute('content', 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, shrink-to-fit=no');
            }
            
            // Add scroll animations for feature cards and item cards
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

            // Observe feature cards and item cards
            document.querySelectorAll('.feature-card, .item-card').forEach(card => {
                card.style.opacity = '0';
                card.style.transform = 'translateY(20px)';
                card.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
                observer.observe(card);
            });
            
            // REMOVED TEST CART ITEMS - Cart will now work as originally intended
            // Cart will be empty by default and only show items added from other pages
        });
        
        // Function to add item to cart (for testing purposes only)
        // You can call this function from browser console to test cart functionality
        function addTestItemToCart() {
            cart.push({id: Date.now(), name: "Test Pizza", price: 9.99, quantity: 1});
            localStorage.setItem('pizzaCart', JSON.stringify(cart));
            updateCartDisplay();
            console.log("Test item added to cart. Total items: " + cart.length);
        }
        
        // Function to clear cart (for testing purposes only)
        function clearCart() {
            cart = [];
            localStorage.setItem('pizzaCart', JSON.stringify(cart));
            updateCartDisplay();
            console.log("Cart cleared");
        }