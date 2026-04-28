# Neurofied.ai - Quick Start Guide

## ⚡ 5-Minute Setup

### Step 1: Install Dependencies (2 min)
```bash
cd c:\Users\Asus\Desktop\HackIndia
npm install
```

### Step 2: Get Your InsForge Credentials (2 min)

1. **Visit your InsForge Dashboard**
   - Project Settings → API Keys
   - Copy:
     - `Base URL` → paste into `.env.local` as `VITE_INSFORGE_URL`
     - `Anon Key` → paste into `.env.local` as `VITE_INSFORGE_ANON_KEY`

### Step 3: Setup Google OAuth (1 min)

1. **Go to Google Cloud Console** (console.cloud.google.com)
2. **Create OAuth 2.0 Web Application**
   - Add Authorized Redirect URIs:
     - `http://localhost:5173/`
     - `https://your-domain.com/` (for production)
   - Copy `Client ID` → paste into `.env.local` as `VITE_GOOGLE_CLIENT_ID`

3. **Enable Google in InsForge Dashboard**
   - Authentication → Providers → Enable Google
   - Add your Google OAuth credentials

### Step 4: Create Database Tables

1. **Open InsForge SQL Editor**
2. **Copy content from `database-setup.sql`**
3. **Paste & run** (creates all tables + RLS policies)

### Step 5: Start Development

```bash
npm run dev
```

🎉 Visit `http://localhost:5173`

---

## 📋 Your `.env.local` Should Look Like:

```
VITE_INSFORGE_URL=https://q58azg2z.us-east.insforge.app
VITE_INSFORGE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
VITE_GOOGLE_CLIENT_ID=123456789-abcdefg.apps.googleusercontent.com
VITE_API_URL=http://localhost:3000
```

---

## 🎯 What's Included

✅ **Authentication**: Google OAuth + Email/Password
✅ **5 Pages**: Home, Test, Results, Learn, Profile
✅ **Database**: 7 tables with Row Level Security (RLS)
✅ **AI Chatbot**: Multi-turn conversations
✅ **Components**: 40+ reusable components
✅ **API Integration**: All InsForge SDK ready

---

## 📝 What You Need to Implement

The following are placeholders waiting for your implementation:

### 1. **Cognitive Test Logic** (High Priority)
   - **File**: `src/pages/TestPage.jsx` (line ~50)
   - **Currently**: Mock data with random scores
   - **To-Do**: Replace `handleCompleteTest()` with actual test UI/logic
   - **Tests to implement**:
     - Reaction Time: Show stimulus, measure click time
     - Memory: Show sequence, user recalls it
     - Attention: Spot differences or patterns

### 2. **AI Model Integration** (High Priority)
   - **File**: `src/api/testApi.js` (line ~85)
   - **Currently**: Mock insights
   - **To-Do**: Point to your AI model endpoint
   - **Expected Response**:
     ```json
     {
       "interpretation": "Your reaction times indicate...",
       "recommendations": ["Get more sleep", "Exercise daily"],
       "flags": []
     }
     ```

### 3. **AI Chatbot Configuration** (Medium Priority)
   - **File**: `src/api/chatbotApi.js` (line ~110)
   - **Currently**: Placeholder for InsForge AI endpoint
   - **To-Do**: Configure system prompt and model name
   - **Note**: Requires InsForge AI features activated

### 4. **Test Data Population** (Low Priority)
   - Seed sample learning resources
   - Add test cases for QA
   - Populate with demo user data

---

## 🚀 Development Workflow

### Adding a Feature?

1. **Create API file** in `src/api/`
2. **Create component** in `src/components/`
3. **Integrate into page** in `src/pages/`
4. **Test locally**: `npm run dev`
5. **Build**: `npm run build`

### Debugging?

- **Check Console** (F12) for errors
- **Review Logs** in InsForge Dashboard
- **Check `.env.local`** for missing credentials
- **Verify RLS Policies** if data not showing

---

## 📱 API Endpoints Needed

Your AI model needs to expose:

```
POST /api/analyze-test
{
  "score": 75,
  "raw_data": {...},
  "test_type": "reaction-time"
}

Response:
{
  "interpretation": "...",
  "recommendations": [...],
  "flags": [...]
}
```

---

## 🔒 Security Checklist

✅ Google OAuth redirect URIs configured
✅ Row Level Security (RLS) enabled on all tables
✅ Auth context protecting all routes
✅ `.env.local` never committed to git
✅ Anon key used for public access (not admin)

---

## 📚 Testing the App

1. **Test Google Sign-In**
   - Click "Continue with Google" on login page
   - Should redirect to Google, then back to app

2. **Test Email Sign-Up**
   - Register with email/password
   - Check for confirmation email

3. **Take a Test**
   - Go to "Test" tab
   - Start a cognitive test
   - Submit (will use mock scoring for now)

4. **View Results**
   - Go to "Results" tab
   - Should see your test score and analysis

5. **Chat with AI**
   - Go to "Profile" tab
   - Click "Chat with AI"
   - Send a message

---

## 🎨 UI/UX Customization

**Colors** (in `tailwind.config.js`):
- Primary: Purple (#7C3AED)
- Modify colors and rebuild

**Fonts** (in `src/index.css`):
- Uses system fonts
- Add custom fonts in index.html

**Layout** (Tailwind):
- Responsive: Mobile-first design
- Adjust breakpoints as needed

---

## 🚢 Deployment

### Build for Production
```bash
npm run build
```

### Deploy to InsForge
```bash
# Use MCP tool to deploy dist/ folder
mcp_insforge_create-deployment({
  sourceDirectory: "./dist"
})
```

### Or Deploy to Vercel
```bash
npm install -g vercel
vercel
```

---

## 📞 Troubleshooting

| Issue | Solution |
|-------|----------|
| Google OAuth fails | Check VITE_GOOGLE_CLIENT_ID, redirect URIs |
| Can't see data | Verify RLS policies, check user_id matches |
| Tests not submitting | Check VITE_INSFORGE_URL, VITE_INSFORGE_ANON_KEY |
| Chatbot not working | Configure AI endpoint, check system prompt |
| Styling broken | Verify Tailwind CSS 3.4 in package.json |

---

## 🎓 Next Learning

- Implement actual test UIs (React hooks, animations)
- Train your AI model on test data
- Add progress charts (Chart.js/Recharts)
- Implement notifications (Toast alerts)
- Add email alerts for high risk scores
- Create admin dashboard

---

## 📖 Useful Resources

- **InsForge Docs**: https://docs.insforge.io
- **React Docs**: https://react.dev
- **Tailwind**: https://tailwindcss.com
- **Vite**: https://vitejs.dev

---

## ✨ Ready to Code?

1. `npm run dev` - Start!
2. Implement test logic
3. Connect your AI model
4. `npm run build` - Deploy!

**Need help?** Check README.md for detailed setup instructions.

Good luck! 🚀
