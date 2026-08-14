```javascript
// Local Database Setup (keeps data intact on refresh)
let storeData = JSON.parse(localStorage.getItem('buyanything_db')) || {
    categories: ["All", "Electronics", "Apparel", "Home Decor"],
    products: [
        { id: 1, name: "Smart Watch", price: 199.99, category: "Electronics", img: "https://unsplash.com" },
        { id: 2, name: "Minimalist Backpack", price: 79.50, category: "Apparel", img: "https://unsplash.com" }
    ]
};

let currentCategoryFilter = "All";
let isAdminAuthenticated = false;

// DOM Elements
const adminControlBtn = document.getElementById('adminControlBtn');
const loginModal = document.getElementById('loginModal');
const closeModalBtn = document.getElementById('closeModalBtn');
const loginForm = document.getElementById('loginForm');
const adminPanel = document.getElementById('adminPanel');
const useAIImageCheckbox = document.getElementById('useAIImage');
const manualUrlBox = document.getElementById('manualUrlBox');

// App Initialization
window.addEventListener('DOMContentLoaded', () => {
    saveToStorage();
    renderShopTabs();
    renderShopProducts();
    setupAdminViewControls();
});

function saveToStorage() {
    localStorage.setItem('buyanything_db', JSON.stringify(storeData));
}

// Toggle manual image input configuration if AI checkmark is unchecked
useAIImageCheckbox.addEventListener('change', (e) => {
    manualUrlBox.style.display = e.target.checked ? 'none' : 'block';
});

// Admin Panel Access Authentication Gate
adminControlBtn.addEventListener('click', () => {
    if (isAdminAuthenticated) {
        adminPanel.scrollIntoView({ behavior: 'smooth' });
    } else {
        loginModal.style.display = 'flex';
    }
});

closeModalBtn.addEventListener('click', () => loginModal.style.display = 'none');

loginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const passwordInput = document.getElementById('password').value;
    
    // Exact password check asked by user
    if (passwordInput === "buyanything123") {
        isAdminAuthenticated = true;
        loginModal.style.display = 'none';
        adminPanel.style.display = 'block';
        setupAdminViewControls();
        adminPanel.scrollIntoView({ behavior: 'smooth' });
        alert("Access Granted. Admin controls unlocked at bottom of screen.");
    } else {
        alert("Invalid security password code.");
    }
    document.getElementById('password').value = '';
});

function logoutAdmin() {
    isAdminAuthenticated = false;
    adminPanel.style.display = 'none';
    window.scrollTo({top: 0, behavior: 'smooth'});
}

/* ================= RENDER SHOP INTERFACE ================= */
function renderShopTabs() {
    const tabsContainer = document.getElementById('categoriesTabs');
    tabsContainer.innerHTML = '';
    
    storeData.categories.forEach(cat => {
        const btn = document.createElement('button');
        btn.className = `tab-btn ${currentCategoryFilter === cat ? 'active' : ''}`;
        btn.textContent = cat;
        btn.onclick = () => {
            currentCategoryFilter = cat;
            renderShopTabs();
            renderShopProducts();
        };
        tabsContainer.appendChild(btn);
    });
}

function renderShopProducts() {
    const grid = document.getElementById('productsGrid');
    grid.innerHTML = '';

    const filtered = currentCategoryFilter === "All" 
        ? storeData.products 
        : storeData.products.filter(p => p.category === currentCategoryFilter);

    if (filtered.length === 0) {
        grid.innerHTML = `<p style="grid-column: 1/-1; text-align: center; color: var(--text-muted); padding: 3rem 0;">No items found in stock for this category.</p>`;
        return;
    }

    filtered.forEach(prod => {
        const card = document.createElement('div');
        card.className = 'product-card';
        card.innerHTML = `
            <img class="product-img" src="${prod.img}" alt="${prod.name}" onerror="this.src='https://unsplash.com'">
            <div class="product-info">
                <div class="product-cat">${prod.category}</div>
                <div class="product-name">${prod.name}</div>
                <div class="product-price">$${Number(prod.price).toFixed(2)}</div>
            </div>
        `;
        grid.appendChild(card);
    });
}

/* ================= ADMIN CONTROLS MANAGER ================= */
function setupAdminViewControls() {
    // Populate dropdown selection inside form
    const select = document.getElementById('prodCategory');
    select.innerHTML = '';
    storeData.categories.filter(c => c !== "All").forEach(cat => {
        const opt = document.createElement('option');
        opt.value = cat;
        opt.textContent = cat;
        select.appendChild(opt);
    });

    renderAdminCategoriesLists();
    renderAdminProductsLists();
}

function renderAdminCategoriesLists() {
    const list = document.getElementById('adminCategoriesList');
    list.innerHTML = '<h4>Active Categories</h4>';
    
    storeData.categories.filter(c => c !== "All").forEach(cat => {
        const item = document.createElement('div');
        item.className = 'list-item';
        item.innerHTML = `
            <span>${cat}</span>
            <button class="delete-btn" onclick="deleteCategory('${cat}')"><i class="fa-solid fa-trash"></i></button>
        `;
        list.appendChild(item);
    });
}

function renderAdminProductsLists() {
    const list = document.getElementById('adminProductsList');
    list.innerHTML = '<h4>Active Inventory Items</h4>';
    
    storeData.products.forEach(prod => {
        const item = document.createElement('div');
        item.className = 'list-item';
        item.innerHTML = `
            <div>
                <strong>${prod.name}</strong> <small style="color:var(--text-muted)">(${prod.category})</small>
                <div><span style="color: var(--primary); font-weight:600">$${Number(prod.price).toFixed(2)}</span></div>
            </div>
            <button class="delete-btn" onclick="deleteProduct(${prod.id})"><i class="fa-solid fa-trash"></i></button>
        `;
        list.appendChild(item);
    });
}

// Form Handlers
document.getElementById('addCategoryForm').addEventListener('submit', (e) => {
    e.preventDefault();
    const nameInput = document.getElementById('newCategoryName').value.trim();
    
    if (nameInput && !storeData.categories.includes(nameInput)) {
        storeData.categories.push(nameInput);
        saveToStorage();
        renderShopTabs();
        setupAdminViewControls();
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
        // AI Image generation concept: dynamically fetches contextually correct high quality source image assets
        // encoded by semantic keywords directly parsed out of your custom product names.
        const queryKeyword = encodeURIComponent(name);
        imgUrl = `https://unsplash.com{queryKeyword},product`;
    } else {
        imgUrl = document.getElementById('prodImgUrl').value.trim() || 'https://unsplash.com';
    }

    const newProd = {
        id: Date.now(),
        name,
        price,
        category,
        img: imgUrl
    };

    storeData.products.push(newProd);
    saveToStorage();
    renderShopProducts();
    renderAdminProductsLists();
    
    // Reset fields
    document.getElementById('prodName').value = '';
    document.getElementById('prodPrice').value = '';
}


// Deletion Logic Engine
function deleteCategory(catName) {
    if(confirm(`Are you sure you want to delete category "${catName}"? This will untag its items.`)) {
        storeData.categories = storeData.categories.filter(c => c !== catName);
        // Switch deleted products back to standard "All" category tags
        storeData.products.forEach(p => {
            if(p.category === catName) p.category = "All";
        });
        saveToStorage();
        renderShopTabs();
        setupAdminViewControls();
        renderShopProducts();
    }
}

function deleteProduct(id) {
    if(confirm("Delete this inventory product item entry?")) {
        storeData.products = storeData.products.filter(p => p.id !== id);
        saveToStorage();
        renderShopProducts();
        renderAdminProductsLists();
    }
}
