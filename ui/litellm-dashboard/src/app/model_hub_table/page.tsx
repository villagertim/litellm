"use client";
import ModelHubTable from "@/components/AIHub/ModelHubTable";
import { useSearchParams } from "next/navigation";
import React, { Suspense, useEffect, useState } from "react";

function PublicModelHubTableContent() {
  const searchParams = useSearchParams()!;
  const key = searchParams.get("key");
  const [accessToken, setAccessToken] = useState<string | null>(null);
  console.log("PublicModelHubTable accessToken:", accessToken);

  useEffect(() => {
    if (!key) {
      return;
    }
    setAccessToken(key);
  }, [key]);

  return (
    <ModelHubTable
      accessToken={accessToken}
      publicPage={true}
      premiumUser={false}
      userRole={null}
    />
  );
}

export default function PublicModelHubTable() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-screen">
          Loading...
        </div>
      }
    >
      <PublicModelHubTableContent />
    </Suspense>
  );
}
