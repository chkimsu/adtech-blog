모델 팀 26주째 월요일, 지훈 씨는 선배에게서 표 하나를 받았습니다. 「캠핑 의자」, 「헤드셋」, 「스니커즈」를 쳤을 때 나온 상품 50건입니다. 상품마다 상, 중, 하 가운데 하나가 적힌 칸이 붙어 있습니다. 선배가 지난달에 문서를 하나씩 읽으며 단 값입니다.

다음 주부터는 검색 결과가 바뀔 때마다 이런 표가 새로 나옵니다. 50건을 다 읽는 데 선배는 오후 한나절을 썼다고 했습니다. 지훈 씨 혼자 매번 다 읽을 수는 없습니다. 선배는 점수 기준을 다섯 줄로 적어 모델에게 건네 보자고 했습니다. 1점부터 5점까지 점수마다 뜻을 한 줄씩 적습니다. 모델이 매긴 점수를 선배가 단 상, 중, 하와 비교하면, 맡겨도 될지 알 수 있습니다.

**모델이 매긴 점수는 사람과 얼마나 맞고, 그것을 무엇으로 잴까요?**

선배는 하나를 더 시켰습니다. 상품 둘을 나란히 보여 주고 더 나은 쪽을 고르게 하는 것입니다. 이때는 두 상품의 자리를 바꿔 한 번 더 묻습니다. 같은 두 상품을 두고 답이 바뀌면 그 답은 믿기 어렵기 때문입니다.

> **한 줄 요약:** LLM 에게 채점을 맡기는 방법을 LLM-as-a-Judge 라고 부릅니다. 점수마다 뜻을 적어 건네는 기준은 채점표라고 합니다. 일치율은 판정이 사람 라벨과 같은 칸을 고른 몫입니다. Cohen's kappa 는 우연히 맞을 몫을 뺀 뒤에 남는 일치의 크기입니다. 짝비교는 둘 가운데 나은 쪽을 고르게 하는 판정입니다. 자리를 바꾸면 승자가 바뀌는 일은 위치 편향이라고 부릅니다. 가상 질의와 상품 쌍 50개를 1~5 점으로 채점하자 일치율은 32/50 = 0.64, kappa 는 0.45 였습니다. 사람이 중을 단 15쌍은 모두 하로 판정되었습니다. 짝비교 20쌍 가운데 18쌍은 두 번 다 사람과 같은 쪽을 골랐습니다. 남은 2쌍은 순서를 바꾸자 승자가 바뀌었습니다.

> **골라 읽는 법** — 절이 6개입니다. 절마다 표나 코드나 카드가 있어 그것만 보고 넘어가도 됩니다.
>
> - 사람 라벨을 어떻게 정했고, 채점표에 무엇을 적었나 → 1절
> - 채점 50건과 사람 라벨의 일치율 → 2절
> - 일치율 대신 Cohen's kappa 를 보는 까닭 → 3절
> - 자리를 바꿔 다시 물은 짝비교와 위치 편향 → 4절
> - 판정을 쓰는 세 자리와 자기 선호 편향 → 5절
> - 두 무대에서 판정을 쓰는 때 → 6절

이 글의 질의 셋, 상품 문서 100건, 사람 라벨 상, 중, 하는 설명을 위해 만든 가상 데이터입니다. 상품 문서는 [RAG](post.html?id=rag-basics) 편의 100건을 그대로 가져왔습니다. 점수와 승자, 토큰 수와 시간은 지어낸 값이 아닙니다. 2026-11-05 에 이 블로그를 쓰는 맥에서 Ollama 0.40.11 로 qwen3.5:27b 를 띄워 기록했습니다. 채점 기록 파일은 `data/llm-records/llm-as-a-judge.json` 입니다. 짝비교 기록은 같은 폴더의 `llm-as-a-judge-pairs.json` 입니다. 카드의 파랑은 코드가 하는 일, 벽돌색은 모델의 판정입니다. 먹색은 질의와 상품, 회색은 사람과 다른 판정, 점선 상자는 가상 값입니다.

---

## 1. 사람이 50쌍을 다 볼 수 없어 모델에게 채점표를 줍니다

**사람 라벨은 사람이 쌍마다 문서를 읽어야 생깁니다. 검색 결과가 바뀔 때마다 그렇게 할 수는 없습니다. 그래서 점수 다섯 칸의 뜻을 적은 채점표를 모델에게 주고 채점을 맡깁니다.**

검색 품질을 보려면 질의와 상품 쌍마다 서로 관련이 있는지 알아야 합니다. 가장 믿을 만한 값은 사람이 읽고 단 라벨입니다. 이 글의 라벨은 상, 중, 하 세 칸입니다. 쌍이 늘면 사람이 읽을 문서도 그만큼 늘어, 라벨을 다는 시간도 같이 늡니다.

LLM-as-a-Judge 는 그 읽는 일을 LLM 에게 맡깁니다. 사람은 채점표를 한 번 쓰고, 일부 쌍에만 라벨을 답니다. 그 라벨로 모델의 판정이 사람과 얼마나 맞는지 잽니다. 충분히 맞으면 나머지 쌍은 모델이 채점하고, 사람은 그 가운데 일부만 다시 봅니다.

이 글의 가상 사람 라벨은 상품의 분류로 정했습니다. 상품의 분류가 질의의 분류와 같으면 상입니다. 미리 정해 둔 이웃 분류면 중이고, 그 밖은 하입니다. 「캠핑 의자」는 캠핑 분류이고 이웃은 가방입니다. 「헤드셋」은 음향이고 이웃은 잡화, 「스니커즈」는 신발이고 이웃은 잡화입니다.

채점표는 1점부터 5점까지 점수마다 뜻을 한 줄씩 적었습니다. 5점은 질의가 찾는 바로 그 상품이고, 4점은 같은 분류의 상품입니다. 3점은 가까운 분류라 함께 살 만한 상품입니다. 2점은 분류는 다르지만 조금 이어지는 상품, 1점은 관련 없는 상품입니다.

점수 다섯 칸은 사람 라벨 세 칸으로 옮겨 비교합니다. 4~5점은 상, 3점은 중, 1~2점은 하입니다. 3점이 사람의 중에 닿도록 적었지만, 모델은 이웃 분류의 목록을 받지 않았습니다. 「가까운 분류」를 무엇으로 읽을지는 모델에게 맡겨진 셈입니다.

| 점수 | 채점표의 뜻 | 옮기는 칸 | 사람 라벨의 기준 |
|---|---|---|---|
| 5 | 질의가 찾는 바로 그 상품 | 상 | 질의와 같은 분류 |
| 4 | 질의와 같은 분류의 상품 | 상 | 질의와 같은 분류 |
| 3 | 가까운 분류라 함께 살 만한 상품 | 중 | 이웃 분류 (캠핑은 가방, 음향과 신발은 잡화) |
| 2 | 분류는 다르지만 조금 이어지는 상품 | 하 | 그 밖의 분류 |
| 1 | 질의와 관련 없는 상품 | 하 | 그 밖의 분류 |

<div class="demo-embed-wrap">
<iframe class="demo-embed" src="demo-judge-cards.html?embed=1&card=rubric" height="480" loading="lazy" title="채점표 다섯 줄과 사람 라벨 세 칸"></iframe>
<a class="demo-embed-open" href="demo-judge-cards.html" target="_blank" rel="noopener">↗ 카드 네 장 전체로 열기</a>
</div>

## 2. 채점 50건을 사람 라벨과 비교합니다

**질의 셋에 상품 16~17건씩, 모두 50쌍을 채점했습니다. 읽지 못한 답은 0개였고, 일치율은 32/50 = 0.64 입니다. 사람이 중을 단 15쌍은 모두 하로 판정되었습니다.**

쌍은 질의마다 같은 분류 6건, 이웃 분류 5건, 그 밖 5~6건으로 골랐습니다. 같은 분류는 [임베딩과 벡터 검색](post.html?id=embeddings-vector-search) 편의 장난감 임베딩으로 코사인이 큰 차례입니다. 나머지는 시드 7 의 난수로 뽑았습니다. 사람 라벨은 상 18개, 중 15개, 하 17개입니다.

사용자 메시지는 「질의:」 줄과 「상품:」 줄 두 줄입니다. 상품 줄에는 문서 한 건의 문장을 다 넣었습니다. 답은 「{"score": N}」 꼴의 JSON 한 줄로만 쓰게 했습니다. JSON 을 코드로 읽는 방법은 [구조화 출력](post.html?id=structured-output) 편에서 다뤘습니다. 블록은 키가 score 하나이고 값이 1~5 의 정수일 때만 읽은 답으로 칩니다. 그 밖은 읽지 못한 답으로 세고, 사람과 다른 판정으로 칩니다.

기록하기 전에 50쌍 밖의 쌍 하나로 답의 꼴부터 봤습니다. 「텐트」 질의와 문서 d001 이었고, 답은 JSON 으로 읽혔습니다. 그래서 채점표를 고치지 않고 그대로 썼습니다. 50쌍은 thinking 을 끄고 temperature 0 으로 한 번씩 보냈습니다. thinking 은 답 앞에 모델이 쓰는 풀이이고, temperature 는 다음 토큰을 얼마나 흔들리게 뽑을지 정하는 값입니다. 두 상수는 `--export-constant --with-usage` 가 찍은 줄 그대로입니다.

```python
# 하는 일: 질의와 상품 쌍 50개에 사람 라벨을 달고, 기록한 점수 50개를 상, 중, 하로 옮겨 사람과 비교한다.
# 기록 data/llm-records/llm-as-a-judge.json 에서 옮김
import json
import math
import random
import zlib

# 1단계: 상품 문서 100건과 질의와 상품 쌍 50개, 사람 라벨을 만든다
# 상품 문서는 RAG 편의 make_products, make_docs 를 그대로 가져왔고, embed 와 cosine 도 같은 것이다.
# 질의마다 같은 분류 6건은 코사인이 큰 차례로 고르고, 이웃 분류 5건과 그 밖 6건이나 5건은 시드 7 의 난수로 고른다.
# 사람 라벨은 분류로 정한 가상 정답이다. scripts/gen-judge-pairs.py 와 같은 코드다.
CATEGORIES = {
    '캠핑': ['캠핑의자', '캠핑테이블', '텐트'],
    '음향': ['헤드폰', '무선이어폰', '블루투스스피커'],
    '신발': ['운동화', '스니커즈', '러닝화'],
    '잡화': ['선글라스', '손목시계', '모자'],
    '가방': ['백팩', '크로스백', '여행가방'],
    '주방': ['프라이팬', '전기포트', '텀블러'],
    '뷰티': ['선크림', '립밤', '핸드크림'],
    '육아': ['유모차', '아기띠', '젖병'],
}
BRANDS = ['하이라이프', '온팩토리', '아틀라이프', '별랩', '윤라이프', '숲결', '모노웍스', '다온']
STYLES = ['슬림', '와이드', '베이직', '프로', '라이트', '접이식', '방수', '심플']
COLORS = ['블랙', '화이트', '그레이', '브라운', '카키', '네이비']


def make_products(n=3000, seed=7):
    rng = random.Random(seed)
    names = list(CATEGORIES)
    products = []
    for i in range(n):
        category = names[i % len(names)]
        noun = rng.choice(CATEGORIES[category])
        model = rng.choice('ABCDEFGHKLMRSTX') + rng.choice('ABCDEFGHKLMRSTX') + str(rng.randint(100, 999))
        name = ' '.join([rng.choice(BRANDS), rng.choice(STYLES), rng.choice(COLORS), noun, model])
        products.append({'id': i, 'name': name, 'category': category})
    return products


# 색은 이름의 색을 영어 낱말로 옮긴다. 소재와 무게(g), 가격(원)은 카테고리마다 정한 범위에서 뽑는다.
COLOR_EN = {'블랙': 'black', '화이트': 'white', '그레이': 'gray', '브라운': 'brown', '카키': 'khaki', '네이비': 'navy'}
MATERIALS = {'캠핑': ['aluminum', 'steel', 'nylon'], '음향': ['plastic', 'aluminum'], '신발': ['leather', 'nylon', 'cotton'],
             '잡화': ['plastic', 'steel', 'cotton'], '가방': ['nylon', 'leather', 'cotton'], '주방': ['steel', 'aluminum'],
             '뷰티': ['plastic'], '육아': ['plastic', 'cotton', 'aluminum']}
WEIGHT = {'캠핑': (800, 6000), '음향': (30, 900), '신발': (200, 900), '잡화': (30, 300),
          '가방': (400, 4000), '주방': (200, 1500), '뷰티': (20, 200), '육아': (100, 9000)}
PRICE = {'캠핑': (30000, 300000), '음향': (20000, 400000), '신발': (40000, 200000), '잡화': (10000, 300000),
         '가방': (30000, 250000), '주방': (10000, 120000), '뷰티': (5000, 40000), '육아': (10000, 600000)}
EXTRA = ['포장에는 설명서가 들어 있다', '배송은 주문 다음 날 시작한다', '교환은 받은 날부터 일주일 안에 할 수 있다',
         '색이 다른 같은 모델도 있다']


def make_docs(n=100, seed=7):
    """상품 n건의 설명문. 문장은 셋이나 넷이고, 둘째와 셋째 문장에 속성 넷이 있다."""
    rng = random.Random(seed)
    docs = []
    for p in make_products(n, seed):
        brand, style, color, noun, code = p['name'].split()
        cat = p['category']
        attrs = {'weight': rng.randrange(WEIGHT[cat][0], WEIGHT[cat][1], 10),
                 'price': rng.randrange(PRICE[cat][0], PRICE[cat][1], 100),
                 'color': COLOR_EN[color], 'material': rng.choice(MATERIALS[cat])}
        sents = ['상품 %s 의 분류는 %s 이다.' % (p['name'], cat),
                 '%s 의 색은 %s 이고, 소재는 %s 이다.' % (code, attrs['color'], attrs['material']),
                 '%s 의 무게는 %dg 이고, 가격은 %d원이다.' % (code, attrs['weight'], attrs['price'])]
        if rng.random() < 0.5:
            sents.append('%s 의 %s.' % (code, rng.choice(EXTRA)))
        docs.append({'id': 'd%03d' % (p['id'] + 1), 'brand': brand, 'noun': noun, 'code': code,
                     'attrs': attrs, 'text': ' '.join(sents)})
    return docs


DIM = 384


def embed(text):
    chars = text.replace(' ', '').lower()
    vec = [0.0] * DIM
    for i in range(len(chars) - 1):
        vec[zlib.crc32(chars[i:i + 2].encode('utf-8')) % DIM] += 1.0
    norm = math.sqrt(sum(x * x for x in vec))
    return [x / norm for x in vec] if norm else vec


def cosine(a, b):
    dot = sum(x * y for x, y in zip(a, b))
    na = math.sqrt(sum(x * x for x in a))
    nb = math.sqrt(sum(y * y for y in b))
    return dot / (na * nb) if na and nb else 0.0


# 질의 셋과 그 분류, 분류마다 정해 둔 이웃 분류 하나. 사람 라벨은 이 두 표로 정한다.
QUERIES = {'캠핑 의자': '캠핑', '헤드셋': '음향', '스니커즈': '신발'}
NEAR = {'캠핑': '가방', '음향': '잡화', '신발': '잡화'}
CATEGORY_OF = {noun: cat for cat, nouns in CATEGORIES.items() for noun in nouns}


def human_label(query, doc):
    """상품 분류가 질의의 분류와 같으면 상, 이웃 분류면 중, 그 밖은 하."""
    cat = CATEGORY_OF[doc['noun']]
    if cat == QUERIES[query]:
        return '상'
    return '중' if cat == NEAR[QUERIES[query]] else '하'


def make_pairs(docs, seed=7):
    """질의마다 같은 분류 6건(코사인이 큰 차례), 이웃 분류 5건, 그 밖 6건이나 5건. 모두 50쌍."""
    rng = random.Random(seed)
    pairs = []
    for qi, (query, cat) in enumerate(QUERIES.items()):
        qv = embed(query)
        same = sorted([d for d in docs if CATEGORY_OF[d['noun']] == cat], key=lambda d: -cosine(qv, embed(d['text'])))
        near = [d for d in docs if CATEGORY_OF[d['noun']] == NEAR[cat]]
        other = [d for d in docs if CATEGORY_OF[d['noun']] not in (cat, NEAR[cat])]
        for d in same[:6] + rng.sample(near, 5) + rng.sample(other, 6 if qi < 2 else 5):
            pairs.append({'query': query, 'doc': d, 'label': human_label(query, d)})
    rng.shuffle(pairs)
    for i, p in enumerate(pairs, 1):
        p['id'] = 'j%02d' % i
    return pairs

docs = make_docs()
pairs = make_pairs(docs)
human = [p['label'] for p in pairs]
print(f'쌍 {len(pairs)}개: 상 {human.count("상")}개, 중 {human.count("중")}개, 하 {human.count("하")}개')
for query in QUERIES:
    mine = [p['label'] for p in pairs if p['query'] == query]
    print(f'  {query}: {len(mine)}쌍 (상 {mine.count("상")}, 중 {mine.count("중")}, 하 {mine.count("하")})')
p = pairs[0]
print(f'{p["id"]} 질의 {p["query"]}, 라벨 {p["label"]}: {p["doc"]["text"].split(". ")[0]}.')

# 2단계: 기록을 둔다
# 쌍마다 채점표를 시스템 메시지로, 질의와 상품 문서를 사용자 메시지로 보내 thinking 을 끄고 temperature 0 으로 받은 답이다.
# USAGE 의 네 값은 차례대로 입력 토큰, 출력 토큰, 걸린 ms, thinking 으로 쓴 풀이의 글자 수다.
RECORD = {"j01": "{\"score\": 5}", "j02": "{\"score\": 5}", "j03": "{\"score\": 1}", "j04": "{\"score\": 1}", "j05": "{\"score\": 1}", "j06": "{\"score\": 3}", "j07": "{\"score\": 1}", "j08": "{\"score\": 1}", "j09": "{\"score\": 1}", "j10": "{\"score\": 1}", "j11": "{\"score\": 1}", "j12": "{\"score\": 1}", "j13": "{\"score\": 1}", "j14": "{\"score\": 1}", "j15": "{\"score\": 5}", "j16": "{\"score\": 1}", "j17": "{\"score\": 5}", "j18": "{\"score\": 1}", "j19": "{\"score\": 1}", "j20": "{\"score\": 4}", "j21": "{\"score\": 3}", "j22": "{\"score\": 1}", "j23": "{\"score\": 1}", "j24": "{\"score\": 2}", "j25": "{\"score\": 1}", "j26": "{\"score\": 1}", "j27": "{\"score\": 5}", "j28": "{\"score\": 3}", "j29": "{\"score\": 1}", "j30": "{\"score\": 1}", "j31": "{\"score\": 1}", "j32": "{\"score\": 5}", "j33": "{\"score\": 5}", "j34": "{\"score\": 5}", "j35": "{\"score\": 1}", "j36": "{\"score\": 1}", "j37": "{\"score\": 1}", "j38": "{\"score\": 5}", "j39": "{\"score\": 2}", "j40": "{\"score\": 1}", "j41": "{\"score\": 1}", "j42": "{\"score\": 5}", "j43": "{\"score\": 5}", "j44": "{\"score\": 2}", "j45": "{\"score\": 5}", "j46": "{\"score\": 2}", "j47": "{\"score\": 1}", "j48": "{\"score\": 5}", "j49": "{\"score\": 2}", "j50": "{\"score\": 5}"}
USAGE = {"j01": [233, 6, 1831, 0], "j02": [242, 6, 1117, 0], "j03": [247, 6, 1112, 0], "j04": [243, 6, 1114, 0], "j05": [244, 6, 1118, 0], "j06": [236, 6, 1114, 0], "j07": [230, 6, 1108, 0], "j08": [230, 6, 1106, 0], "j09": [229, 6, 1112, 0], "j10": [230, 6, 1123, 0], "j11": [244, 6, 1126, 0], "j12": [230, 6, 1119, 0], "j13": [229, 6, 1114, 0], "j14": [245, 6, 1116, 0], "j15": [232, 6, 1106, 0], "j16": [230, 6, 1109, 0], "j17": [244, 6, 1111, 0], "j18": [235, 6, 1107, 0], "j19": [232, 6, 1113, 0], "j20": [241, 6, 1113, 0], "j21": [246, 6, 1713, 0], "j22": [230, 6, 1513, 0], "j23": [231, 6, 1577, 0], "j24": [249, 6, 1963, 0], "j25": [230, 6, 1767, 0], "j26": [245, 6, 1741, 0], "j27": [239, 6, 1387, 0], "j28": [229, 6, 1760, 0], "j29": [231, 6, 1549, 0], "j30": [228, 6, 1199, 0], "j31": [231, 6, 1189, 0], "j32": [235, 6, 1127, 0], "j33": [247, 6, 1336, 0], "j34": [247, 6, 1142, 0], "j35": [227, 6, 1153, 0], "j36": [248, 6, 1256, 0], "j37": [247, 6, 1613, 0], "j38": [231, 6, 1476, 0], "j39": [231, 6, 1323, 0], "j40": [247, 6, 1396, 0], "j41": [246, 6, 1157, 0], "j42": [232, 6, 1312, 0], "j43": [233, 6, 1352, 0], "j44": [230, 6, 1218, 0], "j45": [234, 6, 1612, 0], "j46": [229, 6, 1382, 0], "j47": [229, 6, 1411, 0], "j48": [230, 6, 1347, 0], "j49": [243, 6, 1392, 0], "j50": [244, 6, 1680, 0]}

# 3단계: 점수를 읽고 상, 중, 하로 옮긴다
# 키가 score 하나인 JSON 객체이고 값이 1~5 의 정수일 때만 읽은 답이다. 그 밖은 읽지 못한 답으로 사람과 다르다고 친다.
# 점수 4~5 는 상, 3 은 중, 1~2 는 하로 옮긴다. 읽지 못한 답은 「읽지 못함」 칸에 둔다.
def read_score(text):
    try:
        obj = json.loads(text)
    except ValueError:
        return None
    if not isinstance(obj, dict) or list(obj) != ['score']:
        return None
    s = obj['score']
    return s if isinstance(s, int) and not isinstance(s, bool) and 1 <= s <= 5 else None


def to_bin(score):
    if score is None:
        return '읽지 못함'
    return '상' if score >= 4 else ('중' if score == 3 else '하')


scores = {p['id']: read_score(RECORD[p['id']]) for p in pairs}
judge = [to_bin(scores[p['id']]) for p in pairs]
dist = [sum(s == k for s in scores.values()) for k in range(1, 6)]
print('점수 분포: ' + ', '.join(f'{k}점 {n}개' for k, n in zip(range(1, 6), dist))
      + f', 읽지 못한 답 {sum(s is None for s in scores.values())}개')

# 4단계: 사람 라벨과 비교한다
# 일치율은 사람 라벨과 판정의 칸이 같은 쌍의 몫이다. 표는 줄이 사람 라벨, 칸이 판정이다.
same = sum(h == j for h, j in zip(human, judge))
print(f'일치율 {same}/{len(pairs)} = {same / len(pairs):.2f}')
print('사람\\판정  상  중  하')
for h in ('상', '중', '하'):
    row = [sum(a == h and b == j for a, b in zip(human, judge)) for j in ('상', '중', '하')]
    print(f'  {h}      ' + ''.join(f'{n:>4}' for n in row))
for p, j in zip(pairs, judge):
    if p['label'] == '상' and j != '상':
        print(f'  사람 상, 판정 {j}: {p["id"]} {p["query"]}, {p["doc"]["noun"]} {scores[p["id"]]}점')
for query in QUERIES:
    mid = sorted(scores[p['id']] for p in pairs if p['query'] == query and p['label'] == '중')
    print(f'  사람 중 {query} {len(mid)}쌍의 점수 {mid}')
print(f'입력 {min(u[0] for u in USAGE.values())}~{max(u[0] for u in USAGE.values())} 토큰, '
      f'출력 최대 {max(u[1] for u in USAGE.values())} 토큰, 50개 합계 {sum(u[2] for u in USAGE.values()) / 1000:.1f}초')
# 출력:
# 1단계 뜻: 질의 셋에 16~17쌍씩, 사람 라벨은 세 칸이 고르게 들었다.
# 쌍 50개: 상 18개, 중 15개, 하 17개
#   캠핑 의자: 17쌍 (상 6, 중 5, 하 6)
#   헤드셋: 17쌍 (상 6, 중 5, 하 6)
#   스니커즈: 16쌍 (상 6, 중 5, 하 5)
# j01 질의 캠핑 의자, 라벨 상: 상품 온팩토리 방수 브라운 캠핑의자 CM469 의 분류는 캠핑 이다.
# 3단계 뜻: 50개 모두 읽혔고, 점수는 1점과 5점 두 끝에 몰렸다.
# 점수 분포: 1점 27개, 2점 5개, 3점 3개, 4점 1개, 5점 14개, 읽지 못한 답 0개
# 4단계 뜻: 상과 하는 거의 맞았고, 사람의 중 15쌍은 모두 하로 판정되었다.
# 일치율 32/50 = 0.64
# 사람\판정  상  중  하
#   상        15   3   0
#   중         0   0  15
#   하         0   0  17
#   사람 상, 판정 중: j06 캠핑 의자, 캠핑테이블 3점
#   사람 상, 판정 중: j21 헤드셋, 무선이어폰 3점
#   사람 상, 판정 중: j28 헤드셋, 무선이어폰 3점
#   사람 중 캠핑 의자 5쌍의 점수 [2, 2, 2, 2, 2]
#   사람 중 헤드셋 5쌍의 점수 [1, 1, 1, 1, 1]
#   사람 중 스니커즈 5쌍의 점수 [1, 1, 1, 1, 1]
# 입력 227~249 토큰, 출력 최대 6 토큰, 50개 합계 66.0초
```

점수는 1점 27개, 5점 14개로 두 끝에 몰렸습니다. 2점은 5개, 3점은 3개, 4점은 1개뿐입니다. 3점을 받은 3쌍은 모두 사람이 상을 단 쌍이었습니다. 「캠핑 의자」의 캠핑테이블 하나와 「헤드셋」의 무선이어폰 둘입니다. 셋 다 같은 분류이지만 질의가 찾는 물건과는 다른 상품입니다. 채점표로는 4점 자리인데, 모델은 3점을 줬습니다.

일치율은 32/50 = 0.64 였습니다. 사람이 상을 단 18쌍 가운데 15쌍이 상으로 맞았습니다. 하 17쌍은 모두 하로 맞았습니다. 사람이 중을 단 15쌍은 하나도 중으로 판정되지 않았습니다. 「캠핑 의자」의 가방 5쌍은 모두 2점, 「헤드셋」과 「스니커즈」의 잡화 10쌍은 모두 1점이었습니다.

모델은 채점표의 「가까운 분류」를 이 글의 이웃 분류로 읽지 않았습니다. 왜 그렇게 읽었는지는 기록이 보여 주지 않습니다. 보이는 것은 사람의 기준이 채점표 문장으로 다 옮겨지지 않았다는 사실입니다. 이웃 분류를 3점 줄에 적은 채점표는 이 글에서 기록하지 않았습니다. 입력은 227~249 토큰, 출력은 많아야 6 토큰이었고, 50개에 모두 66.0초가 걸렸습니다.

| 사람 라벨 | 판정 상 | 판정 중 | 판정 하 | 맞은 쌍 |
|---|---|---|---|---|
| 상 18쌍 | 15 | 3 | 0 | 15 |
| 중 15쌍 | 0 | 0 | 15 | 0 |
| 하 17쌍 | 0 | 0 | 17 | 17 |
| 모두 50쌍 | 15 | 3 | 32 | 32 |

<div class="demo-embed-wrap">
<iframe class="demo-embed" src="demo-judge-cards.html?embed=1&card=score" height="480" loading="lazy" title="모델 점수와 사람 라벨"></iframe>
<a class="demo-embed-open" href="demo-judge-cards.html" target="_blank" rel="noopener">↗ 카드 네 장 전체로 열기</a>
</div>

## 3. 일치율이 아니라 kappa 로 봅니다

**일치율 0.64 에는 우연히 맞을 몫이 섞여 있습니다. 우연 일치 0.34 를 덜어 내고 다시 재면 Cohen's kappa 는 0.45 입니다. 모두 상이라 답하는 가상 판정은 일치율 0.90 이지만 kappa 는 0.00 입니다.**

일치율은 계산이 쉽지만, 한 칸에 라벨이 몰려 있으면 높게 나옵니다. 사람 라벨이 상 45개, 하 5개인 가상 50쌍을 생각해 봅니다. 무엇이 와도 상이라 답하는 판정은 상품을 읽지 않고도 45쌍을 맞힙니다. 일치율은 0.90 이지만, 이 판정은 좋은 상품과 나쁜 상품을 하나도 구별하지 못합니다.

Cohen's kappa 는 먼저 우연 일치를 계산합니다. 우연 일치는 두 쪽이 서로 보지 않고 칸을 골랐을 때 같을 몫입니다. 칸마다 사람이 그 칸을 고른 몫과 판정이 그 칸을 고른 몫을 곱하고, 세 칸을 더합니다. 관찰 일치는 실제로 같은 칸을 고른 몫이고, 일치율과 같은 값입니다.

kappa 는 관찰 일치에서 우연 일치를 빼고, 1 에서 우연 일치를 뺀 값으로 나눕니다. 우연 일치만큼 맞으면 0 이고, 다 맞으면 1 입니다. 블록의 `cohen_kappa` 가 그 계산을 합니다. 칸에 순서를 두지 않는 가중치 없는 kappa 이고, 칸은 상, 중, 하 셋입니다.

```python
# (앞 블록에 이어서 돌린다.)
# 하는 일: 사람 라벨과 판정의 Cohen's kappa 를 재고, 일치율만 보면 틀리는 작은 예를 본다.

# 1단계: 관찰 일치와 우연 일치, kappa 를 둔다
# 관찰 일치는 두 목록의 칸이 같은 몫이다. 우연 일치는 두 쪽이 칸을 따로 골랐다고 칠 때 같을 몫이다.
# 칸마다 두 쪽이 그 칸을 고른 몫을 곱해 더한다. kappa 는 우연 일치를 넘은 만큼을 1 - 우연 일치로 나눈 값이다.
def agreement_parts(a, b):
    n = len(a)
    observed = sum(x == y for x, y in zip(a, b)) / n
    expected = sum((a.count(c) / n) * (b.count(c) / n) for c in sorted(set(a) | set(b)))
    return observed, expected


def cohen_kappa(a, b):
    observed, expected = agreement_parts(a, b)
    return 0.0 if expected == 1 else (observed - expected) / (1 - expected)


# 2단계: 이 글의 50쌍에 잰다
po, pe = agreement_parts(human, judge)
print(f'관찰 일치 {po:.2f}, 우연 일치 {pe:.2f}, kappa {cohen_kappa(human, judge):.2f}')
for h in ('상', '중', '하'):
    print(f'  {h}: 사람 {human.count(h) / len(human):.2f}, 판정 {judge.count(h) / len(judge):.2f}')

# 3단계: 일치율만 보면 틀리는 작은 예
# 기록에 없는 가상 예다. 사람 라벨이 상 45개, 하 5개인 50쌍에, 무엇이 와도 상이라 답하는 판정을 붙인다.
toy_human = ['상'] * 45 + ['하'] * 5
toy_judge = ['상'] * 50
po, pe = agreement_parts(toy_human, toy_judge)
print(f'모두 상이라 답하는 판정: 일치율 {po:.2f}, 우연 일치 {pe:.2f}, kappa {cohen_kappa(toy_human, toy_judge):.2f}')
# 출력:
# 2단계 뜻: 일치율 0.64 가운데 0.34 는 우연으로도 나오는 몫이고, 판정은 하 칸에 몰렸다.
# 관찰 일치 0.64, 우연 일치 0.34, kappa 0.45
#   상: 사람 0.36, 판정 0.30
#   중: 사람 0.30, 판정 0.06
#   하: 사람 0.34, 판정 0.64
# 3단계 뜻: 상품을 읽지 않는 판정도 일치율은 높지만 kappa 는 0 이다.
# 모두 상이라 답하는 판정: 일치율 0.90, 우연 일치 0.90, kappa 0.00
```

이 글의 50쌍은 관찰 일치 0.64, 우연 일치 0.34 였고, kappa 는 0.45 입니다. 판정 쪽 몫을 보면 하가 0.64 로(일치율과 우연히 같은 값), 사람의 0.34 보다 훨씬 큽니다. 판정은 중을 0.06 만 썼고, 사람은 0.30 을 썼습니다. 판정이 하로 몰린 만큼 하 칸에서는 우연히도 많이 맞습니다.

모두 상이라 답한 가상 판정은 일치율이 0.90 이고 우연 일치도 0.90 이라, kappa 가 0.00 입니다. 일치율만 보면 이 판정이 이 글의 판정보다 낫습니다. kappa 로 보면 상품을 구별한 정도는 이 글의 판정이 더 큽니다. 그래서 판정을 사람과 비교할 때는 일치율과 kappa 를 함께 적습니다.

| 판정 | 일치율 | 우연 일치 | kappa |
|---|---|---|---|
| 이 글의 판정 50쌍 | 0.64 | 0.34 | 0.45 |
| 모두 상이라 답하는 가상 판정 | 0.90 | 0.90 | 0.00 |

<div class="demo-embed-wrap">
<iframe class="demo-embed" src="demo-judge-cards.html?embed=1&card=kappa" height="480" loading="lazy" title="일치율과 kappa 의 차이"></iframe>
<a class="demo-embed-open" href="demo-judge-cards.html" target="_blank" rel="noopener">↗ 카드 네 장 전체로 열기</a>
</div>

## 4. 순서를 바꾸면 승자가 바뀌는 쌍이 있습니다

**사람 라벨이 다른 상품 20쌍을 A, B 자리를 바꿔 두 번씩 물었습니다. 18쌍은 두 번 다 사람과 같은 쪽을 골랐습니다. 2쌍은 두 번 다 A 자리가 이겨, 순서를 바꾸자 승자가 바뀌었습니다.**

짝비교의 시스템 메시지에는 질의에 더 관련 있는 상품을 고르라고 적었습니다. 답은 「{"winner": "A"}」나 「{"winner": "B"}」 한 줄입니다. 이것도 쌍 밖의 두 문서로 꼴을 먼저 봤고, 읽히는 것을 보고 그대로 썼습니다.

20쌍은 질의마다 사람 라벨이 다른 두 상품을 7쌍, 7쌍, 6쌍 골랐습니다. 사람이 고르는 쪽은 라벨이 높은 상품입니다. 쌍마다 처음 정한 순서로 한 번, 자리를 바꿔 한 번 보냈습니다. 그래서 요청은 40건이고, 사람이 고른 쪽이 A 인 쌍과 B 인 쌍이 10쌍씩입니다.

두 번의 답이 같은 상품을 고르면 일관된 쌍입니다. 두 번이 다른 상품을 고르면, 같은 자리가 두 번 이긴 것입니다. 상품이 아니라 자리가 승자를 정한 것입니다. 블록은 자리를 바꾼 답의 A 와 B 를 뒤집어, 같은 상품끼리 비교합니다.

```python
# (앞 블록에 이어서 돌린다.)
# 하는 일: 사람 라벨이 다른 상품 20쌍을 좌우 두 번 비교한 기록 40건을 읽고, 순서를 바꿔 승자가 바뀐 쌍을 센다.
# 기록 data/llm-records/llm-as-a-judge-pairs.json 에서 옮김

# 1단계: 짝비교 20쌍을 만든다
# 질의마다 사람 라벨이 다른 두 상품을 7쌍, 7쌍, 6쌍 고른다. 사람이 고르는 쪽은 라벨이 높은 상품이다.
# 쌍마다 a 를 A 자리에 둔 요청(-ab)과 b 를 A 자리에 둔 요청(-ba)을 보낸다. scripts/gen-judge-pairs.py 와 같은 코드다.
RANK = {'상': 3, '중': 2, '하': 1}


def make_comparisons(pairs, seed=7):
    """질의마다 사람 라벨이 다른 두 상품을 7쌍, 7쌍, 6쌍 고른다. human 은 라벨이 높은 쪽(A 나 B)이다."""
    rng = random.Random(seed)
    comps = []
    for qi, query in enumerate(QUERIES):
        mine = [p for p in pairs if p['query'] == query]
        cands = [(x, y) for i, x in enumerate(mine) for y in mine[i + 1:] if x['label'] != y['label']]
        for x, y in rng.sample(cands, 7 if qi < 2 else 6):
            if rng.random() < 0.5:
                x, y = y, x
            comps.append({'query': query, 'a': x, 'b': y, 'human': 'A' if RANK[x['label']] > RANK[y['label']] else 'B'})
    for i, c in enumerate(comps, 1):
        c['id'] = 'c%02d' % i
    return comps

comps = make_comparisons(pairs)
print(f'짝비교 {len(comps)}쌍, 요청 {2 * len(comps)}건, 사람이 고른 쪽 A {sum(c["human"] == "A" for c in comps)}쌍, '
      f'B {sum(c["human"] == "B" for c in comps)}쌍')

# 2단계: 기록을 둔다
# 짝비교 시스템 메시지와 질의, A 문서, B 문서를 보내 thinking 을 끄고 temperature 0 으로 받은 답이다.
RECORD = {"c01-ab": "{\"winner\": \"B\"}", "c01-ba": "{\"winner\": \"A\"}", "c02-ab": "{\"winner\": \"A\"}", "c02-ba": "{\"winner\": \"B\"}", "c03-ab": "{\"winner\": \"A\"}", "c03-ba": "{\"winner\": \"B\"}", "c04-ab": "{\"winner\": \"B\"}", "c04-ba": "{\"winner\": \"A\"}", "c05-ab": "{\"winner\": \"B\"}", "c05-ba": "{\"winner\": \"A\"}", "c06-ab": "{\"winner\": \"B\"}", "c06-ba": "{\"winner\": \"A\"}", "c07-ab": "{\"winner\": \"A\"}", "c07-ba": "{\"winner\": \"A\"}", "c08-ab": "{\"winner\": \"A\"}", "c08-ba": "{\"winner\": \"B\"}", "c09-ab": "{\"winner\": \"B\"}", "c09-ba": "{\"winner\": \"A\"}", "c10-ab": "{\"winner\": \"A\"}", "c10-ba": "{\"winner\": \"B\"}", "c11-ab": "{\"winner\": \"A\"}", "c11-ba": "{\"winner\": \"B\"}", "c12-ab": "{\"winner\": \"B\"}", "c12-ba": "{\"winner\": \"A\"}", "c13-ab": "{\"winner\": \"A\"}", "c13-ba": "{\"winner\": \"B\"}", "c14-ab": "{\"winner\": \"B\"}", "c14-ba": "{\"winner\": \"A\"}", "c15-ab": "{\"winner\": \"A\"}", "c15-ba": "{\"winner\": \"B\"}", "c16-ab": "{\"winner\": \"B\"}", "c16-ba": "{\"winner\": \"A\"}", "c17-ab": "{\"winner\": \"B\"}", "c17-ba": "{\"winner\": \"A\"}", "c18-ab": "{\"winner\": \"B\"}", "c18-ba": "{\"winner\": \"A\"}", "c19-ab": "{\"winner\": \"A\"}", "c19-ba": "{\"winner\": \"A\"}", "c20-ab": "{\"winner\": \"A\"}", "c20-ba": "{\"winner\": \"B\"}"}
USAGE = {"c01-ab": [243, 6, 2294, 0], "c01-ba": [243, 6, 2528, 0], "c02-ab": [234, 6, 1736, 0], "c02-ba": [234, 6, 1737, 0], "c03-ab": [255, 6, 2168, 0], "c03-ba": [255, 6, 1917, 0], "c04-ab": [246, 6, 1833, 0], "c04-ba": [246, 6, 1991, 0], "c05-ab": [232, 6, 2084, 0], "c05-ba": [232, 6, 2122, 0], "c06-ab": [230, 6, 1956, 0], "c06-ba": [230, 6, 1922, 0], "c07-ab": [242, 6, 2603, 0], "c07-ba": [242, 6, 2035, 0], "c08-ab": [243, 6, 2807, 0], "c08-ba": [243, 6, 2119, 0], "c09-ab": [241, 6, 1881, 0], "c09-ba": [241, 6, 1937, 0], "c10-ab": [242, 6, 2000, 0], "c10-ba": [242, 6, 1974, 0], "c11-ab": [245, 6, 1973, 0], "c11-ba": [245, 6, 1911, 0], "c12-ab": [256, 6, 2234, 0], "c12-ba": [256, 6, 2066, 0], "c13-ab": [245, 6, 2051, 0], "c13-ba": [245, 6, 1904, 0], "c14-ab": [232, 6, 1929, 0], "c14-ba": [232, 6, 1968, 0], "c15-ab": [231, 6, 2159, 0], "c15-ba": [231, 6, 2199, 0], "c16-ab": [231, 6, 2049, 0], "c16-ba": [231, 6, 2115, 0], "c17-ab": [243, 6, 1878, 0], "c17-ba": [243, 6, 2198, 0], "c18-ab": [230, 6, 2208, 0], "c18-ba": [230, 6, 2660, 0], "c19-ab": [227, 6, 2239, 0], "c19-ba": [227, 6, 1998, 0], "c20-ab": [243, 6, 1996, 0], "c20-ba": [243, 6, 1959, 0]}

# 3단계: 승자를 읽고 좌우 두 번을 맞춘다
# 키가 winner 하나이고 값이 A 나 B 일 때만 읽은 답이다. -ba 의 답은 자리를 바꿨으니 A 와 B 를 뒤집어 a, b 쪽으로 옮긴다.
# 두 번이 같은 쪽을 고르면 일관된 쌍이다. 두 번이 다르면 같은 자리가 두 번 이긴 것이고, 이것이 위치 편향이다.
def read_winner(text):
    try:
        obj = json.loads(text)
    except ValueError:
        return None
    if not isinstance(obj, dict) or list(obj) != ['winner'] or obj['winner'] not in ('A', 'B'):
        return None
    return obj['winner']


FLIP = {'A': 'B', 'B': 'A'}
match, wrong, flipped, unread = [], [], [], []
for c in comps:
    ab, ba = read_winner(RECORD[c['id'] + '-ab']), read_winner(RECORD[c['id'] + '-ba'])
    if ab is None or ba is None:
        unread.append(c['id'])
    elif ab != FLIP[ba]:
        flipped.append((c['id'], ab))
    elif ab == c['human']:
        match.append(c['id'])
    else:
        wrong.append(c['id'])
first = sum(read_winner(v) == 'A' for v in RECORD.values())
print(f'A 자리가 이긴 요청 {first}/{len(RECORD)}건')
print(f'두 번 다 사람과 같은 쪽 {len(match)}쌍, 두 번 다 사람과 다른 쪽 {len(wrong)}쌍')
print(f'순서를 바꾸자 승자가 바뀐 쌍 {len(flipped)}쌍, 읽지 못한 답이 든 쌍 {len(unread)}쌍')
for cid, side in flipped:
    c = next(c for c in comps if c['id'] == cid)
    print(f'  {cid} {c["query"]}: {c["a"]["label"]} 대 {c["b"]["label"]}, 두 번 다 {side} 자리가 이김, '
          f'점수 {scores[c["a"]["id"]]} 대 {scores[c["b"]["id"]]}')

# 4단계: 1~5 점수로도 승자가 정해지는지 본다
# 블록 1 의 점수로 두 상품을 비교한다. 점수가 같으면 점수로는 승자를 정할 수 없다.
tie = [c for c in comps if scores[c['a']['id']] == scores[c['b']['id']]]
tie_ok = [c for c in tie if c['id'] in match]
print(f'두 점수가 같은 쌍 {len(tie)}쌍, 그 가운데 짝비교가 두 번 다 사람과 같은 쪽 {len(tie_ok)}쌍')
print(f'입력 {min(u[0] for u in USAGE.values())}~{max(u[0] for u in USAGE.values())} 토큰, '
      f'40건 합계 {sum(u[2] for u in USAGE.values()) / 1000:.1f}초')
# 출력:
# 1단계 뜻: 20쌍을 좌우 두 번씩 보내 40건이고, 사람이 고른 쪽은 A 와 B 가 반반이다.
# 짝비교 20쌍, 요청 40건, 사람이 고른 쪽 A 10쌍, B 10쌍
# 3단계 뜻: 18쌍은 자리를 바꿔도 사람과 같은 쪽을 골랐고, 2쌍은 두 번 다 A 자리가 이겼다.
# A 자리가 이긴 요청 22/40건
# 두 번 다 사람과 같은 쪽 18쌍, 두 번 다 사람과 다른 쪽 0쌍
# 순서를 바꾸자 승자가 바뀐 쌍 2쌍, 읽지 못한 답이 든 쌍 0쌍
#   c07 캠핑 의자: 중 대 하, 두 번 다 A 자리가 이김, 점수 2 대 1
#   c19 스니커즈: 중 대 하, 두 번 다 A 자리가 이김, 점수 1 대 1
# 4단계 뜻: 점수로는 승자를 못 정하는 4쌍 가운데 3쌍을 짝비교는 사람과 같게 골랐다.
# 두 점수가 같은 쌍 4쌍, 그 가운데 짝비교가 두 번 다 사람과 같은 쪽 3쌍
# 입력 227~256 토큰, 40건 합계 83.3초
```

40건 가운데 A 자리가 이긴 요청은 22건이었습니다. 20쌍 가운데 18쌍은 두 번 다 사람과 같은 상품을 골랐습니다. 두 번 다 사람과 다른 상품을 고른 쌍은 없었습니다. 남은 2쌍 c07 과 c19 는 두 번 다 A 자리가 이겼습니다. 읽지 못한 답은 없었고, 40건에 모두 83.3초가 걸렸습니다.

바뀐 2쌍은 둘 다 사람 라벨이 중 대 하인 쌍이었습니다. 1~5 점으로는 c07 이 2 대 1, c19 가 1 대 1 이었습니다. 두 상품 모두 질의와 분류가 다른 쌍입니다. 왜 A 자리를 골랐는지는 기록이 보여 주지 않습니다. 셀 수 있는 것은 순서를 바꿨을 때 답이 바뀐 쌍의 수입니다.

4단계는 같은 20쌍을 블록 1 의 점수로 비교했습니다. 두 상품의 점수가 같은 쌍이 4쌍이었고, 점수로는 그 4쌍의 승자를 정할 수 없습니다. 짝비교는 그 가운데 3쌍에서 두 번 다 사람과 같은 쪽을 골랐습니다. 남은 1쌍은 승자가 바뀐 c19 입니다.

| 센 것 | 무엇을 보나 | 이 기록 |
|---|---|---|
| A 자리가 이긴 요청 | 40건 가운데 A 를 고른 답 | 22건 |
| 두 번 다 사람과 같은 쪽 | 자리를 바꿔도 라벨이 높은 상품을 골랐나 | 18쌍 |
| 두 번 다 사람과 다른 쪽 | 자리를 바꿔도 라벨이 낮은 상품을 골랐나 | 0쌍 |
| 승자가 바뀐 쌍 | 같은 자리가 두 번 이겼나 | 2쌍 (c07, c19) |
| 점수가 같은 쌍 | 1~5 점으로는 승자를 못 정하나 | 4쌍 |

<div class="demo-embed-wrap">
<iframe class="demo-embed" src="demo-judge-cards.html?embed=1&card=swap" height="480" loading="lazy" title="좌우를 바꿔 다시 묻기"></iframe>
<a class="demo-embed-open" href="demo-judge-cards.html" target="_blank" rel="noopener">↗ 카드 네 장 전체로 열기</a>
</div>

## 5. 판정은 쓸 자리와 조심할 자리가 있습니다

**광고에서 판정은 오프라인 비교, 노출 전 게이트, 학습 보상에 쓰입니다. 자리마다 판정이 틀렸을 때 생기는 일이 다릅니다. 그래서 자리마다 먼저 볼 것이 다릅니다. kappa, 사람의 재검토, 편향입니다.**

오프라인 비교는 검색이나 추천의 두 판을 같은 질의로 돌려, 결과를 채점해 비교하는 일입니다. 사람이 다 읽기 어려운 양을 판정이 채점하고, 일부만 사람이 다시 봅니다. 판정이 틀려도 바로 사용자에게 닿지는 않습니다. 그래서 판정을 가장 먼저 들이기 좋은 자리입니다.

노출 전 게이트는 광고 문구나 소재를 내보내기 전에 판정이 걸러 내는 자리입니다. 판정이 놓치면 문제 있는 광고가 그대로 나갑니다. 판정이 지나치게 막으면 광고주의 광고가 나가지 못합니다. 그래서 판정이 막은 것 가운데 일부를 사람이 다시 보는 길을 둡니다.

학습 보상은 판정의 점수를 모델 학습의 목표로 쓰는 자리입니다. 학습하는 모델은 점수를 올리는 쪽으로 바뀌어서, 판정의 버릇까지 따라갑니다. 위치 편향처럼 내용과 상관없는 버릇이 있으면, 그것도 점수를 올리는 길이 됩니다. 이 자리는 학습을 다루는 뒤 글에서 이어 봅니다.

자기 선호 편향은 판정 모델이 자기가 쓴 글에 점수를 더 주는 일입니다. 같은 모델이 광고 문구를 쓰고, 같은 모델이 그 문구를 채점하면 생길 수 있습니다. 이 글의 상품 문서는 모델이 쓴 글이 아니라서, 이 편향은 기록하지 않았습니다. 글을 쓰는 모델과 채점하는 모델을 다르게 두는 것이 한 가지 길입니다.

| 자리 | 판정이 하는 일 | 판정이 틀리면 | 먼저 볼 것 |
|---|---|---|---|
| 오프라인 비교 | 두 판의 검색 결과를 채점해 견줌 | 판을 잘못 고름, 사용자에게는 바로 닿지 않음 | 사람 라벨과의 kappa |
| 노출 전 게이트 | 내보낼 문구와 소재를 거름 | 문제 광고가 나가거나 멀쩡한 광고가 막힘 | 막은 것 일부를 사람이 다시 봄 |
| 학습 보상 | 점수를 학습의 목표로 씀 | 학습하는 모델이 판정의 버릇을 배움 | 위치 편향, 자기 선호 편향 |

## 6. 두 무대는 판정을 쓰는 곳이 다릅니다

**채점표와 kappa, 자리를 바꿔 다시 묻는 방법은 두 무대가 같습니다. 다른 것은 판정할 결과와 사람 라벨이 어디에 모여 있는지입니다.**

### 담장 안은 검색 결과와 사람 라벨이 한 곳에 있습니다 [무대: 닫힌 생태계]

한 회사가 서비스와 광고 서버를 다 가진 곳을 담장 안이라고 부릅니다. 검색 질의, 노출한 상품, 사람이 단 라벨이 모두 한 회사 안에 있습니다. 그래서 판의 결과를 판정이 채점하고, 같은 질의의 사람 라벨로 kappa 를 바로 잴 수 있습니다. 광고 문구의 노출 전 게이트도 같은 회사 안에서 돌립니다.

### 열린 RTB 에서는 판정을 입찰 밖에서 씁니다 [무대: 열린 RTB]

여러 회사가 실시간 경매로 남의 지면에 광고를 사고파는 곳을 열린 RTB 라고 부릅니다. 광고를 사는 쪽인 DSP 는 입찰 요청에 짧은 시간 안에 답해야 해서, 요청마다 판정을 부를 수 없습니다. 그래서 판정은 소재 검수나 지면과 광고의 어울림 채점처럼 입찰 전에 미리 하는 일에 씁니다. 사람 라벨도 DSP 가 따로 모아야 합니다.

## 한눈 정리

| 자리 | 무엇 | 이 글의 값 |
|---|---|---|
| LLM-as-a-Judge | LLM 에게 채점을 맡김 | 질의와 상품 쌍 50개 |
| 채점표 | 점수마다 뜻을 적은 기준 | 1~5 점, 다섯 줄 |
| 점수와 라벨의 대응 | 다섯 칸을 세 칸으로 옮김 | 4~5 상, 3 중, 1~2 하 |
| 일치율 | 사람과 같은 칸을 고른 몫 | 32/50 = 0.64 |
| Cohen's kappa | 우연 일치를 덜어 낸 일치 | 0.45 (우연 일치 0.34) |
| 짝비교 | 둘 가운데 나은 쪽을 고름 | 20쌍, 요청 40건 |
| 위치 편향 | 자리를 바꾸자 승자가 바뀜 | 2쌍 |
| 자기 선호 편향 | 자기가 쓴 글에 점수를 더 줌 | 기록하지 않음 |

## 헷갈리기 쉬운 점

- **절대 점수와 짝비교는 다른 것을 잽니다.** 절대 점수는 상품 하나를 놓고 1~5 점을 매깁니다. 짝비교는 둘을 놓고 나은 쪽만 고릅니다. 이 기록에서 점수가 같은 4쌍 가운데 3쌍은, 짝비교가 두 번 다 사람과 같은 쪽을 골랐습니다. 다만 짝비교는 자리를 바꿔 두 번 물어야 위치 편향이 드러납니다.
- **kappa 가 0.4 쯤이면 우연보다는 꽤 맞지만, 다 맡기기에는 이릅니다.** 0 은 우연만큼, 1 은 다 맞은 것입니다. 이 글의 0.45 는 사람의 중을 판정이 하로 읽은 탓이 큽니다. 어느 칸에서 어긋났는지는 kappa 하나로는 보이지 않으니, 2절의 표처럼 칸마다 센 표를 같이 봅니다.
- **판정 모델은 학습 도중에 바꾸지 않습니다.** 학습하는 모델은 판정의 점수를 올리는 쪽으로 바뀝니다. 도중에 판정 모델이나 채점표를 바꾸면, 앞의 점수와 뒤의 점수가 다른 자로 잰 값이 됩니다. 이 이야기는 학습을 다루는 뒤 글에서 이어 갑니다.

## 더 깊이 보기

:::deep Cohen's kappa 의 식
Cohen 은 1960년 논문에서 두 판정자가 이름뿐인 칸에 얼마나 같이 넣는지 재는 계수를 내놓았습니다. 칸에 순서가 없는 경우의 계수이고, 이 글의 `cohen_kappa` 가 그 식입니다. 상, 중, 하에 순서를 두어 하와 상의 어긋남을 더 크게 치는 가중치 kappa 도 있습니다. 이 글은 가중치를 두지 않았습니다.

쌍 $N$ 개에서 두 쪽이 같은 칸을 고른 쌍이 $n_{o}$ 개라고 둡니다. 칸 $c$ 를 사람이 고른 몫을 $p_{h,c}$, 판정이 고른 몫을 $p_{j,c}$ 라고 둡니다.

$$p_o = \frac{n_o}{N}, \qquad p_e = \sum_{c} p_{h,c} \, p_{j,c}, \qquad \kappa = \frac{p_o - p_e}{1 - p_e}$$

이 글의 값을 넣으면 $p_o = 0.64$, $p_e = 0.34$ 이고, $\kappa = 0.45$ 입니다. $p_e$ 가 1 이면 식의 아래가 0 이 되어, 블록은 그때 0 을 돌려줍니다.
:::

:::deep 채점표와 짝비교 시스템 메시지 전문
채점 기록의 시스템 메시지는 아래 일곱 줄입니다. 기록에 보낸 글 그대로이고, 한국어로 적었습니다.

- 너는 쇼핑 검색 결과를 채점하는 평가자다.
- 사용자가 보낸 질의와 상품 문서를 읽고, 상품이 질의에 얼마나 관련 있는지 1~5 점으로 매긴다.
- 5: 질의가 찾는 바로 그 상품이다.
- 4: 질의와 같은 분류의 상품이다.
- 3: 질의와 가까운 분류의 상품이라 함께 살 만하다.
- 2: 분류는 다르지만 조금 이어진다.
- 1: 질의와 관련이 없다.
- 답은 {"score": N} 꼴의 JSON 한 줄로만 쓴다. N 은 1~5 의 정수다. 설명이나 다른 글은 붙이지 않는다.

짝비교 기록의 시스템 메시지는 질의에 더 관련 있는 상품을 A, B 가운데 고르라고 적었습니다. 답은 {"winner": "A"} 나 {"winner": "B"} 한 줄입니다. 두 파일은 `scripts/gen-judge-pairs.py` 가 만듭니다.
:::

- [RAG](post.html?id=rag-basics) — 이 글의 상품 문서 100건을 처음 만든 24주째 편입니다.
- [임베딩과 벡터 검색](post.html?id=embeddings-vector-search) — 쌍을 고를 때 쓴 `embed` 와 `cosine` 을 처음 짠 편입니다.
- [구조화 출력](post.html?id=structured-output) — 모델의 답을 JSON 으로 받아 검증한 22주째 편입니다.
- [Tool use 와 에이전트 루프](post.html?id=tool-use-agent-loop) — 바로 앞 25주째 편입니다.
- [LLM-as-a-Judge 카드 네 장](demo-judge-cards.html) — 이 글의 카드 전체입니다. 카드를 누르면 헷갈리는 것 하나가 더 나옵니다.

## 참고문헌

- Lianmin Zheng 외 (2023). *Judging LLM-as-a-Judge with MT-Bench and Chatbot Arena*. arXiv:2306.05685. [arxiv.org](https://arxiv.org/abs/2306.05685). 강한 LLM 을 판정자로 쓰는 법과 그 한계를 다룹니다. 위치, 장황함, 자기 선호 편향을 짚습니다.
- Peiyi Wang 외 (2023). *Large Language Models are not Fair Evaluators*. arXiv:2305.17926. [arxiv.org](https://arxiv.org/abs/2305.17926). 답이 놓인 순서만 바꿔도 판정의 순위가 바뀐다는 분석입니다. 여러 순서의 결과를 모으는 보정을 내놓았습니다.
- Jacob Cohen (1960). *A Coefficient of Agreement for Nominal Scales*. Educational and Psychological Measurement, 20(1), 37–46. [doi.org](https://doi.org/10.1177/001316446002000104). 이름뿐인 칸에 대한 두 판정자의 일치 계수, kappa 를 내놓은 논문입니다.
