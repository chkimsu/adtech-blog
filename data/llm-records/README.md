# LLM 기록

LLM 글이 다시 보이는 진짜 출력을 둔다. `scripts/llm-record.py` 가 Ollama 의 `/api/chat` 을 불러 쓴다. 글의 파이썬 블록은 이 출력을 손으로 옮겨 적지 않고 `--export-constant` 가 찍은 상수를 그대로 붙인다. 글을 쓰는 법은 `MARKDOWN_GUIDE.md` 의 「LLM 글의 기록 재생과 가짜 LLM」 절에 있다.

숫자를 손으로 고치지 않는다. 다시 기록하면 파일 전체를 바꾼다. 다만 기록 파일이 이미 있을 때 `--limit` 으로 시험한 기록과 `error` 가 남은 기록은 그 자리에 쓰지 않고 임시 폴더에 쓴다. 그래도 덮어쓰려면 `--force` 를 더한다.

기록을 시작하기 전에 서버 버전과 모델이 있는지를 묻는다. 모델이 없으면 요청을 하나도 보내지 않고 멈춘다.

## 프롬프트 파일 `prompts/<slug>.json`

사람이 쓴다. 모든 요청에 같이 가는 시스템 메시지 하나와 항목마다의 사용자 메시지다.

```json
{"system": "…",
 "items": [{"id": "a001", "user": "…"}],
 "think": "off", "repeat": 1,
 "repeat_subset": {"ids": ["a001"], "repeat": 3, "options": {"temperature": 0.7}},
 "think_subset": {"ids": ["a001"], "think": "on"}}
```

| 필드 | 뜻 |
|---|---|
| `system` | 모든 요청에 같이 보내는 시스템 메시지 |
| `items` | `id` 와 사용자 메시지 `user`. id 는 겹치지 않는다 |
| `think` | `"off"`, `"on"`, `"both"`. both 는 항목마다 thinking 을 끈 것과 켠 것을 둘 다 보낸다 |
| `repeat` | 항목마다 보내는 횟수. 1 이상 |
| `options` | 선택. 파일 전체의 기본값 `{"temperature": 0, "seed": 7}` 을 덮는다 |
| `repeat_subset` | 선택. 그 id 들만 `repeat` 번 더 보낸다. `run` 은 2, 3… 으로 이어진다. 안에 둔 `options` 는 이 묶음에만 얹힌다 |
| `think_subset` | 선택. 그 id 들만 지정한 think 로 한 번 더 보낸다. 안에 둔 `options` 는 이 묶음에만 얹힌다 |

요청 수는 항목 수 × think 수 × repeat 에 두 선택 필드가 더하는 만큼이다. 200건에 `"repeat_subset": {"ids": [40개], "repeat": 3}` 이면 200 + 120 = 320 이다. 50건에 `"think_subset": {"ids": [10개], "think": "on"}` 이면 50 + 10 = 60 이다.

묶음의 `options` 는 맨 위 `options` 위에 얹히고, 그 묶음에 없는 키는 맨 위 값을 물려받는다. `seed` 를 적지 않았는데 `temperature` 가 0 보다 크면 run 마다 seed 를 7 + run 으로 보낸다(run 2 는 9, run 3 은 10). `think_subset` 의 요청도 같은 규칙을 따른다. 그래서 run 마다 뽑는 seed 가 다르고, 다시 기록하면 같은 답이 나온다. 흔들림은 temperature 0 만 되풀이해 재지 않고, temperature 0(같은 답)과 run 마다 seed 가 다른 temperature 0.7(바뀔 수 있는 답)을 나란히 두고 견준다.

## 기록 파일 `<slug>.json`

도구가 쓴다. 항목은 보낸 차례대로다.

```json
{"model": "qwen3.5:27b", "recorded_at": "2026-11-05", "host": "http://localhost:11434",
 "options": {"temperature": 0, "seed": 7},
 "items": [{"id": "a001", "think": false, "run": 1, "system": "…", "user": "…",
            "output": "{\"label\":\"running\"}", "thinking_chars": 0,
            "prompt_tokens": 412, "output_tokens": 9, "elapsed_ms": 1830,
            "options": {"temperature": 0, "seed": 7}}]}
```

| 필드 | 뜻 |
|---|---|
| `options` (맨 위) | 파일의 기본값. 기본 options 위에 프롬프트 파일 맨 위의 `options` 를 얹은 것. 맨 위 `options` 에 seed 없이 0 보다 큰 temperature 만 적었으면 seed 는 빠진다. 요청마다 7 + run 을 보냈기 때문이다 |
| `recorded_at` | 기록을 시작한 날짜 |
| `run` | 같은 id 와 think 로 보낸 몇 번째인지. 1부터 |
| `output` | 응답의 `message.content` 그대로 |
| `thinking_chars` | 응답의 `message.thinking` 글자 수. thinking 을 끄면 0 |
| `prompt_tokens` | 응답의 `prompt_eval_count`. 프롬프트 캐시에서 읽은 토큰도 센다 |
| `output_tokens` | 응답의 `eval_count`. thinking 을 켜면 thinking 토큰이 여기에 같이 든다 |
| `elapsed_ms` | 응답의 `total_duration` 을 ms 로 바꾼 값 |
| `options` (항목) | 그 요청에 실제로 보낸 값. 묶음의 `options` 와 run 별 seed 가 여기 보인다 |
| `error` | 3번 보내도 실패한 항목과, 답이 잘려 온 항목(`done_reason` 이 `stop` 이 아님, 다시 보내지 않는다)에만 있다. 그 항목에는 `output` 부터 `elapsed_ms` 까지 다섯 필드가 없다. 글에 쓰기 전에 0개여야 한다 |

`--export-constant` 는 `output` 을 `RECORD = {...}` 한 줄로 찍는다. 차례는 id 정렬이 아니라 id 가 기록에 처음 나온 차례이고, 같은 id 안에서는 think 를 끈 것부터 run 차례다. 프롬프트의 items 를 id 차례로 적었으면 두 차례가 같다. 키는 think 를 끈 첫 회차면 `a001`, 그 밖은 `a001|off|2`, `a001|on|1` 꼴이다. 모양이 틀리거나 `error` 가 남은 기록에서는 뽑지 않는다.

`--with-usage` 를 더하면 그 아래에 `USAGE = {...}` 한 줄을 더 찍는다. 키는 RECORD 와 같은 차례이고, 값은 항목마다 `[prompt_tokens, output_tokens, elapsed_ms, thinking_chars]` 다. 토큰과 시간을 세는 블록은 두 줄을 다 붙이고 그 상수에서 센다.
