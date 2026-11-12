"""
Scrapes the official leguesswho.com/timetable (all 4 days) into tools/timetable_2026.json.
The page is a Livewire component that only renders one day at a time, so a browser clicks through the day tabs.

Run:  uv run --with playwright python tools/scrape_timetable.py     (uses the installed Microsoft Edge)
Output: [{"day": "2026-11-05", "stage": "Ronda, TivoliVredenburg", "name": ..., "start": 17.0, "end": 18.0}, ...]  (hours since 00:00 of that day, > 24 after midnight)
"""
import html
import json
import os
import re

from playwright.sync_api import sync_playwright

OUT = os.path.join(os.path.dirname(os.path.abspath(__file__)), "timetable_2026.json")
DAYS = ["2026-11-05", "2026-11-06", "2026-11-07", "2026-11-08"]


def walk(node, stage, out, day):
    if isinstance(node, dict):
        if "shows" in node and "name" in node:
            stage = node["name"]
        if "time" in node and "endTime" in node and "name" in node:
            m = re.match(r"(\d\d):(\d\d) - (\d\d):(\d\d)", node["time"])
            start = int(m.group(1)) + int(m.group(2)) / 60
            end = float(node["endTime"])
            if start < 11:  # the timetable day runs 11:00 - 02:30, so earlier clock times are after midnight
                start += 24
            out.append({"day": day, "stage": stage, "name": node["name"], "start": start, "end": end})
            return
        for v in node.values():
            walk(v, stage, out, day)
    elif isinstance(node, list):
        for v in node:
            walk(v, stage, out, day)


def main():
    out = []
    with sync_playwright() as p:
        b = p.chromium.launch(channel="msedge")
        pg = b.new_page()
        pg.goto("https://leguesswho.com/timetable", wait_until="networkidle")
        try:
            pg.click("text=Accept cookies", timeout=3000)
        except Exception:
            pass
        for d in DAYS:
            pg.click(f"[wire\\:click=\"setDay('{d}')\"]")
            pg.wait_for_timeout(2500)
            snap = pg.evaluate("() => [...document.querySelectorAll('[wire\\\\:snapshot]')].map(e => e.getAttribute('wire:snapshot')).find(s => s.includes('\"shows\"'))")
            before = len(out)
            walk(json.loads(snap), "", out, d)
            print(d, len(out) - before, "shows")
        b.close()
    for o in out:
        o["name"] = html.unescape(o["name"]).strip()
    with open(OUT, "w", encoding="utf8") as f:
        json.dump(out, f, ensure_ascii=False, indent=0)


if __name__ == "__main__":
    main()
