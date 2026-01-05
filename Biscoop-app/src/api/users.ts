// User API Service - Updated with JWT token handling using sessionStorage
const API_BASE_URL = 'http://localhost:5275/api/Users';
const AUTH_BASE_URL = 'http://localhost:5275/api/auth';

export interface UserDTO {
  id?: string;
  email: string;
  password?: string;
  firstName?: string;
  lastName?: string;
}

export interface UserProfile {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface AuthResponse {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  token?: string;
  message: string;
}

export interface UserBooking {
  id: string;
  userId: string;
  showId: string;
  show: {
    id: string;
    filmId: string;
    roomId: string;
    startDate: string;
    endDate: string;
    film: {
      id: string;
      name: string;
      duration: number;
      rating: string;
      genre: string;
    };
    zaal: {
      id: string;
      naam: string;
      rijen: number;
      stoelenPerRij: number;
    };
  };
  seats: Array<{
    id: string;
    reservationId: string;
    stoelnummer: string;
  }>;
}

export interface FilmHistory {
  id: string;
  name: string;
  rating: string;
  genre: string;
  duration: number;
  description: string;
}

// ✅ Changed to sessionStorage
export function getAuthToken(): string | null {
  return sessionStorage.getItem('authToken');
}

export function saveAuthToken(token: string): void {
  sessionStorage.setItem('authToken', token);
  console.log('🔐 Token saved to sessionStorage');
}

export function clearAuthToken(): void {
  sessionStorage.removeItem('authToken');
  console.log('🔓 Token cleared from sessionStorage');
}

function getAuthHeaders(): HeadersInit {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };
  
  const token = getAuthToken();
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
    console.log('✅ Authorization header added to request');
  } else {
    console.warn('⚠️ No auth token found in sessionStorage');
  }
  
  return headers;
}

export async function getUserProfile(userId: string): Promise<UserProfile> {
  try {
    console.log(`🔍 Fetching user profile for: ${userId}`);
    const response = await fetch(`${API_BASE_URL}/${userId}`, {
      headers: getAuthHeaders()
    });
    
    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Unknown error' }));
      console.error(`❌ Failed to fetch user: ${response.status}`, error);
      throw new Error(error.message || `Failed to fetch user: ${response.status}`);
    }
    
    const profile = await response.json();
    console.log('✅ User profile fetched successfully');
    return profile;
  } catch (error) {
    console.error("❌ Failed to fetch user:", error);
    throw error;
  }
}

export async function updateUserProfile(userId: string, userData: UserDTO): Promise<UserProfile> {
  try {
    console.log(`📝 Updating user profile for: ${userId}`);
    const response = await fetch(`${API_BASE_URL}/${userId}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(userData),
    });
    
    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Unknown error' }));
      console.error(`❌ Failed to update user: ${response.status}`, error);
      throw new Error(error.message || `Failed to update user: ${response.status}`);
    }
    
    const profile = await response.json();
    console.log('✅ User profile updated successfully');
    return profile;
  } catch (error) {
    console.error("❌ Failed to update user:", error);
    throw error;
  }
}

export async function deleteUserAccount(userId: string): Promise<void> {
  try {
    console.log(`🗑️ Deleting user account: ${userId}`);
    const response = await fetch(`${API_BASE_URL}/${userId}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    
    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Unknown error' }));
      console.error(`❌ Failed to delete user: ${response.status}`, error);
      throw new Error(error.message || `Failed to delete user: ${response.status}`);
    }
    
    console.log('✅ User account deleted successfully');
  } catch (error) {
    console.error("❌ Failed to delete user:", error);
    throw error;
  }
}

export async function getUserHistory(userId: string): Promise<FilmHistory[]> {
  try {
    console.log(`📜 Fetching user history for: ${userId}`);
    const response = await fetch(`${API_BASE_URL}/${userId}/history`, {
      headers: getAuthHeaders()
    });
    
    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Unknown error' }));
      console.error(`❌ Failed to fetch history: ${response.status}`, error);
      throw new Error(error.message || `Failed to fetch history: ${response.status}`);
    }
    
    const history = await response.json();
    console.log('✅ User history fetched successfully');
    return history;
  } catch (error) {
    console.error("❌ Failed to fetch history:", error);
    throw error;
  }
}

export async function addToUserHistory(userId: string, filmId: string): Promise<void> {
  try {
    console.log(`➕ Adding film ${filmId} to history for user: ${userId}`);
    const response = await fetch(`${API_BASE_URL}/${userId}/history`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ filmId }),
    });
    
    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Unknown error' }));
      console.error(`❌ Failed to add to history: ${response.status}`, error);
      throw new Error(error.message || `Failed to add to history: ${response.status}`);
    }
    
    console.log('✅ Film added to history successfully');
  } catch (error) {
    console.error("❌ Failed to add to history:", error);
    throw error;
  }
}

export async function getUserBookings(userId: string): Promise<UserBooking[]> {
  try {
    console.log(`🎫 Fetching bookings for user: ${userId}`);
    const response = await fetch(`${API_BASE_URL}/${userId}/bookings`, {
      headers: getAuthHeaders()
    });
    
    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Unknown error' }));
      console.error(`❌ Failed to fetch bookings: ${response.status}`, error);
      throw new Error(error.message || `Failed to fetch bookings: ${response.status}`);
    }
    
    const bookings = await response.json();
    console.log('✅ User bookings fetched successfully');
    return bookings;
  } catch (error) {
    console.error("❌ Failed to fetch bookings:", error);
    throw error;
  }
}

// ✅ Changed to sessionStorage
export function getCurrentUserId(): string | null {
  return sessionStorage.getItem('userId');
}

export function saveCurrentUserId(userId: string): void {
  sessionStorage.setItem('userId', userId);
  console.log(`💾 User ID saved to sessionStorage: ${userId}`);
}

export function clearCurrentUserId(): void {
  sessionStorage.removeItem('userId');
  console.log('🧹 User ID cleared from sessionStorage');
}

export async function registerUser(userData: {
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
}): Promise<AuthResponse> {
  console.log('📝 Registering new user...');
  const response = await fetch(`${AUTH_BASE_URL}/users`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(userData),
  });
  
  if (!response.ok) {
    const error = await response.json();
    console.error('❌ Registration failed:', error);
    throw new Error(error.message || 'Registration failed');
  }
  
  const data: AuthResponse = await response.json();
  
  // Save token if provided
  if (data.token) {
    saveAuthToken(data.token);
  }
  
  console.log('✅ User registered successfully');
  return data;
}

export async function loginUserAuth(credentials: LoginCredentials): Promise<AuthResponse> {
  console.log('🔑 Logging in user...');
  const response = await fetch(`${AUTH_BASE_URL}/sessions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(credentials),
  });
  
  if (!response.ok) {
    const error = await response.json();
    console.error('❌ Login failed:', error);
    throw new Error(error.message || 'Login failed');
  }
  
  const data: AuthResponse = await response.json();
  
  // Save token if provided
  if (data.token) {
    saveAuthToken(data.token);
  }
  
  console.log('✅ User logged in successfully');
  return data;
}

export async function logoutUser(userId?: string): Promise<void> {
  console.log('👋 Logging out user...');
  const response = await fetch(`${AUTH_BASE_URL}/sessions`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
    body: JSON.stringify({ userId }),
  });
  
  if (response.status === 204) {
    clearAuthToken();
    return;
  }

  if (!response.ok) {
    try {
      const error = await response.json();
      console.error('❌ Logout failed:', error);
      throw new Error(error.message || 'Logout failed');
    } catch {
      throw new Error('Logout failed');
    }
  }
  
  clearAuthToken();
  console.log('✅ User logged out successfully');
}

export async function createOrGetUser(userData: UserDTO): Promise<UserProfile> {
  try {
    console.log('🔍 Checking if user exists...');
    const response = await fetch(`${API_BASE_URL}?email=${encodeURIComponent(userData.email)}`, {
      headers: getAuthHeaders()
    });
    
    if (response.ok) {
      const user = await response.json();
      console.log('✅ User found in database:', user.id);
      return user;
    }
    
    // User doesn't exist, create new one
    console.log('➕ Creating new user in database...');
    const createResponse = await fetch(`${API_BASE_URL}`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(userData),
    });
    
    if (!createResponse.ok) {
      const error = await createResponse.json().catch(() => ({ message: 'Unknown error' }));
      console.error(`❌ Failed to create user: ${createResponse.status}`, error);
      throw new Error(error.message || `Failed to create user: ${createResponse.status}`);
    }
    
    const newUser = await createResponse.json();
    console.log('✅ User created in database:', newUser.id);
    return newUser;
  } catch (error) {
    console.error("❌ Failed to create/get user:", error);
    throw error;
  }
}