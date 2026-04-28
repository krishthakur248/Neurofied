// Database Schema for Neurofied.ai

/*
USERS (managed by Insforge Auth)
- id (UUID, PK)
- email (String)
- user_metadata (JSONB) - stores custom fields
  - full_name (String)
  - avatar_url (String)
  - date_of_birth (Date)
  - gender (String)
  - location (String)
  - health_concerns (JSONB[])
- created_at (Timestamp)
- updated_at (Timestamp)
*/

export const userMetadataTemplate = {
  full_name: '',
  avatar_url: '',
  date_of_birth: '',
  gender: '',
  location: '',
  health_concerns: [],
  medical_history: '',
};

/*
TESTS (available cognitive tests)
- id (UUID, PK)
- name (String): "Reaction Time", "Memory Test", "Attention Test"
- slug (String): unique identifier
- description (String)
- duration_seconds (Integer): expected duration in seconds
- category (String): "reaction", "memory", "attention"
- instructions (JSONB)
- created_at (Timestamp)
- updated_at (Timestamp)
*/

export const testTemplate = {
  name: '',
  slug: '',
  description: '',
  duration_seconds: 0,
  category: '',
  instructions: {},
};

/*
TEST_RESULTS (user test results)
- id (UUID, PK)
- user_id (UUID, FK -> auth.users)
- test_id (UUID, FK -> tests)
- score (Integer): 0-100
- raw_data (JSONB): detailed test data for model analysis
  - reaction_times (Integer[])
  - memory_errors (Integer)
  - attention_errors (Integer)
  - response_accuracy (Float)
  - completion_time (Integer)
- risk_level (String): "low", "moderate", "high"
- risk_score (Float): 0-100
- ai_insights (JSONB): model output
  - interpretation (String)
  - recommendations (String[])
  - flags (String[])
- duration_seconds (Integer): actual duration taken
- completed_at (Timestamp)
- created_at (Timestamp)
- updated_at (Timestamp)
*/

export const testResultTemplate = {
  user_id: '',
  test_id: '',
  score: 0,
  raw_data: {
    reaction_times: [],
    memory_errors: 0,
    attention_errors: 0,
    response_accuracy: 0,
    completion_time: 0,
  },
  risk_level: 'low',
  risk_score: 0,
  ai_insights: {
    interpretation: '',
    recommendations: [],
    flags: [],
  },
  duration_seconds: 0,
};

/*
USER_PROGRESS (tracks user test history and stats)
- id (UUID, PK)
- user_id (UUID, FK -> auth.users)
- total_tests_completed (Integer)
- average_score (Float)
- latest_risk_level (String)
- improvement_trend (JSONB):
  - week: score trend for past 7 days
  - month: score trend for past 30 days
- last_test_date (Timestamp)
- created_at (Timestamp)
- updated_at (Timestamp)
*/

export const userProgressTemplate = {
  user_id: '',
  total_tests_completed: 0,
  average_score: 0,
  latest_risk_level: 'low',
  improvement_trend: {
    week: [],
    month: [],
  },
  last_test_date: null,
};

/*
LEARNING_RESOURCES (educational content)
- id (UUID, PK)
- title (String)
- description (String)
- content_type (String): "video", "article", "tip"
- content_url (String): link to resource
- category (String): "brain_health", "prevention", "lifestyle", "research"
- duration_minutes (Integer): for videos
- reading_time_minutes (Integer): for articles
- tags (String[])
- created_at (Timestamp)
- updated_at (Timestamp)
*/

export const learningResourceTemplate = {
  title: '',
  description: '',
  content_type: 'article',
  content_url: '',
  category: '',
  duration_minutes: 0,
  reading_time_minutes: 0,
  tags: [],
};

/*
USER_LEARNING_PROGRESS (tracks which resources user has viewed)
- id (UUID, PK)
- user_id (UUID, FK -> auth.users)
- resource_id (UUID, FK -> learning_resources)
- completed (Boolean)
- progress_percentage (Integer)
- watched_at (Timestamp)
- created_at (Timestamp)
- updated_at (Timestamp)
*/

export const userLearningProgressTemplate = {
  user_id: '',
  resource_id: '',
  completed: false,
  progress_percentage: 0,
};

/*
CHATBOT_CONVERSATIONS (stores chatbot interactions)
- id (UUID, PK)
- user_id (UUID, FK -> auth.users)
- title (String)
- messages (JSONB[]): array of message objects
  - role ("user" | "assistant")
  - content (String)
  - timestamp (Timestamp)
- created_at (Timestamp)
- updated_at (Timestamp)
*/

export const chatConversationTemplate = {
  user_id: '',
  title: 'New Conversation',
  messages: [
    {
      role: 'assistant',
      content: 'Hello! I\'m your AI health advisor. How can I help you today?',
      timestamp: new Date().toISOString(),
    },
  ],
};
