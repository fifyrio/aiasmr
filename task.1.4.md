# AIASMR Video – Blog Page Requirements

## 🎯 Purpose

Provide users with educational and inspirational content about creating ASMR videos using AI. The blog aims to drive engagement, showcase expertise, and support SEO through structured articles and media-rich posts.

---

## 1. Page Layout & Structure

### 1.1 Page Header
- Title: `Blog`
- Subtitle: `Explore guides, tips, and insights for creating stunning ASMR videos with AI technology`
- Centered and styled with gradient or subtle animation for modern appearance

### 1.2 Blog Post Grid
- Blog articles displayed in card layout (single-column on mobile, multi-column on desktop)
- Each card includes:
  - **Thumbnail Image** (e.g., cutting an ice ball)
  - **Post Type Label** (e.g., “Video” badge)
  - **Published Date** (e.g., “Jun 27, 2025”)
  - **Title**: e.g., “How to Create ASMR Videos with AI”
  - **Excerpt**: e.g., “Generate stunning ASMR videos from text prompts using cutting-edge AI technology”
  - **CTA Link**: “Read more →” leads to full blog post

---

## 2. Functional Requirements

| Component          | Description |
|--------------------|-------------|
| Responsive Layout  | Cards adjust layout based on screen size (e.g., 1 column on mobile, 2–3 on desktop) |
| Tag/Type Badge     | Small badge indicating post type (e.g., "Video", "Tutorial", "News") |
| Date Formatting    | Human-readable publication date |
| Navigation Link    | “Read more” links to full article page `/blog/:slug` |
| Hover Effects      | Subtle scale or glow on hover for blog cards |
| SEO Metadata       | Structured data (title, description, publish date) per article |

---

## 3. Article Content Structure (on Post Detail Page)

Each article should include:
- Hero image or embedded video
- Title & date
- Author attribution (optional)
- Body content: headings, paragraphs, lists, code snippets if needed
- Embedded images or videos
- Related articles section at the bottom
- “Back to Blog” link

---

## 4. Backend & Data Model

- **BlogPost**:
  - `id`
  - `title`
  - `slug`
  - `published_at`
  - `excerpt`
  - `content` (HTML or MDX)
  - `thumbnail_url`
  - `tag` (e.g., video, tutorial)
  - `status` (draft/published)

- API Endpoints:
  - `GET /api/blog` – list of articles
  - `GET /api/blog/:slug` – fetch post detail
  - (Optional) `GET /api/blog/tags` – available tags/categories

---

## 5. Non-Functional Requirements

- **SEO Optimized**: Structured article metadata for indexing
- **Performance**: Fast load of blog previews, lazy loading for images
- **Accessibility**: Alt text for images, readable font sizes
- **Security**: Only authenticated admins can publish/edit blog posts (CMS)

---

## 6. Future Enhancements

- Full-text search or keyword filtering
- Pagination or infinite scroll for large archives
- Newsletter subscription integration
- Comment system (moderated)
- Author profiles
- Related tags or categories

---

## 🎯 Summary

The Blog page supports AIASMR Video’s brand as an expert in AI-generated ASMR content. Through visually appealing posts and high-quality content, it nurtures users, improves discoverability, and increases session time across the platform.
