"use client";

import AdminLayout from "../components/AdminLayout";
import ProtectedRoute from "../components/ProtectedRoute";
import { useState, useEffect, useCallback } from "react";
import {
  collection,
  getDocs,
  addDoc,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
  deleteDoc,
  doc
} from "firebase/firestore";
import { db } from "@/app/lib/firebase";

export default function AdminFinancePage() {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Add Record State
  const [type, setType] = useState("income");
  const [amount, setAmount] = useState("");
  const [desc, setDesc] = useState("");
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [category, setCategory] = useState("");
  const [customCategory, setCustomCategory] = useState("");
  const [saving, setSaving] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [error, setError] = useState("");

  // Planning State
  const [planning, setPlanning] = useState([]);
  const [planModalOpen, setPlanModalOpen] = useState(false);
  const [planDesc, setPlanDesc] = useState("");
  const [planAmount, setPlanAmount] = useState("");
  const [planDate, setPlanDate] = useState("");

  // Edit Record State
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editRecord, setEditRecord] = useState(null);
  const [editType, setEditType] = useState("");
  const [editAmount, setEditAmount] = useState("");
  const [editDesc, setEditDesc] = useState("");
  const [editDate, setEditDate] = useState("");
  const [editCategory, setEditCategory] = useState("");
  const [editCustomCategory, setEditCustomCategory] = useState("");

  // Edit Planning State
  const [editPlanModalOpen, setEditPlanModalOpen] = useState(false);
  const [editPlan, setEditPlan] = useState(null);
  const [editPlanDesc, setEditPlanDesc] = useState("");
  const [editPlanAmount, setEditPlanAmount] = useState("");
  const [editPlanDate, setEditPlanDate] = useState("");

  // Fetch functions wrapped in useCallback to be reusable
  const fetchRecords = useCallback(async () => {
    try {
      const q = query(collection(db, "financeRecords"), orderBy("createdAt", "desc"));
      const snap = await getDocs(q);
      const list = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      setRecords(list);
    } catch (err) {
      console.error("Failed to fetch records", err);
    }
  }, []);

  const fetchPlanning = useCallback(async () => {
    try {
      const q = query(collection(db, "financePlanning"), orderBy("createdAt", "desc"));
      const snap = await getDocs(q);
      const list = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      setPlanning(list);
    } catch (err) {
      console.error("Failed to fetch planning", err);
    }
  }, []);

  useEffect(() => {
    const init = async () => {
      setLoading(true);
      await Promise.all([fetchRecords(), fetchPlanning()]);
      setLoading(false);
    };
    init();
  }, [fetchRecords, fetchPlanning]);

  // --- HANDLERS: ADD RECORD ---
  const handleSave = async (e) => {
    e.preventDefault();
    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) return setError("Enter a valid amount.");
    setSaving(true);
    setError("");

    let recordCategory = category;
    if (type === "spending" && category === "custom" && customCategory.trim()) {
      recordCategory = customCategory.trim();
    }

    try {
      await addDoc(collection(db, "financeRecords"), {
        type,
        amount: Number(amount),
        desc,
        date,
        category: type === "spending" ? recordCategory : undefined,
        createdAt: serverTimestamp(),
      });
      
      // Reset form
      setAmount("");
      setDesc("");
      setCategory("");
      setCustomCategory("");
      setModalOpen(false);
      await fetchRecords(); // Refresh list
    } catch (err) {
      setError("Failed to save record. " + (err?.message || ""));
    } finally {
      setSaving(false);
    }
  };

  // --- HANDLERS: EDIT RECORD ---
  const openEditRecord = (rec) => {
    setEditRecord(rec);
    setEditType(rec.type);
    setEditAmount(rec.amount);
    setEditDesc(rec.desc || "");
    setEditDate(rec.date || "");
    setEditCategory(rec.category || "");
    setEditCustomCategory("");
    setEditModalOpen(true);
  };

  const handleEditRecord = async (e) => {
    e.preventDefault();
    if (!editAmount || isNaN(Number(editAmount)) || Number(editAmount) <= 0) return setError("Enter a valid amount.");
    setSaving(true);
    setError("");

    let recordCategory = editCategory;
    if (editType === "spending" && editCategory === "custom" && editCustomCategory.trim()) {
      recordCategory = editCustomCategory.trim();
    }

    try {
      await updateDoc(doc(db, "financeRecords", editRecord.id), {
        type: editType,
        amount: Number(editAmount),
        desc: editDesc,
        date: editDate,
        category: editType === "spending" ? recordCategory : undefined,
      });
      setEditModalOpen(false);
      setEditRecord(null);
      await fetchRecords();
    } catch (err) {
      setError("Failed to edit record. " + (err?.message || ""));
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteRecord = async (id) => {
    if (!window.confirm("Delete this record?")) return;
    try {
      await deleteDoc(doc(db, "financeRecords", id));
      await fetchRecords();
    } catch (err) {
      alert("Failed to delete record.");
    }
  };

  // --- HANDLERS: PLANNING ---
  const handlePlanSave = async (e) => {
    e.preventDefault();
    if (!planDesc || !planAmount || isNaN(Number(planAmount))) return;
    try {
      await addDoc(collection(db, "financePlanning"), {
        desc: planDesc,
        amount: parseFloat(planAmount),
        date: planDate,
        createdAt: serverTimestamp(),
      });
      setPlanDesc("");
      setPlanAmount("");
      setPlanDate("");
      setPlanModalOpen(false);
      await fetchPlanning();
    } catch (err) {
        setError("Failed to save plan.");
    }
  };

  const openEditPlan = (plan) => {
    setEditPlan(plan);
    setEditPlanDesc(plan.desc || "");
    setEditPlanAmount(plan.amount);
    setEditPlanDate(plan.date || "");
    setEditPlanModalOpen(true);
  };

  const handleEditPlan = async (e) => {
    e.preventDefault();
    if (!editPlanAmount || isNaN(Number(editPlanAmount)) || Number(editPlanAmount) <= 0) return;
    try {
      await updateDoc(doc(db, "financePlanning", editPlan.id), {
        desc: editPlanDesc,
        amount: Number(editPlanAmount),
        date: editPlanDate,
      });
      setEditPlanModalOpen(false);
      setEditPlan(null);
      await fetchPlanning();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeletePlan = async (id) => {
    if (!window.confirm("Delete this plan?")) return;
    try {
      await deleteDoc(doc(db, "financePlanning", id));
      await fetchPlanning();
    } catch (err) {
      console.error(err);
    }
  };

  const totalIncome = records.filter(r => r.type === "income").reduce((sum, r) => sum + (r.amount || 0), 0);
  const totalSpending = records.filter(r => r.type === "spending").reduce((sum, r) => sum + (r.amount || 0), 0);
  const balance = totalIncome - totalSpending;

  return (
    <ProtectedRoute>
      <AdminLayout>
        <div className="p-0 md:p-8 min-h-screen">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold">Finance Tracker</h1>
            <button className="btn btn-info" onClick={() => setModalOpen(true)}>
              Add Record
            </button>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="card p-6 shadow-md bg-base-100">
              <h2 className="text-lg font-bold mb-2">Total Income</h2>
              <div className="text-2xl font-bold text-success">${totalIncome.toFixed(2)}</div>
            </div>
            <div className="card p-6 shadow-md bg-base-100">
              <h2 className="text-lg font-bold mb-2">Total Spending</h2>
              <div className="text-2xl font-bold text-error">${totalSpending.toFixed(2)}</div>
            </div>
            <div className="card p-6 shadow-md bg-base-100">
              <h2 className="text-lg font-bold mb-2">Balance</h2>
              <div className={`text-2xl font-bold ${balance >= 0 ? "text-success" : "text-error"}`}>${balance.toFixed(2)}</div>
            </div>
          </div>

          {/* Planning to Buy section */}
          <div className="mb-8">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-bold">Planning to Buy</h2>
              <button className="btn btn-outline btn-sm" onClick={() => setPlanModalOpen(true)}>
                Add Plan
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {planning.length === 0 && <div className="col-span-full text-center py-6 text-gray-500">No plans yet.</div>}
              {planning.map((plan) => (
                <div key={plan.id} className="card p-4 shadow-sm flex flex-col gap-1 border border-base-200 bg-base-100">
                  <div className="flex justify-between items-start">
                    <div className="font-bold">{plan.desc}</div>
                    <div className="badge badge-ghost">${plan.amount?.toFixed(2)}</div>
                  </div>
                  <div className="text-xs text-gray-500">Planned: {plan.date || "—"}</div>
                  <div className="flex justify-end gap-2 mt-2">
                    <button className="btn btn-xs btn-ghost" onClick={() => openEditPlan(plan)}>Edit</button>
                    <button className="btn btn-xs btn-ghost text-error" onClick={() => handleDeletePlan(plan.id)}>Delete</button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Records List */}
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <span className="loading loading-spinner loading-lg"></span>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {records.length === 0 && (
                <div className="col-span-full text-center py-12 text-gray-500">No records yet.</div>
              )}
              {records.map((rec) => (
                <div key={rec.id} className="card p-6 shadow-md flex flex-col gap-2 border border-base-200 bg-base-100">
                  <div className="flex justify-between items-center mb-2">
                    <span className={`badge ${rec.type === "income" ? "badge-success" : "badge-error"}`}>{rec.type === "income" ? "Income" : "Spending"}</span>
                    <div className="font-bold text-lg">${rec.amount?.toFixed(2)}</div>
                  </div>
                  <div className="text-sm mb-1 font-semibold">{rec.desc || "No description"}</div>
                  <div className="text-xs mb-1 text-gray-500">Date: {rec.date || (rec.createdAt?.toDate ? rec.createdAt.toDate().toLocaleDateString() : "—")}</div>
                  {rec.type === "spending" && rec.category && (
                    <div className="text-xs mb-1 badge badge-outline badge-sm">{rec.category}</div>
                  )}
                  <div className="card-actions justify-end mt-2 pt-2 border-t border-base-200">
                     <button className="btn btn-sm btn-ghost" onClick={() => openEditRecord(rec)}>Edit</button>
                     <button className="btn btn-sm btn-ghost text-error" onClick={() => handleDeleteRecord(rec.id)}>Delete</button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* --- MODALS --- */}

          {/* Modal: Add Record */}
          {modalOpen && (
            <div className="modal modal-open">
              <div className="modal-box relative max-w-md w-full mx-4 sm:mx-auto">
                <h3 className="text-2xl font-bold mb-6">Add Finance Record</h3>
                <button
                  className="btn btn-sm btn-circle absolute right-2 top-2"
                  onClick={() => setModalOpen(false)}
                >
                  ✕
                </button>
                <form onSubmit={handleSave} className="grid grid-cols-1 gap-4">
                  <div>
                    <label className="label">Type</label>
                    <select className="select select-bordered w-full" value={type} onChange={e => setType(e.target.value)}>
                      <option value="income">Income</option>
                      <option value="spending">Spending</option>
                    </select>
                  </div>
                  <div>
                    <label className="label">Amount</label>
                    <input
                      type="number"
                      step="0.01"
                      className="input input-bordered w-full"
                      value={amount}
                      onChange={e => setAmount(e.target.value)}
                      placeholder="Amount"
                      required
                    />
                  </div>
                  <div>
                    <label className="label">Description</label>
                    <input
                      type="text"
                      className="input input-bordered w-full"
                      value={desc}
                      onChange={e => setDesc(e.target.value)}
                      placeholder="Description"
                    />
                  </div>
                  <div>
                    <label className="label">Date</label>
                    <input
                      type="date"
                      className="input input-bordered w-full"
                      value={date}
                      onChange={e => setDate(e.target.value)}
                      required
                    />
                  </div>
                  {type === "spending" && (
                    <div>
                      <label className="label">Category</label>
                      <select className="select select-bordered w-full" value={category} onChange={e => setCategory(e.target.value)}>
                        <option value="">Select category</option>
                        <option value="fuel">Fuel</option>
                        <option value="breakfast">Breakfast</option>
                        <option value="groceries">Groceries</option>
                        <option value="transport">Transport</option>
                        <option value="entertainment">Entertainment</option>
                        <option value="custom">Other (custom)</option>
                      </select>
                      {category === "custom" && (
                        <input
                          type="text"
                          className="input input-bordered w-full mt-2"
                          value={customCategory}
                          onChange={e => setCustomCategory(e.target.value)}
                          placeholder="Custom category"
                        />
                      )}
                    </div>
                  )}
                  <div className="flex gap-3 mt-2">
                    <button type="submit" className={`btn btn-primary ${saving ? "loading" : ""}`} disabled={saving}>
                      {saving ? "Saving..." : "Save Record"}
                    </button>
                    <button type="button" className="btn" onClick={() => setModalOpen(false)}>Cancel</button>
                  </div>
                  {error && <div className="text-error mt-2">{error}</div>}
                </form>
              </div>
            </div>
          )}

          {/* Modal: Edit Record */}
          {editModalOpen && (
            <div className="modal modal-open">
              <div className="modal-box relative max-w-md w-full mx-4 sm:mx-auto">
                <h3 className="text-2xl font-bold mb-6">Edit Finance Record</h3>
                <button
                  className="btn btn-sm btn-circle absolute right-2 top-2"
                  onClick={() => setEditModalOpen(false)}
                >
                  ✕
                </button>
                <form onSubmit={handleEditRecord} className="grid grid-cols-1 gap-4">
                  <div>
                    <label className="label">Type</label>
                    <select className="select select-bordered w-full" value={editType} onChange={e => setEditType(e.target.value)}>
                      <option value="income">Income</option>
                      <option value="spending">Spending</option>
                    </select>
                  </div>
                  <div>
                    <label className="label">Amount</label>
                    <input
                      type="number"
                      step="0.01"
                      className="input input-bordered w-full"
                      value={editAmount}
                      onChange={e => setEditAmount(e.target.value)}
                      placeholder="Amount"
                      required
                    />
                  </div>
                  <div>
                    <label className="label">Description</label>
                    <input
                      type="text"
                      className="input input-bordered w-full"
                      value={editDesc}
                      onChange={e => setEditDesc(e.target.value)}
                      placeholder="Description"
                    />
                  </div>
                  <div>
                    <label className="label">Date</label>
                    <input
                      type="date"
                      className="input input-bordered w-full"
                      value={editDate}
                      onChange={e => setEditDate(e.target.value)}
                      required
                    />
                  </div>
                  {editType === "spending" && (
                    <div>
                      <label className="label">Category</label>
                      <select className="select select-bordered w-full" value={editCategory} onChange={e => setEditCategory(e.target.value)}>
                         <option value="">Select category</option>
                         <option value="fuel">Fuel</option>
                         <option value="breakfast">Breakfast</option>
                         <option value="groceries">Groceries</option>
                         <option value="transport">Transport</option>
                         <option value="entertainment">Entertainment</option>
                         <option value="custom">Other (custom)</option>
                         {/* Handle case where existing category isn't in standard list */}
                         {!["fuel", "breakfast", "groceries", "transport", "entertainment", "custom", ""].includes(editCategory) && (
                            <option value={editCategory}>{editCategory}</option>
                         )}
                      </select>
                      {editCategory === "custom" && (
                        <input
                          type="text"
                          className="input input-bordered w-full mt-2"
                          value={editCustomCategory}
                          onChange={e => setEditCustomCategory(e.target.value)}
                          placeholder="Custom category"
                        />
                      )}
                    </div>
                  )}
                  <div className="flex gap-3 mt-2">
                    <button type="submit" className={`btn btn-primary ${saving ? "loading" : ""}`} disabled={saving}>
                      {saving ? "Updating..." : "Update Record"}
                    </button>
                    <button type="button" className="btn" onClick={() => setEditModalOpen(false)}>Cancel</button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Modal: Add Planning */}
          {planModalOpen && (
            <div className="modal modal-open">
              <div className="modal-box relative max-w-md w-full mx-4 sm:mx-auto">
                <h3 className="text-2xl font-bold mb-6">Add Planned Purchase</h3>
                <button
                  className="btn btn-sm btn-circle absolute right-2 top-2"
                  onClick={() => setPlanModalOpen(false)}
                >
                  ✕
                </button>
                <form onSubmit={handlePlanSave} className="grid grid-cols-1 gap-4">
                  <div>
                    <label className="label">Description</label>
                    <input
                      type="text"
                      className="input input-bordered w-full"
                      value={planDesc}
                      onChange={e => setPlanDesc(e.target.value)}
                      placeholder="What do you plan to buy?"
                      required
                    />
                  </div>
                  <div>
                    <label className="label">Amount</label>
                    <input
                      type="number"
                      step="0.01"
                      className="input input-bordered w-full"
                      value={planAmount}
                      onChange={e => setPlanAmount(e.target.value)}
                      placeholder="Estimated cost"
                      required
                    />
                  </div>
                  <div>
                    <label className="label">Planned Date</label>
                    <input
                      type="date"
                      className="input input-bordered w-full"
                      value={planDate}
                      onChange={e => setPlanDate(e.target.value)}
                    />
                  </div>
                  <div className="flex gap-3 mt-2">
                    <button type="submit" className="btn btn-primary">Add Plan</button>
                    <button type="button" className="btn" onClick={() => setPlanModalOpen(false)}>Cancel</button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Modal: Edit Planning */}
          {editPlanModalOpen && (
            <div className="modal modal-open">
              <div className="modal-box relative max-w-md w-full mx-4 sm:mx-auto">
                <h3 className="text-2xl font-bold mb-6">Edit Planned Purchase</h3>
                <button
                  className="btn btn-sm btn-circle absolute right-2 top-2"
                  onClick={() => setEditPlanModalOpen(false)}
                >
                  ✕
                </button>
                <form onSubmit={handleEditPlan} className="grid grid-cols-1 gap-4">
                  <div>
                    <label className="label">Description</label>
                    <input
                      type="text"
                      className="input input-bordered w-full"
                      value={editPlanDesc}
                      onChange={e => setEditPlanDesc(e.target.value)}
                      placeholder="What do you plan to buy?"
                      required
                    />
                  </div>
                  <div>
                    <label className="label">Amount</label>
                    <input
                      type="number"
                      step="0.01"
                      className="input input-bordered w-full"
                      value={editPlanAmount}
                      onChange={e => setEditPlanAmount(e.target.value)}
                      placeholder="Estimated cost"
                      required
                    />
                  </div>
                  <div>
                    <label className="label">Planned Date</label>
                    <input
                      type="date"
                      className="input input-bordered w-full"
                      value={editPlanDate}
                      onChange={e => setEditPlanDate(e.target.value)}
                    />
                  </div>
                  <div className="flex gap-3 mt-2">
                    <button type="submit" className="btn btn-primary">Update Plan</button>
                    <button type="button" className="btn" onClick={() => setEditPlanModalOpen(false)}>Cancel</button>
                  </div>
                </form>
              </div>
            </div>
          )}

        </div>
      </AdminLayout>
    </ProtectedRoute>
  );
}