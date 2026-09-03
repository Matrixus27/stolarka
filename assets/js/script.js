// F.H.U.P. Damian Chrustowicz — interakcje strony
document.addEventListener('DOMContentLoaded', () => {

  const MOBILE_NAV_BREAKPOINT = 1080; // musi być zgodne z @media w style.css

  /* ---- Realna wysokość paska nagłówka (żeby menu mobilne nie "bugowało" się
     przy zawijaniu tekstu, ładowaniu fontów itp.) ---- */
  const topbar = document.querySelector('.topbar');
  const setTopbarHeight = () => {
    if (topbar) {
      document.documentElement.style.setProperty('--topbar-h', topbar.offsetHeight + 'px');
    }
  };
  setTopbarHeight();
  window.addEventListener('resize', setTopbarHeight);
  window.addEventListener('load', setTopbarHeight);
  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(setTopbarHeight).catch(() => {});
  }

  /* ---- Automatyczne oznaczanie aktywnej pozycji menu (na podstawie adresu strony) ---- */
  const currentFile = location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-desktop > li').forEach((li) => {
    const topLink = li.querySelector(':scope > a.nav-link');
    if (!topLink) return;
    const hrefs = [topLink.getAttribute('href')];
    li.querySelectorAll('.dropdown a').forEach((a) => hrefs.push(a.getAttribute('href')));
    if (hrefs.includes(currentFile)) {
      topLink.classList.add('active');
    }
  });

  /* ---- Menu mobilne ---- */
  const toggle = document.querySelector('.nav-toggle');
  const nav = document.querySelector('.nav-desktop');

  const closeMobileNav = () => {
    if (!toggle || !nav) return;
    nav.classList.remove('is-open');
    toggle.classList.remove('is-open');
    toggle.setAttribute('aria-expanded', 'false');
    document.body.classList.remove('nav-open');
  };

  if (toggle && nav) {
    toggle.addEventListener('click', () => {
      const open = nav.classList.toggle('is-open');
      toggle.classList.toggle('is-open', open);
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
      document.body.classList.toggle('nav-open', open);
      setTopbarHeight();
    });

    // Rozwijanie podkategorii w menu mobilnym po dotknięciu
    nav.querySelectorAll('.has-dropdown').forEach(link => {
      link.addEventListener('click', (e) => {
        if (window.innerWidth <= MOBILE_NAV_BREAKPOINT) {
          const parentLi = link.closest('li');
          const hasDropdown = parentLi.querySelector('.dropdown');
          if (hasDropdown) {
            e.preventDefault();
            parentLi.classList.toggle('dd-open');
          }
        }
      });
    });

    // Zamknij menu po zmianie rozmiaru okna powyżej progu (np. obrót telefonu)
    window.addEventListener('resize', () => {
      if (window.innerWidth > MOBILE_NAV_BREAKPOINT) closeMobileNav();
    });

    // Zamknij menu klawiszem Escape
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') closeMobileNav();
    });
  }

  /* ---- Animacje przy przewijaniu (reveal) ---- */
  const revealEls = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window && revealEls.length) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.14, rootMargin: '0px 0px -40px 0px' });
    revealEls.forEach(el => io.observe(el));
  } else {
    revealEls.forEach(el => el.classList.add('is-visible'));
  }

  // Ustawienie opóźnień dla elementów w grupach reveal-stagger
  document.querySelectorAll('.reveal-stagger').forEach(group => {
    Array.from(group.children).forEach((child, i) => {
      child.style.setProperty('--i', i);
      child.classList.add('reveal');
    });
  });
  // ponowna obserwacja elementów dodanych przez stagger
  if ('IntersectionObserver' in window) {
    const io2 = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          io2.unobserve(entry.target);
        }
      });
    }, { threshold: 0.14, rootMargin: '0px 0px -40px 0px' });
    document.querySelectorAll('.reveal-stagger > *').forEach(el => io2.observe(el));
  }

  /* ---- Grafika sygnaturowa: schody budujące się przy wejściu w widok ---- */
  const stairs = document.querySelector('.stairs-signature');
  if (stairs && 'IntersectionObserver' in window) {
    const io3 = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          io3.unobserve(entry.target);
        }
      });
    }, { threshold: 0.3 });
    io3.observe(stairs);
  } else if (stairs) {
    stairs.classList.add('is-visible');
  }

  /* ---- Cień pod topbarem po przewinięciu ---- */
  if (topbar) {
    const onScroll = () => {
      topbar.style.boxShadow = window.scrollY > 8 ? '0 8px 24px -16px rgba(36,31,27,0.35)' : 'none';
    };
    document.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  /* ---- Rok w stopce ---- */
  const yearEl = document.querySelector('[data-year]');
  if (yearEl) yearEl.textContent = new Date().getFullYear();
});
