export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen py-12 bg-gray-50">
      <div className="w-full max-w-lg px-8 py-12 bg-white rounded-lg shadow-md">
        <h1 className="mb-4 text-3xl font-bold text-center text-gray-900">
          Scheduling Link Not Found
        </h1>
        <p className="text-center text-gray-600">
          This scheduling link does not exist or has been removed.
        </p>
      </div>
    </div>
  );
}
