(() => {
  const host = document.getElementById('research-map-host');
  if (!host) return;

  /* ======================================================================
     REGROUP  (review and edit here; publication/papers.json is not changed)
     1) RENAME moves a whole existing group:  'old area|old subfield' -> [area, subfield]
     2) REGROUP moves single papers:           paper id -> { area, subfield }   (wins over RENAME)
     Areas keep their papers.json keys: trust | core | application.
     ====================================================================== */
  const RENAME = {
    'trust|Security & Attacks': ['trust', 'AI Safety & Security'],
    'trust|Privacy & Safety': ['trust', 'Privacy & Unlearning'],
    'trust|Robustness': ['trust', 'Robustness & Fairness'],
    'core|Fairness': ['trust', 'Robustness & Fairness'],
    'core|Transfer Learning': ['core', 'Representation & Transfer'],
    'core|Representation': ['core', 'Representation & Transfer']
  };
  const REGROUP = {
    // Embodied AI & Robot Safety (new subfield)
    'safebranch-branch-pair-safety-alignment-for-embodied-agents': { area: 'trust', subfield: 'Embodied AI & Robot Safety' },                       // was trust | Privacy & Safety
    'hip-lr-hierarchical-planning-with-localized-failure-recovery-for-long-horizon-multi-robot-tasks': { area: 'trust', subfield: 'Embodied AI & Robot Safety' },   // was application | Science & Technology
    // adversarial-training paper: out of Security & Attacks
    'paper-29': { area: 'trust', subfield: 'Robustness & Fairness' },          // Understanding catastrophic overfitting in single-step adversarial training
    // representation-learning papers that sat under trust | Robustness
    'paper-18': { area: 'core', subfield: 'Representation & Transfer' },       // Graph contrastive learning with consistency regularization
    'paper-15': { area: 'core', subfield: 'Representation & Transfer' },       // Multi-stage ensemble with refinement for noisy labeled data classification
    'paper-24': { area: 'core', subfield: 'Representation & Transfer' },       // Variational cycle-consistent imputation adversarial networks (VCIAN)
    'paper-31': { area: 'core', subfield: 'Representation & Transfer' },       // Learning of indiscriminate distributions of document embeddings for domain adaptation
    'paper-34': { area: 'core', subfield: 'Representation & Transfer' }        // Information-based boundary equilibrium GAN (IB-BEGAN)
  };
  const regroup = paper => {
    const renamed = RENAME[`${paper.research_area}|${paper.subfield}`], moved = REGROUP[paper.id];
    const area = moved?.area || renamed?.[0] || paper.research_area, subfield = moved?.subfield || renamed?.[1] || paper.subfield;
    const related = (Array.isArray(paper.subfields) ? paper.subfields : []).map(name => RENAME[`${paper.research_area}|${name}`]).filter(target => target && target[0] === area).map(target => target[1]);
    return { ...paper, research_area: area, subfield, subfields: [...new Set([subfield, ...related])] };
  };
  /* Colours: hue only for the Trustworthy AI subfields; the other two directions stay neutral. */
  /* Colours: each direction has its own colour family; subfields are shades within it. */
  const areas = {
    trust: { name: 'Trustworthy AI', color: '#1d3fae', nodeColor: '#2f6fe0', summary: 'Safety & Security · Embodied AI · Privacy · Robustness & Fairness' },
    core: { name: 'Learning Methods', color: '#0f7a5c', nodeColor: '#18a07a', summary: 'Representation & Transfer · Optimization' },
    application: { name: 'AI Applications', color: '#b4531f', nodeColor: '#e0782f', summary: 'Finance · Geospatial · Sports · Science & Technology' }
  };
  const subfieldColors = {
    'trust|AI Safety & Security': '#1d3fae', 'trust|Embodied AI & Robot Safety': '#6a4fd8', 'trust|Privacy & Unlearning': '#0f86b8', 'trust|Robustness & Fairness': '#4d8ef0',
    'core|Representation & Transfer': '#11906b', 'core|Optimization': '#5cbf96',
    'application|Finance & Society': '#d9622b', 'application|Geospatial & Environment': '#b8862b', 'application|Sports Analytics': '#e8963a', 'application|Science & Technology': '#a8562f'
  };
  const colorOf = key => subfieldColors[key] || areas[String(key).split('|')[0]]?.nodeColor || '#5f646c';
  const EDIT = new URLSearchParams(location.search).get('edit') === '1';   // maintainers: ?edit=1 shows "Arrange map"
  const inline = typeof RESEARCH_MAP_FALLBACK !== 'undefined' ? RESEARCH_MAP_FALLBACK : null;   // prototype pages only
  const centers = {"trust|Robustness & Fairness":[145,190],"trust|AI Safety & Security":[258,125],"trust|Privacy & Unlearning":[230,280],"trust|Embodied AI & Robot Safety":[130,345],"core|Representation & Transfer":[385,180],"core|Optimization":[400,280],"application|Geospatial & Environment":[550,250],"application|Finance & Society":[535,148],"application|Sports Analytics":[705,183],"application|Science & Technology":[670,246]};
  const publishedNodeLayout = {"paper-31":{"x":340,"y":170},"paper-9":{"x":265.8,"y":174},"paper-4":{"x":278.8,"y":121.9},"paper-29":{"x":165,"y":232},"paper-6":{"x":199,"y":260.6},"paper-2":{"x":517.6,"y":158.5},"paper-34":{"x":342,"y":209},"paper-17":{"x":208.8,"y":173.5},"paper-24":{"x":428,"y":206},"paper-26":{"x":95.4,"y":200.5},"paper-18":{"x":366.3,"y":155},"paper-21":{"x":134.6,"y":187},"paper-15":{"x":356,"y":186},"paper-25":{"x":261.1,"y":277.8},"paper-0":{"x":579.1,"y":243.6},"paper-5":{"x":529.9,"y":271},"paper-3":{"x":685,"y":165},"paper-7":{"x":545.9,"y":155.5},"paper-8":{"x":551.2,"y":229.6},"paper-11":{"x":730.1,"y":202},"paper-12":{"x":531.2,"y":139.6},"paper-13":{"x":118.2,"y":264.2},"paper-14":{"x":569.6,"y":272.1},"paper-16":{"x":515.8,"y":233.3},"paper-19":{"x":216,"y":217.3},"paper-23":{"x":643.1,"y":243.9},"paper-33":{"x":700.1,"y":224.1},"paper-35":{"x":660.9,"y":283},"paper-36":{"x":650.1,"y":216.9},"paper-37":{"x":699.2,"y":262.8},"paper-1":{"x":430.2,"y":281},"paper-28":{"x":379.5,"y":201.8},"paper-32":{"x":404.9,"y":177.8},"paper-10":{"x":394.5,"y":157.9},"paper-20":{"x":174.2,"y":151.6},"paper-30":{"x":131.2,"y":148.8},"paper-22":{"x":367.1,"y":280},"paper-27":{"x":92,"y":144.5},"what-did-you-do-behind-my-back-covert-indirect-prompt-injection-on-tool-using-llm-agents":{"x":259.1,"y":109.1},"dividing-and-fair-sampling-fair-video-interview-assessment-with-multiple-sensitive-attributes-via-wasserstein-distance":{"x":112.5,"y":235.5},"will-the-user-ever-know-covert-indirect-prompt-injection-attacks-on-tool-using-llm-agents":{"x":232,"y":130},"confess-what-you-know-forget-set-misalignment-with-model-knowledge-in-llm-unlearning":{"x":232,"y":302},"safebranch-branch-pair-safety-alignment-for-embodied-agents":{"x":118,"y":338},"hip-lr-hierarchical-planning-with-localized-failure-recovery-for-long-horizon-multi-robot-tasks":{"x":152,"y":352},"favor-llm-based-agentic-framework-for-factor-mining-via-empirical-validation":{"x":566,"y":140},"who-provides-liquidity-in-retail-dominated-markets-evidence-from-korea":{"x":506,"y":137}};
  const publishedLabelLayout = {"area:trust":{"x":150,"y":62},"area:core":{"x":392,"y":62},"area:application":{"x":612,"y":92},"sub:trust|Robustness & Fairness":{"x":125.9,"y":118.5},"sub:trust|AI Safety & Security":{"x":262,"y":88},"sub:trust|Privacy & Unlearning":{"x":231.4,"y":240},"sub:trust|Embodied AI & Robot Safety":{"x":135,"y":316},"sub:core|Representation & Transfer":{"x":384,"y":132},"sub:core|Optimization":{"x":401,"y":259},"sub:application|Finance & Society":{"x":535.5,"y":118},"sub:application|Geospatial & Environment":{"x":540.8,"y":204.6},"sub:application|Sports Analytics":{"x":700,"y":140},"sub:application|Science & Technology":{"x":676.9,"y":186.8}};
  const d3Ready = window.d3?.forceSimulation ? Promise.resolve(window.d3) : new Promise(resolve => {
    const script = document.createElement('script'); script.src = 'https://cdn.jsdelivr.net/npm/d3@7/dist/d3.min.js'; script.onload = () => resolve(window.d3); script.onerror = () => resolve(null); document.head.append(script);
  });
  const escape = value => String(value || '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const textOf = el => el?.textContent.trim() || '';

  const style = document.createElement('style');
  style.textContent = `
.rm{--navy:#001456;--ink:#0f172a;--ink2:#475569;--ink3:#64748b;--line:#e5e7eb;--soft:#f8fafc;--canvas:#ffffff;margin:0 0 32px;background:#fff;border:1px solid var(--line);border-radius:8px;box-shadow:0 10px 15px -3px rgba(0,0,0,.1),0 4px 6px -4px rgba(0,0,0,.1);color:var(--ink);font-family:Pretendard,-apple-system,BlinkMacSystemFont,"Apple SD Gothic Neo","Noto Sans KR",system-ui,sans-serif;overflow:hidden;word-break:keep-all;text-align:left}
.rm *{box-sizing:border-box}.rm button,.rm select{font:inherit;color:inherit}.rm button{cursor:pointer}.rm [hidden]{display:none!important}
.rmh{padding:26px 24px 16px}
.rmh b{display:block;font-size:12px;font-weight:700;letter-spacing:.14em;color:var(--navy)}
.rmh h2{margin:6px 0 4px;font-size:24px;line-height:1.25;font-weight:800;letter-spacing:-.01em;color:var(--ink)}
.rmh p{margin:0;font-size:14px;line-height:1.55;color:var(--ink2)}
.rm-bar{display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:8px 16px;padding:0 24px 16px}
.rmy{display:inline-flex;border:1px solid var(--line);border-radius:8px;overflow:hidden;background:#fff}
.rmy button{border:0;border-left:1px solid var(--line);background:none;padding:6px 11px;font-size:12.5px;font-weight:600;color:var(--ink3);line-height:1.3}
.rmy button:first-child{border-left:0}
.rmy button:hover{background:var(--soft);color:var(--ink)}
.rmy button.on{background:var(--navy);color:#fff}
.rm-year-select,.rm-area-tabs{display:none}
.rm-layout-actions{display:flex;align-items:center;gap:6px;margin-left:auto}
.rm-layout-actions button{border:1px solid var(--line);border-radius:8px;background:#fff;padding:6px 11px;font-size:12.5px;font-weight:600;color:var(--ink2);line-height:1.3}
.rm-layout-actions button:hover{border-color:#c7cde0;color:var(--ink)}
.rm-layout-actions [data-topics]::before{content:"";display:inline-block;width:8px;height:8px;margin-right:7px;border-radius:50%;border:1.5px solid var(--ink3);vertical-align:0}
.rm-layout-actions [data-topics][aria-pressed=true]{border-color:var(--navy);color:var(--navy)}
.rm-layout-actions [data-topics][aria-pressed=true]::before{background:var(--navy);border-color:var(--navy)}
.rm-layout-actions button.primary{border-color:var(--navy);background:var(--navy);color:#fff}
.rm-layout-actions span{display:flex;gap:6px}
.rmb{display:grid;grid-template-columns:minmax(0,1fr) 304px;border-top:1px solid var(--line)}
.rm-map{min-width:0;display:flex;flex-direction:column;background:var(--canvas)}
.rmw{position:relative;height:500px;overflow:hidden}
.rmw svg{display:block;width:100%;height:100%;-webkit-tap-highlight-color:transparent}
.rm:not(.is-arranging) .rmw svg{cursor:grab}.rm.is-panning .rmw svg{cursor:grabbing}
.rm svg text{font-family:inherit}
.rm-zoom{position:absolute;right:12px;top:12px;display:flex;flex-direction:column;border:1px solid var(--line);border-radius:8px;background:#fff;overflow:hidden}
.rm-zoom button{display:flex;align-items:center;justify-content:center;width:30px;height:30px;border:0;border-top:1px solid var(--line);background:none;color:var(--ink2)}
.rm-zoom button:first-child{border-top:0}
.rm-zoom button:hover{background:var(--soft);color:var(--ink)}
.rm-zoom svg{width:14px;height:14px;display:block;cursor:inherit!important}
.rm-hit,.rm-links,.rm-selection,.rm-topic,.rmmeta,.rm-under,.rm-year-ring{pointer-events:none}
.rm-hit{pointer-events:all;fill:transparent;stroke:none}
.rmnode{cursor:pointer;outline:none;transition:opacity .2s}
.rmnode.is-arranging{cursor:grab;touch-action:none}
.rm-under{fill:var(--canvas)}
.rm-dot{fill:var(--c);stroke:var(--c);stroke-width:1.3}
.rm-year-ring{fill:none;stroke:var(--c);stroke-opacity:.6;stroke-width:1}
.rmnode.is-picked .rm-year-ring,.rmnode:focus-visible .rm-year-ring{display:block}
.rm-pick-ring{fill:none;stroke:var(--ink);stroke-width:1.4;pointer-events:none;opacity:0}
.rmnode.is-picked .rm-pick-ring,.rmnode:focus-visible .rm-pick-ring,.rmnode.is-selected .rm-pick-ring{opacity:1}
.rmnode.is-year-off{opacity:.2}
.rm-link{fill:none;stroke:var(--c);stroke-width:.85;stroke-opacity:.5;stroke-linecap:round;transition:stroke-opacity .2s}
.rm-link.is-cross{stroke:#8a94a6;stroke-width:.8;stroke-opacity:.6;stroke-dasharray:.6 2.6}
.rm-area-shell{fill:none;stroke:#cbd5e1;stroke-width:.7}
.rm-area-shell.is-active{stroke:var(--navy);stroke-width:1}
.rm-subcluster ellipse{fill:var(--c);fill-opacity:.03;stroke:var(--c);stroke-opacity:.42;stroke-width:.6;transition:fill-opacity .2s}
.rm-subcluster.is-active ellipse{fill-opacity:.1;stroke-opacity:.9;stroke-width:.9}
.rm-area-label{font-size:15px;font-weight:800;letter-spacing:-.01em;fill:var(--ac,var(--navy));paint-order:stroke;stroke:var(--canvas);stroke-width:4px;stroke-linejoin:round;pointer-events:all;cursor:pointer}
.rm-area-label.is-active{text-decoration:underline}
.rmsub{font-size:10.5px;font-weight:700;fill:var(--ink);paint-order:stroke;stroke:var(--canvas);stroke-width:3.2px;stroke-linejoin:round;pointer-events:all;cursor:pointer}
.rm-subcluster.is-active~.rmsub{fill:var(--navy)}
.rmmeta,.rm-topic{font-size:9px;font-weight:600;fill:var(--ink2);paint-order:stroke;stroke:var(--canvas);stroke-width:2.6px;stroke-linejoin:round}
.rm-sub-hit,.rm-area-hit{fill:transparent;pointer-events:all;cursor:pointer}
.rm-legend{font-size:10px;font-weight:600;fill:var(--navy)}
.rm-selection{fill:#001456;fill-opacity:.06;stroke:var(--navy);stroke-width:1;stroke-dasharray:4 3}
.rm.has-area-selection .rmnode:not(.is-area-match),.rm.has-subselection .rmnode:not(.is-cluster-match){opacity:.2}
.rm.has-hover .rmnode:not(.is-hot){opacity:.22}
.rm.has-hover .rm-link:not(.is-hot){stroke-opacity:.1}
.rm.has-hover .rm-link.is-hot{stroke-opacity:1;stroke-width:1.2}
.rm.is-arranging .rm-area-label,.rm.is-arranging .rmsub{cursor:grab;touch-action:none}
.rm.is-arranging .rmnode .rm-dot{stroke-width:2}
@keyframes rmIn{from{opacity:0}to{opacity:1}}
.rm.is-intro .rm-links{animation:rmIn .9s .15s both}.rm.is-intro .rmnode{animation:rmIn .5s both}
.rml{border-left:1px solid var(--line);min-width:0;display:flex;flex-direction:column;background:#fff}
.rm-inspector{display:flex;flex-direction:column;min-height:0;flex:1}
.rmb>.rml{height:0;min-height:100%}
.rm-pb{padding:16px 18px 18px;overflow:auto;min-height:0}
.rm-pb.over{display:grid;gap:8px;align-content:start}
.rm-area-summary{display:block;width:100%;text-align:left;border:1px solid var(--line);border-radius:8px;background:#fff;padding:11px 12px}
.rm-area-summary:hover{border-color:#c7cde0;background:var(--soft)}
.rm-area-summary span{display:flex;justify-content:space-between;align-items:baseline;gap:8px}
.rm-area-summary b{font-size:13.5px;font-weight:700}
.rm-area-summary em,.rm-panel-paper em{font-style:normal;font-size:12px;font-weight:600;color:var(--ink2);white-space:nowrap}
.rm-area-summary small{display:block;margin-top:4px;font-size:12px;line-height:1.45;color:var(--ink3)}
.rm-pb .hint{margin:8px 2px 0;font-size:12.5px;line-height:1.5;color:var(--ink3)}
.rm-ph{padding:14px 18px;border-bottom:1px solid var(--line);border-top:3px solid var(--c)}
.rm-ph .kick{display:block;margin-top:12px;font-size:10.5px;font-weight:700;letter-spacing:.12em;text-transform:uppercase;color:var(--navy)}
.rm-ph small{display:block;margin-top:2px;font-size:12px;font-weight:600;color:var(--ink2)}
.rm-ph h3{margin:4px 0 0;font-size:16px;line-height:1.35;font-weight:700;color:var(--ink)}
.rm-ph .facts{margin:6px 0 0;font-size:12.5px;color:var(--ink3)}
.rm-back{border:1px solid var(--line);background:#fff;border-radius:999px;padding:4px 10px 4px 8px;font-size:12px;font-weight:600;color:var(--ink2)}
.rm-back::before{content:"\\2190";margin-right:5px}
.rm-back:hover{border-color:#c7cde0;color:var(--ink)}
.rm-pb figure{margin:0 0 12px;height:128px;border:1px solid var(--line);border-radius:8px;display:flex;align-items:center;justify-content:center;overflow:hidden;background:#fff}
.rm-pb figure img{max-width:100%;max-height:100%;object-fit:contain}
.rm-pb .tags{margin:0 0 10px;font-size:12px;line-height:1.5;color:var(--ink2);font-weight:600}
.rm-pb .abs{margin:0;font-size:12.5px;line-height:1.6;color:var(--ink2)}
.rm-panel-actions{display:flex;flex-wrap:wrap;gap:8px;margin-top:14px}
.rm-panel-actions button,.rm-panel-actions a{font-size:12.5px;font-weight:600;text-decoration:none;border-radius:8px;padding:7px 12px;border:1px solid #c7cde0;background:#fff;color:var(--navy)}
.rm-panel-actions button{background:var(--navy);border-color:var(--navy);color:#fff}
.rm-panel-actions a:hover{background:var(--soft)}
.rm-pb.list{padding:4px 0}
.rm-panel-paper{display:block;width:100%;text-align:left;border:0;border-bottom:1px solid #f1f3f6;background:none;padding:10px 18px}
.rm-panel-paper:hover{background:var(--soft)}
.rm-panel-paper span{display:flex;justify-content:space-between;gap:8px;font-size:12px;color:var(--ink3)}
.rm-panel-paper b{font-weight:600;color:var(--ink2)}
.rm-panel-paper strong{display:block;margin-top:3px;font-size:13px;line-height:1.4;font-weight:600;color:var(--ink)}
.rm-panel-paper p{margin:3px 0 0;font-size:12px;color:var(--ink3)}
.rm-popup{display:none}
.rm-tip{position:fixed;z-index:50;pointer-events:none;max-width:300px;background:#0f172a;color:#fff;border-radius:8px;padding:8px 10px;font:12.5px/1.4 Pretendard,system-ui,sans-serif;opacity:0;transition:opacity .12s;left:0;top:0}
.rm-tip.on{opacity:1}.rm-tip b{display:block;font-weight:600}.rm-tip span{display:block;margin-top:2px;color:#cbd5e1;font-size:11.5px}
.publication-item.rm-highlight{outline:3px solid #8ab6ea;outline-offset:3px;transition:outline-color .4s}
@media (prefers-reduced-motion:reduce){.rm *{animation:none!important;transition:none!important}}
@media(max-width:1100px){.rmy{display:none}.rm-year-select{display:block;border:1px solid var(--line);border-radius:8px;background:#fff;padding:7px 10px;font-size:13px;font-weight:600;color:var(--ink)}}
@media(max-width:820px){
  .rmh{padding:20px 16px 12px}.rmh h2{font-size:20px}
  .rm-bar{padding:0 16px 12px;gap:8px}
  .rm-area-tabs{display:flex;order:3;width:100%;border:1px solid var(--line);border-radius:8px;overflow:hidden}
  .rm-area-tabs button{flex:1 1 0;min-width:0;border:0;border-left:1px solid var(--line);background:#fff;padding:8px 4px;font-size:12px;font-weight:600;color:var(--ink3);line-height:1.25}
  .rm-area-tabs button:first-child{border-left:0}
  .rm-area-tabs button.on{background:var(--navy);color:#fff}
  .rmb{display:block}
  .rmw{height:380px}.rmw svg{touch-action:pan-y}
  .rm-zoom{top:auto;bottom:12px;flex-direction:row}.rm-zoom button{border-top:0;border-left:1px solid var(--line)}.rm-zoom button:first-child{border-left:0}
  .rml{border-left:0;border-top:1px solid var(--line);scroll-margin-top:12px}
  .rmb>.rml{height:auto;min-height:0}
  .rm-pb{overflow:visible}
}
  `;
  document.head.append(style);

  const HIDE = new Set(['what-did-you-do-behind-my-back-covert-indirect-prompt-injection-on-tool-using-llm-agents']);   // workshop version of the EMNLP 2026 paper: one node
  const visible = list => (list || []).filter(p => !HIDE.has(p.id));
  fetch('/publication/papers.json').then(r => { if (!r.ok) throw 0; return r.json(); }).then(({ papers }) => mount(visible(papers))).catch(() => inline ? mount(visible(inline.papers)) : host.remove());

  function mount(sourcePapers) {
    const papers = sourcePapers.map(regroup);
    const years = [...new Set(papers.map(p => Number(p.year)))].sort((a, b) => b - a);
    let year = 'all', field = 'all', selected = null, selectedSubfield = null, selectedArea = null, arranging = false, layout = loadLayout(), labelLayout = loadLabelLayout(), showTopics = false;
    const maxYear = Math.max(...papers.map(p => Number(p.year)));
    host.innerHTML = `<section class="rm is-intro"><div class="rmh"><div><h2>Research Map</h2></div></div>
      <div class="rm-bar"><div class="rmy" role="group" aria-label="Year filter"></div><select class="rm-year-select" aria-label="Year filter"></select><div class="rm-area-tabs" role="group" aria-label="Move the map to a research direction"></div><div class="rm-layout-actions"><button data-clear-cluster hidden>All clusters</button><button data-topics aria-pressed="false">Paper labels</button><button data-arrange class="primary"${EDIT ? '' : ' hidden'}>Arrange map</button><span data-arrange-extra hidden><button data-copy>Copy layout</button><button data-reset>Reset</button></span></div></div>
      <div class="rmb"><div class="rm-map"><div class="rmw"><svg viewBox="10 10 820 436" aria-label="Publication research map"></svg><div class="rm-zoom" aria-label="Map zoom"><button data-zoom-in aria-label="Zoom in" title="Zoom in"><svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M8 3v10M3 8h10"/></svg></button><button data-zoom-out aria-label="Zoom out" title="Zoom out"><svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 8h10"/></svg></button><button data-zoom-reset aria-label="Fit map" title="Fit map"><svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M2.5 6V2.5H6M10 2.5h3.5V6M13.5 10v3.5H10M6 13.5H2.5V10"/></svg></button><output data-zoom hidden>100%</output></div></div></div>
      <aside class="rml"><div class="rm-inspector"></div></aside></div></section>`;
    const rootEl = host.querySelector('.rm'), yearSelect = host.querySelector('.rm-year-select'), areaTabs = host.querySelector('.rm-area-tabs');
    const tip = document.createElement('div'); tip.className = 'rm-tip'; document.body.append(tip);
    const isNarrow = () => rootEl.clientWidth < 760;
    const radiusFor = p => Number(p.year) === maxYear ? 5 : 4;   // the newest year is drawn slightly larger
    const keyOf = p => `${p.research_area}|${p.subfield}`;
    const yearButtons = host.querySelector('.rmy'), inspector = host.querySelector('.rm-inspector'), svg = host.querySelector('svg'), wrap = host.querySelector('.rmw');
    const popup = document.createElement('aside'); popup.className = 'rm-popup'; popup.hidden = true; wrap.append(popup);
    const arrangeButton = host.querySelector('[data-arrange]'), arrangeExtra = host.querySelector('[data-arrange-extra]'), topicsButton = host.querySelector('[data-topics]'), clearClusterButton = host.querySelector('[data-clear-cluster]'), zoomOutButton = host.querySelector('[data-zoom-out]'), zoomInButton = host.querySelector('[data-zoom-in]'), zoomResetButton = host.querySelector('[data-zoom-reset]'), zoomOutput = host.querySelector('[data-zoom]');
    const baseView = { x: 10, y: 10, width: 820, height: 436 }; let mapZoom = 1, mapCenter = { x: 420, y: 228 };
    let shown = [], selectedNodeIds = new Set(), dynamicPositions = new Map(), activeSimulation = null, justPanned = false;
    // A new published coordinate set deliberately starts a fresh personal-layout version.
    // Older local edits remain stored but cannot mask the updated shared default.
    function loadLayout() { try { return { ...publishedNodeLayout, ...JSON.parse(localStorage.getItem('dami-research-map-layout-v4') || '{}') }; } catch { return { ...publishedNodeLayout }; } }
    function saveLayout() { localStorage.setItem('dami-research-map-layout-v4', JSON.stringify(layout)); }
    function loadLabelLayout() { try { return { ...publishedLabelLayout, ...JSON.parse(localStorage.getItem('dami-research-map-label-layout-v4') || '{}') }; } catch { return { ...publishedLabelLayout }; } }
    function saveLabelLayout() { localStorage.setItem('dami-research-map-label-layout-v4', JSON.stringify(labelLayout)); }
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
      return [...(card?.querySelectorAll('span') || [])].map(textOf).find(Boolean) || inline?.venues?.[p.id] || '';
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
      return `<button class="rm-panel-paper${selectedCard ? ' selected' : ''}" data-paper-id="${escape(node.id)}"><span><b>${escape(venueFor(node) || 'Publication')}</b><em>${node.year}</em></span><strong>${escape(node.title)}</strong><p>${escape(topic)}${related ? ' · related topic' : ''}</p></button>`;
    }
    const panelTheme = key => `style="--c:${key.includes('|') ? colorOf(key) : areas[key]?.color || '#001456'}"`;
    const backButton = '<button class="rm-back" data-panel-back aria-label="Back to overview">Overview</button>';
    function selectedPaperDetail(node, venue, links) {
      const image = imageFor(node), keywords = (node.keywords || []).slice(0, 5);
      return `<div class="rm-pb">${image ? `<figure><img src="${escape(image.src)}" alt="${escape(image.alt)}"></figure>` : ''}${keywords.length ? `<p class="tags">${keywords.map(escape).join(' · ')}</p>` : ''}<p class="abs">${escape(node.abstract || 'Abstract is not available yet.')}</p><div class="rm-panel-actions"><button data-show-card>전체 논문 카드 보기</button>${links.map(link => `<a href="${escape(link.href)}" target="_blank" rel="noopener">${escape(link.name)}</a>`).join('')}</div></div>`;
    }
    function bindPanelPapers() {
      inspector.querySelectorAll('[data-paper-id]').forEach(button => button.onclick = () => showNode(nodes.find(node => node.id === button.dataset.paperId)));
      inspector.querySelectorAll('[data-area-select]').forEach(button => button.onclick = () => selectArea(button.dataset.areaSelect));
      inspector.querySelector('[data-panel-back]')?.addEventListener('click', () => { selected = null; selectedSubfield = null; selectedArea = null; render(); });
      inspector.querySelector('[data-show-card]')?.addEventListener('click', () => selected && scrollToCard(selected));
    }
    function renderInspector() {
      const active = nodes.filter(filtered);
      svg.querySelectorAll('.rmnode').forEach(group => group.classList.toggle('is-picked', !!selected && group.dataset.id === selected.id));
      if (selected) {
        const venue = venueFor(selected), links = linksFor(selected);
        inspector.innerHTML = `<div class="rm-ph" ${panelTheme(keyOf(selected))}>${backButton}<span class="kick">Selected paper</span><small>${escape(areas[selected.research_area]?.name || '')} · ${escape(selected.subfield)}</small><h3>${escape(selected.title)}</h3><p class="facts">${escape(venue || 'Publication')} · ${escape(/-01-01$/.test(selected.date || '') ? selected.year : dateFor(selected))}</p></div>${selectedPaperDetail(selected, venue, links)}`;
        bindPanelPapers(); return;
      }
      if (selectedSubfield) {
        const subfieldName = selectedSubfield.split('|')[1], listed = active.filter(node => isInSubfield(node, selectedSubfield));
        inspector.innerHTML = `<div class="rm-ph" ${panelTheme(selectedSubfield)}>${backButton}<span class="kick">Subfield</span><h3>${escape(subfieldName)}</h3><p class="facts">${listed.length} ${listed.length === 1 ? 'paper' : 'papers'}${year === 'all' ? '' : ' · ' + year}</p></div><div class="rm-pb list">${listed.map(node => panelCard(node, { related: node.subfield !== subfieldName })).join('') || '<p class="abs" style="padding:12px 18px">No papers in this filter.</p>'}</div>`;
        bindPanelPapers(); return;
      }
      if (selectedArea) {
        const area = areas[selectedArea], listed = active.filter(node => node.research_area === selectedArea);
        inspector.innerHTML = `<div class="rm-ph" ${panelTheme(selectedArea)}>${backButton}<span class="kick">Research direction</span><h3>${escape(area.name)}</h3><p class="facts">${listed.length} ${listed.length === 1 ? 'paper' : 'papers'}${year === 'all' ? '' : ' · ' + year} · ${escape(area.summary)}</p></div><div class="rm-pb list">${listed.map(node => panelCard(node)).join('') || '<p class="abs" style="padding:12px 18px">No papers in this filter.</p>'}</div>`;
        bindPanelPapers(); return;
      }
      inspector.innerHTML = `<div class="rm-pb over">${Object.entries(areas).map(([key, area]) => { const count = active.filter(node => node.research_area === key).length; return `<button class="rm-area-summary" data-area-select="${key}"><span><b>${escape(area.name)}</b><em>${count} ${count === 1 ? 'paper' : 'papers'}</em></span><small>${escape(area.summary)}</small></button>`; }).join('')}<p class="hint">${year === 'all' ? `${nodes.length} papers, ${Math.min(...years)}–${maxYear}.` : `${active.length} ${active.length === 1 ? 'paper' : 'papers'} in ${year}.`} Select a node to read the abstract.</p></div>`;
      bindPanelPapers();
    }
    /* A link is a gently curved path. The bend side is fixed per pair, so it does not flip while the layout settles. */
    const linkPath = (a, b, bend) => { const mx = (a.x + b.x) / 2, my = (a.y + b.y) / 2; return `M${a.x.toFixed(1)},${a.y.toFixed(1)}Q${(mx - (b.y - a.y) * bend).toFixed(1)},${(my + (b.x - a.x) * bend).toFixed(1)} ${b.x.toFixed(1)},${b.y.toFixed(1)}`; };
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
        const line = document.createElementNS('http://www.w3.org/2000/svg', 'path'), sameCluster = keyOf(node) === keyOf(other), bend = ((node.id + other.id).length % 2 ? 1 : -1) * .09;
        line.setAttribute('class', `rm-link${sameCluster ? '' : ' is-cross'}`); line.setAttribute('d', linkPath(node, other, bend)); line.dataset.s = node.id; line.dataset.t = other.id;
        if (sameCluster) line.style.setProperty('--c', colorOf(keyOf(node)));
        layer.append(line); rendered.push({ source: node.id, target: other.id, line, bend, shared, crossArea: node.research_area !== other.research_area });
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
      if (isNarrow()) host.querySelector('.rml').scrollIntoView({ behavior: 'smooth', block: 'nearest' });
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
      host.querySelector('.rm').classList.toggle('is-arranging', arranging); host.querySelector('.rm').classList.toggle('has-subselection', !!selectedSubfield); host.querySelector('.rm').classList.toggle('has-area-selection', !!selectedArea); arrangeButton.textContent = arranging ? 'Done arranging' : 'Arrange map'; arrangeExtra.hidden = !arranging; topicsButton.setAttribute('aria-pressed', String(showTopics)); clearClusterButton.textContent = selectedArea ? 'All topics' : 'All clusters'; clearClusterButton.hidden = !(selectedSubfield || selectedArea);
      yearButtons.innerHTML = ['all', ...years].map(value => `<button data-year="${value}" class="${String(year) === String(value) ? 'on' : ''}">${value === 'all' ? 'All' : value}</button>`).join('');
      yearButtons.querySelectorAll('button').forEach(button => button.onclick = () => { year = button.dataset.year === 'all' ? 'all' : Number(button.dataset.year); selected = null; updateYearSelection(); });
      yearSelect.innerHTML = ['all', ...years].map(value => `<option value="${value}">${value === 'all' ? 'All years' : value}</option>`).join(''); yearSelect.value = String(year);
      popup.hidden = true; shown = nodes.filter(inField); svg.innerHTML = '';
      Object.entries(areas).forEach(([key, area]) => {
        const group = nodes.filter(n => n.research_area === key); if (!group.length) return;
        const xs = group.map(n => n.x), ys = group.map(n => n.y), x0 = Math.min(...xs) - 28, x1 = Math.max(...xs) + 28, y0 = Math.min(...ys) - 28, y1 = Math.max(...ys) + 28;
        const labelKey = `area:${key}`, defaultLabel = { x: (x0 + x1) / 2 - (key === 'application' ? 90 : 0), y: y0 - 4 }, savedLabel = labelLayout[labelKey] || defaultLabel;
        svg.insertAdjacentHTML('beforeend', `<ellipse class="rm-area-shell${selectedArea === key ? ' is-active' : ''}" data-area-shell="${key}" cx="${(x0 + x1) / 2}" cy="${(y0 + y1) / 2}" rx="${Math.max(75, (x1 - x0) / 2)}" ry="${Math.max(65, (y1 - y0) / 2)}" /><text class="rm-area-label${selectedArea === key ? ' is-active' : ''}" data-layout-label="${labelKey}" data-area-key="${key}" style="--ac:${area.color}" x="${savedLabel.x}" y="${savedLabel.y}" text-anchor="middle">${area.name}</text>`);
      });
      const groups = {}; nodes.forEach(node => ((groups[`${node.research_area}|${node.subfield}`] ||= []).push(node)));
      Object.values(groups).forEach(group => {
        const xs = group.map(n => n.x), ys = group.map(n => n.y), x0 = Math.min(...xs) - 20, x1 = Math.max(...xs) + 20, y0 = Math.min(...ys) - 18, y1 = Math.max(...ys) + 18, area = areas[group[0].research_area];
        const clusterKey = `${group[0].research_area}|${group[0].subfield}`, labelKey = `sub:${clusterKey}`, defaultLabel = { x: (x0 + x1) / 2, y: y0 - 7 }, savedLabel = labelLayout[labelKey] || defaultLabel;
        const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        g.style.setProperty('--c', colorOf(clusterKey)); g.setAttribute('class', `rm-subcluster${selectedSubfield === clusterKey ? ' is-active' : ''}`);
        g.innerHTML = `<ellipse data-cluster-shell="${clusterKey}" cx="${(x0 + x1) / 2}" cy="${(y0 + y1) / 2}" rx="${Math.max(38, (x1 - x0) / 2 * 1.45)}" ry="${Math.max(30, (y1 - y0) / 2 * 1.45)}"/><text class="rmsub" data-layout-label="${labelKey}" data-cluster-key="${clusterKey}" x="${savedLabel.x}" y="${savedLabel.y}" text-anchor="middle">${escape(group[0].subfield)}</text>`;
        g.onclick = () => selectSubcluster(clusterKey); svg.append(g);
      });
      if (arranging) svg.querySelectorAll('[data-layout-label]').forEach(label => makeLabelDraggable(label, label.dataset.layoutLabel));
      const mapLinks = drawLinks(shown);
      shown.forEach(node => {
        const area = areas[node.research_area], activeYear = year !== 'all' && node.year === year;
        const g = document.createElementNS('http://www.w3.org/2000/svg', 'g'); g.style.setProperty('--c', colorOf(keyOf(node))); g.setAttribute('aria-label', `${node.title}, ${node.year}`); g.setAttribute('class', `rmnode${year !== 'all' && !activeYear ? ' is-year-off' : ''}${selected && selected.id === node.id ? ' is-picked' : ''}${arranging ? ' is-arranging' : ''}${selectedNodeIds.has(node.id) ? ' is-selected' : ''}${selectedSubfield && isInSubfield(node, selectedSubfield) ? ' is-cluster-match' : ''}${selectedArea === node.research_area ? ' is-area-match' : ''}`); g.dataset.id = node.id; g.setAttribute('role', 'button'); g.setAttribute('tabindex', '0');
        const topic = String(node.map_label || node.keywords?.[0] || node.subfield).replace(/\s+/g, ' ').trim();
        const shortTopic = topic.length > 16 ? `${topic.slice(0, 15)}…` : topic;
        const r = radiusFor(node) + (activeYear ? .8 : 0);
        g.innerHTML = `<circle class="rm-hit" cx="${node.x}" cy="${node.y}" r="14"/>${activeYear ? `<circle class="rm-year-ring" cx="${node.x}" cy="${node.y}" r="${r + 3.4}"/>` : ''}<circle class="rm-pick-ring" cx="${node.x}" cy="${node.y}" r="${r + 3.6}"/><circle class="rm-under" cx="${node.x}" cy="${node.y}" r="${r + 1.9}"/><circle class="rm-dot" cx="${node.x}" cy="${node.y}" r="${r}"/>${showTopics ? `<text class="rm-topic" x="${node.x}" y="${node.y - 10}" text-anchor="middle">${escape(shortTopic)}</text>` : activeYear ? `<text class="rmmeta" x="${node.x + (node.x > 620 ? -10 : 10)}" y="${node.y - 8}" text-anchor="${node.x > 620 ? 'end' : 'start'}">${escape(node.map_label || node.subfield)}</text>` : ''}`;
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
      if (arranging) svg.insertAdjacentHTML('beforeend', `<text class="rm-legend" x="84" y="386">Drag empty space to select · drag a selected node to move the group</text>`);
      renderInspector();
    }
    /* Paper labels (year filter, "Paper labels" toggle): each label takes the first free spot around its node.
       A label that would touch another label or a node is not drawn; the tooltip still names the paper. */
    function settleNodeLabels() {
      const labels = [...svg.querySelectorAll('.rm-topic,.rmmeta')]; if (!labels.length) return;
      const pad = (box, d) => ({ x0: box.left - d, x1: box.right + d, y0: box.top - d, y1: box.bottom + d });
      const taken = [...svg.querySelectorAll('.rmsub,.rm-area-label')].map(item => pad(item.getBoundingClientRect(), 1)).concat([...svg.querySelectorAll('.rm-dot')].map(item => pad(item.getBoundingClientRect(), 2)));
      const ctm = svg.getScreenCTM(), scale = ctm?.a || 1;
      const frame = ctm ? { x0: ctm.a * (baseView.x + 3) + ctm.e, x1: ctm.a * (baseView.x + baseView.width - 3) + ctm.e, y0: ctm.d * (baseView.y + 3) + ctm.f, y1: ctm.d * (baseView.y + baseView.height - 3) + ctm.f } : null;
      labels.forEach(label => {
        const dot = label.closest('.rmnode')?.querySelector('.rm-dot'); if (!dot) return;
        const cx = +dot.getAttribute('cx'), cy = +dot.getAttribute('cy'), r = +dot.getAttribute('r') + 3, self = pad(dot.getBoundingClientRect(), 2);
        const spots = [[r + 3, 3, 'start'], [-r - 3, 3, 'end'], [0, -r - 4, 'middle'], [0, r + 10, 'middle'], [r + 1, -r, 'start'], [-r - 1, -r, 'end'], [r + 1, r + 7, 'start'], [-r - 1, r + 7, 'end']];
        label.removeAttribute('transform'); label.style.display = '';
        const free = spots.some(([dx, dy, anchor]) => {
          label.setAttribute('x', cx + dx); label.setAttribute('y', cy + dy); label.setAttribute('text-anchor', anchor);
          const box = pad(label.getBoundingClientRect(), 1.5 * Math.min(1, scale));
          if (frame && (box.x0 < frame.x0 || box.x1 > frame.x1 || box.y0 < frame.y0 || box.y1 > frame.y1)) return false;
          if (taken.some(other => other.x0 !== self.x0 || other.y0 !== self.y0 ? box.x0 < other.x1 && box.x1 > other.x0 && box.y0 < other.y1 && box.y1 > other.y0 : false)) return false;
          taken.push(box); return true;
        });
        if (!free) label.style.display = 'none';
      });
    }
    function updateYearSelection() {
      // A year is only a visual filter.  Freeze the live layout before
      // changing its highlights so the selection never appears to re-layout
      // the research map beneath the user.
      activeSimulation?.stop();
      yearSelect.value = String(year); yearButtons.querySelectorAll('button').forEach(button => button.classList.toggle('on', String(year) === button.dataset.year));
      popup.hidden = true;
      svg.querySelectorAll('.rmnode').forEach(group => {
        const node = nodes.find(item => item.id === group.dataset.id), dot = group.querySelector('.rm-dot');
        if (!node || !dot) return;
        group.querySelectorAll('.rm-year-ring,.rmmeta').forEach(item => item.remove());
        const isSelectedYear = year !== 'all' && node.year === year, cx = dot.getAttribute('cx'), cy = dot.getAttribute('cy'), r = radiusFor(node) + (isSelectedYear ? .8 : 0);
        dot.setAttribute('r', r); group.querySelector('.rm-under')?.setAttribute('r', r + 1.9); group.querySelector('.rm-pick-ring')?.setAttribute('r', r + 3.6);
        group.classList.toggle('is-year-off', year !== 'all' && !isSelectedYear);
        if (isSelectedYear) {
          const ring = document.createElementNS('http://www.w3.org/2000/svg', 'circle'); ring.setAttribute('class', 'rm-year-ring'); ring.setAttribute('cx', cx); ring.setAttribute('cy', cy); ring.setAttribute('r', r + 3.4);
          group.insertBefore(ring, group.querySelector('.rm-pick-ring'));
          if (!showTopics) {
            const point = dynamicPositions.get(node.id) || node, meta = document.createElementNS('http://www.w3.org/2000/svg', 'text');
            meta.setAttribute('class', 'rmmeta'); meta.setAttribute('x', +cx + (point.x > 620 ? -10 : 10)); meta.setAttribute('y', +cy - 8); meta.setAttribute('text-anchor', point.x > 620 ? 'end' : 'start'); meta.textContent = node.map_label || node.subfield; group.append(meta);
          }
        }
      });
      settleNodeLabels();
      renderInspector();
    }
    function startDynamicLayout(mapLinks) {
      const d3 = window.d3;
      const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
      if (!d3?.forceSimulation || reducedMotion) { dynamicPositions = new Map(shown.map(node => [node.id, node])); resolveLabels(shown); settleNodeLabels(); return; }
      const physics = shown.map(node => {
        const label = svg.querySelector(`.rmnode[data-id="${node.id}"] .rm-topic, .rmnode[data-id="${node.id}"] .rmmeta`);
        const box = label?.getBBox();
        return { ...node, x: node.x, y: node.y, homeX: node.x, homeY: node.y, cluster: `${node.research_area}|${node.subfield}`, radius: Math.max(11, (box?.width || 0) * .45 + 5) };
      });
      const clusterTargets = new Map();
      physics.forEach(node => { const target = clusterTargets.get(node.cluster) || { x: 0, y: 0, count: 0 }; target.x += node.homeX; target.y += node.homeY; target.count += 1; clusterTargets.set(node.cluster, target); });
      clusterTargets.forEach(target => { target.x /= target.count; target.y /= target.count; });
      const byId = new Map(physics.map(node => [node.id, node])); let ticks = 0;
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
          links.forEach(link => link.line.setAttribute('d', linkPath(link.source, link.target, link.bend)));
          syncClusterLabels(physics);
          if ((ticks += 1) % 20 === 0) settleNodeLabels();
        })
        .on('end', settleNodeLabels);
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
      resolveLabels(physics);
    }
    /* Area titles first, then subfield names: each keeps its saved position when that is free, otherwise it takes
       the nearest free spot. Skipped while arranging, so a maintainer's drag is never overridden. */
    function resolveLabels(points) {
      if (arranging) return;
      const taken = points.map(point => ({ x0: point.x - 8, x1: point.x + 8, y0: point.y - 8, y1: point.y + 8 }));
      const steps = []; [0, -9, 9, -18, 18, -27, 27, -36, 36, -48, 48, -60, 60].forEach(dy => [0, -12, 12, -24, 24, -38, 38, -54, 54, -72, 72, -96, 96].forEach(dx => steps.push([dx, dy])));
      steps.sort((a, b) => Math.abs(a[0]) + 1.6 * Math.abs(a[1]) - Math.abs(b[0]) - 1.6 * Math.abs(b[1]));
      [...svg.querySelectorAll('.rm-area-label'), ...svg.querySelectorAll('.rmsub')].forEach(label => {
        const size = label.getBBox(), w = size.width, h = size.height, x = +label.getAttribute('x'), y = +label.getAttribute('y');
        const boxAt = (px, py) => ({ x0: px - w / 2 - 3, x1: px + w / 2 + 3, y0: py - h * .82 - 2, y1: py + h * .22 + 2 });
        const free = box => box.x0 >= baseView.x + 2 && box.x1 <= baseView.x + baseView.width - 2 && box.y0 >= baseView.y + 2 && box.y1 <= baseView.y + baseView.height - 2 && !taken.some(other => box.x0 < other.x1 && box.x1 > other.x0 && box.y0 < other.y1 && box.y1 > other.y0);
        const step = steps.find(([dx, dy]) => free(boxAt(x + dx, y + dy))) || [0, 0];
        label.setAttribute('x', x + step[0]); label.setAttribute('y', y + step[1]); taken.push(boxAt(x + step[0], y + step[1]));
        if (label.matches('.rmsub')) syncSubclusterHit(label); else syncAreaHit(label);
      });
    }
    function visibleView() {
      // Wide: the whole map at zoom 1, as before. Narrow: the view takes the shape of the map box, so one
      // research direction fills a phone screen at a legible size and the rest is reached by panning.
      const box = svg.getBoundingClientRect(), aspect = isNarrow() && box.width && box.height ? box.width / box.height : baseView.width / baseView.height;
      const width = baseView.width / mapZoom, height = width / aspect, cx0 = baseView.x + baseView.width / 2, cy0 = baseView.y + baseView.height / 2;
      const minX = baseView.x + width / 2, maxX = baseView.x + baseView.width - width / 2, minY = baseView.y + height / 2, maxY = baseView.y + baseView.height - height / 2;
      mapCenter.x = minX > maxX ? cx0 : Math.max(minX, Math.min(maxX, mapCenter.x)); mapCenter.y = minY > maxY ? cy0 : Math.max(minY, Math.min(maxY, mapCenter.y));
      return { x: mapCenter.x - width / 2, y: mapCenter.y - height / 2, width, height };
    }
    function applyMapZoom() {
      const view = visibleView(); svg.setAttribute('viewBox', `${view.x} ${view.y} ${view.width} ${view.height}`); zoomOutput.textContent = `${Math.round(mapZoom * 100)}%`;
    }
    function zoomMap(factor, event) {
      const before = visibleView(), focus = event ? svgPoint(event) : { x: mapCenter.x, y: mapCenter.y }, next = Math.max(1, Math.min(4, mapZoom * factor));
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
    zoomResetButton.onclick = () => { mapZoom = 1; mapCenter = { x: 420, y: 228 }; applyMapZoom(); markAreaTab(''); };
    svg.addEventListener('wheel', event => { if (!event.ctrlKey && !event.metaKey) return; event.preventDefault(); zoomMap(event.deltaY < 0 ? 1.14 : 1 / 1.14, event); }, { passive: false });
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
    host.querySelector('[data-reset]').onclick = () => { layout = { ...publishedNodeLayout }; labelLayout = { ...publishedLabelLayout }; localStorage.removeItem('dami-research-map-layout-v4'); localStorage.removeItem('dami-research-map-label-layout-v4'); nodes = papers.map(position); render(); };
    host.querySelector('[data-copy]').onclick = async () => { const value = JSON.stringify({ nodes: layout, labels: labelLayout }); try { await navigator.clipboard.writeText(value); arrangeButton.textContent = 'Layout copied'; setTimeout(() => arrangeButton.textContent = 'Done arranging', 1300); } catch { prompt('Copy this layout JSON:', value); } };
    /* Hover: keep one paper and its links, dim the rest. */
    function hoverNode(group) {
      svg.querySelectorAll('.is-hot').forEach(item => item.classList.remove('is-hot'));
      if (!group || arranging) { rootEl.classList.remove('has-hover'); tip.classList.remove('on'); return; }
      const id = group.dataset.id, node = nodes.find(item => item.id === id); if (!node) return;
      rootEl.classList.add('has-hover'); group.classList.add('is-hot');
      svg.querySelectorAll('.rm-link').forEach(link => { if (link.dataset.s !== id && link.dataset.t !== id) return; link.classList.add('is-hot'); svg.querySelector(`.rmnode[data-id="${CSS.escape(link.dataset.s === id ? link.dataset.t : link.dataset.s)}"]`)?.classList.add('is-hot'); });
      const venue = venueFor(node); tip.innerHTML = `<b>${escape(node.title)}</b><span>${escape(venue)}${venue ? ' · ' : ''}${node.year}</span>`;
      const box = group.querySelector('.rm-dot').getBoundingClientRect(), tw = tip.offsetWidth, th = tip.offsetHeight;
      tip.style.left = Math.min(Math.max(8, box.left + box.width / 2 - tw / 2), innerWidth - tw - 8) + 'px';
      tip.style.top = (box.top - th - 8 < 8 ? box.bottom + 8 : box.top - th - 8) + 'px'; tip.classList.add('on');
    }
    svg.addEventListener('pointerover', event => { if (event.pointerType === 'mouse' && !event.buttons) hoverNode(event.target.closest?.('.rmnode')); });
    svg.addEventListener('pointerleave', () => hoverNode(null));
    svg.addEventListener('pointerdown', () => tip.classList.remove('on'), true);
    svg.addEventListener('focusin', event => { const group = event.target.closest?.('.rmnode'); if (group?.matches(':focus-visible')) hoverNode(group); });
    svg.addEventListener('focusout', () => hoverNode(null));
    addEventListener('scroll', () => tip.classList.remove('on'), { passive: true });
    yearSelect.onchange = () => { year = yearSelect.value === 'all' ? 'all' : Number(yearSelect.value); selected = null; updateYearSelection(); };
    /* Narrow screens: tabs move the map to one research direction; the fit button shows the whole map. */
    areaTabs.innerHTML = Object.entries(areas).map(([key, area]) => `<button type="button" data-area-tab="${key}" aria-label="${escape(area.name)}">${escape(area.name)}</button>`).join('');
    const markAreaTab = key => areaTabs.querySelectorAll('button').forEach(button => button.classList.toggle('on', button.dataset.areaTab === key));
    function focusArea(key) {
      const group = nodes.filter(node => node.research_area === key), box = svg.getBoundingClientRect(); if (!group.length || !box.height) return;
      mapZoom = Math.max(1, baseView.width / (baseView.height * box.width / box.height));
      mapCenter = { x: group.reduce((sum, node) => sum + node.x, 0) / group.length, y: 228 }; applyMapZoom(); markAreaTab(key);
    }
    areaTabs.onclick = event => { const button = event.target.closest('button'); if (button) focusArea(button.dataset.areaTab); };
    let wasNarrow = null;
    const fitMode = () => { const narrow = isNarrow(); if (narrow === wasNarrow) return; wasNarrow = narrow; if (narrow) focusArea('trust'); else { mapZoom = 1; mapCenter = { x: 420, y: 228 }; applyMapZoom(); } };
    render(); d3Ready.then(d3 => { if (d3?.forceSimulation) render(); });
    fitMode(); new ResizeObserver(fitMode).observe(rootEl);
    setTimeout(() => rootEl.classList.remove('is-intro'), 1600);
  }
})();
