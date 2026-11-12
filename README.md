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

## When the 2026 annual report is published

The report normally appears on <https://leguesswho.com/anbi> in the course of 2027. Only `data.js` needs to change; everything else (charts, KPIs, heatmap, trivia, ANBI check) is calculated from it.

1. **Find the report.** Open the ANBI page and copy the link of the "Jaarverslag & Jaarrekening 2026" PDF.
2. **Copy the last block** in the `YEARS` array in `data.js` (the 2025 one) and paste it below as the new last item. Keep the array in chronological order.
3. **Fill in the numbers** from the financial statements in the PDF (the *exploitatierekening* = income statement and *balans* = balance sheet):

   | Field | Where in the report |
   |---|---|
   | `year`, `report` | year and PDF link |
   | `rev.*` | income lines (tickets, partnerships, sponsors, bar, merch, donors, funds, subsidies by city / province / Fonds Podiumkunsten) |
   | `cost.*` | cost lines (staff, overhead, artist fees, locations, programme, marketing) |
   | `result`, `budgetResult` | result for the year and the budgeted result |
   | `bal` | balance sheet: `cash`, `equity`, `debt` (short-term) |
   | `visitors` | visitor statistics in the narrative part (festival, COSMOS, U?, countries) |
   | `fte`, `volunteers` | personnel section |
   | `tickets` | CJP / U-pas / low-income tickets, if mentioned |

4. **Directors' pay.** In the WNT section of the report, add the new year to each person's `pay` object in `PEOPLE` (`pay`, `fte`, `cap`). New director? Add a new person object. Someone left? Set `to` and leave their pay empty for later years.
5. **Source link.** Add `{ year: 2026, url: "…pdf" }` to `SOURCES`.
6. **Optional narrative.** Add entries to `INSIGHTS` for sudden changes (check the heatmap for ±25%) and to `TICKET_FACTS` for anything said about passes vs. day tickets. Update `SITE.generated` ("Based on the annual reports published for 2017 – 2026").
7. **Classification changes.** If the report restates last year's figures (as the 2025 report did for 2024), put the restated numbers in `restated2024`-style fields on the new block and set `classificationChange: true`; the heatmap then compares like with like. Otherwise remove these two fields from the 2025 block.
8. **Check locally** (see below). Open the browser console: a warning means income − costs differs more than €15k from the reported result, which is usually a typo.
9. **Publish:**

   ```
   git add -A
   git commit -m "Add annual report 2026"
   git push
   ```

   GitHub Pages rebuilds automatically within a minute.

Tip: the PDFs may be scanned or have no text layer (2018 and 2025 were like that). Read the numbers visually from the statements in that case, and double-check the totals.

## Run locally

No build step. Open `index.html`, or serve the folder:

```
uv run python -m http.server 8000
```

## Deploy

Hosted with GitHub Pages straight from the `main` branch (root). Plain HTML, CSS and JavaScript; charts are hand-written SVG, no dependencies.
