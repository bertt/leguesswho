/* Le Guess Who? finances – rendering. All numbers live in data.js. */
const Y = YEARS.slice().sort((a, b) => a.year - b.year);
const COL = { pink: "#5b9dff", yellow: "#ffd23f", teal: "#3ddbd9", violet: "#8b6bff", green: "#4ade80", red: "#ff6b6b", orange: "#ff9f43", blue: "#a3e635", grey: "#8c85a8" };
const PAL = [COL.pink, COL.yellow, COL.teal, COL.violet, COL.orange, COL.blue, COL.green, COL.grey];

/* ---------- helpers (also used by data.js) ---------- */
const sum = (o, keys) => (keys || Object.keys(o || {})).reduce((s, k) => s + (+(o || {})[k] || 0), 0);
const totalRev = y => sum(y.rev);
const totalCost = y => sum(y.cost);
const subsidies = y => sum(y.rev, ["fpk", "province", "city", "otherPublic"]);
const salaries = y => sum(y.cost, ["staffCore", "staffTemp"]);
const artistFees = y => sum(y.cost, ["artists", "artistsOther", "otherPeople"]);
const festVisitors = y => (y.visitors && y.visitors.festival) || 0;
const totalVisitors = y => {
  const v = y.visitors; if (!v) return 0;
  return v.total || sum(v, ["festival", "cosmos", "city", "other", "combined"]);
};
const ticketPerVisitor = y => (y.rev.tickets && festVisitors(y) ? y.rev.tickets / festVisitors(y) : null);

const nf = new Intl.NumberFormat("en-US");
const eur = v => v == null ? "—" : (v < 0 ? "−" : "") + "€" + nf.format(Math.round(Math.abs(v)));
const eurShort = v => {
  if (v == null) return "—";
  const a = Math.abs(v), s = v < 0 ? "−" : "";
  if (a >= 1e6) return s + "€" + (a / 1e6).toFixed(a >= 1e7 ? 0 : 2).replace(/\.?0+$/, "") + "M";
  if (a >= 1e3) return s + "€" + Math.round(a / 1e3) + "k";
  return s + "€" + Math.round(a);
};
const num = v => v == null ? "—" : nf.format(Math.round(v));
const el = id => document.getElementById(id);
const h = (tag, cls, html) => { const e = document.createElement(tag); if (cls) e.className = cls; if (html != null) e.innerHTML = html; return e; };
const esc = s => String(s).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
const labels = Y.map(y => y.year + (y.partial ? "*" : ""));

/* ---------- sanity check ---------- */
Y.forEach(y => { if (Math.abs(totalRev(y) - totalCost(y) - y.result) > 15000) console.warn("Check " + y.year + ": revenue − costs differs from reported result by", Math.round(totalRev(y) - totalCost(y) - y.result)); });

/* ---------- generic SVG chart ---------- */
function niceTicks(min, max, n) {
  if (min === max) { max = min + 1; }
  const raw = (max - min) / n, p = Math.pow(10, Math.floor(Math.log10(raw)));
  const step = [1, 2, 2.5, 5, 10].map(m => m * p).find(s => s >= raw);
  const t = []; for (let v = Math.floor(min / step) * step; ; v += step) { t.push(v); if (v >= max - step * 0.001) break; }
  return t;
}

function chart(target, o) {
  const box = el(target); box.innerHTML = "";
  const fmt = o.fmt || eurShort, tipFmt = o.tipFmt || fmt;
  const W = 720, H = o.height || 300, L = 52, R = 10, T = 12, B = 26;
  const n = o.labels.length, bars = o.series.filter(s => s.type !== "line"), lines = o.series.filter(s => s.type === "line");
  const stackSum = i => o.stack ? bars.reduce((s, x) => s + Math.max(0, x.data[i] || 0), 0) : null;
  let lo = 0, hi = 0;
  o.series.forEach(s => s.data.forEach((v, i) => { if (v == null) return; lo = Math.min(lo, v); hi = Math.max(hi, v); }));
  if (o.stack) for (let i = 0; i < n; i++) hi = Math.max(hi, stackSum(i));
  const ticks = niceTicks(lo, hi, 5); lo = ticks[0]; hi = ticks[ticks.length - 1];
  const x = i => L + (i + 0.5) * (W - L - R) / n, bw = (W - L - R) / n;
  const yy = v => T + (hi - v) * (H - T - B) / (hi - lo);
  let svg = `<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="${esc(o.aria || "chart")}">`;
  if (o.covid) o.labels.forEach((l, i) => { if (/^202[01]/.test(l)) svg += `<rect x="${x(i) - bw / 2}" y="${T}" width="${bw}" height="${H - T - B}" fill="#8b6bff" opacity=".1"/>`; });
  ticks.forEach(t => { svg += `<line class="${t === 0 ? "zero" : "grid"}" x1="${L}" x2="${W - R}" y1="${yy(t)}" y2="${yy(t)}"/><text x="${L - 6}" y="${yy(t) + 4}" text-anchor="end">${fmt(t)}</text>`; });
  o.labels.forEach((l, i) => { svg += `<text x="${x(i)}" y="${H - 8}" text-anchor="middle">${l}</text>`; });
  const nb = o.stack ? 1 : bars.length, gw = bw * 0.72, sw = gw / nb;
  for (let i = 0; i < n; i++) {
    let acc = 0;
    bars.forEach((s, k) => {
      const v = s.data[i]; if (v == null) return;
      const c = s.colorFn ? s.colorFn(v, i) : s.color;
      let y0, y1, bx;
      if (o.stack) { y0 = yy(acc); acc += Math.max(0, v); y1 = yy(acc); bx = x(i) - gw / 2; }
      else { y0 = yy(0); y1 = yy(v); bx = x(i) - gw / 2 + k * sw; }
      const top = Math.min(y0, y1), hgt = Math.abs(y0 - y1);
      svg += `<rect x="${bx + 0.5}" y="${top}" width="${Math.max(1, (o.stack ? gw : sw) - 1)}" height="${Math.max(hgt, v ? 1 : 0)}" rx="2" fill="${c}"/>`;
    });
  }
  lines.forEach(s => {
    let d = "", pen = false;
    s.data.forEach((v, i) => { if (v == null) { pen = false; return; } d += (pen ? "L" : "M") + x(i) + " " + yy(v); pen = true; });
    svg += `<path d="${d}" fill="none" stroke="${s.color}" stroke-width="2.5" ${s.dash ? 'stroke-dasharray="5 4"' : ""} stroke-linejoin="round"/>`;
    s.data.forEach((v, i) => { if (v != null) svg += `<circle cx="${x(i)}" cy="${yy(v)}" r="3.5" fill="${s.color}"/>`; });
  });
  for (let i = 0; i < n; i++) svg += `<rect class="hit" data-i="${i}" x="${x(i) - bw / 2}" y="${T}" width="${bw}" height="${H - T - B}" fill="transparent"/>`;
  svg += "</svg>";
  box.innerHTML = svg;
  const lg = h("div", "legend");
  o.series.forEach(s => { if (s.legend !== false) lg.appendChild(h("span", "", esc(s.name))).style.setProperty("--c", s.color || s.colorFn && s.colorFn(1)); });
  box.appendChild(lg);
  if (o.footnote) box.appendChild(h("p", "note", o.footnote));
  const tip = el("tip");
  box.querySelectorAll(".hit").forEach(r => {
    const show = e => {
      const i = +r.dataset.i;
      let t = `<b>${o.labels[i]}</b>`;
      o.series.forEach(s => { if (s.data[i] != null && s.legend !== false) t += `<span style="--c:${s.color || s.colorFn(s.data[i], i)}">${esc(s.name)}: ${tipFmt(s.data[i])}</span><br>`; });
      if (o.stack) t += `<b style="margin-top:4px">Total: ${tipFmt(stackSum(i))}</b>`;
      if (o.extra && o.extra[i]) t += `<i>${o.extra[i]}</i>`;
      tip.innerHTML = t; tip.hidden = false;
      const w = tip.offsetWidth; tip.style.left = Math.min(e.clientX + 14, innerWidth - w - 8) + "px"; tip.style.top = Math.max(8, e.clientY - 20) + "px";
    };
    r.addEventListener("mousemove", show); r.addEventListener("click", show);
    r.addEventListener("mouseleave", () => tip.hidden = true);
  });
}

/* ---------- derived data ---------- */
const last = Y[Y.length - 1], prev = Y[Y.length - 2];
const pct = (a, b) => (b ? (a - b) / Math.abs(b) * 100 : null);
const comparablePrev = (y, p, key) => (y.restated2024 && p && p.year === y.year - 1 && y.restated2024[key] != null) ? y.restated2024[key] : null;

/* ---------- hero ---------- */
el("lead").innerHTML = `${esc(SITE.foundation)} runs the Utrecht festival <b>Le Guess Who?</b>. This page turns its published annual accounts (${esc(SITE.generated.replace("Based on the annual reports published for ", ""))}) into pictures anyone can follow – no accounting degree needed. In <b>${last.year}</b> the foundation had <b>${eurShort(totalRev(last))}</b> revenue and a result of <b>${eurShort(last.result)}</b>.`;

function kpi(label, value, delta, goodUp, abs) {
  const cls = delta == null || Math.abs(delta) < 0.5 ? "flat" : ((delta > 0) === goodUp ? "up" : "down");
  const arrow = delta == null ? "" : delta > 0 ? "▲" : "▼";
  const d = delta == null ? "" : `<i class="${cls}">${arrow} ${abs ? eurShort(Math.abs(delta)) : Math.abs(delta).toFixed(0) + "%"} vs ${prev.year}</i>`;
  return `<div class="kpi"><small>${label}</small><b>${value}</b>${d}</div>`;
}
const artistsPrev = last.restated2024 && last.classificationChange ? sum(last.restated2024, ["artists"]) : artistFees(prev);
el("kpis").innerHTML = [
  kpi("Total revenue", eurShort(totalRev(last)), pct(totalRev(last), totalRev(prev)), true),
  kpi("Total costs", eurShort(totalCost(last)), pct(totalCost(last), totalCost(prev)), false),
  kpi("Result (profit/loss)", eurShort(last.result), last.result - prev.result, true, true),
  kpi("Festival visitors", num(festVisitors(last)), pct(festVisitors(last), festVisitors(prev)), true),
  kpi("Ticket revenue / visitor", "€" + (ticketPerVisitor(last) || 0).toFixed(0), pct(ticketPerVisitor(last), ticketPerVisitor(prev)), true),
  kpi("Salary costs", eurShort(salaries(last)), pct(salaries(last), salaries(prev)), false),
  kpi("Artist fees", eurShort(artistFees(last)), pct(artistFees(last), artistsPrev), false),
  kpi("Equity (own money)", eurShort(last.bal.equity), last.bal.equity - prev.bal.equity, true, true),
].join("");

/* ---------- nav & glossary ---------- */
el("nav").innerHTML = [...document.querySelectorAll("#about, main section")].map(s => `<a href="#${s.id}">${s.id === "about" ? "About" : s.querySelector("h2").textContent.split(/[,&?]/)[0]}</a>`).join("");
el("glossary").innerHTML = [
  ["Revenue", "All money coming in: tickets, subsidies from the city, province and funds, sponsors, bar sales."],
  ["Costs", "All money going out: fees for bands, venue hire, salaries, marketing."],
  ["Result", "Revenue minus costs. Positive = surplus, negative = deficit."],
  ["Equity", "The foundation's own buffer built up over the years. It absorbs losses; if it runs out, trouble starts."],
  ["Cash vs equity", "Cash is the money in the bank today, including ticket money for next year's festival. Equity is what is left after all debts."],
].map(([a, b]) => `<div><b>${a}</b><p>${b}</p></div>`).join("");

/* ---------- charts ---------- */
const rev = k => Y.map(y => y.rev[k] != null ? y.rev[k] : 0);
chart("c-incomecost", {
  labels, covid: true,   aria: "Revenue versus costs per year",
    series: [{ name: "Revenue", color: COL.pink, data: Y.map(totalRev) }, { name: "Costs", color: COL.yellow, data: Y.map(totalCost) }],
  footnote: "Purple shading = COVID years (2020 festival cancelled, 2021 reduced). * 2016 comes from the comparison column of the 2017 report and is less certain.",
});
chart("c-result", {
  labels, covid: true, aria: "Result per year",
  series: [{ name: "Actual result", data: Y.map(y => y.result), colorFn: v => v >= 0 ? COL.green : COL.red },
           { name: "Budgeted result", type: "line", color: COL.yellow, dash: true, data: Y.map(y => y.budgetResult) }],
});
chart("c-bal", {
  labels, aria: "Bank balance, equity and debt",
  series: [{ name: "Cash at bank", type: "line", color: COL.teal, data: Y.map(y => y.bal && y.bal.cash) },
           { name: "Equity (own capital)", type: "line", color: COL.pink, data: Y.map(y => y.bal && y.bal.equity) },
           { name: "Short-term debt", type: "line", color: COL.yellow, data: Y.map(y => y.bal && y.bal.debt) }],
});
chart("c-visitors", {
  labels, stack: true, covid: true, fmt: num, aria: "Visitors per year",
  series: [{ name: "Festival (paying visitors)", color: COL.pink, data: Y.map(y => y.visitors && y.visitors.festival || 0) },
           { name: "COSMOS (online, free – not paying)", color: COL.teal, data: Y.map(y => y.visitors && y.visitors.cosmos || 0) },
           { name: "U? (city festival)", color: COL.yellow, data: Y.map(y => y.visitors && y.visitors.city || 0) },
           { name: "Other", color: COL.red, data: Y.map(y => y.visitors && y.visitors.other || 0) },
           { name: "U? + COSMOS (not split in report)", color: COL.blue, data: Y.map(y => y.visitors && y.visitors.combined || 0) }],
  extra: Y.map(y => y.visitors && y.visitors.note || ""),
  footnote: "Only the blue “Festival” bars are paying visitors. COSMOS (online) and U? (city programme) are free to access: they count people reached, not ticket buyers or revenue. 2020 = online stream only (festival cancelled). Some years are rounded (“about 20,000”) in the report.",
});
chart("c-ppv", { labels, fmt: v => "€" + v.toFixed(0), aria: "Ticket revenue per festival visitor",
  series: [{ name: "Ticket revenue per festival visitor", type: "line", color: COL.pink, data: Y.map(ticketPerVisitor) }],
  footnote: "Ticket revenue ÷ festival visitors. Not the price of one ticket: it mixes passes, day tickets, discounts and fees." });

const subs = Y.map(subsidies);
chart("c-revmix", {
  labels, stack: true, covid: true, aria: "Revenue by source",
  series: [{ name: "Tickets", color: COL.pink, data: rev("tickets") },
           { name: "Subsidies (city, province, FPK…)", color: COL.teal, data: subs },
           { name: "COVID support", color: COL.violet, data: rev("covid") },
           { name: "Funds, companies, donors", color: COL.yellow, data: Y.map(y => sum(y.rev, ["individuals", "companies", "funds"])) },
           { name: "Other earned (partners, bar, merch…)", color: COL.orange, data: Y.map(y => sum(y.rev, ["partnerships", "sponsors", "horeca", "merch", "participants", "otherEarned", "indirect"])) }],
});
chart("c-costmix", {
  labels, stack: true, covid: true, aria: "Costs by type",
  series: [{ name: "Salaries", color: COL.pink, data: Y.map(salaries) },
           { name: "Artist fees", color: COL.yellow, data: Y.map(artistFees) },
           { name: "Venues & locations", color: COL.teal, data: Y.map(y => y.cost.locations || 0) },
           { name: "Other programme", color: COL.violet, data: Y.map(y => (y.cost.program || 0) + (y.cost.education || 0)) },
           { name: "Marketing", color: COL.orange, data: Y.map(y => y.cost.marketing || 0) },
           { name: "Office & overhead", color: COL.grey, data: Y.map(y => y.cost.overhead || 0) }],
  extra: Y.map(y => y.classificationChange ? "Venues &amp; locations: 2024 restated as " + eurShort(y.restated2024.locations) + " (was " + eurShort(Y[Y.indexOf(y) - 1].cost.locations) + ") – costs were moved here from other programme costs." : ""),
  footnote: "<b>Venues &amp; locations</b> = venue rent, technical production (sound, light, stage), security and permits, paid to locations in the city. The reports show one line without a breakdown. The 2025 report moved costs into this line (and into artist fees): 2024 restated is " + eurShort(last.restated2024 ? last.restated2024.locations : 0) + " instead of " + eurShort(prev.cost.locations) + ", so 2025 is not comparable with earlier years.",
});
chart("c-artists", {
  labels, covid: true, aria: "Artist fees",
  series: [{ name: "Artist fees (as reported)", color: COL.yellow, data: Y.map(artistFees) },
           { name: "2024 restated in 2025 report", type: "line", color: COL.pink, data: Y.map(y => y.year === last.year && last.restated2024 ? last.restated2024.artists : (y.year === prev.year && last.restated2024 ? last.restated2024.artists : null)) }]
});
const artistCount = last.artistCount;
el("artist-note").innerHTML = `<b>Most expensive bands?</b> The annual reports only publish <i>totals</i> for artist fees, never per band, so no individual fees can be shown. Rough idea: ${eurShort(artistFees(last))} spread over roughly 150–180 artists is about €3–4k each on average – headliners earn far more, many smaller acts far less.`;
chart("c-salary", {
  labels, stack: true, covid: true, aria: "Salary costs",
  series: [{ name: "Permanent staff", color: COL.pink, data: Y.map(y => y.cost.staffCore || 0) },
           { name: "Temporary / festival staff", color: COL.teal, data: Y.map(y => y.cost.staffTemp || 0) }],
  extra: Y.map(y => (y.fte ? y.fte + " FTE" : "") + (y.volunteers ? " · " + y.volunteers + " volunteers" : "")),
  footnote: `${last.year}: ${last.fte} full-time equivalents (FTE) on payroll and ${last.volunteers} volunteers. Hover a bar to see staff numbers per year.`,
});

/* ---------- directors ---------- */
const dirLabels = labels;
chart("c-directors", {
  labels: dirLabels, aria: "Director pay per year",
  series: PEOPLE.map(p => ({ name: p.name, type: "line", color: p.color, data: Y.map(y => p.pay[y.year] ? p.pay[y.year].pay : null) })),
  extra: Y.map(y => PEOPLE.filter(p => p.pay[y.year]).map(p => p.name.split(" ")[0] + ": " + p.pay[y.year].fte + " FTE").join(" · ")),
  footnote: "Total pay incl. expenses and pension, at each person's contract size (FTE). Hover for FTE.",
});
el("people-cards").innerHTML = PEOPLE.map(p => {
  const yrs = Object.keys(p.pay).map(Number).sort();
  const first = p.pay[yrs[0]], lastp = p.pay[yrs[yrs.length - 1]];
  const facts = [
    { l: "Earliest published pay", v: eur(first.pay) + " (" + yrs[0] + ")", n: first.fte + " FTE" },
    { l: "Latest published pay", v: eur(lastp.pay) + " (" + yrs[yrs.length - 1] + ")", n: lastp.fte + " FTE" + (lastp.cap ? " · legal cap " + eur(lastp.cap) : "") },
    ...(p.extra || []).map(e => ({ l: e.label, v: e.value, n: e.note })),
  ];
  return `<article class="person" style="--c:${p.color}"><h3>${esc(p.name)}</h3><p class="role">${esc(p.role)} · ${esc(p.tenure)}</p><p>${esc(p.bio)}</p><div class="facts">${facts.map(f => `<div class="fact"><small>${esc(f.l)}</small><b>${esc(f.v)}</b><small>${esc(f.n || "")}</small></div>`).join("")}</div></article>`;
}).join("");
el("supervisory").innerHTML = `<b>${esc(SUPERVISORY.title)}.</b> ${esc(SUPERVISORY.text)}`;

/* ---------- tickets ---------- */
const tk = Y.filter(y => y.tickets);
el("tickets").innerHTML = `<p class="note" style="margin-top:0"><b>Passes (paspartout) vs. day tickets:</b> the reports do <u>not</u> publish a number split. What they do say:</p>
<ul class="ticket-list">${TICKET_FACTS.map(t => `<li><b>${t.year}</b> – ${esc(t.text)}</li>`).join("")}</ul>
${(() => {
  const m = TICKET_MODEL, n = v => Math.round(v).toLocaleString("en-GB");
  const rows = Y.filter(y => TICKET_PRICES[y.year] && y.rev.tickets).map(y => {
    const p = TICKET_PRICES[y.year], net = y.rev.tickets * m.vat;
    return `<tr><td>${y.year}</td><td>€${p.day}</td><td>€${p.pass}</td><td>~${n(net * m.passShare / p.pass)}</td><td>~${n(net * (1 - m.passShare) / p.day)}</td></tr>`;
  }).join("");
  return `<div class="scroll"><table class="heat"><thead><tr><th>Year</th><th>Day ticket</th><th>Pass</th><th>Est. passes</th><th>Est. day tickets</th></tr></thead><tbody>${rows}</tbody></table></div>
<p class="note">Prices are list prices incl. fees (avg. standard day ticket, regular pass; 2020 cancelled). <b>Counts are rough estimates, not reported figures:</b> ticket revenue + 9% VAT, assuming ${Math.round(m.passShare * 100)}% of revenue comes from passes; discounts, early-bird prices and free tickets are ignored, so real counts are probably somewhat higher.</p>`;
})()}
${tk.length ? `<p class="note">Discount tickets sold: ${tk.map(y => `<b>${y.year}</b>: CJP ${y.tickets.cjp || "—"}, U-pas ${y.tickets.upas || "—"}, low-income day tickets ${y.tickets.lowIncome || "—"}`).join(" · ")}.</p>` : ""}`;

const tkYears = Y.filter(y => y.year >= 2017);
const tkEst = y => {
  const p = TICKET_PRICES[y.year];
  if (!p || !y.rev.tickets) return null;
  const net = y.rev.tickets * TICKET_MODEL.vat;
  return { pass: net * TICKET_MODEL.passShare / p.pass, day: net * (1 - TICKET_MODEL.passShare) / p.day };
};
function drawTickets() {
  const price = document.querySelector('input[name="tk-mode"]:checked').value === "price";
  const pick = f => tkYears.map(y => f(y));
  chart("c-tickets", {
    labels: tkYears.map(y => String(y.year)), covid: true, height: 320,
    fmt: price ? v => "€" + Math.round(v) : num,
    aria: price ? "Ticket prices per year" : "Estimated passes and day tickets sold per year",
    series: price
      ? [{ name: "Pass (4 days)", color: COL.pink, data: pick(y => (TICKET_PRICES[y.year] || {}).pass ?? null) },
         { name: "Day ticket (avg.)", color: COL.yellow, data: pick(y => (TICKET_PRICES[y.year] || {}).day ?? null) }]
      : [{ name: "Passes (est.)", color: COL.pink, data: pick(y => (tkEst(y) || {}).pass ?? null) },
         { name: "Day tickets (est.)", color: COL.yellow, data: pick(y => (tkEst(y) || {}).day ?? null) }],
    footnote: price ? "List prices incl. service fees; regular (not early-bird) pass price. 2020: festival cancelled." : "Rough estimates, not reported figures – see “All text & data”. 2020: festival cancelled.",
  });
}
document.querySelectorAll('input[name="tk-mode"]').forEach(r => r.addEventListener("change", drawTickets));
drawTickets();
el("tk-info").addEventListener("click", () => el("tk-dialog").showModal());
el("tk-dialog").addEventListener("click", e => { if (e.target === e.currentTarget) e.currentTarget.close(); });

/* ---------- heatmap ---------- */
const rows = [
  ["Total revenue", y => totalRev(y)], ["Ticket revenue", y => y.rev.tickets], ["Subsidies", subsidies], ["Partnerships & sponsors", y => sum(y.rev, ["partnerships", "sponsors"])],
  ["Total costs", totalCost], ["Salaries", salaries, "staff"], ["Artist fees", artistFees, "artists"], ["Venues & locations", y => y.cost.locations, "locations"],
  ["Marketing", y => y.cost.marketing, "marketing"], ["Festival visitors", festVisitors], ["All visitors", totalVisitors],
];
let ht = `<table class="heat"><thead><tr><th>Change vs previous year</th>${Y.slice(1).map(y => `<th>${y.year}</th>`).join("")}</tr></thead><tbody>`;
rows.forEach(([name, fn, rk]) => {
  ht += `<tr><td>${name}</td>`;
  Y.slice(1).forEach((y, i) => {
    const p = Y[i], cur = fn(y), re = rk && rk !== "staff" ? comparablePrev(y, p, rk) : null;
    const before = re != null ? re : fn(p), c = pct(cur, before);
    const cls = c == null || !isFinite(c) ? "" : c > 50 ? "h2" : c > 25 ? "h1" : c < -50 ? "c2" : c < -25 ? "c1" : "";
    ht += `<td class="${cls}">${c == null || !isFinite(c) ? "—" : (c > 0 ? "+" : "") + c.toFixed(0) + "%"}</td>`;
  });
  ht += "</tr>";
});
el("heatmap").innerHTML = ht + "</tbody></table>";

/* ---------- early years ---------- */
el("early-note").innerHTML = esc(EARLY_YEARS.note) + ` <a href="${EARLY_YEARS.source}">Source</a>`;
el("timeline").innerHTML = EARLY_YEARS.items.map(i => `<div class="tl"><b>${i.year}</b><div>${i.days ? `<span class="tag info">${i.days} day${i.days > 1 ? "s" : ""}</span>` : ""}<p>${esc(i.text)}</p></div></div>`).join("");

/* ---------- ANBI check ---------- */
(function () {
  const cum = Y.reduce((s, y) => s + y.result, 0), cumRev = Y.reduce((s, y) => s + totalRev(y), 0);
  const ratio = last.bal.equity / totalCost(last);
  const lastPay = PEOPLE.map(p => { const k = Object.keys(p.pay).map(Number).sort().pop(); return { p, k, v: p.pay[k] }; }).filter(x => x.k === last.year && x.v.cap);
  const maxShare = Math.max(...lastPay.map(x => x.v.pay / x.v.cap));
  const sub = Math.round(100 * subsidies(last) / totalRev(last));
  const cards = [
    ["good", "No profit motive", `Cumulative result ${Y[0].year}–${last.year}: ${eurShort(cum)} on ${eurShort(cumRev)} revenue (${(100 * cum / cumRev).toFixed(1)}%). Surpluses in 2020–21 came from COVID support and were later used.`],
    [ratio <= 1.5 ? (ratio < 0.25 ? "warn" : "good") : "warn", "Reasonable reserve", `Equity ${eurShort(last.bal.equity)} = ${(ratio * 100).toFixed(0)}% of yearly costs (about ${(ratio * 12).toFixed(1)} months). The tax authority tolerates up to roughly 1.5× yearly costs, so there is no hoarding${ratio < 0.25 ? " – the buffer is actually thin" : ""}.`],
    [maxShare < 1 ? "good" : "warn", "No excessive pay", `Highest director pay in ${last.year} is ${(maxShare * 100).toFixed(0)}% of the legal WNT maximum. ` + lastPay.map(x => `${x.p.name}: ${eur(x.v.pay)} of ${eur(x.v.cap)}`).join("; ") + "."],
    ["good", "Severance within limits", "Johan Gijsen's 2022 termination payment of €33,362 is below the legal maximum of €75,000."],
    ["info", "Public money", `${sub}% of ${last.year} revenue is subsidy (city, province, funds). Typical for a cultural ANBI and not a problem by itself.`],
    ["good", "Transparency", `Annual reports and director pay are published on the foundation's <a href="${SITE.anbiPage}">ANBI page</a>, as required.`],
    ["warn", "Watch-outs", `Deficits in 2022–2024 (total ${eurShort(Y.filter(y => y.year >= 2022 && y.year <= 2024).reduce((s, y) => s + y.result, 0))}) reduced the buffer. Not published (not required): fees per band, passes vs day tickets.`],
  ];
  el("anbi-cards").innerHTML = cards.map(([t, title, text]) => `<article class="insight"><span class="tag ${t}">${t === "good" ? "OK" : t === "warn" ? "Watch" : "Info"}</span><h3>${title}</h3><p>${text}</p></article>`).join("");
})();

/* ---------- estimated fee per act ---------- */
{
  const M = FEE_MODEL, hasCosts = yr => (Y.find(y => y.year === yr)?.cost.artists ?? ESTIMATED_ARTIST_COSTS[yr]) != null;
  const feeYears = Object.keys(LINEUPS).map(Number).filter(hasCosts).sort((a, b) => a - b);
  const clamp = v => Math.max(0, Math.min(100, v));
  const poolOf = yr => {
    const rep = Y.find(y => y.year === yr), costs = rep ? rep.cost.artists : ESTIMATED_ARTIST_COSTS[yr];
    return { costs, estimate: !rep, pool: costs == null ? null : costs * M.gageShare };
  };
  const fees = yr => {
    const { pool } = poolOf(yr);
    const rows = LINEUPS[yr].map(a => {
      const f = { stage: a.s, position: a.p, opening: a.o, duration: a.d == null ? null : clamp((a.d - 30) / 90 * 100), billing: a.b, ensemble: a.e, commission: a.c, legend: LEGENDS[a.n] || 0 };
      const keys = Object.keys(M.weights).filter(k => f[k] != null), ws = keys.reduce((s, k) => s + M.weights[k].w, 0);
      const score = a.k ? M.panelScore : Math.max(M.minScore, keys.reduce((s, k) => s + M.weights[k].w * f[k], 0) / ws);
      return { ...a, f, score, x: a.x || 1, wt: 1 + M.repeatFactor * ((a.x || 1) - 1) };
    });
    const tot = rows.reduce((s, r) => s + r.wt * r.score * r.score, 0);
    rows.forEach(r => { r.one = pool * r.score * r.score / tot; r.fee = r.one * r.wt; });
    return rows.sort((a, b) => b.fee - a.fee);
  };
  const k = v => "€" + nf.format(Math.round(v / 100) / 10) + "k";
  const sel = el("fee-year");
  sel.innerHTML = feeYears.slice().reverse().map(y => `<option value="${y}">${y}${poolOf(y).estimate ? " (estimate)" : ""}</option>`).join("");
  sel.value = Math.max(...feeYears);
  let showAll = false;
  const render = () => {
    const yr = +sel.value, p = poolOf(yr), rows = fees(yr), list = showAll ? rows : rows.slice(0, 25);
    el("fee-summary").innerHTML = `<b>${yr}</b>: artist costs ${eur(p.costs)}${p.estimate ? " (<b>estimate</b>, no annual report yet)" : ""} × ${Math.round(M.gageShare * 100)}% pure fees = <b>${eur(p.pool)}</b> spread over ${rows.length} acts found (average ${k(p.pool / rows.length)}). If the real number of acts is higher than the ${rows.length} found, fees are overestimated.`;
    const fk = Object.keys(M.weights);
    el("fee-table").innerHTML = `<table class="heat fees"><thead><tr><th>#</th><th>Act</th><th>Room</th><th>Start</th><th>Length</th><th>Score</th><th>Estimated fee</th><th>80% interval</th>${fk.map(key => `<th class="fac" title="${esc(M.weights[key].label)} – weight ${M.weights[key].w}%">${esc(M.weights[key].short)}<br><small>${M.weights[key].w}%</small></th>`).join("")}</tr></thead><tbody>${list.map((r, i) =>
      `<tr${r.u ? ' class="cur"' : ""}><td>${i + 1}</td><td>${esc(r.n)}${r.k ? ' <small>(panel)</small>' : ""}${r.x > 1 ? ` <small>(${r.x}× performing)</small>` : ""}</td><td>${r.r ? esc(r.r.replace(/^(TivoliVredenburg|TV)( - |\s+)/, "")) : "–"}</td><td>${r.t ? esc(r.t) : "–"}</td><td>${r.r && r.d ? r.d + " min" : "–"}</td><td>${r.score.toFixed(0)}</td><td><b>${k(r.fee)}</b>${r.x > 1 ? `<br><small>${r.wt} × ${k(r.one)}</small>` : ""}</td><td>${k(r.fee * M.interval[0])} – ${k(r.fee * M.interval[1])}</td>${fk.map(key => r.f[key] == null ? '<td class="fac na">–</td>' : `<td class="fac" ${key === "duration" ? `title="${r.f[key] >= 100 ? "120+" : r.f[key] <= 0 ? "30 or less" : Math.round(30 + r.f[key] * 0.9)} min"` : ""} style="background:rgba(60,120,200,${(r.f[key] / 100 * 0.35).toFixed(2)})">${Math.round(r.f[key])}</td>`).join("")}</tr>`).join("")}</tbody></table>`;
    el("fee-more").textContent = showAll ? "Show top 25 only" : `Show all ${rows.length} acts`;
  };
  sel.addEventListener("change", () => { showAll = false; render(); });
  el("fee-info").addEventListener("click", () => el("fee-dialog").showModal());
  el("fee-dialog").addEventListener("click", e => { if (e.target === e.currentTarget) e.currentTarget.close(); });
  el("fee-more").addEventListener("click", () => { showAll = !showAll; render(); });
  render();

  const ranks = [[1, COL.pink], [3, COL.yellow], [5, COL.teal], [10, COL.blue]];
  const perYear = feeYears.map(fees);
  chart("c-feetop", {
    labels: feeYears.map(y => poolOf(y).estimate ? y + "*" : String(y)), fmt: k, aria: "Estimated fee of the top acts per year",
    series: ranks.map(([r, c]) => ({ name: r === 1 ? "#1 act" : "#" + r + " act", type: "line", color: c, data: perYear.map(rows => rows[r - 1] ? rows[r - 1].fee : null) }))
      .concat([{ name: "Average act", type: "line", color: COL.red, dash: true, data: feeYears.map((y, i) => poolOf(y).pool / perYear[i].length) }]),
    footnote: "Estimated fee of the #1, #3, #5 and #10 act per year, plus the average act. * = estimate (no annual report yet). Years differ in how complete the line-up data is, so small year-to-year moves are noise."
  });

  el("fee-steps").innerHTML = `<ol class="steps">
    <li><b>Pool</b> – artist costs of the year × ${Math.round(M.gageShare * 100)}% (range ${Math.round(M.gageShareRange[0] * 100)}–${Math.round(M.gageShareRange[1] * 100)}%; the rest is travel, hotel, visas, backline). This share is an assumption.</li>
    <li><b>Score</b> – weighted average (0–100) of the factors below, minimum ${M.minScore}.</li>
    <li><b>Fee</b> = pool × score² ÷ Σ score² of all acts that year. The square favours headliners. An act that plays more than once counts extra: two shows get ${1 + M.repeatFactor}× the fee of one show, each further show adds ${M.repeatFactor}×.</li>
    <li><b>80% interval</b> = fee × ${M.interval[0]} to × ${M.interval[1]}.</li></ol>`;
  el("fee-weights").innerHTML = `<div class="facs">${Object.values(M.weights).map(f => `<div class="fac-row"><div class="fac-head"><b>${esc(f.label)}</b><span>${f.w}%</span></div><div class="fac-bar"><i style="width:${f.w * 100 / Math.max(...Object.values(M.weights).map(x => x.w))}%"></i></div><p>${esc(f.how)}</p></div>`).join("")}</div>`;
  el("fee-formula").innerHTML = `Acts and rooms come from the foundation's news posts, archive pages, blokkenschema.nl (2023–2025) and the clashfinder timetables (2014–2018, 2021–2025) and the official timetables (2019 booklet, 2026); the 2018 and 2019 line-ups are less complete. Nothing here is validated against real fees. 2026 uses an assumed artist budget of ${eur(ESTIMATED_ARTIST_COSTS[2026])}.`;
}

/* ---------- insights, trivia, sources ---------- */
el("insight-cards").innerHTML = INSIGHTS.slice().sort((a, b) => a.year - b.year).map(i => `<article class="insight"><span class="yr">${i.year}</span> <span class="tag ${i.tag}">${esc(i.metric)}</span><span class="tag">${i.basis === "inference" ? "Our reading" : "From the report"}</span><h3>${esc(i.title)}</h3><p>${esc(i.text)}</p></article>`).join("");
el("trivia-cards").innerHTML = TRIVIA.map(t => `<div class="fun"><span class="icon">${t.icon}</span><b>${esc(String(t.value(Y)))}</b><strong>${esc(t.label)}</strong><p>${esc(t.text)}</p></div>`).join("");
el("caveats").innerHTML = [
  "Numbers are copied from PDF annual accounts (2018 was a scan, 2025 vector graphics) and checked against reported totals; small rounding differences are possible.",
  "2016 comes from the comparison column of the 2017 report and is marked with *.",
  "Per-band fees and the split between passes and day tickets are not published.",
  "Visitor numbers are as reported by the foundation; some are approximations.",
  "“Salaries” = staff costs of the core organisation plus temporary/festival staff.",
].map(t => `<li>${t}</li>`).join("");
el("source-links").innerHTML = `<a href="${SITE.anbiPage}">Official ANBI page</a><a href="data.js">Dataset used here (data.js)</a>` + SOURCES.map(s => `<a href="${s.url}">Annual report ${s.year}</a>`).join("");
window.addEventListener("scroll", () => el("tip").hidden = true, { passive: true });

/* ---------- artists with multiple shows ---------- */
{
  const years = Object.keys(LINEUPS).map(Number).filter(y => LINEUPS[y].some(a => a.w)).sort((a, b) => b - a);
  const sel = el("multi-year");
  sel.innerHTML = years.map(y => `<option value="${y}">${y}</option>`).join("");
  const render = () => {
    const rows = LINEUPS[+sel.value].filter(a => a.x > 1).sort((a, b) => b.x - a.x || a.n.localeCompare(b.n));
    el("multi-summary").innerHTML = `<b>${sel.value}</b>: ${rows.length} acts play more than once, ${rows.reduce((s, a) => s + a.x, 0)} shows in total.`;
    el("multi-table").innerHTML = `<table class="heat"><thead><tr><th>Act</th><th>Shows</th><th>When and where</th></tr></thead><tbody>${rows.map(a =>
      `<tr><td>${esc(a.n)}</td><td>${a.x}×</td><td>${a.w.map(esc).join("<br>")}</td></tr>`).join("")}</tbody></table>`;
  };
  sel.addEventListener("change", render);
  render();
  const asc = years.slice().reverse(), cnt = (y, f) => LINEUPS[y].filter(a => f(a.x || 1)).length;
  chart("c-multi", {
    labels: asc.map(String), fmt: num, aria: "Number of acts playing 2, 3 or 4+ times per year",
    series: [{ name: "2 shows", color: COL.pink, data: asc.map(y => cnt(y, x => x === 2)) },
             { name: "3 shows", color: COL.yellow, data: asc.map(y => cnt(y, x => x === 3)) },
             { name: "4 or more shows", color: COL.red, data: asc.map(y => cnt(y, x => x >= 4)) }],
    footnote: "Number of acts per year with 2, 3 or 4+ shows on the timetable. Timetables of some years may be incomplete.",
  });
}

/* highlight the tab of the section in view */
(function () {
  const links = [...document.querySelectorAll("#nav a")], secs = links.map(a => el(a.hash.slice(1)));
  const spy = () => {
    let cur = 0; secs.forEach((s, i) => { if (s.getBoundingClientRect().top < 120) cur = i; });
    links.forEach((a, i) => a.classList.toggle("active", i === cur));
    const a = links[cur], n = el("nav");
    if (a.offsetLeft < n.scrollLeft || a.offsetLeft + a.offsetWidth > n.scrollLeft + n.clientWidth) n.scrollLeft = a.offsetLeft - n.clientWidth / 2 + a.offsetWidth / 2;
  };
  addEventListener("scroll", spy, { passive: true }); spy();
})();
