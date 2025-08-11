
"use client";
import React, { useState, useEffect, useRef } from "react";
import { Clock, LogIn, LogOut, History, User as UserIcon, Calendar, MapPin, Navigation, RefreshCw } from "lucide-react";
import axios, { AxiosError } from "axios";

// Define interfaces
interface AttendanceRecord {
  id: string;
  date: string;
  checkIn: string;
  checkOut: string;
  duration: string;
  location: string;
}

interface CurrentSession {
  id: string;
  checkInTime: Date;
  date: string;
  location: string;
}

interface Location {
  _id: string;
  userId: string;
  city: string;
  state: string;
  country: string;
  ip: string;
  coordinates?: {
    latitude: number;
    longitude: number;
  };
  address?: string;
  createdAt: string;
  updatedAt: string;
}

interface GeolocationData {
  latitude: number;
  longitude: number;
  city?: string;
  state?: string;
  country?: string;
  address?: string;
  timestamp?: number;
}

interface ApiError {
  error: string;
}

const CheckInOutApp: React.FC = () => {
  const [isCheckedIn, setIsCheckedIn] = useState<boolean>(false);
  const [currentSession, setCurrentSession] = useState<CurrentSession | null>(null);
  const [history, setHistory] = useState<AttendanceRecord[]>([]);
  const [userName, setUserName] = useState<string>("");
  const [location, setLocation] = useState<string>("");
  const [locations, setLocations] = useState<Location[]>([]);
  const [currentGeolocation, setCurrentGeolocation] = useState<GeolocationData | null>(null);
  const [locationLoading, setLocationLoading] = useState<boolean>(false);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [useCurrentLocation, setUseCurrentLocation] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<"dashboard" | "history">("dashboard");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [initialDataLoaded, setInitialDataLoaded] = useState<boolean>(false);
  const [userId, setUserId] = useState<string>("");
  const [autoCheckoutEnabled, setAutoCheckoutEnabled] = useState<boolean>(true);
  const [timeToMidnight, setTimeToMidnight] = useState<string>("");
  
  // Refs for intervals
  const midnightCheckIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const countdownIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api/checksession";

  // Get auth token from localStorage (browser-safe)
  const getAuthToken = (): string | null => {
    if (typeof window === "undefined") return null;
    return localStorage.getItem("token");
  };

  // Get user's real IP address
  const getUserIP = async (): Promise<string> => {
    try {
      const response = await fetch('https://api.ipify.org?format=json');
      const data = await response.json();
      return data.ip || "127.0.0.1";
    } catch (error) {
      console.warn("Failed to get real IP, using fallback:", error);
      return "127.0.0.1";
    }
  };

  // Calculate time until midnight
  const calculateTimeToMidnight = (): string => {
    const now = new Date();
    const midnight = new Date();
    midnight.setHours(24, 0, 0, 0); // Next midnight
    
    if (midnight.getTime() <= now.getTime()) {
      midnight.setDate(midnight.getDate() + 1);
    }
    
    const diff = midnight.getTime() - now.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);
    
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  // Calculate time until next midnight in milliseconds
  const calculateTimeToNextMidnight = (): number => {
    const now = new Date();
    const midnight = new Date(now);
    midnight.setHours(24, 0, 0, 0);
    if (midnight <= now) {
      midnight.setDate(midnight.getDate() + 1);
    }
    return midnight.getTime() - now.getTime();
  };

  // Auto checkout function
  const performAutoCheckout = async (): Promise<void> => {
    if (!currentSession || !isCheckedIn) {
      console.log("No active session for auto checkout");
      return;
    }
    
    try {
      const token = getAuthToken();
      if (!token) {
        console.warn("No auth token found for auto checkout");
        return;
      }

      console.log("Performing automatic checkout at midnight for user:", userId);
      
      const checkOutData = {
        userId: userId,
        sessionId: currentSession.id,
        checkOut: new Date().toISOString(),
        autoCheckout: true 
      };

      // Call the session checkout endpoint
      await axios.put(
        `${API_BASE_URL}/session/checkout/${currentSession.id}`,
        checkOutData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          withCredentials: true,
        }
      );

      const checkOutTime = new Date();
      
      // Update history with checkout time
      setHistory(prevHistory => 
        prevHistory.map(record => 
          record.id === currentSession.id 
            ? {
                ...record,
                checkOut: formatTime(checkOutTime),
                duration: calculateDuration(currentSession.checkInTime, checkOutTime),
              }
            : record
        )
      );
      
      setCurrentSession(null);
      setIsCheckedIn(false);
      
      // Show notification
      setError("🕛 You were automatically checked out at midnight. Ready for a new day!");
      setTimeout(() => setError(null), 15000);
      
    } catch (err) {
      console.error("Auto checkout failed:", err);
      const error = err as AxiosError<ApiError>;
      setError(`Auto checkout failed: ${error.response?.data?.error || "Unknown error"}`);
    }
  };

  // Setup auto-checkout timer
  const setupAutoCheckoutTimer = (): void => {
    if (midnightCheckIntervalRef.current) {
      clearTimeout(midnightCheckIntervalRef.current);
      midnightCheckIntervalRef.current = null;
    }

    if (isCheckedIn && currentSession && autoCheckoutEnabled) {
      const timeToMidnight = calculateTimeToNextMidnight();
      const midnightTime = new Date(Date.now() + timeToMidnight);
      
      console.log(`⏰ Auto-checkout scheduled in ${Math.round(timeToMidnight / 1000 / 60)} minutes at ${midnightTime.toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}`);

      midnightCheckIntervalRef.current = setTimeout(async () => {
        console.log("🕛 Midnight reached - executing auto checkout");
        await performAutoCheckout();
        setupAutoCheckoutTimer();
      }, timeToMidnight);
    }
  };

  // Setup countdown timer
  const setupCountdown = (): void => {
    if (countdownIntervalRef.current) {
      clearInterval(countdownIntervalRef.current);
      countdownIntervalRef.current = null;
    }
    
    if (isCheckedIn && autoCheckoutEnabled) {
      countdownIntervalRef.current = setInterval(() => {
        setTimeToMidnight(calculateTimeToMidnight());
      }, 1000);
      
      setTimeToMidnight(calculateTimeToMidnight());
    } else {
      setTimeToMidnight("");
    }
  };

  // Cleanup intervals on unmount
  useEffect(() => {
    return () => {
      if (midnightCheckIntervalRef.current) {
        clearTimeout(midnightCheckIntervalRef.current);
      }
      if (countdownIntervalRef.current) {
        clearInterval(countdownIntervalRef.current);
      }
    };
  }, []);

  // Setup/cleanup midnight check when check-in status changes
  useEffect(() => {
    setupAutoCheckoutTimer();
    setupCountdown();
    
    return () => {
      if (midnightCheckIntervalRef.current) {
        clearTimeout(midnightCheckIntervalRef.current);
      }
      if (countdownIntervalRef.current) {
        clearInterval(countdownIntervalRef.current);
      }
    };
  }, [isCheckedIn, currentSession, autoCheckoutEnabled]);

  // Load auto checkout preference from localStorage
  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedPreference = localStorage.getItem("autoCheckoutEnabled");
      if (savedPreference !== null) {
        setAutoCheckoutEnabled(savedPreference === "true");
      }
    }
  }, []);

  // Fetch current location using browser geolocation API
  const getCurrentLocation = (): Promise<GeolocationData> => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error("Geolocation is not supported by this browser"));
        return;
      }

      const options = {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 60000
      };

      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          
          try {
            let geoData: GeolocationData | null = null;

            try {
              const nominatimResponse = await fetch(
                `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&addressdetails=1&accept-language=en`,
                {
                  headers: {
                    'User-Agent': 'CheckInApp/1.0'
                  }
                }
              );
              
              if (nominatimResponse.ok) {
                const nominatimData = await nominatimResponse.json();
                const address = nominatimData.address || {};
                
                geoData = {
                  latitude,
                  longitude,
                  city: address.city || address.town || address.village || address.suburb || "Current Location",
                  state: address.state || address.region || address.province || "Unknown State",
                  country: address.country || "Unknown Country",
                  address: nominatimData.display_name || `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`,
                  timestamp: Date.now()
                };
              }
            } catch (nominatimError) {
              console.warn("Nominatim geocoding failed:", nominatimError);
            }

            if (!geoData) {
              try {
                const bigDataResponse = await fetch(
                  `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`
                );
                
                if (bigDataResponse.ok) {
                  const bigDataData = await bigDataResponse.json();
                  
                  geoData = {
                    latitude,
                    longitude,
                    city: bigDataData.city || bigDataData.locality || "Current Location",
                    state: bigDataData.principalSubdivision || "Unknown State",
                    country: bigDataData.countryName || "Unknown Country",
                    address: `${bigDataData.city || 'Current Location'}, ${bigDataData.principalSubdivision || 'Unknown State'}, ${bigDataData.countryName || 'Unknown Country'}`,
                    timestamp: Date.now()
                  };
                }
              } catch (bigDataError) {
                console.warn("BigDataCloud geocoding failed:", bigDataError);
              }
            }

            if (!geoData) {
              geoData = {
                latitude,
                longitude,
                city: "Current Location",
                state: "Unknown State",
                country: "Unknown Country",
                address: `Lat: ${latitude.toFixed(6)}, Lng: ${longitude.toFixed(6)}`,
                timestamp: Date.now()
              };
            }

            resolve(geoData);
            
          } catch (geocodingError) {
            console.warn("All geocoding services failed:", geocodingError);
            resolve({
              latitude,
              longitude,
              city: "Current Location",
              state: "Unknown State",
              country: "Unknown Country",
              address: `Lat: ${latitude.toFixed(6)}, Lng: ${longitude.toFixed(6)}`,
              timestamp: Date.now()
            });
          }
        },
        (error) => {
          let errorMessage = "Unable to retrieve location";
          switch (error.code) {
            case error.PERMISSION_DENIED:
              errorMessage = "Location access denied. Please allow location access and try again.";
              break;
            case error.POSITION_UNAVAILABLE:
              errorMessage = "Location information is unavailable. Please check your GPS/location services.";
              break;
            case error.TIMEOUT:
              errorMessage = "Location request timed out. Please try again.";
              break;
          }
          reject(new Error(errorMessage));
        },
        options
      );
    });
  };

  // Save location to database
  const saveLocationToDatabase = async (geoData: GeolocationData): Promise<Location | null> => {
    try {
      const token = getAuthToken();
      if (!token || !userId) {
        console.warn("No auth token or user ID found, skipping location save to database");
        return null;
      }

      const existingLocation = locations.find(loc => 
        loc.userId === userId &&
        loc.city === (geoData.city || "Current Location") && 
        loc.state === (geoData.state || "Unknown State") && 
        loc.country === (geoData.country || "Unknown Country")
      );

      if (existingLocation) {
        console.log("Location already exists for user, using existing one:", existingLocation);
        return existingLocation;
      }

      const userIP = await getUserIP();

      const locationData = {
        userId: userId,
        city: geoData.city || "Current Location",
        state: geoData.state || "Unknown State", 
        country: geoData.country || "Unknown Country",
        ip: userIP,
        coordinates: {
          latitude: geoData.latitude,
          longitude: geoData.longitude
        },
        address: geoData.address
      };

      console.log("Saving location to database with user ID:", locationData);

      const response = await axios.post(
        `${API_BASE_URL}/location`,
        locationData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          withCredentials: true,
        }
      );

      console.log("Location saved to database successfully:", response.data);
      
      const newLocation: Location = response.data;
      setLocations(prevLocations => {
        const exists = prevLocations.some(loc => loc._id === newLocation._id);
        
        if (!exists) {
          console.log("Adding new location to state:", newLocation);
          return [newLocation, ...prevLocations];
        } else {
          console.log("Location already exists in state, not adding duplicate");
          return prevLocations;
        }
      });
      
      return newLocation;
      
    } catch (error) {
      console.error("Failed to save location to database:", error);
      const axiosError = error as AxiosError<ApiError>;
      if (axiosError.response?.data?.error) {
        console.error("API Error:", axiosError.response.data.error);
        if (axiosError.response.status === 400 || axiosError.response.status === 422) {
          setError(`Failed to save location: ${axiosError.response.data.error}`);
        }
      }
      return null;
    }
  };

  // Handle getting current location
  const handleGetCurrentLocation = async () => {
    if (isCheckedIn) return;
    
    setLocationLoading(true);
    setLocationError(null);
    setError(null);
    
    if (!navigator.geolocation) {
      setLocationError("Geolocation is not supported by this browser. Please use a modern browser like Chrome, Firefox, or Safari.");
      setLocationLoading(false);
      return;
    }

    if (!userId) {
      setLocationError("User ID not found. Please refresh the page and try again.");
      setLocationLoading(false);
      return;
    }

    if (navigator.permissions) {
      try {
        const permission = await navigator.permissions.query({name: 'geolocation'});
        if (permission.state === 'denied') {
          setLocationError("Location access has been permanently denied. Please enable it in your browser settings and refresh the page.");
          setLocationLoading(false);
          return;
        }
      } catch (permissionError) {
        console.log("Permissions API not supported, continuing...");
      }
    }
    
    try {
      console.log("Getting current location for user:", userId);
      const geoData = await getCurrentLocation();
      setCurrentGeolocation(geoData);
      
      const locationString = geoData.city && geoData.state && geoData.country 
        ? `${geoData.city}, ${geoData.state}, ${geoData.country}`
        : geoData.address || "Current Location";
      
      setLocation(locationString);
      setUseCurrentLocation(true);
      
      if (typeof window !== "undefined") {
        localStorage.setItem("currentGeolocation", JSON.stringify(geoData));
        localStorage.setItem("useCurrentLocation", "true");
      }
      
      console.log("Attempting to save location to database...");
      const savedLocation = await saveLocationToDatabase(geoData);
      
      if (savedLocation) {
        console.log("Location successfully saved to database with ID:", savedLocation._id);
        setError(null);
      } else {
        console.warn("Location was not saved to database, but location detection was successful");
      }
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to get location";
      setLocationError(errorMessage);
      console.error("Geolocation error:", error);
    } finally {
      setLocationLoading(false);
    }
  };

  // Simplified fetch user details and history
  const fetchUserDataAndHistory = async (token: string, userIdParam: string): Promise<void> => {
    try {
      console.log("Fetching user data and history for user:", userIdParam);
      
      // Fetch user profile from localStorage first
      let userProfile = {
        username: localStorage.getItem("username") || "Guest User",
        email: localStorage.getItem("email") || ""
      };
      
      setUserName(userProfile.username);

      // Fetch user-specific locations
      let fetchedLocations: Location[] = [];
      try {
        const locationResponse = await axios.get(`${API_BASE_URL}/location`, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          withCredentials: true,
        });
        
        let allLocations = Array.isArray(locationResponse.data) 
          ? locationResponse.data 
          : (locationResponse.data.locations || []);
        
        fetchedLocations = allLocations.filter((loc: Location) => loc.userId === userIdParam);
        
        const uniqueLocations = fetchedLocations.filter((location: { city: any; state: any; country: any; }, index: any, self: any[]) => 
          index === self.findIndex((l) => 
            l.city === location.city && 
            l.state === location.state && 
            l.country === location.country
          )
        );
        
        setLocations(uniqueLocations);
        console.log(`Loaded ${uniqueLocations.length} locations for user ${userIdParam}`);
        
        if (uniqueLocations.length > 0 && !location && !useCurrentLocation) {
          const defaultLocation = `${uniqueLocations[0].city}, ${uniqueLocations[0].state}, ${uniqueLocations[0].country}`;
          setLocation(defaultLocation);
        }
        
      } catch (locationError) {
        console.warn("Failed to fetch user locations:", locationError);
      }

      // Fetch history data using GET /history
      try {
        const historyResponse = await axios.get(`${API_BASE_URL}/history`, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          withCredentials: true,
        });
        
        console.log("History response:", historyResponse.data);
        
        let historyData = [];
        
        // Handle different response formats
        if (historyResponse.data.history && Array.isArray(historyResponse.data.history)) {
          historyData = historyResponse.data.history;
        } else if (Array.isArray(historyResponse.data)) {
          historyData = historyResponse.data;
        } else if (historyResponse.data.sessions && Array.isArray(historyResponse.data.sessions)) {
          historyData = historyResponse.data.sessions;
        }
        
        // Filter by current user
        historyData = historyData.filter((entry: any) => entry.userId === userIdParam);
        
        console.log("Processing history data:", historyData);
        
        // Find active session (no checkOut time)
        let activeSession: CurrentSession | null = null;
        const formattedHistory: AttendanceRecord[] = [];
        
        historyData.forEach((entry: any, index: number) => {
          const sessionId = entry._id || entry.id || `${userIdParam}_${index}`;
          const checkInTime = entry.checkIn || entry.checkInTime || entry.createdAt;
          const checkOutTime = entry.checkOut || entry.checkOutTime || null;
          const sessionLocation = entry.location || (fetchedLocations.length > 0 ? `${fetchedLocations[0].city}, ${fetchedLocations[0].state}, ${fetchedLocations[0].country}` : location) || "Unknown Location";
          
          if (!checkInTime) {
            console.warn("Skipping entry without checkIn time:", entry);
            return;
          }
          
          const checkInDate = new Date(checkInTime);
          
          // Check if this is an active session (no checkout)
          if (!checkOutTime && !activeSession) {
            activeSession = {
              id: sessionId,
              checkInTime: checkInDate,
              date: formatDate(checkInDate),
              location: sessionLocation,
            };
          }
          
          // Add to formatted history
          formattedHistory.push({
            id: sessionId,
            date: formatDate(checkInDate),
            checkIn: formatTime(checkInDate),
            checkOut: checkOutTime ? formatTime(new Date(checkOutTime)) : "-",
            duration: checkOutTime
              ? calculateDuration(checkInDate, new Date(checkOutTime))
              : "-",
            location: sessionLocation,
          });
        });
        
        // Set active session state
        if (activeSession) {
          console.log("Found active session:", activeSession);
          setCurrentSession(activeSession);
          setIsCheckedIn(true);
        } else {
          console.log("No active session found");
          setCurrentSession(null);
          setIsCheckedIn(false);
        }
        
        // Sort history by date (newest first) and set
        const sortedHistory = formattedHistory.sort((a, b) => {
          const dateA = new Date(a.date + " " + a.checkIn);
          const dateB = new Date(b.date + " " + b.checkIn);
          return dateB.getTime() - dateA.getTime();
        });
        
        setHistory(sortedHistory);
        console.log(`Loaded ${sortedHistory.length} history records`);
        
      } catch (historyError) {
        console.error("Failed to fetch history:", historyError);
        const error = historyError as AxiosError<ApiError>;
        
        // If history fetch fails, still allow the app to work
        setHistory([]);
        setCurrentSession(null);
        setIsCheckedIn(false);
        
        // Show error only if it's not a 404 (no history yet)
        if (error.response?.status !== 404) {
          console.warn("History fetch failed:", error.response?.data?.error || "Unknown error");
        }
      }

    } catch (error) {
      console.error("Failed to fetch user data:", error);
      throw error;
    }
  };

  // Load initial data
  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedUserId = localStorage.getItem("userId") || "";
      const storedUsername = localStorage.getItem("username") || "Guest User";
      
      console.log("Loading user data from localStorage:", { storedUserId, storedUsername });
      
      setUserId(storedUserId);
      setUserName(storedUsername);
      
      // Load saved location preferences
      const savedCurrentLocation = localStorage.getItem("currentGeolocation");
      const savedUseCurrentLocation = localStorage.getItem("useCurrentLocation");
      
      if (savedCurrentLocation && savedUseCurrentLocation === "true") {
        try {
          const geoData = JSON.parse(savedCurrentLocation);
          setCurrentGeolocation(geoData);
          setUseCurrentLocation(true);
          
          const locationString = geoData.city && geoData.state && geoData.country 
            ? `${geoData.city}, ${geoData.state}, ${geoData.country}`
            : geoData.address || "Current Location";
          setLocation(locationString);
        } catch (error) {
          console.error("Error parsing saved location:", error);
          localStorage.removeItem("currentGeolocation");
          localStorage.removeItem("useCurrentLocation");
        }
      }
    }
  }, []);

  // Fetch data when userId is available
  useEffect(() => {
    if (!userId) {
      console.log("No userId available, skipping data fetch");
      setLoading(false);
      return;
    }

    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const token = getAuthToken();
        if (!token) {
          setError("Authentication token not found. Please log in.");
          return;
        }

        console.log("Starting data fetch for user:", userId);
        
        await fetchUserDataAndHistory(token, userId);
        
        setInitialDataLoaded(true);
        console.log("Data fetch completed successfully");

      } catch (err) {
        console.error("Data fetch error:", err);
        const error = err as AxiosError<ApiError>;
        
        if (error.response?.status === 401 || error.response?.status === 403) {
          setError("Session expired. Please log in again.");
        } else {
          setError(error.response?.data?.error || "Failed to fetch data");
        }
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [userId]);

  const formatTime = (date: Date): string => {
    return date.toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
      timeZone: "Asia/Kolkata",
    });
  };

  const formatDate = (date: Date): string => {
    return date.toLocaleDateString("en-IN", {
      year: "numeric",
      month: "short",
      day: "numeric",
      timeZone: "Asia/Kolkata",
    });
  };

  const calculateDuration = (start: Date, end: Date): string => {
    const diff = end.getTime() - start.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}h ${minutes}m`;
  };

  // Handle Check In using session/checkin endpoint
  const handleCheckIn = async (): Promise<void> => {
    if (!location) {
      setError("Please set your location before checking in.");
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const token = getAuthToken();
      
      if (!token) {
        setError("Authentication token not found. Please log in.");
        return;
      }

      const checkInData = {
        userId: userId,
        checkIn: new Date().toISOString(),
        location: location,
      };

      console.log("Sending check-in data:", checkInData);

      const response = await axios.post(
        `${API_BASE_URL}/session/checkin`,
        checkInData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          withCredentials: true,
        }
      );

      console.log("Check-in response:", response.data);
      
      // Update session state
      const checkInTime = new Date();
      const newSession: CurrentSession = {
        id: response.data._id || response.data.id || `${userId}_${Date.now()}`,
        checkInTime: checkInTime,
        date: formatDate(checkInTime),
        location: location,
      };

      setCurrentSession(newSession);
      setIsCheckedIn(true);
      
      // Add to history
      const newHistoryRecord: AttendanceRecord = {
        id: newSession.id,
        date: newSession.date,
        checkIn: formatTime(checkInTime),
        checkOut: "-",
        duration: "-",
        location: location,
      };
      
      setHistory(prevHistory => [newHistoryRecord, ...prevHistory]);
      
      setError(null);

    } catch (err) {
      console.error("Check-in failed:", err);
      const error = err as AxiosError<ApiError>;
      setError(`Check-in failed: ${error.response?.data?.error || "Unknown error"}`);
    } finally {
      setLoading(false);
    }
  };

  // Handle Check Out using session/checkout endpoint - FIXED
  const handleCheckOut = async (): Promise<void> => {
    if (!currentSession) {
      setError("No active session found.");
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const token = getAuthToken();
      
      if (!token) {
        setError("Authentication token not found. Please log in.");
        return;
      }

      const checkOutData = {
        userId: userId,
        sessionId: currentSession.id,
        checkOut: new Date().toISOString(),
      };

      console.log("Sending check-out data for session:", currentSession.id, checkOutData);

      const response = await axios.put(
        `${API_BASE_URL}/session/checkout/${currentSession.id}`,
        checkOutData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          withCredentials: true,
        }
      );

      console.log("Check-out response:", response.data);

      const checkOutTime = new Date();
      
      // Update history with checkout time
      setHistory(prevHistory => 
        prevHistory.map(record => 
          record.id === currentSession.id 
            ? {
                ...record,
                checkOut: formatTime(checkOutTime),
                duration: calculateDuration(currentSession.checkInTime, checkOutTime),
              }
            : record
        )
      );
      
      setCurrentSession(null);
      setIsCheckedIn(false);
      
      setError(null);

    } catch (err) {
      console.error("Check-out failed:", err);
      const error = err as AxiosError<ApiError>;
      setError(`Check-out failed: ${error.response?.data?.error || "Unknown error"}`);
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (tab: "dashboard" | "history"): void => {
    setActiveTab(tab);
  };

  const handleLogout = async (): Promise<void> => {
    try {
      setLoading(true);
      const token = getAuthToken();
      
      // Clear localStorage first
      if (typeof window !== "undefined") {
        localStorage.clear();
      }

      // Try to call logout API if token exists
      if (token) {
        try {
          await axios.post(
            `${API_BASE_URL.replace('/checksession', '')}/auth/logout`,
            {},
            {
              headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
              },
              withCredentials: true,
            }
          );
        } catch (apiError) {
          console.warn("Logout API call failed:", apiError);
        }
      }

      // Clear timers
      if (midnightCheckIntervalRef.current) {
        clearTimeout(midnightCheckIntervalRef.current);
      }
      if (countdownIntervalRef.current) {
        clearInterval(countdownIntervalRef.current);
      }

      setError(null);
      window.location.href = "/login";
      
    } catch (err) {
      // Even if logout fails, clear everything and redirect
      if (typeof window !== "undefined") {
        localStorage.clear();
      }
      setError(null);
      window.location.href = "/login";
    } finally {
      setLoading(false);
    }
  };

  // Show loading state while initial data is being fetched
  if (!initialDataLoaded && loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your attendance data...</p>
          {userId && <p className="text-sm text-gray-500 mt-2">User: {userId}</p>}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {error && (
          <div className={`border px-4 py-3 rounded-lg mb-4 ${
            error.includes('successful') || error.includes('updated') 
              ? 'bg-green-100 border-green-400 text-green-700'
              : 'bg-red-100 border-red-400 text-red-700'
          }`}>
            {error}
          </div>
        )}
        
        <div className="bg-white rounded-2xl shadow-xl mb-8 p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-indigo-600 rounded-full flex items-center justify-center">
                <UserIcon className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  {userName || "Loading User..."}
                </h1>
                <p className="text-gray-600">
                  {useCurrentLocation && currentGeolocation ? (
                    <span className="flex items-center">
                      <Navigation className="w-4 h-4 mr-1 text-blue-500" />
                      {location}
                    </span>
                  ) : (
                    location 
                  )}
                </p>
              </div>
            </div>
            <div className="text-right space-y-2">
              <p className="text-sm text-gray-500">Today</p>
              <p className="text-lg font-semibold text-gray-900">
                {formatDate(new Date())}
              </p>
              {isCheckedIn && autoCheckoutEnabled && timeToMidnight && (
                <div className="bg-orange-50 border border-orange-200 rounded-lg p-2">
                  <p className="text-xs text-orange-600 font-medium">Auto-checkout in:</p>
                  <p className="text-sm font-mono text-orange-700">{timeToMidnight}</p>
                </div>
              )}
              <button
                onClick={handleLogout}
                disabled={loading}
                className="flex items-center px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors disabled:bg-gray-400"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </button>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-2xl shadow-xl mb-8">
          <div className="flex border-b border-gray-200">
            <button
              onClick={() => handleTabChange("dashboard")}
              className={`flex-1 py-4 px-6 text-center font-medium transition-colors ${
                activeTab === "dashboard"
                  ? "text-indigo-600 border-b-2 border-indigo-600 bg-indigo-50"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              <Clock className="w-5 h-5 inline-block mr-2" />
              Dashboard
            </button>
            <button
              onClick={() => handleTabChange("history")}
              className={`flex-1 py-4 px-6 text-center font-medium transition-colors ${
                activeTab === "history"
                  ? "text-indigo-600 border-b-2 border-indigo-600 bg-indigo-50"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              <History className="w-5 h-5 inline-block mr-2" />
              History ({history.length})
            </button>
          </div>
          
          {activeTab === "dashboard" && (
            <div className="p-8">
              <div className="text-center mb-8">
                <div
                  className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-medium mb-4 ${
                    isCheckedIn
                      ? "bg-green-100 text-green-800"
                      : "bg-gray-100 text-gray-800"
                  }`}
                >
                  <div
                    className={`w-2 h-2 rounded-full mr-2 ${
                      isCheckedIn ? "bg-green-500" : "bg-gray-500"
                    }`}
                  ></div>
                  {isCheckedIn ? "Checked In" : "Checked Out"}
                </div>
                <p className="text-gray-600">
                  {isCheckedIn && currentSession
                    ? `Since ${formatTime(currentSession.checkInTime)}`
                    : "Ready to check in"}
                </p>
              </div>
              
              {isCheckedIn && currentSession && (
                <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-6 mb-8 border border-green-200">
                  <h3 className="text-lg font-semibold text-green-800 mb-4">
                    Current Session
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="text-center">
                      <p className="text-sm text-green-600 mb-1">Check-in Time</p>
                      <p className="text-lg font-semibold text-green-800">
                        {formatTime(currentSession.checkInTime)}
                      </p>
                    </div>
                    <div className="text-center">
                      <p className="text-sm text-green-600 mb-1">Duration</p>
                      <p className="text-lg font-semibold text-green-800">
                        {calculateDuration(currentSession.checkInTime, new Date())}
                      </p>
                    </div>
                    <div className="text-center">
                      <p className="text-sm text-green-600 mb-1">Location</p>
                      <p className="text-lg font-semibold text-green-800 flex items-center justify-center">
                        {useCurrentLocation && (
                          <Navigation className="w-4 h-4 mr-1 text-blue-500" />
                        )}
                        {currentSession.location}
                      </p>
                    </div>
                  </div>
                  
                  {autoCheckoutEnabled && (
                    <div className="mt-4 bg-orange-50 border border-orange-200 rounded-lg p-3">
                      <p className="text-sm text-orange-700">
                        🕛 <strong>Auto-checkout enabled:</strong> You'll be automatically checked out at midnight ({timeToMidnight} remaining)
                      </p>
                    </div>
                  )}
                </div>
              )}
              
              <div className="mb-8">
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  <MapPin className="w-4 h-4 inline-block mr-1" />
                  Current Location
                </label>
                
                <div className="space-y-4">
                  {!useCurrentLocation ? (
                    <div>
                      <button
                        onClick={handleGetCurrentLocation}
                        disabled={isCheckedIn || locationLoading || loading}
                        className="flex items-center px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed w-full justify-center"
                      >
                        {locationLoading ? (
                          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                        ) : (
                          <Navigation className="w-5 h-5 mr-2" />
                        )}
                        {locationLoading ? "Detecting Location..." : "Get My Current Location"}
                      </button>
                      
                      {locationError && (
                        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mt-3">
                          <div className="flex items-start">
                            <div className="flex-shrink-0">
                              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                              </svg>
                            </div>
                            <div className="ml-3 flex-1">
                              <h3 className="text-sm font-medium text-red-800">Location Error</h3>
                              <p className="text-sm text-red-700 mt-1">{locationError}</p>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <p className="text-sm text-green-800 font-medium flex items-center mb-2">
                            <Navigation className="w-4 h-4 mr-1" />
                            Location Detected Successfully
                          </p>
                          <div className="space-y-1">
                            <p className="text-sm text-green-700">
                              <span className="font-medium">Address:</span> {currentGeolocation?.address}
                            </p>
                            <p className="text-xs text-green-600">
                              <span className="font-medium">Coordinates:</span> {currentGeolocation?.latitude.toFixed(6)}, {currentGeolocation?.longitude.toFixed(6)}
                            </p>
                          </div>
                        </div>
                        
                        {!isCheckedIn && (
                          <div className="flex flex-col space-y-1 ml-2">
                            <button
                              onClick={handleGetCurrentLocation}
                              disabled={locationLoading}
                              className="text-green-600 hover:text-green-800 p-1"
                              title="Update location"
                            >
                              {locationLoading ? (
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-green-600"></div>
                              ) : (
                                <RefreshCw className="w-4 h-4" />
                              )}
                            </button>
                            <button
                              onClick={() => {
                                setUseCurrentLocation(false);
                                setCurrentGeolocation(null);
                                setLocation("");
                                if (typeof window !== "undefined") {
                                  localStorage.removeItem("currentGeolocation");
                                  localStorage.removeItem("useCurrentLocation");
                                }
                              }}
                              className="text-red-500 hover:text-red-700 p-1"
                              title="Clear location"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                              </svg>
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                  
                  {!location && !useCurrentLocation && (
                    <p className="text-sm text-gray-500 text-center py-4">
                      Please get your current location before checking in
                    </p>
                  )}
                </div>
              </div>
              
              {/* Auto-checkout settings */}
              <div className="mb-8 bg-gray-50 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-medium text-gray-900">Auto-checkout at Midnight</h3>
                    <p className="text-xs text-gray-600">Automatically check out at 12:00 AM if you forget</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={autoCheckoutEnabled}
                      onChange={(e) => {
                        const enabled = e.target.checked;
                        setAutoCheckoutEnabled(enabled);
                        if (typeof window !== "undefined") {
                          localStorage.setItem("autoCheckoutEnabled", enabled.toString());
                        }
                      }}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>
              </div>
              
              <div className="flex justify-center space-x-4">
                {!isCheckedIn ? (
                  <button
                    onClick={handleCheckIn}
                    disabled={loading || !location}
                    className="flex items-center px-8 py-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-semibold rounded-xl hover:from-green-600 hover:to-emerald-700 transform hover:scale-105 transition-all duration-200 shadow-lg disabled:bg-gray-400 disabled:cursor-not-allowed disabled:transform-none"
                  >
                    {loading ? (
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    ) : (
                      <LogIn className="w-5 h-5 mr-2" />
                    )}
                    {loading ? "Checking In..." : "Check In"}
                  </button>
                ) : (
                  <button
                    onClick={handleCheckOut}
                    disabled={loading}
                    className="flex items-center px-8 py-4 bg-gradient-to-r from-red-500 to-pink-600 text-white font-semibold rounded-xl hover:from-red-600 hover:to-pink-700 transform hover:scale-105 transition-all duration-200 shadow-lg disabled:bg-gray-400 disabled:cursor-not-allowed disabled:transform-none"
                  >
                    {loading ? (
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    ) : (
                      <LogOut className="w-5 h-5 mr-2" />
                    )}
                    {loading ? "Checking Out..." : "Check Out"}
                  </button>
                )}
              </div>
            </div>
          )}
          
          {activeTab === "history" && (
            <div className="p-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900">
                  Attendance History
                </h2>
                <div className="text-sm text-gray-500">
                  {history.length > 0 ? `${history.length} records` : "No records"}
                </div>
              </div>
              {history.length === 0 ? (
                <div className="text-center py-12">
                  <History className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">No attendance history yet</p>
                  <p className="text-sm text-gray-400 mt-2">Check in to start tracking your attendance</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {history.map((record) => (
                    <div
                      key={record.id}
                      className="bg-gray-50 rounded-xl p-6 hover:bg-gray-100 transition-colors"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center space-x-3">
                          <Calendar className="w-5 h-5 text-indigo-600" />
                          <span className="font-semibold text-gray-900">
                            {record.date}
                          </span>
                          {record.checkOut === "-" && (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                              Active
                            </span>
                          )}
                        </div>
                        <div className="flex items-center space-x-2">
                          <MapPin className="w-4 h-4 text-gray-500" />
                          <span className="text-sm text-gray-600">
                            {record.location}
                          </span>
                        </div>
                      </div>
                      <div className="grid grid-cols-3 gap-4 text-center">
                        <div>
                          <p className="text-sm text-gray-500 mb-1">Check In</p>
                          <p className="font-semibold text-green-600">
                            {record.checkIn}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500 mb-1">Check Out</p>
                          <p className={`font-semibold ${record.checkOut === "-" ? "text-gray-400" : "text-red-600"}`}>
                            {record.checkOut}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500 mb-1">Duration</p>
                          <p className={`font-semibold ${record.duration === "-" ? "text-gray-400" : "text-indigo-600"}`}>
                            {record.duration}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CheckInOutApp;