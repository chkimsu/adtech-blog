#!/usr/bin/env python3
"""자연어 → 타겟 조건 글(nl-to-targeting-query)의 요청 30개와 시스템 메시지 셋. 글의 파이썬 1 블록과 프롬프트 파일 셋이 이 파일의 값을 그대로 가져간다.

  python3 scripts/gen-nl-requests.py                   요청 30개를 한 줄씩 찍는다 (id, 정답 판정, 정답 reason_code, 정답 조건, 요청)
  python3 scripts/gen-nl-requests.py --prompts <벌>    프롬프트 파일 한 벌을 찍는다. 벌은 oneshot, verdict, extract 셋이다. 아래처럼 받아 쓴다
      python3 scripts/gen-nl-requests.py --prompts oneshot > data/llm-records/prompts/nl-to-targeting-query-oneshot.json
  python3 scripts/gen-nl-requests.py --check           요청 30개의 꼴과 정답의 앞뒤를 본 뒤 아래 셋을 대조하고 몇 건 대조했는지 찍는다
                                                       1) oneshot 의 시스템 메시지가 자연어 오디언스 편의 프롬프트 파일
                                                          (data/llm-records/prompts/natural-language-audience.json)의 system 과 글자까지 같고,
                                                          앞 세 요청의 사용자 메시지가 그 파일의 items 와 같은가
                                                       2) 프롬프트 파일 셋이 지금 생성 결과와 같은가 (system, think, repeat, options, items 전부)
                                                       3) 글(posts/nl-to-targeting-query.md)의 파이썬 블록에 「REQUESTS = [」 줄부터 닫는 「]」 줄까지의
                                                          리터럴이 글자까지 그대로 들어 있는가
                                                       파일이 없으면 실패로 둔다

요청 하나는 (id, 요청, 정답 판정, 정답 reason_code, 정답 조건) 이고, 정답 조건은 (필드, 비교, 값) 묶음의 목록이다. 정답은 모두 가상 값이다.
supported 12개, partial 10개, unsupported 8개(sensitive_attribute 2개는 둘 다 건강, unknown_field 3개, exposure_history_unavailable 3개)다.
앞 세 요청은 자연어 오디언스 편의 요청 셋을 글자 그대로 쓴다. 필드 10개, 조건의 꼴, reason_code 넷의 줄은 그 편의 시스템 메시지 그대로다.
기록 셋은 서로 기대지 않는다. 셋 다 요청 30개를 모두 보내고, 워크플로 코드가 verdict 의 답으로 extract 의 답을 쓸지 고른다.
REQUESTS 리터럴이나 시스템 메시지를 고치면 글의 블록도 똑같이 고치고, 프롬프트 파일 셋을 다시 뽑아
python3 scripts/llm-record.py --slug nl-to-targeting-query-<벌> 로 다시 기록한다. 표준 라이브러리만 쓴다.
"""
import json
import os
import re
import sys
from collections import Counter

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
PROMPTS_DIR = os.path.join(ROOT, 'data', 'llm-records', 'prompts')
POST = os.path.join(ROOT, 'posts', 'nl-to-targeting-query.md')
SOURCE = os.path.join(PROMPTS_DIR, 'natural-language-audience.json')    # oneshot 이 그대로 가져오는 18주째 프롬프트
SLUG = 'nl-to-targeting-query'
KINDS = ('oneshot', 'verdict', 'extract')

# 요청 30개. 이 리터럴이 글의 파이썬 1 블록에 글자 그대로 들어간다.
REQUESTS = [
    ('n01', '러닝화 살 사람', 'supported', 'none', [('search_running_shoes', '>=', 1)]),
    ('n02', '최근 한 달 캠핑 용품 본 30대 중 우리 광고 안 본 사람', 'partial', 'exposure_history_unavailable', [('age', '>=', 30), ('age', '<=', 39), ('camping_search', '>=', 1)]),
    ('n03', '건강 상태로 골라 달라', 'unsupported', 'sensitive_attribute', []),
    ('n04', '부산에 사는 캠핑 글 독자', 'supported', 'none', [('region', '==', 'busan'), ('camping_posts', '>=', 1)]),
    ('n05', '반려견을 키우는 캠핑 글 독자', 'partial', 'unknown_field', [('camping_posts', '>=', 1)]),
    ('n06', '20대 중에 러닝 글을 5편 이상 읽은 사람', 'supported', 'none', [('age', '>=', 20), ('age', '<=', 29), ('running_posts', '>=', 5)]),
    ('n07', '골프 치는 사람', 'unsupported', 'unknown_field', []),
    ('n08', '서울 사는 러닝 글 독자 중 우리 광고를 아직 못 본 사람', 'partial', 'exposure_history_unavailable', [('region', '==', 'seoul'), ('running_posts', '>=', 1)]),
    ('n09', '운동 앱을 10일 이상 켠 40세 이상', 'supported', 'none', [('sports_app_days', '>=', 10), ('age', '>=', 40)]),
    ('n10', '여행 좋아하는 30대', 'supported', 'none', [('travel_posts', '>=', 1), ('age', '>=', 30), ('age', '<=', 39)]),
    ('n11', '우리 광고를 본 적 있는 사람', 'unsupported', 'exposure_history_unavailable', []),
    ('n12', '태블릿으로 접속하는 여행 글 독자', 'partial', 'unknown_field', [('travel_posts', '>=', 1)]),
    ('n13', '서울에 사는 카페 글 독자', 'supported', 'none', [('region', '==', 'seoul'), ('cafe_posts', '>=', 1)]),
    ('n14', '우리 광고를 이미 본 20대 여행 글 독자', 'partial', 'exposure_history_unavailable', [('age', '>=', 20), ('age', '<=', 29), ('travel_posts', '>=', 1)]),
    ('n15', '캠핑 용품을 3번 이상 검색한 사람', 'supported', 'none', [('camping_search', '>=', 3)]),
    ('n16', '무릎 통증이 있는 러닝 글 독자', 'unsupported', 'sensitive_attribute', []),
    ('n17', '마라톤 대회에 나간 적 있는 러닝화 검색자', 'partial', 'unknown_field', [('search_running_shoes', '>=', 1)]),
    ('n18', '운동 용품을 산 적 있는 경기도 회원', 'supported', 'none', [('sports_goods_buy', '>=', 1), ('region', '==', 'gyeonggi')]),
    ('n19', '전기차를 타는 사람', 'unsupported', 'unknown_field', []),
    ('n20', '우리 광고를 세 번 넘게 본 러닝화 검색자', 'partial', 'exposure_history_unavailable', [('search_running_shoes', '>=', 1)]),
    ('n21', '러닝화를 검색하고 러닝 글도 읽은 사람', 'supported', 'none', [('search_running_shoes', '>=', 1), ('running_posts', '>=', 1)]),
    ('n22', '자동차가 있는 40대 여행 글 독자', 'partial', 'unknown_field', [('age', '>=', 40), ('age', '<=', 49), ('travel_posts', '>=', 1)]),
    ('n23', '50대 여행 글 독자', 'supported', 'none', [('age', '>=', 50), ('age', '<=', 59), ('travel_posts', '>=', 1)]),
    ('n24', '지난달 우리 광고를 다섯 번 넘게 본 사람', 'unsupported', 'exposure_history_unavailable', []),
    ('n25', '등산 글도 읽는 대구의 캠핑 글 독자', 'partial', 'unknown_field', [('region', '==', 'daegu'), ('camping_posts', '>=', 1)]),
    ('n26', '카페 글을 3편 이상 읽은 인천 사람', 'supported', 'none', [('cafe_posts', '>=', 3), ('region', '==', 'incheon')]),
    ('n27', '낚시를 좋아하는 사람', 'unsupported', 'unknown_field', []),
    ('n28', '지난주에 우리 광고를 본 카페 글 독자', 'partial', 'exposure_history_unavailable', [('cafe_posts', '>=', 1)]),
    ('n29', '25세 이하 운동 앱 사용자', 'supported', 'none', [('age', '<=', 25), ('sports_app_days', '>=', 1)]),
    ('n30', '우리 광고를 한 번도 안 본 사람', 'unsupported', 'exposure_history_unavailable', [])
]

# 시스템 메시지를 이루는 줄. 필드 10개, 조건의 꼴, reason_code 넷은 자연어 오디언스 편의 문장 그대로다.
FIELD_LINES = [
    '쓸 수 있는 필드는 아래 10개뿐이다. 앞의 8개는 모두 최근 30일 동안 센 횟수다.',
    'search_running_shoes: 검색어 「러닝화」를 검색한 횟수',
    'sports_app_days: 운동 앱을 켠 날의 수',
    'running_posts: 러닝 글을 읽은 수',
    'sports_goods_buy: 운동 용품을 산 횟수',
    'travel_posts: 여행 글을 읽은 수',
    'cafe_posts: 카페 글을 읽은 수',
    'camping_posts: 캠핑 글을 읽은 수',
    'camping_search: 캠핑 용품을 검색한 횟수',
    'age: 나이, 정수',
    'region: 사는 지역. seoul, gyeonggi, incheon, busan, daegu, gwangju, daejeon, ulsan, other 가운데 하나',
]
CONDITION_LINES = [
    '조건 하나는 {"field": 필드 이름, "op": ">=" 또는 "<=" 또는 "==", "value": 값} 꼴이다. value 는 숫자이고, region 일 때만 위의 지역 이름 하나다. 조건이 여럿이면 모두 맞는 회원을 고른다.',
    '나이대는 age 조건 둘로 옮긴다. 20대는 age >= 20 과 age <= 29 이다.',
    '구매 의향이나 관심처럼 마음을 말하는 표현은 그 마음이 드러나는 행동 필드의 조건으로 옮긴다.',
]
REASON_LINES = [
    'reason_code 는 넷 가운데 하나다.',
    'none: 옮기지 못한 부분이 없다.',
    'sensitive_attribute: 건강, 질병, 종교, 정치 성향, 성적 지향처럼 민감한 정보로 사람을 고르는 요청이다. 판정은 unsupported 이고, 비슷한 행동 필드로 바꿔 옮기지도 않는다.',
    'unknown_field: 위 10개 필드에 없는 정보가 필요하다.',
    'exposure_history_unavailable: 광고를 본 적이 있는지 같은 광고 노출 이력이 필요하다. 노출 이력은 필드에 없다.',
]

# oneshot: 판정과 조건을 한 번에 받는다. 자연어 오디언스 편의 시스템 메시지와 글자까지 같다.
SYSTEM_ONESHOT = '\n'.join(
    ['너는 광고 오디언스 조건 변환기다. 광고주가 쓴 요청 한 문장을 읽고, 회원을 고를 조건과 판정을 JSON 으로 돌려준다.']
    + FIELD_LINES + CONDITION_LINES
    + ['verdict 는 셋 가운데 하나다.',
       'supported: 요청 전부를 위 필드의 조건으로 옮길 수 있다.',
       'partial: 요청의 일부만 옮길 수 있다. 옮길 수 있는 부분만 conditions 에 넣는다.',
       'unsupported: 요청을 조건으로 옮길 수 없거나 옮기면 안 된다. conditions 는 빈 목록이다.',
       '지원하지 않는 조건은 conditions 에 넣지 말고 unsupported_parts 에 영어 짧은 구로 적는다. 옮기지 못한 부분이 없으면 빈 목록이다.']
    + REASON_LINES
    + ['답은 아래 꼴의 JSON 한 줄로만 쓴다. 설명이나 다른 글은 붙이지 않는다.',
       '{"verdict": "<판정>", "conditions": [{"field": "<필드>", "op": "<비교>", "value": <값>}], "unsupported_parts": ["<영어 짧은 구>"], "reason_code": "<이유>"}'])

# verdict: 판정만 받는다. 조건을 판단하려면 필드와 조건의 꼴을 알아야 해서 그 줄은 남기고, 답에서 조건을 뺀다.
SYSTEM_VERDICT = '\n'.join(
    ['너는 광고 오디언스 요청 판정기다. 광고주가 쓴 요청 한 문장을 읽고, 그 요청을 회원을 고를 조건으로 옮길 수 있는지 판정을 JSON 으로 돌려준다.']
    + FIELD_LINES + CONDITION_LINES
    + ['verdict 는 셋 가운데 하나다.',
       'supported: 요청 전부를 위 필드의 조건으로 옮길 수 있다.',
       'partial: 요청의 일부만 옮길 수 있다.',
       'unsupported: 요청을 조건으로 옮길 수 없거나 옮기면 안 된다.']
    + REASON_LINES
    + ['답은 아래 꼴의 JSON 한 줄로만 쓴다. 조건은 쓰지 않는다. 설명이나 다른 글은 붙이지 않는다.',
       '{"verdict": "<판정>", "reason_code": "<이유>"}'])

# extract: 조건만 받는다. 판정과 reason_code 는 묻지 않는다. 받을지 말지는 verdict 단계가 정한다.
SYSTEM_EXTRACT = '\n'.join(
    ['너는 광고 오디언스 조건 추출기다. 광고주가 쓴 요청 한 문장을 읽고, 회원을 고를 조건을 JSON 으로 돌려준다.']
    + FIELD_LINES + CONDITION_LINES
    + ['위 필드로 옮길 수 없는 부분은 conditions 에 넣지 말고 unsupported_parts 에 영어 짧은 구로 적는다. 옮기지 못한 부분이 없으면 빈 목록이다.',
       '답은 아래 꼴의 JSON 한 줄로만 쓴다. 판정은 쓰지 않는다. 설명이나 다른 글은 붙이지 않는다.',
       '{"conditions": [{"field": "<필드>", "op": "<비교>", "value": <값>}], "unsupported_parts": ["<영어 짧은 구>"]}'])

SYSTEMS = {'oneshot': SYSTEM_ONESHOT, 'verdict': SYSTEM_VERDICT, 'extract': SYSTEM_EXTRACT}

# ---------- 여기부터는 대조와 출력이다. 글에는 옮기지 않는다. ----------

FIELDS = ['search_running_shoes', 'sports_app_days', 'running_posts', 'sports_goods_buy',
          'travel_posts', 'cafe_posts', 'camping_posts', 'camping_search', 'age', 'region']
REGIONS = ['seoul', 'gyeonggi', 'incheon', 'busan', 'daegu', 'gwangju', 'daejeon', 'ulsan', 'other']
OPS = ('>=', '<=', '==')
VERDICTS = ('supported', 'partial', 'unsupported')
REASONS = ('none', 'sensitive_attribute', 'unknown_field', 'exposure_history_unavailable')
WANT_VERDICTS = {'supported': 12, 'partial': 10, 'unsupported': 8}
WANT_UNSUPPORTED = {'sensitive_attribute': 2, 'unknown_field': 3, 'exposure_history_unavailable': 3}
SENTENCE_MAX = 80


def user_message(text):
    """사용자 메시지. 자연어 오디언스 편처럼 「요청: 」 뒤에 광고주의 문장을 붙인다."""
    return '요청: ' + text


def spec(kind):
    """프롬프트 파일 한 벌. 셋 다 thinking 끔, temperature 0(seed 는 기록 도구의 기본값 7), 요청 30개를 한 번씩 보낸다."""
    return {'system': SYSTEMS[kind], 'think': 'off', 'repeat': 1, 'options': {'temperature': 0},
            'items': [{'id': rid, 'user': user_message(text)} for rid, text, verdict, reason, conds in REQUESTS]}


def prompt_text(s):
    """프롬프트 파일의 글. 맨 위 필드는 한 줄에 하나, 항목도 한 줄에 하나씩 둔다."""
    head = {k: v for k, v in s.items() if k != 'items'}
    lines = ['{' + ',\n '.join('%s: %s' % (json.dumps(k), json.dumps(v, ensure_ascii=False)) for k, v in head.items())
             + ',\n "items": [']
    lines.append(',\n'.join('  ' + json.dumps(it, ensure_ascii=False) for it in s['items']))
    lines.append(' ]}')
    return '\n'.join(lines) + '\n'


def condition_errors(rid, conds):
    out = []
    if not isinstance(conds, list):
        return ['%s: 정답 조건이 목록이 아닙니다' % rid]
    for c in conds:
        if not (isinstance(c, tuple) and len(c) == 3):
            out.append('%s: 조건 %r 이 (필드, 비교, 값) 묶음이 아닙니다' % (rid, c))
            continue
        field, op, value = c
        if field not in FIELDS or op not in OPS:
            out.append('%s: 조건 %r 의 필드나 비교가 목록에 없습니다' % (rid, c))
        elif field == 'region' and not (op == '==' and value in REGIONS):
            out.append('%s: region 조건 %r 은 == 와 지역 이름 하나여야 합니다' % (rid, c))
        elif field != 'region' and type(value) is not int:
            out.append('%s: 조건 %r 의 값이 정수가 아닙니다' % (rid, c))
    if len(set(conds)) != len(conds):
        out.append('%s: 같은 조건이 둘 이상 있습니다' % rid)
    return out


def request_errors():
    """REQUESTS 의 꼴과 정답의 앞뒤를 본다. 틀린 곳을 적은 문장 목록을 돌려주고, 맞으면 빈 목록이다."""
    out = []
    if [r[0] for r in REQUESTS] != ['n%02d' % i for i in range(1, 31)]:
        out.append('요청 id 가 n01 부터 n30 까지 차례대로가 아닙니다')
    for r in REQUESTS:
        if not (isinstance(r, tuple) and len(r) == 5):
            out.append('%r: (id, 요청, 판정, reason_code, 조건) 꼴이 아닙니다' % (r,))
            continue
        rid, text, verdict, reason, conds = r
        if not (isinstance(text, str) and text) or re.search(r'·', text) or len(text) > SENTENCE_MAX:
            out.append('%s: 요청 글이 비었거나 가운뎃점이 있거나 %d자를 넘습니다' % (rid, SENTENCE_MAX))
        if verdict not in VERDICTS or reason not in REASONS:
            out.append('%s: 판정 %r 이나 reason_code %r 이 enum 밖입니다' % (rid, verdict, reason))
            continue
        out += condition_errors(rid, conds)
        if verdict == 'supported' and not (reason == 'none' and conds):
            out.append('%s: supported 는 reason_code none 과 조건 하나 이상입니다' % rid)
        if verdict == 'partial' and not (reason in ('unknown_field', 'exposure_history_unavailable') and conds):
            out.append('%s: partial 은 unknown_field 나 exposure_history_unavailable 과 조건 하나 이상입니다' % rid)
        if verdict == 'unsupported' and not (reason != 'none' and not conds):
            out.append('%s: unsupported 는 none 이 아닌 reason_code 와 빈 조건입니다' % rid)
    if out:
        return out
    if len({r[1] for r in REQUESTS}) != len(REQUESTS):
        out.append('같은 요청 글이 둘 이상 있습니다')
    verdicts = Counter(r[2] for r in REQUESTS)
    if dict(verdicts) != WANT_VERDICTS:
        out.append('판정별 요청 수가 %s 입니다. %s 여야 합니다' % (dict(verdicts), WANT_VERDICTS))
    unsupported = Counter(r[3] for r in REQUESTS if r[2] == 'unsupported')
    if dict(unsupported) != WANT_UNSUPPORTED:
        out.append('unsupported 의 reason_code 별 수가 %s 입니다. %s 여야 합니다' % (dict(unsupported), WANT_UNSUPPORTED))
    return out


def literal_source():
    """이 파일에서 「REQUESTS = [」 줄부터 닫는 「]」 줄까지의 글. 글의 파이썬 블록에 이 글이 그대로 들어 있어야 한다."""
    with open(os.path.abspath(__file__), encoding='utf-8') as f:
        src = f.read()
    found = re.search(r'^REQUESTS = \[\n.*?^\]$', src, re.M | re.S)
    if not found:
        raise SystemExit('✗ 이 파일에서 「REQUESTS = [」 줄부터 닫는 「]」 줄까지의 리터럴을 찾지 못했습니다')
    return found.group(0)


def rel(path):
    return os.path.relpath(path, ROOT)


def read_json(path, errors):
    try:
        with open(path, encoding='utf-8') as f:
            return json.load(f)
    except FileNotFoundError:
        errors.append('%s 가 없습니다' % rel(path))
    except ValueError as e:
        errors.append('%s 를 JSON 으로 읽지 못했습니다 (%s)' % (rel(path), e))
    return None


def check():
    errors = request_errors()
    done = Counter()
    # 1) 자연어 오디언스 편의 프롬프트와 같은가
    source = read_json(SOURCE, errors)
    if isinstance(source, dict):
        done['18주째 프롬프트'] += 1
        if source.get('system') != SYSTEM_ONESHOT:
            errors.append('oneshot 의 시스템 메시지가 %s 의 system 과 글자까지 같지 않습니다' % rel(SOURCE))
        want = [it.get('user') for it in source.get('items', [])[:3]]
        if want != [user_message(r[1]) for r in REQUESTS[:3]]:
            errors.append('앞 세 요청의 사용자 메시지가 %s 의 items 와 같지 않습니다' % rel(SOURCE))
    # 2) 프롬프트 파일 셋
    for kind in KINDS:
        path = os.path.join(PROMPTS_DIR, '%s-%s.json' % (SLUG, kind))
        on_disk = read_json(path, errors)
        if on_disk is None:
            continue
        done['프롬프트 파일'] += 1
        if on_disk != json.loads(prompt_text(spec(kind))):
            errors.append('%s 가 지금 생성 결과와 다릅니다. --prompts %s 로 다시 뽑고 다시 기록합니다' % (rel(path), kind))
    # 3) 글의 REQUESTS 리터럴
    try:
        with open(POST, encoding='utf-8') as f:
            post = f.read()
    except FileNotFoundError:
        errors.append('%s 가 없습니다' % rel(POST))
    else:
        done['글'] += 1
        literal = literal_source()
        found = re.findall(r'^REQUESTS = \[\n.*?^\]$', post, re.M | re.S)
        if not found or any(f != literal for f in found):
            errors.append('%s: 파이썬 블록에 이 파일의 REQUESTS 리터럴이 글자까지 그대로 들어 있지 않습니다' % rel(POST))
    for e in errors:
        print('✗ ' + e)
    if errors:
        return 1
    verdicts = Counter(r[2] for r in REQUESTS)
    print('✓ 요청 %d개(supported %d, partial %d, unsupported %d)의 정답이 앞뒤가 맞고, 대조 %d건(18주째 프롬프트 %d, 프롬프트 파일 %d, 글 %d)이 '
          '이 파일과 같습니다' % (len(REQUESTS), verdicts['supported'], verdicts['partial'], verdicts['unsupported'],
                           sum(done.values()), done['18주째 프롬프트'], done['프롬프트 파일'], done['글']))
    return 0


def main():
    args = sys.argv[1:]
    if len(args) == 2 and args[0] == '--prompts':
        if args[1] not in KINDS:
            print('✗ 벌은 %s 가운데 하나입니다' % ', '.join(KINDS))
            return 2
        sys.stdout.write(prompt_text(spec(args[1])))
        return 0
    if args == ['--check']:
        return check()
    if args:
        print(__doc__)
        return 2
    for rid, text, verdict, reason, conds in REQUESTS:
        shown = ', '.join('%s %s %s' % c for c in conds) or '없음'
        print('%s  %-11s  %-28s  [%s]  %s' % (rid, verdict, reason, shown, text))
    return 0


if __name__ == '__main__':
    raise SystemExit(main())
