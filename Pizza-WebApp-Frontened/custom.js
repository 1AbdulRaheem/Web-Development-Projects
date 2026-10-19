// 🌟 Smooth scroll with easing like branded websites
    function smoothScrollTo(target, duration = 400) {
      const start = window.scrollY;
      const end = target.getBoundingClientRect().top + window.scrollY;
      const distance = end - start;
      const startTime = performance.now();

      function easeInOutQuad(t) {
        return t === 1 ? 1 : 1 - Math.pow(2, -10 * t);
      }

      function animate(currentTime) {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const ease = easeInOutQuad(progress);
        window.scrollTo(0, start + distance * ease);
        if (elapsed < duration) requestAnimationFrame(animate);
      }

      requestAnimationFrame(animate);
    }

    // =================== SIMPLE CART SYSTEM ===================
    let cart = [];
    
    // Load cart from storage
    if (localStorage.getItem('pizzaCart')) {
        cart = JSON.parse(localStorage.getItem('pizzaCart'));
    }
    
    // Update cart display
    function updateCartDisplay() {
        // Update cart count in navbar
        document.getElementById('cartCount').textContent = cart.length;
        
        // Update cart count in summary
        document.getElementById('cartCountSummary').textContent = cart.length;
        
        // Update cart total
        let total = 0;
        cart.forEach(item => {
            total += item.price;
        });
        document.getElementById('cartTotal').textContent = total;
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
    
    // Add custom pizza to cart
    function addCustomPizzaToCart(pizza) {
        const item = {
            id: Date.now(),
            pizza: `Custom Pizza (${pizza.size}, ${pizza.crust})`,
            size: pizza.size,
            crust: pizza.crust,
            sauce: pizza.sauce,
            toppings: pizza.toppings,
            price: pizza.total,
            date: new Date().toLocaleString(),
            type: 'custom'
        };
        
        cart.push(item);
        localStorage.setItem('pizzaCart', JSON.stringify(cart));
        
        showNotification('Added to cart: Custom Pizza');
        updateCartDisplay();
    }
    
    // Go to checkout
    function goToCheckout() {
        if (cart.length === 0) {
            // Create a more stylish alert
            const alertBox = document.createElement('div');
            alertBox.style.cssText = `
                position: fixed;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                background: rgba(20,20,20,0.95);
                color: white;
                padding: 30px;
                border-radius: 15px;
                text-align: center;
                z-index: 10000;
                box-shadow: 0 10px 30px rgba(0,0,0,0.5);
                border: 2px solid #ff5a2e;
                min-width: 300px;
                backdrop-filter: blur(10px);
            `;
            alertBox.innerHTML = `
                <i class="fas fa-shopping-cart" style="font-size: 2rem; color: #ff5a2e; margin-bottom: 15px;"></i>
                <h3 style="margin: 0 0 15px; color: #ff5a2e;">Cart Empty!</h3>
                <p style="margin: 0 0 20px;">Add some delicious pizzas to your cart first!</p>
                <button style="
                    background: linear-gradient(180deg, #ff5a2e, #ff7a4c);
                    color: white;
                    border: none;
                    padding: 10px 20px;
                    border-radius: 8px;
                    cursor: pointer;
                    font-weight: bold;
                " onclick="this.parentElement.remove()">OK</button>
            `;
            document.body.appendChild(alertBox);
            
            // Auto-remove after 5 seconds
            setTimeout(() => {
                if (document.body.contains(alertBox)) {
                    alertBox.remove();
                }
            }, 5000);
            return;
        }
        window.location.href = 'checkout.html';
    }

    // =================== EXISTING CUSTOMIZATION CODE ===================
    // Data for crust options based on size
    const crusts = {
      None: [
        ["Regular", 0], 
        ["Thin Crust", 0], 
        ["Cheese Burst", 0], 
        ["Kabab Crust", 0] 
      ],
      Small: [
        ["Regular", 89],
        ["Thin Crust", 119],
        ["Cheese Burst", 149],
        ["Kabab Crust", 179]
      ],
      Medium: [
        ["Regular", 189],
        ["Thin Crust", 239],
        ["Cheese Burst", 279],
        ["Kabab Crust", 309]
      ],
      Large: [
        ["Regular", 289],
        ["Thin Crust", 349],
        ["Cheese Burst", 399],
        ["Kabab Crust", 459]
      ],
      "Extra Large": [
        ["Regular", 359],
        ["Thin Crust", 419],
        ["Cheese Burst", 499],
        ["Kabab Crust", 559]
      ]
    };

    // DOM Elements
    const sizeEl = document.getElementById('size');
    const crustEl = document.getElementById('crust');
    const sauceOptions = document.querySelectorAll('.sauce-option');
    const toppings = document.querySelectorAll('input[type=checkbox]');
    const totalPrice = document.getElementById('totalPrice');
    const confirmBtn = document.getElementById('confirmBtn');
    const pizzaImage = document.getElementById('pizzaImage');
    const historyToggleBtn = document.getElementById('historyToggleBtn');
    const historyWindow = document.getElementById('historyWindow');
    const historyContent = document.getElementById('historyContent');
    const header = document.getElementById('header');
    const saveToProfileBtn = document.getElementById('saveToProfileBtn');
    const profileBtn = document.getElementById('profileBtn');

    // User Profile Data
    let userProfile = {
      username: "Pizza Lover",
      bio: "Pizza enthusiast creating delicious combinations",
      followers: 24,
      following: false,
      pizzas: [],
      savedPizzas: [],
      badges: []
    };

    // Navbar behavior
    let lastScrollY = window.scrollY;
    let hideTimeout;
    let isScrolling;

    function handleScroll() {
      // Clear our timeout throughout the scroll
      window.clearTimeout(isScrolling);
      
      const currentScrollY = window.scrollY;
      
      // Set a timeout to run after scrolling ends
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

    // Initialize crust options based on selected size
    function setCrustOptions(size) {
      crustEl.innerHTML = '';
      (crusts[size] || crusts.Small).forEach(([val, price]) => {
        const opt = document.createElement('option');
        opt.value = val;
        opt.textContent = `${val} - Rs.${price}`;
        opt.dataset.price = price;
        crustEl.appendChild(opt);
      });
      calculatePrice();
    }

    // Calculate total price
    function calculatePrice() {
      let total = 0;

      // Size price
      total += parseInt(sizeEl.selectedOptions[0].dataset.price || 0);

      // Crust price
      total += parseInt(crustEl.selectedOptions[0].dataset.price || 0);

      // Sauces
      sauceOptions.forEach(cb => {
        if (cb.checked) {
          total += parseInt(cb.dataset.price || 0);
        }
      });

      // Toppings
      const toppingCheckboxes = Array.from(document.querySelectorAll('input[type=checkbox]'))
        .filter(cb => !cb.classList.contains('sauce-option'));
        
      toppingCheckboxes.forEach(t => {
        if (t.checked) {
          total += parseInt(t.dataset.price || 0);
        }
      });

      totalPrice.textContent = `Total: Rs.${total}`;
      
      // Update pizza image based on toppings
      const hasExtraCheese = Array.from(toppingCheckboxes).some(t => t.checked && t.value === "Extra Cheese");
      
      if (hasExtraCheese) {
        pizzaImage.style.filter = "brightness(1.2)";
        pizzaImage.style.boxShadow = "0 0 25px gold, 0 15px 35px rgba(0,0,0,0.6)";
      } else {
        pizzaImage.style.filter = "brightness(1)";
        pizzaImage.style.boxShadow = "0 15px 35px rgba(0,0,0,0.6), inset 0 4px 10px rgba(255,255,255,0.05)";
      }

      return {
        size: sizeEl.value,
        crust: crustEl.value,
        sauce: Array.from(sauceOptions).filter(cb => cb.checked).map(cb => cb.value),
        toppings: Array.from(toppingCheckboxes).filter(t => t.checked).map(t => t.value),
        total: total
      };
    }

    // Save pizza configuration to localStorage
    function savePizzaConfig(pizza) {
      localStorage.setItem('lastPizzaConfig', JSON.stringify(pizza));
      
      // Also save to history (keep last 3)
      let pizzaHistory = JSON.parse(localStorage.getItem('pizzaHistory') || '[]');
      pizzaHistory.unshift({
        ...pizza,
        timestamp: new Date().toISOString()
      });
      
      // Keep only last 3 orders
      if (pizzaHistory.length > 3) {
        pizzaHistory = pizzaHistory.slice(0, 3);
      }
      
      localStorage.setItem('pizzaHistory', JSON.stringify(pizzaHistory));
    }

    // Load pizza configuration from localStorage
    function loadPizzaConfig() {
      const savedConfig = localStorage.getItem('lastPizzaConfig');
      if (savedConfig) {
        return JSON.parse(savedConfig);
      }
      return null;
    }

    // Apply a pizza configuration to the form
    function applyPizzaConfig(config) {
      // Set size
      sizeEl.value = config.size;
      setCrustOptions(config.size);
      
      // Wait for crust options to update
      setTimeout(() => {
        // Set crust
        crustEl.value = config.crust;
        
        // Set sauces
        sauceOptions.forEach(cb => {
          cb.checked = config.sauce.includes(cb.value);
        });
        
        // Set toppings
        const toppingCheckboxes = Array.from(document.querySelectorAll('input[type=checkbox]'))
          .filter(cb => !cb.classList.contains('sauce-option'));
          
        toppingCheckboxes.forEach(t => {
          t.checked = config.toppings.includes(t.value);
        });
        
        // Recalculate price
        calculatePrice();
      }, 100);
    }

    // Load user profile from localStorage
    function loadUserProfile() {
      const savedProfile = localStorage.getItem('userProfile');
      if (savedProfile) {
        userProfile = JSON.parse(savedProfile);
      }
    }

    // Save user profile to localStorage
    function saveUserProfile() {
      localStorage.setItem('userProfile', JSON.stringify(userProfile));
    }

    // Save current pizza to profile
    function savePizzaToProfile() {
      const pizzaConfig = calculatePrice();
      
      if (pizzaConfig.size === "None") {
        alert("Please select a pizza size first!");
        return;
      }
      
      const pizzaName = prompt("Give your pizza a name:", `My ${pizzaConfig.size} Pizza`);
      if (!pizzaName) return;
      
      const newPizza = {
        id: 'p' + Date.now(),
        name: pizzaName,
        size: pizzaConfig.size,
        crust: pizzaConfig.crust,
        sauce: pizzaConfig.sauce,
        toppings: pizzaConfig.toppings,
        description: `Custom ${pizzaConfig.size} pizza with ${pizzaConfig.crust} crust`,
        emoji: "🍕",
        likes: 0,
        views: 0,
        comments: [],
        savedBy: [],
        createdAt: new Date().toISOString(),
        price: pizzaConfig.total
      };
      
      userProfile.pizzas.unshift(newPizza);
      saveUserProfile();
      
      alert(`"${pizzaName}" has been saved to your profile!`);
    }

    // Function to populate history window
    function populateHistoryWindow() {
      const lastConfig = loadPizzaConfig();
      historyContent.innerHTML = '';

      if (lastConfig) {
        const historyCard = document.createElement('div');
        historyCard.className = 'suggestion-card';
        historyCard.innerHTML = `
          <h3><i class="fas fa-history"></i> Your Last Order</h3>
          <p><strong>Size:</strong> ${lastConfig.size}</p>
          <p><strong>Crust:</strong> ${lastConfig.crust}</p>
          <p><strong>Toppings:</strong> ${lastConfig.toppings.join(', ') || 'None'}</p>
          <p><strong>Sauces:</strong> ${lastConfig.sauce.join(', ') || 'None'}</p>
          <div class="price">Rs.${lastConfig.total}</div> 
        `;
        
        const button = document.createElement('button');
        button.textContent = "Order Again";
        button.addEventListener("click", () => {
          applyPizzaConfig(lastConfig);
          // Close history window after selection
          toggleHistoryWindow();
          setTimeout(() => {
            const section = document.querySelector(".preview");
            if (section) {
              smoothScrollTo(section, 400); 
            }
          }, 200); 
        });
        historyCard.appendChild(button);
        historyContent.appendChild(historyCard);
      } else {
        historyContent.innerHTML = '<p>No order history yet. Place your first order!</p>';
      }
    }

    // Toggle history window visibility
    function toggleHistoryWindow() {
      historyWindow.classList.toggle('active');
      
      if (historyWindow.classList.contains('active')) {
        historyToggleBtn.innerHTML = '<i class="fas fa-times"></i> Close History';
        populateHistoryWindow();
        // Smooth scroll to history window
        setTimeout(() => {
          smoothScrollTo(historyWindow, 400);
        }, 100);
      } else {
        historyToggleBtn.innerHTML = '<i class="fas fa-history"></i> Show Order History';
      }
    }

    // SIDEBAR FUNCTIONALITY
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

    // Event Listeners
    document.querySelector('.customizer').addEventListener('change', (e) => {
      const sizeEl = document.getElementById('size');

      // If size dropdown changed
      if (e.target === sizeEl) {
        const selectedSize = sizeEl.value;
        setCrustOptions(selectedSize);

        // Define multipliers
        const sizeMultiplier = {
          Small: 1,
          Medium: 1.2,
          Large: 1.4,
          "Extra Large": 1.6
        };
        const multiplier = sizeMultiplier[selectedSize] || 1;

        // Update sauce & topping prices dynamically
        document.querySelectorAll('.sauce-option, .toppings-list input[type="checkbox"]').forEach(cb => {
          // Ensure every checkbox has a base price stored
          let basePrice = parseInt(cb.getAttribute('data-base'));
          if (isNaN(basePrice)) {
            basePrice = parseInt(cb.dataset.price) || 0;
            cb.setAttribute('data-base', basePrice);
          }

          // Recalculate new price
          const newPrice = Math.round(basePrice * multiplier);
          cb.dataset.price = newPrice;

          // Update the label text (without recreating input)
          const label = cb.parentElement;
          const newText = `${cb.value} - Rs.${newPrice}`;
          label.childNodes.forEach(node => {
            if (node.nodeType === Node.TEXT_NODE) label.removeChild(node);
          });
          label.appendChild(document.createTextNode(' ' + newText));
        });

        // Recalculate after size change
        calculatePrice();
      }

      // Handle checkbox (sauce/topping) and crust changes
      if (e.target.matches('input[type="checkbox"], #crust')) {
        calculatePrice();
      }
    });

    // Save to Profile button event listener
    saveToProfileBtn.addEventListener('click', savePizzaToProfile);

    // History toggle button
    historyToggleBtn.addEventListener('click', toggleHistoryWindow);

    // Confirm button - UPDATED WITH CART FUNCTIONALITY
    confirmBtn.addEventListener('click', () => {
      const pizza = calculatePrice();
      
      if (pizza.size === "None") {
        alert("Please select a pizza size first!");
        return;
      }
      
      // Save configuration
      savePizzaConfig(pizza);
      
      // Add to cart
      addCustomPizzaToCart(pizza);

      alert(
        `Your Custom Pizza:\n\nSize: ${pizza.size}\nCrust: ${pizza.crust}\nSauce: ${pizza.sauce.join(', ')}\nToppings: ${pizza.toppings.join(', ')}\nTotal: Rs.${pizza.total}\n\nAdded to cart! Proceed to checkout to complete your order.`
      );

      // Update history window if it's open
      if (historyWindow.classList.contains('active')) {
        populateHistoryWindow();
      }
    });

    // Initialize once on page load
    window.addEventListener('DOMContentLoaded', () => {
      const sizeEl = document.getElementById('size');

      // Ensure all checkboxes have a base price
      document.querySelectorAll('.sauce-option, .toppings-list input[type="checkbox"]').forEach(cb => {
        const current = parseInt(cb.dataset.price);
        if (!cb.hasAttribute('data-base')) cb.setAttribute('data-base', current || 0);
      });

      setCrustOptions(sizeEl.value);
      calculatePrice();

      // Load user profile
      loadUserProfile();

      // Apply saved config if present
      const urlParams = new URLSearchParams(window.location.search);
      if (urlParams.has('applyConfig')) {
        const savedConfig = loadPizzaConfig();
        if (savedConfig) applyPizzaConfig(savedConfig);
      }

      // Initialize navbar behavior
      initNavbar();
      
      // Update cart display
      updateCartDisplay();
    });

    // Make functions available globally for onclick handlers
    window.applyPizzaConfig = applyPizzaConfig;
    window.smoothScrollTo = smoothScrollTo;
    window.goToCheckout = goToCheckout;