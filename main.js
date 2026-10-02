/* Проверочка — first screen behaviour */
(function () {
  'use strict';

  /* ------------------------------------------------------------------
     1. Fit the scanner illustration.
        Desktop: the 860 × 840 composition starts at the scanner column
        and is designed to run off the right edge (800px visible at 1440).
        Narrow screens: it sits below the hero and is scaled to fit.
     ------------------------------------------------------------------ */
  var scanner = document.querySelector('.scanner');
  var stacked = window.matchMedia('(max-width: 1099px)');
  var VISIBLE_W = 800;   // width of the composition meant to be seen

  function fit() {
    if (!scanner) return;
    var s;
    if (stacked.matches) {
      s = scanner.clientWidth / VISIBLE_W;
    } else {
      var page = scanner.parentElement.getBoundingClientRect();
      var left = scanner.offsetLeft;
      var available = Math.min(window.innerWidth - page.left, page.width) - left;
      s = Math.max(0.6, available / VISIBLE_W);
    }
    scanner.style.setProperty('--s', Math.min(1, s).toFixed(4));
  }

  if (scanner) {
    fit();
    window.addEventListener('resize', fit);
    if (stacked.addEventListener) stacked.addEventListener('change', fit);
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(fit);
  }

  /* ------------------------------------------------------------------
     2. URL form.
        The visible field holds the domain; the full address is sent
        as ?url=https://… so a backend or results page can read it.
     ------------------------------------------------------------------ */
  var form = document.querySelector('.check');
  var input = document.getElementById('site-url');
  var full = document.getElementById('site-url-full');
  var hint = document.getElementById('check-hint');
  var hintDefault = hint ? hint.innerHTML : '';

  function normalise(value) {
    var v = (value || '').trim().replace(/^https?:\/\//i, '');
    if (!v) return null;
    try {
      var u = new URL('https://' + v);
      var host = u.hostname;
      if (host.indexOf('.') < 1 || /\.$/.test(host)) return null;
      return 'https://' + host + (u.pathname === '/' ? '' : u.pathname);
    } catch (e) {
      return null;
    }
  }

  function setError(message) {
    form.classList.add('is-invalid');
    input.setAttribute('aria-invalid', 'true');
    hint.textContent = message;
  }

  function clearError() {
    if (!form.classList.contains('is-invalid')) return;
    form.classList.remove('is-invalid');
    input.removeAttribute('aria-invalid');
    hint.innerHTML = hintDefault;
  }

  if (form && input && full && hint) {
    try {
      var preset = new URLSearchParams(window.location.search).get('url');
      if (preset) input.value = preset.replace(/^https?:\/\//i, '');
    } catch (e) { /* older browsers */ }

    input.addEventListener('input', function () {
      // drop a pasted protocol: the prefix is already shown
      if (/^https?:\/\//i.test(input.value)) input.value = input.value.replace(/^https?:\/\//i, '');
      clearError();
    });

    form.addEventListener('submit', function (event) {
      if (!input.value.trim()) {
        event.preventDefault();
        setError('Укажите адрес сайта, например ваш-сайт.ru');
        input.focus();
        return;
      }
      var url = normalise(input.value);
      if (!url) {
        event.preventDefault();
        setError('Похоже, в адресе ошибка. Проверьте написание, например ваш-сайт.ru');
        input.focus();
        return;
      }
      full.value = url;
    });
  }

  /* ------------------------------------------------------------------
     3. Mobile menu
     ------------------------------------------------------------------ */
  var toggle = document.querySelector('.menu-toggle');
  var menu = document.getElementById('mobile-menu');

  if (toggle && menu) {
    var setMenu = function (open) {
      toggle.setAttribute('aria-expanded', String(open));
      menu.hidden = !open;
    };
    toggle.addEventListener('click', function () {
      setMenu(toggle.getAttribute('aria-expanded') !== 'true');
    });
    menu.addEventListener('click', function (e) {
      if (e.target.closest('a')) setMenu(false);
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') setMenu(false);
    });
    document.addEventListener('click', function (e) {
      if (!menu.hidden && !menu.contains(e.target) && !toggle.contains(e.target)) setMenu(false);
    });
  }
})();
