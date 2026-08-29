// "use client";

// import TeamNumberInput from "./TeamNumberInput";

// export default function TransferWorkerCard({
//   worker,
//   selected,
//   teamNumber,
//   workerRole,
//   onToggle,
//   onDetailChange,
// }) {
//   const workerId = String(worker?._id || worker?.id || "");

//   const getCurrentTeamNumber = () => {
//     return worker?.teamNumber || worker?.team?.teamNumber || "-";
//   };

//   const getCurrentRole = () => {
//     return worker?.workerRole || "-";
//   };

//   const getWorkerName = () => {
//     return worker?.name || "Worker";
//   };

//   const renderRoleLabel = (role) => {
//     if (role === "teamLeader") return "Team Leader";
//     if (role === "teamMember") return "Team Member";

//     return "-";
//   };

//   return (
//     <div className="border-border border-b p-4 last:border-b-0">
//       {/* Worker Header */}
//       <div className="flex items-start gap-3">
//         <input
//           type="checkbox"
//           checked={selected}
//           onChange={() => onToggle?.(workerId)}
//           className="border-border text-primary focus:ring-primary mt-1 h-4 w-4 rounded"
//         />

//         {/* Worker Information */}
//         <div className="flex min-w-0 flex-1 items-center gap-4">
//           {/* Team */}
//           <div className="min-w-16">
//             <p className="text-text-secondary text-[11px]">Team</p>

//             <p className="text-text text-sm font-semibold">
//               {getCurrentTeamNumber()}
//             </p>
//           </div>

//           {/* Role */}
//           <div className="min-w-28">
//             <p className="text-text-secondary text-[11px]">Role</p>

//             <p className="text-text text-sm font-medium">
//               {renderRoleLabel(getCurrentRole())}
//             </p>
//           </div>

//           {/* Name */}
//           <div className="min-w-0 flex-1">
//             <p className="text-text-secondary text-[11px]">Name</p>

//             <p className="text-text truncate text-sm font-semibold capitalize">
//               {getWorkerName()}
//             </p>
//           </div>
//         </div>
//       </div>

//       {/* Transfer Configuration */}
//       <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
//         {/* Team */}
//         <div>
//           <label className="text-text mb-1.5 block text-xs font-medium">
//             Team Number
//           </label>

//           <TeamNumberInput
//             value={teamNumber}
//             onChange={(value) =>
//               onDetailChange?.(workerId, "teamNumber", value)
//             }
//           />
//         </div>

//         {/* Role */}
//         <div>
//           <label className="text-text mb-1.5 block text-xs font-medium">
//             Worker Role
//           </label>

//           <select
//             value={workerRole || ""}
//             onChange={(e) =>
//               onDetailChange?.(workerId, "workerRole", e.target.value)
//             }
//             className="border-border bg-background text-text focus:border-primary focus:ring-primary-light w-full rounded-lg border px-3 py-2 text-sm transition outline-none focus:ring-2"
//           >
//             <option value="">Select role</option>
//             <option value="teamLeader">Team Leader</option>
//             <option value="teamMember">Team Member</option>
//           </select>
//         </div>
//       </div>
//     </div>
//   );
// }

"use client";

import TeamNumberInput from "./TeamNumberInput";

export default function TransferWorkerCard({
  worker,
  selected,
  teamNumber,
  workerRole,
  onToggle,
  onDetailChange,
}) {
  const workerId = String(worker?._id || worker?.id || "");

  const getCurrentTeamNumber = () => {
    return worker?.teamNumber || worker?.team?.teamNumber || "-";
  };

  const getCurrentRole = () => {
    return worker?.workerRole || "-";
  };

  const getWorkerName = () => {
    return worker?.name || "Worker";
  };

  const renderRoleLabel = (role) => {
    if (role === "teamLeader") return "Team Leader";
    if (role === "teamMember") return "Team Member";

    return "-";
  };

  return (
    <div className="border-border border-b p-4 last:border-b-0">
      {/* Worker Header */}
      <div className="flex min-w-0 items-start gap-3">
        {/* Checkbox */}
        <input
          type="checkbox"
          checked={selected}
          onChange={() => onToggle?.(workerId)}
          className="accent-primary mt-1 h-4 w-4 shrink-0 cursor-pointer"
        />

        {/* Worker Information */}
        <div className="flex min-w-0 flex-1 items-center gap-3">
          {/* Team */}
          <div className="w-12 shrink-0">
            <p className="text-text-secondary text-[10px]">Team</p>

            <p className="text-text text-sm font-semibold">
              {getCurrentTeamNumber()}
            </p>
          </div>

          {/* Role */}
          <div className="w-24 shrink-0">
            <p className="text-text-secondary text-[10px]">Role</p>

            <p className="text-text truncate text-sm font-medium">
              {renderRoleLabel(getCurrentRole())}
            </p>
          </div>

          {/* Name */}
          <div className="min-w-0 flex-1">
            <p className="text-text-secondary text-[10px]">Name</p>

            <p className="text-text truncate text-sm font-semibold capitalize">
              {getWorkerName()}
            </p>
          </div>
        </div>
      </div>

      {/* Transfer Configuration */}
      <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
        {/* Team */}
        <div>
          <label className="text-text mb-1.5 block text-xs font-medium">
            Team Number
          </label>

          <TeamNumberInput
            value={teamNumber}
            onChange={(value) =>
              onDetailChange?.(workerId, "teamNumber", value)
            }
          />
        </div>

        {/* Role */}
        <div>
          <label className="text-text mb-1.5 block text-xs font-medium">
            Worker Role
          </label>

          <select
            value={workerRole || ""}
            onChange={(e) =>
              onDetailChange?.(workerId, "workerRole", e.target.value)
            }
            className="border-border bg-background text-text focus:border-primary focus:ring-primary-light w-full rounded-lg border px-3 py-2 text-sm transition outline-none focus:ring-2"
          >
            <option value="">Select role</option>
            <option value="teamLeader">Team Leader</option>
            <option value="teamMember">Team Member</option>
          </select>
        </div>
      </div>
    </div>
  );
}
