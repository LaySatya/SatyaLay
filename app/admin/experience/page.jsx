"use client";

import AdminLayout from "../components/AdminLayout";
import ProtectedRoute from "../components/ProtectedRoute";
import { useEffect, useState, useCallback } from "react";
import {
  collection,
  getDocs,
  addDoc,
  doc,
  updateDoc,
  deleteDoc,
  query,
  orderBy,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "@/app/lib/firebase";
import { PencilIcon, TrashIcon, PlusIcon, XMarkIcon, ArrowRightIcon } from "@heroicons/react/24/outline";
import AdminLoading from "../components/AdminLoading";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";

// Use a placeholder logo for better UI when no URL is provided
const PLACEHOLDER_LOGO = "https://via.placeholder.com/150?text=Logo";

// Helper function to save a field inline
const saveInlineEdit = async (id, field, value) => {
  try {
    await updateDoc(doc(db, "experiences", id), { [field]: value });
  } catch (err) {
    console.error(`Failed to save inline edit for ${field}:`, err);
  }
};

export default function AdminExperiencePage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [inlineEditing, setInlineEditing] = useState(null); // { id, field }

  // Form fields for the full-edit modal
  const [company, setCompany] = useState("");
  const [role, setRole] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [description, setDescription] = useState("");
  const [technologies, setTechnologies] = useState([]);
  const [logoUrl, setLogoUrl] = useState("");

  const fetchItems = useCallback(async () => {
    setLoading(true);
    try {
      const q = query(collection(db, "experiences"), orderBy("order", "asc"));
      const snapshot = await getDocs(q);
      const data = snapshot.docs.map((d, index) => ({ id: d.id, order: index, ...d.data() }));
      setItems(data);
    } catch (err) {
      console.error("Failed to fetch experiences:", err);
    } finally {
      setTimeout(() => setLoading(false), 500);
    }
  }, []);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  const openAdd = () => {
    setEditingId(null);
    setCompany("");
    setRole("");
    setStartDate("");
    setEndDate("");
    setDescription("");
    setTechnologies([]);
    setLogoUrl("");
    setModalOpen(true);
  };

  const openEdit = (item) => {
    setEditingId(item.id || null);
    setCompany(item.company || "");
    setRole(item.role || "");
    setStartDate(item.startDate || "");
    setEndDate(item.endDate || "");
    setDescription(item.description || "");
    setTechnologies(item.technologies || []);
    setLogoUrl(item.logoUrl || "");
    setModalOpen(true);
  };

  const validate = () => company.trim().length > 0 || role.trim().length > 0;

  const handleSave = async () => {
    if (!validate()) {
      alert("Please provide at least a company or a role.");
      return;
    }

    setSaving(true);
    try {
      const newOrUpdatedData = { company, role, startDate: startDate || null, endDate: endDate || null, description, technologies, logoUrl };

      if (editingId) {
        const docRef = doc(db, "experiences", editingId);
        await updateDoc(docRef, { ...newOrUpdatedData, updatedAt: serverTimestamp() });
        setItems((prev) => prev.map((it) => (it.id === editingId ? { ...it, ...newOrUpdatedData } : it)));
      } else {
        const collectionRef = collection(db, "experiences");
        const docRef = await addDoc(collectionRef, { ...newOrUpdatedData, createdAt: serverTimestamp(), order: items.length });
        setItems((prev) => [...prev, { id: docRef.id, ...newOrUpdatedData, order: prev.length }]);
      }
      setModalOpen(false);
      setEditingId(null);
    } catch (err) {
      console.error("Save failed:", err);
      alert("Failed to save. Check console for errors.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!id) return;
    if (!confirm("Are you sure you want to delete this experience entry?")) return;
    try {
      await deleteDoc(doc(db, "experiences", id));
      setItems((prev) => prev.filter((i) => i.id !== id));
    } catch (err) {
      console.error("Delete failed:", err);
      alert("Failed to delete item.");
    }
  };

  const handleDragEnd = async (result) => {
    if (!result.destination) return;
    const newItems = Array.from(items);
    const [moved] = newItems.splice(result.source.index, 1);
    newItems.splice(result.destination.index, 0, moved);

    setItems(newItems);

    try {
      for (let i = 0; i < newItems.length; i++) {
        if (newItems[i].id) {
          const docRef = doc(db, "experiences", newItems[i].id);
          await updateDoc(docRef, { order: i });
        }
      }
    } catch (err) {
      console.error("Failed to save order:", err);
    }
  };

  const handleInlineBlur = async (item, field) => {
    if (inlineEditing?.id === item.id && inlineEditing?.field === field) {
      setInlineEditing(null);
      if (item.id) await saveInlineEdit(item.id, field, item[field]);
    }
  };

  const handleInlineChange = (itemId, field, value) => {
    setItems((prev) => prev.map((it) => (it.id === itemId ? { ...it, [field]: value } : it)));
  };

  if (loading) return (
    <AdminLayout>
      <AdminLoading />
    </AdminLayout>
  );

  return (
    <ProtectedRoute>
      <AdminLayout>
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-extrabold">Experience</h1>
          <button className="btn bg-cyan-500 text-white gap-2" onClick={openAdd}>
            <PlusIcon className="h-5 w-5" /> Add Experience
          </button>
        </div>

        <DragDropContext onDragEnd={handleDragEnd}>
          <Droppable droppableId="experiences">
            {(provided) => (
              <div ref={provided.innerRef} {...provided.droppableProps} className="space-y-4">
                {items.map((item, index) => (
                  <Draggable key={item.id || index} draggableId={String(item.id || index)} index={index}>
                    {(provided) => (
                      <div ref={provided.innerRef} {...provided.draggableProps} {...provided.dragHandleProps} className="card bg-base-100 border-base-300 border p-5 transition duration-150 ease-in-out ">
                        <div className="flex flex-col md:flex-row gap-4">
                          <div className="flex-shrink-0 flex items-center gap-4">
                            <img src={item.logoUrl || PLACEHOLDER_LOGO} alt="Company Logo" className="w-22 h-22 object-contain rounded-lg border-cyan-400 p-1 shadow-sm bg-white" onError={(e)=>{e.currentTarget.src=PLACEHOLDER_LOGO}} />
                            <span className="text-gray-400 cursor-grab text-xl hidden md:inline-block">:::</span>
                          </div>

                          <div className="flex-1 min-w-0">
                            {inlineEditing?.id === item.id && inlineEditing?.field === "role" ? (
                              <input value={item.role} onChange={(e)=>handleInlineChange(item.id, "role", e.target.value)} onBlur={()=>handleInlineBlur(item, "role")} className="input input-sm input-bordered font-semibold w-full max-w-xs" placeholder="Role" autoFocus />
                            ) : (
                              <h3 className="text-xl font-bold cursor-pointer hover:text-cyan-600" onClick={()=>setInlineEditing({ id: item.id, field: "role" })}>{item.role || "Click to add Role"}</h3>
                            )}

                            {inlineEditing?.id === item.id && inlineEditing?.field === "company" ? (
                              <input value={item.company} onChange={(e)=>handleInlineChange(item.id, "company", e.target.value)} onBlur={()=>handleInlineBlur(item, "company")} className="input input-xs input-bordered w-full max-w-xs mt-1" placeholder="Company" autoFocus />
                            ) : (
                              <p className="text-md cursor-pointer hover:text-cyan-600" onClick={()=>setInlineEditing({ id: item.id, field: "company" })}>{item.company || "Click to add Company"}</p>
                            )}

                            <p className="text-sm text-gray-500 mt-2 flex items-center gap-1">📅 {item.startDate || "—"} <ArrowRightIcon width={16}/> {item.endDate || "Present"}</p>

                            {item.description && (<p className="text-sm text-gray-700 mt-3 whitespace-pre-line">{item.description}</p>)}

                            <div className="flex flex-wrap gap-2 mt-3">{item.technologies?.map((tech, idx)=>(<span key={idx} className="badge badge-outline badge-info badge-sm font-medium">{tech}</span>))}</div>
                          </div>

                          <div className="flex-shrink-0 mt-4 md:mt-0 flex flex-col gap-2">
                            <button className="btn btn-sm btn-outline btn-info gap-2" onClick={()=>openEdit(item)}><PencilIcon className="h-4 w-4" /> Full Edit</button>
                            <button className="btn btn-sm btn-outline btn-error gap-2" onClick={()=>handleDelete(item.id)}><TrashIcon className="h-4 w-4" /> Delete</button>
                          </div>
                        </div>
                      </div>
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </DragDropContext>

        {modalOpen && (
          <div className="modal modal-open">
            <div className="modal-box max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <button onClick={()=>setModalOpen(false)} className="btn btn-sm btn-circle absolute right-4 top-4"><XMarkIcon className="h-5 w-5" /></button>
              <h3 className="text-2xl font-bold mb-6 text-gray-800">{editingId ? "Edit Experience" : "Add New Experience"}</h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="label"><span className="label-text font-medium">Role</span></label>
                  <input value={role} onChange={(e)=>setRole(e.target.value)} className="input input-bordered w-full" placeholder="e.g., Senior Software Engineer" />
                </div>

                <div>
                  <label className="label"><span className="label-text font-medium">Company</span></label>
                  <input value={company} onChange={(e)=>setCompany(e.target.value)} className="input input-bordered w-full" placeholder="e.g., TechCorp Inc." />
                </div>

                <div>
                  <label className="label"><span className="label-text font-medium">Start Date</span></label>
                  <input type="date" value={startDate} onChange={(e)=>setStartDate(e.target.value)} className="input input-bordered w-full" />
                </div>

                <div>
                  <label className="label"><span className="label-text font-medium">End Date</span></label>
                  <input type="date" value={endDate} onChange={(e)=>setEndDate(e.target.value)} className="input input-bordered w-full" />
                </div>

                <div className="md:col-span-2">
                  <label className="label"><span className="label-text font-medium">Technologies / Languages</span></label>
                  <input value={technologies.join(", ")} onChange={(e)=>setTechnologies(e.target.value.split(",").map(t=>t.trim()).filter(Boolean))} className="input input-bordered w-full" placeholder="e.g., React, Node.js, TypeScript" />
                  <small className="text-gray-500 text-xs mt-1 block">Separate each technology with a comma</small>
                </div>

                <div className="md:col-span-2">
                  <label className="label"><span className="label-text font-medium">Logo URL</span></label>
                  <input value={logoUrl} onChange={(e)=>setLogoUrl(e.target.value)} className="input input-bordered w-full" placeholder="https://example.com/logo.png" />
                  {logoUrl && (<div className="mt-3 p-2 border rounded-lg bg-gray-50 inline-block"><span className="text-sm font-semibold text-gray-700 block mb-1">Logo Preview:</span><img src={logoUrl} alt="Logo Preview" className="w-20 h-20 object-contain rounded-md shadow" onError={(e)=>{e.currentTarget.src=PLACEHOLDER_LOGO}}/></div>)}
                </div>

                <div className="md:col-span-2">
                  <label className="label"><span className="label-text font-medium">Description</span></label>
                  <textarea value={description} onChange={(e)=>setDescription(e.target.value)} className="textarea textarea-bordered w-full" rows={4} placeholder="Details about your role, achievements, and key responsibilities." />
                </div>
              </div>

              <div className="modal-action mt-6">
                <button className={`btn btn-primary bg-cyan-600 hover:bg-cyan-700 text-white ${saving ? "loading" : ""}`} onClick={handleSave} disabled={saving}>{saving ? "Saving..." : editingId ? "Save Changes" : "Add Experience"}</button>
                <button className="btn btn-ghost" onClick={()=>setModalOpen(false)}>Cancel</button>
              </div>
            </div>
          </div>
        )}
      </AdminLayout>
    </ProtectedRoute>
  );
}
