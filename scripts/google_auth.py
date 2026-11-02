"""Run the Google OAuth consent flow to generate the Gmail token file.

Usage:
    python scripts/google_auth.py [--no-browser]

The script starts a temporary HTTP server on the host/port from REDIRECT_URI,
prints the Google consent URL, and writes the resulting token to
GOOGLE_TOKEN_PATH (token.json by default).
"""

from __future__ import annotations

import argparse
import json
import os
import sys
import threading
import webbrowser
from http.server import BaseHTTPRequestHandler, HTTPServer
from pathlib import Path
from urllib.parse import parse_qs, urlparse

from dotenv import load_dotenv
from google_auth_oauthlib.flow import Flow

ROOT = Path(__file__).resolve().parents[1]
load_dotenv(ROOT / ".env")

REDIRECT_URI = os.getenv("REDIRECT_URI", "http://localhost:8000/auth/google/callback")
TOKEN_PATH = Path(os.getenv("GOOGLE_TOKEN_PATH", "token.json"))
CREDENTIALS_PATH = Path(os.getenv("GOOGLE_CREDENTIALS_PATH", "credentials.json"))
SCOPES = ["https://www.googleapis.com/auth/gmail.send"]

parsed = urlparse(REDIRECT_URI)
HOST = parsed.hostname or "localhost"
PORT = parsed.port or 8000
CALLBACK_PATH = parsed.path or "/"


def load_client_config() -> dict:
    if CREDENTIALS_PATH.exists():
        return json.loads(CREDENTIALS_PATH.read_text(encoding="utf-8"))

    client_id = os.getenv("GOOGLE_CLIENT_ID")
    client_secret = os.getenv("GOOGLE_CLIENT_SECRET")
    if not client_id or not client_secret:
        raise SystemExit(
            "Missing Google credentials. Set GOOGLE_CLIENT_ID/GOOGLE_CLIENT_SECRET "
            "or provide credentials.json."
        )

    return {
        "web": {
            "client_id": client_id,
            "client_secret": client_secret,
            "auth_uri": "https://accounts.google.com/o/oauth2/auth",
            "token_uri": "https://oauth2.googleapis.com/token",
            "redirect_uris": [REDIRECT_URI],
        }
    }


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--no-browser", action="store_true", help="Do not open a browser")
    args = parser.parse_args()

    flow = Flow.from_client_config(
        load_client_config(), scopes=SCOPES, redirect_uri=REDIRECT_URI
    )
    auth_url, expected_state = flow.authorization_url(
        access_type="offline", prompt="consent", include_granted_scopes="true"
    )

    result: dict[str, str] = {}
    done = threading.Event()

    class CallbackHandler(BaseHTTPRequestHandler):
        def log_message(self, *_: object) -> None:
            pass

        def do_GET(self) -> None:  # noqa: N802
            request = urlparse(self.path)
            if request.path != CALLBACK_PATH:
                self.send_response(404)
                self.end_headers()
                self.wfile.write(b"Not found")
                return

            if done.is_set():
                self.send_response(200)
                self.end_headers()
                self.wfile.write(b"Already processed")
                return

            params = parse_qs(request.query)
            print(f"Callback query: {request.query}", file=sys.stderr, flush=True)
            if "error" in params:
                result["error"] = params["error"][0]
            elif params.get("state", [None])[0] != expected_state:
                result["error"] = (
                    f"state mismatch (expected {expected_state!r}, "
                    f"got {params.get('state', [None])[0]!r})"
                )
            elif "code" not in params:
                result["error"] = "missing authorization code"
            else:
                result["code"] = params["code"][0]

            self.send_response(200)
            self.send_header("Content-Type", "text/html; charset=utf-8")
            self.end_headers()
            self.wfile.write(
                b"<h2>Google authorization received. You can close this window.</h2>"
            )
            done.set()

    server = HTTPServer((HOST, PORT), CallbackHandler)
    thread = threading.Thread(target=server.serve_forever, daemon=True)
    thread.start()

    print("\nOpen this URL in your browser and approve access:\n")
    print(auth_url)
    print()

    if not args.no_browser:
        try:
            webbrowser.open(auth_url)
        except Exception:
            pass

    try:
        if not done.wait(timeout=600):
            print("Timed out waiting for the authorization callback.", file=sys.stderr)
            return 1
    finally:
        server.shutdown()

    if "error" in result:
        print(f"Authorization failed: {result['error']}", file=sys.stderr)
        return 1

    flow.fetch_token(code=result["code"])
    TOKEN_PATH.write_text(flow.credentials.to_json(), encoding="utf-8")
    print(f"Token saved to {TOKEN_PATH.resolve()}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
