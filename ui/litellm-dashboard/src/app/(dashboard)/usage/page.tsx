"use client";

import useAuthorized from "@/app/(dashboard)/hooks/useAuthorized";
import useTeams from "@/app/(dashboard)/hooks/useTeams";
import UsagePageView from "@/components/UsagePage/components/UsagePageView";

const UsagePage = () => {
  const { accessToken, userRole, userId, premiumUser } = useAuthorized();
  const { teams } = useTeams();

  return <UsagePageView teams={teams ?? []} organizations={[]} />;
};

export default UsagePage;
