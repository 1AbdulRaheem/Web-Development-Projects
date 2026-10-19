// =================== SIMPLE CART SYSTEM ===================
    let cart = [];
    
    // Load cart from storage
    if (localStorage.getItem('pizzaCart')) {
        cart = JSON.parse(localStorage.getItem('pizzaCart'));
    }
    
    // Add profile pizza to cart
    function addProfilePizzaToCart(pizza) {
        const item = {
            id: Date.now(),
            pizza: pizza.name,
            size: pizza.size || 'Medium',
            crust: pizza.crust || 'Regular',
            toppings: pizza.toppings || [],
            sauce: pizza.sauce || ['Tomato'],
            // Handle regional pizzas
            city: pizza.city || null,
            flavor: pizza.flavor || null,
            price: pizza.price || 0,
            type: pizza.type || 'profile',
            description: pizza.description || 'Custom pizza from profile',
            date: new Date().toLocaleString()
        };
        
        cart.push(item);
        localStorage.setItem('pizzaCart', JSON.stringify(cart));
        
        // Show simple alert instead of notification
        alert(`"${pizza.name}" added to cart!`);
    }
    
    // Order profile pizza (add to cart and redirect to checkout)
    function orderProfilePizza(pizzaId) {
        const pizza = userProfile.pizzas.find(p => p.id === pizzaId);
        if (!pizza) return;
        
        addProfilePizzaToCart(pizza);
        
        // Ask if user wants to go to checkout
        if (confirm(`"${pizza.name}" added to cart! Go to checkout now?`)) {
            window.location.href = 'checkout.html';
        }
    }

    // =================== EXISTING PROFILE CODE ===================
    // User Profile Data
    let userProfile = {
      username: "Pizza Lover",
      bio: "Pizza enthusiast creating delicious combinations",
      followers: 24,
      pizzas: [
        {
          id: "1",
          name: "Spicy Pepperoni",
          size: "Large",
          crust: "Thin",
          toppings: ["Pepperoni", "Jalapenos", "Mushrooms"],
          sauce: ["Tomato"],
          description: "A spicy twist on the classic pepperoni pizza",
          emoji: "🍕",
          likes: 12,
          views: 45,
          price: 850
        },
        {
          id: "2",
          name: "Veggie Delight",
          size: "Medium",
          crust: "Thick",
          toppings: ["Bell Peppers", "Olives", "Onions", "Tomatoes"],
          sauce: ["Tomato", "Pesto"],
          description: "Fresh and healthy vegetable pizza",
          emoji: "🥦",
          likes: 8,
          views: 32,
          price: 750
        },
        {
          id: "3",
          name: "BBQ Chicken",
          size: "Large",
          crust: "Regular",
          toppings: ["Chicken", "Red Onions", "Cilantro"],
          sauce: ["BBQ"],
          description: "Smoky BBQ flavor with tender chicken pieces",
          emoji: "🍗",
          likes: 15,
          views: 52,
          price: 900
        }
      ]
    };

    // Check if user is the owner or a viewer
    let isOwner = true;
    let isSelectionMode = false;
    let selectedPizzas = [];

    // Get DOM elements
    const userPizzasGrid = document.getElementById('userPizzasGrid');
    const modalsRoot = document.getElementById('modalsRoot');
    const viewOnlyIndicator = document.getElementById('viewOnlyIndicator');
    const selectionModeUI = document.getElementById('selectionModeUI');
    const shareMultipleBtnContainer = document.getElementById('shareMultipleBtnContainer');
    const shareMultipleBtn = document.getElementById('shareMultipleBtn');
    const shareSelectedBtn = document.getElementById('shareSelectedBtn');
    const cancelSelectionBtn = document.getElementById('cancelSelectionBtn');

    // Check URL parameters to determine if this is a shared view
    function checkViewMode() {
      const urlParams = new URLSearchParams(window.location.search);
      const shared = urlParams.get('shared');
      
      if (shared === 'true') {
        isOwner = false;
        viewOnlyIndicator.style.display = 'block';
        shareMultipleBtnContainer.style.display = 'none';
        
        // Hide the navbar in view mode
        const header = document.querySelector('.header');
        if (header) {
          header.style.display = 'none';
        }
        
        // Try to load shared pizza data from URL
        const pizzasData = urlParams.get('pizzas');
        if (pizzasData) {
          try {
            const sharedPizzas = JSON.parse(decodeURIComponent(pizzasData));
            userProfile.pizzas = sharedPizzas;
          } catch (e) {
            console.error('Error parsing shared pizza data:', e);
          }
        }
      } else {
        // Load from localStorage for owner
        const saved = localStorage.getItem('userProfile');
        if (saved) {
          userProfile = JSON.parse(saved);
        }
      }
    }

    // Toggle selection mode
    function toggleSelectionMode() {
      isSelectionMode = !isSelectionMode;
      
      if (isSelectionMode) {
        selectionModeUI.style.display = 'block';
        userPizzasGrid.classList.add('selection-mode');
        shareMultipleBtnContainer.style.display = 'none';
        selectedPizzas = [];
      } else {
        selectionModeUI.style.display = 'none';
        userPizzasGrid.classList.remove('selection-mode');
        shareMultipleBtnContainer.style.display = 'block';
        
        // Clear selections
        const cards = document.querySelectorAll('.pizza-card');
        cards.forEach(card => {
          card.classList.remove('selected');
        });
      }
    }

    // Toggle pizza selection
    function togglePizzaSelection(pizzaId) {
      if (!isSelectionMode) return;
      
      const index = selectedPizzas.indexOf(pizzaId);
      const card = document.querySelector(`.pizza-card[data-pizza-id="${pizzaId}"]`);
      
      if (index === -1) {
        selectedPizzas.push(pizzaId);
        card.classList.add('selected');
      } else {
        selectedPizzas.splice(index, 1);
        card.classList.remove('selected');
      }
    }

    // Share selected pizzas
    function shareSelectedPizzas() {
      if (selectedPizzas.length === 0) {
        alert("Please select at least one pizza to share.");
        return;
      }
      
      const selectedPizzaData = userProfile.pizzas.filter(pizza => 
        selectedPizzas.includes(pizza.id)
      );
      
      const pizzasData = encodeURIComponent(JSON.stringify(selectedPizzaData));
      const shareUrl = `${window.location.origin}${window.location.pathname}?shared=true&pizzas=${pizzasData}`;
      const shareText = `Check out my pizza creations! I've shared ${selectedPizzaData.length} pizza${selectedPizzaData.length > 1 ? 's' : ''} with you.`;
      
      if (navigator.share) {
        navigator.share({
          title: 'My Pizza Creations',
          text: shareText,
          url: shareUrl
        }).then(() => {
          toggleSelectionMode();
        });
      } else {
        // Fallback for browsers that don't support Web Share API
        navigator.clipboard.writeText(shareText + "\n\n" + shareUrl).then(() => {
          alert("Share link copied to clipboard!");
          toggleSelectionMode();
        }).catch(() => {
          alert(`Share these pizzas:\n\n${shareText}\n\n${shareUrl}`);
          toggleSelectionMode();
        });
      }
    }

    //Download pizza card
    function downloadCard(pizzaId) {
      const modal = document.getElementById('pizzaModal');
      if (!modal) return;
      
      const action = modal.querySelector('.modal-actions');
      if (action) action.style.display = 'none';

      html2canvas(modal.querySelector('.instagram-modal')).then(canvas => {
        const link = document.createElement('a');
        link.download = "pizza.png";
        link.href = canvas.toDataURL('image/png');
        link.click();
        if (action) action.style.display = 'flex';
      });
    }

    // Load user profile
    function loadUserProfile() {
      updateProfileDisplay();
    }

    // Save user profile (only for owner)
    function saveUserProfile() {
      if (isOwner) {
        localStorage.setItem('userProfile', JSON.stringify(userProfile));
      }
      updateProfileDisplay();
    }

    // Update profile display
    function updateProfileDisplay() {
      renderUserPizzas();
    }

    // Render user pizzas
    function renderUserPizzas() {
      userPizzasGrid.innerHTML = '';
      
      if (userProfile.pizzas.length === 0) {
        userPizzasGrid.innerHTML = '<p style="text-align: center; grid-column: 1 / -1; color: #d6d6d6; padding: 40px 20px; font-size: 1.1rem;">No pizzas created yet! <br><a href="custom.html" style="color: #ff5a2e; text-decoration: none; font-weight: 700;">Create your first pizza →</a></p>';
        shareMultipleBtnContainer.style.display = 'none';
        return;
      }
      
      for (let i = 0; i < userProfile.pizzas.length; i++) {
        const pizza = userProfile.pizzas[i];
        const card = document.createElement('div');
        card.className = 'pizza-card';
        card.dataset.pizzaId = pizza.id;
        
        // SIMPLE ADDITION: Only add Order button for owner
        const orderButton = isOwner ? 
          `<button class="pizza-order-btn" onclick="event.stopPropagation(); orderProfilePizza('${pizza.id}')">
            <i class="fas fa-cart-plus"></i> Order
          </button>` : '';
        
        card.innerHTML = `
          <div class="selection-checkbox"></div>
          <div class="pizza-emoji">${pizza.emoji || '🍕'}</div>
          <div class="pizza-name">${pizza.name}</div>
          ${orderButton}
          <button class="pizza-share-btn" onclick="event.stopPropagation(); sharePizza('${pizza.id}')">
            <i class="fas fa-share-alt"></i> Share
          </button>
        `;
        
        // Add click event to open modal or select pizza
        card.addEventListener('click', function() {
          if (isSelectionMode) {
            togglePizzaSelection(pizza.id);
          } else {
            openPizzaModal(pizza.id);
          }
        });
        
        userPizzasGrid.appendChild(card);
      }
    }

    // Open Instagram-style modal for pizza
    function openPizzaModal(pizzaId) {
      const pizza = userProfile.pizzas.find(p => p.id === pizzaId);
      if (!pizza) return;
      
      // Determine which buttons to show based on user type
      // FOR OWNER: Like, Share, Download, Order Now, Delete
      // FOR VIEWER (shared): ONLY Download (as per your requirement)
      const actionButtons = isOwner ? 
        `
          <button class="modal-action-btn" onclick="likePizza('${pizza.id}'); closePizzaModal();">Like</button>
          <button class="modal-action-btn" onclick="sharePizza('${pizza.id}');">Share</button>
          <button class="modal-action-btn download" onclick="downloadCard('${pizza.id}');">Download</button>
          <button class="modal-action-btn order-now" onclick="orderProfilePizza('${pizza.id}');">
            <i class="fas fa-cart-plus"></i> Order Now
          </button>
          <button class="modal-action-btn delete" onclick="deletePizzaInModal('${pizza.id}');">Delete</button>
        ` :
        // VIEWER CAN ONLY DOWNLOAD (as you specified)
        `
          <button class="modal-action-btn download" onclick="downloadCard('${pizza.id}');">Download</button>
        `;
      
      // Check if this is a regional pizza (has city and flavor)
      const isRegional = pizza.city && pizza.flavor;
      
      // Create details HTML based on pizza type
      const detailsHTML = isRegional ? 
        `
          <div class="modal-pizza-detail"><strong>Size:</strong> ${pizza.size}</div>
          <div class="modal-pizza-detail"><strong>Crust:</strong> ${pizza.crust}</div>
          <div class="modal-pizza-detail"><strong>City:</strong> ${pizza.city}</div>
          <div class="modal-pizza-detail"><strong>Flavor:</strong> ${pizza.flavor}</div>
        ` : 
        `
          <div class="modal-pizza-detail"><strong>Size:</strong> ${pizza.size}</div>
          <div class="modal-pizza-detail"><strong>Crust:</strong> ${pizza.crust}</div>
          <div class="modal-pizza-detail"><strong>Toppings:</strong> ${pizza.toppings ? pizza.toppings.join(', ') : 'None'}</div>
          <div class="modal-pizza-detail"><strong>Sauce:</strong> ${pizza.sauce ? pizza.sauce.join(', ') : 'None'}</div>
        `;
      
      // Create modal HTML
      const modalHTML = `
        <div class="modal-backdrop" id="pizzaModal">
          <div class="instagram-modal">
            <div class="modal-image-section">
              <div class="modal-image-content">${pizza.emoji || '🍕'}</div>
            </div>
            <div class="modal-details-section">
              <div class="modal-header">
                <div class="modal-avatar">${userProfile.username[0] || "🍕"}</div>
                <div class="modal-username">${isOwner ? 'My Pizza Creations' : 'Shared Pizza'}</div>
                <button class="modal-close" id="modalClose">&times;</button>
              </div>
              <div class="modal-content">
                <div class="modal-pizza-name">${pizza.name}</div>
                <div class="modal-pizza-details">
                  ${detailsHTML}
                </div>
                <div class="modal-pizza-description">${pizza.description}</div>
                <div class="modal-pizza-stats">
                  <div class="modal-stat">
                    <div class="modal-stat-value">${pizza.likes || 0}</div>
                    <div class="modal-stat-label">Likes</div>
                  </div>
                  <div class="modal-stat">
                    <div class="modal-stat-value">${pizza.views || 0}</div>
                    <div class="modal-stat-label">Views</div>
                  </div>
                  <div class="modal-stat">
                    <div class="modal-stat-value">${pizza.price || 0}</div>
                    <div class="modal-stat-label">Price</div>
                  </div>
                </div>
              </div>
              <div class="modal-actions">
                ${actionButtons}
              </div>
            </div>
          </div>
        </div>
      `;
      
      // Add modal to page
      modalsRoot.innerHTML = modalHTML;
      
      // Show modal with animation
      setTimeout(() => {
        const modal = document.getElementById('pizzaModal');
        modal.classList.add('active');
      }, 10);
      
      // Add event listener for closing modal
      document.getElementById('modalClose').addEventListener('click', closePizzaModal);
      
      // Close modal when clicking on backdrop
      document.getElementById('pizzaModal').addEventListener('click', function(e) {
        if (e.target === this) {
          closePizzaModal();
        }
      });
      
      // Close modal with Escape key
      document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
          closePizzaModal();
        }
      });
    }

    // Close pizza modal
    function closePizzaModal() {
      const modal = document.getElementById('pizzaModal');
      if (modal) {
        modal.classList.remove('active');
        setTimeout(() => {
          modalsRoot.innerHTML = '';
        }, 300);
      }
    }

    // Like a pizza (owner only)
    function likePizza(pizzaId) {
      if (!isOwner) return;
      
      const pizza = userProfile.pizzas.find(p => p.id === pizzaId);
      if (pizza) {
        pizza.likes = (pizza.likes || 0) + 1;
        saveUserProfile();
      }
    }

    // Share a single pizza
    function sharePizza(pizzaId) {
      const pizza = userProfile.pizzas.find(p => p.id === pizzaId);
      if (pizza) {
        const pizzaData = encodeURIComponent(JSON.stringify(pizza));
        const shareUrl = `${window.location.origin}${window.location.pathname}?shared=true&pizzas=${pizzaData}`;
        const shareText = `Check out this pizza creation: ${pizza.name}! ${pizza.size} pizza with ${pizza.crust} crust and ${pizza.toppings ? pizza.toppings.join(', ') : pizza.flavor} ${pizza.flavor ? 'flavor' : 'toppings'}.`;
        
        if (navigator.share) {
          navigator.share({
            title: pizza.name,
            text: shareText,
            url: shareUrl
          });
        } else {
          // Fallback for browsers that don't support Web Share API
          navigator.clipboard.writeText(shareText + "\n\n" + shareUrl).then(() => {
            alert("Pizza details and share link copied to clipboard!");
          }).catch(() => {
            alert(`Share this pizza:\n\n${shareText}\n\n${shareUrl}`);
          });
        }
      }
    }

    // Delete a pizza from modal (owner only)
    function deletePizzaInModal(pizzaId) {
      if (!isOwner) return;
      
      if (confirm("Are you sure you want to delete this pizza? This action cannot be undone.")) {
        userProfile.pizzas = userProfile.pizzas.filter(p => p.id !== pizzaId);
        saveUserProfile();
        closePizzaModal();
      }
    }

    // Initialize page
    document.addEventListener('DOMContentLoaded', function() {
      // Check if user is owner or viewer
      checkViewMode();
      
      // Load user profile
      loadUserProfile();
      
      // Set up event listeners for selection mode
      if (isOwner) {
        shareMultipleBtn.addEventListener('click', toggleSelectionMode);
        shareSelectedBtn.addEventListener('click', shareSelectedPizzas);
        cancelSelectionBtn.addEventListener('click', toggleSelectionMode);
      } else {
        shareMultipleBtnContainer.style.display = 'none';
      }
    });

    // Make functions global for onclick handlers
    window.likePizza = likePizza;
    window.sharePizza = sharePizza;
    window.orderProfilePizza = orderProfilePizza;
    window.deletePizzaInModal = deletePizzaInModal;
    window.openPizzaModal = openPizzaModal;
    window.closePizzaModal = closePizzaModal;
    window.downloadCard = downloadCard;
    window.togglePizzaSelection = togglePizzaSelection;