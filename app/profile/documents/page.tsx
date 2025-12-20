"use client";

import { useEffect, useState } from "react";

const API_BASE = "http://localhost:5000/hrm/documents";

interface DocumentItem {
  _id: string;
  docType: string;
  document: {
    url: string;
    format: string;
  };
  verified: boolean;
  uploadedAt: string;
}

interface User {
  id: string;
  role: "user" | "admin" | "hr" | "super_admin";
}

export default function DocumentsPage() {
  const [docs, setDocs] = useState<DocumentItem[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [file, setFile] = useState<File | null>(null);

  const DOCUMENT_TYPES = [
    "AADHAAR",
    "PAN",
    "PASSPORT",
    "DRIVING_LICENSE",
    "VOTER_ID",
    "BANK_PROOF",
    "SALARY_SLIP",
    "OFFER_LETTER",
    "APPOINTMENT_LETTER",
    "EXPERIENCE_LETTER",
    "RESUME",
    "PHOTO",
    "EDUCATION_CERTIFICATE",
    "OTHER",
  ] as const;

  type DocumentType = (typeof DOCUMENT_TYPES)[number];

  const [docType, setDocType] = useState<DocumentType | "">("");

  /* ---------------- FETCH USER ---------------- */
  const fetchMe = async () => {
    const res = await fetch("http://localhost:5000/hrm/auth/me", {
      credentials: "include",
    });
    const data = await res.json();
    setUser({ id: data.id, role: data.role });
  };

  /* ---------------- FETCH DOCS ---------------- */
  const fetchDocs = async (empId: string) => {
    const res = await fetch(`${API_BASE}/${empId}`, {
      credentials: "include",
    });
    const data = await res.json();
    setDocs(Array.isArray(data) ? data : []);
  };

  useEffect(() => {
    fetchMe();
  }, []);

  useEffect(() => {
    if (user) fetchDocs(user.id);
  }, [user]);

  /* ---------------- UPLOAD ---------------- */
  const uploadDoc = async () => {
    if (!file || !docType) return;

    const form = new FormData();
    form.append("file", file);
    form.append("docType", docType);

    await fetch(`${API_BASE}/upload`, {
      method: "POST",
      body: form,
      credentials: "include",
    });

    setFile(null);
    setDocType("");
    fetchDocs(user!.id);
  };

  /* ---------------- VERIFY ---------------- */
  const verifyDoc = async (docId: string) => {
    await fetch(`${API_BASE}/verify/${user!.id}/${docId}`, {
      method: "PUT",
      credentials: "include",
    });
    fetchDocs(user!.id);
  };

  /* ---------------- DELETE ---------------- */
  const deleteDoc = async (docId: string) => {
    await fetch(`${API_BASE}/${user!.id}/${docId}`, {
      method: "DELETE",
      credentials: "include",
    });
    fetchDocs(user!.id);
  };

  /* ---------------- REUPLOAD ---------------- */
  const reuploadDoc = async (docId: string) => {
    if (!file) return;

    const form = new FormData();
    form.append("file", file);

    await fetch(`${API_BASE}/reupload/${docId}`, {
      method: "PUT",
      body: form,
      credentials: "include",
    });

    setFile(null);
    fetchDocs(user!.id);
  };

  /* ================= UI ================= */
  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 via-white to-indigo-50 p-8">
      <h1 className="text-4xl font-bold text-slate-800 mb-8">My Documents</h1>

      {/* UPLOAD CARD */}
      <div className="mb-10 rounded-3xl bg-white shadow-xl shadow-slate-200/60 p-6 max-w-xl">
        <h2 className="text-lg font-semibold text-slate-700 mb-4">
          Upload Document
        </h2>

        <select
          value={docType}
          onChange={(e) => setDocType(e.target.value as DocumentType)}
          className="w-full mb-4 px-4 py-3 rounded-xl bg-slate-100 focus:bg-white focus:ring-2 focus:ring-blue-400 outline-none transition"
        >
          <option value="" disabled>
            Select Document Type
          </option>

          {DOCUMENT_TYPES.map((type) => (
            <option key={type} value={type}>
              {type.replace(/_/g, " ")}
            </option>
          ))}
        </select>

        <input
          type="file"
          className="w-full mb-4"
          onChange={(e) => setFile(e.target.files?.[0] || null)}
        />

        <button
          onClick={uploadDoc}
          className={`w-full py-3 rounded-xl font-medium transition
    ${
      !docType || !file
        ? "bg-slate-300 text-slate-500 cursor-not-allowed"
        : "bg-gradient-to-r from-blue-500 to-indigo-500 text-white hover:opacity-90"
    }`}
        >
          Upload Document
        </button>
      </div>

      {/* DOCUMENT CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {docs.map((d) => (
          <div
            key={d._id}
            className="rounded-3xl bg-white shadow-lg shadow-slate-200/60 p-6"
          >
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-lg font-semibold text-slate-800">
                  {d.docType}
                </h3>
                <p className="text-xs text-slate-400">
                  {new Date(d.uploadedAt).toLocaleDateString()}
                </p>
              </div>

              <span
                className={`text-xs px-3 py-1 rounded-full ${
                  d.verified
                    ? "bg-green-100 text-green-700"
                    : "bg-yellow-100 text-yellow-700"
                }`}
              >
                {d.verified ? "Verified" : "Pending"}
              </span>
            </div>

            <a
              href={d.document.url}
              target="_blank"
              className="block mt-4 text-blue-600 text-sm hover:underline"
            >
              View Document
            </a>

            {/* ACTIONS */}
            <div className="mt-6 flex flex-wrap gap-3">
              {!d.verified && user?.role === "user" && (
                <>
                  <button
                    onClick={() => reuploadDoc(d._id)}
                    className="px-4 py-1.5 rounded-xl bg-sky-100 text-sky-700 text-sm"
                  >
                    Reupload
                  </button>

                  <button
                    onClick={() => deleteDoc(d._id)}
                    className="px-4 py-1.5 rounded-xl bg-red-100 text-red-700 text-sm"
                  >
                    Delete
                  </button>
                </>
              )}

              {!d.verified &&
                (user?.role === "admin" || user?.role === "hr") && (
                  <button
                    onClick={() => verifyDoc(d._id)}
                    className="px-4 py-1.5 rounded-xl bg-green-100 text-green-700 text-sm"
                  >
                    Verify
                  </button>
                )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
