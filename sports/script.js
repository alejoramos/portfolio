// Front-end demo. There is no server behind this form, so it checks the
// fields and answers on the page rather than pretending to send anything.
const contactForm = document.getElementById("contact-form");
const formMessage = document.getElementById("form-message");

if (contactForm && formMessage) {
    contactForm.addEventListener("submit", function (event) {
        event.preventDefault();

        const name = document.getElementById("name");
        const email = document.getElementById("email");
        const emailLooksValid = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email.value.trim());

        if (name.value.trim() === "") {
            formMessage.textContent = "Add your name so we know who to expect.";
            name.focus();
            return;
        }

        if (!emailLooksValid) {
            formMessage.textContent = "That email does not look right.";
            email.focus();
            return;
        }

        formMessage.textContent = "Thanks. We will reply with the session to start with.";
        contactForm.reset();
    });
}
