// Credits:

// MEEE :)
// BanyanLLC (OcrMAGIC and formatTime)
// ChatGPT (Cleaned up code, helped with a few things)

// ---------------------------------------- \\
//            CODE STARTS HERE              \\
// ---------------------------------------- \\

// Utility functions for DOM manipulation
const $ = (e) => document.querySelector(e);
const $$ = (e) => document.querySelectorAll(e);

// Helpful functions
const parseValue = (input) => parseFloat(input.value.replace(/,/g, ''));
const parseNumber = (value) => value.toString().replace(/,/g, '');
const print = (string) => console.log(string);
const commas = (number) => parseFloat(number).toLocaleString();

// DOM elements
const calcButton = $(".calculate");
const dateInputs = $$("input[date]");
const timeInputs = $$("input[time]");
const [firstFI, secondFI] = [$(".firstFI"), $(".secondFI")];
const [firstMoney, secondMoney] = [$(".first"), $(".second")];
const fis = [firstFI, secondFI], moneyInputs = [firstMoney, secondMoney];
const perMin = $(".perMin"), perHour = $(".perHour"), perDay = $(".perDay");
const timeElapsed = $(".hours")
const results = $(".results"), labelInput = $(".label > input");
const historyDisplay = $(".history");
const clearHistory = $(".clearHistory");
const copyDate = $(".copyDate");
const double = $(".double");

// Variables for calculations
let doubleMode = false;

// Event listener for the calculate button
calcButton.addEventListener("click", calculate);

// Event listener for double mode calculations
double.addEventListener("click", () => {
    doubleMode = !doubleMode;
    double.style.backgroundColor = doubleMode ? "#00FF00" : "red";
});

// Event listeners for formatting time inputs
timeInputs.forEach((el) => {
    el.addEventListener("input", formatTimeInput);
});

// Event listeners for formatting money inputs
[moneyInputs].forEach((el) => {
    el.forEach((moneyInput) => {
        moneyInput.addEventListener("blur", formatMoneyInput);
        moneyInput.addEventListener("focus", removeFormatting);
    });
});

// Event listener for clearing history
clearHistory.addEventListener("click", clearLocalStorage);

// Load and display history if available
let savedHistory = JSON.parse(localStorage.getItem("historyV3")) || [];
updateHistory(savedHistory);

// Function to calculate
function calculate() {
    const moneys = [parseValue(firstMoney), parseValue(secondMoney)];
    const times = [
        new Date(dateInputs[0].value + " " + timeInputs[0].value),
        new Date(dateInputs[1].value + " " + timeInputs[1].value),
    ];
    const time = (times[1] - times[0]) / 60000;
    const moneyResult = (moneys[1] - moneys[0]) / time;

    perMin.innerText = "Per Minute: " + parseFloat(moneyResult.toFixed(0)).toLocaleString();
    perHour.innerText = "Per Hour: " + parseFloat((moneyResult * 60).toFixed(0)).toLocaleString();
    perDay.innerText = "Per Day: " + parseFloat((moneyResult * 1440).toFixed(0)).toLocaleString();
    results.style.opacity = "1";

    const elapsedTime = formatTime((times[1] - times[0]) / 1000);
    timeElapsed.innerText = `Time Elapsed: ${elapsedTime}`;

    addHistory(labelInput.value, Math.floor(moneyResult), time * 60);

    if (doubleMode) {
        fixed.innerText = "Without 2X: " + parseFloat(Math.floor(moneyResult / 2)).toLocaleString();
    }
}

// Function to format time inputs
function formatTimeInput() {
    if (this.value.length === 2 || this.value.length === 5) {
        this.value = this.value + ":";
    }
}

// Function to format money inputs on blur
function formatMoneyInput() {
    if (this.value) {
        this.value = parseFloat(this.value).toLocaleString();
    }
}

// Function to format time
function formatTime(secs) {
    const d = Math.floor(secs / (3600 * 24)).toString().padStart(2, "0"),
        h = Math.floor((secs % (3600 * 24)) / 3600).toString().padStart(2, "0"),
        m = Math.floor((secs % 3600) / 60).toString().padStart(2, "0"),
        s = Math.floor(secs % 60).toString().padStart(2, "0");
    return `${d}:${h}:${m}:${s}`;
}

// Function to remove formatting on focus
function removeFormatting() {
    if (this.value) {
        this.value = this.value.replace(/,/g, '');
    }
}

// Function to clear localStorage and reload the page
function clearLocalStorage() {
    localStorage.clear();
    savedHistory = [];
    updateHistory(savedHistory);
}

// Function to update history
function updateHistory(history) {
    historyDisplay.innerHTML = "";
    history.forEach((entry) => {
        if(!entry.result) return false;
        const entryElement = document.createElement("div");
        entryElement.innerHTML = `<h2 class="pointer">${entry.label}:</h2><h2 class="pointer">${entry.result}</h2>`;
        historyDisplay.appendChild(entryElement);
        entryElement.addEventListener("click", () => {
            const money = parseNumber(entry.result);
            const time = formatTime(entry.time);
            results.style.opacity = "1";
            perMin.innerText = "Per Minute: " + parseFloat(money).toLocaleString(), perHour.innerText = "Per Hour: " + parseFloat(money * 60).toLocaleString(), perDay.innerText = "Per Day: " + parseFloat(money * 1440).toLocaleString(), timeElapsed.innerText = "Time Elapsed: " + time;
        });
        // Remove functionality
        entryElement.addEventListener("contextmenu", (e) => {
            e.preventDefault();
            const decision = confirm("Do you really want to delete this history entry?");
            if(decision) {
                entry.label = "", entry.result = "", entry.time = ""; localStorage.setItem("historyV3", JSON.stringify(savedHistory)); location.reload();
            }
        })
    });
}

// Function to add history
function addHistory(label, money, time) {
    if (doubleMode) {
        money = money / 2;
    }
    const resultEntry = {
        label: label || "[Blank]",
        result: parseFloat(money).toLocaleString(),
        time: time,
    };
    savedHistory.push(resultEntry);
    localStorage.setItem("historyV3", JSON.stringify(savedHistory));
    updateHistory(savedHistory);
}

// Function to copy date
copyDate.addEventListener("click", () => {
    dateInputs[1].value === "" ? (dateInputs[1].value = dateInputs[0].value) : (dateInputs[0].value = dateInputs[1].value);
});

// Function to insert files
fis.forEach((el, i) => el.addEventListener("change", () => {
    const fileName = el.files[0].name;
    if (fileName && fileName.toLowerCase().includes("robloxscreenshot")) {
        let date = fileName.slice(16); date = date.slice(0, 4) + "-" + date.slice(4, 6) + "-" + date.slice(6);
        let time = date.slice(11); time = time.slice(0, 2) + ":" + time.slice(2, 4) + ":" + time.slice(4, 6);
        dateInputs[i].value = date.slice(0, 10);
        timeInputs[i].value = time;
    } else {
        dateInputs[0].value = dateInputs[1].value;
    }
}))