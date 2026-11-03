#!/usr/bin/env python3
"""관심사 분류 글(interest-classification)의 가상 글 200건을 만든다. 글의 파이썬 1 블록과 같은 생성기다.

  python3 scripts/gen-interest-articles.py            글 200건을 한 줄씩 찍는다 (id, 사람 라벨, 섞은 관심사, 제목 | 첫 문장)
  python3 scripts/gen-interest-articles.py --prompts  기록 도구의 프롬프트 파일을 찍는다. 아래처럼 받아 쓴다
      python3 scripts/gen-interest-articles.py --prompts > data/llm-records/prompts/interest-classification.json
  python3 scripts/gen-interest-articles.py --check    두 가지를 본다. 프롬프트 파일이 지금 생성기의 출력과 같은가,
                                                      글의 파이썬 1 블록에 아래 생성기가 글자까지 그대로 들어 있는가

생성기는 「생성기 시작」 줄과 「생성기 끝」 줄 사이다. 그 사이를 고치면 글의 파이썬 1 블록도 똑같이 고치고,
프롬프트 파일을 다시 뽑아 python3 scripts/llm-record.py --slug interest-classification 으로 다시 기록한다.
사용자 메시지는 「제목: …」 줄과 「첫 문장: …」 줄 둘이다. 반복 묶음은 평가용 40건(a001~a040)을 temperature 0.7 로
3번 더 보낸다. 표준 라이브러리만 쓴다.
"""
import json
import os
import random
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
PROMPTS = os.path.join(ROOT, 'data', 'llm-records', 'prompts', 'interest-classification.json')
POST = os.path.join(ROOT, 'posts', 'interest-classification.md')

# 생성기 시작
LABELS = ['running', 'camping', 'travel', 'cafe', 'parenting', 'finance', 'gaming', 'beauty']
# 관심사마다 명사 20개. 앞의 7개에는 규칙의 키워드가 들어 있고 뒤의 13개에는 없다.
NOUNS = {
    'running': ['러닝화', '하프 마라톤', '러닝 크루', '새벽 조깅', '트레일 러닝', '마라톤 접수', '러닝 양말',
                '10km 완주', '인터벌 훈련', '트레드밀', '페이스 조절', '무릎 보호대', '스포츠 워치',
                '풀코스 완주', '에너지 젤', '케이던스', '심박수 구간', '종아리 마사지', '한강 코스', '업힐 훈련'],
    'camping': ['캠핑장 예약', '텐트 설치', '오토캠핑', '글램핑', '캠핑 의자', '동계 캠핑', '텐트 팩',
                '차박', '화로대', '타프', '침낭', '랜턴', '백패킹', '코펠', '불멍', '야전 침대', '그늘막',
                '아이스박스', '버너', '장작'],
    'travel': ['기차 여행', '항공권 특가', '호텔 조식', '여행자 보험', '배낭 여행', '여행 일정', '호텔 라운지',
               '오사카 3박', '제주 일주', '환전', '공항 라운지', '게스트하우스', '렌터카', '패키지 투어',
               '현지 맛집', '유심 칩', '면세점', '시차 적응', '야간 버스', '항공 마일리지'],
    'cafe': ['동네 카페', '카페 투어', '스페셜티 커피', '디저트 맛집', '커피 원두', '디저트 카페', '카페 메뉴',
             '라떼 아트', '핸드드립', '원두 구독', '콜드브루', '에스프레소 머신', '베이커리', '시그니처 음료',
             '브런치', '드립 포트', '모카 포트', '바리스타 자격증', '티라미수', '크루아상'],
    'parenting': ['육아휴직', '아기 수면', '이유식', '공동 육아', '육아 일기', '아기 띠', '이유식 큐브',
                  '어린이집 적응', '기저귀', '유모차', '돌잔치', '소아과', '첫 걸음마', '키즈카페', '그림책',
                  '분유 포트', '수면 교육', '젖병 소독', '카시트', '놀이 매트'],
    'finance': ['적금 비교', '주식 계좌', 'ETF 적립', '재테크 습관', '주식 공부', '적금 금리', '재테크 책',
                '연금저축', '배당주', '청약 통장', '금리 인하', '가계부', 'ISA 계좌', '비상금', '신용 점수',
                '채권 투자', '절세 계좌', '월급 관리', '목돈 굴리기', '연말정산'],
    'gaming': ['콘솔 게임', '공략 영상', '리듬 게임', '게임 패스', '인디 게임', '휴대용 게임기', '공략 사이트',
               '모바일 RPG', 'e스포츠 결승', '레이드', 'PC방', '랭크전', '아이템 강화', '레벨 업',
               '스트리머 방송', '보스전', '가챠', '길드', 'FPS', '오픈 월드'],
    'beauty': ['기초 화장품', '스킨케어 루틴', '메이크업 브러시', '화장품 파우치', '화장품 성분', '스킨케어 순서',
               '메이크업 영상', '선크림', '쿠션 팩트', '향수', '네일 아트', '립스틱', '수분 크림',
               '클렌징 오일', '헤어 클리닉', '톤업 크림', '토너 패드', '선스틱', '각질 관리', '피부 타입'],
}
TITLES = ['{a} 처음이라면 먼저 볼 것', '요즘 빠진 {a} 이야기', '{a} 한 달 기록',
          '{a}, 많이 묻는 질문 다섯', '{a}, 이번 달에 알게 된 것']
FIRSTS = ['지난달부터 {b} 생각에 정보를 모으고 있다.', '{b} 이야기가 나와서 겪은 일을 적어 둔다.',
          '주말마다 {b} 후기를 찾아본다.', '처음에는 {b} 하나만 보다가 범위를 넓혔다.',
          '회사 동료가 {b} 얘기를 꺼내서 비교까지 해 봤다.']
# 헷갈리는 글 20건. 관심사마다 앞의 2~3건은 첫 문장의 명사를 여기 적은 관심사에서 가져온다.
MIXED = {'running': ['travel', 'beauty', 'cafe'], 'camping': ['travel', 'cafe', 'running'],
         'travel': ['camping', 'cafe', 'finance'], 'cafe': ['travel', 'parenting'],
         'parenting': ['travel', 'finance', 'gaming'], 'finance': ['gaming', 'parenting'],
         'gaming': ['finance', 'parenting'], 'beauty': ['travel', 'running']}


def make_articles(seed=7):
    """글 200건. 사람 라벨은 제목의 관심사다. 앞 40건은 관심사마다 5건씩 떼어 둔 평가용이다."""
    rng = random.Random(seed)
    evals, trains = [], []
    for label in LABELS:
        arts = []
        for k in range(25):
            a, b = rng.sample(NOUNS[label], 2)
            mixed = MIXED[label][k] if k < len(MIXED[label]) else None
            if mixed:
                b = rng.choice(NOUNS[mixed])
            arts.append({'label': label, 'mixed': mixed,
                         'title': rng.choice(TITLES).format(a=a),
                         'first': rng.choice(FIRSTS).format(b=b)})
        rng.shuffle(arts)
        evals += arts[:5]
        trains += arts[5:]
    rng.shuffle(evals)
    rng.shuffle(trains)
    articles = evals + trains
    for i, art in enumerate(articles, 1):
        art['id'] = 'a%03d' % i
    return articles
# 생성기 끝

# LLM 에 보내는 시스템 메시지. 모든 요청에 같이 간다.
SYSTEM = ('너는 글 분류기다. 사용자가 보낸 글의 제목과 첫 문장을 읽고 관심사 하나를 고른다.\n'
          '라벨은 running(러닝), camping(캠핑), travel(여행), cafe(카페), parenting(육아), finance(재테크), '
          'gaming(게임), beauty(뷰티) 가운데 하나다.\n'
          '답은 {"label": "<라벨>"} 꼴의 JSON 한 줄로만 쓴다. 설명이나 다른 글은 붙이지 않는다.')
EVAL_IDS = ['a%03d' % i for i in range(1, 41)]


def user_message(art):
    return '제목: %s\n첫 문장: %s' % (art['title'], art['first'])


def prompts_text():
    """프롬프트 파일 한 벌. 항목은 한 줄에 하나씩 둔다."""
    head = {'system': SYSTEM, 'think': 'off', 'repeat': 1,
            'repeat_subset': {'ids': EVAL_IDS, 'repeat': 3, 'options': {'temperature': 0.7}}}
    lines = ['{' + ',\n '.join('%s: %s' % (json.dumps(k), json.dumps(v, ensure_ascii=False)) for k, v in head.items())
             + ',\n "items": [']
    items = [json.dumps({'id': a['id'], 'user': user_message(a)}, ensure_ascii=False) for a in make_articles()]
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
        print('✓ 프롬프트 파일과 글의 생성기가 이 파일과 같습니다 (글 %d건)' % len(make_articles()))
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
    for a in make_articles():
        print('%s  %-9s  %-9s  %s | %s' % (a['id'], a['label'], a['mixed'] or '-', a['title'], a['first']))
    return 0


if __name__ == '__main__':
    raise SystemExit(main())
