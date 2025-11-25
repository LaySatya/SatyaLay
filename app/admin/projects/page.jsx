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
import { PencilIcon, TrashIcon, PlusIcon, XMarkIcon, LinkIcon, EyeIcon } from "@heroicons/react/24/outline";
import AdminLoading from "../components/AdminLoading";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";

const PLACEHOLDER_IMAGE = "https://via.placeholder.com/300x150?text=Project+Image";

const saveInlineEdit = async (id, field, value) => {
  try {
    await updateDoc(doc(db, "projects", id), { [field]: value });
  } catch (err) {
    console.error(`Failed to save inline edit for ${field}:`, err);
  }
};

export default function AdminProjectPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [inlineEditing, setInlineEditing] = useState(null);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [url, setUrl] = useState("");
  const [githubUrl, setGithubUrl] = useState("");
  const [technologies, setTechnologies] = useState([]);
  const [imageUrl, setImageUrl] = useState("");
  const [isFeatured, setIsFeatured] = useState(false);

  const fetchItems = useCallback(async () => {
    setLoading(true);
    try {
      const q = query(collection(db, "projects"), orderBy("order", "asc"));
      const snapshot = await getDocs(q);
      const data = snapshot.docs.map((d, index) => ({ id: d.id, order: index, ...d.data() }));
      setItems(data);
    } catch (err) {
      console.error("Failed to fetch projects:", err);
    } finally {
      setTimeout(() => setLoading(false), 500);
    }
  }, []);

  useEffect(() => { fetchItems(); }, [fetchItems]);

  const openAdd = () => {
    setEditingId(null);
    setTitle("");
    setDescription("");
    setUrl("");
    setGithubUrl("");
    setTechnologies([]);
    setImageUrl("");
    setIsFeatured(false);
    setModalOpen(true);
  };

  const openEdit = (item) => {
    setEditingId(item.id || null);
    setTitle(item.title || "");
    setDescription(item.description || "");
    setUrl(item.url || "");
    setGithubUrl(item.githubUrl || "");
    setTechnologies(item.technologies || []);
    setImageUrl(item.imageUrl || "");
    setIsFeatured(item.isFeatured || false);
    setModalOpen(true);
  };

  const validate = () => title.trim().length > 0 && description.trim().length > 0;

  const handleSave = async () => {
    if (!validate()) { alert("Please provide a title and a description for the project."); return; }
    setSaving(true);
    try {
      const newOrUpdatedData = { title, description, url: url || null, githubUrl: githubUrl || null, technologies, imageUrl: imageUrl || null, isFeatured };
      if (editingId) {
        const docRef = doc(db, "projects", editingId);
        await updateDoc(docRef, { ...newOrUpdatedData, updatedAt: serverTimestamp() });
        setItems((prev) => prev.map((it) => (it.id === editingId ? { ...it, ...newOrUpdatedData } : it)));
      } else {
        const collectionRef = collection(db, "projects");
        const docRef = await addDoc(collectionRef, { ...newOrUpdatedData, createdAt: serverTimestamp(), order: items.length });
        setItems((prev) => [...prev, { id: docRef.id, ...newOrUpdatedData, order: prev.length }]);
      }
      setModalOpen(false);
      setEditingId(null);
    } catch (err) {
      console.error("Save failed:", err);
      alert("Failed to save. Check console for errors.");
    } finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    if (!id) return; if (!confirm("Are you sure you want to delete this project entry?")) return;
    try { await deleteDoc(doc(db, "projects", id)); setItems((prev) => prev.filter((i) => i.id !== id)); }
    catch (err) { console.error("Delete failed:", err); alert("Failed to delete item."); }
  };

  const handleDragEnd = async (result) => {
    if (!result.destination) return;
    const newItems = Array.from(items);
    const [moved] = newItems.splice(result.source.index, 1);
    newItems.splice(result.destination.index, 0, moved);
    setItems(newItems);
    try { for (let i = 0; i < newItems.length; i++) { if (newItems[i].id) await updateDoc(doc(db, "projects", newItems[i].id), { order: i }); } }
    catch (err) { console.error("Failed to save order:", err); }
  };

  const handleInlineBlur = async (item, field) => { if (inlineEditing?.id === item.id && inlineEditing?.field === field) { setInlineEditing(null); if (item.id) await saveInlineEdit(item.id, field, item[field]); } };
  const handleInlineChange = (itemId, field, value) => { setItems((prev) => prev.map((it) => (it.id === itemId ? { ...it, [field]: value } : it))); };

  if (loading) return (<AdminLayout><AdminLoading /></AdminLayout>);

  return (
    <ProtectedRoute>
      <AdminLayout>
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-extrabold ">Projects</h1>
          <button className="btn bg-cyan-500  gap-2" onClick={openAdd}><PlusIcon className="h-5 w-5" /> Add Project</button>
        </div>

        <DragDropContext onDragEnd={handleDragEnd}>
          <Droppable droppableId="projects">
            {(provided) => (
              <div ref={provided.innerRef} {...provided.droppableProps} className="space-y-4">
                {items.map((item, index) => (
                  <Draggable key={item.id || index} draggableId={String(item.id || index)} index={index}>
                    {(provided) => (
                      <div ref={provided.innerRef} {...provided.draggableProps} {...provided.dragHandleProps} className="card bg-base-100 shadow-lg border border-gray-100 p-5 transition duration-150 ease-in-out hover:shadow-xl">
                        <div className="flex flex-col md:flex-row gap-4">
                          <div className="flex-shrink-0 relative">
                            <img src={item.imageUrl || PLACEHOLDER_IMAGE} alt={`Project: ${item.title}`} className="w-full md:w-32 h-20 object-cover rounded-lg border shadow-sm" onError={(e)=>{e.currentTarget.src=PLACEHOLDER_IMAGE}} />
                            {item.isFeatured && (<span className="badge badge-success badge-sm absolute top-0 right-0 m-1 font-semibold">Featured</span>)}
                          </div>

                          <div className="flex-1 min-w-0">
                            {inlineEditing?.id === item.id && inlineEditing?.field === "title" ? (
                              <input value={item.title} onChange={(e)=>handleInlineChange(item.id, "title", e.target.value)} onBlur={()=>handleInlineBlur(item, "title")} className="input input-sm input-bordered font-bold w-full max-w-sm" placeholder="Project Title" autoFocus />
                            ) : (
                              <h3 className="text-xl font-bold cursor-pointer" onClick={()=>setInlineEditing({ id: item.id, field: "title" })}>{item.title || "Click to add Title"}</h3>
                            )}

                            {inlineEditing?.id === item.id && inlineEditing?.field === "description" ? (
                              <textarea value={item.description} onChange={(e)=>handleInlineChange(item.id, "description", e.target.value)} onBlur={()=>handleInlineBlur(item, "description")} className="textarea textarea-xs textarea-bordered w-full mt-1" rows={2} placeholder="Brief Description" autoFocus />
                            ) : (
                              <p className="text-sm cursor-pointer truncate max-w-full" onClick={()=>setInlineEditing({ id: item.id, field: "description" })}>{item.description || "Click to add Description"}</p>
                            )}

                            <div className="flex gap-4 mt-2 text-sm">
                              {item.url && (<a href={item.url} target="_blank" rel="noopener noreferrer" className="text-cyan-500 flex items-center gap-1"><EyeIcon className="h-4 w-4" /> Live Site</a>)}
                              {item.githubUrl && (<a href={item.githubUrl} target="_blank" rel="noopener noreferrer" className=" flex items-center gap-1"><LinkIcon className="h-4 w-4" /> GitHub</a>)}
                            </div>

                            <div className="flex flex-wrap gap-2 mt-3">{item.technologies?.map((tech, idx)=>(<span key={idx} className="badge badge-outline badge-info badge-sm font-medium">{tech}</span>))}</div>
                          </div>

                          <div className="flex-shrink-0 mt-4 md:mt-0 flex flex-col gap-2">
                            <button className="btn btn-sm btn-outline text-cyan-500  gap-2" onClick={()=>openEdit(item)}><PencilIcon className="h-4 w-4" />  Edit</button>
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
              <h3 className="text-2xl font-bold mb-6 text-gray-800">{editingId ? "Edit Project" : "Add New Project"}</h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="label"><span className="label-text font-medium">Project Title</span></label>
                  <input className="input input-bordered w-full" value={title} onChange={(e)=>setTitle(e.target.value)} placeholder="Project Title" />
                </div>

                <div className="md:col-span-2">
                  <label className="label"><span className="label-text font-medium">Description</span></label>
                  <textarea className="textarea textarea-bordered w-full" rows={4} value={description} onChange={(e)=>setDescription(e.target.value)} placeholder="Short description" />
                </div>

                <div>
                  <label className="label"><span className="label-text font-medium">Live URL</span></label>
                  <input className="input input-bordered w-full" value={url} onChange={(e)=>setUrl(e.target.value)} placeholder="https://example.com" />
                </div>

                <div>
                  <label className="label"><span className="label-text font-medium">GitHub URL</span></label>
                  <input className="input input-bordered w-full" value={githubUrl} onChange={(e)=>setGithubUrl(e.target.value)} placeholder="https://github.com/your/repo" />
                </div>

                <div className="md:col-span-2">
                  <label className="label"><span className="label-text font-medium">Technologies</span></label>
                  <input className="input input-bordered w-full" value={technologies.join(", ")} onChange={(e)=>setTechnologies(e.target.value.split(",").map(t=>t.trim()).filter(Boolean))} placeholder="React, Node.js" />
                </div>

                <div>
                  <label className="label"><span className="label-text font-medium">Image URL</span></label>
                  <input className="input input-bordered w-full" value={imageUrl} onChange={(e)=>setImageUrl(e.target.value)} placeholder="https://..." />
                </div>

                <div>
                  <label className="label"><span className="label-text font-medium">Featured</span></label>
                  <input type="checkbox" checked={isFeatured} onChange={(e)=>setIsFeatured(e.target.checked)} className="checkbox" />
                </div>
              </div>

              <div className="modal-action mt-6">
                <button className={`btn btn-primary bg-cyan-500 text-white ${saving ? "loading" : ""}`} onClick={handleSave} disabled={saving}>{saving ? "Saving..." : editingId ? "Save Changes" : "Create Project"}</button>
                <button className="btn" onClick={()=>setModalOpen(false)}>Cancel</button>
              </div>
            </div>
          </div>
        )}
      </AdminLayout>
    </ProtectedRoute>
  );
}
