# ⚡ QUICK FIX - Vercel Build Error

## 🎯 The Problem
Your build is failing because **environment variables are missing** in Vercel.

## ✅ The Solution (3 Steps)

### Step 1: Go to Vercel Dashboard
1. Visit [vercel.com](https://vercel.com)
2. Select your project
3. Go to **Settings** → **Environment Variables**

### Step 2: Add These 3 Required Variables

| Variable Name | Value | Example |
|--------------|-------|---------|
| `MONGODB_URI` | Your MongoDB connection string | `mongodb+srv://user:pass@cluster.mongodb.net/proptoken` |
| `JWT_SECRET` | A random secret (32+ chars) | Generate with: `openssl rand -base64 32` |
| `ALLOWED_ORIGINS` | Your Vercel app URL | `https://yourapp.vercel.app` |

**For each variable:**
- Click **"Add New"**
- Enter name and value
- Select **Production** (and Preview/Development if needed)
- Click **Save**

### Step 3: Redeploy
1. Go to **Deployments** tab
2. Click **⋯** (three dots) on latest deployment
3. Click **Redeploy**

## 🎉 Done!
Your build should now succeed!

---

## 📖 Need More Details?
See `VERCEL_ENV_SETUP.md` for complete instructions.


