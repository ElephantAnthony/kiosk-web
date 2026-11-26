from django.test import Client, TestCase
from .views import menu_list


class LegacySharedCartReproduction(TestCase):
    """Characterization test: a pass documents the V1 defect, not a fix."""
    def setUp(self):
        menu_list.clear()
        self.addCleanup(menu_list.clear)

    def test_distinct_sessions_share_process_global_cart(self):
        a, b = Client(), Client()
        for client in (a, b):
            session = client.session
            session["probe"] = True
            session.save()
        self.assertNotEqual(a.session.session_key, b.session.session_key)
        a.get("/mcdonald/basket/", {
            "name": "fixture-item", "price": "1000",
            "quantity": "2", "packing": "fixture"
        })
        response = b.get("/mcdonald/basket/")
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.context["menus"]["fixture-item"], (2000, 2))
