지훈 씨가 여덟째 주에 옆 팀 저장소의 읽기 권한을 받았습니다. 데이터 플랫폼 팀이었습니다. 지훈 씨의 클릭 로그를 매일 창고 테이블로 쌓아 주는 팀인데, 그 팀이 하루 종일 무슨 일을 하는지는 몰랐습니다. 요청서를 보내면 며칠 뒤 테이블이 생겼고, 그 사이에 무슨 일이 있는지는 보이지 않았습니다.

저장소를 열자 폴더가 여럿이고 파일이 수백 개였습니다. 어디부터 읽어야 할지 몰라서 다른 방법을 썼습니다. 그 팀에 가장 최근에 온 사람 한 명의 커밋만 골라 달별로 늘어놓았습니다. 첫 달은 몇 개뿐이었고 달이 갈수록 늘었습니다. 그 팀에 가장 최근에 온 사람이라 팀에서는 신입입니다.

**데이터 엔지니어링 팀에 새로 온 사람은 첫 여섯 달 동안 실제로 무엇을 만드나요?**

답은 커밋이 놓인 폴더에 있었습니다. 첫 달은 수급 DAG 폴더였고 둘째 달은 SQL 모델 폴더였습니다. 셋째 달은 실시간 잡 폴더였습니다. 폴더가 곧 일감의 종류였고, 순서가 곧 배우는 순서였습니다. 이것을 알면 데이터 팀에 요청서를 낼 때 어느 층의 일을 부탁하는지 알게 됩니다. 그 팀으로 옮길지 고민할 때 무엇을 새로 배워야 하는지도 보입니다.

> **한 줄 요약:** 저장소는 수급 DAG, SQL 모델, 오퍼레이터와 Spark, Flink 실시간 네 층이고, 새로 온 사람은 그 순서대로 올라갑니다. 첫 달은 DAG 한 장, 둘째 달은 SQL 모델, 셋째 달은 실시간 잡 하나, 여섯 달이 지나서는 배포 자동화였습니다. 그 사이사이에 「리뷰 반영」 커밋이 끼어 있습니다.

> **골라 읽는 법** — 절이 8개인 글입니다. 절마다 카드 한 장이 들어 있어 카드만 보고 넘어가도 됩니다.
>
> - 저장소의 네 층만 → 1절
> - 첫 달과 둘째 달의 일 (수급 DAG, SQL 모델) → 2~3절
> - 부품과 실시간 (오퍼레이터, Spark, Flink) → 4~5절
> - 코드가 나가는 길 (PR, 리뷰, 배포) → 6절
> - 여섯 달 표와 새로 온 사람이 하는 일 다섯 → 7~8절

이 글은 어느 팀 저장소를 읽은 경험을 바탕으로 썼습니다. 팀 이름, 사람 이름, 서비스 이름, 테이블 이름, 경로는 전부 바꿨습니다. 개수와 날짜는 정확한 값을 적지 않았습니다. 코드 조각은 이름과 값을 바꾸고 모양만 그대로 두었습니다. 카드 속 색은 넷입니다. 파랑은 데이터가 놓인 자리입니다. 원천 DB, 창고 테이블, 파일, 토픽입니다. 벽돌색은 시키는 것입니다. Airflow, DAG, 배포 workflow 입니다. 먹색은 사람이 쓴 정의입니다. YAML, SQL, Java 파일입니다. 회색은 그것을 실행하는 엔진입니다. Spark, Kyuubi, Flink 입니다.

---

## 1. 저장소를 열면 네 층이 보입니다

**폴더 넷이 층 넷입니다. 수급 DAG, SQL 모델, 오퍼레이터와 Spark, Flink 실시간입니다. 새로 온 사람은 이 순서로 올라갑니다.**

쉽게 말하면 이 저장소는 「매일 몇 시에 어디서 데이터를 가져와 어떤 표로 만들어 어디에 놓나」를 코드로 적어 둔 곳입니다. 가져오는 것과 표로 만드는 것이 폴더 하나씩입니다. 그 둘이 클러스터에 말을 거는 부품이 또 하나입니다. 하루 한 번이 아니라 들어오는 대로 처리하는 것이 마지막 하나입니다.

README 첫 줄이 이 저장소를 한 문장으로 말합니다. 「Airflow 에서 실행될 앱과 DAG 코드를 관리하는 프로젝트」입니다. Airflow 는 정해진 시각에 정해진 순서로 일을 시키는 스케줄러이고, DAG 는 그 일의 순서를 적은 파이썬 파일입니다. DAG 파일은 수십 개이고 수급과 변환이 거의 반씩입니다. 밖으로 내보내는 것과 청소, 점검이 몇 개 더 있습니다.

| 층 | 폴더 | 언어 | 하는 일 |
|---|---|---|---|
| 수급 DAG | `workflow/dag/extract` | Python | 원천에서 창고 테이블로 매일 끌어오기 |
| SQL 모델 | `workflow/dbt/models` | SQL | 표 하나를 SQL 한 장으로 정의. 도구가 순서를 매겨 돌림 |
| 오퍼레이터와 Spark | `workflow/operators`, `apps/spark-batch` | Python, Scala | Airflow 태스크가 실제로 하는 손. Spark 는 읽고 쓰는 커넥터 |
| Flink 실시간 | `apps/flink-streaming` | Java | 들어오는 대로 받아 묶어 내보내는 잡 하나 |

<div class="demo-embed-wrap">
<iframe class="demo-embed" src="demo-de-first-months.html?embed=1&card=map" height="480" loading="lazy" title="저장소는 네 층"></iframe>
<a class="demo-embed-open" href="demo-de-first-months.html" target="_blank" rel="noopener">↗ 카드 여섯 장 전체로 열기</a>
</div>

파일 수가 가장 많은 층이 SQL 모델입니다. 수백 장이고 실제 로직이 거기 있습니다. 파이썬은 순서를 매기고 부품을 부르는 쪽이고, 데이터를 어떻게 만드나는 SQL 이 말합니다. 지훈 씨가 요청서에 「이 로그로 이 표를 만들어 주세요」라고 쓰면 그 일은 SQL 모델 한 장이 됩니다. 「이 DB 에서 매일 가져와 주세요」는 수급 DAG 하나입니다.

새로 온 사람의 커밋을 이 표에 대면 순서가 보입니다. 첫 달은 수급 DAG, 둘째 달은 SQL 모델, 셋째 달은 Flink, 넷째 달은 오퍼레이터와 Spark 였습니다. 다섯째와 여섯째 달에 다시 SQL 모델로 돌아와 가장 많이 만들었습니다. 다음 절부터 그 순서대로 따라갑니다.

## 2. 첫 달, 수급 DAG 한 장을 만듭니다

**첫 커밋은 카테고리 목록을 매일 끌어오는 DAG 였습니다. 파이썬 열몇 줄과 YAML 스무 줄쯤입니다. 그런데 첫 두 주의 커밋이 거의 전부 이 하나에 붙었습니다.**

쉽게 말하면 남의 저장소에 있는 표 하나를 매일 새벽 우리 창고에 복사하는 일입니다. 어디서 읽고 어디에 쓰나를 YAML 에 적고, 언제 도나를 파이썬에 적습니다. 나머지는 팀이 만들어 둔 도구가 합니다.

첫 커밋의 파이썬 파일은 이렇습니다. 이름과 경로와 날짜를 바꿨습니다.

```python
from datetime import datetime
from dateutil.relativedelta import relativedelta

from cosmos_ext.builder.dbt_source_dag import DbtSourceDag
from custom_timetable import CronTimeDeltaTimetable

dag = DbtSourceDag(
    dag_id="extract.community.raw_category",
    start_date=datetime(2026, 1, 1),
    schedule=CronTimeDeltaTimetable(cron="5 0 * * *", time_delta=relativedelta(days=-1)),
    source_names={"community.raw_category"},
    catchup=True,
)
dag.create_airflow_dag()
```

읽을 것은 세 줄입니다. `cron="5 0 * * *"` 은 매일 00시 05분에 돈다는 뜻입니다. `days=-1` 은 그 시각에 어제 날짜 데이터를 가져온다는 뜻입니다. `source_names` 는 어느 원천 정의를 쓰나를 가리킵니다. 그 정의는 같은 커밋의 YAML 파일에 있습니다.

```yaml
version: 2
sources:
  - name: community
    schema: warehouse.community
    tables:
      - name: raw_category
        description: "커뮤니티 카테고리 소분류 목록"
        config:
          meta:
            etl:
              type: hbase
              extract:
                content: community/category/info
              load:
                path: hdfs://warehouse/community.db/raw_category
                format: orc
```

<div class="demo-embed-wrap">
<iframe class="demo-embed" src="demo-de-first-months.html?embed=1&card=extract" height="480" loading="lazy" title="첫 달의 수급 DAG 한 장"></iframe>
<a class="demo-embed-open" href="demo-de-first-months.html" target="_blank" rel="noopener">↗ 카드 여섯 장 전체로 열기</a>
</div>

YAML 이 「무엇을 어디서 어디로」이고 파이썬이 「언제」입니다. 원천은 HBase 라는 저장소이고, 목적지는 HDFS 경로이고, 형식은 orc 파일입니다. DAG 를 만드는 코드가 이 YAML 을 읽어 수급 오퍼레이터를 태스크로 만듭니다. 그 오퍼레이터가 Spark 커넥터를 불러 실제로 읽고 씁니다. 새로 온 사람이 쓴 것은 이 두 파일이 전부이고, 그 뒤에서 도는 코드는 팀이 미리 만든 것입니다.

그런데 이 두 파일에 첫 두 주의 커밋이 거의 다 붙었습니다. 커밋 제목을 순서대로 읽으면 무엇에 걸렸는지 보입니다. 파티션 컬럼을 넣었다가 뺐고, 원천 스키마 이름을 바꿨고, 접속 계정을 바꿨습니다. 그 다음에는 catchup 을 끄고, 스케줄 시각을 고치고, 파일이 바뀌었는지 보는 센서를 붙였습니다. 테이블 이름 규칙을 맞추는 테스트도 이때 넣었습니다.

첫 일감이 작은 이유가 여기 있습니다. 표 하나를 복사하는 데 그 팀의 원천 접속 방식, 이름 규칙, 스케줄 규칙, 배포 길을 한 번에 다 밟습니다. 규칙마다 한 번씩 걸리니 커밋이 수십 개가 됩니다. 남의 DB 를 배치로 끌어오는 것이 데이터 건네기 여덟 방법 중 어디에 있는지는 [데이터 건네기](post.html?id=data-handoff-methods) 편 3절에 있습니다.

## 3. 둘째 달, 표 하나를 SQL 한 장으로 정의합니다

**dbt 모델은 SQL 파일 하나가 표 하나입니다. 머리에 어디에 어떤 형식으로 쓰나가 있고, 본문이 select 입니다. 둘째 달 커밋의 대부분이 이 폴더에 있습니다.**

쉽게 말하면 「이 표는 저 표에서 이렇게 골라 만든다」를 SQL 로 적어 두면 도구가 그 SQL 을 순서대로 돌려 표를 만들어 줍니다. 어느 SQL 을 먼저 돌릴지는 SQL 안에서 다른 표를 부르는 자리를 보고 도구가 알아냅니다.

저장소의 모델 한 장을 가져왔습니다. 하루 활성 사용자 표를 만드는 것입니다.

```sql
{{
    config(
        file_format='hive',
        schema='community',
        location_root='hdfs://warehouse/community/hive_to_hive',
        options={'fileFormat': 'avro'},
        partition_by=['created_date'],
    )
}}

-- 옛 배치 7-1 단계 | AppUsageStats.aggregateDailyActiveUser -> community.agg_active_user
-- agg_hourly_active_user(당일) -> 일 단위로 묶는다. 시간 단위 선행 작업 완료 보장 필요.
select /*+ repartition(12) */
    user_no, client_type, app_version, os_version, device_model,
    '{{ run_date("%Y%m%d") }}' as created_date
from {{ source('community', 'agg_hourly_active_user') }}
where created_date = '{{ run_date("%Y%m%d") }}'
group by user_no, client_type, app_version, os_version, device_model
```

<div class="demo-embed-wrap">
<iframe class="demo-embed" src="demo-de-first-months.html?embed=1&card=dbt" height="500" loading="lazy" title="SQL 한 장이 표 한 개"></iframe>
<a class="demo-embed-open" href="demo-de-first-months.html" target="_blank" rel="noopener">↗ 카드 여섯 장 전체로 열기</a>
</div>

세 부분입니다. 맨 위 `config` 가 이 표를 어디에 어떤 파일 형식으로 쓰고 무엇으로 나누나입니다. 가운데 주석이 이 표의 옛 주인입니다. 옛 자바 배치의 어느 단계, 어느 메서드가 이 표를 만들었는지 적혀 있습니다. 이 팀은 옛 배치를 이 저장소로 옮기는 중이라 모델마다 이 주석이 있습니다. 맨 아래 `select` 가 실제 로직입니다. 시간 단위 표를 읽어 하루 단위로 묶습니다.

`source(...)` 와 `ref(...)` 가 순서를 정합니다. 이 모델은 `agg_hourly_active_user` 를 읽으니 그 표가 먼저 만들어져야 합니다. 도구가 그 관계를 읽어 Airflow 태스크 두 개를 만들고 화살표로 잇습니다. 사람이 순서를 적지 않습니다. 이 저장소에서는 Cosmos 라는 부품이 그 일을 하고, SQL 은 Kyuubi 를 거쳐 Spark 에서 돕니다. Spark 가 어느 노드에서 도는지는 [Hadoop, Hive, Spark](post.html?id=hadoop-hive-spark-roles) 편에 있습니다.

모델 수백 장은 세 층으로 나뉩니다. 원천에 가까운 staging 과 쓸모 있게 묶은 mart 가 비슷하게 많고, 밖으로 내보내는 serving 이 가장 적습니다. 새로 온 사람의 둘째 달 커밋은 2절의 카테고리 수급을 이 층으로 잇는 것이었습니다. 수급한 원본을 읽어 정리한 표를 만들고, 원본 파일이 바뀌었는지 보는 매크로를 붙였습니다. 다섯째 달과 여섯째 달에는 이 폴더를 가장 많이 바꿨습니다. 시청 품질 표와 광고 타겟팅 표를 여기서 만들었습니다.

## 4. Airflow 가 클러스터에 말을 거는 부품, 오퍼레이터입니다

**오퍼레이터는 Airflow 태스크 하나가 실제로 하는 일을 담은 파이썬 클래스입니다. 이 팀은 열 개 넘게 직접 만들었습니다. 넷째 달 커밋이 이 폴더와 Spark 폴더에 몰립니다.**

쉽게 말하면 Airflow 는 「몇 시에 무엇을 하라」만 알고, 실제로 SQL 을 보내거나 파일을 옮기는 손은 오퍼레이터입니다. 표준 오퍼레이터로 안 되는 상대가 있으면 손을 직접 만듭니다.

| 오퍼레이터 | 말을 거는 상대 | 무엇을 하나 |
|---|---|---|
| spark | 클러스터 (YARN) | Scala 로 만든 Spark 배치를 자원 설정과 함께 띄움 |
| kyuubi | Kyuubi | SQL 을 보내 Spark 에서 돌림. dbt 모델이 이 길을 탐 |
| distcp | 다른 클러스터의 HDFS | 파일을 클러스터 사이로 복사 |
| hdfs sensor, hdfs clean | HDFS | 파일이 생겼는지 기다림. 오래된 파티션을 지움 |
| iceberg maintenance | Iceberg 테이블 | 스냅샷 정리, 작은 파일 합치기 |
| http, jdbc, kafka, mysql, mssql | 외부 API, 운영 DB, 토픽 | 원천에서 읽어 오는 수급 여러 종 |

<div class="demo-embed-wrap">
<iframe class="demo-embed" src="demo-de-first-months.html?embed=1&card=operator" height="500" loading="lazy" title="Airflow 의 손, 오퍼레이터"></iframe>
<a class="demo-embed-open" href="demo-de-first-months.html" target="_blank" rel="noopener">↗ 카드 여섯 장 전체로 열기</a>
</div>

표의 마지막 줄이 수급 오퍼레이터입니다. 2절의 YAML 에 `type: hbase` 라고 적으면 DAG 를 만드는 코드가 이 중 맞는 것을 고릅니다. 새로 온 사람의 넷째 달은 여기에 손 하나를 더한 달입니다. 다른 클러스터의 HDFS 에서 파일을 가져오는 오퍼레이터를 만들고, 파일이 생겼는지 보는 센서를 붙였습니다. 값을 옮길 때 형식을 검사하는 로직도 공통으로 뺐습니다. 그 달 커밋이 이 두 폴더에 몰려 있습니다.

Spark 는 이 저장소에서 계산 엔진이라기보다 읽고 쓰는 커넥터입니다. Scala 파일 수십 개가 HTTP, JDBC, Kafka, HDFS 에서 읽어 Hive 테이블에 쓰는 코드입니다. 성능을 조절하는 설정을 찾아 보면 거의 없습니다. `repartition`, `broadcast`, `persist` 가 하나도 없고, 자원은 오퍼레이터 기본값입니다. 유일한 조절이 SQL 힌트 `repartition(N)` 인데, 그것도 출력 파일 개수를 정하는 것입니다. 3절 모델의 첫 줄에 있던 것이 그것입니다.

이 층이 새로 온 사람에게 중요한 이유가 있습니다. 첫 두 달은 팀이 만든 부품 위에서 YAML 과 SQL 을 썼습니다. 넷째 달부터는 그 부품 자체를 고치기 시작합니다. 남이 쓸 것을 만드는 쪽으로 한 칸 올라간 것입니다.

## 5. 셋째 달, 실시간 잡 하나를 통째로 만듭니다

**셋째 달의 어느 하루에 커밋 여러 개가 Flink 폴더에 한꺼번에 들어갔습니다. 시청 품질 로그를 초 단위로 받아 묶는 잡입니다. 원천 저장소에 맞는 소스 커넥터가 없어서 Java 클래스를 처음부터 직접 만들었습니다.**

쉽게 말하면 배치는 하루 한 번 표를 만들지만, 이 잡은 로그가 들어오는 대로 받아 10초 기다렸다가 같은 재생 건끼리 묶어 내보냅니다. 늦게 온 로그는 정해진 시간까지 받아 차이만 다시 내보냅니다.

잡의 본문을 줄여 가져왔습니다. 클래스 이름과 주석을 바꿨습니다.

```java
public class PlaybackQualityJob extends Runner<QoeEvent> {

    @Override
    protected DataStream<QoeEvent> buildSource(StreamTableEnvironment env, Table input) {
        return env.toDataStream(input, QoeEvent.class)
            .assignTimestampsAndWatermarks(
                WatermarkStrategy.<QoeEvent>forBoundedOutOfOrderness(Duration.ofSeconds(10))
                    .withTimestampAssigner((e, ts) -> e.logTime)
                    .withIdleness(Duration.ofSeconds(120)));
    }

    @Override
    protected DataStream<QoeEvent> process(DataStream<QoeEvent> source, JobConfig config) {
        return source
            .filter(QoeEventProcessor::isValid)                        // 어뷰저 로그를 거른다
            .map(QoeEventProcessor::addPlatformType)                   // 플랫폼 값을 붙인다
            .map(new EntryInfoResolver(config.getEntryRulesPath()))    // 진입점 규칙으로 분류
            .keyBy(e -> e.transactionId + "|" + e.mediaId + "|" + e.mediaType)
            .window(TumblingEventTimeWindows.of(Duration.ofMillis(config.getWindowSizeMs())))
            .allowedLateness(Duration.ofMillis(config.getAllowedLatenessMs()))
            .process(new QoeTransactionMergeFunction());
    }
}
```

<div class="demo-embed-wrap">
<iframe class="demo-embed" src="demo-de-first-months.html?embed=1&card=flink" height="500" loading="lazy" title="들어오는 대로 받아 묶는 실시간 잡"></iframe>
<a class="demo-embed-open" href="demo-de-first-months.html" target="_blank" rel="noopener">↗ 카드 여섯 장 전체로 열기</a>
</div>

낯선 말이 셋입니다. 워터마크는 「이 시각까지의 로그는 다 왔다고 보는 선」입니다. `forBoundedOutOfOrderness(10초)` 는 로그 시각보다 10초 늦게 그 선을 긋는다는 뜻입니다. 로그가 순서대로 오지 않으니 조금 기다립니다. `withIdleness(120초)` 는 한 갈래에서 2분 동안 로그가 없으면 그 갈래를 기다리지 않는다는 뜻입니다. 윈도우는 시간 칸입니다. 같은 재생 건의 로그를 한 칸에 모아 하나로 묶습니다. `allowedLateness` 는 선이 지나간 뒤 늦게 온 로그를 얼마나 더 받나입니다. 이 값은 설정 파일에서 읽어 오고, 처음 정한 값을 나중에 줄였습니다.

커밋 순서가 이 잡이 어떻게 생겼는지 보여 줍니다. 그 달 초까지는 수급 일을 했습니다. 어느 하루에 커넥터, 설정 파싱, 처리 구조, Kafka sink, 로컬 테스트용 sink 가 한꺼번에 들어왔습니다. 며칠 뒤에 live 와 vod 를 나누는 로직, sink 여러 개, 직렬화 문제 수정, HDFS sink 가 붙었습니다. 그 달 커밋은 거의 전부 Flink 폴더였습니다. 다음 달에 줄고, 그 뒤로는 이 잡의 결과를 받는 dbt 모델 쪽으로 커밋이 옮겨 갑니다.

Java 파일의 절반 넘게가 커넥터입니다. 팀이 쓰는 원천 저장소에서 Flink 로 읽어 오는 표준 커넥터가 없었습니다. 그래서 읽을 구간을 나누고, 읽고, 풀어 쓰는 클래스를 전부 만들었습니다. 새로 온 사람의 가장 깊은 코드가 여기 있습니다. 그런데 이 층은 팀 전체에서 비중이 작습니다. 실시간 잡이 이것 하나이고, 팀의 일감 목록에서 Flink 는 드물게 보입니다. 토픽에서 읽어 가는 쪽이 어떻게 생겼는지는 [Kafka 로그 파이프라인](post.html?id=kafka-log-pipeline) 편에 있습니다.

## 6. 코드가 서버에 닿는 길, PR 과 리뷰와 배포입니다

**「리뷰 반영」 커밋이 여섯 달 내내 끼어 있습니다. 팀의 머지에는 거의 예외 없이 사람 승인이 붙어 있습니다. 여섯 달이 지난 뒤 첫 일이 jar 배포를 workflow 로 자동화하는 것이었습니다.**

쉽게 말하면 코드를 고치면 바로 서버에 올리지 않습니다. PR 을 올리고, 동료가 읽고, 고치고, 머지되면 자동으로 배포됩니다. 새로 온 사람이 여섯 달을 넘기며 만든 것이 그 마지막 단계입니다.

```yaml
name: Deploy Flink Streaming
# jar 와 진입점 규칙 파일을 HDFS 에 올린다.
on:
  push:
    branches: [main]               # main 에 머지되면 prod 로
  pull_request:
    types: [opened, synchronize, labeled]   # PR 에 flink 라벨이 붙으면 test 로
  workflow_dispatch:
    inputs:
      target: { type: choice, options: [test, prod] }
      confirm: { description: 'prod 이면 "deploy-prod" 를 입력' }
```

<div class="demo-embed-wrap">
<iframe class="demo-embed" src="demo-de-first-months.html?embed=1&card=ship" height="500" loading="lazy" title="코드가 서버에 닿는 길"></iframe>
<a class="demo-embed-open" href="demo-de-first-months.html" target="_blank" rel="noopener">↗ 카드 여섯 장 전체로 열기</a>
</div>

세 갈래입니다. main 에 머지되면 prod 에 올라갑니다. PR 에 flink 라벨을 붙이면 test 에 올라가서 머지 전에 돌려 볼 수 있습니다. 손으로 prod 에 올릴 때는 `deploy-prod` 라는 확인 문구를 쳐야 합니다. 실수로 누르는 것을 막는 장치입니다. 이 workflow 가 생기기 전에는 jar 를 빌드해 서버에 손으로 올렸습니다.

리뷰가 형식이 아닙니다. 「리뷰 반영」 커밋이 여섯 달에 흩어져 있고, 첫 PR 부터 있습니다. 단순한 버전 올리기는 승인 몇 개로 끝납니다. 그런데 시청 품질 표를 다른 조회 시스템으로 옮기는 PR 에서는 여러 사람이 붙어 코멘트가 길게 오갔습니다. 팀 전체로 보면 기본 브랜치 머지에 거의 예외 없이 사람 승인이 붙어 있습니다.

배포 전에 로컬에서 돌리는 검사도 있습니다. pytest 가 DAG 파일을 전부 불러 오류 없이 만들어지는지 봅니다. 같은 SQL 모델을 두 DAG 이 돌리는지도 봅니다. 고치기 전 DAG 모양을 저장해 두고 고친 뒤와 비교해 무엇이 바뀌었나를 보여 주는 테스트도 있습니다. 새로 온 사람의 둘째 커밋 제목이 「수급 DAG 테스트」였던 것이 이것입니다.

## 7. 여섯 달을 표로 되짚으면

**달마다 가장 많이 만진 폴더를 한 표에 놓으면 층을 하나씩 올라간 것이 보입니다. 첫 달 수급, 둘째 달 SQL 모델, 셋째 달 Flink, 넷째 달 부품, 다섯째와 여섯째 달 다시 SQL 모델, 그 뒤 배포입니다.**

지훈 씨가 처음 늘어놓은 표가 이것입니다. 달마다 어느 폴더를 가장 많이 바꿨나와 무엇을 했나입니다. 정확한 개수는 적지 않았습니다.

| 달 | 가장 많이 바꾼 폴더 | 무엇을 했나 |
|---|---|---|
| 첫 달 | 수급 DAG, SQL 모델 | 카테고리 목록 수급 DAG 둘. 파티션, 스키마, 계정 손보기 |
| 둘째 달 | SQL 모델, 수급 DAG | 수급을 변환까지 잇기. 센서, 파일 변경 매크로, 이름 규칙 테스트 |
| 셋째 달 | Flink | 실시간 잡 골격과 소스 커넥터. 하루에 몰아서 들어옴 |
| 넷째 달 | Flink, 오퍼레이터, Spark | HDFS 수급 오퍼레이터와 센서. 형식 검사 공통화 |
| 다섯째 달 | SQL 모델, Spark | 시청 품질 표 정의. 시간별과 일별 내보내기 DAG. 진입점 분류 규칙 |
| 여섯째 달 | SQL 모델, DAG, 도메인 규칙 | 정점. 광고 타겟팅 표, 개인정보 컬럼 제거, 입수 주기 조정 |
| 그 다음 달 | SQL 모델, Flink, CI | 늦은 로그 처리 손보기, jar 자동 배포, 라이브 카테고리 이력 수급 |

여섯 달 합계를 폴더로 다시 세면 SQL 모델이 가장 많습니다. Flink 와 DAG 가 뒤를 잇고, Spark 와 도메인 규칙과 오퍼레이터는 적습니다. 티켓 하나에 커밋이 여러 개씩 붙었습니다.

표에서 읽을 것이 둘입니다. 첫째, 속도는 두 달 만에 붙었습니다. 첫 달의 몇 개가 둘째 달에 몇 배가 되고 그 뒤로 매달 그 수준을 넘습니다. 둘째, 정점은 새 층에 들어간 달이 아니라 그 층을 익힌 뒤입니다. Flink 를 처음 만진 셋째 달보다 그 결과를 표로 만드는 여섯째 달의 커밋이 훨씬 많습니다. 새 것을 배우는 달은 커밋이 적고, 배운 것으로 만드는 달에 많습니다.

## 8. 그래서 새로 온 사람이 하는 일은 다섯 가지입니다

**수급 하나를 원천부터 표까지, SQL 모델 하나, 오퍼레이터 하나, 실패한 배치 복구, 배포와 인프라 일감입니다. 앞 넷은 이 글에서 봤고, 다섯째는 저장소 밖에 있습니다.**

쉽게 말하면 첫 여섯 달의 일은 「데이터를 가져와 표로 만들어 놓는 길」을 한 층씩 직접 밟는 것입니다. 남이 만든 부품 위에서 시작해 부품을 고치는 쪽으로 올라갑니다.

| 하는 일 | 알아야 하는 것 | 이 글의 절 |
|---|---|---|
| 수급 하나를 원천부터 표까지 낸다 | 원천 종류와 접속, 이름 규칙, 스케줄과 다시 돌리기 | 2절 |
| SQL 모델 하나를 쓴다 | source 와 ref, config, 옛 표와 값 대조, 머리말 남기기 | 3절 |
| 오퍼레이터 하나를 만든다 | Airflow 의 Hook 과 Operator, 상대 시스템의 접속 방식 | 4절 |
| 실패한 배치를 혼자 복구한다 | 로그 읽기, 어느 날짜부터 다시 돌리나, 다시 돌려도 같은 결과가 나오나 | 2~3절 |
| 배포와 인프라 일감을 받는다 | PR 과 리뷰, workflow, 이미지 취약점 조치, Kubernetes 배포 | 6절 |

넷째 줄은 커밋에 잘 안 남습니다. 배치가 새벽에 실패하면 로그를 읽고 원인을 짚습니다. 며칠치를 다시 돌려야 하는지 정하고, 다시 돌려도 결과가 같은지 확인합니다. 이 저장소의 SQL 모델이 날짜로 파티션을 나누고 그 날짜만 덮어쓰는 것이 그래서입니다. 같은 날짜를 두 번 돌려도 표가 두 배가 되지 않습니다. 다섯째 줄은 다른 저장소에 있습니다. Airflow 이미지 빌드, Kubernetes 배포, argo-cd 설정입니다. 새로 온 사람의 그 저장소 첫 커밋이 argo-cd 초기 세팅이었습니다.

지훈 씨가 이 팀으로 옮길지 고민한다면 표에 없는 것도 봐야 합니다. 저장소에서 pandas, scikit-learn, PyTorch 를 찾으면 하나도 없습니다. Spark 도 PySpark 가 아니라 Scala 입니다. 모델을 만드는 자리는 없습니다. 파이썬, Docker, Kubernetes, Spark, Airflow 는 그대로 가져가고 모델 학습은 두고 가는 자리입니다. 새로 배울 것 중 가장 큰 것은 dbt 문법이 아니라 데이터 모델링입니다. 어느 표를 원본으로 두고 어느 표를 묶은 것으로 두나, 어제 값과 오늘 값을 어떻게 같이 두나입니다.

## 한눈 정리

| 질문 | 한 줄 답 |
|---|---|
| 저장소는 몇 층인가 | 넷. 수급 DAG, SQL 모델, 오퍼레이터와 Spark, Flink 실시간 |
| 새로 온 사람의 첫 커밋은 | 표 하나를 매일 끌어오는 DAG. 파이썬 열몇 줄과 YAML 스무 줄쯤 |
| 왜 그 두 파일에 커밋이 수십 개 붙나 | 원천 접속, 이름 규칙, 스케줄, 배포 길을 처음 밟느라 규칙마다 한 번씩 걸린다 |
| dbt 모델이 무엇인가 | SQL 파일 하나가 표 하나. 순서는 source 와 ref 를 보고 도구가 매긴다 |
| 오퍼레이터가 무엇인가 | Airflow 태스크가 실제로 하는 손. 이 팀은 열 개 넘게 직접 만들었다 |
| Spark 는 무엇을 하나 | 계산 엔진이 아니라 읽고 쓰는 커넥터. 성능 조절 설정이 거의 없다 |
| 실시간 잡은 무엇이 다른가 | 하루 한 번이 아니라 들어오는 대로. 워터마크로 조금 기다리고 늦은 것은 따로 받는다 |
| 코드는 어떻게 서버에 가나 | PR, 리뷰, 머지, workflow 자동 배포. 머지에 거의 예외 없이 사람 승인 |
| 여섯 달의 순서는 | 첫 달 수급, 둘째 달 SQL 모델, 셋째 달 Flink, 넷째 달 부품, 다섯째와 여섯째 달 SQL 모델, 그 뒤 배포 |
| 모델을 만들던 사람이 옮기면 | 파이프라인 쪽은 그대로, 모델 쪽은 두고 간다. pandas 와 PyTorch 가 없다 |

## 헷갈리기 쉬운 점

- **DAG 가 데이터를 만드는 것이 아닙니다.** DAG 는 순서와 시각입니다. 표를 어떻게 만드나는 SQL 모델에 있습니다.
- **YAML 한 장이 곧 수급 하나입니다.** 파이썬 파일은 그 YAML 을 언제 돌리나만 적습니다. 원천을 바꾸려면 YAML 을 봅니다.
- **dbt 모델의 순서를 손으로 적지 마세요.** source 와 ref 가 순서입니다. 순서를 따로 적으면 두 곳이 어긋납니다.
- **Spark 폴더에서 튜닝을 찾지 마세요.** 이 저장소의 Spark 는 커넥터입니다. `repartition(N)` 힌트는 출력 파일 개수입니다.
- **워터마크는 지연이 아니라 기준선입니다.** 「조금 늦게 선을 긋는다」이고, 그 선이 지나면 창이 닫힙니다. 그 뒤 온 것이 늦은 로그입니다.
- **커밋이 적은 달이 일을 안 한 달이 아닙니다.** 새 층에 들어간 달은 커밋이 적고, 그 층으로 만드는 달에 많습니다.
- **PR 라벨이 배포 스위치일 수 있습니다.** 이 저장소는 flink 라벨을 붙이면 test 배포가 돕니다. 라벨을 장식으로 붙이지 마세요.
- **저장소 하나가 팀의 전부가 아닙니다.** 이미지와 Kubernetes 배포는 다른 저장소에 있습니다. 인프라 일감은 거기서 셉니다.

## 더 깊이 보기

- 카드 여섯 장을 한 페이지에서 보려면 [데이터 엔지니어 첫 6개월 카드 여섯 장](demo-de-first-months.html)이 있습니다. 카드를 누르면 층마다 헷갈리는 것 하나가 더 나옵니다.
- 2절의 수급이 여덟 방법 중 어디인지는 [데이터 건네기](post.html?id=data-handoff-methods) 편입니다. DB 배치와 파일 카드가 그 자리입니다.
- 3절의 SQL 이 Kyuubi 를 거쳐 어느 노드에서 도는지는 [Hadoop, Hive, Spark](post.html?id=hadoop-hive-spark-roles) 편에 있습니다.
- 5절의 잡이 읽는 토픽과 늦게 오는 로그는 [Kafka 로그 파이프라인](post.html?id=kafka-log-pipeline) 편입니다.
- 원본, 정제, 마트 세 층으로 표를 나누는 이유는 [데이터 파이프라인 설계](post.html?id=data-pipeline-design) 편에 있습니다.
