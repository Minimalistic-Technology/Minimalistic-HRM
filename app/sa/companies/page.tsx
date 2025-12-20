"use client";

import { useEffect, useState } from "react";

const API_BASE_URL = "http://localhost:5000/hrm/company";

const COMPANY_TYPES = [
  "IT",
  "Finance",
  "Manufacturing",
  "Service",
  "Other",
] as const;

/* ================= TYPES ================= */

interface CompanyLeaves {
  totalLeaves: number;
  casualLeaves: number;
  sickLeaves: number;
}

interface Company {
  _id: string;
  companyID: string;
  name: string;
  companyType: string;
  status?: string;
  employeeCount?: number;
  CompanyLeaves?: CompanyLeaves;
}

/* ================= COMPONENT ================= */

export default function CompanyManagementPage() {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);

  /* ================= CREATE ================= */
  const [createForm, setCreateForm] = useState({
    name: "",
    companyType: "",
  });

  /* ================= EDIT ================= */
  const [editForm, setEditForm] = useState({
    name: "",
    companyType: "",
    status: "",
    CompanyLeaves: {
      totalLeaves: 0,
      casualLeaves: 0,
      sickLeaves: 0,
    },
  });

  /* ================= FETCH COMPANIES ================= */
  const fetchCompanies = async () => {
    const res = await fetch(API_BASE_URL, {
      credentials: "include",
    });
    const data = await res.json();
    setCompanies(Array.isArray(data) ? data : []);
  };

  useEffect(() => {
    fetchCompanies();
  }, []);

  /* ================= CREATE COMPANY ================= */
  const createCompany = async () => {
    await fetch(`${API_BASE_URL}/add`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(createForm),
    });

    setCreateForm({ name: "", companyType: "" });
    fetchCompanies();
  };

  /* ================= SELECT COMPANY ================= */
  const selectCompany = (company: Company) => {
    setSelectedCompany(company);

    setEditForm({
      name: company.name,
      companyType: company.companyType,
      status: company.status || "",
      CompanyLeaves: {
        totalLeaves: company.CompanyLeaves?.totalLeaves || 0,
        casualLeaves: company.CompanyLeaves?.casualLeaves || 0,
        sickLeaves: company.CompanyLeaves?.sickLeaves || 0,
      },
    });
  };

  /* ================= UPDATE COMPANY ================= */
  const updateCompany = async () => {
    if (!selectedCompany) return;

    await fetch(`${API_BASE_URL}/${selectedCompany._id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(editForm),
    });

    setSelectedCompany(null);
    fetchCompanies();
  };

  /* ================= UI ================= */
 return (
  <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 p-8">
    {/* HEADER */}
    <div className="mb-10">
      <h1 className="text-4xl font-bold text-slate-800">
        Company Management
      </h1>
      <p className="text-slate-500 mt-2">
        Manage organizations and leave policies
      </p>
    </div>

    {/* COMPANY CARDS */}
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
      {companies.map((c) => (
        <div
          key={c._id}
          className="rounded-3xl bg-white shadow-lg shadow-slate-200/60 hover:shadow-xl transition-all p-6 relative overflow-hidden"
        >
          {/* Accent */}
          <div className="absolute top-0 left-0 h-1 w-full bg-gradient-to-r from-blue-500 to-indigo-500" />

          <div className="flex items-start justify-between">
            <div>
              <h3 className="text-xl font-semibold text-slate-800">
                {c.name}
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                ID: {c.companyID}
              </p>
            </div>

            <span className="text-xs px-3 py-1 rounded-full bg-blue-100 text-blue-700">
              {c.companyType}
            </span>
          </div>

          <div className="mt-6 flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-400">Employees</p>
              <p className="text-2xl font-bold text-slate-800">
                {c.employeeCount ?? 0}
              </p>
            </div>

            <button
              onClick={() => selectCompany(c)}
              className="text-sm font-medium text-white bg-gradient-to-r from-blue-500 to-indigo-500 px-4 py-2 rounded-xl hover:opacity-90 transition"
            >
              Edit
            </button>
          </div>
        </div>
      ))}
    </div>

    {/* FORMS */}
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-14">
      {/* CREATE */}
      <div className="rounded-3xl bg-white shadow-xl shadow-slate-200/60 p-8">
        <h2 className="text-2xl font-semibold text-slate-800 mb-6">
          Create Company
        </h2>

        <div className="space-y-4">
          <input
            className="w-full px-5 py-3 rounded-xl bg-slate-100 focus:bg-white focus:ring-2 focus:ring-blue-400 outline-none transition"
            placeholder="Company Name"
            value={createForm.name}
            onChange={(e) =>
              setCreateForm({ ...createForm, name: e.target.value })
            }
          />

          <select
            className="w-full px-5 py-3 rounded-xl bg-slate-100 focus:bg-white focus:ring-2 focus:ring-blue-400 outline-none transition"
            value={createForm.companyType}
            onChange={(e) =>
              setCreateForm({ ...createForm, companyType: e.target.value })
            }
          >
            <option value="">Select Company Type</option>
            {COMPANY_TYPES.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>

          <button
            onClick={createCompany}
            className="w-full py-3 rounded-xl text-white font-medium bg-gradient-to-r from-blue-500 to-indigo-500 hover:opacity-90 transition"
          >
            Create Company
          </button>
        </div>
      </div>

      {/* EDIT */}
      <div className="rounded-3xl bg-white shadow-xl shadow-slate-200/60 p-8">
        <h2 className="text-2xl font-semibold text-slate-800 mb-6">
          Edit Company
        </h2>

        {!selectedCompany ? (
          <div className="h-48 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400">
            Select a company card to edit
          </div>
        ) : (
          <div className="space-y-5">
            <input
              className="w-full px-5 py-3 rounded-xl bg-slate-100 focus:bg-white focus:ring-2 focus:ring-green-400 outline-none transition"
              value={editForm.name}
              onChange={(e) =>
                setEditForm({ ...editForm, name: e.target.value })
              }
            />

            <select
              className="w-full px-5 py-3 rounded-xl bg-slate-100 focus:bg-white focus:ring-2 focus:ring-green-400 outline-none transition"
              value={editForm.companyType}
              onChange={(e) =>
                setEditForm({
                  ...editForm,
                  companyType: e.target.value,
                })
              }
            >
              {COMPANY_TYPES.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>

            {/* LEAVES */}
            <div className="rounded-2xl bg-gradient-to-br from-green-50 to-emerald-50 p-5">
              <p className="text-sm font-semibold text-slate-700 mb-4">
                Leave Policy
              </p>

              <div className="grid grid-cols-3 gap-4">
                {[
                  { label: "Total", key: "totalLeaves" },
                  { label: "Casual", key: "casualLeaves" },
                  { label: "Sick", key: "sickLeaves" },
                ].map(({ label, key }) => (
                  <div key={key}>
                    <p className="text-xs text-slate-500 mb-1">
                      {label}
                    </p>
                    <input
                      type="number"
                      min={0}
                      className="w-full px-4 py-2 rounded-xl bg-white shadow-sm focus:ring-2 focus:ring-green-400 outline-none"
                      value={(editForm.CompanyLeaves as any)[key]}
                      onChange={(e) =>
                        setEditForm({
                          ...editForm,
                          CompanyLeaves: {
                            ...editForm.CompanyLeaves,
                            [key]: Number(e.target.value),
                          },
                        })
                      }
                    />
                  </div>
                ))}
              </div>
            </div>

            <button
              onClick={updateCompany}
              className="w-full py-3 rounded-xl text-white font-medium bg-gradient-to-r from-green-500 to-emerald-500 hover:opacity-90 transition"
            >
              Save Changes
            </button>
          </div>
        )}
      </div>
    </div>
  </div>
);
}
