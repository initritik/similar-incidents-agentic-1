# Deployment Guide

This guide covers deploying the Incident Resolution Assistant to **Render** (backend) and **Vercel** (frontend).

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Backend Deployment (Render)](#backend-deployment-render)
3. [Frontend Deployment (Vercel)](#frontend-deployment-vercel)
4. [Environment Configuration](#environment-configuration)
5. [Post-Deployment Steps](#post-deployment-steps)

---

## Prerequisites

Before deploying, ensure you have:

- [ ] Render account (https://render.com)
- [ ] Vercel account (https://vercel.com)
- [ ] GitHub repository with code pushed
- [ ] OpenAI API key (https://platform.openai.com/api-keys)
- [ ] Qdrant Cloud account and API key (https://cloud.qdrant.io)

---

## Backend Deployment (Render)

### Step 1: Create a New Web Service on Render

1. Go to [Render Dashboard](https://dashboard.render.com)
2. Click **New +** → **Web Service**
3. Connect your GitHub repository
4. Configure the service:
   - **Name**: `incident-resolution-api` (or your choice)
   - **Environment**: `Python 3`
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `gunicorn app.main:app --worker-class uvicorn.workers.UvicornWorker --workers 4 --worker-connections 1000 --timeout 120`

### Step 2: Set Environment Variables on Render

In the Render dashboard, go to **Environment** and add:

```
APP_ENV=production
OPENAI_API_KEY=sk-proj-...your-key...
QDRANT_URL=https://...eu-west-2...qdrant.io
QDRANT_API_KEY=eyJ...your-key...
QDRANT_COLLECTION_NAME=incident_resolution_collection
INGESTION_BATCH_SIZE=10
LOG_LEVEL=INFO
FRONTEND_URL=https://your-frontend-on-vercel.vercel.app
```

### Step 3: Deploy

1. Click **Create Web Service**
2. Render will automatically build and deploy your backend
3. You'll get a URL like: `https://incident-resolution-api.onrender.com`
4. **Copy this URL** - you'll need it for frontend configuration

### Step 4: Verify Backend

Test your backend deployment:
```bash
curl https://incident-resolution-api.onrender.com/health
# Response: {"status": "healthy"}
```

---

## Frontend Deployment (Vercel)

### Step 1: Update Frontend Configuration

Before deploying, update the API base URL in your frontend:

**File**: `frontend/src/services/workflowService.ts`

The frontend uses `VITE_API_BASE_URL` environment variable. Make sure the service is configured to use it:

```typescript
const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8000";
```

### Step 2: Create a New Project on Vercel

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click **Add New +** → **Project**
3. Import your GitHub repository
4. Select the `frontend` folder as the root directory
5. Configure build settings:
   - **Framework**: `Vite`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`

### Step 3: Set Environment Variables on Vercel

In Vercel project settings, go to **Settings** → **Environment Variables** and add:

```
VITE_API_BASE_URL=https://incident-resolution-api.onrender.com
```

Replace the URL with your actual Render backend URL from Step 3 above.

### Step 4: Deploy

1. Click **Deploy**
2. Vercel will build and deploy your frontend
3. You'll get a URL like: `https://incident-resolution-assistant.vercel.app`

---

## Environment Configuration

### Backend Environment Variables (.env on Render)

| Variable | Required | Description | Example |
|----------|----------|-------------|---------|
| `APP_ENV` | Yes | Set to `production` | `production` |
| `OPENAI_API_KEY` | Yes | OpenAI API key | `sk-proj-...` |
| `QDRANT_URL` | Yes | Qdrant Cloud endpoint | `https://...eu-west-2...qdrant.io` |
| `QDRANT_API_KEY` | Yes | Qdrant API key | `eyJ...` |
| `QDRANT_COLLECTION_NAME` | No | Qdrant collection | `incident_resolution_collection` |
| `INGESTION_BATCH_SIZE` | No | Batch size for ingestion | `10` |
| `LOG_LEVEL` | No | Logging level | `INFO` |
| `FRONTEND_URL` | No | Frontend URL for CORS | `https://your-frontend.vercel.app` |

### Frontend Environment Variables (Vercel)

| Variable | Required | Description | Example |
|----------|----------|-------------|---------|
| `VITE_API_BASE_URL` | Yes | Backend API URL | `https://incident-resolution-api.onrender.com` |

---

## Post-Deployment Steps

### 1. Update Backend CORS Configuration

After getting your Vercel frontend URL, update the backend environment:

In Render dashboard → Your Web Service → **Environment**:

Update `FRONTEND_URL` to your actual Vercel URL:
```
FRONTEND_URL=https://incident-resolution-assistant.vercel.app
```

Also update the backend URL in the code comment if needed (this is just for reference).

### 2. Load Mock Data (Optional)

If you want to prepopulate the Qdrant collection with demo incidents:

**Option A: Via API (Recommended)**
- Create an endpoint that calls `IngestionRunner.run()` and expose it via your API
- Call it once from your browser after deployment

**Option B: Scheduled Task**
- Use Render's scheduled jobs feature to run the ingestion periodically
- Set up a cron job to run: `python scripts/load_mock_data_to_qdrant.py`

### 3. Test the Deployment

1. Open your Vercel frontend URL
2. Enter an incident number: `INC000005`
3. Click "Start Workflow"
4. Verify all 5 agents complete successfully
5. Check that similar incidents are found

### 4. Monitor Logs

**Backend Logs (Render)**:
- Render Dashboard → Your Web Service → **Logs**
- Watch for errors and check the health endpoint

**Frontend Logs (Vercel)**:
- Vercel Dashboard → Your Project → **Deployments** → **Runtime Logs**

---

## Troubleshooting

### Issue: Frontend can't connect to backend

**Solution**: Check CORS configuration
- Verify `FRONTEND_URL` is set correctly on Render
- Verify `VITE_API_BASE_URL` is set correctly on Vercel
- Check browser console for CORS errors

### Issue: OpenAI API errors

**Solution**: Verify credentials
- Check `OPENAI_API_KEY` is correctly set on Render
- Verify key has access to text-embedding-3-small model
- Check OpenAI account for usage limits

### Issue: Qdrant connection errors

**Solution**: Verify Qdrant connection
- Check `QDRANT_URL` and `QDRANT_API_KEY` are correct
- Verify collection exists in Qdrant Cloud
- Run ingestion script if collection is empty

### Issue: Workflow fails with "An unexpected error occurred"

**Solution**: Check backend logs
- Go to Render dashboard and view logs
- Look for specific error messages in Agent failures
- Common causes: missing data in Qdrant, API key issues, network timeouts

### Issue: Build fails on Render

**Solution**: Check Python version compatibility
- Ensure `runtime.txt` specifies Python 3.11.7
- Check `requirements.txt` for version conflicts
- Verify all dependencies are compatible with Python 3.11

---

## Production Checklist

- [ ] Backend deployed on Render
- [ ] Frontend deployed on Vercel
- [ ] All environment variables configured
- [ ] CORS properly configured with production URLs
- [ ] Health endpoint responds: `{"status": "healthy"}`
- [ ] Test workflow runs end-to-end
- [ ] Mock data ingested into Qdrant (or ingestion endpoint available)
- [ ] Logs being monitored
- [ ] Error alerts configured (optional)
- [ ] Analytics/monitoring set up (optional)

---

## Monitoring & Maintenance

### Render Monitoring
- Enable notifications for build failures
- Set up log filtering for errors
- Monitor uptime

### Vercel Monitoring
- Check build logs for each deployment
- Monitor Core Web Vitals
- Set up Analytics

### Production Updates

To update your deployment:

1. **Update Backend**: Push changes to GitHub, Render auto-deploys
2. **Update Frontend**: Push changes to GitHub, Vercel auto-deploys
3. **Update Dependencies**: 
   - Update `requirements.txt` on backend
   - Update `package.json` on frontend
   - Redeploy both

---

## Scaling & Performance

### Backend (Render)
- Adjust worker count in Procfile if needed
- Monitor CPU/Memory usage
- Consider upgrading instance type if high traffic

### Frontend (Vercel)
- Vercel automatically scales
- Consider upgrading for faster build times
- Monitor request metrics

---

## Support & Questions

For issues:
1. Check Render logs: `https://dashboard.render.com`
2. Check Vercel logs: `https://vercel.com/dashboard`
3. Check OpenAI status: `https://status.openai.com`
4. Check Qdrant Cloud status: `https://qdrant.cloud/console`

---

**Deployment Date**: 2026-06-11  
**Environment**: Production  
**Status**: Ready for deployment
