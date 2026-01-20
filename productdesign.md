# Product Design Document: N8N Subreddit Viewer

## 1. Overview
The **N8N Subreddit Viewer** is a simple, high-fidelity interactive web application designed to curate and display the top six trending discussions from the [r/n8n](https://www.reddit.com/r/n8n/) community. The goal is to provide a focused, aesthetically premium dashboard for users to quickly catch up on the most important topics in the N8N ecosystem without the distraction of the full Reddit interface.

## 2. Goals & Objectives
- **Simplicity**: Display exactly 6 top items—no pagination clutter initially.
- **Aesthetics**: Leverage a "RichPath" / Premium aesthetic (Dark Mode, Glassmorphism, animations) to match the professional nature of N8N workflow automation.
- **Interactivity**: Provide immediate feedback on hover and simple controls to refresh content.

## 3. User Experience (UX)

### 3.1 Target Audience
- N8N Developers
- Workflow Automation Enthusiasts
- System Integrators

### 3.2 User Stories
- "As a user, I want to see the top 6 posts from r/n8n so I can quickly identify trending topics."
- "As a user, I want to easily navigate to the full Reddit thread if a title interests me."
- "As a user, I want the interface to feel modern and responsive, reflecting the quality of the tools I use."

## 4. Functional Requirements

### 4.1 Data Fetching
- The application will fetch data from the Reddit JSON API (e.g., `https://www.reddit.com/r/n8n/top.json?limit=6`).
- No authentication required (public read-only access).
- Error handling for network requests (e.g., "Unable to load feed").

### 4.2 Content Display
For each of the 6 cards, display:
- **Title**: Truncated if necessary, but clear.
- **Score (Upvotes)**: Visually distinct badge.
- **Author**: "u/username".
- **Thumbnail/Icon**: If available, otherwise a default N8N-styled placeholder.
- **Link**: The card itself serves as a link to the Reddit post.

### 4.3 Interactivity
- **Hover Effects**: cards lift ($transform: translateY$) and glow upon hover.
- **Loading State**: Skeleton loaders or a spinner while fetching data.
- **Refresh Control**: An elegant button to re-fetch the latest "Top" data.

## 5. Design & Aesthetics

### 5.1 Color Palette
- **Background**: Deep Void (#0a0a0a) to Slate (#1a1a1a) gradients.
- **Accents**: N8N Orange/Red (#FF6D5A) combined with "RichPath" Electric Blues (#4facfe) for contrast.
- **Cards**: Glassmorphism effect (semi-transparent white/black with blur).

### 5.2 Typography
- **Font Family**: 'Inter' or 'Outfit' (Google Fonts).
- **Headings**: Bold, high contrast.
- **Body**: Clean, legible grey-scale for secondary info (author, date).

## 6. Technical Assembly

### 6.1 Stack
- **HTML5**: Semantic structure.
- **CSS3**: Variables for theming, Flexbox/Grid for layout, keyframe animations.
- **JavaScript (Vanilla)**: `fetch()` API for data, DOM manipulation for rendering.

### 6.2 performance
- Minimal payload (no heavy frameworks).
- Asynchronous data loading.

## 7. Future Considerations
- Filter by "New" or "Hot".
- Integration with an actual N8N workflow to push summary to email.
