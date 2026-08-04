const screen = document.querySelector("#screen");
const history = document.querySelector("#history");
const buttons = document.querySelectorAll(".btn");
const divideSymbol = "÷";
const multiplySymbol = "×";
const operators = ["+", "-", multiplySymbol, divideSymbol];

function setScreen(value) {
    screen.textContent = String(value).slice(0, 18);
}

function clearCalculator() {
    setScreen("0");
    history.textContent = "";
}

function getCurrentNumber() {
    let currentNumber = "";

    for (let i = screen.textContent.length - 1; i >= 0; i--) {
        const char = screen.textContent[i];

        if (operators.includes(char)) {
            break;
        }

        currentNumber = char + currentNumber;
    }

    return currentNumber;
}

function isLastCharacterOperator() {
    const lastChar = screen.textContent[screen.textContent.length - 1];
    return operators.includes(lastChar);
}

function normalizeExpression(expression) {
    return expression
        .split(multiplySymbol).join("*")
        .split(divideSymbol).join("/");
}

function formatResult(result) {
    if (!Number.isFinite(result)) {
        return "Error";
    }

    const rounded = Number.parseFloat(result.toFixed(10));
    return String(rounded);
}

function calculate() {
    if (screen.textContent === "Error" || isLastCharacterOperator()) {
        setScreen("Error");
        return;
    }

    const expression = normalizeExpression(screen.textContent);

    if (!/^[\d+\-*/. ]+$/.test(expression)) {
        setScreen("Error");
        return;
    }

    try {
        const result = Function(`"use strict"; return (${expression})`)();
        const formattedResult = formatResult(result);

        history.textContent = `${screen.textContent} =`;
        setScreen(formattedResult);
    } catch {
        setScreen("Error");
    }
}

function handleInput(value) {
    if (value === "AC") {
        clearCalculator();
        return;
    }

    if (value === "backspace") {
        history.textContent = "";

        if (screen.textContent === "Error" || screen.textContent.length === 1) {
            setScreen("0");
        } else {
            setScreen(screen.textContent.slice(0, -1));
        }

        return;
    }

    if (value === "=") {
        calculate();
        return;
    }

    if (screen.textContent === "Error") {
        setScreen("0");
    }

    const isOperator = operators.includes(value);
    const lastIsOperator = isLastCharacterOperator();

    if (isOperator) {
        history.textContent = "";

        if (screen.textContent === "0" && value !== "-") {
            return;
        }

        if (lastIsOperator) {
            setScreen(screen.textContent.slice(0, -1) + value);
        } else {
            setScreen(screen.textContent + value);
        }

        return;
    }

    if (value === ".") {
        const currentNumber = getCurrentNumber();

        if (currentNumber.includes(".")) {
            return;
        }

        history.textContent = "";

        if (lastIsOperator) {
            setScreen(screen.textContent + "0.");
        } else {
            setScreen(screen.textContent + ".");
        }

        return;
    }

    history.textContent = "";

    if (screen.textContent === "0") {
        setScreen(value);
    } else {
        setScreen(screen.textContent + value);
    }
}

buttons.forEach((button) => {
    button.addEventListener("click", () => {
        if (button.id === "c") {
            handleInput("AC");
            return;
        }

        if (button.id === "backspace") {
            handleInput("backspace");
            return;
        }

        if (button.id === "equals") {
            handleInput("=");
            return;
        }

        handleInput(button.textContent.trim());
    });
});

document.addEventListener("keydown", (event) => {
    const key = event.key;

    if (key >= "0" && key <= "9") {
        handleInput(key);
    }

    if (key === "+") {
        handleInput("+");
    }

    if (key === "-") {
        handleInput("-");
    }

    if (key === "*") {
        handleInput(multiplySymbol);
    }

    if (key === "/") {
        event.preventDefault();
        handleInput(divideSymbol);
    }

    if (key === ".") {
        handleInput(".");
    }

    if (key === "Enter" || key === "=") {
        event.preventDefault();
        handleInput("=");
    }

    if (key === "Backspace") {
        handleInput("backspace");
    }

    if (key === "Escape") {
        handleInput("AC");
    }
});
