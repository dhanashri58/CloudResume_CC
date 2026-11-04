import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  listResumes,
  getResume,
  createResume,
  updateResume,
  deleteResume,
  exportResumePdf,
  triggerPdfDownload,
} from './resumesApi';
import { getProfile, updateProfile } from './profileApi';

describe('resumesApi client service', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('listResumes performs GET /api/resumes and returns resume list', async () => {
    const mockList = [
      {
        id: '11111111-1111-1111-1111-111111111111',
        title: 'Cloud Architect Resume',
        templateId: 'modern-clean',
        status: 'published',
        targetRole: 'Cloud Architect',
        atsScore: 92,
        views: 14,
        updatedAt: '2026-10-30T10:00:00Z',
      },
    ];

    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ resumes: mockList, count: 1 }),
      })
    );

    const result = await listResumes();
    expect(result).toEqual(mockList);
    expect(fetch).toHaveBeenCalledWith('/api/resumes', expect.objectContaining({ method: 'GET' }));
  });

  it('getResume performs GET /api/resumes/:id', async () => {
    const mockResume = {
      id: 'abc-123',
      title: 'DevOps Engineer',
      templateId: 'executive',
    };

    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => mockResume,
      })
    );

    const result = await getResume('abc-123');
    expect(result).toEqual(mockResume);
    expect(fetch).toHaveBeenCalledWith('/api/resumes/abc-123', expect.objectContaining({ method: 'GET' }));
  });

  it('createResume performs POST /api/resumes with payload', async () => {
    const payload = {
      title: 'New Resume',
      templateId: 'minimal',
    };

    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ id: 'new-id', ...payload }),
      })
    );

    const result = await createResume(payload);
    expect(result.id).toBe('new-id');
    expect(fetch).toHaveBeenCalledWith(
      '/api/resumes',
      expect.objectContaining({
        method: 'POST',
        headers: expect.objectContaining({ 'Content-Type': 'application/json' }),
      })
    );
  });

  it('updateResume performs PUT /api/resumes/:id', async () => {
    const payload = { title: 'Updated Title' };
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ id: 'res-1', title: 'Updated Title' }),
      })
    );

    const result = await updateResume('res-1', payload);
    expect(result.title).toBe('Updated Title');
    expect(fetch).toHaveBeenCalledWith(
      '/api/resumes/res-1',
      expect.objectContaining({ method: 'PUT' })
    );
  });

  it('deleteResume performs DELETE /api/resumes/:id', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ success: true }),
      })
    );

    await deleteResume('res-1');
    expect(fetch).toHaveBeenCalledWith(
      '/api/resumes/res-1',
      expect.objectContaining({ method: 'DELETE' })
    );
  });

  it('exportResumePdf performs POST /api/resumes/:id/export-pdf and returns blob and filename', async () => {
    const mockBlob = new Blob(['%PDF-1.4 test data'], { type: 'application/pdf' });
    const headers = new Headers();
    headers.set('Content-Disposition', 'attachment; filename="Alex_Morgan_Resume.pdf"');

    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        headers,
        blob: async () => mockBlob,
      })
    );

    const result = await exportResumePdf('res-123');
    expect(result.filename).toBe('Alex_Morgan_Resume.pdf');
    expect(result.blob).toBe(mockBlob);
    expect(fetch).toHaveBeenCalledWith(
      '/api/resumes/res-123/export-pdf',
      expect.objectContaining({
        method: 'POST',
        headers: expect.objectContaining({
          Accept: 'application/pdf',
        }),
      })
    );
  });

  it('exportResumePdf falls back to default filename when Content-Disposition is absent', async () => {
    const mockBlob = new Blob(['%PDF-1.4 test data'], { type: 'application/pdf' });
    const headers = new Headers();

    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        headers,
        blob: async () => mockBlob,
      })
    );

    const result = await exportResumePdf('res-456');
    expect(result.filename).toBe('Resume.pdf');
    expect(result.blob).toBe(mockBlob);
  });

  it('exportResumePdf throws error on failure with server message if available', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: false,
        status: 404,
        json: async () => ({ message: 'Resume not found' }),
      })
    );

    await expect(exportResumePdf('invalid-id')).rejects.toThrow('Resume not found');
  });

  it('triggerPdfDownload creates object URL, triggers download, and cleans up', () => {
    const mockBlob = new Blob(['pdf data'], { type: 'application/pdf' });
    const mockUrl = 'blob:http://localhost:3000/mock-uuid';

    const createObjectURLMock = vi.fn().mockReturnValue(mockUrl);
    const revokeObjectURLMock = vi.fn();
    window.URL.createObjectURL = createObjectURLMock;
    window.URL.revokeObjectURL = revokeObjectURLMock;

    const clickSpy = vi.fn();
    const origCreateElement = document.createElement.bind(document);
    const createElementSpy = vi
      .spyOn(document, 'createElement')
      .mockImplementation((tag: string) => {
        const el = origCreateElement(tag);
        if (tag === 'a') {
          el.click = clickSpy;
        }
        return el;
      });

    const appendChildSpy = vi.spyOn(document.body, 'appendChild');
    const removeChildSpy = vi.spyOn(document.body, 'removeChild');

    triggerPdfDownload(mockBlob, 'My_Resume.pdf');

    expect(createObjectURLMock).toHaveBeenCalledWith(mockBlob);
    expect(createElementSpy).toHaveBeenCalledWith('a');
    expect(clickSpy).toHaveBeenCalled();
    expect(appendChildSpy).toHaveBeenCalled();
    expect(removeChildSpy).toHaveBeenCalled();
    expect(revokeObjectURLMock).toHaveBeenCalledWith(mockUrl);

    createElementSpy.mockRestore();
    appendChildSpy.mockRestore();
    removeChildSpy.mockRestore();
  });
});

describe('profileApi client service', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('getProfile fetches user profile from GET /api/profile', async () => {
    const mockProfile = {
      id: 'prof-1',
      userId: 'user-1',
      email: 'alex@example.com',
      firstName: 'Alex',
      lastName: 'Mercer',
    };

    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => mockProfile,
      })
    );

    const res = await getProfile();
    expect(res).toEqual(mockProfile);
    expect(fetch).toHaveBeenCalledWith('/api/profile', expect.objectContaining({ method: 'GET' }));
  });

  it('updateProfile sends PUT /api/profile and returns updated data', async () => {
    const updatedPayload = { firstName: 'Alexander' };
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ firstName: 'Alexander' }),
      })
    );

    const res = await updateProfile(updatedPayload);
    expect(res.firstName).toBe('Alexander');
    expect(fetch).toHaveBeenCalledWith(
      '/api/profile',
      expect.objectContaining({ method: 'PUT' })
    );
  });
});
