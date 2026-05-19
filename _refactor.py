#!/usr/bin/env python3
"""
Refactor all non-index HTML pages: replace old header/footer/menu blocks
with the new DEUKOM-style topbar + site-footer and link to site.css/site.js.

Idempotent: skips pages that already have the new structure.
"""
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent

# ── Templates ─────────────────────────────────────────────────────────────
def new_header(active_page: str, prefix: str = "") -> str:
    """active_page is one of: home, gym, running, cycling, features, blog, pricing.
       prefix is "../" for blog/ subpages, "" for root pages."""
    items = [
        ("home",     f"{prefix}index.html",     "Home"),
        ("gym",      f"{prefix}gym.html",       "Gym"),
        ("running",  f"{prefix}running.html",   "Running"),
        ("cycling",  f"{prefix}cycling.html",   "Cycling"),
        ("features", f"{prefix}features.html",  "Features"),
    ]
    links_html = "\n            ".join(
        f'<a href="{href}" class="mobile-nav-link{" is-active" if key == active_page else ""}">{label}</a>'
        for key, href, label in items
    )
    return f'''<!-- ===== HEADER (DEUKOM-style) ===== -->
    <header class="topbar" id="topbar">
        <a href="{prefix}index.html" class="brand" aria-label="TrainQ">
            <img src="{prefix}images/logos/transparent Weiß.png" alt="" class="brand-mark">
            <span class="brand-text">
                <span class="brand-collapse">T</span><span class="brand-collapse">R</span><span class="brand-collapse">A</span><span class="brand-collapse">I</span><span class="brand-collapse">N</span><span class="brand-collapse">Q</span>
            </span>
        </a>
        <button class="menu-button" id="menuBtn" type="button" aria-label="Menü öffnen">
            <span></span><span></span><span></span>
        </button>
    </header>

    <nav class="mobile-nav" id="mobileNav" aria-hidden="true">
        <div class="mobile-nav-inner">
            {links_html}
        </div>
    </nav>'''


def new_footer(prefix: str = "") -> str:
    return f'''<!-- ===== FOOTER (DEUKOM-style) ===== -->
    <footer class="site-footer">
        <div class="footer-bar">
            <a href="{prefix}index.html" class="footer-left" aria-label="TrainQ">
                <img src="{prefix}images/logos/transparent Weiß.png" alt="" class="footer-logo-img">
                <span class="footer-brand-name">TrainQ</span>
            </a>
            <nav class="footer-nav">
                <a href="{prefix}imprint.html">Imprint</a>
                <span class="footer-dot">·</span>
                <a href="{prefix}privacy.html">Privacy</a>
                <span class="footer-dot">·</span>
                <a href="{prefix}terms.html">Terms</a>
                <span class="footer-dot">·</span>
                <a href="{prefix}faq.html">FAQ</a>
            </nav>
            <div class="footer-right">
                <span class="footer-copy">&copy; 2026 TrainQ. All rights reserved.</span>
            </div>
        </div>
    </footer>'''


# Map filename → active key
ACTIVE_MAP = {
    "index.html":     "home",
    "gym.html":       "gym",
    "running.html":   "running",
    "cycling.html":   "cycling",
    "features.html":  "features",
    "faq.html":       None,
    "about.html":     None,
    "imprint.html":   None,
    "privacy.html":   None,
    "terms.html":     None,
    "404.html":       None,
}


def process_file(path: Path, in_blog_subdir: bool = False) -> tuple[bool, str]:
    text = path.read_text(encoding="utf-8")
    original = text

    prefix = "../" if in_blog_subdir else ""
    fname = path.name

    # Determine active nav key
    if in_blog_subdir:
        active = "blog"
    else:
        active = ACTIVE_MAP.get(fname)
    if active is None:
        active = ""

    # ── 1. Replace the FIRST <header>...</header> block with the new topbar.
    # We also drop any duplicate <nav class="mobile-nav"> blocks (leftover from
    # earlier non-idempotent runs).
    header_re = re.compile(
        r'<header[^>]*>.*?</header>',
        re.DOTALL,
    )
    if header_re.search(text):
        text = header_re.sub(new_header(active, prefix), text, count=1)

    # Dedupe: keep only the first <nav class="mobile-nav">...</nav>
    mobile_nav_re = re.compile(
        r'<nav[^>]*class="mobile-nav"[^>]*>.*?</nav>\s*',
        re.DOTALL,
    )
    nav_matches = list(mobile_nav_re.finditer(text))
    if len(nav_matches) > 1:
        # Remove all matches AFTER the first (iterate in reverse so indices stay valid)
        for m in reversed(nav_matches[1:]):
            text = text[:m.start()] + text[m.end():]

    # Remove any leftover "Pricing" and "Blog" links (pages deleted)
    text = re.sub(
        r'\s*<a[^>]*href="[^"]*(?:pricing|blog)\.html"[^>]*>.*?</a>',
        '',
        text,
    )

    # Remove duplicate HTML comments left by repeated runs
    text = re.sub(
        r'(<!-- ===== HEADER \(DEUKOM-style\) ===== -->)(\s*<!-- ===== HEADER \(DEUKOM-style\) ===== -->)+',
        r'\1',
        text,
    )

    # Remove dead GSAP / ScrollTrigger CDN scripts (no longer used)
    text = re.sub(
        r'\s*<script[^>]*src="[^"]*gsap[^"]*"[^>]*></script>',
        '',
        text,
        flags=re.IGNORECASE,
    )

    # Remove old inline CSS rules that are now provided by site.css
    # (only matches one-line rules in the inline <style> block — safe surgical removal)
    obsolete_rules = [
        r'\.header\s*\{[^}]*\}',
        r'\.header\.scrolled\s*\{[^}]*\}',
        r'\.nav-container\s*\{[^}]*\}',
        r'\.logo\s*\{[^}]*\}\s*\.logo\s+img\s*\{[^}]*\}',
        r'\.nav-links\s*\{[^}]*\}',
        r'\.nav-link\s*\{[^}]*\}',
        r'\.nav-link:hover,\.nav-link\.active\s*\{[^}]*\}',
        r'\.nav-dropdown\s*\{[^}]*\}',
        r'\.dropdown-arrow\s*\{[^}]*\}',
        r'\.nav-dropdown\.open\s+\.dropdown-arrow\s*\{[^}]*\}',
        r'\.dropdown-menu\s*\{[^}]*\}',
        r'\.nav-dropdown\.open\s+\.dropdown-menu\s*\{[^}]*\}',
        r'\.dropdown-item\s*\{[^}]*\}',
        r'\.dropdown-item:hover\s*\{[^}]*\}',
        r'\.mobile-menu-btn\s*\{[^}]*\}',
        r'\.ham-line\s*\{[^}]*\}',
        r'\.mobile-menu\s*\{[^}]*\}',
        r'\.mobile-menu\.open\s*\{[^}]*\}',
        r'\.mobile-link\s*\{[^}]*\}',
        r'\.mobile-link:hover\s*\{[^}]*\}',
        r'\.mobile-divider\s*\{[^}]*\}',
        r'\.footer\s*\{[^}]*\}',
        r'\.footer-row\s*\{[^}]*\}',
        r'\.footer-logo\s*\{[^}]*\}\s*\.footer-logo\s+span\s*\{[^}]*\}',
        r'\.footer-logo\s*\{[^}]*\}',
        r'\.footer-logo\s+span\s*\{[^}]*\}',
        r'\.footer-links\s*\{[^}]*\}',
        r'\.footer-links\s+a\s*\{[^}]*\}',
        r'\.footer-links\s+a:hover\s*\{[^}]*\}',
        r'\.footer-copy\s*\{[^}]*\}',
        r'\.back-to-top\s*\{[^}]*\}',
        r'\.back-to-top\.visible\s*\{[^}]*\}',
        r'\.cookie-banner\s*\{[^}]*\}',
        r'\.cookie-banner\.visible\s*\{[^}]*\}',
        r'\.cookie-banner-title\s*\{[^}]*\}',
        r'\.cookie-banner\s+p\s*\{[^}]*\}',
        r'\.cookie-actions\s*\{[^}]*\}',
        r'\.cookie-btn\s*\{[^}]*\}',
        r'\.cookie-accept\s*\{[^}]*\}',
        r'\.cookie-decline\s*\{[^}]*\}',
        r'\.fade-up\s*\{[^}]*\}',
    ]
    for pattern in obsolete_rules:
        text = re.sub(pattern, '', text)

    # Add a single .fade-up.is-visible reveal rule to inline <style> if missing
    # (site.css has it but the old inline .fade-up rule was just opacity:0 with no reveal)
    if '.fade-up' not in text or '.fade-up.is-visible' not in text:
        # We rely entirely on site.css for fade-up now — no need to add inline
        pass

    # Remove the leftover <script> that referenced legacy back-to-top + GSAP scroll animations
    text = re.sub(
        r"<script>(?:(?!</script>).)*(?:backToTop|gsap\.|ScrollTrigger).*?</script>",
        '',
        text,
        flags=re.DOTALL,
    )

    # Final scrub: remove orphan CSS fragments left over from previous removals.
    # Matches a CSS selector followed by EOL or whitespace with no opening brace.
    text = re.sub(
        r'^\s*\.[a-zA-Z][a-zA-Z0-9_\-\.:\(\)\s]*\s*$',
        '',
        text,
        flags=re.MULTILINE,
    )
    # Collapse 3+ consecutive blank lines into one
    text = re.sub(r'\n{3,}', '\n\n', text)

    # ── 2. Remove any leftover <div class="mobile-menu" ...>...</div>
    # (some pages have a separate mobile-menu div outside the header)
    text = re.sub(
        r'\s*<div[^>]*class="mobile-menu"[^>]*>.*?</div>\s*(?=<main|<section|<footer)',
        '\n\n    ',
        text,
        flags=re.DOTALL,
    )

    # ── 3. Replace old <footer class="footer"> ... </footer> with new site-footer
    footer_re = re.compile(
        r'<footer[^>]*class="[^"]*\bfooter\b[^"]*"[^>]*>.*?</footer>',
        re.DOTALL,
    )
    if footer_re.search(text):
        text = footer_re.sub(new_footer(prefix), text, count=1)

    # ── 4. Remove old inline header/footer JS scripts at end of body
    # Match <script>...</script> blocks that reference legacy IDs
    legacy_script_re = re.compile(
        r"<script>(?:(?!</script>).)*(?:getElementById\(['\"](?:header|mobileMenuBtn|mobileMenu|sportsBtn|sportsDropdown|backToTop)['\"]\)|\.querySelector\(['\"]\.mobile-menu).*?</script>",
        re.DOTALL,
    )
    text = legacy_script_re.sub("", text)

    # ── 5. Add site.css link if missing (after first <link rel="stylesheet"> for fonts)
    if "site.css" not in text:
        text = re.sub(
            r'(<link rel="stylesheet" href="https://api\.fontshare\.com[^"]+"[^>]*>)',
            rf'\1\n    <link rel="stylesheet" href="{prefix}site.css">',
            text,
            count=1,
        )
        # Fallback: if no fontshare link, add after viewport meta
        if "site.css" not in text:
            text = re.sub(
                r'(<meta name="viewport"[^>]*>)',
                rf'\1\n    <link rel="stylesheet" href="{prefix}site.css">',
                text,
                count=1,
            )

    # ── 6. Add site.js script before </body> if missing
    if "site.js" not in text:
        text = text.replace(
            '</body>',
            f'    <script src="{prefix}site.js" defer></script>\n</body>',
            1,
        )

    changed = text != original
    if changed:
        path.write_text(text, encoding="utf-8")
    return changed, "ok"


def main():
    root_pages = [
        p for p in ROOT.glob("*.html")
        if p.name != "index.html" and " " not in p.name
    ]
    blog_pages = list((ROOT / "blog").glob("*.html"))

    print(f"Processing {len(root_pages)} root pages and {len(blog_pages)} blog pages...")
    print()

    for p in root_pages:
        changed, msg = process_file(p, in_blog_subdir=False)
        mark = "✓ changed" if changed else "= unchanged"
        print(f"  {mark}  {p.name}")

    print()
    for p in blog_pages:
        changed, msg = process_file(p, in_blog_subdir=True)
        mark = "✓ changed" if changed else "= unchanged"
        print(f"  {mark}  blog/{p.name}")

    print("\nDone.")


if __name__ == "__main__":
    main()
