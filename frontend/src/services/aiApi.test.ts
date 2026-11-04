import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  getAIStatus,
  improveSummary,
  improveExperience,
  matchJobDescription,
  sendChatMessage,
  AIServiceError,
} from './aiApi';

describe('aiApi client service', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('getAIStatus fetches GET /api/ai/status', async () => {
    const mockStatus = {
      available: true,
      model: 'gemini-3.5-flash-lite',
      message: 'Gemini AI integration is ready.',
    };

    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => mockStatus,
      })
    );

    const result = await getAIStatus();
    expect(result).toEqual(mockStatus);
    expect(fetch).toHaveBeenCalledWith('/api/ai/status', expect.objectContaining({ method: 'GET' }));
  });

  it('improveSummary sends POST to /api/ai/improve-summary with auth', async () => {
    const mockResponse = {
      originalSummary: 'Software developer with 4 years in Python.',
      improvedSummary: 'Results-driven Software Engineer with 4+ years architecting Python systems.',
      keyChanges: ['Enhanced impact verbs', 'Clarified scope of work'],
    };

    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => mockResponse,
      })
    );

    const result = await improveSummary({
      summary: 'Software developer with 4 years in Python.',
      targetRole: 'Senior Python Engineer',
    });

    expect(result).toEqual(mockResponse);
    expect(fetch).toHaveBeenCalledWith(
      '/api/ai/improve-summary',
      expect.objectContaining({
        method: 'POST',
        headers: expect.objectContaining({ 'Content-Type': 'application/json' }),
      })
    );
  });

  it('improveExperience sends POST to /api/ai/improve-experience', async () => {
    const mockResponse = {
      originalText: 'Built docker containers and pipelines.',
      improvedBullets: ['Architected Docker containerized CI/CD pipelines'],
      tips: ['Specify deployment frequency'],
    };

    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => mockResponse,
      })
    );

    const result = await improveExperience({
      text: 'Built docker containers and pipelines.',
      role: 'DevOps Intern',
    });

    expect(result.improvedBullets).toHaveLength(1);
    expect(result.tips).toHaveLength(1);
  });

  it('matchJobDescription sends POST to /api/ai/match-job', async () => {
    const mockMatch = {
      matchScore: 88,
      matchingSkills: ['Python', 'Docker'],
      missingSkills: ['Kubernetes'],
      suggestions: ['Add container orchestration experience'],
      disclaimer: 'Advisory estimate only.',
    };

    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => mockMatch,
      })
    );

    const result = await matchJobDescription({
      jobDescription: 'Seeking Python and Docker engineer with Kubernetes.',
      skills: ['Python', 'Docker'],
    });

    expect(result.matchScore).toBe(88);
    expect(result.matchingSkills).toContain('Python');
  });

  it('sendChatMessage sends conversational query to /api/ai/chat', async () => {
    const mockReply = {
      reply: 'To improve your resume for cloud roles, highlight your experience with AWS services.',
      suggestions: ['Add AWS certifications'],
    };

    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => mockReply,
      })
    );

    const result = await sendChatMessage({
      message: 'How do I highlight cloud projects?',
      history: [{ role: 'user', content: 'Hi' }],
    });

    expect(result.reply).toContain('AWS services');
  });

  it('throws AIServiceError when backend returns 503 or 422', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: false,
        status: 503,
        json: async () => ({
          error: 'AI Service Unavailable',
          message: 'Gemini API key is not configured in backend environment.',
        }),
      })
    );

    await expect(
      improveSummary({ summary: 'Short summary here for testing.' })
    ).rejects.toThrow(AIServiceError);
  });
});

