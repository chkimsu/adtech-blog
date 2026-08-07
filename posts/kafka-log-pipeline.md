광고 하나가 방금 노출됐다. 요청 번호는 `r-8f21`, 광고 번호는 `9931`, 지면은 `A앱` 의 `main_top` 이다. 그리고 이 사실을 알아야 하는 곳이 넷이다 — 학습팀, 정산팀, 대시보드, 광고주 리포트.

넷이 원하는 것은 다 다르다. 학습팀은 이 줄을 pCTR 모델 학습 데이터로 쓴다. 하루에 한 번 몰아서 읽으면 된다. 정산팀은 매체에 줄 돈을 계산한다. 한 건도 빠지면 안 되고 두 번 세도 안 된다. 대시보드는 몇 초 안에 숫자가 올라가야 한다. 광고주 리포트는 몇 분 늦어도 되지만 광고별로 정확히 갈라야 한다.

줄 자체는 이렇게 생겼다.

```json
{"req_id":"r-8f21","ad_id":9931,"slot":"main_top","media":"A앱","pctr":0.0213,"bid":182.4,"ts":1786000101}
```

이 줄의 뼈대를 만드는 것은 `bidder` 다. `pctr` 0.0213 과 `bid` 182.4 는 응찰을 계산한 그 프로세스 안에만 있는 값이라 다른 데서는 만들 수 없다. 노출됐다는 확인만 매체가 `log-collector` 로 따로 보내고, 두 줄은 `req_id` 로 이어 붙는다. 그러니 이 줄이 처음 생기는 자리는 12ms 예산이 걸린 입찰 경로 위다.

이 글의 숫자는 전부 설명을 위해 지어낸 값이다. 실제 트래픽·지연·배포 주기는 회사마다 다르다.

> **한 줄 요약:** Kafka는 한 번 쓰고 여러 팀이 각자 읽는 로그 보관소다. 보내는 쪽과 읽는 쪽을 떼어 놓는 것이 전부다.

> **골라 읽는 법** — 절이 8개인 긴 글입니다. 처음부터 다 읽지 않아도 됩니다.
>
> - Kafka가 왜 필요한지만 → 1절
> - producer가 무엇인지 → 2절
> - partition을 몇 개로 잡을지 → 3절
> - 여러 팀이 같은 로그를 읽는 구조 → 4~5절
> - 로그가 학습 데이터가 되는 부분 → 7절

---

## 1. Kafka 없이 하면 어디서 터지나

**로그를 넷에게 나르는 방법은 Kafka 말고도 셋이 있다. 셋 다 돌아가긴 하는데, 각자 다른 자리에서 줄이 사라진다.**

셋을 차례로 놓고 어디서 끊기는지 센다. 앞으로 나오는 볼륨은 하나로 고정한다. 노출 로그는 하루 2억 2,800만 줄이고, 초로 나누면 초당 2,639건이다. `bidder` 는 12대로 띄워 둔다. 전부 가상 수치다.

### ① `bidder` 가 네 팀 서버를 직접 부른다

가장 먼저 떠오르는 방법이다. 줄이 생기면 그 자리에서 네 곳에 HTTP로 알린다. 새 팀이 생기면 주소를 한 줄 더 넣으면 된다.

문제는 시간이다. 12ms는 매체가 요청을 보내고 답을 받기까지 전부다. 앞단(Ingress·API Gateway)이 1.4ms를 쓰고 `bidder` 의 응찰 계산이 8ms를 쓴다고 하자. 사내망 왕복과 받는 쪽 처리를 합쳐 한 호출을 2ms로 잡는다.

| 이 요청 한 건이 쓰는 시간 | ms |
|---|---|
| 앞단 (Ingress · API Gateway) | 1.4 |
| `bidder` 응찰 계산 | 8.0 |
| 학습팀 서버 호출 | 2.0 |
| 정산팀 서버 호출 | 2.0 |
| 대시보드 서버 호출 | 2.0 |
| 광고주 리포트 서버 호출 | 2.0 |
| **합계** | **17.4** |
| **예산** | **12.0** |

2ms가 과하다고 볼 수도 있다. 한 호출이 0.5ms로 아주 빠르다고 해 보자. 그러면 1.4 + 8.0 + 2.0 = 11.4ms로 겨우 들어간다. 남는 여유가 0.6ms다. 받는 쪽 넷 중 하나만 조금 느려져도 그 여유가 없어진다. 우리 응답 시간이 우리가 관리하지 않는 서버 넷에 매달린다.

응답을 안 기다리면 되지 않느냐고 물을 수 있다. 실제로 그렇게 만든다. 그러면 12ms는 지켜진다. 대신 다른 것이 `bidder` 안으로 들어온다.

학습팀이 배포하는 20초를 생각해 보자. 그동안 그 서버는 아무것도 안 받는다. 노출은 초당 2,639건씩 계속 생긴다. 20초면 52,780줄이다. 이 줄들은 `bidder` 프로세스 메모리에 쌓인다.

여기서 답해야 할 질문이 넷이다.

- 얼마나 쌓을 것인가
- 넘치면 버릴 것인가, 아니면 입찰을 막을 것인가
- 재시도는 몇 번 할 것인가
- 재시도 사이 간격은 얼마인가

그리고 답이 받는 쪽마다 다르다. 정산팀 줄은 한 건도 버리면 안 된다. 대시보드 줄은 버려도 다음 초에 새 숫자가 올라온다. 그러니 이 코드가 네 벌 필요하다.

마지막 문제가 남는다. 이 큐는 `bidder` 프로세스 안에 있다. `bidder` 도 하루 4번 배포한다. 배포할 때 큐에 남아 있던 줄은 같이 내려간다. 받는 쪽이 멈춰 있으면 내려가기 전에 비울 수도 없다.

### ② 파일에 쓰고 나중에 옮긴다

두 번째는 로컬 디스크에 줄을 붙여 쓰는 것이다. 그리고 5분마다 한 번씩 파일을 공용 저장소로 옮긴다. 쓰는 쪽은 빠르다. 디스크에 덧붙이는 것뿐이라 12ms 예산을 거의 안 먹는다. 받는 쪽이 멈춰도 `bidder` 는 아무 영향을 안 받는다.

사라지는 자리는 옮기기 전이다.

초당 2,639줄을 12대가 나눠 받으면 대당 약 220줄이다. 5분은 300초이니 대당 66,000줄이 로컬에 쌓인다. 아직 아무 데도 안 옮겨진 줄이다.

저녁 피크가 끝나면 오토스케일이 12대를 4대로 줄인다. 8대가 내려간다. 내려가는 시점은 옮기는 주기와 아무 상관이 없다. 평균 절반인 33,000줄이 남아 있다고 보면 8대에서 264,000줄이다.

종료 훅에서 마지막으로 한 번 옮기면 되지 않느냐. 정상 종료에는 된다. 디스크가 차거나 커널이 패닉을 내면 훅이 안 돈다. 훅에게 주어지는 시간도 정해져 있고, 그 시간을 넘기면 강제로 종료된다.

파일을 계속 따라 읽는 에이전트를 붙이면 5분이 몇 초로 줄어든다. 맞다. 그래도 에이전트는 그 인스턴스 안에서 돈다. 인스턴스가 사라지면 아직 안 읽은 끝부분도 같이 사라진다.

유실보다 오래 남는 문제가 하나 더 있다. 파일에는 "누가 어디까지 읽었나"가 없다. 학습팀이 지난 3일치를 다시 읽으려면 어느 파일이 어느 시각 것인지를 이름으로 알아내야 한다. 그래서 파일 이름 규칙이 네 팀과의 계약이 된다. 옮기는 쪽이 경로를 한 번 바꾸면 읽는 넷이 다 깨진다.

### ③ DB에 바로 넣는다

세 번째는 줄 하나를 그대로 테이블에 넣는 것이다. 네 팀은 각자 SQL로 가져간다. 유실이 없고 되감아 읽는 것도 SQL 한 줄이다. 앞의 둘보다 확실히 낫다.

깨지는 곳은 인덱스다. 네 팀이 찾는 조건이 다 다르다.

| 읽는 곳 | 어떤 조건으로 찾나 | 필요한 인덱스 |
|---|---|---|
| 학습팀 | 하루치를 통째로 | `ts` |
| 정산팀 | 매체별로 묶어 하루 합계 | `(media, ts)` |
| 대시보드 | 최근 5분을 지면별로 | `(slot, ts)` |
| 광고주 리포트 | 광고별로 기간 합계 | `(ad_id, ts)` |

인덱스가 넷이면 줄 하나를 넣을 때 다섯 군데를 건드린다. 본체 한 곳에 인덱스 네 곳이다. 초당 2,639줄이면 초당 13,195군데다. 저녁 피크에 평균의 3배가 몰린다고 보면 초당 39,585군데가 된다.

숫자만 보면 못 할 것도 없다. 문제는 읽기가 같은 테이블 위에서 돈다는 것이다. 정산팀은 마감에 하루치 2억 2,800만 줄을 통째로 훑는다. 그 스캔이 도는 동안 쓰기 지연이 오른다. 지연이 커넥션 타임아웃을 넘기면 그 순간의 줄은 아예 들어가지 못한다.

집계 테이블을 미리 만들어 두면 그 스캔이 줄어든다. 맞는 말이다. 대신 집계를 돌리는 작업이 새로 생기고, 그 작업이 원본을 읽는 것은 그대로다. 읽는 쪽이 넷에서 다섯이 된 것이다.

그리고 이건 튜닝으로 안 없어진다. 요구가 정면으로 충돌하기 때문이다. 정산팀은 이 테이블을 1년 남기길 원한다. 대시보드는 최근 5분만 빠르면 되는데, 테이블이 커질수록 그 5분 쿼리가 느려진다. 한쪽을 맞추면 다른 쪽이 나빠진다. 한 테이블이 네 팀의 요구를 동시에 만족할 수 없다.

<figure style="text-align:center; margin:2rem 0;">
<svg viewBox="0 0 700 274" role="img" aria-label="Kafka 없이 로그를 나르는 세 방법을 위아래로 나란히 놓은 그림. 세 줄 다 왼쪽의 bidder 에서 출발하지만 각각 다른 지점에서 끊겨, 오른쪽의 학습팀·정산팀·대시보드·광고주 리포트 네 칸에 실선이 하나도 닿지 않는다." style="width:100%; max-width:680px; height:auto; font-family:var(--font-sans)">
<defs>
<marker id="kf1-arr" markerWidth="9" markerHeight="9" refX="7.5" refY="3" orient="auto"><path d="M0,0 L7.5,3 L0,6 Z" style="fill:var(--accent-primary)"/></marker>
</defs>
<rect x="558" y="16" width="136" height="244" rx="10" style="fill:none; stroke:var(--text-muted); stroke-width:1.3; stroke-dasharray:6 4"/>
<text x="626" y="32" text-anchor="middle" style="font-size:11px; fill:var(--text-muted)">이 줄을 읽어야 하는 곳</text>
<rect x="568" y="42" width="116" height="44" rx="9" style="fill:var(--bg-secondary); stroke:var(--border-color); stroke-width:1.5"/>
<text x="626" y="62" text-anchor="middle" style="font-size:12px; fill:var(--text-primary)">학습팀</text>
<text x="626" y="77" text-anchor="middle" style="font-size:9.5px; fill:var(--text-muted)">하루 1회면 된다</text>
<rect x="568" y="94" width="116" height="44" rx="9" style="fill:var(--bg-secondary); stroke:var(--border-color); stroke-width:1.5"/>
<text x="626" y="114" text-anchor="middle" style="font-size:12px; fill:var(--text-primary)">정산팀</text>
<text x="626" y="129" text-anchor="middle" style="font-size:9.5px; fill:var(--text-muted)">한 건도 못 버린다</text>
<rect x="568" y="146" width="116" height="44" rx="9" style="fill:var(--bg-secondary); stroke:var(--border-color); stroke-width:1.5"/>
<text x="626" y="166" text-anchor="middle" style="font-size:12px; fill:var(--text-primary)">대시보드</text>
<text x="626" y="181" text-anchor="middle" style="font-size:9.5px; fill:var(--text-muted)">몇 초 안</text>
<rect x="568" y="198" width="116" height="44" rx="9" style="fill:var(--bg-secondary); stroke:var(--border-color); stroke-width:1.5"/>
<text x="626" y="218" text-anchor="middle" style="font-size:12px; fill:var(--text-primary)">광고주 리포트</text>
<text x="626" y="233" text-anchor="middle" style="font-size:9.5px; fill:var(--text-muted)">몇 분 안</text>
<text x="8" y="34" style="font-size:11px; fill:var(--text-primary)">① 네 팀 서버를 직접 부른다</text>
<rect x="8" y="42" width="84" height="40" rx="9" style="fill:var(--bg-tertiary); stroke:var(--border-color); stroke-width:1.5"/>
<text x="50" y="67" text-anchor="middle" style="font-size:12.5px; fill:var(--text-primary)">bidder</text>
<line x1="92" y1="62" x2="114" y2="62" style="stroke:var(--accent-primary); stroke-width:2" marker-end="url(#kf1-arr)"/>
<rect x="120" y="42" width="150" height="40" rx="9" style="fill:var(--bg-secondary); stroke:var(--accent-primary); stroke-width:2"/>
<text x="195" y="61" text-anchor="middle" style="font-size:12.5px; fill:var(--text-primary)">HTTP 호출 4번</text>
<text x="195" y="75" text-anchor="middle" style="font-size:9.5px; fill:var(--text-muted)">한 번 2ms · 넷이면 8ms</text>
<line x1="270" y1="62" x2="306" y2="62" style="stroke:var(--state-bad); stroke-width:2.4; stroke-dasharray:5 4"/>
<line x1="312" y1="56" x2="324" y2="68" style="stroke:var(--state-bad); stroke-width:2.4"/>
<line x1="324" y1="56" x2="312" y2="68" style="stroke:var(--state-bad); stroke-width:2.4"/>
<line x1="334" y1="62" x2="556" y2="62" style="stroke:var(--text-muted); stroke-width:1; stroke-dasharray:2 5"/>
<text x="440" y="57" text-anchor="middle" style="font-size:9.5px; fill:var(--state-bad)">합계 17.4ms · 예산 12ms 초과</text>
<text x="8" y="120" style="font-size:11px; fill:var(--text-primary)">② 파일에 쓰고 나중에 옮긴다</text>
<rect x="8" y="128" width="84" height="40" rx="9" style="fill:var(--bg-tertiary); stroke:var(--border-color); stroke-width:1.5"/>
<text x="50" y="153" text-anchor="middle" style="font-size:12.5px; fill:var(--text-primary)">bidder</text>
<line x1="92" y1="148" x2="110" y2="148" style="stroke:var(--accent-primary); stroke-width:2" marker-end="url(#kf1-arr)"/>
<rect x="114" y="128" width="170" height="40" rx="9" style="fill:var(--bg-secondary); stroke:var(--accent-primary); stroke-width:2"/>
<text x="199" y="147" text-anchor="middle" style="font-size:12.5px; fill:var(--text-primary)">인스턴스 안 로컬 파일</text>
<text x="199" y="161" text-anchor="middle" style="font-size:9.5px; fill:var(--text-muted)">5분마다 한 번 옮긴다</text>
<line x1="284" y1="148" x2="320" y2="148" style="stroke:var(--state-bad); stroke-width:2.4; stroke-dasharray:5 4"/>
<line x1="326" y1="142" x2="338" y2="154" style="stroke:var(--state-bad); stroke-width:2.4"/>
<line x1="338" y1="142" x2="326" y2="154" style="stroke:var(--state-bad); stroke-width:2.4"/>
<line x1="348" y1="148" x2="556" y2="148" style="stroke:var(--text-muted); stroke-width:1; stroke-dasharray:2 5"/>
<text x="450" y="143" text-anchor="middle" style="font-size:9.5px; fill:var(--state-bad)">8대 축소 · 264,000줄 유실</text>
<text x="8" y="206" style="font-size:11px; fill:var(--text-primary)">③ DB 한 테이블에 바로 넣는다</text>
<rect x="8" y="214" width="84" height="40" rx="9" style="fill:var(--bg-tertiary); stroke:var(--border-color); stroke-width:1.5"/>
<text x="50" y="239" text-anchor="middle" style="font-size:12.5px; fill:var(--text-primary)">bidder</text>
<line x1="92" y1="234" x2="110" y2="234" style="stroke:var(--accent-primary); stroke-width:2" marker-end="url(#kf1-arr)"/>
<rect x="114" y="214" width="200" height="40" rx="9" style="fill:var(--bg-secondary); stroke:var(--accent-primary); stroke-width:2"/>
<text x="214" y="233" text-anchor="middle" style="font-size:12.5px; fill:var(--text-primary)">DB 한 테이블</text>
<text x="214" y="247" text-anchor="middle" style="font-size:9.5px; fill:var(--text-muted)">인덱스 4개 · 초당 13,195군데</text>
<line x1="314" y1="234" x2="350" y2="234" style="stroke:var(--state-bad); stroke-width:2.4; stroke-dasharray:5 4"/>
<line x1="356" y1="228" x2="368" y2="240" style="stroke:var(--state-bad); stroke-width:2.4"/>
<line x1="368" y1="228" x2="356" y2="240" style="stroke:var(--state-bad); stroke-width:2.4"/>
<line x1="378" y1="234" x2="556" y2="234" style="stroke:var(--text-muted); stroke-width:1; stroke-dasharray:2 5"/>
<text x="467" y="229" text-anchor="middle" style="font-size:9.5px; fill:var(--state-bad)">마감 스캔 중 쓰기 실패</text>
</svg>
<figcaption style="margin-top:0.75rem; font-size:0.9rem; color:var(--text-muted)">굵은 실선은 실제로 도는 길, 가는 점선은 가야 하는데 못 가는 길이다. 방법을 셋 다 바꿔 봐도 맨 왼쪽 bidder 칸과 맨 오른쪽 네 칸은 그대로다.</figcaption>
</figure>

세 방법을 한 표에 놓으면 이렇다.

| 방법 | 어디서 줄이 사라지나 | 한 번에 얼마나 |
|---|---|---|
| ① 직접 HTTP | 예산 초과 · 받는 쪽이 멈춰 있는 동안 | 학습팀 배포 20초당 52,780줄 |
| ② 파일 + 옮기기 | 옮기기 전에 인스턴스가 내려갈 때 | 8대 축소 1회당 264,000줄 |
| ③ DB 직행 | 무거운 읽기가 도는 동안 쓰기가 밀려서 | 마감 스캔이 도는 시간만큼 |

셋은 끊기는 자리가 다른데 원인은 하나다. **보내는 쪽이 받는 쪽 사정을 알아야 한다는 것이다.**

①은 받는 쪽 넷의 주소와 상태와 재시도 정책을 `bidder` 가 들고 있다. ②는 파일 이름과 옮기는 주기를 양쪽이 맞춰 놓아야 한다. ③은 인덱스와 보관 기간을 네 팀이 합의해야 한다. 받는 쪽이 하나 늘 때마다 보내는 쪽이 따라 바뀐다.

### 이미 셋 중 하나를 쓰고 있다면

지금 돌아가는 파이프라인이 위 셋 중 하나라면, 먼저 볼 곳이 정해져 있다. 세 가지 다 그래프나 대시보드에는 잘 안 잡히는 자리다.

| 지금 쓰는 방식 | 가장 먼저 확인할 것 |
|---|---|
| 직접 HTTP | 받는 쪽이 30초 없을 때 보내는 쪽이 무엇을 하는지 코드에서 찾는다. 버리나, 쌓나, 기다리나 |
| 파일 + 옮기기 | 인스턴스가 내려가는 순간 안 옮긴 줄이 몇 분치인지 잰다. 그 몇 분치는 대개 어디에도 안 세어진다 |
| DB 직행 | 가장 무거운 읽기 쿼리가 도는 시간대의 쓰기 지연을 같은 그래프에 겹쳐 본다 |

셋 다 "평소에는 멀쩡한데 특정 순간에만 사라진다"는 공통점이 있다. 그래서 평균값 그래프로는 안 보인다. 배포 시각, 축소 시각, 마감 시각에 맞춰서 봐야 보인다.

그러면 답은 무엇인가. 새 저장소를 하나 더 사는 것이 아니다. 보내는 쪽과 받는 쪽 **사이에 놓을 자리** 하나가 필요하다. 보내는 쪽은 그 자리에만 쓰고, 받는 쪽은 그 자리에서만 읽는다. 서로를 모르게 하는 것이다. Kafka가 하는 일이 정확히 이것이다.

그러면 보내는 쪽 코드는 어떻게 생겼나. 12ms 예산 안에서 무엇을 하고 무엇을 안 하나. 그게 2절이다.

---

## 2. producer — 보내는 쪽

**producer 는 별도 서버가 아니다. `bidder` 프로세스 안의 라이브러리다. 보내는 코드가 12ms 예산 위에서 돈다.**

Kafka 를 쓴다고 "로그 서버"가 새로 뜨는 게 아니다. `bidder` 의존성에 라이브러리 한 줄이 늘고, 프로세스 안에 producer 객체가 생긴다.

1절의 그 줄을 그대로 보낸다.

```json
{"req_id":"r-8f21","ad_id":9931,"slot":"main_top","media":"A앱","pctr":0.0213,"bid":182.4,"ts":1786000101}
```

`bidder` 가 응찰 직후 만든다. 이렇게 넘긴다.

```python
# (의사코드 — 브로커가 있어야 돌아갑니다. 호출 모양만 봅니다.)
producer.send(
    topic="ad.impression",
    key=req_id.encode(),          # 이 값으로 어느 칸에 들어갈지 정해진다 (3절)
    value=json.dumps(record).encode(),
)
# send()는 기다리지 않는다. 버퍼에 넣고 바로 돌아온다.
# 실제 전송은 백그라운드 스레드가 배치로 묶어 보낸다.
```

인자 셋에 받는 쪽 주소가 없다. 학습팀도 정산팀도 이 코드에 안 나오고, 읽는 팀이 다섯이 돼도 그대로다. **`bidder` 는 이제 누가 읽는지 모른다.** 1절 ①이 들고 있던 네 팀의 주소·상태·재시도 정책이 사라졌다. 브로커 주소는 알아도 읽는 쪽 때문에 바뀌진 않는다.

### `send()` 가 안 기다린다

1절 ①은 네 팀을 부르느라 8.0ms 를 더 써서 합계 17.4ms, 예산 12ms 를 넘겼다. `send()` 는 그 자리에 네트워크 왕복을 안 놓는다. 직렬화와 메모리 복사만 남아 합계 9.4ms, 여유 2.6ms 다.

1절 ①도 응답을 안 기다리면 12ms 는 지켜졌다. 대신 큐가 `bidder` 안으로 들어왔고, 얼마나 쌓을지·넘치면 어쩔지·재시도는 몇 번일지를 받는 쪽마다 정해야 했다. producer 는 답이 한 벌이다.

기다리는 건 버퍼가 꽉 찼을 때뿐이다. 동작은 클라이언트마다 다르다 — 자바 클라이언트는 `max.block.ms` 만큼 기다렸다 예외를 던진다. 기본값 60초는 지어낸 값이 아니고, 12ms 위에서는 멈춘 것과 같다.

### `acks` — 무엇을 성공으로 칠까

`send()` 가 돌아왔다고 브로커가 받은 건 아니다. 어디까지 기다릴지가 `acks` 다.

| `acks` | 언제 성공으로 치나 | 유실 | 지연 |
|---|---|---|---|
| `0` | 보냈으면 끝 | 브로커가 죽으면 사라진다 | 가장 짧다 |
| `1` | 리더가 받았으면 | 리더가 죽고 복제 전이면 사라진다 | 중간 |
| `all` | 복제본까지 받았으면 | 거의 없다 | 가장 길다 |

지연 열은 `send()` 가 아니라 백그라운드 전송 시간이다. 입찰 경로는 어느 줄이든 9.4ms 다.

관행은 노출·클릭에 `1`, 정산·전환에 `all` 이다. 법이 아니라 판단이고 근거는 잃으면 무엇을 잃느냐다. 2억 2,800만 줄에서 몇 줄 빠져도 pCTR 은 그대로지만 정산은 매체에 줄 돈이 틀린다.

그런데 우리 `ad.impression` 은 `1` 로 두면 안 된다. 이 토픽을 정산팀이 읽기 때문이다(1절). **한 토픽을 여러 팀이 읽으면 `acks` 는 가장 엄한 읽는 쪽에 맞춘다.**

`all` 의 "거의 없다"에도 조건이 붙는다. 따라잡은 복제본(ISR)이 리더 하나로 줄면 `all` 이 `1` 과 같아지니 `min.insync.replicas` 를 2 이상으로 둔다. 중복은 `acks` 밖의 일이라 `enable.idempotence` 몫이다.

버퍼에 남은 줄은 `bidder` 가 죽으면 브로커에 닿은 적이 없다. `flush` 로 비우고 내려가되, 1절 ②처럼 정상 종료에만 된다.

**우리 `ad.impression` 의 답은 `acks=all`, `min.insync.replicas=2`, 종료 시 `flush` 다.**

남은 것은 코드에서 지나친 `key` 다. 초당 2,639건이 들어오는데 읽는 쪽이 하나면 못 따라간다. 나눠 읽으려면 토픽 안이 갈라져 있어야 하고 `key` 가 어디로 갈지를 정한다. 칸을 몇 개로 잡을지가 3절이다.
