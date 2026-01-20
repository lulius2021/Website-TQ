# Image Assets

This folder contains all static image assets for the TrainQ website.

## Structure

-   **`hero/`**: High-impact images for the hero section (e.g., `hero-main-v1.webp`).
-   **`mockups/`**: App screenshots, device frames, or illustrative mockups.
-   **`sections/`**: Backgrounds or images used in specific content sections (Features, About).
-   **`logos/`**: TrainQ branding assets (SVG preferred).
-   **`icons/`**: Small icon assets if not using an icon font.

## Usage Guide (Plain HTML)

Since this project uses plain HTML/CSS, reference images directly relative to the HTML file:

```html
<!-- Example: Hero Image -->
<img src="images/hero/hero-bg-v1.webp" alt="TrainQ Dashboard" class="hero-img">

<!-- Example: Logo -->
<img src="images/logos/trainq-logo-blue.svg" alt="TrainQ Logo">
```

## Best Practices

-   **Format**: Use `.webp` for photographs/complex images and `.svg` for logos/icons. Use `.png` only if transparency is needed and WebP isn't suitable.
-   **Naming**: Use `kebab-case` (lowercase, hyphens). No spaces or special characters.
    -   ✅ `dashboard-mockup-dark.webp`
    -   ❌ `Dashboard Mockup Final.png`
-   **Size**: Always compress images before adding them. Aim for <100KB for standard images and <300KB for large hero backgrounds.
