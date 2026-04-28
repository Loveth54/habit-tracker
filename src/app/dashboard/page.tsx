'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getSession, getHabits, saveHabits, clearSession } from '@/lib/storage';
import { Habit } from '@/types/habit';
import { validateHabitName } from '@/lib/validators';
import { getHabitSlug } from '@/lib/slug';
import { calculateCurrentStreak } from '@/lib/streaks';
import { toggleHabitCompletion } from '@/lib/habits';
import { v4 as uuidv4 } from 'uuid';

export default function DashboardPage() {
  const router = useRouter();
  const [habits, setHabits] = useState<Habit[]>([]);
  const [userId, setUserId] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingHabit, setEditingHabit] = useState<Habit | null>(null);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [nameError, setNameError] = useState('');
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);

  useEffect(() => {
    const session = getSession();
    if (!session) {
      router.push('/login');
      return;
    }
    setUserId(session.userId);
    const allHabits = getHabits();
    setHabits(allHabits.filter((h) => h.userId === session.userId));
  }, [router]);

  const today = new Date().toISOString().split('T')[0];

  const handleSave = () => {
    const validation = validateHabitName(name);
    if (!validation.valid) {
      setNameError(validation.error || '');
      return;
    }

    const allHabits = getHabits();

    if (editingHabit) {
      const updated = allHabits.map((h) =>
        h.id === editingHabit.id
          ? {
              ...h,
              name: validation.value,
              description,
            }
          : h
      );
      saveHabits(updated);
      setHabits(updated.filter((h) => h.userId === userId));
    } else {
      const newHabit: Habit = {
        id: uuidv4(),
        userId,
        name: validation.value,
        description,
        frequency: 'daily',
        createdAt: new Date().toISOString(),
        completions: [],
      };
      const updated = [...allHabits, newHabit];
      saveHabits(updated);
      setHabits(updated.filter((h) => h.userId === userId));
    }

    setName('');
    setDescription('');
    setNameError('');
    setShowForm(false);
    setEditingHabit(null);
  };

  const handleEdit = (habit: Habit) => {
    setEditingHabit(habit);
    setName(habit.name);
    setDescription(habit.description);
    setShowForm(true);
  };

  const handleDelete = (id: string) => {
    const allHabits = getHabits();
    const updated = allHabits.filter((h) => h.id !== id);
    saveHabits(updated);
    setHabits(updated.filter((h) => h.userId === userId));
    setDeleteTarget(null);
  };

  const handleToggle = (habit: Habit) => {
    const updated = toggleHabitCompletion(habit, today);
    const allHabits = getHabits();
    const updatedAll = allHabits.map((h) => (h.id === habit.id ? updated : h));
    saveHabits(updatedAll);
    setHabits(updatedAll.filter((h) => h.userId === userId));
  };

  const handleLogout = () => {
    clearSession();
    router.push('/login');
  };

  return (
    <main className="min-h-screen bg-gray-50 p-4" data-testid="dashboard-page">
      {/* Header */}
      <div className="max-w-2xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">My Habits</h1>
          <button
            data-testid="auth-logout-button"
            onClick={handleLogout}
            className="text-sm bg-gray-200 px-4 py-2 rounded hover:bg-gray-300"
          >
            Logout
          </button>
        </div>

        {/* Create Habit Button */}
        {!showForm && (
          <button
            data-testid="create-habit-button"
            onClick={() => {
              setEditingHabit(null);
              setName('');
              setDescription('');
              setShowForm(true);
            }}
            className="w-full bg-blue-600 text-white py-2 rounded mb-6 hover:bg-blue-700"
          >
            + New Habit
          </button>
        )}

        {/* Habit Form */}
        {showForm && (
          <div data-testid="habit-form" className="bg-white p-4 rounded shadow mb-6">
            <h2 className="text-lg font-semibold mb-4">
              {editingHabit ? 'Edit Habit' : 'Create Habit'}
            </h2>
            <div className="flex flex-col gap-3">
              <div>
                <label htmlFor="habit-name" className="block text-sm font-medium mb-1">
                  Name
                </label>
                <input
                  id="habit-name"
                  data-testid="habit-name-input"
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    setNameError('');
                  }}
                  className="w-full border rounded px-3 py-2"
                  placeholder="e.g. Drink Water"
                />
                {nameError && (
                  <p className="text-red-500 text-sm mt-1">{nameError}</p>
                )}
              </div>
              <div>
                <label htmlFor="habit-description" className="block text-sm font-medium mb-1">
                  Description
                </label>
                <input
                  id="habit-description"
                  data-testid="habit-description-input"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full border rounded px-3 py-2"
                  placeholder="Optional description"
                />
              </div>
              <div>
                <label htmlFor="habit-frequency" className="block text-sm font-medium mb-1">
                  Frequency
                </label>
                <select
                  id="habit-frequency"
                  data-testid="habit-frequency-select"
                  className="w-full border rounded px-3 py-2"
                  defaultValue="daily"
                >
                  <option value="daily">Daily</option>
                </select>
              </div>
              <div className="flex gap-2">
                <button
                  data-testid="habit-save-button"
                  onClick={handleSave}
                  className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                >
                  Save
                </button>
                <button
                  onClick={() => {
                    setShowForm(false);
                    setEditingHabit(null);
                    setNameError('');
                  }}
                  className="bg-gray-200 px-4 py-2 rounded hover:bg-gray-300"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Empty State */}
        {habits.length === 0 && !showForm && (
          <div data-testid="empty-state" className="text-center py-12 text-gray-500">
            <p className="text-lg">No habits yet!</p>
            <p className="text-sm">Click the button above to create your first habit.</p>
          </div>
        )}

        {/* Habit List */}
        <ul className="flex flex-col gap-4">
          {habits.map((habit) => {
            const slug = getHabitSlug(habit.name);
            const streak = calculateCurrentStreak(habit.completions, today);
            const isCompleted = habit.completions.includes(today);

            return (
              <li
                key={habit.id}
                data-testid={`habit-card-${slug}`}
                className={`bg-white p-4 rounded shadow border-l-4 ${
                  isCompleted ? 'border-green-500' : 'border-gray-300'
                }`}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-semibold text-lg">{habit.name}</h3>
                    {habit.description && (
                      <p className="text-gray-500 text-sm">{habit.description}</p>
                    )}
                    <p
                      data-testid={`habit-streak-${slug}`}
                      className="text-sm mt-1 text-orange-500 font-medium"
                    >
                      🔥 {streak} day streak
                    </p>
                  </div>
                  <div className="flex gap-2 flex-wrap justify-end">
                    <button
                      data-testid={`habit-complete-${slug}`}
                      onClick={() => handleToggle(habit)}
                      className={`text-sm px-3 py-1 rounded ${
                        isCompleted
                          ? 'bg-green-100 text-green-700'
                          : 'bg-gray-100 text-gray-700'
                      }`}
                    >
                      {isCompleted ? '✓ Done' : 'Mark Done'}
                    </button>
                    <button
                      data-testid={`habit-edit-${slug}`}
                      onClick={() => handleEdit(habit)}
                      className="text-sm px-3 py-1 rounded bg-blue-100 text-blue-700"
                    >
                      Edit
                    </button>
                    <button
                      data-testid={`habit-delete-${slug}`}
                      onClick={() => setDeleteTarget(habit.id)}
                      className="text-sm px-3 py-1 rounded bg-red-100 text-red-700"
                    >
                      Delete
                    </button>
                  </div>
                </div>

                {/* Delete Confirmation */}
                {deleteTarget === habit.id && (
                  <div className="mt-3 p-3 bg-red-50 rounded border border-red-200">
                    <p className="text-sm text-red-700 mb-2">
                      Are you sure you want to delete this habit?
                    </p>
                    <div className="flex gap-2">
                      <button
                        data-testid="confirm-delete-button"
                        onClick={() => handleDelete(habit.id)}
                        className="bg-red-600 text-white text-sm px-3 py-1 rounded"
                      >
                        Yes, Delete
                      </button>
                      <button
                        onClick={() => setDeleteTarget(null)}
                        className="bg-gray-200 text-sm px-3 py-1 rounded"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      </div>
    </main>
  );
}