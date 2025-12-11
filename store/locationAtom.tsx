
"use client";

import { atom } from "jotai";

export type Location = {
  city?: string;
  state?: string;
  country?: string;
  lat?: number;
  lon?: number;
  ip?: string;
};

export const locationAtom = atom<Location | null>(null);

export const setLocationAtom = atom(
  null,
  (_get, set, location: Location) => {
    set(locationAtom, location);
  }
);