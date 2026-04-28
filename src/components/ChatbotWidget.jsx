import { useState, useEffect, useRef } from 'react';
import { insforgeClient } from '../lib/insforge';
import { Send } from 'lucide-react';

export default function ChatbotWidget({ userId }) {
  const [messages, setMessages] = useState([
    { role: 'assistant', content: "Hello! I'm your AI health advisor. I can help answer questions about cognitive health and brain wellness. What would you like to know?" }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [userData, setUserData] = useState(null);
  const endRef = useRef(null);

  // Load user's test data and progress when component mounts
  useEffect(() => {
    const loadUserData = async () => {
      if (!userId) return;

      try {
        console.log('📊 Loading user test data and progress...');

        // Fetch user's test results
        const { data: results, error: resultsError } = await insforgeClient
          .from('test_results')
          .select('*, tests:test_id(name, slug, category)')
          .eq('user_id', userId)
          .order('created_at', { ascending: false })
          .limit(10);

        // Fetch user's progress
        const { data: progress, error: progressError } = await insforgeClient
          .from('user_progress')
          .select('*')
          .eq('user_id', userId)
          .single();

        if (!resultsError && results) {
          console.log('✅ User test data loaded:', results.length, 'results');
          setUserData({
            testResults: results,
            progress: progress || null,
          });
        } else {
          console.log('⚠️ No user data found or error loading data');
          setUserData({
            testResults: [],
            progress: null,
          });
        }
      } catch (err) {
        console.error('❌ Error loading user data:', err);
        setUserData({
          testResults: [],
          progress: null,
        });
      }
    };

    loadUserData();
  }, [userId]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMsg = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
    setLoading(true);

    try {
      console.log('💬 Sending message to AI...');

      const chatMessages = [...messages, { role: 'user', content: userMsg }].map(m => ({
        role: m.role === 'assistant' ? 'assistant' : 'user',
        content: m.content
      }));

      // Build personalized context from user data
      let userContext = '';
      if (userData) {
        userContext = buildUserContext(userData);
      }

      // List of models to try in order of preference
      const modelsToTry = [
        'openai/gpt-4o-mini',     // Try GPT-4o mini first
        'openai/gpt-4-turbo',     // Fallback to GPT-4 turbo
        'openai/gpt-4',           // Fallback to GPT-4
        'openai/gpt-3.5-turbo',   // Fallback to GPT-3.5 turbo
      ];

      let response = null;
      let lastError = null;

      for (const model of modelsToTry) {
        try {
          console.log(`📤 Trying model: ${model}`);

          response = await insforgeClient.ai.chat.completions.create({
            model,
            messages: [
              {
                role: 'system',
                content: `You are Neurofied AI, a personalized health advisor specializing in cognitive health and brain wellness.

${userContext}

INSTRUCTIONS:
- Provide personalized advice based on the user's test results and progress when relevant
- Be friendly, supportive, and encouraging
- Always remind users to consult healthcare professionals for medical concerns
- Keep responses concise (under 150 words)
- Reference their specific scores and risk levels when giving advice
- Offer targeted recommendations based on their weaker areas
- Celebrate their progress and improvements`
              },
              ...chatMessages
            ],
            temperature: 0.7,
            maxTokens: 300,
          });

          console.log(`✅ Success with model ${model}!`);
          break; // Success, exit the loop
        } catch (err) {
          console.log(`⚠️ Model ${model} failed:`, err.message);
          lastError = err;
          continue; // Try next model
        }
      }

      if (!response) {
        throw lastError || new Error('All models failed');
      }

      console.log('✅ AI Response received:', response);

      if (!response || !response.choices || response.choices.length === 0) {
        console.error('❌ Invalid response structure:', response);
        setMessages(prev => [...prev, { role: 'assistant', content: "I'm having trouble processing that. Please try again." }]);
      } else {
        const reply = response.choices[0].message?.content || "I couldn't generate a response.";
        console.log('💬 Assistant reply:', reply);
        setMessages(prev => [...prev, { role: 'assistant', content: reply }]);
      }
    } catch (err) {
      console.error('❌ Chat error:', err);
      console.error('  Error message:', err.message);
      console.error('  Full error:', err);

      // Provide helpful error message to user
      if (err.message.includes('not enabled')) {
        setMessages(prev => [...prev, {
          role: 'assistant',
          content: "⚠️ AI models are not currently enabled on the server. Please contact your administrator to enable AI chat functionality."
        }]);
      } else if (err.message.includes('401') || err.message.includes('authentication')) {
        setMessages(prev => [...prev, {
          role: 'assistant',
          content: "Authentication error. Please ensure you're logged in."
        }]);
      } else {
        setMessages(prev => [...prev, {
          role: 'assistant',
          content: "Connection error. Please try again."
        }]);
      }
    }
    setLoading(false);
  };

  // Helper function to build user context from their test data
  const buildUserContext = (data) => {
    const { testResults, progress } = data;

    if (!testResults || testResults.length === 0) {
      return 'The user has not taken any cognitive tests yet.';
    }

    // Get the most recent test result for each test type
    const latestResults = {};
    testResults.forEach(result => {
      const testName = result.tests?.name || result.test_id;
      if (!latestResults[testName]) {
        latestResults[testName] = result;
      }
    });

    // Build context string
    let context = 'USER COGNITIVE PROFILE:\n';
    context += '---\n';

    // Add progress information
    if (progress) {
      context += `Total Tests Completed: ${progress.total_tests_completed}\n`;
      context += `Average Score: ${progress.average_score}/100\n`;
      context += `Latest Risk Level: ${progress.latest_risk_level}\n`;
      if (progress.last_test_date) {
        context += `Last Test: ${new Date(progress.last_test_date).toLocaleDateString()}\n`;
      }
    }

    context += '\nLATEST TEST SCORES:\n';
    Object.entries(latestResults).forEach(([testName, result]) => {
      context += `- ${testName}: ${result.score}/100 (Risk: ${result.risk_level})\n`;

      // Add specific insights
      if (result.ai_insights?.interpretation) {
        context += `  Insight: ${result.ai_insights.interpretation}\n`;
      }
    });

    context += '\n---\n';
    context += 'Use this user data to provide personalized recommendations and feedback.';

    return context;
  };

  return (
    <div className="flex flex-col h-full bg-surface-container-lowest overflow-hidden">
      {/* Messages Container */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3.5 bg-gradient-to-b from-surface-container-lowest to-surface-container">
        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-fade-in`}>
            <div className={`max-w-[85%] px-4 py-3 rounded-2xl text-sm leading-relaxed transition-all ${
              msg.role === 'user'
                ? 'bg-primary text-on-primary rounded-br-none shadow-md hover:shadow-lg'
                : 'bg-surface-container border border-outline-variant text-on-surface rounded-bl-none shadow-sm hover:shadow-md'
            }`}>
              {msg.content}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="bg-surface-container border border-outline-variant px-4 py-3 rounded-2xl rounded-bl-none shadow-sm">
              <div className="flex gap-2">
                <div className="w-2.5 h-2.5 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                <div className="w-2.5 h-2.5 bg-primary rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                <div className="w-2.5 h-2.5 bg-primary rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
              </div>
            </div>
          </div>
        )}
        <div ref={endRef} />
      </div>

      {/* Input Section */}
      <form onSubmit={handleSend} className="border-t border-outline-variant bg-surface-container-lowest p-4 flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask about brain health..."
          disabled={loading}
          className="flex-1 bg-surface-container border border-outline-variant rounded-xl px-4 py-3 text-on-surface placeholder-on-surface-variant focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-0 transition disabled:opacity-50"
        />
        <button
          type="submit"
          disabled={loading || !input.trim()}
          className="w-11 h-11 bg-primary hover:bg-primary/90 active:bg-primary/80 rounded-xl flex items-center justify-center transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg"
        >
          <Send className="w-5 h-5 text-on-primary" />
        </button>
      </form>
    </div>
  );
}
