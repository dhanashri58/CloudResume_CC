import type { ResumeCard, ResumeData } from '../types';
import { getAuthHeaders } from './authToken';
import { API_BASE_URL } from '../config/api';

export interface ResumeListResponse {
  resumes: ResumeCard[];
  count: number;
}

export interface ResumeDetailResponse extends ResumeData {
  id: string;
  title: string;
  templateId: string;
  status: 'draft' | 'active' | 'archived';
  targetRole?: string;
  targetCompany?: string;
  atsScore?: number;
  views?: number;
  createdAt?: string;
  updatedAt?: string;
}

/**
 * Fetch all resumes belonging to current user from the REST API.
 */
export async function listResumes(): Promise<ResumeCard[]> {
  const url = `${API_BASE_URL}/api/resumes`;
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
      `Failed to load resumes (HTTP ${response.status}: ${response.statusText})`
    );
  }

  const data = await response.json();
  if (Array.isArray(data)) {
    return data;
  }
  return data.resumes || [];
}

/**
 * Fetch detailed resume document by ID.
 */
export async function getResume(id: string): Promise<ResumeDetailResponse> {
  const url = `${API_BASE_URL}/api/resumes/${id}`;
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
      `Failed to load resume with ID '${id}' (HTTP ${response.status})`
    );
  }

  return response.json();
}

/**
 * Create a new resume in the database.
 */
export async function createResume(
  payload: Partial<ResumeDetailResponse>
): Promise<ResumeDetailResponse> {
  const url = `${API_BASE_URL}/api/resumes`;
  const authHeaders = await getAuthHeaders();
  const response = await fetch(url, {
    method: 'POST',
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
      `Failed to create resume (HTTP ${response.status})`;
    throw new Error(msg);
  }

  return response.json();
}

/**
 * Update an existing resume in the database.
 */
export async function updateResume(
  id: string,
  payload: Partial<ResumeDetailResponse>
): Promise<ResumeDetailResponse> {
  const url = `${API_BASE_URL}/api/resumes/${id}`;
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
      `Failed to update resume (HTTP ${response.status})`;
    throw new Error(msg);
  }

  return response.json();
}

/**
 * Delete a resume by ID from the database.
 */
export async function deleteResume(id: string): Promise<void> {
  const url = `${API_BASE_URL}/api/resumes/${id}`;
  const authHeaders = await getAuthHeaders();
  const response = await fetch(url, {
    method: 'DELETE',
    headers: {
      Accept: 'application/json',
      ...authHeaders,
    },
  });

  if (!response.ok) {
    throw new Error(
      `Failed to delete resume with ID '${id}' (HTTP ${response.status})`
    );
  }
}

/**
 * Export resume as a professional PDF.
 * Returns the binary Blob and server-provided filename.
 */
export async function exportResumePdf(
  id: string
): Promise<{ blob: Blob; filename: string }> {
  const url = `${API_BASE_URL}/api/resumes/${id}/export-pdf`;
  const authHeaders = await getAuthHeaders();
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      Accept: 'application/pdf',
      ...authHeaders,
    },
  });

  if (!response.ok) {
    let errorMsg = `Failed to export PDF (HTTP ${response.status})`;
    try {
      const errorBody = await response.json();
      if (errorBody?.message) {
        errorMsg = errorBody.message;
      }
    } catch {
      // ignore json parse error
    }
    throw new Error(errorMsg);
  }

  let filename = 'Resume.pdf';
  const disposition = response.headers.get('Content-Disposition');
  if (disposition) {
    const match = disposition.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/);
    if (match && match[1]) {
      filename = match[1].replace(/['"]/g, '').trim();
    }
  }

  const blob = await response.blob();
  return { blob, filename };
}

/**
 * Trigger client-side browser download from a PDF Blob.
 */
export function triggerPdfDownload(blob: Blob, filename: string): void {
  const blobUrl = window.URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = blobUrl;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  window.URL.revokeObjectURL(blobUrl);
}
