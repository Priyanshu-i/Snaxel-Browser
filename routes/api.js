import express from 'express';
import {
  getWebResults,
  getImageResults,
  getVideoResults,
  getNewsResults,
  getBookResults,
  queryAllSources,
  summarizeResults,
  CONFIG
} from 'snaxel-query-engine';

const router = express.Router();

// Configure Puppeteer for production environment
if (process.env.NODE_ENV === 'production') {
  CONFIG.puppeteerArgs = [
    '--no-sandbox',
    '--disable-setuid-sandbox',
    '--disable-dev-shm-usage',
    '--disable-accelerated-2d-canvas',
    '--no-first-run',
    '--no-zygote',
    '--single-process',
    '--disable-gpu'
  ];
  
  // Use system chromium if available
  if (process.env.PUPPETEER_EXECUTABLE_PATH) {
    CONFIG.executablePath = process.env.PUPPETEER_EXECUTABLE_PATH;
  }
}

// Health check
router.get('/health', (req, res) => {
  res.json({
    success: true,
    status: 'healthy',
    timestamp: new Date().toISOString()
  });
});

// Main search endpoint
router.post('/search', async (req, res) => {
  try {
    const { query, sources = ['web'], limit = 10 } = req.body;

    if (!query || query.trim().length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Query parameter is required'
      });
    }

    const results = {
      query: query.trim(),
      timestamp: new Date().toISOString(),
      sources: {}
    };

    // Search based on requested sources
    const searchPromises = [];

    if (sources.includes('web')) {
      searchPromises.push(
        getWebResults(query, { limit })
          .then(data => ({ type: 'web', data }))
          .catch(error => ({ type: 'web', error: error.message }))
      );
    }

    if (sources.includes('images')) {
      searchPromises.push(
        getImageResults(query, { limit: limit * 2 })
          .then(data => ({ type: 'images', data }))
          .catch(error => ({ type: 'images', error: error.message }))
      );
    }

    if (sources.includes('videos')) {
      searchPromises.push(
        getVideoResults(query, { limit })
          .then(data => ({ type: 'videos', data }))
          .catch(error => ({ type: 'videos', error: error.message }))
      );
    }

    if (sources.includes('news')) {
      searchPromises.push(
        getNewsResults(query, { limit })
          .then(data => ({ type: 'news', data }))
          .catch(error => ({ type: 'news', error: error.message }))
      );
    }

    if (sources.includes('books')) {
      searchPromises.push(
        getBookResults(query, { limit })
          .then(data => ({ type: 'books', data }))
          .catch(error => ({ type: 'books', error: error.message }))
      );
    }

    // Execute all searches in parallel
    const searchResults = await Promise.all(searchPromises);

    // Organize results
    searchResults.forEach(result => {
      if (result.error) {
        results.sources[result.type] = {
          error: result.error,
          results: []
        };
      } else {
        results.sources[result.type] = result.data;
      }
    });

    // Calculate total results
    results.totalResults = Object.values(results.sources).reduce(
      (sum, source) => sum + (source.results?.length || 0),
      0
    );

    res.json({
      success: true,
      data: results
    });

  } catch (error) {
    console.error('Search error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Search failed'
    });
  }
});

// Search all sources
router.post('/search/all', async (req, res) => {
  try {
    const { query, limit = 10 } = req.body;

    if (!query || query.trim().length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Query parameter is required'
      });
    }

    const results = await queryAllSources(query, { limit });
    const summary = summarizeResults(results);

    res.json({
      success: true,
      data: results,
      summary
    });

  } catch (error) {
    console.error('Search all error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Search failed'
    });
  }
});

// Individual source endpoints
router.post('/search/web', async (req, res) => {
  try {
    const { query, limit = 10 } = req.body;
    const results = await getWebResults(query, { limit });
    res.json({ success: true, data: results });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post('/search/images', async (req, res) => {
  try {
    const { query, limit = 20 } = req.body;
    const results = await getImageResults(query, { limit });
    res.json({ success: true, data: results });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post('/search/videos', async (req, res) => {
  try {
    const { query, limit = 10 } = req.body;
    const results = await getVideoResults(query, { limit });
    res.json({ success: true, data: results });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post('/search/news', async (req, res) => {
  try {
    const { query, limit = 10 } = req.body;
    const results = await getNewsResults(query, { limit });
    res.json({ success: true, data: results });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post('/search/books', async (req, res) => {
  try {
    const { query, limit = 10 } = req.body;
    const results = await getBookResults(query, { limit });
    res.json({ success: true, data: results });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;