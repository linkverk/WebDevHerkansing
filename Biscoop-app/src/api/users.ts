// User API Service
const API_BASE_URL = 'http://localhost:5275/api/users';

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

export interface UserBooking {
  id: string;
  userId: string;
  showId: string;
  show: {
    id: string;
    filmId: string;
    roomId: string;
    begintijd: string;
    eindtijd: string;
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

// Helper function for fetch with error handling
async function fetchWithError(url: string, options?: RequestInit): Promise<Response> {
  try {
    const response = await fetch(url, options);
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP ${response.status}: ${errorText}`);
    }
    return response;
  } catch (error) {
    console.error('Fetch error:', error);
    throw error;
  }
}

// GET user profile by ID
export async function getUserProfile(userId: string): Promise<UserProfile> {
  const response = await fetchWithError(`${API_BASE_URL}/${userId}`);
  return response.json();
}

// UPDATE user profile
export async function updateUserProfile(userId: string, userData: UserDTO): Promise<UserProfile> {
  const response = await fetchWithError(`${API_BASE_URL}/${userId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(userData),
  });
  return response.json();
}

// DELETE user account
export async function deleteUserAccount(userId: string): Promise<void> {
  await fetchWithError(`${API_BASE_URL}/${userId}`, {
    method: 'DELETE',
  });
}

// GET user film history
export async function getUserHistory(userId: string): Promise<FilmHistory[]> {
  const response = await fetchWithError(`${API_BASE_URL}/${userId}/history`);
  return response.json();
}

// ADD film to user history
export async function addToUserHistory(userId: string, filmId: string): Promise<void> {
  await fetchWithError(`${API_BASE_URL}/${userId}/history`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ filmId }),
  });
}

// GET user bookings
export async function getUserBookings(userId: string): Promise<UserBooking[]> {
  const response = await fetchWithError(`${API_BASE_URL}/${userId}/bookings`);
  return response.json();
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
}