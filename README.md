# Snaxel Multimedia Browser - 

## Features

✨ **Multi-Source Search**
- Web pages (DuckDuckGo)
- Images (Bing Images)
- Videos (YouTube)
- News (Bing News)
- Books (Goodreads)

🎨 **Beautiful UI**
- Modern glassmorphism design
- Smooth animations and transitions
- Responsive layout (mobile-friendly)
- Dark theme with gradient accents
- Loading states and skeleton screens

⚡ **Performance**
- Parallel search execution
- In-memory results (no database needed)
- Lazy loading for images
- Optimized rendering

🔒 **Security**
- Helmet.js for HTTP headers
- CORS enabled
- XSS protection
- Input sanitization

---

## Usage

1. **Enter Search Query**: Type your search in the search box
2. **Select Sources**: Click on filter buttons (Web, Images, Videos, News, Books)
3. **Click Search**: View results from all selected sources
4. **Explore Results**: Click any result to open in a new tab

### Keyboard Shortcuts
- `/` - Focus search input
- `Enter` - Perform search
- `Escape` - Clear search input

---

## API Endpoints

### POST `/api/search`
Perform a multi-source search
```json
{
  "query": "javascript tutorial",
  "sources": ["web", "images", "videos"],
  "limit": 10
}
```

### POST `/api/search/all`
Search all sources at once
```json
{
  "query": "machine learning",
  "limit": 10
}
```

### Individual Source Endpoints
- `POST /api/search/web` - Web results only
- `POST /api/search/images` - Image results only
- `POST /api/search/videos` - Video results only
- `POST /api/search/news` - News results only
- `POST /api/search/books` - Book results only

### GET `/api/health`
Health check endpoint

---

## Project Structure Details

### Backend (`server.js`)
- Express.js server setup
- Middleware configuration
- Static file serving
- Error handling
- Graceful shutdown

### Routes (`routes/api.js`)
- Search endpoint handlers
- Snaxel Query Engine integration
- Error handling for each source
- Parallel search execution

### Frontend (`public/`)
- **index.html**: Main HTML structure
- **css/styles.css**: Complete styling with animations
- **js/app.js**: Main application logic
- **js/utils.js**: Utility functions

### Utils (`utils/cache.js`)
- Optional caching system for future use
- In-memory cache with TTL
- Cache cleanup utilities

---

## Customization

### Change Port
Edit `.env` file:
```env
PORT=8080
```

### Modify Search Limits
In `routes/api.js`, change default limits:
```javascript
const { query, sources = ['web'], limit = 20 } = req.body;
```

### Customize Styling
Edit `public/css/styles.css`:
- Change color variables in `:root`
- Modify animations and transitions
- Adjust responsive breakpoints

### Add More Sources
Extend `routes/api.js` to include additional Snaxel sources or your custom sources.

---

## Tech Stack

- **Backend**: Node.js, Express.js
- **Search Engine**: Snaxel Query Engine (Puppeteer, Cheerio)
- **Frontend**: Vanilla JavaScript, Modern CSS
- **Security**: Helmet, CORS
- **Performance**: Compression, Resource optimization

---

## Browser Compatibility

- Chrome/Edge: ✅ Full support
- Firefox: ✅ Full support
- Safari: ✅ Full support
- Mobile browsers: ✅ Responsive design

---

## Troubleshooting

### Port Already in Use
```bash
# Change port in .env or kill process
lsof -ti:3000 | xargs kill -9
```

### Puppeteer Installation Issues
```bash
# Install chromium dependencies (Linux)
sudo apt-get install -y chromium-browser

# Or use system chromium
export PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true
export PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium-browser
```

### Search Not Working
- Check if snaxel-query-engine is properly installed
- Verify network connectivity
- Check browser console for errors
- Ensure Node.js version >= 14

---

## Performance Tips

1. **Browser Reuse**: Snaxel automatically reuses browser instances
2. **Close Gracefully**: Use Ctrl+C to close browser properly
3. **Limit Results**: Use appropriate limits to reduce load time
4. **Enable Compression**: Already enabled via compression middleware

---

## License

MIT License - Feel free to use for educational purposes

---

## Credits

Built with ❤️ using:
- [Snaxel Query Engine](https://github.com/priyanshu-i/snaxel-query-engine)
- Express.js
- Modern Web Technologies

---

## Notes

⚠️ **Important**:
- This is for educational purposes only
- Respect website terms of service
- No database required - all in-memory
- Browser instance managed by Snaxel Query Engine
- Results are fetched in real-time

Enjoy your multimedia browsing experience! 🚀