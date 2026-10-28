import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it, vi } from 'vitest';
import DonateFood from '../../app/donor/(tabs)/donate';

const { state } = vi.hoisted(() => ({ state: { mode: 'live' as 'live' | 'demo' } }));
vi.mock('expo-router', () => ({ router: { push: vi.fn() } }));
vi.mock('../../api/foodRequests', () => ({ createFoodRequest: vi.fn() }));
vi.mock('react-native', () => ({
  View: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  Pressable: ({ children }: { children: React.ReactNode }) => <button>{children}</button>,
}));
vi.mock('../../constants/theme', () => ({ C: { ink: '#111', muted: '#666', green: '#080', greenSoft: '#eee', white: '#fff', line: '#ddd' } }));
vi.mock('../../context/AppContext', () => ({ useApp: () => ({
  mode: state.mode,
  donor: { organization: '', address: '', name: '', phone: '' },
  notify: vi.fn(), submitRequest: vi.fn(),
}) }));
vi.mock('../common/UI', () => ({
  Screen: ({ children }: { children: React.ReactNode }) => <main>{children}</main>,
  Header: ({ title }: { title: string }) => <h1>{title}</h1>,
  Card: ({ children }: { children: React.ReactNode }) => <section>{children}</section>,
  T: ({ children }: { children: React.ReactNode }) => <span>{children}</span>,
  Field: ({ label }: { label: string }) => <input aria-label={label} />,
  Icon: () => <span />,
  Button: ({ title, disabled }: { title: string; disabled?: boolean }) => <button disabled={disabled}>{title}</button>,
}));

describe('donor request mode boundary', () => {
  it('renders the backend-required form after live sign-in', () => {
    state.mode = 'live';
    const html = renderToStaticMarkup(<DonateFood />);
    expect(html).toContain('Prepared date');
    expect(html).toContain('Pickup deadline date');
    expect(html).toContain('Handling requirements');
    expect(html).toMatch(/<button>Submit pickup request<\/button>/);
  });

  it('preserves the demo request action', () => {
    state.mode = 'demo';
    const html = renderToStaticMarkup(<DonateFood />);
    expect(html).not.toContain('Prepared date');
    expect(html).toMatch(/<button>Submit pickup request<\/button>/);
  });
});
