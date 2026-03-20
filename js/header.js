// ============================================================
//  TrainQ Header — Scroll effect + Dropdown + Mobile Menu
// ============================================================

(function () {
  'use strict';

  // ── Scroll effect ──────────────────────────────────────────
  var header = document.getElementById('header');
  if (header) {
    var ticking = false;
    window.addEventListener('scroll', function () {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(function () {
          header.classList.toggle('scrolled', window.pageYOffset > 50);
          ticking = false;
        });
      }
    }, { passive: true });
    // Run once on load
    if (window.pageYOffset > 50) header.classList.add('scrolled');
  }

  // ── Sports Dropdown ────────────────────────────────────────
  var dropdownTrigger = document.getElementById('sportsDropdownBtn');
  var dropdownContainer = dropdownTrigger && dropdownTrigger.closest('.nav-dropdown');

  if (dropdownTrigger && dropdownContainer) {
    dropdownTrigger.addEventListener('click', function (e) {
      e.stopPropagation();
      var isOpen = dropdownContainer.classList.toggle('active');
      dropdownTrigger.setAttribute('aria-expanded', isOpen);
    });

    document.addEventListener('click', function (e) {
      if (!dropdownContainer.contains(e.target)) {
        dropdownContainer.classList.remove('active');
        dropdownTrigger.setAttribute('aria-expanded', 'false');
      }
    });

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') {
        dropdownContainer.classList.remove('active');
        dropdownTrigger.setAttribute('aria-expanded', 'false');
      }
    });
  }

  // ── Mobile Menu ────────────────────────────────────────────
  var mobileBtn  = document.getElementById('mobileMenuBtn');
  var mobileMenu = document.getElementById('mobileMenu');

  function closeMobileMenu() {
    if (!mobileBtn || !mobileMenu) return;
    mobileBtn.classList.remove('active');
    mobileMenu.classList.remove('active');
    document.body.style.overflow = '';
  }

  if (mobileBtn && mobileMenu) {
    mobileBtn.addEventListener('click', function () {
      var isOpen = mobileMenu.classList.toggle('active');
      mobileBtn.classList.toggle('active', isOpen);
      document.body.style.overflow = isOpen ? 'hidden' : '';
    });

    // Close on link click
    var mobileLinks = mobileMenu.querySelectorAll('a');
    for (var i = 0; i < mobileLinks.length; i++) {
      mobileLinks[i].addEventListener('click', closeMobileMenu);
    }

    // Close on ESC
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') closeMobileMenu();
    });
  }

})();
