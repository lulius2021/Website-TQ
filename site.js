/* ==========================================================================
   TrainQ — Shared site behavior (topbar scroll/condense, mobile nav, fade-up)
   Used by all sub-pages.
   ========================================================================== */

(function() {
    // ── Topbar: condense + fade on scroll ─────────────
    const topbar = document.getElementById('topbar');
    if (topbar) {
        const fadeStart = 20;
        const fadeEnd = 150;
        window.addEventListener('scroll', () => {
            const y = window.scrollY;
            topbar.classList.toggle('is-condensed', y > 24);
            const opacity = Math.max(0, 1 - (y - fadeStart) / (fadeEnd - fadeStart));
            topbar.style.opacity = y < fadeStart ? '1' : String(opacity);
            topbar.style.pointerEvents = opacity <= 0 ? 'none' : 'auto';
        }, { passive: true });
    }

    // ── Mobile nav overlay ────────────────────────────
    const menuBtn = document.getElementById('menuBtn');
    const mobileNav = document.getElementById('mobileNav');
    if (menuBtn && mobileNav) {
        const setMenu = (open) => {
            menuBtn.classList.toggle('is-open', open);
            mobileNav.classList.toggle('is-open', open);
            mobileNav.setAttribute('aria-hidden', String(!open));
            menuBtn.setAttribute('aria-label', open ? 'Menü schließen' : 'Menü öffnen');
            document.body.style.overflow = open ? 'hidden' : '';
        };
        menuBtn.addEventListener('click', () => setMenu(!menuBtn.classList.contains('is-open')));
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && menuBtn.classList.contains('is-open')) setMenu(false);
        });
        mobileNav.querySelectorAll('.mobile-nav-link').forEach((link) => {
            link.addEventListener('click', () => setMenu(false));
        });
    }

    // ── Fade-up on scroll (IntersectionObserver) ──────
    const fadeUpEls = document.querySelectorAll('.fade-up');
    if (fadeUpEls.length && 'IntersectionObserver' in window) {
        const io = new IntersectionObserver((entries, obs) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('is-visible');
                    obs.unobserve(entry.target);
                }
            });
        }, { threshold: 0.15, rootMargin: '0px 0px -80px 0px' });
        fadeUpEls.forEach((el) => io.observe(el));
    } else {
        fadeUpEls.forEach((el) => el.classList.add('is-visible'));
    }

    // ── Cookie banner (essential only) ────────────────
    const cookieBanner = document.getElementById('cookieBanner');
    if (cookieBanner) {
        if (!localStorage.getItem('tq_cookie')) {
            setTimeout(() => cookieBanner.classList.add('visible'), 1400);
        }
        const accept = cookieBanner.querySelector('.cookie-accept');
        const decline = cookieBanner.querySelector('.cookie-decline');
        const dismiss = () => {
            localStorage.setItem('tq_cookie', '1');
            cookieBanner.classList.remove('visible');
        };
        if (accept) accept.addEventListener('click', dismiss);
        if (decline) decline.addEventListener('click', dismiss);
    }
})();
