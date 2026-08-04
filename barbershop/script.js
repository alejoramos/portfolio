const menuToggle = document.getElementById('menu-toggle');
const navLinks = document.getElementById('nav-links');
const navItems = navLinks.querySelectorAll('a');

menuToggle.addEventListener('click', () => {
    const isOpen = navLinks.classList.toggle('open');
    menuToggle.setAttribute('aria-expanded', String(isOpen));
    menuToggle.setAttribute('aria-label', isOpen ? 'Close menu' : 'Open menu');
});

navItems.forEach((link) => {
    link.addEventListener('click', () => {
        navLinks.classList.remove('open');
        menuToggle.setAttribute('aria-expanded', 'false');
        menuToggle.setAttribute('aria-label', 'Open menu');
    });
});

// The booking form is a front-end demo. There is no server behind it, so it
// checks the fields and confirms on the page instead of pretending to send.
const bookingForm = document.getElementById('booking-form');
const formMessage = document.getElementById('form-message');

if (bookingForm && formMessage) {
    bookingForm.addEventListener('submit', (event) => {
        event.preventDefault();

        const name = document.getElementById('name');
        const email = document.getElementById('email');
        const emailLooksValid = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email.value.trim());

        if (name.value.trim() === '') {
            formMessage.textContent = 'Add your name so we know who is coming in.';
            name.focus();
            return;
        }

        if (!emailLooksValid) {
            formMessage.textContent = 'That email does not look right.';
            email.focus();
            return;
        }

        formMessage.textContent = `Thanks ${name.value.trim()}. We will get back to you to confirm a time.`;
        bookingForm.reset();
    });
}
