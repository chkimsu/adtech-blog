내 앱을 서버에 띄워 두었다고 해 봅시다. 사용자가 휴대폰에서 `example.com` 을 입력하면 그 요청은 어떤 길을 거쳐 정확히 내 앱까지 도착할까요?

쿠버네티스(Kubernetes, 줄여서 k8s)는 여러 서버 위에 앱을 띄우고 관리해 주는 시스템입니다. 쿠버네티스에서는 사용자의 요청이 앱까지 가는 길을 **세 가지 부품**인 Pod, Service, Ingress 가 차례로 연결해 만듭니다. 요청은 Ingress, Service, Pod 순서로 지나가지만 이 글은 거꾸로 **Pod → Service → Ingress** 순서로 봅니다. 뒤 부품은 바로 앞 부품이 풀지 못한 한계를 하나씩 메우려고 있으므로, 이름만 보면 막막한 세 부품도 Pod 부터 차례로 보면 왜 다음 부품이 필요한지가 보입니다.

> **한 줄 요약:** Pod 는 앱이 실제로 도는 자리이고 새로 뜰 때마다 IP 주소가 바뀌므로, 그 앞에 바뀌지 않는 고정 주소인 Service 를 둡니다. Service 주소는 클러스터(쿠버네티스가 관리하는 서버 전체) 안에서만 통하므로 바깥에서 오는 요청은 입구인 Ingress 가 받아 알맞은 Service 로 넘깁니다. 요청은 Ingress 로 들어와 Service 를 거쳐 Pod 에 닿습니다. 요청을 보내는 쪽이 Pod IP 를 직접 외워 두면 Service 주소 하나만 외울 때보다 한 달 실패 요청이 33배 많습니다(가상 계산).

먼저 세 부품이 연결된 전체 모습을 그림 한 장으로 보겠습니다. 요청은 왼쪽의 사용자에서 출발해 오른쪽의 앱으로 가는데, Ingress 칸의 `example.com` 은 사용자가 입력한 주소이고 Service 칸의 `10.96.0.1` 은 Service 의 고정 IP 이며 오른쪽 점선 상자 안의 Pod 3개에서 앱이 실제로 돕니다.

<figure style="text-align:center; margin:2rem 0;">
<svg viewBox="0 0 700 200" role="img" aria-label="사용자 요청이 Ingress를 거쳐 Service로, Service에서 Deployment 안의 여러 Pod로 전달되는 왼쪽에서 오른쪽 흐름." style="width:100%; max-width:680px; height:auto; font-family:var(--font-sans)">
<defs>
<marker id="kov-arr" markerWidth="10" markerHeight="10" refX="8" refY="3" orient="auto"><path d="M0,0 L8,3 L0,6 Z" style="fill:var(--accent-primary)"/></marker>
</defs>
<rect x="12" y="74" width="96" height="56" rx="9" style="fill:var(--bg-tertiary); stroke:var(--border-color); stroke-width:1.5"/>
<text x="60" y="100" text-anchor="middle" style="font-size:13px; fill:var(--text-primary)">사용자</text>
<text x="60" y="117" text-anchor="middle" style="font-size:9.5px; fill:var(--text-muted)">웹, 모바일, API</text>
<line x1="108" y1="102" x2="148" y2="102" style="stroke:var(--accent-primary); stroke-width:2" marker-end="url(#kov-arr)"/>
<rect x="150" y="66" width="138" height="74" rx="10" style="fill:var(--bg-secondary); stroke:var(--accent-primary); stroke-width:1.8"/>
<text x="219" y="94" text-anchor="middle" style="font-size:14px; font-weight:700; fill:var(--accent-primary)">Ingress</text>
<text x="219" y="111" text-anchor="middle" style="font-size:10px; fill:var(--text-muted)">외부 입구</text>
<text x="219" y="127" text-anchor="middle" style="font-size:10px; fill:var(--text-primary); font-family:var(--font-mono)">example.com</text>
<line x1="288" y1="102" x2="328" y2="102" style="stroke:var(--accent-primary); stroke-width:2" marker-end="url(#kov-arr)"/>
<rect x="330" y="66" width="138" height="74" rx="10" style="fill:var(--bg-secondary); stroke:var(--accent-secondary); stroke-width:1.8"/>
<text x="399" y="94" text-anchor="middle" style="font-size:14px; font-weight:700; fill:var(--accent-secondary)">Service</text>
<text x="399" y="111" text-anchor="middle" style="font-size:10px; fill:var(--text-muted)">안정적 주소</text>
<text x="399" y="127" text-anchor="middle" style="font-size:10px; fill:var(--text-primary); font-family:var(--font-mono)">10.96.0.1</text>
<line x1="468" y1="102" x2="508" y2="102" style="stroke:var(--accent-primary); stroke-width:2" marker-end="url(#kov-arr)"/>
<rect x="512" y="36" width="176" height="132" rx="10" style="fill:none; stroke:var(--text-muted); stroke-width:1.4; stroke-dasharray:6 4"/>
<text x="600" y="54" text-anchor="middle" style="font-size:11px; fill:var(--text-muted)">Deployment</text>
<rect x="528" y="64" width="144" height="28" rx="6" style="fill:var(--bg-tertiary); stroke:var(--accent-primary); stroke-width:1.4"/>
<text x="600" y="83" text-anchor="middle" style="font-size:12px; fill:var(--text-primary)">Pod</text>
<rect x="528" y="98" width="144" height="28" rx="6" style="fill:var(--bg-tertiary); stroke:var(--accent-primary); stroke-width:1.4"/>
<text x="600" y="117" text-anchor="middle" style="font-size:12px; fill:var(--text-primary)">Pod</text>
<rect x="528" y="132" width="144" height="28" rx="6" style="fill:var(--bg-tertiary); stroke:var(--accent-primary); stroke-width:1.4"/>
<text x="600" y="151" text-anchor="middle" style="font-size:12px; fill:var(--text-primary)">Pod</text>
</svg>
<figcaption style="margin-top:0.75rem; font-size:0.9rem; color:var(--text-muted)">요청은 Ingress → Service → Pod 순서로 지나갑니다. 이제 세 부품을 Pod 부터 하나씩 살펴봅니다.</figcaption>
</figure>

---

## 1. Pod — 앱이 실제로 도는 자리

**Pod 는 앱이 실제로 도는 단위로, 자주 죽고 새로 뜨며 그때마다 IP 주소가 바뀝니다.**

요청이 마지막에 도착하는 곳이 Pod 이고 다음 절의 Service 는 Pod 의 이 성질 때문에 필요해지므로, 요청이 지나는 길을 따라가기 전에 Pod 부터 봅니다.

Pod 는 쿠버네티스에서 앱이 실제로 도는 가장 작은 단위로, 그 안에 여러분이 만든 앱이 컨테이너로 들어 있습니다. 컨테이너(container)는 앱과 그 앱이 돌아가는 데 필요한 라이브러리를 하나로 묶어 어느 서버에서나 같은 모양으로 실행되게 만든 실행 단위입니다.

쿠버네티스에서는 보통 Pod 를 하나씩 직접 만들지 않고 Deployment 에 「이 앱 Pod 를 3개 유지해」 하고 맡깁니다. Deployment 는 같은 Pod 를 몇 개 띄워 둘지 적어 두는 쿠버네티스 설정입니다. 개수를 3으로 적어 두면 Deployment 가 Pod 3개를 알아서 띄우고 그 뒤로도 3개가 유지되도록 관리합니다.

Pod 는 수명이 짧습니다(ephemeral). Pod 가 죽으면 쿠버네티스가 똑같은 새 Pod 를 띄워 개수를 다시 맞추는데, 새로 뜬 Pod 는 죽은 Pod 와 IP 주소가 다릅니다. IP 주소는 네트워크에서 요청을 보낼 상대를 찾아갈 때 쓰는 숫자 주소이며 아래 그림의 `10.1.2.7` 같은 값을 말합니다. 새 버전을 배포할 때도 Pod 가 새로 만들어지므로 Pod 의 IP 는 Pod 가 죽을 때뿐 아니라 배포할 때마다 바뀝니다.

아래 그림은 Deployment 가 Pod 3개를 유지하는 모습입니다. `10.1.2.9` 였던 Pod 가 종료되자 새 Pod 가 그 자리를 채웠는데, 새 Pod 의 IP 는 `10.1.2.17` 로 바뀌었습니다.

<figure style="text-align:center; margin:2rem 0;">
<svg viewBox="0 0 560 196" role="img" aria-label="Deployment가 Pod 3개를 유지한다. 하나가 죽으면 IP가 다른 새 Pod가 그 자리를 대신한다." style="width:100%; max-width:560px; height:auto; font-family:var(--font-sans)">
<defs>
<marker id="kpod-arr" markerWidth="9" markerHeight="9" refX="7" refY="3" orient="auto"><path d="M0,0 L7,3 L0,6 Z" style="fill:var(--text-muted)"/></marker>
</defs>
<rect x="20" y="24" width="520" height="120" rx="10" style="fill:none; stroke:var(--text-muted); stroke-width:1.4; stroke-dasharray:6 4"/>
<text x="40" y="44" style="font-size:11px; fill:var(--text-muted)">Deployment — "Pod 3개를 항상 유지해"</text>
<rect x="46" y="62" width="138" height="62" rx="8" style="fill:var(--bg-tertiary); stroke:var(--accent-primary); stroke-width:1.6"/>
<text x="115" y="89" text-anchor="middle" style="font-size:13px; font-weight:700; fill:var(--accent-primary)">Pod</text>
<text x="115" y="108" text-anchor="middle" style="font-size:10px; fill:var(--text-primary); font-family:var(--font-mono)">10.1.2.7</text>
<rect x="200" y="62" width="138" height="62" rx="8" style="fill:var(--bg-tertiary); stroke:var(--accent-primary); stroke-width:1.6"/>
<text x="269" y="89" text-anchor="middle" style="font-size:13px; font-weight:700; fill:var(--accent-primary)">Pod</text>
<text x="269" y="108" text-anchor="middle" style="font-size:10px; fill:var(--text-primary); font-family:var(--font-mono)">10.1.2.8</text>
<rect x="354" y="62" width="138" height="62" rx="8" style="fill:var(--bg-secondary); stroke:var(--text-muted); stroke-width:1.5; stroke-dasharray:5 4"/>
<text x="423" y="86" text-anchor="middle" style="font-size:11px; fill:var(--text-muted)">옛 Pod 종료 ✕</text>
<text x="423" y="103" text-anchor="middle" style="font-size:10px; fill:var(--text-muted)" text-decoration="line-through">10.1.2.9</text>
<text x="423" y="117" text-anchor="middle" style="font-size:10px; fill:var(--accent-primary); font-family:var(--font-mono)">→ 10.1.2.17 (새 IP)</text>
<text x="280" y="172" text-anchor="middle" style="font-size:12px; fill:var(--text-muted)">Pod는 언제든 죽고 새로 뜬다 — 그때마다 주소(IP)가 바뀐다.</text>
</svg>
<figcaption style="margin-top:0.75rem; font-size:0.9rem; color:var(--text-muted)">Pod 는 죽고 새로 뜨기를 되풀이합니다. 개수는 그대로 유지되지만 주소는 그때마다 달라집니다.</figcaption>
</figure>

그러면 이 앱을 부르는 쪽이 곤란해집니다. 요청을 보내려면 상대의 주소를 알아야 하는데, 알아 둔 Pod 주소는 배포가 한 번 지나가면 이미 사라진 Pod 를 가리킬 수 있습니다. 그렇다고 요청을 보낼 때마다 「지금 그 Pod 주소가 뭐지?」 하고 물어볼 수도 없으므로, Pod 가 바뀌어도 그대로인 고정된 주소가 필요합니다. 다음 절의 Service 가 그 주소입니다.

---

## 2. Service — 바뀌는 Pod 앞에 놓인 고정 주소

**Pod 가 죽고 새로 떠도 Service 의 IP 와 이름은 그대로이므로, 앱을 부르는 쪽은 Service 주소 하나만 알면 됩니다.**

Service 는 1절에서 본 대로 자꾸 바뀌는 Pod 들 앞에 놓이는, 바뀌지 않는 주소 하나입니다. Service 는 고정 IP(예: `10.96.0.1`)와 DNS 이름을 가집니다. DNS 는 사람이 읽는 이름을 IP 주소로 바꿔 주는 시스템입니다. 그래서 부르는 쪽은 IP 를 몰라도 Service 이름으로 요청을 보낼 수 있습니다.

이 앱을 부르는 쪽이 Service 주소로 요청을 보내면 Service 가 그 뒤의 Pod 가운데 살아 있는 Pod 하나로 요청을 알아서 넘겨 주므로, 부르는 쪽은 지금 어떤 Pod 가 살아 있고 그 IP 가 무엇인지 몰라도 됩니다.

Service 는 요청이 한 Pod 에 몰리지 않도록 여러 Pod 에 고르게 나눠 보내는 부하 분산(load balancing)도 합니다. 아래 그림에서는 `10.96.0.1` 로 들어온 요청이 Pod 3개로 나뉘어 갑니다.

<figure style="text-align:center; margin:2rem 0;">
<svg viewBox="0 0 560 220" role="img" aria-label="Service는 고정 IP를 가지고, 들어온 요청을 살아 있는 여러 Pod에 고르게 나눠 보낸다." style="width:100%; max-width:560px; height:auto; font-family:var(--font-sans)">
<defs>
<marker id="ksvc-arr" markerWidth="9" markerHeight="9" refX="7" refY="3" orient="auto"><path d="M0,0 L7,3 L0,6 Z" style="fill:var(--accent-secondary)"/></marker>
<marker id="ksvc-arr2" markerWidth="9" markerHeight="9" refX="7" refY="3" orient="auto"><path d="M0,0 L7,3 L0,6 Z" style="fill:var(--accent-primary)"/></marker>
</defs>
<text x="40" y="100" text-anchor="middle" style="font-size:12px; fill:var(--text-muted)">요청</text>
<line x1="58" y1="110" x2="92" y2="110" style="stroke:var(--accent-primary); stroke-width:2" marker-end="url(#ksvc-arr2)"/>
<rect x="96" y="78" width="150" height="74" rx="10" style="fill:var(--bg-secondary); stroke:var(--accent-secondary); stroke-width:1.8"/>
<text x="171" y="104" text-anchor="middle" style="font-size:14px; font-weight:700; fill:var(--accent-secondary)">Service</text>
<text x="171" y="121" text-anchor="middle" style="font-size:10px; fill:var(--text-primary); font-family:var(--font-mono)">10.96.0.1</text>
<text x="171" y="136" text-anchor="middle" style="font-size:9.5px; fill:var(--text-muted)">고정 IP, DNS 이름</text>
<rect x="392" y="20" width="150" height="46" rx="8" style="fill:var(--bg-tertiary); stroke:var(--accent-primary); stroke-width:1.5"/>
<text x="467" y="42" text-anchor="middle" style="font-size:12px; fill:var(--text-primary)">Pod</text>
<text x="467" y="57" text-anchor="middle" style="font-size:9px; fill:var(--text-muted); font-family:var(--font-mono)">10.1.2.7</text>
<rect x="392" y="92" width="150" height="46" rx="8" style="fill:var(--bg-tertiary); stroke:var(--accent-primary); stroke-width:1.5"/>
<text x="467" y="114" text-anchor="middle" style="font-size:12px; fill:var(--text-primary)">Pod</text>
<text x="467" y="129" text-anchor="middle" style="font-size:9px; fill:var(--text-muted); font-family:var(--font-mono)">10.1.2.8</text>
<rect x="392" y="164" width="150" height="46" rx="8" style="fill:var(--bg-tertiary); stroke:var(--accent-primary); stroke-width:1.5"/>
<text x="467" y="186" text-anchor="middle" style="font-size:12px; fill:var(--text-primary)">Pod</text>
<text x="467" y="201" text-anchor="middle" style="font-size:9px; fill:var(--text-muted); font-family:var(--font-mono)">10.1.2.9</text>
<line x1="246" y1="104" x2="388" y2="44" style="stroke:var(--accent-secondary); stroke-width:1.7" marker-end="url(#ksvc-arr)"/>
<line x1="246" y1="115" x2="388" y2="115" style="stroke:var(--accent-secondary); stroke-width:1.7" marker-end="url(#ksvc-arr)"/>
<line x1="246" y1="126" x2="388" y2="186" style="stroke:var(--accent-secondary); stroke-width:1.7" marker-end="url(#ksvc-arr)"/>
<text x="310" y="158" text-anchor="middle" style="font-size:10.5px; fill:var(--text-muted)">부하 분산</text>
</svg>
<figcaption style="margin-top:0.75rem; font-size:0.9rem; color:var(--text-muted)">Pod 의 IP 는 바뀌어도 Service 주소는 그대로입니다. Service 는 들어온 요청을 살아 있는 Pod 에 고르게 나눠 보냅니다.</figcaption>
</figure>

클러스터(cluster)는 쿠버네티스가 함께 관리하는 서버 여러 대와 그 위에서 도는 Pod 전체를 말합니다. 지금까지 본 Service 는 가장 흔한 Service 종류인 ClusterIP 입니다. ClusterIP 는 이 클러스터 안에서 안정적으로 부를 수 있는 주소입니다.

다만 「클러스터 안에서」라는 조건을 놓치기 쉽습니다. ClusterIP 는 클러스터 바깥의 인터넷에서는 부를 수 없으므로, 휴대폰으로 `example.com` 을 입력한 사용자처럼 클러스터 밖에 있는 사람의 요청을 받으려면 입구가 따로 있어야 합니다.

---

### 숫자로 보기 — Pod IP 와 Service 주소의 한 달 실패 요청

**Pod IP 가 한 달에 360번 바뀌는 가상 계산에서 Pod IP 를 직접 외운 클라이언트(요청을 보내는 쪽)는 Service 주소만 외운 클라이언트보다 실패 요청이 33배 많습니다.**

1절과 2절을 읽고 나면 「Pod 주소를 그냥 외워 두면 안 될까?」 하는 생각이 들 수 있습니다. 여기서 외워 둔다는 말은 한 번 알아낸 IP 를 저장해 두고 정해진 시간 동안 다시 확인하지 않고 쓴다는 뜻입니다. 이렇게 저장해 둔 값을 캐시(cache), 다시 확인하지 않고 쓰는 시간을 캐시 TTL 이라고 부릅니다.

아래 계산은 가상 데이터입니다. 코드는 Pod 3개짜리 앱이 하루 4번 배포하는 한 달(30일) 동안 클라이언트가 Pod IP 를 직접 외우는 방식 A 와 Service 주소 하나만 외우는 방식 B 의 실패 요청을 세어 비교합니다. 요청은 초당 100건 들어오고 롤링 배포 한 번에는 40초가 걸립니다. 롤링 배포는 Pod 를 한꺼번에 내리지 않고 하나씩 새 Pod 로 바꾸는 배포 방식입니다. 클라이언트는 알아낸 IP 를 5분(300초) 동안 외워 둔다고 가정합니다.

```python
# 하는 일: Pod 3개짜리 앱이 하루 4번 배포할 때, 클라이언트가 Pod IP 를 직접 외우는 경우와 Service 주소 하나만 외우는 경우의 한 달 실패 요청을 비교한다.
import random
random.seed(42)

# 1단계: 앱의 Pod 수와 배포, 요청량, 캐시 시간을 둔다
# "집 주소를 그냥 외워 두면 안 되나?"에 숫자로 답한다. 배포할 때마다 Pod 가 새로 만들어지고, Pod 가 새로 만들어지면 IP 가 바뀐다. 가상 데이터다.
PODS = 3                # Pod 3개
DEPLOYS_PER_DAY = 4     # 하루 배포 4번
DAYS = 30               # 한 달
RPS = 100               # 초당 요청 100건
ROLLING_SEC = 40        # 롤링 배포 1회에 걸리는 시간(초) — 한 채씩 교체
CACHE_TTL_SEC = 300     # 클라이언트가 IP를 5분간 외워 둔다고 가정

# 2단계: 한 달 동안 Pod IP 가 바뀌는 횟수를 센다
total_ip_changes = PODS * DEPLOYS_PER_DAY * DAYS
print(f"한 달 동안 Pod IP가 바뀌는 횟수  {total_ip_changes}회")
print(f"  = Pod {PODS}개 × 배포 {DEPLOYS_PER_DAY}회/일 × {DAYS}일")
print()

# 3단계: Pod IP 를 직접 외울 때의 실패를 센다
# 방식 A 다. 배포 중에는 외워 둔 IP 가운데 일부가 이미 사라진 Pod 를 가리키고, 최악이면 캐시 TTL 이 다 지나기 전까지 그 IP 로 계속 요청을 보낸다. 롤링 배포는 Pod 를 하나씩 교체하므로, 배포 중 평균적으로 전체 Pod 의 1/PODS 가 방금 사라진 Pod 이고 그 IP 를 외운 클라이언트는 실패한다.
stale_window = min(CACHE_TTL_SEC, ROLLING_SEC + CACHE_TTL_SEC)  # 낡은 주소를 들고 있는 시간
fail_share = 1 / PODS                                            # 그 시간에 실패하는 요청 비율
fails_per_deploy = RPS * stale_window * fail_share
fails_a = fails_per_deploy * DEPLOYS_PER_DAY * DAYS

# 4단계: Service 주소 하나만 외울 때의 실패를 센다
# 방식 B 다. Service 의 IP 는 배포와 무관하게 그대로이고, Service 가 살아 있는 Pod 만 골라 보낸다. 실패는 교체 순간에 이미 연결이 진행 중이던 요청 정도로 줄어든다.
INFLIGHT_SEC = 1.0                                               # 교체 순간의 진행 중 요청 구간
fails_b = RPS * INFLIGHT_SEC * PODS * DEPLOYS_PER_DAY * DAYS

total_requests = RPS * 60 * 60 * 24 * DAYS

# 5단계: 두 방식의 한 달 실패를 비교한다
print("방식 A — Pod IP를 직접 외운다")
print(f"  배포 1회당 실패 요청   {fails_per_deploy:>12,.0f}건")
print(f"  한 달 실패 요청        {fails_a:>12,.0f}건  (전체의 {fails_a/total_requests*100:.3f}%)")
print()
print("방식 B — Service 주소 하나만 외운다")
print(f"  한 달 실패 요청        {fails_b:>12,.0f}건  (전체의 {fails_b/total_requests*100:.3f}%)")
print()
print(f"차이  {fails_a/fails_b:,.0f}배")
print()
print("→ Pod 주소를 외우면 배포마다 실패가 쏟아진다. 사라진 Pod의 주소를 들고 찾아가니까.")
print("→ Service 주소는 배포와 무관하게 그대로다. 그래서 외울 값은 이거 하나여야 한다.")

# 출력:
# 2단계 뜻: 하루 4회 배포할 때마다 Pod 3개가 새로 만들어져서, 한 달에 Pod IP 가 360회 바뀐다.
# 한 달 동안 Pod IP가 바뀌는 횟수  360회
#   = Pod 3개 × 배포 4회/일 × 30일
#
# 5단계 뜻: Pod IP 를 외우면 배포 1회마다 10,000건, 한 달에 1,200,000건(0.463%)이 실패한다. Service 주소만 외우면 36,000건(0.014%)으로 33배 적다.
# 방식 A — Pod IP를 직접 외운다
#   배포 1회당 실패 요청         10,000건
#   한 달 실패 요청           1,200,000건  (전체의 0.463%)
#
# 방식 B — Service 주소 하나만 외운다
#   한 달 실패 요청              36,000건  (전체의 0.014%)
#
# 차이  33배
#
# → Pod 주소를 외우면 배포마다 실패가 쏟아진다. 사라진 Pod의 주소를 들고 찾아가니까.
# → Service 주소는 배포와 무관하게 그대로다. 그래서 외울 값은 이거 하나여야 한다.
```

2단계 출력의 360회는 한 달 동안 Pod IP 가 바뀌는 횟수입니다. 배포 한 번에 Pod 3개가 모두 새로 만들어지므로 하루 4번 배포하면 하루에 IP 가 12번 바뀌고 30일이면 Pod 3개 × 배포 4회 × 30일 = 360회입니다.

방식 A 의 「배포 1회당 실패 요청 10,000건」은 아래 차례로 나옵니다. 롤링 배포는 Pod 를 하나씩 교체하므로 배포 중에는 평균적으로 Pod 3개 가운데 1개(1/3)가 방금 사라진 Pod 라서 그 IP 를 외워 둔 클라이언트의 요청은 실패합니다. 최악의 경우 클라이언트는 캐시 TTL 이 다 지날 때까지 낡은 IP 로 요청을 계속 보내는데, 코드는 이 낡은 주소를 들고 있는 시간(`stale_window`)을 캐시 TTL 과 「롤링 배포 시간 + 캐시 TTL」 가운데 작은 값으로 고르므로 이 시간은 캐시 TTL 과 같은 300초입니다. 그래서 배포 1회의 실패는 초당 100건 × 300초 × 1/3 = 10,000건입니다. 하루 4번씩 30일이면 10,000건 × 4 × 30 = 1,200,000건으로, 한 달 동안 들어온 전체 요청(초당 100건씩 30일)의 0.463% 가 실패합니다.

방식 B 에서는 Service IP 가 배포와 상관없이 그대로이고 Service 가 살아 있는 Pod 만 골라 보내므로, 남는 실패는 성질부터 달라서 사라진 Pod 를 찾아간 요청이 아니라 Pod 가 교체되는 순간에 이미 연결이 진행 중이던 요청뿐입니다. 코드는 이 구간을 Pod 하나가 교체될 때마다 1초(`INFLIGHT_SEC = 1.0`)로 두므로 한 달 실패는 초당 100건 × 1초 × Pod 3개 × 4회 × 30일 = 36,000건, 전체 요청의 0.014% 에 그칩니다.

5단계 출력의 「차이 33배」는 이미 사라진 Pod 의 주소를 들고 찾아가 배포마다 만 건씩 실패하는 방식 A 의 한 달 실패 1,200,000건이 Service 를 거치는 방식 B 의 3만 6천 건보다 33배 많다는 뜻입니다. 그래서 클라이언트가 외워 둘 값은 Service 주소 하나여야 합니다. Pod 주소는 다음 배포 때 바뀌므로 외우는 순간부터 낡은 값이 됩니다.

아래 표에 두 방식을 한 줄씩 정리했습니다.

| 무엇을 외우나 | 배포와 함께 바뀌나 | 한 달 실패 요청 | 클라이언트가 해야 할 일 |
|---|---|---|---|
| Pod IP | 바뀐다 (360회) | 약 120만 건 | 바뀐 주소를 계속 다시 찾아야 함 |
| Service IP | 안 바뀐다 | 약 3.6만 건 | 아무것도 안 해도 됨 |

---

## 3. Ingress — 클러스터 바깥에서 들어오는 입구

**Ingress 는 클러스터 바깥에서 오는 웹 요청(HTTP)이 들어오는 입구로, 요청 주소의 도메인(`example.com`)과 경로(`/shop`)를 보고 알맞은 Service 로 보냅니다.**

2절 끝에서 따로 있어야 한다고 한 입구가 Ingress 로, 클러스터 바깥의 HTTP/HTTPS 트래픽을 안으로 들입니다. HTTP 는 브라우저나 앱이 서버와 요청과 응답을 주고받는 규약이고 HTTPS 는 그 내용을 암호화한 HTTP 입니다. 트래픽은 이렇게 오가는 요청과 응답을 통틀어 부르는 말입니다.

Ingress 는 `example.com` 같은 도메인으로 온 요청을 받아 주소 규칙(host/path)에 따라 알맞은 Service 로 보냅니다. 도메인(domain)은 `example.com` 처럼 서버 주소에 사람이 읽을 수 있게 붙인 이름입니다. 주소 규칙의 host 는 요청 주소 가운데 이 도메인 부분이고 path 는 도메인 뒤에 붙는 `/shop` 같은 경로입니다.

예를 들어 같은 `example.com` 으로 온 요청이라도 경로가 `/shop` 이면 상품 서비스로, `/api` 면 주문 서비스로 나눠 보냅니다. 이 글에서 영어로 쓴 Service 는 2절의 고정 주소를, 한글로 쓴 상품 서비스와 주문 서비스는 따로 배포되는 앱을 말합니다. 아래 그림처럼 앱마다 그 앞에 Service 가 하나씩 있습니다. Ingress 가 경로를 보고 보낼 곳을 고르므로 입구는 하나여도 여러 서비스의 요청을 깔끔하게 나눠 받을 수 있습니다.

HTTPS 인증서 처리도 보통 이 입구인 Ingress 에서 합니다. 인증서(certificate)는 HTTPS 연결에서 서버가 그 도메인의 주인임을 증명하는 데 쓰는 파일입니다.

아래 그림은 `example.com` 요청을 받은 Ingress 가 `/shop` 은 상품 Service 로, `/api` 는 주문 Service 로 보내는 모습입니다.

<figure style="text-align:center; margin:2rem 0;">
<svg viewBox="0 0 600 230" role="img" aria-label="Ingress가 example.com 요청을 받아 경로 규칙에 따라 /shop은 상품 서비스로, /api는 주문 서비스로 나눠 보낸다." style="width:100%; max-width:580px; height:auto; font-family:var(--font-sans)">
<defs>
<marker id="king-arr" markerWidth="9" markerHeight="9" refX="7" refY="3" orient="auto"><path d="M0,0 L7,3 L0,6 Z" style="fill:var(--accent-primary)"/></marker>
</defs>
<rect x="12" y="90" width="84" height="52" rx="9" style="fill:var(--bg-tertiary); stroke:var(--border-color); stroke-width:1.5"/>
<text x="54" y="113" text-anchor="middle" style="font-size:12px; fill:var(--text-primary)">사용자</text>
<text x="54" y="129" text-anchor="middle" style="font-size:9px; fill:var(--text-muted); font-family:var(--font-mono)">example.com</text>
<line x1="96" y1="116" x2="134" y2="116" style="stroke:var(--accent-primary); stroke-width:2" marker-end="url(#king-arr)"/>
<rect x="138" y="74" width="166" height="86" rx="10" style="fill:var(--bg-secondary); stroke:var(--accent-primary); stroke-width:1.8"/>
<text x="221" y="98" text-anchor="middle" style="font-size:14px; font-weight:700; fill:var(--accent-primary)">Ingress</text>
<text x="221" y="120" text-anchor="middle" style="font-size:10px; fill:var(--text-primary)">규칙: /shop → 상품</text>
<text x="221" y="136" text-anchor="middle" style="font-size:10px; fill:var(--text-primary)">규칙: /api → 주문</text>
<rect x="404" y="40" width="170" height="54" rx="9" style="fill:var(--bg-tertiary); stroke:var(--accent-secondary); stroke-width:1.6"/>
<text x="489" y="63" text-anchor="middle" style="font-size:12px; font-weight:700; fill:var(--accent-secondary)">상품 Service</text>
<text x="489" y="80" text-anchor="middle" style="font-size:9.5px; fill:var(--text-muted)">→ 상품 Pod들</text>
<rect x="404" y="140" width="170" height="54" rx="9" style="fill:var(--bg-tertiary); stroke:var(--accent-secondary); stroke-width:1.6"/>
<text x="489" y="163" text-anchor="middle" style="font-size:12px; font-weight:700; fill:var(--accent-secondary)">주문 Service</text>
<text x="489" y="180" text-anchor="middle" style="font-size:9.5px; fill:var(--text-muted)">→ 주문 Pod들</text>
<line x1="304" y1="108" x2="400" y2="70" style="stroke:var(--accent-primary); stroke-width:1.8" marker-end="url(#king-arr)"/>
<text x="350" y="80" text-anchor="middle" style="font-size:10px; fill:var(--text-muted)">/shop</text>
<line x1="304" y1="128" x2="400" y2="166" style="stroke:var(--accent-primary); stroke-width:1.8" marker-end="url(#king-arr)"/>
<text x="350" y="160" text-anchor="middle" style="font-size:10px; fill:var(--text-muted)">/api</text>
</svg>
<figcaption style="margin-top:0.75rem; font-size:0.9rem; color:var(--text-muted)">Ingress 는 클러스터의 입구입니다. 같은 도메인으로 온 요청도 경로(/shop, /api)에 따라 알맞은 Service 로 나눠 보냅니다.</figcaption>
</figure>

---

### 숫자로 보기 — 입구 개수에 따른 월 비용과 인증서 관리 시간

**서비스 12개를 바깥에 내는 계산에서 서비스마다 입구를 내면 입구 수만큼 비용과 인증서가 늘어나지만 Ingress 하나를 두면 서비스가 늘어도 입구는 하나입니다.**

Ingress 없이 서비스마다 바깥으로 통하는 입구를 하나씩 내면 무엇이 얼마나 늘어나는지도 세어 보겠습니다. 아래 클라우드 요금은 대략치이고 공급자마다 다릅니다.

아래 코드는 마이크로서비스 12개를 바깥에 낼 때 서비스마다 LoadBalancer 를 하나씩 붙이는 방식 A 와 Ingress 하나에서 경로로 나누는 방식 B 의 월 비용, 공인 IP 수, 관리할 인증서 수, 인증서 관리 시간을 비교합니다. 마이크로서비스는 앱을 기능별로 나눠 따로 배포하는 작은 서비스이며 3절의 상품 서비스와 주문 서비스가 그런 예입니다. LoadBalancer 는 클라우드 공급자가 제공하는 외부 입구로, 공인 IP(인터넷 어디에서나 찾아올 수 있는 주소)를 하나 받아 바깥에서 온 요청을 뒤쪽 서비스로 넘깁니다. 코드는 LoadBalancer 1개의 월 요금을 `$18` 로, 인증서 하나를 갱신하고 점검하는 데 드는 시간을 한 달에 20분으로 둡니다.

```python
# 하는 일: 마이크로서비스 12개를 바깥에 낼 때 서비스마다 LoadBalancer 를 붙이는 경우와 Ingress 하나로 경로를 나누는 경우의 월 비용, 공인 IP, 인증서 관리 시간을 비교한다.

# 1단계: 서비스 수와 LoadBalancer 요금, 인증서 관리 시간을 둔다
# "Ingress 없이 서비스마다 입구를 내면 안 되나?"에 비용으로 답한다. 요금은 대략치이고 공급자마다 다르다.
SERVICES = 12                 # 마이크로서비스 12개
LB_MONTHLY_USD = 18           # 클라우드 LoadBalancer 1개 월 요금(대략치, 공급자마다 다름)
CERT_MANAGE_MIN = 20          # 인증서 하나를 갱신, 점검하는 데 드는 시간(분/월)

# 2단계: 서비스마다 LoadBalancer 를 붙일 때를 센다
# 방식 A 다. 입구를 서비스 수만큼 여러 개 낸다.
a_cost = SERVICES * LB_MONTHLY_USD
a_ips = SERVICES               # 공인 IP도 그만큼 필요하다
a_certs = SERVICES             # 도메인, 인증서도 그만큼
a_minutes = SERVICES * CERT_MANAGE_MIN

# 3단계: Ingress 하나를 둘 때를 센다
# 방식 B 다. 입구 하나에서 경로로 나눈다.
b_cost = 1 * LB_MONTHLY_USD    # Ingress 컨트롤러 앞에 LB 하나만
b_ips = 1
b_certs = 1                    # 와일드카드 인증서 하나로 서브경로를 덮는다
b_minutes = 1 * CERT_MANAGE_MIN

# 4단계: 두 방식을 표로 비교한다
print(f"마이크로서비스 {SERVICES}개를 바깥에 노출한다면\n")
print(f"{'':22}{'A) LB 여러 개':>16}{'B) Ingress 하나':>18}")
print(f"{'월 비용':22}{'$' + str(a_cost):>16}{'$' + str(b_cost):>18}")
print(f"{'공인 IP 개수':20}{a_ips:>16}{b_ips:>18}")
print(f"{'관리할 인증서':20}{a_certs:>16}{b_certs:>18}")
print(f"{'인증서 관리 시간':19}{str(a_minutes) + '분/월':>16}{str(b_minutes) + '분/월':>18}")
print()
print(f"월 비용 차이   ${a_cost - b_cost}  (연 ${(a_cost - b_cost) * 12})")
print(f"관리 시간 차이 {a_minutes - b_minutes}분/월  (연 {(a_minutes - b_minutes) * 12 / 60:.1f}시간)")
print()

# 5단계: 서비스 수가 늘 때 격차를 본다
# 서비스가 늘어나면 격차는 선형으로 벌어진다.
for n in (3, 12, 50):
    print(f"  서비스 {n:>2}개 → A) ${n * LB_MONTHLY_USD:>4}/월   B) ${LB_MONTHLY_USD}/월   ({n}배 차이)")
print()
print("→ 입구를 서비스마다 내면 입구 개수만큼 돈과 관리가 늘어난다.")
print("→ Ingress는 입구 하나에서 경로(/api, /admin)로 나누니, 서비스가 늘어도 입구는 하나다.")

# 출력:
# 4단계 뜻: 서비스 12개를 LoadBalancer 로 하나씩 내면 월 $216, Ingress 하나면 $18 이라 월 $198, 연 $2376 차이 난다. 관리할 인증서도 12개와 1개로, 관리 시간이 연 44.0시간 차이 난다.
# 마이크로서비스 12개를 바깥에 노출한다면
#
#                             A) LB 여러 개     B) Ingress 하나
# 월 비용                              $216               $18
# 공인 IP 개수                          12                 1
# 관리할 인증서                           12                 1
# 인증서 관리 시간                    240분/월             20분/월
#
# 월 비용 차이   $198  (연 $2376)
# 관리 시간 차이 220분/월  (연 44.0시간)
#
# 5단계 뜻: A) 는 서비스 수만큼 요금이 늘어 50개면 월 $900 이고, B) 는 서비스가 몇 개든 월 $18 이다.
#   서비스  3개 → A) $  54/월   B) $18/월   (3배 차이)
#   서비스 12개 → A) $ 216/월   B) $18/월   (12배 차이)
#   서비스 50개 → A) $ 900/월   B) $18/월   (50배 차이)
#
# → 입구를 서비스마다 내면 입구 개수만큼 돈과 관리가 늘어난다.
# → Ingress는 입구 하나에서 경로(/api, /admin)로 나누니, 서비스가 늘어도 입구는 하나다.
```

4단계 표의 월 비용은 서비스마다 LoadBalancer 를 붙인 방식 A 가 서비스 12개 × `$18` = `$216` 으로, Ingress 하나인 방식 B 의 `$18` 보다 12배 많습니다(출력의 LB 는 LoadBalancer 를 줄인 말입니다). Ingress 컨트롤러는 Ingress 에 적은 규칙을 읽어 실제로 요청을 받아 넘기는 프로그램입니다. 방식 B 도 이 Ingress 컨트롤러 앞에 LoadBalancer 하나는 두므로 월 `$18` 이 듭니다. 두 방식의 월 비용 차이는 `$216` 에서 `$18` 을 뺀 `$198`, 1년이면 `$198` × 12 = `$2376` 입니다.

공인 IP 와 관리할 인증서는 방식 A 가 서비스 수만큼 12개씩 필요하고 방식 B 는 1개씩이면 됩니다. 그래서 인증서 관리 시간도 방식 A 가 12개 × 20분 = 240분/월, 방식 B 가 20분/월로 한 달에 220분, 1년이면 220분 × 12 ÷ 60 = 44.0시간 차이 납니다.

5단계는 서비스 수를 3개, 12개, 50개로 바꿔 봅니다. 방식 A 는 서비스 수에 `$18` 을 곱한 `$54`, `$216`, `$900` 으로 늘지만 방식 B 는 서비스가 몇 개든 `$18` 이므로 차이가 3배, 12배, 50배로 서비스 수에 비례해 벌어집니다. 이 세 줄에서 보듯 두 방식의 차이는 서비스가 늘 때 입구 개수도 함께 늘어나는지에서 나옵니다. 서비스마다 입구를 내는 방식 A 는 서비스가 50개면 입구도 50개지만 방식 B 는 서비스가 몇 개로 늘어도 경로(`/api`, `/admin`)로 나누기만 하면 되므로 입구는 하나입니다.

돈보다 관리가 더 큰 부담입니다. 방식 A 에서는 인증서 12개를 하나씩 갱신하는 일이 매달 돌아오고 그중 하나라도 놓치면 그 서비스만 접속이 끊기지만 입구가 하나인 방식 B 는 인증서도 하나입니다.

---

## 트래픽 흐름 — 요청이 Pod 까지 가는 다섯 걸음

**사용자가 `example.com` 을 누른 순간부터 응답이 돌아오기까지 요청은 Ingress, Service, Pod 를 차례로 지나는 다섯 걸음을 거칩니다.**

이제 1~3절에서 하나씩 본 세 부품을 요청 한 건이 지나는 길 위에 차례로 놓아 보겠습니다. 카드에서는 `example.com/api` 요청이 Ingress 의 `/api → 주문` 규칙과 Service 의 고정 주소 `10.96.0.1` 을 지나 살아 있는 Pod 하나에 닿고 응답이 같은 길을 거꾸로 돌아오는 차례를 보면 됩니다.

<div class="demo-embed-wrap">
<iframe class="demo-embed" src="demo-ops-cards.html?embed=1&card=k8spath" height="480" loading="lazy" title="바깥 요청이 Pod 까지 가는 다섯 걸음"></iframe>
<a class="demo-embed-open" href="demo-ops-cards.html" target="_blank" rel="noopener">↗ 카드 여섯 장 전체로 열기</a>
</div>

<figure style="text-align:center; margin:2rem 0;">
<svg viewBox="0 0 720 200" role="img" aria-label="요청 흐름: 사용자에서 Ingress, Service, 그리고 건강한 Pod로 전달된 뒤 응답이 사용자에게 돌아온다." style="width:100%; max-width:700px; height:auto; font-family:var(--font-sans)">
<defs>
<marker id="kflow-arr" markerWidth="10" markerHeight="10" refX="8" refY="3" orient="auto"><path d="M0,0 L8,3 L0,6 Z" style="fill:var(--accent-primary)"/></marker>
<marker id="kflow-arr2" markerWidth="10" markerHeight="10" refX="8" refY="3" orient="auto"><path d="M0,0 L8,3 L0,6 Z" style="fill:var(--accent-secondary)"/></marker>
</defs>
<rect x="12" y="56" width="92" height="58" rx="9" style="fill:var(--bg-tertiary); stroke:var(--border-color); stroke-width:1.5"/>
<text x="58" y="90" text-anchor="middle" style="font-size:13px; fill:var(--text-primary)">사용자</text>
<rect x="158" y="56" width="118" height="58" rx="9" style="fill:var(--bg-secondary); stroke:var(--accent-primary); stroke-width:1.7"/>
<text x="217" y="82" text-anchor="middle" style="font-size:13px; font-weight:700; fill:var(--accent-primary)">Ingress</text>
<text x="217" y="99" text-anchor="middle" style="font-size:9.5px; fill:var(--text-muted)">입구</text>
<rect x="330" y="56" width="118" height="58" rx="9" style="fill:var(--bg-secondary); stroke:var(--accent-secondary); stroke-width:1.7"/>
<text x="389" y="82" text-anchor="middle" style="font-size:13px; font-weight:700; fill:var(--accent-secondary)">Service</text>
<text x="389" y="99" text-anchor="middle" style="font-size:9.5px; fill:var(--text-muted)">고정 주소</text>
<rect x="506" y="32" width="190" height="106" rx="9" style="fill:none; stroke:var(--text-muted); stroke-width:1.4; stroke-dasharray:6 4"/>
<text x="601" y="50" text-anchor="middle" style="font-size:10px; fill:var(--text-muted)">Pods</text>
<rect x="524" y="58" width="154" height="22" rx="5" style="fill:var(--bg-secondary); stroke:var(--border-color); stroke-width:1.2"/>
<text x="601" y="73" text-anchor="middle" style="font-size:10px; fill:var(--text-muted)">Pod</text>
<rect x="524" y="84" width="154" height="22" rx="5" style="fill:var(--bg-tertiary); stroke:var(--accent-primary); stroke-width:1.6"/>
<text x="601" y="99" text-anchor="middle" style="font-size:10px; font-weight:700; fill:var(--accent-primary)">Pod ← 선택됨</text>
<rect x="524" y="110" width="154" height="22" rx="5" style="fill:var(--bg-secondary); stroke:var(--border-color); stroke-width:1.2"/>
<text x="601" y="125" text-anchor="middle" style="font-size:10px; fill:var(--text-muted)">Pod</text>
<line x1="104" y1="85" x2="154" y2="85" style="stroke:var(--accent-primary); stroke-width:2" marker-end="url(#kflow-arr)"/>
<text x="129" y="74" text-anchor="middle" style="font-size:11px; font-weight:700; fill:var(--accent-primary)">①</text>
<line x1="276" y1="85" x2="326" y2="85" style="stroke:var(--accent-primary); stroke-width:2" marker-end="url(#kflow-arr)"/>
<text x="301" y="74" text-anchor="middle" style="font-size:11px; font-weight:700; fill:var(--accent-primary)">②</text>
<line x1="448" y1="85" x2="502" y2="90" style="stroke:var(--accent-primary); stroke-width:2" marker-end="url(#kflow-arr)"/>
<text x="475" y="74" text-anchor="middle" style="font-size:11px; font-weight:700; fill:var(--accent-primary)">③④</text>
<path d="M524,150 C 380,184 200,184 60,118" style="fill:none; stroke:var(--accent-secondary); stroke-width:1.8; stroke-dasharray:6 4" marker-end="url(#kflow-arr2)"/>
<text x="300" y="182" text-anchor="middle" style="font-size:11px; font-weight:700; fill:var(--accent-secondary)">⑤ 응답</text>
</svg>
<figcaption style="margin-top:0.75rem; font-size:0.9rem; color:var(--text-muted)">① 사용자가 요청을 보내면 ② Ingress 가 규칙에 맞는 Service 를 고르고 ③ 요청을 그 Service 로 넘깁니다. ④ Service 가 살아 있는 Pod 하나를 골라 보내면 ⑤ 응답이 사용자에게 돌아갑니다.</figcaption>
</figure>

1. **사용자**가 휴대폰에서 `example.com` 으로 요청을 보냅니다.
2. 요청을 처음 받은 **Ingress** 가 요청의 도메인과 경로를 주소 규칙(host/path)과 맞춰 보고 보낼 Service 를 고릅니다.
3. Ingress 가 요청을 고른 **Service**(ClusterIP)로 넘깁니다.
4. Service 가 뒤에 있는 Pod 가운데 **살아 있는 Pod 하나**를 골라 요청을 전달합니다. 요청이 여러 건이면 이 걸음에서 Pod 들에 고르게 나눠 보내는 부하 분산이 일어납니다.
5. 요청을 받은 **Pod** 가 처리를 마치면 응답은 왔던 길을 거꾸로 거쳐 사용자에게 돌아갑니다.

세 부품이 하는 일과 그 성질을 표 한 장에 정리했습니다.

| 부품 | 하는 일 | 핵심 성질 |
|---|---|---|
| **Pod** | 앱(컨테이너)이 실제로 돈다 | 자주 죽고 새로 뜸 → IP가 바뀜 |
| **Service** | 바뀌는 Pod 앞의 고정 주소 + 부하 분산 | 안정적, 클러스터 안에서 유효 |
| **Ingress** | 외부 트래픽을 규칙대로 Service에 라우팅 | 바깥과 안을 잇는 입구 |

---

## 한 줄로 기억하기

**Pod 는 자꾸 바뀌므로 바뀌지 않는 주소인 Service 가 필요하고 Service 는 클러스터 안에서만 통하므로 바깥과 연결해 줄 Ingress 가 필요합니다.**

Service 는 Pod 의 한계를, Ingress 는 Service 의 한계를 메우려고 있습니다. 세 부품을 하나씩 다시 적으면 이렇습니다.

- **Pod 는 죽고 새로 뜹니다.** 그래서 Pod 의 주소를 믿고 코드나 설정에 고정해 두면 안 됩니다.
- **Service 는 그대로 있습니다.** 바뀌는 Pod 앞에서 변하지 않는 주소 역할을 합니다.
- **Ingress 는 입구입니다.** 클러스터 바깥에서 오는 트래픽은 Ingress 로 들어옵니다.

> **한 문장 요약:** Pod 는 죽고 새로 뜨기를 되풀이하고 Service 는 그 앞에서 그대로 있으며 Ingress 는 바깥 요청이 들어오는 입구입니다. 세 부품이 이렇게 함께 동작하므로 자꾸 바뀌는 앱도 바깥에서 안정적으로 부를 수 있습니다.

---

여기까지가 이미 만든 앱을 바깥에 내놓는 방법입니다. 그렇다면 그 앱은 처음에 어떻게 나누고 합칠까요? 앱 전체를 하나로 만들어 한 번에 배포하는 모놀리식(monolithic)부터 기능별로 나눠 따로 배포하는 마이크로서비스까지는 [소프트웨어 아키텍처 패턴 글](post.html?id=software-architecture-patterns)에 같은 방식으로 정리해 두었습니다.
