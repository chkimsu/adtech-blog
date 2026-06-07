내 앱을 서버에 띄웠다고 합시다. 그런데 사용자가 휴대폰으로 `example.com`을 쳤을 때, 그 요청이 어떻게 내 앱까지 정확히 도착할까요?

쿠버네티스(Kubernetes, 줄여서 k8s)에서는 이 길을 **세 가지 부품**이 이어서 만듭니다. **Pod → Service → Ingress.** 이름만 보면 막막하지만, 도시에 비유하면 아주 쉬워요.

> 한 줄 비유: **Pod는 집, Service는 길, Ingress는 성문.** 사람(요청)은 성문으로 들어와 길을 따라 집을 찾아간다.

먼저 전체 그림을 한 장으로 봅시다. 요청은 왼쪽(사용자)에서 오른쪽(앱)으로 흐릅니다.

<figure style="text-align:center; margin:2rem 0;">
<svg viewBox="0 0 700 200" role="img" aria-label="사용자 요청이 Ingress를 거쳐 Service로, Service에서 Deployment 안의 여러 Pod로 전달되는 왼쪽에서 오른쪽 흐름." style="width:100%; max-width:680px; height:auto; font-family:var(--font-sans)">
<defs>
<marker id="kov-arr" markerWidth="10" markerHeight="10" refX="8" refY="3" orient="auto"><path d="M0,0 L8,3 L0,6 Z" style="fill:var(--accent-primary)"/></marker>
</defs>
<rect x="12" y="74" width="96" height="56" rx="9" style="fill:var(--bg-tertiary); stroke:var(--border-color); stroke-width:1.5"/>
<text x="60" y="100" text-anchor="middle" style="font-size:13px; fill:var(--text-primary)">사용자</text>
<text x="60" y="117" text-anchor="middle" style="font-size:9.5px; fill:var(--text-muted)">웹·모바일·API</text>
<line x1="108" y1="102" x2="148" y2="102" style="stroke:var(--accent-primary); stroke-width:2" marker-end="url(#kov-arr)"/>
<rect x="150" y="66" width="138" height="74" rx="10" style="fill:var(--bg-secondary); stroke:var(--accent-primary); stroke-width:1.8"/>
<text x="219" y="94" text-anchor="middle" style="font-size:14px; font-weight:700; fill:var(--accent-primary)">Ingress</text>
<text x="219" y="111" text-anchor="middle" style="font-size:10px; fill:var(--text-muted)">성문 · 외부 입구</text>
<text x="219" y="127" text-anchor="middle" style="font-size:10px; fill:var(--text-primary); font-family:var(--font-mono)">example.com</text>
<line x1="288" y1="102" x2="328" y2="102" style="stroke:var(--accent-primary); stroke-width:2" marker-end="url(#kov-arr)"/>
<rect x="330" y="66" width="138" height="74" rx="10" style="fill:var(--bg-secondary); stroke:var(--accent-secondary); stroke-width:1.8"/>
<text x="399" y="94" text-anchor="middle" style="font-size:14px; font-weight:700; fill:var(--accent-secondary)">Service</text>
<text x="399" y="111" text-anchor="middle" style="font-size:10px; fill:var(--text-muted)">길 · 안정적 주소</text>
<text x="399" y="127" text-anchor="middle" style="font-size:10px; fill:var(--text-primary); font-family:var(--font-mono)">10.96.0.1</text>
<line x1="468" y1="102" x2="508" y2="102" style="stroke:var(--accent-primary); stroke-width:2" marker-end="url(#kov-arr)"/>
<rect x="512" y="36" width="176" height="132" rx="10" style="fill:none; stroke:var(--text-muted); stroke-width:1.4; stroke-dasharray:6 4"/>
<text x="600" y="54" text-anchor="middle" style="font-size:11px; fill:var(--text-muted)">Deployment</text>
<rect x="528" y="64" width="144" height="28" rx="6" style="fill:var(--bg-tertiary); stroke:var(--accent-primary); stroke-width:1.4"/>
<text x="600" y="83" text-anchor="middle" style="font-size:12px; fill:var(--text-primary)">Pod · 집</text>
<rect x="528" y="98" width="144" height="28" rx="6" style="fill:var(--bg-tertiary); stroke:var(--accent-primary); stroke-width:1.4"/>
<text x="600" y="117" text-anchor="middle" style="font-size:12px; fill:var(--text-primary)">Pod · 집</text>
<rect x="528" y="132" width="144" height="28" rx="6" style="fill:var(--bg-tertiary); stroke:var(--accent-primary); stroke-width:1.4"/>
<text x="600" y="151" text-anchor="middle" style="font-size:12px; fill:var(--text-primary)">Pod · 집</text>
</svg>
<figcaption style="margin-top:0.75rem; font-size:0.9rem; color:var(--text-muted)">요청은 성문(Ingress) → 길(Service) → 집(Pod) 순으로 흐른다. 이제 세 부품을 하나씩 들여다본다.</figcaption>
</figure>

---

## 1. Pod = 집 — 앱이 실제로 사는 곳

> 비유: 사람(앱)이 실제로 사는 집. 그런데 이 집은 재개발이 잦아서, 헐리고 새로 지어지길 반복한다.

**Pod**는 쿠버네티스에서 앱이 실제로 도는 가장 작은 단위입니다. 안에 여러분의 컨테이너(앱)가 들어 있어요. 쿠버네티스는 보통 Pod를 직접 만들지 않고, **Deployment**에게 "이 앱 Pod를 3개 유지해" 하고 맡깁니다. 그러면 알아서 3개를 띄우고 관리해요.

여기서 핵심 성질 하나. **Pod는 수명이 짧습니다(ephemeral).** 죽으면 쿠버네티스가 똑같은 새 Pod를 띄워 개수를 맞춰요. 그런데 **새로 뜬 Pod는 IP 주소가 달라집니다.**

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
<figcaption style="margin-top:0.75rem; font-size:0.9rem; color:var(--text-muted)">Pod는 헐리고 새로 지어지는 집과 같다. 개수는 유지되지만, 주소는 계속 달라진다.</figcaption>
</figure>

자, 그럼 문제가 생깁니다. 다른 누군가가 이 앱을 부르려면 주소가 필요한데, **그 주소가 자꾸 바뀌면** 어떻게 찾아갈까요? 매번 "지금 그 집 주소가 뭐지?" 물어볼 순 없잖아요. 그래서 **고정된 주소**가 필요합니다. 그게 다음 부품입니다.

---

## 2. Service = 길 — 바뀌는 집들 앞에 놓인 변하지 않는 주소

> 비유: 집들은 재개발로 바뀌어도, 그 앞 도로명("강남대로 1길")은 그대로다. 사람들은 도로명만 알면 집을 찾아간다.

**Service**는 자꾸 바뀌는 Pod들 앞에 놓이는 **변하지 않는 단일 주소**입니다. 고정 IP(예: `10.96.0.1`)와 이름(DNS)을 가져요. 누구든 이 Service 주소로 요청하면, Service가 **살아 있는 Pod 중 하나로 알아서 연결**해 줍니다.

게다가 요청을 여러 Pod에 **고르게 나눠주는 부하 분산(load balancing)**까지 해줍니다. 한 집에 손님이 몰리지 않게 빈 집으로 안내하는 셈이에요.

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
<text x="171" y="136" text-anchor="middle" style="font-size:9.5px; fill:var(--text-muted)">고정 IP · DNS 이름</text>
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
<figcaption style="margin-top:0.75rem; font-size:0.9rem; color:var(--text-muted)">Pod들의 IP는 바뀌어도 Service 주소는 그대로다. Service가 살아 있는 Pod로 요청을 고르게 나눠준다.</figcaption>
</figure>

이걸 가장 흔한 Service 종류로 **ClusterIP**라고 부릅니다. 핵심은 *클러스터 안에서* 안정적으로 부를 수 있는 주소라는 점이에요. 그런데 "*클러스터 안에서*"가 함정입니다. 이 주소는 **바깥 인터넷에서는 못 부릅니다.** 외부 사용자가 들어오려면 입구가 따로 필요해요.

---

## 3. Ingress = 성문 — 바깥에서 안으로 들어오는 입구

> 비유: 도시(클러스터)로 들어오는 정문. 문지기가 "쇼핑하러 왔으면 상점가로, 민원이면 시청으로" 하고 길을 안내한다.

**Ingress**는 클러스터 **바깥의 HTTP/HTTPS 트래픽을 안으로 들이는 입구**입니다. `example.com` 같은 도메인을 받아서, **주소 규칙(host/path)에 따라 알맞은 Service로 보내줘요.**

예를 들어 같은 `example.com`이라도 `/shop`으로 오면 상품 서비스로, `/api`로 오면 주문 서비스로 갈라 보냅니다. 입구 하나로 여러 서비스를 깔끔하게 나눠 받는 거예요. (HTTPS 인증서 처리도 보통 여기서 합니다.)

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
<figcaption style="margin-top:0.75rem; font-size:0.9rem; color:var(--text-muted)">Ingress는 도시의 정문. 같은 도메인이라도 경로(/shop, /api)에 따라 알맞은 Service로 갈라 보낸다.</figcaption>
</figure>

---

## 트래픽은 이렇게 흐른다

이제 셋을 이어 봅시다. 사용자가 `example.com`을 누른 순간부터 응답이 돌아오기까지, 딱 다섯 걸음입니다.

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
<text x="217" y="99" text-anchor="middle" style="font-size:9.5px; fill:var(--text-muted)">성문</text>
<rect x="330" y="56" width="118" height="58" rx="9" style="fill:var(--bg-secondary); stroke:var(--accent-secondary); stroke-width:1.7"/>
<text x="389" y="82" text-anchor="middle" style="font-size:13px; font-weight:700; fill:var(--accent-secondary)">Service</text>
<text x="389" y="99" text-anchor="middle" style="font-size:9.5px; fill:var(--text-muted)">길</text>
<rect x="506" y="32" width="190" height="106" rx="9" style="fill:none; stroke:var(--text-muted); stroke-width:1.4; stroke-dasharray:6 4"/>
<text x="601" y="50" text-anchor="middle" style="font-size:10px; fill:var(--text-muted)">Pods · 집</text>
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
<figcaption style="margin-top:0.75rem; font-size:0.9rem; color:var(--text-muted)">① 사용자 요청 → ② Ingress가 규칙 매칭 → ③ Service로 전달 → ④ 건강한 Pod 하나로 분산 → ⑤ 응답이 사용자에게.</figcaption>
</figure>

1. **사용자**가 `example.com`으로 요청을 보낸다.
2. **Ingress**가 받아서 주소 규칙(host/path)에 맞는 Service를 고른다.
3. 요청을 **Service**(ClusterIP)로 넘긴다.
4. Service가 **살아 있는 Pod 하나**로 부하를 분산해 전달한다.
5. **Pod**가 처리하고, 응답이 같은 길을 거꾸로 타고 사용자에게 돌아간다.

세 부품의 역할을 도시 비유로 한 번에 정리하면 이렇습니다.

| 부품 | 비유 | 하는 일 | 핵심 성질 |
|---|---|---|---|
| **Pod** | 집 | 앱(컨테이너)이 실제로 돈다 | 자주 죽고 새로 뜸 → IP가 바뀜 |
| **Service** | 길 | 바뀌는 Pod 앞의 고정 주소 + 부하 분산 | 안정적, 클러스터 안에서 유효 |
| **Ingress** | 성문 | 외부 트래픽을 규칙대로 Service에 라우팅 | 바깥과 안을 잇는 입구 |

---

## 한 줄로 기억하기

왜 셋이 다 필요한지, 다시 사슬로 짚어봅시다. **Pod는 자꾸 바뀐다** → 그래서 변하지 않는 주소인 **Service가 필요**하다 → 그런데 Service는 클러스터 안에서만 통한다 → 그래서 바깥과 잇는 **Ingress(입구)가 필요**하다. 각 부품은 바로 앞 부품의 한계를 메우려고 존재해요.

- **Pod는 오고 간다** — 믿고 주소를 박아두면 안 된다.
- **Service는 안정적이다** — 바뀌는 Pod 앞의 변하지 않는 길.
- **Ingress가 입구다** — 바깥 트래픽은 여기로 들어온다.

> 한 문장 요약: **Pod는 오고 가고, Service는 그대로 있고, Ingress가 들어오는 문이다.** 이 셋이 맞물려, 자꾸 바뀌는 앱을 바깥에서도 안정적으로 부를 수 있게 만든다.

---

시스템을 어떻게 설계하고(아키텍처) 어떻게 노출하는지(쿠버네티스)를 봤다면, 그 큰 그림은 [소프트웨어 아키텍처 패턴 글](post.html?id=software-architecture-patterns)에서 — 모놀리식부터 마이크로서비스까지 같은 결의 비유로 정리해 두었습니다.
