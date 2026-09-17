지훈 씨가 다섯째 주에 데이터 팀 선배에게 메시지를 받았습니다. "이 주소로 붙으면 클릭 로그 테이블이 보여요." 붙여 준 것은 한 줄짜리 긴 문자열이었습니다.

문자열은 `jdbc:hive2://` 로 시작했습니다. 그 뒤에 서버 이름이 다섯 개 이어지고, 세미콜론으로 나뉜 설정이 여섯 개, 물음표 뒤에 하나가 더 있었습니다. 시키는 대로 붙이니 정말 표가 보였습니다. 그런데 표를 내주는 것이 다섯 서버 중 어느 것인지, 파일은 어디 있는지, 서버는 왜 다섯 대인지 하나도 모르겠습니다.

**이 주소에 적힌 다섯 서버는 무엇이고, 내 SQL 은 어디까지 가서 돌아오나요?**

다섯 서버는 ZooKeeper 이고, 표를 내주는 것은 HiveServer2 이고, 파일은 HDFS 에 있습니다. 이 글은 그 이름들을 상자 그림으로 봅니다. 서버 한 대를 상자 하나로 그리면 주소 한 줄이 어느 상자를 가리키는지가 보입니다. 이것을 알면 안 될 때 어디를 볼지가 정해지고, 물음표 뒤의 큐 이름 하나가 팀 자원을 어디서 쓰는지도 알게 됩니다.

> **한 줄 요약:** 클러스터는 서버 여러 대이고, 접속 주소에 적힌 다섯 상자는 Hive 서버가 아니라 ZooKeeper 입니다. 내가 직접 말하는 상자는 ZooKeeper 와 HiveServer2 둘뿐이고, 나머지 상자들은 서로 알고 있습니다.

> **골라 읽는 법** — 절이 8개인 글입니다. 그림이 절마다 한 장씩 들어 있어 그림만 보고 넘어가도 됩니다.
>
> - 상자 읽는 규칙만 → 1절
> - 저장과 계산이 어떻게 나뉘나 → 2~3절
> - Hive 서버 둘의 차이 → 4~5절
> - 주소 한 줄 해부와 쿼리가 가는 길 → 6~7절
> - 안 될 때 어디를 보나 → 8절

이 글의 서버 이름, 파일 크기, 큐 이름은 전부 설명을 위한 가상 값입니다. 그림 속 상자 색은 넷입니다. 파랑은 저장(HDFS), 벽돌색은 계산(YARN), 먹색은 Hive 서버, 회색은 ZooKeeper 입니다.

---

## 1. 상자 하나가 서버 한 대입니다

**클러스터는 서버 여러 대이고, 서버마다 맡은 프로그램이 있습니다. 그 프로그램을 역할이라고 부릅니다.**

하둡 클러스터라는 말은 서버 한 대를 가리키는 말이 아닙니다. 상자가 수십에서 수백 개 놓인 서버 무리를 가리킵니다. 상자 하나가 서버 한 대이고, 상자마다 돌아가는 프로그램이 다릅니다. NameNode 가 도는 상자, ResourceManager 가 도는 상자, HiveServer2 가 도는 상자가 따로 있습니다.

역할이 하나뿐인 상자는 몇 대 안 됩니다. 나머지 대부분은 워커라고 부르는 상자이고, 워커 한 대에는 역할이 둘 붙어 있습니다. DataNode 는 데이터를 담고, NodeManager 는 계산을 합니다. 둘을 같은 상자에 두는 이유는 하나입니다. 데이터가 있는 자리에서 바로 계산하면 384 MB 파일을 네트워크로 옮길 필요가 없습니다.

<div class="demo-embed-wrap">
<iframe class="demo-embed" src="demo-hadoop-boxes.html?embed=1&fig=1" height="620" loading="lazy" title="하둡 클러스터 상자 그림"></iframe>
<a class="demo-embed-open" href="demo-hadoop-boxes.html" target="_blank" rel="noopener">↗ 상자 그림 여섯 장 전체로 열기</a>
</div>

그림의 상자에 적힌 이름이 이 글에 나오는 역할 전부입니다. 아래 표는 그 이름을 한 줄씩 적은 것이고, 각 역할은 뒤 절에서 그림으로 다시 봅니다.

| 역할 | 하는 일 | 몇 대 |
|---|---|---|
| NameNode | 파일 조각이 어느 상자에 있는지 목록을 듭니다 | 1대 |
| DataNode | 파일 조각을 디스크에 담습니다 | 워커마다 |
| ResourceManager | CPU 와 메모리를 큐 단위로 나눠 줍니다 | 1대 |
| NodeManager | 자기 상자 안에서 계산 조각을 띄웁니다 | 워커마다 |
| HiveServer2 | SQL 을 받아 실행 계획을 세우고 결과를 돌려줍니다 | 2대 |
| Metastore | 테이블 이름, 컬럼, 파일 위치의 목록을 듭니다 | 1대 |
| ZooKeeper | 살아 있는 서버 목록을 다섯 벌 같이 듭니다 | 5대 |

## 2. HDFS: 파일을 조각내서 세 벌씩 둡니다

**큰 파일은 128 MB 조각으로 나뉘어 워커 상자들에 세 벌씩 흩어집니다. NameNode 는 어느 조각이 어느 상자에 있는지 목록만 듭니다.**

지훈 씨가 볼 클릭 로그는 파일로 저장돼 있습니다. 하루치 파일 중 하나가 384 MB 라고 하겠습니다. HDFS 는 이 파일을 128 MB 조각 셋으로 나누고, 조각마다 복사본을 세 벌 만들어 서로 다른 워커 상자에 둡니다. 어느 조각이 어느 상자에 갔는지는 NameNode 상자가 목록으로 갖고 있습니다. NameNode 상자 안에 데이터는 없습니다.

가상 데이터로 놓아 보겠습니다. 워커가 여섯 대일 때 조각 셋이 이렇게 놓입니다.

| 조각 | 크기 | 놓인 상자 | 워커 3 이 꺼지면 남는 상자 |
|---|---|---|---|
| 조각 1 | 128 MB | 워커 1, 워커 3, 워커 5 | 워커 1, 워커 5 |
| 조각 2 | 128 MB | 워커 2, 워커 4, 워커 6 | 워커 2, 워커 4, 워커 6 |
| 조각 3 | 128 MB | 워커 1, 워커 2, 워커 4 | 워커 1, 워커 2, 워커 4 |

파일 하나가 디스크를 384 MB 가 아니라 세 배인 1,152 MB 씁니다. 그 값으로 사는 것이 있습니다. 워커 3 이 꺼져도 조각 1 은 워커 1 과 워커 5 에 남아 있어서 파일은 그대로 읽힙니다. 복사본을 두 벌로 줄이면 디스크는 768 MB 로 줄지만, 상자 두 대가 같이 꺼지면 조각 하나가 통째로 사라질 수 있습니다.

<div class="demo-embed-wrap">
<iframe class="demo-embed" src="demo-hadoop-cards.html?embed=1&card=hdfs" height="520" loading="lazy" title="HDFS 카드"></iframe>
<a class="demo-embed-open" href="demo-hadoop-cards.html" target="_blank" rel="noopener">↗ 카드 여섯 장 전체로 열기</a>
</div>

실무에서는 `hdfs://namenode.example.com:8020/warehouse/adlog.db/ad_click/` 같은 주소를 봅니다. 그때 이 그림을 떠올리면 됩니다. 그 주소는 NameNode 에게 「이 경로의 조각들이 어느 상자에 있나」를 묻는 주소입니다. 데이터를 직접 내주는 주소가 아닙니다.

## 3. YARN: 계산할 자리를 나눠 줍니다

**쿼리 하나는 계산 조각 여러 개로 나뉩니다. ResourceManager 가 큐에서 CPU 와 메모리를 떼어 워커 상자의 NodeManager 에 조각을 얹습니다.**

384 MB 파일의 줄 수를 세는 쿼리를 보냈다고 하겠습니다. 이 일은 조각 셋을 각각 세고 합치는 일로 나뉩니다. 조각 하나를 세는 일이 계산 조각 하나입니다. 계산 조각을 어느 상자에서 돌릴지 정하는 것이 YARN 이고, 그 머리가 ResourceManager 상자입니다.

ResourceManager 는 클러스터 전체의 CPU 와 메모리를 큐라는 줄로 나눠 둡니다. 큐는 서버가 아닙니다. 팀마다, 용도마다 자원을 얼마나 쓸 수 있는지 정한 줄입니다. 지훈 씨가 받은 주소의 마지막 조각 `tez.queue.name=analytics` 가 이 줄 이름입니다. 클러스터 CPU 가 1,000개이고 analytics 줄이 30% 라면, 이 줄에 선 쿼리들은 300개 안에서 나눠 씁니다. 300개가 다 쓰이는 중이면 새 쿼리는 줄에서 기다립니다.

<div class="demo-embed-wrap">
<iframe class="demo-embed" src="demo-hadoop-cards.html?embed=1&card=yarn" height="520" loading="lazy" title="YARN 카드"></iframe>
<a class="demo-embed-open" href="demo-hadoop-cards.html" target="_blank" rel="noopener">↗ 카드 여섯 장 전체로 열기</a>
</div>

계산 조각은 아무 상자에나 가지 않습니다. 조각 1 을 세는 일은 조각 1 이 있는 워커 1, 3, 5 중 한 대로 갑니다. 2절에서 데이터를 세 벌 둔 것이 여기서 두 번째로 값을 합니다. 세 대 중 한가한 대를 고를 수 있습니다.

## 4. Hive: SQL 을 받는 서버와 목록을 가진 서버

**HiveServer2 는 SQL 을 받는 서버입니다. Metastore 는 테이블 이름, 컬럼, 파일 위치의 목록을 가진 서버입니다. 둘 다 데이터는 갖고 있지 않습니다.**

지훈 씨의 SQL 을 실제로 받는 상자는 HiveServer2 입니다. 이 상자가 계정을 확인하고, SQL 을 읽고, 실행 계획을 세웁니다. 그런데 계획을 세우려면 `ad_click` 이라는 테이블이 어떤 컬럼이고 파일이 HDFS 어디에 있는지 알아야 합니다. 그 목록을 가진 상자가 Metastore 입니다.

Metastore 가 가진 것은 목록뿐입니다. 테이블 이름은 `adlog.ad_click` 이고 컬럼은 `req_id, ad_id, ts` 입니다. 형식은 parquet 이고 위치는 `hdfs://…/warehouse/adlog.db/ad_click/` 입니다. 이 넷을 보통의 관계형 DB(MySQL 같은 것)에 저장해 둡니다. 그래서 Metastore 뒤에는 DB 상자가 하나 더 있습니다. HiveServer2 가 「ad_click 어디 있어」를 물으면 Metastore 는 HDFS 경로를 돌려줍니다. 데이터가 아니라 경로입니다.

<div class="demo-embed-wrap">
<iframe class="demo-embed" src="demo-hadoop-cards.html?embed=1&card=hive" height="520" loading="lazy" title="Hive 카드 — 쿼리 한 건이 지나는 길"></iframe>
<a class="demo-embed-open" href="demo-hadoop-cards.html" target="_blank" rel="noopener">↗ 카드 여섯 장 전체로 열기</a>
</div>

이 구분이 실무에서 자주 헷갈리는 이유가 있습니다. Spark 나 Trino 같은 다른 엔진은 HiveServer2 를 거치지 않고 Metastore 에 직접 붙어 목록만 읽습니다. 그래서 「Hive 테이블」이라고 부르는 것이 Hive 서버 없이도 읽힙니다. JDBC 와 beeline 은 HiveServer2 에 붙고, Spark 와 Trino 는 Metastore 에 붙습니다.

## 5. ZooKeeper: 살아 있는 서버 목록을 다섯 벌 듭니다

**HiveServer2 는 켜질 때 ZooKeeper 에 자기 주소를 등록합니다. 나는 ZooKeeper 에 물어 살아 있는 HiveServer2 를 찾습니다.**

주소에 적힌 다섯 서버가 여기서 나옵니다. HiveServer2 는 한 대가 아닙니다. 그림에서는 hs2-a 와 hs2-b 두 대입니다. 한 대를 내리고 다시 띄우거나 세 대로 늘리면 주소가 바뀌어야 할 것 같습니다. 그런데 지훈 씨가 받은 주소에는 HiveServer2 이름이 한 글자도 없습니다. HiveServer2 가 켜질 때 ZooKeeper 상자의 `hiveserver2` 라는 폴더에 자기 주소를 적어 두기 때문입니다.

ZooKeeper 는 그 목록을 다섯 상자가 똑같이 들고 있습니다. 다섯 중 셋만 살아 있으면 답합니다. 홀수로 두는 이유는 반반으로 나뉘는 일을 막기 위해서입니다. 지훈 씨의 컴퓨터는 다섯 중 응답하는 한 대에 붙어 목록을 읽고, 거기 적힌 hs2-a 나 hs2-b 중 하나로 갑니다.

<div class="demo-embed-wrap">
<iframe class="demo-embed" src="demo-hadoop-cards.html?embed=1&card=zookeeper" height="520" loading="lazy" title="ZooKeeper 카드"></iframe>
<a class="demo-embed-open" href="demo-hadoop-cards.html" target="_blank" rel="noopener">↗ 카드 여섯 장 전체로 열기</a>
</div>

그래서 HiveServer2 를 늘리거나 바꿔도 지훈 씨의 주소는 그대로입니다. 바뀌는 것은 ZooKeeper 안의 목록이고, 그 목록은 HiveServer2 가 스스로 고칩니다.

## 6. 주소 한 줄을 조각으로 읽습니다

**구분자 셋이 자리를 정합니다. 슬래시 뒤는 데이터베이스, 세미콜론으로 이어진 것은 접속 조건, 물음표 뒤는 Hive 설정입니다.**

지훈 씨가 받은 것과 같은 모양의 주소를 예시 값으로 적으면 이렇습니다.

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

<div class="demo-embed-wrap">
<iframe class="demo-embed" src="demo-hadoop-boxes.html?embed=1&fig=5" height="560" loading="lazy" title="주소 한 줄이 가리키는 상자"></iframe>
<a class="demo-embed-open" href="demo-hadoop-boxes.html" target="_blank" rel="noopener">↗ 상자 그림 여섯 장 전체로 열기</a>
</div>

그림에서 화살표가 나가는 상자는 셋뿐입니다. 회색 조각 하나가 ZooKeeper 로 갑니다. 먹색 조각 둘은 HiveServer2 로 가고, 물음표 뒤 조각 하나가 ResourceManager 의 큐로 갑니다. Metastore 와 HDFS 로 가는 화살표는 없습니다. 그 둘의 주소는 내 주소에 없고 HiveServer2 가 알고 있습니다.

물음표 자리를 틀리면 조용히 무시됩니다. 큐 이름을 세미콜론 쪽에 적으면 접속 조건으로 읽혀 큐가 default 로 잡힙니다. 쿼리는 돌아가는데 남의 팀 자원을 쓰는 상태가 됩니다.

## 7. 쿼리 한 건이 지나는 길

**내가 직접 가는 곳은 ZooKeeper 와 HiveServer2 두 자리입니다. 나머지 다섯 자리는 HiveServer2 가 대신 다닙니다.**

지훈 씨가 `SELECT count(*) FROM adlog.ad_click` 을 보내면 일곱 자리를 지납니다. 1 내 컴퓨터가 ZooKeeper 에 「HiveServer2 어디 있어」를 묻습니다. 2 ZooKeeper 가 목록에서 살아 있는 hs2-a 를 알려 줍니다. 3 내 컴퓨터가 hs2-a 에 계정과 SQL 을 보냅니다. 여기까지가 접속입니다.

4 hs2-a 가 Metastore 에 ad_click 의 컬럼과 파일 위치를 묻습니다. 5 hs2-a 가 ResourceManager 의 analytics 줄에서 자원을 받습니다. 6 워커 상자들의 NodeManager 위에 계산 조각이 얹혀 DataNode 의 조각을 읽고 셉니다. 7 센 결과가 hs2-a 로 모여 내 컴퓨터로 돌아옵니다.

<div class="demo-embed-wrap">
<iframe class="demo-embed" src="demo-hadoop-boxes.html?embed=1&fig=6" height="600" loading="lazy" title="쿼리 한 건이 지나는 길"></iframe>
<a class="demo-embed-open" href="demo-hadoop-boxes.html" target="_blank" rel="noopener">↗ 상자 그림 여섯 장 전체로 열기</a>
</div>

4 부터 7 의 주소는 지훈 씨 컴퓨터에 없습니다. Metastore 주소는 HiveServer2 의 설정 파일에 있습니다. ResourceManager 주소는 클러스터 설정에, 파일 위치는 Metastore 의 목록에 있습니다. 주소 한 줄에 그것들이 안 적힌 것은 빠진 것이 아니라 필요가 없는 것입니다.

## 8. 안 될 때 어디를 보나

**오류 문구에 보이는 낱말이 7절의 번호 중 하나를 가리킵니다. 그 자리부터 봅니다.**

접속이 안 되거나 쿼리가 서 있을 때 일곱 자리 중 어디가 막혔는지를 먼저 정합니다. 오류 문구의 낱말이 힌트입니다. 아래는 자주 보는 여섯 가지입니다.

| 오류 문구에 보이는 것 | 자리 | 먼저 확인할 것 |
|---|---|---|
| ZooKeeper 연결 실패, Connection timed out | 1 ZooKeeper | 사내망인지, 포트가 열려 있는지, 다섯 주소에 오타가 없는지 |
| HiveServer2 configs from ZooKeeper 를 못 읽음, 목록이 비어 있음 | 2 목록 | 폴더 이름 오타인지, HiveServer2 가 하나도 안 떠 있는지 |
| Error validating the login | 3 HiveServer2 | 계정과 비밀번호. 비밀번호에 특수 문자가 있으면 따옴표로 감쌌는지 |
| Table not found, Database does not exist | 4 Metastore | 데이터베이스 이름을 `adlog.ad_click` 처럼 붙였는지 |
| Queue does not exist, 오래 ACCEPTED 로 대기 | 5 YARN | 큐 이름 오타인지, 큐에 낼 권한이 있는지, 큐가 가득 찼는지 |
| Permission denied, access=READ, inode= | 6과 7 HDFS | 테이블 파일에 읽기 권한이 있는지. 목록은 보여도 파일은 못 읽는 경우입니다 |

세 번째 줄은 지훈 씨가 첫날 겪은 것입니다. 비밀번호에 느낌표가 있었는데 셸이 그것을 먹어 버렸습니다. 주소 전체를 따옴표로 감싸니 붙었습니다. 다섯 번째 줄의 ACCEPTED 는 오류가 아닙니다. 줄에 서 있다는 뜻이라 기다리면 돌아갑니다. 큐가 늘 가득 차 있으면 큐 이름을 잘못 적어 default 로 들어간 것이 아닌지부터 봅니다.

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

- **주소의 서버 목록을 Hive 서버로 읽지 마세요.** `serviceDiscoveryMode=zooKeeper` 가 있으면 그 목록은 ZooKeeper 입니다.
- **Metastore 에 데이터가 있다고 생각하지 마세요.** 목록만 있습니다. 테이블 정의가 보여도 파일 권한이 없으면 읽지 못합니다.
- **큐를 서버 이름으로 찾지 마세요.** 큐는 ResourceManager 안의 줄입니다. 웹 화면(포트 8088)에서 줄 상태를 봅니다.
- **큐 이름을 세미콜론 쪽에 적지 마세요.** 접속 조건으로 읽혀 조용히 무시되고 default 큐로 들어갑니다.
- **ACCEPTED 를 오류로 읽지 마세요.** 줄에 서 있다는 뜻입니다. 오래 서 있으면 큐가 가득 찬 것입니다.
- **DROP TABLE 이 파일까지 지운다고 단정하지 마세요.** 테이블이 managed 인지 external 인지에 따라 다릅니다. external 은 목록만 지워집니다.
- **비밀번호가 든 주소를 그대로 공유하지 마세요.** 주소 한 줄에 계정과 비밀번호가 함께 들어 있습니다.

## 더 깊이 보기

- 그림 여섯 장을 한 페이지에서 보려면 [하둡 상자 그림 여섯 장](demo-hadoop-boxes.html)과 [하둡 카드 여섯 장](demo-hadoop-cards.html)이 있습니다. 카드 쪽은 점이 흘러가며 순서를 보여 줍니다.
- 이 테이블의 파일이 어떻게 여기까지 왔는지는 [데이터 유통 층](post.html?id=data-distribution-layer) 편과 [데이터 파이프라인 설계](post.html?id=data-pipeline-design) 편에 있습니다.
- 그 파일이 되기 전, 클릭 한 건이 Kafka 에 놓이기까지는 [Kafka 로그 파이프라인](post.html?id=kafka-log-pipeline) 편입니다.
- 접속 주소의 요청과 응답이 어떤 모양인지는 [API 기초](post.html?id=api-basics) 편에서 다룹니다.
