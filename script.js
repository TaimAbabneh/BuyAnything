// Local Database Setup State Variables Initialization
let storeData = JSON.parse(localStorage.getItem('buyanything_premium_db')) || {
    adminTargetEmail: "your-email@school.com", // Set default target route address here
    categories: ["All", "Snacks", "Drinks", "Supplies"],
    products: [
        { id: 101, name: "Premium Notebook", price: 4.99, category: "Supplies", img: "https://unsplash.com" },
        { id: 102, name: "Energy Drink Burst", price: 2.50, category: "Drinks", img: "https://unsplash.com" },
        { id: 103, name: "Chocolate Chip Cookie", price: 1.25, category: "Snacks", img: "https://unsplash.com" }
    ]
};

let globalShoppingCart = JSON.parse(localStorage.getItem('buyanything_active_cart')) || [];
let selectedCategoryFilter = "All";

function saveToStorage() { localStorage.setItem('buyanything_premium_db', JSON.stringify(storeData)); }
function saveCartToStorage() { localStorage.setItem('buyanything_active_cart', JSON.stringify(globalShoppingCart)); }

/* ================= CENTRAL DATA ROUTING HUBS ================= */
window.addEventListener('DOMContentLoaded', () => {
    const path = window.location.pathname;

    if (path.includes('index.html') || path === '/' || !path.includes('.html')) {
        renderMarqueeScroller();
        renderSidebarCategories();
        renderGridInventory();
        updateCartBadgeCount();
        setupTicketModalControls();
    }
    if (path.includes('admin.html')) {
        setupAdminInstantGate();
    }
    if (path.includes('cart.html')) {
        renderTerminalCartContents();
        setupCartCheckoutSystem();
    }
});

/* ================= HOMEPAGE ANIMATED MARQUEE RENDERER ================= */
function renderMarqueeScroller() {
    const box = document.getElementById('movingShowcase');
    if (!box) return;
    box.innerHTML = '';
    
    // Duplicate arrays list so marquee scrolls endlessly following each other flawlessly
    const doubleList = [...storeData.products, ...storeData.products, ...storeData.products];
    
    doubleList.forEach(p => {
        const card = document.createElement('div');
        card.className = 'marquee-card';
        card.innerHTML = `
            <img src="${p.img}" alt="${p.name}" onerror="this.src='https://unsplash.com'">
            <div class="marquee-card-info">
                <div class="marquee-card-name">${p.name}</div>
                <div class="marquee-card-price">$${p.price.toFixed(2)}</div>
            </div>
        `;
        box.appendChild(card);
    });
}

function renderSidebarCategories() {
    const hub = document.getElementById('categoryHub');
    if (!hub) return;
    hub.innerHTML = '';

    storeData.categories.forEach(cat => {
        const btn = document.createElement('button');
        btn.className = `cat-link-btn ${selectedCategoryFilter === cat ? 'active' : ''}`;
        btn.innerHTML = `<i class="fa-solid fa-chevron-right" style="font-size:0.75rem; margin-right:5px"></i> ${cat}`;
        btn.onclick = () => {
            selectedCategoryFilter = cat;
            renderSidebarCategories();
            renderGridInventory();
        };
        hub.appendChild(btn);
    });
}

function renderGridInventory() {
    const grid = document.getElementById('productsGrid');
    if (!grid) return;
    grid.innerHTML = '';

    const viewItems = selectedCategoryFilter === "All" 
        ? storeData.products 
        : storeData.products.filter(p => p.category === selectedCategoryFilter);

    viewItems.forEach(prod => {
        const card = document.createElement('div');
        card.className = 'product-card';
        card.innerHTML = `
            <img class="product-img" src="${prod.img}" alt="${prod.name}" onerror="this.src='https://unsplash.com'">
            <div class="product-info">
                <div class="product-name">${prod.name}</div>
                <div class="product-meta">
                    <div class="product-price">$${prod.price.toFixed(2)}</div>
                    <button class="add-cart-btn" onclick="addItemToCart(${prod.id})">Add Item</button>
                </div>
            </div>
        `;
        grid.appendChild(card);
    });
}

function addItemToCart(id) {
    const match = storeData.products.find(p => p.id === id);
    if (!match) return;
    
    const existing = globalShoppingCart.find(item => item.product.id === id);
    if (existing) { existing.quantity += 1; } else { globalShoppingCart.push({ product: match, quantity: 1 }); }
    
    saveCartToStorage();
    updateCartBadgeCount();
    alert(`${match.name} added to cart.`);
}

function updateCartBadgeCount() {
    const badg = document.getElementById('cartCount');
    if (badg) badg.textContent = globalShoppingCart.reduce((s, i) => s + i.quantity, 0);
}

/* ================= HIDDEN MODAL TICKET TOGGLE LOGIC ================= */
function setupTicketModalControls() {
    const modal = document.getElementById('ticketModal');
    const openBtn = document.getElementById('openTicketBtn');
    const closeBtn = document.getElementById('closeTicketBtn');
    const form = document.getElementById('supportTicketForm');

    // Dynamic submission route destination injection update
    if(form) form.action = `https://formsubmit.co{storeData.adminTargetEmail}`;

    if(openBtn) openBtn.onclick = () => modal.style.display = 'flex';
    if(closeBtn) closeBtn.onclick = () => modal.style.display = 'none';
}

/* ================= INSTANT KEY-INTERCEPT ADMIN AUTHENTICATION ================= */
function setupAdminInstantGate() {
    const input = document.getElementById('password');
    const gate = document.getElementById('adminAuthGate');
    const desk = document.getElementById('adminPanelWorkspace');

    if (!input) return;

    // Real-time keyup interception logic requested
    input.addEventListener('input', () => {
        // Exact token string parameter checked on the fly
        if (input.value === "buyanything 123") {
            gate.style.display = 'none';
            desk.style.display = 'block';
            document.getElementById('adminAlertEmail').value = storeData.adminTargetEmail;
            renderAdminTools();
        }
    });

    document.getElementById('exitControlBtn').onclick = () => window.location.href = 'index.html';
}

function renderAdminTools() {
    document.getElementById('saveSystemTargetBtn').onclick = () => {
        storeData.adminTargetEmail = document.getElementById('adminAlertEmail').value.trim();
        saveToStorage();
        alert("Operational Email target destination updated.");
    };

    // Dropdowns dropdown lists
    const select = document.getElementById('prodCategory');
    const cList = document.getElementById('adminCategoriesList');
    select.innerHTML = ''; cList.innerHTML = '';
    
    storeData.categories.filter(c => c !== "All").forEach(cat => {
        const o = document.createElement('option'); o.value = cat; o.textContent = cat; select.appendChild(o);
        const r = document.createElement('div'); r.className = 'list-item';
        r.innerHTML = `<span>${cat}</span><button class="delete-btn" onclick="dropCategory('${cat}')"><i class="fa-solid fa-trash"></i></button>`;
        cList.appendChild(r);
    });

    // Inventory lists
    const pList = document.getElementById('adminProductsList'); pList.innerHTML = '';
    storeData.products.forEach(p => {
        const r = document.createElement('div'); r.className = 'list-item';
        r.innerHTML = `<span>${p.name} ($${p.price.toFixed(2)})</span><button class="delete-btn" onclick="dropProduct(${p.id})"><i class="fa-solid fa-trash"></i></button>`;
        pList.appendChild(r);
    });
}

// Category addition listeners attachment 
if (window.location.pathname.includes('admin.html')) {
    document.getElementById('addCategoryForm').addEventListener('submit', (e) => {
        e.preventDefault();
        const v = document.getElementById('newCategoryName').value.trim();
        if(v && !storeData.categories.includes(v)) {
            storeData.categories.push(v); saveToStorage(); renderAdminTools();
            document.getElementById('newCategoryName').value = '';
        }
    });

    document.getElementById('addProductForm').addEventListener('submit', (e) => {
        e.preventDefault();
        const name = document.getElementById('prodName').value.trim();
        const price = parseFloat(document.getElementById('prodPrice').value);
        const category = document.getElementById('prodCategory').value;
        let imgUrl = document.getElementById('useAIImage').checked 
            ? `https://unsplash.com{encodeURIComponent(name)},product`
            : (document.getElementById('prodImgUrl').value.trim() || 'https://unsplash.com');

        storeData.products.push({ id: Date.now(), name, price, category, img: imgUrl });
        saveToStorage(); renderAdminTools();
        document.getElementById('prodName').value = ''; document.getElementById('prodPrice').value = '';
    });
}

window.dropCategory = function(name) {
    storeData.categories = storeData.categories.filter(c => c !== name);
    storeData.products.forEach(p => { if(p.category === name) p.category = "All"; });
    saveToStorage(); renderAdminTools();
};
window.dropProduct = function(id) {
    storeData.products = storeData.products.filter(p => p.id !== id);
    saveToStorage(); renderAdminTools();
};

/* ================= CART TERMINAL HANDLERS ================= */
function renderTerminalCartContents() {
    const container = document.getElementById('cartItemsContainer');
    const totalLabel = document.getElementById('cartTotalSum');
    if (!container) return;
    container.innerHTML = '';

<div class="form-group">
    <label for="ticketUser">Your Name</label>
    <input type="text" id="ticketUser" placeholder="Alex Smith" required>
</div>

<div class="form-group">
    <label for="ticketEmail">Your Contact Return Email</label>
    <input type="email" id="ticketEmail" placeholder="alex@school.com" required>
</div>

<div class="form-group">
    <label for="ticketMsg">Inquiry Message</label>
    <textarea id="ticketMsg" rows="4" placeholder="How can we help you?" required></textarea>
</div>

<button type="submit" class="btn">Dispatch Ticket Email</button>
