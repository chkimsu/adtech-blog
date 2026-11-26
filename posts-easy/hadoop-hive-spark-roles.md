지훈 씨는 일곱째 주에 하루치 클릭 로그에서 광고마다 클릭이 몇 번 났는지 세는 쿼리를 하나 돌렸는데 20분이 지나도 끝나지 않았습니다. 화면을 보던 옆자리 선배가 말했습니다. "그건 Hive 말고 Spark 로 돌리세요."

지훈 씨는 선배 말대로 Spark 로 다시 돌렸습니다. 테이블도 SQL 도 그대로였고 접속한 클러스터(서버 수십에서 수백 대가 모여 함께 일하는 무리)도 같았는데 이번에는 3분 만에 끝났습니다. Hive 와 Spark 는 둘 다 같은 테이블에 같은 SQL 을 돌릴 수 있는 프로그램인데, 지훈 씨는 무엇이 바뀌어 시간이 이렇게 줄었는지 알 수 없었습니다. 두 프로그램이 서로 다른 서버에서 도는지, 데이터를 두 벌 갖고 있는지, 아니면 같은 서버에서 다른 프로그램만 도는지도 머릿속에 그림이 그려지지 않았습니다.

**같은 클러스터, 같은 테이블인데 Hive 와 Spark 는 어디가 다를까요?**

답은 클러스터의 노드(클러스터를 이루는 서버 한 대)를 그 위에서 도는 프로그램에 따라 4종류로 나눈 다음 그중 데이터를 담고 계산하는 워커 노드 한 대를 세로로 잘라 보면 나옵니다. 워커 노드 한 대에는 층이 3개 쌓여 있는데, 파일을 담는 1층 저장과 CPU 와 메모리를 작업에 나눠 주는 2층 자리 배분(리소스 할당)은 Hive 와 Spark 가 함께 쓰고 두 프로그램을 바꿔 돌리면 그 위 3층에서 도는 프로그램만 달라집니다. 이 3개 층을 알고 나면 「Hive 로 돌린다」와 「Spark 로 돌린다」가 클러스터의 무엇을 바꾸는 말인지 알 수 있습니다. 데이터 팀이 하는 말 가운데 절반도 그림으로 떠오릅니다.

> **한 줄 요약:** 흔히 한꺼번에 부르는 세 이름 가운데 Hadoop 은 아래 두 층, 곧 파일을 나눠 저장하는 HDFS 와 CPU 와 메모리를 나눠 주는 YARN 을 함께 부르는 이름입니다. Hive 와 Spark 는 그 위 3층에서 도는 프로그램으로 같은 워커 노드에서 같은 파일 조각을 읽습니다. 두 프로그램이 만나는 곳은 테이블 이름과 파일 위치를 적어 둔 Metastore 목록과 HDFS 에 놓인 파일입니다.

> **골라 읽는 법** — 이 글은 절 8개로 되어 있습니다. 절마다 카드가 한 장씩 들어 있으니 카드만 보고 다음 절로 넘어가도 됩니다.
>
> - 노드 4종류와 워커 노드의 3개 층 → 1~2절
> - Hadoop 이라는 이름이 가리키는 범위 → 3절
> - Hive 로 보낸 SQL 과 Spark 작업이 지나는 길 → 4~5절
> - Hive 와 Spark 가 만나는 곳 → 6절
> - 일에 맞는 엔진 선택과 이름표 정리 → 7~8절

이 글에 나오는 서버 이름, 컨테이너(워커가 작업 하나에 떼어 준 CPU 와 메모리) 수, 걸린 시간은 모두 설명하려고 정한 가상 값입니다. 하루 클릭 228만 건은 이 트랙의 앞 글들에서 쓴 값과 같습니다.

---

## 1. 엣지, 마스터, 서비스, 워커로 나뉘는 노드 4종류

**클러스터의 서버 한 대인 노드는 지훈 씨가 접속하는 엣지, 파일 위치와 자원을 관리하는 마스터, SQL 을 받는 서비스, 데이터를 담고 계산하는 워커의 4종류로 나뉩니다.**

지훈 씨가 헷갈린 「두 프로그램이 서로 다른 서버에서 도는지」는 프로그램과 서버를 나눠 놓고 보면 풀립니다. Hadoop, Hive, Spark 는 모두 프로그램 이름이고 그 프로그램을 실제로 돌리는 서버 한 대 한 대가 노드입니다. 클러스터에 모인 수십에서 수백 대의 노드는 그 위에서 어떤 프로그램이 도는지에 따라 4종류로 나뉩니다.

엣지 노드는 지훈 씨가 접속해서 명령을 입력하는 서버로, Hive 에 SQL 을 보내는 명령줄 도구 beeline 이나 Spark 작업을 클러스터에 내는 명령 spark-submit 을 여기서 실행합니다. 엣지 노드에는 데이터가 없고 계산도 돌지 않습니다.

마스터 노드에서 도는 두 프로그램 가운데 HDFS 의 NameNode 는 파일 조각(HDFS 가 큰 파일을 나눠 담는 블록)이 어느 서버에 있는지 적어 두고 YARN 의 ResourceManager 는 일감을 어느 서버에 맡길지 정합니다. 그래서 파일 조각이 어디 있는지와 CPU, 메모리 같은 자원을 누구에게 줄지는 마스터 노드가 관리합니다.

서비스 노드에서는 사용자가 보낸 SQL 을 받는 서버 HiveServer2 와 테이블이 어디에 어떤 모양으로 있는지 적어 둔 목록(메타데이터)을 관리하는 Metastore 가 돕니다.

워커 노드는 4종류 가운데 대수가 가장 많고 한 대에 DataNode 와 NodeManager 두 역할이 함께 들어 있습니다. DataNode 는 파일 조각을 디스크에 담고 NodeManager 는 그 서버에서 일감을 돌리므로 워커는 자기가 담은 데이터를 그 자리에서 계산합니다.

카드 색은 4가지입니다. 파랑은 저장(HDFS), 벽돌색은 자리 배분(YARN), 먹색은 Hive 와 Tez, 회색은 Spark 와 그 밖의 엔진입니다. 엔진은 데이터를 읽어 실제로 계산하는 프로그램이고 Tez 는 질의를 잘게 나눠 돌리는 실행 엔진입니다. 첫 카드에서는 노드 4종류가 놓인 모습과 워커 한 대에 함께 있는 역할 2개를 보면 됩니다.

<div class="demo-embed-wrap">
<iframe class="demo-embed" src="demo-cluster-roles.html?embed=1&card=nodes" height="480" loading="lazy" title="노드는 넷으로 나뉜다"></iframe>
<a class="demo-embed-open" href="demo-cluster-roles.html" target="_blank" rel="noopener">↗ 카드 여섯 장 전체로 열기</a>
</div>

카드의 노드 4종류를 따라가면 지훈 씨가 「Hive 로 돌린다」고 할 때 일이 노드 사이를 어떻게 오가는지 알 수 있습니다. SQL 은 엣지 노드에서 서비스 노드로 가고 서비스 노드가 마스터 노드에서 자리(계산에 쓸 CPU 와 메모리)를 받으면 워커 노드에서 계산이 돕니다. 「Spark 로 돌린다」도 같은 4종류의 노드를 지나지만 서비스 노드의 HiveServer2 가 하던 일을 다른 것이 맡습니다. Spark 에서는 작업마다 하나씩 뜨는 계획 담당 프로세스 driver 가 그 일을 맡으며 자세한 길은 5절에서 봅니다.

## 2. 저장, 자리 배분, 실행으로 쌓인 워커 노드의 3개 층

**워커 노드 한 대에는 아래부터 저장, 자리 배분, 실행의 3개 층이 쌓여 있고 Hive 와 Spark 는 맨 위층에서 도는 프로그램만 다릅니다.**

지훈 씨가 그림을 그리지 못한 「같은 서버에서 다른 프로그램만 도는지」는 워커 노드 한 대를 세로로 잘라 층을 나눠 보면 풀립니다. 맨 아래 디스크에는 데이터 조각이 있고 그 위에서 YARN 이 CPU 와 메모리를 자리로 내주면 맨 위에서 Hive 쿼리를 나눈 계산과 Spark 작업을 나눈 계산이 그 자리를 받아 돕니다. 1층과 2층은 늘 켜져 있지만 3층은 작업이 있을 때만 생겼다가 작업이 끝나면 사라집니다.

1층에서는 DataNode 가 파일 조각을 디스크에 담습니다. 하루치 클릭 로그 705 MB 는 128 MB 단위로 나뉘는데, 705 MB 를 128 MB 씩 자르면 128 MB 가 다 찬 조각 5개와 나머지를 담은 조각 1개가 나와 조각은 모두 6개입니다. HDFS 는 조각마다 같은 내용을 세 벌씩 복제해 여러 워커의 디스크에 나눠 둡니다.

2층에서는 NodeManager 가 자기 서버의 CPU 와 메모리를 작업 단위로 나눠 위층에 내주는데, 작업 하나에 이렇게 떼어 준 CPU 와 메모리를 컨테이너라고 부릅니다.

3층에는 컨테이너 안에서 실제로 계산하는 프로그램이 뜹니다. Hive 쿼리를 나눈 계산은 Tez 컨테이너에서, Spark 작업을 나눈 계산은 executor(자리를 받아 작업 동안만 도는 Spark 의 프로세스)에서 돕니다. 두 프로그램 모두 같은 NodeManager 에게서 컨테이너를 받으므로 Tez 컨테이너와 executor 가 한 워커 위에 나란히 뜰 수도 있습니다.

두 번째 카드는 워커 한 대를 세로로 자른 단면에 이 3개 층을 그렸습니다.

<div class="demo-embed-wrap">
<iframe class="demo-embed" src="demo-cluster-roles.html?embed=1&card=layers" height="480" loading="lazy" title="워커 한 대의 단면은 층이 셋"></iframe>
<a class="demo-embed-open" href="demo-cluster-roles.html" target="_blank" rel="noopener">↗ 카드 여섯 장 전체로 열기</a>
</div>

카드의 파랑 점은 1층의 조각에서 3층 컨테이너로 올라가는 데이터를 나타냅니다. Tez 컨테이너와 executor 모두 같은 조각에서 데이터를 읽어 갑니다. 지훈 씨의 쿼리가 Hive 에서 Spark 로 옮겨 갔을 때도 1층의 조각과 2층의 NodeManager 는 하나도 바뀌지 않았고 3층에 뜨는 프로그램과 그 프로그램이 일하는 방식만 바뀌었습니다.

## 3. 아래 두 층을 함께 부르는 이름 Hadoop

**Hadoop 은 저장을 맡는 HDFS 와 자리 배분을 맡는 YARN 을 함께 부르는 이름이며 그 안에 계산 엔진 MapReduce 도 들어 있지만 요즘은 거의 쓰지 않습니다.**

Hadoop, Hive, Spark 를 한꺼번에 부르는 일이 많아서 어디까지가 Hadoop 인지 헷갈리기 쉽습니다. 「Hadoop 클러스터」라고 하면 HDFS 로 파일을 저장하고 YARN 으로 CPU 와 메모리 자리를 나눠 주는 서버 무리를 뜻합니다. Hive 와 Spark 는 그 위에 올려 쓰는 프로그램이라 Hadoop 에 들어가지 않습니다.

MapReduce 는 Hadoop 에 원래부터 들어 있던 계산 엔진으로, 조각마다 따로 계산한(map) 중간 결과를 디스크에 쓴 다음 그 결과를 다시 모아 계산합니다(reduce). 지훈 씨의 쿼리라면 map 단계에서 조각 6개마다 광고별 클릭 수를 따로 세어 디스크에 쓰고 reduce 단계에서 그 값을 광고별로 모아 더합니다. 이렇게 단계마다 디스크에 쓰고 다시 읽느라 느려서 Tez 와 Spark 같은 새 엔진이 나왔고 요즘 Hive 는 대개 Tez 를 엔진으로 씁니다. 그러니 지훈 씨가 20분을 기다린 쿼리도 MapReduce 가 아니라 Tez 로 돌았을 가능성이 큽니다.

아래 표는 지금까지 나온 이름 5개를 층, 하는 일, 늘 켜져 있는지로 나눠 적었습니다.

| 이름 | 어느 층 | 하는 일 | 늘 켜져 있나 |
|---|---|---|---|
| HDFS | 1층 저장 | 파일을 조각내어 워커 디스크에 세 벌씩 | 켜져 있음 (NameNode, DataNode) |
| YARN | 2층 자리 배분 | CPU 와 메모리를 컨테이너로 나눠 줌 | 켜져 있음 (ResourceManager, NodeManager) |
| MapReduce | 3층 엔진 | 옛 계산 방식. 단계마다 디스크 | 작업 동안만 |
| Tez | 3층 엔진 | Hive 의 기본 엔진. 단계 사이를 이어 감 | 작업 동안만 |
| Spark | 3층 엔진 | 중간 결과를 메모리에 두고 계산 | 작업 동안만 |

표의 하는 일 열을 보면 3층의 엔진 3개는 중간 결과를 다루는 방식이 서로 다릅니다. MapReduce 는 단계마다 디스크를 거치고 Tez 는 단계 사이를 이어 가며 Spark 는 중간 결과를 메모리에 둡니다. 늘 켜져 있는지를 적은 마지막 열에서는 1층 HDFS 와 2층 YARN 의 NameNode, DataNode, ResourceManager, NodeManager 가 늘 켜져 있는 반면 3층의 엔진 3개는 작업이 도는 동안만 있습니다. 「클러스터가 살아 있다」는 말도 늘 켜진 1층과 2층이 살아 있다는 뜻입니다. 3층 엔진은 쿼리가 들어올 때마다 새로 떴다가 작업이 끝나면 사라집니다.

## 4. SQL 을 받아 계산을 엔진에 맡기는 Hive

**Hive 는 계산을 직접 하지 않고 HiveServer2 가 SQL 을 받아 실행 계획을 세운 뒤 워커에 Tez 컨테이너를 띄워 계산을 맡기고 그 결과를 모아 돌려줍니다.**

「Hive 로 돌린다」는 말만 들으면 Hive 라는 프로그램 하나가 SQL 을 받아 직접 세는 것처럼 들리지만 실제로는 여러 노드가 일을 나눠 맡습니다. 지훈 씨가 SQL 을 보내는 곳은 늘 켜져 있는 HiveServer2 이고 여러 사람이 같은 HiveServer2 를 함께 씁니다. 이 점이 5절의 Spark 와 다릅니다.

지훈 씨의 SQL 한 건이 지나는 곳은 엣지 노드, HiveServer2, Metastore, ResourceManager, 워커의 Tez 컨테이너까지 5곳입니다. 지훈 씨가 엣지 노드에서 보낸 SQL 을 HiveServer2 가 받으면 HiveServer2 는 읽어야 할 파일을 찾으려고 Metastore 에 `adlog.ad_click` 테이블의 컬럼과 파일 위치를 묻습니다. 파일 위치를 알고 나면 마스터 노드의 ResourceManager 에 계산할 자리를 달라고 해서 자리를 받는 대로 워커에 Tez 컨테이너를 띄웁니다. Tez 컨테이너들이 저마다 맡은 조각을 읽어 광고별 클릭 수를 세고 나면 그 결과가 HiveServer2 로 모였다가 지훈 씨에게 돌아옵니다.

세 번째 카드에서 SQL 한 건이 이 5곳을 차례로 지나는 길을 따라가 봅니다.

<div class="demo-embed-wrap">
<iframe class="demo-embed" src="demo-cluster-roles.html?embed=1&card=hive" height="500" loading="lazy" title="Hive SQL 한 건이 지나는 길"></iframe>
<a class="demo-embed-open" href="demo-cluster-roles.html" target="_blank" rel="noopener">↗ 카드 여섯 장 전체로 열기</a>
</div>

「Hive 는 엔진이 아니다」라는 말이 나오는 까닭도 이 길에서 보입니다. HiveServer2 는 SQL 을 읽어 실행 계획을 세울 뿐이고 조각을 세는 일은 Tez 컨테이너가 맡습니다. 엔진 자리에는 설정 하나로 Tez 대신 Spark 를 둘 수도 있는데, 그렇게 바꿔도 지훈 씨가 접속하는 곳은 HiveServer2 그대로이고 SQL 도 고칠 필요가 없습니다. ZooKeeper 는 서버들이 서로 누가 살아 있는지 맞출 때 쓰는 조정 서비스입니다. 지훈 씨가 HiveServer2 에 접속할 때 쓰는 주소가 ZooKeeper 와 어떻게 얽히는지는 [Hadoop 과 Hive](post.html?id=hadoop-hive-basics) 편에 있습니다.

## 5. 엔진이면서 코드로도 쓰는 Spark

**Spark 에서는 늘 켜진 SQL 서버 대신 내 작업 자체가 서버입니다. 작업마다 계획을 맡는 driver 가 하나 뜨고 그 driver 가 자리를 받아 워커에 executor 를 띄웁니다.**

Spark 는 Hive 와 같은 SQL 을 받으면서도 그 SQL 을 받아 줄 서버가 늘 켜져 있지 않다는 점에서 지나는 길이 다릅니다. 지훈 씨가 엣지 노드에서 spark-submit 으로 작업을 내면 그 작업의 계획을 맡는 프로세스 driver 가 먼저 하나 뜹니다. driver 는 Metastore 에 테이블 목록을 묻고 ResourceManager 에서 자리를 받아 워커에 executor 를 띄운 다음 executor 들에 조각을 나눠 맡기고 센 결과를 모읍니다. 작업을 마치면 driver 와 executor 는 함께 사라집니다.

Hive 와 비교하면 다른 점이 2가지 있습니다. 첫째로 Spark 에는 상주 서버(늘 켜진 채 요청을 기다리는 서버)가 없습니다. HiveServer2 는 서버 하나가 여러 사람의 SQL 을 받지만 Spark 는 지훈 씨가 작업을 낼 때마다 driver 가 따로 뜹니다. driver 가 뜨는 곳은 실행 방식에 따라 달라서 클라이언트 모드에서는 지훈 씨가 명령을 친 엣지 노드에, 클러스터 모드에서는 워커의 컨테이너 하나에 뜹니다. 클라이언트 모드라면 driver 가 엣지 노드에 떠 있으므로 spark-submit 을 친 터미널을 닫으면 작업도 함께 죽습니다.

둘째로 Spark 는 SQL 만 쓰는 프로그램이 아닙니다. Spark 에서 SQL 을 쓰는 기능인 Spark SQL 로는 Hive 에서 돌리던 SQL 을 그대로 돌릴 수도 있고 표 모양 데이터를 코드로 다루는 DataFrame 으로는 데이터를 변환하는 코드에 모델 학습까지 이어 붙일 수 있습니다.

네 번째 카드에서는 앞의 Hive 카드와 달리 늘 켜진 서버 없이 driver 에서 executor 로 이어지는 길을 확인합니다.

<div class="demo-embed-wrap">
<iframe class="demo-embed" src="demo-cluster-roles.html?embed=1&card=spark" height="500" loading="lazy" title="Spark 작업 한 건이 지나는 길"></iframe>
<a class="demo-embed-open" href="demo-cluster-roles.html" target="_blank" rel="noopener">↗ 카드 여섯 장 전체로 열기</a>
</div>

지훈 씨의 쿼리가 3분 만에 끝난 이유도 Spark 가 일하는 방식에 있습니다. 광고별 클릭 수를 세는 쿼리는 조각마다 세는 단계와 그 값을 광고별로 합치는 단계로 나뉘는데, Spark 는 단계 사이의 중간 결과를 메모리에 두어 3절의 MapReduce 와 달리 두 단계 사이에서 디스크를 거치지 않습니다. 그렇다고 Spark 가 늘 빠르지는 않습니다. 메모리가 모자라면 중간 결과가 디스크로 내려가고 driver 를 띄우는 데에도 수십 초가 들어서 작은 쿼리는 Hive 가 먼저 끝나는 일도 흔합니다.

## 6. Hive, Spark, Trino 가 함께 읽는 Metastore 와 HDFS

**Hive, Spark, Trino(사람이 기다리는 빠른 조회에 쓰는 엔진)는 같은 Metastore 목록을 보고 같은 HDFS 파일을 읽으므로 「Hive 테이블」은 어느 엔진으로도 읽을 수 있습니다.**

지훈 씨가 처음에 떠올린 물음 가운데 「데이터를 두 벌 갖고 있는지」의 답이 이 절에 있습니다. 테이블 이름과 파일 위치는 Metastore 한 곳에만 적혀 있고 파일도 HDFS 한 곳에만 있어서 세 엔진은 모두 같은 목록을 보고 같은 파일을 읽습니다. 엔진마다 데이터를 한 벌씩 따로 두는 것이 아니라 같은 데이터를 읽는 프로그램이 3개 있을 뿐입니다.

Spark 도 같은 Metastore 에 `adlog.ad_click` 을 물어 같은 HDFS 경로를 받으므로 지훈 씨는 Hive 에서 Spark 로 옮기면서도 테이블 이름을 고치지 않고 그대로 쓸 수 있었습니다. Trino 도 같은 목록과 같은 파일을 읽지만 YARN 에서 자리를 받지 않는다는 점이 다릅니다. Hive 와 Spark 는 YARN 에 작업을 낼 때 큐(YARN 이 클러스터의 CPU 와 메모리를 팀이나 용도마다 나눠 둔 몫)의 이름을 적어 어느 큐에서 자리를 받을지 정합니다. Trino 는 자기 워커 서버를 따로 두고 Metastore 목록과 HDFS 파일만 빌려 쓰므로 Trino 에는 이 큐 이름이 없습니다.

다섯 번째 카드에는 세 엔진이 같은 목록과 같은 파일로 모이고 Trino 만 YARN 자리를 받지 않는 모습이 담겨 있습니다.

<div class="demo-embed-wrap">
<iframe class="demo-embed" src="demo-cluster-roles.html?embed=1&card=shared" height="500" loading="lazy" title="셋이 만나는 자리는 목록과 파일"></iframe>
<a class="demo-embed-open" href="demo-cluster-roles.html" target="_blank" rel="noopener">↗ 카드 여섯 장 전체로 열기</a>
</div>

「Hive 테이블을 Spark 로 읽는다」는 말은 이 그림대로 Spark 가 Hive 와 같은 목록을 보고 같은 파일을 읽는다는 뜻입니다. Hive 는 Metastore 에 적힌 목록을 처음 만들었을 뿐 테이블을 소유하지 않으며 그 목록은 어느 엔진이든 읽을 수 있습니다. 누구나 같은 목록을 읽을 수 있으니 팀 사이에 테이블을 건넬 때도 권한만 주면 됩니다. [데이터 건네기](post.html?id=data-handoff-methods) 편의 첫 카드가 바로 그 방법을 다룹니다.

## 7. 일에 맞춰 고르는 엔진

**SQL 로 끝나는 일에는 Hive 나 Spark SQL, 코드가 필요한 변환과 학습에는 Spark, 사람이 결과를 기다리는 빠른 대화형 조회에는 Trino 를 씁니다. 한 쿼리를 어느 엔진에 맡기느냐에 따라 워커에 뜨는 것도 달라집니다.**

세 엔진이 같은 데이터를 읽는다면 아무 엔진이나 골라도 될 것 같지만 엔진마다 잘하는 일이 다릅니다. 크고 오래 걸리는 SQL 은 Hive 가 안정적으로 끝냅니다. Spark 는 코드로 이어지는 일에서 빠르고 5절에서 본 대로 중간 결과를 메모리에 두므로 중간 결과가 많은 일에서도 빠릅니다. Trino 는 사람이 화면 앞에서 결과를 기다리는 대화형 조회처럼 몇 초 안에 답이 와야 하는 조회에 맞습니다.

아래 표에는 2절의 하루치 클릭 705 MB, 조각 6개를 광고별로 세는 같은 쿼리를 세 엔진으로 돌릴 때 워커에 무엇이 뜨는지를 가상 값으로 놓아 보았습니다.

| 엔진 | 워커에 뜨는 것 | 자리는 어디서 | 이 쿼리에서 |
|---|---|---|---|
| Hive (Tez) | Tez 컨테이너 6개 + 합치기 1개 | YARN 큐 | 안정적. 중간 결과는 디스크와 메모리를 오감 |
| Spark | executor 3개, 태스크 6개 | YARN 큐 | 중간 결과를 메모리에. 두 단계 이상이면 유리 |
| Trino | Trino 워커 3대가 나눠 읽음 | 자기 서버 | 몇 초 안에 답. 큰 결과를 쓰는 일에는 안 맞음 |

워커에 뜨는 것을 적은 둘째 열에서는 세 엔진이 같은 조각 6개를 서로 다르게 나눠 맡습니다. Hive 는 조각 수와 같은 Tez 컨테이너 6개에 그 결과를 합치는 컨테이너 1개를 더 띄웁니다. Spark 에서는 executor 3개가 조각 수와 같은 태스크(executor 가 맡아 돌리는 계산 한 단위) 6개를 나눠 돌립니다. Trino 는 YARN 이 아닌 자기 서버에서 Trino 워커 3대가 조각을 나눠 읽습니다.

이 표의 세 엔진 가운데 어느 엔진이 빠른지는 늘 같지 않고 일에 따라 다릅니다. 조각 6개짜리 이 쿼리는 세 엔진 모두 금방 끝납니다. 세 엔진의 차이가 벌어지는 때는 단계가 많아질 때, 결과를 다시 테이블로 쓸 때, 사람이 화면 앞에서 기다리며 조회할 때입니다. 표의 마지막 열이 그 차이를 적어 두었는데, Spark 는 두 단계 이상이면 유리하고 Trino 는 몇 초 안에 답을 주지만 큰 결과를 쓰는 일에는 맞지 않습니다. 지훈 씨가 기다린 20분도 쿼리를 계산한 시간보다는 큐가 가득 차서 자리를 받지 못한 시간이었을 수도 있습니다. ResourceManager 웹 화면에서 그 작업이 ACCEPTED(작업이 받아들여졌지만 아직 자리를 받지 못하고 기다리는 상태)로 서 있었는지 보면 확인할 수 있습니다.

## 8. 층으로 쌓은 이름표

**이름표를 층으로 쌓으면 Hadoop 은 아래 두 층, Tez 와 Spark 는 그 위의 엔진, Hive 와 Spark SQL 은 사람이 쓰는 맨 위층이고 Metastore 는 그 옆에서 여러 엔진이 함께 보는 목록을 관리합니다.**

데이터 팀에서 오가는 말은 모두 이 그림의 칸 하나를 가리킵니다. 「Hadoop 위에서 Hive 를 쓴다」고 하면 1층과 2층 위에 사람이 쓰는 맨 위층이 있다는 뜻입니다. 「Spark 를 YARN 에서 돌린다」고 하면 2층 YARN 에서 자리를 받는 3층 엔진이 Spark 라는 뜻입니다.

여섯 번째 카드에서는 이름표마다 붙는 층과 층 옆에 따로 있는 Metastore 를 보면 됩니다.

<div class="demo-embed-wrap">
<iframe class="demo-embed" src="demo-cluster-roles.html?embed=1&card=names" height="500" loading="lazy" title="이름표를 층으로 쌓으면"></iframe>
<a class="demo-embed-open" href="demo-cluster-roles.html" target="_blank" rel="noopener">↗ 카드 여섯 장 전체로 열기</a>
</div>

Spark 는 엔진이면서 사람이 쓰는 Spark SQL 과 DataFrame 도 함께 갖추고 있어서 카드에서 두 층에 걸친 이름은 Spark 하나뿐입니다. Hive 는 엔진이 없어 Tez 나 Spark 를 빌려 쓰므로 「Hive on Spark」라는 말도 있고 「Spark 로 Hive 테이블을 읽는다」는 말도 있습니다. 두 말에는 같은 낱말 2개(Hive 와 Spark)가 들어 있지만 가리키는 칸이 다릅니다. 「Hive on Spark」는 Hive 의 3층 엔진을 Spark 로 바꾼 설정을 가리키고 「Spark 로 Hive 테이블을 읽는다」는 Spark 가 Metastore 목록을 읽어 그 테이블의 파일을 찾아가는 일을 가리킵니다.

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

- **Hadoop 과 HDFS 는 같은 말이 아닙니다.** HDFS 는 Hadoop 의 1층 저장일 뿐이고 Hadoop 에는 2층 자리 배분을 맡는 YARN 도 들어 있습니다.
- **Hive 는 테이블을 소유하지 않습니다.** 목록은 Metastore 에, 파일은 HDFS 에 있으며 Hive 는 그 목록을 처음 적었을 뿐입니다.
- **NodeManager 와 executor 는 다릅니다.** NodeManager 는 워커에서 늘 켜져 있는 자리 배분 담당이고 executor 는 그 자리를 받아 작업이 도는 동안만 떠 있는 프로세스입니다.
- **driver 가 뜨는 곳을 먼저 확인합니다.** 클라이언트 모드에서는 driver 가 엣지 노드에서 돌기 때문에 spark-submit 을 친 터미널을 닫으면 작업이 같이 죽습니다.
- **「Hive on Spark」와 「Spark 로 Hive 테이블 읽기」는 다른 말입니다.** 앞의 말은 Hive 가 쓰는 엔진을 바꾼 설정이고 뒤의 말은 Spark 가 Metastore 목록을 읽는 일입니다.
- **느린 원인을 엔진에서만 찾지 않습니다.** 큐가 가득 차서 자리를 받지 못하고 기다린 시간일 수 있으니 ResourceManager 화면에서 작업이 ACCEPTED 로 서 있었는지 봅니다.
- **Trino 에는 큐 이름을 넣지 않습니다.** Trino 는 YARN 을 쓰지 않으니 큐도 없습니다.

## 더 깊이 보기

- 카드 여섯 장을 한 페이지에서 보려면 [Hadoop, Hive, Spark 자리 카드](demo-cluster-roles.html)가 있습니다. 카드를 누르면 자리마다 헷갈리는 것 하나가 더 나옵니다.
- 노드를 3차원 상자로 그린 판은 [하둡 상자 그림 여섯 장](demo-hadoop-boxes.html)입니다. 층이 나뉘는 구조는 그쪽이 더 잘 보입니다.
- 접속 주소 한 줄이 어느 상자를 가리키는지는 [Hadoop 과 Hive](post.html?id=hadoop-hive-basics) 편입니다. ZooKeeper 와 HiveServer2 의 관계가 거기 있습니다.
- 테이블을 다른 팀에 건네는 여덟 방법은 [데이터 건네기](post.html?id=data-handoff-methods) 편입니다. 첫 카드가 이 글 6절의 권한 이야기입니다.
- 서빙 쪽에서 지연과 처리량을 측정하는 말은 [서빙 지연과 처리량](post.html?id=serving-latency-throughput) 편에 있습니다.
