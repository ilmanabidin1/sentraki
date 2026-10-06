# P2KI UNISBA icon pack

Original SVG geometry drawn specifically for P2KI UNISBA / Sentra KI. No icon-font, emoji, external icon library or runtime dependency.

- Source of truth: `sentra-ki.svg` (stable symbol IDs preserve all existing uses).
- Specimen: `/icons/preview.html`, showing every icon at 40, 16 and 24 px.
- Download: `p2ki-icon-pack.zip`, with individual SVG files, the complete sprite and this README.
- `npm run build` regenerates the specimen and ZIP and updates all sprite content hashes.

## Visual construction

32 × 32 grid; 2.2-unit stroke; round caps and joins; mostly 3-unit corners. Icons use `currentColor`, so the same pack works on navy and white surfaces. Dot details alone are filled. Do not add a background, shadow or gradient to the icon artwork.

Paten combines the application document with an invention bulb. Hak cipta uses the copyright circle; Merek uses a product label; Desain Industri uses a three-dimensional object and drafting corners. Akademi uses open pages, protection uses a shield, and partnership uses linked hands. The assistant is an idea bulb rather than a robot or sparkle.

## Usage

```html
<svg class="sk-icon" width="24" height="24" viewBox="0 0 32 32" aria-hidden="true">
  <use href="/icons/sentra-ki.svg#patent"/>
</svg>
```

```css
.sk-icon {
  fill: none;
  stroke: currentColor;
  stroke-width: 2.2;
  stroke-linecap: round;
  stroke-linejoin: round;
}
```

Keep visible labels next to category, status and service icons. Icon-only buttons require an accessible name on the button. Do not use an icon alone to communicate a status. Individual SVG exports carry all drawing attributes and can be recolored by setting CSS `color` when inline, or editing `currentColor` in design software.
