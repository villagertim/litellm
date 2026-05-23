"use client";

import useAuthorized from "@/app/(dashboard)/hooks/useAuthorized";
import CacheDashboard from "@/components/cache_dashboard";

const CachingPage = () => {
  const { token, accessToken, userRole, userId, premiumUser } = useAuthorized();

  return (
    <CacheDashboard
      accessToken={accessToken}
      token={token}
      userRole={userRole}
      userID={userId}
      premiumUser={premiumUser}
    />
  );
};

export default CachingPage;
