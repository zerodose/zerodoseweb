// import { api } from "./client";

// // ============================================================
// // Add Worker
// // ============================================================

// export async function createWorker(data) {
//   const authUser = JSON.parse(localStorage.getItem("authUser"));

//   const response = await api.post(
//     "/supervisor/workers",
//     {
//       name: data.name.trim(),
//       contactNumber: data.contactNumber.trim(),
//       teamNumber: Number(data.teamNumber),
//       workerRole: data.workerRole,
//     },
//     {
//       headers: {
//         "x-user-id": authUser.id,
//       },
//     },
//   );

//   return response.data;
// }

import { api } from "./client";

// ============================================================
// Add Worker
// ============================================================

export async function createWorker(data) {
  const response = await api.post("/supervisor/workers", {
    name: data.name.trim(),
    contactNumber: data.contactNumber.trim(),
    teamNumber: Number(data.teamNumber),
    workerRole: data.workerRole,
  });

  return response.data;
}
