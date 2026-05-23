"use client";

import useAuthorized from "@/app/(dashboard)/hooks/useAuthorized";
import PoliciesPanel from "@/components/policies";

const PoliciesPage = () => {
  const { accessToken, userRole } = useAuthorized();

  return <PoliciesPanel accessToken={accessToken} userRole={userRole} />;
};

export default PoliciesPage;
