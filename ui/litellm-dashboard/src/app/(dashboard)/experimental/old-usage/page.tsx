"use client";

import useAuthorized from "@/app/(dashboard)/hooks/useAuthorized";
import Usage from "@/components/usage";
import { useState } from "react";

const OldUsagePage = () => {
  const { accessToken, token, userRole, userId, premiumUser } = useAuthorized();
  const [keys, setKeys] = useState<null | any[]>([]);

  return (
    <Usage
      accessToken={accessToken}
      token={token}
      userRole={userRole}
      userID={userId}
      keys={keys}
      premiumUser={premiumUser}
    />
  );
};

export default OldUsagePage;
