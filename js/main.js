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

// Custom cursor
const cursor = document.createElement('div');
cursor.className = 'cursor';
document.body.appendChild(cursor);

document.addEventListener('mousemove', e => {
  cursor.style.left = e.clientX + 'px';
  cursor.style.top  = e.clientY + 'px';
});

document.addEventListener('mouseleave', () => { cursor.style.opacity = '0'; });
document.addEventListener('mouseenter', () => { cursor.style.opacity = '1'; });

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
