#!/usr/bin/env python3
"""Single-entry publication manager for the DAMI Lab publication page.

Usage:
  python3 publication/manage_papers.py bootstrap /path/to/topic-map-data.json
  python3 publication/manage_papers.py add /path/to/new-paper.json
"""
import html
import json
import re
import sys
from datetime import date
from pathlib import Path

ROOT = Path(__file__).resolve().parent
DATA = ROOT / 'papers.json'
PAGE = ROOT / 'index.html'
MARKER = '<!-- AUTO_PUBLICATION_CARDS -->'

FIELDS = {
    'trust': ('Trustworthy AI', 'Safety · Security · Privacy'),
    'core': ('AI Core Algorithms', 'Transfer · Optimization'),
    'application': ('AI Applications', 'Geospatial · Finance · Society'),
}

KNOWN_MAP_LABELS = {
    'SlotGCG: Exploiting the Positional Vulnerability in LLMs for Jailbreak Attacks': 'Jailbreaking',
    'Co-occurring Associated REtained concepts in Diffusion Unlearning': 'Concept Erasing',
    'Exploring the Effect of Multi-Step Ascent in Sharpness-Aware Minimization': 'DL Optimization',
    'LM-CLIP: Adapting Positive Asymmetric Loss for Long-Tailed Multi-Label Classification': 'Multi-Label Classification',
    'Large Language Models as Financial Analysts: Sector-Aware Reasoning for Investment Decisions': 'LLM for Finance',
    'CaddieSet: A Golf Swing Dataset with Human Joint Features and Ball Information': 'Sports AI Dataset',
}

def slug(text):
    return re.sub(r'[^a-z0-9]+', '-', text.lower()).strip('-')

def classify(p):
    text = ' '.join([p.get('title', ''), *p.get('keywords', []), p.get('abstract', '')]).lower()
    apps = ('geospatial', 'groundwater', 'radon', 'environment', 'finance', 'financial', 'online review', 'golf', 'swing', 'patent', 'impact factor', 'journal evaluation', 'material', 'hydrogen', 'cryptocurrenc', 'fault diagnosis', 'shale gas')
    if any(x in text for x in apps): return 'application'
    if any(x in text for x in ('robust', 'adversarial', 'security', 'jailbreak', 'privacy', 'homomorphic', 'unlearning', 'vulnerability')): return 'trust'
    return 'core'

def subfield(p):
    text = ' '.join([p.get('title', ''), *p.get('keywords', []), p.get('abstract', '')]).lower()
    if p['research_area'] == 'trust':
        return 'Security & Attacks' if any(x in text for x in ('security', 'jailbreak', 'vulnerability')) else ('Privacy & Safety' if any(x in text for x in ('privacy', 'unlearning', 'homomorphic')) else 'Robustness')
    if p['research_area'] == 'core':
        return 'Transfer & Fairness' if any(x in text for x in ('transfer', 'domain adaptation', 'fairness')) else ('Optimization' if any(x in text for x in ('optimization', 'sharpness')) else 'Representation')
    return 'Geospatial & Environment' if any(x in text for x in ('geospatial', 'groundwater', 'radon', 'environment')) else ('Finance & Society' if any(x in text for x in ('finance', 'financial', 'review', 'cryptocurrenc')) else 'Science & Technology')

def normalize(raw):
    p = dict(raw)
    for key in ('title', 'date', 'abstract'):
        if not p.get(key): raise ValueError(f'Missing required field: {key}')
    p['id'] = p.get('id') or slug(p['title'])
    p['date'] = str(p['date'])
    p['year'] = int(p.get('year') or p['date'][:4])
    p['keywords'] = list(p.get('keywords') or [])
    p['research_area'] = p.get('research_area') or classify(p)
    if p['research_area'] not in FIELDS: raise ValueError('research_area must be trust, core, or application')
    p['subfield'] = p.get('subfield') or subfield(p)
    p['map_label'] = p.get('map_label') or KNOWN_MAP_LABELS.get(p['title']) or (p['keywords'][0] if p['keywords'] else p['subfield'])
    p['venue'] = p.get('venue', '')
    p['authors'] = list(p.get('authors') or [])
    p['links'] = dict(p.get('links') or {})
    return p

def load():
    return json.loads(DATA.read_text()) if DATA.exists() else {'schema': 1, 'papers': []}

def save(data):
    data['papers'].sort(key=lambda p: p['date'], reverse=True)
    DATA.write_text(json.dumps(data, ensure_ascii=False, indent=2) + '\n')

def card(p):
    e = lambda x: html.escape(str(x), quote=True)
    keywords = ''.join(f"<button onclick=\"filterByKeyword('{e(k)}')\" class=\"keyword-btn px-2 py-0.5 rounded-lg text-xs font-medium bg-gray-200 text-gray-700 border border-gray-300 hover:bg-primary-600 hover:text-white hover:border-primary-600 cursor-pointer transition-colors\">#{e(k)}</button>" for k in p['keywords'])
    links = ''.join(f"<a href=\"{e(url)}\" target=\"_blank\" class=\"text-blue-600 hover:text-blue-800 font-medium\" style=\"text-decoration:underline;\">[{e(name.title())}]</a>&nbsp;&nbsp;" for name, url in p['links'].items())
    image = f"<img src=\"{e(p['image'])}\" alt=\"{e(p['title'])}\" class=\"object-contain object-center max-w-full max-h-full\">" if p.get('image') else ''
    abstract_id = 'abstract-' + p['id']
    return f'''\n<!-- AUTO PAPER: {e(p['id'])} -->\n<div class="publication-item flex overflow-hidden rounded-lg shadow-lg bg-gray-50" data-topic="{e(p['keywords'][0] if p['keywords'] else '')}" data-year="{p['year']}" data-published="{e(p['date'])}" data-type="international">\n  <div class="flex-shrink-0 overflow-hidden rounded-lg bg-white flex items-center justify-center" style="width:350px;height:250px;min-width:350px;min-height:250px;">{image}</div>\n  <div class="flex-1 px-6 pt-4"><div class="flex flex-wrap gap-2 mb-3"><span style="background:#006e12;color:#fff;padding:.375rem .75rem;border-radius:.375rem;font-size:.8rem;font-weight:600;">{e(p['venue'])}</span><span style="background:#000;color:#fff;padding:.375rem .75rem;border-radius:.375rem;font-size:.8rem;font-weight:600;">{p['year']}</span></div>\n  <h3 class="text-xl font-bold text-gray-900 mb-3">{e(p['title'])}</h3><div class="mb-4"><div class="flex flex-wrap gap-3">{keywords}</div></div><div class="mb-4"><p class="text-sm text-gray-600"><span class="font-medium">Authors:</span> {e(', '.join(p['authors']))}</p></div>\n  <div class="mb-4"><button onclick="toggleAbstract('{abstract_id}')" class="text-primary-600 hover:text-primary-800 font-medium text-sm">Show Abstract ↓</button><div id="{abstract_id}" class="hidden mt-2 p-3 bg-gray-100 rounded-lg"><p class="text-sm text-gray-700">{e(p['abstract'])}</p></div></div><div class="flex flex-wrap mb-8">{links}</div></div></div>\n'''

def bootstrap(source):
    raw = json.loads(Path(source).read_text())['papers']
    data = {'schema': 1, 'papers': [normalize(p) for p in raw]}
    save(data)
    print(f'Wrote {len(data["papers"])} papers to {DATA}')

def add(source):
    incoming = json.loads(Path(source).read_text())
    p = normalize(incoming)
    data = load(); existing = {x['id']: x for x in data['papers']}
    if p['id'] in existing: raise ValueError(f"Duplicate id: {p['id']}")
    data['papers'].append(p); save(data)
    page = PAGE.read_text()
    if MARKER not in page: raise ValueError(f'Marker missing: {MARKER}')
    PAGE.write_text(page.replace(MARKER, MARKER + card(p), 1))
    print(f'Added {p["id"]}: list card and research map data updated')

if __name__ == '__main__':
    if len(sys.argv) != 3 or sys.argv[1] not in {'bootstrap', 'add'}:
        raise SystemExit(__doc__.strip())
    {'bootstrap': bootstrap, 'add': add}[sys.argv[1]](sys.argv[2])
