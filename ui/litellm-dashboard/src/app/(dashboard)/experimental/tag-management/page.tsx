"use client";

import useAuthorized from "@/app/(dashboard)/hooks/useAuthorized";
import TagManagement from "@/components/tag_management";

const TagManagementPage = () => {
  const { accessToken, userId, userRole } = useAuthorized();

  return (
    <TagManagement
      accessToken={accessToken}
      userID={userId}
      userRole={userRole}
    />
  );
};

export default TagManagementPage;
