import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import SignupForm from '@/components/auth/SignupForm';
import LoginForm from '@/components/auth/LoginForm';

const mockPush = vi.fn();
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush }),
}));

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
  mockPush.mockClear();
});

describe('auth flow', () => {
  it('submits the signup form and creates a session', async () => {
    render(<SignupForm />);
    fireEvent.change(screen.getByTestId('auth-signup-email'), {
      target: { value: 'test@test.com' },
    });
    fireEvent.change(screen.getByTestId('auth-signup-password'), {
      target: { value: 'password123' },
    });
    fireEvent.click(screen.getByTestId('auth-signup-submit'));

    await waitFor(() => {
      const session = JSON.parse(localStorageMock.getItem('habit-tracker-session') || 'null');
      expect(session).not.toBeNull();
      expect(session.email).toBe('test@test.com');
    });
  });

  it('shows an error for duplicate signup email', async () => {
    const existingUser = JSON.stringify([{
      id: '1',
      email: 'test@test.com',
      password: 'password123',
      createdAt: new Date().toISOString(),
    }]);
    localStorageMock.setItem('habit-tracker-users', existingUser);

    render(<SignupForm />);
    fireEvent.change(screen.getByTestId('auth-signup-email'), {
      target: { value: 'test@test.com' },
    });
    fireEvent.change(screen.getByTestId('auth-signup-password'), {
      target: { value: 'password123' },
    });
    fireEvent.click(screen.getByTestId('auth-signup-submit'));

    await waitFor(() => {
      expect(screen.getByText('User already exists')).toBeInTheDocument();
    });
  });

  it('submits the login form and stores the active session', async () => {
    const existingUser = JSON.stringify([{
      id: '1',
      email: 'test@test.com',
      password: 'password123',
      createdAt: new Date().toISOString(),
    }]);
    localStorageMock.setItem('habit-tracker-users', existingUser);

    render(<LoginForm />);
    fireEvent.change(screen.getByTestId('auth-login-email'), {
      target: { value: 'test@test.com' },
    });
    fireEvent.change(screen.getByTestId('auth-login-password'), {
      target: { value: 'password123' },
    });
    fireEvent.click(screen.getByTestId('auth-login-submit'));

    await waitFor(() => {
      const session = JSON.parse(localStorageMock.getItem('habit-tracker-session') || 'null');
      expect(session).not.toBeNull();
      expect(session.email).toBe('test@test.com');
    });
  });

  it('shows an error for invalid login credentials', async () => {
    render(<LoginForm />);
    fireEvent.change(screen.getByTestId('auth-login-email'), {
      target: { value: 'wrong@test.com' },
    });
    fireEvent.change(screen.getByTestId('auth-login-password'), {
      target: { value: 'wrongpassword' },
    });
    fireEvent.click(screen.getByTestId('auth-login-submit'));

    await waitFor(() => {
      expect(screen.getByText('Invalid email or password')).toBeInTheDocument();
    });
  });
});