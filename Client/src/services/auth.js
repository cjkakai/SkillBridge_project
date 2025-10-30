const API_BASE_URL = '/api';

export const login = async (email, password, userType) => {
  try {
    const response = await fetch(`${API_BASE_URL}/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({
        email,
        password,
        user_type: userType,
      }),
    });

    const data = await response.json();

    if (response.ok) {
      return data;
    } else {
      throw new Error(data.error || 'Login failed');
    }
  } catch (error) {
    throw error;
  }
};

export const logout = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/logout`, {
      method: 'POST',
      credentials: 'include',
    });

    if (response.ok) {
      return { message: 'Logged out successfully' };
    } else {
      throw new Error('Logout failed');
    }
  } catch (error) {
    throw error;
  }
};

export const getCurrentUser = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/current_user`, {
      credentials: 'include',
    });

    if (response.ok) {
      return await response.json();
    } else {
      throw new Error('Failed to get current user');
    }
  } catch (error) {
    throw error;
  }
};