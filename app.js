const express = require('express');
const path = require('path');
const app = express();

// Serve static files
app.use(express.static('public'));

// API endpoint to get content
app.get('/api/content', (req, res) => {
    try {
        const content = require('./data/content.json');
        res.json({
            categories: content.categories,
            cards: content.cards
        });
    } catch (error) {
        console.error('Error loading content:', error);
        res.status(500).json({ error: 'Failed to load content' });
    }
});



// API endpoint to get individual prompt
app.get('/api/prompt/:id', (req, res) => {
    try {
        const content = require('./data/content.json');
        const prompt = content.cards.find(card => card.id === req.params.id);
        if (prompt) {
            res.json(prompt);
        } else {
            res.status(404).json({ error: 'Prompt not found' });
        }
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Route for detail page
app.get('/prompt/:id', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'detail.html'));
});

// Serve index.html for root route
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Serve about page
app.get('/about', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'about.html'));
});

// Catch-all route for any other requests
app.get('*', (req, res) => {
    res.redirect('/');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});


