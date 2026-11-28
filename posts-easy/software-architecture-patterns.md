똑같은 일을 하는 서비스라도 코드를 한 덩어리로 모아 둘 수도 있고 위아래 층으로 나눌 수도 있으며 작은 서비스 여러 개로 쪼갤 수도 있습니다. 어떻게 짜맞출지는 **서비스의 목적과 놓인 상황에 따라 달라집니다.**

코드를 어떤 조각으로 나누고 나눈 조각끼리 어떻게 대화하게 할지 정한 큰 그림을 **아키텍처(architecture)**라고 부릅니다. 조각끼리 대화한다는 말은 한 조각이 다른 조각을 불러 일을 맡기거나 데이터를 주고받는다는 뜻입니다. 그런 설계 가운데 자주 쓰여 이름까지 붙은 정형화된 설계도를 **아키텍처 패턴**이라고 합니다.

> **한 줄 요약:** 아키텍처 패턴은 코드를 나누는 방식 가운데 자주 쓰여 이름이 붙은 것들입니다. 어느 상황에나 맞는 정답은 없고 상황에 맞는 선택만 있습니다. 이 글에서 계산해 보는 세 선택(직접 호출 → 이벤트, 모놀리식 → 마이크로서비스, 단일 DB → 복사본)에서는 모두 무언가를 얻으려면 새로운 종류의 문제를 받아들여야 합니다.

이 글은 가장 자주 등장하는 패턴 6가지를 그림과 숫자로 하나씩 살펴봅니다. **이벤트 기반, 계층형, 모놀리식, 마이크로서비스, MVC, 마스터-슬레이브**입니다. 이름은 낯설어도 패턴마다 담긴 생각은 단순합니다. 1절, 4절, 6절에는 숫자로 확인하는 파이썬 코드가 하나씩 있습니다. 코드에 넣은 확률, 사용자 수, 요청 수는 모두 설명을 위해 정한 가상 수치입니다.

---

## 1. 이벤트 기반 (Event-Driven) — 직접 부르지 않고 이벤트로 대화하는 구조

**이벤트 기반에서는 보내는 서비스가 「결제 완료」 같은 사건 한 줄을 남기고 바로 일을 끝냅니다. 그 사건을 누가 읽고 무엇을 할지는 받는 서비스가 저마다 정합니다.**

주문 서비스가 결제, 재고, 알림 서비스를 직접 차례로 부르고 답을 기다리면 그중 하나만 멈춰도 주문이 실패합니다. 이벤트 기반은 서비스끼리 서로를 직접 부르지 않고 사건(이벤트)으로 대화하게 해서 이렇게 차례로 이어진 호출을 끊습니다. 이벤트(event)는 「결제 완료!」, 「주문 취소!」처럼 시스템에서 일어난 사건 하나를 적은 기록입니다.

가운데에는 이벤트를 받아 두는 **이벤트 브로커**가 있습니다. 이벤트를 만들어 브로커에 보내는 서비스를 생산자(producer), 브로커에서 이벤트를 가져가 처리하는 서비스를 소비자(consumer)라고 부릅니다. 생산자는 이벤트를 보낸 뒤 누가 받을지 신경 쓰지 않습니다. 그 이벤트에 관심이 있는 소비자들이 알아서 가져가 처리합니다.

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
<figcaption style="margin-top:0.75rem; font-size:0.9rem; color:var(--text-muted)">생산자는 이벤트를 브로커에 보내기만 할 뿐 누가 받는지 모릅니다. 그 이벤트에 관심이 있는 소비자들이 알아서 가져가 처리하므로 생산자와 소비자는 서로 느슨하게 연결됩니다.</figcaption>
</figure>

생산자와 소비자는 서로를 몰라도 되므로 어느 한쪽을 바꾸거나 소비자를 새로 추가해도 상대편은 영향을 받지 않습니다. 이런 관계를 **느슨한 결합(loose coupling)**이라고 합니다.

- **좋을 때:** 알림, 결제, 로그(서비스가 남기는 기록)처럼 사건 하나에 처리가 여러 개 따라오는 일이 많을 때 잘 맞습니다. 트래픽(들어오는 요청의 양)이 갑자기 몰리면 소비자가 바로 처리하지 못한 이벤트가 브로커의 큐에서 기다리므로 큐가 몰린 양을 완충해 줍니다. 큐(queue)는 들어온 순서대로 쌓아 두는 대기열입니다.
- **조심할 점:** 생산자 코드에는 누가 이벤트를 받는지 적혀 있지 않아서 흐름이 눈에 보이지 않습니다. 그래서 「이 사건이 누구를 거쳐 어디로 갔지?」를 추적하기 어렵습니다.

---

### 숫자로 확인 — 직접 호출과 이벤트의 주문 성공 확률

**주문 서비스가 결제, 재고, 알림을 직접 차례로 부르면 서비스마다 정상일 확률이 곱해져 주문 성공 확률이 99.202% 로 내려가 1년에 69.9시간 멈춥니다. 이벤트로 바꾸면 99.850% 와 13.1시간이 되지만 알림 서비스가 멈춘 동안 보내지 못한 알림이 밀리는 상태가 새로 생깁니다.**

이벤트를 거치지 않고 주문 서비스가 다른 서비스를 직접 부르면 안 될까요? 서비스마다 가용성을 정해 두고 주문이 성공할 확률을 계산하면 답이 보입니다. 가용성(availability)은 서비스가 정상으로 돌고 있을 확률이고 높을수록 좋습니다. 코드 주석대로 가용성 0.999(99.9%)는 1년 가운데 약 8.8시간 동안 장애(서비스가 멈추거나 오류를 내는 일)가 난다는 뜻입니다. 출력의 「연간 멈춤 시간」은 서비스가 1년 동안 멈추는 시간이고 짧을수록 좋습니다. 이 시간은 1 에서 가용성을 뺀 값에 1년의 시간(365일 × 24시간)을 곱해 구합니다.

아래 코드는 주문 서비스가 결제, 재고, 알림 세 서비스를 써야 할 때 직접 호출과 이벤트 가운데 어느 방식이 주문을 덜 멈추게 하는지 가상 수치로 비교합니다. 가용성은 주문 서비스 자신과 결제, 재고가 0.999 이고 외부 업체를 쓴다고 가정한 알림은 장애가 조금 더 잦은 0.995 입니다. 이벤트 방식에서 「주문됨」 이벤트를 받아 두는 메시지 큐(앞에서 본 이벤트 브로커의 큐)는 0.9995 입니다.

방식 A 는 주문 → 결제 → 재고 → 알림을 차례로 부르고 답을 기다리는 직접 호출입니다. 이렇게 앞 서비스가 다음 서비스를 불러 한 줄로 이어진 호출을 호출 체인이라고 합니다. 코드의 주석과 출력은 호출 체인을 사슬이라고 부릅니다. 방식 B 는 주문 서비스가 「주문됨」 한 줄만 남기고 끝나는 이벤트 방식으로, 나머지 서비스는 저마다 그 줄을 읽고 알아서 처리합니다. 마지막 5단계는 방식 B 에서 알림 서비스가 멈춘 동안 밀리는 알림 수를 셉니다.

```python
# 하는 일: 주문 서비스가 결제, 재고, 알림을 직접 차례로 부를 때와 이벤트로 알릴 때의 주문 성공 확률과 연간 멈춤 시간을 비교하고, 이벤트 방식에서 밀리는 알림을 센다.

# 1단계: 서비스 셋과 주문 서비스의 가용성을 둔다
# 주문 서비스가 결제, 재고, 알림 세 서비스를 써야 한다. 확률은 가상 수치다.
SERVICES = {
    "결제": 0.999,   # 각 서비스가 정상일 확률 (연간 99.9% = 약 8.8시간 장애)
    "재고": 0.999,
    "알림": 0.995,   # 알림은 외부 업체를 쓴다고 가정 — 좀 더 자주 흔들린다
}
ORDER_SELF = 0.999   # 주문 서비스 자신의 가용성

# 2단계: 가용성으로 연간 멈춤 시간을 구하는 함수를 만든다
def hours_down(availability):
    """연간 몇 시간 멈추나."""
    return (1 - availability) * 365 * 24

# 3단계: 직접 호출로 사슬을 엮어 확률을 곱한다
# 방식 A 다. 주문 → 결제 → 재고 → 알림을 차례로 부르고 답을 기다려서, 하나라도 죽으면 주문이 실패한다.
a = ORDER_SELF
for v in SERVICES.values():
    a *= v
print("방식 A — 직접 호출 (하나라도 죽으면 주문 실패)")
print(f"  주문 성공 확률  {a*100:.3f}%")
print(f"  연간 멈춤 시간  {hours_down(a):.1f}시간")
print(f"  계산: {ORDER_SELF} × " + " × ".join(str(v) for v in SERVICES.values()))
print()

# 4단계: 이벤트로 알릴 때의 확률을 구하고, 직접 호출과의 차이를 찍는다
# 방식 B 다. 주문은 "주문됨" 한 줄만 남기고 끝내고, 나머지는 각자 그 줄을 읽고 알아서 한다.
# 주문 성공은 주문 서비스 + 메시지 큐만 살아 있으면 된다.
QUEUE = 0.9995
b = ORDER_SELF * QUEUE
print("방식 B — 이벤트 (주문은 기록만 하고 끝)")
print(f"  주문 성공 확률  {b*100:.3f}%")
print(f"  연간 멈춤 시간  {hours_down(b):.1f}시간")
print()
print(f"차이  연간 {hours_down(a) - hours_down(b):.1f}시간 = {hours_down(a)/hours_down(b):.1f}배")
print()

# 5단계: 알림이 죽은 동안 밀리는 알림을 센다
# 공짜가 아니다. 이벤트 방식에는 "주문은 됐는데 알림이 아직 안 갔다"는 상태가 있다. 알림 서비스가 30분 죽어 있으면, 그동안 쌓인 주문은 나중에 한꺼번에 처리된다.
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
# 3단계 뜻: 주문 0.999 에 결제 0.999, 재고 0.999, 알림 0.995 를 곱하면 주문 성공 확률이 99.202% 로, 연간 69.9시간을 멈춘다.
# 방식 A — 직접 호출 (하나라도 죽으면 주문 실패)
#   주문 성공 확률  99.202%
#   연간 멈춤 시간  69.9시간
#   계산: 0.999 × 0.999 × 0.999 × 0.995
#
# 4단계 뜻: 이벤트로 끊으면 주문 성공 확률이 99.850% 로 연간 13.1시간만 멈춰, 직접 호출보다 56.8시간, 5.3배 적다.
# 방식 B — 이벤트 (주문은 기록만 하고 끝)
#   주문 성공 확률  99.850%
#   연간 멈춤 시간  13.1시간
#
# 차이  연간 56.8시간 = 5.3배
#
# 5단계 뜻: 대신 알림이 죽은 동안 알림이 밀린다. 30분이면 주문 6,000건의 알림이 밀리지만, 주문 자체는 전부 성공한다.
#   알림이   5분 죽으면  주문  1,000건의 알림이 밀린다 (주문 자체는 전부 성공)
#   알림이  30분 죽으면  주문  6,000건의 알림이 밀린다 (주문 자체는 전부 성공)
#   알림이 120분 죽으면  주문 24,000건의 알림이 밀린다 (주문 자체는 전부 성공)
#
# → 직접 호출은 '전부 성공 아니면 실패'라 깔끔하지만, 사슬이 길수록 약해진다.
# → 이벤트는 주문을 지켜내는 대신, '아직 안 된 일'이 시스템에 남는 걸 받아들인다.
# → 그래서 고를 기준은 이것이다: 이 일은 '지금 당장' 끝나야 하나, '언젠가' 끝나면 되나.
```

방식 A 의 주문 성공 확률 99.202% 는 주문 0.999 에 결제 0.999, 재고 0.999, 알림 0.995 를 곱한 값입니다. 직접 호출에서는 4개 서비스가 모두 살아 있어야 주문이 성공하므로 각 서비스의 가용성을 곱합니다. 곱하는 값이 모두 1 보다 작아서 사슬에 서비스가 하나 늘 때마다 성공 확률은 내려갑니다. 그래서 99.9% 짜리 서비스 3개와 99.5% 짜리 알림 하나는 저마다 훌륭한데도 사슬로 엮으면 성공 확률이 99.2% 로 내려가 주문이 1년에 69.9시간 멈춥니다. 출력의 「사슬이 길수록 약해진다」가 이 뜻입니다.

방식 B 에서는 주문이 「주문됨」 한 줄만 남기고 끝나므로 주문이 성공하려면 주문 서비스와 그 줄을 받아 두는 메시지 큐만 살아 있으면 됩니다. 그래서 주문 0.999 에 큐 0.9995 를 곱한 99.850% 가 주문 성공 확률이라 1년에 멈추는 시간은 13.1시간입니다. 두 방식의 연간 멈춤 시간은 69.9 − 13.1 = 56.8시간 차이가 나며 직접 호출의 69.9시간은 이벤트 방식 13.1시간의 5.3배입니다.

하지만 이벤트 방식도 공짜는 아닙니다. **주문은 됐는데 알림은 아직 가지 않은 상태가 새로 생깁니다.** 코드는 1분에 주문이 200건 들어온다고 두었으므로 알림 서비스가 30분 멈추면 200 × 30 = 6,000건의 알림이 밀립니다. 같은 계산으로 5분이면 1,000건, 120분이면 24,000건입니다. 밀린 알림은 나중에 한꺼번에 처리됩니다. 주문 자체는 모두 성공했지만 그동안 사용자는 「결제됐다는 문자가 안 오네?」 하고 느낍니다.

직접 호출은 「전부 성공 아니면 실패」라 결과가 깔끔합니다. 이벤트는 주문을 지켜 내는 대신 「아직 안 된 일」이 시스템에 남는 것을 받아들입니다. 그래서 두 방식 가운데 무엇을 고를지는 기준 하나로 정합니다. **이 일은 「지금 당장」 끝나야 하나, 「언젠가」 끝나면 되나.** 결제 승인은 지금 당장 끝나야 합니다. 반면 알림, 집계, 추천 갱신은 언젠가 끝나도 됩니다.

---

## 2. 계층형 (Layered) — 바로 아래층하고만 대화하는 층

**계층형에서는 요청이 화면, 로직, 데이터 접근, 저장 순서로 한 층씩 내려가며 화면이 저장소로 바로 건너뛰지 않습니다.**

계층형은 화면을 바꿀 때나 저장 방식을 바꿀 때 어디를 고쳐야 하는지가 분명하도록 시스템을 **책임이 다른 층(layer)으로 위아래로 쌓는** 방식입니다. 각 층은 **바로 아래층하고만** 대화하고 그보다 더 아래층은 직접 부르지 않습니다.

층은 보통 4개로 나눕니다.

- **화면(Presentation):** 사용자에게 보이는 부분
- **비즈니스(Business):** 「할인은 얼마」처럼 서비스의 실제 규칙을 계산하는 로직
- **데이터 접근(Data Access):** DB(데이터베이스, 데이터를 저장하고 꺼내 주는 프로그램)에 읽기와 쓰기를 요청하는 통로
- **영속성(Persistence):** 데이터를 실제로 저장하는 곳. 영속성은 프로그램이 꺼져도 데이터가 남는 성질을 말합니다.

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
<figcaption style="margin-top:0.75rem; font-size:0.9rem; color:var(--text-muted)">요청은 위층에서 아래층으로 한 층씩 내려갑니다. 각 층은 바로 아래층만 알면 되므로 층마다 맡은 일이 분명하게 나뉩니다. 오른쪽 Infrastructure(인프라)는 로깅, 보안처럼 모든 층을 받치는 기반입니다.</figcaption>
</figure>

화면을 바꾸려면 맨 위 화면 층만 고치고 저장 방식을 바꾸려면 아래쪽 데이터 접근 층과 영속성 층만 고치면 되므로 **고칠 곳이 분명합니다.** 계층형은 가장 전통적이고 이해하기 쉬운 구조라서 많은 앱이 기본 골격으로 씁니다.

- **좋을 때:** 역할 구분이 중요하고 팀도 층별로 나뉘어 일할 때 잘 맞습니다.
- **조심할 점:** 간단한 요청도 모든 층을 차례로 거쳐야 해서 느려질 수 있습니다. 층을 너무 형식적으로 나누면 받은 요청을 아래층에 넘기기만 하는 「그냥 통과만 하는 층」이 생깁니다.

---

## 3. 모놀리식 (Monolithic) — 모든 기능을 한 덩어리로 배포하는 구조

**모놀리식에서는 게시글, 댓글, 그룹, 미디어 기능이 모두 한 프로그램 안에 있고 한꺼번에 서버에 올라갑니다. 서비스가 작을 때는 이만큼 편한 방식이 없습니다.**

서비스를 막 시작한 단계에서는 「복잡하게 쪼개지 말고 일단 만들자」가 통합니다. 모놀리식은 모든 기능을 하나의 덩어리로 만들어 한꺼번에 배포하는 방식입니다. 배포(deploy)는 고친 코드를 실제 서비스가 도는 서버에 올려 사용자가 쓰게 하는 일입니다.

<figure style="text-align:center; margin:2rem 0;">
<svg viewBox="0 0 600 220" role="img" aria-label="사용자가 하나의 큰 애플리케이션에 접속하고, 그 안에 게시글, 댓글, 그룹, 미디어 기능이 모두 들어 있으며, 하나의 데이터베이스를 함께 쓴다." style="width:100%; max-width:580px; height:auto; font-family:var(--font-sans)">
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
<figcaption style="margin-top:0.75rem; font-size:0.9rem; color:var(--text-muted)">모든 기능이 한 덩어리 안에 있고 DB 하나를 함께 씁니다. 시작은 단순하고 빠르지만 서비스가 커질수록 덩어리가 무거워집니다.</figcaption>
</figure>

코드가 한 곳에 모여 있으므로 **시작이 가장 빠르고 단순합니다.** 작은 서비스나 초기 스타트업에는 모놀리식이 정답일 때가 많습니다.

- **좋을 때:** 초기 단계, 작은 팀, 단순한 서비스.
- **조심할 점:** 서비스가 커지면 한 덩어리가 너무 무거워집니다. 한 덩어리라 작은 수정에도 전체를 다시 배포해야 하고 한 부분의 장애가 전체를 멈출 수 있습니다.

다음 절의 마이크로서비스는 바로 이 한계를 풀려고 나온 패턴입니다.

---

## 4. 마이크로서비스 (Microservices) — 따로 도는 작은 서비스 여러 개

**마이크로서비스에서는 상품, 장바구니, 할인, 주문 서비스가 저마다 따로 돌고 저마다 DB 를 가집니다. 할인 서비스가 멈춰도 주문은 받습니다.**

모놀리식은 모든 기능이 한 덩어리라서 기능 하나를 고쳐도 전체를 다시 배포해야 했습니다. 마이크로서비스는 그 덩어리를 **작고 독립적인 서비스 여러 개로 쪼개고 서비스마다 자기 DB 를 따로** 두는 방식입니다.

사용자의 요청은 먼저 **API 게이트웨이(API gateway)**를 거칩니다. API 게이트웨이는 서비스들 앞에 놓인 입구로, 요청을 보고 「이 요청은 장바구니 담당」처럼 알맞은 서비스를 골라 보내 줍니다.

<figure style="text-align:center; margin:2rem 0;">
<svg viewBox="0 0 600 290" role="img" aria-label="사용자 요청이 API 게이트웨이를 거쳐 상품, 장바구니, 할인, 주문 네 개의 독립 서비스로 분배되고, 각 서비스는 자기만의 데이터베이스를 가진다." style="width:100%; max-width:600px; height:auto; font-family:var(--font-sans)">
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
<figcaption style="margin-top:0.75rem; font-size:0.9rem; color:var(--text-muted)">기능마다 서비스와 DB 가 따로 있습니다. 서비스 하나만 따로 배포하거나 확장할 수 있고 서비스 하나가 멈춰도 나머지는 계속 돕니다.</figcaption>
</figure>

서비스가 서로 독립적이라 **따로따로 배포하고 필요한 서비스만 골라 확장**할 수 있습니다. 여기서 확장은 서버 대수를 늘려 더 많은 요청을 받게 하는 일입니다. 주문이 몰리면 주문 서비스의 서버만 늘리면 됩니다. 서비스 하나가 멈춰도 나머지가 계속 돌아가는 점은 한 부분의 장애가 전체를 멈출 수 있는 모놀리식과 정반대입니다.

- **좋을 때:** 서비스가 크고 팀이 여러 개이며 부분마다 다르게 확장하고 싶을 때.
- **조심할 점:** 쪼갠 만큼 **서비스 사이의 통신과 관리가 복잡**해집니다. 서비스끼리 네트워크를 거쳐 대화하므로 느려질 수 있고 운영 난이도도 크게 올라갑니다. 「처음부터 마이크로서비스」는 대개 과합니다.

---

### 숫자로 확인 — 「더 안전하다」는 오해와 장애가 미치는 범위

**마이크로서비스는 더 안전한 구조가 아니라 장애가 미치는 범위를 좁히는 구조입니다. 가상 수치로 계산하면 기능 하나를 고치는 배포 한 번이 위험에 노출하는 사용자는 1,000,000명에서 125,000명으로 8배 줄지만 한 달 사고 건수는 0.6건에서 0.8건으로 늘어납니다.**

마이크로서비스를 두고 흔히 「장애에 강하다」고 말하지만 이 말은 절반만 맞습니다. 계산해 보면 어느 절반이 맞는지 정확히 보입니다. 이 코드에서 사고(incident)는 배포 때문에 서비스에 문제가 생긴 일이고 적을수록 좋습니다. 장애가 미치는 범위(blast radius, 코드의 `blast`)는 사고 한 건이 났을 때 영향을 받는 사용자 수이고 좁을수록 좋습니다.

아래 코드는 기능 8개, 기능마다 한 달에 배포 4번, 사용자 1,000,000명인 서비스를 모놀리식과 마이크로서비스로 운영할 때의 한 달 사고 건수와 영향받는 사용자를 비교합니다. 배포 1회가 사고로 이어질 확률은 모놀리식 2%, 마이크로서비스 2.5% 입니다. 코드는 서비스 사이의 호출이 늘어 배포 한 번의 위험이 조금 커진다고 가정해 마이크로서비스 쪽을 높게 두었습니다. 마지막 6단계는 서비스 수가 늘 때 서로 얽힐 수 있는 호출 경로가 몇 개인지 셉니다.

```python
# 하는 일: 기능 8개를 한 덩어리로 배포할 때와 기능별 서비스로 배포할 때, 월 사고 건수와 영향받는 사용자, 서비스 사이 호출 경로를 비교한다.

# 1단계: 기능 수와 배포 횟수, 사고 확률, 사용자 수를 둔다
# 흔한 오해는 "마이크로서비스가 더 안전하다"이다. 실제로는 "장애가 미치는 범위가 좁아지는 대신, 장애가 날 기회가 많아진다"가 정확하다. 수치는 가상이다.
FEATURES = 8            # 기능(도메인) 8개
DEPLOYS_PER_FEATURE = 4 # 기능마다 한 달에 4번 배포
FAIL_RATE = 0.02        # 배포 1회가 사고로 이어질 확률 2%
USERS = 1_000_000

# 2단계: 모놀리식의 월 사고와 영향을 센다
# 한 덩이라 기능 하나만 고쳐도 전체를 배포한다.
mono_deploys = FEATURES * DEPLOYS_PER_FEATURE      # 배포 횟수는 같다
mono_blast = USERS                                  # 장애가 나면 전체 사용자
mono_incidents = mono_deploys * FAIL_RATE
mono_affected = mono_incidents * mono_blast

# 3단계: 마이크로서비스의 월 사고와 영향을 센다
# 기능별로 따로 배포한다.
micro_deploys = FEATURES * DEPLOYS_PER_FEATURE
micro_blast = USERS / FEATURES                      # 그 기능을 쓰는 사용자만
# 대신 서비스 간 호출이 늘어 배포 1회의 위험이 조금 커진다고 가정
MICRO_FAIL_RATE = 0.025
micro_incidents = micro_deploys * MICRO_FAIL_RATE
micro_affected = micro_incidents * micro_blast

# 4단계: 두 구조의 월 배포와 사고, 영향을 표로 비교한다
print(f"기능 {FEATURES}개, 기능당 월 {DEPLOYS_PER_FEATURE}회 배포, 사용자 {USERS:,}명\n")
print(f"{'':16}{'월 배포':>8}{'사고 건수':>11}{'1건당 영향':>13}{'월 영향 사용자':>16}")
print(f"{'모놀리식':16}{mono_deploys:>8}{mono_incidents:>10.1f}건{mono_blast:>12,.0f}{mono_affected:>15,.0f}")
print(f"{'마이크로서비스':14}{micro_deploys:>8}{micro_incidents:>10.1f}건{micro_blast:>12,.0f}{micro_affected:>15,.0f}")
print(f"\n월 영향 사용자 차이  {mono_affected/micro_affected:.1f}배\n")

# 5단계: 기능 하나만 고치는 배포 한 번을 비교한다
print("기능 1개를 고치는 배포 한 번을 비교하면")
print(f"  모놀리식        전체를 다시 올린다 → 위험에 노출되는 사용자 {USERS:,}명")
print(f"  마이크로서비스   그 서비스만 올린다 → 위험에 노출되는 사용자 {micro_blast:,.0f}명")
print(f"  → 같은 한 줄 수정인데 영향 범위가 {USERS/micro_blast:.0f}배 다르다\n")

# 6단계: 서비스가 늘 때 얽히는 호출 경로를 센다
# 공짜가 아닌 부분이다. 서비스가 늘면 서비스 간 호출이 늘고, 그만큼 새로운 실패 지점이 생긴다.
print("대가: 서비스가 늘면 '사이'가 늘어난다")
print(f"{'서비스 수':>10}{'가능한 호출 경로':>18}{'설명':>10}")
for n in (1, 4, 8, 20):
    pairs = n * (n - 1) // 2
    print(f"{n:>9}개{pairs:>16}개")
print("  → 서비스 20개면 서로 얽힐 수 있는 짝이 190개다.")
print("  → 코드가 아니라 '사이'를 관리하는 일이 새로 생긴다(추적, 재시도, 타임아웃).")
print()
print("→ 마이크로서비스는 '더 안전한 구조'가 아니다. 장애가 미치는 범위를 좁히는 구조다.")
print("→ 기능이 적고 팀이 작다면 모놀리식이 오히려 사고가 적다. 관리할 '사이'가 없으니까.")

# 출력:
# 4단계 뜻: 배포는 둘 다 월 32번이다. 사고 건수는 마이크로서비스가 0.8건으로 모놀리식보다 많지만, 사고 1건의 영향이 1,000,000명과 125,000명이라 월 영향 사용자는 640,000명과 100,000명으로 6.4배 차이 난다.
# 기능 8개, 기능당 월 4회 배포, 사용자 1,000,000명
#
#                     월 배포      사고 건수       1건당 영향        월 영향 사용자
# 모놀리식                  32       0.6건   1,000,000        640,000
# 마이크로서비스             32       0.8건     125,000        100,000
#
# 월 영향 사용자 차이  6.4배
#
# 5단계 뜻: 기능 한 줄을 고칠 때 모놀리식은 1,000,000명을, 마이크로서비스는 125,000명을 위험에 노출해 8배 다르다.
# 기능 1개를 고치는 배포 한 번을 비교하면
#   모놀리식        전체를 다시 올린다 → 위험에 노출되는 사용자 1,000,000명
#   마이크로서비스   그 서비스만 올린다 → 위험에 노출되는 사용자 125,000명
#   → 같은 한 줄 수정인데 영향 범위가 8배 다르다
#
# 6단계 뜻: 서비스가 늘면 서로 얽힐 수 있는 호출 경로가 빠르게 늘어, 8개면 28개, 20개면 190개다.
# 대가: 서비스가 늘면 '사이'가 늘어난다
#      서비스 수         가능한 호출 경로        설명
#         1개               0개
#         4개               6개
#         8개              28개
#        20개             190개
#   → 서비스 20개면 서로 얽힐 수 있는 짝이 190개다.
#   → 코드가 아니라 '사이'를 관리하는 일이 새로 생긴다(추적, 재시도, 타임아웃).
#
# → 마이크로서비스는 '더 안전한 구조'가 아니다. 장애가 미치는 범위를 좁히는 구조다.
# → 기능이 적고 팀이 작다면 모놀리식이 오히려 사고가 적다. 관리할 '사이'가 없으니까.
```

4단계 표에서 한 달 배포 횟수는 기능 8개가 4번씩 배포해 8 × 4 = 32번입니다. 모놀리식도 기능 하나를 고칠 때마다 전체를 배포하므로 두 구조의 횟수는 같습니다. 사고 건수는 이 32번에 사고 확률을 곱한 값이라 마이크로서비스는 32 × 2.5% = 0.8건입니다. 모놀리식은 32 × 2% 를 소수 첫째 자리까지만 찍어 0.6건으로 나옵니다.

1건당 영향(장애가 미치는 범위)은 모놀리식이 전체를 다시 올리므로 사용자 전체인 1,000,000명입니다. 마이크로서비스는 사고가 난 기능을 쓰는 사용자만 영향을 받아 1,000,000 ÷ 8 = 125,000명입니다. 한 달에 영향받는 사용자는 사고 건수에 1건당 영향을 곱해 마이크로서비스가 0.8 × 125,000 = 100,000명, 모놀리식이 640,000명으로 6.4배 차이가 납니다. 모놀리식의 640,000명은 찍힌 0.6건이 아니라 반올림하기 전의 사고 건수로 곱한 값입니다.

6단계의 「가능한 호출 경로」는 서비스 n개 가운데 서로 부를 수 있는 두 서비스의 짝을 센 값으로, 코드는 n × (n − 1) ÷ 2 로 계산합니다. 서비스가 4개면 6개, 8개면 8 × 7 ÷ 2 = 28개, 20개면 190개라 서비스가 늘수록 빠르게 늘어납니다.

이 출력에서 세 가지를 읽을 수 있습니다.

- **장애가 미치는 범위가 좁아집니다.** 같은 한 줄 수정이 위험에 노출하는 사용자가 모놀리식은 100만 명, 마이크로서비스는 12.5만 명이라 8배 차이가 납니다.
- **장애가 날 기회는 오히려 늘어납니다.** 서비스 사이의 호출이 생겨 배포 한 번의 사고 확률이 2% 에서 2.5% 로 올라가므로(코드의 가정) 한 달 사고 건수도 0.6건에서 0.8건으로 늘어납니다.
- **서비스 「사이」를 관리하는 일이 새로 생깁니다.** 서비스가 20개면 서로 얽힐 수 있는 짝이 190개라 코드를 짜는 일과 별도로 **호출을 추적하고 재시도와 타임아웃을 정하는 일**이 업무가 됩니다. 추적(tracing)은 요청 하나가 어느 서비스들을 거쳤는지 따라가 보는 일입니다. 재시도(retry)는 실패한 호출을 다시 보내는 일, 타임아웃(timeout)은 답을 기다릴 최대 시간입니다.

그래서 기능이 적고 팀이 작다면 관리할 「사이」가 없는 모놀리식이 오히려 사고가 적습니다.

---

## 5. MVC — 화면, 로직, 중재자의 분리

**MVC 에서는 사용자의 입력을 중재자인 Controller 가 받아 데이터와 규칙을 맡은 Model 에 넘깁니다. Model 이 만든 결과는 화면인 View 가 사용자에게 보여 줍니다.**

MVC 는 주로 화면이 있는 앱(웹, 모바일)에서 화면과 로직을 따로 고칠 수 있도록 한 화면을 **Model, View, Controller 세 역할로 나누는** 방식입니다.

- **Model:** 데이터와 규칙. 실제 일을 하는 부분입니다.
- **View:** 사용자에게 보이는 화면입니다.
- **Controller:** 사용자의 입력을 받아 Model 과 View 를 연결하는 중재자입니다.

<figure style="text-align:center; margin:2rem 0;">
<svg viewBox="0 0 600 280" role="img" aria-label="사용자의 액션을 컨트롤러가 받아 모델을 갱신, 조회하고 모델은 DB와 데이터를 주고받는다. 컨트롤러가 뷰를 만들고 뷰가 사용자에게 화면을 보여주는 순환 구조." style="width:100%; max-width:580px; height:auto; font-family:var(--font-sans)">
<defs>
<marker id="mv-arr" markerWidth="9" markerHeight="9" refX="7" refY="3" orient="auto"><path d="M0,0 L7,3 L0,6 Z" style="fill:var(--accent-primary)"/></marker>
<marker id="mv-arr2" markerWidth="9" markerHeight="9" refX="7" refY="3" orient="auto"><path d="M0,0 L7,3 L0,6 Z" style="fill:var(--accent-secondary)"/></marker>
</defs>
<rect x="12" y="116" width="68" height="50" rx="9" style="fill:var(--bg-tertiary); stroke:var(--border-color); stroke-width:1.5"/>
<text x="46" y="146" text-anchor="middle" style="font-size:13px; fill:var(--text-primary)">User</text>
<rect x="232" y="40" width="146" height="52" rx="9" style="fill:var(--bg-tertiary); stroke:var(--accent-primary); stroke-width:1.8"/>
<text x="305" y="64" text-anchor="middle" style="font-size:13px; font-weight:700; fill:var(--accent-primary)">Controller</text>
<text x="305" y="81" text-anchor="middle" style="font-size:10px; fill:var(--text-muted)">중재자</text>
<rect x="440" y="40" width="140" height="52" rx="9" style="fill:var(--bg-tertiary); stroke:var(--accent-primary); stroke-width:1.6"/>
<text x="510" y="64" text-anchor="middle" style="font-size:13px; font-weight:700; fill:var(--accent-primary)">View</text>
<text x="510" y="81" text-anchor="middle" style="font-size:10px; fill:var(--text-muted)">화면</text>
<rect x="232" y="196" width="146" height="52" rx="9" style="fill:var(--bg-tertiary); stroke:var(--accent-primary); stroke-width:1.6"/>
<text x="305" y="220" text-anchor="middle" style="font-size:13px; font-weight:700; fill:var(--accent-primary)">Model</text>
<text x="305" y="237" text-anchor="middle" style="font-size:10px; fill:var(--text-muted)">데이터, 규칙</text>
<path d="M470,210 v18 a28,7 0 0,0 56,0 v-18" style="fill:var(--bg-tertiary); stroke:var(--accent-secondary); stroke-width:1.5"/>
<ellipse cx="498" cy="210" rx="28" ry="7" style="fill:var(--bg-tertiary); stroke:var(--accent-secondary); stroke-width:1.5"/>
<text x="498" y="226" text-anchor="middle" style="font-size:11px; font-weight:700; fill:var(--accent-secondary)">DB</text>
<line x1="62" y1="116" x2="238" y2="64" style="stroke:var(--accent-primary); stroke-width:1.8" marker-end="url(#mv-arr)"/>
<text x="138" y="79" text-anchor="middle" style="font-size:10.5px; fill:var(--text-muted)">① 사용자 액션</text>
<line x1="378" y1="66" x2="438" y2="66" style="stroke:var(--accent-primary); stroke-width:1.8" marker-end="url(#mv-arr)"/>
<text x="408" y="56" text-anchor="middle" style="font-size:10.5px; fill:var(--text-muted)">② 화면 생성</text>
<line x1="305" y1="92" x2="305" y2="194" style="stroke:var(--accent-primary); stroke-width:1.8" marker-end="url(#mv-arr)"/>
<text x="356" y="148" text-anchor="middle" style="font-size:10.5px; fill:var(--text-muted)">③ 갱신, 조회</text>
<line x1="378" y1="222" x2="466" y2="222" style="stroke:var(--accent-secondary); stroke-width:1.6" marker-end="url(#mv-arr2)" marker-start="url(#mv-arr2)"/>
<text x="420" y="212" text-anchor="middle" style="font-size:10.5px; fill:var(--text-muted)">④ 데이터</text>
<line x1="440" y1="86" x2="84" y2="150" style="stroke:var(--accent-primary); stroke-width:1.8" marker-end="url(#mv-arr)"/>
<text x="250" y="116" text-anchor="middle" style="font-size:10.5px; fill:var(--text-muted)">⑤ 화면 표시</text>
</svg>
<figcaption style="margin-top:0.75rem; font-size:0.9rem; color:var(--text-muted)">사용자 액션을 받은 Controller 가 Model 을 갱신하거나 조회하면 Model 이 DB 와 데이터를 주고받습니다. 그다음 Controller 가 만든 View 가 사용자에게 화면을 보여 줍니다. 역할이 3가지로 나뉘어 있어 화면만 바꾸거나 로직만 바꾸기 쉽습니다.</figcaption>
</figure>

화면을 맡은 View 와 로직을 맡은 Model 이 나뉘어 있으므로 **디자인을 전부 바꿔도 로직은 그대로** 둘 수 있고 로직을 바꿀 때도 화면은 그대로 둘 수 있습니다. 그래서 MVC 는 거의 모든 웹, 앱 프레임워크(앱을 만들 때 기본 뼈대를 제공하는 도구)의 기본 사고방식이 되었습니다.

- **좋을 때:** 화면이 있는 거의 모든 앱.
- **조심할 점:** 규모가 커지면 일이 다 Controller 로 몰려 Controller 가 비대해지기 쉽습니다. MVVM(Model-View-ViewModel) 같은 변형은 그래서 나왔습니다.

> **헷갈리기 쉬운 점:** MVC 는 **앱 하나의 내부를 나누는** 방식입니다. 반면 앞에서 본 모놀리식과 마이크로서비스는 **앱 전체를 어떤 단위로 배포할지** 정하는 방식입니다. 나누는 대상이 서로 다른 분류라 함께 쓸 수 있습니다. 예를 들어 마이크로서비스로 나눈 서비스 하나하나가 안에서는 MVC 구조일 수 있습니다.

---

## 6. 마스터-슬레이브 (Master-Slave) — 쓰기는 한 곳, 읽기는 여러 곳

**마스터-슬레이브에서 쓰기는 원본 DB 한 대에만 합니다. 읽기는 원본을 복제한 복사본 여러 대가 나눠 받습니다.**

DB 한 대가 읽기와 쓰기를 모두 받으면 요청이 늘 때 서버를 더 큰 것으로 바꾸는 수밖에 없습니다. 그런데 이 방법(수직 확장)은 한계가 금방 옵니다. 마스터-슬레이브는 **읽기와 쓰기 일을 나눠 여러 대에 분산**하는 방식이고 주로 데이터베이스에서 씁니다.

**쓰기(write)는 마스터 한 곳에만** 합니다. 마스터는 바뀐 내용을 여러 **슬레이브(복제본)**에 복사(replicate)해 둡니다. **읽기(read)는 그 슬레이브들이 나눠** 처리합니다. 보통 읽기가 쓰기보다 훨씬 많으므로 이렇게 나누면 부하(서버가 처리해야 하는 요청의 양)가 여러 대로 분산됩니다.

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
<text x="330" y="86" text-anchor="middle" style="font-size:10px; fill:var(--text-muted)">Primary, 쓰기</text>
<path d="M282,190 v46 a48,10 0 0,0 96,0 v-46" style="fill:var(--bg-tertiary); stroke:var(--accent-secondary); stroke-width:1.5"/>
<ellipse cx="330" cy="190" rx="48" ry="10" style="fill:var(--bg-tertiary); stroke:var(--accent-secondary); stroke-width:1.5"/>
<text x="330" y="214" text-anchor="middle" style="font-size:12px; font-weight:700; fill:var(--accent-secondary)">복제본 1</text>
<text x="330" y="229" text-anchor="middle" style="font-size:9.5px; fill:var(--text-muted)">Replica, 읽기</text>
<path d="M472,190 v46 a48,10 0 0,0 96,0 v-46" style="fill:var(--bg-tertiary); stroke:var(--accent-secondary); stroke-width:1.5"/>
<ellipse cx="520" cy="190" rx="48" ry="10" style="fill:var(--bg-tertiary); stroke:var(--accent-secondary); stroke-width:1.5"/>
<text x="520" y="214" text-anchor="middle" style="font-size:12px; font-weight:700; fill:var(--accent-secondary)">복제본 2</text>
<text x="520" y="229" text-anchor="middle" style="font-size:9.5px; fill:var(--text-muted)">Replica, 읽기</text>
<line x1="110" y1="122" x2="280" y2="74" style="stroke:var(--accent-primary); stroke-width:2" marker-end="url(#md-arr)"/>
<text x="188" y="86" text-anchor="middle" style="font-size:11px; fill:var(--accent-primary); font-weight:700">쓰기 write</text>
<line x1="110" y1="150" x2="280" y2="206" style="stroke:var(--accent-primary); stroke-width:2" marker-end="url(#md-arr)"/>
<text x="186" y="198" text-anchor="middle" style="font-size:11px; fill:var(--accent-primary); font-weight:700">읽기 read</text>
<line x1="330" y1="96" x2="330" y2="178" style="stroke:var(--accent-secondary); stroke-width:1.7; stroke-dasharray:6 4" marker-end="url(#md-arr2)"/>
<line x1="372" y1="84" x2="486" y2="180" style="stroke:var(--accent-secondary); stroke-width:1.7; stroke-dasharray:6 4" marker-end="url(#md-arr2)"/>
<text x="430" y="120" text-anchor="middle" style="font-size:11px; fill:var(--accent-secondary)">복제 replicate</text>
</svg>
<figcaption style="margin-top:0.75rem; font-size:0.9rem; color:var(--text-muted)">쓰기는 마스터 한 곳으로만 갑니다. 마스터가 바뀐 내용을 복제본으로 보내 두면 읽기는 복제본들이 나눠 처리하므로 읽기 부하가 많은 서비스에 잘 맞습니다.</figcaption>
</figure>

읽기 요청을 복제본 여러 대가 나눠 받으므로 **조회가 빠르고 트래픽이 늘어도 복제본만 더 두면** 됩니다. 복제본은 마스터가 잘못되었을 때를 대비한 **백업** 역할도 합니다.

- **좋을 때:** 읽기가 쓰기보다 압도적으로 많은 서비스. 대부분의 웹 서비스가 여기에 속합니다.
- **조심할 점:** 마스터가 바뀐 내용을 복제본에 복사하기까지 약간의 시간차가 있어서 방금 쓴 글이 복제본에는 아직 없을 수 있습니다. 이 시간차를 **복제 지연**(replication lag)이라고 합니다. 또 마스터가 죽으면 쓰기가 막히므로 복제본 가운데 하나를 새 마스터로 승격하는 장치(failover)가 필요합니다.

> **용어 노트:** 「master-slave」라는 말은 어감 문제로 점점 쓰지 않습니다. 요즘은 **primary-replica**(주-복제본)나 **leader-follower**(리더-팔로워)라고 더 많이 부릅니다. 이름만 다르고 뜻은 같습니다.

---

### 숫자로 확인 — 읽기 비율에 따라 필요한 복사본 대수

**가상 수치로 초당 12,000건의 요청 가운데 95% 가 읽기라면 원본 1대와 복사본 6대, 모두 7대로 감당합니다. 읽기가 50% 나 80% 면 쓰기 요청만으로 원본이 먼저 한계에 닿아 복사본을 늘려도 풀리지 않습니다. 복사본을 두는 대가는 복제 지연입니다.**

복사본을 두면 좋다는 데까지는 알아도 몇 대가 필요한지는 계산해 봐야 압니다. 이 계산에서는 용어 노트의 primary-replica 이름을 따라 마스터를 원본(primary), 슬레이브(복제본)를 복사본(replica)이라고 부릅니다. 요청량은 QPS(Queries Per Second, 1초에 들어오는 요청 수)로 셉니다.

아래 코드는 원본 하나에 복사본이 몇 대 필요한지 구합니다. 초당 12,000건(12,000 QPS)이 들어오고 그중 95% 가 게시글 보기나 목록 같은 읽기인 서비스를 가상 수치로 둡니다. 서버 한 대는 초당 2,000건을 감당한다고 가정합니다. 원본 1대만 쓸 때와 복사본을 둘 때를 비교한 다음 읽기 비율을 50%, 80%, 95%, 99% 로 바꿔 보고 마지막에 복제 지연의 대가를 찍습니다.

```python
# 하는 일: 초당 12,000건 가운데 95% 가 읽기인 서비스에 원본 하나와 복사본 몇 대가 필요한지 구하고, 읽기 비율이 바뀔 때와 복제 지연의 대가를 본다.

# 1단계: 요청 총량과 읽기 비율, 서버 한 대의 처리량을 두고 읽기와 쓰기 요청량을 구한다
# 원본(primary)은 쓰기를 받고, 복사본(replica)은 읽기만 받는다. 웹 서비스는 대개 읽기가 압도적으로 많아서 이 구조가 잘 통한다.
TOTAL_QPS = 12_000          # 초당 요청 총량
READ_SHARE = 0.95           # 그중 95%가 읽기 (게시글 보기, 목록 등)
CAPACITY_PER_NODE = 2_000   # 서버 한 대가 감당하는 초당 요청 (가상 수치)

reads = TOTAL_QPS * READ_SHARE
writes = TOTAL_QPS - reads

print(f"총 {TOTAL_QPS:,} QPS, 읽기 {reads:,.0f} ({READ_SHARE:.0%}), 쓰기 {writes:,.0f}")
print(f"서버 1대 처리량 {CAPACITY_PER_NODE:,} QPS (가상 수치)\n")

# 2단계: 원본 1대로만 버틸 때를 본다
print("① 원본 1대만 쓸 때")
print(f"   필요 처리량 {TOTAL_QPS:,} vs 가능 {CAPACITY_PER_NODE:,}"
      f"  →  {TOTAL_QPS/CAPACITY_PER_NODE:.1f}배 초과")
print("   서버를 더 크게 사는 방법밖에 없다(수직 확장). 한계가 금방 온다.\n")

# 3단계: 복사본을 둘 때 필요한 대수를 구한다
import math
replicas = math.ceil(reads / CAPACITY_PER_NODE)
print("② 원본 1대 + 복사본 N대")
print(f"   쓰기 {writes:,.0f} QPS → 원본 1대로 충분 (여유 {CAPACITY_PER_NODE - writes:,.0f})")
print(f"   읽기 {reads:,.0f} QPS → 복사본 {replicas}대 필요"
      f" ({reads:,.0f} ÷ {CAPACITY_PER_NODE:,} = {reads/CAPACITY_PER_NODE:.1f} → 올림)")
print(f"   합계 {1 + replicas}대\n")

# 4단계: 읽기 비율마다 필요한 대수와 원본 여유를 본다
print("읽기 비율이 바뀌면 필요한 대수도 바뀐다")
print(f"{'읽기 비율':>10}{'복사본':>8}{'원본 여유':>12}{'판정':>18}")
for share in (0.50, 0.80, 0.95, 0.99):
    r = TOTAL_QPS * share
    w = TOTAL_QPS - r
    need = math.ceil(r / CAPACITY_PER_NODE)
    slack = CAPACITY_PER_NODE - w
    verdict = "원본이 먼저 한계에 닿는다" if slack < 0 else "복사본으로 해결"
    print(f"{share:>9.0%}{need:>8}대{slack:>10,.0f}{verdict:>18}")
print()
print("→ 읽기가 많을수록 이 구조가 잘 통한다. 복사본만 늘리면 되니까.")
print("→ 쓰기가 절반이면 원본이 먼저 한계에 닿는다. 그때는 복사본이 아니라 샤딩(쪼개기)이 답이다.")
print()

# 5단계: 복제 지연이라는 대가를 찍는다
LAG_MS = 150
print(f"대가는 복제 지연이다. 원본에 쓴 값이 복사본에 도착하기까지 약 {LAG_MS}ms 걸린다면,")
print(f"  글을 쓴 직후 새로고침하면 {LAG_MS}ms 안에는 '방금 쓴 글이 없다'고 나올 수 있다.")
print("  그래서 '내가 쓴 것'은 원본에서 읽고, '남이 쓴 것'만 복사본에서 읽는 규칙을 둔다.")

# 출력:
# 1단계 뜻: 12,000 QPS 가운데 95% 인 11,400 이 읽기이고 쓰기는 600 이다. 서버 1대는 2,000 QPS 를 감당한다.
# 총 12,000 QPS, 읽기 11,400 (95%), 쓰기 600
# 서버 1대 처리량 2,000 QPS (가상 수치)
#
# 2단계 뜻: 원본 1대로는 필요한 12,000 이 감당할 수 있는 2,000 의 6.0배라, 서버를 더 크게 사는 수직 확장밖에 없다.
# ① 원본 1대만 쓸 때
#    필요 처리량 12,000 vs 가능 2,000  →  6.0배 초과
#    서버를 더 크게 사는 방법밖에 없다(수직 확장). 한계가 금방 온다.
#
# 3단계 뜻: 쓰기 600 QPS 는 원본 1대로 충분하고, 읽기 11,400 QPS 는 복사본 6대가 받아 모두 7대면 된다.
# ② 원본 1대 + 복사본 N대
#    쓰기 600 QPS → 원본 1대로 충분 (여유 1,400)
#    읽기 11,400 QPS → 복사본 6대 필요 (11,400 ÷ 2,000 = 5.7 → 올림)
#    합계 7대
#
# 4단계 뜻: 읽기가 50%, 80% 면 원본 여유가 -4,000, -400 으로 원본이 먼저 한계에 닿는다. 95% 부터는 복사본 6대로 해결된다.
# 읽기 비율이 바뀌면 필요한 대수도 바뀐다
#      읽기 비율     복사본       원본 여유                판정
#       50%       3대    -4,000    원본이 먼저 한계에 닿는다
#       80%       5대      -400    원본이 먼저 한계에 닿는다
#       95%       6대     1,400          복사본으로 해결
#       99%       6대     1,880          복사본으로 해결
#
# → 읽기가 많을수록 이 구조가 잘 통한다. 복사본만 늘리면 되니까.
# → 쓰기가 절반이면 원본이 먼저 한계에 닿는다. 그때는 복사본이 아니라 샤딩(쪼개기)이 답이다.
#
# 5단계 뜻: 복사본이 원본을 150ms 늦게 따라오면 방금 쓴 글이 안 보일 수 있어서, 내가 쓴 것은 원본에서 읽는 규칙을 둔다.
# 대가는 복제 지연이다. 원본에 쓴 값이 복사본에 도착하기까지 약 150ms 걸린다면,
#   글을 쓴 직후 새로고침하면 150ms 안에는 '방금 쓴 글이 없다'고 나올 수 있다.
#   그래서 '내가 쓴 것'은 원본에서 읽고, '남이 쓴 것'만 복사본에서 읽는 규칙을 둔다.
```

1단계 출력에서 읽기는 12,000 × 95% = 11,400 QPS 이고 쓰기는 나머지 600 QPS 입니다. 2단계는 원본 1대만 쓸 때로, 필요한 처리량 12,000 이 서버 한 대가 감당하는 2,000 의 6.0배라 앞에서 말한 수직 확장밖에 방법이 없습니다.

3단계에서 쓰기 600 QPS 는 원본 1대가 받고도 2,000 − 600 = 1,400 이 남습니다. 읽기 11,400 QPS 는 11,400 ÷ 2,000 = 5.7 을 올림해 복사본 6대가 나눠 받으므로 원본까지 모두 7대면 됩니다.

4단계 표의 「원본 여유」는 서버 한 대의 처리량 2,000 에서 쓰기 요청을 뺀 값입니다. 이 값이 음수면 쓰기 요청만으로 원본 한 대의 처리량을 넘는다는 뜻입니다. **읽기가 50% 면 쓰기가 6,000 이라 원본 여유가 -4,000 이고 80% 에서도 -400 이라 원본이 먼저 한계에 닿습니다.** 복사본을 아무리 늘려도 쓰기는 원본이 모두 받아야 하므로 이때는 복사본이 아니라 **샤딩**이 필요합니다. 샤딩(sharding)은 데이터를 여러 원본으로 쪼개 쓰기도 원본 여러 대가 나눠 받게 하는 방법입니다.

읽기가 95% 와 99% 일 때는 복사본 6대로 해결되고 원본 여유도 1,400 과 1,880 이 남습니다. 웹 서비스는 게시글 하나를 쓰면 수천 명이 읽기 때문에 대개 읽기가 압도적이라 이 구조가 잘 통합니다.

대가는 **복제 지연**입니다. 원본에 쓴 값이 복사본에 도착하기까지는 시간이 걸립니다. 코드는 그 시간을 약 150ms(밀리초, 1,000분의 1초)로 가정했습니다. 그래서 글을 쓴 직후 새로고침하면 그 150ms 안에는 복사본에서 「방금 쓴 글이 없다」고 나올 수 있습니다. 실무에서는 이 문제를 막으려고 **「내가 쓴 것」은 원본에서 읽고 「남이 쓴 것」만 복사본에서 읽는다**는 규칙을 하나 둡니다.

---

## 패턴 선택 기준

**모든 상황에 맞는 정답 패턴은 없고 서비스의 규모, 팀, 트래픽에 맞춰 고릅니다.**

가장 흔하게 고민하는 선택은 모놀리식이냐 마이크로서비스냐입니다. 작게 시작할 때는 모놀리식이 빠릅니다. 서비스가 커져 부분마다 따로 키워야 할 때가 오면 그때 마이크로서비스로 쪼갭니다. 「처음부터 잘게 쪼개기」는 대개 과한 선택입니다.

이 패턴들은 **서로 배타적이지 않아서** 한 시스템 안에 섞여 쓰입니다. 흔한 조합을 하나 들면 다음 4가지가 함께 쓰일 수 있습니다.

- 마이크로서비스로 쪼갠 서비스 하나하나가 안에서는 계층형으로 나뉩니다.
- 그 안의 화면은 MVC 로 나뉩니다.
- DB 는 마스터-슬레이브로 읽기를 분산합니다.
- 서비스끼리는 이벤트로 대화합니다.

아래 표에 6가지 패턴을 한 줄씩 정리했습니다.

| 패턴 | 한 줄 핵심 | 이럴 때 |
|---|---|---|
| 이벤트 기반 | 사건으로 느슨하게 대화 | 알림, 결제 등 "한 사건 → 여러 처리" |
| 계층형 | 책임을 위아래 층으로 | 역할 구분이 중요한 일반 앱 |
| 모놀리식 | 한 덩어리로 한꺼번에 배포 | 초기, 소규모, 단순한 서비스 |
| 마이크로서비스 | 작은 서비스로 쪼갬 | 크고, 팀 여럿, 부분별 확장 |
| MVC | 화면, 로직, 중재 분리 | 화면이 있는 거의 모든 앱 |
| 마스터-슬레이브 | 읽기/쓰기 분산 | 읽기가 압도적으로 많을 때 |

### 고를 때 실제로 던지는 질문

**세 선택은 모두 같은 모양으로, 무언가를 얻으려면 새로운 종류의 문제를 받아들여야 합니다. 받아들이는 그 문제를 우리 상황에서 감당할 수 있는지가 선택의 기준입니다.**

1절, 4절, 6절의 계산을 한 표에 모으면 고를 때의 판단 기준이 보입니다. 표의 숫자는 이 글에서 쓴 가상 수치입니다.

| 선택 | 얻는 것 | 내주는 것 | 이 글의 숫자 |
|---|---|---|---|
| 직접 호출 → 이벤트 | 주문 가용성 99.2% → 99.85% (연 69.9→13.1시간) | "아직 안 된 일"이 남는다 (알림 30분 장애 = 6천 건 밀림) | 1절 |
| 모놀리식 → 마이크로서비스 | 배포 1회 영향 100만 → 12.5만 명 (8배) | 사고 건수 0.6 → 0.8건, 관리할 "사이" 190개 | 4절 |
| 단일 DB → 복사본 | 읽기 95%일 때 원본 1대와 복사본 6대, 모두 7대로 12,000 QPS 소화 | 복제 지연 (내가 쓴 글이 안 보임) | 6절 |

첫 줄은 주문이 덜 멈추는 대신 「아직 안 된 일」을, 둘째 줄은 장애가 미치는 범위가 좁아지는 대신 늘어난 사고와 관리할 「사이」를, 셋째 줄은 읽기를 여러 대가 나눠 받는 대신 복제 지연을 받아들입니다.

읽기가 절반인 서비스에 복사본을 늘리는 것은 답이 아닙니다. 6절 표에서 읽기가 50% 면 원본 여유가 -4,000 이라 쓰기만으로 원본이 먼저 한계에 닿았습니다. 기능이 3개인 서비스를 마이크로서비스로 쪼개는 것도 답이 아닙니다. 4절에서 본 대로 기능이 적고 팀이 작으면 관리할 「사이」가 없는 모놀리식이 오히려 사고가 적습니다.

:::deep 더 깊이 — 「나중에 쪼개기」가 「처음부터 쪼개기」보다 쉬운 까닭

「어차피 커질 텐데 처음부터 마이크로서비스로 가면 안 될까?」 하는 물음은 자연스럽습니다. 실무에서는 대개 「아니오」라고 답합니다. 까닭은 기술이 아니라 **정보**에 있습니다.

서비스를 쪼갤 때 가장 어려운 결정은 서비스 사이의 **경계를 어디에 그을지**입니다. 경계(boundary)는 어떤 기능과 데이터가 어느 서비스에 속하는지를 나누는 선입니다. 주문과 결제를 한 서비스에 둘지 나눌지, 재고가 주문 서비스에 속하는지 상품 서비스에 속하는지 같은 물음에는 **실제로 어떤 코드가 함께 바뀌는지**를 봐야 답할 수 있습니다.

그런데 어떤 코드가 함께 바뀌는지는 서비스를 만들어 한동안 운영해 본 뒤에야 알 수 있으므로 처음에는 아무도 모릅니다. 모르는 상태에서 그은 경계는 대개 틀립니다. 틀린 경계는 두 서비스에 걸친 기능 하나를 바꿀 때마다 배포 두 번을 맞춰 조율해야 하고 데이터를 옮길 때는 두 DB 를 동시에 고쳐야 하므로 **고치기가 가장 비쌉니다.**

모놀리식에서는 반대로 경계를 잘못 그었어도 함수를 다른 곳으로 옮기면 끝납니다. 그렇게 운영하다가 「이 부분만 유독 자주 바뀌고 트래픽도 이 부분에만 따로 몰린다」는 사실이 보이면 그때 그 부분을 떼어 냅니다. **그 시점에는 경계가 이미 데이터로 보입니다.**

처음부터 쪼개면 정보가 없는 상태에서 되돌리기 어려운 결정을 내립니다. 나중에 쪼개면 정보가 쌓인 뒤에 되돌리기 쉬운 결정을 내립니다.
:::

**한 문장 요약:** 아키텍처는 「어떻게 나누고, 어떻게 대화하게 할까」라는 두 질문에 대한 답입니다.

---

시스템을 이렇게 설계했다면 이제 그 시스템을 실제 서버에서 돌리고 바깥 사용자가 부를 수 있게 열어 주는 일이 남습니다. [쿠버네티스 네트워킹 글](post.html?id=kubernetes-networking)에서는 앱이 실제로 도는 Pod, 그 앞의 고정 주소인 Service, 바깥 요청이 들어오는 입구인 Ingress 가 트래픽을 어떻게 전달하는지 이 글과 같은 방식으로 풀어 봅니다.
