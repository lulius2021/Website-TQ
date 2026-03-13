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
      mobileMenuBtn.textContent = isOpen ? '✕' : '☰';
    });
    var links = mobileNav.querySelectorAll('.nav-link');
    for (var i = 0; i < links.length; i++) {
      links[i].addEventListener('click', function() {
        mobileNav.classList.remove('open');
        mobileMenuBtn.textContent = '☰';
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

  // Create the indicator element
  var indicator = document.createElement('div');
  indicator.className = 'nav-indicator';
  navLinks.appendChild(indicator);

  var links = navLinks.querySelectorAll('.nav-link:not(.nav-lang)');
  var activeLink = navLinks.querySelector('.nav-link.active, .nav-link[aria-current="page"]');

  function moveIndicator(target, animate) {
    if (!target) { indicator.classList.remove('visible'); return; }
    var navRect = navLinks.getBoundingClientRect();
    var linkRect = target.getBoundingClientRect();
    var left = linkRect.left - navRect.left;
    var width = linkRect.width;

    if (!animate) {
      indicator.style.transition = 'none';
      indicator.offsetHeight;
    }

    indicator.style.left = left + 'px';
    indicator.style.width = width + 'px';
    indicator.classList.add('visible');

    if (!animate) {
      indicator.offsetHeight;
      indicator.style.transition = '';
    }
  }

  // Position on active link immediately
  if (activeLink) {
    requestAnimationFrame(function() {
      moveIndicator(activeLink, false);
    });
  }

  // On click: animate indicator to clicked link, then navigate
  for (var i = 0; i < links.length; i++) {
    links[i].addEventListener('click', function(e) {
      var clicked = this;
      // Skip if already active or external link
      if (clicked === activeLink) return;
      var href = clicked.getAttribute('href');
      if (!href || href.startsWith('http') || href.startsWith('#')) return;

      e.preventDefault();

      // Animate indicator to the clicked tab
      moveIndicator(clicked, true);

      // Update active styling immediately
      if (activeLink) activeLink.classList.remove('active');
      clicked.classList.add('active');

      // Navigate after animation completes
      setTimeout(function() {
        window.location.href = href;
      }, 350);
    });
  }

  // Update on resize
  var resizeTimer;
  window.addEventListener('resize', function() {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(function() {
      var current = navLinks.querySelector('.nav-link.active, .nav-link[aria-current="page"]');
      if (current) moveIndicator(current, false);
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
  setTimeout(function() { banner.classList.add('visible'); }, 1500);
  banner.querySelector('.cookie-btn-accept')?.addEventListener('click', function() {
    localStorage.setItem('trainq-cookies', 'accepted');
    banner.classList.remove('visible');
    banner.classList.add('hidden');
  });
  banner.querySelector('.cookie-btn-decline')?.addEventListener('click', function() {
    localStorage.setItem('trainq-cookies', 'declined');
    banner.classList.remove('visible');
    banner.classList.add('hidden');
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
