// ========== GLOBALS ==========
let cart = [];
let deliveryType = 'pickup';
let paymentMethod = 'cash';
let currentUser = null;

// XP Thresholds (same as dashboard)
const XP_THRESHOLDS = {1:0, 2:200, 3:450, 4:750, 5:1100, 6:1500, 7:2000};

// ========== USER DATA (synced with dashboard) ==========
function loadUserFromDashboard() {
    const stored = localStorage.getItem('pizzaUser');
    if (stored) {
        currentUser = JSON.parse(stored);
    } else {
        currentUser = {
            name: "Pizza Lover",
            email: "guest@example.com",
            membership: "nonvip",
            xp: 0,
            level: 1,
            orderCount: 0,
            referralCount: 0,
            missions: { order3: false, referral: false, level3: false }
        };
        saveUserToDashboard();
    }
    currentUser.level = calculateLevelFromXP(currentUser.xp);
    saveUserToDashboard();
}

function saveUserToDashboard() {
    localStorage.setItem('pizzaUser', JSON.stringify(currentUser));
}

function calculateLevelFromXP(xp) {
    let level = 1;
    for (let lvl=7; lvl>=1; lvl--) {
        if (xp >= XP_THRESHOLDS[lvl]) { level = lvl; break; }
    }
    return level;
}

function getDiscountPercent(level, membership) {
    if (membership === 'vip') return 10;
    if (level === 1 || level === 2) return 0;
    if (level === 3) return 2;
    if (level === 4) return 2.5;
    if (level === 5) return 3;
    if (level === 6) return 4;
    if (level >= 7) return 5;
    return 0;
}

// ========== CART MANAGEMENT ==========
function saveCart() {
    localStorage.setItem('pizzaCart', JSON.stringify(cart));
    updateCartDisplay();
}

function updateCartDisplay() {
    const cartCountSpan = document.getElementById('cartCount');
    if (cartCountSpan) {
        cartCountSpan.textContent = cart.reduce((sum, item) => sum + (item.quantity || 1), 0);
    }
    const sidebarCount = document.getElementById('sidebarCartCount');
    if (sidebarCount) {
        sidebarCount.textContent = cart.reduce((sum, item) => sum + (item.quantity || 1), 0);
    }
}

function recalculateTotals() {
    let subtotal = 0;
    for (let item of cart) subtotal += item.price * (item.quantity || 1);
    let discountPercent = getDiscountPercent(currentUser.level, currentUser.membership);
    let discountAmount = (subtotal * discountPercent) / 100;
    let finalTotal = subtotal - discountAmount;
    let complimentaryItem = null;
    if (currentUser.membership === 'vip' || currentUser.level >= 7) {
        complimentaryItem = { name: 'Complimentary Item', price: 0 };
    }
    return { subtotal, discountPercent, discountAmount, finalTotal, complimentaryItem };
}

function loadCart() {
    const cartContent = document.getElementById('cartContent');
    const emptyCart = document.getElementById('emptyCart');
    const checkoutForm = document.getElementById('checkoutForm');
    const orderTotalSpan = document.getElementById('orderTotal');

    if (!cart || cart.length === 0) {
        if (cartContent) cartContent.style.display = 'none';
        if (emptyCart) emptyCart.style.display = 'block';
        if (checkoutForm) checkoutForm.style.display = 'none';
        return;
    }

    if (emptyCart) emptyCart.style.display = 'none';
    if (cartContent) cartContent.style.display = 'block';
    if (checkoutForm) checkoutForm.style.display = 'block';

    let html = '<div class="cart-items">';
    cart.forEach((item, idx) => {
        html += `
            <div class="cart-item">
                <div>
                    <h4>${item.pizza}</h4>
                    <p>Size: ${item.size}</p>
                    <div class="cart-item-controls">
                        <button class="qty-btn" onclick="changeQuantity(${idx}, -1)">-</button>
                        <span class="qty-value">${item.quantity}</span>
                        <button class="qty-btn" onclick="changeQuantity(${idx}, 1)">+</button>
                        <button class="remove-item" onclick="removeCartItem(${idx})">Remove</button>
                    </div>
                </div>
                <div style="font-weight:bold;color:#ff5a2e;">Rs.${(item.price * item.quantity).toFixed(2)}</div>
            </div>
        `;
    });
    html += '</div>';

    const { subtotal, discountPercent, discountAmount, finalTotal, complimentaryItem } = recalculateTotals();
    html += `<div class="cart-summary">
                <div class="discount-row">Subtotal: Rs.${subtotal.toFixed(2)}</div>
                ${discountPercent > 0 ? `<div class="discount-row">Discount (${discountPercent}%): -Rs.${discountAmount.toFixed(2)}</div>` : ''}
                ${complimentaryItem ? `<div class="complimentary-row">🎁 Complimentary: ${complimentaryItem.name}</div>` : ''}
                <div class="cart-total">Total after discount: Rs.${finalTotal.toFixed(2)}</div>
            </div>`;

    cartContent.innerHTML = html;
    if (orderTotalSpan) orderTotalSpan.textContent = finalTotal.toFixed(2);
}

// Expose to global scope for inline onclick
window.changeQuantity = function(index, delta) {
    if (!cart[index]) return;
    let newQty = cart[index].quantity + delta;
    if (newQty <= 0) {
        removeCartItem(index);
    } else {
        cart[index].quantity = newQty;
        saveCart();
        loadCart();
    }
};

window.removeCartItem = function(index) {
    cart.splice(index, 1);
    saveCart();
    loadCart();
};

// ========== DELIVERY & PAYMENT SELECTION ==========
window.selectDelivery = function(el) {
    document.querySelectorAll('.delivery-option').forEach(opt => opt.classList.remove('selected'));
    el.classList.add('selected');
    deliveryType = el.getAttribute('data-type');
    const addrFields = document.getElementById('addressFields');
    if (addrFields) addrFields.style.display = deliveryType === 'delivery' ? 'block' : 'none';
};

window.selectPayment = function(el) {
    document.querySelectorAll('.payment-method').forEach(m => m.classList.remove('selected'));
    el.classList.add('selected');
    paymentMethod = el.getAttribute('data-method');
};

// ========== PLACE ORDER (with auth guard) ==========
window.placeOrder = function() {
    // ✅ EXTRA AUTH GUARD – double-check login before placing order
    if (typeof Api !== 'undefined' && !Api.isLoggedIn()) {
        sessionStorage.setItem('pizza_redirect_after_login', 'checkout.html');
        if (confirm('You need to be logged in to place an order. Would you like to login now?')) {
            window.location.href = 'login.html';
        }
        return;
    }

    const phone = document.getElementById('phone')?.value || '';
    const address = deliveryType === 'delivery'
        ? (document.getElementById('deliveryAddress')?.value || '')
        : 'Pickup';

    if (!phone) {
        alert('Please enter your phone number!');
        return;
    }
    if (deliveryType === 'delivery' && !address) {
        alert('Please enter your delivery address!');
        return;
    }

    const { subtotal, discountPercent, discountAmount, finalTotal, complimentaryItem } = recalculateTotals();

    let xpEarned = null;
    if (currentUser.membership === 'nonvip') {
        xpEarned = 20;   // fixed 20 XP
        currentUser.xp += xpEarned;
        const newLevel = calculateLevelFromXP(currentUser.xp);
        if (newLevel > currentUser.level) {
            alert(`🎉 Level Up! You reached Level ${newLevel} and unlocked better discounts!`);
            currentUser.level = newLevel;
        }
        currentUser.orderCount += 1;
        if (currentUser.orderCount >= 3 && !currentUser.missions.order3) {
            currentUser.missions.order3 = true;
            alert("🏆 Mission 'Order 3 times' completed! Claim 150 XP in your dashboard.");
        }
    }

    const order = {
        id: 'ORD' + Date.now(),
        items: cart.map(item => ({ ...item })),
        subtotal, discountPercent, discountAmount, finalTotal,
        complimentaryItem,
        date: new Date().toISOString(),
        status: 'confirmed',
        deliveryType, phone, address, paymentMethod,
        membership: currentUser.membership,
        level: currentUser.level,
        xpEarned
    };

    let orders = JSON.parse(localStorage.getItem('pizzaOrders') || '[]');
    orders.unshift(order);
    localStorage.setItem('pizzaOrders', JSON.stringify(orders));

    saveUserToDashboard();

    // Clear the cart
    cart = [];
    saveCart();

    // Show success alert
    alert(`✅ Order placed successfully!\nOrder #: ${order.id}\nTotal: Rs.${order.finalTotal.toFixed(2)}\n${xpEarned ? `XP Earned: ${xpEarned}` : ''}\nThank you!`);

    // Reset the form fields and stay on the checkout page
    document.getElementById('phone').value = '';
    const addrField = document.getElementById('deliveryAddress');
    if (addrField) addrField.value = '';

    // Reset delivery option to pickup
    document.querySelectorAll('.delivery-option').forEach(opt => opt.classList.remove('selected'));
    const pickupOption = document.querySelector('.delivery-option[data-type="pickup"]');
    if (pickupOption) pickupOption.classList.add('selected');
    deliveryType = 'pickup';
    const addressFieldsDiv = document.getElementById('addressFields');
    if (addressFieldsDiv) addressFieldsDiv.style.display = 'none';

    // Reset payment method to cash
    document.querySelectorAll('.payment-method').forEach(m => m.classList.remove('selected'));
    const cashOption = document.querySelector('.payment-method[data-method="cash"]');
    if (cashOption) cashOption.classList.add('selected');
    paymentMethod = 'cash';

    // Reload the cart display (will show empty cart)
    loadCart();
};

// ========== MEMBERSHIP DISPLAY ==========
function updateMembershipInfoDisplay() {
    const infoDiv = document.getElementById('membershipInfo');
    if (!infoDiv) return;
    const discount = getDiscountPercent(currentUser.level, currentUser.membership);
    let discountText = discount > 0 ? `${discount}% OFF` : 'No discount';
    let extra = '';
    if (currentUser.membership === 'vip' || currentUser.level >= 7) {
        extra = ' + Complimentary Item';
    }
    infoDiv.innerHTML = `
        <i class="fas fa-id-card"></i> <strong>${currentUser.membership === 'vip' ? '👑 VIP Member' : '🍕 Non-VIP Member'}</strong><br>
        Level: <span class="level-badge">${currentUser.level}</span> &nbsp; | &nbsp; Discount: ${discountText}${extra}
    `;
}

// ========== SIDEBAR & NAVBAR (responsive toggle) ==========
function initSidebar() {
    const menuBtn = document.getElementById('menuBtn');
    const closeBtn = document.getElementById('closeBtn');
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('overlay');

    if (menuBtn && closeBtn && sidebar && overlay) {
        menuBtn.addEventListener('click', () => {
            sidebar.classList.add('active');
            overlay.classList.add('active');
            document.body.style.overflow = 'hidden';
        });
        closeBtn.addEventListener('click', () => {
            sidebar.classList.remove('active');
            overlay.classList.remove('active');
            document.body.style.overflow = '';
        });
        overlay.addEventListener('click', () => {
            sidebar.classList.remove('active');
            overlay.classList.remove('active');
            document.body.style.overflow = '';
        });

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

        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape') {
                sidebar.classList.remove('active');
                overlay.classList.remove('active');
                document.body.style.overflow = '';
            }
        });

        window.addEventListener('resize', () => {
            if (window.innerWidth > 900) {
                sidebar.classList.remove('active');
                overlay.classList.remove('active');
                document.body.style.overflow = '';
            }
            handleResponsiveCart();
            if (window.innerWidth <= 900) {
                document.querySelector('meta[name="viewport"]').setAttribute('content',
                    'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, shrink-to-fit=no');
            } else {
                document.querySelector('meta[name="viewport"]').setAttribute('content',
                    'width=device-width, initial-scale=1.0');
            }
        });
    }
}

function handleResponsiveCart() {
    const isMobileOrTablet = window.innerWidth <= 900;
    const cartBtn = document.querySelector('.navbar-right .cart-btn');
    const sidebarCart = document.querySelector('.sidebar-cart-btn');
    if (cartBtn) {
        cartBtn.style.display = isMobileOrTablet ? 'none' : 'flex';
    }
    if (sidebarCart) {
        sidebarCart.style.display = isMobileOrTablet ? 'block' : 'none';
    }
}

// ========== INITIALIZATION ==========
document.addEventListener('DOMContentLoaded', () => {
    if (localStorage.getItem('pizzaCart')) {
        cart = JSON.parse(localStorage.getItem('pizzaCart'));
        cart = cart.map(item => { if (!item.quantity) item.quantity = 1; return item; });
        saveCart();
    }
    loadUserFromDashboard();
    updateMembershipInfoDisplay();
    updateCartDisplay();
    loadCart();

    initSidebar();
    handleResponsiveCart();

    if (window.innerWidth <= 900) {
        document.querySelector('meta[name="viewport"]').setAttribute('content',
            'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, shrink-to-fit=no');
    }
});