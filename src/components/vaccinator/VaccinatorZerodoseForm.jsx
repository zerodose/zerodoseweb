// "use client";

// import { useEffect, useState } from "react";
// import { useRouter } from "next/navigation";
// import {
//   ArrowLeft,
//   Baby,
//   CalendarDays,
//   CheckCircle2,
//   Clock3,
//   Hash,
//   MapPin,
//   Phone,
//   QrCode,
//   Syringe,
//   User,
//   Users,
//   Building2,
//   Map,
//   X,
//   VenusAndMars,
//   Home,
//   AlertCircle,
// } from "lucide-react";
// import { toast } from "sonner";

// import {
//   getZerodose,
//   vaccinatorVisit,
//   vaccinatorCover,
// } from "@/api/zerodoseApi";

// import Loader from "../ui/Loader";
// import Select from "../ui/Select";
// import { formatDate } from "@/lib/formatDate";
// import ApprovalPageHeader from "../ui/ApprovalPageHeader";

// const VISIT_REASONS = [
//   {
//     value: "available",
//     label: "Available",
//   },
//   {
//     value: "refusal",
//     label: "Refusal",
//   },
//   {
//     value: "sick",
//     label: "Sick",
//   },
//   {
//     value: "not_available",
//     label: "Not Available",
//   },
//   {
//     value: "deceased",
//     label: "Deceased",
//   },
// ];

// export default function VaccinatorZerodoseForm({ zerodoseId = null }) {
//   const router = useRouter();

//   const [zerodose, setZerodose] = useState(null);
//   const [checking, setChecking] = useState(true);
//   const [loading, setLoading] = useState(false);

//   const [showVisit, setShowVisit] = useState(false);
//   const [visitReason, setVisitReason] = useState("");

//   const [showScanner, setShowScanner] = useState(false);

//   useEffect(() => {
//     const loadZerodose = async () => {
//       try {
//         setChecking(true);

//         if (!zerodoseId) {
//           toast.error("Invalid Zerodose ID.");
//           router.back();
//           return;
//         }

//         const response = await getZerodose(zerodoseId);

//         const data = response?.data?.data || response?.data || response;

//         if (!data?._id) {
//           toast.error("Zerodose not found.");
//           router.back();
//           return;
//         }

//         setZerodose(data);
//       } catch (error) {
//         console.error("Vaccinator Zerodose load error:", error);

//         toast.error(
//           error?.response?.data?.message ||
//             error?.message ||
//             "Unable to load Zerodose information.",
//         );

//         router.back();
//       } finally {
//         setChecking(false);
//       }
//     };

//     loadZerodose();
//   }, [zerodoseId, router]);

//   // ============================================================
//   // HELPERS
//   // ============================================================

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

//   // ============================================================
//   // VISIT
//   // ============================================================

//   const handleVisit = async () => {
//     if (!zerodoseId) {
//       toast.error("Invalid Zerodose ID.");
//       return;
//     }

//     if (!visitReason) {
//       toast.error("Please select visit status.");
//       return;
//     }

//     try {
//       setLoading(true);

//       await vaccinatorVisit(zerodoseId, {
//         clientStatus: visitReason,
//       });

//       toast.success("Visit recorded successfully.");

//       router.back();
//     } catch (error) {
//       console.error("Vaccinator visit error:", error);

//       toast.error(error?.response?.data?.message || "Failed to record visit.");
//     } finally {
//       setLoading(false);
//     }
//   };

//   // ============================================================
//   // COVER
//   // ============================================================

//   const handleCover = async (scannedValue) => {
//     if (!scannedValue) {
//       toast.error("Invalid QR code.");
//       return;
//     }

//     try {
//       setLoading(true);

//       await vaccinatorCover(zerodoseId, {
//         qrCode: scannedValue,
//       });

//       toast.success("Child covered successfully.");

//       setShowScanner(false);

//       router.back();
//     } catch (error) {
//       console.error("Vaccinator cover error:", error);

//       toast.error(
//         error?.response?.data?.message || "Unable to cover this Zerodose.",
//       );
//     } finally {
//       setLoading(false);
//     }
//   };

//   // ============================================================
//   // LOADING
//   // ============================================================

//   if (checking) {
//     return <VaccinatorPageSkeleton />;
//   }

//   if (!zerodose) {
//     return null;
//   }

//   const status = getStatus();
//   const isCovered = zerodose.vaccinationStatus === "covered";

//   return (
//     <div className="min-h-full">
//       {loading && <Loader text="Processing Zerodose..." />}

//       {/* ========================================================
//           HEADER
//       ======================================================== */}

//       <ApprovalPageHeader
//         title="Zerodose Details"
//         description="Review child details and record vaccination status."
//         onBack={() => router.back()}
//       />

//       <div className="space-y-5">
//         {/* ======================================================
//             SUMMARY
//         ====================================================== */}

//         {/* ======================================================
//             CHILD INFORMATION
//         ====================================================== */}

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

//         {/* ======================================================
//             CAMPAIGN INFORMATION
//         ====================================================== */}

//         <DetailSection
//           icon={CalendarDays}
//           title="Campaign Information"
//           description="Campaign and vaccination recording information."
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

//         {/* ======================================================
//             ASSIGNMENT INFORMATION
//         ====================================================== */}

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

//         {/* ======================================================
//             VISIT STATUS
//         ====================================================== */}

//         {showVisit && !isCovered && (
//           <section className="border-border bg-background overflow-hidden rounded-2xl border shadow-sm">
//             <div className="border-border flex items-center gap-3 border-b p-4 md:p-5">
//               <div className="bg-primary/10 text-primary flex h-10 w-10 shrink-0 items-center justify-center rounded-xl">
//                 <MapPin className="h-5 w-5" />
//               </div>

//               <div className="min-w-0">
//                 <h2 className="text-text font-semibold">Visit Status</h2>

//                 <p className="text-text-secondary mt-0.5 text-xs">
//                   Select the result of today's visit.
//                 </p>
//               </div>
//             </div>

//             <div className="p-4 md:p-5">
//               <Select
//                 label="Visit Status"
//                 name="visitReason"
//                 value={visitReason}
//                 onChange={(e) => setVisitReason(e.target.value)}
//                 options={VISIT_REASONS}
//                 placeholder="Select visit status"
//                 disabled={loading}
//                 required
//               />

//               <div className="mt-5 flex gap-3">
//                 <button
//                   type="button"
//                   onClick={() => {
//                     setShowVisit(false);
//                     setVisitReason("");
//                   }}
//                   disabled={loading}
//                   className="border-border text-text hover:bg-surface flex h-11 flex-1 items-center justify-center rounded-lg border px-4 text-sm font-medium transition disabled:opacity-50"
//                 >
//                   Cancel
//                 </button>

//                 <button
//                   type="button"
//                   onClick={handleVisit}
//                   disabled={loading || !visitReason}
//                   className="bg-primary hover:bg-primary-dark flex h-11 flex-1 items-center justify-center gap-2 rounded-lg px-4 text-sm font-medium text-white transition disabled:cursor-not-allowed disabled:opacity-50"
//                 >
//                   <CheckCircle2 size={17} />
//                   Save Visit
//                 </button>
//               </div>
//             </div>
//           </section>
//         )}

//         {/* ======================================================
//             ACTION BUTTONS
//         ====================================================== */}

//         {!isCovered && !showVisit && (
//           <div className="border-border bg-background grid grid-cols-2 gap-3 rounded-2xl border p-4 shadow-sm sm:p-5">
//             <button
//               type="button"
//               onClick={() => setShowVisit(true)}
//               disabled={loading}
//               className="border-border text-text hover:bg-surface flex h-11 items-center justify-center gap-2 rounded-lg border px-4 text-sm font-medium transition disabled:cursor-not-allowed disabled:opacity-50"
//             >
//               <MapPin size={17} />
//               Visit
//             </button>

//             <button
//               type="button"
//               onClick={() => setShowScanner(true)}
//               disabled={loading}
//               className="bg-primary hover:bg-primary-dark flex h-11 items-center justify-center gap-2 rounded-lg px-4 text-sm font-medium text-white transition disabled:cursor-not-allowed disabled:opacity-50"
//             >
//               <QrCode size={17} />
//               Cover
//             </button>
//           </div>
//         )}
//       </div>

//       {/* ========================================================
//           QR SCANNER
//       ======================================================== */}

//       {showScanner && (
//         <QrScannerModal
//           onClose={() => {
//             if (!loading) {
//               setShowScanner(false);
//             }
//           }}
//           onScan={handleCover}
//           loading={loading}
//         />
//       )}
//     </div>
//   );
// }

// /* ============================================================
//    DETAIL SECTION
// ============================================================ */

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

// /* ============================================================
//    DETAIL ITEM
// ============================================================ */

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

// /* ============================================================
//    LOADING SKELETON
// ============================================================ */

// function VaccinatorPageSkeleton() {
//   return (
//     <div className="min-h-full animate-pulse">
//       {/* Header */}

//       <div className="mb-6 pt-4">
//         <div className="flex items-center gap-3">
//           <div className="bg-surface h-10 w-10 rounded-lg" />

//           <div>
//             <div className="bg-surface h-7 w-52 rounded-lg" />
//             <div className="bg-surface mt-2 h-4 w-72 rounded" />
//           </div>
//         </div>
//       </div>

//       <div className="space-y-5">
//         {/* Summary */}

//         <div className="border-border bg-background rounded-2xl border">
//           <div className="flex items-center gap-4 p-5 md:p-6">
//             <div className="bg-surface h-14 w-14 rounded-2xl" />

//             <div>
//               <div className="bg-surface h-5 w-40 rounded" />
//               <div className="bg-surface mt-2 h-5 w-20 rounded-full" />
//             </div>
//           </div>
//         </div>

//         {/* Sections */}

//         {[1, 2, 3].map((section) => (
//           <div
//             key={section}
//             className="border-border bg-background overflow-hidden rounded-2xl border"
//           >
//             <div className="border-border flex items-center gap-3 border-b p-4 md:p-5">
//               <div className="bg-surface h-10 w-10 rounded-xl" />

//               <div>
//                 <div className="bg-surface h-5 w-36 rounded" />
//                 <div className="bg-surface mt-2 h-3 w-52 rounded" />
//               </div>
//             </div>

//             <div className="grid grid-cols-2 gap-x-10 gap-y-6 p-4 md:p-5">
//               {[1, 2, 3, 4, 5, 6].map((item) => (
//                 <div key={item}>
//                   <div className="bg-surface h-3 w-24 rounded" />
//                   <div className="bg-surface mt-2 h-4 w-32 rounded" />
//                 </div>
//               ))}
//             </div>
//           </div>
//         ))}
//       </div>
//     </div>
//   );
// }

// /* ============================================================
//    QR SCANNER MODAL
// ============================================================ */

// function QrScannerModal({ onClose, onScan, loading }) {
//   const [scannerError, setScannerError] = useState("");

//   useEffect(() => {
//     let scanner = null;
//     let mounted = true;
//     let scanHandled = false;

//     const initScanner = async () => {
//       try {
//         setScannerError("");

//         const { Html5Qrcode, Html5QrcodeSupportedFormats } =
//           await import("html5-qrcode");

//         if (!mounted) {
//           return;
//         }

//         scanner = new Html5Qrcode("vaccinator-qr-reader");

//         await scanner.start(
//           {
//             facingMode: "environment",
//           },
//           {
//             fps: 10,
//             qrbox: {
//               width: 250,
//               height: 250,
//             },
//             aspectRatio: 1,
//             formatsToSupport: [Html5QrcodeSupportedFormats.QR_CODE],
//           },
//           async (decodedText) => {
//             if (scanHandled || !mounted) {
//               return;
//             }

//             scanHandled = true;

//             try {
//               await scanner.stop();
//             } catch (error) {
//               console.error("QR scanner stop error:", error);
//             }

//             if (mounted) {
//               onScan(decodedText);
//             }
//           },
//           () => {
//             // Ignore continuous QR scan failures.
//           },
//         );
//       } catch (error) {
//         console.error("QR scanner initialization error:", error);

//         if (mounted) {
//           setScannerError(
//             "Unable to access camera. Please allow camera permission and try again.",
//           );
//         }
//       }
//     };

//     initScanner();

//     return () => {
//       mounted = false;

//       if (scanner) {
//         scanner
//           .stop()
//           .catch(() => {})
//           .finally(() => {
//             scanner.clear().catch(() => {});
//           });
//       }
//     };
//   }, [onScan]);

//   return (
//     <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
//       <div className="bg-background w-full max-w-md overflow-hidden rounded-xl shadow-2xl">
//         {/* Header */}

//         <div className="border-border flex items-center justify-between border-b p-4">
//           <div>
//             <h3 className="text-text font-semibold">Scan Child QR Code</h3>

//             <p className="text-text-secondary mt-1 text-xs">
//               Scan the QR code attached to this Zerodose record.
//             </p>
//           </div>

//           <button
//             type="button"
//             onClick={onClose}
//             disabled={loading}
//             className="text-text-secondary hover:bg-surface flex h-9 w-9 items-center justify-center rounded-lg transition disabled:opacity-50"
//           >
//             <X size={19} />
//           </button>
//         </div>

//         {/* Scanner */}

//         <div className="p-5">
//           <div className="overflow-hidden rounded-lg bg-black">
//             <div id="vaccinator-qr-reader" className="min-h-[300px] w-full" />
//           </div>

//           {scannerError && (
//             <div className="mt-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-600">
//               {scannerError}
//             </div>
//           )}

//           <div className="bg-surface mt-4 rounded-lg p-3 text-center">
//             <p className="text-text-secondary text-xs">
//               Camera permission is required to scan the QR code.
//             </p>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }


"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Baby,
  CalendarDays,
  CheckCircle2,
  Clock3,
  Hash,
  MapPin,
  Phone,
  QrCode,
  Syringe,
  User,
  Users,
  Building2,
  Map,
  X,
  VenusAndMars,
  Home,
  AlertCircle,
} from "lucide-react";
import { toast } from "sonner";

import {
  getZerodose,
  vaccinatorVisit,
  vaccinatorCover,
} from "@/api/zerodoseApi";

import Loader from "../ui/Loader";
import Select from "../ui/Select";
import { formatDate } from "@/lib/formatDate";
import ApprovalPageHeader from "../ui/ApprovalPageHeader";

const VISIT_REASONS = [
  {
    value: "available",
    label: "Available",
  },
  {
    value: "refusal",
    label: "Refusal",
  },
  {
    value: "sick",
    label: "Sick",
  },
  {
    value: "not_available",
    label: "Not Available",
  },
  {
    value: "deceased",
    label: "Deceased",
  },
];

export default function VaccinatorZerodoseForm({ zerodoseId = null }) {
  const router = useRouter();

  const [zerodose, setZerodose] = useState(null);
  const [checking, setChecking] = useState(true);
  const [loading, setLoading] = useState(false);

  const [showVisit, setShowVisit] = useState(false);
  const [visitReason, setVisitReason] = useState("");

  const [showScanner, setShowScanner] = useState(false);

  // ============================================================
  // LOAD ZERODOSE
  // ============================================================

  useEffect(() => {
    let mounted = true;

    const loadZerodose = async () => {
      try {
        setChecking(true);

        if (!zerodoseId) {
          toast.error("Invalid Zerodose ID.");
          router.back();
          return;
        }

        const response = await getZerodose(zerodoseId);

        const data = response?.data?.data || response?.data || response;

        if (!mounted) {
          return;
        }

        if (!data?._id) {
          toast.error("Zerodose not found.");
          router.back();
          return;
        }

        setZerodose(data);
      } catch (error) {
        console.error("Vaccinator Zerodose load error:", error);

        if (!mounted) {
          return;
        }

        toast.error(
          error?.response?.data?.message ||
            error?.message ||
            "Unable to load Zerodose information.",
        );

        router.back();
      } finally {
        if (mounted) {
          setChecking(false);
        }
      }
    };

    loadZerodose();

    return () => {
      mounted = false;
    };
  }, [zerodoseId, router]);

  // ============================================================
  // HELPERS
  // ============================================================

  const formatGender = (gender) => {
    if (!gender) {
      return "-";
    }

    return gender.charAt(0).toUpperCase() + gender.slice(1);
  };

  const formatClientStatus = (status) => {
    if (!status) {
      return "-";
    }

    return status
      .replaceAll("_", " ")
      .replace(/\b\w/g, (char) => char.toUpperCase());
  };

  const formatValue = (value) => {
    if (value === null || value === undefined || value === "") {
      return "-";
    }

    return value;
  };

  const getStatus = () => {
    if (zerodose?.vaccinationStatus === "covered") {
      return {
        label: "Covered",
        className:
          "bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400",
      };
    }

    if (zerodose?.vaccinationStatus === "visited") {
      return {
        label: "Visited",
        className:
          "bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400",
      };
    }

    return {
      label: "Recorded",
      className:
        "bg-orange-100 text-orange-700 dark:bg-orange-900/20 dark:text-orange-400",
    };
  };

  // ============================================================
  // VISIT
  // ============================================================

  const handleVisit = async () => {
    if (!zerodoseId) {
      toast.error("Invalid Zerodose ID.");
      return;
    }

    if (!visitReason) {
      toast.error("Please select visit status.");
      return;
    }

    if (zerodose?.vaccinationStatus === "covered") {
      toast.error("This child has already been covered.");
      return;
    }

    try {
      setLoading(true);

      // IMPORTANT:
      // vaccinatorVisit expects:
      // vaccinatorVisit(zerodoseId, clientStatus)

      await vaccinatorVisit(zerodoseId, visitReason);

      toast.success("Visit recorded successfully.");

      router.back();
    } catch (error) {
      console.error("Vaccinator visit error:", error);

      toast.error(
        error?.response?.data?.message ||
          error?.message ||
          "Failed to record visit.",
      );
    } finally {
      setLoading(false);
    }
  };

  // ============================================================
  // COVER
  // ============================================================

  const handleCover = useCallback(
    async (scannedValue) => {
      if (!scannedValue) {
        toast.error("Invalid QR code.");
        return;
      }

      if (!zerodoseId) {
        toast.error("Invalid Zerodose ID.");
        return;
      }

      if (zerodose?.vaccinationStatus === "covered") {
        toast.error("This child has already been covered.");
        setShowScanner(false);
        return;
      }

      try {
        setLoading(true);

        // IMPORTANT:
        // vaccinatorCover expects:
        // vaccinatorCover(zerodoseId, qrCode)

        await vaccinatorCover(zerodoseId, scannedValue);

        toast.success("Child covered successfully.");

        setShowScanner(false);

        router.back();
      } catch (error) {
        console.error("Vaccinator cover error:", error);

        toast.error(
          error?.response?.data?.message ||
            error?.message ||
            "Unable to cover this Zerodose.",
        );
      } finally {
        setLoading(false);
      }
    },
    [zerodoseId, zerodose?.vaccinationStatus, router],
  );

  // ============================================================
  // LOADING
  // ============================================================

  if (checking) {
    return <VaccinatorPageSkeleton />;
  }

  if (!zerodose) {
    return null;
  }

  const status = getStatus();
  const isCovered = zerodose.vaccinationStatus === "covered";

  return (
    <div className="min-h-full">
      {loading && <Loader text="Processing Zerodose..." />}

      {/* ========================================================
          HEADER
      ======================================================== */}

      <ApprovalPageHeader
        title="Zerodose Details"
        description="Review child details and record vaccination status."
        onBack={() => router.back()}
      />

      <div className="space-y-5">
        {/* ======================================================
            CHILD INFORMATION
        ====================================================== */}

        <DetailSection
          icon={Baby}
          title="Child Information"
          description="Basic information about the child."
        >
          <DetailItem
            icon={User}
            label="Child Name"
            value={zerodose.childName}
          />

          <DetailItem
            icon={User}
            label="Father Name"
            value={zerodose.fatherName}
          />

          <DetailItem
            icon={VenusAndMars}
            label="Gender"
            value={formatGender(zerodose.gender)}
          />

          <DetailItem
            icon={Baby}
            label="Age"
            value={
              zerodose.age !== undefined && zerodose.age !== null
                ? `${zerodose.age} months`
                : "-"
            }
          />

          <DetailItem
            icon={Home}
            label="House Number"
            value={formatValue(zerodose.houseNumber)}
          />

          <DetailItem
            icon={Phone}
            label="Contact Number"
            value={zerodose.contactNo}
          />

          <DetailItem
            icon={MapPin}
            label="Address"
            value={zerodose.address}
          />

          {zerodose.location?.latitude != null &&
            zerodose.location?.longitude != null && (
              <div className="md:col-span-2">
                <a
                  href={`https://www.google.com/maps?q=${zerodose.location.latitude},${zerodose.location.longitude}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:text-primary-dark inline-flex items-center gap-2 text-sm font-medium"
                >
                  <MapPin className="h-4 w-4" />
                  Open Location in Google Maps
                </a>
              </div>
            )}
        </DetailSection>

        {/* ======================================================
            CAMPAIGN INFORMATION
        ====================================================== */}

        <DetailSection
          icon={CalendarDays}
          title="Campaign Information"
          description="Campaign and vaccination recording information."
        >
          <DetailItem
            icon={CalendarDays}
            label="Campaign"
            value={zerodose.campaign?.name}
          />

          <DetailItem
            icon={Hash}
            label="Campaign Year"
            value={zerodose.campaign?.year}
          />

          <DetailItem
            icon={CalendarDays}
            label="Campaign Month"
            value={zerodose.campaign?.month}
          />

          <DetailItem
            icon={Hash}
            label="Campaign Day"
            value={
              zerodose.day !== undefined && zerodose.day !== null
                ? `Day ${zerodose.day}`
                : "-"
            }
          />

          <DetailItem
            icon={Clock3}
            label="Record Date"
            value={formatDate(zerodose.recordDate)}
          />

          <DetailItem
            icon={CalendarDays}
            label="Visit Date"
            value={formatDate(zerodose.visitDate)}
          />

          <DetailItem
            icon={CalendarDays}
            label="Covered Date"
            value={formatDate(zerodose.coveredDate)}
          />

          <DetailItem
            icon={Syringe}
            label="Vaccination Status"
            value={status.label}
          />

          <DetailItem
            icon={AlertCircle}
            label="Client Status"
            value={formatClientStatus(zerodose.clientStatus)}
          />

          <DetailItem
            icon={QrCode}
            label="QR Code"
            value={formatValue(zerodose.qrCode)}
          />
        </DetailSection>

        {/* ======================================================
            ASSIGNMENT INFORMATION
        ====================================================== */}

        <DetailSection
          icon={Users}
          title="Assignment Information"
          description="Administrative and team assignment details."
        >
          <DetailItem
            icon={Building2}
            label="District"
            value={zerodose.district?.name}
          />

          <DetailItem
            icon={Map}
            label="Town"
            value={zerodose.town?.name}
          />

          <DetailItem
            icon={MapPin}
            label="Union Council"
            value={zerodose.unionCouncil?.name}
          />

          <DetailItem
            icon={User}
            label="UCMO"
            value={zerodose.ucmo?.name}
          />

          <DetailItem
            icon={User}
            label="Supervisor"
            value={zerodose.supervisor?.name}
          />

          <DetailItem
            icon={Users}
            label="Team Number"
            value={zerodose.teamNumber}
          />

          <DetailItem
            icon={User}
            label="Recorded By"
            value={zerodose.user?.name}
          />

          <DetailItem
            icon={User}
            label="Team Leader"
            value={zerodose.teamLeader?.name}
          />

          <DetailItem
            icon={User}
            label="Team Member"
            value={zerodose.teamMember?.name}
          />

          <DetailItem
            icon={Syringe}
            label="Vaccinator"
            value={zerodose.vaccinator?.name}
          />
        </DetailSection>

        {/* ======================================================
            VISIT STATUS
        ====================================================== */}

        {showVisit && !isCovered && (
          <section className="border-border bg-background overflow-hidden rounded-2xl border shadow-sm">
            <div className="border-border flex items-center gap-3 border-b p-4 md:p-5">
              <div className="bg-primary/10 text-primary flex h-10 w-10 shrink-0 items-center justify-center rounded-xl">
                <MapPin className="h-5 w-5" />
              </div>

              <div className="min-w-0">
                <h2 className="text-text font-semibold">Visit Status</h2>

                <p className="text-text-secondary mt-0.5 text-xs">
                  Select the result of today's visit.
                </p>
              </div>
            </div>

            <div className="p-4 md:p-5">
              <Select
                label="Visit Status"
                name="visitReason"
                value={visitReason}
                onChange={(e) => setVisitReason(e.target.value)}
                options={VISIT_REASONS}
                placeholder="Select visit status"
                disabled={loading}
                required
              />

              <div className="mt-5 flex gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowVisit(false);
                    setVisitReason("");
                  }}
                  disabled={loading}
                  className="border-border text-text hover:bg-surface flex h-11 flex-1 items-center justify-center rounded-lg border px-4 text-sm font-medium transition disabled:opacity-50"
                >
                  Cancel
                </button>

                <button
                  type="button"
                  onClick={handleVisit}
                  disabled={loading || !visitReason}
                  className="bg-primary hover:bg-primary-dark flex h-11 flex-1 items-center justify-center gap-2 rounded-lg px-4 text-sm font-medium text-white transition disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <CheckCircle2 size={17} />
                  Save Visit
                </button>
              </div>
            </div>
          </section>
        )}

        {/* ======================================================
            ACTION BUTTONS
        ====================================================== */}

        {!isCovered && !showVisit && (
          <div className="border-border bg-background grid grid-cols-2 gap-3 rounded-2xl border p-4 shadow-sm sm:p-5">
            <button
              type="button"
              onClick={() => setShowVisit(true)}
              disabled={loading}
              className="border-border text-text hover:bg-surface flex h-11 items-center justify-center gap-2 rounded-lg border px-4 text-sm font-medium transition disabled:cursor-not-allowed disabled:opacity-50"
            >
              <MapPin size={17} />
              Visit
            </button>

            <button
              type="button"
              onClick={() => setShowScanner(true)}
              disabled={loading}
              className="bg-primary hover:bg-primary-dark flex h-11 items-center justify-center gap-2 rounded-lg px-4 text-sm font-medium text-white transition disabled:cursor-not-allowed disabled:opacity-50"
            >
              <QrCode size={17} />
              Cover
            </button>
          </div>
        )}
      </div>

      {/* ========================================================
          QR SCANNER
      ======================================================== */}

      {showScanner && (
        <QrScannerModal
          onClose={() => {
            if (!loading) {
              setShowScanner(false);
            }
          }}
          onScan={handleCover}
          loading={loading}
        />
      )}
    </div>
  );
}

/* ============================================================
   DETAIL SECTION
============================================================ */

function DetailSection({ icon: Icon, title, description, children }) {
  return (
    <section className="border-border bg-background overflow-hidden rounded-2xl border shadow-sm">
      <div className="border-border flex items-center gap-3 border-b p-4 md:p-5">
        <div className="bg-primary/10 text-primary flex h-10 w-10 shrink-0 items-center justify-center rounded-xl">
          <Icon className="h-5 w-5" />
        </div>

        <div className="min-w-0">
          <h2 className="text-text font-semibold">{title}</h2>

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

/* ============================================================
   DETAIL ITEM
============================================================ */

function DetailItem({ icon: Icon, label, value }) {
  const displayValue =
    typeof value === "number" && value >= 0 && value < 10
      ? `0${value}`
      : value !== null && value !== undefined && value !== ""
        ? value
        : "-";

  return (
    <div>
      <div className="text-text-secondary flex items-center gap-1.5 text-xs">
        {Icon && <Icon className="h-3.5 w-3.5 shrink-0" />}

        <span>{label}</span>
      </div>

      <p className="text-text mt-1.5 break-words text-sm font-medium capitalize">
        {displayValue}
      </p>
    </div>
  );
}

/* ============================================================
   LOADING SKELETON
============================================================ */

function VaccinatorPageSkeleton() {
  return (
    <div className="min-h-full animate-pulse">
      {/* Header */}

      <div className="mb-6 pt-4">
        <div className="flex items-center gap-3">
          <div className="bg-surface h-10 w-10 rounded-lg" />

          <div>
            <div className="bg-surface h-7 w-52 rounded-lg" />

            <div className="bg-surface mt-2 h-4 w-72 rounded" />
          </div>
        </div>
      </div>

      <div className="space-y-5">
        {/* Child Information */}

        <div className="border-border bg-background overflow-hidden rounded-2xl border">
          <div className="border-border flex items-center gap-3 border-b p-4 md:p-5">
            <div className="bg-surface h-10 w-10 rounded-xl" />

            <div>
              <div className="bg-surface h-5 w-36 rounded" />

              <div className="bg-surface mt-2 h-3 w-52 rounded" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-x-10 gap-y-6 p-4 md:p-5">
            {[1, 2, 3, 4, 5, 6].map((item) => (
              <div key={item}>
                <div className="bg-surface h-3 w-24 rounded" />

                <div className="bg-surface mt-2 h-4 w-32 rounded" />
              </div>
            ))}
          </div>
        </div>

        {/* Campaign Information */}

        <div className="border-border bg-background overflow-hidden rounded-2xl border">
          <div className="border-border flex items-center gap-3 border-b p-4 md:p-5">
            <div className="bg-surface h-10 w-10 rounded-xl" />

            <div>
              <div className="bg-surface h-5 w-40 rounded" />

              <div className="bg-surface mt-2 h-3 w-56 rounded" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-x-10 gap-y-6 p-4 md:p-5">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((item) => (
              <div key={item}>
                <div className="bg-surface h-3 w-24 rounded" />

                <div className="bg-surface mt-2 h-4 w-32 rounded" />
              </div>
            ))}
          </div>
        </div>

        {/* Assignment Information */}

        <div className="border-border bg-background overflow-hidden rounded-2xl border">
          <div className="border-border flex items-center gap-3 border-b p-4 md:p-5">
            <div className="bg-surface h-10 w-10 rounded-xl" />

            <div>
              <div className="bg-surface h-5 w-44 rounded" />

              <div className="bg-surface mt-2 h-3 w-60 rounded" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-x-10 gap-y-6 p-4 md:p-5">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((item) => (
              <div key={item}>
                <div className="bg-surface h-3 w-24 rounded" />

                <div className="bg-surface mt-2 h-4 w-32 rounded" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ============================================================
   QR SCANNER MODAL
============================================================ */

function QrScannerModal({ onClose, onScan, loading }) {
  const [scannerError, setScannerError] = useState("");

  useEffect(() => {
    let scanner = null;
    let mounted = true;
    let scanHandled = false;

    const initScanner = async () => {
      try {
        setScannerError("");

        const { Html5Qrcode, Html5QrcodeSupportedFormats } =
          await import("html5-qrcode");

        if (!mounted) {
          return;
        }

        scanner = new Html5Qrcode("vaccinator-qr-reader");

        await scanner.start(
          {
            facingMode: "environment",
          },
          {
            fps: 10,
            qrbox: {
              width: 250,
              height: 250,
            },
            aspectRatio: 1,
            formatsToSupport: [Html5QrcodeSupportedFormats.QR_CODE],
          },
          async (decodedText) => {
            if (scanHandled || !mounted) {
              return;
            }

            scanHandled = true;

            try {
              await scanner.stop();
            } catch (error) {
              console.error("QR scanner stop error:", error);
            }

            if (mounted) {
              onScan(decodedText);
            }
          },
          () => {
            // Ignore continuous QR scan failures.
          },
        );
      } catch (error) {
        console.error("QR scanner initialization error:", error);

        if (mounted) {
          setScannerError(
            "Unable to access camera. Please allow camera permission and try again.",
          );
        }
      }
    };

    initScanner();

    return () => {
      mounted = false;

      if (scanner) {
        scanner
          .stop()
          .catch(() => {})
          .finally(() => {
            scanner.clear().catch(() => {});
          });
      }
    };
  }, [onScan]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
      <div className="bg-background w-full max-w-md overflow-hidden rounded-xl shadow-2xl">
        {/* Header */}

        <div className="border-border flex items-center justify-between border-b p-4">
          <div>
            <h3 className="text-text font-semibold">Scan Child QR Code</h3>

            <p className="text-text-secondary mt-1 text-xs">
              Scan the QR code attached to this Zerodose record.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="text-text-secondary hover:bg-surface flex h-9 w-9 items-center justify-center rounded-lg transition disabled:opacity-50"
          >
            <X size={19} />
          </button>
        </div>

        {/* Scanner */}

        <div className="p-5">
          <div className="overflow-hidden rounded-lg bg-black">
            <div
              id="vaccinator-qr-reader"
              className="min-h-[300px] w-full"
            />
          </div>

          {scannerError && (
            <div className="mt-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-600">
              {scannerError}
            </div>
          )}

          <div className="bg-surface mt-4 rounded-lg p-3 text-center">
            <p className="text-text-secondary text-xs">
              Camera permission is required to scan the QR code.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}