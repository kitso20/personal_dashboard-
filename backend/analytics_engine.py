#!/usr/bin/env python3
"""
OmniSync Python Analytics & Processing Engine
Calculates true holistic productivity measured by:
1. Work Done (Tasks velocity & deep focus execution)
2. Daily Habits (Consistency, discipline & daily routines)
3. Relaxing & Resting (Sleep duration, quality, mindful relaxation & downtime recovery)
"""

import sys
import json
import math
import io
import time
import uuid
import datetime
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText

def calculate_linear_regression(x_vals, y_vals):
    n = len(x_vals)
    if n < 2:
        return 0, y_vals[0] if y_vals else 0, 0
    mean_x = sum(x_vals) / n
    mean_y = sum(y_vals) / n
    
    numerator = sum((x_vals[i] - mean_x) * (y_vals[i] - mean_y) for i in range(n))
    denominator = sum((x_vals[i] - mean_x) ** 2 for i in range(n))
    
    slope = numerator / denominator if denominator != 0 else 0
    intercept = mean_y - slope * mean_x
    
    ss_tot = sum((y - mean_y) ** 2 for y in y_vals)
    ss_res = sum((y_vals[i] - (slope * x_vals[i] + intercept)) ** 2 for i in range(n))
    r_squared = 1 - (ss_res / ss_tot) if ss_tot != 0 else 1.0
    
    return slope, intercept, max(0.0, min(1.0, r_squared))

def compute_productivity_breakdown(habits, tasks, rest, deep_work_hours, task_target=5, deep_work_target=6.0):
    """
    Computes holistic productivity measured directly by:
    1. Work Done (40%): Tasks completed + Deep work focus
    2. Daily Habits (35%): Daily habits completion rate
    3. Relaxing & Resting (25%): Sleep hours, sleep quality, and mindful downtime
    """
    # 1. Habits Rate (35%)
    total_habits = len(habits) if habits else 1
    habits_completed = sum(1 for h in habits if h.get("completed", False)) if habits else 0
    habits_rate = round((habits_completed / total_habits) * 100, 1)

    # 2. Work Done Rate (40%)
    completed_tasks = sum(1 for t in tasks if t.get("completed", False)) if tasks else 0
    tasks_rate = min(100.0, round((completed_tasks / max(1, task_target)) * 100, 1))

    deep_work = float(deep_work_hours) if deep_work_hours is not None else 0.0
    focus_rate = min(100.0, round((deep_work / max(1.0, deep_work_target)) * 100, 1))
    work_done_rate = round(0.6 * tasks_rate + 0.4 * focus_rate, 1)

    # 3. Rest & Relaxation Rate (25%)
    rest_data = rest or {}
    sleep_hours = float(rest_data.get("sleepHours", 7.5))
    sleep_target = float(rest_data.get("sleepTarget", 7.5))
    sleep_rate = min(100.0, round((sleep_hours / max(1.0, sleep_target)) * 100, 1))

    relax_mins = float(rest_data.get("relaxationMinutes", 35.0))
    relax_target = float(rest_data.get("relaxationTarget", 45.0))
    relax_rate = min(100.0, round((relax_mins / max(1.0, relax_target)) * 100, 1))

    sleep_quality = float(rest_data.get("sleepQuality", 85.0))

    # Rest composite: 50% sleep duration + 25% sleep quality + 25% awake relaxation downtime
    rest_recovery_rate = round(0.5 * sleep_rate + 0.25 * sleep_quality + 0.25 * relax_rate, 1)

    # Balanced overall score: 40% Work + 35% Habits + 25% Rest
    productivity_score = round(0.40 * work_done_rate + 0.35 * habits_rate + 0.25 * rest_recovery_rate)
    productivity_score = max(0, min(100, productivity_score))

    formula_desc = f"40% Work Done ({completed_tasks} tasks, {deep_work:.1f}h focus) + 35% Habits ({habits_completed}/{total_habits}) + 25% Rest ({sleep_hours}h sleep, {relax_mins}m relaxation)"

    return {
        "score": productivity_score,
        "workDoneRate": work_done_rate,
        "habitsRate": habits_rate,
        "restRecoveryRate": rest_recovery_rate,
        "habitsCompleted": habits_completed,
        "totalHabits": total_habits,
        "tasksCompleted": completed_tasks,
        "tasksTarget": task_target,
        "deepWorkHours": round(deep_work, 1),
        "deepWorkTarget": deep_work_target,
        "sleepHours": sleep_hours,
        "sleepTarget": sleep_target,
        "relaxationMinutes": relax_mins,
        "relaxationTarget": relax_target,
        "formula": formula_desc
    }

def analyze_metrics(data):
    time_series = data.get("timeSeries", [])
    habits = data.get("habits", [])
    tasks = data.get("tasks", [])
    rest = data.get("rest", {})
    
    latest_deep_work = time_series[-1].get("deepWorkHours", 6.0) if time_series else 6.0
    prod_breakdown = compute_productivity_breakdown(habits, tasks, rest, latest_deep_work)
    
    if time_series:
        time_series[-1]["productivity"] = prod_breakdown["score"]
        
    dates = [item["date"] for item in time_series]
    n = len(time_series)
    x_indices = list(range(n))
    
    metrics = ["productivity", "deepWorkHours", "energy", "expenses", "tasksDone"]
    results = {}
    anomalies = []
    
    # Check for Burnout Anomaly if rest is low and work is high
    if prod_breakdown["workDoneRate"] > 80 and prod_breakdown["restRecoveryRate"] < 50:
        anomalies.append({
            "id": "anom-burnout-risk",
            "date": dates[-1] if dates else datetime.date.today().isoformat(),
            "metric": "rest_deficit",
            "value": prod_breakdown["restRecoveryRate"],
            "expected": 75.0,
            "zScore": -2.1,
            "type": "drop",
            "severity": "high",
            "description": f"Burnout alert: High work intensity ({prod_breakdown['workDoneRate']}%) but critical rest deficit ({prod_breakdown['restRecoveryRate']}%). Relaxation break recommended."
        })
    
    for metric in metrics:
        values = [float(item.get(metric, 0)) for item in time_series]
        if not values:
            continue
            
        mean_val = sum(values) / len(values)
        variance = sum((v - mean_val) ** 2 for v in values) / len(values) if len(values) > 1 else 0.001
        std_dev = math.sqrt(variance) if variance > 0 else 0.001
        
        slope, intercept, r2 = calculate_linear_regression(x_indices, values)
        ma_3 = sum(values[-3:]) / min(len(values), 3)
        
        forecast = []
        last_date = datetime.date.fromisoformat(dates[-1]) if dates else datetime.date.today()
        for step in range(1, 8):
            future_x = n - 1 + step
            proj_val = slope * future_x + intercept
            if metric in ["productivity", "energy"]:
                proj_val = max(10, min(100, proj_val))
            elif metric == "deepWorkHours":
                proj_val = max(0, min(16, round(proj_val, 1)))
            elif metric == "expenses":
                proj_val = max(0, round(proj_val, 2))
            elif metric == "tasksDone":
                proj_val = max(0, round(proj_val))
                
            future_date = (last_date + datetime.timedelta(days=step)).isoformat()
            forecast.append({
                "date": future_date,
                "projected": round(proj_val, 2),
                "upperBound": round(proj_val + 1.28 * std_dev, 2),
                "lowerBound": round(max(0, proj_val - 1.28 * std_dev), 2)
            })
            
        for i, val in enumerate(values):
            z_score = (val - mean_val) / std_dev
            if abs(z_score) >= 1.6:
                anomalies.append({
                    "id": f"anom-{metric}-{i}",
                    "date": dates[i],
                    "metric": metric,
                    "value": round(val, 2),
                    "expected": round(mean_val, 2),
                    "zScore": round(z_score, 2),
                    "type": "surge" if z_score > 0 else "drop",
                    "severity": "high" if abs(z_score) > 2.0 else "medium",
                    "description": f"Unusual {metric} {('surge' if z_score > 0 else 'drop')} of {round(val, 1)} (vs average {round(mean_val, 1)})"
                })
                
        results[metric] = {
            "current": values[-1] if values else 0,
            "average": round(mean_val, 2),
            "stdDev": round(std_dev, 2),
            "movingAverage3d": round(ma_3, 2),
            "trendSlope": round(slope, 3),
            "trendDirection": "rising" if slope > 0.15 else ("falling" if slope < -0.15 else "stable"),
            "confidenceR2": round(r2, 3),
            "forecast7d": forecast
        }
        
    deep_work = [float(item.get("deepWorkHours", 0)) for item in time_series]
    energy = [float(item.get("energy", 0)) for item in time_series]
    tasks_series = [float(item.get("tasksDone", 0)) for item in time_series]
    
    def pearson(x, y):
        if len(x) < 2: return 0
        mx, my = sum(x)/len(x), sum(y)/len(y)
        num = sum((x[i]-mx)*(y[i]-my) for i in range(len(x)))
        den = math.sqrt(sum((x[i]-mx)**2 for i in range(len(x))) * sum((y[i]-my)**2 for i in range(len(y))))
        return round(num / den, 2) if den != 0 else 0
        
    correlations = {
        "deepWork_vs_energy": pearson(deep_work, energy),
        "deepWork_vs_tasks": pearson(deep_work, tasks_series),
    }

    return {
        "calculatedAt": datetime.datetime.now().isoformat(),
        "sampleSize": n,
        "productivityBreakdown": prod_breakdown,
        "metrics": results,
        "anomalies": anomalies,
        "correlations": correlations
    }

def generate_email_digest(payload):
    user_name = payload.get("userName", "Executive User")
    user_email = payload.get("userEmail", "motlashupingkitso@gmail.com")
    metrics_summary = payload.get("metricsSummary", {})
    recent_tasks = payload.get("recentTasks", [])
    anomalies = payload.get("anomalies", [])
    custom_note = payload.get("customNote", "All synchronized streams operating normally.")
    habits = payload.get("habits", [])
    rest = payload.get("rest", {})
    
    today_str = datetime.date.today().strftime("%B %d, %Y")
    habits_completed = sum(1 for h in habits if h.get("completed", False)) if habits else 0
    total_habits = len(habits) if habits else 0
    
    html_body = f"""
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="utf-8">
      <style>
        body {{ font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc; color: #1e293b; margin: 0; padding: 24px; }}
        .card {{ background: #ffffff; border-radius: 12px; border: 1px solid #e2e8f0; max-width: 600px; margin: 0 auto; overflow: hidden; }}
        .header {{ background: #0f172a; color: #ffffff; padding: 28px 24px; }}
        .title {{ font-size: 20px; font-weight: 700; margin: 0 0 6px 0; letter-spacing: -0.02em; }}
        .subtitle {{ font-size: 13px; color: #94a3b8; margin: 0; }}
        .content {{ padding: 24px; }}
        .metric-grid {{ display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin: 20px 0; }}
        .metric-box {{ background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 14px; }}
        .metric-label {{ font-size: 11px; text-transform: uppercase; color: #64748b; font-weight: 600; letter-spacing: 0.05em; }}
        .metric-val {{ font-size: 22px; font-weight: 700; color: #0f172a; margin-top: 4px; }}
        .section-heading {{ font-size: 14px; font-weight: 600; color: #334155; margin: 24px 0 10px 0; padding-bottom: 6px; border-bottom: 1px solid #f1f5f9; }}
        .task-row {{ display: flex; align-items: center; justify-content: space-between; padding: 8px 0; font-size: 13px; border-bottom: 1px solid #f8fafc; }}
        .badge {{ font-size: 11px; padding: 2px 8px; border-radius: 4px; font-weight: 500; }}
        .badge-done {{ background: #ecfdf5; color: #047857; }}
        .badge-pending {{ background: #fff7ed; color: #c2410c; }}
        .footer {{ padding: 20px 24px; background: #f8fafc; border-top: 1px solid #e2e8f0; font-size: 12px; color: #64748b; text-align: center; }}
      </style>
    </head>
    <body>
      <div class="card">
        <div class="header">
          <h1 class="title">OmniSync Daily Executive Digest</h1>
          <p class="subtitle">{today_str} · Generated for {user_name} ({user_email})</p>
        </div>
        <div class="content">
          <p style="font-size: 14px; line-height: 1.5; color: #475569; margin: 0;">
            {custom_note}
          </p>
          
          <div class="section-heading">Balanced Productivity (Work, Habits & Rest)</div>
          <div class="metric-grid">
            <div class="metric-box">
              <div class="metric-label">Productivity Index</div>
              <div class="metric-val">{metrics_summary.get('productivity', '90')}%</div>
              <span style="font-size: 11px; color: #64748b;">40% Work + 35% Habits + 25% Rest</span>
            </div>
            <div class="metric-box">
              <div class="metric-label">Rest & Recovery</div>
              <div class="metric-val">{rest.get('sleepHours', 7.5)}h Sleep</div>
              <span style="font-size: 11px; color: #059669;">{rest.get('relaxationMinutes', 45)}m relaxation logged</span>
            </div>
            <div class="metric-box">
              <div class="metric-label">Daily Habits Done</div>
              <div class="metric-val">{habits_completed}/{total_habits}</div>
              <span style="font-size: 11px; color: #059669;">Daily streak active</span>
            </div>
            <div class="metric-box">
              <div class="metric-label">Work Done & Focus</div>
              <div class="metric-val">{metrics_summary.get('tasksDone', '8')} tasks</div>
              <span style="font-size: 11px; color: #6366f1;">{metrics_summary.get('deepWorkHours', '6.2')}h focus</span>
            </div>
          </div>
          
          <div class="section-heading">Completed Tasks & Milestones</div>
          <div>
    """
    
    for task in recent_tasks[:4]:
        status_badge = '<span class="badge badge-done">Completed</span>' if task.get("completed") else '<span class="badge badge-pending">In Progress</span>'
        html_body += f"""
            <div class="task-row">
              <span>{task.get('title', 'Task item')}</span>
              {status_badge}
            </div>
        """
        
    if anomalies:
        html_body += """
          <div class="section-heading" style="color: #b91c1c;">Detected Statistical Outliers & Advisories</div>
        """
        for anom in anomalies[:2]:
            html_body += f"""
            <div style="background: #fef2f2; border: 1px solid #fee2e2; border-radius: 6px; padding: 10px 12px; font-size: 12px; color: #991b1b; margin-top: 6px;">
              <strong>{anom.get('metric', 'Advisory').title()}</strong>: {anom.get('description', '')}
            </div>
            """
            
    html_body += f"""
        </div>
        <div class="footer">
          Dispatched by OmniSync Python Analytics Subsystem · Real-Time Cross-Device Sync Active
        </div>
      </div>
    </body>
    </html>
    """
    
    msg = MIMEMultipart("alternative")
    msg["Subject"] = f"OmniSync Executive Briefing — {today_str}"
    msg["From"] = "OmniSync Engine <notifications@omnisync.internal>"
    msg["To"] = user_email
    msg["Date"] = datetime.datetime.now().strftime("%a, %d %b %Y %H:%M:%S +0000")
    msg["Message-ID"] = f"<{uuid.uuid4()}@omnisync.internal>"
    
    plain_text = f"OmniSync Daily Digest for {user_name} ({today_str})\n"
    plain_text += f"Productivity (Work + Habits + Rest): {metrics_summary.get('productivity', '90')}%\n"
    plain_text += f"Rest & Sleep: {rest.get('sleepHours', 7.5)}h sleep, {rest.get('relaxationMinutes', 45)}m relaxation\n"
    plain_text += f"Habits: {habits_completed}/{total_habits} completed\n"
    plain_text += f"Work Done: {metrics_summary.get('tasksDone', '8')} tasks, {metrics_summary.get('deepWorkHours', '6.2')}h focus\n"
    
    msg.attach(MIMEText(plain_text, "plain"))
    msg.attach(MIMEText(html_body, "html"))
    
    return {
        "success": True,
        "messageId": msg["Message-ID"],
        "subject": msg["Subject"],
        "to": user_email,
        "from": msg["From"],
        "date": msg["Date"],
        "html": html_body,
        "plainText": plain_text,
        "status": "ready_for_dispatch",
        "timestamp": datetime.datetime.now().isoformat()
    }

def execute_user_script(payload):
    code = payload.get("code", "")
    context = payload.get("data", {})
    
    if not code:
        return {"error": "No Python code provided to execute."}
        
    stdout_buffer = io.StringIO()
    old_stdout = sys.stdout
    sys.stdout = stdout_buffer
    
    start_time = time.perf_counter()
    exec_scope = {
        "__builtins__": {
            "abs": abs, "all": all, "any": any, "bool": bool, "dict": dict,
            "enumerate": enumerate, "filter": filter, "float": float, "format": format,
            "int": int, "isinstance": isinstance, "len": len, "list": list,
            "map": map, "max": max, "min": min, "pow": pow, "print": print,
            "range": range, "reversed": reversed, "round": round, "set": set,
            "sorted": sorted, "str": str, "sum": sum, "tuple": tuple, "zip": zip
        },
        "dashboard_data": context,
        "math": math,
        "json": json,
        "result": None
    }
    
    error_msg = None
    try:
        exec(code, exec_scope)
    except Exception as e:
        error_msg = f"{type(e).__name__}: {str(e)}"
    finally:
        sys.stdout = old_stdout
        
    elapsed_ms = round((time.perf_counter() - start_time) * 1000, 2)
    output_str = stdout_buffer.getvalue()
    raw_result = exec_scope.get("result")
    
    serializable_result = None
    if raw_result is not None:
        try:
            json.dumps(raw_result)
            serializable_result = raw_result
        except Exception:
            serializable_result = str(raw_result)
            
    return {
        "success": error_msg is None,
        "output": output_str,
        "result": serializable_result,
        "error": error_msg,
        "executionTimeMs": elapsed_ms,
        "timestamp": datetime.datetime.now().isoformat()
    }

def main():
    if len(sys.argv) < 2:
        print(json.dumps({"error": "No command specified. Usage: analytics_engine.py <analyze|digest|script>"}))
        sys.exit(1)
        
    action = sys.argv[1]
    
    input_text = ""
    if len(sys.argv) > 2:
        input_text = sys.argv[2]
    elif not sys.stdin.isatty():
        input_text = sys.stdin.read().strip()
        
    payload = {}
    if input_text:
        try:
            payload = json.loads(input_text)
        except Exception as e:
            print(json.dumps({"error": f"Invalid JSON input: {str(e)}"}))
            sys.exit(1)
            
    if action == "analyze":
        output = analyze_metrics(payload)
    elif action == "digest":
        output = generate_email_digest(payload)
    elif action == "script":
        output = execute_user_script(payload)
    else:
        output = {"error": f"Unknown action: {action}"}
        
    print(json.dumps(output))

if __name__ == "__main__":
    main()
