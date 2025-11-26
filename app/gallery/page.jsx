"use client";

import { useEffect, useState } from "react";
import { db } from "@/app/lib/firebase";
import { collection, getDocs } from "firebase/firestore";
import { PhotoIcon } from "@heroicons/react/24/outline";
import MainLayout from "../components/MainLayout";

export default function Gallery() {
  const [gallery, setGallery] = useState([]);
  const [selectedPhoto, setSelectedPhoto] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchGallery = async () => {
      try {
        const galSnap = await getDocs(collection(db, "gallery"));
        setGallery(galSnap.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
      } catch (error) {
        console.error("Error fetching gallery:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchGallery();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <span className="loading loading-spinner loading-lg"></span>
      </div>
    );
  }

  return (
    <MainLayout>
    <div className="min-h-screen py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-12">
          <h1 className="text-5xl font-bold mb-4 flex items-center gap-3">
            <PhotoIcon className="h-12 w-12" />
            Gallery
          </h1>
          <div className="h-1 w-20 bg-primary rounded-full"></div>
          <p className="text-lg opacity-75 mt-6">
            Moments and memories captured in time.
          </p>
        </div>

        {gallery.length === 0 ? (
          <div className="card border border-base-300">
            <div className="card-body text-center py-16">
              <p className="text-xl opacity-75">No photos yet. Check back soon!</p>
            </div>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {gallery.map((photo) => (
                <div
                  key={photo.id}
                  className="card border border-base-300 overflow-hidden hover:shadow-xl transition-all cursor-pointer transform hover:scale-105"
                  onClick={() => setSelectedPhoto(photo)}
                >
                  {photo.imageUrl && (
                    <figure className="h-48 overflow-hidden bg-base-300">
                      <img
                        src={photo.imageUrl}
                        alt={photo.title || "Gallery photo"}
                        className="w-full h-full object-cover hover:scale-110 transition-transform duration-300"
                      />
                    </figure>
                  )}
                  {photo.title && (
                    <div className="card-body p-3">
                      <p className="text-sm font-semibold line-clamp-1">{photo.title}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Photo Modal */}
            {selectedPhoto && (
              <div className="modal modal-open">
                <div className="modal-box w-11/12 max-w-4xl">
                  {selectedPhoto.imageUrl && (
                    <figure className="mb-4">
                      <img
                        src={selectedPhoto.imageUrl}
                        alt={selectedPhoto.title}
                        className="w-full rounded-lg"
                      />
                    </figure>
                  )}
                  {selectedPhoto.title && (
                    <h3 className="font-bold text-2xl mb-2">{selectedPhoto.title}</h3>
                  )}
                  {selectedPhoto.description && (
                    <p className="opacity-75">{selectedPhoto.description}</p>
                  )}
                  <div className="modal-action">
                    <button
                      className="btn"
                      onClick={() => setSelectedPhoto(null)}
                    >
                      Close
                    </button>
                  </div>
                </div>
                <div
                  className="modal-backdrop"
                  onClick={() => setSelectedPhoto(null)}
                ></div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
    </MainLayout>
  );
}