var categories = JSON.parse(localStorage.getItem('ba_categories')) || ['Electronics', 'Apparel', 'Accessories'];
var products = JSON.parse(localStorage.getItem('ba_products')) || [];
var tickets = JSON.parse(localStorage.getItem('ba_tickets')) || [];
var cart = []; 
var currentCategoryFilter = 'All'; 
var isAdmin = false;
var adminSettings = JSON.parse(localStorage.getItem('ba_settings')) || { email: 'admin@buyanything.com' };

function initApp() {
    if(document.getElementById('adminConfigEmail')) {
        document.getElementById('adminConfigEmail').value = adminSettings.email;
    }
    renderMarketCategories(); 
    renderMarketProducts(); 
    renderTickets(); 
    updateCartCounter(); 
    populateAdminDropdown();
    renderAdminManagementLists();
}

function switchView(viewId) {
    var s = document.querySelectorAll('.view-section'); 
    for (var i = 0; i < s.length; i++) s[i].classList.remove('active');
    var t = document.getElementById('view-' + viewId); 
    if(t) t.classList.add('active');
    if(viewId === 'market') { renderMarketCategories(); renderMarketProducts(); }
    if(viewId === 'cart') renderCart(); 
    if(viewId === 'suggestions') renderTickets(); 
    if(viewId === 'admin') { populateAdminDropdown(); renderAdminManagementLists(); }
}

function handleLogin() {
    var pass = document.getElementById('loginPass').value;
    if (pass === 'buyanything123') {
        isAdmin = true; 
        document.getElementById('adminBadge').style.display = 'block'; 
        document.getElementById('adminNavBtn').style.display = 'block';
        document.getElementById('logoutNavBtn').style.display = 'block'; 
        document.getElementById('loginNavBtn').style.display = 'none'; 
        document.getElementById('loginPass').value = '';
        switchView('admin');
    } else { 
        alert('Invalid administration credentials.'); 
    }
}

function handleLogout() {
    isAdmin = false; 
    document.getElementById('adminBadge').style.display = 'none'; 
    document.getElementById('adminNavBtn').style.display = 'none';
    document.getElementById('logoutNavBtn').style.display = 'none'; 
    document.getElementById('loginNavBtn').style.display = 'block'; 
    switchView('market');
}

function saveAdminSettings() { 
    adminSettings.email = document.getElementById('adminConfigEmail').value; 
    localStorage.setItem('ba_settings', JSON.stringify(adminSettings)); 
    alert('System settings synchronized.'); 
}
function renderMarketCategories() {
    var container = document.getElementById('marketCategories'); if(!container) return;
    var html = '<button class="cat-pill ' + (currentCategoryFilter === 'All' ? 'active' : '') + '" onclick="filterCategory(\'All\')">All Products</button>';
    for (var i = 0; i < categories.length; i++) {
        html += '<button class="cat-pill ' + (currentCategoryFilter === categories[i] ? 'active' : '') + '" onclick="filterCategory(\'' + categories[i] + '\')">' + categories[i] + '</button>';
    }
    container.innerHTML = html;
}

function filterCategory(cat) { currentCategoryFilter = cat; renderMarketCategories(); renderMarketProducts(); }
function populateAdminDropdown() { var s = document.getElementById('newItemCategory'); if(s) s.innerHTML = categories.map(function(c) { return '<option value="' + c + '">' + c + '</option>'; }).join(''); }

function addCategory() {
    var input = document.getElementById('newCatName'); if(!input || !input.value.trim()) return alert('Fill fields.');
    var newCat = input.value.trim();
    if(categories.indexOf(newCat) === -1) { categories.push(newCat); localStorage.setItem('ba_categories', JSON.stringify(categories)); }
    input.value = ''; alert('Category injected.'); populateAdminDropdown(); renderMarketCategories(); renderAdminManagementLists();
}

function removeCategory(catName) {
    if(confirm('Purge category: ' + catName + '?')) {
        categories = categories.filter(function(c) { return c !== catName; });
        localStorage.setItem('ba_categories', JSON.stringify(categories));
        if(currentCategoryFilter === catName) currentCategoryFilter = 'All';
        populateAdminDropdown(); renderMarketCategories(); renderMarketProducts(); renderAdminManagementLists();
    }
}

function addCatalogItem() {
    var n = document.getElementById('newItemName').value.trim(); var c = document.getElementById('newItemCategory').value; var p = parseFloat(document.getElementById('newItemPrice').value);
    var img = document.getElementById('newItemImageUrl').value.trim(); if(!n || !c || isNaN(p)) return alert('Provide details.');
    products.push({ id: Date.now(), name: n, category: c, price: p, image: img }); localStorage.setItem('ba_products', JSON.stringify(products));
    document.getElementById('newItemName').value = ''; document.getElementById('newItemPrice').value = ''; document.getElementById('newItemImageUrl').value = '';
    alert('Asset published.'); renderMarketProducts(); renderAdminManagementLists();
}

function removeCatalogItem(id) {
    if(confirm('Purge asset?')) {
        products = products.filter(function(p) { return p.id !== id; }); localStorage.setItem('ba_products', JSON.stringify(products));
        renderMarketProducts(); renderAdminManagementLists();
    }
}

function renderAdminManagementLists() {
    var catList = document.getElementById('adminCategoryList'); var prodList = document.getElementById('adminProductList');
    if(catList) catList.innerHTML = categories.length === 0 ? '<p>None</p>' : categories.map(function(c) { return '<div style="display:flex; justify-content:space-between; padding:8px; border-bottom:1px solid var(--border-line);"><span>' + c + '</span><button onclick="removeCategory(\'' + c + '\')" style="color:#ef4444; background:none; border:none; cursor:pointer; font-weight:700;">Delete</button></div>'; }).join('');
    if(prodList) prodList.innerHTML = products.length === 0 ? '<p>None</p>' : products.map(function(p) { return '<div style="display:flex; justify-content:space-between; padding:8px; border-bottom:1px solid var(--border-line);"><span>' + p.name + '</span><button onclick="removeCatalogItem(' + p.id + ')" style="color:#ef4444; background:none; border:none; cursor:pointer; font-weight:700;">Delete</button></div>'; }).join('');
}

function renderMarketProducts() {
    var container = document.getElementById('marketProducts'); if(!container) return;
    var visibleCategories = currentCategoryFilter === 'All' ? categories : [currentCategoryFilter]; var html = ''; var count = 0;
    for (var i = 0; i < visibleCategories.length; i++) {
        var cat = visibleCategories[i]; var f = products.filter(function(p) { return p.category === cat; });
        if (f.length > 0) {
            count += f.length; html += '<div style="grid-column:1/-1; margin:25px 0 10px 0; border-bottom:1px solid var(--border-line);"><h2 style="color:white;">' + cat + '</h2></div>';
            for (var j = 0; j < f.length; j++) {
                var imgHtml = f[j].image ? '<img src="' + f[j].image + '" class="product-img">' : '<div class="product-placeholder">📦 <span>No Image</span></div>';
                html += '<div class="product-card"><div class="product-img-wrapper">' + imgHtml + '</div><div class="product-info"><div><div class="cat-tag">' + f[j].category + '</div><h4>' + f[j].name + '</h4></div><div class="product-footer"><div class="price">$' + f[j].price.toFixed(2) + '</div><button class="btn-action" onclick="addToCart(' + f[j].id + ')">Add to Cart</button></div></div></div>';
            }
        }
    }
    container.innerHTML = count === 0 ? '<div class="empty-state"><h3>Catalog Empty</h3></div>' : html;
}
function addToCart(id) { var p = products.find(function(x) { return x.id === id; }); if(p) { cart.push(p); updateCartCounter(); } }
function updateCartCounter() { var c = document.getElementById('cartCount'); if(c) c.innerText = cart.length; }

function renderCart() {
    var container = document.getElementById('cartItemsList'); var totalSpan = document.getElementById('cartTotal'); if(!container || !totalSpan) return;
    if(cart.length === 0) { container.innerHTML = '<p>Empty.</p>'; totalSpan.innerText = '0.00'; return; }
    var total = 0; var html = '';
    for (var i = 0; i < cart.length; i++) { total += cart[i].price; html += '<div class="cart-item"><div><strong>' + cart[i].name + '</strong></div><div><span>$' + cart[i].price.toFixed(2) + '</span><button onclick="removeFromCart(' + i + ')" style="color:#ef4444; border:none; background:none; margin-left:15px; cursor:pointer;">Remove</button></div></div>'; }
    container.innerHTML = html; totalSpan.innerText = total.toFixed(2);
}

function removeFromCart(index) { cart.splice(index, 1); updateCartCounter(); renderCart(); }

function submitOrder() {
    var n = document.getElementById('orderName').value.trim(); var a = document.getElementById('orderAddress').value.trim(); if(!n || !a || cart.length === 0) return alert('Provide specifications.');
    var arr = []; var totalVal = 0; for (var i = 0; i < cart.length; i++) { arr.push('- ' + cart[i].name + ' ($' + cart[i].price.toFixed(2) + ')'); totalVal += cart[i].price; }
    window.location.href = 'mailto:' + adminSettings.email + '?subject=Order&body=' + encodeURIComponent('Order:\nName: ' + n + '\nAddress: ' + a + '\n\nItems:\n' + arr.join('\n') + '\n\nTotal: $' + totalVal.toFixed(2));
    cart = []; updateCartCounter(); switchView('market'); alert('Order formatted.');
}

function createTicket() {
    var t = document.getElementById('suggestName').value.trim(); var m = document.getElementById('suggestDesc').value.trim(); if(!t || !m) return alert('Provide full tracking values.');
    tickets.push({ id: Date.now(), title: t, message: m, replies: [] }); localStorage.setItem('ba_tickets', JSON.stringify(tickets));
    document.getElementById('suggestName').value = ''; document.getElementById('suggestDesc').value = ''; alert('Ticket created.');
}

function renderTickets() {
    var userContainer = document.getElementById('userTicketMessage'); var adminContainer = document.getElementById('adminChatDashboard'); if(!userContainer || !adminContainer) return;
    if (!isAdmin) { userContainer.style.display = 'block'; adminContainer.style.display = 'none'; return; }
    userContainer.style.display = 'none'; adminContainer.style.display = 'block';
    if(tickets.length === 0) { adminContainer.innerHTML = '<p>No ticket history nodes discovered.</p>'; return; }
    
    // Your exact custom streamlined chat template data binding preference:
    adminContainer.innerHTML = tickets.map(function(t) {
        var chatHistoryHtml = ''; 
        if(t.replies && t.replies.length > 0) { 
            chatHistoryHtml = '' + t.replies.map(function(r) { return '' + r.sender + ' • ' + r.time + ' ' + r.text + ''; }).join('') + ''; 
        }
        var chatActionForm = '<div style="margin-top:15px; display:flex; gap:10px;"><input type="text" id="chat-reply-input-' + t.id + '" placeholder="Type message..." style="flex:1; padding:10px; background:var(--bg-canvas); border:1px solid var(--border-line); color:white; border-radius:6px;"><button class="btn-action" onclick="submitChatReply(' + t.id + ')" style="width:auto; padding:10px 20px; border-radius:6px;">Send Message</button></div>';
        return 'Core Hub Stream Code: #' + t.id + ' LIVE ADMIN CHAT ARRAY SYNCED Initial Request Concept: ' + t.title + ' ' + t.message + ' ' + chatHistoryHtml + chatActionForm + '';
    }).join('');
}

function submitChatReply(id) {
    var val = document.getElementById('chat-reply-input-' + id).value.trim(); if(!val) return;
    var target = tickets.find(function(t) { return t.id === id; }); 
    if(target) {
        if(!target.replies) target.replies = [];
        var timestamp = new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
        target.replies.push({ sender: 'AUTHORIZED_ADMIN_NODE', time: timestamp, text: val });
        localStorage.setItem('ba_tickets', JSON.stringify(tickets)); 
        renderTickets();
    }
}

window.onload = initApp;
