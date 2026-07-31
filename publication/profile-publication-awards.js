(() => {
  const people = {
    hyeonjin: {
      name: '김현진',
      papers: [['ASK 2026', '2026. 5. 21', '관찰 가능한 추론을 통한 팩터 검증: 실증적 검증 기반 LLM 에이전트 팩터 마이닝 프레임워크', '김현진, 김민석, 정승현, 이우진']],
      awards: [['2025. 11. 8', '산학연협동우수상', '골프 클럽과 인간 관절의 통합: 스윙 분석을 위한 시공간 그래프 합성곱 기법']]
    },
    minseok: {
      name: '김민석',
      papers: [['ASK 2026', '2026. 5. 21', '관찰 가능한 추론을 통한 팩터 검증: 실증적 검증 기반 LLM 에이전트 팩터 마이닝 프레임워크', '김현진, 김민석, 정승현, 이우진']],
      awards: [['2025. 11. 8', '산학연협동우수상', '골프 클럽과 인간 관절의 통합: 스윙 분석을 위한 시공간 그래프 합성곱 기법']]
    },
    seunghyun: {
      name: '정승현',
      papers: [
        ['ASK 2026', '2026. 5. 21', '관찰 가능한 추론을 통한 팩터 검증: 실증적 검증 기반 LLM 에이전트 팩터 마이닝 프레임워크', '김현진, 김민석, 정승현, 이우진'],
        ['ASK 2026', '2026. 5. 21', 'LLM 언러닝에서의 Forget-Set 불일치 문제: 모델 기억 기반 Forget-Set 구성 방법', '김미소, 이거루, 정승원, 정승현, 이우진'],
        ['한국자료분석학회 동계 학술논문발표대회', '2024. 1. 26', 'CLIP 기반 모델을 활용한 다중 라벨 Zero-shot 분류', '정승현, Christoph Timmermann, 김창우, 김미소, 이우진']
      ],
      awards: [
        ['2025. 11. 8', '산학연협동우수상', '골프 클럽과 인간 관절의 통합: 스윙 분석을 위한 시공간 그래프 합성곱 기법'],
        ['2026. 5. 21', '우수논문상', 'LLM 언러닝에서의 Forget-Set 불일치 문제: 모델 기억 기반 Forget-Set 구성 방법']
      ]
    },
    miso: {
      name: '김미소',
      papers: [
        ['ASK 2026', '2026. 5. 21', 'LLM 언러닝에서의 Forget-Set 불일치 문제: 모델 기억 기반 Forget-Set 구성 방법', '김미소, 이거루, 정승원, 정승현, 이우진'],
        ['한국자료분석학회 동계 학술논문발표대회', '2024. 1. 26', 'CLIP 기반 모델을 활용한 다중 라벨 Zero-shot 분류', '정승현, Christoph Timmermann, 김창우, 김미소, 이우진']
      ],
      awards: [['2026. 5. 21', '우수논문상', 'LLM 언러닝에서의 Forget-Set 불일치 문제: 모델 기억 기반 Forget-Set 구성 방법']]
    },
    georu: {
      name: '이거루',
      papers: [['ASK 2026', '2026. 5. 21', 'LLM 언러닝에서의 Forget-Set 불일치 문제: 모델 기억 기반 Forget-Set 구성 방법', '김미소, 이거루, 정승원, 정승현, 이우진']],
      awards: [['2026. 5. 21', '우수논문상', 'LLM 언러닝에서의 Forget-Set 불일치 문제: 모델 기억 기반 Forget-Set 구성 방법']]
    },
    seungwon: {
      name: '정승원',
      papers: [['ASK 2026', '2026. 5. 21', 'LLM 언러닝에서의 Forget-Set 불일치 문제: 모델 기억 기반 Forget-Set 구성 방법', '김미소, 이거루, 정승원, 정승현, 이우진']],
      awards: [['2026. 5. 21', '우수논문상', 'LLM 언러닝에서의 Forget-Set 불일치 문제: 모델 기억 기반 Forget-Set 구성 방법']]
    },
    hyunse: {
      name: '이현세',
      papers: [],
      awards: [['2025. 8. 29', '최우수논문상', 'Efficient Few-shot Adaptation of CLIP by Addressing Intra-modal Misalignment']]
    }
  };

  if (location.pathname === '/professor/') {
    const projects = Array.from(document.querySelectorAll('section')).find((section) => section.querySelector('h2')?.textContent.trim() === 'Projects & Activities');
    const other = document.querySelector('[data-other-publication="bal-clip"]')?.closest('section');
    if (!projects || !other || other.querySelector('[data-audit-professor]')) return;
    const paper = (venue, date, title, authors, award = '') => `<div class="mt-3 rounded-lg border border-slate-200 bg-slate-50 px-4 py-3"><div class="flex flex-wrap items-center gap-2 text-xs font-bold"><span class="rounded-md bg-amber-700 px-2 py-1 text-white">${venue}</span><span class="rounded-md bg-zinc-700 px-2 py-1 text-white">포스터발표</span>${award ? `<span class="rounded-md bg-orange-900 px-2 py-1 text-white">${award}</span>` : ''}<span class="text-slate-500">${date}</span></div><h3 class="mt-2 text-sm font-bold text-slate-900">${title}</h3><p class="mt-1 text-sm text-slate-600">${authors}</p></div>`;
    other.insertAdjacentHTML('beforeend', `<div data-audit-professor class="mt-4 border-t border-slate-200 pt-4"><div class="text-xs font-black tracking-wider text-amber-700">DOMESTIC PUBLICATIONS</div>${paper('ASK 2026', '2026. 5. 21', '관찰 가능한 추론을 통한 팩터 검증: 실증적 검증 기반 LLM 에이전트 팩터 마이닝 프레임워크', '김현진, 김민석, 정승현, 이우진')}${paper('ASK 2026', '2026. 5. 21', 'LLM 언러닝에서의 Forget-Set 불일치 문제: 모델 기억 기반 Forget-Set 구성 방법', '김미소, 이거루, 정승원, 정승현, 이우진', '우수논문상')}${paper('한국자료분석학회 동계 학술논문발표대회', '2024. 1. 26', 'CLIP 기반 모델을 활용한 다중 라벨 Zero-shot 분류', '정승현, Christoph Timmermann, 김창우, 김미소, 이우진')}</div>`);
    other.insertAdjacentHTML('afterend', `<section data-audit-professor-awards class="mt-10 max-w-4xl mx-auto"><h2 class="text-2xl md:text-3xl font-bold">Awards</h2><div class="mt-5 rounded-xl border border-orange-200 bg-orange-50 px-5 py-4 text-sm leading-6 text-slate-700"><div><strong>최우수논문상</strong> · Efficient Few-shot Adaptation of CLIP by Addressing Intra-modal Misalignment <span class="text-slate-500">(2025. 8. 29)</span></div><div class="mt-2"><strong>산학연협동우수상</strong> · 골프 클럽과 인간 관절의 통합: 스윙 분석을 위한 시공간 그래프 합성곱 기법 <span class="text-slate-500">(2025. 11. 8)</span></div><div class="mt-2"><strong>우수논문상</strong> · LLM 언러닝에서의 Forget-Set 불일치 문제: 모델 기억 기반 Forget-Set 구성 방법 <span class="text-slate-500">(2026. 5. 21)</span></div></div></section>`);
    return;
  }

  if (location.pathname === '/researcher/') {
    const christoph = Array.from(document.querySelectorAll('#tab-alumni article')).find((card) => card.textContent.includes('Christoph Timmermann'));
    const divider = christoph && christoph.querySelector('div[style*="height: 1px"]');
    if (divider && !christoph.querySelector('[data-audit-christoph-award]')) {
      divider.insertAdjacentHTML('beforebegin', `<div data-audit-christoph-award style="margin-top:10px; font-size:13px; line-height:1.5;"><strong>🏅 Award</strong><div style="margin-top:4px;"><span style="display:inline-block; margin-right:6px; padding:2px 8px; border-radius:5px; background-color:#7C2D12; color:#fff; font-size:11.5px; font-weight:700;">최우수논문상</span>Efficient Few-shot Adaptation of CLIP by Addressing Intra-modal Misalignment</div><div style="margin-top:2px; color:#4B5563; font-size:12.5px;">2025. 8. 29 · 공동 연구 논문 수상</div></div>`);
    }
    return;
  }

  const slug = location.pathname.match(/^\/researcher\/([^/]+)\/$/)?.[1];
  const profile = slug && people[slug];
  if (!profile) return;

  const publicationSection = Array.from(document.querySelectorAll('section')).find((section) => section.querySelector('h2')?.textContent.trim() === 'Publications');
  if (!publicationSection || publicationSection.querySelector('[data-audit-publications]')) return;

  const markAuthor = (authors) => authors.replace(profile.name, `<span style="color:#0B284F; font-weight:800;">${profile.name}</span>`);
  if (profile.papers.length) {
    const items = profile.papers.map(([venue, date, title, authors]) => `<li style="margin-bottom:10px;"><div style="font-weight:600;"><span style="display:inline-block; margin-right:6px; padding:2px 8px; border-radius:5px; background-color:#B45309; color:#fff; font-size:11.5px; font-weight:700; vertical-align:2px; white-space:nowrap;">${venue}</span><span style="display:inline-block; margin-right:6px; padding:2px 8px; border-radius:5px; background-color:#3F3F46; color:#fff; font-size:11.5px; font-weight:700; vertical-align:2px; white-space:nowrap;">포스터발표</span>${title}</div><div style="color:#4B5563; font-size:13px; margin-top:2px;">${markAuthor(authors)} · ${date}</div></li>`).join('');
    const group = document.createElement('div');
    group.dataset.auditPublications = 'domestic';
    group.style.marginTop = '14px';
    group.innerHTML = `<div style="font-size:13px; font-weight:800; letter-spacing:.04em; color:#B45309; margin-bottom:6px;">OTHER PUBLICATIONS</div><ul style="margin:0; padding-left:18px; font-size:14px; line-height:22px; list-style-type:disc;">${items}</ul>`;
    const underReview = Array.from(publicationSection.children).find((item) => item.textContent.trim().startsWith('Under Review'));
    publicationSection.insertBefore(group, underReview || null);
  }

  if (profile.awards.length) {
    const items = profile.awards.map(([date, award, title]) => `<li style="margin-bottom:8px;"><span style="display:inline-block; margin-right:6px; padding:2px 8px; border-radius:5px; background-color:#7C2D12; color:#fff; font-size:11.5px; font-weight:700; vertical-align:2px; white-space:nowrap;">${award}</span><span style="font-weight:600;">${title}</span><div style="color:#4B5563; font-size:13px; margin-top:2px;">${date} · 공동 연구 논문 수상</div></li>`).join('');
    publicationSection.insertAdjacentHTML('afterend', `<section data-audit-awards style="margin-bottom:24px;"><h2 style="font-size:18px; font-weight:700; margin:0;">Awards</h2><div style="margin-bottom:12px; height:3px; background-color:#7C2D12; width:72px;"></div><ul style="margin:14px 0 0; padding-left:18px; font-size:14px; line-height:22px; list-style-type:disc;">${items}</ul></section>`);
  }
})();
