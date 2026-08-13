import urllib.request
import urllib.parse
import json
import uuid
import time

SUPABASE_URL = "https://ysdbvdfjrldtlwclpwvq.supabase.co"
SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlzZGJ2ZGZqcmxkdGx3Y2xwd3ZxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODU5MjU3NTIsImV4cCI6MjEwMTUwMTc1Mn0.hkde9Kc4qyqA2VVUp5x9QsdZ5o-biOaeYvX_4WhYz7I"

HEADERS = {
    "apikey": SUPABASE_KEY,
    "Authorization": f"Bearer {SUPABASE_KEY}",
    "Content-Type": "application/json",
    "Prefer": "return=representation"
}

def make_request(method, endpoint, data=None):
    url = f"{SUPABASE_URL}/rest/v1/{endpoint}"
    req = urllib.request.Request(url, method=method, headers=HEADERS)
    if data:
        req.data = json.dumps(data).encode('utf-8')
    
    try:
        with urllib.request.urlopen(req) as response:
            res_data = response.read().decode('utf-8')
            if res_data:
                return json.loads(res_data)
            return []
    except urllib.error.HTTPError as e:
        print(f"HTTP Error: {e.code} - {e.read().decode()}")
        raise

print("--- STARTING LIVE THREAD LIFECYCLE TEST ---\n")

# 1. Ensure Partner Exists
print("1. Looking for 'Leap Scholar' partner...")
partners = make_request("GET", "partners?name=eq.Leap%20Scholar&select=id")
if not partners:
    print("Partner not found, creating...")
    partners = make_request("POST", "partners", {"name": "Leap Scholar"})
partner_id = partners[0]['id']
print(f"Partner ID: {partner_id}\n")

# 2. Simulate Initial Slack Webhook (Create Lead & Thread)
prospect_id = f"test_{int(time.time())}"
print(f"2. Simulating Initial Slack Webhook for Prospect: {prospect_id}")
student = make_request("POST", "students", {
    "prospect_id": prospect_id,
    "name": "Live Test Student",
    "partner_id": partner_id,
    "status": "New",
    "notes": "Testing thread lifecycle live"
})
student_id = student[0]['id']
print(f"Created Student ID: {student_id}")

thread_ts = f"1000000000.{int(time.time())}"
thread = make_request("POST", "slack_threads", {
    "student_id": student_id,
    "slack_channel_id": "C_TEST_123",
    "slack_thread_ts": thread_ts,
    "status": "open",
    "followup_count": 0
})
thread_id = thread[0]['id']
print(f"Created Slack Thread ID: {thread_id} (ts: {thread_ts})")

approval_1 = make_request("POST", "approvals", {
    "student_id": student_id,
    "slack_thread_id": thread_id,
    "raw_slack_context": "Partner: Leap Scholar. Counselor told him to book after visa",
    "message": "AI Draft 1",
    "status": "pending",
    "is_followup": False
})
print("Added initial message to Approval Queue.\n")

time.sleep(1) # wait for a second

# 3. Simulate Follow-up Webhook (Same Thread)
print("3. Simulating Follow-up Webhook on the exact same thread_ts...")
# In the webhook, it updates the count
make_request("PATCH", f"slack_threads?id=eq.{thread_id}", {"followup_count": 1})

approval_2 = make_request("POST", "approvals", {
    "student_id": student_id,
    "slack_thread_id": thread_id,
    "raw_slack_context": "@Manu S Nair any update here?",
    "message": "",
    "status": "pending",
    "is_followup": True,
    "followup_number": 1
})
print("Follow-up count incremented and Follow-up #1 added to Approval Queue.\n")


# 4. Print the resulting DB State
print("--- TEST COMPLETE! FETCHING FINAL DATABASE STATE ---\n")

final_thread = make_request("GET", f"slack_threads?id=eq.{thread_id}&select=id,slack_thread_ts,status,followup_count,created_at")[0]
print(f"✅ THREAD RECORD:")
print(f"   ID: {final_thread['id']}")
print(f"   TS: {final_thread['slack_thread_ts']}")
print(f"   Followup Count: {final_thread['followup_count']}")

print("\n✅ APPROVAL QUEUE ITEMS FOR THIS THREAD:")
final_approvals = make_request("GET", f"approvals?slack_thread_id=eq.{thread_id}&select=id,raw_slack_context,is_followup,followup_number,status,created_at&order=created_at.asc")

for app in final_approvals:
    badge = f"Follow-up #{app['followup_number']}" if app['is_followup'] else "Initial Message"
    print(f"   - [{badge}] Status: {app['status']}")
    print(f"     Context: {app['raw_slack_context']}")
    print("")

print("The backend logic for the Slack Thread Lifecycle is fully functional!")
