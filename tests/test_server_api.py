import unittest
import threading
import time
import requests
import shutil
from pathlib import Path
import sys

sys.path.insert(0, str(Path(__file__).parent.parent))
from server import run_server

class TestServerAPI(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        # Run test server on port 7869
        cls.port = 7869
        cls.server_thread = threading.Thread(target=run_server, args=(cls.port,), daemon=True)
        cls.server_thread.start()
        time.sleep(1.0)
        cls.base_url = f"http://localhost:{cls.port}"

    def test_get_domains(self):
        res = requests.get(f"{self.base_url}/api/domains")
        self.assertEqual(res.status_code, 200)
        data = res.json()
        self.assertIn("physics", data)
        self.assertIn("chemistry", data)
        self.assertIn("mathematics", data)
        self.assertIn("biology", data)

    def test_similarity_check(self):
        payload = {"text": "বলবিদ্যা এবং কোয়ান্টাম বলবিদ্যার মৌলিক পার্থক্যসমূহ বাংলায় বিশ্লেষণ করা হলো।"}
        res = requests.post(f"{self.base_url}/api/check_similarity", json=payload)
        self.assertEqual(res.status_code, 200)
        data = res.json()
        self.assertTrue(data["allowed"])

    def test_submit_and_gatekeeper_rejection(self):
        nonce = str(time.time())
        sample = {
            "domain": "physics",
            "mode": "cot",
            "prompt": f"একটি নির্দিষ্ট উচ্চতা থেকে একটি পাথর মুক্তভাবে ছেড়ে দিলে ভূমিতে পতনের সময় বেগ কত হবে? [{nonce}]",
            "reasoning": f"গতিসূত্র v^2 = u^2 + 2gs ব্যবহার করতে হবে যেখানে আদিবেগ u = 0। [{nonce}]",
            "response": f"চূড়ান্ত বেগ v = sqrt(2gh)। [{nonce}]"
        }

        # 1. First submission should pass
        res1 = requests.post(f"{self.base_url}/api/submit", json=sample)
        self.assertEqual(res1.status_code, 200)
        d1 = res1.json()
        self.assertTrue(d1["success"])

        # 2. Duplicate submission (same text) should be DECLINED by 83% gatekeeper
        res2 = requests.post(f"{self.base_url}/api/submit", json=sample)
        self.assertEqual(res2.status_code, 400)
        d2 = res2.json()
        self.assertFalse(d2["success"])
        self.assertIn("Declined by Gatekeeper", d2["message"])

    def test_get_stats(self):
        res = requests.get(f"{self.base_url}/api/stats")
        self.assertEqual(res.status_code, 200)
        stats = res.json()
        self.assertIn("buffer_mb", stats)
        self.assertIn("max_mb", stats)
        self.assertEqual(stats["max_mb"], 1024.0)

if __name__ == "__main__":
    unittest.main()
