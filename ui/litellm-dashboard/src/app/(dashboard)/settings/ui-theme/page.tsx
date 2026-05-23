"use client";

import useAuthorized from "@/app/(dashboard)/hooks/useAuthorized";
import UIThemeSettings from "@/components/ui_theme_settings";

const UIThemePage = () => {
  const { userId, userRole, accessToken } = useAuthorized();

  return (
    <UIThemeSettings
      userID={userId}
      userRole={userRole}
      accessToken={accessToken}
    />
  );
};

export default UIThemePage;
