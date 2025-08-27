export const getAuthToken = (): string | null => {
    if (typeof window === "undefined") return null;
    return localStorage.getItem("token");
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

  export   const getUserLocationDetails = async (): Promise<object> => {
      try {
        const ipRes = await fetch("https://api.ipify.org?format=json");
        const { ip } = await ipRes.json();
  
        // Get location from IP
        const geoRes = await fetch(`https://ipapi.co/${ip}/json/`);
        const { city, region: state, country } = await geoRes.json();
  
        // console.log(location)
        return { city, ip, state, country };
      } catch (error) {
        console.warn("Failed to get real IP, using fallback:", error);
        return { ip: "127.0.0.1" };
      }
    };