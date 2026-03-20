// ── Theme (runs immediately, no wait) ──
(function() {
  var s = localStorage.getItem('trainq-theme');
  if (s === 'light') document.documentElement.classList.add('light');
  else if (s === 'dark') document.documentElement.classList.remove('light');
  else if (window.matchMedia('(prefers-color-scheme: light)').matches) document.documentElement.classList.add('light');
})();

// ── Prefetch nav links on hover for instant page loads ──
(function() {
  var prefetched = {};
  document.addEventListener('pointerover', function(e) {
    var link = e.target.closest('a[href]');
    if (!link) return;
    var href = link.href;
    if (prefetched[href] || !href.startsWith(location.origin)) return;
    prefetched[href] = true;
    var l = document.createElement('link');
    l.rel = 'prefetch';
    l.href = href;
    document.head.appendChild(l);
  }, { passive: true });
})();

// ── Everything else — run as soon as DOM is interactive ──
function init() {
  // Theme toggle
  var toggle = document.getElementById('themeToggle');
  if (toggle) {
    toggle.textContent = document.documentElement.classList.contains('light') ? '☀️' : '🌙';
    toggle.addEventListener('click', function() {
      var isLight = document.documentElement.classList.toggle('light');
      toggle.textContent = isLight ? '☀️' : '🌙';
      localStorage.setItem('trainq-theme', isLight ? 'light' : 'dark');
      toggle.style.transform = 'scale(1.15) rotate(360deg)';
      setTimeout(function() { toggle.style.transform = ''; }, 400);
    });
  }

  // Scroll reveal
  if ('IntersectionObserver' in window) {
    var obs = new IntersectionObserver(function(entries) {
      for (var i = 0; i < entries.length; i++) {
        if (entries[i].isIntersecting) {
          entries[i].target.classList.add('visible');
          obs.unobserve(entries[i].target);
        }
      }
    }, { threshold: 0.1 });
    var els = document.querySelectorAll('.reveal, .reveal-left, .reveal-right, .reveal-scale, .reveal-blur, .stagger-children');
    for (var i = 0; i < els.length; i++) obs.observe(els[i]);
  } else {
    // Fallback: show everything
    var els = document.querySelectorAll('.reveal, .reveal-left, .reveal-right, .reveal-scale, .reveal-blur');
    for (var i = 0; i < els.length; i++) els[i].classList.add('visible');
  }

  // Navbar scroll
  var navbar = document.getElementById('navbar');
  if (navbar) {
    var ticking = false;
    window.addEventListener('scroll', function() {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(function() {
          navbar.classList.toggle('scrolled', window.scrollY > 30);
          ticking = false;
        });
      }
    }, { passive: true });
  }

  // Mobile menu
  var mobileMenuBtn = document.getElementById('mobileMenuBtn');
  var mobileNav = document.getElementById('mobileNav');
  if (mobileMenuBtn && mobileNav) {
    mobileMenuBtn.addEventListener('click', function() {
      var isOpen = mobileNav.classList.toggle('open');
      mobileMenuBtn.classList.toggle('mobile-menu-open', isOpen);
    });
    var links = mobileNav.querySelectorAll('a');
    for (var i = 0; i < links.length; i++) {
      links[i].addEventListener('click', function() {
        mobileNav.classList.remove('open');
        mobileMenuBtn.classList.remove('mobile-menu-open');
      });
    }
  }

  // Button ripple
  document.addEventListener('click', function(e) {
    var btn = e.target.closest('.btn');
    if (!btn) return;
    var rect = btn.getBoundingClientRect();
    var ripple = document.createElement('span');
    var size = Math.max(rect.width, rect.height);
    ripple.className = 'ripple';
    ripple.style.cssText = 'width:' + size + 'px;height:' + size + 'px;left:' + (e.clientX - rect.left - size/2) + 'px;top:' + (e.clientY - rect.top - size/2) + 'px;';
    btn.appendChild(ripple);
    ripple.addEventListener('animationend', function() { ripple.remove(); });
  });

  // Nav liquid glass sliding indicator
  initNavIndicator();

  // FAQ Accordion
  var headers = document.querySelectorAll('.accordion-header');
  for (var i = 0; i < headers.length; i++) {
    headers[i].addEventListener('click', function() {
      var item = this.parentElement;
      var wasActive = item.classList.contains('active');
      var accordion = item.closest('.accordion');
      if (accordion) {
        var actives = accordion.querySelectorAll('.accordion-item.active');
        for (var j = 0; j < actives.length; j++) actives[j].classList.remove('active');
      }
      if (!wasActive) item.classList.add('active');
    });
  }
}

// ── Nav liquid glass sliding indicator (iOS 26 style — click to slide) ──
function initNavIndicator() {
  var navLinks = document.querySelector('.nav-links');
  if (!navLinks) return;

  var indicator = document.createElement('div');
  indicator.className = 'nav-indicator';
  navLinks.appendChild(indicator);

  var links = navLinks.querySelectorAll('.nav-link:not(.nav-lang)');
  var activeLink = navLinks.querySelector('.nav-link.active, .nav-link[aria-current="page"]');
  var isAnimating = false;

  function positionIndicator(target, instant) {
    if (!target) { indicator.classList.remove('visible'); return; }
    var navRect = navLinks.getBoundingClientRect();
    var linkRect = target.getBoundingClientRect();

    if (instant) {
      indicator.style.transition = 'none';
      indicator.offsetHeight;
    }

    indicator.style.left = (linkRect.left - navRect.left) + 'px';
    indicator.style.width = linkRect.width + 'px';
    indicator.classList.add('visible');

    if (instant) {
      indicator.offsetHeight;
      indicator.style.transition = '';
    }
  }

  // Set initial position (no animation)
  if (activeLink) {
    requestAnimationFrame(function() {
      positionIndicator(activeLink, true);
    });
  }

  // Click handler — smooth liquid slide, then navigate
  for (var i = 0; i < links.length; i++) {
    links[i].addEventListener('click', function(e) {
      var clicked = this;
      if (clicked === activeLink || isAnimating) return;
      var href = clicked.getAttribute('href');
      if (!href || href.startsWith('http') || href.startsWith('#')) return;

      e.preventDefault();
      isAnimating = true;

      // Simply slide the indicator to the clicked tab
      var navRect = navLinks.getBoundingClientRect();
      var toRect = clicked.getBoundingClientRect();
      indicator.style.left = (toRect.left - navRect.left) + 'px';
      indicator.style.width = toRect.width + 'px';

      // Update active styling
      if (activeLink) activeLink.classList.remove('active');
      clicked.classList.add('active');

      // Navigate after the slide completes
      setTimeout(function() {
        window.location.href = href;
      }, 420);
    });
  }

  // Update on resize
  var resizeTimer;
  window.addEventListener('resize', function() {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(function() {
      var current = navLinks.querySelector('.nav-link.active, .nav-link[aria-current="page"]');
      if (current) positionIndicator(current, true);
    }, 100);
  });
}

// ── Back to top ──
function initBackToTop() {
  var btn = document.getElementById('backToTop');
  if (!btn) return;
  var ticking = false;
  window.addEventListener('scroll', function() {
    if (!ticking) {
      ticking = true;
      requestAnimationFrame(function() {
        btn.classList.toggle('visible', window.scrollY > 600);
        ticking = false;
      });
    }
  }, { passive: true });
  btn.addEventListener('click', function() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}

// ── Cookie banner ──
function initCookieBanner() {
  if (localStorage.getItem('trainq-cookies')) return;
  var banner = document.getElementById('cookieBanner');
  if (!banner) return;
  setTimeout(function() { banner.classList.add('show'); }, 1500);
  banner.querySelector('.cookie-btn-accept')?.addEventListener('click', function() {
    localStorage.setItem('trainq-cookies', 'accepted');
    banner.classList.remove('show');
  });
  banner.querySelector('.cookie-btn-decline')?.addEventListener('click', function() {
    localStorage.setItem('trainq-cookies', 'declined');
    banner.classList.remove('show');
  });
}

// ── Page loader ──
function hideLoader() {
  var loader = document.getElementById('pageLoader');
  if (loader) loader.classList.add('hidden');
}

// Run init immediately if DOM ready, otherwise wait
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', function() { init(); initBackToTop(); initCookieBanner(); });
} else {
  init(); initBackToTop(); initCookieBanner();
}

// Hide loader when page fully loaded
window.addEventListener('load', hideLoader);
