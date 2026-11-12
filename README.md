# Le Guess Who? – the finances in plain English

A visual, framework-free overview of the annual accounts of **Stichting Le Guess Who** (the non-profit behind the Utrecht festival), built for people without a financial background.

**Live site:** https://bertt.github.io/leguesswho/

## What's on the page

- Income, costs and profit/loss per year, plus cash and equity
- Visitors (festival, online COSMOS, city festival U?) and ticket income per visitor
- Income and cost mix, artist fees, salary costs
- Directors: pay per year and background (incl. Johan Gijsen, Bob van Heur, Anne Marleen de Jong)
- ANBI status check against the main financial conditions
- Year-over-year change heatmap, irregularities with possible explanations, trivia, sources

**Not published in the reports** (and therefore not shown): fees per band, and the number of passes vs. day tickets.

## Source data

All numbers come from the annual reports on the foundation's ANBI page: <https://leguesswho.com/anbi>. Every figure used is in [`data.js`](data.js); report links are listed on the site. This is an unofficial project – check the original PDFs before relying on a number.

## Adding 2026 (or any new year)

1. Open `data.js` and copy the last block in the `YEARS` array (2025).
2. Change `year`, `visitors`, `rev`, `cost`, `result`, `budgetResult`, `bal`, `fte`, `volunteers`, `report` (PDF link) and optional `tickets`.
3. Add the PDF link to `SOURCES`.
4. Directors: add a `pay` entry for the new year per person in `PEOPLE` (or add a new person).
5. Optional: add notes to `INSIGHTS` and `TICKET_FACTS`.
6. Remove `classificationChange` / `restated2024` from the old block if the classification is no longer relevant.
7. Commit and push – charts, KPIs, heatmap, trivia and ANBI check update themselves. The browser console warns if income − costs differs by more than €15k from the reported result (usually a typo).

## Run locally

No build step. Open `index.html`, or serve the folder:

```
uv run python -m http.server 8000
```

## Deploy

Hosted with GitHub Pages straight from the `main` branch (root). Plain HTML, CSS and JavaScript; charts are hand-written SVG, no dependencies.
