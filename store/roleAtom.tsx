// store/roleAtom.ts
import { atom } from "jotai";
import { atomWithStorage } from "jotai/utils";

export type Role = "user" | "hr" | "admin" | "super_admin" | null;

export const roleAtom = atomWithStorage<Role>("role", null);
