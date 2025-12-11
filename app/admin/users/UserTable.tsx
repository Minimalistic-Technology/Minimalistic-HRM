// app/admin/users/UserTable.tsx
"use client";

import { User, Mail, Shield, Edit2, Trash2 } from "lucide-react";
import { UserType, RoleOption } from "./types";

interface UserTableProps {
  users: UserType[];
  roles: RoleOption[];
  loading: boolean;
  onEdit: (user: UserType) => void;
  onDelete: (id: string, name: string) => void;
}

const UserTable: React.FC<UserTableProps> = ({
  users,
  roles,
  loading,
  onEdit,
  onDelete,
}) => {
  const getRoleInfo = (roleValue: string): RoleOption =>
    roles.find((r) => r.value === roleValue) || roles[1];

  const formatDate = (dateString: string): string =>
    new Date(dateString).toLocaleDateString();

  if (users.length === 0) {
    return (
      <div className="text-center py-12">
        <User className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">No users yet</h3>
        <p className="text-gray-600">Get started by adding your first user.</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-gray-200">
            <th className="text-left py-3 px-4 font-medium text-gray-700">
              User
            </th>
            <th className="text-left py-3 px-4 font-medium text-gray-700">
              Email
            </th>
            <th className="text-left py-3 px-4 font-medium text-gray-700">
              Role
            </th>
            <th className="text-left py-3 px-4 font-medium text-gray-700">
              Created
            </th>
            <th className="text-left py-3 px-4 font-medium text-gray-700">
              Actions
            </th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => {
            const roleInfo = getRoleInfo(user.role);
            return (
              <tr
                key={user._id}
                className="border-b border-gray-100 hover:bg-gray-50"
              >
                <td className="py-4 px-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                      <User className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <div className="font-medium text-gray-900">
                        {user.name}
                      </div>
                    </div>
                  </div>
                </td>

                <td className="py-4 px-4">
                  <div className="flex items-center gap-2 text-gray-600">
                    <Mail className="w-4 h-4" />
                    {user.email}
                  </div>
                </td>

                <td className="py-4 px-4">
                  <span
                    className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${roleInfo.color}`}
                  >
                    <Shield className="w-3 h-3" />
                    {roleInfo.label}
                  </span>
                </td>

                <td className="py-4 px-4 text-gray-600">
                  {user.dateOfJoin
                    ? formatDate(user.dateOfJoin)
                    : user.createdAt
                    ? formatDate(user.createdAt)
                    : "-"}
                </td>

                <td className="py-4 px-4">
                  <div className="flex gap-2">
                    <button
                      onClick={() => onEdit(user)}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      title="Edit user"
                      disabled={loading}
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => onDelete(user._id, user.name)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Delete user"
                      disabled={loading}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      {users.length > 0 && (
        <div className="px-4 py-3 bg-gray-50 border-t border-gray-200">
          <p className="text-sm text-gray-600">
            Total users: <span className="font-medium">{users.length}</span>
          </p>
        </div>
      )}
    </div>
  );
};

export default UserTable;
