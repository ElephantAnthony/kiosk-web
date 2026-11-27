"""Export only the synthetic kiosk menu screenshot captured by the actual browser test."""
import base64
import hashlib
from pathlib import Path

files = list(Path("v2/frontend/test-results").rglob("kiosk-menu.jpg"))
assert len(files) == 1, "Expected one browser-captured menu screenshot"
data = files[0].read_bytes()
assert data.startswith(b"\xff\xd8") and data.endswith(b"\xff\xd9")
assert len(data) < 500_000
encoded = base64.b64encode(data).decode("ascii")
chunks = [encoded[i:i+4096] for i in range(0, len(encoded), 4096)]
print("KIOSK_IMAGE_SHA256", hashlib.sha256(data).hexdigest())
print("KIOSK_IMAGE_BYTES", len(data))
for i, chunk in enumerate(chunks):
    print("KIOSK_IMAGE_CHUNK", i, chunk)
print("KIOSK_IMAGE_END", len(chunks))
