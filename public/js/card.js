function getCategoryStyle(categories) {
    if (!categories || categories.length === 0) return '';

    if (categories.length === 1) {
        const category = categories[0].toLowerCase().replace(' ', '-');
        return `border-top: 4px solid var(--${category}-color);`;
    }

    // Multiple categories - create stacked borders
    const borderStyles = categories
        .map(cat => `var(--${cat.toLowerCase().replace(' ', '-')}-color)`)
        .join(', ');
    
    return `border-image: linear-gradient(to right, ${borderStyles}) 4;`;
}


function createCard(data) {
    if (data.isFixed) {
        return `
            <div class="card fixed">
                <div class="card-content">
                    <p>${data.text}</p>
                </div>
            </div>
        `;
    }

    const categoryStyle = getCategoryStyle(data.categories);
    
    return `
        <div class="card" data-id="${data.id}" style="${categoryStyle}">
            <div class="card-content">
                <p>${data.text}</p>
                <button class="copy-btn" data-text="${data.text.replace(/"/g, '&quot;')}">
                    Copy
                </button>
            </div>
            <div class="card-categories">
                ${data.categories.map(cat => `
                    <span style="color: var(--${cat.toLowerCase().replace(' ', '-')}-color)">
                        ${cat}
                    </span>
                `).join('')}
            </div>
        </div>
    `;
}




// Add click handlers
document.addEventListener('click', (e) => {
    if (e.target.classList.contains('copy-btn')) {
        e.preventDefault();
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
        return;
    }

    // Handle card clicks
    const card = e.target.closest('.card:not(.fixed)');
    if (card) {
        const id = card.dataset.id;
        if (id) {
            window.location.href = `/prompt/${id}`;
        }
    }
});
