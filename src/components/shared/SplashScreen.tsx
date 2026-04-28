export default function SplashScreen() {
  return (
    <div
      data-testid="splash-screen"
      className="flex items-center justify-center min-h-screen bg-blue-600"
    >
      <div className="text-center text-white">
        <h1 className="text-4xl font-bold mb-2">Habit Tracker</h1>
        <p className="text-blue-200">Building better habits, one day at a time</p>
      </div>
    </div>
  );
}