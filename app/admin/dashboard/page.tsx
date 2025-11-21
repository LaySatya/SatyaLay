"use client";
import ProtectedRoute from "@/app/components/ProtectedRoute";
import { auth } from "@/app/lib/firebase";
import { signOut } from "firebase/auth";

export default function AdminDashboardPage() {
    const handleLogout = async () => {
        await signOut(auth);
    }
    return (
        <ProtectedRoute>
            <div>Admin Dashboard</div>
             <button onClick={handleLogout}>
                Logout
            </button>
        </ProtectedRoute>
    );
}