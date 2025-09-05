export default function Loading() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center space-y-4">
        <div className="animate-spin w-12 h-12 border-3 border-white border-t-transparent rounded-full mx-auto" />
        <div className="space-y-2">
          <h2 className="text-xl font-semibold text-white">Loading LexiGuard</h2>
          <p className="text-white opacity-70">Preparing your legal rights platform...</p>
        </div>
      </div>
    </div>
  );
}
