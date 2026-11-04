import { getAuthHeaders } from './authToken';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '';

export interface ProfileData {
  id: string;
  userId: string;
  email: string;
  firstName: string;
  lastName: string;
  fullName: string;
  headline: string;
  phone: string;
  location: string;
  website: string;
  linkedin: string;
  github: string;
  createdAt: string;
  updatedAt: string;
}

export type ProfileUpdatePayload = Partial<{
  firstName: string;
  lastName: string;
  first_name: string;
  last_name: string;
  headline: string;
  phone: string;
  location: string;
  website: string;
  linkedin: string;
  github: string;
}>;

/**
 * Fetch current user's profile from database.
 */
export async function getProfile(): Promise<ProfileData> {
  const url = `${API_BASE_URL}/api/profile`;
  const authHeaders = await getAuthHeaders();
  const response = await fetch(url, {
    method: 'GET',
    headers: {
      Accept: 'application/json',
      ...authHeaders,
    },
  });

  if (!response.ok) {
    throw new Error(
      `Failed to load profile (HTTP ${response.status}: ${response.statusText})`
    );
  }

  return response.json();
}

/**
 * Update current user's profile in database.
 */
export async function updateProfile(
  payload: ProfileUpdatePayload
): Promise<ProfileData> {
  const url = `${API_BASE_URL}/api/profile`;
  const authHeaders = await getAuthHeaders();
  const response = await fetch(url, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      ...authHeaders,
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorBody = await response.json().catch(() => null);
    const msg =
      errorBody?.message ||
      `Failed to update profile (HTTP ${response.status})`;
    throw new Error(msg);
  }

  return response.json();
}
