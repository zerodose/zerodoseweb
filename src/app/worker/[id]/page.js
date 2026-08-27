// // "use client";

// // import { useEffect, useState } from "react";
// // import { useParams, useRouter } from "next/navigation";
// // import {
// //   ArrowLeft,
// //   Baby,
// //   CalendarDays,
// //   Clock3,
// //   Edit,
// //   Hash,
// //   MapPin,
// //   Phone,
// //   Syringe,
// //   User,
// //   Users,
// //   Building2,
// //   Map,
// //   Navigation,
// //   CheckCircle2,
// //   AlertCircle,
// // } from "lucide-react";
// // import { toast } from "sonner";

// // import { getZerodose } from "@/api/zerodoseApi";
// // import WorkerPageSkeleton from "@/components/worker/WorkerPageSkeleton";

// // export default function ZerodoseDetailPage() {
// //   const params = useParams();
// //   const router = useRouter();

// //   const id = params?.id;

// //   const [zerodose, setZerodose] = useState(null);
// //   const [loading, setLoading] = useState(true);

// //   useEffect(() => {
// //     if (!id) return;

// //     const loadZerodose = async () => {
// //       try {
// //         setLoading(true);

// //         const response = await getZerodose(id);

// //         const data = response?.data?.data || response?.data || response;

// //         if (!data?._id) {
// //           toast.error("Zerodose not found.");
// //           setZerodose(null);
// //           return;
// //         }

// //         setZerodose(data);
// //       } catch (error) {
// //         console.error("Get zerodose detail error:", error);

// //         toast.error(
// //           error?.response?.data?.message ||
// //             error?.message ||
// //             "Failed to load zerodose.",
// //         );

// //         setZerodose(null);
// //       } finally {
// //         setLoading(false);
// //       }
// //     };

// //     loadZerodose();
// //   }, [id]);

// //   const formatDateTime = (date) => {
// //     if (!date) return "-";

// //     const parsedDate = new Date(date);

// //     if (Number.isNaN(parsedDate.getTime())) {
// //       return "-";
// //     }

// //     return parsedDate.toLocaleString("en-PK", {
// //       day: "2-digit",
// //       month: "short",
// //       year: "numeric",
// //       hour: "2-digit",
// //       minute: "2-digit",
// //     });
// //   };

// //   const getStatus = () => {
// //     if (zerodose?.vaccinationStatus === "covered") {
// //       return {
// //         label: "Covered",
// //         className:
// //           "bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400",
// //       };
// //     }

// //     if (zerodose?.vaccinationStatus === "visited") {
// //       return {
// //         label: "Visited",
// //         className:
// //           "bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400",
// //       };
// //     }

// //     return {
// //       label: "Recorded",
// //       className:
// //         "bg-orange-100 text-orange-700 dark:bg-orange-900/20 dark:text-orange-400",
// //     };
// //   };

// //   const getClientStatus = () => {
// //     if (!zerodose?.clientStatus) return "-";

// //     return zerodose.clientStatus
// //       .replaceAll("_", " ")
// //       .replace(/\b\w/g, (char) => char.toUpperCase());
// //   };

// //   if (loading) {
// //     return <WorkerPageSkeleton />;
// //   }

// //   if (!zerodose) {
// //     return null;
// //   }

// //   const status = getStatus();

// //   return (
// //     <div className="min-h-full">
// //       <div className="mt-4 mb-6 flex items-start gap-3">
// //         <button
// //           type="button"
// //           onClick={() => router.back()}
// //           className="border-border bg-background text-text-secondary hover:bg-surface flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border transition"
// //         >
// //           <ArrowLeft size={18} />
// //         </button>

// //         <div className="min-w-0 flex-1">
// //           <h1 className="text-text text-2xl font-semibold">Zerodose Details</h1>

// //           <p className="text-text-secondary mt-1 text-sm">
// //             View complete zerodose record information.
// //           </p>
// //         </div>
// //       </div>

// //       <div className="space-y-5">
// //         <div className="border-border bg-background rounded-2xl border shadow-sm">
// //           <div className="flex items-center justify-between gap-4 p-5 md:p-6">
// //             <div className="flex min-w-0 items-start gap-4">
// //               <div className="bg-primary/10 text-primary flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl">
// //                 <Syringe className="h-7 w-7" />
// //               </div>

// //               <div className="min-w-0 flex-1">
// //                 <div className="flex flex-wrap items-center gap-2">
// //                   <h2 className="text-text text-xl font-semibold break-words">
// //                     {zerodose.childName || "-"}
// //                   </h2>

// //                   <span
// //                     className={`rounded-full px-3 py-1 text-xs font-medium ${status.className}`}
// //                   >
// //                     {status.label}
// //                   </span>
// //                 </div>

// //                 <p className="text-text-secondary mt-1 text-sm">
// //                   Zerodose Record
// //                 </p>
// //               </div>
// //             </div>

// //             <button
// //               type="button"
// //               onClick={() => router.push(`/worker/${zerodose._id}/update`)}
// //               className="border-border bg-background text-text-secondary hover:bg-surface hover:text-primary flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border transition"
// //               title="Edit Zerodose"
// //             >
// //               <Edit className="h-4 w-4" />
// //             </button>
// //           </div>
// //         </div>

// //         <DetailSection
// //           icon={Baby}
// //           title="Child Information"
// //           description="Basic information about the child."
// //         >
// //           <DetailItem
// //             icon={User}
// //             label="Child Name"
// //             value={zerodose.childName}
// //           />

// //           <DetailItem
// //             icon={User}
// //             label="Father Name"
// //             value={zerodose.fatherName}
// //           />

// //           <DetailItem
// //             icon={Baby}
// //             label="Age"
// //             value={
// //               zerodose.age !== undefined && zerodose.age !== null
// //                 ? `${zerodose.age} months`
// //                 : "-"
// //             }
// //           />

// //           <DetailItem
// //             icon={Phone}
// //             label="Contact Number"
// //             value={zerodose.contactNo || "-"}
// //           />

// //           <DetailItem
// //             icon={MapPin}
// //             label="Address"
// //             value={zerodose.address || "-"}
// //           />
// //         </DetailSection>

// //         <DetailSection
// //           icon={CalendarDays}
// //           title="Campaign Information"
// //           description="Campaign and recording information."
// //         >
// //           <DetailItem
// //             icon={CalendarDays}
// //             label="Campaign"
// //             value={zerodose.campaign?.name || "-"}
// //           />

// //           <DetailItem
// //             icon={Hash}
// //             label="Campaign Year"
// //             value={zerodose.campaign?.year ?? "-"}
// //           />

// //           <DetailItem
// //             icon={CalendarDays}
// //             label="Campaign Month"
// //             value={zerodose.campaign?.month ?? "-"}
// //           />

// //           <DetailItem
// //             icon={Hash}
// //             label="Campaign Day"
// //             value={
// //               zerodose.day !== undefined && zerodose.day !== null
// //                 ? `Day ${zerodose.day}`
// //                 : "-"
// //             }
// //           />

// //           <DetailItem
// //             icon={Clock3}
// //             label="Record Date"
// //             value={formatDateTime(zerodose.recordDate)}
// //           />

// //           <DetailItem
// //             icon={CalendarDays}
// //             label="Visit Date"
// //             value={formatDateTime(zerodose.visitDate)}
// //           />

// //           <DetailItem
// //             icon={CheckCircle2}
// //             label="Covered Date"
// //             value={formatDateTime(zerodose.coveredDate)}
// //           />

// //           <DetailItem
// //             icon={Syringe}
// //             label="Vaccination Status"
// //             value={status.label}
// //           />

// //           <DetailItem
// //             icon={AlertCircle}
// //             label="Client Status"
// //             value={getClientStatus()}
// //           />
// //         </DetailSection>

// //         <DetailSection
// //           icon={Users}
// //           title="Assignment Information"
// //           description="Administrative and team assignment details."
// //         >
// //           <DetailItem
// //             icon={Building2}
// //             label="District"
// //             value={zerodose.district?.name || "-"}
// //           />

// //           <DetailItem
// //             icon={Map}
// //             label="Town"
// //             value={zerodose.town?.name || "-"}
// //           />

// //           <DetailItem
// //             icon={MapPin}
// //             label="Union Council"
// //             value={zerodose.unionCouncil?.name || "-"}
// //           />

// //           <DetailItem
// //             icon={User}
// //             label="UCMO"
// //             value={zerodose.ucmo?.name || "-"}
// //           />

// //           <DetailItem
// //             icon={User}
// //             label="Supervisor"
// //             value={zerodose.supervisor?.name || "-"}
// //           />

// //           <DetailItem
// //             icon={Users}
// //             label="Team Number"
// //             value={zerodose.teamNumber ?? "-"}
// //           />

// //           <DetailItem
// //             icon={User}
// //             label="Recorded By"
// //             value={zerodose.user?.name || "-"}
// //           />

// //           <DetailItem
// //             icon={User}
// //             label="Team Leader"
// //             value={zerodose.teamLeader?.name || "-"}
// //           />

// //           <DetailItem
// //             icon={User}
// //             label="Team Member"
// //             value={zerodose.teamMember?.name || "-"}
// //           />
// //         </DetailSection>

// //         <DetailSection
// //           icon={Navigation}
// //           title="Location"
// //           description="GPS location captured when the zerodose was recorded."
// //         >
// //           <DetailItem
// //             icon={MapPin}
// //             label="Latitude"
// //             value={zerodose.location?.latitude ?? "-"}
// //           />

// //           <DetailItem
// //             icon={MapPin}
// //             label="Longitude"
// //             value={zerodose.location?.longitude ?? "-"}
// //           />

// //           {zerodose.location?.latitude != null &&
// //             zerodose.location?.longitude != null && (
// //               <div className="md:col-span-2">
// //                 <a
// //                   href={`https://www.google.com/maps?q=${zerodose.location.latitude},${zerodose.location.longitude}`}
// //                   target="_blank"
// //                   rel="noopener noreferrer"
// //                   className="text-primary hover:text-primary-dark inline-flex items-center gap-2 text-sm font-medium"
// //                 >
// //                   <MapPin className="h-4 w-4" />
// //                   Open Location in Google Maps
// //                 </a>
// //               </div>
// //             )}
// //         </DetailSection>

// //         <DetailSection
// //           icon={Clock3}
// //           title="Record Information"
// //           description="Record creation and last modification information."
// //         >
// //           <DetailItem
// //             icon={Clock3}
// //             label="Created At"
// //             value={formatDateTime(zerodose.createdAt)}
// //           />

// //           <DetailItem
// //             icon={Clock3}
// //             label="Updated At"
// //             value={formatDateTime(zerodose.updatedAt)}
// //           />
// //         </DetailSection>
// //       </div>
// //     </div>
// //   );
// // }

// // function DetailSection({ icon: Icon, title, description, children }) {
// //   return (
// //     <section className="border-border bg-background overflow-hidden rounded-2xl border shadow-sm">
// //       <div className="border-border flex items-center gap-3 border-b p-4 md:p-5">
// //         <div className="bg-primary/10 text-primary flex h-10 w-10 shrink-0 items-center justify-center rounded-xl">
// //           <Icon className="h-5 w-5" />
// //         </div>

// //         <div className="min-w-0">
// //           <h2 className="text-text font-semibold">{title}</h2>

// //           <p className="text-text-secondary mt-0.5 text-xs">{description}</p>
// //         </div>
// //       </div>

// //       <div className="grid grid-cols-2 gap-x-10 gap-y-6 p-4 md:grid-cols-2 md:p-5">
// //         {children}
// //       </div>
// //     </section>
// //   );
// // }

// // function DetailItem({ icon: Icon, label, value }) {
// //   return (
// //     <div>
// //       <div className="text-text-secondary flex items-center gap-1.5 text-xs">
// //         {Icon && <Icon className="h-3.5 w-3.5 shrink-0" />}

// //         <span>{label}</span>
// //       </div>

// //       <p className="text-text mt-1.5 text-sm font-medium break-words">
// //         {value || "-"}
// //       </p>
// //     </div>
// //   );
// // }

// "use client";

// import { useEffect, useState } from "react";
// import { useParams, useRouter } from "next/navigation";
// import {
//   ArrowLeft,
//   Baby,
//   CalendarDays,
//   Clock3,
//   Edit,
//   Hash,
//   MapPin,
//   Phone,
//   Syringe,
//   User,
//   Users,
//   Building2,
//   Map,
//   Navigation,
//   CheckCircle2,
//   AlertCircle,
//   Home,
//   QrCode,
//   VenusAndMars,
//   ShieldCheck,
//   Trash2,
// } from "lucide-react";
// import { toast } from "sonner";

// import { getZerodose } from "@/api/zerodoseApi";
// import WorkerPageSkeleton from "@/components/worker/WorkerPageSkeleton";
// import { formatDate } from "@/lib/formatDate";

// export default function ZerodoseDetailPage() {
//   const params = useParams();
//   const router = useRouter();

//   const id = params?.id;

//   const [zerodose, setZerodose] = useState(null);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     if (!id) return;

//     const loadZerodose = async () => {
//       try {
//         setLoading(true);

//         const response = await getZerodose(id);

//         const data = response?.data?.data || response?.data || response;

//         if (!data?._id) {
//           toast.error("Zerodose not found.");
//           setZerodose(null);
//           return;
//         }

//         setZerodose(data);
//       } catch (error) {
//         console.error("Get zerodose detail error:", error);

//         toast.error(
//           error?.response?.data?.message ||
//             error?.message ||
//             "Failed to load zerodose.",
//         );

//         setZerodose(null);
//       } finally {
//         setLoading(false);
//       }
//     };

//     loadZerodose();
//   }, [id]);

//   const formatGender = (gender) => {
//     if (!gender) return "-";

//     return gender.charAt(0).toUpperCase() + gender.slice(1);
//   };

//   const formatClientStatus = (status) => {
//     if (!status) return "-";

//     return status
//       .replaceAll("_", " ")
//       .replace(/\b\w/g, (char) => char.toUpperCase());
//   };

//   const formatValue = (value) => {
//     if (value === null || value === undefined || value === "") {
//       return "-";
//     }

//     return value;
//   };

//   const getStatus = () => {
//     if (zerodose?.vaccinationStatus === "covered") {
//       return {
//         label: "Covered",
//         className:
//           "bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400",
//       };
//     }

//     if (zerodose?.vaccinationStatus === "visited") {
//       return {
//         label: "Visited",
//         className:
//           "bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400",
//       };
//     }

//     return {
//       label: "Recorded",
//       className:
//         "bg-orange-100 text-orange-700 dark:bg-orange-900/20 dark:text-orange-400",
//     };
//   };

//   if (loading) {
//     return <WorkerPageSkeleton />;
//   }

//   if (!zerodose) {
//     return null;
//   }

//   const status = getStatus();

//   return (
//     <div className="min-h-full">
//       {/* Header */}
//       <div className="mt-4 mb-6 flex items-start gap-3">
//         <button
//           type="button"
//           onClick={() => router.back()}
//           className="border-border bg-background text-text-secondary hover:bg-surface flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border transition"
//         >
//           <ArrowLeft size={18} />
//         </button>

//         <div className="min-w-0 flex-1">
//           <h1 className="text-text text-2xl font-semibold">Zerodose Details</h1>

//           <p className="text-text-secondary mt-1 text-sm">
//             View complete zerodose record information.
//           </p>
//         </div>
//       </div>

//       <div className="space-y-5">
//         {/* Summary */}
//         <div className="border-border bg-background rounded-2xl border shadow-sm">
//           <div className="flex items-center justify-between gap-4 p-5 md:p-6">
//             <div className="flex min-w-0 items-start gap-4">
//               <div className="bg-primary/10 text-primary flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl">
//                 <Syringe className="h-7 w-7" />
//               </div>

//               <div className="min-w-0 flex-1">
//                 <div className="flex flex-wrap items-center gap-2">
//                   <h2 className="text-text text-xl font-semibold break-words capitalize">
//                     {zerodose.childName || "-"}
//                   </h2>

//                   <span
//                     className={`rounded-full px-3 py-1 text-xs font-medium ${status.className}`}
//                   >
//                     {status.label}
//                   </span>
//                 </div>

//                 <p className="text-text-secondary mt-1 text-sm">
//                   Zerodose Record
//                 </p>
//               </div>
//             </div>

//             {/* Supervisor Update */}
//             <button
//               type="button"
//               onClick={() => router.push(`/worker/${zerodose._id}/update`)}
//               className="border-border bg-background text-text-secondary hover:bg-surface hover:text-primary flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border transition"
//               title="Edit Zerodose"
//             >
//               <Edit className="h-4 w-4" />
//             </button>
//           </div>
//         </div>

//         {/* Child Information */}
//         <DetailSection
//           icon={Baby}
//           title="Child Information"
//           description="Basic information about the child."
//         >
//           <DetailItem
//             icon={User}
//             label="Child Name"
//             value={zerodose.childName}
//           />

//           <DetailItem
//             icon={User}
//             label="Father Name"
//             value={zerodose.fatherName}
//           />

//           <DetailItem
//             icon={VenusAndMars}
//             label="Gender"
//             value={formatGender(zerodose.gender)}
//           />

//           <DetailItem
//             icon={Baby}
//             label="Age"
//             value={
//               zerodose.age !== undefined && zerodose.age !== null
//                 ? `${zerodose.age} months`
//                 : "-"
//             }
//           />

//           <DetailItem
//             icon={Home}
//             label="House Number"
//             value={formatValue(zerodose.houseNumber)}
//           />

//           <DetailItem
//             icon={Phone}
//             label="Contact Number"
//             value={zerodose.contactNo}
//           />

//           <DetailItem icon={MapPin} label="Address" value={zerodose.address} />
//           {zerodose.location?.latitude != null &&
//             zerodose.location?.longitude != null && (
//               <div className="md:col-span-2">
//                 <a
//                   href={`https://www.google.com/maps?q=${zerodose.location.latitude},${zerodose.location.longitude}`}
//                   target="_blank"
//                   rel="noopener noreferrer"
//                   className="text-primary hover:text-primary-dark inline-flex items-center gap-2 text-sm font-medium"
//                 >
//                   <MapPin className="h-4 w-4" />
//                   Open Location in Google Maps
//                 </a>
//               </div>
//             )}
//         </DetailSection>

//         {/* Campaign Information */}
//         <DetailSection
//           icon={CalendarDays}
//           title="Campaign Information"
//           description="Campaign and recording information."
//         >
//           <DetailItem
//             icon={CalendarDays}
//             label="Campaign"
//             value={zerodose.campaign?.name}
//           />

//           <DetailItem
//             icon={Hash}
//             label="Campaign Year"
//             value={zerodose.campaign?.year}
//           />

//           <DetailItem
//             icon={CalendarDays}
//             label="Campaign Month"
//             value={zerodose.campaign?.month}
//           />

//           <DetailItem
//             icon={Hash}
//             label="Campaign Day"
//             value={
//               zerodose.day !== undefined && zerodose.day !== null
//                 ? `Day ${zerodose.day}`
//                 : "-"
//             }
//           />

//           <DetailItem
//             icon={Clock3}
//             label="Record Date"
//             value={formatDate(zerodose.recordDate)}
//           />

//           <DetailItem
//             icon={CalendarDays}
//             label="Visit Date"
//             value={formatDate(zerodose.visitDate)}
//           />

//           <DetailItem
//             icon={CheckCircle2}
//             label="Covered Date"
//             value={formatDate(zerodose.coveredDate)}
//           />

//           <DetailItem
//             icon={Syringe}
//             label="Vaccination Status"
//             value={status.label}
//           />

//           <DetailItem
//             icon={AlertCircle}
//             label="Client Status"
//             value={formatClientStatus(zerodose.clientStatus)}
//           />

//           <DetailItem
//             icon={QrCode}
//             label="QR Code"
//             value={formatValue(zerodose.qrCode)}
//           />
//         </DetailSection>

//         {/* Assignment Information */}
//         <DetailSection
//           icon={Users}
//           title="Assignment Information"
//           description="Administrative and team assignment details."
//         >
//           <DetailItem
//             icon={Building2}
//             label="District"
//             value={zerodose.district?.name}
//           />

//           <DetailItem icon={Map} label="Town" value={zerodose.town?.name} />

//           <DetailItem
//             icon={MapPin}
//             label="Union Council"
//             value={zerodose.unionCouncil?.name}
//           />

//           <DetailItem icon={User} label="UCMO" value={zerodose.ucmo?.name} />

//           <DetailItem
//             icon={User}
//             label="Supervisor"
//             value={zerodose.supervisor?.name}
//           />

//           <DetailItem
//             icon={Users}
//             label="Team Number"
//             value={zerodose.teamNumber}
//           />

//           <DetailItem
//             icon={User}
//             label="Recorded By"
//             value={zerodose.user?.name}
//           />

//           <DetailItem
//             icon={User}
//             label="Team Leader"
//             value={zerodose.teamLeader?.name}
//           />

//           <DetailItem
//             icon={User}
//             label="Team Member"
//             value={zerodose.teamMember?.name}
//           />

//           <DetailItem
//             icon={Syringe}
//             label="Vaccinator"
//             value={zerodose.vaccinator?.name}
//           />
//         </DetailSection>

//         {/* Location */}
//         {/* <DetailSection
//           icon={Navigation}
//           title="Location"
//           description="GPS location captured when the zerodose was recorded."
//         >
//           <DetailItem
//             icon={MapPin}
//             label="Latitude"
//             value={zerodose.location?.latitude}
//           />

//           <DetailItem
//             icon={MapPin}
//             label="Longitude"
//             value={zerodose.location?.longitude}
//           />
//         </DetailSection> */}

//         {/* Record Information */}
//         {/* <DetailSection
//           icon={Clock3}
//           title="Record Information"
//           description="Record creation and last modification information."
//         >
//           <DetailItem icon={Hash} label="Zerodose ID" value={zerodose._id} />

//           <DetailItem
//             icon={Clock3}
//             label="Created At"
//             value={formatDate(zerodose.createdAt)}
//           />

//           <DetailItem
//             icon={Clock3}
//             label="Updated At"
//             value={formatDate(zerodose.updatedAt)}
//           />
//         </DetailSection> */}

//         {/* Update Approval Information */}
//         {zerodose.updateApproved === true && (
//           <DetailSection
//             icon={ShieldCheck}
//             title="Update Approval Information"
//             description="Information related to the approved update request."
//           >
//             <DetailItem
//               icon={CheckCircle2}
//               label="Update Requested"
//               value={zerodose.updateRequested ? "Yes" : "No"}
//             />

//             <DetailItem
//               icon={CheckCircle2}
//               label="Update Approved"
//               value={zerodose.updateApproved ? "Yes" : "No"}
//             />

//             <DetailItem
//               icon={User}
//               label="Update Requested By"
//               value={
//                 zerodose.updateRequestedBy?.name ||
//                 zerodose.updateRequestedBy ||
//                 "-"
//               }
//             />

//             <DetailItem
//               icon={User}
//               label="Update Approved By"
//               value={
//                 zerodose.updateApprovedBy?.name ||
//                 zerodose.updateApprovedBy ||
//                 "-"
//               }
//             />

//             <DetailItem
//               icon={Clock3}
//               label="Update Requested At"
//               value={formatDate(zerodose.updateRequestedAt)}
//             />

//             <DetailItem
//               icon={Clock3}
//               label="Update Approved At"
//               value={formatDate(zerodose.updateApprovedAt)}
//             />
//           </DetailSection>
//         )}

//         {/* Delete Approval Information */}
//         {zerodose.deleteApproved === true && (
//           <DetailSection
//             icon={Trash2}
//             title="Delete Approval Information"
//             description="Information related to the approved delete request."
//           >
//             <DetailItem
//               icon={CheckCircle2}
//               label="Delete Requested"
//               value={zerodose.deleteRequested ? "Yes" : "No"}
//             />

//             <DetailItem
//               icon={CheckCircle2}
//               label="Delete Approved"
//               value={zerodose.deleteApproved ? "Yes" : "No"}
//             />

//             <DetailItem
//               icon={User}
//               label="Delete Requested By"
//               value={
//                 zerodose.deleteRequestedBy?.name ||
//                 zerodose.deleteRequestedBy ||
//                 "-"
//               }
//             />

//             <DetailItem
//               icon={User}
//               label="Delete Approved By"
//               value={
//                 zerodose.deleteApprovedBy?.name ||
//                 zerodose.deleteApprovedBy ||
//                 "-"
//               }
//             />

//             <DetailItem
//               icon={Clock3}
//               label="Delete Requested At"
//               value={formatDate(zerodose.deleteRequestedAt)}
//             />

//             <DetailItem
//               icon={Clock3}
//               label="Delete Approved At"
//               value={formatDate(zerodose.deleteApprovedAt)}
//             />
//           </DetailSection>
//         )}
//       </div>
//     </div>
//   );
// }

// function DetailSection({ icon: Icon, title, description, children }) {
//   return (
//     <section className="border-border bg-background overflow-hidden rounded-2xl border shadow-sm">
//       <div className="border-border flex items-center gap-3 border-b p-4 md:p-5">
//         <div className="bg-primary/10 text-primary flex h-10 w-10 shrink-0 items-center justify-center rounded-xl">
//           <Icon className="h-5 w-5" />
//         </div>

//         <div className="min-w-0">
//           <h2 className="text-text font-semibold">{title}</h2>

//           <p className="text-text-secondary mt-0.5 text-xs">{description}</p>
//         </div>
//       </div>

//       <div className="grid grid-cols-2 gap-x-10 gap-y-6 p-4 md:grid-cols-2 md:p-5">
//         {children}
//       </div>
//     </section>
//   );
// }

// function DetailItem({ icon: Icon, label, value }) {
//   const displayValue =
//     typeof value === "number" && value >= 0 && value < 10
//       ? `0${value}`
//       : value !== null && value !== undefined && value !== ""
//         ? value
//         : "-";

//   return (
//     <div>
//       <div className="text-text-secondary flex items-center gap-1.5 text-xs">
//         {Icon && <Icon className="h-3.5 w-3.5 shrink-0" />}

//         <span>{label}</span>
//       </div>

//       <p className="text-text mt-1.5 text-sm font-medium break-words capitalize">
//         {displayValue}
//       </p>
//     </div>
//   );
// }
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  UserRound,
  Phone,
  Mail,
  Building2,
  Map,
  MapPin,
  BriefcaseBusiness,
  ShieldCheck,
  Hash,
} from "lucide-react";
import { toast } from "sonner";

import { getUser } from "@/api/userApi";

import Loader from "@/components/ui/Loader";

export default function AdminSignupForm({ userId = null }) {
  const router = useRouter();

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // ============================================================
  // Helpers
  // ============================================================

  const formatValue = (value) => {
    if (value === null || value === undefined || value === "") {
      return "-";
    }

    return value;
  };

  const capitalizeWords = (value) => {
    if (value === null || value === undefined || value === "") {
      return "-";
    }

    return String(value)
      .replaceAll("_", " ")
      .replace(/\s+/g, " ")
      .trim()
      .replace(/\b\w/g, (char) => char.toUpperCase());
  };

  const formatDesignation = (designation) => {
    if (!designation) {
      return "-";
    }

    const normalized = String(designation).toLowerCase();

    const designationMap = {
      ucmo: "UCMO",
      supervisor: "Supervisor",
      vaccinator: "Vaccinator",
      otherstaff: "Other Staff",
      townfp: "Town FP",
      districtfp: "District FP",
      worker: "Worker",
      admin: "Admin",
    };

    return (
      designationMap[normalized] ||
      capitalizeWords(designation)
    );
  };

  // ============================================================
  // Load User
  // ============================================================

  useEffect(() => {
    if (!userId) {
      toast.error("Invalid user ID.");
      setLoading(false);
      return;
    }

    const loadUser = async () => {
      try {
        setLoading(true);

        const response = await getUser(userId);

        console.log("Get single user response:", response);

        const data =
          response?.data?.user ||
          response?.data ||
          response?.user ||
          response;

        if (!data?._id) {
          toast.error("User not found.");
          setUser(null);
          return;
        }

        setUser(data);
      } catch (error) {
        console.error("Get user detail error:", error);

        toast.error(
          error?.response?.data?.message ||
            error?.message ||
            "Failed to load user.",
        );

        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    loadUser();
  }, [userId]);

  // ============================================================
  // Loading
  // ============================================================

  if (loading) {
    return <Loader text="Loading user information..." />;
  }

  if (!user) {
    return null;
  }

  // ============================================================
  // Location
  // ============================================================

  const districtName =
    typeof user.district === "object"
      ? user.district?.name
      : user.district;

  const townName =
    typeof user.town === "object"
      ? user.town?.name
      : user.town;

  const unionCouncilName =
    typeof user.unionCouncil === "object"
      ? user.unionCouncil?.name
      : user.unionCouncil;

  // ============================================================
  // Render
  // ============================================================

  return (
    <div className="min-h-full">
      {/* ========================================================
          Header
      ======================================================== */}

      <div className="mt-4 mb-6 flex items-start gap-3">
        <button
          type="button"
          onClick={() => router.back()}
          className="border-border bg-background text-text-secondary hover:bg-surface flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border transition"
        >
          <ArrowLeft size={18} />
        </button>

        <div className="min-w-0 flex-1">
          <h1 className="text-text text-2xl font-semibold">
            View User
          </h1>

          <p className="text-text-secondary mt-1 text-sm">
            View complete user account and assigned information.
          </p>
        </div>
      </div>

      <div className="space-y-5">
        {/* ========================================================
            Summary
        ======================================================== */}

        <div className="border-border bg-background rounded-2xl border shadow-sm">
          <div className="flex items-center gap-4 p-5 md:p-6">
            <div className="bg-primary/10 text-primary flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl">
              <UserRound className="h-7 w-7" />
            </div>

            <div className="min-w-0 flex-1">
              <h2 className="text-text text-xl font-semibold break-words">
                {formatValue(user.name)}
              </h2>

              <p className="text-text-secondary mt-1 text-sm">
                {formatDesignation(user.designation)}
              </p>
            </div>
          </div>
        </div>

        {/* ========================================================
            Personal Information
        ======================================================== */}

        <DetailSection
          icon={UserRound}
          title="Personal Information"
          description="Basic information about the user account."
        >
          <DetailItem
            icon={UserRound}
            label="Full Name"
            value={user.name}
          />

          <DetailItem
            icon={Phone}
            label="Contact Number"
            value={user.contactNumber}
            capitalize={false}
          />

          <DetailItem
            icon={Mail}
            label="Email"
            value={user.email}
            capitalize={false}
          />
        </DetailSection>

        {/* ========================================================
            Work Information
        ======================================================== */}

        <DetailSection
          icon={BriefcaseBusiness}
          title="Work Information"
          description="User designation and access information."
        >
          <DetailItem
            icon={BriefcaseBusiness}
            label="Designation"
            value={formatDesignation(user.designation)}
            capitalize={false}
          />

          {user.designation?.toLowerCase() === "supervisor" && (
            <DetailItem
              icon={Hash}
              label="Supervisor Code"
              value={user.supervisorCode}
              capitalize={false}
            />
          )}

          {user.teamNumber !== undefined &&
            user.teamNumber !== null &&
            user.teamNumber !== "" && (
              <DetailItem
                icon={Hash}
                label="Team Number"
                value={user.teamNumber}
                capitalize={false}
              />
            )}
        </DetailSection>

        {/* ========================================================
            Location
        ======================================================== */}

        <DetailSection
          icon={MapPin}
          title="Location"
          description="Administrative location assigned to the user."
        >
          <DetailItem
            icon={Building2}
            label="District"
            value={districtName}
          />

          <DetailItem
            icon={Map}
            label="Town"
            value={townName}
          />

          <DetailItem
            icon={MapPin}
            label="Union Council"
            value={unionCouncilName}
          />
        </DetailSection>

        {/* ========================================================
            Account Information
        ======================================================== */}

        <DetailSection
          icon={ShieldCheck}
          title="Account Information"
          description="Current account and access status."
        >
          <DetailItem
            icon={ShieldCheck}
            label="Account Status"
            value={
              user.isActive === false
                ? "Inactive"
                : "Active"
            }
            capitalize={false}
          />

          <DetailItem
            icon={ShieldCheck}
            label="Email Verified"
            value={
              user.emailVerified === true
                ? "Yes"
                : user.emailVerified === false
                  ? "No"
                  : "-"
            }
            capitalize={false}
          />

          {user.approvalStatus && (
            <DetailItem
              icon={ShieldCheck}
              label="Approval Status"
              value={capitalizeWords(user.approvalStatus)}
              capitalize={false}
            />
          )}
        </DetailSection>
      </div>
    </div>
  );
}

// ================================================================
// Detail Section
// ================================================================

function DetailSection({
  icon: Icon,
  title,
  description,
  children,
}) {
  return (
    <section className="border-border bg-background overflow-hidden rounded-2xl border shadow-sm">
      <div className="border-border flex items-center gap-3 border-b p-4 md:p-5">
        <div className="bg-primary/10 text-primary flex h-10 w-10 shrink-0 items-center justify-center rounded-xl">
          <Icon className="h-5 w-5" />
        </div>

        <div className="min-w-0">
          <h2 className="text-text font-semibold">
            {title}
          </h2>

          <p className="text-text-secondary mt-0.5 text-xs">
            {description}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-x-10 gap-y-6 p-4 md:p-5">
        {children}
      </div>
    </section>
  );
}

// ================================================================
// Detail Item
// ================================================================

function DetailItem({
  icon: Icon,
  label,
  value,
  capitalize = true,
}) {
  const displayValue =
    value !== null &&
    value !== undefined &&
    value !== ""
      ? value
      : "-";

  return (
    <div>
      <div className="text-text-secondary flex items-center gap-1.5 text-xs">
        {Icon && (
          <Icon className="h-3.5 w-3.5 shrink-0" />
        )}

        <span>{label}</span>
      </div>

      <p
        className={`text-text mt-1.5 text-sm font-medium break-words ${
          capitalize ? "capitalize" : ""
        }`}
      >
        {displayValue}
      </p>
    </div>
  );
}