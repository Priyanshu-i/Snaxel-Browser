// Main application logic
const API_BASE = '/api';

// State management
const state = {
    query: '',
    activeSources: ['web'],
    results: null,
    isLoading: false,
    searchStartTime: null
};

// DOM Elements
const searchInput = document.getElementById('searchInput');
const searchBtn = document.getElementById('searchBtn');
const filterBtns = document.querySelectorAll('.filter-btn');
const loadingIndicator = document.getElementById('loadingIndicator');
const resultsSection = document.getElementById('resultsSection');
const resultsContainer = document.getElementById('resultsContainer');
const emptyState = document.getElementById('emptyState');
const resultsCount = document.getElementById('resultsCount');
const searchTime = document.getElementById('searchTime');

// Initialize app
function init() {
    setupEventListeners();
    searchInput.focus();
}

// Setup event listeners
function setupEventListeners() {
    // Search button click
    searchBtn.addEventListener('click', handleSearch);

    // Enter key on search input
    searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') handleSearch();
    });

    // Filter buttons
    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => toggleFilter(btn));
    });
}

// Toggle filter
function toggleFilter(btn) {
    const source = btn.dataset.source;
    
    btn.classList.toggle('active');
    
    if (btn.classList.contains('active')) {
        if (!state.activeSources.includes(source)) {
            state.activeSources.push(source);
        }
    } else {
        state.activeSources = state.activeSources.filter(s => s !== source);
    }

    // Ensure at least one source is selected
    if (state.activeSources.length === 0) {
        btn.classList.add('active');
        state.activeSources = [source];
    }
}

// Handle search
async function handleSearch() {
    const query = searchInput.value.trim();
    
    if (!query) {
        utils.showNotification('Please enter a search query', 'error');
        searchInput.focus();
        return;
    }

    if (state.isLoading) return;

    state.query = query;
    state.isLoading = true;
    state.searchStartTime = Date.now();

    // Update UI
    showLoading();
    hideEmptyState();
    hideResults();

    try {
        const response = await fetch(`${API_BASE}/search`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                query: state.query,
                sources: state.activeSources,
                limit: 10
            })
        });

        if (!response.ok) {
            throw new Error('Search failed');
        }

        const data = await response.json();
        
        if (data.success) {
            state.results = data.data;
            displayResults(data.data);
        } else {
            throw new Error(data.error || 'Search failed');
        }

    } catch (error) {
        console.error('Search error:', error);
        utils.showNotification('Search failed. Please try again.', 'error');
        showEmptyState();
    } finally {
        state.isLoading = false;
        hideLoading();
    }
}

// Display results
function displayResults(data) {
    const searchDuration = Date.now() - state.searchStartTime;
    
    // Update header info
    resultsCount.textContent = `${data.totalResults || 0} results`;
    searchTime.textContent = utils.formatTime(searchDuration);

    // Clear container
    resultsContainer.innerHTML = '';

    // Display each source
    const sources = data.sources;
    
    if (sources.web && sources.web.results && sources.web.results.length > 0) {
        resultsContainer.appendChild(createWebSection(sources.web));
    }

    if (sources.images && sources.images.results && sources.images.results.length > 0) {
        resultsContainer.appendChild(createImageSection(sources.images));
    }

    if (sources.videos && sources.videos.results && sources.videos.results.length > 0) {
        resultsContainer.appendChild(createVideoSection(sources.videos));
    }

    if (sources.news && sources.news.results && sources.news.results.length > 0) {
        resultsContainer.appendChild(createNewsSection(sources.news));
    }

    if (sources.books && sources.books.results && sources.books.results.length > 0) {
        resultsContainer.appendChild(createBookSection(sources.books));
    }

    showResults();
    
    // Scroll to results
    setTimeout(() => {
        utils.scrollToElement(resultsSection, 100);
    }, 300);
}

// Create web results section
function createWebSection(data) {
    const section = document.createElement('div');
    section.className = 'source-section';
    
    section.innerHTML = `
        <div class="source-header">
            <div class="source-icon">${utils.getSourceIcon('web')}</div>
            <div>
                <h3 class="source-title">Web Results</h3>
                <span class="source-count">${data.results.length} results</span>
            </div>
        </div>
        <div class="web-grid" id="webGrid"></div>
    `;

    const grid = section.querySelector('#webGrid');
    
    data.results.forEach(result => {
        const card = document.createElement('a');
        card.href = result.url;
        card.target = '_blank';
        card.rel = 'noopener noreferrer';
        card.className = 'web-card';
        
        card.innerHTML = `
            <h4 class="web-card-title">${escapeHtml(result.title)}</h4>
            <div class="web-card-url">🔗 ${utils.extractDomain(result.url)}</div>
            <p class="web-card-snippet">${escapeHtml(result.snippet || '')}</p>
        `;
        
        grid.appendChild(card);
    });

    return section;
}

// Create image results section
function createImageSection(data) {
    const section = document.createElement('div');
    section.className = 'source-section';
    
    section.innerHTML = `
        <div class="source-header">
            <div class="source-icon">${utils.getSourceIcon('images')}</div>
            <div>
                <h3 class="source-title">Images</h3>
                <span class="source-count">${data.results.length} results</span>
            </div>
        </div>
        <div class="image-grid" id="imageGrid"></div>
    `;

    const grid = section.querySelector('#imageGrid');
    
    data.results.forEach(result => {
        const card = document.createElement('a');
        card.href = result.url;
        card.target = '_blank';
        card.rel = 'noopener noreferrer';
        card.className = 'image-card';
        
        card.innerHTML = `
            <div class="image-wrapper">
                <img src="${result.thumbnail || result.url}" 
                     alt="${escapeHtml(result.title)}"
                     onerror="this.src='data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 200 200%22%3E%3Crect fill=%22%23333%22 width=%22200%22 height=%22200%22/%3E%3Ctext x=%2250%25%22 y=%2250%25%22 fill=%22%23666%22 text-anchor=%22middle%22 dy=%22.3em%22 font-size=%2224%22%3EImage%3C/text%3E%3C/svg%3E'">
            </div>
            <div class="image-info">
                <div class="image-title">${escapeHtml(result.title)}</div>
                <div class="image-source">${utils.extractDomain(result.meta?.source || result.url)}</div>
            </div>
        `;
        
        grid.appendChild(card);
    });

    return section;
}

// Create video results section
function createVideoSection(data) {
    const section = document.createElement('div');
    section.className = 'source-section';
    
    section.innerHTML = `
        <div class="source-header">
            <div class="source-icon">${utils.getSourceIcon('videos')}</div>
            <div>
                <h3 class="source-title">Videos</h3>
                <span class="source-count">${data.results.length} results</span>
            </div>
        </div>
        <div class="video-grid" id="videoGrid"></div>
    `;

    const grid = section.querySelector('#videoGrid');
    
    data.results.forEach(result => {
        const card = document.createElement('a');
        card.href = result.url;
        card.target = '_blank';
        card.rel = 'noopener noreferrer';
        card.className = 'video-card';
        
        const thumbnail = result.thumbnail || `https://img.youtube.com/vi/${utils.getYouTubeVideoId(result.url)}/hqdefault.jpg`;
        
        card.innerHTML = `
            <div class="video-thumbnail">
                <img src="${thumbnail}" 
                     alt="${escapeHtml(result.title)}"
                     onerror="this.src='data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 320 180%22%3E%3Crect fill=%22%23333%22 width=%22320%22 height=%22180%22/%3E%3Ctext x=%2250%25%22 y=%2250%25%22 fill=%22%23666%22 text-anchor=%22middle%22 dy=%22.3em%22 font-size=%2224%22%3EVideo%3C/text%3E%3C/svg%3E'">
                <div class="play-icon">
                    <svg viewBox="0 0 24 24" fill="white">
                        <path d="M8 5v14l11-7z"/>
                    </svg>
                </div>
                ${result.meta?.duration ? `<div class="video-duration">${result.meta.duration}</div>` : ''}
            </div>
            <div class="video-info">
                <h4 class="video-title">${escapeHtml(result.title)}</h4>
                ${result.meta?.channel ? `<div class="video-channel">${escapeHtml(result.meta.channel)}</div>` : ''}
            </div>
        `;
        
        grid.appendChild(card);
    });

    return section;
}

// Create news results section
function createNewsSection(data) {
    const section = document.createElement('div');
    section.className = 'source-section';
    
    section.innerHTML = `
        <div class="source-header">
            <div class="source-icon">${utils.getSourceIcon('news')}</div>
            <div>
                <h3 class="source-title">News</h3>
                <span class="source-count">${data.results.length} articles</span>
            </div>
        </div>
        <div class="news-grid" id="newsGrid"></div>
    `;

    const grid = section.querySelector('#newsGrid');
    
    data.results.forEach(result => {
        const card = document.createElement('a');
        card.href = result.url;
        card.target = '_blank';
        card.rel = 'noopener noreferrer';
        card.className = 'news-card';
        
        card.innerHTML = `
            <div class="news-content">
                <span class="news-badge">Latest</span>
                <h4 class="news-title">${escapeHtml(result.title)}</h4>
                ${result.snippet ? `<p class="news-snippet">${escapeHtml(result.snippet)}</p>` : ''}
                <div class="news-meta">
                    <span>${utils.extractDomain(result.url)}</span>
                    ${result.meta?.date ? `<span>•</span><span>${utils.getRelativeTime(result.meta.date)}</span>` : ''}
                </div>
            </div>
        `;
        
        grid.appendChild(card);
    });

    return section;
}

// Create book results section
function createBookSection(data) {
    const section = document.createElement('div');
    section.className = 'source-section';
    
    section.innerHTML = `
        <div class="source-header">
            <div class="source-icon">${utils.getSourceIcon('books')}</div>
            <div>
                <h3 class="source-title">Books</h3>
                <span class="source-count">${data.results.length} results</span>
            </div>
        </div>
        <div class="book-grid" id="bookGrid"></div>
    `;

    const grid = section.querySelector('#bookGrid');
    
    data.results.forEach(result => {
        const card = document.createElement('a');
        card.href = result.url;
        card.target = '_blank';
        card.rel = 'noopener noreferrer';
        card.className = 'book-card';
        
        card.innerHTML = `
            <div class="book-cover">📚</div>
            <div class="book-details">
                <h4 class="book-title">${escapeHtml(result.title)}</h4>
                ${result.snippet ? `<div class="book-author">${escapeHtml(result.snippet)}</div>` : ''}
                ${result.meta?.rating ? `
                    <div class="book-rating">
                        <span>⭐</span>
                        <span>${result.meta.rating}</span>
                    </div>
                ` : ''}
            </div>
        `;
        
        grid.appendChild(card);
    });

    return section;
}

// UI State Management
function showLoading() {
    loadingIndicator.classList.remove('hidden');
    searchBtn.disabled = true;
    searchBtn.querySelector('.btn-text').textContent = 'Searching...';
}

function hideLoading() {
    loadingIndicator.classList.add('hidden');
    searchBtn.disabled = false;
    searchBtn.querySelector('.btn-text').textContent = 'Search';
}

function showResults() {
    resultsSection.classList.remove('hidden');
}

function hideResults() {
    resultsSection.classList.add('hidden');
}

function showEmptyState() {
    emptyState.classList.remove('hidden');
}

function hideEmptyState() {
    emptyState.classList.add('hidden');
}

// Escape HTML to prevent XSS
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Keyboard shortcuts
document.addEventListener('keydown', (e) => {
    // Focus search input on '/' key
    if (e.key === '/' && document.activeElement !== searchInput) {
        e.preventDefault();
        searchInput.focus();
    }
    
    // Clear search on 'Escape' key
    if (e.key === 'Escape' && document.activeElement === searchInput) {
        searchInput.value = '';
        searchInput.blur();
    }
});

// Add CSS animations for skeleton loaders
const style = document.createElement('style');
style.textContent = `
    .skeleton {
        opacity: 0.7;
        pointer-events: none;
    }
    
    .skeleton-line, .skeleton-box {
        background: linear-gradient(
            90deg,
            rgba(255, 255, 255, 0.05) 25%,
            rgba(255, 255, 255, 0.1) 50%,
            rgba(255, 255, 255, 0.05) 75%
        );
        background-size: 200% 100%;
        animation: shimmer 1.5s infinite;
        border-radius: 8px;
        margin-bottom: 8px;
    }
    
    @keyframes shimmer {
        0% { background-position: -200% 0; }
        100% { background-position: 200% 0; }
    }
    
    @keyframes slideIn {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOut {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);

// Initialize app when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}

// Export for debugging
window.app = {
    state,
    handleSearch,
    displayResults
};