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

export default function AdminGalleryPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);

  // form fields
  const [title, setTitle] = useState("");
  const [imageUrl, setImageUrl] = useState("");

  useEffect(() => {
    let mounted = true;
    async function fetchItems() {
      setLoading(true);
      try {
        const q = query(collection(db, "gallery"), orderBy("order", "asc"));
        const snap = await getDocs(q);
        const data = snap.docs.map((d, i) => ({ id: d.id, order: d.data().order ?? i, ...d.data() }));
        if (mounted) setItems(data);
      } catch (e) {
        console.error("Failed to fetch gallery:", e);
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
    setImageUrl("");
    setModalOpen(true);
  };

  const openEdit = (item) => {
    setEditingId(item.id || null);
    setTitle(item.title || "");
    setImageUrl(item.imageUrl || "");
    setModalOpen(true);
  };

  const handleSave = async () => {
    if (!title.trim() || !imageUrl.trim()) return alert("Title and image URL required");
    setSaving(true);
    try {
      if (editingId) {
        await updateDoc(doc(db, "gallery", editingId), {
          title,
          imageUrl,
          updatedAt: serverTimestamp(),
        });
        setItems((prev) => prev.map((it) => (it.id === editingId ? { ...it, title, imageUrl } : it)));
      } else {
        const docRef = await addDoc(collection(db, "gallery"), {
          title,
          imageUrl,
          createdAt: serverTimestamp(),
          order: items.length,
        });
        setItems((prev) => [...prev, { id: docRef.id, title, imageUrl, order: prev.length }]);
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
    if (!confirm("Delete this photo?")) return;
    try {
      await deleteDoc(doc(db, "gallery", id));
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
        if (item.id) await updateDoc(doc(db, "gallery", item.id), { order: i });
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
          <h1 className="text-2xl font-bold">Gallery Admin</h1>
          <button className="btn gap-2 bg-cyan-500 text-white hover:bg-cyan-600" onClick={openAdd}>
            <PlusIcon className="h-5 w-5" /> Add Photo
          </button>
        </div>

        <DragDropContext onDragEnd={handleDragEnd}>
          <Droppable droppableId="gallery">
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
                          <div className="flex items-center gap-4">
                            {item.imageUrl && /^https?:\/\//.test(item.imageUrl) ? (
                              <img src={item.imageUrl} alt={item.title} className="h-16 w-24 object-cover rounded" />
                            ) : (
                              <div className="h-16 w-24 rounded bg-base-200 flex items-center justify-center">No image</div>
                            )}
                            <div>
                              <h2 className="text-lg font-semibold">{item.title}</h2>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
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
            <div className="modal-box max-w-xl">
              <h3 className="text-2xl font-bold mb-4">{editingId ? "Edit Photo" : "Add Photo"}</h3>

              <div className="space-y-4">
                <div>
                  <label className="label">
                    <span className="label-text">Title</span>
                  </label>
                  <input className="input input-bordered w-full" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Photo title" />
                </div>
                <div>
                  <label className="label">
                    <span className="label-text">Image URL</span>
                  </label>
                  <input className="input input-bordered w-full" value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} placeholder="https://.../photo.jpg" />
                  {imageUrl && /^https?:\/\//.test(imageUrl) && (
                    <img src={imageUrl} alt="Preview" className="mt-2 h-32 object-cover rounded" />
                  )}
                </div>
              </div>

              <div className="modal-action">
                <button className={`btn btn-primary ${saving ? "loading" : ""} bg-cyan-500 hover:bg-cyan-600`} onClick={handleSave}>
                  {saving ? "Saving..." : editingId ? "Save Changes" : "Add Photo"}
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
