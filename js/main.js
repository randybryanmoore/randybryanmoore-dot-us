/* =============================================
   Randy Bryan Moore — main.js
   ============================================= */

// ---------- Nav scroll effect ----------
const nav = document.getElementById('nav');

const onScroll = () => {
  nav.classList.toggle('scrolled', window.scrollY > 40);
};

window.addEventListener('scroll', onScroll, { passive: true });
onScroll();

// ---------- Mobile nav toggle ----------
const navToggle = document.getElementById('navToggle');
const navLinks  = document.getElementById('navLinks');

navToggle.addEventListener('click', () => {
  const isOpen = navLinks.classList.toggle('open');
  navToggle.classList.toggle('open', isOpen);
  navToggle.setAttribute('aria-label', isOpen ? 'Close menu' : 'Open menu');
  document.body.style.overflow = isOpen ? 'hidden' : '';
});

// Close menu when a link is clicked
navLinks.querySelectorAll('a').forEach(link => {
  link.addEventListener('click', () => {
    navLinks.classList.remove('open');
    navToggle.classList.remove('open');
    document.body.style.overflow = '';
  });
});

// ---------- Footer year ----------
const yearEl = document.getElementById('year');
if (yearEl) yearEl.textContent = new Date().getFullYear();

// ---------- Contact form (Formspree) ----------
const contactForm = document.getElementById('contactForm');
const formStatus  = document.getElementById('formStatus');

if (contactForm) {
  contactForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const data     = new FormData(contactForm);
    const submitBtn = contactForm.querySelector('[type="submit"]');

    submitBtn.disabled    = true;
    submitBtn.textContent = 'Sending…';
    formStatus.textContent = '';

    try {
      const res = await fetch(contactForm.action, {
        method: 'POST',
        body: data,
        headers: { 'Accept': 'application/json' },
      });

      if (res.ok) {
        formStatus.textContent = '✓ Message sent! I\'ll be in touch soon.';
        contactForm.reset();
      } else {
        throw new Error('Server error');
      }
    } catch {
      formStatus.textContent = 'Something went wrong. Please try emailing directly.';
      formStatus.style.color = '#e05252';
    } finally {
      submitBtn.disabled    = false;
      submitBtn.textContent = 'Send Message';
    }
  });
}

// ---------- Scroll-reveal animations ----------
const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
);

document.querySelectorAll(
  '.music__card, .services__item, .about__text, .about__image-wrap, .podcast__text, .podcast__art, .contact__form, .contact__info'
).forEach(el => {
  el.classList.add('reveal');
  observer.observe(el);
});

// ---------- Add reveal CSS dynamically ----------
const revealStyle = document.createElement('style');
revealStyle.textContent = `
  .reveal {
    opacity: 0;
    transform: translateY(24px);
    transition: opacity 0.6s ease, transform 0.6s ease;
  }
  .reveal.visible {
    opacity: 1;
    transform: translateY(0);
  }
  .music__card:nth-child(2) { transition-delay: 0.1s; }
  .music__card:nth-child(3) { transition-delay: 0.2s; }
  .services__item:nth-child(2) { transition-delay: 0.05s; }
  .services__item:nth-child(3) { transition-delay: 0.1s; }
  .services__item:nth-child(4) { transition-delay: 0.15s; }
`;
document.head.appendChild(revealStyle);
