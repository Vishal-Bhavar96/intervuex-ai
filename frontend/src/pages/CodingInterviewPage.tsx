import React, { useState } from 'react';
import { api } from '../services/api';
import { Code, Play, CheckCircle, AlertTriangle, Terminal, Cpu } from 'lucide-react';

export const CodingInterviewPage: React.FC = () => {
  const [code, setCode] = useState(
`def two_sum(nums: list[int], target: int) -> list[int]:
    """
    Find indices of two numbers in nums that add up to target.
    Time Complexity: O(n) using a hash map lookup.
    """
    lookup = {}
    for i, num in enumerate(nums):
        diff = target - num
        if diff in lookup:
            return [lookup[diff], i]
        lookup[num] = i
    return []

# Test execution
if __name__ == '__main__':
    print("Executing two_sum([2, 7, 11, 15], 9)...")
    result = two_sum([2, 7, 11, 15], 9)
    print("Result:", result)
`
  );

  const [output, setOutput] = useState<{ stdout: string; stderr: string; time: number; error: string | null } | null>(null);
  const [running, setRunning] = useState(false);

  const handleRunCode = async () => {
    setRunning(true);
    setOutput(null);
    try {
      const res = await api.runCode({
        code,
        language: 'python',
        test_cases: [
          { function_name: 'two_sum', inputs: { nums: [2, 7, 11, 15], target: 9 }, expected: [0, 1] }
        ]
      });
      setOutput({
        stdout: res.stdout,
        stderr: res.stderr,
        time: res.execution_time_ms,
        error: res.error
      });
    } catch (e: any) {
      setOutput({
        stdout: '',
        stderr: e.message || 'Execution error',
        time: 0,
        error: 'Execution failed'
      });
    } finally {
      setRunning(false);
    }
  };

  return (
    <div className="container" style={{ padding: '2.5rem 1.5rem', maxWidth: '1200px' }}>
      <div style={{ marginBottom: '1.5rem' }}>
        <h2>Live Sandboxed Coding IDE</h2>
        <p>Solve algorithmic and system design coding challenges in an isolated execution sandbox.</p>
      </div>

      <div className="grid grid-2 gap-6" style={{ gridTemplateColumns: '1fr 1.2fr' }}>
        {/* Left Column: Problem Statement */}
        <div className="card">
          <h3 style={{ color: '#1E3A5F', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Code size={20} color="#2563EB" /> Two Sum - Optimal Search
          </h3>

          <div style={{ marginBottom: '1.25rem' }}>
            <p style={{ marginBottom: '0.75rem' }}>
              Given an array of integers <code>nums</code> and an integer <code>target</code>, return indices of the two numbers such that they add up to target.
            </p>
            <p style={{ fontSize: '0.875rem', color: '#64748B' }}>
              You may assume that each input would have exactly one solution, and you may not use the same element twice.
            </p>
          </div>

          <div style={{ background: '#F8FAFC', padding: '1rem', borderRadius: '8px', marginBottom: '1rem', fontSize: '0.85rem' }}>
            <strong>Example 1:</strong><br />
            <code>Input: nums = [2,7,11,15], target = 9</code><br />
            <code>Output: [0,1]</code><br />
            <code>Explanation: Because nums[0] + nums[1] == 9, we return [0, 1].</code>
          </div>

          <div style={{ fontSize: '0.85rem' }}>
            <strong>Constraints:</strong>
            <ul style={{ paddingLeft: '1.2rem', marginTop: '0.25rem', color: '#475569' }}>
              <li>2 ≤ nums.length ≤ 10^4</li>
              <li>Only one valid answer exists.</li>
              <li>Time complexity requirement: O(n).</li>
            </ul>
          </div>
        </div>

        {/* Right Column: Code Editor & Execution Console */}
        <div>
          <div className="card" style={{ padding: '0', overflow: 'hidden', marginBottom: '1rem' }}>
            <div style={{ background: '#1E293B', padding: '0.75rem 1rem', color: '#94A3B8', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.85rem' }}>
              <span>Python 3.10 Code Editor</span>
              <span className="badge badge-neutral">SANDBOX ISOLATED</span>
            </div>

            <textarea 
              className="code-editor" 
              style={{ width: '100%', minHeight: '320px', border: 'none', borderRadius: '0', outline: 'none', resize: 'vertical' }}
              value={code}
              onChange={e => setCode(e.target.value)}
            />

            <div style={{ padding: '0.75rem 1rem', background: '#0F172A', borderTop: '1px solid #334155', display: 'flex', justifyContent: 'flex-end' }}>
              <button className="btn btn-action" onClick={handleRunCode} disabled={running}>
                <Play size={16} /> {running ? 'Running in Sandbox...' : 'Run Code'}
              </button>
            </div>
          </div>

          {/* Console Output */}
          {output && (
            <div className="card" style={{ background: '#0F172A', color: '#F8FAFC', border: '1px solid #334155' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem', fontSize: '0.85rem', color: '#94A3B8' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}><Terminal size={16} /> Sandbox Terminal Console</span>
                <span>Execution Time: {output.time} ms</span>
              </div>

              {output.stdout && (
                <pre style={{ color: '#4ADE80', fontFamily: 'var(--font-mono)', fontSize: '0.875rem', whiteSpace: 'pre-wrap' }}>
                  {output.stdout}
                </pre>
              )}

              {output.stderr && (
                <pre style={{ color: '#F87171', fontFamily: 'var(--font-mono)', fontSize: '0.875rem', whiteSpace: 'pre-wrap', marginTop: '0.5rem' }}>
                  {output.stderr}
                </pre>
              )}
            </div>
          )}
        </div>

      </div>
    </div>
  );
};
