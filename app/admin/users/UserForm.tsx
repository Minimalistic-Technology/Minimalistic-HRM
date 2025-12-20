// app/admin/users/UserForm.tsx
"use client";

import { Eye, EyeOff, AlertCircle, CheckCircle } from "lucide-react";
import {
  FormData,
  RoleOption,
  ValidationErrors,
  UserType,
  Company,
} from "./types";
import { useState } from "react";

interface UserFormProps {
  formData: FormData;
  onChange: (field: keyof FormData, value: string) => void;
  onSubmit: () => void;
  onCancel: () => void;
  roles: RoleOption[];
  validationErrors: ValidationErrors;
  loading: boolean;
  editingUser: UserType | null;
  passwordStrength: { strength: string; color: string };
  validateEmail: (email: string) => boolean;
  companies: Company[]; // ✅ ADD
}

const UserForm: React.FC<UserFormProps> = ({
  formData,
  onChange,
  onSubmit,
  onCancel,
  roles,
  validationErrors,
  loading,
  editingUser,
  passwordStrength,
  validateEmail,
  companies,
}) => {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="p-6 bg-gray-50 border-b border-gray-200">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Name */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Name *
          </label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => onChange("name", e.target.value)}
            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
              validationErrors.name ? "border-red-500" : "border-gray-300"
            }`}
            placeholder="Enter name"
            disabled={loading}
          />
          {validationErrors.name && (
            <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
              <AlertCircle className="w-4 h-4" />
              {validationErrors.name}
            </p>
          )}
        </div>

        {/* Email */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Email Address *
          </label>
          <input
            type="email"
            value={formData.email}
            onChange={(e) => onChange("email", e.target.value)}
            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
              validationErrors.email ? "border-red-500" : "border-gray-300"
            }`}
            placeholder="user@example.com"
            disabled={loading}
          />
          {validationErrors.email && (
            <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
              <AlertCircle className="w-4 h-4" />
              {validationErrors.email}
            </p>
          )}
          {formData.email &&
            validateEmail(formData.email) &&
            !validationErrors.email && (
              <p className="mt-1 text-sm text-green-600 flex items-center gap-1">
                <CheckCircle className="w-4 h-4" />
                Valid email format
              </p>
            )}
        </div>

        {/* Password */}
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Password{" "}
            {editingUser ? (
              <span className="text-xs text-gray-500">
                (leave blank to keep current)
              </span>
            ) : (
              "*"
            )}
          </label>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              value={formData.password}
              onChange={(e) => onChange("password", e.target.value)}
              className={`w-full px-3 py-2 pr-10 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                validationErrors.password ? "border-red-500" : "border-gray-300"
              }`}
              placeholder={
                editingUser
                  ? "Enter new password"
                  : "Min 8 chars, upper, lower, number, special char"
              }
              disabled={loading}
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              disabled={loading}
            >
              {showPassword ? (
                <EyeOff className="w-4 h-4" />
              ) : (
                <Eye className="w-4 h-4" />
              )}
            </button>
          </div>

          {formData.password && passwordStrength.strength && (
            <div className="mt-2">
              <div className={`text-sm ${passwordStrength.color}`}>
                Password Strength: {passwordStrength.strength}
              </div>
            </div>
          )}

          {validationErrors.password && (
            <p className="mt-1 text-sm text-red-600 flex items-start gap-1">
              <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
              <span>{validationErrors.password}</span>
            </p>
          )}
        </div>

        {/* Role */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Role *
          </label>
          <select
            value={formData.role}
            onChange={(e) => onChange("role", e.target.value)}
            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
              validationErrors.role ? "border-red-500" : "border-gray-300"
            }`}
            disabled={loading}
          >
            {roles
              .filter((role) => role.value !== "super_admin")
              .map((role) => (
                <option key={role.value} value={role.value}>
                  {role.label}
                </option>
              ))}
          </select>
          {validationErrors.role && (
            <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
              <AlertCircle className="w-4 h-4" />
              {validationErrors.role}
            </p>
          )}
        </div>
        {/* Company */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Company *
          </label>
          <select
            value={formData.companyID}
            onChange={(e) => onChange("companyID", e.target.value)}
            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
              validationErrors.companyId ? "border-red-500" : "border-gray-300"
            }`}
            disabled={loading}
          >
            <option value="">Select Company</option>
            {companies.map((company) => (
              <option key={company._id} value={company._id}>
                {company.name}
              </option>
            ))}
          </select>

          {validationErrors.companyId && (
            <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
              <AlertCircle className="w-4 h-4" />
              {validationErrors.companyId}
            </p>
          )}
        </div>

        {/* Contact */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Contact
          </label>
          <input
            type="text"
            value={formData.contact}
            onChange={(e) => onChange("contact", e.target.value)}
            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent border-gray-300"
            placeholder="Enter contact number"
            disabled={loading}
          />
        </div>

        {/* Address */}
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Address
          </label>
          <textarea
            value={formData.address}
            onChange={(e) => onChange("address", e.target.value)}
            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent border-gray-300"
            placeholder="Enter address"
            disabled={loading}
            rows={2}
          />
        </div>

        {/* Photo URL */}
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Photo URL
          </label>
          <input
            type="url"
            value={formData.photoURL}
            onChange={(e) => onChange("photoURL", e.target.value)}
            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent border-gray-300"
            placeholder="https://example.com/profile.jpg"
            disabled={loading}
          />
        </div>

        {/* Actions */}
        <div className="md:col-span-2 flex gap-3 pt-4">
          <button
            onClick={onSubmit}
            disabled={loading}
            className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {editingUser ? "Update User" : "Add User"}
          </button>
          <button
            onClick={onCancel}
            disabled={loading}
            className="px-6 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default UserForm;
