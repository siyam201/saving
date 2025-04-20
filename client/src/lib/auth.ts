interface User {
  id: number;
  name: string;
  email: string;
}

// Key for storing auth data in localStorage/sessionStorage
const AUTH_TOKEN_KEY = "savings_app_token";
const AUTH_USER_KEY = "savings_app_user";

// Store auth token and user info
export function loginUser(token: string, user: User, rememberMe: boolean = false) {
  const storage = rememberMe ? localStorage : sessionStorage;
  storage.setItem(AUTH_TOKEN_KEY, token);
  storage.setItem(AUTH_USER_KEY, JSON.stringify(user));
}

// Remove auth token and user info
export function logoutUser() {
  // Clear from both storages to be safe
  localStorage.removeItem(AUTH_TOKEN_KEY);
  localStorage.removeItem(AUTH_USER_KEY);
  sessionStorage.removeItem(AUTH_TOKEN_KEY);
  sessionStorage.removeItem(AUTH_USER_KEY);
}

// Get current auth token
export function getAuthToken(): string | null {
  return localStorage.getItem(AUTH_TOKEN_KEY) || sessionStorage.getItem(AUTH_TOKEN_KEY);
}

// Get current user info
export function getCurrentUser(): User | null {
  const userJson = localStorage.getItem(AUTH_USER_KEY) || sessionStorage.getItem(AUTH_USER_KEY);
  if (!userJson) return null;
  
  try {
    return JSON.parse(userJson);
  } catch (error) {
    console.error("Error parsing user data:", error);
    return null;
  }
}

// Check if user is authenticated
export function isAuthenticated(): boolean {
  return !!getAuthToken();
}
