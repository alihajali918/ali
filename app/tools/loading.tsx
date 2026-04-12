export default function ToolsLoading() {
  return (
    <div className="h-screen flex items-center justify-center bg-[#0a0a0a]">
      <div className="flex flex-col items-center gap-4">
        <div className="w-10 h-10 rounded-2xl border-2 border-neon-cyan/30 border-t-neon-cyan animate-spin" />
        <p className="text-sm text-gray-600 font-bold">جارٍ التحميل...</p>
      </div>
    </div>
  );
}
