라이브 코딩 면접에서 받은 문제가 「광고 로그에서 광고별 클릭 수를 세어 주세요」 한 줄이라 5분 만에 딕셔너리로 답을 냈는데, 면접관이 「같은 이벤트가 두 번 들어오면요?」, 「최근 10초만 세면요?」, 「상위 2개만 돌려주면요?」를 차례로 묻습니다. 처음 코드를 한 함수에 다 몰아 썼다면 질문마다 반복문 안을 다시 고치다가 앞에서 맞던 답까지 틀리게 됩니다.

ML 엔지니어 면접의 코딩 라운드 가운데에는 대회형 알고리즘 대신 이런 문제를 내는 곳이 있습니다. 동료가 평소에 짜는 코드, 곧 레코드를 읽어 키마다 집계하고, 중복을 지우고, 시간 범위로 거르고, 상태를 들고 있는 작은 클래스를 만드는 일입니다. 틀리는 자리도 알고리즘이 아니라 `=` 와 `+=` 를 바꿔 쓰거나 `None` 과 `0` 을 같은 것으로 다루는 데서 나옵니다.

**요구가 하나씩 늘어나는 실무형 문제에서 코드를 어떻게 나눠 두어야 할까요?**

이 글은 이런 형식을 실무형 라이브 코딩이라고 부르고, 지어낸 광고 로그 14줄로 네 부분짜리 문제 하나를 처음부터 끝까지 풉니다. 요구마다 작은 함수 하나를 두고 광고 id 를 키로 한 딕셔너리로 결과를 넘기면 새 요구가 와도 몇 줄만 바뀌어서, 남은 시간을 경계 입력 확인과 복잡도 설명에 쓸 수 있습니다.

> **한 줄 요약:** 실무형 라이브 코딩은 레코드 집계, 상태가 있는 작은 클래스, 요구가 하나씩 늘어나는 추가 질문 세 가지 모양으로 나옵니다. 요구마다 함수 하나를 두고 광고 id 를 키로 한 딕셔너리를 넘기면, 이 글의 예제에서 중복 제거, 최근 N초, 상위 K 세 요구가 각각 함수 하나만 더합니다. 자주 틀리는 자리는 누적을 덮어쓰는 `=`, `None` 과 `0` 의 혼동, 빈 입력, 정렬되지 않은 시각입니다.

> **골라 읽는 법** — 절이 여덟 개인 글입니다.
>
> - 어떤 문제가 나오는지 → 1절
> - 예제 하나를 네 부분으로 끝까지 → 2~5절
> - LRU 캐시, rate limiter, 스트림 Top-K 클래스 → 6절
> - 경계 입력과 입력 검증 → 7~8절

---

## 1. 실무형 문제의 세 가지 모양

**실무형 문제는 레코드 처리, 상태가 있는 작은 클래스, 요구가 하나씩 늘어나는 추가 질문의 세 모양으로 나옵니다. 셋 다 해시, 덱, 힙 같은 기본 자료구조만으로 풀립니다.**

대회형 문제를 준비한 사람이 이 형식에서 막히는 까닭은 어려운 알고리즘이 아니라 문제의 크기가 정해져 있지 않다는 데 있습니다. 지문이 짧고 입력 형식도 「이런 딕셔너리 목록이 온다」 정도라서, 빈 목록이 올 수 있는지, 같은 id 가 두 번 올 수 있는지, 시각이 정렬되어 있는지를 지원자가 먼저 묻지 않으면 아무도 알려 주지 않습니다. 이런 질문을 앞에서 하는 순서는 [코딩테스트 풀이 순서](post.html?id=algorithm-solving-steps) 편의 「이해」 단계와 같습니다.

| 모양 | 흔한 예 | 쓰는 자료구조 | 자주 틀리는 자리 |
|---|---|---|---|
| 레코드 처리 | 키마다 합계, id 로 중복 제거, 시간 범위 안 개수, 두 목록 조인 | `dict`, `set`, `Counter`, `defaultdict` | 누적 덮어쓰기, 없는 키, 정렬 가정 |
| 상태가 있는 작은 클래스 | LRU 캐시, rate limiter, 스트림 Top-K, 메모리 키-값 저장소 | `OrderedDict`, `deque`, `heapq`, `dict` | 용량 초과 시 지우는 순서, 경계 시각 포함 여부 |
| 추가 질문 라운드 | 집계 → 중복 제거 → 시간 범위 → 상위 K 처럼 요구가 하나씩 늘어남 | 앞 단계의 결과 딕셔너리 | 앞에서 맞던 답이 새 요구 뒤에 틀림 |

레코드 처리에서 두 목록 조인은 노출 로그와 클릭 로그처럼 같은 키를 가진 두 목록을 붙이는 일인데, 한쪽 목록으로 딕셔너리를 만든 뒤 다른 쪽을 돌며 찾으면 길이가 n 과 m 인 두 목록을 O(n + m) 에 붙입니다. LRU 캐시는 용량이 다 차면 가장 오래 쓰지 않은 항목(Least Recently Used)을 지우는 캐시이고, rate limiter 는 정해진 시간 안에 받는 요청 수를 제한하는 장치입니다. 둘 다 6절에서 직접 만듭니다.

세 모양 가운데 이 글이 가장 길게 다루는 것은 셋째 줄입니다. 추가 질문 라운드는 첫째 줄의 레코드 처리를 바탕으로 요구를 하나씩 더하는 형식이라서, 첫 답을 어떻게 나눠 두었는지가 뒤 질문에서 쓰는 시간을 정합니다. 면접에 따라 묻는 순서와 개수는 다르고, 아래 예제의 네 부분은 이 글이 정한 순서입니다.

## 2. 가상 로그와 네 부분 요구

**예제는 이벤트 14줄짜리 가상 광고 로그입니다. 1부 광고별 클릭 수, 2부 중복 이벤트 제거, 3부 최근 N초만 세기, 4부 상위 K 광고 순서로 요구가 늘어납니다.**

이 절의 로그는 설명을 위해 만든 가상 데이터입니다. 이벤트마다 이벤트 id, 시각(초), 광고 id, 종류(`imp` 는 노출, `click` 은 클릭)가 있고, 로그는 시각 순서가 아니라 도착한 순서대로 쌓여 있습니다. 표의 「도착 순서」가 목록 안의 자리이고, 실무 로그에 재전송과 늦은 도착이 섞일 수 있다는 점을 흉내 내려고 일부러 두 가지 문제를 넣었습니다.

| 도착 순서 | 이벤트 id | 시각(초) | 광고 | 종류 | 메모 |
|---|---|---|---|---|---|
| 1 | e01 | 100 | A | imp | |
| 2 | e02 | 101 | A | imp | |
| 3 | e03 | 103 | B | imp | |
| 4 | e04 | 104 | B | click | |
| 5 | e04 | 104 | B | click | 같은 이벤트가 다시 들어옴 |
| 6 | e05 | 106 | B | imp | |
| 7 | e06 | 108 | A | imp | |
| 8 | e07 | 110 | C | imp | |
| 9 | e08 | 112 | A | imp | |
| 10 | e09 | 115 | A | click | |
| 11 | e10 | 117 | B | imp | |
| 12 | e11 | 118 | B | click | |
| 13 | e12 | 119 | C | imp | |
| 14 | e13 | 102 | A | click | 시각은 102 인데 맨 마지막에 도착함 |

첫째 문제는 e04 가 두 번 들어온 것입니다. 이벤트 id 가 같으면 같은 클릭이므로 한 번만 세야 하는데, 중복을 지우지 않으면 B 의 클릭이 2개가 아니라 3개로 잡힙니다. 둘째 문제는 e13 이 시각 102 인데 목록 맨 끝에 있는 것입니다. 「로그는 시각 순서로 쌓인다」고 가정하고 뒤에서부터 읽다가 오래된 시각이 나오면 멈추는 코드는, 맨 끝의 e13 을 보자마자 멈춰서 최근 이벤트를 하나도 세지 못합니다.

손으로 먼저 세어 두면 코드가 맞는지 바로 볼 수 있습니다. 클릭 줄은 e04 두 번, e09, e11, e13 의 5줄이고, 중복을 지우면 A 는 e09 와 e13 으로 2개, B 는 e04 와 e11 로 2개, C 는 0개입니다. 노출은 A 가 e01, e02, e06, e08 로 4개, B 가 e03, e05, e10 으로 3개, C 가 e07, e12 로 2개라서, 클릭률(CTR, 클릭 수를 노출 수로 나눈 값)은 A 가 2를 4로 나눈 0.50, B 가 2를 3으로 나눈 0.67, C 가 0.00 입니다.

네 부분 요구는 이 순서로 옵니다. 1부는 광고별 클릭 수, 2부는 같은 이벤트 id 를 한 번만 세기, 3부는 지금 시각 120 에서 최근 N초 안의 이벤트만 세기, 4부는 클릭이 많은 광고 K개를 돌려주기입니다. 3절부터 5절까지 한 부분씩 코드를 쓰고, 앞 부분의 함수를 고치지 않고 새 함수만 더해 가는지 봅니다.

## 3. 1부: 광고별 클릭 집계와 두 버그

**광고 id 를 키로 한 딕셔너리에 `counts.get(ad, 0) + 1` 로 더합니다. 더하지 않고 `= 1` 로 쓰면 광고마다 1 만 남고, 기본값 없이 `get(ad)` 를 쓰면 클릭이 없는 광고에서 `None` 이 나옵니다.**

첫 답에서 틀리면 뒤 세 부분이 모두 틀린 숫자 위에서 돌아가므로, 1부는 짧아도 손으로 센 값과 맞춰 보고 넘어갑니다. 아래 블록은 일부러 두 버그를 먼저 찍고 고친 판을 찍습니다. 누적 변수(accumulator)는 반복문을 돌며 값을 더해 가는 변수이고, 이 문제에서는 광고마다 클릭 수를 담는 딕셔너리입니다.

```python
# 하는 일: 가상 광고 로그 14줄에서 광고별 클릭 수와 CTR 을 구하고, = 와 += 를 바꿔 쓴 버그와 None 과 0 을 섞은 버그를 찍은 뒤 고친다.
# 1단계: 가상 로그를 둔다
# 이벤트마다 id, 시각(초), 광고 id, 종류가 있다. e04 는 두 번 들어왔고 e13 은 늦게 도착했다.
LOGS = [
    {'id': 'e01', 'ts': 100, 'ad': 'A', 'type': 'imp'},
    {'id': 'e02', 'ts': 101, 'ad': 'A', 'type': 'imp'},
    {'id': 'e03', 'ts': 103, 'ad': 'B', 'type': 'imp'},
    {'id': 'e04', 'ts': 104, 'ad': 'B', 'type': 'click'},
    {'id': 'e04', 'ts': 104, 'ad': 'B', 'type': 'click'},
    {'id': 'e05', 'ts': 106, 'ad': 'B', 'type': 'imp'},
    {'id': 'e06', 'ts': 108, 'ad': 'A', 'type': 'imp'},
    {'id': 'e07', 'ts': 110, 'ad': 'C', 'type': 'imp'},
    {'id': 'e08', 'ts': 112, 'ad': 'A', 'type': 'imp'},
    {'id': 'e09', 'ts': 115, 'ad': 'A', 'type': 'click'},
    {'id': 'e10', 'ts': 117, 'ad': 'B', 'type': 'imp'},
    {'id': 'e11', 'ts': 118, 'ad': 'B', 'type': 'click'},
    {'id': 'e12', 'ts': 119, 'ad': 'C', 'type': 'imp'},
    {'id': 'e13', 'ts': 102, 'ad': 'A', 'type': 'click'},
]

# 2단계: 누적을 덮어쓰는 버그를 찍는다
# 더하지 않고 1 을 대입해서, 클릭이 몇 번이든 광고마다 1 만 남는다.
def count_clicks_bug(logs):
    clicks = {}
    for r in logs:
        if r['type'] == 'click':
            clicks[r['ad']] = 1          # 버그: 앞의 값을 덮어쓴다
    return clicks

print('덮어쓰기 버그', count_clicks_bug(LOGS))

# 3단계: 고친 집계 함수를 만든다
# 없는 키는 0 에서 시작하도록 get 에 기본값 0 을 준다. 노출도 같은 함수로 센다.
def count_by_type(logs, kind):
    counts = {}
    for r in logs:
        if r['type'] == kind:
            counts[r['ad']] = counts.get(r['ad'], 0) + 1
    return counts

def count_clicks(logs):
    return count_by_type(logs, 'click')

clicks = count_clicks(LOGS)
imps = count_by_type(LOGS, 'imp')
print('고친 판      ', clicks)
print('노출         ', imps)

# 4단계: None 과 0 을 섞는 버그를 찍는다
# 클릭이 없는 C 는 clicks 에 키가 없어 get 이 None 을 돌려준다. not n 은 None 과 0 을 같게 본다.
for ad in sorted(imps):
    try:
        print(f'{ad} CTR {clicks.get(ad) / imps[ad]:.2f}')
    except TypeError as e:
        print(f'{ad} TypeError: {e}')
for ad in ['C', 'Z']:
    n = clicks.get(ad)
    print(f'{ad} {"없는 광고" if not n else n}')

# 5단계: 두 버그를 고친다
# 셈에는 get(ad, 0) 을 쓰고, 없는 광고인지는 노출 딕셔너리에 키가 있는지로 따로 본다.
for ad in sorted(imps):
    print(f'{ad} CTR {clicks.get(ad, 0) / imps[ad]:.2f}')
for ad in ['C', 'Z']:
    if ad not in imps:
        print(f'{ad} 로그에 없는 광고')
    else:
        print(f'{ad} 클릭 {clicks.get(ad, 0)}')

# 출력:
# 2단계 뜻: 덮어쓰기 버그는 클릭이 2개인 A 와 3개인 B 를 모두 1 로 남긴다.
# 덮어쓰기 버그 {'B': 1, 'A': 1}
# 3단계 뜻: 고친 판은 중복을 지우기 전이라 B 가 3 이고, 노출은 손으로 센 값과 같다.
# 고친 판       {'B': 3, 'A': 2}
# 노출          {'A': 4, 'B': 3, 'C': 2}
# 4단계 뜻: 클릭이 없는 C 에서 나눗셈이 TypeError 로 멈추고, not n 이 클릭 0 인 C 를 없는 광고로 찍는다.
# A CTR 0.50
# B CTR 1.00
# C TypeError: unsupported operand type(s) for /: 'NoneType' and 'int'
# C 없는 광고
# Z 없는 광고
# 5단계 뜻: C 는 CTR 0.00 과 클릭 0 으로, Z 는 로그에 없는 광고로 나뉜다.
# A CTR 0.50
# B CTR 1.00
# C CTR 0.00
# C 클릭 0
# Z 로그에 없는 광고
```

찍힌 값은 첫 버그가 얼마나 조용한지 보여 줍니다. 덮어쓰기 버그는 오류 없이 `{'B': 1, 'A': 1}` 을 돌려주는데, B 의 클릭 줄은 3개(중복 포함)이고 A 는 2개라서 두 광고 모두 틀린 값이 나오지만 숫자 모양은 그럴듯합니다. 손으로 센 값과 맞춰 보지 않으면 이 버그는 4부까지 그대로 갑니다.

두 번째 버그는 `None` 과 `0` 이 서로 다른 뜻이라는 데서 나옵니다. `clicks.get('C')` 는 C 가 클릭 딕셔너리에 키로 없어서 `None` 을 돌려주고, `None / 2` 는 `TypeError` 로 멈춥니다. `if not n` 은 반대로 멈추지는 않지만 `None`(로그에 없는 광고)과 `0`(노출은 있었고 클릭만 없는 광고)을 같은 것으로 보아, 노출이 2개인 C 를 Z 와 같은 「없는 광고」로 찍습니다. 고친 판은 셈에는 기본값 0 을 쓰고, 광고가 있는지는 `ad not in imps` 로 따로 물어서 두 뜻을 나눴습니다.

이 블록에서 B 의 CTR 이 1.00 인 것은 아직 e04 중복을 지우지 않아 클릭 3개를 노출 3개로 나눴기 때문이고, 2절에서 손으로 센 0.67 과 다릅니다. 이 차이가 2부의 요구로 이어집니다. 같은 셈은 `collections.Counter` 나 `defaultdict(int)` 로도 쓸 수 있는데, 면접에서는 어느 것을 쓰든 「없는 키를 0 에서 시작한다」를 말로 한 번 짚어 두면 됩니다.

## 4. 2부와 3부: 중복 제거와 최근 N초

**중복 제거는 본 id 를 `set` 에 담아 두 번째부터 건너뛰는 함수 하나, 최근 N초는 `now - n < ts <= now` 로 거르는 함수 하나입니다. 1부의 `count_clicks` 는 한 줄도 바꾸지 않고, 걸러 낸 목록을 넘기기만 합니다.**

2부와 3부를 1부 함수 안에 `if` 로 넣으면, 반복문 하나가 집계와 중복 제거와 시간 범위를 한꺼번에 맡아 새 요구가 올 때마다 그 반복문을 다시 열어야 합니다. 대신 「로그 목록을 받아 로그 목록을 돌려주는」 거르는 함수를 따로 두면 함수끼리 이어 붙이기만 하면 되고, 각 함수를 따로 시험할 수 있습니다. 아래 블록은 1부 블록에 이어서 돌리고, 3부에서는 시각이 정렬되어 있다고 가정한 버그 판을 먼저 찍습니다.

```python
# (앞 블록에 이어서 돌린다.)
# 하는 일: 2부로 같은 이벤트 id 를 한 번만 남기고, 3부로 지금 시각 120 에서 최근 10초와 20초 안의 클릭만 센다. 시각 정렬을 가정한 버그 판도 찍는다.
# 1단계: 2부 중복 제거 함수를 만든다
# 처음 본 id 만 남기고 도착 순서는 그대로 둔다. set 은 들어 있는지 평균 O(1) 에 답한다.
def dedupe(logs):
    seen, out = set(), []
    for r in logs:
        if r['id'] in seen:
            continue
        seen.add(r['id'])
        out.append(r)
    return out

clean = dedupe(LOGS)
print(f'중복 제거 전 {len(LOGS)}줄, 후 {len(clean)}줄')
print('클릭', count_clicks(clean))
print(f'B CTR {count_clicks(clean).get("B", 0) / count_by_type(clean, "imp")["B"]:.2f}')

# 2단계: 시각이 정렬되어 있다고 가정한 3부 버그 판을 찍는다
# 뒤에서부터 읽다가 범위 밖 시각이 나오면 멈춘다. 맨 끝의 e13(시각 102)에서 바로 멈춘다.
def in_window_bug(logs, now, n):
    out = []
    for r in reversed(logs):
        if r['ts'] <= now - n:
            break
        out.append(r)
    return out

print('정렬 가정 버그, 최근 10초', count_clicks(in_window_bug(clean, 120, 10)))

# 3단계: 모든 줄을 보는 3부 함수를 만든다
# 시작은 빼고 끝은 넣는 구간 (now - n, now] 이다. 정렬을 가정하지 않으므로 O(n) 이다.
def in_window(logs, now, n):
    return [r for r in logs if now - n < r['ts'] <= now]

for n in [10, 20]:
    print(f'최근 {n}초', count_clicks(in_window(clean, 120, n)))

# 출력:
# 1단계 뜻: e04 의 두 번째 줄이 빠져 13줄이 되고, B 의 클릭이 2 로 내려가 CTR 이 손으로 센 0.67 과 같다.
# 중복 제거 전 14줄, 후 13줄
# 클릭 {'B': 2, 'A': 2}
# B CTR 0.67
# 2단계 뜻: 정렬을 가정하면 맨 끝 e13 에서 바로 멈춰 최근 10초 클릭을 하나도 세지 못한다.
# 정렬 가정 버그, 최근 10초 {}
# 3단계 뜻: 최근 10초(110초 초과)는 A 1개, B 1개이고, 20초(100초 초과)는 e13 까지 들어와 A 2개, B 2개다.
# 최근 10초 {'A': 1, 'B': 1}
# 최근 20초 {'B': 2, 'A': 2}
```

2부의 값은 중복 한 줄이 CTR 을 얼마나 바꾸는지 보여 줍니다. 14줄이 13줄이 되면서 B 의 클릭이 3개에서 2개로 내려가 CTR 이 1.00 에서 0.67 이 되었고, 이는 2절에서 손으로 센 값과 같습니다. 클릭이 노출보다 많아 CTR 이 1 을 넘는 값이 나오면 중복이나 조인 실수를 먼저 의심해 볼 만합니다.

3부의 버그 판이 빈 딕셔너리를 돌려준 것은 시각 정렬 가정이 틀렸기 때문입니다. `reversed(logs)` 로 처음 본 줄이 시각 102 인 e13 이고, 102 는 120 에서 10을 뺀 110 이하라서 첫 줄에서 `break` 가 걸렸습니다. 정렬되어 있다는 보장이 있다면 뒤에서 범위 안 줄만 보고 멈추는 이 방법이 더 빠르므로, 면접에서는 「시각이 정렬되어 들어옵니까?」를 먼저 묻고 답에 따라 둘 가운데 하나를 고릅니다.

고친 판은 경계를 `now - n < ts <= now` 로 정했습니다. 최근 10초는 110초 초과 120초 이하라서 시각 110 인 e07 은 빠지고, A 의 e09(115초)와 B 의 e11(118초)만 남아 A 1개, B 1개입니다. 경계 시각을 넣을지 뺄지는 문제마다 달라서 정해진 정답이 없고, 어느 쪽으로 정했는지를 말로 밝히면 됩니다. 20초로 늘리면 범위가 100초 초과가 되어 늦게 도착한 e13(102초)까지 들어와 A 와 B 가 2개씩으로 같아지고, 이 동점이 4부의 질문이 됩니다.

## 5. 4부: 상위 K 광고와 동점 처리

**상위 K는 `heapq.nsmallest(k, items, key=lambda x: (-x[1], x[0]))` 한 줄입니다. 클릭 수의 부호를 바꿔 큰 값이 먼저 오게 하고, 같으면 광고 id 순서로 동점을 정합니다.**

상위 K를 구할 때 동점 규칙을 정하지 않으면 로그가 들어온 순서에 따라 답이 달라질 수 있고, 면접관의 기대 답과 순서만 달라도 틀린 것처럼 보입니다. 4절의 최근 20초 결과는 A 와 B 가 2개씩 동점이라 이 문제가 그대로 나옵니다. 아래 블록은 앞 두 블록에 이어서 돌리고, 네 부분을 한 줄로 이어 붙인 함수까지 찍습니다.

```python
# (앞 블록에 이어서 돌린다.)
# 하는 일: 4부로 클릭이 많은 광고 K개를 동점은 광고 id 순서로 돌려주고, 1부부터 4부까지를 한 함수로 이어 붙인다.
import heapq

# 1단계: 4부 상위 K 함수를 만든다
# 키를 (-클릭 수, 광고 id) 로 주면 클릭이 많은 것이 먼저, 같으면 id 가 작은 것이 먼저다.
def top_k(counts, k):
    return heapq.nsmallest(k, counts.items(), key=lambda x: (-x[1], x[0]))

recent20 = count_clicks(in_window(clean, 120, 20))
print('최근 20초 딕셔너리 순서', list(recent20.items()))
print('K=1', top_k(recent20, 1))
print('K=2', top_k(recent20, 2))
print('K=5', top_k(recent20, 5))

# 2단계: 네 부분을 한 함수로 이어 붙인다
# 중복 제거, 시간 범위, 집계, 상위 K 순서다. 각 함수는 앞 함수의 결과만 받는다.
def report(logs, now, n, k):
    return top_k(count_clicks(in_window(dedupe(logs), now, n)), k)

print('최근 10초 K=2', report(LOGS, 120, 10, 2))
print('최근 20초 K=1', report(LOGS, 120, 20, 1))

# 출력:
# 1단계 뜻: 딕셔너리는 B 가 먼저지만 동점 규칙으로 A 가 1위이고, K 가 광고 수보다 커도 있는 만큼만 돌려준다.
# 최근 20초 딕셔너리 순서 [('B', 2), ('A', 2)]
# K=1 [('A', 2)]
# K=2 [('A', 2), ('B', 2)]
# K=5 [('A', 2), ('B', 2)]
# 2단계 뜻: 원본 로그에서 한 번에 불러도 3부와 4부의 값이 그대로 나온다.
# 최근 10초 K=2 [('A', 1), ('B', 1)]
# 최근 20초 K=1 [('A', 2)]
```

동점 규칙이 결과를 정한 자리가 출력 첫 줄과 둘째 줄입니다. 딕셔너리는 넣은 순서를 지키므로 최근 20초 집계에서는 B 의 클릭(e04)이 먼저 들어와 B 가 앞에 있지만, 키 `(-2, 'A')` 가 `(-2, 'B')` 보다 작아서 K=1 의 답은 A 입니다. 동점 규칙 없이 클릭 수만 키로 주면 이 답은 로그가 들어온 순서에 따라 바뀝니다. K=5 처럼 광고가 K개보다 적을 때 오류 대신 있는 만큼 돌려주는 것도 `nsmallest` 의 동작이고, 이것이 원하는 답인지는 면접관에게 확인합니다.

`heapq.nsmallest` 는 m개 항목에서 k개를 고르는데, 광고가 수백 개 정도라면 `sorted(...)[:k]` 와 속도 차이가 크지 않을 것으로 보여 어느 쪽을 써도 무방해 보입니다. Python 문서는 `nsmallest` 가 k 가 작을 때 가장 잘 맞고, k 가 1 이면 `min()`, k 가 크면 `sorted()` 가 더 효율적이라고 적고 있습니다. 힙 자체의 동작은 [트리와 힙](post.html?id=algorithm-tree-heap) 편에 있습니다.

네 부분을 지나는 동안 바뀐 줄을 세어 보면 함수를 나눈 효과가 보입니다. 1부의 `count_clicks` 는 끝까지 한 줄도 바뀌지 않았고, 2부는 `dedupe` 함수 하나, 3부는 `in_window` 함수 하나, 4부는 `top_k` 함수 하나를 더했으며, 이어 붙이는 `report` 는 함수 호출을 감싼 한 줄입니다. 면접관이 다섯째 요구로 「광고주별로 묶어 주세요」를 더하면 집계의 키만 바꾼 함수 하나를 더하면 되고, 앞의 네 함수와 그 시험은 그대로 둡니다.

## 6. 상태가 있는 작은 클래스: LRU 캐시, rate limiter, 스트림 Top-K

**LRU 캐시는 `OrderedDict` 의 `move_to_end` 와 `popitem(last=False)`, rate limiter 는 요청 시각을 담은 `deque` 에서 오래된 것을 왼쪽으로 빼기, 스트림 Top-K 는 광고별 누적 딕셔너리와 `heapq` 입니다.**

클래스 문제는 함수 문제와 달리 호출과 호출 사이에 상태가 남습니다. 그래서 한 번 부를 때 맞아도 여러 번 이어 부를 때 틀릴 수 있는데, 용량이 찬 캐시에서 무엇을 지우는지, 정확히 10초 전의 요청을 범위에 넣는지가 그런 자리입니다. 아래 블록은 세 클래스를 짧게 만들고 호출 순서를 정해 두어 상태가 어떻게 바뀌는지 찍습니다.

`OrderedDict` 는 키를 넣은 순서를 기억하는 딕셔너리이고, `move_to_end(key)` 는 그 키를 맨 뒤로 옮기며 `popitem(last=False)` 는 맨 앞 항목을 꺼냅니다. 맨 앞을 「가장 오래 쓰지 않은 것」, 맨 뒤를 「방금 쓴 것」으로 정하면 LRU 규칙이 이 두 메서드로 끝납니다. `deque` 는 양 끝에서 넣고 빼는 일이 O(1) 인 큐이고, sliding window 방식의 rate limiter 는 최근 window 초 안의 요청 시각만 남겨 그 개수를 셉니다.

```python
# 하는 일: 용량 2 인 LRU 캐시, 10초에 3번까지 받는 rate limiter, 클릭 스트림에서 상위 2개를 돌려주는 Top-K 를 만들고 호출 순서대로 상태를 찍는다.
from collections import OrderedDict, deque
import heapq

# 1단계: LRU 캐시를 만든다
# 맨 앞이 가장 오래 쓰지 않은 키다. get 과 put 모두 쓴 키를 맨 뒤로 옮긴다.
class LRUCache:
    def __init__(self, capacity):
        self.capacity = capacity
        self.data = OrderedDict()

    def get(self, key):
        if key not in self.data:
            return None
        self.data.move_to_end(key)
        return self.data[key]

    def put(self, key, value):
        if key in self.data:
            self.data.move_to_end(key)
        self.data[key] = value
        if len(self.data) > self.capacity:
            self.data.popitem(last=False)

cache = LRUCache(2)
cache.put('A', 0.031)
cache.put('B', 0.012)
print('get A', cache.get('A'), ' 순서', list(cache.data))
cache.put('C', 0.020)
print('put C 뒤 순서', list(cache.data), ' get B', cache.get('B'))

# 2단계: rate limiter 를 만든다
# 최근 window 초 안에 받은 요청 시각을 deque 에 둔다. 정확히 window 초 전 요청은 범위 밖으로 본다.
class RateLimiter:
    def __init__(self, limit, window):
        self.limit, self.window = limit, window
        self.times = deque()

    def allow(self, t):
        while self.times and self.times[0] <= t - self.window:
            self.times.popleft()
        if len(self.times) < self.limit:
            self.times.append(t)
            return True
        return False

rl = RateLimiter(limit=3, window=10)
for t in [100, 101, 103, 105, 110, 111]:
    print(f'시각 {t} 허용 {rl.allow(t)!s:5}  남은 시각 {list(rl.times)}')

# 3단계: 스트림 Top-K 를 만든다
# 광고별 누적 클릭을 딕셔너리에 두고, 물으면 heapq 로 상위를 고른다. 동점은 id 순서다.
class StreamTopK:
    def __init__(self, k):
        self.k = k
        self.counts = {}

    def add(self, ad):
        self.counts[ad] = self.counts.get(ad, 0) + 1

    def top(self):
        return heapq.nsmallest(self.k, self.counts.items(), key=lambda x: (-x[1], x[0]))

st = StreamTopK(2)
for ad in ['B', 'A', 'C', 'C', 'A', 'C']:
    st.add(ad)
    print(f'클릭 {ad}  상위 2 {st.top()}')

# 출력:
# 1단계 뜻: get A 로 A 가 맨 뒤로 가서, C 를 넣을 때 가장 오래 쓰지 않은 B 가 지워진다.
# get A 0.031  순서 ['B', 'A']
# put C 뒤 순서 ['A', 'C']  get B None
# 2단계 뜻: 105초 요청은 10초 안에 이미 3개라 거절되고, 110초에는 100초 요청이 범위 밖으로 나가 다시 허용된다.
# 시각 100 허용 True   남은 시각 [100]
# 시각 101 허용 True   남은 시각 [100, 101]
# 시각 103 허용 True   남은 시각 [100, 101, 103]
# 시각 105 허용 False  남은 시각 [100, 101, 103]
# 시각 110 허용 True   남은 시각 [101, 103, 110]
# 시각 111 허용 True   남은 시각 [103, 110, 111]
# 3단계 뜻: C 가 세 번째 클릭에서 3개가 되어 1위로 오르고, 같은 수의 동점은 id 순서로 정해진다.
# 클릭 B  상위 2 [('B', 1)]
# 클릭 A  상위 2 [('A', 1), ('B', 1)]
# 클릭 C  상위 2 [('A', 1), ('B', 1)]
# 클릭 C  상위 2 [('C', 2), ('A', 1)]
# 클릭 A  상위 2 [('A', 2), ('C', 2)]
# 클릭 C  상위 2 [('C', 3), ('A', 2)]
```

LRU 캐시의 출력은 `get` 도 「사용」이라는 점을 보여 줍니다. A 와 B 를 넣은 뒤 A 를 읽어서 순서가 `['B', 'A']` 가 되었고, 용량 2 에서 C 를 넣으면 맨 앞인 B 가 지워져 `get B` 가 `None` 입니다. `get` 에서 `move_to_end` 를 빼먹으면 C 를 넣을 때 A 가 지워지고, LeetCode 146번 「LRU Cache」가 바로 이 동작을 시험합니다.

rate limiter 는 경계 시각 하나가 허용 여부를 바꿉니다. 105초 요청은 직전 10초(95초 초과) 안에 100, 101, 103초 세 요청이 이미 있어 거절되었고, 거절된 요청은 `deque` 에 넣지 않았습니다. 110초에는 `100 <= 110 - 10` 이 참이라 100초 요청이 빠지고 남은 요청이 2개라서 허용되는데, 조건을 `<` 로 쓰면 100초 요청이 남아 110초 요청이 거절됩니다. 경계를 넣을지는 4절의 시간 범위처럼 정하기 나름이므로, 어느 쪽으로 했는지 말로 밝힙니다.

스트림 Top-K 는 4부의 `top_k` 를 클래스로 옮긴 것이고, 클릭이 올 때마다 `add` 는 평균 O(1) 이며 `top` 은 부를 때마다 광고 m개를 다시 봅니다. 광고 수가 아주 많고 `top` 을 자주 부르는 경우라면 갱신할 때마다 순위 자료구조를 같이 고치는 방법도 있다고 말해 두면 되는데, 면접에서는 먼저 이 단순한 판을 맞게 짜는 쪽이 낫다고 봅니다. 1절 표의 넷째 클래스인 메모리 키-값 저장소는 8절에서 입력 검증과 함께 만듭니다.

## 7. 경계 입력: 빈 목록, 한 줄, 빠진 필드, 0

**경계 입력은 빈 목록, 한 줄, 동점, 빠진 필드, 0 이나 음수 값을 소리 내어 말하고 돌려 봅니다. 빠진 필드는 `r.get('type')` 처럼 기본값을 주고, K 나 N 이 0 이면 무엇이 나오는지 확인합니다.**

예제 로그는 모든 필드가 있고 줄도 14개라서 이런 입력을 만나지 않습니다. 그러나 「빈 목록이면요?」, 「`type` 필드가 없는 줄이 섞이면요?」 같은 질문은 라이브 코딩에서 자주 나오는 추가 질문으로 보이고, 지원자가 먼저 꺼내면 확인 단계를 스스로 하고 있다는 것을 보여 줄 수 있습니다. 동점은 5절에서 이미 돌렸으므로, 아래 블록은 나머지를 5절의 `report` 와 3절의 집계에 넣어 봅니다.

```python
# (앞 블록에 이어서 돌린다.)
# 하는 일: 빈 목록, 한 줄, 빠진 필드, K=0, N=0 을 5절의 report 에 넣어 보고, 빠진 필드에서 멈추는 자리를 get 으로 고친다.
# 1단계: 빈 목록과 한 줄을 넣는다
print('빈 목록   ', report([], 120, 10, 2))
print('한 줄     ', report([{'id': 'x1', 'ts': 119, 'ad': 'D', 'type': 'click'}], 120, 10, 2))

# 2단계: 빠진 필드가 섞인 줄을 넣는다
# type 이 없는 줄이 하나 있다. r['type'] 은 KeyError 로 멈춘다.
broken = clean + [{'id': 'e14', 'ts': 119, 'ad': 'B'}]
try:
    print(count_clicks(broken))
except KeyError as e:
    print('KeyError', e)

# 3단계: get 으로 고친 집계를 넣는다
# 필드가 빠진 줄은 세지 않고 건너뛰며, 몇 줄을 건너뛰었는지도 센다.
def count_clicks_safe(logs):
    counts, skipped = {}, 0
    for r in logs:
        if r.get('type') is None or r.get('ad') is None:
            skipped += 1
            continue
        if r['type'] == 'click':
            counts[r['ad']] = counts.get(r['ad'], 0) + 1
    return counts, skipped

print('get 으로 고친 판', count_clicks_safe(broken))

# 4단계: K=0 과 N=0 을 넣는다
print('K=0', report(LOGS, 120, 20, 0))
print('N=0', report(LOGS, 120, 0, 2))

# 출력:
# 1단계 뜻: 빈 목록은 빈 결과를, 한 줄은 그 광고 하나만 돌려준다.
# 빈 목록    []
# 한 줄      [('D', 1)]
# 2단계 뜻: type 이 없는 줄에서 KeyError 로 멈춘다.
# KeyError 'type'
# 3단계 뜻: 빠진 줄 1개를 건너뛰고 세어 A 2개, B 2개는 그대로다.
# get 으로 고친 판 ({'B': 2, 'A': 2}, 1)
# 4단계 뜻: K=0 과 N=0 은 오류 없이 빈 결과를 돌려준다.
# K=0 []
# N=0 []
```

빈 목록과 한 줄은 이 함수들에서 따로 처리하지 않아도 맞았습니다. 반복문이 한 번도 돌지 않으면 빈 딕셔너리가 나오고 `nsmallest` 도 빈 목록을 돌려주기 때문인데, `max(counts, key=...)` 처럼 빈 입력에서 `ValueError` 를 내는 함수를 썼다면 결과가 달랐을 것입니다. 그래서 빈 입력은 「따로 처리했다」가 아니라 「이 함수들이 빈 입력에서 빈 결과를 낸다」를 확인하고 말하는 항목입니다.

빠진 필드는 `r['type']` 에서 `KeyError` 로 멈췄습니다. `r.get('type')` 은 키가 없으면 `None` 을 돌려주므로 멈추지 않는데, 고친 판은 그런 줄을 세지 않고 건너뛴 줄 수 `skipped` 를 결과와 같이 돌려줍니다. 「1줄이 버려졌다」를 호출한 쪽이 알 수 있어서, 조용히 버리는 것보다 나중에 데이터 문제를 찾기 쉽습니다.

K=0 과 N=0 은 둘 다 빈 결과를 돌려줬는데, 이것이 맞는 답인지는 함수의 약속에 달려 있습니다. K=0 은 「0개를 달라」는 뜻으로 볼 수 있지만, N=0 이나 음수 N 은 호출한 쪽의 실수일 가능성이 높아서 빈 결과로 조용히 넘기면 실수가 숨습니다. 이 선택을 8절에서 다룹니다.

## 8. 입력 검증: 오류와 기본값

**호출한 쪽의 실수(0 이하의 N, 음수 K)는 `ValueError` 로 바로 알리고, 데이터에 흔히 있는 빈칸(없는 키 조회)은 기본값이나 `None` 으로 돌려줍니다. 어느 쪽인지 함수마다 한 번 정해 말로 밝힙니다.**

기본값만 돌려주는 함수는 멈추지 않지만, 잘못 부른 호출도 그럴듯한 빈 결과를 받아 버그가 늦게 보입니다. 반대로 모든 빈칸에 오류를 내면 정상적인 「없는 키」 조회마다 `try` 를 써야 해서 호출하는 코드가 길어집니다. Python 용어집은 키가 있는지 먼저 묻는 방식을 LBYL(Look Before You Leap), 일단 해 보고 예외를 잡는 방식을 EAFP(Easier to Ask for Forgiveness than Permission)라고 부르는데, 어느 쪽으로 쓰든 무엇을 오류로 볼지는 함수를 만드는 사람이 정합니다.

아래 블록은 1절 표의 넷째 클래스인 메모리 키-값 저장소를 만들며 두 방식을 함께 씁니다. `get` 은 없는 키에 `default` 를 돌려주고, `delete` 는 없는 키에 `KeyError` 를 냅니다. 5절의 `report` 앞에는 N 과 K 를 검사하는 함수를 둡니다.

```python
# (앞 블록에 이어서 돌린다.)
# 하는 일: get, set, delete 가 있는 메모리 키-값 저장소를 만들고, report 앞에 N 과 K 검사를 두어 잘못된 호출이 오류 문장으로 멈추는지 본다.
# 1단계: 키-값 저장소를 만든다
# get 은 없는 키에 default 를 돌려주고, delete 는 없는 키에 KeyError 를 낸다.
class KVStore:
    def __init__(self):
        self.data = {}

    def set(self, key, value):
        self.data[key] = value

    def get(self, key, default=None):
        return self.data.get(key, default)

    def delete(self, key):
        if key not in self.data:
            raise KeyError(f'없는 키: {key}')
        del self.data[key]

kv = KVStore()
kv.set('ad:A:clicks', 2)
kv.set('ad:C:clicks', 0)
print('C', kv.get('ad:C:clicks'), ' Z', kv.get('ad:Z:clicks'), ' Z 기본값', kv.get('ad:Z:clicks', 0))
kv.delete('ad:A:clicks')
try:
    kv.delete('ad:A:clicks')
except KeyError as e:
    print('KeyError', e)

# 2단계: report 앞에 검사를 둔다
# N 은 양의 정수, K 는 0 이상의 정수여야 한다. 틀리면 무엇이 왜 틀렸는지 문장으로 알린다.
def report_checked(logs, now, n, k):
    if not isinstance(n, int) or n <= 0:
        raise ValueError(f'n 은 양의 정수여야 합니다: {n!r}')
    if not isinstance(k, int) or k < 0:
        raise ValueError(f'k 는 0 이상의 정수여야 합니다: {k!r}')
    return report(logs, now, n, k)

for n, k in [(10, 2), (0, 2), (-5, 2), (10, -1)]:
    try:
        print(f'n={n} k={k}', report_checked(LOGS, 120, n, k))
    except ValueError as e:
        print(f'n={n} k={k} ValueError: {e}')

# 출력:
# 1단계 뜻: 값이 0 인 C 와 없는 Z 가 0 과 None 으로 나뉘고, 두 번째 delete 는 KeyError 로 알린다.
# C 0  Z None  Z 기본값 0
# KeyError '없는 키: ad:A:clicks'
# 2단계 뜻: 정상 호출은 4절과 같은 값을 내고, N 이 0 이나 음수거나 K 가 음수면 이유를 적은 ValueError 로 멈춘다.
# n=10 k=2 [('A', 1), ('B', 1)]
# n=0 k=2 ValueError: n 은 양의 정수여야 합니다: 0
# n=-5 k=2 ValueError: n 은 양의 정수여야 합니다: -5
# n=10 k=-1 ValueError: k 는 0 이상의 정수여야 합니다: -1
```

키-값 저장소의 출력은 3절의 `None` 과 `0` 구분을 클래스 약속으로 옮긴 것입니다. 값이 0 으로 저장된 C 는 `0` 을, 저장된 적 없는 Z 는 `None` 을 돌려주므로 호출한 쪽이 둘을 나눌 수 있고, 셈에 쓸 때만 `get(key, 0)` 처럼 기본값을 줍니다. `delete` 를 두 번 부르면 두 번째에 `KeyError` 를 내도록 한 것은 「지울 것이 없었다」를 호출한 쪽이 알아야 한다고 정했기 때문인데, 아무 일 없이 넘어가도록 정하는 저장소도 있으므로 이것도 면접관에게 확인할 항목입니다.

`report_checked` 는 7절에서 빈 결과로 조용히 넘어갔던 N=0 을 오류 문장으로 바꿨습니다. 오류 문장에 받은 값(`0`, `-5`, `-1`)을 같이 적어 두면 로그만 보고도 어느 호출이 틀렸는지 알 수 있습니다. 면접에서는 검사를 모든 함수에 다 넣기보다 바깥에서 부르는 함수 하나의 입구에 두고 「안쪽 함수는 이미 검사한 값을 받는다」고 말하는 정도로 짧게 끝내는 방법도 있고, 그러면 남은 시간을 복잡도 설명에 쓸 수 있습니다.

## 한눈 정리

| 요구 | 더한 것 | 이 글의 예제에서 | 확인한 버그나 경계 |
|---|---|---|---|
| 1부 광고별 클릭 | `count_by_type`, `get(ad, 0) + 1` | A 2개, B 3개(중복 포함), CTR A 0.50 | `= 1` 덮어쓰기, `None` 나눗셈 TypeError |
| 2부 중복 제거 | `dedupe` 와 본 id 의 `set` | 14줄 → 13줄, B CTR 1.00 → 0.67 | 같은 이벤트 id 재전송 |
| 3부 최근 N초 | `in_window`, `now - n < ts <= now` | 10초 A 1개 B 1개, 20초 A 2개 B 2개 | 정렬 가정 버그가 빈 결과 |
| 4부 상위 K | `top_k`, 키 `(-클릭, id)` | 20초 K=1 은 동점 규칙으로 A | 동점, K 가 광고 수보다 큼 |
| 작은 클래스 | `OrderedDict`, `deque`, `heapq`, `dict` | C 를 넣으면 B 가 지워짐, 105초 거절 | `get` 의 `move_to_end` 누락, 경계 시각 |
| 경계 입력과 검증 | `r.get`, `ValueError`, `KeyError` | 빠진 줄 1개 건너뜀, N=0 은 ValueError | 빈 목록, 빠진 필드, 0 과 음수 |

## 헷갈리기 쉬운 점

- **`=` 와 `+=` 버그는 오류를 내지 않습니다.** 덮어쓰기 버그는 `{'B': 1, 'A': 1}` 처럼 그럴듯한 숫자를 돌려주므로, 손으로 센 값과 한 번 맞춰 보는 것이 가장 빠른 확인입니다.
- **`None` 과 `0` 은 다른 답입니다.** `None` 은 「기록이 없다」, `0` 은 「기록은 있고 값이 0 이다」입니다. 셈에는 `get(key, 0)` 을 쓰고, 있는지는 `in` 으로 따로 묻고, `if not x` 로 둘을 한꺼번에 거르지 않습니다.
- **로그가 시각 순서라는 것은 가정입니다.** 재전송과 늦은 도착이 있으면 뒤에서부터 읽다 멈추는 코드가 빈 결과를 냅니다. 정렬이 보장되는지 먼저 묻고, 보장이 없으면 모든 줄을 봅니다.
- **경계 시각을 넣을지는 정하기 나름입니다.** `now - n < ts` 와 `now - n <= ts` 는 시각 110 인 e07 같은 줄을 다르게 셉니다. 어느 쪽으로 정했는지를 말로 밝힙니다.
- **동점 규칙이 없으면 답이 들어온 순서에 따라 바뀝니다.** 정렬 키에 id 를 둘째 값으로 넣어 순서를 고정합니다.
- **오류와 기본값은 함수마다 한 번 정합니다.** 호출한 쪽의 실수는 오류로, 데이터에 흔한 빈칸은 기본값으로 돌려주는 것이 이 글의 선택이고, 같은 문제에 다르게 정하는 곳도 있으므로 면접관에게 확인합니다.

## 더 깊이 보기

- `OrderedDict` 의 `move_to_end` 와 `popitem`, `deque`, `Counter`, `defaultdict` 는 Python 문서 [collections](https://docs.python.org/3/library/collections.html) 에 있고, `nsmallest` 와 `nlargest` 는 [heapq](https://docs.python.org/3/library/heapq.html) 에 있습니다.
- `dict.get` 의 기본값 동작은 Python 문서 [Mapping Types: dict](https://docs.python.org/3/library/stdtypes.html#dict) 에, EAFP 와 LBYL 의 뜻은 [Glossary](https://docs.python.org/3/glossary.html#term-EAFP) 에 있습니다.
- LRU 캐시를 직접 짜 보는 문제는 LeetCode [146. LRU Cache](https://leetcode.com/problems/lru-cache/), 상위 K는 [347. Top K Frequent Elements](https://leetcode.com/problems/top-k-frequent-elements/) 입니다.
- 문제를 받고 질문, 계획, 확인 순서로 푸는 틀은 CodePath 의 [UMPIRE Interview Strategy](https://guides.codepath.org/compsci/UMPIRE-Interview-Strategy) 와 이 시리즈의 [코딩테스트 풀이 순서](post.html?id=algorithm-solving-steps) 편에 있습니다.
- 해시와 `Counter` 는 [해시와 정렬](post.html?id=algorithm-hash-sort) 편, 힙은 [트리와 힙](post.html?id=algorithm-tree-heap) 편, `deque` 와 표준 라이브러리 템플릿은 [코딩테스트 핵심 도구](post.html?id=algorithm-coding-test-toolkit) 편에 있습니다.
