// components/AdminProjectPage.tsx
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
import { db } from "@/app/lib/firebase"; // Ensure this path is correct
import {
  PencilIcon,
  TrashIcon,
  PlusIcon,
  XMarkIcon,
  LinkIcon,
  EyeIcon
} from "@heroicons/react/24/outline";
import AdminLoading from "../components/AdminLoading";
import { DragDropContext, Droppable, Draggable, DropResult } from "@hello-pangea/dnd";

type Project = {
  id?: string;
  title: string;
  description: string;
  url?: string; // Live project link
  githubUrl?: string; // GitHub repository link
  technologies?: string[]; // array of tech/languages used
  imageUrl?: string; // Primary image/screenshot
  isFeatured?: boolean;
  createdAt?: any;
  order?: number;
};

// Placeholder image for when no URL is provided
const PLACEHOLDER_IMAGE = "https://via.placeholder.com/300x150?text=Project+Image";

// Helper function to save a field inline
const saveInlineEdit = async (id: string, field: keyof Project, value: any) => {
    try {
        await updateDoc(doc(db, "projects", id), { [field]: value });
    } catch (err) {
        console.error(`Failed to save inline edit for ${field}:`, err);
    }
}

export default function AdminProjectPage() {
  const [items, setItems] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [inlineEditing, setInlineEditing] = useState<
    { id: string; field: keyof Project } | null
  >(null);

  // Form fields for the full-edit modal
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [url, setUrl] = useState("");
  const [githubUrl, setGithubUrl] = useState("");
  const [technologies, setTechnologies] = useState<string[]>([]);
  const [imageUrl, setImageUrl] = useState("");
  const [isFeatured, setIsFeatured] = useState(false);

  const fetchItems = useCallback(async () => {
    setLoading(true);
    try {
      const q = query(collection(db, "projects"), orderBy("order", "asc"));
      const snapshot = await getDocs(q);
      const data = snapshot.docs.map((d, index) => ({
        id: d.id,
        order: index,
        ...(d.data() as any),
      })) as Project[];
      setItems(data);
    } catch (err) {
      console.error("Failed to fetch projects:", err);
    } finally {
      setTimeout(() => setLoading(false), 500);
    }
  }, []);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

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

  const openEdit = (item: Project) => {
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
    if (!validate()) {
      alert("Please provide a title and a description for the project.");
      return;
    }

    setSaving(true);
    try {
      const newOrUpdatedData = {
        title,
        description,
        url: url || null,
        githubUrl: githubUrl || null,
        technologies,
        imageUrl: imageUrl || null,
        isFeatured,
      };

      if (editingId) {
        // UPDATE
        const docRef = doc(db, "projects", editingId);
        await updateDoc(docRef, {
          ...newOrUpdatedData,
          updatedAt: serverTimestamp(),
        });
        setItems((prev) =>
          prev.map((it) =>
            it.id === editingId
              ? { ...it, ...newOrUpdatedData }
              : it
          )
        );
      } else {
        // ADD NEW
        const collectionRef = collection(db, "projects");
        const docRef = await addDoc(collectionRef, {
          ...newOrUpdatedData,
          createdAt: serverTimestamp(),
          order: items.length, // Add at the end
        });
        setItems((prev) => [
          ...prev,
          { id: docRef.id, ...newOrUpdatedData, order: prev.length },
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
    if (!confirm("Are you sure you want to delete this project entry?")) return;
    try {
      await deleteDoc(doc(db, "projects", id));
      setItems((prev) => prev.filter((i) => i.id !== id));
    } catch (err) {
      console.error("Delete failed:", err);
      alert("Failed to delete item.");
    }
  };

  const handleDragEnd = async (result: DropResult) => {
    if (!result.destination) return;
    const newItems = Array.from(items);
    const [moved] = newItems.splice(result.source.index, 1);
    newItems.splice(result.destination.index, 0, moved);

    setItems(newItems); // Optimistic update

    try {
      // Update order in Firebase
      for (let i = 0; i < newItems.length; i++) {
        const docRef = doc(db, "projects", newItems[i].id!);
        await updateDoc(docRef, { order: i });
      }
    } catch (err) {
      console.error("Failed to save order:", err);
    }
  };

  const handleInlineBlur = async (item: Project, field: keyof Project) => {
    // Save only if the field is still being edited
    if (inlineEditing?.id === item.id && inlineEditing?.field === field) {
        setInlineEditing(null);
        await saveInlineEdit(item.id!, field, item[field]);
    }
  };

  const handleInlineChange = (itemId: string, field: keyof Project, value: any) => {
    setItems((prev) =>
        prev.map((it) =>
            it.id === itemId ? { ...it, [field]: value } : it
        )
    );
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
          <h1 className="text-2xl font-extrabold ">Projects</h1>
          <button className="btn bg-cyan-500  gap-2" onClick={openAdd}>
            <PlusIcon className="h-5 w-5" /> Add Project
          </button>
        </div>

       {/*  <hr className="my-6" /> */}

        <DragDropContext onDragEnd={handleDragEnd}>
          <Droppable droppableId="projects">
            {(provided) => (
              <div ref={provided.innerRef} {...provided.droppableProps} className="space-y-4">
                {items.map((item, index) => (
                  <Draggable key={item.id} draggableId={item.id!} index={index}>
                    {(provided) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        {...provided.dragHandleProps}
                        className="card bg-base-100 shadow-lg border border-gray-100 p-5 transition duration-150 ease-in-out hover:shadow-xl"
                      >
                        <div className="flex flex-col md:flex-row gap-4">
                            
                          {/* Image and Featured Badge */}
                          <div className="flex-shrink-0 relative">
                            <img
                              src={item.imageUrl || PLACEHOLDER_IMAGE}
                              alt={`Project: ${item.title}`}
                              className="w-full md:w-32 h-20 object-cover rounded-lg border shadow-sm"
                              onError={(e) => {
                                // Fallback to placeholder on error
                                (e.target as HTMLImageElement).src = PLACEHOLDER_IMAGE;
                              }}
                            />
                            {item.isFeatured && (
                                <span className="badge badge-success badge-sm absolute top-0 right-0 m-1 font-semibold">
                                    Featured
                                </span>
                            )}
                          </div>
                          
                          {/* Content Area */}
                          <div className="flex-1 min-w-0">
                            {/* Title (Inline Editable) */}
                            {inlineEditing?.id === item.id && inlineEditing?.field === "title" ? (
                                <input
                                    value={item.title}
                                    onChange={(e) => handleInlineChange(item.id!, "title", e.target.value)}
                                    onBlur={() => handleInlineBlur(item, "title")}
                                    className="input input-sm input-bordered font-bold w-full max-w-sm"
                                    placeholder="Project Title"
                                    autoFocus
                                />
                            ) : (
                                <h3
                                    className="text-xl font-bold cursor-pointer"
                                    onClick={() => setInlineEditing({ id: item.id!, field: "title" })}
                                >
                                    {item.title || "Click to add Title"}
                                </h3>
                            )}
                            
                            {/* Description - First line (Inline Editable) */}
                            {inlineEditing?.id === item.id && inlineEditing?.field === "description" ? (
                                <textarea
                                    value={item.description}
                                    onChange={(e) => handleInlineChange(item.id!, "description", e.target.value)}
                                    onBlur={() => handleInlineBlur(item, "description")}
                                    className="textarea textarea-xs textarea-bordered w-full mt-1"
                                    rows={2}
                                    placeholder="Brief Description"
                                    autoFocus
                                />
                            ) : (
                                <p
                                    className="text-sm cursor-pointer truncate max-w-full"
                                    onClick={() => setInlineEditing({ id: item.id!, field: "description" })}
                                >
                                    {item.description || "Click to add Description"}
                                </p>
                            )}

                            {/* Links */}
                            <div className="flex gap-4 mt-2 text-sm">
                                {item.url && (
                                    <a 
                                        href={item.url} 
                                        target="_blank" 
                                        rel="noopener noreferrer" 
                                        className="text-cyan-500 flex items-center gap-1"
                                    >
                                        <EyeIcon className="h-4 w-4" /> Live Site
                                    </a>
                                )}
                                {item.githubUrl && (
                                    <a 
                                        href={item.githubUrl} 
                                        target="_blank" 
                                        rel="noopener noreferrer" 
                                        className=" flex items-center gap-1"
                                    >
                                        <LinkIcon className="h-4 w-4" /> GitHub
                                    </a>
                                )}
                            </div>

                            {/* Technologies */}
                            <div className="flex flex-wrap gap-2 mt-3">
                              {item.technologies?.map((tech, idx) => (
                                <span
                                  key={idx}
                                  className="badge badge-outline badge-info badge-sm font-medium"
                                >
                                  {tech}
                                </span>
                              ))}
                            </div>
                          </div>
                          
                          {/* Actions */}
                          <div className="flex-shrink-0 mt-4 md:mt-0 flex flex-col gap-2">
                            <button
                              className="btn btn-sm btn-outline text-cyan-500  gap-2"
                              onClick={() => openEdit(item)} // Full edit action
                            >
                              <PencilIcon className="h-4 w-4" />  Edit
                            </button>
                            <button
                              className="btn btn-sm btn-outline btn-error gap-2"
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
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </DragDropContext>

        {/* Modal for Full Edit/Add */}
        {modalOpen && (
          <div className="modal modal-open">
            <div className="modal-box max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <button
                onClick={() => setModalOpen(false)}
                className="btn btn-sm btn-circle absolute right-4 top-4"
              >
                <XMarkIcon className="h-5 w-5" />
              </button>
              <h3 className="text-2xl font-bold mb-6 text-gray-800">
                {editingId ? "Edit Project" : "Add New Project"}
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Title */}
                <div className="md:col-span-2">
                  <label className="label">
                    <span className="label-text font-medium">Project Title</span>
                  </label>
                  <input
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="input input-bordered w-full"
                    placeholder="e.g., Portfolio Site v2"
                  />
                </div>
                
                {/* Live URL */}
                <div>
                  <label className="label">
                    <span className="label-text font-medium">Live URL (Optional)</span>
                  </label>
                  <input
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    className="input input-bordered w-full"
                    placeholder="https://live-project.com"
                  />
                </div>

                {/* GitHub URL */}
                <div>
                  <label className="label">
                    <span className="label-text font-medium">GitHub URL (Optional)</span>
                  </label>
                  <input
                    value={githubUrl}
                    onChange={(e) => setGithubUrl(e.target.value)}
                    className="input input-bordered w-full"
                    placeholder="https://github.com/user/repo"
                  />
                </div>

                {/* Technologies */}
                <div className="md:col-span-2">
                  <label className="label">
                    <span className="label-text font-medium">Technologies / Stack</span>
                  </label>
                  <input
                    value={technologies.join(", ")}
                    onChange={(e) => setTechnologies(e.target.value.split(",").map((t) => t.trim()).filter(t => t))}
                    className="input input-bordered w-full"
                    placeholder="e.g., Next.js, Tailwind CSS, Firebase"
                  />
                  <small className="text-gray-500 text-xs mt-1 block">Separate each technology with a comma</small>
                </div>

                {/* Image URL and Preview */}
                <div className="md:col-span-2">
                  <label className="label">
                    <span className="label-text font-medium">Image URL (Screenshot)</span>
                  </label>
                  <input
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    className="input input-bordered w-full"
                    placeholder="https://example.com/screenshot.png"
                  />
                  {imageUrl && (
                    <div className="mt-3 p-2 border rounded-lg bg-gray-50 inline-block">
                        <span className="text-sm font-semibold text-gray-700 block mb-1">Image Preview:</span>
                        <img
                          src={imageUrl}
                          alt="Project Image Preview"
                          className="w-48 h-24 object-cover rounded-md shadow"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = PLACEHOLDER_IMAGE;
                          }}
                        />
                    </div>
                  )}
                </div>

                {/* Description */}
                <div className="md:col-span-2">
                  <label className="label">
                    <span className="label-text font-medium">Description</span>
                  </label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="textarea textarea-bordered w-full"
                    rows={6}
                    placeholder="A detailed overview of the project, including features and my contributions."
                  />
                </div>
                
                {/* Is Featured Checkbox */}
                <div className="md:col-span-2">
                    <div className="form-control">
                        <label className="label cursor-pointer justify-start gap-4">
                            <input
                                type="checkbox"
                                checked={isFeatured}
                                onChange={(e) => setIsFeatured(e.target.checked)}
                                className="checkbox checkbox-primary"
                            />
                            <span className="label-text font-medium">Feature on Homepage/Top of List</span>
                        </label>
                    </div>
                </div>
              </div>

              <div className="modal-action mt-6">
                <button
                  className={`btn btn-primary bg-indigo-600 hover:bg-indigo-700 text-white ${saving ? "loading" : ""}`}
                  onClick={handleSave}
                  disabled={saving}
                >
                  {saving ? "Saving..." : editingId ? "Save Changes" : "Add Project"}
                </button>
                <button className="btn btn-ghost" onClick={() => setModalOpen(false)}>
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