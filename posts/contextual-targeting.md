모델 팀 17주째 월요일, 지훈 씨는 비로그인 C 의 광고 요청 한 줄을 열었습니다. 회원 번호 칸은 비었고 C 가 읽던 지면(광고가 실리는 페이지)의 주소만 있었습니다. 그 지면 「10km 완주, 처음이라면 먼저 볼 것」에 나간 광고는 카페였습니다.

서연 씨의 러닝화 광고는 번호 6001 이 붙은 회원에게만 나가서 C 에게는 후보조차 아니었습니다. 선배는 사람 대신 글을 보라며 방법 셋을 비교해 보자고 했습니다. 낱말 사전, 낱말을 세어 숫자로 비교하는 방법, 글을 읽고 답을 써 주는 언어 모델입니다.

**번호가 없는 사람에게 지금 읽는 지면의 글만으로 광고를 고를 수 있을까요?**

지면의 글로 광고를 고르는 방식을 컨텍스추얼 타겟팅(contextual targeting)이라고 부릅니다. 셋째의 언어 모델은 LLM 이라고 부릅니다. 글의 주제를 잘못 읽으면 러닝 지면에 여행 광고가 나가거나 러닝화 광고가 갈 자리를 놓칩니다. 번호가 없는 요청에서는 그 판단이 광고비가 갈 곳을 정합니다.

> **한 줄 요약:** 회원 번호가 없는 비로그인 C 에게 광고를 고를 근거는 지금 읽는 지면의 글뿐입니다. 가상 지면 50개에 카테고리(지면의 주제 이름)를 붙여 봅니다. 카테고리마다 낱말 4개를 적은 사전은 33개를 맞히고, 사전의 낱말이 없는 10개를 비워 둡니다. 낱말마다 드문 정도를 곱해 센 숫자 목록으로 카테고리 평균과 비교하는 TF-IDF 는 빈칸 없이 34개를 맞힙니다. 다만 여러 지면에 되풀이되는 틀의 낱말에 끌려 틀리기도 합니다. 두 방법에는 제목을 따르는 기준이 없습니다. 그래서 제목과 첫 문단이 다른 이야기인 지면 10개에서 제목의 카테고리를 붙인 것은 사전 3개, TF-IDF 0개입니다. LLM 은 43개를 맞히는데, 할 일을 적은 글에 「제목을 따른다」고 적었는데도 그런 지면 10개 중 6개는 첫 문단을 따랐습니다. 답 앞에 풀이를 길게 쓰게 하는 thinking 을 켜면 10개 모두 제목을 따릅니다. 대신 모델이 써 낸 글 조각(토큰)이 풀이까지 106배, 시간이 46배로 늘어납니다.

> **골라 읽는 법** — 절이 7개인 글이고, 절마다 표나 코드나 카드가 들어 있어 그것만 보고 넘어가도 됩니다.
>
> - 번호가 없는 요청에 남는 것 → 1절
> - 지면 50개와 카테고리 10개, 사람이 붙인 카테고리의 기준 → 2절
> - 낱말 사전으로 붙이기 → 3절
> - 낱말을 세어 카테고리 평균과 비교하기 → 4절
> - 기록한 LLM 의 답과, 풀이를 길게 쓰게 했을 때의 값 → 5절
> - 세 방법 비교와 비로그인 C 에게 나가는 광고 → 6절
> - 담장 안과 열린 RTB 에서 달라지는 것 → 7절

이 글의 지면 50개, 낱말 사전, 광고를 붙이는 카테고리 규칙은 전부 설명을 위해 만든 가상 데이터입니다. LLM 의 답만은 지어낸 값이 아닙니다. 2026-11-04 에 이 블로그를 쓰는 맥에서 Ollama 로 qwen3.5:27b 를 띄워 한 번에 기록했습니다. 글은 그 기록을 그대로 다시 씁니다. Ollama 는 공개된 모델을 개인 컴퓨터에서 돌리는 도구입니다. 기록 파일은 `data/llm-records/contextual-targeting.json` 입니다. 회원 A, 비로그인 C, 광고 셋은 [후보풀 여덟 질문](post.html?id=candidate-pool-questions) 편 그대로입니다. 카드 속 회색은 낱말 사전과 틀의 낱말, 파랑은 4절의 방법과 지면의 명사입니다. 먹색은 지면 하나, 벽돌색은 LLM 이고, 점선 상자는 사람이 미리 적어 둔 글입니다.

---

## 1. 비로그인 C 에게는 번호가 없고 지면 글만 있습니다

**로그인한 회원 A 의 광고 요청에는 회원 번호와 거기 붙은 번호 넷이 담기고, 비로그인 C 의 요청에는 지면 주소만 담깁니다. 그래서 C 에게 광고를 고를 근거는 그 주소에 있는 글뿐이고, 글에 주제 이름을 붙이는 일이 첫 단계입니다.**

광고 요청은 화면에 광고 자리가 하나 빌 때마다 광고 서버로 오는 요청 한 건입니다. 거기에는 누가 보고 있는지와 어디서 보고 있는지가 같이 담깁니다. 회원 A 는 로그인했으니 회원 번호가 담기고, 광고 서버는 그 번호로 A 에게 붙은 세그먼트를 찾습니다. 세그먼트는 조건이 같은 회원 무리에 붙인 번호이고, A 에게는 러닝 317, 여행 402, 카페 905, 유사타겟 6001 이 붙어 있습니다.

비로그인 C 는 로그인하지 않아 쿠키만 있고 붙은 번호가 없습니다. 쿠키는 브라우저에 남겨 두는 작은 식별 값인데, 회원 번호와 이어지지 않아 세그먼트를 찾을 수 없습니다. 13주째에 30일 행동을 숫자 8개로 줄여 둔 벡터도 C 에게는 없습니다. [유저 프로파일 피처](post.html?id=user-profile-features) 편이 「C 에게는 요청 안의 정보로 광고를 고른다」며 미뤄 둔 자리가 여기입니다.

[후보풀 여덟 질문](post.html?id=candidate-pool-questions) 편에서 C 가 꺼낸 후보는 카페 하나였습니다. 러닝화는 6001, 여행사는 402 가 붙은 사람에게만 나가고, 카페만 조건이 없었기 때문입니다. C 가 러닝 지면을 읽든 여행 지면을 읽든 후보는 같은 카페 광고였습니다.

번호 대신 쓸 수 있는 것이 지면입니다. 지면은 광고가 실리는 웹 페이지나 앱 화면이고, 요청에는 그 주소가 담깁니다. 주소의 글을 읽어 주제 이름을 붙여 두면, 사람이 아니라 자리를 보고 광고를 고를 수 있습니다. 이 주제 이름을 카테고리라고 부르고, 지면 하나에 붙은 카테고리 이름 하나를 그 지면의 라벨이라고 부릅니다. 컨텍스추얼의 컨텍스트는 이렇게 광고 둘레에 있는 내용입니다.

아래 표는 두 요청에 담긴 것을 나란히 둔 것입니다. 다른 칸은 사람에 대한 줄에 몰려 있고, C 에게 남는 것은 지면 한 줄입니다.

| 요청에 담긴 것 | 회원 A | 비로그인 C |
|---|---|---|
| 회원 번호 | 있음, 로그인 | 없음, 쿠키만 |
| 세그먼트 | 317, 402, 905, 6001 | 없음 |
| 30일 행동 벡터 (13주째) | 8차원 | 없음 |
| 지면 주소와 글 | 있음 | 있음 |
| 꺼낸 후보 (후보풀 여덟 질문 편) | 러닝화, 여행사, 카페 | 카페 하나 |

## 2. 지면 50개와 카테고리 10개: 사람 라벨은 제목의 카테고리입니다

**지면 하나는 제목 한 줄과 첫 문단 두 문장이고, 카테고리 10개에 5개씩 50개를 만들었습니다. 사람이 붙인 라벨은 제목의 카테고리이고, 앞 10개는 첫 문단이 다른 카테고리의 이야기인 헷갈리는 지면입니다.**

C 가 읽던 지면은 p014 입니다. 제목은 「10km 완주, 처음이라면 먼저 볼 것」이고, 첫 문단은 스포츠 워치와 농구 결승, 인터벌 훈련 이야기입니다. 사람이 붙인 라벨은 sports 입니다. 라벨은 정해 둔 영어 소문자 10개 가운데 하나로 두었는데, 14주째처럼 코드와 LLM 의 답에서 같은 이름을 쓰기 위해서입니다.

카테고리 10개는 IAB Content Taxonomy 의 상위 범주를 줄인 것입니다. IAB Tech Lab 은 광고 업계의 표준을 만드는 단체이고, Content Taxonomy 는 지면의 주제를 적을 때 쓰는 표준 목록입니다. 3.1 버전의 맨 위 단계에는 범주가 37개 있고, 이 글은 그 가운데 10개를 골라 이름을 짧게 줄였습니다. health 만은 Healthy Living 과 Medical Health 두 범주를 하나로 합쳤습니다.

지면은 생성기가 만듭니다. 제목 틀 5개와 첫 문단 두 문장의 틀 5개씩을 두고, 카테고리마다 명사 12개를 적었습니다. 지면마다 제목에 명사 하나, 첫 문단에 명사 셋을 넣고, 한 카테고리 지면 5개의 제목 명사는 서로 다릅니다. 명사 12개 가운데 4개에만 그 카테고리의 사전 낱말이 들어 있고, 아래 표의 명사 넷 가운데 앞의 둘이 그런 명사입니다. 사전은 3절에 있습니다.

앞 10개는 일부러 헷갈리게 만들었습니다. 제목의 명사는 그 카테고리에서, 첫 문단의 명사 셋은 다른 카테고리에서 가져왔습니다. p008 은 제목이 「여권 사진, 처음이라면 먼저 볼 것」인데 첫 문단은 수영 대회와 10km 완주, 인터벌 훈련 이야기입니다. 이런 지면은 제목이 주제라고 보고 사람 라벨을 travel 로 붙였습니다.

제목을 따른다는 이 기준은 사람이 정한 것입니다. 3절과 4절의 두 방법은 이 기준을 모르고, 5절의 LLM 에는 할 일을 적은 글인 프롬프트(prompt)에 적어서 알려 줍니다. LLM 은 프롬프트를 토큰이라는 글 조각으로 나눠 읽고, 답도 토큰을 하나씩 이어 씁니다. 세 방법의 차이는 헷갈리는 10개에서 가장 잘 보입니다.

| 라벨 | 뜻 | IAB 3.1 의 상위 범주 (ID) | 명사 12개 가운데 넷 | 헷갈리는 지면의 첫 문단 |
|---|---|---|---|---|
| automotive | 자동차 | Automotive (1) | 자동차 보험, 차량 점검, 엔진 오일, 블랙박스 | travel |
| business | 경제, 금융 | Business and Finance (52) | 경제 전망, 주식 시장, 환율, 분기 실적 | food |
| education | 교육 | Education (132) | 코딩 교육, 수능 준비, 토익 점수, 대학 입시 | business |
| family | 가족, 육아 | Family and Relationships (186) | 육아휴직, 부모 교육, 이유식, 키즈카페 | travel |
| food | 음식, 음료 | Food & Drink (210) | 동네 맛집, 디저트 카페, 떡볶이, 브런치 | health |
| health | 건강 | Healthy Living (223), Medical Health (286) | 건강 검진, 허리 통증, 감기 예방, 면역력 | sports |
| hobbies | 취미 | Hobbies & Interests (239) | 필름 사진, 가죽 공방, 뜨개질, 레고 | style |
| sports | 스포츠 | Sports (483) | 러닝화, 하프 마라톤, 10km 완주, 인터벌 훈련 | health |
| style | 패션, 뷰티 | Style & Fashion (552) | 가을 패션, 화장품 성분, 선크림, 향수 | sports |
| travel | 여행 | Travel (653) | 제주 여행, 항공권 특가, 오사카 3박, 여권 사진 | sports |

<div class="demo-embed-wrap">
<iframe class="demo-embed" src="demo-contextual-cards.html?embed=1&card=page" height="480" loading="lazy" title="지면 글 한 편이 낱말 23개로 잘리는 자리"></iframe>
<a class="demo-embed-open" href="demo-contextual-cards.html" target="_blank" rel="noopener">↗ 카드 네 장 전체로 열기</a>
</div>

## 3. 키워드 사전: 낱말이 보이면 붙이고, 없으면 비워 둡니다

**카테고리마다 낱말 4개를 적은 사전을 위에서부터 살펴보고 처음 맞는 카테고리를 붙입니다. 그러면 50개 중 33개를 맞히고 7개를 틀리고 10개를 비워 둡니다. 비워 둔 10개에는 C 가 읽던 러닝 지면 p014 도 들어 있습니다.**

키워드 사전은 카테고리마다 사람이 적어 둔 낱말 목록입니다. sports 는 「러닝」, 「마라톤」, 「축구」, 「야구」 넷이고, 10개 카테고리를 합하면 낱말 40개입니다. 지면의 제목이나 첫 문단에 그 낱말이 들어 있으면 그 카테고리를 붙입니다. automotive 부터 travel 까지 위에서부터 살펴보다가 처음 맞는 카테고리에서 멈추고, 하나도 안 맞으면 라벨을 비워 둡니다.

아래 코드의 1단계가 2절의 생성기이고, 2단계가 사전, 3단계가 헷갈리는 지면과 틀린 까닭을 셉니다. 생성기는 `scripts/gen-context-pages.py` 와 글자까지 같은 코드입니다. 그래서 5절에서 LLM 에 보낸 50개도 이 코드가 만든 그대로입니다.

```python
# 하는 일: 가상 지면 50개를 만들고, 카테고리마다 낱말 4개를 적은 사전으로 라벨을 붙여 사람 라벨과 비교한다.
import random
from collections import Counter

# 1단계: 지면 50개를 만든다
# 제목 틀 5개, 첫 문단의 두 문장 틀 5개씩, 카테고리마다 명사 12개로 만든다. scripts/gen-context-pages.py 의 생성기와 같은 코드다.
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


pages = make_pages()
mixed = [p for p in pages if p['mixed']]
print(f'지면 {len(pages)}개: 카테고리 {len(LABELS)}개 × 5개, 그중 헷갈리는 지면 {len(mixed)}개({mixed[0]["id"]}~{mixed[-1]["id"]})')
for p in (pages[36], pages[7]):                # p037, p008
    note = f' (첫 문단의 명사는 {p["mixed"]})' if p['mixed'] else ''
    print(f'{p["id"]} 사람 라벨 {p["label"]}{note}: {p["title"]} / {p["text"]}')

# 2단계: 키워드 사전으로 라벨을 붙인다
# 카테고리마다 사람이 적어 둔 낱말 4개다. LABELS 의 차례로 순회해 처음 맞는 카테고리를 붙이고, 하나도 안 맞으면 None 이다.
KEYWORDS = {
    'automotive': ['자동차', '차량', '운전', '주차'], 'business': ['경제', '주식', '창업', '금리'],
    'education': ['교육', '수능', '학원', '강의'], 'family': ['육아', '아이', '가족', '부모'],
    'food': ['요리', '맛집', '레시피', '카페'], 'health': ['건강', '병원', '다이어트', '통증'],
    'hobbies': ['취미', '사진', '공방', '악기'], 'sports': ['러닝', '마라톤', '축구', '야구'],
    'style': ['패션', '화장품', '코디', '스킨케어'], 'travel': ['여행', '항공권', '호텔', '숙소'],
}


def keyword_label(page):
    text = page['title'] + ' ' + page['text']
    for label in LABELS:                       # 사전의 차례는 LABELS 의 차례다
        if any(word in text for word in KEYWORDS[label]):
            return label
    return None


keyword = {p['id']: keyword_label(p) for p in pages}
right = sum(keyword[p['id']] == p['label'] for p in pages)
none = sum(keyword[p['id']] is None for p in pages)
print(f'키워드 50개: 맞힘 {right}개, 틀림 {len(pages) - right - none}개, 라벨 없음 {none}개')
for i in ('p014', 'p018', 'p008'):             # 라벨 없음, 사전의 차례, 낱말 안의 키워드
    p = pages[int(i[1:]) - 1]
    print(f'{p["id"]} 사람 {p["label"]}, 키워드 {keyword[p["id"]]}: {p["title"]} / {p["text"]}')

# 3단계: 헷갈리는 지면과 틀린 까닭을 센다
# 헷갈리는 지면은 제목의 카테고리(사람 라벨)와 첫 문단의 카테고리 가운데 어느 쪽을 붙였는지 따로 센다.
PLACES = ['제목의 카테고리', '첫 문단의 카테고리', '그 밖', '라벨 없음']


def place(p, guess):
    if guess[p['id']] == p['label']:
        return PLACES[0]
    if guess[p['id']] is None:
        return PLACES[3]
    return PLACES[1] if guess[p['id']] == p['mixed'] else PLACES[2]


def split(arts, guess):
    n = Counter(place(p, guess) for p in arts)
    return ', '.join(f'{k} {n[k]}개' for k in PLACES if n[k])


def why_wrong(p):
    text = p['title'] + ' ' + p['text']
    if any(word in text for word in KEYWORDS[p['label']]):
        return '제 낱말도 있는데 사전의 위쪽이 먼저 맞음'
    if keyword[p['id']] == p['mixed']:
        return '첫 문단에 다른 카테고리의 낱말만 있음'
    return '제 명사 안에 다른 카테고리의 낱말이 들어 있음'


clear = [p for p in pages if not p['mixed']]
c_right = sum(keyword[p['id']] == p['label'] for p in clear)
c_none = sum(keyword[p['id']] is None for p in clear)
print(f'헷갈리지 않는 지면 {len(clear)}개: 맞힘 {c_right}개, 틀림 {len(clear) - c_right - c_none}개, 라벨 없음 {c_none}개')
print(f'헷갈리는 지면 {len(mixed)}개: {split(mixed, keyword)}')
wrong = [p for p in pages if keyword[p['id']] not in (None, p['label'])]
print(f'틀림 {len(wrong)}개의 까닭:', ', '.join(f'{why} {n}개' for why, n in Counter(why_wrong(p) for p in wrong).most_common()))
# 출력:
# 1단계 뜻: 50개 중 앞 10개가 헷갈리는 지면이다. p008 은 제목이 여행인데 첫 문단의 명사 셋은 sports 에서 왔다.
# 지면 50개: 카테고리 10개 × 5개, 그중 헷갈리는 지면 10개(p001~p010)
# p037 사람 라벨 sports: 러닝화, 처음이라면 먼저 볼 것 / 10km 완주, 수영 대회 이야기가 나오면 질문이 꼭 따라온다. 스포츠 워치 쪽도 짧게 적어 둔다.
# p008 사람 라벨 travel (첫 문단의 명사는 sports): 여권 사진, 처음이라면 먼저 볼 것 / 수영 대회, 10km 완주 이야기가 나오면 질문이 꼭 따라온다. 오늘은 인터벌 훈련 이야기까지 함께 정리한다.
# 2단계 뜻: 사전이 붙인 40개 중 33개가 맞는다. 세 지면은 라벨이 빈 러닝 지면, 사전의 차례에 걸린 지면, 명사 안의 「사진」에 걸린 지면이다.
# 키워드 50개: 맞힘 33개, 틀림 7개, 라벨 없음 10개
# p014 사람 sports, 키워드 None: 10km 완주, 처음이라면 먼저 볼 것 / 지난주부터 스포츠 워치, 농구 결승 정보를 모아 읽고 있다. 읽은 사람이 많이 물은 인터벌 훈련 내용도 넣었다.
# p018 사람 family, 키워드 education: 부모 교육, 처음이라면 먼저 볼 것 / 지난주부터 결혼 준비, 돌잔치 정보를 모아 읽고 있다. 어린이집 쪽도 짧게 적어 둔다.
# p008 사람 travel, 키워드 hobbies: 여권 사진, 처음이라면 먼저 볼 것 / 수영 대회, 10km 완주 이야기가 나오면 질문이 꼭 따라온다. 오늘은 인터벌 훈련 이야기까지 함께 정리한다.
# 3단계 뜻: 헷갈리지 않는 40개는 틀린 것보다 비운 것이 많고, 헷갈리는 10개는 제목의 카테고리를 붙인 것이 3개뿐이다.
# 헷갈리지 않는 지면 40개: 맞힘 30개, 틀림 2개, 라벨 없음 8개
# 헷갈리는 지면 10개: 제목의 카테고리 3개, 첫 문단의 카테고리 4개, 그 밖 1개, 라벨 없음 2개
# 틀림 7개의 까닭: 첫 문단에 다른 카테고리의 낱말만 있음 4개, 제 낱말도 있는데 사전의 위쪽이 먼저 맞음 2개, 제 명사 안에 다른 카테고리의 낱말이 들어 있음 1개
```

라벨이 빈 10개는 사전의 낱말이 하나도 없는 지면입니다. p014 는 「10km 완주」, 「스포츠 워치」, 「농구 결승」, 「인터벌 훈련」으로 운동 이야기를 합니다. 그런데 sports 의 낱말 넷은 하나도 없습니다. 이 지면에 러닝화 광고를 붙이려면 사전에 「완주」나 「인터벌」을 더 적어야 합니다.

<div class="demo-embed-wrap">
<iframe class="demo-embed" src="demo-contextual-cards.html?embed=1&card=keyword" height="480" loading="lazy" title="낱말 40개의 사전을 위에서부터 살펴보고 처음 맞는 카테고리를 붙이는 자리"></iframe>
<a class="demo-embed-open" href="demo-contextual-cards.html" target="_blank" rel="noopener">↗ 카드 네 장 전체로 열기</a>
</div>

틀린 7개는 까닭이 셋입니다. 헷갈리는 지면 4개는 첫 문단에 다른 카테고리의 낱말만 있었습니다. 「부모 교육」이 든 family 지면 2개는 「부모」와 「교육」이 다 있습니다. 사전에서 education 이 family 보다 위라 education 이 먼저 맞았습니다. 여권 사진 지면은 travel 의 명사 안에 든 「사진」이 hobbies 에 걸렸습니다. 「부모 교육」과 「여권 사진」은 이런 자리를 보이려고 일부러 넣은 명사입니다.

헷갈리는 10개만 보면 제목의 카테고리를 붙인 것은 3개이고, 모두 제목의 명사에 그 카테고리의 낱말이 있던 지면입니다. 사전은 낱말이 제목에 있었는지 첫 문단에 있었는지를 보지 않습니다. 그래서 제목에 사전의 낱말이 없으면 첫 문단의 낱말을 따르거나 라벨을 비웁니다.

빈칸을 줄이려면 사람이 사전에 낱말을 더해야 하는데, 「인터벌」을 넣어도 「클라이밍」이 남습니다. 낱말을 사람이 고르는 대신 지면의 낱말을 모두 세어 쓰는 방법이 4절입니다. 낱말마다 지면 안의 횟수에 얼마나 드문지를 곱한 값을 TF-IDF 라고 부르고, 지면을 그 값의 목록인 벡터로 바꿉니다. 그리고 카테고리마다 벡터를 평균한 중심과, 방향이 얼마나 같은지를 코사인으로 비교합니다.

## 4. TF-IDF 벡터와 중심의 코사인: 빈칸은 메우지만 틀의 낱말에 끌립니다

**TF-IDF 벡터를 카테고리 중심과 비교하면 50개를 빈칸 없이 붙이고 34개를 맞힙니다. 사전이 비워 둔 10개 가운데 7개를 맞히는 대신, 여러 지면에 되풀이되는 틀의 낱말에 끌려 틀리기도 합니다. 헷갈리는 10개는 하나도 제목을 따르지 않습니다.**

TF-IDF 는 낱말 하나에 붙는 점수입니다. TF 는 그 낱말이 지면 안에 나온 횟수이고, IDF 는 log(50 ÷ 그 낱말이 나온 지면 수)입니다. p014 의 「인터벌」은 지면 4개에만 나와 IDF 가 2.53 이고, 틀의 낱말 「읽고」는 9개에 나와 1.71 입니다. 여러 지면에 두루 나오는 낱말일수록 점수가 낮아집니다.

지면 50개에 나온 낱말은 234개라서, 지면 하나는 234자리의 숫자 목록이 됩니다. 들어 있는 낱말의 자리에는 TF-IDF 를, 없는 낱말의 자리에는 0 을 둡니다. 글을 이렇게 숫자 벡터로 바꾼 것을 임베딩(embedding)이라고 부릅니다. [Elasticsearch 하이브리드 검색](post.html?id=elasticsearch-hybrid-retrieval) 편은 학습한 모델로 문장을 384차원 벡터로 바꿨습니다. 거기의 384는 모델이 정한 자리 수이고, 여기의 234는 낱말 수입니다. TF-IDF 벡터는 그 문장 임베딩 384차원의 단순한 형태입니다. 자리 하나가 낱말 하나이고, 낱말이 같아야만 두 지면이 가까워집니다.

카테고리의 중심 벡터는 그 카테고리 지면 벡터의 평균입니다. 지면 하나를 분류할 때는 그 지면을 빼고 남은 4개로 중심을 만듭니다. 자기 글이 중심에 들어가면 자기와 닮아 보여, 실제보다 잘 맞는 것처럼 보이기 때문입니다. 코사인은 두 벡터의 방향이 같으면 1, 겹치는 낱말이 없으면 0 이고, 지면마다 코사인이 가장 큰 카테고리를 붙입니다.

```python
# (앞 블록에 이어서 돌린다.)
# 하는 일: 지면 50개를 TF-IDF 벡터로 바꾸고, 카테고리 중심 벡터와 코사인이 가장 큰 카테고리를 붙인다.
import math

# 1단계: 지면을 TF-IDF 벡터로 바꾼다
# 띄어쓰기로 자르고 쉼표와 마침표를 뗀다. 낱말마다 지면 안의 횟수(TF)에 log(50 ÷ 그 낱말이 든 지면 수)(IDF)를 곱한다.
def words(page):
    return [w.strip(',.') for w in (page['title'] + ' ' + page['text']).split()]


df = Counter(w for p in pages for w in set(words(p)))
idf = {w: math.log(len(pages) / n) for w, n in df.items()}


def tfidf(page):
    return {w: n * idf[w] for w, n in Counter(words(page)).items()}


vec = {p['id']: tfidf(p) for p in pages}
ex = pages[13]                                 # p014, 키워드 사전이 비워 둔 러닝 지면
print(f'낱말 종류 {len(df)}개. {ex["id"]} 의 낱말 {len(vec[ex["id"]])}개')
for w in ('인터벌', '읽고'):
    print(f'  「{w}」: 지면 {df[w]}개에 나와 IDF {idf[w]:.2f}')

# 2단계: 카테고리마다 중심 벡터를 만든다
# 그 카테고리 지면의 벡터를 평균한다. 지면 하나를 분류할 때는 그 지면을 빼고 남은 4개로 만든다.
def centroid(label, skip):
    members = [vec[p['id']] for p in pages if p['label'] == label and p['id'] != skip]
    out = {}
    for v in members:
        for w, x in v.items():
            out[w] = out.get(w, 0.0) + x / len(members)
    return out


# 3단계: 코사인이 가장 큰 카테고리를 붙인다
# 코사인은 두 벡터의 방향이 같으면 1, 겹치는 낱말이 없으면 0 이다. 모든 카테고리가 0 이면 라벨을 비운다.
def cosine(u, v):
    dot = math.fsum(x * v.get(w, 0.0) for w, x in u.items())
    norm = math.sqrt(math.fsum(x * x for x in u.values())) * math.sqrt(math.fsum(x * x for x in v.values()))
    return dot / norm if norm else 0.0


emb, cos = {}, {}
for p in pages:
    cos[p['id']] = {label: cosine(vec[p['id']], centroid(label, p['id'])) for label in LABELS}
    best = max(LABELS, key=cos[p['id']].get)
    emb[p['id']] = best if cos[p['id']][best] > 0 else None
right = sum(emb[p['id']] == p['label'] for p in pages)
print(f'TF-IDF 50개: 맞힘 {right}개, 틀림 {sum(emb[p["id"]] not in (None, p["label"]) for p in pages)}개, '
      f'라벨 없음 {sum(emb[p["id"]] is None for p in pages)}개')


def pull(p, label):                            # 그 중심 쪽 코사인을 가장 많이 올린 낱말. 넷째와 값이 같은 낱말은 함께 둔다
    c = centroid(label, p['id'])
    part = {w: round(x * c.get(w, 0.0), 9) for w, x in vec[p['id']].items()}
    cut = sorted(part.values(), reverse=True)[3]
    return [w for w in sorted(part, key=lambda w: -part[w]) if part[w] >= cut]


top = sorted(LABELS, key=lambda label: -cos[ex['id']][label])[:3]
print(f'{ex["id"]} 의 코사인:', ', '.join(f'{label} {cos[ex["id"]][label]:.3f} '
                                        f'({math.degrees(math.acos(cos[ex["id"]][label])):.0f}도)' for label in top))
print(f'  sports 쪽을 가장 많이 올린 낱말: {pull(ex, "sports")}')
c_right = sum(emb[p['id']] == p['label'] for p in clear)
print(f'헷갈리지 않는 지면 {len(clear)}개: 맞힘 {c_right}개 / 헷갈리는 지면 {len(mixed)}개: {split(mixed, emb)}')
empty = [p for p in pages if keyword[p['id']] is None]
hit = [p for p in pages if keyword[p['id']] == p['label']]
print(f'키워드가 비워 둔 {len(empty)}개 가운데 TF-IDF 가 맞힌 지면 {sum(emb[p["id"]] == p["label"] for p in empty)}개, '
      f'키워드가 맞힌 {len(hit)}개 가운데 TF-IDF 가 틀린 지면 {sum(emb[p["id"]] != p["label"] for p in hit)}개')
bad = pages[30]                                # p031, TF-IDF 가 틀린 자동차 지면
got = emb[bad['id']]
print(f'{bad["id"]} 사람 {bad["label"]}, TF-IDF {got} {cos[bad["id"]][got]:.3f} '
      f'(사람 라벨 쪽 {cos[bad["id"]][bad["label"]]:.3f}): {bad["title"]} / {bad["text"]}')
print(f'  {got} 쪽을 가장 많이 올린 낱말: {pull(bad, got)}')
# 출력:
# 1단계 뜻: 여러 지면에 나오는 틀의 낱말 「읽고」는 지면 4개에만 나온 「인터벌」보다 IDF 가 낮다.
# 낱말 종류 234개. p014 의 낱말 23개
#   「인터벌」: 지면 4개에 나와 IDF 2.53
#   「읽고」: 지면 9개에 나와 IDF 1.71
# 3단계 뜻: 빈칸 없이 34개를 맞힌다. 사전이 비운 지면 7개를 맞히는 대신 사전이 맞힌 7개를 틀리고, p031 처럼 틀의 낱말에 끌린 지면이 있다.
# TF-IDF 50개: 맞힘 34개, 틀림 16개, 라벨 없음 0개
# p014 의 코사인: sports 0.373 (68도), style 0.231 (77도), hobbies 0.192 (79도)
#   sports 쪽을 가장 많이 올린 낱말: ['스포츠', '워치', '10km', '완주', '농구', '결승']
# 헷갈리지 않는 지면 40개: 맞힘 34개 / 헷갈리는 지면 10개: 첫 문단의 카테고리 7개, 그 밖 3개
# 키워드가 비워 둔 10개 가운데 TF-IDF 가 맞힌 지면 7개, 키워드가 맞힌 33개 가운데 TF-IDF 가 틀린 지면 7개
# p031 사람 automotive, TF-IDF health 0.203 (사람 라벨 쪽 0.185): 주차 보조 한 달 기록 / 지난주부터 초보 운전, 전기차 충전 정보를 모아 읽고 있다. 오늘은 타이어 교체 이야기까지 함께 정리한다.
#   health 쪽을 가장 많이 올린 낱말: ['오늘은', '이야기까지', '함께', '정리한다']
```

사전이 비워 둔 10개 가운데 7개를 맞혔습니다. p014 는 sports 중심과의 코사인이 0.373 으로 가장 크고, 각도로는 68도입니다. sports 쪽 코사인을 가장 많이 올린 낱말은 「스포츠」와 「워치」입니다. 「10km」, 「완주」, 「농구」, 「결승」이 같은 값으로 뒤를 잇습니다. 모두 다른 sports 지면에도 나온 명사입니다.

<div class="demo-embed-wrap">
<iframe class="demo-embed" src="demo-contextual-cards.html?embed=1&card=embedding" height="480" loading="lazy" title="지면 벡터와 카테고리 중심 벡터 사이의 각도"></iframe>
<a class="demo-embed-open" href="demo-contextual-cards.html" target="_blank" rel="noopener">↗ 카드 네 장 전체로 열기</a>
</div>

대신 사전이 맞힌 33개 가운데 7개를 틀렸습니다. 자동차 지면 p031 은 health 중심과의 코사인이 0.203 으로, automotive 의 0.185 보다 컸습니다. health 쪽을 가장 많이 올린 낱말은 「오늘은」, 「이야기까지」, 「함께」, 「정리한다」로 모두 틀의 낱말입니다. 같은 카테고리 지면과 겹치는 명사가 적으면, 같은 틀을 쓴 다른 카테고리 지면이 더 가까워질 수 있습니다. 34개는 틀을 5개씩 세 벌만 쓰는 짧은 가상 지면에서, 중심을 지면 4개로 만든 값입니다. 실제 지면에도 메뉴나 관련 기사처럼 사이트마다 되풀이되는 글이 붙어서, 본문만 뽑아 쓰는 일이 먼저입니다.

헷갈리는 10개는 하나도 맞히지 못했고, 7개에 첫 문단의 카테고리를 붙였습니다. 글을 낱말로 잘라 순서와 자리를 버리고 횟수만 남긴 것을 단어 가방(bag of words)이라고 부릅니다. TF-IDF 벡터도 단어 가방입니다. 낱말이 제목에 있었는지 첫 문단에 있었는지를 버리니, 명사 셋이 든 첫 문단 쪽으로 기웁니다. 「제목을 따른다」는 기준을 읽을 수 있는 쪽은 5절의 LLM 입니다. LLM 에는 답 앞에 풀이를 토큰으로 길게 써 보는 thinking 모드도 있습니다.

## 5. LLM 분류: 50개를 한 프롬프트로, thinking 을 켜면 무엇이 달라지나

**같은 프롬프트로 50개를 하나씩 물으면 43개를 맞힙니다. 헷갈리지 않는 40개는 하나만 틀리지만, 헷갈리는 10개 가운데 6개는 「제목을 따른다」는 줄이 있는데도 첫 문단을 따릅니다. 그 10개를 thinking 을 켜고 다시 물으면 모두 제목을 따르고, 모델이 써 낸 토큰은 풀이까지 106배, 걸린 시간은 46배가 됩니다.**

LLM 에 보내는 요청은 두 부분입니다. 시스템 메시지(system message)는 모든 요청에 같이 가는 할 일 설명이고, 사용자 메시지는 지면 하나의 제목과 첫 문단입니다. 「50개를 한 프롬프트로」는 같은 시스템 메시지로 50개를 하나씩 물었다는 뜻입니다. 시스템 메시지에는 지면 분류기라는 것, 제목을 따른다는 기준, 카테고리 10개의 한 줄 풀이, 답은 JSON 한 줄로만 쓰라는 것을 적었습니다. JSON 은 `{"label": "sports"}` 처럼 이름과 값을 중괄호로 적는 형식이라 코드가 바로 읽습니다.

둘째 줄의 「제목과 첫 문단이 서로 다른 주제를 말하면 제목의 주제를 고른다」가 2절의 사람 기준입니다. [관심사 분류](post.html?id=interest-classification) 편에서는 이 기준을 적지 않아, 헷갈리는 글 20건 중 16건이 첫 문장을 따랐습니다. 그래서 이번에는 기준을 프롬프트에 적었습니다. 50개는 thinking 을 끄고 temperature 0 과 seed 7 로 한 번씩 물었습니다. temperature 0 은 늘 점수가 가장 높은 토큰을 고르는 설정이고, seed 는 뽑을 때 쓰는 난수의 시작값입니다.

헷갈리는 10개는 thinking 을 켜고 한 번 더 물었습니다. Ollama 의 응답에는 thinking 토큰 수가 따로 없어서, 풀이가 든 출력 토큰 수와 풀이의 글자 수를 적었습니다. 풀이 글 자체는 기록에 두지 않았습니다. 같은 seed 와 temperature 0 으로 앞 3개 지면의 답 6개를 다시 기록해 보면 라벨은 모두 같습니다. 다만 thinking 을 켠 답은 풀이의 길이가 달라지기도 해서, thinking 의 토큰과 시간은 한 번 기록한 값으로 읽습니다. 걸린 시간에는 이 기록의 첫 요청이 다른 끈 요청보다 오래 걸린 것도 들어 있어서, 아래 3단계가 그 요청을 뺀 비율도 셉니다.

```python
# (앞 블록에 이어서 돌린다.)
# 하는 일: 기록한 LLM 답 60개를 사람 라벨과 비교하고, thinking 을 켠 10개의 토큰과 시간을 센 뒤, 세 방법의 라벨로 광고를 붙인다.
# 기록 data/llm-records/contextual-targeting.json 에서 옮김
import json

# 1단계: 기록을 둔다
# 키 p001 은 thinking 을 끄고 받은 답이고, p001|on|1 은 같은 지면을 thinking 을 켜고 한 번 더 물은 답이다.
# USAGE 의 네 값은 차례대로 입력 토큰, 출력 토큰, 걸린 ms, thinking 으로 쓴 풀이의 글자 수다.
RECORD = {"p001": "{\"label\": \"business\"}", "p001|on|1": "{\"label\": \"business\"}", "p002": "{\"label\": \"education\"}", "p002|on|1": "{\"label\": \"education\"}", "p003": "{\"label\": \"sports\"}", "p003|on|1": "{\"label\": \"sports\"}", "p004": "{\"label\": \"automotive\"}", "p004|on|1": "{\"label\": \"automotive\"}", "p005": "{\"label\": \"travel\"}", "p005|on|1": "{\"label\": \"family\"}", "p006": "{\"label\": \"health\"}", "p006|on|1": "{\"label\": \"food\"}", "p007": "{\"label\": \"style\"}", "p007|on|1": "{\"label\": \"hobbies\"}", "p008": "{\"label\": \"sports\"}", "p008|on|1": "{\"label\": \"travel\"}", "p009": "{\"label\": \"sports\"}", "p009|on|1": "{\"label\": \"health\"}", "p010": "{\"label\": \"sports\"}", "p010|on|1": "{\"label\": \"style\"}", "p011": "{\"label\": \"health\"}", "p012": "{\"label\": \"education\"}", "p013": "{\"label\": \"business\"}", "p014": "{\"label\": \"sports\"}", "p015": "{\"label\": \"automotive\"}", "p016": "{\"label\": \"travel\"}", "p017": "{\"label\": \"food\"}", "p018": "{\"label\": \"family\"}", "p019": "{\"label\": \"family\"}", "p020": "{\"label\": \"food\"}", "p021": "{\"label\": \"business\"}", "p022": "{\"label\": \"health\"}", "p023": "{\"label\": \"health\"}", "p024": "{\"label\": \"education\"}", "p025": "{\"label\": \"health\"}", "p026": "{\"label\": \"hobbies\"}", "p027": "{\"label\": \"business\"}", "p028": "{\"label\": \"automotive\"}", "p029": "{\"label\": \"style\"}", "p030": "{\"label\": \"travel\"}", "p031": "{\"label\": \"automotive\"}", "p032": "{\"label\": \"hobbies\"}", "p033": "{\"label\": \"hobbies\"}", "p034": "{\"label\": \"hobbies\"}", "p035": "{\"label\": \"hobbies\"}", "p036": "{\"label\": \"automotive\"}", "p037": "{\"label\": \"sports\"}", "p038": "{\"label\": \"travel\"}", "p039": "{\"label\": \"education\"}", "p040": "{\"label\": \"style\"}", "p041": "{\"label\": \"sports\"}", "p042": "{\"label\": \"family\"}", "p043": "{\"label\": \"style\"}", "p044": "{\"label\": \"business\"}", "p045": "{\"label\": \"style\"}", "p046": "{\"label\": \"family\"}", "p047": "{\"label\": \"travel\"}", "p048": "{\"label\": \"education\"}", "p049": "{\"label\": \"food\"}", "p050": "{\"label\": \"food\"}"}
USAGE = {"p001": [262, 6, 2202, 0], "p001|on|1": [260, 572, 36878, 1972], "p002": [266, 6, 924, 0], "p002|on|1": [264, 579, 38907, 2100], "p003": [258, 6, 923, 0], "p003|on|1": [256, 506, 49353, 1709], "p004": [263, 7, 987, 0], "p004|on|1": [261, 505, 55862, 1759], "p005": [260, 6, 924, 0], "p005|on|1": [258, 1389, 104546, 5043], "p006": [264, 6, 927, 0], "p006|on|1": [262, 606, 42115, 2060], "p007": [264, 6, 925, 0], "p007|on|1": [262, 693, 48044, 2365], "p008": [261, 6, 922, 0], "p008|on|1": [259, 505, 34659, 1785], "p009": [264, 6, 923, 0], "p009|on|1": [262, 608, 42482, 2040], "p010": [263, 6, 920, 0], "p010|on|1": [261, 513, 35314, 1802], "p011": [258, 6, 919, 0], "p012": [256, 6, 919, 0], "p013": [260, 6, 925, 0], "p014": [268, 6, 925, 0], "p015": [259, 7, 984, 0], "p016": [259, 6, 923, 0], "p017": [262, 6, 931, 0], "p018": [256, 6, 919, 0], "p019": [254, 6, 917, 0], "p020": [261, 6, 925, 0], "p021": [258, 6, 919, 0], "p022": [254, 6, 919, 0], "p023": [260, 6, 923, 0], "p024": [266, 6, 921, 0], "p025": [255, 6, 1136, 0], "p026": [266, 7, 994, 0], "p027": [253, 6, 972, 0], "p028": [263, 7, 1214, 0], "p029": [266, 6, 1018, 0], "p030": [263, 6, 999, 0], "p031": [252, 7, 1060, 0], "p032": [265, 7, 1046, 0], "p033": [263, 7, 1038, 0], "p034": [259, 7, 1098, 0], "p035": [270, 7, 1083, 0], "p036": [256, 7, 1072, 0], "p037": [266, 6, 944, 0], "p038": [258, 6, 939, 0], "p039": [262, 6, 1201, 0], "p040": [260, 6, 964, 0], "p041": [262, 6, 959, 0], "p042": [260, 6, 1041, 0], "p043": [267, 6, 990, 0], "p044": [258, 6, 943, 0], "p045": [263, 6, 940, 0], "p046": [261, 6, 943, 0], "p047": [258, 6, 1161, 0], "p048": [268, 6, 1016, 0], "p049": [267, 6, 1181, 0], "p050": [273, 6, 1038, 0]}


def llm_label(key):
    try:
        label = json.loads(RECORD[key])['label']
    except (ValueError, KeyError, TypeError):
        return None                            # JSON 이 아니거나 label 이 없으면 라벨로 읽지 못한 답이다
    return label if label in LABELS else None


llm = {p['id']: llm_label(p['id']) for p in pages}
print(f'기록 {len(RECORD)}개, USAGE {len(USAGE)}개, 두 상수의 키와 차례가 같은가 {list(RECORD) == list(USAGE)}')
print(f'라벨로 읽지 못한 답 {sum(llm_label(k) is None for k in RECORD)}개, 출력 토큰 합 {sum(u[1] for u in USAGE.values()):,}개')

# 2단계: 사람 라벨과 비교한다
# 헷갈리는 지면은 2절의 기준대로 제목의 카테고리를 붙여야 맞는다. 시스템 메시지의 둘째 줄이 그 기준이다.
right = sum(llm[p['id']] == p['label'] for p in pages)
print(f'LLM 50개: 맞힘 {right}개, 틀림 {sum(llm[p["id"]] not in (None, p["label"]) for p in pages)}개, '
      f'라벨 없음 {sum(llm[p["id"]] is None for p in pages)}개')
c_right = sum(llm[p['id']] == p['label'] for p in clear)
print(f'헷갈리지 않는 지면 {len(clear)}개: 맞힘 {c_right}개 / 헷갈리는 지면 {len(mixed)}개: {split(mixed, llm)}')
for p in clear:
    if llm[p['id']] != p['label']:
        print(f'틀림 {p["id"]} 사람 {p["label"]}, LLM {llm[p["id"]]}, 키워드 {keyword[p["id"]]}, TF-IDF {emb[p["id"]]}: '
              f'{p["title"]} / {p["text"]}')

# 3단계: thinking 을 켠 10개와 끈 10개를 비교한다
# 같은 헷갈리는 지면 10개를 두 번 물었다. 출력 토큰에는 thinking 으로 쓴 풀이의 토큰도 들어 있다.
on = {p['id']: llm_label(p['id'] + '|on|1') for p in mixed}
print(f'thinking 을 켜면 라벨이 바뀐 지면 {sum(on[i] != llm[i] for i in on)}개, 헷갈리는 지면 {len(mixed)}개: {split(mixed, on)}')
total = {}
for name, keys in (('끔', [p['id'] for p in mixed]), ('켬', [p['id'] + '|on|1' for p in mixed])):
    tin, tout, ms, chars = (sum(USAGE[k][j] for k in keys) for j in range(4))
    total[name] = (tout, ms)
    print(f'thinking {name} {len(keys)}개: 입력 {tin:,} 토큰, 출력 {tout:,} 토큰 (평균 {tout / len(keys):.1f}), '
          f'{ms / 1000:.1f}초 (평균 {ms / len(keys) / 1000:.2f}초), 풀이 {chars:,}자')
print(f'켜면 출력 토큰 {total["켬"][0] / total["끔"][0]:.0f}배, 걸린 시간 {total["켬"][1] / total["끔"][1]:.0f}배')
first = list(USAGE)[0]                         # 상수의 키는 id 가 기록에 처음 나온 차례라, 첫 키가 이 기록의 첫 요청이다
rest = [p['id'] for p in mixed if p['id'] != first]
print(f'끈 답의 첫 요청 {first} 은 {USAGE[first][2] / 1000:.1f}초, 나머지 {len(rest)}개는 '
      f'{min(USAGE[i][2] for i in rest) / 1000:.2f}~{max(USAGE[i][2] for i in rest) / 1000:.2f}초. '
      f'{first} 을 뺀 {len(rest)}개끼리는 걸린 시간 {sum(USAGE[i + "|on|1"][2] for i in rest) / sum(USAGE[i][2] for i in rest):.0f}배')
spans = sorted((USAGE[p['id'] + '|on|1'][2], p['id']) for p in mixed)
print(f'켠 10개의 걸린 시간: 가장 짧은 {spans[0][1]} {spans[0][0] / 1000:.1f}초, 가장 긴 {spans[-1][1]} {spans[-1][0] / 1000:.1f}초')
fixed = {**llm, **on}
print(f'헷갈리는 10개만 thinking 을 켠 답으로 바꾸면 50개 중 맞힘 {sum(fixed[p["id"]] == p["label"] for p in pages)}개')

# 4단계: 카테고리 규칙으로 광고를 붙인다
# 가상 규칙이다. 러닝화는 sports, 여행사는 travel, 카페는 food 지면에 붙고, 그 밖의 카테고리와 라벨 없음에는 붙지 않는다.
AD = {'sports': '러닝화', 'travel': '여행사', 'food': '카페'}
methods = {'키워드': keyword, 'TF-IDF': emb, 'LLM': llm}
for name, guess in methods.items():
    cells = []
    for cat, ad in AD.items():
        got = [p for p in pages if guess[p['id']] == cat]
        cells.append(f'{ad} {len(got)}개 (사람 라벨이 {cat} 인 지면 {sum(p["label"] == cat for p in got)}개)')
    print(f'{name}: ' + ', '.join(cells))
extra = {name: [f'{p["id"]} {p["label"]}' for p in pages if g[p['id']] == 'sports' and p['label'] != 'sports']
         for name, g in methods.items()}
print('러닝화가 sports 가 아닌 지면에 붙은 자리:', ', '.join(f'{name} {v}' for name, v in extra.items()))
C_PAGES = ['p037', 'p014', 'p047', 'p020', 'p008', 'p010']   # 비로그인 C 가 본 지면 여섯. 설명을 위해 고른 것이다
for i in C_PAGES:
    p = pages[int(i[1:]) - 1]
    row = ', '.join(f'{name} {AD.get(g[i], "없음")}' for name, g in methods.items())
    more = f', thinking 켬 {AD.get(on[i], "없음")}' if i in on else ''
    print(f'{i} 사람 {p["label"]} ({AD.get(p["label"], "없음")}): {row}{more}')
# 출력:
# 1단계 뜻: RECORD 의 키 60개가 USAGE 의 키 60개와 차례까지 같고, 모든 답이 카테고리 10개 가운데 하나로 읽힌다.
# 기록 60개, USAGE 60개, 두 상수의 키와 차례가 같은가 True
# 라벨로 읽지 못한 답 0개, 출력 토큰 합 6,786개
# 2단계 뜻: 헷갈리지 않는 지면은 하나만 틀리고, 헷갈리는 10개는 기준을 적었는데도 6개가 첫 문단을 따랐다.
# LLM 50개: 맞힘 43개, 틀림 7개, 라벨 없음 0개
# 헷갈리지 않는 지면 40개: 맞힘 39개 / 헷갈리는 지면 10개: 제목의 카테고리 4개, 첫 문단의 카테고리 6개
# 틀림 p035 사람 sports, LLM hobbies, 키워드 sports, TF-IDF sports: 스포츠 워치, 처음이라면 먼저 볼 것 / 처음에는 클라이밍 하나만 보다가 테니스 라켓 쪽으로 범위를 넓혔다. 읽은 사람이 많이 물은 프로 야구 내용도 넣었다.
# 3단계 뜻: thinking 을 켜면 6개가 제목 쪽으로 바뀌어 10개가 모두 맞는다. 출력 토큰은 106배, 걸린 시간은 46배이고 첫 요청을 빼면 54배다.
# thinking 을 켜면 라벨이 바뀐 지면 6개, 헷갈리는 지면 10개: 제목의 카테고리 10개
# thinking 끔 10개: 입력 2,625 토큰, 출력 61 토큰 (평균 6.1), 10.6초 (평균 1.06초), 풀이 0자
# thinking 켬 10개: 입력 2,605 토큰, 출력 6,476 토큰 (평균 647.6), 488.2초 (평균 48.82초), 풀이 22,635자
# 켜면 출력 토큰 106배, 걸린 시간 46배
# 끈 답의 첫 요청 p001 은 2.2초, 나머지 9개는 0.92~0.99초. p001 을 뺀 9개끼리는 걸린 시간 54배
# 켠 10개의 걸린 시간: 가장 짧은 p008 34.7초, 가장 긴 p005 104.5초
# 헷갈리는 10개만 thinking 을 켠 답으로 바꾸면 50개 중 맞힘 49개
# 4단계 뜻: 사전은 러닝화를 sports 지면에만 붙이지만 셋을 놓치고, TF-IDF 와 LLM 은 첫 문단이 운동 이야기인 지면에도 붙인다.
# 키워드: 러닝화 2개 (사람 라벨이 sports 인 지면 2개), 여행사 4개 (사람 라벨이 travel 인 지면 3개), 카페 4개 (사람 라벨이 food 인 지면 4개)
# TF-IDF: 러닝화 8개 (사람 라벨이 sports 인 지면 4개), 여행사 7개 (사람 라벨이 travel 인 지면 4개), 카페 3개 (사람 라벨이 food 인 지면 3개)
# LLM: 러닝화 7개 (사람 라벨이 sports 인 지면 4개), 여행사 5개 (사람 라벨이 travel 인 지면 4개), 카페 4개 (사람 라벨이 food 인 지면 4개)
# 러닝화가 sports 가 아닌 지면에 붙은 자리: 키워드 [], TF-IDF ['p007 hobbies', 'p008 travel', 'p009 health', 'p010 style'], LLM ['p008 travel', 'p009 health', 'p010 style']
# p037 사람 sports (러닝화): 키워드 러닝화, TF-IDF 러닝화, LLM 러닝화
# p014 사람 sports (러닝화): 키워드 없음, TF-IDF 러닝화, LLM 러닝화
# p047 사람 travel (여행사): 키워드 없음, TF-IDF 여행사, LLM 여행사
# p020 사람 food (카페): 키워드 카페, TF-IDF 여행사, LLM 카페
# p008 사람 travel (여행사): 키워드 없음, TF-IDF 러닝화, LLM 러닝화, thinking 켬 여행사
# p010 사람 style (없음): 키워드 없음, TF-IDF 러닝화, LLM 러닝화, thinking 켬 없음
```

thinking 을 끈 답은 50개 중 43개가 맞았습니다. 헷갈리지 않는 40개는 39개가 맞았고, 틀린 하나는 sports 지면 p035 를 hobbies 로 붙인 답입니다. 제목이 스포츠 워치이고 첫 문단은 클라이밍, 테니스 라켓, 프로 야구 이야기입니다. 사전과 TF-IDF 는 이 지면을 sports 로 맞혔습니다. 헷갈리는 10개에서는 4개만 제목을 따랐습니다. 기준을 적어 두어도, 첫 문단에 다른 카테고리의 명사가 셋 있으면 그쪽을 고른 답이 더 많았습니다.

<div class="demo-embed-wrap">
<iframe class="demo-embed" src="demo-contextual-cards.html?embed=1&card=llm" height="480" loading="lazy" title="시스템 메시지와 JSON 라벨, thinking 을 켰을 때의 출력 토큰"></iframe>
<a class="demo-embed-open" href="demo-contextual-cards.html" target="_blank" rel="noopener">↗ 카드 네 장 전체로 열기</a>
</div>

같은 10개를 thinking 을 켜고 물으면 6개의 라벨이 바뀌었고, 바뀐 6개는 모두 제목의 카테고리입니다. 10개 모두 사람 라벨과 같아져서, 헷갈리는 10개만 이 답으로 바꾸면 50개 중 49개가 맞습니다. 값은 출력 토큰이 61개에서 6,476개로 106배, 걸린 시간이 10.6초에서 488.2초로 46배입니다. 끈 쪽 10.6초에는 기록의 첫 요청인 p001 의 2.2초가 들어 있어서, 그 지면을 뺀 9개끼리 비교하면 54배입니다. 입력 토큰은 2,625개와 2,605개로 거의 같고, 늘어난 것은 답 앞에 쓴 풀이 22,635자입니다.

풀이 안에서 무엇을 따졌는지는 풀이 글을 기록하지 않아 이 기록으로는 말할 수 없습니다. 남은 사실은 걸린 시간입니다. thinking 을 켠 지면은 하나에 34.7초에서 104.5초까지 걸려 지면마다 길이가 다릅니다. 헷갈리는 10개의 끈 답은 첫 요청을 빼면 0.92초에서 0.99초입니다. 그래서 thinking 은 모든 지면에 켜기보다 켤 자리를 따로 고르는 편이 낫습니다. 값싼 두 방법의 라벨이 서로 다른 지면에만 켜는 규칙이 떠오르지만, 그 규칙이 맞는지는 이 기록으로 측정하지 않았습니다.

## 6. 세 방법 비교와 광고 셋이 붙는 지면

**지면 50개에서 맞힌 수는 사전 33개, TF-IDF 34개, LLM 43개이고 틀리는 자리가 서로 다릅니다. 광고 셋을 카테고리 규칙으로 붙이면, 비로그인 C 가 본 지면 6개 가운데 세 방법이 같은 광고를 고른 지면은 하나뿐입니다.**

광고를 붙이는 규칙은 가상으로 정했습니다. 서연 씨의 러닝화는 sports, 여행사는 travel, 카페는 food 지면에 붙습니다. 다른 카테고리나 라벨이 빈 지면에는 셋 다 붙지 않습니다. 후보풀 편에서는 조건이 없던 카페도 여기서는 food 지면을 고른다고 둡니다. 아래 표는 C 가 오늘 본 지면 6개를 50개 가운데 설명을 위해 골라, 5절 코드의 4단계가 붙인 광고를 적은 것입니다.

| 지면 (C 가 본 6개) | 사람 라벨과 광고 | 사전의 광고 | TF-IDF 의 광고 | LLM 의 광고 |
|---|---|---|---|---|
| p037 러닝화, 처음이라면 먼저 볼 것 | sports, 러닝화 | 러닝화 | 러닝화 | 러닝화 |
| p014 10km 완주, 처음이라면 먼저 볼 것 | sports, 러닝화 | 없음 | 러닝화 | 러닝화 |
| p047 오사카 3박 한 달 기록 | travel, 여행사 | 없음 | 여행사 | 여행사 |
| p020 떡볶이 한 달 기록 | food, 카페 | 카페 | 여행사 | 카페 |
| p008 여권 사진, 처음이라면 먼저 볼 것 (첫 문단은 운동) | travel, 여행사 | 없음 | 러닝화 | 러닝화, thinking 을 켜면 여행사 |
| p010 스킨케어 루틴, 처음이라면 먼저 볼 것 (첫 문단은 운동) | style, 없음 | 없음 | 러닝화 | 러닝화, thinking 을 켜면 없음 |

표에서 가져갈 것은 둘입니다. 사전의 손해는 틀린 광고보다 빈자리라서, 광고를 고를 수 있던 지면에 아무것도 붙이지 못합니다. TF-IDF 와 thinking 을 끈 LLM 은 첫 문단 쪽으로 기울어서, 운동 이야기가 든 지면이면 사람 라벨과 달라도 러닝화를 붙입니다.

50개 전체로 보면 러닝화가 붙는 지면 수가 방법마다 다릅니다. 사전은 2개에만 붙이고 둘 다 sports 지면이지만, sports 지면 5개 가운데 3개를 놓칩니다. TF-IDF 는 8개, LLM 은 7개에 붙이고, 그 가운데 sports 지면은 둘 다 4개입니다. LLM 이 더 붙인 3개는 모두 첫 문단이 운동 이야기인 헷갈리는 지면입니다. TF-IDF 쪽에는 첫 문단이 패션 이야기인 취미 지면 p007 이 하나 더 있습니다.

어느 쪽이 서연 씨에게 나은지는 정확도로 정해지지 않습니다. p008 은 사람 라벨이 travel 이라 러닝화를 붙이면 틀린 것으로 셉니다. 그런데 그 지면을 읽는 사람은 수영 대회와 10km 완주 이야기를 읽고 있습니다. 러닝화가 그 자리에서 더 팔리는지는 지면마다 클릭과 구매를 따로 측정해야 압니다.

이 글의 43개는 카테고리 10개짜리 가상 지면에서 나온 값입니다. Kamen(2025)은 IAB 2.2 의 여러 단계짜리 분류로 사람 라벨 8,660개를 LLM 10개에 같은 프롬프트로 물었습니다. 평균 정확도는 34% 였습니다. 카테고리가 많고 깊어지면 같은 LLM 이라도 다른 문제를 풉니다.

값도 다릅니다. 사전과 TF-IDF 는 사전 찾기와 덧셈 몇 번이라 지면 하나에 시간이 거의 들지 않습니다. LLM 은 헷갈리는 10개에서 지면 하나에 평균 1.06초, thinking 을 켜면 48.82초가 걸렸습니다. 끈 쪽 평균에는 첫 요청의 2.2초가 들어 있습니다. 지면의 카테고리는 처음 볼 때 한 번 붙여 두고 다시 쓰므로, 광고 요청마다 LLM 을 부를 일은 없습니다.

## 7. 열린 RTB 는 지면만으로, 담장 안은 회원 번호와 지면을 같이 씁니다

**열린 RTB 에서는 사람을 알아볼 쿠키가 없는 요청이 늘어, 지면의 카테고리만으로 고르는 일이 많아집니다. 담장 안에서는 로그인한 회원의 번호와 지면의 카테고리를 같이 쓰고, 비로그인 요청에만 카테고리 하나로 고릅니다.**

1~6절의 셈은 두 무대가 같습니다. 담장 안은 한 회사가 서비스와 광고 서버를 다 가진 곳이고, 열린 RTB 는 여러 회사가 실시간 경매로 남의 지면에 광고를 사고파는 곳입니다. 둘이 다른 것은 지면이 누구 것인지와, 카테고리를 언제 누가 붙이는지입니다.

### 담장 안에서는 번호와 지면을 같이 씁니다 [무대: 닫힌 생태계]

담장 안에서는 지면도 자기 서비스의 글이라, 글이 올라올 때 카테고리를 한 번 붙여 글 정보와 같이 저장해 둡니다. 14주째의 관심사 라벨과 같은 자리입니다. 회원 A 가 sports 지면을 읽으면 317 과 sports 를 같이 쓸 수 있고, 비로그인 C 에게는 sports 하나가 남습니다.

LLM 은 글이 올라올 때 한 번 부릅니다. thinking 을 켠 답은 지면 하나에 수십 초가 걸려서, 따로 고른 지면에만 켭니다. 카테고리를 다시 붙이면 그 지면에 나가던 광고가 바뀌므로, 바뀌는 지면 수를 먼저 셉니다.

### 열린 RTB 에서는 지면만 남는 요청이 많습니다 [무대: 열린 RTB]

열린 RTB 에서 광고를 사는 쪽의 시스템을 DSP 라고 부릅니다. DSP 가 받는 입찰 요청에는 지면 주소 `site.page` 와, 매체가 적은 카테고리 `site.cat`, `site.pagecat` 이 담깁니다. 카테고리는 IAB Content Taxonomy 의 ID 로 적고, 어느 버전의 ID 인지는 `cattax` 에 적습니다. 브라우저가 다른 회사의 쿠키를 막거나 사용자가 지운 요청에는 사람을 알아볼 값이 없어서, 지면만으로 고르게 됩니다.

매체가 적은 카테고리는 비어 있거나 사이트 전체에 하나만 붙어 있기도 합니다. 그래서 DSP 는 처음 본 주소를 따로 읽어 카테고리를 붙이고, 다음 요청에서 바로 꺼내 쓰도록 캐시에 저장해 둡니다. 입찰 응답은 100ms 안팎에 돌려줘야 하므로, 그 자리에서 LLM 을 부르지 않습니다. Amazon Ads 의 과학자들은 2025년 기고에서 「키워드가 지면에 있으면 광고를 보인다」는 방식을 넘어섰다고 적었습니다. 대신 LLM 으로 지면의 내용을 읽는다는 것입니다.

| 무엇 | 담장 안 | 열린 RTB |
|---|---|---|
| 지면 | 우리 서비스의 글 | 남의 지면, 입찰 요청에 주소로 온다 |
| 카테고리를 붙이는 때 | 글이 올라올 때 한 번 | 처음 본 주소를 미리 읽고 캐시 |
| 카테고리 이름 | 우리가 정한 목록 | IAB Content Taxonomy 의 ID, 버전은 cattax |
| 사람에 대한 값 | 로그인하면 회원 번호와 세그먼트 | 쿠키, 없으면 지면뿐 |
| LLM 을 부르는 때 | 글이 올라올 때 | 처음 본 주소를 읽을 때 |

다음 편은 18주째의 자연어 오디언스입니다. 이 글은 지면에 이름을 붙였고, 다음 편은 「러닝화 살 사람」 같은 한 문장을 LLM 이 조건과 명단으로 바꾸는 자리를 봅니다.

## 한눈 정리

| 자리 | 무엇을 하나 | 숫자 |
|---|---|---|
| 지면 50개 | 카테고리 10개에 5개씩, 사람 라벨은 제목의 카테고리 | 헷갈리는 지면 10개 (p001~p010) |
| 키워드 사전 | 낱말 40개를 위에서부터 살펴보고 처음 맞는 카테고리 | 50개 중 33개 맞힘, 10개 비움 |
| TF-IDF | 낱말 234개 자리의 벡터와 카테고리 중심의 코사인 | 50개 중 34개 맞힘, 헷갈리는 10개는 0개 |
| LLM, thinking 끔 | 시스템 메시지 하나로 50개를 하나씩 | 50개 중 43개, 헷갈리는 10개 중 4개 |
| LLM, thinking 켬 | 헷갈리는 10개를 한 번 더 | 10개 모두 맞힘, 출력 토큰 106배, 시간 46배 |
| 광고 셋 | sports 러닝화, travel 여행사, food 카페 | 러닝화가 붙은 지면은 사전 2개, TF-IDF 8개, LLM 7개 |

## 헷갈리기 쉬운 점

- **컨텍스추얼은 사람이 아니라 자리를 고릅니다.** 같은 지면을 보는 사람은 누구든 같은 카테고리를 받습니다. C 가 러닝 지면을 읽으면 러닝화가 후보가 되지만, C 가 러닝을 좋아하는지는 모릅니다. 회원 A 의 317 은 30일 기록에서 나온 번호이고, sports 는 지금 읽는 지면 하나에서 나온 이름입니다.
- **분류 정확도와 광고 성과는 다릅니다.** 정확도는 사람 라벨과 맞는지를 세고, 광고 성과는 그 자리에서 클릭과 구매가 나는지를 셉니다. 첫 문단이 운동 이야기인 travel 지면에 러닝화를 붙이면 정확도에서는 틀립니다. 그래도 성과는 따로 측정하기 전까지 모릅니다.
- **thinking 의 비용은 켠 요청마다 붙고, 이 기록에서 정확도가 바뀐 곳은 헷갈리는 지면입니다.** thinking 은 헷갈리는 10개 가운데 6개를 고쳤고, 그 10개에서 출력 토큰 106배와 시간 46배를 냈습니다. 헷갈리지 않는 지면에서는 켜 보지 않았습니다. 그 40개는 끈 답이 이미 39개를 맞혀서 더 맞힐 수 있는 자리는 많아야 하나이고, 켜서 맞던 답이 바뀔 수도 있습니다. 그래서 켤 지면을 고르는 기준부터 정하고 그 지면에서 따로 측정합니다.

## 더 깊이 보기

:::deep TF-IDF 와 코사인의 식
지면 $d$ 안에서 낱말 $w$ 가 나온 횟수를 $\mathrm{tf}(w, d)$ 라고 둡니다. 낱말 $w$ 가 나온 지면 수는 $\mathrm{df}(w)$ 입니다. 지면 수는 $N = 50$ 입니다.

$$x_{d,w} = \mathrm{tf}(w, d) \cdot \ln\frac{N}{\mathrm{df}(w)}$$

로그는 자연로그입니다. 「인터벌」은 $\mathrm{df} = 4$ 라서 $\ln(50/4) = 2.53$ 입니다. 「읽고」는 $\mathrm{df} = 9$ 라서 $\ln(50/9) = 1.71$ 입니다. 50개 모두에 나온 낱말이 있다면 $\ln 1 = 0$ 이라 벡터에서 빠집니다.

카테고리 $k$ 의 지면 모임을 $S_k$ 라고 하면, 지면 $d$ 를 분류할 때 쓰는 중심은 $d$ 를 뺀 평균입니다.

$$c_k^{(-d)} = \frac{1}{|S_k \setminus \{d\}|} \sum_{d' \in S_k \setminus \{d\}} x_{d'}$$

$$\cos(x_d, c) = \frac{\sum_w x_{d,w}\, c_w}{\lVert x_d \rVert \, \lVert c \rVert}, \qquad \hat{k} = \arg\max_k \cos\big(x_d, c_k^{(-d)}\big)$$

TF-IDF 의 값은 모두 0 이상이라 코사인은 0 에서 1 사이이고, 각도는 0 도에서 90 도 사이입니다. p014 의 sports 코사인 0.373 은 $\arccos 0.373$ 이라 68도입니다. 「러닝화」와 「운동화」처럼 뜻이 가까워도 낱말이 다르면 자리가 달라서, 코사인에 아무것도 더하지 않습니다. 학습한 문장 임베딩은 이런 두 낱말을 가까운 방향에 둡니다.

scikit-learn 의 `TfidfVectorizer` 는 기본값이 조금 다릅니다. IDF 로 $\ln\frac{1 + N}{1 + \mathrm{df}} + 1$ 을 써서 모든 지면에 나온 낱말도 0 이 되지 않습니다. 그리고 벡터마다 길이를 1 로 맞춥니다. 그래서 같은 지면이라도 이 글과 값이 다르게 나옵니다.
:::

:::deep IAB Content Taxonomy 와 이 글의 카테고리 10개
IAB Tech Lab 은 Content Taxonomy 3.1 을 TSV 파일, 곧 탭으로 칸을 나눈 표로 공개합니다. 그 파일을 세어 보면 카테고리가 704개입니다. 카테고리는 4단계까지 내려갑니다. 맨 위 단계가 37개, 둘째 단계가 323개, 셋째 단계가 275개, 넷째 단계가 69개입니다. 2절 표의 ID 는 이 파일의 번호입니다.

IAB 3.1 에서 러닝은 Sports 아래에 없습니다. Healthy Living 아래 Fitness and Exercise 의 Running and Jogging 입니다. 캠핑도 Hobbies & Interests 가 아니라 Travel 아래 Travel Type 의 Camping 입니다. 그래서 러닝화 광고주가 IAB ID 로 지면을 고를 때 Sports 하나만 고르면 러닝 지면을 놓칠 수 있습니다. 이 글의 가상 규칙이 sports 하나에 러닝화를 붙인 것은 설명을 위해 줄인 것입니다.

입찰 요청의 `cattax` 값은 AdCOM 1.0 의 목록을 따릅니다. AdCOM 은 OpenRTB 가 같이 쓰는 IAB Tech Lab 의 공통 목록 명세입니다. 그 목록에서 7 은 Content Taxonomy 3.0, 9 는 3.1 입니다. 값을 적지 않으면 Content Category Taxonomy 1.0 으로 봅니다. 1.0 은 지금은 쓰지 말라고 적혀 있고 ID 의 꼴도 달라서, 같은 Sports 라도 버전마다 ID 가 다릅니다.
:::

- [관심사 분류](post.html?id=interest-classification) — 같은 세 방법을 회원이 읽은 글에 붙인 14주째 편입니다. 영어 소문자 라벨과 기록 재생 방식이 처음 나옵니다.
- [Elasticsearch 하이브리드 검색](post.html?id=elasticsearch-hybrid-retrieval) — 학습한 모델이 만든 384차원 문장 임베딩과 코사인입니다. 글자가 달라도 뜻이 가까운 상품을 찾은 자리가 있습니다.
- [후보풀 여덟 질문](post.html?id=candidate-pool-questions) — 비로그인 C 가 카페 하나만 꺼낸 자리와 광고 셋의 조건입니다.
- [유저 프로파일 피처](post.html?id=user-profile-features) — 회원 A 의 30일 행동이 벡터가 되는 편입니다. 비로그인 C 에게는 이 벡터가 없습니다.
- [컨텍스추얼 타겟팅 카드 네 장](demo-contextual-cards.html) — 이 글의 카드 전체입니다. 카드를 누르면 헷갈리는 것 하나가 더 나옵니다.

## 참고문헌

- Barchiesi, D., Deshpande, A. (2025). *Delivering ad relevance without third-party cookies: advanced AI-powered contextual techniques*. 4A's 기고, 2025-03-18. [aaaa.org](https://www.aaaa.org/blog/guest-post-delivering-ad-relevance-without-third-party-cookies-advanced-ai-powered-contextual-techniques/). Amazon Ads 의 두 과학자가 쓴 글입니다. 「키워드가 지면에 있으면 광고를 보인다」는 방식을 넘어, LLM 으로 지면의 내용을 읽는다고 밝혔습니다.
- IAB Tech Lab. *Content Taxonomy*. [iabtechlab.com](https://iabtechlab.com/standards/content-taxonomy/). 3.1 의 TSV 는 [github.com](https://github.com/InteractiveAdvertisingBureau/Taxonomies/blob/develop/Content%20Taxonomies/Content%20Taxonomy%203.1.tsv) 에 있습니다. 지면의 주제를 4단계까지 적는 표준 목록입니다.
- Kamen, A. (2025). *Order from Chaos: Comparative Study of Ten Leading LLMs on Unstructured Data Categorization*. arXiv:2510.13885. [arxiv.org](https://arxiv.org/abs/2510.13885). LLM 10개를 IAB 2.2 계층 분류에 같은 프롬프트로 비교한 벤치마크입니다. 사람 라벨 8,660개에서 평균 정확도가 34% 였습니다.
- IAB Tech Lab. *AdCOM 1.0*. [github.com](https://github.com/InteractiveAdvertisingBureau/AdCOM/blob/main/AdCOM%20v1.0%20FINAL.md). List: Category Taxonomies 에 `cattax` 값의 목록이 있습니다.
- IAB Tech Lab. *OpenRTB 2.6*. [github.com](https://github.com/InteractiveAdvertisingBureau/openrtb2.x/blob/main/2.6.md). Site 객체의 `page`, `cat`, `pagecat`, `cattax` 필드입니다.
