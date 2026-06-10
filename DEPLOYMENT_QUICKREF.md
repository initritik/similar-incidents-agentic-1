# Deployment Configuration Quick Reference

## Quick Setup for Render + Vercel

### Backend (Render)

**1. Create Web Service**
- Go to render.com → Create Web Service
- Connect your GitHub repo
- Build Command: `pip install -r requirements.txt`
- Start Command: (see Procfile in backend directory)

**2. Environment Variables to Set**
```
APP_ENV=production
OPENAI_API_KEY=sk-proj-...
QDRANT_URL=https://...qdrant.io
QDRANT_API_KEY=eyJ...
QDRANT_COLLECTION_NAME=incident_resolution_collection
INGESTION_BATCH_SIZE=10
LOG_LEVEL=INFO
FRONTEND_URL=https://your-vercel-frontend.vercel.app
```

**3. After Deploy**
- Copy the Render URL: `https://incident-resolution-api.onrender.com`
- Use this for VITE_API_BASE_URL on Vercel

---

### Frontend (Vercel)

**1. Create Project**
- Go to vercel.com → Import Project
- Select your GitHub repo
- Framework: Vite
- Build Command: `npm run build`
- Output Directory: `dist`

**2. Environment Variable**
```
VITE_API_BASE_URL=https://incident-resolution-api.onrender.com
```
(Use your actual Render backend URL)

**3. Deploy & Get URL**
- Vercel will provide a URL: `https://your-project-name.vercel.app`

---

## Files Created/Updated for Deployment

### Backend
- ✅ `requirements.txt` - Pinned versions for all dependencies
- ✅ `Procfile` - Render web service configuration
- ✅ `runtime.txt` - Python 3.11.7 specification
- ✅ `render.yaml` - Optional: Complete Render config (can upload instead of manual setup)
- ✅ `.env.example` - Environment variables template
- ✅ `app/main.py` - Updated CORS for production

### Frontend
- ✅ `vercel.json` - Vercel build configuration with SPA routing
- ✅ `.gitignore` - Prevent sensitive files from git
- ✅ `package.json` - Already has pinned versions

---

## Deployment URLs

| Component | URL | Type |
|-----------|-----|------|
| Backend | https://incident-resolution-api.onrender.com | Render |
| Frontend | https://your-project-name.vercel.app | Vercel |
| Health Check | https://incident-resolution-api.onrender.com/health | GET |
| API Docs | https://incident-resolution-api.onrender.com/docs | FastAPI Swagger |

---

## Before Deploying

- [ ] Push all code to GitHub
- [ ] Have OpenAI API key ready
- [ ] Have Qdrant Cloud credentials ready
- [ ] Know your Vercel frontend URL (or deploy frontend first)
- [ ] Review .env.example for all required variables

---

## After Deploying

1. Test health endpoint: `curl https://incident-resolution-api.onrender.com/health`
2. Open frontend in browser
3. Enter incident: `INC000005`
4. Verify workflow completes all 5 agents
5. Check Render logs for any errors

---

## Configuration Files Explained

### `requirements.txt`
- Pinned versions prevent compatibility issues
- Includes gunicorn for production server
- Includes uvloop for performance

### `Procfile`
- Tells Render how to run your app
- Uses gunicorn + uvicorn for optimal performance
- 4 workers can handle ~100 concurrent requests

### `runtime.txt`
- Specifies exact Python version
- Render uses this to match environment
- Python 3.11.7 is stable and secure

### `vercel.json`
- Configures Vercel build and deployment
- Rewrites handle React Router SPA routing
- Environment variables linked to deployment

### `render.yaml`
- Alternative to manual Render dashboard setup
- Can be imported directly to auto-configure
- Optional - useful for Infrastructure as Code

---

## Troubleshooting Deployment

### Backend won't start
- Check `requirements.txt` - run `pip install -r requirements.txt` locally
- Check Procfile syntax
- Check environment variables are set

### Frontend can't connect to backend
- Verify VITE_API_BASE_URL is correct
- Check CORS configuration (Frontend URL must be in Render env vars)
- Check browser console for CORS errors

### Qdrant errors
- Verify QDRANT_URL is correct (copy from qdrant.cloud)
- Verify QDRANT_API_KEY is correct
- Verify collection exists in Qdrant Cloud

### OpenAI errors
- Verify OPENAI_API_KEY is correct
- Check OpenAI account has API credits
- Verify key has access to text-embedding-3-small model

---

## Production Best Practices

1. **Environment Variables**: Never commit .env file
2. **Logging**: Keep LOG_LEVEL=INFO in production
3. **CORS**: Update FRONTEND_URL to match actual Vercel URL
4. **Health Checks**: Render monitors /health endpoint
5. **Backups**: Configure Qdrant backup schedule
6. **Monitoring**: Set up error alerts on both platforms

---

## Scaling Considerations

**If traffic increases:**
- Render: Upgrade instance type or add more workers
- Vercel: Automatically scales, no action needed
- Qdrant: Monitor vector DB performance

**Cost estimation:**
- Render Starter: $7/month
- Vercel Pro: $20/month (if needed)
- Qdrant Cloud: Pay as you go (~$0.20-1/month for small collections)

---

**Created**: 2026-06-11  
**Status**: Ready for Production Deployment
