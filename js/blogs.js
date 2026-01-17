document.addEventListener('DOMContentLoaded', () => {
    fetchMediumBlogs();
});

async function fetchMediumBlogs() {
    const blogContainer = document.getElementById('blog-container');
    const recentPostsContainer = document.getElementById('recent-posts-list');

    // Only fetch if at least one container exists
    if (!blogContainer && !recentPostsContainer) return;

    const mediumUsername = 'saravananrajendran';
    const rssUrl = `https://medium.com/feed/@${mediumUsername}`;
    const apiUrl = `https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(rssUrl)}`;

    try {
        const response = await fetch(apiUrl);
        const data = await response.json();

        if (data.status === 'ok') {
            if (blogContainer) {
                renderBlogs(data.items, blogContainer);
            }
            if (recentPostsContainer) {
                renderRecentPosts(data.items, recentPostsContainer);
            }
        } else {
            handleError(blogContainer, recentPostsContainer, 'Failed to load blogs. Please try again later.');
            console.error('Error fetching blogs:', data);
        }
    } catch (error) {
        handleError(blogContainer, recentPostsContainer, 'Failed to load blogs. Please check your connection.');
        console.error('Network error:', error);
    }
}

function handleError(blogContainer, recentPostsContainer, message) {
    if (blogContainer) blogContainer.innerHTML = `<p>${message}</p>`;
    if (recentPostsContainer) recentPostsContainer.innerHTML = `<li>${message}</li>`;
}

function renderBlogs(items, container) {
    container.innerHTML = ''; // Clear loading message

    items.forEach(item => {
        const { formattedDate, categories } = processBlogItem(item);

        const paperItem = document.createElement('div');
        paperItem.className = 'paper-item';

        paperItem.innerHTML = `
            <div class="paper-year">${formattedDate}</div>
            <div class="paper-details">
                <h3><a href="${item.link}" target="_blank" rel="noopener noreferrer">${item.title}</a></h3>
                <div class="paper-meta">${categories}</div>
            </div>
        `;

        container.appendChild(paperItem);
    });
}

function renderRecentPosts(items, container) {
    container.innerHTML = ''; // Clear items

    // Take only the first 4 items
    const recentItems = items.slice(0, 4);

    recentItems.forEach(item => {
        const { formattedDate } = processBlogItem(item);

        const listItem = document.createElement('li');

        listItem.innerHTML = `
            <span class="item-date">${formattedDate}</span>
            <a href="${item.link}" target="_blank" rel="noopener noreferrer" class="item-title">${item.title}</a>
        `;

        container.appendChild(listItem);
    });
}

function processBlogItem(item) {
    const dateObj = new Date(item.pubDate);
    const month = dateObj.toLocaleString('default', { month: 'short' });
    const year = dateObj.getFullYear();
    const formattedDate = `${month} ${year}`;

    const categories = item.categories.length > 0
        ? item.categories.slice(0, 3).map(cat => capitalizeFirstLetter(cat)).join(' • ')
        : 'Blog';

    return { formattedDate, categories };
}

function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}
