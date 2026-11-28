여덟째 주에 지훈 씨는 옆 팀인 데이터 플랫폼 팀의 저장소를 읽을 수 있는 권한을 받았습니다. 저장소는 팀이 쓴 코드를 모아 두고 누가 언제 무엇을 고쳤는지 기록해 두는 곳입니다. 데이터 플랫폼 팀은 지훈 씨의 클릭 로그를 매일 데이터 웨어하우스(분석에 쓸 데이터를 모아 두는 저장 시스템)의 테이블로 쌓아 주는 팀입니다. 지훈 씨는 그 팀에 요청서를 보내면 며칠 뒤 테이블이 생긴다는 것만 알았고 그 며칠 사이에 무슨 일이 있는지, 그 팀이 하루 종일 무슨 일을 하는지는 몰랐습니다.

저장소를 열어 보니 폴더가 여러 개였고 파일은 수백 개였습니다. 어디부터 읽어야 할지 알 수 없어서 지훈 씨는 파일을 하나씩 읽는 대신 다른 방법을 썼습니다. 그 팀에 가장 최근에 들어와 팀에서는 신입인 사람 한 명을 골라 그 사람이 남긴 커밋만 달별로 늘어놓았습니다. 커밋은 저장소에 코드를 고쳐 올린 기록 한 건입니다. 그 사람의 커밋은 첫 달에는 몇 개뿐이었고 달이 갈수록 늘었습니다.

**데이터 엔지니어링 팀에 새로 온 사람은 첫 여섯 달 동안 실제로 무엇을 만들까요?**

답은 커밋이 들어간 폴더에서 보였습니다. 첫 달의 커밋은 수급 DAG 폴더에, 둘째 달의 커밋은 SQL 모델 폴더에, 셋째 달의 커밋은 실시간 잡 폴더에 몰려 있었습니다. 수급(extract)은 원천(source, 데이터가 처음 만들어져 놓여 있는 곳)에서 데이터를 가져와 웨어하우스 테이블로 들여오는 일입니다. DAG 는 Directed Acyclic Graph 의 줄임말로 앞 작업이 끝나야 뒤 작업이 시작되는 순서를 화살표로 그린 작업 그림입니다. SQL 모델은 표 하나를 어떻게 만드는지 SQL 파일 하나에 적은 정의입니다. 실시간 잡은 하루에 한 번이 아니라 데이터가 들어오는 대로 처리하는 프로그램을 말합니다. 폴더마다 일감의 종류가 달랐습니다. 커밋이 폴더를 옮겨 간 순서는 그 사람이 일을 배운 순서였습니다. 폴더와 일감의 관계를 알면 지훈 씨가 데이터 팀에 요청서를 낼 때 저장소의 어느 폴더에 들어갈 일을 부탁하는지 알 수 있고 그 팀으로 옮길지 고민할 때 무엇을 새로 배워야 하는지도 보입니다.

> **한 줄 요약:** 이 팀의 저장소는 데이터를 가져오는 수급 DAG, 표를 정의하는 SQL 모델, 작업을 실제로 실행하는 부품인 오퍼레이터와 데이터를 읽고 쓰는 Spark, 들어오는 데이터를 바로 처리하는 Flink 실시간 잡의 4개 층으로 나뉩니다. 새로 온 사람은 이 순서대로 층을 올라갑니다. 첫 달에는 DAG 한 장, 둘째 달에는 SQL 모델, 셋째 달에는 실시간 잡 하나를 만들었고 여섯 달이 지나서는 배포를 자동화했습니다. 그 사이사이에는 동료가 코드를 읽고 단 의견대로 고친 「리뷰 반영」 커밋이 끼어 있습니다.

> **골라 읽는 법** — 이 글은 절 8개로 되어 있습니다. 1~6절에는 절마다 카드가 한 장씩 들어 있어 카드만 보고 다음 절로 넘어가도 됩니다.
>
> - 저장소를 이루는 4개 층 → 1절
> - 첫 달과 둘째 달에 만든 수급 DAG 와 SQL 모델 → 2~3절
> - 작업을 실제로 실행하는 오퍼레이터, 데이터를 읽고 쓰는 Spark, 들어오는 대로 처리하는 Flink 잡 → 4~5절
> - 고친 코드가 리뷰를 거쳐 서버에 배포되는 길 → 6절
> - 여섯 달을 정리한 달별 표와 새로 온 사람이 하는 일 5가지 → 7~8절

이 글은 어느 팀의 저장소를 읽어 본 경험을 바탕으로 썼습니다. 팀 이름, 사람 이름, 서비스 이름, 테이블 이름, 경로는 모두 바꿨습니다. 개수와 날짜는 정확한 값을 적지 않았습니다. 코드 조각은 이름과 값을 바꾸고 모양만 원래대로 남겼습니다.

---

## 1. 저장소를 이루는 네 층

**저장소는 폴더 4개가 층 하나씩을 이루어 수급 DAG, SQL 모델, 오퍼레이터와 Spark, Flink 실시간 잡의 4개 층으로 나뉩니다. 새로 온 사람은 이 순서로 층을 올라갑니다.**

지훈 씨가 어디부터 읽어야 할지 몰랐던 파일 수백 개는 하는 일에 따라 4개 층으로 나뉩니다. 이 저장소에는 「매일 몇 시에 어디서 데이터를 가져와 어떤 표로 만들어 어디에 놓나」가 코드로 적혀 있습니다. 데이터를 가져오는 일과 가져온 데이터를 표로 만드는 일이 폴더를 하나씩 차지합니다. 그 두 일이 클러스터(여러 서버를 모아 한 시스템처럼 쓰는 단위)에 접속해 일을 시킬 때 쓰는 부품이 또 한 층입니다. 하루에 한 번이 아니라 데이터가 들어오는 대로 처리하는 일이 마지막 층입니다.

저장소 맨 위에 있는 설명 파일 README 도 첫 줄에서 이 저장소를 「Airflow 에서 실행될 앱과 DAG 코드를 관리하는 프로젝트」라고 소개합니다. Airflow 는 정해진 시각에 정해진 순서로 작업을 실행하는 스케줄러로, Airflow 에서는 그 작업의 순서를 적은 파이썬 파일을 DAG 라고 부릅니다. 저장소의 DAG 파일 수십 개는 수급 DAG 와 변환 DAG 가 거의 반씩입니다. 변환(transform)은 가져온 데이터를 쓸모 있는 표로 바꾸는 일입니다. 이 둘 말고도 데이터를 밖으로 내보내는 DAG 와 청소, 점검을 맡은 DAG 가 몇 개 더 있습니다.

| 층 | 폴더 | 언어 | 하는 일 |
|---|---|---|---|
| 수급 DAG | `workflow/dag/extract` | Python | 원천에서 웨어하우스 테이블로 매일 끌어오기 |
| SQL 모델 | `workflow/dbt/models` | SQL | 표 하나를 SQL 한 장으로 정의. 도구가 순서를 매겨 돌림 |
| 오퍼레이터와 Spark | `workflow/operators`, `apps/spark-batch` | Python, Scala | Airflow 태스크가 실제로 하는 일을 담은 부품. Spark 는 읽고 쓰는 커넥터 |
| Flink 실시간 | `apps/flink-streaming` | Java | 들어오는 대로 받아 묶어 내보내는 잡 하나 |

표의 셋째 줄에 나오는 커넥터는 다른 시스템의 데이터를 읽거나 쓸 수 있게 연결해 주는 코드를 말합니다.

카드 색은 4가지로 나뉩니다. 파랑은 데이터가 놓인 자리로 원천 DB, 웨어하우스 테이블, 파일, 그리고 데이터가 생기는 대로 쌓이는 토픽을 나타냅니다. 벽돌색은 일을 시키는 것으로 Airflow, DAG, 배포 workflow(코드가 올라오면 배포 단계를 자동으로 실행하도록 적은 설정)입니다. 먹색은 사람이 쓴 정의로 YAML(설정을 적는 글 형식), SQL, Java 파일입니다. 회색은 그 정의를 실행하는 엔진으로 Spark, Kyuubi(SQL 을 받아 Spark 에서 돌려 주는 서버), Flink 를 칠했습니다. 첫 카드에서는 원천에서 웨어하우스 테이블까지 가는 길 위에 4개 층이 어떻게 놓이는지 보면 됩니다.

<div class="demo-embed-wrap">
<iframe class="demo-embed" src="demo-de-first-months.html?embed=1&card=map" height="480" loading="lazy" title="저장소는 네 층"></iframe>
<a class="demo-embed-open" href="demo-de-first-months.html" target="_blank" rel="noopener">↗ 카드 여섯 장 전체로 열기</a>
</div>

4개 층 가운데 파일이 가장 많은 층은 SQL 모델로 SQL 파일이 수백 장입니다. 데이터를 실제로 어떻게 만드는지는 이 SQL 에 적혀 있지만 파이썬 파일은 작업에 순서를 매기고 부품을 부르기만 합니다. 지훈 씨가 쓰는 요청서의 말로 옮기면 「이 로그로 이 표를 만들어 주세요」는 SQL 모델 한 장이 되고 「이 DB 에서 매일 가져와 주세요」는 수급 DAG 하나가 됩니다.

새로 온 사람의 커밋을 달마다 이 표의 폴더에 맞춰 보면 커밋이 옮겨 간 순서가 보입니다. 커밋이 몰린 폴더는 첫 달에 수급 DAG, 둘째 달에 SQL 모델, 셋째 달에 Flink, 넷째 달에 오퍼레이터와 Spark 였습니다. 다섯째와 여섯째 달에는 다시 SQL 모델로 돌아와 이 폴더에서 가장 많이 만들었습니다. 다음 절부터는 이 순서를 따라 층을 하나씩 봅니다.

## 2. 첫 달에 만든 수급 DAG 한 장

**새로 온 사람의 첫 커밋은 카테고리 목록을 매일 끌어오는 수급 DAG 로, 파이썬 10여 줄과 YAML 20줄쯤이었습니다. 그런데 첫 2주의 커밋이 거의 전부 이 작은 DAG 하나에 붙었습니다.**

이 팀에는 원천 접속 방식, 이름 규칙, 스케줄 규칙과 배포 길(고친 코드가 서버에 올라가기까지의 절차)이 정해져 있습니다. 표 하나를 복사하는 일이어도 이 규칙을 한 번에 다 거쳐야 해서 새로 온 사람은 규칙마다 한 번씩 걸려 고치느라 작은 DAG 하나에 커밋이 수십 개 붙습니다. 이렇게 작은 일 하나로도 팀의 규칙을 모두 한 번씩 거치므로 첫 일감은 표 하나를 복사하는 정도로 작습니다.

이 수급 DAG 는 다른 팀의 원천에 있는 표 하나를 매일 새벽 이 팀의 웨어하우스로 복사합니다. 어디서 읽어 어디에 쓸지는 YAML 에, 언제 돌지는 파이썬에 적고 나머지는 팀이 만들어 둔 도구가 처리합니다. 아래는 첫 커밋에 들어간 파이썬 파일입니다. 이름과 경로와 날짜는 바꿨습니다. 실행할 코드가 아니라 이 DAG 가 언제 무엇을 돌리는지 적힌 줄을 보려고 가져왔습니다.

```python
# (DAG 예시 — 그대로 실행되지 않습니다.)
# 하는 일: 원천 표 하나를 매일 00시 05분에 어제 날짜 기준으로 웨어하우스에 복사하는 DAG 를, 팀이 만들어 둔 도구로 정의한다.
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

이 파일에서 읽을 줄은 3개입니다. `cron="5 0 * * *"` 은 돌 시각을 적은 cron 식입니다. cron 식은 다섯 칸에 앞에서부터 분, 시, 일, 월, 요일을 적고 `*` 는 모든 값을 뜻합니다. 이 식은 분 칸이 5 이고 시 칸이 0 이며 나머지 세 칸이 `*` 라서 매일 00시 05분에 돕니다. `days=-1` 은 그 시각에서 하루를 빼 어제 날짜의 데이터를 가져오라는 뜻이므로 이 DAG 는 날마다 00시 05분에 하루 전 날짜의 데이터를 가져옵니다. `source_names` 는 어느 원천 정의를 쓸지 가리키는데, 그 정의는 같은 커밋에 함께 들어간 아래 YAML 파일에 있습니다.

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

두 번째 카드는 새로 온 사람이 쓴 두 파일이 태스크와 커넥터를 거쳐 원천의 표를 웨어하우스로 옮기는 차례를 따라갑니다.

<div class="demo-embed-wrap">
<iframe class="demo-embed" src="demo-de-first-months.html?embed=1&card=extract" height="480" loading="lazy" title="첫 달, 수급 DAG 한 장"></iframe>
<a class="demo-embed-open" href="demo-de-first-months.html" target="_blank" rel="noopener">↗ 카드 여섯 장 전체로 열기</a>
</div>

두 파일은 일을 나눠 맡아 YAML 이 「무엇을 어디서 어디로」를 적고 파이썬이 「언제」를 적습니다. YAML 의 `description` 에는 이 표가 커뮤니티 카테고리의 소분류 목록이라고 적혀 있습니다. `type: hbase` 는 원천이 HBase(행을 키로 찾아 읽고 쓰는 분산 데이터베이스)라는 뜻입니다. `load` 아래의 `path` 는 데이터를 쓸 목적지인 HDFS(여러 서버에 파일을 나눠 저장하는 파일 시스템) 경로입니다. `format: orc` 는 그 경로에 열 단위로 저장하는 파일 형식인 orc 로 쓰라는 뜻입니다. DAG 를 만드는 팀의 코드(`DbtSourceDag`)가 이 YAML 을 읽어 수급 오퍼레이터를 태스크(DAG 안의 작업 하나)로 만듭니다. 오퍼레이터는 태스크가 실제로 하는 일을 담은 부품으로, 자세한 내용은 4절에 있습니다. 여기서는 그 오퍼레이터가 Spark 커넥터를 불러 HBase 에서 읽고 HDFS 에 씁니다. 새로 온 사람이 직접 쓴 파일은 이 두 개가 전부이지만 그 뒤에서 도는 코드는 모두 팀이 미리 만들어 두었습니다.

이 두 파일에 붙은 커밋의 제목을 순서대로 읽어 보면 새로 온 사람이 어디에서 걸렸는지 알 수 있습니다. 처음에는 파티션 컬럼(표를 날짜 같은 값으로 나눠 저장할 때 기준이 되는 컬럼)을 넣었다가 뺐고 원천 스키마(테이블을 모아 두는 이름 공간) 이름과 접속 계정을 바꿨습니다. 그다음에는 catchup 을 끄고 스케줄 시각을 고쳤으며 파일이 바뀌었는지 확인하는 센서를 붙였습니다. catchup 은 시작 날짜부터 지금까지 밀린 날짜를 모두 거슬러 돌리게 하는 Airflow 설정으로, 첫 커밋의 파일에는 `catchup=True` 로 켜져 있었습니다. 센서는 조건이 맞을 때까지 기다렸다가 다음 태스크를 시작하게 하는 태스크입니다. 테이블 이름이 팀의 이름 규칙에 맞는지 확인하는 테스트도 이때 넣었습니다.

남의 DB 를 이렇게 배치(정해진 시각에 모아 한 번에 옮기는 방식)로 가져오는 일이 팀 사이에 데이터를 건네는 8가지 방법 가운데 어디에 속하는지는 [데이터 건네기](post.html?id=data-handoff-methods) 편 3절에서 다룹니다.

## 3. 둘째 달의 SQL 모델, 표 하나를 정의하는 SQL 한 장

**SQL 모델은 SQL 파일 하나로 표 하나를 정의합니다. 파일 머리에는 표를 어디에 어떤 형식으로 쓸지를, 본문에는 select 문을 적습니다. 둘째 달 커밋은 대부분 이 폴더에 있습니다.**

수급 DAG 는 원천의 표를 웨어하우스로 가져올 뿐 그 데이터로 쓸모 있는 표를 만들지는 않습니다. 표를 어떻게 만드는지는 이 절의 SQL 모델에 적습니다. 어떤 표는 다른 표를 읽어 만들어지므로 SQL 을 돌리는 순서도 맞아야 하는데, 그 순서는 사람이 아니라 dbt 라는 도구가 정합니다.

dbt(data build tool)는 「이 표는 저 표에서 이렇게 골라 만든다」를 SQL 로 적어 두면 그 SQL 을 순서대로 돌려 표를 만들어 주는 도구입니다. 어느 SQL 을 먼저 돌릴지는 dbt 가 SQL 안에서 다른 표를 부르는 자리를 보고 알아냅니다. 이 폴더의 SQL 모델은 dbt 로 돌기 때문에 dbt 모델이라고도 부릅니다. 아래 SQL 은 저장소에 있는 모델 한 장으로 하루 활성 사용자 표를 만듭니다. 모델 한 장이 어떤 부분으로 되어 있는지 보려고 가져왔습니다.

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

세 번째 카드에서는 이 SQL 한 장이 태스크가 되고 시간 단위 태스크 다음에 하루 단위 태스크가 도는 순서를 확인할 수 있습니다.

<div class="demo-embed-wrap">
<iframe class="demo-embed" src="demo-de-first-months.html?embed=1&card=dbt" height="500" loading="lazy" title="SQL 한 장이 표 한 개"></iframe>
<a class="demo-embed-open" href="demo-de-first-months.html" target="_blank" rel="noopener">↗ 카드 여섯 장 전체로 열기</a>
</div>

모델은 세 부분으로 되어 있습니다. 맨 위 `config` 는 이 표를 어디에(`location_root`) 어떤 파일 형식으로(`file_format`, `options`) 쓰고 무엇을 기준으로 나눌지(`partition_by=['created_date']`) 정합니다. 가운데 주석에는 이 표를 예전에 만들던 옛 자바 배치의 단계(7-1 단계)와 메서드(`AppUsageStats.aggregateDailyActiveUser`)가 적혀 있습니다. 이 팀은 옛 배치를 이 저장소로 옮기는 중이라 모델마다 이런 주석을 남깁니다. 맨 아래 `select` 가 표를 만드는 실제 로직입니다. 시간 단위 표 `agg_hourly_active_user` 에서 실행 날짜(`run_date`)의 행만 읽어 사용자 번호, 클라이언트 종류, 앱 버전, OS 버전, 기기 모델이 같은 행을 하루에 한 줄로 묶고 실행 날짜를 `created_date` 에 적습니다.

SQL 을 돌리는 순서는 `source(...)` 와 `ref(...)` 가 정합니다. 둘 다 SQL 안에서 다른 표를 부르는 자리로 `source` 는 원천 표를 부르고 `ref` 는 다른 dbt 모델이 만든 표를 부릅니다. 이 모델은 `source` 로 `agg_hourly_active_user` 를 읽으므로 그 표가 먼저 만들어져야 합니다. 도구는 이 관계를 읽어 Airflow 태스크 2개를 만들고 앞 태스크에서 뒤 태스크로 화살표를 그어 연결하므로 사람이 순서를 따로 적지 않습니다. 이 저장소에서는 Cosmos 라는 부품이 dbt 모델을 읽어 Airflow 태스크로 바꾸는 이 일을 맡습니다. 태스크가 돌 때 SQL 은 Kyuubi 를 거쳐 Spark 에서 실행되는데, Spark 가 클러스터의 어느 노드(클러스터를 이루는 서버 한 대)에서 도는지는 [Hadoop, Hive, Spark](post.html?id=hadoop-hive-spark-roles) 편에 있습니다.

SQL 모델 수백 장은 다시 3개 층으로 나뉩니다. 원천에 가까운 staging 층과 쓸모 있게 묶은 mart 층은 모델 수가 비슷하게 많고 밖으로 내보내는 serving 층이 가장 적습니다. 둘째 달에 새로 온 사람은 2절의 카테고리 수급을 이 층들로 연결했습니다. 수급한 원본을 읽어 정리한 표를 만들고 원본 파일이 바뀌었는지 확인하는 매크로를 붙였습니다. 매크로는 여러 모델이 함께 쓰도록 dbt 에서 함수처럼 만들어 둔 SQL 조각입니다. 다섯째 달과 여섯째 달에도 이 폴더를 가장 많이 바꿨는데, 시청 품질 표와 광고 타겟팅 표를 여기서 만들었습니다.

## 4. Airflow 태스크를 실행하는 부품, 오퍼레이터

**오퍼레이터는 Airflow 태스크 하나가 실제로 하는 일을 담은 파이썬 클래스입니다. 이 팀은 오퍼레이터를 10개 넘게 직접 만들었습니다. 새로 온 사람의 넷째 달 커밋은 오퍼레이터 폴더와 Spark 폴더에 몰려 있습니다.**

Airflow 는 「몇 시에 무엇을 하라」만 알 뿐 실제로 SQL 을 보내거나 파일을 옮기지는 않습니다. 그 일은 태스크마다 붙은 오퍼레이터가 맡는데, Airflow 가 기본으로 주는 표준 오퍼레이터로 다룰 수 없는 상대가 있으면 팀이 오퍼레이터를 직접 만듭니다. 이 팀이 만든 오퍼레이터와 각 오퍼레이터가 접속해 일을 시키는 상대는 아래 표와 같습니다.

| 오퍼레이터 | 말을 거는 상대 | 무엇을 하나 |
|---|---|---|
| spark | 클러스터 (YARN) | Scala 로 만든 Spark 배치를 자원 설정과 함께 띄움 |
| kyuubi | Kyuubi | SQL 을 보내 Spark 에서 돌림. dbt 모델이 이 길을 탐 |
| distcp | 다른 클러스터의 HDFS | 파일을 클러스터 사이로 복사 |
| hdfs sensor, hdfs clean | HDFS | 파일이 생겼는지 기다림. 오래된 파티션을 지움 |
| iceberg maintenance | Iceberg 테이블 | 스냅샷 정리, 작은 파일 합치기 |
| http, jdbc, kafka, mysql, mssql | 외부 API, 운영 DB, 토픽 | 원천에서 읽어 오는 수급 여러 종 |

표에 처음 나오는 이름 몇 개를 풀어 둡니다. YARN 은 클러스터의 CPU 와 메모리를 작업마다 나눠 주는 프로그램입니다. distcp 는 HDFS 의 파일을 다른 클러스터로 복사하는 도구를 가리킵니다. Iceberg 는 테이블이 바뀔 때마다 그 시점의 상태를 스냅샷으로 남겨 두는 테이블 형식입니다. 마지막 줄의 jdbc 는 Java 프로그램이 DB 에 접속하는 표준 방식입니다. mysql 과 mssql 은 운영 DB(서비스가 지금 읽고 쓰는 DB)로 쓰는 DB 제품입니다. kafka 는 메시지를 토픽에 쌓아 두고 여러 팀이 읽어 가게 하는 시스템을 말합니다. 네 번째 카드는 Airflow 태스크가 오퍼레이터를 거쳐 상대 시스템에 닿는 길을 보여 줍니다.

<div class="demo-embed-wrap">
<iframe class="demo-embed" src="demo-de-first-months.html?embed=1&card=operator" height="500" loading="lazy" title="Airflow 의 실행 부품, 오퍼레이터"></iframe>
<a class="demo-embed-open" href="demo-de-first-months.html" target="_blank" rel="noopener">↗ 카드 여섯 장 전체로 열기</a>
</div>

표의 마지막 줄은 원천에서 데이터를 읽어 오는 수급 오퍼레이터들입니다. 2절의 YAML 에 `type: hbase` 처럼 원천 종류를 적으면 DAG 를 만드는 코드가 이 가운데 맞는 오퍼레이터를 골라 태스크로 만듭니다. 새로 온 사람은 넷째 달에 여기에 오퍼레이터 하나를 추가했습니다. 다른 클러스터의 HDFS 에서 파일을 가져오는 오퍼레이터를 만들어 파일이 생겼는지 확인하는 센서를 붙였고 값을 옮길 때 형식을 검사하는 로직은 공통 코드로 따로 뺐습니다. 그 달의 커밋은 이 오퍼레이터 폴더와 Spark 폴더에 몰려 있습니다.

Spark 는 여러 서버에 데이터를 나눠 계산하는 엔진이지만 이 저장소에서는 계산 엔진이라기보다 데이터를 읽고 쓰는 커넥터로 쓰입니다. Spark 폴더의 Scala 파일 수십 개는 HTTP, JDBC, Kafka, HDFS 에서 데이터를 읽어 Hive 테이블(HDFS 의 파일을 SQL 로 읽을 수 있게 등록해 둔 테이블)에 쓰는 코드입니다. 그 안에서 성능을 조절하는 설정은 찾아봐도 거의 없습니다. 파티션 수를 바꾸는 `repartition`, 작은 표를 모든 서버에 복사해 조인을 빠르게 하는 `broadcast`, 계산한 결과를 저장해 두고 다시 쓰는 `persist` 가 하나도 없고 CPU 와 메모리 같은 자원도 오퍼레이터의 기본값 그대로입니다. 유일한 조절은 SQL 힌트 `repartition(N)` 인데 이 힌트도 출력 파일 개수를 정합니다. SQL 힌트는 SQL 안에 `/*+ … */` 꼴의 주석으로 적어 엔진에 실행 방법을 알려 주는 표시입니다. 3절 모델의 `select` 바로 뒤에 붙은 `/*+ repartition(12) */` 가 이 힌트로, 그 표를 출력 파일 12개로 쓰게 합니다.

오퍼레이터 층에서 새로 온 사람이 하는 일의 종류가 바뀝니다. 첫 두 달에는 팀이 만든 부품 위에서 YAML 과 SQL 을 썼지만 넷째 달부터는 그 부품 자체를 고치기 시작해 남이 쓸 부품을 만드는 일로 한 단계 올라갔습니다.

## 5. 셋째 달에 처음부터 끝까지 만든 실시간 잡

**셋째 달의 어느 하루에 시청 품질 로그를 초 단위로 받아 묶는 실시간 잡의 커밋 여러 개가 Flink 폴더로 한꺼번에 들어갔습니다. 로그가 있는 원천 저장소에 맞는 소스 커넥터가 없어 Java 클래스를 처음부터 직접 만들었습니다.**

2절과 3절의 배치는 하루에 한 번 표를 만들지만 이 잡은 로그가 들어오는 대로 받아 같은 재생 건(영상 재생 한 번)의 로그끼리 묶어 내보냅니다. 로그는 생긴 순서대로 도착하지 않으니 잡은 10초를 기다렸다가 묶습니다. 그보다 더 늦게 온 로그는 정해진 시간까지 더 받아 차이만 다시 내보냅니다.

Flink 는 들어오는 데이터를 바로 처리하는 엔진입니다. 이 잡은 Flink 위에서 쉬지 않고 돌며 시청 품질 로그(코드의 `QoeEvent`)를 처리합니다. QoE 는 시청자가 느끼는 품질을 뜻하는 Quality of Experience 의 줄임말입니다. 원천 저장소는 로그가 처음 쌓이는 저장 시스템입니다. 소스 커넥터는 그 원천에서 데이터를 읽어 잡에 넣어 주는 코드를 말합니다. 아래는 이 잡의 본문을 줄인 코드입니다. 클래스 이름과 주석은 바꿨습니다. 로그를 받아 시각을 붙이는 `buildSource` 와 로그를 걸러 묶는 `process` 가 어떻게 나뉘는지, 늦게 온 로그를 어디서 다루는지 보려고 가져왔습니다.

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

다섯 번째 카드에서는 시청 로그가 소스 커넥터를 지나 Flink 잡 안에서 묶인 뒤 밖으로 나가는 차례가 보입니다.

<div class="demo-embed-wrap">
<iframe class="demo-embed" src="demo-de-first-months.html?embed=1&card=flink" height="500" loading="lazy" title="들어오는 대로 받아 묶는 실시간 잡"></iframe>
<a class="demo-embed-open" href="demo-de-first-months.html" target="_blank" rel="noopener">↗ 카드 여섯 장 전체로 열기</a>
</div>

코드에서는 워터마크, 윈도우, `allowedLateness` 3가지가 낯섭니다. 워터마크는 「이 시각까지의 로그는 다 왔다고 보는 선」입니다. 여기서 로그 시각으로는 `withTimestampAssigner` 가 붙인 `logTime`, 곧 로그가 생긴 시각을 씁니다. `forBoundedOutOfOrderness(Duration.ofSeconds(10))` 은 지금까지 받은 가장 늦은 로그 시각에서 10초를 뺀 자리에 그 선을 긋는다는 뜻입니다. 로그가 순서대로 오지 않아서 이 설정으로 10초만큼 늦게 오는 로그까지 기다립니다. `withIdleness(Duration.ofSeconds(120))` 은 소스가 나눠 읽는 갈래(파티션) 하나에서 120초, 다시 말해 2분 동안 로그가 없으면 선을 그을 때 그 갈래를 기다리지 않는다는 뜻입니다.

`process` 에서는 주석에 적힌 대로 어뷰저(서비스를 부정하게 쓰는 사용자)의 로그를 거르는 `filter`, 플랫폼 값을 붙이는 `map`, 진입점 규칙으로 로그를 분류하는 `map` 이 차례로 돕니다. 그다음 `keyBy` 로 재생 건(`transactionId`), 미디어(`mediaId`), 미디어 종류(`mediaType`)가 모두 같은 로그를 한 키로 모읍니다. 윈도우는 로그를 시간으로 나눠 담는 칸입니다. `TumblingEventTimeWindows` 는 로그 시각을 설정에서 읽은 길이(`getWindowSizeMs`)의 칸으로 겹치지 않게 나눕니다. 같은 키의 로그 가운데 같은 칸에 든 로그는 `QoeTransactionMergeFunction` 이 하나로 합칩니다.

워터마크가 윈도우의 끝을 지나야 그 윈도우가 닫히므로 어떤 윈도우를 닫으려면 그 윈도우의 끝 시각보다 로그 시각이 10초 이상 늦은 로그가 들어와야 합니다. `allowedLateness` 는 이렇게 윈도우가 닫힌 뒤에도 늦게 온 로그를 얼마 동안 더 받을지 정합니다. 앞에서 「정해진 시간까지 더 받는다」고 한 시간이 이 값입니다. 이 값은 설정 파일에서 읽어 오는데 처음 정한 값을 나중에 줄였습니다.

이 잡이 만들어진 과정은 커밋 순서에 남아 있습니다. 새로 온 사람은 셋째 달 초까지 수급 일을 하다가 어느 하루에 커넥터, 설정 파싱(설정 파일을 읽어 값으로 바꾸는 코드), 처리 구조, Kafka sink, 로컬 테스트용 sink 를 한꺼번에 올렸습니다. sink 는 잡이 처리한 결과를 내보내는 곳입니다. 며칠 뒤에는 live(생방송)와 vod(주문형 비디오)를 나누는 로직, sink 여러 개, 직렬화(데이터를 보내거나 저장할 수 있는 바이트로 바꾸는 일) 문제 수정, HDFS sink 가 붙었습니다. 그 달의 커밋은 거의 전부 Flink 폴더에 있습니다. Flink 커밋은 다음 달에 줄었고 그 뒤로는 이 잡의 결과를 받는 dbt 모델 폴더로 커밋이 옮겨 갔습니다.

잡의 Java 파일 가운데 절반 넘게가 커넥터입니다. 팀이 쓰는 원천 저장소에서 Flink 로 읽어 오는 표준 커넥터가 없었기 때문에 새로 온 사람은 읽을 구간을 나누는 클래스, 실제로 읽는 클래스, 읽은 데이터를 풀어 쓰는 클래스를 모두 직접 만들었습니다. 새로 온 사람이 쓴 코드 가운데 가장 깊은 코드가 이 커넥터입니다. 다만 팀 전체로 보면 Flink 층의 비중은 작습니다. 실시간 잡은 이 잡 하나뿐이고 팀의 일감 목록에서도 Flink 는 드물게 보입니다. 토픽에서 데이터를 읽어 가는 프로그램을 컨슈머라고 부르는데, 컨슈머가 어떻게 생겼는지는 [Kafka 기초](post.html?id=kafka-log-pipeline) 편에 있습니다.

## 6. 코드가 서버에 닿는 길, PR 과 리뷰와 배포

**새로 온 사람의 커밋 사이에는 「리뷰 반영」 커밋이 여섯 달 내내 끼어 있습니다. 팀에서 코드를 합치는 머지에는 거의 예외 없이 사람의 승인이 붙어 있습니다. 여섯 달이 지난 뒤의 첫 일로는 Java 프로그램을 파일 하나로 묶은 jar 의 배포를 workflow 로 자동화했습니다.**

이 팀에서는 코드를 고쳐도 바로 서버에 올리지 않습니다. 고친 코드는 먼저 PR(pull request)로 올립니다. PR 은 고친 코드를 기본 브랜치에 합쳐 달라는 요청입니다. 기본 브랜치는 팀이 배포하는 코드가 있는 줄기로 이 저장소에서는 main 입니다. PR 이 올라오면 동료가 읽고 의견을 답니다. 쓴 사람이 그 의견대로 고쳐 다시 올린 커밋이 「리뷰 반영」 커밋입니다. 리뷰를 거친 PR 을 기본 브랜치에 합치는 일은 머지라고 부릅니다. PR 이 머지되면 배포가 자동으로 돕니다. 새로 온 사람은 여섯 달을 넘기며 이 가운데 마지막 단계인 자동 배포를 만들었습니다.

아래는 Flink 잡을 배포하는 workflow 의 앞부분입니다. 이 workflow 는 맨 위 주석에 적힌 대로 jar 와 진입점 규칙 파일을 HDFS 에 올립니다. 배포가 언제 도는지 적은 `on:` 아래를 보려고 가져왔습니다.

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

여섯 번째 카드는 고친 코드가 리뷰와 머지를 지나 서버에 닿기까지의 길을 그립니다.

<div class="demo-embed-wrap">
<iframe class="demo-embed" src="demo-de-first-months.html?embed=1&card=ship" height="500" loading="lazy" title="코드가 서버에 닿는 길"></iframe>
<a class="demo-embed-open" href="demo-de-first-months.html" target="_blank" rel="noopener">↗ 카드 여섯 장 전체로 열기</a>
</div>

`on:` 아래에는 배포가 도는 경우가 3가지 있습니다. `push` 는 main 에 머지되면 prod(실제 서비스가 쓰는 환경)로 배포하는 경우입니다. `pull_request` 는 PR 이 열리거나(`opened`) 새 커밋이 올라오거나(`synchronize`) 라벨이 붙을 때(`labeled`) 도는데, PR 에 flink 라벨이 붙으면 test(시험 환경)로 배포되어 머지하기 전에 잡을 돌려 볼 수 있습니다. `workflow_dispatch` 는 사람이 손으로 돌리는 경우로 `target` 에서 test 와 prod 가운데 하나를 고릅니다. prod 로 올릴 때 입력해야 하는 확인 문구 `deploy-prod` 는 실수로 prod 배포를 누르는 일을 막는 장치입니다. 이 workflow 가 생기기 전에는 jar 를 빌드(소스 코드를 실행할 수 있는 파일로 만드는 일)해 서버에 손으로 올렸습니다.

커밋 기록을 보면 이 팀의 리뷰는 형식적인 절차가 아닙니다. 「리뷰 반영」 커밋은 첫 PR 부터 있었고 여섯 달 동안 곳곳에 흩어져 있습니다. 버전만 올리는 단순한 PR 은 승인 몇 개로 끝났지만 시청 품질 표를 다른 조회 시스템으로 옮기는 PR 에는 여러 사람이 붙어 코멘트가 길게 오갔습니다. 팀 전체로 봐도 기본 브랜치에 머지된 PR 에는 거의 예외 없이 사람의 승인이 붙어 있습니다.

배포 전에 자기 컴퓨터(로컬)에서 돌리는 검사도 있습니다. 파이썬 테스트 도구 pytest 가 DAG 파일을 전부 불러와 DAG 가 오류 없이 만들어지는지 확인하고 같은 SQL 모델을 DAG 2개가 함께 돌리지 않는지도 확인합니다. 고치기 전의 DAG 모양을 저장해 두었다가 고친 뒤의 모양과 비교해 무엇이 바뀌었는지 보여 주는 테스트도 있습니다. 새로 온 사람의 둘째 커밋 제목이 「수급 DAG 테스트」였는데, 그 커밋도 이런 배포 전 검사에 들어가는 테스트였습니다.

## 7. 여섯 달을 정리한 달별 표

**달마다 가장 많이 고친 폴더를 표 하나에 모으면 첫 달 수급, 둘째 달 SQL 모델, 셋째 달 Flink, 넷째 달 부품, 다섯째와 여섯째 달 다시 SQL 모델, 그 뒤 배포로 층을 하나씩 올라간 것이 보입니다.**

아래 표는 지훈 씨가 처음에 커밋을 달별로 늘어놓아 만든 표입니다. 달마다 가장 많이 바꾼 폴더와 그 달에 한 일을 적었고 정확한 커밋 개수는 적지 않았습니다.

| 달 | 가장 많이 바꾼 폴더 | 무엇을 했나 |
|---|---|---|
| 첫 달 | 수급 DAG, SQL 모델 | 카테고리 목록 수급 DAG 둘. 파티션, 스키마, 계정 손보기 |
| 둘째 달 | SQL 모델, 수급 DAG | 수급을 변환까지 잇기. 센서, 파일 변경 매크로, 이름 규칙 테스트 |
| 셋째 달 | Flink | 실시간 잡 골격과 소스 커넥터. 하루에 몰아서 들어옴 |
| 넷째 달 | Flink, 오퍼레이터, Spark | HDFS 수급 오퍼레이터와 센서. 형식 검사 공통화 |
| 다섯째 달 | SQL 모델, Spark | 시청 품질 표 정의. 시간별과 일별 내보내기 DAG. 진입점 분류 규칙 |
| 여섯째 달 | SQL 모델, DAG, 도메인 규칙 | 정점. 광고 타겟팅 표, 개인정보 컬럼 제거, 입수 주기 조정 |
| 그 다음 달 | SQL 모델, Flink, CI | 늦은 로그 처리 손보기, jar 자동 배포, 라이브 카테고리 이력 수급 |

표의 CI(continuous integration)는 코드가 올라올 때마다 검사와 빌드를 자동으로 돌리는 설정입니다. 여섯 달의 커밋을 폴더별로 합쳐 다시 세면 SQL 모델 폴더가 가장 많습니다. Flink 와 DAG 폴더가 그다음으로 많고 Spark, 도메인 규칙, 오퍼레이터 폴더는 적습니다. 일감을 적은 티켓 하나에는 커밋이 여러 개씩 붙었습니다.

표에서는 2가지를 읽을 수 있습니다. 첫째, 일하는 속도는 두 달 만에 붙었습니다. 첫 달에 몇 개뿐이던 커밋이 둘째 달에 몇 배로 늘었고 그 뒤로는 매달 둘째 달 수준을 넘었습니다. 둘째, 커밋이 가장 많은 정점은 새 층에 처음 들어간 달이 아니라 그 층을 익힌 뒤에 옵니다. Flink 를 처음 만진 셋째 달보다 그 잡의 결과를 표로 만든 여섯째 달에 커밋이 훨씬 많았습니다. 새것을 배우는 달에는 커밋이 적고 배운 것으로 무언가를 만드는 달에 커밋이 많습니다.

## 8. 새로 온 사람이 하는 일 5가지

**새로 온 사람이 하는 일은 수급 하나를 원천부터 표까지 내기, SQL 모델 하나 쓰기, 오퍼레이터 하나 만들기, 실패한 배치 복구, 배포와 인프라 일감 받기의 5가지입니다. 앞의 4가지는 이 글에서 봤지만 다섯째는 이 저장소 밖에 있습니다.**

새로 온 사람은 첫 여섯 달 동안 「데이터를 가져와 표로 만들어 놓는 길」을 한 층씩 직접 거칩니다. 남이 만든 부품을 쓰는 데서 시작해 그 부품을 고치는 일로 올라갑니다. 아래 표에 그 일 5가지와 각각 알아야 하는 것, 이 글에서 다룬 절을 모았습니다.

| 하는 일 | 알아야 하는 것 | 이 글의 절 |
|---|---|---|
| 수급 하나를 원천부터 표까지 낸다 | 원천 종류와 접속, 이름 규칙, 스케줄과 다시 돌리기 | 2절 |
| SQL 모델 하나를 쓴다 | source 와 ref, config, 옛 표와 값 대조, 머리말 남기기 | 3절 |
| 오퍼레이터 하나를 만든다 | Airflow 의 Hook 과 Operator, 상대 시스템의 접속 방식 | 4절 |
| 실패한 배치를 혼자 복구한다 | 로그 읽기, 어느 날짜부터 다시 돌리나, 다시 돌려도 같은 결과가 나오나 | 2~3절 |
| 배포와 인프라 일감을 받는다 | PR 과 리뷰, workflow, 이미지 취약점 조치, Kubernetes 배포 | 6절 |

표의 Hook 은 Airflow 에서 외부 시스템에 접속하는 일을 맡는 부품입니다. 인프라는 프로그램이 도는 서버와 배포 환경을 말합니다. 이미지 취약점 조치는 프로그램과 실행 환경을 함께 담은 컨테이너 이미지에서 보안 취약점을 찾아 고치는 일입니다. Kubernetes 는 컨테이너를 여러 서버에 띄우고 관리하는 시스템입니다.

표의 넷째 줄인 실패한 배치 복구는 커밋에 잘 남지 않습니다. 배치가 새벽에 실패하면 로그를 읽어 원인을 찾고 며칠 치를 다시 돌려야 하는지 정한 뒤 다시 돌려도 결과가 같은지 확인합니다. 다시 돌려도 결과가 같아야 하므로 이 저장소의 SQL 모델은 3절 모델의 `partition_by=['created_date']` 처럼 날짜로 파티션을 나누고 돌릴 때마다 그 날짜의 파티션만 덮어씁니다. 그래서 같은 날짜를 두 번 돌려도 표의 행이 두 배가 되지 않습니다.

다섯째 줄의 배포와 인프라 일감은 다른 저장소에 있습니다. 그 저장소에서는 Airflow 이미지 빌드, Kubernetes 배포, argo-cd(저장소에 적힌 설정대로 Kubernetes 에 배포해 주는 도구) 설정을 다룹니다. 새로 온 사람이 그 저장소에 처음 올린 커밋은 argo-cd 초기 설정이었습니다.

지훈 씨가 이 팀으로 옮길지 고민한다면 위 표에 없는 것까지 봐야 합니다. 데이터 분석과 모델 학습에 쓰는 파이썬 라이브러리 pandas, scikit-learn, PyTorch 를 저장소에서 찾아보면 하나도 나오지 않고 Spark 도 파이썬으로 쓰는 PySpark 가 아니라 Scala 로 쓰여 있습니다. 이 팀에는 모델을 만드는 자리가 없습니다. 이 팀으로 옮기면 파이썬, Docker(컨테이너 이미지를 만들고 띄우는 도구), Kubernetes, Spark, Airflow 는 그대로 가져가 쓰고 모델 학습은 두고 갑니다. 새로 배울 것 가운데 가장 큰 일은 dbt 문법이 아니라 데이터 모델링입니다. 데이터 모델링은 어느 표를 원본으로 두고 어느 표를 묶은 것으로 둘지, 어제 값과 오늘 값을 어떻게 함께 둘지 정하는 일입니다.

## 한눈 정리

| 질문 | 한 줄 답 |
|---|---|
| 저장소는 몇 층인가 | 4개 층. 수급 DAG, SQL 모델, 오퍼레이터와 Spark, Flink 실시간 |
| 새로 온 사람의 첫 커밋은 | 표 하나를 매일 끌어오는 DAG. 파이썬 10여 줄과 YAML 20줄쯤 |
| 왜 그 두 파일에 커밋이 수십 개 붙나 | 원천 접속, 이름 규칙, 스케줄, 배포 길을 처음 거치느라 규칙마다 한 번씩 걸린다 |
| dbt 모델이 무엇인가 | SQL 파일 하나가 표 하나. 순서는 source 와 ref 를 보고 도구가 매긴다 |
| 오퍼레이터가 무엇인가 | Airflow 태스크가 실제로 하는 일을 담은 클래스. 이 팀은 열 개 넘게 직접 만들었다 |
| Spark 는 무엇을 하나 | 계산 엔진이 아니라 읽고 쓰는 커넥터. 성능 조절 설정이 거의 없다 |
| 실시간 잡은 무엇이 다른가 | 하루 한 번이 아니라 들어오는 대로. 워터마크로 조금 기다리고 늦은 것은 따로 받는다 |
| 코드는 어떻게 서버에 가나 | PR, 리뷰, 머지, workflow 자동 배포. 머지에 거의 예외 없이 사람 승인 |
| 여섯 달의 순서는 | 첫 달 수급, 둘째 달 SQL 모델, 셋째 달 Flink, 넷째 달 부품, 다섯째와 여섯째 달 SQL 모델, 그 뒤 배포 |
| 모델을 만들던 사람이 옮기면 | 파이프라인 쪽은 그대로, 모델 쪽은 두고 간다. pandas 와 PyTorch 가 없다 |

## 헷갈리기 쉬운 점

- **DAG 는 데이터를 만들지 않습니다.** DAG 에는 작업의 순서와 시각만 적혀 있습니다. 표를 어떻게 만드는지는 SQL 모델을 봐야 압니다.
- **수급 하나는 YAML 한 장으로 정해집니다.** 파이썬 파일에는 그 YAML 을 언제 돌릴지만 적혀 있으니 원천을 바꾸려면 YAML 을 봅니다.
- **dbt 모델을 돌리는 순서는 사람이 적지 않습니다.** 순서는 SQL 안의 source 와 ref 에서 나옵니다. 순서를 SQL 밖에 따로 적어 두면 SQL 의 순서와 따로 적은 순서가 서로 달라집니다.
- **Spark 폴더에서 성능 튜닝을 찾지 않습니다.** 이 저장소의 Spark 는 데이터를 읽고 쓰는 커넥터로 쓰입니다. 하나 있는 `repartition(N)` 힌트도 출력 파일 개수를 정합니다.
- **워터마크는 기다리는 시간이 아니라 기준이 되는 선입니다.** 로그 시각보다 조금 늦게 긋는 이 선이 윈도우의 끝을 지나면 윈도우가 닫힙니다. 윈도우가 닫힌 뒤에 그 윈도우의 로그가 도착하면 그 로그가 늦은 로그입니다.
- **커밋이 적은 달에도 일은 했습니다.** 새 층에 들어간 달에는 커밋이 적고 그 층으로 무언가를 만드는 달에 커밋이 많습니다.
- **PR 라벨이 배포를 켜는 스위치일 수 있습니다.** 이 저장소에서는 PR 에 flink 라벨을 붙이면 test 배포가 돌기 때문에 라벨을 장식으로 붙이지 않습니다.
- **저장소 하나에 팀의 일이 다 있지는 않습니다.** 이미지와 Kubernetes 배포는 다른 저장소에 있으므로 인프라 일감은 그 저장소에서 셉니다.

## 더 깊이 보기

- 카드 여섯 장을 한 페이지에서 보려면 [데이터 엔지니어 첫 6개월 카드 여섯 장](demo-de-first-months.html)이 있습니다. 카드를 누르면 층마다 헷갈리는 것 하나가 더 나옵니다.
- 2절의 수급이 여덟 방법 중 어디인지는 [데이터 건네기](post.html?id=data-handoff-methods) 편입니다. DB 배치와 파일 카드가 그 자리입니다.
- 3절의 SQL 이 Kyuubi 를 거쳐 어느 노드에서 도는지는 [Hadoop, Hive, Spark](post.html?id=hadoop-hive-spark-roles) 편에 있습니다.
- 5절의 잡이 읽는 토픽과 늦게 오는 로그는 [Kafka 기초](post.html?id=kafka-log-pipeline) 편입니다.
- 원본, 정제, 마트 세 층으로 표를 나누는 이유는 [데이터 파이프라인 설계](post.html?id=data-pipeline-design) 편에 있습니다.
