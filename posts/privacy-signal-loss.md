오늘은 2026년 8월 13일이다. 어제치 캠페인 리포트를 연다. 캠페인은 `c-4417` 하나다.

노출 1,200만, 클릭 24만이다. 웹 지면이 780만·15.6만이고 iOS 앱 지면이 420만·8.4만이다. 회사 전체 하루 노출 2.28억 줄 중 이 캠페인이 1,200만을 가져갔다. 여기까지는 두 지면이 똑같다.

전환 칸에서 갈린다. 웹 지면 칸에는 3,120이 적혀 있다. 대부분의 줄에 누가 언제 얼마를 샀는지가 붙어 있다. iOS 앱 지면 칸에는 940이 적혀 있다. 그 줄에는 사람이 없다. 940건 중 415건은 금액 칸까지 비어 있다. 그리고 940건은 어제 일어난 일이 아니다. 8월 8일과 9일에 설치한 사람들이다.

같은 캠페인, 같은 하루, 같은 리포트다. 한쪽 칸은 개인 라벨이고 다른 쪽 칸은 집계 카운트다. 이 글은 그 차이가 모델의 어디를 먼저 부수는지 센다.

이 글의 숫자는 전부 설명을 위해 지어낸 값이다. 파이썬 출력만은 실제로 돌려서 붙였다. 제품 이름과 동작은 확인해 적었지만 시점은 계속 바뀐다. 1절 끝의 접기에 그 경계를 적어 뒀다.

> **한 줄 요약:** 식별자가 빠지면 피처보다 라벨이 먼저 부서진다. 사람마다 붙던 정답이 칸마다의 합계로 바뀐다. 학습은 그래도 된다. 다만 같은 정밀도까지 데이터가 11배 필요하다. 노이즈는 작은 광고부터 지운다.

**이 글에 나오는 말** — 낯선 이름만 먼저 풀어 둡니다. 본문에서 다시 설명하니 지금 외울 필요는 없습니다.

| 말 | 한 줄 뜻 |
|---|---|
| 광고 식별자 (IDFA · 광고 ID) | 앱을 건너다니며 같은 사람을 묶어 주던 기기 번호 |
| 앱 추적 동의 (ATT) | 그 번호를 읽기 전에 iOS 가 받아 두는 사용자 동의 |
| 설치 성과 측정 규격 (SKAdNetwork · 줄여서 SKAN) | 애플이 대신 재서 사람 없이 결과만 보내 주는 경로 |
| 전환값 6비트 | 전환 하나를 0~63 중 한 칸으로만 알려 주는 제한 |
| 군중 익명성 (crowd anonymity) | 같은 값을 받은 사람이 적으면 값을 아예 안 주는 규칙 |
| 집계 라벨 | 사람마다의 정답이 아니라 칸마다의 합계로 오는 정답 |
| 차등 프라이버시 노이즈 | 칸 값에 무작위 수를 더해 개인을 숨기는 장치 |

> **골라 읽는 법** — 절이 10개인 긴 글입니다. 처음부터 다 읽지 않아도 됩니다.
>
> - 무엇이 언제 사라졌는지만 → 1절
> - 피해를 어떻게 나눠 재는지 → 2절
> - 타겟팅 피처 손실의 크기 → 3절
> - 전환이 집계로 바뀌는 과정 → 4~5절
> - 집계만 있을 때 학습하는 법 → 6절
> - 노이즈가 지표에 얼마나 남나 → 7절
> - 빈도 제어가 왜 먼저 무너지나 → 8절
> - 담장 안과 밖의 차이 → 9절
> - 무엇을 바꿔야 하나 → 10절

---

## 1. 무엇이 사라졌고 그 자리에 무엇이 왔나 [무대: 공통]

**사라진 것은 "이 사람이 그 사람"이라고 말해 주던 값 하나다. 그 자리에 온 것은 값이 아니라 API 다.**

광고 모델이 쓰던 식별자는 세 종류였다. 웹의 서드파티 쿠키, iOS 의 광고 식별자(IDFA), 안드로이드의 광고 ID 다. 셋 다 성질이 같았다. 여러 사이트나 여러 앱을 건너다니며 같은 사람을 같은 사람으로 묶어 준다. 그 묶음 위에 타겟팅 피처가 얹혔고 전환 라벨이 붙었다.

셋이 동시에 사라진 것은 아니다. 브라우저와 OS 가 각자의 속도로 좁혔다. 아래 표에서 왼쪽 두 칸은 확인된 사실이고, 오른쪽 칸은 지금도 움직이는 중이다.

| 신호 | 어디 | 지금 상태 | 그 자리에 온 것 |
|---|---|---|---|
| 서드파티 쿠키 | 웹 | Safari 는 2020년 3월부터 전면 차단, Firefox 도 기본 차단 | Topics · Protected Audience · Attribution Reporting API |
| 서드파티 쿠키 | 웹(Chrome) | 폐지 시점이 여러 번 미뤄졌고 방향도 바뀌었다 | 위와 같음. 다만 API 별로 존폐가 갈렸다 |
| 광고 식별자 (IDFA) | iOS 앱 | 2021년 4월 iOS 14.5 부터 앱 추적 동의를 받아야 읽는다 | SKAdNetwork, 그 뒤 AdAttributionKit |
| 광고 ID | 안드로이드 앱 | 사용자가 초기화·삭제할 수 있고 앱은 권한을 선언해야 한다 | Privacy Sandbox on Android |
| 로그인 ID | 자사 서비스 | 그대로 남아 있다 | 대체물이 필요 없다 |
| 광고주 1st-party ID | 광고주 서버 | 그대로 남아 있다 | 서버 간 전송으로 잇는다 |

표에 나온 이름 셋을 먼저 갈라 둔다. **앱 추적 동의(ATT)** 는 규칙이다. 광고 식별자를 읽기 전에 사용자에게 물어야 한다. **SKAdNetwork** 는 규칙이 아니라 대체 경로다. 동의를 못 받아도 성과는 재게 해 준다. 줄여서 **SKAN** 이라 쓰고 4절에서 자세히 푼다. **Privacy Sandbox** 는 브라우저 안에서 같은 일을 하려는 API 묶음이다. 하나가 다른 하나를 대신하지 않는다. 셋이 겹쳐서 돌아간다.

용어 하나 더 정해 둔다. 우리가 사용자에게 직접 받은 값을 **1st-party** 라 한다. 로그인 ID 와 자사 서비스 행동 이력이 그것이다. 남에게서 사 온 값이 **3rd-party** 다. 사라지는 것은 뒤쪽이다.

:::deep 더 깊이 — 연도를 못 박을 수 있는 것과 못 하는 것
이 글이 못 박는 시점은 넷뿐이다. Safari 는 2020년 3월에 서드파티 쿠키를 전면 차단했다. 애플은 2021년 4월 iOS 14.5 에서 앱 추적 동의를 의무화했다. SKAdNetwork 4.0 은 2022년에 나왔다. AdAttributionKit 은 2024년에 발표됐다.

나머지는 못 박지 않는다. Chrome 의 서드파티 쿠키 폐지 일정은 여러 번 미뤄졌다. 그리고 "전면 폐지"에서 물러서는 쪽으로 방향 자체가 바뀌었다. Privacy Sandbox API 도 전부가 같은 운명은 아니었다. 남은 것도 있고 정리 대상이 된 것도 있다. 발표 자료에 연도를 적을 일이 있으면 최신 공지를 직접 확인하고 적어야 한다.
:::

---

## 2. 피해를 세 곳으로 나눠 잰다 — 타겟팅·라벨·빈도 제어

**식별자 하나가 빠지면 세 군데가 동시에 상한다. 모델에 들어가는 것, 모델이 배우는 것, 모델이 내보낸 뒤의 제어다.**

"신호가 사라졌다"는 문장만으로는 무엇을 고쳐야 하는지 알 수 없다. 잃는 것이 한 종류가 아니기 때문이다. 아래 그림처럼 세 층으로 나눠 부른다. 1층은 타겟팅 피처, 2층은 전환 라벨, 3층은 빈도 제어다. 이렇게 나누면 각 층의 대응이 서로 다르다는 것이 보인다.

<div class="table-wrapper">
<figure style="text-align:center; margin:2rem 0;">
<svg viewBox="0 0 520 300" role="img" aria-label="피처·라벨·제어 세 층으로 나눈 그림. 각 층에서 남는 것은 실선 상자, 끊긴 것은 점선 상자로 표시했다." style="width:100%; max-width:520px; height:auto; font-family:var(--font-sans)">
<defs>
<marker id="privacy2-arr" markerWidth="9" markerHeight="9" refX="7.5" refY="3" orient="auto"><path d="M0,0 L7.5,3 L0,6 Z" style="fill:var(--ink3)"/></marker>
</defs>
<rect x="4" y="14" width="512" height="82" style="fill:var(--plate); stroke:var(--rule); stroke-width:1"/>
<text x="16" y="36" style="font-size:12.5px; fill:var(--ink3)">1층 · 모델에 들어가는 것</text>
<text x="16" y="58" style="font-size:14px; font-weight:700; fill:var(--ink)">타겟팅 피처</text>
<text x="16" y="80" style="font-size:12.5px; fill:var(--ink2)">3절에서 잰다</text>
<rect x="176" y="30" width="104" height="50" style="fill:var(--navy-bg); stroke:var(--navy); stroke-width:1.6"/>
<text x="228" y="50" text-anchor="middle" style="font-size:12.5px; fill:var(--ink)">문맥 피처</text>
<text x="228" y="68" text-anchor="middle" style="font-size:12.5px; fill:var(--navy)">남는다</text>
<rect x="290" y="30" width="104" height="50" style="fill:var(--navy-bg); stroke:var(--navy); stroke-width:1.6"/>
<text x="342" y="50" text-anchor="middle" style="font-size:12.5px; fill:var(--ink)">1st-party</text>
<text x="342" y="68" text-anchor="middle" style="font-size:12.5px; fill:var(--navy)">남는다</text>
<rect x="404" y="30" width="104" height="50" style="fill:var(--oxide-bg); stroke:var(--oxide); stroke-width:1.6; stroke-dasharray:5 4"/>
<text x="456" y="50" text-anchor="middle" style="font-size:12.5px; fill:var(--ink)">3rd-party</text>
<text x="456" y="68" text-anchor="middle" style="font-size:12.5px; fill:var(--oxide)">끊긴다</text>
<rect x="4" y="106" width="512" height="82" style="fill:var(--plate); stroke:var(--rule); stroke-width:1"/>
<text x="16" y="128" style="font-size:12.5px; fill:var(--ink3)">2층 · 모델이 배우는 것</text>
<text x="16" y="150" style="font-size:14px; font-weight:700; fill:var(--ink)">전환 라벨</text>
<text x="16" y="172" style="font-size:12.5px; fill:var(--ink2)">4~7절에서 잰다</text>
<rect x="176" y="122" width="122" height="50" style="fill:var(--navy-bg); stroke:var(--navy); stroke-width:1.6"/>
<text x="237" y="142" text-anchor="middle" style="font-size:12.5px; fill:var(--ink)">개인 라벨</text>
<text x="237" y="160" text-anchor="middle" style="font-size:12.5px; fill:var(--ink2)">줄마다 y</text>
<line x1="304" y1="147" x2="394" y2="147" style="stroke:var(--ink3); stroke-width:1.6; stroke-dasharray:5 4" marker-end="url(#privacy2-arr)"/>
<text x="349" y="138" text-anchor="middle" style="font-size:12.5px; fill:var(--oxide)">뭉갠다</text>
<rect x="400" y="122" width="108" height="50" style="fill:var(--oxide-bg); stroke:var(--oxide); stroke-width:1.6"/>
<text x="454" y="142" text-anchor="middle" style="font-size:12.5px; fill:var(--ink)">집계 카운트</text>
<text x="454" y="160" text-anchor="middle" style="font-size:12.5px; fill:var(--ink2)">칸마다 합계</text>
<rect x="4" y="198" width="512" height="82" style="fill:var(--plate); stroke:var(--rule); stroke-width:1"/>
<text x="16" y="220" style="font-size:12.5px; fill:var(--ink3)">3층 · 내보낸 뒤의 제어</text>
<text x="16" y="242" style="font-size:14px; font-weight:700; fill:var(--ink)">빈도 상한 · 중복 제거</text>
<text x="16" y="264" style="font-size:12.5px; fill:var(--ink2)">8절에서 잰다</text>
<rect x="290" y="214" width="104" height="50" style="fill:var(--oxide-bg); stroke:var(--oxide); stroke-width:1.6; stroke-dasharray:5 4"/>
<text x="342" y="234" text-anchor="middle" style="font-size:12.5px; fill:var(--ink)">빈도 상한</text>
<text x="342" y="252" text-anchor="middle" style="font-size:12.5px; fill:var(--oxide)">못 건다</text>
<rect x="404" y="214" width="104" height="50" style="fill:var(--oxide-bg); stroke:var(--oxide); stroke-width:1.6; stroke-dasharray:5 4"/>
<text x="456" y="234" text-anchor="middle" style="font-size:12.5px; fill:var(--ink)">중복 제거</text>
<text x="456" y="252" text-anchor="middle" style="font-size:12.5px; fill:var(--oxide)">못 한다</text>
</svg>
<figcaption style="margin-top:0.75rem; font-size:0.9rem; color:var(--text-muted)">점선 상자가 식별자와 함께 끊기는 것이다. 2층만 상자가 사라지지 않고 모양이 바뀐다.</figcaption>
</figure>
</div>

세 층은 회복 방법이 다르다. 1층은 다른 피처로 메울 수 있다. 문맥과 1st-party 신호가 그 자리를 일부 채운다. 3층은 메울 수 없다. 같은 사람인지 모르면 몇 번 봤는지도 셀 수 없기 때문이다. 2층이 가장 까다롭다. 라벨이 없어지는 것이 아니라 **모양이 바뀌기** 때문이다.

| 층 | 무엇을 잃나 | 모델의 어디가 상하나 | 메울 수 있나 |
|---|---|---|---|
| 1층 타겟팅 피처 | 크로스 사이트·크로스 앱 행동 | 입력 벡터가 짧아진다 | 부분적으로 |
| 2층 전환 라벨 | 전환의 개인 귀속 | 손실 함수의 정답 칸이 바뀐다 | 학습 방법을 바꿔야 한다 |
| 3층 빈도 제어 | 같은 사람인지 판정 | 모델 밖의 규칙이 안 돈다 | 거의 못 메운다 |

순서도 중요하다. 실무에서 먼저 아픈 것은 1층이 아니라 2층이다. 피처가 하나 빠지면 성능이 조금 내려간다. 라벨이 바뀌면 **학습 코드가 아예 안 돈다**. 정답 칸의 모양이 달라졌기 때문이다. 그래서 이 글은 2층 라벨에 절을 넷(4~7절) 쓴다.

---

## 3. 타겟팅 피처가 빠지면 점수가 얼마나 내려가나

**같은 피처를 빼도 열린 RTB 는 0.068 이 내려가고 담장 안은 0.012 만 내려간다.**

이 절은 열린 RTB 와 담장 안을 나란히 놓고 잰다. 재는 점수는 **AUC** 다. 순위를 얼마나 잘 매기는지 보는 값이다. 0.5 는 아무 정보가 없는 상태고 1.0 이 완벽한 순위다.

아래는 클릭 확률을 예측하는 모델(pCTR)을 두 무대에서 각각 학습한 결과다. 피처군을 하나씩 빼며 AUC 를 다시 쟀다. 실측이 아니라 설명을 위해 지어낸 값이다.

| 뺀 피처군 | 열린 RTB AUC | 변화 | 담장 안 AUC | 변화 |
|---|---|---|---|---|
| (안 뺀 상태) | 0.762 | — | 0.771 | — |
| 3rd-party 관심사 세그먼트 | 0.741 | -0.021 | 0.767 | -0.004 |
| 크로스 사이트 리타겟 목록 | 0.722 | -0.019 | 0.764 | -0.003 |
| 크로스 앱 최근 행동 | 0.706 | -0.016 | 0.761 | -0.003 |
| 식별자 기반 노출빈도·최근성 | 0.694 | -0.012 | 0.759 | -0.002 |
| **합계** | | **-0.068** | | **-0.012** |

변화 칸을 더하면 표의 합계와 맞는다. 열린 RTB 는 0.021+0.019+0.016+0.012 로 0.068 이다. 담장 안은 0.004+0.003+0.003+0.002 로 0.012 다. 같은 피처를 뺐는데 폭이 5.7배 다르다.

이유는 남는 것이 무엇이냐에 있다. 열린 RTB 에서 유저 신호는 대부분 남에게서 산 것이다. 서드파티 세그먼트, 쿠키 동기화로 맞춘 리타겟 목록, 데이터 공급자가 준 관심사 태그다. 그 신호가 끊기면 남는 것은 지면·시간·소재·기기 종류 같은 문맥뿐이다. 담장 안에서는 로그인 ID 에 붙은 자사 행동이 그대로 남는다. 무엇을 검색했고 무엇을 봤고 얼마나 자주 왔는지가 우리 로그 안에 있다.

여기서 흔한 오해 하나를 끊어 둔다. AUC 0.068 은 큰 값이다. 하지만 매출이 그 비율만큼 떨어진다는 뜻은 아니다. AUC 는 순위 지표다. 매출은 경매 결과에서 나온다. 게다가 경쟁자도 같은 신호를 같이 잃는다. 모두의 예측이 같이 나빠지면 순위 자체는 덜 흔들린다. 피처 손실의 실제 매출 영향을 재려면 [증분 실험](post.html?id=rct-randomized-experiment)이 필요하다.

문맥 피처가 어디까지 메울 수 있는지는 [CTR 피처 엔지니어링](post.html?id=ctr-feature-engineering)과 [세그멘테이션](post.html?id=audience-segmentation) 쪽 이야기다. 이 글은 여기서 2층 라벨로 넘어간다. 1층은 성능이 내려가는 문제다. 2층은 학습이 성립하느냐의 문제다.

---

## 4. 전환이 사람 단위에서 집계로 바뀐다

**애플이 보내 주는 결과에는 사람이 없다. 그래서 학습 데이터의 한 줄이 사람에서 칸으로 바뀐다.**

웹에서 전환 라벨을 만드는 방식은 단순하다. 광고주 페이지의 픽셀이 구매를 알리고, 그 구매를 클릭 기록에 붙인다. 붙이는 열쇠는 사용자 식별자다. 붙고 나면 학습 데이터 한 줄이 완성된다. 피처는 클릭 시점에서 오고 정답은 구매에서 온다.

iOS 앱에서는 이 경로가 막혔다. 그 자리에 애플이 만든 규격이 들어왔다. 이름이 **SKAdNetwork** 이고 줄여서 **SKAN** 이라 쓴다. 애플이 설치와 그 뒤의 활동을 대신 잰다. 결과는 한 건씩 통보로 온다. 이 통보를 **포스트백**이라 부른다. 그 안에 사용자 식별자가 없다. 캠페인 구분자, 전환값, 몇 가지 메타 정보뿐이다.

<div class="table-wrapper">
<figure style="text-align:center; margin:2rem 0;">
<svg viewBox="0 0 520 366" role="img" aria-label="웹 픽셀 경로와 SKAN 포스트백 경로를 나란히 놓은 그림. 왼쪽은 사용자 식별자로 조인해 개인 라벨 한 줄을 만들고, 오른쪽은 식별자 없이 캠페인 칸의 카운트를 올린다." style="width:100%; max-width:520px; height:auto; font-family:var(--font-sans)">
<defs>
<marker id="privacy4-arr" markerWidth="9" markerHeight="9" refX="7.5" refY="3" orient="auto"><path d="M0,0 L7.5,3 L0,6 Z" style="fill:var(--ink3)"/></marker>
</defs>
<text x="128" y="20" text-anchor="middle" style="font-size:13px; font-weight:700; fill:var(--navy)">웹 픽셀 경로</text>
<text x="392" y="20" text-anchor="middle" style="font-size:13px; font-weight:700; fill:var(--oxide)">SKAN 포스트백 경로</text>
<rect x="28" y="32" width="200" height="42" style="fill:var(--plate); stroke:var(--rule); stroke-width:1.4"/>
<text x="128" y="58" text-anchor="middle" style="font-size:12.5px; fill:var(--ink)">클릭 로그 (uid, 광고, 시각)</text>
<line x1="128" y1="74" x2="128" y2="96" style="stroke:var(--ink3); stroke-width:1.6" marker-end="url(#privacy4-arr)"/>
<rect x="28" y="100" width="200" height="42" style="fill:var(--plate); stroke:var(--rule); stroke-width:1.4"/>
<text x="128" y="126" text-anchor="middle" style="font-size:12.5px; fill:var(--ink)">구매 픽셀 (uid, 금액)</text>
<line x1="128" y1="142" x2="128" y2="164" style="stroke:var(--ink3); stroke-width:1.6" marker-end="url(#privacy4-arr)"/>
<rect x="28" y="168" width="200" height="42" style="fill:var(--navy-bg); stroke:var(--navy); stroke-width:1.6"/>
<text x="128" y="194" text-anchor="middle" style="font-size:12.5px; fill:var(--ink)">uid 로 조인</text>
<line x1="128" y1="210" x2="128" y2="232" style="stroke:var(--ink3); stroke-width:1.6" marker-end="url(#privacy4-arr)"/>
<rect x="28" y="236" width="200" height="56" style="fill:var(--navy-bg); stroke:var(--navy); stroke-width:2"/>
<text x="128" y="258" text-anchor="middle" style="font-size:12.5px; font-weight:700; fill:var(--ink)">학습 한 줄</text>
<text x="128" y="278" text-anchor="middle" style="font-size:12.5px; fill:var(--ink2)">x = 피처 · y = 1 · 금액 = 34,200</text>
<text x="128" y="318" text-anchor="middle" style="font-size:12.5px; fill:var(--navy)">지연 : 분 단위</text>
<text x="128" y="340" text-anchor="middle" style="font-size:12.5px; fill:var(--navy)">해상도 : 원 단위 그대로</text>
<rect x="292" y="32" width="200" height="42" style="fill:var(--plate); stroke:var(--rule); stroke-width:1.4"/>
<text x="392" y="58" text-anchor="middle" style="font-size:12.5px; fill:var(--ink)">노출·클릭은 우리가 본다</text>
<line x1="392" y1="74" x2="392" y2="96" style="stroke:var(--ink3); stroke-width:1.6; stroke-dasharray:5 4" marker-end="url(#privacy4-arr)"/>
<rect x="292" y="100" width="200" height="42" style="fill:var(--oxide-bg); stroke:var(--oxide); stroke-width:1.6; stroke-dasharray:5 4"/>
<text x="392" y="126" text-anchor="middle" style="font-size:12.5px; fill:var(--ink)">설치·활동은 OS 안에서</text>
<line x1="392" y1="142" x2="392" y2="164" style="stroke:var(--ink3); stroke-width:1.6; stroke-dasharray:5 4" marker-end="url(#privacy4-arr)"/>
<rect x="292" y="168" width="200" height="42" style="fill:var(--oxide-bg); stroke:var(--oxide); stroke-width:1.6"/>
<text x="392" y="194" text-anchor="middle" style="font-size:12.5px; fill:var(--ink)">64칸 값 + 랜덤 지연</text>
<line x1="392" y1="210" x2="392" y2="232" style="stroke:var(--ink3); stroke-width:1.6" marker-end="url(#privacy4-arr)"/>
<rect x="292" y="236" width="200" height="56" style="fill:var(--oxide-bg); stroke:var(--oxide); stroke-width:2"/>
<text x="392" y="258" text-anchor="middle" style="font-size:12.5px; font-weight:700; fill:var(--ink)">캠페인 칸 카운트</text>
<text x="392" y="278" text-anchor="middle" style="font-size:12.5px; fill:var(--ink2)">캠페인 07 · 값 23 · 건수 +1</text>
<text x="392" y="318" text-anchor="middle" style="font-size:12.5px; fill:var(--oxide)">지연 : 3~41일</text>
<text x="392" y="340" text-anchor="middle" style="font-size:12.5px; fill:var(--oxide)">해상도 : 64칸 또는 3칸 또는 없음</text>
</svg>
<figcaption style="margin-top:0.75rem; font-size:0.9rem; color:var(--text-muted)">왼쪽 마지막 상자는 사람 한 명이고 오른쪽 마지막 상자는 칸 하나다. 학습 코드가 읽는 단위가 여기서 갈린다.</figcaption>
</figure>
</div>

**언제 오느냐부터 다르다.** 포스트백은 설치 직후에 오지 않는다. 애플은 설치 뒤 활동을 세 기간으로 나눠 본다. 이 글은 그것을 창 1·창 2·창 3 이라 부른다. 각 창이 닫힌 뒤에 무작위 지연이 또 붙는다. 그래서 창 1 은 3~4일, 창 3 은 최대 41일 뒤에 도착한다.

:::deep 더 깊이 — 창 셋과 무작위 지연의 시각표
8월 12일 설치 한 건이 언제 도착하는지 적어 보면 이렇다.

| 측정 창 | 활동 기간 | 창이 닫히는 날 | 무작위 지연 | 도착 |
|---|---|---|---|---|
| 창 1 | 설치 후 0~2일 | 8월 14일 | 24~48시간 | 8월 15~16일 |
| 창 2 | 설치 후 3~7일 | 8월 19일 | 24~144시간 | 8월 20~25일 |
| 창 3 | 설치 후 8~35일 | 9월 16일 | 24~144시간 | 9월 17~22일 |

창 길이와 지연 폭은 SKAdNetwork 4.0 기준이다. 버전마다 달랐고 애플이 다시 바꿀 수 있다. 그래서 파이프라인에 상수로 박지 말고 설정으로 빼야 한다.
:::

여기서 학습 파이프라인이 처음 걸린다. 같은 설치 한 건이 창마다 한 번씩, 최대 세 번 도착한다. 포스트백 수를 그대로 설치 수로 세면 부풀어 오른다. 어제 도착한 940건도 마찬가지다. 창 1 이 몇 건이고 창 2 가 몇 건인지 나눠 세야 한다. 지연된 라벨을 다루는 일반적인 방법은 [지연 피드백](post.html?id=online-learning-delayed-feedback)에 정리돼 있다.

**얼마나 자세히 오느냐도 규모에 달렸다.** 애플은 설치가 적은 조합에는 값을 덜 준다. 같은 값을 받은 사람이 충분히 많아야 개인이 숨는다는 논리다. 애플은 이 조건을 **군중 익명성(crowd anonymity)** 이라 부른다. 이 캠페인은 소재와 타겟을 조합해 240개를 돌리고 있다. 창 1 포스트백 940건을 조합 규모별로 나누면 이렇다.

| 조합의 하루 전환 | 조합 수 | 전환 합 | 받는 값 |
|---|---|---|---|
| 0~2건 | 162개 | 140건 | 값 없음 |
| 3~9건 | 55개 | 275건 | 값 없음 |
| 10~29건 | 18개 | 270건 | 굵은 값 3단계 |
| 30~99건 | 4개 | 155건 | 굵은 값 3단계 |
| 100건 이상 | 1개 | 100건 | 세밀한 값 64칸 |
| **합계** | **240개** | **940건** | |

조합 수를 더하면 240 이고 전환을 더하면 940 이다. 값을 아예 못 받는 전환이 415건으로 전체의 44% 다. 세밀한 64칸을 받는 것은 100건, 11% 뿐이다. 도입부에서 "415건은 금액 칸까지 비어 있다"고 한 것이 이 줄이다.

등급 규칙의 세부는 버전마다 바뀌었다. 그래도 구조는 같다. **규모가 작으면 해상도가 낮아진다.** 그래서 소재를 잘게 쪼갤수록 성과를 못 본다. 조합 240개 중 값이 오는 것은 23개뿐이다. 나머지 217개는 건수만 온다.

---

## 5. 칸 64개 안에 무엇을 넣을까

**64칸이 모자란 것이 아니다. 칸을 어디에 두느냐가 총매출 추정을 -2.5% 와 -0.1% 로 갈랐다.**

세밀한 전환값은 **6비트**다. 0부터 63까지 칸 64개다. 그 안에 무엇을 담을지는 광고주와 네트워크가 정한다. 설치 여부만 담으면 1칸이면 되고 63칸이 논다. 설치 후 매출을 담으면 64칸이 빠듯하다. 이 선택이 곧 라벨의 해상도가 된다. 전환 확률을 예측하는 모델(pCVR)과 생애가치를 예측하는 모델(pLTV)이 이 라벨로 배운다.

두 가지 스킴을 같은 데이터에 대 본다. 하나는 5,000원 간격으로 자르는 선형 스킴이다. 다른 하나는 로그 간격으로 자르는 스킴이다. 데이터는 이 캠페인 석 달치 구매 20만 건이라고 하자. 중앙값 28,000원짜리 로그정규 분포로 지어냈다.

```python
# 구매 금액을 64칸(6비트)에 접으면 얼마가 남고 얼마가 뭉개지나.
import random, math, statistics

random.seed(3)
N = 200000
MU, SIGMA = math.log(28000), 1.0          # 중앙값 28,000원짜리 구매 분포

amounts = [random.lognormvariate(MU, SIGMA) for _ in range(N)]

def linear(a):
    """5,000원 간격 64칸. 315,000원 이상은 전부 63번 칸."""
    b = min(int(a // 5000), 63)
    return b, b * 5000 + 2500

LO, HI = 1000.0, 1000000.0
STEP = (math.log(HI) - math.log(LO)) / 64

def logscale(a):
    """1,000원~1,000,000원을 로그 간격 64칸으로. 복원값은 칸의 기하 중앙."""
    b = min(max(int((math.log(max(a, LO)) - math.log(LO)) / STEP), 0), 63)
    return b, math.exp(math.log(LO) + (b + 0.5) * STEP)

true_sum = sum(amounts)
cut = sorted(amounts)[int(N * 0.99)]        # 상위 1% 경계
print(f"구매 {N:,}건 · 실제 총매출 {true_sum/1e8:.2f}억원 · "
      f"평균 {true_sum/N:,.0f}원 · 상위 1% 경계 {cut:,.0f}원")

for name, f in (("선형 5천원", linear), ("로그 간격", logscale)):
    est = [f(a)[1] for a in amounts]
    rel = [abs(e - a) / a for e, a in zip(est, amounts)]
    top = [(e, a) for e, a in zip(est, amounts) if a >= cut]
    full = sum(1 for a in amounts if f(a)[0] == 63)
    print(f"{name}: 총매출 {sum(est)/1e8:>5.2f}억원 "
          f"({(sum(est)/true_sum-1)*100:+5.1f}%) · 건당 오차 중앙값 "
          f"{statistics.median(rel)*100:>4.1f}% · 상위 1% 매출 "
          f"{(sum(e for e, _ in top)/sum(a for _, a in top)-1)*100:+6.1f}% · "
          f"마지막 칸 {full/N*100:.2f}%")

# 비교: 전환 여부 1비트만 받는 경우 — 금액은 학습 시점에 하나로 가정할 수밖에 없다
flat = true_sum / N
print(f"1비트(전환 여부)만: 건당 오차 중앙값 "
      f"{statistics.median([abs(flat - a) / a for a in amounts])*100:.1f}%")

# 출력:
# 구매 200,000건 · 실제 총매출 92.29억원 · 평균 46,145원 · 상위 1% 경계 284,231원
# 선형 5천원: 총매출 90.01억원 ( -2.5%) · 건당 오차 중앙값  3.8% · 상위 1% 매출  -26.5% · 마지막 칸 0.77%
# 로그 간격: 총매출 92.18억원 ( -0.1%) · 건당 오차 중앙값  2.7% · 상위 1% 매출   -1.8% · 마지막 칸 0.03%
# 1비트(전환 여부)만: 건당 오차 중앙값 76.4%
```

같은 64칸인데 결과가 갈렸다. 선형 스킴은 총매출을 2.5% 낮게 본다. 로그 스킴은 0.1% 다. 범인은 마지막 칸이다. 선형 스킴에서 315,000원 이상은 전부 63번 칸으로 들어가고, 복원하면 317,500원이 된다. 100만원짜리 구매도 317,500원으로 되돌아온다.

그 마지막 칸에 들어간 구매는 0.77% 뿐이다. 그런데 상위 1% 구매가 전체 매출의 9.2% 를 차지한다. 그 9.2% 를 26.5% 깎으면 총매출이 약 2.4% 줄어든다. 출력의 -2.5% 가 거의 그 값이다. **소수의 큰 구매가 매출을 지고 있으면 상한선의 위치가 곧 리포트의 정확도다.**

1비트만 받는 경우도 같이 찍었다. 건당 오차 중앙값이 76.4% 다. 전환 여부만 알면 금액은 평균 하나로 가정할 수밖에 없고, 그 가정이 이만큼 틀린다. 64칸은 좁지만 1칸보다는 훨씬 낫다. 무엇을 전환으로 셀지 정하는 문제 자체는 [전환 정의](post.html?id=conversion-definition)에서 따로 다뤘다.

:::deep 더 깊이 — 칸을 나누는 세 번째 방법
매출을 그대로 넣지 않고 **모델 예측값의 분위수**로 칸을 나누는 방법도 쓴다. 학습 데이터에서 설치 후 48시간 매출의 64분위 경계를 미리 구해 두고, 그 경계를 스킴으로 쓴다. 분포가 어떻게 생겼든 칸마다 건수가 같아진다.

장점은 칸이 노는 일이 없다는 것이다. 위 선형 스킴은 63개 칸 중 상위 쪽 수십 칸이 거의 비어 있다. 단점은 경계가 학습 데이터에 묶인다는 것이다. 분포가 움직이면 경계도 다시 잡아야 하는데, 스킴을 바꾸면 그 앞뒤 데이터를 나란히 못 쓴다. 스킴 변경일을 따로 기록해 두지 않으면 나중에 아무도 이유를 못 찾는다.
:::

---

## 6. 집계만 있을 때 어떻게 학습하나

**집계 라벨도 참값을 맞힌다. 다만 흔들림이 3.3배라 같은 정밀도까지 데이터가 11배 필요하다.**

라벨이 칸 단위 합계로 왔다고 학습이 불가능해지는 것은 아니다. 줄마다의 정답을 맞히는 대신 **칸마다의 합계**를 맞히게 하면 된다. 손실 함수만 바꾸는 일이다. 칸 하나를 이 절에서는 **가방**이라 부른다. 예를 들어 "캠페인 07, 8월 12일, 지면 A" 가 가방 하나다. 그 가방 안에 노출이 500건 있었고 전환이 몇 건이었는지만 안다. 이 방식의 이름은 **라벨 비율 학습(learning from label proportions)** 이다.

개인 라벨의 손실은 줄마다 정답과 예측을 비교한다. 집계 라벨의 손실은 가방마다 예측의 합과 관측된 합을 비교한다. 가방마다 피처 구성비가 다르면 그 차이에서 계수가 복원된다. 모든 가방의 구성비가 똑같으면 복원이 안 된다. 그래서 칸을 어떻게 자르느냐가 학습 가능 여부를 좌우한다.

아래 실험은 같은 데이터를 두 방식으로 학습해 계수의 흔들림을 잰다. 참값은 절편 -3.0, 계수 1.2 와 0.8 이다. 가방은 40개이고 각 가방에 500줄이 들어 있다. 같은 실험을 30번 반복한다.

```python
# 집계 라벨(캠페인 합계)만으로 배운 계수는 개인 라벨로 배운 계수보다 얼마나 흔들리나.
import random, math, statistics

random.seed(7)
TRUE = (-3.0, 1.2, 0.8)          # 절편, x1(리타겟 여부), x2(고관여 지면)
CELLS = [(0, 0), (0, 1), (1, 0), (1, 1)]

def sigmoid(z):
    return 1.0 / (1.0 + math.exp(-z))

def make_bags(n_bags=40, per_bag=500):
    """가방 하나 = 캠페인 하루치. 가방마다 피처 구성비가 다르다."""
    bags = []
    for _ in range(n_bags):
        r1, r2 = random.uniform(0.1, 0.9), random.uniform(0.1, 0.9)
        cnt = {c: 0 for c in CELLS}
        pos = {c: 0 for c in CELLS}
        for _ in range(per_bag):
            x1 = 1 if random.random() < r1 else 0
            x2 = 1 if random.random() < r2 else 0
            p = sigmoid(TRUE[0] + TRUE[1] * x1 + TRUE[2] * x2)
            cnt[(x1, x2)] += 1
            pos[(x1, x2)] += 1 if random.random() < p else 0
        bags.append((cnt, pos))
    return bags

def fit_individual(bags, steps=800, lr=4.0):
    """개인 라벨: 줄마다 y가 있다. 표준 로지스틱 회귀."""
    w = [0.0, 0.0, 0.0]
    n = sum(sum(c.values()) for c, _ in bags)
    for _ in range(steps):
        g = [0.0, 0.0, 0.0]
        for cnt, pos in bags:
            for (x1, x2) in CELLS:
                p = sigmoid(w[0] + w[1] * x1 + w[2] * x2)
                e = p * cnt[(x1, x2)] - pos[(x1, x2)]
                g[0] += e; g[1] += e * x1; g[2] += e * x2
        for j in range(3):
            w[j] -= lr * g[j] / n
    return w

def fit_aggregate(bags, steps=8000, lr=4.0):
    """집계 라벨: 가방마다 전환 '합계'만 있다. 합계를 맞추도록 민다."""
    w = [0.0, 0.0, 0.0]
    nb = len(bags)
    for _ in range(steps):
        g = [0.0, 0.0, 0.0]
        for cnt, pos in bags:
            m = sum(cnt.values())
            s = sum(sigmoid(w[0] + w[1] * x1 + w[2] * x2) * cnt[(x1, x2)]
                    for (x1, x2) in CELLS)
            d = (s - sum(pos.values())) / m          # 가방 하나의 오차(비율)
            for (x1, x2) in CELLS:
                p = sigmoid(w[0] + w[1] * x1 + w[2] * x2)
                q = d * p * (1 - p) * cnt[(x1, x2)] / m
                g[0] += q; g[1] += q * x1; g[2] += q * x2
        for j in range(3):
            w[j] -= lr * g[j] / nb
    return w

ind, agg = [], []
for _ in range(30):                                  # 같은 실험을 30번
    bags = make_bags()
    ind.append(fit_individual(bags))
    agg.append(fit_aggregate(bags))

for name, res in (("개인 라벨", ind), ("집계 라벨", agg)):
    for j, label in enumerate(("절편", "x1", "x2")):
        col = [r[j] for r in res]
        print(f"{name} {label}: 평균 {statistics.mean(col):+.3f} "
              f"(참값 {TRUE[j]:+.1f}) · 표준편차 {statistics.pstdev(col):.3f}")

r = [statistics.pstdev([a[j] for a in agg]) / statistics.pstdev([i[j] for i in ind])
     for j in range(3)]
print("표준편차 배수(집계÷개인):", " ".join(f"{x:.1f}배" for x in r))
print("같은 흔들림까지 줄이려면 데이터가:", " ".join(f"{x*x:.0f}배" for x in r))

# 출력:
# 개인 라벨 절편: 평균 -2.999 (참값 -3.0) · 표준편차 0.036
# 개인 라벨 x1: 평균 +1.210 (참값 +1.2) · 표준편차 0.040
# 개인 라벨 x2: 평균 +0.795 (참값 +0.8) · 표준편차 0.045
# 집계 라벨 절편: 평균 -3.015 (참값 -3.0) · 표준편차 0.120
# 집계 라벨 x1: 평균 +1.219 (참값 +1.2) · 표준편차 0.132
# 집계 라벨 x2: 평균 +0.808 (참값 +0.8) · 표준편차 0.117
# 표준편차 배수(집계÷개인): 3.3배 3.3배 2.6배
# 같은 흔들림까지 줄이려면 데이터가: 11배 11배 7배
```

읽어야 할 것은 두 줄이다. 첫째, 집계 라벨의 평균도 참값과 맞는다. x1 은 1.219 이고 참값은 1.2 다. **집계는 계수를 비틀지 않는다.** 둘째, 표준편차가 0.040 에서 0.132 로 커졌다. 3.3배다.

표준편차는 데이터 양의 제곱근에 반비례한다. 3.3배를 되돌리려면 데이터가 3.3의 제곱, 곧 11배 필요하다. 이것이 표본효율이 나쁘다는 말의 실제 크기다. 하루치로 개인 라벨만큼 배우려면 11일치를 모아야 한다. 그런데 11일이 지나면 소재도 예산도 이미 바뀌어 있다.

여기에 4절의 지연이 겹친다. 집계 라벨은 3일 늦게 오고, 그것을 11배 모아야 한다. 그래서 SKAN 경로의 모델은 개인 라벨 경로의 모델보다 **구조적으로 굼뜨다**. 실무에서는 그래서 SKAN 라벨로 모델 전체를 학습하지 않는다. 웹·자사 앱의 개인 라벨로 본체를 학습하고, SKAN 집계는 캠페인 단위 보정에만 쓴다.

:::deep 더 깊이 — 가방 손실의 형태
가방 $b$ 안의 노출을 $i \in b$ 라 하고, 관측된 전환 합계를 $K_b$ 라 하자. 예측 확률은 $\sigma(w^\top x_i)$ 다. 가방 손실은 예측의 합과 관측 합의 차이다.

$$\mathcal{L}(w) = \sum_{b} \Big( \sum_{i \in b} \sigma(w^\top x_i) - K_b \Big)^2$$

개인 라벨의 로그 손실과 견주면 정보가 어디서 줄었는지 보인다. 로그 손실은 줄 하나마다 항이 하나다. 가방 손실은 가방 하나마다 항이 하나다. 위 코드에서 항이 20,000개에서 40개로 줄었다.

$K_b$ 에 노이즈가 얹혀 오면 항을 하나 더 붙인다. 노이즈 분산 $\sigma_b^2$ 를 아는 경우 가방마다 가중치를 $1/\sigma_b^2$ 로 준다. 큰 칸을 더 믿고 작은 칸을 덜 믿는다는 뜻이고, 7절의 상대 오차 표가 그 가중치의 근거가 된다.
:::

---

## 7. 노이즈는 작은 광고부터 지운다

**노이즈는 절대량으로 붙는다. 전환 40건짜리는 상대 오차 70.7%, 4,000건짜리는 0.71% 다.**

집계 리포트가 개인을 숨기는 두 번째 장치가 노이즈다. 칸마다 무작위 값을 더해 내보낸다. 이 장치를 **차등 프라이버시 노이즈**라 부른다. 얼마나 더할지는 프라이버시 예산이 정한다. 여기서는 라플라스 분포에서 스케일 20 으로 뽑는다. 평균 절대 오차가 20건이고 표준편차가 28.3건이다.

핵심은 **노이즈가 칸의 크기와 무관하게 같은 크기로 붙는다**는 것이다. 전환 40건 칸에도 28.3 이 붙고 4,000건 칸에도 28.3 이 붙는다. 그래서 상대 오차가 100배 갈린다.

```python
# 집계 리포트에 노이즈를 더하면 광고 규모별로 오차가 어떻게 남나.
import random, math, statistics

random.seed(11)
SCALE = 20.0        # 라플라스 노이즈 스케일 b. 프라이버시 예산이 정한다
TRIALS = 20000
SUPPRESS = 50       # 이 값 미만이면 리포트가 칸을 지운다(임계 억제)

def laplace(b):
    """평균 0, 표준편차 b*sqrt(2) 인 라플라스 노이즈 한 개."""
    u = random.random() - 0.5
    return -b * math.copysign(1.0, u) * math.log(1.0 - 2.0 * abs(u))

sd = SCALE * math.sqrt(2)
print(f"노이즈 스케일 b={SCALE:.0f} → 평균 절대 오차 {SCALE:.0f}건 · 표준편차 {sd:.1f}건")
print(f"{'참 전환':>7} {'평균오차%':>9} {'상대SD%':>8} {'억제율%':>7} {'7일합산 상대SD%':>13}")

for n in (10, 40, 120, 400, 1200, 4000):
    err, sup, wk = [], 0, []
    for _ in range(TRIALS):
        noisy = n + laplace(SCALE)
        err.append(abs(noisy - n) / n)
        if noisy < SUPPRESS:
            sup += 1
        # 7일치 합계: 신호는 7배가 되고 노이즈는 7개가 더해진다
        wk.append(sum(laplace(SCALE) for _ in range(7)) / (7 * n))
    print(f"{n:>7,} {statistics.mean(err)*100:>9.1f} {sd/n*100:>8.1f} "
          f"{sup/TRIALS*100:>7.1f} {statistics.pstdev(wk)*100:>13.1f}")

# 두 광고를 비교할 때: 차이에는 노이즈가 두 번 실린다
d = sd * math.sqrt(2)
print(f"\n두 칸의 차이에 실리는 노이즈 표준편차: {d:.1f}건")
for n in (40, 4000):
    gap = 0.05 * n
    print(f"  전환 {n:,}건에서 5% 차이 = {gap:.0f}건 → 노이즈의 {gap/d:.2f}배")

# 출력:
# 노이즈 스케일 b=20 → 평균 절대 오차 20건 · 표준편차 28.3건
#     참 전환     평균오차%    상대SD%    억제율%    7일합산 상대SD%
#      10     200.3    282.8    93.6         106.9
#      40      50.1     70.7    69.5          26.6
#     120      16.6     23.6     1.6           8.9
#     400       5.1      7.1     0.0           2.7
#   1,200       1.7      2.4     0.0           0.9
#   4,000       0.5      0.7     0.0           0.3
#
# 두 칸의 차이에 실리는 노이즈 표준편차: 40.0건
#   전환 40건에서 5% 차이 = 2건 → 노이즈의 0.05배
#   전환 4,000건에서 5% 차이 = 200건 → 노이즈의 5.00배
```

<div class="table-wrapper">
<figure style="text-align:center; margin:2rem 0;">
<svg viewBox="0 0 500 214" role="img" aria-label="같은 길이로 그린 막대 둘. 위쪽 전환 40건 막대에는 오차 범위가 막대 폭의 일곱 배로 붙고, 아래쪽 4,000건 막대에는 거의 보이지 않는 폭으로 붙는다." style="width:100%; max-width:500px; height:auto; font-family:var(--font-sans)">
<text x="10" y="22" style="font-size:12.5px; fill:var(--ink3)">막대 길이는 둘 다 같게 그렸다. 붙은 오차 범위만 비교한다</text>
<text x="10" y="56" style="font-size:13px; font-weight:700; fill:var(--ink)">전환 40건</text>
<rect x="120" y="42" width="200" height="20" style="fill:var(--oxide-bg); stroke:var(--oxide); stroke-width:1.6"/>
<line x1="120" y1="78" x2="461" y2="78" style="stroke:var(--oxide); stroke-width:2.4"/>
<line x1="120" y1="70" x2="120" y2="86" style="stroke:var(--oxide); stroke-width:2.4"/>
<line x1="461" y1="70" x2="461" y2="86" style="stroke:var(--oxide); stroke-width:2.4"/>
<text x="290" y="100" text-anchor="middle" style="font-size:12.5px; fill:var(--oxide)">오차 범위 ±28.3건 = 막대의 ±70.7%</text>
<line x1="10" y1="120" x2="490" y2="120" style="stroke:var(--rule); stroke-width:1"/>
<text x="10" y="152" style="font-size:13px; font-weight:700; fill:var(--ink)">전환 4,000건</text>
<rect x="120" y="138" width="200" height="20" style="fill:var(--navy-bg); stroke:var(--navy); stroke-width:1.6"/>
<line x1="219" y1="174" x2="222" y2="174" style="stroke:var(--navy); stroke-width:2.4"/>
<line x1="219" y1="166" x2="219" y2="182" style="stroke:var(--navy); stroke-width:2.4"/>
<line x1="222" y1="166" x2="222" y2="182" style="stroke:var(--navy); stroke-width:2.4"/>
<text x="290" y="196" text-anchor="middle" style="font-size:12.5px; fill:var(--navy)">오차 범위 ±28.3건 = 막대의 ±0.71%</text>
</svg>
<figcaption style="margin-top:0.75rem; font-size:0.9rem; color:var(--text-muted)">같은 노이즈가 붙었는데 위쪽 막대는 어디까지가 진짜인지 알 수 없다.</figcaption>
</figure>
</div>

억제율 칸이 두 번째 문제다. 이 예시는 노이즈를 더한 값이 50 미만이면 칸을 지운다고 뒀다. 전환 40건짜리 칸은 69.5% 의 날에 지워진다. 리포트가 사흘에 이틀은 빈칸으로 온다는 뜻이다. 빈칸은 0 이 아니다. 0 으로 채워 학습하면 그 소재의 전환율이 실제보다 낮게 잡힌다.

7일 합산 칸은 대응책 하나를 보여 준다. 신호는 7배가 되고 노이즈는 제곱근 7배만 커진다. 40건짜리의 상대 표준편차가 70.7% 에서 26.6% 로 내려간다. 대가는 시간 해상도다. 어제 올린 소재가 좋았는지 나쁜지는 일주일 뒤에 안다. 이 맞바꿈은 [모델 A/B 테스트](post.html?id=model-ab-testing)의 표본 크기 계산과 같은 구조다.

마지막 두 줄이 실무에서 제일 아프다. 두 칸을 비교하면 노이즈가 두 번 실려 표준편차가 40.0건이 된다. 전환 40건 규모에서 5% 차이는 2건이고 노이즈의 0.05배다. 영원히 안 보인다. 4,000건 규모에서 5% 차이는 200건이고 노이즈의 5배다. 이틀이면 보인다. **작은 캠페인은 최적화가 느려지는 것이 아니라 최적화 자체가 멈춘다.**

<div class="demo-embed-wrap">
<iframe class="demo-embed" src="demo-signal-loss.html?embed=1" height="1200" loading="lazy" title="신호 소실 미니 데모 — 노이즈와 집계가 지표를 어디까지 지우나"></iframe>
<a class="demo-embed-open" href="demo-signal-loss.html" target="_blank" rel="noopener">↗ 전체 데모로 열기</a>
</div>

---

## 8. 빈도 상한과 중복 제거가 먼저 무너진다

**같은 사람인지 모르면 노출의 47.6% 가 이미 다섯 번 넘게 본 사람에게 간다.**

3층은 모델 밖의 규칙이다. 규칙은 셋이다. 빈도 상한은 같은 사람에게 하루 다섯 번까지만 보여 준다. 중복 제거는 같은 구매를 두 번 세지 않는다. 제외 목록은 이미 산 사람을 뺀다. 셋 다 "이 요청이 아까 그 사람인가"를 판정할 수 있어야 돈다.

이 캠페인의 iOS 앱 지면 노출 420만 건을 사람별로 세어 봤다고 하자. 순 사용자는 60만 명이고 평균 7.0회다. 아래는 그 분포를 지어낸 것이다.

| 하루 노출 횟수 | 사용자 수 | 평균 횟수 | 노출 합 | 상한 5회 적용 시 |
|---|---|---|---|---|
| 1~2회 | 180,000명 | 1.5 | 270,000 | 270,000 |
| 3~5회 | 168,000명 | 4.0 | 672,000 | 672,000 |
| 6~10회 | 132,000명 | 8.0 | 1,056,000 | 660,000 |
| 11~20회 | 90,000명 | 14.0 | 1,260,000 | 450,000 |
| 21~40회 | 24,000명 | 27.0 | 648,000 | 120,000 |
| 41회 이상 | 6,000명 | 49.0 | 294,000 | 30,000 |
| **합계** | **600,000명** | **7.0** | **4,200,000** | **2,202,000** |

사용자 수를 더하면 60만이고 노출을 더하면 420만이다. 상한 5회를 걸면 220만 2천 건만 남는다. 즉 노출의 47.6% 가 잘린다. 식별자가 없으면 그 47.6% 를 그대로 내보낸다. 그 자리에 새 사람을 채웠다면 도달이 늘었을 예산이다.

더 아픈 줄은 아래 두 줄이다. 사용자의 5%(3만 명)가 노출의 22.4%(94만 2천 건)를 가져간다. 이 3만 명은 41회, 27회씩 같은 광고를 본다. 광고주 눈에는 노출 수가 채워졌지만 도달은 늘지 않는다. 그리고 이 3만 명은 대체로 앱을 오래 켜 두는 사람들이라 클릭도 잘 안 한다.

중복 제거도 같이 무너진다. [pCVR 모델링](post.html?id=pcvr-modeling)이 다룬 것처럼, 같은 구매가 두 경로로 들어오면 하나로 접어야 한다. 접는 열쇠가 사용자 식별자와 주문번호다. SKAN 포스트백에는 둘 다 없다. 그래서 포스트백 두 건이 같은 사람의 두 번째 구매인지 서로 다른 두 사람인지 판정할 방법이 없다.

**3층은 대체 신호로 못 메운다.** 1층에서는 문맥 피처가 자리를 일부 채웠다. 2층에서는 학습 방법을 바꿔 버텼다. 3층은 판정이 되거나 안 되거나 둘 중 하나다. 그래서 실무에서는 3층을 포기하지 않고 **판정이 되는 구간으로 예산을 옮긴다**. 로그인 지면, 자사 앱, 광고주 1st-party 결합이 그 구간이다.

---

## 9. 담장 안이 덜 다치는 이유와 그래도 잃는 것 [무대: 닫힌 생태계]

**로그인 ID 는 1st-party 라 그대로 남는다. 대신 담장 밖에서 끝나는 전환 37.5% 는 같이 잃는다.**

담장 안이 덜 다치는 이유는 구조 하나로 설명된다. **우리가 쓰는 식별자가 남의 것이 아니라 우리 것이기 때문이다.** 로그인 ID 는 사용자가 우리 서비스에 직접 준 값이다. 서드파티 쿠키가 아니고 OS 광고 식별자도 아니다. 브라우저가 차단하는 대상도 아니다. 앱 추적 동의 팝업의 대상도 아니다. 이 구조는 [담장 안 생태계](post.html?id=walled-garden)에서 더 자세히 다뤘다.

그래서 3절 표의 담장 안 열이 -0.012 에 그쳤다. 잃은 것은 외부에서 사 오던 세그먼트뿐이고, 자사 행동 이력은 그대로다. 노출·클릭도 우리 서버가 직접 본다. 노출 라벨과 클릭 라벨은 아예 안 다친다.

**하지만 전환 라벨은 다르다.** 전환의 절반쯤은 우리 담장 밖에서 끝난다. 설치를 대신 재 주는 회사를 측정 파트너(MMP)라 부른다. 광고주 앱의 전환은 그 회사를 거쳐 온다. 이 캠페인의 웹 지면 전환 3,120건을 나눠 보면 이렇다.

| 전환이 끝나는 곳 | 건수 | 어떻게 알게 되나 | 신호 상태 |
|---|---|---|---|
| 자사 서비스 안 (앱 내 구매) | 1,950건 | 우리 로그에 그대로 | 온전하다 |
| 광고주 사이트 (픽셀 경유) | 780건 | 쿠키·픽셀로 잇는다 | 좁아지는 중 |
| 광고주 앱 (측정 파트너 경유) | 270건 | 포스트백으로 온다 | 집계로 바뀐다 |
| 오프라인 매장 | 120건 | 광고주가 나중에 올린다 | 지연·부분 |
| **합계** | **3,120건** | | |

1,950 + 780 + 270 + 120 은 3,120 이다. 자사 완결이 62.5% 이고 나머지 37.5% 가 담장 밖이다. 그 37.5% 는 열린 RTB 와 똑같은 문제를 겪는다. 픽셀이 안 붙고, 포스트백이 늦게 오고, 오프라인은 아예 며칠 뒤 파일로 온다.

그러니 "담장 안은 안전하다"는 문장은 틀렸다. 정확히는 **층마다 다르다**. 1층 타겟팅 피처는 거의 안전하다. 3층 빈도 제어는 자사 지면 안에서만 안전하다. 2층 전환 라벨은 전환이 어디서 끝나느냐에 달렸다. 자사 완결 전환이 많은 광고주는 멀쩡하고, 외부 전환에 기대는 광고주는 열린 RTB 와 같은 처지다.

한 가지 더 있다. 담장 안은 자기 담장 안만 본다. 사용자가 다른 앱에서 무엇을 했는지는 원래도 몰랐고 앞으로도 모른다. 식별자가 넉넉하던 시절에는 그 부분을 외부 데이터로 메웠다. 그 외부 데이터가 사라지면 담장 안의 시야는 **넓어지지 않고 그대로 굳는다**. 담장 안이 상대적으로 유리해지는 것은 남이 더 많이 잃기 때문이지 우리가 더 얻어서가 아니다.

---

## 10. 그래서 무엇을 바꾸나 [무대: 공통]

**모델링 단위를 사람에서 요청으로 내린다. 그리고 성과 판정을 지표에서 실험으로 옮긴다.**

앞 절들이 잰 손실을 그대로 두면 모델은 계속 나빠진다. 대응은 네 방향으로 갈린다. 각각 비용이 다르니 표로 먼저 놓는다.

| 대응 | 무엇을 하나 | 어느 층을 메우나 | 비용 |
|---|---|---|---|
| 문맥 피처 강화 | 지면·시간·소재·문서 내용을 잘게 판다 | 1층 | 피처 수가 늘어 서빙 지연이 는다 |
| 1st-party 결합 | 광고주 서버와 서버 간 전송으로 잇는다 | 1·2층 | 계약·보안 검토가 오래 걸린다 |
| 모델링 단위 하향 | 사람이 아니라 요청·지면 단위로 학습한다 | 1·3층 | 개인화 상한이 낮아진다 |
| 증분 실험 확대 | 지표 대신 무작위 실험으로 판정한다 | 2층 | 트래픽의 일부를 비워야 한다 |

**모델링 단위를 내리는 것부터 설명한다.** 예전 피처 벡터에는 "이 사람이 최근 30일에 본 카테고리"가 들어 있었다. 그 자리에 "이 지면에서 최근 1시간 동안의 카테고리별 CTR" 같은 값을 넣는다. 사람 단위 상태가 요청 단위 통계로 바뀐다. 개인화는 얕아지지만 식별자가 없어도 계속 돈다. [피처 스토어](post.html?id=feature-store-serving) 쪽에서 보면 키가 사용자 ID 에서 지면 ID 로 바뀌는 일이다.

**1st-party 결합은 가장 값이 크지만 가장 느리다.** 광고주가 자기 서버에서 전환을 우리 서버로 직접 보낸다. 브라우저를 거치지 않으니 쿠키 정책과 무관하다. 잇는 열쇠는 양쪽이 미리 합의한 값이다. 대신 계약과 보안 검토가 필요하고, 광고주 개발팀의 일감이 된다. 큰 광고주는 되고 작은 광고주는 안 되는 경우가 많다.

**증분 실험이 마지막 안전망이다.** 광고를 아예 안 보여 준 집단과 견줘 차이를 재는 방법이다. 어트리뷰션 리포트는 신호가 좁아질수록 못 믿게 된다. 그런데 무작위 실험은 식별자가 없어도 성립한다. 지역 단위나 시간 단위로 나눠 광고를 껐다 켜면 되기 때문이다. [인과추론 입문](post.html?id=causal-inference-101)과 [어트리뷰션 입문](post.html?id=attribution-basics)이 그 차이를 다뤘다. 신호가 줄어드는 시대에 실험 비중이 늘어나는 이유가 이것이다.

순서도 정해 둔다. 제일 먼저 할 것은 대응이 아니라 **계측**이다. 어느 층이 얼마나 상했는지 모르면 잘못된 곳에 돈을 쓴다. 3절의 AUC 표, 4절의 등급 표, 7절의 억제율 표가 그 계측이다. 세 표를 자기 데이터로 채우는 데서 시작해야 한다.

---

## 한눈 정리

| 층 | 잃는 것 | 크기(이 글의 가데이터) | 대응 | 회복 정도 |
|---|---|---|---|---|
| 1층 타겟팅 피처 | 크로스 사이트·앱 행동 | 열린 RTB AUC -0.068, 담장 안 -0.012 | 문맥 피처·1st-party | 부분 회복 |
| 2층 전환 라벨 (해상도) | 금액의 세밀도 | 64칸 스킴에 따라 총매출 -2.5% 또는 -0.1% | 스킴을 로그 간격으로 | 거의 회복 |
| 2층 전환 라벨 (개인성) | 줄 단위 정답 | 계수 표준편차 3.3배, 데이터 11배 필요 | 가방 손실·가중치 | 데이터로 메움 |
| 2층 전환 라벨 (노이즈) | 작은 칸의 값 | 40건에서 상대 오차 70.7%, 억제율 69.5% | 칸 합치기·기간 합산 | 시간과 맞바꿈 |
| 2층 전환 라벨 (지연) | 최신성 | 창 1 도 3~4일, 창 3 은 최대 41일 | 창별로 나눠 세기 | 못 회복 |
| 3층 빈도 제어 | 빈도 상한·중복 제거 | 상한 5회면 노출의 47.6% 가 초과분 | 판정 되는 지면으로 예산 이동 | 거의 못 회복 |

---

## 헷갈리기 쉬운 점

- **노이즈는 편향이 아니다.** 6절 출력에서 집계 라벨의 평균은 참값과 맞았다. 틀어지는 것은 평균이 아니라 흔들림이다. 그래서 "보정하면 되지 않나"가 안 통한다. 흔들림은 데이터를 더 모아야만 줄어든다.
- **값이 비는 것과 칸이 지워지는 것은 다르다.** SKAN 은 규모가 작으면 포스트백을 보내되 전환값을 비운다. 집계 리포트의 임계 억제는 칸 자체를 지운다. 앞은 분모가 남고 뒤는 분모까지 없어진다.
- **빈칸을 0 으로 채우면 안 된다.** 7절에서 40건짜리 칸은 69.5% 의 날에 지워졌다. 그 날들을 0 으로 채우면 전환율이 3분의 1로 보인다. 빈칸은 결측으로 다뤄야 한다.
- **포스트백 수는 설치 수가 아니다.** 창이 셋이라 같은 설치가 최대 세 번 온다. 창 구분 없이 세면 부푼다.
- **서드파티 쿠키와 1st-party 쿠키를 같은 말로 쓰지 말 것.** 사라지는 것은 앞쪽이다. 우리 도메인이 우리 사이트에 심는 쿠키는 남는다.
- **6비트가 부족한 것이 아니라 칸의 위치가 문제다.** 5절에서 같은 64칸으로 총매출 오차가 -2.5% 와 -0.1% 로 갈렸다. 칸을 늘려 달라고 요구하기 전에 스킴부터 고쳐야 한다.
- **AUC 하락폭이 매출 하락폭은 아니다.** 경쟁자도 같이 눈이 어두워진다. 매출 영향은 실험으로만 잰다.
- **"담장 안은 안전하다"는 층별로 갈린다.** 9절 표에서 자사 완결 전환은 62.5% 이고 나머지는 열린 RTB 와 같은 문제를 겪는다.

---

## 더 깊이 보기

- [어트리뷰션 입문 — 누구 공로인가](post.html?id=attribution-basics) — 이 글이 다룬 라벨이 원래 어떻게 만들어지는지
- [담장 안 생태계 vs 열린 RTB](post.html?id=walled-garden) — 1st-party 식별자가 왜 안 사라지는지
- [전환 정의 — 무엇을 전환으로 셀까](post.html?id=conversion-definition) — 64칸에 무엇을 넣을지의 앞 단계
- [pCVR 모델링 — 중복과 지연](post.html?id=pcvr-modeling) — 중복 제거와 지연 라벨의 기본
- [오디언스 세그멘테이션](post.html?id=audience-segmentation) — 3rd-party 세그먼트가 하던 일
- [지연 피드백과 온라인 학습](post.html?id=online-learning-delayed-feedback) — 라벨이 늦게 올 때의 학습
- [인과추론 입문](post.html?id=causal-inference-101) — 지표 대신 실험으로 판정하기
- [무작위 실험(RCT)](post.html?id=rct-randomized-experiment) — 증분 실험의 설계
- [CTR 피처 엔지니어링](post.html?id=ctr-feature-engineering) — 문맥 피처로 메우는 방법
- [피처 스토어와 서빙](post.html?id=feature-store-serving) — 모델링 단위를 바꾸면 키가 바뀐다
