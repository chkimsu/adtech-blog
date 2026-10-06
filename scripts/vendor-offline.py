#!/usr/bin/env python3
"""인터넷이 없는 곳에서도 블로그가 그대로 뜨게, 바깥에서 받아오던 파일을 vendor/ 안으로 내려받고 링크를 바꾼다.

  python3 scripts/vendor-offline.py            # 받아서 링크까지 바꾼다
  python3 scripts/vendor-offline.py --dry-run  # 무엇을 받을지만 본다

인터넷이 되는 곳에서 한 번만 돌리면 된다. 그 뒤로는 python3 -m http.server 8000 만으로 충분하다.
받은 파일은 주소 그대로 vendor/ 아래에 쌓이므로, 라이브러리가 제 안에서 또 부르는 글꼴과 조각 파일도 같이 맞아 들어간다.
"""
from __future__ import annotations

import hashlib
import os
import re
import sys
import urllib.request
from pathlib import Path
from urllib.parse import urljoin

HERE = Path(__file__).resolve().parent
ROOT = next((d for d in (HERE, *HERE.parents) if (d / "index.html").exists()), HERE)
VENDOR = ROOT / "vendor"
UA = ("Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 "
      "(KHTML, like Gecko) Chrome/124.0 Safari/537.36")

# 내려받을 수 없는 것 — 그때그때 남의 서버가 답을 만들어 주는 것들
SKIP_HOSTS = {"jsonplaceholder.typicode.com", "giscus.app", "utteranc.es",
              "github.com", "api.github.com", "www.sitemaps.org", "www.w3.org",
              "schema.org", "chkimsu.github.io", "img.shields.io"}

URL_RE = re.compile(r'https://[^\s"\'()<>\\]+')
CSS_URL_RE = re.compile(r'url\(\s*([\'"]?)([^)\'"]+)\1\s*\)')
ESM_RE = re.compile(r'(?:from|import)\s*\(?\s*["\'](\.{1,2}/[^"\']+)["\']')

seen: set[str] = set()


def rel(target: Path, base: Path) -> str:
    """vendor 안 파일을 부르는 상대 경로. 앞에 ./ 를 꼭 붙인다 —
    자바스크립트 모듈 import 는 ./ 가 없으면 npm 꾸러미 이름으로 읽어 버려 그대로 깨진다."""
    r = os.path.relpath(target, base).replace(os.sep, "/")
    return r if r.startswith((".", "/")) else "./" + r


def local_path(url: str) -> Path:
    """https://호스트/경로?물음 → vendor/호스트/경로. 물음표가 붙은 것은 이름 뒤에 짧은 지문을 단다."""
    rest = url.split("://", 1)[1]
    head, _, query = rest.partition("?")
    parts = [p for p in head.split("/") if p not in ("", ".", "..")] or ["index"]
    if query:
        tag = hashlib.sha1(query.encode()).hexdigest()[:8]
        stem, dot, ext = parts[-1].partition(".")
        parts[-1] = f"{stem}-{tag}{dot}{ext}" if dot else f"{stem}-{tag}.css"
    return VENDOR.joinpath(*parts)


def wanted(url: str) -> bool:
    return url.startswith("https://") and url.split("/")[2] not in SKIP_HOSTS


def fetch(url: str, dry: bool) -> bytes | None:
    """한 주소를 받아 vendor 안 같은 자리에 놓고, 그 안에서 또 부르는 것을 따라간다."""
    if url in seen or not wanted(url):
        return None
    seen.add(url)
    dest = local_path(url)
    if dest.exists():
        body = dest.read_bytes()
    elif dry:
        print(f"  받을 것 {url}")
        return None
    else:
        try:
            req = urllib.request.Request(url, headers={"User-Agent": UA})
            with urllib.request.urlopen(req, timeout=60) as r:
                body = r.read()
        except Exception as e:  # 없는 조각 하나가 전체를 멈추지 않게
            print(f"  !! 못 받음 {url} — {e}")
            return None
        dest.parent.mkdir(parents=True, exist_ok=True)
        dest.write_bytes(body)
        print(f"  {len(body):>9,} B  {dest.relative_to(ROOT)}")
    follow(url, dest, body, dry)
    return body


def follow(url: str, dest: Path, body: bytes, dry: bool) -> None:
    """css 가 부르는 글꼴, 모듈이 부르는 조각 파일을 따라간다."""
    name = url.split("?")[0]
    if not (name.endswith((".css", ".js", ".mjs")) or "css2?" in url or "css?" in url):
        return
    try:
        text = body.decode("utf-8")
    except UnicodeDecodeError:
        return
    refs = [m[1] for m in CSS_URL_RE.findall(text)] + ESM_RE.findall(text)
    changed = text
    for ref in dict.fromkeys(refs):
        if ref.startswith(("data:", "#")):
            continue
        absu = ref if ref.startswith("https://") else urljoin(url, ref)
        if not wanted(absu):
            continue
        fetch(absu, dry)
        if ref.startswith("https://"):
            # 절대 주소는 vendor 안 상대 경로로 바꾼다. 상대 주소는 자리가 그대로라 손댈 것이 없다
            changed = changed.replace(ref, rel(local_path(absu), dest.parent))
    if changed != text and not dry:
        dest.write_text(changed, encoding="utf-8")


def main() -> None:
    dry = "--dry-run" in sys.argv
    files = sorted(p for p in list(ROOT.glob("*.html")) + list(ROOT.glob("css/*.css")) if p.is_file())
    urls: dict[str, None] = {}
    for f in files:
        for u in URL_RE.findall(f.read_text(encoding="utf-8", errors="ignore")):
            u = u.rstrip('",;')
            if wanted(u):
                urls[u] = None
    print(f"바깥에서 받아오던 주소 {len(urls)}개 · 훑은 파일 {len(files)}개\n")

    for u in urls:
        fetch(u, dry)
    if dry:
        return

    n = 0
    for f in files:
        text = f.read_text(encoding="utf-8")
        out = text
        for u in urls:
            if u in out:
                out = out.replace(u, rel(local_path(u), f.parent))
        if out != text:
            f.write_text(out, encoding="utf-8")
            n += 1
    got = [p for p in VENDOR.rglob("*") if p.is_file()]
    print(f"\n링크를 바꾼 파일 {n}개 · 받은 파일 {len(got):,}개 "
          f"({sum(p.stat().st_size for p in got) / 1e6:.1f} MB)")


if __name__ == "__main__":
    main()
