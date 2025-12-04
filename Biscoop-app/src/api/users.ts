// User API Service - Updated with JWT token handling
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

// Token management
export function getAuthToken(): string | null {
  return localStorage.getItem('authToken');
}

export function saveAuthToken(token: string): void {
  localStorage.setItem('authToken', token);
}

export function clearAuthToken(): void {
  localStorage.removeItem('authToken');
}

// Create headers with JWT token if available
function getAuthHeaders(): HeadersInit {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };
  
  const token = getAuthToken();
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  return headers;
}

// GET user profile by ID
export async function getUserProfile(userId: string): Promise<UserProfile> {
  try {
    const response = await fetch(`${API_BASE_URL}/${userId}`, {
      headers: getAuthHeaders()
    });
    if (!response.ok) {
      throw new Error(`Failed to fetch user: ${response.status}`);
    }
    return response.json();
  } catch (error) {
    console.error("Failed to fetch user:", error);
    throw error;
  }
}

// UPDATE user profile (using PUT endpoint)
export async function updateUserProfile(userId: string, userData: UserDTO): Promise<UserProfile> {
  try {
    const response = await fetch(`${API_BASE_URL}/${userId}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(userData),
    });
    if (!response.ok) {
      throw new Error(`Failed to update user: ${response.status}`);
    }
    return response.json();
  } catch (error) {
    console.error("Failed to update user:", error);
    throw error;
  }
}

// DELETE user account
export async function deleteUserAccount(userId: string): Promise<void> {
  try {
    const response = await fetch(`${API_BASE_URL}/${userId}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    if (!response.ok) {
      throw new Error(`Failed to delete user: ${response.status}`);
    }
  } catch (error) {
    console.error("Failed to delete user:", error);
    throw error;
  }
}

// GET user film history
export async function getUserHistory(userId: string): Promise<FilmHistory[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/${userId}/history`, {
      headers: getAuthHeaders()
    });
    if (!response.ok) {
      throw new Error(`Failed to fetch history: ${response.status}`);
    }
    return response.json();
  } catch (error) {
    console.error("Failed to fetch history:", error);
    throw error;
  }
}

// ADD film to user history
export async function addToUserHistory(userId: string, filmId: string): Promise<void> {
  try {
    const response = await fetch(`${API_BASE_URL}/${userId}/history`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ filmId }),
    });
    if (!response.ok) {
      throw new Error(`Failed to add to history: ${response.status}`);
    }
  } catch (error) {
    console.error("Failed to add to history:", error);
    throw error;
  }
}

// GET user bookings
export async function getUserBookings(userId: string): Promise<UserBooking[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/${userId}/bookings`, {
      headers: getAuthHeaders()
    });
    if (!response.ok) {
      throw new Error(`Failed to fetch bookings: ${response.status}`);
    }
    return response.json();
  } catch (error) {
    console.error("Failed to fetch bookings:", error);
    throw error;
  }
}

// Helper to get current user ID from localStorage
export function getCurrentUserId(): string | null {
  return localStorage.getItem('userId');
}

// Helper to save user ID to localStorage
export function saveCurrentUserId(userId: string): void {
  localStorage.setItem('userId', userId);
}

// Helper to clear user ID from localStorage
export function clearCurrentUserId(): void {
  localStorage.removeItem('userId');
  clearAuthToken();
}

// Auth endpoints using the auth controller with JWT
export async function registerUser(userData: {
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
}): Promise<AuthResponse> {
  const response = await fetch(`${AUTH_BASE_URL}/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(userData),
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Registration failed');
  }
  
  const data: AuthResponse = await response.json();
  
  // Save token if provided
  if (data.token) {
    saveAuthToken(data.token);
    console.log('🔐 JWT token saved');
  }
  
  return data;
}

export async function loginUserAuth(credentials: LoginCredentials): Promise<AuthResponse> {
  const response = await fetch(`${AUTH_BASE_URL}/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(credentials),
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Login failed');
  }
  
  const data: AuthResponse = await response.json();
  
  // Save token if provided
  if (data.token) {
    saveAuthToken(data.token);
    console.log('🔐 JWT token saved');
  }
  
  return data;
}

export async function logoutUser(userId?: string): Promise<void> {
  await fetch(`${AUTH_BASE_URL}/logout`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({ userId }),
  });
  
  // Clear token on logout
  clearAuthToken();
  console.log('🔓 JWT token cleared');
}

// Legacy function - kept for backward compatibility
export async function createOrGetUser(userData: UserDTO): Promise<UserProfile> {
  try {
    // First, try to find user by email
    const response = await fetch(`${API_BASE_URL}?email=${encodeURIComponent(userData.email)}`, {
      headers: getAuthHeaders()
    });
    
    if (response.ok) {
      const user = await response.json();
      console.log('User found in database:', user.id);
      return user;
    }
    
    // User doesn't exist, create new one
    console.log('Creating new user in database...');
    const createResponse = await fetch(`${API_BASE_URL}`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(userData),
    });
    
    if (!createResponse.ok) {
      throw new Error(`Failed to create user: ${createResponse.status}`);
    }
    
    const newUser = await createResponse.json();
    console.log('User created in database:', newUser.id);
    return newUser;
  } catch (error) {
    console.error("Failed to create/get user:", error);
    throw error;
  }
}