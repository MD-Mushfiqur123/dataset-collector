import unittest
import shutil
import gzip
from pathlib import Path
import sys

sys.path.insert(0, str(Path(__file__).parent.parent))
from core.pusher import ShardPusher, MAX_BUFFER_BYTES, AUTO_PUSH_COUNT_THRESHOLD

class TestShardPusher(unittest.TestCase):
    def setUp(self):
        self.test_dir = Path(__file__).parent / "temp_pusher_test"
        self.test_dir.mkdir(parents=True, exist_ok=True)
        self.pusher = ShardPusher(self.test_dir)

    def tearDown(self):
        shutil.rmtree(self.test_dir, ignore_errors=True)

    def test_buffer_append_and_auto_trigger(self):
        sample = {
            "id": "test_001",
            "domain": "physics",
            "prompt": "Test Prompt",
            "response": "Test Response",
            "words": 100
        }

        # Append 4 samples (below 5 threshold)
        for i in range(4):
            status = self.pusher.append_sample(sample)
            self.assertFalse(status["auto_trigger"])

        # 5th sample should trigger auto-upload
        status5 = self.pusher.append_sample(sample)
        self.assertTrue(status5["auto_trigger"])
        self.assertIn("count_threshold", status5["trigger_reason"])

    def test_compression_and_sharding(self):
        sample = {"id": "test_gz", "domain": "chemistry", "text": "H2 + O2 -> H2O"}
        self.pusher.append_sample(sample)

        shards = self.pusher.compress_buffer_to_shards()
        self.assertEqual(len(shards), 1)
        shard_path = shards[0]

        self.assertTrue(shard_path.exists())
        self.assertTrue(str(shard_path).endswith(".jsonl.gz"))

        # Verify it can be decompressed
        with gzip.open(shard_path, "rt", encoding="utf-8") as f:
            content = f.read()
            self.assertIn("chemistry", content)

if __name__ == "__main__":
    unittest.main()
