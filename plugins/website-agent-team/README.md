# Website Agent Team

Плагин для Claude Code: виртуальная команда для создания сайтов. Включает пошаговый мастер с выбором вариантов (цель, структура, дизайн, анимация, защита, фон, контент, бюджет), проверки безопасности, доступности, SEO и производительности, анимированные фоны и готовые секции, фоны и кнопки из библиотеки [OriginKit](https://www.originkit.dev/sections).

## Установка

```
/plugin marketplace add kurbanbesleneev21-cloud/ghgg
/plugin install website-agent-team@website-agent-team
```

## Команды

- `/website-agent-team:new-site [описание]` — пошаговый мастер создания сайта.
- `/website-agent-team:originkit [slug или тип]` — подобрать и добавить секцию/фон/кнопку OriginKit, например `/website-agent-team:originkit hero-02`.

## Навыки

| Навык | Что делает |
| --- | --- |
| `website-team` | Мастер и роли специалистов (дизайн, фронтенд, безопасность, SEO, QA, деплой) |
| `website-engineering` | Цикл: исследование → план → тесты → реализация → ревью → проверка |
| `motion-background-studio` | Оригинальные анимированные фоны (CSS, SVG, Canvas, WebGL) |
| `originkit-ui` | Секции OriginKit (hero-01…hero-71, CTA, pricing, FAQ, footer…), фоны, кнопки, эффекты текста |

## OriginKit: что нужно знать

- Компоненты ставятся CLI: `npx originkit@latest add hero-02` (React/Next.js + Tailwind).
- Первый `add` просит вход через браузер; в CI/контейнере — переменная `ORIGINKIT_API_KEY` (ключ: OriginKit → Profile → API Keys). Ключ не вставляйте в чат и не коммитьте.
- Квота: компоненты 10/день и 30/неделю, секции 10/день.
- Для статических HTML-сайтов плагин предложит воссоздать эффект нативно или перейти на Next.js.
