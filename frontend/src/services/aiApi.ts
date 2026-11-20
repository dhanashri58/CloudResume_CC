import { getAuthHeaders } from './authToken';
import { API_BASE_URL } from '../config/api';

const CLIENT_TIMEOUT_MS = 25000;

export interface AIStatusResponse {
  available: boolean;
  model: string;
  message: string;
  clientDurationMs?: number;
  requestId?: string;
}

export interface ImproveSummaryRequest {
  summary: string;
  targetRole?: string;
}

export interface ImproveSummaryResponse {
  originalSummary: string;
  improvedSummary: string;
  keyChanges: string[];
  responseTimeMs?: number;
  clientDurationMs?: number;
  requestId?: string;
}

export interface ImproveExperienceRequest {
  text: string;
  role?: string;
  companyOrProject?: string;
}

export interface ImproveExperienceResponse {
  originalText: string;
  improvedBullets: string[];
  tips: string[];
  responseTimeMs?: number;
  clientDurationMs?: number;
  requestId?: string;
}

export interface JobMatchRequest {
  jobDescription: string;
  resumeSummary?: string;
  skills?: string[];
  experienceText?: string;
}

export interface JobMatchResponse {
  matchScore: number;
  matchingSkills: string[];
  missingSkills: string[];
  suggestions: string[];
  disclaimer: string;
  responseTimeMs?: number;
  clientDurationMs?: number;
  requestId?: string;
}

export interface ChatHistoryMessage {
  role: 'user' | 'assistant' | 'model' | 'system';
  content: string;
}

export interface ChatRequest {
  message: string;
  history?: ChatHistoryMessage[];
  resumeContext?: string | Record<string, unknown>;
}

export interface ChatResponse {
  reply: string;
  suggestions?: string[];
  responseTimeMs?: number;
  clientDurationMs?: number;
  requestId?: string;
}

export class AIServiceError extends Error {
  status: number;
  details?: unknown;

  constructor(message: string, status: number, details?: unknown) {
    super(message);
    this.name = 'AIServiceError';
    this.status = status;
    this.details = details;
  }
}

function generateRequestId(): string {
  return `req-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;
}

async function fetchWithTiming(
  url: string,
  options: RequestInit,
  endpointLabel: string
): Promise<{ response: Response; durationMs: number; requestId: string }> {
  const startTime = performance.now();
  const requestId = generateRequestId();
  let timer: ReturnType<typeof setTimeout> | undefined;
  let signal: AbortSignal | undefined;

  // Use AbortController for client-side timeout in browser runtime
  if (
    import.meta.env.MODE !== 'test' &&
    typeof AbortController !== 'undefined'
  ) {
    try {
      const controller = new AbortController();
      timer = setTimeout(() => controller.abort(), CLIENT_TIMEOUT_MS);
      signal = controller.signal;
    } catch {
      // Fallback for non-standard test runtimes
    }
  }

  try {
    const rawHeaders: Record<string, string> = {
      ...(options.headers as Record<string, string> | undefined),
    };
    if (!rawHeaders['X-Request-ID']) {
      rawHeaders['X-Request-ID'] = requestId;
    }
    const fetchOptions: RequestInit = { ...options, headers: rawHeaders };
    if (signal) {
      fetchOptions.signal = signal;
    }
    const response = await fetch(url, fetchOptions);
    const durationMs = Math.round(performance.now() - startTime);
    console.info(`[AI Client][${requestId}] ${endpointLabel} took ${durationMs}ms`);
    return { response, durationMs, requestId };
  } catch (err: unknown) {
    const durationMs = Math.round(performance.now() - startTime);
    if (err instanceof DOMException && err.name === 'AbortError') {
      console.warn(`[AI Client][${requestId}] ${endpointLabel} timed out after ${durationMs}ms`);
      throw new AIServiceError('AI request timed out. Please try again.', 504);
    }
    throw err;
  } finally {
    if (timer) {
      clearTimeout(timer);
    }
  }
}

async function handleResponse<T extends { clientDurationMs?: number; requestId?: string }>(
  res: Response,
  durationMs: number,
  fallbackRequestId?: string
): Promise<T> {
  if (!res.ok) {
    let errMsg = `Request failed with HTTP ${res.status}`;
    let errDetails: unknown = null;
    try {
      const body = await res.json();
      errMsg = body.message || body.error || errMsg;
      errDetails = body.details || null;
    } catch {
      // keep default message
    }
    throw new AIServiceError(errMsg, res.status, errDetails);
  }
  const data = (await res.json()) as T;
  data.clientDurationMs = durationMs;
  if (!data.requestId && fallbackRequestId) {
    data.requestId = fallbackRequestId;
  }
  return data;
}

/**
 * Check whether Gemini AI service is configured on backend.
 */
export async function getAIStatus(): Promise<AIStatusResponse> {
  const url = `${API_BASE_URL}/api/ai/status`;
  const { response, durationMs, requestId } = await fetchWithTiming(
    url,
    {
      method: 'GET',
      headers: {
        Accept: 'application/json',
      },
    },
    'GET /api/ai/status'
  );
  return handleResponse<AIStatusResponse>(response, durationMs, requestId);
}

/**
 * Request professional resume summary enhancement.
 */
export async function improveSummary(
  payload: ImproveSummaryRequest
): Promise<ImproveSummaryResponse> {
  const url = `${API_BASE_URL}/api/ai/improve-summary`;
  const authHeaders = await getAuthHeaders();
  const { response, durationMs, requestId } = await fetchWithTiming(
    url,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        ...authHeaders,
      },
      body: JSON.stringify(payload),
    },
    'POST /api/ai/improve-summary'
  );
  return handleResponse<ImproveSummaryResponse>(response, durationMs, requestId);
}

/**
 * Request bullet-point and action-verb enhancement for experience or projects.
 */
export async function improveExperience(
  payload: ImproveExperienceRequest
): Promise<ImproveExperienceResponse> {
  const url = `${API_BASE_URL}/api/ai/improve-experience`;
  const authHeaders = await getAuthHeaders();
  const { response, durationMs, requestId } = await fetchWithTiming(
    url,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        ...authHeaders,
      },
      body: JSON.stringify(payload),
    },
    'POST /api/ai/improve-experience'
  );
  return handleResponse<ImproveExperienceResponse>(response, durationMs, requestId);
}

/**
 * Analyze alignment between resume and a job description.
 */
export async function matchJobDescription(
  payload: JobMatchRequest
): Promise<JobMatchResponse> {
  const url = `${API_BASE_URL}/api/ai/match-job`;
  const authHeaders = await getAuthHeaders();
  const { response, durationMs, requestId } = await fetchWithTiming(
    url,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        ...authHeaders,
      },
      body: JSON.stringify(payload),
    },
    'POST /api/ai/match-job'
  );
  return handleResponse<JobMatchResponse>(response, durationMs, requestId);
}

/**
 * Send conversational query to AI Resume Assistant.
 */
export async function sendChatMessage(
  payload: ChatRequest
): Promise<ChatResponse> {
  const url = `${API_BASE_URL}/api/ai/chat`;
  const authHeaders = await getAuthHeaders();
  const { response, durationMs, requestId } = await fetchWithTiming(
    url,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        ...authHeaders,
      },
      body: JSON.stringify(payload),
    },
    'POST /api/ai/chat'
  );
  return handleResponse<ChatResponse>(response, durationMs, requestId);
}
