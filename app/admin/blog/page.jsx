"use client";

import { useEffect, useState } from "react";
import AdminLayout from "../components/AdminLayout";
import ProtectedRoute from "../components/ProtectedRoute";

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

// heroicons
import {
  PencilSquareIcon,
  TrashIcon,
  PlusIcon,
  CalendarDaysIcon,
} from "@heroicons/react/24/outline";
import AdminLoading from "../components/AdminLoading";

export default function AdminBlogPostsPage() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);

  // form fields
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [category, setCategory] = useState("");
  const [author, setAuthor] = useState("");
  const [content, setContent] = useState("");
  const [tags, setTags] = useState("");
  const [published, setPublished] = useState(false);
  const [coverImage, setCoverImage] = useState("");

  // validation
  const [errors, setErrors] = useState({});

  // fetch posts
  useEffect(() => {
    loadPosts();
  }, []);

  async function loadPosts() {
    setLoading(true);
    try {
      const q = query(collection(db, "blogPosts"), orderBy("createdAt", "desc"));
      const snap = await getDocs(q);
      const list = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      setPosts(list);
    } catch (e) {
      console.error("Failed to fetch posts:", e);
    } finally {
      setTimeout(() => setLoading(false), 300);
    }
  }

  const resetForm = () => {
    setTitle("");
    setSlug("");
    setCategory("");
    setAuthor("");
    setContent("");
    setTags("");
    setPublished(false);
    setCoverImage("");
    setEditingId(null);
    setErrors({});
  };

  const openAdd = () => {
    resetForm();
    setModalOpen(true);
  };

  const openEdit = (p) => {
    setEditingId(p.id || null);
    setTitle(p.title);
    setSlug(p.slug);
    setCategory(p.category);
    setAuthor(p.author);
    setContent(p.content);
    setTags((p.tags || []).join(", "));
    setPublished(!!p.published);
    setCoverImage(p.coverImage || "");
    setErrors({});
    setModalOpen(true);
  };

  const validate = () => {
    const e = {};
    if (!title.trim()) e.title = "Title is required";
    if (!content.trim()) e.content = "Content is required";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const generateSlug = (text) =>
    text
      .toLowerCase()
      .trim()
      .replace(/\s+/g, "-")
      .replace(/[^\w-]+/g, "");

  const handleSave = async () => {
    if (!validate()) return;
    setSaving(true);

    const slugValue = slug?.trim() ? slug.trim() : generateSlug(title);

    const payload = {
      title: title.trim(),
      slug: slugValue,
      category: category.trim(),
      author: author.trim(),
      content,
      tags: tags
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean),
      published: !!published,
      coverImage: coverImage.trim() || null,
      updatedAt: serverTimestamp(),
    };

    try {
      if (editingId) {
        await updateDoc(doc(db, "blogPosts", editingId), payload);
      } else {
        await addDoc(collection(db, "blogPosts"), {
          ...payload,
          createdAt: serverTimestamp(),
          order: posts.length,
        });
      }
      setModalOpen(false);
      resetForm();
      loadPosts();
    } catch (err) {
      console.error("Save failed:", err);
      alert("Save failed — check console for details.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!id) return;
    if (!confirm("Delete this post?")) return;
    try {
      await deleteDoc(doc(db, "blogPosts", id));
      loadPosts();
    } catch (err) {
      console.error("Delete failed:", err);
      alert("Delete failed — check console.");
    }
  };

  const fmtDate = (ts) => {
    try {
      if (!ts) return "—";
      const d = ts.toDate ? ts.toDate() : new Date(ts);
      return d.toLocaleString();
    } catch {
      return "—";
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
  <div className="p-0 md:p-8 min-h-screen">
    {/* header */}
    <div className="flex justify-between items-center mb-6">
      <h1 className="text-2xl font-bold">Blog Posts</h1>
      <button className="btn bg-cyan-500" onClick={openAdd}>
        <PlusIcon className="w-5 h-5" />
        Add Post
      </button>
    </div>

    {/* list */}
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
      {posts.length === 0 && (
        <div className="col-span-full text-center py-12">No posts yet.</div>
      )}

      {posts.map((p) => (
        <div key={p.id} className="card p-6 shadow-md mb-6 flex flex-col gap-3 relative border border-cyan-500">
          <h2 className="text-xl font-bold mb-2">{p.title}</h2>
          <p className="italic mb-2">{p.category || "Uncategorized"} • {p.author || "Unknown author"}</p>
          <p className="mb-2">{p.content}</p>
          <div className="flex items-center gap-2 text-xs mb-2">
            <CalendarDaysIcon className="w-4 h-4" />
            <span>{fmtDate(p.createdAt)}</span>
            <span className="ml-2">Updated: {fmtDate(p.updatedAt)}</span>
          </div>
          {p.coverImage && (
            <div className="mb-2">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={p.coverImage} alt={p.title} className="object-cover w-full max-h-32 rounded-lg" />
            </div>
          )}
          <div className="flex flex-wrap gap-2 mb-2">
            {p.tags && p.tags.slice(0, 5).map((t, i) => (
              <span key={i} className="badge badge-outline">{t}</span>
            ))}
            {p.tags && p.tags.length > 5 && (
              <span className="badge badge-outline">+{p.tags.length - 5}</span>
            )}
          </div>
          <div className="flex items-center gap-2 mt-2">
            <span className={`badge ${p.published ? "badge-success" : "badge-warning"}`}>{p.published ? "Published" : "Draft"}</span>
            <button
              onClick={() => openEdit(p)}
              title="Edit"
              className="btn btn-primary btn-sm"
            >
              <PencilSquareIcon className="w-4 h-4" />
              Edit
            </button>
            <button
              onClick={() => handleDelete(p.id)}
              title="Delete"
              className="btn btn-error btn-sm"
            >
              <TrashIcon className="w-4 h-4" />
              Delete
            </button>
          </div>
        </div>
      ))}
    </div>

    {/* modal for add/edit */}
    {modalOpen && (
      <div className="modal modal-open">
        <div className="modal-box relative max-w-4xl w-full mx-4 sm:mx-auto">
          <h3 className="text-2xl font-bold mb-6">{editingId ? "Edit Blog Post" : "Add Blog Post"}</h3>
          <button
            className="btn btn-sm btn-circle absolute right-2 top-2"
            onClick={() => {
              setModalOpen(false);
              resetForm();
            }}
          >
            ✕
          </button>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="label">Title *</label>
              <input
                className={`input input-bordered w-full ${errors.title ? "input-error" : ""}`}
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Post title"
              />
              {errors.title && <div className="text-xs text-red-600 mt-1">{errors.title}</div>}
            </div>
            <div>
              <label className="label">Slug</label>
              <input
                className="input input-bordered w-full"
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                placeholder="Optional: custom url slug"
              />
              <div className="text-xs mt-1">Leave empty to auto-generate</div>
            </div>
            <div>
              <label className="label">Category</label>
              <input
                className="input input-bordered w-full"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                placeholder="e.g., Tech, Travel"
              />
            </div>
            <div>
              <label className="label">Author</label>
              <input
                className="input input-bordered w-full"
                value={author}
                onChange={(e) => setAuthor(e.target.value)}
                placeholder="Author name"
              />
            </div>
            <div className="md:col-span-2">
              <label className="label">Cover Image URL</label>
              <input
                className="input input-bordered w-full"
                value={coverImage}
                onChange={(e) => setCoverImage(e.target.value)}
                placeholder="https://..."
              />
              <div className="mt-2">
                {coverImage ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={coverImage} alt="cover" className="w-full max-h-48 object-cover rounded-lg" />
                ) : (
                  <div className="text-sm">No cover image — it will show a placeholder on the public site.</div>
                )}
              </div>
            </div>
            <div className="md:col-span-2">
              <label className="label">Tags (comma separated)</label>
              <input
                className="input input-bordered w-full"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                placeholder="react, firebase, tips"
              />
            </div>
            <div className="md:col-span-2">
              <label className="label">Content *</label>
              <textarea
                className={`textarea textarea-bordered w-full h-32 ${errors.content ? "border-red-500" : ""}`}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Write your article here..."
              />
              {errors.content && <div className="text-xs text-red-600 mt-1">{errors.content}</div>}
            </div>
            <div className="flex items-center gap-3 mt-2">
              <input
                id="published"
                type="checkbox"
                checked={published}
                onChange={() => setPublished(!published)}
                className="checkbox checkbox-primary"
              />
              <label htmlFor="published" className="font-medium">Published</label>
            </div>
          </div>
          <div className="modal-action mt-6">
            <button
              onClick={() => {
                setModalOpen(false);
                resetForm();
              }}
              className="btn"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className={`btn btn-primary ${saving ? "loading" : ""}`}
            >
              {saving ? "Saving..." : editingId ? "Save Changes" : "Create Post"}
            </button>
          </div>
        </div>
      </div>
    )}
        </div>
      </AdminLayout>
    </ProtectedRoute>
  );
}
