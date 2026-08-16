지훈이 팀에 들어온 첫 주에 이런 말을 들었다. "회원가입은 POST 로 보내고, 목록은 GET 으로 받아 오면 돼요."

알겠다고 답했는데 다음 날 코드를 보다 막혔다. 검색 기능이 `POST /v1/search` 로 되어 있었고, 그런데 그 요청에서 **검색 결과가 돌아오고 있었다.** POST 는 뭔가를 고치거나 만드는 것이라고 배웠는데, 왜 여기서는 데이터를 받아 오고 있을까.

**POST 로 보냈는데 왜 데이터가 돌아올까?**

이 질문에는 사실 오해가 두 겹 들어 있다. 하나는 POST 의 뜻이고, 다른 하나는 **요청과 응답이 별개**라는 사실이다. 이 글은 그 둘을 풀고, 주소 짓기·공개 범위·로그·대량 전송까지 처음 API 를 다룰 때 필요한 것을 한 바퀴 돈다.

> **한 줄 요약:** POST 는 "수정"이 아니라 "이걸 처리해 줘"다. 그리고 HTTP 는 **요청 하나에 응답 하나가 반드시 짝**이라, 메서드가 무엇이든 답은 온다. 메서드는 내가 시키는 일이고 응답은 그 결과라서 서로 다른 이야기다.

> **골라 읽는 법** — 절이 열한 개인 글입니다.
>
> - POST 오해만 풀고 싶으면 → 세 번째·네 번째 절
> - 주소 짓기와 공개 범위 → 다섯째·여섯째 절
> - 로그에 무엇을 남기고, 누가 남기고, 왜 안 맞나 → 일곱째~아홉째 절
> - 대량 전송 → 열째 절
> - 광고에서 어떻게 쓰이는지 → 마지막 절

이 글의 숫자는 전부 설명을 위해 지어낸 값이다. 그리고 이 글에서 **우리**는 API 를 만들어 내주는 쪽, 지훈이 들어간 팀이다.

---

## 1. API 는 정해진 창구다

**API 는 "이 주소로 이런 모양으로 물으면 이런 모양으로 답한다"를 미리 맞춰 둔 것이다.**

사람이 웹사이트를 볼 때는 화면을 본다. 프로그램끼리는 화면이 필요 없으니 **데이터만** 주고받는데, 그러려면 형식을 미리 정해 둬야 한다. 그 약속이 API 다.

요청 한 번은 네 조각으로 되어 있다.

| 조각 | 무엇인가 | 예 |
|---|---|---|
| 메서드 | 무엇을 시키나 | `GET`, `POST` |
| 주소 | 무엇에 대해 | `/v1/posts/12` |
| 헤더 | 곁들이는 정보 | 누구인지, 본문이 무슨 형식인지 |
| 본문 | 딸려 보내는 데이터 | `{"제목": "첫 글"}` |

응답도 비슷하게 세 조각이다. **상태 코드**(숫자 세 자리), **헤더**, **본문**.

여기서 이 글 전체를 관통하는 규칙이 하나 나온다. **요청을 하나 보내면 응답이 하나 온다.** 예외가 없다. 서버가 아무 데이터도 줄 게 없어도 "줄 게 없다"는 응답은 온다.

그러니 "POST 로 보냈는데 답이 왔다"는 이상한 일이 아니다. 답이 안 오는 쪽이 오히려 고장이다. 왜 이게 헷갈리는지는 네 번째 절에서 다시 본다.

## 2. 누가 부르나 — 두 종류

**같은 API 라도 부르는 쪽이 남의 기기냐 우리 서버냐에 따라 지켜야 할 것이 갈린다.**

브라우저나 앱이 부르는 것을 **client to server**, 우리 서버가 다른 서버를 부르는 것을 **server to server** 라 한다. 이 구분이 왜 중요하냐면, 남의 기기에 있는 코드는 **누구나 뜯어볼 수 있기 때문**이다.

<figure style="text-align:center; margin:2rem 0;">
<svg viewBox="0 0 500 190" role="img" aria-label="위쪽에는 브라우저와 앱이 우리 서버를 부르는 그림, 아래쪽에는 우리 서버가 결제사와 지도사 서버를 부르는 그림. 위쪽 화살표에는 남의 손에 있음, 아래쪽 화살표에는 우리 손 안이라는 표시가 붙어 있다." style="width:100%; max-width:500px; height:auto; font-family:var(--font-sans)">
<defs><marker id="ab2-arr" markerWidth="9" markerHeight="9" refX="7.5" refY="3" orient="auto"><path d="M0,0 L7.5,3 L0,6 Z" style="fill:var(--text-muted)"/></marker></defs>
<text x="6" y="14" style="font-size:12px; fill:var(--accent-primary)">client to server — 부르는 코드가 남의 기기에 있다</text>
<g style="fill:var(--bg-tertiary); stroke:var(--accent-primary); stroke-width:1.8">
<rect x="20" y="26" width="86" height="30"/><rect x="20" y="62" width="86" height="30"/></g>
<g style="font-size:12px; fill:var(--text-primary); text-anchor:middle">
<text x="63" y="45">브라우저</text><text x="63" y="81">앱</text></g>
<g style="stroke:var(--text-muted); stroke-width:1.4">
<line x1="110" y1="41" x2="214" y2="52" marker-end="url(#ab2-arr)"/>
<line x1="110" y1="77" x2="214" y2="66" marker-end="url(#ab2-arr)"/></g>
<rect x="220" y="42" width="94" height="34" style="fill:var(--bg-secondary); stroke:var(--border-color); stroke-width:1.8"/>
<text x="267" y="63" style="font-size:12px; fill:var(--text-primary); text-anchor:middle">우리 서버</text>
<text x="6" y="118" style="font-size:12px; fill:var(--accent-secondary)">server to server — 양쪽 다 우리가 관리하거나 계약한 서버다</text>
<g style="stroke:var(--text-muted); stroke-width:1.4">
<line x1="318" y1="52" x2="392" y2="140" marker-end="url(#ab2-arr)"/>
<line x1="318" y1="66" x2="392" y2="172" marker-end="url(#ab2-arr)"/></g>
<g style="fill:var(--bg-tertiary); stroke:var(--accent-secondary); stroke-width:1.8">
<rect x="396" y="126" width="92" height="30"/><rect x="396" y="158" width="92" height="30"/></g>
<g style="font-size:12px; fill:var(--text-primary); text-anchor:middle">
<text x="442" y="145">결제사</text><text x="442" y="177">지도 서비스</text></g>
<text x="130" y="150" style="font-size:11.5px; fill:var(--text-secondary)">위쪽 화살표에는 비밀키를 실을 수 없다.</text>
<text x="130" y="168" style="font-size:11.5px; fill:var(--text-secondary)">앱을 뜯으면 그 키가 그대로 나오기 때문이다.</text>
</svg>
<figcaption style="margin-top:0.75rem; font-size:0.9rem; color:var(--text-muted)">같은 "API 호출"이지만 위와 아래는 다른 문제다. 위쪽은 부르는 쪽을 못 믿는 상태에서 설계해야 하고, 아래쪽은 양쪽 다 우리가 관리하거나 계약한 서버라 훨씬 자유롭다.</figcaption>
</figure>

무엇이 갈리는지 표로 보자.

| | client to server | server to server |
|---|---|---|
| 부르는 코드가 어디 있나 | 남의 브라우저·기기 | 우리 기계실 |
| 비밀키를 넣을 수 있나 | **안 된다** — 뜯으면 보인다 | 된다 |
| 요청값을 믿어도 되나 | 안 된다. 전부 다시 검사한다 | 어느 정도 믿는다 |
| 호출 횟수 | 사용자 수만큼, 들쭉날쭉 | 우리가 정한다 |
| 옛 버전을 언제 끌 수 있나 | 앱을 안 지운 사람이 있는 한 못 끈다 | 양쪽이 합의하면 바로 |

**세 번째 줄이 실무에서 제일 자주 사고를 낸다.** 브라우저가 보낸 `{"가격": 0}` 을 그대로 믿고 주문을 만들면, 누군가 요청을 고쳐 보내는 순간 공짜로 물건이 나간다. 화면에서 막았다는 것은 아무 보장이 아니다. 화면을 안 거치고 요청만 직접 보낼 수 있기 때문이다.

## 3. 메서드 다섯의 뜻

**메서드는 "이 주소에 대해 무엇을 시키는가"다. 여기에 POST 오해의 절반이 들어 있다.**

| 메서드 | 뜻 | 예 |
|---|---|---|
| `GET` | 달라 | 글 목록을 달라 |
| `POST` | **이걸 처리해 줘** | 이 내용으로 글을 새로 써 줘 |
| `PUT` | 이 자리를 이 내용으로 통째로 바꿔 줘 | 12번 글을 이 내용으로 교체 |
| `PATCH` | 이 자리에서 이 부분만 바꿔 줘 | 12번 글의 제목만 교체 |
| `DELETE` | 지워 줘 | 12번 글을 지워 줘 |

**"수정"에 가장 가까운 것은 `PUT` 과 `PATCH` 다.** `POST` 는 수정이 아니라 **제출**에 가깝다. 무언가를 서버에 넘기면서 "알아서 처리해 줘"라고 말하는 것이다.

그래서 `POST` 의 결과는 상황마다 다르다. 글을 새로 만들기도 하고, 로그인을 시켜 주기도 하고, 결제를 걸기도 한다. **공통점은 "서버 쪽에서 무슨 일이 일어난다"는 것뿐이다.**

`GET` 은 반대다. **`GET` 은 아무것도 바꾸지 않아야 한다.** 이것을 지키면 좋은 일이 생긴다. 브라우저는 마음대로 미리 불러 둬도 된다. 부르는 코드는 실패하면 그냥 다시 부르면 된다. 사람은 그 주소를 그대로 공유해도 된다. `GET /v1/posts/12/delete` 같은 주소를 만들면 안 되는 이유가 이것이다. 검색 로봇이 그 주소를 한 번 훑는 것만으로 글이 다 지워진다.

메서드마다 "두 번 보내면 어떻게 되나"가 다른데, 그 이야기는 [API 두 종류와 그 사이의 약속](post.html?id=api-kinds-and-contracts) 편에서 깊게 다룬다.

## 4. POST 인데 왜 답이 오나

**메서드는 "내가 시키는 일"이고, 응답은 "그 결과"다. 둘은 서로 다른 이야기다.**

지훈이 헷갈린 지점이 여기다. "POST = 데이터를 보내는 것"이라고 외우면, 보내기만 하고 받는 것은 없다고 생각하게 된다. 그런데 HTTP 는 **요청 하나마다 응답 하나가 반드시 따라온다.**

직접 돌려 보면 바로 보인다. 아래 코드는 작은 서버와 그 서버를 부르는 코드를 한 파일에 넣은 것이다. 복사해서 그대로 실행하면 된다.

```python
# 서버와 클라이언트를 한 파일에서 같이 돌린다. 복붙해서 바로 실행된다.
# 보려는 것 하나 — 메서드가 무엇이든 응답에는 본문이 딸려 온다.
import json, threading
from http.server import BaseHTTPRequestHandler, HTTPServer
from urllib.request import Request, urlopen

글목록 = [{"id": 11, "제목": "첫 글"}, {"id": 12, "제목": "둘째 글"}]

class 서버(BaseHTTPRequestHandler):
    def _답(self, 코드, 몸):
        몸 = json.dumps(몸, ensure_ascii=False).encode()
        self.send_response(코드)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(몸)))
        self.end_headers()
        self.wfile.write(몸)

    def do_GET(self):                      # 조회
        self._답(200, {"page": 2, "items": 글목록})

    def do_POST(self):
        길이 = int(self.headers.get("Content-Length", 0))
        받은것 = json.loads(self.rfile.read(길이) or b"{}")
        if self.path == "/v1/posts":       # 생성
            self._답(201, {"id": 13, "제목": 받은것["제목"], "상태": "만들어짐"})
        else:                              # 조회인데 POST — 조건이 길어서
            self._답(200, {"조건개수": len(받은것["조건"]), "items": 글목록[:1]})

    def log_message(self, *a): pass        # 서버 접속 로그는 끈다

서버객체 = HTTPServer(("127.0.0.1", 0), 서버)      # 0 = 빈 포트를 알아서 잡는다
주소 = f"http://127.0.0.1:{서버객체.server_port}"
threading.Thread(target=서버객체.serve_forever, daemon=True).start()

def 불러보기(메서드, 길, 보낼것=None):
    몸 = json.dumps(보낼것, ensure_ascii=False).encode() if 보낼것 else None
    요청 = Request(주소 + 길, data=몸, method=메서드,
                   headers={"Content-Type": "application/json"})
    with urlopen(요청) as 답:
        return 답.status, 답.read().decode()

호출들 = [
    ("GET",  "/v1/posts?page=2", None,                                  "글 목록 조회"),
    ("POST", "/v1/posts",        {"제목": "셋째 글"},                     "글 새로 쓰기"),
    ("POST", "/v1/search",       {"조건": ["제목=글", "작성자=지훈"]},     "조건이 긴 검색"),
]

for 메서드, 길, 보낼것, 설명 in 호출들:
    코드, 받은몸 = 불러보기(메서드, 길, 보낼것)
    print(f"{설명}")
    print(f"  보낼 때  {메서드} {길}")
    print(f"           본문 {json.dumps(보낼것, ensure_ascii=False) if 보낼것 else '없음'}")
    print(f"  받을 때  상태 {코드}")
    print(f"           본문 {받은몸}")
    print()

서버객체.shutdown()
print("\n세 요청 모두 받은 본문이 있다. GET 이든 POST 든 답은 온다.")
```

```
글 목록 조회
  보낼 때  GET /v1/posts?page=2
           본문 없음
  받을 때  상태 200
           본문 {"page": 2, "items": [{"id": 11, "제목": "첫 글"}, {"id": 12, "제목": "둘째 글"}]}

글 새로 쓰기
  보낼 때  POST /v1/posts
           본문 {"제목": "셋째 글"}
  받을 때  상태 201
           본문 {"id": 13, "제목": "셋째 글", "상태": "만들어짐"}

조건이 긴 검색
  보낼 때  POST /v1/search
           본문 {"조건": ["제목=글", "작성자=지훈"]}
  받을 때  상태 200
           본문 {"조건개수": 2, "items": [{"id": 11, "제목": "첫 글"}]}


세 요청 모두 받은 본문이 있다. GET 이든 POST 든 답은 온다.
```

세 줄을 나란히 보면 오해가 풀린다. **보낼 때 본문이 있느냐 없느냐와, 받을 때 본문이 있느냐 없느냐는 서로 상관이 없다.**

- `GET` 은 보낸 본문이 없는데 받은 본문은 있다
- `POST /v1/posts` 는 둘 다 있다. 새로 만들어진 글 번호 13 을 알려 준다
- `POST /v1/search` 도 둘 다 있다. **이건 아무것도 안 만들었는데 POST 다**

마지막 것이 지훈이 본 코드다. 검색인데 왜 `POST` 를 썼을까.

**조건이 주소에 안 들어가서다.** `GET` 은 조건을 주소 뒤에 붙이는데(`?제목=글&작성자=지훈`), 조건이 스무 개쯤 되거나 값이 길면 주소가 감당을 못 한다. 서버나 중간 장비가 주소 길이를 제한하는 경우도 많다. 그래서 조건을 본문에 담아 `POST` 로 보낸다.

이것은 원칙을 어긴 것이 맞다. **원칙대로면 조회는 `GET` 이다.** 다만 현실적인 이유로 `POST` 를 쓰는 것이고, 그럴 때는 주소에 `search` 처럼 "이건 조회다"를 남겨 둔다. 이 절충을 알고 쓰는 것과 모르고 쓰는 것이 다르다.

:::deep 상태 코드 세 자리를 다 외워야 하나

안 외워도 된다. **첫 자리만 알면 90%는 읽힌다.** 전부 서버가 하는 말이다. 2xx 는 "됐다", 3xx 는 "다른 데로 가라"는 뜻이다. 4xx 는 "네가 잘못 보냈다", 5xx 는 "내가 처리를 못 했다"다.

이 중 4xx 와 5xx 를 가르는 것이 실무에서 가장 중요하다. 부르는 쪽이면 4xx 가 뜰 때 요청을 고치고, 5xx 가 뜰 때 서버 담당자에게 알린다. **같은 실패라도 할 일이 정반대다.**

자주 보는 것은 일곱 개쯤이고 나머지는 필요할 때 찾아보면 된다.

| 코드 | 뜻 | 누가 고치나 |
|---|---|---|
| `200` | 됐다 | — |
| `201` | 새로 만들었다 | — |
| `400` | 요청 모양이 틀렸다 | 부르는 쪽 |
| `401` | 네가 누군지 모르겠다 | 부르는 쪽 |
| `403` | 누군지는 알겠는데 권한이 없다 | 부르는 쪽 |
| `404` | 그런 것 없다 | 부르는 쪽 |
| `500` | 서버가 터졌다 | 받는 쪽 |

`401` 과 `403` 을 헷갈리기 쉬운데, **로그인을 안 한 것이 401 이고 로그인은 했지만 남의 글을 지우려는 것이 403** 이다.

한 가지 절대 하지 말아야 할 것이 있다. **`200` 을 보내 놓고 본문에 "실패했습니다"를 담는 것.** 부르는 쪽 코드는 상태 코드만 보고 성공으로 처리하고, 감시 도구도 오류로 안 센다. 실패가 조용히 묻힌다.
:::

## 5. 주소를 어떻게 짓나

**주소에는 "무엇"만 넣고 "무엇을 하는지"는 메서드에 맡긴다.**

주소 짓기에 정답은 없지만 널리 쓰는 관례가 있고, 그것만 따라도 남이 읽기 쉬워진다.

| 규칙 | 나쁜 예 | 좋은 예 |
|---|---|---|
| 동사를 넣지 않는다 | `/getPost`, `/createUser` | `GET /posts/12`, `POST /users` |
| 복수형 명사를 쓴다 | `/post/12` | `/posts/12` |
| 소속은 경로로 나타낸다 | `/comments?postId=12` | `/posts/12/comments` |
| 소문자와 하이픈을 쓴다 | `/userProfile`, `/user_profile` | `/user-profiles` |
| 버전을 앞에 붙인다 | `/posts` | `/v1/posts` |

**첫 줄이 핵심이다.** 동사를 주소에 넣으면 메서드와 뜻이 겹친다. `POST /createUser` 는 "만들어라"를 두 번 말하는 셈이고, 그러다 보면 `POST /deleteUser` 같은 것도 생긴다.

주소가 명사면 같은 주소에 메서드만 바꿔 여러 일을 시킬 수 있다.

| 메서드 + 주소 | 하는 일 |
|---|---|
| `GET /v1/posts` | 글 목록을 본다 |
| `POST /v1/posts` | 글을 새로 쓴다 |
| `GET /v1/posts/12` | 12번 글을 본다 |
| `PATCH /v1/posts/12` | 12번 글의 일부를 고친다 |
| `DELETE /v1/posts/12` | 12번 글을 지운다 |
| `GET /v1/posts/12/comments` | 12번 글의 댓글을 본다 |

여섯 줄이 규칙 없이 지은 이름 여섯 개보다 외우기 쉽다. **처음 보는 사람도 `/v1/posts/12/likes` 가 무엇일지 짐작할 수 있다.**

버전을 앞에 붙이는 이유는 나중에 응답 모양을 바꿔야 할 때가 오기 때문이다. `/v1` 을 살려 둔 채 `/v2` 를 새로 열면, 옛 앱은 계속 `/v1` 을 쓰고 새 앱만 `/v2` 로 옮겨 간다. 두 번째 절에서 본 "앱을 안 지운 사람이 있는 한 옛 버전을 못 끈다"가 여기서 살아난다.

## 6. 어디까지 열어 두나

**"API 를 연다"는 것은 주소를 알려 주는 일이 아니라 등급을 정하는 일이다.**

같은 서버 안에 있는 API 라도 누가 부를 수 있게 할지가 다르다. 크게 세 등급으로 나눈다.

| 등급 | 누가 부르나 | 어떻게 막나 | 바꿀 때 |
|---|---|---|---|
| 내부용 | 사내 서버끼리 | 망 자체를 분리 | 양쪽 배포만 맞추면 된다 |
| 파트너용 | 계약한 회사 | 회사마다 키를 따로 발급 | 미리 알리고 유예 기간을 둔다 |
| 공개용 | 아무나 | 가입하면 키를 준다 | 함부로 못 바꾼다 |

**아래로 갈수록 바꾸기 어려워진다.** 이것이 등급을 나누는 진짜 이유다. 내부용은 오늘 고쳐서 오늘 배포해도 되지만, 공개용은 누가 쓰는지도 모르니 한 번 연 모양을 오래 지켜야 한다.

그래서 실무에서 자주 하는 실수가 **"일단 다 열어 두고 나중에 정리하자"** 다. 열어 둔 것을 나중에 닫으려면 쓰는 쪽을 전부 찾아 설득해야 한다. **처음에 좁게 열고 필요할 때 넓히는 쪽이 언제나 싸다.**

등급을 정했으면 그다음 셋을 정한다.

**첫째, 누구인지 확인하는 방법.** 내부용은 망 분리로 충분하고, 파트너·공개용은 키나 토큰을 준다. 어떤 방식이 무엇을 막고 무엇을 못 막는지는 [API 두 종류와 그 사이의 약속](post.html?id=api-kinds-and-contracts) 편에 정리돼 있다.

**둘째, 얼마나 자주 부를 수 있는지.** 한 키가 초당 몇 번까지 부를 수 있는지를 정해 두지 않으면, 한 곳이 실수로 반복 호출을 걸었을 때 다른 모두가 같이 느려진다.

**셋째, 무엇을 문서로 남길지.** 주소·요청 모양·응답 모양·오류 목록 넷은 최소한이다. 이게 없으면 부르는 쪽이 매번 물어보거나, 더 나쁘게는 추측해서 짠다.

## 7. 로그를 어떻게 남기나

**요청 하나가 지나갈 때마다 한 줄을 남긴다. 무엇을 넣고 무엇을 가릴지가 전부다.**

장애가 났을 때 "그 요청이 언제 들어왔고 뭐라고 답했나"를 못 찾으면 원인을 못 찾는다. 그런데 아무거나 다 남기면 비밀번호와 카드번호가 로그에 그대로 박힌다.

```python
import json

# 요청 하나가 들어왔다 나갈 때 서버가 남기는 줄. 실제 값 대신 설명용으로 지어낸 값이다.
요청 = {
    "method": "POST",
    "path": "/v1/users/login",
    "body": {"email": "jihun@example.com", "password": "hunter2", "card": "4111-1111-1111-1234"},
    "headers": {"Authorization": "Bearer eyJhbGciOi...", "User-Agent": "app/3.2.1"},
}

가릴것 = {"password", "card", "authorization", "token", "ssn"}

def 가리기(값):
    """민감한 칸은 값을 지우되 '있었다'는 사실은 남긴다. 통째로 빼면 나중에 못 따진다."""
    if isinstance(값, dict):
        return {k: ("***" if k.lower() in 가릴것 else 가리기(v)) for k, v in 값.items()}
    return 값

한줄 = {
    "ts": "2026-08-15T10:22:03.114Z",
    "request_id": "req-8f21c0",          # 이 요청을 나중에 찾을 열쇠
    "method": 요청["method"],
    "path": 요청["path"],
    "status": 401,
    "took_ms": 37,
    "body": 가리기(요청["body"]),
    "headers": 가리기(요청["headers"]),
}

print("그냥 남기면 — 비밀번호와 카드번호가 로그에 그대로 박힌다")
print(" ", json.dumps({"body": 요청["body"]}, ensure_ascii=False))
print()
print("가리고 남기면")
for k, v in 한줄.items():
    print(f"  {k:<12}{json.dumps(v, ensure_ascii=False) if isinstance(v, dict) else v}")
print()
print("한 줄로 붙이면 (검색·집계는 이 형태가 편하다)")
print(" ", json.dumps(한줄, ensure_ascii=False))
```

```
그냥 남기면 — 비밀번호와 카드번호가 로그에 그대로 박힌다
  {"body": {"email": "jihun@example.com", "password": "hunter2", "card": "4111-1111-1111-1234"}}

가리고 남기면
  ts          2026-08-15T10:22:03.114Z
  request_id  req-8f21c0
  method      POST
  path        /v1/users/login
  status      401
  took_ms     37
  body        {"email": "jihun@example.com", "password": "***", "card": "***"}
  headers     {"Authorization": "***", "User-Agent": "app/3.2.1"}

한 줄로 붙이면 (검색·집계는 이 형태가 편하다)
  {"ts": "2026-08-15T10:22:03.114Z", "request_id": "req-8f21c0", "method": "POST", "path": "/v1/users/login", "status": 401, "took_ms": 37, "body": {"email": "jihun@example.com", "password": "***", "card": "***"}, "headers": {"Authorization": "***", "User-Agent": "app/3.2.1"}}
```

세 가지를 짚어야 한다.

**첫째, `request_id` 가 가장 중요한 칸이다.** 요청이 들어올 때 고유한 값을 하나 붙이고, 그 요청을 처리하며 남기는 모든 줄에 같은 값을 넣는다. 그러면 나중에 그 값 하나로 관련된 줄을 전부 모을 수 있다. 응답 헤더로 돌려주면 사용자가 "이 번호로 문의드립니다"라고 말할 수 있어 더 좋다.

**둘째, 가릴 때 통째로 빼지 않는다.** `password` 칸을 아예 지우면 나중에 "비밀번호를 보내긴 했나"를 못 따진다. 값만 `***` 로 바꾸고 칸은 남긴다.

**셋째, `took_ms` 를 꼭 넣는다.** 느려졌을 때 어디가 느린지 찾는 출발점이 이 값이다. 상태 코드만 있으면 "성공은 했는데 3초 걸렸다"를 못 본다.

한 가지 더. **모든 요청의 본문을 다 남기면 로그가 원본 데이터보다 커진다.** 초당 수천 건이 들어오는 API 라면 본문은 오류가 났을 때만 남기거나, 일부만 골라 남긴다.

## 8. 그 로그는 누가 남기나

**로그는 두 종류다. 받는 쪽이 저절로 남기는 줄과, 부르는 쪽이 일부러 보내야 남는 줄.**

앞 절에서 본 줄은 받는 쪽이 남긴 것이다. 요청이 들어오면 한 줄 남는다. **이건 코드를 안 짜도 남는다.** 웹 서버나 프레임워크가 알아서 해 준다. 이것을 접속 로그라 부른다.

그런데 실무에서 이런 것을 본다. **부르는 쪽이 로그를 남기겠다며 서버를 한 번 더 부른다.** `POST /v1/events` 같은 주소로 "이런 일이 있었다"를 보낸다. 받는 쪽이 어차피 한 줄 남기는데 왜 이러나.

**서버는 자기한테 온 것만 알기 때문이다.**

광고가 화면에 실제로 떴는지, 사용자가 그것을 눌렀는지를 서버는 알 길이 없다. 서버는 광고를 내려 줬을 뿐이다. 그 뒤로 기기 안에서 무슨 일이 있었는지는 안 보인다. 그 사실을 서버 쪽으로 넘기는 수단은 요청 하나뿐이다.

<figure style="text-align:center; margin:2rem 0;">
<svg viewBox="0 0 500 336" role="img" aria-label="위쪽 점선 상자 안에 광고가 화면에 떴다와 사용자가 눌렀다가 놓여 있고, 서버는 이 둘을 모른다. 그 아래로 두 경로가 우리 서버로 내려간다. 왼쪽은 앱 SDK 가 POST 로 본문을 담아 보내는 길, 오른쪽은 웹 지면이 GET 으로 주소만 부르는 길이다. 서버에서 다시 두 갈래로 갈라져 접속 로그와 이벤트 로그가 된다." style="width:100%; max-width:500px; height:auto; font-family:var(--font-sans)">
<defs><marker id="ab8-arr" markerWidth="9" markerHeight="9" refX="7.5" refY="3" orient="auto"><path d="M0,0 L7.5,3 L0,6 Z" style="fill:var(--text-muted)"/></marker></defs>
<text x="250" y="16" style="font-size:12px; fill:var(--accent-primary); text-anchor:middle">서버가 모르는 구간 — 기기 안에서만 일어난 일</text>
<rect x="110" y="24" width="280" height="44" style="fill:none; stroke:var(--text-muted); stroke-width:1.3; stroke-dasharray:6 4"/>
<text x="250" y="51" style="font-size:12.5px; fill:var(--text-primary); text-anchor:middle">광고가 화면에 떴다 · 사용자가 눌렀다</text>
<g style="font-size:12.5px; fill:var(--accent-secondary); text-anchor:middle">
<text x="125" y="88">앱 SDK</text><text x="375" y="88">웹 지면</text></g>
<g style="font-size:11.5px; fill:var(--text-secondary); text-anchor:middle; font-family:var(--font-mono)">
<text x="125" y="105">POST /v1/events</text><text x="375" y="105">GET /p.gif?ad=77</text></g>
<g style="font-size:11.5px; fill:var(--text-muted); text-anchor:middle">
<text x="125" y="122">본문에 담아 보낸다</text><text x="375" y="122">주소만 부르고 만다</text></g>
<g style="stroke:var(--text-muted); stroke-width:1.4">
<line x1="125" y1="132" x2="206" y2="162" marker-end="url(#ab8-arr)"/>
<line x1="375" y1="132" x2="294" y2="162" marker-end="url(#ab8-arr)"/></g>
<rect x="190" y="168" width="120" height="32" style="fill:var(--bg-secondary); stroke:var(--border-color); stroke-width:1.8"/>
<text x="250" y="189" style="font-size:12.5px; fill:var(--text-primary); text-anchor:middle">우리 서버</text>
<g style="stroke:var(--text-muted); stroke-width:1.4">
<line x1="218" y1="202" x2="142" y2="228" marker-end="url(#ab8-arr)"/>
<line x1="282" y1="202" x2="358" y2="228" marker-end="url(#ab8-arr)"/></g>
<rect x="26" y="232" width="190" height="64" style="fill:var(--bg-tertiary); stroke:var(--accent-primary); stroke-width:1.8"/>
<rect x="284" y="232" width="190" height="64" style="fill:var(--bg-tertiary); stroke:var(--accent-secondary); stroke-width:1.8"/>
<g style="font-size:12.5px; fill:var(--text-primary); text-anchor:middle">
<text x="121" y="251">① 접속 로그</text><text x="379" y="251">② 이벤트 로그</text></g>
<g style="font-size:11.5px; fill:var(--text-secondary); text-anchor:middle">
<text x="121" y="268">요청이 왔다는 사실</text><text x="379" y="268">본문을 꺼내 저장한 것</text></g>
<g style="font-size:11.5px; fill:var(--text-muted); text-anchor:middle">
<text x="121" y="285">코드 없이 남는다</text><text x="379" y="285">코드로 짜야 남는다</text></g>
<text x="250" y="320" style="font-size:11.5px; fill:var(--text-secondary); text-anchor:middle">픽셀은 보낼 본문이 없다. ① 한 줄이 그대로 기록이 된다.</text>
</svg>
<figcaption style="margin-top:0.75rem; font-size:0.9rem; color:var(--text-muted)">부르는 쪽이 서버라면 이 그림이 필요 없다. 자기 디스크에 쓰면 그만이다. 남길 데가 없어 보내야 하는 것은 브라우저와 앱이다.</figcaption>
</figure>

그래서 클릭 한 번에 서버 쪽 줄이 둘 생긴다. 하나는 요청이 왔다는 접속 로그고, 하나는 본문을 꺼내 저장한 이벤트 로그다. 같은 사건을 두 번 적는 것처럼 보이지만 적는 내용이 다르다.

**웹 픽셀이 가장 노골적이다.** 1×1 짜리 투명 이미지 주소를 부르기만 한다. 보낼 본문도 없고 받은 답을 쓰지도 않는다. 그 요청이 남긴 접속 로그 한 줄이 곧 기록이다. GET 픽셀과 POST 묶음이 어떻게 갈리는지는 [로그 수집기 안을 열어 본다](post.html?id=log-hops-to-kafka) 편 1절에 있다.

**클릭은 지나가게 해서 남기기도 한다.** 광고를 누르면 광고주 페이지로 바로 안 간다. 트래킹 서버 주소를 한 번 거친다. 그 서버가 클릭을 적고 진짜 주소로 넘긴다. 이 경로는 [광고가 유저에게 도달하는 전체 과정](post.html?id=ad-serving-flow) 편 11절에 있다.

**부르는 쪽이 서버면 얘기가 다르다.** 자기 디스크에 쓰면 되니 남기려고 남을 부를 일이 없다. 보낼 데가 없는 것은 브라우저와 앱이다.

그러니 답은 이렇다. **일반적이다.** 부르는 쪽이 남의 기기에 있으면 그 방법밖에 없다.

## 9. 두 로그가 다른 말을 할 때

**같은 요청에 줄이 둘 남는데, 그 둘이 자주 다른 말을 한다.**

둘이 재는 것부터 다르다. 부르는 쪽은 요청을 보낸 순간부터 답이 다 올 때까지를 잰다. 받는 쪽은 자기가 처리한 시간만 잰다. 그 차이가 오가는 데 걸린 시간이다.

더 중요한 것이 있다. **서버에 도착도 못 한 요청은 서버 로그에 없다.** 네 가지 상황을 실제로 돌려 보면 바로 보인다.

```python
# 서버와 부르는 쪽을 한 파일에서 같이 돌린다. 복붙해서 바로 실행된다.
# 보려는 것 하나 — 요청 하나에 로그가 양쪽에 한 줄씩 남고, 그 두 줄이 서로 다르다.
import json, time, socket, threading
from http.server import BaseHTTPRequestHandler, HTTPServer
from urllib.request import Request, urlopen
from urllib.error import HTTPError, URLError

부르는쪽로그, 받는쪽로그 = [], []

class 서버(BaseHTTPRequestHandler):
    def do_POST(self):
        잰때 = time.perf_counter()
        self.rfile.read(int(self.headers.get("Content-Length", 0)))
        번호 = self.headers.get("X-Request-Id", "없음")
        if self.path.endswith("/slow"):
            time.sleep(1.0)                    # 부르는 쪽은 이 사이에 포기한다
            코드 = 200
        elif self.path.endswith("/broken"):
            코드 = 500
        else:
            코드 = 200
        # 답을 쓰기 전에 남긴다. 답이 못 나가도 처리한 사실은 남아야 한다.
        받는쪽로그.append({"req": 번호, "status": 코드,
                        "took_ms": (time.perf_counter() - 잰때) * 1000})
        try:
            self.send_response(코드)
            self.send_header("Content-Length", "2")
            self.end_headers()
            self.wfile.write(b"{}")
        except OSError:                        # 부르는 쪽이 이미 끊었다
            pass

    def log_message(self, *a): pass            # 기본 접속 로그는 끈다

서버객체 = HTTPServer(("127.0.0.1", 0), 서버)
주소 = f"http://127.0.0.1:{서버객체.server_port}"
threading.Thread(target=서버객체.serve_forever, daemon=True).start()

빈칸 = socket.socket(); 빈칸.bind(("127.0.0.1", 0))
죽은주소 = f"http://127.0.0.1:{빈칸.getsockname()[1]}"   # 아무도 안 듣는 포트
빈칸.close()

def 부르기(번호, 어디, 길, 기다릴초):
    잰때 = time.perf_counter()
    요청 = Request(어디 + 길, data=b"{}", method="POST",
                 headers={"X-Request-Id": 번호, "Content-Type": "application/json"})
    try:
        with urlopen(요청, timeout=기다릴초) as 답:
            결과 = str(답.status)
    except HTTPError as e:                     # 답은 왔는데 4xx·5xx 다
        결과 = str(e.code)
    except (TimeoutError, socket.timeout):
        결과 = "타임아웃"
    except URLError as e:
        결과 = "타임아웃" if isinstance(e.reason, (TimeoutError, socket.timeout)) else "연결 실패"
    부르는쪽로그.append({"req": 번호, "결과": 결과,
                     "took_ms": (time.perf_counter() - 잰때) * 1000})

호출들 = [
    ("req-1", 주소,     "/v1/events",        5.0, "정상"),
    ("req-2", 주소,     "/v1/events/broken", 5.0, "서버가 터졌다"),
    ("req-3", 죽은주소, "/v1/events",        5.0, "서버가 안 떠 있다"),
    ("req-4", 주소,     "/v1/events/slow",   0.2, "답을 기다리다 포기했다"),
]

for 번호, 어디, 길, 기다릴초, _ in 호출들:
    부르기(번호, 어디, 길, 기다릴초)

time.sleep(1.3)                                # 마지막 요청을 서버가 끝낼 때까지 기다린다
서버객체.shutdown()

부른것 = {r["req"]: r for r in 부르는쪽로그}
받은것 = {r["req"]: r for r in 받는쪽로그}

def 한줄(칸): return json.dumps(칸, ensure_ascii=False)

for 번호, _, _, _, 설명 in 호출들:
    남긴줄 = 받은것.get(번호)
    print(설명)
    print(f"  부르는 쪽  {한줄({'req': 번호, '결과': 부른것[번호]['결과']})}")
    print(f"  받는 쪽    {한줄({'req': 번호, 'status': 남긴줄['status']}) if 남긴줄 else '줄이 없다'}")
    print()

print(f"남은 줄 수 — 부르는 쪽 {len(부르는쪽로그)}줄 · 받는 쪽 {len(받는쪽로그)}줄")
print(f"req-1 이 걸린 시간 — 부르는 쪽 >= 받는 쪽 : "
      f"{부르는쪽로그[0]['took_ms'] >= 받은것['req-1']['took_ms']}")
print("받는 쪽 로그만 보면 req-3 은 아예 없고 req-4 는 성공이다.")
```

```
정상
  부르는 쪽  {"req": "req-1", "결과": "200"}
  받는 쪽    {"req": "req-1", "status": 200}

서버가 터졌다
  부르는 쪽  {"req": "req-2", "결과": "500"}
  받는 쪽    {"req": "req-2", "status": 500}

서버가 안 떠 있다
  부르는 쪽  {"req": "req-3", "결과": "연결 실패"}
  받는 쪽    줄이 없다

답을 기다리다 포기했다
  부르는 쪽  {"req": "req-4", "결과": "타임아웃"}
  받는 쪽    {"req": "req-4", "status": 200}

남은 줄 수 — 부르는 쪽 4줄 · 받는 쪽 3줄
req-1 이 걸린 시간 — 부르는 쪽 >= 받는 쪽 : True
받는 쪽 로그만 보면 req-3 은 아예 없고 req-4 는 성공이다.
```

걸린 시간은 실행할 때마다 달라서 값 대신 대소만 찍었다. 부르는 쪽이 잰 값이 늘 더 크다.

세 번째와 네 번째 요청이 요점이다.

- `req-3` 은 받는 쪽에 줄이 아예 없다. 서버가 안 떠 있었으니 서버는 이 요청을 모른다
- `req-4` 는 받는 쪽에 `200` 으로 남았다. 서버는 처리를 끝냈는데 답이 늦어 부르는 쪽이 먼저 포기했다

**받는 쪽 로그만 보면 두 건 다 문제가 안 보인다.** 하나는 없고 하나는 성공이다. 그런데 부른 쪽은 둘 다 실패했다.

그래서 어느 쪽이 정본이냐가 상황에 따라 갈린다.

**돈에 닿는 숫자는 받는 쪽이 정본이다.** 과금·정산·리포트에 쓰는 건수는 서버가 센 것을 쓴다. 남의 기기가 보낸 숫자는 고쳐 보낼 수 있어서다. 두 번째 절 세 번째 줄과 같은 이유다.

**반대로 "얼마나 실패했나"는 부르는 쪽 로그로만 보인다.** 도착 못 한 요청은 서버가 셀 수 없다. 서버 그래프는 평평한데 사용자만 안 되는 일이 그래서 생긴다.

두 줄을 이으려면 요청 번호를 양쪽이 같이 써야 한다. 부르는 쪽이 `X-Request-Id` 같은 헤더에 값을 만들어 보내고, 받는 쪽이 그 값을 그대로 자기 줄에 적는다. 헤더가 없으면 받는 쪽이 만든다. 앞 절의 `request_id` 가 여기서 살아난다.

여기서 8절의 함정이 되살아난다. 부르는 쪽이 브라우저나 앱이면 그 줄은 요청으로 보내야 남는데, **그 전송도 실패할 수 있다.** 신호가 끊긴 곳에서는 실패 기록조차 못 보낸다. 그래서 부르는 쪽 로그는 모아 뒀다가 되는 대로 다시 보낸다.

중간에 게이트웨이나 프록시가 있으면 그것도 자기 줄을 남긴다. 그러면 한 요청에 줄이 셋이다. 무엇이 어디에 끼는지는 [게이트웨이·인그레스·라우터](post.html?id=gateway-ingress-router) 편에 있다.

광고에서 노출·클릭·전환을 각각 누가 알리는지는 [광고 로그 파이프라인](post.html?id=ad-log-pipeline) 편이 열 종류를 기록 주체까지 정리해 뒀다.

## 10. 대량 데이터 — 한 번에 다 못 준다

**API 로 대량 데이터를 주고받을 수는 있다. 다만 한 번의 요청에 다 담지 않는다.**

클릭 로그 100만 줄을 넘겨야 한다고 하자. 방법마다 요청 크기가 어떻게 달라지는지 재 보자.

```python
import json, gzip, io, random

random.seed(15)

# 클릭 로그를 API 로 넘긴다고 하자. 설명을 위해 지어낸 값이다.
def 한줄만들기(i):
    return {"click_id": f"c-{i:07d}",
            "ts": f"2026-08-15T{i//3600%24:02d}:{i//60%60:02d}:{i%60:02d}Z",
            "ad_id": random.randrange(1000, 9999),
            "user": f"u-{random.randrange(10**5, 10**6)}"}

표본 = [json.dumps(한줄만들기(i), ensure_ascii=False) for i in range(10_000)]
줄크기 = sum(len(s.encode()) for s in 표본) // len(표본)
총줄수 = 1_000_000
총바이트 = 줄크기 * 총줄수

원본 = "\n".join(표본).encode()
버퍼 = io.BytesIO()
with gzip.GzipFile(fileobj=버퍼, mode="wb", compresslevel=6) as f:
    f.write(원본)
압축률 = len(버퍼.getvalue()) / len(원본)

print(f"한 줄 평균 {줄크기}바이트 · {총줄수:,}줄 = {총바이트/1024/1024:.0f}MB")
print()
print(f"{'보내는 방법':<24}{'요청 수':>9}{'한 번에 보내는 크기':>20}")
print(f"{'한 번에 다':<22}{1:>9,}{f'{총바이트/1024/1024:.0f}MB':>20}")
for 묶음 in (1_000, 10_000):
    print(f"{f'{묶음:,}줄씩 나눠':<21}{총줄수//묶음:>9,}{f'{묶음*줄크기/1024:.0f}KB':>20}")
print(f"{'10,000줄씩 + gzip':<21}{100:>9,}{f'{10_000*줄크기*압축률/1024:.0f}KB':>20}")

print()
print(f"gzip 압축률 {압축률:.1%} — 줄마다 값은 달라도 열쇠 이름이 반복돼 이만큼 준다")
print(f"{총바이트/1024/1024:.0f}MB 를 그대로 보내면 받는 쪽이 다 받을 때까지 아무것도 못 한다.")
print(f"10,000줄씩 나누면 요청 하나가 {10_000*줄크기/1024:.0f}KB 라, 중간에 끊겨도 그 묶음만 다시 보낸다.")
```

```
한 줄 평균 90바이트 · 1,000,000줄 = 86MB

보내는 방법                       요청 수         한 번에 보내는 크기
한 번에 다                        1                86MB
1,000줄씩 나눠               1,000                88KB
10,000줄씩 나눠                100               879KB
10,000줄씩 + gzip            100               131KB

gzip 압축률 14.9% — 줄마다 값은 달라도 열쇠 이름이 반복돼 이만큼 준다
86MB 를 그대로 보내면 받는 쪽이 다 받을 때까지 아무것도 못 한다.
10,000줄씩 나누면 요청 하나가 879KB 라, 중간에 끊겨도 그 묶음만 다시 보낸다.
```

맨 위 줄이 문제다. 86MB 를 한 요청에 담으면 세 가지가 한꺼번에 나빠진다. 받는 쪽이 다 받을 때까지 아무것도 못 하고, 중간에 끊기면 처음부터 다시 보내야 하고, 서버가 그 전부를 메모리에 올려야 한다.

나눠 보내면 셋 다 풀린다. **10,000줄씩 100번 나누면 요청 하나가 879KB 라, 끊겨도 그 묶음만 다시 보낸다.** 압축을 걸면 131KB 까지 준다. 로그처럼 같은 열쇠 이름이 반복되는 데이터는 압축이 잘 듣는다.

크기와 방향에 따라 쓰는 방법이 갈린다.

| 상황 | 방법 |
|---|---|
| 보내는 쪽이다, 크지 않다 | 묶음으로 나눠 여러 번 `POST` |
| 보내는 쪽이다, 아주 크다 | 파일로 올려 두고 그 위치만 알려 준다 |
| 받아 오는 쪽이다 | 조금씩 나눠 받고, 다음 위치를 응답이 알려 준다 |
| 만드는 데 오래 걸린다 | 요청은 접수만 받고 번호를 준다. 나중에 그 번호로 결과를 찾아간다 |

**마지막 줄이 초보가 잘 모르는 방식이다.** 한 달치 정산 자료처럼 만드는 데 몇 분씩 걸리는 것은 그 자리에서 못 준다. 그래서 `POST /v1/reports` 로 "만들어 줘"라고 요청하면 서버는 `202` 와 함께 접수 번호만 준다. 부르는 쪽은 `GET /v1/reports/{번호}` 로 가끔 확인하다가 다 됐을 때 받아 간다.

받아 올 목록을 서버가 어떻게 끊어 주는지는 [API 두 종류와 그 사이의 약속](post.html?id=api-kinds-and-contracts) 편에 성능 비교까지 있다.

## 11. 광고에서는 이렇게 쓴다

**앞의 열 절이 실제 API 하나에 어떻게 한꺼번에 들어가는지 보자.**

광고를 클릭하면 그 사실을 서버에 알려야 한다. 이 API 하나를 만든다고 하면 정할 것이 순서대로 나온다.

| 정할 것 | 이 경우의 답 | 몇 절 |
|---|---|---|
| 누가 부르나 | 사용자 기기 — client to server | 2절 |
| 그래서 무엇을 조심하나 | 비밀키를 못 싣는다. 보낸 값을 다시 검사한다 | 2절 |
| 메서드는 | `POST` — 서버에 기록이 생긴다 | 3절 |
| 주소는 | `POST /v1/events` | 5절 |
| 응답은 무엇을 주나 | `202` 와 접수 번호. 기록이 끝날 때까지 안 기다린다 | 4절 |
| 누구에게 여나 | 아무나 부를 수 있다. 대신 값을 안 믿는다 | 6절 |
| 로그에 무엇을 남기나 | 요청 번호·상태·걸린 시간. 사용자 식별값은 가린다 | 7절 |
| 그 로그를 누가 남기나 | 앱이 알려야 서버가 안다. 못 보낸 클릭은 서버에 없다 | 8절 |
| 몰아서 보낼 수 있나 | 앱이 클릭을 모아 뒀다 한 번에 보낸다 | 10절 |

다섯째 줄이 광고에서 특히 중요하다. **클릭을 눌렀는데 화면이 멈추면 안 되니, 기록이 다 끝날 때까지 기다리지 않고 "받았다"만 먼저 답한다.** 실제 저장은 서버가 응답을 보낸 뒤 이어서 한다.

여덟째 줄이 8절에서 본 그것이다. 앱이 못 보낸 클릭은 서버 로그에 없으니, 앱이 자기 쪽 실패 건수를 따로 세어 보내야 한다. 그것마저 못 보내면 아무 데도 안 남는다.

아홉째 줄도 마찬가지다. 클릭 하나마다 요청을 보내면 지하철에서 신호가 약할 때 다 실패한다. 그래서 앱이 클릭 몇 개를 모아 뒀다가 한 번에 보내고, 실패하면 그 묶음만 다시 보낸다. 10절에서 본 방식 그대로다.

**처음 API 를 만들 때의 순서도 이 표와 같다.** 누가 부르는지부터 정하고, 그다음 메서드와 주소를 정하고, 그다음 응답 모양과 공개 범위를 정하고, 마지막에 로그와 대량 처리를 얹는다. 순서를 뒤집어 코드부터 짜면 대체로 처음 세 줄을 다시 정하게 된다.

## 한눈 정리

| 질문 | 한 줄 답 |
|---|---|
| POST 는 수정하라는 뜻인가 | 아니다. "이걸 처리해 줘"다. 수정은 PUT·PATCH |
| POST 인데 왜 데이터가 오나 | 요청 하나에 응답 하나가 항상 짝이다. 메서드와 응답은 별개 |
| 조회인데 POST 를 써도 되나 | 조건이 주소에 안 들어갈 때만. 주소에 `search` 를 남긴다 |
| GET 으로 데이터를 바꿔도 되나 | 안 된다. 검색 로봇이 훑는 것만으로 사고가 난다 |
| client·server 구분이 왜 중요한가 | 남의 기기에는 비밀키를 못 싣고 보낸 값을 못 믿는다 |
| 주소를 어떻게 짓나 | 동사 빼고 복수형 명사. 소속은 경로로, 버전은 앞에 |
| API 를 어디까지 여나 | 내부·파트너·공개 세 등급. 좁게 열고 넓히는 쪽이 싸다 |
| 로그에 무엇을 남기나 | 요청 번호·상태·걸린 시간. 민감한 칸은 값만 `***` |
| 로그는 누가 남기나 | 양쪽 다 남긴다. 도착 못 한 요청은 서버 로그에 없다 |
| 대량 데이터를 보낼 수 있나 | 나눠 보낸다. 크면 파일로, 오래 걸리면 접수 번호로 |

## 헷갈리기 쉬운 점

- **POST 를 "데이터를 보내는 것"으로만 외우지 마라.** 보내는 것과 받는 것은 상관이 없다. 셋 다 답이 온다.
- **GET 은 아무것도 바꾸지 않아야 한다.** `GET /posts/12/delete` 같은 주소는 검색 로봇 한 번에 사고가 난다.
- **주소에 동사를 넣지 마라.** 메서드가 이미 동사다. `POST /createUser` 는 같은 말을 두 번 한다.
- **화면에서 막았다고 막힌 것이 아니다.** 화면을 안 거치고 요청만 직접 보낼 수 있다.
- **`200` 안에 실패를 담지 마라.** 부르는 쪽도 감시 도구도 성공으로 센다.
- **`401` 과 `403` 은 다르다.** 로그인을 안 한 것이 401, 했지만 권한이 없는 것이 403.
- **로그에서 민감한 칸을 통째로 빼지 마라.** 값만 가리고 칸은 남겨야 나중에 따질 수 있다.
- **서버 로그만 보고 "장애 없음"이라 하지 마라.** 도착 못 한 요청은 거기 없다.
- **일단 다 열어 두지 마라.** 여는 것은 하루, 닫는 것은 몇 달이다.

## 더 깊이 보기

- 이 다음은 [API 두 종류와 그 사이의 약속](post.html?id=api-kinds-and-contracts) 편이다. 같은 요청을 두 번 보내도 한 번으로 세게 하는 멱등성, 타임아웃과 재시도, 인증 다섯 가지를 실제 숫자로 다룬다.
- 요청이 서버까지 어떤 길로 가는지는 [게이트웨이·인그레스·라우터](post.html?id=gateway-ingress-router) 편에 있다.
- 7절에서 남긴 로그가 그다음 어디로 가는지는 [Kafka 는 왜 있나](post.html?id=kafka-log-pipeline) 편이다.
- 8절에서 나눈 기록 주체를 광고 로그 열 종류로 펼친 것이 [광고 로그 파이프라인](post.html?id=ad-log-pipeline) 편이다.
- 10절의 대량 전송이 실제 파이프라인에서 어떻게 굴러가는지는 [데이터 파이프라인 설계](post.html?id=data-pipeline-design) 편에서 다룬다.
