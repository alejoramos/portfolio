const contactForm = document.getElementById("contact-form");
const formMessage = document.getElementById("form-message");

if (contactForm && formMessage) {
    contactForm.addEventListener("submit", function(event) {
        event.preventDefault();
        formMessage.textContent = "Thanks. We will contact you soon.";
        contactForm.reset();
    });
}
