(function () {
  'use strict';

  const header = document.querySelector('.site-header');

  function updateHeaderShadow() {
    if (!header) return;
    header.classList.toggle('scrolled', window.scrollY > 10);
  }

  window.addEventListener('scroll', updateHeaderShadow, { passive: true });
  updateHeaderShadow();

  document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
    anchor.addEventListener('click', function (event) {
      const targetId = this.getAttribute('href');
      if (!targetId || targetId === '#') return;

      const target = document.querySelector(targetId);
      if (!target) return;

      event.preventDefault();

      const navCollapse = document.querySelector('#mainNav');
      if (navCollapse && navCollapse.classList.contains('show')) {
        const toggler = document.querySelector('.navbar-toggler');
        if (toggler) toggler.click();
      }

      const headerHeight = header ? header.offsetHeight : 0;
      const top = target.getBoundingClientRect().top + window.scrollY - headerHeight;

      window.scrollTo({ top: top, behavior: 'smooth' });
    });
  });

  const observer = new IntersectionObserver(
    function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
        }
      });
    },
    { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
  );

  document.querySelectorAll('.section-quem-somos, .section-projetos, .section-bazar, .section-apadrinhar').forEach(function (section) {
    section.style.opacity = '0';
    section.style.transform = 'translateY(24px)';
    section.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
    observer.observe(section);
  });

  document.head.insertAdjacentHTML(
    'beforeend',
    '<style>.is-visible { opacity: 1 !important; transform: translateY(0) !important; }</style>'
  );
})();
