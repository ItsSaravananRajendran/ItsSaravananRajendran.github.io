document.addEventListener('DOMContentLoaded', () => {
    const themeToggleBtn = document.getElementById('theme-toggle-btn');
    const prefersDarkScheme = window.matchMedia('(prefers-color-scheme: dark)');

    // Check for saved user preference, if any, on load of the website
    const currentTheme = localStorage.getItem('theme');

    if (currentTheme == 'dark') {
        document.body.setAttribute('data-theme', 'dark');
    } else if (currentTheme == 'light') {
        document.body.setAttribute('data-theme', 'light');
    } else if (prefersDarkScheme.matches) {
        // If no preference is saved, use system preference
        document.body.setAttribute('data-theme', 'dark');
    }

    if (themeToggleBtn) {
        themeToggleBtn.addEventListener('click', (e) => {
            e.preventDefault();
            let theme = 'light';
            if (document.body.getAttribute('data-theme') !== 'dark') {
                document.body.setAttribute('data-theme', 'dark');
                theme = 'dark';
            } else {
                document.body.setAttribute('data-theme', 'light');
                theme = 'light';
            }
            localStorage.setItem('theme', theme);
        });
    }

    // Hamburger Menu Logic
    const hamburgerBtn = document.getElementById('hamburger-menu');
    const navList = document.querySelector('nav ul');

    if (hamburgerBtn && navList) {
        hamburgerBtn.addEventListener('click', () => {
            navList.classList.toggle('show');
        });
    }
});
