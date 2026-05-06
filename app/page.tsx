import Link from "next/link";

export default function Home() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-100 px-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 text-center shadow">
        <h1 className="mb-3 text-3xl font-bold text-gray-900">
          Task Management System
        </h1>

        <p className="mb-6 text-gray-600">
          Manage your tasks, priorities, due dates, and progress in one place.
        </p>

        <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Link
            href="/login"
            className="rounded-lg bg-blue-600 px-5 py-2 font-medium text-white hover:bg-blue-700"
          >
            Login
          </Link>

          <Link
            href="/signup"
            className="rounded-lg bg-gray-200 px-5 py-2 font-medium text-gray-900 hover:bg-gray-300"
          >
            Sign Up
          </Link>
        </div>
      </div>
    </main>
  );
}