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

// Smooth scroll for nav anchor links
document.querySelectorAll('a[href^="#"]').forEach(link => {
  link.addEventListener('click', e => {
    const target = document.querySelector(link.getAttribute('href'));
    if (!target) return;
    e.preventDefault();
    target.scrollIntoView({ behavior: 'smooth' });
  });
});

// Sticky nav shadow on scroll
const nav = document.getElementById('nav');
window.addEventListener('scroll', () => {
  nav.classList.toggle('scrolled', window.scrollY > 0);
}, { passive: true });
