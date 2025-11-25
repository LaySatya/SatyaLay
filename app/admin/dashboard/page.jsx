"use client";

import ProtectedRoute from "@/app/admin/components/ProtectedRoute";
import AdminLayout from "../components/AdminLayout";

export default function DashboardPage() {
  return (
    <ProtectedRoute>
      <AdminLayout>
        <h1 className="text-2xl font-bold mb-4">Welcome to the Dashboard</h1>
        <p>Add your dashboard widgets or stats here.</p>
      </AdminLayout>
    </ProtectedRoute>
  );
}
