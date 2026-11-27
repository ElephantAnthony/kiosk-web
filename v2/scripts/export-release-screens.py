"""Export actual Chromium evidence only after the full suite succeeds."""
import base64
import hashlib
from pathlib import Path

for stage in ("start", "mission", "option", "cart", "payment", "result"):
    files = list(Path("v2/frontend/test-results").rglob(f"release-{stage}.jpg"))
    assert len(files) == 1, f"Expected one actual capture: {stage}"
    data = files[0].read_bytes()
    assert data.startswith(b"\xff\xd8") and data.endswith(b"\xff\xd9")
    assert 0 < len(data) < 500_000
    encoded = base64.b64encode(data).decode("ascii")
    chunks = [encoded[i:i+4096] for i in range(0, len(encoded), 4096)]
    print("RELEASE_IMAGE_SHA256", stage, hashlib.sha256(data).hexdigest())
    print("RELEASE_IMAGE_BYTES", stage, len(data))
    for i, chunk in enumerate(chunks):
        print("RELEASE_IMAGE_CHUNK", stage, i, chunk)
    print("RELEASE_IMAGE_END", stage, len(chunks))
