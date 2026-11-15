---
name: motion-background-studio
description: "Use when designing or implementing animated backgrounds, ambient motion, hero-section loops, particles, abstract visuals, kinetic backgrounds, or motion-graphics prompts for websites and web apps."
---

# Motion Background Studio

Create original, polished motion backgrounds for websites and web apps. This workflow is inspired by the public example-and-prompt format of Prompt Motion (https://prompt-motion.com/): study motion categories and techniques, then write an original brief and implement it for the user's actual site. Prompt Motion is a curated inspiration library, not a video-generation API. Do not claim it renders or exports assets for us.

## First classify the requested output

- **Live website background:** implement with CSS, SVG, Canvas 2D, WebGL/Three.js, or an existing project animation stack.
- **Seamless loop video:** create a production brief/prompt for a video generator or implement a render composition with Remotion/another installed tool when available.
- **Static background image:** create an image-generation prompt or use the available image-generation capability when explicitly requested.
- **Motion reference/prompt only:** deliver a precise, reusable prompt with timing, layers, palette, camera, easing, and loop behavior.

Do not substitute a video or static image when the user asked for a live, editable website background. Do not imply a prompt alone generates an asset.

## Ready-made option: OriginKit

If the user prefers a ready-made animated background or hero over an original one, use the `originkit-ui` skill (OriginKit components installed with the `originkit` CLI for React/Next.js + Tailwind). For static HTML sites, build an original native implementation that uses the OriginKit preview only as inspiration.

## Discovery and creative direction

Inspect the existing website, framework, design tokens, target section, and performance constraints before selecting a technique. Ask only for missing information that materially changes the result; otherwise make sensible defaults and state them.

Use these inspiration categories as a vocabulary, not as a fixed template:
- gradients, light fields, aurora, mesh and liquid flows;
- particles, stars, dust, sparks, bubbles and connected nodes;
- geometric shapes, morphing forms, ribbons and abstract 3D;
- atmospheric scenes, clouds, fog, waves and parallax;
- product/UI-inspired lines, grids, charts and data flows;
- kinetic typography and restrained logo/brand reveals.

Create an original concept tailored to the brand. Never copy a creator's complete prompt, video, code, or distinctive composition from a Prompt Motion entry. Credit and link references when the user explicitly asks to reproduce or study a particular public example; respect the creator's stated terms.

## Motion brief schema

For each concept, specify:
1. Purpose and placement (hero, page-wide, card, footer, loading state).
2. Mood and visual metaphor.
3. Palette and contrast against foreground content.
4. Layers and depth (foreground, midground, background).
5. Motion behavior (direction, speed, amplitude, easing, interaction).
6. Duration and loop (seamless loop, no visible jump; avoid unnecessary motion).
7. Responsive behavior and reduced-motion fallback.
8. Technical method, estimated runtime cost, and acceptance checks.

Offer 2-3 genuinely distinct directions only when the user is exploring concepts. Otherwise implement one coherent direction.

## Implementation selection

Prefer the lightest technique that meets the brief:
- CSS gradients/transforms for simple ambient movement.
- SVG for crisp vector shapes and path animation.
- Canvas 2D for many lightweight particles or procedural effects.
- WebGL/Three.js for complex shader, depth, or 3D scenes; avoid adding it for a simple gradient.
- Remotion or another video renderer only when a rendered video is the requested deliverable and the toolchain exists.

Reuse installed dependencies and project conventions. Avoid adding packages unless necessary. Keep decorative layers behind content, non-interactive (`pointer-events: none`), and isolated from layout where possible.

## Quality, accessibility and performance

- Respect `prefers-reduced-motion`; provide a static or greatly reduced-motion state.
- Keep text contrast and focus indicators readable; never place essential information only in the animation.
- Pause or reduce animation when the page is hidden or the component is offscreen where practical.
- Avoid excessive particles, large blur filters, continuous expensive layout changes, and unnecessary GPU work.
- Animate transforms and opacity where possible; use bounded frame rates and device-aware particle counts.
- Prevent horizontal overflow, flashing, seizure-risk patterns, and distracting movement.
- Provide graceful fallbacks for unsupported APIs and low-power devices.
- Ensure the animation does not block clicks, scrolling, or keyboard interaction.

## Verification checklist

Report each check as PASS, FAIL, BLOCKED, or NOT RUN:
- Visual fit with the site's typography, palette, and content.
- Desktop and mobile layout; portrait and landscape where relevant.
- Reduced-motion behavior.
- Contrast, keyboard/focus behavior, and pointer interaction.
- CPU/GPU and memory impact; no runaway animation loops.
- Loop seam and timing, if a loop is requested.
- Build, lint, typecheck, and tests when available.

Do not claim performance measurements or browser tests unless actually run. Do not deploy or modify production assets without the user's authorization.

## Prompt Motion research protocol

When a user asks for inspiration or a prompt based on Prompt Motion, browse https://prompt-motion.com/ and inspect relevant public examples/categories. Treat each page's prompt and video as creator-owned material. Summarize techniques in your own words and write a new prompt specific to the user's brand, dimensions, target platform, and desired motion. Do not scrape the site at scale or assume an official API, package, or installation workflow exists.

## Final handoff

Summarize the concept, implementation method, files changed, how to customize palette/speed/intensity, reduced-motion fallback, and exact verification results. If only a prompt was produced, label it clearly as a prompt—not a rendered background.
