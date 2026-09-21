// // "use client";

// // import { useEffect, useState } from "react";

// // import { getVaccinatorTotalSummary } from "@/api/dashboardApi";

// // import VaccinatorSummaryCards from "@/components/vaccinator/VaccinatorSummaryCards";
// // import VaccinatorActions from "@/components/vaccinator/VaccinatorActions";
// // import VaccinatorCampaignSection from "@/components/vaccinator/VaccinatorCampaignSection";
// // import { useTabLoader } from "@/context/TabLoaderContext";

// // export default function VaccinatorPage() {
// //   const { showTabLoader, hideTabLoader } = useTabLoader();
// //   const [authUser, setAuthUser] = useState(null);

// //   const [summary, setSummary] = useState({
// //     recordCount: 0,
// //     visitCount: 0,
// //     coveredCount: 0,
// //   });

// //   const [loading, setLoading] = useState(true);

// //   useEffect(() => {
// //     let cancelled = false;

// //     const loadVaccinatorSummary = async () => {
// //       try {
// //         setLoading(true);
// //         showTabLoader();
// //         const response = await getVaccinatorTotalSummary();

// //         if (cancelled) {
// //           return;
// //         }

// //         if (!response?.success) {
// //           setSummary({
// //             recordCount: 0,
// //             visitCount: 0,
// //             coveredCount: 0,
// //           });

// //           return;
// //         }

// //         const data = response?.data || {};

// //         const nextSummary = {
// //           recordCount: Number(data?.recordCount ?? 0),

// //           visitCount: Number(data?.visitCount ?? 0),

// //           coveredCount: Number(data?.coveredCount ?? 0),
// //         };

// //         setSummary(nextSummary);
// //       } catch (error) {
// //         if (cancelled) {
// //           return;
// //         }

// //         // console.error("Failed to fetch vaccinator total summary:", error);

// //         setSummary({
// //           recordCount: 0,
// //           visitCount: 0,
// //           coveredCount: 0,
// //         });
// //       } finally {
// //         if (!cancelled) {
// //           setLoading(false);
// //           hideTabLoader();
// //         }
// //       }
// //     };

// //     loadVaccinatorSummary();

// //     return () => {
// //       cancelled = true;
// //     };
// //   }, []);

// //   return (
// //     <div className="w-full space-y-6">
// //       <VaccinatorSummaryCards
// //         recordedZerodose={summary.recordCount}
// //         visitedZerodose={summary.visitCount}
// //         coveredZerodose={summary.coveredCount}
// //         loading={loading}
// //       />

// //       <VaccinatorActions />

// //       <VaccinatorCampaignSection />
// //     </div>
// //   );
// // }

// "use client";

// import { useEffect, useState } from "react";

// import { getVaccinatorTotalSummary } from "@/api/dashboardApi";

// import VaccinatorActions from "@/components/vaccinator/VaccinatorActions";
// import VaccinatorCampaignSection from "@/components/vaccinator/VaccinatorCampaignSection";
// import { useTabLoader } from "@/context/TabLoaderContext";
// import ZerodoseStats from "@/components/worker/ZerodoseStats";

// export default function VaccinatorPage() {
//   const { showTabLoader, hideTabLoader } = useTabLoader();
//   const [loading, setLoading] = useState(true);

//   const [authUser, setAuthUser] = useState(null);

//   const [summary, setSummary] = useState({
//     recordCount: 0,
//     visitCount: 0,
//     coveredCount: 0,
//   });

//   useEffect(() => {
//     let cancelled = false;

//     const loadVaccinatorSummary = async () => {
//       try {
//         setLoading(true);
//         showTabLoader();

//         // --------------------------------------------------------
//         // AUTH USER
//         // --------------------------------------------------------

//         let storedAuthUser = {};

//         try {
//           storedAuthUser = JSON.parse(localStorage.getItem("authUser") || "{}");
//         } catch (error) {
//           console.error("Failed to parse authUser:", error);
//         }
//         console.log("authUser", storedAuthUser);
//         if (!cancelled) {
//           setAuthUser(storedAuthUser);
//         }

//         // --------------------------------------------------------
//         // VACCINATOR SUMMARY
//         // --------------------------------------------------------

//         const response = await getVaccinatorTotalSummary();

//         if (cancelled) {
//           return;
//         }

//         if (!response?.success) {
//           setSummary({
//             recordCount: 0,
//             visitCount: 0,
//             coveredCount: 0,
//           });

//           return;
//         }

//         const data = response?.data || {};

//         const nextSummary = {
//           recordCount: Number(data?.recordCount ?? 0),
//           visitCount: Number(data?.visitCount ?? 0),
//           coveredCount: Number(data?.coveredCount ?? 0),
//         };

//         setSummary(nextSummary);
//       } catch (error) {
//         if (cancelled) {
//           return;
//         }

//         setSummary({
//           recordCount: 0,
//           visitCount: 0,
//           coveredCount: 0,
//         });
//       } finally {
//         if (!cancelled) {
//           setLoading(false);
//           hideTabLoader();
//         }
//       }
//     };

//     loadVaccinatorSummary();

//     return () => {
//       cancelled = true;
//     };
//   }, []);

//   return (
//   <div className="min-h-full">

//      <ZerodoseStats summary={summary} loading={loading} />
//       <VaccinatorActions />
//       <VaccinatorCampaignSection authUser={authUser} />
//     </div>
//   );
// }


"use client";

import { useEffect, useState } from "react";

import { getVaccinatorTotalSummary } from "@/api/dashboardApi";

import VaccinatorActions from "@/components/vaccinator/VaccinatorActions";
import VaccinatorCampaignSection from "@/components/vaccinator/VaccinatorCampaignSection";
import { useTabLoader } from "@/context/TabLoaderContext";
import ZerodoseStats from "@/components/worker/ZerodoseStats";

export default function VaccinatorPage() {
  const { showTabLoader, hideTabLoader } = useTabLoader();

  const [loading, setLoading] = useState(true);
  const [authUser, setAuthUser] = useState(null);

  const [summary, setSummary] = useState({
    recorded: 0,
    visited: 0,
    covered: 0,
  });

  useEffect(() => {
    let cancelled = false;

    const loadVaccinatorSummary = async () => {
      try {
        setLoading(true);
        showTabLoader();

        // --------------------------------------------------------
        // AUTH USER
        // --------------------------------------------------------

        let storedAuthUser = {};

        try {
          storedAuthUser = JSON.parse(localStorage.getItem("authUser") || "{}");
        } catch (error) {
          console.error("Failed to parse authUser:", error);
        }

        console.log("authUser", storedAuthUser);

        if (!cancelled) {
          setAuthUser(storedAuthUser);
        }

        // --------------------------------------------------------
        // VACCINATOR SUMMARY
        // --------------------------------------------------------

        const response = await getVaccinatorTotalSummary();

        console.log("Response", response);

        if (cancelled) {
          return;
        }

        if (!response?.success) {
          setSummary({
            recorded: 0,
            visited: 0,
            covered: 0,
          });

          return;
        }

        const data = response?.data || {};

        const nextSummary = {
          recorded: Number(data?.recordCount ?? 0),
          visited: Number(data?.visitCount ?? 0),
          covered: Number(data?.coveredCount ?? 0),
        };

        console.log("Vaccinator Zerodose Summary:", nextSummary);

        setSummary(nextSummary);
      } catch (error) {
        if (cancelled) {
          return;
        }

        console.error("Vaccinator summary fetch error:", error);

        setSummary({
          recorded: 0,
          visited: 0,
          covered: 0,
        });
      } finally {
        if (!cancelled) {
          setLoading(false);
          hideTabLoader();
        }
      }
    };

    loadVaccinatorSummary();

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="min-h-full">
      <ZerodoseStats summary={summary} loading={loading} />

      <VaccinatorActions />

      <VaccinatorCampaignSection authUser={authUser} />
    </div>
  );
}
