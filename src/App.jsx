import { createContext, useContext, useEffect, useState } from 'react';
import productsData from '../data/products.json';

const CartContext = createContext(null);
const products = productsData;
const money = new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', maximumFractionDigits: 0 });
const CART_KEY = 'fhife_luxe_cart_v1';
const ORDERS_KEY = 'fhife_luxe_orders_v1';
const NEWSLETTER_KEY = 'fhife_luxe_newsletters_v1';
const SAMPLES_KEY = 'fhife_luxe_samples_v1';
const readStorage = (key, fallback) => {
  try { return JSON.parse(localStorage.getItem(key)) ?? fallback; } catch { return fallback; }
};
const saveStorage = (key, value) => localStorage.setItem(key, JSON.stringify(value));
const dateLabel = (date, options) => new Date(date).toLocaleDateString('en-NG', options);

function useCart() { return useContext(CartContext); }

function CartProvider({ children }) {
  const [cart, setCart] = useState(() => readStorage(CART_KEY, []));
  const [toast, setToast] = useState('');
  useEffect(() => saveStorage(CART_KEY, cart), [cart]);
  const notify = (message) => {
    setToast(message);
    window.clearTimeout(notify.timer);
    notify.timer = window.setTimeout(() => setToast(''), 3200);
  };
  const add = (product, quantity = 1) => {
    setCart((items) => {
      const match = items.find((item) => item.id === product.id);
      return match
        ? items.map((item) => item.id === product.id ? { ...item, quantity: item.quantity + quantity } : item)
        : [...items, { ...product, quantity, category: product.category?.toUpperCase() || 'HOUSE ATELIER' }];
    });
    notify(`Added ${product.name} to your Atelier Bag`);
  };
  const update = (id, quantity) => setCart((items) => quantity > 0
    ? items.map((item) => item.id === id ? { ...item, quantity } : item)
    : items.filter((item) => item.id !== id));
  const remove = (id) => {
    const item = cart.find((entry) => entry.id === id);
    setCart((items) => items.filter((entry) => entry.id !== id));
    if (item) notify(`Removed ${item.name} from your bag`);
  };
  const count = cart.reduce((total, item) => total + item.quantity, 0);
  return <CartContext.Provider value={{ cart, setCart, add, update, remove, count, notify }}>
    {children}
    {toast && <div className="fhife-toast-container"><div className="fhife-toast toast-success show"><span className="icon">check_circle</span><span className="toast-text">{toast}</span></div></div>}
  </CartContext.Provider>;
}

function Header({ active = '' }) {
  const { count, add } = useCart();
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState('');
  const results = query.trim() ? products.filter((p) => `${p.name} ${p.description} ${p.profile} ${Object.values(p.notes || {}).join(' ')}`.toLowerCase().includes(query.toLowerCase())) : [];
  const nav = [['home', 'Heritage', '#/'], ['diamond', 'Signature Atelier', '#/atelier'], ['dashboard', 'Collections', '#/collections'], ['history', 'Our Story', '#/story'], ['shopping_bag', 'Shopping Bag', '#/bag'], ['inventory_2', 'Track Your Order', '#/tracking']];
  return <>
    <header className="topbar">
      <button className="icon-button menu-toggle" aria-label="Open menu" onClick={() => setMenuOpen(true)}><span className="icon">menu</span></button>
      <a className="brand" href="#/">FHIFE LUXE</a>
      <div className="top-actions">
        <button className="search-button icon-button" aria-label="Search" onClick={() => setSearchOpen(true)}><span className="icon">search</span></button>
        <a className={`icon-button ${active === 'bag' ? 'active' : ''}`} href="#/bag" aria-label="Shopping bag"><span className="icon">shopping_bag</span><b className="badge-count" style={{ display: count ? 'inline-flex' : 'none' }}>{count}</b></a>
      </div>
    </header>
    {menuOpen && <div className="nav-drawer-backdrop" onClick={() => setMenuOpen(false)}><div className="nav-drawer-panel" onClick={(event) => event.stopPropagation()}>
      <div className="drawer-header"><a className="brand" href="#/">FHIFE LUXE</a><button className="icon-button" aria-label="Close menu" onClick={() => setMenuOpen(false)}><span className="icon">close</span></button></div>
      <nav className="drawer-nav">{nav.map(([icon, label, href]) => <a href={href} key={label}><span className="icon">{icon}</span><span>{label}</span></a>)}</nav>
      <div className="drawer-footer"><p className="drawer-quote">“Modern Nigerian Olfactory Masterpieces”</p><span className="drawer-copyright">LAGOS • ABUJA • LONDON</span></div>
    </div></div>}
    {searchOpen && <div className="modal-backdrop" role="presentation" onClick={() => setSearchOpen(false)}><div className="modal-card search-modal-card" role="dialog" aria-modal="true" aria-label="Search creations" onClick={(event) => event.stopPropagation()}>
      <button className="modal-close" aria-label="Close search" onClick={() => setSearchOpen(false)}><span className="icon">close</span></button><div className="search-modal-header"><span className="eyebrow">THE ARCHIVE SEARCH</span><h2>Search Fragrances &amp; Pieces</h2></div>
      <div className="search-input-wrap"><span className="icon">search</span><input autoFocus value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search by scent note, name, or material..." /></div>
      <div className="search-results-list">{!query.trim() ? <p className="search-hint">Type to discover our olfactory notes and artisanal creations.</p> : results.length ? results.map((product) => <div className="search-result-item" key={product.id}><img src={product.image} alt={product.name} /><div className="search-result-info"><strong>{product.name}</strong><span>{product.category} • {product.profile} • {money.format(product.price)}</span></div><button className="search-quick-add gold-button" onClick={() => add(product)}>ADD</button></div>) : <p className="search-empty">No creations found matching “{query}”.</p>}</div>
    </div></div>}
  </>;
}

function SiteFrame({ page, active, children }) {
  useEffect(() => {
    document.body.className = page;
    window.scrollTo(0, 0);
    return () => { document.body.className = ''; };
  }, [page]);
  return <><Header active={active} />{children}<nav className="mobile-nav" aria-label="Mobile navigation"><a href="#/"><span className="icon">auto_awesome</span><span>HERITAGE</span></a><a href="#/atelier"><span className="icon">diamond</span><span>ATELIER</span></a><a href="#/collections"><span className="icon">dashboard</span><span>COLLECTIONS</span></a><a href="#/story"><span className="icon">history</span><span>OUR STORY</span></a><a href="#/bag"><span className="icon">shopping_bag</span><span>BAG</span></a></nav><footer className="footer"><a className="brand" href="#/">FHIFE LUXE</a><nav aria-label="Footer navigation"><a href="#/">HERITAGE</a><a href="#/atelier">ATELIER</a><a href="#/collections">COLLECTIONS</a><a href="#/story">OUR STORY</a><a href="#/tracking">TRACK ORDER</a></nav><span>© 2026 FHIFE LUXE ATELIER • ALL RIGHTS RESERVED</span></footer></>;
}

function HomePage() {
  const [message, setMessage] = useState('');
  const { notify } = useCart();
  const subscribe = (event) => {
    event.preventDefault();
    const email = new FormData(event.currentTarget).get('email').trim().toLowerCase();
    const list = readStorage(NEWSLETTER_KEY, []);
    if (!list.includes(email)) saveStorage(NEWSLETTER_KEY, [...list, email]);
    setMessage(list.includes(email) ? 'You are already registered to receive the Atelier Letter.' : 'Welcome to the FHIFE LUXE Atelier Letter.');
    event.currentTarget.reset();
    notify('Subscribed to the Atelier Letter');
  };
  return <SiteFrame page="home-page"><main>
    <section className="hero"><div className="hero-image" aria-hidden="true" /><div className="hero-content reveal visible"><p className="eyebrow">SIGNATURE FRAGRANCE</p><h1>The Essence of Lagos</h1><div className="hero-details"><a className="gold-button" href="#/collections">EXPERIENCE THE SCENT</a><p>A sensory tribute to the vibration of West Africa’s most dynamic city. Notes of coastal salt, vetiver, and ancient oud.</p></div></div></section>
    <section className="section arrivals" id="arrivals"><div className="section-heading"><div><p className="eyebrow">THE ATELIER</p><h2>New Arrivals in Jewelry</h2><p className="body-copy">A fusion of traditional beadwork and contemporary goldsmithing, handcrafted by master artisans in Abuja.</p></div><a className="text-link" href="#/collections">VIEW ALL PIECES</a></div><div className="bento-grid"><a className="bento-item bento-main" href="#/collections"><div className="bento-image bento-necklace" /><div className="bento-label"><p>ORA COLLECTION</p><h3>The Royal Aso Neckpiece</h3></div></a><div className="bento-side"><a className="bento-item" href="#/collections"><div className="bento-image bento-hoops" /><div className="bento-label"><h3>Heritage Hoops</h3></div></a><a className="bento-item" href="#/collections"><div className="bento-image bento-cuff" /><div className="bento-label"><h3>Adire Cuff Series</h3></div></a></div></div></section>
    <section className="heritage-section"><div className="heritage-inner"><div className="heritage-image" role="img" aria-label="FHIFE LUXE Heritage perfume bottle surrounded by incense smoke" /><div className="heritage-copy"><p className="eyebrow">LIMITED RELEASE</p><h2>The Heritage Collection: Ancestral Oud</h2><p className="large-copy">A scent that bridges generations. Formulated using rare oils sourced across the continent, capturing the smoky warmth of hearth fires and the sweetness of wild honey.</p><ul className="notes"><li><strong>TOP</strong><span>Bergamot, Nigerian Ginger, Saffron</span></li><li><strong>HEART</strong><span>Damask Rose, Incense, Cedarwood</span></li><li><strong>BASE</strong><span>Aged Oud, Vanilla, Tobacco Leaf</span></li></ul><a className="outline-button" href="#/atelier">EXPLORE SIGNATURE SCENT</a></div></div></section>
    <section className="section press-section"><div className="section-heading text-center"><p className="eyebrow">CRITICAL ACCLAIM</p><h2>Voices of Global Luxury</h2></div><div className="press-grid"><blockquote className="press-card"><p className="press-quote">“FHIFE LUXE has redefined contemporary African perfumery—a triumph of rare botanicals and ancestral reverence.”</p><cite className="press-source">— VOGUE LUXURY</cite></blockquote><blockquote className="press-card"><p className="press-quote">“The most compelling artisanal objects emerging from West Africa today. Each creation is a museum-grade heirloom.”</p><cite className="press-source">— GQ INTERNATIONAL</cite></blockquote><blockquote className="press-card"><p className="press-quote">“An olfactory journey that captures Lagos' intoxicating rhythm with unparalleled poise and sophistication.”</p><cite className="press-source">— THE LAGOS REVIEW</cite></blockquote></div></section>
    <section className="newsletter section"><div className="newsletter-inner"><p className="eyebrow">THE ATELIER LETTER</p><h2>Join the Atelier</h2><p className="body-copy">Receive exclusive access to bespoke launches and artisanal stories from the heart of the continent.</p><form className="signup-form" onSubmit={subscribe}><input type="email" name="email" placeholder="EMAIL ADDRESS" aria-label="Email address" required /><button type="submit">SUBSCRIBE</button></form><p className="form-message" aria-live="polite">{message}</p></div></section>
  </main></SiteFrame>;
}

function ProductCard({ product, tall = false, onQuickView }) {
  const { add } = useCart();
  const notes = product.notes || {};
  const noteSummary = notes.top || notes.material || product.description;
  return <article className={`product-card ${tall ? 'product-card-tall' : ''}`} style={{ '--image': `url('${product.image}')` }}><div className="product-badge">{product.badge}</div><div className="product-info"><p>{product.category.toUpperCase()} • {product.profile}</p><h2>{product.name.toUpperCase()}</h2><span className="card-notes">{noteSummary}</span><div className="card-action-row"><strong className="card-price">{money.format(product.price)}</strong><div className="card-buttons"><button className="quick-view-btn" type="button" onClick={() => onQuickView(product)}>QUICK VIEW</button><button className="add-card-btn" type="button" onClick={() => add(product)}>ADD TO BAG</button></div></div></div></article>;
}

function QuickViewModal({ product, onClose }) {
  const { add } = useCart();
  const [quantity, setQuantity] = useState(1);
  if (!product) return null;
  const noteLabels = product.category === 'fragrance' ? [['TOP NOTES', product.notes.top], ['HEART NOTES', product.notes.heart], ['BASE NOTES', product.notes.base]] : [['MATERIAL', product.notes.material], ['CRAFT', product.notes.craft], ['ORIGIN', product.notes.origin]];
  return <div className="modal-backdrop" onClick={onClose}><div className="modal-card quick-view-modal-card" role="dialog" aria-modal="true" aria-label={`${product.name} details`} onClick={(event) => event.stopPropagation()}><button className="modal-close" onClick={onClose} aria-label="Close details"><span className="icon">close</span></button><div className="quick-view-body"><div className="quick-view-grid"><div className="quick-view-media" style={{ backgroundImage: `url('${product.image}')` }}><span className="product-badge">{product.badge}</span></div><div className="quick-view-details"><span className="eyebrow">{product.category.toUpperCase()} • {product.profile}</span><h2>{product.name}</h2><strong className="quick-price">{money.format(product.price)}</strong><p className="quick-desc">{product.description}</p><div className="quick-notes-grid">{noteLabels.filter(([, value]) => value).map(([label, value]) => <div className="note-pill" key={label}><strong>{label}</strong><span>{value}</span></div>)}</div><div className="quick-action-row"><div className="quantity-control"><button className="quantity-button" onClick={() => setQuantity((value) => Math.max(1, value - 1))} aria-label="Decrease quantity"><span className="icon">remove</span></button><span className="quantity">{quantity}</span><button className="quantity-button" onClick={() => setQuantity((value) => value + 1)} aria-label="Increase quantity"><span className="icon">add</span></button></div><button className="gold-button" onClick={() => { add(product, quantity); onClose(); }}>ADD TO BAG <span className="icon">shopping_bag</span></button></div>{product.id === 'orijin-oud' && <a className="card-detail-link" href="#/atelier">EXPLORE FULL ATELIER STORY →</a>}</div></div></div></div></div>;
}

function CollectionsPage() {
  const [category, setCategory] = useState('fragrance');
  const [profile, setProfile] = useState('all');
  const [maxPrice, setMaxPrice] = useState(1500000);
  const [quickProduct, setQuickProduct] = useState(null);
  const filters = category === 'fragrance' ? ['all', 'Oud', 'Floral', 'Spicy', 'Citrus'] : ['all', 'Handcrafted Gold', 'Beadwork', 'Gemstones', 'Silver Filigree'];
  const shown = products.filter((product) => product.category === category && (profile === 'all' || product.profile.toLowerCase() === profile.toLowerCase()) && product.price <= maxPrice);
  const reset = () => { setProfile('all'); setMaxPrice(1500000); };
  return <SiteFrame page="collections-page" active="collections"><main className="page-shell"><section className="page-heading"><p className="eyebrow">THE HOUSE ATELIER</p><h1>House Collections</h1><div className="category-tabs" role="tablist"><button className={`tab-button ${category === 'fragrance' ? 'active' : ''}`} role="tab" aria-selected={category === 'fragrance'} onClick={() => { setCategory('fragrance'); setProfile('all'); }}>FRAGRANCE</button><button className={`tab-button ${category === 'jewelry' ? 'active' : ''}`} role="tab" aria-selected={category === 'jewelry'} onClick={() => { setCategory('jewelry'); setProfile('all'); }}>JEWELRY</button></div></section>
    <div className="collection-layout"><aside className="filters" aria-label="Collection filters"><div className="filter-group"><h2>{category === 'fragrance' ? 'SCENT PROFILES' : 'CRAFTSMANSHIP'}</h2>{filters.map((value) => <button key={value} className={`filter-link ${profile === value ? 'active' : ''}`} onClick={() => setProfile(value)}>{value === 'all' ? (category === 'fragrance' ? 'All Profiles' : 'All Crafts') : value} <span>{value !== 'all' && `(${products.filter((p) => p.category === category && p.profile === value).length})`}</span></button>)}</div><div className="price-filter"><h2>PRICE RANGE</h2><input type="range" min="100000" max="1500000" step="50000" value={maxPrice} onChange={(event) => setMaxPrice(Number(event.target.value))} aria-label="Maximum price" /><div className="price-labels"><span>₦100,000</span><span>Up to {money.format(maxPrice)}</span></div></div><button className="outline-button reset-filter-btn" onClick={reset}>RESET FILTERS</button></aside><section className="gallery" aria-label="Products">{shown.map((product, index) => <ProductCard key={product.id} product={product} tall={index % 3 === 0} onQuickView={setQuickProduct} />)}{shown.length === 0 && <p className="search-empty">No creations match these filters.</p>}</section></div>
    <QuickViewModal product={quickProduct} onClose={() => setQuickProduct(null)} />
  </main></SiteFrame>;
}

function AtelierPage() {
  const product = products.find((item) => item.id === 'orijin-oud');
  const { add, notify } = useCart();
  const [sampleOpen, setSampleOpen] = useState(false);
  const [sampleMessage, setSampleMessage] = useState('');
  const requestSample = (event) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const request = { id: `SAMPLE-${Date.now()}`, fullName: form.get('fullName'), email: form.get('email'), address: form.get('address'), fragranceName: 'Orijin Oud (5ml Sample Vial)', requestedAt: new Date().toISOString() };
    saveStorage(SAMPLES_KEY, [...readStorage(SAMPLES_KEY, []), request]);
    setSampleMessage('Your discovery vial request has been saved in this browser.');
    event.currentTarget.reset();
    notify('Discovery sample request saved');
  };
  return <SiteFrame page="oud-page" active="atelier"><main><section className="product-hero"><div className="hero-image" /><div className="hero-content reveal-on-load"><p className="eyebrow">SIGNATURE SCENT NO. 04</p><h1>Orijin Oud</h1><p className="hero-description">{product.description}</p><div className="hero-actions"><button className="gold-button" onClick={() => add(product)}>ADD TO BAG — {money.format(product.price)}</button><button className="outline-button" onClick={() => setSampleOpen(true)}>REQUEST SAMPLE</button></div></div></section><section className="notes-section"><div className="composition-intro"><p className="eyebrow">THE COMPOSITION</p><p className="composition-quote">“A liquid poem of resilience and regality.”</p></div><div className="notes-grid"><article className="note"><p className="note-label">TOP NOTES</p><h2>Bergamot &amp; Saffron</h2><p>The bright citrus opening of sun-drenched Bergamot melds into the spicy warmth of Nigerian Red Saffron.</p></article><article className="note"><p className="note-label">HEART NOTES</p><h2>Oud &amp; Damask Rose</h2><p>A powerful heart of rare, aged Oud Wood entwined with hand-picked Damask Rose petals.</p></article><article className="note"><p className="note-label">BASE NOTES</p><h2>Sandalwood &amp; Amber</h2><p>A lingering trail of Mysore Sandalwood and Gold Amber anchors the scent for 12+ hours.</p></article></div></section><section className="story-section"><div className="story-image" /><div className="story-copy"><p className="eyebrow">THE STORY</p><h2>Cultural Alchemy</h2><p>Inspired by the ritualistic 'Aro' incense ceremonies of southwestern Nigeria, Orijin Oud is more than a fragrance: it is a bridge across time. We sought to capture the essence of the <em>Iroko</em> tree, the 'King of the Forest'.</p><blockquote>“Fragrance is the invisible bridge between memory and the present moment.”</blockquote></div></section><section className="craft-section"><div className="craft-heading"><h2>Artisanal Mastery</h2><p>NIGERIAN SOURCING • SUSTAINABLE PROCESS</p></div><div className="craft-grid"><article className="craft-feature"><div className="craft-forest" /><div><h3>Wild Harvested Resin</h3><p>Ethically tapped resins, gathered with care for the forest ecosystem.</p></div></article><article className="craft-card"><span className="icon">workspace_premium</span><h3>Small Batch Distillation</h3><p>Each 50ml bottle undergoes a 90-day maturation process.</p></article><article className="craft-feature craft-ingredients"><div><h3>Noble Ingredients</h3><p>Botanical resins, Damask roses, and aged cedar heartwood.</p></div></article></div></section><section className="final-cta"><div><h2>Experience Orijin Oud</h2><p>Complimentary artisanal packaging and express courier shipping on all orders.</p></div><button className="primary-button" onClick={() => add(product)}>ADD TO BAG <span className="icon">shopping_bag</span></button></section></main>
    {sampleOpen && <div className="modal-backdrop" onClick={() => setSampleOpen(false)}><div className="modal-card sample-modal-card" role="dialog" aria-modal="true" onClick={(event) => event.stopPropagation()}><button className="modal-close" onClick={() => setSampleOpen(false)} aria-label="Close modal"><span className="icon">close</span></button><div className="modal-header"><p className="eyebrow">DISCOVERY ATELIER</p><h2>Request Discovery Sample</h2><p className="modal-desc">Receive a 5ml discovery vial of Orijin Oud.</p></div><form className="sample-form" onSubmit={requestSample}><div className="form-group"><label>Full Name *</label><input name="fullName" required /></div><div className="form-group"><label>Email Address *</label><input name="email" type="email" required /></div><div className="form-group"><label>Delivery Address</label><input name="address" /></div><button className="gold-button">REQUEST 5ML DISCOVERY VIAL</button><p className="form-message form-success">{sampleMessage}</p></form></div></div>}
  </SiteFrame>;
}

function StoryPage() {
  return <SiteFrame page="story-page"><main><section className="hero"><div className="hero-media" /><div className="hero-content"><span className="eyebrow reveal visible">THE GENESIS</span><h1 className="reveal visible">Born from the Heart of Lagos</h1><p className="hero-copy reveal visible">FHIFE LUXE was founded as a tribute to the vibrant, untamed spirit of Nigerian heritage. We translate centuries of artisanal wisdom into modern olfactory and ornamental masterpieces.</p><span className="icon scroll-cue">expand_more</span></div></section><section className="section craft"><div className="craft-grid"><div><span className="eyebrow">THE CRAFT</span><h2>Mastery in Every Movement</h2><p className="body-copy">In our Lagos atelier, time slows down. We honor the slow luxury movement, where every hand-poured candle and hand-forged piece carries the soul of its maker.</p><p className="body-copy">Our goldsmiths use traditional Nigerian filigree techniques, while our perfumers source the finest botanical resins from the Sahel.</p></div><div className="craft-images"><img src={products[6].image} alt="Handcrafted jewelry" /><img src={products[0].image} alt="Orijin Oud fragrance" /></div></div></section><section className="ticker"><div className="ticker-track"><span>TRADITION REIMAGINED —</span><span>LAGOS HERITAGE —</span><span>ARTISANAL EXCELLENCE —</span><span>TRADITION REIMAGINED —</span></div></section><section className="section"><div className="section-heading"><h2>The Pillars of Our House</h2></div><div className="pillars"><article className="pillar"><div className="pillar-image"><img src={products[1].image} alt="Fragrance from the heritage collection" /></div><h3>Provenance</h3><p className="body-copy">Every ingredient and metal is ethically sourced from the Nigerian landscape, ensuring a direct link to the earth.</p></article><article className="pillar"><div className="pillar-image"><img src={products[7].image} alt="Artisanal jewelry" /></div><h3>Precision</h3><p className="body-copy">Traditional craftsmanship and contemporary design aesthetics create timeless artifacts.</p></article><article className="pillar"><div className="pillar-image"><img src={products[0].image} alt="Signature perfume" /></div><h3>Purpose</h3><p className="body-copy">Every piece celebrates the makers, materials, and stories of our home.</p></article></div></section><section className="quote-section"><span className="quote-mark">“</span><p className="quote">We create objects that carry a sense of place, memory, and possibility.</p><span className="cite">FHIFE LUXE ATELIER</span></section></main></SiteFrame>;
}

function BagPage() {
  const { cart, update, remove, setCart, notify } = useCart();
  const [giftWrap, setGiftWrap] = useState(false);
  const [giftMessage, setGiftMessage] = useState('');
  const [promoInput, setPromoInput] = useState('');
  const [discountRate, setDiscountRate] = useState(0);
  const [promoMessage, setPromoMessage] = useState('');
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [error, setError] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('Secure Card (ILÉ Pay)');
  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const discount = Math.round(subtotal * discountRate);
  const giftFee = giftWrap ? 15000 : 0;
  const total = Math.max(0, subtotal - discount + giftFee);
  const itemCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const applyPromo = () => {
    const code = promoInput.trim().toUpperCase();
    const rate = ['LAGOS10', 'ATELIERLUXE', 'WELCOME10'].includes(code) ? 0.1 : code === 'HERITAGE20' ? 0.2 : 0;
    setDiscountRate(rate);
    setPromoMessage(rate ? `Privilege code “${code}” applied (${rate * 100}% savings).` : `Privilege code “${code}” is invalid or expired.`);
    if (rate) notify(`Privilege code ${code} applied`);
  };
  const submitOrder = (event) => {
    event.preventDefault();
    if (!cart.length) { setError('Your shopping bag is empty.'); return; }
    const fields = new FormData(event.currentTarget);
    const customer = Object.fromEntries(['fullName', 'email', 'phone', 'address', 'city', 'state', 'postalCode', 'notes'].map((key) => [key, fields.get(key) || '']));
    const orderNumber = `FL-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
    const now = new Date().toISOString();
    const order = { orderNumber, status: 'Confirmed', createdAt: now, estimatedDelivery: new Date(Date.now() + 3 * 86400000).toISOString(), customer, items: cart.map((item) => ({ ...item, lineTotal: item.price * item.quantity })), itemCount, gifting: { includeWrap: giftWrap, message: giftMessage.trim() }, payment: { method: paymentMethod, status: 'Paid / Authorized' }, pricing: { subtotal, discount, promoCode: promoInput.toUpperCase(), giftWrapFee: giftFee, shippingFee: 0, grandTotal: total, currency: 'NGN' }, notes: customer.notes };
    saveStorage(ORDERS_KEY, [order, ...readStorage(ORDERS_KEY, [])]);
    setCart([]);
    window.location.hash = `#/confirmation?id=${encodeURIComponent(orderNumber)}`;
  };
  return <SiteFrame page="bag-page-body" active="bag"><main className="bag-page"><div className="bag-layout"><section className="items-column"><header className="bag-heading"><h1>Shopping Bag</h1><span>{itemCount} {itemCount === 1 ? 'ITEM' : 'ITEMS'} TOTAL</span></header>{cart.length ? <div className="cart-items">{cart.map((item) => <article className="cart-item" key={item.id}><div className="item-image" style={{ backgroundImage: `url('${item.image}')` }} role="img" aria-label={item.name} /><div className="item-details"><div className="item-topline"><div><p className="eyebrow">{item.category}</p><h2>{item.name}</h2><p className="item-meta">{item.size}</p></div><strong className="item-price">{money.format(item.price * item.quantity)}</strong></div><div className="item-actions"><div className="quantity-control"><button className="quantity-button" onClick={() => update(item.id, Math.max(1, item.quantity - 1))} aria-label="Decrease quantity"><span className="icon">remove</span></button><span className="quantity">{item.quantity}</span><button className="quantity-button" onClick={() => update(item.id, item.quantity + 1)} aria-label="Increase quantity"><span className="icon">add</span></button></div><button className="remove-button" onClick={() => remove(item.id)}><span className="icon">delete</span> REMOVE</button></div></div></article>)}</div> : <div className="empty-cart-state"><span className="icon empty-bag-icon">shopping_bag</span><h2>Your Atelier Bag is Empty</h2><p>You have not selected any fragrances or artisanal pieces yet.</p><a className="gold-button" href="#/collections">EXPLORE THE COLLECTIONS</a></div>}
    {cart.length > 0 && <section className="gift-panel"><div className="gift-heading"><span className="icon">card_giftcard</span><h2>Personalized Gifting</h2></div><label className="field-label" htmlFor="gift-message">ADD A GIFT MESSAGE <span>(HANDWRITTEN BY OUR SCRIBES)</span></label><textarea id="gift-message" value={giftMessage} onChange={(event) => setGiftMessage(event.target.value)} placeholder="Write your personalized gift message here..." /><label className="checkbox-row"><input type="checkbox" checked={giftWrap} onChange={(event) => setGiftWrap(event.target.checked)} /><span>Include signature velvet box &amp; wax-sealed artisanal gift wrapping (+ ₦15,000)</span></label></section>}</section>
    {cart.length > 0 && <aside className="summary-card"><h2>Order Summary</h2><div className="promo-box"><label className="field-label" htmlFor="promo-input">ATELIER PRIVILEGE CODE</label><div className="promo-input-row"><input id="promo-input" value={promoInput} onChange={(event) => setPromoInput(event.target.value)} placeholder="e.g. LAGOS10" /><button className="gold-button" onClick={applyPromo}>APPLY</button></div><p className={`promo-msg ${discountRate ? 'success' : 'error'}`} aria-live="polite">{promoMessage}</p></div><div className="summary-lines"><div><span>Subtotal</span><strong>{money.format(subtotal)}</strong></div>{discount > 0 && <div className="discount-row"><span>Privilege Savings</span><strong>-{money.format(discount)}</strong></div>}<div><span>Gifting Services</span><strong>{money.format(giftFee)}</strong></div><div><span>Shipping (Domestic)</span><strong className="complimentary">Complimentary</strong></div></div><div className="summary-total"><span>Total</span><strong>{money.format(total)}</strong></div><button className="checkout-button" onClick={() => setCheckoutOpen(true)}>PROCEED TO CHECKOUT</button><p className="secure-note"><span className="icon lock-icon">lock</span> SECURE LUXURY TRANSACTION POWERED BY FHIFE PAY</p><div className="trust-list"><p><span className="icon">verified</span> Certificate of Authenticity Included</p><p><span className="icon">local_shipping</span> Dispatched within 48 hours</p><p><span className="icon">history_edu</span> Artisanal Hand-Poured &amp; Inspected</p></div></aside>}</div></main>
    {checkoutOpen && <div className="modal-backdrop" onClick={() => setCheckoutOpen(false)}><div className="modal-card checkout-modal-card" role="dialog" aria-modal="true" onClick={(event) => event.stopPropagation()}><button className="modal-close" onClick={() => setCheckoutOpen(false)} aria-label="Close modal"><span className="icon">close</span></button><div className="modal-header"><p className="eyebrow">BESPOKE ORDER</p><h2>Complete Your Commission</h2><p className="modal-desc">Please provide your delivery address and preferences for Atelier dispatch.</p></div><form className="checkout-form" onSubmit={submitOrder}><fieldset className="form-section"><legend><span className="section-step">1</span> Recipient Information</legend><div className="form-grid-2"><div className="form-group"><label>Full Name *</label><input name="fullName" required /></div><div className="form-group"><label>Email Address *</label><input name="email" type="email" required /></div></div><div className="form-group"><label>Phone Number *</label><input name="phone" type="tel" required /></div></fieldset><fieldset className="form-section"><legend><span className="section-step">2</span> Delivery Address</legend><div className="form-group"><label>Street Address *</label><input name="address" required /></div><div className="form-grid-3"><div className="form-group"><label>City *</label><input name="city" required /></div><div className="form-group"><label>State / Region *</label><input name="state" required /></div><div className="form-group"><label>Postal Code</label><input name="postalCode" /></div></div><div className="form-group"><label>Special Courier Instructions</label><input name="notes" /></div></fieldset><fieldset className="form-section"><legend><span className="section-step">3</span> Payment Preference</legend><div className="payment-options">{[['Secure Card (ILÉ Pay)', 'Secure Card Payment (ILÉ Pay)', 'credit_card'], ['Instant Bank Transfer', 'Instant Atelier Bank Transfer', 'account_balance'], ['Concierge Delivery (Pay on Arrival)', 'Atelier Concierge on Delivery', 'handshake']].map(([value, label, icon]) => <label key={value} className={`payment-card ${paymentMethod === value ? 'selected' : ''}`}><input type="radio" name="paymentMethod" value={value} checked={paymentMethod === value} onChange={() => setPaymentMethod(value)} /><div className="payment-content"><span className="icon">{icon}</span><div><strong>{label}</strong><span>Payment preference for your Atelier commission</span></div></div></label>)}</div><div className="payment-info-box"><span className="icon">lock</span> Payment preference is recorded with your order. No payment is processed in this frontend demo.</div></fieldset><div className="checkout-review"><div className="checkout-review-row"><span>Items ({itemCount})</span><strong>{money.format(subtotal)}</strong></div>{discount > 0 && <div className="checkout-review-row"><span>Privilege Savings</span><strong>-{money.format(discount)}</strong></div>}<div className="checkout-review-row"><span>Artisanal Gifting</span><strong>{money.format(giftFee)}</strong></div><div className="checkout-review-row total-row"><span>Amount Due</span><strong>{money.format(total)}</strong></div></div><p className="form-error-msg" aria-live="polite">{error}</p><button className="gold-button submit-order-btn" type="submit"><span className="btn-text">CONFIRM &amp; COMMISSION ORDER</span><span className="icon">arrow_forward</span></button></form></div></div>}
  </SiteFrame>;
}

function ConfirmationPage() {
  const { notify } = useCart();
  const params = new URLSearchParams(window.location.hash.split('?')[1] || '');
  const id = params.get('id') || '';
  const order = readStorage(ORDERS_KEY, []).find((entry) => entry.orderNumber === id);
  if (!order) return <SiteFrame page="bag-page-body confirmation-page"><main className="bag-page confirmation-shell"><div className="confirmation-container"><div className="confirmation-loading"><span className="icon">error_outline</span><p>We could not find this order in this browser.</p><a className="gold-button" href="#/tracking">TRACK AN ORDER</a></div></div></main></SiteFrame>;
  return <SiteFrame page="bag-page-body confirmation-page"><main className="bag-page confirmation-shell"><div className="confirmation-container"><div className="confirmation-card"><div className="confirmation-header"><div className="success-seal"><span className="icon">auto_awesome</span></div><p className="eyebrow">ORDER CONFIRMED</p><h1>Thank You for Your Patronage</h1><p className="confirmation-subtext">Your commission has been saved in this browser. No payment was processed and no order was sent to a server.</p><div className="order-ref-pill"><span>ORDER REFERENCE:</span><strong>{order.orderNumber}</strong><button className="copy-button" title="Copy Reference" onClick={() => { navigator.clipboard?.writeText(order.orderNumber); notify('Order reference copied'); }}><span className="icon">content_copy</span></button></div></div><div className="order-timeline-card"><h3>Atelier Dispatch Progress</h3><div className="timeline-steps">{['Order Placed', 'In Atelier Preparation', 'Dispatched', 'Delivered'].map((step, index) => <div className={`timeline-step ${index === 0 ? 'step-done' : index === 1 ? 'step-active' : ''}`} key={step}><div className="step-dot"><span className="icon">{index === 0 ? 'check' : index === 1 ? 'diamond' : 'local_shipping'}</span></div><div className="step-info"><strong>{step}</strong><span>{index === 0 ? dateLabel(order.createdAt, { day: 'numeric', month: 'short', year: 'numeric' }) : index === 1 ? 'Bottling & Scribe Gifting' : index === 2 ? 'Secure Courier Dispatch' : `Estimated ${dateLabel(order.estimatedDelivery, { day: 'numeric', month: 'short' })}`}</span></div></div>)}</div></div><div className="order-details-grid"><div className="order-meta-card"><h3><span className="icon">location_on</span> Delivery Address</h3><p className="recipient-name">{order.customer.fullName}</p><p>{order.customer.address}, {order.customer.city}, {order.customer.state}</p><p>{order.customer.phone} • {order.customer.email}</p><div className="meta-divider" /><h3><span className="icon">payments</span> Payment Preference</h3><p>{order.payment.method} — Not processed</p>{order.gifting.message && <div className="gift-message-box"><div className="gift-label"><span className="icon">card_giftcard</span> Handwritten Scribe Message</div><p>“{order.gifting.message}”</p></div>}</div><div className="order-items-card"><h3><span className="icon">shopping_bag</span> Commissioned Items</h3><div className="ordered-items-list">{order.items.map((item) => <div className="ordered-item-row" key={item.id}><div className="ordered-item-thumb" style={{ backgroundImage: `url('${item.image}')` }} /><div className="ordered-item-info"><strong>{item.name}</strong><span>Quantity: {item.quantity} × {money.format(item.price)}</span></div><strong className="ordered-item-total">{money.format(item.lineTotal)}</strong></div>)}</div><div className="order-receipt-summary"><div className="receipt-row"><span>Subtotal</span><strong>{money.format(order.pricing.subtotal)}</strong></div><div className="receipt-row"><span>Privilege Savings</span><strong>-{money.format(order.pricing.discount)}</strong></div><div className="receipt-row"><span>Artisanal Gift Wrapping</span><strong>{money.format(order.pricing.giftWrapFee)}</strong></div><div className="receipt-row"><span>Domestic Luxury Delivery</span><strong className="complimentary">Complimentary</strong></div><div className="receipt-row receipt-grand"><span>Total Amount</span><strong>{money.format(order.pricing.grandTotal)}</strong></div></div></div></div><div className="confirmation-actions"><a className="gold-button" href="#/collections">CONTINUE EXPLORING</a><a className="outline-button" href={`#/tracking?orderId=${encodeURIComponent(order.orderNumber)}`}>TRACK IN THIS BROWSER</a><button className="text-button" onClick={() => window.print()}><span className="icon">print</span> PRINT RECEIPT</button></div></div></div></main></SiteFrame>;
}

function TrackingPage() {
  const params = new URLSearchParams(window.location.hash.split('?')[1] || '');
  const [ref, setRef] = useState(params.get('orderId') || '');
  const [order, setOrder] = useState(null);
  const [error, setError] = useState('');
  useEffect(() => { if (ref) findOrder(ref); }, []);
  const findOrder = (value) => {
    const found = readStorage(ORDERS_KEY, []).find((entry) => entry.orderNumber.toUpperCase() === value.trim().toUpperCase());
    setOrder(found || null);
    setError(found ? '' : 'No order found in this browser. Orders are only available on the device where checkout was completed.');
  };
  return <SiteFrame page="bag-page-body tracking-page"><main className="bag-page tracking-shell"><div className="tracking-container"><div className="tracking-search-box"><span className="eyebrow">CONCIERGE TRACKING</span><h1>Track Your Order</h1><p className="tracking-subtitle">Enter the reference generated during checkout. Order history is stored locally in this browser.</p><form className="tracking-form" onSubmit={(event) => { event.preventDefault(); findOrder(ref); }}><div className="input-with-button"><span className="icon">inventory_2</span><input value={ref} onChange={(event) => setRef(event.target.value)} placeholder="e.g. FL-2026-8942" required /><button className="gold-button">LOOK UP ORDER</button></div></form>{error && <p className="form-message form-error">{error}</p>}</div>{order && <div className="tracking-result"><div className="tracking-card"><div className="tracking-header"><div><span className="eyebrow">ORDER REFERENCE</span><h2>{order.orderNumber}</h2><span className="status-badge badge-confirmed">Status: {order.status}</span></div><div className="tracking-est"><span>Estimated Delivery</span><strong>{dateLabel(order.estimatedDelivery, { day: 'numeric', month: 'long', year: 'numeric' })}</strong></div></div><div className="tracking-steps-box">{['Order Commissioned', 'In Atelier Preparation', 'Dispatched via Secure Courier', 'Delivered'].map((step, index) => <div className={`track-step ${index === 0 ? 'completed' : index === 1 ? 'active' : ''}`} key={step}><div className="track-icon"><span className="icon">{index === 0 ? 'done' : index === 1 ? 'diamond' : 'local_shipping'}</span></div><div><strong>{step}</strong><p>{index === 0 ? 'Order logged in this browser' : index === 1 ? 'Atelier preparation status is a demo' : 'Status updates require a connected fulfillment service'}</p>{index === 0 && <small>{new Date(order.createdAt).toLocaleString('en-NG', { dateStyle: 'medium', timeStyle: 'short' })}</small>}</div></div>)}</div><div className="tracking-items-preview"><h3>Commission Breakdown ({order.itemCount} items)</h3>{order.items.map((item) => <div className="track-item-row" key={item.id}><span>{item.quantity} × {item.name}</span><strong>{money.format(item.lineTotal)}</strong></div>)}<div className="track-total"><span>Total</span><strong>{money.format(order.pricing.grandTotal)}</strong></div></div></div></div>}</div></main></SiteFrame>;
}

function App() {
  const [hash, setHash] = useState(window.location.hash);
  useEffect(() => {
    const updateHash = () => setHash(window.location.hash);
    window.addEventListener('hashchange', updateHash);
    return () => window.removeEventListener('hashchange', updateHash);
  }, []);
  const route = hash.replace(/^#\/?/, '').split('?')[0];
  const pages = { collections: <CollectionsPage />, atelier: <AtelierPage />, story: <StoryPage />, bag: <BagPage />, confirmation: <ConfirmationPage />, tracking: <TrackingPage /> };
  return <CartProvider>{pages[route] || <HomePage />}</CartProvider>;
}

export default App;
