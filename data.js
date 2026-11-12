/*
 * ALL NUMBERS ON THE SITE COME FROM THIS FILE.
 * To add 2026: copy the last block in YEARS, change the numbers, optionally add
 * entries to INSIGHTS and SOURCES. Charts, KPIs and the change table update by themselves.
 *
 * Amounts are in euros. Source: "Jaarverslag & Jaarrekening" PDFs on https://leguesswho.com/anbi
 * Missing values: use null (charts skip them).
 *
 * rev   = revenue lines.            cost = cost lines (exploitatierekening).
 * visitors.festival = Le Guess Who? paying festival visitors.
 * result = reported operating result including interest ("exploitatieresultaat").
 */
const BASE = "https://leguesswho.com/media/PDF/ANBI/";
const f = (y) => BASE + "LGW%20-%20Jaarverlsag%20%26%20Jaarrekening%20" + y + "%20-%20beknopt%20incl.%20WNT.pdf";

const SITE = {
  name: "Le Guess Who?",
  foundation: "Stichting Le Guess Who",
  anbiPage: "https://leguesswho.com/anbi",
  generated: "Based on the annual reports published for 2017 – 2025",
};

const YEARS = [
  {
    year: 2016, partial: true,
    visitors: {},
    rev: { tickets: 395703, partnerships: 37675, sponsors: 0, horeca: 2606, merch: 6899, participants: 58583, otherEarned: 4250, indirect: 0,
           individuals: 18400, companies: 0, funds: 117000, fpk: 39310, province: 14800, city: 99250, otherPublic: 0, covid: 0 },
    cost: { staffCore: 95282, overhead: 27280, staffTemp: 85205, artists: 280129, artistsOther: 20645, otherPeople: 34003, locations: 51446, program: 135319, marketing: 84887, education: 0 },
    result: -20308, budgetResult: null,
    bal: { cash: 17815, equity: 25653, debt: 176991 },
    fte: null, volunteers: null,
  },
  {
    year: 2017,
    visitors: { festival: 20000, festivalApprox: true, countries: 58, visits: 89920 },
    rev: { tickets: 502043, partnerships: 75130, sponsors: 0, horeca: 1558, merch: 7732, participants: 57530, otherEarned: 7687, indirect: 0,
           individuals: 0, companies: 14500, funds: 134500, fpk: 126875, province: 60000, city: 215587, otherPublic: 19720, covid: 0 },
    cost: { staffCore: 149807, overhead: 40894, staffTemp: 135258, artists: 336783, artistsOther: 22555, otherPeople: 33684, locations: 51333, program: 235194, marketing: 164637, education: 0 },
    result: 54332, budgetResult: 25154,
    bal: { cash: 120745, equity: 79985, debt: 185492 },
    fte: 2.17, volunteers: 95, report: f(2017),
  },
  {
    year: 2018,
    visitors: { festival: 18126, countries: 50 },
    rev: { tickets: 491987, partnerships: 35000, sponsors: 0, horeca: 10446, merch: 7801, participants: 87340, otherEarned: 135379, indirect: 0,
           individuals: 0, companies: 6000, funds: 145138, fpk: 130000, province: 65000, city: 218697, otherPublic: 19257, covid: 0 },
    cost: { staffCore: 154761, overhead: 53532, staffTemp: 149755, artists: 329885, artistsOther: 11513, otherPeople: 41892, locations: 71811, program: 420329, marketing: 140125, education: 0 },
    result: -21548, budgetResult: 9000,
    bal: { cash: 27016, equity: 58436, debt: 154164 },
    fte: null, volunteers: null, report: f(2018),
  },
  {
    year: 2019,
    visitors: { festival: 20514, other: 5085, countries: 61 },
    rev: { tickets: 581178, partnerships: 48750, sponsors: 0, horeca: 14331, merch: 6590, participants: 61440, otherEarned: 125463, indirect: 0,
           individuals: 0, companies: 6000, funds: 169500, fpk: 133438, province: 65000, city: 225695, otherPublic: 17539, covid: 0 },
    cost: { staffCore: 167067, overhead: 54552, staffTemp: 168635, artists: 346990, artistsOther: 21048, otherPeople: 45893, locations: 71564, program: 442076, marketing: 135182, education: 0 },
    result: 1918, budgetResult: 23042,
    bal: { cash: 75783, equity: 60354, debt: 200837 },
    fte: 2.53, volunteers: 201, report: f(2019),
  },
  {
    year: 2020, covidYear: true,
    visitors: { festival: 0, cosmos: 11099, countries: 119, note: "Festival cancelled. 11,099 unique online viewers of the replacement stream LGW ON." },
    rev: { tickets: 0, partnerships: 0, sponsors: 0, horeca: 0, merch: 1516, participants: 35, otherEarned: 10107, indirect: 0,
           individuals: 0, companies: 0, funds: 0, fpk: 137501, province: 60000, city: 232917, otherPublic: 86662, covid: 379500 },
    cost: { staffCore: 262148, overhead: 48546, staffTemp: 95397, artists: 49944, artistsOther: 2758, otherPeople: 1959, locations: 20303, program: 110326, marketing: 55386, education: 0 },
    result: 261479, budgetResult: 24816,
    bal: { cash: 424596, equity: 321833, debt: 257564 },
    fte: 3.91, volunteers: 50, report: f(2020),
  },
  {
    year: 2021, covidYear: true,
    visitors: { festival: 15889, combined: 15248, countries: 39 },
    rev: { tickets: 454397, partnerships: 90800, sponsors: 0, horeca: 8776, merch: 6791, participants: 1050, otherEarned: 3790, indirect: 3280,
           individuals: 2410, companies: 0, funds: 125000, fpk: 350714, province: 135000, city: 288120, otherPublic: 74765, covid: 271100 },
    cost: { staffCore: 295233, overhead: 83773, staffTemp: 197008, artists: 325170, artistsOther: 56712, otherPeople: 702, locations: 267990, program: 216903, marketing: 168640, education: 0 },
    result: 203863, budgetResult: 32409,
    bal: { cash: 533487, equity: 525696, debt: 252162 },
    fte: 5.51, volunteers: 150, report: f(2021),
  },
  {
    year: 2022,
    visitors: { festival: 18304, cosmos: 16500, city: 5700, countries: 50 },
    rev: { tickets: 585688, partnerships: 130000, sponsors: 0, horeca: 0, merch: 7484, participants: 0, otherEarned: 21370, indirect: 3939,
           individuals: 8584, companies: 3148, funds: 150000, fpk: 364798, province: 135000, city: 297628, otherPublic: 56673, covid: 145000 },
    cost: { staffCore: 384730, overhead: 125914, staffTemp: 229349, artists: 375104, artistsOther: 49240, otherPeople: 1819, locations: 311951, program: 300605, marketing: 189817, education: 2394 },
    result: -61612, budgetResult: 0,
    bal: { cash: 710392, equity: 464084, debt: 554299 },
    fte: 6.74, volunteers: 129, report: f(2022),
  },
  {
    year: 2023,
    visitors: { festival: 20000, festivalApprox: true, combined: 44046, combinedApprox: true, total: 64046, countries: 60, visits: 141643 },
    rev: { tickets: 745394, partnerships: 139624, sponsors: 0, horeca: 0, merch: 10180, participants: 0, otherEarned: 27233, indirect: 1664,
           individuals: 8787, companies: 5398, funds: 285931, fpk: 395670, province: 135000, city: 319011, otherPublic: 30521, covid: 0 },
    cost: { staffCore: 261887, overhead: 108101, staffTemp: 348152, artists: 465504, artistsOther: 7523, otherPeople: 7220, locations: 366387, program: 341647, marketing: 206348, education: 7514 },
    result: -8185, budgetResult: -81003,
    bal: { cash: 757060, equity: 455899, debt: 540822 },
    fte: 6.28, volunteers: 135, report: f(2023),
    tickets: { cjp: 138, upas: 18 },
  },
  {
    year: 2024,
    visitors: { festival: 19443, cosmos: 32595, city: 4280, other: 4475, countries: 51, note: "“Other” = visitors of other activities (“overige activiteiten” in the report), outside the festival, COSMOS and U? programmes." },
    rev: { tickets: 794093, partnerships: 141500, sponsors: 3720, horeca: 0, merch: 8520, participants: 0, otherEarned: 29879, indirect: 2137,
           individuals: 8341, companies: 15908, funds: 254569, fpk: 414631, province: 135000, city: 330810, otherPublic: 79613, covid: 0 },
    cost: { staffCore: 290438, overhead: 103483, staffTemp: 412473, artists: 576076, artistsOther: 9713, otherPeople: 3409, locations: 384715, program: 371209, marketing: 224427, education: 0 },
    result: -147853, budgetResult: -226536,
    bal: { cash: 576417, equity: 308046, debt: 592662 },
    fte: 6.45, volunteers: 162, report: f(2024),
    tickets: { cjp: 139, upas: 36, lowIncome: 200, lowIncomeAvgPrice: 22 },
  },
  {
    year: 2025,
    visitors: { festival: 19320, cosmos: 37415, city: 5050, countries: 52 },
    rev: { tickets: 867095, partnerships: 202399, sponsors: 4135, horeca: 33431, merch: 9959, participants: 0, otherEarned: 43861, indirect: 4585,
           individuals: 22226, companies: 10001, funds: 185875, fpk: 520690, province: 128250, city: 360255, otherPublic: 141609, covid: 0 },
    // From 2025 the report groups costs differently: "artists" now also holds ~EUR 70k of items that were booked elsewhere before.
    cost: { staffCore: 354411, overhead: 112256, staffTemp: 435149, artists: 560986, artistsOther: 0, otherPeople: 0, locations: 741404, program: 84634, marketing: 214519, education: 0 },
    restated2024: { artists: 658780, locations: 642619, program: 63332, marketing: 204818 },
    classificationChange: true,
    result: 40335, budgetResult: 0,
    bal: { cash: 777996, equity: 348381, debt: 673912 },
    fte: 9, volunteers: 131, report: "https://leguesswho.com/media/PDF/ANBI/Jaarverslag%20%26%20Jaarrekening%202025%20-%20V2.pdf",
    tickets: { cjp: 191, upas: 72, lowIncome: 200, lowIncomeAvgPrice: 20 },
  },
];

/*
 * Curated findings. tag: "warn" (big swing), "good", "info".
 * basis: "report" = the explanation is stated in the annual report, "inference" = our reading of the numbers.
 */
const INSIGHTS = [
  { year: 2017, tag: "info",   metric: "Revenue +54% vs 2016",
      title: "Revenue jumped by more than half",
      text: "Total revenue went from about €0.79M (2016 column in the 2017 report) to €1.22M. Almost all of the extra money was structural subsidy: city, province and Fonds Podiumkunsten together went from about €153k to €422k.",
    basis: "inference" },
  { year: 2018, tag: "warn", metric: "Ticket revenue −2%",
    title: "Passes replaced day tickets",
    text: "Ticket revenue dipped slightly although the festival was sold out. The report says more people chose a pass (passe-partout) instead of separate day tickets, and the Saturday day tickets were stopped early to keep the venues from getting too crowded. The year ended with a small loss.",
    basis: "report" },
  { year: 2020, tag: "warn", metric: "Ticket revenue −100%, result +€261k",
    title: "Festival cancelled, yet a big surplus",
    text: "Because of COVID-19 the live festival was cancelled: ticket revenue dropped to zero and costs fell to €0.65M. Government and fund support (including €379.5k extra COVID support) was kept by the foundation, which created a €261k surplus. It was parked in a dedicated COVID reserve, not distributed.",
    basis: "report" },
  { year: 2021, tag: "warn", metric: "Surplus +€204k",
    title: "Smaller festival, another surplus",
    text: "The festival ran at 75% capacity, with COVID checks, a midnight curfew and a switch to a day-programme halfway through the weekend. Another €271k of COVID support kept the year positive. Visitors dropped to about 15.9k (2019: 20.5k).",
    basis: "report" },
  { year: 2022, tag: "warn", metric: "Costs +22%, core staff costs +30%",
    title: "Back to full size, and a leadership change",
    text: "The first full festival since 2019 made costs jump from €1.61M to €1.97M. Core staff costs rose 30% (€295k → €385k); the report also lists a termination payment of €33,362 to departing director Johan Gijsen, and the team grew from 5.5 to 6.7 FTE. The €62k loss was covered by the COVID reserve built up in 2020–21.",
    basis: "report" },
  { year: 2023, tag: "good",   metric: "Ticket revenue +27%",
      title: "Ticket revenue jumps, loss almost zero",
    text: "A full, sold-out edition lifted ticket revenue from €586k to €745k. Private-fund money also doubled (€150k → €286k), and the year closed with a deficit of only €8k (budgeted: −€81k).",
    basis: "inference" },
  { year: 2024, tag: "warn", metric: "Loss −€148k",
    title: "Biggest loss of the period, but planned",
    text: "Costs grew 12% (artist fees +24%, €466k → €576k) while revenue rose only 5%, and private-fund money fell 11%. The loss was actually smaller than the budgeted deficit of €227k and was covered by reserves: the COVID reserve (€148k) and an artists reserve (€90k) were used up. The report says subsidies do not keep pace with inflation and rising costs.",
    basis: "report" },
  { year: 2025, tag: "good", metric: "Revenue +14%, result +€40k",
    title: "Back in the black",
    text: "Revenue rose from €2.22M to €2.53M: Fonds Podiumkunsten subsidy +26% (€415k → €521k), ticket revenue +9%, partnership revenue +43% and new bar (horeca) revenue of €33k. Reported artist costs are lower, but part of that is a changed cost grouping (see the note on the artist-cost chart). Private-fund money fell 27%, while donations from individuals rose 266% after a new supporters campaign.",
    basis: "report" },
  { year: 2025, tag: "info", metric: "Cash €778k vs. equity €348k",
    title: "A lot of cash, but it isn't all theirs",
    text: "The bank balance (€778k) looks comfortable, but short-term debts (€674k) include money received in advance (e.g. tickets and subsidies for the next edition) that still has to be spent. The real buffer is equity: €348k. This is typical for festivals: they get paid months before they pay the bands.",
    basis: "inference" },
  { year: 2025, tag: "info", metric: "Visitors flat, COSMOS +15%",
    title: "The festival is maxed out; growth is online",
    text: "Paying festival visitors have hovered around 19–20k since 2019: the venues are full and the report says there is no room (and no wish) to grow. All growth in the headline total comes from online, non-paying people: COSMOS reach went from 16.5k people (2022) to 37.4k people (2025). These are free online listeners and viewers (mixtapes, films, live radio, talks), not customers: the reports show no COSMOS ticket, subscription or other revenue. It is audience reach, not money.",
    basis: "report" },
];

const TRIVIA = [
  { icon: "🎟️", label: "Price per visitor", value: (Y) => { const a = ticketPerVisitor(Y[Y.length - 1]); return a ? "€" + a.toFixed(0) : "—"; },
    text: "average ticket revenue per festival visitor in the latest year (about €25 in 2017)." },
  { icon: "🌍", label: "Countries", value: (Y) => Y[Y.length - 1].visitors.countries, text: "countries are represented among visitors in the latest year." },
  { icon: "🧑‍🤝‍🧑", label: "Volunteers", value: (Y) => Y.filter(y => y.volunteers).slice(-1)[0].volunteers, text: "volunteers helped in the latest year (95 in 2017)." },
  { icon: "🏛️", label: "Public money share", value: (Y) => { const l = Y[Y.length - 1]; return Math.round(100 * subsidies(l) / totalRev(l)) + "%"; }, text: "of revenue is subsidy (city, province, Fonds Podiumkunsten, EU, other)." },
  { icon: "🎤", label: "Artist fee per artist", value: () => "≈ €3–4k", text: "rough average in 2025: ~€561k core-programme fees divided by 150–180 artists. Per-band fees are not published." },
  { icon: "🛡️", label: "Spent on Covid-year reserve", value: () => "€0.6M", text: "of COVID support kept in 2020–22 (€379.5k + €271.1k + €145k) went into a reserve that paid for the 2022 and 2024 losses." },
  { icon: "🔢", label: "Edition numbering", value: () => "16 → 18", text: "the 2023 report calls 2023 the 16th edition, the 2024 report calls 2024 the 18th. One edition seems skipped in the reports." },
  { icon: "🔁", label: "Re-sell cap", value: () => "100% + 5%", text: "from 2025 resale on TicketSwap is capped at the original price plus 5% service fee (was up to 120%)." },
];

/* What the reports say about passes (passe-partout) vs day tickets. NO split by number or revenue is published. */
const TICKET_FACTS = [
  { year: 2018, text: "More passes were sold than the year before while day-ticket sales went down; many former day-ticket buyers now prefer a pass." },
  { year: 2020, text: "1,500 passes had already been sold for the 2020 edition by April (1,566 ticket buyers in total); 92% kept their ticket for 2021 after the postponement." },
  { year: 2022, text: "80% of the passes for 2023 were sold in the first week after the 2022 edition. For the first time, half of the capacity of a night programme was sold via club WAS. at a lower price." },
  { year: 2023, text: "Early-bird passes for 2024 sold out within hours; the remaining passes and the day tickets only go on sale after the line-up announcement, so new audiences get a chance too." },
  { year: 2024, text: "Two thirds of the passes for 2025 went on sale on the last festival day and sold out in hours. Venue tickets (single-venue day, €10–25) and 200 pay-what-you-can Low Income Day Tickets (avg €22) were added." },
  { year: 2025, text: "All discounted day tickets €25 incl. fees. Low Income tickets averaged €20. CJP youth-pass tickets: 191, U-pas (Utrecht low-income pass) tickets: 72." },
  { year: 2026, text: "The 2025–2028 plan says: abolish early-bird tickets, raise service fees, sell more day tickets relative to passes and add other ticket types (night tickets, single concerts in neighbourhoods).", plan: true },
];

/*
 * Directors (statutory board). Pay = "Bezoldiging" from the WNT section (Dutch law capping pay in
 * publicly funded organisations): salary + expenses + pension/payable-later, per person per year.
 * cap = individual legal maximum that year (where printed in the report), fte = contract size.
 * A new director = add a person (or a row in `pay`). Pay shown is total pay at the given FTE.
 */
const PEOPLE = [
  {
    id: "jg", name: "Johan Gijsen", role: "Co-founder · general director-board member", color: "#ffd23f",
    from: 2007, to: 2022, tenure: "≈ 16 years (until 31 Oct 2022)",
    bio: "Co-founder of the festival and its general director for 16 years. In 2022 he stepped down “for a new step” and to make room for a new person in the directorate. In December 2022 he and Bob van Heur received the Utrecht Maartenspenning, the city's award for exceptional cultural leadership.",
    pay: { 2017: { pay: 67994, fte: 0.84, cap: 152421 }, 2018: { pay: 73582, fte: 1 }, 2019: { pay: 81023, fte: 1, cap: 194000 }, 2020: { pay: 73122, fte: 0.84, cap: 168840 },
           2021: { pay: 80494, fte: 0.84 }, 2022: { pay: 73184, fte: 0.84, cap: 151200 } },
    extra: [
      { label: "Termination payment (2022)", value: "€33,362", note: "Legal maximum for such a payment: €75,000. Paid in full in 2022." },
      { label: "Last year in office", value: "2022", note: "Worked 1 Jan – 31 Oct 2022 (10 months), at 0.84 FTE." },
    ],
  },
  {
    id: "bvh", name: "Bob van Heur", role: "Co-founder · artistic director-board member", color: "#5b9dff",
    from: 2007, to: null, tenure: "since the start (2007), board member",
    bio: "Co-founder and the artistic mind behind the programme. Since 1 January 2023 sole artistic director-bestuurder next to the business director. Side activities listed by the foundation: founder/owner of Distorted Channel and founder/programmer of 24-Hour Drone (Hudson, New York).",
    pay: { 2017: { pay: 64344, fte: 0.84, cap: 152421 }, 2018: { pay: 59690, fte: 0.8 }, 2019: { pay: 66000, fte: 0.8, cap: 155200 }, 2020: { pay: 78691, fte: 1, cap: 201000 },
           2021: { pay: 89182, fte: 1 }, 2022: { pay: 93158, fte: 1, cap: 216000 }, 2023: { pay: 106264, fte: 1, cap: 223000 },
           2024: { pay: 114459, fte: 1, cap: 233000 }, 2025: { pay: 119914, fte: 1, cap: 246000 } },
    extra: [
      { label: "Pay change 2018 → 2025", value: "+101%", note: "€59.7k → €119.9k, but contract went from 0.8 to 1.0 FTE (full-time) in 2020. Per full-time equivalent: +61%." },
    ],
  },
  {
    id: "amj", name: "Anne Marleen de Jong", role: "Business director-board member", color: "#3ddbd9",
    from: 2023, to: null, tenure: "board member since 1 Jan 2023 (was business lead before)",
    bio: "Was business leader of the festival in the years before; appointed statutory director on 1 January 2023 so the board became a two-person directorate. Side activity listed: member of the core group of Verenigde Podiumkunsten Festivals.",
    pay: { 2023: { pay: 64753, fte: 0.84, cap: 187320 }, 2024: { pay: 70054, fte: 0.84, cap: 195720 }, 2025: { pay: 78216, fte: 0.84, cap: 207132 } },
    extra: [
      { label: "Pay change 2023 → 2025", value: "+21%", note: "€64.8k → €78.2k at a constant 0.84 FTE." },
    ],
  },
];

const SUPERVISORY = {
  title: "Supervisory board (Raad van Toezicht)",
  text: "Unpaid in 2025. From 1 January 2026 members receive €200 per meeting (chair €250). The board is chaired by Hans van Soelen (former head of cultural affairs, Utrecht); 2025 members: Hans van Soelen, Sem Bakker, Jorien Waanders, Mark Laagewaard, Ilayda Hagens, Nancy Poleon. The foundation follows the Cultural Governance Code.",
};

/*
 * Early years (2007-2016): no annual accounts are published for these years, only qualitative facts.
 * Source: nl.wikipedia.org/wiki/Le_Guess_Who%3F. Add or edit rows freely; they are shown in order.
 */
const EARLY_YEARS = {
  source: "https://nl.wikipedia.org/wiki/Le_Guess_Who%3F",
  note: "No annual accounts for 2007–2016 are published on the ANBI page, so there are no financial charts for these years. 2016 is only available as a comparison column in the 2017 report. The timeline below is based on public sources (Wikipedia).",
  items: [
    { year: 2007, days: 2, text: "First edition, founded by Johan Gijsen and Bob van Heur. Two days." },
    { year: 2008, days: 3, text: "Grows to three days." },
    { year: 2009, days: 4, text: "Four days." },
    { year: 2010, days: 5, text: "Peak length so far: five days." },
    { year: 2011, days: 3, text: "Scaled back to three days." },
    { year: 2013, text: "Wins the “IJzeren Podiumdier” (Iron Stage Animal) for best festival of 2012, awarded by the Dutch association of pop venues and festivals (VNPF)." },
    { year: 2014, text: "Wins the same award in two categories: best festival and best programmer." },
    { year: 2016, text: "Receives a multi-year subsidy of €125,000 per year from the Performing Arts Fund (Fonds Podiumkunsten). Earliest year with figures on this site." },
    { year: 2019, text: "About 20,000 visitors from 61 countries." },
  ],
};

/*
 * ESTIMATED FEE PER ACT (a model, NOT published numbers). Acts per year come from lineups.js
 * (generated by tools/build_lineups.py).
 *   pool      = artist costs of the year (cost.artists) x gageShare   (rest = travel, hotel, visas, backline)
 *   score     = weighted sum (0-100) of the factors below
 *   fee       = pool x score^2 / sum(score^2 x showWeight of all acts that year)   (convex: fees are skewed towards headliners)
 *   showWeight = 1 + repeatFactor x (shows - 1): an act playing twice gets 1.2x the fee of a single show
 *   interval  = fee x interval[0] ... fee x interval[1]  (80%, uncertainty of pool share and of the scores)
 * Years without an annual report: add them to ESTIMATED_ARTIST_COSTS (euros) - they are shown as "estimate".
 */
const FEE_MODEL = {
  gageShare: 0.70,
  repeatFactor: 0.2,
  gageShareRange: [0.59, 0.80],
  interval: [0.55, 1.8],
  minScore: 5,
  panelScore: 1,
  weights: {
    stage: { w: 26, short: "Room", label: "Room (timetable)", how: "Largest room the act plays on the clashfinder timetable: Ronda = 100 (capacity 2,000), Grote Zaal = 92 (1,717), Pandora = 60 (625), Hertz = 55 (543), Stadsschouwburg Main Room = 55, churches = 50, Cloud Nine = 45 (400), dB's Main Stage = 40, dB's Bar = 30, other = 25–40. Not available for 2018 and 2019 (weight is redistributed)." },
    position: { w: 17, short: "Prime time", label: "Prime time position", how: "Set starts between 20:00 and 23:00 in a room of Hertz size or bigger = 100, starts one hour either side (19:00–20:00, 23:00–24:00) = 50, otherwise 20. Not available for 2018 and 2019." },
    opening: { w: 9, short: "Opener / closer", label: "Opening or closing act", how: "Opens the festival (Thursday, start 18:00–20:30) or closes it (last day, start 19:00–21:00) in a main room (Grote Zaal or Ronda) = 100, otherwise 0. Not available for 2018 and 2019." },
    duration: { w: 8, short: "Length", label: "Slot length", how: "Length in minutes of the act's longest set on the timetable, scaled linearly: 30 min or shorter = 0, 60 min = 33, 75 min = 50, 90 min = 67, 120 min or longer = 100. So a score of 50 means a 75-minute set. Not available for 2018 and 2019 (weight is redistributed)." },
    billing: { w: 17, short: "Billing", label: "Billing", how: "How prominently the act was announced: curator or named in the first announcement = 100, named in a later announcement = 80, only in an additions list = 60, only on the line-up page = 45." },
    ensemble: { w: 4, short: "Ensemble", label: "Ensemble size", how: "From the act name: orchestra / band / ensemble / collective = 100, collaboration (&, +, x, feat., presents) = 65, solo or DJ = 15, otherwise 45." },
    commission: { w: 4, short: "Commis.", label: "Special commission", how: "Curator = 100, collaboration or ‘presents / performing / premiere’ project = 50, otherwise 0." },
    legend: { w: 15, short: "Legend", label: "Legend status", how: "Reputation, independent of scheduling, from Spotify play counts: up to 20 tracks of the artist are summed (a sample, as Spotify search is not ranked by popularity) and put on a log scale: 100,000 plays = 0, 10 million = 50, 1 billion = 100. Collaborations take the best score of the parts. Streaming favours current popularity over history, so older legends with few streams score low. Acts not on Spotify score 0. Available for every year." },
  },
};
const ESTIMATED_ARTIST_COSTS = { 2026: 600000 };

const SOURCES = YEARS.filter(y => y.report).map(y => ({ year: y.year, url: y.report }))
  .concat([{ year: "plan", url: BASE + "Samenvatting%20meerjarenplan%2025-28.pdf", label: "Plan 2025–2028 (summary)" }]);
