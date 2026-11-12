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

## Estimated fee per act (model, not published data)

The "Estimated fee per act" section lets you pick a year, shows the performing acts ranked by estimated fee, and charts the fee of the top acts over time. The method (weights, formula, 80% interval) is described on the page and lives in `FEE_MODEL` in `data.js`. Per-act inputs are in the generated `lineups.js`.

**How the model works** (all of it is an assumption-based estimate; nothing is validated against real fees):

1. **Pool per year** = `cost.artists` from the annual report × `gageShare` (70%, range 59–80%). The 70% is my assumption, not a published number: artist costs also contain travel, hotel, visas and backline. All fees scale linearly with it.
2. **Score per act (0–100)** = weighted average of the factors below. Factors that are unavailable (room, prime time and slot length for 2018 and 2019) are left out and the remaining weights are renormalised. Minimum score 5. Panels and talks (flagged in the table) get a fixed score of 1, so they receive almost no fee.
3. **Fee** = pool × score² ÷ Σ score² of all acts of that year. The square skews the pool towards high-scoring acts.
4. **80% interval** = fee × 0.55 to fee × 1.8 (uncertainty of the pool share and of the scores).

| Factor | Weight | Scoring |
|---|---|---|
| Room | 26% | Largest room on the clashfinder timetable: Ronda 100 (2,000), Grote Zaal 92 (1,717), Stadsschouwburg Main Room 55, Hertz 55 (543), Pandora 60 (625), churches 50, Cloud Nine 45 (400), dB's Main Stage 40, dB's Bar 30, other 25–40 |
| Prime time | 17% | Set starts 20:00–23:00 in a room of Hertz size or bigger = 100, 19:00–20:00 or 23:00–24:00 = 50, otherwise 20 |
| Opener / closer | 9% | Opens the festival (Thursday, start 18:00–20:30) or closes it (last day, start 19:00–21:00) in Grote Zaal or Ronda = 100, otherwise 0 |
| Slot length | 8% | Longest set in minutes, scaled linearly: 30 min or less = 0, 60 = 33, **75 = 50**, 90 = 67, 120+ = 100 |
| Billing | 17% | Curator or first announcement = 100, later announcement = 80, additions list = 60, only line-up page = 45 |
| Ensemble | 4% | Orchestra / band / collective = 100, collaboration = 65, solo or DJ = 15, otherwise 45 |
| Special commission | 4% | Curator = 100, "presents / premiere / collab" = 50, otherwise 0 |
| Legend status | 15% | Reputation from Spotify play counts, independent of scheduling: the summed plays of up to 20 tracks of the artist on a log scale (100,000 plays = 0, 10 million = 50, 1 billion = 100). Collaborations take the best score of the parts; there are no manual overrides, so older legends with few streams score low. Not on Spotify = 0. Available for all years |

The weights and their texts live in `FEE_MODEL` in `data.js`; the per-act inputs (`b`, `e`, `c`, `s`, `d`, `p`) in the generated `lineups.js`. There is deliberately no live streaming-popularity factor for the fee itself; the legend factor uses a one-off sample of Spotify play counts instead, generated into `legends.js` by `tools/build_legends.py` (`uv run python tools/build_legends.py`; needs the Spotify desktop app running, resumable).

Known limitations: the pool is divided over the acts *found*, so incomplete years overestimate fees (2018 and 2019 have no timetable, so only billing, ensemble and commission count there, and they are least complete); known cancellations are listed in `CANCELLED` in `tools/build_lineups.py` and may be incomplete.

**Regenerate the acts** (public sources: news posts and archive on leguesswho.com, blokkenschema.nl for 2023–2025, clashfinder.com timetables for room, start time and slot length (2017, 2021–2026)):

```
uv run --with requests python tools/build_lineups.py
```

Add new posts for a new year to `POSTS` in `tools/build_lineups.py` first. Old years are incomplete, because the official archive pages only show part of the acts; check the printed act counts.

**2026 is an estimate.** `ESTIMATED_ARTIST_COSTS = { 2026: 600000 }` in `data.js` is an assumed artist-cost total (similar to 2025). When the 2026 report is published and added to `YEARS` (see above), the real `cost.artists` is used automatically and the "estimate" label disappears; you can then delete the 2026 line from `ESTIMATED_ARTIST_COSTS`. Also check:

1. `FEE_MODEL.gageShare`: the share of artist costs that is pure fee (rest = travel, hotel, visas, backline). If the report changes the cost grouping again (as in 2025), adjust it.
2. Re-run the builder after the 2026 line-up is final, so the act list is complete.

## Run locally

No build step. Open `index.html`, or serve the folder:

```
uv run python -m http.server 8000
```

## Deploy

Hosted with GitHub Pages straight from the `main` branch (root). Plain HTML, CSS and JavaScript; charts are hand-written SVG, no dependencies.
