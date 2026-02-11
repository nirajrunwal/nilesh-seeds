# SUPABASE SETUP GUIDE - STEP BY STEP

## What You Need to Do:

### Step 1: Create a Supabase Account
1. Go to: https://supabase.com
2. Click "Start your project"
3. Sign up with your email/GitHub
4. Create a new project
   - Project name: `nilesh-seeds`
   - Database password: (choose a strong password - save it somewhere!)
   - Region: Choose closest to India (e.g., "Southeast Asia (Singapore)")
5. Wait 2-3 minutes for project to be created

### Step 2: Get Your Supabase Keys
Once your project is ready:

1. In Supabase dashboard, click on "Project Settings" (gear icon on left sidebar)
2. Click "API" section
3. You'll see:
   - **Project URL** (looks like: https://xxxxx.supabase.co)
   - **anon public** key (looks like: eyJhbGci...)
   - **service_role** key (looks like: eyJhbGci...)

### Step 3: Send Me This Information:

**Copy and paste these 3 values to me:**

```
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_ANON_KEY=eyJhbGci...
SUPABASE_SERVICE_KEY=eyJhbGci...
```

**That's it! I'll handle everything else!**

---

## What I'll Do With This:
- Set up the database automatically
- Create all tables (farmers, employees, prescriptions, etc.)
- Configure authentication
- Set up file storage for APK uploads
- Keep chat in localStorage (as you requested)
- Deploy the app

---

## After You Send Me the Keys:
1. I'll configure everything (2-3 minutes)
2. Test the backend connection
3. Deploy to Vercel
4. Give you the live URL

---

## Security Note:
- Never share these keys publicly
- The `service_role` key is SECRET (like a master password)
- I'll configure .env files properly for security

---

**Ready when you are! Just paste the 3 values above.**
