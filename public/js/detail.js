async function loadPrompt() {
    try {
        const id = window.location.pathname.split('/prompt/')[1];
        console.log('Loading prompt with ID:', id);
        
        const response = await fetch(`/api/prompt/${id}`);
        if (!response.ok) {
            throw new Error('Failed to fetch prompt');
        }
        
        const prompt = await response.json();
        console.log('Received data:', prompt);
        
        document.getElementById('main-text').textContent = prompt.text;
        document.getElementById('why-text').textContent = prompt.why;
        document.getElementById('how-text').textContent = prompt.how;
        
        // Update category buttons
        document.getElementById('categories').innerHTML = prompt.categories
            .map(cat => `
                <button 
                    onclick="window.location.href='/?category=${encodeURIComponent(cat)}'"
                    class="category-tab" 
                    style="color: var(--${cat.toLowerCase().replace(' ', '-')}-color)">
                    ${cat}
                </button>
            `).join('');
        
        document.title = `${prompt.categories[0]} - Bias in LLMs`;
    } catch (error) {
        console.error('Error loading prompt:', error);
        document.getElementById('main-text').textContent = 'Error loading prompt';
    }
}

function copyText() {
    const text = document.getElementById('main-text').textContent;  // This gets the text content
    navigator.clipboard.writeText(text).then(() => {
        const btn = document.querySelector('.copy-btn');
        btn.textContent = 'Copied!';
        setTimeout(() => {
            btn.textContent = 'Copy';
        }, 2000);
    }).catch(err => {
        console.error('Failed to copy text: ', err);
    });
}


function setupCategoryLinks() {
    const categoriesSection = document.getElementById('categories');
    categoriesSection.addEventListener('click', (e) => {
        e.preventDefault();
        if (e.target.tagName === 'A') {
            const category = e.target.textContent;
            window.location.href = `/?category=${encodeURIComponent(category)}`;
        }
    });
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    loadPrompt().then(setupCategoryLinks);
});


// Import the createCard function
async function loadPrompt() {
    try {
        const id = window.location.pathname.split('/prompt/')[1];
        console.log('Loading prompt with ID:', id);
        
        // Fetch both the current prompt and all content
        const [promptResponse, contentResponse] = await Promise.all([
            fetch(`/api/prompt/${id}`),
            fetch('/api/content')
        ]);

        const prompt = await promptResponse.json();
        const content = await contentResponse.json();
        
        // Display main content
        document.getElementById('main-text').textContent = prompt.text;
        document.getElementById('why-text').textContent = prompt.why;
        document.getElementById('how-text').textContent = prompt.how;
        
        // Display categories
        document.getElementById('categories').innerHTML = prompt.categories
            .map(cat => `
                <button 
                    onclick="window.location.href='/?category=${encodeURIComponent(cat)}'"
                    class="category-tab" 
                    style="color: var(--${cat.toLowerCase().replace(' ', '-')}-color)">
                    ${cat}
                </button>
            `).join('');
        
        // Find related cards
        const relatedCards = content.cards
            .filter(card => 
                // Don't include the current card
                card.id !== id && 
                // Don't include the fixed card
                !card.isFixed &&
                // Check for category overlap
                card.categories?.some(cat => prompt.categories.includes(cat))
            )
            // Sort by number of matching categories (most matches first)
            .sort((a, b) => {
                const aMatches = a.categories.filter(cat => prompt.categories.includes(cat)).length;
                const bMatches = b.categories.filter(cat => prompt.categories.includes(cat)).length;
                return bMatches - aMatches;
            })
            // Take only the first 3
            .slice(0, 3);

        // Display related cards
        document.getElementById('related-cards-container').innerHTML = 
            relatedCards.map(card => createCard(card)).join('');
        
        document.title = `${prompt.categories[0]} - Bias in LLMs`;
    } catch (error) {
        console.error('Error loading prompt:', error);
        document.getElementById('main-text').textContent = 'Error loading prompt';
    }
}

// Make sure to include the createCard function from main.js
function createCard(data) {
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

// Add click handler for copy buttons in related cards

document.addEventListener('click', (e) => {
    if (e.target.classList.contains('copy-btn')) {
        // Only handle related cards' copy buttons here
        if (e.target.hasAttribute('data-text')) {
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
    }
});

document.addEventListener('DOMContentLoaded', loadPrompt);
