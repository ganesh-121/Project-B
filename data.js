// data.js — localStorage Database Layer for SGCM (Sri Ganesh Cloth Merchants)

const DB = {
  KEYS: {
    SAREES: 'sgcm_sarees', SETTINGS: 'sgcm_settings',
    CART: 'sgcm_cart', FAVORITES: 'sgcm_favorites',
    THEME: 'sgcm_theme', INIT: 'sgcm_initialized'
  },

  DEFAULT_SAREES: [
    { id:'1', name:'Kanjivaram Silk', fabric:'Silk', color:'Red', occasion:'Wedding', price:8500, discount:10, stock:5, image:'', tags:['silk','wedding','traditional','red'], gradient:'linear-gradient(135deg,#b91c1c,#7f1d1d)' },
    { id:'2', name:'Banarasi Brocade', fabric:'Silk', color:'Golden', occasion:'Wedding', price:12000, discount:15, stock:3, image:'', tags:['silk','wedding','brocade','golden'], gradient:'linear-gradient(135deg,#d97706,#92400e)' },
    { id:'3', name:'Chanderi Cotton', fabric:'Cotton', color:'Blue', occasion:'Casual', price:2500, discount:5, stock:8, image:'', tags:['cotton','casual','blue','light'], gradient:'linear-gradient(135deg,#1d4ed8,#1e3a8a)' },
    { id:'4', name:'Mysore Silk', fabric:'Silk', color:'Green', occasion:'Festival', price:5500, discount:0, stock:6, image:'', tags:['silk','festival','green','mysore'], gradient:'linear-gradient(135deg,#15803d,#14532d)' },
    { id:'5', name:'Pochampally Ikat', fabric:'Cotton', color:'Purple', occasion:'Festival', price:3200, discount:8, stock:0, image:'', tags:['cotton','ikat','purple','festival'], gradient:'linear-gradient(135deg,#7c3aed,#4c1d95)' },
    { id:'6', name:'Paithani Silk', fabric:'Silk', color:'Pink', occasion:'Party', price:9500, discount:12, stock:4, image:'', tags:['silk','party','pink','paithani'], gradient:'linear-gradient(135deg,#db2777,#831843)' },
    { id:'7', name:'Linen Handloom', fabric:'Linen', color:'Beige', occasion:'Office', price:1800, discount:0, stock:12, image:'', tags:['linen','office','beige','handloom'], gradient:'linear-gradient(135deg,#a16207,#713f12)' },
    { id:'8', name:'Georgette Printed', fabric:'Georgette', color:'Orange', occasion:'Party', price:2200, discount:20, stock:7, image:'', tags:['georgette','printed','orange','party'], gradient:'linear-gradient(135deg,#ea580c,#7c2d12)' },
    { id:'9', name:'Tussar Silk', fabric:'Silk', color:'Cream', occasion:'Casual', price:4200, discount:5, stock:9, image:'', tags:['silk','casual','cream','tussar'], gradient:'linear-gradient(135deg,#d4a574,#8b5e3c)' },
    { id:'10', name:'Bandhani Georgette', fabric:'Georgette', color:'Yellow', occasion:'Festival', price:2800, discount:10, stock:6, image:'', tags:['georgette','festival','yellow','bandhani'], gradient:'linear-gradient(135deg,#ca8a04,#713f12)' },
    { id:'11', name:'Patola Silk', fabric:'Silk', color:'Maroon', occasion:'Wedding', price:15000, discount:0, stock:2, image:'', tags:['silk','wedding','maroon','patola'], gradient:'linear-gradient(135deg,#9f1239,#4c0519)' },
    { id:'12', name:'Sambalpuri Cotton', fabric:'Cotton', color:'Violet', occasion:'Casual', price:1900, discount:0, stock:10, image:'', tags:['cotton','casual','violet','sambalpuri'], gradient:'linear-gradient(135deg,#6d28d9,#2e1065)' },
  ],

  DEFAULT_SETTINGS: {
    shopName: 'SGCM',
    fullName: 'Sri Ganesh Cloth Merchants',
    tagline: 'Elegance Woven in Every Thread',
    whatsapp: '918639979749',
    email: 'sgcm121@gmail.com',
    phone: '8639979749',
    address: 'Main Market, Your City - 500001',
    aboutText: 'Established with a passion for authentic Indian textiles, SGCM (Sri Ganesh Cloth Merchants) has been serving customers with the finest handpicked sarees. We bring you the best of traditional craftsmanship from across India — from the grandeur of Banarasi Brocade to the delicate beauty of Chanderi Cotton.',
    bannerText: '🎉 Grand Sale — Up to 20% OFF on selected sarees!',
    founded: '2004',
    adminPassword: 'admin123'
  },

  migrate() {
    const s = this.getSettings();
    let changed = false;
    if (s.phone === '9443343224')        { s.phone    = '8639979749';         changed = true; }
    if (s.email === 'sgcm@121')          { s.email    = 'sgcm121@gmail.com';   changed = true; }
    if (s.whatsapp === '919443343224')   { s.whatsapp = '918639979749';        changed = true; }
    if (changed) this.saveSettings(s);
  },

  init() {
    if (!localStorage.getItem(this.KEYS.INIT)) {
      localStorage.setItem(this.KEYS.SAREES, JSON.stringify(this.DEFAULT_SAREES));
      localStorage.setItem(this.KEYS.SETTINGS, JSON.stringify(this.DEFAULT_SETTINGS));
      localStorage.setItem(this.KEYS.CART, JSON.stringify([]));
      localStorage.setItem(this.KEYS.FAVORITES, JSON.stringify([]));
      localStorage.setItem(this.KEYS.INIT, 'true');
    }
    this.migrate();
  },

  getSarees() { return JSON.parse(localStorage.getItem(this.KEYS.SAREES) || '[]'); },
  saveSarees(s) { localStorage.setItem(this.KEYS.SAREES, JSON.stringify(s)); },

  addSaree(saree) {
    const sarees = this.getSarees();
    saree.id = Date.now().toString();
    saree.gradient = 'linear-gradient(135deg,#b8860b,#1a237e)';
    sarees.push(saree); this.saveSarees(sarees); return saree;
  },
  updateSaree(id, updates) {
    const sarees = this.getSarees();
    const i = sarees.findIndex(s => s.id === id);
    if (i !== -1) { sarees[i] = { ...sarees[i], ...updates }; this.saveSarees(sarees); return sarees[i]; }
  },
  deleteSaree(id) { this.saveSarees(this.getSarees().filter(s => s.id !== id)); },

  getSettings() { return JSON.parse(localStorage.getItem(this.KEYS.SETTINGS) || '{}'); },
  saveSettings(s) { localStorage.setItem(this.KEYS.SETTINGS, JSON.stringify({ ...this.getSettings(), ...s })); },

  getCart() { return JSON.parse(localStorage.getItem(this.KEYS.CART) || '[]'); },
  saveCart(c) { localStorage.setItem(this.KEYS.CART, JSON.stringify(c)); },
  clearCart() { this.saveCart([]); },

  addToCart(id, qty = 1) {
    const cart = this.getCart();
    const item = cart.find(c => c.id === id);
    if (item) item.quantity += qty; else cart.push({ id, quantity: qty });
    this.saveCart(cart);
  },
  removeFromCart(id) { this.saveCart(this.getCart().filter(c => c.id !== id)); },
  updateCartQty(id, qty) {
    if (qty <= 0) { this.removeFromCart(id); return; }
    const cart = this.getCart();
    const item = cart.find(c => c.id === id);
    if (item) { item.quantity = qty; this.saveCart(cart); }
  },

  getFavorites() { return JSON.parse(localStorage.getItem(this.KEYS.FAVORITES) || '[]'); },
  saveFavorites(f) { localStorage.setItem(this.KEYS.FAVORITES, JSON.stringify(f)); },
  toggleFavorite(id) {
    let favs = this.getFavorites();
    if (favs.includes(id)) favs = favs.filter(f => f !== id); else favs.push(id);
    this.saveFavorites(favs); return favs.includes(id);
  },
  isFavorite(id) { return this.getFavorites().includes(id); },

  getTheme() { return localStorage.getItem(this.KEYS.THEME) || 'light'; },
  saveTheme(t) { localStorage.setItem(this.KEYS.THEME, t); },
  verifyAdmin(pw) { return pw === this.getSettings().adminPassword; }
};
