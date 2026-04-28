import { insforgeClient, handleResponse } from '../lib/insforge';

// Get all learning resources
export const getLearningResources = async (filters = {}) => {
  try {
    let query = insforgeClient
      .from('learning_resources')
      .select('*');

    if (filters.category) {
      query = query.eq('category', filters.category);
    }

    if (filters.contentType) {
      query = query.eq('content_type', filters.contentType);
    }

    if (filters.tags && filters.tags.length > 0) {
      // Filter by tags (this is a basic implementation)
      query = query.filter('tags', 'cs', `{${filters.tags.join(',')}}`);
    }

    const { data, error } = await query.order('created_at', { ascending: false });

    return handleResponse(data, error);
  } catch (error) {
    return handleResponse(null, error);
  }
};

// Get learning resource by ID
export const getLearningResource = async (resourceId) => {
  try {
    const { data, error } = await insforgeClient
      .from('learning_resources')
      .select('*')
      .eq('id', resourceId)
      .single();

    return handleResponse(data, error);
  } catch (error) {
    return handleResponse(null, error);
  }
};

// Get resources by category
export const getResourcesByCategory = async (category) => {
  try {
    const { data, error } = await insforgeClient
      .from('learning_resources')
      .select('*')
      .eq('category', category)
      .order('created_at', { ascending: false });

    return handleResponse(data, error);
  } catch (error) {
    return handleResponse(null, error);
  }
};

// Get user's learning progress
export const getUserLearningProgress = async (userId) => {
  try {
    const { data, error } = await insforgeClient
      .from('user_learning_progress')
      .select(`
        *,
        learning_resources:resource_id(*)
      `)
      .eq('user_id', userId)
      .order('updated_at', { ascending: false });

    return handleResponse(data, error);
  } catch (error) {
    return handleResponse(null, error);
  }
};

// Mark resource as viewed
export const markResourceViewed = async (userId, resourceId) => {
  try {
    // Check if already exists
    const { data: existing } = await insforgeClient
      .from('user_learning_progress')
      .select('*')
      .eq('user_id', userId)
      .eq('resource_id', resourceId)
      .single();

    if (existing) {
      // Update existing
      const { data, error } = await insforgeClient
        .from('user_learning_progress')
        .update({
          completed: true,
          progress_percentage: 100,
          watched_at: new Date().toISOString(),
        })
        .eq('user_id', userId)
        .eq('resource_id', resourceId)
        .select()
        .single();

      return handleResponse(data, error);
    } else {
      // Create new
      const { data, error } = await insforgeClient
        .from('user_learning_progress')
        .insert([
          {
            user_id: userId,
            resource_id: resourceId,
            completed: true,
            progress_percentage: 100,
            watched_at: new Date().toISOString(),
          },
        ])
        .select()
        .single();

      return handleResponse(data, error);
    }
  } catch (error) {
    return handleResponse(null, error);
  }
};

// Update learning progress
export const updateLearningProgress = async (userId, resourceId, progressPercentage) => {
  try {
    const { data: existing } = await insforgeClient
      .from('user_learning_progress')
      .select('*')
      .eq('user_id', userId)
      .eq('resource_id', resourceId)
      .single();

    if (existing) {
      const { data, error } = await insforgeClient
        .from('user_learning_progress')
        .update({
          progress_percentage: progressPercentage,
          completed: progressPercentage === 100,
        })
        .eq('user_id', userId)
        .eq('resource_id', resourceId)
        .select()
        .single();

      return handleResponse(data, error);
    } else {
      const { data, error } = await insforgeClient
        .from('user_learning_progress')
        .insert([
          {
            user_id: userId,
            resource_id: resourceId,
            progress_percentage: progressPercentage,
            completed: progressPercentage === 100,
          },
        ])
        .select()
        .single();

      return handleResponse(data, error);
    }
  } catch (error) {
    return handleResponse(null, error);
  }
};

// Get recommended resources based on test results
export const getRecommendedResources = async (riskLevel, category = null) => {
  try {
    let query = insforgeClient
      .from('learning_resources')
      .select('*')
      .eq('category', 'prevention');

    if (riskLevel === 'high') {
      query = query.filter('tags', 'cs', '{"prevention","intervention"}');
    } else if (riskLevel === 'moderate') {
      query = query.filter('tags', 'cs', '{"prevention","lifestyle"}');
    }

    const { data, error } = await query.limit(6);

    return handleResponse(data, error);
  } catch (error) {
    return handleResponse(null, error);
  }
};
