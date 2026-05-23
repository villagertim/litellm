"use client";

import useAuthorized from "@/app/(dashboard)/hooks/useAuthorized";
import PromptsPanel from "@/components/prompts";

const PromptsPage = () => {
  const { accessToken } = useAuthorized();

  return <PromptsPanel accessToken={accessToken} />;
};

export default PromptsPage;
