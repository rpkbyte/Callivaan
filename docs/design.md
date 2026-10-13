# Callivaan — Visual Design Rules

**Status:** Draft design direction  
**Date:** 13 October 2026  
**Applies to:** Website, Android app, onboarding, notifications, and product-generated text  
**Related documents:** [PRD](ai-call-assistant-prd.md) · [Architecture](architecture.md) · [Project rules](rules.md)

## 1. Design intent

The product should feel calm, dependable, and polished. Its interface should make call activity and the next action clear without visual noise. Use a minimalist layout, generous whitespace, restrained typography, and consistent alignment.

The design is **light mode only**. It uses two brand colors: white and cobalt blue. Neutral grays support readable text and structure; they are not additional brand colors.

## 2. Non-negotiable rules

1. Provide light mode only. Do not create a dark theme or switch colors based on the device's dark-mode setting.
2. Keep the brand palette to white and one accent color: cobalt blue.
3. Use neutral grays only for text hierarchy, borders, disabled controls, and subtle surfaces.
4. Do not use emojis anywhere in the product: app, website, notifications, generated summaries, empty states, onboarding, or marketing copy.
5. Use a consistent line-icon set. Do not use emoji glyphs or decorative Unicode symbols as icons.
6. Prefer clear labels and short sentences over decorative graphics or dense explanatory text.
7. Use color to show hierarchy and interaction. Do not fill every card or section with the accent color.
8. Keep controls and actions predictable across Android and web.

## 3. Color tokens

### Brand colors

| Token | Hex | Use |
|---|---|---|
| `color.brand.white` | `#FFFFFF` | Main page background, cards, input surfaces, and text on cobalt buttons |
| `color.brand.cobalt` | `#3157D5` | Primary buttons, selected navigation, links, focus rings, active states, and small brand accents |

### Neutral support colors

| Token | Hex | Use |
|---|---|---|
| `color.text.primary` | `#172033` | Main body text and headings |
| `color.text.secondary` | `#667085` | Supporting labels and descriptions |
| `color.text.muted` | `#8A94A6` | Low-priority metadata and disabled text; maintain readable contrast where text conveys meaning |
| `color.border` | `#E4E8F0` | Input borders, dividers, and card outlines |
| `color.surface.subtle` | `#F6F8FC` | Selected rows, quiet section backgrounds, and disabled surfaces |

### Functional status colors

Status must not introduce a competing brand palette. Prefer a short text label plus a restrained neutral/cobalt icon. If a clear error or warning requires a conventional status color, use it sparingly and always pair it with text; color alone must never carry meaning.

## 4. Typography

- Use **Inter** for English UI text on web and Android where practical.
- Use **Noto Sans Devanagari** or the platform's equivalent Hindi fallback for Hindi text.
- Use sentence case. Avoid all-caps labels except very short technical status codes.
- Establish hierarchy with size and weight, not extra colors or decorative fonts.
- Keep body text comfortable to read and line lengths short, especially on mobile.
- Use tabular numerals for call duration, counts, and billing amounts when supported.

Suggested type scale:

| Style | Size | Weight | Typical use |
|---|---:|---:|---|
| Display | 32 px | 600 | Website hero heading |
| H1 | 28 px | 600 | Main page title |
| H2 | 22 px | 600 | Major section heading |
| H3 | 18 px | 600 | Card or subsection heading |
| Body | 16 px | 400 | Main copy, form values, call summaries |
| Body small | 14 px | 400 | Supporting descriptions |
| Label | 13 px | 500 | Field labels and metadata |
| Caption | 12 px | 400 | Timestamps and secondary details |

For compact mobile layouts, reduce display and heading sizes proportionally while keeping body text at a comfortable size.

## 5. Layout and spacing

- Use a 4 px spacing base: `4, 8, 12, 16, 24, 32, 40, 48, 64`.
- Use a centered, readable maximum width on web. Avoid stretching settings forms across very wide screens.
- On mobile, use a single-column layout with clear sections and comfortable touch targets.
- Align page titles, cards, form fields, and primary actions to a consistent grid.
- Keep enough whitespace around call summaries so the next action is easy to identify.
- Use a consistent page gutter: approximately 20–24 px on mobile and 32–48 px on desktop, adjusted to viewport width.
- Avoid nested cards, excessive separators, and decorative gradients.

## 6. Shape, elevation, and iconography

- Use restrained corner radii: 8 px for inputs, 10–12 px for cards, and fully rounded only for compact status chips when needed.
- Prefer a thin neutral border over a pronounced drop shadow. Use shadows only to communicate overlay or elevation.
- Use one outline icon family with consistent stroke width and optical size.
- Icons should clarify an action or state. Avoid decorative icons next to every heading.
- Do not use 3D illustrations, emoji art, playful mascots, or busy background patterns in the MVP.

## 7. Component rules

### Buttons

- **Primary:** cobalt fill, white label; one primary action per screen or prominent section.
- **Secondary:** white fill, cobalt label, neutral border.
- **Tertiary:** text-only cobalt action for low-emphasis tasks.
- Disabled buttons use a neutral surface and muted label, with a clear reason where needed.
- Buttons must use action labels such as “Save changes”, “Place test call”, and “View summary”.

### Forms

- Put a visible label above each field; do not rely on placeholder text as the only label.
- Keep help text concise and close to the relevant field.
- Show validation next to the field and explain how to fix it.
- For destructive actions, use a separate confirmation step and name the consequence plainly.

### Cards and lists

- Use white cards on a white page with borders or spacing to distinguish groups; use the subtle neutral surface sparingly.
- A call list row should prioritize caller/business, time, outcome, and one clear next action.
- Do not make every metadata value a badge. Use chips only for a small number of useful states.

### Navigation

- Keep primary navigation short and consistent: Overview, Calls, Agent, Settings, Billing.
- On Android, use familiar native-feeling navigation and preserve system back behavior.
- On web, keep account navigation visible and make billing/support easy to find.

### Loading, empty, and error states

- Use simple skeletons or a small progress indicator; avoid animated decoration.
- Empty states should explain what will appear and offer one next action.
- Error states should state what failed and a recovery action. Never rely on red color or an icon alone.
- Do not include emojis in any state or message.

## 8. Key screen direction

### Overview

- Show one concise primary metric or status, such as calls handled this month or agent status.
- Place the most recent calls below it.
- Keep setup or billing warnings visible but compact.
- Use one prominent action such as “Test your agent”.

### Agent setup

- Organize configuration into small, named sections: Greeting, Language and tone, Business details, What to collect, Escalation, and Call limits.
- Provide a prompt preview and a test-call action.
- Show which configuration version is active and when it was last updated.
- Explain that changes made through WhatsApp require confirmation before becoming active.

### Call detail

- Put the call outcome and concise summary first.
- Show structured caller details only when the caller provided them or the system confidently extracted them.
- Make “Call back” a direct action and show that it opens the device dialer or the configured calling route.
- Keep transcript/recording access hidden unless enabled by the account and supported by the consent/retention settings.

### WhatsApp summary message

- Use a short plain-text structure with no emoji, decorative symbols, or marketing language.
- Include the business/caller context, summary, follow-up action, and link to details.
- Keep uncertainty explicit, for example “Preferred time: not provided”.
- Do not include a full transcript or recording link by default.

### Website pricing

- Compare plans using included minutes, overage/top-up rules, and key features.
- Show billing frequency and total amount clearly; do not hide usage charges in footnotes.
- Keep the trial limitations, cancellation path, and support contact visible.

## 9. Accessibility and responsive behavior

- Meet WCAG AA contrast targets for meaningful text and controls where applicable.
- Every input and icon-only action must have an accessible label.
- Support font scaling and screen readers on Android.
- Use focus indicators on web and visible keyboard focus for interactive elements.
- Never communicate call status, errors, consent, or pricing through color alone.
- Ensure touch targets are large enough for reliable mobile use and spaced to prevent accidental taps.
- Test Hindi and English layouts for line wrapping, long caller names, long phone numbers, and large text settings.

## 10. Motion and interaction

- Keep motion short and functional: opening a panel, confirming a save, or indicating loading.
- Avoid parallax, looping animation, animated gradients, and motion used only for decoration.
- Respect Android animation/accessibility settings where supported.
- Saving a setting should provide a clear text confirmation and update the visible active version.

## 11. Brand voice and copy

- Be calm, direct, and helpful.
- Use plain English or Hindi matching the user's selected language.
- Avoid hype, unnecessary exclamation marks, and conversational filler.
- Use consistent terms: “AI assistant”, “call summary”, “test call”, “included minutes”, and “follow-up”.
- Never use emojis, including in WhatsApp summaries, templates, push notifications, empty states, and marketing pages.

## 12. Design tokens and implementation

Keep design values centralized. Suggested token names:

```text
color.brand.white
color.brand.cobalt
color.text.primary
color.text.secondary
color.text.muted
color.border
color.surface.subtle
font.family.primary
font.family.hindi
font.size.*
space.*
radius.*
shadow.*
```

The website and React Native app should share the same color, type, spacing, and component naming where practical. Do not add a new brand hue or decorative style to a single screen without updating this document and reviewing the effect across both clients.

## 13. Design acceptance checklist

- [ ] Light mode is the only supported appearance.
- [ ] White and cobalt blue are the only brand colors; neutrals support readability and structure.
- [ ] No emoji appears in UI, generated copy, notifications, or website content.
- [ ] The main action is clear on each screen.
- [ ] Text hierarchy relies on size, weight, and spacing rather than extra color.
- [ ] Summary and call status remain understandable without color.
- [ ] Hindi and English layouts remain readable at large text sizes.
- [ ] Website and Android use consistent tokens and interaction language.
