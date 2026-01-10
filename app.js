const display = document.getElementById("display");
const historyEl = document.getElementById("history");
const historyToggle = document.getElementById("history-toggle");
const historyRow = document.querySelector(".history-row");
let history = [];
let justCalculated = false;

document.querySelector(".buttons").addEventListener("click", (e) => {
  if (!e.target.classList.contains("btn")) return;

  const btn = e.target;
  const val = btn.textContent;

  if (btn.classList.contains("clear")) {
    display.value = "";
    justCalculated = false;
  } else if (btn.classList.contains("equals")) {
    calculate();
  } else {
    if (justCalculated && btn.classList.contains("num")) {
      display.value = val;
    } else {
      display.value += val;
    }
    justCalculated = false;
  }
});

display.addEventListener("keydown", (e) => {
  if (e.key === "Enter") {
    e.preventDefault();
    calculate();
  }
});

historyEl.addEventListener("click", (e) => {
  const item = e.target.closest(".history-item");
  if (item) {
    display.value = item.dataset.expr;
    toggleHistory(false);
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
  const expr = display.value.replace(/[^0-9+\-*/.() ]/g, "");
  if (!expr) return;

  try {
    const result = Function('"use strict"; return (' + expr + ")")();
    if (result == expr) return;

    const item = { expr, result };
    if (history.includes(item)) return;

    history.push(item);
    if (history.length > 10) history.shift();
    display.value = result;
    justCalculated = true;
    renderHistory();
  } catch {
    display.value = "Error";
  }
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
