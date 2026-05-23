"use client";

import useAuthorized from "@/app/(dashboard)/hooks/useAuthorized";
import GuardrailsPanel from "@/components/guardrails";

const GuardrailsPage = () => {
  const { accessToken } = useAuthorized();

  return <GuardrailsPanel accessToken={accessToken} />;
};

export default GuardrailsPage;
