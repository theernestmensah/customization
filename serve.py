"""Local server for the NO NAME site. It answers the same way as the Vercel setup in vercel.json.

    python serve.py [port]        default port 5178, then open http://127.0.0.1:5178

- Real files are served as they are.
- /<anything>/css|js|fonts/... falls back to /css|js|fonts/... (a page such as /product/name-tee
  loads its stylesheet and scripts relative to itself).
- Every other path gets index.html, so /shop or /product/name-tee can be opened directly or reloaded.
- Nothing is cached, so an edit shows on the next reload.

Only the Python standard library is needed. Not deployed (see .vercelignore).
"""
import os
import re
import sys
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from urllib.parse import unquote, urlsplit

ROOT = os.path.dirname(os.path.abspath(__file__))
NESTED_ASSET = re.compile(r"^/.+?/((?:css|js|fonts)/.+)$")


def is_file(path):
    full = os.path.normpath(os.path.join(ROOT, path.lstrip("/")))
    return full.startswith(ROOT) and os.path.isfile(full)


class Handler(SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=ROOT, **kwargs)

    def send_head(self):
        path = unquote(urlsplit(self.path).path)
        if not is_file(path):
            m = NESTED_ASSET.match(path)
            self.path = "/" + m.group(1) if m and is_file("/" + m.group(1)) else "/index.html"
        return super().send_head()

    def end_headers(self):
        self.send_header("Cache-Control", "no-store")
        super().end_headers()


if __name__ == "__main__":
    port = int(sys.argv[1]) if len(sys.argv) > 1 else 5178
    server = ThreadingHTTPServer(("127.0.0.1", port), Handler)
    print(f"NO NAME on http://127.0.0.1:{port}  (Ctrl+C to stop)", flush=True)
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        pass
