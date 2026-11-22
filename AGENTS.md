# ShopLedger

## Stack
- Node.js CommonJS application using Express 4 and body-parser.
- Browser UI is static HTML, CSS, and JavaScript in `public/`.
- Application data is stored in `data/db.json` through `lib/store.js`.

## Module map
- `routes/products.js` — Lists products and active coupons.
- `routes/orders.js` — Lists, places, and cancels orders.
- `routes/customers.js` — Lists Khata customers and records settlements.
- `routes/reports.js` — Dashboard and GST reports, pricing preview, and admin export.
- `lib/coupons.js` — Normalizes, validates, and calculates coupon discounts.
- `lib/dates.js` — Formats today's date, normalizes date keys, and derives fiscal years.
- `lib/inventory.js` — Finds products, checks sellable stock, adjusts stock, and summarizes inventory.
- `lib/invoice.js` — Computes invoice figures and renders printable invoice HTML.
- `lib/ledger.js` — Computes customer balances, Khata charges, reversals, and settlements.
- `lib/orders.js` — Adds, finds, cancels, and filters orders.
- `lib/pricing.js` — Computes order subtotals, discounts, line GST, and totals.
- `lib/reports.js` — Builds dashboard summaries and compares invoice figures with stored orders.
- `lib/store.js` — Reads/writes `data/db.json` and appends audit entries.
- `lib/tax.js` — Resolves GST rates and splits tax into CGST and SGST.

## Commands
- Start the app: `node server.js` (also the `start` script in `package.json`).
- Run tests: `node --test` (Node's built-in test runner). The current `npm test` script is a placeholder that exits with an error.

## Rules
1. Write characterization tests before changing behaviour.
2. Change only the module(s) the ticket is about.
3. Tests never read or write `data/db.json`; use in-memory data.
4. Add no dependencies.
5. Make the smallest fix that works.

## Current ticket
Invoice total and GST breakdown do not match what the customer was billed.
Allowed files: `lib/invoice.js` (`lib/tax.js` only if truly needed).
