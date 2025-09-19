import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-base-200 px-4 text-center">
      <h1 className="text-7xl sm:text-9xl font-extrabold text-primary">404</h1>
      <p className="mt-4 text-lg sm:text-xl text-gray-600">
        Oops! The page you're looking for doesn’t exist.
      </p>

      {/* <div className="mt-6 flex flex-col sm:flex-row gap-3">
        <Link to="/" className="btn btn-primary w-full sm:w-auto">
          🏠 Back to Home
        </Link>
        <Link to="/help" className="btn btn-ghost w-full sm:w-auto">
          ❓ Help Center
        </Link>
      </div> */}
    </div>
  );
}
