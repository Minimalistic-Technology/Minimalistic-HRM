"use client";

import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { getUserLocationDetails } from "./functions/helperFunctions";
import { setLocation } from "./store/authSlice";
import { Location } from "./types";


export default function LocationProvider() {
  const dispatch = useDispatch();

  useEffect(() => {
    const fetchLocation = async () => {
      const loc:Location = await getUserLocationDetails();
      if (loc) dispatch(setLocation(loc));
    };
    fetchLocation();
  }, [dispatch]);

  return null; // it doesn’t render anything
}
