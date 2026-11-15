---
description: Подобрать и добавить секцию, фон или кнопку из OriginKit (например hero-02)
argument-hint: "[slug или что нужно: hero-02 | фон | кнопки | pricing ...]"
---

Используй навык `originkit-ui`.

Запрос: $ARGUMENTS

1. Определи стек проекта (React/Next.js + Tailwind или статический HTML).
2. Если указан slug (например `hero-02`) — открой https://www.originkit.dev/sections/<slug> или найди его через `npx originkit@latest search`, кратко опиши и подтверди выбор. Если указан тип («фон», «кнопки», «pricing») — предложи 3–5 реальных кандидатов кнопками со ссылками на превью.
3. React/Next.js: `npx originkit@latest add <slug> --dry-run`, затем после подтверждения — `add`. Подставь реальный контент, проверь сборку.
4. Статический HTML: предложи выбор — воссоздать эффект нативно (HTML/CSS/JS, оригинальный код), перейти на Next.js или встроить React-«остров».
5. Не проси API-ключ в чате; объясни вход через браузер / `ORIGINKIT_API_KEY` и дневную квоту.
6. Отчитайся о проверках: PASS / FAIL / BLOCKED / NOT RUN.
