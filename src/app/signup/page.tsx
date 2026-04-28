import SignupForm from '@/components/auth/SignupForm';

export default function SignupPage() {
  return (
    <main className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="w-full max-w-md bg-white p-8 rounded-lg shadow">
        <SignupForm />
      </div>
    </main>
  );
}