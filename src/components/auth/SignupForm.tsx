'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { getUsers, saveUsers, saveSession } from '@/lib/storage';
import { v4 as uuidv4 } from 'uuid';

export default function SignupForm() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const users = getUsers();
    const existing = users.find((u) => u.email === email);

    if (existing) {
      setError('User already exists');
      return;
    }

    const newUser = {
      id: uuidv4(),
      email,
      password,
      createdAt: new Date().toISOString(),
    };

    saveUsers([...users, newUser]);
    saveSession({ userId: newUser.id, email: newUser.email });
    router.push('/dashboard');
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <h1 className="text-2xl font-bold text-center">Sign Up</h1>
      {error && <p className="text-red-500 text-sm">{error}</p>}
      <div className="flex flex-col gap-1">
        <label htmlFor="email">Email</label>
        <input
          id="email"
          type="email"
          data-testid="auth-signup-email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="border rounded px-3 py-2"
          required
        />
      </div>
      <div className="flex flex-col gap-1">
        <label htmlFor="password">Password</label>
        <input
          id="password"
          type="password"
          data-testid="auth-signup-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="border rounded px-3 py-2"
          required
        />
      </div>
      <button
        type="submit"
        data-testid="auth-signup-submit"
        className="bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
      >
        Sign Up
      </button>
      <p className="text-center text-sm">
        Already have an account?{' '}
        <a href="/login" className="text-blue-600 underline">
          Login
        </a>
      </p>
    </form>
  );
}