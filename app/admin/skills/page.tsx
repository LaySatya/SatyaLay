"use client";

import AdminLayout from "../components/AdminLayout";
import ProtectedRoute from "../components/ProtectedRoute";
import { useState, useEffect } from "react";
import {
  collection,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  query,
  orderBy,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "@/app/lib/firebase";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { PencilIcon, TrashIcon, PlusIcon } from "@heroicons/react/24/outline";
import AdminLoading from "../components/AdminLoading";

type Skill = {
  id?: string;
  name: string;
  level: number; // 0-100%
  category: string;
  description?: string;
  order?: number;
  createdAt?: any;
};

export default function AdminSkillsPage() {
  const [skills, setSkills] = useState<Skill[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [inlineEditingId, setInlineEditingId] = useState<string | null>(null);

  // form fields
  const [name, setName] = useState("");
  const [level, setLevel] = useState(50);
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");

  // fetch skills
  useEffect(() => {
    async function fetchSkills() {
      setLoading(true);
      try {
        const q = query(collection(db, "skills"), orderBy("order", "asc"));
        const snap = await getDocs(q);
        const data = snap.docs.map((d, i) => ({
          id: d.id,
          order: i,
          ...(d.data() as any),
        })) as Skill[];
        setSkills(data);
      } catch (e) {
        console.error("Failed to fetch skills:", e);
      } finally {
        setTimeout(() => setLoading(false), 500);
      }
    }
    fetchSkills();
  }, []);

  // --- Modal actions ---
  const openAdd = () => {
    setEditingId(null);
    setName("");
    setLevel(50);
    setCategory("");
    setDescription("");
    setModalOpen(true);
  };

  const openEdit = (item: Skill) => {
    setEditingId(item.id || null);
    setName(item.name);
    setLevel(item.level);
    setCategory(item.category);
    setDescription(item.description || "");
    setModalOpen(true);
  };

  const handleSave = async () => {
    if (!name.trim()) return alert("Skill name required");

    setSaving(true);
    try {
      if (editingId) {
        await updateDoc(doc(db, "skills", editingId), {
          name,
          level,
          category,
          description,
          updatedAt: serverTimestamp(),
        });
        setSkills((prev) =>
          prev.map((it) =>
            it.id === editingId ? { ...it, name, level, category, description } : it
          )
        );
      } else {
        const docRef = await addDoc(collection(db, "skills"), {
          name,
          level,
          category,
          description,
          createdAt: serverTimestamp(),
          order: skills.length,
        });
        setSkills((prev) => [
          ...prev,
          { id: docRef.id, name, level, category, description, order: prev.length },
        ]);
      }
      setModalOpen(false);
    } catch (e) {
      alert("Save failed, see console.");
      console.error(e);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id?: string) => {
    if (!id) return;
    if (!confirm("Delete this skill?")) return;
    try {
      await deleteDoc(doc(db, "skills", id));
      setSkills((prev) => prev.filter((s) => s.id !== id));
    } catch (e) {
      alert("Failed to delete");
      console.error(e);
    }
  };

  // drag & drop
  const handleDragEnd = async (result: any) => {
    if (!result.destination) return;

    const newList = Array.from(skills);
    const [moved] = newList.splice(result.source.index, 1);
    newList.splice(result.destination.index, 0, moved);

    setSkills(newList);

    try {
      newList.forEach(async (item, i) => {
        await updateDoc(doc(db, "skills", item.id!), { order: i });
      });
    } catch (e) {
      console.error("Failed to save order", e);
    }
  };

  if (loading)
    return (
      <AdminLayout>
        <AdminLoading />
      </AdminLayout>
    );

  return (
    <ProtectedRoute>
      <AdminLayout>
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">Skills</h1>
          <button
            className="btn gap-2 bg-cyan-500 text-white hover:bg-cyan-600"
            onClick={openAdd}
          >
            <PlusIcon className="h-5 w-5" /> Add Skill
          </button>
        </div>

        <DragDropContext onDragEnd={handleDragEnd}>
          <Droppable droppableId="skills">
            {(p) => (
              <div ref={p.innerRef} {...p.droppableProps} className="space-y-4">
                {skills.map((item, index) => (
                  <Draggable key={item.id} draggableId={item.id!} index={index}>
                    {(p) => (
                      <div
                        ref={p.innerRef}
                        {...p.draggableProps}
                        {...p.dragHandleProps}
                        className="card bg-base-100 shadow-sm p-4 flex flex-col gap-4"
                      >
                        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                          <div className="flex-1">
                            {/* Inline Edit Name */}
                            {inlineEditingId === item.id ? (
                              <input
                                className="input input-bordered w-full"
                                value={item.name}
                                onChange={(e) =>
                                  setSkills((prev) =>
                                    prev.map((it) =>
                                      it.id === item.id
                                        ? { ...it, name: e.target.value }
                                        : it
                                    )
                                  )
                                }
                                onBlur={async () => {
                                  setInlineEditingId(null);
                                  await updateDoc(doc(db, "skills", item.id!), {
                                    name: item.name,
                                  });
                                }}
                              />
                            ) : (
                              <h2
                                className="text-lg font-semibold cursor-pointer"
                                onClick={() => setInlineEditingId(item.id)}
                              >
                                {item.name}
                              </h2>
                            )}

                            {/* Category */}
                            <div className="text-sm text-gray-500 mt-1">{item.category}</div>

                            {/* Progress bar */}
                            <div className="mt-2">
                              <progress
                                className="progress w-full bg-cyan-500"
                                value={item.level}
                                max="100"
                              ></progress>
                              <div className="text-sm text-gray-500 mt-1">
                                {item.level}% skill level
                              </div>
                            </div>
                          </div>

                          {/* buttons */}
                          <div className="flex items-center gap-2">
                            <button
                              className="btn btn-ghost btn-sm gap-2 bg-cyan-500 text-white hover:bg-cyan-600"
                              onClick={() => openEdit(item)}
                            >
                              <PencilIcon className="h-4 w-4" /> Edit
                            </button>
                            <button
                              className="btn btn-ghost btn-sm text-white bg-red-500 hover:bg-red-600 gap-2"
                              onClick={() => handleDelete(item.id)}
                            >
                              <TrashIcon className="h-4 w-4" /> Delete
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                  </Draggable>
                ))}
                {p.placeholder}
              </div>
            )}
          </Droppable>
        </DragDropContext>

        {/* Modal */}
        {modalOpen && (
          <div className="modal modal-open">
            <div className="modal-box max-w-2xl">
              <h3 className="text-2xl font-bold mb-4">
                {editingId ? "Edit Skill" : "Add Skill"}
              </h3>

              <div className="space-y-4">
                <div>
                  <label className="label">
                    <span className="label-text">Skill Name</span>
                  </label>
                  <input
                    className="input input-bordered w-full"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g., React.js"
                  />
                </div>

                <div>
                  <label className="label">
                    <span className="label-text">Category</span>
                  </label>
                  <input
                    className="input input-bordered w-full"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    placeholder="Frontend / Backend / Tools"
                  />
                </div>

                <div>
                  <label className="label">
                    <span className="label-text">Level: {level}%</span>
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={level}
                    onChange={(e) => setLevel(Number(e.target.value))}
                    className="range range-primary bg-cyan-500"
                  />
                </div>

                <div>
                  <label className="label">
                    <span className="label-text">Description (optional)</span>
                  </label>
                  <textarea
                    className="textarea textarea-bordered w-full"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Short description about this skill"
                  />
                </div>
              </div>

              <div className="modal-action">
                <button
                  className={`btn btn-primary ${saving ? "loading" : ""} bg-cyan-500 hover:bg-cyan-600`}
                  onClick={handleSave}
                >
                  {saving ? "Saving..." : editingId ? "Save Changes" : "Add Skill"}
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
