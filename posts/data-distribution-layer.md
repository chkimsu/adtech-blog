수민이 어제 설정 파일에 블록 열두 줄을 더했다. 그것으로 하루 ₩3,200,000짜리 캠페인의 이상 신고를 운영자가 검색으로 찾게 됐다. 처리 잡은 한 줄도 안 고쳤고, 배포 승인은 반나절 만에 났다.

옆 팀은 똑같은 요청을 두 주째 붙들고 있다. 그쪽은 처리 잡 다섯 개가 각자 목적지에 직접 쓰고 있어서, 잡을 전부 열어 고치고 승인을 다섯 번 받아야 한다. 배포마다 그 잡이 중단되니 그동안 뒤가 밀린다.

**왜 한쪽은 설정 한 블록이고 다른 쪽은 처리 잡 다섯 개일까?**

차이는 하나다. 처리와 목적지 사이에 층이 있느냐다. 결과를 목적지마다 갈라 보내는 그 자리를 **유통 계층**, 곧 나눠 보내는 층이라고 부른다. 잡은 한 곳에만 쓰고, 어디로 보낼지는 그 층의 설정 파일이 결정한다.

> **한 줄 요약:** 나눠 보내는 층을 두면 연결이 곱셈에서 덧셈으로 바뀐다. 처리 잡 다섯과 목적지 여섯이면 연결 30개가 11개가 되고, 목적지를 하나 더 붙일 때 손대는 잡이 5개에서 0개가 된다.

> **무대 표시** — 배지의 **열린 RTB** 는 남의 거래소에 입찰만 넣는 자리, **닫힌 생태계** 는 우리가 경매를 직접 돌리는 자리, **공통** 은 둘 다입니다.
> 이 글은 **무관** 입니다. 이 층은 [Kafka 앞뒤를 통째로](post.html?id=data-pipeline-design)가 세운 여섯 층 중 넷째 층이고, 볼륨과 비용 숫자는 설명을 위해 지어낸 값입니다.

---

## 1. 목적지가 여섯이다

**같은 노출 로그가 여섯 곳으로 간다. 포맷도 쓰기 방식도 재시도도 다르고, 그 다름이 그대로 유지 비용이 된다.**

형제 글 1절이 소비자 넷의 마감을 적었고, 그 넷이 실제 저장소 이름을 갖는 자리가 여기다.

| 목적지 | 무엇을 위해 | 포맷 | 쓰기 방식 | 재시도 |
|---|---|---|---|---|
| 스토리지 + Iceberg | 학습·정산 원천 | Parquet | 파티션 덮어쓰기 | 5회 · 2초 |
| ClickHouse | 실시간 대시보드 | RowBinary | 멱등 upsert | 3회 · 0.2초 |
| OpenSearch | 운영자 검색 | JSON | 문서 id 색인 | 3회 · 1초 |
| 리포트용 DB | 광고주 리포트 | 행 | 배치 insert | 5회 · 2초 |
| 다른 팀 Kafka | 이상 탐지 팀 | Avro | topic 에 append | 무한 |
| 피처 스토어 | 서빙 피처 | 키-값 | 키 덮어쓰기 | 3회 · 0.5초 |

셋째 열부터가 요점이다. **포맷이 여섯 다 다르고, 쓰기 방식도 재시도도 다르다.** 이 다름을 처리 잡이 떠안으면 잡마다 여섯 벌의 쓰기 코드가 생기고, 그만큼 배포 승인이 늘어난다.

낯선 말 셋만 풀어 둔다. **파티션**은 큰 테이블을 날짜 같은 기준으로 미리 잘라 둔 조각이고, 그 조각째 다시 쓰는 것이 파티션 단위 덮어쓰기다. **멱등 upsert** 는 같은 키가 오면 덮어쓰는 쓰기라 두 번 보내도 결과가 한 번과 같다. **Avro** 는 필드 이름과 타입을 따로 적어 두는 포맷이다.

재시도 열도 마감이 결정한 값이다. 대시보드는 2초 안에 못 쓰면 포기하고, 다른 팀 Kafka 는 마감이 없어 될 때까지 재시도한다.

여기까지가 목적지 쪽 절반이다. 나머지 절반은 처리 잡이 하나가 아니라는 것이다. 정제, 노출과 클릭 붙이기, 5분 집계, 시간 집계, 이상 탐지로 다섯이다. 다음 절이 그 곱셈의 비용을 센다.

---

## 2. 곱셈이 덧셈이 된다

**연결이 30개에서 11개로 준다. 그리고 목적지를 하나 더 붙일 때 손대는 처리 잡이 5개와 0개로 갈린다.**

층이 없으면 잡마다 목적지마다 쓰기 코드를 들고, 층을 두면 잡은 topic 한 곳에만 쓴다. 연결 하나에 넷씩 결정해야 하니 설정 자리는 연결 수의 네 배다.

```python
# 나눠 보내는 층을 두면 연결이 몇 개로 줄어드나.
#
# 잡이 목적지마다 쓰기 코드를 들면 연결은 잡 x 목적지, 층을 두면 잡 + 목적지다.
# 연결마다 정할 것이 넷이라 설정 자리는 연결의 4배다. 규모는 지어낸 값이다.

JOBS, DESTS, RULES = 5, 6, 4

def flat(j, d):   return j * d       # 유통 계층 없음 — 잡마다 목적지마다 쓰기 코드
def hub(j, d):    return j + d       # 유통 계층 있음 — 잡은 topic 에, 커넥터가 목적지로

a, b = flat(JOBS, DESTS), hub(JOBS, DESTS)
print(f"처리 잡 {JOBS}개 · 목적지 {DESTS}개")
print(f"  없음: {JOBS} x {DESTS} = {a}개 연결 · 설정 자리 {a * RULES}개")
print(f"  있음: {JOBS} + {DESTS} = {b}개 연결 · 설정 자리 {b * RULES}개")
print(f"  연결 {(1 - b / a):.0%} 감소 · 설정 자리 {a * RULES - b * RULES}개 감소")
print()

print(f"목적지가 늘 때 (잡 {JOBS}개 고정)")
print(" 목적지   없음   있음   차이   없음 설정   있음 설정")
for d in range(2, 9):
    x, y = flat(JOBS, d), hub(JOBS, d)
    print(f"{d:6}{x:7}{y:7}{x - y:7}{x * RULES:9}{y * RULES:9}")
print()

print(f"잡이 늘 때 (목적지 {DESTS}개 고정)")
print("    잡   없음   있음   차이")
for j in range(2, 9):
    x, y = flat(j, DESTS), hub(j, DESTS)
    print(f"{j:6}{x:7}{y:7}{x - y:7}")
print()
print(f"목적지를 하나 더 붙일 때 손대는 처리 잡: 없음 {JOBS}개 · 있음 0개")
print("→ 없음 쪽은 곱셈이라 한 축만 늘어도 전체가 늘어난다.")
print("→ 있음 쪽은 덧셈이다. 새 목적지는 커넥터 하나로 끝난다.")

# 출력:
# 처리 잡 5개 · 목적지 6개
#   없음: 5 x 6 = 30개 연결 · 설정 자리 120개
#   있음: 5 + 6 = 11개 연결 · 설정 자리 44개
#   연결 63% 감소 · 설정 자리 76개 감소
#
# 목적지가 늘 때 (잡 5개 고정)
#  목적지   없음   있음   차이   없음 설정   있음 설정
#      2     10      7      3       40       28
#      3     15      8      7       60       32
#      4     20      9     11       80       36
#      5     25     10     15      100       40
#      6     30     11     19      120       44
#      7     35     12     23      140       48
#      8     40     13     27      160       52
#
# 잡이 늘 때 (목적지 6개 고정)
#     잡   없음   있음   차이
#      2     12      8      4
#      3     18      9      9
#      4     24     10     14
#      5     30     11     19
#      6     36     12     24
#      7     42     13     29
#      8     48     14     34
#
# 목적지를 하나 더 붙일 때 손대는 처리 잡: 없음 5개 · 있음 0개
# → 없음 쪽은 곱셈이라 한 축만 늘어도 전체가 늘어난다.
# → 있음 쪽은 덧셈이다. 새 목적지는 커넥터 하나로 끝난다.
```

30과 11의 차이는 19다. 숫자만 보면 크지 않아 보이는데, 비용이 나오는 자리는 따로 있다.

**목적지를 하나 더 붙일 때 손대는 처리 잡이 5개와 0개다.** 다섯을 손대면 코드 리뷰 다섯 번과 배포 승인 다섯 번이고, 배포마다 그 잡이 중단돼 뒤가 밀린다. 도입의 두 팀이 갈린 자리가 여기다.

배포 승인 횟수가 그대로 비용이다. 설정 자리 120개와 44개도 같은 이야기다. 재시도 횟수 하나를 바꾸려면 층이 없는 쪽은 30곳을 찾아야 하고, 다섯 잡이 각자 다른 언어를 쓰면 그 30곳이 다 다르게 생겼다.

<div class="table-wrapper">
<figure style="text-align:center; margin:2rem 0;">
<svg viewBox="0 0 500 414" role="img" aria-label="두 장면 비교. 위는 처리 잡 다섯이 목적지 여섯에 직접 이어져 선이 서른 개다. 아래는 같은 잡 다섯이 가운데 상자 하나로만 들어가고 그 상자에서 같은 목적지 여섯으로 나가 선이 열한 개다." style="width:100%; max-width:500px; height:auto; font-family:var(--font-sans)">
<text x="6" y="14" style="font-size:12.5px; fill:var(--state-bad)">층 없음 — 잡 5 x 목적지 6 = 연결 30개</text>
<path d="M94,41L386,36M94,41L386,64M94,41L386,92M94,41L386,120M94,41L386,148M94,41L386,176M94,73L386,36M94,73L386,64M94,73L386,92M94,73L386,120M94,73L386,148M94,73L386,176M94,105L386,36M94,105L386,64M94,105L386,92M94,105L386,120M94,105L386,148M94,105L386,176M94,137L386,36M94,137L386,64M94,137L386,92M94,137L386,120M94,137L386,148M94,137L386,176M94,169L386,36M94,169L386,64M94,169L386,92M94,169L386,120M94,169L386,148M94,169L386,176" style="fill:none; stroke:var(--state-bad); stroke-width:0.8; opacity:0.7"/>
<g style="fill:var(--bg-tertiary); stroke:var(--border-color); stroke-width:1.4">
<rect x="8" y="30" width="86" height="22"/><rect x="8" y="62" width="86" height="22"/><rect x="8" y="94" width="86" height="22"/><rect x="8" y="126" width="86" height="22"/><rect x="8" y="158" width="86" height="22"/>
<rect x="8" y="240" width="86" height="22"/><rect x="8" y="272" width="86" height="22"/><rect x="8" y="304" width="86" height="22"/><rect x="8" y="336" width="86" height="22"/><rect x="8" y="368" width="86" height="22"/>
</g>
<g style="fill:var(--bg-secondary); stroke:var(--border-color); stroke-width:1.4">
<rect x="386" y="26" width="106" height="20"/><rect x="386" y="54" width="106" height="20"/><rect x="386" y="82" width="106" height="20"/><rect x="386" y="110" width="106" height="20"/><rect x="386" y="138" width="106" height="20"/><rect x="386" y="166" width="106" height="20"/>
<rect x="386" y="236" width="106" height="20"/><rect x="386" y="264" width="106" height="20"/><rect x="386" y="292" width="106" height="20"/><rect x="386" y="320" width="106" height="20"/><rect x="386" y="348" width="106" height="20"/><rect x="386" y="376" width="106" height="20"/>
</g>
<g style="font-size:12.5px; fill:var(--text-primary); text-anchor:middle">
<text x="51" y="45">정제</text><text x="51" y="77">조인</text><text x="51" y="109">5분 집계</text><text x="51" y="141">시간 집계</text><text x="51" y="173">이상 탐지</text>
</g>
<g style="font-size:12.5px; fill:var(--text-primary); text-anchor:middle">
<text x="439" y="40">웨어하우스</text><text x="439" y="68">실시간 DB</text><text x="439" y="96">검색</text><text x="439" y="124">리포트 DB</text><text x="439" y="152">타 팀 Kafka</text><text x="439" y="180">피처 스토어</text>
</g>
<line x1="6" y1="200" x2="494" y2="200" style="stroke:var(--border-color); stroke-width:1"/>
<text x="6" y="224" style="font-size:12.5px; fill:var(--state-good)">층 있음 — 잡 5 + 목적지 6 = 연결 11개</text>
<path d="M94,251L146,300M94,283L146,308M94,315L146,315M94,347L146,322M94,379L146,330M274,300L386,246M274,308L386,274M274,315L386,302M274,322L386,330M274,330L386,358M274,338L386,386" style="fill:none; stroke:var(--accent-secondary); stroke-width:1.5"/>
<rect x="146" y="288" width="128" height="54" style="fill:var(--bg-secondary); stroke:var(--accent-primary); stroke-width:2.5"/>
<text x="210" y="308" text-anchor="middle" style="font-size:13px; fill:var(--text-primary)">나눠 보내는 층</text>
<text x="210" y="326" text-anchor="middle" style="font-size:12.5px; fill:var(--text-muted); font-family:var(--font-mono)">ad.*.clean</text>
<text x="6" y="408" style="font-size:12.5px; fill:var(--text-muted)">아래 상자는 위와 같다. 목적지를 하나 더 붙일 때 위는 잡 다섯 개를 고치고 아래는 0개다.</text>
</svg>
<figcaption style="margin-top:0.75rem; font-size:0.9rem; color:var(--text-muted)">상자는 위아래가 똑같고 선의 수만 다르다. 위쪽 선 서른 개는 각각 포맷·재시도·권한을 따로 들고 있다. 아래쪽에서는 왼쪽이 목적지를 모르고 오른쪽이 처리 로직을 모른다.</figcaption>
</figure>
</div>

코드가 찍은 표에서 목적지를 늘려 보면 층이 없는 쪽은 다섯씩 뛰고 있는 쪽은 하나씩 는다. 한 축만 늘어도 곱셈은 전체 비용을 끌어올린다. 그래서 결정은 하나다. 목적지가 늘 것 같으면 층을 먼저 세운다.

---

## 3. 설정 파일 한 장이 하는 일

**목적지마다 블록 하나. 처리 잡은 이 파일을 아예 모르고, 배포 승인도 이 파일 하나로 난다.**

나눠 보내는 층의 설정은 대개 한 파일에 모인다. 두 목적지만 적으면 이렇게 생겼다.

```yaml
# 나눠 보내는 층의 라우팅 규칙 — 목적지마다 한 블록
routes:
  - name: warehouse-impression
    source: ad.impression.clean
    sink: iceberg
    table: ad.impression_v3
    format: parquet
    partition_by: [collect_date, collect_hour]
    write_mode: overwrite_partition
    retry: { max_attempts: 5, backoff_ms: 2000 }
    dlq: ad.impression.dlq
  - name: realtime-impression
    source: ad.impression.clean
    sink: clickhouse
    table: imp_5m
    format: rowbinary
    write_mode: idempotent_upsert
    dedup_key: [req_id, seq]
    retry: { max_attempts: 3, backoff_ms: 200 }
    dlq: ad.impression.dlq
```

두 블록의 `source` 가 같다. **같은 topic 을 읽어서 서로 다른 곳에 서로 다른 모양으로 넣는다.** 검색 인덱스를 붙이라는 티켓은 여기 블록 하나를 더하는 일이 되고, 배포 승인도 이 파일 하나만 보면 난다. 1절 표의 열들이 그대로 아래 다섯 줄로 내려온다.

| 키 | 무엇을 정하나 | 잘못 잡으면 |
|---|---|---|
| `source` | 어느 topic 을 읽나 | 엉뚱한 데이터가 실린다 |
| `sink` · `table` | 어느 테이블에 쓰나 | 다른 테이블을 덮어쓴다 |
| `write_mode` | 덮어쓰나 새로 넣나 | 두 번 돌면 정산이 두 배 |
| `retry` | 몇 번 · 얼마 간격으로 | 마감을 넘기거나 버린다 |
| `dlq` | 실패한 건이 어디로 | 버려진 줄을 모른다 |

맨 아랫줄의 `dlq` 는 쓰기가 끝까지 실패한 건이 가는 자리이고, 이것을 **실패 큐**라고 부른다. 여기 쌓인 건은 버린 것이 아니라, 사유를 고쳐 다시 흘려 넣어 매출로 살려야 하는 건이다.

**회사마다 이 층에 자기 이름을 붙여 부른다.** 이름은 낯설어도 하는 일은 대개 위 표와 위 파일이고, 공개된 것 중에서는 Kafka Connect 가 가장 흔하다.

:::deep 더 깊이 — 수집기로 쓰는 도구로 유통까지 하는 설정
**Logstash 도 이 자리에 선다.** 형제 글에서는 수집기로 나왔는데 같은 도구가 유통도 한다. `input` 이 하나이고 `output` 이 여럿이기 때문이다. 위 라우팅 규칙을 Logstash 설정으로 옮기면 이렇게 생겼다.

```ruby
# logstash.conf — 하나로 받아 여럿으로 나눠 쓴다
input {
  kafka {
    bootstrap_servers => "kafka:9092"
    topics => ["ad.impression.clean"]
    group_id => "dist-impression"
  }
}

filter {
  # 목적지마다 모양이 다르면 여기서 표시만 붙여 둔다
  if [event_type] == "impression" {
    mutate { add_tag => ["warehouse", "realtime"] }
  } else {
    mutate { add_tag => ["dlq"] }
  }
}

output {
  if "warehouse" in [tags] {
    s3 { bucket => "ad-log"
         prefix => "impression/dt=%{+YYYY-MM-dd}"
         retry_count => 5 }
  }
  if "realtime" in [tags] {
    http { url => "http://clickhouse:8123/?query=INSERT+INTO+imp_5m"
           http_method => "post"
           retry_failed => true }
  }
  if "dlq" in [tags] {
    kafka { bootstrap_servers => "kafka:9092"
            topic_id => "ad.impression.dlq" }
  }
}
```

`output` 안에 블록이 셋이고 앞의 `input` 은 하나다. 다만 Logstash 를 이 자리에 두면 비용이 붙는다. JVM 이라 한 대가 1 GB 를 먹고, 한 목적지의 설정 실수가 같은 프로세스의 다른 목적지를 중단시킬 수 있다. 그래서 목적지가 열을 넘어가면 커넥터를 따로 띄우는 쪽으로 옮겨 간다.
:::

이 파일 한 장이 도입의 반나절과 두 주를 갈랐다. 결정은 한 블록이다. 그런데 이 층이 늘 이기는 것은 아니고, 다음 절이 손해가 나는 자리다.

---

## 4. 언제는 두지 않는 편이 싼가

**홉이 하나 늘고, 잡과 목적지가 둘 다 적으면 순손해다.**

연결이 30에서 11로 준다고 늘 이득인 것은 아니고, 비용을 치르는 자리가 두 곳 있다. 첫째는 홉이 하나 더 생기는 것이다. 잡이 목적지에 바로 쓰면 쓰기가 한 번인데, 이 층을 거치면 topic 에 쓰고 커넥터가 다시 읽는다. 형제 글의 대시보드는 남는 예산이 888 ms 뿐이라, topic 왕복 200 ms 를 더하면 예산의 22% 를 먹는다.

둘째는 잡이 하나뿐일 때다. 잡 하나에 목적지 둘이면 없는 쪽이 2이고 있는 쪽이 3이라, 층이 연결을 오히려 하나 늘린다. **목적지와 잡이 둘 다 하나둘일 때는 이 층이 순손해다.** 규모가 이 결정을 정한다.

| 규모 | 어떻게 하나 | 왜 |
|---|---|---|
| 목적지 셋 이하 · 잡 둘 이하 | 잡이 직접 쓴다 | 층이 연결을 오히려 늘린다 |
| 목적지 넷 이상 · 잡 셋 이상 | 층을 둔다 | 곱셈이 덧셈으로 바뀐다 |
| 마감이 1초 아래 | 잡이 직접 쓴다 | topic 왕복이 예산을 먹는다 |
| 목적지가 늘 예정 | 미리 층을 둔다 | 나중엔 잡 전부를 고친다 |

기준은 이렇다. 목적지가 셋을 넘고 처리 잡이 둘을 넘으면 이득이 확실하고, 그 아래면 직접 쓰다가 늘어날 때 옮긴다. 옮기는 일 자체가 잡 전부를 고치는 일이니, 그 비용을 미리 셈해 두고 언제 옮길지를 결정해 둔다.

---

## 한눈 정리

| 무엇 | 이 글의 답 | 그 답을 정한 근거 |
|---|---|---|
| 목적지가 몇 곳인가 | 여섯 | 포맷·쓰기·재시도가 다 다르다 |
| 층이 없으면 | 연결 30개 · 설정 자리 120개 | 잡 5 곱하기 목적지 6 |
| 층이 있으면 | 연결 11개 · 설정 자리 44개 | 잡 5 더하기 목적지 6 |
| 목적지 하나 추가 | 손대는 잡 5개 → 0개 | 커넥터 블록 하나로 끝난다 |
| 언제 두지 않나 | 목적지 셋 이하 · 잡 둘 이하 | 연결이 2에서 3으로 늘어난다 |

---

## 헷갈리기 쉬운 점

**"유통 계층은 새 제품을 사는 일이다"** — 자리의 이름이지 제품 이름이 아니다. Flink 잡의 sink 를 공용으로 뽑아 쓰는 구성도 같은 층이라, 비용을 새로 쓰지 않고도 세울 수 있다.

**"연결이 19개 줄어든 것이 값어치다"** — 값어치는 개수가 아니라 배포 승인 횟수다. 목적지 하나에 손대는 잡이 5개와 0개로 갈리는 것이 도입의 반나절과 두 주를 만들었다.

**"실패 큐를 만들어 뒀으니 안심이다"** — 만들어 놓고 안 보는 것이 가장 흔한 손해다. 사유를 고쳐 다시 흘려 넣어야 그 건들이 매출로 살아난다.

---

## 더 깊이 보기

- [누가 보내고 누가 가지러 가나](post.html?id=pipeline-push-and-pull) — 먼저 읽어도 되는 글. 이 층 앞뒤의 여섯 자리와, Kafka 가 왜 며칠 들고 있는지
- [Kafka 앞뒤를 통째로 — 데이터 파이프라인을 설계하는 순서](post.html?id=data-pipeline-design) — 이 층을 품은 여섯 층 전체. 888 ms 예산이 어디서 나온 값인지
- [Kafka는 왜 있나](post.html?id=kafka-log-pipeline) — 이 층이 읽는 topic 안쪽. 보존 기간을 비용으로 정한다
- [Feature Store & Real-Time Serving](post.html?id=feature-store-serving) — 목적지 중 피처 스토어 쪽. 학습 피처와 서빙 피처가 어긋나는 자리
