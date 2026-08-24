#!/usr/bin/env python3
"""서빙 지연 글(posts/serving-latency-throughput.md)의 시뮬레이션을 Prometheus 가
읽을 수 있는 OpenMetrics 파일로 바꾼다. promtool 로 백필하면 과거 1시간이 생기고,
Grafana 가 글에 실린 PromQL 을 그대로 평가해 실제 패널을 그린다.

숫자는 전부 글의 가상 값이다. 5절 시뮬레이션의 상수(자리 12개·중앙값 3.0ms·
흩어짐 0.55·예산 8ms·seed 20260823)를 그대로 쓰므로 화면의 p50 3.27 · p99 11.19 ·
예산 초과 4.62% 가 글과 같아진다.

    python3 gen-openmetrics.py --out metrics.txt --range-out range.json
"""
import argparse, heapq, json, math, random, time

SLOTS, MED_MS, SIGMA, BUDGET_MS = 12, 3.0, 0.55, 8.0
SEED = 20260823
STEP = 5           # 스크레이프 간격(초). 30초 스파이크가 여섯 점에 걸린다
SPAN = 3600        # 만들 구간(초)
INSTANCES = [f"pctr-{i:02d}" for i in range(1, SLOTS + 1)]

# 글 10절 첫째 함정에 나오는 두 버킷 벌 (초 단위)
TUNED = [.002, .003, .004, .005, .006, .008, .010, .012, .015, .020, .030, .050, .100]
DEFAULT = [.005, .01, .025, .05, .075, .1, .25, .5, .75, 1, 2.5, 5, 10]
QUEUE_BK = [.0005, .001, .002, .003, .005, .008, .012, .020, .050]


def simulate(qps, slots=SLOTS, seconds=120, seed=SEED, slow=1.0):
    """글 5절과 같은 시뮬레이션. 체류 시간과 대기 시간(ms)을 돌려준다."""
    rnd = random.Random(seed)
    now = 0.0
    free = [0.0] * slots
    heapq.heapify(free)
    mu = math.log(MED_MS / 1000)
    stay, queue = [], []
    for _ in range(int(qps * seconds)):
        now += rnd.expovariate(qps)
        svc = rnd.lognormvariate(mu, SIGMA) * slow
        start = max(heapq.heappop(free), now)
        heapq.heappush(free, start + svc)
        queue.append((start - now) * 1000)
        stay.append((start + svc - now) * 1000)
    return stay, queue


def shape(samples_ms, edges_s):
    """표본을 버킷 경계에 담아 '누적 비율'과 평균을 낸다.

    간격마다 표본을 다시 뽑지 않고 이 비율에 건수를 곱한다. 그래야 결과가
    실행할 때마다 같고, 분포 모양은 글의 시뮬레이션 그대로 남는다.
    """
    n = len(samples_ms)
    cum = []
    for e in edges_s:
        cum.append(sum(1 for x in samples_ms if x <= e * 1000) / n)
    return cum, sum(samples_ms) / n / 1000.0   # 누적 비율, 평균(초)


def pools():
    """부하 상태별로 표본 한 벌씩. 글의 표·시뮬레이션과 같은 값이 나온다."""
    normal, q_normal = simulate(2639)
    peak, q_peak = simulate(3300)
    deploy, q_deploy = simulate(2639, slots=10)
    slow_one = [x * 3.4 for x in normal]       # 한 대만 응답이 3.4배 (글 10절의 설정)
    return {
        "normal": normal, "peak": peak, "deploy": deploy, "slow": slow_one,
        "q_normal": q_normal, "q_peak": q_peak, "q_deploy": q_deploy,
    }


def schedule(t):
    """t초 지점의 상태 — (요청량, 표본 이름, 느린 인스턴스, 5xx 비율)."""
    if 1200 <= t < 1500:
        return 3300, "peak", None, 0.001          # 5절의 절벽 근처
    if 1800 <= t < 2100:
        return 2639, "normal", "pctr-07", 0.001   # 10절 둘째 함정 — 한 대만 느림
    if 2400 <= t < 2580:
        return 2639, "deploy", None, 0.001        # 8절 배포 3분 (12대 → 10대)
    if 3000 <= t < 3030:
        return 2639, "normal", None, 0.40         # 10절 셋째 함정 — 30초 스파이크
    return 2639, "normal", None, 0.001


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--out", default="metrics.txt")
    ap.add_argument("--range-out", default="range.json")
    ap.add_argument("--start-epoch", type=int, default=None,
                    help="구간 시작(초). 기본은 '지금에서 SPAN 만큼 전'을 STEP 에 맞춰 내림")
    a = ap.parse_args()

    start = a.start_epoch if a.start_epoch else (int(time.time()) - SPAN) // STEP * STEP
    P = pools()
    cum_tuned, mean_s = shape(P["normal"], TUNED)
    shapes = {
        name: shape(P[name], TUNED) for name in ("normal", "peak", "deploy", "slow")
    }
    shapes_def = {
        name: shape(P[name], DEFAULT) for name in ("normal", "peak", "deploy", "slow")
    }
    shapes_q = {n: shape(P["q_" + n], QUEUE_BK)[0]
                for n in ("normal", "peak", "deploy")}

    ticks = list(range(0, SPAN, STEP))
    # 누적 카운터를 간격마다 쌓는다
    acc_b = {(inst, i): 0 for inst in INSTANCES for i in range(len(TUNED) + 1)}
    acc_c = {inst: 0 for inst in INSTANCES}
    acc_s = {inst: 0.0 for inst in INSTANCES}
    acc_bd = {i: 0 for i in range(len(DEFAULT) + 1)}
    acc_q = {i: 0 for i in range(len(QUEUE_BK) + 1)}
    acc_ok, acc_err = 0, 0
    rows_b, rows_c, rows_s, rows_bd, rows_q, rows_r, rows_g = [], [], [], [], [], [], []
    rows_d = []

    for t in ticks:
        qps, pool, slow_inst, err = schedule(t)
        ts = start + t
        per = int(qps * STEP / SLOTS)          # 요청을 12대에 고르게 돌린다
        cum_n, mean_n = shapes[pool]
        cum_sl, mean_sl = shapes["slow"]

        for inst in INSTANCES:
            cum, mean = (cum_sl, mean_sl) if inst == slow_inst else (cum_n, mean_n)
            for i, frac in enumerate(cum):
                acc_b[(inst, i)] += int(per * frac)
            acc_b[(inst, len(TUNED))] += per
            acc_c[inst] += per
            acc_s[inst] += per * mean
            for i, e in enumerate(TUNED):
                rows_b.append((inst, f"{e}", acc_b[(inst, i)], ts))
            rows_b.append((inst, "+Inf", acc_b[(inst, len(TUNED))], ts))
            rows_c.append((inst, acc_c[inst], ts))
            rows_s.append((inst, acc_s[inst], ts))

        total = per * SLOTS
        cum_d, _ = shapes_def[pool]
        for i, frac in enumerate(cum_d):
            acc_bd[i] += int(total * frac)
        acc_bd[len(DEFAULT)] += total
        for i, e in enumerate(DEFAULT):
            rows_bd.append((f"{e}", acc_bd[i], ts))
        rows_bd.append(("+Inf", acc_bd[len(DEFAULT)], ts))

        cum_q = shapes_q["slow" if pool == "slow" else pool] \
            if pool in shapes_q else shapes_q["normal"]
        for i, frac in enumerate(cum_q):
            acc_q[i] += int(total * frac)
        acc_q[len(QUEUE_BK)] += total
        for i, e in enumerate(QUEUE_BK):
            rows_q.append((f"{e}", acc_q[i], ts))
        rows_q.append(("+Inf", acc_q[len(QUEUE_BK)], ts))

        n_err = int(total * err)
        acc_err += n_err
        acc_ok += total - n_err
        rows_r.append(("200", acc_ok, ts))
        rows_r.append(("500", acc_err, ts))

        # 동시에 시스템 안에 있는 요청 수 = 초당 요청 수 × 평균 체류 시간
        rows_g.append((round(qps * mean_n, 2), ts))
        rows_d.append((1 if pool == "deploy" else 0, ts))

    def fam(f, help_, type_, lines):
        f.write(f"# HELP {help_}\n# TYPE {type_}\n")
        for ln in lines:
            f.write(ln)

    with open(a.out, "w") as f:
        fam(f, "pctr_infer_duration_seconds 모델 호출에 걸린 시간",
            "pctr_infer_duration_seconds histogram",
            [f'pctr_infer_duration_seconds_bucket{{instance="{i}",le="{e}"}} {v} {ts}\n'
             for i, e, v, ts in rows_b]
            + [f'pctr_infer_duration_seconds_sum{{instance="{i}"}} {v:.4f} {ts}\n'
               for i, v, ts in rows_s]
            + [f'pctr_infer_duration_seconds_count{{instance="{i}"}} {v} {ts}\n'
               for i, v, ts in rows_c])
        fam(f, "pctr_infer_default_duration_seconds 같은 호출을 널리 쓰는 기본 버킷에 담은 것",
            "pctr_infer_default_duration_seconds histogram",
            [f'pctr_infer_default_duration_seconds_bucket{{le="{e}"}} {v} {ts}\n'
             for e, v, ts in rows_bd])
        fam(f, "pctr_queue_wait_seconds 자리가 비기를 기다린 시간",
            "pctr_queue_wait_seconds histogram",
            [f'pctr_queue_wait_seconds_bucket{{le="{e}"}} {v} {ts}\n'
             for e, v, ts in rows_q])
        fam(f, "pctr_requests 응답 코드별 요청 수", "pctr_requests counter",
            [f'pctr_requests_total{{code="{c}"}} {v} {ts}\n' for c, v, ts in rows_r])
        fam(f, "pctr_inflight_requests 지금 처리 중인 요청 수",
            "pctr_inflight_requests gauge",
            [f'pctr_inflight_requests {v} {ts}\n' for v, ts in rows_g])
        fam(f, "pctr_deploy_in_progress 배포가 도는 동안 1",
            "pctr_deploy_in_progress gauge",
            [f'pctr_deploy_in_progress {v} {ts}\n' for v, ts in rows_d])
        f.write("# EOF\n")

    with open(a.range_out, "w") as f:
        json.dump({"from_ms": start * 1000, "to_ms": (start + SPAN) * 1000,
                   "start_epoch": start,
                   "spike_from_ms": (start + 2940) * 1000,
                   "spike_to_ms": (start + 3300) * 1000,
                   "deploy_from_ms": (start + 2340) * 1000,
                   "deploy_to_ms": (start + 2700) * 1000}, f, indent=2)

    svc_mean = MED_MS / 1000 * math.exp(SIGMA ** 2 / 2)   # 추론 시간 평균(초)
    cap = SLOTS / svc_mean                                 # 글 5절의 처리 한계
    over = 100 * (1 - cum_tuned[TUNED.index(.008)])
    print(f"표본 {len(P['normal']):,}건 · 체류 평균 {mean_s*1000:.2f}ms"
          f" · 추론 평균 {svc_mean*1000:.2f}ms · 처리 한계 {cap:,.0f} QPS")
    print(f"예산 8ms 초과 {over:.2f}%  (글: 4.62%)")
    print(f"구간 {time.strftime('%H:%M', time.localtime(start))}"
          f" ~ {time.strftime('%H:%M', time.localtime(start+SPAN))} · {len(ticks)}점")


if __name__ == "__main__":
    main()
