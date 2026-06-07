집을 짓는다고 해봅시다. 원룸으로 지을 수도, 층층이 나눈 빌딩으로 지을 수도, 아니면 작은 집 여러 채를 모은 타운하우스로 지을 수도 있어요. **목적과 상황에 따라 '짜맞추는 방식'이 달라집니다.**

소프트웨어도 똑같아요. 코드를 어떻게 나누고, 어떤 조각이 어떤 조각과 어떻게 대화하게 할지 — 이 큰 그림을 **아키텍처(architecture)**라고 부릅니다. 그리고 자주 쓰여서 이름이 붙은 정형화된 설계도들을 **아키텍처 패턴**이라고 해요.

> 한 줄 비유: 아키텍처 패턴은 **'집 짓는 방식'의 모음집**이다. 정답은 없고, 상황에 맞는 선택만 있다.

이 글에서는 가장 자주 등장하는 6가지 — **이벤트 기반, 계층형, 모놀리식, 마이크로서비스, MVC, 마스터-슬레이브** — 를 일상 비유와 그림으로 하나씩 풀어봅니다. 용어는 낯설어도 아이디어는 다 우리 주변에 있는 것들이에요.

---

## 1. 이벤트 기반 (Event-Driven) — "단톡방 공지"

> 비유: 반장이 단톡방에 "내일 소풍 갑니다" 한 줄 올린다. 누가 읽고 무엇을 하는지는 각자 알아서. 반장은 신경 쓰지 않는다.

이벤트 기반은 조각들이 **직접 서로를 부르지 않고, '사건(이벤트)'으로 대화**하는 방식입니다.

가운데에 **이벤트 브로커**라는 게시판이 있어요. 한쪽(생산자, producer)은 "결제 완료!", "주문 취소!" 같은 사건을 게시판에 던집니다. 누가 받을지는 신경 쓰지 않아요. 그 사건에 관심 있는 쪽(소비자, consumer)들이 알아서 가져다 처리합니다.

<figure style="text-align:center; margin:2rem 0;">
<svg viewBox="0 0 640 250" role="img" aria-label="이벤트 생산자가 이벤트 브로커에 사건을 던지면, 브로커에 쌓인 사건을 여러 소비자가 알아서 가져가 처리한다." style="width:100%; max-width:600px; height:auto; font-family:var(--font-sans)">
<defs>
<marker id="ed-arr" markerWidth="10" markerHeight="10" refX="8" refY="3" orient="auto"><path d="M0,0 L8,3 L0,6 Z" style="fill:var(--accent-primary)"/></marker>
</defs>
<rect x="14" y="96" width="120" height="58" rx="9" style="fill:var(--bg-tertiary); stroke:var(--accent-primary); stroke-width:1.8"/>
<text x="74" y="120" text-anchor="middle" style="font-size:13px; font-weight:700; fill:var(--accent-primary)">생산자</text>
<text x="74" y="138" text-anchor="middle" style="font-size:11px; fill:var(--text-muted)">Producer</text>
<line x1="134" y1="125" x2="200" y2="125" style="stroke:var(--accent-primary); stroke-width:2" marker-end="url(#ed-arr)"/>
<rect x="206" y="26" width="180" height="198" rx="10" style="fill:var(--bg-secondary); stroke:var(--accent-primary); stroke-width:1.8"/>
<text x="296" y="47" text-anchor="middle" style="font-size:12px; font-weight:700; fill:var(--accent-primary)">이벤트 브로커</text>
<rect x="226" y="60" width="140" height="32" rx="6" style="fill:var(--bg-tertiary); stroke:var(--border-color); stroke-width:1.2"/>
<text x="296" y="80" text-anchor="middle" style="font-size:12px; fill:var(--text-primary)">Event 1</text>
<rect x="226" y="100" width="140" height="32" rx="6" style="fill:var(--bg-tertiary); stroke:var(--border-color); stroke-width:1.2"/>
<text x="296" y="120" text-anchor="middle" style="font-size:12px; fill:var(--text-primary)">Event 2</text>
<text x="296" y="150" text-anchor="middle" style="font-size:15px; fill:var(--text-muted)">⋮</text>
<rect x="226" y="164" width="140" height="32" rx="6" style="fill:var(--bg-tertiary); stroke:var(--border-color); stroke-width:1.2"/>
<text x="296" y="184" text-anchor="middle" style="font-size:12px; fill:var(--text-primary)">Event N</text>
<rect x="468" y="38" width="158" height="44" rx="9" style="fill:var(--bg-tertiary); stroke:var(--border-color); stroke-width:1.5"/>
<text x="547" y="65" text-anchor="middle" style="font-size:13px; fill:var(--text-primary)">소비자 A</text>
<rect x="468" y="103" width="158" height="44" rx="9" style="fill:var(--bg-tertiary); stroke:var(--border-color); stroke-width:1.5"/>
<text x="547" y="130" text-anchor="middle" style="font-size:13px; fill:var(--text-primary)">소비자 B</text>
<rect x="468" y="168" width="158" height="44" rx="9" style="fill:var(--bg-tertiary); stroke:var(--border-color); stroke-width:1.5"/>
<text x="547" y="195" text-anchor="middle" style="font-size:13px; fill:var(--text-primary)">소비자 C</text>
<line x1="386" y1="80" x2="462" y2="62" style="stroke:var(--accent-primary); stroke-width:1.8" marker-end="url(#ed-arr)"/>
<line x1="386" y1="125" x2="462" y2="125" style="stroke:var(--accent-primary); stroke-width:1.8" marker-end="url(#ed-arr)"/>
<line x1="386" y1="170" x2="462" y2="188" style="stroke:var(--accent-primary); stroke-width:1.8" marker-end="url(#ed-arr)"/>
</svg>
<figcaption style="margin-top:0.75rem; font-size:0.9rem; color:var(--text-muted)">생산자는 '사건'만 던지고 누가 받는지 모른다. 관심 있는 소비자들이 알아서 가져가 처리한다 — 서로 느슨하게 연결된다.</figcaption>
</figure>

생산자와 소비자가 서로를 몰라도 되니, 한쪽을 바꾸거나 새 소비자를 추가해도 다른 쪽이 영향을 안 받아요. 이걸 **느슨한 결합(loose coupling)**이라고 합니다.

**좋을 때** — 알림·결제·로그처럼 "한 사건 → 여러 처리"가 많을 때, 트래픽이 갑자기 몰려도 게시판(큐)이 완충해 줍니다. **조심할 점** — 흐름이 눈에 안 보여서, "이 사건이 누구를 거쳐 어디로 갔지?" 추적이 어려워요.

---

## 2. 계층형 (Layered) — "회사 결재 라인"

> 비유: 사원이 결재를 올리면 대리 → 과장 → 부장 순서로 한 층씩 올라간다. 사원이 부장에게 바로 가지 않는다.

계층형은 시스템을 **책임이 다른 층(layer)으로 위아래 쌓는** 방식입니다. 각 층은 **바로 아래층하고만** 대화해요.

보통 이렇게 나눕니다. 맨 위 **화면(Presentation)** 층은 사용자에게 보이는 부분, **비즈니스(Business)** 층은 "할인은 얼마" 같은 실제 로직, **데이터 접근(Data Access)** 층은 DB와 대화하는 통로, **영속성(Persistence)** 층은 데이터를 실제로 저장하는 곳입니다.

<figure style="text-align:center; margin:2rem 0;">
<svg viewBox="0 0 560 292" role="img" aria-label="화면, 비즈니스, 데이터 접근, 영속성 네 개 층이 위에서 아래로 쌓여 있고 각 층은 바로 아래 층과만 대화한다. 오른쪽 인프라가 모든 층을 받친다." style="width:100%; max-width:560px; height:auto; font-family:var(--font-sans)">
<defs>
<marker id="ly-arr" markerWidth="9" markerHeight="9" refX="7" refY="3" orient="auto"><path d="M0,0 L7,3 L0,6 Z" style="fill:var(--accent-primary)"/></marker>
</defs>
<rect x="40" y="16" width="370" height="48" rx="9" style="fill:var(--bg-tertiary); stroke:var(--accent-primary); stroke-width:1.6"/>
<text x="225" y="45" text-anchor="middle" style="font-size:13px; font-weight:700; fill:var(--accent-primary)">화면 계층 (Presentation)</text>
<rect x="40" y="84" width="370" height="48" rx="9" style="fill:var(--bg-tertiary); stroke:var(--accent-primary); stroke-width:1.6"/>
<text x="225" y="113" text-anchor="middle" style="font-size:13px; fill:var(--text-primary)">비즈니스 계층 (로직)</text>
<rect x="40" y="152" width="370" height="48" rx="9" style="fill:var(--bg-tertiary); stroke:var(--accent-primary); stroke-width:1.6"/>
<text x="225" y="181" text-anchor="middle" style="font-size:13px; fill:var(--text-primary)">데이터 접근 계층</text>
<rect x="40" y="220" width="370" height="48" rx="9" style="fill:var(--bg-tertiary); stroke:var(--accent-primary); stroke-width:1.6"/>
<text x="225" y="249" text-anchor="middle" style="font-size:13px; fill:var(--text-primary)">영속성 계층 (DB 저장)</text>
<line x1="225" y1="64" x2="225" y2="83" style="stroke:var(--accent-primary); stroke-width:1.8" marker-end="url(#ly-arr)"/>
<line x1="225" y1="132" x2="225" y2="151" style="stroke:var(--accent-primary); stroke-width:1.8" marker-end="url(#ly-arr)"/>
<line x1="225" y1="200" x2="225" y2="219" style="stroke:var(--accent-primary); stroke-width:1.8" marker-end="url(#ly-arr)"/>
<rect x="440" y="16" width="86" height="252" rx="9" style="fill:var(--bg-secondary); stroke:var(--accent-secondary); stroke-width:1.5"/>
<text x="483" y="142" text-anchor="middle" transform="rotate(-90 483 142)" style="font-size:13px; font-weight:700; fill:var(--accent-secondary)">Infrastructure</text>
<line x1="410" y1="40" x2="440" y2="40" style="stroke:var(--text-muted); stroke-width:1.4; stroke-dasharray:5 4"/>
<line x1="410" y1="108" x2="440" y2="108" style="stroke:var(--text-muted); stroke-width:1.4; stroke-dasharray:5 4"/>
<line x1="410" y1="176" x2="440" y2="176" style="stroke:var(--text-muted); stroke-width:1.4; stroke-dasharray:5 4"/>
<line x1="410" y1="244" x2="440" y2="244" style="stroke:var(--text-muted); stroke-width:1.4; stroke-dasharray:5 4"/>
</svg>
<figcaption style="margin-top:0.75rem; font-size:0.9rem; color:var(--text-muted)">요청은 위에서 아래로 한 층씩 내려간다. 각 층은 바로 아래 층만 알면 돼서 역할 구분이 깔끔하다. 인프라(로깅·보안 등)는 모든 층을 받친다.</figcaption>
</figure>

층이 나뉘어 있으니 **"어디를 고쳐야 하는지"가 분명**합니다. 화면을 바꾸고 싶으면 맨 위 층만, 저장 방식을 바꾸고 싶으면 아래 두 층만 건드리면 돼요. 가장 전통적이고 이해하기 쉬운 구조라 많은 앱의 기본 골격이 됩니다.

**좋을 때** — 역할 구분이 중요하고, 팀이 층별로 나뉘어 일할 때. **조심할 점** — 간단한 요청도 모든 층을 거치느라 느려질 수 있고, 층이 너무 형식적이면 "그냥 통과만 하는 층"이 생겨요.

---

## 3. 모놀리식 (Monolithic) — "모든 게 한 건물에"

> 비유: 식당·주방·창고·계산대가 전부 한 건물 안에 있는 가게. 작을 때는 이만큼 편한 게 없다.

모놀리식은 **모든 기능을 하나의 덩어리로 만들어 통째로 배포**하는 방식입니다. 게시글, 댓글, 그룹, 미디어… 전부 한 프로그램 안에 들어 있어요.

<figure style="text-align:center; margin:2rem 0;">
<svg viewBox="0 0 600 220" role="img" aria-label="사용자가 하나의 큰 애플리케이션에 접속하고, 그 안에 게시글·댓글·그룹·미디어 기능이 모두 들어 있으며, 하나의 데이터베이스를 함께 쓴다." style="width:100%; max-width:580px; height:auto; font-family:var(--font-sans)">
<defs>
<marker id="mo-arr" markerWidth="10" markerHeight="10" refX="8" refY="3" orient="auto"><path d="M0,0 L8,3 L0,6 Z" style="fill:var(--accent-primary)"/></marker>
</defs>
<rect x="12" y="86" width="70" height="48" rx="9" style="fill:var(--bg-tertiary); stroke:var(--border-color); stroke-width:1.5"/>
<text x="47" y="115" text-anchor="middle" style="font-size:13px; fill:var(--text-primary)">User</text>
<line x1="82" y1="110" x2="116" y2="110" style="stroke:var(--accent-primary); stroke-width:2" marker-end="url(#mo-arr)"/>
<rect x="122" y="36" width="324" height="148" rx="10" style="fill:var(--bg-secondary); stroke:var(--accent-primary); stroke-width:1.8"/>
<text x="284" y="58" text-anchor="middle" style="font-size:13px; font-weight:700; fill:var(--accent-primary)">모놀리식 애플리케이션</text>
<rect x="140" y="74" width="68" height="92" rx="7" style="fill:var(--bg-tertiary); stroke:var(--border-color); stroke-width:1.2"/>
<text x="174" y="125" text-anchor="middle" style="font-size:12px; fill:var(--text-primary)">게시글</text>
<rect x="216" y="74" width="68" height="92" rx="7" style="fill:var(--bg-tertiary); stroke:var(--border-color); stroke-width:1.2"/>
<text x="250" y="125" text-anchor="middle" style="font-size:12px; fill:var(--text-primary)">댓글</text>
<rect x="292" y="74" width="68" height="92" rx="7" style="fill:var(--bg-tertiary); stroke:var(--border-color); stroke-width:1.2"/>
<text x="326" y="125" text-anchor="middle" style="font-size:12px; fill:var(--text-primary)">그룹</text>
<rect x="368" y="74" width="68" height="92" rx="7" style="fill:var(--bg-tertiary); stroke:var(--border-color); stroke-width:1.2"/>
<text x="402" y="125" text-anchor="middle" style="font-size:12px; fill:var(--text-primary)">미디어</text>
<line x1="446" y1="110" x2="486" y2="110" style="stroke:var(--accent-primary); stroke-width:2" marker-end="url(#mo-arr)"/>
<path d="M500,92 v40 a40,10 0 0,0 80,0 v-40" style="fill:var(--bg-tertiary); stroke:var(--accent-secondary); stroke-width:1.5"/>
<ellipse cx="540" cy="92" rx="40" ry="10" style="fill:var(--bg-tertiary); stroke:var(--accent-secondary); stroke-width:1.5"/>
<text x="540" y="120" text-anchor="middle" style="font-size:13px; font-weight:700; fill:var(--accent-secondary)">DB</text>
</svg>
<figcaption style="margin-top:0.75rem; font-size:0.9rem; color:var(--text-muted)">모든 기능이 한 덩어리 안에 있고 하나의 DB를 함께 쓴다. 시작은 단순하고 빠르지만, 커질수록 무거워진다.</figcaption>
</figure>

코드가 한 곳에 있으니 **시작이 가장 빠르고 단순**합니다. 작은 서비스나 초기 스타트업엔 이게 정답일 때가 많아요. "복잡하게 쪼개지 말고 일단 만들자"가 통하는 단계죠.

**좋을 때** — 초기 단계, 작은 팀, 단순한 서비스. **조심할 점** — 커지면 한 덩어리가 너무 무거워집니다. 작은 수정에도 전체를 다시 배포해야 하고, 한 부분의 장애가 전체를 멈출 수 있어요. 그 한계를 풀려고 나온 게 바로 다음 패턴입니다.

---

## 4. 마이크로서비스 (Microservices) — "푸드코트의 독립 매장들"

> 비유: 한 건물 안 푸드코트지만 분식·초밥·커피 매장이 각자 독립 운영된다. 초밥집이 문 닫아도 커피는 판다.

마이크로서비스는 모놀리식을 **작고 독립적인 여러 서비스로 쪼갠** 방식입니다. 상품 서비스, 장바구니 서비스, 할인 서비스, 주문 서비스… 각자 따로 돌고, **각자 자기 DB**를 가져요.

사용자 요청은 먼저 **API 게이트웨이**라는 안내 데스크를 거칩니다. 게이트웨이가 "이 요청은 장바구니 담당" 하고 알맞은 서비스로 보내줘요.

<figure style="text-align:center; margin:2rem 0;">
<svg viewBox="0 0 600 290" role="img" aria-label="사용자 요청이 API 게이트웨이를 거쳐 상품·장바구니·할인·주문 네 개의 독립 서비스로 분배되고, 각 서비스는 자기만의 데이터베이스를 가진다." style="width:100%; max-width:600px; height:auto; font-family:var(--font-sans)">
<defs>
<marker id="ms-arr" markerWidth="9" markerHeight="9" refX="7" refY="3" orient="auto"><path d="M0,0 L7,3 L0,6 Z" style="fill:var(--accent-primary)"/></marker>
</defs>
<rect x="10" y="128" width="62" height="46" rx="9" style="fill:var(--bg-tertiary); stroke:var(--border-color); stroke-width:1.5"/>
<text x="41" y="155" text-anchor="middle" style="font-size:12px; fill:var(--text-primary)">User</text>
<line x1="72" y1="151" x2="104" y2="151" style="stroke:var(--accent-primary); stroke-width:2" marker-end="url(#ms-arr)"/>
<rect x="108" y="34" width="74" height="226" rx="9" style="fill:var(--bg-secondary); stroke:var(--accent-primary); stroke-width:1.8"/>
<text x="145" y="151" text-anchor="middle" transform="rotate(-90 145 151)" style="font-size:13px; font-weight:700; fill:var(--accent-primary)">API Gateway</text>
<rect x="235" y="40" width="158" height="46" rx="8" style="fill:var(--bg-tertiary); stroke:var(--border-color); stroke-width:1.4"/>
<text x="314" y="68" text-anchor="middle" style="font-size:12px; fill:var(--text-primary)">상품 서비스</text>
<rect x="235" y="98" width="158" height="46" rx="8" style="fill:var(--bg-tertiary); stroke:var(--border-color); stroke-width:1.4"/>
<text x="314" y="126" text-anchor="middle" style="font-size:12px; fill:var(--text-primary)">장바구니 서비스</text>
<rect x="235" y="156" width="158" height="46" rx="8" style="fill:var(--bg-tertiary); stroke:var(--border-color); stroke-width:1.4"/>
<text x="314" y="184" text-anchor="middle" style="font-size:12px; fill:var(--text-primary)">할인 서비스</text>
<rect x="235" y="214" width="158" height="46" rx="8" style="fill:var(--bg-tertiary); stroke:var(--border-color); stroke-width:1.4"/>
<text x="314" y="242" text-anchor="middle" style="font-size:12px; fill:var(--text-primary)">주문 서비스</text>
<line x1="182" y1="74" x2="231" y2="63" style="stroke:var(--accent-primary); stroke-width:1.7" marker-end="url(#ms-arr)"/>
<line x1="182" y1="116" x2="231" y2="121" style="stroke:var(--accent-primary); stroke-width:1.7" marker-end="url(#ms-arr)"/>
<line x1="182" y1="184" x2="231" y2="179" style="stroke:var(--accent-primary); stroke-width:1.7" marker-end="url(#ms-arr)"/>
<line x1="182" y1="226" x2="231" y2="237" style="stroke:var(--accent-primary); stroke-width:1.7" marker-end="url(#ms-arr)"/>
<g style="stroke:var(--accent-secondary)">
<line x1="393" y1="63" x2="438" y2="63" style="stroke-width:1.6" marker-end="url(#ms-arr)"/>
<line x1="393" y1="121" x2="438" y2="121" style="stroke-width:1.6" marker-end="url(#ms-arr)"/>
<line x1="393" y1="179" x2="438" y2="179" style="stroke-width:1.6" marker-end="url(#ms-arr)"/>
<line x1="393" y1="237" x2="438" y2="237" style="stroke-width:1.6" marker-end="url(#ms-arr)"/>
</g>
<g style="fill:var(--bg-tertiary); stroke:var(--accent-secondary); stroke-width:1.4">
<path d="M444,57 v18 a26,7 0 0,0 52,0 v-18"/><ellipse cx="470" cy="57" rx="26" ry="7"/>
<path d="M444,115 v18 a26,7 0 0,0 52,0 v-18"/><ellipse cx="470" cy="115" rx="26" ry="7"/>
<path d="M444,173 v18 a26,7 0 0,0 52,0 v-18"/><ellipse cx="470" cy="173" rx="26" ry="7"/>
<path d="M444,231 v18 a26,7 0 0,0 52,0 v-18"/><ellipse cx="470" cy="231" rx="26" ry="7"/>
</g>
<g style="font-size:10px; fill:var(--accent-secondary); font-weight:700" text-anchor="middle">
<text x="470" y="71">DB</text><text x="470" y="129">DB</text><text x="470" y="187">DB</text><text x="470" y="245">DB</text>
</g>
</svg>
<figcaption style="margin-top:0.75rem; font-size:0.9rem; color:var(--text-muted)">기능마다 독립 서비스 + 독립 DB. 한 서비스만 따로 배포·확장할 수 있고, 하나가 죽어도 나머지는 산다.</figcaption>
</figure>

각 서비스가 독립적이라 **따로따로 배포하고, 필요한 것만 골라 확장**할 수 있어요. 주문이 몰리면 주문 서비스만 늘리면 됩니다. 한 서비스가 죽어도 나머지는 계속 돌아가요(모놀리식과 정반대).

**좋을 때** — 서비스가 크고, 팀이 여럿이고, 부분별로 다르게 확장하고 싶을 때. **조심할 점** — 쪼갠 만큼 **사이의 통신·관리가 복잡**해집니다. 네트워크로 대화하니 느려질 수 있고, 운영 난이도가 확 올라가요. "처음부터 마이크로서비스"는 대개 과합니다.

---

## 5. MVC — "식당의 홀·점원·주방"

> 비유: 손님이 점원(Controller)에게 주문하면, 점원이 주방(Model)에 전달하고, 완성된 음식을 홀(View)이 손님 앞에 차려낸다.

MVC는 한 화면을 **Model·View·Controller 세 역할로 나누는** 방식입니다. 주로 화면이 있는 앱(웹·모바일)에서 써요.

- **Model(주방)** — 데이터와 규칙. 실제 일을 한다.
- **View(홀)** — 사용자에게 보이는 화면.
- **Controller(점원)** — 사용자 입력을 받아 Model과 View를 잇는 중재자.

<figure style="text-align:center; margin:2rem 0;">
<svg viewBox="0 0 600 280" role="img" aria-label="사용자의 액션을 컨트롤러가 받아 모델을 갱신·조회하고 모델은 DB와 데이터를 주고받는다. 컨트롤러가 뷰를 만들고 뷰가 사용자에게 화면을 보여주는 순환 구조." style="width:100%; max-width:580px; height:auto; font-family:var(--font-sans)">
<defs>
<marker id="mv-arr" markerWidth="9" markerHeight="9" refX="7" refY="3" orient="auto"><path d="M0,0 L7,3 L0,6 Z" style="fill:var(--accent-primary)"/></marker>
<marker id="mv-arr2" markerWidth="9" markerHeight="9" refX="7" refY="3" orient="auto"><path d="M0,0 L7,3 L0,6 Z" style="fill:var(--accent-secondary)"/></marker>
</defs>
<rect x="12" y="116" width="68" height="50" rx="9" style="fill:var(--bg-tertiary); stroke:var(--border-color); stroke-width:1.5"/>
<text x="46" y="146" text-anchor="middle" style="font-size:13px; fill:var(--text-primary)">User</text>
<rect x="232" y="40" width="146" height="52" rx="9" style="fill:var(--bg-tertiary); stroke:var(--accent-primary); stroke-width:1.8"/>
<text x="305" y="64" text-anchor="middle" style="font-size:13px; font-weight:700; fill:var(--accent-primary)">Controller</text>
<text x="305" y="81" text-anchor="middle" style="font-size:10px; fill:var(--text-muted)">점원 · 중재자</text>
<rect x="440" y="40" width="140" height="52" rx="9" style="fill:var(--bg-tertiary); stroke:var(--accent-primary); stroke-width:1.6"/>
<text x="510" y="64" text-anchor="middle" style="font-size:13px; font-weight:700; fill:var(--accent-primary)">View</text>
<text x="510" y="81" text-anchor="middle" style="font-size:10px; fill:var(--text-muted)">홀 · 화면</text>
<rect x="232" y="196" width="146" height="52" rx="9" style="fill:var(--bg-tertiary); stroke:var(--accent-primary); stroke-width:1.6"/>
<text x="305" y="220" text-anchor="middle" style="font-size:13px; font-weight:700; fill:var(--accent-primary)">Model</text>
<text x="305" y="237" text-anchor="middle" style="font-size:10px; fill:var(--text-muted)">주방 · 데이터·규칙</text>
<path d="M470,210 v18 a28,7 0 0,0 56,0 v-18" style="fill:var(--bg-tertiary); stroke:var(--accent-secondary); stroke-width:1.5"/>
<ellipse cx="498" cy="210" rx="28" ry="7" style="fill:var(--bg-tertiary); stroke:var(--accent-secondary); stroke-width:1.5"/>
<text x="498" y="226" text-anchor="middle" style="font-size:11px; font-weight:700; fill:var(--accent-secondary)">DB</text>
<line x1="62" y1="116" x2="238" y2="64" style="stroke:var(--accent-primary); stroke-width:1.8" marker-end="url(#mv-arr)"/>
<text x="138" y="79" text-anchor="middle" style="font-size:10.5px; fill:var(--text-muted)">① 사용자 액션</text>
<line x1="378" y1="66" x2="438" y2="66" style="stroke:var(--accent-primary); stroke-width:1.8" marker-end="url(#mv-arr)"/>
<text x="408" y="56" text-anchor="middle" style="font-size:10.5px; fill:var(--text-muted)">② 화면 생성</text>
<line x1="305" y1="92" x2="305" y2="194" style="stroke:var(--accent-primary); stroke-width:1.8" marker-end="url(#mv-arr)"/>
<text x="356" y="148" text-anchor="middle" style="font-size:10.5px; fill:var(--text-muted)">③ 갱신·조회</text>
<line x1="378" y1="222" x2="466" y2="222" style="stroke:var(--accent-secondary); stroke-width:1.6" marker-end="url(#mv-arr2)" marker-start="url(#mv-arr2)"/>
<text x="420" y="212" text-anchor="middle" style="font-size:10.5px; fill:var(--text-muted)">④ 데이터</text>
<line x1="440" y1="86" x2="84" y2="150" style="stroke:var(--accent-primary); stroke-width:1.8" marker-end="url(#mv-arr)"/>
<text x="250" y="116" text-anchor="middle" style="font-size:10.5px; fill:var(--text-muted)">⑤ 화면 표시</text>
</svg>
<figcaption style="margin-top:0.75rem; font-size:0.9rem; color:var(--text-muted)">사용자 액션 → 컨트롤러 → (모델 갱신·DB) → 뷰 생성 → 사용자에게 표시. 역할이 셋으로 갈려, 화면만 바꾸거나 로직만 바꾸기 쉽다.</figcaption>
</figure>

화면(View)과 로직(Model)이 분리돼 있어, **디자인을 갈아엎어도 로직은 그대로** 둘 수 있어요. 반대도 마찬가지. 그래서 거의 모든 웹/앱 프레임워크의 기본 사고방식이 됐습니다.

**좋을 때** — 화면이 있는 거의 모든 앱. **조심할 점** — 규모가 커지면 Controller에 일이 다 몰려 비대해지기 쉬워요(그래서 MVVM 같은 변형이 나왔습니다).

> 헷갈리지 마세요: MVC는 **한 앱 내부를 나누는** 방식이고, 위의 모놀리식·마이크로서비스는 **앱 전체를 배포하는** 방식이에요. 결이 다른 분류라 같이 쓰일 수 있습니다(예: 마이크로서비스 안의 각 서비스가 MVC 구조).

---

## 6. 마스터-슬레이브 (Master-Slave) — "원본 장부와 복사본"

> 비유: 원본 장부는 딱 한 권(여기에만 기록). 직원들이 빨리 조회하라고 복사본을 여러 권 만들어 나눠 둔다. 기록은 원본에, 조회는 복사본에.

마스터-슬레이브는 **읽기와 쓰기 일을 나눠 분산**하는 방식입니다. 주로 데이터베이스에서 써요.

**쓰기(write)는 마스터 한 곳에만** 합니다. 마스터는 바뀐 내용을 여러 **슬레이브(복제본)**에 복사(replicate)해 둬요. 그리고 **읽기(read)는 슬레이브들이 나눠** 처리합니다. 보통 읽기가 쓰기보다 훨씬 많으니, 이렇게 하면 부하가 쫙 분산돼요.

<figure style="text-align:center; margin:2rem 0;">
<svg viewBox="0 0 600 270" role="img" aria-label="클라이언트의 쓰기는 마스터 DB 한 곳으로 가고, 마스터는 변경 내용을 여러 복제본으로 복사한다. 클라이언트의 읽기는 복제본들이 나눠 처리한다." style="width:100%; max-width:600px; height:auto; font-family:var(--font-sans)">
<defs>
<marker id="md-arr" markerWidth="10" markerHeight="10" refX="8" refY="3" orient="auto"><path d="M0,0 L8,3 L0,6 Z" style="fill:var(--accent-primary)"/></marker>
<marker id="md-arr2" markerWidth="10" markerHeight="10" refX="8" refY="3" orient="auto"><path d="M0,0 L8,3 L0,6 Z" style="fill:var(--accent-secondary)"/></marker>
</defs>
<rect x="14" y="106" width="96" height="58" rx="9" style="fill:var(--bg-tertiary); stroke:var(--border-color); stroke-width:1.5"/>
<text x="62" y="131" text-anchor="middle" style="font-size:13px; fill:var(--text-primary)">클라이언트</text>
<text x="62" y="148" text-anchor="middle" style="font-size:10px; fill:var(--text-muted)">Clients</text>
<path d="M282,44 v52 a48,11 0 0,0 96,0 v-52" style="fill:var(--bg-tertiary); stroke:var(--accent-primary); stroke-width:1.8"/>
<ellipse cx="330" cy="44" rx="48" ry="11" style="fill:var(--bg-tertiary); stroke:var(--accent-primary); stroke-width:1.8"/>
<text x="330" y="70" text-anchor="middle" style="font-size:13px; font-weight:700; fill:var(--accent-primary)">마스터</text>
<text x="330" y="86" text-anchor="middle" style="font-size:10px; fill:var(--text-muted)">Primary · 쓰기</text>
<path d="M282,190 v46 a48,10 0 0,0 96,0 v-46" style="fill:var(--bg-tertiary); stroke:var(--accent-secondary); stroke-width:1.5"/>
<ellipse cx="330" cy="190" rx="48" ry="10" style="fill:var(--bg-tertiary); stroke:var(--accent-secondary); stroke-width:1.5"/>
<text x="330" y="214" text-anchor="middle" style="font-size:12px; font-weight:700; fill:var(--accent-secondary)">복제본 1</text>
<text x="330" y="229" text-anchor="middle" style="font-size:9.5px; fill:var(--text-muted)">Replica · 읽기</text>
<path d="M472,190 v46 a48,10 0 0,0 96,0 v-46" style="fill:var(--bg-tertiary); stroke:var(--accent-secondary); stroke-width:1.5"/>
<ellipse cx="520" cy="190" rx="48" ry="10" style="fill:var(--bg-tertiary); stroke:var(--accent-secondary); stroke-width:1.5"/>
<text x="520" y="214" text-anchor="middle" style="font-size:12px; font-weight:700; fill:var(--accent-secondary)">복제본 2</text>
<text x="520" y="229" text-anchor="middle" style="font-size:9.5px; fill:var(--text-muted)">Replica · 읽기</text>
<line x1="110" y1="122" x2="280" y2="74" style="stroke:var(--accent-primary); stroke-width:2" marker-end="url(#md-arr)"/>
<text x="188" y="86" text-anchor="middle" style="font-size:11px; fill:var(--accent-primary); font-weight:700">쓰기 write</text>
<line x1="110" y1="150" x2="280" y2="206" style="stroke:var(--accent-primary); stroke-width:2" marker-end="url(#md-arr)"/>
<text x="186" y="198" text-anchor="middle" style="font-size:11px; fill:var(--accent-primary); font-weight:700">읽기 read</text>
<line x1="330" y1="96" x2="330" y2="178" style="stroke:var(--accent-secondary); stroke-width:1.7; stroke-dasharray:6 4" marker-end="url(#md-arr2)"/>
<line x1="372" y1="84" x2="486" y2="180" style="stroke:var(--accent-secondary); stroke-width:1.7; stroke-dasharray:6 4" marker-end="url(#md-arr2)"/>
<text x="430" y="120" text-anchor="middle" style="font-size:11px; fill:var(--accent-secondary)">복제 replicate</text>
</svg>
<figcaption style="margin-top:0.75rem; font-size:0.9rem; color:var(--text-muted)">쓰기는 마스터 한 곳에만, 읽기는 복제본들이 나눠 처리한다. 마스터가 변경분을 복제본으로 흘려보낸다. 읽기 부하가 많은 서비스에 잘 맞는다.</figcaption>
</figure>

읽기 요청을 여러 복제본이 나눠 받으니 **조회가 빠르고, 트래픽이 늘어도 복제본만 더 두면** 됩니다. 복제본은 마스터가 잘못됐을 때 대비한 **백업** 역할도 해요.

**좋을 때** — 읽기가 쓰기보다 압도적으로 많은 서비스(대부분의 웹). **조심할 점** — 마스터가 복제본에 복사하는 데 약간의 시간차가 있어요. 방금 쓴 글이 복제본엔 아직 없을 수 있습니다(이걸 **복제 지연**이라 해요). 또 마스터가 죽으면 쓰기가 막혀, 누군가를 새 마스터로 승격하는 장치가 필요합니다.

> 용어 노트: 'master-slave'는 어감 문제로 요즘은 **primary-replica**(주-복제본) 또는 **leader-follower**(리더-팔로워)로 더 많이 부릅니다. 뜻은 같아요.

---

## 그래서 뭘 골라야 할까

정답은 없습니다. **규모·팀·트래픽**에 맞춰 고르는 거예요. 가장 흔한 갈림길은 모놀리식 ↔ 마이크로서비스입니다. 작게 시작할 땐 모놀리식이 빠르고, 커지면서 부분별로 따로 키워야 할 때 마이크로서비스로 쪼갭니다. "처음부터 잘게 쪼개기"는 대개 과한 선택이에요.

그리고 이 패턴들은 **서로 배타적이지 않습니다.** 한 시스템 안에서 섞여 살아요. 예를 들어 마이크로서비스로 쪼갠 각 서비스가 내부적으로 계층형이고, 그 안의 화면은 MVC로 나뉘며, DB는 마스터-슬레이브로 읽기를 분산하고, 서비스끼리는 이벤트로 대화할 수 있습니다.

| 패턴 | 한 줄 핵심 | 이럴 때 |
|---|---|---|
| 이벤트 기반 | 사건으로 느슨하게 대화 | 알림·결제 등 "한 사건 → 여러 처리" |
| 계층형 | 책임을 위아래 층으로 | 역할 구분이 중요한 일반 앱 |
| 모놀리식 | 한 덩어리로 통째 배포 | 초기·소규모·단순한 서비스 |
| 마이크로서비스 | 작은 서비스로 쪼갬 | 크고, 팀 여럿, 부분별 확장 |
| MVC | 화면·로직·중재 분리 | 화면이 있는 거의 모든 앱 |
| 마스터-슬레이브 | 읽기/쓰기 분산 | 읽기가 압도적으로 많을 때 |

핵심 한 줄: **"어떻게 나누고, 어떻게 대화하게 할까"** — 아키텍처는 결국 이 두 질문에 대한 답입니다.

---

시스템을 이렇게 설계했다면, 다음은 **실제로 돌리고 바깥에 노출하는** 일이 남습니다. 그 이야기는 [쿠버네티스 네트워킹 글](post.html?id=kubernetes-networking)에서 — Pod·Service·Ingress가 트래픽을 어떻게 흘려보내는지 같은 결의 비유로 풀어봅니다.
