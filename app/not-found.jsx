// _not-found/page.tsx
"use client";

import { useSearchParams } from "next/navigation";

export default function NotFoundPage() {
  const searchParams = useSearchParams();

  return (
    <div>
      <h1>404 - Page Not Found</h1>
      <p>Query param: {searchParams.get("example")}</p>
    </div>
  );
}
