"""
Builds lineups.js: performing acts per festival year plus the observable inputs for the fee model.

Run:  uv run --with requests python tools/build_lineups.py
Sources (all public):
  - leguesswho.com news posts (initial line-up, additions, full program)  -> names + "billing"
  - leguesswho.com/archive/<year>/line-up and /lineup (2026)               -> names (partial for old years)
  - blokkenschema.nl/le-guess-who-<year>/line-up (2023-2025)               -> names
  - clashfinder.com/s/lgw<yy> (2017, 2021-2026)                            -> room, start time and slot length per act (not 2018/2019)
"""
import html, json, os, re, sys, unicodedata
import requests

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
CACHE = os.path.join(os.environ.get("TEMP", "/tmp"), "lgw_cache")
os.makedirs(CACHE, exist_ok=True)
S = requests.Session()
S.headers["User-Agent"] = "leguesswho-fee-model/1.0 (https://github.com/bertt/leguesswho)"

POSTS = {
    2017: ["revealing-the-first-curators-initial-line-up", "announcing-the-full-line-up-for-le-guess-who-2017"],
    2018: ["revealing-the-curators-initial-line-up-for-le-guess-who-2018", "revealing-new-projects-program-additions-for-le-guess-who-2018",
           "revealing-the-full-line-up-for-le-guess-who-2018-day-tickets-on-sale-now", "revealing-the-full-time-schedules-for-lgw18-new-acts-added-to-the-line-up"],
    2019: ["revealing-the-initial-line-up-for-le-guess-who-2019", "full-curated-programs-various-special-projects-announced-for-le-guess-who-2019",
           "revealing-the-full-line-up-for-le-guess-who-2019", "revealing-the-time-schedules-final-program-additions-for-le-guess-who-2019", "lgw19-program-update"],
    2021: ["revealing-the-curators-and-initial-program-for-le-guess-who-2021", "revealing-46-program-additions-for-le-guess-who-2021",
           "revealing-the-full-line-up-for-le-guess-who-2021-with-70-new-program-additions", "timetable-last-program-additions-for-lgw21-revealed-limited-saturday-tickets-to-go-on-sale", "lgw21-line-up-news"],
    2022: ["lgw22-initial-program", "revealing-the-full-program-for-le-guess-who-2022", "lgw22-program-update"],
    2023: ["lgw23-initial-line-up", "full-program-lgw23", "lgw23-program-update"],
    2024: ["lgw24-initial-program", "lgw24-full-program"],
    2025: ["lgw25-initial-line-up", "lgw25-full-program", "time-schedules-lgw25"],
    2026: ["initial-line-up-lgw26", "lgw26-full-line-up", "lgw26-program-update", "program-update-lgw26"],
}
EXCLUDE = re.compile(r"\b(talk|lecture|workshop|panel|summit|exhibition|film|screening|q&a|discussion|hangout|potluck|le feast|embassy|embassies|how to make noise|"
                     r"opening barriers|ownership concentration|digital dilemmas|community organising|from sound to action|listening to the nervous|"
                     r"making of|archiving|book launch|podcast|radio show|guided tour|soundtrack|stream|record fair|masterclass|introduction|radio|records|hku|outernational|pic[oó]|refuge worldwide|batekoo|los angles|kapitaal|stranded fm|curated programs?|community|broken spectre)\b", re.I)
SKIP_LINES = re.compile(r"^(general program|general programme|tickets|festival news|curated by|le guess who\?? ?(&|and) u|more news|special projects?|sounds of places|cosmos|u\?|"
                        r"new program additions|all newly announced artists:?|and many more|read more|here|untitled|newsletter|subscribe|accept cookies|tbc)", re.I)
# Acts that were announced but did not perform (from the foundation's program-update posts), and acts that are not performers
CANCELLED = {
    2017: ["Oumou Sangaré"],
    2025: ["Kankawa Nagarra", "Mazaher", "Rizwan-Muazzam Qawwali", "Rizwan", "Maria Alice", "Unwound", "Lamisi"],
    2026: ["Tropical Fuck Storm", "Palm Springs", "Gareth Liddiard", "Lost Animal", "Mazaher", "Tshegue", "Osama Abu Ali", "CARISTA"],
}
NOT_PERFORMING = {2026: ["Ciro Monoarfa Goudsmit", "Uta"]}  # Sound & Culture Summit session participants
RENAME = {2026: {"Mai Mai Mai & Osama Abu Ali": "Mai Mai Mai & Tareq Abboushi"}}
# 2026: only acts on the official leguesswho.com/lineup (or timetable) are kept; these are spelled differently there
OFFICIAL_ALIASES_2026 = ["ROÍS", "Robert Nikolajev", "Ibrahim Owais", "Sima nos é só nós", "NAKID", "OCCII",
                         "Khadija El Warzazia", "Acácia Maio", "Frequência Tabanka DJ set + MF Andrade", "'gyeol'", "‘gyeol’"]
ITEM = r'<div data-order="[^"]*" class="item"[^>]*?data-project="([^"]*)"[^>]*>.*?<h3 class="h6"><a[^>]*>([^<]*)</a>'


def get(url, key):
    p = os.path.join(CACHE, re.sub(r"[^\w.-]", "_", key))
    if os.path.exists(p):
        return open(p, encoding="utf8").read()
    r = S.get(url, timeout=40)
    if r.status_code != 200:
        return ""
    open(p, "w", encoding="utf8").write(r.text)
    return r.text


def clean(n):
    n = html.unescape(n)
    n = re.sub(r"[\u200b\u200c\u200d\ufeff]", "", n)
    n = re.sub(r"\s*\((20\d\d|COSMOS \d{4})\)\s*$|\s+in 20\d\d$|\s*\(curated by [^)]*\)\s*$|\s+presents$", "", n, flags=re.I)
    n = re.sub(r"\s+", " ", n).strip(" ;•·-–—\u00a0")
    return n


def key(n):
    n = unicodedata.normalize("NFKD", n.lower())
    return re.sub(r"[^a-z0-9]+", "", "".join(c for c in n if not unicodedata.combining(c)))


def txt(fragment):
    return html.unescape(re.sub(r"<[^>]+>", "", fragment))


def post_names(year):
    """{name: 'bold' (named in the announcement prose) | 'list'}, plus curator names"""
    out, curators = {}, set()
    rank = {"bold1": 4, "bold": 3, "list": 2}
    for idx, slug in enumerate(POSTS.get(year, [])):
        c = get(f"https://leguesswho.com/news/{slug}", f"news_{slug}")
        if not c:
            print("  missing post", slug, file=sys.stderr)
            continue
        c = c[c.find("<h1"):]
        c = c[: c.find("More news")] if "More news" in c else c
        c = re.sub(r"<script.*?</script>|<style.*?</style>", "", c, flags=re.S)
        for m in re.findall(r"<(?:strong|b)\b[^>]*>(.*?)</(?:strong|b)>", c, flags=re.S):
            n = clean(txt(m))
            if 2 <= len(n) <= 55 and not re.search(r"[.!?:]|^le guess who|^tickets|^cosmos$|^u\?$|day pass|day ticket", n, re.I) and not SKIP_LINES.match(n):
                if rank.get(out.get(n), 0) < rank["bold1" if idx == 0 else "bold"]:
                    out[n] = "bold1" if idx == 0 else "bold"
        t = re.sub(r"<br\s*/?>", "\n", c)
        t = re.sub(r"</(p|h\d|li|div|a)>", "\n", t)
        lines = [clean(x) for x in txt(re.sub(r"<[^>]+>", "\n", t)).split("\n")]
        started = False
        for ln in lines:
            if len(ln) < 60 and re.search(r"^(all )?(newly announced artists|new (program|line-up) additions|(program|line-up) additions|new additions|general program(me)?|special projects?)\b", ln, re.I):
                started = True
                continue
            if re.match(r"^curated by (.+)", ln, re.I):
                curators.add(re.sub(r"^curated by ", "", ln, flags=re.I))
                continue
            if not started or not ln or len(ln) > 90 or re.search(r"[.,:]$|le guess who|ticket|pass(es)?\b|20\d\d|^(scroll|home|news|drinks)$", ln, re.I) \
                    or not (ln[0].isupper() or ln[0].isdigit() or ln[0] in "'\"‘“(") or SKIP_LINES.match(ln):
                continue
            for part in re.split(r"\s+[•·]\s+|\s*;\s+", ln):
                part = clean(part)
                if 2 <= len(part) <= 80 and part not in out and part[0] not in "’,.":
                    out[part] = "list"
    return out, curators


def page_items(url, k):
    c = get(url, k)
    return {clean(m.group(2)): html.unescape(m.group(1)).strip(", ") for m in re.finditer(ITEM, c, re.S)}


def blokken(year):
    c = get(f"https://blokkenschema.nl/le-guess-who-{year}/line-up", f"bs_{year}")
    res = {}
    for m in re.finditer(r'<a [^>]*href="/le-guess-who-%d/[^"]+"[^>]*>(.*?)</a>\s*([^<]*)' % year, c, re.S):
        n, lab = clean(txt(m.group(1))), clean(m.group(2))
        if n and n != "?":
            res[n] = lab
    return res


CLASH_YEARS = (2017, 2021, 2022, 2023, 2024, 2025, 2026)  # clashfinder.com/s/lgw<yy> exists for these years
DAYS = ["Thu", "Fri", "Sat", "Sun", "Mon", "Tue", "Wed"]
PLAIN_CURATORS = {"Curator: clipping."}  # clipping. is a hip-hop trio doing a normal set, not a commissioned project
# talks and panels that are on the line-up page but are not paid concerts
PANELS = re.compile(r"^(Right Relations:|Artistic Freedom Under Threat:|Black Sonic Technologies:|Diasporic Soundscapes:|EPHEMERA:|Legacies of Resistance:|"
                    r"On Sound as Substance:|Palestinian Sound Archive:|Tech, Sound, Power:|The Art of Dissent:|The Politics of Culture:)", re.I)
# approximate room size -> 0-100 (the timetable position is the strongest public headliner signal)
STAGES = [(r"grote zaal\b", 92), (r"ronda", 100), (r"stadsschouwburg.*main", 55), (r"pandora(?!.*(foyer|studio))|^tv pandora", 60),
          (r"cloud nine", 45), (r"hertz", 55), (r"domkerk|jacobikerk|janskerk|pieterskerk", 50), (r"theater utrecht (theater|koepel)", 40),
          (r"kapitaal|blauwe zaal", 40), (r"db's main", 40), (r"db's bar", 30), (r"foyer|studio", 35)]


def stage_score(name):
    n = name.lower()
    for pat, sc in STAGES:
        if re.search(pat, n):
            return sc
    return 25


def clash(year):
    """{key: {n, s (best room 0-100), d (longest slot, minutes), p (prime time), o (opening/closing)}} from the clashfinder timetable"""
    c = get(f"https://clashfinder.com/s/lgw{year % 100}/", f"clash_{year}")
    out, items = {}, []
    for part in c.split('<div class="stageContainer">')[1:]:
        m = re.search(r'class="stageName">(.*?)</p>', part)
        stage = html.unescape(m.group(1)) if m else ""
        shows = [(int(s), int(e), clean(txt(nm))) for s, e, nm in re.findall(r'data-start="(\d+)" data-end="(\d+)"[^>]*><div class="actNmWrap"><h6 class="actNm">(.*?)</h6>', part)]
        for s, e, nm in shows:
            if (e - s) / 60000 < 240 and key(nm) and not EXCLUDE.search(nm):
                items.append((s / 3600000, (e - s) / 60000, nm, stage))  # start = hours since Thursday 00:00
    last = max((int((h - 6) // 24) for h, _, _, st in items if stage_score(st) >= 45), default=0)
    for h, dur, nm, stage in items:
        sc, big = stage_score(stage), stage_score(stage) >= 45
        hod, day = h % 24, int((h - 6) // 24)
        # prime time (start 20:00-23:00) = 100, the hour either side = 50, otherwise 20; only counted in rooms of Hertz size and up
        pos = (100 if 20 <= hod < 23 else 50 if 19 <= hod < 20 or 23 <= hod < 24 else 20) if big else 20
        # festival opener (Thursday 18:00-20:30) or closer (last day 19:00-21:00) in a main room (Grote Zaal / Ronda)
        oc = 100 if sc >= 90 and ((day == 0 and 18 <= h < 20.5) or (day == last and last > 0 and 19 <= h - 24 * last < 21)) else 0
        o = out.setdefault(key(nm), {"n": nm, "s": 0, "d": 0, "p": 0, "o": 0, "x": 0, "w": [], "bs": (-1, 0)})
        o["w"].append((h, f"{DAYS[day % 7]} {int(hod):02d}:{round(hod % 1 * 60):02d}".replace(":60", ":00") + " · " + stage))
        o["w"] = sorted(set(o["w"]))
        o["x"] = len(o["w"])
        o["s"], o["d"], o["p"], o["o"] = max(o["s"], sc), max(o["d"], round(dur)), max(o["p"], pos), max(o["o"], oc)
        if (sc, dur) > o["bs"]:  # room and start time of the act's main slot: biggest room, then longest
            o["bs"], o["r"], o["t"] = (sc, dur), stage, f"{DAYS[day % 7]} {int(hod):02d}:{round(hod % 1 * 60):02d}".replace(":60", ":00")
    return out


def ensemble_score(n):
    if re.search(r"orchestra|ensemble|choir|philharmonic|sinfonietta|kolektiv|collective|troop|big band|\bband\b|quartet|\bsextet|\bseptet|singers|soundsystem", n, re.I):
        return 100
    if re.search(r"\b(dj|b2b|solo)\b|\(dj", n, re.I):
        return 15
    if re.search(r"\s(&|\+|x|feat\.?|ft\.?|with|meets)\s|presents|plays|performs|trio|duo", n, re.I):
        return 65
    return 45


def commission_score(n):
    return 50 if re.search(r"\b(presents?|premiere|commission|performing|plays|performs|meets)\b|\sx\s|\sfeat", n, re.I) else 0


def main():
    res = {}
    for y in sorted(POSTS):
        print("year", y)
        posts, curators = post_names(y)
        names = {key(n): {"n": n, "flag": f} for n, f in posts.items() if key(n)}
        labels = blokken(y) if y in (2023, 2024, 2025) else {}
        extra = page_items("https://leguesswho.com/lineup", "lineup_now") if y == 2026 else \
            {**page_items(f"https://leguesswho.com/archive/{y}/line-up", f"archive_{y}"), **labels}
        for n, lab in extra.items():
            if re.search(r"film|exhibition|summit", labels.get(n, ""), re.I):
                continue
            if key(n):
                names.setdefault(key(n), {"n": n, "flag": "other"})
            m = re.match(r"Curated by (.+)", lab or "")
            if m:
                curators.add(m.group(1))
        renamed = {}
        for v in names.values():
            v["n"] = RENAME.get(y, {}).get(v["n"], v["n"])
            renamed.setdefault(key(v["n"]), v)
        names = renamed
        gone = {key(c) for c in CANCELLED.get(y, []) + NOT_PERFORMING.get(y, [])}
        curators = {c for c in curators if key(c) not in gone}
        acts = [v for v in names.values() if key(v["n"]) not in gone and not EXCLUDE.search(v["n"]) and not SKIP_LINES.match(v["n"]) and len(v["n"]) > 1]
        structured = {key(n) for n in extra}
        lows = [a["n"].lower() for a in acts]

        def is_part(a):
            if key(a["n"]) in structured:
                return False
            pat = r"(?<!\w)" + re.escape(a["n"].lower()) + r"(?!\w)"
            return any(len(o) > len(a["n"]) and re.search(pat, o) for o in lows)
        acts = [a for a in acts if not is_part(a)]
        if y in CLASH_YEARS:
            cl = {k: v for k, v in clash(y).items() if k not in gone}
            used = set()
            for a in acts:
                ka = key(a["n"])
                hit = cl.get(ka) or next((v for k, v in cl.items() if len(ka) >= 6 and len(k) >= 6 and (ka in k or k in ka)), None)
                a["s"], a["d"], a["p"], a["o"] = (hit["s"], hit["d"], hit["p"], hit["o"]) if hit else (25, 45, 20, 0)
                if hit:
                    a["x"], a["w"] = hit["x"], [t for _, t in sorted(hit["w"])]
                    a["r"], a["t"] = hit["r"], hit["t"]
                    used.add(key(hit["n"]))
            for k, v in cl.items():
                if k not in used and not SKIP_LINES.match(v["n"]):
                    acts.append({"n": v["n"], "flag": "other", "s": v["s"], "d": v["d"], "p": v["p"], "o": v["o"], "r": v["r"], "t": v["t"], "x": v["x"], "w": [t for _, t in sorted(v["w"])]})
            print("  clashfinder:", len(cl), "acts, added", len(cl) - len(used))
        if y == 2026:
            official = {key(n) for n in extra} | {key(n) for n in OFFICIAL_ALIASES_2026}
            for a in acts:
                if key(a["n"]) not in official:
                    print("  not on official lineup, dropped:", a["n"])
            acts = [a for a in acts if key(a["n"]) in official]
        res[y] = (acts, {key(c) for c in curators if len(key(c)) > 3})
        print("  acts", len(acts), "curators", len(res[y][1]))
    out = {}
    for y, (acts, cur) in res.items():
        rows = []
        for a in acts:
            n = a["n"]
            is_cur = key(n) in cur or any(c in key(n) for c in cur)
            plain = n in PLAIN_CURATORS  # curator who plays an ordinary band show: no special-commission credit
            if plain:
                n = n.replace("Curator: ", "")
            rows.append({"n": n, "b": 100 if is_cur else {"bold1": 100, "bold": 80, "list": 60}.get(a["flag"], 45),
                         "e": ensemble_score(n), "c": 0 if plain else 100 if is_cur else commission_score(n)})
            if is_cur:
                rows[-1]["u"] = 1
            if PANELS.search(n):
                rows[-1]["k"] = 1
            if "s" in a:
                rows[-1]["s"], rows[-1]["d"], rows[-1]["p"], rows[-1]["o"] = a["s"], a["d"], a["p"], a["o"]
                if "r" in a:
                    rows[-1]["r"], rows[-1]["t"] = a["r"], a["t"]
                if a.get("x", 1) > 1:
                    rows[-1]["x"], rows[-1]["w"] = a["x"], a["w"]
        rows.sort(key=lambda r: (-r.get("s", 0), r["n"]))
        out[y] = rows
        print(y, len(rows))
    with open(os.path.join(ROOT, "lineups.js"), "w", encoding="utf8") as f:
        f.write("/* GENERATED by tools/build_lineups.py - do not edit by hand.\n"
                " * n = act, b = billing 0-100, e = ensemble 0-100, c = special commission 0-100,\n"
                " * s = best room (clashfinder timetable) 0-100, d = longest slot in minutes, p = prime-time score 0-100, o = festival opener/closer 0 or 100, u = curator, x = number of performances when more than one (same fee each) and w = their day, time and room, k = panel or talk (fixed low fee score), r = room name and t = day + start time of the main slot (biggest room, then longest; all absent when no timetable exists) */\n")
        f.write("const LINEUPS = " + json.dumps(out, ensure_ascii=False, separators=(",", ":")) + ";\n")


if __name__ == "__main__":
    main()
