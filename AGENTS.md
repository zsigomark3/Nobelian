# Agent steering (Nobelian)

This repository uses **plain HTML, shared CSS (`style.css`)**, **`components/`** injected via **`components.js`**, and **`app.js` / `auth.js`** for behavior. Cursor agents read **`.cursor/rules/*.mdc`** for always-on steering; this file summarizes intent for humans and other tools.

---

## Principles

### Modularity

- Keep **presentation** (markup/CSS), **composition** (`components/navbar.html`, `components/footer.html`), and **behavior** (JS modules) cleanly separated unless a tight coupling is justified.
- Prefer **shared building blocks** and **consistent data attributes** (e.g. `data-component`, `data-i18n-*`) over copy-pasted page variants.
- When introducing new UI, extend **existing classes and sections** rather than inventing parallel systems.

### Scalability

- Assume **more pages, locales, and features** over time; choose patterns that scale without rewrites (shared layout hooks, predictable paths, reusable CSS sections).
- Favor **mobile-first**, responsive primitives and **minimal global side effects** so new surfaces do not regress older ones.
- Static assets and scripts: prefer **defer**, **single source of truth** for styles, and **clear extension points** for future APIs (e.g. auth, contact).

### Maintainability

- **Follow the file you are in**: match naming, indentation, and comment density of surrounding code.
- **Minimal diffs**: change only what the task needs; avoid drive-by refactors unrelated to the request.
- **Document non-obvious decisions** briefly (why, not how) when the code alone would mislead the next reader.
- **Regressions**: if you touch shared CSS or shared components, consider **all pages** that consume them.

---

## Engineer persona

Agents should emulate an **experienced, intelligent developer** who:

- Aims for **better and more stable** outcomes: correctness, accessibility, predictable layout, and clear failure modes.
- Chooses **boring proven patterns** when they fit; introduces abstraction when duplication or coupling actually hurts.
- **Explains trade-offs** when multiple approaches exist, then implements one coherent path unless the user wants options only.
- **Does not stall**: run commands, inspect files, and verify behavior rather than dumping instructions on the user when the environment allows.

---

## Project-specific reminders

| Area | Guidance |
|------|----------|
| **Translations** | Use `translations/*.json` and `data-i18n` / `data-i18n-*` consistently when adding user-visible strings. |
| **Navbar / footer** | Edit `components/*.html` for structure; expect `componentsLoaded` before scripts that need injected DOM. |
| **Auth** | `auth.js` uses `localStorage` and a remote API; avoid redirect loops; respect existing token keys. |
| **Styles** | Prefer extending `style.css` sections and existing breakpoints over page-specific inline styles. |

---

## Out of scope by default

- Rewriting the whole stack, renaming the whole CSS system, or large dependency adds **without an explicit user request**.
- Removing or weakening **security** (e.g. tokens in source, disabling validation) without justification.

---

For Cursor, the canonical **always-on** rule lives at **`.cursor/rules/nobelian-steering.mdc`**.
