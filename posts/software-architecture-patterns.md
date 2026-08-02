집을 짓는다고 해봅시다. 원룸으로 지을 수도, 층층이 나눈 빌딩으로 지을 수도, 아니면 작은 집 여러 채를 모은 타운하우스로 지을 수도 있어요. **목적과 상황에 따라 '짜맞추는 방식'이 달라집니다.**

소프트웨어도 똑같아요. 코드를 어떻게 나누고, 어떤 조각이 어떤 조각과 어떻게 대화하게 할지 — 이 큰 그림을 **아키텍처(architecture)**라고 부릅니다. 그리고 자주 쓰여서 이름이 붙은 정형화된 설계도들을 **아키텍처 패턴**이라고 해요.

> 한 줄 비유: 아키텍처 패턴은 **'집 짓는 방식'의 모음집**이다. 정답은 없고, 상황에 맞는 선택만 있다.

이 글에서는 가장 자주 등장하는 6가지를 일상 비유와 그림으로 하나씩 풀어봅니다. **이벤트 기반, 계층형, 모놀리식, 마이크로서비스, MVC, 마스터-슬레이브**입니다. 용어는 낯설어도 아이디어는 다 우리 주변에 있는 것들이에요.

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

### 숫자로 보면 — 왜 사슬을 끊는가

"직접 부르면 안 되나?" 싶을 때 가용성으로 재보면 답이 보입니다. 아래 확률은 가상 수치입니다.

```python
# "직접 부르기"와 "이벤트로 알리기"는 무엇이 다른가 — 가용성으로 본다.
#
# 상황: 주문 서비스가 결제·재고·알림 세 서비스를 써야 한다.
#   방식 A(직접 호출): 주문 → 결제 → 재고 → 알림 을 차례로 부르고 답을 기다린다.
#                     하나라도 죽으면 주문이 실패한다.
#   방식 B(이벤트):    주문은 "주문됨" 한 줄만 남기고 끝낸다.
#                     나머지는 각자 그 줄을 읽고 알아서 한다.

SERVICES = {
    "결제": 0.999,   # 각 서비스가 정상일 확률 (연간 99.9% = 약 8.8시간 장애)
    "재고": 0.999,
    "알림": 0.995,   # 알림은 외부 업체를 쓴다고 가정 — 좀 더 자주 흔들린다
}
ORDER_SELF = 0.999   # 주문 서비스 자신의 가용성

def hours_down(availability):
    """연간 몇 시간 멈추나."""
    return (1 - availability) * 365 * 24

# ── 방식 A: 사슬로 엮으면 확률이 곱해진다 ──
a = ORDER_SELF
for v in SERVICES.values():
    a *= v
print("방식 A — 직접 호출 (하나라도 죽으면 주문 실패)")
print(f"  주문 성공 확률  {a*100:.3f}%")
print(f"  연간 멈춤 시간  {hours_down(a):.1f}시간")
print(f"  계산: {ORDER_SELF} × " + " × ".join(str(v) for v in SERVICES.values()))
print()

# ── 방식 B: 주문은 자기 일만 하고 끝낸다 ──
# 주문 성공은 주문 서비스 + 메시지 큐만 살아 있으면 된다.
QUEUE = 0.9995
b = ORDER_SELF * QUEUE
print("방식 B — 이벤트 (주문은 기록만 하고 끝)")
print(f"  주문 성공 확률  {b*100:.3f}%")
print(f"  연간 멈춤 시간  {hours_down(b):.1f}시간")
print()
print(f"차이  연간 {hours_down(a) - hours_down(b):.1f}시간 = {hours_down(a)/hours_down(b):.1f}배")
print()

# ── 그런데 공짜가 아니다 ──
# 이벤트 방식은 "주문은 됐는데 알림이 아직 안 갔다"는 상태가 존재한다.
# 알림 서비스가 30분 죽어 있으면, 그동안 쌓인 주문은 나중에 한꺼번에 처리된다.
ORDERS_PER_MIN = 200
for down_min in (5, 30, 120):
    backlog = ORDERS_PER_MIN * down_min
    print(f"  알림이 {down_min:>3}분 죽으면  주문 {backlog:>6,}건의 알림이 밀린다"
          f" (주문 자체는 전부 성공)")
print()
print("→ 직접 호출은 '전부 성공 아니면 실패'라 깔끔하지만, 사슬이 길수록 약해진다.")
print("→ 이벤트는 주문을 지켜내는 대신, '아직 안 된 일'이 시스템에 남는 걸 받아들인다.")
print("→ 그래서 고를 기준은 이것이다: 이 일은 '지금 당장' 끝나야 하나, '언젠가' 끝나면 되나.")

# 출력:
# 방식 A — 직접 호출 (하나라도 죽으면 주문 실패)
#   주문 성공 확률  99.202%
#   연간 멈춤 시간  69.9시간
#   계산: 0.999 × 0.999 × 0.999 × 0.995
#
# 방식 B — 이벤트 (주문은 기록만 하고 끝)
#   주문 성공 확률  99.850%
#   연간 멈춤 시간  13.1시간
#
# 차이  연간 56.8시간 = 5.3배
#
#   알림이   5분 죽으면  주문  1,000건의 알림이 밀린다 (주문 자체는 전부 성공)
#   알림이  30분 죽으면  주문  6,000건의 알림이 밀린다 (주문 자체는 전부 성공)
#   알림이 120분 죽으면  주문 24,000건의 알림이 밀린다 (주문 자체는 전부 성공)
#
# → 직접 호출은 '전부 성공 아니면 실패'라 깔끔하지만, 사슬이 길수록 약해진다.
# → 이벤트는 주문을 지켜내는 대신, '아직 안 된 일'이 시스템에 남는 걸 받아들인다.
# → 그래서 고를 기준은 이것이다: 이 일은 '지금 당장' 끝나야 하나, '언젠가' 끝나면 되나.
```

핵심은 **확률이 곱해진다**는 점입니다. 99.9%짜리 서비스 셋을 사슬로 엮으면 99.2%가 됩니다. 각각은 훌륭한데 합쳐 놓으면 연간 69.9시간 멈춥니다. 사슬이 길수록 약해집니다.

이벤트로 끊으면 주문은 자기 일만 하고 끝냅니다. 연간 13.1시간으로 5.3배 좋아집니다.

그런데 공짜가 아닙니다. **"주문은 됐는데 알림이 아직 안 갔다"는 상태가 새로 생깁니다.** 알림 서비스가 30분 죽으면 주문 6천 건의 알림이 밀립니다. 주문 자체는 다 성공했지만, 사용자는 "결제됐다는 문자가 안 오네?"라고 느낍니다.

그래서 고를 기준은 하나입니다. **이 일은 "지금 당장" 끝나야 하나, "언젠가" 끝나면 되나.** 결제 승인은 지금 당장이어야 합니다. 알림·집계·추천 갱신은 언젠가여도 됩니다.

---

## 2. 계층형 (Layered) — "회사 결재 라인"

> 비유: 사원이 결재를 올리면 대리 → 과장 → 부장 순서로 한 층씩 올라간다. 사원이 부장에게 바로 가지 않는다.

계층형은 시스템을 **책임이 다른 층(layer)으로 위아래 쌓는** 방식입니다. 각 층은 **바로 아래층하고만** 대화해요.

보통 네 층으로 나눕니다.

- **화면(Presentation)** — 사용자에게 보이는 부분
- **비즈니스(Business)** — "할인은 얼마" 같은 실제 로직
- **데이터 접근(Data Access)** — DB와 대화하는 통로
- **영속성(Persistence)** — 데이터를 실제로 저장하는 곳

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

### 숫자로 보면 — "더 안전하다"는 오해

마이크로서비스를 두고 "장애에 강하다"고들 합니다. 절반만 맞는 말입니다. 재보면 정확한 표현이 나옵니다. 가상 수치입니다.

```python
# 한 건물이냐 여러 채냐 — 배포할 때 무엇이 달라지나.
#
# 흔한 오해: "마이크로서비스가 더 안전하다"
# 실제로는 "터지는 범위가 좁아지는 대신, 터질 기회가 많아진다"가 정확하다.

FEATURES = 8            # 기능(도메인) 8개
DEPLOYS_PER_FEATURE = 4 # 기능마다 한 달에 4번 배포
FAIL_RATE = 0.02        # 배포 1회가 사고로 이어질 확률 2%
USERS = 1_000_000

# ── 모놀리식: 한 덩이라 기능 하나만 고쳐도 전체를 배포한다 ──
mono_deploys = FEATURES * DEPLOYS_PER_FEATURE      # 배포 횟수는 같다
mono_blast = USERS                                  # 터지면 전체 사용자
mono_incidents = mono_deploys * FAIL_RATE
mono_affected = mono_incidents * mono_blast

# ── 마이크로서비스: 기능별로 따로 배포한다 ──
micro_deploys = FEATURES * DEPLOYS_PER_FEATURE
micro_blast = USERS / FEATURES                      # 그 기능을 쓰는 사용자만
# 대신 서비스 간 호출이 늘어 배포 1회의 위험이 조금 커진다고 가정
MICRO_FAIL_RATE = 0.025
micro_incidents = micro_deploys * MICRO_FAIL_RATE
micro_affected = micro_incidents * micro_blast

print(f"기능 {FEATURES}개 · 기능당 월 {DEPLOYS_PER_FEATURE}회 배포 · 사용자 {USERS:,}명\n")
print(f"{'':16}{'월 배포':>8}{'사고 건수':>11}{'1건당 영향':>13}{'월 영향 사용자':>16}")
print(f"{'모놀리식':16}{mono_deploys:>8}{mono_incidents:>10.1f}건{mono_blast:>12,.0f}{mono_affected:>15,.0f}")
print(f"{'마이크로서비스':14}{micro_deploys:>8}{micro_incidents:>10.1f}건{micro_blast:>12,.0f}{micro_affected:>15,.0f}")
print(f"\n월 영향 사용자 차이  {mono_affected/micro_affected:.1f}배\n")

# ── 그런데 기능 하나만 고치고 싶을 때는 어떤가 ──
print("기능 1개를 고치는 배포 한 번을 비교하면")
print(f"  모놀리식        전체를 다시 올린다 → 위험에 노출되는 사용자 {USERS:,}명")
print(f"  마이크로서비스   그 서비스만 올린다 → 위험에 노출되는 사용자 {micro_blast:,.0f}명")
print(f"  → 같은 한 줄 수정인데 영향 범위가 {USERS/micro_blast:.0f}배 다르다\n")

# ── 공짜가 아닌 부분 ──
# 서비스가 늘면 서비스 간 호출이 늘고, 그만큼 새로운 실패 지점이 생긴다.
print("대가: 서비스가 늘면 '사이'가 늘어난다")
print(f"{'서비스 수':>10}{'가능한 호출 경로':>18}{'설명':>10}")
for n in (1, 4, 8, 20):
    pairs = n * (n - 1) // 2
    print(f"{n:>9}개{pairs:>16}개")
print("  → 서비스 20개면 서로 얽힐 수 있는 짝이 190개다.")
print("  → 코드가 아니라 '사이'를 관리하는 일이 새로 생긴다(추적·재시도·타임아웃).")
print()
print("→ 마이크로서비스는 '더 안전한 구조'가 아니다. 터지는 범위를 좁히는 구조다.")
print("→ 기능이 적고 팀이 작다면 모놀리식이 오히려 사고가 적다. 관리할 '사이'가 없으니까.")

# 출력:
# 기능 8개 · 기능당 월 4회 배포 · 사용자 1,000,000명
#
#                     월 배포      사고 건수       1건당 영향        월 영향 사용자
# 모놀리식                  32       0.6건   1,000,000        640,000
# 마이크로서비스             32       0.8건     125,000        100,000
#
# 월 영향 사용자 차이  6.4배
#
# 기능 1개를 고치는 배포 한 번을 비교하면
#   모놀리식        전체를 다시 올린다 → 위험에 노출되는 사용자 1,000,000명
#   마이크로서비스   그 서비스만 올린다 → 위험에 노출되는 사용자 125,000명
#   → 같은 한 줄 수정인데 영향 범위가 8배 다르다
#
# 대가: 서비스가 늘면 '사이'가 늘어난다
#      서비스 수         가능한 호출 경로        설명
#         1개               0개
#         4개               6개
#         8개              28개
#        20개             190개
#   → 서비스 20개면 서로 얽힐 수 있는 짝이 190개다.
#   → 코드가 아니라 '사이'를 관리하는 일이 새로 생긴다(추적·재시도·타임아웃).
#
# → 마이크로서비스는 '더 안전한 구조'가 아니다. 터지는 범위를 좁히는 구조다.
# → 기능이 적고 팀이 작다면 모놀리식이 오히려 사고가 적다. 관리할 '사이'가 없으니까.
```

세 가지가 보입니다.

**첫째, 터지는 범위가 좁아집니다.** 기능 한 줄을 고칠 때 모놀리식은 전체를 다시 올려 사용자 100만 명이 위험에 노출됩니다. 마이크로서비스는 그 서비스만 올려 12.5만 명입니다. 8배 차이입니다.

**둘째, 터질 기회는 오히려 늘어납니다.** 서비스 간 호출이 생기니 배포 한 번의 사고 확률이 2%에서 2.5%로 올라갑니다. 사고 건수는 0.6건에서 0.8건으로 늘어납니다.

**셋째, "사이"를 관리하는 일이 새로 생깁니다.** 서비스가 20개면 서로 얽힐 수 있는 짝이 190개입니다. 코드를 짜는 일이 아니라 **호출을 추적하고 재시도와 타임아웃을 정하는 일**이 업무가 됩니다.

그래서 정확한 표현은 이렇습니다. **마이크로서비스는 더 안전한 구조가 아니라, 터지는 범위를 좁히는 구조입니다.** 기능이 적고 팀이 작다면 모놀리식이 오히려 사고가 적습니다. 관리할 "사이"가 없으니까요.

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

> 용어 노트: 'master-slave'라는 말은 어감 문제로 점점 안 씁니다. 요즘은 **primary-replica**(주-복제본) 또는 **leader-follower**(리더-팔로워)로 더 많이 부릅니다. 뜻은 같아요.

---

### 숫자로 보면 — 복사본을 몇 대 둬야 하나

"복사본을 두면 좋다"는 알겠는데 몇 대가 필요한지는 계산해 봐야 압니다. 가상 수치입니다.

```python
# 복사본(replica)을 몇 대 둬야 하나 — 읽기와 쓰기 비율로 계산한다.
#
# 원본 장부(primary)는 쓰기를 받는다. 복사본은 읽기만 받는다.
# 웹 서비스는 대개 읽기가 압도적으로 많아서, 이 구조가 잘 통한다.

TOTAL_QPS = 12_000          # 초당 요청 총량
READ_SHARE = 0.95           # 그중 95%가 읽기 (게시글 보기, 목록 등)
CAPACITY_PER_NODE = 2_000   # 서버 한 대가 감당하는 초당 요청 (가상 수치)

reads = TOTAL_QPS * READ_SHARE
writes = TOTAL_QPS - reads

print(f"총 {TOTAL_QPS:,} QPS · 읽기 {reads:,.0f} ({READ_SHARE:.0%}) · 쓰기 {writes:,.0f}")
print(f"서버 1대 처리량 {CAPACITY_PER_NODE:,} QPS (가상 수치)\n")

# ── 원본 1대로만 버티려면 ──
print("① 원본 1대만 쓸 때")
print(f"   필요 처리량 {TOTAL_QPS:,} vs 가능 {CAPACITY_PER_NODE:,}"
      f"  →  {TOTAL_QPS/CAPACITY_PER_NODE:.1f}배 초과")
print("   서버를 더 크게 사는 방법밖에 없다(수직 확장). 한계가 금방 온다.\n")

# ── 복사본을 두면 ──
import math
replicas = math.ceil(reads / CAPACITY_PER_NODE)
print("② 원본 1대 + 복사본 N대")
print(f"   쓰기 {writes:,.0f} QPS → 원본 1대로 충분 (여유 {CAPACITY_PER_NODE - writes:,.0f})")
print(f"   읽기 {reads:,.0f} QPS → 복사본 {replicas}대 필요"
      f" ({reads:,.0f} ÷ {CAPACITY_PER_NODE:,} = {reads/CAPACITY_PER_NODE:.1f} → 올림)")
print(f"   합계 {1 + replicas}대\n")

# ── 읽기 비율이 달라지면 ──
print("읽기 비율이 바뀌면 필요한 대수도 바뀐다")
print(f"{'읽기 비율':>10}{'복사본':>8}{'원본 여유':>12}{'판정':>18}")
for share in (0.50, 0.80, 0.95, 0.99):
    r = TOTAL_QPS * share
    w = TOTAL_QPS - r
    need = math.ceil(r / CAPACITY_PER_NODE)
    slack = CAPACITY_PER_NODE - w
    verdict = "원본이 먼저 터진다" if slack < 0 else "복사본으로 해결"
    print(f"{share:>9.0%}{need:>8}대{slack:>10,.0f}{verdict:>18}")
print()
print("→ 읽기가 많을수록 이 구조가 잘 통한다. 복사본만 늘리면 되니까.")
print("→ 쓰기가 절반이면 원본이 먼저 터진다. 그때는 복사본이 아니라 샤딩(쪼개기)이 답이다.")
print()

# ── 대가: 복제 지연 ──
LAG_MS = 150
print(f"대가는 복제 지연이다. 원본에 쓴 값이 복사본에 도착하기까지 약 {LAG_MS}ms 걸린다면,")
print(f"  글을 쓴 직후 새로고침하면 {LAG_MS}ms 안에는 '방금 쓴 글이 없다'고 나올 수 있다.")
print("  그래서 '내가 쓴 것'은 원본에서 읽고, '남이 쓴 것'만 복사본에서 읽는 규칙을 둔다.")

# 출력:
# 총 12,000 QPS · 읽기 11,400 (95%) · 쓰기 600
# 서버 1대 처리량 2,000 QPS (가상 수치)
#
# ① 원본 1대만 쓸 때
#    필요 처리량 12,000 vs 가능 2,000  →  6.0배 초과
#    서버를 더 크게 사는 방법밖에 없다(수직 확장). 한계가 금방 온다.
#
# ② 원본 1대 + 복사본 N대
#    쓰기 600 QPS → 원본 1대로 충분 (여유 1,400)
#    읽기 11,400 QPS → 복사본 6대 필요 (11,400 ÷ 2,000 = 5.7 → 올림)
#    합계 7대
#
# 읽기 비율이 바뀌면 필요한 대수도 바뀐다
#      읽기 비율     복사본       원본 여유                판정
#       50%       3대    -4,000        원본이 먼저 터진다
#       80%       5대      -400        원본이 먼저 터진다
#       95%       6대     1,400          복사본으로 해결
#       99%       6대     1,880          복사본으로 해결
#
# → 읽기가 많을수록 이 구조가 잘 통한다. 복사본만 늘리면 되니까.
# → 쓰기가 절반이면 원본이 먼저 터진다. 그때는 복사본이 아니라 샤딩(쪼개기)이 답이다.
#
# 대가는 복제 지연이다. 원본에 쓴 값이 복사본에 도착하기까지 약 150ms 걸린다면,
#   글을 쓴 직후 새로고침하면 150ms 안에는 '방금 쓴 글이 없다'고 나올 수 있다.
#   그래서 '내가 쓴 것'은 원본에서 읽고, '남이 쓴 것'만 복사본에서 읽는 규칙을 둔다.
```

표에서 읽기 비율을 따라가 보세요. **50%일 때는 원본이 먼저 터집니다.** 복사본을 아무리 늘려도 쓰기는 원본이 다 받아야 하니까요. 이때 필요한 건 복사본이 아니라 **샤딩**(데이터를 여러 원본으로 쪼개기)입니다.

95%일 때는 복사본 6대로 해결됩니다. 웹 서비스는 대개 읽기가 압도적이라 이 구조가 잘 통합니다. 게시글 하나를 쓰면 수천 명이 읽으니까요.

대가는 **복제 지연**입니다. 원본에 쓴 값이 복사본에 도착하는 데 시간이 걸립니다. 글을 쓴 직후 새로고침하면 "방금 쓴 글이 없다"고 나올 수 있습니다. 그래서 실무에서는 규칙을 하나 둡니다. **"내가 쓴 것"은 원본에서 읽고, "남이 쓴 것"만 복사본에서 읽습니다.**

---

## 그래서 뭘 골라야 할까

정답은 없습니다. **규모·팀·트래픽**에 맞춰 고르는 거예요. 가장 흔한 갈림길은 모놀리식 ↔ 마이크로서비스입니다. 작게 시작할 땐 모놀리식이 빠르고, 커지면서 부분별로 따로 키워야 할 때 마이크로서비스로 쪼갭니다. "처음부터 잘게 쪼개기"는 대개 과한 선택이에요.

그리고 이 패턴들은 **서로 배타적이지 않습니다.** 한 시스템 안에서 섞여 살아요. 예를 들어 이런 조합이 흔합니다. 마이크로서비스로 쪼갠 각 서비스가 내부적으로는 계층형입니다. 그 안의 화면은 MVC로 나뉘고, DB는 마스터-슬레이브로 읽기를 분산하고, 서비스끼리는 이벤트로 대화할 수 있습니다.

| 패턴 | 한 줄 핵심 | 이럴 때 |
|---|---|---|
| 이벤트 기반 | 사건으로 느슨하게 대화 | 알림·결제 등 "한 사건 → 여러 처리" |
| 계층형 | 책임을 위아래 층으로 | 역할 구분이 중요한 일반 앱 |
| 모놀리식 | 한 덩어리로 통째 배포 | 초기·소규모·단순한 서비스 |
| 마이크로서비스 | 작은 서비스로 쪼갬 | 크고, 팀 여럿, 부분별 확장 |
| MVC | 화면·로직·중재 분리 | 화면이 있는 거의 모든 앱 |
| 마스터-슬레이브 | 읽기/쓰기 분산 | 읽기가 압도적으로 많을 때 |

### 고를 때 실제로 던지는 질문

앞의 계산들을 표로 모으면 판단 기준이 보입니다. 숫자는 이 글에서 쓴 가상 수치입니다.

| 갈림길 | 얻는 것 | 내주는 것 | 이 글의 숫자 |
|---|---|---|---|
| 직접 호출 → 이벤트 | 주문 가용성 99.2% → 99.85% (연 69.9→13.1시간) | "아직 안 된 일"이 남는다 (알림 30분 장애 = 6천 건 밀림) | 1절 |
| 모놀리식 → 마이크로서비스 | 배포 1회 영향 100만 → 12.5만 명 (8배) | 사고 건수 0.6 → 0.8건, 관리할 "사이" 190개 | 4절 |
| 단일 DB → 복사본 | 읽기 95%일 때 복사본 6대로 12,000 QPS 소화 | 복제 지연 (내가 쓴 글이 안 보임) | 6절 |

세 줄이 같은 모양입니다. **무언가를 얻으려면 새로운 종류의 문제를 받아들여야 합니다.** 그리고 받아들이는 문제가 우리 상황에서 감당할 만한지가 선택의 기준입니다.

읽기가 절반인 서비스에 복사본을 늘리는 건 답이 아닙니다. 기능이 3개인 서비스를 마이크로서비스로 쪼개는 것도 답이 아닙니다. 계산해 보면 그게 드러납니다.

:::deep 더 깊이 — 왜 "나중에 쪼개기"가 "처음부터 쪼개기"보다 쉬운가

"어차피 커질 텐데 처음부터 마이크로서비스로 가면 안 되나?"는 자연스러운 질문입니다. 실무의 답은 대개 "아니오"인데, 이유가 기술이 아니라 **정보**에 있습니다.

서비스를 쪼갤 때 가장 어려운 결정은 **경계를 어디에 그을까**입니다. 주문과 결제를 한 서비스로 둘까, 나눌까. 재고는 주문 쪽인가 상품 쪽인가. 이 답은 **실제로 어떤 코드가 함께 바뀌는지**를 봐야 알 수 있습니다.

그런데 그 정보는 서비스를 만들어 한동안 굴려 본 뒤에야 생깁니다. 처음에는 아무도 모릅니다. 모르는 상태로 경계를 그으면 대개 틀리고, **틀린 경계는 고치기가 가장 비쌉니다.** 두 서비스에 걸친 기능을 하나 바꾸려면 배포를 두 번 조율해야 하고, 데이터를 옮기려면 두 DB를 동시에 손봐야 합니다.

모놀리식은 반대입니다. 경계를 잘못 그어도 함수를 옮기면 끝입니다. 그러다 "이 부분만 유독 자주 바뀌고, 트래픽도 따로 튄다"는 게 보이면 그때 떼어냅니다. **그 시점에는 경계가 이미 데이터로 드러나 있습니다.**

정리하면 이렇습니다. 처음부터 쪼개는 건 정보가 없는 상태에서 되돌리기 어려운 결정을 내리는 일입니다. 나중에 쪼개는 건 정보가 쌓인 뒤에 되돌리기 쉬운 결정을 내리는 일입니다.
:::

핵심 한 줄: **"어떻게 나누고, 어떻게 대화하게 할까"** — 아키텍처는 결국 이 두 질문에 대한 답입니다.

---

시스템을 이렇게 설계했다면, 다음은 **실제로 돌리고 바깥에 노출하는** 일이 남습니다. 그 이야기는 [쿠버네티스 네트워킹 글](post.html?id=kubernetes-networking)에서 — Pod·Service·Ingress가 트래픽을 어떻게 흘려보내는지 같은 결의 비유로 풀어봅니다.
