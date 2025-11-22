"use client";

import AdminLayout from "../components/AdminLayout";
import ProtectedRoute from "../components/ProtectedRoute";
import { useEffect, useState } from "react";
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
import { PencilIcon, TrashIcon, PlusIcon } from "@heroicons/react/24/outline";
import AdminLoading from "../components/AdminLoading";
import { DragDropContext, Droppable, Draggable, DropResult } from "@hello-pangea/dnd";

const SAMPLE_IMAGE_URL = "sandbox:/mnt/data/d3e95a8f-22e7-4301-add9-0923174041aa.png";

type Education = {
  id?: string;
  school: string;
  degree: string;
  startYear?: number | string;
  endYear?: number | string;
  description?: string;
  createdAt?: any;
  order?: number;
};

export default function AdminEducationPage() {
  const [items, setItems] = useState<Education[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // inline edit state
  const [inlineEditingId, setInlineEditingId] = useState<string | null>(null);

  // form fields
  const [school, setSchool] = useState("");
  const [degree, setDegree] = useState("");
  const [startYear, setStartYear] = useState<string>("");
  const [endYear, setEndYear] = useState<string>("");
  const [description, setDescription] = useState("");

  // fetch educations
  useEffect(() => {
    async function fetchItems() {
      setLoading(true);
      try {
        const q = query(collection(db, "educations"), orderBy("order", "asc"));
        const snapshot = await getDocs(q);
        const data = snapshot.docs.map((d, idx) => ({
          id: d.id,
          order: idx,
          ...(d.data() as any),
        })) as Education[];
        setItems(data);
      } catch (err) {
        console.error("Failed to fetch educations:", err);
      } finally {
        setTimeout(() => setLoading(false), 500);
      }
    }
    fetchItems();
  }, []);

  // open add modal (clears form)
  const openAdd = () => {
    setEditingId(null);
    setSchool("");
    setDegree("");
    setStartYear("");
    setEndYear("");
    setDescription("");
    setModalOpen(true);
  };

  // open edit modal (fill form)
  const openEdit = (item: Education) => {
    setEditingId(item.id || null);
    setSchool(item.school || "");
    setDegree(item.degree || "");
    setStartYear(item.startYear ? String(item.startYear) : "");
    setEndYear(item.endYear ? String(item.endYear) : "");
    setDescription(item.description || "");
    setModalOpen(true);
  };

  const validate = () => {
    return school.trim().length > 0 || degree.trim().length > 0;
  };

  // save modal changes
  const handleSave = async () => {
    if (!validate()) {
      alert("Please provide at least a school or a degree.");
      return;
    }

    setSaving(true);
    try {
      if (editingId) {
        const docRef = doc(db, "educations", editingId);
        await updateDoc(docRef, {
          school: school.trim(),
          degree: degree.trim(),
          startYear: startYear ? Number(startYear) : null,
          endYear: endYear ? Number(endYear) : null,
          description: description.trim(),
          updatedAt: serverTimestamp(),
        });
        setItems((prev) =>
          prev.map((it) =>
            it.id === editingId ? { ...it, school, degree, startYear, endYear, description } : it
          )
        );
      } else {
        const collectionRef = collection(db, "educations");
        const docRef = await addDoc(collectionRef, {
          school: school.trim(),
          degree: degree.trim(),
          startYear: startYear ? Number(startYear) : null,
          endYear: endYear ? Number(endYear) : null,
          description: description.trim(),
          createdAt: serverTimestamp(),
          order: items.length,
        });
        setItems((prev) => [
          ...prev,
          { id: docRef.id, school, degree, startYear, endYear, description, order: prev.length },
        ]);
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

  const handleDelete = async (id?: string) => {
    if (!id) return;
    if (!confirm("Delete this education entry?")) return;
    try {
      await deleteDoc(doc(db, "educations", id));
      setItems((prev) => prev.filter((i) => i.id !== id));
    } catch (err) {
      console.error("Delete failed:", err);
      alert("Failed to delete item.");
    }
  };

  // drag & drop
  const handleDragEnd = async (result: DropResult) => {
    if (!result.destination) return;
    const newItems = Array.from(items);
    const [moved] = newItems.splice(result.source.index, 1);
    newItems.splice(result.destination.index, 0, moved);

    // update order in state
    setItems(newItems);

    // save new order to firebase
    try {
      for (let i = 0; i < newItems.length; i++) {
        const docRef = doc(db, "educations", newItems[i].id!);
        await updateDoc(docRef, { order: i });
      }
    } catch (err) {
      console.error("Failed to save order:", err);
    }
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
          <h1 className="text-2xl font-bold">Educations</h1>
          <div className="flex items-center gap-2">
            <button
              className="btn btn-ghost"
              onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            >
              Scroll to top
            </button>
            <button className="btn bg-cyan-500 text-white gap-2" onClick={openAdd}>
              <PlusIcon className="h-5 w-5" />
              Add Education
            </button>
          </div>
        </div>

       <DragDropContext onDragEnd={handleDragEnd}>
  <Droppable droppableId="educations">
    {(provided) => (
      <div ref={provided.innerRef} {...provided.droppableProps} className="space-y-4">
        {items.map((item, index) => (
          <Draggable key={item.id} draggableId={item.id!} index={index}>
            {(provided) => (
              <div
                ref={provided.innerRef}
                {...provided.draggableProps}
                {...provided.dragHandleProps}
                className="card bg-base-100 shadow-sm p-4 flex flex-col md:flex-row md:items-center md:justify-between gap-4"
              >
                <div className="flex-1 grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
                  {/* Degree */}
                  {inlineEditingId === item.id ? (
                    <input
                      value={item.degree}
                      onChange={(e) =>
                        setItems((prev) =>
                          prev.map((it) =>
                            it.id === item.id ? { ...it, degree: e.target.value } : it
                          )
                        )
                      }
                      onBlur={async () => {
                        setInlineEditingId(null);
                        try {
                          await updateDoc(doc(db, "educations", item.id!), { degree: item.degree });
                        } catch (err) { console.error(err); }
                      }}
                      className="input input-bordered w-full"
                      placeholder="Degree"
                    />
                  ) : (
                    <span
                      className="cursor-pointer"
                      onClick={() => setInlineEditingId(item.id)}
                    >
                      {item.degree || "Degree"}
                    </span>
                  )}

                  {/* School */}
                  {inlineEditingId === item.id ? (
                    <input
                      value={item.school}
                      onChange={(e) =>
                        setItems((prev) =>
                          prev.map((it) =>
                            it.id === item.id ? { ...it, school: e.target.value } : it
                          )
                        )
                      }
                      onBlur={async () => {
                        setInlineEditingId(null);
                        try {
                          await updateDoc(doc(db, "educations", item.id!), { school: item.school });
                        } catch (err) { console.error(err); }
                      }}
                      className="input input-bordered w-full"
                      placeholder="School"
                    />
                  ) : (
                    <span
                      className="text-sm text-muted cursor-pointer"
                      onClick={() => setInlineEditingId(item.id)}
                    >
                      {item.school || "School"}
                    </span>
                  )}

                  {/* Start Year */}
                  {inlineEditingId === item.id ? (
                    <input
                      value={item.startYear || ""}
                      onChange={(e) =>
                        setItems((prev) =>
                          prev.map((it) =>
                            it.id === item.id ? { ...it, startYear: e.target.value } : it
                          )
                        )
                      }
                      onBlur={async () => {
                        setInlineEditingId(null);
                        try {
                          await updateDoc(doc(db, "educations", item.id!), {
                            startYear: item.startYear ? Number(item.startYear) : null,
                          });
                        } catch (err) { console.error(err); }
                      }}
                      className="input input-bordered w-full"
                      placeholder="Start Year"
                    />
                  ) : (
                    <span
                      className="text-sm text-muted cursor-pointer"
                      onClick={() => setInlineEditingId(item.id)}
                    >
                      {item.startYear || "—"}
                    </span>
                  )}

                  {/* End Year */}
                  {inlineEditingId === item.id ? (
                    <input
                      value={item.endYear || ""}
                      onChange={(e) =>
                        setItems((prev) =>
                          prev.map((it) =>
                            it.id === item.id ? { ...it, endYear: e.target.value } : it
                          )
                        )
                      }
                      onBlur={async () => {
                        setInlineEditingId(null);
                        try {
                          await updateDoc(doc(db, "educations", item.id!), {
                            endYear: item.endYear ? Number(item.endYear) : null,
                          });
                        } catch (err) { console.error(err); }
                      }}
                      className="input input-bordered w-full"
                      placeholder="End Year"
                    />
                  ) : (
                    <span
                      className="text-sm text-muted cursor-pointer"
                      onClick={() => setInlineEditingId(item.id)}
                    >
                      {item.endYear || "—"}
                    </span>
                  )}
                </div>

                <div className="mt-4 md:mt-0 flex items-center gap-2">
                  <button
                    className="btn btn-ghost btn-sm gap-2"
                    onClick={() => setInlineEditingId(item.id)}
                  >
                    <PencilIcon className="h-4 w-4" /> Edit
                  </button>
                  <button
                    className="btn btn-sm btn-ghost text-error gap-2"
                    onClick={() => handleDelete(item.id)}
                  >
                    <TrashIcon className="h-4 w-4" /> Delete
                  </button>
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


        {/* Modal */}
        {modalOpen && (
          <div className="modal modal-open">
            <div className="modal-box max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <h3 className="text-2xl font-bold mb-4">{editingId ? "Edit Education" : "Add Education"}</h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="label">
                    <span className="label-text">School</span>
                  </label>
                  <input
                    value={school}
                    onChange={(e) => setSchool(e.target.value)}
                    className="input input-bordered w-full"
                    placeholder="University / School name"
                  />
                </div>

                <div>
                  <label className="label">
                    <span className="label-text">Degree</span>
                  </label>
                  <input
                    value={degree}
                    onChange={(e) => setDegree(e.target.value)}
                    className="input input-bordered w-full"
                    placeholder="e.g., BSc Computer Science"
                  />
                </div>

                <div>
                  <label className="label">
                    <span className="label-text">Start Year</span>
                  </label>
                  <input
                    value={startYear}
                    onChange={(e) => setStartYear(e.target.value)}
                    className="input input-bordered w-full"
                    placeholder="e.g., 2018"
                  />
                </div>

                <div>
                  <label className="label">
                    <span className="label-text">End Year</span>
                  </label>
                  <input
                    value={endYear}
                    onChange={(e) => setEndYear(e.target.value)}
                    className="input input-bordered w-full"
                    placeholder="e.g., 2022 or leave blank"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="label">
                    <span className="label-text">Description</span>
                  </label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="textarea textarea-bordered w-full"
                    rows={4}
                    placeholder="Optional details about your study, honors, etc."
                  />
                </div>

                <div className="md:col-span-2">
                  <div className="flex items-center gap-4">
                    <img src={SAMPLE_IMAGE_URL} alt="preview" className="w-24 h-24 object-cover rounded-md shadow" />
                    <div>
                      <div className="text-sm text-muted">Optional: upload a school logo (not implemented)</div>
                      <div className="text-xs text-muted">Sample image path above is a local test file.</div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="modal-action mt-4">
                <button className={`btn btn-primary ${saving ? "loading" : ""}`} onClick={handleSave}>
                  {saving ? "Saving..." : editingId ? "Save Changes" : "Add Education"}
                </button>
                <button className="btn" onClick={() => setModalOpen(false)}>
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </AdminLayout>
    </ProtectedRoute>
  );
}
