export default function Loading() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-emerald-50/30 to-teal-50/30 flex items-center justify-center">
      <div className="text-center">
        <div className="relative w-16 h-16 mx-auto mb-4">
          <div className="absolute inset-0 border-4 border-emerald-200 rounded-full" />
          <div className="absolute inset-0 border-4 border-emerald-500 rounded-full border-t-transparent animate-spin" />
        </div>
        <p className="text-slate-600 font-medium">加载中...</p>
      </div>
    </div>
  );
}
