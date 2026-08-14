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
}

function switchView(viewId) {
    var s = document.querySelectorAll('.view-section'); 
    for (var i = 0; i < s.length; i++) s[i].classList.remove('active');
    var t = document.getElementById('view-' + viewId); 
    if(t) t.classList.add('active');
    if(viewId === 'market') { renderMarketCategories(); renderMarketProducts(); }
    if(viewId === 'cart') renderCart(); 
    if(viewId === 'suggestions') renderTickets(); 
    if(viewId === 'admin') populateAdminDropdown();
}

function handleLogin() {
    var pass = document.getElementById('loginPass').value;
    if (pass === 'buyanything123') {
        isAdmin = true; 
        document.getElementById('adminBadge').style.display = 'block'; 
        document.getElementById('adminNavBtn').style.display = 'block';
        document.getElementById('logoutNavBtn').style.display = 'block'; 
        document.getElementById('loginNavBtn').style.display = 'none'; 
        switchView('admin');
    } else { 
        alert('Invalid administrative credentials.'); 
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
    alert('Routing email updated.'); 
}

function renderMarketCategories() {
    var container = document.getElementById('marketCategories'); 
    if(!container) return;
    var html = '<button class="cat-pill ' + (currentCategoryFilter === 'All' ? 'active' : '') + '" onclick="filterCategory(\'All\')">All Products</button>';
    for (var i = 0; i < categories.length; i++) {
        var cat = categories[i];
        html += '<button class="cat-pill ' + (currentCategoryFilter === cat ? 'active' : '') + '" onclick="filterCategory(\'' + cat + '\')">' + cat + '</button>';
    }
    container.innerHTML = html;
}

function filterCategory(cat) { 
    currentCategoryFilter = cat; 
    renderMarketCategories(); 
    renderMarketProducts(); 
}

function populateAdminDropdown() { 
    var s = document.getElementById('newItemCategory'); 
    if(s) s.innerHTML = categories.map(function(c) { return '<option value="' + c + '">' + c + '</option>'; }).join(''); 
}
function addCategory() {
    var input = document.getElementById('newCatName'); 
    if(!input || !input.value.trim()) return alert('Fill fields.');
    categories.push(input.value.trim()); 
    localStorage.setItem('ba_categories', JSON.stringify(categories)); 
    input.value = ''; 
    alert('Category injected.'); 
    populateAdminDropdown(); 
    renderMarketCategories();
}

function addCatalogItem() {
    var n = document.getElementById('newItemName').value.trim(); 
    var c = document.getElementById('newItemCategory').value; 
    var p = parseFloat(document.getElementById('newItemPrice').value);
    var img = document.getElementById('newItemImageUrl').value.trim(); 
    if(!n || !c || isNaN(p)) return alert('Provide full asset data details.');
    products.push({ id: Date.now(), name: n, category: c, price: p, image: img }); 
    localStorage.setItem('ba_products', JSON.stringify(products));
    document.getElementById('newItemName').value = ''; 
    document.getElementById('newItemPrice').value = ''; 
    document.getElementById('newItemImageUrl').value = ''; 
    alert('Asset committed.'); 
    renderMarketProducts();
}

function renderMarketProducts() {
    var container = document.getElementById('marketProducts'); 
    if(!container) return; var f = [];
    for (var i = 0; i < products.length; i++) { if (currentCategoryFilter === 'All' || products[i].category === currentCategoryFilter) f.push(products[i]); }
    if(f.length === 0) return container.innerHTML = '<div class="empty-state"><h3>Catalog clear</h3><p>Access master ops deck to configure custom components.</p></div>';
    container.innerHTML = f.map(function(p) {
        var imgHtml = p.image ? '<img src="' + p.image + '" class="product-img" alt="Product Image">' : '<div class="product-placeholder">📦 <span>No Image Asset Link</span></div>';
        return '<div class="product-card"><div class="product-img-wrapper">' + imgHtml + '</div><div class="product-info"><div><div class="cat-tag">' + p.category + '</div><h4>' + p.name + '</h4></div><div class="product-footer"><div class="price">$' + p.price.toFixed(2) + '</div><button class="btn-action" onclick="addToCart(' + p.id + ')">Add to Cart</button></div></div></div>';
    }).join('');
}

function addToCart(id) { var p = products.find(function(x) { return x.id === id; }); if(p) { cart.push(p); updateCartCounter(); } }
function updateCartCounter() { var c = document.getElementById('cartCount'); if(c) c.innerText = cart.length; }

function renderCart() {
    var container = document.getElementById('cartItemsList'); var totalSpan = document.getElementById('cartTotal'); if(!container || !totalSpan) return;
    if(cart.length === 0) { container.innerHTML = '<p style="padding:20px; font-weight:600; color:var(--text-muted);">Order buffer is clear.</p>'; totalSpan.innerText = '0.00'; return; }
    var total = 0; var html = '';
    for (var i = 0; i < cart.length; i++) { total += cart[i].price; html += '<div class="cart-item"><div><strong style="font-size:18px;">' + cart[i].name + '</strong><br><span style="font-size:13px; color:var(--text-muted); font-weight:600;">' + cart[i].category + '</span></div><div style="display:flex; align-items:center; gap:20px;"><span style="font-size:18px; font-weight:700; color:var(--primary);">$' + cart[i].price.toFixed(2) + '</span><button onclick="removeFromCart(' + i + ')" style="color:#ef4444; border:none; background:none; cursor:pointer; font-weight:700; font-size:15px;">Remove</button></div></div>'; }
    container.innerHTML = html; totalSpan.innerText = total.toFixed(2);
}

function removeFromCart(index) { cart.splice(index, 1); updateCartCounter(); renderCart(); }

function submitOrder() {
    var n = document.getElementById('orderName').value.trim(); var a = document.getElementById('orderAddress').value.trim(); if(!n || !a || cart.length === 0) return alert('Provide elements.');
    var arr = []; var totalVal = 0; for (var i = 0; i < cart.length; i++) { arr.push('- ' + cart[i].name + ' ($' + cart[i].price.toFixed(2) + ')'); totalVal += cart[i].price; }
    window.location.href = 'mailto:' + adminSettings.email + '?subject=Purchase Order&body=' + encodeURIComponent('Order:\nName: ' + n + '\nAddress: ' + a + '\n\nItems:\n' + arr.join('\n') + '\n\nTotal Balance: $' + totalVal.toFixed(2));
    cart = []; updateCartCounter(); switchView('market'); alert('Order structured. Dispatch system mail client tools.');
}

function createTicket() {
    var t = document.getElementById('suggestName').value.trim(); var m = document.getElementById('suggestDesc').value.trim(); if(!t || !m) return alert('Provide data values.');
    tickets.push({ id: Date.now(), title: t, message: m, reply: "" }); localStorage.setItem('ba_tickets', JSON.stringify(tickets));
    document.getElementById('suggestName').value = ''; document.getElementById('suggestDesc').value = ''; renderTickets(); alert('Ticket synchronized.');
}

function renderTickets() {
    var container = document.getElementById('ticketContainer'); if(!container) return; if(tickets.length === 0) return container.innerHTML = '<div class="empty-state"><h3>No active community logging records found</h3></div>';
    container.innerHTML = tickets.map(function(t) {
        var rb = t.reply ? '<div class="admin-reply-box"><strong>Resolution Output:</strong> ' + t.reply + '</div>' : '';
        var aa = (isAdmin && !t.reply) ? '<div style="margin-top:20px; display:flex; gap:15px;"><input type="text" id="reply-input-' + t.id + '" placeholder="Type response..." style="flex:1; padding:12px; border:1px solid var(--border-line); background:var(--bg-canvas); color:white; border-radius:6px;"><button class="btn-action" onclick="submitReply(' + t.id + ')" style="width:auto; padding:12px 25px; border-radius:6px;">Push Reply</button></div>' : '';
        return '<div class="ticket-card ' + (t.reply ? 'answered' : 'pending') + '"><div class="ticket-header"><span>Audit Log Code: #' + t.id + '</span><span style="color:' + (t.reply ? 'var(--accent)' : '#f59e0b') + '">' + (t.reply ? 'Confirmed' : 'Pending Review') + '</span></div><div style="margin: 15px 0 10px 0; font-size:18px;"><strong>Concept Suggestion:</strong> ' + t.title + '</div><p style="color:var(--text-muted); font-size:15px; background:rgba(0,0,0,0.2); padding:15px; border-radius:var(--radius-sm); border:1px solid var(--border-line); line-height:1.6;">' + t.message + '</p>' + rb + aa + '</div>';
    }).join('');
}

function submitReply(id) {
    var val = document.getElementById('reply-input-' + id).value.trim(); if(!val) return;
    var target = tickets.find(function(t) { return t.id === id; }); if(target) { target.reply = val; localStorage.setItem('ba_tickets', JSON.stringify(tickets)); renderTickets(); }
}

window.onload = initApp;
