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
    'core|Transfer Learning': [350, 115], 'core|Fairness': [380, 150], 'core|Optimization': [410, 185], 'core|Representation': [375, 250],
    'application|Geospatial & Environment': [575, 255], 'application|Finance & Society': [555, 165], 'application|Science & Technology': [665, 305]
  };
  const publishedNodeLayout = {"paper-31":{"x":231.1,"y":179.5},"paper-9":{"x":237.5,"y":134.4},"paper-4":{"x":278.8,"y":121.9},"paper-29":{"x":253.2,"y":105.1},"paper-6":{"x":213.1,"y":234.2},"paper-2":{"x":517.6,"y":158.5},"paper-34":{"x":136.9,"y":149.7},"paper-17":{"x":102,"y":222.7},"paper-24":{"x":95.3,"y":154.9},"paper-26":{"x":132.7,"y":183.5},"paper-18":{"x":174.2,"y":145},"paper-21":{"x":167.7,"y":174.3},"paper-15":{"x":179.3,"y":190.2},"paper-25":{"x":257.3,"y":250.4},"paper-0":{"x":565.9,"y":245.5},"paper-5":{"x":537.4,"y":267.2},"paper-3":{"x":708.8,"y":241.2},"paper-7":{"x":545.9,"y":155.5},"paper-8":{"x":551.2,"y":229.6},"paper-11":{"x":657.3,"y":262.9},"paper-12":{"x":531.2,"y":139.6},"paper-13":{"x":670.4,"y":236.1},"paper-14":{"x":563,"y":263.6},"paper-16":{"x":515.8,"y":233.3},"paper-19":{"x":678.8,"y":264.7},"paper-23":{"x":643.1,"y":243.9},"paper-33":{"x":698.2,"y":195.8},"paper-35":{"x":660.9,"y":283},"paper-36":{"x":650.1,"y":216.9},"paper-37":{"x":699.2,"y":262.8},"paper-1":{"x":427.4,"y":242.7},"paper-28":{"x":379.5,"y":173.8},"paper-32":{"x":404.9,"y":149.8},"paper-10":{"x":394.5,"y":129.9},"paper-20":{"x":343.6,"y":163.2},"paper-30":{"x":334.9,"y":140.8},"paper-22":{"x":393.5,"y":249.5},"paper-27":{"x":366.3,"y":126.9}};
  const publishedLabelLayout = {"sub:trust|Security & Attacks":{"x":246.6,"y":92.3},"sub:trust|Robustness":{"x":130.6,"y":138.3},"sub:core|Fairness":{"x":376,"y":117.6},"area:core":{"x":397.8,"y":65.7},"sub:application|Finance & Society":{"x":535.5,"y":127.5},"area:application":{"x":605.3,"y":94.6},"area:trust":{"x":193.8,"y":64.3},"sub:core|Optimization":{"x":398.2,"y":221.8}};
  const d3Ready = window.d3?.forceSimulation ? Promise.resolve(window.d3) : new Promise(resolve => {
    const script = document.createElement('script'); script.src = 'https://cdn.jsdelivr.net/npm/d3@7/dist/d3.min.js'; script.onload = () => resolve(window.d3); script.onerror = () => resolve(null); document.head.append(script);
  });
  const escape = value => String(value || '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const textOf = el => el?.textContent.trim() || '';

  const style = document.createElement('style');
  style.textContent = `
    .rm{margin:0 0 32px;border:1px solid #dbe5ef;border-radius:16px;overflow:hidden;background:#fff;color:#172b47;font-family:Pretendard,system-ui;box-shadow:0 12px 32px #19325012}
    .rmh{display:flex;justify-content:space-between;gap:16px;padding:18px 21px 14px;border-bottom:1px solid #e6edf4}.rmh b{display:block;font-size:11px;color:#2d63bc;letter-spacing:.12em}.rmh h2{margin:4px 0 0;font-size:18px}.rmh p{margin:4px 0 0;color:#62758b;font-size:12px}.rm-head-actions{display:flex;align-items:end;gap:8px}.rm-layout-actions{display:flex;gap:5px}.rm-layout-actions[hidden]{display:none}
    .rmy{display:flex;align-items:center;gap:6px;flex-wrap:wrap;justify-content:end}.rmy button,.rml button,.rm-paper-list button,.rm-layout-actions button{cursor:pointer}.rmy button{border:1px solid #dce6f0;border-radius:999px;background:#fff;padding:6px 9px;color:#60748c;font-size:12px;font-weight:800}.rmy .on{border-color:#2864c7;background:#e8f0ff;color:#1d4ed8}.rm-layout-actions button{border:1px solid #cad8e7;border-radius:7px;background:#fff;padding:7px 8px;color:#3c5875;font-size:11px;font-weight:800}.rm-layout-actions button.primary{border-color:#2864c7;background:#2864c7;color:#fff}.rm-layout-actions button.topic-on{border-color:#b9cfe9;background:#edf5ff;color:#1e5aa1}.rm-layout-actions button:hover{background:#edf5ff}.rm-layout-actions button.primary:hover{background:#1e56ad}
    .rmb{display:grid;grid-template-columns:310px minmax(0,1fr);height:430px;min-height:430px}.rml{display:flex;flex-direction:column;min-height:0;padding:12px;background:#fbfdff;border-right:1px solid #e6edf4}.rm-controls > button{display:block;width:100%;margin-bottom:7px;border:1px solid #e0e9f2;border-left:4px solid var(--c);border-radius:9px;background:#fff;padding:8px 10px;text-align:left}.rm-controls > button.active{border-color:var(--c);background:color-mix(in srgb,var(--c) 8%,#fff)}.rml span{display:flex;justify-content:space-between;gap:8px;font-size:12px;font-weight:800}.rml em,.rml small{font-style:normal;color:#61748a;font-size:11px}.rml small{display:block;margin-top:3px}
    .rm-inspector{display:flex;flex:1;min-height:0;flex-direction:column;margin-top:4px;padding:8px 2px 0;border-top:1px solid #e6edf4}.rm-list-head{display:flex;justify-content:space-between;color:#46627d;font-size:11px;font-weight:800;margin:0 6px 6px}.rm-paper-list{overflow:auto;min-height:0}.rm-paper-list button{display:block;width:100%;border:0;border-bottom:1px solid #edf2f6;background:transparent;padding:7px 6px;text-align:left;color:#47627e;font-size:12px;line-height:1.3}.rm-paper-list button:hover{background:#edf5ff;color:#1f5ea8}.rm-paper-list small{display:block;margin-top:2px;color:#7a8ca0;font-size:10px}.rm-popup{position:absolute;z-index:6;width:min(300px,calc(100% - 24px));border:1px solid #d8e2ef;border-radius:12px;background:rgba(255,255,255,.98);box-shadow:0 12px 30px rgba(23,43,71,.16);padding:12px 14px;color:#172b47}.rm-popup[hidden]{display:none}.rm-popup button[aria-label="Close"]{float:right;border:0;background:transparent;color:#64748b;font-size:19px;line-height:1;cursor:pointer}.rm-popup small{display:block;color:#2563b8;font-size:11px;font-weight:800;letter-spacing:.02em}.rm-popup strong{display:block;margin:6px 20px 6px 0;font-size:13px;line-height:1.38}.rm-popup p{margin:0;color:#52677f;font-size:12px;line-height:1.48}.rm-detail-actions{display:flex;flex-wrap:wrap;gap:6px;margin-top:9px}.rm-detail-actions button,.rm-detail-actions a{border:1px solid #d7e2ef;border-radius:6px;background:#fff;padding:5px 7px;color:#2465b2;font-size:11px;font-weight:800;text-decoration:none;cursor:pointer}.rm-detail-actions button:hover,.rm-detail-actions a:hover{background:#edf5ff}
    .rmw{position:relative;background:#f5f9fc;overflow:hidden}.rmw svg{display:block;width:100%;height:100%}.rmnode{cursor:pointer;outline:none}.rmnode.is-arranging{cursor:grab;touch-action:none}.rmnode.is-arranging:active{cursor:grabbing}.rmnode.is-selected .rm-dot{stroke:#172b47;stroke-width:3.2}.rmnode:focus .rm-dot{stroke:#172b47;stroke-width:2.1}.rm-hit,.rm-wash,.rm-halo,.rm-links,.rm-selection,.rm-topic{pointer-events:none}.rm-hit{pointer-events:all;fill:transparent;stroke:none}.rm-selection{fill:#5b97de;fill-opacity:.12;stroke:#2864c7;stroke-width:1.2;stroke-dasharray:4 3}.rm-dot{stroke:#fff;stroke-width:1.5}.rmmeta{font:800 11px Pretendard,system-ui;fill:#365778;paint-order:stroke;stroke:#fff;stroke-width:2.5px}.rm-topic{font:800 10px Pretendard,system-ui;fill:#3d5874;paint-order:stroke;stroke:#fff;stroke-width:2.5px}.rmsub{font:800 10px Pretendard,system-ui;fill:#365778;paint-order:stroke;stroke:#fff;stroke-width:2.5px;cursor:pointer}.rm-legend{font:700 10px Pretendard,system-ui;fill:#6a7d90}.rm.is-arranging .rmw{background:#f9fbfe}.rm.is-arranging .rmnode .rm-dot{stroke-width:2.5}.rm.is-arranging .rm-area-label,.rm.is-arranging .rmsub{cursor:grab;touch-action:none}.rm.is-arranging .rm-legend{fill:#2563b8}
    @keyframes rmglow{0%{opacity:0;transform:scale(.35)}45%{opacity:1;transform:scale(1.18)}100%{opacity:.92;transform:scale(1)}}@keyframes rmwash{0%{opacity:0;transform:scale(.5)}55%{opacity:1}100%{opacity:.75;transform:scale(1)}}.rm-halo{transform-box:fill-box;transform-origin:center;animation:rmglow 1.5s ease-out both}.rm-wash{transform-box:fill-box;transform-origin:center;animation:rmwash 2s ease-out both}
    .publication-item.rm-highlight{outline:3px solid #8ab6ea;outline-offset:3px;transition:outline-color .4s}
    @media (prefers-reduced-motion:reduce){.rm-halo,.rm-wash{animation:none}}
    @media(max-width:820px){.rmh{flex-direction:column;padding:14px 15px 11px;gap:10px}.rmh h2{font-size:16px}.rm-head-actions{align-items:flex-start;flex-direction:column}.rmy{width:100%;justify-content:flex-start;flex-wrap:nowrap;overflow-x:auto;padding-bottom:2px;-webkit-overflow-scrolling:touch}.rmy button{flex:none}.rmb{display:block;height:auto;min-height:0}.rml{display:block;overflow:visible;padding:10px 12px;border-right:0;border-bottom:1px solid #e6edf4}.rm-controls{display:flex;gap:8px;overflow-x:auto;-webkit-overflow-scrolling:touch}.rm-controls > button{flex:0 0 190px;margin:0}.rm-controls > button:first-child{flex-basis:205px}.rm-inspector{max-height:172px;margin-top:9px;padding:9px 5px;background:#fff}.rmw{overflow-x:auto}.rmw svg{display:block;min-width:760px;width:760px;height:400px}.rm-popup{position:fixed;left:12px!important;right:12px;top:auto!important;bottom:12px;width:auto;font-size:12px}.rm-detail{font-size:12px}}
  `;
  document.head.append(style);

  fetch('/publication/papers.json').then(r => r.json()).then(({ papers }) => mount(papers || [])).catch(() => host.remove());

  function mount(papers) {
    const years = [...new Set(papers.map(p => Number(p.year)))].sort((a, b) => b - a);
    let year = 'all', field = 'all', selected = null, arranging = false, layout = loadLayout(), labelLayout = loadLabelLayout(), showTopics = localStorage.getItem('dami-research-map-topics') === '1';
    host.innerHTML = `<section class="rm"><div class="rmh"><div><b>RESEARCH MAP</b><h2>Three research directions, with evolving subfields</h2><p>One node = one paper · glow = selected year</p></div><div class="rm-head-actions"><div class="rmy"></div><div class="rm-layout-actions"><button data-topics>Topics off</button><button data-arrange class="primary">Arrange nodes</button><span data-arrange-extra hidden><button data-copy>Copy layout</button><button data-reset>Reset</button></span></div></div></div><div class="rmb"><aside class="rml"><div class="rm-controls"></div><div class="rm-inspector"></div></aside><div class="rmw"><svg viewBox="70 35 700 365" aria-label="Publication research map"></svg></div></div></section>`;
    const yearButtons = host.querySelector('.rmy'), left = host.querySelector('.rm-controls'), inspector = host.querySelector('.rm-inspector'), svg = host.querySelector('svg'), wrap = host.querySelector('.rmw');
    const popup = document.createElement('aside'); popup.className = 'rm-popup'; popup.hidden = true; wrap.append(popup);
    const arrangeButton = host.querySelector('[data-arrange]'), arrangeExtra = host.querySelector('[data-arrange-extra]'), topicsButton = host.querySelector('[data-topics]');
    let shown = [], selectedNodeIds = new Set(), dynamicPositions = new Map(), activeSimulation = null;
    function loadLayout() { try { return { ...publishedNodeLayout, ...JSON.parse(localStorage.getItem('dami-research-map-layout-v1') || '{}') }; } catch { return { ...publishedNodeLayout }; } }
    function saveLayout() { localStorage.setItem('dami-research-map-layout-v1', JSON.stringify(layout)); }
    function loadLabelLayout() { try { return { ...publishedLabelLayout, ...JSON.parse(localStorage.getItem('dami-research-map-label-layout-v1') || '{}') }; } catch { return { ...publishedLabelLayout }; } }
    function saveLabelLayout() { localStorage.setItem('dami-research-map-label-layout-v1', JSON.stringify(labelLayout)); }
    const filtered = p => (field === 'all' || p.research_area === field) && (year === 'all' || Number(p.year) === Number(year));
    const position = p => {
      const same = papers.filter(q => q.research_area === p.research_area && q.subfield === p.subfield);
      const i = same.indexOf(p), c = centers[`${p.research_area}|${p.subfield}`] || [410, 185];
      const radius = same.length === 1 ? 0 : 16 + Math.floor(i / 6) * 16, angle = i * 2.399;
      const base = { x: c[0] + Math.cos(angle) * radius, y: c[1] + Math.sin(angle) * radius }, saved = layout[p.id];
      return { ...p, x: saved?.x ?? base.x, y: saved?.y ?? base.y };
    };
    let nodes = papers.map(position);
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
      const layer = document.createElementNS('http://www.w3.org/2000/svg', 'g'), rendered = []; layer.setAttribute('class', 'rm-links');
      picked.forEach(({ node, other, shared, sameSubfield }) => {
        const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        line.setAttribute('x1', node.x); line.setAttribute('y1', node.y); line.setAttribute('x2', other.x); line.setAttribute('y2', other.y);
        line.setAttribute('stroke', node.research_area === other.research_area ? areas[node.research_area].color : '#71829a');
        line.setAttribute('stroke-width', shared ? '1.7' : sameSubfield ? '1.45' : '1.1'); line.setAttribute('stroke-opacity', shared ? '.58' : sameSubfield ? '.42' : '.30'); layer.append(line); rendered.push({ source: node.id, target: other.id, line, shared, crossArea: node.research_area !== other.research_area });
      });
      svg.append(layer); return rendered;
    }
    function nearestNode(event) {
      if (!event || !shown.length) return null;
      const point = svg.createSVGPoint(); point.x = event.clientX; point.y = event.clientY;
      const local = point.matrixTransform(svg.getScreenCTM().inverse());
      return shown.reduce((best, node) => {
        const a = dynamicPositions.get(node.id) || node, b = dynamicPositions.get(best.id) || best;
        return (a.x - local.x) ** 2 + (a.y - local.y) ** 2 < (b.x - local.x) ** 2 + (b.y - local.y) ** 2 ? node : best;
      });
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
      activeSimulation?.stop(); activeSimulation = null; dynamicPositions = new Map();
      host.querySelector('.rm').classList.toggle('is-arranging', arranging); arrangeButton.textContent = arranging ? 'Done arranging' : 'Arrange map'; arrangeExtra.hidden = !arranging; topicsButton.textContent = showTopics ? 'Topics on' : 'Topics off'; topicsButton.classList.toggle('topic-on', showTopics);
      yearButtons.innerHTML = ['all', ...years].map(value => `<button data-year="${value}" class="${String(year) === String(value) ? 'on' : ''}">${value === 'all' ? 'All' : value}</button>`).join('');
      yearButtons.querySelectorAll('button').forEach(button => button.onclick = () => { year = button.dataset.year === 'all' ? 'all' : Number(button.dataset.year); selected = null; render(); });
      const total = key => nodes.filter(n => key === 'all' || n.research_area === key).length;
      const visible = key => nodes.filter(n => (key === 'all' || n.research_area === key) && (year === 'all' || n.year === year)).length;
      left.innerHTML = `<button data-field="all" style="--c:#52667f" class="${field === 'all' ? 'active' : ''}"><span>All research <em>${visible('all')} of ${total('all')}</em></span><small>Trustworthy AI · Core Algorithms · Applications</small></button>` + Object.entries(areas).map(([key, area]) => `<button data-field="${key}" style="--c:${area.color}" class="${field === key ? 'active' : ''}"><span>${area.name}<em>${visible(key)} of ${total(key)}</em></span><small>${key === 'core' ? 'Transfer Learning · Fairness · Optimization' : area.summary}</small></button>`).join('');
      left.querySelectorAll('button').forEach(button => button.onclick = () => { field = button.dataset.field; selected = null; render(); });
      popup.hidden = true; shown = nodes.filter(filtered); svg.innerHTML = `<defs>${Object.entries(areas).map(([key, area]) => `<radialGradient id="rmg-${key}"><stop offset="0" stop-color="${area.color}" stop-opacity=".62"/><stop offset=".45" stop-color="${area.color}" stop-opacity=".25"/><stop offset="1" stop-color="${area.color}" stop-opacity="0"/></radialGradient><radialGradient id="rmw-${key}"><stop offset="0" stop-color="${area.color}" stop-opacity=".28"/><stop offset=".6" stop-color="${area.color}" stop-opacity=".08"/><stop offset="1" stop-color="${area.color}" stop-opacity="0"/></radialGradient>`).join('')}</defs>`;
      Object.entries(areas).forEach(([key, area]) => {
        const group = nodes.filter(n => n.research_area === key); if (!group.length) return;
        const xs = group.map(n => n.x), ys = group.map(n => n.y), x0 = Math.min(...xs) - 28, x1 = Math.max(...xs) + 28, y0 = Math.min(...ys) - 28, y1 = Math.max(...ys) + 28;
        const labelKey = `area:${key}`, defaultLabel = { x: (x0 + x1) / 2 - (key === 'application' ? 90 : 0), y: y0 - 4 }, savedLabel = labelLayout[labelKey] || defaultLabel;
        svg.insertAdjacentHTML('beforeend', `<ellipse cx="${(x0 + x1) / 2}" cy="${(y0 + y1) / 2}" rx="${Math.max(75, (x1 - x0) / 2)}" ry="${Math.max(65, (y1 - y0) / 2)}" fill="${area.color}" fill-opacity=".10" stroke="${area.color}" stroke-opacity=".13"/><text class="rm-area-label" data-layout-label="${labelKey}" x="${savedLabel.x}" y="${savedLabel.y}" text-anchor="middle" fill="${area.color}" style="font:800 16px Pretendard,system-ui;paint-order:stroke;stroke:#fff;stroke-width:3px">${area.name}</text>`);
      });
      const groups = {}; nodes.forEach(node => ((groups[`${node.research_area}|${node.subfield}`] ||= []).push(node)));
      Object.values(groups).forEach(group => {
        const xs = group.map(n => n.x), ys = group.map(n => n.y), x0 = Math.min(...xs) - 20, x1 = Math.max(...xs) + 20, y0 = Math.min(...ys) - 18, y1 = Math.max(...ys) + 18, area = areas[group[0].research_area];
        const labelKey = `sub:${group[0].research_area}|${group[0].subfield}`, defaultLabel = { x: (x0 + x1) / 2, y: y0 - 7 }, savedLabel = labelLayout[labelKey] || defaultLabel;
        const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        g.innerHTML = `<ellipse cx="${(x0 + x1) / 2}" cy="${(y0 + y1) / 2}" rx="${Math.max(38, (x1 - x0) / 2 * 1.45)}" ry="${Math.max(30, (y1 - y0) / 2 * 1.45)}" fill="${area.color}" fill-opacity=".085" stroke="${area.color}" stroke-opacity=".09"/><text class="rmsub" data-layout-label="${labelKey}" x="${savedLabel.x}" y="${savedLabel.y}" text-anchor="middle" fill="${area.color}">${escape(group[0].subfield)}</text>`;
        g.querySelector('text').onclick = () => { if (!arranging) { field = group[0].research_area; selected = null; render(); } }; svg.append(g);
      });
      if (arranging) svg.querySelectorAll('[data-layout-label]').forEach(label => makeLabelDraggable(label, label.dataset.layoutLabel));
      const mapLinks = drawLinks(shown);
      shown.forEach(node => {
        const area = areas[node.research_area], activeYear = year !== 'all';
        const g = document.createElementNS('http://www.w3.org/2000/svg', 'g'); g.setAttribute('class', `rmnode${arranging ? ' is-arranging' : ''}${selectedNodeIds.has(node.id) ? ' is-selected' : ''}`); g.dataset.id = node.id; g.setAttribute('role', 'button'); g.setAttribute('tabindex', '0');
        const topic = String(node.map_label || node.keywords?.[0] || node.subfield).replace(/\s+/g, ' ').trim();
        const shortTopic = topic.length > 16 ? `${topic.slice(0, 15)}…` : topic;
        g.innerHTML = `<title>${escape(node.title)}</title><circle class="rm-hit" cx="${node.x}" cy="${node.y}" r="14"/>${activeYear ? `<circle class="rm-wash" cx="${node.x}" cy="${node.y}" r="30" fill="url(#rmw-${node.research_area})"/><circle class="rm-halo" cx="${node.x}" cy="${node.y}" r="13" fill="url(#rmg-${node.research_area})"/>` : ''}<circle class="rm-dot" cx="${node.x}" cy="${node.y}" r="${activeYear ? 5.2 : 4.2}" fill="${area.color}"/>${showTopics ? `<text class="rm-topic" x="${node.x}" y="${node.y - 9}" text-anchor="middle">${escape(shortTopic)}</text>` : activeYear ? `<text class="rmmeta" x="${node.x + (node.x > 620 ? -9 : 9)}" y="${node.y - 8}" text-anchor="${node.x > 620 ? 'end' : 'start'}">${escape(node.map_label || node.subfield)}</text>` : ''}`;
        g.onclick = event => { event.stopPropagation(); if (!arranging && g.dataset.dragged !== '1') showNode(nearestNode(event) || node); };
        g.onkeydown = event => { if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); showNode(node); } }; svg.append(g);
        if (arranging) {
          g.onpointerdown = event => {
            event.preventDefault(); event.stopPropagation();
            const movingNodes = selectedNodeIds.has(node.id) ? nodes.filter(n => selectedNodeIds.has(n.id)) : [node];
            if (!selectedNodeIds.has(node.id)) selectedNodeIds.clear();
            const start = svgPoint(event), origins = new Map(movingNodes.map(n => [n.id, { x: n.x, y: n.y }]));
            g.setPointerCapture?.(event.pointerId);
            const move = moving => { const point = svgPoint(moving), dx = point.x - start.x, dy = point.y - start.y; movingNodes.forEach(n => svg.querySelector(`.rmnode[data-id="${n.id}"]`)?.setAttribute('transform', `translate(${dx} ${dy})`)); };
            const finish = ending => { const point = svgPoint(ending), dx = point.x - start.x, dy = point.y - start.y; movingNodes.forEach(n => { const origin = origins.get(n.id); n.x = Math.max(92, Math.min(748, origin.x + dx)); n.y = Math.max(55, Math.min(378, origin.y + dy)); layout[n.id] = { x: +n.x.toFixed(1), y: +n.y.toFixed(1) }; }); saveLayout(); g.removeEventListener('pointermove', move); g.removeEventListener('pointerup', finish); g.removeEventListener('pointercancel', finish); render(); };
            g.addEventListener('pointermove', move); g.addEventListener('pointerup', finish); g.addEventListener('pointercancel', finish);
          };
        }
      });
      settleNodeLabels();
      if (!arranging) startDynamicLayout(mapLinks);
      if (arranging) enableBoxSelection();
      svg.insertAdjacentHTML('beforeend', `<text class="rm-legend" x="84" y="386">${arranging ? 'Drag empty space to select · drag a selected node to move the group' : '1 node = 1 paper · lines = shared topic or nearby research thread'}</text>`);
      renderInspector();
    }
    function settleNodeLabels() {
      const d3 = window.d3;
      if (!d3?.forceSimulation) return;
      const records = [...svg.querySelectorAll('.rm-topic,.rmmeta')].map(label => {
        const dot = label.closest('.rmnode')?.querySelector('.rm-dot'); if (!dot) return null;
        const box = label.getBBox(), cx = box.x + box.width / 2, cy = box.y + box.height / 2;
        return { label, width: box.width, height: box.height, x: cx, y: cy, cx, cy, targetX: cx, targetY: +dot.getAttribute('cy') - 15 };
      }).filter(Boolean);
      if (records.length < 2) return;
      const simulation = d3.forceSimulation(records).force('x', d3.forceX(d => d.targetX).strength(.16)).force('y', d3.forceY(d => d.targetY).strength(.22)).force('collide', d3.forceCollide(d => Math.max(13, d.width * .46)).iterations(4)).stop();
      for (let i = 0; i < 100; i += 1) simulation.tick();
      records.forEach(d => d.label.setAttribute('transform', `translate(${Math.max(-42, Math.min(42, d.x - d.cx))} ${Math.max(-34, Math.min(28, d.y - d.cy))})`));
    }
    function startDynamicLayout(mapLinks) {
      const d3 = window.d3;
      const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
      if (!d3?.forceSimulation || reducedMotion) { dynamicPositions = new Map(shown.map(node => [node.id, node])); return; }
      const physics = shown.map(node => {
        const label = svg.querySelector(`.rmnode[data-id="${node.id}"] .rm-topic, .rmnode[data-id="${node.id}"] .rmmeta`);
        const box = label?.getBBox();
        return { ...node, x: node.x, y: node.y, homeX: node.x, homeY: node.y, cluster: `${node.research_area}|${node.subfield}`, radius: Math.max(11, (box?.width || 0) * .45 + 5) };
      });
      const clusterTargets = new Map();
      physics.forEach(node => { const target = clusterTargets.get(node.cluster) || { x: 0, y: 0, count: 0 }; target.x += node.homeX; target.y += node.homeY; target.count += 1; clusterTargets.set(node.cluster, target); });
      clusterTargets.forEach(target => { target.x /= target.count; target.y /= target.count; });
      const byId = new Map(physics.map(node => [node.id, node]));
      dynamicPositions = byId;
      const links = mapLinks.map(link => ({ ...link, source: byId.get(link.source), target: byId.get(link.target) })).filter(link => link.source && link.target);
      physics.forEach(node => {
        const group = svg.querySelector(`.rmnode[data-id="${node.id}"]`);
        group.querySelectorAll('[cx]').forEach(el => el.setAttribute('cx', +el.getAttribute('cx') - node.homeX));
        group.querySelectorAll('[cy]').forEach(el => el.setAttribute('cy', +el.getAttribute('cy') - node.homeY));
        group.querySelectorAll('text[x]').forEach(el => el.setAttribute('x', +el.getAttribute('x') - node.homeX));
        group.querySelectorAll('text[y]').forEach(el => el.setAttribute('y', +el.getAttribute('y') - node.homeY));
      });
      activeSimulation = d3.forceSimulation(physics)
        .alphaDecay(.025)
        .force('link', d3.forceLink(links).distance(link => link.crossArea ? 100 : (link.shared ? 42 : 58)).strength(link => link.crossArea ? .04 : .26))
        .force('charge', d3.forceManyBody().strength(-92))
        .force('x', d3.forceX(node => clusterTargets.get(node.cluster).x).strength(.14))
        .force('y', d3.forceY(node => clusterTargets.get(node.cluster).y).strength(.16))
        .force('collide', d3.forceCollide(node => node.radius).iterations(3))
        .on('tick', () => {
          physics.forEach(node => svg.querySelector(`.rmnode[data-id="${node.id}"]`)?.setAttribute('transform', `translate(${node.x} ${node.y})`));
          links.forEach(link => { link.line.setAttribute('x1', link.source.x); link.line.setAttribute('y1', link.source.y); link.line.setAttribute('x2', link.target.x); link.line.setAttribute('y2', link.target.y); });
          syncClusterLabels(physics);
        });
      physics.forEach(node => {
        const group = svg.querySelector(`.rmnode[data-id="${node.id}"]`);
        group.onpointerdown = event => {
          event.preventDefault(); event.stopPropagation(); const point = svgPoint(event); let moved = false;
          node.fx = point.x; node.fy = point.y; activeSimulation.alphaTarget(.32).restart(); group.setPointerCapture?.(event.pointerId);
          const move = moving => { const next = svgPoint(moving); node.fx = next.x; node.fy = next.y; moved = true; };
          const finish = () => { node.fx = null; node.fy = null; activeSimulation.alphaTarget(0); if (moved) { group.dataset.dragged = '1'; setTimeout(() => delete group.dataset.dragged, 0); } group.removeEventListener('pointermove', move); group.removeEventListener('pointerup', finish); group.removeEventListener('pointercancel', finish); };
          group.addEventListener('pointermove', move); group.addEventListener('pointerup', finish); group.addEventListener('pointercancel', finish);
        };
      });
    }
    function syncClusterLabels(physics) {
      const byGroup = new Map();
      physics.forEach(node => {
        const key = `${node.research_area}|${node.subfield}`;
        let group = byGroup.get(key);
        if (!group) { group = []; byGroup.set(key, group); }
        group.push(node);
      });
      const bounds = group => ({ x0: Math.min(...group.map(node => node.x)), x1: Math.max(...group.map(node => node.x)), y0: Math.min(...group.map(node => node.y)) });
      byGroup.forEach((group, key) => {
        const labelKey = `sub:${key}`, label = svg.querySelector(`[data-layout-label="${labelKey}"]`);
        if (!label) return;
        const initial = nodes.filter(node => `${node.research_area}|${node.subfield}` === key), initialBounds = bounds(initial), liveBounds = bounds(group);
        const saved = labelLayout[labelKey] || { x: (initialBounds.x0 + initialBounds.x1) / 2, y: initialBounds.y0 - 25 };
        label.setAttribute('x', (liveBounds.x0 + liveBounds.x1) / 2 + (saved.x - (initialBounds.x0 + initialBounds.x1) / 2));
        label.setAttribute('y', liveBounds.y0 - 25 + (saved.y - (initialBounds.y0 - 25)));
      });
      Object.keys(areas).forEach(areaKey => {
        const labelKey = `area:${areaKey}`, label = svg.querySelector(`[data-layout-label="${labelKey}"]`), initial = nodes.filter(node => node.research_area === areaKey), live = physics.filter(node => node.research_area === areaKey);
        if (!label || !initial.length || !live.length) return;
        const initialBounds = bounds(initial), liveBounds = bounds(live), defaultX = (initialBounds.x0 + initialBounds.x1) / 2 - (areaKey === 'application' ? 90 : 0), defaultY = initialBounds.y0 - 32, saved = labelLayout[labelKey] || { x: defaultX, y: defaultY };
        label.setAttribute('x', (liveBounds.x0 + liveBounds.x1) / 2 - (areaKey === 'application' ? 90 : 0) + (saved.x - defaultX));
        label.setAttribute('y', liveBounds.y0 - 32 + (saved.y - defaultY));
      });
    }
    function svgPoint(event) { const point = svg.createSVGPoint(); point.x = event.clientX; point.y = event.clientY; return point.matrixTransform(svg.getScreenCTM().inverse()); }
    function makeLabelDraggable(label, key) {
      label.onpointerdown = event => {
        event.preventDefault(); event.stopPropagation(); const start = svgPoint(event), origin = { x: +label.getAttribute('x'), y: +label.getAttribute('y') };
        label.setPointerCapture?.(event.pointerId);
        const move = moving => { const point = svgPoint(moving); label.setAttribute('transform', `translate(${point.x - start.x} ${point.y - start.y})`); };
        const finish = ending => { const point = svgPoint(ending); labelLayout[key] = { x: +(origin.x + point.x - start.x).toFixed(1), y: +(origin.y + point.y - start.y).toFixed(1) }; saveLabelLayout(); label.removeEventListener('pointermove', move); label.removeEventListener('pointerup', finish); label.removeEventListener('pointercancel', finish); render(); };
        label.addEventListener('pointermove', move); label.addEventListener('pointerup', finish); label.addEventListener('pointercancel', finish);
      };
    }
    function enableBoxSelection() {
      svg.onpointerdown = event => {
        if (event.target.closest?.('.rmnode') || event.target.hasAttribute?.('data-layout-label')) return;
        event.preventDefault(); const start = svgPoint(event), box = document.createElementNS('http://www.w3.org/2000/svg', 'rect'); box.setAttribute('class', 'rm-selection'); svg.append(box);
        svg.setPointerCapture?.(event.pointerId);
        const draw = moving => { const point = svgPoint(moving), x = Math.min(start.x, point.x), y = Math.min(start.y, point.y); box.setAttribute('x', x); box.setAttribute('y', y); box.setAttribute('width', Math.abs(point.x - start.x)); box.setAttribute('height', Math.abs(point.y - start.y)); };
        const finish = ending => { const point = svgPoint(ending), x0 = Math.min(start.x, point.x), x1 = Math.max(start.x, point.x), y0 = Math.min(start.y, point.y), y1 = Math.max(start.y, point.y); selectedNodeIds = new Set(shown.filter(n => n.x >= x0 && n.x <= x1 && n.y >= y0 && n.y <= y1).map(n => n.id)); svg.removeEventListener('pointermove', draw); svg.removeEventListener('pointerup', finish); svg.removeEventListener('pointercancel', finish); render(); };
        svg.addEventListener('pointermove', draw); svg.addEventListener('pointerup', finish); svg.addEventListener('pointercancel', finish);
      };
    }
    arrangeButton.onclick = () => { arranging = !arranging; selected = null; if (!arranging) selectedNodeIds.clear(); render(); };
    topicsButton.onclick = () => { showTopics = !showTopics; localStorage.setItem('dami-research-map-topics', showTopics ? '1' : '0'); render(); };
    host.querySelector('[data-reset]').onclick = () => { layout = { ...publishedNodeLayout }; labelLayout = { ...publishedLabelLayout }; localStorage.removeItem('dami-research-map-layout-v1'); localStorage.removeItem('dami-research-map-label-layout-v1'); nodes = papers.map(position); render(); };
    host.querySelector('[data-copy]').onclick = async () => { const value = JSON.stringify({ nodes: layout, labels: labelLayout }); try { await navigator.clipboard.writeText(value); arrangeButton.textContent = 'Layout copied'; setTimeout(() => arrangeButton.textContent = 'Done arranging', 1300); } catch { prompt('Copy this layout JSON:', value); } };
    render(); d3Ready.then(d3 => { if (d3?.forceSimulation) render(); });
  }
})();
