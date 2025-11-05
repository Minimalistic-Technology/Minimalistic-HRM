"use client";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { User, Location } from "../types";

interface AuthState {
  user: User | null;
  token: string | null;
  location: Location | null;
}

const initialState: AuthState = {
  user: {},
  token: "",
  location: {},
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    
    setUser: (state, action: PayloadAction<{ user: User,token:string }>) => {
        // if(localStorage.getItem("user") && localStorage.getItem("token")) return;
        state.user = action.payload.user;
        state.token =action.payload.token;
        localStorage.setItem("user", JSON.stringify(action.payload.user));
        localStorage.setItem("token", action.payload.token);
    },
    setLocation: (state, action: PayloadAction<Location>) => {
        // if(localStorage.getItem("location")) return;
      state.location = action.payload;
      localStorage.setItem("location", JSON.stringify(action.payload));
    },
  },
});

export const { setUser, setLocation } = authSlice.actions;
export default authSlice.reducer;
