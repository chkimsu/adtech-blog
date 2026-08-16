지훈 씨가 만든 클릭 수집 API 가 배포됐습니다. 매체 쪽에 주소를 알려 주려고 서버 IP `10.0.3.14:8080` 을 적어 메일을 쓰는데, 선배가 그걸 붙잡았습니다. **"그 주소를 주면 다음 배포 때 매체 요청이 통째로 날아갑니다."**

그러면서 대신 알려 준 주소는 `ads.example.com` 이었습니다. 서버 IP 도 아니고 포트도 없습니다. 그 이름과 지훈 씨 서버 사이에 부품이 셋 서 있는데, 이름이 로드밸런서·Ingress·API Gateway 입니다.

**넷 다 "요청을 어디로 보낼지 정하는" 일을 합니다. 그런데 왜 넷일까요?**

한꺼번에 설계된 것이 아니기 때문입니다. 서비스가 늘 때마다 구체적인 사고가 하나씩 나고, 그걸 막으려고 부품이 하나씩 생겼습니다. 이 글은 서버 한 대에서 시작해 그 순서를 따라갑니다. 순서대로 보면 넷의 경계가 저절로 갈립니다.

> **한 줄 요약:** 로드밸런서·Ingress·API Gateway 는 한꺼번에 설계된 것이 아닙니다. 서비스가 늘 때마다 생긴 문제에 하나씩 답한 결과라, 생긴 순서가 그대로 경계입니다.

> **골라 읽는 법** — 절이 다섯 개입니다.
>
> - 부품이 왜 생겼는지 순서대로 → 1~4절
> - "라우터"라는 말이 헷갈리면 → 3절 뒷부분
> - Ingress 와 API Gateway 의 경계만 → 4절
> - 넷을 한 표로 비교만 → 5절

이 글의 숫자는 전부 설명을 위해 지어낸 값입니다. 다만 설정 파일의 **모양**은 실제 nginx · 쿠버네티스 · Gateway 제품이 쓰는 그대로입니다. 그리고 이 글이 따라가는 요청은 지훈 씨의 클릭 수집이 아니라, 같은 길을 지나는 것 중 가장 빡빡한 **입찰 요청**입니다. 12ms 안에 답해야 하는 요청에서 부품 하나의 비용이 가장 선명하게 드러납니다.

---

## 1. 서버 한 대 — 매체가 주소를 직접 부릅니다

**부품이 하나도 없으면 매체가 우리 서버 주소를 직접 압니다. 그래서 서버가 잠깐만 멈춰도 그 시간만큼 요청이 통째로 사라집니다.**

선배가 막은 그 메일이 실제로 나갔다면, 매체 쪽 연동 설정 파일에 이렇게 적힙니다.

```yaml
# 매체 서버의 DSP 연동 설정
bidders:
  - name: our-dsp
    endpoint: http://10.0.3.14:8080/v1/bid
    timeout_ms: 12
```

`10.0.3.14` 는 우리 `bidder` 서버의 IP 입니다. 매체는 이 주소로만 요청을 보냅니다. 초당 3,000건씩 들어오고, 12ms 안에 답해야 하며, 늦으면 그 건은 없던 일이 됩니다.

매체와 우리는 같은 데이터센터 안에서 전용 회선으로 붙어 있습니다. 중간에 거치는 것도 없어서 사설 IP 를 그대로 부를 수 있고, 12ms 라는 빡빡한 예산이 성립합니다.

**문제는 배포할 때 드러납니다.** 새 버전을 올리려면 `bidder` 프로세스를 내리고 새 프로세스를 띄워야 합니다. 그 사이 `10.0.3.14:8080` 은 아무도 듣지 않는 포트가 됩니다. 이때 매체가 보낸 요청은 느린 응답을 받는 게 아니라 **연결 자체가 거부**됩니다. 12ms 예산 안에서는 다시 시도할 여유도 없습니다.

<figure style="text-align:center; margin:2rem 0;">
<svg viewBox="0 0 500 180" role="img" aria-label="매체 한 곳이 bidder 서버 한 대의 IP를 직접 호출하는 구조. 그 서버 한 칸이 배포 중에 사라지면 대신 부를 곳이 없다." style="width:100%; max-width:500px; height:auto; font-family:var(--font-sans)">
<defs>
<marker id="gw1-arr" markerWidth="9" markerHeight="9" refX="7.5" refY="3" orient="auto"><path d="M0,0 L7.5,3 L0,6 Z" style="fill:var(--accent-primary)"/></marker>
</defs>
<rect x="6" y="44" width="140" height="60" rx="9" style="fill:var(--bg-tertiary); stroke:var(--border-color); stroke-width:1.5"/>
<text x="76" y="70" text-anchor="middle" style="font-size:13px; fill:var(--text-primary)">매체 1곳</text>
<text x="76" y="90" text-anchor="middle" style="font-size:12.5px; fill:var(--text-muted)">설정에 IP가 박혀 있습니다</text>
<line x1="152" y1="74" x2="330" y2="74" style="stroke:var(--accent-primary); stroke-width:2" marker-end="url(#gw1-arr)"/>
<text x="241" y="64" text-anchor="middle" style="font-size:12.5px; fill:var(--text-muted); font-family:var(--font-mono)">10.0.3.14:8080</text>
<rect x="336" y="38" width="142" height="72" rx="13" style="fill:none; stroke:var(--state-bad); stroke-width:1.6; stroke-dasharray:5 4"/>
<rect x="342" y="44" width="130" height="60" rx="9" style="fill:var(--bg-secondary); stroke:var(--accent-primary); stroke-width:1.8"/>
<text x="407" y="70" text-anchor="middle" style="font-size:13px; font-weight:700; fill:var(--accent-primary)">bidder</text>
<text x="407" y="90" text-anchor="middle" style="font-size:12.5px; fill:var(--text-muted)">서버 1대</text>
<line x1="407" y1="110" x2="407" y2="134" style="stroke:var(--state-bad); stroke-width:1.6; stroke-dasharray:5 4"/>
<text x="407" y="152" text-anchor="middle" style="font-size:12.5px; fill:var(--state-bad)">배포하면 이 칸이 잠깐 사라집니다</text>
<text x="407" y="171" text-anchor="middle" style="font-size:12.5px; fill:var(--state-bad)">그동안 요청은 전부 실패</text>
</svg>
<figcaption style="margin-top:0.75rem; font-size:0.9rem; color:var(--text-muted)">실선이 하나뿐인 게 이 그림의 전부입니다. 그 하나가 끊기면 매체 쪽에 대안이 없습니다.</figcaption>
</figure>

얼마나 사라지는지 세어 보겠습니다. 하루에 배포를 4번 하고, 한 번 배포할 때 프로세스가 없는 시간이 20초이고, 이 매체가 초당 3,000건을 보냅니다. 곱하면 **하루 24만 건**입니다.

이 요청들은 우리가 응찰조차 못 한 건이라 매출로도 안 잡히고, **우리 쪽 에러 로그에도 안 남습니다.** 로그를 남길 프로세스가 그 순간 떠 있지 않기 때문입니다. 매체 리포트에만 "응답률이 낮은 DSP"로 조용히 기록됩니다. 앞 글 9절에서 본 "서버 로그에 아예 없는 요청"이 여기서도 그대로입니다.

배포를 조심히 하면 되지 않느냐고 물을 수 있습니다. 그런데 배포를 멈춰도 서버는 죽습니다. 디스크가 차거나, 커널이 패닉을 내거나, 앞단 스위치가 재시작합니다. **이때 매체가 대신 부를 주소가 없다는 것이 문제입니다.** 설정 파일에 적힌 주소가 하나뿐이기 때문입니다. 그래서 서버를 여러 대로 늘리는 것 말고는 답이 없습니다.

## 2. 세 대로 늘렸습니다 — 로드밸런서가 생깁니다

**서버를 3대로 늘리면 한 대가 죽어도 서비스는 삽니다. 대신 "매체가 어느 주소를 불러야 하나"라는 문제가 새로 생깁니다.**

`bidder` 를 `10.0.3.14`, `10.0.3.15`, `10.0.3.16` 세 대에 띄웠다고 하겠습니다. 이제 배포는 한 대씩 돌아가며 하면 되고, 한 대를 내리는 동안 나머지 두 대가 요청을 받습니다. 1절에서 하루 24만 건을 날리던 20초가 없어집니다.

대신 배포 중에는 남은 2대가 3대 몫을 받습니다. 평소 서버당 1,000건이던 것이 그동안 1,500건이 됩니다. **그래서 3대라는 숫자는 평소가 아니라 이 순간을 기준으로 잡습니다.** 평소에 딱 맞게 잡으면 배포할 때마다 지연이 튑니다.

그런데 매체 입장에서 보면 곤란해집니다. 설정 파일에 IP 3개를 다 적어야 할까요. `10.0.3.15` 가 죽으면 매체 담당자에게 연락해서 그 줄을 빼 달라고 해야 할까요. 서버를 5대로 늘릴 때마다 매체 수십 곳에 같은 부탁을 반복해야 할까요. **우리 쪽 사정을 매체가 대신 관리하는 꼴입니다.**

**로드밸런서(LB)** 가 이 자리를 메웁니다. 대표 주소 하나를 앞에 세우고, 그 뒤에 서버 3대를 대상으로 등록합니다. 매체 설정에는 이제 `10.0.9.7` 하나만 적힙니다. 뒤에 서버가 3대인지 12대인지는 매체가 알 필요가 없습니다.

로드밸런서가 실제로 하는 일은 두 가지입니다. 하나는 들어온 연결을 대상 중 하나에 넘기는 것이고, 다른 하나는 **살아 있는 대상만 고르는 것**입니다. 두 번째를 하려면 대상의 상태를 계속 확인해야 하니, 주기적으로 정해진 주소를 찔러 봅니다. 이것을 헬스체크라고 합니다.

설정값은 이런 모양입니다.

| 설정 | 값 | 뜻 |
|---|---|---|
| 검사 경로 | `GET /healthz` | 200 이 오면 살아 있는 것으로 봅니다 |
| 검사 주기 | 5초 | 5초마다 한 번씩 물어봅니다 |
| 타임아웃 | 2초 | 2초 안에 답이 없으면 그 회차는 실패 |
| 제외 조건 | 연속 2회 실패 | 죽은 뒤 최대 12초에 대상에서 빠집니다 |
| 복귀 조건 | 연속 2회 성공 | 고쳐진 뒤 최대 10초에 다시 받습니다 |

**다섯 줄 중 실제로 고민하는 것은 제외 조건 하나입니다.** 1회 실패로 빼면 네트워크가 한 번 튄 것만으로 멀쩡한 서버가 빠집니다. 반대로 5회를 기다리면 이미 죽은 서버에 약 27초 동안 요청이 계속 들어가고, 그 27초치 요청은 전부 실패합니다. 2회는 그 사이에서 고른 값이고, 최악의 경우 5+5+2 = 12초 만에 빠집니다.

로드밸런서 대신 DNS 를 쓰면 되지 않느냐는 물음에도 이 12초가 답합니다. 이름 하나에 IP 셋을 걸어 두면 대표 주소는 하나가 됩니다. 그런데 죽은 IP 가 매체 쪽 캐시에서 빠지는 데 시간이 걸리고, 그 시간을 지킨다는 보장도 없습니다. **12초 안에 빼는 일을 DNS 로는 못 합니다.**

<figure style="text-align:center; margin:2rem 0;">
<svg viewBox="0 0 500 250" role="img" aria-label="매체가 로드밸런서 대표 주소 하나만 호출하고, 로드밸런서가 헬스체크로 살아 있는 bidder 서버 두 대에만 요청을 넘기는 구조. 헬스체크에 실패한 서버 한 대는 대상에서 빠져 있지만 헬스체크는 계속 받는다." style="width:100%; max-width:500px; height:auto; font-family:var(--font-sans)">
<defs>
<marker id="gw2-arr" markerWidth="9" markerHeight="9" refX="7.5" refY="3" orient="auto"><path d="M0,0 L7.5,3 L0,6 Z" style="fill:var(--accent-primary)"/></marker>
<marker id="gw2-hc" markerWidth="8" markerHeight="8" refX="6.5" refY="2.5" orient="auto"><path d="M0,0 L6.5,2.5 L0,5 Z" style="fill:var(--text-muted)"/></marker>
</defs>
<rect x="6" y="20" width="140" height="50" rx="9" style="fill:var(--bg-tertiary); stroke:var(--border-color); stroke-width:1.5"/>
<text x="76" y="41" text-anchor="middle" style="font-size:13px; fill:var(--text-primary)">매체 1곳</text>
<text x="76" y="60" text-anchor="middle" style="font-size:12.5px; fill:var(--text-muted)">설정에 주소 1개</text>
<line x1="76" y1="70" x2="76" y2="88" style="stroke:var(--accent-primary); stroke-width:2" marker-end="url(#gw2-arr)"/>
<text x="86" y="86" style="font-size:12.5px; fill:var(--text-muted); font-family:var(--font-mono)">10.0.9.7</text>
<text x="76" y="108" text-anchor="middle" style="font-size:12.5px; fill:var(--accent-primary)">이번 절에서 새로 생긴 칸</text>
<rect x="6" y="116" width="140" height="72" rx="9" style="fill:var(--bg-secondary); stroke:var(--accent-primary); stroke-width:2"/>
<text x="76" y="140" text-anchor="middle" style="font-size:13px; font-weight:700; fill:var(--accent-primary)">로드밸런서</text>
<text x="76" y="160" text-anchor="middle" style="font-size:12.5px; fill:var(--text-muted)">대표 IP 1개</text>
<text x="76" y="180" text-anchor="middle" style="font-size:12.5px; fill:var(--text-muted)">IP·포트만 봅니다</text>
<text x="76" y="212" text-anchor="middle" style="font-size:12.5px; fill:var(--text-muted); font-family:var(--font-mono)">GET /healthz · 5초</text>
<text x="76" y="232" text-anchor="middle" style="font-size:12.5px; fill:var(--text-muted)">점선 = 헬스체크</text>
<rect x="330" y="14" width="164" height="222" rx="10" style="fill:none; stroke:var(--text-muted); stroke-width:1.3; stroke-dasharray:6 4"/>
<text x="412" y="34" text-anchor="middle" style="font-size:12.5px; fill:var(--text-muted)">대상 그룹 — bidder 3대</text>
<rect x="342" y="46" width="140" height="50" rx="9" style="fill:var(--bg-tertiary); stroke:var(--border-color); stroke-width:1.5"/>
<text x="412" y="67" text-anchor="middle" style="font-size:13px; fill:var(--text-primary)">bidder</text>
<text x="412" y="86" text-anchor="middle" style="font-size:12.5px; fill:var(--text-muted); font-family:var(--font-mono)">10.0.3.14</text>
<rect x="342" y="108" width="140" height="50" rx="9" style="fill:var(--bg-tertiary); stroke:var(--border-color); stroke-width:1.5"/>
<text x="412" y="129" text-anchor="middle" style="font-size:13px; fill:var(--text-primary)">bidder</text>
<text x="412" y="148" text-anchor="middle" style="font-size:12.5px; fill:var(--text-muted); font-family:var(--font-mono)">10.0.3.15</text>
<rect x="342" y="170" width="140" height="50" rx="9" style="fill:var(--bg-secondary); stroke:var(--text-muted); stroke-width:1.5; stroke-dasharray:5 4"/>
<text x="412" y="191" text-anchor="middle" style="font-size:12.5px; fill:var(--text-muted)">헬스체크 실패 — 빠짐</text>
<text x="412" y="210" text-anchor="middle" style="font-size:12.5px; fill:var(--text-muted); font-family:var(--font-mono)">10.0.3.16</text>
<line x1="150" y1="132" x2="338" y2="66" style="stroke:var(--accent-primary); stroke-width:2" marker-end="url(#gw2-arr)"/>
<line x1="150" y1="144" x2="338" y2="84" style="stroke:var(--text-muted); stroke-width:1.1; stroke-dasharray:4 3" marker-end="url(#gw2-hc)"/>
<line x1="150" y1="156" x2="338" y2="126" style="stroke:var(--accent-primary); stroke-width:2" marker-end="url(#gw2-arr)"/>
<line x1="150" y1="168" x2="338" y2="146" style="stroke:var(--text-muted); stroke-width:1.1; stroke-dasharray:4 3" marker-end="url(#gw2-hc)"/>
<line x1="150" y1="180" x2="338" y2="196" style="stroke:var(--text-muted); stroke-width:1.1; stroke-dasharray:4 3" marker-end="url(#gw2-hc)"/>
</svg>
<figcaption style="margin-top:0.75rem; font-size:0.9rem; color:var(--text-muted)">로드밸런서가 끼면서 "누가 살아 있나"를 아는 주체가 매체에서 우리 쪽으로 넘어왔습니다. 빠진 서버에도 헬스체크는 계속 갑니다 — 그래야 돌아올 수 있습니다.</figcaption>
</figure>

### `/healthz` 가 무엇을 보고 200을 답하나

검사 주기만큼 중요한 것이 이것입니다. 프로세스가 살아 있기만 하면 200을 주는 구현이 가장 흔합니다. 그런데 이러면 `bidder` 가 떠 있지만 모델 저장소를 못 읽는 상태를 못 잡습니다. 그 서버는 계속 대상에 남아 요청을 받으면서, 계속 빈 응답을 냅니다.

반대로 `/healthz` 안에서 의존하는 것을 전부 확인하면 다른 사고가 납니다. 모델 저장소가 3초 흔들리면 3대가 동시에 실패를 답하고, 그러면 세 대가 한꺼번에 빠져 대상 그룹에 한 대도 안 남습니다.

**선은 이 자리에 긋습니다.** 나 하나만 빠지면 해결되는 것은 `/healthz` 에서 봅니다 — 모델 파일 적재 여부, 스레드풀 고갈, 로컬 디스크입니다. 모두가 같이 쓰는 것은 보지 않습니다 — 공용 저장소, 공용 DB 입니다. 뒤엣것이 죽으면 남은 서버도 똑같이 못 하니, 빼 봐야 보낼 곳이 없기 때문입니다.

배포도 이 장치를 그대로 씁니다. 새 버전을 올릴 서버는 먼저 대상 그룹에서 스스로 빠지고, 프로세스를 교체한 뒤 다시 등록해 복귀를 알립니다. 1절에서 24만 건을 버리게 만들었던 20초가 여기서 대부분 사라집니다.

대부분이지 전부는 아닙니다. 로드밸런서는 **연결 단위**로 대상을 고릅니다. 대상에서 뺀다는 건 "새 연결을 더 보내지 않는다"는 뜻이지, 이미 맺어진 연결을 옮긴다는 뜻이 아닙니다. 매체는 12ms 예산 때문에 연결을 계속 붙여 두고 씁니다. 그래서 앱이 종료할 때 남은 연결을 스스로 닫아 줘야 비로소 손실이 0이 됩니다. 이걸 빼먹으면 빼는 순서를 아무리 잘 잡아도 **배포 때마다 몇백 건이 샙니다.**

한 가지 더 조심할 것이 있습니다. 서버를 뺄 때 `/healthz` 를 일부러 실패시키는 방법을 쓰는 경우가 있는데, 제품에 따라 이러면 **이미 처리 중이던 요청까지 끊깁니다.** 헬스체크 실패는 서버가 진짜 죽었을 때 빨리 걷어 내라고 있는 것이지, 멀쩡한 서버를 뺄 때 쓰는 방법이 아닙니다. 뺄 때는 명시적으로 빼는 쪽을 씁니다.

### 이 로드밸런서가 못 하는 것

지금 이 로드밸런서는 IP 와 포트만 봅니다. 연결이 들어오면 대상 하나를 골라 그대로 넘길 뿐, 그 연결에 어떤 요청이 실려 오는지는 열어 보지 않습니다.

우리가 매체에 열어 준 주소는 두 개입니다. `POST /v1/bid` 는 12ms 안에 답해야 하는 입찰 요청입니다. `POST /v1/track` 은 노출·클릭을 기록하는 요청이라 100ms 가 걸려도 됩니다. **그런데 이 로드밸런서에게는 둘 다 그냥 "8080 포트로 들어온 연결"입니다.**

구분하지 못하면 사고가 납니다. `/v1/track` 이 100ms 를 쓰는 동안 그 서버의 처리 슬롯 하나가 묶입니다. 트래킹이 몰리는 시간대에는 `/v1/bid` 가 슬롯을 못 잡아 12ms 를 넘깁니다. **느린 쪽이 빠른 쪽을 끌어내리는 것입니다.**

포트를 나누면 되지 않느냐고 할 수 있습니다. 8080은 입찰, 8081은 트래킹으로 말입니다. 그러면 매체 설정을 다시 고쳐 달라고 부탁해야 하고, 서비스가 열둘이 되면 포트도 열두 개입니다. 방금 벗어난 자리로 되돌아가는 셈입니다.

그래서 판단 기준은 하나로 정리됩니다. **같은 포트로 들어오는 요청 중 응답 시간 예산이 다른 것이 섞여 있으면, 경로를 열어 보는 부품이 필요합니다.** 그것이 3절입니다.

## 3. 서비스를 넷으로 쪼갰습니다 — Ingress가 생깁니다

**서비스를 넷으로 나누면 앞에 세울 대표 주소도 넷이 됩니다. Ingress 는 주소를 다시 하나로 되돌리고, 대신 경로를 보고 갈라 보냅니다.**

`bidder` 한 프로세스에 네 가지가 같이 들어 있었습니다. 입찰 응답 만들기, pCTR 예측, 피처 조회, 노출·클릭 기록입니다. 이걸 `bidder`·`pctr`·`feature-store`·`log-collector` 넷으로 갈랐습니다. pCTR 모델만 하루 세 번 올리고 싶은데, 그때마다 입찰 프로세스까지 같이 내려야 했기 때문입니다.

서비스마다 로드밸런서를 하나씩 세우면 2절을 네 번 반복하는 꼴이 됩니다. 대표 주소가 4개, 대상 그룹과 헬스체크 설정이 4벌, 월 비용이 4배이고, 매체가 알아야 할 주소도 2개가 됩니다.

**Ingress** 는 이 자리에 규칙표 하나를 놓습니다. 주소는 다시 하나로 돌아가고, 그 뒤에서 요청을 열어 보고 갈라 보냅니다. 2절의 로드밸런서가 없어지는 것은 아닙니다. 로드밸런서는 그대로 대표 주소를 들고 있고, 그 대상이 `bidder` 서버 3대에서 Ingress 로 바뀝니다. **`/v1/track` 이 이제 `log-collector` 로 빠지니 입찰 슬롯을 더 이상 먹지 않습니다.** 2절에서 12ms 를 넘기게 만들던 원인이 여기서 사라집니다.

대신 매체 설정을 한 번 더 고쳐야 합니다. Ingress 는 요청 헤더에 실린 호스트 이름을 보고 규칙을 고르기 때문입니다. 그래서 `10.0.9.7` 을 `ads.example.com` 으로 바꾸고, 사내 DNS 에 그 이름을 같은 IP 로 등록합니다. **이 부탁은 이번이 마지막입니다.** 서비스는 앞으로도 늘겠지만 이름은 하나로 끝납니다. 선배가 지훈 씨에게 알려 준 그 주소가 이것입니다.

<figure style="text-align:center; margin:2rem 0;">
<svg viewBox="0 0 500 332" role="img" aria-label="매체가 이름 하나로 로드밸런서를 부르고, 그 뒤에 놓인 Ingress가 쪼갠 서비스 넷 중 셋으로 요청을 갈라 보내는 구조. pctr 칸에는 화살표가 닿지 않는다." style="width:100%; max-width:500px; height:auto; font-family:var(--font-sans)">
<defs>
<marker id="gw3-arr" markerWidth="9" markerHeight="9" refX="7.5" refY="3" orient="auto"><path d="M0,0 L7.5,3 L0,6 Z" style="fill:var(--accent-primary)"/></marker>
</defs>
<rect x="6" y="30" width="170" height="72" rx="9" style="fill:var(--bg-tertiary); stroke:var(--border-color); stroke-width:1.5"/>
<text x="91" y="52" text-anchor="middle" style="font-size:13px; fill:var(--text-primary)">매체 1곳</text>
<text x="91" y="72" text-anchor="middle" style="font-size:12.5px; fill:var(--text-muted)">설정에 주소 1개</text>
<text x="91" y="92" text-anchor="middle" style="font-size:12.5px; fill:var(--text-muted); font-family:var(--font-mono)">ads.example.com</text>
<line x1="180" y1="66" x2="206" y2="66" style="stroke:var(--accent-primary); stroke-width:2" marker-end="url(#gw3-arr)"/>
<text x="266" y="32" text-anchor="middle" style="font-size:12.5px; fill:var(--text-muted)">2절 그대로</text>
<rect x="210" y="40" width="112" height="52" rx="9" style="fill:var(--bg-secondary); stroke:var(--border-color); stroke-width:1.5"/>
<text x="266" y="62" text-anchor="middle" style="font-size:13px; fill:var(--text-primary)">로드밸런서</text>
<text x="266" y="82" text-anchor="middle" style="font-size:12.5px; fill:var(--text-muted); font-family:var(--font-mono)">10.0.9.7</text>
<path d="M266,92 L266,124 L350,124 L350,150" style="fill:none; stroke:var(--accent-primary); stroke-width:2; stroke-linejoin:round" marker-end="url(#gw3-arr)"/>
<text x="250" y="142" text-anchor="middle" style="font-size:12.5px; fill:var(--accent-primary)">이번 절에서 새로 생긴 칸</text>
<rect x="110" y="154" width="280" height="52" rx="9" style="fill:var(--bg-secondary); stroke:var(--accent-primary); stroke-width:2"/>
<text x="250" y="176" text-anchor="middle" style="font-size:13px; font-weight:700; fill:var(--accent-primary)">Ingress</text>
<text x="250" y="196" text-anchor="middle" style="font-size:12.5px; fill:var(--text-muted)">규칙표 — 호스트와 경로를 봅니다</text>
<rect x="12" y="250" width="476" height="76" rx="10" style="fill:none; stroke:var(--text-muted); stroke-width:1.3; stroke-dasharray:6 4"/>
<rect x="24" y="260" width="107" height="40" rx="9" style="fill:var(--bg-tertiary); stroke:var(--border-color); stroke-width:1.5"/>
<text x="77.5" y="285" text-anchor="middle" style="font-size:12.5px; fill:var(--text-primary)">bidder</text>
<rect x="139" y="260" width="107" height="40" rx="9" style="fill:var(--bg-tertiary); stroke:var(--border-color); stroke-width:1.5"/>
<text x="192.5" y="285" text-anchor="middle" style="font-size:12.5px; fill:var(--text-primary)">pctr</text>
<rect x="254" y="260" width="107" height="40" rx="9" style="fill:var(--bg-tertiary); stroke:var(--border-color); stroke-width:1.5"/>
<text x="307.5" y="285" text-anchor="middle" style="font-size:12.5px; fill:var(--text-primary)">feature-store</text>
<rect x="369" y="260" width="107" height="40" rx="9" style="fill:var(--bg-tertiary); stroke:var(--border-color); stroke-width:1.5"/>
<text x="422.5" y="285" text-anchor="middle" style="font-size:12.5px; fill:var(--text-primary)">log-collector</text>
<text x="250" y="318" text-anchor="middle" style="font-size:12.5px; fill:var(--text-muted)">쪼갠 서비스 4개</text>
<line x1="180" y1="208" x2="77.5" y2="256" style="stroke:var(--accent-primary); stroke-width:2" marker-end="url(#gw3-arr)"/>
<line x1="250" y1="208" x2="307.5" y2="256" style="stroke:var(--accent-primary); stroke-width:2" marker-end="url(#gw3-arr)"/>
<line x1="320" y1="208" x2="422.5" y2="256" style="stroke:var(--accent-primary); stroke-width:2" marker-end="url(#gw3-arr)"/>
</svg>
<figcaption style="margin-top:0.75rem; font-size:0.9rem; color:var(--text-muted)">새로 칠해진 칸은 Ingress 하나입니다. 로드밸런서는 2절에서 하던 일을 그대로 하고, 화살표는 pctr 에 닿지 않습니다.</figcaption>
</figure>

규칙표는 실제로 이런 모양입니다.

```yaml
# Ingress 규칙 — 이 네 줄 다 pathType 은 Prefix 입니다.
rules:
  - host: ads.example.com
    http:
      paths:
        - path: /v1/bid      →  bidder-service:8080
        - path: /v1/track    →  log-collector:8080
        - path: /v1/feature  →  feature-store:8080
  - host: admin.example.com
    http:
      paths:
        - path: /            →  admin-service:3000
# 맞는 줄이 하나도 없으면 404 입니다.
```

서비스는 넷인데 `ads.example.com` 아래 줄은 셋입니다. `pctr` 은 매체가 아니라 `bidder` 가 부르니 규칙표에 없습니다. **규칙표는 클러스터 바깥에서 들어오는 요청만 다룹니다.**

**규칙표에서 이기는 것은 위치가 아니라 길이입니다.** 가장 길게 맞는 줄이 이깁니다. 그래서 짧은 경로를 새로 추가할 때는 그 아래로 무엇이 딸려 들어오는지부터 세어 봐야 합니다.

언젠가 `/v1` 아래를 통째로 한곳에 보내는 규칙을 하나 넣게 됩니다. `/v1/bid` 는 안 뺏깁니다 — 더 길게 맞는 줄이 어디에 적혀 있든 이기기 때문입니다. 대신 `/v1` 아래에서 404 로 떨어지던 것이 전부 그 새 규칙으로 빨려 들어갑니다. `/v1/report` 도, `/v1/status` 도, 오타로 들어온 `/v1/bidd` 도 그렇습니다. **문법 오류도 없고, 배포도 성공하고, 헬스체크도 전부 초록입니다.**

`pathType` 은 `Prefix` 면 `/v1/bid` 아래 경로까지 같이 걸리고, `Exact` 면 딱 그 경로만 걸립니다. 다만 글자 단위가 아니라 `/` 로 끊은 조각 단위라, `/v1/bid` 는 `/v1/bid/test` 를 잡지만 `/v1/bidder` 는 안 잡습니다.

그래서 규칙을 하나 추가할 때 실제로 물을 것은 "이 줄이 무엇을 뺏나"가 아닙니다. **"이 줄 아래로 무엇이 딸려 들어오나"입니다.** 짧은 경로일수록 이 답이 길어지고, 답이 길면 그 규칙은 안 넣는 쪽이 낫습니다.

### "라우터"라는 말이 가리키는 것

지금까지 Ingress 라고 부른 것은 규칙표, 곧 적어 놓은 설정입니다. 그 표를 읽고 실제로 요청을 넘기는 것은 따로 도는 프로세스입니다. 그 프로세스를 "라우터"라고들 부르는데, **이 말이 문맥마다 다른 것을 가리켜서 대화가 자주 어긋납니다.**

| 어디서 쓰는 말인가 | 무엇을 가리키나 | 실제 이름 |
|---|---|---|
| 쿠버네티스 | 규칙표를 실제로 실행하는 프로세스 | Ingress Controller (nginx·traefik) |
| OpenShift | 규칙표에 해당하는 자체 리소스 | `Route` 오브젝트 |
| 앱 코드 안 | 들어온 경로를 함수에 연결하는 것 | `@app.route("/v1/bid")` |

셋이 하는 일은 같습니다. 경로를 보고 어디로 보낼지 정합니다. 다른 것은 **어느 층에서 도느냐**입니다. 그런데 셋이 세 층은 아닙니다. 1·2행은 같은 층이고 플랫폼만 다릅니다 — 쿠버네티스를 쓰면 1행, OpenShift 를 쓰면 2행이지 둘을 같이 지나가지 않습니다. 3행만 다른 층입니다.

그래서 `POST /v1/bid` 한 건은 두 층을 지납니다. 바깥에서는 Ingress Controller 가 `bidder-service` 를 고릅니다. 그 안에서는 `@app.route("/v1/bid")` 함수가 실행됩니다. **회의에서 "라우터에서 막힌 것 같다"는 말을 들으면 어느 층인지부터 되물어야 합니다.** 둘은 고치는 사람도 배포 주기도 다릅니다.

이제 매체가 열 곳으로 늘었습니다. 그중 한 곳이 설정을 잘못 올려 초당 3,000건이 아니라 30,000건을 보내기 시작합니다. 규칙표에는 이걸 막을 칸이 없습니다. 호스트와 경로밖에 안 보니 어느 매체가 보낸 요청인지조차 모릅니다. 그것이 4절입니다.

## 4. 매체가 열 곳으로 늘었습니다 — API Gateway가 생깁니다

**규칙표에는 "누가 보냈나"를 적을 칸이 없습니다. 매체를 가려야 하는 일이 쌓이면 그 칸을 가진 부품이 뒤에 하나 더 생깁니다.**

매체가 열 곳이 됐고 조건이 다 다릅니다.

| 매체 | 인증 방식 | 초당 허용 | 쓰는 버전 |
|---|---|---|---|
| A앱 | API 키 | 3,000 | v2 |
| B웹 | 서명 | 8,000 | v2 |
| C제휴 | API 키 | 500 | v1 |
| D앱 | 토큰 | 1,200 | v1 |
| E웹 | API 키 | 4,500 | v2 |
| 나머지 5곳 (합계) | — | 12,800 | — |

열 곳을 다 더하면 초당 3만 건입니다. 3절 끝에서 A앱 한 곳이 3,000이 아니라 **30,000 — 열 곳 전체와 맞먹는 양** — 을 보내기 시작했습니다. A앱만 느려지는 게 아니라 나머지 아홉 곳이 같이 느려집니다. **3만 건을 감당하는 것과, 한 곳이 3만 건을 쏟는 것을 막는 것은 다른 문제입니다.**

이 표를 규칙표로 옮길 방법이 없습니다. 규칙표에는 호스트와 경로 칸뿐이라 다음 넷이 전부 안 됩니다.

- **매체별 인증키 확인** — 요청을 누가 보냈는지 규칙표가 모릅니다.
- **초당 호출 제한** — 매체를 구분 못 하니 500과 8,000을 따로 걸 수 없습니다.
- **v1·v2 분기** — 버전은 `x-api-version` 헤더로 오는데 규칙표는 헤더를 안 봅니다.
- **응답 형식 변환** — v1 매체는 옛 필드 이름을 기대하는데 `bidder` 는 v2 형식만 만듭니다.

**API Gateway** 가 Ingress 뒤에 서서 이 넷을 맡습니다. 규칙표와 다른 점은 헤더 조건과 정책 칸입니다.

```yaml
# API Gateway 설정 — 규칙표에 없던 것: 헤더 조건과 정책
common:                                    # 모든 라우트가 먼저 지나갑니다
  - auth:      { type: api-key, header: x-media-key }
  - ratelimit: { key: media_id, per_second: media_quota }   # 값은 위 표의 초당 허용 열
  - timeout:   { ms: 10 }
routes:
  - id: bid-v1                             # 버전 헤더를 보낸 매체만 여기로
    match: { host: ads.example.com, path: /v1/bid, header: { x-api-version: "1" } }
    target: bidder-service:8080
    policies:
      - response: { transform: v2_to_v1 }  # 옛 필드 이름으로 되돌려 줍니다
  - id: bid-v2                             # 헤더가 없으면 여기가 기본값입니다
    match: { host: ads.example.com, path: /v1/bid }
    target: bidder-service:8080
```

버전을 경로로 나눌 수도 있습니다. `/v2/bid` 를 새로 파면 되는데, 그러면 v2 를 쓰는 매체 전부에 주소를 고쳐 달라고 해야 합니다. 3절에서 그 부탁은 이번이 마지막이라고 했습니다. **그래서 경로는 `/v1/bid` 로 두고, 옛 버전을 쓰는 매체만 헤더로 알립니다.**

주소는 그대로이고 A앱은 `x-media-key` 헤더 한 줄을 새로 넣습니다. 한 줄 늘긴 했지만 성격이 다릅니다. 주소는 우리 안쪽이 바뀔 때마다 따라 바뀌었지만, **인증키는 A앱이 A앱인 한 그대로**입니다.

`timeout` 을 12로 적고 싶겠지만 그러면 늦습니다. 12ms 는 매체가 요청을 보내고 답을 받기까지 전부입니다. Ingress 를 지나는 데 0.3ms, Gateway 가 인증키와 쿼터를 보는 데 1.1ms 가 듭니다. 그래서 `bidder` 를 기다리는 시간은 10ms 로 잡고, 남는 0.6ms 가 여유분입니다.

### 정책을 서비스마다 따로 두면

Gateway 없이 서비스 넷이 인증·쿼터·타임아웃 세 정책을 각자 구현하면 어떻게 되는지 개수로 세어 보겠습니다.

| | 서비스마다 각자 | Gateway 한 곳 |
|---|---|---|
| 구현 벌수 | 12벌 (서비스 4 × 정책 3) | 3벌 |
| 정책 하나 고칠 때 배포 | 4번 | 1번 |
| 넷이 애초에 같게 구현돼 있을 확률 | **72.9%** | 100% |

마지막 줄은 한 곳이 정확히 같게 구현될 확률을 0.9 로 두고 셋을 곱한 값입니다. **나머지 27.1% 는 사고가 날 때까지 아무 표시도 내지 않습니다.** 배포 네 번 중 하나만 늦어도 그동안은 서비스마다 다른 쿼터가 걸립니다.

무엇을 Gateway 에 두고 무엇을 서비스에 남길까요. **우리 광고 데이터를 안 봐도 정해지면 Gateway, 봐야 정해지면 서비스입니다.** 인증키가 맞나, 이 매체가 이번 초에 몇 건을 넘겼나, 버전이 몇인가 — 셋 다 광고 데이터를 안 봅니다. 반대로 이 캠페인에 예산이 남았나, 이 사용자에게 이 광고를 이미 보였나는 `bidder` 만 압니다.

Gateway 가 그것까지 물어보게 만들 수는 있습니다. 그러면 홉이 하나 더 붙고, 그 홉은 매체 열 곳의 **모든** 요청에 붙습니다. 위에서 잡은 0.6ms 여유가 거기서 없어집니다.

경계를 표로 못 박으면 이렇습니다.

| | Ingress | API Gateway |
|---|---|---|
| 무엇을 보고 나누나 | 호스트 · 경로 | 호스트 · 경로 + 헤더 · 인증키 · 매체 |
| 정책을 갖나 | 아니요 (규칙표뿐) | 예 — 인증 · 쿼터 · 변환 · 타임아웃 |
| 설정이 바뀌는 이유 | 서비스가 늘거나 줄 때 | 매체가 늘거나 정책이 바뀔 때 |

## 5. 완성된 지도

**네 절에서 하나씩 생긴 칸을 한 줄에 놓으면 순서가 그대로 경계가 됩니다. 왼쪽 칸일수록 요청의 겉만 보고, 오른쪽으로 갈수록 안을 엽니다.**

<figure style="text-align:center; margin:2rem 0;">
<svg viewBox="0 0 500 298" role="img" aria-label="매체에서 시작해 로드밸런서·Ingress·API Gateway를 지나 서비스에 이르는 전체 경로와, 각 부품이 무엇을 보고 나누는지." style="width:100%; max-width:500px; height:auto; font-family:var(--font-sans)">
<defs>
<marker id="gw5-arr" markerWidth="9" markerHeight="9" refX="7.5" refY="3" orient="auto"><path d="M0,0 L7.5,3 L0,6 Z" style="fill:var(--accent-primary)"/></marker>
</defs>
<rect x="6" y="20" width="140" height="52" rx="9" style="fill:var(--bg-secondary); stroke:var(--border-color); stroke-width:1.5"/>
<text x="76" y="42" text-anchor="middle" style="font-size:13px; fill:var(--text-primary)">매체 10곳</text>
<text x="76" y="62" text-anchor="middle" style="font-size:12.5px; fill:var(--text-muted); font-family:var(--font-mono)">ads.example.com</text>
<line x1="76" y1="72" x2="76" y2="90" style="stroke:var(--accent-primary); stroke-width:2" marker-end="url(#gw5-arr)"/>
<rect x="6" y="92" width="140" height="52" rx="9" style="fill:var(--bg-secondary); stroke:var(--border-color); stroke-width:1.5"/>
<text x="76" y="114" text-anchor="middle" style="font-size:13px; fill:var(--text-primary)">로드밸런서</text>
<text x="76" y="134" text-anchor="middle" style="font-size:12.5px; fill:var(--text-muted)">IP · 포트</text>
<line x1="76" y1="144" x2="76" y2="162" style="stroke:var(--accent-primary); stroke-width:2" marker-end="url(#gw5-arr)"/>
<rect x="6" y="164" width="140" height="52" rx="9" style="fill:var(--bg-secondary); stroke:var(--border-color); stroke-width:1.5"/>
<text x="76" y="186" text-anchor="middle" style="font-size:13px; fill:var(--text-primary)">Ingress</text>
<text x="76" y="206" text-anchor="middle" style="font-size:12.5px; fill:var(--text-muted)">호스트 · 경로</text>
<line x1="76" y1="216" x2="76" y2="234" style="stroke:var(--accent-primary); stroke-width:2" marker-end="url(#gw5-arr)"/>
<rect x="6" y="236" width="140" height="52" rx="9" style="fill:var(--bg-secondary); stroke:var(--border-color); stroke-width:1.5"/>
<text x="76" y="258" text-anchor="middle" style="font-size:13px; fill:var(--text-primary)">API Gateway</text>
<text x="76" y="278" text-anchor="middle" style="font-size:12.5px; fill:var(--text-muted)">+ 헤더 · 인증키 · 매체</text>
<rect x="334" y="20" width="160" height="250" rx="10" style="fill:none; stroke:var(--text-muted); stroke-width:1.3; stroke-dasharray:6 4"/>
<text x="414" y="42" text-anchor="middle" style="font-size:12.5px; fill:var(--text-muted)">쪼갠 서비스</text>
<line x1="150" y1="248" x2="330" y2="85" style="stroke:var(--accent-primary); stroke-width:2" marker-end="url(#gw5-arr)"/>
<line x1="150" y1="262" x2="330" y2="185" style="stroke:var(--accent-primary); stroke-width:2" marker-end="url(#gw5-arr)"/>
<line x1="150" y1="276" x2="330" y2="227" style="stroke:var(--accent-primary); stroke-width:2" marker-end="url(#gw5-arr)"/>
<rect x="346" y="54" width="136" height="62" rx="9" style="fill:var(--bg-secondary); stroke:var(--border-color); stroke-width:1.5"/>
<text x="414" y="74" text-anchor="middle" style="font-size:12.5px; fill:var(--text-primary)">bidder</text>
<rect x="354" y="82" width="120" height="26" rx="6" style="fill:var(--bg-tertiary); stroke:var(--border-color); stroke-width:1.5"/>
<text x="414" y="100" text-anchor="middle" style="font-size:12.5px; fill:var(--text-muted)">라우터 · 코드 경로</text>
<rect x="346" y="126" width="136" height="34" rx="9" style="fill:var(--bg-secondary); stroke:var(--border-color); stroke-width:1.5"/>
<text x="414" y="147" text-anchor="middle" style="font-size:12.5px; fill:var(--text-primary)">pctr</text>
<rect x="346" y="168" width="136" height="34" rx="9" style="fill:var(--bg-secondary); stroke:var(--border-color); stroke-width:1.5"/>
<text x="414" y="189" text-anchor="middle" style="font-size:12.5px; fill:var(--text-primary)">feature-store</text>
<rect x="346" y="210" width="136" height="34" rx="9" style="fill:var(--bg-secondary); stroke:var(--border-color); stroke-width:1.5"/>
<text x="414" y="231" text-anchor="middle" style="font-size:12.5px; fill:var(--text-primary)">log-collector</text>
<text x="414" y="262" text-anchor="middle" style="font-size:12.5px; fill:var(--text-muted)">지훈 씨 API 가 여기입니다</text>
</svg>
<figcaption style="margin-top:0.75rem; font-size:0.9rem; color:var(--text-muted)">왼쪽 넷이 이 글에서 하나씩 켜진 부품입니다. 지훈 씨가 만든 클릭 수집 API 는 오른쪽 맨 아래 칸에 있습니다.</figcaption>
</figure>

| 부품 | 어디서 도나 | 무엇을 보고 나누나 | 없으면 사람이 관리할 것 |
|---|---|---|---|
| 로드밸런서 | 클러스터 밖 | IP · 포트 | 매체 설정에 IP 가 서버 수만큼 — 3대면 3줄 |
| Ingress | 클러스터 입구 | 호스트 · 경로 | 대표 주소 4개 · 헬스체크 4벌 |
| API Gateway | 앱 계층 | 경로 + 헤더 · 인증키 · 매체 | 정책 구현 12벌 · 값 하나 고칠 때 배포 4번 |
| 라우터 | 앱 안 | 코드 경로 | 어느 절에서 새로 생긴 것이 아닙니다 |

**마지막 칸이 이 글의 줄거리입니다.** 부품은 기능을 더하려고 들어온 것이 아닙니다. 없을 때 사람이 관리할 것이 몇 벌로 불어나느냐가 먼저였고, 부품은 그 뒤에 왔습니다.

셋째 칸은 아래로 갈수록 조건이 하나씩 붙습니다. 넷이 다 "나눈다"는 같은 말을 쓰는데 보는 것은 전부 다릅니다. **이름만 듣고 헷갈리는 이유가 여기 있습니다.**

넷째 줄만 생긴 순서가 다릅니다. 라우터는 어느 절에서 새로 생긴 것이 아닙니다. 1절의 서버 한 대에도 `POST /v1/bid` 를 함수에 잇는 코드는 있었습니다.

서비스가 열둘쯤으로 더 늘면 다음 부품 이야기가 나옵니다. 서비스끼리 부르는 호출의 재시도와 타임아웃을 코드 밖으로 꺼내는 **서비스 메시**입니다. 다만 그건 이 글 밖입니다. 12ms 를 다투는 입찰 경로에서는 프록시를 한 번 더 지나는 값 자체가 예산을 넘기기 때문에, 넣을지 말지가 먼저 계산 문제가 됩니다.

아래 데모는 이 글을 거꾸로 돌립니다. Ingress 를 끈 채 서비스 수를 1로 내리면 요청이 다시 통과합니다 — 3절이 시작되기 전 자리입니다. 끌 때마다 "사람이 관리해야 하는 것" 칸에 숫자가 붙는데, 그게 위 표의 마지막 열입니다.

<div class="demo-embed-wrap">
<iframe class="demo-embed" src="demo-request-path.html?embed=1" height="560" loading="lazy" title="요청 경로 시뮬레이터"></iframe>
<a class="demo-embed-open" href="demo-request-path.html" target="_blank" rel="noopener">↗ 전체 데모로 열기 (가이드 투어 포함)</a>
</div>

## 한눈 정리

| 질문 | 한 줄 답 |
|---|---|
| 매체에 서버 IP 를 주면 안 되나 | 배포할 때마다 그 시간만큼 요청이 통째로 사라집니다 |
| 로드밸런서는 무엇을 보나 | IP 와 포트만. 어떤 요청인지는 안 엽니다 |
| 헬스체크에 무엇을 넣나 | 나만 빠지면 되는 것은 넣고, 다 같이 쓰는 것은 뺍니다 |
| Ingress 는 무엇을 하나 | 대표 주소를 하나로 되돌리고 호스트·경로로 갈라 보냅니다 |
| 규칙표에서 무엇이 이기나 | 위치가 아니라 길이. 가장 길게 맞는 줄입니다 |
| 라우터가 뭔가 | 문맥마다 다릅니다. 어느 층인지부터 되묻습니다 |
| API Gateway 는 왜 또 필요한가 | 규칙표에 "누가 보냈나"를 적을 칸이 없기 때문입니다 |
| 무엇을 Gateway 에 두나 | 광고 데이터를 안 봐도 정해지는 것만 |

## 헷갈리기 쉬운 점

**"Ingress 랑 API Gateway 랑 같은 것 아닌가."**

아닙니다. 둘 다 경로를 보는 것까지는 같습니다. 3절 규칙표도 `/v1/bid` 를 보고 갈랐고, 4절 Gateway 도 같은 경로를 봅니다. 겹치는 것은 여기까지입니다.

갈리는 곳은 정책입니다. 규칙표에는 그 요청을 누가 보냈는지 적을 칸이 없고, Gateway 에는 인증·쿼터·타임아웃·응답 변환이 설정 항목으로 있습니다. **그래서 바뀌는 이유가 다릅니다** — 규칙표는 서비스가 늘 때, Gateway 는 매체가 늘 때 바뀝니다.

다만 경계가 고정된 것은 아닙니다. 쿠버네티스가 Ingress 다음으로 내놓은 Gateway API 는 헤더 조건을 규격 안에 갖고 있습니다. 4절에서 구현체마다 다르게 밀어 넣던 것이 표준이 된 셈입니다.

**"로드밸런서가 있으면 Ingress 는 필요 없나."**

대부분의 구성에서는 Ingress 앞에도 로드밸런서가 하나 있습니다. 규칙표를 실행하는 프로세스도 여러 개 뜨니, 그 앞에도 대표 주소가 하나 필요하기 때문입니다. 3절에서 로드밸런서는 없어지지 않았고, 그 대상만 `bidder` 서버 3대에서 Ingress 로 바뀌었습니다.

클라우드에서는 이게 잘 안 보입니다. Ingress 를 만들면 로드밸런서가 자동으로 딸려 오는 구성이 흔해서 없는 것처럼 느껴질 뿐인데, **요금 항목에는 남습니다.**

대체가 아니라 덧붙임입니다. 로드밸런서는 IP 와 포트만 보고 연결을 넘기고, Ingress 는 그 연결에 실린 요청을 열어 호스트와 경로를 봅니다. 하는 일이 다르니 한쪽이 다른 쪽을 지우지 못합니다.

**"Gateway 를 넣으면 느려지지 않나."**

느려집니다. 4절에서 인증키와 쿼터를 보는 데 1.1ms 를 잡았고, 12ms 의 9% 입니다. 공짜가 아닙니다.

견줄 대상은 3절 끝의 사고입니다. A앱 한 곳이 초당 3만 건을 쏟는 동안 쿼터를 볼 자리가 없으면 나머지 아홉 곳이 같이 12ms 를 넘깁니다. **모든 요청에 1.1ms 를 얹는 쪽과, 그동안 열 곳이 다 같이 넘기는 쪽 중 하나를 고르는 것입니다.**

그리고 인증과 쿼터를 계속하려면 그 1.1ms 는 없애는 것이 아니라 옮기는 것입니다. `bidder` 안에서 같은 검사를 하면 10ms 상한 안에서 그 시간을 씁니다. 대신 4절에서 센 대로 구현이 12벌이 되고, 값 하나 고치는 데 배포가 네 번입니다.

## 더 깊이 보기

- 이 다음은 [데이터 파이프라인 입문](post.html?id=pipeline-push-and-pull) 편입니다. 지훈 씨 API 가 `log-collector` 에 남긴 그 로그가 어디로 흘러가는지를 따라갑니다.
- 이 글이 Ingress 에서 멈춘 아래쪽, Pod 와 Service 의 주소는 [쿠버네티스 네트워킹](post.html?id=kubernetes-networking) 편에 있습니다.
- 3절에서 서비스를 넷으로 쪼갠 판단은 [소프트웨어 아키텍처 패턴](post.html?id=software-architecture-patterns) 편에서 다룹니다.
- `bidder` 가 시간을 떼어 준 `pctr` 안에서 실제로 벌어지는 일은 [모델 서빙 아키텍처](post.html?id=model-serving-architecture) 편에 있습니다.
- 이 경로로 들어온 입찰 한 건이 로그를 몇 줄 남기는지는 [광고 로그 파이프라인](post.html?id=ad-log-pipeline) 편이 정리해 뒀습니다.
