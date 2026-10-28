import React, { useState } from 'react';
import { Play, RotateCcw, Check, Terminal, Sparkles, FileCode, CheckCircle2, AlertCircle } from 'lucide-react';
import { DashboardState } from '../types';

interface PythonStudioProps {
  state: DashboardState;
  dispatchAction: (action: string, payload: any) => Promise<any>;
}

const PRESET_SCRIPTS = [
  {
    name: 'Holistic Productivity Formulation (Work + Habits + Rest)',
    description: 'Computes authoritative productivity: 40% Work Done (tasks & deep work) + 35% Daily Habits + 25% Relaxing & Rest.',
    code: `# OmniSync Python Analytics: Holistic Productivity Formula
habits = dashboard_data.get("habits", [])
tasks = dashboard_data.get("tasks", [])
rest = dashboard_data.get("rest", {})
time_series = dashboard_data.get("timeSeries", [])
latest_deep_work = time_series[-1].get("deepWorkHours", 6.0) if time_series else 6.0

# 1. Habits (35%)
total_habits = len(habits) if habits else 1
habits_done = sum(1 for h in habits if h.get("completed", False))
habits_rate = (habits_done / total_habits) * 100

# 2. Work Done (40%)
tasks_done = sum(1 for t in tasks if t.get("completed", False))
task_rate = min(100.0, (tasks_done / 5.0) * 100)
focus_rate = min(100.0, (latest_deep_work / 6.0) * 100)
work_rate = 0.6 * task_rate + 0.4 * focus_rate

# 3. Relaxing & Rest (25%)
sleep_hours = rest.get("sleepHours", 7.5)
sleep_rate = min(100.0, (sleep_hours / rest.get("sleepTarget", 7.5)) * 100)
relax_mins = rest.get("relaxationMinutes", 45)
relax_rate = min(100.0, (relax_mins / rest.get("relaxationTarget", 45)) * 100)
rest_rate = 0.5 * sleep_rate + 0.25 * rest.get("sleepQuality", 85) + 0.25 * relax_rate

# Balanced Index
final_score = round(0.40 * work_rate + 0.35 * habits_rate + 0.25 * rest_rate)

print(f"=== Holistic Productivity Analysis ===")
print(f"1. Work Done Rate (40% weight): {work_rate:.1f}% ({tasks_done} tasks, {latest_deep_work}h focus)")
print(f"2. Daily Habits Rate (35% weight): {habits_rate:.1f}% ({habits_done}/{total_habits} habits)")
print(f"3. Rest & Recovery Rate (25% weight): {rest_rate:.1f}% ({sleep_hours}h sleep, {relax_mins}m relaxation)")
print(f"----------------------------------------")
print(f"Authoritative Productivity Index: {final_score}%")

result = {
    "productivity_score": final_score,
    "work_done_rate": round(work_rate, 1),
    "habits_rate": round(habits_rate, 1),
    "rest_recovery_rate": round(rest_rate, 1),
    "status": "Balanced & Sustainable" if rest_rate >= 70 else "Rest Deficit Detected"
}
`
  },
  {
    name: '7-Day Predictive Linear Regression',
    description: 'Calculates ordinary least squares trendline, R² coefficient, and 7-day projection for productivity.',
    code: `# OmniSync Python Analytics: Predictive Regression
time_series = dashboard_data.get("timeSeries", [])
x = list(range(len(time_series)))
y = [pt["productivity"] for pt in time_series]

# Compute slope and intercept
n = len(x)
mean_x = sum(x) / n
mean_y = sum(y) / n

slope = sum((x[i] - mean_x) * (y[i] - mean_y) for i in range(n)) / sum((x[i] - mean_x)**2 for i in range(n))
intercept = mean_y - slope * mean_x

print(f"Computed Slope: {slope:.3f} pts/day")
print(f"Intercept: {intercept:.2f}")

# Next 7 days projection
projections = []
for day in range(1, 8):
    future_x = (n - 1) + day
    proj = min(100.0, max(0.0, slope * future_x + intercept))
    projections.append(round(proj, 2))
    print(f"Day +{day}: Projected Productivity = {proj:.1f}%")

result = {
    "model": "Ordinary Least Squares",
    "slope": round(slope, 3),
    "intercept": round(intercept, 2),
    "projectionsNext7d": projections
}
`
  },
  {
    name: 'Z-Score Statistical Outlier & Anomaly Scan',
    description: 'Scans all metrics for values deviating beyond 1.6 standard deviations from the moving mean.',
    code: `# OmniSync Python Analytics: Anomaly Detection Engine
import math

time_series = dashboard_data.get("timeSeries", [])
metrics_to_scan = ["productivity", "deepWorkHours", "energy", "expenses"]

detected_anomalies = []

for metric in metrics_to_scan:
    vals = [float(pt.get(metric, 0)) for pt in time_series]
    if len(vals) < 3:
        continue
    mean = sum(vals) / len(vals)
    variance = sum((v - mean)**2 for v in vals) / len(vals)
    std = math.sqrt(variance) if variance > 0 else 0.001
    
    print(f"--- Metric: {metric} ---")
    print(f"Mean: {mean:.2f}, StdDev: {std:.2f}")
    
    for i, pt in enumerate(time_series):
        v = float(pt.get(metric, 0))
        z = (v - mean) / std
        if abs(z) >= 1.5:
            anomaly = {
                "date": pt["date"],
                "metric": metric,
                "value": v,
                "z_score": round(z, 2),
                "type": "surge" if z > 0 else "dip"
            }
            detected_anomalies.append(anomaly)
            print(f"  [!] Flagged {pt['date']}: value {v} (Z-Score: {z:.2f})")

print(f"\nTotal Anomalies Detected: {len(detected_anomalies)}")
result = detected_anomalies
`
  },
  {
    name: 'Pearson Correlation Matrix (Deep Work vs Energy)',
    description: 'Evaluates covariance and linear correlation between focus time and energy ratings.',
    code: `# OmniSync Python Analytics: Pearson Correlation
import math

time_series = dashboard_data.get("timeSeries", [])
x = [pt["deepWorkHours"] for pt in time_series]
y = [pt["energy"] for pt in time_series]

n = len(x)
mean_x = sum(x) / n
mean_y = sum(y) / n

numerator = sum((x[i] - mean_x) * (y[i] - mean_y) for i in range(n))
denominator = math.sqrt(sum((x[i] - mean_x)**2 for i in range(n)) * sum((y[i] - mean_y)**2 for i in range(n)))

r = numerator / denominator if denominator != 0 else 0
print(f"Sample size: {n} days")
print(f"Pearson Correlation (Deep Work vs Energy): {r:.3f}")

if r > 0.7:
    insight = "Strong positive correlation: Higher deep work hours directly correlate with peak energy scores."
elif r > 0.3:
    insight = "Moderate correlation detected."
else:
    insight = "Low correlation."

print(f"Insight: {insight}")

result = {
    "metricA": "deepWorkHours",
    "metricB": "energy",
    "correlation_coefficient": round(r, 3),
    "interpretation": insight
}
`
  }
];

export const PythonStudio: React.FC<PythonStudioProps> = ({ state, dispatchAction }) => {
  const [selectedPresetIndex, setSelectedPresetIndex] = useState(0);
  const [code, setCode] = useState(PRESET_SCRIPTS[0].code);
  const [isRunning, setIsRunning] = useState(false);
  const [output, setOutput] = useState<string>('');
  const [jsonResult, setJsonResult] = useState<any>(null);
  const [executionTime, setExecutionTime] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSelectPreset = (index: number) => {
    setSelectedPresetIndex(index);
    setCode(PRESET_SCRIPTS[index].code);
    setOutput('');
    setJsonResult(null);
    setError(null);
  };

  const handleRunScript = async () => {
    setIsRunning(true);
    setError(null);
    try {
      const res = await fetch('/api/python/run', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code })
      });
      const data = await res.json();
      if (!data.success) {
        setError(data.error || 'Execution failed');
      }
      setOutput(data.output || '');
      setJsonResult(data.result);
      setExecutionTime(data.executionTimeMs);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="pb-4 border-b border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-white">
              Python Analytics Studio
            </h1>
            <span className="px-2 py-0.5 rounded text-[11px] font-mono bg-indigo-950 text-indigo-300 border border-indigo-800">
              Python 3.10
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Execute server-authoritative Python scripts directly against your live dashboard state
          </p>
        </div>

        <button
          onClick={handleRunScript}
          disabled={isRunning}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white rounded-md text-xs font-semibold shadow-xs transition-colors"
        >
          <Play className="w-3.5 h-3.5 fill-current" />
          {isRunning ? 'Executing Python...' : 'Run Python Script'}
        </button>
      </div>

      {/* Preset Selector */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {PRESET_SCRIPTS.map((preset, idx) => (
          <button
            key={preset.name}
            onClick={() => handleSelectPreset(idx)}
            className={`p-3 rounded-lg border text-left transition-all ${
              selectedPresetIndex === idx
                ? 'bg-slate-900 border-indigo-500/60 shadow-xs'
                : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-white">{preset.name}</span>
              {selectedPresetIndex === idx && (
                <span className="w-2 h-2 rounded-full bg-indigo-400" />
              )}
            </div>
            <p className="text-[11px] text-slate-400 mt-1 line-clamp-2 leading-relaxed">
              {preset.description}
            </p>
          </button>
        ))}
      </div>

      {/* Code Editor & Console Output */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Editor Box */}
        <div className="bg-slate-950 border border-slate-800 rounded-xl overflow-hidden flex flex-col">
          <div className="px-4 py-2.5 bg-slate-900 border-b border-slate-800 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2 text-slate-300 font-mono">
              <FileCode className="w-3.5 h-3.5 text-indigo-400" />
              <span>analytics_routine.py</span>
            </div>
            <button
              onClick={() => setCode(PRESET_SCRIPTS[selectedPresetIndex].code)}
              className="text-slate-400 hover:text-white flex items-center gap-1 text-[11px]"
              title="Reset code to original template"
            >
              <RotateCcw className="w-3 h-3" /> Reset
            </button>
          </div>

          <textarea
            value={code}
            onChange={(e) => setCode(e.target.value)}
            spellCheck={false}
            className="flex-1 min-h-[380px] p-4 bg-slate-950 text-slate-200 font-mono text-xs leading-relaxed resize-none focus:outline-none focus:ring-1 focus:ring-indigo-500"
          />

          <div className="px-4 py-2 bg-slate-900/50 border-t border-slate-800/80 text-[11px] text-slate-500 flex items-center justify-between">
            <span>Context exposed: <code className="text-slate-300">dashboard_data</code>, <code className="text-slate-300">result</code></span>
            <span>UTF-8 · LF</span>
          </div>
        </div>

        {/* Execution Output Console */}
        <div className="bg-slate-950 border border-slate-800 rounded-xl overflow-hidden flex flex-col">
          <div className="px-4 py-2.5 bg-slate-900 border-b border-slate-800 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2 text-slate-300 font-mono">
              <Terminal className="w-3.5 h-3.5 text-emerald-400" />
              <span>Standard Output (stdout)</span>
            </div>

            {executionTime !== null && (
              <span className="text-[11px] font-mono text-slate-400">
                Completed in {executionTime}ms
              </span>
            )}
          </div>

          <div className="flex-1 p-4 bg-black/40 font-mono text-xs overflow-y-auto min-h-[380px] space-y-3">
            {error ? (
              <div className="p-3 bg-rose-950/60 border border-rose-800/80 rounded text-rose-200">
                <div className="flex items-center gap-2 font-semibold text-rose-400">
                  <AlertCircle className="w-4 h-4" /> Execution Traceback Error
                </div>
                <pre className="mt-2 text-[11px] whitespace-pre-wrap">{error}</pre>
              </div>
            ) : output ? (
              <pre className="text-slate-300 whitespace-pre-wrap leading-relaxed">{output}</pre>
            ) : (
              <div className="text-slate-600 text-xs italic">
                Press "Run Python Script" above to execute the mathematical routine.
              </div>
            )}

            {jsonResult && (
              <div className="mt-4 pt-4 border-t border-slate-800/80">
                <div className="text-[11px] text-indigo-400 uppercase tracking-wider font-semibold mb-2">
                  Returned Result Object:
                </div>
                <pre className="p-3 bg-slate-900/80 rounded border border-slate-800 text-[11px] text-emerald-300 overflow-x-auto">
                  {JSON.stringify(jsonResult, null, 2)}
                </pre>
              </div>
            )}
          </div>

          <div className="px-4 py-2 bg-slate-900/50 border-t border-slate-800/80 text-[11px] text-slate-500 flex items-center justify-between">
            <span className="flex items-center gap-1.5 text-emerald-400">
              <CheckCircle2 className="w-3 h-3" /> Sandboxed Runtime Active
            </span>
            <span>Real-time IPC bridge</span>
          </div>
        </div>
      </div>
    </div>
  );
};
