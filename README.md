# Bias in LLMs - Simplified Version

This is a simplified, static version of the "Bias in LLMs" project that runs entirely in the browser without requiring Node.js or a server.

## Features

- ✅ Browse bias examples by category
- ✅ Copy prompts to test in LLM tools
- ✅ View detailed explanations and mitigation strategies
- ✅ Responsive design for mobile and desktop
- ✅ No server required - runs entirely in the browser

## How to Use

1. Simply open `index.html` in any modern web browser
2. Browse cards by category or view all
3. Click "Copy" to copy prompts to your clipboard
4. Click "Learn more" to see detailed explanations
5. Use the copied prompts in your favorite LLM tool

## Project Structure

```
bias-card-view-simple/
├── index.html          # Main HTML file with all views
├── css/
│   └── style.css       # Combined styles
├── js/
│   ├── data.js         # Embedded JSON data
│   └── app.js          # Main application logic
└── README.md           # This file
```

## Differences from Original

- **No Node.js required**: Runs entirely in the browser
- **Embedded data**: JSON data is included in JavaScript files
- **Single page**: All views (home, detail, about) are in one HTML file
- **Simplified routing**: Uses JavaScript to show/hide views instead of server routing

## Original Project

This is a simplified version of the original project by Jesús Martín. For the full server-based version, see the parent directory.

## License

Free to use for educational and research purposes.