import { insforgeClient } from '../lib/insforge';

// Google OAuth Sign In
export const signInWithGoogle = async () => {
  try {
    const { data, error } = await insforgeClient.auth.signInWithOAuth({
      provider: 'google',
      redirectTo: `${window.location.origin}/`,
    });
    return { data, error };
  } catch (error) {
    return { data: null, error };
  }
};

// Sign out
export const signOut = async () => {
  try {
    const { error } = await insforgeClient.auth.signOut();
    return { data: null, error };
  } catch (error) {
    return { data: null, error };
  }
};

// Get current user
export const getCurrentUser = async () => {
  try {
    const { data, error } = await insforgeClient.auth.getCurrentUser();
    return { data: data?.user || null, error };
  } catch (error) {
    return { data: null, error };
  }
};

// Get user profile
export const getUserProfile = async (userId) => {
  try {
    const { data, error } = await insforgeClient.auth.getProfile(userId);
    return { data, error };
  } catch (error) {
    return { data: null, error };
  }
};

// Update user profile
export const updateUserProfile = async (profileData) => {
  try {
    const { data, error } = await insforgeClient.auth.setProfile(profileData);
    return { data, error };
  } catch (error) {
    return { data: null, error };
  }
};
