지훈 씨는 다섯째 주에 데이터 팀 선배에게서 "이 주소로 붙으면 클릭 로그 테이블이 보여요"라는 메시지와 함께 한 줄짜리 긴 문자열을 받았습니다.

`jdbc:hive2://`(Hive 에 접속하는 주소라는 표시)로 시작하는 이 문자열에는 서버 이름 5개가 이어졌고 그 뒤로 세미콜론(;)으로 나뉜 설정 6개와 물음표(?) 뒤의 설정 하나가 더 붙어 있었습니다. 선배가 시킨 대로 이 문자열로 접속하자 정말 표가 화면에 나왔지만 지훈 씨는 다섯 서버 가운데 어느 서버가 표를 보내 주는지, 표의 파일은 어디에 있는지, 서버가 왜 다섯 대나 되는지 하나도 알 수 없었습니다.

**이 주소에 적힌 다섯 서버는 무엇이고 내 SQL 은 어디까지 가서 돌아올까요?**

답부터 말하면 다섯 서버는 ZooKeeper 이고 표를 보내 주는 서버는 HiveServer2 이며 표의 파일은 HDFS 에 있습니다. ZooKeeper 는 여러 서버가 지금 누가 살아 있는지를 서로 맞출 때 쓰는 조정 서비스입니다. HiveServer2 는 HDFS 에 쌓인 파일을 SQL 로 조회하게 해 주는 Hive 의 서버로 사용자가 보낸 SQL 질의를 받아 줍니다. HDFS 는 큰 파일을 여러 서버의 디스크에 나눠 저장하는 하둡(Hadoop)의 파일 시스템입니다.

이 글은 서버 한 대를 상자 하나로 그린 그림으로 이 이름들을 따라갑니다. 서버를 상자로 그려 놓으면 주소 한 줄의 각 부분이 어느 상자를 가리키는지가 보이는데, 그 대응을 알면 접속이나 쿼리가 안 될 때 어느 상자부터 확인할지 정할 수 있습니다. 물음표 뒤에 적힌 큐 이름 하나가 팀의 자원을 어디에서 받아 쓰게 하는지도 함께 알 수 있습니다. 큐는 팀이나 용도마다 쓸 수 있는 CPU 와 메모리의 양을 정해 둔 줄입니다(3절).

> **한 줄 요약:** 하둡 클러스터는 서버 여러 대가 저마다 맡은 프로그램을 돌리는 무리입니다. 접속 주소에 적힌 다섯 서버는 Hive 서버가 아니라 살아 있는 서버 목록을 맡은 ZooKeeper 입니다. 내 컴퓨터가 직접 연결하는 서버는 ZooKeeper 와 HiveServer2 두 곳뿐이고 나머지 서버의 주소는 서버들끼리 서로 알고 있습니다.

> **골라 읽는 법** — 이 글은 절 8개로 되어 있습니다. 1절부터 7절까지 그림이 한 장씩, 8절에는 표가 들어 있어서 그림과 표만 보고 다음 절로 넘어가도 됩니다.
>
> - 상자 그림을 읽는 규칙 → 1절
> - 저장과 계산이 나뉘는 방식 → 2~3절
> - Hive 의 두 서버(SQL 을 받는 서버와 목록을 가진 서버)의 차이 → 4~5절
> - 접속 주소 한 줄을 조각으로 나눠 읽는 법과 쿼리가 지나는 길 → 6~7절
> - 접속이나 쿼리가 안 될 때 먼저 확인할 곳 → 8절

이 글에 나오는 서버 이름, 파일 크기, 큐 이름은 모두 설명하려고 정한 가상 값입니다. 카드 그림(2~5절)은 4가지 색으로 나뉘는데 파랑은 저장(HDFS), 벽돌색은 계산(계산할 자리를 나눠 주는 YARN), 먹색은 Hive 서버, 회색은 ZooKeeper 입니다. 상자 그림(1, 6, 7절)에서는 파란 상자가 내 접속 주소가 직접 가리키는 서버이고 워커 상자 안의 회색 네모는 데이터 조각, 벽돌색 네모는 계산 조각입니다.

---

## 1. 서버 한 대를 상자 하나로 그린 클러스터

**하둡 클러스터는 서버 여러 대로 이루어지고 서버마다 맡아 돌리는 프로그램이 있는데, 이 프로그램을 역할이라고 부릅니다.**

주소에 적힌 다섯 서버가 무엇인지 따지기 전에 먼저 클러스터에 어떤 서버들이 있고 서버마다 무엇을 돌리는지를 상자 그림으로 정리해 둡니다. 하둡 클러스터라는 말은 서버 한 대가 아니라 서버 수십에서 수백 대가 모인 무리를 가리킵니다. 그림에서는 서버 한 대를 상자 하나로 그리고 그 서버가 돌리는 프로그램 이름을 상자에 적습니다. 프로그램은 서버마다 달라서 NameNode 를 돌리는 서버, ResourceManager 를 돌리는 서버, HiveServer2 를 돌리는 서버가 저마다 따로 있습니다. NameNode 는 파일이 어느 서버에 있는지 적어 두는 프로그램입니다. ResourceManager 는 일감을 어느 서버에 맡길지 정하는 프로그램입니다.

이렇게 역할을 하나만 맡은 서버는 몇 대뿐이고 나머지 대부분은 워커라고 부르는 서버인데, 워커 한 대에는 DataNode 와 NodeManager 두 역할이 함께 들어 있습니다. DataNode 는 파일 조각(HDFS 가 큰 파일을 일정한 크기로 나눈 블록, 2절)을 디스크에 실제로 담는 프로그램이고 NodeManager 는 ResourceManager 가 배분한 자원으로 그 서버에 계산 조각을 띄우고 지켜보는 프로그램입니다. 두 역할을 한 서버에 같이 두는 까닭은 하나뿐인데, 데이터가 놓인 서버에서 바로 계산하면 2절에서 예로 드는 384 MB 파일 같은 데이터를 네트워크로 다른 서버에 옮기지 않아도 됩니다.

첫 그림의 위쪽 두 줄은 역할이 하나씩인 서버들이고 맨 아래 줄의 워커 상자에는 DataNode 와 NodeManager 두 칸이 함께 들어 있습니다.

<div class="demo-embed-wrap">
<iframe class="demo-embed" src="demo-hadoop-boxes.html?embed=1&fig=1" height="620" loading="lazy" title="하둡 클러스터 상자 그림"></iframe>
<a class="demo-embed-open" href="demo-hadoop-boxes.html" target="_blank" rel="noopener">↗ 상자 그림 여섯 장 전체로 열기</a>
</div>

아래 표에는 그림의 상자에 적힌 역할, 곧 이 글에 나오는 역할 전부가 한 줄씩 들어 있고 역할마다 하는 일과 클러스터 안의 대수가 적혀 있습니다. 표에 나오는 계산 조각(쿼리를 잘게 나눈 계산 단위)은 3절에서 자세히 다루며 역할 하나하나도 뒤의 절에서 그림으로 다시 봅니다.

| 역할 | 하는 일 | 몇 대 |
|---|---|---|
| NameNode | 파일 조각이 어느 상자에 있는지 목록을 듭니다 | 1대 |
| DataNode | 파일 조각을 디스크에 담습니다 | 워커마다 |
| ResourceManager | CPU 와 메모리를 큐 단위로 나눠 줍니다 | 1대 |
| NodeManager | 자기 상자 안에서 계산 조각을 띄웁니다 | 워커마다 |
| HiveServer2 | SQL 을 받아 실행 계획을 세우고 결과를 돌려줍니다 | 2대 |
| Metastore | 테이블 이름, 컬럼, 파일 위치의 목록을 듭니다 | 1대 |
| ZooKeeper | 살아 있는 서버 목록을 다섯 벌 같이 듭니다 | 5대 |

표의 몇 대 열에서 NameNode, ResourceManager, Metastore 는 1대씩이지만 HiveServer2 는 2대, ZooKeeper 는 5대입니다. HiveServer2 가 여러 대일 때 접속 주소가 어떻게 되는지와 ZooKeeper 를 5대 두는 까닭은 5절에서 봅니다.

## 2. 파일을 128 MB 조각으로 나눠 세 벌씩 두는 HDFS

**HDFS 는 큰 파일을 128 MB 크기의 조각으로 나눠 조각마다 세 벌씩 서로 다른 워커에 흩어 둡니다. NameNode 는 어느 조각이 어느 워커에 있는지 적은 목록만 갖고 있습니다.**

지훈 씨가 궁금해한 파일의 위치는 HDFS 가 파일을 나눠 두는 방식을 따라가면 찾을 수 있습니다. 지훈 씨가 조회할 클릭 로그는 HDFS 에 파일로 저장되어 있습니다. 여기서는 하루치 파일 가운데 하나의 크기를 384 MB 로 잡겠습니다. HDFS 는 이 384 MB 파일을 128 MB 씩 잘라 조각 3개(384 ÷ 128 = 3)로 나누고 조각마다 똑같은 복사본을 세 벌 만들어 서로 다른 워커에 한 벌씩 둡니다. 어느 조각의 복사본이 어느 워커로 갔는지는 NameNode 가 목록으로 갖고 있을 뿐 NameNode 서버 안에 데이터는 하나도 없습니다.

워커가 6대인 가상 클러스터에 조각 3개를 놓아 보면 아래 표와 같습니다. 맨 오른쪽 열에는 그 가운데 워커 3 이 꺼졌을 때 조각마다 복사본이 남는 워커를 적었습니다.

| 조각 | 크기 | 놓인 상자 | 워커 3 이 꺼지면 남는 상자 |
|---|---|---|---|
| 조각 1 | 128 MB | 워커 1, 워커 3, 워커 5 | 워커 1, 워커 5 |
| 조각 2 | 128 MB | 워커 2, 워커 4, 워커 6 | 워커 2, 워커 4, 워커 6 |
| 조각 3 | 128 MB | 워커 1, 워커 2, 워커 4 | 워커 1, 워커 2, 워커 4 |

조각마다 복사본이 3개씩 있으므로 384 MB 파일 하나가 쓰는 디스크는 384 MB 가 아니라 그 세 배인 1,152 MB(384 MB × 3)입니다. 디스크를 세 배로 쓰는 대신 워커 하나가 꺼져도 파일을 계속 읽을 수 있습니다. 표의 맨 오른쪽 열처럼 워커 3 이 꺼져도 조각 1 의 복사본이 워커 1 과 워커 5 에 남아 있어 파일 전체가 그대로 읽힙니다. 조각 2 와 조각 3 은 처음부터 워커 3 에 복사본이 없었으므로 세 벌이 모두 남습니다. 복사본을 두 벌로 줄이면 디스크는 384 MB 의 두 배인 768 MB 로 줄지만 워커 두 대가 함께 꺼질 때 어떤 조각은 복사본 두 벌을 모두 잃어 완전히 사라질 수 있습니다.

카드에서 384 MB 파일의 128 MB 조각들은 점을 따라 DataNode 들로 흩어지고 NameNode 옆에는 조각이 어디 있는지 적은 목록만 놓여 있습니다.

<div class="demo-embed-wrap">
<iframe class="demo-embed" src="demo-hadoop-cards.html?embed=1&card=hdfs" height="520" loading="lazy" title="HDFS 카드"></iframe>
<a class="demo-embed-open" href="demo-hadoop-cards.html" target="_blank" rel="noopener">↗ 카드 여섯 장 전체로 열기</a>
</div>

실무에서 보는 `hdfs://namenode.example.com:8020/warehouse/adlog.db/ad_click/` 같은 주소도 이 그림으로 읽으면 됩니다. 주소 앞부분 `namenode.example.com:8020` 이 NameNode 서버를 가리키므로 이 주소는 데이터를 직접 받아 오는 주소가 아니라 NameNode 에게 「이 경로의 조각들이 어느 상자에 있나」를 묻는 주소입니다.

## 3. 계산할 자리를 나눠 주는 YARN

**쿼리 하나가 여러 개의 계산 조각으로 나뉘면 ResourceManager 가 큐에서 CPU 와 메모리를 떼어 워커의 NodeManager 에 그 계산 조각을 올립니다.**

HDFS 에 흩어 둔 조각 3개의 행을 실제로 세려면 계산을 어느 워커에서 얼마만큼의 CPU 와 메모리로 돌릴지 누군가 정해야 합니다. 2절의 384 MB 파일에 든 행이 몇 개인지 세는 쿼리를 보냈다고 하면 이 일은 128 MB 조각 3개의 행을 조각마다 따로 센 다음 세 값을 합치는 일로 나뉘며 조각 하나의 행을 세는 일이 계산 조각(태스크) 하나입니다. YARN 은 이런 계산 조각을 어느 워커에서 돌릴지 정하는 하둡의 자원 관리 시스템이고 YARN 에서 그 결정을 내리는 중심 서버가 ResourceManager 입니다.

ResourceManager 는 클러스터 전체의 CPU 와 메모리를 큐라는 줄로 나눠 두는데, 큐는 서버가 아니라 팀마다 또는 용도마다 자원을 얼마나 쓸 수 있는지 정해 둔 줄입니다. 지훈 씨가 받은 주소의 마지막 부분 `tez.queue.name=analytics` 가 이 큐의 이름을 정합니다. 설정 이름 앞의 Tez 는 Hive 가 쿼리를 계산 조각으로 나눠 돌릴 때 쓰는 실행 엔진입니다. 클러스터의 CPU 가 1,000개이고 analytics 큐가 그 30% 를 쓸 수 있고 최대치(maximum-capacity)도 30% 로 막아 두었다면 이 큐에 들어온 쿼리들은 1,000개의 30% 인 300개 안에서 CPU 를 나눠 쓰며 300개가 모두 쓰이는 중에 들어온 새 쿼리는 큐에서 기다립니다.

카드 속 내 쿼리는 ResourceManager 의 여러 큐 가운데 analytics 큐에서 자원을 받고 그 자원으로 만든 계산 조각(T)은 데이터 조각이 있는 워커로 내려갑니다.

<div class="demo-embed-wrap">
<iframe class="demo-embed" src="demo-hadoop-cards.html?embed=1&card=yarn" height="520" loading="lazy" title="YARN 카드"></iframe>
<a class="demo-embed-open" href="demo-hadoop-cards.html" target="_blank" rel="noopener">↗ 카드 여섯 장 전체로 열기</a>
</div>

카드에서처럼 계산 조각은 자기가 셀 데이터 조각이 있는 워커로 먼저 가므로 조각 1 의 행을 세는 계산 조각은 2절 표에서 조각 1 의 복사본을 가진 워커 1, 3, 5 가운데 한 대에서 돌아갑니다. 2절에서 복사본을 세 벌 둔 것이 여기서 두 번째로 쓸모가 있는데, 복사본을 가진 세 대 가운데 그때 한가한 워커를 골라 계산 조각을 올릴 수 있습니다. 첫 번째 쓸모는 2절에서 본 대로 워커 하나가 꺼져도 파일을 읽을 수 있다는 점이었습니다.

## 4. SQL 을 받는 HiveServer2 와 목록을 가진 Metastore

**Hive 에는 SQL 을 받는 HiveServer2 와 테이블 이름, 컬럼, 파일 위치의 목록을 가진 Metastore 두 서버가 있으며 두 서버 모두 데이터는 갖고 있지 않습니다.**

지훈 씨가 보낸 SQL 을 받는 HiveServer2 는 계정을 확인하고 SQL 을 읽은 다음 실행 계획(SQL 을 어떤 계산 조각으로 나눠 어떤 차례로 돌릴지 정한 것)을 세웁니다. 그런데 실행 계획을 세우려면 `ad_click` 테이블에 어떤 컬럼이 있고 그 파일이 HDFS 어디에 있는지를 알아야 하므로 HiveServer2 는 이 정보를 목록으로 가진 Metastore 에 물어봅니다.

Metastore 에는 목록만 들어 있는데, `ad_click` 의 경우 테이블 이름 `adlog.ad_click`, 컬럼 `req_id, ad_id, ts`, 파일 형식 parquet(열 단위로 저장하는 파일 형식), 파일 위치 `hdfs://…/warehouse/adlog.db/ad_click/` 의 4가지가 적혀 있습니다. Metastore 는 이 4가지를 MySQL 같은 보통의 관계형 DB 에 저장해 두므로 Metastore 뒤에는 그 DB 를 돌리는 서버가 하나 더 있습니다. 1절 그림에서 점선으로 그린 Metastore DB 상자가 그 서버입니다. HiveServer2 가 「ad_click 어디 있어」 하고 물으면 Metastore 는 데이터가 아니라 HDFS 경로만 돌려주며 파일 자체는 7절에서 보듯 워커들이 그 경로에서 읽습니다.

카드의 점은 쿼리 한 건이 지나는 차례대로 움직입니다. 내가 보낸 SQL 이 HiveServer2 에 닿으면 HiveServer2 가 Metastore 에 테이블 위치를 묻고 ResourceManager 에 자원을 요청하며 워커들이 센 결과는 HiveServer2 를 거쳐 나에게 돌아옵니다.

<div class="demo-embed-wrap">
<iframe class="demo-embed" src="demo-hadoop-cards.html?embed=1&card=hive" height="520" loading="lazy" title="Hive 카드 — 쿼리 한 건이 지나는 길"></iframe>
<a class="demo-embed-open" href="demo-hadoop-cards.html" target="_blank" rel="noopener">↗ 카드 여섯 장 전체로 열기</a>
</div>

Spark 는 대용량 데이터를 여러 서버에 나눠 계산하는 엔진이고 Trino 는 빠른 조회에 쓰는 SQL 엔진입니다. 이런 다른 엔진은 HiveServer2 를 거치지 않고 Metastore 에 직접 연결해 목록만 받고 파일은 스스로 읽으므로 「Hive 테이블」이라고 부르는 테이블이 Hive 서버 없이도 읽히는데, 이 점 때문에 실무에서 HiveServer2 와 Metastore 의 구분이 자주 헷갈립니다. 연결하는 곳으로 나눠 보면 JDBC(자바 프로그램이 데이터베이스에 연결할 때 쓰는 표준 방식)를 쓰는 프로그램과 Hive 의 명령줄 도구 beeline 은 HiveServer2 에, Spark 와 Trino 는 Metastore 에 연결합니다.

## 5. 살아 있는 서버 목록을 다섯 벌 두는 ZooKeeper

**HiveServer2 가 켜질 때마다 ZooKeeper 에 자기 주소를 등록해 두므로 내 컴퓨터는 ZooKeeper 에 물어서 지금 살아 있는 HiveServer2 를 찾아갑니다.**

이 절에서는 주소에 적힌 서버 5대가 무엇이고 왜 5대인지를 봅니다. HiveServer2 는 한 대가 아니라 카드의 hs2-a 와 hs2-b 처럼 2대가 돌고 있어서 한 대를 내렸다가 다시 띄우거나 세 대로 늘릴 때마다 접속 주소도 바꿔야 할 것처럼 보입니다. 그런데 HiveServer2 는 켜질 때 ZooKeeper 안의 `hiveserver2` 라는 폴더(ZooKeeper 에서는 znode 라고 부르는 경로)에 자기 주소를 적어 두므로 지훈 씨가 받은 주소에는 HiveServer2 의 이름이 한 글자도 없습니다.

주소에 적힌 서버 5대가 바로 이 ZooKeeper 서버들로, 5대 모두 HiveServer2 주소가 적힌 이 목록을 똑같이 한 벌씩 갖고 있습니다. ZooKeeper 는 5대 가운데 절반이 넘는 3대만 살아 있어도 질문에 답합니다. 서버들이 반반으로 나뉘는 일을 막으려고 ZooKeeper 서버 수는 5대처럼 홀수로 둡니다. 지훈 씨의 컴퓨터는 5대 가운데 응답하는 한 대에 연결해 목록을 읽은 다음 목록에 적힌 hs2-a 나 hs2-b 가운데 하나로 찾아갑니다.

카드 아래쪽의 hs2-a 와 hs2-b 는 켜질 때 목록에 자기 주소를 등록합니다. 왼쪽 아래의 「나」는 ZooKeeper 에 「어디로 가?」를 물어 받은 답대로 hs2-a 에 SQL 을 보냅니다.

<div class="demo-embed-wrap">
<iframe class="demo-embed" src="demo-hadoop-cards.html?embed=1&card=zookeeper" height="520" loading="lazy" title="ZooKeeper 카드"></iframe>
<a class="demo-embed-open" href="demo-hadoop-cards.html" target="_blank" rel="noopener">↗ 카드 여섯 장 전체로 열기</a>
</div>

그래서 HiveServer2 를 늘리거나 다른 서버로 바꾸면 ZooKeeper 안의 목록만 달라지고 그 목록도 HiveServer2 가 스스로 고치므로 지훈 씨의 접속 주소는 그대로입니다.

## 6. 구분자 3개로 나눠 읽는 접속 주소 한 줄

**접속 주소 한 줄은 구분자(부분과 부분을 나누는 기호) 3개가 자리를 정하는데, 슬래시(/) 뒤는 데이터베이스, 세미콜론(;)으로 이어진 부분은 접속 조건, 물음표(?) 뒤는 Hive 설정입니다.**

지훈 씨가 받은 주소에는 서버 5개 다음에 세미콜론으로 나뉜 설정 6개와 물음표 뒤 설정 1개가 붙어 있었는데, 설정마다 어느 서버에 무엇을 알리는지는 구분자를 기준으로 주소를 나눠 보면 알 수 있습니다. 아래 주소는 지훈 씨가 받은 주소와 모양이 같고 값만 예시로 바꿨습니다.

```
jdbc:hive2://zk1.example.com:2181,zk2.example.com:2181,zk3.example.com:2181,zk4.example.com:2181,zk5.example.com:2181/;serviceDiscoveryMode=zooKeeper;zooKeeperNamespace=hiveserver2;transportMode=http;httpPath=cliservice;user=analyst;password=********?tez.queue.name=analytics
```

| 조각 | 값 | 어느 상자를 가리키나 |
|---|---|---|
| `jdbc:hive2://` | 규격 | HiveServer2 에 JDBC 로 붙는다는 표시입니다 |
| 서버 다섯 개, 포트 2181 | zk1 부터 zk5 | ZooKeeper 다섯 대입니다. HiveServer2 가 아닙니다 |
| `/` 뒤 | 비어 있음 | 데이터베이스입니다. 비어 있으면 default 입니다 |
| `serviceDiscoveryMode=zooKeeper` | | 앞 목록에 직접 붙지 말고 ZooKeeper 에 물어 HiveServer2 를 찾으라는 뜻입니다 |
| `zooKeeperNamespace=hiveserver2` | | ZooKeeper 안에서 HiveServer2 들이 주소를 적어 두는 폴더 이름입니다 |
| `transportMode=http;httpPath=cliservice` | | HiveServer2 와 HTTP 로 말합니다. 기본 포트는 10001 입니다 |
| `user=analyst;password=********` | | HiveServer2 에 대는 계정입니다 |
| `?tez.queue.name=analytics` | | 물음표 뒤는 Hive 설정입니다. YARN 의 analytics 줄에서 자원을 받습니다 |

표의 조각들을 내 컴퓨터가 접속하는 차례대로 다시 이으면 이렇습니다. `serviceDiscoveryMode=zooKeeper` 가 있으므로 내 컴퓨터는 앞에 적힌 서버 5대에 SQL 을 보내지 않고 포트 2181 로 연결하는 그 서버들(ZooKeeper)에 HiveServer2 의 위치를 먼저 묻습니다. ZooKeeper 안에서 어느 폴더의 목록을 읽을지는 `zooKeeperNamespace=hiveserver2` 가 정합니다. 그렇게 찾아간 HiveServer2 와는 `transportMode=http;httpPath=cliservice` 에 적힌 대로 HTTP(기본 포트 10001)로 통신하며 `user=analyst;password=********` 의 계정으로 들어갑니다. `/` 뒤가 비어 있으므로 데이터베이스는 default 입니다. Hive 의 데이터베이스는 테이블을 모아 두는 이름 공간이라 default 가 아닌 데이터베이스의 테이블은 `adlog.ad_click` 처럼 테이블 이름 앞에 데이터베이스 이름을 붙여 부릅니다.

그림은 위쪽에 주소를 조각으로 나눠 늘어놓고 아래쪽에 그 조각들이 가리키는 상자를 그렸습니다.

<div class="demo-embed-wrap">
<iframe class="demo-embed" src="demo-hadoop-boxes.html?embed=1&fig=5" height="560" loading="lazy" title="주소 한 줄이 가리키는 상자"></iframe>
<a class="demo-embed-open" href="demo-hadoop-boxes.html" target="_blank" rel="noopener">↗ 상자 그림 여섯 장 전체로 열기</a>
</div>

그림에서 주소의 조각들이 화살표로 가리키는 상자는 ZooKeeper, HiveServer2, ResourceManager 의 3가지뿐입니다. 서버 5개가 적힌 조각은 ZooKeeper 5대로, zooKeeperNamespace 조각은 그 안의 목록으로, 말하는 방식(transportMode)과 계정 조각 2개는 HiveServer2 로 가고 물음표 뒤 조각 하나는 ResourceManager 의 큐로 갑니다. Metastore 와 HDFS 는 주소가 내 접속 주소에 적혀 있지 않고 HiveServer2 가 알고 있으므로 두 곳으로 가는 화살표는 하나도 없습니다.

물음표 자리를 잘못 쓰면 오류 없이 조용히 무시되는데, 큐 이름을 물음표 뒤가 아니라 세미콜론으로 이어진 접속 조건 자리에 적으면 큐 이름이 접속 조건으로 읽혀 큐가 default(큐를 따로 정하지 않았을 때 쓰는 기본 큐)로 정해집니다. 그러면 쿼리는 문제없이 돌아가지만 남의 팀 자원을 쓰는 상태가 됩니다.

## 7. 쿼리 한 건이 지나는 길

**쿼리 한 건이 지나는 일곱 자리 가운데 내 컴퓨터가 직접 찾아가는 곳은 ZooKeeper 와 HiveServer2 두 곳(1~3)이고 4 부터 7 까지는 HiveServer2 가 대신 다닙니다.**

글 머리에서 물은 「내 SQL 은 어디까지 가서 돌아올까」의 답은 앞의 절에서 본 상자들을 쿼리가 지나는 차례대로 이으면 나옵니다. 지훈 씨가 `adlog.ad_click` 의 전체 행 수를 세는 `SELECT count(*) FROM adlog.ad_click` 을 보내면 쿼리는 아래 일곱 자리를 차례로 지납니다.

1. 내 컴퓨터가 주소에 적힌 ZooKeeper 5대 가운데 응답하는 한 대에 「HiveServer2 어디 있어」 하고 묻습니다.
2. ZooKeeper 가 `hiveserver2` 폴더의 목록에 있는 살아 있는 hs2-a 를 알려 줍니다.
3. 내 컴퓨터가 hs2-a 에 계정과 SQL 을 보냅니다. 1 부터 여기까지가 접속입니다.
4. hs2-a 가 실행 계획을 세우려고 Metastore 에 ad_click 의 컬럼과 파일 위치를 묻습니다.
5. hs2-a 가 ResourceManager 에서 주소의 물음표 뒤에 적힌 analytics 큐의 자원을 받습니다.
6. 워커들의 NodeManager 위에 계산 조각이 올라가 DataNode 에 있는 데이터 조각을 읽고 행을 셉니다.
7. 워커들이 센 결과가 hs2-a 로 모였다가 내 컴퓨터로 돌아옵니다.

그림의 번호 1 부터 7 까지가 이 차례입니다. 내 컴퓨터에서 나가는 화살표는 1 과 3 의 2개뿐입니다.

<div class="demo-embed-wrap">
<iframe class="demo-embed" src="demo-hadoop-boxes.html?embed=1&fig=6" height="600" loading="lazy" title="쿼리 한 건이 지나는 길"></iframe>
<a class="demo-embed-open" href="demo-hadoop-boxes.html" target="_blank" rel="noopener">↗ 상자 그림 여섯 장 전체로 열기</a>
</div>

4 부터 7 까지 다니는 곳의 주소는 지훈 씨의 컴퓨터 어디에도 없습니다. Metastore 주소는 HiveServer2 의 설정 파일에, ResourceManager 주소는 클러스터 설정에, 파일 위치는 Metastore 의 목록에 적혀 있고 HiveServer2 가 이 설정과 목록을 보고 찾아가므로 접속 주소 한 줄에 이 주소들이 없어도 빠진 것이 아니며 내 컴퓨터는 이 주소들을 알 필요가 없습니다.

## 8. 안 될 때 먼저 확인할 곳

**오류 문구에 나오는 낱말은 7절의 번호 가운데 하나를 가리키므로 그 번호의 자리부터 확인합니다.**

접속이 안 되거나 쿼리가 진행되지 않고 멈춰 있을 때는 7절의 일곱 자리 가운데 어디가 막혔는지부터 정하는데, 오류 문구에 나온 낱말이 막힌 자리를 알려 주는 힌트가 됩니다. 아래 표에 자주 만나는 오류 6가지를 오류 문구에 보이는 것, 7절의 자리 번호, 먼저 확인할 것으로 나눠 적었습니다.

| 오류 문구에 보이는 것 | 자리 | 먼저 확인할 것 |
|---|---|---|
| ZooKeeper 연결 실패, Connection timed out | 1 ZooKeeper | 사내망인지, 포트가 열려 있는지, 다섯 주소에 오타가 없는지 |
| HiveServer2 configs from ZooKeeper 를 못 읽음, 목록이 비어 있음 | 2 목록 | 폴더 이름 오타인지, HiveServer2 가 하나도 안 떠 있는지 |
| Error validating the login | 3 HiveServer2 | 계정과 비밀번호. 비밀번호에 특수 문자가 있으면 작은따옴표로 감쌌는지 |
| Table not found, Database does not exist | 4 Metastore | 데이터베이스 이름을 `adlog.ad_click` 처럼 붙였는지 |
| Queue does not exist, 오래 ACCEPTED 로 대기 | 5 YARN | 큐 이름 오타인지, 큐에 낼 권한이 있는지, 큐가 가득 찼는지 |
| Permission denied, access=READ, inode= | 6과 7 HDFS | 테이블 파일에 읽기 권한이 있는지. 목록은 보여도 파일은 못 읽는 경우입니다 |

표의 세 번째 줄(Error validating the login)은 지훈 씨가 첫날 겪은 오류입니다. 비밀번호에 느낌표가 들어 있었는데 셸(터미널에서 명령을 받아 실행하는 프로그램)이 느낌표를 특수 문자로 처리해 비밀번호가 그대로 전달되지 않았습니다. 주소 전체를 작은따옴표(')로 감싸자 접속되었습니다.

다섯 번째 줄에 나오는 ACCEPTED 는 오류가 아니라 YARN 이 작업을 받아들였지만 아직 자원을 받지 못해 큐에서 기다리는 상태입니다. 쿼리는 기다리면 돌아가지만 큐가 늘 가득 차 있다면 큐 이름을 잘못 적어 쿼리가 default 큐로 들어간 것은 아닌지부터 확인합니다(6절).

## 한눈 정리

| 질문 | 한 줄 답 |
|---|---|
| 주소에 적힌 다섯 서버는 무엇인가 | ZooKeeper 입니다. HiveServer2 가 아닙니다 |
| 내 SQL 을 받는 서버는 어디인가 | HiveServer2 입니다. ZooKeeper 목록에서 찾아갑니다 |
| Metastore 에는 무엇이 있나 | 테이블 이름, 컬럼, 파일 위치의 목록입니다. 데이터는 없습니다 |
| 데이터는 어디 있나 | HDFS 워커 상자의 DataNode 에 128 MB 조각으로, 세 벌씩 |
| 큐는 서버인가 | 아닙니다. ResourceManager 안에서 자원을 나누는 줄입니다 |
| 큐 이름은 주소 어디에 적나 | 물음표 뒤입니다. 세미콜론 쪽에 적으면 무시됩니다 |
| HiveServer2 를 늘리면 주소가 바뀌나 | 아닙니다. ZooKeeper 안의 목록만 바뀝니다 |
| Spark 는 어디에 붙나 | Metastore 에 직접 붙어 목록을 읽고 파일은 스스로 읽습니다 |

## 헷갈리기 쉬운 점

- **주소에 적힌 서버 목록을 Hive 서버 목록으로 읽지 않습니다.** 주소에 `serviceDiscoveryMode=zooKeeper` 가 붙어 있으면 앞에 적힌 서버들은 HiveServer2 가 아니라 ZooKeeper 입니다.
- **Metastore 에는 데이터가 없습니다.** Metastore 에는 테이블의 목록만 있고 데이터는 HDFS 파일에 있어서 테이블 정의가 보이더라도 그 파일을 읽을 권한이 없으면 데이터를 읽지 못합니다.
- **큐는 서버 이름으로 찾지 않습니다.** 큐는 서버가 아니라 ResourceManager 안에 있는 줄이므로 큐 상태는 ResourceManager 웹 화면(포트 8088)에서 확인합니다.
- **큐 이름은 세미콜론으로 이어진 자리에 적지 않습니다.** 그 자리에 적은 큐 이름은 접속 조건으로 읽혀 오류 없이 무시되고 쿼리는 default 큐로 들어갑니다.
- **ACCEPTED 는 오류가 아닙니다.** ACCEPTED 는 작업이 큐에서 기다리고 있다는 뜻이며 오래 기다리고 있다면 그 큐가 가득 차 있을 수 있습니다.
- **DROP TABLE 이 파일까지 지운다고 단정하지 않습니다.** 테이블을 지우는 명령 DROP TABLE 의 결과는 테이블이 managed(Hive 가 목록과 파일을 함께 관리하는 테이블)인지 external(Hive 는 목록만 관리하고 파일은 Hive 밖에서 관리하는 테이블)인지에 따라 다르며 external 테이블은 DROP TABLE 을 해도 Metastore 의 목록만 지워집니다.
- **비밀번호가 든 주소는 그대로 공유하지 않습니다.** 접속 주소 한 줄에는 계정과 비밀번호가 함께 적혀 있어서 주소를 그대로 넘기면 비밀번호도 같이 넘어갑니다.

## 더 깊이 보기

- 그림 여섯 장을 한 페이지에서 보려면 [하둡 상자 그림 여섯 장](demo-hadoop-boxes.html)과 [하둡 카드 여섯 장](demo-hadoop-cards.html)이 있습니다. 카드 쪽은 점이 흘러가며 순서를 보여 줍니다.
- 이 테이블의 파일이 어떻게 여기까지 왔는지는 [데이터 유통 층](post.html?id=data-distribution-layer) 편과 [데이터 파이프라인 설계](post.html?id=data-pipeline-design) 편에 있습니다.
- 그 파일이 되기 전, 클릭 한 건이 Kafka 에 놓이기까지는 [Kafka 로그 파이프라인](post.html?id=kafka-log-pipeline) 편입니다.
- 접속 주소의 요청과 응답이 어떤 모양인지는 [API 기초](post.html?id=api-basics) 편에서 다룹니다.
