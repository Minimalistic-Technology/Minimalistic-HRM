"use client";

import { useEffect, useState } from "react";
import axios from "axios";

interface Profile {
  name: string;
  email: string;
  role: string;
  contact?: string;
  address?: string;
  dateOfJoin?: string;
  photoURL?: string;
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASEURL + "/hrm";

const DEFAULT_AVATAR =
  "https://ui-avatars.com/api/?name=User&background=6366f1&color=fff";

const ProfilePage = () => {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [formData, setFormData] = useState<Partial<Profile>>({});
  const [editOpen, setEditOpen] = useState(false);

  useEffect(() => {
    axios
      .get(`${API_BASE_URL}/auth/me`, { withCredentials: true })
      .then((res) => {
        setProfile(res.data);
        setFormData(res.data);
      });
  }, []);

  const handleUpdate = async () => {
    const res = await axios.put(
      `${API_BASE_URL}/auth/update-profile`,
      formData,
      { withCredentials: true }
    );
    setProfile(res.data);
    setEditOpen(false);
  };

  if (!profile)
    return <p className="mt-20 text-center text-gray-500">Loading…</p>;

  return (
    <>
      {/* Profile Card */}
      <div className="max-w-4xl mx-auto mt-16 rounded-2xl overflow-hidden bg-white shadow-sm border">
        {/* Header */}
        <div className="h-32 bg-gradient-to-r from-indigo-500 to-blue-500" />

        {/* Identity Card */}
        <div className="relative px-8">
          <div className="-mt-16 bg-white rounded-xl shadow-md p-6 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <img
                src={profile.photoURL || DEFAULT_AVATAR}
                className="w-24 h-24 rounded-full border object-cover"
              />

              <div>
                <h2 className="text-xl font-semibold text-gray-800">
                  {profile.name}
                </h2>
                <p className="text-sm text-gray-500">{profile.email}</p>
                <span className="inline-block mt-2 px-3 py-1 text-xs rounded-full bg-indigo-50 text-indigo-700">
                  {profile.role.toUpperCase()}
                </span>
              </div>
            </div>

            <button
              onClick={() => setEditOpen(true)}
              className="px-4 py-2 text-sm rounded-md bg-indigo-600 text-white hover:bg-indigo-700 transition"
            >
              Edit Profile
            </button>
          </div>

          {/* Info Sections */}
          <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
            <Info label="Contact" value={profile.contact} />
            <Info label="Address" value={profile.address} />
            <Info
              label="Date of Joining"
              value={
                profile.dateOfJoin
                  ? new Date(profile.dateOfJoin).toDateString()
                  : "-"
              }
            />
          </div>
        </div>
      </div>

      {/* Edit Modal */}
      {editOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center">
          <div className="bg-white w-full max-w-md rounded-xl shadow-lg p-6">
            <h3 className="text-lg font-semibold mb-4">Edit Profile</h3>

            <div className="space-y-4">
              <Input
                label="Name"
                value={formData.name || ""}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
              />
              <Input
                label="Contact"
                value={formData.contact || ""}
                onChange={(e) =>
                  setFormData({ ...formData, contact: e.target.value })
                }
              />
              <Input
                label="Address"
                value={formData.address || ""}
                onChange={(e) =>
                  setFormData({ ...formData, address: e.target.value })
                }
              />
              <Input
                label="Photo URL"
                value={formData.photoURL || ""}
                onChange={(e) =>
                  setFormData({ ...formData, photoURL: e.target.value })
                }
              />
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => setEditOpen(false)}
                className="px-4 py-2 text-sm border rounded-md"
              >
                Cancel
              </button>
              <button
                onClick={handleUpdate}
                className="px-4 py-2 text-sm bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

/* Small reusable components */

const Info = ({ label, value }: { label: string; value?: string }) => (
  <div className="bg-gray-50 rounded-lg p-4">
    <p className="text-xs text-gray-500">{label}</p>
    <p className="text-sm font-medium text-gray-800">{value || "-"}</p>
  </div>
);

const Input = ({
  label,
  ...props
}: {
  label: string;
} & React.InputHTMLAttributes<HTMLInputElement>) => (
  <div>
    <label className="block text-xs text-gray-600 mb-1">{label}</label>
    <input
      {...props}
      className="w-full px-3 py-2 border rounded-md text-sm focus:ring-2 focus:ring-indigo-200 outline-none"
    />
  </div>
);

export default ProfilePage;
