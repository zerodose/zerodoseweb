"use client";

export default function WorkerList({
  title,
  workers = [],
  selectedWorkers = [],
  onToggle,
  emptyMessage,
  movedWorkers = [],
  disabled = false,
}) {
  return (
    <div className="border-border overflow-hidden rounded-xl border">
      <div className="border-border bg-surface border-b px-4 py-3">
        <p className="text-text text-sm font-semibold">{title}</p>

        <p className="text-text-secondary text-xs">
          {workers.length} worker{workers.length !== 1 ? "s" : ""}
        </p>
      </div>

      <div className="max-h-80 overflow-y-auto">
        {!workers.length ? (
          <div className="text-text-secondary px-4 py-10 text-center text-sm">
            {emptyMessage}
          </div>
        ) : (
          workers.map((worker) => {
            const id = String(worker._id || worker.id);

            const isSelected = selectedWorkers.includes(id);

            const isMoved = movedWorkers.includes(id);

            if (isMoved) {
              return null;
            }

            const workerRole =
              worker.workerRole === "teamLeader"
                ? "Team Leader"
                : "Team Member";

            const teamNumber =
              worker.teamNumber || worker.team?.teamNumber || "-";

            return (
              <label
                key={id}
                className="border-border hover:bg-surface flex cursor-pointer items-center gap-3 border-b px-4 py-3 last:border-b-0"
              >
                <input
                  type="checkbox"
                  checked={isSelected}
                  disabled={disabled}
                  onChange={() => onToggle(id)}
                  className="border-border text-primary focus:ring-primary h-4 w-4 rounded"
                />

                <div className="min-w-0">
                  <p className="text-text text-sm font-medium capitalize">{worker.name}</p>

                  <div className="text-text-secondary mt-0.5 flex flex-wrap gap-x-2 text-xs">
                    <span>{workerRole}</span>

                    <span>•</span>

                    <span>Team {teamNumber}</span>
                  </div>
                </div>
              </label>
            );
          })
        )}
      </div>
    </div>
  );
}
