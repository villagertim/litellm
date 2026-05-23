"use client";

import useAuthorized from "@/app/(dashboard)/hooks/useAuthorized";
import ModelHubTable from "@/components/AIHub/ModelHubTable";

const ModelHubPage = () => {
  const { accessToken, premiumUser, userRole } = useAuthorized();

  return (
    <ModelHubTable
      accessToken={accessToken}
      publicPage={false}
      premiumUser={premiumUser}
      userRole={userRole}
    />
  );
};

export default ModelHubPage;
