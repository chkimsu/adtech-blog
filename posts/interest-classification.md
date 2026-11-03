모델 팀 14주째 되는 월요일, 지훈 씨는 지난주에 센 회원 A 의 「러닝 글 9편」이 어디서 왔는지 따라가 봤습니다. 글마다 관심사 칸이 있었고, 낱말 몇 개를 찾아 붙이는 규칙이 그 칸을 채웠습니다. 그 낱말이 없는 「10km 완주」 후기는 칸이 비어 있었습니다.

선배는 사람이 관심사 이름(라벨)을 붙여 둔 글 200건을 건네며 같은 글에 세 가지를 붙여 보라고 했습니다. 지금의 낱말 규칙, 라벨이 붙은 글로 배운 모델, 글을 읽고 답을 써 주는 언어 모델입니다.

**같은 글 200건에 셋을 붙이면 무엇이 사람의 라벨과 더 맞고, 한 건에 얼마가 들까요?**

글 한 편에 관심사 하나를 붙이는 일을 관심사 분류(interest classification)라고 합니다. 셋째의 언어 모델은 LLM 이라고 부릅니다. 라벨이 비면 러닝 글을 읽은 회원이 「러닝 글 3편 이상」 조건에서 빠지고, 틀리면 안 읽은 회원이 들어옵니다. 어느 쪽이든 서연 씨의 하루 300만 원이 다른 사람에게 쓰입니다.

> **한 줄 요약:** 가상 글 200건에 키워드 규칙을 대면 붙인 라벨은 대부분 맞지만 79건이 비어 있습니다. 라벨이 붙은 글로 배운 분류 모델과 라벨 없이 물은 LLM 은 평가 40건 중 똑같이 38건을 맞힙니다. 다만 모델은 처음 보는 낱말에서 틀립니다. LLM 은 제목과 첫 문장이 다른 관심사를 말하는 글에서 틀리는데, 제목을 따른다는 사람 기준을 프롬프트에 적지 않아서입니다. LLM 은 한 건에 가상 단가로 0.070원과 0.86초가 들고, 같은 글을 다시 물어도 답이 바뀌지 않았습니다. 규칙과 모델이 확신하지 못한 10건만 LLM 에 물어도 같은 수를 맞힙니다.

> **골라 읽는 법** — 절이 7개인 글이고, 절마다 표나 코드나 카드가 들어 있어 그것만 보고 넘어가도 됩니다.
>
> - 글 200건과 사람 라벨이 만들어지는 자리 → 1절
> - 키워드 규칙과 맞는 정도를 재는 두 값 → 2절
> - 라벨이 붙은 글로 배우는 분류 모델 → 3절
> - 기록한 LLM 의 답과 다시 물은 결과 → 4절
> - 셋을 한 표에 놓기와 섞어 쓰기 → 5~6절
> - 담장 안과 열린 RTB 에서 달라지는 것 → 7절

이 글의 글 200건과 사람 라벨은 전부 설명을 위해 만든 가상 데이터이고, 비용에 쓰는 상용 모델의 단가도 가상 단가입니다. LLM 의 답만은 지어낸 값이 아닙니다. 2026-11-04 에 이 블로그를 쓰는 맥에서 Ollama 로 qwen3.5:27b 를 띄워 한 번에 기록했습니다. 같은 글을 여러 번 물은 자리는 4절에 있고, 글은 그 기록을 그대로 다시 씁니다. Ollama 는 공개된 모델을 내 컴퓨터에서 돌리는 도구입니다. 기록 파일은 `data/llm-records/interest-classification.json` 입니다. 회원 A 와 「러닝 글 3편 이상」 조건은 [유저 프로파일 피처](post.html?id=user-profile-features) 편 그대로입니다. 카드 속 회색은 규칙, 파랑은 분류 모델, 벽돌색은 LLM 이고, 점선 상자는 사람이 미리 적어 둔 글입니다.

---

## 1. 글 200건과 라벨 8개: 사람이 붙인 라벨이 정답입니다

**글 한 건은 제목과 첫 문장이고, 관심사 8개에 25건씩 200건입니다. 사람 라벨은 제목의 관심사이고, 그중 20건은 첫 문장에 다른 관심사의 명사가 섞인 헷갈리는 글입니다. 앞 40건은 평가용으로 떼어 두고 나머지 160건으로 모델을 배웁니다.**

마라톤 접수 글의 제목은 「마라톤 접수, 이번 달에 알게 된 것」입니다. 첫 문장은 「회사 동료가 새벽 조깅 얘기를 꺼내서 비교까지 해 봤다」이고, 사람이 붙인 라벨은 running 입니다. 라벨은 running, camping 처럼 영어 소문자 8개 가운데 하나로 두었습니다. 코드와 LLM 의 답에서 같은 이름을 쓰기 위해서입니다. 이 글에서 라벨이라고 하면 글 한 건에 붙은 관심사 이름 하나를 말합니다.

글은 생성기가 만듭니다. 제목 틀 5개와 첫 문장 틀 5개를 두고, 관심사마다 명사 20개를 적었습니다. 글 한 건마다 그 관심사의 명사 둘을 뽑아 하나는 제목에, 하나는 첫 문장에 넣습니다. 명사 20개 중 7개에는 「러닝」, 「마라톤」처럼 관심사를 바로 알리는 낱말이 들어 있습니다. 나머지 13개는 「10km 완주」, 「케이던스」처럼 그런 낱말 없이 쓰입니다.

20건은 일부러 헷갈리게 만들었습니다. 제목의 명사는 그 관심사에서, 첫 문장의 명사는 다른 관심사에서 가져왔습니다. 종아리 마사지 글은 제목이 러닝인데, 첫 문장은 「지난달부터 립스틱 생각에 정보를 모으고 있다」입니다. 이런 글은 제목이 글의 주제라고 보고, 사람 라벨을 제목의 관심사로 붙였습니다.

200건 가운데 앞 40건은 관심사마다 5건씩 평가용으로 떼어 두고, 모델은 나머지 160건으로만 배웁니다. 배운 글로 시험을 보면 실제보다 잘 맞는 것처럼 보이기 때문입니다. 맞는 정도는 관심사마다 두 값으로 잽니다. precision 은 running 을 붙인 글 가운데 정말 러닝 글인 몫입니다. recall 은 러닝 글 가운데 running 을 받은 글의 몫입니다. 관심사 8개의 값을 평균해 한 방법의 점수로 씁니다.

같은 글에 붙여 볼 방법은 셋입니다. 규칙은 관심사마다 키워드를 적어 둔 사전으로 붙입니다. 분류 모델은 글을 낱말 목록으로 바꾼 단어 가방(bag of words)을 읽습니다. 낱말마다 그 관심사 쪽으로 얼마나 기우는지를 나타내는 수가 가중치이고, 모델은 글에 든 낱말의 가중치를 더해 점수를 냅니다. 이 모델을 로지스틱 회귀(logistic regression)라고 부릅니다. LLM 에는 할 일을 적은 글, 곧 프롬프트(prompt)를 글과 함께 보내 답을 받습니다.

| 라벨 | 관심사 | 명사 20개 가운데 넷 | 헷갈리는 글과 첫 문장의 명사를 가져온 관심사 |
|---|---|---|---|
| running | 러닝 | 러닝화, 하프 마라톤, 10km 완주, 케이던스 | 3건, travel, beauty, cafe |
| camping | 캠핑 | 캠핑장 예약, 텐트 설치, 차박, 화로대 | 3건, travel, cafe, running |
| travel | 여행 | 기차 여행, 항공권 특가, 렌터카, 면세점 | 3건, camping, cafe, finance |
| cafe | 카페 | 동네 카페, 스페셜티 커피, 라떼 아트, 콜드브루 | 2건, travel, parenting |
| parenting | 육아 | 육아휴직, 이유식, 유모차, 키즈카페 | 3건, travel, finance, gaming |
| finance | 재테크 | 적금 비교, 주식 계좌, 배당주, 연말정산 | 2건, gaming, parenting |
| gaming | 게임 | 콘솔 게임, 공략 영상, 레이드, 가챠 | 2건, finance, parenting |
| beauty | 뷰티 | 기초 화장품, 스킨케어 루틴, 선크림, 쿠션 팩트 | 2건, travel, running |

표의 명사 넷 가운데 앞의 둘에는 관심사를 알리는 낱말이 있고 뒤의 둘에는 없습니다. 육아의 키즈카페는 육아 명사인데 안에 「카페」가 들어 있어서, 2절의 규칙을 시험하는 자리가 됩니다. 먼저 가장 싸고 빠른 규칙부터 200건에 대 봅니다.

## 2. 규칙: 사전에 있는 낱말만 잡습니다

**관심사마다 키워드를 적고 위에서부터 처음 맞는 관심사를 붙이면, 200건 중 114건을 맞히고 7건을 틀리고 79건을 비워 둡니다. 붙인 라벨은 대부분 맞아 precision 이 0.95 이고, 비워 둔 글이 많아 recall 은 0.57 입니다.**

규칙은 관심사마다 사람이 적어 둔 키워드 목록입니다. running 은 「러닝」, 「마라톤」, 「조깅」 셋입니다. finance 는 「재테크」, 「적금」, 「주식」, 「ETF」 넷이고, 8개 관심사를 합하면 25개입니다. 글의 제목과 첫 문장에 키워드가 들어 있으면 그 관심사를 붙입니다. 사전을 running 부터 beauty 까지 위에서부터 훑다가 처음 맞는 관심사에서 멈추고, 하나도 안 맞으면 라벨을 비워 둡니다.

아래 코드의 1단계가 1절의 생성기이고, 2단계가 규칙, 3단계가 precision 과 recall 입니다. 생성기는 `scripts/gen-interest-articles.py` 와 글자까지 같은 코드입니다. 그래서 4절에서 LLM 에 보낸 200건도 이 코드가 만든 그대로입니다.

```python
# 하는 일: 가상 글 200건을 만들고 키워드 사전 규칙으로 라벨을 붙여 사람 라벨과 견준다.
import random
import statistics
from collections import Counter

# 1단계: 글 200건을 만든다
# 제목 틀 5개, 첫 문장 틀 5개, 관심사마다 명사 20개로 만든다. scripts/gen-interest-articles.py 의 생성기와 같은 코드다.
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


articles = make_articles()
test = articles[:40]
mixed = [a for a in articles if a['mixed']]
print(f'글 {len(articles)}건: 관심사 {len(LABELS)}개 × 25건, 그중 헷갈리는 글 {len(mixed)}건')
print(f'평가용 {len(test)}건(그중 헷갈리는 글 {sum(1 for a in test if a["mixed"])}건), 학습용 {len(articles) - len(test)}건')
for a in (articles[9], articles[11]):          # a010, a012
    note = f' (첫 문장의 명사는 {a["mixed"]})' if a['mixed'] else ''
    print(f'{a["id"]} 사람 라벨 {a["label"]}{note}: {a["title"]} / {a["first"]}')

# 2단계: 규칙으로 라벨을 붙인다
# 관심사마다 사람이 적어 둔 키워드 3~4개다. 위에서부터 훑어 처음 맞는 관심사를 붙이고, 하나도 안 맞으면 None 이다.
KEYWORDS = {
    'running': ['러닝', '마라톤', '조깅'], 'camping': ['캠핑', '텐트', '글램핑'],
    'travel': ['여행', '항공권', '호텔'], 'cafe': ['카페', '커피', '디저트'],
    'parenting': ['육아', '아기', '이유식'], 'finance': ['재테크', '적금', '주식', 'ETF'],
    'gaming': ['게임', '콘솔', '공략'], 'beauty': ['화장품', '스킨케어', '메이크업'],
}


def rule_label(art):
    text = art['title'] + ' ' + art['first']
    for label in LABELS:                       # 사전의 차례는 LABELS 의 차례다
        if any(word in text for word in KEYWORDS[label]):
            return label
    return None


rule = {a['id']: rule_label(a) for a in articles}
right = sum(rule[a['id']] == a['label'] for a in articles)
none = sum(rule[a['id']] is None for a in articles)
print(f'규칙 200건: 맞힘 {right}건, 틀림 {len(articles) - right - none}건, 라벨 없음 {none}건')
for n in (31, 65, 198):                        # 라벨 없음, 낱말 안의 키워드, 사전의 차례
    a = articles[n - 1]
    print(f'{a["id"]} 사람 {a["label"]}, 규칙 {rule[a["id"]]}: {a["title"]} / {a["first"]}')


def why_wrong(art):
    text = art['title'] + ' ' + art['first']
    if any(word in text for word in KEYWORDS[art['label']]):
        return '제 키워드도 있는데 사전의 위쪽이 먼저 맞음'
    if art['mixed']:
        return '첫 문장에 다른 관심사의 키워드만 있음'
    return '낱말 안에 다른 관심사의 키워드가 들어 있음'


wrong = [a for a in articles if rule[a['id']] not in (None, a['label'])]
for why, k in Counter(why_wrong(a) for a in wrong).most_common():
    print(f'틀림 {k}건: {why}')

# 3단계: precision 과 recall 을 센다
# 관심사마다 「그 라벨을 붙인 글 중 맞은 몫」과 「그 관심사 글 중 그 라벨을 받은 몫」을 세고 8개를 평균한다.
def precision_recall(arts, guess, label):
    said = [a for a in arts if guess[a['id']] == label]
    hit = sum(a['label'] == label for a in said)
    truth = sum(a['label'] == label for a in arts)
    return (hit / len(said) if said else 0.0), hit / truth, hit, len(said), truth


def average(arts, guess):                      # fmean 은 더하는 순서와 파이썬 버전에 상관없이 같은 값을 낸다
    pairs = [precision_recall(arts, guess, label)[:2] for label in LABELS]
    return statistics.fmean(p for p, _ in pairs), statistics.fmean(r for _, r in pairs)


p, r, hit, said, truth = precision_recall(articles, rule, 'running')
print(f'running: 붙인 {said}건 중 {hit}건이 맞아 precision {p:.2f}, 러닝 글 {truth}건 중 {hit}건을 잡아 recall {r:.2f}')
print('규칙 200건: precision %.2f, recall %.2f (관심사 8개의 평균)' % average(articles, rule))
p, r = average(test, rule)
print(f'규칙 평가 40건: precision {p:.2f}, recall {r:.2f}, '
      f'맞힘 {sum(rule[a["id"]] == a["label"] for a in test)}건, 라벨 없음 {sum(rule[a["id"]] is None for a in test)}건')
# 출력:
# 1단계 뜻: 200건 중 20건이 헷갈리는 글이고 평가용 40건에는 그중 2건이 있다. a012 는 제목이 러닝인데 첫 문장의 명사가 뷰티다.
# 글 200건: 관심사 8개 × 25건, 그중 헷갈리는 글 20건
# 평가용 40건(그중 헷갈리는 글 2건), 학습용 160건
# a010 사람 라벨 running: 마라톤 접수, 이번 달에 알게 된 것 / 회사 동료가 새벽 조깅 얘기를 꺼내서 비교까지 해 봤다.
# a012 사람 라벨 running (첫 문장의 명사는 beauty): 종아리 마사지, 이번 달에 알게 된 것 / 지난달부터 립스틱 생각에 정보를 모으고 있다.
# 2단계 뜻: 규칙이 붙인 121건 중 114건이 맞는다. 세 글은 라벨이 빈 글, 키즈카페 안의 카페에 걸린 글, 사전의 첫 줄인 running 이 먼저 맞은 글이고, 틀린 7건은 세 가지 까닭으로 나뉜다.
# 규칙 200건: 맞힘 114건, 틀림 7건, 라벨 없음 79건
# a031 사람 running, 규칙 None: 심박수 구간 한 달 기록 / 처음에는 케이던스 하나만 보다가 범위를 넓혔다.
# a065 사람 parenting, 규칙 cafe: 요즘 빠진 키즈카페 이야기 / 회사 동료가 수면 교육 얘기를 꺼내서 비교까지 해 봤다.
# a198 사람 camping, 규칙 running: 요즘 빠진 캠핑 의자 이야기 / 마라톤 접수 이야기가 나와서 겪은 일을 적어 둔다.
# 틀림 4건: 첫 문장에 다른 관심사의 키워드만 있음
# 틀림 2건: 제 키워드도 있는데 사전의 위쪽이 먼저 맞음
# 틀림 1건: 낱말 안에 다른 관심사의 키워드가 들어 있음
# 3단계 뜻: 붙인 라벨은 대부분 맞아 precision 이 높고, 비워 둔 글이 많아 recall 은 0.6 에 못 미친다.
# running: 붙인 14건 중 13건이 맞아 precision 0.93, 러닝 글 25건 중 13건을 잡아 recall 0.52
# 규칙 200건: precision 0.95, recall 0.57 (관심사 8개의 평균)
# 규칙 평가 40건: precision 1.00, recall 0.57, 맞힘 23건, 라벨 없음 17건
```

라벨이 빈 79건은 사전에 없는 낱말로만 쓴 글입니다. 심박수 구간 글은 「심박수 구간」과 「케이던스」로 러닝을 말하지만, 사전에는 둘 다 없습니다. 명사 20개 중 13개에 키워드가 없으니, 명사 둘을 뽑으면 둘 다 그쪽인 일이 잦습니다.

<div class="demo-embed-wrap">
<iframe class="demo-embed" src="demo-interest-cards.html?embed=1&card=rule" height="480" loading="lazy" title="키워드 사전을 위에서부터 훑어 처음 맞는 관심사를 붙이는 규칙"></iframe>
<a class="demo-embed-open" href="demo-interest-cards.html" target="_blank" rel="noopener">↗ 카드 네 장 전체로 열기</a>
</div>

틀린 7건은 까닭이 셋입니다. 키즈카페 글은 「키즈카페」 안의 「카페」가 걸려 육아 글이 cafe 를 받았습니다. 헷갈리는 글 4건은 제 관심사의 키워드가 없고, 첫 문장의 다른 관심사 명사에만 키워드가 있었습니다. 나머지 2건은 두 관심사의 키워드가 다 있어서 사전의 위쪽이 먼저 맞았습니다. 캠핑 의자 글은 제목에 「캠핑」이 있는데도, 첫 문장의 「마라톤 접수」가 사전의 첫 줄인 running 에 먼저 걸렸습니다.

running 하나만 보면 붙인 14건 중 13건이 맞아 precision 은 0.93 입니다. 그런데 러닝 글 25건 가운데 절반 가까이를 놓쳐서 recall 은 0.52 입니다. 규칙은 틀리는 일보다 비워 두는 일이 훨씬 많아서 두 값이 이렇게 멀리 떨어집니다. 왜 그 라벨인지가 낱말 하나로 보이고 값이 거의 들지 않는다는 것이 규칙의 장점입니다.

놓친 글을 줄이려면 사람이 사전에 낱말을 더해야 합니다. 「케이던스」를 넣으면 「업힐 훈련」이 남고, 새 낱말은 글이 올라올 때마다 생깁니다. 낱말을 사람이 적는 대신 라벨이 붙은 글에서 배우게 하는 것이 분류 모델입니다.

## 3. 분류 모델: 단어 가방과 로지스틱 회귀

**학습 160건에 나온 낱말 239개마다 관심사별 가중치를 배우면, 평가 40건 중 38건을 맞힙니다. precision 과 recall 은 둘 다 0.95 입니다. 틀린 2건은 학습 160건에 한 번도 나오지 않은 명사가 든 글입니다.**

단어 가방은 글을 띄어쓰기로 잘라 어떤 낱말이 들어 있는지만 남긴 것입니다. 심박수 구간 글은 「심박수」, 「구간」, 「케이던스」와 틀의 낱말 8개를 합쳐 낱말 11개가 되고, 낱말의 순서는 버립니다. 학습 160건에 나온 낱말은 239개입니다. 그래서 글 한 건은 239자리 가운데 들어 있는 낱말의 자리만 1 인 목록이 됩니다.

로지스틱 회귀는 낱말마다 가중치를 하나씩 두고, 글에 든 낱말의 가중치와 절편을 더합니다. 절편은 글에 무슨 낱말이 있든 늘 더하는 값입니다. 더한 값은 시그모이드(sigmoid)라는 함수로 0~1 사이의 점수로 옮기는데, 0 이면 0.5 이고 클수록 1 에 가까워집니다. 이 글은 「running 인가」, 「camping 인가」처럼 관심사마다 모델을 하나씩 8개 배우고, 점수가 가장 높은 관심사를 고릅니다. 관심사마다 따로 배우는 이 방식을 one-vs-rest 라고 부릅니다.

가중치는 경사 하강(gradient descent)으로 배웁니다. 학습 글마다 점수와 정답의 차이를 구하는데, 정답은 그 관심사면 1 이고 아니면 0 입니다. 그리고 160건의 차이를 줄이는 쪽으로 가중치를 조금씩 고칩니다. 이 일을 200번 되풀이하고, 한 번에 얼마나 고칠지 정하는 학습률(learning rate)은 2 로 두었습니다.

```python
# (앞 블록에 이어서 돌린다.)
# 하는 일: 학습 160건으로 단어 가방 로지스틱 회귀 8개를 배워 평가 40건에 라벨을 붙인다.
import math

# 1단계: 글을 단어 가방으로 바꾼다
# 띄어쓰기로 자르고 쉼표와 마침표를 뗀다. 학습 160건에 나온 낱말만 사전에 넣고, 사전에 없는 낱말은 버린다.
train = articles[40:]
human = {a['id']: a['label'] for a in articles}


def words(art):
    return {w.strip(',.') for w in (art['title'] + ' ' + art['first']).split()}


vocab = sorted({w for a in train for w in words(a)})
index = {w: i for i, w in enumerate(vocab)}


def bag(art):
    return [index[w] for w in words(art) if w in index]   # 값이 1 인 자리의 번호만 적는다


ex = articles[30]                              # a031
print(f'낱말 사전 {len(vocab)}개. {ex["id"]} 의 낱말 {len(words(ex))}개 중 사전에 있는 것 {len(bag(ex))}개')

# 2단계: 관심사마다 로지스틱 회귀를 배운다
# 「이 관심사인가」를 맞히는 모델 8개를 따로 배운다. 점수는 가중치 합을 시그모이드로 0~1 사이에 옮긴 값이다.
def sigmoid(z):
    return 1 / (1 + math.exp(-z))


def train_one(label, truth, steps=200, lr=2.0):
    xs = [bag(a) for a in train]
    ys = [1.0 if truth[a['id']] == label else 0.0 for a in train]
    w, b = [0.0] * len(vocab), 0.0
    for _ in range(steps):                     # 경사 하강 200번. 160건의 평균 기울기만큼 고친다
        gw, gb = [0.0] * len(vocab), 0.0
        for x, y in zip(xs, ys):
            err = sigmoid(b + sum(w[i] for i in x)) - y
            for i in x:
                gw[i] += err
            gb += err
        w = [wi - lr * g / len(xs) for wi, g in zip(w, gw)]
        b -= lr * gb / len(xs)
    return w, b


models = {label: train_one(label, human) for label in LABELS}
w, b = models['running']
best = sorted(range(len(vocab)), key=lambda i: -w[i])[:5]
print('running 모델의 가중치 위 5개:', ', '.join(f'{vocab[i]} {w[i]:.2f}' for i in best), f'(절편 {b:.2f})')
z = b + sum(w[i] for i in bag(ex))
print(f'{ex["id"]} 의 running 점수: 절편과 낱말 {len(bag(ex))}개의 가중치를 더하면 {z:.2f}, 시그모이드를 지나 {sigmoid(z):.2f}')

# 3단계: 평가 40건에 라벨을 붙인다
# 점수 8개 가운데 가장 높은 관심사를 고른다. 사전에 없는 낱말은 점수에 아무것도 더하지 않는다.
def scores(ms, art):
    x = bag(art)
    return {label: sigmoid(b + sum(w[i] for i in x)) for label, (w, b) in ms.items()}


model, top_score = {}, {}
for a in test:
    s = scores(models, a)
    model[a['id']] = max(LABELS, key=s.get)
    top_score[a['id']] = max(s.values())
s = scores(models, ex)
print(f'{ex["id"]} 의 점수 8개:', ', '.join(f'{label} {s[label]:.2f}' for label in LABELS))
print('모델 평가 40건: precision %.2f, recall %.2f' % average(test, model))
for a in test:
    if model[a['id']] != a['label']:
        unseen = sorted(v for v in words(a) if v not in index)
        print(f'틀림 {a["id"]} 사람 {a["label"]}, 모델 {model[a["id"]]} {top_score[a["id"]]:.2f}, 사전에 없던 낱말 {unseen}')
# 출력:
# 1단계 뜻: 학습 160건에서 낱말 239개가 나왔고, 심박수 구간 글의 낱말 11개는 모두 그 안에 있다.
# 낱말 사전 239개. a031 의 낱말 11개 중 사전에 있는 것 11개
# 2단계 뜻: running 가중치가 가장 큰 「완주」는 규칙의 사전에 없는 낱말이다. 심박수 구간 글은 가중치 합 0.41 이 시그모이드를 지나 0.60 이 된다.
# running 모델의 가중치 위 5개: 완주 2.76, 코스 2.21, 한강 2.21, 러닝 2.02, 무릎 1.97 (절편 -1.45)
# a031 의 running 점수: 절편과 낱말 11개의 가중치를 더하면 0.41, 시그모이드를 지나 0.60
# 3단계 뜻: 심박수 구간 글은 running 이 가장 높아 맞는다. 틀린 두 글은 학습에 없던 명사가 들어 있어서 가장 높은 점수도 0.1 이 안 된다.
# a031 의 점수 8개: running 0.60, camping 0.07, travel 0.03, cafe 0.02, parenting 0.03, finance 0.01, gaming 0.03, beauty 0.01
# 모델 평가 40건: precision 0.95, recall 0.95
# 틀림 a009 사람 beauty, 모델 parenting 0.06, 사전에 없던 낱말 ['쿠션', '팩트']
# 틀림 a020 사람 parenting, 모델 cafe 0.08, 사전에 없던 낱말 ['그림책', '소독', '젖병']
```

배운 running 모델에서 가중치가 가장 큰 낱말은 「완주」이고, 「코스」, 「한강」, 「러닝」, 「무릎」이 뒤를 잇습니다. 규칙의 사전에 없는 「완주」가 맨 위에 있으니, 사람이 적지 않은 낱말도 라벨이 붙은 글에서 배운 셈입니다. 규칙이 비워 둔 심박수 구간 글에 모델은 running 0.60 을 주고, 나머지 7개 관심사에는 0.07 이하를 줍니다.

<div class="demo-embed-wrap">
<iframe class="demo-embed" src="demo-interest-cards.html?embed=1&card=model" height="480" loading="lazy" title="단어 가방이 가중치를 지나 점수 8개가 되는 자리"></iframe>
<a class="demo-embed-open" href="demo-interest-cards.html" target="_blank" rel="noopener">↗ 카드 네 장 전체로 열기</a>
</div>

틀린 2건은 쿠션 팩트 글과 그림책 글입니다. 그림책 글은 「그림책」, 「젖병」, 「소독」이 학습 160건에 한 번도 없었습니다. 그래서 점수에 들어간 것은 「처음이라면」, 「지난달부터」 같은 틀의 낱말뿐이었습니다. 쿠션 팩트 글은 「쿠션」과 「팩트」가 없었고, 남은 명사 「향수」 하나로는 틀의 낱말이 낸 점수를 뒤집지 못했습니다. 두 글의 가장 높은 점수는 0.06 과 0.08 이고, 6절은 이렇게 낮은 점수를 LLM 에 물을 글을 고르는 표시로 씁니다.

모델은 한 건에 덧셈 몇 번이라 값이 거의 들지 않지만, 사람이 라벨을 붙인 160건이 먼저 있어야 합니다. 새 낱말이 나오면 그 낱말이 든 글에 라벨을 붙여 다시 배워야 합니다. 라벨이 붙은 글 없이 낱말의 뜻을 읽고 답하는 쪽이 LLM 입니다.

## 4. LLM 라벨: 프롬프트 하나로 200건, 세 번 더 물어도 바뀐 답은 없었습니다

**같은 프롬프트로 200건을 하나씩 물으면 헷갈리지 않는 글 180건은 모두 맞고, 헷갈리는 글 20건 중 16건은 첫 문장의 관심사를 고릅니다. 평가 40건을 답이 흩어질 수 있게 3번 더 물어도 답이 바뀐 글은 0건이었습니다.**

LLM 에 보내는 요청은 두 부분입니다. 시스템 메시지(system message)는 모든 요청에 같이 가는 할 일 설명입니다. 사용자 메시지(user message)는 글 한 건의 제목과 첫 문장입니다. 시스템 메시지는 세 줄이고, 글 분류기라는 것, 라벨 8개 가운데 하나를 고르라는 것, 답은 JSON 한 줄로만 쓰라는 것입니다. JSON 은 `{"label": "travel"}` 처럼 이름과 값을 중괄호로 적는 형식이라 코드가 바로 읽습니다. 전문은 llm 카드와 `data/llm-records/prompts/interest-classification.json` 에 있습니다.

LLM 은 답을 토큰(token)이라는 조각으로 하나씩 이어 씁니다. 이 기록에서는 한글 2자 안팎이 토큰 하나이고, `{"label": "travel"}` 한 줄은 출력 토큰 6개입니다. 기록은 thinking 을 끄고 했습니다. thinking 은 답 앞에 풀이를 토큰으로 길게 써 보게 하는 모드인데, 라벨 하나를 고르는 데는 필요 없어서 껐습니다.

temperature 는 다음 토큰을 고를 때 점수가 낮은 토큰에도 얼마나 기회를 줄지 정하는 값입니다. 0 이면 늘 점수가 가장 높은 토큰을 고르고, 200건은 temperature 0 과 seed 7 로 물었습니다. seed 는 뽑을 때 쓰는 난수의 시작값이고, 둘을 고정하면 다시 기록해도 같은 답이 나옵니다. 앞 5건을 두 번 다시 기록해 보면 답과 토큰 수가 글자까지 같고 걸린 시간만 다릅니다. 아래 코드는 기록에서 뽑은 상수 RECORD 를 손대지 않고 담아 사람 라벨과 견줍니다.

```python
# (앞 블록에 이어서 돌린다.)
# 하는 일: 기록한 LLM 답 320개를 사람 라벨과 견주고, 다시 물은 40건과 토큰 비용과 섞어 쓴 결과를 센다.
# 기록 data/llm-records/interest-classification.json 에서 옮김
import json

# 1단계: 기록을 둔다
# 키 a001 은 temperature 0 의 답이다. a001|off|2 부터 a001|off|4 까지는 같은 글을 temperature 0.7 로 3번 더 물은 답이다.
RECORD = {"a001": "{\"label\": \"camping\"}", "a001|off|2": "{\"label\": \"camping\"}", "a001|off|3": "{\"label\": \"camping\"}", "a001|off|4": "{\"label\": \"camping\"}", "a002": "{\"label\": \"gaming\"}", "a002|off|2": "{\"label\": \"gaming\"}", "a002|off|3": "{\"label\": \"gaming\"}", "a002|off|4": "{\"label\": \"gaming\"}", "a003": "{\"label\": \"cafe\"}", "a003|off|2": "{\"label\": \"cafe\"}", "a003|off|3": "{\"label\": \"cafe\"}", "a003|off|4": "{\"label\": \"cafe\"}", "a004": "{\"label\": \"beauty\"}", "a004|off|2": "{\"label\": \"beauty\"}", "a004|off|3": "{\"label\": \"beauty\"}", "a004|off|4": "{\"label\": \"beauty\"}", "a005": "{\"label\": \"travel\"}", "a005|off|2": "{\"label\": \"travel\"}", "a005|off|3": "{\"label\": \"travel\"}", "a005|off|4": "{\"label\": \"travel\"}", "a006": "{\"label\": \"beauty\"}", "a006|off|2": "{\"label\": \"beauty\"}", "a006|off|3": "{\"label\": \"beauty\"}", "a006|off|4": "{\"label\": \"beauty\"}", "a007": "{\"label\": \"finance\"}", "a007|off|2": "{\"label\": \"finance\"}", "a007|off|3": "{\"label\": \"finance\"}", "a007|off|4": "{\"label\": \"finance\"}", "a008": "{\"label\": \"parenting\"}", "a008|off|2": "{\"label\": \"parenting\"}", "a008|off|3": "{\"label\": \"parenting\"}", "a008|off|4": "{\"label\": \"parenting\"}", "a009": "{\"label\": \"beauty\"}", "a009|off|2": "{\"label\": \"beauty\"}", "a009|off|3": "{\"label\": \"beauty\"}", "a009|off|4": "{\"label\": \"beauty\"}", "a010": "{\"label\": \"running\"}", "a010|off|2": "{\"label\": \"running\"}", "a010|off|3": "{\"label\": \"running\"}", "a010|off|4": "{\"label\": \"running\"}", "a011": "{\"label\": \"cafe\"}", "a011|off|2": "{\"label\": \"cafe\"}", "a011|off|3": "{\"label\": \"cafe\"}", "a011|off|4": "{\"label\": \"cafe\"}", "a012": "{\"label\": \"beauty\"}", "a012|off|2": "{\"label\": \"beauty\"}", "a012|off|3": "{\"label\": \"beauty\"}", "a012|off|4": "{\"label\": \"beauty\"}", "a013": "{\"label\": \"beauty\"}", "a013|off|2": "{\"label\": \"beauty\"}", "a013|off|3": "{\"label\": \"beauty\"}", "a013|off|4": "{\"label\": \"beauty\"}", "a014": "{\"label\": \"travel\"}", "a014|off|2": "{\"label\": \"travel\"}", "a014|off|3": "{\"label\": \"travel\"}", "a014|off|4": "{\"label\": \"travel\"}", "a015": "{\"label\": \"cafe\"}", "a015|off|2": "{\"label\": \"cafe\"}", "a015|off|3": "{\"label\": \"cafe\"}", "a015|off|4": "{\"label\": \"cafe\"}", "a016": "{\"label\": \"camping\"}", "a016|off|2": "{\"label\": \"camping\"}", "a016|off|3": "{\"label\": \"camping\"}", "a016|off|4": "{\"label\": \"camping\"}", "a017": "{\"label\": \"running\"}", "a017|off|2": "{\"label\": \"running\"}", "a017|off|3": "{\"label\": \"running\"}", "a017|off|4": "{\"label\": \"running\"}", "a018": "{\"label\": \"gaming\"}", "a018|off|2": "{\"label\": \"gaming\"}", "a018|off|3": "{\"label\": \"gaming\"}", "a018|off|4": "{\"label\": \"gaming\"}", "a019": "{\"label\": \"travel\"}", "a019|off|2": "{\"label\": \"travel\"}", "a019|off|3": "{\"label\": \"travel\"}", "a019|off|4": "{\"label\": \"travel\"}", "a020": "{\"label\": \"parenting\"}", "a020|off|2": "{\"label\": \"parenting\"}", "a020|off|3": "{\"label\": \"parenting\"}", "a020|off|4": "{\"label\": \"parenting\"}", "a021": "{\"label\": \"travel\"}", "a021|off|2": "{\"label\": \"travel\"}", "a021|off|3": "{\"label\": \"travel\"}", "a021|off|4": "{\"label\": \"travel\"}", "a022": "{\"label\": \"camping\"}", "a022|off|2": "{\"label\": \"camping\"}", "a022|off|3": "{\"label\": \"camping\"}", "a022|off|4": "{\"label\": \"camping\"}", "a023": "{\"label\": \"cafe\"}", "a023|off|2": "{\"label\": \"cafe\"}", "a023|off|3": "{\"label\": \"cafe\"}", "a023|off|4": "{\"label\": \"cafe\"}", "a024": "{\"label\": \"running\"}", "a024|off|2": "{\"label\": \"running\"}", "a024|off|3": "{\"label\": \"running\"}", "a024|off|4": "{\"label\": \"running\"}", "a025": "{\"label\": \"beauty\"}", "a025|off|2": "{\"label\": \"beauty\"}", "a025|off|3": "{\"label\": \"beauty\"}", "a025|off|4": "{\"label\": \"beauty\"}", "a026": "{\"label\": \"parenting\"}", "a026|off|2": "{\"label\": \"parenting\"}", "a026|off|3": "{\"label\": \"parenting\"}", "a026|off|4": "{\"label\": \"parenting\"}", "a027": "{\"label\": \"finance\"}", "a027|off|2": "{\"label\": \"finance\"}", "a027|off|3": "{\"label\": \"finance\"}", "a027|off|4": "{\"label\": \"finance\"}", "a028": "{\"label\": \"camping\"}", "a028|off|2": "{\"label\": \"camping\"}", "a028|off|3": "{\"label\": \"camping\"}", "a028|off|4": "{\"label\": \"camping\"}", "a029": "{\"label\": \"parenting\"}", "a029|off|2": "{\"label\": \"parenting\"}", "a029|off|3": "{\"label\": \"parenting\"}", "a029|off|4": "{\"label\": \"parenting\"}", "a030": "{\"label\": \"finance\"}", "a030|off|2": "{\"label\": \"finance\"}", "a030|off|3": "{\"label\": \"finance\"}", "a030|off|4": "{\"label\": \"finance\"}", "a031": "{\"label\": \"running\"}", "a031|off|2": "{\"label\": \"running\"}", "a031|off|3": "{\"label\": \"running\"}", "a031|off|4": "{\"label\": \"running\"}", "a032": "{\"label\": \"travel\"}", "a032|off|2": "{\"label\": \"travel\"}", "a032|off|3": "{\"label\": \"travel\"}", "a032|off|4": "{\"label\": \"travel\"}", "a033": "{\"label\": \"gaming\"}", "a033|off|2": "{\"label\": \"gaming\"}", "a033|off|3": "{\"label\": \"gaming\"}", "a033|off|4": "{\"label\": \"gaming\"}", "a034": "{\"label\": \"camping\"}", "a034|off|2": "{\"label\": \"camping\"}", "a034|off|3": "{\"label\": \"camping\"}", "a034|off|4": "{\"label\": \"camping\"}", "a035": "{\"label\": \"gaming\"}", "a035|off|2": "{\"label\": \"gaming\"}", "a035|off|3": "{\"label\": \"gaming\"}", "a035|off|4": "{\"label\": \"gaming\"}", "a036": "{\"label\": \"finance\"}", "a036|off|2": "{\"label\": \"finance\"}", "a036|off|3": "{\"label\": \"finance\"}", "a036|off|4": "{\"label\": \"finance\"}", "a037": "{\"label\": \"cafe\"}", "a037|off|2": "{\"label\": \"cafe\"}", "a037|off|3": "{\"label\": \"cafe\"}", "a037|off|4": "{\"label\": \"cafe\"}", "a038": "{\"label\": \"parenting\"}", "a038|off|2": "{\"label\": \"parenting\"}", "a038|off|3": "{\"label\": \"parenting\"}", "a038|off|4": "{\"label\": \"parenting\"}", "a039": "{\"label\": \"parenting\"}", "a039|off|2": "{\"label\": \"parenting\"}", "a039|off|3": "{\"label\": \"parenting\"}", "a039|off|4": "{\"label\": \"parenting\"}", "a040": "{\"label\": \"gaming\"}", "a040|off|2": "{\"label\": \"gaming\"}", "a040|off|3": "{\"label\": \"gaming\"}", "a040|off|4": "{\"label\": \"gaming\"}", "a041": "{\"label\": \"finance\"}", "a042": "{\"label\": \"camping\"}", "a043": "{\"label\": \"finance\"}", "a044": "{\"label\": \"beauty\"}", "a045": "{\"label\": \"cafe\"}", "a046": "{\"label\": \"finance\"}", "a047": "{\"label\": \"running\"}", "a048": "{\"label\": \"running\"}", "a049": "{\"label\": \"parenting\"}", "a050": "{\"label\": \"parenting\"}", "a051": "{\"label\": \"gaming\"}", "a052": "{\"label\": \"running\"}", "a053": "{\"label\": \"gaming\"}", "a054": "{\"label\": \"travel\"}", "a055": "{\"label\": \"travel\"}", "a056": "{\"label\": \"finance\"}", "a057": "{\"label\": \"gaming\"}", "a058": "{\"label\": \"travel\"}", "a059": "{\"label\": \"running\"}", "a060": "{\"label\": \"parenting\"}", "a061": "{\"label\": \"camping\"}", "a062": "{\"label\": \"running\"}", "a063": "{\"label\": \"gaming\"}", "a064": "{\"label\": \"cafe\"}", "a065": "{\"label\": \"parenting\"}", "a066": "{\"label\": \"parenting\"}", "a067": "{\"label\": \"finance\"}", "a068": "{\"label\": \"finance\"}", "a069": "{\"label\": \"cafe\"}", "a070": "{\"label\": \"beauty\"}", "a071": "{\"label\": \"gaming\"}", "a072": "{\"label\": \"beauty\"}", "a073": "{\"label\": \"beauty\"}", "a074": "{\"label\": \"gaming\"}", "a075": "{\"label\": \"travel\"}", "a076": "{\"label\": \"cafe\"}", "a077": "{\"label\": \"parenting\"}", "a078": "{\"label\": \"camping\"}", "a079": "{\"label\": \"travel\"}", "a080": "{\"label\": \"running\"}", "a081": "{\"label\": \"travel\"}", "a082": "{\"label\": \"running\"}", "a083": "{\"label\": \"travel\"}", "a084": "{\"label\": \"cafe\"}", "a085": "{\"label\": \"finance\"}", "a086": "{\"label\": \"running\"}", "a087": "{\"label\": \"gaming\"}", "a088": "{\"label\": \"travel\"}", "a089": "{\"label\": \"running\"}", "a090": "{\"label\": \"beauty\"}", "a091": "{\"label\": \"parenting\"}", "a092": "{\"label\": \"beauty\"}", "a093": "{\"label\": \"cafe\"}", "a094": "{\"label\": \"beauty\"}", "a095": "{\"label\": \"finance\"}", "a096": "{\"label\": \"travel\"}", "a097": "{\"label\": \"camping\"}", "a098": "{\"label\": \"gaming\"}", "a099": "{\"label\": \"finance\"}", "a100": "{\"label\": \"parenting\"}", "a101": "{\"label\": \"gaming\"}", "a102": "{\"label\": \"camping\"}", "a103": "{\"label\": \"camping\"}", "a104": "{\"label\": \"gaming\"}", "a105": "{\"label\": \"parenting\"}", "a106": "{\"label\": \"travel\"}", "a107": "{\"label\": \"parenting\"}", "a108": "{\"label\": \"gaming\"}", "a109": "{\"label\": \"camping\"}", "a110": "{\"label\": \"parenting\"}", "a111": "{\"label\": \"travel\"}", "a112": "{\"label\": \"travel\"}", "a113": "{\"label\": \"running\"}", "a114": "{\"label\": \"parenting\"}", "a115": "{\"label\": \"parenting\"}", "a116": "{\"label\": \"gaming\"}", "a117": "{\"label\": \"camping\"}", "a118": "{\"label\": \"finance\"}", "a119": "{\"label\": \"beauty\"}", "a120": "{\"label\": \"travel\"}", "a121": "{\"label\": \"gaming\"}", "a122": "{\"label\": \"beauty\"}", "a123": "{\"label\": \"camping\"}", "a124": "{\"label\": \"beauty\"}", "a125": "{\"label\": \"cafe\"}", "a126": "{\"label\": \"travel\"}", "a127": "{\"label\": \"parenting\"}", "a128": "{\"label\": \"finance\"}", "a129": "{\"label\": \"gaming\"}", "a130": "{\"label\": \"parenting\"}", "a131": "{\"label\": \"camping\"}", "a132": "{\"label\": \"cafe\"}", "a133": "{\"label\": \"finance\"}", "a134": "{\"label\": \"camping\"}", "a135": "{\"label\": \"gaming\"}", "a136": "{\"label\": \"beauty\"}", "a137": "{\"label\": \"running\"}", "a138": "{\"label\": \"finance\"}", "a139": "{\"label\": \"cafe\"}", "a140": "{\"label\": \"cafe\"}", "a141": "{\"label\": \"beauty\"}", "a142": "{\"label\": \"running\"}", "a143": "{\"label\": \"running\"}", "a144": "{\"label\": \"finance\"}", "a145": "{\"label\": \"camping\"}", "a146": "{\"label\": \"running\"}", "a147": "{\"label\": \"gaming\"}", "a148": "{\"label\": \"travel\"}", "a149": "{\"label\": \"beauty\"}", "a150": "{\"label\": \"parenting\"}", "a151": "{\"label\": \"finance\"}", "a152": "{\"label\": \"gaming\"}", "a153": "{\"label\": \"running\"}", "a154": "{\"label\": \"running\"}", "a155": "{\"label\": \"running\"}", "a156": "{\"label\": \"beauty\"}", "a157": "{\"label\": \"finance\"}", "a158": "{\"label\": \"running\"}", "a159": "{\"label\": \"finance\"}", "a160": "{\"label\": \"beauty\"}", "a161": "{\"label\": \"camping\"}", "a162": "{\"label\": \"beauty\"}", "a163": "{\"label\": \"cafe\"}", "a164": "{\"label\": \"beauty\"}", "a165": "{\"label\": \"camping\"}", "a166": "{\"label\": \"gaming\"}", "a167": "{\"label\": \"running\"}", "a168": "{\"label\": \"parenting\"}", "a169": "{\"label\": \"travel\"}", "a170": "{\"label\": \"cafe\"}", "a171": "{\"label\": \"camping\"}", "a172": "{\"label\": \"beauty\"}", "a173": "{\"label\": \"cafe\"}", "a174": "{\"label\": \"travel\"}", "a175": "{\"label\": \"cafe\"}", "a176": "{\"label\": \"finance\"}", "a177": "{\"label\": \"travel\"}", "a178": "{\"label\": \"cafe\"}", "a179": "{\"label\": \"cafe\"}", "a180": "{\"label\": \"parenting\"}", "a181": "{\"label\": \"cafe\"}", "a182": "{\"label\": \"parenting\"}", "a183": "{\"label\": \"beauty\"}", "a184": "{\"label\": \"cafe\"}", "a185": "{\"label\": \"camping\"}", "a186": "{\"label\": \"gaming\"}", "a187": "{\"label\": \"cafe\"}", "a188": "{\"label\": \"finance\"}", "a189": "{\"label\": \"finance\"}", "a190": "{\"label\": \"camping\"}", "a191": "{\"label\": \"camping\"}", "a192": "{\"label\": \"travel\"}", "a193": "{\"label\": \"finance\"}", "a194": "{\"label\": \"gaming\"}", "a195": "{\"label\": \"finance\"}", "a196": "{\"label\": \"camping\"}", "a197": "{\"label\": \"travel\"}", "a198": "{\"label\": \"camping\"}", "a199": "{\"label\": \"cafe\"}", "a200": "{\"label\": \"running\"}"}
USAGE = {"requests": 320, "prompt_tokens": 47214, "output_tokens": 2126, "elapsed_ms": 275517}   # 같은 기록의 항목 320개를 더한 값


def llm_label(key):
    try:
        label = json.loads(RECORD[key])['label']
    except (ValueError, KeyError, TypeError):
        return None                            # JSON 이 아니거나 label 이 없으면 틀린 답으로 센다
    return label if label in LABELS else None


llm = {a['id']: llm_label(a['id']) for a in articles}
print(f'기록 {len(RECORD)}개, 요청 {USAGE["requests"]}건, 라벨로 읽지 못한 답 {sum(llm_label(k) is None for k in RECORD)}건')

# 2단계: 사람 라벨과 견준다
# 헷갈리는 글은 제목의 관심사(사람 라벨)와 첫 문장의 관심사 가운데 어느 쪽을 골랐는지 따로 센다.
print('LLM 200건: precision %.2f, recall %.2f' % average(articles, llm))
p, r = average(test, llm)
print(f'LLM 평가 40건: precision {p:.2f}, recall {r:.2f}, 틀린 글 {[a["id"] for a in test if llm[a["id"]] != a["label"]]}')
clear = [a for a in articles if not a['mixed']]
print(f'헷갈리지 않는 글 {len(clear)}건 중 맞힘 {sum(llm[a["id"]] == a["label"] for a in clear)}건')
print(f'헷갈리는 글 {len(mixed)}건: 제목의 관심사 {sum(llm[a["id"]] == a["label"] for a in mixed)}건, '
      f'첫 문장의 관심사 {sum(llm[a["id"]] == a["mixed"] for a in mixed)}건')
for a in test:
    if model[a['id']] != a['label']:
        print(f'모델이 틀린 {a["id"]}: 사람 {a["label"]}, 모델 {model[a["id"]]}, LLM {llm[a["id"]]}')

# 3단계: 다시 물은 40건을 견준다
# temperature 0.7 로 3번 더 물었고 seed 는 9, 10, 11 이다. 네 답 가운데 하나라도 다르면 바뀐 글로 센다.
def answers(i):
    return [llm[i]] + [llm_label(f'{i}|off|{run}') for run in (2, 3, 4)]


changed = [a['id'] for a in test if len(set(answers(a['id']))) > 1]
print(f'평가 40건 × 4번: 답이 바뀐 글 {len(changed)}건')
for a in test:
    if a['mixed']:
        print(f'{a["id"]} 사람 {a["label"]}: 네 답 {answers(a["id"])}')

# 4단계: 토큰과 비용을 센다
# 가상 단가다. 작은 상용 모델이 100만 토큰에 입력 400원, 출력 1,600원을 받는다고 둔다.
n = USAGE['requests']
won = (USAGE['prompt_tokens'] * 400 + USAGE['output_tokens'] * 1600) / 1e6
print(f'요청 {n}건: 입력 토큰 {USAGE["prompt_tokens"]:,}개, 출력 토큰 {USAGE["output_tokens"]:,}개, {won:.1f}원')
print(f'건당 입력 {USAGE["prompt_tokens"] / n:.1f} 토큰, 출력 {USAGE["output_tokens"] / n:.2f} 토큰, '
      f'{won / n:.5f}원, {USAGE["elapsed_ms"] / n:.0f}ms')
print(f'글 100만 건이면 {won / n * 1e6:,.0f}원')

# 5단계: 섞어 쓴다
# 규칙이 붙인 라벨은 그대로 쓰고, 못 붙인 글은 모델이 매긴다. 모델의 가장 높은 점수가 0.5 아래인 글만 LLM 에 묻는다.
mix, asked = {}, []
for a in test:
    i = a['id']
    if rule[i]:
        mix[i] = rule[i]
    elif top_score[i] >= 0.5:
        mix[i] = model[i]
    else:
        mix[i] = llm[i]
        asked.append(i)
by_rule = sum(1 for a in test if rule[a['id']])
print(f'평가 40건: 규칙 {by_rule}건, 모델 {len(test) - by_rule - len(asked)}건, LLM {len(asked)}건')
p, r = average(test, mix)
wrong = [a['id'] for a in test if mix[a['id']] != a['label']]
print(f'섞어 쓰기: precision {p:.2f}, recall {r:.2f}, 맞힘 {len(test) - len(wrong)}건, 틀린 글 {wrong}')
print(f'LLM 비용: 섞어 쓰기 {len(asked) * won / n:.2f}원, LLM 만 쓰면 {len(test) * won / n:.2f}원')
print(f'LLM 에 물은 {len(asked)}건 중 LLM 과 모델의 답이 다른 글 {sum(llm[i] != model[i] for i in asked)}건')
student = {label: train_one(label, llm) for label in LABELS}   # 학습 160건의 라벨을 LLM 의 답으로 바꿔 배운다
pred = {a['id']: max(LABELS, key=scores(student, a).get) for a in test}
wrong = [a['id'] for a in test if pred[a['id']] != a['label']]
print(f'LLM 라벨로 배운 모델: 학습 라벨 중 사람과 다른 것 {sum(llm[a["id"]] != a["label"] for a in train)}건, '
      f'평가 40건 맞힘 {len(test) - len(wrong)}건, 틀린 글 {wrong}')
# 출력:
# 1단계 뜻: 상수의 키 320개가 기록의 요청 320건과 같고, 모든 답이 라벨 8개 가운데 하나로 읽힌다.
# 기록 320개, 요청 320건, 라벨로 읽지 못한 답 0건
# 2단계 뜻: 헷갈리지 않는 글은 모두 맞고, 헷갈리는 글은 20건 중 16건이 첫 문장의 관심사를 골랐다. 모델이 틀린 두 글은 LLM 이 맞혔다.
# LLM 200건: precision 0.92, recall 0.92
# LLM 평가 40건: precision 0.96, recall 0.95, 틀린 글 ['a012', 'a039']
# 헷갈리지 않는 글 180건 중 맞힘 180건
# 헷갈리는 글 20건: 제목의 관심사 4건, 첫 문장의 관심사 16건
# 모델이 틀린 a009: 사람 beauty, 모델 parenting, LLM beauty
# 모델이 틀린 a020: 사람 parenting, 모델 cafe, LLM parenting
# 3단계 뜻: temperature 0.7 로 3번 더 물어도 바뀐 글은 없다. 평가용의 헷갈리는 두 글은 네 번 모두 같은 답이고, 네 번 모두 사람 라벨과 다르다.
# 평가 40건 × 4번: 답이 바뀐 글 0건
# a012 사람 running: 네 답 ['beauty', 'beauty', 'beauty', 'beauty']
# a039 사람 finance: 네 답 ['parenting', 'parenting', 'parenting', 'parenting']
# 4단계 뜻: 요청 한 건은 입력 147.5 토큰과 출력 6.64 토큰이라 가상 단가로 0.06965원이고, 이 맥에서 평균 861ms 가 걸렸다.
# 요청 320건: 입력 토큰 47,214개, 출력 토큰 2,126개, 22.3원
# 건당 입력 147.5 토큰, 출력 6.64 토큰, 0.06965원, 861ms
# 글 100만 건이면 69,648원
# 5단계 뜻: LLM 에 10건만 물어도 맞힌 수는 LLM 만 쓴 때와 같은 38건이고 LLM 비용은 4분의 1 이다. LLM 라벨로 배운 모델도 38건을 맞힌다.
# 평가 40건: 규칙 23건, 모델 7건, LLM 10건
# 섞어 쓰기: precision 0.96, recall 0.95, 맞힘 38건, 틀린 글 ['a012', 'a039']
# LLM 비용: 섞어 쓰기 0.70원, LLM 만 쓰면 2.79원
# LLM 에 물은 10건 중 LLM 과 모델의 답이 다른 글 4건
# LLM 라벨로 배운 모델: 학습 라벨 중 사람과 다른 것 14건, 평가 40건 맞힘 38건, 틀린 글 ['a009', 'a039']
```

200건의 답은 모두 JSON 으로 읽혔고, 정해 둔 라벨 밖의 답이나 덧붙인 글은 없었습니다. 헷갈리지 않는 180건은 모두 사람 라벨과 같았습니다. 모델이 틀린 쿠션 팩트 글과 그림책 글도 LLM 은 beauty 와 parenting 으로 맞혔습니다. LLM 은 「쿠션 팩트」와 「젖병 소독」을 학습 160건이 아니라 미리 읽은 많은 글에서 압니다. 코드 뒤쪽의 비용과 섞어 쓰기는 다음 두 절에서 봅니다.

<div class="demo-embed-wrap">
<iframe class="demo-embed" src="demo-interest-cards.html?embed=1&card=llm" height="480" loading="lazy" title="시스템 메시지 한 장과 글 한 건에 돌아오는 JSON 한 줄"></iframe>
<a class="demo-embed-open" href="demo-interest-cards.html" target="_blank" rel="noopener">↗ 카드 네 장 전체로 열기</a>
</div>

헷갈리는 글 20건에서는 사람과 기준이 달랐습니다. 16건이 첫 문장의 관심사를 골라서, 종아리 마사지 글에는 beauty 를, 금리 인하 글에는 parenting 을 붙였습니다. 사람 라벨은 제목을 따르기로 했지만, 그 기준을 프롬프트에 적지 않았습니다. 적지 않은 기준은 LLM 이 알 수 없습니다. Bing 의 2023년 논문도 프롬프트를 바꾸거나 같은 뜻의 다른 문장으로 바꿔 쓰기만 해도 라벨의 정확도가 달라진다고 적었습니다.

평가 40건은 temperature 0.7 로 3번 더 물었고, 그때마다 seed 를 바꿨습니다. 이 값이면 점수가 가장 높지 않은 토큰도 뽑힐 수 있습니다. 그래도 답이 바뀐 글은 0건이었고, 120개 답이 처음 답과 글자까지 같았습니다. 라벨 한 낱말은 고를 토큰이 적어서, 가장 높은 토큰이 크게 앞서면 흔들어도 같은 토큰이 뽑힙니다. 이유 문장처럼 긴 답은 토큰마다 고를 자리가 있어서, 같은 temperature 에서도 글자가 달라지기 쉽습니다. 이 글의 기록은 라벨만 받았으므로, 긴 답의 흔들림은 LLM 기초 트랙의 글에서 기록으로 봅니다.

## 5. 셋을 한 표에: precision, recall, 건당 비용, 지연

**평가 40건에서 분류 모델과 LLM 은 둘 다 38건을 맞히고, 규칙은 23건을 맞히고 17건을 비워 둡니다. 크게 다른 것은 값입니다. 규칙과 모델은 한 건에 돈과 시간이 거의 들지 않고, LLM 은 가상 단가로 0.070원과 0.86초가 듭니다.**

LLM 의 건당 비용은 기록에 남은 토큰 수로 셉니다. 요청 한 건에 입력 147.5 토큰과 출력 6.64 토큰이 들었습니다. 작은 상용 모델이 100만 토큰에 입력 400원, 출력 1,600원을 받는다는 가상 단가를 곱하면 건당 0.06965원입니다. 글의 다른 자리에서는 반올림한 0.070원으로 적습니다. 입력이 대부분인데, 모든 요청에 같은 시스템 메시지가 같이 가기 때문입니다.

지연(latency)은 요청 한 건을 보내고 답을 받기까지 걸린 시간입니다. 이 맥의 LLM 은 한 건에 평균 861ms 가 걸렸습니다. 규칙과 모델은 사전 찾기와 덧셈 몇 번이라 이보다 훨씬 짧게 끝납니다. 광고 요청 한 건에 쓸 수 있는 시간은 [모델 API](post.html?id=model-api-from-training-script) 편의 12ms 라서, LLM 을 광고 요청마다 그 자리에서 부를 수는 없습니다.

표의 마지막 칸도 값입니다. 규칙은 사람이 키워드 25개를 적어야 하고, 모델은 사람이 라벨을 붙인 160건이 있어야 배웁니다. LLM 은 프롬프트 한 장이면 되지만, 그 프롬프트에 적은 것만 따릅니다. 표에서 모델의 비용이 거의 0원인 것은 라벨 160건이 이미 있을 때의 값입니다.

| 방법 (평가 40건) | precision | recall | 건당 비용 | 지연 | 먼저 있어야 하는 것 |
|---|---|---|---|---|---|
| 규칙 | 1.00 | 0.57 (23/40) | 거의 0원 | 거의 없음 | 사람이 적은 키워드 25개 |
| 분류 모델 | 0.95 | 0.95 | 거의 0원 | 거의 없음 | 사람 라벨이 붙은 학습 글 160건 |
| LLM | 0.96 | 0.95 | 0.070원 (가상 단가) | 861ms (이 맥) | 프롬프트 한 장 |

38건이 같아도 틀린 글은 다릅니다. 모델은 학습에 없던 낱말이 든 두 글을 틀렸습니다. LLM 은 제목과 첫 문장이 다른 관심사를 말하는 두 글을 틀렸는데, 제목을 따른다는 사람 기준을 프롬프트에 적지 않아서입니다. 그래서 둘을 섞으면 서로 틀린 자리를 메울 수 있어 보이고, 그것을 해 본 것이 6절입니다.

<div class="demo-embed-wrap">
<iframe class="demo-embed" src="demo-interest-cards.html?embed=1&card=compare" height="480" loading="lazy" title="평가 40건의 precision, recall, 건당 비용 막대 셋"></iframe>
<a class="demo-embed-open" href="demo-interest-cards.html" target="_blank" rel="noopener">↗ 카드 네 장 전체로 열기</a>
</div>

건당 0.070원은 작아 보여도 무엇에 곱하느냐에 따라 다릅니다. 글 100만 건에 한 번씩 붙이면 약 7만 원입니다. 하지만 하루 노출 2억 2,800만 건마다 그 자리에서 부르면, 건당 0.06965원을 곱해 하루 약 1,588만 원입니다. 걸리는 시간도 요청 예산의 70배가 넘습니다. 그래서 LLM 은 글이 올라올 때 한 번 라벨을 붙이고, 광고 요청 때는 붙여 둔 라벨을 읽기만 합니다.

## 6. 섞어 쓰기: 규칙으로 거르고 모델로 매기고 LLM 은 애매한 것만

**규칙이 붙인 23건은 그대로 두고 남은 글은 모델이 매기되, 가장 높은 점수가 0.5 아래인 10건만 LLM 에 묻습니다. 그러면 평가 40건 중 38건을 맞혀, LLM 만 쓸 때와 같은 수를 LLM 호출 4분의 1 로 맞힙니다.**

섞는 순서는 싼 것부터입니다. 규칙이 라벨을 붙인 글은 그 라벨을 쓰는데, 평가 40건에서 규칙이 붙인 23건은 모두 맞았습니다. 규칙이 비워 둔 17건은 모델이 매기고, 가장 높은 점수가 0.5 이상이면 모델의 답을 씁니다. 점수 0.5 는 그 관심사일 가능성과 아닐 가능성이 같아지는 자리입니다. 그 아래면 모델도 확신하지 못한 글이라 LLM 에 묻습니다. 아래 표의 숫자는 앞 절들의 코드가 찍은 값이고, 섞어 쓴 두 줄은 4절 코드의 마지막 단계가 셉니다.

| 방법 | LLM 에 물은 글 | 맞힌 글 (평가 40건) | 틀린 글 |
|---|---|---|---|
| 규칙만 | 0건 | 23건 | 없음, 대신 17건이 비어 있다 |
| 분류 모델만 | 0건 | 38건 | 쿠션 팩트 글, 그림책 글 |
| LLM 만 | 40건 | 38건 | 종아리 마사지 글, 금리 인하 글 |
| 규칙, 모델, 애매한 것만 LLM | 10건 | 38건 | 종아리 마사지 글, 금리 인하 글 |
| LLM 라벨로 배운 모델 | 평가 때는 0건, 학습 글 160건의 라벨이 LLM 의 답 | 38건 | 쿠션 팩트 글, 금리 인하 글 |

모델이 확신한 7건은 모두 맞았고, LLM 에 물은 10건에는 모델이 틀린 쿠션 팩트 글과 그림책 글이 들어 있었습니다. LLM 은 둘을 맞혔지만, 같이 넘어간 종아리 마사지 글과 금리 인하 글을 첫 문장의 관심사로 바꿨습니다. 모델은 이 두 글을 0.5 아래의 낮은 점수로 맞히고 있었습니다. 그래서 맞힌 수는 38건 그대로이고, 달라진 것은 LLM 을 부른 횟수입니다.

LLM 에 물은 10건 가운데 4건은 LLM 과 모델의 답이 달랐고, 그중 2건은 LLM 이, 2건은 모델이 맞았습니다. 두 답이 다른 글만 사람이 한 번 더 보면, 사람이 읽는 4건으로 40건이 모두 사람 라벨과 같아집니다. 답이 둘로 나뉜 글은 기계가 고르기보다 사람이 볼 글입니다.

LLM 을 쓰는 다른 자리는 모델의 학습 라벨입니다. 학습 160건의 라벨을 사람 대신 LLM 의 답으로 바꿔 배운 모델도 평가 40건 중 38건을 맞혔습니다. 사람과 다른 학습 라벨 14건은 모두 헷갈리는 글이었고, 나머지 146건은 사람 라벨과 같았습니다. Pinterest 의 2024년 논문도 LLM 으로 만든 관련성 모델을 교사 모델(teacher)로 둡니다. 그리고 그 답으로 실시간 서빙이 되는 작은 모델을 배운다고 밝혔습니다.

어느 방법이든 마지막에 남는 것은 헷갈리는 글의 기준입니다. 사람이 제목을 따른다는 기준을 프롬프트에도 적고, 사람이 다시 본 일부 글로 LLM 의 답을 가끔 다시 잽니다. 여기까지의 셈은 글이 손에 있고 시간이 넉넉할 때의 것이고, 무대가 바뀌면 그 전제가 달라집니다.

## 7. 라벨을 붙일 글이 누구 것이냐가 무대마다 다릅니다

**담장 안에서는 글이 플랫폼에 올라오므로, 올라올 때 한 번 라벨을 붙여 두고 회원이 읽은 기록과 잇습니다. 열린 RTB 에서는 남의 지면에 광고를 사므로, 입찰 요청에 실린 카테고리를 쓰거나 지면을 미리 읽어 라벨을 붙여 둡니다.**

1~6절은 글 200건이 손에 있고 라벨을 붙일 시간도 넉넉하다는 전제 위에 있었습니다. 글이 누구 것이냐에 따라 그 전제가 무대마다 다릅니다.

### 담장 안에서는 글이 올라올 때 한 번 붙입니다 [무대: 닫힌 생태계]

한 회사가 앱과 광고 서버를 다 가진 담장 안에서는 글도 그 회사의 서비스에 올라옵니다. 그래서 글이 올라올 때 라벨을 한 번 붙여 글 정보와 같이 저장해 두면 됩니다. 회원 A 가 그 글을 읽으면 행동 로그에 글 번호가 남고, 새벽 배치가 그 글의 라벨로 「러닝 글」 횟수를 셉니다.

LLM 을 쓰는 자리도 여기입니다. 글 100만 건이면 약 7만 원이라, 관심사 목록이 바뀌어 모든 글을 다시 붙여도 값이 크지 않습니다. 다만 다시 붙이면 라벨이 바뀐 글을 읽은 회원의 세그먼트도 바뀝니다. 그래서 바뀐 글이 몇 건이고 세그먼트가 몇 명 달라지는지를 먼저 셉니다.

### 열린 RTB 에서는 남의 지면을 미리 읽어 둡니다 [무대: 열린 RTB]

열린 RTB 에서 광고를 사는 쪽의 시스템을 DSP 라고 부릅니다. DSP 는 남의 지면에 광고를 사므로 글이 자기 것이 아니고, 입찰 요청에는 지면의 주소와 매체가 적은 카테고리가 실려 옵니다. 입찰 요청의 표준 형식인 OpenRTB 2.6 은 `site.page` 에 지면 주소를 담습니다. `site.cat` 과 `site.pagecat` 에는 광고 업계의 표준 단체인 IAB Tech Lab 이 정한 콘텐츠 카테고리를 담습니다.

매체가 적은 카테고리는 비어 있거나 사이트 전체에 하나만 붙어 있기도 합니다. 그래서 DSP 는 처음 본 주소를 따로 읽어 라벨을 붙이고 캐시해 둡니다. 입찰 응답은 100ms 안팎에 돌려줘야 해서 그 자리에서 LLM 을 부를 시간이 없고, 처음 본 지면은 라벨 없이 지나갑니다. 지면의 글로 광고를 고르는 이 방식이 17주째의 컨텍스추얼 타겟팅입니다. 아래 표는 가상 데이터가 아니라 두 무대의 설계 차이를 적은 것입니다.

| 무엇 | 담장 안 | 열린 RTB |
|---|---|---|
| 라벨을 붙일 글 | 우리 서비스에 올라온 글 | 남의 지면, 입찰 요청에 주소로 온다 |
| 붙이는 때 | 글이 올라올 때 한 번 | 처음 본 주소를 미리 읽고 캐시 |
| 라벨 이름 | 우리가 정한 관심사 8개 | IAB Tech Lab 의 콘텐츠 카테고리 |
| 광고 요청 때 하는 일 | 저장해 둔 라벨을 읽는다 | 요청에 실린 카테고리나 캐시를 읽는다 |

다음 편은 15주째의 Lookalike 계산입니다. 이 글의 라벨로 센 「러닝 글」 횟수가 유저 프로파일 편의 8차원 벡터에 들어갑니다. 15주째에는 그 벡터로, 광고주가 고른 회원들과 닮은 회원을 찾습니다.

## 한눈 정리

| 자리 | 무엇을 하나 | 숫자 |
|---|---|---|
| 글 200건 | 제목과 첫 문장, 관심사 8개에 25건씩, 사람 라벨은 제목의 관심사 | 헷갈리는 글 20건, 평가 40건, 학습 160건 |
| 규칙 | 키워드 25개 사전에서 처음 맞는 관심사를 붙인다 | 200건 중 114건 맞힘, 79건 비움 |
| 분류 모델 | 단어 가방과 로지스틱 회귀 8개, 경사 하강 200번 | 평가 40건 중 38건, 학습에 없던 낱말에서 틀림 |
| LLM | 시스템 메시지 한 장, temperature 0 | 180건 모두 맞음, 헷갈리는 20건 중 16건은 첫 문장을 따름 |
| 다시 묻기 | 평가 40건을 temperature 0.7 로 3번 더 묻는다 | 바뀐 글 0건 |
| 비용과 지연 | 기록의 토큰 수에 가상 단가를 곱한다 | 건당 0.070원, 861ms |
| 섞어 쓰기 | 규칙, 모델, 점수 0.5 아래만 LLM | LLM 10건으로 38건 |

## 헷갈리기 쉬운 점

- **precision 이 낮은 쪽이 대개 더 비쌉니다.** precision 이 낮으면 러닝 글이 아닌 글이 running 을 받습니다. 그 글을 읽은 회원이 「러닝 글 3편 이상」에 들어와, 러닝화 광고비가 그 회원에게 쓰입니다. recall 이 낮으면 러닝 글을 읽은 회원이 빠져 도달이 줄어듭니다. 세그먼트 317 처럼 160만 명이 남는 조건이면 몇 명 빠져도 손해가 적습니다. 회원이 적어 예산을 다 못 쓰는 캠페인이면 recall 쪽이 비싸집니다.
- **LLM 라벨의 흔들림은 오류가 아니라 재야 하는 값입니다.** 이번에는 0건이었지만, 0 이라는 것도 같은 글을 다시 물어 봐야 압니다. 그리고 바뀌지 않는다고 맞는 것은 아닙니다. 종아리 마사지 글은 네 번 모두 beauty 였고, 네 번 모두 사람 라벨과 달랐습니다. 흔들림은 같은 글을 여러 번 물어 재고, 맞는지는 사람 라벨과 견줘 따로 잽니다.
- **라벨 비용과 서빙 비용은 다릅니다.** 라벨은 글마다 한 번이라 100만 건에 약 7만 원이고, 붙인 라벨은 그 글을 읽은 회원이 몇 명이든 다시 쓰입니다. 광고 요청마다 LLM 을 부르면 건당 0.06965원이 노출 2억 2,800만 건만큼 곱해져 하루 약 1,588만 원입니다. 861ms 는 요청 예산 12ms 의 70배가 넘습니다. 그래서 LLM 은 라벨을 만드는 자리에 두고, 요청 때는 저장해 둔 라벨을 읽습니다.
- **모델의 거의 0원에는 사람 라벨 160건이 빠져 있습니다.** 모델은 한 건에 값이 거의 들지 않지만, 배우기 전에 사람이 160건을 읽고 라벨을 붙였습니다. LLM 의 라벨로 배운 모델도 38건을 맞혔으니, 그 160건을 LLM 에 맡기는 길도 있습니다.

## 더 깊이 보기

:::deep one-vs-rest 로지스틱 회귀의 식과 경사 하강 한 번
글의 단어 가방을 $x_j \in \{0, 1\}$ 로 쓰면, 관심사 $c$ 의 점수는 아래와 같습니다. $x_j$ 는 사전의 $j$ 번째 낱말이 글에 있으면 1 입니다.

$$p_c(x) = \sigma\Big(b_c + \sum_j w_{cj}\, x_j\Big), \qquad \sigma(z) = \frac{1}{1 + e^{-z}}$$

라벨은 점수 8개 가운데 가장 큰 관심사입니다.

$$\hat{c} = \arg\max_c \; p_c(x)$$

관심사마다 손실은 학습 $n$ 건의 로그 손실입니다. $y_{ic}$ 는 $i$ 번째 글의 사람 라벨이 $c$ 면 1, 아니면 0 입니다.

$$L_c = -\frac{1}{n}\sum_{i=1}^{n} \Big[\, y_{ic}\log p_c(x_i) + (1 - y_{ic})\log\big(1 - p_c(x_i)\big) \Big]$$

가중치 하나의 기울기는 점수와 정답의 차이에, 그 낱말이 글에 있었나를 곱해 평균한 값입니다.

$$\frac{\partial L_c}{\partial w_{cj}} = \frac{1}{n}\sum_{i=1}^{n} \big(p_c(x_i) - y_{ic}\big)\, x_{ij}, \qquad w_{cj} \leftarrow w_{cj} - \eta \, \frac{\partial L_c}{\partial w_{cj}}$$

코드의 `err` 가 $p_c(x_i) - y_{ic}$ 이고, 학습률 $\eta$ 는 2 입니다. 블록의 lr 을 0.5 로 낮추면 200번으로는 덜 배워서 평가 40건 중 33건에 그칩니다. 2 에서는 2,000번을 돌린 것과 같은 38건이 나옵니다. $x_{ij} = 0$ 인 글은 그 낱말의 기울기에 아무것도 더하지 않습니다. 그래서 학습 글에 드물게 나온 낱말은 가중치가 조금만 움직이고, 한 번도 안 나온 낱말은 사전에조차 없습니다.

점수 8개는 따로 배운 모델의 값이라 더해도 1 이 되지 않습니다. 심박수 구간 글에서 찍힌 점수를 다 더하면 0.80 입니다. 합이 1 이 되게 하려면 점수 8개를 한 번에 소프트맥스로 나누는 다항 로지스틱 회귀를 씁니다. 소프트맥스는 점수마다 지수를 취하고 그 합으로 나누는 함수입니다. scikit-learn 에서 이 글과 같은 구조는 `OneVsRestClassifier(LogisticRegression())` 입니다. 다만 그쪽은 기본값으로 가중치를 작게 누르는 L2 규제가 붙습니다.
:::

:::deep 토큰 비용 식과, 한 건이 0.070원이 되는 셈
요청 한 건의 입력 토큰 수를 $t_{\mathrm{in}}$, 출력 토큰 수를 $t_{\mathrm{out}}$ 이라고 둡니다. 100만 토큰당 가상 단가로 비용은 아래와 같습니다.

$$\text{비용} = \frac{400\, t_{\mathrm{in}} + 1600\, t_{\mathrm{out}}}{10^{6}} \;\text{원}$$

이 기록은 요청 320건에 입력 47,214 토큰과 출력 2,126 토큰을 썼습니다. 건당으로는 $t_{\mathrm{in}} = 147.54$, $t_{\mathrm{out}} = 6.644$ 입니다.

입력 쪽이 0.05902원, 출력 쪽이 0.01063원이라 합이 0.06965원이고, 입력 쪽이 85% 를 차지합니다.

시스템 메시지 1,000 토큰과 사용자 메시지 200 토큰을 보내 150 토큰의 답을 받는 요청을 생각해 봅니다. 같은 단가로 0.48원과 0.24원을 더해 0.72원입니다. 이 글의 요청은 입력이 짧고 답이 라벨 하나라서 그 10분의 1 이 안 됩니다.

광고 요청마다 부르면 하루 노출 2억 2,800만 건에 0.06965원을 곱해 하루 약 1,588만 원입니다. 글이 올라올 때 한 번 붙이면 글 수에만 곱합니다.

토큰 수는 기록한 모델의 토크나이저, 곧 글을 토큰으로 자르는 규칙으로 센 값입니다. 상용 모델에 같은 글을 보내면 토큰 수가 조금 다릅니다. 실제 단가는 쓰는 모델의 가격 문서에서 확인합니다.
:::

- [유저 프로파일 피처](post.html?id=user-profile-features) — 이 글의 라벨로 센 「러닝 글」이 들어가는 8차원 벡터와, 세그먼트 317 의 조건 셋입니다.
- [오디언스와 세그먼트](post.html?id=audience-and-segments) — 「러닝 글이나 영상 3번 이상」 조건이 처음 나온 편입니다.
- [모델 API](post.html?id=model-api-from-training-script) — 광고 요청 한 건의 예산 12ms 가 어떻게 나뉘는지 봅니다.
- [Elasticsearch 하이브리드 검색](post.html?id=elasticsearch-hybrid-retrieval) — 글자가 같아야 찾는 BM25 가 「헤드셋」을 0건으로 찾은 자리입니다. 이 글의 규칙에도 같은 한계가 있습니다.
- [관심사 분류 카드 네 장](demo-interest-cards.html) — 이 글의 카드 전체입니다. 카드를 누르면 헷갈리는 것 하나가 더 나옵니다.

## 참고문헌

- Thomas, P., Spielman, S., Craswell, N., Mitra, B. (2023). *Large language models can accurately predict searcher preferences*. arXiv:2309.10621. [arxiv.org](https://arxiv.org/abs/2309.10621). Bing 의 관련성 라벨을 LLM 으로 붙이면 사람 라벨러만큼 맞는다는 보고. 프롬프트를 고치거나 같은 뜻의 문장으로 바꿔 쓰기만 해도 정확도가 달라진다는 관찰.
- Mehrdad, N. 외 (2024). *Large Language Models for Relevance Judgment in Product Search*. SIGIR 2024 LLM4Eval 워크숍, arXiv:2406.00247. [arxiv.org](https://arxiv.org/abs/2406.00247). Walmart 검색의 검색어와 상품 쌍 수백만 개에 붙인 사람 라벨로 LLM 을 미세 조정해, 사람 평가자에 가까운 관련성 판정을 낸 연구.
- Wang, H. 외 (2024). *Improving Pinterest Search Relevance Using Large Language Models*. CIKM 2024 산업 추천 시스템 워크숍, arXiv:2410.17152. [arxiv.org](https://arxiv.org/abs/2410.17152). LLM 으로 만든 관련성 모델을 교사 모델로 두고, 실시간 서빙이 되는 모델로 증류한 방식.
- IAB Tech Lab. *OpenRTB 2.6.* [github.com](https://github.com/InteractiveAdvertisingBureau/openrtb2.x/blob/main/2.6.md). Site 객체의 `page`, `cat`, `pagecat`, `cattax` 필드. cattax 가 없으면 IAB Content Category Taxonomy 1.0 으로 본다.
- Ollama. *Modelfile reference*, PARAMETER 의 temperature 와 seed. [github.com](https://github.com/ollama/ollama/blob/main/docs/modelfile.mdx). seed 를 정해 두면 같은 프롬프트에 같은 글을 낸다는 설명.
