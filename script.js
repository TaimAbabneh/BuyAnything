// Local Database Setup State Variables Initialization
let storeData = JSON.parse(localStorage.getItem('buyanything_premium_db')) || {
    adminTargetEmail: "your-email@school.com", 
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
    const path = window.location.pathname.toLowerCase();

    // Flexible path checker logic to support Render's automatic clean-url trailing-slash trims
    const isHomePage = path === '/' || path.endsWith('index.html') || path.endsWith('index');
    const isAdminPage = path.includes('admin');
    const isCartPage = path.includes('cart');

    if (isHomePage) {
        renderMarqueeScroller();
        renderSidebarCategories();
        renderGridInventory();
        updateCartBadgeCount();
        setupTicketModalControls();
    }
    if (isAdminPage) {
        setupAdminInstantGate();
    }
    if (isCartPage) {
        renderTerminalCartContents();
        setupCartCheckoutSystem();
    }
});

/* ================= HOMEPAGE ANIMATED MARQUEE RENDERER ================= */
function renderMarqueeScroller() {
    const box = document.getElementById('movingShowcase');
    if (!box) return;
    box.innerHTML = '';
    
    // Triple array contents to map smooth looping transition overlaps cleanly
    const multiLoopItems = [...storeData.products, ...storeData.products, ...storeData.products];
    
    multiLoopItems.forEach(p => {
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
        btn.innerHTML = `<span>${cat}</span><i class="fa-solid fa-chevron-right" style="font-size:0.75rem; opacity:0.6"></i>`;
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

    if (viewItems.length === 0) {
        grid.innerHTML = `<p style="grid-column:1/-1; text-align:center; color:var(--text-muted); padding:3rem 0;">No active stock entries in this category.</p>`;
        return;
    }

    viewItems.forEach((prod, index) => {
        const card = document.createElement('div');
        card.className = 'product-card';
        
        // Staggered incremental entrance display offsets
        card.style.animationDelay = `${index * 0.05}s`;
        
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

    if(form) form.action = `https://formsubmit.co{storeData.adminTargetEmail}`;

    if(openBtn) {
        openBtn.onclick = () => {
            modal.classList.add('open');
        }
    }
    if(closeBtn) {
        closeBtn.onclick = () => {
            modal.classList.remove('open');
        }
    }
}

/* ================= MULTI-TIER REINFORCED ADMIN LOCKSCREEN GATE ================= */
function setupAdminInstantGate() {
    const input = document.getElementById('password');
    const gate = document.getElementById('adminAuthGate');
    const desk = document.getElementById('adminPanelWorkspace');
    const submitBtn = document.getElementById('submitPassBtn');

    if (!input || !submitBtn) return;

    // Unified verification check runner logic
    function processVerificationCheck(isManualClick = false) {
        const entryValue = input.value.trim().toLowerCase();

        // Validates passcode string variations seamlessly
        if (entryValue === "buyanything 123" || entryValue === "buyanything123") {
            gate.style.display = 'none';
            desk.style.display = 'block';
            document.getElementById('adminAlertEmail').value = storeData.adminTargetEmail;
            renderAdminTools();
        } else if (isManualClick) {
            alert("Invalid security password code credentials.");
        }
    }

    // Path A: Click Submit Button Logic Action
    submitBtn.addEventListener('click', () => {
        processVerificationCheck(true);
    });

    // Path B: Keypress Enter Key Logic Action
    input.addEventListener('keydown', (event) => {
        if (event.key === 'Enter') {
            event.preventDefault();
            processVerificationCheck(true);
        }
    });

    // Path C: Instant live matching fallbacks
    input.addEventListener('input', () => {
        processVerificationCheck(false);
    });

    const exitBtn = document.getElementById('exitControlBtn');
    if (exitBtn) exitBtn.onclick = () => window.location.href = 'index.html';
}

function renderAdminTools() {
    document.getElementById('saveSystemTargetBtn').onclick = () => {
        storeData.adminTargetEmail = document.getElementById('adminAlertEmail').value.trim();
        saveToStorage();
        alert("Operational Email target destination updated.");
    };

    const select = document.getElementById('prodCategory');
    const cList = document.getElementById('adminCategoriesList');
    if(!select || !cList) return;
    
    select.innerHTML = ''; cList.innerHTML = '';
    
    storeData.categories.filter(c => c !== "All").forEach(cat => {
        const o = document.createElement('option'); o.value = cat; o.textContent = cat; select.appendChild(o);
        const r = document.createElement('div'); r.className = 'list-item';
        r.innerHTML = `<span>${cat}</span><button class="delete-btn" onclick="dropCategory('${cat}')"><i class="fa-solid fa-trash"></i></button>`;
        cList.appendChild(r);
    });

    const pList = document.getElementById('adminProductsList'); 
    if(!pList) return;
    pList.innerHTML = '';
    
    storeData.products.forEach(p => {
        const r = document.createElement('div'); r.className = 'list-item';
        r.innerHTML = `<span>${p.name} ($${p.price.toFixed(2)})</span><button class="delete-btn" onclick="dropProduct(${p.id})"><i class="fa-solid fa-trash"></i></button>`;
        pList.appendChild(r);
    });
}

// Category addition submission attachment hook actions
window.addEventListener('load', () => {
    const path = window.location.pathname.toLowerCase();
    if (!path.includes('admin')) return;

    const addCatForm = document.getElementById('addCategoryForm');
    const addProdForm = document.getElementById('addProductForm');

    if(addCatForm) {
        addCatForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const v = document.getElementById('newCategoryName').value.trim();
            if(v && !storeData.categories.includes(v)) {
                storeData.categories.push(v); saveToStorage(); renderAdminTools();
            document.getElementById('newCategoryName').value = '';
        });
    }

    if (addProdForm) {
        addProdForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const name = document.getElementById('prodName').value.trim();
            const price = parseFloat(document.getElementById('prodPrice').value);
            const category = document.getElementById('prodCategory').value;
            
            // Fixed AI Image URL string template rules
            let imgUrl = document.getElementById('useAIImage').checked
                ? `https://unsplash.com{encodeURIComponent(name)},product`
                : (document.getElementById('prodImgUrl').value.trim() || 'https://unsplash.com');

            storeData.products.push({ id: Date.now(), name, price, category, img: imgUrl });
            saveToStorage(); 
            renderAdminTools();
            
            document.getElementById('prodName').value = ''; 
            document.getElementById('prodPrice').value = '';
        });
    }
});

window.dropCategory = function(name) {
    storeData.categories = storeData.categories.filter(c => c !== name);
    storeData.products.forEach(p => { 
        if (p.category === name) p.category = "All"; 
    });
    saveToStorage(); 
    renderAdminTools();
};

window.dropProduct = function(id) {
    storeData.products = storeData.products.filter(p => p.id !== id);
    saveToStorage(); 
    renderAdminTools();
};

/* ================= CART TERMINAL HANDLERS ================= */
function renderTerminalCartContents() {
    const container = document.getElementById('cartItemsContainer');
    const totalLabel = document.getElementById('cartTotalSum');
    if (!container) return;
    container.innerHTML = '';

    if (globalShoppingCart.length === 0) {
        container.innerHTML = '<p style="color:var(--text-muted); padding:1rem 0">Empty Cart.</p>';
        totalLabel.textContent = "$0.00";
        return;
    }

    let sum = 0;
    globalShoppingCart.forEach(i => {
        const cost = i.product.price * i.quantity; 
        sum += cost;
        const r = document.createElement('div'); 
        r.className = 'cart-item-row';
        r.innerHTML = `<span>${i.product.name} (x${i.quantity})</span><span>$${cost.toFixed(2)}</span>`;
        container.appendChild(r);
    });

    totalLabel.textContent = `$${sum.toFixed(2)}`;
    
    if (document.getElementById('hiddenManifest')) {
        document.getElementById('hiddenManifest').value = globalShoppingCart.map(i => `${i.product.name} [Qty: ${i.quantity}]`).join(', ');
        document.getElementById('hiddenTotal').value = `$${sum.toFixed(2)}`;
    }
}

function setupCartCheckoutSystem() {
    const form = document.getElementById('checkoutPurchaseTicketForm');
    if (form) form.action = `https://formsubmit.co{storeData.adminTargetEmail}`;

    document.getElementById('clearCartBtn').onclick = () => {
        globalShoppingCart = []; 
        saveCartToStorage(); 
        renderTerminalCartContents();
    };
    
    document.getElementById('proceedCheckoutBtn').onclick = () => {
        if (globalShoppingCart.length === 0) return alert('Cart empty');
        document.getElementById('proceedCheckoutBtn').style.display = 'none';
        document.getElementById('checkoutFormBlock').style.display = 'block';
    };
    
    if (form) {
        form.addEventListener('submit', () => {
            localStorage.removeItem('buyanything_active_cart');
        });
    }
}
