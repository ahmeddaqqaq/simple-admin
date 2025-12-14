import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-6">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-6 text-center">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">404 - Page Not Found</h2>
        <p className="text-gray-600 mb-6">The page you're looking for doesn't exist.</p>
        <Link
          href="/home"
          className="inline-block bg-primary text-white px-6 py-2 rounded-lg hover:bg-primary/90 transition"
        >
          Go Home
        </Link>
      </div>
    </div>
  );
}
