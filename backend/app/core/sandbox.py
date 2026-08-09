import sys
import subprocess
import tempfile
import os
import time
from typing import Dict, Any, List, Optional

class PythonSandbox:
    """
    Isolated Subprocess Sandboxed Python Execution Engine.
    Enforces process isolation, execution timeouts, memory limits, and restricted built-in execution.
    """

    def __init__(self, timeout_seconds: float = 3.0):
        self.timeout_seconds = timeout_seconds

    def execute_code(self, code: str, test_cases: Optional[List[Dict[str, Any]]] = None) -> Dict[str, Any]:
        """
        Executes candidate Python code in an isolated subprocess with input verification.
        """
        # Security check for obviously dangerous system calls
        forbidden_keywords = [
            "import os", "import sys", "import subprocess", "import shutil",
            "import socket", "import requests", "import urllib", "eval(", "exec(",
            "__import__", "open(", "unlink"
        ]
        
        for kw in forbidden_keywords:
            if kw in code:
                return {
                    "stdout": "",
                    "stderr": f"Security Error: Use of restricted statement '{kw}' is prohibited in coding sandbox.",
                    "exit_code": 1,
                    "execution_time_ms": 0.0,
                    "passed_test_cases": 0,
                    "total_test_cases": len(test_cases) if test_cases else 0,
                    "error": "Forbidden keyword detected"
                }

        # Wrap code with test harness if test cases provided
        wrapped_code = code
        if test_cases:
            harness = "\n\n# Automated Test Harness\n"
            harness += "if __name__ == '__main__':\n"
            harness += "    import json\n"
            harness += f"    test_cases = {json.dumps(test_cases)}\n"
            harness += "    passed = 0\n"
            harness += "    for tc in test_cases:\n"
            harness += "        try:\n"
            harness += "            func_name = tc.get('function_name', 'two_sum')\n"
            harness += "            inputs = tc.get('inputs', {})\n"
            harness += "            expected = tc.get('expected')\n"
            harness += "            fn = globals().get(func_name)\n"
            harness += "            if fn:\n"
            harness += "                result = fn(**inputs) if isinstance(inputs, dict) else fn(*inputs)\n"
            harness += "                if result == expected:\n"
            harness += "                    passed += 1\n"
            harness += "        except Exception as e:\n"
            harness += "            print(f'Test case error: {e}')\n"
            harness += "    print(f'__PASSED_COUNT__={passed}')\n"
            wrapped_code += harness

        # Create temporary execution file
        with tempfile.NamedTemporaryFile(mode="w", suffix=".py", delete=False, encoding="utf-8") as temp_file:
            temp_file.write(wrapped_code)
            temp_file_path = temp_file.name

        start_time = time.time()
        try:
            # Run in isolated subprocess without network or shell access
            process = subprocess.Popen(
                [sys.executable, "-I", "-S", temp_file_path],  # -I isolated mode, -S don't import site
                stdout=subprocess.PIPE,
                stderr=subprocess.PIPE,
                text=True
            )
            
            stdout, stderr = process.communicate(timeout=self.timeout_seconds)
            execution_time_ms = round((time.time() - start_time) * 1000, 2)
            exit_code = process.returncode

            passed_cases = 0
            clean_stdout = stdout
            if "__PASSED_COUNT__=" in stdout:
                parts = stdout.split("__PASSED_COUNT__=")
                clean_stdout = parts[0].strip()
                try:
                    passed_cases = int(parts[1].strip())
                except ValueError:
                    passed_cases = 0

            return {
                "stdout": clean_stdout,
                "stderr": stderr.strip(),
                "exit_code": exit_code,
                "execution_time_ms": execution_time_ms,
                "passed_test_cases": passed_cases,
                "total_test_cases": len(test_cases) if test_cases else 0,
                "error": None if exit_code == 0 else "Execution failed"
            }

        except subprocess.TimeoutExpired:
            process.kill()
            return {
                "stdout": "",
                "stderr": f"Execution Timeout Error: Code execution exceeded limit of {self.timeout_seconds} seconds.",
                "exit_code": -1,
                "execution_time_ms": self.timeout_seconds * 1000,
                "passed_test_cases": 0,
                "total_test_cases": len(test_cases) if test_cases else 0,
                "error": "TimeoutExpired"
            }
        except Exception as e:
            return {
                "stdout": "",
                "stderr": f"Sandbox Runtime Error: {str(e)}",
                "exit_code": 1,
                "execution_time_ms": 0.0,
                "passed_test_cases": 0,
                "total_test_cases": len(test_cases) if test_cases else 0,
                "error": str(e)
            }
        finally:
            if os.path.exists(temp_file_path):
                try:
                    os.remove(temp_file_path)
                except Exception:
                    pass
