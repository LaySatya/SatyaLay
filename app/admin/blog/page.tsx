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

type BlogPost = {
  id?: string;
  title: string;
  slug: string;
  category: string;
  author: string;
  content: string;
  tags: string[];
  published: boolean;
  coverImage?: string;
  order?: number;
  createdAt?: any;
  updatedAt?: any;
};

export default function AdminBlogPostsPage() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

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
  const [errors, setErrors] = useState<{ [k: string]: string }>({});

  // fetch posts
  useEffect(() => {
    loadPosts();
  }, []);

  async function loadPosts() {
    setLoading(true);
    try {
      const q = query(collection(db, "blogPosts"), orderBy("createdAt", "desc"));
      const snap = await getDocs(q);
      const list: BlogPost[] = snap.docs.map((d) => ({ id: d.id, ...(d.data() as BlogPost) }));
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

  const openEdit = (p: BlogPost) => {
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
    const e: { [k: string]: string } = {};
    if (!title.trim()) e.title = "Title is required";
    if (!content.trim()) e.content = "Content is required";
    // optional: check slug pattern
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const generateSlug = (text: string) =>
    text
      .toLowerCase()
      .trim()
      .replace(/\s+/g, "-")
      .replace(/[^\w-]+/g, "");

  const handleSave = async () => {
    if (!validate()) return;
    setSaving(true);

    const slugValue = slug?.trim() ? slug.trim() : generateSlug(title);

    const payload: any = {
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

  const handleDelete = async (id?: string) => {
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

  const fmtDate = (ts: any) => {
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
        <div className="p-6">
          {/* header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold">Blog Posts</h1>
              <p className="text-sm text-gray-500">Manage posts — drafts and published articles</p>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={openAdd}
                className="inline-flex items-center gap-2 bg-cyan-500 hover:bg-cyan-600 text-white px-4 py-2 rounded-lg shadow"
              >
                <PlusIcon className="w-4 h-4" />
                Add Post
              </button>
            </div>
          </div>

          {/* list */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {posts.length === 0 && <div className="text-gray-500">No posts yet.</div>}

            {posts.map((p) => (
              <div key={p.id} className="card bg-base-100 shadow-sm p-4 rounded-lg">
                <div className="flex gap-4">
                  {/* thumbnail */}
                  <div className="w-28 h-20 bg-gray-100 rounded-md overflow-hidden flex items-center justify-center">
                    {p.coverImage ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={p.coverImage} alt={p.title} className="object-cover w-full h-full" />
                    ) : (
                      <div className="text-sm text-gray-400">No Image</div>
                    )}
                  </div>

                  <div className="flex-1">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <h2 className="text-lg font-semibold">{p.title}</h2>
                        <div className="text-sm text-gray-500 mt-1">
                          {p.category} • {p.author || "Unknown author"}
                        </div>
                      </div>

                      <div className="flex flex-col items-end text-xs text-gray-500">
                        <div className="flex items-center gap-1">
                          <CalendarDaysIcon className="w-4 h-4" />
                          <span>{fmtDate(p.createdAt)}</span>
                        </div>
                        <div className="mt-1">
                          Updated: {fmtDate(p.updatedAt)}
                        </div>
                      </div>
                    </div>

                    <p className="text-sm text-gray-600 mt-2 line-clamp-3">{p.content}</p>

                    <div className="mt-3 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {p.tags &&
                          p.tags.slice(0, 5).map((t, i) => (
                            <span
                              key={i}
                              className="text-xs bg-cyan-100 text-cyan-700 px-2 py-0.5 rounded-md"
                            >
                              {t}
                            </span>
                          ))}

                        {p.tags && p.tags.length > 5 && (
                          <span className="text-xs text-gray-400">+{p.tags.length - 5}</span>
                        )}
                      </div>

                      <div className="flex items-center gap-2">
                        <span
                          className={`px-2 py-1 rounded-md text-xs ${
                            p.published ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"
                          }`}
                        >
                          {p.published ? "Published" : "Draft"}
                        </span>

                        <button
                          onClick={() => openEdit(p)}
                          className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-cyan-500 text-white hover:bg-cyan-600"
                        >
                          <PencilSquareIcon className="w-4 h-4" />
                          Edit
                        </button>

                        <button
                          onClick={() => handleDelete(p.id)}
                          className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-red-100 text-red-600 hover:bg-red-200"
                        >
                          <TrashIcon className="w-4 h-4" />
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* modal */}
          {modalOpen && (
            <div className="fixed inset-0 z-40 flex items-center justify-center px-4">
              <div
                className="absolute inset-0 bg-black/40"
                onClick={() => {
                  setModalOpen(false);
                  resetForm();
                }}
              />

              <div className="relative w-full max-w-3xl bg-white rounded-lg shadow-lg z-50 overflow-auto max-h-[90vh]">
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-semibold">
                      {editingId ? "Edit Blog Post" : "Add Blog Post"}
                    </h3>
                    <div className="text-sm text-gray-500">{editingId ? "Editing" : "New"}</div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Title */}
                    <div className="flex flex-col">
                      <label className="text-sm font-medium">Title *</label>
                      <input
                        className={`input input-bordered rounded-md ${errors.title ? "input-error" : ""}`}
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="Post title"
                      />
                      {errors.title && <div className="text-xs text-red-600 mt-1">{errors.title}</div>}
                    </div>

                    {/* Slug */}
                    <div className="flex flex-col">
                      <label className="text-sm font-medium">Slug</label>
                      <input
                        className="input input-bordered rounded-md"
                        value={slug}
                        onChange={(e) => setSlug(e.target.value)}
                        placeholder="Optional: custom url slug"
                      />
                      <div className="text-xs text-gray-400 mt-1">Leave empty to auto-generate</div>
                    </div>

                    {/* Category */}
                    <div className="flex flex-col">
                      <label className="text-sm font-medium">Category</label>
                      <input
                        className="input input-bordered rounded-md"
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                        placeholder="e.g., Tech, Travel"
                      />
                    </div>

                    {/* Author */}
                    <div className="flex flex-col">
                      <label className="text-sm font-medium">Author</label>
                      <input
                        className="input input-bordered rounded-md"
                        value={author}
                        onChange={(e) => setAuthor(e.target.value)}
                        placeholder="Author name"
                      />
                    </div>

                    {/* Cover image */}
                    <div className="md:col-span-2 flex flex-col">
                      <label className="text-sm font-medium">Cover Image URL</label>
                      <input
                        className="input input-bordered rounded-md"
                        value={coverImage}
                        onChange={(e) => setCoverImage(e.target.value)}
                        placeholder="https://..."
                      />
                      <div className="mt-2">
                        {coverImage ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={coverImage} alt="cover" className="w-full max-h-48 object-cover rounded-md" />
                        ) : (
                          <div className="text-sm text-gray-400">No cover image — it will show a placeholder on the public site.</div>
                        )}
                      </div>
                    </div>

                    {/* Tags */}
                    <div className="md:col-span-2 flex flex-col">
                      <label className="text-sm font-medium">Tags (comma separated)</label>
                      <input
                        className="input input-bordered rounded-md"
                        value={tags}
                        onChange={(e) => setTags(e.target.value)}
                        placeholder="react, firebase, tips"
                      />
                    </div>

                    {/* Content */}
                    <div className="md:col-span-2 flex flex-col">
                      <label className="text-sm font-medium">Content *</label>
                      <textarea
                        className={`textarea textarea-bordered w-full h-56 rounded-md ${errors.content ? "border-red-500" : ""}`}
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        placeholder="Write your article here..."
                      />
                      {errors.content && <div className="text-xs text-red-600 mt-1">{errors.content}</div>}
                    </div>

                    {/* Published */}
                    <div className="flex items-center gap-3">
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

                  {/* actions */}
                  <div className="mt-6 flex items-center justify-end gap-3">
                    <button
                      className="px-4 py-2 rounded-md bg-gray-100 hover:bg-gray-200"
                      onClick={() => {
                        setModalOpen(false);
                        resetForm();
                      }}
                    >
                      Cancel
                    </button>

                    <button
                      className="px-4 py-2 rounded-md bg-cyan-500 text-white hover:bg-cyan-600"
                      onClick={handleSave}
                      disabled={saving}
                    >
                      {saving ? "Saving..." : editingId ? "Save Changes" : "Create Post"}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </AdminLayout>
    </ProtectedRoute>
  );
}
