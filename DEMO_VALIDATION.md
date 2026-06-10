# Demo Validation Checklist

## Pre-Demo Setup - REQUIRED FIRST

⚠️ **IMPORTANT:** Complete setup in [SETUP_VECTOR_DB.md](./SETUP_VECTOR_DB.md) before running demo!

1. **Environment Configuration**
   - OPENAI_API_KEY set in backend/.env
   - QDRANT_URL set in backend/.env
   - QDRANT_API_KEY set in backend/.env
   - Mock data ingested: `python scripts/load_mock_data_to_qdrant.py`

2. **Backend Running**
   - FastAPI server running on `http://localhost:8000`
   - Qdrant vector DB connected and available
   - Mock data loaded into Qdrant (run ingestion script if not done)

3. **Frontend Running**
   - React dev server running on `http://localhost:5173`
   - TypeScript compilation successful (no errors)
   - All dependencies installed

## Scenario 1: Valid Incident with Similar Resolved Incidents
**Expected Flow:** Agent 1 → Agent 2 → Agent 3 → Agent 5 (similar incidents found)

**Steps:**
1. Open workflow page
2. Enter incident number: `INC000001`
3. Click "Start Workflow"

**Validations:**
- ✅ Workflow starts successfully
- ✅ Agent 1 completes with status "✓" in green
- ✅ Agent 2 completes with status "✓" in green
- ✅ Agent 3 completes with status "✓" in green
- ✅ Agent 4 shows as "⊘ Skipped" (grayed out)
- ✅ Agent 5 completes with status "✓" in green
- ✅ Workflow shows "COMPLETED"
- ✅ Agent 5 result displays recommendation with similar incidents
- ✅ Timestamps display properly (e.g., "Started: 14:32:15, Duration: 2 seconds")

## Scenario 2: Valid Incident with No Similar Incidents
**Expected Flow:** Agent 1 → Agent 2 → Agent 3 → Agent 4 (no similar incidents)

**Steps:**
1. Open workflow page
2. Enter incident number: `INC000002` (or another incident with no similar resolved incidents)
3. Click "Start Workflow"

**Validations:**
- ✅ Workflow starts successfully
- ✅ Agent 1 completes with status "✓" in green
- ✅ Agent 2 completes with status "✓" in green (may show 0 similar incidents)
- ✅ Agent 3 completes with status "✓" in green
- ✅ Agent 4 completes with status "✓" in green
- ✅ Agent 5 shows as "⊘ Skipped" (grayed out)
- ✅ Workflow shows "COMPLETED"
- ✅ Agent 4 result displays resolution capture information

## Scenario 3: Invalid Incident Identifier Format
**Expected Result:** Error message appears immediately

**Steps:**
1. Open workflow page
2. Enter invalid incident number: `INVALID123` or `123456` (missing INC prefix)
3. Click "Start Workflow"

**Validations:**
- ✅ Workflow does NOT start
- ✅ Error message appears: "Invalid incident format. Use format: INC######"
- ✅ Error is shown in red alert box
- ✅ No polling occurs (immediate validation)

## Scenario 4: Valid Format but Incident Not Found
**Expected Result:** Workflow starts but fails at Agent 1

**Steps:**
1. Open workflow page
2. Enter valid format but non-existent incident: `INC999999`
3. Click "Start Workflow"

**Validations:**
- ✅ Workflow starts
- ✅ Agent 1 shows error status (red X)
- ✅ Subsequent agents show "⊘ Skipped"
- ✅ Workflow shows "FAILED"
- ✅ Error message displayed: "Incident not found"

## Scenario 5: Polling Resilience (Backend Temporarily Unavailable)
**Test Procedure:**
1. Start a workflow successfully
2. While polling, temporarily stop the backend (Ctrl+C in FastAPI terminal)
3. Observe polling behavior
4. Restart the backend within 10 seconds

**Validations:**
- ✅ Frontend continues polling despite backend unavailability
- ✅ Error counter increments (visible in browser console)
- ✅ Poll interval increases with each retry (exponential backoff)
- ✅ After backend restarts, workflow resumes
- ✅ No unhandled errors or crashes
- ✅ After 3 consecutive errors without recovery, polling stops with error message

## Scenario 6: Workflow Status Display
**Steps:**
1. Start any valid workflow
2. Observe real-time status updates

**Validations:**
- ✅ Agent statuses update from "PENDING" → "RUNNING" → "COMPLETED"/"FAILED"
- ✅ Timestamps display in format: "HH:MM:SS"
- ✅ Durations calculate correctly (e.g., "2 minutes 30 seconds")
- ✅ Agent result panels expand/collapse smoothly
- ✅ Error details expand properly

## Scenario 7: Data Serialization Verification
**Browser Console Check:**
1. Open DevTools (F12)
2. Go to Network tab
3. Start a workflow
4. Monitor API responses

**Validations:**
- ✅ Workflow start response has proper structure
- ✅ All datetime fields are ISO strings (e.g., "2026-05-01T14:32:15")
- ✅ Agent results have snake_case keys (agent_1, agent_2, etc.)
- ✅ Error responses include detail/message fields

## Scenario 8: Error Recovery
**Steps:**
1. Start a workflow
2. Force a network error (DevTools → Network Throttling → Offline)
3. Wait 30 seconds
4. Re-enable network

**Validations:**
- ✅ Polling pauses gracefully without errors
- ✅ After network restoration, polling resumes
- ✅ No missing data when workflow completes
- ✅ Final results display correctly

## Scenario 9: Multiple Workflows
**Steps:**
1. Complete one workflow
2. Start a second workflow immediately
3. Clear and start a third workflow

**Validations:**
- ✅ Each workflow maintains separate state
- ✅ No cross-workflow contamination
- ✅ Each workflow displays correct results
- ✅ Navigation between workflows works correctly

## Performance Validations

- ✅ Initial load time < 3 seconds
- ✅ Workflow start response < 500ms
- ✅ Each polling request < 1 second
- ✅ UI remains responsive during polling (no freezing)
- ✅ No memory leaks (check DevTools Memory tab after 10 workflows)

## Error Scenarios Summary

| Scenario | Status Code | Error Message | Expected Behavior |
|----------|------------|---------------|-------------------|
| Invalid format | 400 | "Invalid incident format" | Prevent start |
| Incident not found | 404 | "Incident not found" | Agent 1 fails |
| Backend unavailable | 500 | "Service temporarily unavailable" | Retry with backoff |
| Database error | 500 | "Database connection failed" | Retry with backoff |
| Network timeout | 0 | "Unable to reach server" | Retry with backoff |

## Demo Readiness Checklist

- [ ] All 5 agents execute in correct order
- [ ] Agent 4/5 mutual exclusivity works
- [ ] Timestamps display correctly
- [ ] Error messages are user-friendly
- [ ] Polling stops on terminal states
- [ ] Resilience handles temporary failures
- [ ] No console errors or warnings
- [ ] Performance is acceptable (< 5 second polls)
- [ ] UI is responsive and intuitive
- [ ] Data displays correctly with no formatting issues
