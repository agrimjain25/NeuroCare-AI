// Authentication utilities
import { UserProfile, getSession, setUser as setStorageUser, logout as storageLogout } from './storage';

/**
 * Simple hash function for password (client-side only)
 * WARNING: This is NOT secure for production. For production, use bcrypt on the server.
 */
function hashPassword(password: string): string {
  let hash = 0;
  for (let i = 0; i < password.length; i++) {
    const char = password.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return Math.abs(hash).toString(16);
}

interface StoredUser extends UserProfile {
  passwordHash: string;
}

const USERS_STORAGE_KEY = 'neurocare-users';

/**
 * Get all registered users
 */
function getAllUsers(): StoredUser[] {
  if (typeof window === 'undefined') return [];
  try {
    const stored = localStorage.getItem(USERS_STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

/**
 * Save user to registry
 */
function saveUserToRegistry(user: StoredUser): void {
  if (typeof window === 'undefined') return;
  const users = getAllUsers();
  const index = users.findIndex(u => u.email === user.email);
  if (index >= 0) {
    users[index] = user;
  } else {
    users.push(user);
  }
  localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
}

/**
 * Sign up new user
 */
export function signup(email: string, password: string, firstName: string, lastName: string, age: number): { success: boolean; error?: string } {
  const users = getAllUsers();
  
  if (users.some(u => u.email === email)) {
    return { success: false, error: 'Email already registered' };
  }

  if (!email || !password || !firstName || !lastName || age < 18) {
    return { success: false, error: 'Invalid input' };
  }

  const user: StoredUser = {
    id: Math.random().toString(36).substring(7),
    email,
    name: `${firstName} ${lastName}`,
    age,
    passwordHash: hashPassword(password),
    createdAt: new Date().toISOString(),
  };

  saveUserToRegistry(user);
  
  // Set current user session
  const { passwordHash, ...userProfile } = user;
  setStorageUser(userProfile);
  
  return { success: true };
}

/**
 * Log in user
 */
export function login(email: string, password: string): { success: boolean; error?: string; user?: UserProfile } {
  const users = getAllUsers();
  const user = users.find(u => u.email === email);

  if (!user) {
    return { success: false, error: 'User not found' };
  }

  const passwordHash = hashPassword(password);
  if (user.passwordHash !== passwordHash) {
    return { success: false, error: 'Invalid password' };
  }

  const { passwordHash: _, ...userProfile } = user;
  setStorageUser(userProfile);
  
  return { success: true, user: userProfile };
}

/**
 * Log out current user
 */
export function logout(): void {
  storageLogout();
}

/**
 * Get current user
 */
export function getCurrentUser(): UserProfile | null {
  const session = getSession();
  return session.user || null;
}

/**
 * Check if user is authenticated
 */
export function isAuthenticated(): boolean {
  return getCurrentUser() !== null;
}
