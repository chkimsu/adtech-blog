모델 팀 24주째 화요일, 지훈 씨는 선배에게서 질문 20개가 적힌 목록을 받았습니다. 「HH820 의 가격은 몇 원인가」처럼 광고주가 상품을 두고 묻는 질문입니다. 답은 쇼핑몰의 상품 설명문에만 있습니다. 설명문은 상품마다 서너 문장이고 모두 100건입니다.

지훈 씨가 지난주까지 부른 노트북의 모델은 이 설명문을 읽은 적이 없습니다. 설명문은 쇼핑몰 안에만 있는 글이라 모델이 배운 글에 들지 않았습니다. 선배는 지어낸 가격이 광고주 화면에 나가면 안 된다고 했습니다. 모르면 모른다고 답하는 것도 숙제에 들어 있었습니다.

**모델이 본 적 없는 상품을 물으면, 무엇을 건네고 그 답을 어떻게 믿을까요?**

선배는 순서를 바꾸라고 답했습니다. 질문이 오면 먼저 설명문에서 그 상품의 문장을 찾습니다. 찾은 문장을 질문과 함께 모델에 건네고 그 문장 안에서만 값을 고르게 합니다. 마지막으로 고른 값이 건넨 문장에 정말 있는지를 코드가 확인합니다.

> **한 줄 요약:** RAG 는 질문과 가까운 문서를 찾아 LLM 의 입력에 함께 넣고 답하게 하는 방법입니다. 이 글은 상품 설명문을 몇 문장씩 자른 조각(청크)마다 벡터를 붙여 둔 다음 질문 벡터와 코사인(두 벡터의 방향이 같을수록 1 에 가까운 값)이 큰 조각 3개를 골라 질문과 함께 모델에 보냈습니다. 정답 문서의 조각이 이렇게 고른 상위 3 에 든 질문의 몫인 Context Recall 은 15/20 이었습니다. 상위 3 가운데 정답 문서의 조각이 차지한 몫을 질문마다 구해 평균한 Context Precision 은 0.47 이었습니다. 모델은 검색이 찾은 질문에는 정답 값을, 놓친 질문에는 조각에 답이 없을 때 쓰라고 한 not_found 를 내서 기록한 답 20개를 모두 맞혔습니다. 답의 값이 그 답이 가리킨 조각에 정말 있는지 코드로 확인하는 일은 근거 대조라고 부릅니다. not_found 대신 값을 낸 답 15개는 모두 근거 대조를 통과했고 받은 조각 어디에도 없는 값을 쓴 근거 없는 답은 0개였습니다.

> **골라 읽는 법** — 절이 7개입니다. 절마다 표나 코드나 카드가 있어 그 부분만 보고 넘어가도 됩니다.
>
> - 모델이 상품 문서를 모르는 까닭과 RAG 의 네 단계 → 1절
> - 문서 100건을 조각 200개로 자르는 코드 → 2절
> - 상위 3 조각과 Context Recall, Context Precision → 3절
> - 조각 3개를 넣은 프롬프트와 기록한 답 20개 → 4절
> - 근거 대조와 근거 없는 답 세기 → 5절
> - 광고에서 RAG 를 쓰는 세 자리 → 6절
> - 두 무대에서 문서를 모으는 곳 → 7절

이 글의 상품 문서 100건과 질문 20개, 정답 값은 설명을 위해 만든 가상 데이터입니다. 상품 이름은 [임베딩과 벡터 검색](post.html?id=embeddings-vector-search) 편의 가상 상품 3,000건 가운데 앞 100건에서 가져왔습니다. 반면 모델의 답과 토큰 수와 걸린 시간은 지어낸 값이 아니라 2026-11-05 에 이 블로그를 쓰는 맥에서 Ollama 0.40.11 로 qwen3.5:27b 를 띄워 기록한 값입니다. 이 기록은 `data/llm-records/rag-basics.json` 파일에 있습니다. 기록하기 전에 20개에 들지 않는 질문 하나로 답의 꼴을 먼저 확인했는데, 답이 JSON 으로 읽히고 값이 영어 낱말로 나와서 4절의 시스템 메시지를 고치지 않고 그대로 썼습니다. 모델에 보낸 프롬프트 파일은 `scripts/gen-rag-docs.py` 가 2절과 3절의 코드로 만듭니다. 4절 블록의 두 상수 RECORD 와 USAGE 는 `--export-constant --with-usage` 가 찍은 줄 그대로입니다.

---

## 1. 모델이 모르는 상품 문서와 RAG 의 네 단계

**지훈 씨의 노트북 모델은 학습할 때 읽은 글만 가중치에 담고 있어서 쇼핑몰 안의 상품 설명문을 모릅니다. 가격은 자주 바뀌어 그때마다 다시 학습하기 어려우므로, RAG 는 값을 모델 밖의 문서에 두고 질문이 올 때마다 그 문서를 찾아 함께 건넵니다.**

LLM 은 많은 글을 읽고 다음 토큰을 이어 쓰도록 학습한 모델이고 학습에서 배운 것은 가중치라는 숫자들에 담깁니다. 그래서 학습이 끝난 뒤에 올라온 글이나 회사 밖에 공개되지 않은 글은 가중치에 들어 있지 않습니다. 쇼핑몰 안에만 있는 설명문 100건이 그런 글이라 [LLM 호출 한 번](post.html?id=llm-first-call) 편처럼 질문만 보내면 모델은 「HH820 의 가격은 몇 원인가」의 답 85000원이 적힌 문서 d068 을 볼 수 없습니다.

모르는 값을 물었을 때 모델이 모른다고 할지 그럴듯한 값을 쓸지는 물어보기 전에는 알 수 없습니다. 이 글은 문서 없이 묻는 기록을 하지 않았으므로 모델의 답에 관한 숫자는 모두 문서를 찾아 넣은 답 20개의 기록에서 셉니다.

설명문을 학습 데이터에 넣어 모델을 다시 만드는 방법도 있습니다. 하지만 가격과 재고는 자주 바뀌어 바뀔 때마다 다시 학습하기 어렵고 학습으로 들어간 값은 어느 문서에서 왔는지가 답에 남지 않습니다. 그래서 RAG 는 값을 모델 안에 넣지 않고 모델 밖의 문서에 둔 채 질문이 올 때마다 그 문서를 찾아 건넵니다. 이렇게 하면 문서를 고친 다음 질문부터 고친 값이 답에 반영됩니다.

RAG 는 네 단계로 돌아갑니다. 문서를 조각으로 잘라 벡터를 붙여 두는 일은 2절, 질문과 가까운 조각 몇 개를 찾는 일은 3절, 찾은 조각을 질문과 함께 프롬프트에 넣어 답하게 하는 일은 4절, 답의 값이 넣은 조각에 정말 있는지 코드로 대조하는 일은 5절에서 다룹니다.

아래 표처럼 모델이 학습한 글에는 무게, 가격, 소재 같은 낱말이 있어서 모델은 건넨 질문과 문서를 읽을 수 있습니다. 다만 그 문서에 적힌 HH820 의 가격 같은 값은 학습한 글에 없어서 문서를 받아야 모델이 그 값을 볼 수 있습니다.

| 무엇 | 모델이 학습한 글에 있는가 | 이 글에서 |
|---|---|---|
| 무게, 가격, 소재 같은 낱말 | 있음 | 질문과 문서를 읽는 데 씀 |
| 쇼핑몰의 상품 설명문 | 없음 | 가상 문서 100건 |
| 모델 번호 HH820 의 가격 | 없음 | 문서 d068 에 85000원 |
| 오늘 고친 가격 | 없음 | 문서를 고치면 다음 질문부터 반영 |

## 2. 문서 조각과 벡터

**문서 100건의 문장 348개를 두 문장씩 묶어 조각 200개를 만들었고 문서마다 조각은 2개입니다. 조각마다 어느 문서에서 왔는지 알려 주는 문서 id 와 벡터를 붙여 둡니다.**

조각은 문서를 미리 몇 문장씩 잘라 둔 글입니다. 검색은 질문과 가까운 조각을 고르는 일이라 조각마다 그 조각을 찾게 해 줄 단서가 들어 있어야 합니다.

설명문은 상품마다 문장이 3개나 4개입니다. 첫 문장에 상품 이름과 분류, 둘째 문장에 색과 소재, 셋째 문장에 무게와 가격을 적었습니다. 넷째 문장은 절반쯤의 문서에만 있고 배송이나 포장처럼 속성이 아닌 내용을 담습니다. 색과 소재는 black, steel 처럼 enum 으로 정해 둔 영어 낱말 가운데 하나입니다. enum 은 값으로 쓸 수 있는 낱말을 미리 정해 둔 목록입니다. 문서의 색과 소재를 이렇게 영어 낱말로 적어 두었으므로 4절에서 모델이 낸 값을 정답 값과 글자 그대로 비교할 수 있습니다.

상품 이름은 첫 문장에만 있어서 두 문장씩 자르면 셋째 문장부터 담는 둘째 조각에는 상품 이름이 빠집니다. 그래서 모든 문장에 모델 번호를 넣었습니다. 번호마저 없으면 「HH820 의 무게」를 물었을 때 무게가 적힌 둘째 조각을 찾을 단서가 없습니다. 실제 문서를 자를 때도 같은 까닭으로 조각마다 제목이나 상품명을 앞에 붙이는 일이 흔합니다.

조각 하나에는 문장 2개를 담았습니다. 조각을 크게 자르면 값이 같이 들어올 기회는 늘지만 질문과 상관없는 내용도 함께 들어옵니다. 반대로 작게 자르면 조각마다 단서가 줄어 질문에 맞는 조각을 찾기 어려워집니다. 이 글은 크기를 바꿔 가며 비교하지는 않았습니다. 크기를 정하는 방법은 더 깊이 보기에 적었습니다.

벡터는 숫자를 차례로 늘어놓은 목록입니다. 조각의 벡터는 임베딩과 벡터 검색 편의 장난감 임베딩 `embed` 로 만듭니다. `embed` 가 만드는 벡터에는 숫자가 384개 들어 있어서 384차원 벡터라고 부릅니다. 이 함수는 띄어쓰기를 지운 글에서 이웃한 두 글자(문자 바이그램)를 한 글자씩 옮겨 가며 모두 뽑습니다. 바이그램마다 해시(글자를 숫자로 바꾸는 함수)로 384차원 가운데 한 차원을 골라 1 을 더한 뒤 벡터의 길이(L2 노름)가 1 이 되도록 모든 값을 같은 수로 나눕니다.

`embed` 는 학습한 모델이 아니어서 두 글의 벡터는 글자가 겹치는 만큼만 가깝습니다. 그래서 「캐리어」와 「여행가방」처럼 뜻이 같아도 글자가 다르면 가깝게 나오지 않습니다. 3절에서 다루는 놓친 질문 5개는 이 점을 이용해 일부러 만든 질문입니다. 질문도 같은 `embed` 에 넣어 384차원 벡터로 바꾼 다음 조각의 벡터와 비교합니다.

아래 블록은 가상 문서와 질문이 어떻게 생겼는지, 그리고 문서 한 건이 정말 조각 2개로 나뉘는지 보려고 돌립니다. 1단계는 문서 100건과 질문 20개를 만들어 개수와 첫 문서 d001, 첫 질문 q01 을 찍습니다. 2단계는 `embed` 와 `chunk` 를 정의합니다. 3단계는 조각 수와 둘째 문서 d002 의 두 조각을 찍습니다.

```python
# 하는 일: 가상 상품 문서 100건과 질문 20개를 만들고, 문서를 문장 두 개씩 조각내 벡터로 둔다.
import math
import random
import zlib

# 1단계: 상품 문서 100건과 질문 20개를 만든다
# 상품 이름은 임베딩과 벡터 검색 편의 make_products 를 그대로 가져와 앞 100건만 쓴다.
# 문서마다 속성 넷(무게 g, 가격 원, 색, 소재)을 시드 7 의 난수로 정하고 문장 셋이나 넷으로 적는다.
# 질문 15개는 모델 번호로 묻고, 5개는 문서에 없는 다른 이름으로 묻는다. scripts/gen-rag-docs.py 와 같은 코드다.
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
# 일부러 검색이 놓치게 쓰는 질문 5개. 문서에 없는 다른 이름으로 상품을 부른다.
OTHER_NAME = {'여행가방': '캐리어', '텐트': '천막', '텀블러': '보온병', '선글라스': '색안경', '젖병': '수유병', '유모차': '아기차'}
ASK = {'weight': '무게는 몇 g 인가', 'price': '가격은 몇 원인가', 'color': '색은 무엇인가', 'material': '소재는 무엇인가'}


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


def make_questions(docs, seed=7):
    """질문 20개. 15개는 모델 번호로 묻고, 5개는 문서에 없는 다른 이름으로 묻는다."""
    rng = random.Random(seed)
    keys = list(ASK)
    pairs = [(d['brand'], d['noun']) for d in docs]
    other = [d for d in docs if d['noun'] in OTHER_NAME and pairs.count((d['brand'], d['noun'])) == 1]
    picked_other = rng.sample(other, 5)
    picked_code = rng.sample([d for d in docs if d not in picked_other], 15)
    questions = []
    for i, d in enumerate(picked_code):
        key = keys[i % 4]
        questions.append({'doc_id': d['id'], 'key': key, 'value': d['attrs'][key], 'missed': False,
                          'question': '%s 의 %s?' % (d['code'], ASK[key])})
    for i, d in enumerate(picked_other):
        key = keys[i % 4]
        questions.append({'doc_id': d['id'], 'key': key, 'value': d['attrs'][key], 'missed': True,
                          'question': '%s %s의 %s?' % (d['brand'], OTHER_NAME[d['noun']], ASK[key])})
    rng.shuffle(questions)
    for i, q in enumerate(questions, 1):
        q['id'] = 'q%02d' % i
    return questions

docs = make_docs()
questions = make_questions(docs)
sents = [d['text'].count('. ') + 1 for d in docs]
print(f'문서 {len(docs)}건, 문장 {sum(sents)}개 (세 문장 {sents.count(3)}건, 네 문장 {sents.count(4)}건)')
print(f'질문 {len(questions)}개: 모델 번호로 묻기 {sum(not q["missed"] for q in questions)}개, '
      f'다른 이름으로 묻기 {sum(q["missed"] for q in questions)}개')
print(f'{docs[0]["id"]}: {docs[0]["text"]}')
q = questions[0]
print(f'{q["id"]}: {q["question"]} 정답 {q["doc_id"]} 의 {q["value"]}')

# 2단계: 문서를 조각으로 자르고 조각마다 벡터를 붙인다
# embed 는 임베딩과 벡터 검색 편의 장난감 임베딩 그대로다. 글자 두 개 조각을 384칸에 더하고 길이를 1 로 맞춘다.
# chunk 는 마침표와 띄어쓰기로 문장을 나눠 두 문장씩 묶는다. 문장이 셋이면 둘째 조각은 한 문장이다.
DIM = 384


def embed(text):
    chars = text.replace(' ', '').lower()
    vec = [0.0] * DIM
    for i in range(len(chars) - 1):
        vec[zlib.crc32(chars[i:i + 2].encode('utf-8')) % DIM] += 1.0
    norm = math.sqrt(sum(x * x for x in vec))
    return [x / norm for x in vec] if norm else vec


def chunk(doc, size=2):
    """문서를 문장 size 개씩 자른 조각들. 조각마다 문서 id 와 벡터를 붙인다."""
    sents = [s if s.endswith('.') else s + '.' for s in doc['text'].split('. ')]
    pieces = []
    for i in range(0, len(sents), size):
        text = ' '.join(sents[i:i + size])
        pieces.append({'doc_id': doc['id'], 'text': text, 'vec': embed(text)})
    return pieces

# 3단계: 조각 수를 세고 문서 하나가 조각 둘이 되는 것을 본다
chunks = [c for d in docs for c in chunk(d)]
print(f'조각 {len(chunks)}개, 문서마다 {len(chunks) // len(docs)}개')
for i, c in enumerate(chunk(docs[1]), 1):
    print(f'  조각 {i} [{c["doc_id"]}] {c["text"]}')
# 출력:
# 1단계 뜻: 문서 100건은 세 문장과 네 문장이 반쯤씩이고, 질문 20개 가운데 5개는 다른 이름으로 묻는다.
# 문서 100건, 문장 348개 (세 문장 52건, 네 문장 48건)
# 질문 20개: 모델 번호로 묻기 15개, 다른 이름으로 묻기 5개
# d001: 상품 하이라이프 와이드 카키 캠핑테이블 CG766 의 분류는 캠핑 이다. CG766 의 색은 khaki 이고, 소재는 steel 이다. CG766 의 무게는 4110g 이고, 가격은 91700원이다.
# q01: HH820 의 가격은 몇 원인가? 정답 d068 의 85000
# 3단계 뜻: 문서마다 조각이 둘이고, 두 조각 모두 모델 번호가 든 문장을 담는다.
# 조각 200개, 문서마다 2개
#   조각 1 [d002] 상품 별랩 슬림 블랙 헤드폰 FL159 의 분류는 음향 이다. FL159 의 색은 black 이고, 소재는 plastic 이다.
#   조각 2 [d002] FL159 의 무게는 120g 이고, 가격은 356300원이다. FL159 의 포장에는 설명서가 들어 있다.
```

1단계 출력에 따르면 문서 100건 가운데 세 문장 문서가 52건, 네 문장 문서가 48건이고 두 종류의 문장을 더하면 348개입니다. 질문 20개는 모델 번호로 묻는 15개와 다른 이름으로 묻는 5개로 나뉩니다. d001 은 캠핑테이블 CG766 의 문서로, 분류 캠핑, 색 khaki, 소재 steel, 무게 4110g, 가격 91700원이 세 문장에 적혀 있습니다. q01 줄은 첫 질문 「HH820 의 가격은 몇 원인가」의 정답이 d068(HH820 의 설명문)에 적힌 85000 이라는 뜻입니다. 3절과 5절이 이 질문을 예로 다시 씁니다.

3단계 출력에서 조각은 200개로 문서마다 2개입니다. 세 문장 문서도 둘째 조각에 셋째 문장 하나만 들어갈 뿐 조각은 2개라서 조각 수가 문서 수의 두 배입니다. d002(헤드폰 FL159 의 문서)의 첫 조각에는 이름과 분류, 색 black, 소재 plastic 이, 둘째 조각에는 무게 120g, 가격 356300원과 포장 문장이 들어 있습니다. 두 조각 모두 FL159 로 시작하는 문장을 담고 있어서 번호로 물으면 어느 조각이든 찾을 단서가 있습니다.

| 조각 | 문장 | 담긴 속성 | 단서 |
|---|---|---|---|
| 첫째 조각 | 첫 문장, 둘째 문장 | 이름, 분류, 색, 소재 | 상품 이름과 모델 번호 |
| 둘째 조각 | 셋째 문장, 넷째 문장 | 무게, 가격 | 모델 번호 |
| 세 문장 문서의 둘째 조각 | 셋째 문장 하나 | 무게, 가격 | 모델 번호 |

첫 카드는 문서 한 건이 조각 2개로 나뉘는 과정을 보여 줍니다. 카드의 파랑은 코드가 하는 일, 벽돌색은 질문과 모델의 답, 먹색은 문서와 조각, 회색은 정답 문서가 아닌 조각이고 점선 상자는 가상 값입니다.

<div class="demo-embed-wrap">
<iframe class="demo-embed" src="demo-rag-cards.html?embed=1&card=chunk" height="480" loading="lazy" title="문서 한 건이 조각 둘이 되는 길"></iframe>
<a class="demo-embed-open" href="demo-rag-cards.html" target="_blank" rel="noopener">↗ 카드 네 장 전체로 열기</a>
</div>

## 3. 질문과 가까운 조각 3개의 검색

**질문 20개마다 조각 200개 전부와 코사인을 계산해 가장 큰 3개를 골랐습니다. 정답 문서의 조각이 이 상위 3 에 든 질문은 15개로 Context Recall 이 15/20, Context Precision 은 0.47 이었습니다.**

검색이 정답 문서의 조각을 상위 3 에 넣지 못하면 4절의 모델은 그 값을 아예 받지 못합니다. 넣더라도 다른 상품의 조각이 함께 들어가면 모델은 그 사이에서 정답 문서의 값을 골라내야 합니다.

코사인은 두 벡터의 방향이 같을수록 1 에 가까운 값입니다. 검색은 질문도 조각과 같은 `embed` 에 넣어 벡터로 바꾼 뒤 조각 200개 하나하나와 코사인을 계산해 큰 순서로 정렬합니다. 정렬한 앞의 k 개를 상위 k 라고 부릅니다. 코사인이 같은 조각끼리는 조각 목록에서 앞에 있던 조각을 앞 순위에 둡니다. 조각을 하나도 빼지 않고 모두 계산하는 이 방식이 전수 검색입니다. 실제 서비스는 전수 검색 대신 [Elasticsearch 하이브리드 검색](post.html?id=elasticsearch-hybrid-retrieval) 편처럼 색인(검색하기 쉽게 미리 정리해 둔 자료)을 둡니다.

검색의 품질은 정답 문서의 조각을 넣었는지와 다른 조각이 얼마나 섞였는지를 따로 보는 Context Recall 과 Context Precision 으로 나눠 봅니다. Context Recall 은 정답 문서의 조각이 상위 k 에 하나라도 든 질문의 몫입니다. Context Precision 은 상위 k 조각 가운데 정답 문서의 조각이 차지한 몫을 질문마다 구해 질문 20개로 평균한 값입니다. 아래 출력의 q01 은 상위 3 가운데 2개가 정답 문서 d068 의 조각이라 Context Recall 에서는 찾은 질문으로 세고 Context Precision 의 평균에는 3개 가운데 2개라는 몫이 들어갑니다. 두 값 모두 어느 문서가 정답인지 알아야 세는데, 이 글은 질문을 만들 때 질문마다 정답 문서를 정해 두었습니다.

질문 20개 가운데 15개는 HH820 처럼 모델 번호로 묻습니다. 나머지 5개는 검색이 놓치도록 일부러 「윤라이프 캐리어」처럼 문서에 없는 다른 이름으로 상품을 부릅니다. 이 상품은 문서에 「여행가방」으로 적혀 있어 질문과 문서가 상표 「윤라이프」 말고는 글자가 거의 겹치지 않으므로, 이 5개는 정답 문서의 조각이 상위 3 에 들지 않습니다.

아래 블록은 k 를 1, 3, 5 로 바꿔 가며 두 값이 어떻게 달라지는지 찍은 다음 찾은 질문 q01 과 놓친 질문 q05 의 상위 3 을 점수와 함께 보입니다. 4절에서 모델에 넣는 조각은 이 가운데 k=3 의 상위 3 입니다.

```python
# (앞 블록에 이어서 돌린다.)
# 하는 일: 질문 20개마다 코사인이 큰 조각 셋을 찾고, Context Recall 과 Context Precision 을 센다.

# 1단계: 코사인과 검색을 둔다
# cosine 은 임베딩과 벡터 검색 편의 것 그대로다. 조각 200개와 질문의 코사인을 다 측정해서 큰 순서로 정렬한다.
def cosine(a, b):
    dot = sum(x * y for x, y in zip(a, b))
    na = math.sqrt(sum(x * x for x in a))
    nb = math.sqrt(sum(y * y for y in b))
    return dot / (na * nb) if na and nb else 0.0


def retrieve(q, chunks, k=3):
    """질문과 코사인이 큰 조각 k 개. 점수가 같으면 앞에 놓인 조각을 앞에 둔다."""
    qv = embed(q)
    scored = sorted(enumerate(chunks), key=lambda t: (-cosine(qv, t[1]['vec']), t[0]))
    return [c for _, c in scored[:k]]

# 2단계: 질문 20개의 상위 조각을 보고 두 값을 센다
# Context Recall 은 정답 문서의 조각이 상위 k 에 하나라도 든 질문의 몫이다.
# Context Precision 은 상위 k 조각 가운데 정답 문서의 조각이 차지한 몫을 질문 20개로 평균한 값이다.
top = {q['id']: retrieve(q['question'], chunks) for q in questions}
for k in (1, 3, 5):
    found = [retrieve(q['question'], chunks, k) for q in questions]
    hit = sum(any(c['doc_id'] == q['doc_id'] for c in f) for q, f in zip(questions, found))
    share = sum(sum(c['doc_id'] == q['doc_id'] for c in f) / k for q, f in zip(questions, found)) / len(questions)
    print(f'k={k}: Context Recall {hit}/{len(questions)} = {hit / len(questions):.2f}, Context Precision {share:.2f}')

# 3단계: 찾은 질문 하나와 놓친 질문 하나의 상위 3 을 본다
# 모델 번호로 물으면 번호의 글자 조각이 정답 문서의 두 조각에 다 들어 있다.
# 다른 이름으로 물으면 상표 말고는 겹치는 글자가 적어, 다른 상품의 조각이 위에 선다.
for q in (next(q for q in questions if not q['missed']), next(q for q in questions if q['missed'])):
    print(f'{q["id"]} {q["question"]} (정답 {q["doc_id"]})')
    for c in top[q['id']]:
        print(f'  {cosine(embed(q["question"]), c["vec"]):.3f} [{c["doc_id"]}] {c["text"][:40]}')
# 출력:
# 2단계 뜻: k 를 늘려도 Recall 은 그대로이고, Precision 은 다른 문서의 조각이 들어오는 만큼 내려간다.
# k=1: Context Recall 15/20 = 0.75, Context Precision 0.75
# k=3: Context Recall 15/20 = 0.75, Context Precision 0.47
# k=5: Context Recall 15/20 = 0.75, Context Precision 0.29
# 3단계 뜻: 모델 번호로 물은 q01 은 정답 문서의 두 조각이 위에 서고, 다른 이름으로 물은 q05 는 다른 상품만 선다.
# q01 HH820 의 가격은 몇 원인가? (정답 d068)
#   0.430 [d068] HH820 의 무게는 170g 이고, 가격은 85000원이다. HH820
#   0.377 [d068] 상품 하이라이프 방수 그레이 모자 HH820 의 분류는 잡화 이다. HH
#   0.294 [d011] KH996 의 무게는 460g 이고, 가격은 141600원이다.
# q05 윤라이프 캐리어의 무게는 몇 g 인가? (정답 d077)
#   0.308 [d050] KD882 의 무게는 60g 이고, 가격은 343600원이다. KD882
#   0.300 [d011] KH996 의 무게는 460g 이고, 가격은 141600원이다.
#   0.300 [d042] FD594 의 무게는 160g 이고, 가격은 327000원이다.
```

k 를 바꿔 찍은 2단계의 세 줄에서 Context Recall 은 k 가 1, 3, 5 어느 때든 15/20 = 0.75 로 같습니다. 모델 번호로 물은 15개는 k=1 에서 이미 1위 조각이 정답 문서의 것이었습니다. 다른 이름으로 물은 5개는 5위 안에도 정답 문서의 조각이 없었습니다. 놓친 까닭이 순위가 아니라 질문의 낱말에 있으므로 k 를 늘려도 놓친 5개는 찾은 질문으로 바뀌지 않습니다.

Context Precision 은 k=1 에서 0.75, k=3 에서 0.47, k=5 에서 0.29 로 k 가 커질수록 내려갑니다. k=1 에서는 찾은 15개의 1위가 모두 정답 문서의 조각이고 놓친 5개의 1위는 다른 문서의 조각이라 질문마다 몫이 1 이거나 0 이 되어 평균이 15/20 = 0.75 입니다. 그런데 정답 문서의 조각은 문서마다 2개뿐이라 k 가 3, 5 로 커지면 늘어난 자리에 다른 문서의 조각이 들어와 그만큼 몫이 줄어듭니다. 같은 까닭으로 상위 3 에는 정답 문서가 아닌 조각이 적어도 하나 들어가고 4절의 모델은 그 조각을 보고도 정답 문서의 값을 골라야 합니다.

3단계 출력에서 q01 의 상위 3 은 d068 의 두 조각과 d011 의 조각입니다. 1위(0.430)는 가격 85000원이 든 d068 의 둘째 조각이고 2위(0.377)는 상품 이름이 든 첫째 조각입니다. 두 조각 모두 질문의 HH820 과 글자가 겹칩니다. q05(「윤라이프 캐리어의 무게는 몇 g 인가」, 정답 d077)는 상표 말고는 정답 문서와 겹치는 글자가 적습니다. 그 대신 질문의 「무게는 몇 g」과 글자가 겹친 다른 상품의 무게와 가격 조각 d050, d011, d042 가 0.300~0.308 을 얻어 상위 3 을 모두 차지했습니다.

| k | Context Recall | Context Precision | 이 글에서 |
|---|---|---|---|
| 1 | 15/20 = 0.75 | 0.75 | 찾은 15개의 1위가 모두 정답 문서 |
| 3 | 15/20 = 0.75 | 0.47 | 4절이 모델에 넣는 조각 수 |
| 5 | 15/20 = 0.75 | 0.29 | 놓친 5개는 5위 안에도 없음 |

<div class="demo-embed-wrap">
<iframe class="demo-embed" src="demo-rag-cards.html?embed=1&card=retrieve" height="480" loading="lazy" title="질문 벡터와 가까운 조각 셋"></iframe>
<a class="demo-embed-open" href="demo-rag-cards.html" target="_blank" rel="noopener">↗ 카드 네 장 전체로 열기</a>
</div>

## 4. 조각을 넣은 프롬프트와 답

**상위 3 조각을 문서 id 와 함께 질문 앞에 붙여 보냈고 답은 값(value)과 그 값을 읽은 조각의 문서 id 목록(doc_ids)을 담은 JSON 한 줄로 받았습니다. 기록한 답 20개는 모두 이 꼴로 읽혔습니다. 입력은 요청마다 262~304 토큰이었습니다.**

선배 말대로 지어낸 가격이 광고주 화면에 나가면 안 되므로 모델에는 건넨 조각에 적힌 값만 쓰라고 지시합니다. 또 그 값을 정말 조각에서 읽었는지 5절에서 코드가 확인할 수 있게 답의 꼴을 미리 정해 둡니다.

시스템 메시지는 요청마다 질문과 함께 보내는 할 일 설명입니다. 이 글은 네 줄짜리 시스템 메시지로 문서 조각에 적힌 값만으로 답하게 하고 그 답은 「{"value": "<값>", "doc_ids": ["<문서 id>"]}」 꼴의 JSON 한 줄로만 쓰게 했습니다. 조각에 답이 없으면 「{"value": "not_found", "doc_ids": []}」 로 답하게 했으므로 not_found 는 조각에 답이 없다는 모델의 답입니다.

2절에서 문서의 색과 소재를 영어 낱말로 적어 두었으므로 value 에도 숫자나 영어 낱말만 쓰라고 해서 답을 정답 값과 글자 그대로 비교할 수 있습니다. doc_ids 에는 값을 읽어 온 조각 앞에 붙은 문서 id 를 적게 했습니다. 5절의 근거 대조는 이 id 를 보고 어느 조각과 대조할지 고릅니다. 답의 꼴을 JSON 으로 정하고 코드로 읽어 검사하는 방법은 [구조화 출력](post.html?id=structured-output) 편에서 다뤘습니다.

질문마다 달라지는 사용자 메시지에는 「문서 조각:」 줄 아래에 상위 3 조각을 3절의 점수 순서대로 한 줄에 하나씩 적고 빈 줄 다음에 질문을 적었습니다. 조각마다 앞에 [d068] 같은 문서 id 를 붙였으므로 모델이 doc_ids 에 적을 id 를 그 표시에서 읽을 수 있습니다.

질문 20개는 모두 thinking 을 끄고 temperature 0 으로 한 번씩만 보냈습니다. thinking 은 모델이 답 앞에 쓰는 풀이이고 temperature 는 다음 토큰을 얼마나 흔들리게 뽑을지 정하는 값입니다. thinking 을 껐으므로 USAGE 의 넷째 값인 풀이 글자 수가 20개 모두 0 입니다.

답을 읽는 규칙은 블록 2단계의 `read` 에 있습니다. `read` 는 답이 JSON 객체이고 키가 value 와 doc_ids 둘뿐이며 doc_ids 가 문자열 목록일 때만 읽은 답으로 봅니다. 이 조건에 맞지 않는 답은 읽지 못한 답으로 세고 틀린 답으로 칩니다.

아래 블록은 모델이 정말 건넨 조각 안에서만 값을 골랐는지 보려고 돌립니다. 3단계는 기록한 답 20개를 읽어 정답과 같은 값, not_found, 근거 대조, 근거 없는 답을 셉니다. 4단계는 손으로 만든 답 2개로 근거 대조가 잘못된 답을 잡는지 시험합니다.

```python
# (앞 블록에 이어서 돌린다.)
# 하는 일: 기록한 답 20개를 읽고, 정답과 같은 값, 근거 대조, 근거 없는 답, not_found 를 센다.
# 기록 data/llm-records/rag-basics.json 에서 옮김
import json
import re

# 1단계: 기록을 둔다
# 질문마다 2단계의 상위 3 조각과 질문을 사용자 메시지로 보내, thinking 을 끄고 temperature 0 으로 받은 답이다.
# USAGE 의 네 값은 차례대로 입력 토큰, 출력 토큰, 걸린 ms, thinking 으로 쓴 풀이의 글자 수다.
RECORD = {"q01": "{\"value\": \"85000\", \"doc_ids\": [\"d068\"]}", "q02": "{\"value\": \"5630\", \"doc_ids\": [\"d008\"]}", "q03": "{\"value\": \"60\", \"doc_ids\": [\"d031\"]}", "q04": "{\"value\": \"164100\", \"doc_ids\": [\"d075\"]}", "q05": "{\"value\": \"not_found\", \"doc_ids\": []}", "q06": "{\"value\": \"white\", \"doc_ids\": [\"d056\"]}", "q07": "{\"value\": \"not_found\", \"doc_ids\": []}", "q08": "{\"value\": \"white\", \"doc_ids\": [\"d049\"]}", "q09": "{\"value\": \"270\", \"doc_ids\": [\"d012\"]}", "q10": "{\"value\": \"nylon\", \"doc_ids\": [\"d009\"]}", "q11": "{\"value\": \"not_found\", \"doc_ids\": []}", "q12": "{\"value\": \"1230\", \"doc_ids\": [\"d073\"]}", "q13": "{\"value\": \"brown\", \"doc_ids\": [\"d028\"]}", "q14": "{\"value\": \"khaki\", \"doc_ids\": [\"d057\"]}", "q15": "{\"value\": \"89600\", \"doc_ids\": [\"d058\"]}", "q16": "{\"value\": \"not_found\", \"doc_ids\": []}", "q17": "{\"value\": \"nylon\", \"doc_ids\": [\"d005\"]}", "q18": "{\"value\": \"plastic\", \"doc_ids\": [\"d080\"]}", "q19": "{\"value\": \"not_found\", \"doc_ids\": []}", "q20": "{\"value\": \"178100\", \"doc_ids\": [\"d013\"]}"}
USAGE = {"q01": [283, 20, 3078, 0], "q02": [301, 19, 2291, 0], "q03": [277, 17, 2173, 0], "q04": [301, 21, 2411, 0], "q05": [274, 13, 1900, 0], "q06": [297, 16, 2111, 0], "q07": [289, 13, 1980, 0], "q08": [297, 16, 2203, 0], "q09": [275, 18, 2342, 0], "q10": [283, 17, 2236, 0], "q11": [295, 13, 1967, 0], "q12": [274, 19, 2325, 0], "q13": [282, 16, 2149, 0], "q14": [293, 17, 2179, 0], "q15": [285, 20, 2418, 0], "q16": [262, 13, 1769, 0], "q17": [294, 17, 2156, 0], "q18": [287, 17, 2159, 0], "q19": [304, 13, 1934, 0], "q20": [292, 21, 2433, 0]}

# 2단계: 답을 읽고 근거 대조를 둔다
# 키가 value 와 doc_ids 둘인 JSON 객체이고, doc_ids 가 글자 목록일 때만 읽은 답이다. 그 밖은 읽지 못한 답으로 틀린 답이다.
# contains 는 조각 글에 값이 따로 떨어져 있는지 본다. 숫자는 앞뒤에 다른 숫자가 없어야 하고, 낱말은 앞뒤에 다른 알파벳이 없어야 한다.
# 그래서 4110g 안의 4110 은 찾고, 185000 안의 85000 은 찾지 않는다.
# grounded 는 doc_ids 가 가리킨 조각 가운데 하나라도 value 를 담았으면 참이다.
def read(text):
    try:
        obj = json.loads(text)
    except ValueError:
        return None
    if not isinstance(obj, dict) or sorted(obj) != ['doc_ids', 'value']:
        return None
    if not isinstance(obj['doc_ids'], list) or not all(isinstance(i, str) for i in obj['doc_ids']):
        return None
    return {'value': str(obj['value']).strip().lower(), 'doc_ids': obj['doc_ids']}


def contains(text, value):
    if not value:
        return False                           # 빈 값은 어느 글에나 있는 것으로 읽히므로 거짓으로 둔다
    edge = '0-9' if value.isdigit() else 'a-z'
    return re.search('(?<![%s])%s(?![%s])' % (edge, re.escape(value), edge), text.lower()) is not None


def grounded(answer, chunks):
    return any(c['doc_id'] in answer['doc_ids'] and contains(c['text'], answer['value']) for c in chunks)


# 3단계: 20개를 센다
# 찾은 15개는 value 가 정답 값과 같아야 맞고, 놓친 5개는 not_found 여야 맞다.
# 근거 없는 답은 not_found 가 아닌데 받은 조각 셋 어디에도 없는 value 다.
got = {q['id']: read(RECORD[q['id']]) for q in questions}
found = [q for q in questions if not q['missed']]
missed = [q for q in questions if q['missed']]
ok = [q for q in found if got[q['id']] and got[q['id']]['value'] == str(q['value'])]
nf_right = [q for q in missed if got[q['id']] and got[q['id']]['value'] == 'not_found']
nf_wrong = [q for q in found if got[q['id']] and got[q['id']]['value'] == 'not_found']
given = [q for q in questions if got[q['id']] and got[q['id']]['value'] != 'not_found']
ground = [q for q in given if grounded(got[q['id']], top[q['id']])]
loose = [q for q in given if not any(contains(c['text'], got[q['id']]['value']) for c in top[q['id']])]
print(f'읽지 못한 답 {sum(a is None for a in got.values())}개')
print(f'찾은 {len(found)}개: 정답과 같은 값 {len(ok)}개, not_found 를 잘못 냄 {len(nf_wrong)}개')
print(f'놓친 {len(missed)}개: not_found 를 맞게 냄 {len(nf_right)}개')
print(f'값을 낸 답 {len(given)}개: 근거 대조 통과 {len(ground)}개, 근거 없는 답 {len(loose)}개')
print(f'맞힌 답 {len(ok) + len(nf_right)}/{len(questions)}')
print(f'입력 {min(u[0] for u in USAGE.values())}~{max(u[0] for u in USAGE.values())} 토큰, '
      f'출력 {min(u[1] for u in USAGE.values())}~{max(u[1] for u in USAGE.values())} 토큰, '
      f'20개 합계 {sum(u[2] for u in USAGE.values()) / 1000:.1f}초')

# 4단계: 손으로 만든 답 둘로 근거 대조를 시험한다
# 기록에 없는 답이다. 조각에 없는 값과, 값은 맞지만 받은 조각에 없는 문서 id 를 적은 답을 grounded 에 넣어 본다.
q = found[0]
for fake in ({'value': '99999', 'doc_ids': [q['doc_id']]}, {'value': str(q['value']), 'doc_ids': ['d100']}):
    print(f'{q["id"]} 손으로 만든 답 {fake}: grounded {grounded(fake, top[q["id"]])}')
# 출력:
# 3단계 뜻: 20개 모두 읽혔고, 찾은 15개는 정답 값을, 놓친 5개는 not_found 를 냈다. 근거 없는 답은 없다.
# 읽지 못한 답 0개
# 찾은 15개: 정답과 같은 값 15개, not_found 를 잘못 냄 0개
# 놓친 5개: not_found 를 맞게 냄 5개
# 값을 낸 답 15개: 근거 대조 통과 15개, 근거 없는 답 0개
# 맞힌 답 20/20
# 입력 262~304 토큰, 출력 13~21 토큰, 20개 합계 44.2초
# 4단계 뜻: 조각에 없는 값과 받지 않은 문서 id 는 둘 다 근거 대조에서 거짓이다.
# q01 손으로 만든 답 {'value': '99999', 'doc_ids': ['d068']}: grounded False
# q01 손으로 만든 답 {'value': '85000', 'doc_ids': ['d100']}: grounded False
```

3단계 출력의 첫 줄 「읽지 못한 답 0개」는 기록한 20개가 모두 정해 둔 꼴의 JSON 으로 왔다는 뜻입니다. 둘째 줄을 보면 검색이 찾은 15개는 모두 정답과 같은 값을 냈고 not_found 를 잘못 낸 질문은 0개였습니다. 이 15개는 1위 조각이 정답 문서의 것이었고 모델은 그 문서의 값을 골랐습니다.

셋째 줄의 놓친 5개는 받은 조각 3개가 모두 다른 상품의 것이라 질문한 상품의 값이 프롬프트에 없었는데, 모델은 다른 상품의 값을 대신 쓰지 않고 시스템 메시지에 적은 대로 5개 모두 not_found 를 냈습니다. 찾은 15개의 정답 값과 놓친 5개의 not_found 를 모두 맞는 답으로 세므로 검색이 15개만 찾았는데도(Context Recall 0.75) 다섯째 줄의 맞힌 답은 20/20 입니다. 넷째 줄의 근거 대조는 5절에서 봅니다.

3단계의 마지막 줄을 보면 입력은 요청마다 262~304 토큰인데 출력은 13~21 토큰입니다. 조각 3개와 시스템 메시지가 요청마다 같이 가므로 입력이 출력보다 훨씬 깁니다. RAG 는 넣는 조각 수만큼 입력 토큰이 늘어납니다. 20개를 받는 데는 모두 44.2초가 걸렸습니다.

<div class="demo-embed-wrap">
<iframe class="demo-embed" src="demo-rag-cards.html?embed=1&card=prompt" height="480" loading="lazy" title="조각 셋을 넣은 프롬프트"></iframe>
<a class="demo-embed-open" href="demo-rag-cards.html" target="_blank" rel="noopener">↗ 카드 네 장 전체로 열기</a>
</div>

## 5. 근거 대조와 근거 없는 답

**not_found 대신 값을 낸 답 15개는 모두 근거 대조를 통과했고 근거 없는 답은 0개였습니다. 0개는 이 기록에서 코드가 센 값입니다. 손으로 만든 답 2개는 근거 대조에서 걸렸습니다.**

시스템 메시지는 조각에 적힌 값만 쓰라고 적을 뿐 모델이 그 말을 지켰는지는 알려 주지 않습니다. 그래서 답의 값이 그 답이 가리킨 조각에 정말 있는지 코드가 글자로 대조합니다. 이 대조를 근거 대조라고 부릅니다.

근거 대조는 4절 블록의 `grounded` 함수가 합니다. `grounded` 는 받은 조각 3개 가운데 doc_ids 에 적힌 문서의 조각만 골라 그 글에 value 가 있으면 참을 냅니다. 근거 없는 답은 not_found 가 아닌데 받은 조각 3개 어디에도 없는 value 를 낸 답입니다. 그래서 근거 없는 답을 셀 때는 doc_ids 와 상관없이 받은 조각 3개를 모두 봅니다.

두 검사 모두 조각 글에 값이 있는지를 `contains` 로 보는데, `contains` 는 숫자와 영어 낱말의 경계를 다르게 둡니다. 숫자는 앞뒤에 다른 숫자가 없어야 하므로 뒤에 단위 g 가 붙은 d001 의 「4110g」 에서도 4110 을 찾고 185000 안의 85000 은 더 긴 숫자의 일부라 찾지 않습니다. 영어 낱말은 앞뒤에 다른 알파벳이 붙어 있지 않아야 찾습니다. 경계를 잘못 두면 코드가 맞는 답을 근거 없는 답으로 셉니다.

이 기록에서는 값을 낸 15개 모두 doc_ids 가 가리킨 조각에 그 값이 있어 근거 대조를 통과했고 근거 없는 답도 나오지 않았습니다. 그래도 0개가 나왔다고 대조를 빼지는 않습니다. 질문과 문서가 바뀌거나 모델이 바뀌면 이 숫자도 바뀔 수 있으므로 바뀐 뒤에도 같은 코드로 다시 셀 수 있게 대조를 그대로 둡니다.

근거 대조가 잘못된 답을 실제로 잡는지는 4단계의 손으로 만든 답 2개로 확인했습니다. 두 답은 모델이 낸 답이 아니라 기록에 없는 답입니다. 첫째 답은 q01 의 정답 문서 d068 을 가리키면서 조각에 없는 값 99999 를 적었습니다. d068 의 조각에 99999 가 없으므로 grounded 가 False 입니다. 둘째 답은 맞는 값 85000 을 적었지만 받은 조각에 없는 문서 d100 을 가리켰습니다. 받은 조각 가운데 d100 의 조각이 하나도 없으므로 역시 False 입니다.

| 센 것 | 무엇을 보나 | 이 기록 |
|---|---|---|
| 정답과 같은 값 | 찾은 15개의 value 가 정답 값과 같은가 | 15/15 |
| not_found 를 맞게 냄 | 놓친 5개가 not_found 인가 | 5/5 |
| not_found 를 잘못 냄 | 찾은 15개에서 not_found 를 냈는가 | 0개 |
| 근거 대조 통과 | doc_ids 의 조각에 value 가 있는가 | 15개 |
| 근거 없는 답 | 받은 조각 셋 어디에도 없는 value 인가 | 0개 |
| 읽지 못한 답 | JSON 꼴이 맞는가 | 0개 |

<div class="demo-embed-wrap">
<iframe class="demo-embed" src="demo-rag-cards.html?embed=1&card=grounding" height="480" loading="lazy" title="답과 조각의 대조, recall 과 precision"></iframe>
<a class="demo-embed-open" href="demo-rag-cards.html" target="_blank" rel="noopener">↗ 카드 네 장 전체로 열기</a>
</div>

## 6. 광고에서 RAG 를 쓰는 세 자리

**광고에서 RAG 는 광고주 자산 문서, 정책 문서, 캠페인 설정 도움말을 다룰 때 자주 나옵니다. 세 자리 모두 답이 회사 안의 문서에 있고 그 문서가 자주 바뀌므로, 1절처럼 값을 모델에 학습시키지 않고 문서에 둡니다.**

광고주 자산 문서는 광고주가 올린 상품 설명, 브랜드 소개, 소재 문구 같은 글로, 이 글의 상품 설명문 100건도 여기에 듭니다. 광고 문구를 만들거나 상품을 두고 묻는 질문에 답할 때 이 문서를 찾아 넣습니다. 이 자리에서 값이 틀리면 광고주의 상품을 잘못 알리므로 근거 대조가 특히 필요합니다.

정책 문서에는 어떤 광고를 실을 수 있는지 정한 규칙이 적혀 있습니다. 심사 담당자나 광고주가 「이 문구를 써도 되는가」를 물으면 관련 조항을 찾아 넣고 모델이 그 조항으로 답하게 합니다. 정책은 자주 고쳐지고 고친 날부터는 다른 답이 나와야 하는데, RAG 를 쓰면 모델을 다시 학습하지 않고 정책 문서만 고치면 됩니다.

캠페인 설정 도움말은 예산, 입찰, 타겟팅을 어떻게 설정하는지 설명한 문서입니다. 광고주가 화면에서 「하루 예산을 바꾸면 언제부터 적용되는가」를 물으면 도움말에서 해당 절을 찾아 넣습니다. 답에 doc_ids 처럼 출처를 붙여 두면 광고주가 그 원문을 직접 열어 확인할 수 있습니다.

세 자리 모두 검색이 정답 문서를 놓치면 모델은 맞는 답을 낼 수 없습니다. 3절의 다른 이름처럼 묻는 사람의 낱말과 문서의 낱말이 다른 일이 흔하므로, 글자가 겹치는 문서를 찾는 글자 검색과 뜻을 배운 임베딩으로 찾는 벡터 검색을 함께 쓰고 Context Recall 을 따로 측정합니다.

| 자리 | 문서 | 묻는 사람 | 답에 붙이는 것 |
|---|---|---|---|
| 광고주 자산 문서 | 상품 설명, 브랜드 소개, 소재 문구 | 광고주, 문구를 만드는 코드 | 값을 읽은 문서 id |
| 정책 문서 | 실을 수 있는 광고의 규칙 | 심사 담당자, 광고주 | 관련 조항 |
| 캠페인 설정 도움말 | 예산, 입찰, 타겟팅 설정 설명 | 광고주 | 도움말의 해당 절 |

## 7. 두 무대에서 문서를 모으는 곳

**두 무대는 문서를 자르고 찾아 넣는 계산이 같고 넣을 문서가 모여 있는 곳만 다릅니다.**

### 담장 안: 한 회사에 모인 문서 [무대: 닫힌 생태계]

담장 안은 한 회사가 서비스와 광고 서버를 모두 가진 곳입니다. 광고주가 올린 상품 설명도, 그 회사의 정책과 도움말도 모두 한 회사 안에 있으므로 문서를 잘라 벡터를 붙인 색인을 하나로 만들 수 있습니다. 문서가 바뀌면 그 문서의 조각만 다시 만들어 색인에 넣습니다.

### 열린 RTB: 여러 회사에 흩어진 문서 [무대: 열린 RTB]

열린 RTB 는 여러 회사가 실시간 경매로 남의 지면에 광고를 사고파는 곳입니다. 광고 지면을 사는 플랫폼인 DSP 에는 지면을 가진 회사의 문서가 없으므로, RAG 는 입찰 경로보다 광고주 도움말이나 소재 검수처럼 DSP 안의 문서로 할 수 있는 일에 씁니다. 입찰 요청에 답할 시간이 짧아서 모델을 부르는 일은 입찰이 오기 전에 미리 해 둡니다.

## 한눈 정리

| 자리 | 무엇 | 이 글의 값 |
|---|---|---|
| RAG | 찾은 문서를 입력에 넣고 답하게 함 | 상위 3 조각을 질문 앞에 붙임 |
| 조각 | 문서를 몇 문장씩 자른 것 | 문서 100건, 조각 200개 |
| 검색 | 질문과 가까운 조각을 고름 | 장난감 임베딩과 코사인, 전수 |
| Context Recall | 정답 문서가 상위 k 에 든 질문의 몫 | 15/20 = 0.75 |
| Context Precision | 상위 k 가운데 정답 문서의 몫 | k=3 에서 0.47 |
| 근거 대조 | 답의 값이 가리킨 조각에 있는가 | 15개 통과 |
| 근거 없는 답 | 받은 조각 어디에도 없는 값 | 0개 |
| 답 정확도 | 찾은 15개는 값, 놓친 5개는 not_found | 20/20 |

## 헷갈리기 쉬운 점

- **검색이 놓치면 모델 탓이 아닙니다.** 놓친 5개는 정답 문서의 조각이 프롬프트에 아예 들어가지 않았으므로 모델은 받지 못한 값을 답할 수 없었고 이 기록에서는 not_found 로 답했습니다. 그래서 답이 틀리면 모델보다 먼저 Context Recall 을 보고 검색이 정답 문서를 찾았는지부터 확인합니다.
- **근거 대조는 코드가 합니다.** 시스템 메시지는 조각의 값만 쓰라고 시킬 뿐 모델이 지켰는지는 알려 주지 않습니다. `grounded` 는 답의 value 가 doc_ids 의 조각에 글자로 들어 있는지 확인합니다. 이 기록의 근거 없는 답 0개도 코드가 센 값입니다.
- **Context Recall 과 답 정확도는 다른 값입니다.** Context Recall 은 검색을 센 값으로 0.75 였고 답 정확도는 모델의 답을 센 값으로 20/20 이었습니다. 놓친 5개에서 낸 not_found 를 맞는 답으로 쳤으므로 두 값이 다릅니다.

## 더 깊이 보기

:::deep RAGAS 는 정답 없이 측정하는 지표를 내놓았습니다
RAGAS 논문은 RAG 를 사람이 단 정답 없이 평가하는 지표 세트를 내놓았습니다. 초록은 평가할 것을 셋으로 적습니다. 검색이 관련 있고 군더더기 없는 문단을 찾는지, LLM 이 그 문단을 충실히 쓰는지, 생성한 글의 품질입니다. 이 글의 두 값은 이름이 비슷하지만 정답 문서로 셉니다. 질문을 만들 때 정답 문서를 정해 두었기 때문입니다.

정답 문서를 $g$, 상위 $k$ 조각의 문서를 $c_1, \dots, c_k$ 라고 둡니다. 질문 $N$ 개에서 이 글이 센 두 값은 아래와 같습니다.

$$\text{Recall@}k = \frac{1}{N}\sum_{n=1}^{N} \mathbb{1}\left[\, g_n \in \{c_{n,1}, \dots, c_{n,k}\} \,\right]$$

$$\text{Precision@}k = \frac{1}{N}\sum_{n=1}^{N} \frac{1}{k}\sum_{i=1}^{k} \mathbb{1}\left[\, c_{n,i} = g_n \,\right]$$

실제 서비스의 질문에는 정답 문서가 적혀 있지 않습니다. 그래서 사람이 일부 질문에 정답을 달거나, RAGAS 처럼 정답 없이 측정하는 방법을 씁니다. 어느 쪽이든 검색의 값과 답의 값을 따로 둡니다.
:::

:::deep 조각 크기와 넣는 자리
조각을 크게 자르면 값이 같이 들어올 기회는 늘지만 질문과 상관없는 문장도 같이 들어옵니다. 작게 자르면 조각마다 단서가 줄어, 2절처럼 모델 번호를 문장마다 넣어야 찾힙니다. 이 글은 문장 2개 한 가지만 썼습니다. 크기를 정할 때는 크기마다 Context Recall 과 답 정확도를 같이 측정합니다.

조각을 많이 넣으면 넣는 자리도 문제가 됩니다. Liu 와 동료들의 논문은 관련 정보가 입력의 처음이나 끝에 있을 때 성능이 흔히 가장 높았고 긴 입력의 가운데에 있으면 크게 떨어졌다고 적었습니다. 이 글은 조각 셋을 점수 순서로 넣었고 자리를 바꾸는 시험은 하지 않았습니다.
:::

- [임베딩과 벡터 검색](post.html?id=embeddings-vector-search) — 이 글의 `embed` 와 `cosine` 을 처음 짠 23주째 편입니다.
- [Elasticsearch 하이브리드 검색](post.html?id=elasticsearch-hybrid-retrieval) — 글자 검색과 벡터 검색을 함께 쓴 편입니다.
- [구조화 출력](post.html?id=structured-output) — 모델의 답을 JSON 으로 받아 검증한 22주째 편입니다.
- [LLM 호출 한 번](post.html?id=llm-first-call) — 노트북의 모델에 요청 하나를 처음 보낸 편입니다.
- [RAG 카드 네 장](demo-rag-cards.html) — 이 글의 카드 전체입니다. 카드를 누르면 헷갈리는 것 하나가 더 나옵니다.

## 참고문헌

- Patrick Lewis 외 (2020). *Retrieval-Augmented Generation for Knowledge-Intensive NLP Tasks*. arXiv:2005.11401. [arxiv.org](https://arxiv.org/abs/2005.11401). 학습한 seq2seq 모델과 벡터 색인에서 문단을 찾는 검색기를 묶은 RAG 입니다.
- Shahul Es 외 (2023). *Ragas: Automated Evaluation of Retrieval Augmented Generation*. arXiv:2309.15217. [arxiv.org](https://arxiv.org/abs/2309.15217). 사람이 단 정답 없이 RAG 를 평가하는 지표 세트입니다.
- Nelson F. Liu 외 (2023). *Lost in the Middle: How Language Models Use Long Contexts*. arXiv:2307.03172. [arxiv.org](https://arxiv.org/abs/2307.03172). 관련 정보가 긴 입력의 가운데에 있으면 성능이 떨어진다는 분석입니다.
