// Local Database State Initialization Engine
let storeData = JSON.parse(localStorage.getItem('buyanything_premium_db')) || {
    adminTargetEmail: "admin@buyanything123.com",
    emailJsPublicKey: "",
    categories: ["All", "Snacks", "Drinks", "School Supplies"],
    products: [
        { id: 101, name: "Premium Notebook", price: 4.99, category: "School Supplies", img: "https://unsplash.com" },
        { id: 102, name: "Energy Drink", price: 2.50, category: "Drinks", img: "https://unsplash.com" }
    ]
};

// Cross-Session Application Variables
let globalShoppingCart = JSON.parse(localStorage.getItem('buyanything_active_cart')) || [];
let selectedCategoryFilter = "All";

// Save states back into browser storage profiles
function saveToStorage() {
    localStorage.setItem('buyanything_premium_db', JSON.stringify(storeData));
}
function saveCartToStorage() {
    localStorage.setItem('buyanything_active_cart', JSON.stringify(globalShoppingCart));
}

/* ================= CENTRAL DOM INTERFACE ROUTER ================= */
window.addEventListener('DOMContentLoaded', () => {
    const path = window.location.pathname;

    // Route 1: Public Window Catalog Setup
    if (path.includes('index.html') || path === '/' || !path.includes('.html')) {
        renderShopFilterTabs();
        renderStoreGridItems();
        updateCartCountBadge();
        setupSupportTicketHandler();
    }
    
    // Route 2: Backend Board Panel Setup
    if (path.includes('admin.html')) {
        setupAdminDashboardGate();
    }

    // Route 3: Shopping Ticket Terminal Setup
    if (path.includes('cart.html')) {
        renderCartModalContents();
        setupCartPageInteractions();
    }
});

/* ================= FRONT STOREFRONT COMPONENT RENDERERS ================= */
function renderShopFilterTabs() {
    const tabsBox = document.getElementById('categoriesTabs');
    if (!tabsBox) return;
    tabsBox.innerHTML = '';
    
    storeData.categories.forEach(cat => {
        const tab = document.createElement('button');
        tab.className = `tab-btn ${selectedCategoryFilter === cat ? 'active' : ''}`;
        tab.textContent = cat;
        tab.onclick = () => {
            selectedCategoryFilter = cat;
            renderShopFilterTabs();
            renderStoreGridItems();
        };
        tabsBox.appendChild(tab);
    });
}

function renderStoreGridItems() {
    const grid = document.getElementById('productsGrid');
    if (!grid) return;
    grid.innerHTML = '';

    const viewItems = selectedCategoryFilter === "All" 
        ? storeData.products 
        : storeData.products.filter(p => p.category === selectedCategoryFilter);

    if (viewItems.length === 0) {
        grid.innerHTML = `<p style="grid-column: 1/-1; text-align: center; color: var(--text-muted); padding: 4rem 0;">No items in stock under this category.</p>`;
        return;
    }

    viewItems.forEach(prod => {
        const itemCard = document.createElement('div');
        itemCard.className = 'product-card';
        itemCard.innerHTML = `
            <img class="product-img" src="${prod.img}" alt="${prod.name}" onerror="this.src='https://unsplash.com'">
            <div class="product-info">
                <div>
                    <div class="product-cat">${prod.category}</div>
                    <div class="product-name">${prod.name}</div>
                </div>
                <div class="product-meta">
                    <div class="product-price">$${Number(prod.price).toFixed(2)}</div>
                    <button class="add-cart-btn" onclick="addItemToShoppingCart(${prod.id})"><i class="fa-solid fa-cart-plus"></i> Add</button>
                </div>
            </div>
        `;
        grid.appendChild(itemCard);
    });
}

function addItemToShoppingCart(prodId) {
    const targetProduct = storeData.products.find(p => p.id === prodId);
    if (!targetProduct) return;

    const existingCartItem = globalShoppingCart.find(item => item.product.id === prodId);
    if (existingCartItem) {
        existingCartItem.quantity += 1;
    } else {
        globalShoppingCart.push({ product: targetProduct, quantity: 1 });
    }
    saveCartToStorage();
    updateCartCountBadge();
    alert(`Added ${targetProduct.name} to your basket cart selection!`);
}

function updateCartCountBadge() {
    const countBadge = document.getElementById('cartCount');
    if (!countBadge) return;
    countBadge.textContent = globalShoppingCart.reduce((sum, item) => sum + item.quantity, 0);
}

/* ================= CART PAGE LOGIC ACTIONS TERMINAL ================= */
function renderCartModalContents() {
    const container = document.getElementById('cartItemsContainer');
    const totalSumLabel = document.getElementById('cartTotalSum');
    if (!container || !totalSumLabel) return;
    container.innerHTML = '';
    
    if (globalShoppingCart.length === 0) {
        container.innerHTML = `<p style="color:var(--text-muted); text-align:center; padding: 1.5rem 0;">Your shopping cart is currently empty.</p>`;
        totalSumLabel.textContent = "$0.00";
        return;
    }

    let computationTotal = 0;
    globalShoppingCart.forEach(item => {
        const itemCost = item.product.price * item.quantity;
        computationTotal += itemCost;
        
        const row = document.createElement('div');
        row.className = 'cart-item-row';
        row.innerHTML = `
            <div>
                <strong>${item.product.name}</strong> <small style="color:var(--text-muted)">(x${item.quantity})</small>
            </div>
            <div style="font-weight:600;">$${itemCost.toFixed(2)}</div>
        `;
        container.appendChild(row);
    });
    totalSumLabel.textContent = `$${computationTotal.toFixed(2)}`;
}

function setupCartPageInteractions() {
    document.getElementById('clearCartBtn').addEventListener('click', () => {
        globalShoppingCart = [];
        saveCartToStorage();
        renderCartModalContents();
    });

    document.getElementById('proceedCheckoutBtn').addEventListener('click', () => {
        if(globalShoppingCart.length === 0) {
            alert("Your shopping cart is empty!");
            return;
        }
        document.getElementById('proceedCheckoutBtn').style.display = 'none';
        document.getElementById('checkoutFormBlock').style.display = 'block';
    });

    // Form submission dispatches purchase emails
    document.getElementById('checkoutPurchaseTicketForm').addEventListener('submit', (e) => {
        e.preventDefault();
        const buyer = document.getElementById('orderBuyerName').value.trim();
        const campus = document.getElementById('orderSchoolCampus').value.trim();
        const room = document.getElementById('orderLocationRoom').value.trim();
        const deliveryTime = document.getElementById('orderTargetTime').value;

        let itemsManifest = globalShoppingCart.map(i => `- ${i.product.name} (Qty: ${i.quantity})`).join('\n');
        let orderTotal = document.getElementById('cartTotalSum').textContent;

        const emailMessagePayload = `
======= NEW SCHOOL DELIVERY PURCHASE ORDER TICKET =======
Buyer Name: ${buyer}
Campus Target Location: ${campus}
Assigned Classroom Room Number: ${room}
Requested Handoff Delivery Schedule Time: ${deliveryTime}

--- PURCHASED INVENTORY ITEMS ---
${itemsManifest}
---------------------------------
Total Statement Balance: ${orderTotal}
=========================================================`;

        dispatchSystemNotification(`School Purchase Ticket [${buyer}]`, emailMessagePayload, () => {
            alert(`Purchase Ticket Filed! Deliveries will drop-off at ${deliveryTime}.`);
            globalShoppingCart = [];
            saveCartToStorage();
            window.location.href = 'index.html';
        });
    });
}

/* ================= BACKEND MANAGEMENT ACTIONS ================= */
function setupAdminDashboardGate() {
    const loginForm = document.getElementById('loginForm');
    const authGate = document.getElementById('adminAuthGate');
    const workspace = document.getElementById('adminPanelWorkspace');

    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        // Secure token asset passcode requested by user
        if (document.getElementById('password').value === "buyanything123") {
            authGate.style.display = 'none';
            workspace.style.display = 'block';
            syncAdminFormFields();
            populateAdminDashboardControls();
        } else {
            alert("Invalid security password code.");
        }
        document.getElementById('password').value = '';
    });

    document.getElementById('exitControlBtn').addEventListener('click', () => {
        window.location.href = 'index.html';
    });
}

function syncAdminFormFields() {
    document.getElementById('adminAlertEmail').value = storeData.adminTargetEmail || "";
    document.getElementById('emailJsKey').value = storeData.emailJsPublicKey || "";
    
    const checkAI = document.getElementById('useAIImage');
    const urlBox = document.getElementById('manualUrlBox');
    checkAI.addEventListener('change', (e) => {
        urlBox.style.display = e.target.checked ? 'none' : 'block';
    });
}

function populateAdminDashboardControls() {
    // Save master email routing coordinates
    document.getElementById('saveSystemTargetBtn').onclick = () => {
        storeData.adminTargetEmail = document.getElementById('adminAlertEmail').value.trim();
        storeData.emailJsPublicKey = document.getElementById('emailJsKey').value.trim();
        saveToStorage();
        alert("Operational notification routes saved successfully!");
    };

    // Render Categories
    const catSelect = document.getElementById('prodCategory');
    const catList = document.getElementById('adminCategoriesList');
catSelect.innerHTML = '';
catList.innerHTML = '<h4>Active Categories</h4>';

storeData.categories.forEach(cat => {
    if (cat !== "All") {
        const opt = document.createElement('option');
        opt.value = cat; 
        opt.textContent = cat;
        catSelect.appendChild(opt);

        const row = document.createElement('div');
        row.className = 'list-item';
        row.innerHTML = `<span>${cat}</span><button class="delete-btn" onclick="deleteGlobalCategory('${cat}')"><i class="fa-solid fa-trash"></i></button>`;
        catList.appendChild(row);
    }
});

// Render Inventory
const prodList = document.getElementById('adminProductsList');
prodList.innerHTML = '<h4>Active Inventory Items</h4>';

storeData.products.forEach(p => {
    const row = document.createElement('div');
    row.className = 'list-item';
    row.innerHTML = `<div><strong>${p.name}</strong> <small>($${p.price.toFixed(2)})</small></div><button class="delete-btn" onclick="deleteGlobalProduct(${p.id})"><i class="fa-solid fa-trash"></i></button>`;
    prodList.appendChild(row);
});

// Global administration add actions
window.addEventListener('DOMContentLoaded', () => {
    if (!window.location.pathname.includes('admin.html')) return;

    document.getElementById('addCategoryForm').addEventListener('submit', (e) => {
        e.preventDefault();
        const name = document.getElementById('newCategoryName').value.trim();
        if (name && !storeData.categories.includes(name)) {
            storeData.categories.push(name);
            saveToStorage();
            populateAdminDashboardControls();
            document.getElementById('newCategoryName').value = '';
        }
    });

    document.getElementById('addProductForm').addEventListener('submit', (e) => {
        e.preventDefault();
        const name = document.getElementById('prodName').value.trim();
        const price = parseFloat(document.getElementById('prodPrice').value);
        const category = document.getElementById('prodCategory').value;
        
        let imgUrl = "";
        if (document.getElementById('useAIImage').checked) {
            // Dynamic context parsing image generator configuration rules
            imgUrl = `https://unsplash.com{encodeURIComponent(name)},product`;
        } else {
            imgUrl = document.getElementById('prodImgUrl').value.trim() || 'https://unsplash.com';
        }

        storeData.products.push({ id: Date.now(), name, price, category, img: imgUrl });
        saveToStorage();
        populateAdminDashboardControls();
        document.getElementById('prodName').value = '';
        document.getElementById('prodPrice').value = '';
    });
});

window.deleteGlobalCategory = function(catName) {
    if (confirm(`Delete category "${catName}"?`)) {
        storeData.categories = storeData.categories.filter(c => c !== catName);
        storeData.products.forEach(p => { 
            if (p.category === catName) p.category = "All"; 
        });
        saveToStorage();
        populateAdminDashboardControls();
    }
};

window.deleteGlobalProduct = function(id) {
    if (confirm("Erase item from stock inventory?")) {
        storeData.products = storeData.products.filter(p => p.id !== id);
        saveToStorage();
        populateAdminDashboardControls();
    }
};

/* ================= CENTRAL COMMUNICATIONS AND SUPPORT INBOX ROUTER ================= */
function setupSupportTicketHandler() {
    document.getElementById('supportTicketForm').addEventListener('submit', (e) => {
        e.preventDefault();
        const user = document.getElementById('ticketUser').value.trim();
        const email = document.getElementById('ticketEmail').value.trim();
        const msg = document.getElementById('ticketMsg').value.trim();

        const supportTextPayload = `
======= NEW GENERAL HELP DESK TICKET =======
Filer Submitter Name: ${user}
Filer Contact Coordinates: ${email}

--- MESSAGE BODY ---
"${msg}"
============================================`;

        dispatchSystemNotification(`General Help Desk Ticket from [${user}]`, supportTextPayload, () => {
            alert(`Thank you ${user}, your support request has been logged successfully!`);
            document.getElementById('supportTicketForm').reset();
        });
    });
}

function dispatchSystemNotification(subjectLine, textPayload, successCallback) {
    console.log(`%c[Outbound Email Outbox Dispatched to Target: ${storeData.adminTargetEmail}]`, "color: #2563eb; font-weight: bold;");
    console.log(textPayload);

    if (storeData.emailJsPublicKey && typeof emailjs !== 'undefined') {
        // Standard live production integration API calls if keys exist
        emailjs.send("default_service", "template_placeholder", {
            to_email: storeData.adminTargetEmail,
            subject: subjectLine,
            message: textPayload
        }).then(() => { 
            successCallback(); 
        }).catch((err) => {
            console.error(err);
            alert("EmailJS pipeline error. Logging to console. Running fallback trigger code.");
            successCallback();
        });
    } else {
        // Simulation mode logging behavior for developers
        alert(`[Simulation Mode Route Active]\nNotification email has been processed out to designated target box: ${storeData.adminTargetEmail}\n\nOpen up the browser inspect developer tool dashboard logs console to check parameters formatting structures.`);
        successCallback();
    }
}
