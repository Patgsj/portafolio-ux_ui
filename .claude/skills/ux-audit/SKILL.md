---
name: ux-audit
description: Professional UX and landing page audit. Identifies the top critical quality issues and proposes/implements fixes directly in this repo. Use when auditing this portfolio site for professionalism and craft.
argument-hint: [url-or-path]
source: https://github.com/thedesignproject/agent-skills (skills/ux-audit), adapted for in-place use on this repo
---

# UX & Landing Page Auditor

Act as a senior fullstack engineer with a sharp design eye. The goal is NOT conversion optimization — it's **professional craft**: consistent, clean, intentional design that a discerning visitor would find polished rather than "vibecoded."

## Adaptation note for this repo

The upstream version of this skill scaffolds a brand-new `demo-sales-{project}` folder, curls a *third-party* site's HTML/CSS to reverse-engineer its design tokens, and pushes to a new GitHub repo. None of that applies here — this is our own single-file app (`src/app/App.tsx`, tokens already defined in `src/styles/theme.css`), not an external site to scrape. For this repo:

- Skip the brand-extraction curl/screenshot pipeline — read the actual source (`App.tsx`, `theme.css`) instead of scraping a live page.
- Skip creating a separate `demo-sales-*` folder or a new GitHub repo — propose edits in place, using Edit/Read on the existing files.
- Skip the automatic `git push`/`gh repo create` steps entirely — this repo already has a deploy flow (push to `main` → Vercel), and per project + session rules changes are committed/pushed only when the user explicitly asks.

## Workflow

1. **Survey**: Read `src/app/App.tsx` and `src/styles/theme.css` (and any relevant section component) to understand current structure, tokens, and copy.
2. **Audit** against the 9 craft dimensions below.
3. **Report the top 3 issues** before touching any code — short, direct, one sentence each on what's wrong and why it matters.
4. **Propose or apply fixes** (ask first if the change is structural/large) directly in the existing files, matching this project's existing conventions (arbitrary-value Tailwind classes, square corners, Barlow/Barlow Condensed/DM Mono type system — see `frontend-design` skill's project notes).
5. Do not commit or push unless the user explicitly asks.

## 9 Craft Dimensions

1. **Typography** — consistent type scale, sensible line-height/measure, no orphaned font sizes, real hierarchy between heading levels.
2. **Color & contrast** — cohesive palette, sufficient contrast (see `accessibility` skill), no accidental clashing accents.
3. **Spacing & rhythm** — consistent spacing scale, no cramped or randomly-gapped sections, intentional whitespace.
4. **Layout & grid** — content aligns to a clear grid, consistent gutters/margins across breakpoints.
5. **Responsive behavior** — no overflow, broken wrapping, or illegible text at mobile/tablet/desktop widths.
6. **Imagery & assets** — appropriately cropped/sized images, no stretched or low-res assets, consistent treatment (radius, shadow, border) across similar elements.
7. **Component consistency** — buttons, links, cards, and other repeated elements look and behave the same way everywhere they appear.
8. **Copy & content clarity** — headings and labels are clear and non-generic; no filler/lorem-ipsum-feeling text; tone matches the honest, non-hype positioning already established for this portfolio.
9. **Interaction & motion** — hover/focus states exist and feel intentional, transitions are smooth and not excessive, `prefers-reduced-motion` is respected.

## Output format

```
## Top 3 Issues

1. [Issue title]
   [One sentence: what's wrong and why it matters]

2. [Issue title]
   [One sentence]

3. [Issue title]
   [One sentence]
```

Then proceed to fixes, narrating what's being changed and why as you go.
