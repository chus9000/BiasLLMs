let selectedCategories = new Set();
let msnry;
let currentView = 'home';
let displayedCards = 10;
let isLoading = false;

// Initialize the app
document.addEventListener('DOMContentLoaded', () => {
    if (window.location.protocol !== 'file:') {
        handleRoute();
    }
    renderCategories();
    renderCards();
    showCookieBanner();
});

// Handle browser back/forward
if (window.location.protocol !== 'file:') {
    window.addEventListener('popstate', handleRoute);
}

// Route handling
function handleRoute() {
    const path = window.location.pathname;
    if (path.startsWith('/prompt/')) {
        const id = path.split('/prompt/')[1];
        showDetail(id);
    } else if (path === '/about') {
        showAbout();
    } else if (path === '/privacy') {
        showPrivacy();
    } else if (path === '/terms') {
        showTerms();
    } else {
        showHome();
    }
}

// Navigation with URL update
function navigateToDetail(id) {
    if (window.location.protocol !== 'file:') {
        history.pushState({}, '', `/prompt/${id}`);
    }
    showDetail(id);
}

// Cookie functions
function showCookieBanner() {
    if (!localStorage.getItem('cookiesAccepted')) {
        document.getElementById('cookie-banner').style.display = 'block';
    }
}

function acceptCookies() {
    localStorage.setItem('cookiesAccepted', 'true');
    document.getElementById('cookie-banner').style.display = 'none';
}

// Navigation functions
function showHome() {
    currentView = 'home';
    document.getElementById('home-view').style.display = 'block';
    document.getElementById('detail-view').style.display = 'none';
    document.getElementById('about-view').style.display = 'none';
    document.getElementById('privacy-view').style.display = 'none';
    document.getElementById('terms-view').style.display = 'none';
    document.getElementById('nav-link').textContent = 'About this project';
    document.getElementById('nav-link').onclick = showAbout;
    renderCards();
}

function showPrivacy() {
    currentView = 'privacy';
    document.getElementById('home-view').style.display = 'none';
    document.getElementById('detail-view').style.display = 'none';
    document.getElementById('about-view').style.display = 'none';
    document.getElementById('privacy-view').style.display = 'block';
    document.getElementById('terms-view').style.display = 'none';
    document.getElementById('nav-link').textContent = '← Go Back';
    document.getElementById('nav-link').onclick = showHome;
}

function showTerms() {
    currentView = 'terms';
    document.getElementById('home-view').style.display = 'none';
    document.getElementById('detail-view').style.display = 'none';
    document.getElementById('about-view').style.display = 'none';
    document.getElementById('privacy-view').style.display = 'none';
    document.getElementById('terms-view').style.display = 'block';
    document.getElementById('nav-link').textContent = '← Go Back';
    document.getElementById('nav-link').onclick = showHome;
}

function showAbout() {
    currentView = 'about';
    document.getElementById('home-view').style.display = 'none';
    document.getElementById('detail-view').style.display = 'none';
    document.getElementById('about-view').style.display = 'block';
    document.getElementById('privacy-view').style.display = 'none';
    document.getElementById('terms-view').style.display = 'none';
    document.getElementById('nav-link').textContent = '← Go Back';
    document.getElementById('nav-link').onclick = showHome;
}

function showDetail(id) {
    currentView = 'detail';
    document.getElementById('home-view').style.display = 'none';
    document.getElementById('detail-view').style.display = 'block';
    document.getElementById('about-view').style.display = 'none';
    document.getElementById('privacy-view').style.display = 'none';
    document.getElementById('terms-view').style.display = 'none';
    document.getElementById('nav-link').textContent = '← Go Back';
    document.getElementById('nav-link').onclick = showHome;
    loadPrompt(id);
}

// Category rendering
function renderCategories() {
    const tabsContainer = document.getElementById('category-tabs');
    const dropdownContent = document.getElementById('category-dropdown-content');
    const dropdownBtn = document.querySelector('.category-dropdown-btn');
    const dropdownContainer = document.querySelector('.category-dropdown');
    
    const categoriesHTML = `
        <button class="category-tab ${selectedCategories.size === 0 ? 'selected' : ''}" data-category="all">
            All
        </button>
        ${content.categories.map(category => `
            <button class="category-tab ${selectedCategories.has(category) ? 'selected' : ''}" data-category="${category}">
                ${category}
            </button>
        `).join('')}
    `;

    tabsContainer.innerHTML = categoriesHTML;
    dropdownContent.innerHTML = categoriesHTML;

    // Update dropdown button text and color
    const selectedCategory = selectedCategories.size === 0 ? 'all' : Array.from(selectedCategories)[0];
    dropdownBtn.textContent = selectedCategory === 'all' ? 'All Categories' : selectedCategory;
    dropdownBtn.dataset.selected = selectedCategory;

    // Handle dropdown toggling
    dropdownBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        dropdownContainer.classList.toggle('open');
        document.body.style.overflow = dropdownContainer.classList.contains('open') ? 'hidden' : '';
    });

    // Handle clicks on the overlay
    document.querySelector('.category-dropdown-overlay').addEventListener('click', () => {
        dropdownContainer.classList.remove('open');
        document.body.style.overflow = '';
    });

    // Handle category selection
    const handleCategoryClick = (e) => {
        if (e.target.classList.contains('category-tab')) {
            const category = e.target.dataset.category;
            
            document.querySelectorAll('.category-tab').forEach(tab => 
                tab.classList.remove('selected'));
            
            e.target.classList.add('selected');

            if (category === 'all') {
                selectedCategories.clear();
            } else {
                selectedCategories.clear();
                selectedCategories.add(category);
            }

            // Update dropdown button
            dropdownBtn.textContent = category === 'all' ? 'All Categories' : category;
            dropdownBtn.dataset.selected = category;
            
            // Close dropdown
            dropdownContainer.classList.remove('open');
            document.body.style.overflow = '';

            renderCards();
        }
    };

    tabsContainer.addEventListener('click', handleCategoryClick);
    dropdownContent.addEventListener('click', handleCategoryClick);
}

// Card filtering and rendering
function filterCards(cards) {
    return cards.filter(card => {
        if (card.isFixed) return true;
        if (selectedCategories.size === 0) return true;
        return card.categories?.some(cat => selectedCategories.has(cat));
    });
}

function renderCards() {
    const container = document.getElementById('cards-container');
    const filteredCards = filterCards(content.cards);

    if (filteredCards.length === 0) {
        container.innerHTML = '<div class="no-results">No cards found for the selected categories</div>';
        return;
    }

    displayedCards = Math.min(20, filteredCards.length);
    container.innerHTML = filteredCards.slice(0, displayedCards).map(card => createCard(card)).join('');
    initMasonry();
}

function loadMoreCards() {
    if (isLoading) return;
    
    const filteredCards = filterCards(content.cards);
    if (displayedCards >= filteredCards.length) return;
    
    isLoading = true;
    const nextBatch = Math.min(3, filteredCards.length - displayedCards);
    const newCards = filteredCards.slice(displayedCards, displayedCards + nextBatch);
    
    document.getElementById('cards-container').innerHTML += newCards.map(card => createCard(card)).join('');
    displayedCards += nextBatch;
    
    if (msnry) msnry.reloadItems().layout();
    isLoading = false;
}

function createCard(data) {
    if (data.isFixed) {
        return `
            <div class="card fixed" data-id="welcome">
                <div class="card-content">
                    ${data.text}
                </div>
            </div>
        `;
    }

    return `
        <div class="card" data-categories="${data.categories.join(' ')}">
            <div class="card-content">
                <p>${data.text}</p>
                <div class="card-actions">
                    <button class="copy-btn" data-text="${data.text.replace(/"/g, '&quot;')}">
                        Copy
                    </button>
                    <button class="learn-more-btn" onclick="navigateToDetail('${data.id}')">
                        Learn more
                    </button>
                </div>
            </div>
            <div class="card-categories">
                ${data.categories.map(cat => `<span>${cat}</span>`).join('')}
            </div>
        </div>
    `;
}

// Masonry layout
function initMasonry() {
    const grid = document.querySelector('#cards-container');
    if (msnry) {
        msnry.destroy();
    }

    msnry = new Masonry(grid, {
        itemSelector: '.card',
        columnWidth: '.card',
        gutter: 16,
        percentPosition: true,
        fitWidth: true,
        transitionDuration: {
            transform: '0.4s',
            height: '0s'
        },
        stagger: 30,
    });

    setTimeout(() => msnry.layout(), 100);
}

// Detail view functions
function loadPrompt(id) {
    const prompt = content.cards.find(card => card.id === id);
    if (!prompt) return;
    
    document.getElementById('main-text').textContent = prompt.text;
    document.getElementById('why-text').textContent = prompt.why;
    document.getElementById('how-text').textContent = prompt.how;
    
    // Display categories
    document.getElementById('categories').innerHTML = prompt.categories
        .map(cat => `
            <button 
                onclick="filterByCategory('${cat}')"
                class="category-tab" 
                style="color: var(--${cat.toLowerCase().replace(' ', '-')}-color)">
                ${cat}
            </button>
        `).join('');
    
    // Find related cards
    const relatedCards = content.cards
        .filter(card => 
            card.id !== id && 
            !card.isFixed &&
            card.categories?.some(cat => prompt.categories.includes(cat))
        )
        .sort((a, b) => {
            const aMatches = a.categories.filter(cat => prompt.categories.includes(cat)).length;
            const bMatches = b.categories.filter(cat => prompt.categories.includes(cat)).length;
            return bMatches - aMatches;
        })
        .slice(0, 3);

    // Display related cards
    document.getElementById('related-cards-container').innerHTML = 
        relatedCards.map(card => createCard(card)).join('');
}

function filterByCategory(category) {
    selectedCategories.clear();
    selectedCategories.add(category);
    showHome();
}

function copyDetailText() {
    const text = document.getElementById('main-text').textContent;
    navigator.clipboard.writeText(text).then(() => {
        const btn = document.querySelector('.detail-actions .copy-btn');
        btn.textContent = 'Copied!';
        setTimeout(() => {
            btn.textContent = 'Copy';
        }, 2000);
    }).catch(err => {
        console.error('Failed to copy text: ', err);
    });
}

// Event listeners
document.addEventListener('click', (e) => {
    if (e.target.classList.contains('copy-btn') && e.target.hasAttribute('data-text')) {
        e.stopPropagation();
        const text = e.target.dataset.text;
        navigator.clipboard.writeText(text).then(() => {
            e.target.textContent = 'Copied!';
            setTimeout(() => {
                e.target.textContent = 'Copy';
            }, 2000);
        }).catch(err => {
            console.error('Failed to copy text: ', err);
        });
    }
});

// Responsive layout and infinite scroll
let resizeTimer;
window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
        if (msnry && currentView === 'home') {
            msnry.layout();
        }
    }, 250);
});

window.addEventListener('scroll', () => {
    if (currentView === 'home' && window.innerHeight + window.scrollY >= document.body.offsetHeight - 500) {
        loadMoreCards();
    }
});

// Debug: Add console logs
function loadMoreCards() {
    console.log('loadMoreCards called', {displayedCards, totalCards: content.cards.length, isLoading});
    if (isLoading) return;
    
    const filteredCards = filterCards(content.cards);
    if (displayedCards >= filteredCards.length) return;
    
    isLoading = true;
    const nextBatch = Math.min(3, filteredCards.length - displayedCards);
    const newCards = filteredCards.slice(displayedCards, displayedCards + nextBatch);
    
    const container = document.getElementById('cards-container');
    const newCardsHTML = newCards.map(card => createCard(card)).join('');
    container.insertAdjacentHTML('beforeend', newCardsHTML);
    displayedCards += nextBatch;
    
    const currentScrollY = window.scrollY;
    setTimeout(() => {
        if (msnry) {
            msnry.destroy();
            initMasonry();
        }
        window.scrollTo(0, currentScrollY);
        isLoading = false;
        console.log('Cards loaded:', displayedCards);
    }, 100);
}