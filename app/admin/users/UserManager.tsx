// app/admin/users/UserManager.tsx
"use client";

import React, { useEffect, useState } from "react";
import { User, Plus, Loader2, AlertCircle } from "lucide-react";
import {
  UserType,
  FormData,
  RoleOption,
  ValidationErrors,
  Company,
} from "./types";
import { getAuthToken } from "../../functions/helperFunctions";
import UserForm from "./UserForm";
import UserTable from "./UserTable";
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASEURL + "/hrm";

const roles: RoleOption[] = [
  { value: "admin", label: "Administrator", color: "bg-red-50 text-red-800" },
  {
    value: "super_admin",
    label: "Super Administrator",
    color: "bg-red-100 text-red-800",
  },
  { value: "user", label: "User", color: "bg-green-100 text-green-800" },
  { value: "hr", label: "HR", color: "bg-blue-100 text-blue-800" },
];

const UserManager: React.FC = () => {
  const [users, setUsers] = useState<UserType[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingUser, setEditingUser] = useState<UserType | null>(null);
  const [loading, setLoading] = useState(false);
  const [fetchingUsers, setFetchingUsers] = useState(true);
  const [validationErrors, setValidationErrors] = useState<ValidationErrors>(
    {}
  );

  const [formData, setFormData] = useState<FormData>({
    name: "",
    email: "",
    password: "",
    role: "user",
    contact: "",
    address: "",
    photoURL: "",
    companyID: "",
  });
  const [companies, setCompanies] = useState<Company[]>([]);

  useEffect(() => {
    fetchCompanies();
  }, []);

  const fetchCompanies = async () => {
    const res = await fetch(`${API_BASE_URL}/company`, {
      headers: {
        Authorization: `Bearer ${getAuthToken()}`,
      },
      credentials: "include",
    });

    const data = await res.json();
    setCompanies(Array.isArray(data) ? data : []);
  };

  // token helper

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return emailRegex.test(email.toLowerCase());
  };

  const validatePassword = (
    password: string
  ): { isValid: boolean; errors: string[] } => {
    const errors: string[] = [];

    if (password.length < 8) {
      errors.push("At least 8 characters long");
    }
    if (!/[A-Z]/.test(password)) {
      errors.push("At least one uppercase letter");
    }
    if (!/[a-z]/.test(password)) {
      errors.push("At least one lowercase letter");
    }
    if (!/[0-9]/.test(password)) {
      errors.push("At least one number");
    }

    // 🔹 define the regex separately, simpler for TS parser
    const specialCharRegex = /[!@#$%^&*(),.?":{}|<>]/;
    if (!specialCharRegex.test(password)) {
      errors.push('At least one special character (!@#$%^&*(),.?":{}|<>)');
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  };

  const getPasswordStrength = (password: string) => {
    if (!password) return { strength: "", color: "" };

    const validation = validatePassword(password);
    const score = 5 - validation.errors.length;

    if (score === 5)
      return { strength: "Very Strong", color: "text-green-600" };
    if (score === 4) return { strength: "Strong", color: "text-blue-600" };
    if (score === 3) return { strength: "Medium", color: "text-yellow-600" };
    if (score === 2) return { strength: "Weak", color: "text-orange-600" };
    return { strength: "Very Weak", color: "text-red-600" };
  };

  const checkEmailExists = (email: string, excludeUserId?: string): boolean =>
    users.some(
      (user) =>
        user.email.toLowerCase() === email.toLowerCase() &&
        user._id !== excludeUserId
    );

  const formatEmail = (email: string): string => email.toLowerCase().trim();

  const validateForm = (): boolean => {
    const errors: ValidationErrors = {};
    let isValid = true;

    // name
    if (!formData.name.trim()) {
      errors.name = "Name is required";
      isValid = false;
    }

    // email
    if (!formData.email.trim()) {
      errors.email = "Email is required";
      isValid = false;
    } else if (!validateEmail(formData.email)) {
      errors.email =
        "Please enter a valid email address (e.g., user@example.com)";
      isValid = false;
    } else if (checkEmailExists(formData.email, editingUser?._id)) {
      errors.email = "This email address is already registered";
      isValid = false;
    }

    // password
    if (!editingUser && !formData.password) {
      errors.password = "Password is required";
      isValid = false;
    } else if (formData.password) {
      const passwordValidation = validatePassword(formData.password);
      if (!passwordValidation.isValid) {
        errors.password = `Password must contain: ${passwordValidation.errors.join(
          ", "
        )}`;
        isValid = false;
      }
    }

    // role
    if (!formData.role) {
      errors.role = "Please select a role";
      isValid = false;
    }

    setValidationErrors(errors);
    return isValid;
  };

  const fetchUsers = async (): Promise<void> => {
    try {
      setFetchingUsers(true);
      const token = getAuthToken();

      const headers: Record<string, string> = {
        "Content-Type": "application/json",
      };
      if (token) headers["Authorization"] = `Bearer ${token}`;

      const response = await fetch(`${API_BASE_URL}/auth/users`, {
        method: "GET",
        headers,
        credentials: "include",
      });

      if (response.ok) {
        const fetchedUsers = await response.json();
        setUsers(fetchedUsers);
      } else {
        const errorText = await response.text();
        console.error("Failed to fetch users:", response.status, errorText);
        alert(
          `Failed to fetch users: ${response.status} ${response.statusText}`
        );
      }
    } catch (error) {
      console.error("Error fetching users:", error);
      alert("Failed to fetch users. Please check your connection.");
    } finally {
      setFetchingUsers(false);
    }
  };

  const addUser = async (userData: FormData): Promise<boolean> => {
    try {
      const response = await fetch(`${API_BASE_URL}/company/add-user`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          name: userData.name,
          email: formatEmail(userData.email),
          password: userData.password,
          role: userData.role,
          contact: userData.contact,
          address: userData.address,
          photoURL: userData.photoURL,
          companyID: userData.companyID,
        }),
      });

      if (response.ok) {
        await response.json();
        return true;
      } else {
        const error = await response
          .json()
          .catch(() => ({ message: "Failed to add user" }));
        if (error.message && error.message.toLowerCase().includes("email")) {
          setValidationErrors({
            email: "This email address is already registered",
          });
        }
        alert(error.message || "Failed to add user");
        return false;
      }
    } catch (error) {
      console.error("Error adding user:", error);
      alert("Failed to add user. Please check your connection.");
      return false;
    }
  };

  const updateUser = async (
    userId: string,
    userData: Partial<FormData>
  ): Promise<boolean> => {
    try {
      const token = getAuthToken();
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
      };
      if (token) headers["Authorization"] = `Bearer ${token}`;

      const updateData: any = { ...userData };
      if (!updateData.password) delete updateData.password;
      if (updateData.email) updateData.email = formatEmail(updateData.email);

      const response = await fetch(`${API_BASE_URL}/auth/user/${userId}`, {
        method: "PUT",
        headers,
        credentials: "include",
        body: JSON.stringify(updateData),
      });

      if (response.ok) {
        await response.json();
        return true;
      } else {
        const error = await response
          .json()
          .catch(() => ({ message: "Failed to update user" }));
        if (error.message && error.message.toLowerCase().includes("email")) {
          setValidationErrors({
            email: "This email address is already registered",
          });
        }
        alert(error.message || "Failed to update user");
        return false;
      }
    } catch (error) {
      console.error("Error updating user:", error);
      alert("Failed to update user. Please check your connection.");
      return false;
    }
  };

  const deleteUserAPI = async (userId: string): Promise<boolean> => {
    try {
      const token = getAuthToken();
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
      };
      if (token) headers["Authorization"] = `Bearer ${token}`;

      const response = await fetch(`${API_BASE_URL}/auth/user/${userId}`, {
        method: "DELETE",
        headers,
        credentials: "include",
      });

      if (response.ok) {
        await response.json();
        return true;
      } else {
        const error = await response
          .json()
          .catch(() => ({ message: "Failed to delete user" }));
        alert(error.message || "Failed to delete user");
        return false;
      }
    } catch (error) {
      console.error("Error deleting user:", error);
      alert("Failed to delete user. Please check your connection.");
      return false;
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const resetForm = () => {
    setFormData({
      name: "",
      email: "",
      password: "",
      role: "user",
      contact: "",
      address: "",
      photoURL: "",
      companyID: "",
    });
    setEditingUser(null);
    setShowForm(false);
    setValidationErrors({});
  };

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));

   
    if (validationErrors[field]) {
      setValidationErrors((prev) => {
        const { [field]: _removed, ...rest } = prev;
        return rest;
      });
    }
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      if (editingUser) {
        const success = await updateUser(editingUser._id, formData);
        if (success) {
          await fetchUsers();
          alert("User updated successfully!");
          resetForm();
        }
      } else {
        const success = await addUser(formData);
        if (success) {
          await fetchUsers();
          alert("User added successfully!");
          resetForm();
        }
      }
    } catch (error) {
      console.error("Error in handleSubmit:", error);
      alert("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (user: UserType) => {
    setFormData({
      name: user.name,
      email: user.email,
      password: "",
      role: user.role,
      contact: user.contact || "",
      address: user.address || "",
      photoURL: user.photoURL || "",
      companyID: user.companyID || "",
    });
    setEditingUser(user);
    setShowForm(true);
    setValidationErrors({});
  };

  const handleDelete = async (userId: string, name: string) => {
    if (
      window.confirm(
        `Are you sure you want to delete user "${name}"? This action cannot be undone.`
      )
    ) {
      setLoading(true);
      try {
        const success = await deleteUserAPI(userId);
        if (success) {
          await fetchUsers();
          alert("User deleted successfully!");
        }
      } catch (error) {
        console.error("Error deleting user:", error);
        alert("Failed to delete user. Please try again.");
      } finally {
        setLoading(false);
      }
    }
  };

  const passwordStrength = getPasswordStrength(formData.password);

  if (fetchingUsers) {
    return (
      <div className="max-w-6xl mx-auto p-6 bg-gray-50 min-h-screen">
        <div className="bg-white rounded-lg shadow-sm p-12">
          <div className="flex items-center justify-center">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600 mr-3" />
            <span className="text-lg text-gray-600">Loading users...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6 bg-gray-50 min-h-screen">
      <div className="bg-white rounded-lg shadow-sm">
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <User className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  User Management
                </h1>
                <p className="text-gray-600">
                  Manage users, roles, and permissions
                </p>
              </div>
            </div>
            <button
              onClick={() => setShowForm(true)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              disabled={loading}
            >
              <Plus className="w-4 h-4" />
              Add User
            </button>
          </div>
        </div>

        {/* Form */}
        {showForm && (
          <UserForm
            formData={formData}
            onChange={handleInputChange}
            onSubmit={handleSubmit}
            onCancel={resetForm}
            roles={roles}
            validationErrors={validationErrors}
            loading={loading}
            editingUser={editingUser}
            passwordStrength={passwordStrength}
            validateEmail={validateEmail}
            companies={companies} // ✅ ADD THIS
          />
        )}

        {/* Users list */}
        <div className="p-6">
          <div className="mb-4 p-4 bg-gray-100 rounded-lg flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-gray-500" />
            <p className="text-sm text-gray-600">
              Users count: <span className="font-medium">{users.length}</span>
            </p>
          </div>

          <UserTable
            users={users}
            roles={roles}
            loading={loading}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        </div>
      </div>
    </div>
  );
};

export default UserManager;
