// app/admin/users/types.ts

export interface UserType {
  _id: string;
  name: string;
  email: string;
  role: string;
  contact?: string;
  address?: string;
  photoURL?: string;
  dateOfJoin?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface FormData {
  name: string;
  email: string;
  password: string;
  role: string;
  contact: string;
  address: string;
  photoURL: string;
}

export interface RoleOption {
  value: string;
  label: string;
  color: string;
}

/**
 * Error map: each field of FormData can have a string error,
 * plus we allow arbitrary keys (like "global") if needed.
 */
export type ValidationErrors = {
  [K in keyof FormData]?: string;
} & {
  [key: string]: string | undefined;
};