const elements = document.querySelectorAll(".reveal");

const observer = new IntersectionObserver(
    function(entries) {
        entries.forEach(function(entry) {
            if (entry.isIntersecting) {
                entry.target.classList.add("show");
                observer.unobserve(entry.target);
            }
        });
    },
    {
        threshold: 0.15
    }
);

elements.forEach(function(el) {
    observer.observe(el);
});

const contactForm = document.querySelector("#contact-form");
const formMessage = document.querySelector("#form-message");

// Front-end demo. There is no server behind this form, so it checks the
// fields and answers on the page rather than pretending to send anything.
if (contactForm && formMessage) {
    contactForm.addEventListener("submit", function(event) {
        event.preventDefault();

        const name = document.querySelector("#name");
        const email = document.querySelector("#email");
        const emailLooksValid = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email.value.trim());

        if (name.value.trim() === "") {
            formMessage.textContent = "Add your name and we will know who to look out for.";
            name.focus();
            return;
        }

        if (!emailLooksValid) {
            formMessage.textContent = "That email does not look right.";
            email.focus();
            return;
        }

        formMessage.textContent = "Thanks. We will reply with the class to start with.";
        contactForm.reset();
    });
}

const carouselImages = document.querySelectorAll(".carousel-image");
const carouselCaption = document.querySelector("#carousel-caption");
const prevSlide = document.querySelector("#prev-slide");
const nextSlide = document.querySelector("#next-slide");
const carouselCaptions = [
    "Students drilling positions and movement across the mat.",
    "Ground movement practice helps students learn balance and control.",
    "Hip movement is important for escaping and creating space.",
    "Close control teaches pressure, patience, and safe partner training.",
    "Students reset between drills so they can repeat the technique correctly.",
    "Standing grip control helps set up takedowns and better positioning.",
    "Guard movement teaches defense, angles, and how to recover position.",
    "Top pressure helps a student control space without rushing.",
    "Live drilling combines guard work, control, and calm decision making."
];

let currentSlide = 0;

function showSlide(index) {
    if (carouselImages.length === 0) {
        return;
    }

    carouselImages[currentSlide].classList.remove("active");
    currentSlide = (index + carouselImages.length) % carouselImages.length;
    carouselImages[currentSlide].classList.add("active");

    if (carouselCaption) {
        carouselCaption.textContent = carouselCaptions[currentSlide] || "BJJ training photo.";
    }
}

if (prevSlide && nextSlide) {
    prevSlide.addEventListener("click", function() {
        showSlide(currentSlide - 1);
    });

    nextSlide.addEventListener("click", function() {
        showSlide(currentSlide + 1);
    });
}
