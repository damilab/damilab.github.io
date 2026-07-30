(() => {
  const host = document.getElementById('research-map-host');
  if (!host) return;

  const areas = {
    trust: { name: 'Trustworthy AI', color: '#c64b61', summary: 'Robustness · Security · Privacy' },
    core: { name: 'AI Core Algorithms', color: '#2d70c7', summary: 'Transfer · Optimization' },
    application: { name: 'AI Applications', color: '#19856d', summary: 'Geospatial · Finance · Society' }
  };
  const centers = {
    'trust|Robustness': [145, 180], 'trust|Security & Attacks': [245, 110], 'trust|Privacy & Safety': [210, 245],
    'core|Transfer & Fairness': [350, 115], 'core|Optimization': [410, 185], 'core|Representation': [375, 250],
    'application|Geospatial & Environment': [575, 255], 'application|Finance & Society': [555, 165], 'application|Science & Technology': [665, 305]
  };
  const escape = value => String(value || '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const textOf = el => el?.textContent.trim() || '';

  const style = document.createElement('style');
  style.textContent = `
    .rm{margin:0 0 32px;border:1px solid #dbe5ef;border-radius:16px;overflow:hidden;background:#fff;color:#172b47;font-family:Pretendard,system-ui;box-shadow:0 12px 32px #19325012}
    .rmh{display:flex;justify-content:space-between;gap:16px;padding:18px 21px 14px;border-bottom:1px solid #e6edf4}.rmh b{display:block;font-size:11px;color:#2d63bc;letter-spacing:.12em}.rmh h2{margin:4px 0 0;font-size:18px}.rmh p{margin:4px 0 0;color:#62758b;font-size:12px}
    .rmy{display:flex;align-items:center;gap:6px;flex-wrap:wrap;justify-content:end}.rmy button,.rml button,.rm-paper-list button{cursor:pointer}.rmy button{border:1px solid #dce6f0;border-radius:999px;background:#fff;padding:6px 9px;color:#60748c;font-size:12px;font-weight:800}.rmy .on{border-color:#2864c7;background:#e8f0ff;color:#1d4ed8}
    .rmb{display:grid;grid-template-columns:310px minmax(0,1fr);height:430px;min-height:430px}.rml{display:flex;flex-direction:column;min-height:0;padding:12px;background:#fbfdff;border-right:1px solid #e6edf4}.rm-controls > button{display:block;width:100%;margin-bottom:7px;border:1px solid #e0e9f2;border-left:4px solid var(--c);border-radius:9px;background:#fff;padding:8px 10px;text-align:left}.rm-controls > button.active{border-color:var(--c);background:color-mix(in srgb,var(--c) 8%,#fff)}.rml span{display:flex;justify-content:space-between;gap:8px;font-size:12px;font-weight:800}.rml em,.rml small{font-style:normal;color:#61748a;font-size:11px}.rml small{display:block;margin-top:3px}
    .rm-inspector{display:flex;flex:1;min-height:0;flex-direction:column;margin-top:4px;padding:8px 2px 0;border-top:1px solid #e6edf4}.rm-list-head{display:flex;justify-content:space-between;color:#46627d;font-size:11px;font-weight:800;margin:0 6px 6px}.rm-paper-list{overflow:auto;min-height:0}.rm-paper-list button{display:block;width:100%;border:0;border-bottom:1px solid #edf2f6;background:transparent;padding:7px 6px;text-align:left;color:#47627e;font-size:12px;line-height:1.3}.rm-paper-list button:hover{background:#edf5ff;color:#1f5ea8}.rm-paper-list small{display:block;margin-top:2px;color:#7a8ca0;font-size:10px}.rm-popup{position:absolute;z-index:6;width:min(300px,calc(100% - 24px));border:1px solid #d8e2ef;border-radius:12px;background:rgba(255,255,255,.98);box-shadow:0 12px 30px rgba(23,43,71,.16);padding:12px 14px;color:#172b47}.rm-popup[hidden]{display:none}.rm-popup button[aria-label="Close"]{float:right;border:0;background:transparent;color:#64748b;font-size:19px;line-height:1;cursor:pointer}.rm-popup small{display:block;color:#2563b8;font-size:11px;font-weight:800;letter-spacing:.02em}.rm-popup strong{display:block;margin:6px 20px 6px 0;font-size:13px;line-height:1.38}.rm-popup p{margin:0;color:#52677f;font-size:12px;line-height:1.48}.rm-detail-actions{display:flex;flex-wrap:wrap;gap:6px;margin-top:9px}.rm-detail-actions button,.rm-detail-actions a{border:1px solid #d7e2ef;border-radius:6px;background:#fff;padding:5px 7px;color:#2465b2;font-size:11px;font-weight:800;text-decoration:none;cursor:pointer}.rm-detail-actions button:hover,.rm-detail-actions a:hover{background:#edf5ff}
    .rmw{position:relative;background:#f5f9fc;overflow:hidden}.rmw svg{display:block;width:100%;height:100%}.rmnode{cursor:pointer;outline:none}.rmnode:focus .rm-dot{stroke:#172b47;stroke-width:2.1}.rm-hit,.rm-wash,.rm-halo,.rm-links{pointer-events:none}.rm-hit{pointer-events:all;fill:transparent;stroke:none}.rm-dot{stroke:#fff;stroke-width:1.5}.rmmeta{font:800 11px Pretendard,system-ui;fill:#365778;paint-order:stroke;stroke:#fff;stroke-width:2.5px}.rmsub{font:800 10px Pretendard,system-ui;paint-order:stroke;stroke:#fff;stroke-width:2.5px;cursor:pointer}.rm-legend{font:700 10px Pretendard,system-ui;fill:#6a7d90}
    @keyframes rmglow{0%{opacity:0;transform:scale(.35)}45%{opacity:1;transform:scale(1.18)}100%{opacity:.92;transform:scale(1)}}@keyframes rmwash{0%{opacity:0;transform:scale(.5)}55%{opacity:1}100%{opacity:.75;transform:scale(1)}}.rm-halo{transform-box:fill-box;transform-origin:center;animation:rmglow 1.5s ease-out both}.rm-wash{transform-box:fill-box;transform-origin:center;animation:rmwash 2s ease-out both}
    .publication-item.rm-highlight{outline:3px solid #8ab6ea;outline-offset:3px;transition:outline-color .4s}
    @media (prefers-reduced-motion:reduce){.rm-halo,.rm-wash{animation:none}}
    @media(max-width:820px){.rmh{flex-direction:column;padding:14px 15px 11px;gap:10px}.rmh h2{font-size:16px}.rmy{width:100%;justify-content:flex-start;flex-wrap:nowrap;overflow-x:auto;padding-bottom:2px;-webkit-overflow-scrolling:touch}.rmy button{flex:none}.rmb{display:block;height:auto;min-height:0}.rml{display:block;overflow:visible;padding:10px 12px;border-right:0;border-bottom:1px solid #e6edf4}.rm-controls{display:flex;gap:8px;overflow-x:auto;-webkit-overflow-scrolling:touch}.rm-controls > button{flex:0 0 190px;margin:0}.rm-controls > button:first-child{flex-basis:205px}.rm-inspector{max-height:172px;margin-top:9px;padding:9px 5px;background:#fff}.rmw{overflow-x:auto}.rmw svg{display:block;min-width:760px;width:760px;height:400px}.rm-popup{position:fixed;left:12px!important;right:12px;top:auto!important;bottom:12px;width:auto;font-size:12px}.rm-detail{font-size:12px}}
  `;
  document.head.append(style);

  fetch('/publication/papers.json').then(r => r.json()).then(({ papers }) => mount(papers || [])).catch(() => host.remove());

  function mount(papers) {
    const years = [...new Set(papers.map(p => Number(p.year)))].sort((a, b) => b - a);
    let year = 'all', field = 'all', selected = null;
    host.innerHTML = `<section class="rm"><div class="rmh"><div><b>RESEARCH MAP</b><h2>Three research directions, with evolving subfields</h2><p>One node = one paper · glow = selected year</p></div><div class="rmy"></div></div><div class="rmb"><aside class="rml"><div class="rm-controls"></div><div class="rm-inspector"></div></aside><div class="rmw"><svg viewBox="70 35 700 365" aria-label="Publication research map"></svg></div></div></section>`;
    const yearButtons = host.querySelector('.rmy'), left = host.querySelector('.rm-controls'), inspector = host.querySelector('.rm-inspector'), svg = host.querySelector('svg'), wrap = host.querySelector('.rmw');
    const popup = document.createElement('aside'); popup.className = 'rm-popup'; popup.hidden = true; wrap.append(popup);
    let shown = [];
    const filtered = p => (field === 'all' || p.research_area === field) && (year === 'all' || Number(p.year) === Number(year));
    const position = p => {
      const same = papers.filter(q => q.research_area === p.research_area && q.subfield === p.subfield);
      const i = same.indexOf(p), c = centers[`${p.research_area}|${p.subfield}`] || [410, 185];
      const radius = same.length === 1 ? 0 : 16 + Math.floor(i / 6) * 16, angle = i * 2.399;
      return { ...p, x: c[0] + Math.cos(angle) * radius, y: c[1] + Math.sin(angle) * radius };
    };
    const nodes = papers.map(position);
    const venueFor = p => {
      if (p.venue) return p.venue;
      const card = [...document.querySelectorAll('.publication-item')].find(el => textOf(el.querySelector('h3')) === p.title);
      return [...(card?.querySelectorAll('span') || [])].map(textOf).find(Boolean) || '';
    };
    const linksFor = p => {
      if (Object.keys(p.links || {}).length) return Object.entries(p.links).map(([name, href]) => ({ name, href }));
      const card = [...document.querySelectorAll('.publication-item')].find(el => textOf(el.querySelector('h3')) === p.title);
      return [...(card?.querySelectorAll('a') || [])].map(a => ({ name: textOf(a).replace(/[\[\]]/g, ''), href: a.href })).filter(x => /paper|doi/i.test(x.name));
    };
    const scrollToCard = p => {
      const card = [...document.querySelectorAll('.publication-item')].find(el => textOf(el.querySelector('h3')) === p.title);
      if (!card) return;
      card.scrollIntoView({ behavior: 'smooth', block: 'center' }); card.classList.add('rm-highlight');
      setTimeout(() => card.classList.remove('rm-highlight'), 2000);
    };
    function renderInspector() {
      const active = nodes.filter(filtered);
      inspector.innerHTML = `<div class="rm-list-head"><span>${year === 'all' ? 'All years' : year} · ${active.length} papers</span><span>Click a title</span></div><div class="rm-paper-list">${active.map(n => `<button data-paper-id="${escape(n.id)}">${escape(n.title.split(':')[0])}<small>${escape(venueFor(n) || n.year)}</small></button>`).join('') || '<small>No papers in this filter.</small>'}</div>`;
      inspector.querySelectorAll('[data-paper-id]').forEach(button => button.onclick = () => showNode(nodes.find(n => n.id === button.dataset.paperId)));
    }
    function drawLinks(active) {
      const pairs = new Map();
      active.forEach((node, i) => active.slice(i + 1).forEach(other => {
        const nodeTerms = new Set((node.keywords || []).map(k => k.toLowerCase()));
        const shared = (other.keywords || []).filter(k => nodeTerms.has(k.toLowerCase())).length;
        const sameSubfield = node.subfield === other.subfield, sameArea = node.research_area === other.research_area;
        if (!shared && !sameSubfield && !sameArea) return;
        const distance = Math.hypot(node.x - other.x, node.y - other.y);
        const score = shared * 100 + (sameSubfield ? 40 : 0) + (sameArea ? 12 : 0) - distance / 12;
        pairs.set(`${node.id}|${other.id}`, { node, other, shared, sameSubfield, score });
      }));
      const picked = new Map();
      active.forEach(node => [...pairs.values()].filter(x => x.node === node || x.other === node).sort((a, b) => b.score - a.score).slice(0, 2).forEach(x => picked.set(`${x.node.id}|${x.other.id}`, x)));
      const layer = document.createElementNS('http://www.w3.org/2000/svg', 'g'); layer.setAttribute('class', 'rm-links');
      picked.forEach(({ node, other, shared, sameSubfield }) => {
        const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        line.setAttribute('x1', node.x); line.setAttribute('y1', node.y); line.setAttribute('x2', other.x); line.setAttribute('y2', other.y);
        line.setAttribute('stroke', node.research_area === other.research_area ? areas[node.research_area].color : '#71829a');
        line.setAttribute('stroke-width', shared ? '1.7' : sameSubfield ? '1.45' : '1.1'); line.setAttribute('stroke-opacity', shared ? '.58' : sameSubfield ? '.42' : '.30'); layer.append(line);
      });
      svg.append(layer);
    }
    function nearestNode(event) {
      if (!event || !shown.length) return null;
      const point = svg.createSVGPoint(); point.x = event.clientX; point.y = event.clientY;
      const local = point.matrixTransform(svg.getScreenCTM().inverse());
      return shown.reduce((best, node) => ((node.x - local.x) ** 2 + (node.y - local.y) ** 2 < (best.x - local.x) ** 2 + (best.y - local.y) ** 2 ? node : best));
    }
    function showNode(node) {
      if (!node) return;
      selected = node;
      const venue = venueFor(node), links = linksFor(node), dot = svg.querySelector(`.rmnode[data-id="${node.id}"] .rm-dot`);
      popup.hidden = false;
      popup.innerHTML = `<button aria-label="Close">×</button><small>${escape(node.map_label || node.subfield)} · ${venue ? `${escape(venue)} · ` : ''}${node.year}</small><strong>${escape(node.title)}</strong><p>${escape(node.abstract || '').slice(0, 170)}${(node.abstract || '').length > 170 ? '…' : ''}</p><div class="rm-detail-actions"><button data-show-card>전체 항목 보기</button>${links.map(l => `<a href="${escape(l.href)}" target="_blank" rel="noopener">${escape(l.name)}</a>`).join('')}</div>`;
      popup.querySelector('[aria-label="Close"]').onclick = () => { selected = null; popup.hidden = true; };
      popup.querySelector('[data-show-card]').onclick = () => scrollToCard(node);
      if (innerWidth > 820 && dot) {
        const point = dot.getBoundingClientRect(), box = wrap.getBoundingClientRect();
        popup.style.left = `${Math.max(12, Math.min(box.width - 312, point.left - box.left - 136))}px`;
        popup.style.top = `${Math.max(12, point.top - box.top - popup.offsetHeight - 16)}px`;
      }
    }
    function render() {
      yearButtons.innerHTML = ['all', ...years].map(value => `<button data-year="${value}" class="${String(year) === String(value) ? 'on' : ''}">${value === 'all' ? 'All' : value}</button>`).join('');
      yearButtons.querySelectorAll('button').forEach(button => button.onclick = () => { year = button.dataset.year === 'all' ? 'all' : Number(button.dataset.year); selected = null; render(); });
      const total = key => nodes.filter(n => key === 'all' || n.research_area === key).length;
      const visible = key => nodes.filter(n => (key === 'all' || n.research_area === key) && (year === 'all' || n.year === year)).length;
      left.innerHTML = `<button data-field="all" style="--c:#52667f" class="${field === 'all' ? 'active' : ''}"><span>All research <em>${visible('all')} of ${total('all')}</em></span><small>Trustworthy AI · Core Algorithms · Applications</small></button>` + Object.entries(areas).map(([key, area]) => `<button data-field="${key}" style="--c:${area.color}" class="${field === key ? 'active' : ''}"><span>${area.name}<em>${visible(key)} of ${total(key)}</em></span><small>${area.summary}</small></button>`).join('');
      left.querySelectorAll('button').forEach(button => button.onclick = () => { field = button.dataset.field; selected = null; render(); });
      popup.hidden = true; shown = nodes.filter(filtered); svg.innerHTML = `<defs>${Object.entries(areas).map(([key, area]) => `<radialGradient id="rmg-${key}"><stop offset="0" stop-color="${area.color}" stop-opacity=".62"/><stop offset=".45" stop-color="${area.color}" stop-opacity=".25"/><stop offset="1" stop-color="${area.color}" stop-opacity="0"/></radialGradient><radialGradient id="rmw-${key}"><stop offset="0" stop-color="${area.color}" stop-opacity=".28"/><stop offset=".6" stop-color="${area.color}" stop-opacity=".08"/><stop offset="1" stop-color="${area.color}" stop-opacity="0"/></radialGradient>`).join('')}</defs>`;
      Object.entries(areas).forEach(([key, area]) => {
        const group = nodes.filter(n => n.research_area === key); if (!group.length) return;
        const xs = group.map(n => n.x), ys = group.map(n => n.y), x0 = Math.min(...xs) - 28, x1 = Math.max(...xs) + 28, y0 = Math.min(...ys) - 28, y1 = Math.max(...ys) + 28;
        svg.insertAdjacentHTML('beforeend', `<ellipse cx="${(x0 + x1) / 2}" cy="${(y0 + y1) / 2}" rx="${Math.max(75, (x1 - x0) / 2)}" ry="${Math.max(65, (y1 - y0) / 2)}" fill="${area.color}" fill-opacity=".10" stroke="${area.color}" stroke-opacity=".13"/><text x="${(x0 + x1) / 2 - (key === 'application' ? 90 : 0)}" y="${y0 - 4}" text-anchor="middle" fill="${area.color}" style="font:800 13px Pretendard,system-ui;paint-order:stroke;stroke:#fff;stroke-width:3px">${area.name}</text>`);
      });
      const groups = {}; nodes.forEach(node => ((groups[`${node.research_area}|${node.subfield}`] ||= []).push(node)));
      Object.values(groups).forEach(group => {
        const xs = group.map(n => n.x), ys = group.map(n => n.y), x0 = Math.min(...xs) - 20, x1 = Math.max(...xs) + 20, y0 = Math.min(...ys) - 18, y1 = Math.max(...ys) + 18, area = areas[group[0].research_area];
        const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        g.innerHTML = `<ellipse cx="${(x0 + x1) / 2}" cy="${(y0 + y1) / 2}" rx="${Math.max(38, (x1 - x0) / 2 * 1.45)}" ry="${Math.max(30, (y1 - y0) / 2 * 1.45)}" fill="${area.color}" fill-opacity=".085" stroke="${area.color}" stroke-opacity=".09"/><text class="rmsub" x="${(x0 + x1) / 2}" y="${y0 - 7}" text-anchor="middle" fill="${area.color}">${escape(group[0].subfield)}</text>`;
        g.querySelector('text').onclick = () => { field = group[0].research_area; selected = null; render(); }; svg.append(g);
      });
      drawLinks(shown);
      shown.forEach(node => {
        const area = areas[node.research_area], activeYear = year !== 'all';
        const g = document.createElementNS('http://www.w3.org/2000/svg', 'g'); g.setAttribute('class', 'rmnode'); g.dataset.id = node.id; g.setAttribute('role', 'button'); g.setAttribute('tabindex', '0');
        g.innerHTML = `<title>${escape(node.title)}</title><circle class="rm-hit" cx="${node.x}" cy="${node.y}" r="14"/>${activeYear ? `<circle class="rm-wash" cx="${node.x}" cy="${node.y}" r="30" fill="url(#rmw-${node.research_area})"/><circle class="rm-halo" cx="${node.x}" cy="${node.y}" r="13" fill="url(#rmg-${node.research_area})"/>` : ''}<circle class="rm-dot" cx="${node.x}" cy="${node.y}" r="${activeYear ? 5.2 : 4.2}" fill="${area.color}"/>${activeYear ? `<text class="rmmeta" x="${node.x + (node.x > 620 ? -9 : 9)}" y="${node.y - 8}" text-anchor="${node.x > 620 ? 'end' : 'start'}">${escape(node.map_label || node.subfield)}</text>` : ''}`;
        g.onclick = event => { event.stopPropagation(); showNode(nearestNode(event) || node); };
        g.onkeydown = event => { if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); showNode(node); } }; svg.append(g);
      });
      svg.insertAdjacentHTML('beforeend', `<text class="rm-legend" x="84" y="386">1 node = 1 paper · lines = shared topic or nearby research thread</text>`);
      renderInspector();
    }
    render();
  }
})();
