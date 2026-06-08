# Agent 3 Testing Guide

## Setup

Ensure the system is running:
```bash
# Terminal 1: Start FastAPI
cd backend
uvicorn app.main:app --reload

# Terminal 2: Prepare test data
python scripts/load_mock_data_to_qdrant.py
```

## Test Cases

### Test 1: Full Workflow (Agent 1 → 2 → 3 with Matches)

**Scenario**: RESOLVED incident with similar matches available

```bash
curl -X POST http://localhost:8000/api/workflows/start \
  -H "Content-Type: application/json" \
  -d '{"incident_number": "INC000001"}'
```

**Expected Results:**
- Agent 1: `COMPLETED` (validation passed)
- Agent 2: `COMPLETED` (found similar incidents)
- Agent 3: `COMPLETED` (filtered and ranked)
- `similar_incidents_found`: `true`
- `total_matches_found`: > 0
- `next_agent`: `"agent5"`
- `top_similar_incidents`: Array of up to 5 incidents

**Verify:**
- ✓ All incidents have `similarity_score` ≥ 0.3
- ✓ Maximum 5 incidents returned
- ✓ Incidents sorted by score (descending)
- ✓ Datafix information included
- ✓ All required fields present

---

### Test 2: Direct Agent 3 API with Sample Data

**Scenario**: Call Agent 3 directly with mock Agent 2 response

```bash
curl -X POST http://localhost:8000/api/agents/agent3/process \
  -H "Content-Type: application/json" \
  -d '{
    "success": true,
    "message": "Found 8 similar incidents",
    "match_count": 8,
    "similar_incidents": [
      {
        "incident_number": "INC000001",
        "short_description": "VMware access not provisioned for new hire",
        "description": "New hire cannot access the VMware console after onboarding.",
        "state": "RESOLVED",
        "resolution_notes": "Updated VMware access status and re-ran entitlement sync.",
        "assignment_group": "VMware Access Provisioning",
        "assigned_to": "Anika Sharma",
        "similarity_score": 0.95,
        "datafix": {
          "datafix_id": "DFX000001",
          "description": "Activate VMware access profile",
          "datafix_code": "UPDATE USER_ACCESS SET ACCESS_STATUS=..."
        }
      },
      {
        "incident_number": "INC000002",
        "short_description": "VMware entitlement missing after onboarding",
        "description": "Staff member reports VMware portal access is unavailable.",
        "state": "RESOLVED",
        "resolution_notes": "Set access status to active and refreshed provisioning queue.",
        "assignment_group": "VMware Access Provisioning",
        "assigned_to": "Rohan Mehta",
        "similarity_score": 0.87,
        "datafix": {
          "datafix_id": "DFX000002",
          "description": "Activate VMware entitlement",
          "datafix_code": "UPDATE USER_ACCESS SET ACCESS_STATUS=..."
        }
      }
    ]
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Found 2 similar incident(s).",
  "similar_incidents_found": true,
  "total_matches_found": 2,
  "top_similar_incidents": [
    {
      "incident_number": "INC000001",
      "short_description": "VMware access not provisioned for new hire",
      "similarity_score": 0.95,
      ...
    },
    {
      "incident_number": "INC000002",
      "short_description": "VMware entitlement missing after onboarding",
      "similarity_score": 0.87,
      ...
    }
  ],
  "next_agent": "agent5"
}
```

---

### Test 3: No Matches Scenario

**Scenario**: Agent 2 returns success but no incidents

```bash
curl -X POST http://localhost:8000/api/agents/agent3/process \
  -H "Content-Type: application/json" \
  -d '{
    "success": true,
    "message": "No similar incidents found.",
    "match_count": 0,
    "similar_incidents": []
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "message": "No similar incidents found.",
  "similar_incidents_found": false,
  "total_matches_found": 0,
  "top_similar_incidents": [],
  "next_agent": "agent4"
}
```

**Verify:**
- ✓ Returns success=true (not error)
- ✓ Routing is to agent4 (not agent5)
- ✓ Empty incidents array

---

### Test 4: Below-Threshold Filtering

**Scenario**: All matches below 30% threshold

```bash
curl -X POST http://localhost:8000/api/agents/agent3/process \
  -H "Content-Type: application/json" \
  -d '{
    "success": true,
    "message": "Found 3 similar incidents",
    "match_count": 3,
    "similar_incidents": [
      {
        "incident_number": "INC000010",
        "short_description": "Different domain incident",
        "description": "Unrelated issue",
        "state": "RESOLVED",
        "resolution_notes": "Fixed",
        "assignment_group": "Other Team",
        "assigned_to": "Someone",
        "similarity_score": 0.25,
        "datafix": null
      },
      {
        "incident_number": "INC000011",
        "short_description": "Another different incident",
        "description": "Not related",
        "state": "RESOLVED",
        "resolution_notes": "Done",
        "assignment_group": "Other",
        "assigned_to": "Person",
        "similarity_score": 0.15,
        "datafix": null
      }
    ]
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "message": "No similar incidents found.",
  "similar_incidents_found": false,
  "total_matches_found": 0,
  "top_similar_incidents": [],
  "next_agent": "agent4"
}
```

**Verify:**
- ✓ Below-threshold incidents filtered out
- ✓ Routed to agent4 (no matches)
- ✓ Empty results

---

### Test 5: Top-5 Limiting (Many Matches)

**Scenario**: More than 5 matches above threshold

```bash
# Test data: 10 incidents with scores from 0.95 to 0.60
curl -X POST http://localhost:8000/api/agents/agent3/process \
  -H "Content-Type: application/json" \
  -d '{
    "success": true,
    "message": "Found 10 similar incidents",
    "match_count": 10,
    "similar_incidents": [
      {"incident_number": "INC1", "similarity_score": 0.95, ...},
      {"incident_number": "INC2", "similarity_score": 0.90, ...},
      {"incident_number": "INC3", "similarity_score": 0.85, ...},
      {"incident_number": "INC4", "similarity_score": 0.80, ...},
      {"incident_number": "INC5", "similarity_score": 0.75, ...},
      {"incident_number": "INC6", "similarity_score": 0.70, ...},
      {"incident_number": "INC7", "similarity_score": 0.65, ...},
      {"incident_number": "INC8", "similarity_score": 0.60, ...},
      ...
    ]
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Found 5 similar incident(s).",
  "similar_incidents_found": true,
  "total_matches_found": 10,
  "top_similar_incidents": [
    {"incident_number": "INC1", "similarity_score": 0.95},
    {"incident_number": "INC2", "similarity_score": 0.90},
    {"incident_number": "INC3", "similarity_score": 0.85},
    {"incident_number": "INC4", "similarity_score": 0.80},
    {"incident_number": "INC5", "similarity_score": 0.75}
  ],
  "next_agent": "agent5"
}
```

**Verify:**
- ✓ Exactly 5 incidents returned
- ✓ Highest scoring 5 selected
- ✓ Sorted in descending order
- ✓ total_matches_found = 10 (accurate count)

---

### Test 6: Agent 1 Failure → Agent 3 Skipped

**Scenario**: Invalid incident number

```bash
curl -X POST http://localhost:8000/api/workflows/start \
  -H "Content-Type: application/json" \
  -d '{"incident_number": "INVALID000001"}'
```

**Expected Results:**
- Agent 1: `FAILED` (incident not found)
- Agent 2: `SKIPPED` (Agent 1 failed)
- Agent 3: `SKIPPED` (Agent 1 failed)
- Agent 4: `SKIPPED` (not implemented)
- Agent 5: `SKIPPED` (not implemented)

**Verify:**
- ✓ Agent 3 not executed
- ✓ Workflow stops after Agent 1 fails
- ✓ Proper cascade of skipped statuses

---

### Test 7: Workflow State Verification

**Scenario**: Check that results are stored in workflow state

```bash
# 1. Start workflow and get workflow_id
response=$(curl -s -X POST http://localhost:8000/api/workflows/start \
  -H "Content-Type: application/json" \
  -d '{"incident_number": "INC000001"}')

workflow_id=$(echo $response | jq -r '.workflow_id')

# 2. Retrieve workflow and verify agent_results
curl -s http://localhost:8000/api/workflows/$workflow_id | jq '.agent_results'
```

**Expected Output:**
```json
{
  "agent_2": {
    "success": true,
    "message": "...",
    "match_count": ...,
    "similar_incidents": [...]
  },
  "agent_3": {
    "success": true,
    "message": "...",
    "similar_incidents_found": true,
    "total_matches_found": ...,
    "top_similar_incidents": [...],
    "next_agent": "agent5"
  }
}
```

**Verify:**
- ✓ Agent 2 results stored
- ✓ Agent 3 results stored
- ✓ Both accessible from workflow state

---

### Test 8: Datafix Information Preservation

**Scenario**: Verify datafix details correctly passed through

```bash
curl -s http://localhost:8000/api/workflows/start \
  -H "Content-Type: application/json" \
  -d '{"incident_number": "INC000001"}' | \
  jq '.agent_results.agent_3.top_similar_incidents[0] | {incident_number, datafix_id, datafix_description, datafix_code}'
```

**Expected Output:**
```json
{
  "incident_number": "INC000001",
  "datafix_id": "DFX000001",
  "datafix_description": "Activate VMware access profile...",
  "datafix_code": "UPDATE USER_ACCESS..."
}
```

**Verify:**
- ✓ Datafix ID present
- ✓ Description not null
- ✓ Code not null
- ✓ All fields preserved

---

## Performance Testing

### Load Test: Multiple Concurrent Requests

```bash
# Use Apache Bench or similar
ab -n 100 -c 10 -X POST \
  -H "Content-Type: application/json" \
  -d '{"incident_number": "INC000001"}' \
  http://localhost:8000/api/workflows/start
```

**Expected:**
- Response time < 500ms
- No errors
- Consistent results

---

## Debugging Tips

### Check Logs
```bash
# Look for Agent 3 execution logs
tail -f /path/to/app.log | grep "Agent 3"
```

### Verify Response Structure
```bash
curl -s http://localhost:8000/api/agents/agent3/process \
  -H "Content-Type: application/json" \
  -d '{"success": true, "match_count": 1, "similar_incidents": [...]}' | \
  jq '.'
```

### Inspect Workflow State
```bash
curl -s http://localhost:8000/api/workflows/$workflow_id | \
  jq '.agent_results | keys'
```

---

## Troubleshooting

### Issue: Agent 3 not executing
**Check:**
- Agent 1 and 2 completed successfully
- Workflow state contains agent_2 results
- No exceptions in logs

### Issue: Wrong routing decision
**Check:**
- Similarity threshold filtering (≥ 0.3)
- Incident count matches expectation
- Logic: has matches → agent5, no matches → agent4

### Issue: Missing datafix information
**Check:**
- Agent 2 returned datafix objects
- Datafix ID extraction working
- Safe nested access (_safe_get_nested)

### Issue: Threshold not filtering correctly
**Check:**
- Threshold is 0.3 (30%)
- Comparison is >= not >
- Score values are between 0 and 1

---

## Test Results Template

```
Test Case: _______________________
Date: _______________________
Tester: _______________________

Setup:
[ ] FastAPI running
[ ] Vector DB configured
[ ] Mock data ingested

Execution:
[ ] Request sent successfully
[ ] Response received
[ ] Status code: _______

Verification:
[ ] Agent statuses correct
[ ] Results structure valid
[ ] Routing decision accurate
[ ] Data integrity maintained

Result: ☐ PASS ☐ FAIL

Notes:
_________________________________
```

---

**Testing Status**: Ready for QA
**Last Updated**: June 9, 2026
