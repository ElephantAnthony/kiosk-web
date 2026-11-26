"""Emit strictly allowlisted finding metadata; never print matches or secret values."""
import json
import re
import sys
from pathlib import Path

def safe_string(value, pattern, fallback):
    return value if isinstance(value, str) and re.fullmatch(pattern, value) else fallback

def main():
    findings = json.loads(Path(sys.argv[1]).read_text(encoding="utf-8"))
    if not isinstance(findings, list):
        raise ValueError("Unexpected scanner report structure")
    for item in findings:
        path = safe_string(item.get("File"), r"[A-Za-z0-9_./ @+-]{1,240}", "[withheld path]")
        rule = safe_string(item.get("RuleID"), r"[A-Za-z0-9_-]{1,100}", "[withheld rule]")
        commit = safe_string(item.get("Commit"), r"[a-f0-9]{40}", "[withheld commit]")
        line = item.get("StartLine")
        print("FINDING_METADATA " + json.dumps({
            "rule": rule, "path": path, "line": line if type(line) is int else None,
            "commit": commit
        }, ensure_ascii=True))
    print("FINDING_COUNT", len(findings))

if __name__ == "__main__":
    main()
