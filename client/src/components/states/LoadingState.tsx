export function LoadingState() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
      {[...Array(5)].map((_, colIndex) => (
        <div
          key={colIndex}
          className="rounded-2xl bg-zinc-900/40 border border-zinc-800/80 p-3 h-96 animate-pulse space-y-3"
        >
          <div className="h-5 bg-zinc-800 rounded w-24"></div>
          <div className="h-28 bg-zinc-800/60 rounded-xl"></div>
          <div className="h-28 bg-zinc-800/60 rounded-xl"></div>
        </div>
      ))}
    </div>
  );
}
