# 🚀 Deployment Guide: AgriHealthTraffic MCP

Follow these steps to deploy your application successfully and resolve the "URL broken" and "Render errors".

## Step 0: Push Changes to GitHub
I have updated your code to use environment variables instead of `localhost`. You must push these changes to your GitHub repository first:
```bash
git add .
git commit -m "Fix: Production deployment readiness"
git push origin your-branch-name
```

---

## Step 1: Deploy Backend (Render)
1. Go to [Render Dashboard](https://dashboard.render.com/).
2. Click **New +** and select **Blueprint**.
3. Connect your GitHub repository.
4. Render will automatically detect the `render.yaml` file I created.
5. In the Render Dashboard, go to your new service → **Environment**.
6. Add the following keys (copy values from your local `.env`):
   - `MONGODB_URI`
   - `JWT_SECRET`
   - `RESEND_API_KEY`
   - `GEMINI_API_KEY`
   - `FRONTEND_URL` (Wait until Step 2 is done, then put your Netlify URL here)
7. **Copy your Backend URL** (e.g., `https://agri-health-traffic-backend.onrender.com`).

---

## Step 2: Deploy Frontend (Netlify)
1. Go to [Netlify Dashboard](https://app.netlify.com/).
2. Click **Add new site** → **Import an existing project**.
3. Connect your GitHub repository.
4. Select the **`frontend`** directory when asked for the "Base Directory".
5. Netlify should automatically pick up settings from `frontend/netlify.toml`:
   - **Build Command**: `npm run build`
   - **Publish Directory**: `dist`
6. **IMPORTANT**: Go to **Site Settings** → **Environment Variables**.
7. Add:
   - `VITE_API_URL`: (Paste your Render Backend URL from Step 1)
8. **Deploy!**

---

## Step 3: Final Connection
Once Netlify is deployed:
1. Copy your Netlify URL (e.g., `https://your-site.netlify.app`).
2. Go back to your **Render Dashboard**.
3. Update the `FRONTEND_URL` environment variable with your Netlify URL.
4. Restart the Render service.

---

## 🛠️ Debugging Tips
- **Health Check**: Visit `https://your-backend.onrender.com/api/health`. If you see "CORTEX-OS MCP Backend is running", the server is alive.
- **CORS Errors**: Ensure `FRONTEND_URL` on Render matches your Netlify URL exactly (no trailing slash).
- **Broken URLs**: If the frontend shows "Failed to fetch", double-check that `VITE_API_URL` on Netlify includes the `https://` but NO trailing slash.
