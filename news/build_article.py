#!/usr/bin/env python3
"""논문 채택 소식을 News 해설 기사로 만든다. 원고는 articles.py.

실행: python3 news/build_article.py
규칙은 news/ARTICLE_RULES.md 에 있다. 먼저 읽을 것.

(원래 설명)
EMNLP 2026 채택 논문을 논문 1편 = News 글 1개로 만든다.

news/53 을 틀로 쓴다(헤더/네비/푸터/목록 버튼을 그대로 재사용).
기존 글은 포스터 한 장 + 한 문장이지만, 여기서는 헤더/TL;DR/논문정보/본문/
원문 Figure 를 갖춘 해설 기사 형태로 <article> 안을 통째로 갈아끼운다.

본문 내용은 전부 논문 원문에서 가져온다. 초록·수치·그림·링크를 지어내지 않는다.
공개 링크(ACL Anthology 등)는 아직 없으므로 링크 줄 자체를 넣지 않는다.

문체 규칙 (v1 이 AI 스럽다는 지적을 받아 정리했다):
- 본문은 경어체 `~습니다`, 제목은 평서형(한국어 기사 표준).
- 모델명, 벤치마크 버전, 데이터 규모, 지표 이름을 뭉개지 말고 원문 그대로 쓴다.
  ("네 개 타깃 모델" 이 아니라 "Qwen3-235B, LLaMA-3.3-70B, GPT-4o-mini, Gemini-2.5-Flash")
- "A가 아니라 B다" 대구를 반복하지 않는다.
- 결과는 라벨 카드가 아니라 번호를 붙인 문단으로 서술한다.
- 논문이 던진 질문은 인용구로 그대로 옮긴다.
- 절 제목은 배경 / 제안 방법 / 실험 설정 / 결과 / 의의 로 5편 모두 고정한다.
"""
import html
import os

REPO = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
TPL = f"{REPO}/news/53/index.html"

OLD_TITLE = "연구실 논문 FAGEN@ICML 2026 Accept"
OLD_ISO = "2026-05-27T10:00:00&#43;09:00"
OLD_SHOWN = "2026년 5월 27일"
OLD_ID = "53"

DATE = "2026-08-21"
DATE_SHOWN = "2026년 8월 21일"

e = lambda s: html.escape(s, quote=False)
TRACK_LABEL = {"main": "Main Conference", "findings": "Findings",
               "conf": "Poster"}


from articles import PAPERS, VENUE_FULL  # 원고는 articles.py 에 있다


# ── 기사 CSS (다른 페이지와 섞이지 않게 .newsart 아래로만 스코프) ──────────
CSS = """<style>
  .newsart{--ink:#111827;--sub:#4b5563;--line:#d4d4d8;--navy:#002472;
    --main:#1D4ED8;--find:#B45309;
    color:var(--ink);font-family:'Pretendard',system-ui,-apple-system,sans-serif}
  .newsart *{box-sizing:border-box}
  .newsart .na-wrap{max-width:800px;margin:0 auto;padding:0 24px}

  .newsart .na-head{background:#f4f5f7;border-bottom:3px solid var(--navy);
    padding:44px 0 34px}
  .newsart .na-badges{display:flex;align-items:center;gap:9px;flex-wrap:wrap;margin-bottom:16px}
  .newsart .na-venue{background:var(--navy);color:#fff;font-size:12.5px;font-weight:900;
    letter-spacing:.04em;padding:5px 12px;border-radius:999px}
  .newsart .na-track{color:#fff;font-size:12.5px;font-weight:900;letter-spacing:.04em;
    padding:5px 12px;border-radius:999px}
  .newsart .na-track.is-main{background:var(--main)}
  .newsart .na-track.is-findings{background:var(--find)}
  .newsart .na-track.is-conf{background:#0E7490}
  .newsart .na-date{font-size:12.5px;font-weight:700;color:var(--sub)}
  .newsart .na-head h1{margin:0;font-size:clamp(26px,4vw,38px);font-weight:900;
    line-height:1.25;letter-spacing:-.035em;color:var(--ink)}
  .newsart .na-en{margin:14px 0 0;font-size:15px;line-height:1.55;font-weight:700;
    color:var(--navy)}

  .newsart .na-body{padding-top:34px;padding-bottom:8px}

  .newsart .na-tldr{border:2px solid var(--navy);border-left-width:7px;border-radius:8px;
    background:#fff;padding:17px 20px;margin:0 0 26px}
  .newsart .na-tldr b{display:block;font-size:12.5px;font-weight:900;letter-spacing:.09em;
    color:var(--navy);margin-bottom:7px}
  .newsart .na-body .na-tldr p{margin:0;font-size:15px;line-height:1.72;color:var(--ink);
    font-weight:500}

  .newsart .na-info{border-top:1.5px solid var(--line);border-bottom:1.5px solid var(--line);
    padding:15px 2px;margin:0 0 32px}
  .newsart .na-info dl{margin:0;display:grid;grid-template-columns:88px 1fr;
    gap:8px 14px;font-size:14px;line-height:1.6}
  .newsart .na-info dt{margin:0;font-weight:900;color:var(--sub)}
  .newsart .na-info dd{margin:0;color:var(--ink);font-weight:600}
  .newsart .na-info .na-note{display:block;margin-top:3px;font-size:12.5px;
    font-weight:600;color:var(--sub)}
  .newsart .na-info .na-links{display:flex;gap:9px;flex-wrap:wrap}
  .newsart .na-info .na-links a{display:inline-block;border:1.5px solid var(--navy);
    color:var(--navy);border-radius:6px;padding:3px 11px;font-size:13px;font-weight:800;
    text-decoration:none}
  .newsart .na-info .na-links a:hover{background:var(--navy);color:#fff}

  .newsart h2{margin:34px 0 13px;font-size:21px;font-weight:900;letter-spacing:-.03em;
    color:var(--navy);padding-left:13px;border-left:5px solid var(--navy);line-height:1.3}
  .newsart .na-body p{margin:0 0 15px;font-size:15.5px;line-height:1.85;color:var(--ink)}

  .newsart .na-quote{margin:24px 0;padding:4px 0 4px 20px;border-left:5px solid var(--main)}
  .newsart .na-body .na-quote p{margin:0;font-size:18px;line-height:1.6;font-weight:800;
    letter-spacing:-.02em;color:var(--navy)}

  .newsart .na-banner{margin:0 0 26px;padding:0}
  .newsart .na-banner img{display:block;width:100%;height:auto;border-radius:10px}

  .newsart .na-plist{display:grid;gap:10px;margin:4px 0 4px}
  .newsart .na-p{display:grid;grid-template-columns:132px 1fr;gap:6px 16px;
    border:1.5px solid var(--line);border-left-width:6px;border-radius:10px;
    padding:14px 18px;text-decoration:none;color:inherit;
    transition:border-color .14s ease,background .14s ease}
  .newsart .na-p.is-main{border-left-color:var(--main)}
  .newsart .na-p.is-findings{border-left-color:var(--find)}
  .newsart .na-p:hover{background:#f4f5f7;border-color:var(--navy)}
  .newsart .na-p .na-pt{grid-row:1/3;align-self:center;font-size:12px;font-weight:900;
    color:#fff;background:var(--main);border-radius:999px;padding:5px 0;text-align:center;
    letter-spacing:.03em}
  .newsart .na-p.is-findings .na-pt{background:var(--find)}
  .newsart .na-p .na-pn{font-size:15px;font-weight:900;color:var(--navy);
    letter-spacing:-.02em;line-height:1.4}
  .newsart .na-p .na-pk{font-size:13.5px;color:var(--sub);font-weight:600;line-height:1.5}

  .newsart .na-fig{margin:28px 0;padding:0}
  .newsart .na-fig img{display:block;width:100%;height:auto;border:1.5px solid var(--line);
    border-radius:8px;background:#fff}
  .newsart .na-fig figcaption{margin-top:9px;font-size:13px;line-height:1.62;color:var(--sub)}

  .newsart .na-set{margin:0;padding:16px 20px;background:#f4f5f7;border-radius:8px;
    display:grid;grid-template-columns:92px 1fr;gap:9px 16px;font-size:14.5px;line-height:1.68}
  .newsart .na-set dt{margin:0;font-weight:900;color:var(--navy)}
  .newsart .na-set dd{margin:0;color:var(--ink)}

  .newsart .na-num{list-style:none;margin:0;padding:0;counter-reset:na}
  .newsart .na-num li{counter-increment:na;position:relative;padding-left:38px;
    margin-bottom:17px;font-size:15.5px;line-height:1.85}
  .newsart .na-num li::before{content:"(" counter(na) ")";position:absolute;left:0;top:0;
    font-weight:900;color:var(--main);font-size:15.5px}

  .newsart .na-body p.na-close{margin:30px 0 0;padding:18px 20px;background:var(--navy);
    border-radius:8px;color:#fff;font-size:15px;line-height:1.78;font-weight:600}

  @media (max-width:640px){
    .newsart .na-head{padding:32px 0 26px}
    .newsart .na-info dl,.newsart .na-set{grid-template-columns:1fr;gap:2px 0}
    .newsart .na-p{grid-template-columns:1fr;gap:7px}
    .newsart .na-p .na-pt{grid-row:auto;justify-self:start;padding:5px 14px}
    .newsart .na-info dt,.newsart .na-set dt{margin-top:9px}
    .newsart .na-body p{font-size:15px}
    .newsart .na-body .na-quote p{font-size:16.5px}
  }
</style>"""


def render_blocks(p):
    out = []
    for kind, val in p["blocks"]:
        if kind == "h2":
            out.append(f"    <h2>{e(val)}</h2>")
        elif kind == "p":
            out.append(f"    <p>{e(val)}</p>")
        elif kind == "quote":
            out.append(f'    <blockquote class="na-quote"><p>{e(val)}</p></blockquote>')
        elif kind == "close":
            out.append(f'    <p class="na-close">{e(val)}</p>')
        elif kind == "fig":
            f = val or dict(src=p.get("fig_src",
                                      f"/images/news/emnlp2026/{p['slug']}-fig1.webp"),
                            alt=p["fig_alt"], cap=p["fig_cap"])
            out.append(f"""    <figure class="na-fig">
      <img src="{f['src']}" alt="{e(f['alt'])}" loading="lazy" decoding="async" />
      <figcaption>{e(f['cap'])}</figcaption>
    </figure>""")
        elif kind == "banner":
            out.append(f"""    <figure class="na-banner">
      <img src="{val['src']}" alt="{e(val['alt'])}" fetchpriority="high" decoding="async" />
    </figure>""")
        elif kind == "papers":
            rows = "\n".join(
                f'      <a class="na-p is-{t}" href="/news/{i}/">'
                f'<span class="na-pt">{TRACK_LABEL[t]}</span>'
                f'<span class="na-pn">{e(en)}</span>'
                f'<span class="na-pk">{e(ko)}</span></a>'
                for t, i, en, ko in val)
            out.append(f'    <div class="na-plist">\n{rows}\n    </div>')
        elif kind == "list":
            rows = "\n".join(f"      <dt>{e(k)}</dt><dd>{e(v)}</dd>" for k, v in val)
            out.append(f'    <dl class="na-set">\n{rows}\n    </dl>')
        elif kind == "num":
            items = "\n".join(f"      <li>{e(x)}</li>" for x in val)
            out.append(f'    <ol class="na-num">\n{items}\n    </ol>')
        else:
            raise ValueError(kind)
    return "\n".join(out)


def article_html(p):
    track = TRACK_LABEL[p["track"]]
    note = (f'<span class="na-note">{e(p["authors_note"])}</span>'
            if p.get("authors_note") else "")
    date = p.get("date", DATE)
    badge = p.get("venue", "EMNLP 2026")
    vfull = p.get("venue_full", VENUE_FULL)
    links = "".join(
        f'<a href="{u}" target="_blank" rel="noopener">{e(t)}</a>'
        for t, u in p.get("links", []))
    links_row = f"<dt>링크</dt><dd class=\"na-links\">{links}</dd>" if links else ""
    hub = p.get("hub", False)
    tldr_box = "" if hub else (
        '<aside class="na-tldr">\n      <b>TL;DR</b>\n'
        f'      <p>{e(p["tldr"])}</p>\n    </aside>')
    en_line = "" if hub else f'<p class="na-en">{e(p["title_en"])}</p>'
    track_badge = "" if hub else f'<span class="na-track is-{p["track"]}">{track}</span>'
    info_box = "" if hub else (
        '<div class="na-info">\n      <dl>\n'
        f'        <dt>논문</dt><dd>{e(p["title_en"])}</dd>\n'
        f'        <dt>저자</dt><dd>{e(p["authors"])}{note}</dd>\n'
        f'        <dt>학회</dt><dd>{vfull}</dd>\n'
        f'        <dt>트랙</dt><dd>{track}</dd>\n'
        f'        {links_row}\n'
        '      </dl>\n    </div>')
    return f"""{CSS}
<article class="newsart">
  <header class="na-head">
    <div class="na-wrap">
      <div class="na-badges">
        <span class="na-venue">{badge}</span>
        {track_badge}
        <span class="na-date">{date.replace('-', '.')}</span>
      </div>
      <h1>{e(p['head'])}</h1>
      {en_line}
    </div>
  </header>

  <div class="na-wrap na-body">
    {tldr_box}

    {info_box}

{render_blocks(p)}
  </div>"""


def build(p):
    s = open(TPL, encoding="utf-8", newline="").read()

    a = s.index("<article>")
    tail_anchor = '<div class="max-w-4xl px-6 pb-16 mx-auto">'
    b = s.index(tail_anchor, a)
    s = s[:a] + article_html(p) + "\n\n" + s[b:]

    s = s.replace(OLD_TITLE, e(p["head"]))
    d = p.get("date", DATE)
    y, m, dd = d.split("-")
    s = s.replace(OLD_ISO, f"{d}T10:00:00&#43;09:00")
    s = s.replace(OLD_SHOWN, f"{y}년 {int(m)}월 {int(dd)}일")
    s = s.replace(f"/news/{OLD_ID}/", f"/news/{p['id']}/")

    out = f"{REPO}/news/{p['id']}"
    os.makedirs(out, exist_ok=True)
    open(f"{out}/index.html", "w", encoding="utf-8", newline="").write(s)
    return f"news/{p['id']}/index.html"


def main():
    for p in PAPERS:
        print("만듦:", build(p))


if __name__ == "__main__":
    main()
