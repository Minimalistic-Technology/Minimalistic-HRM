import Cookies from "js-cookie";
import { Location } from "../types";

export const getAuthToken = (): string | null => {
  return Cookies.get("token") || null;
};

export const formatTime = (date: Date): string => {
  return date.toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
    timeZone: "Asia/Kolkata",
  });
};

export const formatDate = (date: Date): string => {
  return date.toLocaleDateString("en-IN", {
    year: "numeric",
    month: "short",
    day: "numeric",
    timeZone: "Asia/Kolkata",
  });
};

export const getUserLocationDetails = async () => {
  return new Promise<Location>((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error("Geolocation is not supported by this browser."));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        resolve({ lat: latitude, lon: longitude });

      },
      (error) => {
        reject(error);
      }
    );
  });
};


