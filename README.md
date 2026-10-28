# NO NAME: custom print studio mockup (v2)

A clickable design mockup for a customization studio that sells apparel, gifts and accessories (Ghana plus diaspora).
The brand idea: **"We left our name off. So there's room for yours."**

**Everything here is a placeholder:** products, prices, the USD rate, the WhatsApp number, delivery, print methods, sample jobs and policies.
Flip **Client notes** in the black strip at the top to highlight every placeholder in yellow and show the `TBC` tags. It's off by default so the site reads as finished.

## Open it
- **Locally:** double-click `index.html`. It needs no build step and no server, and works offline.
- **Vercel:** import the folder as a project with Framework Preset "Other", no build command, and the root as the output directory. `vercel.json` sets noindex and caching headers.

## Screens (hash routes)
| Route | What it shows |
|---|---|
| `#/` | Home: live hero (names type themselves onto a tee, or type your own), name ticker, bento of the six blanks, "How a job runs" with a job ticket that fills in and gets stamped as you scroll, swing-tag product rail, wall of sample past jobs, print methods, FAQ with job tracking, bulk band |
| `#/shop` | Rail grid with category, colour and price-sort filters, empty state |
| `#/product/<id>` | Product page: colour, sizes with a size-guide sheet, qty, add to cart, make it yours, order on WhatsApp, specs, related items |
| `#/studio` | **Pull a proof** designer: 6 blanks, 7 colours, text (5 fonts, ink colours), sample art, image upload with low-DPI warning, drag / pinch / rotate / keyboard, front + back, undo, autosave, squeegee proof that issues an `NN-####` job number and live price, add to cart, send proof on WhatsApp, download proof PNG |
| `#/cart` | Cart lines, customer details with inline validation, delivery/pickup, Paystack-style MoMo (MTN / Telecel / AirtelTigo) or card. **Mock only: no payment is taken** |
| `#/track` | Job number lookup with stamped stages (sample status) |
| `#/bulk` | Quantity slider, print positions, sample price breaks, quote request to WhatsApp |
| `#/info/delivery`, `returns`, `privacy`, `terms` | Placeholder policy pages |
| anything else | Branded 404 |

The cart also opens as a slide-over drawer from any page. Under 920px the nav collapses into a full-screen menu.

## Files
- `index.html`: shell, shared SVG defs (garment shading, icons) and the static home page
- `css/site.css`: all styles. Tokens are at the top (`--bg`, `--ink`, `--red`, `--hl` for client notes)
- `js/data.js`: **all sample data** (blanks as SVG paths, colours, products, prices, fonts, art, hero names, sample jobs, FAQ, config such as the WhatsApp number and USD rate)
- `js/app.js`: router, home, shop, product, cart drawer and page, track, bulk, info and 404
- `js/studio.js`: the canvas designer, loaded only when the Studio opens
- `fonts/`: self-hosted subsets of Archivo (variable width and weight) and IBM Plex Mono, both SIL OFL

## Marking placeholders
- `<span class="tbc">Fee TBC</span>`: a note shown only when Client notes is on
- `<i class="ph">3 to 5 working days</i>`: a placeholder value, highlighted when Client notes is on

## To make it real (needs the client's answers)
Logo and final palette; the real catalogue, prices and print pricing; print methods; minimum quantities and bulk breaks; turnaround; delivery areas and fees; WhatsApp number; Paystack keys plus a server-side verify webhook; the policy pages; real past jobs for the wall; and photographed blanks to replace the SVG shapes.
