// Hero title + tagline — line-by-line reveal (bottom to top)
(function () {
  const STAGGER  = 400;
  const DURATION = 1500;
  const START    = 200;

  const title = document.querySelector('.hero__title');
  if (!title) return;
  const lines = title.querySelectorAll('span.regular, span.italic');
  lines.forEach((line, i) => {
    line.classList.add('hero__word');
    line.style.setProperty('--i', i);
    line.style.setProperty('--line-delay', START + 'ms');
  });

  // tagline starts shortly after the last title line begins
  const tagline = document.querySelector('.hero__tagline');
  if (!tagline) return;
  const taglineDelay = START + (lines.length - 1) * STAGGER + 300;
  tagline.classList.add('hero__word');
  tagline.style.setProperty('--i', 0);
  tagline.style.setProperty('--line-delay', taglineDelay + 'ms');
  tagline.style.animationDuration = '0.9s';
})();

// Custom cursor (desktop/mouse only)
if (!window.matchMedia('(pointer: coarse)').matches) {
  const cursor = document.createElement('div');
  cursor.className = 'cursor';
  document.body.appendChild(cursor);

  document.addEventListener('mousemove', e => {
    cursor.style.left = e.clientX + 'px';
    cursor.style.top  = e.clientY + 'px';
  });

  document.addEventListener('mouseleave', () => { cursor.style.opacity = '0'; });
  document.addEventListener('mouseenter', () => { cursor.style.opacity = '1'; });
}

// Custom slow smooth scroll for nav anchor links
function scrollToTarget(target, duration) {
  const navHeight = document.getElementById('nav').offsetHeight;
  const start = window.scrollY;
  const end = target.getBoundingClientRect().top + start - navHeight;
  const distance = end - start;
  let startTime = null;

  function easeInOutCubic(t) {
    return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
  }

  function step(timestamp) {
    if (!startTime) startTime = timestamp;
    const elapsed = timestamp - startTime;
    const progress = Math.min(elapsed / duration, 1);
    window.scrollTo(0, start + distance * easeInOutCubic(progress));
    if (progress < 1) requestAnimationFrame(step);
  }

  requestAnimationFrame(step);
}

document.querySelectorAll('.nav__menu a[href^="#"]').forEach(link => {
  link.addEventListener('click', e => {
    const target = document.querySelector(link.getAttribute('href'));
    if (!target) return;
    e.preventDefault();
    scrollToTarget(target, 1400);
  });
});

// Sticky nav shadow on scroll
const nav = document.getElementById('nav');
window.addEventListener('scroll', () => {
  nav.classList.toggle('scrolled', window.scrollY > 0);
}, { passive: true });

// ── Theme & Language ────────────────────────────────────────────────────────

const TRANSLATIONS = {
  en: {
    'nav-works':        'Works',
    'nav-about':        'About',
    'nav-contact':      'Contact',
    'hero-title-1':     'The past designs',
    'hero-title-2':     'the future',
    'hero-tag-1':       'Think',
    'hero-tag-2':       'Analyze',
    'hero-tag-3':       'Design',
    'works-label':      'Works I made with love from present to past',
    'badge-identity':   'Identity',
    'badge-app-design': 'App design',
    'badge-web-design': 'Web design',
    'about-label':      'About',
    'about-bio':        'Hi, I’m Sergey Golosov, an art director and designer with <em>10 years of design experience</em> in product, web, and branding. I turn <em>fintech, insurance, and B2B/B2E products</em> into clear, honest interfaces. I believe good design disappears — and what stays is a person who got what they needed without friction',
    'footer-cta':       'Let’s talk',
    'footer-copy':      '© 2026 Dsgn Warrior',
    'footer-version':   'Version 1.0',
    'theme-dark':       'Dark mode',
    'theme-light':      'Light mode',
  },
  ru: {
    'nav-works':        'Работы',
    'nav-about':        'Обо мне',
    'nav-contact':      'Контакт',
    'hero-title-1':     'Прошлые работы',
    'hero-title-2':     'Будущее',
    'hero-tag-1':       'Думать',
    'hero-tag-2':       'Анализировать',
    'hero-tag-3':       'Создавать',
    'works-label':      'Работы, созданные с любовью',
    'badge-identity':   'Айдентика',
    'badge-app-design': 'Дизайн приложения',
    'badge-web-design': 'Веб-дизайн',
    'about-label':      'Обо мне',
    'about-bio':        'Привет, я — Сергей Голосов, арт-директор и дизайнер с <em>10-летним опытом</em> в продуктовом, веб- и брендинговом дизайне. Я создаю чёткие, честные интерфейсы для <em>финтех-, страховых и B2B/B2E-продуктов</em>. Я верю, что хороший дизайн исчезает — и остаётся лишь человек, который получил нужное без лишних усилий',
    'footer-cta':       'Поговорим',
    'footer-copy':      '© 2026 Dsgn Warrior',
    'footer-version':   'Версия 1.0',
    'theme-dark':       'Тёмная тема',
    'theme-light':      'Светлая тема',
  }
};

const html        = document.documentElement;
const themeToggle = document.getElementById('themeToggle');
const langToggle  = document.getElementById('langToggle');

function applyLang(lang) {
  localStorage.setItem('lang', lang);
  html.setAttribute('lang', lang === 'ru' ? 'ru' : 'en');
  langToggle.textContent = lang === 'ru' ? 'RU' : 'ENG';
  const t = TRANSLATIONS[lang];
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.getAttribute('data-i18n');
    if (t[key] !== undefined) el.textContent = t[key];
  });
  document.querySelectorAll('[data-i18n-html]').forEach(el => {
    const key = el.getAttribute('data-i18n-html');
    if (t[key] !== undefined) el.innerHTML = t[key];
  });
  const isDark = html.getAttribute('data-theme') === 'dark';
  themeToggle.textContent = isDark ? t['theme-light'] : t['theme-dark'];
}

function applyTheme(theme) {
  html.setAttribute('data-theme', theme);
  localStorage.setItem('theme', theme);
  const lang = localStorage.getItem('lang') || 'en';
  const isDark = theme === 'dark';
  themeToggle.textContent = isDark
    ? TRANSLATIONS[lang]['theme-light']
    : TRANSLATIONS[lang]['theme-dark'];
}

themeToggle.addEventListener('click', () => {
  applyTheme(html.getAttribute('data-theme') === 'dark' ? 'light' : 'dark');
});

langToggle.addEventListener('click', () => {
  applyLang((localStorage.getItem('lang') || 'en') === 'en' ? 'ru' : 'en');
});

applyTheme(localStorage.getItem('theme') || 'light');
applyLang(localStorage.getItem('lang') || 'en');
