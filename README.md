# M&M 육아 학교

출산 후 아빠 할 일 체크리스트 + 생후 0–12개월 육아 2주 완성 코스 + Kaiser 영어 표현. 한 파일짜리 웹앱.

| 어디서 보나 | 주소 | 특징 |
|---|---|---|
| GitHub Pages (공개) | https://benmsk.github.io/mm-baby-school/ | 링크만 있으면 누구나. 체크는 각자 기기에만 저장. 아이폰 홈 화면 추가 시 아기 얼굴 아이콘 |
| claude.ai 아티팩트 (비공개) | https://claude.ai/artifact/Ff7anvSvtRLy77STxJPAKu | 편집 권한을 준 사람끼리 체크·수업 완료가 공유됨(페이지가 자기 자신을 다시 게시하는 방식) |
| 로컬 | `index.html` 더블클릭 | 오프라인 확인용 |

관련: 임신 중 할 일은 상위 폴더의 `../index.html` = [출산 준비 노트](https://claude.ai/artifact/LKWaj7cPM95xvSJJUHEwf4).

## 파일 구조

```
school/                      ← git 저장소 루트 (github.com/BenMSK/mm-baby-school, branch main)
├─ index.html                ← 앱 전체 (CSS + 내용 템플릿 + 상태 JSON + 스크립트). 유일한 소스
├─ apple-touch-icon.png      ← iOS 홈 화면 아이콘 180px (아기 얼굴)
├─ icon-192.png, icon-512.png, manifest.webmanifest  ← 안드로이드/PWA 아이콘·매니페스트
├─ .nojekyll                 ← GitHub Pages가 파일을 그대로 서빙하게
├─ tools/htmlcheck.js        ← 태그 균형 검사기  (node tools/htmlcheck.js index.html)
├─ tools/makeicon.js         ← 아기 얼굴 SVG → PNG 아이콘 생성기 (node tools/makeicon.js .)
└─ README.md                 ← 이 문서
../research/11_~16_*.md      ← 2026-10-19 리서치 원본(출처 URL 전부, 끝에 "미확인·주의")
../research/01_~07_*.md      ← 2026-09-14 리서치(Kaiser 분만, 카시트, 미국 서류, 한국 출생신고, J-1 휴가)
```

### index.html 안의 구조

- `<head>`: 아티팩트 도구가 쓰는 뼈대 + 아이콘 링크. `<body>` 첫 줄의 `<title>`·메타·폰트 링크는 아티팩트 도구가 읽는 부분.
- `<style id="css">`: 디자인 토큰(`:root`, 다크 2블록), 컴포넌트, 모바일 규칙(`@media (max-width:640px)`에서 표를 카드로).
- `<template id="src">`: **모든 내용**. SVG 심볼(`i-baby` 등) → 헤더·탭 → `#pane-dad`(아빠 할 일, `.phase` 6개, `.ck` 항목 45개) → `#pane-course`(`.day` 섹션 data-day 0~14) → `#pane-english` → 푸터.
- `<script id="state" type="application/json">`: 공유 상태 `{birth, checks, lessons, updated}`. 로컬 파일에서는 비어 있고, claude.ai 게시본에는 체크 내용이 들어 있음.
- `<script id="app">`: 템플릿을 `#root`에 복제 → 날짜(D+N) 계산 → 체크/수업 완료 렌더 → 탭·해시 라우팅(`#dad`, `#course`, `#d3`, `#english`) → 퀴즈 → 테마 → `claude.use("artifact")`로 공유 저장(없으면 localStorage).

### 내용 규칙

- 사실 문장 끝에 출처 칩 `<a class="src">`(미국) / `<a class="src kr">`(한국). 미국·한국 지침이 다르면 본문에 "한국은…"으로 명시.
- 수업 구조: `오늘의 핵심` → 본문(h3) → `하면 안 되는 것`(.dont) → 퀴즈(.q, data-a = 정답 인덱스 0부터) → 영상(.yt) → 출처(.refs) → 완료 버튼.
- 체크 항목 id(`data-id`)는 절대 바꾸지 말 것(공유 상태 키). 새 항목은 새 id로 추가.
- 월별 로드맵 표의 `data-month`, 마감 칩의 `data-dplus`는 스크립트가 날짜 계산에 씀.

## 고치고 다시 올리는 순서

1. `index.html` 수정 (내용은 `<template id="src">` 안).
2. 검사: `node tools/htmlcheck.js index.html` → `errors: 0` 확인. 스크립트를 고쳤으면 브라우저에서 한 번 열어 콘솔 오류 확인.
3. 버전 올리기: 헤더의 `<span class="ver">v1.x (날짜)</span>`와 푸터의 `v1.x (날짜)`, 그리고 아래 변경 이력에 한 줄.
4. claude.ai 아티팩트 재게시: Claude Code에서 "school/index.html 고쳤으니 아티팩트 Ff7anvSvtRLy77STxJPAKu 에 재게시해 줘". (아이콘·매니페스트를 바꿨을 때만 `files`도 같이.)
5. GitHub Pages: `git add -A && git commit -m "..." && git push` → 1~2분 뒤 반영, CDN 캐시 10분.
6. 아이콘을 바꾸려면 `index.html`의 `i-baby` 심볼을 고친 뒤 `tools/makeicon.js`의 좌표도 맞추고 `node tools/makeicon.js .` 실행, 폰에서는 홈 화면 아이콘 삭제 후 다시 추가.

Claude Code로 다시 시작할 때 이 폴더에서 "README.md 읽고 이어서 하자"고 하면 됩니다. 메모리에도 프로젝트 요약이 있습니다.

## 변경 이력

버전 = 페이지 상단 표시. 아티팩트 버전 = claude.ai 게시 번호. 커밋 = github.io.

| 날짜 | 페이지 | 아티팩트 | 커밋 | 내용 |
|---|---|---|---|---|
| 2026-10-19 | v1.0 | v1 | – | 최초 작성. 리서치 6건(`research/11~16`) 병렬 조사 후 작성. 아빠 할 일 탭(6단계 45항목, 출생일 기준 D+N 날짜 자동 계산, 2026-10-19 기준 재검증: SMC Clerk 여권 접수 중단, 원정출산 예외 조항 정정, CalKIDS 추가, 2027 PFL 전망, SSA 사무소 이전). 육아 2주 코스 Day 1~14(퀴즈 75문항, 체크 가능한 졸업 체크리스트 14항목, 유튜브 85편 oEmbed 확인). 라이트/다크, 아기 SVG 아이콘 20종, Jua + Gowun Dodum 폰트. 공유 저장(artifact capability)은 출산 준비 노트와 같은 패턴 |
| 2026-10-19 | v1.0 | v2 | d14b0b0 | 모바일: 640px 이하에서 표의 각 줄을 카드로(열 제목은 스크립트가 `data-label`로 붙임), 헤더 축소, 히어로 그림 우상단 고정, theme-color 메타. GitHub 저장소 `BenMSK/mm-baby-school` 생성·Pages 활성화 |
| 2026-10-19 | v1.1 | v3 | 4d97233 | 세 번째 탭 "Kaiser 영어": 먼저 외울 4문장, 입원 중·advice nurse 전화·소아과 검진·엄마 산후·약국/행정·단어장 60개, °C→°F 표. 상단 버전 표시, 푸터에 github.io/claude.ai 링크 |
| 2026-10-19 | v1.1 | v4 | b846ac1 | 홈 화면 아이콘: `tools/makeicon.js`로 아기 얼굴 PNG 180/192/512 생성, `manifest.webmanifest`(standalone), 링크 태그 |
| 2026-10-19 | v1.1 | v5 | a114d26 | 아이콘·매니페스트 링크를 문서 `<head>`로 이동(iOS Safari가 본문 링크를 못 읽는 문제). README·tools 추가 |

## 확인이 필요한 것 (리서치 때 원문을 못 연 항목)

- Kaiser Redwood City 소아과 advice 번호 650-299-2015: 검색 결과로만 확인. 퇴원 안내지로 재확인. NCAL 공통 1-866-454-8855.
- 미국 여권 접수처: San Mateo County Clerk 중단. Redwood City 우체국(1100 Broadway, 650-368-1782)은 전화 확인 후 예약. 검색은 iafdb.travel.state.gov.
- B형간염 출생접종 연방 권고(AAP v. Kennedy 항소심, 2026-10-06 변론)와 출생시민권 소송(EO 14418, Nathan v. Trump)의 10월 중순 이후 동향 미확인. 캘리포니아·Kaiser 기준(AAP 2026, 출생접종 유지)은 영향 없음.
- 2027년 PFL 주급 상한 $1,791은 EDD 전망치. 연말 확정 확인.
- 주SF총영사관 출생신고 수수료(페이지 미기재, 무료 추정): sfkoreapassport@mofa.go.kr.
- 모유 아기 철분 드롭 시작(4개월 vs 2026-07 AAP 개정 "6개월까지"): 4개월 검진 때 소아과에 질문.
- Kaiser Redwood City 클래스(Newborn Care, Infant CPR) 개설·요금: 650-299-2433.
- 하정훈·정유미 유튜브 채널 공식 주소 미확인(영상 링크는 개별 확인됨). 한국어 산후우울·아빠 육아 전문의 영상 미발굴.
- 베이 지역 상주 한인 산후도우미 업체 명단 미확인(맘천사·LA 시세만).

## 다음에 할 만한 것

- 아기가 태어나면: 헤더 출생일 입력 → 아빠 탭 마감 날짜·로드맵 "지금" 줄 자동 갱신. 아티팩트 Share에서 아내에게 편집 권한.
- github.io에서도 두 사람 체크를 공유하려면 백엔드가 필요(현재는 기기별 저장). 필요해지면 아티팩트 `db` 기능으로 전환 검토.
- 12월 초: 위 "확인이 필요한 것" 재조사, 접종(Day 9)·여권 접수처 갱신.
- 12~24개월 확장(Day 15+), 백일·돌 준비 체크리스트, 냉장고용 한 장 요약 인쇄판.
