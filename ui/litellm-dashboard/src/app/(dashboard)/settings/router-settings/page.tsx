"use client";

import useAuthorized from "@/app/(dashboard)/hooks/useAuthorized";
import GeneralSettings from "@/components/general_settings";

const RouterSettingsPage = () => {
  const { accessToken, userRole, userId } = useAuthorized();

  return (
    <GeneralSettings
      accessToken={accessToken}
      userRole={userRole}
      userID={userId}
      modelData={{}}
    />
  );
};

export default RouterSettingsPage;
