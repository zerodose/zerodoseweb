export default function ZerodosePageSkeleton() {
  return (
    <div className="min-h-full animate-pulse">
      {/* Header */}

      <div className="mb-6">
        <div className="bg-surface h-8 w-40 rounded-lg" />

        <div className="bg-surface mt-2 h-4 w-72 rounded" />
      </div>

      {/* Tabs */}

      <div className="bg-surface mb-6 grid grid-cols-2 gap-1 rounded-xl p-1">
        <div className="bg-background h-10 rounded-lg" />
        <div className="h-10 rounded-lg" />
      </div>

      {/* Campaign */}

      <div className="bg-surface mb-5 h-28 rounded-2xl" />

      {/* Summary */}

      <div className="mb-5 grid grid-cols-3 gap-3">
        <div className="bg-surface h-20 rounded-xl" />
        <div className="bg-surface h-20 rounded-xl" />
        <div className="bg-surface h-20 rounded-xl" />
      </div>

      {/* Teams */}

      <div className="space-y-3">
        {[1, 2, 3, 4].map((item) => (
          <div
            key={item}
            className="bg-surface h-20 rounded-2xl"
          />
        ))}
      </div>
    </div>
  );
}