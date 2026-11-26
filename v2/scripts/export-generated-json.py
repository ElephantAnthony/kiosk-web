"""Temporary reproducible bootstrap export of generated public JSON files."""
import base64
import hashlib
import json
import re
import sys
from pathlib import Path

tag, path = sys.argv[1:]
assert tag in {"AJV_LOCK", "OPENAPI"}
data = Path(path).read_bytes()
doc = json.loads(data)
assert len(data) <= 2_000_000
if tag == "AJV_LOCK":
    assert doc["name"] == "seniosk-frontend" and doc["lockfileVersion"] == 3
    for name, package in doc["packages"].items():
        if name:
            assert re.fullmatch(r"https://registry\.npmjs\.org/[A-Za-z0-9@%._/+~-]+", package["resolved"])
else:
    assert doc["openapi"].startswith("3.") and "/api/sessions" in doc["paths"]
    assert "servers" not in doc
encoded = base64.b64encode(data).decode("ascii")
chunks = [encoded[i:i+4096] for i in range(0, len(encoded), 4096)]
print(tag + "_SHA256", hashlib.sha256(data).hexdigest())
print(tag + "_BYTES", len(data))
for i, chunk in enumerate(chunks):
    print(tag + "_CHUNK", i, chunk)
print(tag + "_END", len(chunks))
