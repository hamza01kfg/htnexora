// HT Service - Main Application Script
// This file contains all the enhanced functionality with product videos and reviews

// Enhanced Mobile Detection
const isMobile = {
    Android: function() {
        return navigator.userAgent.match(/Android/i);
    },
    iOS: function() {
        return navigator.userAgent.match(/iPhone|iPad|iPod/i);
    },
    Windows: function() {
        return navigator.userAgent.match(/IEMobile/i);
    },
    any: function() {
        return (isMobile.Android() || isMobile.iOS() || isMobile.Windows());
    }
};

// Global State
let currentLanguage = 'en';
let currentUser = null;
let allProducts = [];
let filteredProducts = [];
let currentPage = 1;
const productsPerPage = 9;
let brands = new Set();
let categories = new Set();
let offerTimer = null;

// Video State
let isPlaying = false;
let currentVideoProductId = null;
let videosFromProducts = [];

// Reviews State
let productReviews = {};

// Firebase and EmailJS Initialization
let firebaseApp = null;
let auth = null;

// Translation data (updated for HT Service)
const translations = {
    en: {
        // Navigation
        brand: "HT Service",
        home: "Home",
        products: "Products",
        offer: "Special Offer",
        video: "Video",
        contact: "Contact",
        account: "Account",
        login: "Login",
        signup: "Sign Up",
        logout: "Logout",
        
        // Home Page
        welcome: "Welcome to HT Service",
        welcome_desc: "Discover innovative products that will transform your daily life. Our cutting-edge solutions combine technology and design for an unparalleled experience.",
        see_video: "See Video",
        buy_product: "Buy Product",
        bestseller: "Bestseller",
        new: "New",
        sale: "Sale",
        buy_now: "Buy Now",
        share: "Share",
        
        // Products Page
        our_products: "Our Products",
        products_desc: "Explore our complete range of innovative tech products designed to enhance your lifestyle.",
        search_placeholder: "Search products...",
        all_brands: "All Brands",
        all_categories: "All Categories",
        apply_filters: "Apply Filters",
        reset: "Reset",
        loading_products: "Loading products...",
        no_products: "No products found matching your criteria.",
        
        // Product Detail Page
        key_features: "Key Features",
        
        // Offer Page
        special_offer: "Special Limited Time Offer",
        offer_desc: "Don't miss our exclusive promotion with incredible savings on our most popular products.",
        offer_expired: "This offer has expired. Check back soon for new deals!",
        free_shipping: "Free Shipping",
        free_shipping_desc: "Free worldwide delivery on all orders",
        secure_payment: "Secure Payment",
        secure_payment_desc: "Your payment information is safe with us",
        return_policy: "30-Day Return",
        return_policy_desc: "Not satisfied? Return within 30 days",
        support: "24/7 Support",
        support_desc: "We're here to help you anytime",
        
        // Video Page
        product_videos: "Product Videos",
        videos_desc: "Watch our product demonstrations and see how HT Service can transform your daily routine.",
        watch_video: "Watch Video",
        
        // Contact Page
        contact_us: "Contact Us",
        contact_desc: "Have questions or need support? Get in touch with our team.",
        full_name: "Full Name",
        email: "Email Address",
        phone: "Phone Number",
        subject: "Subject",
        message: "Message",
        send_message: "Send Message",
        message_sent: "Message sent successfully!",
        message_error: "Failed to send message. Please try again.",
        
        // Auth
        account_desc: "Sign in or create an account to access exclusive features.",
        email_address: "Email Address",
        password: "Password",
        confirm_password: "Confirm Password",
        login_desc: "Sign in to your account",
        signup_desc: "Create a new account",
        forgot_password: "Forgot Password?",
        login_success: "Logged in successfully!",
        signup_success: "Account created successfully!",
        logout_success: "Logged out successfully!",
        auth_error: "Authentication failed. Please check your credentials.",
        
        // Settings
        settings: "Settings",
        appearance: "Appearance",
        display: "Display",
        language: "Language",
        advanced: "Advanced",
        theme: "Theme",
        default: "Default",
        light: "Light",
        dark: "Dark",
        nature: "Nature",
        ocean: "Ocean",
        font_family: "Font Family",
        sans_serif: "Sans Serif",
        serif: "Serif",
        monospace: "Monospace",
        cursive: "Cursive",
        jameel_noori: "Jameel Noori",
        font_size: "Font Size",
        size: "Size",
        border_radius: "Border Radius",
        radius: "Radius",
        brightness: "Brightness",
        contrast: "Contrast",
        saturation: "Saturation",
        animation_speed: "Animation Speed",
        speed: "Speed",
        english: "English",
        urdu: "Urdu",
        roman_urdu: "Roman Urdu",
        data_management: "Data Management",
        export_data: "Export Data",
        import_data: "Import Data",
        reset_settings: "Reset Settings",
        reset_warning: "This will reset all settings to their default values.",
        reset_all: "Reset All Settings",
        
        // Footer
        rights_reserved: "All rights reserved.",
        contact_info: "Contact: info@htservice.com | +92 308 2528844"
    },
    ur: {
        // Navigation
        brand: "ایچ ٹی سروس",
        home: "ہوم",
        products: "مصنوعات",
        offer: "خصوصی پیشکش",
        video: "ویڈیو",
        contact: "رابطہ",
        account: "اکاؤنٹ",
        login: "لاگ ان",
        signup: "سائن اپ",
        logout: "لاگ آؤٹ",
        
        // Home Page
        welcome: "ایچ ٹی سروس میں خوش آمدید",
        welcome_desc: "جدید ترین مصنوعات دریافت کریں جو آپ کی روزمرہ کی زندگی کو بدل دیں گی۔ ہمارے جدید ترین حل ٹیکنالوجی اور ڈیزائن کو یکجا کرتے ہیں۔",
        see_video: "ویڈیو دیکھیں",
        buy_product: "مصنوعات خریدیں",
        bestseller: "بہترین فروخت",
        new: "نیا",
        sale: "سیل",
        buy_now: "ابھی خریدیں",
        share: "شیئر کریں",
        
        // Products Page
        our_products: "ہماری مصنوعات",
        products_desc: "ہماری جدید ٹیک مصنوعات کی مکمل رینج دریافت کریں جو آپ کے طرز زندگی کو بہتر بنانے کے لیے ڈیزائن کی گئی ہیں۔",
        search_placeholder: "مصنوعات تلاش کریں...",
        all_brands: "تمام برانڈز",
        all_categories: "تمام زمرے",
        apply_filters: "فلٹرز لگائیں",
        reset: "ری سیٹ",
        loading_products: "مصنوعات لوڈ ہو رہی ہیں...",
        no_products: "آپ کی شرائط سے مماثل کوئی مصنوعات نہیں ملیں۔",
        
        // Product Detail Page
        key_features: "اہم خصوصیات",
        
        // Offer Page
        special_offer: "خصوصی محدود وقت کی پیشکش",
        offer_desc: "ہماری مقبول ترین مصنوعات پر حیرت انگیز بچت کے ساتھ ہماری خصوصی پروموشن مت چھوڑیں۔",
        offer_expired: "یہ پیشکش ختم ہو چکی ہے۔ نئے ڈیلز کے لیے جلد دوبارہ چیک کریں!",
        free_shipping: "مفت ترسیل",
        free_shipping_desc: "تمام آرڈرز پر دنیا بھر میں مفت ڈیلیوری",
        secure_payment: "محفوظ ادائیگی",
        secure_payment_desc: "آپ کی ادائیگی کی معلومات ہمارے پاس محفوظ ہیں",
        return_policy: "30 دن واپسی",
        return_policy_desc: "مطمئن نہیں؟ 30 دنوں کے اندر واپس کریں",
        support: "24/7 سپورٹ",
        support_desc: "ہم کسی بھی وقت آپ کی مدد کے لیے موجود ہیں",
        
        // Video Page
        product_videos: "مصنوعات کی ویڈیوز",
        videos_desc: "ہماری مصنوعات کی ڈیمونسٹریشن دیکھیں اور دیکھیں کہ ایچ ٹی سروس آپ کے روزمرہ کے معمولات کو کیسے تبدیل کر سکتا ہے۔",
        watch_video: "ویڈیو دیکھیں",
        
        // Contact Page
        contact_us: "ہم سے رابطہ کریں",
        contact_desc: "سوالات ہیں یا سپورٹ درکار ہے؟ ہماری ٹیم سے رابطہ کریں۔",
        full_name: "پورا نام",
        email: "ای میل ایڈریس",
        phone: "فون نمبر",
        subject: "موضوع",
        message: "پیغام",
        send_message: "پیغام بھیجیں",
        message_sent: "پیغام کامیابی سے بھیج دیا گیا!",
        message_error: "پیغام بھیجنے میں ناکامی۔ براہ کرم دوبارہ کوشش کریں۔",
        
        // Auth
        account_desc: "خصوصی خصوصیات تک رسائی کے لیے سائن ان کریں یا نیا اکاؤنٹ بنائیں۔",
        email_address: "ای میل ایڈریس",
        password: "پاس ورڈ",
        confirm_password: "پاس ورڈ کی تصدیق کریں",
        login_desc: "اپنے اکاؤنٹ میں سائن ان کریں",
        signup_desc: "نیا اکاؤنٹ بنائیں",
        forgot_password: "پاس ورڈ بھول گئے؟",
        login_success: "کامیابی سے لاگ ان ہو گئے!",
        signup_success: "اکاؤنٹ کامیابی سے بن گیا!",
        logout_success: "کامیابی سے لاگ آؤٹ ہو گئے!",
        auth_error: "تصدیق ناکام ہوئی۔ براہ کرم اپنے کریڈنشلز چیک کریں۔",
        
        // Settings
        settings: "ترتیبات",
        appearance: "ظہور",
        display: "ڈسپلے",
        language: "زبان",
        advanced: "اعلی درجے کی",
        theme: "تھیم",
        default: "طے شدہ",
        light: "ہلکا",
        dark: "گہرا",
        nature: "فطرت",
        ocean: "سمندر",
        font_family: "فونٹ خاندان",
        sans_serif: "سینس سیرف",
        serif: "سیرف",
        monospace: "مونو اسپیس",
        cursive: "کرسیو",
        jameel_noori: "جمیل نوری",
        font_size: "فونٹ سائز",
        size: "سائز",
        border_radius: "بارڈر ریڈیس",
        radius: "ریڈیس",
        brightness: "چمک",
        contrast: "کنٹراسٹ",
        saturation: "سیریشن",
        animation_speed: "اینی میشن کی رفتار",
        speed: "رفتار",
        english: "انگریزی",
        urdu: "اردو",
        roman_urdu: "رومن اردو",
        data_management: "ڈیٹا مینجمنٹ",
        export_data: "ڈیٹا برآمد کریں",
        import_data: "ڈیٹا درآمد کریں",
        reset_settings: "ترتیبات کو دوبارہ ترتیب دیں",
        reset_warning: "یہ تمام ترتیبات کو ان کی ڈیفالٹ ویلیوز پر واپس کر دے گا۔",
        reset_all: "تمام ترتیبات کو دوبارہ ترتیب دیں",
        
        // Footer
        rights_reserved: "جملہ حقوق محفوظ ہیں۔",
        contact_info: "رابطہ: info@htservice.com | +92 308 2528844"
    }
};

// ==================== REVIEWS FUNCTIONS ====================
function loadReviewsFromStorage() {
    const stored = localStorage.getItem('product_reviews');
    if (stored) {
        productReviews = JSON.parse(stored);
    } else {
        // Sample reviews for demonstration
        productReviews = {
            1: [
                { name: "Ali", rating: 5, comment: "Excellent microphone! Crystal clear sound.", date: "2025-03-15" },
                { name: "Sara", rating: 4, comment: "Good value for money.", date: "2025-03-10" }
            ],
            2: [
                { name: "Hamza", rating: 5, comment: "Best headphones I've ever used.", date: "2025-03-12" }
            ]
        };
        saveReviewsToStorage();
    }
}

function saveReviewsToStorage() {
    localStorage.setItem('product_reviews', JSON.stringify(productReviews));
}

function getAverageRating(productId) {
    const reviews = productReviews[productId] || [];
    if (reviews.length === 0) return null;
    const total = reviews.reduce((sum, r) => sum + r.rating, 0);
    return (total / reviews.length).toFixed(1);
}

function displayReviews(productId) {
    const reviewsContainer = document.getElementById('reviews-list');
    if (!reviewsContainer) return;
    
    const reviews = productReviews[productId] || [];
    if (reviews.length === 0) {
        reviewsContainer.innerHTML = '<p>No reviews yet. Be the first to review!</p>';
        return;
    }
    
    reviewsContainer.innerHTML = reviews.map(review => `
        <div class="review-item">
            <div class="review-header">
                <span class="reviewer-name">${escapeHtml(review.name)}</span>
                <span class="review-rating">${'★'.repeat(review.rating)}${'☆'.repeat(5-review.rating)}</span>
                <span class="review-date">${review.date}</span>
            </div>
            <div class="review-comment">${escapeHtml(review.comment)}</div>
        </div>
    `).join('');
}

function escapeHtml(str) {
    return str.replace(/[&<>]/g, function(m) {
        if (m === '&') return '&amp;';
        if (m === '<') return '&lt;';
        if (m === '>') return '&gt;';
        return m;
    });
}

function setupStarRating() {
    const stars = document.querySelectorAll('#star-rating span');
    const ratingInput = document.getElementById('review-rating');
    if (!stars.length || !ratingInput) return;
    stars.forEach(star => {
        star.addEventListener('click', () => {
            const value = parseInt(star.getAttribute('data-value'), 10);
            ratingInput.value = value;
            stars.forEach(s => {
                if (parseInt(s.getAttribute('data-value'), 10) <= value) {
                    s.classList.add('active');
                } else {
                    s.classList.remove('active');
                }
            });
        });
    });
}

function setupReviewForm(productId) {
    const form = document.getElementById('review-form');
    if (!form) return;
    
    form.removeEventListener('submit', handleReviewSubmit);
    form.onsubmit = (e) => handleReviewSubmit(e, productId);
}

async function handleReviewSubmit(e, productId) {
    e.preventDefault();
    const name = document.getElementById('review-name').value.trim();
    const rating = parseInt(document.getElementById('review-rating').value, 10);
    const comment = document.getElementById('review-comment').value.trim();
    
    if (!name || !comment) {
        showNotification('Please fill all fields', 'error');
        return;
    }
    
    const newReview = {
        name: name,
        rating: rating,
        comment: comment,
        date: new Date().toISOString().split('T')[0]
    };
    
    if (!productReviews[productId]) productReviews[productId] = [];
    productReviews[productId].unshift(newReview);
    saveReviewsToStorage();
    
    displayReviews(productId);
    document.getElementById('review-form').reset();
    document.getElementById('review-rating').value = '5';
    document.querySelectorAll('#star-rating span').forEach(star => {
        star.classList.remove('active');
        if (star.getAttribute('data-value') == 5) star.classList.add('active');
    });
    
    // Refresh product cards if visible
    if (document.getElementById('products-container')) {
        displayProducts(); // refresh products page
    }
    if (document.querySelector('.products-grid:not(#products-container)')) {
        displayProducts(); // refresh home page products
    }
    
    showNotification('Review submitted successfully!');
}

// ==================== FIREBASE & AUTH ====================
function initializeFirebase() {
    try {
        firebaseApp = firebase.initializeApp(firebaseConfig);
        auth = firebase.auth();
        
        auth.onAuthStateChanged((user) => {
            currentUser = user;
            updateAuthUI();
        });
        
        console.log("Firebase initialized successfully");
    } catch (error) {
        console.error("Firebase initialization error:", error);
    }
}

function initializeEmailJS() {
    try {
        emailjs.init(emailjsConfig.userID);
        console.log("EmailJS initialized successfully");
    } catch (error) {
        console.error("EmailJS initialization error:", error);
    }
}

function updateAuthUI() {
    const authNavItem = document.getElementById('auth-nav-item');
    const authControls = document.getElementById('auth-controls');
    const userAvatar = document.getElementById('user-avatar');
    const userName = document.getElementById('user-name');
    
    if (currentUser) {
        if (authNavItem) authNavItem.style.display = 'block';
        if (authControls) authControls.style.display = 'flex';
        
        if (userAvatar) {
            const initials = currentUser.email.charAt(0).toUpperCase();
            userAvatar.textContent = initials;
        }
        
        if (userName) {
            const displayName = currentUser.displayName || currentUser.email.split('@')[0];
            userName.textContent = displayName;
        }
    } else {
        if (authNavItem) authNavItem.style.display = 'none';
        if (authControls) authControls.style.display = 'none';
    }
}

async function signUp(email, password, displayName) {
    try {
        const userCredential = await auth.createUserWithEmailAndPassword(email, password);
        await userCredential.user.updateProfile({
            displayName: displayName
        });
        showNotification(translations[currentLanguage].signup_success);
        return { success: true, user: userCredential.user };
    } catch (error) {
        console.error("Sign up error:", error);
        showNotification(error.message, 'error');
        return { success: false, error: error.message };
    }
}

async function login(email, password) {
    try {
        const userCredential = await auth.signInWithEmailAndPassword(email, password);
        showNotification(translations[currentLanguage].login_success);
        return { success: true, user: userCredential.user };
    } catch (error) {
        console.error("Login error:", error);
        showNotification(translations[currentLanguage].auth_error, 'error');
        return { success: false, error: error.message };
    }
}

async function logout() {
    try {
        await auth.signOut();
        showNotification(translations[currentLanguage].logout_success);
        navigateToPage('home');
    } catch (error) {
        console.error("Logout error:", error);
        showNotification(error.message, 'error');
    }
}

// ==================== PRODUCTS ====================
async function loadProducts() {
    try {
        showLoading(true);
        
        const response = await fetch('products.json');
        
        if (!response.ok) {
            throw new Error('Failed to load products');
        }
        
        const data = await response.json();
        allProducts = data.products;
        
        brands.clear();
        categories.clear();
        
        allProducts.forEach(product => {
            if (product.brand) brands.add(product.brand);
            if (product.category) categories.add(product.category);
        });
        
        videosFromProducts = allProducts.filter(product => product.videoUrl && product.videoUrl.trim() !== '');
        
        updateFilterDropdowns();
        
        filteredProducts = [...allProducts];
        displayProducts();
        
        setupFilterEventListeners();
        
        showLoading(false);
    } catch (error) {
        console.error("Error loading products:", error);
        showLoading(false);
        
        loadSampleProducts();
        setupFilterEventListeners();
    }
}

function loadSampleProducts() {
    allProducts = [
        { 
            id: 1, 
            name: "BOYA BY-MW3", 
            brand: "BOYA", 
            category: "Audio",
            price: 2299, 
            description: "The ultimate smart Wireless Microphone for modern living. Features advanced AI capabilities and seamless connectivity.", 
            badge: "Bestseller",
            image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80",
            videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
            videoThumbnail: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
            features: [
                "Advanced AI Assistant",
                "Seamless Connectivity",
                "Charging time: About 90min",
                "Transfer distance: More than 20 meters",
                "Signal to noise ratio: 64dBm"
            ]
        },
        { 
            id: 2, 
            name: "HT Service Air", 
            brand: "HT Service", 
            category: "Audio",
            price: 199.99, 
            description: "Wireless freedom with exceptional sound quality. Experience audio like never before.", 
            badge: "New",
            image: "https://images.unsplash.com/photo-1583394838336-acd977736f90?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80",
            videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4",
            videoThumbnail: "https://images.unsplash.com/photo-1583394838336-acd977736f90?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
            features: [
                "Active Noise Cancellation",
                "Crystal Clear HD Audio",
                "30-hour Battery Life",
                "Wireless Charging Case",
                "Comfort-fit Design"
            ]
        },
        { 
            id: 3, 
            name: "HT Service Watch", 
            brand: "HT Service", 
            category: "Wearables",
            price: 249.99, 
            description: "Stay connected and monitor your health with our advanced smartwatch technology.", 
            badge: "Sale",
            image: "https://images.unsplash.com/photo-1546868871-7041f2a55e12?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80",
            videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
            videoThumbnail: "https://images.unsplash.com/photo-1546868871-7041f2a55e12?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
            features: [
                "Heart Rate Monitoring",
                "Sleep Tracking",
                "GPS Navigation",
                "Water Resistant (50m)",
                "7-day Battery Life"
            ]
        }
    ];
    
    brands.clear();
    categories.clear();
    
    allProducts.forEach(product => {
        if (product.brand) brands.add(product.brand);
        if (product.category) categories.add(product.category);
    });
    
    videosFromProducts = allProducts.filter(product => product.videoUrl && product.videoUrl.trim() !== '');
    
    updateFilterDropdowns();
    filteredProducts = [...allProducts];
    displayProducts();
}

function updateFilterDropdowns() {
    const brandFilter = document.getElementById('brand-filter');
    const categoryFilter = document.getElementById('category-filter');
    
    if (!brandFilter || !categoryFilter) return;
    
    while (brandFilter.options.length > 1) {
        brandFilter.remove(1);
    }
    
    while (categoryFilter.options.length > 1) {
        categoryFilter.remove(1);
    }
    
    brands.forEach(brand => {
        const option = document.createElement('option');
        option.value = brand;
        option.textContent = brand;
        brandFilter.appendChild(option);
    });
    
    categories.forEach(category => {
        const option = document.createElement('option');
        option.value = category;
        option.textContent = category;
        categoryFilter.appendChild(option);
    });
}

function displayProducts() {
    const productsContainer = document.querySelector('#products .products-grid, #home .products-grid');
    if (!productsContainer) return;
    
    productsContainer.innerHTML = '';
    
    if (filteredProducts.length === 0) {
        productsContainer.innerHTML = `<div class="no-products">${translations[currentLanguage].no_products}</div>`;
        const paginationControls = document.getElementById('pagination-controls');
        if (paginationControls) paginationControls.style.display = 'none';
        return;
    }
    
    const totalPages = Math.ceil(filteredProducts.length / productsPerPage);
    const startIndex = (currentPage - 1) * productsPerPage;
    const endIndex = Math.min(startIndex + productsPerPage, filteredProducts.length);
    const pageProducts = filteredProducts.slice(startIndex, endIndex);
    
    pageProducts.forEach(product => {
        const productCard = createProductCard(product);
        productsContainer.appendChild(productCard);
    });
    
    updatePaginationControls(totalPages);
}

function createProductCard(product) {
    const productCard = document.createElement('div');
    productCard.className = 'product-card';
    productCard.setAttribute('data-product-id', product.id);
    productCard.setAttribute('role', 'button');
    productCard.setAttribute('tabindex', '0');
    productCard.setAttribute('aria-label', `View details for ${product.name}`);
    
    const hasVideo = product.videoUrl && product.videoUrl.trim() !== '';
    const seeVideoButton = hasVideo ? `
        <button class="btn btn-primary see-video" data-product-id="${product.id}" aria-label="Watch video for ${product.name}">
            <i class="fas fa-play-circle"></i> <span data-translate="see_video">See Video</span>
        </button>
    ` : '';
    
    const avgRating = getAverageRating(product.id);
    const ratingHtml = avgRating ? `
        <div class="product-rating">
            <span>⭐ ${avgRating}</span> <span>(${productReviews[product.id]?.length || 0} reviews)</span>
        </div>
    ` : '<div class="product-rating">No reviews yet</div>';
    
    productCard.innerHTML = `
        ${product.badge ? `<div class="product-badge" data-translate="${product.badge.toLowerCase()}">${product.badge}</div>` : ''}
        <div class="product-img">
            <img src="${product.image}" alt="${product.name}" loading="lazy">
        </div>
        <div class="product-info">
            <h3>${product.name}</h3>
            <p>${product.description}</p>
            <div class="product-price">PKR${product.price.toFixed(2)}</div>
            ${ratingHtml}
            <div class="product-actions">
                ${seeVideoButton}
                <button class="btn btn-whatsapp share-product" data-product="${product.name}" data-image="${product.image}" aria-label="Share ${product.name}">
                    <i class="fab fa-whatsapp"></i> <span data-translate="share">Share</span>
                </button>
            </div>
        </div>
    `;
    
    productCard.addEventListener('click', () => {
        openProductDetail(product.id);
        closeMobileMenu();
    });
    
    productCard.addEventListener('keypress', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
            openProductDetail(product.id);
            closeMobileMenu();
        }
    });
    
    if (hasVideo) {
        const seeVideoBtn = productCard.querySelector('.see-video');
        seeVideoBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            playProductVideo(product.id);
            closeMobileMenu();
        });
    }
    
    const shareBtn = productCard.querySelector('.share-product');
    shareBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        shareProduct(product.name, product.image, product.description);
    });
    
    return productCard;
}

function updatePaginationControls(totalPages) {
    const paginationControls = document.getElementById('pagination-controls');
    const prevButton = document.getElementById('prev-page');
    const nextButton = document.getElementById('next-page');
    const pageInfo = document.getElementById('page-info');
    
    if (!paginationControls || !prevButton || !nextButton || !pageInfo) return;
    
    if (totalPages <= 1) {
        paginationControls.style.display = 'none';
        return;
    }
    
    paginationControls.style.display = 'block';
    pageInfo.textContent = `Page ${currentPage} of ${totalPages}`;
    
    prevButton.disabled = currentPage === 1;
    nextButton.disabled = currentPage === totalPages;
    
    prevButton.onclick = () => {
        if (currentPage > 1) {
            currentPage--;
            displayProducts();
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };
    
    nextButton.onclick = () => {
        if (currentPage < totalPages) {
            currentPage++;
            displayProducts();
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };
}

function applyFilters() {
    const searchInput = document.getElementById('search-input');
    const brandFilter = document.getElementById('brand-filter');
    const categoryFilter = document.getElementById('category-filter');
    
    if (!searchInput || !brandFilter || !categoryFilter) return;
    
    const searchTerm = searchInput.value.toLowerCase();
    const brandValue = brandFilter.value;
    const categoryValue = categoryFilter.value;
    
    filteredProducts = allProducts.filter(product => {
        const matchesSearch = !searchTerm || 
            product.name.toLowerCase().includes(searchTerm) || 
            product.description.toLowerCase().includes(searchTerm);
        
        const matchesBrand = !brandValue || product.brand === brandValue;
        const matchesCategory = !categoryValue || product.category === categoryValue;
        
        return matchesSearch && matchesBrand && matchesCategory;
    });
    
    currentPage = 1;
    displayProducts();
}

function resetFilters() {
    const searchInput = document.getElementById('search-input');
    const brandFilter = document.getElementById('brand-filter');
    const categoryFilter = document.getElementById('category-filter');
    
    if (searchInput) searchInput.value = '';
    if (brandFilter) brandFilter.value = '';
    if (categoryFilter) categoryFilter.value = '';
    
    filteredProducts = [...allProducts];
    currentPage = 1;
    displayProducts();
}

function setupFilterEventListeners() {
    const applyFiltersBtn = document.getElementById('apply-filters');
    const resetFiltersBtn = document.getElementById('reset-filters');
    const searchInput = document.getElementById('search-input');
    
    if (applyFiltersBtn) {
        applyFiltersBtn.removeEventListener('click', applyFilters);
        applyFiltersBtn.addEventListener('click', function(e) {
            e.preventDefault();
            applyFilters();
        });
    }
    
    if (resetFiltersBtn) {
        resetFiltersBtn.removeEventListener('click', resetFilters);
        resetFiltersBtn.addEventListener('click', function(e) {
            e.preventDefault();
            resetFilters();
        });
    }
    
    if (searchInput) {
        searchInput.removeEventListener('input', handleSearchInput);
        searchInput.addEventListener('input', handleSearchInput);
    }
}

function handleSearchInput() {
    clearTimeout(this.searchTimeout);
    this.searchTimeout = setTimeout(() => {
        applyFilters();
    }, 300);
}

function openProductDetail(productId) {
    const product = allProducts.find(p => p.id === productId);
    if (!product) return;
    
    document.getElementById('product-detail-title').textContent = product.name;
    document.getElementById('product-detail-subtitle').textContent = `${product.brand} - ${product.category || 'Premium Product'}`;
    document.getElementById('product-detail-img').src = product.image;
    document.getElementById('product-detail-name').textContent = product.name;
    document.getElementById('product-detail-price').textContent = `PKR${product.price.toFixed(2)}`;
    document.getElementById('product-detail-description').textContent = product.description;
    
    const featuresList = document.getElementById('product-features-list');
    if (featuresList) {
        featuresList.innerHTML = '';
        product.features.forEach(feature => {
            const li = document.createElement('li');
            li.textContent = feature;
            featuresList.appendChild(li);
        });
    }
    
    const seeVideoDetailBtn = document.getElementById('see-video-detail');
    if (seeVideoDetailBtn) {
        if (product.videoUrl && product.videoUrl.trim() !== '') {
            seeVideoDetailBtn.style.display = 'flex';
            seeVideoDetailBtn.onclick = () => {
                playProductVideo(product.id);
                closeMobileMenu();
            };
        } else {
            seeVideoDetailBtn.style.display = 'none';
        }
    }
    
    // Load reviews
    displayReviews(product.id);
    setupReviewForm(product.id);
    setupStarRating();
    
    navigateToPage('product-detail');
}

function playProductVideo(productId) {
    const product = allProducts.find(p => p.id === productId);
    if (!product || !product.videoUrl || product.videoUrl.trim() === '') {
        showNotification('No video available for this product.', 'error');
        return;
    }
    
    navigateToPage('video');
    currentVideoProductId = productId;
    
    setTimeout(() => {
        const video = videosFromProducts.find(v => v.id === productId);
        if (video) {
            playVideo(video);
        }
    }, 300);
}

// ==================== OFFER TIMER ====================
function initializeCountdownTimer() {
    const offerBanner = document.getElementById('offer-banner');
    const offerFeatures = document.getElementById('offer-features');
    
    if (!offerConfig.active) {
        if (offerBanner) offerBanner.style.display = 'none';
        if (offerFeatures) offerFeatures.style.display = 'none';
        return;
    }
    
    const startDate = new Date(offerConfig.startDate);
    const endDate = new Date(offerConfig.endDate);
    const now = new Date();
    
    const offerPercentage = document.getElementById('offer-percentage');
    const offerDetails = document.getElementById('offer-details');
    if (offerPercentage) offerPercentage.textContent = `${offerConfig.percentage}% OFF`;
    if (offerDetails) offerDetails.textContent = offerConfig.description;
    
    if (now < startDate) {
        if (offerBanner) {
            offerBanner.innerHTML = `
                <h2>Coming Soon!</h2>
                <p>Our special offer starts on ${startDate.toLocaleDateString()}</p>
            `;
        }
    } else if (now > endDate) {
        if (offerBanner) {
            offerBanner.innerHTML = `
                <div class="offer-expired">
                    <h2>Offer Expired</h2>
                    <p>${translations[currentLanguage].offer_expired}</p>
                </div>
            `;
        }
        if (offerFeatures) offerFeatures.style.display = 'none';
    } else {
        updateCountdownTimer(endDate);
        offerTimer = setInterval(() => updateCountdownTimer(endDate), 1000);
    }
}

function updateCountdownTimer(endDate) {
    const now = new Date();
    const timeRemaining = endDate - now;
    
    if (timeRemaining <= 0) {
        clearInterval(offerTimer);
        const offerBanner = document.getElementById('offer-banner');
        if (offerBanner) {
            offerBanner.innerHTML = `
                <div class="offer-expired">
                    <h2>Offer Expired</h2>
                    <p>${translations[currentLanguage].offer_expired}</p>
                </div>
            `;
        }
        const offerFeatures = document.getElementById('offer-features');
        if (offerFeatures) offerFeatures.style.display = 'none';
        return;
    }
    
    const days = Math.floor(timeRemaining / (1000 * 60 * 60 * 24));
    const hours = Math.floor((timeRemaining % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((timeRemaining % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((timeRemaining % (1000 * 60)) / 1000);
    
    const daysElement = document.getElementById('days');
    const hoursElement = document.getElementById('hours');
    const minutesElement = document.getElementById('minutes');
    const secondsElement = document.getElementById('seconds');
    
    if (daysElement) daysElement.textContent = days.toString().padStart(2, '0');
    if (hoursElement) hoursElement.textContent = hours.toString().padStart(2, '0');
    if (minutesElement) minutesElement.textContent = minutes.toString().padStart(2, '0');
    if (secondsElement) secondsElement.textContent = seconds.toString().padStart(2, '0');
}

// ==================== CONTACT FORM ====================
async function handleContactForm(e) {
    e.preventDefault();
    
    const form = e.target;
    const formData = {
        name: document.getElementById('name').value,
        email: document.getElementById('email').value,
        phone: document.getElementById('phone').value,
        subject: document.getElementById('subject').value,
        message: document.getElementById('message').value,
        timestamp: new Date().toLocaleString()
    };
    
    if (!validateContactForm(formData)) {
        return;
    }
    
    try {
        showLoading(true);
        
        const response = await emailjs.send(
            emailjsConfig.serviceID,
            emailjsConfig.templateID,
            {
                to_email: 'info@htservice.com',
                from_name: formData.name,
                from_email: formData.email,
                phone: formData.phone,
                subject: formData.subject,
                message: formData.message,
                timestamp: formData.timestamp
            }
        );
        
        showLoading(false);
        
        if (response.status === 200) {
            const messageDiv = document.getElementById('form-message');
            messageDiv.textContent = translations[currentLanguage].message_sent;
            messageDiv.className = 'form-message success';
            form.reset();
            
            setTimeout(() => {
                messageDiv.className = 'form-message';
            }, 5000);
        } else {
            throw new Error('Email sending failed');
        }
    } catch (error) {
        console.error('Error sending email:', error);
        showLoading(false);
        
        const messageDiv = document.getElementById('form-message');
        messageDiv.textContent = translations[currentLanguage].message_error;
        messageDiv.className = 'form-message error';
        
        setTimeout(() => {
            messageDiv.className = 'form-message';
        }, 5000);
    }
}

function validateContactForm(formData) {
    let isValid = true;
    
    document.querySelectorAll('.error-message').forEach(el => el.textContent = '');
    
    if (!formData.name.trim()) {
        document.getElementById('name-error').textContent = 'Name is required';
        isValid = false;
    }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email.trim()) {
        document.getElementById('email-error').textContent = 'Email is required';
        isValid = false;
    } else if (!emailRegex.test(formData.email)) {
        document.getElementById('email-error').textContent = 'Invalid email format';
        isValid = false;
    }
    
    if (!formData.subject.trim()) {
        document.getElementById('subject-error').textContent = 'Subject is required';
        isValid = false;
    }
    
    if (!formData.message.trim()) {
        document.getElementById('message-error').textContent = 'Message is required';
        isValid = false;
    }
    
    return isValid;
}

// ==================== LANGUAGE & UI ====================
function changeLanguage(lang) {
    currentLanguage = lang;
    const translation = translations[lang];
    
    document.querySelectorAll('[data-translate]').forEach(element => {
        const key = element.getAttribute('data-translate');
        if (translation[key]) {
            if (element.tagName === 'INPUT' || element.tagName === 'TEXTAREA') {
                element.placeholder = translation[key];
            } else {
                element.textContent = translation[key];
            }
        }
    });
    
    document.querySelectorAll('.language-option').forEach(opt => opt.classList.remove('active'));
    const activeOption = document.querySelector(`.language-option[data-lang="${lang}"]`);
    if (activeOption) activeOption.classList.add('active');
    
    localStorage.setItem('language', lang);
    
    showNotification(`Language changed to ${lang === 'en' ? 'English' : 'Urdu'}`);
}

function showLoading(show) {
    const spinner = document.getElementById('loading-spinner');
    if (spinner) {
        spinner.style.display = show ? 'block' : 'none';
    }
}

function showNotification(message, type = 'success') {
    const notification = document.getElementById('notification');
    const notificationText = document.getElementById('notification-text');
    
    if (notification && notificationText) {
        notificationText.textContent = message;
        notification.style.backgroundColor = type === 'error' ? '#ff6b6b' : 'var(--primary-color)';
        notification.style.display = 'block';
        
        setTimeout(() => {
            notification.style.display = 'none';
        }, 3000);
    }
}

function navigateToPage(pageId) {
    document.querySelectorAll('.nav-link, .mobile-nav-item').forEach(l => l.classList.remove('active'));
    document.querySelectorAll('.page').forEach(page => page.classList.remove('active'));
    
    const pageElement = document.getElementById(pageId);
    if (pageElement) {
        pageElement.classList.add('active');
        
        if (pageId !== 'product-detail' && pageId !== 'auth') {
            const navItem = document.querySelector(`[data-page="${pageId}"]`);
            if (navItem) navItem.classList.add('active');
        }
        
        loadPageContent(pageId);
        
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
}

function loadPageContent(pageId) {
    switch(pageId) {
        case 'home':
            loadProducts();
            break;
        case 'products':
            loadProducts();
            setTimeout(() => {
                updateFilterDropdowns();
                setupFilterEventListeners();
            }, 100);
            break;
        case 'offer':
            initializeCountdownTimer();
            break;
        case 'video':
            loadProductVideos();
            setupVideoPlayer();
            break;
        case 'auth':
            renderAuthPage();
            break;
        default:
            break;
    }
}

// ==================== VIDEO ====================
function loadProductVideos() {
    const videoList = document.getElementById('video-list');
    if (!videoList) return;
    
    videoList.innerHTML = '';
    
    if (videosFromProducts.length === 0) {
        videoList.innerHTML = `
            <div style="grid-column: 1 / -1; text-align: center; padding: 2rem; color: var(--text-color);">
                <i class="fas fa-video-slash" style="font-size: 3rem; margin-bottom: 1rem; opacity: 0.5;"></i>
                <h3>No Videos Available</h3>
                <p>Product videos will be added soon.</p>
            </div>
        `;
        return;
    }
    
    videosFromProducts.forEach(product => {
        const videoItem = document.createElement('div');
        videoItem.className = 'video-item';
        videoItem.setAttribute('data-product-id', product.id);
        videoItem.setAttribute('role', 'button');
        videoItem.setAttribute('tabindex', '0');
        videoItem.setAttribute('aria-label', `Play video: ${product.name}`);
        
        const thumbnail = product.videoThumbnail || product.image || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80';
        
        videoItem.innerHTML = `
            <div class="video-thumbnail" style="background-image: url('${thumbnail}'); background-size: cover; background-position: center;">
                <i class="fas fa-play-circle"></i>
            </div>
            <div class="video-item-info">
                <h4>${product.name}</h4>
                <p>${product.description.substring(0, 100)}${product.description.length > 100 ? '...' : ''}</p>
                <div style="margin-top: 0.5rem; font-size: 0.9rem; color: var(--primary-color);">
                    <i class="fas fa-tag"></i> ${product.category || 'Product'}
                </div>
            </div>
        `;
        
        videoItem.addEventListener('click', () => {
            playVideo(product);
            closeMobileMenu();
        });
        
        videoItem.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                playVideo(product);
                closeMobileMenu();
            }
        });
        
        videoList.appendChild(videoItem);
    });
    
    if (currentVideoProductId) {
        const product = videosFromProducts.find(p => p.id === currentVideoProductId);
        if (product) {
            setTimeout(() => {
                playVideo(product);
                currentVideoProductId = null;
            }, 300);
        }
    } else if (videosFromProducts.length > 0) {
        setTimeout(() => {
            playVideo(videosFromProducts[0]);
        }, 300);
    }
}

function playVideo(product) {
    if (!product || !product.videoUrl) return;
    
    const videoElement = document.getElementById('video-element');
    const videoTitle = document.getElementById('video-title');
    const videoDescription = document.getElementById('video-description');
    const buyProductVideoBtn = document.getElementById('buy-product-video');
    
    if (videoTitle) videoTitle.textContent = product.name;
    if (videoDescription) videoDescription.textContent = product.description;
    
    if (buyProductVideoBtn) {
        buyProductVideoBtn.onclick = () => {
            openProductDetail(product.id);
            closeMobileMenu();
        };
    }
    
    if (videoElement) {
        videoElement.src = product.videoUrl;
        videoElement.load();
    }
    
    updatePlayButton();
    
    document.querySelectorAll('.video-item').forEach(item => {
        item.classList.remove('selected');
        const itemProductId = parseInt(item.getAttribute('data-product-id'));
        if (itemProductId === product.id) {
            item.classList.add('selected');
            item.style.border = '2px solid var(--primary-color)';
        } else {
            item.style.border = '';
        }
    });
    
    setTimeout(() => {
        if (videoElement) {
            videoElement.play().then(() => {
                isPlaying = true;
                updatePlayButton();
            }).catch(error => {
                console.log("Video play failed, might require user interaction:", error);
                const playPauseBtn = document.getElementById('play-pause-btn');
                if (playPauseBtn) {
                    playPauseBtn.innerHTML = '<i class="fas fa-play"></i>';
                    playPauseBtn.setAttribute('aria-label', 'Play');
                }
            });
        }
    }, 100);
}

function setupVideoPlayer() {
    const videoElement = document.getElementById('video-element');
    const playPauseBtn = document.getElementById('play-pause-btn');
    const progressBar = document.getElementById('progress-bar');
    const progress = document.getElementById('progress');
    const timeDisplay = document.getElementById('time-display');
    const volumeSlider = document.getElementById('volume-slider');
    const speedBtn = document.getElementById('speed-btn');
    const speedOptions = document.getElementById('speed-options');
    const fullscreenBtn = document.getElementById('fullscreen-btn');
    
    if (!videoElement || !playPauseBtn) return;
    
    playPauseBtn.addEventListener('click', togglePlayPause);
    
    videoElement.addEventListener('timeupdate', updateProgress);
    if (progressBar) {
        progressBar.addEventListener('click', seek);
    }
    
    if (volumeSlider) {
        volumeSlider.addEventListener('input', function() {
            videoElement.volume = this.value / 100;
        });
    }
    
    if (speedBtn && speedOptions) {
        speedBtn.addEventListener('click', function() {
            speedOptions.style.display = speedOptions.style.display === 'block' ? 'none' : 'block';
        });
        
        document.querySelectorAll('.speed-option').forEach(option => {
            option.addEventListener('click', function() {
                const speed = parseFloat(this.getAttribute('data-speed'));
                videoElement.playbackRate = speed;
                speedOptions.style.display = 'none';
                showNotification(`Playback speed: ${speed}x`);
            });
        });
    }
    
    if (fullscreenBtn) {
        fullscreenBtn.addEventListener('click', function() {
            if (!document.fullscreenElement) {
                videoElement.parentElement.requestFullscreen().catch(err => {
                    console.log(`Error attempting to enable fullscreen: ${err.message}`);
                });
            } else {
                document.exitFullscreen();
            }
        });
    }
    
    videoElement.addEventListener('click', togglePlayPause);
    
    document.addEventListener('keydown', function(e) {
        if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.tagName === 'SELECT') return;
        
        switch(e.key) {
            case ' ':
            case 'Spacebar':
            case 'k':
                e.preventDefault();
                togglePlayPause();
                break;
            case 'm':
                videoElement.muted = !videoElement.muted;
                showNotification(videoElement.muted ? 'Muted' : 'Unmuted');
                break;
            case 'f':
                if (!document.fullscreenElement) {
                    videoElement.parentElement.requestFullscreen();
                } else {
                    document.exitFullscreen();
                }
                break;
            case 'ArrowLeft':
                videoElement.currentTime -= 5;
                break;
            case 'ArrowRight':
                videoElement.currentTime += 5;
                break;
            case 'ArrowUp':
                videoElement.volume = Math.min(videoElement.volume + 0.1, 1);
                if (volumeSlider) volumeSlider.value = videoElement.volume * 100;
                break;
            case 'ArrowDown':
                videoElement.volume = Math.max(videoElement.volume - 0.1, 0);
                if (volumeSlider) volumeSlider.value = videoElement.volume * 100;
                break;
        }
    });
    
    document.addEventListener('click', function(e) {
        if (speedOptions && !e.target.closest('#speed-btn') && !e.target.closest('#speed-options')) {
            speedOptions.style.display = 'none';
        }
    });
    
    videoElement.addEventListener('volumechange', function() {
        if (volumeSlider) volumeSlider.value = videoElement.volume * 100;
    });
    
    videoElement.addEventListener('ended', function() {
        isPlaying = false;
        updatePlayButton();
    });
    
    videoElement.addEventListener('play', function() {
        isPlaying = true;
        updatePlayButton();
    });
    
    videoElement.addEventListener('pause', function() {
        isPlaying = false;
        updatePlayButton();
    });
}

function togglePlayPause() {
    const videoElement = document.getElementById('video-element');
    if (!videoElement) return;
    
    if (videoElement.paused || videoElement.ended) {
        videoElement.play().catch(error => {
            console.log("Video play failed:", error);
            showNotification('Click the video to start playback', 'error');
        });
    } else {
        videoElement.pause();
    }
    
    updatePlayButton();
}

function updatePlayButton() {
    const videoElement = document.getElementById('video-element');
    const playPauseBtn = document.getElementById('play-pause-btn');
    
    if (!videoElement || !playPauseBtn) return;
    
    if (videoElement.paused || videoElement.ended) {
        playPauseBtn.innerHTML = '<i class="fas fa-play"></i>';
        playPauseBtn.setAttribute('aria-label', 'Play');
    } else {
        playPauseBtn.innerHTML = '<i class="fas fa-pause"></i>';
        playPauseBtn.setAttribute('aria-label', 'Pause');
    }
}

function updateProgress() {
    const videoElement = document.getElementById('video-element');
    const progress = document.getElementById('progress');
    const timeDisplay = document.getElementById('time-display');
    
    if (!videoElement || !progress || !timeDisplay) return;
    
    if (videoElement.duration) {
        const percent = (videoElement.currentTime / videoElement.duration) * 100;
        progress.style.width = percent + '%';
        
        const currentTime = formatTime(videoElement.currentTime);
        const duration = formatTime(videoElement.duration);
        timeDisplay.textContent = `${currentTime} / ${duration}`;
    }
}

function seek(e) {
    const videoElement = document.getElementById('video-element');
    const progressBar = document.getElementById('progress-bar');
    
    if (!videoElement || !progressBar) return;
    
    const rect = progressBar.getBoundingClientRect();
    const percent = (e.clientX - rect.left) / rect.width;
    videoElement.currentTime = percent * videoElement.duration;
}

function formatTime(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
}

// ==================== AUTH PAGE ====================
function renderAuthPage() {
    const authContainer = document.getElementById('auth-container');
    if (!authContainer) return;
    
    if (currentUser) {
        authContainer.innerHTML = `
            <div class="auth-header">
                <h2>Welcome, ${currentUser.displayName || currentUser.email.split('@')[0]}</h2>
            </div>
            <div class="feature">
                <i class="fas fa-user-circle"></i>
                <h3>Your Account</h3>
                <p>Email: ${currentUser.email}</p>
            </div>
            <div class="feature">
                <i class="fas fa-history"></i>
                <h3>Order History</h3>
                <p>View your previous orders</p>
            </div>
            <div class="feature">
                <i class="fas fa-heart"></i>
                <h3>Wishlist</h3>
                <p>Save your favorite products</p>
            </div>
            <button class="btn btn-primary" id="dashboard-logout" style="margin-top: 2rem;">
                <i class="fas fa-sign-out-alt"></i> Logout
            </button>
        `;
        
        document.getElementById('dashboard-logout').addEventListener('click', logout);
    } else {
        authContainer.innerHTML = `
            <div class="auth-tabs">
                <button class="auth-tab active" id="login-tab">Login</button>
                <button class="auth-tab" id="signup-tab">Sign Up</button>
            </div>
            
            <div class="auth-form active" id="login-form">
                <div class="auth-message" id="login-message"></div>
                <form id="login-form-content">
                    <div class="form-group">
                        <label for="login-email">Email Address</label>
                        <input type="email" id="login-email" class="form-control" required>
                    </div>
                    <div class="form-group">
                        <label for="login-password">Password</label>
                        <input type="password" id="login-password" class="form-control" required>
                    </div>
                    <button type="submit" class="btn btn-primary" style="width: 100%;">
                        <i class="fas fa-sign-in-alt"></i> Login
                    </button>
                </form>
            </div>
            
            <div class="auth-form" id="signup-form">
                <div class="auth-message" id="signup-message"></div>
                <form id="signup-form-content">
                    <div class="form-group">
                        <label for="signup-name">Full Name</label>
                        <input type="text" id="signup-name" class="form-control" required>
                    </div>
                    <div class="form-group">
                        <label for="signup-email">Email Address</label>
                        <input type="email" id="signup-email" class="form-control" required>
                    </div>
                    <div class="form-group">
                        <label for="signup-password">Password</label>
                        <input type="password" id="signup-password" class="form-control" required minlength="6">
                    </div>
                    <div class="form-group">
                        <label for="signup-confirm-password">Confirm Password</label>
                        <input type="password" id="signup-confirm-password" class="form-control" required>
                    </div>
                    <button type="submit" class="btn btn-primary" style="width: 100%;">
                        <i class="fas fa-user-plus"></i> Sign Up
                    </button>
                </form>
            </div>
        `;
        
        const loginTab = document.getElementById('login-tab');
        const signupTab = document.getElementById('signup-tab');
        const loginForm = document.getElementById('login-form');
        const signupForm = document.getElementById('signup-form');
        
        if (loginTab && signupTab && loginForm && signupForm) {
            loginTab.addEventListener('click', () => {
                document.querySelectorAll('.auth-tab').forEach(tab => tab.classList.remove('active'));
                document.querySelectorAll('.auth-form').forEach(form => form.classList.remove('active'));
                loginTab.classList.add('active');
                loginForm.classList.add('active');
            });
            
            signupTab.addEventListener('click', () => {
                document.querySelectorAll('.auth-tab').forEach(tab => tab.classList.remove('active'));
                document.querySelectorAll('.auth-form').forEach(form => form.classList.remove('active'));
                signupTab.classList.add('active');
                signupForm.classList.add('active');
            });
            
            const loginFormContent = document.getElementById('login-form-content');
            if (loginFormContent) {
                loginFormContent.addEventListener('submit', async (e) => {
                    e.preventDefault();
                    const email = document.getElementById('login-email').value;
                    const password = document.getElementById('login-password').value;
                    
                    const result = await login(email, password);
                    if (result.success) {
                        // UI will update via auth state change
                    }
                });
            }
            
            const signupFormContent = document.getElementById('signup-form-content');
            if (signupFormContent) {
                signupFormContent.addEventListener('submit', async (e) => {
                    e.preventDefault();
                    const name = document.getElementById('signup-name').value;
                    const email = document.getElementById('signup-email').value;
                    const password = document.getElementById('signup-password').value;
                    const confirmPassword = document.getElementById('signup-confirm-password').value;
                    
                    if (password !== confirmPassword) {
                        const signupMessage = document.getElementById('signup-message');
                        if (signupMessage) {
                            signupMessage.textContent = 'Passwords do not match';
                            signupMessage.className = 'auth-message error';
                        }
                        return;
                    }
                    
                    const result = await signUp(email, password, name);
                    if (result.success) {
                        // UI will update via auth state change
                    }
                });
            }
        }
    }
}

// ==================== NAVIGATION & SETTINGS ====================
document.addEventListener('DOMContentLoaded', function() {
    initializeFirebase();
    initializeEmailJS();
    loadReviewsFromStorage();
    setupNavigation();
    setupEventListeners();
    loadProducts();
    loadSettings();
    initializeCountdownTimer();
    
    setTimeout(() => {
        showLoading(false);
    }, 500);
});

let isMenuOpen = false;

function setupNavigation() {
    const navLinks = document.querySelectorAll('.nav-link, .mobile-nav-item');
    const pages = document.querySelectorAll('.page');
    const mobileMenuBtn = document.getElementById('mobile-menu-btn');
    
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            
            navLinks.forEach(l => l.classList.remove('active'));
            pages.forEach(page => page.classList.remove('active'));
            
            this.classList.add('active');
            
            let pageId = this.getAttribute('data-page');
            
            const pageElement = document.getElementById(pageId);
            if (pageElement) {
                pageElement.classList.add('active');
                loadPageContent(pageId);
                window.scrollTo({ top: 0, behavior: 'smooth' });
            }
            
            closeMobileMenu();
        });
    });
    
    if (mobileMenuBtn) {
        mobileMenuBtn.addEventListener('click', function(e) {
            e.stopPropagation();
            toggleMobileMenu();
        });
    }
    
    document.addEventListener('click', function(e) {
        if (!e.target.closest('.nav-links') && !e.target.closest('.mobile-menu-btn') && isMenuOpen) {
            closeMobileMenu();
        }
    });
    
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && isMenuOpen) {
            closeMobileMenu();
        }
    });
}

function toggleMobileMenu() {
    if (isMenuOpen) {
        closeMobileMenu();
    } else {
        openMobileMenu();
    }
}

function openMobileMenu() {
    const navLinksContainer = document.getElementById('nav-links');
    const mobileMenuBtn = document.getElementById('mobile-menu-btn');
    
    if (navLinksContainer) navLinksContainer.classList.add('active');
    if (mobileMenuBtn) {
        mobileMenuBtn.innerHTML = '<i class="fas fa-times"></i>';
        mobileMenuBtn.setAttribute('aria-label', 'Close menu');
    }
    isMenuOpen = true;
    document.body.style.overflow = 'hidden';
}

function closeMobileMenu() {
    const navLinksContainer = document.getElementById('nav-links');
    const mobileMenuBtn = document.getElementById('mobile-menu-btn');
    
    if (navLinksContainer) navLinksContainer.classList.remove('active');
    if (mobileMenuBtn) {
        mobileMenuBtn.innerHTML = '<i class="fas fa-bars"></i>';
        mobileMenuBtn.setAttribute('aria-label', 'Open menu');
    }
    isMenuOpen = false;
    document.body.style.overflow = 'auto';
}

function setupEventListeners() {
    const settingsIcon = document.getElementById('settings-icon');
    const settingsModal = document.getElementById('settings-modal');
    const closeSettings = document.getElementById('close-settings');
    
    if (settingsIcon) settingsIcon.addEventListener('click', openSettings);
    if (closeSettings) closeSettings.addEventListener('click', closeSettingsModal);
    
    if (settingsModal) {
        settingsModal.addEventListener('click', function(e) {
            if (e.target === this) {
                closeSettingsModal();
            }
        });
    }
    
    document.querySelectorAll('.settings-tab').forEach(tab => {
        tab.addEventListener('click', function() {
            const tabId = this.getAttribute('data-tab') + '-tab';
            
            document.querySelectorAll('.settings-tab').forEach(t => t.classList.remove('active'));
            document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
            
            this.classList.add('active');
            const tabContent = document.getElementById(tabId);
            if (tabContent) tabContent.classList.add('active');
        });
    });
    
    document.querySelectorAll('.theme-option').forEach(option => {
        option.addEventListener('click', function() {
            const theme = this.getAttribute('data-theme');
            applyTheme(theme);
            showNotification('Theme changed successfully!');
        });
    });
    
    document.querySelectorAll('.language-option').forEach(option => {
        option.addEventListener('click', function() {
            const lang = this.getAttribute('data-lang');
            changeLanguage(lang);
        });
    });
    
    setupSliders();
    
    document.querySelectorAll('.font-option').forEach(option => {
        option.addEventListener('click', function() {
            const font = this.getAttribute('data-font');
            applyFont(font);
            showNotification('Font changed successfully!');
        });
    });
    
    const resetBtn = document.getElementById('reset-settings');
    if (resetBtn) {
        resetBtn.addEventListener('click', function() {
            if (confirm('Are you sure you want to reset all settings to default?')) {
                resetSettings();
            }
        });
    }
    
    const shareBtn = document.getElementById('share-website');
    if (shareBtn) {
        shareBtn.addEventListener('click', shareWebsite);
    }
    
    const contactForm = document.getElementById('contact-form');
    if (contactForm) {
        contactForm.addEventListener('submit', handleContactForm);
    }
    
    const seeVideoHomeBtn = document.getElementById('see-video-home');
    const buyProductHomeBtn = document.getElementById('buy-product-home');
    const seeVideoOfferBtn = document.getElementById('see-video-offer');
    const buyProductOfferBtn = document.getElementById('buy-product-offer');
    const buyNowDetailBtn = document.getElementById('buy-now-detail');
    const shareDetailBtn = document.getElementById('share-detail');
    const buyProductVideoBtn = document.getElementById('buy-product-video');
    
    if (seeVideoHomeBtn) seeVideoHomeBtn.addEventListener('click', () => navigateToPage('video'));
    if (buyProductHomeBtn) buyProductHomeBtn.addEventListener('click', () => navigateToPage('products'));
    if (seeVideoOfferBtn) seeVideoOfferBtn.addEventListener('click', () => navigateToPage('video'));
    if (buyProductOfferBtn) buyProductOfferBtn.addEventListener('click', () => navigateToPage('products'));
    
    if (buyNowDetailBtn) {
        buyNowDetailBtn.addEventListener('click', () => {
            const productName = document.getElementById('product-detail-name').textContent;
            const productImg = document.getElementById('product-detail-img');
            const productDescription = document.getElementById('product-detail-description');
            if (productName && productImg && productDescription) {
                shareProduct(productName, productImg.src, productDescription.textContent);
            }
        });
    }
    
    if (shareDetailBtn) {
        shareDetailBtn.addEventListener('click', () => {
            const productName = document.getElementById('product-detail-name').textContent;
            const productImg = document.getElementById('product-detail-img');
            const productDescription = document.getElementById('product-detail-description');
            if (productName && productImg && productDescription) {
                shareProduct(productName, productImg.src, productDescription.textContent);
            }
        });
    }
    
    if (buyProductVideoBtn) buyProductVideoBtn.addEventListener('click', () => navigateToPage('products'));
    
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', logout);
    }
}

function applyTheme(theme) {
    document.body.className = '';
    if (theme !== 'default') {
        document.body.classList.add(`theme-${theme}`);
    }
    
    document.querySelectorAll('.theme-option').forEach(opt => opt.classList.remove('active'));
    const activeOption = document.querySelector(`.theme-option[data-theme="${theme}"]`);
    if (activeOption) activeOption.classList.add('active');
    
    localStorage.setItem('theme', theme);
}

function applyFont(font) {
    let fontFamily;
    switch(font) {
        case 'serif': 
            fontFamily = 'Georgia, serif';
            break;
        case 'monospace': 
            fontFamily = "'Courier New', monospace";
            break;
        case 'cursive': 
            fontFamily = "'Comic Sans MS', cursive";
            break;
        case 'jameel': 
            fontFamily = "'Jameel Noori Nastaleeq', 'Jameel Noori', 'Noto Nastaliq Urdu', serif";
            break;
        default: 
            fontFamily = "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen-Sans, Ubuntu, Cantarell, sans-serif";
    }
    
    document.documentElement.style.setProperty('--font-family', fontFamily);
    
    document.querySelectorAll('.font-option').forEach(opt => opt.classList.remove('active'));
    const activeOption = document.querySelector(`.font-option[data-font="${font}"]`);
    if (activeOption) activeOption.classList.add('active');
    
    localStorage.setItem('fontFamily', font);
}

function shareWebsite() {
    if (navigator.share) {
        navigator.share({
            title: 'HT Service - Innovative Products',
            text: 'Check out these amazing HT Service products!',
            url: window.location.href
        }).catch(err => {
            console.log('Error sharing:', err);
        });
    } else {
        const message = `Check out HT Service products! ${window.location.href}`;
        const encodedMessage = encodeURIComponent(message);
        window.open(`https://wa.me/?text=${encodedMessage}`, '_blank');
    }
}

function shareProduct(productName, productImage, productDescription) {
    const message = `Check out ${productName} from HT Service:\n\n${productDescription}\n\n${window.location.href}`;
    const encodedMessage = encodeURIComponent(message);
    window.open(`https://wa.me/?text=${encodedMessage}`, '_blank');
}

function setupSliders() {
    const fontSizeSlider = document.getElementById('font-size-slider');
    const fontSizeValue = document.getElementById('font-size-value');
    
    if (fontSizeSlider && fontSizeValue) {
        fontSizeSlider.addEventListener('input', function() {
            const fontSize = this.value + 'px';
            fontSizeValue.textContent = fontSize;
            document.documentElement.style.setProperty('--font-size', fontSize);
            localStorage.setItem('fontSize', this.value);
        });
    }
    
    const borderRadiusSlider = document.getElementById('border-radius-slider');
    const borderRadiusValue = document.getElementById('border-radius-value');
    
    if (borderRadiusSlider && borderRadiusValue) {
        borderRadiusSlider.addEventListener('input', function() {
            const borderRadius = this.value + 'px';
            borderRadiusValue.textContent = borderRadius;
            document.documentElement.style.setProperty('--border-radius', borderRadius);
            localStorage.setItem('borderRadius', this.value);
        });
    }
    
    const brightnessSlider = document.getElementById('brightness-slider');
    const brightnessValue = document.getElementById('brightness-value');
    
    if (brightnessSlider && brightnessValue) {
        brightnessSlider.addEventListener('input', function() {
            const brightness = this.value + '%';
            brightnessValue.textContent = brightness;
            document.documentElement.style.setProperty('--brightness', brightness);
            localStorage.setItem('brightness', this.value);
        });
    }
    
    const contrastSlider = document.getElementById('contrast-slider');
    const contrastValue = document.getElementById('contrast-value');
    
    if (contrastSlider && contrastValue) {
        contrastSlider.addEventListener('input', function() {
            const contrast = this.value + '%';
            contrastValue.textContent = contrast;
            document.documentElement.style.setProperty('--contrast', contrast);
            localStorage.setItem('contrast', this.value);
        });
    }
    
    const saturationSlider = document.getElementById('saturation-slider');
    const saturationValue = document.getElementById('saturation-value');
    
    if (saturationSlider && saturationValue) {
        saturationSlider.addEventListener('input', function() {
            const saturation = this.value + '%';
            saturationValue.textContent = saturation;
            document.documentElement.style.setProperty('--saturation', saturation);
            localStorage.setItem('saturation', this.value);
        });
    }
    
    const animationSpeedSlider = document.getElementById('animation-speed-slider');
    const animationSpeedValue = document.getElementById('animation-speed-value');
    
    if (animationSpeedSlider && animationSpeedValue) {
        animationSpeedSlider.addEventListener('input', function() {
            const animationSpeed = this.value + 's';
            animationSpeedValue.textContent = animationSpeed;
            document.documentElement.style.setProperty('--animation-speed', animationSpeed);
            localStorage.setItem('animationSpeed', this.value);
        });
    }
}

function loadSettings() {
    const savedTheme = localStorage.getItem('theme') || 'default';
    applyTheme(savedTheme);
    
    const savedFont = localStorage.getItem('fontFamily') || 'sans-serif';
    applyFont(savedFont);
    
    const savedFontSize = localStorage.getItem('fontSize') || '16';
    const fontSizeSlider = document.getElementById('font-size-slider');
    const fontSizeValue = document.getElementById('font-size-value');
    if (fontSizeSlider && fontSizeValue) {
        fontSizeSlider.value = savedFontSize;
        fontSizeValue.textContent = savedFontSize + 'px';
        document.documentElement.style.setProperty('--font-size', savedFontSize + 'px');
    }
    
    const savedBorderRadius = localStorage.getItem('borderRadius') || '12';
    const borderRadiusSlider = document.getElementById('border-radius-slider');
    const borderRadiusValue = document.getElementById('border-radius-value');
    if (borderRadiusSlider && borderRadiusValue) {
        borderRadiusSlider.value = savedBorderRadius;
        borderRadiusValue.textContent = savedBorderRadius + 'px';
        document.documentElement.style.setProperty('--border-radius', savedBorderRadius + 'px');
    }
    
    const savedBrightness = localStorage.getItem('brightness') || '100';
    const brightnessSlider = document.getElementById('brightness-slider');
    const brightnessValue = document.getElementById('brightness-value');
    if (brightnessSlider && brightnessValue) {
        brightnessSlider.value = savedBrightness;
        brightnessValue.textContent = savedBrightness + '%';
        document.documentElement.style.setProperty('--brightness', savedBrightness + '%');
    }
    
    const savedContrast = localStorage.getItem('contrast') || '100';
    const contrastSlider = document.getElementById('contrast-slider');
    const contrastValue = document.getElementById('contrast-value');
    if (contrastSlider && contrastValue) {
        contrastSlider.value = savedContrast;
        contrastValue.textContent = savedContrast + '%';
        document.documentElement.style.setProperty('--contrast', savedContrast + '%');
    }
    
    const savedSaturation = localStorage.getItem('saturation') || '100';
    const saturationSlider = document.getElementById('saturation-slider');
    const saturationValue = document.getElementById('saturation-value');
    if (saturationSlider && saturationValue) {
        saturationSlider.value = savedSaturation;
        saturationValue.textContent = savedSaturation + '%';
        document.documentElement.style.setProperty('--saturation', savedSaturation + '%');
    }
    
    const savedAnimationSpeed = localStorage.getItem('animationSpeed') || '0.3';
    const animationSpeedSlider = document.getElementById('animation-speed-slider');
    const animationSpeedValue = document.getElementById('animation-speed-value');
    if (animationSpeedSlider && animationSpeedValue) {
        animationSpeedSlider.value = savedAnimationSpeed;
        animationSpeedValue.textContent = savedAnimationSpeed + 's';
        document.documentElement.style.setProperty('--animation-speed', savedAnimationSpeed + 's');
    }
    
    const savedLang = localStorage.getItem('language') || 'en';
    changeLanguage(savedLang);
}

function openSettings() {
    const settingsModal = document.getElementById('settings-modal');
    if (settingsModal) {
        settingsModal.style.display = 'flex';
        closeMobileMenu();
    }
}

function closeSettingsModal() {
    const settingsModal = document.getElementById('settings-modal');
    if (settingsModal) {
        settingsModal.style.display = 'none';
        saveSettings();
    }
}

function saveSettings() {
    showNotification('Settings saved successfully!');
}

function resetSettings() {
    localStorage.clear();
    location.reload();
}

// iOS zoom fix
if (isMobile.iOS()) {
    document.addEventListener('focusin', function(event) {
        if (event.target.tagName === 'INPUT' || event.target.tagName === 'TEXTAREA' || event.target.tagName === 'SELECT') {
            setTimeout(function() {
                event.target.style.fontSize = '16px';
            }, 0);
        }
    });
    
    document.addEventListener('focusout', function(event) {
        if (event.target.tagName === 'INPUT' || event.target.tagName === 'TEXTAREA' || event.target.tagName === 'SELECT') {
            setTimeout(function() {
                event.target.style.fontSize = '';
            }, 0);
        }
    });
}

window.addEventListener('orientationchange', function() {
    setTimeout(() => {
        window.scrollTo(0, 0);
    }, 100);
});