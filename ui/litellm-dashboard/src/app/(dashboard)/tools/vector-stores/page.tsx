"use client";

import useAuthorized from "@/app/(dashboard)/hooks/useAuthorized";
import VectorStoreManagement from "@/components/vector_store_management";

const VectorStoresPage = () => {
  const { accessToken, userId, userRole } = useAuthorized();

  return (
    <VectorStoreManagement
      accessToken={accessToken}
      userID={userId}
      userRole={userRole}
    />
  );
};

export default VectorStoresPage;
