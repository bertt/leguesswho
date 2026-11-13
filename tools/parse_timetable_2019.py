"""
Parses the official LGW19 timetable booklet (https://leguesswho.com/media/PDF/LGW19-timetable-booklet.pdf, saved as pdf/lgw19-timetable-booklet.pdf)
into tools/timetable_2019.json, same format as timetable_2026.json.

The booklet is a grid: one page per half day, a row per stage, one white cell per act. Cell width = slot length.
Tinted cells are venue placeholders (e.g. "Walter Roadburn", "GONZO DJs") and are skipped, as are empty (grey) cells.

Run:  uv run --with pymupdf python tools/parse_timetable_2019.py
"""
import json
import os
import re

import pymupdf

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
PDF = os.path.join(ROOT, "pdf", "lgw19-timetable-booklet.pdf")
OUT = os.path.join(ROOT, "tools", "timetable_2019.json")
SYMBOLS = re.compile(r"^[\u25a0-\u27bf\u2660-\u2667\u2764\u25c6\u25c7\u2756\u274f\u273d\u25d7\u25d6\u25b2\u25cf\u2665♥◆♣❏✽◗▲●]+$")
DATES = {"Thursday": "2019-11-07", "Friday": "2019-11-08", "Saturday": "2019-11-09", "Sunday": "2019-11-10"}


NOT_MUSIC_STAGE = r"Springhaver|Centraal|Nicola|^BAK|Zocherpark|IMPAKT|FOTODOK|Casco|Utrecht University|Lombok|Boekenbar|Kapitaal"
FIXES = {"Paracetamøl": "Paracetamøl", "Latin-Lovers": "Latin-Lovers", "ZONAL feat. Moor Mother & Nazamba": "ZONAL featuring Moor Mother",
         "Roberto SOLO Fonseca": "Roberto Fonseca", "AEAEA Gaudeamus": "AEAEA", "Nídia Príncipe Discos presents": "Nídia",
         "DJ Firmeza Príncipe Discos presents": "DJ Firmeza", "DJ Marfox Príncipe Discos presents": "DJ Marfox"}


def clean_stage(s):
    s = s.replace("\u2019", "'")
    s = re.sub(r"LE (GUESS|MINI) WHO\??\s*-*\s*", "", s)
    s = re.sub(r"\s+", " ", s).strip(" -")
    if not re.search(r"[A-Za-z]{2}", s):
        return ""
    if s == "Main":
        s = "Theater Kikker Main"
    if re.search(r"Museum", s):
        return ""
    if re.match(r"(Grote Zaal|Ronda|Pandora|Hertz|Cloud 9)\b", s):
        s = "TivoliVredenburg " + s
    if s.startswith("Stranded FM"):
        s = "TivoliVredenburg Pandora Foyer " + s
    return s


def is_white(c):
    return c is not None and all(v > 0.99 for v in c)


def parse_page(page):
    text = page.get_text("text")
    day = next(DATES[d] for d in DATES if d in text)
    words = page.get_text("words")
    labels = sorted((w for w in words if re.fullmatch(r"\d{1,2}:\d\d", w[4]) and w[1] < 90), key=lambda w: w[0])
    labels = [w for w in labels if w[1] < 100]
    t0 = lambda w: int(w[4].split(":")[0]) + int(w[4].split(":")[1]) / 60
    # px per hour from the first and last labels (the labels run every 15 min and the cell grid starts at the first label)
    first, last = labels[0], labels[-1]
    h0, h1 = t0(first), t0(last)
    if h1 < h0:
        h1 += 24
    pph = (last[0] - first[0]) / (h1 - h0)
    x_start = first[0] - 1.5  # label text sits ~1.5pt right of its grid line
    lines = [(l["bbox"], "".join(s["text"] for s in l["spans"]).strip()) for b in page.get_text("dict")["blocks"] if b["type"] == 0 for l in b["lines"]]
    items = []
    for dr in page.get_drawings():
        if is_white(dr.get("fill")):
            items += [it[1] for it in dr["items"] if it[0] == "re" and it[1].width > 8 and 12 < it[1].height < 60 and it[1].x0 > 80]
    out = []
    for r in sorted(items, key=lambda r: (r.y0, r.x0)):
        inside = [(b, t) for b, t in lines if t and r.x0 <= (b[0] + b[2]) / 2 <= r.x1 and r.y0 <= (b[1] + b[3]) / 2 <= r.y1 and not SYMBOLS.match(t)]
        stage = [t for b, t in sorted(((b, t) for b, t in lines if b[2] < 86 and r.y0 <= (b[1] + b[3]) / 2 <= r.y1), key=lambda x: x[0][1])]
        if not inside or not stage:
            continue
        name = re.sub(r"\s+", " ", " ".join(t for _, t in sorted(inside, key=lambda x: (round(x[0][1] / 3), x[0][0])))).strip()
        name = re.sub(r"(?<=[a-zø])- (?=[a-zø])", "", re.sub(r"\s*[\u2660-\u27bf\u25a0-\u25ff]+", "", name)).strip()
        name = FIXES.get(name, name)
        stage = clean_stage(" ".join(stage))
        if not stage or not name or re.search(NOT_MUSIC_STAGE, stage, re.I) or re.search(r"^curated by|\(film\)|conversation|^q&a|how music dies|music academy", name, re.I):
            continue
        start = h0 + (r.x0 - x_start) / pph
        end = h0 + (r.x1 - x_start) / pph
        if start < 11:
            start, end = start + 24, end + 24
        out.append({"day": day, "stage": stage, "name": name, "start": round(start * 4) / 4, "end": round(end * 4) / 4})
    return out


def main():
    res = []
    for p in pymupdf.open(PDF):
        res += parse_page(p)
    json.dump(res, open(OUT, "w", encoding="utf8"), ensure_ascii=False, indent=1)
    print(len(res), "slots")


if __name__ == "__main__":
    main()
