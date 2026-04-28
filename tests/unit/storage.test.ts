import { describe, it, expect, beforeEach } from 'vitest';
import { getUsers, saveUsers, getSession, saveSession, clearSession, getHabits, saveHabits } from '@/lib/storage';

const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => { store[key] = value; },
    removeItem: (key: string) => { delete store[key]; },
    clear: () => { store = {}; },
  };
})();

Object.defineProperty(window, 'localStorage', { value: localStorageMock });

beforeEach(() => {
  localStorageMock.clear();
});

describe('storage', () => {
  it('saves and retrieves users', () => {
    const users = [{ id: '1', email: 'test@test.com', password: '123', createdAt: '2024-01-01' }];
    saveUsers(users);
    expect(getUsers()).toEqual(users);
  });

  it('returns empty array when no users exist', () => {
    expect(getUsers()).toEqual([]);
  });

  it('saves and retrieves session', () => {
    const session = { userId: '1', email: 'test@test.com' };
    saveSession(session);
    expect(getSession()).toEqual(session);
  });

  it('returns null when no session exists', () => {
    expect(getSession()).toBeNull();
  });

  it('clears session', () => {
    saveSession({ userId: '1', email: 'test@test.com' });
    clearSession();
    expect(getSession()).toBeNull();
  });

  it('saves and retrieves habits', () => {
    const habits = [{ id: '1', userId: '1', name: 'Drink Water', description: '', frequency: 'daily' as const, createdAt: '2024-01-01', completions: [] }];
    saveHabits(habits);
    expect(getHabits()).toEqual(habits);
  });

  it('returns empty array when no habits exist', () => {
    expect(getHabits()).toEqual([]);
  });
});