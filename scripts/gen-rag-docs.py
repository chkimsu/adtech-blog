#!/usr/bin/env python3
"""RAG 글(rag-basics)의 가상 상품 문서 100건과 질문 20개를 만든다. 글의 파이썬 1, 2 블록과 같은 코드다.

  python3 scripts/gen-rag-docs.py            질문 20개를 한 줄씩 찍는다 (id, 정답 문서, 정답 값, 검색 상위 3 의 문서, 질문)
  python3 scripts/gen-rag-docs.py --prompts  기록 도구의 프롬프트 파일을 찍는다. 아래처럼 받아 쓴다
      python3 scripts/gen-rag-docs.py --prompts > data/llm-records/prompts/rag-basics.json
  python3 scripts/gen-rag-docs.py --check    세 가지를 본다. 질문 20개 가운데 15개는 정답 문서가 검색 상위 3 에 들고 5개는 들지 않는가,
                                             프롬프트 파일이 지금 생성기의 출력과 같은가,
                                             글의 파이썬 블록에 아래 세 구간(생성기, 조각, 검색)이 글자까지 그대로 들어 있는가

구간은 「<이름> 시작」 줄과 「<이름> 끝」 줄 사이다. 생성기와 조각은 글의 파이썬 1 블록에, 검색은 파이썬 2 블록에 들어 있다.
그 사이를 고치면 글의 블록도 똑같이 고치고, 프롬프트 파일을 다시 뽑아 python3 scripts/llm-record.py --slug rag-basics 로 다시 기록한다.
make_products, embed, cosine 은 임베딩과 벡터 검색 글(embeddings-vector-search)의 것을 그대로 가져왔다.
사용자 메시지는 검색 상위 3 조각(조각마다 앞에 [d012] 같은 문서 id)과 질문이다. 20개는 thinking 을 끄고 temperature 0 으로 한 번씩 보낸다.
표준 라이브러리만 쓴다.
"""
import json
import math
import os
import random
import sys
import zlib

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
PROMPTS = os.path.join(ROOT, 'data', 'llm-records', 'prompts', 'rag-basics.json')
POST = os.path.join(ROOT, 'posts', 'rag-basics.md')
REGIONS = ('생성기', '조각', '검색')

# 생성기 시작
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
# 생성기 끝

# 조각 시작
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
# 조각 끝

# 검색 시작
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
# 검색 끝

# LLM 에 보내는 시스템 메시지. 모든 요청에 같이 간다.
SYSTEM = ('너는 상품 문서로 답하는 도우미다. 사용자가 보낸 문서 조각에 적힌 값만으로 질문에 답한다.\n'
          '답은 {"value": "<값>", "doc_ids": ["<문서 id>"]} 꼴의 JSON 한 줄로만 쓴다. 설명이나 다른 글은 붙이지 않는다.\n'
          'value 에는 숫자나 영어 낱말만 쓴다. 한국어는 쓰지 않는다. doc_ids 에는 값을 읽은 조각 앞의 문서 id 를 적는다.\n'
          '조각에 답이 없으면 {"value": "not_found", "doc_ids": []} 로 답한다.')


def user_message(q, top):
    return '문서 조각:\n%s\n\n질문: %s' % ('\n'.join('[%s] %s' % (c['doc_id'], c['text']) for c in top), q['question'])


def corpus():
    docs = make_docs()
    chunks = [c for d in docs for c in chunk(d)]
    questions = make_questions(docs)
    return docs, chunks, questions


def prompts_text():
    """프롬프트 파일 한 벌. 항목은 한 줄에 하나씩 둔다."""
    _, chunks, questions = corpus()
    head = {'system': SYSTEM, 'think': 'off', 'repeat': 1, 'options': {'temperature': 0}}
    lines = ['{' + ',\n '.join('%s: %s' % (json.dumps(k), json.dumps(v, ensure_ascii=False)) for k, v in head.items())
             + ',\n "items": [']
    items = [json.dumps({'id': q['id'], 'user': user_message(q, retrieve(q['question'], chunks))}, ensure_ascii=False)
             for q in questions]
    lines.append(',\n'.join('  ' + it for it in items))
    lines.append(' ]}')
    return '\n'.join(lines) + '\n'


def region(name):
    """이 파일에서 「<이름> 시작」 줄과 「<이름> 끝」 줄 사이의 글."""
    with open(os.path.abspath(__file__), encoding='utf-8') as f:
        src = f.read()
    return src.split('# %s 시작\n' % name, 1)[1].split('# %s 끝\n' % name, 1)[0]


def check():
    problems = []
    _, chunks, questions = corpus()
    hit = [q['id'] for q in questions if any(c['doc_id'] == q['doc_id'] for c in retrieve(q['question'], chunks))]
    expect = [q['id'] for q in questions if not q['missed']]
    if hit != expect:
        problems.append('정답 문서가 상위 3 에 든 질문이 기대와 다릅니다: 든 것 %s, 기대 %s' % (hit, expect))
    try:
        with open(PROMPTS, encoding='utf-8') as f:
            on_disk = f.read()
    except FileNotFoundError:
        on_disk = None
    if on_disk is None:
        problems.append('프롬프트 파일이 없습니다: ' + os.path.relpath(PROMPTS, ROOT))
    elif json.loads(on_disk) != json.loads(prompts_text()):
        problems.append('프롬프트 파일이 지금 생성기의 출력과 다릅니다. --prompts 로 다시 뽑고 다시 기록합니다')
    try:
        with open(POST, encoding='utf-8') as f:
            post = f.read()
    except FileNotFoundError:
        post = ''
    for name in REGIONS:
        if region(name) not in post:
            problems.append('글의 파이썬 블록에 이 파일의 「%s」 구간이 글자까지 그대로 들어 있지 않습니다' % name)
    for p in problems:
        print('✗ ' + p)
    if not problems:
        print('✓ 질문 %d개(검색이 찾는 %d개, 놓치는 %d개), 프롬프트 파일, 글의 세 구간이 이 파일과 같습니다'
              % (len(questions), len(expect), len(questions) - len(expect)))
    return 1 if problems else 0


def main():
    args = sys.argv[1:]
    if args == ['--prompts']:
        sys.stdout.write(prompts_text())
        return 0
    if args == ['--check']:
        return check()
    if args:
        print(__doc__)
        return 2
    _, chunks, questions = corpus()
    for q in questions:
        top = retrieve(q['question'], chunks)
        print('%s  %s  %-9s  %-5s  %s  %s' % (q['id'], q['doc_id'], q['value'], 'miss' if q['missed'] else 'hit',
                                               ','.join(c['doc_id'] for c in top), q['question']))
    return 0


if __name__ == '__main__':
    raise SystemExit(main())
