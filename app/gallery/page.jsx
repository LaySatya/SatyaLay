"use client";

import { useEffect, useState } from "react";
import { db } from "@/app/lib/firebase";
import { collection, getDocs } from "firebase/firestore";
import { PhotoIcon } from "@heroicons/react/24/outline";
import Image from "next/image";
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

  return (
    <MainLayout>
      <div className="min-h-screen py-4 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="mb-8">
            <div className="mb-8">
              <h1 className="text-4xl font-bold mb-2 flex gap-4">
                <PhotoIcon className="w-10 h-10 text-cyan-500" />
                Project
              </h1>
              <hr className="border-t border-2  border-cyan-500 grow w-10" />
              <p className="text-lg opacity-75 mt-4">
              A collection of memorable moments and events.
            </p>
            </div>
           
          </div>

          {loading ? (
            <p className="text-center text-lg opacity-70">Loading...</p>
          ) : gallery.length === 0 ? (
            <div className="card border border-base-300">
              <div className="card-body text-center py-16">
                <p className="text-xl opacity-75">
                  No photos yet. Check back soon!
                </p>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {gallery.map((photo) => (
                <article
                  key={photo.id}
                  className="card card-xl border border-base-300 p-0 overflow-hidden flex flex-col shadow-sm transition group hover:shadow-lg cursor-pointer"
                  onClick={() => setSelectedPhoto(photo)}
                >
                  <div className="relative w-full h-64 bg-base-300">
                    <Image
                      src={photo.imageUrl}
                      alt={photo.title}
                      fill
                      className="object-cover w-full h-full transition group-hover:scale-105"
                      style={{ objectFit: "cover" }}
                    />
                    <div className="absolute bottom-0 left-0 w-full bg-black/40 text-white p-4 text-lg font-mono">
                      {photo.title}
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}

          {/* Image Preview Modal */}
          {selectedPhoto && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
              <div className="bg-base-100 rounded-xl p-4 md:p-8 max-w-3xl w-full shadow-xl relative flex flex-col items-center">
                <button
                  className="absolute top-4 right-4 text-xl btn btn-sm btn-circle"
                  onClick={() => setSelectedPhoto(null)}
                >
                  ✕
                </button>

                <div className="relative w-full h-[50vh] max-h-[70vh] flex items-center justify-center">
                  <Image
                    src={selectedPhoto.imageUrl}
                    alt={selectedPhoto.title}
                    fill
                    className="object-contain rounded max-h-full"
                    style={{ objectFit: "contain" }}
                  />
                </div>

                <h3 className="font-bold text-2xl mt-6 text-center">
                  {selectedPhoto.title}
                </h3>
              </div>
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  );
}
