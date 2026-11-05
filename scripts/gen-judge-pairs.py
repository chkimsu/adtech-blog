#!/usr/bin/env python3
"""LLM-as-a-Judge 글(llm-as-a-judge)의 질의와 상품 쌍 50개, 사람 라벨, 짝비교 20쌍을 만든다. 글의 파이썬 1, 3 블록과 같은 코드다.

  python3 scripts/gen-judge-pairs.py            쌍 50개와 짝비교 20쌍을 한 줄씩 찍는다
  python3 scripts/gen-judge-pairs.py --prompts  채점 기록의 프롬프트 파일을 찍는다. 아래처럼 받아 쓴다
      python3 scripts/gen-judge-pairs.py --prompts > data/llm-records/prompts/llm-as-a-judge.json
  python3 scripts/gen-judge-pairs.py --pairs    짝비교 기록의 프롬프트 파일을 찍는다. 아래처럼 받아 쓴다
      python3 scripts/gen-judge-pairs.py --pairs > data/llm-records/prompts/llm-as-a-judge-pairs.json
  python3 scripts/gen-judge-pairs.py --check    두 가지를 본다. 프롬프트 파일 둘이 지금 생성기의 출력과 같은가,
                                                글의 파이썬 블록에 아래 두 구간(생성기, 짝비교)이 글자까지 그대로 들어 있는가

구간은 「<이름> 시작」 줄과 「<이름> 끝」 줄 사이다. 생성기는 글의 파이썬 1 블록에, 짝비교는 파이썬 3 블록에 들어 있다.
그 사이를 고치면 글의 블록도 똑같이 고치고, 프롬프트 파일 둘을 다시 뽑아
python3 scripts/llm-record.py --slug llm-as-a-judge 와 --slug llm-as-a-judge-pairs 로 다시 기록한다.
make_products, make_docs 와 그 상수, embed, cosine 은 RAG 글(scripts/gen-rag-docs.py)의 것을 그대로 가져왔다.
사람 라벨은 가상 정답이다. 상품의 분류가 질의의 분류와 같으면 상, 정해 둔 이웃 분류면 중, 그 밖은 하다.
표준 라이브러리만 쓴다.
"""
import json
import math
import os
import random
import sys
import zlib

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
PROMPT_FILES = {'score': os.path.join(ROOT, 'data', 'llm-records', 'prompts', 'llm-as-a-judge.json'),
                'pairs': os.path.join(ROOT, 'data', 'llm-records', 'prompts', 'llm-as-a-judge-pairs.json')}
POST = os.path.join(ROOT, 'posts', 'llm-as-a-judge.md')
REGIONS = ('생성기', '짝비교')

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
# 생성기 끝

# 짝비교 시작
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
# 짝비교 끝

# LLM 에 보내는 시스템 메시지 둘. 채점표와 짝비교다.
SYSTEM_SCORE = ('너는 쇼핑 검색 결과를 채점하는 평가자다. 사용자가 보낸 질의와 상품 문서를 읽고, 상품이 질의에 얼마나 관련 있는지 1~5 점으로 매긴다.\n'
                '5: 질의가 찾는 바로 그 상품이다.\n'
                '4: 질의와 같은 분류의 상품이다.\n'
                '3: 질의와 가까운 분류의 상품이라 함께 살 만하다.\n'
                '2: 분류는 다르지만 조금 이어진다.\n'
                '1: 질의와 관련이 없다.\n'
                '답은 {"score": N} 꼴의 JSON 한 줄로만 쓴다. N 은 1~5 의 정수다. 설명이나 다른 글은 붙이지 않는다.')
SYSTEM_PAIR = ('너는 쇼핑 검색 결과를 비교하는 평가자다. 사용자가 보낸 질의와 상품 문서 A, B 를 읽고, 질의에 더 관련 있는 상품을 고른다.\n'
               '답은 {"winner": "A"} 또는 {"winner": "B"} 꼴의 JSON 한 줄로만 쓴다. 설명이나 다른 글은 붙이지 않는다.')


def score_message(p):
    return '질의: %s\n상품: %s' % (p['query'], p['doc']['text'])


def pair_message(query, first, second):
    return '질의: %s\nA: %s\nB: %s' % (query, first['doc']['text'], second['doc']['text'])


def corpus():
    pairs = make_pairs(make_docs())
    return pairs, make_comparisons(pairs)


def items(kind):
    pairs, comps = corpus()
    if kind == 'score':
        return [{'id': p['id'], 'user': score_message(p)} for p in pairs]
    out = []
    for c in comps:
        out.append({'id': c['id'] + '-ab', 'user': pair_message(c['query'], c['a'], c['b'])})
        out.append({'id': c['id'] + '-ba', 'user': pair_message(c['query'], c['b'], c['a'])})
    return out


def prompts_text(kind):
    """프롬프트 파일 한 벌. 항목은 한 줄에 하나씩 둔다."""
    head = {'system': SYSTEM_SCORE if kind == 'score' else SYSTEM_PAIR, 'think': 'off', 'repeat': 1,
            'options': {'temperature': 0}}
    lines = ['{' + ',\n '.join('%s: %s' % (json.dumps(k), json.dumps(v, ensure_ascii=False)) for k, v in head.items())
             + ',\n "items": [']
    lines.append(',\n'.join('  ' + json.dumps(it, ensure_ascii=False) for it in items(kind)))
    lines.append(' ]}')
    return '\n'.join(lines) + '\n'


def region(name):
    """이 파일에서 「<이름> 시작」 줄과 「<이름> 끝」 줄 사이의 글."""
    with open(os.path.abspath(__file__), encoding='utf-8') as f:
        src = f.read()
    return src.split('# %s 시작\n' % name, 1)[1].split('# %s 끝\n' % name, 1)[0]


def check():
    problems = []
    for kind, path in PROMPT_FILES.items():
        try:
            with open(path, encoding='utf-8') as f:
                on_disk = json.load(f)
        except FileNotFoundError:
            problems.append('프롬프트 파일이 없습니다: ' + os.path.relpath(path, ROOT))
            continue
        want = json.loads(prompts_text(kind))
        if on_disk != want:
            problems.append('프롬프트 파일이 지금 생성기의 출력과 다릅니다: %s. 다시 뽑고 다시 기록합니다'
                            % os.path.relpath(path, ROOT))
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
        pairs, comps = corpus()
        print('✓ 쌍 %d개, 짝비교 %d쌍(좌우 두 벌 %d건), 프롬프트 파일 둘, 글의 두 구간이 이 파일과 같습니다'
              % (len(pairs), len(comps), 2 * len(comps)))
    return 1 if problems else 0


def main():
    args = sys.argv[1:]
    if args == ['--prompts']:
        sys.stdout.write(prompts_text('score'))
        return 0
    if args == ['--pairs']:
        sys.stdout.write(prompts_text('pairs'))
        return 0
    if args == ['--check']:
        return check()
    if args:
        print(__doc__)
        return 2
    pairs, comps = corpus()
    for p in pairs:
        print('%s  %s  %s  %-6s  %s' % (p['id'], p['label'], p['doc']['id'], p['query'], p['doc']['text'][:50]))
    for c in comps:
        print('%s  %-6s  A %s(%s)  B %s(%s)  human %s' % (c['id'], c['query'], c['a']['doc']['id'], c['a']['label'],
                                                         c['b']['doc']['id'], c['b']['label'], c['human']))
    return 0


if __name__ == '__main__':
    raise SystemExit(main())
