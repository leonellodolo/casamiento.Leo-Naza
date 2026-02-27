(function () {
  const PIN = '8264';
  const SESSION_KEY = 'admin_verified';

  const overlay = document.getElementById('pin-overlay');
  const content = document.getElementById('admin-content');
  const digits = Array.from(document.querySelectorAll('.pin-digit'));
  const errorMsg = document.getElementById('pin-error');

  function injectAdminScript() {
    const script = document.createElement('script');
    script.type = 'module';
    script.src = 'admin.js';
    document.body.appendChild(script);
  }

  function unlockPanel() {
    sessionStorage.setItem(SESSION_KEY, '1');
    overlay.style.opacity = '0';
    overlay.style.transition = 'opacity 0.4s ease';
    setTimeout(() => {
      overlay.remove();
      content.style.setProperty('display', 'block', 'important');
      injectAdminScript();
    }, 400);
  }

  // Si ya verificó el PIN en esta sesión del navegador, desbloquear directo
  if (sessionStorage.getItem(SESSION_KEY) === '1') {
    overlay.remove();
    content.style.setProperty('display', 'block', 'important');
    injectAdminScript();
    return;
  }

  function checkPin() {
    const entered = digits.map((d) => d.value).join('');
    if (entered.length < 4) return;

    if (entered === PIN) {
      unlockPanel();
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

  digits[0].focus();
})();
