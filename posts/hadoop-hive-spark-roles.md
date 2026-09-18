지훈 씨가 일곱째 주에 쿼리 하나를 돌렸습니다. 하루치 클릭 로그에서 광고별 클릭 수를 세는 것이었습니다. 20분이 지나도 끝나지 않았습니다. 옆자리 선배가 화면을 보고 말했습니다. "그건 Hive 말고 Spark 로 돌리세요."

지훈 씨는 시키는 대로 했습니다. 같은 테이블, 같은 SQL 이었고 접속한 클러스터도 같았습니다. 그런데 3분 만에 끝났습니다. 무엇이 달라진 것인지 몰랐습니다. 두 도구가 서로 다른 서버에 있는 것인지, 데이터를 두 벌 갖고 있는 것인지 알 수 없었습니다. 같은 자리에서 다른 프로그램이 도는 것인지도 그림이 그려지지 않았습니다.

**같은 클러스터, 같은 테이블인데 Hive 와 Spark 는 어디가 다른가요?**

노드를 넷으로 나누고 워커 노드 한 대를 세로로 잘라 보면 답이 보입니다. 층이 셋입니다. 1층 저장과 2층 자리 배분은 둘이 같이 쓰고, 다른 것은 3층에서 도는 프로그램뿐입니다. 이것을 알면 「Hive 로 돌린다」와 「Spark 로 돌린다」가 무엇을 바꾸는 말인지 알게 됩니다. 데이터 팀이 하는 말의 절반이 그림으로 들립니다.

> **한 줄 요약:** Hadoop 은 아래 두 층(HDFS 저장, YARN 자리 배분)의 이름이고, Hive 와 Spark 는 그 위 3층에서 도는 프로그램입니다. 둘은 같은 워커 노드에서 같은 조각을 읽습니다. 만나는 자리는 Metastore 목록과 HDFS 파일입니다.

> **골라 읽는 법** — 절이 8개인 글입니다. 절마다 카드 한 장이 들어 있어 카드만 보고 넘어가도 됩니다.
>
> - 노드 넷과 층 셋만 → 1~2절
> - Hadoop 이 무엇인지 → 3절
> - Hive 의 길과 Spark 의 길 → 4~5절
> - 둘이 만나는 자리 → 6절
> - 무엇을 언제 쓰나, 이름표 정리 → 7~8절

이 글의 서버 이름, 컨테이너 수, 시간은 설명을 위한 가상 값입니다. 하루 클릭 228만 건은 이 트랙의 앞 글들과 같은 값입니다. 카드 속 색은 넷입니다. 파랑은 저장(HDFS)이고 벽돌색은 자리 배분(YARN)입니다. 먹색은 Hive 와 Tez(질의를 잘게 나눠 돌리는 실행 엔진) 이고 회색은 Spark 와 그 밖의 엔진입니다.

---

## 1. 노드는 넷으로 나뉩니다

**노드는 서버 한 대입니다. 내가 앉는 엣지, 목록과 자원을 쥔 마스터, SQL 을 받는 서비스, 데이터를 갖고 계산하는 워커 넷으로 나뉩니다.**

쉽게 말하면 클러스터는 서버 수십에서 수백 대이고, 그 서버 한 대를 노드라고 부릅니다. Hadoop, Hive, Spark 는 프로그램 이름이고, 노드는 그 프로그램이 도는 자리입니다. 어떤 프로그램이 도는지에 따라 노드를 넷으로 나눕니다.

엣지 노드는 지훈 씨가 접속해 명령을 치는 서버입니다. beeline 이나 spark-submit 을 여기서 칩니다. 데이터도 계산도 없습니다. 마스터 노드에는 HDFS 의 NameNode 와 YARN 의 ResourceManager 가 돕니다. 앞은 파일이 어디에 있는지 적어 둔 서버이고, 뒤는 일감을 어느 서버에 줄지 정하는 서버입니다. 파일 조각이 어디 있나, 자원을 누구에게 주나를 정합니다. 서비스 노드에는 HiveServer2 와 Metastore 가 돕니다. 앞은 질의를 받아 주는 문 역할의 서버이고, 뒤는 표가 어디에 어떤 모양으로 있는지 적어 둔 곳입니다. SQL 을 받고 테이블 목록을 듭니다. 워커 노드는 가장 많습니다. 한 대에 DataNode 와 NodeManager 두 역할이 같이 있습니다. 앞은 파일 조각을 담고 뒤는 일감을 돌립니다. 그래서 데이터를 갖고 있는 자리에서 계산합니다.

<div class="demo-embed-wrap">
<iframe class="demo-embed" src="demo-cluster-roles.html?embed=1&card=nodes" height="480" loading="lazy" title="노드는 넷으로 나뉜다"></iframe>
<a class="demo-embed-open" href="demo-cluster-roles.html" target="_blank" rel="noopener">↗ 카드 여섯 장 전체로 열기</a>
</div>

지훈 씨가 「Hive 로 돌린다」고 할 때 실제로 일어나는 일은 이렇습니다. 엣지 노드에서 서비스 노드로 SQL 이 갑니다. 서비스 노드가 마스터 노드에 자리를 받아 워커 노드에서 계산합니다. 「Spark 로 돌린다」도 이 넷을 지납니다. 다른 것은 서비스 노드 자리에 무엇이 서느냐입니다.

## 2. 워커 한 대를 잘라 보면 층이 셋입니다

**워커 노드 한 대에는 저장, 자리 배분, 실행 세 층이 쌓여 있습니다. Hive 와 Spark 의 차이는 맨 위층의 프로그램뿐입니다.**

쉽게 말하면 맨 아래 디스크에 데이터 조각이 있고, 그 위에서 YARN 이 CPU 와 메모리 자리를 내줍니다. 맨 위에서 Hive 조각과 Spark 조각이 그 자리를 받아 돕니다. 1층과 2층은 늘 켜져 있고, 3층은 작업이 있을 때만 생기고 끝나면 사라집니다.

1층은 DataNode 입니다. 하루치 클릭 로그 705 MB 가 128 MB 조각 여섯 개로 나뉘어 여러 워커의 디스크에 세 벌씩 놓여 있습니다. 2층은 NodeManager 입니다. 이 서버의 CPU 와 메모리를 칸으로 나눠 위층에 내줍니다. 그 칸을 컨테이너라고 부릅니다. 3층은 컨테이너 안에서 도는 프로그램입니다. Hive 쿼리의 조각은 Tez 컨테이너로, Spark 작업의 조각은 executor 로 뜹니다. 둘이 같은 워커 위에 나란히 뜰 수 있습니다.

<div class="demo-embed-wrap">
<iframe class="demo-embed" src="demo-cluster-roles.html?embed=1&card=layers" height="480" loading="lazy" title="워커 한 대의 단면은 층이 셋"></iframe>
<a class="demo-embed-open" href="demo-cluster-roles.html" target="_blank" rel="noopener">↗ 카드 여섯 장 전체로 열기</a>
</div>

그림에서 파랑 점이 1층 조각에서 3층 컨테이너로 올라갑니다. Tez 컨테이너도 executor 도 같은 조각을 읽습니다. 지훈 씨의 쿼리가 Hive 에서 Spark 로 바뀌었을 때 1층과 2층은 아무것도 바뀌지 않았습니다. 3층에 뜨는 프로그램과 그 프로그램이 일하는 방식만 바뀌었습니다.

## 3. Hadoop 은 아래 두 층의 이름입니다

**Hadoop 은 HDFS 와 YARN 을 묶어 부르는 이름입니다. 저장과 자리 배분입니다. 계산 엔진 MapReduce 도 들어 있지만 요즘은 거의 안 씁니다.**

쉽게 말하면 「Hadoop 클러스터」는 「HDFS 로 저장하고 YARN 으로 자리를 나누는 서버 무리」입니다. Hive 도 Spark 도 그 위에 얹는 것이라 Hadoop 의 일부가 아닙니다. 그런데 셋을 한 묶음으로 부르는 일이 많아서 헷갈립니다.

Hadoop 에는 원래 계산 엔진이 하나 들어 있었습니다. MapReduce 입니다. 조각마다 계산하고(map), 중간 결과를 디스크에 쓰고, 모아서 다시 계산합니다(reduce). 단계마다 디스크를 거쳐서 느립니다. 그래서 Tez 와 Spark 같은 새 엔진이 나왔고, 요즘 Hive 는 대개 Tez 를 엔진으로 씁니다. 지훈 씨가 20분을 기다린 쿼리도 MapReduce 가 아니라 Tez 였을 가능성이 큽니다.

| 이름 | 어느 층 | 하는 일 | 늘 켜져 있나 |
|---|---|---|---|
| HDFS | 1층 저장 | 파일을 조각내어 워커 디스크에 세 벌씩 | 켜져 있음 (NameNode, DataNode) |
| YARN | 2층 자리 배분 | CPU 와 메모리를 컨테이너로 나눠 줌 | 켜져 있음 (ResourceManager, NodeManager) |
| MapReduce | 3층 엔진 | 옛 계산 방식. 단계마다 디스크 | 작업 동안만 |
| Tez | 3층 엔진 | Hive 의 기본 엔진. 단계 사이를 이어 감 | 작업 동안만 |
| Spark | 3층 엔진 | 중간 결과를 메모리에 두고 계산 | 작업 동안만 |

표에서 보이는 것이 있습니다. 1층과 2층은 늘 켜져 있고, 3층은 작업 동안만 있습니다. 「클러스터가 살아 있다」는 말은 1층과 2층이 살아 있다는 뜻입니다. 3층은 쿼리가 들어올 때마다 생깁니다.

## 4. Hive 는 SQL 을 받아 엔진에 시킵니다

**Hive 는 계산을 직접 하지 않습니다. HiveServer2 가 SQL 을 받아 계획을 세우고, Tez 컨테이너를 워커에 띄워 계산시키고, 결과를 모아 돌려줍니다.**

쉽게 말하면 늘 켜져 있는 HiveServer2 에 SQL 을 보냅니다. 그 서버가 목록을 묻고 자리를 받아 워커에 Tez 조각을 띄우고 결과를 모아 줍니다. 여러 사람이 같은 HiveServer2 를 씁니다.

길은 다섯 자리입니다. 지훈 씨가 엣지 노드에서 SQL 을 보내면 HiveServer2 가 받습니다. HiveServer2 는 Metastore 에 `adlog.ad_click` 의 컬럼과 파일 위치를 묻습니다. 그 다음 ResourceManager 에 자리를 달라고 합니다. 자리를 받으면 워커에 Tez 컨테이너를 띄웁니다. 컨테이너들이 각자 조각을 읽어 세고, 결과가 HiveServer2 로 모여 지훈 씨에게 돌아옵니다.

<div class="demo-embed-wrap">
<iframe class="demo-embed" src="demo-cluster-roles.html?embed=1&card=hive" height="500" loading="lazy" title="Hive SQL 한 건이 지나는 길"></iframe>
<a class="demo-embed-open" href="demo-cluster-roles.html" target="_blank" rel="noopener">↗ 카드 여섯 장 전체로 열기</a>
</div>

여기서 「Hive 는 엔진이 아니다」가 나옵니다. HiveServer2 는 SQL 을 읽고 계획을 세우는 프로그램이고, 세는 일은 Tez 가 합니다. 설정 하나로 엔진을 Spark 로 바꿀 수도 있습니다. 그래도 지훈 씨가 붙는 곳은 HiveServer2 이고 SQL 도 그대로입니다. ZooKeeper 는 서버들이 서로 누가 살아 있는지 맞추는 조정 서비스입니다. 접속 주소와 ZooKeeper 가 어떻게 얽히는지는 [Hadoop 과 Hive](post.html?id=hadoop-hive-basics) 편에 있습니다.

## 5. Spark 는 엔진이면서 코드로 씁니다

**Spark 는 작업마다 driver 하나를 띄우고, driver 가 자리를 받아 워커에 executor 를 띄웁니다. 늘 켜진 SQL 서버 대신 내 작업이 곧 서버입니다.**

쉽게 말하면 spark-submit 을 치면 driver 라는 계획 담당 프로세스가 하나 뜹니다. driver 가 목록을 묻고 자리를 받아 워커에 executor 를 띄우고, 조각을 시키고, 결과를 모읍니다. 작업이 끝나면 driver 도 executor 도 사라집니다.

Hive 와 다른 점이 둘 있습니다. 첫째, 상주 서버가 없습니다. HiveServer2 는 여러 사람의 SQL 을 받는 하나의 서버이지만, Spark 는 지훈 씨의 작업마다 driver 가 따로 뜹니다. driver 는 클라이언트 모드면 엣지 노드에, 클러스터 모드면 워커의 컨테이너 하나에 뜹니다. 둘째, SQL 만이 아닙니다. Spark SQL 로 같은 SQL 을 쓸 수도 있고, DataFrame 코드로 변환과 모델 학습까지 이어 쓸 수 있습니다.

<div class="demo-embed-wrap">
<iframe class="demo-embed" src="demo-cluster-roles.html?embed=1&card=spark" height="500" loading="lazy" title="Spark 작업 한 건이 지나는 길"></iframe>
<a class="demo-embed-open" href="demo-cluster-roles.html" target="_blank" rel="noopener">↗ 카드 여섯 장 전체로 열기</a>
</div>

지훈 씨의 쿼리가 3분에 끝난 이유도 여기 있습니다. Spark 는 단계 사이의 중간 결과를 메모리에 둡니다. 광고별로 세고 합치는 두 단계 사이에서 디스크를 거치지 않습니다. 다만 늘 Spark 가 빠른 것은 아닙니다. 메모리가 모자라면 디스크로 내려가고, driver 를 띄우는 데도 수십 초가 듭니다. 작은 쿼리는 Hive 쪽이 먼저 끝나는 일도 흔합니다.

## 6. 셋이 만나는 자리는 Metastore 와 HDFS 입니다

**Hive, Spark, Trino 는 같은 Metastore 목록을 보고 같은 HDFS 파일을 읽습니다. 그래서 「Hive 테이블」을 어느 엔진으로도 읽을 수 있습니다.**

쉽게 말하면 테이블 이름과 파일 위치는 Metastore 한 곳에만 적혀 있고, 파일은 HDFS 한 곳에만 있습니다. 엔진 셋은 그 목록을 읽고 그 파일을 읽습니다. 데이터를 두 벌 갖는 것이 아니라 읽는 프로그램이 셋인 것입니다.

지훈 씨가 Hive 에서 Spark 로 바꿨을 때 테이블 이름 `adlog.ad_click` 을 그대로 썼습니다. Spark 가 같은 Metastore 에 물어 같은 HDFS 경로를 받았기 때문입니다. Trino 도 같습니다. 다만 Trino 는 YARN 자리를 받지 않습니다. 자기 워커 서버가 따로 있고, Metastore 목록과 HDFS 파일만 빌려 씁니다. 그래서 Trino 에는 큐 이름이 없습니다.

<div class="demo-embed-wrap">
<iframe class="demo-embed" src="demo-cluster-roles.html?embed=1&card=shared" height="500" loading="lazy" title="셋이 만나는 자리는 목록과 파일"></iframe>
<a class="demo-embed-open" href="demo-cluster-roles.html" target="_blank" rel="noopener">↗ 카드 여섯 장 전체로 열기</a>
</div>

이 그림이 「Hive 테이블을 Spark 로 읽는다」는 말의 뜻입니다. Hive 가 테이블을 소유하는 것이 아닙니다. Metastore 에 적힌 목록을 Hive 가 처음 만들었을 뿐이고, 그 목록은 누구나 읽습니다. 팀 간에 테이블을 건네는 방법으로 권한만 주는 것이 되는 이유도 이것입니다. [데이터 건네기](post.html?id=data-handoff-methods) 편의 첫 카드가 그 이야기입니다.

## 7. 그래서 무엇을 언제 쓰나

**SQL 로 끝나는 일은 Hive 나 Spark SQL, 코드가 필요한 변환과 학습은 Spark, 빠른 대화형 조회는 Trino 입니다. 같은 쿼리도 엔진마다 워커에 뜨는 것이 다릅니다.**

쉽게 말하면 셋은 같은 데이터를 읽되 잘하는 일이 다릅니다. Hive 는 크고 오래 걸리는 SQL 을 안정적으로 끝냅니다. Spark 는 코드로 이어지는 일과 중간 결과가 많은 일에 빠릅니다. Trino 는 몇 초 안에 답이 와야 하는 조회에 맞습니다.

가상 데이터로 놓아 보겠습니다. 하루치 클릭 705 MB, 조각 여섯 개를 광고별로 세는 같은 쿼리입니다.

| 엔진 | 워커에 뜨는 것 | 자리는 어디서 | 이 쿼리에서 |
|---|---|---|---|
| Hive (Tez) | Tez 컨테이너 6개 + 합치기 1개 | YARN 큐 | 안정적. 중간 결과는 디스크와 메모리를 오감 |
| Spark | executor 3개, 태스크 6개 | YARN 큐 | 중간 결과를 메모리에. 두 단계 이상이면 유리 |
| Trino | Trino 워커 3대가 나눠 읽음 | 자기 서버 | 몇 초 안에 답. 큰 결과를 쓰는 일에는 안 맞음 |

이 표에서 「무엇이 빠른가」는 늘 같지 않습니다. 조각 여섯 개짜리 쿼리는 셋 다 금방 끝납니다. 차이는 단계가 많아질 때, 결과를 다시 테이블로 쓸 때, 사람이 기다리며 조회할 때 벌어집니다. 지훈 씨의 20분은 쿼리 자체보다 큐가 가득 차서 자리를 못 받은 시간이었을 수도 있습니다. 그것을 보는 곳은 ResourceManager 웹 화면입니다.

## 8. 이름표를 층으로 쌓으면

**Hadoop 은 아래 두 층의 이름이고, Tez 와 Spark 는 그 위의 엔진입니다. Hive 와 Spark SQL 은 사람이 쓰는 맨 위층입니다. Metastore 는 옆에서 공통 목록을 듭니다.**

쉽게 말하면 데이터 팀이 하는 말은 전부 이 그림의 어느 칸을 가리킵니다. 「Hadoop 위에서 Hive 를 쓴다」는 1층과 2층 위에 맨 위층이 있다는 말입니다. 「Spark 를 YARN 에서 돌린다」는 2층에서 자리를 받는 3층 엔진이 Spark 라는 말입니다.

<div class="demo-embed-wrap">
<iframe class="demo-embed" src="demo-cluster-roles.html?embed=1&card=names" height="500" loading="lazy" title="이름표를 층으로 쌓으면"></iframe>
<a class="demo-embed-open" href="demo-cluster-roles.html" target="_blank" rel="noopener">↗ 카드 여섯 장 전체로 열기</a>
</div>

Spark 만 두 층에 걸쳐 있습니다. 엔진이면서 사람이 쓰는 Spark SQL 과 DataFrame 도 갖습니다. Hive 는 엔진이 없어서 Tez 나 Spark 를 빌립니다. 그래서 「Hive on Spark」라는 말도 있고, 「Spark 로 Hive 테이블을 읽는다」는 말도 있습니다. 앞은 Hive 의 3층 엔진을 Spark 로 바꾼 것이고, 뒤는 Spark 가 Metastore 목록을 읽는 것입니다. 같은 낱말 둘이 다른 칸을 가리킵니다.

## 한눈 정리

| 질문 | 한 줄 답 |
|---|---|
| Hadoop 이 무엇인가 | HDFS 저장과 YARN 자리 배분, 아래 두 층의 이름 |
| Hive 와 Spark 는 Hadoop 의 일부인가 | 아닙니다. 그 위 3층에서 도는 프로그램입니다 |
| 노드는 어떻게 나뉘나 | 엣지, 마스터, 서비스, 워커 넷 |
| 워커 한 대에 무엇이 있나 | 1층 DataNode, 2층 NodeManager, 3층 작업 동안만 뜨는 컨테이너 |
| Hive 는 계산을 하나 | 아닙니다. HiveServer2 가 계획을 세우고 Tez 컨테이너가 셉니다 |
| Spark 의 driver 는 무엇인가 | 내 작업마다 하나 뜨는 계획 담당. executor 를 띄우고 결과를 모읍니다 |
| Hive 테이블을 Spark 로 읽는다는 것은 | Spark 가 같은 Metastore 목록을 읽어 같은 HDFS 파일을 읽는 것 |
| Trino 는 어디가 다른가 | YARN 자리를 안 받고 자기 워커에서 돕니다. 큐 이름이 없습니다 |
| Spark 가 늘 빠른가 | 아닙니다. 단계가 많을 때 유리하고, 작은 쿼리는 Hive 가 먼저 끝나기도 합니다 |

## 헷갈리기 쉬운 점

- **Hadoop 과 HDFS 를 같은 말로 쓰지 마세요.** HDFS 는 Hadoop 의 1층입니다. Hadoop 에는 YARN 도 들어 있습니다.
- **Hive 가 테이블을 소유한다고 생각하지 마세요.** 목록은 Metastore 에 있고 파일은 HDFS 에 있습니다. Hive 는 그것을 처음 적었을 뿐입니다.
- **NodeManager 와 executor 를 섞지 마세요.** NodeManager 는 늘 켜진 자리 배분 담당이고, executor 는 자리를 받아 작업 동안만 도는 프로세스입니다.
- **driver 가 뜨는 자리를 확인하세요.** 클라이언트 모드면 엣지 노드에 뜹니다. 그 터미널을 닫으면 작업이 같이 죽습니다.
- **「Hive on Spark」와 「Spark 로 Hive 테이블 읽기」는 다른 말입니다.** 앞은 Hive 의 엔진을 바꾼 것이고, 뒤는 Spark 가 목록을 읽는 것입니다.
- **느린 원인을 엔진에서만 찾지 마세요.** 큐가 가득 차서 자리를 못 받은 시간일 수 있습니다. ResourceManager 화면에서 ACCEPTED 로 서 있었는지 봅니다.
- **Trino 에 큐 이름을 넣으려 하지 마세요.** YARN 을 안 쓰니 큐가 없습니다.

## 더 깊이 보기

- 카드 여섯 장을 한 페이지에서 보려면 [Hadoop, Hive, Spark 자리 카드](demo-cluster-roles.html)가 있습니다. 카드를 누르면 자리마다 헷갈리는 것 하나가 더 나옵니다.
- 노드를 3차원 상자로 그린 판은 [하둡 상자 그림 여섯 장](demo-hadoop-boxes.html)입니다. 층이 나뉘는 구조는 그쪽이 더 잘 보입니다.
- 접속 주소 한 줄이 어느 상자를 가리키는지는 [Hadoop 과 Hive](post.html?id=hadoop-hive-basics) 편입니다. ZooKeeper 와 HiveServer2 의 관계가 거기 있습니다.
- 테이블을 다른 팀에 건네는 여덟 방법은 [데이터 건네기](post.html?id=data-handoff-methods) 편입니다. 첫 카드가 이 글 6절의 권한 이야기입니다.
- 서빙 쪽에서 지연과 처리량을 재는 말은 [서빙 지연과 처리량](post.html?id=serving-latency-throughput) 편에 있습니다.
