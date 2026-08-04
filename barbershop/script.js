const menuToggle = document.getElementById('menu-toggle');
const navLinks = document.getElementById('nav-links');
const navItems = navLinks.querySelectorAll('a');

menuToggle.addEventListener('click', () => {
    navLinks.classList.toggle('open');

    if (navLinks.classList.contains('open')) {
        menuToggle.setAttribute('aria-expanded', 'true');
    } else {
        menuToggle.setAttribute('aria-expanded', 'false');
    }
});

navItems.forEach((link) => {
    link.addEventListener('click', () => {
        navLinks.classList.remove('open');
        menuToggle.setAttribute('aria-expanded', 'false');
    });
});
