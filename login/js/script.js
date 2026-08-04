const STORAGE_KEY = "demoUser";
const LOGIN_KEY = "isLoggedIn";
const REMEMBER_KEY = "rememberedEmail";
const ATTEMPTS_KEY = "loginAttempts";

function setMessage(element, text, color) {
    if (!element) {
        return;
    }

    element.textContent = text;
    element.style.color = color;
}

function getSavedUser() {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : null;
}

function getPasswordScore(password) {
    let score = 0;

    if (password.length >= 6) {
        score++;
    }

    if (/\d/.test(password)) {
        score++;
    }

    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) {
        score++;
    }

    return score;
}

function updateRule(rule, isValid) {
    if (rule) {
        rule.classList.toggle("valid", isValid);
    }
}

document.querySelectorAll(".toggle-password").forEach(function(button) {
    button.addEventListener("click", function() {
        const target = document.getElementById(button.dataset.target);

        if (!target) {
            return;
        }

        const isPassword = target.type === "password";
        target.type = isPassword ? "text" : "password";
        button.textContent = isPassword ? "Hide" : "Show";
    });
});

const registerForm = document.querySelector("#registerForm");
const registerPassword = document.querySelector("#registerPassword");

if (registerPassword) {
    registerPassword.addEventListener("input", function() {
        const password = registerPassword.value;
        const score = getPasswordScore(password);
        const strengthFill = document.querySelector("#strengthFill");
        const strengthText = document.querySelector("#strengthText");

        updateRule(document.querySelector("#lengthRule"), password.length >= 6);
        updateRule(document.querySelector("#numberRule"), /\d/.test(password));
        updateRule(document.querySelector("#caseRule"), /[a-z]/.test(password) && /[A-Z]/.test(password));

        if (strengthFill) {
            strengthFill.style.width = `${score * 33.33}%`;
            strengthFill.style.backgroundColor = score === 1 ? "#ef4444" : score === 2 ? "#f59e0b" : "#16a34a";
        }

        if (strengthText) {
            const labels = ["Password strength: -", "Password strength: Weak", "Password strength: Medium", "Password strength: Strong"];
            strengthText.textContent = labels[score];
        }
    });
}

if (registerForm) {
    registerForm.addEventListener("submit", function(event) {
        event.preventDefault();

        const name = document.querySelector("#registerName").value.trim();
        const email = document.querySelector("#registerEmail").value.trim().toLowerCase();
        const password = document.querySelector("#registerPassword").value.trim();
        const confirmPassword = document.querySelector("#confirmPassword").value.trim();
        const message = document.querySelector("#registerMessage");

        if (!name || !email || !password || !confirmPassword) {
            setMessage(message, "Please fill in all fields.", "crimson");
            return;
        }

        if (getPasswordScore(password) < 3) {
            setMessage(message, "Password needs 6 characters, a number, and upper/lowercase letters.", "crimson");
            return;
        }

        if (password !== confirmPassword) {
            setMessage(message, "Passwords do not match.", "crimson");
            return;
        }

        const user = {
            name: name,
            email: email,
            password: password
        };

        localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
        setMessage(message, "Account created successfully. Redirecting to login...", "green");

        setTimeout(function() {
            window.location.href = "index.html";
        }, 1200);
    });
}

const loginForm = document.querySelector("#loginForm");
const emailInput = document.querySelector("#email");
const rememberEmail = document.querySelector("#rememberEmail");

if (emailInput && rememberEmail) {
    const rememberedEmail = localStorage.getItem(REMEMBER_KEY);

    if (rememberedEmail) {
        emailInput.value = rememberedEmail;
        rememberEmail.checked = true;
    }
}

if (loginForm) {
    loginForm.addEventListener("submit", function(event) {
        event.preventDefault();

        const email = document.querySelector("#email").value.trim().toLowerCase();
        const password = document.querySelector("#password").value.trim();
        const message = document.querySelector("#message");
        const savedUser = getSavedUser();
        const attempts = Number(localStorage.getItem(ATTEMPTS_KEY)) || 0;

        if (!email || !password) {
            setMessage(message, "Please fill in all fields.", "crimson");
            return;
        }

        if (!savedUser) {
            setMessage(message, "No account found yet. Please register first.", "crimson");
            return;
        }

        if (email === savedUser.email && password === savedUser.password) {
            localStorage.setItem(LOGIN_KEY, "true");
            localStorage.setItem("lastLogin", new Date().toLocaleString());
            localStorage.removeItem(ATTEMPTS_KEY);

            if (rememberEmail && rememberEmail.checked) {
                localStorage.setItem(REMEMBER_KEY, email);
            } else {
                localStorage.removeItem(REMEMBER_KEY);
            }

            window.location.href = "dashboard.html";
            return;
        }

        const newAttempts = attempts + 1;
        localStorage.setItem(ATTEMPTS_KEY, String(newAttempts));
        setMessage(message, `Incorrect email or password. Attempts: ${newAttempts}`, "crimson");
    });
}

if (window.location.pathname.includes("dashboard.html")) {
    const isLoggedIn = localStorage.getItem(LOGIN_KEY);
    const savedUser = getSavedUser();

    if (isLoggedIn !== "true" || !savedUser) {
        window.location.href = "index.html";
    } else {
        const welcomeTitle = document.querySelector("#welcomeTitle");
        const profileName = document.querySelector("#profileName");
        const profileEmail = document.querySelector("#profileEmail");
        const lastLogin = document.querySelector("#lastLogin");

        if (welcomeTitle) {
            welcomeTitle.textContent = "Welcome, " + savedUser.name;
        }

        if (profileName) {
            profileName.textContent = savedUser.name;
        }

        if (profileEmail) {
            profileEmail.textContent = savedUser.email;
        }

        if (lastLogin) {
            lastLogin.textContent = localStorage.getItem("lastLogin") || "First session";
        }
    }
}

const logoutBtn = document.querySelector("#logoutBtn");

if (logoutBtn) {
    logoutBtn.addEventListener("click", function() {
        localStorage.removeItem(LOGIN_KEY);
        window.location.href = "index.html";
    });
}

const clearAccountBtn = document.querySelector("#clearAccountBtn");

if (clearAccountBtn) {
    clearAccountBtn.addEventListener("click", function() {
        const confirmed = confirm("Delete this local account from your browser?");

        if (confirmed) {
            localStorage.removeItem(STORAGE_KEY);
            localStorage.removeItem(LOGIN_KEY);
            localStorage.removeItem(REMEMBER_KEY);
            localStorage.removeItem(ATTEMPTS_KEY);
            localStorage.removeItem("lastLogin");
            window.location.href = "register.html";
        }
    });
}
