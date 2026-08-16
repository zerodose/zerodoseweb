export const requestLocationPermission = () => {
  return new Promise((resolve, reject) => {
    console.log("LOCATION: request started");

    if (!navigator.geolocation) {
      console.log("LOCATION: geolocation NOT supported");

      reject(new Error("Location is not supported by this browser/device."));

      return;
    }

    console.log("LOCATION: geolocation supported");
    console.log("LOCATION: calling getCurrentPosition...");

    navigator.geolocation.getCurrentPosition(
      (position) => {
        console.log("LOCATION: permission granted");

        localStorage.setItem("locationPermission", "granted");

        resolve({
          granted: true,
        });
      },

      (error) => {
        console.log("LOCATION ERROR:", error);
        console.log("LOCATION ERROR CODE:", error.code);

        if (error.code === error.PERMISSION_DENIED) {
          localStorage.setItem("locationPermission", "denied");

          reject(new Error("Location permission is required for workers."));

          return;
        }

        reject(new Error("Location permission could not be verified."));
      },

      {
        enableHighAccuracy: false,
        timeout: 10000,
        maximumAge: Infinity,
      },
    );
  });
};
