# NO NAME: custom print studio website

Website for a customization studio that sells apparel, gifts and accessories (Ghana plus diaspora).
The brand idea: **"We left our name off. So there's room for yours."**

## Go-live settings (edit `js/data.js` → `JT.config`)
| Setting | What it does | Status |
|---|---|---|
| `whatsapp` | Number behind every WhatsApp button, order and quote. Digits only, international format (`233241234567`) | **Must set before launch.** Currently a placeholder |
| `paystackKey` | Paystack **public** key (`pk_live_…`). When set, checkout takes payment in the Paystack window (MoMo or card, in cedis). When empty, orders are sent to the shop on WhatsApp and payment is arranged there | Optional |
| `phone`, `email`, `instagram`, `hours` | Shown on the Contact page (and email in Privacy) when filled in | Optional |
| `address` | Studio / pickup location (Contact, Delivery, checkout) | Set to `Osu, Accra` |
| `deliveryFee`, `printPerElement`, `usdRate` | Rider delivery fee, print price per element, display rate for US$ prices | Check |

Products, blank prices, colours, FAQ and the example jobs on the home page are also in `js/data.js`.

**Paystack note:** the inline popup is client-side only. Before printing a paid order, confirm the payment (the reference starts with the job number) on the Paystack dashboard. A server-side verify webhook is the next step if volume grows.

## Run it
- **Local:** `python serve.py`, then open http://127.0.0.1:5178. Needs only Python 3. Don't use `python -m http.server`: it can't answer `/shop` on a reload.
- **Vercel:** import the folder with Framework Preset "Other", no build command, root as output directory. `vercel.json` sends every page address to `index.html` and maps nested asset paths. `serve.py` does the same locally and isn't deployed (`.vercelignore`).
- Double-clicking `index.html` still works offline; addresses then look like `index.html#/shop`.

## Pages
| Address | What it shows |
|---|---|
| `/` | Home: live hero, ticker, bento of the six blanks, how a job runs, product rail, example jobs, print methods, FAQ, bulk band |
| `/shop` | Product grid with category, colour and price-sort filters (`?c=gifts&col=red&sort=low`) |
| `/product/<id>` | Product page: colour, sizes + size guide, qty, add to cart, make it yours, order on WhatsApp |
| `/studio` | Designer: 6 blanks, 7 colours, text, art, image upload with low-DPI warning, front + back, undo, autosave, proof with job number, add to cart, send proof on WhatsApp, download proof PNG |
| `/cart` | Cart, customer details with validation, delivery/pickup, MoMo or card. Pays through Paystack if a key is set, otherwise places the order on WhatsApp |
| `/track` | Job lookup. Orders placed on this device show their details; any other job number gets a pre-filled WhatsApp status request |
| `/bulk` | Quantity slider, print positions, price breaks, quote request to WhatsApp |
| `/faq` | All questions |
| `/about` | About the studio |
| `/contact` | WhatsApp, studio location, optional phone/email/Instagram/hours, message form that opens WhatsApp (or email) |
| `/info/delivery`, `returns`, `privacy`, `terms` | Policy pages |
| anything else | Branded 404 (noindex) |

## Files
- `index.html`: shell, shared SVG defs and the static home page
- `css/site.css`: all styles; tokens at the top
- `js/data.js`: settings, catalogue and copy
- `js/app.js`: router, home, shop, product, cart drawer and checkout, track, bulk, info/about/contact/FAQ and 404
- `js/studio.js`: the canvas designer, loaded only when the Studio opens
- `fonts/`: self-hosted Archivo and IBM Plex Mono (SIL OFL)
- `robots.txt`: allows indexing
- `serve.py`, `vercel.json`, `.vercelignore`: hosting

## How the pieces work
**Links.** Write links as site paths (`href="/shop"`) and navigate in code with `JT.go('/shop?c=gifts')`. Each page sets its title, description, canonical and `og:` tags (`head()` in `app.js`). Link previews on WhatsApp don't run scripts, so they show the home page's tags for every link.

**Orders.** Checkout saves each order on the customer's device under its job number (`nn_orders` in localStorage) so `/track` can show it. Live status comes from the studio on WhatsApp.

**Studio uploads.** The design autosaves to localStorage (`nn_studio`); uploaded images go to IndexedDB (`nn-studio` › `uploads`). Custom cart lines carry the design in `line.design`. The customer attaches the downloaded proof image in WhatsApp.

## Still to do
- Real WhatsApp number (above), and optionally the Paystack key
- Confirm prices, delivery fee, turnaround (3 to 5 working days), return windows (7 days faulty / 14 days blanks) and size-guide measurements, which are carried over from the design
- Replace the example jobs on the home page with real ones when available
- `sitemap.xml` once the domain is known (and add `Sitemap:` to `robots.txt`)
