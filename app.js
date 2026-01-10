const display = document.getElementById('display');

document.querySelector('.buttons').addEventListener('click', (e) => {
  if (!e.target.classList.contains('btn')) return;

  const btn = e.target;
  const val = btn.textContent;

  if (btn.classList.contains('clear')) {
    display.value = '';
  } else if (btn.classList.contains('equals')) {
    calculate();
  } else {
    display.value += val;
  }
});

display.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') {
    e.preventDefault();
    calculate();
  }
});

function calculate() {
  try {
    const expr = display.value.replace(/[^0-9+\-*/.() ]/g, '');
    if (expr) {
      display.value = Function('"use strict"; return (' + expr + ')')();
    }
  } catch {
    display.value = 'Error';
  }
}

if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('service-worker.js');
}
