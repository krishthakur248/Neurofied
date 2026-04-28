import { insforgeClient, handleResponse } from '../lib/insforge';

// Get chatbot conversations for user
export const getUserConversations = async (userId) => {
  try {
    const { data, error } = await insforgeClient
      .from('chatbot_conversations')
      .select('*')
      .eq('user_id', userId)
      .order('updated_at', { ascending: false });

    return handleResponse(data, error);
  } catch (error) {
    return handleResponse(null, error);
  }
};

// Get specific conversation
export const getConversation = async (conversationId) => {
  try {
    const { data, error } = await insforgeClient
      .from('chatbot_conversations')
      .select('*')
      .eq('id', conversationId)
      .single();

    return handleResponse(data, error);
  } catch (error) {
    return handleResponse(null, error);
  }
};

// Create new conversation
export const createConversation = async (userId, title = 'New Conversation') => {
  try {
    const initialMessage = {
      role: 'assistant',
      content: "Hello! I'm your AI health advisor. I can help answer questions about cognitive health, prevention strategies, and brain wellness. What would you like to know?",
      timestamp: new Date().toISOString(),
    };

    const { data, error } = await insforgeClient
      .from('chatbot_conversations')
      .insert([
        {
          user_id: userId,
          title,
          messages: [initialMessage],
        },
      ])
      .select()
      .single();

    return handleResponse(data, error);
  } catch (error) {
    return handleResponse(null, error);
  }
};

// Send message and get AI response
export const sendChatMessage = async (conversationId, userMessage) => {
  try {
    // Get current conversation
    const { data: conversation, error: fetchError } = await insforgeClient
      .from('chatbot_conversations')
      .select('*')
      .eq('id', conversationId)
      .single();

    if (fetchError) {
      return handleResponse(null, fetchError);
    }

    // Add user message
    const updatedMessages = [
      ...conversation.messages,
      {
        role: 'user',
        content: userMessage,
        timestamp: new Date().toISOString(),
      },
    ];

    // Call InsForge AI to get response
    const aiResponse = await getAIResponse(userMessage, conversation.messages);

    // Add AI response
    updatedMessages.push({
      role: 'assistant',
      content: aiResponse,
      timestamp: new Date().toISOString(),
    });

    // Update conversation
    const { data, error } = await insforgeClient
      .from('chatbot_conversations')
      .update({
        messages: updatedMessages,
        updated_at: new Date().toISOString(),
      })
      .eq('id', conversationId)
      .select()
      .single();

    return handleResponse(data, error);
  } catch (error) {
    return handleResponse(null, error);
  }
};

// Get AI response using InsForge AI
const getAIResponse = async (userMessage, conversationHistory) => {
  try {
    // Format conversation history for the API
    const messages = conversationHistory.map(msg => ({
      role: msg.role,
      content: msg.content,
    }));

    messages.push({
      role: 'user',
      content: userMessage,
    });

    // Call InsForge AI endpoint
    // You'll need to use InsForge's AI SDK or API
    const response = await fetch(`${import.meta.env.VITE_INSFORGE_URL}/ai/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${import.meta.env.VITE_INSFORGE_ANON_KEY}`,
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages,
        temperature: 0.7,
        max_tokens: 500,
        system: `You are Neurofied, an AI health advisor specializing in cognitive health and brain wellness.
                 You provide helpful, evidence-based information about cognitive assessment, brain health prevention,
                 and lifestyle recommendations. You are friendly and supportive. If asked medical questions,
                 remind users to consult healthcare professionals. Keep responses concise and actionable.`,
      }),
    });

    if (!response.ok) {
      console.error('AI API error:', response.statusText);
      return 'I apologize, but I\'m having trouble processing your message. Please try again.';
    }

    const data = await response.json();
    return data.choices?.[0]?.message?.content || 'I couldn\'t generate a response. Please try again.';
  } catch (error) {
    console.error('Error getting AI response:', error);
    return 'I\'m currently unavailable. Please try again later.';
  }
};

// Delete conversation
export const deleteConversation = async (conversationId) => {
  try {
    const { error } = await insforgeClient
      .from('chatbot_conversations')
      .delete()
      .eq('id', conversationId);

    return handleResponse(null, error);
  } catch (error) {
    return handleResponse(null, error);
  }
};

// Update conversation title
export const updateConversationTitle = async (conversationId, title) => {
  try {
    const { data, error } = await insforgeClient
      .from('chatbot_conversations')
      .update({ title })
      .eq('id', conversationId)
      .select()
      .single();

    return handleResponse(data, error);
  } catch (error) {
    return handleResponse(null, error);
  }
};
