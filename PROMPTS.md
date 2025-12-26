# Feature Request: Tag & Category Navigation (Astro)

## Overview
Implement **tag support** across the site and add a persistent **Categories** navigation link that allows users to browse and filter posts by tag. The site is built with **Astro**, so the solution should follow Astro best practices and conventions.

---

## Categories Link (Global UI)
- Add a link labeled **“Categories”** that appears on **every page**.
- Position the link on the **right-hand side** of the layout.
  - Treat this as a global UI element (similar in scope to a header or footer, but aligned to the right).
- The component should:
  - Be implemented as a **shared Astro component** (e.g. included in a base layout).
  - Follow the **existing design system and styles**.
  - Blend naturally into the current codebase—avoid introducing unrelated UI patterns.
- Design this area to be **extensible**, as additional links may be added in the future.

---

## Tag Data Model
- Posts can have **one or more tags**.
- Tags should be defined in frontmatter (e.g. `tags: ["astro", "css", "performance"]`).
- Ensure tags are:
  - Normalized (e.g. lowercase, URL-safe slugs).
  - Deduplicated when generating tag lists.

---

## Categories Page (Tag Index)
- Clicking **Categories** navigates to a dedicated page that lists **all available tags**.
- This page should be:
  - Generated at build time using Astro’s static generation.
  - Implemented using either:
    - `getStaticPaths`, or
    - Astro’s **Content Collections** API (if already in use).
- Tags should be displayed as clickable links that navigate to their respective tag pages.
- The layout and styling should match the rest of the site.

---

## Tag Pages (Filtered Post Lists)
- Each tag should have its own page showing **only posts associated with that tag**.
- Tag pages must support **pagination**:
  - Use the **existing pagination configuration** to determine posts per page.
  - Do not introduce new pagination settings.
- Pagination should:
  - Be implemented using Astro’s built-in pagination helpers.
  - Generate clean, predictable URLs (e.g. `/categories/astro/`, `/categories/astro/2/`).

---

## Routing & Structure
- Suggested routes:
  - `/categories/` → tag index
  - `/categories/[tag]/` → paginated posts by tag
- Use dynamic routes where appropriate.
- Ensure routes are statically generated and SEO-friendly.

---

## Styling & UX
- Reuse existing CSS, utility classes, or design tokens where possible.
- Avoid heavy client-side JavaScript—prefer Astro’s static-first approach.
- Ensure the UI is accessible (keyboard navigation, semantic markup).

---

## Additional Notes
- Favor build-time computation over runtime logic.
- Keep the implementation clean, maintainable, and easy to extend.
- Avoid breaking existing pagination, layouts, or post pages.
