/* =========================================================
   IMAAN'S STUDIO — site behaviour
   Includes lightweight GTM/GA4-style event tracking hooks so
   the analytics layer described in the SEO proposal (CTA clicks,
   phone clicks, form submissions, journey milestones) has real
   wiring in place, not just a plan on paper.
========================================================= */

window.dataLayer = window.dataLayer || [];
function trackEvent(name, params) {
  var payload = Object.assign({ event: name }, params || {});
  window.dataLayer.push(payload);
  if (window.location.hostname === 'localhost' || window.location.search.includes('debug=1')) {
    console.log('[analytics]', payload);
  }
}

document.addEventListener('DOMContentLoaded', function () {

  /* ---- Mobile nav toggle ---- */
  var toggle = document.querySelector('.nav-toggle');
  var mobileNav = document.querySelector('.nav-mobile');
  if (toggle && mobileNav) {
    toggle.addEventListener('click', function () {
      var isOpen = mobileNav.classList.toggle('open');
      toggle.setAttribute('aria-expanded', String(isOpen));
      trackEvent('nav_toggle', { state: isOpen ? 'open' : 'closed' });
    });
    mobileNav.querySelectorAll('a').forEach(function (a) {
      a.addEventListener('click', function () { mobileNav.classList.remove('open'); });
    });
  }

  /* ---- CTA click tracking (buttons + phone links) ---- */
  document.querySelectorAll('[data-cta]').forEach(function (el) {
    el.addEventListener('click', function () {
      trackEvent('cta_click', {
        cta_label: el.getAttribute('data-cta'),
        cta_location: el.getAttribute('data-cta-location') || 'unspecified',
        page_path: window.location.pathname
      });
    });
  });

  document.querySelectorAll('a[href^="tel:"]').forEach(function (el) {
    el.addEventListener('click', function () {
      trackEvent('phone_click', { phone_number: el.getAttribute('href').replace('tel:', ''), page_path: window.location.pathname });
    });
  });

  /* ---- Local-area map: hover/focus + click routing to landing pages ---- */
  document.querySelectorAll('.map-dot').forEach(function (dot) {
    dot.addEventListener('click', function () {
      var target = dot.getAttribute('data-href');
      trackEvent('local_area_select', { area: dot.getAttribute('data-area'), page_path: window.location.pathname });
      if (target) window.location.href = target;
    });
    dot.setAttribute('tabindex', '0');
    dot.setAttribute('role', 'link');
    dot.addEventListener('keypress', function (e) {
      if (e.key === 'Enter') dot.click();
    });
  });

  /* ---- Contact form submission tracking (demo — no backend wired) ---- */
  var form = document.querySelector('.contact-form');
  if (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var status = document.getElementById('form-status');
      var service = form.querySelector('#service');
      trackEvent('form_submit', {
        form_name: 'contact_enquiry',
        service_interest: service ? service.value : 'unspecified',
        page_path: window.location.pathname
      });
      if (status) {
        status.textContent = 'Thank you — your enquiry has been received. Our team will reply within one business day.';
        status.style.color = '#6b7d5b';
      }
      form.reset();
    });
  }

  /* ---- Scroll-reveal for section headers and cards ---- */
  var revealTargets = document.querySelectorAll('.service-card, .testi-card, .process-item, .locale-row, .section-head');
  if ('IntersectionObserver' in window && revealTargets.length) {
    revealTargets.forEach(function (el) { el.style.opacity = 0; el.style.transform = 'translateY(14px)'; el.style.transition = 'opacity .6s ease, transform .6s ease'; });
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.style.opacity = 1;
          entry.target.style.transform = 'translateY(0)';
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15 });
    revealTargets.forEach(function (el) { io.observe(el); });
  }

  /* ---- Journey milestone: scroll depth ---- */
  var milestones = [25, 50, 75, 90];
  var fired = {};
  window.addEventListener('scroll', function () {
    var scrolled = (window.scrollY + window.innerHeight) / document.body.scrollHeight * 100;
    milestones.forEach(function (m) {
      if (scrolled >= m && !fired[m]) {
        fired[m] = true;
        trackEvent('scroll_depth', { percent: m, page_path: window.location.pathname });
      }
    });
  }, { passive: true });

  trackEvent('page_view', { page_path: window.location.pathname, page_title: document.title });
});
