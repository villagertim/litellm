"use client";

import useAuthorized from "@/app/(dashboard)/hooks/useAuthorized";
import { MCPServers } from "@/components/mcp_tools";

const MCPServersPage = () => {
  const { accessToken, userRole, userId } = useAuthorized();

  return (
    <MCPServers accessToken={accessToken} userRole={userRole} userID={userId} />
  );
};

export default MCPServersPage;
