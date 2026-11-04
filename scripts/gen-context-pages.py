#!/usr/bin/env python3
"""컨텍스추얼 타겟팅 글(contextual-targeting)의 가상 지면 50개를 만든다. 글의 파이썬 1 블록과 같은 생성기다.

  python3 scripts/gen-context-pages.py            지면 50개를 한 줄씩 찍는다 (id, 사람 라벨, 섞은 카테고리, 제목 | 첫 문단)
  python3 scripts/gen-context-pages.py --prompts  기록 도구의 프롬프트 파일을 찍는다. 아래처럼 받아 쓴다
      python3 scripts/gen-context-pages.py --prompts > data/llm-records/prompts/contextual-targeting.json
  python3 scripts/gen-context-pages.py --check    두 가지를 본다. 프롬프트 파일이 지금 생성기의 출력과 같은가,
                                                  글의 파이썬 1 블록에 아래 생성기가 글자까지 그대로 들어 있는가

생성기는 「생성기 시작」 줄과 「생성기 끝」 줄 사이다. 그 사이를 고치면 글의 파이썬 1 블록도 똑같이 고치고,
프롬프트 파일을 다시 뽑아 python3 scripts/llm-record.py --slug contextual-targeting 으로 다시 기록한다.
사용자 메시지는 「제목: …」 줄과 「첫 문단: …」 줄 둘이다. 50개는 thinking 을 끄고 한 번씩 보내고,
앞 10개(헷갈리는 지면)는 thinking 을 켜고 한 번 더 보낸다. 표준 라이브러리만 쓴다.
"""
import json
import os
import random
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
PROMPTS = os.path.join(ROOT, 'data', 'llm-records', 'prompts', 'contextual-targeting.json')
POST = os.path.join(ROOT, 'posts', 'contextual-targeting.md')

# 생성기 시작
LABELS = ['automotive', 'business', 'education', 'family', 'food',
          'health', 'hobbies', 'sports', 'style', 'travel']
# 카테고리마다 명사 12개. 앞의 4개에는 그 카테고리의 사전 낱말이 들어 있고 뒤의 8개에는 없다.
NOUNS = {
    'automotive': ['자동차 보험', '차량 점검', '초보 운전', '주차 보조', '엔진 오일', '타이어 교체',
                   '블랙박스', '셀프 세차', '연비', '전기차 충전', '하이브리드 세단', '경차 유지비'],
    'business': ['경제 전망', '주식 시장', '1인 창업', '기준 금리', '연말정산', '환율',
                 '스타트업 투자', '부동산 시장', '분기 실적', '퇴직 연금', '물가', '법인 설립'],
    'education': ['코딩 교육', '수능 준비', '영어 학원', '온라인 강의', '토익 점수', '자격증 시험',
                  '대학 입시', '논술 첨삭', '내신 성적', '유학 준비', '교과서', '학점 관리'],
    'family': ['육아휴직', '아이 간식', '가족 모임', '부모 교육', '이유식', '어린이집',
               '돌잔치', '유모차', '키즈카페', '결혼 준비', '기저귀', '신혼집'],
    'food': ['집밥 요리', '동네 맛집', '김치찌개 레시피', '디저트 카페', '스페셜티 커피', '밀키트',
             '제철 과일', '수제 버거', '떡볶이', '브런치', '비빔밥', '크루아상'],
    'health': ['건강 검진', '병원 예약', '다이어트 식단', '허리 통증', '혈압 관리', '감기 예방',
               '비타민 D', '독감 접종', '면역력', '불면증', '스트레칭', '안구 건조'],
    'hobbies': ['주말 취미', '필름 사진', '가죽 공방', '악기 연습', '뜨개질', '프라모델',
                '바다 낚시', '화분 키우기', '캘리그라피', '보드게임', '레고', '드론 촬영'],
    'sports': ['러닝화', '하프 마라톤', '축구 중계', '프로 야구', '10km 완주', '골프 레슨',
               '테니스 라켓', '수영 대회', '인터벌 훈련', '스포츠 워치', '농구 결승', '클라이밍'],
    'style': ['가을 패션', '화장품 성분', '출근 코디', '스킨케어 루틴', '트렌치코트', '선크림',
              '립스틱', '청바지 핏', '헤어 스타일', '향수', '네일 아트', '가죽 가방'],
    'travel': ['제주 여행', '항공권 특가', '호텔 조식', '숙소 예약', '오사카 3박', '환전',
               '렌터카', '공항 라운지', '면세점', '여권 사진', '게스트하우스', '유심 칩'],
}
TITLES = ['{a}, 처음이라면 먼저 볼 것', '{a} 한 달 기록', '요즘 많이 묻는 {a} 이야기',
          '{a}, 이번 주에 달라진 것', '{a}, 많이 묻는 질문 다섯']
FIRSTS = ['지난주부터 {b}, {c} 정보를 모아 읽고 있다.', '{b}, {c} 이야기가 나오면 질문이 꼭 따라온다.',
          '주말마다 {b}, {c} 후기를 찾아본다.', '처음에는 {b} 하나만 보다가 {c} 쪽으로 범위를 넓혔다.',
          '회사 동료가 {b}, {c} 얘기를 꺼내서 비교해 봤다.']
SECONDS = ['오늘은 {d} 이야기까지 함께 정리한다.', '{d} 쪽도 짧게 적어 둔다.',
           '마지막에는 {d} 경험을 덧붙인다.', '읽은 사람이 많이 물은 {d} 내용도 넣었다.',
           '{d} 후기는 아래에 따로 모았다.']
# 헷갈리는 지면 10개. 카테고리마다 하나는 첫 문단의 명사 셋을 여기 적은 카테고리에서 가져온다.
MIXED = {'automotive': 'travel', 'business': 'food', 'education': 'business', 'family': 'travel',
         'food': 'health', 'health': 'sports', 'hobbies': 'style', 'sports': 'health',
         'style': 'sports', 'travel': 'sports'}


def make_pages():
    """지면 50개. 사람 라벨은 제목의 카테고리다. 앞 10개는 카테고리마다 하나씩 둔 헷갈리는 지면이다."""
    rng = random.Random(7 + 7)                 # 7 + 1 부터 7 + 6 은 트랙의 다른 글이 쓴다
    mixed, clear = [], []
    for label in LABELS:
        for k, a in enumerate(rng.sample(NOUNS[label], 5)):    # 지면 5개의 제목 명사는 서로 다르다
            other = MIXED[label] if k == 0 else None
            pool = NOUNS[other] if other else [n for n in NOUNS[label] if n != a]
            b, c, d = rng.sample(pool, 3)
            page = {'label': label, 'mixed': other,
                    'title': rng.choice(TITLES).format(a=a),
                    'text': rng.choice(FIRSTS).format(b=b, c=c) + ' ' + rng.choice(SECONDS).format(d=d)}
            (mixed if other else clear).append(page)
    rng.shuffle(mixed)
    rng.shuffle(clear)
    pages = mixed + clear
    for i, page in enumerate(pages, 1):
        page['id'] = 'p%03d' % i
    return pages
# 생성기 끝

# LLM 에 보내는 시스템 메시지. 모든 요청에 같이 간다. 카테고리 10개에 한 줄씩 풀이를 단다.
SYSTEM = ('너는 지면 분류기다. 사용자가 보낸 웹 지면의 제목과 첫 문단을 읽고 그 지면의 카테고리 하나를 고른다.\n'
          '제목과 첫 문단이 서로 다른 주제를 말하면 제목의 주제를 고른다.\n'
          '카테고리는 아래 10개 가운데 하나다.\n'
          'automotive: 자동차, 운전, 정비\n'
          'business: 경제, 금융, 창업, 회사\n'
          'education: 교육, 입시, 시험, 공부\n'
          'family: 가족, 육아, 결혼\n'
          'food: 음식, 요리, 맛집, 음료\n'
          'health: 건강, 병원, 질병, 다이어트\n'
          'hobbies: 취미, 공예, 수집, 악기\n'
          'sports: 스포츠 경기, 운동 종목, 대회\n'
          'style: 패션, 뷰티, 화장품\n'
          'travel: 여행, 숙소, 항공\n'
          '답은 {"label": "<카테고리>"} 꼴의 JSON 한 줄로만 쓴다. 설명이나 다른 글은 붙이지 않는다.')


def user_message(page):
    return '제목: %s\n첫 문단: %s' % (page['title'], page['text'])


def prompts_text():
    """프롬프트 파일 한 벌. 항목은 한 줄에 하나씩 둔다. thinking 을 켜고 한 번 더 보내는 것은 헷갈리는 지면이다."""
    pages = make_pages()
    head = {'system': SYSTEM, 'think': 'off', 'repeat': 1,
            'think_subset': {'ids': [p['id'] for p in pages if p['mixed']], 'think': 'on'},
            'options': {'temperature': 0, 'seed': 7}}
    lines = ['{' + ',\n '.join('%s: %s' % (json.dumps(k), json.dumps(v, ensure_ascii=False)) for k, v in head.items())
             + ',\n "items": [']
    items = [json.dumps({'id': p['id'], 'user': user_message(p)}, ensure_ascii=False) for p in pages]
    lines.append(',\n'.join('  ' + it for it in items))
    lines.append(' ]}')
    return '\n'.join(lines) + '\n'


def generator_source():
    """이 파일에서 「생성기 시작」 줄과 「생성기 끝」 줄 사이의 글."""
    with open(os.path.abspath(__file__), encoding='utf-8') as f:
        src = f.read()
    return src.split('# 생성기 시작\n', 1)[1].split('# 생성기 끝\n', 1)[0]


def check():
    problems = []
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
    if generator_source() not in post:
        problems.append('글의 파이썬 1 블록에 이 파일의 생성기가 글자까지 그대로 들어 있지 않습니다')
    for p in problems:
        print('✗ ' + p)
    if not problems:
        print('✓ 프롬프트 파일과 글의 생성기가 이 파일과 같습니다 (지면 %d개)' % len(make_pages()))
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
    for p in make_pages():
        print('%s  %-10s  %-10s  %s | %s' % (p['id'], p['label'], p['mixed'] or '-', p['title'], p['text']))
    return 0


if __name__ == '__main__':
    raise SystemExit(main())
