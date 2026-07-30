(() => {
  const host = document.getElementById('research-map-host');
  if (!host) return;

  const colors = { trust: '#c64b61', core: '#2d70c7', application: '#19856d' };
  const old = { '#c86b67': colors.trust, '#3d6fae': colors.core, '#4e9478': colors.application };
  const centers = {
    'trust|Robustness': [145,180], 'trust|Security & Attacks': [245,110], 'trust|Privacy & Safety': [210,245],
    'core|Transfer & Fairness': [350,115], 'core|Optimization': [410,185], 'core|Representation': [375,250],
    'application|Geospatial & Environment': [575,255], 'application|Finance & Society': [555,165], 'application|Science & Technology': [665,305]
  };
  const style = document.createElement('style');
  style.textContent = `
    .rmlist{display:none!important}.rmw{min-height:430px}.rm-detail{position:absolute;z-index:7;width:min(300px,calc(100% - 24px));border:1px solid #d8e2ef;border-radius:12px;background:rgba(255,255,255,.98);box-shadow:0 12px 30px rgba(23,43,71,.16);padding:12px 14px;color:#172b47}.rm-detail[hidden]{display:none}.rm-detail button{float:right;border:0;background:transparent;color:#64748b;font-size:18px;line-height:1;cursor:pointer}.rm-detail small{display:block;color:#2563b8;font-size:10px;font-weight:800;letter-spacing:.03em}.rm-detail b{display:block;margin:5px 20px 5px 0;font-size:12px;line-height:1.35}.rm-detail p{margin:0;color:#52677f;font-size:10px;line-height:1.45}.rm-links{pointer-events:none}.rmnode text{pointer-events:none}.rmnode circle.rm-hit.rm-hit{fill:transparent;stroke:none!important;pointer-events:all}@media(max-width:820px){.rmw{min-height:0}.rm-detail{position:sticky;left:12px!important;top:8px!important;order:0;margin:8px 12px 0}.rm-detail+svg{margin-top:0}.rmw svg{order:1}.rm-detail{font-size:12px}}
  `;
  document.head.append(style);

  fetch('/publication/papers.json').then(r => r.json()).then(({ papers }) => {
    const byPoint = new Map();
    papers.forEach((p) => {
      const same = papers.filter(q => q.research_area === p.research_area && q.subfield === p.subfield);
      const i = same.indexOf(p), c = centers[`${p.research_area}|${p.subfield}`];
      if (!c) return;
      const radius = same.length === 1 ? 0 : 16 + Math.floor(i / 6) * 16;
      const angle = i * 2.399;
      byPoint.set(`${Math.round(c[0] + Math.cos(angle) * radius)},${Math.round(c[1] + Math.sin(angle) * radius)}`, p);
    });
    const detail = document.createElement('aside');
    detail.className = 'rm-detail'; detail.hidden = true;
    host.querySelector('.rmw')?.append(detail);

    function drawLinks(map) {
      const svg = map.querySelector('svg');
      const nodes = [...map.querySelectorAll('.rmnode')].map(g => {
        const c = [...g.querySelectorAll('circle:not(.rm-hit)')].at(-1);
        const p = c && byPoint.get(`${Math.round(+c.getAttribute('cx'))},${Math.round(+c.getAttribute('cy'))}`);
        return p && { p, x: +c.getAttribute('cx'), y: +c.getAttribute('cy') };
      }).filter(Boolean);
      const signature = nodes.map(n => n.p.id).join('|');
      const previous = svg.querySelector('.rm-links');
      if (previous?.dataset.signature === signature) return;
      previous?.remove();
      const layer = document.createElementNS('http://www.w3.org/2000/svg', 'g');
      layer.setAttribute('class', 'rm-links'); layer.dataset.signature = signature;
      const pairs = new Map();
      nodes.forEach((node, i) => {
        const terms = new Set(node.p.keywords.map(k => k.toLowerCase()));
        nodes.slice(i + 1).forEach(other => {
          const shared = other.p.keywords.filter(k => terms.has(k.toLowerCase())).length;
          const sameSubfield = node.p.subfield === other.p.subfield;
          const sameArea = node.p.research_area === other.p.research_area;
          if (!shared && !sameSubfield && !sameArea) return;
          const distance = Math.hypot(node.x - other.x, node.y - other.y);
          const score = shared * 100 + (sameSubfield ? 40 : 0) + (sameArea ? 12 : 0) - distance / 12;
          pairs.set(`${i}-${nodes.indexOf(other)}`, { node, other, score, shared, sameSubfield });
        });
      });
      const selected = new Map();
      nodes.forEach(node => [...pairs.values()].filter(x => x.node === node || x.other === node)
        .sort((a, b) => b.score - a.score).slice(0, 2).forEach(x => selected.set(`${x.node.p.id}|${x.other.p.id}`, x)));
      selected.forEach(({ node, other, shared, sameSubfield }) => {
        const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        line.setAttribute('x1', node.x); line.setAttribute('y1', node.y); line.setAttribute('x2', other.x); line.setAttribute('y2', other.y);
        const sameArea = node.p.research_area === other.p.research_area;
        line.setAttribute('stroke', sameArea ? colors[node.p.research_area] : '#71829a');
        line.setAttribute('stroke-width', shared ? '2.1' : sameSubfield ? '1.8' : '1.45');
        line.setAttribute('stroke-opacity', shared ? '.82' : sameSubfield ? '.68' : '.52');
        layer.append(line);
      });
      svg.insertBefore(layer, svg.querySelector('.rmnode'));
    }

    function decorate() {
      const map = host.querySelector('.rm');
      if (!map) return;
      const buttons = [...map.querySelectorAll('.rmy button')];
      const desired = [...buttons].sort((a,b) => a.dataset.y === 'all' ? -1 : b.dataset.y === 'all' ? 1 : Number(b.dataset.y) - Number(a.dataset.y));
      if (buttons.some((b,i) => b !== desired[i])) desired.forEach(b => b.parentElement.append(b));
      map.querySelectorAll('svg [stroke],svg [fill]').forEach(el => {
        ['stroke','fill'].forEach(attr => { const value = (el.getAttribute(attr) || '').toLowerCase(); if (old[value]) el.setAttribute(attr, old[value]); });
      });
      map.querySelectorAll('svg > ellipse').forEach(el => { el.setAttribute('fill-opacity', '.10'); el.setAttribute('stroke-opacity', '.62'); el.setAttribute('stroke-width', '1.4'); });
      map.querySelectorAll('g:not(.rmnode) ellipse').forEach(el => { el.setAttribute('fill-opacity', '.085'); el.setAttribute('stroke-opacity', '.52'); el.setAttribute('stroke-width', '1.15'); });
      map.querySelectorAll('.rml button').forEach(b => {
        const name = b.textContent.trim(); const key = name.startsWith('Trustworthy') ? 'trust' : name.startsWith('AI Core') ? 'core' : name.startsWith('AI Applications') ? 'application' : null;
        if (key) b.style.setProperty('--c', colors[key]);
      });
      map.querySelectorAll('.rmnode').forEach(g => {
        if (!g.querySelector('.rm-hit')) {
          const circle = [...g.querySelectorAll('circle')].at(-1);
          if (!circle) return;
          g.insertAdjacentHTML('afterbegin', `<circle class="rm-hit" cx="${circle.getAttribute('cx')}" cy="${circle.getAttribute('cy')}" r="14"/>`);
        }
        const circles = [...g.querySelectorAll('circle:not(.rm-hit)')];
        if (circles.length > 1) circles[0].setAttribute('stroke', '#2563eb');
      });
      drawLinks(map);
    }

    function showNode(g) {
      const circle = [...g.querySelectorAll('circle:not(.rm-hit)')].at(-1);
      if (!circle) return;
      const p = byPoint.get(`${Math.round(+circle.getAttribute('cx'))},${Math.round(+circle.getAttribute('cy'))}`);
      if (!p) return;
      const card = [...document.querySelectorAll('.publication-item')].find(item => item.querySelector('h3')?.textContent.trim() === p.title);
      const venue = p.venue || [...(card?.querySelectorAll('span') || [])].map(el => el.textContent.trim()).find(Boolean) || '';
      const wrap = host.querySelector('.rmw'), svg = wrap.querySelector('svg');
      const point = circle.getBoundingClientRect(), box = wrap.getBoundingClientRect();
      detail.hidden = false;
      detail.innerHTML = `<button aria-label="Close">×</button><small>${p.map_label || p.subfield} · ${venue ? `${venue} · ` : ''}${p.year}</small><b>${p.title}</b><p>${p.abstract.length > 170 ? p.abstract.slice(0,170) + '…' : p.abstract}</p>`;
      detail.querySelector('button').onclick = () => detail.hidden = true;
      if (innerWidth > 820) {
        const left = Math.max(12, Math.min(box.width - 312, point.left - box.left - 120));
        const top = Math.max(12, point.top - box.top - detail.offsetHeight - 16);
        detail.style.left = `${left}px`; detail.style.top = `${top}px`;
      }
    }
    host.addEventListener('click', e => {
      const node = e.target.closest('.rmnode');
      if (node) { e.stopPropagation(); showNode(node); return; }
      if (!e.target.closest('.rm-detail')) detail.hidden = true;
    }, true);
    new MutationObserver(decorate).observe(host, { childList: true, subtree: true });
    decorate();
  });
})();
