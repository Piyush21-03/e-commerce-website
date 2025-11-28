/* Daily Store - script.js
   - product data
   - header injection
   - cart (localStorage)
   - search
   - login/signup (localStorage)
   - page-specific renderers
*/

(() => {
  // ======= Data ========
  const PRODUCTS = [
    { id: "p1", name: "Everyday Tee", price: 499, desc: "Comfortable cotton tee for daily wear."},
    { id: "p2", name: "Comfy Hoodie", price: 1299, desc: "Cozy hoodie with soft inner fleece."},
    { id: "p3", name: "Slim Jeans", price: 1799, desc: "Modern slim fit denim for all occasions."},
    { id: "p4", name: "Sneaker Run", price: 2399, desc: "Lightweight sneakers for everyday use."},
    { id: "p5", name: "Classic Watch", price: 2999, desc: "Minimal analog watch with leather strap."},
    { id: "p6", name: "Canvas Bag", price: 899, desc: "Sturdy canvas bag — carry your essentials."},
    { id: "p7", name: "Sunglasses", price: 699, desc: "Polarized shades with UV protection."},
    { id: "p8", name: "Wireless Earbuds", price: 2199, desc: "Crystal clear sound and long battery."},
    { id: "p9", name: "Water Bottle", price: 399, desc: "Insulated bottle keeps drinks cool."},
    { id: "p10", name: "Desk Lamp", price: 799, desc: "LED lamp with adjustable brightness."},
    { id: "p11", name: "Notebook", price: 199, desc: "Hardcover notebook for daily notes."},
    { id: "p12", name: "Phone Case", price: 499, desc: "Protective case with soft finish."},
  ];

  // Gradient backgrounds for product placeholders
  const BG_GRADIENTS = [
    "linear-gradient(135deg,#fbc2eb,#a6c1ee)",
    "linear-gradient(135deg,#a8edea,#fed6e3)",
    "linear-gradient(135deg,#f6d365,#fda085)",
    "linear-gradient(135deg,#cfd9df,#e2ebf0)",
    "linear-gradient(135deg,#d4fc79,#96e6a1)",
    "linear-gradient(135deg,#f093fb,#f5576c)",
    "linear-gradient(135deg,#5ee7df,#b490ca)",
    "linear-gradient(135deg,#cfd9df,#e2ebf0)",
    "linear-gradient(135deg,#f6d365,#fda085)",
    "linear-gradient(135deg,#a1c4fd,#c2e9fb)",
    "linear-gradient(135deg,#fbc2eb,#a6c1ee)",
    "linear-gradient(135deg,#f093fb,#f5576c)",
  ];

  // ======= localStorage keys =======
  const LS_CART = "dailystore_cart_v1";
  const LS_USERS = "dailystore_users_v1";
  const LS_SESSION = "dailystore_session_v1";

  // ======= Helpers =======
  const qs = (s,el=document) => el.querySelector(s);
  const qsa = (s,el=document) => Array.from(el.querySelectorAll(s));
  const formatPrice = (n) => `₹${(n).toFixed(2)}`;

  // ======= Cart logic =======
  function getCart(){
    try{
      const raw = localStorage.getItem(LS_CART);
      return raw ? JSON.parse(raw) : {};
    } catch(e){ return {}; }
  }
  function saveCart(cart){
    localStorage.setItem(LS_CART, JSON.stringify(cart));
    updateCartCount();
  }
  function addToCart(productId, qty = 1){
    const cart = getCart();
    cart[productId] = (cart[productId] || 0) + Number(qty);
    saveCart(cart);
  }
  function setCartQty(productId, qty){
    const cart = getCart();
    if(qty <= 0) delete cart[productId];
    else cart[productId] = Number(qty);
    saveCart(cart);
  }
  function removeFromCart(productId){
    const cart = getCart();
    delete cart[productId];
    saveCart(cart);
  }
  function clearCart(){
    localStorage.removeItem(LS_CART);
    updateCartCount();
  }
  function cartItemCount(){
    const cart = getCart();
    return Object.values(cart).reduce((s,n)=>s+Number(n),0);
  }
  function cartTotal(){
    const cart = getCart();
    let total = 0;
    for(const id in cart){
      const p = PRODUCTS.find(x=>x.id===id);
      if(p) total += p.price * cart[id];
    }
    return total;
  }

  // ======= Users & Session (frontend-only) =======
  function getUsers(){
    try{
      const raw = localStorage.getItem(LS_USERS);
      return raw ? JSON.parse(raw) : {};
    } catch(e){ return {}; }
  }
  function saveUsers(users){ localStorage.setItem(LS_USERS, JSON.stringify(users)); }

  function createUser(name, email, password){
    const users = getUsers();
    if(users[email]) return { success:false, msg:"Email already exists."};
    users[email] = { name, email, password };
    saveUsers(users);
    return { success:true };
  }
  function loginUser(email, password){
    const users = getUsers();
    const u = users[email];
    if(!u) return { success:false, msg:"No account with this email."};
    if(u.password !== password) return { success:false, msg:"Incorrect password."};
    localStorage.setItem(LS_SESSION, JSON.stringify({ email }));
    return { success:true, user:u };
  }
  function logoutUser(){
    localStorage.removeItem(LS_SESSION);
  }
  function getSession(){
    try{
      const raw = localStorage.getItem(LS_SESSION);
      return raw ? JSON.parse(raw) : null;
    } catch(e){ return null; }
  }
  function getCurrentUser(){
    const s = getSession();
    if(!s || !s.email) return null;
    const users = getUsers();
    return users[s.email] || null;
  }

  // ======= Header injection =======
  function buildHeaderHTML(){
    const user = getCurrentUser();
    return `
      <div class="inner">
        <div style="display:flex;gap:12px;align-items:center">
          <div class="logo">
            <span class="mark" aria-hidden="true"></span>
            <div>
              <div>Daily Store</div>
              <div style="font-size:0.8rem;color:var(--muted)">A minimal demo</div>
            </div>
          </div>
        </div>

        <nav class="nav">
          <a href="index.html">Home</a>
          <a href="products.html">Products</a>
          <a href="about.html">About</a>
          <a href="contact.html">Contact</a>
        </nav>

        <div class="header-actions">
          <form onsubmit="return false" id="header-search-form" style="display:flex;align-items:center;gap:8px">
            <input id="header-search-input" placeholder="Search..." style="padding:8px;border-radius:8px;border:1px solid rgba(31,41,55,0.06)" />
            <button id="header-search-go" class="btn btn-sm" type="button">Go</button>
          </form>

          <div style="display:flex;gap:8px;align-items:center">
            <a href="cart.html" class="icon-btn" title="Cart">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" style="opacity:0.9"><path d="M6 6h15l-1.5 9h-13L4 2H2" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/></svg>
              <span id="header-cart-count" class="badge">0</span>
            </a>

            <div id="header-user-area">
              ${'${user ? `<div class="muted small">Hi, ${escapeHtml(user.name)}</div><button id="header-logout" class="btn btn-ghost">Logout</button>` : `<a href="index.html" class="btn btn-ghost">Login / Signup</a>`}'}
            </div>
          </div>
        </div>
      </div>
    `;
  }

  // Simple escape
  function escapeHtml(s = "") {
    return String(s).replace(/[&<>"']/g, (m) => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'})[m]);
  }

  function injectHeader(){
    const header = document.querySelector("[data-inject-header]");
    if(!header) return;
    header.innerHTML = buildHeaderHTML();
    // wire up header events
    const cartCountElem = document.getElementById("header-cart-count");
    if(cartCountElem) cartCountElem.textContent = cartItemCount();

    const searchInput = document.getElementById("header-search-input");
    const searchGo = document.getElementById("header-search-go");
    if(searchGo){
      searchGo.addEventListener("click", () => {
        const q = (searchInput.value || "").trim();
        if(!q) { window.location.href = "products.html"; return; }
        // pass query via localStorage quick param
        localStorage.setItem("dailystore_search_q", q);
        window.location.href = "search.html";
      });
    }

    const logoutBtn = document.getElementById("header-logout");
    if(logoutBtn){
      logoutBtn.addEventListener("click", () => {
        logoutUser();
        // reload header and page to update UI
        location.reload();
      });
    }
  }

  function updateCartCount(){
    const el = document.getElementById("header-cart-count");
    if(el) el.textContent = cartItemCount();
    // also update any page-specific count
    const mobileCount = document.querySelectorAll(".cart-count-inline");
    mobileCount.forEach(n => n.textContent = cartItemCount());
  }

  // ======= Product card builder =======
  function buildProductCardHTML(prod, index = 0){
    const bg = BG_GRADIENTS[index % BG_GRADIENTS.length];
    return `
      <article class="product-card" data-id="${prod.id}">
        <div class="product-media" style="background:${bg}">
          <div style="background:rgba(255,255,255,0.12);padding:8px;border-radius:8px">
            <div style="font-weight:700;">${escapeHtml(prod.name)}</div>
            <div style="font-size:0.85rem;color:rgba(255,255,255,0.9)">${formatPrice(prod.price)}</div>
          </div>
        </div>
        <div class="product-body">
          <div>
            <div class="product-title">${escapeHtml(prod.name)}</div>
            <div class="product-desc">${escapeHtml(prod.desc)}</div>
          </div>
          <div class="product-row">
            <div class="price">${formatPrice(prod.price)}</div>
            <div class="card-actions">
              <button class="btn btn-sm add-cart" data-id="${prod.id}">Add to Cart</button>
            </div>
          </div>
        </div>
      </article>
    `;
  }

  // ======= Renderers for pages =======
  function renderProductsGrid(containerSelector = "#products-grid", items = PRODUCTS){
    const cont = document.querySelector(containerSelector);
    if(!cont) return;
    cont.innerHTML = items.map((p,i) => buildProductCardHTML(p,i)).join("");
    // wire up add to cart
    qsa(".add-cart", cont).forEach(btn => {
      btn.addEventListener("click", (e) => {
        const id = btn.dataset.id;
        addToCart(id, 1);
        showToast("Added to cart");
      });
    });
    updateCartCount();
  }

  function renderSearchResults(query = "", containerSelector = "#search-results"){
    const q = (query || "").trim().toLowerCase();
    const results = PRODUCTS.filter(p => {
      return p.name.toLowerCase().includes(q) || p.desc.toLowerCase().includes(q);
    });
    const cont = document.querySelector(containerSelector);
    if(!cont) return;
    if(results.length === 0){
      cont.innerHTML = `<div class="muted">No results for "<strong>${escapeHtml(query)}</strong>".</div>`;
      return;
    }
    cont.innerHTML = results.map((p,i) => buildProductCardHTML(p,i)).join("");
    qsa(".add-cart", cont).forEach(btn => {
      btn.addEventListener("click", () => {
        addToCart(btn.dataset.id, 1);
        showToast("Added to cart");
      });
    });
    updateCartCount();
  }

  function renderCartPage(){
    const list = qs("#cart-list");
    const emptyMsg = qs("#cart-empty");
    if(!list) return;
    const cart = getCart();
    const ids = Object.keys(cart);
    if(ids.length === 0){
      list.innerHTML = "";
      emptyMsg.classList.remove("hidden");
      qs("#cart-total").textContent = formatPrice(0);
      return;
    }
    emptyMsg.classList.add("hidden");
    const rows = ids.map(id => {
      const prod = PRODUCTS.find(p => p.id === id);
      const qty = cart[id];
      const bg = BG_GRADIENTS[PRODUCTS.indexOf(prod) % BG_GRADIENTS.length];
      return `
        <div class="cart-row" data-id="${id}">
          <div class="media" style="background:${bg}"></div>
          <div style="flex:1">
            <div style="font-weight:700">${escapeHtml(prod.name)}</div>
            <div class="muted small">${escapeHtml(prod.desc)}</div>
            <div style="margin-top:8px" class="small">Price: ${formatPrice(prod.price)}</div>
          </div>
          <div style="display:flex;flex-direction:column;align-items:flex-end;gap:8px">
            <div class="qty-controls">
              <button class="btn-ghost qty-decrease" data-id="${id}">-</button>
              <div style="padding:6px 10px;border-radius:8px;border:1px solid rgba(31,41,55,0.06)">${qty}</div>
              <button class="btn-ghost qty-increase" data-id="${id}">+</button>
            </div>
            <button class="btn btn-ghost remove-item" data-id="${id}">Remove</button>
          </div>
        </div>
      `;
    }).join("");
    list.innerHTML = rows;

    // Wire quantity buttons
    qsa(".qty-increase", list).forEach(b => {
      b.addEventListener("click", () => {
        const id = b.dataset.id;
        const cart = getCart();
        setCartQty(id, (cart[id] || 0) + 1);
        renderCartPage();
      });
    });
    qsa(".qty-decrease", list).forEach(b => {
      b.addEventListener("click", () => {
        const id = b.dataset.id;
        const cart = getCart();
        setCartQty(id, (cart[id] || 0) - 1);
        renderCartPage();
      });
    });
    qsa(".remove-item", list).forEach(b => {
      b.addEventListener("click", () => {
        removeFromCart(b.dataset.id);
        renderCartPage();
      });
    });

    qs("#cart-total").textContent = formatPrice(cartTotal());
    updateCartCount();
  }

  // ======= Small UI helpers =======
  function showToast(msg){
    // transient simple notification using alert-like small div
    const el = document.createElement("div");
    el.style.position = "fixed";
    el.style.right = "18px";
    el.style.bottom = "18px";
    el.style.background = "rgba(31,41,55,0.95)";
    el.style.color = "#fff";
    el.style.padding = "10px 14px";
    el.style.borderRadius = "10px";
    el.style.boxShadow = "0 8px 24px rgba(31,41,55,0.18)";
    el.style.zIndex = 9999;
    el.textContent = msg;
    document.body.appendChild(el);
    setTimeout(() => {
      el.style.transition = "opacity 300ms";
      el.style.opacity = 0;
      setTimeout(()=> el.remove(), 400);
    }, 1000);
  }

  // ======= Page init =======
  function init(){
    injectHeader();

    // global header search: also allow enter key
    const headerSearch = qs("#header-search-input");
    if(headerSearch){
      headerSearch.addEventListener("keydown", (e) => {
        if(e.key === "Enter"){
          e.preventDefault();
          qs("#header-search-go").click();
        }
      });
    }

    // page-specific
    const bodyId = document.body.id;

    // Home page: login/signup
    if(bodyId === "page-home"){
      updateCartCount();
      const loginForm = qs("#login-form");
      const signupForm = qs("#signup-form");
      const logoutBtn = qs("#logout-btn");
      const loginMsg = qs("#login-msg");
      const signupMsg = qs("#signup-msg");

      // show/hide logout depending on session
      const session = getCurrentUser();
      if(session){
        loginForm.querySelector("#login-email").value = session.email || "";
        loginForm.classList.add("hidden");
        logoutBtn.classList.remove("hidden");
        loginMsg.textContent = `Logged in as ${session.name}`;
        // Also show logout in header is available already
      } else {
        logoutBtn.classList.add("hidden");
        loginForm.classList.remove("hidden");
      }

      signupForm.addEventListener("submit", (ev) => {
        ev.preventDefault();
        const name = qs("#signup-name").value.trim();
        const email = qs("#signup-email").value.trim().toLowerCase();
        const pw = qs("#signup-password").value;
        if(!name || !email || !pw){ signupMsg.textContent = "Please fill all fields."; return; }
        const res = createUser(name, email, pw);
        if(!res.success){ signupMsg.textContent = res.msg; return;}
        signupMsg.textContent = "Account created. You can login now.";
        signupForm.reset();
      });

      loginForm.addEventListener("submit", (ev) => {
        ev.preventDefault();
        const email = qs("#login-email").value.trim().toLowerCase();
        const pw = qs("#login-password").value;
        const res = loginUser(email, pw);
        if(!res.success){ loginMsg.textContent = res.msg; return; }
        loginMsg.textContent = `Welcome, ${res.user.name}`;
        // reload to update header UI (session)
        setTimeout(()=> location.reload(), 600);
      });

      logoutBtn.addEventListener("click", () => {
        logoutUser();
        location.reload();
      });
    }

    // Products page
    if(bodyId === "page-products"){
      renderProductsGrid("#products-grid", PRODUCTS);
      const searchInput = qs("#products-search");
      const searchBtn = qs("#products-search-btn");
      searchBtn.addEventListener("click", () => {
        const q = (searchInput.value || "").trim().toLowerCase();
        const results = PRODUCTS.filter(p => p.name.toLowerCase().includes(q) || p.desc.toLowerCase().includes(q));
        renderProductsGrid("#products-grid", results);
      });
      searchInput.addEventListener("keydown", (e) => { if(e.key==="Enter") searchBtn.click(); });
    }

    // Search page
    if(bodyId === "page-search"){
      // read query from localStorage param or url fragment
      const preset = localStorage.getItem("dailystore_search_q") || "";
      if(preset){
        qs("#search-query").value = preset;
        localStorage.removeItem("dailystore_search_q");
        renderSearchResults(preset, "#search-results");
      } else {
        renderSearchResults("", "#search-results");
      }
      const searchBtn = qs("#search-btn");
      const input = qs("#search-query");
      searchBtn.addEventListener("click", () => {
        const q = input.value.trim();
        renderSearchResults(q, "#search-results");
      });
      input.addEventListener("keydown", (e) => { if(e.key==="Enter") searchBtn.click(); });
    }

    // Cart page
    if(bodyId === "page-cart"){
      renderCartPage();
      const checkoutBtn = qs("#checkout-btn");
      checkoutBtn.addEventListener("click", () => {
        const user = getCurrentUser();
        if(!user){
          if(!confirm("You are not logged in. Continue checkout as guest?")) return;
        }
        if(cartItemCount() === 0){ alert("Your cart is empty."); return; }
        alert("Checkout demo — thank you! (No real payment).");
        clearCart();
        renderCartPage();
      });
    }

    // Contact page
    if(bodyId === "page-contact"){
      const form = qs("#contact-form");
      const success = qs("#contact-success");
      form.addEventListener("submit", (e) => {
        e.preventDefault();
        // just show success message
        success.classList.remove("hidden");
        form.reset();
        setTimeout(()=> success.classList.add("hidden"), 3500);
      });
    }

    // Generic product add-to-cart from any rendered grid (delegate)
    document.body.addEventListener("click", (e) => {
      const target = e.target.closest && e.target.closest(".add-cart");
      if(target){
        const id = target.dataset.id;
        addToCart(id, 1);
        showToast("Added to cart");
      }
    });

    // update header cart count every second (keeps UI consistent across tabs)
    updateCartCount();
    window.addEventListener("storage", () => updateCartCount());
  }

  // Run init when DOM loaded
  if(document.readyState === "loading"){
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }

})();
