"use client";

import React, {
  createContext,
  useContext,
  useState,
  ReactNode,
  useEffect,
} from "react";

import { getUserLocationDetails } from "../functions/helperFunctions";
import { useRouter } from "next/navigation";

type User = {
  id: string;
  name: string;
  email: string;
  token?: string;
  role:string
};

type AuthContextType = {
    user: User | null;
    login: (userData: User,token:string) => void;
    logout: () => void;
    location:object | null;
    token?: string | null;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [location, setLocation] = useState<object | null>({
    city: "",
    state: "",
    country: "",
    ip: "",
  });
  const [token,setToken] = useState<string|null>(null);
  const router = useRouter()

  // set login data
  const login = (userData: User,token:string) => {
    setUser(userData);
    localStorage.setItem("user", JSON.stringify(userData)); // persist
    setToken(token);
    localStorage.setItem("token",token);
  };

  // clear login data
  const logout = () => {
    setUser(null);
    localStorage.removeItem("user");
    setToken(null);
    localStorage.removeItem("token");
    router.replace("/login")
  };

  // restore user on reload
  useEffect(() => {
    // const token = getAuthToken();
    
    const storedUser = localStorage.getItem("user");
    if (storedUser) setUser(JSON.parse(storedUser));
    const storedToken = localStorage.getItem("token");
    if (storedToken) setToken(storedToken);
    const getLocation = async()=>{
        const location = await getUserLocationDetails();
        if (location) setLocation(location);
        localStorage.setItem("location",JSON.stringify(location));
    }
    getLocation()
  }, []);

//   useEffect(()=>{
//     localStorage.setItem("token",token);
//   },[token])

  return (
    <AuthContext.Provider value={{ user, login, logout,location,token }}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook for using context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
