// app.js — SGCM Main Application Logic

document.addEventListener('DOMContentLoaded', () => {
  DB.init();
  loadSettings();
  applyTheme(DB.getTheme());
  renderGrid();
  updateBadges();
  setupFilters();
});

/* ── SETTINGS ── */
function loadSettings() {
  let s = DB.getSettings();
  
  // Auto-update old contact info if found in localStorage
  if (s.phone === '9443343224' || s.email === 'sgcm@121') {
    s.phone = '8639979749';
    s.email = 'sgcm121@gmail.com';
    s.whatsapp = '918639979749';
    DB.saveSettings(s);
  }
  setText('nav-shop-name', s.shopName || 'SGCM');
  setText('nav-tagline', s.tagline || 'Elegance Woven in Every Thread');
  setText('hero-title', s.fullName || 'Sri Ganesh Cloth Merchants');
  setText('hero-tagline', s.tagline || '');
  setText('banner-text', s.bannerText || '');
  setText('about-text', s.aboutText || '');
  setText('contact-phone', s.phone || '');
  setText('contact-email', s.email || '');
  setText('contact-address', s.address || '');
  setText('footer-phone', s.phone || '');
  setText('footer-email', s.email || '');
  setText('footer-addr', s.address || '');
  setText('footer-about', s.aboutText || '');
  const wa = document.getElementById('whatsapp-link');
  if (wa) wa.href = `https://wa.me/${s.whatsapp || '918639979748'}`;
  const ca = document.getElementById('call-link');
  if (ca) ca.href = `tel:${s.phone || '8639979748'}`;
}
function setText(id, val) {
  const el = document.getElementById(id);
  if (el) el.textContent = val;
}

/* ── THEME ── */
document.getElementById('theme-toggle').addEventListener('click', () => {
  const next = DB.getTheme() === 'light' ? 'dark' : 'light';
  DB.saveTheme(next);
  applyTheme(next);
});
function applyTheme(t) {
  document.documentElement.setAttribute('data-theme', t);
  const btn = document.getElementById('theme-toggle');
  if (btn) btn.textContent = t === 'dark' ? '☀️' : '🌙';
}

/* ── PRODUCT CARD ── */
function makeCard(saree, compact = false) {
  const discounted = Math.round(saree.price * (1 - saree.discount / 100));
  const isFav = DB.isFavorite(saree.id);
  const oos = saree.stock === 0;
  const imgContent = saree.image
    ? `<img src="${saree.image}" alt="${saree.name}" />`
    : `<span style="font-size:3rem">🥻</span>`;

  return `
  <div class="product-card fade-up" id="card-${saree.id}">
    <div class="card-img" style="${saree.gradient ? 'background:'+saree.gradient : ''}">
      ${imgContent}
      <div class="card-overlay">
        ${!oos ? `<button class="btn-gold" style="padding:8px 16px;font-size:0.78rem" onclick="addToCartUI('${saree.id}')">🛍️ Add</button>` : ''}
        <button class="btn-outline" style="padding:8px 16px;font-size:0.78rem;color:#fff;border-color:#fff" onclick="openDetail('${saree.id}')">👁 View</button>
      </div>
    </div>
    ${oos ? `<div class="out-of-stock"><span class="oos-badge">Out of Stock</span></div>` : ''}
    <button class="fav-btn ${isFav ? 'active' : ''}" id="fav-${saree.id}" onclick="toggleFavUI('${saree.id}')">
      ${isFav ? '❤️' : '🤍'}
    </button>
    <div class="card-body">
      <div class="card-name">${saree.name}</div>
      <div class="card-meta">${saree.fabric} · ${saree.color} · ${saree.occasion}</div>
      <div class="card-price">
        <span class="price-now">₹${discounted.toLocaleString('en-IN')}</span>
        ${saree.discount > 0 ? `<span class="price-old">₹${saree.price.toLocaleString('en-IN')}</span><span class="price-badge">${saree.discount}% OFF</span>` : ''}
      </div>
      ${!compact ? `<div class="card-tags">${(saree.tags||[]).slice(0,3).map(t=>`<span class="tag">${t}</span>`).join('')}</div>` : ''}
      <div style="display:flex;gap:8px">
        ${!oos ? `<button class="btn-gold" style="flex:1;padding:8px;font-size:0.8rem" onclick="addToCartUI('${saree.id}')">🛍️ Cart</button>` : '<span style="flex:1;text-align:center;color:#ef4444;font-size:0.8rem;padding:8px">Out of Stock</span>'}
        <button class="btn-sm" style="padding:8px 10px" onclick="openDetail('${saree.id}')">👁</button>
      </div>
    </div>
  </div>`;
}

/* ── RENDER GRID ── */
let currentFilters = {};
function renderGrid(sarees) {
  if (!sarees) sarees = getFilteredSarees();
  const grid = document.getElementById('product-grid');
  const noRes = document.getElementById('no-results');
  if (!grid) return;
  if (sarees.length === 0) {
    grid.innerHTML = '';
    noRes && noRes.classList.remove('hidden');
    return;
  }
  noRes && noRes.classList.add('hidden');
  grid.innerHTML = sarees.map(s => makeCard(s)).join('');
}

function getFilteredSarees() {
  let sarees = DB.getSarees();
  const q = (document.getElementById('search-input')?.value || '').toLowerCase();
  const occ = document.getElementById('filter-occasion')?.value || '';
  const fab = document.getElementById('filter-fabric')?.value || '';
  const sort = document.getElementById('filter-sort')?.value || '';

  if (q) sarees = sarees.filter(s =>
    s.name.toLowerCase().includes(q) ||
    s.color.toLowerCase().includes(q) ||
    s.fabric.toLowerCase().includes(q) ||
    (s.tags||[]).some(t => t.includes(q))
  );
  if (occ) sarees = sarees.filter(s => s.occasion === occ);
  if (fab) sarees = sarees.filter(s => s.fabric === fab);
  if (sort === 'price-asc') sarees.sort((a,b) => a.price - b.price);
  else if (sort === 'price-desc') sarees.sort((a,b) => b.price - a.price);
  else if (sort === 'discount') sarees.sort((a,b) => b.discount - a.discount);
  return sarees;
}

function setupFilters() {
  ['search-input','filter-occasion','filter-fabric','filter-sort'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.addEventListener('input', () => renderGrid());
  });
}
function clearFilters() {
  ['search-input','filter-occasion','filter-fabric','filter-sort'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.value = '';
  });
  renderGrid();
}

/* ── CART ── */
document.getElementById('cart-btn')?.addEventListener('click', () => openModal('cart-modal', renderCart));
function addToCartUI(id) {
  const s = DB.getSarees().find(x => x.id === id);
  if (!s || s.stock === 0) return showToast('❌ Item out of stock');
  DB.addToCart(id);
  updateBadges();
  showToast(`✅ "${s.name}" added to cart!`);
}
function renderCart() {
  const cart = DB.getCart();
  const sarees = DB.getSarees();
  const el = document.getElementById('cart-items');
  const tot = document.getElementById('cart-total');
  if (!cart.length) { el.innerHTML = '<p style="text-align:center;color:var(--text-light);padding:24px">Your cart is empty 🛍️</p>'; tot.textContent = ''; return; }
  let total = 0;
  el.innerHTML = cart.map(ci => {
    const s = sarees.find(x => x.id === ci.id);
    if (!s) return '';
    const price = Math.round(s.price * (1 - s.discount / 100));
    total += price * ci.quantity;
    return `<div class="cart-item">
      <div class="cart-item-img" style="background:${s.gradient}">${s.image ? `<img src="${s.image}" style="width:100%;height:100%;object-fit:cover;border-radius:8px"/>` : '🥻'}</div>
      <div style="flex:1">
        <div class="cart-item-name">${s.name}</div>
        <div class="cart-item-price">₹${price.toLocaleString('en-IN')} × ${ci.quantity}</div>
      </div>
      <div class="qty-control">
        <button class="qty-btn" onclick="changeQty('${ci.id}',-1)">−</button>
        <span>${ci.quantity}</span>
        <button class="qty-btn" onclick="changeQty('${ci.id}',1)">+</button>
        <button class="qty-btn" style="color:#ef4444" onclick="removeCartItem('${ci.id}')">✕</button>
      </div>
    </div>`;
  }).join('');
  tot.innerHTML = `Total: ₹${total.toLocaleString('en-IN')}`;
}
function changeQty(id, delta) {
  const cart = DB.getCart();
  const item = cart.find(c => c.id === id);
  if (!item) return;
  DB.updateCartQty(id, item.quantity + delta);
  updateBadges(); renderCart();
}
function removeCartItem(id) { DB.removeFromCart(id); updateBadges(); renderCart(); }
function clearCartUI() { DB.clearCart(); updateBadges(); renderCart(); showToast('🗑️ Cart cleared'); }

/* ── FAVOURITES ── */
document.getElementById('fav-btn')?.addEventListener('click', () => openModal('fav-modal', renderFavourites));
function toggleFavUI(id) {
  const isNowFav = DB.toggleFavorite(id);
  const btn = document.getElementById(`fav-${id}`);
  if (btn) { btn.textContent = isNowFav ? '❤️' : '🤍'; btn.classList.toggle('active', isNowFav); }
  updateBadges();
  showToast(isNowFav ? '❤️ Added to favourites' : '🤍 Removed from favourites');
}
function renderFavourites() {
  const favIds = DB.getFavorites();
  const el = document.getElementById('fav-items');
  if (!el) return;
  if (!favIds.length) { el.innerHTML = '<p style="text-align:center;color:var(--text-light);padding:24px;grid-column:span 2">No favourites yet ❤️</p>'; return; }
  const sarees = DB.getSarees().filter(s => favIds.includes(s.id));
  el.innerHTML = sarees.map(s => makeCard(s, true)).join('');
}

/* ── DETAIL MODAL ── */
function openDetail(id) {
  const s = DB.getSarees().find(x => x.id === id);
  if (!s) return;
  const price = Math.round(s.price * (1 - s.discount / 100));
  const similar = AI.findSimilar(id, 3);
  document.getElementById('detail-content').innerHTML = `
    <div style="display:flex;gap:20px;flex-wrap:wrap">
      <div style="width:160px;height:200px;border-radius:12px;display:flex;align-items:center;justify-content:center;font-size:4rem;background:${s.gradient};flex-shrink:0">
        ${s.image ? `<img src="${s.image}" style="width:100%;height:100%;object-fit:cover;border-radius:12px"/>` : '🥻'}
      </div>
      <div style="flex:1;min-width:200px">
        <h3 style="font-family:'Cormorant Garamond',serif;font-size:1.6rem;color:var(--navy)">${s.name}</h3>
        <div class="ornament" style="margin:8px 0"><span>❧</span></div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:16px;font-size:0.88rem">
          <div><strong>Fabric:</strong> ${s.fabric}</div>
          <div><strong>Color:</strong> ${s.color}</div>
          <div><strong>Occasion:</strong> ${s.occasion}</div>
          <div><strong>Stock:</strong> ${s.stock > 0 ? s.stock + ' available' : '<span style="color:#ef4444">Out of Stock</span>'}</div>
        </div>
        <div class="card-price" style="margin-bottom:16px">
          <span class="price-now" style="font-size:1.5rem">₹${price.toLocaleString('en-IN')}</span>
          ${s.discount > 0 ? `<span class="price-old">₹${s.price.toLocaleString('en-IN')}</span><span class="price-badge">${s.discount}% OFF</span>` : ''}
        </div>
        <div class="card-tags" style="margin-bottom:16px">${(s.tags||[]).map(t=>`<span class="tag">${t}</span>`).join('')}</div>
        ${s.stock > 0 ? `<button class="btn-gold" style="width:100%;padding:12px" onclick="addToCartUI('${s.id}');closeModal('detail-modal')">🛍️ Add to Cart</button>` : ''}
      </div>
    </div>
    ${similar.length ? `
    <div style="margin-top:24px">
      <h4 style="font-family:'Cinzel',serif;font-size:0.85rem;color:var(--gold-dark);letter-spacing:2px;margin-bottom:12px">✦ YOU MAY ALSO LIKE ✦</h4>
      <div style="display:flex;gap:10px;overflow-x:auto;padding-bottom:4px">
        ${similar.map(sim => {
          const sp = Math.round(sim.price*(1-sim.discount/100));
          return `<div style="min-width:120px;background:var(--cream2);border:1px solid var(--border);border-radius:8px;padding:10px;cursor:pointer;flex-shrink:0" onclick="closeModal('detail-modal');setTimeout(()=>openDetail('${sim.id}'),200)">
            <div style="height:70px;display:flex;align-items:center;justify-content:center;background:${sim.gradient};border-radius:6px;margin-bottom:8px;font-size:1.5rem">🥻</div>
            <div style="font-size:0.8rem;font-weight:600">${sim.name}</div>
            <div style="font-size:0.75rem;color:var(--gold-dark)">₹${sp.toLocaleString('en-IN')}</div>
          </div>`;
        }).join('')}
      </div>
    </div>` : ''}
  `;
  openModal('detail-modal');
}

/* ── AI ── */
function runAI() {
  const occ = document.getElementById('ai-occasion')?.value || '';
  const color = document.getElementById('ai-color')?.value || '';
  const fabric = document.getElementById('ai-fabric')?.value || '';
  const budgetVal = document.getElementById('ai-budget')?.value || '';
  let priceRange = null;
  if (budgetVal) { const [mn, mx] = budgetVal.split('-').map(Number); priceRange = { min: mn, max: mx }; }
  const results = AI.recommend({ occasion: occ, color, fabric, priceRange }, 6);
  const el = document.getElementById('ai-results');
  if (!el) return;
  if (!results.length) { el.innerHTML = '<p style="color:rgba(240,208,128,0.7);text-align:center;padding:24px;grid-column:span 3">No matches found. Try broader filters.</p>'; return; }
  el.innerHTML = results.map(s => `
    <div class="product-card" style="border-color:rgba(201,168,76,0.4)">
      <div class="card-img" style="background:${s.gradient}">
        ${s.image ? `<img src="${s.image}" alt="${s.name}"/>` : '<span style="font-size:3rem">🥻</span>'}
        <div class="card-overlay">
          <button class="btn-gold" style="padding:8px 14px;font-size:0.78rem" onclick="addToCartUI('${s.id}')">🛍️ Add</button>
        </div>
      </div>
      <div style="position:absolute;top:10px;left:10px;background:var(--gold);color:var(--navy);font-size:0.7rem;font-weight:700;padding:3px 8px;border-radius:4px">
        AI ${s.aiScore}%
      </div>
      <div class="card-body">
        <div class="card-name">${s.name}</div>
        <div class="card-meta">${s.fabric} · ${s.color}</div>
        <div class="card-price">
          <span class="price-now">₹${Math.round(s.price*(1-s.discount/100)).toLocaleString('en-IN')}</span>
          ${s.discount > 0 ? `<span class="price-badge">${s.discount}% OFF</span>` : ''}
        </div>
        <button class="btn-gold" style="width:100%;padding:8px;font-size:0.8rem" onclick="addToCartUI('${s.id}')">Add to Cart</button>
      </div>
    </div>
  `).join('');
}

/* ── BADGES ── */
function updateBadges() {
  const cartCount = DB.getCart().reduce((a, c) => a + c.quantity, 0);
  const favCount = DB.getFavorites().length;
  const cb = document.getElementById('cart-badge');
  const fb = document.getElementById('fav-badge');
  if (cb) { cb.textContent = cartCount; cb.classList.toggle('hidden', cartCount === 0); }
  if (fb) { fb.textContent = favCount; fb.classList.toggle('hidden', favCount === 0); }
}

/* ── MODAL ── */
function openModal(id, cb) { document.getElementById(id)?.classList.add('open'); if (cb) cb(); }
function closeModal(id) { document.getElementById(id)?.classList.remove('open'); }
document.querySelectorAll('.modal-overlay').forEach(m => {
  m.addEventListener('click', e => { if (e.target === m) m.classList.remove('open'); });
});

/* ── TOAST ── */
function showToast(msg, duration = 3000) {
  const c = document.getElementById('toast-container');
  if (!c) return;
  const t = document.createElement('div');
  t.className = 'toast'; t.textContent = msg;
  c.appendChild(t);
  setTimeout(() => t.remove(), duration);
}
