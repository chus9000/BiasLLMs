let content = null;
let selectedCategories = new Set();
let msnry;

async function loadContent() {
    try {
        console.log('Fetching content...');
        const response = await fetch('/api/content');
        if (!response.ok) {
            throw new Error(`Failed to fetch content: ${response.status} ${response.statusText}`);
        }
        content = await response.json();
        console.log('Loaded content:', content);

        const urlParams = new URLSearchParams(window.location.search);
        const categoryParam = urlParams.get('category');
        if (categoryParam) {
            selectedCategories.clear();
            selectedCategories.add(categoryParam);
            console.log('Category from URL:', categoryParam);
        }

        renderCategories();
        renderCards();

        if (categoryParam) {
            history.replaceState({}, '', '/');
        }
    } catch (error) {
        console.error('Error loading content:', error);
        document.getElementById('cards-container').innerHTML = `Error loading content: ${error.message}`;
    }
}

function renderCategories() {
    const tabsContainer = document.getElementById('category-tabs');
    const dropdownContent = document.getElementById('category-dropdown-content');
    const dropdownBtn = document.querySelector('.category-dropdown-btn');
    const dropdownContainer = document.querySelector('.category-dropdown');
    
    if (!content || !content.categories) return;

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




function handleCategoryClick(e) {
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

        document.querySelector('.category-dropdown-btn').textContent = category;
        document.getElementById('category-dropdown-content').classList.remove('show');

        renderCards();
    }
}



function filterCards(cards) {
    return cards.filter(card => {
        if (card.isFixed) return true;
        if (selectedCategories.size === 0) return true;
        return card.categories?.some(cat => selectedCategories.has(cat));
    });
}


function renderCards() {
    console.log('Rendering cards with selected categories:', Array.from(selectedCategories));
    const container = document.getElementById('cards-container');
    if (!content || !content.cards) {
        console.warn('No cards to render');
        return;
    }

    const filteredCards = filterCards(content.cards);
    console.log(`Filtered cards count: ${filteredCards.length}`);

    if (filteredCards.length === 0) {
        container.innerHTML = '<div class="no-results">No cards found for the selected categories</div>';
        return;
    }

    container.innerHTML = filteredCards.map(card => createCard(card)).join('');
    initMasonry();
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
                    <button class="learn-more-btn" onclick="window.location.href='/prompt/${data.id}'">
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

// Event Listeners
document.addEventListener('click', (e) => {
    if (e.target.classList.contains('copy-btn')) {
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


let resizeTimer;
window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
        if (msnry) {
            msnry.layout();
        }
    }, 250);
});

// Initialize when the page loads
console.log('main.js loaded');
document.addEventListener('DOMContentLoaded', loadContent);


