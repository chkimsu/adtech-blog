서버 한 대가 요청을 받고 있다. 프로세스 이름은 `bidder`, 주소는 `10.0.3.14:8080`. 매체 한 곳이 이 주소로 초당 3,000건씩 입찰 요청을 보낸다. 요청은 `POST /v1/bid` 한 종류뿐이고, 12ms 안에 답해야 한다. 늦으면 그 건은 없던 일이 된다.

이 그림에는 LB도 Ingress도 API Gateway도 라우터도 없다. 매체의 설정 파일에 우리 서버 IP가 그대로 적혀 있고, 요청은 거기로 곧장 간다. 그리고 이 구성은 잘 돌아간다. 서버가 안 죽고, 배포를 안 하고, 서비스가 하나뿐인 동안은 그렇다.

이 글은 그 다음을 따라간다. 서비스가 하나에서 열둘로 늘어나는 동안 부품은 한꺼번에 등장하지 않는다. 매번 구체적인 사고가 하나 나고, 그걸 막으려고 부품이 하나 생긴다. 순서대로 보면 넷의 경계가 저절로 갈린다.

이 글의 숫자는 전부 설명을 위해 지어낸 값이다. 실제 입찰 제한시간은 매체·거래소마다 다르다.

> **한 줄 요약:** LB·Ingress·API Gateway·라우터는 한꺼번에 설계된 것이 아니다. 서비스가 늘 때마다 생긴 문제에 하나씩 답한 결과다.

> **골라 읽는 법** — 절이 8개인 긴 글입니다. 처음부터 다 읽지 않아도 됩니다.
>
> - 부품이 왜 생겼는지 순서대로 → 1~5절
> - "라우터"라는 말이 헷갈리면 → 3절
> - Ingress와 API Gateway의 경계만 → 4절
> - 넷을 표로 비교만 → 6절
> - 흔한 오해만 → 7절

---

## 1. 서버 한 대 — 매체가 주소를 직접 부른다

**부품이 하나도 없는 상태에서는 매체가 우리 서버 주소를 직접 안다. 그래서 서버가 잠깐만 멈춰도 그 시간만큼 요청이 통째로 사라진다.**

매체 쪽 연동 설정 파일에는 이렇게 적혀 있다.

```yaml
# 매체 서버의 DSP 연동 설정
bidders:
  - name: our-dsp
    endpoint: http://10.0.3.14:8080/v1/bid
    timeout_ms: 12
```

`10.0.3.14` 는 우리 `bidder` 서버의 IP다. 매체는 이 주소로만 요청을 보낸다.

매체와 우리는 같은 데이터센터 안에서 전용 회선으로 붙어 있다. 중간에 거치는 것도 없다. 그래서 사설 IP를 그대로 부를 수 있고, TLS 없이도 되고, 12ms라는 빡빡한 예산이 성립한다. 바깥 인터넷을 건너는 열린 RTB 연동이라면 이 숫자가 훨씬 커진다.

문제는 배포할 때 드러난다. 새 버전을 올리려면 `bidder` 프로세스를 내리고 새 프로세스를 띄워야 한다. 그 사이 `10.0.3.14:8080` 은 아무도 듣지 않는 포트가 된다. 이때 매체가 보낸 요청은 느린 응답을 받는 게 아니다. 연결 자체가 거부된다(`connection refused`). 12ms 예산 안에서는 재시도할 여유도 없다.

<figure style="text-align:center; margin:2rem 0;">
<svg viewBox="0 0 700 150" role="img" aria-label="매체 한 곳이 bidder 서버 한 대의 IP를 직접 호출하는 구조. 그 서버 한 칸이 배포 중에 사라지면 대신 부를 곳이 없다." style="width:100%; max-width:680px; height:auto; font-family:var(--font-sans)">
<defs>
<marker id="gw1-arr" markerWidth="9" markerHeight="9" refX="7.5" refY="3" orient="auto"><path d="M0,0 L7.5,3 L0,6 Z" style="fill:var(--accent-primary)"/></marker>
</defs>
<rect x="20" y="46" width="130" height="58" rx="9" style="fill:var(--bg-tertiary); stroke:var(--border-color); stroke-width:1.5"/>
<text x="85" y="71" text-anchor="middle" style="font-size:13px; fill:var(--text-primary)">매체 1곳</text>
<text x="85" y="89" text-anchor="middle" style="font-size:9.5px; fill:var(--text-muted)">설정에 IP가 박혀 있다</text>
<line x1="150" y1="75" x2="244" y2="75" style="stroke:var(--accent-primary); stroke-width:2" marker-end="url(#gw1-arr)"/>
<text x="197" y="66" text-anchor="middle" style="font-size:10px; fill:var(--text-muted); font-family:var(--font-mono)">10.0.3.14:8080</text>
<rect x="248" y="40" width="162" height="70" rx="13" style="fill:none; stroke:var(--state-bad); stroke-width:1.4; stroke-dasharray:5 4"/>
<rect x="254" y="46" width="150" height="58" rx="9" style="fill:var(--bg-secondary); stroke:var(--accent-primary); stroke-width:1.8"/>
<text x="329" y="71" text-anchor="middle" style="font-size:13px; font-weight:700; fill:var(--accent-primary)">bidder</text>
<text x="329" y="89" text-anchor="middle" style="font-size:9.5px; fill:var(--text-muted)">서버 1대</text>
<line x1="434" y1="75" x2="414" y2="75" style="stroke:var(--state-bad); stroke-width:1.4; stroke-dasharray:5 4"/>
<text x="440" y="70" style="font-size:11px; fill:var(--state-bad)">배포하면 이 칸이 잠깐 사라진다</text>
<text x="440" y="88" style="font-size:11px; fill:var(--state-bad)">그동안 요청은 전부 실패</text>
</svg>
<figcaption style="margin-top:0.75rem; font-size:0.9rem; color:var(--text-muted)">실선이 하나뿐인 게 이 그림의 전부다. 그 하나가 끊기면 매체 쪽에 대안이 없다.</figcaption>
</figure>

얼마나 사라지는지 세어 보자. 아래 숫자는 설명을 위해 지어낸 가상 수치다.

| 항목 | 값 |
|---|---|
| 하루 배포 횟수 | 4회 |
| 배포 1회당 프로세스가 없는 시간 | 20초 |
| 이 매체의 초당 입찰 요청 | 3,000건 |
| **하루에 버려지는 요청** | **4 × 20 × 3,000 = 240,000건** |

하루 24만 건이다. 이 요청들은 우리가 응찰조차 못 한 건이라 매출로도 안 잡히고, 우리 쪽 에러 로그에도 안 남는다. 로그를 남길 프로세스가 그 순간 떠 있지 않기 때문이다. 매체 리포트에만 "응답률이 낮은 DSP"로 조용히 기록된다.

배포를 조심히 하면 되지 않느냐고 물을 수 있다. 그런데 배포를 멈춰도 서버는 죽는다. 디스크가 차거나, 커널이 패닉을 내거나, 앞단 스위치가 재시작한다. 이때 매체가 대신 부를 주소가 없다. 설정 파일에 적힌 주소가 하나뿐이기 때문이다. 그래서 서버를 여러 대로 늘리는 것 말고는 답이 없다.

---

## 2. 세 대로 늘렸다 — LB가 생긴다

**서버를 3대로 늘리면 한 대가 죽어도 서비스는 산다. 대신 "매체가 어느 주소를 불러야 하나"라는 문제가 새로 생긴다.**

`bidder` 를 `10.0.3.14`, `10.0.3.15`, `10.0.3.16` 세 대에 띄웠다고 하자. 이제 배포는 한 대씩 돌아가며 하면 된다. 한 대를 내리는 동안 나머지 두 대가 요청을 받는다. 1절에서 하루 24만 건을 날리던 20초가 없어진다.

대신 배포 중에는 남은 2대가 3대 몫을 받는다. 평상시 서버당 1,000 QPS이던 것이 그동안 1,500 QPS가 된다. 3대라는 숫자는 평상시가 아니라 이 순간을 기준으로 잡아야 한다. 평상시에 딱 맞게 잡으면 배포할 때마다 지연이 튄다.

그런데 매체 입장에서 보면 곤란해진다. 설정 파일에 IP 3개를 다 적어야 하나. `10.0.3.15` 가 죽으면 매체 담당자에게 연락해서 그 줄을 빼 달라고 해야 하나. 서버를 5대로 늘릴 때마다 매체 수십 곳에 같은 부탁을 반복해야 하나. 우리 쪽 사정을 매체가 대신 관리하는 꼴이다.

**로드 밸런서(LB, Load Balancer)** 가 이 자리를 메운다. 대표 주소 하나를 앞에 세우고, 그 뒤에 서버 3대를 대상으로 등록한다. 매체 설정에는 이제 `10.0.9.7` 하나만 적힌다. 뒤에 서버가 3대인지 12대인지는 매체가 알 필요가 없다.

LB가 실제로 하는 일은 두 가지다. 하나는 들어온 연결을 대상 중 하나에 넘기는 것이다. 다른 하나는 **살아 있는 대상만 고르는 것**이다. 두 번째를 하려면 LB가 대상의 상태를 계속 확인해야 한다. 그래서 주기적으로 정해진 주소를 찔러 본다. 이걸 헬스체크(health check)라고 한다.

설정값은 이런 모양이다. 아래 값도 설명을 위해 잡은 가상 수치다.

| 설정 | 값 | 뜻 |
|---|---|---|
| 검사 경로 | `GET /healthz` | 200이 오면 살아 있는 것으로 본다 |
| 검사 주기 | 5초 | 5초마다 한 번씩 물어본다 |
| 타임아웃 | 2초 | 2초 안에 답이 없으면 그 회차는 실패 |
| 제외 조건 | 연속 2회 실패 | 죽은 뒤 최대 12초에 대상에서 빠진다 |
| 복귀 조건 | 연속 2회 성공 | 고쳐진 뒤 최대 10초에 다시 받는다 |

여기서 "연속 2회"가 핵심이다. 1회 실패로 빼면 네트워크가 한 번 튄 것만으로 멀쩡한 서버가 빠진다. 반대로 5회를 기다리면 이미 죽은 서버에 약 27초 동안 요청이 계속 들어간다. 그 27초치 요청은 전부 실패다. 27초는 5초 주기로 다섯 번을 세고 마지막 타임아웃 2초를 더한 값이다. 2회는 그 사이에서 고른 값이고, 최악의 경우 5+5+2 = 12초 만에 빠진다.

검사 주기만큼 중요한 것이 `/healthz` 가 무엇을 보고 200을 답하느냐다. 프로세스가 살아 있기만 하면 200을 주는 구현이 가장 흔하다. 그런데 이러면 `bidder` 가 떠 있지만 모델 저장소를 못 읽는 상태를 못 잡는다. 그 서버는 계속 대상에 남아 요청을 받으면서, 계속 빈 응답을 낸다.

반대로 `/healthz` 안에서 의존하는 것을 전부 확인하면 다른 사고가 난다. 모델 저장소가 3초 흔들리면 3대가 동시에 실패를 답한다. 그러면 세 대가 한꺼번에 빠지고, 대상 그룹에 한 대도 안 남는다.

선은 이 자리에 긋는다. **나 하나만 빠지면 해결되는 것**은 `/healthz` 에서 본다 — 모델 파일 적재 여부, 스레드풀 고갈, 로컬 디스크. **모두가 같이 쓰는 것**은 보지 않는다 — 공용 저장소, 공용 DB. 뒤엣것이 죽으면 남은 서버도 똑같이 못 하니, 빼 봐야 보낼 곳이 없다.

배포도 이 장치를 그대로 쓴다. 새 버전을 올릴 서버는 먼저 `/healthz` 를 실패로 바꿔 스스로 대상에서 빠진다. 빠진 뒤에 프로세스를 교체하고, 준비가 끝나면 다시 200을 답한다. 그러면 10초 안에 대상으로 돌아온다. 1절에서 24만 건을 버리게 만들었던 20초가 여기서는 대부분 사라진다.

대부분이지 전부가 아니다. LB는 연결 단위로 대상을 고른다. 대상에서 뺀다는 건 "새 연결을 더 보내지 않는다"는 뜻이지, 이미 맺어진 연결을 옮긴다는 뜻이 아니다. 매체는 12ms 예산 때문에 연결을 계속 붙여 두고 쓴다. 그래서 앱이 종료할 때 남은 연결을 스스로 닫아 줘야(graceful shutdown) 비로소 손실이 0이 된다. 이걸 빼먹으면 헬스체크를 아무리 잘 잡아도 배포 때마다 몇백 건이 샌다.

<figure style="text-align:center; margin:2rem 0;">
<svg viewBox="0 0 700 240" role="img" aria-label="매체가 LB 대표 주소 하나만 호출하고, LB가 헬스체크로 살아 있는 bidder 서버 두 대에만 요청을 넘기는 구조. 배포 중인 서버 한 대는 대상에서 빠져 있지만 헬스체크는 계속 받는다." style="width:100%; max-width:680px; height:auto; font-family:var(--font-sans)">
<defs>
<marker id="gw2-arr" markerWidth="9" markerHeight="9" refX="7.5" refY="3" orient="auto"><path d="M0,0 L7.5,3 L0,6 Z" style="fill:var(--accent-primary)"/></marker>
<marker id="gw2-hc" markerWidth="8" markerHeight="8" refX="6.5" refY="2.5" orient="auto"><path d="M0,0 L6.5,2.5 L0,5 Z" style="fill:var(--text-muted)"/></marker>
</defs>
<rect x="14" y="86" width="120" height="58" rx="9" style="fill:var(--bg-tertiary); stroke:var(--border-color); stroke-width:1.5"/>
<text x="74" y="111" text-anchor="middle" style="font-size:13px; fill:var(--text-primary)">매체 1곳</text>
<text x="74" y="129" text-anchor="middle" style="font-size:9.5px; fill:var(--text-muted)">설정에 주소 1개</text>
<line x1="134" y1="115" x2="214" y2="115" style="stroke:var(--accent-primary); stroke-width:2" marker-end="url(#gw2-arr)"/>
<text x="174" y="106" text-anchor="middle" style="font-size:10px; fill:var(--text-muted); font-family:var(--font-mono)">10.0.9.7</text>
<text x="293" y="66" text-anchor="middle" style="font-size:10.5px; fill:var(--accent-primary)">이번 절에서 새로 생긴 칸</text>
<rect x="218" y="78" width="150" height="74" rx="9" style="fill:var(--bg-secondary); stroke:var(--accent-primary); stroke-width:2"/>
<text x="293" y="104" text-anchor="middle" style="font-size:13px; font-weight:700; fill:var(--accent-primary)">LB</text>
<text x="293" y="122" text-anchor="middle" style="font-size:9.5px; fill:var(--text-muted)">대표 IP 1개</text>
<text x="293" y="138" text-anchor="middle" style="font-size:9.5px; fill:var(--text-muted)">IP·포트만 본다 (L4)</text>
<text x="293" y="174" text-anchor="middle" style="font-size:10px; fill:var(--text-muted); font-family:var(--font-mono)">GET /healthz · 5s</text>
<text x="293" y="191" text-anchor="middle" style="font-size:9.5px; fill:var(--text-muted)">점선 화살표 = 헬스체크</text>
<rect x="470" y="40" width="214" height="180" rx="10" style="fill:none; stroke:var(--text-muted); stroke-width:1.3; stroke-dasharray:6 4"/>
<text x="577" y="58" text-anchor="middle" style="font-size:11px; fill:var(--text-muted)">대상 그룹 — bidder 3대</text>
<rect x="486" y="68" width="182" height="42" rx="9" style="fill:var(--bg-tertiary); stroke:var(--border-color); stroke-width:1.5"/>
<text x="577" y="87" text-anchor="middle" style="font-size:13px; fill:var(--text-primary)">bidder</text>
<text x="577" y="102" text-anchor="middle" style="font-size:10px; fill:var(--text-muted); font-family:var(--font-mono)">10.0.3.14</text>
<rect x="486" y="120" width="182" height="42" rx="9" style="fill:var(--bg-tertiary); stroke:var(--border-color); stroke-width:1.5"/>
<text x="577" y="139" text-anchor="middle" style="font-size:13px; fill:var(--text-primary)">bidder</text>
<text x="577" y="154" text-anchor="middle" style="font-size:10px; fill:var(--text-muted); font-family:var(--font-mono)">10.0.3.15</text>
<rect x="486" y="172" width="182" height="42" rx="9" style="fill:var(--bg-secondary); stroke:var(--text-muted); stroke-width:1.5; stroke-dasharray:5 4"/>
<text x="577" y="190" text-anchor="middle" style="font-size:11px; fill:var(--text-muted)">배포 중 — 대상에서 빠짐</text>
<text x="577" y="205" text-anchor="middle" style="font-size:10px; fill:var(--text-muted); font-family:var(--font-mono)">10.0.3.16</text>
<line x1="368" y1="100" x2="482" y2="84" style="stroke:var(--accent-primary); stroke-width:2" marker-end="url(#gw2-arr)"/>
<line x1="368" y1="108" x2="482" y2="102" style="stroke:var(--text-muted); stroke-width:1.1; stroke-dasharray:4 3" marker-end="url(#gw2-hc)"/>
<line x1="368" y1="116" x2="482" y2="136" style="stroke:var(--accent-primary); stroke-width:2" marker-end="url(#gw2-arr)"/>
<line x1="368" y1="124" x2="482" y2="152" style="stroke:var(--text-muted); stroke-width:1.1; stroke-dasharray:4 3" marker-end="url(#gw2-hc)"/>
<line x1="368" y1="132" x2="482" y2="202" style="stroke:var(--text-muted); stroke-width:1.1; stroke-dasharray:4 3" marker-end="url(#gw2-hc)"/>
</svg>
<figcaption style="margin-top:0.75rem; font-size:0.9rem; color:var(--text-muted)">LB가 끼어들면서 "누가 살아 있나"를 아는 주체가 매체에서 우리 쪽으로 넘어왔다. 빠진 서버에도 헬스체크는 계속 간다 — 그래야 돌아올 수 있다.</figcaption>
</figure>

### L4 LB가 못 하는 것

지금 이 LB는 IP와 포트만 본다. 이런 방식을 L4 LB라고 부른다. 4는 TCP·UDP를 담당하는 계층의 번호다. 연결이 들어오면 대상 하나를 골라 그대로 넘길 뿐, 그 연결에 어떤 HTTP 요청이 실려 오는지는 열어 보지 않는다.

우리가 매체에 열어 준 주소는 두 개다. `POST /v1/bid` 는 12ms 안에 답해야 하는 입찰 요청이다. `POST /v1/track` 은 노출·클릭을 기록하는 요청이라 100ms가 걸려도 된다. 그런데 L4 LB에게는 둘 다 그냥 "8080 포트로 들어온 TCP 연결"이다. 어느 쪽인지 구분할 방법이 없다.

구분하지 못하면 사고가 난다. `/v1/track` 이 100ms를 쓰는 동안 그 서버의 처리 슬롯 하나가 묶인다. 트래킹이 몰리는 시간대에는 `/v1/bid` 가 슬롯을 못 잡아 12ms를 넘긴다. 느린 쪽이 빠른 쪽을 끌어내리는 것이다.

포트를 나누면 되지 않느냐 — 8080은 입찰, 8081은 트래킹으로. 그러면 매체 설정을 다시 고쳐 달라고 부탁해야 한다. 지금은 두 개지만 서비스가 열둘이 되면 포트도 열두 개다. 2절에서 막 벗어난 자리로 되돌아가는 것이다.

경로를 보고 갈라 보내려면 요청 안을 열어 보는 부품이 필요하다. 그게 3절이다.
