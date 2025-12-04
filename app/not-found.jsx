// _not-found/page.tsx
"use client";

import { useSearchParams } from "next/navigation";

export default function NotFoundPage() {
  const searchParams = useSearchParams();

  return (
    <div className="p-8 text-center">
      <h1 className="text-3xl font-bold">404 - Page Not Found</h1>
      <p>Query: {searchParams.get("example")}</p>
    </div>
  );
}
