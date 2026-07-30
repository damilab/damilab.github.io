(() => {
  const host = document.getElementById('research-map-host');
  if (!host) return;

  const colors = { trust: '#7a6eb2', core: '#2f6fbe', application: '#258a91' };
  const old = { '#c86b67': colors.trust, '#3d6fae': colors.core, '#4e9478': colors.application };
  const centers = {
    'trust|Robustness': [145,180], 'trust|Security & Attacks': [245,110], 'trust|Privacy & Safety': [210,245],
    'core|Transfer & Fairness': [350,115], 'core|Optimization': [410,185], 'core|Representation': [375,250],
    'application|Geospatial & Environment': [575,255], 'application|Finance & Society': [555,165], 'application|Science & Technology': [665,305]
  };
  const style = document.createElement('style');
  style.textContent = `
    .rmlist{display:none!important}.rmw{min-height:430px}.rm-detail{position:absolute;z-index:7;width:min(300px,calc(100% - 24px));border:1px solid #d8e2ef;border-radius:12px;background:rgba(255,255,255,.98);box-shadow:0 12px 30px rgba(23,43,71,.16);padding:12px 14px;color:#172b47}.rm-detail[hidden]{display:none}.rm-detail button{float:right;border:0;background:transparent;color:#64748b;font-size:18px;line-height:1;cursor:pointer}.rm-detail small{display:block;color:#2563b8;font-size:10px;font-weight:800;letter-spacing:.03em}.rm-detail b{display:block;margin:5px 20px 5px 0;font-size:12px;line-height:1.35}.rm-detail p{margin:0;color:#52677f;font-size:10px;line-height:1.45}.rmnode text{pointer-events:none}.rmnode circle.rm-hit.rm-hit{fill:transparent;stroke:none!important;pointer-events:all}@media(max-width:820px){.rmw{min-height:0}.rm-detail{position:sticky;left:12px!important;top:8px!important;order:0;margin:8px 12px 0}.rm-detail+svg{margin-top:0}.rmw svg{order:1}.rm-detail{font-size:12px}}
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

    function decorate() {
      const map = host.querySelector('.rm');
      if (!map) return;
      const buttons = [...map.querySelectorAll('.rmy button')];
      const desired = [...buttons].sort((a,b) => a.dataset.y === 'all' ? -1 : b.dataset.y === 'all' ? 1 : Number(b.dataset.y) - Number(a.dataset.y));
      if (buttons.some((b,i) => b !== desired[i])) desired.forEach(b => b.parentElement.append(b));
      map.querySelectorAll('svg [stroke],svg [fill]').forEach(el => {
        ['stroke','fill'].forEach(attr => { const value = (el.getAttribute(attr) || '').toLowerCase(); if (old[value]) el.setAttribute(attr, old[value]); });
      });
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
    }

    function showNode(g) {
      const circle = [...g.querySelectorAll('circle:not(.rm-hit)')].at(-1);
      if (!circle) return;
      const p = byPoint.get(`${Math.round(+circle.getAttribute('cx'))},${Math.round(+circle.getAttribute('cy'))}`);
      if (!p) return;
      const wrap = host.querySelector('.rmw'), svg = wrap.querySelector('svg');
      const point = circle.getBoundingClientRect(), box = wrap.getBoundingClientRect();
      detail.hidden = false;
      detail.innerHTML = `<button aria-label="Close">×</button><small>${p.map_label || p.subfield} · ${p.venue || p.year}</small><b>${p.title}</b><p>${p.abstract.length > 170 ? p.abstract.slice(0,170) + '…' : p.abstract}</p>`;
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
