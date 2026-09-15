"use client";

export default function CampaignHeaderSkeleton() {
  const stats = [1, 2, 3];

  return (
    <div className="bg-primary border-border relative mb-5 overflow-hidden rounded-2xl border shadow-sm dark:bg-transparent">
      {/* Decorative Background */}
      <div className="pointer-events-none absolute -top-16 -right-16 h-40 w-40 rounded-full bg-white/10 blur-2xl" />

      <div className="pointer-events-none absolute -bottom-20 left-1/3 h-40 w-40 rounded-full bg-white/5 blur-3xl" />

      <div className="relative p-5 md:p-6">
        {/* Campaign Information */}
        <div className="flex items-center justify-between gap-3">
          {/* Campaign Name */}
          <div className="h-7 w-36 animate-pulse rounded-md bg-white/20 md:h-8 md:w-64" />

          {/* Date */}
          <div className="flex items-center gap-2">
            {/* Calendar Icon */}
            <div className="h-[15px] w-[15px] animate-pulse rounded bg-white/20" />

            {/* Date Text */}
            <div className="h-4 w-40 animate-pulse rounded bg-white/20" />
          </div>
        </div>

        {/* Campaign Stats */}
        <div className="mt-6 grid w-full grid-cols-3 gap-2.5 sm:gap-3">
          {stats.map((stat) => (
            <div
              key={stat}
              className="flex min-h-[50px] min-w-0 flex-col justify-between rounded-xl border border-white/10 bg-white/10 px-3 py-3 backdrop-blur-sm sm:min-h-[82px] sm:px-4"
            >
              {/* Label */}
              <div className="h-3 w-20 animate-pulse rounded bg-white/20 sm:h-4 sm:w-24" />

              {/* Number */}
              <div className="mt-2 h-5 w-10 animate-pulse rounded bg-white/20 sm:h-7 sm:w-14" />
            </div>
          ))}
        </div>
      </div>

      {/* Bottom Accent */}
      <div className="absolute right-0 bottom-0 left-0 h-0.5 bg-white/30" />
    </div>
  );
}
