"use client";

import useAuthorized from "@/app/(dashboard)/hooks/useAuthorized";
import SpendLogsTable from "@/components/view_logs";

const LogsPage = () => {
  const { accessToken, token, userRole, userId, premiumUser } = useAuthorized();

  return (
    <SpendLogsTable
      accessToken={accessToken}
      token={token}
      userRole={userRole}
      userID={userId}
      premiumUser={premiumUser}
    />
  );
};

export default LogsPage;
