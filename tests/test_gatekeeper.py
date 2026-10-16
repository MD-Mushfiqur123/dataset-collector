import unittest
import shutil
from pathlib import Path
import sys

# Add project root to sys.path
sys.path.insert(0, str(Path(__file__).parent.parent))
from core.gatekeeper import DuplicateGatekeeper, SIMILARITY_THRESHOLD

class TestDuplicateGatekeeper(unittest.TestCase):
    def setUp(self):
        self.test_dir = Path(__file__).parent / "temp_gatekeeper_test"
        self.test_dir.mkdir(parents=True, exist_ok=True)
        self.gatekeeper = DuplicateGatekeeper(self.test_dir)

    def tearDown(self):
        shutil.rmtree(self.test_dir, ignore_errors=True)

    def test_threshold_value(self):
        self.assertEqual(SIMILARITY_THRESHOLD, 0.83, "Threshold must strictly be 83%")

    def test_unique_sample_acceptance(self):
        text1 = "নিউটনীয় বলবিদ্যায় একটি বস্তুর ওপর প্রযুক্ত বল তার ভরবেগের পরিবর্তনের হারের সমানুপাতিক।"
        allowed, sim, matched_id = self.gatekeeper.check_similarity(text1)
        self.assertTrue(allowed, "First sample should be accepted")
        self.assertEqual(sim, 0.0)

        # Register it
        self.gatekeeper.register_sample("sample_001", text1, "physics")

        # Completely different sample should be accepted
        text2 = "সালোকসংশ্লেষণ প্রক্রিয়ায় সবুজ উদ্ভিদ সূর্যালোক এবং ক্লোরোফিলের সহায়তায় গ্লুকোজ তৈরি করে।"
        allowed2, sim2, matched_id2 = self.gatekeeper.check_similarity(text2)
        self.assertTrue(allowed2, "Diverse text should be accepted")
        self.assertLess(sim2, 0.83)

    def test_duplicate_decline_at_83_percent(self):
        original = "আদর্শ গ্যাসের ক্ষেত্রে চাপ এবং আয়তনের গুণফল পরম তাপমাত্রার সমানুপাতিক হয় অর্থাৎ পি ভি সমান এন আর টি।"
        self.gatekeeper.register_sample("sample_gas_01", original, "physics")

        # 1. Exact Duplicate (100% similarity)
        allowed, sim, matched = self.gatekeeper.check_similarity(original)
        self.assertFalse(allowed, "100% match must be declined")
        self.assertGreaterEqual(sim, 0.83)
        self.assertEqual(matched, "sample_gas_01")

        # 2. Near Duplicate with slight word change (~90% similar)
        near_duplicate = "আদর্শ গ্যাসের ক্ষেত্রে চাপ এবং আয়তনের গুণফল পরম তাপমাত্রার সমানুপাতিক হয় অর্থাৎ পি ভি সমান এন আর টি।" + " অর্থাৎ"
        allowed_near, sim_near, matched_near = self.gatekeeper.check_similarity(near_duplicate)
        self.assertFalse(allowed_near, "Near duplicate (>=83%) must be declined")
        self.assertGreaterEqual(sim_near, 0.83)

if __name__ == "__main__":
    unittest.main()
