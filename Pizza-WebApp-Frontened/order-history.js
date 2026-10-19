let cart = [];

// Load cart from storage
if (localStorage.getItem('pizzaCart')) {
    cart = JSON.parse(localStorage.getItem('pizzaCart'));
}

function updateCartDisplay() {
    const cartCountSpan = document.getElementById('cartCount');
    if (cartCountSpan) {
        cartCountSpan.textContent = cart.reduce((sum, item) => sum + (item.quantity || 1), 0);
    }
}

// ========== SIDEBAR (unchanged) ==========
const menuBtn = document.getElementById('menuBtn');
const closeBtn = document.getElementById('closeBtn');
const sidebar = document.getElementById('sidebar');
const overlay = document.getElementById('overlay');

if (menuBtn && closeBtn && sidebar && overlay) {
    menuBtn.addEventListener('click', function() {
        sidebar.classList.add('active');
        overlay.classList.add('active');
        document.body.style.overflow = 'hidden';
    });
    closeBtn.addEventListener('click', function() {
        sidebar.classList.remove('active');
        overlay.classList.remove('active');
        document.body.style.overflow = '';
    });
    overlay.addEventListener('click', function() {
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
    document.addEventListener('keydown', function(event) {
        if (event.key === 'Escape') {
            sidebar.classList.remove('active');
            overlay.classList.remove('active');
            document.body.style.overflow = '';
        }
    });
    window.addEventListener('resize', function() {
        if (window.innerWidth > 900) {
            sidebar.classList.remove('active');
            overlay.classList.remove('active');
            document.body.style.overflow = '';
        }
    });
}

// ========== LOAD ORDERS (with "Complimentary Item" instead of "Free Drink") ==========
function loadOrders() {
    const ordersList = document.getElementById('ordersList');
    const orders = JSON.parse(localStorage.getItem('pizzaOrders')) || [];
    const deleteAllRow = document.getElementById('deleteAllRow');

    // Show/hide delete all button
    if (deleteAllRow) {
        deleteAllRow.style.display = orders.length > 0 ? 'block' : 'none';
    }

    if (orders.length === 0) {
        ordersList.innerHTML = `
            <div class="empty-history">
                <p>No orders yet! 😊</p>
                <p>Your orders will appear here after checkout.</p>
                <div class="empty-history-links">
                    <br>
                    <a href="Menue.html" class="browse-link">
                        <i class="fas fa-utensils"></i> Browse Menu
                    </a>
                    <br><br>
                    <a href="custom.html" class="customize-link">
                        <i class="fas fa-sliders-h"></i> Customize Pizza
                    </a>
                </div>
            </div>
        `;
        return;
    }

    let ordersHTML = '';
    orders.forEach(order => {
        const date = new Date(order.date);
        const formattedDate = date.toLocaleDateString('en-US', {
            year: 'numeric', month: 'short', day: 'numeric',
            hour: '2-digit', minute: '2-digit'
        });

        let itemsHTML = '';
        if (order.items && order.items.length > 0) {
            order.items.forEach(item => {
                const qty = item.quantity || 1;
                itemsHTML += `<div class="order-item">${item.pizza} (${item.size}) x${qty} - Rs.${(item.price * qty).toFixed(2)}</div>`;
            });
        } else {
            itemsHTML = '<div class="order-item">No items found</div>';
        }

        const isVip = (order.membership === 'vip');
        let xpHtml = '';
        if (order.xpEarned && order.membership !== 'vip') {
            xpHtml = `<div style="color:#ffc107; font-size:13px; margin-top:5px;">✨ XP Earned: ${order.xpEarned}</div>`;
        }
        let discountHtml = '';
        if (order.discountPercent && order.discountPercent > 0) {
            discountHtml = `<div style="color:#28a745; font-size:13px;">Discount: ${order.discountPercent}% (-Rs.${order.discountAmount.toFixed(2)})</div>`;
        }
        // CHANGED: always show "Complimentary Item" regardless of stored name
        let compHtml = '';
        if (order.complimentaryItem) {
            compHtml = `<div style="color:#ffc107; font-size:13px;">🎁 Complimentary Item</div>`;
        }

        ordersHTML += `
            <div class="order-card" id="order-${order.id}" style="border-left-color: ${isVip ? '#ffc107' : '#ff5a2e'};">
                <div class="order-header">
                    <div>
                        <div class="order-id">Order #${order.id}</div>
                        <div class="order-date">${formattedDate}</div>
                        <div class="order-status" style="color: #28a745; font-size: 14px; margin-top: 5px;">
                            Status: ${order.status || 'pending'} • ${order.deliveryType || 'pickup'} • ${order.paymentMethod || 'cash'}
                            ${isVip ? ' <span style="background:#ffc107; color:#000; padding:2px 6px; border-radius:12px; margin-left:8px;">VIP</span>' : ` <span style="background:#ff5a2e; padding:2px 6px; border-radius:12px;">Level ${order.level || 1}</span>`}
                        </div>
                        ${xpHtml}
                        ${discountHtml}
                        ${compHtml}
                    </div>
                    <div style="display: flex; gap: 10px;">
                        <button class="reorder-btn" onclick="reorderOrder('${order.id}')" style="background:#28a745; color:white; border:none; padding:8px 15px; border-radius:25px; cursor:pointer;">🔄 Reorder</button>
                        <button class="delete-btn" onclick="deleteOrder('${order.id}')">Delete</button>
                    </div>
                </div>
                <div class="order-items">${itemsHTML}</div>
                <div class="order-total">Total: Rs.${(order.finalTotal || order.total || 0).toFixed(2)}</div>
            </div>
        `;
    });
    ordersList.innerHTML = ordersHTML;
}

// ========== DELETE ORDER (unchanged) ==========
function deleteOrder(orderId) {
    if (confirm('Are you sure you want to delete this order?')) {
        let orders = JSON.parse(localStorage.getItem('pizzaOrders')) || [];
        orders = orders.filter(order => order.id !== orderId);
        localStorage.setItem('pizzaOrders', JSON.stringify(orders));
        const orderElement = document.getElementById('order-' + orderId);
        if (orderElement) {
            orderElement.style.opacity = '0';
            orderElement.style.transform = 'translateX(20px)';
            setTimeout(() => {
                orderElement.remove();
                if (orders.length === 0) loadOrders();
            }, 300);
        }
    }
}

// ========== DELETE ALL ORDERS (NEW) ==========
function deleteAllOrders() {
    const orders = JSON.parse(localStorage.getItem('pizzaOrders')) || [];
    if (orders.length === 0) return;
    if (confirm(`⚠️ Are you sure you want to delete all ${orders.length} orders? This cannot be undone.`)) {
        localStorage.removeItem('pizzaOrders');
        loadOrders(); // reload to show empty state
        // Optionally update cart display (just in case)
        updateCartDisplay();
    }
}

// ========== REORDER FUNCTION (unchanged) ==========
function reorderOrder(orderId) {
    let orders = JSON.parse(localStorage.getItem('pizzaOrders')) || [];
    const order = orders.find(o => o.id === orderId);
    if (!order) return;
    let cart = JSON.parse(localStorage.getItem('pizzaCart')) || [];
    for (let item of order.items) {
        let existing = cart.find(i => i.pizza === item.pizza && i.size === item.size);
        if (existing) {
            existing.quantity = (existing.quantity || 1) + (item.quantity || 1);
        } else {
            cart.push({ ...item, quantity: item.quantity || 1 });
        }
    }
    localStorage.setItem('pizzaCart', JSON.stringify(cart));
    alert('Items added to your cart! Redirecting to checkout...');
    window.location.href = 'checkout.html';
}

// Initialize
window.addEventListener('DOMContentLoaded', () => {
    updateCartDisplay();
    loadOrders();
    // Scroll animations (optional)
    setTimeout(() => {
        document.querySelectorAll('.order-card').forEach(card => {
            card.style.opacity = '0';
            card.style.transform = 'translateY(20px)';
            card.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        entry.target.style.opacity = '1';
                        entry.target.style.transform = 'translateY(0)';
                    }
                });
            }, { threshold: 0.1 });
            observer.observe(card);
        });
    }, 100);
});