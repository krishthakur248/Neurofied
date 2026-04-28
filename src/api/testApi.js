import { insforgeClient } from '../lib/insforge';

// Get all available tests
export const getAvailableTests = async () => {
  try {
    const { data, error } = await insforgeClient
      .from('tests')
      .select('*')
      .order('created_at', { ascending: true });
    return { data, error };
  } catch (error) {
    return { data: null, error };
  }
};

// Get test by slug
export const getTestBySlug = async (slug) => {
  try {
    const { data, error } = await insforgeClient
      .from('tests')
      .select('*')
      .eq('slug', slug)
      .single();
    return { data, error };
  } catch (error) {
    return { data: null, error };
  }
};

// Get user's test results
export const getUserTestResults = async (userId) => {
  try {
    const { data, error } = await insforgeClient
      .from('test_results')
      .select('*, tests:test_id(name, slug, category)')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    return { data, error };
  } catch (error) {
    return { data: null, error };
  }
};

// Submit test result
export const submitTestResult = async (userId, testId, resultData) => {
  try {
    const { data, error } = await insforgeClient
      .from('test_results')
      .insert([{
        user_id: userId,
        test_id: testId,
        ...resultData,
      }])
      .select()
      .single();
    return { data, error };
  } catch (error) {
    return { data: null, error };
  }
};
