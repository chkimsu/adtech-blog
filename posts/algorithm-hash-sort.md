지훈은 앞 편에서 배운 대로 리스트를 집합으로 바꿔 시간 초과를 넘겼다. 그런데 다음 문제에서 다시 막혔다. 이번에는 값이 있는지가 아니라 **몇 번 칸에 있는지**를 물었다.

집합은 값을 넣어 두기만 할 뿐 자리를 기억하지 않는다. 그렇다고 리스트로 되돌리면 다시 느려진다. 지훈에게 필요한 것은 빠르면서 자리도 같이 기억하는 그릇이었다.

**값 하나로 다른 값을 즉시 꺼내려면 무엇이 필요할까?**

답은 딕셔너리이고, 딕셔너리가 빠른 이유는 **해시**다. 이 글은 해시가 무엇인지, 왜 가끔 느려지는지, 그리고 해시로 안 되는 문제를 정렬로 어떻게 넘기는지를 다룬다.

> **한 줄 요약:** 딕셔너리는 값을 훑지 않고 값에서 자리를 계산한다. 그래서 20만 개 중에서 찾는 일이 리스트보다 만 배 넘게 빠르다. 정렬은 이 계산이 안 통할 때 쓰는 두 번째 무기다.

> **골라 읽는 법** — 절이 열 개인 글입니다. 순서대로 읽지 않아도 됩니다.
>
> - 딕셔너리가 왜 빠른지, 언제 느려지는지 → 앞의 세 절
> - 무엇을 열쇠로 쓸 수 있나 → 열쇠 절
> - 문제 풀이에 바로 쓰는 것 → 두 수의 합부터 집합 연산까지
> - 정렬 이야기만 → 뒤의 세 절

---

## 1. 리스트에서 찾으면 왜 느린가

**리스트에서 값을 찾는 일은 앞에서부터 하나씩 비교하는 일이다.**

앞 편에서 이 차이를 한 번 봤다. 여기서는 값을 20만 개 넣고 2천 번 찾아보며 그 차이가 얼마나 벌어지는지 확인한다.

```python
# 값 20만 개 중에서 2천 개를 찾는다.
# 리스트는 앞에서부터 훑고, 딕셔너리는 자리를 계산한다.
import time, random

random.seed(42)
haystack = random.sample(range(1, 1_000_000), 200_000)
needles  = random.sample(range(1, 1_000_000), 2_000)

as_list = haystack
as_dict = {v: i for i, v in enumerate(haystack)}

t = time.perf_counter()
for x in needles:
    x in as_list
list_ms = (time.perf_counter() - t) * 1000

t = time.perf_counter()
for x in needles:
    x in as_dict
dict_ms = (time.perf_counter() - t) * 1000

print(f"{'담은 곳':<10}{'2,000번 찾기(ms)':>18}")
print(f"{'리스트':<10}{list_ms:>18.1f}")
print(f"{'딕셔너리':<9}{dict_ms:>18.3f}")
print(f"\n딕셔너리가 {list_ms/dict_ms:,.0f}배 빠르다")
```

```
담은 곳           2,000번 찾기(ms)
리스트                   6902.2
딕셔너리                  0.381

딕셔너리가 18,140배 빠르다
```

리스트 쪽이 7초 가까이 걸렸다. 채점 서버의 제한 시간이 보통 1초에서 2초이니 이 코드는 그대로 떨어진다. 절대 시간은 기계마다 다르고 배수도 실행할 때마다 만 배 안팎에서 오르내린다. 그래도 두 줄이 다른 종류라는 결론은 어디서 돌려도 같다.

두 줄의 차이를 만든 것은 코드가 아니라 그릇이다. 값을 어디에 담았느냐만 바꿨는데 만 배가 넘게 벌어졌다. **알고리즘 문제에서 자료형 선택이 알고리즘 선택만큼 중요한 이유가 여기 있다.**

## 2. 해시 — 값에서 자리를 계산한다

**딕셔너리는 값을 찾지 않고, 값을 보고 자리를 계산한 뒤 그 자리만 확인한다.**

딕셔너리 안에는 빈 칸이 여러 개 늘어서 있다. 값을 넣을 때 파이썬은 그 값을 정수 하나로 바꾼다. 이 정수를 **해시값**이라 하고 `hash()` 로 직접 볼 수 있다. 그다음 해시값을 칸 개수로 나눈 나머지를 구하면 몇 번 칸에 넣을지가 나온다.

칸이 여덟 개라고 하자. 값 17의 해시값도 17이면, 이것을 칸 개수로 나눈 나머지가 곧 자리가 된다. 나중에 그 값을 찾을 때도 같은 계산을 해서 그 칸 하나만 열어 보면 된다. **훑지 않는다는 것이 핵심이고, 그래서 값이 20만 개든 2천만 개든 걸리는 시간이 거의 같다.**

<figure style="text-align:center; margin:2rem 0;">
<svg viewBox="0 0 500 210" role="img" aria-label="왼쪽에 값 네 개가 있고 각 값에서 나머지 계산을 거쳐 오른쪽 여덟 칸 중 한 칸으로 화살표가 이어진다. 값 17과 값 9는 계산 결과가 둘 다 1이라 같은 칸을 가리키고, 그 칸에만 두 값이 세로로 겹쳐 그려져 있다." style="width:100%; max-width:500px; height:auto; font-family:var(--font-sans)">
<defs>
<marker id="hs2-arr" markerWidth="9" markerHeight="9" refX="7.5" refY="3" orient="auto"><path d="M0,0 L7.5,3 L0,6 Z" style="fill:var(--text-muted)"/></marker>
<marker id="hs2-hit" markerWidth="9" markerHeight="9" refX="7.5" refY="3" orient="auto"><path d="M0,0 L7.5,3 L0,6 Z" style="fill:var(--accent-primary)"/></marker>
</defs>
<text x="6" y="14" style="font-size:12.5px; fill:var(--text-secondary)">넣을 값</text>
<text x="150" y="14" style="font-size:12.5px; fill:var(--text-secondary)">8 로 나눈 나머지</text>
<text x="360" y="14" style="font-size:12.5px; fill:var(--text-secondary)">칸</text>
<g style="font-size:13px; fill:var(--text-primary); font-family:var(--font-mono)">
<text x="10" y="46">17</text><text x="10" y="82">42</text><text x="10" y="118">9</text><text x="10" y="154">30</text></g>
<g style="font-size:12.5px; fill:var(--text-muted); font-family:var(--font-mono)">
<text x="46" y="46">17 % 8 = 1</text><text x="46" y="82">42 % 8 = 2</text>
<text x="46" y="118">9 % 8 = 1</text><text x="46" y="154">30 % 8 = 6</text></g>
<g style="stroke:var(--text-muted); stroke-width:1.4">
<line x1="140" y1="42" x2="298" y2="56" marker-end="url(#hs2-arr)"/>
<line x1="140" y1="78" x2="298" y2="78" marker-end="url(#hs2-arr)"/>
<line x1="140" y1="150" x2="298" y2="166" marker-end="url(#hs2-arr)"/></g>
<line x1="140" y1="114" x2="298" y2="60" style="stroke:var(--accent-primary); stroke-width:2" marker-end="url(#hs2-hit)"/>
<g style="fill:var(--bg-secondary); stroke:var(--border-color); stroke-width:1.4">
<rect x="306" y="24" width="86" height="20"/><rect x="306" y="68" width="86" height="20"/>
<rect x="306" y="90" width="86" height="20"/><rect x="306" y="112" width="86" height="20"/>
<rect x="306" y="156" width="86" height="20"/><rect x="306" y="178" width="86" height="20"/></g>
<rect x="306" y="46" width="86" height="20" style="fill:var(--bg-secondary); stroke:var(--accent-primary); stroke-width:2"/>
<rect x="306" y="134" width="86" height="20" style="fill:var(--bg-secondary); stroke:var(--border-color); stroke-width:1.4"/>
<g style="font-size:11px; fill:var(--text-muted); text-anchor:end; font-family:var(--font-mono)">
<text x="300" y="38">0</text><text x="300" y="60">1</text><text x="300" y="82">2</text><text x="300" y="104">3</text>
<text x="300" y="126">4</text><text x="300" y="148">5</text><text x="300" y="170">6</text><text x="300" y="192">7</text></g>
<g style="font-size:12.5px; fill:var(--text-primary); font-family:var(--font-mono)">
<text x="314" y="60">17</text><text x="314" y="82">42</text><text x="314" y="170">30</text></g>
<text x="398" y="60" style="font-size:12.5px; fill:var(--accent-primary); font-family:var(--font-mono)">← 9 도 여기</text>
</svg>
<figcaption style="margin-top:0.75rem; font-size:0.9rem; color:var(--text-muted)">17 과 9 는 나머지가 똑같이 1 이라 같은 칸을 가리킨다. 이것이 다음 절에서 다룰 충돌이다. 실제 파이썬의 칸 개수와 해시값은 이보다 훨씬 크지만, 나머지로 자리를 정한다는 구조는 같다.</figcaption>
</figure>

## 3. 충돌 — 같은 칸에 둘이 몰리면

**서로 다른 값이 같은 칸을 가리키는 것을 충돌이라 하고, 충돌이 심해지면 딕셔너리도 리스트처럼 느려진다.**

칸은 유한하고 넣을 값은 무한하니 충돌은 반드시 생긴다. 파이썬은 충돌이 나면 다음 빈 칸을 찾아 옮겨 담는다. 이때 그 칸에 있던 값과 진짜 같은지를 `==` 로 한 번 비교한다. 충돌이 몇 번 안 되면 이 추가 비교도 몇 번뿐이라 티가 안 난다.

문제는 모든 값이 같은 칸으로 몰릴 때다. 그러면 새 값을 넣을 때마다 앞의 값들을 전부 지나쳐야 하니, 결국 리스트에서 훑는 것과 같아진다. 직접 만들어 보면 차이가 분명하다.

```python
# 해시값을 일부러 고정해서 모든 값이 한 칸에 몰리게 만든다.
import time

class GoodKey:
    def __init__(self, v): self.v = v
    def __hash__(self):    return hash(self.v)      # 값마다 다른 번호
    def __eq__(self, o):   return self.v == o.v

class BadKey:
    def __init__(self, v): self.v = v
    def __hash__(self):    return 7                 # 전부 같은 번호
    def __eq__(self, o):   return self.v == o.v

print(f"{'열쇠':<8}{'담는 데 걸린 시간(ms)':>22}")
for name, K in (("좋은", GoodKey), ("나쁜", BadKey)):
    t = time.perf_counter()
    d = {K(i): i for i in range(5_000)}
    ms = (time.perf_counter() - t) * 1000
    print(f"{name:<8}{ms:>22.1f}")
```

```
열쇠              담는 데 걸린 시간(ms)
좋은                         1.6
나쁜                       701.9
```

값 5천 개를 담는 데 0.4초 넘게 더 걸렸다. 값 개수를 두 배로 하면 이 차이는 네 배가 된다. 나쁜 쪽은 O(n²)로 돌아가고 있기 때문이다.

**그래서 "딕셔너리는 O(1)"이라는 말에는 조건이 붙는다.** 해시값이 고르게 흩어질 때만 O(1)이고, 최악의 경우는 O(n)이다. 다행히 파이썬 기본 자료형의 해시는 잘 흩어지도록 만들어져 있다. 코딩 테스트에서 이 최악을 만나는 일은 `__hash__` 를 직접 잘못 짜지 않는 한 거의 없다.

:::deep 칸이 모자라면 어떻게 되나 — 재배치와 amortized

칸 개수는 고정이 아니다. 값이 늘어 칸의 3분의 2 정도가 차면 파이썬은 칸 개수를 키운다. 그리고 이미 들어 있던 값을 전부 다시 계산해 새 자리에 옮긴다. 이것을 재배치(rehash)라고 한다.

재배치가 일어나는 그 한 번은 값 개수만큼 걸리니 O(n)이다. 그러면 "딕셔너리 넣기는 O(1)"이 거짓 아닐까?

거짓이 아니다. 칸을 두 배로 키우기 때문에 재배치는 점점 드물게 일어난다. 값을 n개 넣는 동안 재배치에 드는 시간을 다 합쳐도 n에 비례하는 수준이다. 그래서 넣기 한 번당 평균은 상수로 남는다. 이렇게 "가끔 비싸지만 평균 내면 싸다"를 **amortized O(1)** 이라 부른다.

같은 구조가 파이썬 리스트의 `append` 에도 있다. 리스트도 자리가 모자라면 더 큰 자리를 잡아 통째로 옮긴다. 하지만 이때도 두 배씩 키우니 `append` 한 번의 평균은 상수다. 면접에서 "리스트 append 는 왜 O(1) 인가"를 물으면 이 이야기를 하면 된다.
:::

## 4. 무엇을 열쇠로 쓸 수 있나

**자리를 계산해서 넣는 구조이니, 넣은 뒤에 값이 바뀌면 안 된다.**

리스트를 딕셔너리 열쇠로 쓰면 파이썬이 막는다. 리스트는 나중에 내용을 바꿀 수 있고, 내용이 바뀌면 해시값도 같이 바뀐다. 그러면 아까 넣어 둔 칸에서 영영 못 찾게 된다. 튜플은 한 번 만들면 못 바꾸니 열쇠로 쓸 수 있다.

```python
좌표 = {}
좌표[(3, 5)] = "가"          # 튜플은 된다
print("튜플 열쇠 ", 좌표)

try:
    좌표[[3, 5]] = "나"      # 리스트는 안 된다
except TypeError as e:
    print("리스트 열쇠", type(e).__name__, "-", e)

print()
print("hash(3) =", hash(3), " hash(3.0) =", hash(3.0), " 3 == 3.0 :", 3 == 3.0)
d = {3: "정수로 넣음"}
d[3.0] = "실수로 덮어씀"
print("d =", d, " 칸 개수", len(d))
```

```
튜플 열쇠  {(3, 5): '가'}
리스트 열쇠 TypeError - unhashable type: 'list'

hash(3) = 3  hash(3.0) = 3  3 == 3.0 : True
d = {3: '실수로 덮어씀'}  칸 개수 1
```

뒷부분이 더 재미있다. 정수 3과 실수 3.0은 파이썬에서 서로 같다고 판정되고 해시값도 같다. 그래서 딕셔너리는 둘을 **같은 열쇠**로 본다. 결과적으로 3으로 넣은 값이 3.0으로 덮어써지고 칸은 하나만 남았다.

이것이 실제로 문제가 되는 자리가 있다. 나눗셈 결과를 열쇠로 쓰면 값이 실수가 되는데, 정수로 넣은 것과 뒤섞이면 조용히 덮어써진다. **열쇠로 쓸 값은 자료형을 하나로 통일해 두는 편이 안전하다.**

| 열쇠로 쓸 수 있나 | 자료형 | 이유 |
|---|---|---|
| 된다 | 정수·실수·문자열·튜플·`frozenset` | 만든 뒤 못 바꾼다 |
| 안 된다 | 리스트·딕셔너리·집합 | 내용이 바뀌면 해시값도 바뀐다 |
| 조건부 | 직접 만든 클래스 | `__hash__` 와 `__eq__` 를 짝 맞춰 정의해야 한다 |

좌표나 이름 조합처럼 여러 값을 묶어 열쇠로 쓰고 싶으면 튜플로 감싸면 된다. `방문[(x, y)] = True` 같은 꼴은 격자 문제에서 계속 나온다.

## 5. 두 수의 합 — 한 번만 훑는다

**"둘을 더해 목표가 되는 짝을 찾아라"는 문제는 딕셔너리를 쓰면 한 번 훑기로 끝난다.**

짝을 전부 만들어 보면 값이 n개일 때 비교가 n²에 비례한다. 그런데 지금 보는 값이 정해지면 필요한 짝도 하나로 정해진다. 목표가 10이고 지금 값이 7이면 찾는 것은 3 하나뿐이다.

그러면 남은 일은 "3을 이미 봤나"를 묻는 것이고, 이 물음이 바로 딕셔너리가 잘하는 일이다. **지금까지 본 값을 딕셔너리에 적어 두면서 한 번만 지나가면 된다.**

```python
ARR, TARGET = [8, 3, 11, 7, 2, 15], 10

print("칸  값   지금까지 본 값→칸        찾는 짝    있나")
seen = {}
for i, v in enumerate(ARR):
    need = TARGET - v
    hit  = need in seen
    print(f"{i}  {v:>3}   {str(seen):<24} {need:>4}    {'있다 → 답 ' + str((seen.get(need), i)) if hit else '없다'}")
    if hit:
        break
    seen[v] = i
```

```
칸  값   지금까지 본 값→칸        찾는 짝    있나
0    8   {}                          2    없다
1    3   {8: 0}                      7    없다
2   11   {8: 0, 3: 1}               -1    없다
3    7   {8: 0, 3: 1, 11: 2}         3    있다 → 답 (1, 3)
```

<figure style="text-align:center; margin:2rem 0;">
<svg viewBox="0 0 500 200" role="img" aria-label="네 회차를 위에서 아래로 쌓은 그림. 회차마다 값 여섯 개가 칸으로 놓여 있고 지금 보는 칸이 굵게 표시된다. 오른쪽에는 그 회차에서 찾는 짝과 지금까지 적어 둔 값이 적혀 있다. 네 번째 회차에서 찾는 짝 3 이 이미 적혀 있어 답을 찾는다." style="width:100%; max-width:500px; height:auto; font-family:var(--font-sans)">
<text x="6" y="13" style="font-size:12.5px; fill:var(--text-secondary)">목표 10 · 값 [8, 3, 11, 7, 2, 15]</text>
<g style="font-size:11px; fill:var(--text-muted); text-anchor:middle; font-family:var(--font-mono)">
<text x="72" y="34">8</text><text x="104" y="34">3</text><text x="136" y="34">11</text>
<text x="168" y="34">7</text><text x="200" y="34">2</text><text x="232" y="34">15</text></g>
<g style="fill:var(--bg-secondary); stroke:var(--border-color); stroke-width:1.2">
<rect x="90" y="42" width="28" height="18"/><rect x="122" y="42" width="28" height="18"/><rect x="154" y="42" width="28" height="18"/>
<rect x="186" y="42" width="28" height="18"/><rect x="218" y="42" width="28" height="18"/>
<rect x="58" y="72" width="28" height="18"/><rect x="122" y="72" width="28" height="18"/><rect x="154" y="72" width="28" height="18"/>
<rect x="186" y="72" width="28" height="18"/><rect x="218" y="72" width="28" height="18"/>
<rect x="58" y="102" width="28" height="18"/><rect x="90" y="102" width="28" height="18"/><rect x="154" y="102" width="28" height="18"/>
<rect x="186" y="102" width="28" height="18"/><rect x="218" y="102" width="28" height="18"/>
<rect x="58" y="132" width="28" height="18"/><rect x="90" y="132" width="28" height="18"/>
<rect x="122" y="132" width="28" height="18"/><rect x="186" y="132" width="28" height="18"/><rect x="218" y="132" width="28" height="18"/></g>
<g style="fill:var(--bg-tertiary); stroke:var(--accent-secondary); stroke-width:2">
<rect x="58" y="42" width="28" height="18"/>
<rect x="90" y="72" width="28" height="18"/>
<rect x="122" y="102" width="28" height="18"/>
<rect x="154" y="132" width="28" height="18"/></g>
<g style="font-size:11px; fill:var(--text-muted); text-anchor:end; font-family:var(--font-mono)">
<text x="50" y="55">1회</text><text x="50" y="85">2회</text><text x="50" y="115">3회</text><text x="50" y="145">4회</text></g>
<g style="font-size:12px; fill:var(--text-muted); font-family:var(--font-mono)">
<text x="258" y="55">찾는 짝 2 · 적어 둔 것 없음</text>
<text x="258" y="85">찾는 짝 7 · 적어 둔 것 8</text>
<text x="258" y="115">찾는 짝 −1 · 적어 둔 것 8, 3</text></g>
<text x="258" y="145" style="font-size:12px; fill:var(--accent-primary); font-family:var(--font-mono)">찾는 짝 3 · 이미 적혀 있다</text>
<line x1="104" y1="152" x2="104" y2="164" style="stroke:var(--accent-primary); stroke-width:2"/>
<line x1="104" y1="164" x2="168" y2="164" style="stroke:var(--accent-primary); stroke-width:2"/>
<line x1="168" y1="164" x2="168" y2="152" style="stroke:var(--accent-primary); stroke-width:2"/>
<text x="186" y="168" style="font-size:12px; fill:var(--accent-primary); font-family:var(--font-mono)">3 + 7 = 10 · 답은 1번 칸과 3번 칸</text>
</svg>
<figcaption style="margin-top:0.75rem; font-size:0.9rem; color:var(--text-muted)">회차마다 하는 일은 딱 두 가지다. 필요한 짝을 뺄셈으로 구하고, 그것이 적어 둔 것 안에 있는지 묻는다. 둘 다 상수 시간이라 전체가 O(n) 이 된다.</figcaption>
</figure>

이 구조를 한 번 익혀 두면 응용이 넓다. **"지금 값에 대해 필요한 짝이 하나로 정해지는가"를 물어서 그렇다면 이 방법이 통한다.** 두 수의 차가 K인 짝, 합이 0인 짝, 나머지가 같은 짝이 모두 같은 꼴이다.

## 6. 세는 일 — get·defaultdict·Counter

**무엇이 몇 번 나왔는지 세는 코드는 셋 중 하나로 쓴다.**

세는 코드에서 초보가 가장 많이 만드는 오류는 없는 열쇠를 읽는 것이다. `count[w] += 1` 은 `w` 가 처음 나오면 `KeyError` 로 죽는다. 처음인지 아닌지를 매번 `if` 로 확인하면 코드가 지저분해진다. 그래서 파이썬은 이것을 짧게 쓰는 방법을 세 가지 준다.

```python
from collections import Counter, defaultdict

WORDS = ["사과", "배", "사과", "귤", "배", "사과"]

count = {}
for w in WORDS:
    count[w] = count.get(w, 0) + 1
print("get 으로     ", count)

bag = defaultdict(list)
for i, w in enumerate(WORDS):
    bag[w].append(i)
print("defaultdict ", dict(bag))

c = Counter(WORDS)
print("Counter     ", dict(c))
print("가장 많은 둘 ", c.most_common(2))
```

```
get 으로      {'사과': 3, '배': 2, '귤': 1}
defaultdict  {'사과': [0, 2, 5], '배': [1, 4], '귤': [3]}
Counter      {'사과': 3, '배': 2, '귤': 1}
가장 많은 둘  [('사과', 3), ('배', 2)]
```

셋의 쓰임이 조금씩 다르다. `get` 은 아무것도 가져오지 않고 쓸 수 있으니 세는 일 하나뿐이면 이걸로 충분하다. `defaultdict` 는 열쇠마다 리스트나 집합을 모아야 할 때 편하다. 위 예처럼 "이 값이 몇 번 칸들에 있었나"를 모으는 데 자주 쓴다.

`Counter` 는 세는 일 전용이라 가장 짧고, `most_common` 처럼 딸린 기능이 있다. 두 `Counter` 를 빼면 개수의 차도 바로 나온다. 애너그램이나 문자 개수 비교 문제가 한 줄로 끝나는 경우가 많다.

> **주의 한 가지** — `defaultdict` 는 없는 열쇠를 **읽기만 해도** 그 열쇠를 만들어 버린다. `if bag[w]:` 같은 확인이 조용히 열쇠를 늘리니, 확인할 때는 `if w in bag:` 를 쓴다.

## 7. 집합 연산 — 겹치는 것과 빠진 것

**두 목록을 비교하는 문제는 반복문 대신 집합 연산 한 줄이 답인 경우가 많다.**

"어제 왔는데 오늘 안 온 사람"을 찾는다고 하자. 이중 반복문으로 짜면 O(n²)이고 코드도 길다. 집합으로 바꾸면 기호 하나다.

```python
어제 = {"지훈", "민서", "서연", "도윤"}
오늘 = {"민서", "서연", "하준", "지우"}

print("둘 다 왔다 (교집합)  ", sorted(어제 & 오늘))
print("어제만 (차집합)      ", sorted(어제 - 오늘))
print("오늘 새로 온 사람     ", sorted(오늘 - 어제))
print("한 번이라도 (합집합) ", sorted(어제 | 오늘))
print("한쪽에만 (대칭차)    ", sorted(어제 ^ 오늘))
print()
print("이탈률", f"{len(어제 - 오늘) / len(어제):.1%}")
```

```
둘 다 왔다 (교집합)   ['민서', '서연']
어제만 (차집합)       ['도윤', '지훈']
오늘 새로 온 사람      ['지우', '하준']
한 번이라도 (합집합)  ['도윤', '민서', '서연', '지우', '지훈', '하준']
한쪽에만 (대칭차)     ['도윤', '지우', '지훈', '하준']

이탈률 50.0%
```

기호 다섯 개가 각각 흔한 질문에 대응한다. 교집합은 "둘 다", 차집합은 "이쪽에만", 합집합은 "한 번이라도", 대칭차는 "한쪽에만"이다. 문제 지문을 읽다가 이 표현이 나오면 집합 연산을 떠올리면 된다.

광고 쪽에서 이 연산을 그대로 쓰는 자리가 오디언스 세그먼트다. 두 세그먼트가 얼마나 겹치는지, 한쪽에만 있는 사용자가 몇인지가 곧 교집합과 차집합의 크기다. 자세한 것은 [오디언스 세그멘테이션](post.html?id=audience-segmentation) 편에 있다.

## 8. 정렬 — key 로 기준을 만든다

**해시가 안 통하는 문제가 있고, 그때 꺼내는 것이 정렬이다.**

해시는 "이 값이 있나"에는 강하지만 "이 값보다 큰 것 중 가장 작은 것"에는 아무 도움이 안 된다. 값을 흩어 놓는 것이 목적이라 순서를 아예 버리기 때문이다. 순서가 필요한 순간 정렬이 등장한다.

파이썬의 `sorted` 와 `list.sort` 는 O(n log n)이다. 값이 십만 개면 대략 170만 번쯤 비교하는 셈이라, 채점 서버가 충분히 견딘다. **입력이 십만 개까지라면 "일단 정렬"은 거의 항상 안전한 선택이다.**

정렬에서 실제로 배울 것은 알고리즘이 아니라 `key` 사용법이다. `key` 는 각 원소를 무엇으로 볼지 정하는 함수이고, 파이썬은 원본 대신 그 결과를 비교한다.

```python
학생 = [("지훈", 3, 88), ("민서", 1, 92), ("서연", 3, 92), ("도윤", 1, 88)]
# (이름, 반, 점수)

print("원본        ", [s[0] for s in 학생])
print("점수만 정렬  ", [s[0] for s in sorted(학생, key=lambda s: s[2])])
print("점수 내림차순", [s[0] for s in sorted(학생, key=lambda s: -s[2])])
```

```
원본         ['지훈', '민서', '서연', '도윤']
점수만 정렬   ['지훈', '도윤', '민서', '서연']
점수 내림차순 ['민서', '서연', '지훈', '도윤']
```

내림차순을 `-s[2]` 로 쓴 것을 눈여겨보자. `reverse=True` 를 써도 되지만 결과가 다르고, 그 차이가 다음 절의 주제다.

## 9. 안정 정렬 — 기준이 둘 이상일 때

**파이썬 정렬은 값이 같은 원소들의 원래 순서를 그대로 지킨다. 이것을 안정 정렬이라 한다.**

기준이 하나면 신경 쓸 일이 없다. 문제는 "점수 높은 순으로, 점수가 같으면 반 번호 작은 순으로" 같은 두 겹 기준이다. 방법은 둘인데 둘 다 안정성 덕분에 성립한다.

```python
학생 = [("지훈", 3, 88), ("민서", 1, 92), ("서연", 3, 92), ("도윤", 1, 88)]

print("반 먼저 정렬 후 점수로 다시 정렬:")
tmp = sorted(학생, key=lambda s: s[1])
print("  1단계 반   ", [(s[0], s[1]) for s in tmp])
tmp = sorted(tmp, key=lambda s: -s[2])
print("  2단계 점수 ", [(s[0], s[2], s[1]) for s in tmp])
print()
print("한 번에 (점수 내림, 반 오름):")
one = sorted(학생, key=lambda s: (-s[2], s[1]))
print("            ", [(s[0], s[2], s[1]) for s in one])
```

```
반 먼저 정렬 후 점수로 다시 정렬:
  1단계 반    [('민서', 1), ('도윤', 1), ('지훈', 3), ('서연', 3)]
  2단계 점수  [('민서', 92, 1), ('서연', 92, 3), ('도윤', 88, 1), ('지훈', 88, 3)]

한 번에 (점수 내림, 반 오름):
             [('민서', 92, 1), ('서연', 92, 3), ('도윤', 88, 1), ('지훈', 88, 3)]
```

두 방법의 결과가 글자 하나까지 같다. 두 번 정렬한 쪽이 성립하는 이유가 안정성이다. 2단계에서 점수로 다시 줄을 세울 때, 점수가 같은 민서와 서연은 1단계에서 만든 반 순서를 그대로 유지한다.

<figure style="text-align:center; margin:2rem 0;">
<svg viewBox="0 0 500 190" role="img" aria-label="세 줄로 된 그림. 첫 줄은 원본 순서의 학생 네 명, 둘째 줄은 반 번호로 정렬한 뒤, 셋째 줄은 점수 내림차순으로 다시 정렬한 결과다. 점수가 같은 민서와 서연이 셋째 줄에서도 둘째 줄의 앞뒤 순서를 그대로 유지하는 것이 화살표로 표시된다." style="width:100%; max-width:500px; height:auto; font-family:var(--font-sans)">
<defs>
<marker id="hs9-arr" markerWidth="8" markerHeight="8" refX="6.5" refY="2.6" orient="auto"><path d="M0,0 L6.5,2.6 L0,5.2 Z" style="fill:var(--accent-primary)"/></marker>
</defs>
<text x="6" y="14" style="font-size:12.5px; fill:var(--text-secondary)">원본</text>
<g style="fill:var(--bg-secondary); stroke:var(--border-color); stroke-width:1.2">
<rect x="96" y="20" width="88" height="22"/><rect x="188" y="20" width="88" height="22"/>
<rect x="280" y="20" width="88" height="22"/><rect x="372" y="20" width="88" height="22"/></g>
<g style="font-size:12px; fill:var(--text-primary); text-anchor:middle; font-family:var(--font-mono)">
<text x="140" y="35">지훈 3반 88</text><text x="232" y="35">민서 1반 92</text>
<text x="324" y="35">서연 3반 92</text><text x="416" y="35">도윤 1반 88</text></g>
<text x="6" y="84" style="font-size:12.5px; fill:var(--text-secondary)">1단계 · 반</text>
<g style="fill:var(--bg-secondary); stroke:var(--border-color); stroke-width:1.2">
<rect x="188" y="70" width="88" height="22"/><rect x="280" y="70" width="88" height="22"/></g>
<g style="fill:var(--bg-tertiary); stroke:var(--accent-primary); stroke-width:2">
<rect x="96" y="70" width="88" height="22"/><rect x="372" y="70" width="88" height="22"/></g>
<g style="font-size:12px; fill:var(--text-primary); text-anchor:middle; font-family:var(--font-mono)">
<text x="140" y="85">민서 1반 92</text><text x="232" y="85">도윤 1반 88</text>
<text x="324" y="85">지훈 3반 88</text><text x="416" y="85">서연 3반 92</text></g>
<text x="6" y="148" style="font-size:12.5px; fill:var(--text-secondary)">2단계 · 점수</text>
<g style="fill:var(--bg-secondary); stroke:var(--border-color); stroke-width:1.2">
<rect x="280" y="134" width="88" height="22"/><rect x="372" y="134" width="88" height="22"/></g>
<g style="fill:var(--bg-tertiary); stroke:var(--accent-primary); stroke-width:2">
<rect x="96" y="134" width="88" height="22"/><rect x="188" y="134" width="88" height="22"/></g>
<g style="font-size:12px; fill:var(--text-primary); text-anchor:middle; font-family:var(--font-mono)">
<text x="140" y="149">민서 1반 92</text><text x="232" y="149">서연 3반 92</text>
<text x="324" y="149">도윤 1반 88</text><text x="416" y="149">지훈 3반 88</text></g>
<line x1="140" y1="96" x2="140" y2="128" style="stroke:var(--accent-primary); stroke-width:2" marker-end="url(#hs9-arr)"/>
<line x1="416" y1="96" x2="238" y2="128" style="stroke:var(--accent-primary); stroke-width:2" marker-end="url(#hs9-arr)"/>
<text x="278" y="176" style="font-size:12px; fill:var(--accent-primary); text-anchor:middle">92점 둘의 앞뒤가 1단계 그대로다</text>
</svg>
<figcaption style="margin-top:0.75rem; font-size:0.9rem; color:var(--text-muted)">안정 정렬이 아니었다면 2단계에서 민서와 서연의 순서가 뒤바뀔 수 있고, 그러면 1단계가 아무 의미 없어진다. 기준이 셋 이상일 때도 가장 덜 중요한 기준부터 차례로 정렬하면 된다.</figcaption>
</figure>

실무에서는 튜플 `key` 한 번으로 끝내는 편이 낫다. 정렬을 한 번만 하니 더 빠르고, 기준이 코드 한 줄에 다 드러나서 읽기도 쉽다. 두 번 정렬하는 방법은 기준을 **문자열 오름차순과 숫자 내림차순처럼 섞어야 해서** 튜플로 못 묶을 때 쓴다.

여기서 `reverse=True` 의 함정이 나온다. `reverse=True` 는 같은 값끼리의 순서까지 뒤집지는 않는다. 다만 두 겹 기준을 이걸로 처리하려 들면 두 번째 기준의 방향이 의도와 반대가 되기 쉽다. **내림차순이 필요하면 숫자에는 음수 부호를 붙이는 편이 안전하다.**

광고에서 이 두 겹 기준이 매일 돌아가는 자리가 eCPM 줄 세우기다. 예상 수익 순으로 광고를 정렬하되 같은 값이면 다른 기준으로 가른다. 그 구조는 [eCPM 랭킹](post.html?id=ecpm-ranking) 편에서 다룬다.

## 10. 정렬해 놓고 훑기 — 구간 병합과 세 수의 합

**정렬의 진짜 값어치는 정렬 그 자체가 아니라, 정렬한 뒤에 한 번만 훑으면 끝나는 문제로 바뀐다는 데 있다.**

겹치는 구간을 합치는 문제를 보자. 정렬 안 된 상태에서는 모든 구간 쌍을 비교해야 하니 O(n²)이다. 시작점 기준으로 정렬해 두면 **바로 앞 묶음 하나만 보면 된다.** 지금 구간의 시작이 앞 묶음의 끝보다 작거나 같으면 겹친 것이고, 크면 떨어진 것이다.

```python
구간 = [(13, 15), (1, 4), (9, 12), (3, 6), (14, 18)]

정렬 = sorted(구간)
print("정렬 전", 구간)
print("정렬 후", 정렬)
print()

merged = [정렬[0]]
print(f"{'보는 구간':<10}{'마지막 묶음':<12}{'판정':<22}{'결과'}")
for s, e in 정렬[1:]:
    ls, le = merged[-1]
    if s <= le:
        merged[-1] = (ls, max(le, e))
        판정 = f"{s} ≤ {le} 겹친다"
    else:
        merged.append((s, e))
        판정 = f"{s} > {le} 떨어졌다"
    print(f"{str((s,e)):<10}{str((ls,le)):<12}{판정:<22}{merged}")
print()
print("답", merged)
```

```
정렬 전 [(13, 15), (1, 4), (9, 12), (3, 6), (14, 18)]
정렬 후 [(1, 4), (3, 6), (9, 12), (13, 15), (14, 18)]

보는 구간     마지막 묶음      판정                    결과
(3, 6)    (1, 4)      3 ≤ 4 겹친다             [(1, 6)]
(9, 12)   (1, 6)      9 > 6 떨어졌다            [(1, 6), (9, 12)]
(13, 15)  (9, 12)     13 > 12 떨어졌다          [(1, 6), (9, 12), (13, 15)]
(14, 18)  (13, 15)    14 ≤ 15 겹친다           [(1, 6), (9, 12), (13, 18)]

답 [(1, 6), (9, 12), (13, 18)]
```

<figure style="text-align:center; margin:2rem 0;">
<svg viewBox="0 0 500 212" role="img" aria-label="위쪽에 정렬한 다섯 구간이 서로 다른 높이의 가로 막대로 그려져 있고, 아래쪽에 합친 결과 세 구간이 굵은 막대로 그려져 있다. 겹친 구간들이 하나의 굵은 막대로 이어진 것이 보인다." style="width:100%; max-width:500px; height:auto; font-family:var(--font-sans)">
<text x="6" y="14" style="font-size:12.5px; fill:var(--text-secondary)">정렬한 구간 다섯 개</text>
<g style="fill:var(--bg-tertiary); stroke:var(--border-color); stroke-width:1.4">
<rect x="34" y="24" width="66" height="14"/>
<rect x="78" y="44" width="66" height="14"/>
<rect x="210" y="64" width="66" height="14"/>
<rect x="298" y="84" width="44" height="14"/>
<rect x="320" y="104" width="88" height="14"/></g>
<g style="font-size:11px; fill:var(--text-muted); font-family:var(--font-mono)">
<text x="106" y="35">1~4</text><text x="150" y="55">3~6</text><text x="282" y="75">9~12</text>
<text x="348" y="95">13~15</text><text x="414" y="115">14~18</text></g>
<line x1="20" y1="130" x2="470" y2="130" style="stroke:var(--rule); stroke-width:1"/>
<g style="font-size:10.5px; fill:var(--text-muted); text-anchor:middle; font-family:var(--font-mono)">
<text x="34" y="142">1</text><text x="122" y="142">5</text><text x="232" y="142">10</text>
<text x="342" y="142">15</text><text x="408" y="142">18</text></g>
<text x="6" y="164" style="font-size:12.5px; fill:var(--text-secondary)">합친 결과</text>
<g style="fill:var(--bg-secondary); stroke:var(--accent-primary); stroke-width:2.5">
<rect x="34" y="172" width="110" height="14"/>
<rect x="210" y="172" width="66" height="14"/>
<rect x="298" y="172" width="110" height="14"/></g>
<g style="font-size:11px; fill:var(--accent-primary); text-anchor:middle; font-family:var(--font-mono)">
<text x="89" y="202">1~6</text><text x="243" y="202">9~12</text><text x="353" y="202">13~18</text></g>
</svg>
<figcaption style="margin-top:0.75rem; font-size:0.9rem; color:var(--text-muted)">막대를 겹쳐 보면 어디가 붙고 어디가 떨어지는지 눈으로 바로 보인다. 정렬을 해 두면 코드도 이 그림처럼 왼쪽에서 오른쪽으로 한 번만 지나가게 된다.</figcaption>
</figure>

정렬은 앞 편의 양 끝 좁히기와도 짝을 이룬다. 세 수를 더해 0이 되는 조합을 찾는 문제가 대표적이다. 하나를 고정해 놓고 나머지 둘을 양 끝에서 좁히면, 전체가 O(n²)로 내려간다.

```python
ARR = [-4, -1, -1, 0, 1, 2]
ARR.sort()
답, n = [], len(ARR)
for i in range(n - 2):
    if i > 0 and ARR[i] == ARR[i-1]:
        print(f"i={i} 값 {ARR[i]:>2}  앞과 같아서 건너뜀")
        continue
    L, R = i + 1, n - 1
    while L < R:
        s = ARR[i] + ARR[L] + ARR[R]
        기호 = "=" if s == 0 else ("<" if s < 0 else ">")
        움직임 = "찾음" if s == 0 else ("L을 민다" if s < 0 else "R을 당긴다")
        print(f"i={i} 값 {ARR[i]:>2}  L={L}({ARR[L]:>2}) R={R}({ARR[R]:>2})  합 {s:>2} {기호} 0  {움직임}")
        if s == 0:
            답.append((ARR[i], ARR[L], ARR[R]))
            L += 1; R -= 1
            while L < R and ARR[L] == ARR[L-1]: L += 1
        elif s < 0: L += 1
        else:       R -= 1
print("\n답", 답)
```

```
i=0 값 -4  L=1(-1) R=5( 2)  합 -3 < 0  L을 민다
i=0 값 -4  L=2(-1) R=5( 2)  합 -3 < 0  L을 민다
i=0 값 -4  L=3( 0) R=5( 2)  합 -2 < 0  L을 민다
i=0 값 -4  L=4( 1) R=5( 2)  합 -1 < 0  L을 민다
i=1 값 -1  L=2(-1) R=5( 2)  합  0 = 0  찾음
i=1 값 -1  L=3( 0) R=4( 1)  합  0 = 0  찾음
i=2 값 -1  앞과 같아서 건너뜀
i=3 값  0  L=4( 1) R=5( 2)  합  3 > 0  R을 당긴다

답 [(-1, -1, 2), (-1, 0, 1)]
```

정렬해 두면 중복 제거도 공짜로 따라온다. 같은 값이 붙어 있으니 "앞과 같으면 건너뛴다" 한 줄이면 되고, 위 출력에서 `i=2` 가 그렇게 넘어갔다. **집합으로 중복을 거르려 하면 튜플로 감싸야 하고 순서까지 맞춰야 해서 오히려 번거롭다.**

## 한눈 정리

| 상황 | 쓸 것 | 왜 |
|---|---|---|
| 값이 있는지 반복해서 묻는다 | 집합 | 값에서 자리를 계산해 한 번에 간다 |
| 값에 딸린 정보가 필요하다 | 딕셔너리 | 자리와 값을 같이 들고 있다 |
| 지금 값의 짝이 하나로 정해진다 | 딕셔너리 + 한 번 훑기 | 짝을 전부 만들 필요가 없다 |
| 몇 번 나왔는지 센다 | `Counter` | `most_common` 까지 딸려 온다 |
| 열쇠마다 여러 개를 모은다 | `defaultdict(list)` | 첫 등장을 따로 처리 안 해도 된다 |
| 두 목록을 비교한다 | 집합 연산 | 이중 반복문이 기호 하나가 된다 |
| 순서·크기 비교가 필요하다 | 정렬 | 해시는 순서를 버린다 |
| 기준이 둘 이상이다 | 튜플 `key` | 한 번만 정렬하고 기준이 한눈에 보인다 |
| 겹침·중복을 다룬다 | 정렬 후 한 번 훑기 | 같은 것끼리 붙어 있게 된다 |

## 헷갈리기 쉬운 점

- **딕셔너리가 항상 O(1)은 아니다.** 해시값이 한 칸으로 몰리면 O(n)까지 떨어진다. 기본 자료형을 쓰면 걱정할 일이 거의 없지만, `__hash__` 를 직접 짜면 이야기가 달라진다.
- **`3` 과 `3.0` 은 같은 열쇠다.** 나눗셈 결과를 열쇠로 쓰면 정수로 넣은 것과 섞여 조용히 덮어써진다.
- **리스트는 열쇠가 못 된다.** 여러 값을 묶어 열쇠로 쓰려면 튜플로 감싼다.
- **`defaultdict` 는 읽기만 해도 열쇠가 생긴다.** 있는지 확인할 때는 `in` 을 쓴다.
- **집합은 순서가 없다.** 출력 순서가 채점에 영향을 주는 문제라면 마지막에 `sorted` 를 한 번 붙인다.
- **`reverse=True` 와 음수 부호는 다르다.** 기준이 둘 이상이면 음수 부호 쪽이 헷갈릴 여지가 적다.
- **정렬은 원본을 바꿀 수도 있다.** `list.sort()` 는 원본을 바꾸고 `sorted()` 는 새 리스트를 만든다. 원본이 나중에 다시 필요하면 `sorted` 를 쓴다.

## 더 깊이 보기

- 다음 편은 정렬해 둔 배열에서 구간을 절반씩 줄이는 이분 탐색이다. 이 글의 정렬이 그 전제가 된다.
- 해시로 자리를 계산하는 구조는 추천 모델의 임베딩 테이블에도 그대로 쓰인다. [임베딩 테이블 운영](post.html?id=embedding-table-ops) 편에서 칸이 모자랄 때 벌어지는 일을 다룬다.
- 세그먼트 겹침을 집합 연산으로 재는 이야기는 [오디언스 세그멘테이션](post.html?id=audience-segmentation) 편에 있다.
- 두 겹 기준으로 광고를 줄 세우는 실제 사례는 [eCPM 랭킹](post.html?id=ecpm-ranking) 편이다.
