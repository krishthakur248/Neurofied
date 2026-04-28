# Neurofied.ai - Cognitive Assessment Platform

Early cognitive screening for a healthier tomorrow. Neurofied is a web application that helps users assess their cognitive health through interactive tests and provides personalized recommendations.

## Features

✅ **Cognitive Tests**
- Reaction Time Test
- Memory Test
- Attention Test

✅ **User Authentication**
- Google OAuth Sign-in
- Email/Password Sign-up
- User Profile Management

✅ **Results Dashboard**
- Score tracking and history
- AI-powered analysis
- Risk level assessment
- Visual result breakdowns

✅ **Learning Center**
- Educational resources (videos, articles, tips)
- Resource filtering by category
- Progress tracking

✅ **AI Chatbot**
- Conversational AI health advisor
- Multiple conversations support
- Personalized recommendations

## Tech Stack

- **Frontend**: React 18 + Vite
- **Styling**: Tailwind CSS 3.4
- **Backend**: InsForge (Backend-as-a-Service)
- **Database**: PostgreSQL
- **Authentication**: InsForge Auth + Google OAuth
- **AI**: InsForge AI Integration

## Setup Instructions

### 1. Prerequisites

- Node.js 16+
- npm or yarn
- InsForge account and project

### 2. Clone & Install

```bash
cd neurofied-ai
npm install
```

### 3. Environment Configuration

Copy `.env.example` to `.env.local` and add your InsForge credentials:

```bash
cp .env.example .env.local
```

Edit `.env.local`:

```
VITE_INSFORGE_URL=https://your-app.region.insforge.app
VITE_INSFORGE_ANON_KEY=your-anon-key-here
VITE_GOOGLE_CLIENT_ID=your-google-client-id-here
VITE_API_URL=http://localhost:3000  # Your API endpoint for AI model
```

### 4. Get InsForge Credentials

1. Log in to your InsForge dashboard
2. Go to **Project Settings → API Keys**
3. Copy your:
   - **Base URL** → `VITE_INSFORGE_URL`
   - **Anon Key** → `VITE_INSFORGE_ANON_KEY`

### 5. Setup Google OAuth

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable Google OAuth 2.0
4. Create OAuth 2.0 credentials (Web Application)
5. Add authorized redirect URIs:
   - `http://localhost:5173/`
   - `https://your-app-domain.com/` (production)
6. Copy Client ID → `VITE_GOOGLE_CLIENT_ID`

### 6. Database Setup

Create the following tables in your InsForge database:

```sql
-- Tests table
CREATE TABLE tests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  category TEXT,
  duration_seconds INTEGER,
  instructions JSONB,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Test Results table
CREATE TABLE test_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  test_id UUID REFERENCES tests(id),
  score INTEGER,
  raw_data JSONB,
  risk_level TEXT,
  risk_score FLOAT,
  ai_insights JSONB,
  duration_seconds INTEGER,
  completed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- User Progress table
CREATE TABLE user_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) UNIQUE,
  total_tests_completed INTEGER DEFAULT 0,
  average_score FLOAT DEFAULT 0,
  latest_risk_level TEXT DEFAULT 'low',
  improvement_trend JSONB,
  last_test_date TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Learning Resources table
CREATE TABLE learning_resources (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  content_type TEXT,
  content_url TEXT,
  category TEXT,
  duration_minutes INTEGER,
  reading_time_minutes INTEGER,
  tags TEXT[],
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- User Learning Progress table
CREATE TABLE user_learning_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  resource_id UUID REFERENCES learning_resources(id),
  completed BOOLEAN DEFAULT FALSE,
  progress_percentage INTEGER DEFAULT 0,
  watched_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, resource_id)
);

-- Chatbot Conversations table
CREATE TABLE chatbot_conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  title TEXT,
  messages JSONB,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- User Profiles table
CREATE TABLE user_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) UNIQUE,
  full_name TEXT,
  avatar_url TEXT,
  date_of_birth DATE,
  gender TEXT,
  location TEXT,
  health_concerns TEXT[],
  medical_history TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### 7. Enable Google OAuth in InsForge

1. Go to your InsForge dashboard
2. **Authentication → Providers**
3. Enable **Google** provider
4. Add your Google OAuth credentials

### 8. Run Development Server

```bash
npm run dev
```

Visit `http://localhost:5173`

## Project Structure

```
src/
├── pages/              # Page components
│   ├── HomePage.jsx
│   ├── TestPage.jsx
│   ├── ResultsPage.jsx
│   ├── LearnPage.jsx
│   ├── ProfilePage.jsx
│   └── LoginPage.jsx
├── components/         # Reusable components
│   ├── Navigation.jsx
│   ├── TestCard.jsx
│   ├── ResultCard.jsx
│   ├── ChatbotWidget.jsx
│   └── ...
├── api/               # API integration files
│   ├── authApi.js
│   ├── testApi.js
│   ├── chatbotApi.js
│   └── resourcesApi.js
├── lib/              # Utilities
│   ├── insforge.js   # SDK initialization
│   └── dbSchema.js   # Database schema docs
├── App.jsx           # Main app with routing
└── main.jsx          # Entry point
```

## Development Workflow

### 1. Implementing Cognitive Tests

Edit `src/pages/TestPage.jsx`:

```javascript
const handleCompleteTest = async () => {
  // Replace mock data with actual test logic
  const testData = {
    score: yourTestLogic(),  // Implement your test
    raw_data: {...},
  };
  await submitTestResult(user.id, test.id, testData);
};
```

### 2. Adding AI Model Integration

Create an API endpoint for your model:

```javascript
// In src/api/testApi.js
const callAIModel = async (testData) => {
  const response = await fetch(`${import.meta.env.VITE_API_URL}/api/analyze-test`, {
    method: 'POST',
    body: JSON.stringify(testData),
  });
  return await response.json();
};
```

### 3. Customizing AI Chatbot

Edit `src/api/chatbotApi.js`:

```javascript
const getAIResponse = async (userMessage, history) => {
  // Customize system prompt and model
  const response = await fetch(`${import.meta.env.VITE_INSFORGE_URL}/ai/chat`, {
    body: JSON.stringify({
      model: 'gpt-3.5-turbo',
      system: 'Your custom system prompt here...',
      messages: [...],
    }),
  });
};
```

## Deployment

### Build for Production

```bash
npm run build
```

### Deploy to InsForge

Use the `create-deployment` MCP tool:

```javascript
mcp_insforge_create-deployment({
  sourceDirectory: './dist',
  projectSettings: {
    buildCommand: 'npm run build',
    outputDirectory: 'dist',
  }
})
```

## Troubleshooting

### Google OAuth Not Working

1. Check `VITE_GOOGLE_CLIENT_ID` in `.env.local`
2. Verify redirect URIs in Google Cloud Console
3. Ensure CORS is configured properly

### Database Connection Issues

1. Verify `VITE_INSFORGE_URL` and `VITE_INSFORGE_ANON_KEY`
2. Check RLS policies on tables
3. Review InsForge logs

### AI Model Integration

Ensure your API endpoint is running and returns:
```json
{
  "interpretation": "...",
  "recommendations": ["..."],
  "flags": ["..."]
}
```

## Important Notes

⚠️ **Use Tailwind CSS 3.4** - Do NOT upgrade to v4 (lock in package.json)

✅ **Scalable Schema** - Database schema includes extensible JSONB fields for future features

✅ **Mock Data** - Test submissions currently use mock data; replace with actual test logic

✅ **Model Training** - AI model code should be implemented separately

## Next Steps

1. ✅ Install dependencies: `npm install`
2. ✅ Configure `.env.local` with InsForge credentials
3. ✅ Setup Google OAuth
4. ✅ Create database tables
5. ✅ Implement cognitive test logic in `TestPage.jsx`
6. ✅ Connect AI model endpoint
7. ✅ Run development server: `npm run dev`

## Support & Resources

- [InsForge Documentation](https://insforge.io/docs)
- [React Documentation](https://react.dev)
- [Tailwind CSS](https://tailwindcss.com)
- [Vite](https://vitejs.dev)

## License

MIT License

---

**Ready to build? Let's go!** 🚀
