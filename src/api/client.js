import axios from "axios";

const API_URLS = [
  "http://192.168.100.12:3000",
  "http://10.137.120.208:3000",
  "http://10.73.147.208:3000",
  "http://localhost:3000",
];

let activeBaseURL = null;

// ============================================================
// Detect API URL
// ============================================================

export const detectApiURL = async () => {
  if (activeBaseURL) {
    return activeBaseURL;
  }

  for (const url of API_URLS) {
    try {
      const response = await axios.get(`${url}/api/health`, {
        timeout: 2000,
      });

      if (response.status >= 200 && response.status < 300) {
        activeBaseURL = `${url}/api`;

        // console.log("Active API:", activeBaseURL);

        return activeBaseURL;
      }
    } catch {
      console.log("API unavailable:", url);
    }
  }

  throw new Error(
    "Unable to connect to the server. Please check your internet connection and try again.",
  );
};

// ============================================================
// Axios
// ============================================================

export const api = axios.create({
  headers: {
    "Content-Type": "application/json",
  },
});

// ============================================================
// Request Interceptor
// ============================================================

api.interceptors.request.use(
  async (config) => {
    config.baseURL = await detectApiURL();

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
          console.error("Invalid authUser data:", error);
        }
      }
    }

    return config;
  },
  (error) => Promise.reject(error),
);
