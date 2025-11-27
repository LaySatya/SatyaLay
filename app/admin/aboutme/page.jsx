"use client";

import AdminLayout from "../components/AdminLayout";
import ProtectedRoute from "../components/ProtectedRoute";
import { useState, useEffect } from "react";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "@/app/lib/firebase";
import AdminLoading from "../components/AdminLoading";

export default function AdminAboutMePage() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);

  // Form fields
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [position, setPosition] = useState("");
  const [description, setDescription] = useState("");
  const [resumeUrl, setResumeUrl] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [socialLinks, setSocialLinks] = useState({
    github: "",
    linkedin: "",
    facebook: "",
    telegram: "",
  });

  // Fetch profile data from Firestore
  useEffect(() => {
    async function fetchProfile() {
      try {
        const docRef = doc(db, "aboutMe", "main");
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const data = docSnap.data();
          setProfile(data);
          setFirstName(data.firstName || "");
          setLastName(data.lastName || "");
          setPosition(data.position || "");
          setDescription(data.description || "");
          setResumeUrl(data.resumeUrl || "");
          setImageUrl(data.imageUrl || "");
          setSocialLinks(data.socialLinks || {
            github: "",
            linkedin: "",
            facebook: "",
            telegram: "",
          });
        } else {
          const defaultData = {
            firstName: "",
            lastName: "",
            position: "",
            description: "",
            resumeUrl: "",
            imageUrl: "",
            socialLinks: {
              github: "",
              linkedin: "",
              facebook: "",
              telegram: "",
            },
            status: true,
          };
          await setDoc(docRef, defaultData);
          setProfile(defaultData);
        }
      } catch (error) {
        console.error("Error fetching About Me:", error);
      } finally {
        // let loading delay for better UX
        setTimeout(() => setLoading(false), 1000);
      }
    }
    fetchProfile();
  }, []);

  const handleSave = async () => {
    if (!firstName && !lastName && !position && !description) {
      alert("Please fill at least one field before saving.");
      return;
    }

    setSaving(true);
    const docRef = doc(db, "aboutMe", "main");

    try {
      await setDoc(
        docRef,
        {
          firstName,
          lastName,
          position,
          description,
          resumeUrl,
          imageUrl,
          socialLinks,
          status: true,
        },
        { merge: true }
      );

      setProfile({
        firstName,
        lastName,
        position,
        description,
        resumeUrl,
        imageUrl,
        socialLinks,
        status: true,
      });

      setModalOpen(false);
    } catch (error) {
      console.error("Error updating About Me:", error);
    } finally {
      setSaving(false);
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
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">About Me</h1>
          <button className="btn btn-info" onClick={() => setModalOpen(true)}>
            Edit / Add Info
          </button>
        </div>

        {/* Display current info */}
        {profile && (
          <div className="card p-6 shadow-md mb-6">
            <div className="flex flex-col md:flex-row gap-6">
              {profile.imageUrl && (
                <div className="md:w-1/3">
                  <img 
                    src={profile.imageUrl} 
                    alt="Profile" 
                    className="w-full h-auto rounded-lg object-cover"
                  />
                </div>
              )}
              <div className="md:flex-1">
                <h2 className="text-2xl font-bold mb-2">
                  {profile.firstName || "First Name"} {profile.lastName || "Last Name"}
                </h2>
                <p className="italic mb-2">{profile.position || "Your Position"}</p>
                <p className="mb-2">{profile.description || "Add your bio here."}</p>

                {profile.resumeUrl && (
                  <a
                    href={profile.resumeUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="link link-primary"
                  >
                    View Resume
                  </a>
                )}

                <div className="mt-4 flex gap-4 flex-wrap">
                  {profile.socialLinks?.github && (
                    <a href={profile.socialLinks.github} target="_blank" rel="noopener noreferrer" className="btn btn-outline btn-sm">GitHub</a>
                  )}
                  {profile.socialLinks?.linkedin && (
                    <a href={profile.socialLinks.linkedin} target="_blank" rel="noopener noreferrer" className="btn btn-outline btn-sm">LinkedIn</a>
                  )}
                  {profile.socialLinks?.facebook && (
                    <a href={profile.socialLinks.facebook} target="_blank" rel="noopener noreferrer" className="btn btn-outline btn-sm">Facebook</a>
                  )}
                  {profile.socialLinks?.telegram && (
                    <a href={profile.socialLinks.telegram} target="_blank" rel="noopener noreferrer" className="btn btn-outline btn-sm">Telegram</a>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Modal for edit/add */}
        {modalOpen && (
          <div className="modal modal-open">
            <div className="modal-box relative max-w-4xl w-full mx-4 sm:mx-auto">
              <h3 className="text-2xl font-bold mb-6">Edit About Me</h3>
              <button
                className="btn btn-sm btn-circle absolute right-2 top-2"
                onClick={() => setModalOpen(false)}
              >
                ✕
              </button>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="label">First Name</label>
                  <input
                    type="text"
                    placeholder="Enter your first name"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className="input input-bordered w-full"
                  />
                </div>
                <div>
                  <label className="label">Last Name</label>
                  <input
                    type="text"
                    placeholder="Enter your last name"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    className="input input-bordered w-full"
                  />
                </div>
                <div>
                  <label className="label">Position</label>
                  <input
                    type="text"
                    placeholder="Enter your position"
                    value={position}
                    onChange={(e) => setPosition(e.target.value)}
                    className="input input-bordered w-full"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="label">Description / Bio</label>
                  <textarea
                    placeholder="Enter your description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="textarea textarea-bordered w-full"
                    rows={4}
                  />
                </div>
                <div>
                  <label className="label">Resume URL</label>
                  <input
                    type="text"
                    placeholder="Enter your resume URL"
                    value={resumeUrl}
                    onChange={(e) => setResumeUrl(e.target.value)}
                    className="input input-bordered w-full"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="label">Profile Image URL</label>
                  <input
                    type="text"
                    placeholder="Enter your profile image URL"
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    className="input input-bordered w-full"
                  />
                  {imageUrl && (
                    <div className="mt-4">
                      <p className="label">Preview:</p>
                      <img 
                        src={imageUrl} 
                        alt="Profile Preview" 
                        className="w-40 h-40 rounded-lg object-cover"
                      />
                    </div>
                  )}
                </div>
                <div>
                  <label className="label">GitHub</label>
                  <input
                    type="text"
                    placeholder="Enter your GitHub URL"
                    value={socialLinks.github}
                    onChange={(e) => setSocialLinks({ ...socialLinks, github: e.target.value })}
                    className="input input-bordered w-full"
                  />
                </div>
                <div>
                  <label className="label">LinkedIn</label>
                  <input
                    type="text"
                    placeholder="Enter your LinkedIn URL"
                    value={socialLinks.linkedin}
                    onChange={(e) => setSocialLinks({ ...socialLinks, linkedin: e.target.value })}
                    className="input input-bordered w-full"
                  />
                </div>
                <div>
                  <label className="label">Facebook</label>
                  <input
                    type="text"
                    placeholder="Enter your Facebook URL"
                    value={socialLinks.facebook}
                    onChange={(e) => setSocialLinks({ ...socialLinks, facebook: e.target.value })}
                    className="input input-bordered w-full"
                  />
                </div>
                <div>
                  <label className="label">Telegram</label>
                  <input
                    type="text"
                    placeholder="Enter your Telegram URL"
                    value={socialLinks.telegram}
                    onChange={(e) => setSocialLinks({ ...socialLinks, telegram: e.target.value })}
                    className="input input-bordered w-full"
                  />
                </div>
              </div>

              <div className="modal-action mt-6">
                <button
                  onClick={handleSave}
                  className={`btn btn-primary ${saving ? "loading" : ""}`}
                >
                  {saving ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </div>
          </div>
        )}
      </AdminLayout>
    </ProtectedRoute>
  );
}
