// store/roleAtom.ts
import { atom } from "jotai";

export type Role = "user" | "hr" | "admin" | null;

export const roleAtom = atom<Role>(null);
