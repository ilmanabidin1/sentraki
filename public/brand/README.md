# P2KI UNISBA identity assets

- `p2ki-glossy-v1.webp`: owner-supplied “Glossy P2KI Innovation Logo.png”, resized and encoded losslessly with its original alpha. Used for dark surfaces.
- `p2ki-blue-gold-v1.webp`: owner-supplied “P2KI Innovation Logo with Tagline.png”, resized and encoded losslessly with its original alpha. Used on light login/profile surfaces.
- Header/footer display windows show the main P2KI mark from the full supplied artwork. The complete name remains readable as live HTML text.
- Browser favicons in `public/favicon.*`, PNG 16/32 and `apple-touch-icon.png` export the supplied main mark with its original transparent alpha, without any added background. PNG/ICO use the blue-gold mark for light browser chrome; the SVG uses the blue-gold mark by default and the glossy mark for dark colour schemes. The main-mark crop matches the header display window. No logo geometry is redrawn.

Institution marks remain authentic source images. The Unisba seal is the owner-supplied `public/images-lambang-unisba.png`, shown white using CSS while preserving its alpha and shape. White institutional use was checked on https://unisba.ac.id/ and the official LPPM welcome banner at https://lppm.unisba.ac.id/wp-content/uploads/Lembaga-Penelitian-dan-Pengabdian-kepada-Masyarakat-55-x-16-cm-1.png. The separately discovered official footer wordmark includes accreditation badges and is not used here.

LPPM uses the unchanged owner-supplied JPEG. `views/partials/institution-logos.ejs` renders its light foreground with an SVG luminance-to-alpha filter and crops the outer frame. Dark-blue pixels become transparent; original letter shapes and counters remain in place. This is web presentation of the source, not a generated replacement logo. Two generated background-removal attempts were rejected because they altered the lettering and left residue; they are not shipping assets.
