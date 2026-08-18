// "use client";

// export default function WorkerList({
//   title,
//   workers = [],
//   selectedWorkers = [],
//   onToggle,
//   emptyMessage,
//   movedWorkers = [],
//   disabled = false,
// }) {
//   return (
//     <div className="border-border overflow-hidden rounded-xl border">
//       <div className="border-border bg-surface border-b px-4 py-3">
//         <p className="text-text text-sm font-semibold">{title}</p>

//         <p className="text-text-secondary text-xs">
//           {workers.length} worker{workers.length !== 1 ? "s" : ""}
//         </p>
//       </div>

//       <div className="max-h-80 overflow-y-auto">
//         {!workers.length ? (
//           <div className="text-text-secondary px-4 py-10 text-center text-sm">
//             {emptyMessage}
//           </div>
//         ) : (
//           workers.map((worker) => {
//             const id = String(worker._id || worker.id);

//             const isSelected = selectedWorkers.includes(id);

//             const isMoved = movedWorkers.includes(id);

//             if (isMoved) {
//               return null;
//             }

//             const workerRole =
//               worker.workerRole === "teamLeader"
//                 ? "Team Leader"
//                 : "Team Member";

//             const teamNumber =
//               worker.teamNumber || worker.team?.teamNumber || "-";

//             return (
//               <label
//                 key={id}
//                 className="border-border hover:bg-surface flex cursor-pointer items-center gap-3 border-b px-4 py-3 last:border-b-0"
//               >
//                 <input
//                   type="checkbox"
//                   checked={isSelected}
//                   disabled={disabled}
//                   onChange={() => onToggle(id)}
//                   className="border-border text-primary focus:ring-primary h-4 w-4 rounded"
//                 />

//                 <div className="min-w-0">
//                   <p className="text-text text-sm font-medium capitalize">{worker.name}</p>

//                   <div className="text-text-secondary mt-0.5 flex flex-wrap gap-x-2 text-xs">
//                     <span>{workerRole}</span>

//                     <span>•</span>

//                     <span>Team {teamNumber}</span>
//                   </div>
//                 </div>
//               </label>
//             );
//           })
//         )}
//       </div>
//     </div>
//   );
// }

"use client";

export default function WorkerList({
  title = "Workers",
  workers = [],
  selectedWorkers = [],
  movedWorkers = [],
  onToggle,
  emptyMessage = "No workers found.",
}) {
  const getWorkerId = (worker) => {
    return String(worker?._id || worker?.id || "");
  };

  const getTeamNumber = (worker) => {
    return worker?.teamNumber || worker?.team?.teamNumber || "-";
  };

  const getWorkerRole = (worker) => {
    return worker?.workerRole || "-";
  };

  const getWorkerName = (worker) => {
    return worker?.name || "Worker";
  };

  const renderRoleLabel = (role) => {
    if (role === "teamLeader") return "Team Leader";
    if (role === "teamMember") return "Team Member";

    return "-";
  };

  return (
    <div className="border-border overflow-hidden rounded-xl border">
      <div className="border-border bg-surface border-b px-4 py-3">
        <p className="text-text text-sm font-semibold">{title}</p>

        <p className="text-text-secondary mt-0.5 text-xs">
          {workers.length} worker
          {workers.length !== 1 ? "s" : ""}
        </p>
      </div>

      <div className="max-h-96 overflow-y-auto">
        {!workers.length ? (
          <div className="text-text-secondary px-4 py-10 text-center text-sm">
            {emptyMessage}
          </div>
        ) : (
          [...workers]
            .filter((worker) => {
              const workerId = getWorkerId(worker);
              return !movedWorkers.includes(workerId);
            })
            .sort((a, b) => {
              const teamA = Number(a?.teamNumber || a?.team?.teamNumber || 0);
              const teamB = Number(b?.teamNumber || b?.team?.teamNumber || 0);

              // Team number: 1, 2, 3, 4...
              if (teamA !== teamB) {
                return teamA - teamB;
              }

              // Same team: Team Leader first, then Team Member
              const roleOrder = {
                teamLeader: 1,
                teamMember: 2,
              };

              return (
                (roleOrder[a?.workerRole] || 99) -
                (roleOrder[b?.workerRole] || 99)
              );
            })
            .map((worker) => {
              const workerId = getWorkerId(worker);

              const isSelected = selectedWorkers.includes(workerId);

              return (
                <label
                  key={workerId}
                  className="border-border hover:bg-surface flex cursor-pointer items-center gap-3 border-b px-4 py-3 last:border-b-0"
                >
                  {/* Checkbox */}
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => onToggle?.(workerId)}
                    className="border-border text-primary focus:ring-primary h-4 w-4 shrink-0 rounded"
                  />

                  {/* Worker Information */}
                  <div className="flex min-w-0 flex-1 items-center gap-4">
                    {/* Team */}
                    <div className="min-w-16">
                      <p className="text-text-secondary text-[11px]">Team</p>

                      <p className="text-text text-sm font-semibold">
                        {getTeamNumber(worker)}
                      </p>
                    </div>

                    {/* Role */}
                    <div className="min-w-28">
                      <p className="text-text-secondary text-[11px]">Role</p>

                      <p className="text-text text-sm font-medium">
                        {renderRoleLabel(getWorkerRole(worker))}
                      </p>
                    </div>

                    {/* Name */}
                    <div className="min-w-0 flex-1">
                      <p className="text-text-secondary text-[11px]">Name</p>

                      <p className="text-text truncate text-sm font-semibold capitalize">
                        {getWorkerName(worker)}
                      </p>
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
