# Error: "An unexpected error occurred. Please try again."

## Quick Diagnosis

This error appears when the backend cannot process the workflow, usually due to one of these causes:

## Root Cause #1: Vector Database Not Set Up ⚠️ MOST COMMON

**Symptoms:**
- Error appears when you click "Start Workflow"
- Happens immediately or after a few seconds
- Happens with any incident number

**Solution:**
Follow the complete setup in [SETUP_VECTOR_DB.md](./SETUP_VECTOR_DB.md):

1. Create `backend/.env` with:
   - OPENAI_API_KEY
   - QDRANT_URL
   - QDRANT_API_KEY

2. Run the ingestion script:
   ```powershell
   cd backend
   & .\.venv\Scripts\Activate.ps1
   python scripts/load_mock_data_to_qdrant.py
   ```

3. Restart backend:
   ```powershell
   python -m uvicorn app.main:app --reload
   ```

## Root Cause #2: Backend Error Details

Check the **backend console** for the actual error:

```powershell
# Look for error messages like:
# - "Failed to connect to Qdrant"
# - "OPENAI_API_KEY not found"
# - "Collection does not exist"
# - "ConnectionError: Failed to establish connection"
```

**What to do:**
- Copy the error message
- Check [SETUP_VECTOR_DB.md](./SETUP_VECTOR_DB.md) troubleshooting section
- Verify environment variables are correctly set

## Root Cause #3: CORS or Backend Connection Issue

**Symptoms:**
- Error says "Network error"
- Backend console shows no activity

**Solution:**
1. Verify backend is running: http://localhost:8000/health
   - Should return: `{"status":"healthy"}`
2. Check if backend is on correct port (8000)
3. Check frontend .env: `VITE_API_BASE_URL=http://localhost:8000`

## Root Cause #4: Incident Not in Mock Data

**Symptoms:**
- Specific incident numbers fail (like INC000099)
- Other incidents work fine

**Solution:**
- Use one of the existing mock incidents:
  - INC000001 through INC000008
  - Currently available in mock data

## Debugging Steps

1. **Open Browser Developer Tools** (F12)
2. Go to **Network** tab
3. Try the workflow again
4. Look for failed API calls (red X)
5. Click on the request and check **Response** tab for actual error
6. Copy that error message and check backend logs

## Getting Help

If the error persists:

1. **Check backend logs** for detailed error message
2. **Verify environment variables** are set correctly
3. **Run ingestion script again** to reload mock data
4. **Restart both backend and frontend**
5. **Check that Qdrant is accessible** (test the URL)

## Success Indicators ✅

When everything is set up correctly:

- ✅ Clicking "Start Workflow" shows loading animation
- ✅ Within 2-5 seconds, the workflow status appears
- ✅ You can see "Agent 1", "Agent 2", etc. updating
- ✅ After 10-15 seconds total, you see "COMPLETED"
- ✅ No "An unexpected error occurred" message

## Next Steps

1. Complete [SETUP_VECTOR_DB.md](./SETUP_VECTOR_DB.md)
2. Run `python scripts/load_mock_data_to_qdrant.py`
3. Restart backend and frontend
4. Try a workflow with INC000001
5. If still failing, check backend console for detailed error
