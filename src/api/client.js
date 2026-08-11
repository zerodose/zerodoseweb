import axios from "axios";

const API_URLS = [
  "http://192.168.100.12:3000",
  "http://10.137.120.208:3000",
  "http://localhost:3000",
];

let activeBaseURL = null;

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

        console.log("Active API:", activeBaseURL);

        return activeBaseURL;
      }
    } catch {
      console.log("API unavailable:", url);
    }
  }

  throw new Error("No working API server found.");
};

export const api = axios.create({
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use(async (config) => {
  config.baseURL = await detectApiURL();

  return config;
});
