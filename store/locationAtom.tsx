
"use client";

import { atom } from "jotai";
import { atomWithStorage } from "jotai/utils";

export type Location = {
  city?: string;
  state?: string;
  country?: string;
  lat?: number;
  lon?: number;
  ip?: string;
};

export const locationAtom = atomWithStorage<Location | null>("location", null);

export const setLocationAtom = atom(
  null,
  (_get, set, location: Location) => {
    set(locationAtom, location);
  }
);