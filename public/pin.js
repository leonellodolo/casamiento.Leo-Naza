(function () {
  const PIN = '8264';
  const overlay = document.getElementById('pin-overlay');
  const content = document.getElementById('admin-content');
  const digits = Array.from(document.querySelectorAll('.pin-digit'));
  const errorMsg = document.getElementById('pin-error');

  function checkPin() {
    const entered = digits.map((d) => d.value).join('');
    if (entered.length < 4) return;

    if (entered === PIN) {
      overlay.style.opacity = '0';
      overlay.style.transition = 'opacity 0.4s ease';
      setTimeout(() => {
        overlay.remove();
        content.removeAttribute('hidden');
      }, 400);
    } else {
      errorMsg.hidden = false;
      digits.forEach((d) => {
        d.value = '';
        d.classList.add('pin-digit--error');
      });
      setTimeout(() => {
        digits.forEach((d) => d.classList.remove('pin-digit--error'));
        digits[0].focus();
      }, 700);
    }
  }

  digits.forEach((input, i) => {
    input.addEventListener('input', () => {
      // Permitir solo dígitos
      input.value = input.value.replace(/\D/g, '');
      if (input.value.length === 1 && i < digits.length - 1) {
        digits[i + 1].focus();
      }
      checkPin();
    });

    input.addEventListener('keydown', (e) => {
      if (e.key === 'Backspace' && input.value === '' && i > 0) {
        digits[i - 1].focus();
      }
    });
  });

  // Focus automático al cargar
  window.addEventListener('DOMContentLoaded', () => digits[0].focus());
  digits[0].focus();
})();
