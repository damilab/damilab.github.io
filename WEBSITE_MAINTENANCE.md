# DAMI Lab 홈페이지 작업 안내

다른 Codex 세션에서 DAMI Lab 홈페이지를 수정할 때 먼저 읽는 파일입니다.

## 저장소와 배포

작업할 실제 홈페이지 저장소는 아래입니다.

```text
/home/dami/wj/temp_works/2026-07-29-website-alumni-update/damilab.github.io
```

이 저장소는 정적 HTML 사이트입니다. `main` 브랜치에 push하면 GitHub Pages가 다음 주소에 배포합니다.

```text
https://damilab.github.io/
```

## 무엇을 어디서 수정하나

대부분의 페이지는 **해당 폴더 안의 `index.html` 한 파일**을 직접 수정하면 됩니다.

| 수정 대상 | 파일/폴더 |
| --- | --- |
| 메인 홈페이지 | `index.html` |
| Publications | `publication/index.html` |
| Research 메인 | `research/index.html` |
| Research 세부 분야 | `research/<분야명>/index.html` |
| 구성원 목록 | `researcher/index.html` |
| 구성원 개인 페이지 | `researcher/<이름>/index.html` |
| News 목록 | `news/index.html` |
| News 개별 글 | `news/<번호>/index.html` |
| Projects 목록 | `projects/index.html` |
| Projects 개별 페이지 | `projects/<프로젝트명>/index.html` |
| History 목록 | `history/index.html` |
| History 개별 페이지 | `history/<글-slug>/index.html` |
| Contact | `contact/index.html` |
| Professor | `professor/index.html` |

예를 들어 “Research 페이지의 문구와 그림을 바꿔줘”라면 `research/index.html`을, “OO 연구원 소개를 고쳐줘”라면 `researcher/oo/index.html`을 먼저 확인합니다.

새 페이지를 만들 때는 비슷한 목적의 기존 폴더를 통째로 복사하지 말고, 가장 가까운 기존 `index.html`을 참고해 필요한 파일만 새 폴더에 추가합니다. 메뉴 링크도 필요하면 관련 상위 페이지의 navigation을 함께 수정합니다.

## 작업 순서

1. 저장소로 이동하고 상태를 확인합니다.

   ```bash
   cd /home/dami/wj/temp_works/2026-07-29-website-alumni-update/damilab.github.io
   git status --short
   ```

2. 요청과 일치하는 페이지의 `index.html`을 먼저 읽습니다. 비슷한 페이지의 구조와 헤더/푸터를 그대로 따르는 것이 가장 안전합니다.

3. 요청 범위의 HTML, CSS, 이미지 경로, 링크만 수정합니다.

4. 브라우저에서 해당 페이지를 실제로 열어 텍스트, 이미지, 링크, 모바일 폭을 확인합니다.

5. 변경 파일만 커밋하고 `main`에 push합니다.

   ```bash
   git add <변경한-파일들>
   git commit -m "Describe the change"
   git push origin main
   ```

6. GitHub Pages 배포가 성공한 뒤 `https://damilab.github.io/<경로>/`에서 한 번 더 확인합니다.

## 꼭 지킬 점

- 시작 전에 `git status --short`를 확인하고, 기존 변경을 되돌리지 않습니다.
- `git reset`, `git checkout --`, `git restore`는 사용하지 않습니다.
- 다른 페이지의 디자인 문법(헤더, 네비게이션, 폰트, 카드, footer)을 임의로 전면 변경하지 않습니다. 요청한 페이지에서 필요한 부분만 고칩니다.
- 이미지·PDF·PPT 등 첨부 파일은 실제 저장소 안의 경로에 넣은 뒤 HTML 경로도 맞춰야 합니다.
- 외부 링크는 실제로 열리는지 확인하고, 새 탭 링크에는 `target="_blank" rel="noopener"`를 사용합니다.
- JavaScript를 수정했다면 문법 검사(`node --check <파일>`)와 브라우저 클릭 검수를 합니다.
- 변경 후에는 `git diff --check`로 깨진 공백/충돌이 없는지 확인합니다.

## 빠른 탐색 명령

```bash
# 어떤 페이지 폴더가 있는지 보기
rg --files -g 'index.html' | sort

# 문구가 들어 있는 파일 찾기
rg -n "찾을 문구" .

# 현재 변경 확인
git status --short
git diff --stat
```

## Publications만 예외적으로 알아둘 점

Publications 페이지에 새 논문을 추가할 때만 데이터가 두 군데에 연동됩니다.

- 화면 카드: `publication/index.html`
- 논문 데이터: `publication/papers.json`

새 논문 추가 절차는 `publication/README.md`를 따릅니다. 그 외 일반 홈페이지 수정은 각 페이지 폴더의 `index.html`만 고치면 됩니다.

## 다른 세션에 전달할 문구

```text
DAMI Lab 홈페이지는
/home/dami/wj/temp_works/2026-07-29-website-alumni-update/damilab.github.io 에 있습니다.
WEBSITE_MAINTENANCE.md를 먼저 읽고, 요청한 페이지 폴더의 index.html만
필요한 범위에서 수정해 주세요. 기존 git 변경은 절대 되돌리지 말고,
브라우저 확인 후 main에 배포해 주세요.
```
