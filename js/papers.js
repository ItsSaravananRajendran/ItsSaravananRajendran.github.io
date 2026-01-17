document.addEventListener('DOMContentLoaded', () => {
    fetch('papers.json')
        .then(response => response.json())
        .then(papers => {
            // Sort papers by year descending (just in case)
            papers.sort((a, b) => b.year - a.year);

            renderRecentPapers(papers);
            renderPapershelf(papers);
        })
        .catch(error => console.error('Error loading papers:', error));
});

function renderRecentPapers(papers) {
    const listContainer = document.getElementById('recent-papers-list');
    if (!listContainer) return;

    // Show top 5 on home page, or whatever logical limit suitable.
    // The user didn't specify a limit but the previous placeholder had 3.
    // Let's show up to 3 for now to keep layout similar, or maybe 5.
    // Let's stick to the top few to avoid cluttering home page.
    const recentPapers = papers.slice(0, 5);

    listContainer.innerHTML = recentPapers.map(paper => `
        <li>
            <span class="item-date">${paper.year}</span>
            <a href="${paper.url}" class="item-title">${paper.title}</a>
        </li>
    `).join('');
}

function renderPapershelf(papers) {
    const shelfContainer = document.getElementById('papershelf-list');
    if (!shelfContainer) return;

    shelfContainer.innerHTML = papers.map(paper => `
        <div class="paper-item">
            <div class="paper-year">${paper.year}</div>
            <div class="paper-details">
                <h3><a href="${paper.url}">${paper.title}</a></h3>
                <div class="paper-meta">${paper.meta}</div>
            </div>
        </div>
    `).join('');
}
