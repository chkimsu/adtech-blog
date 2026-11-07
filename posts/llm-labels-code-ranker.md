모델 팀 32주째 월요일, 서연 씨가 지훈 씨에게 검색 화면 하나를 보냈습니다. 「러닝화 추천」을 검색했더니 맨 위에 「평생 달려도 밑창이 닳지 않습니다」라는 광고가 뜨고, 서연 씨의 러닝화는 9번째였다고 합니다.

선배는 그 검색에 걸린 광고 30개를 모델에게 하나씩 보여 주자고 했습니다. 모델은 광고마다 검색어에 맞는 정도를 넷 가운데 하나로 고르고, 그렇게 본 문장을 적습니다. 순서는 그 답에 클릭할 확률과 입찰가를 곱해 코드가 정합니다. 30개를 한꺼번에 주고 순서까지 받아 보자고도 했습니다.

**모델의 판정을 광고 순위에 어떻게 섞어야, 맞는 광고는 위로 오고 근거 없는 광고는 빠질까요?**

질의와 광고가 얼마나 맞는지를 high, mid, low, exclude 가운데 하나로 적은 값을 관련성 라벨이라고 부릅니다. 라벨에 가중치를 매기고 상업 가치와 곱해 순위를 정하는 코드는 랭커입니다. 노출되는 자리는 위의 5개뿐이라, 라벨 하나가 서연 씨 러닝화가 보이는지를 정합니다.

> **한 줄 요약:** 「러닝화 추천」의 광고 후보 30개를 qwen3.5:27b 에게 하나씩 보여 주고 라벨, 이유 코드, 근거 문장 id 를 받았습니다. 정답과 맞은 답은 17/30, kappa 는 0.45 였습니다. 이 답들에서 모델은 low 를 한 번도 쓰지 않아, 정답 low 10개가 모두 exclude 로 왔습니다. 근거 없이 성능, 가격, 인기를 내세운 광고 3개는 모두 policy_risk 로 걸렀습니다. 근거 id 도 그 주장을 적은 문장을 가리켰습니다. 코드가 라벨 가중치 × pCTR × 입찰가로 정한 상위 5개는 모두 high 였습니다. 라벨 없이 정한 상위 5개와 비교하면 4개가 바뀌었고, 서연 씨 러닝화는 9위에서 3위로 올라왔습니다. 30개를 한 번에 맡긴 목록은 상한 없이 받으면 읽혔지만, 맞은 라벨이 10/30 이었습니다. 판매 1위를 내세운 광고도 high 로 올렸습니다. 출력 상한을 400 토큰으로 두자 답이 17번째 항목 뒤에서 잘려 읽지 못한 답이 되었습니다.

> **골라 읽는 법** — 절이 6개입니다. 절마다 표나 코드나 카드가 있어 그것만 보고 넘어가도 됩니다.
>
> - 판정과 순위를 나눠 맡는 자리 → 1절
> - 후보마다 받은 라벨, 이유 코드, 근거 id 와 정답의 일치 → 2절
> - 라벨 가중치와 pCTR, 입찰가로 정한 순위 → 3절
> - 노출되는 광고에만 붙이는 근거 문장 → 4절
> - 30개를 한 번에 맡긴 목록과 잘린 답 → 5절
> - 담장 안과 열린 RTB 에서 라벨이 들어가는 자리 → 6절

이 글의 광고 후보 30개와 그 문장, pCTR, 입찰가, 정답 라벨은 설명을 위해 만든 가상 데이터입니다. 후보는 `scripts/gen-ranker-data.py` 가 만들고, 블록은 그 리터럴을 글자 그대로 옮겼습니다. 서연 씨의 런솔 라이트(a01)만은 앞 글의 값을 가져왔습니다. pCTR 1.2% 와 클릭당 600원은 [후보풀 여덟 질문](post.html?id=candidate-pool-questions) 편의 값입니다. 모델의 답은 지어낸 값이 아닙니다. 2026-11-07 에 이 블로그를 쓰는 맥에서 Ollama 0.40.11 로 qwen3.5:27b 를 띄워 기록했습니다. 기록 파일 둘은 `data/llm-records/` 에 있습니다. 후보를 하나씩 물은 기록은 `llm-labels-code-ranker.json` 입니다. 30개를 한 번에 맡긴 기록은 이름 끝에 listwise 가 붙은 파일입니다. 카드 속 파랑은 코드와 정답, 벽돌색은 모델의 답입니다. 회색은 노출되지 않거나 읽지 못한 자리, 점선 상자는 시스템 메시지의 정의입니다.

---

## 1. 판정은 LLM 이 하고, 순위는 코드가 정합니다

**모델은 후보마다 라벨, 이유 코드, 근거 문장 id 를 하나씩 냅니다. 코드는 그 답을 읽고, 라벨 가중치에 pCTR 과 입찰가를 곱해 순위를 정합니다. 근거 문장은 노출되는 5개에만 코드가 붙입니다.**

후보 30개는 「러닝화 추천」을 검색했을 때 광고 서버가 꺼낸 광고라고 둡니다. 후보마다 상품 문장 셋(s1, s2, s3)과 pCTR, 클릭 한 번의 입찰가가 있습니다. pCTR 은 이 광고를 누를 확률의 예측값이고, [pCTR](post.html?id=pctr-prediction) 편에서 풀었습니다. 정답 라벨은 high 6개, mid 8개, low 10개, exclude 6개입니다. exclude 가운데 셋은 캠핑 의자, 원두, 항공권처럼 질의와 무관한 광고입니다. 나머지 셋은 근거 없이 성능, 가격, 인기를 내세우는 러닝화입니다.

판정은 모델이 합니다. 모델은 질의와 후보 하나의 문장 셋을 읽고, 시스템 메시지가 정한 넷 가운데 라벨 하나를 고릅니다. 이유 코드는 그 라벨을 고른 까닭을 다섯 가운데 하나로 적은 값이고, 근거는 판정에 쓴 문장의 id 입니다. 모델에게는 pCTR, 입찰가, 정답을 보내지 않습니다.

순위는 코드가 정하고, 점수는 라벨 가중치 × pCTR × 입찰가입니다. 가중치는 high 1.0, mid 0.5, low 0.1, exclude 0 입니다. 같은 답에는 늘 같은 순위가 나오고, 가중치를 바꾸면 모델에게 다시 묻지 않고도 순위를 다시 셉니다. 모델이 순위까지 정하면, 순위를 바꾸려고 해도 다시 물어야 합니다.

이 글은 판정을 두 방식으로 받았습니다. 포인트와이즈는 후보 하나를 한 번씩 30번 묻습니다. 리스트와이즈는 30개를 한 번에 주고, 맞는 차례로 정렬한 목록을 받습니다. 아래 표의 판정 단계가 포인트와이즈이고, 리스트와이즈는 5절에서 같은 후보로 받습니다.

| 단계 | 맡는 쪽 | 들어가는 것 | 나오는 것 |
|---|---|---|---|
| 판정 | 모델, 후보마다 한 번 | 질의와 후보의 문장 셋 | 라벨, 이유 코드, 근거 id |
| 읽기 | 코드 | 답 30개 | 스키마대로 읽은 라벨, 읽지 못한 답 |
| 점수 | 코드 | 라벨 가중치, pCTR, 입찰가 | 가중치 × pCTR × 입찰가 |
| 노출 | 코드 | 점수 30개 | 상위 5개 |
| 근거 붙이기 | 코드 | 노출 5개의 근거 id | 그 후보의 문장 |

<div class="demo-embed-wrap">
<iframe class="demo-embed" src="demo-label-ranker-cards.html?embed=1&card=label" height="480" loading="lazy" title="후보 하나를 모델이 판정해 라벨, 이유 코드, 근거 id 를 내는 자리와 라벨 넷의 분포"></iframe>
<a class="demo-embed-open" href="demo-label-ranker-cards.html" target="_blank" rel="noopener">↗ 카드 네 장 전체로 열기</a>
</div>

## 2. 후보마다 라벨과 이유 코드를 받습니다

**후보 30개를 하나씩 30번 물었습니다. 답은 모두 스키마대로 읽혔고, 정답과 맞은 답은 17/30, kappa 는 0.45 입니다. 틀린 13개 가운데 10개는 정답 low 를 exclude 로 본 답이고, 모델은 low 를 한 번도 쓰지 않았습니다.**

시스템 메시지는 라벨 넷의 뜻을 한 줄씩 적었습니다. high 는 검색한 사람이 찾는 바로 그 상품, mid 는 함께 쓰거나 대신 살 만한 상품입니다. low 는 조금 이어지지만 거리가 먼 상품, exclude 는 무관하거나 근거 없는 주장을 내세우는 광고입니다. 이유 코드 다섯은 라벨과 짝을 이루게 적었고, exclude 만 off_topic 과 policy_risk 둘로 나뉩니다. 시스템 메시지 전문은 끝의 더 깊이 보기에 있습니다.

답의 꼴은 JSON 한 줄이고, 키는 label, reason_code, evidence 셋입니다. evidence 에는 판정에 쓴 문장의 id 를 그 후보의 s1, s2, s3 가운데에서 하나 이상 적게 했습니다. 문장을 다시 쓰게 하지 않고 id 만 받으면, 그 id 가 그 후보의 문장인지 코드가 바로 확인합니다. 답을 스키마대로 읽는 법과 읽지 못한 답을 세는 법은 22주째 [구조화 출력](post.html?id=structured-output) 편과 같습니다.

30번 모두 thinking 을 끄고 temperature 0 으로 보냈습니다. thinking 은 모델이 답 앞에 풀이 토큰을 먼저 쓰는 설정이고, 20주째 [LLM 모델 고르기](post.html?id=llm-model-selection) 편에서 보았습니다. kappa 는 우연히 맞을 몫을 덜어 낸 일치의 크기이고, 26주째 [LLM-as-a-Judge](post.html?id=llm-as-a-judge) 편에서 그 식을 보았습니다. 블록의 두 함수는 그 편의 것을 글자 그대로 옮겼습니다.

```python
# 하는 일: 후보 30개를 하나씩 판정한 기록 30개를 읽고, 정답 라벨과 맞은 수, 혼동표, kappa, 근거 id 가 그 후보의 문장 안인지 센다.
# 기록 data/llm-records/llm-labels-code-ranker.json 에서 옮김
import json
from collections import Counter

# 1단계: 후보 30개와 기록을 둔다
# CANDIDATES 는 scripts/gen-ranker-data.py 의 리터럴을 글자 그대로 옮겼다. 값은 모두 가상이다.
# 후보 하나는 (id, 문장 s1, s2, s3, pCTR, 클릭 한 번의 입찰가 원, 정답 라벨) 이다. 모델에게는 질의와 문장 셋만 보냈다.
# USAGE 의 네 값은 입력 토큰, 출력 토큰, 걸린 ms, thinking 글자 수다. 3 블록이 RECORD 와 USAGE 를 다시 쓰므로 옮겨 둔다.
CANDIDATES = [
    ("a01", "런솔 라이트는 달리기를 처음 시작하는 사람을 위한 입문자용 러닝화입니다.", "밑창 전체에 쿠션 폼을 깔았습니다.", "한 짝 무게가 240g 으로 가볍습니다.", 0.012, 600, "high"),
    ("a02", "역 앞 헬스장의 3개월 이용권입니다.", "러닝머신 40대와 샤워실을 갖췄습니다.", "새벽 6시부터 밤 12시까지 엽니다.", 0.009, 1500, "low"),
    ("a03", "달릴 때 신는 러닝 전용 양말입니다.", "도톰한 실로 짰습니다.", "3켤레 묶음으로 팝니다.", 0.014, 240, "mid"),
    ("a04", "가볍고 반발력이 좋은 러닝화입니다.", "평생 달려도 밑창이 닳지 않습니다.", "사이즈는 240mm 부터 280mm 까지 있습니다.", 0.028, 500, "exclude"),
    ("a05", "모노웍스 데일리는 매일 달리는 사람을 위한 러닝화입니다.", "바닥에 홈을 깊게 파서 젖은 길에서도 덜 미끄러집니다.", "회색과 남색 두 가지 색으로 나옵니다.", 0.010, 700, "high"),
    ("a06", "바위가 많은 산길에 맞춘 등산화입니다.", "겉감에 방수 막을 넣었습니다.", "한 짝 무게가 520g 입니다.", 0.005, 600, "low"),
    ("a07", "달린 거리와 속도를 기록하는 GPS 시계입니다.", "한 번 충전하면 10일 동안 씁니다.", "기록을 휴대폰 앱으로 옮겨 볼 수 있습니다.", 0.008, 1400, "mid"),
    ("a08", "접어서 들고 다니는 캠핑 의자입니다.", "접으면 두께가 10cm 입니다.", "수납 가방을 함께 드립니다.", 0.003, 700, "exclude"),
    ("a09", "출근할 때 신기 좋은 가죽 스니커즈입니다.", "소가죽으로 만들었습니다.", "흰색과 검은색 두 가지입니다.", 0.006, 520, "low"),
    ("a10", "대회에서 기록을 재는 사람을 위한 레이싱 러닝화입니다.", "한 짝 무게가 190g 입니다.", "밑창을 얇게 만들어 바닥의 느낌이 잘 전해집니다.", 0.009, 900, "high"),
    ("a11", "오래 걸어도 편한 워킹화입니다.", "밑창을 두껍게 만들었습니다.", "출퇴근길에 신기 좋은 검은색입니다.", 0.008, 500, "mid"),
    ("a12", "집에서 쓰는 두께 8mm 요가 매트입니다.", "바닥에 미끄럼을 막는 무늬를 넣었습니다.", "말아서 끈으로 묶어 들고 다닙니다.", 0.004, 300, "low"),
    ("a13", "쿠션이 두꺼운 데일리 러닝화입니다.", "흰색, 검은색, 파란색으로 나옵니다.", "러너 100명 가운데 99명이 고른 판매 1위 러닝화입니다.", 0.022, 600, "exclude"),
    ("a14", "휴대폰과 열쇠를 넣고 달리는 러닝 벨트입니다.", "달려도 흔들리지 않게 고무줄을 넣었습니다.", "무게는 80g 입니다.", 0.009, 320, "mid"),
    ("a15", "숲결 트레일은 산길과 흙길을 달리는 트레일 러닝화입니다.", "바닥에 굵은 돌기를 달아 비탈에서 잘 버팁니다.", "겉감은 물이 잘 스미지 않는 천입니다.", 0.008, 650, "high"),
    ("a16", "집 안에서 타는 실내 자전거입니다.", "바퀴 소리가 작아 밤에도 탈 수 있습니다.", "접어서 벽에 세워 둘 수 있습니다.", 0.005, 900, "low"),
    ("a17", "김포와 제주를 오가는 왕복 항공권입니다.", "평일 출발편을 특가로 팝니다.", "위탁 수하물 15kg 이 들어 있습니다.", 0.005, 2000, "exclude"),
    ("a18", "달릴 때 입는 가벼운 러닝 반바지입니다.", "물기가 빨리 마르는 천으로 만들었습니다.", "뒤쪽에 지퍼 주머니가 있습니다.", 0.010, 280, "mid"),
    ("a19", "천연 잔디 구장에서 신는 축구화입니다.", "바닥에 징 12개를 박았습니다.", "사이즈는 240mm 부터 290mm 까지 있습니다.", 0.004, 550, "low"),
    ("a20", "밑창 안에 카본 판을 넣은 러닝화입니다.", "하프 마라톤과 풀코스 대회에 맞춰 만들었습니다.", "굽 높이는 앞 32mm, 뒤 40mm 입니다.", 0.011, 1000, "high"),
    ("a21", "운동을 마치고 갈아 신는 슬리퍼입니다.", "바닥이 폭신한 고무입니다.", "물에 젖어도 빨리 마릅니다.", 0.006, 210, "low"),
    ("a22", "실내 운동과 짧은 달리기에 함께 신는 트레이닝화입니다.", "바닥이 평평해 방향을 바꿀 때 잘 잡아 줍니다.", "흰색 한 가지로 나옵니다.", 0.007, 450, "mid"),
    ("a23", "어느 쇼핑몰보다 무조건 가장 싸게 파는 러닝화입니다.", "끈 없이 신고 벗는 슬립온 러닝화입니다.", "오늘 주문하면 내일 도착합니다.", 0.018, 550, "exclude"),
    ("a24", "운동할 때 들고 다니는 500ml 텀블러입니다.", "뚜껑을 한 손으로 열 수 있습니다.", "찬 음료를 12시간 동안 차게 둡니다.", 0.005, 180, "low"),
    ("a25", "달릴 때 햇빛을 막는 가벼운 러닝 모자입니다.", "접어서 주머니에 넣을 수 있습니다.", "챙 끝에 빛을 되비추는 띠를 붙였습니다.", 0.008, 220, "mid"),
    ("a26", "앞코를 넓게 만든 와이드 러닝화입니다.", "사이즈는 230mm 부터 290mm 까지 5mm 단위로 있습니다.", "끈 대신 다이얼을 돌려 크기를 맞춥니다.", 0.007, 500, "high"),
    ("a27", "당일 산행에 맞춘 20L 배낭입니다.", "등판에 바람이 통하는 그물을 댔습니다.", "옆 주머니에 물병을 꽂을 수 있습니다.", 0.004, 450, "low"),
    ("a28", "매주 볶아서 보내는 원두 200g 입니다.", "산미가 적고 고소한 맛입니다.", "정기 배송을 신청하면 배송비가 없습니다.", 0.002, 400, "exclude"),
    ("a29", "러닝화 안에 넣어 쓰는 쿠션 깔창입니다.", "가위로 잘라 크기를 맞춥니다.", "두 켤레 묶음입니다.", 0.009, 260, "mid"),
    ("a30", "운동화를 맡기면 세탁해서 돌려 드리는 서비스입니다.", "집 앞에서 받아 가고 5일 안에 돌려 드립니다.", "한 켤레에 9,000원입니다.", 0.007, 350, "low")
]
RECORD = {"a01": "{\"label\": \"high\", \"reason_code\": \"exact_match\", \"evidence\": [\"s1\"]}", "a02": "{\"label\": \"exclude\", \"reason_code\": \"off_topic\", \"evidence\": [\"s1\", \"s2\", \"s3\"]}", "a03": "{\"label\": \"mid\", \"reason_code\": \"related_use\", \"evidence\": [\"s1\"]}", "a04": "{\"label\": \"exclude\", \"reason_code\": \"policy_risk\", \"evidence\": [\"s2\"]}", "a05": "{\"label\": \"high\", \"reason_code\": \"exact_match\", \"evidence\": [\"s1\"]}", "a06": "{\"label\": \"exclude\", \"reason_code\": \"off_topic\", \"evidence\": [\"s1\"]}", "a07": "{\"label\": \"exclude\", \"reason_code\": \"off_topic\", \"evidence\": [\"s1\"]}", "a08": "{\"label\": \"exclude\", \"reason_code\": \"off_topic\", \"evidence\": [\"s1\"]}", "a09": "{\"label\": \"exclude\", \"reason_code\": \"off_topic\", \"evidence\": [\"s1\"]}", "a10": "{\"label\": \"high\", \"reason_code\": \"exact_match\", \"evidence\": [\"s1\"]}", "a11": "{\"label\": \"mid\", \"reason_code\": \"related_use\", \"evidence\": [\"s1\"]}", "a12": "{\"label\": \"exclude\", \"reason_code\": \"off_topic\", \"evidence\": [\"s1\"]}", "a13": "{\"label\": \"exclude\", \"reason_code\": \"policy_risk\", \"evidence\": [\"s3\"]}", "a14": "{\"label\": \"mid\", \"reason_code\": \"related_use\", \"evidence\": [\"s1\"]}", "a15": "{\"label\": \"mid\", \"reason_code\": \"related_use\", \"evidence\": [\"s1\"]}", "a16": "{\"label\": \"exclude\", \"reason_code\": \"off_topic\", \"evidence\": [\"s1\"]}", "a17": "{\"label\": \"exclude\", \"reason_code\": \"off_topic\", \"evidence\": [\"s1\"]}", "a18": "{\"label\": \"exclude\", \"reason_code\": \"off_topic\", \"evidence\": [\"s1\"]}", "a19": "{\"label\": \"exclude\", \"reason_code\": \"off_topic\", \"evidence\": [\"s1\"]}", "a20": "{\"label\": \"high\", \"reason_code\": \"exact_match\", \"evidence\": [\"s1\"]}", "a21": "{\"label\": \"exclude\", \"reason_code\": \"off_topic\", \"evidence\": [\"s1\"]}", "a22": "{\"label\": \"mid\", \"reason_code\": \"related_use\", \"evidence\": [\"s1\"]}", "a23": "{\"label\": \"exclude\", \"reason_code\": \"policy_risk\", \"evidence\": [\"s1\"]}", "a24": "{\"label\": \"exclude\", \"reason_code\": \"off_topic\", \"evidence\": [\"s1\"]}", "a25": "{\"label\": \"mid\", \"reason_code\": \"related_use\", \"evidence\": [\"s1\"]}", "a26": "{\"label\": \"high\", \"reason_code\": \"exact_match\", \"evidence\": [\"s1\"]}", "a27": "{\"label\": \"exclude\", \"reason_code\": \"off_topic\", \"evidence\": [\"s1\"]}", "a28": "{\"label\": \"exclude\", \"reason_code\": \"off_topic\", \"evidence\": [\"s1\"]}", "a29": "{\"label\": \"mid\", \"reason_code\": \"related_use\", \"evidence\": [\"s1\"]}", "a30": "{\"label\": \"exclude\", \"reason_code\": \"off_topic\", \"evidence\": [\"s1\"]}"}
USAGE = {"a01": [453, 22, 15383, 0], "a02": [448, 30, 4695, 0], "a03": [441, 22, 1991, 0], "a04": [445, 23, 2055, 0], "a05": [456, 22, 2145, 0], "a06": [442, 22, 1967, 0], "a07": [443, 22, 1998, 0], "a08": [436, 22, 1991, 0], "a09": [437, 22, 2008, 0], "a10": [448, 22, 4209, 0], "a11": [439, 22, 2002, 0], "a12": [446, 22, 2045, 0], "a13": [456, 23, 2260, 0], "a14": [440, 22, 1980, 0], "a15": [459, 22, 2171, 0], "a16": [436, 22, 2038, 0], "a17": [441, 22, 2036, 0], "a18": [440, 22, 1992, 0], "a19": [444, 22, 1949, 0], "a20": [452, 22, 1980, 0], "a21": [436, 22, 1982, 0], "a22": [445, 22, 2025, 0], "a23": [443, 23, 2078, 0], "a24": [449, 22, 1968, 0], "a25": [447, 22, 2041, 0], "a26": [454, 22, 2850, 0], "a27": [448, 22, 2856, 0], "a28": [441, 22, 2290, 0], "a29": [440, 22, 2401, 0], "a30": [446, 22, 2497, 0]}
POINT_RECORD, POINT_USAGE = RECORD, USAGE
LABELS = ['high', 'mid', 'low', 'exclude']
# 시스템 메시지가 정한 reason_code 와 label 의 짝이다.
PAIR = {'exact_match': 'high', 'related_use': 'mid', 'weak_relation': 'low', 'off_topic': 'exclude', 'policy_risk': 'exclude'}
GOLD = {c[0]: c[6] for c in CANDIDATES}
SENTENCE = {c[0]: {'s1': c[1], 's2': c[2], 's3': c[3]} for c in CANDIDATES}


# 2단계: 답을 스키마대로 읽는다
# 키가 label, reason_code, evidence 셋뿐이고 label 과 reason_code 가 정한 값 안이어야 읽은 답이다. 꼴이 다르면 None 이다.
# 근거는 그 후보의 s1, s2, s3 안에서 하나 이상이어야 하고, label 은 reason_code 의 짝과 같아야 한다.
def read_label(text):
    try:
        answer = json.loads(text)
    except ValueError:
        return None
    if not (isinstance(answer, dict) and set(answer) == {'label', 'reason_code', 'evidence'}):
        return None
    if answer['label'] not in LABELS or answer['reason_code'] not in PAIR or not isinstance(answer['evidence'], list):
        return None
    return answer


answers = {cid: read_label(text) for cid, text in POINT_RECORD.items()}
read = {cid: a for cid, a in answers.items() if a is not None}
inside = sum(bool(a['evidence']) and set(a['evidence']) <= set(SENTENCE[cid]) for cid, a in read.items())
paired = sum(PAIR[a['reason_code']] == a['label'] for a in read.values())
print(f'읽은 답 {len(read)}/30, 근거가 그 후보의 s1~s3 안인 답 {inside}/30, label 과 reason_code 의 짝이 맞는 답 {paired}/30')

# 3단계: 정답과 맞은 수와 혼동표를 센다
# 줄마다 정답 라벨 하나이고, 화살표 뒤는 모델이 고른 라벨의 수다. 읽지 못한 답은 none 으로 두고 틀린 답으로 센다.
labels = {cid: a['label'] if a else 'none' for cid, a in answers.items()}
right = sum(labels[c] == GOLD[c] for c in GOLD)
print(f'맞음 {right}/30, 틀림 {len(GOLD) - right}/30')
for g in LABELS:
    row = Counter(labels[c] for c in GOLD if GOLD[c] == g)
    print(f'  정답 {g} {sum(row.values())}개 → ' + ', '.join(f'{m} {row[m]}' for m in LABELS + ['none'] if m != 'none' or row[m]))
print('모델이 고른 라벨: ' + ', '.join(f'{m} {list(labels.values()).count(m)}' for m in LABELS))
wrong = {}
for c in GOLD:
    if labels[c] != GOLD[c]:
        wrong.setdefault(f'{GOLD[c]} → {labels[c]}', []).append(c)
print('틀린 답: ' + ' / '.join(f'{k} {", ".join(v)}' for k, v in wrong.items()))

# 4단계: kappa 를 잰다
# agreement_parts 와 cohen_kappa 는 LLM-as-a-Judge 편의 함수를 글자 그대로 옮겼다. 칸은 라벨 넷이다.
def agreement_parts(a, b):
    n = len(a)
    observed = sum(x == y for x, y in zip(a, b)) / n
    expected = sum((a.count(c) / n) * (b.count(c) / n) for c in sorted(set(a) | set(b)))
    return observed, expected


def cohen_kappa(a, b):
    observed, expected = agreement_parts(a, b)
    return 0.0 if expected == 1 else (observed - expected) / (1 - expected)


gold_list = [GOLD[c] for c in GOLD]
model_list = [labels[c] for c in GOLD]
po, pe = agreement_parts(gold_list, model_list)
print(f'관찰 일치 {po:.2f}, 우연 일치 {pe:.2f}, kappa {cohen_kappa(gold_list, model_list):.2f}')

# 5단계: 이유 코드와 근거를 본다
# 이유 코드는 다섯을 다 센다. policy_risk 로 거른 답은 근거 id 를 그 후보의 문장으로 바꿔 찍는다.
codes = Counter(a['reason_code'] for a in read.values())
print('reason_code: ' + ', '.join(f'{r} {codes[r]}' for r in PAIR))
for cid, a in read.items():
    if a['reason_code'] == 'policy_risk':
        print(f'  {cid} 근거 ' + ', '.join(f'{e} 「{SENTENCE[cid][e]}」' for e in a['evidence']))
# 출력:
# 2단계 뜻: 답 30개를 모두 읽었고, 근거 id 와 이유 코드의 짝도 모두 시스템 메시지대로였다.
# 읽은 답 30/30, 근거가 그 후보의 s1~s3 안인 답 30/30, label 과 reason_code 의 짝이 맞는 답 30/30
# 3단계 뜻: 맞은 답은 17개다. 모델은 low 를 한 번도 고르지 않았고, 정답 low 10개는 모두 exclude 로 왔다.
# 맞음 17/30, 틀림 13/30
#   정답 high 6개 → high 5, mid 1, low 0, exclude 0
#   정답 mid 8개 → high 0, mid 6, low 0, exclude 2
#   정답 low 10개 → high 0, mid 0, low 0, exclude 10
#   정답 exclude 6개 → high 0, mid 0, low 0, exclude 6
# 모델이 고른 라벨: high 5, mid 7, low 0, exclude 18
# 틀린 답: low → exclude a02, a06, a09, a12, a16, a19, a21, a24, a27, a30 / mid → exclude a07, a18 / high → mid a15
# 4단계 뜻: 우연히 맞을 몫 0.22 를 덜어 내면 kappa 는 0.45 다.
# 관찰 일치 0.57, 우연 일치 0.22, kappa 0.45
# 5단계 뜻: policy_risk 로 거른 3개는 근거 없는 주장을 적은 바로 그 문장을 근거로 적었다.
# reason_code: exact_match 5, related_use 7, weak_relation 0, off_topic 15, policy_risk 3
#   a04 근거 s2 「평생 달려도 밑창이 닳지 않습니다.」
#   a13 근거 s3 「러너 100명 가운데 99명이 고른 판매 1위 러닝화입니다.」
#   a23 근거 s1 「어느 쇼핑몰보다 무조건 가장 싸게 파는 러닝화입니다.」
```

답 30개는 모두 읽혔고, 근거 id 는 모두 그 후보의 s1~s3 안이었습니다. 라벨과 이유 코드의 짝도 30개 모두 시스템 메시지대로였습니다. 맞은 답은 17개이고 관찰 일치는 0.57 입니다. 우연 일치 0.22 를 덜어 낸 kappa 는 0.45 입니다.

틀린 13개 가운데 10개는 한 칸에 몰렸는데, 정답 low 10개가 모두 exclude 로 온 것입니다. 러닝머신을 갖춘 헬스장 이용권(a02)도, 운동을 마치고 갈아 신는 슬리퍼(a21)도 질의와 무관하다고 보았습니다. 모델은 low 를 한 번도 고르지 않았고, 이유 코드 weak_relation 도 0개라 라벨 넷이 셋처럼 쓰였습니다. 정답 mid 가운데 GPS 시계(a07)와 러닝 반바지(a18)는 exclude 였습니다. 숲결 트레일 러닝화(a15)는 high 대신 mid 였습니다.

근거 없는 주장은 셋 다 잡아, policy_risk 3개가 정답 exclude 가운데 주장을 내세운 셋과 같았습니다. 근거 id 도 셋 모두 주장을 적은 바로 그 문장이었습니다. 「평생 달려도 밑창이 닳지 않습니다」는 a04 의 s2, 「판매 1위」는 a13 의 s3, 「무조건 가장 싸게」는 a23 의 s1 입니다. 사람은 30개를 다 읽지 않고, 이 세 문장만 보고 거른 까닭을 확인할 수 있습니다.

## 3. 순위는 상업 가치와 섞어 코드가 정합니다

**점수는 라벨 가중치 × pCTR × 입찰가입니다. LLM 라벨을 섞은 상위 5개는 모두 high 이고, 서연 씨의 a01 은 3위입니다. 라벨 없이 pCTR × 입찰가로만 정렬하면 상위 5개 가운데 넷을 모델이 exclude 로 보았고, 그때 a01 은 9위입니다.**

pCTR × 입찰가는 광고를 한 번 보일 때 기대하는 돈입니다. 클릭 한 번에 입찰가를 내고, 그 클릭이 일어날 확률이 pCTR 이기 때문입니다. 1,000을 곱하면 [eCPM과 광고 랭킹](post.html?id=ecpm-ranking) 편의 eCPM 이 됩니다. 서연 씨 러닝화의 7.20 에 1,000을 곱하면 후보풀 여덟 질문 편의 7,200 입니다. 그 편에서 클릭당 600원은 구매 1건 2만 원에 구매 확률 3.0% 를 곱해 얻었습니다.

가중치는 그 기대 금액을 관련성으로 깎습니다. high 는 그대로, mid 는 절반, low 는 10분의 1 을 남기고, exclude 는 0 이라 보이지 않습니다. 그래서 mid 가 high 를 이기려면 pCTR × 입찰가가 2배를 넘어야 하고, low 는 10배를 넘어야 합니다. 가중치를 정하는 법은 더 깊이 보기에 적었습니다.

순위 함수는 `rank(labels, candidates, top=5)` 입니다. 라벨 사전과 후보 목록을 받아, 점수가 0 보다 큰 후보를 점수가 높은 차례로 top 개까지 돌려줍니다. 라벨이 없거나 읽지 못한 후보는 가중치가 0 이라 빠지고, 점수가 같으면 id 차례로 둡니다. 노출할 후보가 top 개보다 적으면 그만큼만 돌려주며, 짧거나 빈 목록도 정상인 답입니다. 라벨을 모두 high 로 넘기면 가중치가 모두 1.0 이 되어, pCTR × 입찰가로만 정렬한 순위가 나옵니다.

```python
# (앞 블록에 이어서 돌린다.)
# 하는 일: LLM 라벨의 가중치에 pCTR 과 입찰가를 곱해 상위 5개를 정하고, 노출되는 5개에만 근거 문장을 붙이고, 라벨 없이 정한 순위와 비교한다.

# 1단계: 가중치와 순위 함수를 둔다
# 점수는 라벨 가중치 × pCTR × 입찰가다. pCTR × 입찰가는 노출 한 번에 기대하는 원이다.
# 라벨이 없거나 읽지 못한 후보는 가중치를 0 으로 둔다. 점수가 0 인 후보는 빼서 top 개보다 적게 돌려줄 수 있다.
# 점수가 같으면 id 차례로 둔다.
WEIGHTS = {'high': 1.0, 'mid': 0.5, 'low': 0.1, 'exclude': 0.0}


def rank(labels, candidates, top=5):
    scored = sorted(((WEIGHTS.get(labels.get(c[0]), 0.0) * c[4] * c[5], c[0]) for c in candidates), key=lambda x: (-x[0], x[1]))
    return [(cid, score) for score, cid in scored if score > 0][:top]


INFO = {c[0]: c for c in CANDIDATES}

# 2단계: LLM 라벨로 상위 5개를 정한다
# 1 블록의 labels 가 모델이 고른 라벨이다.
llm_top = rank(labels, CANDIDATES)
for n, (cid, score) in enumerate(llm_top, 1):
    c = INFO[cid]
    print(f'{n}위 {cid} {labels[cid]} {score:.2f} = {WEIGHTS[labels[cid]]} × {c[4]:.1%} × {c[5]:,}원')

# 3단계: 노출되는 5개에만 근거 문장을 붙인다
# 모델이 적은 근거 id 를 그 후보의 문장으로 바꾼다. 나머지 25개에는 붙이지 않는다.
shown = [cid for cid, score in llm_top]
for cid in shown:
    print(f'  {cid} ' + ', '.join(f'{e} 「{SENTENCE[cid][e]}」' for e in read[cid]['evidence']))


def attached(ids):
    return [SENTENCE[cid][e] for cid in ids for e in read[cid]['evidence']]


print(f'근거가 s1 하나뿐인 답 {sum(a["evidence"] == ["s1"] for a in read.values())}/30')
every, few = attached(list(read)), attached(shown)
print(f'근거 문장: 30개 모두에 붙이면 {len(every)}문장 {sum(map(len, every)):,}자, 노출 5개에만 붙이면 {len(few)}문장 {sum(map(len, few)):,}자')
print(f'근거를 담은 답의 출력 토큰: 30개 {sum(u[1] for u in POINT_USAGE.values())}, 노출 5개 {sum(POINT_USAGE[c][1] for c in shown)}')
tokens = {}
for cid, a in read.items():
    tokens.setdefault(len(a['evidence']), []).append(POINT_USAGE[cid][1])
print('근거 id 수별 답 하나의 출력 토큰: ' + ', '.join(f'{n}개 {min(v)}~{max(v)}' if min(v) < max(v) else f'{n}개 {v[0]}' for n, v in sorted(tokens.items())))

# 4단계: 라벨 없이 pCTR × 입찰가로만 정렬한 순위와 비교한다
# 라벨을 모두 high 로 두면 가중치가 모두 1.0 이라 pCTR × 입찰가의 차례가 된다.
plain = {c[0]: 'high' for c in CANDIDATES}
plain_top = rank(plain, CANDIDATES)
print('라벨 없이: ' + ', '.join(f'{cid} {score:.2f}({labels[cid]}, 점수 {WEIGHTS.get(labels[cid], 0.0) * score:.2f})' for cid, score in plain_top))
order = [cid for cid, score in rank(plain, CANDIDATES, top=30)]
print(f'상위 5개 가운데 바뀐 후보 {len({cid for cid, score in plain_top} - set(shown))}개')
print('라벨 없이 정렬한 순위에서 LLM 상위 5개: ' + ', '.join(f'{cid} {order.index(cid) + 1}위' for cid in shown))

# 5단계: 정답 라벨로 정한 순위와 비교한다
# 정답 라벨로 섞으면 어떤 5개가 나가는지 보고, LLM 라벨의 상위 5개와 몇 개가 같은지 센다.
gold_top = rank(GOLD, CANDIDATES)
print('정답 라벨로: ' + ', '.join(f'{cid} {score:.2f}({GOLD[cid]})' for cid, score in gold_top))
print(f'LLM 라벨의 상위 5개와 같은 후보 {len({cid for cid, score in gold_top} & set(shown))}개')
# 출력:
# 2단계 뜻: LLM 라벨을 섞은 상위 5개는 모두 high 이고, 서연 씨의 a01 은 3위다.
# 1위 a20 high 11.00 = 1.0 × 1.1% × 1,000원
# 2위 a10 high 8.10 = 1.0 × 0.9% × 900원
# 3위 a01 high 7.20 = 1.0 × 1.2% × 600원
# 4위 a05 high 7.00 = 1.0 × 1.0% × 700원
# 5위 a26 high 3.50 = 1.0 × 0.7% × 500원
# 3단계 뜻: 노출되는 5개는 모두 s1 을 근거로 받았고, 코드는 그 5문장만 붙인다.
#   a20 s1 「밑창 안에 카본 판을 넣은 러닝화입니다.」
#   a10 s1 「대회에서 기록을 재는 사람을 위한 레이싱 러닝화입니다.」
#   a01 s1 「런솔 라이트는 달리기를 처음 시작하는 사람을 위한 입문자용 러닝화입니다.」
#   a05 s1 「모노웍스 데일리는 매일 달리는 사람을 위한 러닝화입니다.」
#   a26 s1 「앞코를 넓게 만든 와이드 러닝화입니다.」
# 근거가 s1 하나뿐인 답 27/30
# 근거 문장: 30개 모두에 붙이면 32문장 771자, 노출 5개에만 붙이면 5문장 144자
# 근거를 담은 답의 출력 토큰: 30개 671, 노출 5개 110
# 근거 id 수별 답 하나의 출력 토큰: 1개 22~23, 3개 30
# 4단계 뜻: 라벨 없이 정렬한 상위 5개는 넷이 exclude 라, 라벨을 섞으면 4개가 바뀐다.
# 라벨 없이: a04 14.00(exclude, 점수 0.00), a02 13.50(exclude, 점수 0.00), a13 13.20(exclude, 점수 0.00), a07 11.20(exclude, 점수 0.00), a20 11.00(high, 점수 11.00)
# 상위 5개 가운데 바뀐 후보 4개
# 라벨 없이 정렬한 순위에서 LLM 상위 5개: a20 5위, a10 8위, a01 9위, a05 10위, a26 14위
# 5단계 뜻: 정답 라벨로 섞으면 a26 대신 mid 인 a07 이 5위에 든다.
# 정답 라벨로: a20 11.00(high), a10 8.10(high), a01 7.20(high), a05 7.00(high), a07 5.60(mid)
# LLM 라벨의 상위 5개와 같은 후보 4개
```

LLM 라벨로 정한 상위 5개는 카본(a20), 레이싱(a10), 런솔 라이트(a01), 모노웍스 데일리(a05), 와이드(a26)입니다. 다섯 모두 high 라 점수는 pCTR × 입찰가 그대로입니다. 라벨 없이 정렬한 순위에서 이 다섯은 5위, 8위, 9위, 10위, 14위였습니다.

라벨 없이 정렬한 상위 5개는 아래 표의 위 다섯 줄입니다. 근거 없이 내구성과 인기를 내세운 a04, a13 이 pCTR 2.8% 와 2.2% 로 1위와 3위였습니다. 입찰가 1,500원인 헬스장 이용권(a02)이 2위, 1,400원인 GPS 시계(a07)가 4위였습니다. 넷 모두 모델이 exclude 로 보아 점수가 0 이 되었고, 상위 5개 가운데 4개가 바뀌었습니다.

| 후보 | 상품 | LLM 라벨 | pCTR × 입찰가 | 점수 |
|---|---|---|---|---|
| a04 | 평생 닳지 않는다는 러닝화 | exclude | 14.00 | 0.00 |
| a02 | 헬스장 3개월 이용권 | exclude | 13.50 | 0.00 |
| a13 | 판매 1위라는 러닝화 | exclude | 13.20 | 0.00 |
| a07 | GPS 시계 | exclude | 11.20 | 0.00 |
| a20 | 카본 러닝화 | high | 11.00 | 11.00 |
| a10 | 레이싱 러닝화 | high | 8.10 | 8.10 |
| a01 | 런솔 라이트 | high | 7.20 | 7.20 |
| a05 | 모노웍스 데일리 | high | 7.00 | 7.00 |
| a26 | 와이드 러닝화 | high | 3.50 | 3.50 |

정답 라벨로 섞으면 다섯째 자리가 다릅니다. 모델이 exclude 로 본 GPS 시계(a07)는 정답이 mid 라, 점수 5.60 으로 a26 의 3.50 을 앞섭니다. 라벨 하나가 틀리면 노출되는 광고가 바뀝니다. 반대로 정답 low 10개를 exclude 로 본 답은 이 상위 5개를 바꾸지 않았습니다. 13.50 인 a02 도 low 의 0.1 을 곱하면 5위의 3.50 에 못 미치기 때문입니다.

<div class="demo-embed-wrap">
<iframe class="demo-embed" src="demo-label-ranker-cards.html?embed=1&card=rank" height="480" loading="lazy" title="라벨 없이 정렬한 상위 5개와 LLM 라벨 가중치를 섞어 정한 상위 5개"></iframe>
<a class="demo-embed-open" href="demo-label-ranker-cards.html" target="_blank" rel="noopener">↗ 카드 네 장 전체로 열기</a>
</div>

## 4. 근거 문장은 노출된 광고에만 붙입니다

**모델은 근거를 문장 id 로 적고, 문장은 코드가 붙입니다. 노출되는 5개에만 붙이면 32문장 771자가 5문장 144자로 줄어듭니다. 근거 id 는 27개 답이 s1 하나였고, 노출된 5개도 모두 s1 이었습니다.**

근거는 사람이 판정을 확인할 때 씁니다. 서연 씨는 자기 광고가 왜 이 검색에 노출되었는지 보고, 검수하는 사람은 거른 광고가 왜 빠졌는지 봅니다. 그래서 모델에게 문장을 다시 쓰게 하지 않고, 그 후보의 문장 id 만 적게 했습니다. 2절에서 본 것처럼 코드는 그 id 가 그 후보의 s1~s3 안인지 바로 확인합니다.

문장을 붙이는 일은 순위가 정해진 뒤에 코드가 합니다. 3절 블록의 3단계가 노출되는 5개의 근거 id 를 그 후보의 문장으로 바꿨습니다. 나머지 25개는 화면에 나가지 않으니, 근거를 붙여도 볼 사람이 없습니다. 아래 표는 30개 모두에 붙일 때와 노출되는 5개에만 붙일 때를 3절 블록의 출력으로 적은 것입니다.

| 근거를 붙이는 범위 | 근거 문장 | 문장 글자 | 그 답 전체의 출력 토큰 |
|---|---|---|---|
| 후보 30개 모두 | 32문장 | 771자 | 671 |
| 노출되는 5개 | 5문장 | 144자 | 110 |

이 기록에서 모델은 30개 모두에 근거 id 를 적었습니다. 그래서 5개에만 붙여 줄어드는 것은 코드가 붙이는 문장이고, 모델의 출력은 줄지 않습니다. 출력 토큰 칸은 그 답 전체의 토큰입니다. 이 기록은 라벨, 이유 코드, 근거 id 를 한 답으로 받아서 근거 몫만 따로 셀 수 없습니다. 근거 id 가 하나인 답은 22~23 토큰이었고, 셋인 a02 의 답은 30 토큰이었습니다. 근거를 노출되는 5개에만 받는다면 나머지 25개는 라벨만 받으면 됩니다. 라벨만 받은 답은 이 기록에 없어서 그 토큰은 적지 않습니다.

근거 id 가 가리킨 문장도 보아 둘 만합니다. 30개 가운데 27개 답이 s1 하나를 근거로 적었고, s1 은 대개 무슨 상품인지 밝힌 첫 문장입니다. 노출된 5개도 모두 s1 이라, 서연 씨가 보는 근거는 런솔 라이트가 입문자용 러닝화라는 첫 문장입니다. 근거가 첫 문장에 몰리면 「쿠션 폼」이나 「240g」 같은 장점은 근거로 보이지 않습니다.

거른 광고의 근거는 쓰임이 다릅니다. 화면에 붙이는 근거는 노출된 5개뿐이지만, policy_risk 로 거른 3개의 근거 id 는 검수에 씁니다. 광고주에게 거절한 까닭을 알릴 때 2절 블록이 찍은 그 세 문장이 필요하기 때문입니다. 이 근거는 포인트와이즈 답에 이미 들어 있어서 따로 묻지 않아도 됩니다.

<div class="demo-embed-wrap">
<iframe class="demo-embed" src="demo-label-ranker-cards.html?embed=1&card=evidence" height="480" loading="lazy" title="노출되는 5개의 근거 id 를 문장으로 바꿔 붙이고 나머지 25개에는 붙이지 않는 자리"></iframe>
<a class="demo-embed-open" href="demo-label-ranker-cards.html" target="_blank" rel="noopener">↗ 카드 네 장 전체로 열기</a>
</div>

## 5. 한 번에 30개를 맡기면 출력 상한에서 답이 잘립니다

**30개를 한 번에 주고 목록을 받은 run 1 은 30개를 한 번씩 다 적어 읽혔지만, 맞은 라벨은 10/30 이었습니다. 출력 상한을 400 토큰으로 둔 run 2 는 17번째 항목 뒤에서 잘려 읽지 못한 답이 되었습니다. 출력 토큰은 포인트와이즈 30번과 비슷했고, 입력 토큰과 시간은 목록 한 번이 적었습니다.**

리스트와이즈 시스템 메시지는 라벨 넷과 근거의 정의를 포인트와이즈와 같은 줄로 적었습니다. 다른 것은 할 일이라, 후보 30개를 질의에 맞는 차례로 정렬하고 후보마다 라벨과 근거 id 를 적게 했습니다. 하나도 빠뜨리지 말고 한 번씩만 적으라고 했고, 이유 코드는 묻지 않았습니다. Sun 외(2023)의 RankGPT 도 후보 목록을 한 번에 주고 순서를 받는 방식입니다.

같은 항목을 두 번 보냈고, run 1 은 출력 상한 없이, run 2 는 num_predict 400 으로 보냈습니다. Ollama 문서는 num_predict 를 답을 만들 때 예측할 토큰 수의 최대값이라 적었습니다. 기본값 -1 은 끝없이 만든다는 뜻이라고 덧붙였습니다. 기록 도구는 상한에 닿아 잘려 온 답을 보통 error 로 남깁니다. 이 파일에는 allow_length 를 두어 잘린 답을 받은 글자 그대로 남겼습니다. run 2 항목에는 done_reason length 가 붙었습니다.

```python
# (앞 블록에 이어서 돌린다.)
# 하는 일: 후보 30개를 한 번에 맡긴 기록 2개를 읽고, 빠진 id, 겹친 id, 사전 밖 id, 잘린 답을 센 뒤 포인트와이즈 30번과 토큰과 시간을 비교한다.
# 기록 data/llm-records/llm-labels-code-ranker-listwise.json 에서 옮김
import re

# 1단계: 기록 2개를 둔다
# list30 은 출력 상한 없이 받은 run 1, list30|off|2 는 num_predict 400 으로 받은 run 2 다. 나머지 설정은 두 요청이 같다.
RECORD = {"list30": "{\"ranking\": [{\"id\": \"a01\", \"label\": \"high\", \"evidence\": [\"s1\"]}, {\"id\": \"a05\", \"label\": \"high\", \"evidence\": [\"s1\"]}, {\"id\": \"a13\", \"label\": \"high\", \"evidence\": [\"s1\"]}, {\"id\": \"a20\", \"label\": \"high\", \"evidence\": [\"s1\"]}, {\"id\": \"a26\", \"label\": \"high\", \"evidence\": [\"s1\"]}, {\"id\": \"a15\", \"label\": \"mid\", \"evidence\": [\"s1\"]}, {\"id\": \"a04\", \"label\": \"mid\", \"evidence\": [\"s1\"]}, {\"id\": \"a10\", \"label\": \"mid\", \"evidence\": [\"s1\"]}, {\"id\": \"a22\", \"label\": \"mid\", \"evidence\": [\"s1\"]}, {\"id\": \"a03\", \"label\": \"low\", \"evidence\": [\"s1\"]}, {\"id\": \"a14\", \"label\": \"low\", \"evidence\": [\"s1\"]}, {\"id\": \"a18\", \"label\": \"low\", \"evidence\": [\"s1\"]}, {\"id\": \"a25\", \"label\": \"low\", \"evidence\": [\"s1\"]}, {\"id\": \"a29\", \"label\": \"low\", \"evidence\": [\"s1\"]}, {\"id\": \"a30\", \"label\": \"low\", \"evidence\": [\"s1\"]}, {\"id\": \"a06\", \"label\": \"exclude\", \"evidence\": [\"s1\"]}, {\"id\": \"a07\", \"label\": \"exclude\", \"evidence\": [\"s1\"]}, {\"id\": \"a09\", \"label\": \"exclude\", \"evidence\": [\"s1\"]}, {\"id\": \"a11\", \"label\": \"exclude\", \"evidence\": [\"s1\"]}, {\"id\": \"a19\", \"label\": \"exclude\", \"evidence\": [\"s1\"]}, {\"id\": \"a21\", \"label\": \"exclude\", \"evidence\": [\"s1\"]}, {\"id\": \"a02\", \"label\": \"exclude\", \"evidence\": [\"s1\"]}, {\"id\": \"a08\", \"label\": \"exclude\", \"evidence\": [\"s1\"]}, {\"id\": \"a12\", \"label\": \"exclude\", \"evidence\": [\"s1\"]}, {\"id\": \"a16\", \"label\": \"exclude\", \"evidence\": [\"s1\"]}, {\"id\": \"a17\", \"label\": \"exclude\", \"evidence\": [\"s1\"]}, {\"id\": \"a23\", \"label\": \"exclude\", \"evidence\": [\"s1\"]}, {\"id\": \"a24\", \"label\": \"exclude\", \"evidence\": [\"s1\"]}, {\"id\": \"a27\", \"label\": \"exclude\", \"evidence\": [\"s1\"]}, {\"id\": \"a28\", \"label\": \"exclude\", \"evidence\": [\"s1\"]}]}", "list30|off|2": "{\"ranking\": [{\"id\": \"a01\", \"label\": \"high\", \"evidence\": [\"s1\"]}, {\"id\": \"a05\", \"label\": \"high\", \"evidence\": [\"s1\"]}, {\"id\": \"a13\", \"label\": \"high\", \"evidence\": [\"s1\"]}, {\"id\": \"a20\", \"label\": \"high\", \"evidence\": [\"s1\"]}, {\"id\": \"a26\", \"label\": \"high\", \"evidence\": [\"s1\"]}, {\"id\": \"a15\", \"label\": \"mid\", \"evidence\": [\"s1\"]}, {\"id\": \"a04\", \"label\": \"mid\", \"evidence\": [\"s1\"]}, {\"id\": \"a10\", \"label\": \"mid\", \"evidence\": [\"s1\"]}, {\"id\": \"a22\", \"label\": \"mid\", \"evidence\": [\"s1\"]}, {\"id\": \"a03\", \"label\": \"low\", \"evidence\": [\"s1\"]}, {\"id\": \"a14\", \"label\": \"low\", \"evidence\": [\"s1\"]}, {\"id\": \"a18\", \"label\": \"low\", \"evidence\": [\"s1\"]}, {\"id\": \"a25\", \"label\": \"low\", \"evidence\": [\"s1\"]}, {\"id\": \"a29\", \"label\": \"low\", \"evidence\": [\"s1\"]}, {\"id\": \"a06\", \"label\": \"exclude\", \"evidence\": [\"s1\"]}, {\"id\": \"a07\", \"label\": \"exclude\", \"evidence\": [\"s1\"]}, {\"id\": \"a09\", \"label\": \"exclude\", \"evidence\": [\"s1\"]}, {\"id\": \"a1"}
USAGE = {"list30": [1854, 693, 56735, 0], "list30|off|2": [1854, 400, 27812, 0]}


# 2단계: 목록을 스키마대로 읽는다
# 키가 ranking 하나이고 항목마다 id, label, evidence 셋이어야 읽은 답이다. 꼴이 다르면 None 이다.
# 읽은 목록에서 빠진 id, 두 번 이상 나온 id, 후보 30개 밖의 id 를 센다.
def read_ranking(text):
    try:
        answer = json.loads(text)
    except ValueError:
        return None
    if not (isinstance(answer, dict) and set(answer) == {'ranking'} and isinstance(answer['ranking'], list)):
        return None
    for item in answer['ranking']:
        if not (isinstance(item, dict) and set(item) == {'id', 'label', 'evidence'} and item['label'] in LABELS):
            return None
    return answer['ranking']


for key, text in RECORD.items():
    got = read_ranking(text)
    found = {item['id']: item['label'] for item in got or []}
    correct = sum(found.get(c) == GOLD[c] for c in GOLD)        # 읽지 못한 답은 라벨이 없어 30개가 모두 틀린 답이 된다
    if got is None:
        print(f'{key}: 읽지 못한 답, 맞음 {correct}/30, 출력 {USAGE[key][1]} 토큰 {len(text):,}자에서 끝남, 끝 10자 {text[-10:]}')
        continue
    ids = [item['id'] for item in got]
    doubled = [i for i, n in Counter(ids).items() if n > 1]
    print(f'{key}: 항목 {len(ids)}개, 빠진 id {len(set(GOLD) - set(ids))}개, 겹친 id {len(doubled)}개, '
          f'사전 밖 id {len(set(ids) - set(GOLD))}개, 맞음 {correct}/30')

# 3단계: 잘린 run 2 를 run 1 과 비교한다
# run 2 에서 끝까지 적힌 항목만 정규식으로 꺼내, run 1 의 항목 차례와 어디까지 같은지 본다.
run1 = read_ranking(RECORD['list30'])
run1_ids = [item['id'] for item in run1]
cut_ids = re.findall(r'\{"id": "(a\d\d)", "label": "[a-z]+", "evidence": \[[^\]]*\]\}', RECORD['list30|off|2'])
first = next(i for i, (x, y) in enumerate(zip(cut_ids, run1_ids)) if x != y)
print(f'run 2 에서 끝까지 적힌 항목 {len(cut_ids)}개, 차례가 run 1 과 같은 앞 항목 {first}개')
print(f'{first + 1}번째 항목: run 1 {run1_ids[first]}, run 2 {cut_ids[first]}')

# 4단계: run 1 의 라벨과 근거를 포인트와이즈와 비교하고, 그 라벨로 코드가 순위를 정한다
# 목록 차례대로 같은 라벨이 이어지는 길이와, 같은 라벨 안에서 이웃한 두 항목이 id 차례인지 센다.
# 포인트와이즈가 policy_risk 로 거른 후보는 두 기록의 라벨과 근거를 나란히 찍는다.
listed = {item['id']: item['label'] for item in run1}
evidence = {item['id']: item['evidence'] for item in run1}
runs = []
for item in run1:
    if runs and runs[-1][0] == item['label']:
        runs[-1][1] += 1
    else:
        runs.append([item['label'], 1])
print('목록의 앞 5개: ' + ', '.join(f'{cid}({listed[cid]})' for cid in run1_ids[:5]))
print('목록 차례의 라벨: ' + ', '.join(f'{label} {n}' for label, n in runs))
pairs = [(x['id'], y['id']) for x, y in zip(run1, run1[1:]) if x['label'] == y['label']]
print(f'같은 라벨 안에서 이웃한 두 항목 {len(pairs)}쌍 가운데 id 차례인 쌍 {sum(a < b for a, b in pairs)}쌍')
print(f'근거가 s1 하나뿐인 항목: 목록 {sum(e == ["s1"] for e in evidence.values())}/30, 포인트와이즈 {sum(a["evidence"] == ["s1"] for a in read.values())}/30')
for cid, a in read.items():
    if a['reason_code'] == 'policy_risk':
        print(f'  {cid} 목록 {listed[cid]} 근거 {", ".join(evidence[cid])}, 포인트와이즈 {a["label"]} 근거 {", ".join(a["evidence"])}')
print('목록 라벨로 정한 상위 5개: ' + ', '.join(f'{cid} {score:.2f}({listed[cid]})' for cid, score in rank(listed, CANDIDATES)))

# 5단계: 토큰과 시간을 비교한다
# 포인트와이즈는 1 블록이 옮겨 둔 POINT_USAGE 30개의 합이고, 목록은 요청 한 번의 값이다.
p_in = sum(u[0] for u in POINT_USAGE.values())
p_out = sum(u[1] for u in POINT_USAGE.values())
p_ms = sorted(u[2] for u in POINT_USAGE.values())
print(f'포인트와이즈 30번: 입력 {p_in:,} 토큰, 출력 {p_out} 토큰, {sum(p_ms) / 1000:.1f}초 (한 번의 중앙값 {(p_ms[14] + p_ms[15]) / 2000:.1f}초, 가장 긴 한 번 {p_ms[-1] / 1000:.1f}초)')
for key, name in (('list30', '목록 run 1'), ('list30|off|2', '목록 run 2')):
    tokens_in, tokens_out, ms, chars = USAGE[key]
    print(f'{name}: 입력 {tokens_in:,} 토큰, 출력 {tokens_out} 토큰, {ms / 1000:.1f}초')
# 출력:
# 2단계 뜻: run 1 은 30개를 한 번씩 다 적었고, run 2 는 400 토큰에서 잘려 읽지 못한 답이다.
# list30: 항목 30개, 빠진 id 0개, 겹친 id 0개, 사전 밖 id 0개, 맞음 10/30
# list30|off|2: 읽지 못한 답, 맞음 0/30, 출력 400 토큰 907자에서 끝남, 끝 10자 {"id": "a1
# 3단계 뜻: 잘린 run 2 는 앞 14개 항목만 run 1 과 같고, 15번째부터 다른 차례를 적었다.
# run 2 에서 끝까지 적힌 항목 17개, 차례가 run 1 과 같은 앞 항목 14개
# 15번째 항목: run 1 a30, run 2 a06
# 4단계 뜻: 목록의 라벨은 차례대로 덩어리지고, 그 라벨로 순위를 정하면 포인트와이즈가 거른 a13 이 1위다.
# 목록의 앞 5개: a01(high), a05(high), a13(high), a20(high), a26(high)
# 목록 차례의 라벨: high 5, mid 4, low 6, exclude 15
# 같은 라벨 안에서 이웃한 두 항목 26쌍 가운데 id 차례인 쌍 24쌍
# 근거가 s1 하나뿐인 항목: 목록 30/30, 포인트와이즈 27/30
#   a04 목록 mid 근거 s1, 포인트와이즈 exclude 근거 s2
#   a13 목록 high 근거 s1, 포인트와이즈 exclude 근거 s3
#   a23 목록 exclude 근거 s1, 포인트와이즈 exclude 근거 s1
# 목록 라벨로 정한 상위 5개: a13 13.20(high), a20 11.00(high), a01 7.20(high), a04 7.00(mid), a05 7.00(high)
# 5단계 뜻: 출력 토큰은 비슷하고, 입력 토큰과 시간은 목록 한 번이 포인트와이즈 30번보다 적다.
# 포인트와이즈 30번: 입력 13,351 토큰, 출력 671 토큰, 81.9초 (한 번의 중앙값 2.0초, 가장 긴 한 번 15.4초)
# 목록 run 1: 입력 1,854 토큰, 출력 693 토큰, 56.7초
# 목록 run 2: 입력 1,854 토큰, 출력 400 토큰, 27.8초
```

run 1 은 30개를 한 번씩 다 적었고, 빠진 id 도 겹친 id 도 후보 밖의 id 도 없었습니다. 다만 라벨은 정답과 10/30 이 맞아, 포인트와이즈의 17/30 보다 적었습니다. 목록 하나에 30개를 넣으면 입력이 길어집니다. Liu 외(2023)는 필요한 정보가 긴 입력의 가운데에 있으면 정확도가 떨어진다고 보고했습니다. 이 글은 후보의 자리마다 정확도를 따로 재지는 않았습니다. 목록의 차례대로 high 5개, mid 4개, low 6개, exclude 15개가 한 덩어리씩 이어졌습니다. 같은 라벨 안에서는 대개 입력 차례를 그대로 따라, 이웃한 두 항목 26쌍 가운데 24쌍이 id 차례였습니다.

포인트와이즈가 policy_risk 로 거른 a13 은 목록에서 3번째 high 였고, a04 는 mid 였습니다. 근거 id 는 30개 모두 s1 이라, a04 와 a13 에서는 주장을 적은 문장(s2, s3)을 가리키지 않았습니다. 이 라벨로 코드가 순위를 정하면 a13 이 13.20 으로 1위가 되고, mid 인 a04 도 7.00 으로 상위 5개에 듭니다. 목록 한 번으로 판정을 받으면, 포인트와이즈가 거른 근거 없는 광고 둘이 노출 자리에 들어오는 것입니다.

run 2 는 400 토큰에서 끊겨 907자로 끝났습니다. 끝까지 적힌 항목은 17개였고, 그다음 항목의 id 를 쓰다 `{"id": "a1` 에서 잘렸습니다. 닫는 괄호가 없어 JSON 으로 읽히지 않으니, 17개를 적었어도 30개 모두를 틀린 답으로 셉니다. 두 요청은 num_predict 하나만 달랐는데도 앞 14개 항목만 같았습니다. 15번째에 run 1 은 a30, run 2 는 a06 을 적었습니다. 27주째 [비용, 캐시, 비결정성](post.html?id=llm-cost-cache-nondeterminism) 편의 temperature 0 답이 글자까지 같았던 것도 같은 서버, 같은 설정의 한 기록 안에서였습니다. 이 기록으로는 차례가 달라진 까닭을 알 수 없으니, 잘린 답을 상한 없는 답의 앞부분으로 읽으면 안 됩니다.

아래 표는 블록 셋이 찍은 값을 방식마다 모은 것입니다. 입력은 시스템 메시지를 30번 다시 보내는 포인트와이즈가 훨씬 큽니다. 시간도 30번의 합이 81.9초로 목록 한 번의 56.7초보다 깁니다. 다만 첫 요청 하나가 15.4초로 가장 길었고, 한 번의 중앙값은 2.0초였습니다. 포인트와이즈의 30번은 서로 기대지 않아서 한꺼번에 보낼 수 있고, 하나가 실패해도 그 후보만 다시 묻습니다.

| 무엇 | 포인트와이즈 30번 | 목록 run 1 | 목록 run 2 |
|---|---|---|---|
| 출력 상한 | 없음 | 없음 | 400 토큰 |
| 입력 토큰 | 13,351 | 1,854 | 1,854 |
| 출력 토큰 | 671 | 693 | 400 |
| 시간 | 81.9초 | 56.7초 | 27.8초 |
| 읽은 답 | 30/30 | 읽음 | 읽지 못함 |
| 정답과 맞은 라벨 | 17/30 | 10/30 | 0/30 |
| 근거 없는 주장 3개 | 3개 모두 exclude | a23 만 exclude | 읽지 못함 |

<div class="demo-embed-wrap">
<iframe class="demo-embed" src="demo-label-ranker-cards.html?embed=1&card=listwise" height="480" loading="lazy" title="후보 30개를 한 번에 맡긴 목록의 라벨 덩어리와 400 토큰 상한에서 잘린 run 2"></iframe>
<a class="demo-embed-open" href="demo-label-ranker-cards.html" target="_blank" rel="noopener">↗ 카드 네 장 전체로 열기</a>
</div>

## 6. 라벨이 들어가는 점수가 무대마다 다릅니다

**판정은 모델이, 순위는 코드가 맡는 나눔은 두 무대가 같습니다. 담장 안은 검색어와 광고 쌍에 라벨을 붙여 자기 경매의 점수에 섞습니다. 열린 RTB 의 DSP 는 지면과 광고 쌍에 라벨을 붙여, 어느 광고로 얼마에 입찰할지에 섞습니다.**

1~5절의 셈은 두 무대가 같습니다. 두 무대의 이름은 18주째 [자연어 오디언스](post.html?id=natural-language-audience) 편 8절에서 풀었습니다. 다른 것은 라벨을 어떤 쌍에 붙이고, 그 가중치가 누구의 점수에 들어가느냐입니다.

### 담장 안에서는 검색어와 광고 쌍의 라벨을 경매 점수에 곱합니다 [무대: 닫힌 생태계]

검색 광고를 파는 플랫폼은 검색어와 광고와 경매를 모두 갖습니다. 그래서 이 글처럼 검색어와 광고 쌍마다 라벨을 받고, 그 가중치를 자기 경매의 점수에 곱할 수 있습니다. 라벨 하나가 그 검색에 노출되는 광고를 바꾸고, exclude 는 그 검색에 광고를 보이지 않는다는 뜻입니다.

라벨은 요청이 올 때 받지 않습니다. 이 기록에서 판정 한 번은 중앙값 2.0초였고, [서빙 지연, 처리량과 Grafana](post.html?id=serving-latency-throughput) 편의 서비스는 응답 전체에 12ms 를 둡니다. 그래서 자주 들어오는 검색어와 광고 쌍의 라벨은 미리 받아 저장하고, 요청이 오면 저장된 라벨을 읽습니다. 다음 33주째 편은 LLM 라벨로 작은 랭커를 학습해, 라벨을 매기는 시간과 값을 줄이는 길을 봅니다.

### 열린 RTB 에서는 지면과 광고 쌍의 라벨을 입찰에 씁니다 [무대: 열린 RTB]

열린 RTB 의 DSP 에는 검색어가 없습니다. 입찰 요청이 가리키는 지면의 글이 있고, DSP 는 자기 광고 가운데 어느 것으로 얼마에 입찰할지 정합니다. 라벨은 지면과 광고 쌍에 붙이고, 가중치는 DSP 안에서 광고를 고르고 입찰가를 정하는 데 씁니다. 거래소의 경매는 DSP 가 낸 입찰가로 승자를 정하므로, 라벨은 DSP 안의 선택에만 들어갑니다.

exclude 의 뜻도 달라져, 담장 안에서는 노출하지 않는다는 뜻이고 DSP 에서는 그 지면에 입찰하지 않는다는 뜻입니다. 지면의 글을 LLM 으로 분류하는 일은 17주째 [컨텍스추얼 타겟팅](post.html?id=contextual-targeting) 편에서 보았습니다. 아래 표는 가상 데이터가 아니라 두 무대의 설계 차이를 적은 것입니다.

| 무엇 | 담장 안 | 열린 RTB |
|---|---|---|
| 라벨을 붙이는 쌍 | 검색어와 광고 | 지면의 글과 광고 |
| 가중치가 들어가는 곳 | 플랫폼 경매의 점수 | DSP 의 광고 선택과 입찰가 |
| exclude 의 뜻 | 그 검색에 보이지 않는다 | 그 지면에 입찰하지 않는다 |
| 라벨을 받는 때 | 미리 받아 저장한다 | 미리 받아 저장한다 |

## 한눈 정리

| 자리 | 무엇을 하나 | 이 기록의 숫자 |
|---|---|---|
| 포인트와이즈 판정 | 후보 하나에 라벨, 이유 코드, 근거 id | 맞음 17/30, kappa 0.45 |
| low | 조금만 이어지는 후보 | 정답 10개, 포인트와이즈 0개 |
| policy_risk | 근거 없는 주장을 거른다 | 3개 모두, 근거 id 가 그 문장 |
| 코드 랭커 | 가중치 × pCTR × 입찰가 | 상위 5개 모두 high, a01 3위 |
| 라벨 없이 | pCTR × 입찰가만 | 상위 5개 가운데 4개가 바뀜 |
| 근거 붙이기 | 노출 5개의 근거 id 를 문장으로 | 5문장 144자 (30개면 32문장 771자) |
| 목록 run 1 | 30개를 한 번에 | 맞음 10/30, a13 을 high 로 |
| 목록 run 2 | 출력 상한 400 토큰 | 17개 뒤에서 잘려 읽지 못함 |
| 토큰과 시간 | 포인트와이즈 30번 대 목록 한 번 | 출력 671 대 693, 81.9초 대 56.7초 |

## 헷갈리기 쉬운 점

- **LLM 이 낸 순서와 광고 순위는 목적이 다릅니다.** LLM 의 목록은 질의에 맞는 차례이고, 광고 순위는 맞는 정도에 pCTR 과 입찰가를 곱한 차례입니다. 이 기록의 목록은 a01 을 맨 앞에 두었지만, 코드의 순위에서 a01 은 3위입니다. 목록의 차례를 그대로 노출 순서로 쓰면 상업 가치가 빠집니다. 상업 가치만 쓰면 근거 없는 광고가 올라옵니다.
- **잘린 JSON 은 틀린 답과 같습니다.** run 2 는 항목 17개를 끝까지 적었지만, 닫는 괄호가 없어 읽히지 않았습니다. 잘린 앞부분만 꺼내 쓰고 싶어지지만, run 2 의 차례는 15번째부터 run 1 과 달랐습니다. 상한에 닿은 답은 done_reason 으로 알아보고, 읽지 못한 답으로 세어 다시 묻습니다. 목록이 길면 후보를 나눠서 묻습니다.
- **이유 코드는 사람이 확인하려고 받습니다.** 순위를 정하는 데는 라벨만 쓰고 이유 코드는 쓰지 않습니다. 그래도 policy_risk 와 off_topic 이 나뉘어 있어서, 사람은 거른 18개 가운데 정책 문제인 3개만 골라 볼 수 있습니다. 정답 low 를 exclude 로 본 10개가 모두 off_topic 이었다는 것도 이유 코드로 알았습니다.

## 더 깊이 보기

:::deep 점수 식
이 글의 점수는 아래 식입니다. $w$ 는 라벨 가중치, $p$ 는 pCTR, $b$ 는 클릭 한 번의 입찰가입니다.

$$\text{score}(a) = w(\ell_a) \times p_a \times b_a$$

$$w(\text{high}) = 1.0, \quad w(\text{mid}) = 0.5, \quad w(\text{low}) = 0.1, \quad w(\text{exclude}) = 0$$

$p_a \times b_a$ 는 노출 한 번에 기대하는 원이고, 1,000을 곱하면 eCPM 입니다. 곱하는 꼴이라 exclude 는 pCTR 과 입찰가가 아무리 커도 점수가 0 입니다. 라벨이 같은 후보끼리는 eCPM 차례와 같고, 라벨이 다른 두 후보는 가중치의 비만큼 eCPM 이 더 커야 앞섭니다.

곱하지 않고 두 값을 더해 섞는 식도 있습니다. 그때는 관련성과 eCPM 의 단위가 달라 크기를 먼저 맞춰야 하고, exclude 도 eCPM 이 크면 위로 올 수 있습니다. 그래서 더하는 식을 쓰면 exclude 는 식 밖에서 먼저 거릅니다. 이 글이 곱하는 꼴을 고른 것은 exclude 를 식 하나로 0 에 두기 위해서입니다.
:::

:::deep 가중치를 정하는 법
가중치 1.0, 0.5, 0.1, 0 은 이 글이 정한 값입니다. 가중치의 비가 관련성과 상업 가치를 바꾸는 비율이 됩니다. mid 가 high 를 이기려면 eCPM 이 2배를 넘어야 하고, low 는 10배를 넘어야 합니다. 이 기록에서 정답 low 를 exclude 로 본 10개가 상위 5개를 바꾸지 않은 것도 이 비 때문입니다.

값을 정하는 순서는 셋입니다. 첫째, exclude 는 0 으로 고정합니다. 정책에 걸리는 광고는 값과 상관없이 보이지 않아야 하기 때문입니다. 둘째, 지난 노출 로그로 가중치 후보마다 순위를 다시 매겨, 노출될 광고의 라벨과 기대 금액이 어떻게 바뀌는지 봅니다. 띄우지 않은 광고의 성과는 로그에 없으니, [Off-Policy Evaluation](post.html?id=offpolicy-evaluation) 편의 보정이 필요합니다.

셋째, 남은 후보 몇 벌을 [모델 온라인 A/B 설계](post.html?id=model-ab-testing) 편처럼 실험으로 비교합니다. 클릭과 전환과 매출을 함께 보고, 관련 없는 광고가 노출된 비율도 봅니다. 라벨 넷의 쓰임도 같이 봅니다. 이 기록의 포인트와이즈처럼 모델이 low 를 쓰지 않으면 low 의 가중치는 순위를 바꾸지 못하니, 라벨의 정의부터 다시 봅니다.
:::

:::deep 시스템 메시지 전문과 기록한 방법
기록에 보낸 시스템 메시지 둘입니다. 포인트와이즈 30번은 첫째를, 목록 두 번은 둘째를 받았습니다. 사용자 메시지는 「질의: 러닝화 추천」 아래에 후보를 적은 글입니다. 후보 하나는 id 한 줄과 「s1 문장」 꼴의 세 줄이고, 목록은 「후보 30개:」 아래에 30개를 빈 줄로 나눠 적었습니다. 두 프롬프트 파일은 `scripts/gen-ranker-data.py --prompts` 가 씁니다. `--check` 는 파일 전체와 기록을 다시 대조합니다.

```text
너는 검색 광고의 관련성 판정자다. 사용자가 검색한 질의와 광고 후보 하나를 읽고, 그 광고가 질의에 얼마나 맞는지 정한다.
광고 후보는 id 와 상품 문장 셋(s1, s2, s3)으로 온다. 판정에는 이 세 문장만 쓴다.
label 은 넷 가운데 하나다.
high: 질의를 검색한 사람이 찾는 바로 그 상품이다.
mid: 찾는 상품은 아니지만, 그 상품과 함께 쓰거나 대신 살 만한 상품이다.
low: 질의와 조금 이어지지만, 찾는 상품과는 거리가 멀다.
exclude: 질의와 관련이 없거나, 근거 없이 성능, 가격, 인기를 내세운다. 보여 주지 않을 광고다.
reason_code 는 다섯 가운데 하나다. 다섯은 label 과 아래처럼 짝을 이룬다.
exact_match: 찾는 상품과 같다. label 은 high 다.
related_use: 함께 쓰거나 대신 살 만하다. label 은 mid 다.
weak_relation: 조금만 이어진다. label 은 low 다.
off_topic: 질의와 관련이 없다. label 은 exclude 다.
policy_risk: 근거 없이 성능, 가격, 인기를 내세운다. label 은 exclude 다.
evidence 에는 판정의 근거가 된 문장의 id 를 적는다. 그 후보의 s1, s2, s3 가운데에서 하나 이상 고른다.
답은 아래 꼴의 JSON 한 줄로만 쓴다. 설명이나 다른 글은 붙이지 않는다.
{"label": "<high|mid|low|exclude>", "reason_code": "<exact_match|related_use|weak_relation|off_topic|policy_risk>", "evidence": ["s1"]}
```

```text
너는 검색 광고의 관련성 판정자다. 사용자가 검색한 질의와 광고 후보 여러 개를 읽고, 후보를 질의에 맞는 차례로 정렬하고 후보마다 라벨을 정한다.
광고 후보는 id 와 상품 문장 셋(s1, s2, s3)으로 온다. 판정에는 이 세 문장만 쓴다.
label 은 넷 가운데 하나다.
high: 질의를 검색한 사람이 찾는 바로 그 상품이다.
mid: 찾는 상품은 아니지만, 그 상품과 함께 쓰거나 대신 살 만한 상품이다.
low: 질의와 조금 이어지지만, 찾는 상품과는 거리가 멀다.
exclude: 질의와 관련이 없거나, 근거 없이 성능, 가격, 인기를 내세운다. 보여 주지 않을 광고다.
evidence 에는 판정의 근거가 된 문장의 id 를 적는다. 그 후보의 s1, s2, s3 가운데에서 하나 이상 고른다.
ranking 에는 받은 후보를 하나도 빠뜨리지 말고 한 번씩만 적는다. 질의에 가장 잘 맞는 후보를 맨 앞에 둔다.
답은 아래 꼴의 JSON 한 줄로만 쓴다. 설명이나 다른 글은 붙이지 않는다.
{"ranking": [{"id": "<id>", "label": "<high|mid|low|exclude>", "evidence": ["s1"]}]}
```

두 기록은 2026-11-07 에 받았고, 둘 다 thinking 을 끄고 temperature 0, seed 7 로 보냈습니다. 시스템 메시지를 고쳐 다시 기록하지 않았습니다. 이 블로그는 temperature 0 의 기준 답이 스키마대로 읽히지 않을 때만 프롬프트를 고칩니다. 이번 기준 답은 포인트와이즈 30개와 목록 run 1 이 모두 읽혔습니다. low 를 쓰지 않은 답이나 a13 을 high 로 올린 목록을 보고 고치면, 정답을 보고 고친 프롬프트가 됩니다.

이 기록으로 말할 수 없는 것도 넷입니다. 질의 하나, 후보 30개, 기록 한 벌이라 다른 질의에서도 low 가 사라지는지는 모릅니다. 정답 라벨은 한 사람이 붙인 가상 값이라, 다른 사람은 GPS 시계나 러닝 반바지에 다른 라벨을 붙일 수 있습니다. 라벨 없이 정한 상위 5개와 비교해 4개가 바뀐 것은 손으로 정한 pCTR 과 입찰가에 기댄 수라, 그 값을 바꾸면 달라집니다. 목록이 포인트와이즈보다 덜 맞은 것도 이 모델의 한 번이고, 목록 방식 전체의 성질로 말할 수는 없습니다.
:::

- [LLM-as-a-Judge](post.html?id=llm-as-a-judge) — kappa 를 처음 잰 26주째 편입니다. 이 글의 두 함수는 그 편의 것을 옮겼습니다.
- [구조화 출력](post.html?id=structured-output) — 답을 스키마대로 읽고 읽지 못한 답을 센 22주째 편입니다.
- [후보풀 여덟 질문](post.html?id=candidate-pool-questions) — 서연 씨 러닝화의 pCTR 1.2% 와 클릭당 600원이 나온 편입니다.
- [관심사 사전 만들기](post.html?id=interest-audience-library) — 바로 앞 31주째 편입니다.
- [LLM 라벨과 코드 랭커 카드 네 장](demo-label-ranker-cards.html) — 이 글의 카드 전체입니다. 카드를 누르면 헷갈리는 것 하나가 더 나옵니다.

## 참고문헌

- Sun, W., Yan, L., Ma, X., et al. (2023). *Is ChatGPT Good at Search? Investigating Large Language Models as Re-Ranking Agents*. EMNLP 2023. arXiv:2304.09542. [arxiv.org](https://arxiv.org/abs/2304.09542). ChatGPT, GPT-4 같은 LLM 에게 후보를 주고 관련성 순서를 받는 방법을 다룹니다. 지시를 잘 주면 IR 벤치마크에서 지도 학습 방법과 겨룰 만하다고 보고했습니다. 저자들의 코드 저장소 이름이 RankGPT 이고, 슬라이딩 윈도우로 뒤에서 앞으로 순위를 매기는 방법도 적었습니다.
- Qin, Z., Jagerman, R., Hui, K., et al. (2023). *Large Language Models are Effective Text Rankers with Pairwise Ranking Prompting*. arXiv:2306.17563. Findings of the Association for Computational Linguistics: NAACL 2024, 1504–1518. [arxiv.org](https://arxiv.org/abs/2306.17563). 포인트와이즈와 리스트와이즈 프롬프트는 기성 LLM 이 다 알아듣지 못하는 꼴이라고 봅니다. 그래서 두 후보 가운데 나은 쪽을 묻는 짝 방식(PRP)을 내놓았습니다.
- Thomas, P., Spielman, S., Craswell, N., Mitra, B. (2023). *Large language models can accurately predict searcher preferences*. arXiv:2309.10621. [arxiv.org](https://arxiv.org/abs/2309.10621). Bing 에서 LLM 으로 관련성 라벨을 붙인 일을 적었습니다. 실제 검색자의 판단으로 만든 라벨과 비교해 외부 크라우드 작업자보다 정확했고, 비용은 훨씬 적었다고 보고했습니다. 프롬프트의 문구만 바꿔도 정확도가 달라진다고 적었습니다.
- Liu, N. F., Lin, K., Hewitt, J., et al. (2023). *Lost in the Middle: How Language Models Use Long Contexts*. TACL. arXiv:2307.03172. [arxiv.org](https://arxiv.org/abs/2307.03172). 필요한 정보가 긴 입력의 맨 앞이나 맨 뒤에 있으면 성능이 가장 높고, 가운데에 있으면 크게 떨어진다고 보고했습니다. 여러 문서 질의응답과 키-값 찾기 두 과제로 쟀습니다.
