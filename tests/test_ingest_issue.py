"""
Unit Tests for GitHub Issue Ingestion Engine
"""
import pytest
from core.ingest_issue import extract_json_from_text, normalize_record

def test_extract_json_markdown():
    text = """
    Here is my submission:
    ```json
    [
      {
        "prompt": "Explain quantum entanglement",
        "thinking": "Step 1: Bell states...",
        "solution": "Entanglement is a physical phenomenon..."
      }
    ]
    ```
    Thank you!
    """
    res = extract_json_from_text(text)
    assert res is not None
    assert isinstance(res, list)
    assert len(res) == 1
    assert res[0]["prompt"] == "Explain quantum entanglement"

def test_extract_json_raw_object():
    text = '{"prompt": "Calculate 2+2", "thinking": "2+2=4", "solution": "4"}'
    res = extract_json_from_text(text)
    assert res is not None
    assert res["prompt"] == "Calculate 2+2"

def test_normalize_record():
    raw = {
        "instruction": "Test instruction",
        "reasoning": "Step by step reasoning",
        "response": "Final answer",
        "domain": "math"
    }
    norm = normalize_record(raw)
    assert norm is not None
    assert norm["prompt"] == "Test instruction"
    assert norm["thinking"] == "Step by step reasoning"
    assert norm["solution"] == "Final answer"
    assert norm["domain"] == "math"

def test_normalize_invalid():
    raw = {"only_one_key": "val"}
    assert normalize_record(raw) is None
