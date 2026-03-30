// The Tech Bit - Main App

let currentUser = null;
let allProducts = [];
let filteredProducts = [];
let currentPage = 1;
const perPage = 9;
let brands = new Set();
let categories = new Set();
let videosList = [];
let currentVideo = null;

// Firebase
let auth = null;

// DOM Elements
const loading = document.getElementById('loading');
const notification = document.getElementById('notification');
const notifyText = document.getElementById('notifyText');

// Helper functions
function showLoading(show) {
    loading.style.display = show ? 'flex' : 'none';
}

function showMessage(msg, isError = false) {
    notifyText.innerText = msg;
    notification.style.backgroundColor = isError ? '#dc3545' : '#6a11cb';
    notification.style.display = 'block';
    setTimeout(() => notification.style.display = 'none', 3000);
}

// Load products from JSON
async function loadProducts() {
    showLoading(true);
    try {
        const res = await fetch('products.json');
        const data = await res.json();
        // Deduplicate by id
        const unique = new Map();
        data.products.forEach(p => { if (!unique.has(p.id)) unique.set(p.id, p); });
        allProducts = Array.from(unique.values());
        
        brands.clear(); categories.clear();
        allProducts.forEach(p => {
            if (p.brand) brands.add(p.brand);
            if (p.category) categories.add(p.category);
        });
        videosList = allProducts.filter(p => p.videoUrl);
        
        updateFilters();
        filteredProducts = [...allProducts];
        displayProducts();
    } catch(e) {
        console.error(e);
        // Fallback sample products
        allProducts = [
            { id:1, name:"BOYA BY-MW3", brand:"BOYA", category:"Audio", price:2299, description:"Wireless mic", badge:"Bestseller", image:"https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600", videoUrl:"https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4", rating:4.7, features:["Wireless","Noise cancellation"] },
            { id:2, name:"The Tech Bit Air Pro", brand:"The Tech Bit", category:"Audio", price:199, description:"Noise cancelling headphones", badge:"New", image:"https://images.unsplash.com/photo-1583394838336-acd977736f90?w=600", videoUrl:"https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4", rating:4.5, features:["ANC","30h battery"] },
            { id:3, name:"Smart Watch Pro", brand:"The Tech Bit", category:"Wearables", price:349, description:"Health monitoring", badge:"Sale", image:"https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=600", videoUrl:"https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4", rating:4.8, features:["Heart rate","GPS"] }
        ];
        brands.clear(); categories.clear();
        allProducts.forEach(p => { brands.add(p.brand); categories.add(p.category); });
        videosList = allProducts.filter(p => p.videoUrl);
        updateFilters();
        filteredProducts = [...allProducts];
        displayProducts();
    }
    showLoading(false);
}

function updateFilters() {
    const brandSel = document.getElementById('brandFilter');
    const catSel = document.getElementById('categoryFilter');
    if (!brandSel) return;
    brandSel.innerHTML = '<option value="">All Brands</option>';
    catSel.innerHTML = '<option value="">All Categories</option>';
    brands.forEach(b => { let opt = document.createElement('option'); opt.value = b; opt.textContent = b; brandSel.appendChild(opt); });
    categories.forEach(c => { let opt = document.createElement('option'); opt.value = c; opt.textContent = c; catSel.appendChild(opt); });
}

function createProductCard(p) {
    const card = document.createElement('div');
    card.className = 'product-card';
    let quality = '', stars = '';
    if (p.rating >= 4.5) quality = '⭐ Premium';
    else if (p.rating >= 3.5) quality = '✔️ Good';
    else quality = '👍 Standard';
    stars = '★'.repeat(Math.floor(p.rating)) + '☆'.repeat(5 - Math.floor(p.rating));
    card.innerHTML = `
        ${p.badge ? `<div class="product-badge">${p.badge}</div>` : ''}
        <div class="product-img"><img src="${p.image}" alt="${p.name}" loading="lazy"></div>
        <div class="product-info">
            <h3>${p.name}</h3>
            <p><strong>Brand:</strong> ${p.brand} | <strong>Type:</strong> ${p.category}</p>
            <p>${p.description.substring(0, 80)}...</p>
            <div class="product-price">PKR ${p.price.toFixed(2)}</div>
            <div class="product-quality">${quality} (${stars} ${p.rating})</div>
            <div class="product-actions">
                ${p.videoUrl ? `<button class="btn btn-primary watch-video" data-id="${p.id}"><i class="fas fa-play-circle"></i> See Video</button>` : ''}
                <button class="btn btn-whatsapp share-product" data-name="${p.name}" data-img="${p.image}"><i class="fab fa-whatsapp"></i> Share</button>
            </div>
        </div>
    `;
    card.addEventListener('click', (e) => {
        if (!e.target.closest('.watch-video') && !e.target.closest('.share-product')) {
            showProductDetail(p);
        }
    });
    card.querySelectorAll('.watch-video').forEach(btn => {
        btn.addEventListener('click', (e) => { e.stopPropagation(); playVideoById(parseInt(btn.dataset.id)); });
    });
    card.querySelectorAll('.share-product').forEach(btn => {
        btn.addEventListener('click', (e) => { e.stopPropagation(); shareProduct(btn.dataset.name); });
    });
    return card;
}

function displayProducts() {
    const container = document.getElementById('productsGrid');
    const homeContainer = document.getElementById('homeProducts');
    if (!container) return;
    const start = (currentPage-1)*perPage;
    const paginated = filteredProducts.slice(start, start+perPage);
    container.innerHTML = '';
    paginated.forEach(p => container.appendChild(createProductCard(p)));
    if (homeContainer) {
        homeContainer.innerHTML = '';
        allProducts.slice(0, 3).forEach(p => homeContainer.appendChild(createProductCard(p)));
    }
    const totalPages = Math.ceil(filteredProducts.length / perPage);
    const paginationDiv = document.getElementById('pagination');
    if (totalPages > 1) {
        paginationDiv.style.display = 'block';
        document.getElementById('pageInfo').innerText = `Page ${currentPage} of ${totalPages}`;
        document.getElementById('prevPage').disabled = currentPage === 1;
        document.getElementById('nextPage').disabled = currentPage === totalPages;
    } else {
        paginationDiv.style.display = 'none';
    }
}

function applyFilters() {
    const search = document.getElementById('searchInput').value.toLowerCase();
    const brand = document.getElementById('brandFilter').value;
    const cat = document.getElementById('categoryFilter').value;
    filteredProducts = allProducts.filter(p => {
        return (!search || p.name.toLowerCase().includes(search) || p.description.toLowerCase().includes(search)) &&
               (!brand || p.brand === brand) &&
               (!cat || p.category === cat);
    });
    currentPage = 1;
    displayProducts();
}

function resetFilters() {
    document.getElementById('searchInput').value = '';
    document.getElementById('brandFilter').value = '';
    document.getElementById('categoryFilter').value = '';
    filteredProducts = [...allProducts];
    currentPage = 1;
    displayProducts();
}

function showProductDetail(p) {
    const detailPage = document.getElementById('product-detail');
    if (!detailPage) {
        // Create a simple alert for demo
        alert(`Product: ${p.name}\nPrice: PKR ${p.price}\nBrand: ${p.brand}\nCategory: ${p.category}\nFeatures: ${p.features?.join(', ')}`);
        return;
    }
    // For simplicity, we'll just show an alert. In a full app, you'd populate a modal.
    showMessage(`Opening ${p.name}`, false);
}

function playVideoById(id) {
    const product = allProducts.find(p => p.id === id);
    if (!product || !product.videoUrl) return;
    navigateTo('video');
    setTimeout(() => {
        const videoElem = document.getElementById('mainVideo');
        if (videoElem) {
            videoElem.src = product.videoUrl;
            videoElem.load(); // No autoplay
            document.getElementById('videoTitle').innerText = product.name;
            document.getElementById('videoDesc').innerText = product.description;
            document.getElementById('buyVideoBtn').onclick = () => shareProduct(product.name);
        }
    }, 100);
}

function loadVideos() {
    const container = document.getElementById('videoList');
    if (!container) return;
    container.innerHTML = '';
    if (videosList.length === 0) {
        container.innerHTML = '<div>No videos available</div>';
        return;
    }
    videosList.forEach(v => {
        const item = document.createElement('div');
        item.className = 'video-item';
        item.innerHTML = `
            <div class="video-thumbnail"><i class="fas fa-play-circle"></i></div>
            <div class="video-item-info">
                <h4>${v.name}</h4>
                <p>${v.description.substring(0, 80)}</p>
            </div>
        `;
        item.addEventListener('click', () => playVideoById(v.id));
        container.appendChild(item);
    });
}

// Video player controls (manual play/pause)
function setupVideoPlayer() {
    const video = document.getElementById('mainVideo');
    const playBtn = document.getElementById('playPauseBtn');
    const progressBar = document.getElementById('progressBar');
    const progress = document.getElementById('progress');
    const timeDisplay = document.getElementById('timeDisplay');
    const volumeSlider = document.getElementById('volumeSlider');
    const fullscreenBtn = document.getElementById('fullscreenBtn');
    
    if (!video) return;
    
    playBtn.addEventListener('click', () => {
        if (video.paused) video.play();
        else video.pause();
    });
    video.addEventListener('play', () => playBtn.innerHTML = '<i class="fas fa-pause"></i>');
    video.addEventListener('pause', () => playBtn.innerHTML = '<i class="fas fa-play"></i>');
    video.addEventListener('timeupdate', () => {
        if (video.duration) {
            progress.style.width = (video.currentTime / video.duration) * 100 + '%';
            timeDisplay.innerText = `${formatTime(video.currentTime)} / ${formatTime(video.duration)}`;
        }
    });
    progressBar.addEventListener('click', (e) => {
        const rect = progressBar.getBoundingClientRect();
        video.currentTime = ((e.clientX - rect.left) / rect.width) * video.duration;
    });
    volumeSlider.addEventListener('input', () => video.volume = volumeSlider.value / 100);
    fullscreenBtn.addEventListener('click', () => {
        if (!document.fullscreenElement) video.parentElement.requestFullscreen();
        else document.exitFullscreen();
    });
}

function formatTime(sec) {
    let m = Math.floor(sec / 60);
    let s = Math.floor(sec % 60);
    return `${m}:${s < 10 ? '0'+s : s}`;
}

function shareProduct(name) {
    const url = window.location.href;
    const text = `Check out ${name} from The Tech Bit! ${url}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
}

function shareWebsite() {
    shareProduct('The Tech Bit');
}

// Navigation
function navigateTo(pageId) {
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    document.getElementById(pageId).classList.add('active');
    document.querySelectorAll('.nav-link, .mobile-nav-item').forEach(link => link.classList.remove('active'));
    document.querySelectorAll(`[data-page="${pageId}"]`).forEach(link => link.classList.add('active'));
    if (pageId === 'products') { applyFilters(); }
    if (pageId === 'video') { loadVideos(); }
    closeMobileMenu();
}

function closeMobileMenu() {
    document.getElementById('navLinks').classList.remove('active');
}

// Auth (simplified, no actual Firebase integration for demo)
function renderAuth() {
    const container = document.getElementById('authContainer');
    container.innerHTML = `
        <div style="display:flex; gap:10px; margin-bottom:20px;">
            <button id="loginTabBtn" class="btn btn-primary" style="flex:1">Login</button>
            <button id="signupTabBtn" class="btn btn-secondary" style="flex:1">Sign Up</button>
        </div>
        <div id="loginForm">
            <input type="email" id="loginEmail" placeholder="Email" class="form-control" style="margin-bottom:10px;">
            <input type="password" id="loginPass" placeholder="Password" class="form-control" style="margin-bottom:10px;">
            <button id="doLogin" class="btn btn-primary">Login</button>
        </div>
        <div id="signupForm" style="display:none;">
            <input type="text" id="signupName" placeholder="Full Name" class="form-control" style="margin-bottom:10px;">
            <input type="email" id="signupEmail" placeholder="Email" class="form-control" style="margin-bottom:10px;">
            <input type="password" id="signupPass" placeholder="Password" class="form-control" style="margin-bottom:10px;">
            <button id="doSignup" class="btn btn-primary">Sign Up</button>
        </div>
    `;
    document.getElementById('loginTabBtn').onclick = () => { document.getElementById('loginForm').style.display='block'; document.getElementById('signupForm').style.display='none'; };
    document.getElementById('signupTabBtn').onclick = () => { document.getElementById('loginForm').style.display='none'; document.getElementById('signupForm').style.display='block'; };
    document.getElementById('doLogin').onclick = () => showMessage('Demo: Login successful (no backend)', false);
    document.getElementById('doSignup').onclick = () => showMessage('Demo: Account created', false);
}

// Contact form (EmailJS mock)
function setupContact() {
    const form = document.getElementById('contactForm');
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        showMessage('Message sent! (Demo)', false);
        form.reset();
    });
}

// Event listeners
function bindEvents() {
    document.getElementById('applyFilters')?.addEventListener('click', applyFilters);
    document.getElementById('resetFilters')?.addEventListener('click', resetFilters);
    document.getElementById('prevPage')?.addEventListener('click', () => { if(currentPage>1){ currentPage--; displayProducts(); } });
    document.getElementById('nextPage')?.addEventListener('click', () => { if(currentPage < Math.ceil(filteredProducts.length/perPage)){ currentPage++; displayProducts(); } });
    document.getElementById('homeVideoBtn')?.addEventListener('click', () => navigateTo('video'));
    document.getElementById('homeProductsBtn')?.addEventListener('click', () => navigateTo('products'));
    document.getElementById('offerVideoBtn')?.addEventListener('click', () => navigateTo('video'));
    document.getElementById('offerProductsBtn')?.addEventListener('click', () => navigateTo('products'));
    document.getElementById('shareSite')?.addEventListener('click', shareWebsite);
    document.getElementById('settingsBtn')?.addEventListener('click', () => showMessage('Settings panel would open here', false));
    document.getElementById('menuBtn')?.addEventListener('click', () => document.getElementById('navLinks').classList.toggle('active'));
    document.querySelectorAll('.nav-link, .mobile-nav-item').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const page = link.getAttribute('data-page');
            if (page) navigateTo(page);
        });
    });
    document.getElementById('searchInput')?.addEventListener('input', () => {
        clearTimeout(window.searchTimeout);
        window.searchTimeout = setTimeout(applyFilters, 300);
    });
    setupContact();
    renderAuth();
    setupVideoPlayer();
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    loadProducts();
    bindEvents();
});