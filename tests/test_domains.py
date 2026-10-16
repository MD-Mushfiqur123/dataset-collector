import unittest
from pathlib import Path
import sys

sys.path.insert(0, str(Path(__file__).parent.parent))
from core.domains import DOMAINS, get_domain, list_domains

class TestDomainSpecifications(unittest.TestCase):
    def test_exactly_four_domains(self):
        domains = list_domains()
        self.assertEqual(len(domains), 4, "Must have exactly 4 foundational domains")
        
        expected_keys = {"physics", "chemistry", "mathematics", "biology"}
        self.assertEqual(set(DOMAINS.keys()), expected_keys)

    def test_single_master_prompt_per_domain(self):
        for dom_id, data in DOMAINS.items():
            prompt = data.get("master_prompt", "")
            self.assertTrue(prompt and len(prompt) > 100, f"Domain {dom_id} must have a detailed Master Meta-Prompt")
            self.assertIn("<think>", prompt, f"Domain {dom_id} master prompt must enforce <think> tags")
            self.assertIn("বাংলা", prompt, f"Domain {dom_id} master prompt must enforce pure Bengali")

if __name__ == "__main__":
    unittest.main()
