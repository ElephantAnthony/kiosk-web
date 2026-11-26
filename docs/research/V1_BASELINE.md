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

No runtime reproduction or history-wide secret scan has been completed. Do not treat static inspection as a test pass.
