import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import TemplatesPage from './templates/TemplatesPage';
import DashboardPage from './dashboard/DashboardPage';
import MyResumesPage from './resumes/MyResumesPage';
import AIAssistantPage from './ai/AIAssistantPage';
import ProfilePage from './profile/ProfilePage';
import { RESUME_TEMPLATES } from '../data/mockData';
import type { ResumeTemplate } from '../types';

// ─── TemplatesPage tests ──────────────────────────────────────────────────────

describe('TemplatesPage', () => {
  const renderPage = () =>
    render(
      <MemoryRouter>
        <TemplatesPage />
      </MemoryRouter>
    );

  it('renders all templates by default', () => {
    renderPage();
    expect(screen.getByText('Resume Templates')).toBeInTheDocument();
    // All templates shown
    RESUME_TEMPLATES.forEach((t: ResumeTemplate) => {
      expect(screen.getByText(t.name)).toBeInTheDocument();
    });
  });

  it('filters templates by category', () => {
    renderPage();
    fireEvent.click(screen.getByText('Modern'));
    const modernTemplates = RESUME_TEMPLATES.filter(
      (t: ResumeTemplate) => t.category === 'modern'
    );
    expect(
      screen.getByText(new RegExp(`${modernTemplates.length} template`, 'i'))
    ).toBeInTheDocument();
  });

  it('filters templates by search query', () => {
    renderPage();
    const searchInput = screen.getByPlaceholderText(/search templates/i);
    fireEvent.change(searchInput, { target: { value: 'executive' } });
    expect(screen.getByText('Executive')).toBeInTheDocument();
  });

  it('shows no results for unmatched search', () => {
    renderPage();
    fireEvent.change(screen.getByPlaceholderText(/search templates/i), {
      target: { value: 'zzzznotexist' },
    });
    expect(screen.getByText(/no templates found/i)).toBeInTheDocument();
  });

  it('selects and deselects a template on click', () => {
    renderPage();
    // Click on the first template card via the "Use template" button area (card)
    const cards = document.querySelectorAll('[class*="cursor-pointer"]');
    fireEvent.click(cards[0]);
    // CTA bar should appear
    expect(screen.getByText(/use this template/i)).toBeInTheDocument();
    // Click again to deselect
    fireEvent.click(cards[0]);
    expect(screen.queryByText(/use this template/i)).not.toBeInTheDocument();
  });
});

// ─── DashboardPage tests ──────────────────────────────────────────────────────

describe('DashboardPage', () => {
  const renderPage = () =>
    render(
      <MemoryRouter>
        <DashboardPage />
      </MemoryRouter>
    );

  it('renders welcome heading', () => {
    renderPage();
    expect(screen.getByText(/good morning/i)).toBeInTheDocument();
  });

  it('renders stat cards', () => {
    renderPage();
    expect(screen.getByText('Total resumes')).toBeInTheDocument();
    expect(screen.getByText('Avg. ATS score')).toBeInTheDocument();
  });

  it('renders recent resumes', () => {
    renderPage();
    expect(screen.getByText('Recent Resumes')).toBeInTheDocument();
  });

  it('renders quick actions', () => {
    renderPage();
    expect(screen.getByText('Browse templates')).toBeInTheDocument();
    expect(screen.getByText('AI Assistant')).toBeInTheDocument();
  });
});

// ─── MyResumesPage tests ────────────────────────────────────────────────────────

describe('MyResumesPage', () => {
  const renderPage = () =>
    render(
      <MemoryRouter>
        <MyResumesPage />
      </MemoryRouter>
    );

  it('renders My Resumes heading and search toolbar', () => {
    renderPage();
    expect(screen.getByRole('heading', { name: /my resumes/i })).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/search resumes by title, role/i)).toBeInTheDocument();
  });

  it('renders status filter tabs and sort options', () => {
    renderPage();
    expect(screen.getByText(/all \(/i)).toBeInTheDocument();
    expect(screen.getByText(/active \(/i)).toBeInTheDocument();
    expect(screen.getByText(/draft \(/i)).toBeInTheDocument();
  });
});

// ─── AIAssistantPage tests ─────────────────────────────────────────────────────

describe('AIAssistantPage', () => {
  beforeEach(() => {
    vi.useRealTimers();
  });

  const renderPage = () =>
    render(
      <MemoryRouter>
        <AIAssistantPage />
      </MemoryRouter>
    );

  it('renders AI assistant header', () => {
    renderPage();
    expect(screen.getByText('AI Resume Assistant')).toBeInTheDocument();
  });

  it('renders the not-connected disclaimer', () => {
    renderPage();
    expect(screen.getByText(/ai not yet connected/i)).toBeInTheDocument();
  });

  it('shows initial greeting message', () => {
    renderPage();
    expect(
      screen.getByText(/What would you like to work on\?/i)
    ).toBeInTheDocument();
  });

  it('sends a user message and shows typing indicator', async () => {
    renderPage();
    const textarea = screen.getByPlaceholderText(/ask anything/i);
    fireEvent.change(textarea, {
      target: { value: 'Improve my summary' },
    });
    fireEvent.keyDown(textarea, { key: 'Enter', shiftKey: false });

    await waitFor(() => {
      expect(screen.getByText('Improve my summary')).toBeInTheDocument();
    });
  });
});

// ─── ProfilePage tests ────────────────────────────────────────────────────────

describe('ProfilePage', () => {
  const renderPage = () =>
    render(
      <MemoryRouter>
        <ProfilePage />
      </MemoryRouter>
    );

  it('renders profile headings and form fields', async () => {
    renderPage();
    expect(screen.getByText('Profile & Settings')).toBeInTheDocument();
    expect(screen.getByText('Profile Information')).toBeInTheDocument();
    await waitFor(() => {
      expect(screen.getByText('Save changes')).toBeInTheDocument();
    });
  });

  it('renders notification options and appearance selectors', () => {
    renderPage();
    expect(screen.getByText('Notifications')).toBeInTheDocument();
    expect(screen.getByText('Resume views')).toBeInTheDocument();
    expect(screen.getByText('Appearance')).toBeInTheDocument();
  });
});


