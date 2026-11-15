---
name: originkit-ui
description: "Use when a website needs ready-made animated sections or UI pieces from OriginKit (https://www.originkit.dev): hero sections (hero-01…hero-71, e.g. hero-02 app hero with phone mockups), animated backgrounds, buttons, text effects, features, pricing, testimonials, stats, CTA, FAQ, footer or contact sections. Covers finding, previewing, installing with the `originkit` CLI into React/Next.js + Tailwind projects, and adapting them for plain HTML/CSS/JS sites."
---

# OriginKit UI — sections, backgrounds, buttons

OriginKit (https://www.originkit.dev) is a free animated component library. Its CLI
(`originkit`, MIT, npm) works like `shadcn`: it downloads clean **Next.js / React + Tailwind**
source into the project and installs the npm packages the component needs. Nothing from
OriginKit stays in the runtime dependency tree.

Use this skill together with `website-team` (design step and background step) and
`motion-background-studio` (when a live animated background is wanted).

## Catalogue

Site pages to browse and to show the user as references:

| What | URL |
| --- | --- |
| All sections (sort: `?sort=trending`, `?sort=new`, `?sort=copied`) | https://www.originkit.dev/sections |
| Hero sections (≈71: `hero-01` … `hero-71`) | https://www.originkit.dev/sections/category/hero |
| Features | https://www.originkit.dev/sections/category/features |
| Pricing | https://www.originkit.dev/sections/category/pricing |
| Testimonials | https://www.originkit.dev/sections/category/testimonials |
| Stats | https://www.originkit.dev/sections/category/stats |
| Call to action | https://www.originkit.dev/sections/category/cta |
| FAQ | https://www.originkit.dev/sections/category/faq |
| Footer | https://www.originkit.dev/sections/category/footer |
| Contact | https://www.originkit.dev/sections/category/contact |
| Single section page | `https://www.originkit.dev/sections/<slug>` (e.g. `/sections/hero-02`) |

Style tags on the site: Light, Dark, Colorful, Minimal, Gradient, Futuristic, Enterprise.

Example: **hero-02** is "App Hero Section with Phone Mockups". It suits mobile apps and SaaS
landing pages.

Backgrounds, buttons, text effects and other small UI pieces are registry **components**
(for example `globe`, `fade-text`). Find them with the CLI instead of guessing slugs:

```bash
npx originkit@latest search background
npx originkit@latest search button
npx originkit@latest list --kind component
npx originkit@latest list --kind section --category hero
npx originkit@latest list --json          # machine-readable
```

## Wizard integration (button-first)

When the `website-team` wizard reaches **Step 3 (Design)**, **Step 6 (Background)** or the
section and button choices in **Step 2**, also offer:
- `Готовая секция OriginKit`: pick a hero, CTA or pricing section by style tag;
- `Анимированный фон OriginKit`: pick a background component;
- `Кнопки и эффекты OriginKit`: buttons, hover effects, text animations;
- `Сделать своё (оригинальное)`: hand off to `motion-background-studio`.

Offer 3–5 concrete candidates as choices, each with its slug and its page link, so the user
can open the preview. Never invent slugs. Take them from `search`/`list` output or from
pages you actually opened.

## Installing (React / Next.js projects)

1. Check the stack first: a `package.json` with `react` / `next`, Tailwind configured, and the
   lockfile that names the package manager.
2. Optionally pin paths with `npx originkit@latest init` (writes a committable
   `components.json`; make `alias` match `tsconfig.json` paths).
3. Preview without writing: `npx originkit@latest add <slug> --dry-run`.
4. Install: `npx originkit@latest add <slug>`. Use `--<preset>` (e.g. `--dark`) for a style
   preset, `--no-deps` to skip the install step, `-o` only with permission to overwrite.
5. Sections go to `components/originkit/<slug>` (or `src/components/originkit/<slug>`).
   UI components go to `…/ui/<slug>`. Import from `@/components/originkit/...`.
6. Replace the placeholder copy, images and links with the user's real content, and
   mark unknown facts as placeholders.
7. Run the project's build, lint and typecheck, then check the result in a browser at
   desktop and mobile widths.

Package manager equivalents: `pnpm dlx originkit@latest …`, `yarn dlx originkit@latest …`,
`bunx --bun originkit@latest …`.

## Authentication and quota (tell the user plainly)

- The first `add` signs in through the browser (OAuth). The session is stored in
  `~/.originkit/auth.json`. In containers, CI or SSH, set `ORIGINKIT_NO_BROWSER=1` to print the
  URL, or use an API key from **OriginKit → Profile → API Keys** in the
  `ORIGINKIT_API_KEY` environment variable.
- Never ask the user to paste the API key into chat, and never commit it. The `.originkit`
  key file written by `init` is added to `.gitignore` automatically. Keep it that way.
- Delivery quota (shared with website copies): components 10/day and 30/week, sections
  10/day. `--dry-run`, `list`, `search` and `whoami` are the cheap way to explore. Do not
  install candidates "just to look"; let the user pick from the website preview first.
- Outside a TTY, `add` fails with instructions instead of prompting. Report that error
  as BLOCKED with the exact next step for the user.

## Plain HTML / CSS / JS sites (no React)

OriginKit delivers React + Tailwind source, so it cannot be dropped into a static
`index.html`. Offer the user a choice:
1. **Rebuild the effect natively**: keep the site static and implement a similar layout or
   motion with HTML/CSS/vanilla JS (or Canvas/SVG via `motion-background-studio`).
   Treat the OriginKit page only as visual inspiration and write original code. Do not
   paste delivered source with React and Tailwind removed and call it a port.
2. **Move to Next.js/React + Tailwind**: worth it when several sections or components are
   wanted. Plan this as a migration and get approval first.
3. **Isolated React island**: a small Vite/React bundle mounted in one container. Use it only
   when the user wants exactly one complex component.

## Quality checks after adding

- Respect `prefers-reduced-motion`. Keep decorative layers `pointer-events: none` and behind
  content.
- Contrast of text over animated or gradient backgrounds. Visible keyboard focus on buttons.
- Real `<a href>` / `<button>` semantics for CTAs, with clear labels and no fake links.
- Bundle impact (heavy deps such as three.js or large motion libraries). Lazy-load below-fold
  sections.
- No horizontal overflow at 320–400 px width.

Report each check as PASS, FAIL, BLOCKED or NOT RUN. Do not claim it passed unless it actually ran.

## License and attribution

The CLI is MIT. Check the license and pricing terms on originkit.dev for the delivered
component source before commercial use. Do not claim "free for commercial use" without
checking.
