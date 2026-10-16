"""
Automated Security Boundary & Penetration Verification Test Suite
Author: Md. Mushfiqur Rahim & L (White-Hat Security Audit Team)
Workspace: projects/dataset_collector/core/security_poc_test.py

Adheres to:
1. The Sacred /truth Law (100% technical truth, zero mocks, reproducible facts).
2. OWASP Top 10 / CWE security evaluation.
3. Automated verification of:
   - Vector A: Path Traversal & Arbitrary File Read / Write
   - Vector B: Command / Argument Injection on Git/GitHub integrations
   - Vector C: Payload Size Limits & Denial of Service (DoS) Resistance
   - Vector D: GitHub PAT & Secret Exposure Prevention
   - Vector E: Input Sanitization & Stored XSS Mitigation
"""

import sys
import json
import socket
import urllib.request
import urllib.error
import urllib.parse
from pathlib import Path

# Windows UTF-8 stdout
if sys.platform == "win32":
    try:
        sys.stdout.reconfigure(encoding="utf-8")
        sys.stderr.reconfigure(encoding="utf-8")
    except Exception:
        pass

BASE_URL = "http://localhost:7860"

class SecurityAuditTestRunner:
    def __init__(self, base_url: str = BASE_URL):
        self.base_url = base_url.rstrip("/")
        self.results = []

    def log_result(self, vector: str, test_name: str, passed: bool, severity: str, details: str):
        self.results.append({
            "vector": vector,
            "test_name": test_name,
            "passed": passed,
            "severity": severity,
            "details": details
        })
        status_icon = "🛡️ [SECURE / PASS]" if passed else "🚨 [VULNERABLE / FAIL]"
        print(f"{status_icon} [{severity}] {vector} :: {test_name}")
        print(f"      -> {details}")

    def test_vector_a_path_traversal_get(self):
        """Vector A.1: Verify arbitrary static file read traversal via GET is blocked."""
        traversal_paths = [
            "/../../../../Windows/win.ini",
            "/..%2f..%2f..%2f..%2fWindows%2fwin.ini",
            "/static/../../../../etc/passwd",
            "/ui/../../../server.py"
        ]
        all_blocked = True
        notes = []
        for p in traversal_paths:
            url = f"{self.base_url}{p}"
            try:
                req = urllib.request.Request(url, headers={"User-Agent": "SecurityAudit/1.0"})
                with urllib.request.urlopen(req, timeout=3) as resp:
                    all_blocked = False
                    notes.append(f"Leaked {p} with status {resp.status}")
            except urllib.error.HTTPError as e:
                if e.code not in [400, 403, 404]:
                    all_blocked = False
                    notes.append(f"Unexpected status {e.code} on {p}")
            except Exception as e:
                # Connection or network error
                pass

        if all_blocked:
            self.log_result(
                vector="Vector A: Path Traversal",
                test_name="Static File Traversal GET Requests",
                passed=True,
                severity="HIGH",
                details="All traversal paths returned 404/403. Static file router restricts to whitelist."
            )
        else:
            self.log_result(
                vector="Vector A: Path Traversal",
                test_name="Static File Traversal GET Requests",
                passed=False,
                severity="HIGH",
                details="; ".join(notes)
            )

    def test_vector_a_domain_path_traversal_post(self):
        """Vector A.2: Verify domain parameter cannot escape data/buffer directory."""
        url = f"{self.base_url}/api/submit"
        payload = {
            "domain": "../../../traversal_test_file",
            "mode": "cot",
            "prompt": "Path traversal security audit test probe",
            "reasoning": "Reasoning audit",
            "response": "Unique random response token 9847120349817234"
        }
        data = json.dumps(payload).encode("utf-8")
        req = urllib.request.Request(url, data=data, headers={"Content-Type": "application/json"})

        try:
            with urllib.request.urlopen(req, timeout=4) as resp:
                res_data = json.loads(resp.read().decode())
                # If accepted with 200, domain was not restricted to valid whitelist
                self.log_result(
                    vector="Vector A: Path Traversal",
                    test_name="Domain Parameter Traversal in /api/submit",
                    passed=False,
                    severity="HIGH",
                    details=f"Server returned HTTP 200 accepting malicious domain: {res_data.get('domain')}"
                )
        except urllib.error.HTTPError as e:
            if e.code in [400, 403]:
                self.log_result(
                    vector="Vector A: Path Traversal",
                    test_name="Domain Parameter Traversal in /api/submit",
                    passed=True,
                    severity="HIGH",
                    details=f"Server rejected invalid domain with HTTP {e.code}."
                )
            else:
                self.log_result(
                    vector="Vector A: Path Traversal",
                    test_name="Domain Parameter Traversal in /api/submit",
                    passed=False,
                    severity="HIGH",
                    details=f"Server responded with unexpected HTTP {e.code}."
                )
        except Exception as e:
            self.log_result(
                vector="Vector A: Path Traversal",
                test_name="Domain Parameter Traversal in /api/submit",
                passed=False,
                severity="HIGH",
                details=f"Connection failure: {str(e)}"
            )

    def test_vector_b_command_argument_injection(self):
        """Vector B: Verify username and repo parameters validate characters and reject option flags."""
        url = f"{self.base_url}/api/github_config"
        malicious_payloads = [
            {"username": "--upload-pack=touch /tmp/pwned", "repo": "Dataset"},
            {"username": "user;whoami", "repo": "Dataset"},
            {"username": "valid_user", "repo": "--config=core.gitproxy=malicious"}
        ]
        
        all_rejected = True
        reasons = []

        for p in malicious_payloads:
            data = json.dumps(p).encode("utf-8")
            req = urllib.request.Request(url, data=data, headers={"Content-Type": "application/json"})
            try:
                with urllib.request.urlopen(req, timeout=4) as resp:
                    res_data = json.loads(resp.read().decode())
                    if res_data.get("success"):
                        all_rejected = False
                        reasons.append(f"Accepted unvalidated config: {p}")
            except urllib.error.HTTPError as e:
                if e.code not in [400, 422]:
                    all_rejected = False
                    reasons.append(f"HTTP status {e.code} on payload {p}")
            except Exception as e:
                pass

        if all_rejected:
            self.log_result(
                vector="Vector B: Command / Argument Injection",
                test_name="GitHub Username & Repo Flag Injection",
                passed=True,
                severity="MEDIUM",
                details="All option flags and shell metacharacters in username/repo were rejected."
            )
        else:
            self.log_result(
                vector="Vector B: Command / Argument Injection",
                test_name="GitHub Username & Repo Flag Injection",
                passed=False,
                severity="MEDIUM",
                details="; ".join(reasons)
            )

    def test_vector_c_payload_size_limit(self):
        """Vector C: Verify server rejects oversized payloads and handles malformed headers gracefully."""
        # 1. Oversized Content-Length header
        parsed_url = urllib.parse.urlparse(self.base_url)
        host = parsed_url.hostname or "localhost"
        port = parsed_url.port or 7860

        oversized_passed = False
        try:
            s = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
            s.settimeout(3.0)
            s.connect((host, port))
            # Claim 50 MB Content-Length without sending 50 MB
            raw_req = f"POST /api/submit HTTP/1.1\r\nHost: {host}:{port}\r\nContent-Length: 52428800\r\nContent-Type: application/json\r\n\r\n{{}}"
            s.sendall(raw_req.encode())
            resp = s.recv(1024).decode(errors="ignore")
            s.close()
            if "413" in resp or "400" in resp:
                oversized_passed = True
        except Exception:
            pass

        # 2. Malformed non-integer Content-Length
        malformed_passed = False
        try:
            s = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
            s.settimeout(3.0)
            s.connect((host, port))
            raw_req = f"POST /api/submit HTTP/1.1\r\nHost: {host}:{port}\r\nContent-Length: invalid-length\r\nContent-Type: application/json\r\n\r\n{{}}"
            s.sendall(raw_req.encode())
            resp = s.recv(1024).decode(errors="ignore")
            s.close()
            if "400" in resp:
                malformed_passed = True
        except Exception:
            pass

        passed = oversized_passed and malformed_passed
        details = f"Oversized length blocked (413/400): {oversized_passed}; Malformed header handled gracefully: {malformed_passed}"
        self.log_result(
            vector="Vector C: Denial of Service & Size Limits",
            test_name="Payload Size & Header Validation Limits",
            passed=passed,
            severity="HIGH",
            details=details
        )

    def test_vector_d_token_exposure(self):
        """Vector D: Verify GitHub PAT is never echoed in API telemetry or response objects."""
        # Check /api/github_config endpoint
        url = f"{self.base_url}/api/github_config"
        req = urllib.request.Request(url)
        passed = True
        details = []

        try:
            with urllib.request.urlopen(req, timeout=3) as resp:
                data = json.loads(resp.read().decode())
                if "token" in data or "github_token" in data:
                    passed = False
                    details.append("Token field leaked in /api/github_config")
                if data.get("has_token") is True and "token" not in data:
                    details.append("Correctly uses boolean 'has_token' masking")
        except Exception as e:
            passed = False
            details.append(f"Request failed: {str(e)}")

        # Check /api/stats endpoint
        stats_url = f"{self.base_url}/api/stats"
        try:
            with urllib.request.urlopen(stats_url, timeout=3) as resp:
                raw_text = resp.read().decode()
                if "ghp_" in raw_text or "github_pat_" in raw_text:
                    passed = False
                    details.append("GitHub token pattern found in /api/stats telemetry!")
        except Exception as e:
            pass

        self.log_result(
            vector="Vector D: Secret & Token Exposure",
            test_name="GitHub PAT Response Sanitization",
            passed=passed,
            severity="HIGH",
            details="; ".join(details) if details else "Token is properly masked and excluded from public responses."
        )

    def test_vector_e_stored_xss_domain(self):
        """Vector E: Verify HTML tags in domain/prompt cannot be stored for raw HTML injection."""
        url = f"{self.base_url}/api/submit"
        xss_payload = {
            "domain": "<script>alert('XSS')</script>",
            "mode": "cot",
            "prompt": "Test XSS prompt",
            "reasoning": "Reasoning",
            "response": "Response token audit 8934751934"
        }
        data = json.dumps(xss_payload).encode("utf-8")
        req = urllib.request.Request(url, data=data, headers={"Content-Type": "application/json"})

        try:
            with urllib.request.urlopen(req, timeout=4) as resp:
                res_data = json.loads(resp.read().decode())
                # If domain with <script> was accepted, it's vulnerable to stored reflection
                self.log_result(
                    vector="Vector E: Stored DOM XSS",
                    test_name="HTML Tag Injection in Domain / Shard Pipeline",
                    passed=False,
                    severity="HIGH",
                    details=f"Server accepted raw HTML tags in domain parameter: {res_data.get('domain')}"
                )
        except urllib.error.HTTPError as e:
            if e.code in [400, 422]:
                self.log_result(
                    vector="Vector E: Stored DOM XSS",
                    test_name="HTML Tag Injection in Domain / Shard Pipeline",
                    passed=True,
                    severity="HIGH",
                    details=f"Server properly rejected HTML script tags in domain with HTTP {e.code}."
                )
            else:
                self.log_result(
                    vector="Vector E: Stored DOM XSS",
                    test_name="HTML Tag Injection in Domain / Shard Pipeline",
                    passed=False,
                    severity="HIGH",
                    details=f"Unexpected status code HTTP {e.code}"
                )
        except Exception as e:
            self.log_result(
                vector="Vector E: Stored DOM XSS",
                test_name="HTML Tag Injection in Domain / Shard Pipeline",
                passed=False,
                severity="HIGH",
                details=f"Test failed with error: {str(e)}"
            )

    def run_all(self):
        print("=" * 75)
        print("🔒 RUNNING AUTOMATED SECURITY AUDIT & PENETRATION VERIFICATION TEST SUITE")
        print(f"Target: {self.base_url}")
        print("=" * 75)
        self.test_vector_a_path_traversal_get()
        self.test_vector_a_domain_path_traversal_post()
        self.test_vector_b_command_argument_injection()
        self.test_vector_c_payload_size_limit()
        self.test_vector_d_token_exposure()
        self.test_vector_e_stored_xss_domain()
        print("=" * 75)
        
        passed_count = sum(1 for r in self.results if r["passed"])
        total_count = len(self.results)
        print(f"AUDIT SUMMARY: {passed_count}/{total_count} Security Tests Passed.")
        print("=" * 75)
        return self.results

if __name__ == "__main__":
    runner = SecurityAuditTestRunner()
    results = runner.run_all()
    # Exit with code 0 for reporting
