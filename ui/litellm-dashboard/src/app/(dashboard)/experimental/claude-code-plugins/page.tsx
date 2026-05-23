"use client";

import useAuthorized from "@/app/(dashboard)/hooks/useAuthorized";
import ClaudeCodePluginsPanel from "@/components/claude_code_plugins";

const ClaudeCodePluginsPage = () => {
  const { accessToken, userRole } = useAuthorized();

  return (
    <ClaudeCodePluginsPanel accessToken={accessToken} userRole={userRole} />
  );
};

export default ClaudeCodePluginsPage;
