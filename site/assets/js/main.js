// Simple JS: mobile nav toggle and footer year.
(function () {
  const $toggle = document.querySelector('.menu-toggle');
  const $nav = document.querySelector('.main-nav');
  if ($toggle && $nav) {
    $toggle.addEventListener('click', () => {
      const open = $nav.classList.toggle('open');
      $toggle.setAttribute('aria-expanded', String(open));
    });
  }

  const $year = document.getElementById('year');
  if ($year) $year.textContent = new Date().getFullYear();
})();

