//   import axios from "axios";

// const API_URLS = [
//   "http://192.168.100.12:3000",
//   "https://zerodoseweb.vercel.app",
//   "http://10.137.120.208:3000",
//   "http://10.244.166.208:3000",
//   "http://10.73.147.208:3000",
//   "http://192.168.1.14:3000",
//   "http://localhost:3000",
// ];

// let activeBaseURL = null;
// let detectionPromise = null;

// // ============================================================
// // Detect API URL
// // ============================================================

// export const detectApiURL = async () => {
//   // Already detected
//   if (activeBaseURL) {
//     return activeBaseURL;
//   }

//   // Detection already running
//   if (detectionPromise) {
//     return detectionPromise;
//   }

//   detectionPromise = (async () => {
//     for (const url of API_URLS) {
//       try {
//         const response = await axios.get(`${url}/api/health`, {
//           timeout: 2000,
//         });

//         if (response.status >= 200 && response.status < 300) {
//           activeBaseURL = `${url}/api`;

//           console.log("Active API:", activeBaseURL);

//           return activeBaseURL;
//         }
//       } catch {
//         console.log("API unavailable:", url);
//       }
//     }

//     throw new Error(
//       "Unable to connect to the server. Please check your internet connection and try again.",
//     );
//   })();

//   try {
//     return await detectionPromise;
//   } finally {
//     detectionPromise = null;
//   }
// };

// // ============================================================
// // Axios
// // ============================================================

// export const api = axios.create({
//   headers: {
//     "Content-Type": "application/json",
//   },
//   withCredentials: true,
// });

// // ============================================================
// // Request Interceptor
// // ============================================================

// api.interceptors.request.use(
//   async (config) => {
//     config.baseURL = await detectApiURL();

//     return config;
//   },
//   (error) => Promise.reject(error),
// );

// // import axios from "axios";

// // // =====================================================
// // // API URLs
// // // =====================================================

// // // const API_URLS = (process.env.NEXT_PUBLIC_API_URLS || "")
// // //   .split(",")
// // //   .map((url) => url.trim().replace(/\/+$/, ""))
// // //   .filter(Boolean);

// // const API_URLS = [
// //   "http://192.168.100.12:3000",
// //   "https://zerodoseweb.vercel.app",
// //   "http://10.137.120.208:3000",
// //   "http://10.244.166.208:3000",
// //   "http://10.73.147.208:3000",
// //   "http://192.168.1.14:3000",
// //   "http://localhost:3000",
// // ];

// // // =====================================================
// // // Active API
// // // =====================================================

// // let activeBaseURL = null;
// // let detectionPromise = null;

// // // =====================================================
// // // Detect Available API
// // // =====================================================

// // export const detectApiURL = async () => {
// //   // Already connected
// //   if (activeBaseURL) {
// //     return activeBaseURL;
// //   }

// //   // Prevent multiple simultaneous detection requests
// //   if (detectionPromise) {
// //     return detectionPromise;
// //   }

// //   detectionPromise = (async () => {
// //     for (const url of API_URLS) {
// //       try {
// //         console.log("🔄 Checking API:", url);

// //         const response = await axios.get(`${url}/api/health`, {
// //           timeout: 3000,
// //         });

// //         if (response.status >= 200 && response.status < 300) {
// //           activeBaseURL = `${url}/api`;

// //           console.log("✅ Active API:", activeBaseURL);

// //           return activeBaseURL;
// //         }
// //       } catch (error) {
// //         console.log("❌ API unavailable:", url);
// //       }
// //     }

// //     throw new Error(
// //       "Unable to connect to any Zerodose server. Please check your network or server.",
// //     );
// //   })();

// //   try {
// //     return await detectionPromise;
// //   } finally {
// //     detectionPromise = null;
// //   }
// // };

// // // =====================================================
// // // Axios Instance
// // // =====================================================

// // export const api = axios.create({
// //   headers: {
// //     "Content-Type": "application/json",
// //   },
// //   withCredentials: true,
// // });

// // // =====================================================
// // // Request Interceptor
// // // =====================================================

// // api.interceptors.request.use(
// //   async (config) => {
// //     /*
// //      * =================================================
// //      * Browser
// //      * =================================================
// //      */

// //     if (typeof window !== "undefined") {
// //       config.baseURL = await detectApiURL();

// //       const authUser = localStorage.getItem("authUser");

// //       if (authUser) {
// //         try {
// //           const user = JSON.parse(authUser);

// //           if (user?.id) {
// //             config.headers = config.headers || {};
// //             config.headers["x-user-id"] = user.id;
// //           }
// //         } catch (error) {
// //           console.error("Invalid authUser:", error);
// //         }
// //       }

// //       return config;
// //     }

// //     /*
// //      * =================================================
// //      * Server / Next.js Server Components
// //      * =================================================
// //      */

// //     const serverURL =
// //       process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

// //     config.baseURL = `${serverURL.replace(/\/+$/, "")}/api`;

// //     return config;
// //   },

// //   (error) => Promise.reject(error),
// // );

import axios from "axios";

// ============================================================
// API URLs
// ============================================================
//
// Production API
// Local development APIs
//
// ============================================================

const API_URLS = [
  // Production
  "https://zerodoseweb.vercel.app",

  // Local Network
  "http://192.168.100.12:3000",
  // "http://10.137.120.208:3000",
  "http://10.244.166.208:3000",
  // "http://10.73.147.208:3000",
  // "http://192.168.1.14:3000",

  // Localhost
  // "http://localhost:3000",
];

// ============================================================
// Active API
// ============================================================

let activeBaseURL = null;
let detectionPromise = null;

// ============================================================
// Detect API URL
// ============================================================

export const detectApiURL = async () => {
  // Already detected
  if (activeBaseURL) {
    return activeBaseURL;
  }

  // Prevent duplicate detection requests
  if (detectionPromise) {
    return detectionPromise;
  }

  detectionPromise = (async () => {
    for (const url of API_URLS) {
      try {
        console.log("Checking API:", url);

        const response = await axios.get(`${url}/api/health`, {
          timeout: 3000,
        });

        if (response.status >= 200 && response.status < 300) {
          activeBaseURL = `${url}/api`;

          console.log("Active API:", activeBaseURL);

          return activeBaseURL;
        }
      } catch (error) {
        console.log("API unavailable:", url);
      }
    }

    throw new Error(
      "Unable to connect to any Zerodose server. Please check your network or server.",
    );
  })();

  try {
    return await detectionPromise;
  } finally {
    detectionPromise = null;
  }
};

// ============================================================
// Axios Instance
// ============================================================

export const api = axios.create({
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});

// ============================================================
// Request Interceptor
// ============================================================

api.interceptors.request.use(
  async (config) => {
    // ========================================================
    // Detect Active API
    // ========================================================

    config.baseURL = await detectApiURL();

    // ========================================================
    // Auth User
    // ========================================================

    if (typeof window !== "undefined") {
      const authUser = localStorage.getItem("authUser");

      if (authUser) {
        try {
          const user = JSON.parse(authUser);

          if (user?.id) {
            config.headers = config.headers || {};
            config.headers["x-user-id"] = user.id;
          }
        } catch (error) {
          console.error("Invalid authUser:", error);
        }
      }
    }

    return config;
  },

  (error) => Promise.reject(error),
);
