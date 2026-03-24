import urllib.request
import json
import time

print("Creating scrape job for DuPont Nylon...")
req = urllib.request.Request(
    "http://127.0.0.1:8000/fetch", 
    data=b'{"company":"DuPont","material_category":"Nylon"}', 
    headers={'Content-Type':'application/json'}, 
    method='POST'
)

with urllib.request.urlopen(req) as response:
    job = json.loads(response.read().decode())
    job_id = job["job_id"]

print(f"Job {job_id} created. Polling API...")

while True:
    with urllib.request.urlopen(f"http://127.0.0.1:8000/jobs/{job_id}") as response:
        status = json.loads(response.read().decode())
        if status['status'] == 'running':
            # minimal output for running
            pass
        else:
            print(f"Status: {status['status']}")
            print(f"Total Found: {status['total_found']}")
            for log in status['logs']:
                if log['event'] == 'no_pdfs' or 'error' in log['event'] or log['event'] == 'search_done':
                    print(log)
            break
    time.sleep(2)

if status['total_found'] > 0:
    print(f"\nFetching candidates for job {job_id}...")
    with urllib.request.urlopen(f"http://127.0.0.1:8000/candidates?job_id={job_id}") as response:
        cands = json.loads(response.read().decode())
        for c in cands[:3]:
            print(f"[{c['confidence_score']:.2f}] {c['pdf_url']}")
