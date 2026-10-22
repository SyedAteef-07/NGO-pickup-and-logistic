import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it, vi } from 'vitest';
import { LiveTeamMembership } from './LiveTeamMembership';

vi.mock('react-native', () => ({ View: ({ children }: { children: React.ReactNode }) => <div>{children}</div> }));
vi.mock('../../constants/theme', () => ({ C: { ink: '#111', red: '#d00', green: '#080', muted: '#666' } }));
vi.mock('../common/UI', () => ({
  T: ({ children }: { children: React.ReactNode }) => <span>{children}</span>,
  Card: ({ children }: { children: React.ReactNode }) => <section>{children}</section>,
  Button: ({ title }: { title: string }) => <button>{title}</button>,
}));

describe('mobile LIVE team membership card', () => {
  const onRefresh = vi.fn();

  it('shows a live team name and leader indication without membership editing controls', () => {
    const html = renderToStaticMarkup(<LiveTeamMembership teams={[{ id: 'team-1', name: 'Test Rescue Team', isLeader: true }]} loading={false} error={null} onRefresh={onRefresh} />);
    expect(html).toContain('Test Rescue Team');
    expect(html).toContain('Team leader');
    expect(html).toContain('Refresh teams');
    expect(html).not.toMatch(/Edit|Remove|Add member/);
  });

  it('shows a clear empty state for a Volunteer with no teams', () => {
    const html = renderToStaticMarkup(<LiveTeamMembership teams={[]} loading={false} error={null} onRefresh={onRefresh} />);
    expect(html).toContain('You are not currently assigned to a team.');
  });

  it('renders every membership returned by the backend', () => {
    const html = renderToStaticMarkup(<LiveTeamMembership teams={[
      { id: 'team-1', name: 'Test Rescue Team', isLeader: false },
      { id: 'team-2', name: 'Evening Team', isLeader: true },
    ]} loading={false} error={null} onRefresh={onRefresh} />);
    expect(html).toContain('Test Rescue Team');
    expect(html).toContain('Evening Team');
    expect(html.match(/Team leader/g)).toHaveLength(1);
  });
});
