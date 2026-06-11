const products = [
    { id: 1, name: "Красные человек-паук", price: 9999, color: "Красный", size: "39-42", material: "Хлопок", gender: "Унисекс", brand: "Royal Silk", rating: 4.5, image: "https://i.pinimg.com/736x/cf/aa/f6/cfaaf69136bd31cc3940e3eaf884676e.jpg" },
    { id: 2, name: "Синие акулята", price: 5999, color: "Синий", size: "35-38", material: "Шерсть", gender: "Женские", brand: "Golden Thread", rating: 4.8, image: "https://i.pinimg.com/1200x/7a/89/12/7a89126f16974f3daeb7a4933ca4260e.jpg" },
    { id: 3, name: "Черные спортивные", price: 2999, color: "Черный", size: "43-46", material: "Хлопок", gender: "Мужские", brand: "Black Label", rating: 4.2, image: "https://i.pinimg.com/1200x/fb/3d/9a/fb3d9a647778466a042741288a420e67.jpg" },
    { id: 4, name: "Белые премиум", price: 2499, color: "Белый", size: "39-42", material: "Хлопок", gender: "Унисекс", brand: "Royal Silk", rating: 4.6, image: "https://i.pinimg.com/736x/b1/37/2e/b1372eb92e6a9c28228a4859edb574d7.jpg" },
    { id: 5, name: "Зеленые монстр", price: 4999, color: "Зеленый", size: "39-42", material: "Шерсть", gender: "Унисекс", brand: "Golden Thread", rating: 4.9, image: "https://i.pinimg.com/1200x/01/99/67/01996739632c2fea66bb20593c62977e.jpg" },
    { id: 6, name: "Коллекция", price: 13499, color: "Розовый", size: "35-38", material: "Шёлк", gender: "Женские", brand: "Royal Silk", rating: 4.7, image: "https://i.pinimg.com/736x/47/ec/22/47ec22edf116df9ed3ae2a209fe96f6e.jpg" },
    { id: 7, name: "Серые стильные мужские", price: 5999, color: "Серый", size: "43-46", material: "Кашемир", gender: "Мужские", brand: "Black Label", rating: 4.9, image: "https://i.pinimg.com/736x/2a/5d/bd/2a5dbdc2b64db8ac5733bbfa2d2ee37c.jpg" },
    { id: 8, name: "Желтые свага", price: 2799, color: "Желтый", size: "35-38", material: "Хлопок", gender: "Детские", brand: "Golden Thread", rating: 4.4, image: "https://i.pinimg.com/1200x/42/6e/6f/426e6f81132af590dbbddfb05fc6a150.jpg" }
];

let currentUser = JSON.parse(localStorage.getItem('currentUser')) || null;
let users = JSON.parse(localStorage.getItem('users')) || [];
let cart = JSON.parse(localStorage.getItem('cart')) || [];
let favorites = JSON.parse(localStorage.getItem('favorites')) || [];
let reviews = JSON.parse(localStorage.getItem('reviews')) || [];
let bonusPoints = JSON.parse(localStorage.getItem('bonusPoints')) || 0;
let currentPage = 1;
let itemsPerPage = 9;
let currentRating = 0;
let currentSlide = 0;

let catchGameActive = false;
let catchGameAnimation = null;
let socks = [];
let catchScore = 0;
let catcherX = 200;

if (reviews.length === 0) {
    reviews = [
        { id: 1, userId: "demo@mail.com", userName: "Анна", text: "Отличные носки! Мягкие и теплые.", rating: 5, date: new Date().toISOString() },
        { id: 2, userId: "demo2@mail.com", userName: "Михаил", text: "Быстрая доставка, качество супер!", rating: 5, date: new Date().toISOString() }
    ];
    localStorage.setItem('reviews', JSON.stringify(reviews));
}

function showToast(message, type = 'success') {
    const toast = document.getElementById('toast');
    toast.textContent = message;
    toast.style.background = type === 'success' ? '#d4af37' : '#d63031';
    toast.style.color = type === 'success' ? '#000' : '#fff';
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 3000);
}

function saveData() {
    localStorage.setItem('users', JSON.stringify(users));
    localStorage.setItem('cart', JSON.stringify(cart));
    localStorage.setItem('favorites', JSON.stringify(favorites));
    localStorage.setItem('reviews', JSON.stringify(reviews));
    localStorage.setItem('bonusPoints', bonusPoints);
    if (currentUser) localStorage.setItem('currentUser', JSON.stringify(currentUser));
    else localStorage.removeItem('currentUser');
}

function updateCounters() {
    const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);
    document.getElementById('cartCount').textContent = cartCount;
    document.getElementById('favoritesCount').textContent = favorites.length;
    document.getElementById('bonusPoints').textContent = bonusPoints.toFixed(1);
}

function getFilteredProducts() {
    let filtered = [...products];
    const maxPrice = parseFloat(document.getElementById('priceFilter')?.value) || 50000;
    filtered = filtered.filter(p => p.price <= maxPrice);
    const color = document.getElementById('colorFilter')?.value;
    if (color) filtered = filtered.filter(p => p.color === color);
    const size = document.getElementById('sizeFilter')?.value;
    if (size) filtered = filtered.filter(p => p.size === size);
    const material = document.getElementById('materialFilter')?.value;
    if (material) filtered = filtered.filter(p => p.material === material);
    const gender = document.getElementById('genderFilter')?.value;
    if (gender) filtered = filtered.filter(p => p.gender === gender);
    const brand = document.getElementById('brandFilter')?.value;
    if (brand) filtered = filtered.filter(p => p.brand === brand);
    const search = document.getElementById('searchInput')?.value.toLowerCase();
    if (search) filtered = filtered.filter(p => p.name.toLowerCase().includes(search));
    const sort = document.getElementById('sortSelect')?.value;
    if (sort === 'price_asc') filtered.sort((a, b) => a.price - b.price);
    if (sort === 'price_desc') filtered.sort((a, b) => b.price - a.price);
    if (sort === 'rating') filtered.sort((a, b) => b.rating - a.rating);
    if (sort === 'name') filtered.sort((a, b) => a.name.localeCompare(b.name));
    return filtered;
}

function renderCatalog() {
    const filtered = getFilteredProducts();
    const totalPages = Math.ceil(filtered.length / itemsPerPage);
    const start = (currentPage - 1) * itemsPerPage;
    const pageProducts = filtered.slice(start, start + itemsPerPage);
    const catalogDiv = document.getElementById('catalog');
    document.getElementById('resultsCount').textContent = `Найдено товаров: ${filtered.length}`;
    if (pageProducts.length === 0) {
        catalogDiv.innerHTML = '<div style="text-align:center;padding:50px"><i class="fas fa-socks"></i><p>Товаров не найдено</p></div>';
        document.getElementById('pagination').innerHTML = '';
        return;
    }
    catalogDiv.innerHTML = pageProducts.map(product => `
        <div class="sock-card" onclick="viewProduct(${product.id})">
            <img src="${product.image}" alt="${product.name}">
            <div class="sock-card-content">
                <div class="sock-card-title">${product.name}</div>
                <div class="sock-card-rating">${'★'.repeat(Math.floor(product.rating))}${'☆'.repeat(5 - Math.floor(product.rating))}</div>
                <div class="sock-card-price">${product.price.toLocaleString()} ₽</div>
                <div class="sock-card-actions">
                    <button class="btn-cart" onclick="event.stopPropagation(); addToCart(${product.id})"><i class="fas fa-shopping-cart"></i> В корзину</button>
                    <button class="btn-fav ${favorites.includes(product.id) ? 'active' : ''}" onclick="event.stopPropagation(); toggleFavorite(${product.id})"><i class="fas fa-heart"></i></button>
                </div>
            </div>
        </div>
    `).join('');
    const paginationDiv = document.getElementById('pagination');
    if (totalPages > 1) {
        let html = '';
        for (let i = 1; i <= totalPages; i++) {
            html += `<button class="${i === currentPage ? 'active' : ''}" onclick="goToPage(${i})">${i}</button>`;
        }
        paginationDiv.innerHTML = html;
    } else paginationDiv.innerHTML = '';
}

function goToPage(page) { currentPage = page; renderCatalog(); window.scrollTo({ top: 0, behavior: 'smooth' }); }
function applyFilters() { currentPage = 1; renderCatalog(); }
function resetFilters() {
    document.getElementById('priceFilter').value = '50000';
    document.getElementById('colorFilter').value = '';
    document.getElementById('sizeFilter').value = '';
    document.getElementById('materialFilter').value = '';
    document.getElementById('genderFilter').value = '';
    document.getElementById('brandFilter').value = '';
    document.getElementById('searchInput').value = '';
    document.getElementById('sortSelect').value = 'name';
    applyFilters();
}

function addToCart(productId) {
    if (!currentUser) { showToast('Войдите в аккаунт', 'error'); openAuthModal(); return; }
    const product = products.find(p => p.id === productId);
    const existingItem = cart.find(item => item.id === productId);
    if (existingItem) existingItem.quantity++;
    else cart.push({ ...product, quantity: 1 });
    saveData();
    updateCounters();
    renderCart();
    showToast(`${product.name} добавлен в корзину!`);
}

function removeFromCart(productId) {
    cart = cart.filter(item => item.id !== productId);
    saveData();
    updateCounters();
    renderCart();
}

function updateQuantity(productId, delta) {
    const item = cart.find(i => i.id === productId);
    if (item) {
        item.quantity += delta;
        if (item.quantity <= 0) removeFromCart(productId);
        else { saveData(); updateCounters(); renderCart(); }
    }
}

function renderCart() {
    const cartItemsDiv = document.getElementById('cartItems');
    if (!cartItemsDiv) return;
    if (cart.length === 0) { cartItemsDiv.innerHTML = '<div style="text-align:center;padding:30px">Корзина пуста</div>'; document.getElementById('cartTotal').textContent = '0'; return; }
    cartItemsDiv.innerHTML = cart.map(item => `
        <div class="cart-item">
            <img src="${item.image}" alt="${item.name}">
            <div style="flex:1">
                <div style="font-weight:700">${item.name}</div>
                <div style="color:#d4af37">${item.price.toLocaleString()} ₽</div>
                <div style="display:flex;gap:10px;margin-top:10px">
                    <button style="width:30px;height:30px;border-radius:50%;background:#1a1a1a;border:1px solid #333;color:#fff;cursor:pointer" onclick="updateQuantity(${item.id}, -1)">-</button>
                    <span>${item.quantity}</span>
                    <button style="width:30px;height:30px;border-radius:50%;background:#1a1a1a;border:1px solid #333;color:#fff;cursor:pointer" onclick="updateQuantity(${item.id}, 1)">+</button>
                    <button style="background:#d63031;color:#fff;border:none;padding:5px 12px;border-radius:20px;cursor:pointer" onclick="removeFromCart(${item.id})">Удалить</button>
                </div>
            </div>
        </div>
    `).join('');
    const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
    document.getElementById('cartTotal').textContent = total.toLocaleString();
}

function checkout() {
    if (cart.length === 0) { showToast('Корзина пуста', 'error'); return; }
    const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const bonusDiscount = Math.min(bonusPoints, total);
    if (confirm(`Сумма: ${total.toLocaleString()} ₽\nБонусы: ${bonusPoints.toFixed(1)} ₽\nСписать бонусы?`)) {
        const finalTotal = total - bonusDiscount;
        showToast(`Заказ оформлен! К оплате: ${finalTotal.toLocaleString()} ₽`);
        cart = [];
        bonusPoints = 0;
        saveData();
        updateCounters();
        renderCart();
        closeSidebars();
    }
}

function toggleFavorite(productId) {
    if (!currentUser) { showToast('Войдите в аккаунт', 'error'); openAuthModal(); return; }
    if (favorites.includes(productId)) favorites = favorites.filter(id => id !== productId);
    else favorites.push(productId);
    saveData();
    updateCounters();
    renderCatalog();
    renderFavorites();
}

function renderFavorites() {
    const favDiv = document.getElementById('favoritesItems');
    if (!favDiv) return;
    if (favorites.length === 0) { favDiv.innerHTML = '<div style="text-align:center;padding:30px">Избранное пусто</div>'; return; }
    const favProducts = products.filter(p => favorites.includes(p.id));
    favDiv.innerHTML = favProducts.map(product => `
        <div class="fav-item">
            <img src="${product.image}" alt="${product.name}">
            <div style="flex:1">
                <div style="font-weight:700">${product.name}</div>
                <div style="color:#d4af37">${product.price.toLocaleString()} ₽</div>
                <div style="display:flex;gap:10px;margin-top:10px">
                    <button class="btn-cart" style="padding:5px 15px" onclick="addToCart(${product.id}); closeSidebars();">В корзину</button>
                    <button onclick="toggleFavorite(${product.id}); renderFavorites();" style="background:#d63031;color:#fff;border:none;padding:5px 12px;border-radius:20px;cursor:pointer">Удалить</button>
                </div>
            </div>
        </div>
    `).join('');
}

function viewProduct(productId) {
    const product = products.find(p => p.id === productId);
    const modal = document.getElementById('productModal');
    if (!modal) return;
    document.getElementById('modalProductTitle').textContent = product.name;
    document.getElementById('modalProductContent').innerHTML = `
        <div style="display:flex;gap:20px;flex-wrap:wrap">
            <img src="${product.image}" style="width:200px;height:200px;object-fit:cover;border-radius:15px">
            <div style="flex:1">
                <p><strong>Цена:</strong> ${product.price.toLocaleString()} ₽</p>
                <p><strong>Рейтинг:</strong> ${'★'.repeat(Math.floor(product.rating))} (${product.rating})</p>
                <p><strong>Цвет:</strong> ${product.color}</p>
                <p><strong>Размер:</strong> ${product.size}</p>
                <p><strong>Состав:</strong> ${product.material}</p>
                <button class="btn-gold" style="margin-top:15px" onclick="addToCart(${product.id}); closeModal('productModal')">Добавить в корзину</button>
            </div>
        </div>
    `;
    modal.style.display = 'flex';
}

function renderReviews() {
    const reviewsDiv = document.getElementById('reviewsList');
    if (!reviewsDiv) return;
    if (reviews.length === 0) { reviewsDiv.innerHTML = '<div style="text-align:center;padding:20px">Пока нет отзывов</div>'; return; }
    reviewsDiv.innerHTML = reviews.map(review => `
        <div class="review-item">
            <div class="review-author"><i class="fas fa-user-circle"></i> ${review.userName}</div>
            <div class="review-rating">${'★'.repeat(review.rating)}${'☆'.repeat(5 - review.rating)}</div>
            <div>${review.text}</div>
            <div style="font-size:11px;color:#888;margin-top:5px">${new Date(review.date).toLocaleDateString('ru-RU')}</div>
        </div>
    `).join('');
}

function addReview() {
    if (!currentUser) { showToast('Авторизуйтесь', 'error'); openAuthModal(); return; }
    const text = document.getElementById('reviewText')?.value;
    if (!text || text.trim() === '') { showToast('Введите текст отзыва', 'error'); return; }
    if (currentRating === 0) { showToast('Поставьте оценку', 'error'); return; }
    const newReview = { id: Date.now(), userId: currentUser.email, userName: currentUser.name || currentUser.email.split('@')[0], text: text, rating: currentRating, date: new Date().toISOString() };
    reviews.unshift(newReview);
    saveData();
    renderReviews();
    document.getElementById('reviewText').value = '';
    currentRating = 0;
    updateStarRating();
    showToast('Отзыв добавлен!');
}

function setupStarRating() {
    const stars = document.querySelectorAll('#starRatingInput i');
    stars.forEach(star => star.addEventListener('click', function() { currentRating = parseInt(this.dataset.rating); updateStarRating(); }));
}

function updateStarRating() {
    const stars = document.querySelectorAll('#starRatingInput i');
    stars.forEach((star, index) => star.className = index < currentRating ? 'fas fa-star active' : 'far fa-star');
}

function openAuthModal() { document.getElementById('authModal').style.display = 'flex'; }
function closeModal(modalId) { document.getElementById(modalId).style.display = 'none'; }

function login() {
    const email = document.getElementById('loginEmail')?.value;
    const password = document.getElementById('loginPassword')?.value;
    const user = users.find(u => u.email === email && u.password === password);
    if (user) { currentUser = user; saveData(); updateAuthUI(); closeModal('authModal'); showToast(`Добро пожаловать, ${user.name}!`); renderCatalog(); renderReviews(); updateCounters(); }
    else if (email === 'admin@lux.com' && password === 'admin') { currentUser = { email, name: 'Admin' }; saveData(); updateAuthUI(); closeModal('authModal'); showToast('Добро пожаловать, Admin!'); renderCatalog(); renderReviews(); updateCounters(); }
    else document.getElementById('authMessage').textContent = 'Неверный email или пароль';
}

function register() {
    const name = document.getElementById('regName')?.value;
    const email = document.getElementById('regEmail')?.value;
    const password = document.getElementById('regPassword')?.value;
    if (!name || !email || !password) { document.getElementById('authMessage').textContent = 'Заполните все поля'; return; }
    if (users.find(u => u.email === email)) { document.getElementById('authMessage').textContent = 'Email уже существует'; return; }
    users.push({ name, email, password });
    saveData();
    document.getElementById('authMessage').textContent = 'Регистрация успешна! Теперь войдите.';
    document.querySelector('.tab[data-tab="login"]').click();
}

function logout() { currentUser = null; cart = []; favorites = []; saveData(); updateAuthUI(); updateCounters(); renderCatalog(); renderCart(); renderFavorites(); showToast('Вы вышли из аккаунта'); }

function updateAuthUI() {
    const authBtn = document.getElementById('authBtn');
    const logoutBtn = document.getElementById('logoutBtn');
    if (currentUser) { authBtn.style.display = 'none'; logoutBtn.style.display = 'block'; logoutBtn.innerHTML = `<i class="fas fa-sign-out-alt"></i> ${currentUser.name}`; }
    else { authBtn.style.display = 'block'; logoutBtn.style.display = 'none'; }
}

function toggleAccessibility() {
    document.body.classList.toggle('accessible');
    localStorage.setItem('accessible', document.body.classList.contains('accessible'));
    showToast(document.body.classList.contains('accessible') ? 'Режим для слабовидящих включен' : 'Обычный режим');
}

function updateSlider() {
    const slider = document.getElementById('slider');
    if (slider) slider.style.transform = `translateX(-${currentSlide * 100}%)`;
    const dots = document.querySelectorAll('.dot');
    dots.forEach((dot, index) => dot.classList.toggle('active', index === currentSlide));
}

function nextSlide() {
    const slides = document.querySelectorAll('.slide');
    currentSlide = (currentSlide + 1) % slides.length;
    updateSlider();
}

function prevSlide() {
    const slides = document.querySelectorAll('.slide');
    currentSlide = (currentSlide - 1 + slides.length) % slides.length;
    updateSlider();
}

function createDots() {
    const dotsContainer = document.getElementById('sliderDots');
    if (!dotsContainer) return;
    const slides = document.querySelectorAll('.slide');
    dotsContainer.innerHTML = '';
    for (let i = 0; i < slides.length; i++) {
        const dot = document.createElement('div');
        dot.className = `dot ${i === 0 ? 'active' : ''}`;
        dot.addEventListener('click', () => { currentSlide = i; updateSlider(); });
        dotsContainer.appendChild(dot);
    }
}

function openCart() { document.getElementById('cartSidebar').classList.add('open'); renderCart(); }
function openFavorites() { document.getElementById('favoritesSidebar').classList.add('open'); renderFavorites(); }
function closeSidebars() { document.getElementById('cartSidebar')?.classList.remove('open'); document.getElementById('favoritesSidebar')?.classList.remove('open'); }

let clickCount = 0;
function setupGame() {
    const clicker = document.getElementById('clickerArea');
    if (!clicker) return;
    clicker.addEventListener('click', () => {
        if (!currentUser) { showToast('Авторизуйтесь для игры!', 'error'); openAuthModal(); return; }
        clickCount++;
        clicker.style.transform = 'scale(0.95)';
        setTimeout(() => clicker.style.transform = 'scale(1)', 100);
        if (clickCount >= 10) {
            const earned = Math.floor(clickCount / 10) * 5;
            bonusPoints += earned;
            clickCount = clickCount % 10;
            saveData();
            updateCounters();
            showToast(`+${earned} бонусов! Всего: ${bonusPoints.toFixed(1)} ₽`);
        }
    });
}

function initCatchGame() {
    const canvas = document.getElementById('catchGameCanvas');
    if (!canvas) return;
    
    const startBtn = document.getElementById('startCatchGame');
    startBtn.addEventListener('click', () => {
        if (!currentUser) { showToast('Авторизуйтесь для игры!', 'error'); openAuthModal(); return; }
        startCatchGame();
    });
    
    canvas.addEventListener('mousemove', (e) => {
        const rect = canvas.getBoundingClientRect();
        const scaleX = canvas.width / rect.width;
        let x = (e.clientX - rect.left) * scaleX;
        x = Math.max(30, Math.min(canvas.width - 30, x));
        catcherX = x;
    });
}

function startCatchGame() {
    if (catchGameActive) return;
    catchGameActive = true;
    catchScore = 0;
    socks = [];
    document.getElementById('catchScore').textContent = 'Поймано: 0';
    document.getElementById('catchBonus').textContent = '0';
    gameLoop();
}

function gameLoop() {
    if (!catchGameActive) return;
    
    const canvas = document.getElementById('catchGameCanvas');
    const ctx = canvas.getContext('2d');
    
    if (Math.random() < 0.02) {
        socks.push({
            x: Math.random() * (canvas.width - 40) + 20,
            y: 0,
            radius: 15
        });
    }
    
    for (let i = 0; i < socks.length; i++) {
        socks[i].y += 3;
        
        const dx = socks[i].x - catcherX;
        const dy = socks[i].y - (canvas.height - 40);
        const dist = Math.sqrt(dx * dx + dy * dy);
        
        if (dist < socks[i].radius + 20 && socks[i].y + socks[i].radius >= canvas.height - 40) {
            socks.splice(i, 1);
            catchScore++;
            const earned = 0.5;
            bonusPoints += earned;
            saveData();
            updateCounters();
            document.getElementById('catchScore').textContent = `Поймано: ${catchScore}`;
            document.getElementById('catchBonus').textContent = (catchScore * 0.5).toFixed(1);
            showToast(`+0.5 бонуса!`, 'success');
            i--;
            continue;
        }
        
        if (socks[i] && socks[i].y - socks[i].radius > canvas.height) {
            socks.splice(i, 1);
            i--;
        }
    }
    
    ctx.fillStyle = '#1a1a1a';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    ctx.fillStyle = '#d4af37';
    ctx.fillRect(catcherX - 30, canvas.height - 40, 60, 20);
    ctx.fillStyle = '#b8960c';
    ctx.fillRect(catcherX - 25, canvas.height - 45, 50, 10);
    
    for (let sock of socks) {
        ctx.fillStyle = '#d4af37';
        ctx.beginPath();
        ctx.arc(sock.x, sock.y, sock.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#b8960c';
        ctx.beginPath();
        ctx.arc(sock.x - 4, sock.y - 4, 3, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(sock.x + 4, sock.y - 4, 3, 0, Math.PI * 2);
        ctx.fill();
    }
    
    if (catchGameActive) {
        catchGameAnimation = requestAnimationFrame(gameLoop);
    }
}

function stopCatchGame() {
    catchGameActive = false;
    if (catchGameAnimation) {
        cancelAnimationFrame(catchGameAnimation);
        catchGameAnimation = null;
    }
}

document.addEventListener('DOMContentLoaded', () => {
    if (localStorage.getItem('accessible') === 'true') {
        document.body.classList.add('accessible');
    }
    
    document.getElementById('themeToggle')?.addEventListener('click', () => document.body.classList.toggle('dark'));
    document.getElementById('accessibilityToggle')?.addEventListener('click', toggleAccessibility);
    document.getElementById('cartBtn')?.addEventListener('click', openCart);
    document.getElementById('favoritesBtn')?.addEventListener('click', openFavorites);
    document.getElementById('authBtn')?.addEventListener('click', openAuthModal);
    document.getElementById('logoutBtn')?.addEventListener('click', logout);
    document.getElementById('applyFiltersBtn')?.addEventListener('click', applyFilters);
    document.getElementById('resetFiltersBtn')?.addEventListener('click', resetFilters);
    document.getElementById('doLoginBtn')?.addEventListener('click', login);
    document.getElementById('doRegisterBtn')?.addEventListener('click', register);
    document.getElementById('addReviewBtn')?.addEventListener('click', addReview);
    document.getElementById('checkoutBtn')?.addEventListener('click', checkout);
    document.getElementById('prevSlide')?.addEventListener('click', prevSlide);
    document.getElementById('nextSlide')?.addEventListener('click', nextSlide);
    
    document.querySelectorAll('.close-sidebar, .close-modal').forEach(btn => btn.addEventListener('click', () => { 
        document.querySelectorAll('.modal, .sidebar').forEach(el => { 
            el.style.display = 'none'; 
            el.classList.remove('open'); 
        }); 
        stopCatchGame();
    }));
    
    window.addEventListener('click', (e) => { 
        if (e.target.classList.contains('modal')) {
            e.target.style.display = 'none';
            stopCatchGame();
        }
    });
    
    document.querySelectorAll('.tab').forEach(tab => tab.addEventListener('click', () => { 
        const tabName = tab.dataset.tab; 
        document.querySelectorAll('.tab').forEach(t => t.classList.remove('active')); 
        document.querySelectorAll('.form').forEach(f => f.classList.remove('active')); 
        tab.classList.add('active'); 
        document.getElementById(`${tabName}Form`).classList.add('active'); 
        document.getElementById('authMessage').textContent = ''; 
    }));
    
    let searchTimeout;
    document.getElementById('searchInput')?.addEventListener('input', () => { 
        clearTimeout(searchTimeout); 
        searchTimeout = setTimeout(applyFilters, 500); 
    });
    
    createDots();
    setupGame();
    initCatchGame();
    setupStarRating();
    updateAuthUI();
    updateCounters();
    renderCatalog();
    renderReviews();
    setInterval(nextSlide, 5000);
});