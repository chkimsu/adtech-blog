# LLM 기록

LLM 글이 다시 보이는 진짜 출력을 둔다. `scripts/llm-record.py` 가 Ollama 의 `/api/chat` 을 불러 쓴다. 글의 파이썬 블록은 이 출력을 손으로 옮겨 적지 않고 `--export-constant` 가 찍은 상수를 그대로 붙인다. 글을 쓰는 법은 `MARKDOWN_GUIDE.md` 의 「LLM 글의 기록 재생과 가짜 LLM」 절에 있다.

숫자를 손으로 고치지 않는다. 다시 기록하면 파일 전체를 바꾼다.

## 프롬프트 파일 `prompts/<slug>.json`

사람이 쓴다. 모든 요청에 같이 가는 시스템 메시지 하나와 항목마다의 사용자 메시지다.

```json
{"system": "…",
 "items": [{"id": "a001", "user": "…"}],
 "think": "off", "repeat": 1,
 "repeat_subset": {"ids": ["a001"], "repeat": 3},
 "think_subset": {"ids": ["a001"], "think": "on"}}
```

| 필드 | 뜻 |
|---|---|
| `system` | 모든 요청에 같이 보내는 시스템 메시지 |
| `items` | `id` 와 사용자 메시지 `user`. id 는 겹치지 않는다 |
| `think` | `"off"`, `"on"`, `"both"`. both 는 항목마다 thinking 을 끈 것과 켠 것을 둘 다 보낸다 |
| `repeat` | 항목마다 보내는 횟수. 1 이상 |
| `repeat_subset` | 선택. 그 id 들만 `repeat` 번 더 보낸다. `run` 은 2, 3… 으로 이어진다 |
| `think_subset` | 선택. 그 id 들만 지정한 think 로 한 번 더 보낸다 |

요청 수는 항목 수 × think 수 × repeat 에 두 선택 필드가 더하는 만큼이다. 200건에 `"repeat_subset": {"ids": [40개], "repeat": 3}` 이면 200 + 120 = 320 이다. 50건에 `"think_subset": {"ids": [10개], "think": "on"}` 이면 50 + 10 = 60 이다.

## 기록 파일 `<slug>.json`

도구가 쓴다. 항목은 보낸 차례대로다.

```json
{"model": "qwen3.5:27b", "recorded_at": "2026-11-05", "host": "http://localhost:11434",
 "options": {"temperature": 0, "seed": 7},
 "items": [{"id": "a001", "think": false, "run": 1, "system": "…", "user": "…",
            "output": "{\"label\":\"running\"}", "thinking_chars": 0,
            "prompt_tokens": 412, "output_tokens": 9, "elapsed_ms": 1830}]}
```

| 필드 | 뜻 |
|---|---|
| `recorded_at` | 기록을 시작한 날짜 |
| `run` | 같은 id 와 think 로 보낸 몇 번째인지. 1부터 |
| `output` | 응답의 `message.content` 그대로 |
| `thinking_chars` | 응답의 `message.thinking` 글자 수. thinking 을 끄면 0 |
| `prompt_tokens` | 응답의 `prompt_eval_count`. 프롬프트 캐시에서 읽은 토큰도 센다 |
| `output_tokens` | 응답의 `eval_count`. thinking 을 켜면 thinking 토큰이 여기에 같이 든다 |
| `elapsed_ms` | 응답의 `total_duration` 을 ms 로 바꾼 값 |
| `error` | 3번 보내도 실패한 항목에만 있다. 그 항목에는 `output` 부터 뒤의 필드가 없다. 글에 쓰기 전에 0개여야 한다 |

`--export-constant` 는 `output` 을 id 순서로 `RECORD = {...}` 한 줄로 찍는다. 키는 think 를 끈 첫 회차면 `a001`, 그 밖은 `a001|off|2`, `a001|on|1` 꼴이다. `error` 가 남은 기록에서는 뽑지 않는다.
