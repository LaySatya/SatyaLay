"use client";
import React from "react";
import Link from "next/link";
import MainLayout from "./components/MainLayout";
import { usePathname } from "next/navigation";

export default function NotFound() {
   

  return (
    <MainLayout>
      <div className="flex flex-col items-center justify-center h-full text-center">
        <h1 className="text-6xl font-bold text-cyan-500 mb-4">404</h1>
        <h2 className="text-2xl font-semibold mb-2">Page Not Found</h2>
        <p className="mb-6 text-base-content opacity-70">Sorry, the page you are looking for does not exist.</p>
        <Link href="/" className="btn btn-primary">Go Home</Link>
      </div>
    </MainLayout>
  );
}
