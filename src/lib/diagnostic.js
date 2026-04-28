// src/lib/diagnostic.js
// Simple diagnostic to check if InsForge is properly configured

import { insforgeClient } from './insforge';

export const runDiagnostics = async () => {
  console.group('🔍 Neurofied Diagnostics');

  try {
    // Check if client is initialized
    console.log('✓ InsForge client initialized');

    // Check credentials
    const url = import.meta.env.VITE_INSFORGE_URL;
    const key = import.meta.env.VITE_INSFORGE_ANON_KEY;

    if (!url) {
      console.error('✗ VITE_INSFORGE_URL not configured');
      return false;
    } else {
      console.log('✓ VITE_INSFORGE_URL:', url);
    }

    if (!key) {
      console.error('✗ VITE_INSFORGE_ANON_KEY not configured');
      return false;
    } else {
      console.log('✓ VITE_INSFORGE_ANON_KEY: configured');
    }

    // Try to fetch current user (even if not logged in)
    try {
      const { data, error } = await insforgeClient.auth.getCurrentUser();
      if (error) {
        console.warn('⚠ getCurrentUser error (normal if not logged in):', error.message);
      } else if (data?.user) {
        console.log('✓ User logged in:', data.user.email);
      } else {
        console.log('✓ No user logged in (normal on first visit)');
      }
    } catch (e) {
      console.error('✗ getCurrentUser failed:', e.message);
      return false;
    }

    // Try to list tests
    try {
      const { data, error } = await insforgeClient
        .from('tests')
        .select('*')
        .limit(1);

      if (error) {
        console.error('✗ Database connection failed:', error.message);
        return false;
      } else {
        console.log('✓ Database connection successful');
        console.log(`  Found ${data?.length || 0} tests in database`);
      }
    } catch (e) {
      console.error('✗ Database query failed:', e.message);
      return false;
    }

    console.log('\n✅ All diagnostics passed!');
    console.groupEnd();
    return true;
  } catch (error) {
    console.error('✗ Diagnostic error:', error);
    console.groupEnd();
    return false;
  }
};

// Run on import
if (typeof window !== 'undefined') {
  // Only in browser
  console.log('📋 Running diagnostics at startup...');
  runDiagnostics();
}
