---
name: "Sentra KI — P2KI Unisba"
description: "Institutional navy, champagne gold, editorial display and practical Indonesian service interfaces."
colors:
  navy-950: "#080f1a"
  navy-900: "#101e30"
  navy-700: "#294660"
  gold-600: "#785826"
  gold-400: "#d8b777"
  gold-300: "#ebd3a2"
  bg-page: "#f7f8f9"
  bg-card: "#ffffff"
  bg-subtle: "#eef1f4"
  border: "#dde3e9"
  border-strong: "#c4ced8"
  text-heading: "#182b3f"
  text-body: "#3d4f61"
  text-muted: "#596b7c"
  text-on-dark: "#eef2f6"
  text-on-dark-muted: "#b9c8d8"
  blue-600: "#294d70"
  blue-500: "#3c6285"
  blue-100: "#e2eaf1"
  blue-50: "#f0f4f8"
  emerald-700: "#047857"
  emerald-100: "#d1fae5"
  emerald-50: "#ecfdf5"
  amber-700: "#b45309"
  amber-100: "#fef3c7"
  amber-50: "#fffbeb"
  rose-700: "#be123c"
  rose-100: "#ffe4e6"
  rose-50: "#fff1f2"
typography:
  display:
    fontFamily: "Manrope, system-ui, sans-serif"
    fontSize: "clamp(3.2rem, 7vw, 6rem)"
    fontWeight: 700
    lineHeight: 1.08
    letterSpacing: "-0.035em"
  headline:
    fontFamily: "Manrope, system-ui, sans-serif"
    fontSize: "clamp(2rem, 3.5vw, 3.5rem)"
    fontWeight: 700
    lineHeight: 1.15
    letterSpacing: "-0.035em"
  page-title:
    fontFamily: "Manrope, system-ui, sans-serif"
    fontSize: "clamp(1.7rem, 3vw, 2.4rem)"
    fontWeight: 650
    lineHeight: 1.22
    letterSpacing: "-0.02em"
  title:
    fontFamily: "Manrope, system-ui, sans-serif"
    fontSize: "20px"
    fontWeight: 650
    lineHeight: 1.4
    letterSpacing: "-0.02em"
  catalogue-heading:
    fontFamily: "Manrope, system-ui, sans-serif"
    fontSize: "24px"
    fontWeight: 650
    lineHeight: 1.3
    letterSpacing: "-0.02em"
  body:
    fontFamily: "Manrope, system-ui, sans-serif"
    fontSize: "16px"
    fontWeight: 400
    lineHeight: 1.6
  label:
    fontFamily: "Manrope, system-ui, sans-serif"
    fontSize: "13.5px"
    fontWeight: 700
    lineHeight: 1.6
rounded:
  sm: "6px"
  md: "10px"
  lg: "12px"
  xl: "16px"
  full: "8px"
spacing:
  small: "8px"
  control: "16px"
  field-gap: "20px"
  card: "24px"
  column: "32px"
  wide: "48px"
  section-mobile: "64px"
  section: "104px"
components:
  button-primary:
    backgroundColor: "{colors.navy-900}"
    textColor: "{colors.text-on-dark}"
    rounded: "{rounded.sm}"
    padding: "13px 24px"
    height: "48px"
  button-primary-hover:
    backgroundColor: "{colors.navy-700}"
  button-gold:
    backgroundColor: "{colors.gold-300}"
    textColor: "{colors.navy-950}"
    rounded: "{rounded.sm}"
    padding: "10px 16px"
    height: "44px"
  button-gold-hover:
    backgroundColor: "{colors.gold-400}"
  link-text:
    textColor: "{colors.navy-700}"
    height: "44px"
  input:
    backgroundColor: "{colors.bg-page}"
    textColor: "{colors.text-heading}"
    rounded: "{rounded.md}"
    padding: "12px 16px"
    width: "100%"
  navigation:
    backgroundColor: "{colors.navy-950}"
    padding: "12px 10px"
  filter-chip:
    backgroundColor: "{colors.blue-50}"
    textColor: "{colors.blue-600}"
    rounded: "{rounded.full}"
    padding: "4px 10px"
    height: "44px"
  directory-card:
    backgroundColor: "{colors.bg-card}"
    textColor: "{colors.text-heading}"
    rounded: "{rounded.lg}"
    padding: "24px"
  portfolio-tab:
    textColor: "{colors.text-muted}"
    padding: "16px 24px"
    height: "70px"
  portfolio-tab-selected:
    backgroundColor: "{colors.bg-page}"
    textColor: "{colors.text-heading}"
---

# Design System: Sentra KI — P2KI Unisba

## Overview

**Creative North Star: "The Academic Atlas"**

The Academic Atlas is a descriptive name for the implemented visual world, not a claim that the owner approved this wording. P2KI UNISBA (Sentra KI) combines a deep institutional frame, champagne gold accents, white reading surfaces and one modern sans family across all headings and interface text. The owner-supplied P2KI marks lead the identity; Unisba and LPPM marks keep their original shapes; custom rounded SVG pictograms carries the service identity.

The home page is expressive through scale, whitespace and finite movement. Directory, detail and registration interfaces keep a quieter density suited to reading, filtering and form completion. The balanced motion prominence is an implementation assumption; the optional owner preference remained unanswered. This document records the finished code, with source tokens taking precedence over earlier plans.

**Key Characteristics:**
- Institutional navy and restrained champagne gold.
- Manrope 700 for all display headings; Manrope for interface and data.
- Ruled records, lightly rounded controls and factual Indonesian copy.
- Finite, cancellable animation with a static reduced-motion path.

## Colors

The palette combines deep blue-black institutional surfaces with warm champagne accents and cool white reading areas. The frontmatter records the effective cascade, rather than the older base palette.

### Primary

- **Institutional Navy:** `navy-950` frames the header, home opening and footer; `navy-900` supports primary actions and the closing section; `navy-700` handles action hover and text links.
- **Champagne Gold:** `gold-300` carries light-on-navy display and gold action surfaces; `gold-400` supplies active navigation rules and hover; `gold-600` is the darker gold for light-surface marks, tab selection and focus.

### Secondary

- **Slate Blue:** the `blue` tokens support form focus and directory filter controls. They are a functional extension of the institutional palette.
- **Semantic Status:** emerald, amber and rose distinguish granted, process and rejection/withdrawal, accompanied by text. The recorded 700/100/50 sets are the recurring status foreground, border and background combinations.

### Neutral

- **Reading White / Cool Paper / Subtle Paper:** `bg-card`, `bg-page` and `bg-subtle` distinguish content, page and supporting surfaces.
- **Ink / Body Ink / Muted Ink:** `text-heading`, `text-body` and `text-muted` separate hierarchy on light surfaces.
- **Light Ink / Muted Light Ink:** `text-on-dark` and `text-on-dark-muted` provide the navy surface text hierarchy.
- **Fine Rule / Strong Rule:** `border` and `border-strong` separate cards, portfolio records and service rows.

**The Surface Pairing Rule.** Use the on-dark text tokens on navy, and heading/body/muted tokens on light reading surfaces.

## Typography

**Opening Display Font:** Manrope (system-ui, sans-serif fallback), bold (700).
**Section Display Font:** Manrope (system-ui, sans-serif fallback), bold (700).
**Body Font:** Manrope (system-ui, sans-serif fallback), variable weights (400–800).

The Manrope Latin WOFF2 file is served locally with `font-display: swap`. Origins and OFL license files are recorded in `public/fonts/README.md`; they are not runtime Google Fonts dependencies.

### Hierarchy

- **Display:** the frontmatter display role governs the modern sans opening, as requested by the owner. At tablet width it becomes `clamp(3.2rem, 9vw, 5.5rem)`; at phone width `clamp(2.8rem, 11.6vw, 4rem)` with line-height (1.1). At widths up to (360px), it is (2.375rem). These are home-specific adaptations.
- **Headline:** the frontmatter headline role governs home section titles; phone sections use (2rem). The closing title has its own observed scale, `clamp(2.2rem, 4vw, 4rem)` with line-height (1.1), becoming (2.5rem) on phones.
- **Page title:** the task-page role uses Manrope, keeping editorial scale away from forms and filters.
- **Title:** service and journey headings use (20px) and line-height (1.4); the service title becomes (17px) on phones. Their weight inherits the heading rule (650). Portfolio record titles instead use weight (600), `clamp(1.3rem, 2.2vw, 2rem)` and line-height (1.4).
- **Catalogue heading:** Academy section headings use (24px / 650); module titles use (20px), descriptions (16px), and edition metadata (13.5px). The catalogue inherits the same navy/gold palette and reading surfaces.
- **Body:** base text follows the frontmatter role. Descriptions use line-height (1.75), with task descriptions limited to (70ch); home supporting copy uses (60ch). Smaller contextual copy uses (14–15px).
- **Label:** form labels follow the recorded label role. Shared nav is (12px), brand title (16px / 750), metadata (12px), and actions (14px / 650). Inputs use (14px) on desktop and (16px) on phones. Counts and years use tabular numerals.

**The One Typeface Rule.** Use Manrope for every heading, task, label, record and number; display headings use weight 700. Do not reintroduce serif headings.

## Layout

Header and footer backgrounds span the viewport. The header's inner frame has a maximum width of (1440px) and height of (80px), becoming (72px) on phones. The desktop menu gives way to a focus-managed drawer at widths up to (1360px).

Home content uses a centered maximum width of (1280px) with a total horizontal subtraction of (96px), reduced to (48px) at (900px) and (40px) at (640px). Home sections use generous vertical spacing from the frontmatter section steps. Heading and closing grids use (1.3fr / 1fr) and collapse into one column on phones. The category navigation changes from four columns to two. Search becomes a two-column icon/input row with a full-width button below.

Task pages use a (1280px) container with padding (36px 24px 72px); narrow content has a maximum width of (880px). Directory filters and form columns stack at (900px). Directory cards use two `minmax(0, 1fr)` columns and one at (640px), with zero minimum inline sizes and wrapping on long titles. Inventor/faculty metadata retains a single-line ellipsis; the detail route supplies the fuller record. Form-card padding changes from (40px) to (24px 18px) on phones.

Spacing entries are extracted recurring measurements, not an existing CSS variable scale. Preserve the distinction between dense field spacing, card inset and generous editorial section spacing.

## Elevation & Depth

The reviewed home, directory and registration surfaces express depth through navy/white alternation, subtle paper fills and ruled separation. Directory cards, form cards, filter disclosures, patent summaries, detail containers and learning modules have no box shadow. The broader legacy stylesheet still contains its diffuse shadow scale; this pass does not establish a global no-shadow rule.

### Shadow Vocabulary

- **Dropdown separation:** `0 16px 40px rgba(8,15,26,.20)` separates the navigation popup from the dark frame.
- **Control focus:** `0 0 0 3px var(--blue-100)` accompanies the slate-blue field border. It is state feedback, not ambient elevation.
- **Legacy diffuse tokens:** `shadow-glow-blue` and `shadow-glow-gold` now both resolve to `0 8px 22px rgba(16,30,48,.10)`; these retained names do not authorize decorative glow.

**The Ruled Record Rule.** Separate home portfolio leaves and service rows with rules and tonal surfaces; keep reviewed directory cards and form containers free of ornamental shadows.

## Shapes

Controls have lightly rounded corners; task cards and forms use the larger recorded radii. The inherited token named `full` now resolves to (8px), so it describes softly rectangular badges rather than pills. Search uses (8px), its internal action (5px), standard premium actions (6px), fields (10px), directory cards and portfolio marks (12px), and form containers (16px).

Fine rules frame the content; the P2KI icon pack uses a 32-unit grid, round caps and joins and stroke-width (2.2). Category icons have distinct recognizable silhouettes; patent uses an invention bulb inside its application document. The pack preview and individual SVG exports are rebuilt from the shared sprite. Official logos retain their original artwork and aspect ratios.

## Components

### Home banner artwork

The home opening includes `public/images/unisba-innovation-banner-v1.webp`, an illustrative Indonesian academic scene with women in hijab and an academic in peci. It is generated artwork, not a verified campus photograph. Its exact prompt and origin are recorded alongside the asset. The decorative image sits behind live HTML text; navy overlays protect heading and body contrast, and the registration link has its own opaque navy surface. Do not add text or redraw official logos inside the raster. The WebP asset is about 104 KB and has explicit dimensions; use the existing crop rules for desktop and mobile.

### Buttons

Primary home actions use the frontmatter navy variant with a minimum height (48px), a slate-navy hover and an active scale of (.98). Header gold actions have a minimum height (44px), champagne surface and darker-navy text. The closing section reuses the primary home action dimensions with gold colors. Existing task action variants inherit their base padding but receive the same navy surface override.

### Text Links

Premium text actions have a minimum height (44px), weight (650), underline offset (7px) and rounded SVG arrows. Hover advances the arrow by (4px) over (250ms); reduced motion suppresses that transform.

### Chips

Removable directory filters use the slate-blue foreground/background/border trio, (8px) corners, and a minimum target (44px). Hover uses rose feedback. Status badges pair semantic text with matching pale surfaces; do not rely on color alone. Type badges retain legacy color treatments outside the core palette documented above.

### Cards / Containers

Directory cards use white, a fine border, (24px) padding and (12px) corners. Hover changes the border and translates upward by (3px), without shadow; coarse-pointer and reduced-motion paths suppress that lift. Form containers use (16px) corners and white surfaces. Home records and service entries use ruled rows rather than identical marketing cards.

### Inputs / Fields

Inputs, selects and textareas use a fine border, page surface, (10px) corners and (12px 16px) padding. Focus changes to the white surface and slate-blue border with a pale-blue ring; keyboard outlines elsewhere are (3px), offset by (3px), dark gold on light surfaces and champagne in the dark frame. Invalid fields use rose-700 borders and nearby text; error summaries are linked and focusable. Locked fields retain their muted treatment. Phone input type is (16px).

The home search is a separate (8px) container with a (2px) gold bottom rule that grows on focus-within over (400ms); its text remains a standard readable input.

### Navigation

The dark institutional header uses compact Manrope text and a fine gold rule on hover/active links. The drawer makes background regions inert, locks body scrolling, manages Tab focus, closes on Escape/backdrop, and returns focus to the trigger. The dropdown responds to clicks and keyboard focus. The skip link targets `main#mainContent`.

### Lembar inovasi

The signature portfolio shows real server records. With JavaScript, one leaf is visible and selection is user-controlled through click, ArrowLeft/ArrowRight, Home and End, with synchronized selected state and roving tab focus. Without JavaScript the control strip stays hidden and the server-rendered records remain visible.

Motion is finite: the two title lines run (650ms) with a (100ms) stagger, so the last completes at (750ms); the search runs (550ms) after (140ms). Portfolio changes take (350ms). Selected supporting sections reveal once over (450ms), then leave the observer. Typical state feedback is (180–300ms); this is not an assertion that every effect is under (250ms). Cross-document view transitions opt in where supported and use (180ms). Reduced motion disables CSS animation/transitions and smooth scrolling, skips scripted animation and removes the documented hover movement. Scripted animations cancel when the preference changes or the page becomes hidden; pagehide disconnects the reveal observer.

## Do's and Don'ts

### Do:

- **Do** preserve the official logo proportions and use the existing custom SVG sprite.
- **Do** use real records, Indonesian service language and explicit status labels.
- **Do** keep directory titles wrapping inside minmax(0, 1fr) columns and metadata contained with its existing ellipsis treatment.
- **Do** keep animation finite, user-triggered or once per reveal; honor reduced motion and page visibility.
- **Do** apply the source cascade in order: style.css, then premium.css.

### Don't:

- **Don't** replace the official identity or custom SVG icons with emoji or generic glyph icons.
- **Don't** add continuous scroll effects, autoplay or a new animation library to extend this motion language.
- **Don't** carry the home display scale into dense filters or forms.
- **Don't** treat the synthesized sidecar tonal ramps as additional approved application colors.


Not canonized: residual literal type-badge colors and the rejection table-chip's legacy rose-500 hover remain in the older stylesheet. They are not new core palette commitments or a reason to weaken status contrast guidance; changes outside the documentation boundary were not made.

Source evidence: `public/css/style.css` followed by `public/css/premium.css`, `public/js/main.js`, `views/beranda.ejs`, the shared partials, `PRODUCT.md`, and the seven completed captures in `.impeccable/review/`. The implementation owns the tokens; this document does not certify external integrations or hosting performance.
