export default function CampaignHeaderSkeleton() {
  return (
    <div className="bg-primary mb-5 overflow-hidden rounded-2xl p-5 md:p-6">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
        {/* Campaign Info */}
        <div>
          <div className="mb-2 flex items-center gap-2">
            <span className="bg-gray-light h-2.5 w-2.5 animate-pulse rounded-full" />

            <div className="bg-gray-light h-3 w-28 animate-pulse rounded" />
          </div>

          <div className="bg-gray-light h-6 w-52 animate-pulse rounded md:h-7 md:w-64" />

          <div className="mt-3 flex items-center gap-2">
            <div className="bg-gray-light h-4 w-4 animate-pulse rounded" />

            <div className="bg-gray-light h-3 w-40 animate-pulse rounded" />
          </div>
        </div>

        {/* Stats */}
        <div className="flex gap-3">
          <div className="rounded-xl bg-white/10 px-4 py-3">
            <div className="bg-gray-light h-3 w-12 animate-pulse rounded" />

            <div className="bg-gray-light mt-2 h-5 w-8 animate-pulse rounded" />
          </div>

          <div className="rounded-xl bg-white/10 px-4 py-3">
            <div className="bg-gray-light h-3 w-20 animate-pulse rounded" />

            <div className="bg-gray-light mt-2 h-5 w-8 animate-pulse rounded" />
          </div>
        </div>
      </div>
    </div>
  );
}
