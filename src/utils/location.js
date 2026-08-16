export const getCurrentLocation = () => {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error("Location is not supported by this browser/device."));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
      },
      (error) => {
        console.error("Geolocation error:", error);

        switch (error.code) {
          case error.PERMISSION_DENIED:
            reject(new Error("Location permission is required for workers."));
            break;

          case error.POSITION_UNAVAILABLE:
            reject(new Error("Unable to determine your current location."));
            break;

          case error.TIMEOUT:
            reject(new Error("Location request timed out. Please try again."));
            break;

          default:
            reject(new Error("Unable to get your current location."));
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 20000,
        maximumAge: 0,
      },
    );
  });
};
