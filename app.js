const display = document.getElementById("display");
const historyEl = document.getElementById("history");
const historyToggle = document.getElementById("history-toggle");
const historyRow = document.querySelector(".history-row");

let expression = "";
let cursorPos = 0;
let history = JSON.parse(localStorage.getItem("calcHistory") || "[]");
let justCalculated = false;

renderHistory();
renderDisplay();

document.querySelector(".buttons").addEventListener("click", (e) => {
  const btn = e.target.closest(".btn");
  if (!btn) return;
  const val = btn.textContent;

  if (btn.classList.contains("clear")) {
    expression = "";
    cursorPos = 0;
    justCalculated = false;
  } else if (btn.classList.contains("equals")) {
    calculate();
  } else if (btn.classList.contains("backspace")) {
    if (cursorPos > 0) {
      expression = expression.slice(0, cursorPos - 1) + expression.slice(cursorPos);
      cursorPos--;
    }
    justCalculated = false;
  } else {
    if (justCalculated && btn.classList.contains("num")) {
      expression = val;
      cursorPos = expression.length;
    } else {
      expression =
        expression.slice(0, cursorPos) + val + expression.slice(cursorPos);
      cursorPos++;
    }
    justCalculated = false;
  }
  renderDisplay();
});

display.addEventListener("click", (e) => {
  const chars = display.querySelectorAll(".char");
  if (chars.length === 0) {
    cursorPos = 0;
    renderDisplay();
    return;
  }

  const clickX = e.clientX;
  let newPos = expression.length;

  for (let i = 0; i < chars.length; i++) {
    const rect = chars[i].getBoundingClientRect();
    const charMid = rect.left + rect.width / 2;
    if (clickX < charMid) {
      newPos = i;
      break;
    }
  }

  cursorPos = newPos;
  justCalculated = false;
  renderDisplay();
});

historyEl.addEventListener("click", (e) => {
  const item = e.target.closest(".history-item");
  if (item) {
    expression = item.dataset.expr;
    cursorPos = expression.length;
    justCalculated = false;
    toggleHistory(false);
    renderDisplay();
  }
});

historyToggle.addEventListener("click", () => {
  toggleHistory(!historyEl.classList.contains("expanded"));
});

function toggleHistory(expanded) {
  historyEl.classList.toggle("expanded", expanded);
  historyToggle.classList.toggle("expanded", expanded);
}

function calculate() {
  const expr = expression.replace(/[^0-9+\-*/.() ]/g, "");
  if (!expr) return;

  try {
    const result = Function('"use strict"; return (' + expr + ")")();
    if (result == expr) return;

    const item = { expr, result };
    history.push(item);
    if (history.length > 10) history.shift();
    expression = String(result);
    cursorPos = expression.length;
    justCalculated = true;
    localStorage.setItem("calcHistory", JSON.stringify(history));
    renderHistory();
    renderDisplay();
  } catch {
    expression = "Error";
    cursorPos = expression.length;
    renderDisplay();
  }
}

function renderDisplay() {
  let html = '<span class="display-text">';
  for (let i = 0; i < expression.length; i++) {
    html += `<span class="char">${expression[i]}</span>`;
  }
  html += '</span><span class="cursor"></span>';
  display.innerHTML = html;

  requestAnimationFrame(() => {
    const cursor = display.querySelector(".cursor");
    const chars = display.querySelectorAll(".char");
    const displayRect = display.getBoundingClientRect();

    let cursorX;
    if (chars.length === 0) {
      cursorX = displayRect.right - displayRect.left - 10;
    } else if (cursorPos >= chars.length) {
      const lastChar = chars[chars.length - 1];
      cursorX = lastChar.offsetLeft + lastChar.offsetWidth;
    } else {
      cursorX = chars[cursorPos].offsetLeft;
    }

    cursor.style.left = cursorX + "px";
    const textEl = display.querySelector(".display-text");
    const textRect = textEl.getBoundingClientRect();
    const displayRect2 = display.getBoundingClientRect();
    cursor.style.top = (textRect.top - displayRect2.top + textRect.height * 0.15) + "px";
    cursor.style.height = (textRect.height * 0.7) + "px";
  });
}

function renderHistory() {
  historyEl.innerHTML = history
    .slice()
    .reverse()
    .map(
      (h) =>
        `<div class="history-item" data-expr="${h.expr}">${h.expr}=${h.result}</div>`,
    )
    .join("");
  const empty = history.length === 0;
  historyToggle.hidden = empty;
  historyRow.classList.toggle("hidden", empty);
}

if ("serviceWorker" in navigator) {
  navigator.serviceWorker.register("service-worker.js");
}
