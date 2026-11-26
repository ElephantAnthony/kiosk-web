# V1 baseline
Reference: [main baseline](https://github.com/ElephantAnthony/kiosk-web/tree/9477fe7ac6ebae0fbc2393d91dd7d1b0fc10756d)

| Finding | Evidence | Status |
|---|---|---|
| Shared cart | mcdonaldapp/views.py module-global menu_list, BasketTemplateView reads/writes it; completion clears it | STATIC VERIFIED |
| Shared mission | introapp/views.py module-global mega_mission and mc_mission | STATIC VERIFIED |
| Simulated scores | introapp/views.py CompleteTemplateView generates random.uniform and random.randint for coffee; random duration for fast food | STATIC VERIFIED |
| Incorrect comparison | fast-food grading compares a Menu model instance with a string | STATIC VERIFIED |
| Settings | SQLite, DEBUG=True; secret read from environment | STATIC VERIFIED |
| Test coverage | mcdonaldapp/tests.py and introapp/tests.py are empty stubs | STATIC VERIFIED |
| Tracked artifacts | root myvenv, web_venv, Lib, .idea, get-pip.py, .DS_Store; pyc files | STATIC VERIFIED |

Runtime characterization test: PASS in [CI run 45769057010](https://github.com/ElephantAnthony/kiosk-web/actions/runs/45769057010), one test in 0.013s. This confirms the V1 shared-cart defect, not a V2 fix. History scan completed with 4 unclassified findings across 192 commits; no secret values recorded. See [CI evidence](../evidence/runs/SEN-01-ci-45769057010.md).
