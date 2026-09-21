
"use client";

import {
ArrowUpRight,
CheckCircle2,
ClipboardList,
Eye,
UserRound,
Users,
} from "lucide-react";

export default function SupervisorsTable({
data = [],
onSupervisorClick,
}) {
const getSupervisorCode = (code) => {
if (code === null || code === undefined || code === "") {
return "-";
}


const value = String(code);

return value.startsWith("0") ? value : `0${value}`;


};

const stats = [
{
key: "numberOfTeams",
label: "Teams",
icon: Users,
getValue: (supervisor) =>
Number(supervisor?.numberOfTeams || 0),
},
{
key: "recordCount",
label: "Recorded",
icon: ClipboardList,
getValue: (supervisor) =>
Number(supervisor?.recordCount || 0),
},
{
key: "visitCount",
label: "Visited",
icon: Eye,
getValue: (supervisor) =>
Number(supervisor?.visitCount || 0),
},
{
key: "coveredCount",
label: "Covered",
icon: CheckCircle2,
getValue: (supervisor) =>
Number(supervisor?.coveredCount || 0),
},
];

return ( <div className="mb-5">
{data.length === 0 ? ( <div className="border-border bg-background rounded-2xl border px-4 py-12 text-center shadow-sm"> <div className="bg-primary/5 text-primary mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl"> <UserRound size={22} /> </div>


      <p className="text-text text-sm font-semibold">
        No active supervisors
      </p>

      <p className="text-text-secondary mt-1 text-xs">
        There are currently no active supervisors to display.
      </p>
    </div>
  ) : (
    <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
      {data.map((supervisor, index) => (
        <div
          key={
            supervisor?.supervisorCode ||
            supervisor?.supervisorId ||
            index
          }
          onClick={() => onSupervisorClick?.(supervisor)}
          className={`border-border bg-background group relative overflow-hidden rounded-2xl border shadow-sm transition-all duration-200 ${
            onSupervisorClick
              ? "hover:border-primary/30 cursor-pointer hover:-translate-y-0.5 hover:shadow-md active:translate-y-0"
              : ""
          }`}
        >
          <div className="bg-primary absolute top-0 right-0 left-0 h-0.5 opacity-70" />

          <div className="p-3.5 sm:p-4">
            {/* SUPERVISOR INFO */}

            <div className="flex items-center justify-between gap-3">
              <div className="flex min-w-0 items-center gap-3">
                <div className="bg-primary/10 text-primary flex h-10 w-10 shrink-0 items-center justify-center rounded-xl">
                  <UserRound size={19} />
                </div>

                <div className="min-w-0">
                  <h4 className="text-text truncate text-sm font-semibold capitalize sm:text-[15px]">
                    {supervisor?.supervisorName || "-"}
                  </h4>

                  <div className="mt-1 flex items-center gap-1.5">
                    <span className="text-text-secondary text-[10px] sm:text-[11px]">
                      Supervisor Code
                    </span>

                    <span className="bg-surface text-text rounded-md px-1.5 py-0.5 text-[10px] font-semibold">
                      {getSupervisorCode(
                        supervisor?.supervisorCode,
                      )}
                    </span>
                  </div>
                </div>
              </div>

              {onSupervisorClick && (
                <div className="border-border bg-surface text-text-secondary group-hover:border-primary/20 group-hover:bg-primary/10 group-hover:text-primary flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border transition-colors">
                  <ArrowUpRight size={15} />
                </div>
              )}
            </div>

            {/* STATS */}

            <div className="border-border mt-3 grid grid-cols-4 overflow-hidden rounded-xl border">
              {stats.map((stat, statIndex) => {
                const Icon = stat.icon;

                return (
                  <div
                    key={stat.key}
                    className={`bg-surface px-1.5 py-2.5 text-center sm:px-2 ${
                      statIndex !== stats.length - 1
                        ? "border-border border-r"
                        : ""
                    }`}
                  >
                    <div className="text-text-secondary flex items-center justify-center gap-1">
                      <Icon
                        size={11}
                        strokeWidth={2}
                      />

                      <span className="text-[9px] font-medium sm:text-[10px]">
                        {stat.label}
                      </span>
                    </div>

                    <p className="text-text mt-1 text-sm font-bold sm:text-base">
                      {stat.getValue(supervisor)}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>

          {onSupervisorClick && (
            <div className="bg-primary absolute right-0 bottom-0 left-0 h-0.5 origin-left scale-x-0 transition-transform duration-200 group-hover:scale-x-100" />
          )}
        </div>
      ))}
    </div>
  )}
</div>


);
}
