# VoxPilot TOEFL 2026 Study Suite - Design System (`DESIGN.md`)

## 1. Visual Direction: Modern Academic Language Studio

An uncluttered, calm, local-first study studio built for multi-hour TOEFL iBT 2026 preparation across Speaking, Reading, Writing, Listening, and Vocabulary. Surfaces prioritize legibility, clear task hierarchy, and zero visual noise so learners stay focused on timing, audio, and prose.

## 2. Color Tokens (WCAG AA Verified)

All primary text, muted text, and interactive button pairings exceed WCAG 2.1 AA (`>= 4.5:1` for normal text).

### Light Mode (`:root`, default)

| Token | Hex | Role | Verified Contrast |
| --- | --- | --- | --- |
| `--bg` | `#F6F7F9` | Ceramic page canvas | Base |
| `--surface` | `#FFFFFF` | Cards, boards, inputs | Base |
| `--surface-strong` | `#EDF1F5` | Subtle wells, segmented tracks | Base |
| `--ink` | `#141C24` | Primary text & headings | `16.04:1` on `--bg`, `17.19:1` on `--surface` |
| `--muted` | `#475569` | Secondary labels & metadata | `7.58:1` on `--surface` |
| `--line` | `#D4DDE7` | Hairline borders | Non-text divider |
| `--teal` | `#0D7A6F` | Primary accent & active nav | `5.21:1` with `#FFFFFF` |
| `--teal-dark` | `#095D54` | Primary hover & badge ink | `7.76:1` with `#FFFFFF` |
| `--focus-ring` | `#0D7A6F` | Keyboard `:focus-visible` outline | `3px` solid, `2px` offset |

### Dark Mode (`html[data-theme="dark"]`)

| Token | Hex | Role | Verified Contrast |
| --- | --- | --- | --- |
| `--bg` | `#0F141A` | Deep slate studio canvas | Base |
| `--surface` | `#161D26` | Elevated panels & boards | Base |
| `--surface-strong` | `#1E2836` | Subtle wells & controls | Base |
| `--ink` | `#F1F5F9` | Primary text & headings | `16.88:1` on `--bg`, `15.46:1` on `--surface` |
| `--muted` | `#9FB0C3` | Secondary text & metadata | `7.65:1` on `--surface` |
| `--line` | `#2A3747` | Hairline borders | Non-text divider |
| `--teal` | `#2DD4BF` | Primary accent | `9.57:1` with `#071B18` button ink |
| `--teal-dark` | `#14B8A6` | Hover & progress accents | High contrast on dark |
| `--focus-ring` | `#2DD4BF` | Keyboard `:focus-visible` outline | `3px` solid, `2px` offset |

## 3. Navigation Architecture

To eliminate flat 13-tab cognitive overload, primary navigation is grouped into three semantic clusters:

1. **Speaking**: Start Easy, Ladder, Speaking Studio, Full Sim
2. **2026 Skills**: Reading 2026, Writing 2026, Listening, Vocab & Ideas, Band & Plans
3. **Workspace**: Prompt Bank, Error Log, History, Setup

On screens below `768px`, the grouped bar collapses cleanly behind a labeled `Menu` toggle showing the active tab name so mobile viewports stay clutter-free with zero horizontal overflow.

## 4. Accessibility & Interaction Standards

- **Touch Targets**: All buttons, nav tabs, inputs, and selects meet a `44px` minimum target height.
- **Keyboard Focus**: Every focusable element uses a visible `3px` `:focus-visible` outline (`outline: none` is prohibited). A skip-to-content link leads directly to `#main-content`.
- **Keyboard Shortcuts**: Complete-the-Words advances to the next blank on `Enter`/`Space`; Vocab SRS supports `Space` (reveal) and `1`-`4` (Again/Hard/Good/Easy).
- **Reduced Motion**: `@media (prefers-reduced-motion: reduce)` disables animations and transitions.
- **Theme Persistence**: Theme selection (`light` / `dark`) persists in `localStorage` under `toefl-suite-theme-v1` and respects `prefers-color-scheme` on first visit.
