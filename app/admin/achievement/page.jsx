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

export default function AdminAchievementsPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [inlineEditingId, setInlineEditingId] = useState(null);

  // form fields
  const [title, setTitle] = useState("");
  const [date, setDate] = useState("");
  const [issuer, setIssuer] = useState("");
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [linkUrl, setLinkUrl] = useState("");
  const [downloadUrl, setDownloadUrl] = useState("");

  useEffect(() => {
    let mounted = true;
    async function fetchItems() {
      setLoading(true);
      try {
        const q = query(collection(db, "achievements"), orderBy("order", "asc"));
        const snap = await getDocs(q);
        const data = snap.docs.map((d, i) => ({ id: d.id, order: d.data().order ?? i, ...d.data() }));
        if (mounted) setItems(data);
      } catch (e) {
        console.error("Failed to fetch achievements:", e);
      } finally {
        setTimeout(() => setLoading(false), 300);
      }
    }
    fetchItems();
    return () => (mounted = false);
  }, []);

  const openAdd = () => {
    setEditingId(null);
    setTitle("");
    setDate("");
    setIssuer("");
    setCategory("");
    setDescription("");
    setImageUrl("");
    setLinkUrl("");
    setDownloadUrl("");
    setModalOpen(true);
  };

  const openEdit = (item) => {
    setEditingId(item.id || null);
    setTitle(item.title || "");
    setDate(item.date || "");
    setIssuer(item.issuer || "");
    setCategory(item.category || "");
    setDescription(item.description || "");
    setImageUrl(item.imageUrl || "");
    setLinkUrl(item.linkUrl || "");
    setDownloadUrl(item.downloadUrl || "");
    setModalOpen(true);
  };

  const handleSave = async () => {
    if (!title.trim()) return alert("Title is required");
    setSaving(true);
    try {
      if (editingId) {
        await updateDoc(doc(db, "achievements", editingId), {
          title,
          date,
          issuer,
          category,
          description,
          imageUrl,
          linkUrl,
          downloadUrl,
          updatedAt: serverTimestamp(),
        });
        setItems((prev) => prev.map((it) => (it.id === editingId ? { ...it, title, date, issuer, category, description, imageUrl, linkUrl, downloadUrl } : it)));
      } else {
        const docRef = await addDoc(collection(db, "achievements"), {
          title,
          date,
          issuer,
          category,
          description,
          imageUrl,
          linkUrl,
          downloadUrl,
          createdAt: serverTimestamp(),
          order: items.length,
        });
        setItems((prev) => [...prev, { id: docRef.id, title, date, issuer, category, description, imageUrl, linkUrl, downloadUrl, order: prev.length }]);
      }
      setModalOpen(false);
    } catch (e) {
      alert("Save failed, see console.");
      console.error(e);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!id) return;
    if (!confirm("Delete this achievement?")) return;
    try {
      await deleteDoc(doc(db, "achievements", id));
      setItems((prev) => prev.filter((s) => s.id !== id));
    } catch (e) {
      alert("Failed to delete");
      console.error(e);
    }
  };

  const handleDragEnd = async (result) => {
    if (!result.destination) return;
    const newList = Array.from(items);
    const [moved] = newList.splice(result.source.index, 1);
    newList.splice(result.destination.index, 0, moved);
    setItems(newList);
    try {
      newList.forEach(async (item, i) => {
        if (item.id) await updateDoc(doc(db, "achievements", item.id), { order: i });
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
          <h1 className="text-2xl font-bold">Achievements</h1>
          <button className="btn gap-2 bg-cyan-500 text-white hover:bg-cyan-600" onClick={openAdd}>
            <PlusIcon className="h-5 w-5" /> Add Achievement
          </button>
        </div>

        <DragDropContext onDragEnd={handleDragEnd}>
          <Droppable droppableId="achievements">
            {(p) => (
              <div ref={p.innerRef} {...p.droppableProps} className="space-y-4">
                {items.map((item, index) => (
                  <Draggable key={item.id || index} draggableId={String(item.id || index)} index={index}>
                    {(p) => (
                      <div
                        ref={p.innerRef}
                        {...p.draggableProps}
                        {...p.dragHandleProps}
                        className="card bg-base-100 shadow-sm p-4 flex flex-col gap-4"
                      >
                        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                          <div className="flex-1">
                            {inlineEditingId === item.id ? (
                              <input
                                className="input input-bordered w-full"
                                value={item.title}
                                onChange={(e) =>
                                  setItems((prev) => prev.map((it) => (it.id === item.id ? { ...it, title: e.target.value } : it)))
                                }
                                onBlur={async () => {
                                  setInlineEditingId(null);
                                  if (item.id) await updateDoc(doc(db, "achievements", item.id), { title: item.title });
                                }}
                              />
                            ) : (
                              <h2 className="text-lg font-semibold cursor-pointer" onClick={() => setInlineEditingId(item.id)}>
                                {item.title}
                              </h2>
                            )}

                            <div className="text-sm text-gray-500 mt-1">{item.category}</div>

                            <div className="mt-2 flex items-center gap-3">
                              <div className="text-sm opacity-70">{item.date}</div>
                              {item.issuer && <div className="text-sm opacity-70">• {item.issuer}</div>}
                            </div>

                            {item.description && <div className="text-sm mt-3">{item.description}</div>}
                          </div>

                          <div className="flex items-center gap-2">
                            {item.linkUrl && (
                              <a href={item.linkUrl} target="_blank" rel="noopener noreferrer" className="btn btn-ghost btn-sm">
                                Open Link
                              </a>
                            )}
                            <button className="btn btn-ghost btn-sm gap-2 bg-cyan-500 text-white hover:bg-cyan-600" onClick={() => openEdit(item)}>
                              <PencilIcon className="h-4 w-4" /> Edit
                            </button>
                            <button className="btn btn-ghost btn-sm text-white bg-red-500 hover:bg-red-600 gap-2" onClick={() => handleDelete(item.id)}>
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
              <h3 className="text-2xl font-bold mb-4">{editingId ? "Edit Achievement" : "Add Achievement"}</h3>

              <div className="space-y-4">
                <div>
                  <label className="label">
                    <span className="label-text">Title</span>
                  </label>
                  <input className="input input-bordered w-full" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Achievement title" />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="label"><span className="label-text">Date</span></label>
                    <input type="date" className="input input-bordered w-full" value={date} onChange={(e) => setDate(e.target.value)} />
                  </div>
                  <div>
                    <label className="label"><span className="label-text">Issuer</span></label>
                    <input className="input input-bordered w-full" value={issuer} onChange={(e) => setIssuer(e.target.value)} placeholder="Organization" />
                  </div>
                </div>

                <div>
                  <label className="label"><span className="label-text">Category</span></label>
                  <input className="input input-bordered w-full" value={category} onChange={(e) => setCategory(e.target.value)} placeholder="Award / Certificate / Project" />
                </div>

                <div>
                  <label className="label"><span className="label-text">Description</span></label>
                  <textarea className="textarea textarea-bordered w-full" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Short description" />
                </div>

                <div>
                  <label className="label"><span className="label-text">Image URL (optional)</span></label>
                  <input className="input input-bordered w-full" value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} placeholder="https://.../certificate.png" />
                  {imageUrl && /^https?:\/\//.test(imageUrl) ? (
                    <img src={imageUrl} alt="Preview" className="mt-2 h-20 object-contain rounded" />
                  ) : null}
                </div>

                <div>
                  <label className="label"><span className="label-text">Link URL (optional)</span></label>
                  <input className="input input-bordered w-full" value={linkUrl} onChange={(e) => setLinkUrl(e.target.value)} placeholder="https://..." />
                </div>

                <div>
                  <label className="label"><span className="label-text">Download URL (optional)</span></label>
                  <input className="input input-bordered w-full" value={downloadUrl} onChange={(e) => setDownloadUrl(e.target.value)} placeholder="https://.../certificate.pdf" />
                </div>

              </div>

              <div className="modal-action">
                <button className={`btn btn-primary ${saving ? "loading" : ""} bg-cyan-500 hover:bg-cyan-600`} onClick={handleSave}>
                  {saving ? "Saving..." : editingId ? "Save Changes" : "Add Achievement"}
                </button>
                <button className="btn" onClick={() => setModalOpen(false)}>Cancel</button>
              </div>
            </div>
          </div>
        )}
      </AdminLayout>
    </ProtectedRoute>
  );
}
