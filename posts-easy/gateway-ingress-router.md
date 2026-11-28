셋째 주에 지훈 씨가 만든 클릭 수집 API(클릭 기록을 요청으로 받는 서버 기능)가 배포됐습니다. 지훈 씨는 매체(광고를 내보낼 자리를 가진 앱이나 웹 같은 서비스)에 이 API 의 주소를 알려 주려고 서버 IP(네트워크에서 서버 한 대를 가리키는 주소)에 포트(그 서버에서 요청을 받을 프로그램을 정하는 번호)를 붙인 `10.0.3.14:8080` 을 메일에 적었는데, 메일을 보내기 전에 선배가 붙잡았습니다. **"그 주소를 주면 다음 배포 때 매체 요청이 전부 날아갑니다."**

선배가 대신 알려 준 주소는 IP 도 포트도 없는 이름 `ads.example.com` 이었습니다. 매체가 이 이름으로 보낸 요청은 지훈 씨 서버에 닿기 전에 로드밸런서, Ingress, API Gateway 라는 부품 3개를 차례로 지납니다. 서버에 닿은 뒤에는 서버 코드 안의 라우터가 그 요청을 처리할 함수를 고릅니다.

**부품 3개와 라우터, 이 4가지가 모두 "요청을 어디로 보낼지 정하는" 일을 합니다. 그런데 왜 4가지일까요?**

4가지는 처음부터 한꺼번에 설계되지 않았습니다. 서비스가 늘 때마다 구체적인 사고가 하나씩 났고 부품은 그 사고를 막으려고 하나씩 생겼으므로, 이 글은 서버 한 대에서 출발해 부품이 생긴 순서를 따라갑니다. 생긴 순서대로 보면 4가지가 각각 어디까지 맡는지, 다시 말해 4가지 사이의 경계가 저절로 보입니다.

> **한 줄 요약:** 매체의 요청이 우리 서버에 닿기 전에 지나는 로드밸런서, Ingress, API Gateway 는 한꺼번에 설계되지 않았습니다. 서비스가 늘 때마다 생긴 문제에 하나씩 답하며 생긴 부품이라, 생긴 순서가 그대로 부품 사이의 경계가 됩니다. 요청을 나눌 때 로드밸런서는 요청이 들어온 IP 와 포트만 봅니다. Ingress 는 요청이 부른 이름과 `/v1/bid` 같은 경로까지 살핍니다. API Gateway 는 그 요청을 어느 매체가 보냈는지까지 확인합니다.

> **골라 읽는 법** — 절이 5개입니다.
>
> - 부품이 생긴 까닭을 생긴 순서대로 → 1~4절
> - "라우터" 라는 말이 문맥마다 무엇을 뜻하는지 → 3절 뒷부분
> - Ingress 와 API Gateway 가 맡는 일의 경계 → 4절
> - 4가지를 표 하나로 비교 → 5절

이 글의 숫자는 모두 설명을 위해 지어낸 값이지만 설정 파일의 **모양**은 nginx 와 쿠버네티스(여러 서버에 서비스를 띄우고 관리하는 플랫폼), Gateway 제품이 실제로 쓰는 형식 그대로입니다. 이 글이 따라가는 요청도 지훈 씨의 클릭 수집 요청이 아니라 같은 길을 지나는 요청 가운데 답할 시간이 가장 짧은 **입찰 요청**(매체가 광고 자리 하나에 우리 광고를 낼지 묻는 요청)입니다. 입찰 요청은 12ms(ms 는 1,000분의 1초) 안에 답해야 하므로 부품 하나를 지날 때 드는 시간 비용이 가장 뚜렷하게 보입니다.

---

## 1. 서버 한 대 — 매체 설정에 적힌 서버 IP

**중간에 부품이 하나도 없으면 매체가 우리 서버의 IP 를 직접 알고 부릅니다. 그래서 서버가 잠깐만 멈춰도 멈춘 시간 동안 들어온 요청이 전부 사라집니다.**

선배가 붙잡지 않아 그 메일이 그대로 나갔다면, 매체는 우리 서버를 부르는 연동 설정 파일에 그 주소를 적습니다. 매체 쪽 설정이 실제로 어떤 모양이 되는지 먼저 보겠습니다.

```yaml
# 매체 서버의 DSP 연동 설정
bidders:
  - name: our-dsp
    endpoint: http://10.0.3.14:8080/v1/bid
    timeout_ms: 12
```

설정 맨 위 주석의 DSP 는 광고주 쪽에서 광고 자리를 사려고 입찰하는 플랫폼으로, 이 글에서는 `our-dsp` 라는 이름으로 등록된 우리 회사입니다. `endpoint` 줄의 `10.0.3.14` 는 입찰 요청에 답을 만드는 우리 `bidder` 서버의 IP 입니다. 매체는 이 주소 하나로만 초당 3,000건씩 요청을 보내는데 `timeout_ms: 12` 대로 답을 12ms 까지만 기다리므로, 12ms 를 넘긴 답은 받지 않은 것과 같아 그 건은 없던 일이 됩니다.

매체 서버와 우리 서버는 같은 데이터센터 안에서 전용 회선(두 회사의 서버만 쓰는 네트워크 선)으로 연결되어 있고 그 사이에 거치는 장비도 없습니다. 그래서 매체가 사설 IP(인터넷에는 공개되지 않고 내부망 안에서만 통하는 주소)를 그대로 부를 수 있고 12ms 라는 짧은 응답 시간 예산(매체가 요청을 보내고 답을 받기까지 허용하는 시간)도 성립합니다.

**이 구조의 문제는 배포 때 나타납니다.** 배포는 새 버전의 코드를 서버에 올려 실행하는 일인데, 새 버전을 올리려면 지금 돌고 있는 `bidder` 프로세스(실행 중인 프로그램)를 내리고 새 프로세스를 띄워야 합니다. 그 사이에는 `10.0.3.14:8080` 에서 요청을 기다리는 프로그램이 없으므로 매체가 이때 보낸 요청은 늦게라도 답을 받는 것이 아니라 **연결 자체를 거부**당합니다. 12ms 예산 안에서는 매체가 다시 시도할 시간도 없습니다.

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
<figcaption style="margin-top:0.75rem; font-size:0.9rem; color:var(--text-muted)">매체에서 bidder 로 가는 실선은 하나뿐이라, 그 선이 끊기면 매체 쪽에는 대신 부를 곳이 없습니다.</figcaption>
</figure>

멈춘 동안 사라지는 요청이 얼마나 되는지 이 글의 값으로 세어 보겠습니다. 하루에 배포를 4번 하고 한 번 배포할 때마다 프로세스가 떠 있지 않은 시간이 20초이며 이 매체가 초당 3,000건을 보낸다면, 4번 × 20초 × 초당 3,000건으로 **하루 24만 건**이 사라집니다.

이 24만 건은 우리가 응찰(입찰 요청에 답을 보내 입찰에 참여하는 일)조차 하지 못한 요청이라 매출로도 잡히지 않습니다. 그 순간에는 로그를 남길 `bidder` 프로세스가 떠 있지 않으므로 이 요청들은 **우리 쪽 에러 로그에도 남지 않고** 매체 리포트에만 우리가 "응답률이 낮은 DSP" 로 조용히 기록됩니다. 서버에 닿지 못해 서버 로그에 한 줄도 남지 않은 요청이 여기서도 똑같이 생기는데, 앞 글 9절에서 본 "서버 로그에 아예 없는 요청" 이 바로 이런 요청입니다.

배포를 조심해서 하면 되지 않느냐고 물을 수 있습니다. 하지만 배포를 아예 멈춰도 서버는 죽습니다. 디스크가 가득 차거나, 커널(운영체제의 중심 프로그램)이 복구할 수 없는 오류로 멈추는 패닉을 내거나, 서버 앞단의 네트워크 스위치가 재시작하는 일은 배포와 상관없이 일어납니다. 매체 설정 파일에는 주소가 하나만 적혀 있으므로 **서버가 이렇게 죽으면 매체에는 대신 부를 주소가 없습니다.** 그래서 이 문제는 서버를 여러 대로 늘려야만 풀립니다.

## 2. 서버 3대와 로드밸런서

**서버를 3대로 늘리면 한 대가 죽어도 서비스는 계속 돌아갑니다. 그 대신 매체가 3대 가운데 어느 주소를 불러야 하느냐는 문제가 새로 생깁니다.**

`bidder` 를 `10.0.3.14`, `10.0.3.15`, `10.0.3.16` 의 서버 3대에 띄웠다고 하겠습니다. 이제 배포는 한 대씩 차례로 하면 되는데, 한 대를 내리는 동안 나머지 2대가 요청을 받으므로 1절에서 하루 24만 건을 잃게 만들던 배포 중의 20초가 없어집니다.

대신 배포하는 동안에는 남은 2대가 3대 몫을 나눠 받습니다. 매체가 보내는 초당 3,000건을 평소에는 3대가 1,000건씩 받지만 한 대가 빠진 동안에는 2대가 1,500건씩 받아야 하므로, **서버 대수 3대는 평소가 아니라 배포 중인 이 순간을 기준으로 정합니다.** 평소 부하에 딱 맞춰 대수를 정하면 배포할 때마다 남은 서버가 받는 몫이 늘어 응답 지연이 갑자기 커집니다.

그런데 매체 쪽에서 보면 곤란한 일이 생깁니다. 매체 설정 파일에 IP 3개를 모두 적어야 할까요? `10.0.3.15` 가 죽으면 매체 담당자에게 연락해 그 줄을 빼 달라고 해야 할까요? 서버를 5대로 늘릴 때마다 매체 수십 곳에 같은 부탁을 되풀이해야 할까요? **그렇게 하면 서버가 몇 대인지, 어느 서버가 살아 있는지 같은 우리 쪽 사정을 매체가 대신 관리하게 됩니다.**

이 일을 매체 대신 맡는 부품이 **로드밸런서(load balancer, LB)** 입니다. 로드밸런서는 대표 주소 하나로 요청을 받아 뒤에 등록된 서버 가운데 하나로 넘겨 줍니다. 로드밸런서가 요청을 넘길 수 있게 등록한 서버를 대상(target), 대상을 모아 둔 목록을 대상 그룹(target group)이라고 부르는데, 여기서는 `bidder` 서버 3대를 대상으로 등록합니다. 이제 매체 설정에는 로드밸런서의 대표 주소 `10.0.9.7` 하나만 적힙니다. 그 뒤에 서버가 3대 있든 12대 있든 매체는 알 필요가 없습니다.

로드밸런서가 실제로 하는 일은 2가지입니다. 하나는 들어온 연결을 대상 가운데 하나에 넘기는 일이고 다른 하나는 **살아 있는 대상만 고르는 일**입니다. 살아 있는 대상만 고르려면 대상의 상태를 계속 알고 있어야 하므로, 로드밸런서는 대상마다 정해진 경로(서버 주소 뒤에 붙는 `/healthz` 같은 부분)로 주기적으로 요청을 보내 답이 오는지 확인합니다. 이 확인을 헬스체크(health check)라고 합니다.

헬스체크는 아래 표의 5가지 값으로 설정합니다. 표에 나오는 낱말 가운데 `GET` 은 서버에서 값을 읽어 오는 요청, 200 은 HTTP 에서 요청이 성공했다는 응답 코드, 타임아웃은 검사 요청 하나의 답을 기다리는 시간의 상한을 뜻합니다.

| 설정 | 값 | 뜻 |
|---|---|---|
| 검사 경로 | `GET /healthz` | 200 이 오면 살아 있는 것으로 봅니다 |
| 검사 주기 | 5초 | 5초마다 한 번씩 물어봅니다 |
| 타임아웃 | 2초 | 2초 안에 답이 없으면 그 회차는 실패 |
| 제외 조건 | 연속 2회 실패 | 죽은 뒤 최대 12초에 대상에서 빠집니다 |
| 복귀 조건 | 연속 2회 성공 | 고쳐진 뒤 최대 10초에 다시 받습니다 |

**5가지 값 가운데 실제로 고민해서 정하는 값은 제외 조건 하나뿐입니다.** 1번 실패만으로 바로 빼면 네트워크가 한 번 잠깐 불안정했을 뿐인데도 멀쩡한 서버가 대상에서 빠집니다. 반대로 5번 연속 실패를 기다리면 이미 죽은 서버에 약 27초 동안 요청이 계속 들어가고 그 27초 동안 들어간 요청은 모두 실패합니다. 27초는 5초 간격의 검사 5번에 마지막 검사의 타임아웃 2초를 더한 시간입니다.

2번은 그 두 경우 사이에서 고른 값입니다. 가장 늦게 빠지는 경우를 이 표의 값으로 따라가 보면, 서버가 검사를 통과한 직후에 죽었을 때 5초 뒤의 첫 검사와 다시 5초 뒤의 둘째 검사가 연달아 실패해야 하고 둘째 검사의 실패는 타임아웃 2초를 다 기다린 뒤에 확정되므로 최악의 경우 5 + 5 + 2 = 12초 만에 대상에서 빠집니다. 복귀 조건의 최대 10초도 같은 방식으로 5초 간격의 검사가 2번 연속 성공하기까지 걸리는 시간입니다.

로드밸런서 없이 DNS 만 쓰면 되지 않느냐는 물음에도 이 12초로 답할 수 있습니다. DNS 는 `ads.example.com` 같은 이름을 IP 로 바꿔 주는 시스템이라, 이름 하나에 IP 3개를 등록해 두면 매체가 부를 대표 주소는 이름 하나가 됩니다. 그런데 매체 서버는 이름을 IP 로 바꾼 결과를 캐시(한 번 받은 결과를 한동안 저장해 두고 다시 쓰는 곳)에 두고 쓰기 때문에 죽은 IP 가 그 캐시에서 빠지기까지 시간이 걸리는 데다, 캐시에 둘 시간을 정해 두어도 매체 서버가 그 시간을 지킨다는 보장이 없습니다. **그래서 죽은 서버를 12초 안에 빼는 일은 DNS 로는 할 수 없습니다.**

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
<text x="76" y="180" text-anchor="middle" style="font-size:12.5px; fill:var(--text-muted)">IP, 포트만 봅니다</text>
<text x="76" y="212" text-anchor="middle" style="font-size:12.5px; fill:var(--text-muted); font-family:var(--font-mono)">GET /healthz, 5초</text>
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
<figcaption style="margin-top:0.75rem; font-size:0.9rem; color:var(--text-muted)">로드밸런서가 들어오면서 어느 서버가 살아 있는지 아는 쪽이 매체에서 우리 쪽으로 넘어왔습니다. 대상에서 빠진 서버에도 헬스체크는 계속 보내는데, 그래야 고쳐진 서버가 연속 2회 성공으로 대상에 다시 돌아올 수 있습니다.</figcaption>
</figure>

### `/healthz` 가 200 을 답하는 조건

헬스체크에서는 검사 주기와 함께 `/healthz` 가 무엇을 확인한 뒤 200 을 답할지도 정해야 합니다. 가장 흔한 구현은 프로세스가 떠 있기만 하면 200 을 답하는 방식인데, 이렇게 하면 `bidder` 프로세스는 떠 있지만 모델 저장소(모델 파일을 보관하는 곳)를 읽지 못하는 상태를 잡지 못합니다. 그런 서버는 헬스체크를 계속 통과하므로 대상에 남아 요청을 받으면서 계속 빈 응답을 냅니다.

반대로 `/healthz` 안에서 `bidder` 가 의존하는 것을 전부 확인하면 다른 사고가 납니다. 3대가 함께 쓰는 모델 저장소가 3초만 불안정해도 3대가 동시에 실패를 답하므로 한꺼번에 대상에서 빠져 대상 그룹에 한 대도 남지 않습니다.

**`/healthz` 가 확인할 것과 확인하지 않을 것의 선은 아래 기준으로 긋습니다.** 그 서버 하나만 대상에서 빠지면 해결되는 문제는 `/healthz` 에서 확인합니다. 모델 파일을 읽어 들였는지(적재 여부), 요청을 처리할 스레드를 미리 만들어 둔 스레드풀이 모두 사용 중이라 바닥났는지(고갈), 로컬 디스크에 문제가 없는지가 여기에 듭니다. 반대로 공용 저장소나 공용 DB 처럼 모든 서버가 함께 쓰는 것이 죽으면 남은 서버도 똑같이 일을 못 해서 문제가 생긴 서버를 대상에서 빼 봐야 요청을 대신 보낼 곳이 없으므로, 공용 저장소와 공용 DB 는 `/healthz` 에서 확인하지 않습니다.

배포할 때도 이 대상 그룹을 그대로 씁니다. 새 버전을 올릴 서버가 먼저 대상 그룹에서 스스로 빠진 다음 프로세스를 새 버전으로 바꾸고 대상 그룹에 다시 등록해 돌아왔다고 알리면, 1절에서 하루 24만 건을 버리게 만들던 20초가 대부분 사라집니다.

하지만 손실이 전부 사라지지는 않습니다. 로드밸런서는 요청 하나하나가 아니라 **연결 단위**로 대상을 고르는데, 서버를 대상에서 뺀다는 말은 그 서버로 새 연결을 더 보내지 않는다는 뜻이지 이미 맺어진 연결을 다른 서버로 옮긴다는 뜻이 아닙니다. 매체는 12ms 예산 때문에 한 번 맺은 연결을 끊지 않고 계속 열어 둔 채 여러 요청에 씁니다. 그래서 `bidder` 앱이 종료할 때 남아 있는 연결을 스스로 닫아 줘야 매체가 다음 요청을 새 연결로 보내고 로드밸런서가 그 새 연결을 대상 그룹에 남은 서버로 넘기므로, 그때 비로소 손실이 0이 됩니다. 이 단계를 빠뜨리면 대상에서 빼는 순서를 아무리 잘 정해도 **배포 때마다 요청 몇백 건이 새어 나갑니다.**

서버를 뺄 때 조심할 점이 하나 더 있습니다. 배포할 서버를 빼려고 `/healthz` 가 일부러 실패를 답하게 만드는 방법을 쓰기도 하는데, 로드밸런서 제품에 따라서는 이렇게 하면 **이미 처리 중이던 요청까지 끊깁니다.** 헬스체크 실패는 서버가 정말 죽었을 때 빨리 대상에서 빼라고 있는 장치이지 멀쩡한 서버를 뺄 때 쓰는 방법이 아니므로, 서버를 뺄 때는 대상 그룹에서 명시적으로 빼는 방법을 씁니다.

### 요청을 열어 보지 않는 로드밸런서의 한계

지금의 로드밸런서는 연결이 어느 IP 와 포트로 들어왔는지만 봅니다. 연결이 들어오면 대상 하나를 골라 그대로 넘길 뿐 그 연결에 어떤 요청이 담겨 왔는지는 열어 보지 않습니다.

우리가 매체에 열어 준 주소는 2개입니다. `POST /v1/bid` 는 12ms 안에 답해야 하는 입찰 요청을 받습니다. `POST /v1/track` 은 노출(광고가 화면에 보인 일)과 클릭을 기록하는 요청이라 답하는 데 100ms 가 걸려도 됩니다. 두 주소에서 앞부분 `POST` 는 요청이 서버에 시키는 일의 종류인 메서드, 뒷부분 `/v1/bid` 와 `/v1/track` 은 경로입니다. **그런데 이 로드밸런서에게는 두 요청이 모두 그저 "8080 포트로 들어온 연결" 입니다.**

두 요청을 구분하지 못하면 사고가 납니다. 서버가 요청 하나를 처리하는 동안 차지하는 자리를 처리 슬롯이라고 하는데, 슬롯은 서버가 동시에 처리할 수 있는 요청 수만큼만 있습니다. `/v1/track` 요청 하나가 100ms 를 쓰는 동안에는 그 서버의 처리 슬롯 하나가 그 요청에 잡혀 있으므로, 트래킹 요청이 몰리는 시간대에는 `/v1/bid` 가 빈 슬롯을 잡지 못해 12ms 를 넘깁니다. **느린 요청이 빠른 요청까지 늦추는 사고입니다.**

8080 은 입찰, 8081 은 트래킹처럼 포트를 나누면 되지 않느냐고 물을 수도 있습니다. 하지만 그러려면 매체에 설정을 다시 고쳐 달라고 부탁해야 하고 서비스가 12개가 되면 포트도 12개가 되므로, 로드밸런서로 벗어났던 처지, 그러니까 우리 쪽 사정을 매체가 대신 관리하는 처지로 되돌아갑니다.

그래서 다음 부품이 필요한지는 한 가지 기준으로 판단합니다. **같은 포트로 들어오는 요청 가운데 응답 시간 예산이 다른 요청이 섞여 있으면, 요청을 열어 경로를 보는 부품이 필요합니다.** 그 부품이 3절의 Ingress 입니다.

## 3. 서비스 4개와 Ingress

**서비스를 4개로 나누고 서비스마다 앞에 로드밸런서를 두면 대표 주소도 4개가 됩니다. Ingress 는 대표 주소를 다시 하나로 줄이는 대신 요청을 열어 경로를 보고 알맞은 서비스로 나눠 보냅니다.**

지금까지 `bidder` 프로세스 하나에는 입찰 응답 만들기, pCTR(광고가 클릭될 확률을 모델로 예측한 값) 예측, 피처(모델에 넣는 입력값) 조회, 노출과 클릭 기록의 4가지 일이 함께 들어 있었습니다. pCTR 모델만 하루 세 번 새로 올리고 싶어도 그때마다 입찰 프로세스까지 같이 내려야 했으므로, 이 4가지 일을 `bidder`, `pctr`, `feature-store`, `log-collector` 의 서비스 4개로 나눴습니다.

서비스마다 로드밸런서를 하나씩 두면 2절에서 한 일을 서비스 수만큼 4번 되풀이해야 합니다. 대표 주소가 4개, 대상 그룹과 헬스체크 설정이 4벌, 로드밸런서 월 비용이 4배가 되며 매체가 알아야 할 주소도 `/v1/bid` 를 받는 `bidder` 와 `/v1/track` 을 받는 `log-collector` 의 2개로 늘어납니다.

**Ingress** 는 쿠버네티스에서 클러스터(쿠버네티스가 서비스들을 띄워 관리하는 서버 여러 대의 단위) 바깥에서 들어온 요청을 어느 서비스로 보낼지 적어 둔 규칙표로, 서비스마다 로드밸런서를 두는 대신 이 규칙표 하나를 둡니다. Ingress 를 두면 매체가 부르는 주소는 다시 하나로 돌아갑니다. 그 주소 뒤에서 Ingress 가 요청을 열어 보고 서비스 4개 가운데 알맞은 곳으로 나눠 보냅니다. 2절의 로드밸런서는 없어지지 않고 대표 주소를 그대로 맡습니다. 로드밸런서의 대상만 `bidder` 서버 3대에서 Ingress 로 바뀝니다. **이제 `/v1/track` 요청은 `log-collector` 로 따로 가므로 `bidder` 의 입찰 처리 슬롯을 더 이상 차지하지 않습니다.** 2절에서 입찰 요청이 12ms 를 넘기게 만들던 원인이 여기서 사라집니다.

그 대신 매체 설정을 한 번 더 고쳐야 합니다. Ingress 는 요청 헤더(요청에 함께 담아 보내는 이름과 값의 쌍)에 담긴 호스트 이름, 곧 요청이 부른 `ads.example.com` 같은 이름을 보고 규칙을 고르기 때문에 매체가 IP 대신 이름으로 불러야 합니다. 그래서 매체 설정의 `10.0.9.7` 을 `ads.example.com` 으로 바꾸고 사내 DNS 에는 이 이름이 같은 IP 인 `10.0.9.7` 을 가리키도록 등록합니다. 서비스는 앞으로도 늘겠지만 매체가 부르는 이름은 `ads.example.com` 하나로 끝나므로, **매체에 설정을 고쳐 달라는 부탁은 이번이 마지막입니다.** 도입에서 선배가 지훈 씨에게 알려 준 주소가 바로 이 이름입니다.

<figure style="text-align:center; margin:2rem 0;">
<svg viewBox="0 0 500 332" role="img" aria-label="매체가 이름 하나로 로드밸런서를 부르고, 그 뒤에 놓인 Ingress가 쪼갠 서비스 넷 중 셋으로 요청을 나눠 보내는 구조. pctr 칸에는 화살표가 닿지 않는다." style="width:100%; max-width:500px; height:auto; font-family:var(--font-sans)">
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
<figcaption style="margin-top:0.75rem; font-size:0.9rem; color:var(--text-muted)">이번 절에서 새로 생긴 칸은 Ingress 하나입니다. 로드밸런서는 2절에서 하던 일을 그대로 합니다. pctr 은 매체가 아니라 bidder 가 부르는 서비스라 Ingress 에서 나온 화살표가 닿지 않습니다.</figcaption>
</figure>

Ingress 규칙표가 실제로 어떻게 생겼는지 아래 설정으로 보겠습니다. 호스트마다 경로가 한 줄씩 있고 화살표 오른쪽에 그 경로의 요청을 받을 서비스가 적혀 있습니다.

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

설정을 보면 서비스는 4개인데 `ads.example.com` 아래 줄은 3개뿐입니다. **규칙표는 클러스터 바깥에서 들어오는 요청만 다루는데** `pctr` 은 매체가 아니라 클러스터 안의 `bidder` 가 부르는 서비스라 규칙표에 없습니다. 호스트가 `admin.example.com` 인 요청은 경로가 무엇이든 `/` 줄에 맞아 `admin-service` 로 갑니다. 맨 아래 주석대로 맞는 줄이 하나도 없는 요청은 404(요청한 주소를 찾을 수 없다는 HTTP 응답 코드)를 받습니다.

**요청 하나에 맞는 줄이 여러 개면 규칙표에서 위에 적힌 줄이 아니라 경로가 가장 길게 맞는 줄이 이깁니다.** 그래서 짧은 경로를 새로 추가할 때는 그 경로 아래로 어떤 요청이 딸려 들어오는지부터 세어 봐야 합니다.

규칙표 맨 위 주석에 적힌 `pathType` 은 경로를 맞추는 방식입니다. `Prefix` 면 `/v1/bid` 아래의 경로까지 함께 잡고 `Exact` 면 정확히 그 경로 하나만 잡는데, `Prefix` 도 글자 단위가 아니라 `/` 로 끊은 조각 단위로 비교하므로 `/v1/bid` 줄은 `/v1/bid/test` 는 잡지만 `/v1/bidder` 는 잡지 않습니다.

언젠가는 `/v1` 아래의 요청을 전부 한 서비스로 보내는 규칙을 하나 넣는 날이 옵니다. `/v1/bid` 요청은 더 길게 맞는 `/v1/bid` 줄이 규칙표 어디에 적혀 있든 이기므로 새 규칙에 뺏기지 않습니다. 그 대신 지금까지 맞는 줄이 없어 404 를 받던 `/v1` 아래의 요청은 `/v1/report` 든 `/v1/status` 든 모두 새 규칙으로 들어갑니다. 오타로 들어온 `/v1/bidd` 도 `/` 로 끊은 조각 `bidd` 가 `bid` 와 달라 `/v1/bid` 줄에 잡히지 않으므로 새 규칙으로 갑니다. **그래도 설정 문법에는 오류가 없고 배포도 성공하며 헬스체크도 모두 정상을 뜻하는 초록입니다.**

그래서 규칙을 하나 추가할 때는 "이 줄이 무엇을 뺏나" 보다 **"이 줄 아래로 무엇이 딸려 들어오나"** 를 물어야 합니다. 경로가 짧을수록 딸려 들어오는 요청의 목록이 길어지는데, 그 목록이 길면 그 규칙은 넣지 않는 편이 낫습니다.

### "라우터"라는 말의 3가지 뜻

지금까지 말한 Ingress 는 규칙표, 곧 파일에 적어 둔 설정입니다. 그 표를 읽어 실제로 요청을 넘기는 일은 따로 도는 프로세스가 합니다. 이 프로세스를 흔히 "라우터" 라고 부르는데, **"라우터" 라는 말은 문맥마다 가리키는 것이 달라서 대화하는 사람끼리 서로 다른 것을 떠올리는 일이 자주 생깁니다.**

| 어디서 쓰는 말인가 | 무엇을 가리키나 | 실제 이름 |
|---|---|---|
| 쿠버네티스 | 규칙표를 실제로 실행하는 프로세스 | Ingress Controller (nginx, traefik) |
| OpenShift | 규칙표에 해당하는 자체 리소스 | `Route` 오브젝트 |
| 앱 코드 안 | 들어온 경로를 함수에 연결하는 것 | `@app.route("/v1/bid")` |

표의 3가지는 모두 경로를 보고 요청을 어디로 보낼지 정한다는 점에서 하는 일이 같고 **어느 층에서 도느냐**만 다릅니다. 그렇다고 3가지가 각각 다른 층에 있지는 않습니다. 1, 2행은 같은 층에서 플랫폼만 다릅니다. 쿠버네티스를 쓰면 1행, OpenShift(쿠버네티스를 바탕으로 만든 플랫폼)를 쓰면 2행이므로 요청 하나가 1행과 2행을 함께 지나가지 않습니다. 앱 코드 안의 3행만 다른 층입니다.

그래서 `POST /v1/bid` 요청 한 건은 두 층을 지납니다. 바깥 층에서는 Ingress Controller 가 규칙표대로 `bidder-service` 를 고릅니다. 안쪽 층에서는 `bidder` 코드에서 `@app.route("/v1/bid")` 로 그 경로에 연결해 둔 함수가 실행됩니다. 두 층은 고치는 사람도 배포 주기도 다르므로, **회의에서 "라우터에서 막힌 것 같다" 는 말을 들으면 어느 층의 라우터인지부터 되물어야 합니다.**

시간이 지나 매체가 10곳으로 늘었는데, 그 가운데 한 곳이 설정을 잘못 올려 초당 3,000건이 아니라 30,000건을 보내기 시작합니다. Ingress 규칙표는 호스트와 경로밖에 보지 않아 요청이 어느 매체에서 왔는지조차 모르므로 이런 요청을 막을 칸이 없습니다. 그 칸을 가진 부품이 4절의 API Gateway 입니다.

## 4. 매체 10곳과 API Gateway

**Ingress 규칙표에는 요청을 누가 보냈는지 적을 칸이 없습니다. 매체마다 다르게 처리해야 하는 일이 쌓이면 그 칸을 가진 API Gateway 가 Ingress 뒤에 하나 더 생깁니다.**

매체 10곳은 조건이 모두 다릅니다. 아래 표의 인증 방식은 요청을 보낸 매체가 자기가 누구인지 증명하는 방법입니다. API 키는 미리 나눠 준 고정 문자열을 요청에 넣어 보내는 방식, 서명은 요청 내용과 비밀키로 계산한 값을 요청에 붙이는 방식, 토큰은 발급자가 기한을 정해 내준 인증 문자열을 넣어 보내는 방식입니다. 초당 허용은 그 매체가 1초에 보낼 수 있게 허용한 요청 수, 쓰는 버전은 그 매체가 쓰는 API 버전입니다.

| 매체 | 인증 방식 | 초당 허용 | 쓰는 버전 |
|---|---|---|---|
| A앱 | API 키 | 3,000 | v2 |
| B웹 | 서명 | 8,000 | v2 |
| C제휴 | API 키 | 500 | v1 |
| D앱 | 토큰 | 1,200 | v1 |
| E웹 | API 키 | 4,500 | v2 |
| 나머지 5곳 (합계) | — | 12,800 | — |

표의 초당 허용을 이름이 적힌 5곳과 나머지 5곳의 합계까지 모두 더하면 3,000 + 8,000 + 500 + 1,200 + 4,500 + 12,800 = 30,000 으로 초당 3만 건입니다. 3절 끝에서 설정을 잘못 올린 매체는 A앱으로, A앱 한 곳이 자기 허용량 3,000건이 아니라 **10곳 전체의 허용량을 더한 값과 맞먹는 30,000건**을 보내기 시작했습니다. 그러면 A앱만 느려지는 데서 그치지 않고 나머지 9곳도 함께 느려집니다. **우리 서버가 초당 3만 건을 감당하는 일과 매체 한 곳이 혼자 3만 건을 보내는 일을 막는 일은 서로 다른 문제입니다.**

매체별 조건이 담긴 이 표를 Ingress 규칙표로 옮길 방법은 없습니다. 규칙표에는 호스트와 경로를 적는 칸뿐이라 아래 4가지가 모두 안 됩니다.

- **매체별 인증키 확인** — 규칙표는 요청을 어느 매체가 보냈는지 모르므로 매체마다 받은 인증키가 맞는지 확인할 수 없습니다.
- **초당 호출 제한** — 매체를 구분하지 못하므로 C제휴의 초당 500건과 B웹의 초당 8,000건 같은 한도를 매체마다 따로 걸 수 없습니다.
- **v1, v2 분기** — 매체가 쓰는 버전은 `x-api-version` 헤더에 담겨 오는데 규칙표는 헤더를 보지 않으므로 버전에 따라 요청을 나누지 못합니다.
- **응답 형식 변환** — v1 을 쓰는 매체는 응답에서 옛 필드 이름(응답에 담긴 값마다 붙은 이름)을 기대하지만 `bidder` 는 v2 형식의 응답만 만듭니다. 규칙표에는 응답을 바꿔 줄 칸도 없습니다.

**API Gateway** 는 Ingress 뒤에 놓여 이 4가지를 맡는 부품입니다. Ingress 규칙표와 비교하면 칸이 2가지 더 있습니다. 하나는 요청을 어느 라우트(어떤 요청을 어느 서비스로 보낼지 적은 규칙 하나)로 보낼지 정할 때 헤더까지 보는 조건입니다. 다른 하나는 인증, 호출 제한, 타임아웃처럼 요청마다 적용하는 규칙인 정책(policy)입니다. 아래 설정에서는 `match` 줄에 헤더 조건이, `common` 과 `policies` 아래에 정책이 있습니다.

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

설정을 위에서부터 읽어 보면, 모든 요청은 주석대로 먼저 `common` 의 정책 3가지를 지납니다. `auth` 는 `x-media-key` 헤더에 담긴 API 키를 확인하도록 적혀 있습니다. `ratelimit` 은 매체(`media_id`)마다 따로 세어 위 표의 초당 허용 값까지만 요청을 받습니다. `timeout` 은 `bidder` 의 답을 10ms 까지만 기다립니다. 그다음 `x-api-version` 헤더에 `"1"` 을 담아 보낸 요청은 `bid-v1` 라우트로 가는데, 이 라우트는 요청을 `bidder-service` 에 넘긴 뒤 `bidder` 가 만든 v2 형식의 응답을 `v2_to_v1` 변환으로 옛 필드 이름으로 되돌려 줍니다. 버전 헤더가 없는 요청은 기본값인 `bid-v2` 라우트로 가서 v2 형식의 응답을 그대로 받습니다.

버전은 `/v2/bid` 같은 경로를 새로 만들어 나눌 수도 있지만 그러면 v2 를 쓰는 매체 모두에 주소를 고쳐 달라고 부탁해야 합니다. 3절에서 매체에 설정을 고쳐 달라는 부탁은 그때가 마지막이라고 했으므로, **경로는 `/v1/bid` 그대로 두고 옛 버전 v1 을 쓰는 매체만 헤더로 버전을 알리게 합니다.**

이번에도 매체가 부르는 주소는 그대로입니다. A앱은 요청에 `x-media-key` 헤더 한 줄만 새로 넣는데, 매체 쪽 일이 한 줄 늘기는 했어도 지금까지의 주소 변경과는 성격이 다릅니다. 주소는 서버 대수나 서비스 구성처럼 우리 안쪽이 바뀔 때마다 따라 바뀌었지만 **인증키는 A앱이 A앱인 한 바뀌지 않습니다.**

12ms 는 매체가 요청을 보내고 답을 받기까지 걸리는 시간 전체이고 그 안에서 요청이 Ingress 를 지나는 데 0.3ms, Gateway 가 인증키와 쿼터(매체마다 정한 초당 허용 요청 수)를 확인하는 데 1.1ms 가 들므로, `timeout` 에 12 를 적고 싶어도 12 로 적으면 이미 늦습니다. 그래서 `bidder` 의 답을 기다리는 시간은 10ms 로 정합니다. 12ms 에서 Ingress 의 0.3ms, Gateway 의 1.1ms, `bidder` 를 기다리는 10ms 를 차례로 빼면 0.6ms 가 남는데, 이 0.6ms 가 여유분입니다.

### 서비스마다 따로 구현한 정책의 비용

Gateway 없이 서비스 4개가 인증, 쿼터, 타임아웃의 정책 3가지를 각자 구현하면 무엇이 몇 개로 늘어나는지 세어 보겠습니다.

| | 서비스마다 각자 | Gateway 한 곳 |
|---|---|---|
| 구현 벌수 | 12벌 (서비스 4 × 정책 3) | 3벌 |
| 정책 하나 고칠 때 배포 | 4번 | 1번 |
| 넷이 애초에 같게 구현돼 있을 확률 | **72.9%** | 100% |

표의 첫 줄은 서비스 4개가 정책 3가지를 각자 구현하므로 4 × 3 = 12벌인 데 비해 Gateway 한 곳에 두면 정책마다 한 벌씩 3벌입니다. 둘째 줄은 정책 하나를 고칠 때 그 정책을 구현한 서비스 4개를 모두 다시 배포해야 해서 4번입니다. 셋째 줄의 72.9% 는 한 곳이 정확히 같게 구현될 확률을 0.9 로 두고 0.9 를 3번 곱한 값(0.9 × 0.9 × 0.9)입니다. 100% 에서 72.9% 를 뺀 **나머지 27.1% 의 경우에는 구현이 서로 다른데도 사고가 날 때까지 아무 표시가 나지 않습니다.** 정책 하나를 고칠 때 배포 4번 가운데 하나만 늦어도 그동안은 서비스마다 다른 쿼터가 걸립니다.

그러면 어떤 검사를 Gateway 에 두고 어떤 검사를 서비스에 남길지 정해야 합니다. **우리 광고 데이터를 보지 않아도 판단할 수 있으면 Gateway 에, 광고 데이터를 봐야 판단할 수 있으면 서비스에 둡니다.** 인증키가 맞는지, 이 매체가 이번 1초 동안 몇 건을 보냈는지, 요청의 버전이 무엇인지는 모두 광고 데이터를 보지 않고 판단합니다. 반대로 이 캠페인(광고주가 예산을 정해 집행하는 광고 단위)에 예산이 남았는지, 이 사용자에게 이 광고를 이미 보여 주었는지는 `bidder` 만 압니다.

Gateway 가 캠페인 예산이나 이미 보여 준 광고까지 확인하게 만들 수는 있습니다. 하지만 그러면 요청이 거쳐 가는 단계인 홉(hop)이 하나 더 생기는데, 그 홉은 매체 10곳이 보내는 **모든** 요청에 붙으므로 앞에서 남겨 둔 여유 0.6ms 가 그 홉에서 없어집니다.

Ingress 와 API Gateway 가 맡는 일의 경계를 표로 나란히 놓으면 아래와 같습니다.

| | Ingress | API Gateway |
|---|---|---|
| 무엇을 보고 나누나 | 호스트, 경로 | 호스트, 경로 + 헤더, 인증키, 매체 |
| 정책을 갖나 | 아니요 (규칙표뿐) | 예 — 인증, 쿼터, 변환, 타임아웃 |
| 설정이 바뀌는 이유 | 서비스가 늘거나 줄 때 | 매체가 늘거나 정책이 바뀔 때 |

## 5. 매체에서 서비스까지 이어진 전체 경로

**1~4절을 거치며 하나씩 생긴 칸을 요청이 지나는 순서대로 한 줄에 놓으면 생긴 순서가 그대로 부품 사이의 경계가 됩니다. 요청이 먼저 지나는 칸일수록 요청의 겉(IP 와 포트)만 보는 반면 뒤에 있는 칸일수록 요청 안(경로, 헤더, 인증키)을 열어 봅니다.**

<figure style="text-align:center; margin:2rem 0;">
<svg viewBox="0 0 500 298" role="img" aria-label="매체에서 시작해 로드밸런서, Ingress, API Gateway를 지나 서비스에 이르는 전체 경로와, 각 부품이 무엇을 보고 나누는지." style="width:100%; max-width:500px; height:auto; font-family:var(--font-sans)">
<defs>
<marker id="gw5-arr" markerWidth="9" markerHeight="9" refX="7.5" refY="3" orient="auto"><path d="M0,0 L7.5,3 L0,6 Z" style="fill:var(--accent-primary)"/></marker>
</defs>
<rect x="6" y="20" width="140" height="52" rx="9" style="fill:var(--bg-secondary); stroke:var(--border-color); stroke-width:1.5"/>
<text x="76" y="42" text-anchor="middle" style="font-size:13px; fill:var(--text-primary)">매체 10곳</text>
<text x="76" y="62" text-anchor="middle" style="font-size:12.5px; fill:var(--text-muted); font-family:var(--font-mono)">ads.example.com</text>
<line x1="76" y1="72" x2="76" y2="90" style="stroke:var(--accent-primary); stroke-width:2" marker-end="url(#gw5-arr)"/>
<rect x="6" y="92" width="140" height="52" rx="9" style="fill:var(--bg-secondary); stroke:var(--border-color); stroke-width:1.5"/>
<text x="76" y="114" text-anchor="middle" style="font-size:13px; fill:var(--text-primary)">로드밸런서</text>
<text x="76" y="134" text-anchor="middle" style="font-size:12.5px; fill:var(--text-muted)">IP, 포트</text>
<line x1="76" y1="144" x2="76" y2="162" style="stroke:var(--accent-primary); stroke-width:2" marker-end="url(#gw5-arr)"/>
<rect x="6" y="164" width="140" height="52" rx="9" style="fill:var(--bg-secondary); stroke:var(--border-color); stroke-width:1.5"/>
<text x="76" y="186" text-anchor="middle" style="font-size:13px; fill:var(--text-primary)">Ingress</text>
<text x="76" y="206" text-anchor="middle" style="font-size:12.5px; fill:var(--text-muted)">호스트, 경로</text>
<line x1="76" y1="216" x2="76" y2="234" style="stroke:var(--accent-primary); stroke-width:2" marker-end="url(#gw5-arr)"/>
<rect x="6" y="236" width="140" height="52" rx="9" style="fill:var(--bg-secondary); stroke:var(--border-color); stroke-width:1.5"/>
<text x="76" y="258" text-anchor="middle" style="font-size:13px; fill:var(--text-primary)">API Gateway</text>
<text x="76" y="278" text-anchor="middle" style="font-size:12.5px; fill:var(--text-muted)">+ 헤더, 인증키, 매체</text>
<rect x="334" y="20" width="160" height="250" rx="10" style="fill:none; stroke:var(--text-muted); stroke-width:1.3; stroke-dasharray:6 4"/>
<text x="414" y="42" text-anchor="middle" style="font-size:12.5px; fill:var(--text-muted)">쪼갠 서비스</text>
<line x1="150" y1="248" x2="330" y2="85" style="stroke:var(--accent-primary); stroke-width:2" marker-end="url(#gw5-arr)"/>
<line x1="150" y1="262" x2="330" y2="185" style="stroke:var(--accent-primary); stroke-width:2" marker-end="url(#gw5-arr)"/>
<line x1="150" y1="276" x2="330" y2="227" style="stroke:var(--accent-primary); stroke-width:2" marker-end="url(#gw5-arr)"/>
<rect x="346" y="54" width="136" height="62" rx="9" style="fill:var(--bg-secondary); stroke:var(--border-color); stroke-width:1.5"/>
<text x="414" y="74" text-anchor="middle" style="font-size:12.5px; fill:var(--text-primary)">bidder</text>
<rect x="354" y="82" width="120" height="26" rx="6" style="fill:var(--bg-tertiary); stroke:var(--border-color); stroke-width:1.5"/>
<text x="414" y="100" text-anchor="middle" style="font-size:12.5px; fill:var(--text-muted)">라우터, 코드 경로</text>
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

그림의 부품을 어디서 도는지, 무엇을 보고 나누는지, 없으면 사람이 무엇을 관리해야 하는지로 비교하면 아래 표와 같습니다.

| 부품 | 어디서 도나 | 무엇을 보고 나누나 | 없으면 사람이 관리할 것 |
|---|---|---|---|
| 로드밸런서 | 클러스터 밖 | IP, 포트 | 매체 설정에 IP 가 서버 수만큼 — 3대면 3줄 |
| Ingress | 클러스터 입구 | 호스트, 경로 | 대표 주소 4개, 헬스체크 4벌 |
| API Gateway | 앱 계층 | 경로 + 헤더, 인증키, 매체 | 정책 구현 12벌, 값 하나 고칠 때 배포 4번 |
| 라우터 | 앱 안 | 코드 경로 | 어느 절에서 새로 생긴 것이 아닙니다 |

**표의 마지막 열 「없으면 사람이 관리할 것」이 이 글의 줄거리입니다.** 부품은 기능을 늘리려고 들어오지 않았습니다. 부품이 없을 때 사람이 관리할 것이 몇 벌로 늘어나느냐는 문제가 먼저 생긴 다음에 부품이 들어왔습니다. 예를 들어 로드밸런서가 없으면 서버 3대일 때 매체 설정에 IP 가 3줄 적힙니다. API Gateway 가 없으면 정책 구현이 12벌이 되어 값 하나를 고칠 때마다 배포를 4번 합니다.

셋째 열 「무엇을 보고 나누나」는 아래 줄로 갈수록 조건이 하나씩 붙습니다. 로드밸런서는 IP 와 포트, Ingress 는 호스트와 경로, API Gateway 는 경로에 헤더와 인증키와 매체까지 봅니다. 4가지 모두 요청을 "나눈다" 는 같은 말로 설명하지만 나눌 때 보는 것은 전부 다르므로, **이름만 들어서는 헷갈리기 쉽습니다.**

넷째 줄의 라우터만 생긴 순서가 다른데, 라우터는 어느 절에서 새로 생기지 않았고 1절의 서버 한 대에도 `POST /v1/bid` 요청을 처리할 함수에 연결하는 코드가 이미 있었습니다.

서비스가 12개쯤으로 더 늘면 다음 부품인 **서비스 메시** 이야기가 나옵니다. 서비스 메시는 서비스끼리 서로 부르는 호출의 재시도와 타임아웃을 각 서비스의 코드 밖으로 꺼내 처리하는 부품인데, 이 글에서는 다루지 않습니다. 12ms 를 다투는 입찰 경로에서는 요청이 프록시(요청을 대신 받아 넘겨 주는 중간 프로그램)를 한 번 더 지나는 시간만으로도 예산을 넘기므로, 서비스 메시는 넣을지 말지부터 계산으로 따져야 합니다.

아래 데모는 이 글의 순서를 거꾸로 따라가며 부품을 하나씩 꺼 봅니다. Ingress 를 끈 채 서비스 수를 1로 내리면 3절이 시작되기 전처럼 요청이 다시 통과합니다. 부품을 하나 끌 때마다 「사람이 관리해야 하는 것」 칸에 숫자가 붙는데, 그 숫자가 위 표의 마지막 열입니다. 데모에서는 부품을 끄고 켤 때 이 칸의 숫자가 어떻게 바뀌는지 보면 됩니다.

<div class="demo-embed-wrap">
<iframe class="demo-embed" src="demo-request-path.html?embed=1" height="560" loading="lazy" title="요청 경로 시뮬레이터"></iframe>
<a class="demo-embed-open" href="demo-request-path.html" target="_blank" rel="noopener">↗ 전체 데모로 열기 (가이드 투어 포함)</a>
</div>

## 한눈 정리

| 질문 | 한 줄 답 |
|---|---|
| 매체에 서버 IP 를 주면 안 되나 | 배포할 때마다 그 시간만큼 요청이 전부 사라집니다 |
| 로드밸런서는 무엇을 보나 | IP 와 포트만 봅니다. 어떤 요청인지는 열어 보지 않습니다 |
| 헬스체크에 무엇을 넣나 | 그 서버만 빠지면 해결되는 것은 넣고 모든 서버가 함께 쓰는 것은 뺍니다 |
| Ingress 는 무엇을 하나 | 대표 주소를 하나로 되돌리고 호스트와 경로로 요청을 나눠 보냅니다 |
| 규칙표에서 어느 줄이 이기나 | 위치가 아니라 길이로 정합니다. 경로가 가장 길게 맞는 줄입니다 |
| 라우터는 무엇인가 | 문맥마다 다릅니다. 어느 층의 라우터인지부터 되묻습니다 |
| API Gateway 는 왜 또 필요한가 | 규칙표에는 "누가 보냈나"를 적을 칸이 없습니다 |
| 무엇을 Gateway 에 두나 | 광고 데이터를 보지 않아도 정해지는 검사만 둡니다 |

## 헷갈리기 쉬운 점

**"Ingress 랑 API Gateway 랑 같은 것 아닌가."**

같지 않습니다. 둘 다 요청의 경로를 보는 데까지는 같습니다. 3절 규칙표도 `/v1/bid` 라는 경로를 보고 요청을 나눴고 4절 Gateway 설정의 `match` 에도 같은 경로가 있지만 두 부품이 겹치는 부분은 거기까지입니다.

두 부품이 다른 곳은 정책입니다. 규칙표에는 요청을 누가 보냈는지 적을 칸이 없지만 Gateway 에는 인증, 쿼터, 타임아웃, 응답 변환이 설정 항목으로 있습니다. **그래서 두 설정은 바뀌는 계기도 다릅니다.** 규칙표는 서비스가 늘 때 바뀌고 Gateway 설정은 매체가 늘 때 바뀝니다.

다만 이 경계는 고정되어 있지 않습니다. 쿠버네티스가 Ingress 다음 규격으로 내놓은 Gateway API 는 헤더 조건을 규격 안에 포함하고 있어서 4절의 헤더 조건처럼 구현체(규격을 실제로 구현한 제품)마다 제각각 넣던 기능이 표준이 되었습니다.

**"로드밸런서가 있으면 Ingress 는 필요 없나."**

규칙표를 실행하는 Ingress Controller 프로세스도 여러 개가 떠서 그 앞에도 대표 주소가 하나 필요하므로, 대부분의 구성에서는 Ingress 앞에도 로드밸런서가 하나 있습니다. 3절에서도 로드밸런서는 없어지지 않았고 요청을 넘기는 대상만 `bidder` 서버 3대에서 Ingress 로 바뀌었습니다.

클라우드에서는 이 로드밸런서가 잘 보이지 않습니다. Ingress 를 만들면 로드밸런서가 자동으로 함께 만들어지는 구성이 흔해서 로드밸런서가 없는 것처럼 느껴질 뿐 **요금 항목에는 로드밸런서가 그대로 남습니다.**

Ingress 는 로드밸런서를 대신하지 않고 그 뒤에 추가되는 부품입니다. 로드밸런서는 IP 와 포트만 보고 연결을 넘기는 반면 Ingress 는 그 연결에 담긴 요청을 열어 호스트와 경로를 보므로, 하는 일이 달라 어느 한쪽이 다른 쪽을 없애지 못합니다.

**"Gateway 를 넣으면 느려지지 않나."**

느려집니다. 4절에서 Gateway 가 인증키와 쿼터를 확인하는 데 1.1ms 를 잡았는데, 1.1ms 는 매체가 기다리는 12ms 의 9% 라서 공짜가 아닙니다.

이 1.1ms 는 3절 끝의 사고와 비교해야 합니다. A앱 한 곳이 초당 3만 건을 보내는 동안 쿼터를 확인할 자리가 없으면 나머지 9곳도 함께 12ms 를 넘깁니다. **그래서 Gateway 를 넣을지는 모든 요청에 1.1ms 를 더할지, 그런 사고가 나는 동안 10곳이 모두 12ms 를 넘기게 둘지 가운데 하나를 고르는 문제입니다.**

또 인증과 쿼터 확인을 계속하는 한 그 1.1ms 는 없앨 수 없고 다른 곳으로 옮길 수 있을 뿐입니다. Gateway 없이 `bidder` 안에서 같은 검사를 하면 `bidder` 의 10ms 상한 안에서 그 시간을 씁니다. 그 대신 4절에서 센 대로 정책 구현이 12벌로 늘고 값 하나를 고칠 때마다 배포를 4번 해야 합니다.

## 더 깊이 보기

- 이 다음은 [데이터 파이프라인 입문](post.html?id=pipeline-push-and-pull) 편입니다. 지훈 씨 API 가 `log-collector` 에 남긴 그 로그가 어디로 흘러가는지를 따라갑니다.
- 이 글이 Ingress 에서 멈춘 아래쪽, Pod 와 Service 의 주소는 [쿠버네티스 네트워킹](post.html?id=kubernetes-networking) 편에 있습니다.
- 3절에서 서비스를 넷으로 쪼갠 판단은 [소프트웨어 아키텍처 패턴](post.html?id=software-architecture-patterns) 편에서 다룹니다.
- `bidder` 가 시간을 떼어 준 `pctr` 안에서 실제로 벌어지는 일은 [모델 서빙 아키텍처](post.html?id=model-serving-architecture) 편에 있습니다.
- 이 경로로 들어온 입찰 한 건이 로그를 몇 줄 남기는지는 [광고 로그 파이프라인](post.html?id=ad-log-pipeline) 편이 정리해 뒀습니다.
- 여기서 쪼갠 12ms 를 실제로 지키는지 측정하고 대시보드로 읽는 법은 [지연, 처리량과 Grafana 읽는 법](post.html?id=serving-latency-throughput) 편에 있습니다.
