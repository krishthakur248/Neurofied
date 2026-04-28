import { createClient } from '@insforge/sdk';

const insforgeUrl = import.meta.env.VITE_INSFORGE_URL;
const insforgeAnonKey = import.meta.env.VITE_INSFORGE_ANON_KEY;

console.log('🔧 InsForge Configuration:');
console.log('  URL:', insforgeUrl);
console.log('  Anon Key:', insforgeAnonKey ? insforgeAnonKey.substring(0, 20) + '...' : 'NOT SET');

if (!insforgeUrl || !insforgeAnonKey) {
  console.error('❌ Missing InsForge configuration. Check your .env.local file');
  console.error('  VITE_INSFORGE_URL:', insforgeUrl || 'NOT SET');
  console.error('  VITE_INSFORGE_ANON_KEY:', insforgeAnonKey || 'NOT SET');
}

let baseClient = null;

try {
  baseClient = createClient({
    baseUrl: insforgeUrl,
    anonKey: insforgeAnonKey,
  });
  console.log('✅ InsForge base client created successfully');
  console.log('  Client.database available:', typeof baseClient?.database === 'object' ? '✓' : '✗');
  console.log('  Client.database.from available:', typeof baseClient?.database?.from === 'function' ? '✓' : '✗');
  console.log('  Client.ai available:', typeof baseClient?.ai === 'object' ? '✓' : '✗');
  console.log('  Client.ai.chat.completions.create available:', typeof baseClient?.ai?.chat?.completions?.create === 'function' ? '✓' : '✗');
} catch (error) {
  console.error('❌ Failed to create InsForge client:', error);
  console.error('  Error details:', error.message);
}

// Create a wrapper client that provides convenient access to InsForge services
// This wraps the `.database.from()` pattern and exposes `.ai` for AI operations
export const insforgeClient = {
  // Database operations wrapper
  from: (table) => {
    if (!baseClient?.database) {
      console.error('❌ Base client or database not initialized');
      return null;
    }
    return baseClient.database.from(table);
  },

  // AI operations - direct pass-through to the base client
  ai: baseClient?.ai || null,

  // Auth operations
  auth: baseClient?.auth || null,

  // Direct access to base client for advanced usage
  _base: baseClient,
};

if (!insforgeClient.from) {
  console.error('❌ insforgeClient.from is not properly initialized');
}

if (!insforgeClient.ai) {
  console.error('❌ insforgeClient.ai is not properly initialized');
}

// Helper function to handle responses
export const handleResponse = (data, error) => {
  if (error) {
    console.error('InsForge Error:', error);
    return { data: null, error };
  }
  return { data, error: null };
};
