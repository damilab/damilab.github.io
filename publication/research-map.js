(() => {
  const host = document.getElementById('research-map-host');
  if (!host) return;

  const areas = {
    trust: { name: 'Trustworthy AI', color: '#c64b61', nodeColor: '#b9364f', summary: 'Robustness · Security · Privacy' },
    core: { name: 'AI Core Algorithms', color: '#2d70c7', nodeColor: '#1f62bc', summary: 'Transfer · Optimization' },
    application: { name: 'AI Applications', color: '#19856d', nodeColor: '#08755f', summary: 'Geospatial · Finance · Sports · Science' }
  };
  const centers = {
    'trust|Robustness': [145, 180], 'trust|Security & Attacks': [245, 110], 'trust|Privacy & Safety': [210, 245],
    'core|Transfer Learning': [350, 115], 'core|Fairness': [380, 150], 'core|Optimization': [410, 185], 'core|Representation': [375, 250],
    'application|Geospatial & Environment': [575, 255], 'application|Finance & Society': [555, 165], 'application|Sports Analytics': [690, 180], 'application|Science & Technology': [680, 295]
  };
  const publishedNodeLayout = {"paper-31":{"x":231.1,"y":179.5},"paper-9":{"x":237.5,"y":134.4},"paper-4":{"x":278.8,"y":121.9},"paper-29":{"x":253.2,"y":105.1},"paper-6":{"x":213.1,"y":234.2},"paper-2":{"x":517.6,"y":158.5},"paper-34":{"x":136.9,"y":149.7},"paper-17":{"x":201.3,"y":164.1},"paper-24":{"x":95.3,"y":154.9},"paper-26":{"x":95.4,"y":200.5},"paper-18":{"x":174.2,"y":145},"paper-21":{"x":134.6,"y":187},"paper-15":{"x":160.6,"y":206.3},"paper-25":{"x":257.3,"y":250.4},"paper-0":{"x":565.9,"y":245.5},"paper-5":{"x":537.4,"y":267.2},"paper-3":{"x":685,"y":165},"paper-7":{"x":545.9,"y":155.5},"paper-8":{"x":551.2,"y":229.6},"paper-11":{"x":715,"y":185},"paper-12":{"x":531.2,"y":139.6},"paper-13":{"x":137.1,"y":231.2},"paper-14":{"x":563,"y":263.6},"paper-16":{"x":515.8,"y":233.3},"paper-19":{"x":200,"y":205},"paper-23":{"x":643.1,"y":243.9},"paper-33":{"x":698.2,"y":195.8},"paper-35":{"x":660.9,"y":283},"paper-36":{"x":650.1,"y":216.9},"paper-37":{"x":699.2,"y":262.8},"paper-1":{"x":427.4,"y":242.7},"paper-28":{"x":379.5,"y":173.8},"paper-32":{"x":404.9,"y":149.8},"paper-10":{"x":394.5,"y":129.9},"paper-20":{"x":343.6,"y":163.2},"paper-30":{"x":334.9,"y":140.8},"paper-22":{"x":393.5,"y":249.5},"paper-27":{"x":366.3,"y":126.9}};
  const publishedLabelLayout = {"sub:trust|Security & Attacks":{"x":246.6,"y":92.3},"sub:trust|Robustness":{"x":130.6,"y":138.3},"sub:core|Fairness":{"x":348.9,"y":106.6},"area:core":{"x":397.8,"y":65.7},"sub:application|Finance & Society":{"x":535.5,"y":127.5},"area:application":{"x":605.3,"y":94.6},"area:trust":{"x":193.8,"y":64.3},"sub:core|Optimization":{"x":398.2,"y":221.8},"sub:application|Geospatial & Environment":{"x":540.8,"y":204.6},"sub:trust|Privacy & Safety":{"x":235.2,"y":209.2},"sub:application|Sports Analytics":{"x":700,"y":140},"sub:application|Science & Technology":{"x":671.2,"y":170.8},"sub:core|Transfer Learning":{"x":417.6,"y":123.9}};
  const d3Ready = window.d3?.forceSimulation ? Promise.resolve(window.d3) : new Promise(resolve => {
    const script = document.createElement('script'); script.src = 'https://cdn.jsdelivr.net/npm/d3@7/dist/d3.min.js'; script.onload = () => resolve(window.d3); script.onerror = () => resolve(null); document.head.append(script);
  });
  const escape = value => String(value || '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const textOf = el => el?.textContent.trim() || '';

  const style = document.createElement('style');
  style.textContent = `
    .rm{margin:0 0 32px;border:1px solid #dbe5ef;border-radius:16px;overflow:hidden;background:#fff;color:#172b47;font-family:Pretendard,system-ui;box-shadow:0 12px 32px #19325012}
    .rmh{display:flex;justify-content:space-between;gap:16px;padding:18px 21px 14px;border-bottom:1px solid #e6edf4}.rmh b{display:block;font-size:11px;color:#2d63bc;letter-spacing:.12em}.rmh h2{margin:4px 0 0;font-size:18px}.rmh p{margin:4px 0 0;color:#62758b;font-size:12px}.rm-head-actions{display:flex;align-items:end;gap:8px}.rm-layout-actions{display:flex;gap:5px}.rm-layout-actions[hidden]{display:none}.rm-zoom{display:flex;align-items:center;gap:2px;border:1px solid #cad8e7;border-radius:7px;background:#fff;padding:2px}.rm-zoom button{border:0!important;min-width:25px;padding:5px!important}.rm-zoom output{min-width:35px;text-align:center;color:#58708a;font-size:10px;font-weight:800}
    .rmy{display:flex;align-items:center;gap:6px;flex-wrap:wrap;justify-content:end}.rmy button,.rml button,.rm-paper-list button,.rm-layout-actions button{cursor:pointer}.rmy button{border:1px solid #dce6f0;border-radius:999px;background:#fff;padding:6px 9px;color:#60748c;font-size:12px;font-weight:800}.rmy .on{border-color:#2864c7;background:#e8f0ff;color:#1d4ed8}.rm-layout-actions button{border:1px solid #cad8e7;border-radius:7px;background:#fff;padding:7px 8px;color:#3c5875;font-size:11px;font-weight:800}.rm-layout-actions button.primary{border-color:#2864c7;background:#2864c7;color:#fff}.rm-layout-actions button.topic-on{border-color:#b9cfe9;background:#edf5ff;color:#1e5aa1}.rm-layout-actions button:hover{background:#edf5ff}.rm-layout-actions button.primary:hover{background:#1e56ad}
    .rmb{display:grid;grid-template-columns:310px minmax(0,1fr);height:430px;min-height:430px}.rml{display:flex;flex-direction:column;min-height:0;padding:12px;background:#fbfdff;border-right:1px solid #e6edf4}.rm-controls > button{display:block;width:100%;margin-bottom:7px;border:1px solid #e0e9f2;border-left:4px solid var(--c);border-radius:9px;background:#fff;padding:8px 10px;text-align:left}.rm-controls > button.active{border-color:var(--c);background:color-mix(in srgb,var(--c) 8%,#fff)}.rml span{display:flex;justify-content:space-between;gap:8px;font-size:12px;font-weight:800}.rml em,.rml small{font-style:normal;color:#61748a;font-size:11px}.rml small{display:block;margin-top:3px}
    .rm-inspector{display:flex;flex:1;min-height:0;flex-direction:column;margin-top:4px;padding:8px 2px 0;border-top:1px solid #e6edf4}.rm-list-head{display:flex;justify-content:space-between;color:#46627d;font-size:11px;font-weight:800;margin:0 6px 6px}.rm-paper-list{overflow:auto;min-height:0}.rm-paper-list button{display:block;width:100%;border:0;border-bottom:1px solid #edf2f6;background:transparent;padding:7px 6px;text-align:left;color:#47627e;font-size:12px;line-height:1.3}.rm-paper-list button:hover{background:#edf5ff;color:#1f5ea8}.rm-paper-list small{display:block;margin-top:2px;color:#7a8ca0;font-size:10px}.rm-popup{position:absolute;z-index:6;width:min(300px,calc(100% - 24px));border:1px solid #d8e2ef;border-radius:12px;background:rgba(255,255,255,.98);box-shadow:0 12px 30px rgba(23,43,71,.16);padding:12px 14px;color:#172b47}.rm-popup[hidden]{display:none}.rm-popup button[aria-label="Close"]{float:right;border:0;background:transparent;color:#64748b;font-size:19px;line-height:1;cursor:pointer}.rm-popup small{display:block;color:#2563b8;font-size:11px;font-weight:800;letter-spacing:.02em}.rm-popup strong{display:block;margin:6px 20px 6px 0;font-size:13px;line-height:1.38}.rm-popup p{margin:0;color:#52677f;font-size:12px;line-height:1.48}.rm-detail-actions{display:flex;flex-wrap:wrap;gap:6px;margin-top:9px}.rm-detail-actions button,.rm-detail-actions a{border:1px solid #d7e2ef;border-radius:6px;background:#fff;padding:5px 7px;color:#2465b2;font-size:11px;font-weight:800;text-decoration:none;cursor:pointer}.rm-detail-actions button:hover,.rm-detail-actions a:hover{background:#edf5ff}.rm-subcluster{cursor:pointer}.rm-subcluster ellipse{cursor:pointer;transition:fill-opacity .2s,stroke-opacity .2s}.rm-subcluster.is-active ellipse{fill-opacity:.19!important;stroke-opacity:.78!important;stroke-width:1.6}.rm.has-subselection .rmnode:not(.is-cluster-match){opacity:.22}.rmnode.is-cluster-match .rm-dot{stroke:#172b47;stroke-width:2.8}.rmnode.is-cluster-match .rm-halo{opacity:1}
    .rmw{position:relative;background:#f5f9fc;overflow:hidden}.rmw svg{display:block;width:100%;height:100%}.rm:not(.is-arranging) .rmw svg{cursor:grab}.rm.is-panning .rmw svg{cursor:grabbing}.rmnode{cursor:pointer;outline:none}.rmnode.is-arranging{cursor:grab;touch-action:none}.rmnode.is-arranging:active{cursor:grabbing}.rmnode.is-selected .rm-dot{stroke:#172b47;stroke-width:3.2}.rmnode:focus .rm-dot{stroke:#172b47;stroke-width:2.1}.rm-hit,.rm-wash,.rm-halo,.rm-links,.rm-selection,.rm-topic{pointer-events:none}.rm-hit{pointer-events:all;fill:transparent;stroke:none}.rm-selection{fill:#5b97de;fill-opacity:.12;stroke:#2864c7;stroke-width:1.2;stroke-dasharray:4 3}.rm-dot{stroke:#fff;stroke-width:1.5}.rmmeta{font:800 11px Pretendard,system-ui;fill:#365778;paint-order:stroke;stroke:#fff;stroke-width:2.5px}.rm-topic{font:800 10px Pretendard,system-ui;fill:#3d5874;paint-order:stroke;stroke:#fff;stroke-width:2.5px}.rmsub{font:800 10px Pretendard,system-ui;fill:#365778;paint-order:stroke;stroke:#fff;stroke-width:2.5px;cursor:pointer}.rm-legend{font:700 10px Pretendard,system-ui;fill:#6a7d90}.rm.is-arranging .rmw{background:#f9fbfe}.rm.is-arranging .rmnode .rm-dot{stroke-width:2.5}.rm.is-arranging .rm-area-label,.rm.is-arranging .rmsub{cursor:grab;touch-action:none}.rm.is-arranging .rm-legend{fill:#2563b8}
    .rm-sub-hit,.rm-area-hit{fill:transparent;pointer-events:all;cursor:pointer}.rmsub,.rm-area-label{pointer-events:all;cursor:pointer}.rm-area-shell.is-active{fill-opacity:.16!important;stroke-opacity:.58!important;stroke-width:1.8}.rm-area-label.is-active{filter:drop-shadow(0 2px 2px rgba(23,43,71,.16))}.rm.has-area-selection .rmnode:not(.is-area-match){opacity:.24}
    @keyframes rmglow{0%{opacity:0;transform:scale(.35)}45%{opacity:1;transform:scale(1.18)}100%{opacity:.92;transform:scale(1)}}@keyframes rmwash{0%{opacity:0;transform:scale(.5)}55%{opacity:1}100%{opacity:.75;transform:scale(1)}}.rm-halo{transform-box:fill-box;transform-origin:center;animation:rmglow 1.5s ease-out both}.rm-wash{transform-box:fill-box;transform-origin:center;animation:rmwash 2s ease-out both}
    .publication-item.rm-highlight{outline:3px solid #8ab6ea;outline-offset:3px;transition:outline-color .4s}
    /* The map keeps its existing visual language; only the old left rail moves to a right-hand contextual panel. */
    .rmb{grid-template-columns:minmax(0,1fr) 310px}.rml{order:2;padding:0;background:#fff;border-right:0;border-left:1px solid #e6edf4}.rm-inspector{margin:0;padding:0;border-top:0}.rm-panel-head{padding:18px 18px 13px;border-bottom:1px solid #e6edf4}.rm-panel-kicker{color:#2d63bc;font-size:10px;font-weight:850;letter-spacing:.13em}.rm-panel-title{display:flex;align-items:center;justify-content:space-between;gap:10px;margin-top:4px}.rm-panel-title strong{font-size:16px;letter-spacing:-.035em}.rm-panel-close{border:0;border-radius:50%;width:25px;height:25px;background:#edf3fa;color:#506b87;font-size:17px;cursor:pointer}.rm-panel-desc{margin:7px 0 0;color:#647b93;font-size:12px;line-height:1.45}.rm-overview{padding:13px}.rm-overview-label{margin:0 5px 9px;color:#53708e;font-size:11px;font-weight:800}.rm-area-summary{display:block;width:100%;margin:0 0 9px;border:1px solid #e2eaf2;border-left:4px solid var(--area);border-radius:10px;background:#fff;padding:11px;text-align:left;color:#172b47;cursor:default}.rm-area-summary span{display:flex;justify-content:space-between;gap:8px;color:var(--area);font-size:10px;font-weight:850}.rm-area-summary b{display:block;margin-top:5px;font-size:12px;line-height:1.35}.rm-area-summary small{display:block;margin-top:4px;color:#6b8198;font-size:11px;line-height:1.38}.rm-panel-list{padding:12px 13px;overflow:auto;min-height:0}.rm-panel-list .rm-list-head{margin:0 5px 9px}.rm-panel-paper{display:block;width:100%;margin:0 0 8px;border:1px solid #e2eaf2;border-radius:10px;background:#fff;padding:11px;text-align:left;color:#172b47;cursor:pointer}.rm-panel-paper:hover{border-color:#78a6d9;background:#f8fbff}.rm-panel-paper.selected{border-color:#2864c7;background:#f3f8ff}.rm-panel-paper .meta{display:flex;justify-content:space-between;gap:8px;color:#607a96;font-size:10px;font-weight:800}.rm-panel-paper .meta b{color:#2567b9}.rm-panel-paper h3{margin:5px 0 3px;font-size:12px;line-height:1.35;letter-spacing:-.018em}.rm-panel-paper p{margin:0;color:#70869d;font-size:11px;line-height:1.35}.rm-panel-actions{display:flex;flex-wrap:wrap;gap:6px;margin-top:10px}.rm-panel-actions button,.rm-panel-actions a{border:1px solid #d7e2ef;border-radius:6px;background:#fff;padding:5px 7px;color:#2465b2;font-size:11px;font-weight:800;text-decoration:none;cursor:pointer}.rm-panel-actions button:hover,.rm-panel-actions a:hover{background:#edf5ff}
    .rm-panel-head{position:relative;padding:19px 18px 15px;border-top:3px solid var(--panel-accent,#2d63bc);background:linear-gradient(125deg,color-mix(in srgb,var(--panel-accent,#2d63bc) 8%,#fff),#fff 68%)}.rm-panel-kicker{color:var(--panel-accent,#2d63bc);font-size:10px;letter-spacing:.14em}.rm-panel-title{margin-top:6px}.rm-panel-title strong{font-size:18px;line-height:1.16;letter-spacing:-.045em}.rm-panel-head-actions{display:flex;align-items:center;gap:8px}.rm-panel-count{display:flex;align-items:baseline;gap:3px;border-radius:999px;background:color-mix(in srgb,var(--panel-accent,#2d63bc) 11%,#fff);padding:4px 8px;color:var(--panel-accent,#2d63bc);line-height:1}.rm-panel-count b{font-size:14px}.rm-panel-count small{font-size:9px;font-weight:850;letter-spacing:.04em}.rm-panel-close{flex:0 0 auto;background:color-mix(in srgb,var(--panel-accent,#2d63bc) 10%,#fff);color:var(--panel-accent,#2d63bc)}.rm-panel-desc{margin-top:8px;font-size:11px;line-height:1.45}.rm-panel-list{padding:14px 13px}.rm-panel-paper{position:relative;margin-bottom:10px;border-color:#dce7f1;border-radius:12px;padding:12px 13px;box-shadow:0 3px 10px rgba(25,55,87,.035);transition:border-color .16s,box-shadow .16s,transform .16s}.rm-panel-paper:hover{border-color:var(--panel-accent,#78a6d9);box-shadow:0 6px 16px rgba(25,55,87,.09);transform:translateY(-1px)}.rm-panel-paper .meta{align-items:flex-start;padding-right:44px;line-height:1.25}.rm-panel-paper .meta b{max-width:100%;color:#2769b9;font-size:10px;letter-spacing:-.01em}.rm-panel-paper .meta span{position:absolute;top:11px;right:11px;border-radius:999px;background:#f0f5fb;padding:4px 6px;color:#50708f;font-size:10px;line-height:1}.rm-panel-paper h3{margin:7px 0 5px;font-size:13px;line-height:1.37;letter-spacing:-.026em}.rm-panel-paper p{color:#637c96;font-size:10px;font-weight:750;line-height:1.35}.rm-panel-paper.selected{border-color:var(--panel-accent,#2864c7);background:color-mix(in srgb,var(--panel-accent,#2864c7) 5%,#fff)}
    .rm-paper-detail{color:#172b47}.rm-detail-facts{display:flex;flex-wrap:wrap;gap:5px;margin-bottom:10px}.rm-detail-facts span{border-radius:999px;background:#f0f5fa;padding:4px 7px;color:#52708e;font-size:9px;font-weight:800;line-height:1.2}.rm-detail-facts span:first-child{background:color-mix(in srgb,var(--panel-accent,#2d63bc) 10%,#fff);color:var(--panel-accent,#2d63bc)}.rm-detail-figure{display:flex;align-items:center;justify-content:center;height:128px;margin:0 0 12px;overflow:hidden;border:1px solid #e0e8f1;border-radius:11px;background:#f5f8fb}.rm-detail-figure img{display:block;width:100%;height:100%;object-fit:contain}.rm-paper-detail h3{margin:0;font-size:14px;line-height:1.4;letter-spacing:-.03em}.rm-detail-tags{display:flex;flex-wrap:wrap;gap:5px;margin-top:9px}.rm-detail-tags span{border:1px solid #dce6ef;border-radius:999px;background:#fff;padding:3px 6px;color:#58718b;font-size:9px;font-weight:750;line-height:1.2}.rm-detail-abstract{margin-top:13px;border-top:1px solid #e5edf4;padding-top:11px}.rm-detail-abstract b{color:var(--panel-accent,#2d63bc);font-size:9px;font-weight:850;letter-spacing:.13em}.rm-detail-abstract p{margin:6px 0 0;color:#536c85;font-size:11px;line-height:1.55}.rm-paper-detail .rm-panel-actions{margin-top:13px}
    .rm-overview{display:grid;align-content:start;gap:10px;padding:15px}.rm-overview-label{display:none}.rm-area-summary{margin:0;border:1px solid #dfe8f1;border-left:1px solid #dfe8f1;border-radius:11px;background:#fff;padding:13px 14px;box-shadow:none;cursor:pointer;transition:border-color .16s,background .16s,transform .16s}.rm-area-summary:hover{border-color:var(--area);background:color-mix(in srgb,var(--area) 4%,#fff);transform:translateY(-1px)}.rm-area-summary span{align-items:center;color:#172b47;font-size:11px}.rm-area-summary span b{margin:0;color:var(--area);font-size:12px}.rm-area-summary span em{border-radius:999px;background:#f0f4f8;padding:4px 7px;color:#5a738e;font-size:9px;line-height:1}.rm-area-summary>strong{display:block;margin-top:7px;color:#1f3855;font-size:12px;font-weight:750;line-height:1.35;letter-spacing:-.015em}.rm-area-summary small{display:none}
    @media (prefers-reduced-motion:reduce){.rm-halo,.rm-wash{animation:none}}
    @media(max-width:820px){.rmh{flex-direction:column;padding:14px 15px 11px;gap:10px}.rmh h2{font-size:16px}.rm-head-actions{align-items:flex-start;flex-direction:column}.rmy{width:100%;justify-content:flex-start;flex-wrap:nowrap;overflow-x:auto;padding-bottom:2px;-webkit-overflow-scrolling:touch}.rmy button{flex:none}.rmb{display:block;height:auto;min-height:0}.rml{display:block;overflow:visible;padding:10px 12px;border-right:0;border-bottom:1px solid #e6edf4}.rm-controls{display:flex;gap:8px;overflow-x:auto;-webkit-overflow-scrolling:touch}.rm-controls > button{flex:0 0 190px;margin:0}.rm-controls > button:first-child{flex-basis:205px}.rm-inspector{max-height:172px;margin-top:9px;padding:9px 5px;background:#fff}.rmw{overflow-x:auto}.rmw svg{display:block;min-width:760px;width:760px;height:400px}.rm-popup{position:fixed;left:12px!important;right:12px;top:auto!important;bottom:12px;width:auto;font-size:12px}.rm-detail{font-size:12px}}
  `;
  document.head.append(style);

  fetch('/publication/papers.json').then(r => r.json()).then(({ papers }) => mount(papers || [])).catch(() => host.remove());

  function mount(papers) {
    const years = [...new Set(papers.map(p => Number(p.year)))].sort((a, b) => b - a);
    let year = 'all', field = 'all', selected = null, selectedSubfield = null, selectedArea = null, arranging = false, layout = loadLayout(), labelLayout = loadLabelLayout(), showTopics = false;
    host.innerHTML = `<section class="rm"><div class="rmh"><div><b>RESEARCH MAP</b><h2>Three research directions, with evolving subfields</h2><p>One node = one paper · select a topic or paper to inspect related work</p></div><div class="rm-head-actions"><div class="rmy"></div><div class="rm-layout-actions"><button data-clear-cluster hidden>All clusters</button><div class="rm-zoom" aria-label="Map zoom"><button data-zoom-out aria-label="Zoom out">−</button><output data-zoom>100%</output><button data-zoom-in aria-label="Zoom in">+</button><button data-zoom-reset aria-label="Fit map">⌂</button></div><button data-topics>Topics off</button><button data-arrange class="primary">Arrange map</button><span data-arrange-extra hidden><button data-copy>Copy layout</button><button data-reset>Reset</button></span></div></div></div><div class="rmb"><div class="rmw"><svg viewBox="70 35 700 365" aria-label="Publication research map"></svg></div><aside class="rml"><div class="rm-inspector"></div></aside></div></section>`;
    const yearButtons = host.querySelector('.rmy'), inspector = host.querySelector('.rm-inspector'), svg = host.querySelector('svg'), wrap = host.querySelector('.rmw');
    const popup = document.createElement('aside'); popup.className = 'rm-popup'; popup.hidden = true; wrap.append(popup);
    const arrangeButton = host.querySelector('[data-arrange]'), arrangeExtra = host.querySelector('[data-arrange-extra]'), topicsButton = host.querySelector('[data-topics]'), clearClusterButton = host.querySelector('[data-clear-cluster]'), zoomOutButton = host.querySelector('[data-zoom-out]'), zoomInButton = host.querySelector('[data-zoom-in]'), zoomResetButton = host.querySelector('[data-zoom-reset]'), zoomOutput = host.querySelector('[data-zoom]');
    const baseView = { x: 70, y: 35, width: 700, height: 365 }; let mapZoom = 1, mapCenter = { x: 420, y: 217.5 };
    let shown = [], selectedNodeIds = new Set(), dynamicPositions = new Map(), activeSimulation = null, justPanned = false;
    // A new published coordinate set deliberately starts a fresh personal-layout version.
    // Older local edits remain stored but cannot mask the updated shared default.
    function loadLayout() { try { return { ...publishedNodeLayout, ...JSON.parse(localStorage.getItem('dami-research-map-layout-v2') || '{}') }; } catch { return { ...publishedNodeLayout }; } }
    function saveLayout() { localStorage.setItem('dami-research-map-layout-v2', JSON.stringify(layout)); }
    function loadLabelLayout() { try { return { ...publishedLabelLayout, ...JSON.parse(localStorage.getItem('dami-research-map-label-layout-v2') || '{}') }; } catch { return { ...publishedLabelLayout }; } }
    function saveLabelLayout() { localStorage.setItem('dami-research-map-label-layout-v2', JSON.stringify(labelLayout)); }
    const subfieldsFor = p => [...new Set([p.subfield, ...(Array.isArray(p.subfields) ? p.subfields : [])].filter(Boolean))];
    const isInSubfield = (p, key) => {
      const divider = key?.indexOf('|'), area = divider < 0 ? '' : key.slice(0, divider), name = divider < 0 ? key : key.slice(divider + 1);
      return p.research_area === area && subfieldsFor(p).includes(name);
    };
    const inField = p => field === 'all' || p.research_area === field;
    const filtered = p => inField(p) && (year === 'all' || Number(p.year) === Number(year));
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
    const imageFor = p => {
      const card = [...document.querySelectorAll('.publication-item')].find(el => textOf(el.querySelector('h3')) === p.title);
      const image = card?.querySelector('img[src]');
      return image ? { src: image.getAttribute('src'), alt: image.alt || p.title } : null;
    };
    const dateFor = p => p.date ? p.date.replaceAll('-', '.') : String(p.year || '');
    const scrollToCard = p => {
      const card = [...document.querySelectorAll('.publication-item')].find(el => textOf(el.querySelector('h3')) === p.title);
      if (!card) return;
      card.scrollIntoView({ behavior: 'smooth', block: 'center' }); card.classList.add('rm-highlight');
      setTimeout(() => card.classList.remove('rm-highlight'), 2000);
    };
    function panelCard(node, { selectedCard = false, related = false } = {}) {
      const topic = node.map_label || node.subfield || 'Research publication';
      return `<button class="rm-panel-paper${selectedCard ? ' selected' : ''}" data-paper-id="${escape(node.id)}"><div class="meta"><b>${escape(venueFor(node) || 'Publication')}</b><span>${node.year}</span></div><h3>${escape(node.title)}</h3><p>${escape(topic)}${related ? ' · related topic' : ''}</p></button>`;
    }
    const panelTheme = areaKey => `style="--panel-accent:${areas[areaKey]?.color || '#2d63bc'}"`;
    function selectedPaperDetail(node, venue, links) {
      const image = imageFor(node), keywords = (node.keywords || []).slice(0, 5);
      return `<article class="rm-paper-detail"><div class="rm-detail-facts"><span>${escape(venue || 'Publication')}</span><span>${escape(dateFor(node))}</span><span>${escape(node.subfield)}</span></div>${image ? `<figure class="rm-detail-figure"><img src="${escape(image.src)}" alt="${escape(image.alt)}"></figure>` : ''}<h3>${escape(node.title)}</h3>${keywords.length ? `<div class="rm-detail-tags">${keywords.map(keyword => `<span>${escape(keyword)}</span>`).join('')}</div>` : ''}<section class="rm-detail-abstract"><b>ABSTRACT</b><p>${escape(node.abstract || 'Abstract is not available yet.')}</p></section><div class="rm-panel-actions"><button data-show-card>전체 논문 카드 보기</button>${links.map(link => `<a href="${escape(link.href)}" target="_blank" rel="noopener">${escape(link.name)}</a>`).join('')}</div></article>`;
    }
    function bindPanelPapers() {
      inspector.querySelectorAll('[data-paper-id]').forEach(button => button.onclick = () => showNode(nodes.find(node => node.id === button.dataset.paperId)));
      inspector.querySelectorAll('[data-area-select]').forEach(button => button.onclick = () => selectArea(button.dataset.areaSelect));
      inspector.querySelector('[data-panel-back]')?.addEventListener('click', () => { selected = null; selectedSubfield = null; selectedArea = null; render(); });
      inspector.querySelector('[data-show-card]')?.addEventListener('click', () => selected && scrollToCard(selected));
    }
    function renderInspector() {
      const active = nodes.filter(filtered);
      if (selected) {
        const venue = venueFor(selected), links = linksFor(selected);
        inspector.innerHTML = `<div class="rm-panel-head" ${panelTheme(selected.research_area)}><div class="rm-panel-kicker">SELECTED PAPER</div><div class="rm-panel-title"><strong>${escape(selected.map_label || selected.subfield)}</strong><button class="rm-panel-close" data-panel-back aria-label="Back to overview">×</button></div><p class="rm-panel-desc">${escape(selected.research_area === 'trust' ? 'Trustworthy AI' : selected.research_area === 'core' ? 'AI Core Algorithms' : 'AI Applications')} · ${escape(selected.subfield)}</p></div><div class="rm-panel-list">${selectedPaperDetail(selected, venue, links)}</div>`;
        bindPanelPapers(); return;
      }
      if (selectedSubfield) {
        const subfieldName = selectedSubfield.split('|')[1], listed = active.filter(node => isInSubfield(node, selectedSubfield));
        inspector.innerHTML = `<div class="rm-panel-head" ${panelTheme(selectedSubfield.split('|')[0])}><div class="rm-panel-kicker">SUBFIELD RESULTS</div><div class="rm-panel-title"><strong>${escape(subfieldName)}</strong><div class="rm-panel-head-actions"><span class="rm-panel-count"><b>${listed.length}</b><small>papers</small></span><button class="rm-panel-close" data-panel-back aria-label="Back to overview">×</button></div></div><p class="rm-panel-desc">Connected publications in this research thread.</p></div><div class="rm-panel-list">${listed.map(node => panelCard(node, { related: node.subfield !== subfieldName })).join('') || '<p class="rm-panel-desc">No papers in this filter.</p>'}</div>`;
        bindPanelPapers(); return;
      }
      if (selectedArea) {
        const area = areas[selectedArea], listed = active.filter(node => node.research_area === selectedArea);
        inspector.innerHTML = `<div class="rm-panel-head" ${panelTheme(selectedArea)}><div class="rm-panel-kicker">RESEARCH DIRECTION</div><div class="rm-panel-title"><strong>${escape(area.name)}</strong><div class="rm-panel-head-actions"><span class="rm-panel-count"><b>${listed.length}</b><small>papers</small></span><button class="rm-panel-close" data-panel-back aria-label="Back to overview">×</button></div></div><p class="rm-panel-desc">${escape(area.summary)} · selected across the research map.</p></div><div class="rm-panel-list">${listed.map(node => panelCard(node)).join('') || '<p class="rm-panel-desc">No papers in this filter.</p>'}</div>`;
        bindPanelPapers(); return;
      }
      inspector.innerHTML = `<div class="rm-overview">${Object.entries(areas).map(([key, area]) => { const count = active.filter(node => node.research_area === key).length; return `<button class="rm-area-summary" data-area-select="${key}" style="--area:${area.color}"><span><b>${escape(area.name)}</b><em>${count} papers</em></span><strong>${escape(area.summary)}</strong></button>`; }).join('')}</div>`;
      bindPanelPapers();
    }
    function drawLinks(active) {
      const pairs = new Map();
      active.forEach((node, i) => active.slice(i + 1).forEach(other => {
        const nodeTerms = new Set((node.keywords || []).map(k => k.toLowerCase()));
        const shared = (other.keywords || []).filter(k => nodeTerms.has(k.toLowerCase())).length;
        const sameSubfield = subfieldsFor(node).some(name => subfieldsFor(other).includes(name)), sameArea = node.research_area === other.research_area;
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
      popup.hidden = true;
      renderInspector();
    }
    function selectSubcluster(clusterKey) {
      if (arranging || justPanned) return;
      selectedSubfield = selectedSubfield === clusterKey ? null : clusterKey;
      selectedArea = null;
      field = 'all';
      selected = null;
      render();
    }
    function selectArea(areaKey) {
      if (arranging || justPanned) return;
      selectedArea = selectedArea === areaKey ? null : areaKey;
      selectedSubfield = null;
      field = 'all';
      selected = null;
      render();
    }
    function syncSubclusterHit(label) {
      const clusterKey = label.dataset.clusterKey;
      const hit = clusterKey && svg.querySelector(`[data-sub-hit="${clusterKey}"]`);
      if (!hit) return;
      const width = Number(hit.dataset.width) || 108;
      hit.setAttribute('x', +label.getAttribute('x') - width / 2);
      hit.setAttribute('y', +label.getAttribute('y') - 18);
    }
    function liftSubclusterLabel(label) {
      const clusterKey = label.dataset.clusterKey;
      if (!clusterKey) return;
      const width = Math.max(96, Math.ceil(label.getComputedTextLength() + 26));
      const hit = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
      hit.setAttribute('class', 'rm-sub-hit');
      hit.dataset.subHit = clusterKey;
      hit.dataset.width = String(width);
      hit.setAttribute('width', width);
      hit.setAttribute('height', '27');
      hit.setAttribute('rx', '5');
      const stopMapPan = event => event.stopPropagation();
      hit.addEventListener('pointerdown', stopMapPan);
      label.addEventListener('pointerdown', event => { if (!arranging) stopMapPan(event); });
      hit.addEventListener('click', event => { event.stopPropagation(); selectSubcluster(clusterKey); });
      label.addEventListener('click', event => { event.stopPropagation(); selectSubcluster(clusterKey); });
      // SVG paints later elements above paper nodes.  The transparent hit box
      // follows the label, so the whole heading row remains easy to select.
      svg.append(hit);
      syncSubclusterHit(label);
      svg.append(label);
    }
    function liftAreaLabel(label) {
      const areaKey = label.dataset.areaKey;
      if (!areaKey) return;
      const width = Math.max(142, Math.ceil(label.getComputedTextLength() + 34));
      const hit = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
      hit.setAttribute('class', 'rm-area-hit');
      hit.dataset.areaHit = areaKey;
      hit.dataset.width = String(width);
      hit.setAttribute('x', +label.getAttribute('x') - width / 2);
      hit.setAttribute('y', +label.getAttribute('y') - 22);
      hit.setAttribute('width', width);
      hit.setAttribute('height', '33');
      hit.setAttribute('rx', '6');
      const stopMapPan = event => event.stopPropagation();
      hit.addEventListener('pointerdown', stopMapPan);
      label.addEventListener('pointerdown', event => { if (!arranging) stopMapPan(event); });
      hit.addEventListener('click', event => { event.stopPropagation(); selectArea(areaKey); });
      label.addEventListener('click', event => { event.stopPropagation(); selectArea(areaKey); });
      svg.append(hit);
      svg.append(label);
    }
    function syncAreaHit(label) {
      const areaKey = label.dataset.areaKey;
      const hit = areaKey && svg.querySelector(`[data-area-hit="${areaKey}"]`);
      if (!hit) return;
      const width = Number(hit.dataset.width) || 142;
      hit.setAttribute('x', +label.getAttribute('x') - width / 2);
      hit.setAttribute('y', +label.getAttribute('y') - 22);
    }
    function render() {
      activeSimulation?.stop(); activeSimulation = null; dynamicPositions = new Map();
      host.querySelector('.rm').classList.toggle('is-arranging', arranging); host.querySelector('.rm').classList.toggle('has-subselection', !!selectedSubfield); host.querySelector('.rm').classList.toggle('has-area-selection', !!selectedArea); arrangeButton.textContent = arranging ? 'Done arranging' : 'Arrange map'; arrangeExtra.hidden = !arranging; topicsButton.textContent = showTopics ? 'Topics on' : 'Topics off'; topicsButton.classList.toggle('topic-on', showTopics); clearClusterButton.textContent = selectedArea ? 'All topics' : 'All clusters'; clearClusterButton.hidden = !(selectedSubfield || selectedArea);
      yearButtons.innerHTML = ['all', ...years].map(value => `<button data-year="${value}" class="${String(year) === String(value) ? 'on' : ''}">${value === 'all' ? 'All' : value}</button>`).join('');
      yearButtons.querySelectorAll('button').forEach(button => button.onclick = () => { year = button.dataset.year === 'all' ? 'all' : Number(button.dataset.year); selected = null; updateYearSelection(); });
      popup.hidden = true; shown = nodes.filter(inField); svg.innerHTML = `<defs>${Object.entries(areas).map(([key, area]) => `<radialGradient id="rmg-${key}"><stop offset="0" stop-color="${area.color}" stop-opacity=".62"/><stop offset=".45" stop-color="${area.color}" stop-opacity=".25"/><stop offset="1" stop-color="${area.color}" stop-opacity="0"/></radialGradient><radialGradient id="rmw-${key}"><stop offset="0" stop-color="${area.color}" stop-opacity=".28"/><stop offset=".6" stop-color="${area.color}" stop-opacity=".08"/><stop offset="1" stop-color="${area.color}" stop-opacity="0"/></radialGradient>`).join('')}</defs>`;
      Object.entries(areas).forEach(([key, area]) => {
        const group = nodes.filter(n => n.research_area === key); if (!group.length) return;
        const xs = group.map(n => n.x), ys = group.map(n => n.y), x0 = Math.min(...xs) - 28, x1 = Math.max(...xs) + 28, y0 = Math.min(...ys) - 28, y1 = Math.max(...ys) + 28;
        const labelKey = `area:${key}`, defaultLabel = { x: (x0 + x1) / 2 - (key === 'application' ? 90 : 0), y: y0 - 4 }, savedLabel = labelLayout[labelKey] || defaultLabel;
        svg.insertAdjacentHTML('beforeend', `<ellipse class="rm-area-shell${selectedArea === key ? ' is-active' : ''}" data-area-shell="${key}" cx="${(x0 + x1) / 2}" cy="${(y0 + y1) / 2}" rx="${Math.max(75, (x1 - x0) / 2)}" ry="${Math.max(65, (y1 - y0) / 2)}" fill="${area.color}" fill-opacity=".10" stroke="${area.color}" stroke-opacity=".13"/><text class="rm-area-label${selectedArea === key ? ' is-active' : ''}" data-layout-label="${labelKey}" data-area-key="${key}" x="${savedLabel.x}" y="${savedLabel.y}" text-anchor="middle" fill="${area.color}" style="font:800 16px Pretendard,system-ui;paint-order:stroke;stroke:#fff;stroke-width:3px">${area.name}</text>`);
      });
      const groups = {}; nodes.forEach(node => ((groups[`${node.research_area}|${node.subfield}`] ||= []).push(node)));
      Object.values(groups).forEach(group => {
        const xs = group.map(n => n.x), ys = group.map(n => n.y), x0 = Math.min(...xs) - 20, x1 = Math.max(...xs) + 20, y0 = Math.min(...ys) - 18, y1 = Math.max(...ys) + 18, area = areas[group[0].research_area];
        const clusterKey = `${group[0].research_area}|${group[0].subfield}`, labelKey = `sub:${clusterKey}`, defaultLabel = { x: (x0 + x1) / 2, y: y0 - 7 }, savedLabel = labelLayout[labelKey] || defaultLabel;
        const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        g.setAttribute('class', `rm-subcluster${selectedSubfield === clusterKey ? ' is-active' : ''}`);
        g.innerHTML = `<ellipse data-cluster-shell="${clusterKey}" cx="${(x0 + x1) / 2}" cy="${(y0 + y1) / 2}" rx="${Math.max(38, (x1 - x0) / 2 * 1.45)}" ry="${Math.max(30, (y1 - y0) / 2 * 1.45)}" fill="${area.color}" fill-opacity=".085" stroke="${area.color}" stroke-opacity=".09"/><text class="rmsub" data-layout-label="${labelKey}" data-cluster-key="${clusterKey}" x="${savedLabel.x}" y="${savedLabel.y}" text-anchor="middle" fill="${area.color}">${escape(group[0].subfield)}</text>`;
        g.onclick = () => selectSubcluster(clusterKey); svg.append(g);
      });
      if (arranging) svg.querySelectorAll('[data-layout-label]').forEach(label => makeLabelDraggable(label, label.dataset.layoutLabel));
      const mapLinks = drawLinks(shown);
      shown.forEach(node => {
        const area = areas[node.research_area], activeYear = year !== 'all' && node.year === year;
        const g = document.createElementNS('http://www.w3.org/2000/svg', 'g'); g.setAttribute('class', `rmnode${arranging ? ' is-arranging' : ''}${selectedNodeIds.has(node.id) ? ' is-selected' : ''}${selectedSubfield && isInSubfield(node, selectedSubfield) ? ' is-cluster-match' : ''}${selectedArea === node.research_area ? ' is-area-match' : ''}`); g.dataset.id = node.id; g.setAttribute('role', 'button'); g.setAttribute('tabindex', '0');
        const topic = String(node.map_label || node.keywords?.[0] || node.subfield).replace(/\s+/g, ' ').trim();
        const shortTopic = topic.length > 16 ? `${topic.slice(0, 15)}…` : topic;
        g.innerHTML = `<title>${escape(node.title)}</title><circle class="rm-hit" cx="${node.x}" cy="${node.y}" r="14"/>${activeYear ? `<circle class="rm-wash" cx="${node.x}" cy="${node.y}" r="30" fill="url(#rmw-${node.research_area})"/><circle class="rm-halo" cx="${node.x}" cy="${node.y}" r="13" fill="url(#rmg-${node.research_area})"/>` : ''}<circle class="rm-dot" cx="${node.x}" cy="${node.y}" r="${activeYear ? 5.2 : 4.2}" fill="${area.nodeColor}"/>${showTopics ? `<text class="rm-topic" x="${node.x}" y="${node.y - 9}" text-anchor="middle">${escape(shortTopic)}</text>` : activeYear ? `<text class="rmmeta" x="${node.x + (node.x > 620 ? -9 : 9)}" y="${node.y - 8}" text-anchor="${node.x > 620 ? 'end' : 'start'}">${escape(node.map_label || node.subfield)}</text>` : ''}`;
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
      svg.querySelectorAll('.rmsub').forEach(liftSubclusterLabel);
      // SVG paints later elements on top: keep the three primary research axes above
      // subcluster and paper-topic labels so their hierarchy never gets obscured.
      svg.querySelectorAll('.rm-area-label').forEach(liftAreaLabel);
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
    function updateYearSelection() {
      // A year is only a visual filter.  Freeze the live layout before
      // changing its highlights so the selection never appears to re-layout
      // the research map beneath the user.
      activeSimulation?.stop();
      yearButtons.querySelectorAll('button').forEach(button => button.classList.toggle('on', String(year) === button.dataset.year));
      popup.hidden = true;
      svg.querySelectorAll('.rmnode').forEach(group => {
        const node = nodes.find(item => item.id === group.dataset.id), dot = group.querySelector('.rm-dot');
        if (!node || !dot) return;
        group.querySelectorAll('.rm-wash,.rm-halo,.rmmeta').forEach(item => item.remove());
        const isSelectedYear = year !== 'all' && node.year === year, cx = dot.getAttribute('cx'), cy = dot.getAttribute('cy');
        dot.setAttribute('r', isSelectedYear ? '5.2' : '4.2');
        if (isSelectedYear) {
          const makeCircle = (className, radius, fill) => { const item = document.createElementNS('http://www.w3.org/2000/svg', 'circle'); item.setAttribute('class', className); item.setAttribute('cx', cx); item.setAttribute('cy', cy); item.setAttribute('r', radius); item.setAttribute('fill', fill); return item; };
          group.insertBefore(makeCircle('rm-wash', '30', `url(#rmw-${node.research_area})`), dot);
          group.insertBefore(makeCircle('rm-halo', '13', `url(#rmg-${node.research_area})`), dot);
          if (!showTopics) {
            const point = dynamicPositions.get(node.id) || node, meta = document.createElementNS('http://www.w3.org/2000/svg', 'text');
            meta.setAttribute('class', 'rmmeta'); meta.setAttribute('x', +cx + (point.x > 620 ? -9 : 9)); meta.setAttribute('y', +cy - 8); meta.setAttribute('text-anchor', point.x > 620 ? 'end' : 'start'); meta.textContent = node.map_label || node.subfield; group.append(meta);
          }
        }
      });
      renderInspector();
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
        const shell = svg.querySelector(`[data-cluster-shell="${key}"]`), liveX0 = liveBounds.x0 - 20, liveX1 = liveBounds.x1 + 20, liveY0 = liveBounds.y0 - 18, liveY1 = Math.max(...group.map(node => node.y)) + 18;
        shell?.setAttribute('cx', (liveX0 + liveX1) / 2); shell?.setAttribute('cy', (liveY0 + liveY1) / 2);
        shell?.setAttribute('rx', Math.max(38, (liveX1 - liveX0) / 2 * 1.45)); shell?.setAttribute('ry', Math.max(30, (liveY1 - liveY0) / 2 * 1.45));
        const saved = labelLayout[labelKey] || { x: (initialBounds.x0 + initialBounds.x1) / 2, y: initialBounds.y0 - 25 };
        label.setAttribute('x', (liveBounds.x0 + liveBounds.x1) / 2 + (saved.x - (initialBounds.x0 + initialBounds.x1) / 2));
        label.setAttribute('y', liveBounds.y0 - 25 + (saved.y - (initialBounds.y0 - 25)));
        syncSubclusterHit(label);
      });
      Object.keys(areas).forEach(areaKey => {
        const labelKey = `area:${areaKey}`, label = svg.querySelector(`[data-layout-label="${labelKey}"]`), initial = nodes.filter(node => node.research_area === areaKey), live = physics.filter(node => node.research_area === areaKey);
        if (!label || !initial.length || !live.length) return;
        const initialBounds = bounds(initial), liveBounds = bounds(live), defaultX = (initialBounds.x0 + initialBounds.x1) / 2 - (areaKey === 'application' ? 90 : 0), defaultY = initialBounds.y0 - 32, saved = labelLayout[labelKey] || { x: defaultX, y: defaultY };
        const targetX = (liveBounds.x0 + liveBounds.x1) / 2 - (areaKey === 'application' ? 90 : 0) + (saved.x - defaultX), targetY = liveBounds.y0 - 32 + (saved.y - defaultY);
        label.setAttribute('x', Math.max(145, Math.min(690, targetX)));
        label.setAttribute('y', Math.max(58, Math.min(382, targetY)));
        syncAreaHit(label);
      });
    }
    function visibleView() {
      const width = baseView.width / mapZoom, height = baseView.height / mapZoom;
      const minX = baseView.x + width / 2, maxX = baseView.x + baseView.width - width / 2, minY = baseView.y + height / 2, maxY = baseView.y + baseView.height - height / 2;
      mapCenter.x = Math.max(minX, Math.min(maxX, mapCenter.x)); mapCenter.y = Math.max(minY, Math.min(maxY, mapCenter.y));
      return { x: mapCenter.x - width / 2, y: mapCenter.y - height / 2, width, height };
    }
    function applyMapZoom() {
      const view = visibleView(); svg.setAttribute('viewBox', `${view.x} ${view.y} ${view.width} ${view.height}`); zoomOutput.textContent = `${Math.round(mapZoom * 100)}%`;
    }
    function zoomMap(factor, event) {
      const before = visibleView(), focus = event ? svgPoint(event) : { x: mapCenter.x, y: mapCenter.y }, next = Math.max(1, Math.min(3, mapZoom * factor));
      if (next === mapZoom) return;
      const nextWidth = baseView.width / next, nextHeight = baseView.height / next;
      mapCenter = { x: focus.x - ((focus.x - before.x) / before.width - .5) * nextWidth, y: focus.y - ((focus.y - before.y) / before.height - .5) * nextHeight };
      mapZoom = next; applyMapZoom();
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
    function retainDynamicGeometry() {
      dynamicPositions.forEach((point, id) => {
        const node = nodes.find(item => item.id === id);
        if (!node || !Number.isFinite(point.x) || !Number.isFinite(point.y)) return;
        node.x = +point.x.toFixed(1); node.y = +point.y.toFixed(1);
      });
    }
    function freezeDynamicMap() {
      retainDynamicGeometry();
      svg.querySelectorAll('[data-layout-label]').forEach(label => {
        const key = label.dataset.layoutLabel, x = +label.getAttribute('x'), y = +label.getAttribute('y');
        if (key && Number.isFinite(x) && Number.isFinite(y)) labelLayout[key] = { x: +x.toFixed(1), y: +y.toFixed(1) };
      });
    }
    arrangeButton.onclick = () => { if (!arranging) { freezeDynamicMap(); selectedSubfield = null; selectedArea = null; } arranging = !arranging; selected = null; if (!arranging) selectedNodeIds.clear(); render(); };
    clearClusterButton.onclick = () => { selectedSubfield = null; selectedArea = null; render(); };
    zoomInButton.onclick = () => zoomMap(1.25);
    zoomOutButton.onclick = () => zoomMap(1 / 1.25);
    zoomResetButton.onclick = () => { mapZoom = 1; mapCenter = { x: 420, y: 217.5 }; applyMapZoom(); };
    svg.addEventListener('wheel', event => { event.preventDefault(); zoomMap(event.deltaY < 0 ? 1.14 : 1 / 1.14, event); }, { passive: false });
    svg.addEventListener('pointerdown', event => {
      if (arranging || event.button !== 0 || event.target.closest?.('.rmnode')) return;
      const start = { x: event.clientX, y: event.clientY }, startCenter = { ...mapCenter }, view = visibleView(), box = svg.getBoundingClientRect(); let moved = false;
      const move = moving => {
        const dx = moving.clientX - start.x, dy = moving.clientY - start.y;
        if (!moved && Math.hypot(dx, dy) < 3) return;
        if (!moved) svg.setPointerCapture?.(event.pointerId);
        moved = true; host.querySelector('.rm').classList.add('is-panning');
        mapCenter = { x: startCenter.x - dx * view.width / box.width, y: startCenter.y - dy * view.height / box.height }; applyMapZoom();
      };
      const finish = () => {
        host.querySelector('.rm').classList.remove('is-panning');
        if (moved) { justPanned = true; setTimeout(() => { justPanned = false; }, 0); }
        svg.removeEventListener('pointermove', move); svg.removeEventListener('pointerup', finish); svg.removeEventListener('pointercancel', finish);
      };
      svg.addEventListener('pointermove', move); svg.addEventListener('pointerup', finish); svg.addEventListener('pointercancel', finish);
    });
    topicsButton.onclick = () => { showTopics = !showTopics; render(); };
    host.querySelector('[data-reset]').onclick = () => { layout = { ...publishedNodeLayout }; labelLayout = { ...publishedLabelLayout }; localStorage.removeItem('dami-research-map-layout-v2'); localStorage.removeItem('dami-research-map-label-layout-v2'); nodes = papers.map(position); render(); };
    host.querySelector('[data-copy]').onclick = async () => { const value = JSON.stringify({ nodes: layout, labels: labelLayout }); try { await navigator.clipboard.writeText(value); arrangeButton.textContent = 'Layout copied'; setTimeout(() => arrangeButton.textContent = 'Done arranging', 1300); } catch { prompt('Copy this layout JSON:', value); } };
    render(); d3Ready.then(d3 => { if (d3?.forceSimulation) render(); });
  }
})();
