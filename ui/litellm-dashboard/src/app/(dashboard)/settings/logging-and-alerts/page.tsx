"use client";

import useAuthorized from "@/app/(dashboard)/hooks/useAuthorized";
import Settings from "@/components/settings";

const LoggingAndAlertsPage = () => {
  const { accessToken, userRole, userId, premiumUser } = useAuthorized();

  return (
    <Settings
      accessToken={accessToken}
      userRole={userRole}
      userID={userId}
      premiumUser={premiumUser}
    />
  );
};

export default LoggingAndAlertsPage;
